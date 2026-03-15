/**
 * <atm-light-leak> — Film light leak web component
 * Part of the Atmosphère library (atmospherejs)
 * 
 * Warm light bleed at corners, like old film photography.
 * Zero dependencies. Shadow DOM encapsulated.
 */

class AtmLightLeak extends HTMLElement {
  static get observedAttributes() {
    return ['position', 'color', 'opacity', 'animated'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  get position() {
    return this.getAttribute('position') || 'top-right';
  }

  get color() {
    return this.getAttribute('color') || 'warm';
  }

  get opacity() {
    const val = parseFloat(this.getAttribute('opacity'));
    return isNaN(val) ? 0.4 : Math.min(1, Math.max(0, val));
  }

  get animated() {
    return this.getAttribute('animated') === 'true';
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this.isConnected) this.render();
  }

  _getColorStops() {
    const palettes = {
      warm: ['rgba(255, 147, 41, OPACITY)', 'rgba(255, 97, 56, HALF)', 'rgba(255, 50, 50, QUARTER)'],
      cool: ['rgba(100, 180, 255, OPACITY)', 'rgba(60, 120, 220, HALF)', 'rgba(40, 80, 180, QUARTER)'],
      golden: ['rgba(255, 215, 0, OPACITY)', 'rgba(255, 180, 0, HALF)', 'rgba(200, 140, 0, QUARTER)'],
      pink: ['rgba(255, 105, 180, OPACITY)', 'rgba(255, 60, 150, HALF)', 'rgba(220, 40, 120, QUARTER)']
    };

    const palette = palettes[this.color] || palettes.warm;
    const op = this.opacity;
    return palette.map(c =>
      c.replace('OPACITY', op.toFixed(2))
       .replace('HALF', (op * 0.5).toFixed(2))
       .replace('QUARTER', (op * 0.25).toFixed(2))
    );
  }

  _getGradientPosition() {
    switch (this.position) {
      case 'top-left': return 'at 0% 0%';
      case 'top-right': return 'at 100% 0%';
      case 'bottom-left': return 'at 0% 100%';
      case 'bottom-right': return 'at 100% 100%';
      default: return 'at 100% 0%';
    }
  }

  render() {
    const colors = this._getColorStops();
    const pos = this._getGradientPosition();
    const animated = this.animated;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          overflow: hidden;
        }
        .atm-light-leak-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          background:
            radial-gradient(ellipse ${pos}, ${colors[0]} 0%, transparent 55%),
            radial-gradient(ellipse ${pos}, ${colors[1]} 0%, transparent 40%),
            radial-gradient(ellipse ${pos}, ${colors[2]} 0%, transparent 70%);
          mix-blend-mode: screen;
          ${animated ? 'animation: atm-leak-breathe 3s ease-in-out infinite;' : ''}
        }
        ${animated ? `
        @keyframes atm-leak-breathe {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        ` : ''}
        ::slotted(*) {
          position: relative;
        }
      </style>
      <slot></slot>
      <div class="atm-light-leak-overlay" aria-hidden="true"></div>
    `;
  }
}

customElements.define('atm-light-leak', AtmLightLeak);
