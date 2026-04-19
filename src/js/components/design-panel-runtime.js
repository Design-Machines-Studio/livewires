/**
 * design-panel-runtime.js
 *
 * Runtime stylesheet helpers for the design panel's Scheme editor.
 * Exposes three globals consumed by the Scheme templates' onchange
 * handlers and by the Save/Reset buttons in the Theme tab:
 *
 *   window.__dpSchemeUpdate(selector, prop, value, layerName)
 *   window.__dpSchemeReset()
 *   window.__dpSchemeSerialize()
 *
 * Runtime rules split across two cascade layers:
 *
 *   @layer tokens     for `.scheme-X` and `.dark-mode .scheme-X` rules.
 *                     Must LOSE to `.dp-scheme-preview-light .scheme-default`
 *                     (in @layer components) to preserve preview isolation.
 *
 *   @layer utilities  for `:root` and `.dark-mode` root-level rules.
 *                     Must BEAT prototyping.css's `.dark-mode { --color-bg:
 *                     grey-900 }` which also lives in @layer utilities.
 *                     Same layer means source-order wins; the runtime
 *                     sheet is inserted after prototyping.css so our rule
 *                     wins. Utilities > tokens means they also beat
 *                     color.css's `.dark-mode` rule in the tokens layer.
 *
 * Previously embedded as a ~1500-char minified IIFE string in
 * backend/internal/partials/design_panel_token_data.go. Moved to a
 * proper JS file so it can be diffed, linted, and tested. The Go side
 * emits nothing; this file is loaded by main.js alongside the web
 * component.
 */

(function () {
  const STYLE_ID = 'design-panel-runtime-schemes';

  function ensureStylesheet() {
    let s = document.getElementById(STYLE_ID);
    if (!s) {
      s = document.createElement('style');
      s.id = STYLE_ID;
      document.head.appendChild(s);
      s.sheet.insertRule('@layer tokens {}', 0);
      s.sheet.insertRule('@layer utilities {}', 1);
    }
    const layers = {};
    for (let i = 0; i < s.sheet.cssRules.length; i++) {
      const r = s.sheet.cssRules[i];
      if (r.name) layers[r.name] = r;
    }
    return layers;
  }

  let layers = null;

  function getLayers() {
    if (!layers) layers = ensureStylesheet();
    return layers;
  }

  window.__dpSchemeUpdate = function (selector, prop, value, layerName) {
    const layer = getLayers()[layerName || 'tokens'];
    if (!layer) return;
    // Find existing rule for this selector and update in place.
    for (let i = 0; i < layer.cssRules.length; i++) {
      if (layer.cssRules[i].selectorText === selector) {
        layer.cssRules[i].style.setProperty(prop, value);
        return;
      }
    }
    // No existing rule -> append a new one.
    layer.insertRule(selector + '{' + prop + ':' + value + '}', layer.cssRules.length);
  };

  window.__dpSchemeReset = function () {
    const ls = getLayers();
    for (const k in ls) {
      const layer = ls[k];
      while (layer.cssRules.length > 0) layer.deleteRule(0);
    }
    // Preview cards: strip any runtime inline styles we set on them.
    document
      .querySelectorAll(
        '.dp-scheme-preview .scheme-default,' +
          '.dp-scheme-preview .scheme-subtle,' +
          '.dp-scheme-preview .scheme-accent',
      )
      .forEach((el) => el.removeAttribute('style'));
    // Dropdowns: restore the HTML-marked defaultSelected option.
    document.querySelectorAll('.dp-scheme-mapping-row select').forEach((sel) => {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].defaultSelected) {
          sel.selectedIndex = i;
          break;
        }
      }
    });
  };

  window.__dpSchemeSerialize = function () {
    const out = [];
    document.querySelectorAll('.dp-scheme-card').forEach((card) => {
      const previewEl = card.querySelector('.dp-scheme-preview-light > [class^="scheme-"]');
      if (!previewEl) return;
      const scheme = previewEl.className.replace(/^scheme-/, '');
      const cols = card.querySelectorAll('.dp-scheme-mode-column');
      const modeNames = ['light', 'dark'];
      cols.forEach((col, idx) => {
        const mode = modeNames[idx];
        if (!mode) return;
        col.querySelectorAll('.dp-scheme-mapping-row').forEach((row) => {
          const labelEl = row.querySelector('label');
          const sel = row.querySelector('select');
          if (!labelEl || !sel) return;
          const token = labelEl.textContent.trim();
          const val = sel.value;
          const libDefault = sel.getAttribute('data-library-default') || '';
          // Only persist when the user has picked a value different
          // from the library default. This keeps Save idempotent on
          // unmodified dropdowns.
          if (val && val !== libDefault) {
            out.push({ scheme, token, mode, value: val });
          }
        });
      });
    });
    return out;
  };
})();
