/**
 * HarmonyStrategy — classe base de toda harmonia de cores (padrões Strategy e Template Method).
 *
 * "Template Method": o método generate() define o roteiro fixo (pedir as variações,
 * converter em cores, montar o resultado). Cada harmonia só preenche a parte que muda,
 * o método variants(), dizendo os desvios de matiz, a saturação e o brilho de cada cor.
 */
import { Color } from '../color/Color.js';

export class HarmonyStrategy {
  /** Identificador estável, usado na URL e nos testes (ex.: "triade"). */
  get id() {
    throw new Error('Subclasses devem definir "id".');
  }

  /** Nome exibido na interface. */
  get name() {
    throw new Error('Subclasses devem definir "name".');
  }

  /** Explicação simples do efeito, para quem não é designer. */
  get description() {
    throw new Error('Subclasses devem definir "description".');
  }

  /** Grupo do seletor: "classica", "matematica" ou "contraste". */
  get group() {
    return 'classica';
  }

  /**
   * Parte que cada harmonia implementa.
   * @param {{h:number,s:number,b:number}} _base cor base em HSB
   * @param {import('../../infra/RandomSource.js').RandomSource} _rng
   * @returns {{ specs: Array<{dh?:number, s?:number, b?:number}>, note?: string, meta?: object }}
   */
  variants(_base, _rng) {
    throw new Error('Subclasses devem implementar "variants".');
  }

  /**
   * Roteiro fixo: transforma as variações em 3 cores.
   * @returns {{ colors: Color[], note: string, meta: object }}
   */
  generate(base, rng) {
    const { specs, note = '', meta = {} } = this.variants(base, rng);
    const colors = specs.map((spec) => Color.fromHsb(base.h + (spec.dh ?? 0), spec.s ?? base.s, spec.b ?? base.b));
    return { colors, note, meta };
  }

  /** Sorteia uma cor base "viva", boa para começar uma harmonia. */
  static randomBase(rng) {
    return {
      h: Math.floor(rng.range(0, 360)),
      s: Math.round(rng.range(45, 90)),
      b: Math.round(rng.range(60, 95)),
    };
  }
}
