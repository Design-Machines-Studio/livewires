import test from 'node:test';
import assert from 'node:assert/strict';
import { createInlineEditState } from '../src/js/components/inline-edit-state.js';

function make(contextId = 'record:opaque', value = 'Original') {
  const events = [];
  const editor = createInlineEditState({ contextId, value, onEvent: (type, detail) => events.push({ type, ...detail }) });
  const result = (outcome, extra = {}) => ({ ...events.findLast(e => e.type === 'commit'), outcome, ...extra });
  return { editor, events, result };
}

test('request and unchanged commit count once; no save event for unchanged values', () => {
  const { editor, events } = make();
  assert.equal(editor.request(), true);
  assert.equal(editor.request(), false);
  assert.equal(editor.commit(), true);
  assert.equal(editor.commit(), false);
  assert.deepEqual(events.map(e => e.type), ['request', 'cancel']);
  assert.equal(events[1].reason, 'unchanged');
  assert.equal(editor.state.message, 'No changes to save.');
  assert.equal(events[0].editId, events[1].editId);
});

test('pending/unknown completion retains text; only matching confirmation changes the value', () => {
  const { editor, result } = make();
  editor.request(); editor.setDraft('Entered'); editor.commit();
  assert.equal(editor.state.phase, 'pending');
  assert.equal(editor.commit(), false);
  assert.equal(editor.setDraft('Second'), false);
  assert.equal(editor.applyResult(result('unknown')), true);
  assert.equal(editor.state.phase, 'unknown');
  assert.equal(editor.state.confirmed, 'Original');
  assert.equal(editor.state.draft, 'Entered');
  assert.equal(editor.applyResult(result('confirmed', { value: 'Application normalized' })), true);
  assert.equal(editor.state.confirmed, 'Application normalized');
  assert.equal(editor.applyResult(result('confirmed', { value: 'Duplicate' })), false);
});

test('rejection preserves exact entered value and error until an explicit retry', () => {
  const { editor, result, events } = make();
  editor.request(); editor.setDraft('  Keep spaces  '); editor.commit();
  const old = result('confirmed', { value: 'Late old result' });
  editor.applyResult(result('rejected', { message: 'Choose a shorter title.' }));
  assert.equal(editor.state.phase, 'rejected');
  assert.equal(editor.state.draft, '  Keep spaces  ');
  assert.equal(editor.state.message, 'Choose a shorter title.');
  editor.setDraft('Shorter'); editor.commit();
  assert.notEqual(events.at(-1).requestId, old.requestId);
  assert.equal(editor.applyResult(old), false);
  editor.applyResult(result('confirmed', { value: 'Shorter' }));
  assert.equal(editor.state.phase, 'confirmed');
});

test('two editor lifetimes cannot accept foreign, cancelled or stale responses', () => {
  const a = make('same-context'); const b = make('same-context');
  for (const { editor } of [a, b]) { editor.request(); editor.setDraft('Changed'); editor.commit(); }
  const old = a.result('confirmed', { value: 'Late' });
  assert.equal(b.editor.applyResult(old), false);
  a.editor.cancel('escape');
  assert.equal(a.events.at(-1).uncertain, true);
  assert.match(a.editor.state.message, /may still have applied/);
  a.editor.request(); a.editor.setDraft('New'); a.editor.commit();
  assert.equal(a.editor.applyResult(old), false);
  assert.equal(b.editor.state.phase, 'pending');
});

test('intervening application update preserves draft and original comparison without acknowledging a save', () => {
  const { editor, result } = make();
  editor.request(); editor.setDraft('Draft');
  editor.updateConfirmed('External update');
  assert.equal(editor.state.draft, 'Draft');
  assert.equal(editor.state.original, 'Original');
  editor.commit(); editor.updateConfirmed('Another update');
  assert.equal(editor.state.phase, 'pending');
  assert.equal(editor.state.draft, 'Draft');
  editor.applyResult(result('rejected'));
  editor.cancel();
  assert.equal(editor.state.draft, 'Another update');
});

test('disposal invalidates editing and pending state and all late results', () => {
  for (const pending of [false, true]) {
    const { editor, result } = make();
    editor.request(); editor.setDraft('Draft');
    if (pending) editor.commit();
    const late = result('confirmed', { value: 'Late' });
    editor.dispose(); editor.dispose();
    assert.equal(editor.state.phase, 'disposed');
    assert.equal(editor.request(), false);
    assert.equal(editor.commit(), false);
    assert.equal(editor.cancel(), false);
    assert.equal(editor.updateConfirmed('New'), false);
    assert.equal(editor.applyResult(late), false);
  }
});

test('invalid matching outcomes cannot silently confirm saves', () => {
  assert.throws(() => createInlineEditState({ contextId: '' }), /contextId/);
  const { editor, result } = make();
  editor.request(); editor.setDraft('Draft'); editor.commit();
  assert.throws(() => editor.applyResult(result('saved')), /confirmed/);
  assert.throws(() => editor.applyResult(result('confirmed', { value: undefined })), /value/);
  assert.equal(editor.state.phase, 'pending');
});

test('opaque identities work without secure-context randomUUID', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  const random = globalThis.crypto.getRandomValues.bind(globalThis.crypto);
  try {
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { getRandomValues: random } });
    const { editor, events } = make();
    editor.request(); editor.setDraft('HTTP draft'); editor.commit();
    assert.match(events[0].editId, /^[0-9a-f]{32}$/);
    assert.match(events[1].requestId, /^[0-9a-f]{32}$/);
    assert.notEqual(events[0].editId, events[1].requestId);
  } finally {
    Object.defineProperty(globalThis, 'crypto', original);
  }
});
