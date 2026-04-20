/**
 * Design Panel — Colours tab controller (Pass A).
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
 *
 * Anchor / step / chroma ramp-regeneration controls are authored disabled
 * in A3 and stay disabled here; chunk B4 enables them when the OKLCH +
 * ramp algorithm ships.
 *
 * Zero imports by policy — this file is loaded via Vite's bundler from
 * main.js but must not declare its own ES imports. It relies on
 * window.__dpSchemeUpdate (installed by design-panel-runtime.js) and
 * document.* globals only.
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

  function main() {
    const ramps = readRampsFromTokens();
    paintSwatches(ramps);
    populateSchemeSelects();
    hydrateSchemeSelections();
    attachSchemeListeners();
    attachRampRowToggles();
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
