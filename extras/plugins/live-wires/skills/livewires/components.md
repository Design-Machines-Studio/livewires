# Components Reference

## Avatars

```html
<!-- Size variants (smallest to largest) -->
<span class="avatar avatar--xs"><img src="photo.jpg" alt="Name"></span>
<span class="avatar avatar--sm"><img src="photo.jpg" alt="Name"></span>
<span class="avatar"><img src="photo.jpg" alt="Name"></span>
<span class="avatar avatar--lg"><img src="photo.jpg" alt="Name"></span>
<span class="avatar avatar--xl"><img src="photo.jpg" alt="Name"></span>
<span class="avatar avatar--2xl"><img src="photo.jpg" alt="Name"></span>
<span class="avatar avatar--3xl"><img src="photo.jpg" alt="Name"></span>
<span class="avatar avatar--4xl"><img src="photo.jpg" alt="Name"></span>

<!-- Square variant (works with any size) -->
<span class="avatar avatar--square"><img src="logo.png" alt="Company"></span>
<span class="avatar avatar--xs avatar--square"><img src="logo.png" alt="Company"></span>

<!-- Initials fallback (use role="img" + aria-label) -->
<span class="avatar" role="img" aria-label="Jane Doe">
  <span class="initials" aria-hidden="true">JD</span>
</span>

<!-- Single character at xs/sm for readability -->
<span class="avatar avatar--xs" role="img" aria-label="Jane Doe">
  <span class="initials" aria-hidden="true">J</span>
</span>

<!-- With name (cluster layout) -->
<div class="cluster items-center">
  <span class="avatar avatar--sm"><img src="photo.jpg" alt=""></span>
  <span>Jane Doe</span>
</div>

<!-- As link -->
<a href="/profile/jane" class="cluster items-center">
  <span class="avatar avatar--sm"><img src="photo.jpg" alt=""></span>
  Jane Doe
</a>

<!-- Avatar group (overlapping, proportional overlap) -->
<div class="avatar-group">
  <span class="avatar"><img src="u1.jpg" alt="User 1"></span>
  <span class="avatar"><img src="u2.jpg" alt="User 2"></span>
  <span class="avatar"><img src="u3.jpg" alt="User 3"></span>
</div>
```

Sizes: `--xs` (0.5 lines), `--sm` (0.75 lines), default (1 line), `--lg` (1.5 lines), `--xl` (2 lines), `--2xl` (4 lines), `--3xl` (6 lines), `--4xl` (8 lines).

## Dialogs and Modals

```html
<!-- Basic dialog -->
<dialog class="dialog imposter-dialog imposter-contain">
  <div class="dialog-content box stack">
    <header class="dialog-header cluster cluster-between cluster-nowrap">
      <h2 class="dialog-title">Title</h2>
      <button class="dialog-close" aria-label="Close">&times;</button>
    </header>
    <p>Content here.</p>
    <footer class="dialog-actions cluster cluster-end">
      <button class="button">Cancel</button>
      <button class="button button--accent">Confirm</button>
    </footer>
  </div>
</dialog>

<!-- Size variants -->
<dialog class="dialog dialog--narrow">  <!-- 20rem max -->
<dialog class="dialog">                 <!-- 24rem max (default) -->
<dialog class="dialog dialog--wide">    <!-- 32rem max -->
```

## Popup Dialog (Web Component)

Additive by design: no footer unless you add buttons via attributes or slots.

```html
<!-- Confirmation dialog (with buttons) -->
<popup-dialog
  title="Delete item?"
  body="This action cannot be undone."
  confirm-label="Delete"
  cancel-label="Cancel"
  confirm-variant="red">
  <button class="button button--red">Delete</button>
</popup-dialog>

<!-- Info popup (no footer - just title, body, close button) -->
<popup-dialog title="Note" body="Source citation">
  <sup style="text-decoration: underline dotted; cursor: pointer;">1</sup>
</popup-dialog>

<!-- With navigation on confirm -->
<popup-dialog title="Leave?" body="Unsaved changes." confirm-label="Leave" confirm-href="/home/">
  <a href="/home/">Leave</a>
</popup-dialog>

<!-- Custom actions via slot -->
<popup-dialog title="About">
  <button class="button">Learn more</button>
  <div slot="body"><p>Custom content.</p></div>
  <div slot="actions"><button data-action="close" class="button">Got it</button></div>
</popup-dialog>

<!-- Attributes: title, body, confirm-label, cancel-label, confirm-href, confirm-variant ("accent"|"red") -->
<!-- Events: confirm -->
<!-- API: popup.open(), popup.close(), popup.confirm() -->
```

## Status Indicators

```html
<!-- Semantic variants -->
<span class="status-indicator">Default</span>
<span class="status-indicator status-indicator--success">Healthy</span>
<span class="status-indicator status-indicator--warning">Warning</span>
<span class="status-indicator status-indicator--error">Error</span>

<!-- Color variants -->
<span class="status-indicator status-indicator--green">Green</span>
<span class="status-indicator status-indicator--yellow">Yellow</span>
<span class="status-indicator status-indicator--orange">Orange</span>
<span class="status-indicator status-indicator--red">Red</span>
<span class="status-indicator status-indicator--blue">Blue</span>

<!-- Size variants -->
<span class="status-indicator status-indicator--small">Small</span>
<span class="status-indicator status-indicator--large">Large</span>

<!-- Without text (add aria-label) -->
<span class="status-indicator status-indicator--success" aria-label="Online"></span>
```

## Badges

```html
<!-- Color variants -->
<span class="badge badge--blue">Blue</span>
<span class="badge badge--green">Green</span>
<span class="badge badge--orange">Orange</span>
<span class="badge badge--yellow">Yellow</span>
<span class="badge badge--red">Red</span>
<span class="badge badge--grey">Grey</span>

<!-- Status variants -->
<span class="badge badge--draft">Draft</span>
<span class="badge badge--pending">Pending</span>
<span class="badge badge--active">Active</span>
<span class="badge badge--archived">Archived</span>

<!-- Feedback variants -->
<span class="badge badge--success">Success</span>
<span class="badge badge--warning">Warning</span>
<span class="badge badge--error">Error</span>
<span class="badge badge--info">Info</span>

<!-- Size variants -->
<span class="badge badge--blue badge--small">Small</span>
<span class="badge badge--blue badge--large">Large</span>
```

## Progress Bars

```html
<!-- Basic progress bar -->
<div class="progress-bar">
  <div class="fill" style="width: 65%"></div>
</div>

<!-- Thick variant -->
<div class="progress-bar progress-bar--thick">
  <div class="fill" style="width: 45%"></div>
</div>

<!-- Stacked bar (distribution breakdown) -->
<div class="stacked-bar">
  <div class="segment segment--primary" style="width: 40%"></div>
  <div class="segment segment--secondary" style="width: 35%"></div>
  <div class="segment segment--muted" style="width: 25%"></div>
</div>
```

## Dropdown

```html
<!-- Action menu: toggle with data-open (JS) or use <details> -->
<div class="dropdown" data-open>
  <button class="button trigger">Menu</button>
  <ul class="menu">
    <li><a href="#">Edit</a></li>
    <li><hr></li>
    <li><button>Delete</button></li>
  </ul>
</div>

<!-- Alignment: .dropdown--end (end edge), .dropdown--up (opens upward) -->

<!-- Filter panel: native details/summary, no JS. A scrollable .body
     between an optional <header> and <footer>. Make .menu a <form>. -->
<details class="dropdown dropdown--panel">
  <summary class="trigger button button--small">
    <span>Circles</span>
    <span class="text-muted">All</span>
    <svg class="icon chevron" aria-hidden="true">…</svg>  <!-- flips while open -->
  </summary>
  <form class="menu" method="get">
    <header class="cluster cluster-between">            <!-- optional -->
      <strong class="text-sm">Circles</strong>
      <button type="reset" class="button button--small">Clear</button>
    </header>
    <div class="body" role="group" aria-label="Filter by circle">
      <label class="checkbox">
        <input type="checkbox" name="circle" value="design">
        <span>Design</span>
        <span class="text-muted">12<span class="visually-hidden"> members</span></span>
      </label>
    </div>
    <footer class="cluster cluster-between">
      <button type="reset" class="button button--small">Clear all</button>
      <button type="submit" class="button button--small button--accent">Apply</button>
    </footer>
  </form>
</details>
```

Panel size: `--panel-inline-size` (default `min(22rem, 100vw - 1 line)`) and `--panel-max-block-size` (default `min(70vh, 18 lines)`) on the `.dropdown--panel`.

## Calendar

```html
<!-- Month grid. Always render six rows. -->
<div class="calendar">
  <header>
    <button type="button" class="prev" aria-label="Previous month">…</button>
    <span class="title" id="cal-2027-01">January 2027</span>
    <button type="button" class="next" aria-label="Next month">…</button>
  </header>
  <table role="grid" aria-labelledby="cal-2027-01">
    <thead><tr><th scope="col" abbr="Monday">Mo</th> … </tr></thead>
    <tbody>
      <tr>
        <td class="outside"><button type="button" tabindex="-1">28</button></td>
        <td class="marked"><button type="button">1</button></td>
        <td class="today"><button type="button" aria-current="date">26</button></td>
        <td class="selected"><button type="button" aria-pressed="true">14</button></td>
        <td class="range-start"><button type="button" aria-pressed="true">8</button></td>
        <td class="in-range"><button type="button">9</button></td>
        <td class="range-end"><button type="button" aria-pressed="true">14</button></td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Two months side by side: omit .prev on the first, .next on the last -->
<div class="calendar-group">
  <div class="calendar">…</div>
  <div class="calendar">…</div>
</div>

<!-- One-line cells -->
<div class="calendar calendar--compact">…</div>
```

Cell states on `<td>`: `.outside`, `.today`, `.selected`, `.range-start`, `.in-range`, `.range-end`, `.marked`. Tokens: `--calendar-cell` (cell size), `--calendar-range-bg` (range band). Navigation and selection are state, not behaviour: the server render or a script updates the classes.

## Date Filter

```html
<!-- Date range fields (standalone or inside a panel). --small for toolbars. -->
<div class="date-range date-range--small">
  <input type="date" name="from" aria-label="Start date">
  <span aria-hidden="true">–</span>
  <input type="date" name="to" aria-label="End date">
</div>

<!-- Presets: radios styled as a list. .presets--inline for a wrapping row. -->
<div class="presets" role="group" aria-label="Preset ranges">
  <label class="radio"><input type="radio" name="range" value="7d" checked><span>Last week</span></label>
  <label class="radio"><input type="radio" name="range" value="fy"><span>This fiscal year</span></label>
</div>

<!-- Compact picker: fields + inline presets + one calendar -->
<details class="dropdown dropdown--panel date-filter">
  <summary class="trigger button button--small">
    <svg class="icon" aria-hidden="true">…</svg>
    <span>Jan 8 – Jan 14, 2027</span>
    <svg class="icon chevron" aria-hidden="true">…</svg>
  </summary>
  <form class="menu" method="get">
    <div class="body">
      <div class="date-range date-range--small">…</div>
      <div class="presets presets--inline" role="group" aria-label="Preset ranges">…</div>
      <div class="calendar">…</div>
    </div>
    <footer class="grid grid-columns-2">
      <button type="reset" class="button button--small">Cancel</button>
      <button type="submit" class="button button--small button--accent">Apply</button>
    </footer>
  </form>
</details>

<!-- Full picker: sidebar presets + two months, fields in the footer -->
<details class="dropdown dropdown--panel date-filter">
  <summary class="trigger button button--small">…</summary>
  <form class="menu" method="get">
    <div class="body sidebar">
      <div class="presets" role="group" aria-label="Preset ranges">…</div>
      <div class="calendar-group">
        <div class="calendar">…</div>
        <div class="calendar">…</div>
      </div>
    </div>
    <footer class="cluster cluster-between">
      <div class="date-range date-range--small">…</div>
      <div class="cluster cluster-compact">
        <button type="reset" class="button button--small">Cancel</button>
        <button type="submit" class="button button--small button--accent">Apply</button>
      </div>
    </footer>
  </form>
</details>

<!-- Presets only: same shell with just .presets in the body -->
<!-- Filter bar: several panels in a .cluster.cluster-compact -->
```

The panel sizes to its content. Under a 40em container the sidebar wraps and presets fall into an inline row above the calendars. Use `type="datetime-local"` for times.
