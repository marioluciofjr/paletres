/**
 * ParallaxHeader — o menu fixo com camadas que se movem em velocidades diferentes (RF-14).
 *
 * Cada camada decorativa tem data-parallax (velocidade) e data-period (largura do desenho
 * que se repete). Na rolagem, a camada anda para a esquerda: rolagem × velocidade.
 * O "módulo pelo período" faz o desenho se repetir sem fim e sem pulo visível.
 *
 * Desempenho: só mexemos em transform, uma vez por quadro (requestAnimationFrame).
 * Acessibilidade: com "reduzir movimento" ligado no sistema, as camadas ficam paradas.
 * Também cuida do menu "Seções" no celular (abre, fecha com Esc e devolve o foco).
 */
export class ParallaxHeader {
  #header;
  #win;
  #layers = [];
  #ticking = false;
  #reduced;
  #toggle;
  #nav;

  constructor({ header, win = window }) {
    this.#header = header;
    this.#win = win;
    this.#reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
  }

  mount() {
    this.#layers = [...this.#header.querySelectorAll('[data-parallax]')].map((el) => ({
      el,
      speed: Number(el.dataset.parallax),
      period: Number(el.dataset.period) || 240,
    }));
    this.#win.addEventListener('scroll', () => this.#requestFrame(), { passive: true });
    this.#reduced.addEventListener?.('change', () => this.#update());
    this.#update();
    this.#mountMenu();
  }

  #requestFrame() {
    if (this.#ticking) return;
    this.#ticking = true;
    this.#win.requestAnimationFrame(() => {
      this.#ticking = false;
      this.#update();
    });
  }

  #update() {
    const y = this.#reduced.matches ? 0 : this.#win.scrollY;
    for (const { el, speed, period } of this.#layers) {
      const x = -((y * speed) % period);
      el.style.transform = `translate3d(${x}px, 0, 0)`;
    }
  }

  #mountMenu() {
    this.#toggle = this.#header.querySelector('[data-action="toggle-menu"]');
    this.#nav = this.#header.querySelector('#menu-secoes');
    if (!this.#toggle || !this.#nav) return;

    this.#toggle.addEventListener('click', () => this.#setOpen(this.#toggle.getAttribute('aria-expanded') !== 'true'));
    this.#nav.addEventListener('click', (e) => {
      if (e.target.closest('a[href^="#"]')) this.#setOpen(false, false);
    });
    this.#header.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.#toggle.getAttribute('aria-expanded') === 'true') this.#setOpen(false);
    });
    // No Safari, clicar num botão não dá foco a ele: o focusout chegaria sem destino e fecharia
    // o menu logo antes do clique reabri-lo. Por isso marcamos o toque no botão "Seções".
    let pressingToggle = false;
    this.#toggle.addEventListener('pointerdown', () => { pressingToggle = true; });
    this.#toggle.addEventListener('click', () => { pressingToggle = false; });
    // Se o foco sair do menu aberto (Tab para fora), o menu fecha sozinho.
    this.#nav.addEventListener('focusout', (e) => {
      if (pressingToggle) return;
      const next = e.relatedTarget;
      const stillInside = next && (this.#nav.contains(next) || next === this.#toggle);
      if (!stillInside && this.#toggle.getAttribute('aria-expanded') === 'true') this.#setOpen(false, false);
    });
  }

  #setOpen(open, restoreFocus = true) {
    this.#toggle.setAttribute('aria-expanded', String(open));
    this.#nav.classList.toggle('is-open', open);
    if (open) this.#nav.querySelector('a')?.focus();
    else if (restoreFocus) this.#toggle.focus();
  }
}
