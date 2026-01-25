/**
 * Footnote Web Component
 *
 * Flexible inline footnotes with modal definitions.
 * Trigger content is whatever you put inside the element.
 * Uses native <dialog> element and DPUB-ARIA roles for accessibility.
 *
 * @attr def - The footnote/definition text to show in the modal
 * @attr title - Optional modal title (defaults to "Note")
 *
 * @example
 * <!-- Superscript number -->
 * <foot-note def="Source: Study 2024"><sup>1</sup></foot-note>
 *
 * <!-- Symbol -->
 * <foot-note def="Subject to change">*</foot-note>
 *
 * <!-- With title -->
 * <foot-note def="A reusable CSS pattern" title="Layout Primitive">
 *   <mark>layout primitive</mark>
 * </foot-note>
 */
class FootNote extends HTMLElement {
  connectedCallback() {
    // Store original content before render
    this._triggerContent = this.innerHTML.trim();
    this._triggerText = this.textContent.trim();
    this.render();
    this.setupEvents();
  }

  disconnectedCallback() {
    this._abortController?.abort();
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  get def() {
    return this.getAttribute('def') || '';
  }

  get noteTitle() {
    return this.getAttribute('title') || 'Note';
  }

  // Programmatic API
  open() {
    this.querySelector('.footnote-modal')?.showModal();
  }

  close() {
    this.querySelector('.footnote-modal')?.close();
    // Return focus to trigger
    this.querySelector('.footnote-trigger')?.focus();
  }

  render() {
    const safeDef = this.escapeHtml(this.def);
    const safeTitle = this.escapeHtml(this.noteTitle);
    const ariaLabel = this._triggerText
      ? `View note: ${this.escapeHtml(this._triggerText)}`
      : 'View note';

    this.innerHTML = `
      <button class="footnote-trigger" type="button" role="doc-noteref" aria-label="${ariaLabel}">
        ${this._triggerContent}
      </button>
      <dialog class="footnote-modal imposter-dialog imposter-contain" role="note">
        <div class="footnote-modal-content box stack">
          <header class="footnote-modal-header cluster cluster-between cluster-nowrap">
            <h2 class="footnote-modal-title">${safeTitle}</h2>
            <button class="footnote-modal-close" type="button" aria-label="Close" role="doc-backlink">
              <span aria-hidden="true">&times;</span>
            </button>
          </header>
          <p class="footnote-modal-body">${safeDef}</p>
        </div>
      </dialog>
    `;
  }

  setupEvents() {
    const trigger = this.querySelector('.footnote-trigger');
    const dialog = this.querySelector('.footnote-modal');
    const closeBtn = this.querySelector('.footnote-modal-close');

    this._abortController = new AbortController();
    const { signal } = this._abortController;

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      dialog.showModal();
    }, { signal });

    closeBtn.addEventListener('click', () => {
      this.close();
    }, { signal });

    // Close on backdrop click
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        this.close();
      }
    }, { signal });

    // Close on Escape and return focus
    dialog.addEventListener('close', () => {
      trigger.focus();
    }, { signal });
  }
}

if (!customElements.get('foot-note')) {
  customElements.define('foot-note', FootNote);
}
