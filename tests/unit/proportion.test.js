// Testes de proporção de uso e sugestão de papéis (RF-07, RF-17 e RF-24).
import { describe, it, expect } from 'vitest';
import { Palette } from '../../src/domain/palette/Palette.js';
import { UsageProportion } from '../../src/domain/proportion/UsageProportion.js';
import { RoleAdvisor, Role } from '../../src/domain/proportion/RoleAdvisor.js';

describe('UsageProportion', () => {
  // v1.1.0: nos mockups, áurea e Fibonacci quase não mudavam o visual. Fica só a 60-30-10.
  it('tem só a regra 60-30-10, somando 100%', () => {
    const list = UsageProportion.list();
    expect(list.map((p) => p.id)).toEqual(['60-30-10']);
    expect(list[0].shares).toEqual([60, 30, 10]);
    expect(list[0].description.length).toBeGreaterThan(10);
  });

  it('RULE é a 60-30-10 e id desconhecido lança erro', () => {
    expect(UsageProportion.RULE.id).toBe('60-30-10');
    expect(() => UsageProportion.get('aurea')).toThrow();
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
