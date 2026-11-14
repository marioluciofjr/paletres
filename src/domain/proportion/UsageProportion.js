/**
 * UsageProportion — quanto de cada cor usar numa tela (dominante, secundária e destaque).
 *
 *  - 60-30-10: a regra clássica de decoração e design.
 *  - Áurea: 1/φ ≈ 61,8%, 1/φ³ ≈ 23,6% e 1/φ⁴ ≈ 14,6%. Curiosidade: essas três frações
 *    somam exatamente 100%, uma propriedade do número de ouro.
 *  - Fibonacci: 8 : 5 : 3 (termos seguidos da sequência), ou seja, 50%, 31,25% e 18,75%.
 */
const PHI = (1 + Math.sqrt(5)) / 2;

const PROPORTIONS = Object.freeze([
  {
    id: '60-30-10',
    name: '60-30-10',
    shares: [60, 30, 10],
    description: 'A regra clássica: 60% de cor principal, 30% de apoio e 10% de destaque.',
  },
  {
    id: 'aurea',
    name: 'Proporção áurea',
    shares: [100 / PHI, 100 / PHI ** 3, 100 / PHI ** 4],
    description: 'Divide a tela pelo número de ouro: cerca de 62%, 24% e 14%.',
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci 8:5:3',
    shares: [50, 31.25, 18.75],
    description: 'Usa três números seguidos da sequência de Fibonacci (8, 5 e 3): 50%, 31% e 19%.',
  },
]);

export class UsageProportion {
  static list() {
    return PROPORTIONS;
  }

  static get(id) {
    const p = PROPORTIONS.find((x) => x.id === id);
    if (!p) throw new Error(`Proporção "${id}" não existe.`);
    return p;
  }
}
