import { createToastRegion } from '/dist/toast-region.js';

// A manual fixture, not a request adapter. Every outcome is chosen explicitly.
let serial = 0;
const controllers = [...document.querySelectorAll('[data-toast-region]')].map((root) => createToastRegion({ root }));
const primary = document.querySelector('#feedback');
const secondary = document.querySelector('#other-feedback');
const list = primary.querySelector('[data-toast-list]');
function add(root, kind, text, { duration, action, id } = {}) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${kind === 'pending' ? 'info' : kind}`;
  toast.dataset.toastId = id ?? `example-${++serial}`;
  toast.dataset.toastKind = kind;
  if (duration) toast.dataset.toastDuration = duration;
  const content = document.createElement('div');
  content.className = 'content';
  const message = document.createElement('p');
  message.dataset.toastMessage = '';
  message.textContent = text;
  content.append(message);
  if (action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = action.label;
    button.addEventListener('click', action.run);
    content.append(button);
  }
  const close = document.createElement('button');
  close.className = 'close';
  close.type = 'button';
  close.dataset.toastDismiss = '';
  close.setAttribute('aria-label', `Dismiss ${kind} message`);
  close.textContent = '×';
  toast.append(content, close);
  root.querySelector('[data-toast-list]').append(toast);
  return toast;
}
let pending;
document.querySelector('[data-demo="pending"]').addEventListener('click', () => {
  if (pending?.isConnected) return;
  pending = add(primary, 'pending', 'Request pending. Changes are not confirmed.');
});
document.querySelector('[data-demo="ended"]').addEventListener('click', () => {
  pending?.remove(); pending = null;
  add(primary, 'info', 'Request ended. Save status is unknown.');
});
document.querySelector('[data-demo="confirmed"]').addEventListener('click', () => {
  pending?.remove(); pending = null;
  add(primary, 'success', 'The application confirmed that your changes were saved.', { duration: 6000 });
});
document.querySelector('[data-demo="failure"]').addEventListener('click', () => {
  pending?.remove(); pending = null;
  let error;
  error = add(primary, 'error', 'The application rejected this change. Your earlier version is still available.', {
    action: { label: 'Review earlier version', run() {
      document.querySelector('#recovery').hidden = false;
      document.querySelector('#recovery-action').focus();
      // The fixture's application chooses recovery. The toast never retries.
      document.querySelector('#recovery-action').onclick = () => {
        add(primary, 'success', 'The application confirmed that the corrected changes were saved.', { duration: 6000 });
        // Move focus before this application removes its own focused subtree.
        document.querySelector('[data-demo="pending"]').focus();
        error.remove();
        document.querySelector('#recovery').hidden = true;
      };
    } },
  });
});
document.querySelector('[data-demo="stack"]').addEventListener('click', () => {
  for (let n = 1; n <= 5; n++) add(primary, 'info', `Additional feedback ${n}.`, { duration: 10000 });
});
document.querySelector('[data-demo="other"]').addEventListener('click', () => add(secondary, 'info', 'Independent region message.', { duration: 6000 }));
document.querySelector('[data-demo="patch"]').addEventListener('click', () => {
  for (const toast of list.querySelectorAll('[data-toast-id]')) {
    // The host boundary keeps focused/action subtrees in place. Replace only
    // plain feedback here; occurrence identity and local state survive.
    if (!toast.querySelector('button:not([data-toast-dismiss]), a[href]') && !toast.contains(document.activeElement)) {
      const replacement = toast.cloneNode(true);
      replacement.removeAttribute('hidden');
      replacement.removeAttribute('data-toast-state');
      toast.replaceWith(replacement);
    }
  }
  document.querySelector('#patch-count').textContent = String(Number(document.querySelector('#patch-count').textContent) + 1);
});
document.querySelector('[data-demo="dispose"]').addEventListener('click', () => {
  for (const controller of controllers) controller.dispose();
  document.querySelector('#fixture-status').textContent = 'Controllers disposed. Native message content remains.';
});
window.toastDemo = { controllers, primary, secondary }; // Manual inspection only.
