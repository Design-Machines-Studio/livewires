import test from 'node:test';
import assert from 'node:assert/strict';
import { createLoadingOperation } from '../src/js/components/loading.js';

// Small DOM seam for lifecycle checks; actual DOM/CSS cases live in loading-tests.html.
function fixture() {
  const element = () => ({ attributes: new Map(), hidden: true, textContent: '',
    setAttribute(k, v) { this.attributes.set(k, v); }, getAttribute(k) { return this.attributes.get(k) ?? null; },
    removeAttribute(k) { this.attributes.delete(k); }, contains(n) { return this.child === n; } });
  const targets = { content: element(), indicator: element(), status: element() };
  let update;
  let disconnected = false;
  class Observer {
    constructor(callback) { update = callback; }
    observe() {}
    disconnect() { disconnected = true; }
  }
  const root = { isConnected: true, querySelector: (selector) => targets[selector] ?? null,
    ownerDocument: { defaultView: { MutationObserver: Observer } } };
  const start = () => createLoadingOperation({ root, content: 'content', indicator: 'indicator', status: 'status', delay: 0, minDuration: 0 });
  return { targets, root, element, start, update: () => update(), get disconnected() { return disconnected; } };
}

test('DOM patches rebind targets without acknowledging the pending operation', () => {
  const f = fixture();
  const op = f.start();
  const a = op.begin();
  const b = op.begin();
  const old = f.targets.content;
  f.targets.content = f.element();
  f.targets.indicator = f.element();
  f.targets.status = f.element();
  f.update();
  assert.equal(op.state.pending, 2);
  assert.equal(old.getAttribute('aria-busy'), null);
  assert.equal(f.targets.content.getAttribute('aria-busy'), 'true');
  assert.equal(f.targets.indicator.hidden, false);
  assert.equal(f.targets.status.textContent, 'Request pending.');
  a.finish('failed');
  f.targets.content.removeAttribute('aria-busy');
  f.update();
  assert.equal(f.targets.content.getAttribute('aria-busy'), 'true');
  b.finish();
  assert.equal(f.targets.content.getAttribute('aria-busy'), 'false');
  assert.match(f.targets.status.textContent, /failed/);
  op.dispose();
});

test('removing the root releases local subscriptions and leaves late results harmless', () => {
  const f = fixture();
  const op = f.start();
  const token = op.begin();
  f.root.isConnected = false;
  f.update();
  assert.equal(f.disconnected, true);
  assert.equal(op.state.phase, 'disposed');
  assert.equal(f.targets.indicator.hidden, true);
  assert.equal(f.targets.content.getAttribute('aria-busy'), null);
  assert.equal(token.finish(), false);
});

test('removing a required target cleans the other targets and rejects reuse', () => {
  const f = fixture();
  const op = f.start();
  op.begin();
  delete f.targets.status;
  f.update();
  assert.equal(f.disconnected, true);
  assert.equal(f.targets.indicator.hidden, true);
  assert.throws(() => op.begin(), /disposed/);
});

test('announcements inside busy content are rejected, including later invalid patches', () => {
  const f = fixture();
  f.targets.content.child = f.targets.status;
  assert.throws(f.start, /outside/);
  f.targets.content.child = null;
  const op = f.start();
  op.begin();
  f.targets.content.child = f.targets.status;
  f.update();
  assert.equal(op.state.phase, 'disposed');
  assert.equal(f.targets.content.getAttribute('aria-busy'), null);
});

test('a patch that replaces busy targets but removes status clears both old and new targets', () => {
  const f = fixture();
  const op = f.start();
  const token = op.begin();
  const old = { ...f.targets };
  f.targets.content = f.element();
  f.targets.content.setAttribute('aria-busy', 'true');
  f.targets.indicator = f.element();
  f.targets.indicator.hidden = false;
  delete f.targets.status;
  f.update();
  assert.equal(op.state.phase, 'disposed');
  assert.equal(f.targets.content.getAttribute('aria-busy'), null);
  assert.equal(f.targets.indicator.hidden, true);
  assert.equal(old.content.getAttribute('aria-busy'), null);
  assert.equal(old.indicator.hidden, true);
  assert.equal(old.status.textContent, '');
  assert.equal(token.finish(), false);
});
