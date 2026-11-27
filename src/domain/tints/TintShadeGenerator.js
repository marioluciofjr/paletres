/**
 * TintShadeGenerator — gera tons claros e tons escuros de uma cor (em inglês, "tints" e "shades"),
 * do mesmo jeito que o maketintsandshades.com: misturando em RGB com branco ou preto.
 *
 *  - Tom claro de 30% (tint) = 70% da cor + 30% de branco.
 *  - Tom escuro de 30% (shade) = 70% da cor + 30% de preto.
 * Paramos em 90% porque 100% seria sempre branco ou preto puro.
 */
import { Color } from '../color/Color.js';

export class TintShadeGenerator {
  #steps;

  /** @param {number[]} steps porcentagens da mistura (padrão 10% a 90%) */
  constructor(steps = [10, 20, 30, 40, 50, 60, 70, 80, 90]) {
    this.#steps = steps;
  }

  /** Mistura com branco. `amount` vai de 0 a 1. */
  tint(color, amount) {
    const { r, g, b } = color.rgb;
    const mix = (c) => c + (255 - c) * amount;
    return Color.fromRgb(mix(r), mix(g), mix(b));
  }

  /** Mistura com preto. `amount` vai de 0 a 1. */
  shade(color, amount) {
    const { r, g, b } = color.rgb;
    const mix = (c) => c * (1 - amount);
    return Color.fromRgb(mix(r), mix(g), mix(b));
  }

  /**
   * Escala completa, do mais claro ao mais escuro: tons claros (90% → 10%), a original, tons escuros (10% → 90%).
   * @returns {Array<{ color: Color, label: string, kind: 'tint'|'base'|'shade', amount: number }>}
   */
  scale(color) {
    const tints = [...this.#steps].reverse().map((p) => ({ color: this.tint(color, p / 100), label: `Claro ${p}%`, kind: 'tint', amount: p }));
    const shades = this.#steps.map((p) => ({ color: this.shade(color, p / 100), label: `Escuro ${p}%`, kind: 'shade', amount: p }));
    return [...tints, { color, label: 'Original', kind: 'base', amount: 0 }, ...shades];
  }
}
