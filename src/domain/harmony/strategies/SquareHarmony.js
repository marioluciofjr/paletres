/**
 * Quadrado: no círculo, 4 matizes a 90°. Como o Paletrês trabalha com 3 cores,
 * mantemos a base e sorteamos qual dos outros 3 vértices fica de fora.
 */
import { HarmonyStrategy } from '../HarmonyStrategy.js';

const VERTICES = [90, 180, 270];

export class SquareHarmony extends HarmonyStrategy {
  get id() { return 'quadrado'; }
  get name() { return 'Quadrado'; }
  get description() { return 'Cores nos cantos de um quadrado dentro do círculo. Rica e variada.'; }

  variants(_base, rng) {
    const omitted = rng.int(0, VERTICES.length - 1);
    const kept = VERTICES.filter((_, i) => i !== omitted);
    return {
      specs: [{ dh: 0 }, ...kept.map((dh) => ({ dh }))],
      note: `O vértice de ${VERTICES[omitted]}° ficou de fora.`,
      meta: { omitted: VERTICES[omitted] },
    };
  }
}
