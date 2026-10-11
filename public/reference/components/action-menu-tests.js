import { createActionMenu } from '/dist/action-menu.js';

const fixtures = document.querySelector('#fixtures');
let count = 0;
const settle = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
function fixture() {
  const id = `test-${++count}`;
  const context = document.createElement('section');
  context.dataset.contextId = id;
  context.innerHTML = `<p>Context <input aria-label="Nested field"><a href="#">Nested link</a></p>
    <div class="dropdown" data-action-menu data-context-id="${id}">
      <button class="button trigger" data-menu-trigger type="button">Actions</button>
      <ul class="menu" id="${id}-menu" data-menu aria-label="Actions">
        <li><button data-menu-action="alpha" type="button">Alpha</button></li>
        <li><button data-menu-action="disabled" type="button" disabled>Disabled</button></li>
        <li><button data-menu-submenu type="button" aria-controls="${id}-sub">Export</button>
          <ul class="menu" id="${id}-sub" data-menu aria-label="Export"><li><button data-menu-action="pdf" type="button">PDF</button></li></ul>
        </li>
        <li><button data-menu-action="zulu" type="button">Zulu</button></li>
      </ul>
    </div><button data-after type="button">After menu</button>`;
  fixtures.append(context);
  const root = context.querySelector('[data-action-menu]');
  const trigger = root.querySelector('[data-menu-trigger]');
  const menu = root.querySelector('[data-menu]');
  const markup = menu.outerHTML;
  const api = createActionMenu({ root, contextTarget: context });
  return { root, context, trigger, menu, markup, api, alpha: root.querySelector('[data-menu-action="alpha"]'), sub: root.querySelector('[data-menu-submenu]'), zulu: root.querySelector('[data-menu-action="zulu"]'), after: context.querySelector('[data-after]'), remove() { api.dispose(); context.remove(); } };
}
function replacement(f) {
  const template = document.createElement('template');
  template.innerHTML = f.markup;
  return template.content.firstElementChild;
}
function key(target, value, options = {}) {
  const event = new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...options });
  target.dispatchEvent(event);
  return event;
}
const cases = [
  ['open focuses the first action without executing it', async (f) => {
    let actions = 0; f.root.addEventListener('lw:menu-action', () => actions++);
    f.trigger.click(); assert(document.activeElement === f.alpha && actions === 0, 'first item focus or unwanted action');
    assert(f.trigger.getAttribute('aria-expanded') === 'true', 'actual trigger expansion');
  }],
  ['arrows skip disabled actions, wrap and support Home/End', async (f) => {
    f.api.open(); key(f.alpha, 'ArrowDown'); assert(document.activeElement === f.sub, 'disabled skip');
    key(f.sub, 'End'); assert(document.activeElement === f.zulu, 'End');
    key(f.zulu, 'ArrowDown'); assert(document.activeElement === f.alpha, 'wrap');
    key(f.alpha, 'ArrowUp'); assert(document.activeElement === f.zulu, 'reverse wrap');
    key(f.zulu, 'Home'); assert(document.activeElement === f.alpha, 'Home');
  }],
  ['ArrowUp on the trigger opens at the last action', async (f) => {
    key(f.trigger, 'ArrowUp'); assert(document.activeElement === f.zulu, 'last action');
  }],
  ['typeahead finds a named action', async (f) => {
    f.api.open(); key(f.alpha, 'z'); assert(document.activeElement === f.zulu, 'typeahead');
  }],
  ['submenu forward/reverse and Escape restore the correct opener', async (f) => {
    f.api.open(); f.sub.focus(); key(f.sub, 'ArrowRight'); assert(f.api.state.depth === 2, 'submenu depth');
    const child = document.activeElement; assert(child.dataset.menuAction === 'pdf', 'submenu focus');
    key(child, 'ArrowLeft'); assert(document.activeElement === f.sub && f.api.state.depth === 1, 'return');
    key(f.sub, 'ArrowRight'); key(document.activeElement, 'Escape'); assert(document.activeElement === f.sub, 'Escape submenu');
    key(f.sub, 'Escape'); assert(document.activeElement === f.trigger && !f.api.state.open, 'Escape root');
  }],
  ['Tab closes synchronously without preventing native traversal', async (f) => {
    f.api.open(); const event = key(f.alpha, 'Tab');
    assert(!event.defaultPrevented && document.activeElement === f.trigger && !f.api.state.open, 'Tab dismissal');
    f.api.open(); const reverse = key(f.alpha, 'Tab', { shiftKey: true });
    assert(!reverse.defaultPrevented && !f.api.state.open, 'Shift+Tab dismissal');
  }],
  ['action detail reports intent and cancellation prevents native default', async (f) => {
    let detail;
    f.root.addEventListener('lw:menu-action', (event) => { detail = event.detail; event.preventDefault(); });
    f.api.open(); const event = new MouseEvent('click', { bubbles: true, cancelable: true }); f.alpha.dispatchEvent(event);
    assert(detail.action === 'alpha' && detail.contextId === f.context.dataset.contextId && detail.trigger === f.trigger && detail.item === f.alpha, 'action detail');
    assert(event.defaultPrevented && !f.api.state.open && document.activeElement === f.trigger, 'action dismissal');
  }],
  ['context activation expands the button, never the context row', async (f) => {
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 20, clientY: 30 });
    f.context.querySelector('p').dispatchEvent(event);
    assert(event.defaultPrevented && f.api.state.open, 'context open');
    assert(f.trigger.getAttribute('aria-expanded') === 'true' && !f.context.hasAttribute('aria-expanded'), 'context ARIA');
  }],
  ['nested controls retain native context behavior', async (f) => {
    for (const node of f.context.querySelectorAll('input, p > a')) {
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); node.dispatchEvent(event);
      assert(!event.defaultPrevented && !f.api.state.open, 'nested control intercepted');
    }
  }],
  ['cancelled context event preserves native context activation', async (f) => {
    f.root.addEventListener('lw:menu-context', (event) => event.preventDefault());
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); f.context.querySelector('p').dispatchEvent(event);
    assert(!event.defaultPrevented && !f.api.state.open, 'cancelled context');
  }],
  ['context listeners may replace authorized markup before opening', async (f) => {
    f.root.addEventListener('lw:menu-context', () => f.menu.replaceWith(replacement(f)), { once: true });
    f.api.open(); assert(f.api.state.open && document.activeElement.isConnected, 'synchronous replacement');
    assert(!f.menu.matches(':popover-open'), 'old menu remains open');
  }],
  ['two instances do not share action or focus state', async (f) => {
    const other = fixture();
    try { f.api.open(); other.api.open(); assert(other.api.state.open && !f.api.state.open, 'instance dismissal');
      other.api.close(true); assert(document.activeElement === other.trigger && !f.api.state.open, 'wrong focus owner');
    } finally { other.remove(); }
  }],
  ['outside focus dismisses without stealing focus', async (f) => {
    f.api.open(); f.after.focus(); assert(!f.api.state.open && document.activeElement === f.after, 'outside focus');
  }],
  ['server template output replacement closes old overlays', async (f) => {
    f.api.open(); const next = replacement(f); f.menu.replaceWith(next); await settle();
    assert(!f.api.state.open && !f.menu.matches(':popover-open') && document.activeElement === f.trigger, 'replacement cleanup');
    assert(f.api.open() && next.matches(':popover-open'), 'replacement cannot reopen');
    f.api.dispose();
    assert(!next.hasAttribute('popover') && !next.hasAttribute('role') && !next.querySelector('button').hasAttribute('tabindex'), 'replacement fallback attributes');
  }],
  ['removing an open trigger disposes subscriptions and overlays', async (f) => {
    f.api.open(); f.trigger.remove(); await settle();
    assert(f.api.state.disposed && !f.menu.matches(':popover-open') && !f.root.hasAttribute('data-menu-ready'), 'trigger removal cleanup');
    assert(!f.api.open(), 'disposed reopened');
  }],
  ['removing the root closes all levels and allows clean reattachment', async (f) => {
    f.api.open(); f.sub.click(); f.root.remove(); await settle();
    assert(f.api.state.disposed && !f.menu.matches(':popover-open'), 'removed root cleanup');
    f.context.prepend(f.root); const again = createActionMenu({ root: f.root });
    assert(again.open(), 'reattach failed'); again.dispose();
  }],
  ['stripping popover during a morph safely closes state', async (f) => {
    f.api.open(); f.menu.removeAttribute('popover'); await settle();
    assert(!f.api.state.open && !f.menu.matches(':popover-open'), 'stripped popover');
    assert(f.api.open(), 'cannot reopen after morph');
  }],
  ['disabled and removed focused actions recover to an available item', async (f) => {
    f.api.open(); f.alpha.disabled = true; await settle(); assert(document.activeElement === f.sub, 'disable recovery');
    f.sub.parentElement.remove(); await settle(); assert(document.activeElement === f.zulu, 'remove recovery');
  }],
  ['inserted actions receive semantics and remain actionable', async (f) => {
    f.api.open(); const row = document.createElement('li'); row.innerHTML = '<button data-menu-action="new" type="button">New action</button>';
    f.menu.append(row); await settle(); assert(row.firstElementChild.getAttribute('role') === 'menuitem', 'new semantics');
    key(document.activeElement, 'End'); assert(document.activeElement === row.firstElementChild, 'new navigation');
  }],
  ['invalid form-containing markup rejects setup without changing native controls', async (f) => {
    const root = document.createElement('div'); root.dataset.actionMenu = '';
    root.innerHTML = '<button data-menu-trigger>Filter</button><ul class="menu" id="invalid-menu" data-menu><li><input></li></ul>';
    fixtures.append(root);
    let rejected = false; try { createActionMenu({ root }); } catch { rejected = true; }
    assert(rejected && !root.hasAttribute('data-menu-ready') && !root.querySelector('input').hasAttribute('role'), 'form semantics'); root.remove();
  }],
  ['dispose is idempotent and restores author attributes', async (f) => {
    f.api.open(); f.api.dispose(); f.api.dispose();
    assert(!f.trigger.hasAttribute('aria-expanded') && !f.menu.hasAttribute('popover') && !f.menu.hasAttribute('role'), 'attribute restoration');
    f.trigger.click(); assert(!f.menu.matches(':popover-open'), 'listener survived');
  }],
  ['placement keeps root and submenu within the viewport', async (f) => {
    f.root.style.position = 'fixed'; f.root.style.right = '0'; f.root.style.bottom = '0';
    f.api.open(); f.sub.click(); await settle();
    for (const list of f.root.querySelectorAll(':popover-open')) {
      const rect = list.getBoundingClientRect(); assert(rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1, 'viewport overflow');
    }
  }],
];

window.runActionMenuTests = async () => {
  const results = [];
  document.querySelector('#test-results').replaceChildren();
  for (const [name, run] of cases) {
    const f = fixture();
    try { await run(f); results.push({ name, passed: true }); }
    catch (error) { results.push({ name, passed: false, error: error.message }); }
    finally { f.remove(); await settle(); }
    const row = document.createElement('li'); row.textContent = `${results.at(-1).passed ? 'PASS' : 'FAIL'}: ${name}${results.at(-1).error ? ` — ${results.at(-1).error}` : ''}`;
    document.querySelector('#test-results').append(row);
  }
  const failures = results.filter((result) => !result.passed);
  document.querySelector('#test-status').textContent = `${results.length - failures.length}/${results.length} checks passed.`;
  window.actionMenuTestResults = results;
  return results;
};
document.querySelector('#run-tests').addEventListener('click', window.runActionMenuTests);
