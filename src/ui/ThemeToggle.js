/**
 * ThemeToggle — alterna o tema claro (página cinza) e o escuro (página roxa) (RF-13).
 * A escolha fica guardada no navegador pelo PreferenceStorage.
 */
import { Icons } from './Icons.js';

export class ThemeToggle {
  #button;
  #storage;
  #root;

  constructor({ button, storage, root = document.documentElement }) {
    this.#button = button;
    this.#storage = storage;
    this.#root = root;
  }

  mount() {
    this.#render();
    this.#button.addEventListener('click', () => {
      const next = this.#isDark() ? 'light' : 'dark';
      this.#root.setAttribute('data-theme', next);
      this.#storage.set('tema', next);
      this.#render();
    });
  }

  #isDark() {
    return this.#root.getAttribute('data-theme') === 'dark';
  }

  #render() {
    const dark = this.#isDark();
    this.#button.setAttribute('aria-pressed', String(dark));
    this.#button.replaceChildren(
      Icons.svg(dark ? 'sun' : 'moon'),
      Object.assign(document.createElement('span'), { className: 'visually-hidden', textContent: 'Tema escuro' }),
    );
  }
}
