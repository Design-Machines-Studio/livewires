import { createCombobox, foldChoice } from '/dist/combobox.js';

// Portable application-owned simulation, not a search backend or save API.
const zones = [{"value": "", "label": "Use organization default (UTC)"}, {"value": "UTC", "label": "UTC"}, {"value": "Africa/Cairo", "label": "Africa/Cairo"}, {"value": "Africa/Johannesburg", "label": "Africa/Johannesburg"}, {"value": "Africa/Lagos", "label": "Africa/Lagos"}, {"value": "Africa/Nairobi", "label": "Africa/Nairobi"}, {"value": "America/Anchorage", "label": "America/Anchorage"}, {"value": "America/Argentina/Buenos_Aires", "label": "America/Argentina/Buenos Aires"}, {"value": "America/Bogota", "label": "America/Bogota"}, {"value": "America/Chicago", "label": "America/Chicago"}, {"value": "America/Denver", "label": "America/Denver"}, {"value": "America/Detroit", "label": "America/Detroit"}, {"value": "America/Edmonton", "label": "America/Edmonton"}, {"value": "America/Halifax", "label": "America/Halifax"}, {"value": "America/Los_Angeles", "label": "America/Los Angeles"}, {"value": "America/Mexico_City", "label": "America/Mexico City"}, {"value": "America/New_York", "label": "America/New York"}, {"value": "America/Phoenix", "label": "America/Phoenix"}, {"value": "America/Sao_Paulo", "label": "America/Sao Paulo"}, {"value": "America/St_Johns", "label": "America/St Johns"}, {"value": "America/Toronto", "label": "America/Toronto"}, {"value": "America/Vancouver", "label": "America/Vancouver"}, {"value": "America/Winnipeg", "label": "America/Winnipeg"}, {"value": "Asia/Bangkok", "label": "Asia/Bangkok"}, {"value": "Asia/Dhaka", "label": "Asia/Dhaka"}, {"value": "Asia/Dubai", "label": "Asia/Dubai"}, {"value": "Asia/Hong_Kong", "label": "Asia/Hong Kong"}, {"value": "Asia/Jakarta", "label": "Asia/Jakarta"}, {"value": "Asia/Karachi", "label": "Asia/Karachi"}, {"value": "Asia/Kathmandu", "label": "Asia/Kathmandu"}, {"value": "Asia/Kolkata", "label": "Asia/Kolkata"}, {"value": "Asia/Kuala_Lumpur", "label": "Asia/Kuala Lumpur"}, {"value": "Asia/Makassar", "label": "Asia/Makassar"}, {"value": "Asia/Manila", "label": "Asia/Manila"}, {"value": "Asia/Seoul", "label": "Asia/Seoul"}, {"value": "Asia/Shanghai", "label": "Asia/Shanghai"}, {"value": "Asia/Singapore", "label": "Asia/Singapore"}, {"value": "Asia/Taipei", "label": "Asia/Taipei"}, {"value": "Asia/Tokyo", "label": "Asia/Tokyo"}, {"value": "Asia/Yangon", "label": "Asia/Yangon"}, {"value": "Australia/Adelaide", "label": "Australia/Adelaide"}, {"value": "Australia/Brisbane", "label": "Australia/Brisbane"}, {"value": "Australia/Darwin", "label": "Australia/Darwin"}, {"value": "Australia/Melbourne", "label": "Australia/Melbourne"}, {"value": "Australia/Perth", "label": "Australia/Perth"}, {"value": "Australia/Sydney", "label": "Australia/Sydney"}, {"value": "Europe/Amsterdam", "label": "Europe/Amsterdam"}, {"value": "Europe/Athens", "label": "Europe/Athens"}, {"value": "Europe/Berlin", "label": "Europe/Berlin"}, {"value": "Europe/Brussels", "label": "Europe/Brussels"}, {"value": "Europe/Dublin", "label": "Europe/Dublin"}, {"value": "Europe/Helsinki", "label": "Europe/Helsinki"}, {"value": "Europe/Istanbul", "label": "Europe/Istanbul"}, {"value": "Europe/Lisbon", "label": "Europe/Lisbon"}, {"value": "Europe/London", "label": "Europe/London"}, {"value": "Europe/Madrid", "label": "Europe/Madrid"}, {"value": "Europe/Paris", "label": "Europe/Paris"}, {"value": "Europe/Rome", "label": "Europe/Rome"}, {"value": "Europe/Stockholm", "label": "Europe/Stockholm"}, {"value": "Europe/Vienna", "label": "Europe/Vienna"}, {"value": "Europe/Warsaw", "label": "Europe/Warsaw"}, {"value": "Pacific/Auckland", "label": "Pacific/Auckland"}, {"value": "Pacific/Chatham", "label": "Pacific/Chatham"}, {"value": "Pacific/Fiji", "label": "Pacific/Fiji"}, {"value": "Pacific/Honolulu", "label": "Pacific/Honolulu"}];
const controllers = new Map();
const log = document.querySelector('[data-demo-log]');
const timers = new Set();
for (const root of document.querySelectorAll('[data-combobox]')) {
  const control = createCombobox({ root, mode: root.dataset.search === 'remote' ? 'remote' : 'local' });
  controllers.set(root.id, control);
  root.addEventListener('combobox-query', ({ detail }) => {
    if (root.dataset.search !== 'remote') return;
    const delay = detail.query.toLowerCase() === 'pa' ? 900 : detail.query.toLowerCase() === 'par' ? 100 : 250;
    const timer = setTimeout(() => {
      timers.delete(timer);
      const match = foldChoice(detail.query);
      const result = { ...detail, items: zones.filter(item => foldChoice(item.label).includes(match)) };
      if (detail.query.toLowerCase() === 'fail') { result.items = []; result.error = 'Example connection failed. Edit the query to try again.'; }
      const applied = control.applyResults(result);
      if (log) log.textContent = `${applied ? 'Applied' : 'Ignored stale'} reply for “${detail.query}”.`;
    }, delay);
    timers.add(timer);
  });
}
document.addEventListener('click', event => {
  const action = event.target.closest('[data-demo]')?.dataset.demo;
  const select = document.querySelector('#local-zone');
  if (action === 'reject') { select.setCustomValidity('The example application rejected this saved value. Choose another value or clear the error.'); controllers.get('local-choice').refresh(); log.textContent = 'The local timezone has a saved-value error.'; }
  if (action === 'clear-error') { select.setCustomValidity(''); controllers.get('local-choice').refresh(); log.textContent = 'The local timezone error was cleared.'; }
  if (action === 'patch') {
    const option = new Option('São Tomé — example display label', 'Africa/Sao_Tome'); select.add(option); controllers.get('local-choice').refresh();
    event.target.disabled = true; log.textContent = 'Added São Tomé to the local timezone choices.';
  }
  if (action === 'disable') { const fieldset = document.querySelector('#required-fieldset'); fieldset.disabled = !fieldset.disabled; log.textContent = `Required timezone fieldset ${fieldset.disabled ? 'disabled' : 'enabled'}.`; }
});
document.querySelector('#local-zone').addEventListener('change', event => {
  event.target.setCustomValidity(''); controllers.get('local-choice').refresh();
});
const query = new URLSearchParams(location.search);
document.querySelector('#submitted-choices').textContent = [...query].map(([name,value]) => `${name}=${value}`).join('; ');
window.addEventListener('pagehide', () => { timers.forEach(clearTimeout); controllers.forEach(control => control.dispose()); }, { once: true });
