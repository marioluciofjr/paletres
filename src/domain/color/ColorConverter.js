/**
 * ColorConverter — conversões puras entre os modelos de cor HEX, RGB e HSB.
 *
 * Por que uma classe só com métodos estáticos? As conversões não guardam estado:
 * são "fórmulas". Agrupá-las numa classe deixa a responsabilidade clara (alta coesão)
 * e evita espalhar matemática de cor pelo projeto.
 *
 * HSB (também chamado de HSV):
 *  - h (matiz): ângulo de 0 a 360 no círculo cromático;
 *  - s (saturação): 0 a 100, o quanto a cor é "viva";
 *  - b (brilho): 0 a 100, o quanto a cor é clara.
 */
export class ColorConverter {
  /** Normaliza qualquer ângulo para o intervalo [0, 360). Ex.: 480 → 120, -120 → 240. */
  static normalizeHue(h) {
    const n = h % 360;
    return n < 0 ? n + 360 : n;
  }

  /** Limita um número a um intervalo. */
  static clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /** '#RRGGBB' → { r, g, b }. Espera um HEX já validado e expandido. */
  static hexToRgb(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  /** { r, g, b } → '#RRGGBB' em maiúsculas. */
  static rgbToHex({ r, g, b }) {
    const part = (v) => Math.round(ColorConverter.clamp(v, 0, 255)).toString(16).padStart(2, '0');
    return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
  }

  /** { r, g, b } (0–255) → { h, s, b } (0–360, 0–100, 0–100), com uma casa decimal. */
  static rgbToHsb({ r, g, b }) {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;

    // A matiz depende de qual canal é o maior (fórmula clássica de HSV).
    let h = 0;
    if (delta !== 0) {
      if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
      else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
      else h = 60 * ((rn - gn) / delta + 4);
    }
    const round1 = (v) => Math.round(v * 10) / 10;
    return {
      h: round1(ColorConverter.normalizeHue(h)),
      s: round1(max === 0 ? 0 : (delta / max) * 100),
      b: round1(max * 100),
    };
  }

  /** { h, s, b } → { r, g, b } inteiros (0–255). */
  static hsbToRgb({ h, s, b }) {
    const hue = ColorConverter.normalizeHue(h);
    const sat = ColorConverter.clamp(s, 0, 100) / 100;
    const bri = ColorConverter.clamp(b, 0, 100) / 100;

    // c = "croma" (intensidade da cor); x = componente intermediário; m = ajuste de brilho.
    const c = bri * sat;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = bri - c;

    const sector = Math.floor(hue / 60);
    const table = [
      [c, x, 0],
      [x, c, 0],
      [0, c, x],
      [0, x, c],
      [x, 0, c],
      [c, 0, x],
    ];
    const [r1, g1, b1] = table[sector % 6];
    return {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255),
    };
  }
}
