# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Live Wires is a prototyping-first design system for editorial websites. Built with modern CSS, it uses Vite for development and native CSS features (cascade layers, nesting, container queries) instead of preprocessors.

**Philosophy:** Good defaults + additive art direction. Semantic HTML looks good with zero classes, utility classes provide precise control for art direction.

## ⚠️ CRITICAL: Documentation Sync Requirements

**IMPORTANT:** When making ANY changes to this project, you MUST keep documentation in sync. This project is designed as an open-source starter kit, so accurate documentation is essential.

### Documentation Sync Checklist

After modifying code, check if updates are needed in these files:

| If you change... | Update these files |
|------------------|-------------------|
| CSS class names (layouts, components, utilities) | CLAUDE.md, SKILL.md, README.md, relevant guide pages |
| CSS custom properties/tokens (`--line-*`, `--text-*`, etc.) | CLAUDE.md, SKILL.md, README.md |
| Layout primitive variants (stack-*, grid-*, etc.) | CLAUDE.md, SKILL.md, manual/components/layout.html |
| Component styles | CLAUDE.md, relevant manual/components/*.html page |
| JavaScript files (add/remove/rename) | CLAUDE.md directory structure |
| File/directory structure | CLAUDE.md, README.md |
| Build commands or configuration | CLAUDE.md, README.md |

### Files That Must Stay In Sync

1. **[CLAUDE.md](CLAUDE.md)** - Primary technical reference for Claude Code
2. **[.claude/skills/livewires/SKILL.md](.claude/skills/livewires/SKILL.md)** - Quick reference for layout primitives and utilities
3. **[README.md](README.md)** - User-facing project overview
4. **[public/manual/](public/manual/)** - Visual documentation site

### Documentation Update Process

When making code changes:

1. **Before committing**, verify documentation accuracy:
   ```
   □ Class names in docs match actual CSS
   □ Token names in docs match actual CSS
   □ File paths in docs are correct
   □ Code examples use correct class names
   □ All variants are documented
   ```

2. **Naming conventions** to maintain:
   - **Layout modifiers:** single-dash (e.g., `stack-compact`, `box-tight`, `sidebar-reverse`)
   - **Component modifiers:** double-dash (e.g., `button--accent`, `table--bordered`, `divider--hairline`)
   - **Spacing tokens:** `--line-*` pattern
   - **Typography tokens:** `--text-*` pattern (Tailwind-style: xs, sm, base, lg, xl, 2xl...)

   *Why the difference?* Layouts are compositional primitives meant to be combined freely. Components are more opinionated UI patterns with specific variants.

3. **When adding new features**:
   - Add to CLAUDE.md architecture section
   - Add to SKILL.md if it's a layout/utility
   - Add example to relevant guide page
   - Update README.md if it's a major feature

## Build System

### Core Commands

- `npm run dev` - Start development server with Vite (http://localhost:3000)
- `npm run build` - Build optimized CSS and JS to `public/dist/`
- `npm run preview` - Preview production build

### Development Workflow

Vite provides instant HMR (Hot Module Replacement). Edit CSS or HTML files and see changes instantly in the browser. No build step during development.

### Deployment

The `public/` folder is the deployable site root. Build outputs go to `public/dist/`:

```
public/dist/
├── main.css      # Minified CSS (~18KB gzipped)
├── main.js       # Bundled JS (~4KB gzipped)
└── css/
    └── print.css # Print stylesheet
```

**Option 1: Build on deploy (recommended)**
Configure your host to run the build:
- Build command: `npm run build`
- Publish directory: `public`

Works with Netlify, Vercel, Cloudflare Pages, and similar platforms.

**Option 2: Commit built files**
```bash
npm run build
git add public/dist
git commit -m "Build for production"
git push
```

HTML files reference `/dist/main.js` and `/dist/main.css`. In development, Vite aliases these to source files. In production, the built files are served directly.

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
│   │   ├── 6_components/  # UI components
│   │   ├── 7_utilities/   # Utility classes (spacing, typography, color, grid, display)
│   │   └── main.css       # CSS entry point
│   ├── js/                # JavaScript files
│   │   ├── main.js        # Vite entry point (loads CSS + Web Components)
│   │   ├── html-include.js # Web Component for HTML includes
│   │   └── prototyping.js # Development utilities
│
├── public/                # Your prototype (site root)
│   ├── index.html         # Your HTML (replaceable prototype workspace)
│   ├── _includes/         # HTML includes (header, footer, nav-docs)
│   ├── manual/            # Manual (brand identity & UI components)
│   │   ├── brand/         # Brand guide (logos, colors, fonts, voice)
│   │   └── components/    # Component library (layout, forms, schemes)
│   ├── docs/              # Framework documentation (how to use Live Wires)
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

#### Cascade Layers (defined in [0_config/layers.css](src/css/0_config/layers.css#L15))

```css
@layer tokens, reset, base, layouts, components, utilities;
```

This ensures utilities always win over components, components over layouts, etc. The `tokens` layer contains design tokens (CSS custom properties).

#### Layer Mapping

1. **`tokens`** - Design tokens ([1_tokens/](src/css/1_tokens/))
2. **`reset`** - Browser normalization ([3_generic/reset.css](src/css/3_generic/reset.css))
3. **`base`** - Semantic HTML element defaults ([4_elements/](src/css/4_elements/))
   - [document.css](src/css/4_elements/document.css) - Root and body setup
   - [typography.css](src/css/4_elements/typography.css) - Headings, paragraphs, code
   - [links.css](src/css/4_elements/links.css) - Link styles
   - [lists.css](src/css/4_elements/lists.css) - List styles
   - [media.css](src/css/4_elements/media.css) - Images, figures
   - [tables.css](src/css/4_elements/tables.css) - Table styles
   - [forms.css](src/css/4_elements/forms.css) - Form elements
   - [quotes.css](src/css/4_elements/quotes.css) - Blockquotes
   - [addresses.css](src/css/4_elements/addresses.css) - Address element
   - [hr.css](src/css/4_elements/hr.css) - Horizontal rules
   - [details.css](src/css/4_elements/details.css) - Disclosure widgets
4. **`layouts`** - Compositional layout primitives ([5_layouts/](src/css/5_layouts/))
   - [stack.css](src/css/5_layouts/stack.css) - Vertical spacing
   - [cluster.css](src/css/5_layouts/cluster.css) - Horizontal grouping with wrapping
   - [grid.css](src/css/5_layouts/grid.css) - Auto-responsive grid layouts
   - [sidebar.css](src/css/5_layouts/sidebar.css) - Sidebar + main content layout
   - [center.css](src/css/5_layouts/center.css) - Centered content with max-width
   - [box.css](src/css/5_layouts/box.css) - Simple padding wrapper
   - [section.css](src/css/5_layouts/section.css) - Section wrapper
   - [cover.css](src/css/5_layouts/cover.css) - Full-height centering
5. **`components`** - Named UI patterns ([6_components/](src/css/6_components/))
   - [buttons.css](src/css/6_components/buttons.css) - Button variants
   - [breadcrumbs.css](src/css/6_components/breadcrumbs.css) - Breadcrumb navigation
   - [pagination.css](src/css/6_components/pagination.css) - Page navigation
   - [tables.css](src/css/6_components/tables.css) - Enhanced table styles
   - [switches.css](src/css/6_components/switches.css) - Toggle switches
   - [dividers.css](src/css/6_components/dividers.css) - Horizontal dividers
   - [images.css](src/css/6_components/images.css) - Image treatments
   - [embeds.css](src/css/6_components/embeds.css) - Responsive video embeds
   - [typography.css](src/css/6_components/typography.css) - Long-form text (.prose, .lead)
   - [logo.css](src/css/6_components/logo.css) - Logo sizing
6. **`utilities`** - Single-purpose classes ([7_utilities/](src/css/7_utilities/))
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

### The Foundational Unit

**CRITICAL:** Everything in Live Wires derives from the `--line` variable defined in [src/css/1_tokens/spacing.css](src/css/1_tokens/spacing.css).

```css
:root {
  /* All spacing is multiples of --line */
  --line-0: 0;
  --line-025: calc(var(--line) * 0.25);
  --line-05: calc(var(--line) * 0.5);
  --line-075: calc(var(--line) * 0.75);
  --line-1: var(--line);
  --line-15: calc(var(--line) * 1.5);
  --line-2: calc(var(--line) * 2);
  --line-3: calc(var(--line) * 3);
  --line-4: calc(var(--line) * 4);
  --line-5: calc(var(--line) * 5);
  --line-6: calc(var(--line) * 6);
  --line-7: calc(var(--line) * 7);
  --line-8: calc(var(--line) * 8);

  /* Pixel-precise spacing for borders, fine details */
  --line-1px: 1px;
}
```

The base `--line` variable is defined in [typography-base.css](src/css/1_tokens/typography-base.css) based on the base font size and line-height ratio.

**Why this matters:** Changing typography settings automatically recalculates all spacing throughout the entire system, maintaining perfect vertical rhythm.

**When adding new spacing:** Always use multiples of `--line` (e.g., `calc(var(--line) * 0.75)`).

### Design Tokens

All design tokens are CSS custom properties in [src/css/1_tokens/](src/css/1_tokens/):

#### [spacing.css](src/css/1_tokens/spacing.css)
- Spacing scale (`--line-0` through `--line-8`) with fractional values (`--line-025`, `--line-05`, `--line-075`, `--line-15`)
- Pixel-precise token (`--line-1px`)
- Layout tokens (`--gutter`)

#### [typography.css](src/css/1_tokens/typography.css)
- Type scale (`--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`, `--text-2xl`, `--text-3xl`, `--text-4xl`, `--text-5xl`, `--text-6xl`, `--text-7xl`, `--text-8xl`, `--text-9xl`) using `clamp()` for fluid scaling
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
<div class="stack">             <!-- Default spacing: var(--line) -->
<div class="stack stack-compact">    <!-- Spacing: var(--line-05) -->
<div class="stack stack-comfortable"> <!-- Spacing: var(--line-2) -->
<div class="stack stack-spacious">    <!-- Spacing: var(--line-4) -->
```

### Grid ([5_layouts/grid.css](src/css/5_layouts/grid.css))
Auto-responsive grid (no breakpoints needed):
```html
<div class="grid">              <!-- Auto-fit grid -->
<div class="grid grid-narrow">  <!-- Narrower min column width -->
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

Live Wires includes components in [6_components/](src/css/6_components/):

- **[buttons.css](src/css/6_components/buttons.css)** - Button variants
- **[breadcrumbs.css](src/css/6_components/breadcrumbs.css)** - Breadcrumb navigation
- **[pagination.css](src/css/6_components/pagination.css)** - Page navigation
- **[tables.css](src/css/6_components/tables.css)** - Enhanced table styles
- **[switches.css](src/css/6_components/switches.css)** - Toggle switch controls
- **[dividers.css](src/css/6_components/dividers.css)** - Horizontal dividers
- **[images.css](src/css/6_components/images.css)** - Image treatments
- **[embeds.css](src/css/6_components/embeds.css)** - Responsive video embeds
- **[prose.css](src/css/6_components/prose.css)** - Long-form text styling
- **[logo.css](src/css/6_components/logo.css)** - Logo sizing

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
```

#### Breadcrumbs
```html
<nav class="breadcrumbs">
  <a href="/">Home</a>
  <a href="/docs/">Docs</a>
  <span>Current Page</span>
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

#### Toggle Switch
```html
<div class="switch">
  <input type="checkbox" id="toggle">
  <label for="toggle">Enable feature</label>
</div>
```

See [public/manual/components/](public/manual/components/) for complete component documentation.

## Utility Classes

Tailwind-compatible naming where sensible. All utilities are in the `utilities` cascade layer, so they always win.

### Spacing ([7_utilities/spacing.css](src/css/7_utilities/spacing.css))
```html
<div class="mt-4">  <!-- margin-block-start: var(--line-4) -->
<div class="mb-2">  <!-- margin-block-end: var(--line-2) -->
<div class="px-3">  <!-- padding-inline: var(--line-3) -->
<div class="py-2">  <!-- padding-block: var(--line-2) -->
```

### Typography ([7_utilities/typography.css](src/css/7_utilities/typography.css))
```html
<p class="text-lg">      <!-- Font size: var(--text-lg) -->
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

### Baseline Grid Overlay ([prototyping.css](src/css/prototyping.css))
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

### Dev Tools JavaScript ([src/js/prototyping.js](src/js/prototyping.js))
The design toolbar and prototyping utilities. Press T to show/hide the toolbar. All settings persist in localStorage across page loads and navigation.

## Adding New Features

### Adding a New Utility Class

1. Determine which utility file it belongs in ([spacing](src/css/7_utilities/spacing.css), [typography](src/css/7_utilities/typography.css), [color](src/css/7_utilities/color.css), [grid](src/css/7_utilities/grid.css))
2. Add the class within the `@layer utilities { }` block
3. Use existing design tokens (e.g., `var(--line-3)`, `var(--text-lg)`)
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
    padding: var(--line-3);
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

    <!-- Load JS first (CSS is loaded via _includes/head.html) -->
    <script type="module" src="/dist/main.js"></script>

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
        <li><a href="/manual/">Guide</a></li>
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

## Documentation & Manual

Live Wires separates documentation into two main areas:

### Manual ([public/manual/](public/manual/))
The living reference for brand identity and UI components. Use during design and as ongoing team documentation.

- **[manual/index.html](public/manual/index.html)** - Manual hub
- **[manual/brand/](public/manual/brand/)** - Brand guide (logos, colors, fonts, voice & tone)
- **[manual/components/](public/manual/components/)** - Component library (layout, forms, schemes, typography)

### Framework Documentation ([public/docs/](public/docs/))
How to use Live Wires - installation, architecture, and reference.

- **[docs/index.html](public/docs/index.html)** - Documentation overview
- **[docs/getting-started.html](public/docs/getting-started.html)** - Installation and setup
- **[docs/structure.html](public/docs/structure.html)** - Project structure
- **[docs/process.html](public/docs/process.html)** - Design process workflow
- **[docs/typography.html](public/docs/typography.html)** - Typography system
- **[docs/utility-classes.html](public/docs/utility-classes.html)** - Utility class reference
- **[docs/design-toolbar.html](public/docs/design-toolbar.html)** - Development tools

### Custom Manual Components

The manual includes specialized Web Components for documentation:

#### Color Swatch Component ([public/manual/_components/swatch.js](public/manual/_components/swatch.js))
```html
<color-swatch value="#FF5733"></color-swatch>
```
Displays color information with automatic conversion to RGB, HSLA, and OKLCH formats. Automatically selects light/dark theme based on color luminance.

#### Type Sample Component ([public/manual/_components/type-sample.js](public/manual/_components/type-sample.js))
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
- ✅ Complete cascade layer system with 6 layers
- ✅ Comprehensive design token system (spacing, typography, color)
- ✅ 10 production-ready components
- ✅ 8 layout primitives
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
