/**
 * <type-sample> Web Component
 *
 * Displays typography samples with various weights, typefaces, and styles.
 * Uses the same token convention as <color-swatch> - pass CSS variable names
 * without the -- prefix.
 *
 * @attr {string} title - Optional title for the sample
 * @attr {string} weight - Font weight token (e.g., "font-bold") resolves to var(--font-bold)
 * @attr {string} typeface - Typeface token (e.g., "font-serif") resolves to var(--font-serif)
 * @attr {boolean} italic - Apply italic style
 * @attr {boolean} display - Show display size sample (AaBbCc1234)
 * @attr {boolean} headline - Show headline size character set
 * @attr {boolean} text - Show text size character set
 *
 * @example
 * <type-sample
 *   title="Serif Bold"
 *   weight="font-bold"
 *   typeface="font-serif"
 *   display
 *   headline
 *   italic>
 * </type-sample>
 */
class TypeSample extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  // Get attribute values with defaults
  get title() {
    return this.getAttribute('title') || '';
  }

  get weight() {
    return this.getAttribute('weight') || '';
  }

  get typeface() {
    return this.getAttribute('typeface') || '';
  }

  // Boolean attributes
  get italic() {
    return this.hasAttribute('italic');
  }

  get display() {
    return this.hasAttribute('display');
  }

  get headline() {
    return this.hasAttribute('headline');
  }

  get text() {
    return this.hasAttribute('text');
  }

  /**
   * Build inline style string from token attributes
   * Tokens are CSS variable names without -- prefix
   */
  buildStyle() {
    const styles = [];

    if (this.typeface) {
      styles.push(`font-family: var(--${this.typeface})`);
    }

    if (this.weight) {
      styles.push(`font-weight: var(--${this.weight})`);
    }

    if (this.italic) {
      styles.push('font-style: italic');
    }

    return styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
  }

  render() {
    const characterSet = `ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>
    abcdefghijklmnopqrstuvwxyz<br>
    1234567890<br>
    #*@$%&amp;_.-,&ndash;;:&mdash;?!&lsquo;&rsquo;&ldquo;&rdquo;()`;

    const styleAttr = this.buildStyle();

    let html = `<div${styleAttr}>`;

    // Title
    if (this.title) {
      html += `<h4>${this.title}</h4>`;
    }

    // Display sample
    if (this.display) {
      html += `<p class="text-7xl leading-none mb-0">AaBbCc1234</p>`;
    }

    // Headline sample
    if (this.headline) {
      html += `<p class="text-3xl leading-tight mb-05">${characterSet}</p>`;
    }

    // Text sample
    if (this.text) {
      html += `<p>${characterSet}</p>`;
    }

    html += `</div>`;

    this.innerHTML = html;
  }
}

// Register the custom element
customElements.define('type-sample', TypeSample);
