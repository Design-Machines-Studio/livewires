/*
 * Mention suggestions: demonstration only.
 *
 * This page script shows one way a consumer can honor the contract in
 * docs/superpowers/specs/mention-suggestions.md. It is not shipped in /dist and
 * is not a supported controller. Baseplate owns the real trigger, insertion and
 * serialization. The caller supplies results, stable IDs and selection handling.
 */

const GAP = 4;

function scrollParent(node) {
  for (let el = node.parentElement; el && el !== document.body; el = el.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(el);
    if (/(auto|scroll|hidden|clip)/.test(overflowX + overflowY)) return el;
  }
  return null;
}

function caretRect(range, editor) {
  const rects = range.getClientRects();
  if (rects.length) return rects[rects.length - 1];
  const rect = range.getBoundingClientRect();
  if (rect.width || rect.height) return rect;
  // An empty line has no glyph rect. Fall back to the editor's start edge.
  const box = editor.getBoundingClientRect();
  return { top: box.top, bottom: box.top + parseFloat(getComputedStyle(editor).lineHeight || 20), left: box.left, right: box.left };
}

/** Find "@query" immediately before a collapsed caret in one text node. */
function findToken(editor, trigger) {
  const selection = editor.ownerDocument.getSelection();
  if (!selection.rangeCount || !selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE || !editor.contains(node)) return null;
  const before = node.data.slice(0, range.startOffset);
  const match = before.match(new RegExp(`(^|\\s)${trigger}([^\\s${trigger}]{0,40})$`, 'u'));
  if (!match) return null;
  return { node, start: range.startOffset - match[2].length - trigger.length, end: range.startOffset, query: match[2], range };
}

export function attachMentionDemo({ editor, root, search, onSelect = () => {}, trigger = '@' }) {
  const doc = editor.ownerDocument;
  const list = root.querySelector('[role="listbox"]');
  const status = root.querySelector('[role="status"]');
  if (!list?.id || !status) throw new TypeError('Mount a root with an identified listbox and a status region.');

  // Editor contract: textbox semantics stay; these attributes are added while attached.
  editor.setAttribute('aria-autocomplete', 'list');
  editor.setAttribute('aria-haspopup', 'listbox');
  editor.setAttribute('aria-controls', list.id);

  let items = [];
  let active = -1;
  let token = null;
  let suppressed = null; // token start dismissed with Escape
  let request = 0;
  let open = false;

  function say(message) {
    // Write only on change so typing does not repeat announcements.
    if (status.textContent !== message) status.textContent = message;
  }
  function setState(state) { root.dataset.state = state; }
  function options() { return [...list.querySelectorAll('[role="option"]')]; }

  function setActive(index) {
    const all = options();
    all.forEach((option, i) => {
      const on = i === index;
      option.toggleAttribute('data-active', on);
      option.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    active = index;
    if (index >= 0 && all[index]) {
      editor.setAttribute('aria-activedescendant', all[index].id);
      keepVisible(all[index]);
    } else {
      editor.removeAttribute('aria-activedescendant');
    }
  }

  // Scroll only the listbox. scrollIntoView could also scroll the page.
  function keepVisible(option) {
    const box = list.getBoundingClientRect();
    const row = option.getBoundingClientRect();
    if (row.top < box.top) list.scrollTop -= box.top - row.top;
    else if (row.bottom > box.bottom) list.scrollTop += row.bottom - box.bottom;
  }

  function enabled(index) { return index >= 0 && !items[index]?.disabled; }
  function move(step) {
    if (!items.length || list.getAttribute('aria-busy') === 'true') return;
    let next = active;
    for (let i = 0; i < items.length; i++) {
      next = (next + step + items.length) % items.length;
      if (enabled(next)) return setActive(next);
    }
  }

  function render(people) {
    items = people;
    list.replaceChildren(...people.map((person) => {
      const option = doc.createElement('li');
      option.setAttribute('role', 'option');
      option.id = `${list.id}-${person.id}`;
      option.setAttribute('aria-selected', 'false');
      if (person.disabled) option.setAttribute('aria-disabled', 'true');
      if (person.avatar || person.initials) {
        const avatar = doc.createElement('span');
        avatar.className = 'avatar avatar--sm';
        avatar.setAttribute('aria-hidden', 'true');
        if (person.avatar) {
          const img = doc.createElement('img');
          img.src = person.avatar; img.alt = '';
          avatar.append(img);
        } else {
          const initials = doc.createElement('span');
          initials.className = 'initials';
          initials.textContent = person.initials;
          avatar.append(initials);
        }
        option.append(avatar);
      }
      const text = doc.createElement('span');
      const name = doc.createElement('span');
      name.dataset.mentionName = '';
      name.textContent = person.name;
      text.append(name);
      if (person.detail) {
        const detail = doc.createElement('span');
        detail.dataset.mentionDetail = '';
        detail.textContent = person.detail;
        text.append(detail);
      }
      option.append(text);
      return option;
    }));
    list.scrollTop = 0;
  }

  function position() {
    if (!token) return;
    const range = doc.createRange();
    range.setStart(token.node, token.start);
    range.setEnd(token.node, token.start);
    const caret = caretRect(range, editor);
    const viewport = { top: 0, left: 0, right: doc.documentElement.clientWidth, bottom: innerHeight };
    const parent = scrollParent(editor);
    const clip = parent ? parent.getBoundingClientRect() : viewport;
    const bounds = {
      top: Math.max(viewport.top, clip.top), bottom: Math.min(viewport.bottom, clip.bottom),
      left: Math.max(viewport.left, clip.left), right: Math.min(viewport.right, clip.right)
    };
    root.style.removeProperty('--mention-suggestions-max-block');
    const preferred = parseFloat(getComputedStyle(root).maxBlockSize) || 240;
    const width = root.offsetWidth;
    const below = viewport.bottom - caret.bottom - GAP * 2;
    const above = caret.top - viewport.top - GAP * 2;
    const needed = root.offsetHeight; // Natural height, capped by the default limit.
    if (below >= needed || below >= above) {
      root.style.setProperty('--mention-suggestions-top', `${caret.bottom + GAP}px`);
      root.style.removeProperty('--mention-suggestions-bottom');
      root.style.setProperty('--mention-suggestions-max-block', `${Math.max(0, Math.min(preferred, below))}px`);
      root.dataset.placement = 'below';
    } else {
      root.style.setProperty('--mention-suggestions-bottom', `${viewport.bottom - caret.top + GAP}px`);
      root.style.removeProperty('--mention-suggestions-top');
      root.style.setProperty('--mention-suggestions-max-block', `${Math.max(0, Math.min(preferred, above))}px`);
      root.dataset.placement = 'above';
    }
    const rtl = getComputedStyle(editor).direction === 'rtl';
    root.dir = rtl ? 'rtl' : 'ltr';
    const ideal = rtl ? caret.right - width : caret.left;
    const min = Math.max(bounds.left, viewport.left + GAP);
    const max = Math.min(bounds.right, viewport.right - GAP) - width;
    root.style.setProperty('--mention-suggestions-left', `${Math.max(min, Math.min(ideal, max))}px`);
  }

  async function query(text) {
    const id = ++request;
    if (items.length) {
      // Keep previous rows visible but mark them stale while the new query loads.
      list.setAttribute('aria-busy', 'true');
      list.hidden = false;
    } else {
      list.hidden = true;
    }
    setActive(-1);
    setState('loading');
    say('Searching people…');
    position();
    try {
      const people = await search(text);
      if (id !== request || !open) return; // Late reply for an older query.
      list.removeAttribute('aria-busy');
      render(people);
      if (!people.length) {
        list.hidden = true;
        setState('empty');
        say('No matching people');
      } else {
        list.hidden = false;
        setState('ready');
        say(`${people.length} ${people.length === 1 ? 'person' : 'people'} found`);
        const first = people.findIndex((person) => !person.disabled);
        setActive(first);
      }
    } catch (error) {
      if (id !== request || !open) return;
      list.removeAttribute('aria-busy');
      render([]);
      list.hidden = true;
      setState('error');
      say(error?.message || 'People could not be loaded. Keep typing to try again.');
    }
    position();
  }

  function close() {
    if (!open) return;
    open = false;
    request++;
    token = null;
    setActive(-1);
    render([]);
    list.hidden = true;
    list.removeAttribute('aria-busy');
    setState('closed');
    say('');
  }

  function select(index) {
    const person = items[index];
    if (!person || person.disabled || !token) return;
    // Demo insertion: plain text. Baseplate owns real mention nodes and serialization.
    const range = doc.createRange();
    range.setStart(token.node, token.start);
    range.setEnd(token.node, token.end);
    range.deleteContents();
    const inserted = doc.createTextNode(`${trigger}${person.name} `);
    range.insertNode(inserted);
    const caret = doc.createRange();
    caret.setStartAfter(inserted);
    caret.collapse(true);
    const selection = doc.getSelection();
    selection.removeAllRanges();
    selection.addRange(caret);
    close();
    editor.normalize();
    onSelect(person);
  }

  function update() {
    const next = findToken(editor, trigger);
    if (!next) { suppressed = null; return close(); }
    if (suppressed && suppressed.node === next.node && suppressed.start === next.start) return;
    suppressed = null;
    const changed = !token || token.query !== next.query || !open;
    token = next;
    if (!open) { open = true; }
    if (changed) query(next.query); else position();
  }

  function keydown(event) {
    if (!open || event.isComposing || event.keyCode === 229) return;
    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); move(1); break;
      case 'ArrowUp': event.preventDefault(); move(-1); break;
      case 'Enter':
        event.preventDefault();
        if (active >= 0) select(active); else close();
        break;
      case 'Tab':
        if (active >= 0) { event.preventDefault(); select(active); } else close();
        break;
      case 'Escape':
        event.preventDefault();
        suppressed = token && { node: token.node, start: token.start };
        close();
        break;
      default: break;
    }
  }

  const onMouseDown = (event) => event.preventDefault(); // Keep editor focus and selection.
  function onClick(event) {
    const option = event.target.closest?.('[role="option"]');
    if (!option || option.getAttribute('aria-disabled') === 'true') return;
    select(options().indexOf(option));
  }
  const onSelectionChange = () => { if (doc.activeElement === editor) update(); };
  const onFocusOut = () => close();
  const onCompositionEnd = () => update();
  const onInput = (event) => { if (!event.isComposing) update(); };
  const onViewport = () => { if (open) position(); };

  editor.addEventListener('keydown', keydown);
  editor.addEventListener('input', onInput);
  editor.addEventListener('compositionend', onCompositionEnd);
  editor.addEventListener('focusout', onFocusOut);
  doc.addEventListener('selectionchange', onSelectionChange);
  root.addEventListener('mousedown', onMouseDown);
  root.addEventListener('click', onClick);
  addEventListener('resize', onViewport);
  addEventListener('scroll', onViewport, true);
  setState('closed');
  list.hidden = true;

  return {
    get open() { return open; },
    get active() { return active; },
    close,
    dispose() {
      close();
      editor.removeEventListener('keydown', keydown);
      editor.removeEventListener('input', onInput);
      editor.removeEventListener('compositionend', onCompositionEnd);
      editor.removeEventListener('focusout', onFocusOut);
      doc.removeEventListener('selectionchange', onSelectionChange);
      root.removeEventListener('mousedown', onMouseDown);
      root.removeEventListener('click', onClick);
      removeEventListener('resize', onViewport);
      removeEventListener('scroll', onViewport, true);
      for (const name of ['aria-autocomplete', 'aria-haspopup', 'aria-controls', 'aria-activedescendant']) editor.removeAttribute(name);
    }
  };
}
