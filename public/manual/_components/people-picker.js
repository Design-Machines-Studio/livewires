// Local fixtures for the manual and reference pages. Applications own their access rules
// and persistence; this script is not part of the framework bundle.
const fixtures = {
  space: {
    groups: { all: ['ada', 'bo', 'cy', 'di', 'ed'], board: ['ada', 'bo', 'cy'], officers: ['ada', 'ed'] },
    excluded: ['cy'],
    direct: [],
  },
  narrow: {
    groups: { festival: ['long'], board: ['long'] },
    excluded: [],
    direct: [],
  },
};

document.querySelectorAll('[data-demo-picker]').forEach((picker) => {
  const fixture = fixtures[picker.dataset.demoPicker];
  if (!fixture) return;
  const buttons = [...picker.querySelectorAll('[data-demo-group]')];
  const rows = [...picker.querySelectorAll('tbody tr')].map((row) => ({
    selection: row.querySelector('[name="member_ids"]'),
    organizer: row.querySelector('[name="organizer_ids"]'),
    detail: row.querySelector('.people-picker-detail'),
  }));
  const selectedGroups = new Set(buttons.filter((button) => button.getAttribute('aria-pressed') === 'true').map((button) => button.dataset.demoGroup));
  const direct = new Set(fixture.direct);
  const excluded = new Set(fixture.excluded);
  const groupsFor = (id) => buttons.filter((button) => selectedGroups.has(button.dataset.demoGroup) && fixture.groups[button.dataset.demoGroup].includes(id));

  const render = (message) => {
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(selectedGroups.has(button.dataset.demoGroup))));
    rows.forEach(({ selection, organizer, detail }) => {
      if (selection.disabled) return;
      const id = selection.value;
      const groups = groupsFor(id);
      selection.checked = !excluded.has(id) && (direct.has(id) || groups.length > 0);
      if (!selection.checked) organizer.checked = false;
      organizer.disabled = !selection.checked;
      const reasons = [];
      if (excluded.has(id) && groups.length) reasons.push('Removed');
      else if (selection.checked) {
        if (direct.has(id)) reasons.push('Direct');
        if (organizer.checked) reasons.push('Organizer');
        reasons.push(...groups.map((button) => button.textContent.trim()));
      }
      detail.textContent = reasons.join(', ');
    });
    const count = rows.filter(({ selection }) => selection.checked).length;
    const status = picker.querySelector('[role="status"]');
    if (status) status.textContent = `${message ? `${message} ` : ''}${count} ${count === 1 ? 'person' : 'people'} selected${rows.some(({ selection }) => selection.disabled) ? '; Di Ng is required' : ''}.`;
  };

  buttons.forEach((button) => {
    button.disabled = false;
    button.addEventListener('click', () => {
      const group = button.dataset.demoGroup;
      if (selectedGroups.has(group)) selectedGroups.delete(group);
      else selectedGroups.add(group);
      render(`${button.textContent.trim()} ${selectedGroups.has(group) ? 'selected' : 'released'}.`);
    });
  });
  rows.forEach(({ selection, organizer }) => {
    selection.addEventListener('change', () => {
      const id = selection.value;
      if (selection.checked) {
        excluded.delete(id);
        if (!groupsFor(id).length) direct.add(id);
      } else {
        direct.delete(id);
        excluded.add(id);
      }
      render();
    });
    organizer.addEventListener('change', () => {
      render();
    });
  });
  const clear = picker.querySelector('[value="clear"]');
  if (clear) {
    clear.disabled = false;
    clear.addEventListener('click', () => {
      selectedGroups.clear();
      direct.clear();
      excluded.clear();
      rows.forEach(({ organizer }) => { if (!organizer.disabled) organizer.checked = false; });
      render('Selection cleared.');
    });
  }
  render('');
});
