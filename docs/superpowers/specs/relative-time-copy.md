# Relative-time and copy utilities

This design baseline follows Live Wires issue #12 and its accepted task
requirements. It applies to the optional relative-time and copy examples and
their browser components.

## Relative time

- Start with semantic `<time datetime>` markup and a localized absolute date.
- Without the optional entry script, keep the absolute date visible. With it,
  show a short relative label and keep the exact absolute date available to
  assistive technology and through the time element's title.
- Preserve the represented instant and explicit offset. A date-only value keeps
  its calendar-date meaning. `lang` selects the label language; optional
  `time-zone` selects its calendar-day boundary.
- Keep the label current through one shared scheduler. Invalid input, an
  unsupported locale or time zone, and dates more than 30 calendar days away
  leave the absolute date as the visible fallback.
- Place timestamps inline in the surrounding prose. Inherit the surrounding
  text style; do not add widget typography, color, or component CSS.

## Copy

- Keep the source visible and selectable in a read-only field. Group the label,
  source, button, and status with Live Wires `.stack stack-compact`.
- Keep focus on the button. Announce progress while copying; announce success
  only after the clipboard write resolves. On failure, leave the source
  selectable and explain the manual copy action in a polite status region.
- Keep sources and feedback isolated by instance. The optional entry does not
  add a default runtime dependency or change a host application's clipboard
  policy.
