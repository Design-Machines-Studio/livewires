import { test } from 'node:test';
import assert from 'node:assert/strict';
import { foldIconText, matchesIcon, nextTileIndex, placePanel, rememberIcon } from '../src/js/components/icon-picker-state.js';

test('search matches names and tags across words, case and accents', () => {
  assert.equal(foldIconText('Users-Three'), 'users three');
  assert.ok(matchesIcon('home', 'house', 'homes buildings places'));
  assert.ok(matchesIcon('USERS three', 'users-three', ''));
  assert.ok(matchesIcon('café', 'coffee', 'cafe drinks'));
  assert.ok(matchesIcon('  ', 'anything'));
  assert.equal(matchesIcon('house boat', 'house', 'homes'), false);
});

// Two sections: a full row of three, a short row of two, then a new section of three.
const points = [
  { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 },
  { x: 0, y: 10 }, { x: 10, y: 10 },
  { x: 0, y: 30 }, { x: 10, y: 30 }, { x: 20, y: 30 },
];

test('arrow keys follow the rendered grid without wrapping rows', () => {
  assert.equal(nextTileIndex(points, 0, 'ArrowRight'), 1);
  assert.equal(nextTileIndex(points, 2, 'ArrowRight'), 3);
  assert.equal(nextTileIndex(points, 0, 'ArrowLeft'), 0);
  assert.equal(nextTileIndex(points, 7, 'ArrowRight'), 7);
  assert.equal(nextTileIndex(points, 1, 'ArrowDown'), 4);
  assert.equal(nextTileIndex(points, 2, 'ArrowDown'), 4, 'short rows take the nearest column');
  assert.equal(nextTileIndex(points, 4, 'ArrowDown'), 6, 'crosses into the next section');
  assert.equal(nextTileIndex(points, 7, 'ArrowUp'), 4);
  assert.equal(nextTileIndex(points, 0, 'ArrowUp'), 0);
  assert.equal(nextTileIndex(points, 3, 'Home'), 0);
  assert.equal(nextTileIndex(points, 3, 'End'), 7);
  assert.equal(nextTileIndex(points, 1, 'ArrowLeft', true), 2, 'right-to-left swaps horizontal keys');
  assert.equal(nextTileIndex([], 0, 'ArrowDown'), -1);
});

test('recent icons stay unique, newest first and limited', () => {
  assert.deepEqual(rememberIcon(['a', 'b', 'c'], 'b', 3), ['b', 'a', 'c']);
  assert.deepEqual(rememberIcon(['a', 'b', 'c'], 'd', 3), ['d', 'a', 'b']);
  assert.deepEqual(rememberIcon(['a'], '', 3), ['a']);
});

test('panel opens below the trigger, flips above, and stays in the viewport', () => {
  const view = { left: 0, top: 0, width: 400, height: 600 };
  assert.deepEqual(placePanel({ left: 10, right: 54, top: 10, bottom: 54 }, { width: 300, height: 200 }, view), { x: 10, y: 58 });
  assert.deepEqual(placePanel({ left: 10, right: 54, top: 500, bottom: 544 }, { width: 300, height: 200 }, view), { x: 10, y: 296 });
  assert.deepEqual(placePanel({ left: 350, right: 394, top: 10, bottom: 54 }, { width: 300, height: 200 }, view), { x: 96, y: 58 });
  assert.deepEqual(placePanel({ left: 350, right: 394, top: 10, bottom: 54 }, { width: 300, height: 200 }, view, true), { x: 94, y: 58 });
});
