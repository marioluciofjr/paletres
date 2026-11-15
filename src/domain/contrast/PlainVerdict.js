/**
 * PlainVerdict — traduz a razão de contraste em linguagem simples (RF-23, RNF-09).
 * Quem não é designer lê "Bom: pode usar em textos" antes de ver "4,5:1".
 */
import { Thresholds } from './ContrastEvaluator.js';

export const Tone = Object.freeze({
  EXCELLENT: 'excelente',
  GOOD: 'bom',
  LIMITED: 'limitado',
  BAD: 'ruim',
});

const VERDICTS = Object.freeze([
  { min: Thresholds.normalText.AAA, tone: Tone.EXCELLENT, title: 'Excelente', text: 'pode usar em qualquer texto, até nos pequenos.', icon: 'check-double' },
  { min: Thresholds.normalText.AA, tone: Tone.GOOD, title: 'Bom', text: 'pode usar em textos e parágrafos.', icon: 'check' },
  { min: Thresholds.largeText.AA, tone: Tone.LIMITED, title: 'Só para títulos grandes', text: 'serve para títulos grandes, ícones e bordas, mas não para parágrafos.', icon: 'alert' },
  { min: 0, tone: Tone.BAD, title: 'Não use para texto', text: 'fica difícil de ler. Use só como decoração.', icon: 'x' },
]);

export class PlainVerdict {
  /** @returns {{ tone: string, title: string, text: string, icon: string }} */
  of(ratio) {
    const { tone, title, text, icon } = VERDICTS.find((v) => ratio >= v.min);
    return { tone, title, text, icon };
  }

  /** Resumo da paleta inteira, a partir das 3 comparações (uma por par). */
  summary(comparisons) {
    const goodCount = comparisons.filter((c) => c.ratio >= Thresholds.normalText.AA).length;
    const total = comparisons.length;
    const word = goodCount === 1 ? 'combinação boa' : 'combinações boas';
    return { goodCount, total, text: `Sua paleta tem ${goodCount} de ${total} ${word} para texto.` };
  }
}
