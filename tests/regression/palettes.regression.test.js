// Testes de REGRESSÃO: congelam resultados com semente fixa.
// Se algum número mudar sem querer (ex.: refatoração do conversor HSB), o teste avisa.
// Mudança intencional? Revise a diferença e atualize com: npx vitest run tests/regression -u
import { describe, it, expect } from 'vitest';
import { createHarmonyRegistry } from '../../src/domain/harmony/defaultHarmonies.js';
import { RandomSource } from '../../src/infra/RandomSource.js';
import { PresetCatalog } from '../../src/domain/palette/PresetCatalog.js';
import { PaletteComparator } from '../../src/domain/contrast/PaletteComparator.js';
import { ContrastGuard, GuardLevel } from '../../src/domain/guard/ContrastGuard.js';
import { Palette } from '../../src/domain/palette/Palette.js';

const round = (n) => Math.round(n * 100) / 100;

describe('Regressão das harmonias (semente 42)', () => {
  const registry = createHarmonyRegistry();
  for (const harmony of registry.list()) {
    it(harmony.id, () => {
      const result = harmony.generate({ h: 200, s: 80, b: 90 }, RandomSource.seeded(42));
      expect({ hexes: result.colors.map((c) => c.hex), note: result.note }).toMatchSnapshot();
    });
  }
});

describe('Regressão do contraste das paletas prontas', () => {
  const comparator = new PaletteComparator();
  for (const preset of new PresetCatalog().list()) {
    it(preset.id, () => {
      const rows = comparator.compare(preset.palette).map((c) => `${c.id} ${round(c.ratio)} ${c.levels.normalText} Lc ${round(c.apca.lc)}`);
      expect(rows).toMatchSnapshot();
    });
  }
});

describe('Regressão do ContrastGuard', () => {
  const guard = new ContrastGuard();
  it.each([
    ['#3366CC', '#6699FF', '#99BBFF'],
    ['#777777', '#808080', '#888888'],
    ['#2E7D32', '#66BB6A', '#A5D6A7'],
  ])('%s %s %s em AA e AAA', (...hexes) => {
    const p = Palette.fromHexes(hexes);
    const out = [GuardLevel.AA, GuardLevel.AAA].map((level) => guard.enforce(p, level).palette.hexes);
    expect(out).toMatchSnapshot();
  });
});
