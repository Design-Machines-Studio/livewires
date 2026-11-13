import { matchesIcon, nextTileIndex, placePanel, rememberIcon } from './icon-picker-state.js';

const instances = new WeakMap();
const NARROW = '(width < 30em)';

/**
 * Enhances a server-rendered [data-icon-picker]. The native radios own the
 * submitted value; this adds search, Recent, grid keys, anchoring and trigger
 * updates. Without it, the native popover and radios still work.
 */
export function createIconPicker({ root, recent = true, recentKey = 'lw-icon-picker-recent', recentLimit = 8 } = {}) {
  if (!root?.isConnected || !root.matches('[data-icon-picker]') || instances.has(root)) {
    throw new TypeError('Use an unenhanced connected data-icon-picker root.');
  }
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  const trigger = root.querySelector('.icon-picker-trigger');
  const panel = root.querySelector('.icon-picker-panel');
  const current = trigger?.querySelector('.icon-picker-current');
  const placeholder = trigger?.querySelector('.icon-picker-placeholder');
  const search = panel?.querySelector('.icon-picker-search');
  const input = search?.querySelector('input');
  const body = panel?.querySelector('.icon-picker-body');
  const recentSection = panel?.querySelector('.icon-picker-recent');
  const recentGrid = recentSection?.querySelector('.icon-picker-grid');
  const status = panel?.querySelector('.icon-picker-status');
  if (!trigger || !panel || !current || !placeholder || !body) {
    throw new TypeError('An icon picker needs a trigger, current and placeholder icons, a panel and a body.');
  }
  const labels = {
    change: trigger.dataset.labelChange || 'Change icon',
    choose: trigger.dataset.labelChoose || 'Choose icon',
    count: status?.dataset.labelCount || '{count} icons',
    empty: status?.dataset.labelEmpty || 'No icons match “{query}”',
  };
  let tiles = [];
  let gridFocus = null;
  const remove = panel.querySelector('.icon-picker-remove input');
  let disposed = false;
  let frame = null;
  const controller = new AbortController();
  const { signal } = controller;

  const tileLabel = (tile) => tile.querySelector('.visually-hidden:not(input)')?.textContent.trim() || tile.querySelector('input')?.value || '';
  const visible = (tile) => !tile.hidden && !tile.closest('[hidden]');
  const visibleTiles = () => [...panel.querySelectorAll('.icon-picker-tile')].filter(visible);
  const checkedTile = () => tiles.find((tile) => tile.querySelector('input').checked) ?? null;
  const tileFor = (value) => tiles.find((tile) => tile.querySelector('input').value === value) ?? null;

  function collect() {
    tiles = [...body.querySelectorAll('.icon-picker-tile')].filter((tile) => !recentSection?.contains(tile));
  }

  function updateTrigger() {
    const tile = checkedTile();
    current.replaceChildren();
    if (tile) current.append(tile.querySelector('svg').cloneNode(true));
    current.hidden = !tile;
    placeholder.hidden = !!tile;
    trigger.setAttribute('aria-label', tile ? `${labels.change}, ${tileLabel(tile)}` : labels.choose);
  }

  function readRecent() {
    try { return JSON.parse(win.localStorage.getItem(recentKey)) ?? []; } catch { return []; }
  }
  function writeRecent(value) {
    try { win.localStorage.setItem(recentKey, JSON.stringify(rememberIcon(readRecent(), value, recentLimit))); } catch { /* Storage may be unavailable. */ }
  }
  function renderRecent() {
    if (!recent || !recentSection || !recentGrid) return;
    recentSection.hidden = false;
    const columns = Math.max(1, win.getComputedStyle(recentGrid).gridTemplateColumns.split(' ').filter(Boolean).length);
    const items = readRecent().map(tileFor).filter(Boolean).slice(0, columns);
    recentGrid.replaceChildren(...items.map((tile) => {
      const copy = tile.cloneNode(true);
      const radio = copy.querySelector('input');
      // Unnamed copies never submit; choosing one checks the original radio.
      radio.removeAttribute('name');
      radio.checked = false;
      radio.dataset.iconPickerRecent = '';
      radio.tabIndex = -1; // Reached with arrow keys, not Tab.
      copy.hidden = false;
      return copy;
    }));
    recentSection.hidden = !items.length || !!input?.value.trim();
  }

  function filter() {
    const query = input?.value ?? '';
    let count = 0;
    tiles.forEach((tile) => {
      const show = matchesIcon(query, tile.querySelector('input').value, tile.dataset.tags);
      tile.hidden = !show;
      if (show) count++;
    });
    body.querySelectorAll('.icon-picker-section').forEach((section) => {
      if (section === recentSection) return;
      section.hidden = !section.querySelector('.icon-picker-tile:not([hidden])');
    });
    if (recentSection) recentSection.hidden = !!query.trim() || !recentGrid?.children.length;
    if (status) {
      status.textContent = count || !query.trim()
        ? labels.count.replace('{count}', String(count))
        : labels.empty.replace('{query}', query.trim());
    }
  }

  function position() {
    frame = null;
    if (disposed || !panel.matches(':popover-open')) return;
    if (win.matchMedia(NARROW).matches) {
      panel.style.removeProperty('left');
      panel.style.removeProperty('top');
      return;
    }
    const gap = parseFloat(win.getComputedStyle(root).getPropertyValue('--line-025')) || 4;
    const visual = win.visualViewport;
    const view = { left: visual?.offsetLeft ?? 0, top: visual?.offsetTop ?? 0, width: visual?.width ?? win.innerWidth, height: visual?.height ?? win.innerHeight };
    const place = placePanel(trigger.getBoundingClientRect(), panel.getBoundingClientRect(), view, win.getComputedStyle(root).direction === 'rtl', gap);
    panel.style.left = `${place.x}px`;
    panel.style.top = `${place.y}px`;
  }
  const schedule = () => { if (frame === null) frame = win.requestAnimationFrame(position); };

  // Scroll only the panel body. scrollIntoView would also scroll the
  // clipped panel and hide its header.
  function reveal(tile, center = false) {
    const box = body.getBoundingClientRect();
    const rect = tile.getBoundingClientRect();
    if (center) body.scrollTop += rect.top - box.top - (body.clientHeight - rect.height) / 2;
    else if (rect.top < box.top) body.scrollTop -= box.top - rect.top;
    else if (rect.bottom > box.top + body.clientHeight) body.scrollTop += rect.bottom - box.top - body.clientHeight;
  }
  function focusTile(tile) {
    const radio = tile?.querySelector('input');
    if (!radio) return false;
    radio.focus({ preventScroll: true });
    reveal(tile);
    return true;
  }
  function firstFocusTarget() {
    const checked = checkedTile();
    return checked && visible(checked) ? checked : visibleTiles()[0];
  }

  function choose(radio) {
    if (radio.hasAttribute('data-icon-picker-recent')) {
      const original = tileFor(radio.value)?.querySelector('input');
      if (!original) return;
      original.checked = true;
      original.dispatchEvent(new Event('input', { bubbles: true }));
      original.dispatchEvent(new Event('change', { bubbles: true }));
      radio = original;
    }
    if (radio.value) writeRecent(radio.value);
    updateTrigger();
    if (panel.matches(':popover-open')) panel.hidePopover();
    trigger.focus();
  }

  // Open and prepare in one step so focus and position are ready before the
  // next key press. The trigger keeps popovertarget for light-dismiss rules
  // and for pages without this script.
  function open() {
    gridFocus = null;
    panel.showPopover();
    if (input) input.value = '';
    filter();
    renderRecent();
    position();
    body.scrollTop = 0;
    const checked = checkedTile();
    if (checked && visible(checked)) reveal(checked, true);
    (input ?? firstFocusTarget()?.querySelector('input'))?.focus({ preventScroll: true });
  }
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    if (panel.matches(':popover-open')) panel.hidePopover();
    else open();
  }, { signal });
  panel.addEventListener('toggle', (event) => {
    trigger.setAttribute('aria-expanded', String(event.newState === 'open'));
  }, { signal });

  // Click, not change, so choosing the already-checked icon also closes.
  panel.addEventListener('click', (event) => {
    if (event.target.matches?.('input[type="radio"]')) choose(event.target);
  }, { signal });

  input?.addEventListener('input', filter, { signal });
  input?.addEventListener('keydown', (event) => {
    // ArrowDown goes to the checked icon, or the first one when it is hidden.
    if (event.key === 'ArrowDown' && focusTile(firstFocusTarget())) event.preventDefault();
    if (event.key === 'Enter') {
      // Enter chooses a lone match instead of submitting the form.
      event.preventDefault();
      const only = visibleTiles().filter((tile) => !recentSection?.contains(tile));
      if (only.length === 1) only[0].querySelector('input').click();
    }
  }, { signal });

  // Tab cycles Remove, search and the icon grid without leaving the panel.
  // Native order cannot do this: Remove shares the icons' radio group, so it
  // is never its own tab stop, and the grid would hand focus to the page.
  body.addEventListener('focusin', (event) => {
    const tile = event.target.closest?.('.icon-picker-tile');
    if (tile && !recentSection?.contains(tile)) gridFocus = tile;
  }, { signal });
  function tabStops() {
    const stops = [];
    if (remove && remove.closest('label').getClientRects().length) stops.push(remove);
    if (input) stops.push(input);
    const grid = gridFocus && visible(gridFocus) ? gridFocus : firstFocusTarget();
    if (grid) stops.push(grid.querySelector('input'));
    return stops;
  }
  panel.addEventListener('keydown', (event) => {
    if (event.target === remove && event.key === 'Enter') {
      event.preventDefault();
      remove.click();
      return;
    }
    if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return;
    const stops = tabStops();
    if (!stops.length) return;
    event.preventDefault();
    const active = doc.activeElement;
    let index = stops.indexOf(active);
    if (index < 0 && active?.closest?.('.icon-picker-tile')) index = stops.length - 1;
    const next = stops[(index + (event.shiftKey ? -1 : 1) + stops.length) % stops.length];
    if (next.closest('.icon-picker-tile')) focusTile(next.closest('.icon-picker-tile'));
    else next.focus();
  }, { signal });

  body.addEventListener('keydown', (event) => {
    const radio = event.target;
    if (!radio.matches?.('.icon-picker-tile input')) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      radio.click();
      return;
    }
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    // Native radios would check each icon they pass; move focus only.
    event.preventDefault();
    const list = visibleTiles();
    const points = list.map((tile) => {
      const rect = tile.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
    const index = list.indexOf(radio.closest('.icon-picker-tile'));
    if (event.key === 'ArrowUp' && index > -1 && nextTileIndex(points, index, 'ArrowUp') === index && input) {
      input.focus();
      return;
    }
    focusTile(list[nextTileIndex(points, index, event.key, win.getComputedStyle(root).direction === 'rtl')]);
  }, { signal });

  win.addEventListener('resize', schedule, { signal });
  win.addEventListener('scroll', schedule, { signal, capture: true, passive: true });

  collect();
  search?.removeAttribute('hidden');
  status?.removeAttribute('hidden');
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', String(panel.matches(':popover-open')));
  root.dataset.iconPickerReady = '';
  updateTrigger();
  filter();

  const api = {
    /** Re-read tiles after the application replaces them in place. */
    refresh() { if (!disposed) { collect(); updateTrigger(); filter(); } },
    dispose() {
      if (disposed) return;
      disposed = true;
      controller.abort();
      if (frame !== null) win.cancelAnimationFrame(frame);
      delete root.dataset.iconPickerReady;
      trigger.removeAttribute('aria-expanded');
      panel.style.removeProperty('left');
      panel.style.removeProperty('top');
      instances.delete(root);
    },
  };
  instances.set(root, api);
  return api;
}
