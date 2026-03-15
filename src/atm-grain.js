/**
 * <atm-grain> — Animated film grain web component
 * Part of the Atmosphère library (atmospherejs)
 * 
 * Uses Canvas API to generate organic Perlin-style noise.
 * Zero dependencies. Shadow DOM encapsulated.
 */

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

  // --- Simplex-inspired noise helpers ---

  _generatePermutation() {
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    // Fisher-Yates shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    // Extend to 512 for wrapping
    return [...p, ...p];
  }

  _fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  _lerp(a, b, t) {
    return a + t * (b - a);
  }

  _grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : -x;
    const v = h === 0 || h === 2 ? y : -y;
    return u + v;
  }

  _perlin(x, y) {
    const p = this._perm;
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = this._fade(xf);
    const v = this._fade(yf);

    const aa = p[p[xi] + yi];
    const ab = p[p[xi] + yi + 1];
    const ba = p[p[xi + 1] + yi];
    const bb = p[p[xi + 1] + yi + 1];

    const x1 = this._lerp(this._grad(aa, xf, yf), this._grad(ba, xf - 1, yf), u);
    const x2 = this._lerp(this._grad(ab, xf, yf - 1), this._grad(bb, xf - 1, yf - 1), u);

    return this._lerp(x1, x2, v);
  }

  // --- Props ---

  get intensity() {
    return parseFloat(this.getAttribute('intensity')) || 0.3;
  }

  get speed() {
    return this.getAttribute('speed') || 'medium';
  }

  get color() {
    return this.getAttribute('color') || 'neutral';
  }

  get animated() {
    const attr = this.getAttribute('animated');
    return attr === null || attr !== 'false';
  }

  get blend() {
    return this.getAttribute('blend') || 'overlay';
  }

  // --- Lifecycle ---

  connectedCallback() {
    this.render();
    this._setupCanvas();
    this._drawNoise();
    if (this.animated) {
      this._startAnimation();
    }
  }

  disconnectedCallback() {
    this._stopAnimation();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this.isConnected) {
      if (name === 'animated') {
        if (newVal === 'false') {
          this._stopAnimation();
        } else {
          this._startAnimation();
        }
      }
      this.render();
      this._setupCanvas();
      this._drawNoise();
    }
  }

  // --- Render ---

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          overflow: hidden;
        }
        .atm-grain-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          mix-blend-mode: ${this.blend};
          z-index: 1;
        }
        ::slotted(*) {
          position: relative;
        }
      </style>
      <slot></slot>
      <canvas class="atm-grain-canvas" aria-hidden="true"></canvas>
    `;
  }

  // --- Canvas ---

  _setupCanvas() {
    this._canvas = this.shadowRoot.querySelector('.atm-grain-canvas');
    if (!this._canvas) return;
    this._ctx = this._canvas.getContext('2d', { willReadFrequently: true });

    const rect = this.getBoundingClientRect();
    // Use a scaled-down canvas for performance (grain doesn't need full resolution)
    const scale = 0.5;
    this._canvas.width = Math.max(rect.width * scale, 1);
    this._canvas.height = Math.max(rect.height * scale, 1);
  }

  _getColorTint() {
    switch (this.color) {
      case 'warm':
        return { r: 20, g: 10, b: -10 };
      case 'cool':
        return { r: -10, g: 0, b: 15 };
      default: // neutral
        return { r: 0, g: 0, b: 0 };
    }
  }

  _drawNoise() {
    const canvas = this._canvas;
    const ctx = this._ctx;
    if (!canvas || !ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return;

    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    const intensity = this.intensity;
    const tint = this._getColorTint();
    const time = performance.now() * 0.001;

    // Scale factor for Perlin noise — controls the grain "size"
    const noiseScale = 4.0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // Multi-octave Perlin noise for organic feel
        const nx = x / w * noiseScale;
        const ny = y / h * noiseScale;

        let noise = this._perlin(nx + time * 3, ny + time * 2) * 0.6;
        noise += this._perlin(nx * 2 + time * 5, ny * 2 + time * 3) * 0.3;
        noise += this._perlin(nx * 4 + time * 7, ny * 4 + time * 5) * 0.1;

        // Add some random jitter for film-grain feel
        noise += (Math.random() - 0.5) * 0.4;

        // Map to 0-255 range
        const value = Math.floor((noise + 1) * 0.5 * 255);
        const alpha = Math.floor(intensity * 255);

        const i = (y * w + x) * 4;
        data[i] = Math.min(255, Math.max(0, value + tint.r));
        data[i + 1] = Math.min(255, Math.max(0, value + tint.g));
        data[i + 2] = Math.min(255, Math.max(0, value + tint.b));
        data[i + 3] = alpha;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // --- Animation ---

  _getFrameInterval() {
    switch (this.speed) {
      case 'slow': return 120;
      case 'fast': return 50;
      default: return 80; // medium
    }
  }

  _startAnimation() {
    this._stopAnimation();
    const interval = this._getFrameInterval();

    const animate = (timestamp) => {
      if (timestamp - this._lastFrame >= interval) {
        this._lastFrame = timestamp;
        // Regenerate permutation table for new noise pattern
        this._perm = this._generatePermutation();
        this._drawNoise();
      }
      this._animationId = requestAnimationFrame(animate);
    };

    this._animationId = requestAnimationFrame(animate);
  }

  _stopAnimation() {
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
  }
}

customElements.define('atm-grain', AtmGrain);
