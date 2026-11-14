/**
 * ContrastEvaluator — traduz uma razão WCAG em níveis (AAA, AA ou Reprovado).
 *
 * Critérios da WCAG 2.2:
 *  - Texto normal (1.4.3 e 1.4.6): AA ≥ 4,5:1 · AAA ≥ 7:1
 *  - Texto grande (≥ 24px, ou ≥ 18,66px em negrito): AA ≥ 3:1 · AAA ≥ 4,5:1
 *  - Componentes de interface e gráficos (1.4.11): AA ≥ 3:1 (não existe AAA)
 * A comparação é feita sem arredondar: 4,499:1 NÃO passa em AA.
 */
export const Level = Object.freeze({
  AAA: 'AAA',
  AA: 'AA',
  FAIL: 'Reprovado',
});

export const Thresholds = Object.freeze({
  normalText: { AA: 4.5, AAA: 7 },
  largeText: { AA: 3, AAA: 4.5 },
  ui: { AA: 3 },
});

export class ContrastEvaluator {
  /** Nível para um critério que tem AA e (opcionalmente) AAA. */
  static #grade(ratio, { AA, AAA }) {
    if (AAA !== undefined && ratio >= AAA) return Level.AAA;
    if (ratio >= AA) return Level.AA;
    return Level.FAIL;
  }

  /** @returns {{ normalText: string, largeText: string, ui: string }} */
  levels(ratio) {
    return {
      normalText: ContrastEvaluator.#grade(ratio, Thresholds.normalText),
      largeText: ContrastEvaluator.#grade(ratio, Thresholds.largeText),
      ui: ContrastEvaluator.#grade(ratio, Thresholds.ui),
    };
  }

  /** Diz se a razão atinge o nível pedido para texto normal ('AA' ou 'AAA'). */
  passesNormalText(ratio, target) {
    return ratio >= Thresholds.normalText[target];
  }
}
