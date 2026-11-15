// Testes de CONTRATO do contraste WCAG 2.2 (RF-03 e RF-04).
// Estes valores vêm das definições oficiais e não podem ser alterados para "fazer passar".
import { describe, it, expect } from 'vitest';
import { Color } from '../../src/domain/color/Color.js';
import { Wcag2Contrast } from '../../src/domain/contrast/Wcag2Contrast.js';

const hex = (v) => Color.fromHex(v);
const wcag = new Wcag2Contrast();

describe('Contrato WCAG 2.2', () => {
  it.each([
    ['#000000', '#FFFFFF', 21.0],
    ['#FFFFFF', '#FFFFFF', 1.0],
    ['#777777', '#FFFFFF', 4.48],
  ])('%s sobre %s = %f:1', (text, bg, expected) => {
    expect(wcag.measure(hex(text), hex(bg))).toBeCloseTo(expected, 2);
  });

  it('cores da Prazo Certo: roxo/cinza ≈ 17,1 e roxo/ciano ≈ 15,5', () => {
    expect(wcag.measure(hex('#230023'), hex('#F2F2F2'))).toBeCloseTo(17.1, 1);
    expect(wcag.measure(hex('#230023'), hex('#42FFFF'))).toBeCloseTo(15.5, 1);
  });

  it('é simétrico: A sobre B = B sobre A', () => {
    expect(wcag.measure(hex('#123456'), hex('#ABCDEF'))).toBe(wcag.measure(hex('#ABCDEF'), hex('#123456')));
  });
});
