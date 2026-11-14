/**
 * NumberFormat — formata números no padrão brasileiro (vírgula decimal).
 * Centraliza a formatação para que "17,1:1" apareça igual em toda a interface.
 */
export class NumberFormat {
  /** Ex.: decimal(17.0912, 1) → "17,1". */
  static decimal(value, digits = 1) {
    return value.toFixed(digits).replace('.', ',');
  }

  /**
   * Razão de contraste WCAG com 2 casas. Ex.: ratio(17.094) → "17,09:1".
   * Arredonda PARA BAIXO: 4,499 vira "4,49:1" e não "4,50:1", para não parecer que passou em AA.
   * (O 1e-9 corrige imprecisões do ponto flutuante, como 17.09 * 100 = 1708,9999…)
   */
  static ratio(value) {
    const floored = Math.floor(value * 100 + 1e-9) / 100;
    return `${NumberFormat.decimal(floored, 2)}:1`;
  }

  /** Porcentagem inteira. Ex.: percent(61.8) → "62%". */
  static percent(value) {
    return `${Math.round(value)}%`;
  }
}
