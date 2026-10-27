import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Uses a host-supplied Playwright installation and an already running dev server.
// It never starts a server or downloads a browser.
const playwright = await import(process.env.LW_PLAYWRIGHT_MODULE || 'playwright');
const engine = process.env.LW_MENTION_ENGINE || 'chromium';
const target = process.env.LW_MENTION_URL || 'http://localhost:3000';
const evidence = resolve(process.env.LW_MENTION_EVIDENCE || 'plans/mention-suggestions/browser');
const baseRef = process.env.LW_MENTION_BASE_REF || 'origin/main';
const axePath = process.env.LW_AXE_PATH;
await mkdir(evidence, { recursive: true });
const browser = await playwright[engine].launch({ headless: true });
const results = [];
let current; // Most recent page, for failure screenshots.
const manual = '/manual/components/mention-suggestions.html';

async function check(name, action) {
  try { results.push({ name, passed: true, detail: await action() }); }
  catch (error) {
    results.push({ name, passed: false, error: error.message });
    await current?.screenshot({ path: resolve(evidence, `failure-${results.length}.png`) }).catch(() => {});
  }
  const last = results.at(-1);
  console.log(`${last.passed ? 'PASS' : 'FAIL'} ${name}${last.error ? ': ' + last.error : ''}`);
}

async function open(options = {}, route = manual) {
  // Reduced motion by default so captures never catch the opacity fade. H14 checks motion explicitly.
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce', ...options });
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', (error) => page.errors.push(error.message));
  current = page;
  await page.goto(target + route);
  await page.waitForLoadState('networkidle');
  return { context, page };
}

const state = (page, root = '#mention-popup') => page.locator(root).getAttribute('data-state');
const activeId = (page) => page.evaluate(() => document.activeElement?.id);
async function typeMention(page, text, editor = '#mention-editor') {
  await page.locator(editor).click();
  await page.keyboard.type(text);
  await page.waitForFunction((root) => ['ready', 'empty', 'error'].includes(document.querySelector(root).dataset.state), editor === '#mention-editor' ? '#mention-popup' : '#mention-popup-rtl');
}

// Computes WCAG contrast in the page. Canvas normalizes any CSS colour syntax to sRGB.
const CONTRAST = `(() => {
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgb = (c) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3); };
  const lum = (c) => rgb(c).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
  const bgOf = (el) => { for (let n = el; n; n = n.parentElement) { const b = getComputedStyle(n).backgroundColor; if (b && !/rgba\\(0, 0, 0, 0\\)|transparent/.test(b)) return b; } return 'white'; };
  window.__contrast = (el) => { const a = lum(getComputedStyle(el).color), b = lum(bgOf(el)); return +(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2)); };
})()`;

try {
  await check('H1 deterministic contract checks page passes', async () => {
    const { context, page } = await open({}, '/reference/components/mention-suggestions-tests.html');
    await page.click('#run-tests');
    await page.waitForSelector('body[data-tests-complete]', { timeout: 30000 });
    const text = await page.locator('#test-results').innerText();
    await writeFile(resolve(evidence, 'deterministic-checks.txt'), text + '\n');
    assert.equal(await page.locator('body').getAttribute('data-tests-complete'), 'pass', text.split('\n').filter((l) => l.startsWith('FAIL')).join('; '));
    assert.deepEqual(page.errors, []);
    await context.close();
    return text.split('\n').length + ' cases';
  });

  await check('H2 real keyboard: arrows, Enter inserts, editor keeps focus, Enter does not send while open', async () => {
    const { context, page } = await open();
    await typeMention(page, 'Hi @sa');
    const options = page.locator('#mention-popup [role=option]');
    assert.equal(await options.count(), 2);
    const first = await options.nth(0).getAttribute('id');
    assert.equal(await page.locator('#mention-editor').getAttribute('aria-activedescendant'), first);
    await page.keyboard.press('ArrowDown');
    const second = await options.nth(1).getAttribute('id');
    assert.equal(await page.locator('#mention-editor').getAttribute('aria-activedescendant'), second);
    await page.keyboard.press('Enter');
    assert.equal(await state(page), 'closed');
    assert.match(await page.locator('[data-mention-log]').first().innerText(), /^Selected Sam Rivera \(Finance circle\)/);
    assert.equal(await activeId(page), 'mention-editor');
    await page.keyboard.press('Enter');
    assert.match(await page.locator('[data-mention-log]').first().innerText(), /^Sent: Hi @Sam Rivera/);
    await context.close();
  });

  await check('H3 real keyboard: Tab inserts, Escape closes and typing continues', async () => {
    const { context, page } = await open();
    await typeMention(page, '@ad');
    await page.keyboard.press('Tab');
    assert.match(await page.locator('#mention-editor').innerText(), /@Ada Okafor/);
    assert.equal(await activeId(page), 'mention-editor');
    await page.keyboard.type(' and @b');
    await page.waitForFunction(() => document.querySelector('#mention-popup').dataset.state === 'ready');
    await page.keyboard.press('Escape');
    assert.equal(await state(page), 'closed');
    await page.keyboard.type('o');
    await page.waitForTimeout(300);
    assert.equal(await state(page), 'closed');
    assert.equal(await activeId(page), 'mention-editor');
    await context.close();
  });

  await check('H4 mouse click selects without moving focus; hover does not move active', async () => {
    const { context, page } = await open();
    await typeMention(page, '@');
    const before = await page.locator('#mention-editor').getAttribute('aria-activedescendant');
    await page.locator('#mention-popup [role=option]').nth(2).hover();
    assert.equal(await page.locator('#mention-editor').getAttribute('aria-activedescendant'), before);
    await page.screenshot({ path: resolve(evidence, 'hover-vs-active-1280.png') });
    await page.locator('#mention-popup [role=option]').nth(2).click();
    assert.equal(await state(page), 'closed');
    assert.equal(await activeId(page), 'mention-editor');
    assert.match(await page.locator('#mention-editor').innerText(), /@Cy Mbeki/);
    await context.close();
  });

  await check('H5 touch tap selects without moving focus', async () => {
    const { context, page } = await open({ viewport: { width: 375, height: 700 }, hasTouch: true, isMobile: true });
    await page.locator('#mention-editor').tap();
    await page.keyboard.type('@d');
    await page.waitForFunction(() => document.querySelector('#mention-popup').dataset.state === 'ready');
    await page.locator('#mention-popup [role=option]').first().tap();
    assert.equal(await state(page), 'closed');
    assert.equal(await activeId(page), 'mention-editor');
    assert.match(await page.locator('#mention-editor').innerText(), /@Di Ng/);
    await context.close();
  });

  await check('H6 stale rows are busy and the late reply for an older query is dropped', async () => {
    const { context, page } = await open();
    await page.locator('label:has(input[value=slow])').click();
    await page.locator('#mention-editor').click();
    await page.keyboard.type('@s');
    await page.waitForTimeout(1800);
    assert.equal(await state(page), 'ready');
    await page.keyboard.type('a'); // "@sa": slow reply for "s" is already in; now type quickly.
    await page.keyboard.press('Backspace'); // "@s" (1 letter: slow 1600 ms)
    await page.keyboard.type('am'); // "@sam" (fast 500 ms) answers first
    assert.equal(await page.locator('#mention-popup-list').getAttribute('aria-busy'), 'true');
    await page.screenshot({ path: resolve(evidence, 'stale-rows-1280.png') });
    assert.equal(await page.locator('#mention-editor').getAttribute('aria-activedescendant'), null);
    await page.waitForTimeout(2200); // Let every older reply arrive.
    const names = await page.locator('#mention-popup [data-mention-name]').allTextContents();
    assert.deepEqual(names, ['Sam Rivera', 'Sam Rivera']);
    assert.equal(await page.locator('#mention-popup [role=status]').textContent(), '2 people found');
    await context.close();
  });

  await check('H7 status text and visibility for loading, empty and error', async () => {
    const { context, page } = await open();
    await page.locator('label:has(input[value=slow])').click();
    await page.locator('#mention-editor').click();
    await page.keyboard.type('@z');
    await page.waitForFunction(() => document.querySelector('#mention-popup').dataset.state === 'loading');
    assert.equal(await page.locator('#mention-popup [role=status]').textContent(), 'Searching people…');
    await page.screenshot({ path: resolve(evidence, 'loading-1280.png') });
    await page.locator('label:has(input[value=quick])').click();
    await page.locator('#mention-editor').click();
    await page.keyboard.type('z');
    await page.waitForFunction(() => document.querySelector('#mention-popup').dataset.state === 'empty');
    assert.equal(await page.locator('#mention-popup [role=status]').textContent(), 'No matching people');
    await page.screenshot({ path: resolve(evidence, 'empty-1280.png') });
    await page.locator('label:has(input[value=error])').click();
    await page.locator('#mention-editor').click();
    await page.keyboard.type('z');
    await page.waitForFunction(() => document.querySelector('#mention-popup').dataset.state === 'error');
    const error = await page.locator('#mention-popup [role=status]').evaluate(async (el) => {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const probe = document.createElement('span'); probe.style.color = 'var(--color-error)'; el.append(probe);
      const expected = getComputedStyle(probe).color; probe.remove();
      return { text: el.textContent, visible: el.getBoundingClientRect().height > 1, color: getComputedStyle(el).color, expected };
    });
    assert.equal(error.text, 'People could not be loaded. Keep typing to try again.');
    assert.ok(error.visible);
    assert.equal(error.color, error.expected, 'error message not in the error colour');
    await page.screenshot({ path: resolve(evidence, 'error-1280.png') });
    assert.equal(await page.locator('#mention-popup [role=status]').count(), 1);
    await context.close();
  });

  await check('H8 combobox computed styles are unchanged from the base stylesheet', async () => {
    const base = execFileSync('git', ['show', `${baseRef}:public/dist/combobox.css`], { encoding: 'utf8' });
    const report = {};
    for (const forced of ['none', 'active']) {
      const { context, page } = await open({ forcedColors: forced }, '/manual/components/combobox.html');
      const input = page.locator('#local-choice input');
      await input.fill('a');
      await input.press('ArrowDown');
      await page.locator('#local-choice [role=option]').nth(3).hover();
      const snapshot = () => page.evaluate(() => {
        const props = ['color', 'background-color', 'outline-color', 'outline-style', 'outline-width', 'outline-offset', 'padding-top', 'padding-left', 'min-height', 'font-weight', 'cursor', 'overflow-wrap', 'position', 'max-height', 'overflow-y', 'border-top-color', 'border-top-width', 'z-index', 'display', 'forced-color-adjust', 'scroll-behavior', 'grid-template-columns'];
        const nodes = [...document.querySelectorAll('[data-combobox] input, [data-combobox] [role=listbox], [data-combobox] [role=option], [data-combobox] [role=status], [data-combobox] [data-combobox-ui]')];
        return nodes.map((node) => props.map((p) => getComputedStyle(node).getPropertyValue(p)).join('|'));
      });
      const after = await snapshot();
      const swapped = await page.evaluate((css) => {
        const styles = [...document.querySelectorAll('style[data-vite-dev-id*="combobox.css"]')];
        styles.forEach((style) => { style.textContent = css; });
        return styles.length;
      }, base);
      assert.ok(swapped >= 1, 'combobox source stylesheet not found to swap');
      const before = await snapshot();
      assert.equal(after.length, before.length);
      const diffs = after.map((row, i) => row === before[i] ? null : i).filter((i) => i !== null);
      assert.deepEqual(diffs, [], `forced-colors ${forced}: ${diffs.length} elements differ`);
      report[forced] = `${after.length} elements identical`;
      await context.close();
    }
    return report;
  });

  const viewports = [
    ['320', { viewport: { width: 320, height: 640 } }],
    ['375', { viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true }],
    ['768', { viewport: { width: 768, height: 1024 } }],
    ['1280', { viewport: { width: 1280, height: 800 } }],
    ['1280-zoom200', { viewport: { width: 640, height: 400 }, deviceScaleFactor: 2 }]
  ];
  const schemes = [['light', { colorScheme: 'light' }], ['dark', { colorScheme: 'dark' }]];
  for (const [vp, vpOptions] of viewports) {
    for (const [scheme, schemeOptions] of schemes) {
      await check(`H9 ${vp} ${scheme}: long list fits, scrolls inside, no page overflow, readable contrast`, async () => {
        const { context, page } = await open({ ...vpOptions, ...schemeOptions });
        await page.evaluate(CONTRAST);
        await page.locator('#mention-editor').scrollIntoViewIfNeeded();
        await typeMention(page, '@');
        for (let i = 0; i < 12; i++) await page.keyboard.press('ArrowDown');
        const geometry = await page.evaluate(() => {
          const root = document.querySelector('#mention-popup'), list = root.querySelector('[role=listbox]');
          const r = root.getBoundingClientRect(), a = list.querySelector('[data-active]').getBoundingClientRect(), l = list.getBoundingClientRect();
          return {
            inViewport: r.left >= 0 && r.right <= document.documentElement.clientWidth + 0.5 && r.top >= 0 && r.bottom <= innerHeight + 0.5,
            pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            internalScroll: list.scrollHeight > list.clientHeight && list.scrollTop > 0,
            activeVisible: a.top >= l.top - 1 && a.bottom <= l.bottom + 1,
            name: __contrast(list.querySelector('[data-mention-name]')),
            detail: __contrast(list.querySelector('[data-mention-detail]')),
            placement: root.dataset.placement
          };
        });
        await page.waitForTimeout(250); // Let the opacity fade finish before capture.
        await page.screenshot({ path: resolve(evidence, `long-list-${vp}-${scheme}.png`) });
        assert.ok(geometry.inViewport, 'popup outside viewport');
        assert.ok(!geometry.pageOverflow, 'page overflows horizontally');
        assert.ok(geometry.internalScroll && geometry.activeVisible, 'list did not scroll to active');
        assert.ok(geometry.name >= 4.5 && geometry.detail >= 4.5, `contrast name ${geometry.name} detail ${geometry.detail}`);
        await page.keyboard.press('Escape');
        await page.keyboard.type(' @ma');
        await page.waitForFunction(() => document.querySelector('#mention-popup').dataset.state === 'ready');
        await page.waitForTimeout(250);
        await page.screenshot({ path: resolve(evidence, `long-name-${vp}-${scheme}.png`) });
        const wrap = await page.evaluate(() => {
          const root = document.querySelector('#mention-popup'), r = root.getBoundingClientRect();
          const names = [...root.querySelectorAll('[data-mention-name]')];
          return { fits: names.every((n) => n.getBoundingClientRect().right <= r.right + 0.5), full: names.some((n) => n.textContent === 'Maria-Fernanda Oyelaran-Castellanos de la Vega') };
        });
        assert.ok(wrap.fits && wrap.full, 'long name overflowed or was shortened in the DOM');
        assert.deepEqual(page.errors, []);
        await context.close();
        return geometry;
      });
    }
  }

  await check('H10 one result and flip above near the bottom of the viewport', async () => {
    const { context, page } = await open({ viewport: { width: 1280, height: 800 } });
    await page.evaluate(() => {
      const editor = document.querySelector('#mention-editor');
      const box = editor.getBoundingClientRect();
      // Keep the whole editor visible, close to the bottom edge.
      scrollTo({ top: box.bottom + scrollY - innerHeight + 10, behavior: 'instant' });
      editor.focus(); // Focus without a pointer click, which may scroll the editor elsewhere.
    });
    await page.keyboard.type('@ada');
    await page.waitForFunction(() => document.querySelector('#mention-popup').dataset.state === 'ready');
    assert.equal(await page.locator('#mention-popup [role=option]').count(), 1);
    assert.equal(await page.locator('#mention-popup [role=status]').textContent(), '1 person found');
    const geo = await page.evaluate(() => {
      const r = document.querySelector('#mention-popup').getBoundingClientRect(), e = document.querySelector('#mention-editor').getBoundingClientRect();
      return { placement: document.querySelector('#mention-popup').dataset.placement, above: r.bottom <= e.bottom, inside: r.top >= 0 && r.bottom <= innerHeight };
    });
    await page.screenshot({ path: resolve(evidence, 'one-result-flipped-1280.png') });
    assert.equal(geo.placement, 'above'); assert.ok(geo.above && geo.inside);
    await context.close();
  });

  await check('H11 right to left: list aligns to the caret start and stays in the viewport', async () => {
    const { context, page } = await open({ viewport: { width: 375, height: 700 } });
    const editor = page.locator('[data-mention-demo="mention-popup-rtl"]');
    await editor.scrollIntoViewIfNeeded();
    await editor.click();
    await page.keyboard.type('@');
    await page.waitForFunction(() => document.querySelector('#mention-popup-rtl').dataset.state === 'ready');
    const geo = await page.evaluate(() => {
      const root = document.querySelector('#mention-popup-rtl'), r = root.getBoundingClientRect();
      return { dir: root.dir, direction: getComputedStyle(root).direction, inside: r.left >= 0 && r.right <= document.documentElement.clientWidth + 0.5, textAlign: getComputedStyle(root.querySelector('[data-mention-name]')).textAlign };
    });
    await page.screenshot({ path: resolve(evidence, 'rtl-375.png') });
    assert.equal(geo.direction, 'rtl'); assert.ok(geo.inside);
    await context.close();
    return geo;
  });

  await check('H12 forced colors: active and hover rows differ, surface uses system colours', async () => {
    const { context, page } = await open({ forcedColors: 'active' });
    await typeMention(page, '@');
    await page.locator('#mention-popup [role=option]').nth(2).hover();
    const styles = await page.evaluate(() => {
      const [active, , hover] = document.querySelectorAll('#mention-popup [role=option]');
      const s = (el) => { const c = getComputedStyle(el); return { bg: c.backgroundColor, color: c.color, outline: `${c.outlineStyle} ${c.outlineWidth}` }; };
      const avatar = active.querySelector('.avatar'), a = getComputedStyle(avatar);
      return { active: s(active), hover: s(hover), avatar: { bg: a.backgroundColor, color: a.color } };
    });
    await page.screenshot({ path: resolve(evidence, 'forced-colors-1280.png') });
    assert.equal(styles.active.outline, 'solid 2px');
    assert.ok(styles.hover.outline.startsWith('dashed'), `hover outline ${styles.hover.outline}`);
    assert.notEqual(styles.active.bg, styles.hover.bg, 'hover looks like active');
    assert.notEqual(styles.avatar.bg, styles.avatar.color, 'avatar initials invisible');
    await context.close();
    return styles;
  });

  await check('H13 inherited scheme: a root inside .scheme-dark takes its colours', async () => {
    const { context, page } = await open({}, '/reference/components/mention-suggestions.html');
    await page.evaluate(CONTRAST);
    const result = await page.evaluate(() => {
      const wrap = document.createElement('div');
      wrap.className = 'scheme-dark box';
      const ready = document.querySelector('#r-ready').cloneNode(true);
      ready.id = 'r-inherited';
      ready.querySelectorAll('[id]').forEach((n) => { n.id = 'inh-' + n.id; });
      wrap.append(ready);
      document.querySelector('article').prepend(wrap);
      const name = ready.querySelector('[data-mention-name]'), detail = ready.querySelector('[data-mention-detail]');
      return { bg: getComputedStyle(ready).backgroundColor, wrapBg: getComputedStyle(wrap).backgroundColor, name: __contrast(name), detail: __contrast(detail) };
    });
    await page.locator('#r-inherited').screenshot({ path: resolve(evidence, 'inherited-scheme-dark.png') });
    assert.equal(result.bg, result.wrapBg);
    assert.ok(result.name >= 4.5 && result.detail >= 4.5, JSON.stringify(result));
    await context.close();
    return result;
  });

  await check('H14 reduced motion: no transition; closed root is clipped and empty', async () => {
    const { context, page } = await open({ reducedMotion: 'reduce' });
    const closed = await page.locator('#mention-popup').evaluate((root) => ({ transition: getComputedStyle(root).transitionDuration, clip: getComputedStyle(root).clipPath, width: root.getBoundingClientRect().width, status: root.querySelector('[role=status]').textContent, listHidden: root.querySelector('[role=listbox]').hidden }));
    assert.ok(parseFloat(closed.transition) <= 0.00001, `transition ${closed.transition}`); assert.match(closed.clip, /inset/); assert.ok(closed.width <= 1); assert.equal(closed.status, ''); assert.ok(closed.listHidden);
    await context.close();
    const { context: motion, page: moving } = await open({ reducedMotion: 'no-preference' });
    assert.ok(parseFloat(await moving.locator('#mention-popup').evaluate((root) => getComputedStyle(root).transitionDuration)) >= 0.1);
    await motion.close();
    return closed;
  });

  await check('H15 accessibility tree and axe rules with the list open', async () => {
    const { context, page } = await open();
    await typeMention(page, '@sa');
    await page.waitForTimeout(250); // Let the opacity fade finish so contrast is measured at rest.
    const snapshot = await page.locator('#mention-popup').ariaSnapshot();
    await writeFile(resolve(evidence, 'aria-snapshot-open.yml'), snapshot + '\n');
    assert.match(snapshot, /listbox "People"/);
    assert.match(snapshot, /option "Sam Rivera Kitchen" \[selected\]/);
    assert.doesNotMatch(snapshot, /SR/, 'avatar initials exposed');
    const editor = await page.locator('#mention-editor').evaluate((el) => Object.fromEntries([...el.attributes].filter((a) => a.name.startsWith('aria-') || a.name === 'role').map((a) => [a.name, a.value])));
    assert.equal(editor['aria-expanded'], undefined);
    let axe = 'not run (set LW_AXE_PATH)';
    if (axePath) {
      await page.addScriptTag({ content: await readFile(axePath, 'utf8') });
      const run = await page.evaluate(() => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
      const relevant = run.violations.filter((v) => v.nodes.some((n) => n.target.join(' ').includes('mention')));
      await writeFile(resolve(evidence, 'axe-open.json'), JSON.stringify({ version: run.testEngine.version, violations: run.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })) }, null, 2));
      assert.deepEqual(relevant.map((v) => v.id), []);
      axe = `axe ${run.testEngine.version}: no violations on mention nodes (${run.violations.length} elsewhere on page)`;
    }
    await context.close();
    return { editor, axe };
  });
} finally {
  await browser.close();
  await writeFile(resolve(evidence, 'results.json'), JSON.stringify({ engine, target, baseRef, results }, null, 2));
}
const failed = results.filter((r) => !r.passed).length;
console.log(`${results.length - failed}/${results.length} passed. Evidence: ${evidence}`);
process.exitCode = failed ? 1 : 0;
