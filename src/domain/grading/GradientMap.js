/**
 * GradientMap — color grading por "mapa de gradiente" (RF-18).
 *
 * Ideia: cada pixel da foto vira uma cor da paleta conforme a sua claridade.
 *  - sombras (pixels escuros)   → cor mais escura da paleta;
 *  - meios-tons                 → cor do meio;
 *  - luzes (pixels claros)      → cor mais clara.
 * Dois modos:
 *  - SMOOTH ("suave"): entre as paradas, as cores se misturam suavemente (o resultado final);
 *  - ZONES ("zonas"): sem mistura, cada pixel vira exatamente uma das 3 cores. Serve para
 *    MOSTRAR onde cada cor entrou na foto (v1.1.0).
 *
 * Trabalha com o array de pixels RGBA (Uint8ClampedArray) do <canvas>, mas não conhece
 * o <canvas>: assim dá para testar sem navegador. Para ser rápido, pré-calcula uma
 * tabela (LUT) com as 256 claridades possíveis.
 */
const Mode = Object.freeze({ SMOOTH: 'smooth', ZONES: 'zones' });

export class GradientMap {
  static Mode = Mode;

  #stops;
  #lut;

  /**
   * @param {import('../color/Color.js').Color[]} stops cores da mais escura para a mais clara
   * @param {{ mode?: 'smooth'|'zones' }} [options]
   */
  constructor(stops, { mode = Mode.SMOOTH } = {}) {
    if (!Object.values(Mode).includes(mode)) throw new Error(`Modo de gradient map inválido: ${mode}`);
    this.#stops = Object.freeze([...stops]);
    this.#lut = mode === Mode.ZONES ? GradientMap.#buildZoneLut(this.#stops) : GradientMap.#buildLut(this.#stops);
  }

  static fromPalette(palette, options) {
    return new GradientMap(palette.sortedByLuminance(), options);
  }

  get stops() {
    return this.#stops;
  }

  /** Em qual das 3 faixas de claridade (0 sombras, 1 meios-tons, 2 luzes) cai um valor de 0 a 255. */
  static zoneOf(y) {
    return Math.min(2, Math.floor(y / 85));
  }

  /** Tabela "em degraus": cada claridade recebe a cor inteira da sua faixa, sem mistura. */
  static #buildZoneLut(stops) {
    const lut = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) {
      const { r, g, b } = stops[Math.min(stops.length - 1, GradientMap.zoneOf(i))].rgb;
      lut.set([r, g, b], i * 3);
    }
    return lut;
  }

  /** Tabela 256 × RGB: para cada claridade (0–255), a cor mapeada. */
  static #buildLut(stops) {
    const lut = new Uint8ClampedArray(256 * 3);
    const segments = stops.length - 1;
    for (let i = 0; i < 256; i++) {
      const t = (i / 255) * segments; // posição ao longo do gradiente
      const k = Math.min(Math.floor(t), segments - 1);
      const f = t - k; // quanto já andou entre a parada k e a k+1
      const from = stops[k].rgb;
      const to = stops[k + 1].rgb;
      lut[i * 3] = Math.round(from.r + (to.r - from.r) * f);
      lut[i * 3 + 1] = Math.round(from.g + (to.g - from.g) * f);
      lut[i * 3 + 2] = Math.round(from.b + (to.b - from.b) * f);
    }
    return lut;
  }

  /**
   * Aplica o mapa e devolve o resultado num array de saída (o original fica intacto).
   * @param {Uint8ClampedArray} data pixels RGBA
   * @param {number} intensity 0 (foto original) a 1 (só a paleta)
   * @param {Uint8ClampedArray} [out] buffer reaproveitado entre chamadas (evita alocar ~7 MB a cada quadro)
   */
  apply(data, intensity = 1, out = new Uint8ClampedArray(data.length)) {
    const k = Math.min(1, Math.max(0, intensity));
    for (let p = 0; p < data.length; p += 4) {
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      // Claridade percebida (luma Rec. 709): o verde pesa mais para o olho.
      const y = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
      const i = y * 3;
      out[p] = r + (this.#lut[i] - r) * k;
      out[p + 1] = g + (this.#lut[i + 1] - g) * k;
      out[p + 2] = b + (this.#lut[i + 2] - b) * k;
      out[p + 3] = data[p + 3]; // a transparência não muda
    }
    return out;
  }
}
