# Widget references

Live Wires supplies semantic content anatomy. Baseplate owns placement, permissions, configuration and persistence; each Fixture owns its data and formatted strings. Templ can emit these classes without adding layout utilities or importing CSS.

## Frame and slots

```html
<section class="widget" aria-labelledby="widget-title">
  <header class="widget-header">
    <div class="widget-heading">
      <h2 id="widget-title" class="widget-title">Membership at a glance</h2>
      <p class="widget-description">Optional supporting description</p>
    </div>
    <a class="widget-action" href="/members">Optional header action</a>
  </header>
  <div class="widget-content"><!-- caller content --></div>
  <footer class="widget-footer"><a class="more" href="/members">Member directory</a></footer>
</section>
```

Heading level and unique IDs belong to the caller. Omit description, action, header or footer when unnecessary. A headingless section needs its own accessible name; a non-landmark body can use `div`. Header actions wrap beneath long headings. The footer sits at the bottom when the host stretches its cell; height and grid placement remain host choices.

Put schemes on the frame or an ancestor. Background and foreground use inherited scheme tokens; text links inherit the foreground and keep their normal underline/`.more` cue and visible focus. Anchor buttons retain their existing button colors and focus treatment. The header's decorative divider defaults to Baseplate's 40% foreground mix. `--widget-border-color` deliberately changes it. `.widget--plain-header` removes the divider and its padding, replacing the producer's route-specific exception without copying `/super/updates` selectors. `--widget-padding` adjusts internal padding. No host editor, drag, grid-column or viewport-grid rules are emitted.

## Unboxed metric

```html
<dl class="widget-metrics">
  <div class="widget-metric">
    <dt>Active</dt>
    <dd class="widget-metric-value font-metric tnum"
        style="--widget-metric-size: var(--text-4xl);
               --widget-metric-weight: 650;
               --widget-metric-width: 80%;">42</dd>
    <dd class="widget-metric-detail">Optional caller-supplied units or detail</dd>
  </div>
  <div class="widget-metric">
    <dt>Probationary</dt>
    <dd class="widget-metric-status">Unavailable</dd>
  </div>
</dl>
```

A standalone metric uses `dl.widget-metric` with direct `dt`/`dd` children. A group uses `dl.widget-metrics` containing `div.widget-metric` groups; every group contains its own term and definitions. Do not put `dt`/`dd` directly in a `div.card` or nest cards inside the frame. Terms come first in the DOM; numeric definitions appear visually above their labels, following Baseplate's existing value/label hierarchy. Unavailable/missing/denied definitions remain ordinary text and receive neither the value class nor `.font-metric`. Zero stays a numeric value.

The caller supplies formatted strings, locale, currency symbols, signs, units, precision and meaningful state distinctions. These classes do no arithmetic, formatting, localization or authorization. Source-derived labels remain unchanged; financial, percentage, negative and denied examples are explicitly demonstration fixtures.

| Hook | Standard property | Unset behavior |
| --- | --- | --- |
| `--font-metric` | `.font-metric` family only | `var(--font-body)` |
| `--widget-metric-size` | `font-size` on the value | Existing `--text-3xl` scale |
| `--widget-metric-weight` | `font-weight` on the value | Existing `--font-bold` weight |
| `--widget-metric-width` | `font-stretch` on the value | Inherited font stretch |

The token and utility exactly match merged Baseplate PR #1162:

```css
--font-metric: var(--font-body);
.font-metric {
  font-family: var(--font-metric, var(--font-body, sans-serif)), sans-serif;
}
```

Width means glyph width (`wdth`), not widget columns. Percentage `font-stretch` and numeric `font-weight` map registered axes through standard CSS properties. Static fonts remain readable when a width axis is absent; a computed stretch value alone does not prove that a font actually varied. No `font-variation-settings`, transform scaling, truncation or shrink-to-fit loop is used. Long values wrap as a last resort and retain every digit. No font is selected or downloaded by the component.

Do not add `text-*` or `font-*` size/weight utilities to hook-controlled values. Utilities intentionally win over components; adding one opts into that art direction instead of the corresponding hook. `.font-metric` and `.tnum` are compatible because they control family and numeral features only. Apply hooks directly to a value or to its owning widget; neither changes label/description styles.

Baseplate #1161 owns validation, saved per-widget overrides, reset and editor draft/Save behavior. Entry count, sorting, filters and video/embed configuration also belong to the owning Go widgets and validated host configuration. They are not CSS settings or part of this extraction.

## Quiet message

```html
<div class="widget-message">
  <span class="widget-message-icon" aria-hidden="true"><!-- optional decorative icon --></span>
  <div class="widget-message-content">
    <p>Temporarily unavailable</p>
    <p class="widget-message-detail">Try again later or open the full page.</p>
  </div>
</div>
```

Icon and detail are optional. There is no extra card, surface, border, forced live region or fabricated value. The host decides whether a dynamic update needs `role="status"`. Reuse existing Timeline, StatusIndicator and ProgressBar inside content slots. A chart slot may contain an existing caller renderer, a static reference illustration or an unavailable message; an equivalent semantic table remains available independently of that renderer. These references add no chart/map runtime.

## Exact source comparison

| Consumer | Trusted source commit | Files and retained meaning |
| --- | --- | --- |
| Baseplate | `1821a8dd542df9b0ae89490a1bf1924584934487` | `internal/components/dashboard_widget_body.templ`, `overview_summary.templ`, `internal/baseplate/dashboard/widgets/library.templ`, `src/css/6_components/dashboard-widget-editor.css`: header/body/footer, flexible body, bottom footer, 40% foreground divider, unboxed totals, quiet states; labels including “Membership at a glance” and “You're all caught up.” |
| Governance | `d995f68d9b143a45dcdf880895225f9dd626d71c` | `pages/workspace/proposals/widgets.templ`: same anatomy plus safe wrapping, list/deadline and metric examples, “Governance at a glance,” “Visible drafts,” “Open for input,” “Decisions” and “Governance information is unavailable right now.” |
| Atlas | `03b03b90b74f27ace77226a24fa76d977e0017fc` | `pages/workspace/network/dashboard_widgets.templ`, `dashboard_network.templ`, `dashboard_collection.templ`, `network_numbers.templ`, `internal/module/dashboard-widgets.css`: named sections, min-width/wrapping, inherited footer link, compact definitions, “Organizations in the network,” “Network over time” and table disclosure. |

[Baseplate source](https://github.com/Design-Machines-Studio/assembly-baseplate/blob/1821a8dd542df9b0ae89490a1bf1924584934487/internal/components/dashboard_widget_body.templ), [Governance source](https://github.com/Design-Machines-Studio/assembly-governance/blob/d995f68d9b143a45dcdf880895225f9dd626d71c/pages/workspace/proposals/widgets.templ), [Atlas source](https://github.com/Design-Machines-Studio/assembly-atlas/blob/03b03b90b74f27ace77226a24fa76d977e0017fc/pages/workspace/network/dashboard_collection.templ).

Producer merge `257acac40ac1c6726d468a140256fed9391c93df` remains an ancestor of the Baseplate trusted source above. Its [complete metric contract](https://github.com/Design-Machines-Studio/assembly-baseplate/blob/257acac40ac1c6726d468a140256fed9391c93df/docs/reference/metric-typography.md), validated theme registry, editor handler/presenter, token/utility and prominent-value seams were inspected. Issue #1160 being open does not negate that merged source evidence. There is no consumer migration or published compatibility claim here.

The generic extraction omits Baseplate account-notification/result-row overrides and health-grid rules, Atlas editor-heading padding and sector-specific selectors, placement wrappers, dashboard registry and domain-specific rendering. Atlas's noncompact stat-card structure does not establish valid standalone `div > dt/dd` markup; the shared reference intentionally uses a real definition list.

Before screenshots are retained in the task's ignored evidence area, separately from product code. The running consumers have their own serving/source context: Baseplate's maintained checkout was `7e99c69b4483ec9659a19da7044c9c88df1a03d2`; Governance's was `172ec73b151f3244b66b2b26eddf5853aff9e990` with recorded Baseplate producer `793a09fec90a8c97710cf1392327fc5aaddda767`; Atlas's was the trusted Atlas source above with unrelated dirty work and recorded Baseplate producer `2129d0438001764f4ec0cdc120d2073c376525ca`. The screenshots show observed before UI, not a claim that those applications were rebuilt at the newer trusted-main inventory. No application typography persistence, theme save/reload or editor configuration is retested by this CSS task.

Existing stat-number examples in the Cards manual/reference also emit `.font-metric`; their sizes, weights, labels and ordinary descriptive numbers remain unchanged.

## Verification surface

`/reference/components/widgets.html` contains metric, list, empty/unavailable, chart-with-table and mixed examples, each in a narrow subtle host and a wide dark host. It also contains formatted long currency, percentages, counts, negative/zero values, custom value hooks and ordinary missing/denied/unavailable definitions. `/manual/components/widgets.html` documents the emitted markup and ownership contract. Final browser observations and precise coverage gaps belong to the task receipt, not declarations-only tests.
