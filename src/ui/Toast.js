/**
 * Toast — aviso curto na parte de baixo da tela ("HEX copiado").
 *
 * São dois elementos com papéis separados:
 *  - a região anunciada (role="status", invisível): leitores de tela leem o texto
 *    sem tirar o foco do lugar;
 *  - a caixa visual (aria-hidden), que sobe, fica 2,4 s e some de verdade (visibility),
 *    para não ficar "aparecendo" na borda da tela.
 */
export class Toast {
  #live;
  #bubble;
  #timer = null;
  #duration;

  constructor({ root, duration = 2400 }) {
    this.#duration = duration;
    root.removeAttribute('role');
    root.removeAttribute('aria-live');
    root.className = '';
    this.#live = Object.assign(document.createElement('p'), { className: 'visually-hidden' });
    this.#live.setAttribute('role', 'status');
    this.#bubble = Object.assign(document.createElement('div'), { className: 'toast' });
    this.#bubble.setAttribute('aria-hidden', 'true');
    root.replaceChildren(this.#live, this.#bubble);
  }

  show(text) {
    // Esvazia e preenche no quadro seguinte: assim a mesma mensagem repetida é lida de novo.
    this.#live.textContent = '';
    requestAnimationFrame(() => { this.#live.textContent = text; });
    this.#bubble.textContent = text;
    this.#bubble.classList.add('is-visible');
    clearTimeout(this.#timer);
    // Mensagens longas ficam mais tempo: cerca de 45 ms por caractere, com o mínimo padrão.
    const duration = Math.max(this.#duration, text.length * 45);
    this.#timer = setTimeout(() => {
      this.#bubble.classList.remove('is-visible');
      this.#live.textContent = '';
    }, duration);
  }
}
