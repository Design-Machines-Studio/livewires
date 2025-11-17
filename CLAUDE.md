# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Live Wires 2026 is a prototyping-first design system for editorial websites. Built with modern CSS, it uses Vite for development and native CSS features (cascade layers, nesting, container queries) instead of preprocessors.

**Philosophy:** Good defaults + additive art direction. Semantic HTML looks good with zero classes, utility classes provide precise control for art direction.

## Build System

### Core Commands

- `npm run dev` - Start development server with Vite (http://localhost:3000)
- `npm run build` - Build optimized CSS to `dist/`
- `npm run preview` - Preview production build

### Development Workflow

Vite provides instant HMR (Hot Module Replacement). Edit CSS or HTML files and see changes instantly in the browser. No build step during development.

## Architecture

### Directory Structure

```
├── src/
│   ├── css/               # All CSS source files
│   │   ├── 0_config/      # Cascade layer definitions
│   │   ├── 1_settings/    # Design tokens (tokens, typography, color)
│   │   ├── 3_generic/     # CSS reset
│   │   ├── 4_elements/    # Semantic HTML defaults
│   │   ├── 5_layouts/     # Layout primitives (stack, grid, cluster)
│   │   ├── 6_components/  # UI components (future)
│   │   ├── 7_utilities/   # Utility classes (spacing, typography, color, grid)
│   │   └── main.css       # CSS entry point
│   ├── main.js            # Vite entry point (loads CSS + Web Components)
│   └── html-include.js    # Web Component for HTML includes
│
├── public/                # Your prototype (site root)
│   ├── index.html         # Your HTML
│   ├── _includes/         # HTML includes (header, footer, etc.)
│   ├── fonts/             # Web fonts
│   └── img/               # Images
│
├── vite.config.js         # Vite configuration
├── postcss.config.js      # PostCSS configuration (autoprefixer only)
└── package.json           # Dependencies and scripts
```

**Note:** Each Live Wires installation is a single prototype. The `public/` folder is your site root.

### CSS Architecture

Live Wires follows ITCSS (Inverted Triangle CSS) principles but uses modern CSS Cascade Layers for explicit specificity control.

#### Cascade Layers (defined in [0_config/layers.css](src/css/0_config/layers.css#L13))

```css
@layer reset, base, layouts, components, utilities;
```

This ensures utilities always win over components, components over layouts, etc.

#### Layer Mapping

1. **`reset`** - Browser normalization ([3_generic/reset.css](src/css/3_generic/reset.css))
2. **`base`** - Semantic HTML element defaults ([4_elements/](src/css/4_elements/))
   - [root.css](src/css/4_elements/root.css) - Base font properties
   - [body.css](src/css/4_elements/body.css) - Body layout
   - [typography.css](src/css/4_elements/typography.css) - Headings, paragraphs, code
   - [links.css](src/css/4_elements/links.css) - Link styles
   - [lists.css](src/css/4_elements/lists.css) - List styles
   - [media.css](src/css/4_elements/media.css) - Images, figures
   - [tables.css](src/css/4_elements/tables.css) - Table styles
   - [forms.css](src/css/4_elements/forms.css) - Form elements
3. **`layouts`** - Compositional layout primitives ([5_layouts/](src/css/5_layouts/))
   - [stack.css](src/css/5_layouts/stack.css) - Vertical spacing
   - [cluster.css](src/css/5_layouts/cluster.css) - Horizontal grouping with wrapping
   - [grid.css](src/css/5_layouts/grid.css) - Auto-responsive grid layouts
   - [sidebar.css](src/css/5_layouts/sidebar.css) - Sidebar + main content layout
   - [center.css](src/css/5_layouts/center.css) - Centered content with max-width
4. **`components`** - Named UI patterns ([6_components/](src/css/6_components/)) - Future
5. **`utilities`** - Single-purpose classes ([7_utilities/](src/css/7_utilities/))
   - [spacing.css](src/css/7_utilities/spacing.css) - Margin and padding utilities
   - [typography.css](src/css/7_utilities/typography.css) - Font size, weight, alignment
   - [color.css](src/css/7_utilities/color.css) - Text/bg colors, color schemes
   - [grid.css](src/css/7_utilities/grid.css) - Display, flex, gap utilities

### The Sacred Baseline System

**CRITICAL:** Everything in Live Wires derives from the `--line` variable defined in [src/css/1_settings/tokens.css](src/css/1_settings/tokens.css#L22).

```css
:root {
  /* Fluid base typography */
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --line-height-ratio: 1.5;

  /* THE BASELINE - Everything derives from this */
  --line: calc(var(--text-base) * var(--line-height-ratio));

  /* All spacing is multiples of --line */
  --space-0: 0;
  --space-1: calc(var(--line) * 0.5);
  --space-2: var(--line);
  --space-3: calc(var(--line) * 1.5);
  --space-4: calc(var(--line) * 2);
  --space-5: calc(var(--line) * 3);
  --space-6: calc(var(--line) * 4);
}
```

**Why this matters:** Changing `--text-base` or `--line-height-ratio` automatically recalculates all spacing throughout the entire system, maintaining perfect vertical rhythm.

**When adding new spacing:** Always use multiples of `--line` (e.g., `calc(var(--line) * 0.75)`).

### Design Tokens

All design tokens are CSS custom properties in [src/css/1_settings/](src/css/1_settings/):

#### [tokens.css](src/css/1_settings/tokens.css)
- Baseline calculation (`--line`)
- Spacing scale (`--space-0` through `--space-6`)
- Layout tokens (`--gutter`, `--margin`, `--max-width`)

#### [typography.css](src/css/1_settings/typography.css)
- Type scale (`--text-1` through `--text-7`) using `clamp()` for fluid scaling
- Font stacks (`--font-sans`, `--font-serif`, `--font-mono`)
- Font weights (`--font-weight-normal`, `--font-weight-bold`, etc.)
- Reading measures (`--measure`, `--measure-wide`, `--measure-narrow`)

#### [color.css](src/css/1_settings/color.css)
- Base palette (grey scale, brand colors)
- Semantic colors (`--color-bg`, `--color-fg`, `--color-accent`)
- Color schemes (`--scheme-warm-*`, `--scheme-cool-*`, `--scheme-dark-*`)
- Automatic dark mode via `@media (prefers-color-scheme: dark)`

### Modern CSS Features Used

Live Wires uses cutting-edge CSS features supported in modern browsers (last 2 versions):

1. **CSS Cascade Layers** - Explicit specificity control
2. **Native CSS Nesting** - No preprocessor needed (uses `&` syntax)
3. **Container Queries** - Components respond to their container, not viewport
4. **Logical Properties** - `margin-block-start` instead of `margin-top`, etc.
5. **Fluid Typography** - `clamp()` for smooth responsive scaling
6. **Custom Properties** - Variables throughout for easy customization

### PostCSS Configuration

Minimal PostCSS setup in [postcss.config.js](postcss.config.js):

```js
export default {
  plugins: {
    autoprefixer: {}
  }
};
```

**That's it.** No preprocessing, no transformations. Native CSS all the way.

## Layout Primitives

Live Wires uses compositional layout primitives inspired by [Every Layout](https://every-layout.dev).

### Stack ([5_layouts/stack.css](src/css/5_layouts/stack.css))
Vertical spacing between child elements:
```html
<div class="stack">         <!-- Default spacing: var(--space-3) -->
<div class="stack-compact"> <!-- Spacing: var(--space-2) -->
<div class="stack-comfortable"> <!-- Spacing: var(--space-4) -->
```

### Grid ([5_layouts/grid.css](src/css/5_layouts/grid.css))
Auto-responsive grid (no breakpoints needed):
```html
<div class="grid">              <!-- Auto-fit grid -->
<div class="grid grid-columns-3"> <!-- Fixed 3-column -->
<div class="grid-span-2">       <!-- Span 2 columns -->
```

Container query support:
```html
<div class="grid-span-2@md">  <!-- Span 2 at 40rem+ container width -->
```

### Cluster ([5_layouts/cluster.css](src/css/5_layouts/cluster.css))
Horizontal grouping with wrapping (navigation, tags):
```html
<nav class="cluster">         <!-- Default alignment: flex-start -->
<div class="cluster-center">  <!-- Center alignment -->
```

## Utility Classes

Tailwind-compatible naming where sensible. All utilities are in the `utilities` cascade layer, so they always win.

### Spacing ([7_utilities/spacing.css](src/css/7_utilities/spacing.css))
```html
<div class="mt-4">  <!-- margin-block-start: var(--space-4) -->
<div class="mb-2">  <!-- margin-block-end: var(--space-2) -->
<div class="px-3">  <!-- padding-inline: var(--space-3) -->
<div class="py-2">  <!-- padding-block: var(--space-2) -->
```

### Typography ([7_utilities/typography.css](src/css/7_utilities/typography.css))
```html
<p class="text-4">       <!-- Font size: var(--text-4) -->
<p class="font-bold">    <!-- Font weight: 700 -->
<p class="measure">      <!-- Max width: 65ch (optimal reading length) -->
<p class="text-center">  <!-- Text align: center -->
```

### Color Schemes ([7_utilities/color.css](src/css/7_utilities/color.css))
```html
<section class="scheme-warm">  <!-- Applies warm color palette -->
<section class="scheme-cool">  <!-- Applies cool color palette -->
<section class="scheme-dark">  <!-- Applies dark color palette -->
```

## Adding New Features

### Adding a New Utility Class

1. Determine which utility file it belongs in ([spacing](src/css/7_utilities/spacing.css), [typography](src/css/7_utilities/typography.css), [color](src/css/7_utilities/color.css), [grid](src/css/7_utilities/grid.css))
2. Add the class within the `@layer utilities { }` block
3. Use existing design tokens (e.g., `var(--space-3)`, `var(--text-4)`)
4. Use logical properties where possible (`margin-block-start` instead of `margin-top`)

Example:
```css
@layer utilities {
  .mt-7 { margin-block-start: calc(var(--line) * 5); }
}
```

### Adding a New Layout Primitive

1. Create a new file in [src/css/5_layouts/](src/css/5_layouts/)
2. Wrap everything in `@layer layouts { }`
3. Use custom properties for configuration (e.g., `--stack-space`)
4. Import in [main.css](src/css/main.css)

### Adding a New Component

1. Create a new file in [src/css/6_components/](src/css/6_components/)
2. Wrap everything in `@layer components { }`
3. Use custom properties for theming
4. Use container queries for responsive behavior
5. Import in [main.css](src/css/main.css)

Example:
```css
@layer components {
  .callout {
    --callout-bg: var(--color-subtle);
    --callout-fg: var(--color-fg);

    container-type: inline-size;
    background: var(--callout-bg);
    color: var(--callout-fg);
    padding: var(--space-3);
  }

  @container (min-width: 40rem) {
    .callout {
      display: grid;
      grid-template-columns: auto 1fr;
    }
  }
}
```

## Prototyping Workflow

1. **Start with semantic HTML** - Write clean HTML in [public/index.html](public/index.html). It will look good with zero classes.
2. **Add layout primitives** - Use `.stack`, `.grid`, `.cluster` for composition.
3. **Add utilities for art direction** - Use spacing, typography, and color utilities for precise control.
4. **Extract patterns** - If you find yourself repeating the same class combinations, consider creating a component.

**Remember:** Each Live Wires installation is one prototype. Build your HTML directly in `public/`.

## HTML Includes

Live Wires uses a **zero-dependency Web Component** for HTML includes, aligning with the "native CSS, minimal dependencies" philosophy.

### How It Works

The `<html-include>` custom element is defined in [src/html-include.js](src/html-include.js) and automatically loaded via [src/main.js](src/main.js). It fetches and renders HTML fragments at runtime using native browser APIs.

### Usage

**Important:** Load the Web Component script BEFORE any `<html-include>` tags:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1.0">

    <!-- Load Web Component first (required!) -->
    <script type="module" src="/src/main.js"></script>

    <!-- Now includes will work -->
    <html-include src="/_includes/head.html"></html-include>
  </head>
  <body>
    <html-include src="/_includes/header.html"></html-include>

    <main>
      <!-- Your page content -->
    </main>

    <html-include src="/_includes/footer.html"></html-include>
  </body>
</html>
```

### Include Files

Create reusable HTML fragments in [public/_includes/](public/_includes/):

- **head.html** - Meta tags, title, Vite entry point
- **header.html** - Site header and navigation
- **footer.html** - Site footer
- *(Add more as needed)*

### Example Include

```html
<!-- public/_includes/header.html -->
<header class="py-3 px-4 scheme-dark">
  <div class="cluster cluster-space-between">
    <div class="logo">
      <a href="/"><img src="/img/logo.svg" alt="Site Name"></a>
    </div>
    <nav>
      <ul class="cluster">
        <li><a href="/">Home</a></li>
        <li><a href="/guide/">Guide</a></li>
      </ul>
    </nav>
  </div>
</header>
```

### SEO Considerations

**Important:** Content loaded via `<html-include>` is fetched at runtime (not pre-rendered), which means:

- Search engines may not see the included content
- There will be a brief flash before includes load

**Best practices:**
- Use includes for **repeated UI elements** (header, footer, navigation)
- Keep **unique page content** in the main HTML (not in includes)
- For production sites requiring SEO, consider a build-time solution like `vite-plugin-handlebars`

### Why Web Components?

1. **Zero build dependencies** - Pure web standards
2. **No syntax to learn** - Standard HTML
3. **Works in dev and production** - No build step required
4. **Aligns with philosophy** - Native CSS, native HTML, native JavaScript

### Alternative: Build-Time Includes

If SEO is critical, you can switch to a build-time solution:

```bash
npm install -D vite-plugin-handlebars
```

See the [HTML Includes research](https://github.com/anthropics/claude-code/discussions) for more options.

## Tailwind Compatibility

Live Wires uses Tailwind-inspired naming where it makes sense:
- Spacing: `mt-4`, `mb-2`, `px-3`, `py-2`
- Typography: `text-4`, `font-bold`, `text-center`
- Display: `flex`, `grid`, `hidden`

This provides:
- Familiar naming for developers who know Tailwind
- IDE autocomplete support (many editors support Tailwind CSS IntelliSense)
- Option to layer Tailwind on top if needed (via the Tailwind bridge pattern)

But Live Wires is **zero-dependency**. No Tailwind required.

## Key Principles

1. **Baseline-driven spacing** - Everything is a multiple of `--line`
2. **Good defaults** - Semantic HTML looks good with zero classes
3. **Additive art direction** - Layer utilities for precise control
4. **Container queries > Media queries** - Components respond to their container
5. **Logical properties** - International-ready by default
6. **Fluid typography** - Smooth scaling with `clamp()`
7. **Cascade layers** - Explicit specificity control

## Common Tasks

### Change the baseline
Edit [src/css/1_settings/tokens.css](src/css/1_settings/tokens.css#L15):
```css
--text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem); /* Adjust min/max */
--line-height-ratio: 1.5; /* Adjust for different fonts */
```

### Add a color scheme
Edit [src/css/1_settings/color.css](src/css/1_settings/color.css):
```css
--scheme-custom-bg: #color;
--scheme-custom-fg: #color;
--scheme-custom-accent: #color;
```

Then add the utility in [src/css/7_utilities/color.css](src/css/7_utilities/color.css):
```css
.scheme-custom {
  --color-bg: var(--scheme-custom-bg);
  --color-fg: var(--scheme-custom-fg);
  --color-accent: var(--scheme-custom-accent);
  background: var(--color-bg);
  color: var(--color-fg);
}
```

### Add a font
1. Add font files to [public/fonts/](public/fonts/)
2. Define `@font-face` in [src/css/1_settings/typography.css](src/css/1_settings/typography.css)
3. Update font stack variables (e.g., `--font-heading`)

## Testing

View your prototype at http://localhost:3000 during development (`npm run dev`).

Check:
- Semantic HTML looks good with zero classes
- Vertical rhythm is maintained (all spacing aligns to baseline grid)
- Layout primitives respond correctly
- Color schemes apply properly
- Typography scales smoothly on resize

## Next Steps

Future enhancements to consider:
- Additional components (card, callout, article, header, nav, footer)
- Build additional HTML pages in [public/](public/) as needed
- Craft CMS, Astro, or Nuxt integration examples
- Framework-specific installation guides
