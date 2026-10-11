// getRandomValues also works on ordinary HTTP development hosts. IDs identify
// local attempts; they are not authorization or CSRF tokens.
function createOpaqueId() {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/** Local edit state. Only an explicit matching application result confirms a save. */
export function createInlineEditState({ contextId, value = '', onChange = () => {}, onEvent = () => {},
  createId = createOpaqueId } = {}) {
  if (typeof contextId !== 'string' || !contextId) throw new TypeError('A nonempty opaque contextId is required.');
  let phase = 'confirmed';
  let confirmed = String(value);
  let draft = confirmed;
  let original = confirmed;
  let editId = null;
  let requestId = null;
  let message = '';
  const state = () => Object.freeze({ contextId, phase, confirmed, draft, original, editId, requestId, message });
  const publish = () => onChange(state());
  const detail = (extra = {}) => Object.freeze({ contextId, editId, ...extra });
  const editable = () => phase === 'editing' || phase === 'rejected';
  function request() {
    if (phase !== 'confirmed') return false;
    editId = createId();
    original = confirmed;
    draft = confirmed;
    phase = 'editing';
    message = '';
    const event = detail();
    publish();
    onEvent('request', event);
    return true;
  }
  function cancel(reason = 'cancel') {
    if (phase === 'confirmed' || phase === 'disposed') return false;
    const event = detail({ requestId, reason, value: draft, uncertain: phase === 'pending' || phase === 'unknown' });
    phase = 'confirmed';
    draft = confirmed;
    editId = requestId = null;
    message = event.uncertain ? 'Stopped waiting. The save may still have applied.'
      : reason === 'unchanged' ? 'No changes to save.' : 'Editing cancelled.';
    publish();
    onEvent('cancel', event);
    return true;
  }
  function commit() {
    if (!editable()) return false;
    if (draft === original) return cancel('unchanged');
    requestId = createId();
    phase = 'pending';
    message = '';
    const event = detail({ requestId, value: draft, original });
    publish();
    onEvent('commit', event);
    return true;
  }
  function applyResult(result) {
    if (!result || !['pending', 'unknown'].includes(phase) || result.contextId !== contextId ||
        result.editId !== editId || result.requestId !== requestId) return false;
    if (!['confirmed', 'rejected', 'unknown'].includes(result.outcome)) throw new TypeError('Use confirmed, rejected or unknown.');
    if (result.outcome === 'confirmed' && typeof result.value !== 'string') throw new TypeError('Confirmation requires the application value.');
    phase = result.outcome;
    message = typeof result.message === 'string' ? result.message : '';
    if (phase === 'confirmed') {
      confirmed = draft = result.value;
      editId = requestId = null;
    } else if (phase === 'rejected') {
      requestId = null;
      message ||= 'The application rejected this value. Your draft is still here.';
    }
    publish();
    return true;
  }
  return {
    request, commit, cancel, applyResult,
    setDraft(value) {
      if (!editable()) return false;
      draft = String(value);
      // Keep the rejection visible until another explicit attempt or cancel.
      publish();
      return true;
    },
    updateConfirmed(value) {
      if (phase === 'disposed') return false;
      confirmed = String(value);
      if (phase === 'confirmed') draft = confirmed;
      // An intervening update neither acknowledges an attempt nor rebases its draft.
      publish();
      return true;
    },
    get state() { return state(); },
    dispose() {
      if (phase === 'disposed') return;
      phase = 'disposed';
      editId = requestId = null;
      publish();
    },
  };
}
