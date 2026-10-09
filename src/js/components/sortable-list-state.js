let fallbackRequestSequence = 0;

export function createRequestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  fallbackRequestSequence += 1;
  return `lw-${Date.now().toString(36)}-${fallbackRequestSequence.toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function shouldRestoreFocus({ wasInside, focusChanged, previousStillConnected, activeIsBodyOrHost }) {
  return wasInside && !focusChanged && !previousStillConnected && activeIsBodyOrHost;
}

export function createMoveState() {
  let pending = null;
  let connection = 0;

  return {
    get pending() {
      return pending;
    },
    get connection() {
      return connection;
    },
    begin(move) {
      if (pending) return null;
      pending = { ...move, connection };
      return pending;
    },
    resolve(requestId, status) {
      if (!pending || pending.requestId !== requestId) return null;
      if (status !== 'accepted' && status !== 'rejected') return null;
      const resolved = pending;
      pending = null;
      return resolved;
    },
    disconnect() {
      connection += 1;
      pending = null;
    },
    isCurrent(connectionId, requestId) {
      return connectionId === connection && pending?.requestId === requestId;
    },
  };
}
