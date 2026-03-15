/**
 * <atm-paper> — Paper/parchment texture web component
 * Part of the Atmosphère library (atmospherejs)
 * 
 * Uses SVG feTurbulence filter for crisp, scalable paper texture.
 * Zero dependencies. Shadow DOM encapsulated.
 */

class AtmPaper extends HTMLElement {
  static get observedAttributes() {
    return ['texture', 'opacity', 'tint'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._filterId = `atm-paper-${Math.random().toString(36).substr(2, 9)}`;
  }

  get texture() {
    return this.getAttribute('texture') || 'fine';
  }

  get opacity() {
    const val = parseFloat(this.getAttribute('opacity'));
    return isNaN(val) ? 0.08 : Math.min(0.3, Math.max(0, val));
  }

  get tint() {
    return this.getAttribute('tint') || 'none';
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this.isConnected) this.render();
  }

  _getTurbulenceParams() {
    switch (this.texture) {
      case 'rough':
        return { baseFrequency: '0.04', numOctaves: 6, scale: 12 };
      case 'medium':
        return { baseFrequency: '0.06', numOctaves: 5, scale: 8 };
      default: // fine
        return { baseFrequency: '0.1', numOctaves: 4, scale: 5 };
    }
  }

  render() {
    const params = this._getTurbulenceParams();
    const opacity = this.opacity;
    const tint = this.tint;
    const filterId = this._filterId;
    const hasTint = tint && tint !== 'none';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          overflow: hidden;
        }
        .atm-paper-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          opacity: ${opacity};
          filter: url(#${filterId});
          mix-blend-mode: multiply;
          ${hasTint ? `background-color: ${tint};` : ''}
        }
        .atm-paper-tint {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          ${hasTint ? `background-color: ${tint}; opacity: ${opacity * 0.5};` : ''}
        }
        ::slotted(*) {
          position: relative;
        }
      </style>
      <svg width="0" height="0" style="position:absolute;">
        <defs>
          <filter id="${filterId}" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="${params.baseFrequency}"
              numOctaves="${params.numOctaves}"
              stitchTiles="stitch"
              result="noise"
            />
            <feDiffuseLighting
              in="noise"
              lighting-color="white"
              surfaceScale="${params.scale}"
              result="lighting"
            >
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
            <feComposite in="lighting" in2="noise" operator="in" />
          </filter>
        </defs>
      </svg>
      <slot></slot>
      ${hasTint ? '<div class="atm-paper-tint" aria-hidden="true"></div>' : ''}
      <div class="atm-paper-overlay" aria-hidden="true"></div>
    `;
  }
}

customElements.define('atm-paper', AtmPaper);
