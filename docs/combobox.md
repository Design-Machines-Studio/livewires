# Optional single-select combobox

Use ordinary native selects for short lists. Long choice lists can explicitly
load `/dist/combobox.css` and import `createCombobox` from `/dist/combobox.js`.
Neither asset is part of the default main bundle. Vite imports the source CSS
through the optional entry and suppresses stale linked build CSS in development.

```html
<div class="field" data-combobox>
  <label for="zone">Timezone override</label>
  <select id="zone" name="interface_timezone" aria-describedby="zone-help">
    <option value="" selected>Use organization default</option>
    <option value="Asia/Makassar">Asia/Makassar</option>
  </select>
  <p class="hint" id="zone-help">Choose your timezone or use the default.</p>
</div>
```

```js
import { createCombobox } from '/dist/combobox.js';
const control = createCombobox({ root, mode: 'remote' });
root.addEventListener('combobox-query', async ({ detail }) => {
  try {
    // The application supplies transport, authorization, filtering and retry.
    const items = await searchAllowedChoices(detail.query);
    control.applyResults({ ...detail, items });
  } catch {
    control.applyResults({ ...detail, items: [], error: 'Please try again.' });
  }
});
```

`searchAllowedChoices` above is an application function, not a supplied API.
There is no fetch, URL, Datastar/Rocket dependency, save command or backend in
the reusable module. Single selection only; `multiple` and list-size selects
are rejected before their native fallback is modified.

## Evidenced consumer candidate

The examples use Baseplate's account **Timezone override** field,
`interface_timezone`, from
[`internal/baseplate/account/pages/interface.templ`](https://github.com/Design-Machines-Studio/assembly-baseplate/blob/6accb8a27c746d1cbc3e19a734d8303b8e9191b0/internal/baseplate/account/pages/interface.templ).
Baseplate account/settings code owns the field and validation;
[`internal/timezone/options.go`](https://github.com/Design-Machines-Studio/assembly-baseplate/blob/6accb8a27c746d1cbc3e19a734d8303b8e9191b0/internal/timezone/options.go)
owns its curated list, `BuildOverrideOptions`, retention of a saved non-curated
zone, and `Validate`. The empty string means “use organization default”.
It is valid for this optional field. A required fixture instead uses an empty
placeholder and requires an explicit nonempty choice.

This issue does not migrate that consumer, change its save flow, or claim that
it needs a timezone-search endpoint. The remote reference is a portable
application-owned simulation over public timezone choices. Baseplate #1136
continues to own directory/search semantics; its query matching is not inferred
from this browser's local accent folding.

## Form and value contract

One real select owns the submitted `name`, value, `required`, custom validity,
`disabled`, fieldset rules, `form` association and reset default. The search
input has **no name**. Typing and highlighting do not change the select or emit
its value events. Committing a choice emits native bubbling `input` and `change`
on the select, then bubbling/composed `combobox-change` on the root with
`{name, value, label}`. Observe native select events for application bindings.

The original select stays visible until enhancement validates and attaches.
It remains the successful form control after enhancement. A failed/missing
module or disabled JavaScript leaves useful native options, labels, required
validation and submission. No formdata shim or hidden-input substitute exists.
An enhanced select's invalid event blocks native submission, focuses its search
input and exposes the browser validation message in the status region. Labels
activate the generated input; their original association is restored on disposal.
Help/error references are carried through. Native fieldset first-legend rules
apply to the backing select and its generated control.

Reset restores the native initial default choice, clears the query, closes the
list and invalidates late responses. Cancelled reset preserves the value.
The application owns custom validation: browsers retain `setCustomValidity`
across reset, and the controller does too.

```js
select.setCustomValidity('The saved value was rejected by the application.');
control.refresh(); // Keep the chosen value/label visible; block submission.
// Only the application decides when the error is resolved.
select.setCustomValidity('');
control.refresh();
```

Search results never confirm or reject a save. Saved-value request identity,
authorization, persistence and authoritative correction remain application-owned.
For an authoritative value change, update the native select and dispatch its
native `change` event; refreshing choice markup alone does not acknowledge a save.

## Query and result contract

| Configuration | Local default | Remote default |
| --- | --- | --- |
| `mode` | `local` | Explicit `remote` |
| `minLength` | 0 | 2 trimmed Unicode code points |
| `debounce` | 0ms | 250ms |
| `maxResults` | 50 | 50 |

Minimum and maximum counts must be nonnegative/positive integers respectively;
debounce must be finite and nonnegative. Local filtering compares accent/case
folded option labels and values. Actual values and labels stay intact. Remote
queries are trimmed Unicode text; server matching/filtering remains application
policy. The returned window is capped and truncation is announced; no all-ever-seen
label cache is maintained. Keep the fallback choice dataset itself bounded.

The root emits bubbling/composed `combobox-query` with
`{contextId, requestId, query}`. The application answers through
`control.applyResults({contextId, requestId, query, items, error?})`, or by
dispatching `combobox-results` on that same root with that detail. Items have
unique string `value`, string `label` and optional boolean `disabled`.
Labels and errors are rendered as text, never HTML. Invalid current results
throw without changing the current result state; stale results are ignored
before inspecting their payload. `applyResults` returns whether it applied.

Only the current control/lifetime, request and query can accept a remote reply.
Changing the query invalidates the preceding reply **before** the next debounce
fires. Short queries, composition, closing/reset, disabling and disposal also
invalidate it. Duplicate final input events preserve the existing debounce.
An applied request is settled once; duplicate replies do not overwrite it.
Empty, failed and loading states remain distinct. The selected value/label and
reset default survive absence from the result window; only required retained
options are added to the native select when needed.

## Keyboard, focus and lifecycle

The editable input has combobox semantics, controls a listbox and uses
`aria-activedescendant` to identify the highlighted enabled option. DOM focus
stays in the input. Up/Down open and highlight, Enter or pointer activation
commits, and Escape closes and restores the selected label. Tab leaves normally;
ordinary text-editing keys are not intercepted. Composition suppresses query
dispatch and selection until composition ends. Status text announces minimum
length, result count/truncation, loading, empty and failed searches.

`refresh()` validates option/label/disabled/form updates and rebinds a replaced
select inside the retained root without rebuilding the editable input. Typing,
caret and focus survive result/option patches. Original reset-default retention
is local to the controller lifetime. A retained-root replacement that explicitly
supplies a selected default can update the displayed selection; applications
should deliberately manage that authoritative markup.

`dispose()` restores the native control and label attributes and removes generated
UI, timers and subscriptions. Removing the root triggers disposal, and an old
controller cannot apply results after reinsertion. Dispose/reinitialize explicitly
when replacing the whole root; there is no global draft cache or patch framework.
Templ wrappers should supply stable root/select IDs, meaningful fallback options,
native props and explicit lifecycle bindings. Applications retain ownership of
shared DOM-patch boundaries. Avoid reinitializing an attached root twice.

## Source inspection and notices

Inspected Starbase's
[`select.ts` at 8fc0d1e](https://github.com/zweiundeins/starbase/blob/8fc0d1e38f4a26c448282d8e73f5569f6e437389/components/select/select.ts),
[documented form gaps](https://github.com/zweiundeins/starbase/blob/8fc0d1e38f4a26c448282d8e73f5569f6e437389/components/select/README.md#forms)
and [Rocket patch references](https://github.com/zweiundeins/starbase/blob/8fc0d1e38f4a26c448282d8e73f5569f6e437389/patches/rocket/README.md).
Its manual formdata/reset wiring explicitly excludes required validity,
disabled fieldsets, external labels and `form` association. This implementation
uses native select backing and original Live Wires code, with no copied
Starbase/PD/Rocket code, bundled shadow styles or runtime replacement. If later
work copies upstream code, retain that revision's applicable notices.

## Verification

Run `npm test`, `npm run build` and the focused state suite:
`node --test tests/combobox-state.test.js`.
The maintained host browser harness is `tools/test-combobox-browser.mjs`.
Supply an already installed Playwright module and an owned preview:

```sh
LW_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
LW_COMBOBOX_URL=http://localhost:3006 \
LW_COMBOBOX_EVIDENCE=/absolute/owned/evidence/path \
node tools/test-combobox-browser.mjs
```

The harness launches installed Chrome by default; set `LW_COMBOBOX_ENGINE=firefox`
or `webkit` to use an already installed matching engine. It creates/closes only
its browser contexts, never starts a server or downloads a browser. Evidence
includes a JSON result set, viewport/forced-colors/fallback screenshots and trace.
Actual GET submission and FormData are separate checks. Required validation,
disabled fieldsets, reset cancellation, external form association, keyboard,
out-of-order results, label retention, two instances, DOM updates, failed module
load and lifecycle teardown all have focused cases. The example's `pa` response
is delayed 900ms and `par` 100ms; `fail` fails and `zz` produces no results.

Simulated composition is not physical IME testing. ARIA and DOM assertions are
not screen-reader testing. Mobile/touch and forced-colors emulation do not establish
physical-device/OS acceptance. Record actual engine, source/head and gaps for
each run, and obtain applicable final-head UI acceptance separately.
