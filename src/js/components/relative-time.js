import { createSharedScheduler, formatRelativeTime } from './relative-time-state.js';

const scheduler = createSharedScheduler((instance) => instance.refresh());

class LWRelativeTime extends HTMLElement {
  connectedCallback() {
    if (this._release) return;
    this._time = this.querySelector('time[datetime]');
    if (!this._time) return;

    this._fallback = this._time.querySelector('[data-relative-time-fallback]');
    this._output = this._time.querySelector('[data-relative-time-output]');
    if (!this._fallback || !this._output) return;

    this._observer = new MutationObserver((records) => {
      if (records.some((record) => record.target === this._time)) this.refresh();
      if (records.some((record) => this._fallback.contains(record.target))) {
        this._fallbackText = this._fallback.textContent.trim();
        this.refresh();
      }
    });
    this._observer.observe(this._time, { attributes: true, attributeFilter: ['datetime'] });
    this._observer.observe(this._fallback, { childList: true, characterData: true, subtree: true });
    this._fallbackText = this._fallback.textContent.trim();
    this._release = scheduler.add(this);
  }

  disconnectedCallback() {
    this._observer?.disconnect();
    this._observer = null;
    this._release?.();
    this._release = null;
    this._restoreFallback();
  }

  refresh() {
    if (!this.isConnected || !this._time || !this._fallback || !this._output) return;
    const label = formatRelativeTime(this._time.dateTime, {
      locale: this.closest('[lang]')?.getAttribute('lang') || document.documentElement.lang || undefined,
      timeZone: this.getAttribute('time-zone') || undefined,
    });

    if (!label) {
      this._restoreFallback();
      return;
    }

    this._output.textContent = label;
    this._output.hidden = false;
    this._fallback.hidden = true;
    this._time.title = this._fallbackText;
    this._time.setAttribute('aria-label', `${label}; ${this._fallbackText}`);
  }

  _restoreFallback() {
    if (!this._fallback || !this._output) return;
    this._fallback.hidden = false;
    this._output.hidden = true;
    this._time?.removeAttribute('aria-label');
    this._time?.removeAttribute('title');
  }
}

if (!customElements.get('lw-relative-time')) {
  customElements.define('lw-relative-time', LWRelativeTime);
}
