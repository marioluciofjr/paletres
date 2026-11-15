/**
 * UsageProportion — quanto de cada cor usar numa tela (dominante, secundária e destaque).
 *
 * Desde a v1.1.0 fica só a regra 60-30-10: nos mockups, a proporção áurea (62/24/14) e a
 * de Fibonacci (50/31/19) quase não mudavam o visual, então confundiam mais do que ajudavam.
 * A proporção áurea e Fibonacci continuam vivas nas HARMONIAS (a roda cromática).
 */
const RULE_60_30_10 = Object.freeze({
  id: '60-30-10',
  name: '60-30-10',
  shares: Object.freeze([60, 30, 10]),
  description: 'A regra clássica: 60% de cor principal, 30% de apoio e 10% de destaque.',
});

const PROPORTIONS = Object.freeze([RULE_60_30_10]);

export class UsageProportion {
  /** A proporção usada nos mockups. */
  static RULE = RULE_60_30_10;

  static list() {
    return PROPORTIONS;
  }

  static get(id) {
    const p = PROPORTIONS.find((x) => x.id === id);
    if (!p) throw new Error(`Proporção "${id}" não existe.`);
    return p;
  }
}
