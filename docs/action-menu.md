# Optional action menus

Use action menus for a short list of commands on an application record. Keep a visible native button. A context-menu gesture is an optional shortcut, never the only way to reach the actions.

The reference is [action-menu.html](../public/reference/components/action-menu.html). The [manual](../public/manual/components/action-menu.html) explains the markup and keys. [Deterministic DOM checks](../public/reference/components/action-menu-tests.html) cover interactions and teardown; their synthetic events supplement real browser input.

## Load and attach

Load the regular Live Wires CSS and the optional `/dist/action-menu.css`. Import `createActionMenu` from `/dist/action-menu.js`. The default `/dist/main.js` does not import or register it.

```js
const menu = createActionMenu({ root, contextTarget: documentRow });
menu.open();
menu.open({ last: true });
menu.close(true); // Explicit focus return to a connected opener.
menu.dispose();  // Safe to repeat. Call before the application unmounts.
```

`contextTarget` is optional and must be a connected element in the same document. `state` reports `{ open, depth, disposed, supported }`. Duplicate attachment to the same root is rejected. `open()` returns false after disposal, for an unavailable trigger, on cancelled context intent, or without Popover API support. `close()` defaults to no focus return, so external dismissal does not steal focus.

## Server-owned markup

```html
<div class="dropdown" data-action-menu data-context-id="document-42">
  <button class="button trigger" data-menu-trigger type="button">Actions</button>
  <ul class="menu" id="document-42-actions" data-menu aria-label="Document actions">
    <li><button data-menu-action="duplicate" type="button">Duplicate</button></li>
    <li>
      <button data-menu-submenu type="button" aria-controls="document-42-export">Export</button>
      <ul class="menu" id="document-42-export" data-menu aria-label="Export format">
        <li><button data-menu-action="export-pdf" type="button">PDF</button></li>
      </ul>
    </li>
    <li><hr></li>
    <li><a data-menu-action="view" href="/documents/42">View document</a></li>
  </ul>
</div>
```

The stable root owns one direct trigger and one direct `ul.menu[data-menu]`. Menus need distinct stable IDs. Each list row holds one native action or submenu button. The submenu list is that button's sibling and matches `aria-controls`. Separators use an `hr` in a list item. Give every menu an accessible name.

Every descendant `data-menu` must belong to that direct menu's tree, and each child menu needs its controlling sibling button in a direct row of a validated menu; unrelated or uncontrolled menus are invalid. Attribute release and full cleanup restore authored values while preserving new values that differ from the adapter's last write. Applications own authored ARIA values and must keep them appropriate for their action. The `data-menu-ready` runtime hook remains adapter-owned and is cleared on disposal.

Buttons and links within menus must belong to validated action rows; nested controls and menu markers outside that tree are rejected. Controls that leave the tree release their adapter semantics. Ordinary controls elsewhere in the stable root keep native behavior and dismiss the menu when focused.

The adapter adds `role=menu`, item roles, local focus stops, manual popover state, and expanded state on actual opener buttons. It restores the original attributes on disposal. These are live server-rendered lists, not cloned portals or HTML-template hosts. A server may replace the list with new template output. Keep template output free of runtime attributes copied from an already-enhanced DOM.

Do not attach this adapter to form filters, navigation panels, details or dialogs. Fields, editable content and nested controls within action buttons are rejected before setup. Keep native details disclosure, native dialog focus and navigation link tab order where they already solve the need. An ordinary native link can be an action-menu item; a navigation panel containing arbitrary links is a different component.

## Events and application ownership

Both events bubble, are composed, and are cancelable. They report intent, never authorization or confirmation.

| Event | Detail | Timing and cancellation |
| --- | --- | --- |
| `lw:menu-context` | `{ trigger, contextTarget, contextId, source }` | Before opening. `source` is `button` or `context`. A listener can synchronously render authorized items. Cancel to skip opening; a context gesture keeps its native browser default. |
| `lw:menu-action` | `{ action, contextId, trigger, item }` | On native item activation, then the menu dismisses. Cancel to prevent the underlying link/form default when application code owns execution. Otherwise native default behavior continues. |

The context ID comes from the stable root's `data-context-id`, or the optional context target's ID data for context activation. It is captured at opening. Action detail comes from the activated item's `data-menu-action`. Treat all values as client input. Recheck authorization at the application's action boundary.

Each context activation refreshes intent, authorized markup and pointer placement, including when the menu is already open. Cancelling that refresh closes the previous stack and preserves the native context gesture. Context gestures on the menu's own padding or separators keep native behavior.

```js
root.addEventListener('lw:menu-action', (event) => {
  event.preventDefault();
  // Application-owned endpoint, authorization, request sequencing and feedback.
  requestDocumentAction(event.detail.action, event.detail.contextId);
});
```

The application supplies the authorized items, executes commands and owns persistence, confirmation, errors and retries. Hiding or disabling an item is presentation, not permission enforcement. No network call, transport runtime, Datastar adapter, global command registry or application rollout is included.

## Keyboard and pointer

Click/tap, Enter and Space open through the visible button. Up/Down opens at the last/first available item. Up/Down wraps among enabled visible items; Home/End and typeahead move focus. Forward arrow opens a submenu; reverse arrow or Escape returns to its opener. The forward key and preferred submenu side follow the opener's computed direction; the reverse key follows the active child menu's direction. Local direction overrides work independently of the root. Escape at the root returns to its button. Tab/Shift+Tab closes synchronously, focuses that button and allows native traversal. Opening never activates the first action implicitly.

Optional context activation checks the exposed composed event path, preserving native context menus for nested controls in open shadow trees. A component hiding controls inside a closed tree must stop its native context event before it reaches the adapter, or cancel `lw:menu-context`. Closed boundaries do not expose those controls to this adapter.

While open, named-slot changes, slot reassignment and native `slotchange` events refresh composed-ancestor availability. Moving into an unavailable slot closes all levels; moving back permits a later opening. Slot listeners follow the exposed composed trees and are removed on disposal.

Context activation is optional. Nested inputs, links, buttons and editable controls on the context target retain their native context menu. Mobile users use the visible button; no long-press recognizer is installed. Outside pointer activation or focus dismisses without stealing focus from the new control. Two instances have separate events, state and teardown.

Native popovers use the top layer, so a clipped parent does not crop the menu. Placement flips/clamps against the visual viewport, including its zoom offset; menus constrain size and scroll. The adapter owns placement; `.dropdown--end` and `.dropdown--up` do not set enhanced-menu alignment. Resize, scroll and relevant DOM changes refresh placement while open. Optional styles reuse `.dropdown` and `.menu`, stop movement transitions and keep a visible focus outline in forced colors. A decorative, direction-aware chevron identifies submenu openers without adding a spoken arrow to their label.

## Lifecycle

The application owns the stable root. Replacing live menu output closes old levels, restores their attributes and resolves the new connected nodes. Replacing a trigger closes and rebinds; removing the `data-action-menu` marker or a required trigger, duplicating a direct trigger/menu, or introducing incompatible markup disposes the adapter. Removing the root, including its containing shadow host, releases listeners, observer, animation frame and typeahead timer. Call `dispose()` before unmount when possible. Reattachment needs a new controller.

Automatic cleanup applies to supported, enhanced menus. Unsupported controllers attach no observers or listeners and keep native markup unchanged; the application must call `dispose()` before reattaching or unmounting them.

Mutation observation follows the root subtree and its actual composed ancestors. While open, an animation frame checks each menu anchor's position; placement recalculates when an anchor moves or a relevant update occurs. This also covers inline and shadow siblings without watching their subtrees. Unrelated descendant mutations do not fan out to every menu. Closing cancels tracking, movement refreshes ancestor ownership, and disposal releases every subscription.

In-place item updates refresh roles and available actions. If a focused item disappears or becomes unavailable while the menu owns focus, focus moves to an available item or the menu container. Removing popover state during a morph clears local open state before any native hide call. Cleanup never tries to focus a detached opener or leave a cloned overlay behind.

Availability follows composed ancestors, including assigned slots and shadow hosts. Hidden, inert or accessibility-hidden containers prevent opening and dismiss open levels. CSS-hidden actions are skipped during navigation; hidden triggers or menus preserve the native context menu. Relevant class/style updates and resize events refresh this state. Rendered visibility uses [native `checkVisibility`](https://developer.mozilla.org/en-US/docs/Web/API/Element/checkVisibility) when available, with a layout/style fallback.

Menu roots inside closed shadow trees keep native fallback markup and context behavior; the adapter does not enhance them. Open shadow trees and their composed ancestors support enhancement.

The adapter owns only the inline `left`, `top`, `max-width` and `max-height` placement declarations. Cleanup restores their original values and priorities while preserving later application changes to other declarations and custom properties.

Item focus uses native scrolling to reveal actions inside constrained menus. Returning focus to the root trigger preserves the page's scroll position.

Load the optional CSS even when enhancement is unavailable if these lists would otherwise inherit closed-dropdown styling. Before setup, without JavaScript, after disposal, or without Popover API, this CSS shows a readable inline list. Native application links and external-form buttons can provide executable fallback. A bare data-action button needs application code. There is no automatic initialization after later insertion: the application attaches and disposes controllers at its own update boundary.

## References and limits

This implementation is independently written. No Rocket or PD Rockets runtime/code was copied. Behavioral research reviewed Starbase at `c7ed1e76f8e7c867d32351d7045d6b66bf760b34`, especially [patches 0050, 0051, 0056, 0057 and 0058](https://github.com/zweiundeins/starbase/tree/c7ed1e76f8e7c867d32351d7045d6b66bf760b34/patches/pd-rockets): morph cleanup, actual item focus, Tab dismissal, button-only expanded state and semantic events. Any later copied code requires its original notices.

The source/reference base is Live Wires `6e0ff82c222c644fdda687a46bcd24816b7f7dc1`, with sortable producer merged at `059957aec14209abe25a85b43ccbc7ef11fe0750`. Relative-time, copy, loading and toast contracts and their fixtures are unchanged for Templ issue 10. The no-Rocket-adoption decision remains in force. No Baseplate or Templ implementation is included.
