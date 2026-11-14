// Testes unitários da cor (RF-01 e RF-02).
// Escritos ANTES do código, seguindo o TDD.
import { describe, it, expect } from 'vitest';
import { Color, InvalidColorError } from '../../src/domain/color/Color.js';
import { ColorConverter } from '../../src/domain/color/ColorConverter.js';

describe('Color.fromHex', () => {
  it('aceita #rrggbb e normaliza para maiúsculas', () => {
    expect(Color.fromHex('#230023').hex).toBe('#230023');
    expect(Color.fromHex('#42ffff').hex).toBe('#42FFFF');
  });

  it('aceita hex sem # e com espaços', () => {
    expect(Color.fromHex('  f2f2f2 ').hex).toBe('#F2F2F2');
  });

  it('expande o formato curto #rgb', () => {
    expect(Color.fromHex('#abc').hex).toBe('#AABBCC');
  });

  it('rejeita valores inválidos com erro explicativo', () => {
    for (const bad of ['', '#12', '#ggg', '#12345', '1234567', null]) {
      expect(() => Color.fromHex(bad)).toThrow(InvalidColorError);
    }
  });

  it('isValidHex informa sem lançar erro', () => {
    expect(Color.isValidHex('#fff')).toBe(true);
    expect(Color.isValidHex('#ffff')).toBe(false);
  });
});

describe('Color: RGB e HSB', () => {
  it('expõe os canais RGB', () => {
    expect(Color.fromHex('#230023').rgb).toEqual({ r: 35, g: 0, b: 35 });
  });

  it('cria a partir de RGB e limita os canais a 0–255', () => {
    expect(Color.fromRgb(300, -5, 128).hex).toBe('#FF0080');
  });

  it('converte para HSB', () => {
    const { h, s, b } = Color.fromHex('#FF0000').hsb;
    expect([h, s, b]).toEqual([0, 100, 100]);
    const cyan = Color.fromHex('#42FFFF').hsb;
    expect(cyan.h).toBe(180);
    expect(cyan.s).toBeCloseTo(74.1, 1);
    expect(cyan.b).toBe(100);
  });

  it('cria a partir de HSB e normaliza a matiz', () => {
    expect(Color.fromHsb(120, 100, 100).hex).toBe('#00FF00');
    expect(Color.fromHsb(480, 100, 100).hex).toBe('#00FF00');
    expect(Color.fromHsb(-120, 100, 100).hex).toBe('#0000FF');
  });

  it('preserva o HSB de origem (evita a matiz "pular" em cinzas)', () => {
    const gray = Color.fromHsb(210, 0, 50);
    expect(gray.hsb.h).toBe(210);
  });

  it('compara cores pelo valor (Value Object)', () => {
    expect(Color.fromHex('#abc').equals(Color.fromRgb(170, 187, 204))).toBe(true);
    expect(Color.fromHex('#abc').equals(Color.fromHex('#abd'))).toBe(false);
  });

  it('é imutável', () => {
    const c = Color.fromHex('#123456');
    expect(Object.isFrozen(c)).toBe(true);
  });

  it('withHsb devolve uma nova cor trocando só os campos informados', () => {
    const c = Color.fromHsb(200, 50, 50);
    const d = c.withHsb({ b: 90 });
    expect(d.hsb).toEqual({ h: 200, s: 50, b: 90 });
    expect(c.hsb.b).toBe(50);
  });
});

describe('ColorConverter', () => {
  it('ida e volta RGB → HSB → RGB sem perda nas cores da marca', () => {
    for (const hex of ['#230023', '#F2F2F2', '#42FFFF']) {
      const rgb = ColorConverter.hexToRgb(hex);
      const back = ColorConverter.hsbToRgb(ColorConverter.rgbToHsb(rgb));
      expect(ColorConverter.rgbToHex(back)).toBe(hex);
    }
  });
});
