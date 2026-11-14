/**
 * ColorBlindPreview — a paleta vista com 4 tipos de daltonismo (RF-09).
 * Para cada tipo, mostra as 3 cores simuladas e o pior contraste nessa visão.
 */
import { ColorBlindSimulator } from '../domain/vision/ColorBlindSimulator.js';
import { PaletteComparator } from '../domain/contrast/PaletteComparator.js';
import { PlainVerdict } from '../domain/contrast/PlainVerdict.js';
import { Palette } from '../domain/palette/Palette.js';
import { NumberFormat } from '../domain/format/NumberFormat.js';
import { StoreEvent } from '../app/PaletteStore.js';
import { Dom } from './Dom.js';

export class ColorBlindPreview {
  #root;
  #store;
  #bus;
  #simulator;
  #comparator;
  #verdict;
  #list;

  constructor({ root, store, bus, simulator = new ColorBlindSimulator(), comparator = new PaletteComparator(), verdict = new PlainVerdict() }) {
    this.#root = root;
    this.#store = store;
    this.#bus = bus;
    this.#simulator = simulator;
    this.#comparator = comparator;
    this.#verdict = verdict;
  }

  mount() {
    this.#list = Dom.el('ul', { class: 'vision' });
    Dom.replace(this.#root, [this.#list]);
    this.#bus.on(StoreEvent.PALETTE, () => this.#render());
    this.#render();
  }

  #render() {
    const { palette } = this.#store.state;
    const rows = [
      { name: 'Visão típica', description: 'Como a maioria das pessoas vê a sua paleta.', palette },
      ...this.#simulator.types().map((t) => ({
        name: t.name,
        description: t.description,
        palette: new Palette(palette.colors.map((c) => this.#simulator.simulate(c, t.id))),
      })),
    ];
    Dom.replace(this.#list, rows.map((r) => this.#row(r)));
  }

  #row({ name, description, palette }) {
    const worst = this.#comparator.worst(palette);
    const best = this.#comparator.compare(palette).reduce((max, c) => (c.ratio > max.ratio ? c : max));
    const verdict = this.#verdict.of(best.ratio);
    return Dom.el('li', { class: 'vision__row card zone-roxo' }, [
      Dom.el('div', {}, [Dom.el('h3', { text: name }), Dom.el('p', { text: description })]),
      Dom.el('div', { class: 'vision__swatches', role: 'img', 'aria-label': `Cores simuladas: ${palette.hexes.join(', ')}` },
        palette.colors.map((c) => Dom.el('span', { class: 'vision__swatch frame', style: { background: c.hex } }))),
      Dom.el('p', { class: 'vision__worst' }, [
        'Melhor par: ',
        Dom.el('strong', { text: NumberFormat.ratio(best.ratio) }),
        ` ${verdict.title}. Pior par: ${NumberFormat.ratio(worst.ratio)}.`,
      ]),
    ]);
  }
}
