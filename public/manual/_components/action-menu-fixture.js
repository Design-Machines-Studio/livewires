import { createActionMenu } from '/dist/action-menu.js';

const controllers = new Map();
const templates = new Map();
const status = document.querySelector('[data-demo-status]');
for (const root of document.querySelectorAll('[data-action-menu]')) {
  const contextTarget = document.querySelector(`[data-context-for="${root.id}"]`);
  templates.set(root, root.querySelector(':scope > [data-menu]').outerHTML);
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
  if (!root) return;
  const previous = root.querySelector(':scope > [data-menu]');
  const template = document.createElement('template');
  template.innerHTML = templates.get(root);
  previous.replaceWith(template.content.firstElementChild);
  status.textContent = 'Server menu markup replaced. The old open menu closes safely.';
});
document.querySelector('[data-demo-remove]')?.addEventListener('click', () => {
  const root = document.querySelector('#document-actions');
  if (!root) return;
  controllers.get(root).dispose();
  controllers.delete(root);
  templates.delete(root);
  root.remove();
  document.querySelector('[data-demo-replace]').disabled = true;
  document.querySelector('[data-demo-remove]').disabled = true;
  document.querySelector('[data-context-for="document-actions"] > p').textContent = 'The document action menu has been removed. The second menu remains available.';
  status.textContent = 'First menu removed and disposed. The second menu still works.';
});
