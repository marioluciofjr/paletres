/**
 * PaletteComparator — monta as 3 comparações de uma paleta de 3 cores (uma por par).
 *
 * Com 3 cores existem 3 pares: AB, AC e BC. Na WCAG 2.2, "A sobre B" e "B sobre A" dão
 * exatamente o mesmo número. Por isso, desde a v1.1.0, cada par é UMA comparação, com um
 * só valor. A interface mostra as duas prévias do par (uma cor sobre a outra e o inverso),
 * porque a aparência muda, mas não repete o número.
 *
 * A estratégia de contraste chega pelo construtor (injeção de dependência),
 * o que facilita testar e trocar o método.
 */
import { Wcag2Contrast } from './Wcag2Contrast.js';
import { ContrastEvaluator } from './ContrastEvaluator.js';

// Ordem fixa dos pares: [índice da 1ª cor, índice da 2ª cor].
const PAIRS = Object.freeze([
  [0, 1],
  [0, 2],
  [1, 2],
]);

export class PaletteComparator {
  #wcag;
  #evaluator;

  constructor({ wcag = new Wcag2Contrast(), evaluator = new ContrastEvaluator() } = {}) {
    this.#wcag = wcag;
    this.#evaluator = evaluator;
  }

  /** Compara duas cores quaisquer (a ordem não muda o resultado na WCAG). */
  compareColors(a, b) {
    const ratio = this.#wcag.measure(a, b);
    return { ratio, levels: this.#evaluator.levels(ratio) };
  }

  /**
   * @param {import('../palette/Palette.js').Palette} palette
   * @returns {Array<{id: string, first: {index:number,label:string,color:any}, second: {index:number,label:string,color:any}, ratio:number, levels:object}>}
   */
  compare(palette) {
    return PAIRS.map(([i, j]) => {
      const first = { index: i, label: palette.labelOf(i), color: palette.at(i) };
      const second = { index: j, label: palette.labelOf(j), color: palette.at(j) };
      return { id: `${first.label}${second.label}`, first, second, ...this.compareColors(first.color, second.color) };
    });
  }

  /** O par de menor razão WCAG (o "elo mais fraco" da paleta). */
  worst(palette) {
    return this.compare(palette).reduce((min, c) => (c.ratio < min.ratio ? c : min));
  }
}
