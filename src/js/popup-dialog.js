/**
 * Popup Dialog Web Component
 *
 * A versatile popup/modal that wraps a trigger element.
 * Great for confirmation dialogs, info popups, and action menus.
 * Uses native <dialog> element for accessibility.
 *
 * @attr title - Modal title (optional, defaults to "Confirm")
 * @attr body - Body text content (can also use slot="body" for HTML content)
 * @attr confirm-label - Label for confirm button (default: "Confirm")
 * @attr cancel-label - Label for cancel button (default: "Cancel")
 * @attr confirm-href - URL to navigate to on confirm (optional)
 * @attr confirm-variant - Button variant for confirm: "danger", "accent" (default: "accent")
 * @attr no-cancel - Hide the cancel button
 *
 * @slot (default) - The trigger element (button, link, etc.)
 * @slot body - Custom HTML body content (overrides body attribute)
 * @slot actions - Custom action buttons (overrides default confirm/cancel)
 *
 * @example Basic confirmation dialog
 * <popup-dialog title="Delete item?" body="This action cannot be undone." confirm-label="Delete" confirm-variant="danger">
 *   <button class="button button--red">Delete</button>
 * </popup-dialog>
 *
 * @example With navigation on confirm
 * <popup-dialog title="Leave page?" body="You have unsaved changes." confirm-href="/home/" confirm-variant="danger">
 *   <a href="/home/" class="button">Leave</a>
 * </popup-dialog>
 *
 * @example Info popup (no actions)
 * <popup-dialog title="About this feature" no-cancel>
 *   <button class="button">Learn more</button>
 *   <div slot="body">
 *     <p>This feature allows you to...</p>
 *   </div>
 *   <div slot="actions">
 *     <button type="button" data-action="close" class="button">Got it</button>
 *   </div>
 * </popup-dialog>
 */
class PopupDialog extends HTMLElement {
  connectedCallback() {
    // Store the original trigger content
    this._triggerContent = this.innerHTML;
    this.render();
    this.setupEvents();
  }

  disconnectedCallback() {
    // Clean up event listeners
    this._abortController?.abort();
  }

  // Escape HTML to prevent XSS
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Validate URL to prevent open redirects and javascript: XSS
  sanitizeHref(href) {
    if (!href) return '';
    // Block dangerous protocols
    if (/^(javascript|data|vbscript):/i.test(href)) {
      console.warn('PopupDialog: Blocked potentially dangerous href:', href);
      return '';
    }
    return href;
  }

  get title() {
    return this.getAttribute('title') || 'Confirm';
  }

  get body() {
    return this.getAttribute('body') || '';
  }

  get confirmLabel() {
    return this.getAttribute('confirm-label') || 'Confirm';
  }

  get cancelLabel() {
    return this.getAttribute('cancel-label') || 'Cancel';
  }

  get confirmHref() {
    return this.sanitizeHref(this.getAttribute('confirm-href') || '');
  }

  get confirmVariant() {
    return this.getAttribute('confirm-variant') || 'accent';
  }

  get noCancel() {
    return this.hasAttribute('no-cancel');
  }

  // Programmatic API
  open() {
    this.querySelector('.popup-modal')?.showModal();
  }

  close() {
    this.querySelector('.popup-modal')?.close();
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
    // Check for slotted body content
    const bodySlot = this.querySelector('[slot="body"]');
    const actionsSlot = this.querySelector('[slot="actions"]');
    // Escape body text if from attribute, allow HTML if from slot
    const bodyContent = bodySlot ? bodySlot.innerHTML : this.escapeHtml(this.body);

    // Build confirm button class - escape variant to prevent injection
    const safeVariant = this.escapeHtml(this.confirmVariant);
    const confirmBtnClass = `button button--${safeVariant}`;

    // Escape labels for button text
    const safeConfirmLabel = this.escapeHtml(this.confirmLabel);
    const safeCancelLabel = this.escapeHtml(this.cancelLabel);

    // Default actions HTML
    const defaultActions = `
      ${this.noCancel ? '' : `<button type="button" class="button" data-action="cancel">${safeCancelLabel}</button>`}
      ${this.confirmHref
        ? `<a href="${this.confirmHref}" class="${confirmBtnClass}" data-action="confirm">${safeConfirmLabel}</a>`
        : `<button type="button" class="${confirmBtnClass}" data-action="confirm">${safeConfirmLabel}</button>`
      }
    `;

    const actionsContent = actionsSlot ? actionsSlot.innerHTML : defaultActions;

    // Escape title
    const safeTitle = this.escapeHtml(this.title);

    this.innerHTML = `
      <span class="popup-trigger">${this._triggerContent}</span>
      <dialog class="popup-modal imposter-dialog imposter-contain">
        <div class="popup-content box stack">
          <header class="popup-header cluster cluster-between cluster-nowrap">
            <h2 class="popup-title">${safeTitle}</h2>
            <button class="popup-close" type="button" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </header>
          <div class="popup-body">${bodyContent}</div>
          <footer class="popup-actions cluster cluster-end">
            ${actionsContent}
          </footer>
        </div>
      </dialog>
    `;
  }

  setupEvents() {
    const trigger = this.querySelector('.popup-trigger');
    const dialog = this.querySelector('.popup-modal');
    const closeBtn = this.querySelector('.popup-close');

    // Use AbortController for cleanup
    this._abortController = new AbortController();
    const { signal } = this._abortController;

    // Intercept clicks on the trigger
    trigger.addEventListener('click', (e) => {
      // Prevent default navigation if trigger is a link
      const link = trigger.querySelector('a');
      if (link) {
        e.preventDefault();
      }
      dialog.showModal();
    }, { signal });

    // Close button
    closeBtn.addEventListener('click', () => {
      dialog.close();
    }, { signal });

    // Handle action buttons
    dialog.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]');

      if (action) {
        const actionType = action.dataset.action;

        if (actionType === 'cancel' || actionType === 'close') {
          e.preventDefault();
          dialog.close();
        } else if (actionType === 'confirm') {
          // If it's a link, let it navigate naturally
          // If it's a button, dispatch a custom event
          if (action.tagName !== 'A') {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent('confirm', { bubbles: true }));
            dialog.close();
          }
          // For links, the default behavior will navigate
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
