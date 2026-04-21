/**
 * Playwright E2E — design-panel:reactivate fires exactly once per
 * activateTheme() call.
 *
 * Install prerequisites:
 *   npm install -D @playwright/test
 *   npx playwright install chromium
 *
 * Run (assumes dev server is already up on :3000):
 *   npx playwright test tests/design-panel-theme.spec.js
 *
 * Why this test matters: Chunk 3's activateTheme() is the single authoritative
 * reactivate dispatcher. If the event fires 0 times, sibling controllers
 * (Typography, Colours) never re-hydrate and the theme swap is a no-op. If it
 * fires 2+ times, sibling controllers double-apply (latent bug if one sibling
 * writes during another's applyState). Pinning the count to exactly one per
 * activate protects both invariants.
 *
 * Selector notes:
 *  - The tab buttons live in <design-panel>'s shadow DOM. Playwright's
 *    locator chaining (`page.locator('design-panel').locator(...)`) pierces
 *    the boundary automatically -- no `shadowRoot` traversal required.
 *  - Theme row buttons (Activate / Delete) are in the LIGHT DOM slot, so
 *    a plain page-level locator reaches them.
 *  - Waits use aria-current="true" as the DOM settle signal, not fixed
 *    waitForTimeout values, so the test is robust across machines.
 *
 * Flush-ordering caveat: activateTheme aborts if __dpTypographySave.flush or
 * __dpColorsSave.flush are missing. These globals only exist after the
 * Typography and Colours controllers have both booted their async init().
 * The `await page.waitForFunction(...)` below waits for both before issuing
 * any activate click.
 */

import { test, expect } from '@playwright/test';

test('design-panel:reactivate fires exactly once per activateTheme call', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Fresh state for reproducibility.
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // Install the counter BEFORE the first activation so no dispatch is missed.
  // Snapshot the initial count -- a pre-existing stray listener would show
  // up here and let us tell that apart from a controller double-dispatch.
  await page.evaluate(() => {
    window.__reactivateCount = 0;
    document.addEventListener('design-panel:reactivate', () => {
      window.__reactivateCount++;
    });
  });
  const initialCount = await page.evaluate(() => window.__reactivateCount);
  expect(initialCount).toBe(0);

  // Wait until both sibling flush globals exist. activateTheme aborts with a
  // console warning if either is missing, so without this wait the test
  // would silently no-op on a slow boot.
  await page.waitForFunction(() => {
    return (
      window.__dpTypographySave &&
      typeof window.__dpTypographySave.flush === 'function' &&
      window.__dpColorsSave &&
      typeof window.__dpColorsSave.flush === 'function'
    );
  });

  // Open the panel via the T hotkey and switch to the Theme tab.
  // The tab button is inside <design-panel>'s shadow DOM -- Playwright's
  // automatic shadow piercing handles the traversal.
  await page.keyboard.press('KeyT');
  await page
    .locator('design-panel')
    .locator('button[role="tab"][data-tab="theme"]')
    .click();

  // Wait for the Theme slot to render (rows are in the light DOM slot).
  await page
    .locator('[slot="editor"][data-tab="theme"] .dp-theme-row')
    .first()
    .waitFor();

  // Activate Dusk. Wait for the aria-current DOM signal, not a timer.
  const duskRow = page
    .locator('[slot="editor"][data-tab="theme"] .dp-theme-row')
    .filter({ hasText: 'Dusk' })
    .filter({ hasNotText: 'Dusk Copy' });
  await duskRow.locator('button', { hasText: 'Activate' }).click();
  await page
    .locator(
      '[slot="editor"][data-tab="theme"] .dp-theme-row[aria-current="true"]'
    )
    .filter({ hasText: 'Dusk' })
    .waitFor();

  const countAfterDusk = await page.evaluate(() => window.__reactivateCount);
  expect(countAfterDusk).toBe(1);

  // Activate Default. Again wait for aria-current, not a timer.
  const defaultRow = page
    .locator('[slot="editor"][data-tab="theme"] .dp-theme-row')
    .filter({ hasText: 'Default' });
  await defaultRow.locator('button', { hasText: 'Activate' }).click();
  await page
    .locator(
      '[slot="editor"][data-tab="theme"] .dp-theme-row[aria-current="true"]'
    )
    .filter({ hasText: 'Default' })
    .waitFor();

  const countAfterDefault = await page.evaluate(() => window.__reactivateCount);
  expect(countAfterDefault).toBe(2); // exactly one more dispatch, not two
});
