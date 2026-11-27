// Ajudante dos testes: monta uma "imagem" sintética no mesmo formato do canvas ({ data: RGBA, width, height }).
// Cada faixa tem uma cor (HEX), uma quantidade de pixels e, opcionalmente, a transparência (alpha).
import { Color } from '../../src/domain/color/Color.js';

/**
 * @param {Array<{ hex: string, count: number, alpha?: number }>} regions
 * @param {{ noise?: number, width?: number }} options noise: ruído determinístico de até ±noise por canal (imita o JPEG)
 */
export function syntheticImage(regions, { noise = 0, width = 100 } = {}) {
  const total = regions.reduce((sum, r) => sum + r.count, 0);
  const height = Math.ceil(total / width);
  const data = new Uint8ClampedArray(width * height * 4);
  let p = 0;
  let seed = 1;
  const jitter = () => {
    seed = (seed * 16807) % 2147483647;
    return noise === 0 ? 0 : Math.round(((seed / 2147483647) * 2 - 1) * noise);
  };
  for (const { hex, count, alpha = 255 } of regions) {
    const { r, g, b } = Color.fromHex(hex).rgb;
    for (let i = 0; i < count; i += 1) {
      data.set([r + jitter(), g + jitter(), b + jitter(), alpha], p * 4);
      p += 1;
    }
  }
  // Sobra da última linha: repete a última cor (para não criar um "preto" falso).
  const last = regions.at(-1);
  const { r, g, b } = Color.fromHex(last.hex).rgb;
  for (; p < width * height; p += 1) data.set([r, g, b, last.alpha ?? 255], p * 4);
  return { data, width, height };
}

/** Atalho: N cores com a mesma área (1200 pixels cada). */
export const evenImage = (hexes) => syntheticImage(hexes.map((hex) => ({ hex, count: 1200 })));

/** Cores vivas e bem diferentes entre si, usadas em vários testes. */
export const VIVID = Object.freeze(['#E63946', '#2A9D8F', '#F4A261', '#264653', '#8E44AD', '#F1C40F', '#3498DB', '#16A085']);
