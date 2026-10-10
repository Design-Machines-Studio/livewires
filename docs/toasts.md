# Toast regions

Toast visuals work with native HTML. The optional region behavior adds local dismissal, timing and a bounded stack. Import `/dist/toast-region.js` only where needed. It does not load Rocket, Datastar or an application adapter, and is absent from `main.js`.

```html
<section data-toast-region aria-label="Editor feedback">
  <div class="stack stack-compact" data-toast-list>
    <div class="toast toast--success" data-toast-id="save-42:confirmed"
         data-toast-kind="success" data-toast-duration="6000">
      <p class="content" data-toast-message>Your changes were saved.</p>
      <button class="close" data-toast-dismiss type="button"
              aria-label="Dismiss saved message">&times;</button>
    </div>
  </div>
</section>
```

```js
import { createToastRegion } from '/dist/toast-region.js';

const feedback = createToastRegion({
  root: document.querySelector('[data-toast-region]'),
  maxVisible: 3,
});

// On this view's unmount, release its behavior. This does not cancel requests.
// feedback.dispose();
```

The section is the stable ownership boundary. Its `data-toast-list` may be patched or replaced; the controller reads native descendant toasts after each completed DOM mutation batch. It does not render message text, clone actions or dispatch requests. Without JavaScript, every message remains readable. Provide an application-owned alternative if a fallback close button must work without JavaScript.

| Contract | Behavior |
| --- | --- |
| Identity | A nonempty `data-toast-id` identifies one immutable feedback occurrence within one controller lifetime. It is separate from an HTML `id`. Two regions may use the same value independently. Do not use the current node, array position, URL or message text as identity. |
| Updates | Repeating an occurrence or replacing its node preserves dismissal, expiry, announcement history and remaining duration. Same-ID content/configuration changes do not create a new event or restart time. An added action upgrades that occurrence to sticky. Use a new ID for a meaningful new outcome. |
| Duplicates | The first node in DOM order is canonical. Further nodes with that ID are hidden and emit an invalid-message diagnostic. Removing the first promotes the next without a new announcement or timer. Duplicate dismiss calls return false. |
| Removal/reinsertion | Removal suspends the timer. Reinsertion resumes the remaining active time and retains any dismissal/expiry. It does not announce again. Removing and reinserting within one mutation batch counts as a patch, without reset. |
| Intentional reuse | Prefer a new occurrence ID. To reuse an old ID deliberately, remove every node carrying it, allow the observer to reconcile (or call `refresh()`), then call `forget(id)`. It throws while a canonical occurrence remains mounted. A forgotten ID can then start fresh and announce again. |
| Retained state | Removed/dismissed/expired IDs remain as tombstones until `forget()` or `dispose()`. This is local view state, not durable persistence or a cross-navigation notification store. Long-lived producers should release absent completed IDs deliberately; no automatic eviction can safely distinguish intentional replay from an unrelated patch. |
| Timing | `data-toast-duration` opts into a finite positive duration in milliseconds. No duration is sticky. An occurrence's initial duration is retained. A queued occurrence starts timing only when admitted to the active stack; opening the backlog does not start its timer. |
| Sticky feedback | `data-toast-kind="pending"`, `data-toast-kind="error"`, `.toast--error` and toasts with enabled native actions remain sticky regardless of supplied duration. The dismiss button is excluded from action detection. Errors and actionable feedback must remain available until explicit dismissal/application removal. |
| Pause | Mouse hover and focus within a toast pause independently. Timing resumes only after both end, with the exact remainder. No timer or incoming message can hide an active focused control. |
| Stacking | `maxVisible` defaults to 3 and must be a positive integer. Admission follows first-seen order. Further messages queue; no message is evicted to make room. A generated native button shows the backlog count and queued error count. It reveals queued messages in the same bounded scrolling list, including actions/errors behind sticky messages. These remain queued for timing. The review button toggles the backlog and has `aria-expanded`. |
| Dismissal | A native `button[data-toast-dismiss]` must have `type="button"` and an accessible label. Enter/Space activate it. Escape dismisses only the toast containing keyboard focus, respecting a previously prevented event. Arrival/expiry never move focus. Explicit dismissal recovers focus to a remaining dismiss button, a native `[data-toast-focus-return]` target within the root, or the region itself. |
| Announcements | The controller creates separate stable polite `role="status"` and assertive `role="alert"` nodes outside the patched list. Ordinary/pending/confirmed feedback is polite; errors are assertive. Each occurrence announces once, including queued feedback. Use `data-toast-message` or `.content` for announcement text. Do not put the whole stack or an ancestor in a live region, or add nested live regions to message content. The controller suppresses toast-level `role`/`aria-live` while attached and restores them at teardown. |
| Ownership | Reserve each toast's `hidden`, `data-toast-state`, `role` and `aria-live` for the controller. Reserve the list's `data-toast-reviewing`, and preserve the generated review/announcement nodes. The application owns content, IDs, kind, duration and action listeners. Nested regions are independent. Never attach two controllers to one root. |
| Focused DOM boundary | The application must preserve a focused action subtree during its own updates. The controller never replaces/reparents that subtree. It cannot prevent an application patch from deleting a focused node; server morphing/focus preservation belongs to that application. Replacing an unfocused toast or list is supported. |
| Teardown | `dispose()` clears timers, disconnects the observer, removes delegated listeners/generated controls/live nodes, restores owned attributes and releases the root. Removing the root, a shadow host, the required list or generated controller nodes also disposes it. Root reinsertion needs fresh setup and starts a new identity scope. Disposal does not abort requests or remove application listeners. |
| Motion | Existing entrance styling remains. Reduced-motion preferences disable toast entrance/dismissal animation. No delayed animation cleanup controls dismissal or focus. |

`state` is an inspectable snapshot: `disposed` and `messages`, whose rows contain `id`, `present`, `dismissed`, `expired`, `sticky`, `remaining`, `paused`, `active` and `queued`. `dismiss(id)` performs an explicit local dismissal and returns whether it changed state. `refresh()` synchronously reconciles a host patch when necessary. `forget(id)` returns whether an absent occurrence was released. These calls after disposal make no new state.

Informational bubbling events are `lw-toast-dismiss` (`{id, reason}`), `lw-toast-announce` (`{ids, priority, text}`) and `lw-toast-invalid` (`{id, reason}`). They are observations, not save commands or persisted dismissal acknowledgements. Invalid IDs/durations keep native markup readable and are diagnosed; they are outside managed timing/stacking. Keep valid messages on the documented contract. The optional `clock` seam accepts `now`, `setTimeout` and `clearTimeout` functions for deterministic checks; normal callers use monotonic browser time.

## Pending is not saved

Use distinct occurrence IDs for distinct facts, for example `save-42:pending`, `save-42:unknown`, `save-42:failed` and `save-42:confirmed`. Loading request completion reports an unknown outcome. Only a matching application confirmation may render “saved.” HTTP completion, an unrelated patch, a retry attempt or removal of a pending toast does not confirm persistence.

The application removes/replaces pending feedback when its own command/result contract permits it. It owns permissions, persistence, cancellation, request ordering and recovery actions. A recovery button may open an editor or request a retry through application code; the region never chooses that policy. [Scoped loading](loading.md) supplies the preceding optional loading contract. Baseplate [#1151](https://github.com/Design-Machines-Studio/assembly-baseplate/issues/1151), [#1156](https://github.com/Design-Machines-Studio/assembly-baseplate/issues/1156) and [#1157](https://github.com/Design-Machines-Studio/assembly-baseplate/issues/1157) retain their application scopes.

The smallest contract for later CSS-free Templ wrappers is a stable labeled native region, its `data-toast-list`, native toast children with occurrence IDs/kind/optional duration, message text and a separate native dismiss button. Classes remain the existing Live Wires visual pattern. No Templ wrapper is implemented here.

Examples: `/reference/components/toasts.html` and `/manual/components/toasts.html`. The manual fixture explicitly simulates pending, unknown, confirmed success, failure and recovery; it is not real save proof. `npm test` runs deterministic state checks. `/reference/components/toasts-tests.html` runs native DOM lifecycle checks with fake time. Physical pointer/keyboard, responsive layout and reduced motion need source-bound browser evidence. DOM announcement checks are not proof of screen-reader output.
