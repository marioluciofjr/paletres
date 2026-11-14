/**
 * InfoTips — os botões "O que é isso?" (RF-23, RNF-09).
 *
 * Cada botão [data-info="x"] abre e fecha o painel #info-x logo abaixo, sem sair da página.
 * É um "disclosure": o botão anuncia aria-expanded e aponta o painel com aria-controls.
 * Funciona também com botões criados depois (mount pode ser chamado de novo num trecho).
 */
export class InfoTips {
  #root;

  constructor({ root }) {
    this.#root = root;
  }

  mount(scope = this.#root) {
    for (const button of scope.querySelectorAll('[data-info]')) {
      if (button.dataset.infoReady) continue;
      const panel = this.#root.querySelector(`#info-${button.dataset.info}`);
      if (!panel) continue;
      button.dataset.infoReady = 'true';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', panel.id);
      button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(open));
        panel.hidden = !open;
      });
    }
  }
}
