/**
 * HarmonyWorkbench — o "rascunho" da seção de harmonias (RF-26, v1.1.0).
 *
 * Problema que resolve: antes, gerar uma harmonia trocava na hora a paleta que a pessoa
 * vinha montando nos passos 1, 2 e 3, e ela achava que tinha perdido tudo.
 * Agora a harmonia é montada aqui, num rascunho separado. A paleta da pessoa (no
 * PaletteStore) só muda quando ela clica em "Usar esta paleta" — e ainda dá para desfazer.
 *
 * Também serve de "modelo" para a roda cromática: tem state.palette, setColor,
 * checkpoint e recordFrom, a mesma interface do PaletteStore. O rascunho não tem
 * histórico próprio, então checkpoint e recordFrom não fazem nada.
 */
import { StoreEvent } from './PaletteStore.js';

export const DraftEvent = Object.freeze({
  PALETTE: 'draft:changed',
});

export class HarmonyWorkbench {
  #store;
  #bus;
  #generator;
  #palette;
  #pending = false;
  #message = { kind: 'info', text: '' };

  constructor({ store, bus, generator }) {
    this.#store = store;
    this.#bus = bus;
    this.#generator = generator;
    this.#palette = store.state.palette;
    // Sem rascunho pendente, o rascunho acompanha a paleta da pessoa.
    // Com rascunho pendente, ele fica, mas o "pendente" é recalculado (a pessoa pode ter
    // chegado à mesma paleta por outro caminho).
    this.#bus.on(StoreEvent.PALETTE, ({ palette }) => {
      if (this.#pending) {
        this.#pending = !HarmonyWorkbench.#sameHexes(this.#palette, palette);
        if (!this.#pending) this.#message = { kind: 'info', text: '' };
      } else {
        this.#palette = palette;
      }
      this.#emit();
    });
    this.#bus.on(StoreEvent.RESET, () => this.#onReset());
  }

  /** Chamado no "Começar do zero": o rascunho some junto com a paleta. */
  #onReset() {
    this.#pending = false;
    this.#palette = this.#store.state.palette;
    this.#message = { kind: 'info', text: '' };
    this.#emit();
  }

  /** Compara pelo HEX: em cinzas, mudar a matiz muda o HSB mas não a cor que se vê. */
  static #sameHexes(a, b) {
    return a.hexes.join() === b.hexes.join();
  }

  /** Fábrica: usa o mesmo gerador do PaletteStore. */
  static create({ store, bus }) {
    return new HarmonyWorkbench({ store, bus, generator: store.generator });
  }

  get state() {
    return Object.freeze({ palette: this.#palette, pending: this.#pending, message: { ...this.#message } });
  }

  /** Usado pela roda cromática: muda uma cor só no rascunho. */
  setColor(index, color) {
    const next = this.#palette.withColor(index, color);
    if (next.equals(this.#palette)) return;
    this.#palette = next;
    this.#pending = !HarmonyWorkbench.#sameHexes(next, this.#store.state.palette);
    this.#message = { kind: 'info', text: '' };
    this.#emit();
  }

  checkpoint() {}

  recordFrom() {}

  /** Gera uma paleta nova no rascunho, com a harmonia e a garantia escolhidas na seção. */
  generate({ random = false } = {}) {
    const { harmonyId, guardLevel } = this.#store.state;
    const base = random ? this.#generator.randomBase() : this.#palette.at(0).hsb;
    const { palette, message } = this.#generator.generate({ base, harmonyId, guardLevel });
    // A maioria das harmonias tem uma resposta só para cada cor: gerar de novo dá o mesmo resultado.
    const same = this.#pending && HarmonyWorkbench.#sameHexes(palette, this.#palette);
    this.#palette = palette;
    this.#message = same
      ? { kind: message.kind, text: `A paleta continua igual: esta harmonia tem uma resposta só para esta cor. Para variar, use "Sortear o tom base" ou mexa na roda. ${message.text}` }
      : message;
    this.#pending = !HarmonyWorkbench.#sameHexes(palette, this.#store.state.palette);
    this.#emit();
  }

  /** "Usar esta paleta": o rascunho vira a paleta da pessoa. Devolve false se não havia nada novo. */
  apply() {
    if (!this.#pending) return false;
    const draft = this.#palette;
    this.#pending = false;
    this.#message = { kind: 'info', text: '' };
    this.#store.setPalette(draft, {
      message: { kind: 'success', text: 'Paleta nova aplicada nos passos 1 a 4. Quer a anterior de volta? Use "Desfazer" no Passo 1.' },
    });
    this.#emit();
    return true;
  }

  /** "Descartar": esquece o rascunho e volta para a paleta da pessoa. */
  discard() {
    this.#pending = false;
    this.#palette = this.#store.state.palette;
    this.#message = { kind: 'info', text: '' };
    this.#emit();
  }

  #emit() {
    this.#bus.emit(DraftEvent.PALETTE, this.state);
  }
}
