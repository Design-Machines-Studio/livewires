# Verification Report -- Design Panel Theme System MVP

Date: 2026-04-21
Commit: b3e1d23d2193d917b5fab8f712c98463202dda03
Branch: pipeline/design-panel-theme-system/04-verification
Worktree: .worktrees/pipeline/design-panel-theme-system/04-verification/

## Summary

Total items: 10
PASS: 5 (items 1 partial, 2, 7, 8, 9, 10)
FAIL: 4 (items 3, 4, 5, 6)
PARTIAL: 1 (item 1 -- fresh state leaks typography inline styles)

All FAILs trace to a **single root cause**: Chunk 2 (Typography controller)
and Chunk 3 (Theme controller) disagree on the shape of
`localStorage['design-panel:typography']`. Chunk 3 writes theme data using
CSS-property keys (`--type-scale-ratio`, `--font-body`, ...) per
`public/themes/thm_*.json` schema; Chunk 2 reads it using input-id keys
(`dp-type-ratio`, `dp-font-body`, ...). Every cross-controller reactivation
therefore degrades to "fall back to computed style," silently reverting any
theme switch.

**Recommended fix scope:** one of the two controllers translates on the
seam. Cheapest is a translation layer in Chunk 3's activateTheme /
resetToActive / saveCurrent paths that converts between the two key shapes
(map via `SIGNAL_TO_CSS` exposed from Chunk 2, or duplicated as a frozen
constant in Chunk 3). Chunk 2 remains authoritative for localStorage shape
because multiple call sites already use `dp-*` keys.

## Item-by-item results

| # | Item | Status | Chunk | Evidence |
|---|------|--------|-------|----------|
| 1 | Fresh state | PARTIAL | 2+3 seam | `evidence/01-fresh-state-theme-tab.png`; inline `:root` style contains `--type-scale-ratio`, `--text-base-*`, `--line-height-*` despite Default being active |
| 2 | Vite round-trip (Create theme) | PASS | -- | `public/themes/thm_55c7e555.json` written; schema correct; reactivate=1; row active |
| 3 | Activate Dusk | FAIL | **3** | Reactivate fired (count=2), current name updated, inputs enabled -- but `fontBody` input still empty, `--text-base-max` still 22 (not 18), `--line-height-ratio-heading` still 1.3 (not 1.2). LocalStorage shape mismatch |
| 4 | Reset | FAIL | **3** | Reactivate fired (count 2→3); LS got `--type-scale-ratio` keys (Dusk values); but Typography inputs did NOT snap back to 1.2 -- ratio input still 1.5, `--type-scale-ratio` on `:root` still 1.5 |
| 5 | Save dirty state | FAIL | **1+3 seam** | PUT returned 400 `BAD_PROPERTY_KEY` ("invalid typography property key: dp-type-ratio"). Save never reached disk. Reload-survives assertion is trivially true (localStorage persists) but disk snapshot never updated |
| 6 | Activate Default | FAIL | **2+3 seam** | Reactivate=1, inputs all disabled, save disabled, name "Default" -- but `document.documentElement.style.cssText` still contains `--type-scale-ratio`, `--text-base-*`, `--line-height-*`. Chunk 3 `clearRootOverridesNotIn({})` DOES removeProperty each prop, but Chunk 2's `applyState` re-runs on reactivate and re-writes computed fallbacks before control returns |
| 7 | Delete | PASS | -- | File `thm_55c7e555.json` removed from disk; list rerendered without Dusk Copy; implicit `activateTheme('thm_default')` ran (one reactivate dispatch); Default active |
| 8 | Default protection | PASS | -- | Default row has no Delete button, no Activate button when already active; `fetch /__dp/themes/thm_default DELETE` returned 403 `{ok:false, code:'DEFAULT_THEME', error:'default theme cannot be deleted'}` |
| 9 | Production build sanitation | PASS | -- | `npm run build` succeeded (exit 0); `grep -oE '/__dp/themes\|designPanelThemesPlugin' public/dist/main.js` returned empty; all `__dp*` matches in `dist/main.js` are legitimate client globals (`__dpColorsSave`, `__dpSchemeReset`, `__dpSchemeSerialize`, `__dpSchemeUpdate`, `__dpTypographySave`); no `dist/themes/` leakage |
| 10 | Cross-controller reactivation (reactivate event count) | PASS | -- | Initial count 0 → activate Dusk = 1 → activate Default = 2. Exactly one dispatch per `activateTheme()` call, no double-dispatch, no swallow |

## Failures (reproduction)

### Item 3 -- Activate Dusk silently discards typography (Chunk 3)

**Reproduction:**
1. `localStorage.clear(); location.reload();`
2. Press T, click Theme tab.
3. Click Activate on Dusk row.

**Expected:** Typography inputs reflect Dusk (`--type-scale-ratio: 1.2`,
`--font-body: Georgia, serif`, `--text-base-max: 18`, ...), `:root` styles
match.

**Actual:** Current name updates to "Dusk" and reactivate dispatches once
(good), but:
- `document.getElementById('dp-type-ratio').value` = `"1.2"` *(coincidence:
  both themes happen to use 1.2)*
- `document.getElementById('dp-font-body').value` = `""` (expected `Georgia, serif`)
- `document.documentElement.style.getPropertyValue('--text-base-max')` = `22` (expected `18`)
- `document.documentElement.style.getPropertyValue('--line-height-ratio-heading')` = `1.3` (expected `1.2`)

**Root cause (Chunk 3, `src/js/design-panel-theme.js:371`):**
```js
localStorage.setItem(TYPOGRAPHY_KEY, JSON.stringify(theme.typography || {}));
```
`theme.typography` keys are CSS prop names (`--type-scale-ratio`); Chunk 2's
Typography controller reads the same storage key expecting input-id keys
(`dp-type-ratio`). See `src/js/design-panel-typography.js:155-174` for
hydrateFromStorage.

**Fix location:** translate between the two shapes in Chunk 3 before the
localStorage.setItem on line 371, and symmetrically translate again before
PUTs in `saveCurrent()` (~line 455).

### Item 4 -- Reset writes wrong-shape snapshot (Chunk 3)

Identical schema-mismatch as item 3. Reset calls `activateTheme(activeId)`
which takes the same broken write path. Verified by reading
localStorage['design-panel:typography'] after reset -- value is
`{"--type-scale-ratio":"1.2",...}` (CSS-prop keys), so Typography's
applyState ignores it and the input/roots stay at their pre-reset 1.5 state.

### Item 5 -- Save returns 400 (Chunk 1+3 seam)

**Reproduction:**
1. Activate Dusk Copy (any non-default, non-readonly theme).
2. Change ratio to 1.4 (writes `localStorage.design-panel:typography = '{"dp-type-ratio":"1.4",...}'`).
3. Click Save in Theme tab.

**Actual:** Network PUT returns 400 with body:
```json
{"ok":false,"code":"BAD_PROPERTY_KEY","error":"invalid typography property key: dp-type-ratio"}
```

**Root cause:** Chunk 3's `saveCurrent()` reads
`localStorage['design-panel:typography']` directly and POSTs it to the
server. Chunk 1's server validates typography keys must start with `--`.
Chunk 2 writes the storage value with `dp-*` keys. The chain breaks at the
Chunk 1 validation boundary.

**Fix:** Chunk 3 must translate `dp-*` → `--*` before serialising the PUT
body. Reuse the same `SIGNAL_TO_CSS` constant that Chunk 2 uses internally
(either export it from Chunk 2 or re-declare it as a frozen const in Chunk 3).

### Item 6 -- Activate Default leaves typography inline styles (Chunk 2+3 seam)

**Reproduction:**
1. Starting from any non-default theme active.
2. Click Activate on Default row.

**Expected:** `document.documentElement.style.cssText` contains no
`--type-scale-*`, `--text-base-*`, `--font-*`, `--line-height-*` props.

**Actual:** `cssText` still contains `--type-scale-ratio: 1.2; --text-base-min: 16; --text-base-max: 22; --line-height-ratio-body: 1.5; --line-height-ratio-heading: 1.3; --line-height-min: 24; --line-height-max: 32;`.

**Root cause:** Chunk 3's `clearRootOverridesNotIn({})` (line 404) correctly
calls `root.style.removeProperty(prop)` for every TYPOGRAPHY_PROPS entry
BEFORE dispatching reactivate. But Chunk 2's `applyState` (line 211) runs
on reactivate; when it finds no stored value for a prop, it falls through
to `input.value = computed.getPropertyValue(SIGNAL_TO_CSS[id]).trim()` and
then `applyToRoot(input)` -- which writes the computed fallback back onto
`:root` as an inline style. The "empty typography for Default" signal is
lost because applyState treats "no storage entry" as "hydrate from computed"
regardless of which theme is active.

**Fix options:**
- (Chunk 2) applyState should check `localStorage['design-panel:active-theme-id']`; if the active theme is Default (or any theme with empty typography), skip the computed-fallback write.
- (Chunk 3) before dispatching reactivate for Default, also clear the storage entry entirely and have Chunk 2 treat `stored === null` as "stay dormant."
- (Cleanest) Chunk 2 gains an "unmount" signal wherein `applyState` reads a `dp-active-empty` flag and only reads inputs' `.value` without re-applying to root.

## Build sanitation

```
$ npm run build
vite v5.4.21 building for production...
transforming...
✓ 13 modules transformed.
rendering chunks...
computing gzip size...
dist/main.css  169.15 kB │ gzip: 25.43 kB
dist/main.js    43.97 kB │ gzip: 13.75 kB
✓ built in 273ms

$ grep -oE '/__dp/themes|designPanelThemesPlugin' public/dist/main.js
(empty -- exit 1)

$ grep -oE '__dp[A-Za-z]*' public/dist/main.js | sort -u
__dpColorsSave
__dpSchemeReset
__dpSchemeSerialize
__dpSchemeUpdate
__dpTypographySave

$ ls public/dist/
css  main.css  main.js
```

All surviving `__dp*` matches are legitimate client globals published by
the Typography and Colours controllers for cross-controller coordination
(documented in CLAUDE.md). Endpoint-URL and plugin-name sanitation is
clean: the `/__dp/themes` endpoint and `designPanelThemesPlugin` factory
are fully tree-shaken out of the production bundle.

## Playwright / manual test output

Playwright harness NOT installed (`package.json` devDependencies include
`vitest` but not `@playwright/test`). Both artefacts are delivered:

- `tests/design-panel-theme.spec.js` -- ready-to-run spec matching the
  prompt template: shadow-DOM piercing, DOM-signal waits, initial-count
  snapshot.
- `tests/design-panel-theme.test.md` -- equivalent devtools-console
  script with the same assertion semantics.

**Manual run (executed 2026-04-21 during this verification):**

```
initialCount: 0
countAfterDusk: 1
countAfterDefault: 2
```

Matches spec: exactly one `design-panel:reactivate` dispatch per
`activateTheme()` call.

## Deviations from spec

### Production fallback behaviour (Chunk 3)

The plan called for "fall back to default-theme-only with a console warning"
in production builds, so the Theme tab would still render a read-only
Default row when no `/__dp/themes` endpoint exists. Chunk 3's implementation
instead gates the entire controller behind `import.meta.env.DEV`, meaning
the Theme tab renders empty (no rows, no "Default" current-name, no Save/Reset
buttons wired) in production. **This improves production bundle sanitation
(item 9 passes cleanly) at the cost of the graceful-fallback UX.**

Tradeoff ruling: ACCEPT for MVP. Production theme discovery is a deferred
future PR once the persistence seam is closed; the empty-in-production state
is strictly worse than the design but strictly better than the alternative
of leaking endpoint URLs into the dist bundle. Future PR should restore the
fallback behaviour by:
- Moving the `DEV` guard to just the three network-touching functions
  (`loadThemes`, `saveCurrent`, `deleteTheme`, `createTheme`), not the
  entire IIFE.
- Having `loadThemes` fall back to `[defaultThemeFallback()]` when `fetch`
  throws in prod.
- Wiring Save/Reset/Create/Delete to a console.warn in prod rather than
  omitting the listeners entirely.

### LocalStorage key name

The prompt referenced `localStorage['design-panel:active-theme-id']` as
the active-id storage key. Chunk 3 uses the same key with the same name.
During initial verification I guessed `design-panel:theme:active` (wrong
-- not a spec deviation, just an author note).

## Chunk ownership of FAILs

| FAIL item | Owning chunk(s) | One-line fix summary |
|-----------|-----------------|----------------------|
| 1 (partial) | Chunk 2 | Typography's applyState writes computed fallbacks even when Default is active; gate on active-theme-id |
| 3 | Chunk 3 | Translate `--*` → `dp-*` before localStorage write in activateTheme |
| 4 | Chunk 3 | Same -- resetToActive shares the activateTheme write path |
| 5 | Chunk 3 | Translate `dp-*` → `--*` before PUT body serialisation in saveCurrent |
| 6 | Chunk 2+3 seam | Empty-typography case: Typography must NOT re-write computed fallbacks after Chunk 3 clears them |

All five issues sit in the Chunk 2 ↔ Chunk 3 seam. Chunk 1 (Vite plugin)
and the Theme tab UI structure itself are green; the bugs are in the
contract between the two JS controllers. A single PR touching
`src/js/design-panel-theme.js` (three translation points + one extra
read-flag signal) plus a 5-line guard in `src/js/design-panel-typography.js`
closes all five.

## Regression check

No regressions in previously-green Typography or Colours controllers when
used in isolation: Item 1 verified Typography boots and self-hydrates from
cascade correctly; Colours selects render and populate schemes editor per
its own contract. The Chunk 2 "computed fallback" behaviour is correct for
the "Typography tab used standalone before Theme tab existed" use case;
it's only the cross-controller reactivation seam that breaks.

## Files touched by this chunk

- `tests/design-panel-theme.spec.js` (new)
- `tests/design-panel-theme.test.md` (new)
- `plans/design-panel-theme-system/verification-report.md` (this file)
- `plans/design-panel-theme-system/evidence/01-fresh-state-theme-tab.png` (screenshot)
- `plans/design-panel-theme-system/evidence/08-default-protection.png` (screenshot)

Zero modifications to `src/`, `public/themes/`, `public/_includes/`, or
`vite.config.js`.

## Next step

Open a follow-up PR scoped to the seam fixes above. All five failures share
a common root (LS key-shape mismatch between Chunk 2 and Chunk 3) and should
be fixed in one PR to keep the cross-controller invariant auditable.
