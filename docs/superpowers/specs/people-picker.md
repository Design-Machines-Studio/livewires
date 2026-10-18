# People picker review baseline

This baseline records the presentation introduced by PR #38 and the corrections
from its review. It does not claim an earlier approved prototype. The manual and
reference pages are the shared HTML contract for future consumer work.

## Existing patterns

Use the existing fieldset and legend, lined table, icon checkbox, small avatar,
small switch and button components. Keep the manual's sidebar, prose, section
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
- Under a 30em container, keep the checkbox, member and trailing control beside
  one another. Long names wrap within the member cell.
- Repeat the trailing header in `data-th`. Show that text above the control
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

Reference examples are static. Their group and action buttons use `type="button"`
and do not post or save. Native row controls remain usable with a keyboard and
without JavaScript. The Templ component and consumer migrations are separate work.

## Verification cases

Check the manual and reference at 1280, 640, 375 and 320 pixels in light and dark
appearance. Check narrow containers on a desktop too. Verify visible trailing
labels, wrapping names, readable pressed buttons, no page overflow, keyboard
focus and selection, name/avatar clicks, locked controls, empty state, unique
IDs and valid label references. Verify the shared footer and design panel.
Check the reference with JavaScript disabled. Accessibility snapshots verify
names and roles; they do not replace an actual screen reader pass.
