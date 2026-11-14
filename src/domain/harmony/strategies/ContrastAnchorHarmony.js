/**
 * Âncora de contraste: harmonia pensada para acessibilidade.
 * - Uma cor bem escura e uma bem clara da mesma família (passam em AAA entre si).
 * - Um acento na matiz oposta, ajustado para ter pelo menos 3:1 contra as duas
 *   (o mínimo da WCAG para botões, ícones e bordas).
 */
import { HarmonyStrategy } from '../HarmonyStrategy.js';
import { Color } from '../../color/Color.js';
import { Wcag2Contrast } from '../../contrast/Wcag2Contrast.js';

export class ContrastAnchorHarmony extends HarmonyStrategy {
  #wcag;

  constructor(wcag = new Wcag2Contrast()) {
    super();
    this.#wcag = wcag;
  }

  get id() { return 'ancora-contraste'; }
  get name() { return 'Âncora de contraste'; }
  get group() { return 'contraste'; }
  get description() { return 'Uma cor escura, uma clara e um destaque que aparece bem sobre as duas. Feita para ser legível.'; }

  variants(base) {
    const dark = { dh: 0, s: Math.min(100, Math.max(base.s, 60)), b: 16 };
    const light = { dh: 0, s: 6, b: 97 };
    const darkColor = Color.fromHsb(base.h, dark.s, dark.b);
    const lightColor = Color.fromHsb(base.h, light.s, light.b);
    const accent = this.#findAccent(base, darkColor, lightColor);
    return {
      specs: [dark, light, { dh: 180, s: accent.s, b: accent.b }],
      note: 'O destaque foi ajustado para ter pelo menos 3:1 contra a cor escura e a clara.',
    };
  }

  /**
   * Procura o acento mais saturado possível com ≥ 3:1 contra as duas âncoras.
   * Se nenhum chegar a 3:1, devolve o que tiver o melhor "pior contraste".
   */
  #findAccent(base, dark, light) {
    let best = { s: base.s, b: 60, score: -1 };
    for (let s = Math.max(base.s, 75); s >= 10; s -= 5) {
      for (let b = 100; b >= 30; b -= 1) {
        const candidate = Color.fromHsb(base.h + 180, s, b);
        const score = Math.min(this.#wcag.measure(candidate, dark), this.#wcag.measure(candidate, light));
        if (score >= 3) return { s, b };
        if (score > best.score) best = { s, b, score };
      }
    }
    return best;
  }
}
