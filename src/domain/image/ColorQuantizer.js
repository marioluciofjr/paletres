/**
 * ColorQuantizer — agrupa os pixels de uma imagem em poucos grupos de cores parecidas.
 *
 * Analogia: é como separar milhares de miçangas em potes pela cor.
 *  1. Histograma: primeiro juntamos pixels quase idênticos numa "caixinha" (32 níveis por
 *     canal). Uma foto de 25 mil pixels costuma virar poucas centenas de caixinhas, o que
 *     deixa o resto do cálculo rápido.
 *  2. k-means: escolhemos K "potes" iniciais e repetimos: cada caixinha vai para o pote
 *     de cor mais próxima (medida no OKLab, como o olho percebe), e cada pote passa a ter
 *     a cor média do que recebeu. Paramos quando ninguém troca de pote.
 *
 * O resultado é determinístico (sem sorteio): a mesma imagem sempre dá os mesmos grupos,
 * o que permite testar e repetir a análise.
 */
import { Color } from '../color/Color.js';
import { Oklab } from '../color/Oklab.js';

const BITS = 5; // 32 níveis por canal
const SHIFT = 8 - BITS;
const MIN_ALPHA = 128; // pixels mais transparentes que isso são ignorados
const MAX_ITERATIONS = 20;

export class ColorQuantizer {
  #k;

  /** @param {{ k?: number }} options k = número máximo de grupos (padrão 12) */
  constructor({ k = 12 } = {}) {
    this.#k = k;
  }

  /**
   * @param {{ data: Uint8ClampedArray, width: number, height: number }} pixels formato RGBA do canvas
   * @returns {Array<{ color: Color, lab: {L:number,a:number,b:number}, share: number }>}
   *   share = fração dos pixels visíveis que caiu no grupo (de 0 a 1)
   */
  quantize(pixels) {
    const { bins, total } = ColorQuantizer.#histogram(pixels.data);
    if (total === 0) return [];
    const centers = this.#seed(bins);
    const assignment = new Array(bins.length).fill(-1);
    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
      const moved = ColorQuantizer.#assign(bins, centers, assignment);
      ColorQuantizer.#update(bins, centers, assignment);
      if (!moved) break;
    }
    return ColorQuantizer.#clusters(bins, centers.length, assignment, total);
  }

  /** Passo 1: conta os pixels visíveis em caixinhas e guarda a soma do RGB de cada uma. */
  static #histogram(data) {
    const map = new Map();
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < MIN_ALPHA) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const key = ((r >> SHIFT) << (2 * BITS)) | ((g >> SHIFT) << BITS) | (b >> SHIFT);
      let bin = map.get(key);
      if (!bin) {
        bin = { count: 0, r: 0, g: 0, b: 0 };
        map.set(key, bin);
      }
      bin.count += 1;
      bin.r += r;
      bin.g += g;
      bin.b += b;
      total += 1;
    }
    // Ordem fixa (pela chave) para o resultado não depender da ordem dos pixels.
    const bins = [...map.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, bin]) => {
        const r = bin.r / bin.count;
        const g = bin.g / bin.count;
        const b = bin.b / bin.count;
        return { count: bin.count, r, g, b, lab: Oklab.fromRgb(r, g, b) };
      });
    return { bins, total };
  }

  /**
   * Escolhe os potes iniciais sem sorteio: o 1º é a caixinha mais cheia; cada próximo é a
   * caixinha com maior "peso × distância²" até os potes já escolhidos (cheia E diferente).
   */
  #seed(bins) {
    const k = Math.min(this.#k, bins.length);
    const first = bins.reduce((best, bin) => (bin.count > best.count ? bin : best));
    const centers = [{ ...first.lab }];
    const nearest = bins.map((bin) => Oklab.distance(bin.lab, first.lab) ** 2);
    while (centers.length < k) {
      let pick = -1;
      let best = 0;
      bins.forEach((bin, i) => {
        const score = bin.count * nearest[i];
        if (score > best) { best = score; pick = i; }
      });
      if (pick < 0) break; // todas as caixinhas já coincidem com um pote
      centers.push({ ...bins[pick].lab });
      bins.forEach((bin, i) => { nearest[i] = Math.min(nearest[i], Oklab.distance(bin.lab, bins[pick].lab) ** 2); });
    }
    return centers;
  }

  /** Cada caixinha vai para o pote mais próximo. Devolve true se alguma trocou de pote. */
  static #assign(bins, centers, assignment) {
    let moved = false;
    bins.forEach((bin, i) => {
      let best = 0;
      let bestDistance = Infinity;
      centers.forEach((center, c) => {
        const d = Oklab.distance(bin.lab, center);
        if (d < bestDistance) { bestDistance = d; best = c; }
      });
      if (assignment[i] !== best) { assignment[i] = best; moved = true; }
    });
    return moved;
  }

  /** Cada pote passa a ter a cor média (ponderada pela quantidade de pixels) do que recebeu. */
  static #update(bins, centers, assignment) {
    const sums = centers.map(() => ({ L: 0, a: 0, b: 0, w: 0 }));
    bins.forEach((bin, i) => {
      const s = sums[assignment[i]];
      s.L += bin.lab.L * bin.count;
      s.a += bin.lab.a * bin.count;
      s.b += bin.lab.b * bin.count;
      s.w += bin.count;
    });
    sums.forEach((s, c) => {
      if (s.w > 0) centers[c] = { L: s.L / s.w, a: s.a / s.w, b: s.b / s.w };
    });
  }

  /** Monta o resultado: a cor de cada grupo é a média RGB dos seus pixels (a cor que se vê). */
  static #clusters(bins, size, assignment, total) {
    const groups = Array.from({ length: size }, () => ({ count: 0, r: 0, g: 0, b: 0 }));
    bins.forEach((bin, i) => {
      const g = groups[assignment[i]];
      g.count += bin.count;
      g.r += bin.r * bin.count;
      g.g += bin.g * bin.count;
      g.b += bin.b * bin.count;
    });
    return groups
      .filter((g) => g.count > 0)
      .map((g) => {
        const color = Color.fromRgb(g.r / g.count, g.g / g.count, g.b / g.count);
        return { color, lab: Oklab.fromColor(color), share: g.count / total };
      });
  }
}
