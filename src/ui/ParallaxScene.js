/**
 * ParallaxScene — o parallax do início (RF-14, revisto na v1.1.0).
 *
 * Antes havia desenhos se mexendo atrás do menu, e isso incomodava. Agora o efeito fica
 * só nas 3 bolas da paleta, no início da página: ao rolar, cada bola sobe numa
 * velocidade diferente, o que dá sensação de profundidade.
 *
 * Como funciona: guardamos a rolagem numa variável CSS (--parallax-y) do palco.
 * O CSS multiplica esse número por uma velocidade diferente em cada bola (translate).
 * Assim o efeito sobrevive quando as bolas são redesenhadas com outra paleta.
 *
 * Desempenho: no máximo uma atualização por quadro (requestAnimationFrame) e só enquanto
 * o início está na tela. Acessibilidade: com "reduzir movimento" ligado, tudo fica parado.
 */
export class ParallaxScene {
  #scene;
  #stage;
  #win;
  #reduced;
  #ticking = false;
  #limit = 0;
  #last = null;

  constructor({ scene, stage, win = window }) {
    this.#scene = scene;
    this.#stage = stage;
    this.#win = win;
    this.#reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
  }

  mount() {
    this.#measure();
    this.#win.addEventListener('scroll', () => this.#requestFrame(), { passive: true });
    this.#win.addEventListener('resize', () => { this.#measure(); this.#requestFrame(); }, { passive: true });
    this.#reduced.addEventListener?.('change', () => this.#update());
    this.#update();
  }

  #requestFrame() {
    if (this.#ticking) return;
    this.#ticking = true;
    this.#win.requestAnimationFrame(() => {
      this.#ticking = false;
      this.#update();
    });
  }

  /** Altura do início: lida só ao montar e ao redimensionar (ler layout a cada quadro custa caro). */
  #measure() {
    this.#limit = this.#scene.offsetHeight || 0;
  }

  #update() {
    // Depois que o início sai da tela, não há o que mover: o valor para no limite e não é regravado.
    const y = this.#reduced.matches ? 0 : Math.round(Math.min(this.#win.scrollY, this.#limit));
    if (y === this.#last) return;
    this.#last = y;
    this.#stage.style.setProperty('--parallax-y', String(y));
  }
}
