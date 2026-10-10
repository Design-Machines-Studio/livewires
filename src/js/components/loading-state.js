/** Local, finite requests only. Completion never means a successful save. */
export function createLoadingState({
  delay = 150,
  minDuration = 300,
  now = () => performance.now(),
  setTimeout = globalThis.setTimeout,
  clearTimeout = globalThis.clearTimeout,
  onChange = () => {},
} = {}) {
  for (const value of [delay, minDuration]) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError('Loading durations must be nonnegative milliseconds.');
  }
  const requests = new Map();
  let timer = null;
  let visibleSince = null;
  let phase = 'idle';
  let disposed = false;
  let outcome = 'unknown';

  const snapshot = () => Object.freeze({ pending: requests.size, busy: requests.size > 0, visible: visibleSince !== null, phase });
  const publish = () => onChange(snapshot());
  const cancelTimer = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };
  const schedule = (callback, duration) => {
    cancelTimer();
    timer = setTimeout(() => { timer = null; callback(); }, duration);
  };

  function begin({ signal } = {}) {
    if (disposed) throw new Error('Loading operation is disposed.');
    if (signal?.aborted) return { finish: () => false };
    const id = Symbol('request');
    const finish = (result = 'unknown') => {
      if (!['unknown', 'failed', 'cancelled'].includes(result)) throw new TypeError('Use unknown, failed or cancelled; saved is application-owned.');
      if (!requests.has(id)) return false;
      requests.get(id)();
      requests.delete(id);
      if (result === 'failed' || (result === 'cancelled' && outcome !== 'failed')) outcome = result;
      if (requests.size === 0) {
        phase = outcome;
        cancelTimer();
        if (visibleSince !== null) {
          const remaining = Math.max(0, minDuration - (now() - visibleSince));
          if (remaining > 0) schedule(() => { visibleSince = null; publish(); }, remaining);
          else visibleSince = null;
        }
      }
      publish();
      return true;
    };
    const abort = () => finish('cancelled');
    requests.set(id, () => signal?.removeEventListener('abort', abort));
    signal?.addEventListener('abort', abort, { once: true });
    if (requests.size === 1) {
      outcome = 'unknown';
      phase = 'pending';
      cancelTimer();
      if (visibleSince === null) {
        if (delay === 0) visibleSince = now();
        else schedule(() => { visibleSince = now(); publish(); }, delay);
      }
    }
    publish();
    return { finish };
  }

  return {
    begin,
    get state() { return snapshot(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelTimer();
      for (const release of requests.values()) release();
      requests.clear();
      visibleSince = null;
      phase = 'disposed';
      publish();
    },
  };
}
