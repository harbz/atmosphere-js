# Atmosphère — Project Brief
### AI-Assisted Build Document · Design Engineer Portfolio Project

---

## 1. What We're Building

**Atmosphère** is a zero-dependency web component library that gives designers and developers cinematic visual texture effects via simple HTML tags.

Think of it as the "Tailwind of visual atmosphere" — drop one script tag on any website and unlock premium texture effects that normally require Photoshop, complex CSS hacks, or heavy libraries.

**Inspired by:** [Pixlated](https://pixlated.vercel.app/) — but broader in scope, more polished in design, and with animated effects Pixlated doesn't have.

**Live reference to study:** https://pixlated.vercel.app/

---

## 2. The Problem It Solves

Most websites look flat and digital. Designers know that grain, vignette, and texture make a UI feel premium and tactile — but adding these effects cleanly in code is painful:

- CSS `filter` hacks look wrong
- PNG overlay images are heavy and don't scale
- Canvas API code is complex to write from scratch
- No clean, reusable component exists for all effects in one place

Atmosphère solves this with simple, semantic web components.

---

## 3. Core Components to Build

Build each as a standalone vanilla JavaScript web component (no frameworks, no dependencies). Each should work as a single `<script>` tag drop-in.

### Component 1: `<atm-grain>`
Film grain overlay on any element.

```html
<atm-grain intensity="0.4" speed="medium" color="warm" animated="true">
  <img src="photo.jpg" />
</atm-grain>
```

**Props:**
| Prop | Type | Default | Options |
|------|------|---------|---------|
| `intensity` | number | `0.3` | `0` to `1` |
| `speed` | string | `"medium"` | `"slow"` / `"medium"` / `"fast"` |
| `color` | string | `"neutral"` | `"warm"` / `"cool"` / `"neutral"` |
| `animated` | boolean | `true` | `true` / `false` |
| `blend` | string | `"overlay"` | Any CSS blend mode |

**Technical requirement:** Use Canvas API to generate organic Perlin-style noise (not simple random pixel noise). When `animated="true"`, regenerate the noise pattern every 80ms so it feels like real 35mm film grain movement.

---

### Component 2: `<atm-vignette>`
Dark edge effect that draws focus to the center.

```html
<atm-vignette strength="0.6" color="#000000" shape="oval">
  <img src="photo.jpg" />
</atm-vignette>
```

**Props:**
| Prop | Type | Default | Options |
|------|------|---------|---------|
| `strength` | number | `0.5` | `0` to `1` |
| `color` | string | `"#000000"` | Any hex color |
| `shape` | string | `"oval"` | `"oval"` / `"square"` |

**Technical requirement:** Use a CSS radial gradient overlay via `::after` pseudo-element or Canvas. Must not interfere with pointer events on children.

---

### Component 3: `<atm-light-leak>`
Warm light bleed at corners, like old film photography.

```html
<atm-light-leak position="top-right" color="warm" opacity="0.4">
  <img src="photo.jpg" />
</atm-light-leak>
```

**Props:**
| Prop | Type | Default | Options |
|------|------|---------|---------|
| `position` | string | `"top-right"` | `"top-left"` / `"top-right"` / `"bottom-left"` / `"bottom-right"` |
| `color` | string | `"warm"` | `"warm"` / `"cool"` / `"golden"` / `"pink"` |
| `opacity` | number | `0.4` | `0` to `1` |
| `animated` | boolean | `false` | `true` / `false` — subtle breathing pulse |

---

### Component 4: `<atm-scanlines>`
Subtle horizontal scan lines — retro/CRT aesthetic.

```html
<atm-scanlines opacity="0.12" spacing="3" color="#000000">
  <div>Any content</div>
</atm-scanlines>
```

**Props:**
| Prop | Type | Default | Options |
|------|------|---------|---------|
| `opacity` | number | `0.1` | `0` to `1` |
| `spacing` | number | `3` | `2` to `8` (pixels between lines) |
| `color` | string | `"#000000"` | Any hex color |

**Technical requirement:** Use CSS `repeating-linear-gradient` for performance. Must be `pointer-events: none`.

---

### Component 5: `<atm-paper>`
Paper / parchment texture overlay.

```html
<atm-paper texture="rough" opacity="0.08" tint="#f5f0e8">
  <div>Content here</div>
</atm-paper>
```

**Props:**
| Prop | Type | Default | Options |
|------|------|---------|---------|
| `texture` | string | `"fine"` | `"fine"` / `"medium"` / `"rough"` |
| `opacity` | number | `0.08` | `0` to `0.3` |
| `tint` | string | `"none"` | Any hex color |

**Technical requirement:** Generate paper texture using SVG `feTurbulence` filter for crisp, scalable texture at any size.

---

## 4. Technical Architecture

### File Structure
```
atmospherejs/
├── src/
│   ├── atm-grain.js          # Grain component
│   ├── atm-vignette.js       # Vignette component  
│   ├── atm-light-leak.js     # Light leak component
│   ├── atm-scanlines.js      # Scanlines component
│   ├── atm-paper.js          # Paper texture component
│   └── atmospherejs.js       # Bundle: all components in one file
├── demo/
│   └── index.html            # Showcase/documentation site
├── package.json
└── README.md
```

### Rules for Every Component
1. **Zero dependencies** — pure vanilla JavaScript only
2. **Single file** — each component is one `.js` file
3. **Web Components API** — use `customElements.define()` and `HTMLElement`
4. **Shadow DOM** — encapsulate styles so they never leak
5. **Pointer events passthrough** — `pointer-events: none` on all overlay layers
6. **Performance** — use `requestAnimationFrame` for animations, not `setInterval`
7. **Accessibility** — add `aria-hidden="true"` to all overlay elements

### Installation Methods (must support all three)
```html
<!-- Option 1: CDN (primary) -->
<script src="https://unpkg.com/atmospherejs/src/atmospherejs.js"></script>

<!-- Option 2: Individual components -->
<script src="https://unpkg.com/atmospherejs/src/atm-grain.js"></script>

<!-- Option 3: npm -->
<!-- npm install atmospherejs -->
```

---

## 5. The Showcase Website

The demo site is as important as the library itself. It must be a single `demo/index.html` file.

### Page Sections (in order)

#### Hero Section

- Two buttons: `npm install atmospherejs` (copy to clipboard) and `View on GitHub`
- Animated grain should be visible and impressive on load

#### Component Showcases (one section per component)
Each section has:
1. A live visual demo (real photo or dark UI with the effect applied)
2. Interactive intensity slider to adjust in real time
3. Code snippet (copy button included)
4. Brief description of what it does and when to use it

#### "Combine Effects" Section
Show all effects stacked on a single image:
- `<atm-grain>` + `<atm-vignette>` + `<atm-light-leak>` nested
- Toggle each effect on/off with switches
- Show the cumulative result live

#### Footer
- GitHub link, npm link, "Made by Yomi" 
- Keep it minimal — one line

### Demo Images
Use royalty-free photos from Unsplash for the component demos. Pick moody, cinematic images that benefit from texture — architecture, portraits, landscapes. Hard-code the URLs from Unsplash CDN.

---

## 6. Code Quality Standards

### Web Component Boilerplate Pattern
Every component should follow this exact structure:

```javascript
class AtmGrain extends HTMLElement {
  static get observedAttributes() {
    return ['intensity', 'speed', 'color', 'animated'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.startAnimation();
  }

  disconnectedCallback() {
    this.stopAnimation();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) this.render();
  }

  render() {
    // Build shadow DOM
  }

  startAnimation() {
    // requestAnimationFrame loop
  }

  stopAnimation() {
    // Cancel animation frame
  }
}

customElements.define('atm-grain', AtmGrain);
```

### Performance Requirements
- Animated grain must not drop below 60fps on a modern laptop
- Each component file must be under 5KB minified
- No layout shifts (CLS = 0) when components initialize

---

## 7. README.md Content

The README must include:

```markdown
# Atmosphère

Cinematic texture web components. Zero dependencies. Drop-in ready.

## Install
npm install atmospherejs
<!-- or via CDN: see docs -->

## Components
- <atm-grain> — Animated film grain
- <atm-vignette> — Edge vignette
- <atm-light-leak> — Light leak effect  
- <atm-scanlines> — CRT scanlines
- <atm-paper> — Paper texture

## Quick Start
[code example]

## Full Documentation
[link to demo site]
```

---

## 8. Build Order (Step by Step)

Build in this exact sequence. Do not skip steps.

**Step 1:** Build `atm-grain.js` only — get animated Canvas grain working perfectly  
**Step 2:** Build the demo page hero section using `atm-grain` — prove the concept looks great  
**Step 3:** Build `atm-vignette.js`  
**Step 4:** Build `atm-scanlines.js` (simplest component)  
**Step 5:** Build `atm-light-leak.js`  
**Step 6:** Build `atm-paper.js`  
**Step 7:** Build `atmospherejs.js` bundle (import + re-export all five)  
**Step 8:** Complete the full demo site with all sections  
**Step 9:** Write README.md  
**Step 10:** Set up package.json and deploy demo to Vercel  

---

## 9. Prompts to Use With AI

When building each component, give your AI this structure:

> "Build a vanilla JavaScript web component called `<atm-grain>` following the Web Components API. It must: use Shadow DOM, use the Canvas API to generate organic Perlin noise grain, support props: intensity (0-1), speed (slow/medium/fast), color (warm/cool/neutral), animated (true/false). When animated=true, regenerate noise every 80ms using requestAnimationFrame. Zero dependencies. Single file. Add aria-hidden to all overlays. Here is the boilerplate pattern to follow: [paste boilerplate from section 6]"

For the demo site:

> "Build a single HTML file demo/showcase page for the Atmosphère web component library. Design direction: dark cinematic, background #080808, font Syne from Google Fonts for headings, JetBrains Mono for code. The page should use the library's own components on itself. Include: hero section with animated grain background, live demos for each component with sliders, code copy snippets. Here are all the components and their props: [paste section 3]"

---

## 10. Definition of Done

The project is complete when:

- [ ] All 5 components work with all their props
- [ ] Animated grain runs at 60fps
- [ ] All effects are pointer-events passthrough
- [ ] Demo site is live on Vercel
- [ ] Copy buttons work on all code snippets
- [ ] All sliders update effects in real time
- [ ] Package is on npm (`npm install atmospherejs` works)
- [ ] README has install instructions and examples
- [ ] GitHub repo is public with a good description

---

## Reference & Inspiration

| Resource | Why |
|----------|-----|
| https://pixlated.vercel.app/ | Direct inspiration — study their component API design |
| https://ui.aceternity.com/ | Showcase site design quality to match |
| https://magicui.design/ | Component documentation structure |
| https://www.framer.com/motion/ | How to write great component documentation |

---

*Brief prepared for Google AI Studio build session.*  
*Project name: Atmosphère · Package name: atmospherejs*