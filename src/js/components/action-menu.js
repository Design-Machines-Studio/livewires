import { placeMenu, nextMenuIndex, matchingMenuIndex } from './action-menu-state.js';

const instances = new WeakMap();
const controls = ':scope > li > button, :scope > li > a';
const editable = 'input, select, textarea, [contenteditable]:not([contenteditable="false"])';

/** Explicit action-only enhancement. The application owns actions and authorization. */
export function createActionMenu({ root, contextTarget = null }) {
  if (!root?.isConnected || !root.matches?.('[data-action-menu]')) throw new TypeError('A connected data-action-menu root is required.');
  if (instances.has(root)) throw new TypeError('This action menu is already attached.');
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  if (contextTarget && (contextTarget.ownerDocument !== doc || !contextTarget.isConnected)) throw new TypeError('Context target must be connected in the same document.');
  let trigger;
  let menu;
  let disposed = false;
  let levels = [];
  let frame = null;
  let search = '';
  let searchTimer;
  let point = null;
  let source = 'button';
  let contextId = '';
  let changing = false;
  const originals = new Map();
  const unlisten = [];
  const supported = typeof win.HTMLElement.prototype.showPopover === 'function';

  function targets() {
    return { trigger: root.querySelector(':scope > [data-menu-trigger]'), menu: root.querySelector(':scope > [data-menu]') };
  }

  function menusIn(value) { return [value, ...value.querySelectorAll('[data-menu]')]; }
  function itemsIn(value) {
    return [...value.querySelectorAll(controls)].filter((item) => {
      if (!item.isConnected || item.matches(':disabled, [aria-disabled="true"]')) return false;
      for (let node = item; node && node !== value; node = node.parentElement) {
        if (node.hidden || node.inert || node.getAttribute('aria-hidden') === 'true') return false;
      }
      return true;
    });
  }
  function childMenu(item) {
    if (!item?.hasAttribute('data-menu-submenu')) return null;
    return [...item.parentElement.children].find((node) => node.matches('[data-menu]') && node.id === item.getAttribute('aria-controls')) ?? null;
  }

  function validate(next) {
    if (!next.trigger?.matches('button') || !next.menu?.matches('ul.menu') || !next.menu.id) throw new TypeError('Use a direct native button trigger and an identified ul.menu[data-menu].');
    if (root.closest('details, dialog') || root.matches('nav, form') || next.menu.querySelector(`${editable}, form, nav, details, dialog`)) throw new TypeError('Action menus cannot contain form fields, navigation, details or dialogs.');
    const seen = new Set();
    for (const list of menusIn(next.menu)) {
      if (!list.matches('ul.menu') || !list.id || seen.has(list.id)) throw new TypeError('Menus need distinct IDs and ul.menu markup.');
      seen.add(list.id);
      for (const row of list.children) {
        if (!row.matches('li')) throw new TypeError('Menu children must be list items.');
        const actions = [...row.children].filter((node) => node.matches('button, a'));
        if (!actions.length && row.children.length === 1 && row.firstElementChild.matches('hr')) continue;
        if (actions.length !== 1) throw new TypeError('Each action row needs one native button or link.');
        const item = actions[0];
        if (item.querySelector('button, a, input, select, textarea, [contenteditable]')) throw new TypeError('Do not nest controls inside an action.');
        if (item.hasAttribute('data-menu-submenu')) {
          if (!item.matches('button') || !childMenu(item)) throw new TypeError('Submenu buttons must control their sibling menu.');
        } else if (!item.getAttribute('data-menu-action') || row.querySelector('[data-menu]')) throw new TypeError('Actions need a data-menu-action value.');
      }
    }
  }

  function remember(node, name, value) {
    if (!originals.has(node)) originals.set(node, new Map());
    const values = originals.get(node);
    if (!values.has(name)) values.set(name, node.getAttribute(name));
    if (value === null) node.removeAttribute(name);
    else if (node.getAttribute(name) !== String(value)) node.setAttribute(name, String(value));
  }
  function restore() {
    for (const [node, values] of originals) {
      for (const [name, value] of values) {
        if (value === null) node.removeAttribute(name);
        else node.setAttribute(name, value);
      }
    }
    originals.clear();
  }
  function enhance() {
    remember(root, 'data-menu-ready', '');
    remember(trigger, 'type', 'button');
    remember(trigger, 'aria-haspopup', 'menu');
    remember(trigger, 'aria-controls', menu.id);
    remember(trigger, 'aria-expanded', 'false');
    for (const list of menusIn(menu)) {
      remember(list, 'popover', 'manual');
      remember(list, 'role', 'menu');
      remember(list, 'tabindex', '-1');
      for (const row of list.children) {
        remember(row, 'role', 'none');
        for (const item of row.querySelectorAll(':scope > button, :scope > a')) {
          remember(item, 'role', 'menuitem');
          remember(item, 'tabindex', '-1');
          if (item.hasAttribute('data-menu-submenu')) {
            remember(item, 'aria-haspopup', 'menu');
            remember(item, 'aria-expanded', 'false');
          }
        }
      }
    }
  }

  function focus(node) { if (node?.isConnected && !node.matches(':disabled, [hidden], [inert]')) node.focus({ preventScroll: true }); }
  function clearSearch() { search = ''; win.clearTimeout(searchTimer); }
  function closeTo(depth, refocus = false) {
    let last;
    while (levels.length > depth) {
      const level = levels.pop();
      last = level.trigger;
      // Clear local state before native APIs: a morph may have stripped popover.
      if (level.menu.matches(':popover-open')) level.menu.hidePopover();
      level.trigger?.setAttribute('aria-expanded', 'false');
    }
    if (refocus) focus(last);
  }
  function close(refocus = false) {
    clearSearch();
    if (frame !== null) win.cancelAnimationFrame(frame);
    frame = null;
    closeTo(0, refocus);
    point = null;
  }

  function viewport() {
    const visual = win.visualViewport;
    return { left: visual?.offsetLeft ?? 0, top: visual?.offsetTop ?? 0, width: visual?.width ?? win.innerWidth, height: visual?.height ?? win.innerHeight };
  }
  function position() {
    frame = null;
    if (disposed) return;
    const view = viewport();
    const gap = parseFloat(win.getComputedStyle(root).getPropertyValue('--line-025')) || 4;
    levels.forEach((level, index) => {
      if (!level.menu.isConnected || !level.trigger?.isConnected) return;
      const style = level.menu.style;
      remember(level.menu, 'style', level.menu.getAttribute('style'));
      const bounds = index === 0 && point ? { left: point.x, right: point.x, top: point.y, bottom: point.y } : level.trigger.getBoundingClientRect();
      style.maxWidth = `${Math.max(0, view.width - gap * 2)}px`;
      style.maxHeight = `${Math.max(0, view.height - gap * 2)}px`;
      const rect = level.menu.getBoundingClientRect();
      const location = placeMenu(bounds, rect, view, index > 0, win.getComputedStyle(root).direction === 'rtl', gap);
      style.left = `${location.x}px`;
      style.top = `${location.y}px`;
    });
  }
  function schedulePosition() {
    if (levels.length && frame === null) frame = win.requestAnimationFrame(position);
  }
  function show(list, opener, last = false) {
    list.showPopover();
    levels.push({ menu: list, trigger: opener });
    opener.setAttribute('aria-expanded', 'true');
    position();
    const items = itemsIn(list);
    focus(items[last ? items.length - 1 : 0] ?? list);
  }
  function emit(name, detail) {
    return root.dispatchEvent(new win.CustomEvent(name, { bubbles: true, composed: true, cancelable: true, detail }));
  }
  function open({ last = false, at = null, activation = 'button' } = {}) {
    if (disposed || !supported || !trigger.isConnected || trigger.disabled || root.inert || trigger.hidden) return false;
    if (levels.length) { focus(itemsIn(levels[0].menu)[0] ?? menu); return true; }
    contextId = (activation === 'context' ? contextTarget?.dataset.contextId : null) ?? root.dataset.contextId ?? '';
    source = activation;
    if (!emit('lw:menu-context', { trigger, contextTarget, contextId, source })) return false;
    if (disposed || !root.isConnected) return false;
    reconcile(); // Context listeners may replace authorized server markup synchronously.
    if (disposed || !trigger.isConnected || trigger.disabled) return false;
    point = at;
    show(menu, trigger, last);
    return true;
  }
  function openSubmenu(item, last = false) {
    const child = childMenu(item);
    if (!child || !itemsIn(item.closest('[data-menu]')).includes(item)) return;
    const parent = levels.findIndex((level) => level.menu === item.closest('[data-menu]'));
    closeTo(parent + 1);
    show(child, item, last);
  }

  function onClick(event) {
    const target = event.target?.closest?.('button, a');
    if (target === trigger) {
      event.preventDefault();
      if (levels.length) close(true); else open();
      return;
    }
    if (!levels.length || !target || !levels.some((level) => level.menu === target.closest('[data-menu]'))) return;
    if (!itemsIn(target.closest('[data-menu]')).includes(target)) { event.preventDefault(); return; }
    if (target.hasAttribute('data-menu-submenu')) {
      event.preventDefault();
      openSubmenu(target);
    } else {
      const allowed = emit('lw:menu-action', { action: target.dataset.menuAction, contextId, trigger, item: target });
      if (!allowed) event.preventDefault();
      // A synchronous application update may remove the trigger or all markup.
      close(true);
    }
  }
  function onKey(event) {
    if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target === trigger && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault(); open({ last: event.key === 'ArrowUp' }); return;
    }
    const scope = event.target?.closest?.('[data-menu]');
    const depth = levels.findIndex((level) => level.menu === scope);
    if (depth < 0 || event.target.closest(editable)) return;
    if (event.key === 'Tab') { close(true); return; }
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation();
      if (depth > 0) closeTo(depth, true); else close(true);
      return;
    }
    const rtl = win.getComputedStyle(root).direction === 'rtl';
    const item = event.target.closest('button, a');
    if (event.key === (rtl ? 'ArrowLeft' : 'ArrowRight') && childMenu(item)) {
      event.preventDefault(); openSubmenu(item); return;
    }
    if (event.key === (rtl ? 'ArrowRight' : 'ArrowLeft') && depth > 0) {
      event.preventDefault(); closeTo(depth, true); return;
    }
    const items = itemsIn(scope);
    const current = items.indexOf(doc.activeElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      closeTo(depth + 1);
      focus(items[nextMenuIndex(items.length, current, event.key)] ?? scope);
      clearSearch();
    } else if (event.key === ' ' && item?.matches('a')) {
      event.preventDefault(); item.click();
    } else if (event.key.length === 1 && event.key !== ' ') {
      search += event.key;
      win.clearTimeout(searchTimer);
      searchTimer = win.setTimeout(clearSearch, 500);
      const repeated = [...search].every((char) => char === search[0]);
      const index = matchingMenuIndex(items.map((node) => node.textContent), current, repeated ? search[0] : search);
      if (index >= 0) { event.preventDefault(); focus(items[index]); }
    }
  }

  function reconcile() {
    if (disposed || changing) return;
    if (!root.isConnected) { dispose(); return; }
    const next = targets();
    try { validate(next); } catch { dispose(); return; }
    changing = true;
    const replaced = next.trigger !== trigger || next.menu !== menu;
    if (replaced) {
      const ownedFocus = levels.some((level) => level.menu.contains(doc.activeElement)) || (levels.length && doc.activeElement === doc.body);
      close(); restore();
      ({ trigger, menu } = next);
      if (supported) enhance();
      if (ownedFocus) focus(trigger);
    } else if (supported) {
      const invalid = levels.findIndex((level) => !level.menu.isConnected || !level.trigger.isConnected || level.menu.getAttribute('popover') !== 'manual' || (level.trigger !== trigger && !itemsIn(level.trigger.closest('[data-menu]')).includes(level.trigger)));
      if (invalid >= 0) closeTo(invalid, true);
      // Refresh semantics on newly added rows without keeping removed nodes alive.
      for (const [node] of originals) {
        if (!root.contains(node)) {
          for (const [name, value] of originals.get(node)) {
            if (value === null) node.removeAttribute(name); else node.setAttribute(name, value);
          }
          originals.delete(node);
        }
      }
      enhance();
      for (const level of levels) level.trigger.setAttribute('aria-expanded', 'true');
      if (levels.length) {
        const active = doc.activeElement;
        const top = levels.at(-1).menu;
        if ((active === doc.body || top.contains(active)) && !itemsIn(top).includes(active)) focus(itemsIn(top)[0] ?? top);
        schedulePosition();
      }
    }
    changing = false;
  }
  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    unlisten.push(() => target.removeEventListener(type, handler, options));
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    close();
    observer?.disconnect();
    unlisten.forEach((remove) => remove());
    restore();
    instances.delete(root);
    trigger = null;
    menu = null;
    contextTarget = null;
  }

  ({ trigger, menu } = targets());
  validate({ trigger, menu });
  let observer;
  if (supported) {
    enhance();
    listen(root, 'click', onClick);
    listen(root, 'keydown', onKey);
    listen(root, 'toggle', (event) => {
      const depth = levels.findIndex((level) => level.menu === event.target);
      if (depth >= 0 && !event.target.matches(':popover-open')) closeTo(depth);
    }, true);
    listen(doc, 'pointerdown', (event) => {
      if (levels.length && !event.composedPath().includes(root)) close();
    }, true);
    listen(doc, 'focusin', (event) => {
      if (levels.length && !event.composedPath().includes(root)) close();
    });
    listen(win, 'resize', schedulePosition);
    listen(doc, 'scroll', schedulePosition, true);
    if (win.visualViewport) {
      listen(win.visualViewport, 'resize', schedulePosition);
      listen(win.visualViewport, 'scroll', schedulePosition);
    }
    if (contextTarget) listen(contextTarget, 'contextmenu', (event) => {
      const nested = event.target.closest('button, a, input, select, textarea, summary, [contenteditable]');
      if (nested && nested !== contextTarget) return;
      if (open({ activation: 'context', at: { x: event.clientX, y: event.clientY } })) event.preventDefault();
    });
    observer = new win.MutationObserver(reconcile);
    let tree = root.getRootNode();
    while (tree) {
      observer.observe(tree, { childList: true, subtree: true });
      tree = tree.host?.getRootNode();
    }
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-disabled', 'hidden', 'inert', 'aria-hidden', 'popover', 'aria-controls', 'id', 'data-menu', 'data-menu-trigger', 'data-menu-action', 'data-menu-submenu'] });
  }
  const api = { open, close, dispose, get state() { return { open: levels.length > 0, depth: levels.length, disposed, supported }; } };
  instances.set(root, api);
  return api;
}
