/** JsonExporter — a paleta em JSON (para ferramentas, planilhas ou outros apps). */
import { PaletteExporter } from './PaletteExporter.js';

export class JsonExporter extends PaletteExporter {
  get id() { return 'json'; }
  get label() { return 'JSON'; }
  get mimeType() { return 'application/json'; }

  export(palette) {
    const data = {
      app: 'Paletrês',
      version: 1,
      colors: palette.colors.map((c, i) => ({ label: palette.labelOf(i), hex: c.hex, rgb: { ...c.rgb }, hsb: { ...c.hsb } })),
    };
    return `${JSON.stringify(data, null, 2)}\n`;
  }
}
