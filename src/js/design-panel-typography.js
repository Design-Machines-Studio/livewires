/**
 * Design Panel — Typography tab controller.
 *
 * Wires the 9 typography form inputs in the slotted [data-tab="typography"]
 * editor to 9 CSS custom properties on :root. State persists to
 * localStorage['design-panel:typography'] with a 200ms debounce. Boots from
 * cascade tokens via getComputedStyle so per-project overrides win when no
 * stored state exists.
 *
 * Zero imports by policy — this file is loaded via Vite's bundler from
 * main.js but must not declare its own ES imports. It uses document.* and
 * window.localStorage globals only. No Datastar, no network, no algorithm.
 *
 * The tab auto-appears in the panel UI because design-panel.js's slot
 * listener un-hides any tab whose [data-tab="X"] editor is projected.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'design-panel:typography';
  const SAVE_DEBOUNCE_MS = 200;
  const PRESET_EPSILON = 1e-3;

  // Single source of truth: input id -> CSS custom property.
  const SIGNAL_TO_CSS = Object.freeze({
    'dp-type-ratio':       '--type-scale-ratio',
    'dp-text-base-min':    '--text-base-min',
    'dp-text-base-max':    '--text-base-max',
    'dp-lh-body':          '--line-height-ratio-body',
    'dp-lh-heading':       '--line-height-ratio-heading',
    'dp-font-body':        '--font-body',
    'dp-font-heading':     '--font-heading',
    'dp-line-height-min':  '--line-height-min',
    'dp-line-height-max':  '--line-height-max',
  });

  // Musical-interval labels for screen-reader announcements on the ratio
  // slider. Keys are exact slider values; absent values get a numeric-only
  // announcement.
  const RATIO_LABELS = Object.freeze({
    '1.125': 'Minor second',
    '1.2':   'Minor third',
    '1.25':  'Major third',
    '1.333': 'Perfect fourth',
    '1.414': 'Augmented fourth',
    '1.5':   'Perfect fifth',
    '1.618': 'Golden ratio',
  });

  function isFontInput(id) {
    return id === 'dp-font-body' || id === 'dp-font-heading';
  }

  function applyToRoot(input) {
    const prop = SIGNAL_TO_CSS[input.id];
    const raw = input.value;
    if (isFontInput(input.id)) {
      // Empty font input -> revert to cascade default (var(--font-sans)).
      // Setting to '' would unstyle the page; removeProperty restores
      // typography-base.css's --font-body / --font-heading defaults.
      const trimmed = raw.trim();
      if (trimmed) {
        document.documentElement.style.setProperty(prop, trimmed);
      } else {
        document.documentElement.style.removeProperty(prop);
      }
    } else {
      document.documentElement.style.setProperty(prop, String(raw));
    }
  }

  function updateAriaValueText(input) {
    if (input.type !== 'range') return;
    if (input.id === 'dp-type-ratio') {
      const label = RATIO_LABELS[input.value] || '';
      input.setAttribute(
        'aria-valuetext',
        label ? `Scale ratio ${input.value}, ${label}` : `Scale ratio ${input.value}`
      );
    } else {
      // Disambiguate body vs heading so rapid-fire announcements don't
      // collide ("Line height 1.5" alone loses the input identity once
      // the <label> is no longer in the AT focus context).
      const which = input.id === 'dp-lh-body' ? 'Body' : 'Heading';
      input.setAttribute('aria-valuetext', `${which} line height ${input.value}`);
    }
  }

  function updatePresetPressed() {
    const ratio = document.getElementById('dp-type-ratio');
    if (!ratio) return;
    const current = Number(ratio.value);
    const buttons = document.querySelectorAll('[data-preset-ratio]');
    for (const btn of buttons) {
      const target = Number(btn.dataset.presetRatio);
      const matches = Math.abs(current - target) < PRESET_EPSILON;
      btn.setAttribute('aria-pressed', matches ? 'true' : 'false');
    }
  }

  function makeDebouncedSaver(key, serialize) {
    let timer = null;
    return function save() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        try {
          localStorage.setItem(key, JSON.stringify(serialize()));
        } catch {
          // Quota / disabled storage -- silently skip.
        }
      }, SAVE_DEBOUNCE_MS);
    };
  }

  function serializeState() {
    const state = {};
    for (const id of Object.keys(SIGNAL_TO_CSS)) {
      const input = document.getElementById(id);
      if (input) state[id] = input.value;
    }
    return state;
  }

  const debouncedSave = makeDebouncedSaver(STORAGE_KEY, serializeState);

  function hydrateFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Validate: must be a plain object with string-keyed string values.
      // Closes the door on a hand-edited storage entry injecting weird types.
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return null;
      }
      const safe = {};
      for (const id of Object.keys(SIGNAL_TO_CSS)) {
        const v = parsed[id];
        if (typeof v === 'string') safe[id] = v;
      }
      return safe;
    } catch {
      return null;
    }
  }

  // The design panel is loaded via <html-include> (async fetch), so the
  // [data-tab="typography"] slot may not exist when DOMContentLoaded fires.
  // Mirrors the waitForMountPoints pattern in design-panel-colors.js.
  const DOM_READY_TIMEOUT_MS = 5000;

  function slotPresent() {
    return !!document.querySelector('[slot="editor"][data-tab="typography"] #dp-type-ratio');
  }

  function waitForSlot() {
    if (slotPresent()) return Promise.resolve(true);
    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        if (slotPresent()) {
          cleanup();
          resolve(true);
        }
      });
      const timeoutId = setTimeout(() => {
        cleanup();
        resolve(false);
      }, DOM_READY_TIMEOUT_MS);
      function cleanup() {
        observer.disconnect();
        clearTimeout(timeoutId);
      }
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // Map each input id to the source file its CSS property lives in. Used
  // by the Copy CSS serializer to group the export into two paste-targets,
  // since the typography tokens are split between scale-auto.css and
  // typography-base.css.
  const SOURCE_FILE = Object.freeze({
    'dp-type-ratio':       'scale',
    'dp-text-base-min':    'scale',
    'dp-text-base-max':    'scale',
    'dp-lh-body':          'scale',
    'dp-lh-heading':       'scale',
    'dp-font-body':        'base',
    'dp-font-heading':     'base',
    'dp-line-height-min':  'base',
    'dp-line-height-max':  'base',
  });

  function serializeTypographyAsCSS() {
    const groups = { scale: [], base: [] };
    for (const id of Object.keys(SIGNAL_TO_CSS)) {
      const input = document.getElementById(id);
      if (!input) continue;
      const value = input.value;
      // Skip empty font inputs -- they mean "use the cascade default" and
      // exporting an empty value would blank --font-body in source.
      if (isFontInput(id) && !value.trim()) continue;
      const prop = SIGNAL_TO_CSS[id];
      const formatted = isFontInput(id) ? value.trim() : String(value);
      groups[SOURCE_FILE[id]].push(`    ${prop}: ${formatted};`);
    }
    const lines = [];
    if (groups.scale.length) {
      lines.push('/* Paste into src/css/1_tokens/typography-scale-auto.css :root */');
      lines.push('@layer tokens {');
      lines.push('  :root {');
      lines.push(...groups.scale);
      lines.push('  }');
      lines.push('}');
    }
    if (groups.base.length) {
      if (lines.length) lines.push('');
      lines.push('/* Paste into src/css/1_tokens/typography-base.css :root */');
      lines.push('@layer tokens {');
      lines.push('  :root {');
      lines.push(...groups.base);
      lines.push('  }');
      lines.push('}');
    }
    return lines.join('\n');
  }

  function ensureCopyStatusRegion(btn) {
    // Live region sibling so button label changes ("Copied", "Failed") are
    // also announced to screen readers. Separate id from the Colours
    // tab's status region so the two buttons don't share announcements.
    let status = document.getElementById('dp-copy-typography-status');
    if (!status) {
      status = document.createElement('span');
      status.id = 'dp-copy-typography-status';
      status.className = 'visually-hidden';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.setAttribute('aria-atomic', 'true');
      btn.insertAdjacentElement('afterend', status);
    }
    return status;
  }

  function attachCopyCSSButton(slot) {
    // Scope to the typography slot so we don't grab the Colours tab's
    // .dp-copy-css button (which is also a sibling inside <design-panel>).
    const btn = slot.querySelector('[data-dp-copy="typography"]');
    if (!btn) return;
    const status = ensureCopyStatusRegion(btn);

    btn.addEventListener('click', () => {
      const css = serializeTypographyAsCSS();
      const original = btn.textContent;
      const restore = (label, delay) => {
        btn.textContent = label;
        status.textContent = label;
        setTimeout(() => {
          btn.textContent = original;
          status.textContent = '';
        }, delay);
      };
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        // eslint-disable-next-line no-console
        console.warn('[design-panel-typography] navigator.clipboard unavailable');
        restore('Unavailable', 2000);
        return;
      }
      navigator.clipboard.writeText(css).then(
        () => restore('Copied', 2000),
        (err) => {
          // eslint-disable-next-line no-console
          console.error('[design-panel-typography] clipboard write failed:', err);
          restore('Failed', 2000);
        }
      );
    });
  }

  let initDone = false;

  function init() {
    if (initDone) return;
    const slot = document.querySelector('[slot="editor"][data-tab="typography"]');
    if (!slot) return; // tab not projected -- nothing to wire
    initDone = true;

    const stored = hydrateFromStorage() || {};
    const computed = getComputedStyle(document.documentElement);

    for (const id of Object.keys(SIGNAL_TO_CSS)) {
      const input = document.getElementById(id);
      if (!input) continue;

      const fromStorage = stored[id];
      if (fromStorage != null) {
        input.value = fromStorage;
        applyToRoot(input);
      } else if (isFontInput(id)) {
        // Font inputs intentionally start empty so the placeholder shows
        // and the cascade default (--font-sans) keeps applying. Hydrating
        // from getComputedStyle would dump the entire resolved stack into
        // the input -- correct value, but ugly and unnecessary.
        input.value = '';
      } else {
        input.value = computed.getPropertyValue(SIGNAL_TO_CSS[id]).trim();
        applyToRoot(input);
      }
      updateAriaValueText(input);

      input.addEventListener('input', () => {
        applyToRoot(input);
        updateAriaValueText(input);
        if (input.id === 'dp-type-ratio') updatePresetPressed();
        debouncedSave();
      });
    }

    const presets = document.querySelectorAll('[data-preset-ratio]');
    for (const btn of presets) {
      btn.addEventListener('click', () => {
        const ratio = document.getElementById('dp-type-ratio');
        if (!ratio) return;
        ratio.value = btn.dataset.presetRatio;
        // Re-dispatch so the existing input handler runs once -- updates
        // CSS, aria-valuetext, aria-pressed, and triggers a save.
        ratio.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }

    updatePresetPressed();
    attachCopyCSSButton(slot);
  }

  function main() {
    waitForSlot().then((ready) => {
      if (ready) init();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main, { once: true });
  } else {
    main();
  }
})();
