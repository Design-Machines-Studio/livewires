const fixture = document.querySelector('main');
const log = fixture?.querySelector('[data-fixture-log]');
const delay = fixture?.querySelector('#response-delay');
const output = fixture?.querySelector('[data-delay-output]');
const generations = new WeakMap();
const pending = new WeakMap();
const nextResult = new WeakMap();

function record(message) {
  if (!log) return;
  const line = document.createElement('span');
  line.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
  log.prepend(line, document.createElement('br'));
}

function generationOf(list) {
  if (!generations.has(list)) generations.set(list, 0);
  return generations.get(list);
}

function incrementGeneration(list) {
  generations.set(list, generationOf(list) + 1);
}

function orderFor(list) {
  return [...list.querySelectorAll('[data-sortable-item]')]
    .filter((item) => item.closest('lw-sortable-list') === list)
    .map((item) => item.dataset.itemId);
}

function applyAuthoritativeOrder(list, move, removeSource = false) {
  const current = orderFor(list);
  const reordered = current.filter((id) => id !== move.itemId);
  if (removeSource) {
    const source = new Map([...list.querySelectorAll('[data-sortable-item]')]
      .filter((item) => item.closest('lw-sortable-list') === list)
      .map((item) => [item.dataset.itemId, item]));
    const ol = list.querySelector('[data-sortable-list]');
    const replacement = document.createDocumentFragment();
    reordered.forEach((id) => replacement.append(source.get(id).cloneNode(true)));
    ol.replaceChildren(replacement);
    return;
  }
  const index = move.before ? reordered.indexOf(move.before) : reordered.length;
  reordered.splice(index < 0 ? reordered.length : index, 0, move.itemId);

  const source = new Map([...list.querySelectorAll('[data-sortable-item]')]
    .filter((item) => item.closest('lw-sortable-list') === list)
    .map((item) => [item.dataset.itemId, item]));
  const ol = list.querySelector('[data-sortable-list]');
  const replacement = document.createDocumentFragment();
  reordered.forEach((id) => replacement.append(source.get(id).cloneNode(true)));
  ol.replaceChildren(replacement);
}

fixture?.addEventListener('sortable-move-request', (event) => {
  const list = event.target;
  const { itemId, before, requestId } = event.detail;
  const connection = generationOf(list);
  const result = nextResult.get(list) || 'accepted';
  nextResult.set(list, 'accepted');
  const handlerStarted = performance.now();
  const scheduledDelay = Number(delay.value);
  let handlerMs = '0.00';
  const timer = setTimeout(() => {
    const current = pending.get(list);
    if (!list.isConnected || generationOf(list) !== connection || current?.requestId !== requestId) {
      record(`Ignored stale response ${requestId}; no markup was applied.`);
      return;
    }
    list.dispatchEvent(new CustomEvent('fixture-sse-update', {
      bubbles: true,
      detail: { list, itemId, before, requestId, result, connection, handlerMs, simulatedDelay: scheduledDelay },
    }));
  }, scheduledDelay);

  pending.set(list, { requestId, timer, connection });
  record(`Requested ${itemId} before ${before || '(end)'} with ${requestId}.`);
  handlerMs = (performance.now() - handlerStarted).toFixed(2);
});

fixture?.addEventListener('fixture-sse-update', (event) => {
  const { list, itemId, before, requestId, result, connection, handlerMs, simulatedDelay } = event.detail;
  const current = pending.get(list);
  if (!list.isConnected || generationOf(list) !== connection || current?.requestId !== requestId) {
    record(`Ignored stale SSE-like update ${requestId}; no markup was applied.`);
    return;
  }

  pending.delete(list);
  const updateStart = performance.now();
  if (result === 'accepted') {
    const removeSource = fixture.querySelector('[data-remove-source-on-accept]')?.checked;
    applyAuthoritativeOrder(list, { itemId, before }, removeSource);
    if (removeSource) fixture.querySelector('[data-remove-source-on-accept]').checked = false;
  }
  list.resolveMove({
    requestId,
    status: result,
    message: result === 'rejected' ? 'The application rejected this move.' : undefined,
  });
  const updateMs = (performance.now() - updateStart).toFixed(2);
  record(`${result} ${requestId}; simulated delay ${simulatedDelay} ms; adapter listener ${handlerMs} ms; markup/result update ${updateMs} ms.`);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const frameMs = (performance.now() - updateStart).toFixed(2);
    record(`Post-update frame observed after ${frameMs} ms. This frame timing is a local fixture measure, not a paint guarantee.`);
  }));
});

fixture?.addEventListener('click', (event) => {
  const resultButton = event.target.closest('[data-next-result]');
  if (resultButton) {
    const targetId = fixture.querySelector('#response-list').value;
    const list = fixture.querySelector(`lw-sortable-list[data-fixture-list="${targetId}"]`);
    nextResult.set(list, resultButton.dataset.nextResult);
    record(`Next response for ${list.dataset.fixtureList} will be ${resultButton.dataset.nextResult}.`);
    return;
  }

  if (event.target.closest('[data-unrelated-update]')) {
    const item = fixture.querySelector('lw-sortable-list[data-pending] [data-sortable-item]');
    if (!item) return record('Start a move before applying an unrelated update.');
    item.dataset.note = `updated-${Date.now()}`;
    record(`Applied an unrelated attribute update. Pending request remains ${item.closest('lw-sortable-list').getAttribute('data-pending') !== null ? 'pending' : 'missing'}.`);
    return;
  }

  if (event.target.closest('[data-move-focus]')) {
    record('Focus moved to this external control.');
    return;
  }

  if (event.target.closest('[data-remove-reinsert]')) {
    const list = fixture.querySelector('lw-sortable-list[data-fixture-list="a"]');
    if (!list) return;
    const timer = pending.get(list);
    if (timer) {
      incrementGeneration(list);
      pending.delete(list);
    }
    const parent = list.parentElement;
    const marker = document.createComment('sortable-list reinsertion point');
    parent.insertBefore(marker, list);
    list.remove();
    requestAnimationFrame(() => {
      marker.replaceWith(list);
      record(timer ? 'List A reinserted; the previous response is now stale.' : 'List A removed and reinserted.');
    });
  }
});

delay?.addEventListener('input', () => {
  output.value = `${delay.value} ms`;
  output.textContent = `${delay.value} ms`;
});
