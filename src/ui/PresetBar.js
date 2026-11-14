/**
 * PresetBar — "Comece por aqui": paletas prontas com um clique, como os modelos do Canva (RF-19).
 */
import { Dom } from './Dom.js';

export class PresetBar {
  #root;
  #store;

  constructor({ root, store }) {
    this.#root = root;
    this.#store = store;
  }

  mount() {
    const buttons = this.#store.presets.list().map((preset) =>
      Dom.el('button', {
        type: 'button',
        class: 'btn btn--ghost preset',
        'data-preset': preset.id,
        'aria-label': `Aplicar a paleta ${preset.name}: ${preset.hexes.join(', ')}`,
        title: preset.description,
        on: { click: () => this.#store.applyPreset(preset.id) },
      }, [
        Dom.el('span', { class: 'preset__dots', 'aria-hidden': 'true' },
          preset.hexes.map((hex) => Dom.el('span', { class: 'preset__dot', style: { background: hex } }))),
        preset.name,
      ]),
    );
    Dom.replace(this.#root, [Dom.el('span', { class: 'presets__label', text: 'Comece por aqui:' }), ...buttons]);
    this.#root.setAttribute('role', 'group');
    this.#root.setAttribute('aria-label', 'Paletas prontas');
  }
}
