// Testes do veredito em linguagem simples (RF-23 e RNF-09).
import { describe, it, expect } from 'vitest';
import { PlainVerdict, Tone } from '../../src/domain/contrast/PlainVerdict.js';
import { PaletteComparator } from '../../src/domain/contrast/PaletteComparator.js';
import { Palette } from '../../src/domain/palette/Palette.js';
import { NumberFormat } from '../../src/domain/format/NumberFormat.js';

const verdict = new PlainVerdict();

describe('PlainVerdict.of', () => {
  it.each([
    [21, Tone.EXCELLENT, 'Excelente'],
    [7, Tone.EXCELLENT, 'Excelente'],
    [5, Tone.GOOD, 'Bom'],
    [3.5, Tone.LIMITED, 'Só para títulos grandes'],
    [1.2, Tone.BAD, 'Não use para texto'],
  ])('%f:1 → %s', (ratio, tone, title) => {
    const v = verdict.of(ratio);
    expect(v.tone).toBe(tone);
    expect(v.title).toBe(title);
    expect(v.text.length).toBeGreaterThan(10);
  });
});

describe('PlainVerdict.summary', () => {
  it('conta as combinações boas para texto', () => {
    const comparisons = new PaletteComparator().compare(Palette.default());
    const s = verdict.summary(comparisons);
    expect(s.goodCount).toBe(2);
    expect(s.text).toBe('Sua paleta tem 2 de 3 combinações boas para texto.');
  });
});

describe('NumberFormat', () => {
  it('usa vírgula e arredonda a razão para baixo', () => {
    expect(NumberFormat.ratio(4.4999)).toBe('4,49:1');
    expect(NumberFormat.ratio(17.09)).toBe('17,09:1');
    expect(NumberFormat.ratio(21)).toBe('21,00:1');
    expect(NumberFormat.decimal(137.508, 1)).toBe('137,5');
  });
});
