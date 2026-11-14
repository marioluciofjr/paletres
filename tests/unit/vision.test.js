// Testes do simulador de daltonismo (RF-09).
import { describe, it, expect } from 'vitest';
import { Color } from '../../src/domain/color/Color.js';
import { ColorBlindSimulator, VisionType } from '../../src/domain/vision/ColorBlindSimulator.js';

const sim = new ColorBlindSimulator();

describe('ColorBlindSimulator', () => {
  it('lista 4 tipos com nome e explicação simples', () => {
    const types = sim.types();
    expect(types.map((t) => t.id)).toEqual([
      VisionType.PROTANOPIA, VisionType.DEUTERANOPIA, VisionType.TRITANOPIA, VisionType.ACHROMATOPSIA,
    ]);
    for (const t of types) {
      expect(t.name.length).toBeGreaterThan(3);
      expect(t.description.length).toBeGreaterThan(10);
    }
  });

  it('preto e branco continuam iguais em todos os tipos', () => {
    for (const t of sim.types()) {
      expect(sim.simulate(Color.fromHex('#000000'), t.id).hex).toBe('#000000');
      expect(sim.simulate(Color.fromHex('#FFFFFF'), t.id).hex).toBe('#FFFFFF');
    }
  });

  it('protanopia muda bastante o vermelho puro', () => {
    const red = sim.simulate(Color.fromHex('#FF0000'), VisionType.PROTANOPIA);
    expect(red.rgb.r).toBeLessThan(200);
    expect(red.rgb.g).toBeGreaterThan(50);
  });

  it('acromatopsia gera tons de cinza', () => {
    const c = sim.simulate(Color.fromHex('#42FFFF'), VisionType.ACHROMATOPSIA).rgb;
    expect(c.r).toBe(c.g);
    expect(c.g).toBe(c.b);
  });

  it('tipo desconhecido lança erro', () => {
    expect(() => sim.simulate(Color.fromHex('#123456'), 'xyz')).toThrow();
  });
});
