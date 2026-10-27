# Mention suggestions contract

This records the presentation hooks and the behavior contract for an inline
people suggestion list in a rich text editor. It is the producer step for
[livewires-templ#35](https://github.com/Design-Machines-Studio/livewires-templ/issues/35).
Chat beta 1 (assembly-chat#6) is the first consumer. The Templ component and Baseplate's
Milkdown integration adopt these hooks; they are the public surface.

Interaction references, not contracts: the Discussions prototype (dm006) and
DISC-004 in `assembly/tests/ux/tasks/discussions/mentions-references.md` at `db424e1`.

## Decisions

- **Combobox variant.** The listbox, option, active, hover, disabled, status and
  forced-colors option rules are shared with `[data-combobox]` through
  `:is([data-combobox], [data-mention-suggestions])`. The selectors keep their
  previous specificity, so combobox output is unchanged. The variant ships in the
  optional `/dist/combobox.css`, not in `main.css`. Consumers load that stylesheet.
  In Vite development, import `/dist/combobox.js` to inject it.
- **The editor stays a textbox.** ARIA 1.2 does not allow `aria-expanded` on
  `role="textbox"`, and axe reports it (`aria-allowed-attr`). Giving a multi-line rich
  text editor `role="combobox"` would drop its multi-line textbox semantics. The editor
  keeps `role="textbox"` and `aria-multiline="true"`. This deliberately leaves out
  the `aria-expanded` attribute named in the request. The status count and the active
  descendant convey the open state.
- **No popover.** A closed popover is `display: none`, which would unmount the
  status region. The root is `position: fixed` and stays mounted.
- **No controller in `/dist`.** The manual uses a page-only demonstration script.
  Live Wires ships CSS hooks and this written contract.

The popup uses `rounded scheme-default` with no border. The active option uses
`rounded-sm scheme-subtle`; move both classes with `data-active` when selection changes.

## Anatomy

```html
<!-- Editor (Baseplate/Milkdown owns this element). -->
<div contenteditable="true" role="textbox" aria-multiline="true" aria-label="Message"
     aria-autocomplete="list" aria-haspopup="listbox" aria-controls="mentions-list"
     aria-activedescendant="mentions-list-ada">…</div>

<!-- Suggestion root: mounted once, outside the editor, for the editor's lifetime. -->
<div class="rounded scheme-default" data-mention-suggestions data-state="ready" dir="ltr"
     style="--mention-suggestions-top: 212px; --mention-suggestions-left: 48px">
  <ul role="listbox" id="mentions-list" aria-label="People">
    <li class="rounded-sm scheme-subtle" role="option" id="mentions-list-ada" aria-selected="true" data-active>
      <span class="avatar" aria-hidden="true"><span class="initials">AO</span></span>
      <span>
        <span data-mention-name>Ada Okafor</span>
        <span data-mention-detail>Finance circle</span>
      </span>
    </li>
    <li role="option" id="mentions-list-sam-2" aria-selected="false" aria-disabled="true">…</li>
  </ul>
  <p role="status" aria-atomic="true">2 people found</p>
</div>
```

| Hook | Where | Meaning |
| --- | --- | --- |
| `data-mention-suggestions` | Root | Surface, position, size and states |
| `data-state` | Root | `closed`, `loading`, `ready`, `empty` or `error` |
| `--mention-suggestions-top` | Root | Viewport px of the list's top edge (below the caret) |
| `--mention-suggestions-bottom` | Root | Viewport px from the bottom (above the caret). Set top or bottom, not both |
| `--mention-suggestions-left` | Root | Physical left edge in viewport px, already clamped |
| `--mention-suggestions-max-block` | Root | Optional height limit for the available space. Default 8 lines |
| `role="listbox"` `aria-label` `id` | List | One per root. Stable id |
| `aria-busy="true"` | List | Stale rows retained while a new search loads |
| `role="option"` `id` | Row | Unique, stable id built from the caller's person ID |
| `data-active` + `aria-selected="true"` + `rounded-sm scheme-subtle` | Row | The active row. Move both classes with `data-active`; others are `aria-selected="false"` without those classes |
| `aria-disabled="true"` | Row | Shown but not selectable. Skipped by arrows |
| `.avatar` `aria-hidden="true"` | Row | Optional decorative avatar (image `alt=""` or `.initials`), default size |
| `data-mention-name` | Row | Person name. Add `truncate` to truncate |
| `data-mention-detail` | Row | Optional caller-supplied secondary identifier |
| `role="status"` `aria-atomic="true"` | Root | The single polite live region |

## States

| `data-state` | Listbox | Status (visible?) |
| --- | --- | --- |
| `closed` | `hidden`, no rows | Empty. Root is clipped out of sight but mounted |
| `loading` | `hidden`, or retained stale rows with `aria-busy="true"` | “Searching people…” (visible). Enter this state only when a reply takes longer than a short delay (about 400 ms) |
| `ready` | Rows, first enabled row active | Count, e.g. “5 people found” (visually hidden) |
| `empty` | `hidden` | “No matching people” (visible) |
| `error` | `hidden` | Caller's retry message (visible, error colour) |

Stale rows are dimmed and have no active row. A reply for an older query is
discarded by the consumer before rendering. Click/tap on a stale row may still
select it because the person is named explicitly. Wording above is a default;
callers may localize it.

## ARIA and focus contract

**Focus.** DOM focus stays in the editor from trigger to insertion. The root, list
and rows are never focusable and never receive focus.

**Editor attributes** (on the `contenteditable` element):

| Attribute | When |
| --- | --- |
| `role="textbox"` `aria-multiline="true"` plus an accessible name | Always (editor's own semantics) |
| `aria-autocomplete="list"` | While suggestions are attached to the editor |
| `aria-haspopup="listbox"` | While attached |
| `aria-controls="<listbox id>"` | While attached |
| `aria-activedescendant="<option id>"` | Only while open with an active row. Removed when closed, loading, empty, error or stale |
| `aria-expanded` | Never (not allowed on textbox) |

**Listbox.** `role="listbox"`, `aria-label` (for example “People”), stable `id`.

**Options.** `role="option"`, caller-derived stable unique `id` (no
`crypto.randomUUID`; it is missing on insecure development origins). The active row
has `aria-selected="true"` and `data-active`. `aria-disabled="true"` where needed.
Rows are never announced one by one; the active descendant conveys them.

**Keys.** The editor's keydown handler (in Baseplate, the highest-priority
ProseMirror keymap entry) handles every key. The popup never receives key events.
While composing (`event.isComposing`), all keys pass through.

| Key while open | With an active row | Without one (loading, stale, empty, error) |
| --- | --- | --- |
| ArrowDown / ArrowUp | Move active, wrap, skip `aria-disabled`; consumed | Stale rows shown: consumed, no change. No rows shown: pass through (moving the caret off the token closes the list) |
| Enter | Insert the person; consumed | Close; consumed |
| Enter with Shift, Ctrl, Meta or Alt | Close without inserting; consumed | Same |
| Tab | Insert the person; consumed | Close; not consumed (Tab proceeds) |
| Shift+Tab | Close without inserting; not consumed (focus moves back) | Same |
| Escape | Close; consumed; stay closed for this token | Same |
| Anything else | Passes through to the editor | Same |

“Consumed” means the editor keydown calls `preventDefault()` (a ProseMirror handler
returns `true`). **Enter never submits while the list is open.** A contenteditable
never submits a form on its own; the risk is the consumer's Enter-to-send handler.
Every send or submit handler (Chat Enter-to-send, a form keydown that calls
`requestSubmit()`) must ignore Enter when `event.defaultPrevented` or
`event.isComposing` is true, or `event.keyCode === 229` (legacy composition events).

After Escape, typing continues as ordinary text. The list reopens only for a new
trigger, or after the caret leaves and returns to a token (Baseplate owns token rules).

**Pointer and touch.** The root cancels `mousedown` so the editor keeps focus and
selection. Selection happens on `click`, which mouse, touch and pen all fire; a touch
that scrolls the list fires no click. Hover is visual only (shaded background) and
never moves the active row. Inactive hover uses a tint halfway between the root
surface and its subtle colour. The active row uses the subtle scheme and tight rounding,
without a border or outline. Forced colors use Highlight for the active row and
Canvas for a hovered inactive row so they remain distinct.

**Status.** Exactly one `role="status"` region with `aria-atomic="true"`, inside the
root and mounted for the editor's lifetime. Write to it only when the message text
changes: loading, result count, empty, error. Write the loading message only after a
short delay (about 400 ms) with no reply, so fast typing announces counts rather than
“Searching” before every count. Typing that keeps the same message writes nothing.
Clear it on close. While the first reply for a new token is pending and the delay has
not passed, the root may stay `closed`; while it is `closed`, every key passes through
to the editor as if no list existed.

**Scroll to active.** When the active row changes, adjust only the list's
`scrollTop` (nearest edge). Do not call `scrollIntoView`, which can scroll the page.
The list has `overscroll-behavior: contain` and instant scrolling, so key repeat
keeps the active row visible and wheel scrolling does not chain to the page.

## Positioning

| Live Wires CSS | Consumer script |
| --- | --- |
| `position: fixed`, z-index, `margin: 0` | Caret rectangle from the trigger position in the editor |
| Width `min(12 lines, 100vw − 1 line)` | Choose below or above: below when it fits or has more room |
| Default max height 8 lines, internal scroll | Set `--mention-suggestions-top` (below) or `--mention-suggestions-bottom` (above) |
| Row layout, wrap or truncate | Set `--mention-suggestions-max-block` to the space on that side |
| Motion: opacity fade only under `prefers-reduced-motion: no-preference`; geometry never transitions, so measurements are current | Clamp `--mention-suggestions-left` inside the viewport and the editor's nearest scroll container |
| | In RTL, align the root's right edge with the caret (`left = caret.right − width`) and set `dir` on the root |
| | Reposition on scroll and resize while open |
| | Always set `--mention-suggestions-left`; the CSS fallback is a left-edge default only |

Mount the root outside the `contenteditable`, inside the same dialog or top-layer
context as the editor, and outside any ancestor with `transform`, `filter`,
`will-change: transform` or `contain: layout/paint`; these make `position: fixed`
relative to that ancestor. Live Wires' own `container-type` on `body`, `main`,
`article` and `.section` does not affect it (checked in Chromium). The width is fixed,
so clamping does not need to measure content.

## Content rules

- Name is required. Avatar and detail are optional.
- `data-mention-detail` carries only a real identifier the caller supplies (circle,
  role, email). Never derive an `@handle` from a name or invent text.
- Duplicate names are told apart only by supplied details. Without details they look alike.
- Long names wrap at spaces and hyphens, then anywhere. Truncation is opt-in with the
  `truncate` utility; the full name stays in the DOM and the option's accessible name.
- Avatars are decorative (`aria-hidden="true"`, images `alt=""`).

## Consumer boundary

| Owner | Responsibility |
| --- | --- |
| Live Wires | CSS hooks, this contract, manual/reference examples |
| livewires-templ (#35, next task) | Templ markup for the root and rows, stable ids, documentation |
| Baseplate | Milkdown trigger, token rules, keymap, caret geometry, insertion, serialization |
| Chat | Access filtering, search transport, request identity, acceptance |

Live Wires owns no directory lookup, filtering, permissions, persistence or
notifications. Callers supply results, stable IDs and the selection callback.

DISC-004's `[[` record references fit the same rows (title in `data-mention-name`,
type in `data-mention-detail`, no avatar) with zero extra CSS. They are out of
scope here; give that list its own `aria-label`.

## Verification

- `npm test` and `npm run build`.
- `/reference/components/mention-suggestions-tests.html`: deterministic real-DOM
  checks of the demonstration script against this contract.
- `tools/check-mention-suggestions-browser.mjs`: host Playwright harness. It runs those
  checks, drives real keyboard and pointer input on the manual, checks combobox computed
  styles against the base stylesheet, and captures the viewport/scheme matrix.

```sh
LW_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
LW_MENTION_URL=http://localhost:3000 \
LW_MENTION_EVIDENCE=/absolute/owned/evidence/path \
node tools/check-mention-suggestions-browser.mjs
```

Accessibility-tree and DOM checks are not screen-reader testing. Screen-reader
support for `aria-activedescendant` on `contenteditable` varies (VoiceOver in
particular) and is not established here. Forced-colors and touch emulation are not
platform acceptance.
