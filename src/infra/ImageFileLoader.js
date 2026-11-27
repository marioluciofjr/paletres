/**
 * ImageFileLoader — abre a imagem que a pessoa escolheu, com segurança, dentro do navegador.
 *
 * Usado por dois painéis: o color grading (RF-18) e a paleta a partir de uma imagem (RF-35).
 * Antes este código morava dentro do ColorGradingPanel; virou uma classe própria para os
 * dois usarem as mesmas regras (alta coesão: só esta classe sabe abrir arquivos de imagem).
 *
 * Passos: conferir formato e tamanho do arquivo → ler só as dimensões (sem decodificar tudo)
 * → recusar imagens gigantes antes de travar a aba → decodificar já reduzida.
 * A imagem nunca sai do computador da pessoa: nada é enviado para servidor nenhum.
 */

/** Erro com mensagem pronta para mostrar à pessoa, em português simples. */
export class ImageLoadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ImageLoadError';
  }
}

export class ImageFileLoader {
  static ACCEPTED = Object.freeze(['image/png', 'image/jpeg', 'image/webp']);
  static MAX_BYTES = 15 * 1024 * 1024;
  static MAX_SOURCE_SIDE = 12000; // acima disso, recusamos (evita travar a aba)
  static MIN_SOURCE_SIDE = 16;
  static MAX_SOURCE_PIXELS = 64_000_000; // 64 megapixels: acima disso a memória da aba pode estourar

  #win;

  constructor(win = window) {
    this.#win = win;
  }

  /** Confere formato e tamanho do arquivo. Lança ImageLoadError se não servir. */
  validate(file) {
    if (!ImageFileLoader.ACCEPTED.includes(file.type)) throw new ImageLoadError('Formato não aceito. Use uma foto JPG, PNG ou WebP.');
    if (file.size > ImageFileLoader.MAX_BYTES) throw new ImageLoadError('Arquivo muito grande. O limite é 15 MB.');
  }

  /**
   * Abre o arquivo e devolve a imagem já reduzida para caber em maxSide (lado maior).
   * @returns {Promise<ImageBitmap>} quem chama deve fechar o bitmap (bitmap.close()) depois de usar
   */
  async decode(file, maxSide) {
    this.validate(file);
    const url = this.#win.URL.createObjectURL(file);
    try {
      let img;
      try {
        img = await this.#readImage(url);
      } catch {
        throw new ImageLoadError('Não foi possível abrir esta imagem. Tente outro arquivo.');
      }
      const { naturalWidth: width, naturalHeight: height } = img;
      ImageFileLoader.#checkSize(width, height);
      const scale = Math.min(1, maxSide / Math.max(width, height));
      try {
        return await this.#win.createImageBitmap(img, {
          resizeWidth: Math.max(1, Math.round(width * scale)),
          resizeHeight: Math.max(1, Math.round(height * scale)),
          resizeQuality: 'high',
        });
      } catch {
        throw new ImageLoadError('Não foi possível abrir esta imagem. Tente outro arquivo.');
      }
    } finally {
      this.#win.URL.revokeObjectURL(url);
    }
  }

  /** Abre o arquivo e devolve os pixels (RGBA) de uma versão pequena, para análise. */
  async readPixels(file, maxSide) {
    const bitmap = await this.decode(file, maxSide);
    try {
      return this.pixelsFrom(bitmap, bitmap.width, bitmap.height, maxSide);
    } finally {
      bitmap.close?.();
    }
  }

  /** Desenha qualquer fonte de imagem (bitmap, canvas) reduzida e devolve os pixels. */
  pixelsFrom(source, width, height, maxSide) {
    const scale = Math.min(1, maxSide / Math.max(width, height));
    const canvas = this.#win.document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  /** Carrega a imagem num <img> só para conhecer largura e altura. */
  #readImage(url) {
    return new Promise((resolve, reject) => {
      const img = new this.#win.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('imagem inválida'));
      img.src = url;
    });
  }

  /** Recusa imagens pequenas ou grandes demais, com a mensagem certa para cada caso. */
  static #checkSize(width, height) {
    const { MIN_SOURCE_SIDE: min, MAX_SOURCE_SIDE: max, MAX_SOURCE_PIXELS: maxPixels } = ImageFileLoader;
    if (Math.min(width, height) < min) {
      throw new ImageLoadError(`Imagem pequena demais (${width} × ${height} px). Use uma com pelo menos ${min} px de cada lado.`);
    }
    if (Math.max(width, height) > max || width * height > maxPixels) {
      throw new ImageLoadError(`Imagem grande demais (${width} × ${height} px). Use uma com até ${max} px no lado maior e até 64 megapixels.`);
    }
  }
}
