/** Lowercase, accent-free words for matching names and tags. */
export function foldIconText(value) {
  return String(value ?? '').normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase().replace(/[-_]+/g, ' ').trim();
}

/** Every query word must appear in the icon's name or tags. */
export function matchesIcon(query, name, tags = '') {
  const words = foldIconText(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = `${foldIconText(name)} ${foldIconText(tags)}`;
  return words.every((word) => haystack.includes(word));
}

/**
 * Picks the next tile from visible tile centres, so movement follows the
 * rendered grid across category sections. Returns the current index when
 * there is nowhere to go.
 */
export function nextTileIndex(points, current, key, rtl = false) {
  if (!points.length) return -1;
  if (key === 'Home') return 0;
  if (key === 'End') return points.length - 1;
  if (current < 0 || current >= points.length) return 0;
  const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
  const back = rtl ? 'ArrowRight' : 'ArrowLeft';
  if (key === forward) return Math.min(current + 1, points.length - 1);
  if (key === back) return Math.max(current - 1, 0);
  if (key !== 'ArrowDown' && key !== 'ArrowUp') return current;
  const from = points[current];
  const down = key === 'ArrowDown';
  let rowY = null;
  let best = current;
  let bestDistance = Infinity;
  const order = down ? points.map((_, i) => i) : points.map((_, i) => points.length - 1 - i);
  for (const index of order) {
    const point = points[index];
    const beyond = down ? point.y > from.y + 1 : point.y < from.y - 1;
    if (!beyond) continue;
    if (rowY === null) rowY = point.y;
    if (Math.abs(point.y - rowY) > 1) break;
    const distance = Math.abs(point.x - from.x);
    if (distance < bestDistance) { best = index; bestDistance = distance; }
  }
  return best;
}

/** Most recent first, unique, limited. */
export function rememberIcon(list, value, limit = 8) {
  if (!value) return list.slice(0, limit);
  return [value, ...list.filter((item) => item !== value)].slice(0, limit);
}

/**
 * Places the panel below the trigger, or above when it does not fit, kept
 * inside the viewport. Self-contained so the bundle shares no chunks.
 */
export function placePanel(anchor, size, viewport, rtl = false, gap = 4) {
  const left = viewport.left ?? 0;
  const top = viewport.top ?? 0;
  const right = left + viewport.width - gap;
  const bottom = top + viewport.height - gap;
  const w = Math.min(size.width, viewport.width - gap * 2);
  const h = Math.min(size.height, viewport.height - gap * 2);
  let x = rtl ? anchor.right - w : anchor.left;
  let y = anchor.bottom + gap;
  if (y + h > bottom && anchor.top - h - gap >= top + gap) y = anchor.top - h - gap;
  return { x: Math.max(left + gap, Math.min(x, right - w)), y: Math.max(top + gap, Math.min(y, bottom - h)) };
}
