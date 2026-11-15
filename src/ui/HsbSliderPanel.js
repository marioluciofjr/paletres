/**
 * HsbSliderPanel — os sliders de Matiz, Saturação e Brilho da cor em edição (RF-02).
 *
 * Cada trilho é pintado com as cores reais que o slider vai produzir, para a pessoa
 * "ver" o que acontece antes de arrastar. Os rótulos explicam o termo em palavras simples.
 */
import { Color } from '../domain/color/Color.js';
import { Palette } from '../domain/palette/Palette.js';
import { StoreEvent } from '../app/PaletteStore.js';
import { GestureRecorder } from '../app/GestureRecorder.js';
import { Dom } from './Dom.js';

const CHANNELS = Object.freeze([
  { key: 'h', label: 'Matiz', hint: 'o tom da cor', max: 360, unit: '°', spoken: 'graus' },
  { key: 's', label: 'Saturação', hint: 'o quanto a cor é viva', max: 100, unit: '%', spoken: 'por cento' },
  { key: 'b', label: 'Brilho', hint: 'o quanto a cor é clara', max: 100, unit: '%', spoken: 'por cento' },
]);

export class HsbSliderPanel {
  #root;
  #store;
  #bus;
  #gesture;
  #title;
  #chip;
  #rows = [];

  constructor({ root, store, bus }) {
    this.#root = root;
    this.#store = store;
    this.#bus = bus;
    this.#gesture = new GestureRecorder(store);
  }

  mount() {
    this.#title = Dom.el('h3');
    this.#chip = Dom.el('span', { class: 'hsb__chip frame', 'aria-hidden': 'true' });
    const head = Dom.el('div', { class: 'hsb__head' }, [
      this.#chip,
      this.#title,
      Dom.el('button', { type: 'button', class: 'info-btn', 'data-info': 'hsb', 'aria-label': 'O que é isso? Matiz, saturação e brilho' }, 'O que é isso?'),
    ]);
    const info = Dom.el('div', { class: 'info-panel', id: 'info-hsb', hidden: true },
      'Matiz é o "tom" da cor no círculo (0° é vermelho, 120° é verde, 240° é azul). Saturação diz o quanto ela é viva (0% é cinza). Brilho diz o quanto ela é clara (0% é preto).');

    this.#rows = CHANNELS.map((ch) => this.#buildRow(ch));
    Dom.replace(this.#root, [head, info, ...this.#rows.map((r) => r.row)]);

    const render = () => this.#render();
    this.#bus.on(StoreEvent.PALETTE, render);
    this.#bus.on(StoreEvent.SELECTION, render);
    this.#render();
  }

  #buildRow(ch) {
    const id = Dom.uid(`hsb-${ch.key}`);
    // span escondido do leitor de tela: o slider já anuncia o valor (aria-valuetext).
    const value = Dom.el('span', { class: 'hsb__value', 'aria-hidden': 'true' });
    const range = Dom.el('input', {
      id,
      type: 'range',
      class: 'range',
      min: '0',
      max: String(ch.max),
      step: '1',
      on: {
        input: (e) => this.#onInput(ch.key, Number(e.target.value)),
        change: () => this.#gesture.end(),
      },
    });
    const label = Dom.el('label', { for: id }, [Dom.el('strong', { text: ch.label }), ` (${ch.hint})`]);
    return { ch, row: Dom.el('div', { class: 'hsb__row' }, [label, range, value]), range, value };
  }

  #onInput(key, v) {
    const { palette, selectedIndex } = this.#store.state;
    const next = palette.at(selectedIndex).withHsb({ [key]: v });
    this.#gesture.step((opts) => this.#store.setColor(selectedIndex, next, opts));
  }

  #render() {
    const { palette, selectedIndex } = this.#store.state;
    const color = palette.at(selectedIndex);
    const { h, s, b } = color.hsb;
    this.#title.textContent = `Ajustando a cor ${Palette.LABELS[selectedIndex]} (${color.hex})`;
    this.#chip.style.background = color.hex;

    const tracks = {
      h: this.#gradient((t) => Color.fromHsb(t * 360, s, b)),
      s: this.#gradient((t) => Color.fromHsb(h, t * 100, b)),
      b: this.#gradient((t) => Color.fromHsb(h, s, t * 100)),
    };
    for (const { ch, range, value } of this.#rows) {
      const v = Math.round(color.hsb[ch.key]);
      if (Number(range.value) !== v) range.value = String(v);
      range.setAttribute('aria-valuetext', `${v} ${ch.spoken}`);
      range.style.setProperty('--track', tracks[ch.key]);
      value.textContent = `${v}${ch.unit}`;
    }
  }

  /** Gradiente CSS com 7 paradas, calculadas pelas próprias conversões do domínio. */
  #gradient(colorAt) {
    const stops = Array.from({ length: 7 }, (_, i) => colorAt(i / 6).hex);
    return `linear-gradient(90deg, ${stops.join(', ')})`;
  }
}
