// Integração: PaletteStore + domínio real (harmonias, guard, paletas prontas) + EventBus (RF-01 a RF-11, RF-19 a RF-21, RF-24).
import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../../src/app/EventBus.js';
import { PaletteStore, StoreEvent } from '../../src/app/PaletteStore.js';
import { Color } from '../../src/domain/color/Color.js';
import { Palette } from '../../src/domain/palette/Palette.js';
import { GuardLevel } from '../../src/domain/guard/ContrastGuard.js';
import { Wcag2Contrast } from '../../src/domain/contrast/Wcag2Contrast.js';
import { RandomSource } from '../../src/infra/RandomSource.js';
import { HarmonyWorkbench, DraftEvent } from '../../src/app/HarmonyWorkbench.js';

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
    store.applyPreset('petroleo');
    expect(store.state.palette.hexes).toEqual(['#071B2B', '#EEEEEE', '#167D8D']);
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

  it('não tem mais a escolha de proporção (v1.1.0: só 60-30-10)', () => {
    expect(store.state).not.toHaveProperty('proportionId');
    expect(store.setProportion).toBeUndefined();
  });
});

// v1.1.0 (RF-25): o site abre sem paleta; a pessoa precisa clicar em "Gerar paleta".
describe('PaletteStore — início bloqueado', () => {
  it('sem link, começa com started = false', () => {
    const store = PaletteStore.create({ bus: new EventBus(), rng: RandomSource.seeded(1) });
    expect(store.state.started).toBe(false);
  });

  it('com paleta no link, já começa liberado', () => {
    const store = PaletteStore.create({ bus: new EventBus(), initialPalette: Palette.fromHexes(['#111111', '#EEEEEE', '#FF8800']) });
    expect(store.state.started).toBe(true);
    expect(store.state.palette.hexes).toEqual(['#111111', '#EEEEEE', '#FF8800']);
  });

  it('start() gera uma paleta legível (AA), libera o site, avisa e não cria passo de desfazer', () => {
    const bus = new EventBus();
    const store = PaletteStore.create({ bus, rng: RandomSource.seeded(7) });
    const before = store.state.palette;
    const got = [];
    bus.on(StoreEvent.STARTED, () => got.push('started'));
    store.start();
    expect(store.state.started).toBe(true);
    expect(got).toEqual(['started']);
    expect(store.state.palette.equals(before)).toBe(false);
    expect(store.canUndo).toBe(false);
    const wcag = new Wcag2Contrast();
    const [dark, , light] = store.state.palette.sortedByLuminance();
    expect(wcag.measure(dark, light)).toBeGreaterThanOrEqual(4.5);
    expect(store.state.message.text).toMatch(/Pronto/);
    // As escolhas da pessoa na seção de harmonias não mudam.
    expect(store.state.guardLevel).toBe(GuardLevel.NONE);
  });

  it('adopt() abre a paleta de um link antigo colado antes de gerar e libera o site (limites #1)', () => {
    const bus = new EventBus();
    const store = PaletteStore.create({ bus, rng: RandomSource.seeded(7) });
    const got = [];
    bus.on(StoreEvent.STARTED, () => got.push('started'));
    store.adopt(Palette.fromHexes(['#000000', '#FFFFFF', '#FF0000']));
    expect(store.state.started).toBe(true);
    expect(store.state.palette.hexes).toEqual(['#000000', '#FFFFFF', '#FF0000']);
    expect(store.canUndo).toBe(false);
    expect(got).toEqual(['started']);
    store.adopt(Palette.fromHexes(['#111111', '#FFFFFF', '#FF0000']));
    expect(store.canUndo).toBe(true);
  });

  it('reset() volta ao zero: sem paleta, sem histórico e avisa (feedback do Mário)', () => {
    const bus = new EventBus();
    const store = PaletteStore.create({ bus, rng: RandomSource.seeded(7) });
    const got = [];
    bus.on(StoreEvent.RESET, () => got.push('reset'));
    store.start();
    store.setColor(0, Color.fromHex('#123456'));
    expect(store.canUndo).toBe(true);
    store.reset();
    expect(store.state.started).toBe(false);
    expect(store.canUndo).toBe(false);
    expect(store.canRedo).toBe(false);
    expect(got).toEqual(['reset']);
    store.start();
    expect(store.state.started).toBe(true);
  });

  it('reset() antes de começar não faz nada', () => {
    const bus = new EventBus();
    const store = PaletteStore.create({ bus, rng: RandomSource.seeded(7) });
    const got = [];
    bus.on(StoreEvent.RESET, () => got.push('reset'));
    store.reset();
    expect(got).toEqual([]);
  });

  it('start() chamado de novo não faz nada', () => {
    const store = PaletteStore.create({ bus: new EventBus(), rng: RandomSource.seeded(7) });
    store.start();
    const p = store.state.palette;
    store.start();
    expect(store.state.palette.equals(p)).toBe(true);
  });
});

// v1.1.0 (RF-26): as harmonias montam uma paleta NOVA num rascunho; a paleta da pessoa
// só muda quando ela clica em "Usar esta paleta".
describe('HarmonyWorkbench (rascunho das harmonias)', () => {
  let bus;
  let store;
  let bench;

  beforeEach(() => {
    bus = new EventBus();
    store = PaletteStore.create({ bus, rng: RandomSource.seeded(42), initialPalette: Palette.fromHexes(['#3366CC', '#F5F5F5', '#FF9900']) });
    bench = HarmonyWorkbench.create({ store, bus, rng: RandomSource.seeded(42) });
  });

  it('começa igual à paleta da pessoa e sem nada pendente', () => {
    expect(bench.state.palette.equals(store.state.palette)).toBe(true);
    expect(bench.state.pending).toBe(false);
  });

  it('gerar muda só o rascunho, não a paleta da pessoa', () => {
    const mine = store.state.palette;
    const got = [];
    bus.on(DraftEvent.PALETTE, () => got.push(1));
    store.setHarmony('triade');
    bench.generate();
    expect(store.state.palette.equals(mine)).toBe(true);
    expect(bench.state.pending).toBe(true);
    expect(bench.state.palette.equals(mine)).toBe(false);
    expect(bench.state.message.text.length).toBeGreaterThan(5);
    expect(got.length).toBeGreaterThan(0);
  });

  it('"Usar esta paleta" aplica o rascunho e permite desfazer', () => {
    const mine = store.state.palette;
    bench.generate();
    const draft = bench.state.palette;
    bench.apply();
    expect(store.state.palette.equals(draft)).toBe(true);
    expect(bench.state.pending).toBe(false);
    expect(store.state.message.text).toMatch(/Desfazer/);
    store.undo();
    expect(store.state.palette.equals(mine)).toBe(true);
  });

  it('"Descartar" volta o rascunho para a paleta da pessoa', () => {
    bench.generate();
    bench.discard();
    expect(bench.state.pending).toBe(false);
    expect(bench.state.palette.equals(store.state.palette)).toBe(true);
  });

  it('mexer na roda muda só a cor A do rascunho', () => {
    const mine = store.state.palette;
    bench.setColor(0, Color.fromHsb(10, 80, 80), { record: false });
    expect(store.state.palette.equals(mine)).toBe(true);
    expect(bench.state.palette.at(0).hex).toBe(Color.fromHsb(10, 80, 80).hex);
    expect(bench.state.pending).toBe(true);
  });

  it('sem rascunho pendente, acompanha as mudanças da paleta da pessoa', () => {
    store.setColor(2, Color.fromHex('#00AA55'));
    expect(bench.state.palette.at(2).hex).toBe('#00AA55');
  });

  it('com rascunho pendente, não é sobrescrito por mudanças da paleta da pessoa', () => {
    bench.generate();
    const draft = bench.state.palette;
    store.setColor(2, Color.fromHex('#00AA55'));
    expect(bench.state.palette.equals(draft)).toBe(true);
  });

  it('com rascunho pendente, se a paleta da pessoa ficar igual ao rascunho, nada fica pendente (limites #2)', () => {
    bench.generate();
    store.setPalette(bench.state.palette);
    expect(bench.state.pending).toBe(false);
  });

  it('gerar de novo com o mesmo resultado avisa que a paleta continua igual (limites #4)', () => {
    store.setHarmony('triade');
    bench.generate();
    bench.generate();
    expect(bench.state.message.text).toMatch(/Sortear o tom base/);
  });

  it('girar a matiz de um cinza na roda não deixa nada pendente (o HEX não muda; limites #5)', () => {
    store.setColor(0, Color.fromHex('#808080'));
    bench.setColor(0, store.state.palette.at(0).withHsb({ h: 120 }));
    expect(bench.state.pending).toBe(false);
  });

  it('"Usar esta paleta" limpa a mensagem da geração (limites #3)', () => {
    bench.generate();
    bench.apply();
    expect(bench.state.message.text).toBe('');
  });

  it('reset() descarta o rascunho pendente', () => {
    bench.generate();
    store.reset();
    expect(bench.state.pending).toBe(false);
  });

  it('aplicar sem nada pendente avisa e não muda nada', () => {
    const mine = store.state.palette;
    expect(bench.apply()).toBe(false);
    expect(store.state.palette.equals(mine)).toBe(true);
  });
});
