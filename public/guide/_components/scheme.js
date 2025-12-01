/**
 * <scheme-panel> Web Component
 *
 * Displays a comprehensive color scheme testing panel with typography, colors, borders, and form elements.
 *
 * @attr {string} theme - Theme class to apply (e.g., "theme-white", "theme-black", "theme-brand")
 * @attr {string} title - Optional title override (defaults to theme value)
 *
 * @example
 * <scheme-panel scheme="theme-white"></scheme-panel>
 * <scheme-panel scheme="theme-black"></scheme-panel>
 * <scheme-panel scheme="theme-brand" title="Brand Colors"></scheme-panel>
 */
class SchemePanel extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  // Get attribute values with defaults
  get scheme() {
    return this.getAttribute('scheme') || '';
  }

  get title() {
    return this.getAttribute('title') || this.scheme;
  }

  render() {
    const html = `
      <div class="box ${this.scheme}">
        <h3 class="col-span-full">${this.title}</h3>

        <div>
          <p class="lead">Here is a default para­graph. This is the meat of our con­tent and where we most of our typo­graph­ic deci­sions live. Look inside the fol­low­ing para­graphs for exam­ples of <a href="#">links</a>, <strong>bold</strong> text, and <em>ital­ics</em>.</p>
          <p>Here is a default para­graph. This is the meat of our con­tent and where we most of our typo­graph­ic deci­sions live. Look inside the fol­low­ing para­graphs for exam­ples of <a href="#">links</a>, <strong>bold</strong> text, and <em>ital­ics</em>.</p>
          <p class="more"><a href="#">More link</a></p>
        </div>

        <div class="grid">
          <div>
            <h4 class="mb-05">Secondary colours</h4>
            <div class="p-025 bg-accent">Accent</div>
            <div class="p-025 bg-subtle">Subtle</div>
            <div class="p-025 fg-accent">Accent</div>
            <div class="p-025 fg-muted">Off-foreground</div>
          </div>

          <div class="box bg-subtle text-sm">
            <h4>Callout</h4>
            <p>Here is a small para­graph. Look inside the fol­low­ing para­graphs for exam­ples of <a href="#">links</a>, <strong>bold</strong> text, and <em>ital­ics</em>.</p>
          </div>

          <div>
            <h4>Borders</h4>
            <hr class="my-05">
            <hr class="divider--hairline my-05">
            <hr class="divider--accent my-05">
          </div>

          <div class="stack">
            <h4>Forms</h4>
            <div class="field">
              <label for="${this.scheme}">Text input</label>
              <input type="text" name="${this.scheme}" id="${this.scheme}" value="" placeholder="Text" />
            </div>
            <button>Standard button</button>
          </div>
        </div>
      </div>
    `;

    this.innerHTML = html;
  }
}

// Register the custom element
customElements.define('scheme-panel', SchemePanel);
