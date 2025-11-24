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
│   │   ├── 1_tokens/      # Design tokens (spacing, typography, color)
│   │   ├── 3_generic/     # CSS reset
│   │   ├── 4_elements/    # Semantic HTML defaults
│   │   ├── 5_layouts/     # Layout primitives (stack, grid, cluster, center, sidebar)
│   │   ├── 6_components/  # UI components (22 production-ready components)
│   │   ├── 7_utilities/   # Utility classes (spacing, typography, color, grid, display)
│   │   └── main.css       # CSS entry point
│   ├── js/                # JavaScript files
│   │   ├── main.js        # Vite entry point (loads CSS + Web Components)
│   │   ├── html-include.js # Web Component for HTML includes
│   │   └── dev-tools.js   # Development utilities
│
├── public/                # Your prototype (site root)
│   ├── index.html         # Your HTML
│   ├── _includes/         # HTML includes (header, footer, etc.)
│   ├── guide/             # Comprehensive documentation site
│   ├── example/           # Example site implementation
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
   - [box.css](src/css/5_layouts/box.css) - Simple padding wrapper
   - [section.css](src/css/5_layouts/section.css) - Section wrapper
4. **`components`** - Named UI patterns ([6_components/](src/css/6_components/))
   - 22 production-ready components including buttons, navigation, forms, tables, callouts, tabs, pagination, switches, offcanvas, and more
5. **`utilities`** - Single-purpose classes ([7_utilities/](src/css/7_utilities/))
   - [spacing.css](src/css/7_utilities/spacing.css) - Margin and padding utilities
   - [typography.css](src/css/7_utilities/typography.css) - Font size, weight, alignment
   - [color.css](src/css/7_utilities/color.css) - Text/bg colors, color schemes
   - [grid.css](src/css/7_utilities/grid.css) - Grid utilities
   - [flexbox.css](src/css/7_utilities/flexbox.css) - Flexbox utilities
   - [display.css](src/css/7_utilities/display.css) - Display utilities
   - [borders.css](src/css/7_utilities/borders.css) - Border utilities
   - [media.css](src/css/7_utilities/media.css) - Responsive media utilities
   - [sizing.css](src/css/7_utilities/sizing.css) - Width/height utilities
   - [tables.css](src/css/7_utilities/tables.css) - Table utilities
   - [dev.css](src/css/7_utilities/dev.css) - Development/prototyping utilities

### The Sacred Baseline System

**CRITICAL:** Everything in Live Wires derives from the `--line` variable defined in [src/css/1_tokens/spacing.css](src/css/1_tokens/spacing.css).

```css
:root {
  /* Fluid base typography */
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --line-height-ratio: 1.5;

  /* THE BASELINE - Everything derives from this */
  --line: calc(var(--text-base) * var(--line-height-ratio));

  /* All spacing is multiples of --line */
  --space-0: 0;
  --space-025: calc(var(--line) * 0.25);
  --space-05: calc(var(--line) * 0.5);
  --space-075: calc(var(--line) * 0.75);
  --space-1: var(--line);
  --space-15: calc(var(--line) * 1.5);
  --space-2: calc(var(--line) * 2);
  --space-3: calc(var(--line) * 3);
  --space-4: calc(var(--line) * 4);
  --space-5: calc(var(--line) * 5);
  --space-6: calc(var(--line) * 6);
}
```

**Why this matters:** Changing `--text-base` or `--line-height-ratio` automatically recalculates all spacing throughout the entire system, maintaining perfect vertical rhythm.

**When adding new spacing:** Always use multiples of `--line` (e.g., `calc(var(--line) * 0.75)`).

### Design Tokens

All design tokens are CSS custom properties in [src/css/1_tokens/](src/css/1_tokens/):

#### [spacing.css](src/css/1_tokens/spacing.css)
- Baseline calculation (`--line`)
- Spacing scale (`--space-0` through `--space-6`) with fractional values (`--space-025`, `--space-05`, `--space-075`, `--space-15`)
- Layout tokens (`--gutter`, `--margin`, `--max-width`)

#### [typography.css](src/css/1_tokens/typography.css)
- Type scale (`--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`, `--text-2xl`, `--text-3xl`) using `clamp()` for fluid scaling
- Major Third ratio (1.25) for harmonious type scaling
- Font stacks (`--font-sans`, `--font-serif`, `--font-mono`)
- Font weights from thin (100) to black (900)
- Leading variations (`--leading-tight`, `--leading-normal`, `--leading-loose`)
- Reading measures (`--measure`, `--measure-wide`, `--measure-narrow`)

#### [color.css](src/css/1_tokens/color.css)
- Extended grey scale (100-900)
- Brand colors and semantic colors
- Semantic colors (`--color-bg`, `--color-fg`, `--color-accent`)
- Theme classes (`.theme-white`, `.theme-black`, `.theme-brand`)
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

## Components

Live Wires includes 22 production-ready components in [6_components/](src/css/6_components/):

### Navigation Components
- **[navigation.css](src/css/6_components/navigation.css)** - Horizontal and vertical navigation patterns
- **[breadcrumbs.css](src/css/6_components/breadcrumbs.css)** - Breadcrumb navigation
- **[pagination.css](src/css/6_components/pagination.css)** - Page navigation
- **[offcanvas.css](src/css/6_components/offcanvas.css)** - Slide-out panels from any direction with push/squish modes

### Form Components
- **[buttons.css](src/css/6_components/buttons.css)** - Button variants (colors, sizes, states, groups)
- **[fields.css](src/css/6_components/fields.css)** - Form field layouts with size variants
- **[inline-forms.css](src/css/6_components/inline-forms.css)** - Inline form patterns
- **[option-buttons.css](src/css/6_components/option-buttons.css)** - Custom radio/checkbox button groups
- **[switches.css](src/css/6_components/switches.css)** - Toggle switch controls

### Content Components
- **[callouts.css](src/css/6_components/callouts.css)** - Content callouts and alerts
- **[tables.css](src/css/6_components/tables.css)** - Enhanced table styles
- **[code-highlighting.css](src/css/6_components/code-highlighting.css)** - Code syntax highlighting
- **[images.css](src/css/6_components/images.css)** - Image components and treatments
- **[videos.css](src/css/6_components/videos.css)** - Responsive video embeds
- **[maps.css](src/css/6_components/maps.css)** - Responsive map embeds

### Interactive Components
- **[tabs.css](src/css/6_components/tabs.css)** - Tab navigation and panels
- **[drawers.css](src/css/6_components/drawers.css)** - Expandable/collapsible drawers

### Utility Components
- **[logo.css](src/css/6_components/logo.css)** - Logo styling and positioning
- **[text-styles.css](src/css/6_components/text-styles.css)** - Common text style patterns
- **[rows.css](src/css/6_components/rows.css)** - Row-based layouts
- **[rules.css](src/css/6_components/rules.css)** - Decorative rules and dividers
- **[addresses.css](src/css/6_components/addresses.css)** - Contact information formatting (vcard)

All components follow these principles:
- Use custom properties for theming
- Leverage container queries for responsive behavior
- Work within the cascade layers system (components layer)
- Support utility class overrides

### Component Examples

#### Button Component
```html
<!-- Basic button -->
<button class="button">Click me</button>

<!-- Color variants -->
<button class="button button--red">Delete</button>
<button class="button button--blue">Primary</button>

<!-- Size variants -->
<button class="button button--small">Small</button>
<button class="button button--large">Large</button>

<!-- Button group -->
<div class="button-group">
  <button class="button">Left</button>
  <button class="button">Center</button>
  <button class="button">Right</button>
</div>
```

#### Navigation
```html
<!-- Horizontal navigation -->
<nav class="horizontal-nav">
  <a href="/">Home</a>
  <a href="/about/">About</a>
  <a href="/contact/">Contact</a>
</nav>

<!-- Vertical navigation -->
<nav class="vertical-nav">
  <a href="/">Home</a>
  <a href="/about/">About</a>
</nav>

<!-- Breadcrumbs -->
<nav class="breadcrumbs">
  <a href="/">Home</a>
  <a href="/news/">News</a>
  <span>Article Title</span>
</nav>
```

#### Table Variants
```html
<!-- Bordered table -->
<table class="table--bordered">...</table>

<!-- Striped table -->
<table class="table--striped">...</table>

<!-- Lined table -->
<table class="table--lined">...</table>
```

#### Form Fields
```html
<!-- Field with size variant -->
<div class="field field--half">
  <label>Email</label>
  <input type="email">
</div>

<!-- Option buttons (custom radio group) -->
<div class="option-buttons">
  <input type="radio" name="size" id="small">
  <label for="small">Small</label>
  <input type="radio" name="size" id="large">
  <label for="large">Large</label>
</div>

<!-- Toggle switch -->
<div class="switch">
  <input type="checkbox" id="toggle">
  <label for="toggle">Enable feature</label>
</div>
```

See [public/guide/components/](public/guide/components/) for complete component documentation.

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
<section class="theme-white">  <!-- White theme variant -->
<section class="theme-black">  <!-- Black theme variant -->
<section class="theme-brand">  <!-- Brand theme variant -->
```

## Development Tools

Live Wires includes development utilities to help with prototyping and design quality assurance:

### Baseline Grid Overlay ([7_utilities/dev.css](src/css/7_utilities/dev.css))
```html
<body class="show-baseline">  <!-- Shows baseline grid overlay -->
```
Displays the vertical rhythm grid to ensure all spacing aligns to the baseline.

### Column Grid Overlays
```html
<body class="show-columns-2">  <!-- Shows 2-column grid overlay -->
<body class="show-columns-3">  <!-- Shows 3-column grid overlay -->
<body class="show-columns-4">  <!-- Shows 4-column grid overlay -->
```
Visualize column layouts during development.

### Prototyping Font
```html
<p class="redact">  <!-- Uses redacted/placeholder text rendering -->
```
Useful for showing type hierarchy without readable content.

### Manual Dark Mode
```html
<body class="dark-mode">  <!-- Forces dark mode regardless of system preference -->
```

### Dev Tools JavaScript ([src/js/dev-tools.js](src/js/dev-tools.js))
Additional development utilities loaded via the main.js entry point.

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

The `<html-include>` custom element is defined in [src/js/html-include.js](src/js/html-include.js) and automatically loaded via [src/js/main.js](src/js/main.js). It fetches and renders HTML fragments at runtime using native browser APIs.

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

## Documentation & Guide

Live Wires includes a comprehensive documentation site at [public/guide/](public/guide/):

### Guide Pages
- **[index.html](public/guide/index.html)** - Getting started, usage, and core concepts
- **[identity/index.html](public/guide/identity/index.html)** - Brand identity (logos, colors, typography)
- **[layout/index.html](public/guide/layout/index.html)** - Grid and layout documentation
- **[elements/index.html](public/guide/elements/index.html)** - HTML element documentation
- **[components/index.html](public/guide/components/index.html)** - Component documentation
- **[templates/index.html](public/guide/templates/index.html)** - Template patterns
- **[modules/index.html](public/guide/modules/index.html)** - Module patterns

### Custom Guide Components

The guide includes specialized Web Components for documentation:

#### Color Swatch Component ([public/guide/_components/swatch.js](public/guide/_components/swatch.js))
```html
<color-swatch value="#FF5733"></color-swatch>
```
Displays color information with automatic conversion to RGB, HSLA, and OKLCH formats. Automatically selects light/dark theme based on color luminance.

#### Type Sample Component ([public/guide/_components/type-sample.js](public/guide/_components/type-sample.js))
```html
<type-sample></type-sample>
```
Displays typography samples with all type scale values.

### Example Site

A complete example site implementation is available at [public/example/](public/example/) demonstrating:
- Multi-page structure
- Navigation patterns
- Content layouts
- Component usage
- HTML include patterns

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
Edit [src/css/1_tokens/spacing.css](src/css/1_tokens/spacing.css):
```css
--text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem); /* Adjust min/max */
--line-height-ratio: 1.5; /* Adjust for different fonts */
```

### Add a color scheme
Edit [src/css/1_tokens/color.css](src/css/1_tokens/color.css):
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

### Add a theme
Edit [src/css/1_tokens/color.css](src/css/1_tokens/color.css):
```css
--theme-custom-bg: #color;
--theme-custom-fg: #color;
```

Then add the utility in [src/css/7_utilities/color.css](src/css/7_utilities/color.css):
```css
.theme-custom {
  background: var(--theme-custom-bg);
  color: var(--theme-custom-fg);
}
```

### Add a font
1. Add font files to [public/fonts/](public/fonts/)
2. Define `@font-face` in [src/css/1_tokens/typography.css](src/css/1_tokens/typography.css)
3. Update font stack variables (e.g., `--font-sans`, `--font-serif`)

## Testing

View your prototype at http://localhost:3000 during development (`npm run dev`).

Check:
- Semantic HTML looks good with zero classes
- Vertical rhythm is maintained (all spacing aligns to baseline grid)
- Layout primitives respond correctly
- Color schemes apply properly
- Typography scales smoothly on resize

## Project Status

### What's Built
- ✅ Complete cascade layer system with 5 layers
- ✅ Comprehensive design token system (spacing, typography, color)
- ✅ 22 production-ready components
- ✅ 7 layout primitives
- ✅ Complete utility class system (10+ utility modules)
- ✅ Development tools (baseline grid, column overlays)
- ✅ HTML includes via Web Components
- ✅ Comprehensive guide documentation site
- ✅ Example site implementation
- ✅ Custom Web Components for guide (swatch, type-sample)

### Future Enhancements to Consider
- Framework integrations (Craft CMS, Astro, Nuxt)
- Build-time HTML includes for better SEO
- Additional example templates
- Framework-specific installation guides
- Component playground/interactive documentation
