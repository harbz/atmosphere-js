/**
 * <atm-vignette> — Edge vignette web component
 * Part of the Atmosphère library (atmospherejs)
 * 
 * CSS radial-gradient overlay for cinematic edge darkening.
 * Zero dependencies. Shadow DOM encapsulated.
 */

class AtmVignette extends HTMLElement {
  static get observedAttributes() {
    return ['strength', 'color', 'shape'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  get strength() {
    return parseFloat(this.getAttribute('strength')) || 0.5;
  }

  get color() {
    return this.getAttribute('color') || '#000000';
  }

  get shape() {
    return this.getAttribute('shape') || 'oval';
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this.isConnected) this.render();
  }

  render() {
    const strength = this.strength;
    const color = this.color;
    const shape = this.shape === 'square'
      ? 'closest-side'
      : 'ellipse at center';

    // Build radial gradient from transparent center to colored edges
    const innerStop = Math.round((1 - strength) * 65 + 15);
    const outerStop = Math.round((1 - strength) * 20 + 75);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          overflow: hidden;
        }
        .atm-vignette-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          background: radial-gradient(
            ${shape},
            transparent ${innerStop}%,
            ${color}${Math.round(strength * 200).toString(16).padStart(2, '0')} ${outerStop}%,
            ${color}${Math.round(strength * 255).toString(16).padStart(2, '0')} 100%
          );
        }
        ::slotted(*) {
          position: relative;
        }
      </style>
      <slot></slot>
      <div class="atm-vignette-overlay" aria-hidden="true"></div>
    `;
  }
}

customElements.define('atm-vignette', AtmVignette);
