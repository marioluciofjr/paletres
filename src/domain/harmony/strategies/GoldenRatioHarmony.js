/**
 * Proporção áurea (φ ≈ 1,618).
 * - Matiz: cada cor avança o "ângulo áureo" (≈ 137,5°), que divide o círculo na razão φ.
 *   É o mesmo ângulo das sementes do girassol.
 * - Brilho: B, B/φ e B/φ², ou seja, cada cor é φ vezes mais escura que a anterior.
 */
import { HarmonyStrategy } from '../HarmonyStrategy.js';
import { NumberFormat } from '../../format/NumberFormat.js';

export const PHI = (1 + Math.sqrt(5)) / 2;
export const GOLDEN_ANGLE = 360 * (1 - 1 / PHI); // ≈ 137,508°

export class GoldenRatioHarmony extends HarmonyStrategy {
  get id() { return 'proporcao-aurea'; }
  get name() { return 'Proporção áurea'; }
  get group() { return 'matematica'; }
  get description() { return 'Usa o número de ouro (1,618), o mesmo das sementes do girassol, para girar a cor e escurecer.'; }

  variants(base) {
    return {
      specs: [
        { dh: 0, b: base.b },
        { dh: GOLDEN_ANGLE, b: base.b / PHI },
        { dh: 2 * GOLDEN_ANGLE, b: base.b / PHI ** 2 },
      ],
      note: `Ângulo áureo de ${NumberFormat.decimal(GOLDEN_ANGLE, 1)}° e brilho dividido por 1,618 a cada cor.`,
      meta: { angle: GOLDEN_ANGLE, phi: PHI },
    };
  }
}
