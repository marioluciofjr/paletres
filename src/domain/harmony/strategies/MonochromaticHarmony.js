/** Monocromático: mesma matiz, variando saturação e brilho (bem clara, original e bem escura). */
import { HarmonyStrategy } from '../HarmonyStrategy.js';

export class MonochromaticHarmony extends HarmonyStrategy {
  get id() { return 'monocromatico'; }
  get name() { return 'Monocromático'; }
  get description() { return 'Uma única cor, da versão clarinha à bem escura. Elegante e com bom contraste.'; }

  variants(base) {
    return {
      specs: [
        { s: base.s * 0.2, b: 96 },
        { s: base.s, b: base.b },
        { s: Math.min(100, base.s + 15), b: 22 },
      ],
    };
  }
}
