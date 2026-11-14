/**
 * PaletteComparator — monta as 6 comparações ordenadas de uma paleta de 3 cores.
 *
 * Com 3 cores existem 3 pares (AB, AC, BC). Como cada par pode ser "texto sobre fundo"
 * nas duas direções, surgem 6 comparações. No WCAG 2.2 as duas direções têm o mesmo
 * número; no APCA, não. Por isso mostramos as 6.
 *
 * As estratégias de contraste chegam pelo construtor (injeção de dependência),
 * o que facilita testar e trocar os métodos.
 */
import { Wcag2Contrast } from './Wcag2Contrast.js';
import { ApcaContrast } from './ApcaContrast.js';
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
  #apca;
  #evaluator;

  constructor({ wcag = new Wcag2Contrast(), apca = new ApcaContrast(), evaluator = new ContrastEvaluator() } = {}) {
    this.#wcag = wcag;
    this.#apca = apca;
    this.#evaluator = evaluator;
  }

  /** Compara um par específico (texto, fundo). */
  compareColors(text, background) {
    const ratio = this.#wcag.measure(text, background);
    const lc = this.#apca.measure(text, background);
    return {
      ratio,
      levels: this.#evaluator.levels(ratio),
      apca: { lc, description: this.#apca.describe(lc) },
    };
  }

  /**
   * @param {import('../palette/Palette.js').Palette} palette
   * @returns {Array<{id: string, text: {index:number,label:string,color:any}, background: {index:number,label:string,color:any}, ratio:number, levels:object, apca:{lc:number,description:string}}>}
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
