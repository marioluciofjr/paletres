/**
 * Complementar: a base, uma variação dela e a cor oposta (180°).
 * A variação troca brilho e saturação para que a paleta tenha uma cor clara ou escura
 * de apoio, útil para texto.
 */
import { HarmonyStrategy } from '../HarmonyStrategy.js';

export class ComplementaryHarmony extends HarmonyStrategy {
  get id() { return 'complementar'; }
  get name() { return 'Complementar'; }
  get description() { return 'A cor e a sua oposta no círculo. Dá muito destaque, ótimo para botões e chamadas.'; }

  variants(base) {
    const variationB = base.b > 50 ? base.b - 45 : base.b + 45;
    return { specs: [{ dh: 0 }, { dh: 0, s: base.s * 0.35, b: variationB }, { dh: 180 }] };
  }
}
