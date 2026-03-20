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
