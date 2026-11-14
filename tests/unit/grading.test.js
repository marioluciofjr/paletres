// Testes do color grading por gradient map (RF-18). Trabalha com pixels RGBA puros, sem <canvas>.
import { describe, it, expect } from 'vitest';
import { Palette } from '../../src/domain/palette/Palette.js';
import { GradientMap } from '../../src/domain/grading/GradientMap.js';

const palette = Palette.fromHexes(['#FF0000', '#000080', '#FFFF00']); // fora de ordem de propósito
const pixels = (...rgba) => new Uint8ClampedArray(rgba);

describe('GradientMap', () => {
  const map = GradientMap.fromPalette(palette);

  it('ordena as paradas da cor mais escura para a mais clara', () => {
    expect(map.stops.map((c) => c.hex)).toEqual(['#000080', '#FF0000', '#FFFF00']);
  });

  it('preto vira a cor mais escura e branco vira a mais clara', () => {
    const out = map.apply(pixels(0, 0, 0, 255, 255, 255, 255, 255), 1);
    expect([...out.slice(0, 3)]).toEqual([0, 0, 128]);
    expect([...out.slice(4, 7)]).toEqual([255, 255, 0]);
  });

  it('cinza médio fica perto da cor do meio', () => {
    const out = map.apply(pixels(128, 128, 128, 255), 1);
    expect(out[0]).toBeGreaterThan(240);
    expect(out[1]).toBeLessThan(10);
  });

  it('intensidade 0 devolve a imagem original; 0,5 mistura metade', () => {
    const src = pixels(0, 0, 0, 255);
    expect([...map.apply(src, 0)]).toEqual([0, 0, 0, 255]);
    expect([...map.apply(src, 0.5)]).toEqual([0, 0, 64, 255]);
  });

  it('preserva a transparência (canal alfa) e não altera o original', () => {
    const src = pixels(10, 20, 30, 77);
    const out = map.apply(src, 1);
    expect(out[3]).toBe(77);
    expect([...src]).toEqual([10, 20, 30, 77]);
  });
});
