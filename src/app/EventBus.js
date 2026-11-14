/**
 * EventBus — um "quadro de avisos" (padrão Observer / publish-subscribe).
 *
 * Quem quer saber de algo se inscreve (on); quem muda algo publica (emit).
 * Assim os componentes da tela não precisam se conhecer: todos falam com o bus.
 */
export class EventBus {
  #handlers = new Map();
  #onError;

  constructor({ onError = (err) => console.error('[Paletrês] Erro num ouvinte:', err) } = {}) {
    this.#onError = onError;
  }

  /** Inscreve um ouvinte. Devolve uma função que cancela a inscrição. */
  on(event, handler) {
    if (!this.#handlers.has(event)) this.#handlers.set(event, new Set());
    this.#handlers.get(event).add(handler);
    return () => this.#handlers.get(event)?.delete(handler);
  }

  /** Avisa todos os inscritos. Um ouvinte com erro não impede os demais. */
  emit(event, payload) {
    for (const handler of [...(this.#handlers.get(event) ?? [])]) {
      try {
        handler(payload);
      } catch (err) {
        this.#onError(err);
      }
    }
  }
}
