// Testes unitários: níveis WCAG, paleta e as 6 comparações (RF-03, RF-04, RF-17).
import { describe, it, expect } from 'vitest';
import { Color } from '../../src/domain/color/Color.js';
import { Palette } from '../../src/domain/palette/Palette.js';
import { ContrastEvaluator, Level } from '../../src/domain/contrast/ContrastEvaluator.js';
import { PaletteComparator } from '../../src/domain/contrast/PaletteComparator.js';
import { ReadableTextPicker } from '../../src/domain/contrast/ReadableTextPicker.js';
import { Wcag2Contrast } from '../../src/domain/contrast/Wcag2Contrast.js';

const hex = (v) => Color.fromHex(v);
const brand = () => new Palette([hex('#230023'), hex('#F2F2F2'), hex('#42FFFF')]);

describe('ContrastEvaluator.levels', () => {
  const ev = new ContrastEvaluator();

  it('7:1 ou mais é AAA em tudo', () => {
    expect(ev.levels(7)).toEqual({ normalText: Level.AAA, largeText: Level.AAA, ui: Level.AA });
  });

  it('entre 4,5 e 7 é AA no texto normal e AAA no grande', () => {
    expect(ev.levels(5)).toEqual({ normalText: Level.AA, largeText: Level.AAA, ui: Level.AA });
  });

  it('entre 3 e 4,5 reprova o texto normal', () => {
    expect(ev.levels(3.2)).toEqual({ normalText: Level.FAIL, largeText: Level.AA, ui: Level.AA });
  });

  it('abaixo de 3 reprova tudo', () => {
    expect(ev.levels(2.99)).toEqual({ normalText: Level.FAIL, largeText: Level.FAIL, ui: Level.FAIL });
  });

  it('não arredonda para cima: 4,499 não passa em AA', () => {
    expect(ev.levels(4.499).normalText).toBe(Level.FAIL);
  });
});

describe('Palette', () => {
  it('exige exatamente 3 cores', () => {
    expect(() => new Palette([hex('#000')])).toThrow();
  });

  it('withColor devolve uma nova paleta, sem alterar a original', () => {
    const p = brand();
    const q = p.withColor(2, hex('#FF0000'));
    expect(q.at(2).hex).toBe('#FF0000');
    expect(p.at(2).hex).toBe('#42FFFF');
  });

  it('expõe os rótulos A, B e C', () => {
    expect(Palette.LABELS).toEqual(['A', 'B', 'C']);
  });

  it('ordena por luminância (escura → clara)', () => {
    expect(brand().sortedByLuminance().map((c) => c.hex)).toEqual(['#230023', '#42FFFF', '#F2F2F2']);
  });
});

describe('PaletteComparator', () => {
  const comparator = new PaletteComparator();

  it('gera 6 comparações na ordem A/B, B/A, A/C, C/A, B/C, C/B', () => {
    const pairs = comparator.compare(brand()).map((c) => `${c.text.label}/${c.background.label}`);
    expect(pairs).toEqual(['A/B', 'B/A', 'A/C', 'C/A', 'B/C', 'C/B']);
  });

  it('cada comparação tem razão e níveis WCAG (sem APCA desde a v1.1.0)', () => {
    const first = comparator.compare(brand())[0];
    expect(first.ratio).toBeCloseTo(17.1, 1);
    expect(first.levels.normalText).toBe(Level.AAA);
    expect(first).not.toHaveProperty('apca');
  });

  it('worst aponta o par de menor contraste (cinza/ciano)', () => {
    const worst = comparator.worst(brand());
    expect([worst.text.label, worst.background.label].sort()).toEqual(['B', 'C']);
    expect(worst.levels.normalText).toBe(Level.FAIL);
  });
});

describe('ReadableTextPicker', () => {
  it('escolhe a cor da paleta com maior contraste contra o fundo', () => {
    const picker = new ReadableTextPicker(new Wcag2Contrast());
    const pick = picker.pick(hex('#F2F2F2'), brand().colors);
    expect(pick.color.hex).toBe('#230023');
    expect(pick.ratio).toBeCloseTo(17.1, 1);
  });

  it('ignora a própria cor do fundo', () => {
    const picker = new ReadableTextPicker(new Wcag2Contrast());
    const pick = picker.pick(hex('#230023'), brand().colors);
    expect(pick.color.hex).not.toBe('#230023');
  });
});
