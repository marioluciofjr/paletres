// Testes das paletas prontas (RF-19).
import { describe, it, expect } from 'vitest';
import { PresetCatalog } from '../../src/domain/palette/PresetCatalog.js';
import { Wcag2Contrast } from '../../src/domain/contrast/Wcag2Contrast.js';

describe('PresetCatalog', () => {
  const presets = new PresetCatalog().list();

  it('tem pelo menos 8 paletas com id único e nome simples', () => {
    expect(presets.length).toBeGreaterThanOrEqual(8);
    expect(new Set(presets.map((p) => p.id)).size).toBe(presets.length);
    expect(presets[0].name).toBe('Marca Prazo Certo');
  });

  it('toda paleta pronta é um bom ponto de partida: a mais escura e a mais clara passam em AAA', () => {
    const wcag = new Wcag2Contrast();
    for (const p of presets) {
      const [dark, , light] = p.palette.sortedByLuminance();
      expect(wcag.measure(dark, light), p.name).toBeGreaterThanOrEqual(7);
    }
  });
});
