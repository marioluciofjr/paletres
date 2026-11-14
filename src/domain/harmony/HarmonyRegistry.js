/**
 * HarmonyRegistry — catálogo das harmonias disponíveis (padrão Registry).
 *
 * A interface pergunta ao registro "quais harmonias existem?" e não precisa conhecer
 * cada classe. Para criar uma harmonia nova, basta registrá-la (ver specs/AGENTS.md).
 */
export class HarmonyRegistry {
  #items = new Map();

  register(strategy) {
    if (this.#items.has(strategy.id)) throw new Error(`Harmonia "${strategy.id}" já registrada.`);
    this.#items.set(strategy.id, strategy);
    return this;
  }

  has(id) {
    return this.#items.has(id);
  }

  get(id) {
    const item = this.#items.get(id);
    if (!item) throw new Error(`Harmonia "${id}" não existe.`);
    return item;
  }

  /** Lista na ordem de registro. */
  list() {
    return [...this.#items.values()];
  }

  /** Lista só as harmonias de um grupo. */
  byGroup(group) {
    return this.list().filter((h) => h.group === group);
  }
}
