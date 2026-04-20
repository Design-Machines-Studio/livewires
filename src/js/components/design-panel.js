// Design Panel Web Component -- vanilla, Shadow DOM, portable to Live Wires.
//
// PORTABILITY INVARIANT:
//   - Zero `import` statements at the top of this file.
//   - Uses only native browser APIs: HTMLElement, attachShadow, addEventListener,
//     localStorage, CSSStyleSheet, customElements.define, setTimeout, clearTimeout,
//     JSON.parse, JSON.stringify, document.createRange().createContextualFragment,
//     AbortController.
//   - No references to Datastar, Templ, Assembly-specific globals, frameworks.
//   - Must work in a plain HTML page with only Live Wires CSS loaded.
//
// Chunk 2 scope adds to Chunk 1:
//   - 8 tool toggles (baseline, columns, darkMode, grids, margins, outlines,
//     hideBg, redact). Each toggles a CSS class on the resolved overlay target.
//   - 4 settings controls: devColumns (number), subdivisions (select), devGap
//     (select), marginMode (select). Column + gap write to :root via
//     setProperty (--dev-columns, --dev-gap). Subdivisions sets
//     data-subdivisions on the overlay target. Margin mode sets
//     data-margin-mode on both overlay divs (#dev-column-overlay,
//     #dev-margin-overlay) when present.
//   - Keyboard shortcuts T/B/C/D/G/M/O/X/R with input-focus guard via
//     e.composedPath()[0].matches('input,textarea,[contenteditable]') to work
//     across the shadow boundary.
//   - AbortController on every addEventListener for clean teardown.
//   - data-panel-open attribute mirrored to document.body so
//     navigation.css:124-125 ([data-panel-open] .app-shell) continues to shift
//     the app shell when the panel opens, after Chunk 3 removes the Datastar
//     binding.
//   - Overlay target resolution via `overlay-target` attribute (default body).

const PANEL_CSS = `
  :host {
    /* Panel-scoped design tokens (hardcoded hex, immune to app scheme changes) */
    --dp-bg: #1A1A1A;
    --dp-bg-input: #252525;
    --dp-bg-elevated: #2E2E2E;
    --dp-border: #4A4A4A;
    --dp-text-muted: #A8A8A8;
    --dp-text-secondary: #D1D1D1;
    --dp-text: #F5F5F5;
    --dp-accent: #1966D9;
    --dp-accent-light: #5DAEFF;
    --dp-radius: 3px;
    --dp-space-xs: 6px;
    --dp-space-sm: 12px;
    --dp-space-md: 18px;
    --dp-width: 320px;

    display: block;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 0.75rem;
    line-height: 1.5;
    color: var(--dp-text);
  }

  .panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--dp-width);
    background: var(--dp-bg);
    color: var(--dp-text);
    border-left: 1px solid var(--dp-border);
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 250ms ease;
    box-sizing: border-box;
  }

  :host([open]) .panel {
    transform: translateX(0);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--dp-space-sm) var(--dp-space-md);
    border-bottom: 1px solid var(--dp-border);
    position: sticky;
    top: 0;
    background: var(--dp-bg);
    z-index: 1;
  }

  .header h2 {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0;
    color: var(--dp-text);
  }

  .close {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-block-size: 0;
    padding: var(--dp-space-xs);
    background: none;
    color: var(--dp-text-muted);
    border: none;
    border-radius: var(--dp-radius);
    font-size: 1rem;
    line-height: 0;
    cursor: pointer;
    box-sizing: border-box;
    transition: color 150ms ease;
  }

  .close:hover { color: var(--dp-text); }
  .close:focus-visible {
    outline: 2px solid var(--dp-accent-light);
    outline-offset: 2px;
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid var(--dp-border);
  }

  .tabs [role="tab"] {
    appearance: none;
    -webkit-appearance: none;
    flex: 1;
    padding: 4px 0;
    margin: 0;
    background: none;
    color: var(--dp-text-muted);
    border: none;
    border-radius: 0;
    border-bottom: 1px solid transparent;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 0.5625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    text-align: center;
    box-sizing: border-box;
    min-block-size: 0;
    line-height: 1;
    transition: color 150ms ease, border-color 150ms ease;
  }

  .tabs [role="tab"]:hover { color: var(--dp-text-secondary); }
  .tabs [role="tab"][aria-selected="true"] {
    color: var(--dp-text);
    border-bottom: 2px solid var(--dp-text);
  }
  .tabs [role="tab"]:focus-visible {
    outline: 2px solid var(--dp-accent-light);
    outline-offset: 2px;
  }

  .body { }

  .section {
    padding: var(--dp-space-sm) var(--dp-space-md);
    border-bottom: 1px solid var(--dp-bg-elevated);
  }

  .section-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--dp-text-muted);
    margin: 0 0 var(--dp-space-sm) 0;
  }

  /* Tool button grid */
  .tools {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--dp-space-xs);
  }

  .tool {
    appearance: none;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-block-size: 0;
    padding: 4px;
    background: var(--dp-bg-elevated);
    color: var(--dp-text-secondary);
    border: 1px solid var(--dp-border);
    border-radius: var(--dp-radius);
    font-size: 0;
    line-height: 1;
    cursor: pointer;
    text-align: center;
    user-select: none;
    box-sizing: border-box;
    transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
  }

  .tool:hover {
    background: var(--dp-border);
    color: var(--dp-text);
  }

  .tool[data-active] {
    background: var(--dp-accent);
    border-color: var(--dp-accent-light);
    color: var(--dp-text);
  }

  .tool:focus-visible {
    outline: 2px solid var(--dp-accent-light);
    outline-offset: 2px;
  }

  .tool-key {
    display: block;
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    line-height: 1;
  }

  .tool-label {
    display: block;
    font-size: 0.5625rem;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    opacity: 0.55;
    line-height: 1;
    margin-top: 2px;
  }

  /* Settings */
  .settings {
    display: grid;
    gap: var(--dp-space-xs);
  }

  .setting {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: var(--dp-space-sm);
  }

  .setting label {
    font-size: 0.75rem;
    color: var(--dp-text-muted);
  }

  .setting select,
  .setting input[type="number"] {
    appearance: none;
    -webkit-appearance: none;
    min-block-size: 0;
    background: var(--dp-bg-elevated);
    border: 1px solid var(--dp-border);
    color: var(--dp-text);
    padding: var(--dp-space-xs) var(--dp-space-sm);
    border-radius: var(--dp-radius);
    font-family: inherit;
    font-size: 0.75rem;
    min-width: 80px;
    box-sizing: border-box;
  }

  .setting select:focus-visible,
  .setting input[type="number"]:focus-visible {
    outline: 2px solid var(--dp-accent-light);
    outline-offset: 2px;
  }

  /* Trigger FAB */
  .trigger {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-block-size: 0;
    position: fixed;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.8);
    color: rgba(255, 255, 255, 0.7);
    border: none;
    padding: 10px;
    line-height: 0;
    border-radius: 3px;
    font-size: 0.75rem;
    cursor: pointer;
    user-select: none;
    box-sizing: border-box;
    z-index: 10000;
    opacity: 0.4;
    transition: opacity 150ms ease;
  }

  .trigger:hover { opacity: 1; color: #fff; }
  .trigger:focus-visible {
    outline: 2px solid var(--dp-accent-light);
    outline-offset: 2px;
  }
  .trigger svg { display: block; }

  :host([open]) .trigger { visibility: hidden; }

  /* Slot for Datastar-driven token editor partials (Chunk 3).
     Slotted children are light DOM; shadow CSS can only target :host and
     the slot descendant selector ::slotted(). */
  .body > slot {
    display: contents;
  }

  /* Hide the Guides body when a non-Guides tab is active. */
  :host(:not([active-tab="guides"])) .guides-body {
    display: none;
  }

  /* Hide all slotted editors by default. */
  ::slotted([slot="editor"][data-tab]) {
    display: none;
  }

  /* Show the slotted editor whose data-tab matches the active tab. */
  :host([active-tab="typography"]) ::slotted([slot="editor"][data-tab="typography"]) { display: block; }
  :host([active-tab="colors"])     ::slotted([slot="editor"][data-tab="colors"])     { display: block; }
  :host([active-tab="theme"])      ::slotted([slot="editor"][data-tab="theme"])      { display: block; }

  /* Hidden tab button (slotchange empty-slot detection). */
  .tabs [role="tab"].hidden {
    display: none;
  }
`;

// Constructable Stylesheets: Chrome 73+, Firefox 101+, Safari 16.4+.
let sheet = null;
const SUPPORTS_ADOPTED = (
  typeof CSSStyleSheet === 'function' &&
  typeof CSSStyleSheet.prototype.replaceSync === 'function'
);
if (SUPPORTS_ADOPTED) {
  sheet = new CSSStyleSheet();
  sheet.replaceSync(PANEL_CSS);
}

// Tools: name -> CSS class on overlay target, keyboard letter.
const TOOLS = [
  { name: 'baseline',  key: 'b', label: 'Baseline', className: 'show-baseline' },
  { name: 'columns',   key: 'c', label: 'Columns',  className: 'show-columns' },
  { name: 'darkMode',  key: 'd', label: 'Dark',     className: 'dark-mode' },
  { name: 'grids',     key: 'g', label: 'Grids',    className: 'dev-outline-grids' },
  { name: 'margins',   key: 'm', label: 'Margins',  className: 'show-margins' },
  { name: 'outlines',  key: 'o', label: 'Outlines', className: 'dev-outline' },
  { name: 'hideBg',    key: 'x', label: 'BG Off',   className: 'hide-backgrounds' },
  { name: 'redact',    key: 'r', label: 'Redact',   className: 'redact' },
];

// Settings definitions. target tells us where the value flows:
//   'cssvar'                  -> document.documentElement.style.setProperty(cssvar, value)
//   'overlayattr'             -> overlay target gets the attribute (data-subdivisions)
//   'overlay-data-margin-mode' -> both dev-column-overlay AND dev-margin-overlay get data-margin-mode
const SETTINGS = {
  devColumns: {
    type: 'number',
    min: 1,
    max: 24,
    label: 'Columns',
    target: 'cssvar',
    cssvar: '--dev-columns',
  },
  subdivisions: {
    type: 'select',
    options: [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
    ],
    label: 'Subdivisions',
    target: 'overlayattr',
    attr: 'data-subdivisions',
  },
  devGap: {
    type: 'select',
    options: [
      { value: 'var(--gutter)',   label: 'Default' },
      { value: '0',               label: '0' },
      { value: 'var(--line-1px)', label: '1px' },
      { value: 'var(--line-025)', label: '0.25' },
      { value: 'var(--line-05)',  label: '0.5' },
      { value: 'var(--line-1)',   label: '1' },
      { value: 'var(--line-2)',   label: '2' },
    ],
    label: 'Gap',
    target: 'cssvar',
    cssvar: '--dev-gap',
  },
  marginMode: {
    type: 'select',
    options: [
      { value: 'section',    label: 'Section' },
      { value: 'full-bleed', label: 'Full-bleed' },
      { value: 'wide',       label: 'Wide' },
    ],
    label: 'Margin',
    target: 'overlay-data-margin-mode',
  },
};

const DEFAULT_STATE = {
  open: false,
  activeTab: 'guides',
  // Tools (all off by default)
  baseline: false,
  columns: false,
  darkMode: false,
  grids: false,
  margins: false,
  outlines: false,
  hideBg: false,
  redact: false,
  // Settings (defaults match prior Datastar signal init values)
  devColumns: 3,
  subdivisions: '2',
  devGap: 'var(--gutter)',
  marginMode: 'section',
};

const STORAGE_KEY = 'design-panel:state';

// Three-vertical-bars SVG preserved from design_panel.templ:185.
const TRIGGER_SVG = `
  <svg width="16" height="16" viewBox="0 0 38 38" fill="currentColor" aria-hidden="true">
    <path d="M0 0L0 38L38 38L38 30L8 30L8 0L0 0Z"/>
    <rect x="10" width="8" height="28"/>
    <rect x="30" width="8" height="28"/>
    <rect x="20" width="8" height="28"/>
  </svg>
`;

function buildToolsHTML() {
  return TOOLS.map((t) => `
    <button type="button" class="tool" data-tool="${t.name}" aria-pressed="false" title="Toggle ${t.label} (${t.key.toUpperCase()})">
      <span class="tool-key">${t.key.toUpperCase()}</span>
      <span class="tool-label">${t.label}</span>
    </button>
  `).join('');
}

function buildSettingsHTML() {
  return Object.entries(SETTINGS).map(([name, def]) => {
    let control;
    if (def.type === 'number') {
      control = `<input type="number" data-setting="${name}" min="${def.min}" max="${def.max}" />`;
    } else {
      const opts = def.options.map((o) => `<option value="${o.value}">${o.label}</option>`).join('');
      control = `<select data-setting="${name}">${opts}</select>`;
    }
    return `
      <div class="setting">
        <label for="dp-setting-${name}">${def.label}</label>
        ${control.replace('data-setting=', `id="dp-setting-${name}" data-setting=`)}
      </div>
    `;
  }).join('');
}

const PANEL_TEMPLATE = `
  <aside class="panel" part="panel">
    <div class="header">
      <h2>Design Tools</h2>
      <button type="button" class="close" aria-label="Close design tools">&times;</button>
    </div>
    <div class="tabs" role="tablist">
      <button type="button" role="tab" data-tab="guides" aria-label="Guides tab">Guides</button>
      <button type="button" role="tab" data-tab="typography" aria-label="Typography tab">Type</button>
      <button type="button" role="tab" data-tab="colors" aria-label="Colors tab">Colour</button>
      <button type="button" role="tab" data-tab="theme" aria-label="Theme tab">Theme</button>
    </div>
    <div class="body">
      <div class="guides-body">
        <div class="section">
          <h3 class="section-title">Overlays</h3>
          <div class="tools">${buildToolsHTML()}</div>
        </div>
        <div class="section">
          <h3 class="section-title">Grid</h3>
          <div class="settings">${buildSettingsHTML()}</div>
        </div>
      </div>
      <slot name="editor"></slot>
    </div>
  </aside>
  <button type="button" class="trigger" aria-label="Open design tools">${TRIGGER_SVG}</button>
`;

class DesignPanel extends HTMLElement {
  static observedAttributes = ['open', 'active-tab', 'overlay-target'];

  #state = { ...DEFAULT_STATE };
  #saveTimer = null;
  #rendered = false;
  #controller = null;
  #overlayTarget = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    if (SUPPORTS_ADOPTED && sheet) {
      this.shadowRoot.adoptedStyleSheets = [sheet];
    } else {
      const styleEl = document.createElement('style');
      styleEl.textContent = PANEL_CSS;
      this.shadowRoot.appendChild(styleEl);
    }
  }

  connectedCallback() {
    this.#controller = new AbortController();
    this.#load();
    this.#resolveOverlayTarget();
    this.#render();
    this.#reflectTab();
    this.#applyState();
    this.inert = !this.hasAttribute('open');
    this.#installKeyboard();
    this.#installSlotListener();
  }

  disconnectedCallback() {
    if (this.#controller) {
      this.#controller.abort();
      this.#controller = null;
    }
    if (this.#saveTimer) {
      clearTimeout(this.#saveTimer);
      this.#saveTimer = null;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'open') {
      this.#state.open = newValue !== null;
      this.inert = !this.hasAttribute('open');
    } else if (name === 'active-tab') {
      this.#state.activeTab = newValue || 'guides';
      if (this.#rendered) this.#reflectTab();
    } else if (name === 'overlay-target') {
      // Re-resolve if target changes at runtime.
      this.#resolveOverlayTarget();
    }
  }

  #resolveOverlayTarget() {
    const selector = this.getAttribute('overlay-target') || 'body';
    try {
      this.#overlayTarget = document.querySelector(selector) || document.body;
    } catch (e) {
      // Invalid selector syntax -- fall back to body.
      this.#overlayTarget = document.body;
    }
  }

  #render() {
    const fragment = document.createRange().createContextualFragment(PANEL_TEMPLATE);
    this.shadowRoot.appendChild(fragment);
    this.#rendered = true;

    const signal = this.#controller ? this.#controller.signal : undefined;
    const opts = signal ? { signal } : undefined;

    const closeBtn = this.shadowRoot.querySelector('.close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.#setOpen(false), opts);

    const triggerBtn = this.shadowRoot.querySelector('.trigger');
    if (triggerBtn) triggerBtn.addEventListener('click', () => this.#setOpen(true), opts);

    this.shadowRoot.querySelectorAll('[role="tab"]').forEach((btn) => {
      btn.addEventListener('click', () => this.#setActiveTab(btn.dataset.tab), opts);
    });

    this.shadowRoot.querySelectorAll('.tool').forEach((btn) => {
      btn.addEventListener('click', () => this.#toggleTool(btn.dataset.tool), opts);
    });

    // Settings: number uses 'input', select uses 'change'.
    this.shadowRoot.querySelectorAll('[data-setting]').forEach((el) => {
      const name = el.dataset.setting;
      const def = SETTINGS[name];
      if (!def) return;
      const evt = def.type === 'number' ? 'input' : 'change';
      el.addEventListener(evt, (e) => {
        const v = def.type === 'number' ? Number(e.target.value) : e.target.value;
        this.#setSetting(name, v);
      }, opts);
    });
  }

  #setOpen(value) {
    this.#state.open = !!value;
    if (this.#state.open) this.setAttribute('open', '');
    else this.removeAttribute('open');
    // Mirror to document.body so navigation.css [data-panel-open] .app-shell
    // continues to shift the app-shell even after Chunk 3 removes the
    // data-attr:data-panel-open Datastar binding from shell.templ.
    document.body.toggleAttribute('data-panel-open', this.#state.open);
    this.#save();
  }

  #setActiveTab(tab) {
    if (!tab) return;
    this.#state.activeTab = tab;
    this.setAttribute('active-tab', tab);
    this.#reflectTab();
    this.#save();
  }

  #reflectTab() {
    this.shadowRoot.querySelectorAll('[role="tab"]').forEach((btn) => {
      const active = btn.dataset.tab === this.#state.activeTab;
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      btn.toggleAttribute('data-active', active);
    });
  }

  #toggleTool(name) {
    const tool = TOOLS.find((t) => t.name === name);
    if (!tool) return;
    this.#state[name] = !this.#state[name];
    if (this.#overlayTarget) {
      this.#overlayTarget.classList.toggle(tool.className, this.#state[name]);
    }
    const btn = this.shadowRoot.querySelector(`[data-tool="${name}"]`);
    if (btn) {
      btn.setAttribute('aria-pressed', this.#state[name] ? 'true' : 'false');
      btn.toggleAttribute('data-active', this.#state[name]);
    }
    this.#save();
  }

  #setSetting(name, value) {
    this.#state[name] = value;
    const def = SETTINGS[name];
    if (!def) return;
    if (def.target === 'cssvar') {
      document.documentElement.style.setProperty(def.cssvar, String(value));
    } else if (def.target === 'overlayattr') {
      if (this.#overlayTarget) {
        this.#overlayTarget.setAttribute(def.attr, String(value));
      }
    } else if (def.target === 'overlay-data-margin-mode') {
      // Applies to BOTH overlay divs per prototyping.css selectors.
      const col = document.getElementById('dev-column-overlay');
      const mar = document.getElementById('dev-margin-overlay');
      if (col) col.setAttribute('data-margin-mode', String(value));
      if (mar) mar.setAttribute('data-margin-mode', String(value));
    }
    this.#save();
  }

  #reflectSettingControl(name) {
    const el = this.shadowRoot.querySelector(`[data-setting="${name}"]`);
    if (!el) return;
    if (el.value !== String(this.#state[name])) {
      el.value = String(this.#state[name]);
    }
  }

  #applyState() {
    // Tools -> classes on overlay target + button pressed state
    for (const tool of TOOLS) {
      const on = !!this.#state[tool.name];
      if (this.#overlayTarget) {
        this.#overlayTarget.classList.toggle(tool.className, on);
      }
      const btn = this.shadowRoot.querySelector(`[data-tool="${tool.name}"]`);
      if (btn) {
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.toggleAttribute('data-active', on);
      }
    }
    // Settings -> CSS vars / overlay attributes + reflect the control values
    for (const name of Object.keys(SETTINGS)) {
      if (this.#state[name] !== undefined) {
        this.#setSetting(name, this.#state[name]);
        this.#reflectSettingControl(name);
      }
    }
    // Panel open state -> body attribute (navigation.css app-shell shift)
    document.body.toggleAttribute('data-panel-open', !!this.#state.open);
  }

  #installKeyboard() {
    const signal = this.#controller ? this.#controller.signal : undefined;
    const opts = signal ? { signal } : undefined;
    const handler = (event) => {
      // Input-focus guard via composedPath() -- works across shadow boundary.
      const path = event.composedPath();
      const top = path && path[0];
      if (top && top.matches && top.matches('input,textarea,[contenteditable]')) return;
      // Ignore modifier combos so Cmd+K (search) stays separate.
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = (event.key || '').toLowerCase();
      if (!key) return;
      if (key === 't') {
        this.#setOpen(!this.#state.open);
        event.preventDefault();
        return;
      }
      const tool = TOOLS.find((t) => t.key === key);
      if (tool) {
        this.#toggleTool(tool.name);
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', handler, opts);
  }

  // Chunk 3: observe the editor slot. When slotted children change, hide tab
  // buttons whose data-tab has no assigned content (non-SuperAdmin users see
  // only the Guides tab). If the persisted active tab is no longer slotted,
  // fall back to Guides (prevents blank panel after a role change).
  #installSlotListener() {
    const slot = this.shadowRoot.querySelector('slot[name="editor"]');
    if (!slot) return;
    const signal = this.#controller ? this.#controller.signal : undefined;
    const opts = signal ? { signal } : undefined;
    const update = () => {
      const assigned = slot.assignedElements();
      const assignedTabs = new Set(
        assigned
          .map((el) => el.getAttribute('data-tab'))
          .filter((t) => !!t),
      );
      for (const btn of this.shadowRoot.querySelectorAll('[role="tab"]')) {
        const tab = btn.dataset.tab;
        if (tab === 'guides') continue; // Guides always rendered in shadow DOM.
        btn.classList.toggle('hidden', !assignedTabs.has(tab));
      }
      // Fall back to Guides if the active tab lost its slot.
      if (this.#state.activeTab !== 'guides' && !assignedTabs.has(this.#state.activeTab)) {
        this.#setActiveTab('guides');
      }
    };
    slot.addEventListener('slotchange', update, opts);
    update(); // Initial sync (covers the case where children were already
              // assigned before connectedCallback ran).
  }

  #load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          Object.assign(this.#state, parsed);
        }
      }
    } catch (e) {
      // Corrupt JSON or storage disabled -> defaults.
    }
    if (this.#state.open) this.setAttribute('open', '');
    else this.removeAttribute('open');
    if (this.#state.activeTab) this.setAttribute('active-tab', this.#state.activeTab);
  }

  #save() {
    if (this.#saveTimer) clearTimeout(this.#saveTimer);
    this.#saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#state));
      } catch (e) {
        // Quota / disabled -> silently ignore.
      }
      this.#saveTimer = null;
    }, 200);
  }
}

customElements.define('design-panel', DesignPanel);
