/**
 * NumberFormat — formata números no padrão brasileiro (vírgula decimal).
 * Centraliza a formatação para que "17,1:1" apareça igual em toda a interface.
 */
export class NumberFormat {
  /** Ex.: decimal(17.0912, 1) → "17,1". */
  static decimal(value, digits = 1) {
    return value.toFixed(digits).replace('.', ',');
  }

  /** Razão de contraste WCAG. Ex.: ratio(17.09) → "17,1:1". Arredonda para baixo para não "aprovar" por arredondamento. */
  static ratio(value) {
    const floored = Math.floor(value * 10) / 10;
    return `${NumberFormat.decimal(floored, 1)}:1`;
  }

  /** Porcentagem inteira. Ex.: percent(61.8) → "62%". */
  static percent(value) {
    return `${Math.round(value)}%`;
  }
}
