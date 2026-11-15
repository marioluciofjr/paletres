/**
 * PaletteComparator — monta as 6 comparações ordenadas de uma paleta de 3 cores.
 *
 * Com 3 cores existem 3 pares (AB, AC, BC). Como cada par pode ser "texto sobre fundo"
 * nas duas direções, surgem 6 comparações. No WCAG 2.2 as duas direções têm o mesmo
 * número, mas a aparência muda (texto escuro no claro não parece igual a claro no escuro).
 * Por isso mostramos as 6 prévias.
 *
 * A estratégia de contraste chega pelo construtor (injeção de dependência),
 * o que facilita testar e trocar o método.
 */
import { Wcag2Contrast } from './Wcag2Contrast.js';
import { ContrastEvaluator } from './ContrastEvaluator.js';

// Ordem fixa: [índice do texto, índice do fundo].
const ORDER = Object.freeze([
  [0, 1],
  [1, 0],
  [0, 2],
  [2, 0],
  [1, 2],
  [2, 1],
]);

export class PaletteComparator {
  #wcag;
  #evaluator;

  constructor({ wcag = new Wcag2Contrast(), evaluator = new ContrastEvaluator() } = {}) {
    this.#wcag = wcag;
    this.#evaluator = evaluator;
  }

  /** Compara um par específico (texto, fundo). */
  compareColors(text, background) {
    const ratio = this.#wcag.measure(text, background);
    return { ratio, levels: this.#evaluator.levels(ratio) };
  }

  /**
   * @param {import('../palette/Palette.js').Palette} palette
   * @returns {Array<{id: string, text: {index:number,label:string,color:any}, background: {index:number,label:string,color:any}, ratio:number, levels:object}>}
   */
  compare(palette) {
    return ORDER.map(([t, b]) => {
      const text = { index: t, label: palette.labelOf(t), color: palette.at(t) };
      const background = { index: b, label: palette.labelOf(b), color: palette.at(b) };
      return {
        id: `${text.label}${background.label}`,
        text,
        background,
        ...this.compareColors(text.color, background.color),
      };
    });
  }

  /** A comparação de menor razão WCAG (o "elo mais fraco" da paleta). */
  worst(palette) {
    return this.compare(palette).reduce((min, c) => (c.ratio < min.ratio ? c : min));
  }
}
