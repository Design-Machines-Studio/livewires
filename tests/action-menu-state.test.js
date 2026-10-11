import test from 'node:test';
import assert from 'node:assert/strict';
import { placeMenu, nextMenuIndex, matchingMenuIndex } from '../src/js/components/action-menu-state.js';

const view = { width: 320, height: 480 };
test('root flips above at the bottom and clamps at the right edge', () => {
  const p = placeMenu({ left: 300, right: 320, top: 440, bottom: 470 }, { width: 160, height: 200 }, view);
  assert.equal(p.x, 156);
  assert.equal(p.y, 236);
});
test('submenus flip beside their opener and fit mobile viewports', () => {
  const p = placeMenu({ left: 200, right: 300, top: 450, bottom: 480 }, { width: 180, height: 240 }, view, true);
  assert.equal(p.x, 16);
  assert.equal(p.y, 236);
});
test('zoomed visual viewport offsets constrain both menu dimensions', () => {
  const p = placeMenu({ left: 300, right: 360, top: 500, bottom: 520 }, { width: 500, height: 800 }, { left: 100, top: 200, width: 160, height: 240 });
  assert.deepEqual(p, { x: 104, y: 204, maxWidth: 152, maxHeight: 232 });
});
test('RTL submenus prefer the left then flip to the right', () => {
  assert.equal(placeMenu({ left: 250, right: 280, top: 20, bottom: 50 }, { width: 120, height: 80 }, view, true, true).x, 126);
  assert.equal(placeMenu({ left: 20, right: 50, top: 20, bottom: 50 }, { width: 120, height: 80 }, view, true, true).x, 54);
});
test('point menus clamp even if the context point is outside the visual viewport', () => {
  const p = placeMenu({ left: -5, right: -5, top: -5, bottom: -5 }, { width: 100, height: 100 }, view);
  assert.equal(p.x, 4);
  assert.equal(p.y, 4);
});
test('navigation wraps and Home/End target available items', () => {
  assert.equal(nextMenuIndex(3, 2, 'ArrowDown'), 0);
  assert.equal(nextMenuIndex(3, 0, 'ArrowUp'), 2);
  assert.equal(nextMenuIndex(3, 1, 'Home'), 0);
  assert.equal(nextMenuIndex(3, 0, 'End'), 2);
  assert.equal(nextMenuIndex(0, -1, 'ArrowDown'), -1);
});
test('typeahead wraps, ignores case/whitespace, and reports no match', () => {
  const labels = ['  Archive ', 'Duplicate', 'Download', 'Export'];
  assert.equal(matchingMenuIndex(labels, 0, 'd'), 1);
  assert.equal(matchingMenuIndex(labels, 1, 'd'), 2);
  assert.equal(matchingMenuIndex(labels, 3, 'ARCH'), 0);
  assert.equal(matchingMenuIndex(labels, 0, 'missing'), -1);
  assert.equal(matchingMenuIndex([], -1, 'a'), -1);
});
test('all placements fit across edges, small viewports, and direction', () => {
  for (const width of [160, 320, 1440]) for (const height of [120, 480, 900]) {
    for (const rtl of [true, false]) for (const beside of [true, false]) {
      for (const x of [0, width / 2, width]) for (const y of [0, height / 2, height]) {
        const size = { width: 240, height: 360 };
        const p = placeMenu({ left: x, right: x + 20, top: y, bottom: y + 20 }, size, { width, height }, beside, rtl);
        assert.ok(p.x >= 4 && p.y >= 4);
        assert.ok(p.x + Math.min(size.width, p.maxWidth) <= width - 4);
        assert.ok(p.y + Math.min(size.height, p.maxHeight) <= height - 4);
      }
    }
  }
});
