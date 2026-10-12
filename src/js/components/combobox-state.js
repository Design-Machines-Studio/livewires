function opaqueId() {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function foldChoice(text) {
  return String(text).normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
}

export function choiceItems(items) {
  if (!Array.isArray(items)) throw new TypeError('Choices must be an array.');
  const seen = new Set();
  return items.map(item => {
    if (!item || typeof item.value !== 'string' || typeof item.label !== 'string' ||
        (item.disabled !== undefined && typeof item.disabled !== 'boolean') || seen.has(item.value)) {
      throw new TypeError('Choices need unique string values, string labels and optional boolean disabled.');
    }
    seen.add(item.value);
    return Object.freeze({ value: item.value, label: item.label, disabled: !!item.disabled });
  });
}

/** Query state only. Native selects own values; applications own remote transport. */
export function createComboboxState({ mode = 'local', minLength = mode === 'remote' ? 2 : 0,
  maxResults = 50, createId = opaqueId } = {}) {
  if (!['local', 'remote'].includes(mode) || !Number.isInteger(minLength) || minLength < 0 ||
      !Number.isInteger(maxResults) || maxResults < 1) throw new TypeError('Invalid combobox search configuration.');
  const contextId = createId();
  let query = '', request = null, phase = 'idle', items = [], truncated = false, error = '';
  let options = [], disposed = false;
  function bound(values) { truncated = values.length > maxResults; items = values.slice(0, maxResults); }
  function localResults() {
    const match = foldChoice(query.trim());
    bound(options.filter(item => foldChoice(item.label).includes(match) || foldChoice(item.value).includes(match)));
    phase = 'results';
  }
  return {
    get state() { return Object.freeze({ contextId, query, request, phase, items: Object.freeze([...items]), truncated, error }); },
    setOptions(values) {
      if (disposed) return false;
      options = choiceItems(values);
      if (mode === 'local' && phase === 'results') localResults();
      return true;
    },
    setQuery(value, { composing = false } = {}) {
      if (disposed) return null;
      const next = String(value);
      if (next === query && !composing && request) return null;
      query = next;
      request = null;
      items = [];
      truncated = false;
      error = '';
      if (composing) { phase = 'composing'; return null; }
      const text = query.trim();
      if ([...text].length < minLength) { phase = 'short'; return null; }
      request = Object.freeze({ contextId, requestId: createId(), query: text });
      if (mode === 'local') localResults(); else phase = 'loading';
      return request;
    },
    applyResults(result) {
      if (disposed || mode !== 'remote' || phase !== 'loading' || !request || !result ||
          result.contextId !== contextId || result.requestId !== request.requestId || result.query !== request.query) return false;
      if (result.error !== undefined && typeof result.error !== 'string') throw new TypeError('Search error must be text.');
      const values = choiceItems(result.items ?? []);
      bound(values);
      error = result.error || '';
      if (error) { items = []; truncated = false; }
      phase = error ? 'error' : 'results';
      return true;
    },
    invalidate() {
      if (disposed) return;
      request = null;
      items = [];
      truncated = false;
      error = '';
      phase = 'idle';
    },
    dispose() { disposed = true; request = null; items = options = []; phase = 'disposed'; },
  };
}
