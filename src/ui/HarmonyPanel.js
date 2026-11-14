/**
 * HarmonyPanel — escolha da harmonia, da garantia (Livre / AA / AAA) e o botão "Gerar paleta" (RF-05, RF-06).
 * As harmonias aparecem em 3 grupos curtos (Lei de Hick: menos opções de cada vez).
 */
import { GuardLevel } from '../domain/guard/ContrastGuard.js';
import { StoreEvent } from '../app/PaletteStore.js';
import { ColorWheel } from './ColorWheel.js';
import { Dom } from './Dom.js';
import { Icons } from './Icons.js';

const GROUPS = Object.freeze([
  ['classica', 'Clássicas'],
  ['matematica', 'Matemáticas'],
  ['contraste', 'Pensada para contraste'],
]);

const GUARDS = Object.freeze([
  [GuardLevel.NONE, 'Livre (harmonia pura)'],
  [GuardLevel.AA, 'Garantir AA (texto legível)'],
  [GuardLevel.AAA, 'Garantir AAA (contraste máximo)'],
]);

/** Explicações dos botões "?" deste painel (RF-23). */
const HELP = Object.freeze({
  matematica: 'Proporção áurea e Fibonacci usam números famosos da natureza (1,618 e 1, 2, 3, 5, 8, 13…) para decidir o quanto cada cor gira no círculo e o quanto escurece. Veja a seção "Aprenda" para os detalhes.',
  contraste: 'A âncora de contraste foi criada pensando em leitura: uma cor bem escura, uma bem clara e um destaque que aparece bem sobre as duas.',
  garantia: 'Livre mostra a harmonia "pura", mesmo que fique difícil de ler. Garantir AA ajusta só o brilho até um texto normal ficar legível (4,5:1). Garantir AAA vai até o nível mais exigente (7:1). A matiz da harmonia não muda.',
});

export class HarmonyPanel {
  #root;
  #store;
  #bus;
  #desc;
  #callout;
  #awaiting = false;

  constructor({ root, store, bus }) {
    this.#root = root;
    this.#store = store;
    this.#bus = bus;
  }

  mount() {
    const wheelRoot = Dom.el('div', { class: 'wheel' });
    const name = Dom.uid('harmonia');
    const guardName = Dom.uid('garantia');

    const groups = GROUPS.map(([group, legend]) => Dom.el('fieldset', { class: 'chip-group' }, [
      Dom.el('legend', { text: legend }),
      ...this.#help(group),
      Dom.el('div', { class: 'chips' }, this.#store.harmonies.byGroup(group).map((h) => this.#chip(name, h.id, h.name, () => this.#store.setHarmony(h.id)))),
    ]));
    this.#desc = Dom.el('p', { class: 'harmony__desc', 'aria-live': 'polite' });
    const guard = Dom.el('fieldset', { class: 'chip-group' }, [
      Dom.el('legend', { text: 'Contraste da paleta gerada' }),
      ...this.#help('garantia'),
      Dom.el('div', { class: 'chips' }, GUARDS.map(([level, label]) => this.#chip(guardName, level, label, () => this.#store.setGuard(level)))),
    ]);
    this.#callout = Dom.el('p', { class: 'callout', role: 'status' });
    const actions = Dom.el('div', { class: 'harmony__actions' }, [
      Dom.el('button', { type: 'button', class: 'btn btn--primary btn--lg', 'data-action': 'generate', on: { click: () => this.#generate(false) } },
        [Icons.svg('sparkle'), 'Gerar paleta']),
      Dom.el('button', { type: 'button', class: 'btn btn--ghost', 'data-action': 'random-base', on: { click: () => this.#generate(true) } },
        [Icons.svg('shuffle'), 'Sortear o tom base']),
    ]);

    Dom.replace(this.#root, [
      wheelRoot,
      Dom.el('div', { class: 'harmony__controls' }, [...groups, this.#desc, guard, actions, this.#callout]),
    ]);
    new ColorWheel({ root: wheelRoot, store: this.#store, bus: this.#bus }).mount();

    this.#bus.on(StoreEvent.SETTINGS, () => this.#render());
    this.#bus.on(StoreEvent.MESSAGE, (m) => {
      if (!this.#awaiting) return;
      this.#awaiting = false;
      this.#callout.textContent = m.text;
      this.#callout.classList.toggle('callout--warning', m.kind === 'warning');
    });
    this.#render();
  }

  /** Botão "O que é isso?" + painel de explicação (ligados depois pelo InfoTips). */
  #help(key) {
    if (!HELP[key]) return [];
    return [
      Dom.el('button', { type: 'button', class: 'info-btn', 'data-info': `harmonia-${key}` }, 'O que é isso?'),
      Dom.el('div', { class: 'info-panel', id: `info-harmonia-${key}`, hidden: true, text: HELP[key] }),
    ];
  }

  #chip(name, value, label, onChange) {
    return Dom.el('label', { class: 'chip' }, [
      Dom.el('input', { type: 'radio', name, value, on: { change: onChange } }),
      Dom.el('span', { text: label }),
    ]);
  }

  #generate(random) {
    this.#awaiting = true;
    this.#store.generate({ random });
  }

  #render() {
    const { harmonyId, guardLevel } = this.#store.state;
    for (const input of this.#root.querySelectorAll('input[type="radio"]')) {
      input.checked = input.value === harmonyId || input.value === guardLevel;
    }
    const h = this.#store.harmonies.get(harmonyId);
    this.#desc.textContent = `${h.name}: ${h.description}`;
  }
}
