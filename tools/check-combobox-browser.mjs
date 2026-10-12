import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Uses a host-supplied Playwright installation; no browser download or server takeover.
const playwright = await import(process.env.LW_PLAYWRIGHT_MODULE || 'playwright');
const engine = process.env.LW_COMBOBOX_ENGINE || 'chromium';
const target = process.env.LW_COMBOBOX_URL || 'http://localhost:3006';
const evidence = resolve(process.env.LW_COMBOBOX_EVIDENCE || 'plans/combobox-18/browser');
await mkdir(evidence, { recursive: true });
const browser = await playwright[engine].launch(engine === 'chromium' ? { channel: 'chrome', headless: true } : { headless: true });
const results = [], errors = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
const page = await context.newPage();
page.setDefaultTimeout(6000);
page.on('pageerror', error => errors.push(error.message));
const local = () => page.locator('#local-choice input');
const remote = () => page.locator('#remote-choice input');
async function load(route = '/reference/forms/combobox.html') {
  await page.goto(target + route);
  await page.locator('[role=combobox]').first().waitFor();
}
async function check(name, action) {
  try { await load(); const detail = await action(); results.push({ name, passed: true, detail }); }
  catch (error) {
    results.push({ name, passed: false, error: error.message });
    await page.screenshot({ path: resolve(evidence, `failure-${results.length}.png`) }).catch(() => {});
  }
  console.log(`${results.at(-1).passed ? 'PASS' : 'FAIL'} ${name}${results.at(-1).error ? ': ' + results.at(-1).error : ''}`);
}
try {
  await check('F1 query/value separation and two native successful controls', async () => {
    await local().fill('sao');
    assert.equal(await local().inputValue(), 'sao');
    assert.deepEqual(await page.locator('#local-choice [role=option]').allTextContents(), ['America/Sao Paulo']);
    assert.deepEqual(await page.evaluate(() => [...new FormData(document.querySelector('#choice-form'))]), [['interface_timezone', ''], ['second_timezone', '']]);
    await local().press('ArrowDown'); await local().press('Enter');
    assert.equal(await page.locator('#local-zone').inputValue(), 'America/Sao_Paulo');
    assert.equal(await page.locator('#remote-zone').inputValue(), '');
    await page.locator('#choice-form button[type=submit]').click();
    await page.waitForURL(/interface_timezone=America/);
    assert.equal(new URL(page.url()).searchParams.get('interface_timezone'), 'America/Sao_Paulo');
    assert.equal(new URL(page.url()).searchParams.get('second_timezone'), '');
    assert.equal(new URL(page.url()).searchParams.size, 2);
  });
  await check('F2 native required blocking, enhanced focus and explicit commitment', async () => {
    await page.locator('#required-form button[type=submit]').click();
    assert.equal(new URL(page.url()).search, '');
    assert.equal(await page.locator('#required-zone').evaluate(select => select.validity.valueMissing), true);
    assert.equal(await page.locator('#required-choice input').evaluate(input => input === document.activeElement), true);
    assert.equal(await page.locator('#required-choice').evaluate(root => {
      const status = root.querySelector('[role=status]'), list = root.querySelector('[role=listbox]');
      return !!status.textContent && status.classList.contains('error') && status.getBoundingClientRect().bottom <= list.getBoundingClientRect().top;
    }), true);
    await page.locator('#required-choice input').fill('Makassar');
    await page.locator('#required-choice input').press('ArrowDown'); await page.locator('#required-choice input').press('Enter');
    assert.equal(await page.locator('#required-zone').evaluate(select => select.checkValidity()), true);
    await page.locator('#required-form button[type=submit]').click(); await page.waitForURL(/required_timezone=Asia/);
  });
  await check('F3 disabled controls, fieldsets and first-legend exception', async () => {
    const proof = await page.evaluate(async () => {
      const { createCombobox } = await import('/dist/combobox.js');
      const form = document.createElement('form'); form.id = 'disabled-test';
      form.innerHTML = '<fieldset disabled><legend><div data-combobox><label for="legend-zone">Legend choice</label><select id="legend-zone" name="legend" required><option value="UTC">UTC</option></select></div></legend><fieldset><div data-combobox><label for="nested-zone">Nested choice</label><select id="nested-zone" name="nested"><option value="UTC">UTC</option></select></div></fieldset></fieldset>';
      document.body.append(form);
      const controllers = [...form.querySelectorAll('[data-combobox]')].map(root => createCombobox({ root }));
      await new Promise(resolve => setTimeout(resolve, 0));
      const before = { submitted: [...new FormData(form)], disabled: [...form.querySelectorAll('input')].map(input => input.disabled) };
      form.querySelector('fieldset').disabled = false;
      await new Promise(resolve => setTimeout(resolve, 0));
      const after = { submitted: [...new FormData(form)], disabled: [...form.querySelectorAll('input')].map(input => input.disabled) };
      controllers.forEach(control => control.dispose()); form.remove(); return { before, after };
    });
    assert.deepEqual(proof.before, { submitted: [['legend', 'UTC']], disabled: [false, true] });
    assert.deepEqual(proof.after, { submitted: [['legend', 'UTC'], ['nested', 'UTC']], disabled: [false, false] });
    await page.locator('#local-zone').evaluate(select => { select.disabled = true; });
    await page.waitForFunction(() => document.querySelector('#local-choice input').disabled);
    assert.deepEqual(await page.evaluate(() => [...new FormData(document.querySelector('#choice-form'))]), [['second_timezone', '']]);
    return proof;
  });
  await check('F4 reset default, cancellation and external form association', async () => {
    await local().fill('Makassar'); await local().press('ArrowDown'); await local().press('Enter');
    await page.evaluate(() => document.querySelector('#choice-form').addEventListener('reset', event => event.preventDefault(), { once: true }));
    await page.locator('#choice-form button[type=reset]').click();
    assert.equal(await page.locator('#local-zone').inputValue(), 'Asia/Makassar');
    await page.locator('#choice-form button[type=reset]').click();
    await page.waitForFunction(() => document.querySelector('#local-choice input').value === 'Use organization default (UTC)');
    assert.equal(await page.locator('#local-zone').inputValue(), '');
    assert.equal(await local().inputValue(), 'Use organization default (UTC)');
    assert.equal(await remote().inputValue(), 'Use organization default (UTC)');
  });
  await check('K1 labels, keyboard highlighting, Escape and ordinary text editing', async () => {
    await page.locator('label[for]').filter({ hasText: 'Timezone override' }).click();
    assert.equal(await local().evaluate(input => input === document.activeElement), true);
    await local().fill('Paris'); await local().press('ArrowDown');
    assert.equal(await page.locator('#local-zone').inputValue(), '');
    const active = await local().getAttribute('aria-activedescendant'); assert.ok(active);
    assert.equal(await page.locator(`[id="${active}"]`).getAttribute('role'), 'option');
    await local().press('Escape'); assert.equal(await local().inputValue(), 'Use organization default (UTC)');
    assert.equal(await local().getAttribute('aria-expanded'), 'false');
    await local().fill('Paris'); await local().press('ArrowLeft'); assert.equal(await local().evaluate(input => input.selectionStart), 4);
    await local().press('Tab'); assert.equal(await local().evaluate(input => input === document.activeElement), false);
  });
  await check('R1 debounce, minimum, delayed/out-of-order, empty and failed results', async () => {
    await page.evaluate(() => { window.choiceRequests = []; document.querySelector('#remote-choice').addEventListener('combobox-query', event => window.choiceRequests.push(event.detail)); });
    await remote().fill('p'); await page.waitForTimeout(300); assert.equal(await page.evaluate(() => window.choiceRequests.length), 0);
    await remote().fill('pa'); await page.waitForFunction(() => window.choiceRequests.length === 1);
    await remote().fill('par');
    const staleAccepted = await page.evaluate(async () => {
      const detail = window.choiceRequests[0]; const root = document.querySelector('#remote-choice');
      root.dispatchEvent(new CustomEvent('combobox-results', { detail: { ...detail, items: [{ value: 'old', label: 'Stale marker' }] } }));
      return root.textContent.includes('Stale marker');
    });
    assert.equal(staleAccepted, false);
    await page.waitForFunction(() => document.querySelector('#remote-choice [role=option]')?.textContent === 'Europe/Paris');
    await page.waitForTimeout(800); assert.deepEqual(await page.locator('#remote-choice [role=option]').allTextContents(), ['Europe/Paris']);
    await remote().fill('fail'); await page.waitForFunction(() => document.querySelector('#remote-choice [role=status]').textContent.includes('Search failed'));
    await remote().fill('zz'); await page.waitForFunction(() => document.querySelector('#remote-choice [role=status]').textContent === 'No results.');
  });
  await check('R2 retained remote label/value outside window and app-owned saved-value rejection', async () => {
    await remote().fill('Makassar'); await page.waitForFunction(() => document.querySelector('#remote-choice [role=option]'));
    await remote().press('ArrowDown'); await remote().press('Enter');
    await remote().fill('Paris'); await page.waitForFunction(() => document.querySelector('#remote-choice [role=option]'));
    await remote().press('Escape'); assert.equal(await remote().inputValue(), 'Asia/Makassar');
    assert.equal(await page.locator('#remote-zone').inputValue(), 'Asia/Makassar');
    await page.locator('details summary').click(); await page.locator('[data-demo=reject]').click();
    assert.equal(await page.locator('#local-zone').evaluate(select => select.validity.customError), true);
    await page.locator('#choice-form button[type=submit]').click(); assert.equal(new URL(page.url()).search, '');
    assert.equal(await local().getAttribute('aria-invalid'), 'true');
    await page.locator('[data-demo=clear-error]').click(); assert.equal(await page.locator('#local-zone').evaluate(select => select.checkValidity()), true);
  });
  await check('L1 updates while typing, unrelated patches and two-instance isolation', async () => {
    await local().fill('sao'); await local().evaluate(input => input.setSelectionRange(1, 2));
    await page.evaluate(() => { document.querySelector('#local-zone').add(new Option('São Tomé', 'Africa/Sao_Tome')); document.body.append(document.createElement('p')); });
    await page.waitForFunction(() => document.querySelectorAll('#local-choice [role=option]').length === 2);
    assert.equal(await local().inputValue(), 'sao'); assert.deepEqual(await local().evaluate(input => [input.selectionStart, input.selectionEnd]), [1, 2]);
    assert.equal(await local().evaluate(input => input === document.activeElement), true);
    assert.equal(await page.locator('[role=combobox]').count(), 3);
    await page.evaluate(() => { const select = document.querySelector('#local-zone'); select.replaceWith(select.cloneNode(true)); });
    await page.waitForTimeout(30); assert.equal(await local().inputValue(), 'sao');
    assert.equal(await page.locator('[role=combobox]').count(), 3);
    await local().press('Escape');
    await page.locator('#local-zone').evaluate(select => { select.options[0].label = 'Updated organization default'; });
    await page.waitForFunction(() => document.querySelector('#local-choice input').value === 'Updated organization default');
  });
  await check('L2 disposal/reinsertion, malformed replacement and late replies', async () => {
    const proof = await page.evaluate(async () => {
      const { createCombobox } = await import('/dist/combobox.js'); const root = document.createElement('div'); root.dataset.combobox = '';
      root.innerHTML = '<label for="lifecycle-zone">Lifecycle</label><select id="lifecycle-zone" name="life"><option value="UTC">UTC</option></select>'; document.body.append(root);
      const old = createCombobox({ root, mode: 'remote', debounce: 0 }); const input = root.querySelector('input');
      input.value = 'Par'; input.dispatchEvent(new Event('input')); const detail = old.state.request;
      root.remove(); await new Promise(resolve => setTimeout(resolve, 0));
      const disposed = old.state.phase; document.body.append(root); const next = createCombobox({ root });
      const late = old.applyResults({ ...detail, items: [{ value: 'bad', label: 'Late' }] });
      root.querySelector('select').multiple = true;
      let invalidReplacement = ''; try { next.refresh(); } catch (error) { invalidReplacement = error.message; }
      return { disposed, late, invalidReplacement };
    });
    assert.equal(proof.disposed, 'disposed'); assert.equal(proof.late, false); assert.ok(proof.invalidReplacement);
    // Invalid replacement must restore fallback, not strand a hidden select.
    assert.equal(await page.locator('#lifecycle-zone').isVisible(), true);
    assert.equal(await page.locator('#lifecycle-zone').evaluate(select => select.multiple), true);
    return proof;
  });
  await check('I1 simulated composition emits final query once and keeps native value', async () => {
    await remote().evaluate(input => {
      window.imeQueries = []; input.closest('[data-combobox]').addEventListener('combobox-query', event => window.imeQueries.push(event.detail));
      input.focus(); input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      input.value = '東'; input.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', isComposing: true, keyCode: 229 }));
    });
    await page.waitForTimeout(300); assert.equal(await page.evaluate(() => window.imeQueries.length), 0);
    await remote().evaluate(input => { input.value = '東京'; input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })); input.dispatchEvent(new InputEvent('input', { bubbles: true })); });
    await page.waitForFunction(() => window.imeQueries.length === 1); await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => window.imeQueries.length), 1); assert.equal(await page.locator('#remote-zone').inputValue(), '');
  });
  await check('V1 manual/reference responsive and forced-colors screenshots', async () => {
    const geometry = [];
    for (const route of ['/reference/forms/combobox.html', '/manual/components/combobox.html']) {
      for (const width of [1440, 768, 375, 320]) {
        await page.setViewportSize({ width, height: 900 }); await load(route); await local().fill('America');
        const value = await local().evaluate(input => ({ height: input.getBoundingClientRect().height, overflow: document.documentElement.scrollWidth > innerWidth }));
        assert.equal(value.overflow, false); assert.ok(value.height >= 44); geometry.push({ route, width, ...value });
        await page.locator('#local-choice').evaluate(root => root.scrollIntoView({ block: 'start' }));
        await page.screenshot({ path: resolve(evidence, `${route.includes('manual') ? 'manual' : 'reference'}-${width}.png`) });
      }
    }
    await page.evaluate(() => document.documentElement.style.setProperty('--ui-scale', '2'));
    await local().fill('America');
    assert.equal(await page.locator('#local-choice').evaluate(root => root.querySelector('input').getBoundingClientRect().bottom <= root.querySelector('[role=listbox]').getBoundingClientRect().top), true);
    await page.screenshot({ path: resolve(evidence, 'enlarged-typography.png') });
    await page.evaluate(() => document.documentElement.style.removeProperty('--ui-scale'));
    await page.locator('#local-zone').evaluate(select => { for (const option of select.options) if (option.value) new Intl.DateTimeFormat('en', { timeZone: option.value }); });
    await page.locator('#remote-zone').evaluate(select => { for (const option of select.options) if (option.value) new Intl.DateTimeFormat('en', { timeZone: option.value }); });
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await local().press('ArrowDown'); await page.screenshot({ path: resolve(evidence, 'forced-colors.png') });
    assert.equal(await page.evaluate(() => matchMedia('(forced-colors: active)').matches), true);
    await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' }); return geometry;
  });
  await check('N1 no-JavaScript fallback supports actual native submission', async () => {
    const native = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
    try {
      const fallback = await native.newPage(); await fallback.goto(target + '/reference/forms/combobox.html');
      assert.equal(await fallback.locator('[role=combobox]').count(), 0); assert.equal(await fallback.locator('#local-zone').isVisible(), true);
      await fallback.locator('#local-zone').selectOption('Asia/Makassar');
      await fallback.locator('#choice-form button[type=submit]').click(); await fallback.waitForURL(/interface_timezone=Asia/);
      assert.equal(new URL(fallback.url()).searchParams.get('second_timezone'), '');
      await fallback.screenshot({ path: resolve(evidence, 'native-fallback.png') });
    } finally { await native.close(); }
  });
  await check('N2 missing optional module preserves visible native selects', async () => {
    const fallback = await context.newPage();
    try {
      await fallback.route('**/*combobox-fixture.js*', route => route.abort());
      await fallback.goto(target + '/reference/forms/combobox.html');
      assert.equal(await fallback.locator('[role=combobox]').count(), 0);
      assert.equal(await fallback.locator('#local-zone').isVisible(), true);
      await fallback.locator('#local-zone').selectOption('Europe/Paris');
      assert.equal(await fallback.locator('#local-zone').inputValue(), 'Europe/Paris');
    } finally { await fallback.close(); }
  });
  await check('V2 mobile touch option commitment', async () => {
    const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: engine !== 'firefox', hasTouch: true });
    try {
      const touch = await mobile.newPage(); await touch.goto(target + '/reference/forms/combobox.html');
      await touch.locator('#local-choice input').fill('Paris'); await touch.locator('#local-choice [role=option]').tap();
      assert.equal(await touch.locator('#local-zone').inputValue(), 'Europe/Paris');
    } finally { await mobile.close(); }
  });
  assert.deepEqual(errors, [], 'Uncaught runtime errors');
} finally {
  await context.tracing.stop({ path: resolve(evidence, 'trace.zip') });
  await context.close(); await browser.close();
  await writeFile(resolve(evidence, 'results.json'), JSON.stringify({ engine, target, results, errors,
    limitations: ['Composition was simulated, not physical IME.', 'ARIA/DOM checks are not screen-reader testing.', 'Touch and forced colors were emulated, not physical-device/OS acceptance.'] }, null, 2));
}
if (results.some(result => !result.passed) || errors.length) process.exitCode = 1;
