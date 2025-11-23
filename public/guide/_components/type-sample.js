/**
 * <type-sample> Web Component
 *
 * Displays typography samples with various weights, typefaces, and styles.
 *
 * @attr {string} title - Optional title for the sample
 * @attr {string} weight - Font weight class (e.g., "font-bold")
 * @attr {string} typeface - Typeface class (e.g., "font-serif")
 * @attr {boolean} italic - Add italic class to container
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

  // Italic returns class name if attribute present
  get italic() {
    return this.hasAttribute('italic') ? 'italic' : '';
  }

  // Boolean attributes (presence = true)
  get display() {
    return this.hasAttribute('display');
  }

  get headline() {
    return this.hasAttribute('headline');
  }

  get text() {
    return this.hasAttribute('text');
  }

  render() {
    const characterSet = `ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>
    abcdefghijklmnopqrstuvwxyz<br>
    1234567890<br>
    #*@$%&amp;_.-,&ndash;;:&mdash;?!&lsquo;&rsquo;&ldquo;&rdquo;()`;

    let html = `<div class="${this.weight} ${this.typeface} ${this.italic}">`;

    // Title
    if (this.title) {
      html += `<h4>${this.title}</h4>`;
    }

    // Display sample
    if (this.display) {
      html += `<p class="text-3xl leading-tight mb-05">AaBbCc1234</p>`;
    }

    // Headline sample
    if (this.headline) {
      html += `<p class="text-xl leading-tight mb-05">${characterSet}</p>`;
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
