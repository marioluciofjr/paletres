// Testes dos tons claros e escuros (RF-08). No código, "tint" = tom claro e "shade" = tom escuro.
import { describe, it, expect } from 'vitest';
import { Color } from '../../src/domain/color/Color.js';
import { TintShadeGenerator } from '../../src/domain/tints/TintShadeGenerator.js';

const gen = new TintShadeGenerator();

describe('TintShadeGenerator', () => {
  it('tint mistura com branco; shade mistura com preto', () => {
    expect(gen.tint(Color.fromHex('#000000'), 0.5).hex).toBe('#808080');
    expect(gen.shade(Color.fromHex('#FFFFFF'), 0.5).hex).toBe('#808080');
    expect(gen.tint(Color.fromHex('#FF0000'), 0.1).hex).toBe('#FF1A1A');
  });

  it('escala com 19 itens: 9 claros, a original e 9 escuros', () => {
    const scale = gen.scale(Color.fromHex('#230023'));
    expect(scale).toHaveLength(19);
    expect(scale[9].color.hex).toBe('#230023');
    expect(scale[9].label).toBe('Original');
    expect(scale[0].label).toBe('Claro 90%');
    expect(scale[18].label).toBe('Escuro 90%');
  });

  it('a escala vai do mais claro ao mais escuro', () => {
    const lum = (c) => c.rgb.r + c.rgb.g + c.rgb.b;
    const scale = gen.scale(Color.fromHex('#3366CC'));
    for (let i = 1; i < scale.length; i++) {
      expect(lum(scale[i].color)).toBeLessThanOrEqual(lum(scale[i - 1].color));
    }
  });
});
