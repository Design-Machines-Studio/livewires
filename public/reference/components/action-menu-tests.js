import { createActionMenu } from '/dist/action-menu.js';

const fixtures = document.querySelector('#fixtures');
let count = 0;
const settle = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
function fixture(container = fixtures) {
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
  container.append(context);
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
  ['closed menus avoid DOM work on unrelated styles and resizes', async (f) => {
    const external = document.createElement('div'); fixtures.append(external); await settle();
    let reads = 0; const query = f.root.querySelector;
    f.root.querySelector = function (...args) { reads++; return query.apply(this, args); };
    try {
      external.className = 'changed'; external.style.color = 'red'; window.dispatchEvent(new Event('resize')); await settle();
      assert(reads === 0 && !f.api.state.open, 'closed menu inspected unrelated changes');
    } finally { delete f.root.querySelector; external.remove(); }
  }],
  ['cleanup removes an empty style attribute created for placement', async (f) => {
    assert(!f.menu.hasAttribute('style'), 'fixture already styled'); assert(f.api.open(), 'fixture menu failed to open'); f.api.dispose();
    assert(!f.menu.hasAttribute('style'), `adapter-created style attribute remained: ${f.menu.getAttribute('style')}`);
  }],
  ['legacy visibility options skip hidden actions', async (f) => {
    Object.defineProperty(f.sub, 'checkVisibility', { configurable: true, value({ checkOpacity = false, checkVisibilityCSS = false } = {}) {
      const style = getComputedStyle(this);
      return this.getClientRects().length > 0 && (!checkOpacity || style.opacity !== '0') && (!checkVisibilityCSS || style.visibility === 'visible');
    } });
    try {
      f.sub.style.visibility = 'hidden'; f.api.open(); key(f.alpha, 'ArrowDown');
      assert(document.activeElement === f.zulu, 'legacy visibility options included hidden action');
    } finally { delete f.sub.checkVisibility; }
  }],
  ...['hidden', 'inert', 'aria-hidden'].map((attribute) => [
    `unavailable application ancestor ${attribute} preserves external context and closes open levels`, async (f) => {
      f.api.dispose();
      const external = document.createElement('p'); external.textContent = 'External context'; fixtures.append(external);
      const api = createActionMenu({ root: f.root, contextTarget: external });
      try {
        f.context.setAttribute(attribute, attribute === 'aria-hidden' ? 'true' : '');
        const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); external.dispatchEvent(event);
        assert(!event.defaultPrevented && !api.state.open, 'unavailable ancestor intercepted context');
        f.context.removeAttribute(attribute); await settle(); assert(api.open(), 'available ancestor cannot open');
        f.sub.click(); f.context.setAttribute(attribute, attribute === 'aria-hidden' ? 'true' : ''); await settle();
        assert(!api.state.open && !f.root.querySelector(':popover-open'), 'ancestor update left overlays');
        assert(!f.root.contains(document.activeElement), 'focus stayed in unavailable ancestor');
      } finally { api.dispose(); external.remove(); f.context.removeAttribute(attribute); }
    },
  ]),
  ...['hidden', 'inert', 'aria-hidden'].map((attribute) => [
    `unavailable composed shadow host ${attribute} prevents opening and closes levels`, async () => {
      const host = document.createElement('div'); fixtures.append(host);
      const tree = host.attachShadow({ mode: 'open' }); const f = fixture(tree);
      try {
        host.setAttribute(attribute, attribute === 'aria-hidden' ? 'true' : ''); assert(!f.api.open(), 'unavailable host opened');
        host.removeAttribute(attribute); await settle(); assert(f.api.open(), 'available host cannot open');
        host.setAttribute(attribute, attribute === 'aria-hidden' ? 'true' : ''); await settle();
        assert(!f.api.state.open && !f.root.querySelector(':popover-open'), 'host update left overlays');
      } finally { f.remove(); host.remove(); }
    },
  ]),
  ...['display: none', 'visibility: hidden', 'opacity: 0'].map((declaration) => [
    `CSS-hidden action ${declaration} is skipped without trapping navigation`, async (f) => {
      const style = document.createElement('style'); const name = `css-hidden-${count}`;
      style.textContent = `.${name} { ${declaration}; }`; fixtures.append(style);
      try {
        f.sub.classList.add(name); f.api.open(); key(f.alpha, 'ArrowDown');
        assert(document.activeElement === f.zulu, 'CSS-hidden action trapped navigation');
        f.sub.classList.remove(name); f.alpha.style.visibility = 'hidden'; await settle();
        key(f.zulu, 'Home'); assert(document.activeElement === f.sub, 'inline-hidden action not skipped');
      } finally { style.remove(); }
    },
  ]),
  ['a CSS-hidden visible-button path preserves external native context', async (f) => {
    f.trigger.style.display = 'none';
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); f.context.querySelector('p').dispatchEvent(event);
    assert(!event.defaultPrevented && !f.api.state.open, 'CSS-hidden trigger intercepted context');
  }],
  ['a CSS-hidden menu preserves external native context and remains closed', async (f) => {
    f.menu.style.setProperty('display', 'none', 'important');
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); f.context.querySelector('p').dispatchEvent(event);
    assert(!event.defaultPrevented && !f.api.state.open && !f.menu.matches(':popover-open'), 'CSS-hidden menu intercepted context');
    assert(f.trigger.getAttribute('aria-expanded') === 'false', 'CSS-hidden menu expanded trigger');
  }],
  ['cleanup restores only positioning declarations and preserves server style updates', async (f) => {
    f.menu.style.setProperty('left', '3px', 'important'); f.menu.style.color = 'red';
    f.api.open(); f.menu.style.color = 'blue'; f.menu.style.width = '260px'; f.menu.style.setProperty('--server-token', 'green'); await settle();
    f.api.dispose();
    assert(f.menu.style.color === 'blue' && f.menu.style.width === '260px' && f.menu.style.getPropertyValue('--server-token') === 'green', 'server styles discarded');
    assert(f.menu.style.left === '3px' && f.menu.style.getPropertyPriority('left') === 'important', 'original positioning lost');
    assert(!f.menu.style.top && !f.menu.style.maxWidth && !f.menu.style.maxHeight, 'owned placement remained');
  }],
  ['positioning style updates settle without an observer feedback loop', async (f) => {
    f.root.style.position = 'fixed'; f.root.style.left = '12.3456789px';
    f.api.open(); await settle();
    let changes = 0; const observer = new MutationObserver((records) => changes += records.length);
    observer.observe(f.menu, { attributes: true, attributeFilter: ['style'] });
    try { await settle(); await settle(); assert(changes === 0, 'positioning continued mutating its own styles'); }
    finally { observer.disconnect(); }
  }],
  ['visibility fallback skips transparent actions without checkVisibility', async (f) => {
    Object.defineProperty(f.sub, 'checkVisibility', { value: undefined, configurable: true });
    f.sub.style.opacity = '0'; f.api.open(); key(f.alpha, 'ArrowDown');
    assert(document.activeElement === f.zulu, 'fallback included a transparent action');
    delete f.sub.checkVisibility;
  }],
  ['slotted action roots observe availability changes inside composed ancestors', async (f) => {
    f.api.dispose(); const host = document.createElement('div'); f.context.append(host);
    const tree = host.attachShadow({ mode: 'open' }); tree.innerHTML = '<div><slot></slot></div>'; host.append(f.root);
    const api = createActionMenu({ root: f.root });
    try {
      assert(api.open(), 'slotted menu cannot open'); tree.firstElementChild.setAttribute('aria-hidden', 'true'); await settle();
      assert(!api.state.open && !f.root.querySelector(':popover-open') && !api.open(), 'slotted ancestor ignored');
      tree.firstElementChild.removeAttribute('aria-hidden'); await settle(); assert(api.open(), 'slotted menu cannot recover');
    } finally { api.dispose(); host.remove(); }
  }],
  ['keyboard focus scrolls clipped menu actions into view', async (f) => {
    f.menu.style.height = '60px'; f.menu.style.overflow = 'auto'; f.menu.style.scrollBehavior = 'auto';
    f.api.open(); key(f.alpha, 'End'); await settle();
    const item = f.zulu.getBoundingClientRect(), list = f.menu.getBoundingClientRect();
    assert(document.activeElement === f.zulu && f.menu.scrollTop > 0 && item.top >= list.top && item.bottom <= list.bottom, 'focused action remained clipped');
  }],
  ...[
    ['trigger', 'disabled'], ['trigger', 'hidden'], ['trigger', 'inert'],
    ['trigger', 'aria-disabled'], ['trigger', 'aria-hidden'],
    ['root', 'hidden'], ['root', 'inert'], ['root', 'aria-hidden'], ['menu', 'hidden'],
  ].map(([target, attribute]) => [
    `unavailable open ${target} ${attribute} closes every level and can recover`, async (f) => {
      f.api.open(); f.sub.click(); assert(f.api.state.depth === 2, 'submenu not open');
      const node = f[target]; node.setAttribute(attribute, attribute.startsWith('aria-') ? 'true' : ''); await settle();
      assert(!f.api.state.open && !f.root.querySelector(':popover-open'), 'unavailable overlay remained open');
      assert(f.trigger.getAttribute('aria-expanded') === 'false' && f.sub.getAttribute('aria-expanded') === 'false', 'unavailable expansion remained');
      assert(target === 'menu' ? document.activeElement === f.trigger : !f.root.contains(document.activeElement), 'focus returned to an unavailable control');
      assert(!f.api.open(), 'unavailable menu reopened');
      node.removeAttribute(attribute); await settle(); assert(f.api.open(), 'available menu cannot recover');
    },
  ]),
  ['shadow-root keyboard navigation, typeahead, submenus and dismissal use local focus', async () => {
    const host = document.createElement('div'); fixtures.append(host);
    const tree = host.attachShadow({ mode: 'open' }); const f = fixture(tree);
    try {
      f.api.open(); assert(tree.activeElement === f.alpha, 'shadow initial focus');
      key(f.alpha, 'ArrowDown'); assert(tree.activeElement === f.sub, 'shadow next item');
      key(f.sub, 'End'); assert(tree.activeElement === f.zulu, 'shadow End');
      key(f.zulu, 'ArrowDown'); assert(tree.activeElement === f.alpha, 'shadow wrap');
      key(f.alpha, 'z'); assert(tree.activeElement === f.zulu, 'shadow typeahead');
      key(f.zulu, 'Home'); key(f.alpha, 'ArrowDown'); key(f.sub, 'ArrowRight');
      assert(tree.activeElement.dataset.menuAction === 'pdf', 'shadow submenu');
      key(tree.activeElement, 'Escape'); assert(tree.activeElement === f.sub, 'shadow submenu return');
      key(f.sub, 'Escape'); assert(tree.activeElement === f.trigger && !f.api.state.open, 'shadow Escape');
      f.api.open(); const event = key(f.alpha, 'Tab');
      assert(!event.defaultPrevented && tree.activeElement === f.trigger && !f.api.state.open, 'shadow Tab');
    } finally { f.remove(); host.remove(); }
  }],
  ['shadow-root updates recover focus and host removal cleans up open menus', async () => {
    const host = document.createElement('div'); fixtures.append(host);
    const tree = host.attachShadow({ mode: 'open' }); const f = fixture(tree);
    try {
      f.api.open(); f.alpha.disabled = true; await settle(); assert(tree.activeElement === f.sub, 'shadow disabled recovery');
      f.sub.parentElement.remove(); await settle(); assert(tree.activeElement === f.zulu, 'shadow removal recovery');
      const next = replacement(f); f.menu.replaceWith(next); await settle();
      assert(!f.api.state.open && tree.activeElement === f.trigger, 'shadow template focus return');
      assert(f.api.open(), 'shadow replacement reopen'); host.remove(); await settle();
      assert(f.api.state.disposed && !next.matches(':popover-open'), 'shadow host removal cleanup');
    } finally { f.remove(); host.remove(); }
  }],
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
  ...['hide trigger', 'replace with hidden trigger', 'make root inert'].map((change) => [
    `context listeners cannot open an unavailable menu: ${change}`, async (f) => {
      f.after.focus();
      f.root.addEventListener('lw:menu-context', () => {
        if (change === 'make root inert') f.root.inert = true;
        else if (change === 'hide trigger') f.trigger.hidden = true;
        else {
          const next = f.trigger.cloneNode(true);
          next.hidden = true;
          f.trigger.replaceWith(next);
        }
      }, { once: true });
      assert(!f.api.open(), 'unavailable menu reported success');
      const actualTrigger = f.root.querySelector('[data-menu-trigger]');
      assert(!f.api.state.open && !f.root.querySelector(':popover-open'), 'unavailable overlay opened');
      assert(actualTrigger.getAttribute('aria-expanded') === 'false', 'unavailable trigger expanded');
      assert(document.activeElement === f.after, 'unavailable menu stole focus');
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      f.context.querySelector('p').dispatchEvent(event);
      assert(!event.defaultPrevented, 'unavailable menu intercepted native context behavior');
    },
  ]),
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
