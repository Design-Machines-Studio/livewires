# Hardware loaders

`src/css/6_components/loader.css` ships in `main.css`. Canonical SVG geometry is in `public/reference/components/loaders.html`; the component guide is `/manual/components/loaders.html`.

| Variant | Use |
| --- | --- |
| `loader loader--ratchet` | Single Phillips head for indefinite inline waits and buttons. |
| `loader loader--line` | Four staggered heads, Phillips or mixed. Always standalone; never in buttons. |
| `loader loader--torque` | Measured progress; `--p` is clamped to 0–1. |

All SVGs are decorative (`aria-hidden="true" focusable="false"`), use currentColor, and are 1em tall. Keep visible text beside them. Standalone indefinite loaders use one persistent `role="status"` wrapper. Driver Line uses `.loader-panel` or `.loader-overlay` with visually hidden status text, so only the hardware is visible. Determinate jobs use a named `role="progressbar"` with `aria-valuemin="0" aria-valuemax="100" aria-valuenow` matching `--p * 100`. Progress completion alone makes no persistence claim.

`--loader-speed` inherits from an ancestor or can be set on the SVG (default 1). Torque exposes `--loader-track` and `--loader-paint`; native buttons and `.button` use the label color. `data-state="complete"` plays the final click; `data-state="reset"` with `--p: 0` rewinds. Reduced motion disables animation and transitions but retains the current progress; forced colors distinguish the track and fill using system colors. `[hidden]` always hides the SVG.

## Composition

- Buttons: insert the SVG beside the label. The application owns `aria-busy`, disabling and result announcements outside busy content.
- Loading regions: replace the skeleton with a hidden HTML indicator wrapper containing the decorative SVG. The existing controller still owns visibility, delay, overlap and announcements; the visual introduces no new runtime.
- Save status: put a decorative SVG before a `span data-save-label` inside `.save-status`. CSS shows it only for `data-save-state="saving"`. Update the state and label span together; replacing the whole paragraph's text would remove the SVG. Preserve the single outer status region.

The Templ library provides `LoaderIconComponent` for composition, `LoaderComponent` for standalone status/progress, `ButtonProps.Busy` and typed `Indicator *LoaderIconProps`, and optional `Indicator templ.Component` props on `LoadingRegionProps` and `SaveStatusProps`. Driver Line is never placed in a button or inline save label; the button API falls back to ratchet if given line. Empty/legacy `Loader` variants and the default LoadingRegion retain skeleton output. SaveStatus renders an optional indicator only while saving. Hosts own request identity, save state and confirmed scope.

## Driver Line surfaces

`.loader-overlay` covers the viewport with `position: fixed; inset: 0`, centers Driver Line, and uses `color-mix(in srgb, var(--color-bg) 80%, transparent)` for the background. The SVG remains fully opaque. Mount outside transformed ancestors, preferably near the body root. Top-layer dialogs/popovers remain above document overlays.

`.loader-panel` centers Driver Line within a component, fills a sized parent's height, and has a six-line minimum height. Both surfaces honor `hidden` and show only hardware; `.visually-hidden` preserves the accessible loading label.

Templ exports `LoaderOverlayComponent(LoaderOverlayProps)` / `LoaderOverlay(label)` and `LoaderPanelComponent(LoaderPanelProps)` / `LoaderPanel(label)`. `Loader(label, "line")` also renders a panel. The application owns visibility and busy state; for a blocking page operation it also owns inert background content. Keep the status surface outside any busy/inert subtree. A panel used as an optional LoadingRegion indicator uses `Indicator: LoaderIcon("line"), IndicatorClass: "loader-panel"`, retaining the existing controller's separate announcement. Do not nest the standalone live surface inside that indicator.

```html
<div class="loader-overlay" hidden role="status" aria-atomic="true">
  <!-- Full .loader--line SVG from the canonical reference -->
  <span class="visually-hidden">Loading page</span>
</div>
<div class="loader-panel" role="status" aria-atomic="true">
  <!-- Full .loader--line SVG from the canonical reference -->
  <span class="visually-hidden">Loading content</span>
</div>
```
