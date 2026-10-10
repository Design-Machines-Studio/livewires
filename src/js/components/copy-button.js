import { copyText } from './copy-button-state.js';

class LWCopy extends HTMLElement {
  connectedCallback() {
    if (this._controller) return;
    this._source = this.querySelector('[data-copy-source]');
    this._button = this.querySelector('[data-copy-button]');
    this._status = this.querySelector('[data-copy-status]');
    if (!this._source || !this._button || !this._status) return;

    this._controller = new AbortController();
    this._generation = (this._generation || 0) + 1;
    this._button.addEventListener('click', this._onCopy, { signal: this._controller.signal });
  }

  disconnectedCallback() {
    this._generation = (this._generation || 0) + 1;
    this._controller?.abort();
    this._controller = null;
    if (this._status) this._status.textContent = '';
    this.removeAttribute('data-state');
  }

  _onCopy = async () => {
    if (this.dataset.state === 'copying') return;
    const generation = this._generation;
    const value = 'value' in this._source ? this._source.value : this._source.textContent;
    this.dataset.state = 'copying';
    this._status.textContent = 'Copying…';
    const succeeded = await copyText(value);
    if (!this.isConnected || generation !== this._generation) return;

    this.dataset.state = succeeded ? 'copied' : 'manual-copy';
    this._status.textContent = succeeded
      ? 'Copied.'
      : 'Could not copy automatically. Select the text above and use your device’s copy command.';
  };
}

if (!customElements.get('lw-copy')) {
  customElements.define('lw-copy', LWCopy);
}
