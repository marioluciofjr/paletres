/**
 * DominantColorPicker — decide quais grupos de cor da imagem viram as cores do mosaico.
 *
 * Recebe os grupos do ColorQuantizer e aplica 4 regras, nesta ordem:
 *  1. Juntar parecidas: grupos a menos de 0,06 de distância no OKLab viram um só
 *     (ex.: as várias "caixinhas" de um mesmo azul com ruído de JPEG).
 *  2. Descartar manchas: grupos com menos de 1% da imagem não contam como cor.
 *  3. Branco e preto (que quase sempre são o fundo) ficam de fora, com duas exceções,
 *     combinadas com o Mário:
 *       - carência: sem eles, sobrariam menos de 3 cores;
 *       - muito evidentes: ocupam 40% da imagem ou mais.
 *  4. Mais de 6 cores: ficam as 5 que ocupam mais área, e a 6ª vaga é de DESTAQUE — vai
 *     para a cor mais viva que sobrou, se ela for viva de verdade (ex.: a flor vermelha
 *     num campo verde). Se nenhuma for, a vaga fica com a 6ª maior área.
 */
import { Oklab } from '../color/Oklab.js';
import { Color } from '../color/Color.js';

export class DominantColorPicker {
  static MAX_COLORS = 6;
  static MERGE_DISTANCE = 0.06;
  static MIN_SHARE = 0.01;
  static EVIDENT_SHARE = 0.4;
  static MIN_COLORS_WITHOUT_NEUTRALS = 3;
  static NEUTRAL_CHROMA = 0.04;
  static WHITE_L = 0.93;
  static BLACK_L = 0.2;
  static VIVID_CHROMA = 0.12;

  /**
   * @param {Array<{ color: Color, lab: object, share: number }>} clusters
   * @returns {{ colors: Array<{color: Color, lab: object, share: number}>, ignored: Array<{color: Color, lab: object, share: number}>, found: number }}
   *   colors: até 6, da maior área para a menor; ignored: branco/preto deixados de fora;
   *   found: quantas cores sobraram antes do corte em 6 (para a tela explicar o corte)
   */
  pick(clusters) {
    const merged = DominantColorPicker.#merge(clusters.map((c) => ({ ...c })));
    const visible = merged.filter((c) => c.share >= DominantColorPicker.MIN_SHARE);
    const { kept, ignored } = DominantColorPicker.#splitNeutrals(visible);
    const byArea = (a, b) => b.share - a.share;
    return { colors: DominantColorPicker.#limit(kept.sort(byArea)), ignored: ignored.sort(byArea), found: kept.length };
  }

  /** É branco ou preto (pouca cor e claridade num dos extremos)? */
  static isNeutralExtreme(lab) {
    return Oklab.chroma(lab) < DominantColorPicker.NEUTRAL_CHROMA
      && (lab.L >= DominantColorPicker.WHITE_L || lab.L <= DominantColorPicker.BLACK_L);
  }

  /** Regra 1: junta, um par por vez, os dois grupos mais próximos enquanto forem parecidos. */
  static #merge(groups) {
    for (;;) {
      let pair = null;
      let closest = DominantColorPicker.MERGE_DISTANCE;
      for (let i = 0; i < groups.length; i += 1) {
        for (let j = i + 1; j < groups.length; j += 1) {
          const d = Oklab.distance(groups[i].lab, groups[j].lab);
          if (d < closest) { closest = d; pair = [i, j]; }
        }
      }
      if (!pair) return groups;
      const [i, j] = pair;
      groups[i] = DominantColorPicker.#blend(groups[i], groups[j]);
      groups.splice(j, 1);
    }
  }

  /** Média das duas cores, pesada pela área de cada uma. */
  static #blend(a, b) {
    const share = a.share + b.share;
    const mix = (x, y) => (x * a.share + y * b.share) / share;
    const color = Color.fromRgb(mix(a.color.rgb.r, b.color.rgb.r), mix(a.color.rgb.g, b.color.rgb.g), mix(a.color.rgb.b, b.color.rgb.b));
    return { color, lab: Oklab.fromColor(color), share };
  }

  /** Regra 3: separa branco e preto, a não ser que faltem cores ou que sejam muito evidentes. */
  static #splitNeutrals(groups) {
    const neutrals = groups.filter((g) => DominantColorPicker.isNeutralExtreme(g.lab));
    const others = groups.filter((g) => !DominantColorPicker.isNeutralExtreme(g.lab));
    if (others.length < DominantColorPicker.MIN_COLORS_WITHOUT_NEUTRALS) return { kept: groups, ignored: [] };
    const evident = neutrals.filter((g) => g.share >= DominantColorPicker.EVIDENT_SHARE);
    const ignored = neutrals.filter((g) => g.share < DominantColorPicker.EVIDENT_SHARE);
    return { kept: [...others, ...evident], ignored };
  }

  /** Regra 4: no máximo 6 cores, com a vaga de destaque. A lista chega ordenada por área. */
  static #limit(sorted) {
    const max = DominantColorPicker.MAX_COLORS;
    if (sorted.length <= max) return sorted;
    const chosen = sorted.slice(0, max - 1);
    const rest = sorted.slice(max - 1);
    const chroma = (g) => Oklab.chroma(g.lab);
    const vivid = rest.reduce((best, g) => (chroma(g) > chroma(best) ? g : best));
    const accent = chroma(vivid) >= DominantColorPicker.VIVID_CHROMA && chroma(vivid) > chroma(rest[0]) ? vivid : rest[0];
    return [...chosen, accent].sort((a, b) => b.share - a.share);
  }
}
