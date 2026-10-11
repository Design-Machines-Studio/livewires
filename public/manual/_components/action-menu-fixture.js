import { createActionMenu } from '/dist/action-menu.js';

const controllers = new Map();
const status = document.querySelector('[data-demo-status]');
for (const root of document.querySelectorAll('[data-action-menu]')) {
  const contextTarget = document.querySelector(`[data-context-for="${root.id}"]`);
  const api = createActionMenu({ root, contextTarget });
  controllers.set(root, api);
  root.addEventListener('lw:menu-action', (event) => {
    // This example only reports intent; it performs no save or deletion.
    event.preventDefault();
    status.textContent = `${event.detail.action} requested for ${event.detail.contextId}. No server action was performed.`;
  });
}
document.querySelector('[data-demo-replace]')?.addEventListener('click', () => {
  const root = document.querySelector('#document-actions');
  const previous = root.querySelector(':scope > [data-menu]');
  previous.replaceWith(previous.cloneNode(true));
  status.textContent = 'Server menu markup replaced. The old open menu closes safely.';
});
document.querySelector('[data-demo-remove]')?.addEventListener('click', () => {
  const root = document.querySelector('#document-actions');
  controllers.get(root).dispose();
  root.remove();
  status.textContent = 'First menu removed and disposed. The second menu still works.';
});
