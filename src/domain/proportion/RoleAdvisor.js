/**
 * RoleAdvisor — sugere qual cor usar como fundo (dominante), em cards e barras (secundária)
 * e em botões (destaque) (RF-24). Também calcula a cor de texto legível de cada superfície,
 * usada nos mockups (RF-17).
 *
 * Como decide? Testa as 6 ordens possíveis dos 3 papéis e dá uma nota a cada uma:
 *  - o texto precisa ser legível sobre o fundo (peso 3), sobre os cards (peso 2) e sobre o botão (peso 1);
 *  - o botão precisa aparecer sobre o fundo (≥ 3:1, peso 2);
 *  - de desempate, o destaque deve ser a cor mais "colorida" (mais croma).
 */
import { Wcag2Contrast } from '../contrast/Wcag2Contrast.js';
import { ReadableTextPicker } from '../contrast/ReadableTextPicker.js';
import { Palette } from '../palette/Palette.js';

export const Role = Object.freeze({ DOMINANT: 'dominant', SECONDARY: 'secondary', ACCENT: 'accent' });

const PERMUTATIONS = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
];

export class RoleAdvisor {
  #wcag;
  #picker;

  constructor(wcag = new Wcag2Contrast()) {
    this.#wcag = wcag;
    this.#picker = new ReadableTextPicker(wcag);
  }

  /** Para cada papel: fundo, melhor cor de texto, razão e se passa em AA. */
  describeRoles(palette, roles) {
    const surface = (index) => {
      const background = palette.at(index);
      const { color: text, ratio } = this.#picker.pick(background, palette.colors);
      return { index, background, text, ratio, passesAA: ratio >= 4.5 };
    };
    return {
      dominant: surface(roles[Role.DOMINANT]),
      secondary: surface(roles[Role.SECONDARY]),
      accent: surface(roles[Role.ACCENT]),
    };
  }

  /** @returns {{ roles: Record<string, number>, message: string }} */
  suggest(palette) {
    let best = null;
    for (const [d, s, a] of PERMUTATIONS) {
      const roles = { [Role.DOMINANT]: d, [Role.SECONDARY]: s, [Role.ACCENT]: a };
      const score = this.#score(palette, roles);
      if (!best || score > best.score) best = { roles, score };
    }
    return { roles: best.roles, message: this.#message(palette, best.roles) };
  }

  #score(palette, roles) {
    const desc = this.describeRoles(palette, roles);
    const cap = (v, max) => Math.min(v, max);
    const accentVisible = this.#wcag.measure(desc.accent.background, desc.dominant.background);
    const { s, b } = desc.accent.background.hsb;
    const chroma = (s * b) / 100; // "croma" aproximado: saturação × brilho
    return (
      3 * cap(desc.dominant.ratio, 7) +
      2 * cap(desc.secondary.ratio, 7) +
      cap(desc.accent.ratio, 7) +
      2 * cap(accentVisible, 3) +
      0.01 * desc.secondary.ratio +
      0.5 * (chroma / 100)
    );
  }

  #message(palette, roles) {
    const name = (i) => `${Palette.LABELS[i]} (${palette.at(i).hex})`;
    return `Use a cor ${name(roles[Role.DOMINANT])} no fundo, a ${name(roles[Role.SECONDARY])} nos cards e barras e a ${name(roles[Role.ACCENT])} nos botões.`;
  }
}
