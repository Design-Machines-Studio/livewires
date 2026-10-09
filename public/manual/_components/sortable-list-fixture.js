const fixture = document.querySelector('main');
const pendingRequests = new WeakMap();
const responseDelay = 700;

function orderFor(list) {
  return [...list.querySelectorAll('[data-sortable-item]')]
    .filter((item) => item.closest('lw-sortable-list') === list)
    .map((item) => item.dataset.itemId);
}

function renderAuthoritativeOrder(list, move) {
  const current = orderFor(list);
  const reordered = current.filter((id) => id !== move.itemId);
  const index = move.before ? reordered.indexOf(move.before) : reordered.length;
  reordered.splice(index < 0 ? reordered.length : index, 0, move.itemId);

  const items = new Map([...list.querySelectorAll('[data-sortable-item]')]
    .filter((item) => item.closest('lw-sortable-list') === list)
    .map((item) => [item.dataset.itemId, item]));
  const replacement = document.createDocumentFragment();
  reordered.forEach((id) => replacement.append(items.get(id).cloneNode(true)));
  list.querySelector('[data-sortable-list]').replaceChildren(replacement);
}

fixture?.addEventListener('sortable-move-request', (event) => {
  const list = event.target;
  const { itemId, before, requestId } = event.detail;
  const pending = { requestId, connection: list._moveState.connection };
  pendingRequests.set(list, pending);

  setTimeout(() => {
    if (!list.isConnected
      || pendingRequests.get(list) !== pending
      || !list._moveState.isCurrent(pending.connection, requestId)) return;

    pendingRequests.delete(list);
    renderAuthoritativeOrder(list, { itemId, before });
    list.resolveMove({ requestId, status: 'accepted' });
  }, responseDelay);
});
