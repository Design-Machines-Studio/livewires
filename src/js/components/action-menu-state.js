/** Geometry is in layout-viewport CSS pixels, including a visual viewport offset. */
export function placeMenu(anchor, size, viewport, beside = false, rtl = false, gap = 4) {
  const left = viewport.left ?? 0;
  const top = viewport.top ?? 0;
  const width = Math.max(0, viewport.width - gap * 2);
  const height = Math.max(0, viewport.height - gap * 2);
  const w = Math.min(size.width, width);
  const h = Math.min(size.height, height);
  const right = left + viewport.width - gap;
  const bottom = top + viewport.height - gap;
  let x = rtl ? anchor.right - w : anchor.left;
  let y = anchor.bottom + gap;
  if (beside) {
    x = rtl ? anchor.left - w - gap : anchor.right + gap;
    if (x < left + gap || x + w > right) x = rtl ? anchor.right + gap : anchor.left - w - gap;
    y = anchor.top;
  } else if (y + h > bottom && anchor.top - h - gap >= top + gap) {
    y = anchor.top - h - gap;
  }
  return {
    x: Math.max(left + gap, Math.min(x, right - w)),
    y: Math.max(top + gap, Math.min(y, bottom - h)),
    maxWidth: width, maxHeight: height,
  };
}

export function nextMenuIndex(length, current, key) {
  if (!length) return -1;
  if (key === 'Home') return 0;
  if (key === 'End') return length - 1;
  if (key === 'ArrowDown') return (current + 1 + length) % length;
  if (key === 'ArrowUp') return (current - 1 + length) % length;
  return current;
}

export function matchingMenuIndex(labels, current, text) {
  const query = text.trim().toLocaleLowerCase();
  if (!query) return -1;
  for (let step = 1; step <= labels.length; step++) {
    const index = (current + step + labels.length) % labels.length;
    if (labels[index].trim().toLocaleLowerCase().startsWith(query)) return index;
  }
  return -1;
}
