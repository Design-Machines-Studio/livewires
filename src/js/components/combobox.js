import { createComboboxState } from './combobox-state.js';

const instances = new WeakMap();

/** Explicit, disposable, single-select enhancement. No fetch or formdata shim. */
export function createCombobox({ root, mode = 'local', minLength = mode === 'remote' ? 2 : 0,
  debounce = mode === 'remote' ? 250 : 0, maxResults = 50 } = {}) {
  if (!root?.isConnected || !root.matches('[data-combobox]') || instances.has(root)) {
    throw new TypeError('Use an unenhanced connected data-combobox root.');
  }
  if (!Number.isFinite(debounce) || debounce < 0) throw new TypeError('Debounce must be finite and nonnegative.');
  const doc = root.ownerDocument, win = doc.defaultView;
  const local = createComboboxState({ mode, minLength, maxResults });
  const prefix = `lw-choice-${local.state.contextId}`;
  const ui = doc.createElement('div');
  ui.setAttribute('data-combobox-ui', '');
  const input = doc.createElement('input');
  input.id = `${prefix}-input`;
  input.type = 'text';
  input.className = 'text-input';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-haspopup', 'listbox');
  input.setAttribute('aria-controls', `${prefix}-list`);
  const list = doc.createElement('ul');
  list.id = `${prefix}-list`;
  list.setAttribute('role', 'listbox');
  list.hidden = true;
  const status = doc.createElement('p');
  status.id = `${prefix}-status`;
  status.className = 'hint';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-atomic', 'true');
  ui.append(input, status, list);
  let select, selected = null, resetDefault = null, open = false, active = -1;
  let disposed = false, composing = false, compositionTail = false, timer, tailTimer, boundForm;
  let showValidation = false;
  const restored = new Map();
  const subscriptions = [];
  function listen(node, type, handler, options) {
    node.addEventListener(type, handler, options);
    subscriptions.push(() => node.removeEventListener(type, handler, options));
  }
  function remember(node, name, value) {
    if (!restored.has(node)) restored.set(node, new Map());
    const attrs = restored.get(node);
    if (!attrs.has(name)) attrs.set(name, { original: node.getAttribute(name), applied: undefined });
    const saved = attrs.get(name);
    if (saved.applied !== undefined && node.getAttribute(name) !== saved.applied) saved.original = node.getAttribute(name);
    saved.applied = value;
    if (value === null) { if (node.hasAttribute(name)) node.removeAttribute(name); }
    else if (node.getAttribute(name) !== value) node.setAttribute(name, value);
  }
  function restore(node) {
    for (const [name, saved] of restored.get(node) ?? []) if (node.getAttribute(name) === saved.applied) {
      if (saved.original === null) node.removeAttribute(name); else node.setAttribute(name, saved.original);
    }
    restored.delete(node);
  }
  function optionsOf(field) {
    return [...field.options].map(option => ({ value: option.value, label: option.label,
      disabled: option.disabled || !!option.closest('optgroup')?.disabled }));
  }
  function choice(field) {
    const option = field.selectedOptions[0];
    return option ? { value: option.value, label: option.label } : null;
  }
  function validate() {
    const fields = root.querySelectorAll('select');
    if (fields.length !== 1 || fields[0].multiple || fields[0].size > 1 || !fields[0].id ||
        fields[0].closest('[data-combobox]') !== root) throw new TypeError('Use one identified native single select.');
    const field = fields[0];
    // Also validates duplicate values before changing fallback markup.
    local.setOptions(optionsOf(field));
    const transferredLabel = [...restored].some(([node, attrs]) => node.matches('label') &&
      attrs.get('for')?.original === field.id && node.htmlFor === input.id);
    if (![...field.labels].length && !transferredLabel && !field.getAttribute('aria-label') && !field.getAttribute('aria-labelledby')) {
      throw new TypeError('The native select needs an accessible label.');
    }
    return field;
  }
  function enabled() { return select && !select.matches(':disabled') && !root.closest('[inert]'); }
  function live() {
    if (disposed) return false;
    if (!root.isConnected) { dispose(); return false; }
    return true;
  }
  function cancelQuery() {
    win.clearTimeout(timer);
    timer = undefined;
    local.invalidate();
    active = -1;
  }
  function labelInput() {
    for (const label of doc.querySelectorAll('label')) {
      if (label.htmlFor === select.id || label.htmlFor === input.id || label.contains(select)) remember(label, 'for', input.id);
    }
    for (const name of ['aria-label', 'aria-labelledby', 'aria-describedby', 'aria-invalid', 'form']) {
      const value = select.getAttribute(name);
      if (value === null) input.removeAttribute(name); else input.setAttribute(name, value);
    }
    const descriptions = new Set((input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    descriptions.add(status.id);
    input.setAttribute('aria-describedby', [...descriptions].join(' '));
    input.setAttribute('aria-required', String(select.required));
    input.disabled = !enabled();
    list.setAttribute('aria-label', input.getAttribute('aria-label') || [...doc.querySelectorAll(`label[for="${input.id}"]`)].map(node => node.textContent.trim()).join(' ') || 'Choices');
  }
  function keepChoice(value, isDefault = false) {
    if (!value) return;
    let option = [...select.options].find(option => option.value === value.value);
    if (!option) {
      option = new win.Option(value.label, value.value, isDefault, false);
      option.setAttribute('data-combobox-retained', '');
      select.add(option);
    }
    if (isDefault && !option.defaultSelected) option.defaultSelected = true;
    return option;
  }
  function render() {
    if (disposed) return;
    const state = local.state;
    labelInput();
    const rows = state.items;
    if (active >= rows.length || rows[active]?.disabled) active = -1;
    list.replaceChildren(...rows.map((item, index) => {
      const row = doc.createElement('li');
      row.id = `${prefix}-option-${index}`;
      row.setAttribute('role', 'option');
      row.setAttribute('data-combobox-index', String(index));
      row.setAttribute('aria-selected', String(index === active));
      if (item.disabled) row.setAttribute('aria-disabled', 'true');
      if (selected?.value === item.value) row.setAttribute('data-selected', '');
      if (index === active) row.setAttribute('data-active', '');
      row.textContent = item.label;
      return row;
    }));
    list.hidden = !open || !rows.length || !enabled();
    input.setAttribute('aria-expanded', String(open && enabled()));
    input.setAttribute('aria-busy', String(state.phase === 'loading'));
    if (open && active >= 0 && !list.hidden) input.setAttribute('aria-activedescendant', `${prefix}-option-${active}`);
    else input.removeAttribute('aria-activedescendant');
    const invalid = !select.validity.valid;
    const showError = invalid && (showValidation || select.validity.customError);
    if (showError) input.setAttribute('aria-invalid', 'true');
    input.classList.toggle('error', showError || select.getAttribute('aria-invalid') === 'true');
    status.classList.toggle('error', showError || state.phase === 'error');
    let message = !enabled() ? '' : state.phase === 'loading' ? 'Searching…' : state.phase === 'short' ? `Type at least ${minLength} characters to search.`
      : state.phase === 'error' ? `Search failed. ${state.error}` : open && state.phase === 'results' ? rows.length ? `${rows.length} result${rows.length === 1 ? '' : 's'}.${state.truncated ? ' Showing the first results; refine your search.' : ''}` : 'No results.' : '';
    if (showError) message = select.validationMessage;
    if (status.textContent !== message) status.textContent = message;
    if (!open && !composing) input.value = selected?.label || '';
  }
  function search(value = input.value) {
    if (!live() || !enabled()) return;
    const previousRequest = local.state.request;
    const request = local.setQuery(value, { composing });
    if (request || local.state.request !== previousRequest) win.clearTimeout(timer);
    active = -1;
    open = true;
    render();
    if (request) timer = win.setTimeout(() => {
      if (live() && enabled() && local.state.request === request) {
        root.dispatchEvent(new win.CustomEvent('combobox-query', { bubbles: true, composed: true, detail: request }));
      }
    }, debounce);
  }
  function close() { cancelQuery(); open = false; render(); }
  function pick(index) {
    if (!live() || !enabled() || composing || compositionTail) return false;
    const item = local.state.items[index];
    if (!item || item.disabled) return false;
    const option = keepChoice(item);
    option.label = item.label;
    option.selected = true;
    selected = { value: item.value, label: item.label };
    for (const retained of select.querySelectorAll('option[data-combobox-retained]')) {
      if (retained !== option && retained.value !== resetDefault?.value) retained.remove();
    }
    close();
    select.dispatchEvent(new win.Event('input', { bubbles: true }));
    select.dispatchEvent(new win.Event('change', { bubbles: true }));
    root.dispatchEvent(new win.CustomEvent('combobox-change', { bubbles: true, composed: true,
      detail: Object.freeze({ name: select.name, value: select.value, label: selected.label }) }));
    input.focus();
    return true;
  }
  function refresh() {
    if (!live()) return false;
    try {
      const next = validate();
      if (select !== next) {
        if (select) restore(select);
        select = next;
        if (!selected) {
          selected = choice(select);
          const defaultOption = [...select.options].find(option => option.defaultSelected) || select.options[0];
          resetDefault = defaultOption ? { value: defaultOption.value, label: defaultOption.label } : null;
        } else if ([...select.options].some(option => option.defaultSelected)) selected = choice(select);
      } else if (choice(select)?.value !== selected?.value && !open) selected = choice(select);
      const currentOption = selected && [...select.options].find(option => option.value === selected.value);
      if (currentOption) selected = { value: currentOption.value, label: currentOption.label };
      keepChoice(resetDefault, true);
      if (selected) keepChoice(selected).selected = true;
      remember(select, 'hidden', '');
      remember(select, 'aria-hidden', 'true');
      remember(select, 'tabindex', '-1');
      if (select.form !== boundForm) {
        if (boundForm) boundForm.removeEventListener('reset', reset);
        boundForm = select.form;
        boundForm?.addEventListener('reset', reset);
      }
      if (!enabled()) { cancelQuery(); open = false; }
      render();
    } catch (error) { dispose(); throw error; }
    return true;
  }
  function reset(event) {
    win.setTimeout(() => {
      if (!live() || event.defaultPrevented) return;
      selected = choice(select);
      composing = compositionTail = false;
      showValidation = false;
      close();
    }, 0);
  }
  function applyResults(result) {
    if (!live() || !enabled()) return false;
    const applied = local.applyResults(result);
    if (applied) { active = -1; render(); }
    return applied;
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    win.clearTimeout(timer);
    win.clearTimeout(tailTimer);
    boundForm?.removeEventListener('reset', reset);
    subscriptions.forEach(remove => remove());
    local.dispose();
    ui.remove();
    for (const node of [...restored.keys()]) restore(node);
    instances.delete(root);
  }
  let observer;
  try { select = validate(); } catch (error) { local.dispose(); throw error; }
  select.after(ui);
  instances.set(root, true);
  // refresh initializes the original default/selection on this first attachment.
  select = undefined;
  refresh();
  listen(input, 'input', () => search());
  listen(input, 'focus', () => { if (enabled()) { input.value = ''; search(''); } });
  listen(input, 'click', () => { if (!open && enabled()) { input.value = ''; search(''); } });
  listen(input, 'blur', () => { if (!composing) close(); });
  listen(input, 'keydown', event => {
    if (event.defaultPrevented || !live() || !enabled() || composing || compositionTail || event.isComposing || event.keyCode === 229) return;
    if (event.key === 'Escape') { if (open) { event.preventDefault(); close(); } return; }
    if (event.key === 'Enter' && open && active >= 0) { event.preventDefault(); pick(active); return; }
    if (!['ArrowDown', 'ArrowUp'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    if (!open) { input.value = ''; search(''); }
    const rows = local.state.items;
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    let index = active < 0 ? direction > 0 ? -1 : 0 : active;
    for (let steps = 0; steps < rows.length; steps++) {
      index = (index + direction + rows.length) % rows.length;
      if (!rows[index].disabled) { active = index; break; }
    }
    render();
    list.children[active]?.scrollIntoView({ block: 'nearest' });
  });
  listen(input, 'compositionstart', () => { composing = true; compositionTail = false; win.clearTimeout(tailTimer); cancelQuery(); });
  listen(input, 'compositionend', () => {
    composing = false;
    compositionTail = true;
    search();
    tailTimer = win.setTimeout(() => { compositionTail = false; }, 0);
  });
  listen(list, 'pointerdown', event => event.preventDefault());
  listen(list, 'click', event => {
    const row = event.target.closest('[data-combobox-index]');
    if (row?.parentElement === list) pick(Number(row.dataset.comboboxIndex));
  });
  listen(root, 'invalid', event => {
    if (event.target !== select || !live() || !enabled()) return;
    event.preventDefault();
    showValidation = true;
    input.focus();
    render();
  }, true);
  listen(root, 'change', event => { if (event.target === select) { selected = choice(select); render(); } });
  listen(root, 'combobox-results', event => { if (event.target === root) applyResults(event.detail); });
  observer = new win.MutationObserver(records => {
    if (disposed) return;
    if (!root.isConnected) { dispose(); return; }
    // Observing the document is needed for external labels/forms and removal,
    // but another instance's generated UI must never trigger our refresh.
    if (records.some(record => record.target === root || record.target === select || select.contains(record.target) ||
        (record.type === 'attributes' && record.target.contains?.(root) && ['disabled', 'inert'].includes(record.attributeName)) ||
        (record.target.matches?.('label') && [select.id, input.id].includes(record.target.htmlFor)))) {
      try { refresh(); } catch { /* Invalid replacement restores the native fallback. */ }
    }
  });
  observer.observe(doc, { subtree: true, childList: true, attributes: true, characterData: true,
    attributeFilter: ['disabled', 'selected', 'value', 'label', 'required', 'form', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-invalid', 'for', 'inert'] });
  return { refresh, applyResults, dispose, get state() { return local.state; } };
}
