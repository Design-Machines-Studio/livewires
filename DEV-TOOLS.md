# Live Wires Dev Tools

JavaScript prototyping utilities with keyboard shortcuts and a visual menubar.

## Quick Start

Press **`?`** to show/hide the dev tools menubar at the bottom of the screen.

## Keyboard Shortcuts

All keyboard shortcuts work when you're not typing in an input field:

| Key | Tool | Description |
|-----|------|-------------|
| `?` | Toggle Menubar | Show/hide the dev tools menubar |
| `D` | Dark Mode | Toggle dark color scheme on body |
| `B` | Baseline Grid | Show/hide horizontal baseline grid lines |
| `C` | Column Grid | Show/hide vertical column guides (cycles through 2, 3, 4, 6, 12 columns) |
| `X` | Background Colors | Hide/show all elements with `bg-*` classes |
| `O` | Layout Outlines | Outline all layout primitives (`.stack`, `.grid`, `.cluster`, etc.) and their children |
| `R` | Redact Text | Apply BLOKK font to all text for client presentations |

## Features

### Dark Mode (`D`)
Toggles the `.scheme-dark` class on the body element, switching to dark mode color scheme.

### Baseline Grid (`B`)
Shows horizontal lines at each baseline increment (every `--line` unit). Perfect for checking vertical rhythm alignment.

### Column Grid (`C`)
Shows vertical column guides. Press `C` multiple times to cycle through different column counts:
- 2 columns
- 3 columns (default)
- 4 columns
- 6 columns
- 12 columns

The active column count is shown in the menubar button label.

### Background Colors (`X`)
Hides all elements with background color classes (`bg-*`). Useful for checking content hierarchy without visual decoration.

### Layout Outlines (`O`)
Adds visible outlines to all layout primitives (`.stack`, `.grid`, `.cluster`, `.sidebar`, `.center`) and their immediate children. Great for debugging layout composition.

### Redact Text (`R`)
Applies the BLOKK font to all text on the page. Perfect for showing clients layout and design without them focusing on placeholder copy.

## Persistence

All tool states are saved to `localStorage`, so your dev tool preferences persist across page reloads.

## Implementation

The dev tools are implemented in [src/js/prototyping.js](src/js/prototyping.js) and automatically loaded via [src/js/main.js](src/js/main.js).

The menubar is injected into the page on load and can be toggled with the `?` key. Keyboard shortcuts are registered globally (except when typing in form fields).

## Styling

The menubar uses Live Wires design tokens for consistency:
- Background: Semi-transparent dark overlay with backdrop blur
- Active state: Uses `--color-accent`
- Spacing: Uses `--line-*` scale
- Typography: Uses `--font-sans` and `--text-sm`

## Development

To modify the dev tools:

1. Edit [src/js/prototyping.js](src/js/prototyping.js)
2. The file is automatically reloaded by Vite's HMR during development
3. Add new tools to the `this.tools` object in the constructor
4. Each tool can toggle classes, cycle through classes, or toggle visibility

### Adding a New Tool

```javascript
newTool: {
  key: 'n',                    // Keyboard shortcut
  label: 'My Tool',            // Display label
  class: 'my-class',           // Class to toggle
  target: 'body',              // Target element (or selector)
  active: false                // Initial state
}
```

## Browser Support

Requires modern browsers with support for:
- ES6 Classes
- CSS Custom Properties
- `color-mix()` function
- `backdrop-filter` (for menubar blur effect)
