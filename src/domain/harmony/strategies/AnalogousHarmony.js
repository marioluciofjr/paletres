/** Análogo: a base e as duas vizinhas no círculo (±30°). Resultado calmo e harmonioso. */
import { HarmonyStrategy } from '../HarmonyStrategy.js';

export class AnalogousHarmony extends HarmonyStrategy {
  get id() { return 'analogo'; }
  get name() { return 'Análogo'; }
  get description() { return 'Cores vizinhas no círculo. O resultado é calmo e harmonioso, como um pôr do sol.'; }

  variants() {
    return { specs: [{ dh: -30 }, { dh: 0 }, { dh: 30 }] };
  }
}
