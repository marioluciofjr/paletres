/**
 * ContrastGuard — "Garantir AA / AAA" e "Consertar contraste" (RF-06 e RF-20).
 *
 * Com 3 cores, é impossível que os 3 pares passem em AA ao mesmo tempo (só preto, branco
 * e um cinza exato chegariam perto). Por isso a garantia é prática:
 *  1. A cor A (índice 0) é a referência.
 *  2. A parceira de TEXTO é a cor (B ou C) com mais contraste contra A. Ela é ajustada
 *     até o par A + parceira atingir o nível pedido (4,5:1 no AA, 7:1 no AAA).
 *  3. A outra cor vira o DESTAQUE e é ajustada para ter pelo menos 3:1 contra A
 *     (o mínimo da WCAG para botões, ícones e bordas).
 *
 * O ajuste mexe primeiro só no brilho, mantendo a matiz. Se o brilho não basta para
 * clarear, reduz a saturação (a cor "esbranquiça"). Se nem assim der, ajusta a cor A.
 * Sempre procuramos a cor MAIS PRÓXIMA da original que atinge a meta.
 */
import { Palette } from '../palette/Palette.js';
import { Color } from '../color/Color.js';
import { Wcag2Contrast } from '../contrast/Wcag2Contrast.js';
import { Thresholds } from '../contrast/ContrastEvaluator.js';

export const GuardLevel = Object.freeze({ NONE: 'livre', AA: 'AA', AAA: 'AAA' });

const BLACK = Color.fromHex('#000000');
const WHITE = Color.fromHex('#FFFFFF');
const STEP = 0.5;

export class ContrastGuard {
  #wcag;

  constructor(wcag = new Wcag2Contrast()) {
    this.#wcag = wcag;
  }

  /**
   * @param {Palette} palette
   * @param {string} level GuardLevel
   * @returns {{ palette: Palette, changed: number[], ok: boolean, message: string, meta: {textIndex?:number, accentIndex?:number} }}
   */
  enforce(palette, level) {
    if (level === GuardLevel.NONE) {
      return { palette, changed: [], ok: true, message: 'Modo livre: a paleta não foi ajustada.', meta: {} };
    }
    const target = Thresholds.normalText[level];
    let base = palette.at(0);
    const [textIndex, accentIndex] = this.#rolesFor(palette);
    const directions = {};

    // Passo 1: parceira de texto contra a cor A.
    let partner = this.#reach(palette.at(textIndex), base, target);
    if (!partner) {
      // Passo 1b: nem o extremo resolve com A parada → ajusta a cor A na direção oposta.
      const dir = this.#directionFor(base);
      const extreme = dir === 'darker' ? BLACK : WHITE;
      const newBase = this.#reach(base, extreme, target);
      if (!newBase) return this.#failure(palette, level, textIndex, accentIndex);
      base = newBase;
      directions[0] = this.#describeMove(palette.at(0), base);
      partner = this.#reach(palette.at(textIndex), base, target);
      if (!partner) return this.#failure(palette, level, textIndex, accentIndex);
    }

    // Passo 2: destaque com ≥ 3:1 contra a cor A.
    const accent = this.#reach(palette.at(accentIndex), base, Thresholds.ui.AA) ?? palette.at(accentIndex);

    const next = new Palette(
      [0, 1, 2].map((i) => (i === 0 ? base : i === textIndex ? partner : accent)),
    );
    const changed = [0, 1, 2].filter((i) => !next.at(i).equals(palette.at(i)));
    for (const i of changed) directions[i] ??= this.#describeMove(palette.at(i), next.at(i));

    return {
      palette: next,
      changed,
      ok: true,
      message: this.#message(level, changed, directions, textIndex),
      meta: { textIndex, accentIndex },
    };
  }

  /** Parceira de texto = a de maior contraste com A; a outra é o destaque. */
  #rolesFor(palette) {
    const a = palette.at(0);
    const r1 = this.#wcag.measure(palette.at(1), a);
    const r2 = this.#wcag.measure(palette.at(2), a);
    return r1 >= r2 ? [1, 2] : [2, 1];
  }

  /** Para uma âncora, é melhor ter uma parceira mais escura ou mais clara? */
  #directionFor(anchor) {
    return this.#wcag.measure(anchor, BLACK) >= this.#wcag.measure(anchor, WHITE) ? 'darker' : 'lighter';
  }

  /**
   * Devolve a cor mais próxima de `color` (mesma matiz) com contraste ≥ target contra `anchor`.
   * Se a própria cor já passa, devolve ela. Se for impossível, devolve null.
   */
  #reach(color, anchor, target) {
    if (this.#wcag.measure(color, anchor) >= target) return color;
    const anchorLum = Wcag2Contrast.luminance(anchor);
    const dir = this.#directionFor(anchor);
    const ok = (c) => {
      const lum = Wcag2Contrast.luminance(c);
      const rightSide = dir === 'darker' ? lum <= anchorLum : lum >= anchorLum;
      return rightSide && this.#wcag.measure(c, anchor) >= target;
    };
    const { s, b } = color.hsb;
    if (dir === 'darker') {
      for (let v = b; v >= 0; v -= STEP) {
        const c = color.withHsb({ b: v });
        if (ok(c)) return c;
      }
      return null;
    }
    for (let v = b; v <= 100; v += STEP) {
      const c = color.withHsb({ b: v });
      if (ok(c)) return c;
    }
    for (let v = s; v >= 0; v -= 1) {
      const c = color.withHsb({ b: 100, s: v });
      if (ok(c)) return c;
    }
    return null;
  }

  #describeMove(from, to) {
    return Wcag2Contrast.luminance(to) > Wcag2Contrast.luminance(from) ? 'mais clara' : 'mais escura';
  }

  #message(level, changed, directions, textIndex) {
    if (changed.length === 0) return `Sua paleta já atinge ${level}. Nada foi alterado.`;
    const parts = changed.map((i) => `a cor ${Palette.LABELS[i]} ficou ${directions[i]}`);
    const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} e ${parts.at(-1)}` : parts[0];
    return `Pronto: ${list}. Agora o texto da cor ${Palette.LABELS[textIndex]} sobre a cor A atinge ${level}.`;
  }

  #failure(palette, level, textIndex, accentIndex) {
    return {
      palette,
      changed: [],
      ok: false,
      message: `Não deu para chegar em ${level} só mudando o brilho. Tente uma cor A mais clara ou mais escura.`,
      meta: { textIndex, accentIndex },
    };
  }
}
