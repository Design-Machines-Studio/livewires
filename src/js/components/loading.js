import { createLoadingState } from './loading-state.js';

const messages = {
  idle: '', pending: 'Request pending.', unknown: 'Request ended. Save status is unknown.',
  failed: 'Request failed. Check the result before retrying.',
  cancelled: 'Request cancelled. Save status is unknown.', disposed: '',
};

/** One explicit region. Keep root connected; dispose when its owner unmounts. */
export function createLoadingOperation({ root, content, indicator, status, delay, minDuration }) {
  if (!root?.querySelector) throw new TypeError('A stable operation root is required.');
  for (const selector of [content, indicator, status]) {
    if (typeof selector !== 'string' || !selector) throw new TypeError('Content, indicator and status selectors are required.');
  }
  let nodes = {};
  let disposed = false;
  const find = () => {
    const next = { content: root.querySelector(content), indicator: root.querySelector(indicator), status: root.querySelector(status) };
    if (next.content && next.status && (next.content === next.status || next.content.contains(next.status))) {
      throw new TypeError('Loading announcements must be outside the busy content.');
    }
    return next;
  };
  nodes = find();
  if (Object.values(nodes).some((node) => !node)) throw new TypeError('Loading targets must exist at setup.');
  const originalBusy = nodes.content.getAttribute('aria-busy');

  function render(state) {
    nodes.content?.setAttribute('aria-busy', String(state.busy));
    nodes.content?.setAttribute('data-loading-state', state.phase);
    if (nodes.indicator) {
      nodes.indicator.hidden = !state.visible;
      nodes.indicator.setAttribute('aria-hidden', 'true');
    }
    if (nodes.status && nodes.status.textContent !== messages[state.phase]) nodes.status.textContent = messages[state.phase];
  }
  const local = createLoadingState({ delay, minDuration, onChange: render });
  render(local.state);
  const Observer = root.ownerDocument?.defaultView?.MutationObserver ?? globalThis.MutationObserver;
  if (!Observer) throw new Error('MutationObserver is required for loading lifecycle cleanup.');
  const observer = new Observer(() => {
    if (disposed) return;
    if (root.isConnected === false) { dispose(); return; }
    let next;
    try { next = find(); } catch { dispose(); return; }
    // Resolve final DOM after a patch, rather than resetting state on every mutation.
    if (nodes.content !== next.content) {
      nodes.content?.removeAttribute('aria-busy');
      nodes.content?.removeAttribute('data-loading-state');
    }
    if (nodes.indicator !== next.indicator && nodes.indicator) nodes.indicator.hidden = true;
    if (Object.values(next).some((node) => !node)) { dispose(); return; }
    nodes = next;
    const state = local.state;
    if (nodes.content.getAttribute('aria-busy') !== String(state.busy) ||
        nodes.content.getAttribute('data-loading-state') !== state.phase ||
        nodes.indicator.hidden !== !state.visible ||
        nodes.indicator.getAttribute('aria-hidden') !== 'true' ||
        nodes.status.textContent !== messages[state.phase]) render(state);
  });
  observer.observe(root.getRootNode?.() ?? root, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-busy', 'hidden', 'aria-hidden', 'data-loading-state'] });

  function dispose() {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    local.dispose();
    if (nodes.content) {
      if (originalBusy === null) nodes.content.removeAttribute('aria-busy');
      else nodes.content.setAttribute('aria-busy', originalBusy);
      nodes.content.removeAttribute('data-loading-state');
    }
  }

  return { begin: local.begin, get state() { return local.state; }, dispose };
}
