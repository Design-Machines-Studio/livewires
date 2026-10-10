for (const time of document.querySelectorAll('time[data-relative-time-demo]')) {
  const date = new Date(Date.now() - 5 * 60_000);
  const timeZone = time.closest('lw-relative-time')?.getAttribute('time-zone') || undefined;
  time.dateTime = date.toISOString();
  time.querySelector('[data-relative-time-fallback]').textContent = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone,
  }).format(date);
}
