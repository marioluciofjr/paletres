/**
 * CanvasPngRenderer — desenha o PngLayout num <canvas> e devolve um arquivo PNG (Blob).
 * Fica na camada infra porque depende do navegador.
 */
export class CanvasPngRenderer {
  #doc;

  constructor(doc = document) {
    this.#doc = doc;
  }

  /** @param {{width:number,height:number,swatches:Array}} layout */
  render(layout) {
    const canvas = this.#doc.createElement('canvas');
    canvas.width = layout.width;
    canvas.height = layout.height;
    const ctx = canvas.getContext('2d');
    for (const s of layout.swatches) {
      ctx.fillStyle = s.fill;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = s.labelColor;
      ctx.font = '700 40px Kreon, Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, s.x + s.w / 2, s.y + s.h - 56);
    }
    ctx.fillStyle = layout.swatches[0].labelColor;
    ctx.font = '700 28px Kreon, Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('Paletrês', 40, 64);
    return canvas;
  }

  /** @returns {Promise<Blob>} */
  toBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Não foi possível gerar o PNG.'))), 'image/png');
    });
  }
}
