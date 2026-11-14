/** Complementar dividido: a base e as duas vizinhas da oposta (150° e 210°). */
import { HarmonyStrategy } from '../HarmonyStrategy.js';

export class SplitComplementaryHarmony extends HarmonyStrategy {
  get id() { return 'complementar-dividido'; }
  get name() { return 'Complementar dividido'; }
  get description() { return 'Parecido com o complementar, mas mais suave: usa as vizinhas da cor oposta.'; }

  variants() {
    return { specs: [{ dh: 0 }, { dh: 150 }, { dh: 210 }] };
  }
}
