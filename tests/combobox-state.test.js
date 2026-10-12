import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createComboboxState, foldChoice } from '../src/js/components/combobox-state.js';

const items = [{ value: '', label: 'Use organization default' }, { value: 'America/Sao_Paulo', label: 'São Paulo' },
  { value: 'Europe/Paris', label: 'Paris' }, { value: 'Asia/Makassar', label: 'Makassar', disabled: true }];
function make(config = {}) { let id = 0; return createComboboxState({ createId: () => `opaque-${++id}`, ...config }); }

test('local search folds accents and case without changing option values', () => {
  const state = make(); state.setOptions(items); state.setQuery('SAO');
  assert.equal(foldChoice('SÃO'), 'sao');
  assert.deepEqual(state.state.items.map(item => item.value), ['America/Sao_Paulo']);
  state.setQuery('asia'); assert.equal(state.state.items[0].disabled, true);
});
test('local empty query keeps the meaningful empty default choice', () => {
  const state = make(); state.setOptions(items); state.setQuery('');
  assert.equal(state.state.items[0].value, ''); assert.equal(state.state.items.length, 4);
});
test('editing invalidates a reply immediately, including before next debounce', () => {
  const state = make({ mode: 'remote' }); const first = state.setQuery('Pa'); const second = state.setQuery('Par');
  assert.equal(state.applyResults({ ...first, items }), false);
  assert.equal(state.applyResults({ ...second, items }), true);
  assert.equal(state.applyResults({ ...second, items: [] }), false);
});
test('short queries, composition and reset invalidate all previous results', () => {
  const state = make({ mode: 'remote' }); let request = state.setQuery('東京');
  state.setQuery('東'); assert.equal(state.applyResults({ ...request, items }), false);
  assert.equal(state.state.phase, 'short');
  request = state.setQuery('東京'); state.setQuery('東京都', { composing: true });
  assert.equal(state.state.phase, 'composing'); assert.equal(state.applyResults({ ...request, items }), false);
  request = state.setQuery('東京都'); state.invalidate(); assert.equal(state.applyResults({ ...request, items }), false);
});
test('two controls cannot consume foreign results; query text must match too', () => {
  const first = make({ mode: 'remote' }), second = createComboboxState({ mode: 'remote' });
  const request = first.setQuery('Pa'); second.setQuery('Pa');
  assert.equal(second.applyResults({ ...request, items }), false);
  assert.equal(first.applyResults({ ...request, query: 'different', items }), false);
});
test('result windows are bounded; errors and empty responses remain distinct', () => {
  const state = make({ mode: 'remote', maxResults: 2 }); let request = state.setQuery('Pa');
  state.applyResults({ ...request, items }); assert.equal(state.state.items.length, 2); assert.equal(state.state.truncated, true);
  request = state.setQuery('none'); state.applyResults({ ...request, items: [] }); assert.equal(state.state.phase, 'results');
  request = state.setQuery('fail'); state.applyResults({ ...request, error: 'Try again.' }); assert.equal(state.state.phase, 'error');
  assert.equal(state.state.error, 'Try again.'); assert.equal(state.state.items.length, 0);
});
test('malformed current results fail atomically; stale malformed results are ignored', () => {
  const state = make({ mode: 'remote' }); const old = state.setQuery('Pa'), request = state.setQuery('Par');
  assert.equal(state.applyResults({ ...old, items: 'broken' }), false);
  assert.throws(() => state.applyResults({ ...request, items: [{ value: 'x', label: 'X' }, { value: 'x', label: 'Y' }] }), TypeError);
  assert.equal(state.state.phase, 'loading');
  assert.equal(state.applyResults({ ...request, items }), true);
});
test('query strings stay Unicode and length uses code points', () => {
  const state = make({ mode: 'remote' });
  assert.equal(state.setQuery('😀'), null);
  assert.equal(state.setQuery('  São  ').query, 'São');
});
test('options patched while searching retain the current query', () => {
  const state = make(); state.setOptions(items); state.setQuery('sao');
  state.setOptions([{ value: 'zone', label: 'São Tomé' }]);
  assert.equal(state.state.query, 'sao'); assert.equal(state.state.items[0].value, 'zone');
});
test('disposal invalidates requests and releases all option windows', () => {
  const state = make({ mode: 'remote' }); const request = state.setQuery('Pa'); state.dispose();
  assert.equal(state.setQuery('other'), null); assert.equal(state.applyResults({ ...request, items }), false);
  assert.equal(state.state.phase, 'disposed'); assert.equal(state.state.items.length, 0);
});
test('invalid configuration and duplicate source values are rejected', () => {
  for (const config of [{ mode: 'multiple' }, { minLength: -1 }, { maxResults: 0 }, { minLength: 1.5 }]) assert.throws(() => make(config), TypeError);
  assert.throws(() => make().setOptions([{ value: 'x', label: 'X' }, { value: 'x', label: 'X' }]), TypeError);
});
