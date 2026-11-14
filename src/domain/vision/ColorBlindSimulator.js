/**
 * ColorBlindSimulator — mostra como uma cor aparece para pessoas com daltonismo.
 *
 * Usa as matrizes de Machado, Oliveira e Fernandes (2009) com severidade máxima (1,0).
 * A conta é feita no RGB "linear" (sem a curva gama do monitor), que é como a luz
 * realmente se mistura no olho. Depois voltamos para o sRGB.
 */
import { Color } from '../color/Color.js';
import { Wcag2Contrast } from '../contrast/Wcag2Contrast.js';

export const VisionType = Object.freeze({
  PROTANOPIA: 'protanopia',
  DEUTERANOPIA: 'deuteranopia',
  TRITANOPIA: 'tritanopia',
  ACHROMATOPSIA: 'acromatopsia',
});

const MATRICES = Object.freeze({
  [VisionType.PROTANOPIA]: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  [VisionType.DEUTERANOPIA]: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  [VisionType.TRITANOPIA]: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
});

const TYPES = Object.freeze([
  { id: VisionType.PROTANOPIA, name: 'Protanopia', description: 'Não percebe o vermelho. Atinge cerca de 1 em cada 100 homens.' },
  { id: VisionType.DEUTERANOPIA, name: 'Deuteranopia', description: 'Não percebe o verde. É o tipo mais comum, junto com suas formas leves.' },
  { id: VisionType.TRITANOPIA, name: 'Tritanopia', description: 'Confunde azul com verde e amarelo com rosa. É rara.' },
  { id: VisionType.ACHROMATOPSIA, name: 'Acromatopsia', description: 'Enxerga só em tons de cinza. É muito rara, mas mostra se a paleta funciona sem cor.' },
]);

export class ColorBlindSimulator {
  types() {
    return TYPES;
  }

  /** Volta do linear para o sRGB (0–255). */
  static #toSrgb(v) {
    const c = Math.min(1, Math.max(0, v));
    const s = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(s * 255);
  }

  simulate(color, type) {
    const { r, g, b } = color.rgb;
    const lin = [r, g, b].map((c) => Wcag2Contrast.linearize(c));

    if (type === VisionType.ACHROMATOPSIA) {
      const y = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
      const v = ColorBlindSimulator.#toSrgb(y);
      return Color.fromRgb(v, v, v);
    }
    const m = MATRICES[type];
    if (!m) throw new Error(`Tipo de visão desconhecido: "${type}".`);
    const out = m.map((row) => row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]);
    return Color.fromRgb(...out.map((v) => ColorBlindSimulator.#toSrgb(v)));
  }
}
