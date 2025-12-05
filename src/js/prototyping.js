/**
 * Live Wires Dev Tools
 *
 * Prototyping utilities with keyboard shortcuts and visual menubar
 * Press '?' to show/hide the dev tools menubar
 */

class DevTools {
  constructor() {
    // Main toolbar tools
    this.tools = {
      darkMode: {
        key: 'd',
        label: 'Theme',
        target: 'body',
        active: false,
        customToggle: 'theme'
      },
      baseline: {
        key: 'b',
        label: 'Baseline',
        class: 'show-baseline',
        target: 'body',
        active: false
      },
      columns: {
        key: 'c',
        label: 'Columns',
        class: 'show-columns',
        target: 'body',
        active: false
      },
      margins: {
        key: 'm',
        label: 'Margins',
        class: 'show-margins',
        target: 'body',
        active: false
      },
      grids: {
        key: 'g',
        label: 'CSS Grids',
        class: 'dev-outline-grids',
        target: 'body',
        active: false
      },
      outlines: {
        key: 'o',
        label: 'Outlines',
        class: 'dev-outline',
        target: 'body',
        active: false
      },
      colors: {
        key: 'x',
        label: 'BG Colors',
        selector: '[class*="bg-"], [class*="scheme-"]',
        toggle: 'background',
        active: true
      },
      redact: {
        key: 'r',
        label: 'Redact',
        class: 'redact',
        target: 'body',
        active: false
      }
    };

    // Settings (in popover)
    this.settingsConfig = {
      subdivisions: {
        label: 'Baseline subdivisions',
        options: [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' }
        ]
      },
      gutter: {
        label: 'Gap',
        options: [
          { value: '0', label: '0' },
          { value: 'var(--line-1px)', label: '1px' },
          { value: 'var(--line-025)', label: '1/4' },
          { value: 'var(--line-05)', label: '1/2' },
          { value: 'var(--line-1)', label: '1' },
          { value: 'var(--line-2)', label: '2' }
        ]
      },
      margin: {
        label: 'Margin',
        options: [
          { value: 'section', label: 'Section' },
          { value: 'full-bleed', label: 'Full-bleed' },
          { value: 'wide', label: 'Wide' }
        ]
      }
    };

    this.columnCount = 3;
    this.subdivisionsValue = '2';
    this.gutterValue = 'var(--line-1)';
    this.marginMode = 'section';

    this.menubarVisible = true;
    this.init();
  }

  init() {
    console.log('🛠️ Live Wires Dev Tools initializing...');

    // Load saved state from localStorage
    this.loadState();

    // Create overlay elements
    this.createOverlays();

    // Create menubar
    this.createMenubar();
    console.log('✅ Dev Tools menubar created');

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Apply saved states
    this.applyStates();

    // Add outline styles
    this.addOutlineStyles();

    // Setup resize listener for responsive settings
    this.setupResizeListener();

    console.log('✅ Dev Tools ready! Press ? to toggle menubar');
  }

  setupResizeListener() {
    // Debounced resize handler for responsive settings
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.onResize(), 100);
    });
  }

  onResize() {
    // Re-apply responsive settings when viewport changes
    // This ensures overlays stay in sync with CSS media query changes
    if (this.marginMode === 'section') {
      // Force CSS to recalculate by toggling the attribute
      this.updateMarginMode(this.marginMode);
    }

    // Update grid column counts for auto-fit grids
    if (this.tools.grids.active) {
      this.updateGridColumnCounts();
    }
  }

  updateGridColumnCounts() {
    // Detect actual column count and gap for all grids and set attributes for dev overlay
    const grids = document.querySelectorAll('.grid');
    grids.forEach(grid => {
      const style = getComputedStyle(grid);

      // Detect column count
      const columns = style.gridTemplateColumns.split(' ').filter(c => c !== 'none' && c.trim()).length;
      if (columns > 0) {
        grid.dataset.devCols = columns;
        grid.style.setProperty('--grid-columns', columns);
      }

      // Detect gap (use column gap, fallback to row gap)
      const gap = style.columnGap || style.rowGap || style.gap;
      if (gap && gap !== 'normal') {
        grid.style.setProperty('--grid-gap', gap);
      }
    });
  }

  createOverlays() {
    // Column grid overlay
    this.columnOverlay = document.createElement('div');
    this.columnOverlay.id = 'dev-column-overlay';
    document.body.appendChild(this.columnOverlay);

    // Margin overlay
    this.marginOverlay = document.createElement('div');
    this.marginOverlay.id = 'dev-margin-overlay';
    document.body.appendChild(this.marginOverlay);

    // Apply initial values
    this.updateColumnCount(this.columnCount);
    this.updateSubdivisions(this.subdivisionsValue);
    this.updateGutter(this.gutterValue);
    this.updateMarginMode(this.marginMode);
  }

  updateColumnCount(count) {
    this.columnCount = Math.max(1, Math.min(24, parseInt(count) || 3));
    document.body.style.setProperty('--dev-columns', this.columnCount);

    // Update input if it exists
    const input = this.menubar?.querySelector('#dev-columns-input');
    if (input && input.value !== String(this.columnCount)) {
      input.value = this.columnCount;
    }

    this.saveState();
  }

  updateSubdivisions(value) {
    this.subdivisionsValue = value;
    // Set data attribute for CSS selector-based subdivision grids
    document.body.dataset.subdivisions = value;

    // Update select if it exists
    const select = this.menubar?.querySelector('#dev-subdivisions-select');
    if (select && select.value !== value) {
      select.value = value;
    }

    this.saveState();
  }

  updateGutter(value) {
    this.gutterValue = value;
    document.body.style.setProperty('--dev-gap', value);

    // Update select if it exists
    const select = this.menubar?.querySelector('#dev-gutter-select');
    if (select && select.value !== value) {
      select.value = value;
    }

    this.saveState();
  }

  updateMarginMode(mode) {
    this.marginMode = mode;

    // Set data attribute on overlays for CSS to use
    this.columnOverlay.dataset.marginMode = mode;
    this.marginOverlay.dataset.marginMode = mode;

    // Update select if it exists
    const select = this.menubar?.querySelector('#dev-margins-select');
    if (select && select.value !== mode) {
      select.value = mode;
    }

    this.saveState();
  }

  loadState() {
    const saved = localStorage.getItem('livewires-dev-tools');
    if (saved) {
      try {
        const state = JSON.parse(saved);

        // Migration: Convert old marginValue (CSS string) to marginMode (preset name)
        if (state.marginValue && !state.marginMode) {
          state.marginMode = 'section'; // Default to section mode
          delete state.marginValue;
        }

        Object.keys(state).forEach(key => {
          if (key === 'columnCount') {
            this.columnCount = state[key];
          } else if (key === 'subdivisionsValue') {
            this.subdivisionsValue = state[key];
          } else if (key === 'gutterValue') {
            this.gutterValue = state[key];
          } else if (key === 'marginMode') {
            this.marginMode = state[key];
          } else if (this.tools[key]) {
            this.tools[key].active = state[key];
          }
        });
      } catch (e) {
        console.warn('Could not load dev tools state');
      }
    }
  }

  saveState() {
    const state = {
      columnCount: this.columnCount,
      subdivisionsValue: this.subdivisionsValue,
      gutterValue: this.gutterValue,
      marginMode: this.marginMode
    };
    Object.keys(this.tools).forEach(key => {
      state[key] = this.tools[key].active;
    });
    try {
      localStorage.setItem('livewires-dev-tools', JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save dev tools state:', e.message);
    }
  }

  applyStates() {
    // Apply saved toggle states without re-toggling
    Object.keys(this.tools).forEach(key => {
      if (this.tools[key].active) {
        this.applyToolState(key);
      }
    });
  }

  applyToolState(toolKey) {
    const tool = this.tools[toolKey];
    if (!tool || !tool.active) return;

    // Apply the state based on tool type
    if (tool.customToggle === 'theme') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.remove('dark-mode', 'light-mode');
      if (systemPrefersDark) {
        document.body.classList.add('light-mode');
      } else {
        document.body.classList.add('dark-mode');
      }
    } else if (tool.class && tool.target) {
      const target = tool.target === 'body' ? document.body : document.querySelector(tool.target);
      if (target) {
        target.classList.add(tool.class);
      }
      // Update grid column counts when CSS Grids is restored on page load
      if (toolKey === 'grids') {
        this.updateGridColumnCounts();
      }
    } else if (tool.selector && tool.toggle) {
      // Background toggle - active means show backgrounds
      // (default active: true means backgrounds visible)
    }

    // Update button state
    const button = this.menubar?.querySelector(`[data-tool="${toolKey}"]`);
    if (button) {
      button.classList.add('active');
    }
  }

  createMenubar() {
    const menubar = document.createElement('div');
    menubar.id = 'dev-tools-menubar';
    menubar.className = 'dev-tools-menubar';
    menubar.style.display = this.menubarVisible ? 'flex' : 'none';

    // Create tool buttons
    Object.keys(this.tools).forEach(key => {
      const tool = this.tools[key];
      const button = document.createElement('button');
      button.className = 'dev-tool-button';
      button.dataset.tool = key;
      button.innerHTML = `<span class="dev-tool-label">${tool.label}</span> <kbd>${tool.key.toUpperCase()}</kbd>`;
      button.onclick = () => this.toggle(key);

      if (tool.active) {
        button.classList.add('active');
      }

      menubar.appendChild(button);
    });

    // Create settings button and popover
    const settingsWrapper = document.createElement('div');
    settingsWrapper.className = 'dev-settings-wrapper';

    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'dev-tool-button dev-settings-btn';
    settingsBtn.innerHTML = 'Settings';
    settingsBtn.onclick = () => this.toggleSettings();
    settingsWrapper.appendChild(settingsBtn);

    // Settings popover
    const popover = document.createElement('div');
    popover.className = 'dev-settings-popover';
    popover.id = 'dev-settings-popover';

    // Columns setting
    const colRow = document.createElement('div');
    colRow.className = 'dev-setting-row';
    colRow.innerHTML = `<label>Columns</label>`;
    const colInput = document.createElement('input');
    colInput.type = 'number';
    colInput.id = 'dev-columns-input';
    colInput.className = 'dev-tool-input';
    colInput.value = this.columnCount;
    colInput.min = 1;
    colInput.max = 24;
    colInput.addEventListener('change', (e) => this.updateColumnCount(e.target.value));
    colInput.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        this.updateColumnCount(e.target.value);
        e.target.blur();
      }
    });
    colRow.appendChild(colInput);
    popover.appendChild(colRow);

    // Subdivisions setting
    const subRow = document.createElement('div');
    subRow.className = 'dev-setting-row';
    subRow.innerHTML = `<label>Baseline subdivisions</label>`;
    const subSelect = document.createElement('select');
    subSelect.id = 'dev-subdivisions-select';
    subSelect.className = 'dev-tool-select';
    this.settingsConfig.subdivisions.options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      subSelect.appendChild(option);
    });
    subSelect.value = this.subdivisionsValue;
    subSelect.addEventListener('change', (e) => this.updateSubdivisions(e.target.value));
    subRow.appendChild(subSelect);
    popover.appendChild(subRow);

    // Gap setting
    const gapRow = document.createElement('div');
    gapRow.className = 'dev-setting-row';
    gapRow.innerHTML = `<label>Gap</label>`;
    const gapSelect = document.createElement('select');
    gapSelect.id = 'dev-gutter-select';
    gapSelect.className = 'dev-tool-select';
    this.settingsConfig.gutter.options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      gapSelect.appendChild(option);
    });
    gapSelect.value = this.gutterValue;
    gapSelect.addEventListener('change', (e) => this.updateGutter(e.target.value));
    gapRow.appendChild(gapSelect);
    popover.appendChild(gapRow);

    // Margin setting
    const marginRow = document.createElement('div');
    marginRow.className = 'dev-setting-row';
    marginRow.innerHTML = `<label>Margin</label>`;
    const marginSelect = document.createElement('select');
    marginSelect.id = 'dev-margins-select';
    marginSelect.className = 'dev-tool-select';
    this.settingsConfig.margin.options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      marginSelect.appendChild(option);
    });
    marginSelect.value = this.marginMode;
    marginSelect.addEventListener('change', (e) => this.updateMarginMode(e.target.value));
    marginRow.appendChild(marginSelect);
    popover.appendChild(marginRow);

    settingsWrapper.appendChild(popover);
    menubar.appendChild(settingsWrapper);

    // Help text (clickable to hide)
    const help = document.createElement('button');
    help.className = 'dev-tools-help';
    help.innerHTML = '<kbd>?</kbd> hide';
    help.onclick = () => this.toggleMenubar();
    menubar.appendChild(help);

    document.body.appendChild(menubar);
    this.menubar = menubar;
    this.settingsPopover = popover;
  }

  toggleSettings() {
    this.settingsPopover.classList.toggle('open');
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignore if user is typing in an input/textarea
      if (e.target.matches('input, textarea, [contenteditable]')) {
        return;
      }

      // Toggle menubar with '?'
      if (e.key === '?') {
        e.preventDefault();
        this.toggleMenubar();
        return;
      }

      // Check for tool shortcuts
      Object.keys(this.tools).forEach(key => {
        if (e.key === this.tools[key].key && !e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          this.toggle(key);
        }
      });
    });
  }

  toggleMenubar() {
    this.menubarVisible = !this.menubarVisible;
    this.menubar.style.display = this.menubarVisible ? 'flex' : 'none';
  }

  toggle(toolKey, skipSave = false) {
    const tool = this.tools[toolKey];
    if (!tool) return;

    tool.active = !tool.active;

    // Handle different toggle types
    if (tool.customToggle === 'theme') {
      this.toggleTheme(toolKey);
    } else if (tool.class && tool.target) {
      this.toggleClass(toolKey);
    } else if (tool.selector && tool.toggle) {
      this.toggleBackground(toolKey);
    }

    // Update button state
    const button = this.menubar?.querySelector(`[data-tool="${toolKey}"]`);
    if (button) {
      button.classList.toggle('active', tool.active);
    }

    // Save state
    if (!skipSave) {
      this.saveState();
    }
  }

  toggleClass(toolKey) {
    const tool = this.tools[toolKey];
    const target = tool.target === 'body' ? document.body : document.querySelector(tool.target);

    if (!target) return;

    target.classList.toggle(tool.class, tool.active);

    // Update grid column counts when CSS Grids toggle is activated
    if (toolKey === 'grids' && tool.active) {
      this.updateGridColumnCounts();
    }
  }

  toggleBackground(toolKey) {
    const tool = this.tools[toolKey];
    const elements = document.querySelectorAll(tool.selector);

    elements.forEach(el => {
      if (tool.active) {
        el.style.removeProperty('background-color');
      } else {
        el.style.backgroundColor = 'transparent';
      }
    });
  }

  toggleTheme(toolKey) {
    const tool = this.tools[toolKey];
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Remove both classes first
    document.body.classList.remove('dark-mode', 'light-mode');

    if (tool.active) {
      // Apply the opposite of system preference
      if (systemPrefersDark) {
        document.body.classList.add('light-mode');
      } else {
        document.body.classList.add('dark-mode');
      }
    }
    // When inactive, no class = follow system preference

    // Update button label to show current override
    const button = this.menubar?.querySelector(`[data-tool="${toolKey}"]`);
    if (button) {
      const label = button.querySelector('.dev-tool-label');
      if (tool.active) {
        label.textContent = systemPrefersDark ? 'Light' : 'Dark';
      } else {
        label.textContent = 'Theme';
      }
    }
  }

  addOutlineStyles() {
    const style = document.createElement('style');
    style.id = 'dev-tools-styles';
    style.textContent = `
      /* Dev Tools Menubar */
      .dev-tools-menubar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.95);
        color: #fff;
        padding: 6px 12px;
        display: flex;
        gap: 4px;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
      }

      .dev-tool-button {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: transparent;
        border: none;
        color: rgba(255,255,255,0.8);
        cursor: pointer;
        font-family: inherit;
        font-size: 14px;
        border-radius: 4px;
        transition: background 0.15s, color 0.15s;
      }

      .dev-tool-button:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
      }

      .dev-tool-button.active {
        background: rgba(100, 200, 255, 0.2);
        color: #6be0ff;
      }

      .dev-tool-button kbd {
        font-size: 10px;
        font-family: ui-monospace, monospace;
        padding: 2px 4px;
        background: rgba(255,255,255,0.15);
        border-radius: 3px;
        margin-left: 2px;
      }

      .dev-tool-button.active kbd {
        background: rgba(100, 200, 255, 0.3);
      }

      /* Settings wrapper and popover */
      .dev-settings-wrapper {
        position: relative;
      }

      .dev-settings-btn {
        border-left: 1px solid rgba(255,255,255,0.2);
        margin-left: 4px;
        padding-left: 12px;
      }

      .dev-settings-popover {
        position: absolute;
        bottom: 100%;
        right: 0;
        background: rgba(30, 30, 30, 0.98);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 6px;
        padding: 6px 10px;
        margin-bottom: 8px;
        min-width: 240px;
        display: none;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        line-height: 1.2;
      }

      .dev-settings-popover.open {
        display: block;
      }

      .dev-setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 4px 0;
      }

      .dev-setting-row label {
        font-size: 12px;
        color: rgba(255,255,255,0.7);
        white-space: nowrap;
      }

      .dev-tool-input,
      .dev-tool-select {
        width: 70px;
        padding: 3px 6px;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        color: #fff;
        font-family: ui-monospace, monospace;
        font-size: 11px;
        text-align: center;
        box-sizing: border-box;
      }

      .dev-tool-input::-webkit-outer-spin-button,
      .dev-tool-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .dev-tool-input[type=number] {
        -moz-appearance: textfield;
      }

      .dev-tool-select {
        cursor: pointer;
        text-align: left;
        padding-right: 20px;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='%23999'%3E%3Cpath d='M0 0l5 6 5-6z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 6px center;
      }

      .dev-tool-input:focus,
      .dev-tool-select:focus {
        outline: none;
        border-color: #6be0ff;
      }

      .dev-tools-help {
        margin-left: auto;
        padding: 4px 8px;
        padding-left: 12px;
        color: rgba(255,255,255,0.5);
        font-size: 12px;
        font-family: inherit;
        border: none;
        border-left: 1px solid rgba(255,255,255,0.2);
        background: transparent;
        cursor: pointer;
        border-radius: 0 4px 4px 0;
        transition: color 0.15s, background 0.15s;
      }

      .dev-tools-help:hover {
        color: rgba(255,255,255,0.8);
        background: rgba(255,255,255,0.1);
      }

      .dev-tools-help kbd {
        font-size: 10px;
        font-family: ui-monospace, monospace;
        padding: 2px 4px;
        background: rgba(255,255,255,0.15);
        border-radius: 3px;
      }

      /* Layout Outlines - All layout primitives */
      body.dev-outline .stack,
      body.dev-outline .cluster,
      body.dev-outline .grid,
      body.dev-outline .sidebar,
      body.dev-outline .center,
      body.dev-outline .box,
      body.dev-outline .cover,
      body.dev-outline .section {
        outline: 2px solid color-mix(in srgb, var(--color-accent, #0066ff) 50%, transparent);
        outline-offset: -2px;
      }

      body.dev-outline .stack > *,
      body.dev-outline .cluster > *,
      body.dev-outline .grid > *,
      body.dev-outline .sidebar > *,
      body.dev-outline .center > *,
      body.dev-outline .box > *,
      body.dev-outline .cover > *,
      body.dev-outline .section > * {
        outline: 1px dashed color-mix(in srgb, var(--color-accent, #0066ff) 30%, transparent);
        outline-offset: -1px;
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize dev tools when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.devTools = new DevTools();
  });
} else {
  window.devTools = new DevTools();
}
