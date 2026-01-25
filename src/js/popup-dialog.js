/**
 * Popup Dialog Web Component
 *
 * A versatile popup/modal that wraps a trigger element.
 * Uses native <dialog> element with layout primitives for structure.
 * Additive by design: no footer by default, add what you need.
 *
 * @attr title - Modal title (optional)
 * @attr body - Body text content (can also use slot="body" for HTML content)
 * @attr confirm-label - Adds a confirm button with this label
 * @attr cancel-label - Adds a cancel button with this label
 * @attr confirm-href - URL to navigate to on confirm (optional)
 * @attr confirm-variant - Button variant for confirm: "red", "accent" (default: "accent")
 *
 * @slot (default) - The trigger element (button, link, etc.)
 * @slot body - Custom HTML body content (overrides body attribute)
 * @slot actions - Custom action buttons
 *
 * @example Info popup (default - no footer buttons)
 * <popup-dialog title="About this feature">
 *   <a href="#">Learn more</a>
 *   <div slot="body">
 *     <p>This feature allows you to...</p>
 *   </div>
 * </popup-dialog>
 *
 * @example Confirmation dialog (add buttons explicitly)
 * <popup-dialog title="Delete item?" body="This action cannot be undone." confirm-label="Delete" cancel-label="Cancel" confirm-variant="red">
 *   <button class="button button--red">Delete</button>
 * </popup-dialog>
 */
class PopupDialog extends HTMLElement {
  connectedCallback() {
    // Capture only non-slot children as trigger content
    const triggerNodes = [];
    for (const node of this.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) triggerNodes.push(text);
      } else if (node.nodeType === Node.ELEMENT_NODE && !node.hasAttribute('slot')) {
        triggerNodes.push(node.outerHTML);
      }
    }
    this._triggerContent = triggerNodes.join('');
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

  sanitizeHref(href) {
    if (!href) return '';
    if (/^(javascript|data|vbscript):/i.test(href)) {
      console.warn('PopupDialog: Blocked potentially dangerous href:', href);
      return '';
    }
    return href;
  }

  get title() {
    return this.getAttribute('title') || '';
  }

  get body() {
    return this.getAttribute('body') || '';
  }

  get confirmLabel() {
    return this.getAttribute('confirm-label') || '';
  }

  get cancelLabel() {
    return this.getAttribute('cancel-label') || '';
  }

  get confirmHref() {
    return this.sanitizeHref(this.getAttribute('confirm-href') || '');
  }

  get confirmVariant() {
    return this.getAttribute('confirm-variant') || 'accent';
  }

  get hasActions() {
    return this.confirmLabel || this.cancelLabel || this.querySelector('[slot="actions"]');
  }

  // Programmatic API
  open() {
    this.querySelector('dialog')?.showModal();
  }

  close() {
    this.querySelector('dialog')?.close();
  }

  confirm() {
    if (this.confirmHref) {
      window.location.href = this.confirmHref;
    } else {
      this.dispatchEvent(new CustomEvent('confirm', { bubbles: true }));
    }
    this.close();
  }

  render() {
    const bodySlot = this.querySelector('[slot="body"]');
    const actionsSlot = this.querySelector('[slot="actions"]');
    const bodyContent = bodySlot ? bodySlot.innerHTML : this.escapeHtml(this.body);
    const safeTitle = this.escapeHtml(this.title);

    // Build actions only if explicitly provided
    let footerHtml = '';
    if (actionsSlot) {
      footerHtml = `<footer class="cluster cluster-end pt-1 mt-05 border-t">${actionsSlot.innerHTML}</footer>`;
    } else if (this.confirmLabel || this.cancelLabel) {
      const safeVariant = this.escapeHtml(this.confirmVariant);
      const confirmBtnClass = `button button--${safeVariant}`;
      const buttons = [];

      if (this.cancelLabel) {
        buttons.push(`<button type="button" class="button" data-action="cancel">${this.escapeHtml(this.cancelLabel)}</button>`);
      }
      if (this.confirmLabel) {
        buttons.push(this.confirmHref
          ? `<a href="${this.confirmHref}" class="${confirmBtnClass}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</a>`
          : `<button type="button" class="${confirmBtnClass}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</button>`
        );
      }

      footerHtml = `<footer class="cluster cluster-end pt-1 mt-05 border-t">${buttons.join('')}</footer>`;
    }

    // Build header - only show if there's a title
    const headerHtml = safeTitle
      ? `<header class="cluster cluster-between cluster-nowrap">
          <h2>${safeTitle}</h2>
          <button class="dialog-close" data-close type="button" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </header>`
      : `<header class="cluster cluster-end">
          <button class="dialog-close" data-close type="button" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </header>`;

    this.innerHTML = `
      <span class="dialog-trigger" data-trigger>${this._triggerContent}</span>
      <dialog class="dialog imposter imposter-fixed">
        <div class="box stack">
          ${headerHtml}
          <div>${bodyContent}</div>
          ${footerHtml}
        </div>
      </dialog>
    `;
  }

  setupEvents() {
    const trigger = this.querySelector('[data-trigger]');
    const dialog = this.querySelector('dialog');
    const closeBtn = this.querySelector('[data-close]');

    this._abortController = new AbortController();
    const { signal } = this._abortController;

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      dialog.showModal();
    }, { signal });

    closeBtn.addEventListener('click', () => {
      dialog.close();
    }, { signal });

    dialog.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]');

      if (action) {
        const actionType = action.dataset.action;

        if (actionType === 'cancel' || actionType === 'close') {
          e.preventDefault();
          dialog.close();
        } else if (actionType === 'confirm') {
          if (action.tagName !== 'A') {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent('confirm', { bubbles: true }));
            dialog.close();
          }
        }
      }

      // Close on backdrop click
      if (e.target === dialog) {
        dialog.close();
      }
    }, { signal });
  }
}

if (!customElements.get('popup-dialog')) {
  customElements.define('popup-dialog', PopupDialog);
}
