/** Composto: mistura análogo e complementar (base, vizinha a 30° e oposta a 180°). */
import { HarmonyStrategy } from '../HarmonyStrategy.js';

export class CompoundHarmony extends HarmonyStrategy {
  get id() { return 'composto'; }
  get name() { return 'Composto'; }
  get description() { return 'Une uma cor vizinha e uma oposta. Tem harmonia e contraste ao mesmo tempo.'; }

  variants() {
    return { specs: [{ dh: 0 }, { dh: 30 }, { dh: 180 }] };
  }
}
