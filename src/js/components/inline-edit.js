import { createInlineEditState } from './inline-edit-state.js';

const owners = new WeakSet();
const selectors = {
  value: '[data-inline-edit-value]', panel: '[data-inline-edit-panel]', trigger: '[data-inline-edit-trigger]',
  form: '[data-inline-edit-form]', input: '[data-inline-edit-input]', save: '[data-inline-edit-save]',
  cancel: '[data-inline-edit-cancel]', error: '[data-inline-edit-error]', status: '[data-inline-edit-status]',
};

/** Attach to stable native markup. The application must preserve its focused input. */
export function createInlineEditor({ root, contextId = root?.getAttribute('data-context-id') } = {}) {
  if (!root?.isConnected || owners.has(root)) throw new Error('Use a connected, unowned inline editor root.');
  const nodes = Object.fromEntries(Object.entries(selectors).map(([key, selector]) => [key, root.querySelector(selector)]));
  const compact = root.getAttribute('data-inline-edit') === 'compact';
  const validPanel = compact
    ? nodes.panel?.tagName === 'DIV' && nodes.trigger?.tagName === 'A' && nodes.panel.id && nodes.trigger.getAttribute('href') === `#${nodes.panel.id}` &&
      !nodes.panel.contains(nodes.trigger) && !nodes.panel.contains(nodes.value)
    : nodes.panel?.tagName === 'DETAILS' && nodes.trigger?.tagName === 'SUMMARY' && nodes.panel.querySelector('summary') === nodes.trigger;
  if (Object.values(nodes).some(node => !node) || !validPanel ||
      nodes.form.tagName !== 'FORM' || nodes.input.tagName !== 'INPUT' || nodes.input.type !== 'text' ||
      !nodes.error.id || !nodes.input.labels?.length || !nodes.panel.contains(nodes.form) ||
      !nodes.form.contains(nodes.input)) {
    throw new Error('Inline editing requires a labeled text form, an identified error and a details/summary or compact link/panel pair.');
  }
  const Observer = root.ownerDocument.defaultView.MutationObserver;
  const Event = root.ownerDocument.defaultView.CustomEvent;
  const initial = new Map();
  function own(node, attr, value) {
    if (!initial.has(node)) initial.set(node, new Map());
    if (!initial.get(node).has(attr)) initial.get(node).set(attr, node.getAttribute(attr));
    if (value === null) { if (node.hasAttribute(attr)) node.removeAttribute(attr); }
    else if (node.getAttribute(attr) !== value) node.setAttribute(attr, value);
  }
  let disposed = false;
  let composing = false;
  let compositionTail = false;
  let tailTimer = null;
  const win = root.ownerDocument.defaultView;
  function ownsFocus() {
    // Do not steal focus from another editor/control while a delayed result arrives.
    const active = nodes.input.getRootNode().activeElement;
    return active && (nodes.form.contains(active) || active === nodes.trigger);
  }
  function render(state) {
    if (disposed || state.phase === 'disposed') return;
    const opened = state.phase !== 'confirmed';
    own(root, 'data-inline-edit-state', state.phase);
    own(root, 'data-inline-edit-enhanced', '');
    if (compact) {
      own(nodes.value, 'hidden', opened ? '' : null);
      own(nodes.trigger, 'hidden', opened ? '' : null);
      own(nodes.panel, 'hidden', opened ? null : '');
      own(nodes.trigger, 'aria-controls', nodes.panel.id);
      own(nodes.trigger, 'aria-expanded', opened ? 'true' : 'false');
    } else own(nodes.panel, 'open', opened ? '' : null);
    own(nodes.input, 'readonly', ['pending', 'unknown'].includes(state.phase) ? '' : null);
    own(nodes.save, 'disabled', ['pending', 'unknown'].includes(state.phase) ? '' : null);
    own(nodes.input, 'aria-invalid', state.phase === 'rejected' ? 'true' : null);
    const originalDescription = initial.get(nodes.input)?.has('aria-describedby')
      ? initial.get(nodes.input).get('aria-describedby') : nodes.input.getAttribute('aria-describedby');
    const described = originalDescription ?? '';
    const ids = new Set(described.split(/\s+/).filter(Boolean));
    if (state.phase === 'rejected') ids.add(nodes.error.id);
    own(nodes.input, 'aria-describedby', ids.size ? [...ids].join(' ') : null);
    // Writing .value, even to the same string, can reset the caret in browsers.
    if (nodes.input.value !== state.draft) nodes.input.value = state.draft;
    if (nodes.value.textContent !== state.confirmed) nodes.value.textContent = state.confirmed;
    const error = state.phase === 'rejected' ? state.message : '';
    if (nodes.error.textContent !== error) nodes.error.textContent = error;
    const status = state.message && state.phase === 'confirmed' ? state.message : { confirmed: 'Confirmed value.', editing: 'Editing. Save explicitly; leaving the field keeps your draft.',
      pending: 'Save requested. Waiting for application confirmation.', rejected: 'Value rejected. Edit your draft and save again.',
      unknown: 'Save result is uncertain. Check with the application before trying again.' }[state.phase];
    if (nodes.status.textContent !== status) nodes.status.textContent = status;
  }
  const local = createInlineEditState({ contextId, value: nodes.value.textContent,
    onChange: render,
    onEvent: (name, detail) => root.dispatchEvent(new Event(`lw-inline-edit-${name}`, { bubbles: true, composed: true, detail })),
  });
  owners.add(root);
  render(local.state);
  function live() {
    if (disposed) return false;
    if (!root.isConnected || Object.entries(nodes).some(([key, node]) => !node.isConnected || root.querySelector(selectors[key]) !== node)) {
      dispose();
      return false;
    }
    return true;
  }
  function request() {
    if (!live()) return false;
    const changed = local.request();
    if (changed && live() && local.state.phase === 'editing') nodes.input.focus();
    return changed;
  }
  function commit() {
    if (!live() || composing || compositionTail) return false;
    local.setDraft(nodes.input.value);
    const restore = local.state.draft === local.state.original && ownsFocus();
    const acted = local.commit();
    if (acted && restore) nodes.trigger.focus();
    return acted;
  }
  function cancel(reason = 'cancel') {
    if (!live()) return false;
    const restore = ownsFocus();
    const acted = local.cancel(reason);
    if (acted && restore) nodes.trigger.focus();
    return acted;
  }
  function keydown(event) {
    if (event.defaultPrevented || composing || event.isComposing || event.keyCode === 229 || compositionTail) return;
    if (event.target === nodes.trigger && ['Enter', ' ', 'F2'].includes(event.key)) {
      event.preventDefault();
      if (!event.repeat) request();
    } else if (nodes.form.contains(event.target) && ['Enter', 'Escape'].includes(event.key)) {
      // Buttons retain native Enter activation; the field owns Enter-to-save.
      if (event.key === 'Escape' || event.target === nodes.input) {
        event.preventDefault();
        if (!event.repeat) event.key === 'Escape' ? cancel('escape') : commit();
      } else if (event.repeat) event.preventDefault();
    }
  }
  function click(event) {
    if (!live()) return;
    if (event.target.closest('[data-inline-edit-trigger]') === nodes.trigger) { event.preventDefault(); request(); }
    if (event.target.closest('[data-inline-edit-cancel]') === nodes.cancel) { event.preventDefault(); cancel(); }
  }
  function submit(event) { if (event.target === nodes.form) { event.preventDefault(); commit(); } }
  function input(event) { if (event.target === nodes.input && live()) local.setDraft(nodes.input.value); }
  function compositionStart(event) {
    if (event.target !== nodes.input) return;
    composing = true;
    compositionTail = false;
    win.clearTimeout(tailTimer);
  }
  function compositionEnd(event) {
    if (event.target !== nodes.input) return;
    composing = false;
    compositionTail = true;
    input(event);
    tailTimer = win.setTimeout(() => { compositionTail = false; tailTimer = null; }, 0);
  }
  // Blur deliberately has no command handler. Native value/selection remain in place.
  const listeners = { keydown, click, submit, input, compositionstart: compositionStart, compositionend: compositionEnd };
  for (const [type, handler] of Object.entries(listeners)) root.addEventListener(type, handler);
  const observer = new Observer(() => { if (live()) render(local.state); });
  let tree = root.getRootNode();
  while (tree) { observer.observe(tree, { childList: true, subtree: true, attributes: true }); tree = tree.host?.getRootNode(); }
  function dispose() {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    win.clearTimeout(tailTimer);
    for (const [type, handler] of Object.entries(listeners)) root.removeEventListener(type, handler);
    local.dispose();
    owners.delete(root);
    for (const [node, attrs] of initial) for (const [attr, value] of attrs) {
      if (value === null) node.removeAttribute(attr); else node.setAttribute(attr, value);
    }
    nodes.error.textContent = '';
    nodes.status.textContent = '';
  }
  return {
    request, commit, cancel, dispose,
    get state() { return local.state; },
    updateConfirmed(value) { return live() && local.updateConfirmed(value); },
    applyResult(result) {
      if (!live()) return false;
      // Confirm while focus is still in the form, before details closes.
      const matches = ['pending', 'unknown'].includes(local.state.phase) && result?.contextId === local.state.contextId &&
        result.editId === local.state.editId && result.requestId === local.state.requestId;
      const restore = matches && result.outcome === 'confirmed' && typeof result.value === 'string' && ownsFocus();
      const acted = local.applyResult(result);
      if (acted && restore) nodes.trigger.focus();
      return acted;
    },
    refresh() { if (!live()) return false; render(local.state); return true; },
  };
}
