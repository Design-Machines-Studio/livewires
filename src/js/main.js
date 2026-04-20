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

// Colours tab controller (Pass A). Reads --color-{family}-{step} tokens
// from the cascade, paints ramp-matrix swatches, populates scheme
// <select> elements, and wires change listeners through
// window.__dpSchemeUpdate. Must load AFTER design-panel-runtime.js so
// that global is defined by the time this controller runs.
import './design-panel-colors.js';

function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

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

// When the G tool is active (body.dev-outline-grids), each .grid needs
// a data-dev-cols attribute so prototyping.css can render the column
// count label. The ported panel toggles the class but doesn't scan
// grids -- scan here instead, on class change and viewport resize.
function updateGridColumnCounts() {
  document.querySelectorAll('.grid').forEach((grid) => {
    const style = getComputedStyle(grid);
    const columns = style.gridTemplateColumns
      .split(' ')
      .filter((c) => c !== 'none' && c.trim()).length;
    if (columns > 0) {
      grid.dataset.devCols = columns;
      grid.style.setProperty('--grid-columns', columns);
    }
    const gap = style.columnGap || style.rowGap || style.gap;
    if (gap && gap !== 'normal') {
      grid.style.setProperty('--grid-gap', gap);
    }
  });
}

function watchGridOutlineTool() {
  const scanIfActive = () => {
    if (document.body.classList.contains('dev-outline-grids')) {
      updateGridColumnCounts();
    }
  };
  new MutationObserver(scanIfActive).observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(scanIfActive, 100);
  });
  scanIfActive();
}

onReady(() => {
  mountDesignPanelOverlays();
  watchGridOutlineTool();
});
