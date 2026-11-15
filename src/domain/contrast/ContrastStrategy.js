/**
 * ContrastStrategy — contrato (interface) de qualquer método de contraste.
 *
 * Padrão Strategy: hoje o Paletrês usa só o WCAG 2.2, mas quem mede o contraste
 * conhece apenas este contrato. Se um dia entrar outro método (ex.: o do futuro
 * WCAG 3), basta criar outra estratégia, sem mexer no resto.
 */
export class ContrastStrategy {
  /** Nome curto exibido na interface (ex.: "WCAG 2.2"). */
  get name() {
    throw new Error('Subclasses devem definir "name".');
  }

  /**
   * Mede o contraste do texto sobre o fundo.
   * @param {import('../color/Color.js').Color} _text
   * @param {import('../color/Color.js').Color} _background
   * @returns {number}
   */
  measure(_text, _background) {
    throw new Error('Subclasses devem implementar "measure".');
  }
}
