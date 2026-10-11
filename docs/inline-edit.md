# Inline editing

Inline editing adds an optional interaction around a native text form. Link `/dist/inline-edit.css` alongside `/dist/main.css`, then import `/dist/inline-edit.js` only where needed; both optional assets are absent from the default bundle. It adds no Rocket, Datastar or persistence adapter. Applications own validation, authorization, durable saving, conflict resolution and retry policy.

```html
<section data-inline-edit data-context-id="opaque-record-key" class="stack">
  <h2 data-inline-edit-value>Working title</h2>
  <details data-inline-edit-panel>
    <summary data-inline-edit-trigger>Edit title</summary>
    <form data-inline-edit-form action="/records/42/title" method="post" class="stack">
      <!-- Supply your application's CSRF field and native endpoint here. -->
      <label for="title-input">Title</label>
      <input id="title-input" name="title" type="text" value="Working title" data-inline-edit-input>
      <p id="title-error" data-inline-edit-error role="alert"></p>
      <div class="cluster">
        <button class="button" type="submit" data-inline-edit-save>Save title</button>
        <button class="button button--ghost" type="button" data-inline-edit-cancel>Cancel editing</button>
      </div>
    </form>
  </details>
  <p data-inline-edit-status role="status" aria-live="polite" aria-atomic="true"></p>
</section>
```

```js
import { createInlineEditor } from '/dist/inline-edit.js';
const root = document.querySelector('[data-inline-edit]');
const editor = createInlineEditor({ root });

root.addEventListener('lw-inline-edit-commit', async ({ detail }) => {
  const { contextId, editId, requestId, value, original } = detail;
  // Application code sends the attempted value and its concurrency precondition.
  // Interpret the response; HTTP completion alone is not confirmation.
  const result = await applicationSave({ contextId, value, original });
  editor.applyResult({ contextId, editId, requestId, ...result });
});
// On unmount: remove the application's listener/transport work, then dispose.
// editor.dispose();
```

`applicationSave` above is application code, not an exported API. It returns `{ outcome: 'confirmed', value: authoritativeText }`, `{ outcome: 'rejected', message }`, or `{ outcome: 'unknown', message? }`. Catch transport errors in the application and map them to unknown unless it can prove rejection. Unknown remains eligible for a later matching confirmed/rejected result. A lost connection does not prove that the server changed nothing.

## Events and results

Events bubble and are composed. They are commands handed to the application, not persistence receipts.

| Event | Detail | Meaning |
| --- | --- | --- |
| `lw-inline-edit-request` | `{ contextId, editId }` | Open a local edit lifetime. |
| `lw-inline-edit-commit` | `{ contextId, editId, requestId, value, original }` | Validate/save this exact attempted text against the value at edit entry. |
| `lw-inline-edit-cancel` | `{ contextId, editId, requestId, value, reason, uncertain }` | End local editing/observation. `reason` is cancel, escape or unchanged. Pending/unknown cancellation reports `uncertain: true`; it never guarantees rollback. |

`contextId` is an application-supplied nonempty opaque string. Keep it immutable for one controller lifetime; dispose and recreate the controller when changing records. It is never parsed into an endpoint or permission. `editId` and `requestId` are fresh opaque random IDs for the edit lifetime and attempt. They use `crypto.getRandomValues`, including on ordinary HTTP development hosts, and are not authorization or CSRF tokens. Every application result must match all three IDs. Foreign, duplicate-terminal, old-attempt, cancelled and disposed results return false without changing state. Remounting creates a new lifetime even for the same context. The application must also reject stale persistence writes; local response filtering cannot enforce server ordering or resolve conflicts.

`applyResult(result)` accepts only matching pending/unknown results. It requires an explicit string value for confirmation, allowing application normalization. Rejection retains the exact entered value and restores editing. It does not trim or apply validation rules. `updateConfirmed(text)` applies an application-owned external value while retaining an active draft and its original precondition. It does not settle pending work. Use this method for external updates; do not patch the displayed value or active input directly.

## Compact variant

Use `data-inline-edit="compact"` for a value and Edit link on one row. The controller hides the value/link while editing and shows a stable panel with the small input, Save and ghost Cancel. It restores the value/link on save confirmation or cancellation. The existing disclosure variant remains supported.

```html
<section data-inline-edit="compact" data-context-id="title-a" class="stack">
  <div class="cluster cluster-compact items-baseline">
    <span data-inline-edit-value>Community gathering</span>
    <a class="button button--small button--ghost button--accent" href="#title-a-panel" data-inline-edit-trigger aria-label="Edit first title">Edit</a>
    <div id="title-a-panel" data-inline-edit-panel>
      <form data-inline-edit-form action="/records/42/title" method="post" class="cluster cluster-compact">
        <label class="visually-hidden" for="title-a-input">First title</label>
        <input id="title-a-input" name="title-a" type="text" value="Community gathering" data-inline-edit-input>
        <button class="button button--small" type="submit" data-inline-edit-save>Save</button>
        <button class="button button--small button--ghost" type="button" data-inline-edit-cancel>Cancel</button>
        <p id="title-a-error" data-inline-edit-error role="alert"></p>
      </form>
    </div>
  </div>
  <p data-inline-edit-status role="status" aria-live="polite" aria-atomic="true"></p>
</section>
```

Use `items-baseline` on the value/Edit cluster to align their text baselines despite different font sizes. Keep the panel ID and Edit link target matched. Keep the value and Edit link outside the panel. The labeled field uses the existing `visually-hidden` utility; Save and Cancel use `button--small`. Use the shared `button--ghost` variant for Cancel. Add `button--accent` to a ghost button for accent text, as on Edit; accent text is mixed toward the scheme foreground to maintain contrast. Hidden state belongs to the controller, and the input remains the same node through every edit. Do not add initial `hidden` attributes: without JavaScript the Edit link jumps to the visible native form. Supply an application cancel/back link for native cancellation. The compact link receives enhanced `aria-controls` and `aria-expanded` attributes. Its confirmed value and trigger return before focus is restored.

## Keys, blur and focus

- Click the visible Edit link or summary, or use Enter, Space or F2 while it has focus. No double press is required.
- Enter in the single-line input requests one commit. An unchanged value ends editing with an unchanged cancel event and no save request. Holding Enter cannot open and immediately commit the editor.
- Escape or Cancel ends local editing. Repeated keydowns do nothing. Composition events, `isComposing`, legacy key code 229 and the immediate composition-end task guard prevent IME confirmation from also saving. Enter must be pressed again after composition ends.
- **Blur retains the draft and emits no commit/cancel event.** Tab, pointer focus changes, window switches and DOM focus loss never save. Use the visible Save/Cancel controls explicitly.
- Pending and unknown keep the field visible and read-only; Save is disabled. Cancel remains available. Unknown has no automatic timeout or retry. Rejection allows editing and an explicit new attempt.
- Save confirmation and cancel return focus to Edit only if focus is still in that editor's form/trigger. A delayed result does not steal focus from another control. Rejection leaves focus and selection where the user put them.

The phases are `confirmed`, `editing`, `pending`, `rejected`, `unknown` and `disposed`. Confirmed means the component holds an application-confirmed value, including its initial server-rendered value. After cancellation, it displays the last known confirmed value; it does not claim a cancelled in-flight save failed. Its status says “Stopped waiting. The save may still have applied.” after pending/unknown cancellation. Status text, error text, the input's error description, read-only state and Save disabled state belong to the controller.

## Stable DOM boundary and lifecycle

Keep the root and all required `data-inline-edit-*` nodes stable for the controller lifetime. Unrelated sibling/subtree updates are supported. The controller never replaces, reparents or refocuses an active input; it avoids writing an unchanged `.value`, preserving native selection. The application must preserve the focused input node, its live value and selection during its own morphs. Stable HTML IDs alone do not preserve node identity. Do not replace the editor subtree to apply unrelated updates.

Removing/replacing a required node, removing the root, or removing a containing shadow host disposes the controller. The observer checks the settled mutation batch; same-batch moves that retain the nodes remain usable. Public calls also check connectivity before applying results, so removal rejects a response even before the observer runs. Reinsertion needs fresh setup. Draft retention across navigation or intentional editor replacement is application-owned.

`state` is a read-only snapshot. `request()`, `commit()`, `cancel()`, `applyResult()`, `updateConfirmed()` and `refresh()` report whether they acted. `dispose()` removes listeners, observers and composition timers and restores owned attributes. It does not abort application requests. One controller may own a root at a time. Reserve the root state/enhanced attributes, details open state or compact hidden/trigger ARIA state, input value/read-only/invalid/description, Save disabled state, confirmed display, and status/error text for this controller. Keep required nodes distinct and do not nest editors.

## Native fallback and examples

Without the optional module, compact markup shows a labeled native form and the details/summary opens a labeled native form and submits to the application's endpoint. The application supplies CSRF protection, validation errors and a native cancel/back link. The enhanced Cancel button is optional fallback convenience; it needs application code to work without the module. The kit does not invent an endpoint or save without JavaScript.

Reference: `/reference/components/inline-edit.html`. Manual: `/manual/components/inline-edit.html`. Both contain a compact editor and an independent disclosure editor, fixed delay/held responses, rejection, uncertain completion, explicit confirmation/recovery, intervening updates and replay of old responses. They simulate application results, not durable saving. The native example submits back to the same page and explicitly makes no persistence claim. `/reference/components/inline-edit-tests.html` exercises real DOM lifecycle and simulated composition. `npm test` supplies state and lifecycle checks. Real IME input and screen-reader announcements require separate human testing.

Behavior research inspected Starbase at [c7ed1e76](https://github.com/zweiundeins/starbase/tree/c7ed1e76f8e7c867d32351d7045d6b66bf760b34/patches/pd-rockets), patches 0070 (Enter/F2 entry), 0071 (auto-repeat) and 0072 (settled blur and entry-value snapshot). This implementation is original and uses blur retention instead of upstream blur saving. No upstream code or runtime is copied; copied code would require its Beer-Ware notice.
