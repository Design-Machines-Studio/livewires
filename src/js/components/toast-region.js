import { createToastRegionState } from './toast-region-state.js';

const owners = new WeakMap();
const actions = 'a[href], button, input, select, textarea, [contenteditable="true"], [tabindex]';

/** Enhance native toasts inside one stable root; never render application content. */
export function createToastRegion({ root, maxVisible = 3, clock } = {}) {
  if (!Number.isSafeInteger(maxVisible) || maxVisible < 1) throw new TypeError('maxVisible must be a positive integer.');
  if (!root?.isConnected || !root.querySelector || !root.hasAttribute('data-toast-region')) {
    throw new TypeError('A connected data-toast-region root is required.');
  }
  if (owners.has(root)) throw new Error('This toast region already has a controller.');
  const doc = root.ownerDocument;
  const activeElement = () => root.getRootNode().activeElement ?? doc.activeElement;
  const view = doc.defaultView;
  const Observer = view.MutationObserver;
  if (!Observer) throw new Error('MutationObserver is required for toast lifecycle cleanup.');
  const inRegion = (node) => node?.closest?.('[data-toast-region]') === root;
  const ownedTarget = (selector) => [...root.querySelectorAll(selector)].find(inRegion);
  let list = ownedTarget('[data-toast-list]');
  if (!list) throw new TypeError('A data-toast-list target is required.');
  let disposed = false;
  let reviewing = false;
  let nodes = new Map();
  const original = new Map();
  const announced = new Set();
  const diagnosed = new WeakSet();
  const owned = [];
  const listState = new Map();
  const originalTabIndex = root.getAttribute('tabindex');
  const isError = (node) => node?.getAttribute('data-toast-kind') === 'error' || node?.classList.contains('toast--error');
  const emit = (name, detail) => root.dispatchEvent(new view.CustomEvent(name, { bubbles: true, detail }));

  function make(tag, attrs) {
    const node = doc.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    root.append(node);
    owned.push(node);
    return node;
  }
  const review = make('button', { type: 'button', 'data-toast-review': '', 'aria-expanded': 'false' });
  const polite = make('p', { class: 'visually-hidden', role: 'status', 'aria-atomic': 'true' });
  const assertive = make('p', { class: 'visually-hidden', role: 'alert', 'aria-atomic': 'true' });
  const attr = (node, key, value) => {
    if (value === null) { if (node.hasAttribute(key)) node.removeAttribute(key); }
    else if (node.getAttribute(key) !== value) node.setAttribute(key, value);
  };
  function remember(node) {
    if (!original.has(node)) original.set(node, {
      hidden: node.getAttribute('hidden'), state: node.getAttribute('data-toast-state'),
      role: node.getAttribute('role'), live: node.getAttribute('aria-live'),
    });
  }
  function restore(node) {
    const before = original.get(node);
    if (!before) return;
    attr(node, 'hidden', before.hidden);
    attr(node, 'data-toast-state', before.state);
    attr(node, 'role', before.role);
    attr(node, 'aria-live', before.live);
    original.delete(node);
  }
  function describe(node) {
    const raw = node.getAttribute('data-toast-duration');
    const duration = raw === null ? undefined : Number(raw);
    const kind = node.getAttribute('data-toast-kind');
    const actionable = [...node.querySelectorAll(actions)].some((action) =>
      !action.matches('[data-toast-dismiss]') && !action.disabled);
    return { id: node.getAttribute('data-toast-id'), duration,
      sticky: kind === 'error' || kind === 'pending' || node.classList.contains('toast--error') || actionable };
  }
  function render(state) {
    if (disposed) return;
    const queue = state.messages.filter((message) => message.queued);
    const errors = queue.filter((message) => isError(nodes.get(message.id))).length;
    if (queue.length === 0) reviewing = false;
    for (const message of state.messages) {
      const node = nodes.get(message.id);
      if (!node) continue;
      const visible = message.active || (message.queued && reviewing);
      attr(node, 'hidden', visible ? null : '');
      attr(node, 'data-toast-state', message.dismissed ? 'dismissed' : message.expired ? 'expired' : message.queued ? 'queued' : 'visible');
    }
    const label = queue.length === 0 ? 'No more messages' : reviewing ? 'Show fewer messages' :
      `Show ${queue.length} more ${queue.length === 1 ? 'message' : 'messages'}${errors ? ` (${errors} ${errors === 1 ? 'error' : 'errors'})` : ''}`;
    if (review.textContent !== label) review.textContent = label;
    // Do not remove a control while a person is using it.
    attr(review, 'hidden', queue.length === 0 && activeElement() !== review ? '' : null);
    attr(review, 'aria-expanded', String(reviewing));
    attr(list, 'data-toast-reviewing', reviewing ? '' : null);
  }
  const local = createToastRegionState({ maxVisible, clock, onChange: render });
  function refresh() {
    if (disposed) return;
    if (!root.isConnected) { dispose(); return; }
    const nextList = ownedTarget('[data-toast-list]');
    if (!nextList || !inRegion(nextList) || owned.some((node) => node.parentNode !== root)) { dispose(); return; }
    if (list !== nextList && listState.has(list)) {
      attr(list, 'data-toast-reviewing', listState.get(list));
      listState.delete(list);
    }
    if (!listState.has(nextList)) listState.set(nextList, nextList.getAttribute('data-toast-reviewing'));
    list = nextList;
    const nextNodes = new Map();
    const managed = new Set();
    const descriptions = [];
    for (const node of list.querySelectorAll('[data-toast-id]')) {
      if (!inRegion(node)) continue;
      const message = describe(node);
      if (!message.id?.trim() || (message.duration !== undefined && (!Number.isFinite(message.duration) || message.duration <= 0))) {
        if (!diagnosed.has(node)) { diagnosed.add(node); emit('lw-toast-invalid', { id: message.id, reason: 'invalid-message' }); }
        continue; // Keep invalid native markup readable rather than silently drop it.
      }
      remember(node);
      managed.add(node);
      // The owned live nodes announce text once; a patched toast must not also
      // become its own live region and replay the whole stack.
      attr(node, 'role', null);
      attr(node, 'aria-live', null);
      if (nextNodes.has(message.id)) {
        attr(node, 'hidden', '');
        attr(node, 'data-toast-state', 'duplicate');
        if (!diagnosed.has(node)) { diagnosed.add(node); emit('lw-toast-invalid', { id: message.id, reason: 'duplicate-id' }); }
        continue;
      }
      nextNodes.set(message.id, node);
      descriptions.push(message);
    }
    for (const node of original.keys()) if (!managed.has(node)) restore(node);
    nodes = nextNodes;
    // Establish pause state before sync can start a replacement's timer.
    for (const message of local.state.messages) {
      const node = nodes.get(message.id);
      local.pause(message.id, 'focus', Boolean(node?.contains(activeElement())));
      local.pause(message.id, 'hover', Boolean(node?.matches(':hover')));
    }
    local.sync(descriptions);
    for (const message of descriptions) {
      const node = nodes.get(message.id);
      local.pause(message.id, 'focus', node.contains(activeElement()));
      local.pause(message.id, 'hover', node.matches(':hover'));
    }
    for (const priority of ['polite', 'assertive']) {
      const fresh = descriptions.filter((message) => !announced.has(message.id) &&
        (isError(nodes.get(message.id)) ? 'assertive' : 'polite') === priority);
      if (!fresh.length) continue;
      const text = fresh.map((message) => {
        const node = nodes.get(message.id);
        return (node.querySelector('[data-toast-message]') ?? node.querySelector('.content'))?.textContent.trim() ?? '';
      }).filter(Boolean).join(' ');
      for (const message of fresh) announced.add(message.id);
      // A new occurrence may have the same words. Replace the text node only
      // for new IDs; unrelated mutations never touch this announcement.
      (priority === 'assertive' ? assertive : polite).replaceChildren(doc.createTextNode(text));
      emit('lw-toast-announce', { ids: fresh.map((message) => message.id), priority, text });
    }
  }
  function toastFor(target) {
    const node = target?.closest?.('[data-toast-id]');
    return node && inRegion(node) && nodes.get(node.getAttribute('data-toast-id')) === node ? node : null;
  }
  function dismissNode(node, reason) {
    const id = node.getAttribute('data-toast-id');
    const focused = node.contains(activeElement());
    if (!local.dismiss(id)) return false;
    if (focused) {
      const next = [...nodes.values()].find((candidate) => !candidate.hidden && candidate !== node);
      const target = next?.querySelector('[data-toast-dismiss]') ?? ownedTarget('[data-toast-focus-return]');
      if (target) target.focus();
      else {
        if (root.getAttribute('tabindex') === null) attr(root, 'tabindex', '-1');
        root.focus({ preventScroll: true });
      }
    }
    emit('lw-toast-dismiss', { id, reason });
    return true;
  }
  function click(event) {
    if (event.target === review) {
      reviewing = !reviewing;
      render(local.state);
      return;
    }
    const close = event.target.closest?.('button[data-toast-dismiss]');
    const node = toastFor(close);
    if (node) dismissNode(node, 'button');
  }
  function keydown(event) {
    if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
    const node = toastFor(event.target);
    if (node && dismissNode(node, 'escape')) { event.preventDefault(); event.stopPropagation(); }
  }
  function interaction(event) {
    if (event.target === review && event.type === 'focusout') { render(local.state); return; }
    const node = toastFor(event.target);
    if (!node) return;
    const focus = event.type.startsWith('focus');
    if (node.contains(event.relatedTarget)) return;
    local.pause(node.getAttribute('data-toast-id'), focus ? 'focus' : 'hover', event.type === 'focusin' || event.type === 'mouseover');
  }
  const listeners = { click, keydown, focusin: interaction, focusout: interaction, mouseover: interaction, mouseout: interaction };
  for (const [name, handler] of Object.entries(listeners)) root.addEventListener(name, handler);
  const observer = new Observer(refresh);
  observer.observe(root, { childList: true, subtree: true, attributes: true, characterData: true });
  let tree = root.getRootNode();
  while (tree) {
    observer.observe(tree, { childList: true, subtree: true });
    tree = tree.host?.getRootNode();
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    for (const [name, handler] of Object.entries(listeners)) root.removeEventListener(name, handler);
    local.dispose();
    for (const node of [...original.keys()]) restore(node);
    for (const [target, value] of listState) attr(target, 'data-toast-reviewing', value);
    attr(root, 'tabindex', originalTabIndex);
    for (const node of owned) node.remove();
    announced.clear();
    nodes.clear();
    owners.delete(root);
  }
  owners.set(root, true);
  try { refresh(); } catch (error) { dispose(); throw error; }
  return {
    get state() { return local.state; }, dispose, refresh,
    dismiss(id) { const node = nodes.get(id); return !disposed && node ? dismissNode(node, 'api') : false; },
    forget(id) { const result = local.forget(id); if (result) announced.delete(id); return result; },
  };
}
