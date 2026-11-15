// @vitest-environment jsdom
// Integração da interface com o estado (RF-01 a RF-04, RF-19 a RF-23), num DOM simulado (jsdom).
import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../../src/app/EventBus.js';
import { PaletteStore } from '../../src/app/PaletteStore.js';
import { GestureRecorder } from '../../src/app/GestureRecorder.js';
import { RandomSource } from '../../src/infra/RandomSource.js';
import { ColorSlots } from '../../src/ui/ColorSlots.js';
import { HsbSliderPanel } from '../../src/ui/HsbSliderPanel.js';
import { ComparisonGrid } from '../../src/ui/ComparisonGrid.js';
import { PresetBar } from '../../src/ui/PresetBar.js';
import { HistoryToolbar } from '../../src/ui/HistoryToolbar.js';
import { HeroArt } from '../../src/ui/HeroArt.js';
import { PaletteGate } from '../../src/ui/PaletteGate.js';
import { HarmonyPanel } from '../../src/ui/HarmonyPanel.js';
import { ColorGradingPanel } from '../../src/ui/ColorGradingPanel.js';
import { HarmonyWorkbench } from '../../src/app/HarmonyWorkbench.js';
import { Palette } from '../../src/domain/palette/Palette.js';

const fakeClipboard = () => ({ copied: [], async copy(t) { this.copied.push(t); return true; } });
const fakeToast = () => ({ messages: [], show(t) { this.messages.push(t); } });
const type = (input, value, events = ['input']) => {
  input.value = value;
  for (const e of events) input.dispatchEvent(new Event(e, { bubbles: true }));
};

let bus;
let store;
let root;

beforeEach(() => {
  document.body.innerHTML = '';
  root = document.createElement('div');
  document.body.append(root);
  bus = new EventBus();
  store = PaletteStore.create({ bus, rng: RandomSource.seeded(7) });
});

describe('GestureRecorder', () => {
  it('um gesto inteiro vira um único passo de desfazer', () => {
    const gesture = new GestureRecorder(store);
    const original = store.state.palette;
    gesture.step((opts) => store.setColor(0, store.state.palette.at(0).withHsb({ b: 50 }), opts));
    gesture.step((opts) => store.setColor(0, store.state.palette.at(0).withHsb({ b: 60 }), opts));
    gesture.end();
    store.undo();
    expect(store.state.palette.equals(original)).toBe(true);
    expect(store.canUndo).toBe(false);
  });

  it('gesto que não muda nada não grava histórico', () => {
    const gesture = new GestureRecorder(store);
    gesture.step(() => {});
    gesture.end();
    expect(store.canUndo).toBe(false);
  });
});

describe('ColorSlots', () => {
  let slots;
  let clipboard;
  let toast;

  beforeEach(() => {
    clipboard = fakeClipboard();
    toast = fakeToast();
    slots = new ColorSlots({ root, store, bus, clipboard, toast });
    slots.mount();
  });

  it('mostra 3 slots com seletor visual e campo HEX rotulados', () => {
    expect(root.querySelectorAll('.slot')).toHaveLength(3);
    const hex = root.querySelectorAll('input.input--hex');
    expect([...hex].map((i) => i.value)).toEqual(['#230023', '#F2F2F2', '#42FFFF']);
    for (const input of root.querySelectorAll('input')) {
      const label = root.querySelector(`label[for="${input.id}"]`) ?? input.getAttribute('aria-label');
      expect(label, input.outerHTML).toBeTruthy();
    }
  });

  it('digitar um HEX de 6 dígitos atualiza a paleta na hora (RF-01)', () => {
    type(root.querySelectorAll('input.input--hex')[1], '#ffcc00');
    expect(store.state.palette.at(1).hex).toBe('#FFCC00');
  });

  it('o formato curto (#abc) só vale ao terminar de digitar, sem "piscar" no meio (auditoria E23)', () => {
    const input = root.querySelectorAll('input.input--hex')[1];
    type(input, '#abc');
    expect(store.state.palette.at(1).hex).toBe('#F2F2F2');
    input.dispatchEvent(new Event('change'));
    expect(store.state.palette.at(1).hex).toBe('#AABBCC');
  });

  it('aceita HEX colado com espaços (auditoria E04)', () => {
    type(root.querySelectorAll('input.input--hex')[0], '  #12 34 56 ');
    expect(store.state.palette.at(0).hex).toBe('#123456');
  });

  it('caractere inválido mostra o erro na hora', () => {
    const input = root.querySelectorAll('input.input--hex')[0];
    type(input, '#12g');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('HEX incompleto mostra erro em texto ao sair do campo e não muda a paleta', () => {
    const input = root.querySelectorAll('input.input--hex')[0];
    type(input, '#12');
    expect(input.getAttribute('aria-invalid')).toBe('false');
    input.dispatchEvent(new Event('blur'));
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const error = document.getElementById(input.getAttribute('aria-describedby'));
    expect(error.textContent).toMatch(/3 ou 6 dígitos/);
    expect(store.state.palette.at(0).hex).toBe('#230023');
  });

  it('o seletor visual atualiza a paleta (RF-22)', () => {
    type(root.querySelectorAll('input[type="color"]')[2], '#ff0000');
    expect(store.state.palette.at(2).hex).toBe('#FF0000');
  });

  it('copiar avisa a pessoa', async () => {
    root.querySelectorAll('[data-action="copy"]')[0].click();
    await Promise.resolve();
    expect(clipboard.copied).toEqual(['#230023']);
    expect(toast.messages[0]).toMatch(/copiado/i);
  });

  it('"Ajustar" seleciona a cor em edição com aria-pressed', () => {
    const buttons = root.querySelectorAll('[data-action="select"]');
    buttons[2].click();
    expect(store.state.selectedIndex).toBe(2);
    expect(buttons[2].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('atualiza os campos quando a paleta muda por fora (ex.: desfazer)', () => {
    store.applyPreset('petroleo');
    expect(root.querySelectorAll('input.input--hex')[0].value).toBe('#071B2B');
  });
});

describe('HsbSliderPanel', () => {
  it('mexer na matiz troca só a matiz da cor selecionada (RF-02)', () => {
    new HsbSliderPanel({ root, store, bus }).mount();
    store.selectColor(2);
    const [hue] = root.querySelectorAll('input[type="range"]');
    type(hue, '90', ['input', 'change']);
    expect(store.state.palette.at(2).hsb.h).toBe(90);
    expect(hue.getAttribute('aria-valuetext')).toBe('90 graus');
    expect(root.textContent).toContain('cor C');
  });
});

describe('ComparisonGrid', () => {
  beforeEach(() => new ComparisonGrid({ root, store, bus }).mount());

  it('mostra 3 cards (um por par) com veredito em linguagem simples (RF-03, RF-23)', () => {
    const cards = root.querySelectorAll('.cmp');
    expect(cards).toHaveLength(3);
    expect(cards[0].querySelector('h3').textContent).toBe('Cores A e B');
    expect(cards[0].textContent).toContain('Excelente');
    expect(cards[2].textContent).toContain('Não use para texto');
  });

  it('cada card tem as 2 prévias (uma cor sobre a outra e o inverso) e um só valor WCAG', () => {
    const card = root.querySelectorAll('.cmp')[0];
    expect(card.querySelectorAll('.cmp__preview')).toHaveLength(2);
    expect(card.querySelectorAll('.cmp__ratio')).toHaveLength(1);
  });

  it('mostra a razão e os selos por extenso, só com WCAG (RF-04)', () => {
    const card = root.querySelectorAll('.cmp')[0];
    expect(card.textContent).toContain('17,11:1'); // 17,1195… arredondado para baixo (ADR-09)
    expect(card.textContent).toContain('Texto normal: AAA');
    expect(card.textContent).not.toMatch(/APCA/);
  });

  it('a prévia usa as cores reais do par', () => {
    const preview = root.querySelectorAll('.cmp__preview')[1];
    expect(preview.style.background).toBe('rgb(35, 0, 35)');
    expect(preview.style.color).toBe('rgb(242, 242, 242)');
  });

  it('o resumo conta as combinações boas', () => {
    expect(root.textContent).toContain('Sua paleta tem 2 de 3 combinações boas para texto.');
  });

  it('"Consertar contraste" melhora a paleta e explica (RF-20)', () => {
    store.setColor(1, store.state.palette.at(0).withHsb({ b: 30 }));
    root.querySelector('[data-action="fix-aa"]').click();
    expect(root.querySelector('.callout').textContent).toMatch(/Pronto|já atinge/);
  });
});

describe('PresetBar e HistoryToolbar', () => {
  it('aplica uma paleta pronta com um clique e permite desfazer (RF-19, RF-21)', () => {
    new PresetBar({ root, store }).mount();
    const toolbar = document.createElement('div');
    document.body.append(toolbar);
    new HistoryToolbar({ root: toolbar, store, bus, doc: document }).mount();

    const undo = toolbar.querySelector('[data-action="undo"]');
    expect(undo.getAttribute('aria-disabled')).toBe('true');
    root.querySelector('[data-preset="cafe-floresta"]').click();
    expect(store.state.palette.hexes).toEqual(['#09251C', '#F8EADC', '#A55704']);
    expect(undo.getAttribute('aria-disabled')).toBe('false');
    undo.click();
    expect(store.state.palette.hexes[0]).toBe('#230023');
  });

  it('Ctrl+Z desfaz, mas não quando a pessoa digita num campo', () => {
    const toolbar = document.createElement('div');
    document.body.append(toolbar);
    new HistoryToolbar({ root: toolbar, store, bus, doc: document }).mount();
    store.applyPreset('cafe-floresta');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
    expect(store.state.palette.hexes[0]).toBe('#230023');
  });
});

// ---------- v1.1.0 ----------

describe('PaletteGate e HeroArt (RF-25: o site abre sem paleta)', () => {
  const page = () => {
    document.body.innerHTML = `
      <a data-component="skip-link" href="#comecar">Pular</a>
      <nav><a id="link-tons" href="#tons">Tons</a></nav>
      <button data-action="start" data-gate="locked">Gerar paleta</button>
      <section id="comecar" data-gate="locked" tabindex="-1"></section>
      <div data-gate="started" hidden><section id="paleta"><h2 id="paleta-title" tabindex="-1">P1</h2></section><section id="tons"></section></div>
      <div id="hero-art"></div>`;
    Element.prototype.scrollIntoView = () => {};
    window.matchMedia = () => ({ matches: true, addEventListener() {} });
  };

  it('antes de gerar: ferramenta escondida, bolas vazias e link do menu leva ao aviso', () => {
    page();
    const toast = fakeToast();
    new PaletteGate({ doc: document, win: window, store, bus, toast }).mount();
    new HeroArt({ root: document.getElementById('hero-art'), store, bus }).mount();
    expect(document.querySelector('[data-gate="started"]').hidden).toBe(true);
    expect(document.querySelectorAll('.hero-dot--empty')).toHaveLength(3);
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    document.getElementById('link-tons').dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(toast.messages.at(-1)).toMatch(/Gerar paleta/);
  });

  it('"Gerar paleta" libera a ferramenta, pinta as bolas, avisa e leva o foco ao Passo 1', () => {
    page();
    const toast = fakeToast();
    new PaletteGate({ doc: document, win: window, store, bus, toast }).mount();
    new HeroArt({ root: document.getElementById('hero-art'), store, bus }).mount();
    document.querySelector('[data-action="start"]').click();
    expect(store.state.started).toBe(true);
    expect(document.querySelector('[data-gate="started"]').hidden).toBe(false);
    expect(document.querySelector('[data-gate="locked"]').hidden).toBe(true);
    expect(document.querySelectorAll('.hero-dot--empty')).toHaveLength(0);
    expect(document.querySelectorAll('.hero-dot')).toHaveLength(3);
    expect(document.querySelector('[data-component="skip-link"]').getAttribute('href')).toBe('#paleta');
    expect(document.activeElement.id).toBe('paleta-title');
    expect(toast.messages.at(-1)).toMatch(/Pronto/);
  });
});

describe('HarmonyPanel (RF-26: rascunho separado da paleta da pessoa)', () => {
  let bench;
  beforeEach(() => {
    store = PaletteStore.create({ bus, rng: RandomSource.seeded(3), initialPalette: Palette.fromHexes(['#3366CC', '#F5F5F5', '#FF9900']) });
    bench = HarmonyWorkbench.create({ store, bus });
    new HarmonyPanel({ root, store, bench, bus }).mount();
  });

  it('mostra as 3 etapas numeradas', () => {
    const titles = [...root.querySelectorAll('.form-step__title')].map((h) => h.textContent);
    expect(titles).toHaveLength(3);
    expect(titles[0]).toMatch(/^Etapa 1 de 3: Escolha o tipo de harmonia/);
    expect(titles[1]).toMatch(/^Etapa 2 de 3: Escolha o contraste/);
    expect(titles[2]).toMatch(/^Etapa 3 de 3/);
  });

  it('gerar não muda a paleta da pessoa; "Usar esta paleta" muda', () => {
    const mine = store.state.palette;
    const apply = root.querySelector('[data-action="apply-draft"]');
    expect(apply.getAttribute('aria-disabled')).toBe('true');
    root.querySelector('[data-action="generate"]').click();
    expect(store.state.palette.equals(mine)).toBe(true);
    expect(apply.getAttribute('aria-disabled')).toBe('false');
    const draft = bench.state.palette;
    apply.click();
    expect(store.state.palette.equals(draft)).toBe(true);
    expect(root.querySelector('.callout').textContent).toMatch(/Desfazer/);
  });

  it('descartar devolve o rascunho para a paleta da pessoa', () => {
    root.querySelector('[data-action="generate"]').click();
    root.querySelector('[data-action="discard-draft"]').click();
    expect(bench.state.pending).toBe(false);
    expect(root.querySelector('.callout').textContent).toMatch(/descartada/);
  });
});

describe('ColorGradingPanel: legenda das 3 cores (v1.1.0)', () => {
  it('diz qual cor vai nas sombras, nos meios-tons e nas luzes, e atualiza com a paleta', () => {
    store = PaletteStore.create({ bus, initialPalette: Palette.fromHexes(['#FFFF00', '#000080', '#FF0000']) });
    new ColorGradingPanel({ root, store, bus, toast: fakeToast(), downloader: {}, win: window }).mount();
    const items = [...root.querySelectorAll('.grade-legend__list li')].map((li) => li.textContent);
    expect(items[0]).toMatch(/Sombras.*cor B #000080/);
    expect(items[1]).toMatch(/Meios-tons.*cor C #FF0000/);
    expect(items[2]).toMatch(/Luzes.*cor A #FFFF00/);
    expect(root.querySelectorAll('input[type="radio"]')).toHaveLength(2);
  });
});
