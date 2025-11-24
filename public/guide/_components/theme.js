/**
 * <theme-panel> Web Component
 *
 * Displays a comprehensive theme testing panel with typography, colors, borders, and form elements.
 *
 * @attr {string} theme - Theme class to apply (e.g., "theme-white", "theme-black", "theme-brand")
 * @attr {string} title - Optional title override (defaults to theme value)
 *
 * @example
 * <theme-panel theme="theme-white"></theme-panel>
 * <theme-panel theme="theme-black"></theme-panel>
 * <theme-panel theme="theme-brand" title="Brand Colors"></theme-panel>
 */
class ThemePanel extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  // Get attribute values with defaults
  get theme() {
    return this.getAttribute('theme') || '';
  }

  get title() {
    return this.getAttribute('title') || this.theme;
  }

  render() {
    const html = `
      <div class="grid grid-cols-4@sm gap-1 ${this.theme}">
        <h3 class="col-span-full">${this.title}</h3>

        <div class="col-span-2@sm">
          <p class="lead">Here is a default para­graph. This is the meat of our con­tent and where we most of our typo­graph­ic deci­sions live. Look inside the fol­low­ing para­graphs for exam­ples of <a href="#">links</a>, <strong>bold</strong> text, and <em>ital­ics</em>.</p>
          <p>Here is a default para­graph. This is the meat of our con­tent and where we most of our typo­graph­ic deci­sions live. Look inside the fol­low­ing para­graphs for exam­ples of <a href="#">links</a>, <strong>bold</strong> text, and <em>ital­ics</em>.</p>
          <p class="more"><a href="#">More link</a></p>
        </div>

        <div>
          <h4 class="mb-05">Secondary colours</h4>
          <div class="p-025 accent">Accent</div>
          <div class="p-025 accent2">Accent 2</div>
          <div class="p-025 off-bg">Off-background</div>
          <div class="p-025 accent-text">Accent</div>
          <div class="p-025 off-fg-text">Off-foreground</div>
        </div>

        <div class="callout">
          <div class="content off-bg text-sm">
            <h4>Off bg callout</h4>
            <p>Here is a small para­graph. Look inside the fol­low­ing para­graphs for exam­ples of <a href="#">links</a>, <strong>bold</strong> text, and <em>ital­ics</em>.</p>
          </div>
        </div>

        <div>
          <h4>Borders</h4>
          <hr class="my-05">
          <hr class="rule--hairline my-05">
          <hr class="accent-border my-05">
        </div>

        <div>
          <h4 class="mb-05">Forms</h4>
          <lw-text-input
            name="${this.theme}"
            label="Text input"
          ></lw-text-input>
          <button>Standard button</button>
        </div>
      </div>
    `;

    this.innerHTML = html;
  }
}

// Register the custom element
customElements.define('theme-panel', ThemePanel);
