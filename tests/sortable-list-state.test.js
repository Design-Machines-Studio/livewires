import test from 'node:test';
import assert from 'node:assert/strict';
import { createMoveState, createRequestId, shouldRestoreFocus } from '../src/js/components/sortable-list-state.js';

test('acceptance clears only the matching pending request', () => {
  const state = createMoveState();
  const move = state.begin({ itemId: 'a', before: 'b', requestId: 'request-a' });

  assert.equal(move.itemId, 'a');
  assert.equal(state.begin({ itemId: 'b', before: '', requestId: 'request-b' }), null);
  assert.equal(state.resolve('unrelated', 'accepted'), null);
  assert.equal(state.pending.requestId, 'request-a');
  assert.equal(state.resolve('request-a', 'accepted').itemId, 'a');
  assert.equal(state.pending, null);
});

test('rejection clears the matching command without changing list order', () => {
  const state = createMoveState();
  state.begin({ itemId: 'a', before: '', requestId: 'reject-me' });

  assert.equal(state.resolve('reject-me', 'rejected').requestId, 'reject-me');
  assert.equal(state.pending, null);
  assert.equal(state.resolve('reject-me', 'accepted'), null);
});

test('each list instance owns an independent pending request', () => {
  const first = createMoveState();
  const second = createMoveState();
  first.begin({ itemId: 'a', before: 'b', requestId: 'first' });
  second.begin({ itemId: 'x', before: '', requestId: 'second' });

  assert.equal(first.resolve('second', 'accepted'), null);
  assert.equal(second.pending.requestId, 'second');
  assert.equal(first.resolve('first', 'rejected').itemId, 'a');
  assert.equal(second.pending.itemId, 'x');
});

test('disconnect invalidates pending results from the previous connection', () => {
  const state = createMoveState();
  const oldConnection = state.connection;
  state.begin({ itemId: 'a', before: 'b', requestId: 'old-request' });
  state.disconnect();
  const nextConnection = state.connection;
  state.begin({ itemId: 'c', before: '', requestId: 'new-request' });

  assert.notEqual(oldConnection, nextConnection);
  assert.equal(state.isCurrent(oldConnection, 'old-request'), false);
  assert.equal(state.resolve('old-request', 'accepted'), null);
  assert.equal(state.pending.requestId, 'new-request');
  assert.equal(state.isCurrent(nextConnection, 'new-request'), true);
});

test('request identifiers are distinct opaque values', () => {
  assert.notEqual(createRequestId(), createRequestId());
});

test('focus returns after a replaced handle only when the user did not move it', () => {
  assert.equal(shouldRestoreFocus({
    wasInside: true,
    focusChanged: false,
    previousStillConnected: false,
    activeIsBodyOrHost: true,
  }), true);
  assert.equal(shouldRestoreFocus({
    wasInside: true,
    focusChanged: true,
    previousStillConnected: false,
    activeIsBodyOrHost: true,
  }), false);
  assert.equal(shouldRestoreFocus({
    wasInside: true,
    focusChanged: false,
    previousStillConnected: false,
    activeIsBodyOrHost: false,
  }), false);
});
