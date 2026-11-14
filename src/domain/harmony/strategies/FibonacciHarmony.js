/**
 * Fibonacci (1, 1, 2, 3, 5, 8, 13, 21, 34, 55…): cada termo é a soma dos dois anteriores.
 *
 * Sorteamos 3 termos seguidos (a, b, c), com a + b = c.
 * - Matiz: o ângulo entre as cores é 360° × b / c. Com termos maiores, esse ângulo se
 *   aproxima de 222,5°, que é o ângulo áureo visto "pelo outro lado" (360° − 137,5°).
 *   Por isso Fibonacci e proporção áurea são primas.
 * - Brilho: as cores seguem as razões c/c, b/c e a/c (ex.: 21/21, 13/21, 8/21 ≈ 100%, 62%, 38%).
 */
import { HarmonyStrategy } from '../HarmonyStrategy.js';
import { NumberFormat } from '../../format/NumberFormat.js';

const SEQUENCE = [1, 2, 3, 5, 8, 13, 21, 34, 55];

export class FibonacciHarmony extends HarmonyStrategy {
  get id() { return 'fibonacci'; }
  get name() { return 'Fibonacci'; }
  get group() { return 'matematica'; }
  get description() { return 'Usa a sequência 1, 2, 3, 5, 8, 13… para girar a cor e definir a claridade de cada uma.'; }

  variants(base, rng) {
    const i = rng.int(0, SEQUENCE.length - 3);
    const [a, b, c] = SEQUENCE.slice(i, i + 3);
    const angle = (360 * b) / c;
    const pct = (n) => Math.round((n / c) * 100);
    return {
      specs: [
        { dh: 0, b: base.b },
        { dh: angle, b: (base.b * b) / c },
        { dh: 2 * angle, b: (base.b * a) / c },
      ],
      note: `Termos ${a}, ${b} e ${c}: ângulo de ${NumberFormat.decimal(angle, 1)}° e brilho em ${pct(c)}%, ${pct(b)}% e ${pct(a)}%.`,
      meta: { terms: [a, b, c], angle },
    };
  }
}
