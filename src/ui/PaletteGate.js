/**
 * PaletteGate — o "portão" do início (RF-25, v1.1.0).
 *
 * O site abre sem paleta. Enquanto a pessoa não clica em "Gerar paleta", a ferramenta
 * (passos 1 a 4 e extras) fica escondida e aparece um aviso no lugar dela.
 * Exceção: um link compartilhado já traz a paleta, então abre tudo direto.
 *
 * Como a página marca as partes:
 *  - [data-gate="locked"]  aparece só ANTES de começar (o aviso e o botão do início);
 *  - [data-gate="started"] aparece só DEPOIS (a ferramenta e o "Ver minha paleta");
 *  - [data-action="start"] são os botões "Gerar paleta".
 * Links do menu para seções escondidas levam ao aviso, com uma explicação.
 */
import { StoreEvent } from '../app/PaletteStore.js';

export class PaletteGate {
  #doc;
  #win;
  #store;
  #bus;
  #toast;

  constructor({ doc, win = window, store, bus, toast }) {
    this.#doc = doc;
    this.#win = win;
    this.#store = store;
    this.#bus = bus;
    this.#toast = toast;
  }

  mount() {
    for (const button of this.#doc.querySelectorAll('[data-action="start"]')) {
      button.addEventListener('click', () => this.#store.start());
    }
    // Captura: decide antes do navegador pular para a âncora.
    this.#doc.addEventListener('click', (e) => this.#guardLink(e), true);
    this.#bus.on(StoreEvent.STARTED, () => this.#onStarted());
    this.#render();
  }

  #render() {
    const { started } = this.#store.state;
    for (const el of this.#doc.querySelectorAll('[data-gate]')) {
      el.hidden = el.dataset.gate === 'locked' ? started : !started;
    }
    const skip = this.#doc.querySelector('[data-component="skip-link"]');
    if (skip) skip.setAttribute('href', started ? '#paleta' : '#comecar');
  }

  #onStarted() {
    this.#render();
    this.#toast.show(this.#store.state.message.text);
    // Leva a pessoa ao Passo 1 e põe o foco no título (o leitor de tela anuncia onde ela está).
    const title = this.#doc.getElementById('paleta-title');
    const smooth = !this.#win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.#doc.getElementById('paleta')?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    title?.focus({ preventScroll: true });
  }

  /** Antes de começar, um link para uma seção escondida leva ao aviso do portão. */
  #guardLink(e) {
    if (this.#store.state.started) return;
    const link = e.target.closest?.('a[href^="#"]');
    if (!link) return;
    const target = this.#doc.getElementById(link.getAttribute('href').slice(1));
    if (!target?.closest('[data-gate="started"]')) return;
    e.preventDefault();
    const gate = this.#doc.getElementById('comecar');
    gate?.scrollIntoView({ block: 'start' });
    gate?.focus({ preventScroll: true });
    this.#toast.show('Primeiro clique em "Gerar paleta". As ferramentas aparecem logo em seguida.');
  }
}
