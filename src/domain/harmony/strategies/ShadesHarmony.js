/** Tons: mesma matiz e saturação; só o brilho muda (claro, médio e escuro). */
import { HarmonyStrategy } from '../HarmonyStrategy.js';

export class ShadesHarmony extends HarmonyStrategy {
  get id() { return 'tons'; }
  get name() { return 'Tons'; }
  get description() { return 'A mesma cor em três níveis de claridade. Sóbria e fácil de combinar.'; }

  variants() {
    return { specs: [{ b: 95 }, { b: 60 }, { b: 25 }] };
  }
}
