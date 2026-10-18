# People picker review baseline

This baseline records the presentation introduced by PR #38 and the corrections
from its review. It does not claim an earlier approved prototype. The manual and
reference pages are the shared HTML contract for future consumer work.

## Existing patterns

Use the existing fieldset and legend, lined table, icon checkbox, small avatar,
small switch and button components. Follow the Avatars, Toggles, Tables and
Sortable List manuals: short descriptions, live examples and Code popup dialogs.
Keep the manual's sidebar, prose, section
header and shared footer, as on the other component pages. The footer also
provides the design panel. Import the picker through the main CSS entry point. The prototyping stylesheet
highlights its manual navigation link.

Rows contain a selection checkbox and member label. An optional third cell
contains an organizer switch or role field. The member label keeps the avatar
and name clickable. The hidden selection label supplies one accessible name
through `aria-labelledby`; optional detail text supplies a separate description
through `aria-describedby`. Avatars are decorative in these labelled rows.

## Appearance and responsive behavior

- Use the existing `--line-*` spacing and typography triplets.
- Group buttons use `aria-pressed` as their selected state. Selected buttons
  use `--color-accent` with `--color-white` text so inherited light and dark
  schemes keep readable contrast.
- Under a 30em container, use the sortable list’s two-column grid: checkbox
  beside identity, trailing control below identity. Let names wrap at words
  and hyphens before breaking an overlong word.
- Repeat the trailing header in `data-th`. Show that text beside the control
  when the table header is visually hidden. A role label and field must fit
  without widening the page at 320px.
- A disabled group has an explanatory sentence after the group row. The
  locked-row example disables both selection and organizer controls. An empty
  picker has a short description and no table.

## Behavior and ownership

Live Wires supplies presentation. Consumers own group membership, exclusions,
roles, permissions, requests and persistence. Canonical application snippets use
named submit actions with `formnovalidate`; consumers validate the final result
on the server and preserve disabled values there. The status region remains
mounted and uses `role="status"` with `aria-atomic="true"`.

Manual and reference examples use a page-only fixture script following the existing save-status
pattern. Circle toggles, exclusions, organizer state and Clear selection update
locally. Clear preserves the locked person. Organizer switches are off and disabled
for unchecked people. No action posts or saves. Without JavaScript the circle and
Clear buttons stay disabled; native row controls remain usable. The Templ component
and consumer migrations are separate work.

Use `cluster gap-025` for groups, `flex items-center gap-05 min-w-0` for
person labels, and `cluster cluster-compact` for actions. Reuse `.avatar` with
its existing size variants, image and initials markup. Do not restyle avatars
inside the picker. Opus 5.5’s design consultation identified the forced single-row
layout and inert examples as defects after the first mechanical review missed them.

## Verification cases

Check the manual and reference at 1280, 640, 375 and 320 pixels in light and dark
appearance. Check narrow containers on a desktop too. Verify visible trailing
labels, wrapping names, readable pressed buttons, no page overflow, keyboard
focus and selection, name/avatar clicks, locked controls, empty state, unique
IDs and valid label references. Verify the shared footer and design panel.
Check the reference with JavaScript disabled. Accessibility snapshots verify
names and roles; they do not replace an actual screen reader pass.
