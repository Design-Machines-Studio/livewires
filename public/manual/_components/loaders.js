// Presentation-only progress control; no transport or persistence.
for (const demo of document.querySelectorAll('[data-torque-demo]')) {
  const input = demo.querySelector('[data-loader-progress]');
  input.addEventListener('input', () => {
    const percent = Number(input.value);
    demo.querySelector('[data-loader-meter]').setAttribute('aria-valuenow', String(percent));
    for (const svg of demo.querySelectorAll('.loader--torque')) {
      svg.style.setProperty('--p', percent / 100);
      svg.dataset.state = percent === 100 ? 'complete' : percent === 0 ? 'reset' : 'pending';
    }
    for (const label of demo.querySelectorAll('[data-loader-percentage]')) {
      label.textContent = `${label.closest('button') ? 'Exporting ' : ''}${percent}%`;
    }
  });
}

// The page-overlay preview has only hardware visible. It never reports a save.
const overlay = document.querySelector('[data-loader-overlay]');
let overlayTimer;
let overlayInert = [];
let overlayReturnFocus = null;
function hideOverlay() {
  clearTimeout(overlayTimer);
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
  for (const element of overlayInert) element.inert = false;
  overlayInert = [];
  if (overlayReturnFocus?.isConnected) overlayReturnFocus.focus({ preventScroll: true });
  overlayReturnFocus = null;
}
for (const button of document.querySelectorAll('[data-show-loader-overlay]')) {
  button.addEventListener('click', () => {
    clearTimeout(overlayTimer);
    if (overlay.hidden) {
      overlayReturnFocus = document.activeElement;
      for (const element of document.body.children) {
        if (element === overlay.parentElement || element.inert) continue;
        element.inert = true;
        overlayInert.push(element);
      }
      overlay.hidden = false;
      overlay.querySelector('[data-loader-overlay-label]').focus({ preventScroll: true });
    }
    overlayTimer = setTimeout(hideOverlay, 2000);
  });
}
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') hideOverlay();
});
window.addEventListener('pagehide', hideOverlay);
