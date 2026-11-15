import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

// Reuses a host-supplied Playwright installation. Static requests are fulfilled
// from the built public directory, so this check needs no development server.
const playwright = await import(process.env.LW_PLAYWRIGHT_MODULE || 'playwright');
const engine = process.env.LW_ICON_PICKER_ENGINE || 'chromium';
const evidence = resolve(process.env.LW_ICON_PICKER_EVIDENCE || '/tmp/livewires-icon-picker-browser', engine);
const publicRoot = resolve('public');
const origin = 'http://livewires.test';
const browser = await playwright[engine].launch({ headless: true });
const results = [];
await mkdir(evidence, { recursive: true });

async function check(name, action, options = {}) {
  const { withoutSearch = false, ...contextOptions } = options;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...contextOptions });
  const page = await context.newPage();
  const errors = [];
  page.setDefaultTimeout(6000);
  page.on('pageerror', error => errors.push(error.message));
  await context.route(`${origin}/**`, async route => {
    const path = resolve(publicRoot, '.' + new URL(route.request().url()).pathname);
    if (!path.startsWith(publicRoot + sep)) return route.fulfill({ status: 404 });
    try {
      let body = await readFile(path);
      if (path.endsWith('/reference/components/icon-picker.html')) {
        // The test owns the documented createIconPicker lifecycle API.
        body = Buffer.from(body.toString().replace('<script type="module" src="/manual/_components/icon-picker-fixture.js"></script>', ''));
      }
      const contentType = {
        '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
        '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2',
      }[extname(path)] || 'application/octet-stream';
      await route.fulfill({ body, contentType });
    } catch {
      await route.fulfill({ status: 404 });
    }
  });
  try {
    await page.goto(`${origin}/reference/components/icon-picker.html`);
    if (options.javaScriptEnabled !== false) {
      await page.evaluate(async withoutSearch => {
        if (withoutSearch) document.querySelectorAll('.icon-picker-search').forEach(search => search.remove());
        const { createIconPicker } = await import('/dist/icon-picker.js');
        window.iconPickerApis = new Map([...document.querySelectorAll('[data-icon-picker]')].map(root => [root.id, createIconPicker({ root })]));
      }, withoutSearch);
    }
    const detail = await action(page);
    assert.deepEqual(errors, []);
    results.push({ name, passed: true, detail });
  } catch (error) {
    results.push({ name, passed: false, error: error.message, pageErrors: errors });
    await page.screenshot({ path: resolve(evidence, `failure-${results.length}.png`) }).catch(() => {});
  } finally {
    await context.close();
  }
  console.log(`${results.at(-1).passed ? 'PASS' : 'FAIL'} ${name}`);
}

const trigger = (page, id = 'ref') => page.locator(`#${id}-picker .icon-picker-trigger`);
const radio = (page, value, id = 'ref') => page.locator(`#${id}-panel .icon-picker-section:not(.icon-picker-recent) input[value="${value}"]`);
const tile = (page, value, id = 'ref') => radio(page, value, id).locator('..');
const value = (page, id = 'ref') => page.locator(`#${id}-picker`).evaluate(root => new FormData(root.closest('form')).get(root.querySelector('input[type=radio]').name));
async function choose(page, name, id = 'ref') {
  await trigger(page, id).click();
  await tile(page, name, id).click();
}

try {
  for (const id of ['ref', 'ghost']) {
    await check(`#43 ${id}: native Remove retains focus during navigation`, async page => {
      await trigger(page, id).click();
      const remove = page.locator(`#${id}-panel .icon-picker-remove input`);
      assert.equal(await remove.locator('..').isVisible(), true);
      await tile(page, 'users-three', id).click();
      // WebKit does not focus radios after a pointer click on macOS. Start
      // keyboard traversal with the checked radio focused, as Tab would.
      await radio(page, 'users-three', id).focus();
      await page.keyboard.press('ArrowLeft');
      assert.equal(await remove.evaluate(input => input === document.activeElement), true);
      assert.equal(await remove.locator('..').isVisible(), true);
      assert.equal(await value(page, id), '');
      await page.keyboard.press('ArrowRight');
      assert.equal(await value(page, id), 'users-three');
      await tile(page, 'star', id).click();
      await radio(page, 'star', id).focus();
      await page.keyboard.press('ArrowRight');
      if (engine === 'webkit') {
        // WebKit stops at the last native radio, including in an unstyled
        // three-radio control. Chromium and Firefox wrap to Remove.
        assert.equal(await radio(page, 'star', id).evaluate(input => input === document.activeElement), true);
      } else {
        assert.equal(await remove.evaluate(input => input === document.activeElement), true);
        assert.equal(await remove.locator('..').isVisible(), true);
        await page.keyboard.press('ArrowLeft');
      }
      assert.equal(await value(page, id), 'star');
      await page.keyboard.press('Escape');
      await page.locator(`#${id}-picker`).locator('..').getByRole('button', { name: 'Submit icon', exact: true }).click();
      await page.waitForURL(url => url.searchParams.get(`${id}_icon`) === 'star');
    }, { javaScriptEnabled: false });
  }

  await check('#44 Remove navigation preserves value and open panel', async page => {
    await choose(page, 'gavel');
    await trigger(page).click();
    await page.evaluate(() => {
      window.changes = 0;
      document.querySelector('#ref-picker').addEventListener('change', () => window.changes++);
    });
    for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']) {
      await page.locator('#ref-search').press('Shift+Tab');
      assert.equal(await page.locator('#ref-panel .icon-picker-remove input').evaluate(input => input === document.activeElement), true);
      await page.keyboard.press(key);
      assert.equal(await value(page), 'gavel');
      assert.equal(await page.locator('#ref-panel').evaluate(panel => panel.matches(':popover-open')), true);
      assert.equal(await page.locator('#ref-search').evaluate(input => input === document.activeElement), true);
    }
    assert.equal(await page.evaluate(() => window.changes), 0);
    await page.locator('#ref-search').press('Shift+Tab');
    await page.keyboard.press(' ');
    assert.equal(await value(page), '');
    assert.equal(await page.locator('#ref-panel').evaluate(panel => panel.matches(':popover-open')), false);
  });

  await check('#46 popup exposes its labelled native group', async page => {
    assert.equal(await trigger(page).getAttribute('aria-haspopup'), null);
    await trigger(page).click();
    await page.waitForFunction(() => document.querySelector('#ref-picker .icon-picker-trigger').getAttribute('aria-expanded') === 'true');
    assert.equal(await trigger(page).getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('#ref-panel').getByRole('group', { name: 'Circle icon', exact: true }).count(), 1);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('#ref-picker .icon-picker-trigger').getAttribute('aria-expanded') === 'false');
  });

  await check('#47 Recent buttons use the real radio and native event counts', async page => {
    await choose(page, 'gavel');
    await choose(page, 'leaf');
    await trigger(page).click();
    const recent = page.locator('#ref-panel .icon-picker-recent');
    assert.equal(await recent.locator('input').count(), 0);
    assert.equal(await recent.getByRole('button', { name: 'Gavel', exact: true }).count(), 1);
    assert.equal(await page.locator('#ref-panel').getByRole('radio', { name: 'Gavel', exact: true }).count(), 1);
    await page.evaluate(() => {
      window.events = { input: 0, change: 0, submit: 0 };
      const form = document.querySelector('#ref-picker').closest('form');
      for (const type of Object.keys(window.events)) form.addEventListener(type, () => window.events[type]++);
    });
    await page.locator('#ref-search').press('ArrowDown');
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    assert.equal(await recent.getByRole('button', { name: 'Gavel', exact: true }).evaluate(button => button === document.activeElement), true);
    assert.equal(await value(page), 'leaf');
    await page.keyboard.press('Enter');
    assert.equal(await value(page), 'gavel');
    assert.deepEqual(await page.evaluate(() => window.events), { input: 1, change: 1, submit: 0 });
    await trigger(page).click();
    await recent.getByRole('button', { name: 'Gavel', exact: true }).click();
    assert.deepEqual(await page.evaluate(() => window.events), { input: 1, change: 1, submit: 0 });
    assert.equal(await trigger(page).getAttribute('aria-label'), 'Change circle icon, Gavel');
  });

  await check('#47 Recent search, reset, empty-value Tab and refresh', async page => {
    await choose(page, 'gavel');
    await choose(page, 'leaf');
    await trigger(page).click();
    await page.locator('#ref-search').fill('judge');
    assert.equal(await page.locator('#ref-panel .icon-picker-recent').isVisible(), false);
    await page.locator('#ref-search').press('Enter');
    assert.equal(await value(page), 'gavel');
    await page.evaluate(() => {
      const form = document.querySelector('#ref-picker').closest('form');
      form.addEventListener('reset', event => event.preventDefault(), { once: true });
      form.reset();
    });
    assert.equal(await value(page), 'gavel');
    await page.evaluate(() => document.querySelector('#ref-picker').closest('form').reset());
    await page.waitForFunction(() => document.querySelector('#ref-picker .icon-picker-trigger').getAttribute('aria-label') === 'Choose circle icon');
    assert.equal(await value(page), '');
    await trigger(page).click();
    await page.locator('#ref-search').press('Tab');
    assert.equal(await radio(page, 'users-three').evaluate(input => input === document.activeElement), true);
    await page.evaluate(() => {
      document.querySelector('#ref-panel .icon-picker-section:not(.icon-picker-recent) input[value=gavel]').closest('label').remove();
      window.iconPickerApis.get('ref-picker').refresh();
    });
    assert.equal(await page.locator('#ref-panel .icon-picker-recent').getByRole('button', { name: 'Gavel', exact: true }).count(), 0);
    assert.equal(await radio(page, 'users-three').evaluate(input => input === document.activeElement), true);
    return await page.locator('#ref-panel').ariaSnapshot();
  });

  await check('R1-1 refresh preserves focused Recent shortcuts or moves to a surviving tile', async page => {
    await choose(page, 'gavel');
    await trigger(page).click();
    await page.locator('#ref-search').press('ArrowDown');
    await page.keyboard.press('Home');
    await page.evaluate(() => window.iconPickerApis.get('ref-picker').refresh());
    const recent = page.locator('#ref-panel .icon-picker-recent button[value="gavel"]');
    assert.equal(await recent.evaluate(button => button === document.activeElement), true);
    await page.evaluate(() => {
      document.querySelector('#ref-panel .icon-picker-section:not(.icon-picker-recent) input[value=gavel]').closest('label').remove();
      window.iconPickerApis.get('ref-picker').refresh();
    });
    assert.equal(await radio(page, 'users-three').evaluate(input => input === document.activeElement), true);
    assert.equal(await page.locator('#ref-panel').evaluate(panel => panel.matches(':popover-open')), true);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('#ref-panel .icon-picker-remove input').evaluate(input => input === document.activeElement), true);
  });

  await check('R1-1 empty subset without search returns focus to the trigger', async page => {
    await choose(page, 'gavel');
    await page.evaluate(() => document.querySelector('#ref-picker').closest('form').reset());
    await page.waitForFunction(() => document.querySelector('#ref-picker .icon-picker-trigger').getAttribute('aria-label') === 'Choose circle icon');
    await trigger(page).click();
    await page.keyboard.press('Home');
    assert.equal(await page.locator('#ref-panel .icon-picker-recent button').first().evaluate(button => button === document.activeElement), true);
    await page.evaluate(() => {
      document.querySelectorAll('#ref-panel .icon-picker-section:not(.icon-picker-recent) .icon-picker-tile').forEach(tile => tile.remove());
      window.iconPickerApis.get('ref-picker').refresh();
    });
    assert.equal(await trigger(page).evaluate(button => button === document.activeElement), true);
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#ref-panel').evaluate(panel => panel.matches(':popover-open')), false);
  }, { withoutSearch: true });

  await check('#44 Remove navigation without search returns to the grid', async page => {
    await choose(page, 'gavel');
    await trigger(page).click();
    for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']) {
      await page.locator('#ref-panel .icon-picker-remove input').focus();
      await page.keyboard.press(key);
      assert.equal(await value(page), 'gavel');
      assert.equal(await radio(page, 'gavel').evaluate(input => input === document.activeElement), true);
    }
  }, { withoutSearch: true });

  for (const [width, colorScheme, id] of [[1280, 'light', 'ref'], [320, 'dark', 'ghost']]) {
    await check(`${id}: responsive Recent keyboard focus`, async page => {
      await choose(page, 'gavel', id);
      await trigger(page, id).click();
      await page.locator(`#${id}-search`).press('ArrowDown');
      await page.keyboard.press('Home');
      const recent = page.locator(`#${id}-panel .icon-picker-recent button`).first();
      const focus = await recent.evaluate(button => ({ active: button === document.activeElement, visible: button.matches(':focus-visible'), outline: getComputedStyle(button).outlineStyle }));
      assert.deepEqual(focus, { active: true, visible: true, outline: 'solid' });
      const shortcutBox = await recent.boundingBox();
      const tileBox = await tile(page, 'gavel', id).boundingBox();
      assert.equal(shortcutBox.width, tileBox.width);
      assert.equal(shortcutBox.height, tileBox.height);
      await page.screenshot({ path: resolve(evidence, `${id}-${width}-${colorScheme}.png`) });
      return focus;
    }, { viewport: { width, height: 900 }, colorScheme });
  }

  if (engine === 'chromium') {
    for (const id of ['ref', 'ghost']) {
      await check(`#45 ${id}: forced colors separate selection and focus`, async page => {
        await choose(page, 'gavel', id);
        await trigger(page, id).click();
        await page.locator(`#${id}-search`).press('ArrowDown');
        await page.keyboard.press('End');
        const selected = await tile(page, 'gavel', id).evaluate(label => {
          const style = getComputedStyle(label);
          return { border: style.borderTopWidth, outline: style.outlineStyle, checked: label.querySelector('input').checked };
        });
        assert.deepEqual(selected, { border: '2px', outline: 'none', checked: true });
        assert.equal(await tile(page, 'leaf', id).evaluate(label => getComputedStyle(label).borderTopWidth), '1px');
        assert.equal(await tile(page, 'star', id).evaluate(label => getComputedStyle(label).outlineStyle), 'solid');
        await page.screenshot({ path: resolve(evidence, `${id}-forced-colors.png`) });
        return selected;
      }, { forcedColors: 'active' });
    }
  }
} finally {
  await browser.close();
  await writeFile(resolve(evidence, 'results.json'), JSON.stringify({ engine, results }, null, 2));
}
if (results.some(result => !result.passed)) process.exitCode = 1;
