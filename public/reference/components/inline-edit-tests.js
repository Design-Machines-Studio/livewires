import { createInlineEditor } from '/dist/inline-edit.js';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const run = document.querySelector('#run');
const results = document.querySelector('#results');
const fixtures = document.querySelector('#fixtures');
let serial = 0;
function make(parent = fixtures, compact = false) {
  const id = `check-${++serial}`;
  const root = document.createElement('section');
  root.dataset.inlineEdit = '';
  root.dataset.contextId = 'opaque-context';
  root.innerHTML = `<h2 data-inline-edit-value>Original</h2><span data-unrelated>Before</span>
    <details data-inline-edit-panel><summary data-inline-edit-trigger>Edit title</summary>
    <form data-inline-edit-form><label for="${id}">Title</label>
    <input id="${id}" data-inline-edit-input type="text" value="Original" aria-describedby="${id}-hint">
    <p id="${id}-hint">Hint</p><p id="${id}-error" data-inline-edit-error role="alert"></p>
    <button data-inline-edit-save type="submit">Save</button><button class="button button--ghost" data-inline-edit-cancel type="button">Cancel</button>
    </form></details><p data-inline-edit-status role="status" aria-live="polite" aria-atomic="true"></p>`;
  if (compact) {
    root.dataset.inlineEdit = 'compact';
    const panel = root.querySelector('details');
    const form = root.querySelector('form');
    const replacement = document.createElement('div');
    replacement.id = `${id}-panel`; replacement.dataset.inlineEditPanel = '';
    const link = document.createElement('a');
    link.className = 'button button--small button--ghost button--accent';
    link.href = `#${replacement.id}`; link.dataset.inlineEditTrigger = ''; link.textContent = 'Edit title';
    replacement.append(form); panel.replaceWith(link, replacement);
  }
  parent.append(root);
  const editor = createInlineEditor({ root });
  const input = root.querySelector('input');
  const trigger = root.querySelector('[data-inline-edit-trigger]');
  const events = [];
  for (const type of ['request', 'commit', 'cancel']) root.addEventListener(`lw-inline-edit-${type}`, e => events.push({ type, ...e.detail }));
  return { root, editor, input, trigger, events,
    type(value) { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); },
    key(key, extra = {}) { input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra })); },
    result(outcome, extra = {}) { return { ...events.findLast(e => e.type === 'commit'), outcome, ...extra }; },
  };
}
run.addEventListener('click', async () => {
  run.disabled = true;
  results.replaceChildren();
  fixtures.replaceChildren();
  const owners = [];
  let passed = 0;
  const add = (parent, compact) => { const f = make(parent, compact); owners.push(f.editor); return f; };
  function check(condition, label) {
    if (!condition) throw new Error(label);
    const li = document.createElement('li'); li.textContent = `PASS — ${label}`; results.append(li); passed++;
  }
  try {
    const a = add(); const b = add();
    a.trigger.focus();
    a.trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    check(a.editor.state.phase === 'editing' && document.activeElement === a.input, 'keyboard entry focuses the labeled input');
    a.key('Enter', { repeat: true });
    check(a.events.length === 1, 'held Enter cannot commit after entry');
    a.type('Draft'); a.input.setSelectionRange(1, 4, 'backward');
    a.root.querySelector('[data-unrelated]').replaceWith(document.createTextNode('Unrelated patch'));
    a.editor.updateConfirmed('External value');
    await tick();
    check(document.activeElement === a.input && a.input.value === 'Draft' && a.input.selectionStart === 1 && a.input.selectionEnd === 4 && a.input.selectionDirection === 'backward', 'unrelated update preserves draft, focused node and selection');
    b.trigger.focus(); await tick();
    check(a.editor.state.phase === 'editing' && a.events.filter(e => e.type === 'commit').length === 0, 'blur retains the draft without saving');
    b.trigger.click(); b.type('Independent');
    check(b.editor.state.phase === 'editing' && a.editor.state.draft === 'Draft', 'pointer entry opens an independent second editor');
    a.input.focus(); a.key('Escape'); await tick();
    check(a.editor.state.phase === 'confirmed' && document.activeElement === a.trigger && a.events.filter(e => e.type === 'commit').length === 0, 'Escape returns focus without a blur save');
    a.editor.request(); a.key('Enter');
    check(a.events.at(-1).type === 'cancel' && a.events.at(-1).reason === 'unchanged' && a.editor.state.message === 'No changes to save.', 'unchanged Enter emits cancel and no commit');
    a.editor.request(); a.type('Entered');
    a.input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    a.key('Enter', { isComposing: true });
    a.key('Escape');
    a.root.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    check(a.editor.state.phase === 'editing', 'simulated composition blocks Enter, Escape and form commit');
    a.input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    a.key('Enter');
    check(a.editor.state.phase === 'editing', 'composition-end confirmation cannot also save');
    await tick(); a.key('Enter'); a.key('Enter', { repeat: true });
    check(a.editor.state.phase === 'pending' && a.input.readOnly && a.events.filter(e => e.type === 'commit').length === 1, 'Enter after composition creates exactly one pending attempt');
    const first = a.result('confirmed', { value: 'Old reply' });
    a.editor.applyResult(a.result('unknown'));
    check(a.editor.state.phase === 'unknown' && a.editor.state.confirmed !== 'Entered', 'request completion remains uncertain, never saved');
    b.input.focus();
    a.editor.applyResult(a.result('rejected', { message: 'Keep this draft.' }));
    check(a.input.value === 'Entered' && !a.input.readOnly && a.input.getAttribute('aria-invalid') === 'true' && a.input.getAttribute('aria-describedby').includes('error') && document.activeElement === b.input, 'rejection retains value, accessible error and outside focus');
    a.type('Corrected'); a.input.focus(); a.input.setSelectionRange(2, 5);
    a.editor.commit();
    check(!a.editor.applyResult(first) && a.editor.state.phase === 'pending', 'late old-attempt confirmation is ignored');
    a.editor.applyResult(a.result('confirmed', { value: 'Application value' }));
    check(a.editor.state.confirmed === 'Application value' && document.activeElement === a.trigger, 'matching confirmation updates the value and returns local focus');
    b.editor.commit(); const foreign = b.result('confirmed', { value: 'B value' });
    a.editor.request(); a.type('New draft'); a.editor.commit();
    check(!a.editor.applyResult(foreign), 'foreign editor results cannot settle this editor');
    const cancelled = a.result('confirmed', { value: 'Cancelled late response' });
    a.editor.cancel();
    check(!a.editor.applyResult(cancelled), 'cancel while pending invalidates late results without a rollback claim');
    b.trigger.focus(); b.editor.applyResult(foreign);
    check(b.editor.state.phase === 'confirmed', 'second editor settles independently');
    const removed = add(); removed.editor.request(); removed.root.remove();
    check(!removed.editor.commit() && removed.editor.state.phase === 'disposed', 'removal while editing disposes before the observer callback');
    const pending = add(); pending.editor.request(); pending.type('Pending'); pending.editor.commit();
    const late = pending.result('confirmed', { value: 'Late' }); pending.root.remove();
    check(!pending.editor.applyResult(late) && pending.editor.state.phase === 'disposed', 'removal while pending rejects delayed results');
    const replaced = add(); replaced.editor.request(); replaced.input.replaceWith(replaced.input.cloneNode(true)); await tick();
    check(replaced.editor.state.phase === 'disposed', 'replacing the focused-input boundary disposes explicitly');
    const moved = add(); moved.editor.request(); moved.type('Kept');
    fixtures.append(moved.root); await tick();
    check(moved.editor.state.phase === 'editing' && moved.editor.state.draft === 'Kept', 'a same-batch move keeps editor state');
    const shadowHost = document.createElement('div'); fixtures.append(shadowHost);
    const shadow = shadowHost.attachShadow({ mode: 'open' }); const nested = add(shadow);
    nested.editor.request(); shadowHost.remove(); await tick();
    check(nested.editor.state.phase === 'disposed', 'removing a containing shadow host cleans lifecycle listeners');
    const compact = add(fixtures, true); const compactB = add(fixtures, true);
    compact.trigger.focus(); compact.trigger.click();
    check(compact.editor.state.phase === 'editing' && compact.trigger.hidden && compact.root.querySelector('[data-inline-edit-value]').hidden && !compact.root.querySelector('[data-inline-edit-panel]').hidden && document.activeElement === compact.input, 'compact pointer entry replaces value and link with the focused field');
    compact.type('Compact draft'); compact.input.setSelectionRange(2, 8, 'backward');
    compact.editor.updateConfirmed('External'); await tick();
    check(compact.input.value === 'Compact draft' && compact.input.selectionStart === 2 && compact.input.selectionEnd === 8 && compact.input.selectionDirection === 'backward', 'compact external update retains draft and selection');
    compactB.trigger.focus(); compactB.trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2', bubbles: true, cancelable: true }));
    check(compactB.editor.state.phase === 'editing' && compact.editor.state.phase === 'editing', 'compact keyboard entry and blur keep independent drafts');
    compact.input.focus(); compact.key('Enter'); compact.editor.applyResult(compact.result('rejected', { message: 'Try again.' }));
    check(compact.input.value === 'Compact draft' && compact.input.getAttribute('aria-invalid') === 'true', 'compact rejection retains the draft and accessible error');
    compact.type('Recovered'); compact.key('Enter'); const compactLate = compact.result('confirmed', { value: 'Recovered' });
    compact.editor.applyResult(compactLate);
    check(compact.editor.state.phase === 'confirmed' && !compact.trigger.hidden && compact.root.querySelector('[data-inline-edit-panel]').hidden && document.activeElement === compact.trigger, 'compact confirmation restores value and link before returning focus');
    compact.trigger.click(); compact.key('Enter');
    check(compact.events.at(-1).reason === 'unchanged' && document.activeElement === compact.trigger, 'compact unchanged save restores link focus without a request');
    compact.trigger.click(); compact.type('Cancelled'); compact.key('Escape');
    check(compact.editor.state.phase === 'confirmed' && document.activeElement === compact.trigger && !compact.editor.applyResult(compactLate), 'compact Escape restores link focus and ignores a late response');
    compactB.type('Pending'); compactB.editor.commit(); const compactRemoved = compactB.result('confirmed', { value: 'Late' }); compactB.root.remove();
    check(!compactB.editor.applyResult(compactRemoved) && compactB.editor.state.phase === 'disposed', 'compact removal while pending rejects responses');
    compact.editor.dispose();
    check(!compact.root.querySelector('[data-inline-edit-panel]').hidden && !compact.trigger.hasAttribute('aria-expanded'), 'compact disposal restores visible native form and trigger attributes');
    const boundary = add(fixtures, true); boundary.editor.dispose();
    boundary.root.querySelector('[data-inline-edit-panel]').append(boundary.trigger);
    let rejectedBoundary = false;
    try { createInlineEditor({ root: boundary.root }); } catch { rejectedBoundary = true; }
    check(rejectedBoundary, 'compact setup rejects a trigger hidden inside the panel');
    window.inlineEditCheckResult = { passed, failed: 0, composition: 'simulated' };
  } catch (error) {
    const li = document.createElement('li'); li.textContent = `FAIL — ${error.message}`; results.append(li);
    window.inlineEditCheckResult = { passed, failed: 1, error: error.message };
  } finally {
    for (const editor of owners) editor.dispose();
    fixtures.replaceChildren(); run.disabled = false;
  }
});
