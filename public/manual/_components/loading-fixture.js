import { createLoadingOperation } from '/dist/loading.js';

const owners = [];
for (const root of document.querySelectorAll('[data-loading-demo]')) {
  const operation = createLoadingOperation({ root, content: '[data-demo-content]', indicator: '[data-demo-indicator]', status: '[data-demo-status]' });
  const controllers = new Set();
  const result = root.querySelector('[data-demo-result]');
  const listeners = new AbortController();
  const send = () => {
    const controller = new AbortController();
    controllers.add(controller);
    const request = operation.begin({ signal: controller.signal });
    const delay = Number(root.querySelector('[data-demo-delay]').value);
    const failure = root.querySelector('[data-demo-failure]').checked;
    result.textContent = 'Save status unknown while the request is pending.';
    const timer = setTimeout(() => {
      controllers.delete(controller);
      controller.signal.removeEventListener('abort', abort);
      if (failure) {
        request.finish('failed');
        result.textContent = 'Simulated server rejection. This change was not accepted.';
      } else {
        request.finish();
        result.textContent = 'Simulated server confirmation for this request. This example stores nothing.';
      }
    }, delay);
    const abort = () => {
      clearTimeout(timer);
      controllers.delete(controller);
      result.textContent = 'Request cancelled. The server result is unknown.';
    };
    controller.signal.addEventListener('abort', abort, { once: true });
  };
  root.addEventListener('click', (event) => {
    const action = event.target.closest('[data-demo-action]')?.dataset.demoAction;
    if (action === 'send') send();
    if (action === 'cancel') for (const controller of [...controllers]) controller.abort();
    if (action === 'patch') {
      const content = root.querySelector('[data-demo-content]');
      content.replaceWith(content.cloneNode(true));
      root.querySelector('[data-demo-update]').textContent = 'Content replaced by an unrelated update.';
    }
    if (action === 'remove') root.querySelector('[data-demo-action="send"]')?.remove();
    if (action === 'restore' && !root.querySelector('[data-demo-action="send"]')) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button--accent';
      button.dataset.demoAction = 'send';
      button.textContent = 'Send request';
      root.querySelector('[data-demo-controls]').prepend(button);
    }
  }, { signal: listeners.signal });
  owners.push(() => {
    listeners.abort();
    for (const controller of [...controllers]) controller.abort();
    operation.dispose();
  });
}

// A server-owned job is a different region and never enters a local operation.
const job = document.querySelector('[data-demo-job]');
const jobButton = document.querySelector('[data-demo-job-toggle]');
const jobStatus = document.querySelector('[data-demo-job-status]');
const jobListener = new AbortController();
jobButton?.addEventListener('click', () => {
  const pending = job.getAttribute('aria-busy') !== 'true';
  job.setAttribute('aria-busy', String(pending));
  job.querySelector('.loading').hidden = !pending;
  jobStatus.textContent = pending ? 'Server job pending. This simulated stream stays open until you finish the job.' : 'Server job ended by a separate simulated server update.';
}, { signal: jobListener.signal });
window.addEventListener('pagehide', () => { owners.forEach((dispose) => dispose()); jobListener.abort(); }, { once: true });
