import { attachMentionDemo } from '/reference/components/mention-suggestions-demo.js';

const fixtures = document.querySelector('#fixtures');
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const settle = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
let count = 0;

const PEOPLE = [
  { id: 'p1', name: 'Ada Okafor', detail: 'Finance circle', initials: 'AO' },
  { id: 'p2', name: 'Sam Rivera', detail: 'Kitchen', initials: 'SR' },
  { id: 'p3', name: 'Sam Rivera', detail: 'Finance circle', initials: 'SR', disabled: true },
  { id: 'p4', name: 'Di Ng' }
];
const MANY = Array.from({ length: 30 }, (_, i) => ({ id: `m${i}`, name: `Member ${i + 1}`, initials: 'M' }));

function fixture(options = {}) {
  const id = `t${++count}`;
  const host = document.createElement('section');
  host.innerHTML = `<form id="${id}-form" action="#">
      <div id="${id}-editor" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Message" style="min-block-size:3em;border:1px solid"></div>
      <button type="submit">Send</button>
    </form>
    <div class="rounded scheme-default" data-mention-suggestions id="${id}-root" data-state="closed">
      <ul role="listbox" id="${id}-list" aria-label="People" hidden></ul>
      <p role="status" aria-atomic="true"></p>
    </div>`;
  fixtures.append(host);
  const form = host.querySelector('form');
  const editor = host.querySelector('[contenteditable]');
  const root = host.querySelector('[data-mention-suggestions]');
  // Mount as a direct .stack child so inherited layout margins would show up.
  document.querySelector('main.stack').append(root);
  const list = root.querySelector('[role="listbox"]');
  const status = root.querySelector('[role="status"]');
  const pending = [];
  const selected = [];
  let submits = 0;
  // A consumer Enter-to-send handler that respects defaultPrevented.
  form.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.defaultPrevented) form.requestSubmit(); });
  form.addEventListener('submit', (event) => { event.preventDefault(); submits++; });
  const api = attachMentionDemo({
    editor, root,
    search: (query) => new Promise((resolve, reject) => pending.push({ query, resolve, reject })),
    onSelect: (person) => selected.push(person),
    loadingDelay: 0,
    ...options
  });
  editor.scrollIntoView({ block: 'center', behavior: 'instant' }); // Typing keeps the caret on screen.
  editor.focus();
  return {
    form, editor, root, list, status, pending, selected, api,
    get submits() { return submits; },
    type(text) {
      // Reuse the text node, as real typing does.
      let node = editor.firstChild;
      if (node?.nodeType === Node.TEXT_NODE) node.data = text; else { editor.textContent = text; node = editor.firstChild; }
      const range = document.createRange();
      range.setStart(node, text.length); range.collapse(true);
      const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
      editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    },
    async reply(people, index = pending.length - 1) { pending[index].resolve(people); await settle(); },
    async fail(message, index = pending.length - 1) { pending[index].reject(new Error(message)); await settle(); },
    key(value, options = {}) {
      const event = new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...options });
      editor.dispatchEvent(event);
      return event;
    },
    activeOption() { return root.querySelector('[role="option"][data-active]'); },
    remove() { api.dispose(); root.remove(); host.remove(); }
  };
}

const focused = (f) => assert(document.activeElement === f.editor, 'editor lost focus');

const cases = [
  ['closed by default: listbox hidden, status empty, no active descendant', async (f) => {
    assert(f.root.dataset.state === 'closed' && f.list.hidden && f.status.textContent === '', 'not closed');
    assert(!f.editor.hasAttribute('aria-activedescendant'), 'active descendant while closed');
    assert(f.editor.getAttribute('aria-controls') === f.list.id && f.editor.getAttribute('aria-autocomplete') === 'list' && f.editor.getAttribute('aria-haspopup') === 'listbox', 'editor attributes missing');
    assert(f.editor.getAttribute('role') === 'textbox' && !f.editor.hasAttribute('aria-expanded'), 'editor role changed or aria-expanded set');
    const style = getComputedStyle(f.root);
    assert(style.clipPath.includes('inset') && f.root.getBoundingClientRect().width <= 1, 'closed root is not visually clipped');
  }],
  ['opens on trigger with a visible loading status', async (f) => {
    f.type('Hi @a'); await settle();
    assert(f.root.dataset.state === 'loading' && f.pending.at(-1).query === 'a', 'did not open loading');
    assert(f.status.textContent === 'Searching people…', 'loading status missing');
    assert(f.status.getBoundingClientRect().height > 1, 'loading status not visible');
    focused(f);
  }],
  ['results activate the first enabled option and announce the count', async (f) => {
    f.type('@'); await f.reply(PEOPLE);
    const first = f.list.querySelector('[role="option"]');
    assert(f.root.dataset.state === 'ready' && !f.list.hidden, 'not ready');
    assert(f.editor.getAttribute('aria-activedescendant') === first.id && first.getAttribute('aria-selected') === 'true' && first.hasAttribute('data-active'), 'first option not active');
    assert(f.status.textContent === '4 people found', `count status was ${f.status.textContent}`);
    assert(f.status.getBoundingClientRect().width <= 1, 'ready status should be visually hidden');
    assert(f.list.querySelector('.avatar').getAttribute('aria-hidden') === 'true', 'avatar not hidden from accessibility tree');
    assert(f.list.querySelectorAll('[aria-selected="true"]').length === 1, 'more than one selected option');
  }],
  ['arrow keys move the active option, wrap, and skip disabled options', async (f) => {
    f.type('@'); await f.reply(PEOPLE);
    const options = [...f.list.querySelectorAll('[role="option"]')];
    let event = f.key('ArrowDown');
    assert(event.defaultPrevented && f.editor.getAttribute('aria-activedescendant') === options[1].id, 'ArrowDown did not move to second');
    f.key('ArrowDown');
    assert(f.editor.getAttribute('aria-activedescendant') === options[3].id, 'disabled option was not skipped');
    f.key('ArrowDown');
    assert(f.editor.getAttribute('aria-activedescendant') === options[0].id, 'ArrowDown did not wrap');
    event = f.key('ArrowUp');
    assert(event.defaultPrevented && f.editor.getAttribute('aria-activedescendant') === options[3].id, 'ArrowUp did not wrap');
    assert(options[3].getAttribute('aria-selected') === 'true' && options[0].getAttribute('aria-selected') === 'false', 'aria-selected not moved');
    focused(f);
  }],
  ['Enter selects the active option without submitting the form', async (f) => {
    f.type('Hi @s'); await f.reply(PEOPLE.slice(1));
    const event = f.key('Enter');
    assert(event.defaultPrevented && f.selected.length === 1 && f.selected[0].id === 'p2', 'Enter did not select');
    assert(f.submits === 0, 'form submitted while popup open');
    assert(f.root.dataset.state === 'closed' && !f.editor.hasAttribute('aria-activedescendant'), 'did not close after select');
    assert(f.editor.textContent.startsWith('Hi @Sam Rivera'), `inserted text was ${f.editor.textContent}`);
    focused(f);
    f.key('Enter');
    assert(f.submits === 1, 'Enter did not reach the form after closing');
  }],
  ['Enter without an active option closes and is consumed', async (f) => {
    f.type('@z'); await settle();
    const event = f.key('Enter');
    assert(event.defaultPrevented && f.submits === 0 && f.root.dataset.state === 'closed', 'Enter while loading submitted or stayed open');
  }],
  ['Tab selects the active option; Tab without one passes through', async (f) => {
    f.type('@a'); await f.reply(PEOPLE);
    let event = f.key('Tab');
    assert(event.defaultPrevented && f.selected.length === 1, 'Tab did not select');
    f.type('@zz'); await f.reply([]);
    event = f.key('Tab');
    assert(!event.defaultPrevented && f.root.dataset.state === 'closed', 'Tab without active was blocked or left popup open');
  }],
  ['Shift+Tab and modified Enter close without inserting; Enter never submits', async (f) => {
    f.type('@a'); await f.reply(PEOPLE);
    let event = f.key('Tab', { shiftKey: true });
    assert(!event.defaultPrevented && f.selected.length === 0 && f.root.dataset.state === 'closed', 'Shift+Tab inserted or was blocked');
    for (const modifier of ['shiftKey', 'ctrlKey', 'metaKey', 'altKey']) {
      f.type(`x @${modifier[0]}`); await f.reply(PEOPLE);
      event = f.key('Enter', { [modifier]: true });
      assert(event.defaultPrevented && f.selected.length === 0 && f.submits === 0 && f.root.dataset.state === 'closed', `${modifier}+Enter inserted, submitted or stayed open`);
    }
  }],
  ['arrows pass through when no rows are shown', async (f) => {
    f.type('@zz'); await f.reply([]);
    assert(!f.key('ArrowDown').defaultPrevented && !f.key('ArrowUp').defaultPrevented, 'arrows blocked with no rows');
    f.type('@zzz'); await f.fail('Nope');
    assert(!f.key('ArrowDown').defaultPrevented, 'arrows blocked in error state');
  }],
  ['Escape closes, is consumed, and keeps the current token closed', async (f) => {
    f.type('@a'); await f.reply(PEOPLE);
    const event = f.key('Escape');
    assert(event.defaultPrevented && f.root.dataset.state === 'closed' && f.list.hidden, 'Escape did not close');
    f.type('@ad'); await settle();
    // Same token start: still dismissed.
    assert(f.root.dataset.state === 'closed', 'reopened for dismissed token');
    f.type('x @'); await settle();
    assert(f.root.dataset.state === 'loading', 'new token did not reopen');
    focused(f);
  }],
  ['pointer selection keeps focus in the editor', async (f) => {
    f.type('@'); await f.reply(PEOPLE);
    const target = f.list.querySelectorAll('[role="option"]')[3];
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    target.dispatchEvent(down);
    assert(down.defaultPrevented, 'mousedown not prevented; focus would leave the editor');
    target.click();
    assert(f.selected[0]?.id === 'p4', 'click did not select');
    focused(f);
  }],
  ['pointer on a disabled option does nothing', async (f) => {
    f.type('@'); await f.reply(PEOPLE);
    f.list.querySelectorAll('[role="option"]')[2].click();
    assert(f.selected.length === 0 && f.root.dataset.state === 'ready', 'disabled option selected');
  }],
  ['hover does not change the active option', async (f) => {
    f.type('@'); await f.reply(PEOPLE);
    const before = f.editor.getAttribute('aria-activedescendant');
    const other = f.list.querySelectorAll('[role="option"]')[1];
    for (const type of ['pointerover', 'pointermove', 'mouseover', 'mousemove']) other.dispatchEvent(new MouseEvent(type, { bubbles: true }));
    assert(f.editor.getAttribute('aria-activedescendant') === before, 'hover moved the active option');
  }],
  ['empty and error states use the status region', async (f) => {
    f.type('@zz'); await f.reply([]);
    assert(f.root.dataset.state === 'empty' && f.list.hidden && f.status.textContent === 'No matching people', 'empty state wrong');
    assert(f.status.getBoundingClientRect().height > 1, 'empty message not visible');
    f.type('@zzz'); await f.fail('People could not be loaded.');
    assert(f.root.dataset.state === 'error' && f.status.textContent === 'People could not be loaded.', 'error state wrong');
    assert(f.root.querySelectorAll('[role="status"]').length === 1, 'more than one status region');
    const probe = document.createElement('span'); probe.style.color = 'var(--color-error)'; f.root.append(probe);
    const errorColor = getComputedStyle(probe).color; probe.remove();
    assert(getComputedStyle(f.status).color === errorColor, 'error message not in the error colour');
  }],
  ['status is not rewritten when its message is unchanged', async (f) => {
    f.type('@a'); await settle();
    let writes = 0;
    const observer = new MutationObserver((records) => { writes += records.length; });
    observer.observe(f.status, { childList: true, characterData: true, subtree: true });
    f.type('@ad'); await settle(); f.type('@ada'); await settle();
    observer.disconnect();
    assert(writes === 0, `loading status rewritten ${writes} times`);
  }],
  ['fast replies announce only the count; slow replies show loading after the delay', async () => {
    const f = fixture({ loadingDelay: 80 });
    try {
      const writes = [];
      new MutationObserver(() => writes.push(f.status.textContent)).observe(f.status, { childList: true, characterData: true, subtree: true });
      f.type('@a'); await settle();
      assert(f.root.dataset.state === 'closed', 'popup showed before the loading delay');
      const early = f.key('Enter');
      assert(!early.defaultPrevented && f.submits === 1, 'Enter was swallowed while nothing was on screen');
      f.type('@a'); await settle();
      await f.reply(PEOPLE);
      await new Promise((resolve) => setTimeout(resolve, 120));
      assert(!writes.includes('Searching people…'), 'fast reply still announced loading');
      f.type('@ad'); await new Promise((resolve) => setTimeout(resolve, 120));
      assert(f.root.dataset.state === 'loading' && f.status.textContent === 'Searching people…', 'slow reply did not show loading');
    } finally { f.remove(); }
  }],
  ['stale rows are marked busy and a late reply is ignored', async (f) => {
    f.type('@a'); await f.reply(PEOPLE);
    f.type('@ad'); await settle();
    assert(f.list.getAttribute('aria-busy') === 'true' && !f.list.hidden, 'retained rows not marked busy');
    assert(!f.editor.hasAttribute('aria-activedescendant'), 'stale rows kept an active option');
    f.type('@ada'); await settle();
    await f.reply([PEOPLE[0]], 2);
    assert(f.list.querySelectorAll('[role="option"]').length === 1 && !f.list.hasAttribute('aria-busy'), 'current reply not applied');
    await f.reply(MANY, 1);
    assert(f.list.querySelectorAll('[role="option"]').length === 1, 'late reply for an older query replaced the results');
    assert(f.status.textContent === '1 person found', 'status changed by late reply');
  }],
  ['scroll-to-active scrolls the list, not the page', async (f) => {
    f.type('@m'); await f.reply(MANY);
    const pageY = scrollY, pageX = scrollX;
    f.key('ArrowUp'); await settle();
    const active = f.activeOption();
    const list = f.list.getBoundingClientRect(), row = active.getBoundingClientRect();
    assert(active.textContent.includes('Member 30'), 'did not wrap to last');
    assert(f.list.scrollTop > 0 && row.top >= list.top - 1 && row.bottom <= list.bottom + 1, `active row not visible inside list (scrollTop ${f.list.scrollTop}, row ${row.top}-${row.bottom}, list ${list.top}-${list.bottom}, state ${f.root.dataset.state})`);
    assert(scrollY === pageY && scrollX === pageX, 'page scrolled');
    f.key('ArrowDown'); await settle();
    assert(f.list.scrollTop === 0, 'did not scroll back to first');
  }],
  ['composition keys pass through to the editor', async (f) => {
    f.type('@a'); await f.reply(PEOPLE);
    const event = f.key('Enter', { isComposing: true });
    assert(!event.defaultPrevented && f.selected.length === 0, 'Enter during composition was intercepted');
  }],
  ['other keys pass through while open', async (f) => {
    f.type('@a'); await f.reply(PEOPLE);
    for (const key of ['a', 'Backspace', 'Home', 'End', 'ArrowLeft', 'ArrowRight', ' ']) {
      assert(!f.key(key).defaultPrevented, `${key} was intercepted`);
    }
  }],
  ['position properties resolve against the viewport, also inside a stack', async () => {
    // A root without the demo attached, so no script repositions it.
    const root = document.createElement('div');
    root.dataset.mentionSuggestions = ''; root.dataset.state = 'ready';
    root.innerHTML = '<ul role="listbox" aria-label="People"><li role="option">Ada</li></ul><p role="status"></p>';
    root.style.cssText = '--mention-suggestions-top: 40px; --mention-suggestions-left: 24px';
    document.querySelector('main.stack').append(root);
    try {
      const rect = root.getBoundingClientRect();
      assert(Math.abs(rect.top - 40) < 1 && Math.abs(rect.left - 24) < 1, `root at ${rect.left},${rect.top}`);
    } finally { root.remove(); }
  }],
  ['popup stays within the viewport', async (f) => {
    f.type('@'); await f.reply(MANY);
    const rect = f.root.getBoundingClientRect();
    assert(rect.left >= 0 && rect.right <= document.documentElement.clientWidth && rect.top >= 0 && rect.bottom <= innerHeight, `popup escaped the viewport: ${JSON.stringify(rect)} ${f.root.style.cssText} editor ${JSON.stringify(f.editor.getBoundingClientRect())} vh ${innerHeight}`);
  }]
];

async function run() {
  const results = document.querySelector('#test-results');
  const status = document.querySelector('#test-status');
  results.replaceChildren();
  let failed = 0;
  for (const [name, test] of cases) {
    const f = fixture();
    const item = document.createElement('li');
    try { await test(f); item.textContent = `PASS ${name}`; }
    catch (error) { failed++; item.textContent = `FAIL ${name}: ${error.message}`; }
    finally { f.remove(); }
    results.append(item);
  }
  status.textContent = failed ? `${failed} of ${cases.length} failed.` : `All ${cases.length} passed.`;
  document.body.dataset.testsComplete = failed ? 'fail' : 'pass';
}
document.querySelector('#run-tests').addEventListener('click', run);
