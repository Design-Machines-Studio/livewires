// Deterministic presentation-only controls for the Save Status reference.
// These controls provide explicit host-like snapshots; they do not save data.
const editorByName = new Map(
  [...document.querySelectorAll('[data-demo-editor]')].map((editor) => [
    editor.dataset.demoEditor,
    {
      status: editor.querySelector('[data-save-status]'),
      support: editor.querySelector('[id$="-support"]'),
    },
  ]),
);

document.querySelectorAll('[data-demo-target]').forEach((button) => {
  button.addEventListener('click', () => {
    const editor = editorByName.get(button.dataset.demoTarget);
    if (!editor?.status || !editor.support) return;

    editor.status.dataset.saveState = button.dataset.demoState;
    (editor.status.querySelector('[data-save-label]') ?? editor.status).textContent = button.dataset.demoLabel;
    editor.support.textContent = button.dataset.demoSupport;
  });
});

const demoSchemes = new Set(['scheme-default', 'light-mode', 'scheme-dark']);
document.querySelectorAll('[data-demo-scheme]').forEach((button) => {
  button.addEventListener('click', () => {
    const selected = button.dataset.demoScheme;
    if (!demoSchemes.has(selected)) return;

    document.body.classList.remove(...demoSchemes);
    document.body.classList.add(selected);
    document.querySelectorAll('[data-demo-scheme]').forEach((control) => {
      const active = control.dataset.demoScheme === selected;
      control.setAttribute('aria-pressed', String(active));
      control.classList.toggle('underline', active);
    });
  });
});
