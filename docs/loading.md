# Scoped loading

Loading visuals describe work in progress. A completed request does not prove that a change was saved. Keep confirmation, persistence, retry policy and write guarantees in the application.

Import `/dist/loading.js` only where needed. It adds no Datastar or Rocket runtime and is absent from `main.js`.

```html
<section id="editor">
  <button type="button" id="send">Send request</button>
  <div id="editor-content">
    <p>Your content stays usable.</p>
    <div id="editor-loading" class="loading" hidden aria-hidden="true">
      <div class="skeleton skeleton--text"></div>
    </div>
  </div>
  <p id="editor-status" role="status" aria-live="polite" aria-atomic="true"></p>
</section>
```

```js
import { createLoadingOperation } from '/dist/loading.js';

const loading = createLoadingOperation({
  root: document.querySelector('#editor'),
  content: '#editor-content', indicator: '#editor-loading', status: '#editor-status',
  delay: 150, minDuration: 300,
});

async function send(signal) {
  const request = loading.begin({ signal });
  try {
    const response = await fetch('/your-endpoint', { method: 'POST', signal });
    if (!response.ok) throw new Error('Request failed');
    // Interpret the application response here. Only its matching confirmation
    // can update a separate saved/failed/unknown result, never loading.state.
    request.finish(); // unknown save status
    return response;
  } catch (error) {
    request.finish(signal?.aborted ? 'cancelled' : 'failed');
    throw error;
  }
}

// When this owner unmounts: remove application listeners, abort its requests
// as appropriate, then release the loading operation.
loading.dispose();
```

The final disposal line illustrates teardown; call it on unmount, after using the operation.

| Contract | Behavior |
| --- | --- |
| Scope | One operation owns opaque request tokens. There is no global fetch interception. Register only finite requests affecting this region. |
| Timing | Defaults: 150 ms appearance delay, 300 ms minimum visible duration. Durations are finite, nonnegative milliseconds. Busy state starts immediately and ends with the last token. A visible tail is presentation only. |
| Overlap | Each `begin()` returns its own `finish(outcome)` token. The first request starts the delay. New overlapping requests do not reset it or hide the visual. |
| Results | `state.phase` is `idle`, `pending`, `unknown`, `failed`, `cancelled` or `disposed`. The batch retains failure over cancellation over unknown. A new batch resets that result. `saved` is rejected. |
| Cancellation | An AbortSignal ends its token even when the transport never settles. Abort is not a rollback guarantee: the server may have committed. Already-aborted signals start no token. |
| Completion | `finish()` means unknown; `finish('failed')` and `finish('cancelled')` are explicit. Duplicate/late finishes return false. No automatic timeout claims completion. |
| DOM updates | The stable root owns selector-bound targets. The observer rebinds replacement content/indicator/status after a DOM patch without resetting tokens. Removing an initiator has no effect. Removing a required target or the root disposes the operation. Reinserted roots need fresh setup. |
| Accessibility | Busy belongs to affected content. Put the polite, atomic status outside that content. Indicators are hidden from assistive technology. No controls are disabled and no focus moves. Motion stops with reduced motion; forced colors use a static outlined skeleton. |
| Ownership | Reserve the content's `aria-busy`, `data-loading-state`, the indicator's hidden state and the status text for this controller. Use a separate region for server-owned jobs. Do not attach two controllers to the same targets. |
| Cleanup | `dispose()` clears timers, abort subscriptions, observer and pending tokens. It hides the visual, clears announcements and restores the initial content busy attribute. It does not abort application work. The application cleans up its own transport/listeners. |

Server jobs can outlive an HTTP request. Render their status and `aria-busy` from authoritative job state in a separate region. Never use the job's event stream, connection lifetime or an unrelated patch to clear a local save token. A background SSE subscription must never enter this operation. Application-owned save confirmation should carry a matching command/version identity and be rendered separately.

## Optional Datastar bridge

`attachDatastarLoading(operation, { target, selectRequest })` subscribes to `datastar-fetch` on a stable target. It does not import Datastar. The host must normalize the installed runtime's lifecycle into `{ id, phase, signal?, background? }`, or return `null` for unrelated events. Use a unique identity for each finite invocation, retained after element removal; an element, URL or HTTP method alone is insufficient for overlap. Keep that classification stable through terminal events.

```js
import { attachDatastarLoading } from '/dist/loading.js';

const disconnect = attachDatastarLoading(loading, {
  target: document,
  selectRequest(event) {
    // Application-owned mapping from your installed Datastar lifecycle.
    // Snapshot operation membership and a unique invocation ID at start.
    return editorRequestLifecycle.lookup(event) ?? null;
  },
});

// On unmount, in this order:
disconnect();
loading.dispose();
```

The normalized phases are `started`, `finished`, `failed` and `cancelled`. Duplicate starts and unknown terminals are ignored. `finished` becomes unknown save status. Intermediate `error`/`retrying` events leave tokens pending: the host maps only a final failure to `failed`. Pass the invocation's AbortSignal so cleanup/cancellation settles locally even if no terminal event reaches the document. Disconnection cancels its tracked tokens and releases subscriptions; dispose the operation too to remove any minimum-duration tail.

Datastar currently documents fetch lifecycle notifications and request cancellation/retry options in its [actions reference](https://data-star.dev/reference/actions). That page does not establish a universal per-invocation identity contract. Verify the installed edition's event detail and terminal delivery, including detached initiators, before writing the host mapping. This bridge deliberately requires that mapping rather than guessing from an element or raw global events. The reference checks use normalized synthetic events; they are not real Datastar/Go transport or durable save proof.

Examples: `/reference/components/loading.html` and `/manual/components/loading.html`. DOM checks: `/reference/components/loading-tests.html`. Node checks: `npm test`. Browser cases need the maintained source-bound preview; opening the check page is separate from proving its result.
