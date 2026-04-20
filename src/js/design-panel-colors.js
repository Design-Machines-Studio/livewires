/**
 * Design Panel — Colours tab controller (Pass A + B).
 *
 * Wires up the slotted Colours editor DOM (authored in A3) to the runtime:
 *
 *   1. Reads --color-{family}-{step} tokens from the cascade via
 *      getComputedStyle (source of truth: src/css/1_tokens/color.css).
 *   2. Paints the 66 ramp-matrix swatches with the resolved hex values.
 *   3. Populates all 30 scheme <select> elements with 1 blank + 6 optgroups
 *      x 11 options each, using createElement/appendChild (never
 *      innerHTML) to keep the XSS surface closed even for trusted data.
 *   4. Hydrates scheme selections from localStorage['design-panel:schemes']
 *      and re-applies the corresponding CSS overrides.
 *   5. Attaches change listeners that apply the Iteration 5 dual-emit
 *      routing via window.__dpSchemeUpdate:
 *        - scheme === 'default' -> :root / .dark-mode in @layer utilities
 *        - scheme === 'subtle'|'accent' -> .scheme-<name> / .scheme-<name>.dark-mode in @layer tokens
 *      Saves state back to localStorage with a 300ms debounce.
 *   6. (Pass B) Wires anchor / step / chroma controls to live
 *      regeneration via window.DesignPanelColor.generateRamp. Per-family
 *      settings persist in localStorage['design-panel:ramps']. Zero
 *      network requests at regeneration time -- all math runs client-side.
 *   7. (Pass B) Copy CSS button serializes the current 66 runtime values
 *      into an @layer tokens :root {} block via navigator.clipboard,
 *      for manual paste back into src/css/1_tokens/color.css.
 *
 * Zero imports by policy — this file is loaded via Vite's bundler from
 * main.js but must not declare its own ES imports. It relies on
 * window.__dpSchemeUpdate (installed by design-panel-runtime.js),
 * window.DesignPanelColor (installed by main.js via registerOnWindow in
 * color/oklch.js + color/ramp.js), and document.* globals only.
 */

(function () {
  'use strict';

  const FAMILIES = ['blue', 'red', 'orange', 'yellow', 'green', 'grey'];
  const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
  const SCHEMES = ['default', 'subtle', 'accent'];
  const MODES = ['light', 'dark'];
  const TOKENS = ['bg', 'fg', 'accent', 'muted', 'subtle'];
  const STORAGE_KEY = 'design-panel:schemes';
  const SAVE_DEBOUNCE_MS = 300;
  const DOM_READY_TIMEOUT_MS = 5000;

  let saveTimer = null;
  let missingTokenLogged = false;

  /* --------------------------------------------------------------- */
  /* 1. Read tokens from the cascade                                 */
  /* --------------------------------------------------------------- */

  function readRampsFromTokens() {
    const root = document.documentElement;
    const computed = getComputedStyle(root);
    const ramps = {};
    for (const family of FAMILIES) {
      ramps[family] = {};
      for (const step of STEPS) {
        const value = computed.getPropertyValue(`--color-${family}-${step}`).trim();
        ramps[family][step] = value || null;
      }
    }
    return ramps;
  }

  /* --------------------------------------------------------------- */
  /* 2. Paint ramp matrix swatches                                    */
  /* --------------------------------------------------------------- */

  function paintSwatches(ramps) {
    for (const family of FAMILIES) {
      const wrapper = document.querySelector(
        `.dp-ramp-row-wrapper[data-family="${family}"]`
      );
      if (!wrapper) continue;
      for (const step of STEPS) {
        const swatch = wrapper.querySelector(
          `.dp-ramp-swatch[data-step="${step}"]`
        );
        if (!swatch) continue;
        const hex = ramps[family][step];
        if (hex) {
          swatch.style.backgroundColor = hex;
        } else if (!missingTokenLogged) {
          // Log once; color.css should declare all 66 tokens after A1.
          // eslint-disable-next-line no-console
          console.warn(
            `[design-panel-colors] Missing --color-${family}-${step} ` +
              `token; leaving swatch unpainted.`
          );
          missingTokenLogged = true;
        }
      }
    }
  }

  /* --------------------------------------------------------------- */
  /* 3. Populate scheme <select> options (DOM API only)               */
  /* --------------------------------------------------------------- */

  function populateSchemeSelects() {
    const selects = document.querySelectorAll(
      '.dp-scheme-card select[data-scheme]'
    );

    for (const select of selects) {
      // Clear existing options so re-running this (e.g., from B4's live
      // regeneration) cannot accumulate duplicates.
      while (select.firstChild) {
        select.removeChild(select.firstChild);
      }

      const blank = document.createElement('option');
      blank.value = '';
      blank.textContent = '—';
      select.appendChild(blank);

      for (const family of FAMILIES) {
        const label = family.charAt(0).toUpperCase() + family.slice(1);
        const group = document.createElement('optgroup');
        group.label = label;

        for (const step of STEPS) {
          const opt = document.createElement('option');
          opt.value = `${family}-${step}`;
          opt.textContent = `${label} ${step}`;
          group.appendChild(opt);
        }

        select.appendChild(group);
      }
    }
  }

  /* --------------------------------------------------------------- */
  /* 4. Hydrate selections from localStorage                          */
  /* --------------------------------------------------------------- */

  function readStoredState() {
    let raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch {
      return {};
    }
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function hydrateSchemeSelections() {
    const stored = readStoredState();
    for (const scheme of SCHEMES) {
      const schemeState = stored[scheme];
      if (!schemeState || typeof schemeState !== 'object') continue;
      for (const mode of MODES) {
        const modeState = schemeState[mode];
        if (!modeState || typeof modeState !== 'object') continue;
        for (const token of TOKENS) {
          const value = modeState[token];
          if (!value) continue;
          const select = document.getElementById(
            `dp-scheme-${scheme}-${mode}-${token}`
          );
          if (!select) continue;
          select.value = value;
          // Re-apply the CSS override so the page matches the saved state.
          applySchemeMapping(scheme, mode, token, value);
        }
      }
    }
  }

  /* --------------------------------------------------------------- */
  /* 5. Attach change listeners                                       */
  /* --------------------------------------------------------------- */

  function attachSchemeListeners() {
    const selects = document.querySelectorAll(
      '.dp-scheme-card select[data-scheme]'
    );
    for (const select of selects) {
      select.addEventListener('change', handleSchemeChange);
    }
  }

  function handleSchemeChange(event) {
    const select = event.currentTarget;
    const { scheme, mode, token } = select.dataset;
    if (!scheme || !mode || !token) return;
    applySchemeMapping(scheme, mode, token, select.value);
    debouncedSave();
  }

  /* --------------------------------------------------------------- */
  /* 6. Apply scheme mapping — Iteration 5 dual-emit                  */
  /* --------------------------------------------------------------- */

  function applySchemeMapping(scheme, mode, token, value) {
    if (typeof window.__dpSchemeUpdate !== 'function') {
      // design-panel-runtime.js should have installed this; log once
      // via the existing missingTokenLogged gate to avoid spam.
      if (!missingTokenLogged) {
        // eslint-disable-next-line no-console
        console.warn(
          '[design-panel-colors] window.__dpSchemeUpdate is unavailable; ' +
            'runtime scheme overrides cannot be written.'
        );
        missingTokenLogged = true;
      }
      return;
    }

    const prop = `--color-${token}`;
    const cssValue = value ? `var(--color-${value})` : 'initial';

    if (scheme === 'default') {
      // Iteration 5: write Default scheme edits to :root (light) or
      // .dark-mode (dark) in @layer utilities so they apply page-wide
      // without requiring a .scheme-default class anywhere.
      const selector = mode === 'dark' ? '.dark-mode' : ':root';
      window.__dpSchemeUpdate(selector, prop, cssValue, 'utilities');
    } else {
      // Subtle / Accent: write to the scheme class in @layer tokens;
      // only elements that opt in via the class receive the override.
      const selector =
        mode === 'dark'
          ? `.scheme-${scheme}.dark-mode`
          : `.scheme-${scheme}`;
      window.__dpSchemeUpdate(selector, prop, cssValue, 'tokens');
    }
  }

  /* --------------------------------------------------------------- */
  /* 7. Debounced localStorage save                                   */
  /* --------------------------------------------------------------- */

  function debouncedSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeSchemes()));
      } catch {
        // Quota exceeded / disabled storage — silently skip.
      }
    }, SAVE_DEBOUNCE_MS);
  }

  function serializeSchemes() {
    const state = {};
    for (const scheme of SCHEMES) {
      state[scheme] = { light: {}, dark: {} };
      for (const mode of MODES) {
        for (const token of TOKENS) {
          const select = document.getElementById(
            `dp-scheme-${scheme}-${mode}-${token}`
          );
          if (select && select.value) {
            state[scheme][mode][token] = select.value;
          }
        }
      }
    }
    return state;
  }

  /* --------------------------------------------------------------- */
  /* 8. Bootstrap — wait for DOM, then init                           */
  /* --------------------------------------------------------------- */

  function waitForSchemeCards() {
    if (document.querySelector('.dp-scheme-card')) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        if (document.querySelector('.dp-scheme-card')) {
          cleanup();
          resolve();
        }
      });
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Colours editor DOM not found after 5s'));
      }, DOM_READY_TIMEOUT_MS);
      function cleanup() {
        observer.disconnect();
        clearTimeout(timeoutId);
      }
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  function attachRampRowToggles() {
    const rows = document.querySelectorAll('.dp-ramp-row');
    for (const row of rows) {
      row.addEventListener('click', () => {
        const targetId = row.getAttribute('aria-controls');
        if (!targetId) return;
        const settings = document.getElementById(targetId);
        if (!settings) return;
        const isHidden = settings.hasAttribute('hidden');
        if (isHidden) {
          settings.removeAttribute('hidden');
          row.setAttribute('aria-expanded', 'true');
        } else {
          settings.setAttribute('hidden', '');
          row.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /* --------------------------------------------------------------- */
  /* Pass B: live ramp regeneration                                   */
  /* --------------------------------------------------------------- */

  const RAMP_STORAGE_KEY = 'design-panel:ramps';
  const RAMP_SAVE_DEBOUNCE_MS = 300;
  let rampSaveTimer = null;
  let rampRuntimeMissingLogged = false;

  // Resolve the ramp runtime. Tests run in node and never invoke this file;
  // if main.js forgot to call registerOnWindow, log once and leave ramp
  // controls as no-ops so the Schemes editor still works.
  function getRampRuntime() {
    const rt = window.DesignPanelColor;
    if (!rt || typeof rt.generateRamp !== 'function') {
      if (!rampRuntimeMissingLogged) {
        // eslint-disable-next-line no-console
        console.warn(
          '[design-panel-colors] window.DesignPanelColor.generateRamp not ' +
            'registered; ramp regeneration disabled. Ensure main.js imports ' +
            "'./color/oklch.js' and './color/ramp.js' before this module."
        );
        rampRuntimeMissingLogged = true;
      }
      return null;
    }
    return rt;
  }

  // Build per-family defaults at runtime from the current color.css tokens.
  // If the user edits color.css manually, the panel picks up the new anchor
  // on next load -- no hard-coded fallback values beyond pure grey.
  function loadDefaultRampSettings() {
    const computed = getComputedStyle(document.documentElement);
    const defaults = {};
    for (const family of FAMILIES) {
      const raw = computed.getPropertyValue(`--color-${family}-500`).trim();
      defaults[family] = {
        anchorHex: (raw || '#808080').toLowerCase(),
        anchorStep: 500,
        chroma: 80,
        isNeutral: false
      };
    }
    return defaults;
  }

  function readStoredRampOverrides() {
    try {
      const raw = localStorage.getItem(RAMP_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function loadRampSettings() {
    const defaults = loadDefaultRampSettings();
    const stored = readStoredRampOverrides();
    const merged = {};
    for (const family of FAMILIES) {
      merged[family] = {
        ...defaults[family],
        ...(stored[family] && typeof stored[family] === 'object' ? stored[family] : {})
      };
    }
    return merged;
  }

  function hasStoredOverrides() {
    const stored = readStoredRampOverrides();
    return Object.keys(stored).length > 0;
  }

  function saveRampSettings(settings) {
    try {
      localStorage.setItem(RAMP_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Quota exceeded / disabled storage -- silently skip.
    }
  }

  function debouncedRampSave(settings) {
    if (rampSaveTimer) clearTimeout(rampSaveTimer);
    rampSaveTimer = setTimeout(() => {
      rampSaveTimer = null;
      saveRampSettings(settings);
    }, RAMP_SAVE_DEBOUNCE_MS);
  }

  function buildScaledChromaProfile(runtime, chromaPct) {
    const scale = Math.max(0, Math.min(100, chromaPct)) / 100;
    const baseline = runtime.DEFAULT_CHROMA_PROFILE || {};
    const profile = {};
    for (const step of STEPS) {
      const numericStep = Number(step);
      // Runtime constants come from ramp.js where keys are numbers; fall
      // back to DEFAULT_CHROMA_PROFILE[stringStep] just in case a consumer
      // passes us a string-keyed object.
      const base = baseline[numericStep] ?? baseline[step] ?? 0.5;
      profile[numericStep] = base * scale;
    }
    return profile;
  }

  // Regenerate one family and apply the 11 resulting hex values:
  //   - rewrite the 11 --color-{family}-{step} custom properties on :root
  //   - repaint the 11 swatches in the ramp matrix row
  // All other families are left alone, so regeneration cost scales O(1)
  // in the number of families regardless of DOM size.
  function regenerateFamily(family, settings) {
    const runtime = getRampRuntime();
    if (!runtime) return;
    const s = settings[family];
    if (!s) return;

    const chromaProfile = buildScaledChromaProfile(runtime, s.chroma);
    let result;
    try {
      result = runtime.generateRamp({
        anchorHex: s.anchorHex,
        anchorStep: s.anchorStep,
        chromaProfile,
        isNeutral: !!s.isNeutral,
        neutralChroma: s.neutralChroma,
        neutralHue: s.neutralHue
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        `[design-panel-colors] generateRamp failed for ${family}: ${err.message}`
      );
      return;
    }

    const wrapper = document.querySelector(
      `.dp-ramp-row-wrapper[data-family="${family}"]`
    );
    const root = document.documentElement;
    for (const entry of result) {
      const stepStr = String(entry.step);
      root.style.setProperty(`--color-${family}-${stepStr}`, entry.hex);
      if (wrapper) {
        const swatch = wrapper.querySelector(
          `.dp-ramp-swatch[data-step="${stepStr}"]`
        );
        if (swatch) swatch.style.backgroundColor = entry.hex;
      }
    }
  }

  function regenerateAllFamilies(settings) {
    for (const family of FAMILIES) {
      regenerateFamily(family, settings);
    }
  }

  function attachRampListeners(settings) {
    for (const family of FAMILIES) {
      const anchor = document.getElementById(`dp-anchor-${family}`);
      const step = document.getElementById(`dp-step-${family}`);
      const chroma = document.getElementById(`dp-chroma-${family}`);

      // Hydrate controls from state (so restored localStorage values show up).
      if (anchor && settings[family].anchorHex) {
        anchor.value = settings[family].anchorHex;
      }
      if (step) {
        step.value = String(settings[family].anchorStep);
      }
      if (chroma) {
        chroma.value = String(settings[family].chroma);
        chroma.setAttribute(
          'aria-valuetext',
          `Chroma ${settings[family].chroma} percent`
        );
      }

      if (anchor) {
        anchor.addEventListener('input', () => {
          settings[family].anchorHex = (anchor.value || '').toLowerCase();
          regenerateFamily(family, settings);
          debouncedRampSave(settings);
        });
      }
      if (step) {
        step.addEventListener('change', () => {
          const parsed = parseInt(step.value, 10);
          if (Number.isFinite(parsed)) {
            settings[family].anchorStep = parsed;
            regenerateFamily(family, settings);
            debouncedRampSave(settings);
          }
        });
      }
      if (chroma) {
        chroma.addEventListener('input', () => {
          const parsed = parseInt(chroma.value, 10);
          if (Number.isFinite(parsed)) {
            settings[family].chroma = parsed;
            chroma.setAttribute('aria-valuetext', `Chroma ${parsed} percent`);
            regenerateFamily(family, settings);
            debouncedRampSave(settings);
          }
        });
      }
    }
  }

  function serializeRampsAsCSS() {
    const computed = getComputedStyle(document.documentElement);
    const lines = ['@layer tokens {', '  :root {'];
    for (const family of FAMILIES) {
      const label = family.charAt(0).toUpperCase() + family.slice(1);
      lines.push(`    /* ${label} */`);
      for (const step of STEPS) {
        const value = computed.getPropertyValue(`--color-${family}-${step}`).trim();
        if (value) {
          lines.push(`    --color-${family}-${step}: ${value};`);
        }
      }
      lines.push('');
    }
    lines.push('  }', '}');
    return lines.join('\n');
  }

  function attachCopyCSSButton() {
    const btn = document.querySelector('.dp-copy-css');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const css = serializeRampsAsCSS();
      const original = btn.textContent;
      const restore = (label, delay) => {
        btn.textContent = label;
        setTimeout(() => { btn.textContent = original; }, delay);
      };

      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        // eslint-disable-next-line no-console
        console.warn('[design-panel-colors] navigator.clipboard unavailable');
        restore('Clipboard unavailable', 2000);
        return;
      }

      navigator.clipboard.writeText(css).then(
        () => {
          // 66 tokens = 6 families * 11 steps when all color.css declarations
          // are present; label is informational only.
          restore('Copied 66 tokens', 2000);
        },
        (err) => {
          // eslint-disable-next-line no-console
          console.error('[design-panel-colors] clipboard write failed:', err);
          restore('Copy failed', 2000);
        }
      );
    });
  }

  function main() {
    const ramps = readRampsFromTokens();
    paintSwatches(ramps);
    populateSchemeSelects();
    hydrateSchemeSelections();
    attachSchemeListeners();
    attachRampRowToggles();

    // Pass B: live regeneration. Order matters -- reapply stored overrides
    // first so subsequent user input writes on top of the restored state.
    const rampSettings = loadRampSettings();
    if (hasStoredOverrides()) {
      regenerateAllFamilies(rampSettings);
    }
    attachRampListeners(rampSettings);
    attachCopyCSSButton();
  }

  function init() {
    waitForSchemeCards()
      .then(main)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn(
          `[design-panel-colors] init skipped: ${err.message}`
        );
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
