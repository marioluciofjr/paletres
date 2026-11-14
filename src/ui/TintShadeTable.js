/**
 * TintShadeTable — escala de tints e shades de cada cor (RF-08).
 * Um clique copia o HEX ou aplica o tom na paleta, conforme a opção escolhida.
 *
 * Teclado ("roving tabindex"): cada faixa é UMA parada de Tab; dentro dela, as setas
 * ← → (e Home/End) andam entre os 19 tons. Sem isso seriam 57 Tabs seguidos.
 */
import { TintShadeGenerator } from '../domain/tints/TintShadeGenerator.js';
import { Palette } from '../domain/palette/Palette.js';
import { StoreEvent } from '../app/PaletteStore.js';
import { Dom } from './Dom.js';

export class TintShadeTable {
  #root;
  #store;
  #bus;
  #generator;
  #clipboard;
  #toast;
  #rows;
  #mode = 'copy';
  #activeCol = [9, 9, 9]; // em cada faixa, qual célula recebe o Tab (começa na original)

  constructor({ root, store, bus, clipboard, toast, generator = new TintShadeGenerator() }) {
    this.#root = root;
    this.#store = store;
    this.#bus = bus;
    this.#generator = generator;
    this.#clipboard = clipboard;
    this.#toast = toast;
  }

  mount() {
    const name = Dom.uid('modo-tons');
    const option = (value, label) => Dom.el('label', { class: 'chip' }, [
      Dom.el('input', { type: 'radio', name, value, checked: value === this.#mode, on: { change: () => { this.#mode = value; } } }),
      Dom.el('span', { text: label }),
    ]);
    const mode = Dom.el('fieldset', { class: 'chip-group tints-mode' }, [
      Dom.el('legend', { text: 'Ao clicar num tom:' }),
      Dom.el('div', { class: 'chips' }, [option('copy', 'Copiar o HEX'), option('apply', 'Usar na paleta')]),
    ]);
    const hint = Dom.el('p', { class: 'field__label', text: 'Dica: no teclado, use Tab para ir de uma cor a outra e as setas ← → para andar entre os tons.' });
    this.#rows = Dom.el('div');
    Dom.replace(this.#root, [mode, hint, this.#rows]);
    this.#bus.on(StoreEvent.PALETTE, () => this.#render());
    this.#render();
  }

  #render() {
    // Guarda qual célula tinha o foco, para devolvê-lo depois de redesenhar.
    const focused = this.#root.contains(document.activeElement) ? document.activeElement.dataset.cell : null;
    const { palette } = this.#store.state;
    Dom.replace(this.#rows, palette.colors.map((color, index) => this.#row(color, index)));
    if (focused) this.#rows.querySelector(`[data-cell="${focused}"]`)?.focus();
  }

  #row(color, index) {
    const label = Palette.LABELS[index];
    const scale = this.#generator.scale(color);
    const header = Dom.el('div', { class: 'tint-scale', 'aria-hidden': 'true' },
      scale.map((s) => Dom.el('span', { text: s.kind === 'base' ? 'Cor' : `${s.amount}` })));
    const strip = Dom.el('div', {
      class: 'tint-strip',
      role: 'group',
      'aria-label': `Tons da cor ${label}`,
      on: { keydown: (e) => this.#onKey(e, index, strip) },
    }, scale.map((s, col) => Dom.el('button', {
      type: 'button',
      class: `tint-cell${s.kind === 'base' ? ' tint-cell--base' : ''}`,
      'data-cell': `${index}-${col}`,
      tabindex: col === this.#activeCol[index] ? '0' : '-1',
      style: { background: s.color.hex },
      'aria-label': `${s.label} da cor ${label}: ${s.color.hex}${s.kind === 'base' ? ' (cor original)' : ''}`,
      title: `${s.label}: ${s.color.hex}`,
      on: {
        click: () => this.#pick(index, s),
        focus: (e) => this.#makeActive(index, col, e.currentTarget),
      },
    })));
    return Dom.el('div', { class: 'tint-row' }, [
      Dom.el('div', { class: 'tint-row__head' }, [Dom.el('span', { class: 'preset__dot', style: { background: color.hex }, 'aria-hidden': 'true' }), `Cor ${label} (${color.hex})`]),
      // Régua e faixa rolam juntas no celular, sem empurrar a página para o lado.
      Dom.el('div', { class: 'tint-scroll' }, [header, strip]),
    ]);
  }

  #onKey(e, index, strip) {
    const cells = [...strip.querySelectorAll('.tint-cell')];
    const current = cells.indexOf(document.activeElement);
    const targets = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: cells.length - 1 };
    if (!(e.key in targets) || current < 0) return;
    e.preventDefault();
    const next = Math.max(0, Math.min(cells.length - 1, targets[e.key]));
    cells[next].focus(); // o evento focus chama #makeActive
  }

  /** A célula focada passa a ser a única da faixa alcançável pelo Tab. */
  #makeActive(index, col, cell) {
    this.#activeCol[index] = col;
    for (const other of cell.parentElement.querySelectorAll('.tint-cell')) other.tabIndex = -1;
    cell.tabIndex = 0;
  }

  async #pick(index, item) {
    if (this.#mode === 'apply') {
      if (this.#store.state.palette.at(index).equals(item.color)) {
        this.#toast.show(`A cor ${Palette.LABELS[index]} já é ${item.color.hex}.`);
        return;
      }
      this.#store.setColor(index, item.color);
      this.#toast.show(`Cor ${Palette.LABELS[index]} trocada por ${item.color.hex} (${item.label}).`);
      return;
    }
    const ok = await this.#clipboard.copy(item.color.hex);
    this.#toast.show(ok ? `${item.color.hex} copiado.` : 'Não foi possível copiar.');
  }
}
