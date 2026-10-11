import test from 'node:test';
import assert from 'node:assert/strict';
import { createToastRegionState } from '../src/js/components/toast-region-state.js';

export function fakeClock() {
  let time = 0;
  let serial = 0;
  const timers = new Map();
  return {
    now: () => time,
    setTimeout(fn, ms) { const id = ++serial; timers.set(id, { at: time + ms, fn }); return id; },
    clearTimeout(id) { timers.delete(id); },
    advance(ms) {
      const end = time + ms;
      while (true) {
        const next = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        time = next[1].at;
        timers.delete(next[0]);
        next[1].fn();
      }
      time = end;
    },
    get pending() { return timers.size; },
  };
}
const timed = (id, duration = 1000) => ({ id, duration });
const message = (region, id) => region.state.messages.find((m) => m.id === id);

test('unrelated repeated patches and duplicate deliveries retain the exact deadline', () => {
  const clock = fakeClock();
  const region = createToastRegionState({ clock });
  region.sync([timed('a')]);
  clock.advance(350);
  for (let n = 0; n < 10; n++) region.sync([timed('a', 5000), timed('a')]);
  assert.equal(region.state.messages.length, 1);
  assert.equal(message(region, 'a').remaining, 650);
  assert.equal(clock.pending, 1);
  clock.advance(650);
  assert.equal(message(region, 'a').expired, true);
  region.sync([timed('a')]);
  assert.equal(message(region, 'a').active, false);
  assert.equal(clock.pending, 0);
});

test('local dismissal survives updates, removal and reinsertion', () => {
  const clock = fakeClock();
  const region = createToastRegionState({ clock });
  region.sync([timed('a')]);
  assert.equal(region.dismiss('a'), true);
  assert.equal(region.dismiss('a'), false);
  region.sync([]);
  clock.advance(10000);
  region.sync([timed('a')]);
  assert.equal(message(region, 'a').dismissed, true);
  assert.equal(message(region, 'a').active, false);
  assert.equal(clock.pending, 0);
});

test('hover and focus pauses combine and resume the remaining duration', () => {
  const clock = fakeClock();
  const region = createToastRegionState({ clock });
  region.sync([timed('a')]);
  clock.advance(400);
  region.pause('a', 'hover', true);
  region.pause('a', 'focus', true);
  clock.advance(2000);
  region.pause('a', 'hover', false);
  clock.advance(2000);
  assert.equal(message(region, 'a').remaining, 600);
  assert.equal(clock.pending, 0);
  region.pause('a', 'focus', false);
  clock.advance(599);
  assert.equal(message(region, 'a').expired, false);
  clock.advance(1);
  assert.equal(message(region, 'a').expired, true);
});

test('removal suspends a running timer; reinsertion resumes, never restarts', () => {
  const clock = fakeClock();
  const region = createToastRegionState({ clock });
  region.sync([timed('a')]);
  clock.advance(300);
  region.sync([]);
  assert.equal(clock.pending, 0);
  clock.advance(5000);
  region.sync([timed('a')]);
  assert.equal(message(region, 'a').remaining, 700);
  clock.advance(700);
  assert.equal(message(region, 'a').expired, true);
});

test('two region scopes use the same ID independently', () => {
  const clock = fakeClock();
  const left = createToastRegionState({ clock });
  const right = createToastRegionState({ clock });
  left.sync([timed('same')]);
  right.sync([timed('same', 2000)]);
  left.dismiss('same');
  clock.advance(1000);
  assert.equal(message(right, 'same').active, true);
  assert.equal(message(right, 'same').remaining, 1000);
  left.dispose();
  clock.advance(1000);
  assert.equal(message(right, 'same').expired, true);
});

test('older occurrence reinsertion never evicts an admitted focused action', () => {
  const clock = fakeClock();
  const region = createToastRegionState({ clock, maxVisible: 1 });
  region.sync([timed('older')]);
  clock.advance(300);
  region.sync([{ id: 'action', sticky: true }]);
  region.pause('action', 'focus', true);
  region.sync([timed('older'), { id: 'action', sticky: true }]);
  clock.advance(5000);
  assert.equal(message(region, 'action').active, true);
  assert.equal(message(region, 'older').queued, true);
  assert.equal(message(region, 'older').remaining, 700);
  region.dismiss('action');
  assert.equal(message(region, 'older').active, true);
  clock.advance(700);
  assert.equal(message(region, 'older').expired, true);
  region.dispose();
});

test('sticky messages never expire and discovering an action stops a timer', () => {
  const clock = fakeClock();
  const region = createToastRegionState({ clock });
  region.sync([{ id: 'error', duration: 1, sticky: true }, { id: 'pending' }, timed('action')]);
  clock.advance(200);
  region.sync([{ id: 'error' }, { id: 'pending' }, { ...timed('action'), sticky: true }]);
  clock.advance(10000);
  for (const m of region.state.messages) assert.equal(m.expired, false);
  assert.equal(clock.pending, 0);
  region.sync([timed('error'), timed('pending'), timed('action')]);
  assert.equal(clock.pending, 0);
});

test('bounded queue never evicts a sticky/focused active message; timing begins at admission', () => {
  const clock = fakeClock();
  const region = createToastRegionState({ maxVisible: 2, clock });
  region.sync([{ id: 'sticky' }, timed('focused'), timed('queued')]);
  region.pause('focused', 'focus', true);
  clock.advance(5000);
  assert.deepEqual(region.state.messages.filter((m) => m.active).map((m) => m.id), ['sticky', 'focused']);
  assert.equal(message(region, 'queued').queued, true);
  assert.equal(message(region, 'queued').remaining, 1000);
  region.dismiss('sticky');
  assert.equal(message(region, 'focused').active, true);
  assert.equal(message(region, 'queued').active, true);
  clock.advance(1000);
  assert.equal(message(region, 'queued').expired, true);
  assert.equal(message(region, 'focused').expired, false);
});

test('intentional absent-ID reuse requires forget; mounted IDs cannot be forgotten', () => {
  const clock = fakeClock();
  const region = createToastRegionState({ clock });
  region.sync([timed('a')]);
  region.dismiss('a');
  assert.throws(() => region.forget('a'), /Remove/);
  region.sync([]);
  assert.equal(region.forget('a'), true);
  assert.equal(region.forget('a'), false);
  region.sync([timed('a')]);
  assert.equal(message(region, 'a').active, true);
  clock.advance(1000);
  assert.equal(message(region, 'a').expired, true);
});

test('teardown clears timers and rejects late delivery without affecting other state', () => {
  const clock = fakeClock();
  const region = createToastRegionState({ clock });
  region.sync([timed('a'), timed('b')]);
  assert.equal(clock.pending, 2);
  region.dispose();
  region.dispose();
  assert.equal(clock.pending, 0);
  assert.equal(region.sync([timed('c')]), false);
  assert.equal(region.pause('a', 'focus', true), false);
  assert.equal(region.dismiss('a'), false);
  clock.advance(10000);
  assert.deepEqual(region.state, { disposed: true, messages: [] });
});

test('invalid updates are atomic and native callers receive an explicit error', () => {
  assert.throws(() => createToastRegionState({ maxVisible: 0 }), /positive integer/);
  const clock = fakeClock();
  const region = createToastRegionState({ clock });
  region.sync([timed('a')]);
  assert.throws(() => region.sync([timed('b'), timed('')]), /ID/);
  assert.throws(() => region.sync([timed('a', Infinity)]), /duration/);
  assert.equal(message(region, 'a').active, true);
  assert.equal(message(region, 'b'), undefined);
  region.dispose();
});
