/** Tríade: três matizes igualmente espaçadas (120°). */
import { HarmonyStrategy } from '../HarmonyStrategy.js';

export class TriadHarmony extends HarmonyStrategy {
  get id() { return 'triade'; }
  get name() { return 'Tríade'; }
  get description() { return 'Três cores com a mesma distância no círculo. Alegre e equilibrada.'; }

  variants() {
    return { specs: [{ dh: 0 }, { dh: 120 }, { dh: 240 }] };
  }
}
