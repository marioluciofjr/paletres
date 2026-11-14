// Testes unitários das harmonias (RF-05).
import { describe, it, expect } from 'vitest';
import { RandomSource } from '../../src/infra/RandomSource.js';
import { createHarmonyRegistry } from '../../src/domain/harmony/defaultHarmonies.js';
import { HarmonyStrategy } from '../../src/domain/harmony/HarmonyStrategy.js';
import { Wcag2Contrast } from '../../src/domain/contrast/Wcag2Contrast.js';

const registry = createHarmonyRegistry();
const base = { h: 200, s: 80, b: 90 };
const hues = (result) => result.colors.map((c) => Math.round(c.hsb.h * 10) / 10);
const gen = (id, seed = 1) => registry.get(id).generate(base, RandomSource.seeded(seed));

describe('RandomSource', () => {
  it('com a mesma semente, repete a sequência', () => {
    const a = RandomSource.seeded(42);
    const b = RandomSource.seeded(42);
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });

  it('gera números em [0, 1) e inteiros no intervalo pedido', () => {
    const r = RandomSource.seeded(7);
    for (let i = 0; i < 200; i++) {
      const n = r.next();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
      const k = r.int(3, 5);
      expect([3, 4, 5]).toContain(k);
    }
  });
});

describe('HarmonyRegistry', () => {
  it('tem as 11 harmonias, em 3 grupos', () => {
    expect(registry.list().map((h) => h.id)).toEqual([
      'analogo', 'complementar', 'complementar-dividido', 'triade', 'quadrado', 'composto',
      'tons', 'monocromatico', 'proporcao-aurea', 'fibonacci', 'ancora-contraste',
    ]);
    expect(new Set(registry.list().map((h) => h.group))).toEqual(new Set(['classica', 'matematica', 'contraste']));
  });

  it('cada harmonia tem nome e descrição em linguagem simples', () => {
    for (const h of registry.list()) {
      expect(h.name.length).toBeGreaterThan(2);
      expect(h.description.length).toBeGreaterThan(10);
    }
  });

  it('lança erro para id desconhecido', () => {
    expect(() => registry.get('nao-existe')).toThrow();
  });

  it('toda harmonia devolve exatamente 3 cores', () => {
    for (const h of registry.list()) {
      expect(h.generate(base, RandomSource.seeded(3)).colors).toHaveLength(3);
    }
  });
});

describe('Harmonias clássicas: desvios de matiz', () => {
  it.each([
    ['analogo', [170, 200, 230]],
    ['complementar-dividido', [200, 350, 50]],
    ['triade', [200, 320, 80]],
    ['composto', [200, 230, 20]],
  ])('%s', (id, expected) => {
    expect(hues(gen(id))).toEqual(expected);
  });

  it('complementar: base, uma variação da base e a oposta', () => {
    const r = gen('complementar');
    expect(hues(r)).toEqual([200, 200, 20]);
    expect(r.colors[1].hsb.b).not.toBe(base.b);
  });

  it('quadrado: a base e 2 dos outros 3 vértices (múltiplos de 90°)', () => {
    for (let seed = 1; seed < 10; seed++) {
      const h = hues(gen('quadrado', seed));
      expect(h[0]).toBe(200);
      for (const v of h) expect(((v - 200 + 360) % 90)).toBe(0);
      expect(new Set(h).size).toBe(3);
    }
  });

  it('tons: mesma matiz e saturação, brilhos diferentes', () => {
    const r = gen('tons');
    expect(new Set(r.colors.map((c) => c.hsb.h)).size).toBe(1);
    expect(new Set(r.colors.map((c) => c.hsb.s)).size).toBe(1);
    expect(new Set(r.colors.map((c) => c.hsb.b)).size).toBe(3);
  });

  it('monocromático: mesma matiz, saturação e brilho variando', () => {
    const r = gen('monocromatico');
    expect(new Set(r.colors.map((c) => c.hsb.h)).size).toBe(1);
    expect(new Set(r.colors.map((c) => c.hsb.s)).size).toBe(3);
  });
});

describe('Harmonias matemáticas', () => {
  it('proporção áurea: ângulo áureo (137,5°) e brilho em B, B/φ, B/φ²', () => {
    const r = gen('proporcao-aurea');
    expect(hues(r)).toEqual([200, 337.5, 115]);
    const phi = (1 + Math.sqrt(5)) / 2;
    expect(r.colors[1].hsb.b).toBeCloseTo(90 / phi, 1);
    expect(r.colors[2].hsb.b).toBeCloseTo(90 / phi ** 2, 1);
  });

  it('fibonacci: ângulo 360·F(n)/F(n+1) e brilho nas razões dos termos', () => {
    for (let seed = 1; seed < 15; seed++) {
      const r = gen('fibonacci', seed);
      const [a, b, c] = r.meta.terms;
      expect(a + b).toBe(c); // são termos seguidos de Fibonacci
      const angle = (360 * b) / c;
      expect(r.meta.angle).toBeCloseTo(angle, 5);
      expect(hues(r)[1]).toBeCloseTo((200 + angle) % 360, 0);
      expect(r.colors[1].hsb.b).toBeCloseTo((90 * b) / c, 1);
      expect(r.colors[2].hsb.b).toBeCloseTo((90 * a) / c, 1);
      expect(r.note).toContain(`${a}, ${b} e ${c}`);
    }
  });
});

describe('Âncora de contraste', () => {
  it('escura × clara passa em AAA e o acento tem ≥ 3:1 contra as duas', () => {
    const wcag = new Wcag2Contrast();
    for (const h of [0, 60, 120, 200, 280]) {
      const r = registry.get('ancora-contraste').generate({ h, s: 70, b: 80 }, RandomSource.seeded(1));
      const [dark, light, accent] = r.colors;
      expect(wcag.measure(dark, light)).toBeGreaterThanOrEqual(7);
      expect(wcag.measure(accent, dark)).toBeGreaterThanOrEqual(3);
      expect(wcag.measure(accent, light)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('HarmonyStrategy.randomBase', () => {
  it('sorteia uma base viva (saturação e brilho médios ou altos)', () => {
    const rng = RandomSource.seeded(9);
    for (let i = 0; i < 50; i++) {
      const b = HarmonyStrategy.randomBase(rng);
      expect(b.h).toBeGreaterThanOrEqual(0);
      expect(b.h).toBeLessThan(360);
      expect(b.s).toBeGreaterThanOrEqual(45);
      expect(b.b).toBeGreaterThanOrEqual(60);
    }
  });
});
