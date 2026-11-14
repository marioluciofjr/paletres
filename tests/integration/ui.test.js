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
    store.applyPreset('oceano');
    expect(root.querySelectorAll('input.input--hex')[0].value).toBe('#0B2545');
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

  it('mostra 6 cards na ordem certa com veredito em linguagem simples (RF-03, RF-23)', () => {
    const cards = root.querySelectorAll('.cmp');
    expect(cards).toHaveLength(6);
    expect(cards[0].querySelector('h3').textContent).toBe('Texto A sobre fundo B');
    expect(cards[0].textContent).toContain('Excelente');
    expect(cards[4].textContent).toContain('Não use para texto');
  });

  it('mostra a razão, os selos por extenso e o APCA (RF-04)', () => {
    const card = root.querySelectorAll('.cmp')[0];
    expect(card.textContent).toContain('17,11:1'); // 17,1195… arredondado para baixo (ADR-09)
    expect(card.textContent).toContain('Texto normal: AAA');
    expect(card.textContent).toMatch(/APCA Lc -?\d+,\d/);
  });

  it('a prévia usa as cores reais do par', () => {
    const preview = root.querySelectorAll('.cmp__preview')[1];
    expect(preview.style.background).toBe('rgb(35, 0, 35)');
    expect(preview.style.color).toBe('rgb(242, 242, 242)');
  });

  it('o resumo conta as combinações boas', () => {
    expect(root.textContent).toContain('Sua paleta tem 4 de 6 combinações boas para texto.');
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
    root.querySelector('[data-preset="cafe"]').click();
    expect(store.state.palette.hexes).toEqual(['#3E2723', '#F5EBDD', '#C47F3B']);
    expect(undo.getAttribute('aria-disabled')).toBe('false');
    undo.click();
    expect(store.state.palette.hexes[0]).toBe('#230023');
  });

  it('Ctrl+Z desfaz, mas não quando a pessoa digita num campo', () => {
    const toolbar = document.createElement('div');
    document.body.append(toolbar);
    new HistoryToolbar({ root: toolbar, store, bus, doc: document }).mount();
    store.applyPreset('cafe');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
    expect(store.state.palette.hexes[0]).toBe('#230023');
  });
});
