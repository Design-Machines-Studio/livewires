/**
 * HTML Include Web Component
 *
 * Usage: <html-include src="/_includes/header.html"></html-include>
 *
 * This custom element fetches and renders HTML fragments,
 * enabling zero-dependency HTML includes using native Web Components.
 */

class HtmlInclude extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute('src');

    if (!src) {
      console.error('HtmlInclude: missing src attribute');
      return;
    }

    try {
      const response = await fetch(src);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Parse HTML and handle script tags specially
      const template = document.createElement('template');
      template.innerHTML = html;

      // Clone the content
      const content = template.content.cloneNode(true);

      // Replace innerHTML
      this.innerHTML = '';
      this.appendChild(content);

      // Re-execute any script tags (innerHTML doesn't execute them)
      const scripts = this.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });

    } catch (error) {
      console.error(`HtmlInclude: failed to load ${src}`, error);
      // Optionally display error in development
      if (import.meta.env.DEV) {
        this.innerHTML = `<div style="color: red; border: 2px solid red; padding: 1rem;">
          Failed to load include: ${src}
        </div>`;
      }
    }
  }
}

// Register the custom element
customElements.define('html-include', HtmlInclude);
