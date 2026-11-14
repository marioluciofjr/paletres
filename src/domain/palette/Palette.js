/**
 * Palette — Value Object com exatamente 3 cores (A, B e C).
 * É imutável: withColor() devolve uma paleta nova.
 */
import { Color } from '../color/Color.js';
import { Wcag2Contrast } from '../contrast/Wcag2Contrast.js';

export class Palette {
  static SIZE = 3;
  static LABELS = Object.freeze(['A', 'B', 'C']);

  #colors;

  /** @param {Color[]} colors */
  constructor(colors) {
    if (!Array.isArray(colors) || colors.length !== Palette.SIZE || !colors.every((c) => c instanceof Color)) {
      throw new TypeError('A paleta precisa de exatamente 3 cores (instâncias de Color).');
    }
    this.#colors = Object.freeze([...colors]);
    Object.freeze(this);
  }

  /** Paleta inicial: as três cores da Prazo Certo. */
  static default() {
    return Palette.fromHexes(['#230023', '#F2F2F2', '#42FFFF']);
  }

  static fromHexes(hexes) {
    return new Palette(hexes.map((h) => Color.fromHex(h)));
  }

  get colors() {
    return this.#colors;
  }

  get hexes() {
    return this.#colors.map((c) => c.hex);
  }

  at(index) {
    return this.#colors[index];
  }

  labelOf(index) {
    return Palette.LABELS[index];
  }

  withColor(index, color) {
    const next = [...this.#colors];
    next[index] = color;
    return new Palette(next);
  }

  /** Cores da mais escura para a mais clara (usado no color grading e nos mockups). */
  sortedByLuminance() {
    return [...this.#colors].sort((a, b) => Wcag2Contrast.luminance(a) - Wcag2Contrast.luminance(b));
  }

  /** Igualdade estrita (HEX e HSB de cada cor): ver Color.sameAs. */
  equals(other) {
    return other instanceof Palette && this.#colors.every((c, i) => c.sameAs(other.at(i)));
  }

  /** Quantas cores diferentes (pelo HEX) a paleta tem: 1, 2 ou 3. */
  distinctCount() {
    return new Set(this.hexes).size;
  }
}
