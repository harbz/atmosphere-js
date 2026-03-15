/**
 * Atmosphère — Cinematic texture web components
 * Bundle: all components in one file
 * 
 * Usage:
 *   <script src="atmospherejs.js"></script>
 * 
 * This registers all five components:
 *   <atm-grain>, <atm-vignette>, <atm-light-leak>, <atm-scanlines>, <atm-paper>
 */

// ─── atm-grain ───────────────────────────────────────────────────────────────

class AtmGrain extends HTMLElement {
  static get observedAttributes() {
    return ['intensity', 'speed', 'color', 'animated', 'blend'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._animationId = null;
    this._lastFrame = 0;
    this._perm = this._generatePermutation();
  }

  _generatePermutation() {
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    return [...p, ...p];
  }

  _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  _lerp(a, b, t) { return a + t * (b - a); }
  _grad(hash, x, y) {
    const h = hash & 3;
    return (h < 2 ? x : -x) + (h === 0 || h === 2 ? y : -y);
  }

  _perlin(x, y) {
    const p = this._perm;
    const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = this._fade(xf), v = this._fade(yf);
    const aa = p[p[xi] + yi], ab = p[p[xi] + yi + 1];
    const ba = p[p[xi + 1] + yi], bb = p[p[xi + 1] + yi + 1];
    return this._lerp(
      this._lerp(this._grad(aa, xf, yf), this._grad(ba, xf - 1, yf), u),
      this._lerp(this._grad(ab, xf, yf - 1), this._grad(bb, xf - 1, yf - 1), u), v
    );
  }

  get intensity() { return parseFloat(this.getAttribute('intensity')) || 0.3; }
  get speed() { return this.getAttribute('speed') || 'medium'; }
  get color() { return this.getAttribute('color') || 'neutral'; }
  get animated() { const a = this.getAttribute('animated'); return a === null || a !== 'false'; }
  get blend() { return this.getAttribute('blend') || 'overlay'; }

  connectedCallback() { this.render(); this._setupCanvas(); this._drawNoise(); if (this.animated) this._startAnimation(); }
  disconnectedCallback() { this._stopAnimation(); }
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this.isConnected) {
      if (name === 'animated') { newVal === 'false' ? this._stopAnimation() : this._startAnimation(); }
      this.render(); this._setupCanvas(); this._drawNoise();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; position: relative; overflow: hidden; }
        .atm-grain-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; mix-blend-mode: ${this.blend}; z-index: 1; }
        ::slotted(*) { position: relative; }
      </style>
      <slot></slot>
      <canvas class="atm-grain-canvas" aria-hidden="true"></canvas>`;
  }

  _setupCanvas() {
    this._canvas = this.shadowRoot.querySelector('.atm-grain-canvas');
    if (!this._canvas) return;
    this._ctx = this._canvas.getContext('2d', { willReadFrequently: true });
    const rect = this.getBoundingClientRect();
    const s = 0.5;
    this._canvas.width = Math.max(rect.width * s, 1);
    this._canvas.height = Math.max(rect.height * s, 1);
  }

  _getColorTint() {
    switch (this.color) {
      case 'warm': return { r: 20, g: 10, b: -10 };
      case 'cool': return { r: -10, g: 0, b: 15 };
      default: return { r: 0, g: 0, b: 0 };
    }
  }

  _drawNoise() {
    const c = this._canvas, ctx = this._ctx;
    if (!c || !ctx) return;
    const w = c.width, h = c.height;
    if (!w || !h) return;
    const img = ctx.createImageData(w, h), d = img.data;
    const intensity = this.intensity, tint = this._getColorTint(), t = performance.now() * 0.001, ns = 4.0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = x / w * ns, ny = y / h * ns;
        let n = this._perlin(nx + t * 3, ny + t * 2) * 0.6 + this._perlin(nx * 2 + t * 5, ny * 2 + t * 3) * 0.3 + this._perlin(nx * 4 + t * 7, ny * 4 + t * 5) * 0.1;
        n += (Math.random() - 0.5) * 0.4;
        const v = Math.floor((n + 1) * 0.5 * 255), a = Math.floor(intensity * 255), i = (y * w + x) * 4;
        d[i] = Math.min(255, Math.max(0, v + tint.r));
        d[i + 1] = Math.min(255, Math.max(0, v + tint.g));
        d[i + 2] = Math.min(255, Math.max(0, v + tint.b));
        d[i + 3] = a;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  _getFrameInterval() { return this.speed === 'slow' ? 120 : this.speed === 'fast' ? 50 : 80; }

  _startAnimation() {
    this._stopAnimation();
    const interval = this._getFrameInterval();
    const animate = (ts) => {
      if (ts - this._lastFrame >= interval) { this._lastFrame = ts; this._perm = this._generatePermutation(); this._drawNoise(); }
      this._animationId = requestAnimationFrame(animate);
    };
    this._animationId = requestAnimationFrame(animate);
  }

  _stopAnimation() { if (this._animationId) { cancelAnimationFrame(this._animationId); this._animationId = null; } }
}
if (!customElements.get('atm-grain')) customElements.define('atm-grain', AtmGrain);

// ─── atm-vignette ────────────────────────────────────────────────────────────

class AtmVignette extends HTMLElement {
  static get observedAttributes() { return ['strength', 'color', 'shape']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  get strength() { return parseFloat(this.getAttribute('strength')) || 0.5; }
  get color() { return this.getAttribute('color') || '#000000'; }
  get shape() { return this.getAttribute('shape') || 'oval'; }
  connectedCallback() { this.render(); }
  attributeChangedCallback(n, o, v) { if (o !== v && this.isConnected) this.render(); }
  render() {
    const s = this.strength, c = this.color, shape = this.shape === 'square' ? 'closest-side' : 'ellipse at center';
    const inner = Math.round((1 - s) * 65 + 15), outer = Math.round((1 - s) * 20 + 75);
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; position: relative; overflow: hidden; }
        .atm-vignette-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background: radial-gradient(${shape}, transparent ${inner}%, ${c}${Math.round(s * 200).toString(16).padStart(2, '0')} ${outer}%, ${c}${Math.round(s * 255).toString(16).padStart(2, '0')} 100%); }
        ::slotted(*) { position: relative; }
      </style>
      <slot></slot><div class="atm-vignette-overlay" aria-hidden="true"></div>`;
  }
}
if (!customElements.get('atm-vignette')) customElements.define('atm-vignette', AtmVignette);

// ─── atm-light-leak ─────────────────────────────────────────────────────────

class AtmLightLeak extends HTMLElement {
  static get observedAttributes() { return ['position', 'color', 'opacity', 'animated']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  get position() { return this.getAttribute('position') || 'top-right'; }
  get color() { return this.getAttribute('color') || 'warm'; }
  get opacity() { const v = parseFloat(this.getAttribute('opacity')); return isNaN(v) ? 0.4 : Math.min(1, Math.max(0, v)); }
  get animated() { return this.getAttribute('animated') === 'true'; }
  connectedCallback() { this.render(); }
  attributeChangedCallback(n, o, v) { if (o !== v && this.isConnected) this.render(); }

  _getColorStops() {
    const palettes = {
      warm: ['rgba(255,147,41,OP)', 'rgba(255,97,56,HP)', 'rgba(255,50,50,QP)'],
      cool: ['rgba(100,180,255,OP)', 'rgba(60,120,220,HP)', 'rgba(40,80,180,QP)'],
      golden: ['rgba(255,215,0,OP)', 'rgba(255,180,0,HP)', 'rgba(200,140,0,QP)'],
      pink: ['rgba(255,105,180,OP)', 'rgba(255,60,150,HP)', 'rgba(220,40,120,QP)']
    };
    const p = palettes[this.color] || palettes.warm, op = this.opacity;
    return p.map(c => c.replace('OP', op.toFixed(2)).replace('HP', (op * 0.5).toFixed(2)).replace('QP', (op * 0.25).toFixed(2)));
  }

  _getGradientPosition() {
    const m = { 'top-left': 'at 0% 0%', 'top-right': 'at 100% 0%', 'bottom-left': 'at 0% 100%', 'bottom-right': 'at 100% 100%' };
    return m[this.position] || m['top-right'];
  }

  render() {
    const c = this._getColorStops(), pos = this._getGradientPosition(), anim = this.animated;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; position: relative; overflow: hidden; }
        .atm-light-leak-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 1; mix-blend-mode: screen;
          background: radial-gradient(ellipse ${pos}, ${c[0]} 0%, transparent 55%), radial-gradient(ellipse ${pos}, ${c[1]} 0%, transparent 40%), radial-gradient(ellipse ${pos}, ${c[2]} 0%, transparent 70%);
          ${anim ? 'animation: atm-leak-breathe 3s ease-in-out infinite;' : ''} }
        ${anim ? '@keyframes atm-leak-breathe { 0%,100% { opacity:1; } 50% { opacity:0.6; } }' : ''}
        ::slotted(*) { position: relative; }
      </style>
      <slot></slot><div class="atm-light-leak-overlay" aria-hidden="true"></div>`;
  }
}
if (!customElements.get('atm-light-leak')) customElements.define('atm-light-leak', AtmLightLeak);

// ─── atm-scanlines ───────────────────────────────────────────────────────────

class AtmScanlines extends HTMLElement {
  static get observedAttributes() { return ['opacity', 'spacing', 'color']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  get opacity() { const v = parseFloat(this.getAttribute('opacity')); return isNaN(v) ? 0.1 : Math.min(1, Math.max(0, v)); }
  get spacing() { const v = parseInt(this.getAttribute('spacing')); return isNaN(v) ? 3 : Math.min(8, Math.max(2, v)); }
  get color() { return this.getAttribute('color') || '#000000'; }
  connectedCallback() { this.render(); }
  attributeChangedCallback(n, o, v) { if (o !== v && this.isConnected) this.render(); }
  render() {
    const sp = this.spacing, c = this.color;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; position: relative; overflow: hidden; }
        .atm-scanlines-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 1; opacity: ${this.opacity};
          background: repeating-linear-gradient(to bottom, ${c} 0px, ${c} 1px, transparent 1px, transparent ${sp + 1}px); }
        ::slotted(*) { position: relative; }
      </style>
      <slot></slot><div class="atm-scanlines-overlay" aria-hidden="true"></div>`;
  }
}
if (!customElements.get('atm-scanlines')) customElements.define('atm-scanlines', AtmScanlines);

// ─── atm-paper ───────────────────────────────────────────────────────────────

class AtmPaper extends HTMLElement {
  static get observedAttributes() { return ['texture', 'opacity', 'tint']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._fid = `atm-paper-${Math.random().toString(36).substr(2, 9)}`; }
  get texture() { return this.getAttribute('texture') || 'fine'; }
  get opacity() { const v = parseFloat(this.getAttribute('opacity')); return isNaN(v) ? 0.08 : Math.min(0.3, Math.max(0, v)); }
  get tint() { return this.getAttribute('tint') || 'none'; }
  connectedCallback() { this.render(); }
  attributeChangedCallback(n, o, v) { if (o !== v && this.isConnected) this.render(); }

  _getTurbulenceParams() {
    const m = { rough: { bf: '0.04', oct: 6, sc: 12 }, medium: { bf: '0.06', oct: 5, sc: 8 }, fine: { bf: '0.1', oct: 4, sc: 5 } };
    return m[this.texture] || m.fine;
  }

  render() {
    const tp = this._getTurbulenceParams(), op = this.opacity, tint = this.tint, fid = this._fid, hasTint = tint && tint !== 'none';
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; position: relative; overflow: hidden; }
        .atm-paper-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 1; opacity: ${op}; filter: url(#${fid}); mix-blend-mode: multiply; ${hasTint ? `background-color: ${tint};` : ''} }
        ${hasTint ? `.atm-paper-tint { position: absolute; inset: 0; pointer-events: none; z-index: 0; background-color: ${tint}; opacity: ${op * 0.5}; }` : ''}
        ::slotted(*) { position: relative; }
      </style>
      <svg width="0" height="0" style="position:absolute"><defs><filter id="${fid}" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="${tp.bf}" numOctaves="${tp.oct}" stitchTiles="stitch" result="noise"/>
        <feDiffuseLighting in="noise" lighting-color="white" surfaceScale="${tp.sc}" result="lighting"><feDistantLight azimuth="45" elevation="60"/></feDiffuseLighting>
        <feComposite in="lighting" in2="noise" operator="in"/>
      </filter></defs></svg>
      <slot></slot>${hasTint ? '<div class="atm-paper-tint" aria-hidden="true"></div>' : ''}<div class="atm-paper-overlay" aria-hidden="true"></div>`;
  }
}
if (!customElements.get('atm-paper')) customElements.define('atm-paper', AtmPaper);

// ─── Registration complete ───────────────────────────────────────────────────
console.log('Atmosphère loaded — <atm-grain>, <atm-vignette>, <atm-light-leak>, <atm-scanlines>, <atm-paper>');
