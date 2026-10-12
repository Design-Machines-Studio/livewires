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
| `--font-metric` | `.font-metric` family | `var(--font-body)` |
| `--font-metric-size` | Optional initial `font-size` via `.font-metric` | Underlying component/element size |
| `--font-metric-width` | Optional `font-stretch` via `.font-metric` | Underlying component/element stretch |
| `--widget-metric-size` | `font-size` on the value, before the initial metric setting | `--text-2xl`, or the selected short/long variation |
| `--widget-metric-weight` | `font-weight` on the value | Existing `--font-bold` weight |
| `--widget-metric-width` | `font-stretch` on the value | Inherited font stretch |

The token default and family expression match merged Baseplate PR #1162. Live Wires extends the utility with optional size/width declarations; Baseplate's current family-only utility needs these declarations before its consumers can use the new generic hooks:

```css
--font-metric: var(--font-body);
.font-metric {
  font-family: var(--font-metric, var(--font-body, sans-serif)), sans-serif;
  font-size: var(--widget-metric-size, var(--font-metric-size, revert-layer));
  font-stretch: var(--widget-metric-width, var(--font-metric-width, revert-layer));
}
```

Width means glyph width (`wdth`), not widget columns. Percentage `font-stretch` and numeric `font-weight` map registered axes through standard CSS properties. Static fonts remain readable when a width axis is absent; a computed stretch value alone does not prove that a font actually varied. No `font-variation-settings`, transform scaling, truncation or shrink-to-fit loop is used. Long values wrap as a last resort and retain every digit. No font is selected or downloaded by the component.

Do not add `text-*` or `font-*` size/weight utilities to hook-controlled values. Utilities intentionally win over components; adding one opts into that art direction instead of the corresponding hook. `.font-metric` and `.tnum` are compatible; the metric utility respects widget-specific size/width hooks before its optional generic initial settings. With both unset, `revert-layer` restores the underlying presentation. Keep generic initial size/width hooks unset on `:root` unless the caller deliberately configures them. Apply hooks directly to a value or to its owning widget; neither changes label/description styles.

Choose `widget-metric-value--short` for a deliberately tall short value (text-4xl) and `widget-metric-value--long` for a compact long value (text-lg). The default is text-2xl. Each package includes its matching unitless line-height and tracking. Callers choose after formatting; these classes do not count digits, query data, squeeze text or guarantee one-line fit. Explicit size settings override these presentation defaults. Use the value-specific hook to refine a long amount while retaining an initial size for other metrics:

```html
<dl class="widget-metrics" style="--font-metric-width: 75%;">
  <div class="widget-metric">
    <dt>Active</dt>
    <dd class="widget-metric-value widget-metric-value--short font-metric tnum">42</dd>
  </div>
  <div class="widget-metric">
    <dt>Balance</dt>
    <dd class="widget-metric-value widget-metric-value--long font-metric tnum">€ 9.876.543.210.987,65</dd>
  </div>
</dl>
```

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

## Compact chart data and composition variations

Use `table.widget-table` for compact chart fallback data. Keep its caption and column/row scopes. This explicit variation retains native table columns at narrow container widths, inherits ordinary widget typography and uses one quiet separator per body row. For tables with more columns, a caller can provide a labelled, focusable horizontal scroll region and an explicit table minimum width; every column remains present. The `numeric` class still aligns numeric columns. Do not combine it with `table--lined`: the general mobile row stack and extra header rules are deliberately replaced here.

Card progress reuses `progress-bar` with `--progress-height: var(--line-025)` on that bar; the component's default is line-05 and `progress-bar--thick` uses line-1. Existing fill/background hooks and StatusIndicator/Timeline variations remain caller choices. The widget does not silently rewrite every nested component.

## Video output and flip ownership

The YouTube examples compose the existing `embed` inside `widget-content`, with a titled, lazy iframe, autoplay disabled, a 200px minimum player height and a direct-video footer link. They use YouTube's documented sample video; no player API or new client runtime is added to Live Wires. The direct link remains usable when embedding is denied or unavailable. YouTube requires both dimensions to be at least 200px; callers with narrower content should use the direct-link state instead of forcing overflow. See [YouTube's player requirements](https://developers.google.com/youtube/player_parameters).

Flip interactions and rear-face controls remain Baseplate-owned because they depend on permissions, editor drafts, saved configuration and reset/Save behavior. Either face can reuse the shared frame; this task adds only output references. URL/embed input, provider validation and persisted player options belong to the owning application.

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

`/reference/components/widgets.html` contains metric, list, empty/unavailable, chart-with-table and mixed examples, each in a narrow subtle host and a wide dark host. It also contains narrow/wide YouTube output, deliberate short/default/long metric variations, thin card progress, formatted long currency, percentages, counts, negative/zero values, custom value hooks and ordinary missing/denied/unavailable definitions. `/manual/components/widgets.html` documents the emitted markup and ownership contract. Final browser observations and precise coverage gaps belong to the task receipt, not declarations-only tests.


## Final Design Machines library comparison

The read-only comparison at [the Design Machines dashboard](https://assembly.designmachines.studio/dashboard?edit=1) on 2026-10-12 found **34 distinct admitted widgets: 29 in the library and 5 already on the board** (13 Baseplate, 12 Atlas, 9 Governance). All back faces exposed Columns, Rows and Colour scheme. No add/remove/reorder, reset, draft/Save, or configuration action was performed.

The install displayed Assembly version `v1.0.0-beta.2`; it did not expose an exact source SHA. This observed installation is separate from the pinned producer commits above and from the Live Wires feature preview. Most Atlas populated lists/charts were empty or unavailable in this install; their populated markup was inspected in the pinned producer templates. Admission, sharing policy and hidden conditional widgets remain owner-controlled. This is coverage of the observed board/library, not a claim that every possible role-dependent registry entry appeared.

The final pass added profile next-step progress, runtime/backup status tables, metric-plus-summary tables, categorized bars with full table data, four-column membership/map fallbacks, populated notifications/activity, sharing-aware metrics, identity lists and plain ranked/date lists. Values are demonstration strings; private board records were not copied into these references. Existing approved primitives style these compositions. Map/chart runtime, widget registry and editor behavior remain with their owners.

Additional exact producer reads at the recorded commits: Baseplate `internal/baseplate/account/pages/overview_shared.templ`, `internal/components/profile_completion.templ`, `internal/baseplate/admin/pages/index.templ`, `internal/baseplate/admin/pages/configure_assembly.templ`, and their overview handlers; Atlas `pages/workspace/network/shared_breakdowns.templ` plus complete dashboard collection/network templates. Profile examples retain incomplete-only next actions; runtime version strings and ordinary table/list counts keep ordinary typography. People-history data retains reported positions, reporting organizations and provisional observation meaning.

| Owner | Observed label | Source kind | Shared composition covered | Example |
| --- | --- | --- | --- | --- |
| Baseplate | Organization activity | `recent-activity` | Activity timeline | [Reference](/reference/components/widgets.html#activity-heading) |
| Atlas | Network map | `atl.network_map` | Empty map + four-column city fallback; no map runtime | [Reference](/reference/components/widgets.html#map-wide-heading) |
| Governance | Open proposals | `gov.open_proposals` | Proposal list + caller footer | [Reference](/reference/components/widgets.html#list-heading) |
| Governance | Needs my input | `gov.needs_my_input` | Proposal/deadline list | [Reference](/reference/components/widgets.html#list-heading) |
| Governance | Drafts I'm working on | `gov.my_drafts` | Caller-filtered proposal list | [Reference](/reference/components/widgets.html#list-heading) |
| Baseplate | Unread notifications | `notifications` | Populated notification list + empty state | [Reference](/reference/components/widgets.html#notification-list-heading) |
| Baseplate | Profile completion | `profile-completion` | Thin progress + remaining next actions; optional footer | [Reference](/reference/components/widgets.html#completion-heading) |
| Baseplate | Linked organizations | `linked-organizations` | Identity/link list | [Reference](/reference/components/widgets.html#identity-list-heading) |
| Baseplate | Membership at a glance | `membership-overview` | Grouped metrics | [Reference](/reference/components/widgets.html#membership-heading) |
| Baseplate | Membership requirements | `membership-requirements` | Metric + requirements table; empty/unavailable states | [Reference](/reference/components/widgets.html#requirements-heading) |
| Baseplate | Circles | `circles` | Metric + kind/count table | [Reference](/reference/components/widgets.html#requirements-wide-heading) |
| Baseplate | Connection requests | `federation-requests` | Quiet empty message + caller action/footer | [Reference](/reference/components/widgets.html#empty-heading) |
| Baseplate | Connected organizations | `connected-organizations` | Metric + identity list | [Reference](/reference/components/widgets.html#mixed-wide-heading) |
| Baseplate | Assembly health | `assembly-health` | Ordinary facts + status + per-fact action | [Reference](/reference/components/widgets.html#health-facts-heading) |
| Baseplate | Assembly | `assembly` | Ordinary runtime fact table; optional footer | [Reference](/reference/components/widgets.html#facts-heading) |
| Baseplate | Updates | `updates` | Ordinary status/message + action | [Reference](/reference/components/widgets.html#health-facts-heading) |
| Baseplate | Backups | `backups` | Destination/status table | [Reference](/reference/components/widgets.html#facts-wide-heading) |
| Atlas | Organizations in the network | `atl.network_summary` | Standalone count metric | [Reference](/reference/components/widgets.html#mixed-wide-heading) |
| Atlas | People in the network* | `atl.membership_summary` | Sharing-aware unavailable metric and detail | [Reference](/reference/components/widgets.html#sharing-heading) |
| Atlas | Network over time | `atl.network_over_time` | Static illustration + independent data table | [Reference](/reference/components/widgets.html#chart-heading) |
| Atlas | Sectors | `atl.sectors` | Ranked labels/counts + decorative bars + full table | [Reference](/reference/components/widgets.html#breakdown-heading) |
| Atlas | Average organization size | `atl.average_size` | Formatted decimal metric + denominator detail | [Reference](/reference/components/widgets.html#average-heading) |
| Atlas | Cities in the network | `atl.cities` | Standalone metric + ordinary detail | [Reference](/reference/components/widgets.html#average-heading) |
| Atlas | Countries in the network | `atl.countries` | Standalone count metric | [Reference](/reference/components/widgets.html#mixed-wide-heading) |
| Atlas | People over time | `atl.people_over_time` | Four-column membership-position fallback + provisional observation | [Reference](/reference/components/widgets.html#chart-wide-heading) |
| Atlas | Organization types | `atl.organization_types` | Ranked breakdown with wrapping labels | [Reference](/reference/components/widgets.html#breakdown-wide-heading) |
| Atlas | Places in the network | `atl.places` | Place label/count list + shown-count note | [Reference](/reference/components/widgets.html#places-heading) |
| Atlas | Recently joined | `atl.recently_joined` | Link/date list | [Reference](/reference/components/widgets.html#joined-heading) |
| Governance | Respond by | `gov.respond_by` | Proposal/deadline list | [Reference](/reference/components/widgets.html#list-heading) |
| Governance | Recent decisions | `gov.recent_decisions` | Decision timeline | [Reference](/reference/components/widgets.html#list-wide-heading) |
| Governance | Governance at a glance | `gov.overview` | Grouped metrics + year detail | [Reference](/reference/components/widgets.html#governance-heading) |
| Governance | Open proposal count | `gov.open_proposal_count` | Standalone prominent value + label/detail | [Reference](/reference/components/widgets.html#mixed-wide-heading) |
| Governance | Needs my input count | `gov.needs_my_input_count` | Standalone prominent value + label/detail | [Reference](/reference/components/widgets.html#mixed-wide-heading) |
| Governance | Decisions this year | `gov.decisions_this_year` | Known zero metric | [Reference](/reference/components/widgets.html#default-values-heading) |
