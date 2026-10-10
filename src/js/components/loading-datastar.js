/** Opt-in bridge. The host supplies identity from its installed Datastar contract. */
export function attachDatastarLoading(operation, { target, selectRequest }) {
  if (!target?.addEventListener || typeof selectRequest !== 'function') throw new TypeError('A stable event target and request selector are required.');
  const active = new Map();
  let disposed = false;
  const listener = (event) => {
    const request = selectRequest(event);
    if (!request || request.background || request.id == null) return;
    const { id, phase, signal } = request;
    if (phase === 'started') {
      if (active.has(id) || signal?.aborted) return;
      const token = operation.begin({ signal });
      const release = () => {
        signal?.removeEventListener('abort', abort);
        active.delete(id);
      };
      const abort = () => { token.finish('cancelled'); release(); };
      active.set(id, { token, release });
      signal?.addEventListener('abort', abort, { once: true });
    } else if (['finished', 'failed', 'cancelled'].includes(phase)) {
      const entry = active.get(id);
      if (!entry) return;
      entry.token.finish(phase === 'finished' ? 'unknown' : phase);
      entry.release();
    }
    // Retry notifications and individual stream patches are not terminal outcomes.
  };
  target.addEventListener('datastar-fetch', listener);
  return () => {
    if (disposed) return;
    disposed = true;
    target.removeEventListener('datastar-fetch', listener);
    for (const entry of [...active.values()]) {
      entry.token.finish('cancelled');
      entry.release();
    }
  };
}
