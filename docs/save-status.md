# Save status presentation contract

Live Wires provides the text styling and semantic hooks. Each consuming editor owns the actual save state and the visible label it supplies. This contract does not implement autosave.

## Markup

Keep one status region at a stable location beside the editor controls:

```html
<div class="cluster items-baseline">
  <button type="button">Done editing</button>
  <p class="save-status" data-save-status data-save-state="saved"
     role="status" aria-atomic="true">Draft saved</p>
</div>
```

Supported `data-save-state` values and default text:

| State | Default text | Meaning |
| --- | --- | --- |
| `ready` | `Ready` | No claim of a newly confirmed save. |
| `dirty` | `Unsaved changes` | Current edits are not confirmed saved. |
| `saving` | `Saving…` | The host says the save is pending. |
| `saved` | `Draft saved` | The host confirmed the stated scope. |
| `failed` | `Couldn’t save draft` | The host reported a rejection or failure. |
| `unknown` | `Save not confirmed` | The host cannot confirm the outcome. |

The host updates the state attribute and visible label together when its explicit state changes. Do not infer state from the displayed text, a fetch completing, or a timeout. The component adds no DOM, state transitions, request tracking, persistence, retry or debounce behavior.

## Scope and action labels

“Draft saved” is valid only when the host confirms the whole scope represented by that phrase. If only text is confirmed, use “Text saved” and keep pending scope in a separate supporting instruction such as “Rules and collaborators still need saving.” Do not place instructions or recovery actions in the short status line.

Saved does not mean published or editing-finished. Keep publish, Done editing, retry, reload and recovery controls distinct and unchanged.

## Accessibility and visual behavior

- Use one persistent `role="status"` node per independent editor. The role has implicit polite live behavior; do not add a second mirrored live region for the same event.
- Keep the node at a stable DOM location and never move focus to it.
- Hosts should expose meaningful state transitions, not announce every keystroke. A dirty transition should not be written again for every input event.
- Keep visible words so meaning does not depend on color. State color uses semantic theme tokens; forced-colors falls back to `CanvasText`.
- The host controls surrounding layout. Put `items-baseline` on a flex parent such as `cluster` when the status should share a baseline with adjacent buttons or text. Keep layout primitives out of the component markup so Templ #21 and other adopters can choose their own placement.

## Ownership

Templ #21 owns its future markup and placement and may consume the `.save-status` / `data-save-state` presentation contract. It must not treat the CSS hook as a save engine or bake in layout primitives.

Baseplate #1203 owns autosave request identity, persistence, race resolution, retry/recovery, accepted/rejected/uncertain outcomes and saved scope. Its host code supplies a truthful state and label. The Governance proposal editor is outside this change. The reference page's buttons are deterministic presentation simulations only; they do not send requests or persist edits.
