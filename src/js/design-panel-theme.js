/**
 * Design Panel -- Theme tab controller.
 *
 * Binds the Theme editor slot to the dev-only /__dp/themes endpoint and
 * orchestrates cross-controller state swaps. When the user activates a
 * theme, this file:
 *
 *   1. Calls window.__dpTypographySave.flush() + window.__dpColorsSave.flush()
 *      to synchronously drain any pending debounced writes so in-flight edits
 *      land in the PREVIOUS theme's storage slot rather than leaking into
 *      the new one. Missing globals -> abort (don't lose data silently).
 *   2. Calls window.__dpSchemeReset() to tear down the runtime stylesheet.
 *   3. Overwrites localStorage['design-panel:typography'] and
 *      localStorage['design-panel:schemes'] with the new theme's snapshot.
 *   4. Removes any :root typography custom properties not in the new theme
 *      so switching back to Default truly reverts to cascade tokens.
 *   5. Writes localStorage['design-panel:active-theme-id'].
 *   6. Dispatches a design-panel:reactivate CustomEvent on `document` that
 *      both sibling controllers listen to (they re-hydrate + re-apply).
 *
 * Cross-module communication is strictly via window.__dp* globals and the
 * CustomEvent. No direct imports, no shared modules.
 *
 * Zero imports by policy -- loaded via Vite's bundler from main.js but must
 * not declare its own ES imports. Uses fetch, document, window, localStorage,
 * crypto.randomUUID globals only.
 */

(function () {
  'use strict';

  // Dev-only by design: the /__dp/themes endpoint only exists while vite dev
  // is running (designPanelThemesPlugin has apply: 'serve'). Guarding the
  // entire IIFE body behind import.meta.env.DEV lets Vite's tree-shaker
  // strip the fetch URL literals and controller logic from production
  // bundles so the dev surface never ships. A future Theme tab production
  // path (read-only manifest.json loader) will replace this guard.
  if (typeof import.meta === 'undefined' || !import.meta.env || !import.meta.env.DEV) {
    return;
  }

  const ACTIVE_ID_KEY = 'design-panel:active-theme-id';
  const TYPOGRAPHY_KEY = 'design-panel:typography';
  const SCHEMES_KEY = 'design-panel:schemes';
  // Server regex is ^thm_[a-z0-9]{1,32}$; mirror it here so we never
  // PUT/DELETE an id the server would reject.
  const ID_REGEX = /^thm_[a-z0-9]{1,32}$/;
  const NAME_MAX = 80;
  const DEFAULT_THEME_ID = 'thm_default';
  const DOM_READY_TIMEOUT_MS = 5000;
  const CREATE_COLLISION_RETRIES = 3;

  // Every Typography CSS custom property this panel writes. Listed once so
  // activateTheme can cleanly removeProperty anything not present in the
  // incoming theme -- otherwise switching to Default (empty typography map)
  // would leave the previous theme's overrides stuck on :root.
  const TYPOGRAPHY_PROPS = Object.freeze([
    '--type-scale-ratio',
    '--text-base-min',
    '--text-base-max',
    '--line-height-ratio-body',
    '--line-height-ratio-heading',
    '--font-body',
    '--font-heading',
    '--line-height-min',
    '--line-height-max',
  ]);

  // Seam translation: theme bundle files store typography with CSS-property
  // keys (e.g. "--type-scale-ratio"), but the Typography controller's
  // localStorage['design-panel:typography'] is keyed by input id (e.g.
  // "dp-type-ratio") because dozens of call sites there depend on that
  // shape. This map mirrors the SIGNAL_TO_CSS constant in
  // design-panel-typography.js (kept in sync manually -- both sides are
  // zero-import by policy).
  const TYPOGRAPHY_INPUT_TO_CSS = Object.freeze({
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

  // Invert for theme-bundle -> LS translation.
  const TYPOGRAPHY_CSS_TO_INPUT = Object.freeze(
    Object.fromEntries(Object.entries(TYPOGRAPHY_INPUT_TO_CSS).map(([k, v]) => [v, k]))
  );

  // Theme bundle shape -> Typography localStorage shape. Accepts an object
  // keyed by CSS custom property names; returns an object keyed by input ids.
  // Non-string values and unknown keys are silently dropped so a malformed
  // theme file can't poison localStorage.
  function themeTypographyToStorage(bundleTypography) {
    const out = {};
    for (const [cssProp, value] of Object.entries(bundleTypography || {})) {
      const inputId = TYPOGRAPHY_CSS_TO_INPUT[cssProp];
      if (inputId && typeof value === 'string') {
        out[inputId] = value;
      }
    }
    return out;
  }

  // Typography localStorage shape -> theme bundle shape. Accepts an object
  // keyed by input ids; returns an object keyed by CSS custom property names.
  // Empty strings are dropped (the Typography controller uses '' to mean
  // "cascade default" on font inputs, which shouldn't be PUT as an explicit
  // override) -- the server schema requires non-empty string values.
  function storageToThemeTypography(storageTypography) {
    const out = {};
    for (const [inputId, value] of Object.entries(storageTypography || {})) {
      const cssProp = TYPOGRAPHY_INPUT_TO_CSS[inputId];
      if (cssProp && typeof value === 'string' && value !== '') {
        out[cssProp] = value;
      }
    }
    return out;
  }

  // Cached state.
  let themes = [];
  let activeId = DEFAULT_THEME_ID;

  /* --------------------------------------------------------------- */
  /* Slot readiness                                                  */
  /* --------------------------------------------------------------- */

  function slotPresent() {
    return !!document.querySelector('[slot="editor"][data-tab="theme"] [data-dp-theme-list]');
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

  /* --------------------------------------------------------------- */
  /* Loading + migration                                             */
  /* --------------------------------------------------------------- */

  async function loadThemes() {
    try {
      const res = await fetch('/__dp/themes');
      if (!res.ok) throw new Error('endpoint unavailable');
      const data = await res.json();
      themes = Array.isArray(data.themes) ? data.themes.map(migrate) : [];
      // Ensure a default row always exists in the list (defensive; the
      // endpoint reads from public/themes which should already contain
      // thm_default.json).
      if (!themes.some((t) => t.id === DEFAULT_THEME_ID)) {
        themes.unshift(defaultThemeFallback());
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(
        '[design-panel-theme] /__dp/themes unavailable -- falling back to ' +
          'default-only theme list. Error:',
        e
      );
      themes = [defaultThemeFallback()];
    }
  }

  function defaultThemeFallback() {
    return {
      schemaVersion: 1,
      id: DEFAULT_THEME_ID,
      name: 'Default',
      isDefault: true,
      typography: {},
      schemes: {
        default: { light: {}, dark: {} },
        subtle: { light: {}, dark: {} },
        accent: { light: {}, dark: {} },
      },
    };
  }

  function migrate(theme) {
    // Schema version handler. v1 is passthrough; v2+ migrations land here.
    switch (theme && theme.schemaVersion) {
      case 1:
        return theme;
      default:
        // eslint-disable-next-line no-console
        console.warn(
          '[design-panel-theme] unknown schemaVersion',
          theme && theme.schemaVersion,
          'for theme',
          theme && theme.id
        );
        return theme;
    }
  }

  /* --------------------------------------------------------------- */
  /* Active id helpers                                               */
  /* --------------------------------------------------------------- */

  function readActiveId() {
    try {
      const raw = localStorage.getItem(ACTIVE_ID_KEY);
      if (raw && ID_REGEX.test(raw)) {
        // Only trust the stored id if the theme actually exists in cache;
        // a stale id (theme deleted manually) should fall back to Default.
        if (themes.some((t) => t.id === raw)) return raw;
      }
    } catch {
      // storage unavailable, fall through
    }
    return DEFAULT_THEME_ID;
  }

  function writeActiveId(id) {
    if (!ID_REGEX.test(id)) return;
    try {
      localStorage.setItem(ACTIVE_ID_KEY, id);
    } catch {
      // storage full / disabled -- caller still behaves correctly from the
      // in-memory activeId variable.
    }
  }

  /* --------------------------------------------------------------- */
  /* Announcements (aria-live)                                       */
  /* --------------------------------------------------------------- */

  function announce(message) {
    const output = document.querySelector(
      '[slot="editor"][data-tab="theme"] .dp-theme-status'
    );
    if (!output) return;
    // Clear first, then write on the next animation frame. Identical
    // consecutive messages would otherwise not re-announce because the
    // textContent mutation is a no-op when the string matches.
    output.textContent = '';
    requestAnimationFrame(() => {
      output.textContent = message;
    });
  }

  /* --------------------------------------------------------------- */
  /* Scheme normalisation                                            */
  /* --------------------------------------------------------------- */

  function normalizeSchemes(stored) {
    // Always return a fully-shaped object so PUTs satisfy the server's
    // schema validation even when the user has never touched a particular
    // scheme/mode combo.
    const result = {
      default: { light: {}, dark: {} },
      subtle: { light: {}, dark: {} },
      accent: { light: {}, dark: {} },
    };
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
      return result;
    }
    for (const [scheme, modes] of Object.entries(stored)) {
      if (!result[scheme]) continue;
      if (!modes || typeof modes !== 'object' || Array.isArray(modes)) continue;
      for (const [mode, tokens] of Object.entries(modes)) {
        if (!result[scheme][mode]) continue;
        if (!tokens || typeof tokens !== 'object' || Array.isArray(tokens)) continue;
        // Shallow-copy tokens so later mutations of the input don't bleed.
        const safe = {};
        for (const [k, v] of Object.entries(tokens)) {
          if (typeof v === 'string') safe[k] = v;
        }
        result[scheme][mode] = safe;
      }
    }
    return result;
  }

  /* --------------------------------------------------------------- */
  /* Rendering                                                       */
  /* --------------------------------------------------------------- */

  function renderThemeList() {
    const list = document.querySelector(
      '[slot="editor"][data-tab="theme"] [data-dp-theme-list]'
    );
    if (!list) return;
    // Clear existing rows so re-render is idempotent.
    while (list.firstChild) list.removeChild(list.firstChild);

    // Default first, then alphabetic by name. case-insensitive compare so
    // "apple" and "Apple" sort predictably.
    const sorted = [...themes].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return String(a.name || '').localeCompare(String(b.name || ''), undefined, {
        sensitivity: 'base',
      });
    });

    for (const theme of sorted) {
      list.appendChild(buildThemeRow(theme));
    }
  }

  function buildThemeRow(theme) {
    const row = document.createElement('li');
    row.className = 'dp-theme-row';
    row.setAttribute('data-theme-id', theme.id);
    if (theme.id === activeId) row.setAttribute('aria-current', 'true');

    const head = document.createElement('div');
    head.className = 'dp-theme-row-head';

    const name = document.createElement('span');
    name.className = 'dp-theme-row-name';
    // textContent only -- theme.name is user-supplied (via Create form) so
    // innerHTML + concatenation would open an XSS channel.
    name.textContent = theme.name || '';
    head.appendChild(name);

    const actions = document.createElement('div');
    actions.className = 'dp-theme-row-actions';

    if (theme.isDefault) {
      const badge = document.createElement('span');
      badge.className = 'badge badge--grey';
      badge.textContent = 'Default';
      actions.appendChild(badge);
    }

    if (theme.id !== activeId) {
      const activateBtn = document.createElement('button');
      activateBtn.type = 'button';
      activateBtn.className = 'design-panel-tool design-panel-tool--sm';
      activateBtn.textContent = 'Activate';
      activateBtn.addEventListener('click', () => {
        activateTheme(theme.id);
      });
      actions.appendChild(activateBtn);
    }

    if (!theme.isDefault) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'design-panel-tool design-panel-tool--sm';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
        deleteTheme(theme.id);
      });
      actions.appendChild(deleteBtn);
    }

    head.appendChild(actions);
    row.appendChild(head);
    return row;
  }

  function updateCurrentName() {
    const el = document.querySelector(
      '[slot="editor"][data-tab="theme"] [data-dp-theme-current]'
    );
    if (!el) return;
    const theme = themes.find((t) => t.id === activeId);
    el.textContent = theme ? theme.name : 'Default';

    // Save button is disabled (not hidden) when Default is active -- users
    // see the affordance but can't act on it.
    const save = document.querySelector(
      '[slot="editor"][data-tab="theme"] [data-dp-theme-save]'
    );
    if (save) save.disabled = activeId === DEFAULT_THEME_ID;
  }

  /* --------------------------------------------------------------- */
  /* Activate                                                        */
  /* --------------------------------------------------------------- */

  function activateTheme(id) {
    if (!ID_REGEX.test(id)) {
      // eslint-disable-next-line no-console
      console.warn('[design-panel-theme] invalid id:', id);
      return;
    }
    const theme = themes.find((t) => t.id === id);
    if (!theme) return;

    // STEP 1: Flush pending debounced saves in both sibling controllers.
    // This persists the PREVIOUS theme's in-flight edits before we overwrite
    // storage. CRITICAL: if either sibling's flush global is missing (slot
    // race -- that controller hasn't finished init() yet), abort rather than
    // silently dropping in-flight edits into the wrong theme's slot. This
    // guarantees the flush-ordering invariant.
    if (
      typeof (window.__dpTypographySave && window.__dpTypographySave.flush) !== 'function' ||
      typeof (window.__dpColorsSave && window.__dpColorsSave.flush) !== 'function'
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        '[design-panel-theme] flush global missing -- aborting activate to prevent data loss'
      );
      announce('Activation aborted -- panel still initializing. Try again in a moment.');
      return;
    }
    window.__dpTypographySave.flush();
    window.__dpColorsSave.flush();

    // STEP 2: Tear down the runtime scheme stylesheet. All existing scheme
    // overrides are wiped so the next hydrate step rebuilds from a clean slate.
    if (typeof window.__dpSchemeReset === 'function') {
      window.__dpSchemeReset();
    }

    // STEP 3: Overwrite the "uncommitted edits" layer with the theme's snapshot.
    // Translate typography from CSS-prop keys (bundle shape) to input-id keys
    // (Typography controller's localStorage shape).
    try {
      localStorage.setItem(
        TYPOGRAPHY_KEY,
        JSON.stringify(themeTypographyToStorage(theme.typography))
      );
      localStorage.setItem(
        SCHEMES_KEY,
        JSON.stringify(normalizeSchemes(theme.schemes))
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[design-panel-theme] failed to write theme snapshot to storage', e);
      // Continue -- downstream re-hydrate will still pick up the in-memory
      // root styles we set below, even if storage is disabled.
    }

    // STEP 4: Clear :root custom property overrides for any typography prop
    // NOT in the incoming theme. If activating Default (empty typography),
    // this is how every previous override gets removed.
    clearRootOverridesNotIn(theme.typography || {});

    // STEP 5: Record the active id AFTER storage is consistent.
    activeId = id;
    writeActiveId(id);

    // STEP 6: Tell both sibling controllers to re-hydrate + re-apply.
    // They each ran addEventListener('design-panel:reactivate', applyState)
    // during their own init(). This is the one authoritative dispatch.
    document.dispatchEvent(new CustomEvent('design-panel:reactivate'));

    // STEP 7: Update our own UI -- row aria-current, current name display,
    // Save button disabled state, live-region announcement.
    renderThemeList();
    updateCurrentName();
    announce(`Activated ${theme.name}`);
  }

  function clearRootOverridesNotIn(typographyMap) {
    const root = document.documentElement;
    const keys = typographyMap && typeof typographyMap === 'object' ? typographyMap : {};
    for (const prop of TYPOGRAPHY_PROPS) {
      if (!(prop in keys)) {
        root.style.removeProperty(prop);
      }
    }
  }

  /* --------------------------------------------------------------- */
  /* Save                                                            */
  /* --------------------------------------------------------------- */

  async function saveCurrent() {
    if (activeId === DEFAULT_THEME_ID) {
      announce('Default theme is read-only');
      return;
    }
    // Flush pending debounced writes so we snapshot the freshest state.
    if (window.__dpTypographySave && typeof window.__dpTypographySave.flush === 'function') {
      window.__dpTypographySave.flush();
    }
    if (window.__dpColorsSave && typeof window.__dpColorsSave.flush === 'function') {
      window.__dpColorsSave.flush();
    }

    const theme = themes.find((t) => t.id === activeId);
    if (!theme) {
      announce('Active theme not found');
      return;
    }

    // Typography localStorage uses input-id keys; translate to CSS-prop keys
    // for the bundle (matches the schema + what the server validates).
    const typography = storageToThemeTypography(readJSON(TYPOGRAPHY_KEY));
    const schemes = normalizeSchemes(readJSON(SCHEMES_KEY));

    const bundle = {
      schemaVersion: 1,
      id: theme.id,
      name: theme.name,
      description: typeof theme.description === 'string' ? theme.description : '',
      isDefault: false,
      createdAt: typeof theme.createdAt === 'string' ? theme.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      typography,
      schemes,
    };

    try {
      const res = await fetch(`/__dp/themes/${encodeURIComponent(activeId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bundle),
      });
      const data = await res.json();
      if (!res.ok || !data || !data.ok) {
        throw new Error((data && data.error) || `HTTP ${res.status}`);
      }
      const idx = themes.findIndex((t) => t.id === activeId);
      if (idx >= 0 && data.theme) themes[idx] = data.theme;
      announce(`Saved ${theme.name}`);
    } catch (e) {
      announce(`Save failed: ${(e && e.message) || 'unknown error'}`);
    }
  }

  function readJSON(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  /* --------------------------------------------------------------- */
  /* Create                                                          */
  /* --------------------------------------------------------------- */

  async function createTheme(name) {
    const trimmed = String(name || '').trim();
    if (trimmed.length < 1 || trimmed.length > NAME_MAX) {
      showNameError('Name must be 1-80 characters');
      return;
    }
    const lower = trimmed.toLowerCase();
    if (themes.some((t) => String(t.name || '').toLowerCase() === lower)) {
      showNameError('Name already in use');
      return;
    }

    // Flush first so we snapshot the freshest runtime state into the new
    // bundle -- otherwise a pending debounced save from Typography/Colours
    // could overwrite our PUT moments later, against a snapshot that lacked
    // that edit.
    if (window.__dpTypographySave && typeof window.__dpTypographySave.flush === 'function') {
      window.__dpTypographySave.flush();
    }
    if (window.__dpColorsSave && typeof window.__dpColorsSave.flush === 'function') {
      window.__dpColorsSave.flush();
    }

    // Same translation as saveCurrent: Typography LS is input-id keyed, the
    // server (and any future reader of the bundle JSON) expects CSS-prop keys.
    const typography = storageToThemeTypography(readJSON(TYPOGRAPHY_KEY));
    const schemes = normalizeSchemes(readJSON(SCHEMES_KEY));

    // ID collision retry loop. `crypto.randomUUID().slice` has ~16^8 keyspace
    // per try so a collision is astronomically rare, but when it happens
    // (the server rejects with an existing-file error), retry with a fresh
    // id up to CREATE_COLLISION_RETRIES times.
    let lastError = null;
    for (let attempt = 0; attempt < CREATE_COLLISION_RETRIES; attempt++) {
      const id = 'thm_' + crypto.randomUUID().replace(/-/g, '').slice(0, 8);
      // Guard: if by some chance the generated id matches one already in our
      // cache, skip the PUT and try again.
      if (themes.some((t) => t.id === id)) {
        continue;
      }
      const now = new Date().toISOString();
      const bundle = {
        schemaVersion: 1,
        id,
        name: trimmed,
        description: '',
        isDefault: false,
        createdAt: now,
        updatedAt: now,
        typography,
        schemes,
      };

      try {
        const res = await fetch(`/__dp/themes/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bundle),
        });
        const data = await res.json().catch(() => null);

        if (res.ok && data && data.ok) {
          // Success -- stash, re-render, activate, clear form.
          themes.push(data.theme || bundle);
          renderThemeList();
          clearNameError();
          clearNameInput();
          activateTheme(id);
          return;
        }

        // Server rejected. Decide whether to retry.
        const code = data && data.code;
        const msg = (data && data.error) || `HTTP ${res.status}`;
        if (code === 'BAD_ID' || (res.status === 400 && /exist|collis/i.test(msg))) {
          // Likely id collision or related -- retry with a new uuid.
          lastError = msg;
          continue;
        }
        // Any other error is terminal (validation, server failure, etc.).
        showNameError(`Create failed: ${msg}`);
        return;
      } catch (e) {
        // Network-level error -- retry once with a fresh id in case the
        // failure was transient.
        lastError = (e && e.message) || 'network error';
      }
    }

    showNameError(`Create failed: ${lastError || 'retry limit reached'}`);
  }

  /* --------------------------------------------------------------- */
  /* Delete                                                          */
  /* --------------------------------------------------------------- */

  async function deleteTheme(id) {
    const theme = themes.find((t) => t.id === id);
    if (!theme) return;
    if (theme.isDefault) return; // Default is protected server-side too.

    // Explicit confirm -- matches the Assembly port UX. `confirm` is
    // synchronous and blocks, which is what we want here: the user must
    // decide before we dispatch reactivate or make a network call.
    // eslint-disable-next-line no-alert
    if (!confirm(`Delete theme "${theme.name}"? This cannot be undone.`)) {
      return;
    }

    // If the user is deleting the currently-active theme, fall back to
    // Default BEFORE the DELETE. activateTheme does the full flush + swap +
    // dispatch dance; we explicitly don't dispatch reactivate a second time
    // after the DELETE succeeds so the event fires exactly once total.
    const wasActive = id === activeId;
    if (wasActive) {
      activateTheme(DEFAULT_THEME_ID);
    }

    try {
      const res = await fetch(`/__dp/themes/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.ok) {
        throw new Error((data && data.error) || `HTTP ${res.status}`);
      }
      themes = themes.filter((t) => t.id !== id);
      renderThemeList();
      announce(`Deleted ${theme.name}`);
    } catch (e) {
      announce(`Delete failed: ${(e && e.message) || 'unknown error'}`);
    }
  }

  /* --------------------------------------------------------------- */
  /* Reset                                                           */
  /* --------------------------------------------------------------- */

  function resetToActive() {
    // Re-apply the currently active theme from the cache. Any in-flight
    // debounced writes get flushed first (by activateTheme's STEP 1) so
    // the user's uncommitted edits are discarded AFTER they're persisted
    // to the active theme's storage slot -- then immediately overwritten
    // when activate runs its STEP 3. Net effect: edits discarded visibly.
    activateTheme(activeId);
  }

  /* --------------------------------------------------------------- */
  /* Form error helpers                                              */
  /* --------------------------------------------------------------- */

  function showNameError(msg) {
    const aside = document.getElementById('dp-theme-name-error');
    const input = document.getElementById('dp-theme-name');
    if (aside) {
      aside.textContent = msg;
      aside.classList.remove('visually-hidden');
    }
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', 'dp-theme-name-error');
    }
  }

  function clearNameError() {
    const aside = document.getElementById('dp-theme-name-error');
    const input = document.getElementById('dp-theme-name');
    if (aside) {
      aside.textContent = '';
      aside.classList.add('visually-hidden');
    }
    if (input) {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  }

  function clearNameInput() {
    const input = document.getElementById('dp-theme-name');
    if (input) input.value = '';
  }

  /* --------------------------------------------------------------- */
  /* Event wiring                                                    */
  /* --------------------------------------------------------------- */

  function wireEvents() {
    const save = document.querySelector(
      '[slot="editor"][data-tab="theme"] [data-dp-theme-save]'
    );
    const reset = document.querySelector(
      '[slot="editor"][data-tab="theme"] [data-dp-theme-reset]'
    );
    const createForm = document.querySelector(
      '[slot="editor"][data-tab="theme"] [data-dp-theme-create]'
    );
    const nameInput = document.getElementById('dp-theme-name');

    if (save) {
      save.addEventListener('click', () => {
        saveCurrent();
      });
      save.disabled = activeId === DEFAULT_THEME_ID;
    }
    if (reset) {
      reset.addEventListener('click', () => {
        resetToActive();
      });
    }
    if (createForm) {
      createForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = createForm.querySelector('input[name="name"]');
        createTheme((input && input.value) || '');
      });
    }
    if (nameInput) {
      // Clear the error state the moment the user edits the field so the
      // aria-invalid signal doesn't linger after they start typing.
      nameInput.addEventListener('input', () => {
        if (nameInput.hasAttribute('aria-invalid')) {
          clearNameError();
        }
      });
    }
  }

  /* --------------------------------------------------------------- */
  /* Bootstrap                                                       */
  /* --------------------------------------------------------------- */

  async function init() {
    const mounted = await waitForSlot();
    if (!mounted) return; // Panel not on this page; exit silently.
    await loadThemes();
    activeId = readActiveId();
    renderThemeList();
    updateCurrentName();
    wireEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
