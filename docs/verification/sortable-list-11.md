# Sortable list #11 continuation — 2026-10-09

Source: `feat/interaction-01-11`, starting at `4dcc8e89ac2febd9cf2e15bb82023d2251520946`, based on `c67bacb24ba4c90e3873b5a50ac1b7404f524687`. GitHub issue #11 remains open; PR #24 remains draft and unmerged.

## Serving identity and repair

The maintained Mac target is http://localhost:3000/manual/components/sortable-list.html, served by Vite from `/Users/trav/Websites/design-machines/livewires`. Listener PID 3897 had this exact cwd. The clean checkout initially named `main` contained the feature head; it was switched to `feat/interaction-01-11` without discarding changes or changing the server/port. Remote main still matches the planning base.

The browser loaded current source CSS injected by the optional JS entry and an older static `/dist/sortable-list.css` applying a full border to every item. The row computed 1px left/right borders despite the current source having no such rule. Vite's pre middleware now returns empty, no-store CSS for both main and optional build links in development, including query strings. Source imports retain HMR; production retains the separate generated stylesheet.

Focus is preserved immediately when moving a connected node. Matching results recover the same arrow control after authoritative replacement, including rejection. Guarded rollback moves only the source row, preserving other nodes and focus. The reference responder avoids a second DOM move and transfers focus to the handle when a boundary arrow becomes disabled.

## Verification obtained

- `npm run build`: passed. Existing browser-data age warnings remain.
- `node --test tests/sortable-list-state.test.js`: 6 passed.
- `git diff --check`: passed.
- Default source entries and generated `main.js` / `main.css` are unchanged from the planning base.
- Optional build: JavaScript 13.95 kB raw / 4.23 kB gzip; CSS 11.40 kB raw / 1.99 kB gzip.
- Host CUA Playwright locators/read-only DOM inspection: Chromium at actual 320, 375, 768 and 1440 CSS-pixel viewports: no page overflow, zero vertical row/cell borders, cards have uniform 1px borders.
- In-app browser: real handle drag reordered Red/Blue folders; drop outside list cancelled; Space → ArrowDown → Space reordered and retained focus. Arrow-only click immediately reordered and kept focus while pending, then recovered it after the delayed response.
- Browser DOM fixture initially passed 11 checks in the in-app browser, Safari/WebKit and Firefox/Gecko: one pending request, matching and unrelated results, two lists, guarded rejection, authoritative replacement, focus ownership, removal/reinsertion, nested controls, keyboard staging/cancellation, normal-motion animation and separate handler/frame timing.
- Native Safari and Firefox checks are supplemental engine evidence, not formal Playwright engine coverage. Chromium viewport tests used the supported host Playwright surface.
- The expanded 12-case in-app fixture also passed the actual reference fallback-form boundary-focus regression. A later sample measured 17.30 ms synchronous handler/DOM update and 36.30 ms to the next two frames.
- Native visual inspection: Firefox responsive mode at 320px and Safari at its wide desktop viewport both show horizontal-only table rules, left handles and right move controls.
- Measured synchronous handler + DOM update / next two frames: in-app browser 0.60 / 7.20 ms; Safari 4.00 / 307.00 ms; Firefox 45.00 / 489.00 ms. These single samples include background/throttling effects. Frame time represents a paint opportunity, not direct paint instrumentation. Manual response delay is independently 700 ms.
- Supplemental independent native source review applied repository css-reviewer and doc-sync instructions. Its retained reference-focus and documentation findings were repaired. No Depot files changed; the Live Wires plugin needs a future optional-component documentation sync.

## Remaining gates

REVIEW INCOMPLETE: physical touch, active reduced-motion preference, direct paint instrumentation, and formal Playwright WebKit/Gecko engine coverage were not obtained. The test's reduced-motion case exercises the current preference only; normal-motion success is not proof of reduced-motion emulation. Opus/source-review dispatch was rejected by automatic approval review pending explicit approval to transmit the bounded source packet to Anthropic; no external review was run. This source/browser continuation does not substitute for a completed formal Pipeline/dm-review receipt.

No Go/Templ transport, consumer rollout, merged source, tag, release, or published-runtime proof is claimed. GitHub's existing Cloudflare branch-preview integration is reported separately from local verification.

Grid sorting should be a separate component: two-dimensional hit testing and keyboard navigation need a different interaction contract. Keep this issue focused on one-dimensional list order.
