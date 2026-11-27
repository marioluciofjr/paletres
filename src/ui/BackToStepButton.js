/**
 * BackToStepButton — botão fixo "Voltar ao Passo 1" (RF-36).
 *
 * Problema que resolve: depois de testar a paleta nos passos seguintes (comparações, mockups,
 * imagem, color grading…), a pessoa precisava rolar muito para voltar às 3 cores.
 * O botão aparece no canto da tela só quando o Passo 1 ("Escolha suas 3 cores") já saiu
 * inteiro da tela, por cima. Um clique rola até lá e leva o foco ao título, para quem usa
 * teclado ou leitor de tela continuar dali.
 *
 * É um link de verdade (<a href="#paleta">): sem JavaScript, ele ainda funciona como âncora.
 * Com JavaScript, evitamos mudar o endereço (o link compartilhável `?p=` fica limpo).
 */
export class BackToStepButton {
  #button;
  #target;
  #focusTarget;
  #win;
  #frame = 0;

  /**
   * @param {{ button: HTMLElement, target: HTMLElement, focusTarget: HTMLElement, win?: Window }} deps
   *   target: a seção do Passo 1; focusTarget: o título dela (com tabindex="-1")
   */
  constructor({ button, target, focusTarget, win = window }) {
    this.#button = button;
    this.#target = target;
    this.#focusTarget = focusTarget;
    this.#win = win;
  }

  mount() {
    const schedule = () => this.#schedule();
    this.#win.addEventListener('scroll', schedule, { passive: true });
    this.#win.addEventListener('resize', schedule);
    this.#button.addEventListener('click', (e) => this.#go(e));
    // Se ficou "devendo" sumir enquanto tinha o foco, some assim que o foco sair.
    this.#button.addEventListener('blur', () => this.refresh());
    this.refresh();
  }

  /** Mostra o botão só quando o Passo 1 inteiro já ficou acima da tela. Público para os testes. */
  refresh() {
    const { bottom, height } = this.#target.getBoundingClientRect();
    // height 0: a ferramenta ainda está escondida (antes de "Gerar paleta").
    const hide = !(height > 0 && bottom < 0);
    // Com o foco no botão, ele não some: o foco cairia no <body> (auditoria a11y-web M1).
    if (hide && this.#button.ownerDocument.activeElement === this.#button) return;
    this.#button.hidden = hide;
  }

  /** No máximo uma conferência por quadro de tela, mesmo rolando rápido. */
  #schedule() {
    const raf = this.#win.requestAnimationFrame?.bind(this.#win);
    if (!raf) {
      this.refresh();
      return;
    }
    this.#win.cancelAnimationFrame?.(this.#frame);
    this.#frame = raf(() => this.refresh());
  }

  #go(event) {
    event.preventDefault();
    const reduce = this.#win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    this.#target.scrollIntoView?.({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    // preventScroll: quem rola é o scrollIntoView (suave); o foco só "vai junto".
    this.#focusTarget.focus({ preventScroll: true });
  }
}
