/*
 * Shared design-panel helpers.
 *
 * This file exposes static data + tiny utility factories on window so the
 * three zero-imports panel controllers (design-panel-typography.js,
 * design-panel-colors.js, design-panel-theme.js) don't have to duplicate
 * them. The zero-imports rule on the controllers is about not importing
 * DOM/network libraries or reactive frameworks -- sharing static data
 * and a pure factory function through window globals is the same pattern
 * used by design-panel-runtime.js and design-panel-color and doesn't
 * violate the architectural intent.
 *
 * What's registered:
 *   window.__dpTypographySignalMap      - frozen map: input id -> CSS custom property
 *   window.__dpDefaultThemeId           - 'thm_default' as a named constant
 *   window.__dpIsDefaultActive          - () -> boolean, reads active-theme-id
 *   window.__dpMakeDebouncedSaver       - factory returning (save, {flush})
 *
 * main.js imports this file BEFORE any of the three panel controllers so the
 * globals are in place by the time the controllers' IIFEs execute.
 */

(function () {
  'use strict';

  if (window.__dpTypographySignalMap) return; // double-registration guard

  var SIGNAL_TO_CSS = Object.freeze({
    'dp-type-ratio': '--type-scale-ratio',
    'dp-text-base-min': '--text-base-min',
    'dp-text-base-max': '--text-base-max',
    'dp-lh-body': '--line-height-ratio-body',
    'dp-lh-heading': '--line-height-ratio-heading',
    'dp-font-body': '--font-body',
    'dp-font-heading': '--font-heading',
    'dp-line-height-min': '--line-height-min',
    'dp-line-height-max': '--line-height-max',
  });

  window.__dpTypographySignalMap = SIGNAL_TO_CSS;
  window.__dpDefaultThemeId = 'thm_default';

  window.__dpIsDefaultActive = function () {
    var id = null;
    try {
      id = localStorage.getItem('design-panel:active-theme-id');
    } catch (_err) {
      // localStorage unavailable (private browsing, quota). Treat as default.
    }
    return id === null || id === window.__dpDefaultThemeId;
  };

  /*
   * makeDebouncedSaver(key, serialize) returns a function that, when
   * called, schedules a localStorage.setItem(key, JSON.stringify(serialize()))
   * after a fixed debounce window. The returned function carries a
   * synchronous .flush() method that runs any pending save immediately
   * and clears the timer. flush() is a no-op when no save is pending.
   *
   * debounceMs defaults to 200. Consumers pass 300 for the Colours
   * scheme save where the user is more likely to be iterating on
   * scheme selects.
   */
  window.__dpMakeDebouncedSaver = function (key, serialize, debounceMs) {
    var ms = typeof debounceMs === 'number' ? debounceMs : 200;
    var timer = null;
    var pending = false;

    function save() {
      pending = false;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      try {
        localStorage.setItem(key, JSON.stringify(serialize()));
      } catch (_err) {
        // Quota exceeded or storage disabled. Silent drop.
      }
    }

    function debouncedSave() {
      if (timer) clearTimeout(timer);
      pending = true;
      timer = setTimeout(save, ms);
    }

    debouncedSave.flush = function () {
      if (pending) save();
    };

    return debouncedSave;
  };
})();
