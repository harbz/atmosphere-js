/**
 * <atm-scanlines> — CRT scanline web component
 * Part of the Atmosphère library (atmospherejs)
 * 
 * Uses repeating-linear-gradient for performant scan lines.
 * Zero dependencies. Shadow DOM encapsulated.
 */

class AtmScanlines extends HTMLElement {
  static get observedAttributes() {
    return ['opacity', 'spacing', 'color'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  get opacity() {
    const val = parseFloat(this.getAttribute('opacity'));
    return isNaN(val) ? 0.1 : Math.min(1, Math.max(0, val));
  }

  get spacing() {
    const val = parseInt(this.getAttribute('spacing'));
    return isNaN(val) ? 3 : Math.min(8, Math.max(2, val));
  }

  get color() {
    return this.getAttribute('color') || '#000000';
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this.isConnected) this.render();
  }

  render() {
    const spacing = this.spacing;
    const lineHeight = 1;
    const opacity = this.opacity;
    const color = this.color;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          overflow: hidden;
        }
        .atm-scanlines-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          opacity: ${opacity};
          background: repeating-linear-gradient(
            to bottom,
            ${color} 0px,
            ${color} ${lineHeight}px,
            transparent ${lineHeight}px,
            transparent ${spacing + lineHeight}px
          );
        }
        ::slotted(*) {
          position: relative;
        }
      </style>
      <slot></slot>
      <div class="atm-scanlines-overlay" aria-hidden="true"></div>
    `;
  }
}

customElements.define('atm-scanlines', AtmScanlines);
