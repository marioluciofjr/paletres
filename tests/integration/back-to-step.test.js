// @vitest-environment jsdom
// Integração do botão "Voltar ao Passo 1" (RF-36) num DOM simulado.
// O jsdom não calcula layout: simulamos a posição da seção com um getBoundingClientRect falso.
import { describe, it, expect, beforeEach } from 'vitest';
import { BackToStepButton } from '../../src/ui/BackToStepButton.js';

let button;
let section;
let title;
let control;

/** Faz de conta que a seção está nesta posição em relação ao topo da janela. */
const placeSection = (top, bottom) => {
  section.getBoundingClientRect = () => ({ top, bottom, left: 0, right: 0, width: 0, height: bottom - top });
};

beforeEach(() => {
  document.body.innerHTML = `
    <section id="paleta"><h2 id="paleta-title" tabindex="-1">Escolha suas 3 cores</h2></section>
    <a href="#paleta" data-component="to-step1">Voltar ao Passo 1</a>`;
  section = document.getElementById('paleta');
  title = document.getElementById('paleta-title');
  button = document.querySelector('[data-component="to-step1"]');
  control = new BackToStepButton({ button, target: section, focusTarget: title, win: window });
});

describe('BackToStepButton', () => {
  it('começa escondido enquanto o Passo 1 ainda aparece na tela', () => {
    placeSection(80, 900);
    control.mount();
    expect(button.hidden).toBe(true);
  });

  it('aparece depois que a pessoa rola para além do Passo 1', () => {
    placeSection(80, 900);
    control.mount();
    placeSection(-2000, -400);
    control.refresh();
    expect(button.hidden).toBe(false);
  });

  it('some de novo quando a pessoa volta para perto do Passo 1', () => {
    placeSection(-2000, -400);
    control.mount();
    expect(button.hidden).toBe(false);
    placeSection(-300, 500);
    control.refresh();
    expect(button.hidden).toBe(true);
  });

  it('clicar leva o foco ao título "Escolha suas 3 cores" sem mudar o endereço', () => {
    placeSection(-2000, -400);
    control.mount();
    const before = window.location.href;
    button.click();
    expect(document.activeElement).toBe(title);
    expect(window.location.href).toBe(before);
  });

  it('não some enquanto tem o foco (o foco não pode cair no <body>); some quando perde o foco', () => {
    placeSection(-2000, -400);
    control.mount();
    button.focus();
    placeSection(-300, 500); // a pessoa rolou para cima com as setas
    control.refresh();
    expect(button.hidden).toBe(false);
    button.blur();
    expect(button.hidden).toBe(true);
  });

  it('antes de gerar a paleta (ferramenta escondida, tudo em zero), fica escondido', () => {
    placeSection(0, 0);
    control.mount();
    expect(button.hidden).toBe(true);
  });
});
