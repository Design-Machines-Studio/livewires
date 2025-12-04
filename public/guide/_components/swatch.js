/**
 * <color-swatch> Web Component
 *
 * Displays a color swatch with various color format values.
 * Can automatically resolve color values from CSS custom properties.
 *
 * @attr {string} title - Title for the swatch (defaults to token if not provided)
 * @attr {string} token - CSS variable name without -- prefix (e.g., "color-orange-500")
 *                        If hex is not provided, the component will attempt to resolve the color
 *                        from the CSS custom property --{token}
 * @attr {string} hex - Hex color value (optional if token can be resolved from CSS)
 * @attr {string} scheme - Scheme class to use (e.g., "scheme-orange"). If not provided, uses bg-{color} fallback.
 * @attr {string} rgb - RGB color value (auto-generated from hex if not provided)
 * @attr {string} hsla - HSLA color value (auto-generated from hex if not provided)
 * @attr {string} oklch - OKLCH color value (auto-generated from hex if not provided)
 * @attr {string} cmyk - CMYK color value (optional)
 * @attr {string} pms - PMS color value (optional)
 *
 * Text color (white or black) is automatically determined based on background luminance.
 *
 * @example
 * <!-- Minimal: just token (color resolved from CSS) -->
 * <color-swatch token="color-orange-500"></color-swatch>
 *
 * <!-- With explicit hex (skips CSS resolution) -->
 * <color-swatch
 *   token="color-orange-500"
 *   hex="#FF4F00">
 * </color-swatch>
 *
 * <!-- With scheme class -->
 * <color-swatch
 *   title="Orange 500"
 *   token="color-orange-500"
 *   scheme="scheme-orange">
 * </color-swatch>
 */
class ColorSwatch extends HTMLElement {
  connectedCallback() {
    // Resolve color from CSS if hex not provided
    this._resolvedHex = this.getAttribute('hex') || this.resolveColorFromToken();
    this.render();
  }

  /**
   * Resolve color value from CSS custom property
   * Creates a temporary element, applies the token as background, reads computed value
   */
  resolveColorFromToken() {
    const token = this.getAttribute('token');
    if (!token) return '';

    // First, try to read the CSS custom property directly
    const cssValue = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim();

    // If it's already a hex value, return it
    if (cssValue.startsWith('#')) {
      return cssValue;
    }

    // If it's an rgb/rgba value, convert to hex
    if (cssValue.startsWith('rgb')) {
      return this.rgbStringToHex(cssValue);
    }

    // If the token references another variable or is complex, resolve via computed style
    // Create a temporary element to resolve the actual color
    const temp = document.createElement('div');
    temp.style.backgroundColor = `var(--${token})`;
    temp.style.display = 'none';
    document.body.appendChild(temp);

    const computedColor = getComputedStyle(temp).backgroundColor;
    document.body.removeChild(temp);

    // Convert the computed rgb() value to hex
    if (computedColor && computedColor !== 'rgba(0, 0, 0, 0)') {
      return this.rgbStringToHex(computedColor);
    }

    return '';
  }

  /**
   * Convert rgb(r, g, b) or rgba(r, g, b, a) string to hex
   */
  rgbStringToHex(rgbString) {
    const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '';

    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);

    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  // Convert hex to RGB
  hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }

  // Convert hex to HSLA
  hexToHsla(hex) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

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

    const l = (max + min) / 2;
    const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));

    return `${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, 1`;
  }

  // Convert hex to OKLCH
  hexToOklch(hex) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    const toLinear = (c) => {
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    r = toLinear(r);
    g = toLinear(g);
    b = toLinear(b);

    const x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
    const y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
    const z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b;

    const l_ = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
    const m_ = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
    const s_ = 0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z;

    const l__ = Math.cbrt(l_);
    const m__ = Math.cbrt(m_);
    const s__ = Math.cbrt(s_);

    const L = 0.2104542553 * l__ + 0.7936177850 * m__ - 0.0040720468 * s__;
    const a = 1.9779984951 * l__ - 2.4285922050 * m__ + 0.4505937099 * s__;
    const b_ = 0.0259040371 * l__ + 0.7827717662 * m__ - 0.8086757660 * s__;

    const C = Math.sqrt(a * a + b_ * b_);
    let H = Math.atan2(b_, a) * 180 / Math.PI;
    if (H < 0) H += 360;

    return `${(L * 100).toFixed(2)}% ${C.toFixed(4)} ${H.toFixed(2)}`;
  }

  // Calculate relative luminance for WCAG contrast
  getLuminance(hex) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    const toLinear = (c) => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    r = toLinear(r);
    g = toLinear(g);
    b = toLinear(b);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  // Determine if text should be white or black based on background
  getTextColor(hex) {
    const luminance = this.getLuminance(hex);
    // Use white text on dark backgrounds, black on light
    return luminance > 0.4 ? '#000000' : '#FFFFFF';
  }

  // Get attribute values with defaults
  get token() {
    return this.getAttribute('token') || '';
  }

  get title() {
    return this.getAttribute('title') || this.token;
  }

  get hex() {
    // Use resolved hex (from CSS or attribute)
    return this._resolvedHex || '';
  }

  get scheme() {
    return this.getAttribute('scheme') || '';
  }

  get rgb() {
    const provided = this.getAttribute('rgb');
    if (provided) return provided;
    if (this.hex) return this.hexToRgb(this.hex);
    return '';
  }

  get hsla() {
    const provided = this.getAttribute('hsla');
    if (provided) return provided;
    if (this.hex) return this.hexToHsla(this.hex);
    return '';
  }

  get oklch() {
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

  render() {
    const textColor = this.hex ? this.getTextColor(this.hex) : '#000000';

    // Build class list: use scheme if provided, otherwise use inline style
    let classAttr = 'swatch box';
    let styleAttr = '';

    if (this.scheme) {
      classAttr += ` ${this.scheme}`;
    }

    // Always set inline styles for reliable color display
    if (this.hex) {
      styleAttr = ` style="background-color: ${this.hex}; color: ${textColor};"`;
    }

    // Build HTML
    let html = `<div class="${classAttr}"${styleAttr}>`;

    // Title
    html += `<h4 class="text-base font-bold" style="color: ${textColor};">${this.title}</h4>`;

    // Token name
    if (this.token) {
      html += `<p class="text-xs font-mono" style="color: ${textColor};">--${this.token}</p>`;
    }

    html += `<hr style="border-color: ${textColor}; opacity: 0.5;"><div class="grid grid-narrow grid-gap-0">`;

    // Color values
    const valueStyle = `style="color: ${textColor};"`;
    const labelStyle = `style="color: ${textColor};"`;

    if (this.hex) {
      html += `<p class="text-sm" ${valueStyle}><span class="text-xs block font-bold" ${labelStyle}>Hex</span>${this.hex}</p>`;
    }
    if (this.rgb) {
      html += `<p class="text-sm" ${valueStyle}><span class="text-xs block font-bold" ${labelStyle}>RGB</span>${this.rgb}</p>`;
    }
    if (this.hsla) {
      html += `<p class="text-sm" ${valueStyle}><span class="text-xs block font-bold" ${labelStyle}>HSLA</span>${this.hsla}</p>`;
    }
    if (this.oklch) {
      html += `<p class="text-sm" ${valueStyle}><span class="text-xs block font-bold" ${labelStyle}>OKLCH</span>${this.oklch}</p>`;
    }
    if (this.cmyk) {
      html += `<p class="text-sm" ${valueStyle}><span class="text-xs block font-bold" ${labelStyle}>CMYK</span>${this.cmyk}</p>`;
    }
    if (this.pms) {
      html += `<p class="text-sm" ${valueStyle}><span class="text-xs block font-bold" ${labelStyle}>PMS</span>${this.pms}</p>`;
    }

    html += `</div></div>`;

    this.innerHTML = html;
  }
}

// Register the custom element
customElements.define('color-swatch', ColorSwatch);
