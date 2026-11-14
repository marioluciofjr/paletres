/**
 * PngLayout — calcula o desenho da imagem da paleta (3 faixas verticais com o HEX).
 *
 * Fica no domínio porque é só geometria e escolha de cor; quem desenha de verdade no
 * <canvas> é o CanvasPngRenderer (camada infra). Assim o layout é testável sem navegador.
 */
import { Color } from '../color/Color.js';
import { ReadableTextPicker } from '../contrast/ReadableTextPicker.js';
import { Wcag2Contrast } from '../contrast/Wcag2Contrast.js';

const INK = [Color.fromHex('#000000'), Color.fromHex('#FFFFFF')];

export class PngLayout {
  #width;
  #height;
  #picker = new ReadableTextPicker(new Wcag2Contrast());

  constructor({ width = 1200, height = 630 } = {}) {
    this.#width = width;
    this.#height = height;
  }

  /** @returns {{ width:number, height:number, swatches: Array<{x:number,y:number,w:number,h:number,fill:string,label:string,labelColor:string}> }} */
  build(palette) {
    const n = palette.colors.length;
    const base = Math.floor(this.#width / n);
    const swatches = palette.colors.map((color, i) => {
      const x = i * base;
      // A última faixa absorve a sobra da divisão, para cobrir a largura toda.
      const w = i === n - 1 ? this.#width - x : base;
      return {
        x, y: 0, w, h: this.#height,
        fill: color.hex,
        label: color.hex,
        labelColor: this.#picker.pick(color, INK).color.hex,
      };
    });
    return { width: this.#width, height: this.#height, swatches };
  }
}
