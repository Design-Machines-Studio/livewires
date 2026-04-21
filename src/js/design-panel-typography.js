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

  // Single source of truth for input id -> CSS custom property. Owned by
  // design-panel-shared.js so the theme controller can read the same map
  // without duplicating it. Local alias for readability.
  const SIGNAL_TO_CSS = window.__dpTypographySignalMap;

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

  function serializeState() {
    const state = {};
    for (const id of Object.keys(SIGNAL_TO_CSS)) {
      const input = document.getElementById(id);
      if (input) state[id] = input.value;
    }
    return state;
  }

  // Debounced saver lives in design-panel-shared.js; consumed here via a
  // window global so the same factory is shared with design-panel-colors.js
  // and the flush semantics can never drift between the two controllers.
  const debouncedSave = window.__dpMakeDebouncedSaver(
    STORAGE_KEY,
    serializeState,
    SAVE_DEBOUNCE_MS
  );

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

  let initDone = false;

  // Idempotent re-hydrate + re-apply. Called at the end of init() on boot,
  // and again whenever the theme controller (Chunk 3) dispatches
  // design-panel:reactivate after swapping localStorage.
  function applyState() {
    const slot = document.querySelector('[slot="editor"][data-tab="typography"]');
    if (!slot) return; // guard: tab not projected, nothing to re-apply

    const stored = hydrateFromStorage() || {};
    const computed = getComputedStyle(document.documentElement);
    // When the active theme is Default (or no theme set), an absent key in
    // storage means "use the cascade." Falling back to getComputedStyle and
    // then writing that value back to :root would re-pollute the inline
    // style the theme controller just cleared via clearRootOverridesNotIn.
    // So: empty the input and removeProperty instead. For non-default
    // themes, a missing key genuinely means "no override provided" and the
    // legacy computed-style fallback is appropriate.
    const isDefault = window.__dpIsDefaultActive();

    for (const id of Object.keys(SIGNAL_TO_CSS)) {
      const input = document.getElementById(id);
      if (!input) continue;

      const fromStorage = stored[id];
      if (fromStorage != null) {
        input.value = fromStorage;
        applyToRoot(input);
      } else if (isDefault) {
        // No stored value + default theme active -- wipe the inline
        // override and leave the input blank. The cascade (tokens layer)
        // provides the effective value now.
        input.value = '';
        document.documentElement.style.removeProperty(SIGNAL_TO_CSS[id]);
      } else if (isFontInput(id)) {
        // Font inputs intentionally start empty so the placeholder shows
        // and the cascade default (--font-sans) keeps applying. Hydrating
        // from getComputedStyle would dump the entire resolved stack into
        // the input -- correct value, but ugly and unnecessary.
        // CLAUDE.md decision log: skip font hydration when no stored override.
        input.value = '';
        // Also clear any inline override so the cascade default reapplies
        // when switching from a non-default theme back to default.
        applyToRoot(input);
      } else {
        input.value = computed.getPropertyValue(SIGNAL_TO_CSS[id]).trim();
        applyToRoot(input);
      }
      updateAriaValueText(input);
    }

    applyDisabledState();
    updatePresetPressed();
  }

  // Toggle `disabled` on every input/button/select inside the typography
  // editor slot based on active theme. Default theme (or no theme set) means
  // the user is looking at the baseline tokens -- editors are read-only until
  // a thm_ id other than thm_default is active.
  function applyDisabledState() {
    const isDefault = window.__dpIsDefaultActive();
    document
      .querySelectorAll(
        '[slot="editor"][data-tab="typography"] :is(input, button, select)'
      )
      .forEach((el) => {
        el.disabled = isDefault;
      });
  }

  function init() {
    if (initDone) return;
    const slot = document.querySelector('[slot="editor"][data-tab="typography"]');
    if (!slot) return; // tab not projected -- nothing to wire
    initDone = true;

    // Wire listeners FIRST so applyState's input writes don't fire change
    // events on already-attached handlers mid-hydration. The handlers only
    // react to user input events, not synthetic input.value assignments, so
    // order here is safe either way -- but keeping attach-before-apply
    // matches the mental model "build DOM + listeners, then seed state."
    for (const id of Object.keys(SIGNAL_TO_CSS)) {
      const input = document.getElementById(id);
      if (!input) continue;

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

    // Register the reactivate listener and expose the flush hook together so
    // HMR re-execution (module-scoped guards reset while window-level ones
    // survive) cannot create a second listener bound to a stale applyState
    // closure. The window.__dpTypographySave guard gates both.
    if (!window.__dpTypographySave) {
      document.addEventListener('design-panel:reactivate', applyState);
      window.__dpTypographySave = { flush: debouncedSave.flush };
    }

    applyState();
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
