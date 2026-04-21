/*
 * Shared design-panel helpers.
 *
 * Exposes static data + tiny utility factories on window so the three
 * zero-imports panel controllers (design-panel-typography.js,
 * design-panel-colors.js, design-panel-theme.js) don't duplicate them.
 *
 * The zero-imports rule on the controllers is about not importing DOM/network
 * libraries or reactive frameworks - sharing static data and a pure factory
 * through window globals is the same pattern used by design-panel-runtime.js
 * and design-panel-color, and doesn't violate the architectural intent.
 *
 * Registered on window by registerPanelShared() below:
 *   window.__dpTypographySignalMap - frozen map: input id -> CSS custom property
 *   window.__dpDefaultThemeId      - 'thm_default' as a named constant
 *   window.__dpIsDefaultActive     - () -> boolean (reads active-theme-id)
 *   window.__dpMakeDebouncedSaver  - debounced-saver factory
 *
 * main.js imports this file BEFORE any of the three panel controllers so the
 * globals are in place when their IIFEs execute. The individual exports are
 * reachable for unit tests, which import them directly and call makeDebouncedSaver
 * against in-memory storage/timer stubs rather than relying on jsdom.
 */

export const TYPOGRAPHY_SIGNAL_MAP = Object.freeze({
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

export const DEFAULT_THEME_ID = 'thm_default';
export const ACTIVE_THEME_ID_KEY = 'design-panel:active-theme-id';

/*
 * isDefaultActive(storage) returns true when the active theme id in storage
 * is missing, unreadable, or equal to DEFAULT_THEME_ID. Pass any object
 * shaped like Storage (getItem method); defaults to window.localStorage
 * when called without arguments.
 */
export function isDefaultActive(storage) {
  const s = storage || (typeof window !== 'undefined' ? window.localStorage : null);
  if (!s) return true;
  let id = null;
  try {
    id = s.getItem(ACTIVE_THEME_ID_KEY);
  } catch (_err) {
    return true;
  }
  return id === null || id === DEFAULT_THEME_ID;
}

/*
 * makeDebouncedSaver(key, serialize, debounceMs, deps) returns a function
 * that schedules localStorage.setItem(key, JSON.stringify(serialize())) after
 * a fixed debounce window. The returned function carries a synchronous
 * .flush() method that runs any pending save immediately. flush() is a no-op
 * when no save is pending.
 *
 * `deps` is optional and lets callers (tests) inject a storage + timer pair.
 * In browser code it defaults to { storage: localStorage, setTimeout, clearTimeout }.
 */
export function makeDebouncedSaver(key, serialize, debounceMs, deps) {
  const ms = typeof debounceMs === 'number' ? debounceMs : 200;
  const storage = (deps && deps.storage) || (typeof localStorage !== 'undefined' ? localStorage : null);
  const setTimer = (deps && deps.setTimeout) || (typeof setTimeout !== 'undefined' ? setTimeout : null);
  const clearTimer = (deps && deps.clearTimeout) || (typeof clearTimeout !== 'undefined' ? clearTimeout : null);

  let timer = null;
  let pending = false;

  function save() {
    pending = false;
    if (timer) {
      clearTimer(timer);
      timer = null;
    }
    if (!storage) return;
    try {
      storage.setItem(key, JSON.stringify(serialize()));
    } catch (_err) {
      // Quota exceeded or storage disabled. Silent drop.
    }
  }

  function debouncedSave() {
    if (!setTimer) {
      // No timer available (e.g. unit-test harness without setTimeout); save
      // synchronously so the contract stays observable.
      save();
      return;
    }
    if (timer) clearTimer(timer);
    pending = true;
    timer = setTimer(save, ms);
  }

  debouncedSave.flush = function flush() {
    if (pending) save();
  };

  return debouncedSave;
}

/*
 * Registers the shared helpers on the provided global (typically window).
 * Guarded so double-registration is a silent no-op.
 */
export function registerPanelShared(target) {
  if (!target || target.__dpTypographySignalMap) return;
  target.__dpTypographySignalMap = TYPOGRAPHY_SIGNAL_MAP;
  target.__dpDefaultThemeId = DEFAULT_THEME_ID;
  target.__dpIsDefaultActive = function () {
    return isDefaultActive(target.localStorage);
  };
  target.__dpMakeDebouncedSaver = function (key, serialize, debounceMs) {
    return makeDebouncedSaver(key, serialize, debounceMs);
  };
}

if (typeof window !== 'undefined') {
  registerPanelShared(window);
}
