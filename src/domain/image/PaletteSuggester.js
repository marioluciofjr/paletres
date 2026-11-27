/**
 * PaletteSuggester — escolhe o melhor trio de cores para a paleta, com contraste garantido.
 *
 * Como "melhor" é decidido:
 *  1. Para cada trio candidato, testamos as 3 cores no papel de fundo (cor A) e passamos o
 *     trio pelo ContrastGuard, o mesmo do "Garantir AA/AAA" do site:
 *       - o texto (a cor mais contrastante com A) precisa de 7:1 no AAA ou 4,5:1 no AA;
 *       - o destaque precisa de pelo menos 3:1 contra A (botões, ícones, bordas).
 *  2. Tentamos AAA primeiro. Se, para chegar no AAA, alguma cor precisar mudar mais que
 *     MAX_SHIFT no OKLab (a ponto de deixar de parecer a cor da imagem), o trio não vale.
 *     Sem nenhum trio AAA válido, tentamos AA com a mesma regra e avisamos que caímos.
 *     Se nem assim, aceitamos o AA com a menor mudança possível e avisamos.
 *  3. Entre os trios válidos, ganha a maior nota:
 *       nota = área somada das 3 cores − 2 × mudança total − 0,1 × "distância" dos tons
 *              + 0,05 × área da cor A (a cor que mais aparece na imagem vira o fundo).
 *
 * Por que não exigir AAA nos 3 pares? Porque é matematicamente impossível com 3 cores:
 * o contraste máximo é 21:1 (preto e branco), e a cor do meio precisaria de 7:1 contra as
 * outras duas: 7 × 7 = 49:1. A regra do ContrastGuard é a versão possível disso.
 *
 * Os 4 usos (todos passam pelo mesmo cálculo):
 *  - fromDominants: o melhor trio entre as cores do mosaico (3 a 6 cores);
 *  - fromChoice: exatamente as 3 cores que a pessoa escolheu;
 *  - completeTwo: imagem com 2 cores → a 3ª é um tom mais claro ou mais escuro de uma delas;
 *  - monochrome: imagem com 1 cor → ela mais dois tons dela mesma.
 */
import { Palette } from '../palette/Palette.js';
import { Oklab } from '../color/Oklab.js';
import { ContrastGuard, GuardLevel } from '../guard/ContrastGuard.js';
import { TintShadeGenerator } from '../tints/TintShadeGenerator.js';

const ANCHORS = Object.freeze([[0, 1, 2], [1, 0, 2], [2, 0, 1]]);

const INTRO = Object.freeze({
  dominants: 'Sugestão a partir das cores da imagem.',
  choice: 'Paleta com as 3 cores que você escolheu.',
  two: 'A 3ª cor é um tom mais claro ou mais escuro de uma das cores da imagem.',
  mono: 'Paleta monocromática: a cor da imagem com dois tons dela mesma.',
});

export class PaletteSuggester {
  static MAX_SHIFT = 0.2;
  static SHIFT_WEIGHT = 2;
  static TONE_WEIGHT = 0.1;
  static ANCHOR_WEIGHT = 0.05;

  #guard;
  #tones;
  #maxShift;

  constructor({ guard = new ContrastGuard(), tones = new TintShadeGenerator(), maxShift = PaletteSuggester.MAX_SHIFT } = {}) {
    this.#guard = guard;
    this.#tones = tones;
    this.#maxShift = maxShift;
  }

  /**
   * O melhor trio entre as cores do mosaico.
   * @param {Array<{color, share:number}>} items de 3 a 6 cores, na ordem do mosaico
   */
  fromDominants(items) {
    const indexed = items.map((it, i) => ({ ...it, source: i, tone: 0 }));
    const trios = [];
    for (let i = 0; i < indexed.length; i += 1) {
      for (let j = i + 1; j < indexed.length; j += 1) {
        for (let k = j + 1; k < indexed.length; k += 1) trios.push([indexed[i], indexed[j], indexed[k]]);
      }
    }
    return this.#best(trios, 'dominants');
  }

  /** Exatamente as 3 cores escolhidas (o cálculo só decide os papéis e o ajuste). */
  fromChoice(items) {
    if (items.length !== 3) throw new RangeError('Escolha exatamente 3 cores.');
    return this.#best([items.map((it, i) => ({ ...it, source: i, tone: 0 }))], 'choice');
  }

  /** 2 cores: a 3ª é um tom (mais claro ou mais escuro) de uma das duas. */
  completeTwo(items) {
    if (items.length !== 2) throw new RangeError('completeTwo precisa de 2 cores.');
    const originals = items.map((it, i) => ({ ...it, source: i, tone: 0 }));
    const taken = new Set(originals.map((it) => it.color.hex));
    const tones = originals.flatMap((it) => this.#tonesOf(it.color, taken));
    return this.#best(tones.map((t) => [...originals, t]), 'two');
  }

  /** 1 cor: ela mesma e dois tons dela (claros, escuros ou um de cada). */
  monochrome(item) {
    const base = { ...item, source: 0, tone: 0 };
    const tones = this.#tonesOf(base.color, new Set([base.color.hex]));
    const trios = [];
    for (let i = 0; i < tones.length; i += 1) {
      for (let j = i + 1; j < tones.length; j += 1) trios.push([base, tones[i], tones[j]]);
    }
    return this.#best(trios, 'mono');
  }

  /** Os tons claros e escuros de uma cor (sem repetir HEX), como candidatos sem área na imagem. */
  #tonesOf(color, taken) {
    const out = [];
    for (const step of this.#tones.scale(color)) {
      if (step.kind === 'base' || taken.has(step.color.hex)) continue;
      taken.add(step.color.hex);
      out.push({ color: step.color, share: 0, source: null, tone: step.amount / 100 });
    }
    return out;
  }

  /** O coração: avalia todos os trios, primeiro no AAA e, se preciso, no AA. */
  #best(trios, kind) {
    const aaa = this.#evaluate(trios, GuardLevel.AAA);
    const within = (c) => c.maxShift <= this.#maxShift + 1e-12;
    const pick = (list) => list.reduce((best, c) => (best === null || c.score > best.score ? c : best), null);

    let chosen = pick(aaa.filter(within));
    let fellBack = false;
    let bigShift = false;
    if (!chosen) {
      const aa = this.#evaluate(trios, GuardLevel.AA);
      chosen = pick(aa.filter(within));
      fellBack = chosen !== null;
      if (!chosen) {
        chosen = pick(aa);
        bigShift = chosen !== null;
      }
    }
    if (!chosen) {
      return { ok: false, level: null, fellBack: false, bigShift: false, palette: null, sources: [], adjusted: [], message: 'Não consegui chegar nem ao AA com estas cores. Tente outra imagem ou escolha outras cores do mosaico.' };
    }
    return {
      ok: true,
      level: chosen.level,
      fellBack,
      bigShift,
      palette: chosen.result.palette,
      sources: chosen.items.map((it) => it.source),
      adjusted: chosen.result.changed,
      textIndex: chosen.result.meta.textIndex,
      accentIndex: chosen.result.meta.accentIndex,
      message: PaletteSuggester.#message(kind, chosen, { fellBack, bigShift }),
    };
  }

  /** Passa cada trio, com cada cor no papel de fundo, pelo ContrastGuard no nível pedido. */
  #evaluate(trios, level) {
    const out = [];
    for (const trio of trios) {
      for (const order of ANCHORS) {
        const items = order.map((i) => trio[i]);
        const palette = new Palette(items.map((it) => it.color));
        const result = this.#guard.enforce(palette, level);
        if (!result.ok || result.palette.distinctCount() < 3) continue;
        const shifts = items.map((it, i) => Oklab.distance(Oklab.fromColor(it.color), Oklab.fromColor(result.palette.at(i))));
        const total = shifts.reduce((s, v) => s + v, 0);
        const share = items.reduce((s, it) => s + it.share, 0);
        const tone = items.reduce((s, it) => s + it.tone, 0);
        const score = share
          - PaletteSuggester.SHIFT_WEIGHT * total
          - PaletteSuggester.TONE_WEIGHT * tone
          + PaletteSuggester.ANCHOR_WEIGHT * items[0].share;
        out.push({ level, items, result, maxShift: Math.max(...shifts), score });
      }
    }
    return out;
  }

  /** Frase em português simples: o que foi sugerido, em que nível e o que mudou. */
  static #message(kind, chosen, { fellBack, bigShift }) {
    const { level, result } = chosen;
    const L = Palette.LABELS;
    const parts = [INTRO[kind]];
    if (fellBack) parts.push('O AAA pediria mudar demais as cores, então a sugestão ficou no AA.');
    if (bigShift) parts.push('Para chegar ao AA, precisei mudar bastante as cores.');
    parts.push(`Nível ${level}: o texto na cor ${L[result.meta.textIndex]} sobre o fundo na cor A passa no ${level}, e a cor ${L[result.meta.accentIndex]} serve de destaque (pelo menos 3:1).`);
    const changed = result.changed.map((i) => L[i]);
    if (changed.length === 0) parts.push('Nenhuma cor precisou de ajuste.');
    else if (changed.length === 1) parts.push(`Para chegar lá, ajustei o brilho da cor ${changed[0]}.`);
    else parts.push(`Para chegar lá, ajustei o brilho das cores ${changed.slice(0, -1).join(', ')} e ${changed.at(-1)}.`);
    return parts.join(' ');
  }
}
