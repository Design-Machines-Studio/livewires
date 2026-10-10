import test from 'node:test';
import assert from 'node:assert/strict';
import { createSharedScheduler, formatRelativeTime } from '../src/js/components/relative-time-state.js';
import { copyText } from '../src/js/components/copy-button-state.js';

const now = Date.parse('2026-03-10T12:00:00Z');

test('relative time includes exact past, present, and future boundaries', () => {
  assert.equal(formatRelativeTime(now - 1_000, { now, locale: 'en' }), '1 second ago');
  assert.equal(formatRelativeTime(now, { now, locale: 'en' }), 'now');
  assert.equal(formatRelativeTime(now + 1_000, { now, locale: 'en' }), 'in 1 second');
  assert.equal(formatRelativeTime(now - 60_000, { now, locale: 'en' }), '1 minute ago');
  assert.equal(formatRelativeTime(now + 3_600_000, { now, locale: 'en' }), 'in 1 hour');
  assert.equal(
    formatRelativeTime('2026-03-10T07:00:00-05:00', { now, locale: 'en' }),
    'now',
    'an explicit offset preserves the represented instant',
  );
  assert.equal(
    formatRelativeTime(now - 3_600_000, { now, locale: 'fr' }),
    new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(-1, 'hour'),
  );
});

test('relative time uses calendar dates in the requested time zone', () => {
  const afterMidnight = Date.parse('2026-03-10T04:30:00Z');
  assert.equal(
    formatRelativeTime('2026-03-10T03:30:00Z', { now: afterMidnight, locale: 'en', timeZone: 'America/New_York' }),
    'yesterday',
  );
  assert.equal(
    formatRelativeTime('2026-03-11T04:30:00Z', { now: afterMidnight, locale: 'en', timeZone: 'America/New_York' }),
    'tomorrow',
  );
});

test('invalid timestamps, locale, and time zone retain the absolute fallback', () => {
  assert.equal(formatRelativeTime('not a date', { now, locale: 'en' }), null);
  assert.equal(formatRelativeTime('2026-03-10T12:00:00Z', { now, locale: 'not a locale' }), null);
  assert.equal(formatRelativeTime('2026-03-10T12:00:00Z', { now, timeZone: 'Mars/Olympus' }), null);
});

test('instances share one aligned timer and release it after the last removal', () => {
  let nextId = 0;
  const timers = new Map();
  const canceled = [];
  const refreshed = [];
  const scheduler = createSharedScheduler((instance) => refreshed.push(instance), {
    now: () => 12_345,
    setTimeout(callback, delay) {
      const id = ++nextId;
      timers.set(id, {
        delay,
        callback: () => {
          timers.delete(id);
          callback();
        },
      });
      return id;
    },
    clearTimeout(id) {
      canceled.push(id);
      timers.delete(id);
    },
  });
  const first = {};
  const second = {};
  const releaseFirst = scheduler.add(first);
  const firstTimer = [...timers.keys()][0];
  scheduler.add(second);

  assert.equal(timers.size, 1);
  assert.equal(timers.get(firstTimer).delay, 47_655);
  assert.deepEqual(refreshed, [first, second]);

  timers.get(firstTimer).callback();
  const nextTimer = [...timers.keys()][0];
  releaseFirst();
  assert.equal(timers.size, 1);
  scheduler.remove(second);
  assert.deepEqual(canceled, [nextTimer]);
  assert.equal(timers.size, 0);
  assert.equal(scheduler.size, 0);
});

test('copy reports success only for a resolved clipboard write', async () => {
  const copied = [];
  assert.equal(await copyText('first value', { writeText: async (value) => copied.push(value) }), true);
  assert.deepEqual(copied, ['first value']);
  assert.equal(await copyText('denied', { writeText: async () => { throw new Error('denied'); } }), false);
  assert.equal(await copyText('unavailable', undefined), false);
});
