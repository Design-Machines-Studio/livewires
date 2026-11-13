# Icon picker

An icon picker lets a person choose one Phosphor Bold icon for a field, as in
Craft or Notion. V1 supports icons only. Emoji, upload and colour choices are
out of scope.

## Anatomy

```
Trigger:  [icon]                             the icon itself is the button

Panel (popover anchored to the trigger):
+--------------------------------------+
| Icons                        Remove  |  header: heading + ghost Remove
+--------------------------------------+
| Search: Filter icons...              |  focused on open
+--------------------------------------+
| Recent                               |  one row, hidden when empty
| [] [] [] [] [] []                    |
| People                               |  Phosphor category headings
| [] [] [] [] [] [] [] [] [] []        |
| Office                               |
| [] [] [] [] [] [] [] [] [] []        |  scrolls inside the panel
+--------------------------------------+
| 412 icons                            |  role="status" count or empty state
+--------------------------------------+
```

The trigger is a single button showing the current icon, with no Change or
Remove buttons beside it. Without a value it shows a muted placeholder icon.
Its accessible name is `Change icon, {icon name}` or `Choose icon`.

The panel header holds a heading at the start and a ghost Remove button at the
end. Future tabs (Emoji, Upload) replace the heading in the same bar. Remove is
hidden when there is no value.

## Markup and behavior

- The trigger is a `<button>` with `popovertarget` pointing at the panel, so it
  opens without JavaScript. JavaScript adds `aria-expanded` and anchors the panel.
- The panel's content is a `fieldset`. The header heading labels it through
  `aria-labelledby`. Each icon is a visually hidden
  `<input type="radio" name="{field}" value="{icon-name}">` with a label. The
  label contains the SVG and a visually hidden icon name. Icon names use
  Phosphor's kebab-case names, such as `users-three`.
- Remove is a label for a visually hidden `value=""` radio in the same group,
  styled as a ghost button. Choosing it clears the value without JavaScript.
- Opening the panel shows the current icon checked and scrolls it into view.
  Focus goes to the search field. Tab from the search field lands on the
  checked icon, because the checked radio is the group's tab stop.
- Choosing an icon or Remove updates the trigger, closes the panel and returns
  focus to the trigger. Escape and outside clicks close without changing the
  value.
- Without JavaScript the native popover opens centred. Search and Recent stay
  hidden, the trigger does not update until the form is saved, and the radios
  submit with the form.
- With JavaScript the panel is positioned like the action menu
  (`src/js/components/action-menu.js`). Below a 30em viewport it becomes a
  full-width sheet.
- Arrow keys move focus in two dimensions across the visible grid. Home and End
  go to the first and last visible icon. Tab leaves the grid.
- Search matches icon names and Phosphor tags, stored in `data-tags`, so "home"
  finds `house`. Hidden tiles use the `hidden` attribute. Empty category headings
  hide with them. The status region reports the visible count, or
  `No icons match "{query}"`.
- Recent stores up to one row of names in `localStorage`, filtered to the
  current subset. Consumers can turn it off.

## Tiles

Tiles match Assembly's header search trigger (Baseplate `.button--subtle` with
`.icon--action`): square, `--color-border-muted` border, `--radius-tight`,
`--line-025` padding, `--touch-target-min` block size and a 1rem icon. Hover
uses `--color-subtle` and `--color-border`. Focus uses the shared focus ring.

- `icon-picker.css` copies the `.button--subtle` values for the trigger and
  tiles. Live Wires does not add `.button--subtle` itself.
- A ghost variant removes the resting border and keeps the hover fill. It is
  set on the picker with `.icon-picker--ghost`. Bordered is the default.
- The trigger uses the same tile style. `.icon-picker--ghost` applies to it too.
- The checked tile uses `--color-accent` with `--color-white` icon colour,
  matching the people picker's pressed buttons.
- The grid is `repeat(auto-fill, minmax(var(--touch-target-min), 1fr))` with
  `--line-025` gaps.
  Category sections render normally. `content-visibility: auto` made the
  checked icon's scroll position wrong on open.

## Icon set and subsets

A build script generates `public/icons/phosphor-bold.svg` (a `<symbol>` sprite)
and `public/icons/phosphor-catalog.json` (`name`, `tags`, `categories`) from the
`@phosphor-icons/core@2.1.1` devDependency. This matches Baseplate's vendored
version. Tiles reference the sprite with `<use href="...#{name}">`, so the full
set downloads once and stays cached. Subsets under about 100 icons may inline
their SVGs instead.

Consumers choose the set on the server by rendering only those radios:

- `icons`: a list of names.
- `categories`: Phosphor categories.
- `exclude`: names removed from either.

With no option the picker shows the full set. The server must validate the
submitted value against the same list. Baseplate's `icons.Lookup` already
rejects unknown names.

## Ownership

Live Wires supplies CSS, the sprite and catalog build, an optional
`/dist/icon-picker.js` entry (`createIconPicker`, like the combobox), a manual
page, a reference page and a page-only fixture script. The fixture loads the
full-set demo markup and saves nothing. The Templ component in `livewires-templ` and the
Baseplate wiring are separate work.

Use the class prefix `icon-picker` (`.icon-picker`, `.icon-picker-panel`,
`.icon-picker-grid`, `.icon-picker-tile`, `.icon-picker--ghost`). Import the
CSS through the main entry point.

## Verification cases

Check the manual and reference at 1280, 640, 375 and 320 pixels in light and
dark appearance, with bordered and ghost tiles. Verify the current icon is
checked and visible on open, focus returns to the trigger, search by name and
tag, the empty state, arrow-key movement after filtering, Escape, Remove,
Recent, the full set's scroll performance and a small inline subset. With
JavaScript disabled, verify the popover opens and the form submits the chosen
value. Accessibility snapshots verify names and roles. They do not replace a
screen reader pass.
