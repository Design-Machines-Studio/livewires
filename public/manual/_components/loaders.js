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
function hideOverlay() {
  if (overlay) overlay.hidden = true;
  clearTimeout(overlayTimer);
}
for (const button of document.querySelectorAll('[data-show-loader-overlay]')) {
  button.addEventListener('click', () => {
    clearTimeout(overlayTimer);
    overlay.hidden = false;
    overlayTimer = setTimeout(hideOverlay, 2000);
  });
}
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') hideOverlay();
});
window.addEventListener('pagehide', hideOverlay);
