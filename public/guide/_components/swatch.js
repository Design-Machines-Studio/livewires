/**
 * <color-swatch> Web Component
 *
 * Displays a color swatch with various color format values.
 *
 * @attr {string} title - Title for the swatch (defaults to variable if not provided)
 * @attr {string} classes - Additional CSS classes
 * @attr {string} variable - CSS variable name (also used as class)
 * @attr {string} hex - Hex color value (required - used to auto-generate RGB, HSLA, and OKLCH)
 * @attr {string} rgb - RGB color value (auto-generated from hex if not provided)
 * @attr {string} hsla - HSLA color value (auto-generated from hex if not provided)
 * @attr {string} oklch - OKLCH color value (auto-generated from hex if not provided)
 * @attr {string} cmyk - CMYK color value (optional)
 * @attr {string} pms - PMS color value (optional)
 * @attr {string} theme - Theme class: 'theme-white', 'theme-black', or 'theme-brand' (auto-calculated for best contrast if not provided)
 *
 * @example
 * <!-- Minimal: just hex (RGB, HSLA, OKLCH, and theme auto-generated) -->
 * <color-swatch
 *   title="Primary Blue"
 *   hex="#0066cc">
 * </color-swatch>
 *
 * <!-- Full: override auto-generated values + add CMYK/PMS -->
 * <color-swatch
 *   title="Primary Blue"
 *   variable="--color-primary"
 *   hex="#0066cc"
 *   cmyk="100, 50, 0, 20"
 *   pms="300 C"
 *   theme="theme-brand">
 * </color-swatch>
 */
class ColorSwatch extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  // Convert hex to RGB
  hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
  }

  // Convert hex to HSLA
  hexToHsla(hex) {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex to RGB
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    // Find min and max values
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    // Calculate hue
    let h = 0;
    if (diff !== 0) {
      if (max === r) {
        h = ((g - b) / diff) % 6;
      } else if (max === g) {
        h = (b - r) / diff + 2;
      } else {
        h = (r - g) / diff + 4;
      }
      h = Math.round(h * 60);
      if (h < 0) h += 360;
    }

    // Calculate lightness
    const l = (max + min) / 2;

    // Calculate saturation
    const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));

    return `${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, 1`;
  }

  // Convert hex to OKLCH
  hexToOklch(hex) {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex to RGB (0-1 range)
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    // Convert to linear RGB (remove gamma correction)
    const toLinear = (c) => {
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    r = toLinear(r);
    g = toLinear(g);
    b = toLinear(b);

    // Convert linear RGB to XYZ (using D65 illuminant)
    const x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
    const y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
    const z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b;

    // Convert XYZ to OKLab
    const l_ = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
    const m_ = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
    const s_ = 0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z;

    const l__ = Math.cbrt(l_);
    const m__ = Math.cbrt(m_);
    const s__ = Math.cbrt(s_);

    const L = 0.2104542553 * l__ + 0.7936177850 * m__ - 0.0040720468 * s__;
    const a = 1.9779984951 * l__ - 2.4285922050 * m__ + 0.4505937099 * s__;
    const b_ = 0.0259040371 * l__ + 0.7827717662 * m__ - 0.8086757660 * s__;

    // Convert OKLab to OKLCH
    const C = Math.sqrt(a * a + b_ * b_);
    let H = Math.atan2(b_, a) * 180 / Math.PI;
    if (H < 0) H += 360;

    return `${(L * 100).toFixed(2)}% ${C.toFixed(4)} ${H.toFixed(2)}`;
  }

  // Calculate best theme class based on WCAG luminance
  getBestTheme(hex) {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex to RGB (0-1 range)
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    // Convert to linear RGB
    const toLinear = (c) => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    r = toLinear(r);
    g = toLinear(g);
    b = toLinear(b);

    // Calculate relative luminance (WCAG formula)
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Return theme-white for light backgrounds, theme-black for dark backgrounds
    return luminance > 0.5 ? 'theme-white' : 'theme-black';
  }

  // Get attribute values with defaults
  get variable() {
    return this.getAttribute('variable') || '';
  }

  get title() {
    return this.getAttribute('title') || this.variable;
  }

  get classes() {
    return this.getAttribute('classes') || '';
  }

  get hex() {
    return this.getAttribute('hex') || '';
  }

  get rgb() {
    // If RGB is provided, use it; otherwise convert from hex
    const provided = this.getAttribute('rgb');
    if (provided) return provided;
    if (this.hex) return this.hexToRgb(this.hex);
    return '';
  }

  get hsla() {
    // If HSLA is provided, use it; otherwise convert from hex
    const provided = this.getAttribute('hsla');
    if (provided) return provided;
    if (this.hex) return this.hexToHsla(this.hex);
    return '';
  }

  get oklch() {
    // If OKLCH is provided, use it; otherwise convert from hex
    const provided = this.getAttribute('oklch');
    if (provided) return provided;
    if (this.hex) return this.hexToOklch(this.hex);
    return '';
  }

  get cmyk() {
    return this.getAttribute('cmyk') || '';
  }

  get pms() {
    return this.getAttribute('pms') || '';
  }

  get theme() {
    // If theme is provided, use it; otherwise auto-calculate from hex
    const provided = this.getAttribute('theme');
    if (provided) return provided;
    if (this.hex) return this.getBestTheme(this.hex);
    return '';
  }

  render() {
    // Build inline style for background color
    const styleAttr = this.hex ? ` style="background-color: ${this.hex}"` : '';

    // Build HTML
    let html = `<div class="${this.variable} swatch box ${this.theme} ${this.classes}"${styleAttr}>`;
    html += `<h4>${this.title}</h4>`;
    html += `<hr class="my-05">`;

    if (this.hex) {
      html += `<p><strong class="block">Hex:</strong> ${this.hex}</p>`;
    }
    if (this.rgb) {
      html += `<p><strong class="block">RGB:</strong> ${this.rgb}</p>`;
    }
    if (this.hsla) {
      html += `<p><strong class="block">HSLA:</strong> ${this.hsla}</p>`;
    }
    if (this.oklch) {
      html += `<p><strong class="block">OKLCH:</strong> ${this.oklch}</p>`;
    }
    if (this.cmyk) {
      html += `<p><strong class="block">CMYK:</strong> ${this.cmyk}</p>`;
    }
    if (this.pms) {
      html += `<p><strong class="block">PMS:</strong> ${this.pms}</p>`;
    }

    html += `</div>`;

    this.innerHTML = html;
  }
}

// Register the custom element
customElements.define('color-swatch', ColorSwatch);
