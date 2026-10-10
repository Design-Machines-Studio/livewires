const MINUTE = 60_000;
const SECOND = 1_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function dateNumber(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en', {
    calendar: 'gregory',
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return Math.floor(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)) / DAY);
}

function hasValidCalendarDate(value) {
  if (typeof value !== 'string') return true;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|[T ])/.exec(value);
  if (!match) return true;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= daysInMonth[month - 1];
}

function calendarDayNumber(year, month, day) {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / DAY);
}

/** Return a localized relative label, or null when the timestamp cannot be enhanced safely. */
export function formatRelativeTime(value, { now = Date.now(), locale, timeZone } = {}) {
  if (!hasValidCalendarDate(value)) return null;
  const dateOnly = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const timestamp = typeof value === 'number' ? value : Date.parse(value);
  if (!Number.isFinite(timestamp) || !Number.isFinite(now)) return null;

  try {
    if (locale && Intl.RelativeTimeFormat.supportedLocalesOf(locale).length === 0) return null;
    const formatter = new Intl.RelativeTimeFormat(locale || undefined, { numeric: 'auto' });
    if (timeZone) new Intl.DateTimeFormat('en', { timeZone }).format(new Date(now));
    if (dateOnly) {
      const dayDifference = calendarDayNumber(Number(dateOnly[1]), Number(dateOnly[2]), Number(dateOnly[3]))
        - dateNumber(new Date(now), timeZone);
      if (Math.abs(dayDifference) > 30) return null;
      return formatter.format(dayDifference, 'day');
    }

    const difference = timestamp - now;
    const absoluteDifference = Math.abs(difference);
    let unit;
    let amount;

    if (absoluteDifference < MINUTE) {
      unit = 'second';
      amount = Math.trunc(difference / 1000);
    } else if (absoluteDifference < HOUR) {
      unit = 'minute';
      amount = Math.trunc(difference / MINUTE);
    } else {
      const dayDifference = dateNumber(new Date(timestamp), timeZone)
        - dateNumber(new Date(now), timeZone);
      if (dayDifference !== 0) {
        if (Math.abs(dayDifference) > 30) return null;
        unit = 'day';
        amount = dayDifference;
      } else {
        unit = 'hour';
        amount = Math.trunc(difference / HOUR);
      }
    }

    return formatter.format(amount, unit);
  } catch {
    // Invalid locale/time-zone options keep the server-rendered absolute label.
    return null;
  }
}

/** One aligned timeout services every connected instance in this module. */
export function createSharedScheduler(refresh, {
  now = Date.now,
  setTimeout: schedule = globalThis.setTimeout,
  clearTimeout: cancel = globalThis.clearTimeout,
} = {}) {
  const subscribers = new Set();
  let timer = null;

  const tick = () => {
    timer = null;
    try {
      for (const subscriber of subscribers) {
        try { refresh(subscriber); } catch { /* One broken instance must not stop the shared clock. */ }
      }
    } finally {
      if (subscribers.size) scheduleNext();
    }
  };

  const scheduleNext = () => {
    const wait = SECOND - (now() % SECOND);
    timer = schedule(tick, wait);
  };

  return {
    add(subscriber) {
      if (subscribers.has(subscriber)) return () => this.remove(subscriber);
      subscribers.add(subscriber);
      refresh(subscriber);
      if (subscribers.size === 1) scheduleNext();
      return () => this.remove(subscriber);
    },
    remove(subscriber) {
      subscribers.delete(subscriber);
      if (!subscribers.size && timer !== null) {
        cancel(timer);
        timer = null;
      }
    },
    get size() {
      return subscribers.size;
    },
  };
}
