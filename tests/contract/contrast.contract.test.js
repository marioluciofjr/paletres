// Testes de CONTRATO do contraste (RF-03 e RF-04).
// Estes valores vêm das definições oficiais e não podem ser alterados para "fazer passar".
import { describe, it, expect } from 'vitest';
import { Color } from '../../src/domain/color/Color.js';
import { Wcag2Contrast } from '../../src/domain/contrast/Wcag2Contrast.js';
import { ApcaContrast } from '../../src/domain/contrast/ApcaContrast.js';

const hex = (v) => Color.fromHex(v);
const wcag = new Wcag2Contrast();
const apca = new ApcaContrast();

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

describe('Contrato APCA-W3 0.0.98G-4g', () => {
  it.each([
    ['#000000', '#FFFFFF', 106.04],
    ['#FFFFFF', '#000000', -107.88],
    ['#888888', '#FFFFFF', 63.06],
    ['#FFFFFF', '#888888', -68.54],
    ['#000000', '#AAAAAA', 58.15],
    ['#AAAAAA', '#000000', -56.24],
  ])('texto %s sobre fundo %s = Lc %f', (text, bg, expected) => {
    expect(apca.measure(hex(text), hex(bg))).toBeCloseTo(expected, 1);
  });

  it('não é simétrico: a direção muda o resultado', () => {
    const ab = apca.measure(hex('#888888'), hex('#FFFFFF'));
    const ba = apca.measure(hex('#FFFFFF'), hex('#888888'));
    expect(Math.abs(ab)).not.toBeCloseTo(Math.abs(ba), 0);
  });

  it('cores iguais = Lc 0', () => {
    expect(apca.measure(hex('#336699'), hex('#336699'))).toBe(0);
  });
});
