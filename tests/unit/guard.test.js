// Testes do ContrastGuard (RF-06 e RF-20): garantir AA/AAA ajustando só o brilho (e, no limite, a saturação).
import { describe, it, expect } from 'vitest';
import { Palette } from '../../src/domain/palette/Palette.js';
import { ContrastGuard, GuardLevel } from '../../src/domain/guard/ContrastGuard.js';
import { Wcag2Contrast } from '../../src/domain/contrast/Wcag2Contrast.js';

const wcag = new Wcag2Contrast();
const guard = new ContrastGuard();
const ratio = (p, i, j) => wcag.measure(p.at(i), p.at(j));

describe('ContrastGuard.enforce', () => {
  it('modo Livre devolve a paleta intacta', () => {
    const p = Palette.fromHexes(['#888888', '#999999', '#AAAAAA']);
    const r = guard.enforce(p, GuardLevel.NONE);
    expect(r.palette.equals(p)).toBe(true);
    expect(r.changed).toEqual([]);
  });

  it('paleta que já passa não muda', () => {
    const p = Palette.default();
    const r = guard.enforce(p, GuardLevel.AAA);
    expect(r.ok).toBe(true);
    expect(r.changed).toEqual([]);
  });

  it.each([
    [GuardLevel.AA, 4.5],
    [GuardLevel.AAA, 7],
  ])('nível %s: o par principal de texto atinge %f:1 e o destaque fica com ≥ 3:1', (level, target) => {
    const p = Palette.fromHexes(['#3366CC', '#6699FF', '#99BBFF']);
    const r = guard.enforce(p, level);
    expect(r.ok).toBe(true);
    const textPartner = r.meta.textIndex;
    const accent = r.meta.accentIndex;
    expect(ratio(r.palette, 0, textPartner)).toBeGreaterThanOrEqual(target);
    expect(ratio(r.palette, 0, accent)).toBeGreaterThanOrEqual(3);
  });

  it('mantém a matiz das cores ajustadas', () => {
    const p = Palette.fromHexes(['#2E7D32', '#66BB6A', '#A5D6A7']);
    const r = guard.enforce(p, GuardLevel.AAA);
    for (const i of r.changed) {
      expect(Math.abs(r.palette.at(i).hsb.h - p.at(i).hsb.h)).toBeLessThan(1);
    }
  });

  it('explica a mudança em linguagem simples', () => {
    const p = Palette.fromHexes(['#3366CC', '#6699FF', '#99BBFF']);
    const r = guard.enforce(p, GuardLevel.AA);
    expect(r.message).toMatch(/cor [ABC]/);
  });

  it('cor A de brilho médio em AAA: também ajusta a cor A se preciso', () => {
    const p = Palette.fromHexes(['#777777', '#808080', '#888888']);
    const r = guard.enforce(p, GuardLevel.AAA);
    expect(r.ok).toBe(true);
    expect(ratio(r.palette, 0, r.meta.textIndex)).toBeGreaterThanOrEqual(7);
  });
});
