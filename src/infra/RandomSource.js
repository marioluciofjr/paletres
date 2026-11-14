/**
 * RandomSource — fonte de números aleatórios que pode ser "travada" com uma semente.
 *
 * Por que não usar Math.random direto? Nos testes precisamos que a "sorte" se repita
 * (mesma semente → mesma paleta). Com a fonte injetada, o app usa o acaso real e os
 * testes usam uma sequência previsível. O algoritmo é o mulberry32, simples e rápido.
 */
export class RandomSource {
  #nextFn;

  /** @param {() => number} nextFn função que devolve números em [0, 1) */
  constructor(nextFn) {
    this.#nextFn = nextFn;
  }

  /** Fonte do navegador (acaso real). */
  static system() {
    return new RandomSource(() => Math.random());
  }

  /** Fonte previsível a partir de uma semente inteira (mulberry32). */
  static seeded(seed) {
    let state = seed >>> 0;
    return new RandomSource(() => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    });
  }

  /** Número em [0, 1). */
  next() {
    return this.#nextFn();
  }

  /** Número real em [min, max). */
  range(min, max) {
    return min + this.next() * (max - min);
  }

  /** Inteiro em [min, max], incluindo os dois extremos. */
  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  /** Um item qualquer de uma lista. */
  pick(list) {
    return list[this.int(0, list.length - 1)];
  }
}
