/**
 * <scheme-panel> Web Component
 *
 * Displays a comprehensive color scheme testing panel with typography, colors, borders, and form elements.
 *
 * @attr {string} scheme - Scheme class to apply (e.g., "scheme-default", "scheme-dark")
 * @attr {string} title - Optional title override (defaults to scheme value)
 *
 * @example
 * <scheme-panel scheme="scheme-default"></scheme-panel>
 * <scheme-panel scheme="scheme-dark" title="Dark Mode"></scheme-panel>
 */
class SchemePanel extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  get scheme() {
    return this.getAttribute('scheme') || '';
  }

  get title() {
    return this.getAttribute('title') || this.scheme;
  }

  render() {
    const html = `
      <div class="box ${this.scheme}">
        <h3>${this.title}</h3>

        <div class="prose mb-1">
          <p class="lead">The best tools are the ones that <a href="#">dis­appear</a>. They don't demand atten­tion or require con­stant <strong>up­grades</strong>. They simply work, day after day, be­com­ing ex­ten­sions of the <em>crafts­person's</em> hand.</p>
          <p>We've for­got­ten the value of work­ing with our hands, of under­stand­ing mat­er­ials in­ti­mate­ly. There's wis­dom in the <a href="#">slow</a> approach, in <strong>re­sis­ting</strong> the urge to auto­mate every­thing.</p>
          <p class="more"><a href="#">Read more</a></p>
        </div>

        <div class="grid grid-narrow">
          <div>
            <h4 class="mb-05">Secondary colours</h4>
            <div class="p-025 bg-accent">Accent</div>
            <div class="p-025" style="background: var(--color-accent2); color: var(--color-white);">Accent 2</div>
            <div class="p-025 bg-subtle">Subtle</div>
            <div class="p-025 text-accent">Accent text</div>
            <div class="p-025" style="color: var(--color-accent2);">Accent 2 text</div>
            <div class="p-025 text-muted">Muted text</div>
          </div>

          <div class="box bg-subtle text-sm">
            <h4>Callout</h4>
            <p>Sim­pli­city isn't about hav­ing less. It's about mak­ing room for what <a href="#">mat­ters</a>. Every un­nec­es­sary fea­ture is a <strong>dis­trac­tion</strong> from the <em>essen­tial</em>.</p>
          </div>

          <div class="stack stack-half">
            <h4>Borders</h4>
            <hr class="my-05">
            <hr class="divider--dotted">
            <hr class="divider--dashed">
            <hr class="divider--hairline">
            <hr class="divider--accent">
            <hr class="divider--semibold">
            <hr class="divider--bold">
            <hr class="divider--extrabold">
          </div>

          <div class="stack">
            <h4>Forms</h4>
            <div class="field">
              <label for="${this.scheme}">Label</label>
              <input type="text" name="${this.scheme}" id="${this.scheme}" value="" placeholder="Placeholder" />
            </div>
            <button>Button</button>
            <button class="button--accent">Button</button>
          </div>
        </div>
      </div>
    `;

    this.innerHTML = html;
  }
}

customElements.define('scheme-panel', SchemePanel);
