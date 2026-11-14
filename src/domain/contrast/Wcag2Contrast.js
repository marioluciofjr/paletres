/**
 * Wcag2Contrast — razão de contraste da WCAG 2.2 (de 1:1 a 21:1).
 *
 * Passo a passo:
 * 1. Cada canal sRGB (0–255) vira "linear" (desfaz a curva gama do monitor).
 * 2. A luminância relativa pesa os canais como o olho humano: o verde pesa mais.
 * 3. Razão = (luminância da mais clara + 0,05) / (luminância da mais escura + 0,05).
 * A razão é simétrica: não importa quem é texto e quem é fundo.
 */
import { ContrastStrategy } from './ContrastStrategy.js';

export class Wcag2Contrast extends ContrastStrategy {
  get name() {
    return 'WCAG 2.2';
  }

  /** Converte um canal 0–255 para o valor linear (0–1). */
  static linearize(channel) {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }

  /** Luminância relativa de uma cor: 0 (preto) a 1 (branco). */
  static luminance(color) {
    const { r, g, b } = color.rgb;
    return 0.2126 * Wcag2Contrast.linearize(r) + 0.7152 * Wcag2Contrast.linearize(g) + 0.0722 * Wcag2Contrast.linearize(b);
  }

  measure(text, background) {
    const l1 = Wcag2Contrast.luminance(text);
    const l2 = Wcag2Contrast.luminance(background);
    const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (light + 0.05) / (dark + 0.05);
  }
}
