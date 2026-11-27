/**
 * ImagePaletteExtractor — a "porta de entrada" da análise de imagem (padrão Facade).
 *
 * Junta as duas etapas numa chamada só:
 *  1. ColorQuantizer: agrupa os pixels em grupos de cores parecidas;
 *  2. DominantColorPicker: decide quais grupos viram as cores do mosaico (até 6).
 * Quem usa (a interface) não precisa saber dessas etapas. Cada uma pode ser trocada
 * por outra nos testes (injeção de dependência).
 */
import { ColorQuantizer } from './ColorQuantizer.js';
import { DominantColorPicker } from './DominantColorPicker.js';

export class ImagePaletteExtractor {
  #quantizer;
  #picker;

  constructor({ quantizer = new ColorQuantizer(), picker = new DominantColorPicker() } = {}) {
    this.#quantizer = quantizer;
    this.#picker = picker;
  }

  /**
   * @param {{ data: Uint8ClampedArray, width: number, height: number }} pixels
   * @returns {{ colors: Array<{color, lab, share}>, ignored: Array<{color, lab, share}>, found: number }}
   */
  extract(pixels) {
    return this.#picker.pick(this.#quantizer.quantize(pixels));
  }
}
