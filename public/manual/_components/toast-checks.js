import { createToastRegion } from '/dist/toast-region.js';

function clockFixture() {
  let time = 0, serial = 0;
  const timers = new Map();
  return { now: () => time,
    setTimeout(fn, ms) { const id = ++serial; timers.set(id, { at: time + ms, fn }); return id; },
    clearTimeout(id) { timers.delete(id); },
    advance(ms) {
      const end = time + ms;
      while (true) {
        const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        time = next[1].at; timers.delete(next[0]); next[1].fn();
      }
      time = end;
    }, get pending() { return timers.size; } };
}
const flush = async () => { for (let n = 0; n < 5; n++) await Promise.resolve(); };
const assert = (value, why) => { if (!value) throw new Error(why); };

export async function runToastChecks() {
  const results = [];
  const fixtures = [];
  function setup({ maxVisible = 3, root: suppliedRoot } = {}) {
    const root = suppliedRoot ?? document.createElement('section');
    root.setAttribute('data-toast-region', '');
    root.innerHTML = '<div class="stack stack-compact" data-toast-list></div><button type="button" data-toast-focus-return>Return to work</button>';
    if (!suppliedRoot) document.querySelector('#check-fixtures').append(root);
    const clock = clockFixture();
    const announcements = [], invalid = [], dismissals = [];
    root.addEventListener('lw-toast-announce', (e) => announcements.push(e.detail));
    root.addEventListener('lw-toast-invalid', (e) => invalid.push(e.detail));
    root.addEventListener('lw-toast-dismiss', (e) => dismissals.push(e.detail));
    const region = createToastRegion({ root, maxVisible, clock });
    const list = root.querySelector('[data-toast-list]');
    function add(id, { duration = 1000, kind = 'info', action = false } = {}) {
      const node = document.createElement('div');
      node.className = `toast toast--${kind}`;
      node.dataset.toastId = id;
      node.dataset.toastKind = kind;
      if (duration !== null) node.dataset.toastDuration = duration;
      node.innerHTML = '<p class="content" data-toast-message>Test feedback.</p><button class="close" type="button" data-toast-dismiss aria-label="Dismiss">×</button>';
      if (action) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Review';
        node.querySelector('.content').append(button);
      }
      list.append(node);
      return node;
    }
    const f = { root, list, region, clock, add, announcements, invalid, dismissals,
      state: (id) => region.state.messages.find((m) => m.id === id) };
    fixtures.push(f);
    return f;
  }
  async function check(name, run) {
    try { await run(); results.push({ name, passed: true }); }
    catch (error) { results.push({ name, passed: false, error: error.message }); }
    finally { for (const f of fixtures.splice(0)) { f.region.dispose(); f.root.remove(); } }
  }
  await check('repeated patches and same-ID node replacement preserve remaining time and one announcement', async () => {
    const f = setup(); let node = f.add('same'); await flush(); f.clock.advance(350);
    for (let n = 0; n < 10; n++) { const copy = node.cloneNode(true); node.replaceWith(copy); node = copy; await flush(); }
    assert(f.state('same').remaining === 650, 'timer restarted');
    assert(f.announcements.length === 1, 'duplicate announcement');
    f.clock.advance(650); assert(node.hidden, 'replacement did not expire');
  });
  await check('dismissed replacement remains dismissed, with duplicate clicks harmless', async () => {
    const f = setup(); const node = f.add('same'); await flush();
    const close = node.querySelector('[data-toast-dismiss]'); close.click(); close.click();
    const copy = node.cloneNode(true); copy.hidden = false; node.replaceWith(copy); await flush();
    assert(copy.hidden && f.state('same').dismissed, 'dismissal lost');
    assert(f.dismissals.length === 1 && f.announcements.length === 1, 'duplicate event');
  });
  await check('duplicate IDs have one visible canonical node and one announcement', async () => {
    const f = setup(); const first = f.add('same'); const duplicate = f.add('same'); await flush();
    assert(!first.hidden && duplicate.hidden, 'duplicate visible');
    assert(f.region.state.messages.length === 1 && f.announcements[0].ids.length === 1, 'duplicate occurrence');
    assert(f.invalid.some((e) => e.reason === 'duplicate-id'), 'duplicate not diagnosed');
    first.remove(); await flush(); assert(!duplicate.hidden, 'canonical promotion failed');
    assert(f.announcements.length === 1, 'promotion reannounced');
  });
  await check('actual focus pauses timed feedback until focus leaves', async () => {
    const f = setup(); const node = f.add('focus'); await flush(); f.clock.advance(400);
    node.querySelector('[data-toast-dismiss]').focus(); f.clock.advance(5000);
    assert(!node.hidden && f.state('focus').remaining === 600, 'focused control disappeared');
    f.root.querySelector('[data-toast-focus-return]').focus(); f.clock.advance(599);
    assert(!node.hidden, 'resumed too early'); f.clock.advance(1); assert(node.hidden, 'did not resume');
  });
  await check('hover and focus pauses combine across native event transitions', async () => {
    const f = setup(); const node = f.add('hover'); await flush(); f.clock.advance(250);
    node.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    node.querySelector('[data-toast-dismiss]').focus(); f.clock.advance(3000);
    node.dispatchEvent(new MouseEvent('mouseout', { bubbles: true })); f.clock.advance(3000);
    assert(f.state('hover').remaining === 750 && !node.hidden, 'one pause cleared another');
    f.root.querySelector('[data-toast-focus-return]').focus(); f.clock.advance(750); assert(node.hidden, 'hover/focus did not resume');
  });
  await check('focused actions stay sticky when another message arrives and timers advance', async () => {
    const f = setup({ maxVisible: 1 }); const node = f.add('action', { action: true }); await flush();
    const action = node.querySelector('button:not([data-toast-dismiss])'); action.focus();
    const later = f.add('later'); await flush(); f.clock.advance(10000);
    assert(document.activeElement === action && !node.hidden && later.hidden, 'focused action displaced');
    assert(f.state('action').sticky, 'action not sticky');
  });
  await check('bounded queue exposes errors and actions through the native review control', async () => {
    const f = setup({ maxVisible: 1 }); f.add('sticky', { duration: null });
    const error = f.add('error', { kind: 'error', action: true }); await flush();
    const review = f.root.querySelector('[data-toast-review]');
    assert(error.hidden && !review.hidden && /1 error/.test(review.textContent), 'backlog not disclosed');
    assert(f.announcements.some((a) => a.priority === 'assertive' && a.ids.includes('error')), 'queued error not announced');
    review.click(); assert(!error.hidden && review.getAttribute('aria-expanded') === 'true', 'backlog inaccessible');
    assert(f.clock.pending === 0, 'queued error timed');
  });
  await check('older-ID reinsertion queues behind a focused admitted action', async () => {
    const f = setup({ maxVisible: 1 }); const older = f.add('older'); await flush();
    f.clock.advance(300); older.remove(); await flush();
    const node = f.add('action', { action: true }); await flush();
    const action = node.querySelector('button:not([data-toast-dismiss])'); action.focus();
    f.list.prepend(older); await flush(); f.clock.advance(5000);
    assert(document.activeElement === action && !node.hidden && older.hidden, 'reinsertion displaced focused action');
    assert(f.state('older').queued && f.state('older').remaining === 700, 'queued timer changed');
    assert(f.root.querySelector('[data-toast-review]').textContent === 'Show 1 more message', 'singular backlog label');
    const review = f.root.querySelector('[data-toast-review]'); review.focus();
    assert(document.activeElement === review, 'review control could not receive focus');
    f.region.dismiss('action'); assert(!older.hidden, 'waiting occurrence not admitted');
    f.region.refresh(); assert(review.textContent === 'No more messages' && !review.hidden, 'focused empty review removed');
    assert(review.getAttribute('aria-expanded') === 'false', 'empty backlog stayed expanded');
    f.root.querySelector('[data-toast-focus-return]').focus(); await flush();
    assert(review.hidden, 'empty review stayed visible after focus left');
    const next = f.add('next'); await flush();
    assert(next.hidden && review.getAttribute('aria-expanded') === 'false', 'new backlog opened without a request');
  });
  await check('a preceding nested region cannot capture the parent list or focus return', async () => {
    const f = setup(); const childRoot = document.createElement('section'); f.root.prepend(childRoot);
    const child = setup({ root: childRoot }); child.add('same', { duration: null });
    const parent = f.add('same', { duration: null }); await flush();
    assert(!f.region.state.disposed && !child.region.state.disposed, 'nested list disposed parent');
    parent.querySelector('[data-toast-dismiss]').focus(); f.region.dismiss('same');
    assert(document.activeElement === f.root.querySelector(':scope > [data-toast-focus-return]'), 'focus crossed into nested region');
    assert(!child.state('same').dismissed, 'parent dismissal crossed region');
    const controller = f.region; controller.dispose();
    const next = createToastRegion({ root: f.root, clock: f.clock });
    assert(!next.state.disposed && next.state.messages.length === 1, 'initial setup chose nested list'); next.dispose();
  });
  await check('keyboard Escape dismisses only the focused region and recovers focus', async () => {
    const f = setup(); const other = setup(); const node = f.add('same'); const second = other.add('same'); await flush();
    const close = node.querySelector('[data-toast-dismiss]'); close.focus();
    close.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    assert(node.hidden && !second.hidden, 'Escape crossed regions');
    assert(document.activeElement === f.root.querySelector('[data-toast-focus-return]'), 'dismissal stranded focus');
  });
  await check('pending, errors and actions override supplied durations; plain success can expire', async () => {
    const f = setup({ maxVisible: 4 });
    const pending = f.add('pending', { kind: 'pending', duration: 1 });
    const error = f.add('error', { kind: 'error', duration: 1 });
    const action = f.add('action', { action: true, duration: 1 });
    const success = f.add('confirmed', { kind: 'success', duration: 1 }); await flush(); f.clock.advance(1);
    assert(!pending.hidden && !error.hidden && !action.hidden && success.hidden, 'sticky/timed policy broken');
  });
  await check('removal/reinsertion suspends timing and retains dismissal until explicit absent-ID reuse', async () => {
    const f = setup(); const node = f.add('same'); await flush(); f.clock.advance(300);
    node.remove(); await flush(); f.clock.advance(5000); f.list.append(node); await flush();
    assert(f.state('same').remaining === 700 && f.announcements.length === 1, 'reinsertion restarted/reannounced');
    f.region.dismiss('same'); node.remove(); await flush(); f.list.append(node); await flush();
    assert(node.hidden, 'dismissal lost on reinsertion');
    node.remove(); await flush(); f.region.forget('same'); f.list.append(node); await flush();
    assert(!node.hidden && f.announcements.length === 2, 'intentional reuse failed');
  });
  await check('message-list replacement rebinds without resetting local state', async () => {
    const f = setup(); f.add('same'); await flush(); f.clock.advance(600);
    const next = f.list.cloneNode(true); f.list.replaceWith(next); await flush();
    assert(f.state('same').remaining === 400 && f.announcements.length === 1, 'list replacement reset state');
    f.clock.advance(400); assert(next.querySelector('[data-toast-id]').hidden, 'new list did not expire');
  });
  await check('disposal restores native attributes and releases timers, controls and listeners', async () => {
    const f = setup(); const node = f.add('same'); await flush();
    f.region.dismiss('same'); f.region.dispose(); f.region.dispose();
    assert(!node.hidden && !node.hasAttribute('data-toast-state'), 'native markup not restored');
    assert(f.clock.pending === 0 && !f.root.querySelector('[data-toast-review]'), 'owned resources retained');
    assert(f.region.state.disposed && !f.region.dismiss('same'), 'disposed controller still active');
    const count = f.dismissals.length; node.querySelector('[data-toast-dismiss]').click();
    assert(f.dismissals.length === count, 'listener retained');
    const next = createToastRegion({ root: f.root, clock: f.clock }); next.dispose();
  });
  await check('root removal and nested shadow-host removal dispose their controller', async () => {
    const f = setup(); f.add('same'); await flush(); f.root.remove(); await flush();
    assert(f.region.state.disposed && f.clock.pending === 0, 'root removal leaked');
    const host = document.createElement('div'); document.querySelector('#check-fixtures').append(host);
    const shadow = host.attachShadow({ mode: 'open' }); const root = document.createElement('section'); shadow.append(root);
    const s = setup({ root }); s.add('shadow'); await flush(); host.remove(); await flush();
    assert(s.region.state.disposed && s.clock.pending === 0, 'shadow host removal leaked');
  });
  await check('focused shadow-region feedback keeps its pause through patches and recovers focus on dismissal', async () => {
    const host = document.createElement('div'); document.querySelector('#check-fixtures').append(host);
    const shadow = host.attachShadow({ mode: 'open' }); const root = document.createElement('section'); shadow.append(root);
    const f = setup({ root }); const node = f.add('focused'); await flush(); f.clock.advance(400);
    const close = node.querySelector('[data-toast-dismiss]'); close.focus();
    assert(shadow.activeElement === close && document.activeElement === host, 'shadow focus setup failed');
    f.add('other', { duration: null }); await flush(); f.clock.advance(5000);
    assert(!node.hidden && f.state('focused').paused && f.state('focused').remaining === 600, 'shadow patch cleared focused pause');
    f.region.dismiss('focused');
    assert(shadow.activeElement === f.list.querySelector('[data-toast-id="other"] [data-toast-dismiss]'), 'shadow dismissal stranded focus');
    host.remove(); await flush(); assert(f.region.state.disposed && f.clock.pending === 0, 'shadow cleanup leaked');
  });
  await check('required-target removal releases resources instead of guessing a new boundary', async () => {
    const f = setup(); f.add('same'); await flush(); f.list.remove(); await flush();
    assert(f.region.state.disposed && f.clock.pending === 0, 'missing list leaked');
  });
  await check('losing message identity restores native visibility and suspends managed time', async () => {
    const f = setup(); const node = f.add('same'); await flush(); f.region.dismiss('same');
    node.removeAttribute('data-toast-id'); await flush();
    assert(!node.hidden && !node.hasAttribute('data-toast-state'), 'native message remained hidden without its identity');
    assert(!f.state('same').present && f.clock.pending === 0, 'removed identity retained a timer');
  });
  await check('a second controller cannot acquire an owned root', async () => {
    const f = setup(); let rejected = false;
    try { createToastRegion({ root: f.root }); } catch { rejected = true; }
    assert(rejected && f.root.querySelectorAll('[data-toast-review]').length === 1, 'ownership duplicate');
  });
  return { passed: results.filter((r) => r.passed).length, failed: results.filter((r) => !r.passed).length, results };
}

document.querySelector('#run-checks')?.addEventListener('click', async () => {
  const result = await runToastChecks();
  window.toastCheckResults = result;
  document.querySelector('#check-results').textContent = JSON.stringify(result, null, 2);
});
