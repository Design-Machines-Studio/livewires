/**
 * Live Wires Dev Tools
 *
 * Prototyping utilities with keyboard shortcuts and visual menubar
 * Press '?' to show/hide the dev tools menubar
 */

class DevTools {
  constructor() {
    this.tools = {
      darkMode: {
        key: 'd',
        label: 'Dark Mode',
        class: 'dark-mode',
        target: 'body',
        active: false
      },
      baseline: {
        key: 'b',
        label: 'Baseline Grid',
        class: 'show-baseline',
        target: 'body',
        active: false
      },
      columns: {
        key: 'c',
        label: 'Column Grid',
        class: 'show-columns-3',
        target: 'body',
        active: false,
        cycle: ['show-columns-2', 'show-columns-3', 'show-columns-4', 'show-columns-6', 'show-columns-12']
      },
      colors: {
        key: 'x',
        label: 'Background Colors',
        selector: '[class*="bg-"]',
        toggle: 'background',
        active: true
      },
      outlines: {
        key: 'o',
        label: 'Layout Outlines',
        class: 'dev-outline',
        target: 'body',
        active: false
      },
      redact: {
        key: 'r',
        label: 'Redact Text',
        class: 'redact',
        target: 'body',
        active: false
      }
    };

    this.menubarVisible = true;
    this.init();
  }

  init() {
    console.log('🛠️ Live Wires Dev Tools initializing...');

    // Load saved state from localStorage
    this.loadState();

    // Create menubar
    this.createMenubar();
    console.log('✅ Dev Tools menubar created');

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Apply saved states
    this.applyStates();

    // Add outline styles
    this.addOutlineStyles();

    console.log('✅ Dev Tools ready! Press ? to toggle menubar');
  }

  loadState() {
    const saved = localStorage.getItem('livewires-dev-tools');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        Object.keys(state).forEach(key => {
          if (this.tools[key]) {
            this.tools[key].active = state[key];
          }
        });
      } catch (e) {
        console.warn('Could not load dev tools state');
      }
    }
  }

  saveState() {
    const state = {};
    Object.keys(this.tools).forEach(key => {
      state[key] = this.tools[key].active;
    });
    localStorage.setItem('livewires-dev-tools', JSON.stringify(state));
  }

  applyStates() {
    Object.keys(this.tools).forEach(key => {
      if (this.tools[key].active) {
        this.toggle(key, true);
      }
    });
  }

  createMenubar() {
    const menubar = document.createElement('div');
    menubar.id = 'dev-tools-menubar';
    menubar.className = 'dev-tools-menubar';
    menubar.style.display = this.menubarVisible ? 'flex' : 'none';

    const buttons = Object.keys(this.tools).map(key => {
      const tool = this.tools[key];
      const button = document.createElement('button');
      button.className = 'dev-tool-button';
      button.dataset.tool = key;
      button.innerHTML = `
        <span class="dev-tool-label">${tool.label}</span>
        <kbd class="dev-tool-key">${tool.key.toUpperCase()}</kbd>
      `;
      button.onclick = () => this.toggle(key);

      if (tool.active) {
        button.classList.add('active');
      }

      return button;
    });

    buttons.forEach(btn => menubar.appendChild(btn));

    // Add help text
    const help = document.createElement('div');
    help.className = 'dev-tools-help';
    help.innerHTML = 'Press <kbd>?</kbd> to toggle this menu';
    menubar.appendChild(help);

    document.body.appendChild(menubar);
    this.menubar = menubar;
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
    if (tool.class && tool.target) {
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

    // Handle cycling through multiple classes (for column grids)
    if (tool.cycle && tool.active) {
      // Remove all cycle classes first
      tool.cycle.forEach(cls => target.classList.remove(cls));

      // Find current index
      let currentIndex = tool.cycle.indexOf(tool.class);

      // Cycle to next
      if (tool.active && target.classList.contains(tool.class)) {
        currentIndex = (currentIndex + 1) % tool.cycle.length;
        tool.class = tool.cycle[currentIndex];
      }
    }

    target.classList.toggle(tool.class, tool.active);

    // Update button label for cycling
    if (tool.cycle && tool.active) {
      const button = this.menubar?.querySelector(`[data-tool="${toolKey}"]`);
      if (button) {
        const match = tool.class.match(/\d+/);
        const cols = match ? match[0] : '3';
        button.querySelector('.dev-tool-label').textContent = `${tool.label} (${cols})`;
      }
    } else if (tool.cycle && !tool.active) {
      const button = this.menubar?.querySelector(`[data-tool="${toolKey}"]`);
      if (button) {
        button.querySelector('.dev-tool-label').textContent = tool.label;
      }
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
        background: var(--color-black);
        color: var(--color-white);
        padding: var(--space-025);
        display: flex;
        gap: var(--space-025);
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        z-index: 10000;
        font-size: var(--text-xs);
        backdrop-filter: blur(10px);
      }

      .dev-tool-button {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: transparent;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--font-sans);
        font-size: var(--text-xs);
      }

      .dev-tool-button:hover {
        color: red;
      }

      .dev-tool-button.active {
        color: lightblue;
      }

      .dev-tool-key,
      .dev-tools-help kbd {
        display: inline-block;
        font-size: var(--text-xs);
        font-family: var(--font-mono);
        padding: var(--space-025);
        background-color: var(--color-grey-700);
        border-radius: 3px;
        line-height: 1;
      }

      .dev-tool-button.active .dev-tool-key {
        background: color-mix(in srgb, white 30%, transparent);
        border-color: color-mix(in srgb, white 40%, transparent);
      }

      .dev-tools-help {
        margin-left: auto;
        padding-left: var(--space-2);
        opacity: 0.7;
        font-size: var(--text-xs);
      }

      /* Layout Outlines */
      body.dev-outline .stack,
      body.dev-outline .cluster,
      body.dev-outline .grid,
      body.dev-outline .sidebar,
      body.dev-outline .center {
        outline: 2px solid color-mix(in srgb, var(--color-accent) 50%, transparent);
        outline-offset: -2px;
      }

      body.dev-outline .stack > *,
      body.dev-outline .cluster > *,
      body.dev-outline .grid > *,
      body.dev-outline .sidebar > *,
      body.dev-outline .center > * {
        outline: 1px dashed color-mix(in srgb, var(--color-accent) 30%, transparent);
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
