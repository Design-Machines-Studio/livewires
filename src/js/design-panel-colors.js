/**
 * Design Panel — Colours tab controller.
 *
 * Builds the Colours editor DOM (ramp matrix + scheme cards) programmatically
 * from FAMILIES/SCHEMES/MODES/TOKENS constants and wires it to the runtime:
 *
 *   1. Reads --color-{family}-{step} tokens from the cascade via
 *      getComputedStyle (source of truth: src/css/1_tokens/color.css).
 *   2. Paints the 6x11 ramp-matrix swatches with the resolved hex values.
 *   3. Populates all 30 scheme <select> elements with 1 blank + 6 optgroups
 *      x 11 options each, using createElement/appendChild (never
 *      innerHTML) to keep the XSS surface closed even for trusted data.
 *   4. Hydrates scheme selections from localStorage['design-panel:schemes']
 *      (validated against a strict allow-list before use) and re-applies
 *      the corresponding CSS overrides.
 *   5. Attaches change listeners that apply dual-emit routing via
 *      window.__dpSchemeUpdate:
 *        - scheme === 'default' -> :root / .dark-mode in @layer utilities
 *        - scheme === 'subtle'|'accent' -> .scheme-<name> / .scheme-<name>.dark-mode in @layer tokens
 *      Saves state back to localStorage with a 300ms debounce.
 *   6. Wires anchor / step / chroma controls to live regeneration via
 *      window.DesignPanelColor.generateRamp. Per-family settings persist
 *      in localStorage['design-panel:ramps']. Zero network requests at
 *      regeneration time -- all math runs client-side.
 * Zero imports by policy — this file is loaded via Vite's bundler from
 * main.js but must not declare its own ES imports. It relies on
 * window.__dpSchemeUpdate (installed by design-panel-runtime.js),
 * window.DesignPanelColor (installed by main.js via registerOnWindow in
 * color/oklch.js + color/ramp.js), and document.* globals only.
 */

(function () {
  'use strict';

  // Prefer the canonical lists from the ramp runtime so adding a 7th family
  // in ramp.js doesn't silently diverge here. Fall back to identical literals
  // if the runtime isn't registered yet (e.g. during unit tests).
  const RUNTIME = (typeof window !== 'undefined' && window.DesignPanelColor) || {};
  const FAMILIES = RUNTIME.FAMILY_NAMES
    ? Array.from(RUNTIME.FAMILY_NAMES)
    : ['blue', 'red', 'orange', 'yellow', 'green', 'grey'];
  const STEPS = RUNTIME.STEPS
    ? RUNTIME.STEPS.map(String)
    : ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
  const SCHEMES = ['default', 'subtle', 'accent'];
  const MODES = ['light', 'dark'];
  const TOKENS = ['bg', 'fg', 'accent', 'muted', 'subtle'];

  const SCHEMES_STORAGE_KEY = 'design-panel:schemes';
  const RAMP_STORAGE_KEY = 'design-panel:ramps';
  const SAVE_DEBOUNCE_MS = 300;

  // Per-family default anchor hex for the color picker fallback. These match
  // the brand palette anchors in src/css/1_tokens/color.css at the 500 step
  // and are only used if getComputedStyle can't resolve the cascade value.
  const ANCHOR_FALLBACKS = {
    blue: '#1f75ff',
    red: '#e10600',
    orange: '#ff4f00',
    yellow: '#ffa300',
    green: '#00b312',
    grey: '#808080'
  };

  const FAMILY_LABEL = {};
  for (const family of FAMILIES) {
    FAMILY_LABEL[family] = family.charAt(0).toUpperCase() + family.slice(1);
  }

  // Allow-list for validating scheme select values loaded from localStorage.
  // Closes the CSS injection channel at the controller boundary: any value
  // not matching `{family}-{step}` is discarded before it can reach
  // CSSStyleSheet.insertRule in design-panel-runtime.js.
  const SCHEME_VALUE_RE = new RegExp(
    `^(?:${FAMILIES.join('|')})-(?:${STEPS.join('|')})$`
  );

  // Separate log gates per failure mode so a missing token doesn't silence
  // a missing __dpSchemeUpdate warning or vice versa.
  let missingTokenLogged = false;
  let schemeUpdateMissingLogged = false;
  let rampRuntimeMissingLogged = false;

  /* --------------------------------------------------------------- */
  /* DOM builders                                                    */
  /* --------------------------------------------------------------- */

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const key in attrs) {
        if (key === 'text') {
          node.textContent = attrs[key];
        } else if (key in node && typeof attrs[key] !== 'string') {
          // Direct DOM property (e.g. disabled: true, selected: true).
          node[key] = attrs[key];
        } else {
          node.setAttribute(key, attrs[key]);
        }
      }
    }
    if (children) {
      for (const child of children) {
        if (child != null) node.appendChild(child);
      }
    }
    return node;
  }

  function buildRampRow(family) {
    const label = FAMILY_LABEL[family];
    const settingsId = `dp-ramp-settings-${family}`;

    const labelSpan = el('span', { class: 'dp-ramp-label', text: label });
    const grid = el('span', { class: 'dp-ramp-grid', 'aria-hidden': 'true' });
    for (const step of STEPS) {
      grid.appendChild(
        el('span', { class: 'dp-ramp-swatch', 'data-step': step })
      );
    }

    const button = el(
      'button',
      {
        class: 'dp-ramp-row',
        type: 'button',
        'aria-expanded': 'false',
        'aria-controls': settingsId,
        // SC 2.4.6 / 4.1.2: distinguish the disclosure action from the label.
        'aria-label': `${label} ramp settings`
      },
      [labelSpan, grid]
    );

    // Ramp settings drawer wrapped in a <fieldset> so AT groups the three
    // controls under one legend and announces "Blue ramp settings" once.
    // SC 1.3.1 grouping.
    const legend = el('legend', {
      class: 'dp-ramp-settings-legend',
      text: `${label} ramp settings`
    });

    const anchorLabel = el('label', {
      for: `dp-anchor-${family}`,
      text: 'Anchor color'
    });
    const anchorInput = el('input', {
      type: 'color',
      id: `dp-anchor-${family}`,
      // Intentional: omit hardcoded value — the controller hydrates from
      // computed tokens on init so JS failure cannot surface stale hex.
    });

    const stepLabel = el('label', {
      for: `dp-step-${family}`,
      text: 'Anchor step'
    });
    const stepSelect = el('select', { id: `dp-step-${family}` });
    for (const step of STEPS) {
      const opt = el('option', { value: step, text: step });
      if (step === '500') opt.selected = true;
      stepSelect.appendChild(opt);
    }

    const chromaLabel = el('label', {
      for: `dp-chroma-${family}`,
      text: 'Chroma intensity'
    });
    const chromaInput = el('input', {
      type: 'range',
      id: `dp-chroma-${family}`,
      min: '0',
      max: '100',
      value: '80'
      // aria-valuetext intentionally omitted — attachRampListeners sets it
      // on initial hydration and every input event.
    });

    const fieldset = el(
      'fieldset',
      { class: 'dp-ramp-settings', id: settingsId, hidden: '' },
      [
        legend,
        anchorLabel, anchorInput,
        stepLabel, stepSelect,
        chromaLabel, chromaInput
      ]
    );

    return el(
      'div',
      { class: 'dp-ramp-row-wrapper', 'data-family': family },
      [button, fieldset]
    );
  }

  function buildSchemePreview(scheme, mode) {
    const label = scheme.charAt(0).toUpperCase() + scheme.slice(1);
    const previewModeClass =
      mode === 'dark' ? 'dp-scheme-preview-dark dark-mode' : 'dp-scheme-preview-light';

    return el(
      'div',
      { class: `dp-scheme-preview ${previewModeClass}`, 'aria-hidden': 'true' },
      [
        el('div', { class: `scheme-${scheme}` }, [
          el('div', { class: 'dp-scheme-heading', text: label }),
          el('div', { class: 'dp-scheme-divider' }),
          el('div', { class: 'dp-scheme-body', text: 'Sample body text' }),
          el('div', { class: 'dp-scheme-meta' }, [
            el('span', { class: 'dp-scheme-accent-text', text: 'Accent' }),
            el('span', { class: 'dp-scheme-subtle-swatch' }),
            el('span', { class: 'dp-scheme-muted-text', text: 'Muted' })
          ])
        ])
      ]
    );
  }

  function buildSchemeMappingRow(scheme, mode, token) {
    const id = `dp-scheme-${scheme}-${mode}-${token}`;
    return el('div', { class: 'dp-scheme-mapping-row' }, [
      el('label', { for: id, text: token }),
      el('select', {
        id,
        'data-scheme': scheme,
        'data-mode': mode,
        'data-token': token,
        // Initial placeholder lets static-render state announce something
        // other than "0 of 0" while scripts are still loading.
        'aria-busy': 'true'
      }, [
        el('option', { value: '', disabled: true, selected: true, text: 'Loading…' })
      ])
    ]);
  }

  function buildSchemeCardMode(scheme, mode) {
    const label = FAMILY_LABEL_SCHEME(scheme);
    const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1);

    const summary = el(
      'summary',
      {
        // SC 1.3.1 / 2.4.6: give each disclosure an accessible name that
        // distinguishes which scheme and mode it controls. The preview
        // inside is marked aria-hidden because it duplicates no info.
        'aria-label': `${label} scheme, ${modeLabel} mode`
      },
      [buildSchemePreview(scheme, mode)]
    );

    const legend = el('legend', { class: 'dp-scheme-mode-label', text: modeLabel });
    const fieldset = el('fieldset', { class: 'dp-scheme-mode-column' }, [legend]);
    for (const token of TOKENS) {
      fieldset.appendChild(buildSchemeMappingRow(scheme, mode, token));
    }

    return el(
      'details',
      { class: 'dp-scheme-card-mode', 'data-mode': mode },
      [summary, fieldset]
    );
  }

  function buildSchemeCard(scheme) {
    const label = FAMILY_LABEL_SCHEME(scheme);
    return el(
      'div',
      {
        class: 'dp-scheme-card',
        'data-scheme': scheme,
        role: 'listitem',
        'aria-label': `${label} scheme`
      },
      [buildSchemeCardMode(scheme, 'light'), buildSchemeCardMode(scheme, 'dark')]
    );
  }

  function FAMILY_LABEL_SCHEME(scheme) {
    return scheme.charAt(0).toUpperCase() + scheme.slice(1);
  }

  function buildAll() {
    const matrix = document.querySelector('[data-dp-ramp-matrix]');
    if (matrix && !matrix.firstChild) {
      for (const family of FAMILIES) {
        matrix.appendChild(buildRampRow(family));
      }
    }
    const list = document.querySelector('[data-dp-scheme-list]');
    if (list && !list.firstChild) {
      for (const scheme of SCHEMES) {
        list.appendChild(buildSchemeCard(scheme));
      }
    }
  }

  /* --------------------------------------------------------------- */
  /* Read tokens from the cascade                                    */
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
  /* Populate scheme <select> options (DOM API only)                 */
  /* --------------------------------------------------------------- */

  function populateSchemeSelects() {
    const selects = document.querySelectorAll(
      '.dp-scheme-card select[data-scheme]'
    );

    for (const select of selects) {
      // Clear placeholder + any accumulated options so re-running this is
      // idempotent (e.g. during ramp regeneration).
      while (select.firstChild) {
        select.removeChild(select.firstChild);
      }

      const blank = document.createElement('option');
      blank.value = '';
      blank.textContent = '—';
      select.appendChild(blank);

      for (const family of FAMILIES) {
        const label = FAMILY_LABEL[family];
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

      // Options are live; drop the aria-busy placeholder hint.
      select.removeAttribute('aria-busy');
    }
  }

  /* --------------------------------------------------------------- */
  /* Hydrate selections from localStorage                            */
  /* --------------------------------------------------------------- */

  function readStoredState(key) {
    let raw;
    try {
      raw = localStorage.getItem(key);
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

  function isValidSchemeValue(value) {
    // Security: reject anything not matching `{family}-{step}` before the
    // value reaches CSSStyleSheet.insertRule. Defense-in-depth against a
    // hostile localStorage write (CWE-95 / CWE-74).
    return typeof value === 'string' && SCHEME_VALUE_RE.test(value);
  }

  function hydrateSchemeSelections() {
    const stored = readStoredState(SCHEMES_STORAGE_KEY);
    for (const scheme of SCHEMES) {
      const schemeState = stored[scheme];
      if (!schemeState || typeof schemeState !== 'object') continue;
      for (const mode of MODES) {
        const modeState = schemeState[mode];
        if (!modeState || typeof modeState !== 'object') continue;
        for (const token of TOKENS) {
          const value = modeState[token];
          if (!isValidSchemeValue(value)) continue;
          const select = document.getElementById(
            `dp-scheme-${scheme}-${mode}-${token}`
          );
          if (!select) continue;
          select.value = value;
          applySchemeMapping(scheme, mode, token, value);
        }
      }
    }
  }

  /* --------------------------------------------------------------- */
  /* Attach change listeners                                         */
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
    // Blank (clear override) is always safe; any other value must pass
    // the same allow-list used during hydration so runtime and storage
    // share one validation gate.
    if (select.value !== '' && !isValidSchemeValue(select.value)) {
      // eslint-disable-next-line no-console
      console.warn(
        `[design-panel-colors] ignoring invalid scheme value "${select.value}"`
      );
      return;
    }
    applySchemeMapping(scheme, mode, token, select.value);
    debouncedSchemeSave();
  }

  /* --------------------------------------------------------------- */
  /* Apply scheme mapping — dual-emit routing                        */
  /* --------------------------------------------------------------- */

  function applySchemeMapping(scheme, mode, token, value) {
    if (typeof window.__dpSchemeUpdate !== 'function') {
      if (!schemeUpdateMissingLogged) {
        // eslint-disable-next-line no-console
        console.warn(
          '[design-panel-colors] window.__dpSchemeUpdate is unavailable; ' +
            'runtime scheme overrides cannot be written.'
        );
        schemeUpdateMissingLogged = true;
      }
      return;
    }

    const prop = `--color-${token}`;
    const cssValue = value ? `var(--color-${value})` : 'initial';

    if (scheme === 'default') {
      const selector = mode === 'dark' ? '.dark-mode' : ':root';
      window.__dpSchemeUpdate(selector, prop, cssValue, 'utilities');
    } else {
      const selector =
        mode === 'dark'
          ? `.scheme-${scheme}.dark-mode`
          : `.scheme-${scheme}`;
      window.__dpSchemeUpdate(selector, prop, cssValue, 'tokens');
    }
  }

  /* --------------------------------------------------------------- */
  /* Debounced localStorage save (factory)                           */
  /* --------------------------------------------------------------- */

  function makeDebouncedSaver(key, serialize) {
    let timer = null;
    return function save() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        try {
          localStorage.setItem(key, JSON.stringify(serialize()));
        } catch {
          // Quota exceeded / disabled storage — silently skip.
        }
      }, SAVE_DEBOUNCE_MS);
    };
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

  const debouncedSchemeSave = makeDebouncedSaver(
    SCHEMES_STORAGE_KEY,
    serializeSchemes
  );

  /* --------------------------------------------------------------- */
  /* Ramp row disclosure toggles                                     */
  /* --------------------------------------------------------------- */

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
  /* Live ramp regeneration                                          */
  /* --------------------------------------------------------------- */

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

  function loadDefaultRampSettings() {
    const computed = getComputedStyle(document.documentElement);
    const defaults = {};
    for (const family of FAMILIES) {
      const raw = computed.getPropertyValue(`--color-${family}-500`).trim();
      const fallback = ANCHOR_FALLBACKS[family] || '#808080';
      defaults[family] = {
        anchorHex: (raw || fallback).toLowerCase(),
        anchorStep: 500,
        chroma: 80,
        isNeutral: false
      };
    }
    return defaults;
  }

  function readStoredRampOverrides() {
    return readStoredState(RAMP_STORAGE_KEY);
  }

  // Validate one ramp-family record loaded from localStorage. Returns a
  // sanitized partial override object; unknown fields are dropped. Closes
  // the attack surface where a crafted localStorage write could inject
  // non-hex strings into the ramp generator.
  const HEX_RE = /^#[0-9a-f]{6}$/;
  const VALID_STEPS_SET = new Set(STEPS.map((s) => Number(s)));

  function sanitizeFamilyOverride(raw) {
    if (!raw || typeof raw !== 'object') return {};
    const out = {};
    if (typeof raw.anchorHex === 'string') {
      const lower = raw.anchorHex.toLowerCase();
      if (HEX_RE.test(lower)) out.anchorHex = lower;
    }
    if (Number.isFinite(raw.anchorStep) && VALID_STEPS_SET.has(raw.anchorStep)) {
      out.anchorStep = raw.anchorStep;
    }
    if (Number.isFinite(raw.chroma) && raw.chroma >= 0 && raw.chroma <= 100) {
      out.chroma = raw.chroma;
    }
    if (typeof raw.isNeutral === 'boolean') out.isNeutral = raw.isNeutral;
    if (Number.isFinite(raw.neutralChroma) && raw.neutralChroma >= 0 && raw.neutralChroma <= 0.5) {
      out.neutralChroma = raw.neutralChroma;
    }
    if (Number.isFinite(raw.neutralHue) && raw.neutralHue >= 0 && raw.neutralHue < 360) {
      out.neutralHue = raw.neutralHue;
    }
    return out;
  }

  function loadRampSettings() {
    const defaults = loadDefaultRampSettings();
    const stored = readStoredRampOverrides();
    const merged = {};
    for (const family of FAMILIES) {
      merged[family] = {
        ...defaults[family],
        ...sanitizeFamilyOverride(stored[family])
      };
    }
    return merged;
  }

  function hasStoredOverrides() {
    const stored = readStoredRampOverrides();
    return Object.keys(stored).length > 0;
  }

  // buildScaledChromaProfile shadows runtime.scaleChromaProfile if available,
  // keeping backwards compatibility if main.js is loaded without ramp.js.
  function buildScaledChromaProfile(runtime, chromaPct) {
    if (typeof runtime.scaleChromaProfile === 'function') {
      return runtime.scaleChromaProfile(
        runtime.DEFAULT_CHROMA_PROFILE,
        chromaPct
      );
    }
    const scale = Math.max(0, Math.min(100, chromaPct)) / 100;
    const baseline = runtime.DEFAULT_CHROMA_PROFILE || {};
    const profile = {};
    for (const step of STEPS) {
      const numericStep = Number(step);
      const base = baseline[numericStep] ?? baseline[step] ?? 0.5;
      profile[numericStep] = base * scale;
    }
    return profile;
  }

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

  function setChromaAriaValuetext(input, pct) {
    input.setAttribute('aria-valuetext', `Chroma ${pct} percent`);
  }

  function attachRampListeners(settings) {
    const debouncedSave = makeDebouncedSaver(
      RAMP_STORAGE_KEY,
      () => settings
    );

    for (const family of FAMILIES) {
      const anchor = document.getElementById(`dp-anchor-${family}`);
      const step = document.getElementById(`dp-step-${family}`);
      const chroma = document.getElementById(`dp-chroma-${family}`);

      // Hydrate controls from state (so restored localStorage values show up)
      // AND set aria-valuetext from the hydrated value so the first SR read
      // is accurate even if the user never moves the slider.
      if (anchor && settings[family].anchorHex) {
        anchor.value = settings[family].anchorHex;
      }
      if (step) {
        step.value = String(settings[family].anchorStep);
      }
      if (chroma) {
        chroma.value = String(settings[family].chroma);
        setChromaAriaValuetext(chroma, settings[family].chroma);
      }

      if (anchor) {
        anchor.addEventListener('input', () => {
          settings[family].anchorHex = (anchor.value || '').toLowerCase();
          regenerateFamily(family, settings);
          debouncedSave();
        });
      }
      if (step) {
        step.addEventListener('change', () => {
          const parsed = parseInt(step.value, 10);
          if (Number.isFinite(parsed)) {
            settings[family].anchorStep = parsed;
            regenerateFamily(family, settings);
            debouncedSave();
          }
        });
      }
      if (chroma) {
        chroma.addEventListener('input', () => {
          const parsed = parseInt(chroma.value, 10);
          if (Number.isFinite(parsed)) {
            settings[family].chroma = parsed;
            setChromaAriaValuetext(chroma, parsed);
            regenerateFamily(family, settings);
            debouncedSave();
          }
        });
      }
    }
  }

  /* --------------------------------------------------------------- */
  /* Bootstrap                                                       */
  /* --------------------------------------------------------------- */

  const DOM_READY_TIMEOUT_MS = 5000;

  function mountPointsPresent() {
    return (
      document.querySelector('[data-dp-ramp-matrix]') ||
      document.querySelector('[data-dp-scheme-list]')
    );
  }

  function waitForMountPoints() {
    if (mountPointsPresent()) return Promise.resolve(true);
    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        if (mountPointsPresent()) {
          cleanup();
          resolve(true);
        }
      });
      const timeoutId = setTimeout(() => {
        cleanup();
        // Not an error; a page may legitimately omit the design panel.
        resolve(false);
      }, DOM_READY_TIMEOUT_MS);
      function cleanup() {
        observer.disconnect();
        clearTimeout(timeoutId);
      }
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  function main() {
    // Mount points may not exist yet when the design panel loads via
    // <html-include> (async fetch). Wait for them to appear, or give up
    // silently if the page doesn't include the panel at all.
    waitForMountPoints().then((ready) => {
      if (!ready) return;
      initOnce();
    });
  }

  function initOnce() {
    if (initOnce.done) return;
    initOnce.done = true;

    buildAll();

    const ramps = readRampsFromTokens();
    paintSwatches(ramps);
    populateSchemeSelects();
    hydrateSchemeSelections();
    attachSchemeListeners();
    attachRampRowToggles();

    // Live regeneration. Order matters -- reapply stored overrides first
    // so subsequent user input writes on top of the restored state.
    const rampSettings = loadRampSettings();
    if (hasStoredOverrides()) {
      regenerateAllFamilies(rampSettings);
    }
    attachRampListeners(rampSettings);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main, { once: true });
  } else {
    main();
  }
})();
