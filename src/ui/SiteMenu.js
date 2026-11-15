/**
 * SiteMenu — o menu "Seções" do celular (abre, fecha com Esc e devolve o foco).
 *
 * v1.1.0: antes esta lógica morava no ParallaxHeader, junto com os desenhos que se
 * mexiam atrás do menu. Os desenhos saíram e o parallax foi para as 3 bolas do início
 * (ParallaxScene). O menu ganhou uma classe só dele: alta coesão.
 */
export class SiteMenu {
  #header;
  #toggle;
  #nav;

  constructor({ header }) {
    this.#header = header;
  }

  mount() {
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
