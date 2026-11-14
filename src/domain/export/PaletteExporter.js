/**
 * PaletteExporter — contrato de um exportador de texto (padrão Strategy).
 * Cada formato (CSS, JSON…) é uma subclasse; a UI só chama export() e baixa o arquivo.
 */
export class PaletteExporter {
  get id() {
    throw new Error('Subclasses devem definir "id".');
  }

  /** Nome do botão. */
  get label() {
    throw new Error('Subclasses devem definir "label".');
  }

  get mimeType() {
    return 'text/plain';
  }

  get fileName() {
    return `paletres.${this.id}`;
  }

  /** @param {import('../palette/Palette.js').Palette} _palette @returns {string} */
  export(_palette) {
    throw new Error('Subclasses devem implementar "export".');
  }
}
