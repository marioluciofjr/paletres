/**
 * ContrastStrategy — contrato (interface) de qualquer método de contraste.
 *
 * Padrão Strategy: WCAG 2.2 e APCA são "estratégias" diferentes para a mesma
 * pergunta ("quanto este texto se destaca deste fundo?"). Quem usa só conhece
 * este contrato, então dá para trocar ou somar métodos sem mexer no resto.
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
