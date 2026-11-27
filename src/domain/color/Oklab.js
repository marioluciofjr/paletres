/**
 * Oklab — converte cores para o espaço OKLab, que mede diferenças do jeito que o olho percebe.
 *
 * Por que não comparar direto em RGB? Em RGB, dois verdes com a mesma "distância numérica"
 * de dois azuis podem parecer muito mais (ou muito menos) diferentes. No OKLab, a mesma
 * distância quer dizer mais ou menos a mesma diferença visível, em qualquer cor.
 *
 *  - L: claridade (0 = preto, 1 = branco);
 *  - a: eixo verde (negativo) ↔ vermelho (positivo);
 *  - b: eixo azul (negativo) ↔ amarelo (positivo).
 * Uma diferença de cerca de 0,02 é o mínimo que o olho nota.
 *
 * Fórmulas de Björn Ottosson (2020), criador do OKLab, hoje parte do CSS Color 4 do W3C.
 */
import { Wcag2Contrast } from '../contrast/Wcag2Contrast.js';

export class Oklab {
  /**
   * Converte RGB (0–255) para OKLab.
   * @returns {{ L: number, a: number, b: number }}
   */
  static fromRgb(r, g, b) {
    // 1. Desfaz a curva gama do monitor (o mesmo passo do cálculo de contraste da WCAG).
    const lr = Wcag2Contrast.linearize(r);
    const lg = Wcag2Contrast.linearize(g);
    const lb = Wcag2Contrast.linearize(b);
    // 2. Simula os 3 tipos de cone do olho (longo, médio e curto).
    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    // 3. Combina as respostas em claridade e nos dois eixos de cor.
    return {
      L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    };
  }

  /** Atalho para uma instância de Color. */
  static fromColor(color) {
    const { r, g, b } = color.rgb;
    return Oklab.fromRgb(r, g, b);
  }

  /** Distância visual entre duas cores OKLab (distância euclidiana). */
  static distance(p, q) {
    return Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b);
  }

  /** Croma = o quanto a cor é "viva". Cinzas, branco e preto ficam perto de 0. */
  static chroma(p) {
    return Math.hypot(p.a, p.b);
  }
}
