// Contrato dos formatos exportados (RF-10). Quem usa o JSON ou o CSS em outro projeto depende destes formatos.
import { describe, it, expect } from 'vitest';
import { Palette } from '../../src/domain/palette/Palette.js';
import { CssVarsExporter } from '../../src/domain/export/CssVarsExporter.js';
import { JsonExporter } from '../../src/domain/export/JsonExporter.js';

const palette = Palette.default();

describe('Contrato CSS', () => {
  it('gera variáveis --cor-a, --cor-b e --cor-c em :root', () => {
    expect(new CssVarsExporter().export(palette)).toBe(
      [':root {', '  --cor-a: #230023;', '  --cor-b: #F2F2F2;', '  --cor-c: #42FFFF;', '}', ''].join('\n'),
    );
  });
});

describe('Contrato JSON', () => {
  it('tem nome, versão e as 3 cores com hex, rgb e hsb', () => {
    const data = JSON.parse(new JsonExporter().export(palette));
    expect(data.app).toBe('Paletrês');
    expect(data.version).toBe(1);
    expect(data.colors).toHaveLength(3);
    expect(Object.keys(data.colors[0]).sort()).toEqual(['hex', 'hsb', 'label', 'rgb']);
    expect(data.colors[0]).toMatchObject({ label: 'A', hex: '#230023', rgb: { r: 35, g: 0, b: 35 } });
  });
});
