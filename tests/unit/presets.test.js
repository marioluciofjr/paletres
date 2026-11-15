// Testes das paletas prontas (RF-19, v1.1.0: 15 paletas do Color Hunt, sem as cores da marca).
import { describe, it, expect } from 'vitest';
import { PresetCatalog } from '../../src/domain/palette/PresetCatalog.js';
import { Wcag2Contrast } from '../../src/domain/contrast/Wcag2Contrast.js';

const BRAND = ['#230023', '#F2F2F2', '#42FFFF'];

describe('PresetCatalog', () => {
  const presets = new PresetCatalog().list();
  const wcag = new Wcag2Contrast();

  it('tem exatamente 15 paletas, com id único e nome simples', () => {
    expect(presets).toHaveLength(15);
    expect(new Set(presets.map((p) => p.id)).size).toBe(15);
    for (const p of presets) expect(p.name.length).toBeGreaterThan(2);
  });

  it('nenhuma paleta usa as cores da marca Prazo Certo', () => {
    for (const p of presets) for (const hex of BRAND) expect(p.palette.hexes, p.name).not.toContain(hex);
  });

  it('toda paleta cita a origem no Color Hunt, e as 3 cores estão na paleta original', () => {
    for (const p of presets) {
      expect(p.source, p.name).toMatch(/^https:\/\/colorhunt\.co\/palette\/[0-9a-f]{24}$/);
      const slug = p.source.split('/').pop();
      for (const hex of p.palette.hexes) expect(slug, p.name).toContain(hex.slice(1).toLowerCase());
    }
  });

  it('toda paleta é um bom ponto de partida: a mais escura e a mais clara passam em AA', () => {
    for (const p of presets) {
      const [dark, , light] = p.palette.sortedByLuminance();
      expect(wcag.measure(dark, light), p.name).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('o destaque (cor do meio) tem pelo menos 3:1 contra uma das outras (WCAG 1.4.11)', () => {
    for (const p of presets) {
      const [dark, mid, light] = p.palette.sortedByLuminance();
      expect(Math.max(wcag.measure(mid, dark), wcag.measure(mid, light)), p.name).toBeGreaterThanOrEqual(3);
    }
  });
});
