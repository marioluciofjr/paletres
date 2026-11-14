/**
 * GestureRecorder — transforma um gesto contínuo (arrastar slider, digitar um HEX,
 * mover o ponto da roda) num ÚNICO passo de "Desfazer".
 *
 * Como funciona:
 *  - no primeiro passo do gesto, guarda a paleta do início;
 *  - cada passo muda a paleta sem gravar histórico (record: false);
 *  - ao terminar, grava a paleta do início, mas só se algo mudou.
 */
export class GestureRecorder {
  #store;
  #start = null;

  constructor(store) {
    this.#store = store;
  }

  /** @param {(options: {record: boolean}) => void} change função que altera a paleta */
  step(change) {
    if (this.#start === null) this.#start = this.#store.state.palette;
    change({ record: false });
  }

  end() {
    if (this.#start === null) return;
    this.#store.recordFrom(this.#start);
    this.#start = null;
  }

  get active() {
    return this.#start !== null;
  }
}
