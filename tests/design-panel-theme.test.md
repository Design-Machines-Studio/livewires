# Manual reactivate dispatch test

Fallback for environments where `@playwright/test` is not installed.

## Why this exists

`@playwright/test` is NOT currently a devDependency in this project
(`package.json` lists only `autoprefixer`, `vite`, `vite-plugin-static-copy`,
and `vitest`). The full Playwright spec lives at
`tests/design-panel-theme.spec.js` for the day it gets wired up; until then,
this manual script exercises the same invariant.

## Run the test

With the dev server running (`npm run dev`), open http://localhost:3000 in
any Chromium-based browser. Paste the following into DevTools Console:

```js
// 1. Fresh state.
localStorage.clear();
location.reload();
```

After the reload finishes, paste the rest:

```js
// 2. Install the counter BEFORE any activation so no dispatch is missed.
//    Snapshot the initial count -- a stray listener would show up here.
window.__reactivateCount = 0;
document.addEventListener('design-panel:reactivate', () => {
  window.__reactivateCount++;
});
console.assert(window.__reactivateCount === 0, 'initial count must be 0');

// 3. Open the panel and switch to the Theme tab.
document.body.dispatchEvent(
  new KeyboardEvent('keydown', { key: 't', bubbles: true })
);
const dp = document.querySelector('design-panel');
dp.shadowRoot.querySelector('button[role="tab"][data-tab="theme"]').click();

// 4. Activate Dusk. The row and its Activate button live in the light-DOM slot.
const slot = document.querySelector('[slot="editor"][data-tab="theme"]');
const duskRow = [...slot.querySelectorAll('.dp-theme-row')].find(
  (r) => r.getAttribute('data-theme-id') === 'thm_dusk'
);
[...duskRow.querySelectorAll('button')]
  .find((b) => b.textContent.trim() === 'Activate')
  .click();

// Wait a tick for reactivate dispatch (synchronous in current impl, but
// activateTheme calls other side-effects so give the microtask queue a
// turn).
await new Promise((r) => setTimeout(r, 50));
console.log('count after Dusk activate:', window.__reactivateCount); // expect 1
console.assert(window.__reactivateCount === 1, 'expected exactly 1 dispatch');

// 5. Activate Default.
const defaultRow = [...slot.querySelectorAll('.dp-theme-row')].find(
  (r) => r.getAttribute('data-theme-id') === 'thm_default'
);
[...defaultRow.querySelectorAll('button')]
  .find((b) => b.textContent.trim() === 'Activate')
  .click();

await new Promise((r) => setTimeout(r, 50));
console.log('count after Default activate:', window.__reactivateCount); // expect 2
console.assert(window.__reactivateCount === 2, 'expected exactly 2 dispatches');
```

## Expected output

```
count after Dusk activate: 1
count after Default activate: 2
```

Any assertion failure means the cross-controller reactivation is broken --
see `plans/design-panel-theme-system/verification-report.md` for chunk-ownership
guidance.

## Selector rationale

- `button[role="tab"][data-tab="theme"]` lives in `<design-panel>`'s shadow
  DOM. We hop the boundary with `dp.shadowRoot.querySelector(...)`.
- `.dp-theme-row` lives in the **light-DOM slot** (slotted content is
  projected into shadow but stays addressable from the outer document), so
  `document.querySelector('[slot="editor"][data-tab="theme"]')` reaches it
  directly.
- We filter rows by `data-theme-id` rather than text, because a user-created
  theme named "Default" (rejected by Create validation, but still) could
  otherwise collide in the light-DOM text match.

## Live run result from Chunk 04 verification (2026-04-21)

Executed against the worktree dev server. Transcript captured in
`plans/design-panel-theme-system/verification-report.md` under Item 10.
Observed counts matched spec: 1 after first activate, 2 after second.
