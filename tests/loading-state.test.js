import test from 'node:test';
import assert from 'node:assert/strict';
import { createLoadingState } from '../src/js/components/loading-state.js';
import { attachDatastarLoading } from '../src/js/components/loading-datastar.js';

function setup(options = {}) {
  let time = 0;
  let sequence = 0;
  const timers = new Map();
  const changes = [];
  const state = createLoadingState({ delay: 100, minDuration: 200, now: () => time,
    setTimeout(callback, delay) { const id = ++sequence; timers.set(id, { at: time + delay, callback }); return id; },
    clearTimeout(id) { timers.delete(id); }, onChange: (value) => changes.push(value), ...options });
  function advance(duration) {
    const target = time + duration;
    while (true) {
      const next = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0];
      if (!next || next[1].at > target) break;
      time = next[1].at;
      timers.delete(next[0]);
      next[1].callback();
    }
    time = target;
  }
  return { state, advance, timers, changes };
}

test('short requests never flash and never imply saved', () => {
  const { state, advance, timers } = setup();
  const request = state.begin();
  assert.equal(state.state.busy, true);
  advance(99);
  request.finish();
  advance(500);
  assert.deepEqual(state.state, { pending: 0, busy: false, visible: false, phase: 'unknown' });
  assert.equal(timers.size, 0);
});

test('busy ends immediately but shown skeleton has minimum duration', () => {
  const { state, advance } = setup();
  const request = state.begin();
  advance(100);
  assert.equal(state.state.visible, true);
  advance(50);
  request.finish();
  assert.equal(state.state.busy, false);
  assert.equal(state.state.visible, true);
  advance(149);
  assert.equal(state.state.visible, true);
  advance(1);
  assert.equal(state.state.visible, false);
});

test('overlap retains pending and a failure cannot be overwritten by completion', () => {
  const { state, advance } = setup();
  const first = state.begin();
  advance(80);
  const second = state.begin();
  first.finish('failed');
  assert.equal(state.state.phase, 'pending');
  advance(20);
  assert.equal(state.state.visible, true, 'overlap does not restart the appearance delay');
  assert.equal(second.finish(), true);
  assert.equal(second.finish(), false, 'duplicate terminal events are harmless');
  assert.equal(state.state.phase, 'failed');
  const nextBatch = state.begin();
  nextBatch.finish();
  assert.equal(state.state.phase, 'unknown');
});

test('request started in the minimum-duration tail keeps the indicator continuous', () => {
  const { state, advance } = setup();
  const first = state.begin();
  advance(110);
  first.finish();
  advance(40);
  const second = state.begin();
  advance(200);
  assert.equal(state.state.visible, true);
  assert.equal(state.state.busy, true);
  second.finish();
  assert.equal(state.state.visible, false);
});

test('abort is terminal locally even if the transport never settles', () => {
  const { state, advance, timers } = setup();
  const controller = new AbortController();
  const request = state.begin({ signal: controller.signal });
  advance(120);
  controller.abort();
  assert.equal(state.state.busy, false);
  assert.equal(state.state.phase, 'cancelled');
  assert.equal(request.finish('failed'), false);
  advance(180);
  assert.equal(timers.size, 0);
  const before = state.state;
  state.begin({ signal: controller.signal });
  assert.deepEqual(state.state, before);
});

test('dispose removes timers and abort listeners without cancelling application work', () => {
  const { state, advance, timers, changes } = setup();
  const controller = new AbortController();
  const request = state.begin({ signal: controller.signal });
  state.dispose();
  const count = changes.length;
  assert.equal(timers.size, 0);
  assert.equal(controller.signal.aborted, false);
  controller.abort();
  advance(500);
  assert.equal(changes.length, count);
  assert.equal(request.finish(), false);
  assert.throws(() => state.begin(), /disposed/);
});

test('operations are isolated, duration values validated and saved rejected', () => {
  const a = setup({ delay: 0, minDuration: 0 }).state;
  const b = setup().state;
  const request = a.begin();
  assert.equal(a.state.visible, true);
  assert.equal(b.state.busy, false);
  assert.throws(() => request.finish('saved'), /application-owned/);
  assert.throws(() => createLoadingState({ delay: NaN }), /nonnegative/);
  assert.throws(() => createLoadingState({ minDuration: -1 }), /nonnegative/);
  request.finish();
});

function event(target, request) {
  const evt = new Event('datastar-fetch');
  evt.request = request;
  target.dispatchEvent(evt);
}

test('Datastar selector ignores unrelated/background requests and keeps retry state', () => {
  const { state } = setup();
  const target = new EventTarget();
  const disconnect = attachDatastarLoading(state, { target, selectRequest: (e) => e.request.scope === 'editor' ? e.request : null });
  const send = (request) => event(target, { scope: 'editor', ...request });
  send({ id: 'stream', phase: 'started', background: true });
  send({ id: 'other', phase: 'started', scope: 'dashboard' });
  send({ id: 'a', phase: 'started' });
  send({ id: 'a', phase: 'started' });
  send({ id: 'b', phase: 'started' });
  send({ id: 'a', phase: 'retrying' });
  send({ id: 'a', phase: 'error' });
  assert.equal(state.state.pending, 2);
  send({ id: 'unknown', phase: 'finished' });
  send({ id: 'a', phase: 'failed' });
  assert.equal(state.state.pending, 1);
  send({ id: 'b', phase: 'finished' });
  assert.equal(state.state.phase, 'failed');
  disconnect();
  send({ id: 'new', phase: 'started' });
  assert.equal(state.state.pending, 0);
});

test('adapter releases signal-cancelled identity and disposal settles its remaining tokens', () => {
  const { state } = setup();
  const target = new EventTarget();
  const stop = attachDatastarLoading(state, { target, selectRequest: (e) => e.request });
  const controller = new AbortController();
  event(target, { id: 'a', phase: 'started', signal: controller.signal });
  controller.abort();
  assert.equal(state.state.pending, 0);
  event(target, { id: 'a', phase: 'started' });
  assert.equal(state.state.pending, 1);
  stop();
  stop();
  assert.equal(state.state.pending, 0);
  assert.equal(state.state.phase, 'cancelled');
});
