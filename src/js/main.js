// Vite entry point for CSS and JavaScript
// This file imports the CSS so Vite can process it correctly
import '../css/main.css';
import '../css/prototyping.css';

// HTML Includes via Web Components
import './html-include.js';

// Dialog Web Component
import './popup-dialog.js';

// Design panel (replaces the old prototyping.js toolbar).
// Self-registers as <design-panel>. Zero imports. Shadow DOM chrome.
import './components/design-panel.js';

// Runtime stylesheet helpers -- exposes window.__dpSchemeUpdate /
// __dpSchemeReset / __dpSchemeSerialize for any slotted Scheme editor.
// Inert in Live Wires (no slotted editor) but kept in place so
// Assembly <-> Live Wires diffs stay clean.
import './components/design-panel-runtime.js';

// The panel writes data-margin-mode on #dev-column-overlay and
// #dev-margin-overlay but does not create them. Previously created by
// prototyping.js; now mounted here so the ports stay self-contained.
function mountDesignPanelOverlays() {
  if (!document.getElementById('dev-column-overlay')) {
    const col = document.createElement('div');
    col.id = 'dev-column-overlay';
    document.body.appendChild(col);
  }
  if (!document.getElementById('dev-margin-overlay')) {
    const mar = document.createElement('div');
    mar.id = 'dev-margin-overlay';
    document.body.appendChild(mar);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountDesignPanelOverlays);
} else {
  mountDesignPanelOverlays();
}
