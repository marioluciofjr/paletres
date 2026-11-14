/** CssVarsExporter — a paleta como variáveis CSS, prontas para colar num site. */
import { PaletteExporter } from './PaletteExporter.js';

export class CssVarsExporter extends PaletteExporter {
  get id() { return 'css'; }
  get label() { return 'Variáveis CSS'; }
  get mimeType() { return 'text/css'; }

  export(palette) {
    const lines = palette.colors.map((c, i) => `  --cor-${palette.labelOf(i).toLowerCase()}: ${c.hex};`);
    return [':root {', ...lines, '}', ''].join('\n');
  }
}
