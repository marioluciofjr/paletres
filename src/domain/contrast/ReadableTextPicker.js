/**
 * ReadableTextPicker — escolhe, entre as cores da paleta, a melhor para o texto
 * de uma superfície (usado nos mockups de site e app, RF-17).
 *
 * A própria cor da superfície é descartada: texto da mesma cor do fundo é invisível.
 */
export class ReadableTextPicker {
  #strategy;

  /** @param {import('./ContrastStrategy.js').ContrastStrategy} strategy */
  constructor(strategy) {
    this.#strategy = strategy;
  }

  /**
   * @param {import('../color/Color.js').Color} background
   * @param {import('../color/Color.js').Color[]} candidates
   * @returns {{ color: any, ratio: number }}
   */
  pick(background, candidates) {
    const options = candidates.filter((c) => !c.equals(background));
    const pool = options.length > 0 ? options : candidates;
    return pool
      .map((color) => ({ color, ratio: this.#strategy.measure(color, background) }))
      .reduce((best, cur) => (cur.ratio > best.ratio ? cur : best));
  }
}
