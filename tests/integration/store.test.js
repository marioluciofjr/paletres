// Integração: PaletteStore + domínio real (harmonias, guard, paletas prontas) + EventBus (RF-01 a RF-11, RF-19 a RF-21, RF-24).
import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../../src/app/EventBus.js';
import { PaletteStore, StoreEvent } from '../../src/app/PaletteStore.js';
import { Color } from '../../src/domain/color/Color.js';
import { Palette } from '../../src/domain/palette/Palette.js';
import { GuardLevel } from '../../src/domain/guard/ContrastGuard.js';
import { Wcag2Contrast } from '../../src/domain/contrast/Wcag2Contrast.js';
import { RandomSource } from '../../src/infra/RandomSource.js';

describe('EventBus', () => {
  it('avisa os inscritos e permite cancelar a inscrição', () => {
    const bus = new EventBus();
    const got = [];
    const off = bus.on('x', (p) => got.push(p));
    bus.emit('x', 1);
    off();
    bus.emit('x', 2);
    expect(got).toEqual([1]);
  });

  it('um ouvinte com erro não impede os outros', () => {
    const bus = new EventBus({ onError: () => {} });
    const got = [];
    bus.on('x', () => { throw new Error('falhou'); });
    bus.on('x', (p) => got.push(p));
    bus.emit('x', 'ok');
    expect(got).toEqual(['ok']);
  });
});

describe('PaletteStore', () => {
  let bus;
  let store;
  let events;

  beforeEach(() => {
    bus = new EventBus();
    store = PaletteStore.create({ bus, rng: RandomSource.seeded(42) });
    events = [];
    for (const name of Object.values(StoreEvent)) bus.on(name, () => events.push(name));
  });

  it('começa com a paleta da Prazo Certo e a cor A selecionada', () => {
    expect(store.state.palette.hexes).toEqual(['#230023', '#F2F2F2', '#42FFFF']);
    expect(store.state.selectedIndex).toBe(0);
    expect(store.state.guardLevel).toBe(GuardLevel.NONE);
  });

  it('setColor troca uma cor e emite palette:changed', () => {
    store.setColor(1, Color.fromHex('#FF0000'));
    expect(store.state.palette.at(1).hex).toBe('#FF0000');
    expect(events).toContain(StoreEvent.PALETTE);
  });

  it('desfazer e refazer (RF-21)', () => {
    store.setColor(0, Color.fromHex('#111111'));
    store.setColor(0, Color.fromHex('#222222'));
    expect(store.canUndo).toBe(true);
    store.undo();
    expect(store.state.palette.at(0).hex).toBe('#111111');
    store.undo();
    expect(store.state.palette.at(0).hex).toBe('#230023');
    expect(store.canUndo).toBe(false);
    store.redo();
    expect(store.state.palette.at(0).hex).toBe('#111111');
    expect(store.canRedo).toBe(true);
  });

  it('uma mudança nova apaga o "refazer"', () => {
    store.setColor(0, Color.fromHex('#111111'));
    store.undo();
    store.setColor(0, Color.fromHex('#333333'));
    expect(store.canRedo).toBe(false);
  });

  it('gestos (arrastar slider) viram um só passo no histórico', () => {
    store.checkpoint();
    store.setColor(0, Color.fromHex('#101010'), { record: false });
    store.setColor(0, Color.fromHex('#202020'), { record: false });
    store.setColor(0, Color.fromHex('#303030'), { record: false });
    store.undo();
    expect(store.state.palette.at(0).hex).toBe('#230023');
  });

  it('mudança que não altera a paleta não suja o histórico', () => {
    store.setColor(0, Color.fromHex('#230023'));
    expect(store.canUndo).toBe(false);
  });

  it('generate usa a harmonia escolhida a partir da cor A', () => {
    store.setColor(0, Color.fromHsb(200, 80, 90));
    store.setHarmony('triade');
    store.generate();
    const hues = store.state.palette.colors.map((c) => Math.round(c.hsb.h));
    expect(hues).toEqual([200, 320, 80]);
    expect(store.state.harmonyId).toBe('triade');
  });

  it('generate com garantia AAA entrega um par de texto ≥ 7:1', () => {
    store.setGuard(GuardLevel.AAA);
    store.setHarmony('analogo');
    store.generate({ random: true });
    const wcag = new Wcag2Contrast();
    const p = store.state.palette;
    const best = Math.max(wcag.measure(p.at(0), p.at(1)), wcag.measure(p.at(0), p.at(2)));
    expect(best).toBeGreaterThanOrEqual(7);
    expect(store.state.message.text.length).toBeGreaterThan(5);
  });

  it('fixContrast conserta a paleta atual e explica (RF-20)', () => {
    store.setPalette(Palette.fromHexes(['#3366CC', '#6699FF', '#99BBFF']));
    store.fixContrast(GuardLevel.AA);
    const wcag = new Wcag2Contrast();
    const p = store.state.palette;
    expect(Math.max(wcag.measure(p.at(0), p.at(1)), wcag.measure(p.at(0), p.at(2)))).toBeGreaterThanOrEqual(4.5);
    expect(store.state.message.text).toMatch(/Pronto/);
    store.undo();
    expect(store.state.palette.at(2).hex).toBe('#99BBFF');
  });

  it('applyPreset aplica uma paleta pronta (RF-19)', () => {
    store.applyPreset('oceano');
    expect(store.state.palette.hexes).toEqual(['#0B2545', '#EEF4ED', '#13A8A8']);
  });

  it('papéis: começam automáticos (sugeridos) e podem ser trocados (RF-24)', () => {
    expect(store.state.roles).toEqual({ dominant: 0, secondary: 1, accent: 2 });
    expect(store.state.rolesAuto).toBe(true);
    store.setRoles({ dominant: 1, secondary: 0, accent: 2 });
    expect(store.state.rolesAuto).toBe(false);
    store.resetRoles();
    expect(store.state.rolesAuto).toBe(true);
  });

  it('mudar a matiz de uma cor preta é registrado (auditoria E01)', () => {
    store.setColor(0, Color.fromHsb(0, 0, 0));
    store.setColor(0, Color.fromHsb(120, 0, 0));
    expect(store.state.palette.at(0).hsb.h).toBe(120);
  });

  it('harmonia a partir de cor cinza ou preta usa uma base colorida e avisa (auditoria E02)', () => {
    store.setColor(0, Color.fromHex('#000000'));
    store.setHarmony('triade');
    store.generate();
    expect(new Set(store.state.palette.hexes).size).toBe(3);
    expect(store.state.message.text).toMatch(/sem cor/);
  });

  it('cor A escura mas colorida (roxo da marca) não é chamada de "sem cor" (auditoria N02)', () => {
    store.setHarmony('triade');
    store.generate();
    expect(store.state.message.text).not.toMatch(/sem cor/);
    expect(store.state.message.text).toMatch(/muito escura/);
  });

  it('selectColor muda a cor em edição', () => {
    store.selectColor(2);
    expect(store.state.selectedIndex).toBe(2);
    expect(events).toContain(StoreEvent.SELECTION);
  });

  it('setProportion valida o id', () => {
    store.setProportion('aurea');
    expect(store.state.proportionId).toBe('aurea');
    expect(() => store.setProportion('xyz')).toThrow();
  });
});
