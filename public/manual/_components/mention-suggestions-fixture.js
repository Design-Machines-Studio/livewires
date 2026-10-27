// Page-only fixture for the mention suggestions manual. Not part of /dist.
// A real application supplies access-filtered people and stable IDs from its server.
import { attachMentionDemo } from '/reference/components/mention-suggestions-demo.js';

const PEOPLE = [
  ['ada', 'Ada Okafor', 'Finance circle'], ['bo', 'Bo Lindqvist', 'Kitchen'],
  ['cy', 'Cy Mbeki', 'Board'], ['di', 'Di Ng', null],
  ['sam-k', 'Sam Rivera', 'Kitchen'], ['sam-f', 'Sam Rivera', 'Finance circle'],
  ['long', 'Maria-Fernanda Oyelaran-Castellanos de la Vega', 'Festival submissions working group'],
  ['word', 'Wolfeschlegelsteinhausenbergerdorff', 'Archive'],
  ['ed', 'Ed Tanaka', 'Board'], ['fa', 'Fatima Haddad', 'Membership'],
  ['gu', 'Gus Pereira', 'Kitchen'], ['ha', 'Hana Kowalski', 'Finance circle'],
  ['ik', 'Ike Mensah', 'Delivery'], ['jo', 'Jo Whitfield', 'Delivery'],
  ['ka', 'Kai Nakamura', 'Board'], ['le', 'Lea Fontaine', 'Membership'],
  ['mo', 'Mo Rahman', 'Kitchen'], ['ni', 'Nia Adeyemi', 'Delivery'],
  ['ol', 'Ola Brandt', 'Finance circle'], ['pi', 'Pia Moreau', 'Kitchen'],
  ['qu', 'Quinn Doyle', 'Delivery'], ['ro', 'Rosa Jiménez', 'Board']
].map(([id, name, detail]) => ({
  id, name, detail,
  initials: id === 'di' ? null : name.split(/[\s-]+/).slice(0, 2).map((part) => part[0]).join('')
}));

const fold = (text) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function scenario(form) {
  return form?.querySelector('input[name="mention-scenario"]:checked')?.value || 'quick';
}

for (const editor of document.querySelectorAll('[data-mention-demo]')) {
  const root = document.getElementById(editor.dataset.mentionDemo);
  const form = editor.closest('form');
  const log = form?.querySelector('[data-mention-log]');
  // Mount outside the editor and any transformed ancestor, inside the page's landmarks.
  (editor.closest('article') || document.body).append(root);
  attachMentionDemo({
    editor, root,
    async search(query) {
      const mode = scenario(form);
      // Slow mode answers short queries late, so typing on shows stale rows and a dropped reply.
      await wait(mode === 'slow' ? (query.length <= 1 ? 1600 : 500) : 120);
      if (mode === 'error') throw new Error('People could not be loaded. Keep typing to try again.');
      const q = fold(query);
      return PEOPLE.filter((person) => fold(person.name).split(/[\s-]+/).some((part) => part.startsWith(q)) || fold(person.name).startsWith(q));
    },
    onSelect(person) {
      if (log) log.textContent = `Selected ${person.name}${person.detail ? ` (${person.detail})` : ''}, ID ${person.id}.`;
    }
  });
  form?.addEventListener('keydown', (event) => {
    // Composition confirmation belongs to the editor, as does Enter already handled by the popup.
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && event.keyCode !== 229 && !event.defaultPrevented && event.target === editor) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (log) log.textContent = `Sent: ${editor.textContent.trim() || '(empty)'}`;
  });
}
