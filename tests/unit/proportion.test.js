// Testes de proporção de uso e sugestão de papéis (RF-07, RF-17 e RF-24).
import { describe, it, expect } from 'vitest';
import { Palette } from '../../src/domain/palette/Palette.js';
import { UsageProportion } from '../../src/domain/proportion/UsageProportion.js';
import { RoleAdvisor, Role } from '../../src/domain/proportion/RoleAdvisor.js';

describe('UsageProportion', () => {
  it('tem 60-30-10, áurea e Fibonacci, todas somando 100%', () => {
    const list = UsageProportion.list();
    expect(list.map((p) => p.id)).toEqual(['60-30-10', 'aurea', 'fibonacci']);
    for (const p of list) {
      expect(p.shares.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 5);
      expect(p.description.length).toBeGreaterThan(10);
    }
  });

  it('áurea = 1/φ, 1/φ³ e 1/φ⁴ e Fibonacci = 8:5:3', () => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const aurea = UsageProportion.get('aurea').shares;
    expect(aurea[0]).toBeCloseTo(100 / phi, 5);
    expect(aurea[1]).toBeCloseTo(100 / phi ** 3, 5);
    expect(aurea[2]).toBeCloseTo(100 / phi ** 4, 5);
    expect(UsageProportion.get('fibonacci').shares).toEqual([50, 31.25, 18.75]);
  });

  it('id desconhecido lança erro', () => {
    expect(() => UsageProportion.get('x')).toThrow();
  });
});

describe('RoleAdvisor', () => {
  const advisor = new RoleAdvisor();

  it('na paleta da Prazo Certo sugere roxo no fundo e ciano nos botões', () => {
    const s = advisor.suggest(Palette.default());
    expect(s.roles[Role.DOMINANT]).toBe(0);
    expect(s.roles[Role.ACCENT]).toBe(2);
    expect(s.roles[Role.SECONDARY]).toBe(1);
  });

  it('os 3 papéis usam índices diferentes', () => {
    const s = advisor.suggest(Palette.fromHexes(['#FF6600', '#003366', '#FFFFFF']));
    expect(new Set(Object.values(s.roles)).size).toBe(3);
  });

  it('devolve uma frase pronta em linguagem simples', () => {
    const s = advisor.suggest(Palette.default());
    expect(s.message).toContain('fundo');
    expect(s.message).toContain('botões');
  });

  it('describeRoles monta as cores de texto legíveis de cada superfície', () => {
    const roles = { [Role.DOMINANT]: 1, [Role.SECONDARY]: 0, [Role.ACCENT]: 2 };
    const d = advisor.describeRoles(Palette.default(), roles);
    expect(d.dominant.background.hex).toBe('#F2F2F2');
    expect(d.dominant.text.hex).toBe('#230023');
    expect(d.dominant.ratio).toBeGreaterThan(17);
    expect(typeof d.accent.passesAA).toBe('boolean');
  });
});
