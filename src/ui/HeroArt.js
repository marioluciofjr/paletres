/**
 * HeroArt — as 3 bolas sobrepostas do topo da página, pintadas com a paleta atual.
 * Mostra, logo no primeiro olhar, que o site trabalha com 3 cores.
 * Antes de a pessoa clicar em "Gerar paleta" (v1.1.0), mostra 3 círculos vazios com "?".
 * As velocidades do parallax de cada bola ficam no CSS (ver ParallaxScene).
 */
import { Palette } from '../domain/palette/Palette.js';
import { StoreEvent } from '../app/PaletteStore.js';
import { Dom } from './Dom.js';

export class HeroArt {
  #root;
  #store;
  #bus;

  constructor({ root, store, bus }) {
    this.#root = root;
    this.#store = store;
    this.#bus = bus;
  }

  mount() {
    this.#bus.on(StoreEvent.PALETTE, () => this.#render());
    this.#bus.on(StoreEvent.STARTED, () => this.#render());
    this.#render();
  }

  #render() {
    const { palette, started } = this.#store.state;
    if (!started) return this.#renderEmpty();
    this.#root.setAttribute('aria-label', `Sua paleta atual: ${palette.hexes.map((h, i) => `cor ${Palette.LABELS[i]} ${h}`).join(', ')}`);
    Dom.replace(this.#root, palette.colors.map((c, i) =>
      Dom.el('span', { class: 'hero-dot', style: { background: c.hex } }, [
        Dom.el('span', { class: 'hero-dot__label', 'aria-hidden': 'true' }, [
          Palette.LABELS[i],
          Dom.el('span', { class: 'hero-dot__hex', text: ` ${c.hex}` }),
        ]),
      ]),
    ));
  }

  /** Paleta ainda vazia: 3 círculos tracejados, sem cor nenhuma. */
  #renderEmpty() {
    this.#root.setAttribute('aria-label', 'Sua paleta ainda está vazia. Clique em Gerar paleta.');
    Dom.replace(this.#root, Palette.LABELS.map(() =>
      Dom.el('span', { class: 'hero-dot hero-dot--empty' }, [Dom.el('span', { class: 'hero-dot__q', 'aria-hidden': 'true', text: '?' })])));
  }
}
