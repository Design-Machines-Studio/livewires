// Page-only fixture for the manual and reference. Applications render tiles on
// the server and own saving; this script is not part of the framework bundle.
import { createIconPicker } from '/dist/icon-picker.js';

for (const root of document.querySelectorAll('[data-icon-picker]')) {
  // The full set is generated markup, too large to repeat in the page.
  if (root.dataset.demoTiles) {
    const response = await fetch(root.dataset.demoTiles);
    if (response.ok) root.querySelector('.icon-picker-body').insertAdjacentHTML('beforeend', await response.text());
    const value = root.dataset.demoValue;
    const radio = value && root.querySelector(`.icon-picker-tile input[value="${CSS.escape(value)}"]`);
    if (radio) radio.checked = true;
  }
  createIconPicker({ root, recentKey: 'lw-manual-icon-picker-recent' });
}

const params = new URLSearchParams(window.location.search);
for (const form of document.querySelectorAll('[data-demo-form]')) {
  const output = form.querySelector('[data-demo-output]');
  const name = form.querySelector('.icon-picker-tile input')?.name;
  if (output && name && params.has(name)) output.textContent = `Submitted ${name}: ${params.get(name) || '(no icon)'}`;
}
