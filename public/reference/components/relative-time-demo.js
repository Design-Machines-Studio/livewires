for (const time of document.querySelectorAll('time[data-relative-time-demo]')) {
  const timeZone = time.closest('lw-relative-time')?.getAttribute('time-zone') || undefined;
  const fallback = time.querySelector('[data-relative-time-fallback]');

  if (time.dataset.relativeTimeDemo === 'date-only') {
    const today = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date()).map(({ type, value }) => [type, value]));
    const yesterday = new Date(Date.UTC(today.year, today.month - 1, today.day - 1, 12));

    time.dateTime = yesterday.toISOString().slice(0, 10);
    fallback.textContent = new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(yesterday);
    continue;
  }

  const date = new Date(Date.now() - 5 * 60_000);
  time.dateTime = date.toISOString();
  fallback.textContent = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone,
  }).format(date);
}
