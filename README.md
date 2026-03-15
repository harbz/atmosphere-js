# Atmosphère

> Cinematic texture web components. Zero dependencies. Drop-in ready.

![Atmosphère](https://img.shields.io/npm/v/atmospherejs?color=%23c8a46e&style=flat-square)
![Size](https://img.shields.io/bundlephobia/minzip/atmospherejs?color=%23c8a46e&style=flat-square)
![License](https://img.shields.io/npm/l/atmospherejs?color=%23c8a46e&style=flat-square)

Add film grain, vignette, light leaks, scanlines, and paper textures to any HTML element with simple web components. No frameworks. No build tools. One script tag.

---

## Install

```bash
npm install @harbzz/atmospherejs
```

Or via CDN:

```html
<!-- All components -->
<script src="https://unpkg.com/@harbzz/atmospherejs/src/atmospherejs.js"></script>

<!-- Individual components -->
<script src="https://unpkg.com/@harbzz/atmospherejs/src/atm-grain.js"></script>
```

---

## Components

### `<atm-grain>` — Animated Film Grain

```html
<atm-grain intensity="0.4" speed="medium" color="warm" animated="true">
  <img src="photo.jpg" />
</atm-grain>
```

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `intensity` | number | `0.3` | `0` to `1` |
| `speed` | string | `"medium"` | `"slow"` / `"medium"` / `"fast"` |
| `color` | string | `"neutral"` | `"warm"` / `"cool"` / `"neutral"` |
| `animated` | boolean | `true` | `true` / `false` |
| `blend` | string | `"overlay"` | Any CSS blend mode |

### `<atm-vignette>` — Edge Vignette

```html
<atm-vignette strength="0.6" color="#000000" shape="oval">
  <img src="photo.jpg" />
</atm-vignette>
```

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `strength` | number | `0.5` | `0` to `1` |
| `color` | string | `"#000000"` | Any hex color |
| `shape` | string | `"oval"` | `"oval"` / `"square"` |

### `<atm-light-leak>` — Film Light Leaks

```html
<atm-light-leak position="top-right" color="warm" opacity="0.4" animated="true">
  <img src="photo.jpg" />
</atm-light-leak>
```

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `position` | string | `"top-right"` | `"top-left"` / `"top-right"` / `"bottom-left"` / `"bottom-right"` |
| `color` | string | `"warm"` | `"warm"` / `"cool"` / `"golden"` / `"pink"` |
| `opacity` | number | `0.4` | `0` to `1` |
| `animated` | boolean | `false` | `true` / `false` |

### `<atm-scanlines>` — CRT Scanlines

```html
<atm-scanlines opacity="0.12" spacing="3" color="#000000">
  <div>Any content</div>
</atm-scanlines>
```

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `opacity` | number | `0.1` | `0` to `1` |
| `spacing` | number | `3` | `2` to `8` (px) |
| `color` | string | `"#000000"` | Any hex color |

### `<atm-paper>` — Paper Texture

```html
<atm-paper texture="rough" opacity="0.08" tint="#f5f0e8">
  <div>Content here</div>
</atm-paper>
```

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `texture` | string | `"fine"` | `"fine"` / `"medium"` / `"rough"` |
| `opacity` | number | `0.08` | `0` to `0.3` |
| `tint` | string | `"none"` | Any hex color |

---

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/@harbzz/atmospherejs/src/atmospherejs.js"></script>
</head>
<body>
  <atm-grain intensity="0.3" color="warm" animated="true">
    <atm-vignette strength="0.5">
      <img src="your-photo.jpg" width="600" />
    </atm-vignette>
  </atm-grain>
</body>
</html>
```

Effects can be nested to combine them on a single element.

---

## How It Works

Each component uses the [Web Components API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) with Shadow DOM encapsulation:

- **Grain**: Canvas API with Perlin noise generation
- **Vignette**: CSS radial gradient overlay
- **Light Leak**: Multi-layer radial gradients with screen blend mode
- **Scanlines**: CSS `repeating-linear-gradient`
- **Paper**: SVG `feTurbulence` filter

All overlays use `pointer-events: none` and `aria-hidden="true"` — they never block interaction or confuse screen readers.

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires Web Components / Custom Elements v1 support.

---

## License

MIT © Yomi
