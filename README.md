# Live Wires 2026

A prototyping-first design system for editorial websites. Built with modern CSS, rooted in timeless design principles.

## Philosophy

Live Wires is not a component library like Bootstrap or Tailwind. It's a **design workflow tool** that helps you:

1. **Prototype quickly** - Start with semantic HTML that looks good with zero classes
2. **Systematize patterns** - Build your style guide as you discover what you need
3. **Art direct freely** - Layer utility classes for precise control when needed
4. **Maintain rhythm** - Everything derives from a baseline grid for perfect vertical rhythm

**Core principle:** Good defaults + additive art direction.

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens [http://localhost:3000](http://localhost:3000) with live reload.

### Build

```bash
npm run build
```

Outputs optimized CSS to `dist/`.

## The Sacred Baseline

Everything in Live Wires derives from the `--line` variable:

```css
:root {
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --line-height-ratio: 1.5;
  --line: calc(var(--text-base) * var(--line-height-ratio));

  /* All spacing is multiples of --line */
  --line-05: calc(var(--line) * 0.5);
  --line-1: var(--line);
  --line-15: calc(var(--line) * 1.5);
  /* ... */
}
```

Change `--text-base` or `--line-height-ratio` and the entire system recalculates. This ensures perfect vertical rhythm across your entire design.

## Modern CSS Features

Live Wires uses cutting-edge CSS features supported in modern browsers:

- **CSS Cascade Layers** - Explicit specificity control
- **Native CSS Nesting** - No preprocessor needed
- **Container Queries** - Components respond to their container, not viewport
- **Logical Properties** - International-ready by default
- **Fluid Typography** - `clamp()` for smooth responsive scaling
- **Custom Properties** - Variables throughout for easy customization

**Browser support:** Last 2 versions of modern browsers (Chrome, Firefox, Safari, Edge)

## Project Structure

```
├── src/css/
│   ├── 0_config/       # Cascade layer definitions
│   ├── 1_tokens/       # Design tokens (colors, typography, spacing)
│   ├── 3_generic/      # CSS reset
│   ├── 4_elements/     # Semantic HTML defaults
│   ├── 5_layouts/      # Layout primitives (stack, grid, cluster)
│   ├── 7_utilities/    # Utility classes
│   └── main.css        # Main entry point
│
└── public/             # Your prototype (site root)
    ├── index.html      # Your HTML
    ├── fonts/          # Web fonts
    └── img/            # Images
```

**Note:** Each Live Wires installation is a single prototype. The `public/` folder is your site root where you build your HTML.

## Layout Primitives

Instead of traditional grid systems, Live Wires uses compositional primitives:

### Stack
Vertical spacing between child elements:
```html
<div class="stack">
  <h1>Heading</h1>
  <p>Paragraph</p>
</div>
```

### Grid
Auto-responsive grid layout:
```html
<div class="grid grid-columns-3">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

### Cluster
Horizontal grouping with wrapping:
```html
<nav class="cluster">
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>
```

## Utility Classes

Tailwind-compatible naming where sensible:

### Spacing
```html
<div class="mt-4 mb-2 px-3">
  <!-- Margin-top: var(--line-4) -->
  <!-- Margin-bottom: var(--line-2) -->
  <!-- Padding-inline: var(--line-3) -->
</div>
```

### Typography
```html
<p class="text-lg font-bold measure">
  <!-- Font-size: var(--text-lg) -->
  <!-- Font-weight: bold -->
  <!-- Max-width: 65ch (optimal reading length) -->
</p>
```

### Color Schemes
```html
<section class="scheme-warm p-4">
  <!-- Applies warm color scheme -->
  <h2>Warm Section</h2>
  <p>Content...</p>
</section>
```

## Customization

All design tokens are CSS custom properties defined in `src/css/1_tokens/`:

- **tokens.css** - Baseline, spacing scale
- **typography.css** - Type scale, font stacks, reading measures
- **color.css** - Color palette, semantic colors, schemes

Change these variables to customize the entire system.

## Tailwind Compatibility

Live Wires uses Tailwind-inspired utility class names where it makes sense (`mt-4`, `text-center`, `font-bold`). This gives you:

- Familiar naming for developers who know Tailwind
- IDE autocomplete support
- Option to layer Tailwind on top if needed

But Live Wires is **zero-dependency**. No Tailwind required.

## CMS Integration

Live Wires works great with Craft CMS, Astro, Nuxt, and any template system:

```twig
{# Craft CMS example #}
<article class="stack {{ entry.colorScheme }}">
  <h1>{{ entry.title }}</h1>
  {{ entry.body }}
</article>
```

See `docs/cms-integration.md` for detailed integration guides.

## Philosophy in Practice

### Start with Semantic HTML

```html
<article>
  <h1>Article Title</h1>
  <p>This looks good with zero classes.</p>
  <p>The baseline typography just works.</p>
</article>
```

### Add Classes for Art Direction

```html
<article class="stack-comfortable">
  <h1 class="text-4xl font-bold">Article Title</h1>
  <p class="text-lg measure">Featured paragraph is larger.</p>
  <p class="measure">Regular paragraph.</p>
</article>
```

### Layer Color Schemes

```html
<article class="stack-comfortable scheme-warm">
  <h1 class="text-4xl font-bold">Article Title</h1>
  <p class="text-lg measure">Now with a warm color scheme.</p>
</article>
```

## License

MIT License - see LICENSE file for details

## Author

Travis Gertz - [travisgertz.com](https://travisgertz.com)

## Links

- [GitHub Repository](https://github.com/design-machines-studio/livewires)
- [Original Live Wires Article](https://travisgertz.com/work/live-wires/)
- [Design Machines Studio](https://design-machines.studio)
