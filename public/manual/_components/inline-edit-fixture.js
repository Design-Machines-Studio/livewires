import { createInlineEditor } from '/dist/inline-edit.js';

// Demonstration application, not a transport or persistence adapter.
export function attachInlineEditExample(root = document) {
  const controllers = new Map();
  const attempts = [];
  const timers = new Set();
  const listeners = [];
  const output = root.querySelector('[data-example-log]');
  const write = text => { output.textContent = text; };
  function deliver(attempt, outcome = attempt.outcome) {
    const accepted = attempt.editor.applyResult({ ...attempt.detail, outcome,
      value: attempt.detail.value.trim(), message: outcome === 'rejected' ? 'This example rejected the title. Your draft is still here.' : '' });
    write(accepted ? `Application result: ${outcome}.` : 'Ignored a late or stale response.');
  }
  for (const host of root.querySelectorAll('[data-inline-edit]')) {
    const editor = createInlineEditor({ root: host });
    controllers.set(host, editor);
    const onCommit = ({ detail }) => {
      const attempt = { editor, detail, outcome: root.querySelector('[data-example-outcome]').value };
      attempts.push(attempt);
      write('The application received one save request.');
      const delay = root.querySelector('[data-example-delay]').value;
      if (delay !== 'hold') {
        const timer = setTimeout(() => { timers.delete(timer); deliver(attempt); }, Number(delay));
        timers.add(timer);
      }
    };
    host.addEventListener('lw-inline-edit-commit', onCommit);
    listeners.push(() => host.removeEventListener('lw-inline-edit-commit', onCommit));
  }
  function action(selector, callback) {
    const button = root.querySelector(selector);
    button.addEventListener('click', callback);
    listeners.push(() => button.removeEventListener('click', callback));
  }
  action('[data-example-release]', () => { if (attempts.length) deliver(attempts.at(-1)); });
  action('[data-example-confirm]', () => { if (attempts.length) deliver(attempts.at(-1), 'confirmed'); });
  action('[data-example-reject]', () => { if (attempts.length) deliver(attempts.at(-1), 'rejected'); });
  action('[data-example-stale]', () => { if (attempts.length) deliver(attempts[0], 'confirmed'); });
  action('[data-example-update]', () => {
    const [host, editor] = controllers.entries().next().value;
    host.querySelector('[data-example-sibling]').textContent = 'An unrelated update arrived.';
    editor.updateConfirmed('Application update');
    write('The confirmed value updated. An active draft stays in place.');
  });
  action('[data-example-remove]', () => { [...controllers.keys()][0].remove(); write('First editor removed. Its late responses will be ignored. Reload to restore it.'); });
  action('[data-example-reset]', () => location.reload());
  root.querySelector('[data-example-controls]').hidden = false;
  return { controllers, attempts, dispose() {
    for (const timer of timers) clearTimeout(timer);
    for (const disconnect of listeners) disconnect();
    for (const editor of controllers.values()) editor.dispose();
  } };
}
