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
  ...['root', 'submenu'].flatMap((scope) => ['inert', 'aria-hidden', 'disable opener', 'remove trigger', 'replace menu', 'dispose', 'remove root', 'strip popover', 'cancel'].map((change) => [`${scope} beforetoggle ${change} never commits an unusable open level`, async (f) => {
    const errors = []; const onError = (event) => errors.push(event.message); window.addEventListener('error', onError);
    try {
    const list = scope === 'root' ? f.menu : f.root.querySelector('[data-menu] [data-menu]'); const opener = scope === 'root' ? f.trigger : f.sub;
    if (scope === 'submenu') f.api.open();
    list.addEventListener('beforetoggle', (event) => {
      if (event.newState !== 'open') return;
      if (change === 'inert') f.root.inert = true;
      else if (change === 'aria-hidden') f.root.setAttribute('aria-hidden', 'true');
      else if (change === 'disable opener') opener.disabled = true;
      else if (change === 'remove trigger') f.trigger.remove();
      else if (change === 'replace menu') f.menu.replaceWith(replacement(f));
      else if (change === 'dispose') f.api.dispose();
      else if (change === 'remove root') f.root.remove();
      else if (change === 'strip popover') list.removeAttribute('popover');
      else event.preventDefault();
    }, { once: true });
    if (scope === 'root') assert(!f.api.open({ activation: 'context', at: { x: 120, y: 120 } }), 'unusable root opening returned success');
    else f.sub.click();
    assert(!list.matches(':popover-open') && f.api.state.depth < (scope === 'root' ? 1 : 2), 'unusable native popup or level survived synchronously');
    assert(opener.getAttribute('aria-expanded') !== 'true', 'unusable opener remained expanded');
    await settle(); assert(!list.matches(':popover-open'), 'deferred cleanup reopened stale popup');
    assert(errors.length === 0, `native DOM handler error: ${errors.join('; ')}`);
    } finally { window.removeEventListener('error', onError); }
  }])),
  ...['root', 'submenu'].map((scope) => [`closing ${scope} beforetoggle disposal preserves application focus without throwing`, async (f) => {
    f.api.open(); if (scope === 'submenu') f.sub.click(); const list = scope === 'root' ? f.menu : f.root.querySelector('[data-menu] [data-menu]');
    list.addEventListener('beforetoggle', () => { f.api.dispose(); f.after.focus(); }, { once: true });
    f.api.close(true); assert(f.api.state.disposed && !f.root.querySelector(':popover-open'), 'closing disposal retained overlay/state');
    assert(document.activeElement === f.after && !f.root.hasAttribute('data-menu-ready'), 'disposed controller stole application focus');
  }]),
  ...['root', 'submenu'].map((scope) => [`closing ${scope} beforetoggle opener replacement returns to its current owner`, async (f) => {
    f.api.open(); if (scope === 'submenu') f.sub.click(); const list = scope === 'root' ? f.menu : f.root.querySelector('[data-menu] [data-menu]'); let next;
    list.addEventListener('beforetoggle', () => {
      next = document.createElement('button'); next.type = 'button'; next.textContent = scope === 'root' ? 'Actions' : 'Export';
      if (scope === 'root') { next.dataset.menuTrigger = ''; f.trigger.replaceWith(next); }
      else { next.dataset.menuSubmenu = ''; next.setAttribute('aria-controls', list.id); f.sub.replaceWith(next); }
    }, { once: true });
    if (scope === 'root') f.api.close(true); else key(list.querySelector('button'), 'Escape');
    assert(document.activeElement === next && next.getAttribute('aria-expanded') === 'false', 'closing morph returned to stale opener');
    await settle(); assert(document.activeElement === next && f.api.state.depth === (scope === 'root' ? 0 : 1), 'closing morph lost focus or kept wrong levels');
  }]),
  ...['inert', 'aria-hidden'].map((change) => [`beforetoggle ${change} keeps native context activation available`, async (f) => {
    f.menu.addEventListener('beforetoggle', () => { if (change === 'inert') f.root.inert = true; else f.root.setAttribute('aria-hidden', 'true'); }, { once: true });
    const event = new MouseEvent('contextmenu', { bubbles: true, composed: true, cancelable: true }); f.context.querySelector('p').dispatchEvent(event);
    assert(!event.defaultPrevented && !f.api.state.open && !f.menu.matches(':popover-open'), 'unusable transition suppressed native context behavior');
  }]),
  ...['details', 'dialog'].flatMap((tag) => ['shadow', 'nested', 'slot'].map((shape) => [`native ${tag} composed ${shape} ancestors reject enhancement without changing markup`, async (f) => {
    f.api.dispose(); const host = document.createElement('div'); fixtures.append(host); const tree = host.attachShadow({ mode: 'open' }); const native = document.createElement(tag);
    if (tag === 'details') { native.open = true; const summary = document.createElement('summary'); summary.textContent = 'Native disclosure'; native.append(summary); }
    if (shape === 'slot') { tree.append(native); const slot = document.createElement('slot'); native.append(slot); host.append(f.root); }
    else { host.replaceWith(native); native.append(host); if (shape === 'nested') { const inner = document.createElement('div'); tree.append(inner); inner.attachShadow({ mode: 'open' }).append(f.root); } else tree.append(f.root); }
    if (tag === 'dialog') native.show(); const authored = f.root.outerHTML; let api; let rejected = false;
    try { try { api = createActionMenu({ root: f.root }); } catch { rejected = true; }
      assert(rejected && f.root.outerHTML === authored && !f.root.hasAttribute('data-menu-ready'), 'native composed container was enhanced or authored markup changed');
    } finally { api?.dispose(); if (tag === 'dialog') native.close(); native.remove(); host.remove(); }
  }])),
  ...['details', 'dialog'].map((tag) => [`moving an open shadow menu into native ${tag} disposes its enhancement`, async (f) => {
    f.api.dispose(); const host = document.createElement('div'); fixtures.append(host); host.attachShadow({ mode: 'open' }).append(f.root); const api = createActionMenu({ root: f.root }); const native = document.createElement(tag); fixtures.append(native);
    if (tag === 'details') { native.open = true; const summary = document.createElement('summary'); summary.textContent = 'Native disclosure'; native.append(summary); } else native.show();
    try { api.open(); assert(api.state.open, 'control did not open before move'); native.append(host); await settle();
      assert(api.state.disposed && !f.root.hasAttribute('data-menu-ready') && !f.menu.matches(':popover-open'), 'native composed move retained enhancement');
    } finally { api.dispose(); if (tag === 'dialog') native.close(); native.remove(); host.remove(); }
  }]),
  ...['keyboard', 'pointer'].flatMap((activation) => ['Escape', 'ArrowLeft'].map((back) => [`typeahead resets on ${activation} submenu entry and ${back} return`, async (f) => {
    const child = f.root.querySelector('[data-menu] [data-menu]');
    const row = document.createElement('li'); row.innerHTML = '<button data-menu-action="csv" type="button">CSV</button>'; child.prepend(row); await settle();
    f.api.open(); key(f.alpha, 'e'); assert(document.activeElement === f.sub, 'parent typeahead did not select opener');
    if (activation === 'keyboard') key(f.sub, 'ArrowRight'); else f.sub.click();
    assert(document.activeElement === row.firstElementChild, 'child entry did not establish a distinct starting item');
    key(row.firstElementChild, 'p'); assert(document.activeElement.dataset.menuAction === 'pdf', 'parent query leaked into child');
    key(document.activeElement, back); assert(document.activeElement === f.sub, 'submenu did not return to opener');
    key(f.sub, 'z'); assert(document.activeElement === f.zulu, 'child query leaked into parent');
  }])),
  ...[2, 3].flatMap((depth) => ['item', 'template'].map((change) => [`${depth} open shadow boundaries recover focus after ${change} replacement`, async (f) => {
    f.api.dispose(); const host = document.createElement('div'); fixtures.append(host); let tree = host.attachShadow({ mode: 'open' });
    for (let level = 1; level < depth; level++) { const inner = document.createElement('div'); tree.append(inner); tree = inner.attachShadow({ mode: 'open' }); }
    tree.append(f.root); const api = createActionMenu({ root: f.root });
    try {
      api.open(); assert(tree.activeElement === f.alpha, 'nested initial focus');
      if (change === 'item') { f.alpha.parentElement.remove(); await settle(); assert(tree.activeElement === f.sub && api.state.open, 'nested item removal lost owned focus'); }
      else { f.menu.replaceWith(replacement(f)); await settle(); assert(tree.activeElement === f.trigger && !api.state.open, 'nested template replacement lost focus return'); }
    } finally { api.dispose(); host.remove(); }
  }])),
  ...['button', 'context'].map((activation) => [`idle ${activation} menus avoid repeated placement work with a live measurement control`, async (f) => {
    f.api.open({ activation, at: activation === 'context' ? { x: 180, y: 140 } : null }); for (let frame = 0; frame < 4; frame++) await settle();
    const native = f.menu.getBoundingClientRect; const owned = Object.hasOwn(f.menu, 'getBoundingClientRect'); let measurements = 0;
    f.menu.getBoundingClientRect = function () { measurements++; return native.call(this); };
    try {
      for (let frame = 0; frame < 4; frame++) await settle(); assert(measurements === 0, 'idle placement recalculated');
      window.dispatchEvent(new Event('resize')); await settle(); assert(measurements > 0, 'measurement control did not observe actual placement');
    } finally { if (owned) f.menu.getBoundingClientRect = native; else delete f.menu.getBoundingClientRect; }
  }]),
  ...['inline', 'padding'].map((shape) => [`placement follows ${shape} sibling changes without ancestor resizing`, async (f) => {
    f.context.style.cssText = 'position:fixed;left:20px;top:20px;width:800px;height:300px';
    const paragraph = f.context.querySelector('p'); let sibling;
    if (shape === 'inline') { paragraph.replaceChildren(); sibling = document.createElement('strong'); sibling.textContent = 'Ann '; paragraph.append(sibling, f.root); f.root.style.display = 'inline-block'; }
    else sibling = paragraph;
    f.api.open(); for (let frame = 0; frame < 4; frame++) await settle();
    const before = f.trigger.getBoundingClientRect(), old = f.menu.getBoundingClientRect();
    if (shape === 'inline') sibling.firstChild.data = 'A member with a much longer name '; else sibling.style.paddingBottom = '48px';
    await settle(); const after = f.trigger.getBoundingClientRect(), popup = f.menu.getBoundingClientRect(); const axis = shape === 'inline' ? 'left' : 'bottom'; const menuAxis = shape === 'inline' ? 'left' : 'top';
    assert(after[axis] > before[axis] + 10, 'sibling change did not move trigger');
    assert(Math.abs((popup[menuAxis] - after[axis]) - (old[menuAxis] - before[axis])) < 1, 'sibling placement stayed stale');
  }]),
  ['placement follows direct shadow-root sibling text inside a fixed-size host', async (f) => {
    f.api.dispose(); const host = document.createElement('div'); host.style.cssText = 'position:fixed;left:20px;top:20px;width:400px;height:200px'; fixtures.append(host); const tree = host.attachShadow({ mode: 'open' }); const paragraph = document.createElement('p'); paragraph.style.cssText = 'white-space:pre;margin:0'; paragraph.textContent = 'Text'; f.menu.style.cssText = 'margin:0;inset:auto'; tree.append(paragraph, f.root); const api = createActionMenu({ root: f.root });
    try {
      api.open(); for (let frame = 0; frame < 4; frame++) await settle(); const before = f.trigger.getBoundingClientRect(), old = f.menu.getBoundingClientRect();
      paragraph.firstChild.data = 'Text\nText\nText'; await settle(); const after = f.trigger.getBoundingClientRect(), popup = f.menu.getBoundingClientRect();
      assert(after.bottom > before.bottom + 10, 'shadow sibling did not move trigger');
      assert(Math.abs((popup.top - after.bottom) - (old.top - before.bottom)) < 1, 'shadow sibling placement stayed stale');
    } finally { api.dispose(); host.remove(); }
  }],
  ['placement follows an inserted ancestor sibling and its later resize', async (f) => {
    f.context.style.cssText = 'position:fixed;left:20px;top:20px;width:800px;height:300px'; f.api.open(); for (let frame = 0; frame < 4; frame++) await settle();
    const gap = f.menu.getBoundingClientRect().top - f.trigger.getBoundingClientRect().bottom; const sibling = document.createElement('div'); sibling.style.height = '20px'; f.root.before(sibling); await settle();
    for (const height of [20, 80]) { sibling.style.height = `${height}px`; await settle(); assert(Math.abs(f.menu.getBoundingClientRect().top - f.trigger.getBoundingClientRect().bottom - gap) < 1, 'new sibling placement stale'); }
  }],
  ['closed menus follow moved open-shadow hosts and dispose after removal', async (f) => {
    f.api.dispose(); const a = document.createElement('section'), b = document.createElement('section'), host = document.createElement('div'); fixtures.append(a, b); a.append(host); host.attachShadow({ mode: 'open' }).append(f.root);
    const api = createActionMenu({ root: f.root });
    try {
      b.append(host); await settle(); host.remove(); await settle();
      assert(api.state.disposed && !f.root.hasAttribute('data-menu-ready'), 'moved host removal retained controller');
      b.append(host); const again = createActionMenu({ root: f.root }); again.dispose();
    } finally { api.dispose(); a.remove(); b.remove(); }
  }],
  ...['slot', 'wrapper'].map((removed) => [`removing the assigned ${removed} dismisses a slotted open menu`, async (f) => {
    f.api.dispose(); const host = document.createElement('div'); fixtures.append(host); const tree = host.attachShadow({ mode: 'open' }); tree.innerHTML = '<div><slot></slot></div>'; host.append(f.root); const api = createActionMenu({ root: f.root });
    try {
      api.open(); await settle(); assert(api.state.open, 'slotted menu did not open');
      tree.querySelector(removed === 'slot' ? 'slot' : 'div').remove(); await settle();
      assert(!api.state.open && !f.menu.matches(':popover-open') && f.trigger.getAttribute('aria-expanded') === 'false', 'removed composed ancestor retained overlay');
    } finally { api.dispose(); host.remove(); }
  }]),
  ['menu padding and separators retain native context behavior', async (f) => {
    const row = document.createElement('li'); row.innerHTML = '<hr>'; f.menu.append(row); await settle(); f.api.open();
    for (const node of [row.firstElementChild, f.menu]) {
      const event = new MouseEvent('contextmenu', { bubbles: true, composed: true, cancelable: true }); node.dispatchEvent(event);
      assert(!event.defaultPrevented && f.api.state.open, 'own menu surface started enclosing context intent');
    }
  }],
  ['anchor tracking releases its frame on close, native move and dispose', async (f) => {
    f.api.dispose(); const nativeFrame = window.requestAnimationFrame, nativeCancel = window.cancelAnimationFrame, pending = new Set();
    window.requestAnimationFrame = (callback) => { const id = nativeFrame((time) => { pending.delete(id); callback(time); }); pending.add(id); return id; };
    window.cancelAnimationFrame = (id) => { pending.delete(id); nativeCancel(id); };
    const api = createActionMenu({ root: f.root }); const next = document.createElement('section'); fixtures.append(next);
    try {
      assert(pending.size === 0, 'closed menu retained tracking'); api.open(); assert(pending.size > 0, 'open menu did not track its anchor');
      api.close(); assert(pending.size === 0, 'close retained tracking');
      api.open(); next.append(f.root); await new Promise((resolve) => nativeFrame(() => nativeFrame(resolve))); assert(!api.state.open && pending.size === 0, 'native move retained tracking');
      api.open(); assert(pending.size > 0, 'reopened menu did not resume tracking'); api.dispose(); assert(pending.size === 0, 'dispose retained tracking');
    } finally { api.dispose(); window.requestAnimationFrame = nativeFrame; window.cancelAnimationFrame = nativeCancel; next.remove(); }
  }],
  ['repeated context gestures refresh intent, authorized markup and position', async (f) => {
    f.api.open(); f.sub.click(); const child = f.root.querySelector('[data-menu]:popover-open [data-menu]:popover-open');
    let detail, action;
    f.context.dataset.contextId = 'fresh-context';
    f.root.addEventListener('lw:menu-context', (event) => { detail = event.detail; f.menu.replaceWith(replacement(f)); }, { once: true });
    f.root.addEventListener('lw:menu-action', (event) => { action = event.detail; event.preventDefault(); });
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 180, clientY: 140 });
    f.context.querySelector('p').dispatchEvent(event);
    const next = f.root.querySelector('[data-menu]'), rect = next.getBoundingClientRect();
    assert(event.defaultPrevented && detail?.source === 'context' && detail.contextId === 'fresh-context', 'stale context intent');
    assert(f.api.state.depth === 1 && !f.menu.matches(':popover-open') && !child.matches(':popover-open'), 'prior overlays survived');
    assert(rect.left >= 175 && rect.left <= 185 && rect.top >= 140 && rect.top <= 155, 'context coordinates not refreshed');
    next.querySelector('[data-menu-action]').click(); assert(action.contextId === 'fresh-context', 'stale action context');
  }],
  ['cancelled repeated context restores native behavior and closes prior overlays', async (f) => {
    f.api.open(); f.root.addEventListener('lw:menu-context', (event) => event.preventDefault(), { once: true });
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); f.context.querySelector('p').dispatchEvent(event);
    assert(!event.defaultPrevented && !f.api.state.open && !f.menu.matches(':popover-open'), 'cancelled refresh kept stale menu');
  }],
  ['unrelated subtree updates do not notify menu observers', async (f) => {
    f.api.dispose(); const unrelated = document.createElement('div'); fixtures.append(unrelated);
    const ancestorText = document.createTextNode(''); f.context.prepend(ancestorText);
    const NativeObserver = window.MutationObserver; let deliveries = 0;
    window.MutationObserver = class extends NativeObserver { constructor(callback) { super((records, observer) => { deliveries++; callback(records, observer); }); } };
    const api = createActionMenu({ root: f.root, contextTarget: f.context }); window.MutationObserver = NativeObserver;
    try {
      for (const open of [false, true]) {
        if (open) api.open(); await settle(); deliveries = 0;
        unrelated.innerHTML = '<span>Update</span>'; unrelated.firstElementChild.className = 'new'; unrelated.firstElementChild.firstChild.data = 'Changed';
        await settle(); assert(deliveries === 0, 'unrelated mutations fanned out');
      }
      f.context.inert = true; await settle(); assert(deliveries > 0 && !api.state.open, 'relevant ancestor update was missed');
      deliveries = 0; ancestorText.data = ' '; await settle(); assert(deliveries === 0, 'closed menu retained ancestor text observation');
    } finally { window.MutationObserver = NativeObserver; api.dispose(); unrelated.remove(); }
  }],
  ['focus inside the same open shadow tree dismisses on ordinary controls', async (f) => {
    f.api.dispose(); const host = document.createElement('div'); fixtures.append(host); const tree = host.attachShadow({ mode: 'open' }); tree.append(f.root); const input = document.createElement('input'); input.setAttribute('aria-label', 'Other shadow field'); f.root.append(input); const api = createActionMenu({ root: f.root });
    try { api.open(); assert(tree.activeElement === f.alpha, 'shadow action did not focus'); input.focus(); assert(!api.state.open && tree.activeElement === input, 'same-tree focus failed to dismiss or was stolen'); }
    finally { api.dispose(); host.remove(); }
  }],
  ['pointer boundaries preserve menu and trigger events and dismiss other controls', async (f) => {
    const input = document.createElement('input'); f.root.append(input); await settle();
    const pointer = (node) => { const event = new PointerEvent('pointerdown', { bubbles: true, composed: true, cancelable: true }); node.dispatchEvent(event); assert(!event.defaultPrevented, 'pointer default intercepted'); };
    f.api.open(); pointer(f.alpha); assert(f.api.state.open, 'menu pointer dismissed'); pointer(f.trigger); assert(f.api.state.open, 'trigger pointer dismissed before click');
    pointer(input); assert(!f.api.state.open && !input.hasAttribute('role'), 'in-root ordinary pointer failed to dismiss');
    f.api.open(); pointer(f.after); assert(!f.api.state.open, 'outside pointer failed to dismiss');
  }],
  ...[false, true].map((marked) => [`nested ${marked ? 'marked' : 'unmarked'} controls cannot bypass menu rows`, async (f) => {
    f.api.dispose(); const list = document.createElement('ul'); list.innerHTML = `<li><a ${marked ? 'data-menu-action="extra"' : ''} href="#">Extra</a></li>`; f.alpha.parentElement.append(list);
    let rejected = false; try { createActionMenu({ root: f.root }); } catch (error) { rejected = error instanceof TypeError; }
    assert(rejected && !f.root.hasAttribute('data-menu-ready'), 'nested action escaped row validation');
  }]),
  ['rows that become ordinary root content release menu semantics', async (f) => {
    f.api.open(); await settle(); const outside = document.createElement('div'); f.root.append(outside); const row = f.zulu.parentElement; f.zulu.removeAttribute('data-menu-action'); outside.append(row); await settle();
    assert(!f.api.state.disposed && !row.hasAttribute('role') && !f.zulu.hasAttribute('role') && !f.zulu.hasAttribute('tabindex'), 'departed row kept menu semantics');
    f.api.dispose(); assert(!f.zulu.hasAttribute('role'), 'dispose re-owned departed action');
  }],
  ['ordinary controls inside the stable root keep native focus and dismiss the menu', async (f) => {
    const input = document.createElement('input'); input.setAttribute('aria-label', 'Other root field'); f.root.append(input); await settle(); f.api.open(); input.focus();
    assert(document.activeElement === input && !f.api.state.open && !input.hasAttribute('role'), 'ordinary control focus intercepted or menu retained');
  }],
  ['immediate root cleanup preserves new application expanded state', async (f) => {
    f.api.open(); f.trigger.setAttribute('aria-haspopup', 'dialog'); f.trigger.setAttribute('aria-expanded', 'false'); f.api.dispose();
    assert(f.trigger.getAttribute('aria-haspopup') === 'dialog' && f.trigger.getAttribute('aria-expanded') === 'false', 'root cleanup overwrote new application ARIA');
  }],
  ['initial runtime ready hooks are cleared when ownership ends', async (f) => {
    f.api.dispose(); f.root.dataset.menuReady = 'true'; const api = createActionMenu({ root: f.root }); api.dispose();
    assert(!f.root.hasAttribute('data-menu-ready'), 'initial runtime hook survived disposal');
  }],
  ['removed actions preserve new application ARIA during detached cleanup', async (f) => {
    f.api.open(); await settle(); f.sub.setAttribute('aria-haspopup', 'dialog'); f.sub.removeAttribute('data-menu-submenu'); f.sub.dataset.menuAction = 'dialog';
    const row = f.sub.parentElement; row.remove(); await settle();
    assert(f.sub.getAttribute('aria-haspopup') === 'dialog' && !f.sub.hasAttribute('role'), 'detached cleanup overwrote application ARIA or kept semantics');
    f.api.dispose(); assert(f.sub.getAttribute('aria-haspopup') === 'dialog', 'dispose revisited released detached node');
  }],
  ['child levels moved outside the root lose adapter ownership', async (f) => {
    f.api.open(); f.sub.click(); await settle(); f.alpha.focus(); const child = f.root.querySelector(`#${f.sub.getAttribute('aria-controls')}`), row = f.sub.parentElement;
    const external = document.createElement('ul'); external.className = 'menu'; external.dataset.menu = ''; external.style.cssText = 'display:block;opacity:1;visibility:visible;position:static;transform:none'; fixtures.append(external); const externalRow = document.createElement('li'); external.append(externalRow); externalRow.append(f.sub, child);
    const replacement = document.createElement('button'); replacement.type = 'button'; replacement.dataset.menuAction = 'new'; replacement.textContent = 'New action'; row.append(replacement);
    child.style.opacity = '1'; child.style.visibility = 'visible'; child.showPopover(); await settle();
    assert(f.api.state.depth === 1 && !child.matches(':popover-open') && document.activeElement === f.alpha, 'outside cleanup moved retained focus or kept a child');
    assert(!f.sub.hasAttribute('aria-expanded') && !child.hasAttribute('popover'), 'outside child kept adapter semantics'); external.remove();
  }],
  ...[false, true].map((open) => [`unmarked lists cannot introduce child-menu owners ${open ? 'while open' : 'at setup'}`, async (f) => {
    if (open) { f.api.open(); f.sub.click(); await settle(); } else f.api.dispose();
    const plain = document.createElement('ul'); plain.innerHTML = '<li><button data-menu-submenu aria-controls="unmarked-owner-child">Other export</button><ul class="menu" id="unmarked-owner-child" data-menu><li><button data-menu-action="extra">Extra</button></li></ul></li>'; f.sub.parentElement.append(plain);
    if (open) { await settle(); assert(f.api.state.disposed && !f.root.querySelector(':popover-open'), 'unmarked owner retained active controller'); }
    else { let rejected = false; try { createActionMenu({ root: f.root }); } catch (error) { rejected = error instanceof TypeError; } assert(rejected, 'unmarked owner accepted'); }
    assert(!f.root.hasAttribute('data-menu-ready'), 'unmarked owner retained enhancement');
  }]),
  ...['dispose', 'trigger replacement'].map((mode) => [`same-task action conversion preserves application ARIA on ${mode}`, async (f) => {
    f.api.open(); f.sub.click(); await settle();
    f.root.querySelector(`#${f.sub.getAttribute('aria-controls')}`).remove(); f.sub.removeAttribute('data-menu-submenu'); f.sub.removeAttribute('aria-controls'); f.sub.dataset.menuAction = 'dialog'; f.sub.setAttribute('aria-haspopup', 'dialog'); f.sub.setAttribute('aria-expanded', 'false');
    if (mode === 'dispose') f.api.dispose();
    else { const next = document.createElement('button'); next.type = 'button'; next.dataset.menuTrigger = ''; next.textContent = 'Updated actions'; f.trigger.replaceWith(next); }
    await settle(); assert(f.sub.getAttribute('aria-haspopup') === 'dialog' && f.sub.getAttribute('aria-expanded') === 'false', 'full restore lost new application ARIA');
    assert(!f.root.querySelector(':popover-open'), 'cleanup retained overlay');
  }]),
  ['dispose clears its runtime ready hook even if its value was changed', async (f) => {
    f.root.setAttribute('data-menu-ready', 'true'); f.api.dispose();
    assert(!f.root.hasAttribute('data-menu-ready') && !f.menu.hasAttribute('popover'), 'dispose retained runtime enhancement hook');
  }],
  ...[false, true].flatMap((open) => [false, true].map((wrapped) => [`uncontrolled ${wrapped ? 'wrapped' : 'sibling'} submenus reject ${open ? 'an open morph' : 'setup'}`, async (f) => {
    if (open) { f.api.open(); f.sub.click(); await settle(); } else f.api.dispose();
    const extra = document.createElement('ul'); extra.className = 'menu'; extra.dataset.menu = ''; extra.id = 'uncontrolled-submenu'; extra.innerHTML = '<li><button data-menu-action="extra">Extra</button></li>';
    const insertion = wrapped ? document.createElement('div') : extra; if (wrapped) insertion.append(extra); f.sub.parentElement.append(insertion);
    if (open) { await settle(); assert(f.api.state.disposed && !f.root.querySelector(':popover-open'), 'uncontrolled child retained overlay'); }
    else { let rejected = false; try { createActionMenu({ root: f.root }); } catch (error) { rejected = error instanceof TypeError; } assert(rejected, 'uncontrolled submenu accepted'); }
    assert(!f.root.hasAttribute('data-menu-ready') && !extra.hasAttribute('popover'), 'unowned submenu enhanced');
  }])),
  ...[false, true].map((open) => [`submenu conversion preserves new application ARIA ${open ? 'while open' : 'while closed'}`, async (f) => {
    if (open) { f.api.open(); f.sub.click(); } await settle();
    f.root.querySelector(`#${f.sub.getAttribute('aria-controls')}`).remove(); f.sub.removeAttribute('data-menu-submenu'); f.sub.removeAttribute('aria-controls'); f.sub.dataset.menuAction = 'dialog';
    const expanded = open ? 'false' : 'true'; f.sub.setAttribute('aria-haspopup', 'dialog'); f.sub.setAttribute('aria-expanded', expanded); await settle();
    assert(f.sub.getAttribute('aria-haspopup') === 'dialog' && f.sub.getAttribute('aria-expanded') === expanded, 'release overwrote new application ARIA');
    f.api.dispose(); assert(f.sub.getAttribute('aria-haspopup') === 'dialog' && f.sub.getAttribute('aria-expanded') === expanded, 'dispose reverted released application ARIA');
  }]),
  ['retained child menus drop replaced opener ownership before releasing ARIA', async (f) => {
    f.api.open(); f.sub.click(); await settle();
    const child = f.root.querySelector(`#${f.sub.getAttribute('aria-controls')}`), row = f.sub.parentElement;
    const next = document.createElement('button'); next.type = 'button'; next.dataset.menuSubmenu = ''; next.setAttribute('aria-controls', child.id); next.textContent = 'Updated export'; row.prepend(next);
    const actionRow = document.createElement('li'); actionRow.append(f.sub); f.menu.append(actionRow); f.sub.removeAttribute('data-menu-submenu'); f.sub.removeAttribute('aria-controls'); f.sub.dataset.menuAction = 'converted'; await settle();
    assert(f.api.state.depth === 1 && !child.matches(':popover-open') && document.activeElement === f.sub, 'child retained its former opener');
    assert(!f.sub.hasAttribute('aria-expanded') && !f.sub.hasAttribute('aria-haspopup') && next.getAttribute('aria-expanded') === 'false', 'stale owner restored submenu ARIA');
    next.click(); assert(f.api.state.depth === 2 && next.getAttribute('aria-expanded') === 'true', 'new opener cannot own child');
    key(child.querySelector('[data-menu-action]'), 'Escape'); assert(document.activeElement === next && f.api.state.depth === 1, 'submenu returned to former opener');
    f.api.dispose(); assert(!f.sub.hasAttribute('aria-expanded') && !next.hasAttribute('aria-expanded'), 'dispose left untracked expanded state');
  }],
  ...[false, true].map((open) => [`wrapped menus outside the selected tree reject ${open ? 'an open morph' : 'initial setup'}`, async (f) => {
    if (open) { f.api.open(); f.sub.click(); await settle(); } else f.api.dispose();
    const wrapper = document.createElement('div'); wrapper.innerHTML = '<ul class="menu" id="wrapped-extra-menu" data-menu><li><button data-menu-action="extra" type="button">Extra</button></li></ul>'; f.root.append(wrapper);
    if (open) {
      await settle(); assert(f.api.state.disposed && !f.root.querySelector(':popover-open'), 'wrapped morph retained active overlays');
    } else {
      let rejected = false; try { createActionMenu({ root: f.root }); } catch (error) { rejected = error instanceof TypeError; }
      assert(rejected, 'wrapped menu accepted at setup');
    }
    assert(!f.root.hasAttribute('data-menu-ready') && !wrapper.firstElementChild.hasAttribute('popover'), 'unowned wrapped menu enhanced');
  }]),
  ...[false, true].map((open) => [`submenu-to-action updates release submenu ARIA ${open ? 'while open' : 'while closed'}`, async (f) => {
    if (open) { f.api.open(); f.sub.click(); } await settle();
    f.root.querySelector(`#${f.sub.getAttribute('aria-controls')}`).remove();
    f.sub.removeAttribute('data-menu-submenu'); f.sub.removeAttribute('aria-controls'); f.sub.dataset.menuAction = 'converted'; await settle();
    assert(!f.sub.hasAttribute('aria-haspopup') && !f.sub.hasAttribute('aria-expanded'), 'action kept adapter submenu ARIA');
    assert(!f.api.state.disposed && f.api.state.depth === (open ? 1 : 0), 'valid conversion disposed or retained child');
    if (!open) f.api.open(); f.sub.focus(); key(f.sub, 'ArrowRight'); assert(f.api.state.depth === 1, 'converted action opens stale submenu');
    let action; f.root.addEventListener('lw:menu-action', (event) => { action = event.detail.action; }, { once: true }); f.sub.click();
    assert(action === 'converted' && !f.api.state.open, 'converted action did not execute intent');
  }]),
  ['submenu attribute release preserves authored values across role changes', async (f) => {
    f.api.dispose(); f.sub.setAttribute('aria-haspopup', 'false'); f.sub.setAttribute('aria-expanded', 'false');
    const api = createActionMenu({ root: f.root });
    try {
      const child = f.root.querySelector(`#${f.sub.getAttribute('aria-controls')}`); child.remove(); f.sub.removeAttribute('data-menu-submenu'); f.sub.dataset.menuAction = 'converted'; await settle();
      assert(f.sub.getAttribute('aria-haspopup') === 'false' && f.sub.getAttribute('aria-expanded') === 'false', 'authored ARIA overwritten during release');
      delete f.sub.dataset.menuAction; f.sub.dataset.menuSubmenu = ''; f.sub.parentElement.append(child); await settle();
      assert(f.sub.getAttribute('aria-haspopup') === 'menu' && f.sub.getAttribute('aria-expanded') === 'false', 'submenu restoration lost enhancement');
    } finally { api.dispose(); }
    assert(f.sub.getAttribute('aria-haspopup') === 'false' && f.sub.getAttribute('aria-expanded') === 'false', 'reattached submenu lost authored values on dispose');
  }],
  ...['trigger', 'menu'].map((kind) => [`duplicate direct ${kind} rejects initial enhancement`, async (f) => {
    f.api.dispose(); const duplicate = (kind === 'trigger' ? f.trigger : f.menu).cloneNode(true); f.root.append(duplicate);
    let rejected = false; try { createActionMenu({ root: f.root }); } catch (error) { rejected = error instanceof TypeError; }
    assert(rejected && !f.root.hasAttribute('data-menu-ready'), 'duplicate direct markup enhanced');
    assert(!f.trigger.hasAttribute('aria-expanded') && !f.menu.hasAttribute('popover') && !duplicate.hasAttribute('popover'), 'invalid setup changed native markup');
  }]),
  ...['trigger', 'menu'].map((kind) => [`duplicate direct ${kind} added while open disposes all levels`, async (f) => {
    f.api.open(); f.sub.click(); await settle();
    const duplicate = kind === 'trigger' ? document.createElement('button') : replacement(f);
    if (kind === 'trigger') { duplicate.type = 'button'; duplicate.dataset.menuTrigger = ''; duplicate.textContent = 'Duplicate actions'; }
    f.root.append(duplicate); await settle();
    assert(f.api.state.disposed && !f.api.state.open && !f.root.querySelector(':popover-open'), 'duplicate morph left active overlay');
    assert(!f.root.hasAttribute('data-menu-ready') && !f.trigger.hasAttribute('aria-expanded') && !f.api.open(), 'duplicate morph retained enhancement');
    f.trigger.click(); assert(!f.root.querySelector(':popover-open'), 'duplicate morph retained trigger listener');
  }]),
  ...[false, true].map((open) => [`removing the root marker ${open ? 'while open' : 'while closed'} disposes enhancement`, async (f) => {
    if (open) { f.api.open(); f.sub.click(); } await settle();
    f.root.removeAttribute('data-action-menu'); await settle();
    assert(f.api.state.disposed && !f.api.state.open && !f.root.querySelector(':popover-open'), 'marker removal retained overlay');
    assert(!f.root.hasAttribute('data-menu-ready') && !f.trigger.hasAttribute('aria-expanded') && !f.menu.hasAttribute('popover'), 'marker removal retained semantics');
    f.trigger.click(); assert(!f.api.open() && !f.root.querySelector(':popover-open'), 'marker removal retained listener');
    f.root.dataset.actionMenu = ''; const next = createActionMenu({ root: f.root });
    try { assert(next.open(), 'marker restoration cannot attach a new controller'); } finally { next.dispose(); }
  }]),
  ...[false, true].map((fixed) => [`text-only server morphs keep an open popup aligned inside ${fixed ? 'fixed' : 'growing'} ancestors`, async (f) => {
    f.context.style.cssText = `position: fixed; left: 20px; top: 20px; ${fixed ? 'width:400px;height:200px' : ''}`;
    const paragraph = f.context.querySelector('p'); paragraph.style.cssText = 'white-space: pre; margin: 0';
    f.api.open(); for (let frame = 0; frame < 4; frame++) await settle();
    const beforeTrigger = f.trigger.getBoundingClientRect(), beforeMenu = f.menu.getBoundingClientRect();
    paragraph.firstChild.data = 'Context\nContext\nContext ';
    await settle();
    const afterTrigger = f.trigger.getBoundingClientRect(), afterMenu = f.menu.getBoundingClientRect();
    assert(afterTrigger.bottom > beforeTrigger.bottom + 10, 'text morph did not move the fixture trigger');
    assert(Math.abs((afterMenu.top - afterTrigger.bottom) - (beforeMenu.top - beforeTrigger.bottom)) < 1, 'popup stayed at stale text layout');
    assert(f.api.state.open && document.activeElement === f.alpha, 'text update changed open state or focus');
  }]),
  ['action-driven trigger replacement returns focus to the resolved button', async (f) => {
    f.root.addEventListener('lw:menu-action', () => {
      f.root.innerHTML = `<button class="button trigger" data-menu-trigger type="button">Updated actions</button>${f.markup}`;
    }, { once: true });
    f.api.open(); f.alpha.click(); await settle();
    const next = f.root.querySelector('[data-menu-trigger]');
    assert(document.activeElement === next && next.isConnected && !f.api.state.open, 'action update lost focus return');
    assert(next.getAttribute('aria-expanded') === 'false' && f.api.open(), 'updated trigger cannot reopen');
  }],
  ['API focus return resolves a synchronously replaced trigger', async (f) => {
    f.api.open(); const next = document.createElement('button'); next.type = 'button'; next.dataset.menuTrigger = ''; next.textContent = 'Updated actions'; next.className = f.trigger.className;
    f.trigger.replaceWith(next); f.api.close(true); await settle();
    assert(document.activeElement === next && !f.api.state.open && next.getAttribute('aria-expanded') === 'false', 'API close lost current trigger');
  }],
  ['action updates preserve focus deliberately moved outside', async (f) => {
    f.root.addEventListener('lw:menu-action', () => {
      f.after.focus(); f.root.innerHTML = `<button class="button trigger" data-menu-trigger type="button">Updated actions</button>${f.markup}`;
    }, { once: true });
    f.api.open(); f.alpha.click(); await settle();
    assert(document.activeElement === f.after && !f.api.state.open, 'action update stole external focus');
  }],
  ['explicit context targets ignore protected ancestors outside their boundary', async (f) => {
    f.api.dispose(); f.context.contentEditable = 'false';
    const api = createActionMenu({ root: f.root, contextTarget: f.after });
    try {
      const event = new MouseEvent('contextmenu', { bubbles: true, composed: true, cancelable: true }); f.after.dispatchEvent(event);
      assert(event.defaultPrevented && api.state.open, 'external ancestor blocked the explicit context target');
    } finally { api.dispose(); f.context.removeAttribute('contenteditable'); }
  }],
  ['slot subscriptions follow new trees and release on disposal', async (f) => {
    f.api.dispose();
    const hosts = [document.createElement('div'), document.createElement('div')]; hosts.forEach((host) => fixtures.append(host));
    const counts = [];
    const trees = hosts.map((host) => {
      const tree = host.attachShadow({ mode: 'open' }); tree.innerHTML = '<slot></slot>';
      const count = { added: 0, removed: 0 }; counts.push(count);
      const add = tree.addEventListener, remove = tree.removeEventListener;
      tree.addEventListener = function (...args) { if (args[0] === 'slotchange') count.added++; return add.apply(this, args); };
      tree.removeEventListener = function (...args) { if (args[0] === 'slotchange') count.removed++; return remove.apply(this, args); };
      return tree;
    });
    hosts[0].append(f.root); const api = createActionMenu({ root: f.root });
    try {
      api.open(); hosts[1].append(f.root); await settle();
      assert(counts[0].added === 1 && counts[0].removed === 1 && counts[1].added === 1, 'slot subscriptions retained an old tree');
      api.dispose(); assert(counts[1].removed === 1, 'disposal retained slot subscription');
    } finally {
      api.dispose(); trees.forEach((tree) => { delete tree.addEventListener; delete tree.removeEventListener; }); hosts.forEach((host) => host.remove());
    }
  }],
  ...['input', 'button', 'a', 'div'].map((tag) => [
    `shadow nested ${tag} keeps its native context menu`, async (f) => {
      const host = document.createElement('div'); f.context.append(host);
      const tree = host.attachShadow({ mode: 'open' }); const control = document.createElement(tag);
      if (tag === 'a') control.href = '#';
      if (tag === 'div') control.contentEditable = 'true';
      tree.append(control);
      const event = new MouseEvent('contextmenu', { bubbles: true, composed: true, cancelable: true }); control.dispatchEvent(event);
      assert(!event.defaultPrevented && !f.api.state.open, 'shadow control context intercepted');
    },
  ]),
  ...['hidden', 'inert', 'aria-hidden'].flatMap((attribute) => ['root slot', 'slot name', 'manual slot'].map((change) => [
    `${change} reassignment into ${attribute} closes open levels and recovers`, async (f) => {
      f.api.dispose(); const host = document.createElement('div'); fixtures.append(host);
      const tree = host.attachShadow({ mode: 'open', slotAssignment: change === 'manual slot' ? 'manual' : 'named' });
      tree.innerHTML = '<div><slot name="ready" data-ready></slot></div><div><slot name="blocked" data-blocked></slot></div>';
      const ready = tree.querySelector('[data-ready]'), blocked = tree.querySelector('[data-blocked]');
      blocked.parentElement.setAttribute(attribute, attribute === 'aria-hidden' ? 'true' : '');
      f.root.slot = 'ready'; host.append(f.root);
      if (change === 'manual slot') ready.assign(f.root);
      const api = createActionMenu({ root: f.root });
      try {
        assert(api.open(), 'ready slot cannot open'); f.sub.click(); await settle();
        if (change === 'root slot') f.root.slot = 'blocked';
        else if (change === 'slot name') { ready.name = 'old'; blocked.name = 'ready'; }
        else blocked.assign(f.root);
        await settle();
        assert(!api.state.open && !f.root.querySelector(':popover-open') && f.trigger.getAttribute('aria-expanded') === 'false', 'slot reassignment retained levels or expansion');
        assert(!api.open() && !f.root.contains(document.activeElement), 'unavailable slot retained focus or reopened');
        if (change === 'root slot') f.root.slot = 'ready';
        else if (change === 'slot name') { blocked.name = 'blocked'; ready.name = 'ready'; }
        else ready.assign(f.root);
        await settle(); assert(api.open(), 'available slot cannot recover');
      } finally { api.dispose(); host.remove(); }
    },
  ])),
  ...[
    { root: 'ltr', menu: 'rtl', opener: null, forward: 'ArrowLeft', reverse: 'ArrowRight' },
    { root: 'rtl', menu: 'ltr', opener: null, forward: 'ArrowRight', reverse: 'ArrowLeft' },
    { root: 'ltr', menu: 'ltr', opener: 'rtl', forward: 'ArrowLeft', reverse: 'ArrowLeft' },
    { root: 'rtl', menu: 'rtl', opener: 'ltr', forward: 'ArrowRight', reverse: 'ArrowRight' },
  ].map((direction) => [
    `submenu directions use local menu ${direction.menu} and opener ${direction.opener ?? 'inherited'} inside ${direction.root}`, async (f) => {
      f.root.dir = direction.root; f.menu.dir = direction.menu;
      if (direction.opener) f.sub.dir = direction.opener;
      f.api.open(); key(f.alpha, 'ArrowDown'); key(f.sub, direction.forward);
      const child = f.root.querySelector(`#${f.sub.getAttribute('aria-controls')}`);
      assert(f.api.state.depth === 2 && child.contains(document.activeElement), 'local forward direction did not open child');
      key(document.activeElement, direction.reverse);
      assert(f.api.state.depth === 1 && document.activeElement === f.sub, 'local reverse direction did not return focus');
    },
  ]),
  ...['hidden', 'inert', 'aria-hidden'].map((attribute) => [
    `unavailable submenu ${attribute} stays closed and can recover`, async (f) => {
      const child = f.root.querySelector(`#${f.sub.getAttribute('aria-controls')}`);
      child.setAttribute(attribute, attribute === 'aria-hidden' ? 'true' : '');
      f.api.open(); key(f.alpha, 'ArrowDown'); key(f.sub, 'ArrowRight');
      assert(f.api.state.depth === 1 && !child.matches(':popover-open'), 'unavailable submenu opened');
      assert(f.sub.getAttribute('aria-expanded') === 'false' && document.activeElement === f.sub, 'unavailable submenu changed focus or expanded state');
      child.removeAttribute(attribute); await settle(); key(f.sub, 'ArrowRight');
      assert(f.api.state.depth === 2 && child.matches(':popover-open') && document.activeElement === child.querySelector('[data-menu-action]'), 'available submenu did not recover');
    },
  ]),
  ['synchronous action removal disposes the detached controller', async (f) => {
    f.root.addEventListener('lw:menu-action', () => f.context.remove(), { once: true });
    f.api.open(); f.alpha.click(); await settle();
    assert(f.api.state.disposed && !f.root.hasAttribute('data-menu-ready'), 'action removal retained controller');
    assert(!f.menu.matches(':popover-open'), 'action removal retained overlay');
  }],
  ['synchronous action replacement enhances the new menu after closing', async (f) => {
    const next = replacement(f);
    f.root.addEventListener('lw:menu-action', () => f.menu.replaceWith(next), { once: true });
    f.api.open(); f.alpha.click(); await settle();
    assert(next.getAttribute('popover') === 'manual' && next.getAttribute('role') === 'menu', 'action replacement lost enhancement');
    assert(f.api.open() && next.matches(':popover-open'), 'replacement menu cannot open');
  }],
  ['API close preserves a queued menu replacement', async (f) => {
    f.api.open(); const next = replacement(f); f.menu.replaceWith(next); f.api.close(); await settle();
    assert(f.api.open() && next.matches(':popover-open'), 'API close lost queued replacement');
  }],
  ['closed-shadow menus keep native fallback markup and context behavior', async () => {
    const host = document.createElement('div'); fixtures.append(host);
    const tree = host.attachShadow({ mode: 'closed' }); const f = fixture(tree);
    try {
      assert(!f.api.state.supported && !f.api.open() && !f.root.hasAttribute('data-menu-ready'), 'closed tree enhanced');
      assert(!f.menu.hasAttribute('role') && !f.menu.hasAttribute('popover') && !f.trigger.hasAttribute('aria-expanded'), 'fallback semantics changed');
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); f.context.querySelector('p').dispatchEvent(event);
      assert(!event.defaultPrevented, 'closed-tree native context intercepted');
    } finally { f.remove(); host.remove(); }
  }],
  ['closed menus avoid DOM work on unrelated styles and resizes', async (f) => {
    const external = document.createElement('div'); fixtures.append(external); await settle();
    let reads = 0; const query = f.root.querySelectorAll;
    f.root.querySelectorAll = function (...args) { reads++; return query.apply(this, args); };
    try {
      f.api.open(); await settle(); f.api.close(); await settle();
      assert(reads > 0, 'DOM-work spy did not observe active reconciliation'); reads = 0;
      external.className = 'changed'; external.style.color = 'red'; window.dispatchEvent(new Event('resize')); await settle();
      external.append(document.createElement('span')); await settle();
      assert(reads === 0 && !f.api.state.open, 'closed menu inspected unrelated changes');
    } finally { delete f.root.querySelectorAll; external.remove(); }
  }],
  ['removing a closed root releases its controller', async (f) => {
    f.context.remove(); await settle();
    assert(f.api.state.disposed && !f.root.hasAttribute('data-menu-ready'), 'closed root retained controller');
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
