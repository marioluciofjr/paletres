/**
 * PreferenceStorage — lembra preferências pequenas (ex.: tema claro/escuro) no navegador.
 *
 * O localStorage pode estar bloqueado (aba anônima, cookies desligados). Por isso toda
 * leitura e gravação fica num try/catch: se falhar, o site funciona sem lembrar.
 */
export class PreferenceStorage {
  #storage;
  #prefix;

  constructor(storage, prefix = 'paletres:') {
    this.#storage = storage;
    this.#prefix = prefix;
  }

  get(key, fallback = null) {
    try {
      const v = this.#storage?.getItem(this.#prefix + key);
      return v ?? fallback;
    } catch {
      return fallback;
    }
  }

  set(key, value) {
    try {
      this.#storage?.setItem(this.#prefix + key, value);
    } catch {
      // Sem armazenamento: a preferência vale só nesta visita.
    }
  }
}
