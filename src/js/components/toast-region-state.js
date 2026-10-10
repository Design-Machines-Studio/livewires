/** Region-local occurrence state. No transport or save-result inference. */
export function createToastRegionState({ maxVisible = 3, onChange = () => {}, clock = {} } = {}) {
  if (!Number.isSafeInteger(maxVisible) || maxVisible < 1) throw new TypeError('maxVisible must be a positive integer.');
  const now = clock.now ?? (() => performance.now());
  const schedule = clock.setTimeout ?? ((fn, ms) => setTimeout(fn, ms));
  const cancel = clock.clearTimeout ?? ((timer) => clearTimeout(timer));
  const records = new Map();
  let disposed = false;

  const remaining = (record) => record.deadline === null ? record.remaining : Math.max(0, record.deadline - now());
  function stop(record) {
    if (record.deadline === null) return;
    record.remaining = remaining(record);
    cancel(record.timer);
    record.timer = null;
    record.deadline = null;
  }
  function snapshot() {
    const eligible = [...records.values()].filter((r) => r.present && !r.dismissed && !r.expired);
    const active = new Set(eligible.slice(0, maxVisible));
    return {
      disposed,
      messages: [...records.values()].map((r) => ({
        id: r.id, present: r.present, dismissed: r.dismissed, expired: r.expired,
        sticky: r.sticky, remaining: remaining(r), paused: r.pauses.size > 0,
        active: active.has(r), queued: eligible.includes(r) && !active.has(r),
      })),
    };
  }
  function update() {
    const active = new Set(snapshot().messages.filter((r) => r.active).map((r) => r.id));
    for (const record of records.values()) {
      const running = !disposed && active.has(record.id) && !record.sticky && record.pauses.size === 0;
      if (!running) stop(record);
      else if (record.deadline === null) {
        record.deadline = now() + record.remaining;
        record.timer = schedule(() => {
          record.timer = null;
          record.deadline = null;
          record.remaining = 0;
          record.expired = true;
          update();
        }, record.remaining);
      }
    }
    onChange(snapshot());
  }

  function sync(messages) {
    if (disposed) return false;
    // Validate before changing state; duplicate deliveries are one occurrence.
    const next = new Map();
    for (const message of messages) {
      if (typeof message.id !== 'string' || !message.id.trim()) throw new TypeError('A nonempty toast ID is required.');
      if (message.duration !== undefined && (!Number.isFinite(message.duration) || message.duration <= 0)) {
        throw new TypeError('Toast duration must be finite positive milliseconds.');
      }
      if (!next.has(message.id)) next.set(message.id, message);
    }
    for (const record of records.values()) record.present = next.has(record.id);
    for (const message of next.values()) {
      let record = records.get(message.id);
      if (!record) {
        record = { id: message.id, present: true, remaining: message.duration ?? 0,
          sticky: Boolean(message.sticky) || message.duration === undefined,
          dismissed: false, expired: false, pauses: new Set(), deadline: null, timer: null };
        records.set(message.id, record);
      } else {
        record.present = true;
        // Discovering an action must protect it; same-ID patches never shorten
        // a lifetime or turn a sticky occurrence back into a timed message.
        if (message.sticky) record.sticky = true;
      }
    }
    update();
    return true;
  }
  function dismiss(id) {
    const record = records.get(id);
    if (disposed || !record?.present || record.dismissed || record.expired) return false;
    record.dismissed = true;
    update();
    return true;
  }
  function pause(id, reason, paused) {
    const record = records.get(id);
    if (disposed || !record) return false;
    if (paused) record.pauses.add(reason);
    else record.pauses.delete(reason);
    update();
    return true;
  }
  function forget(id) {
    if (disposed || !records.has(id)) return false;
    const record = records.get(id);
    if (record.present) throw new Error('Remove the toast before forgetting its ID.');
    stop(record);
    records.delete(id);
    update();
    return true;
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    for (const record of records.values()) stop(record);
    records.clear();
    onChange(snapshot());
  }
  return { sync, dismiss, pause, forget, dispose, get state() { return snapshot(); } };
}
