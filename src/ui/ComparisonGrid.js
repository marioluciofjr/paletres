/**
 * ComparisonGrid — o resumo da paleta e os 6 cards de contraste (RF-03, RF-04, RF-20, RF-23).
 *
 * Ordem de leitura de cada card (pensada para quem não é designer):
 *  1. a prévia (texto de verdade sobre o fundo de verdade);
 *  2. o veredito em linguagem simples;
 *  3. os números: razão WCAG, selos por extenso e APCA.
 * Uma região "aria-live" anuncia o pior par para leitores de tela, com uma pausa
 * (debounce) para não falar a cada movimento de slider.
 */
import { PaletteComparator } from '../domain/contrast/PaletteComparator.js';
import { PlainVerdict } from '../domain/contrast/PlainVerdict.js';
import { Level } from '../domain/contrast/ContrastEvaluator.js';
import { GuardLevel } from '../domain/guard/ContrastGuard.js';
import { NumberFormat } from '../domain/format/NumberFormat.js';
import { StoreEvent } from '../app/PaletteStore.js';
import { Dom } from './Dom.js';
import { Icons } from './Icons.js';

const CRITERIA = Object.freeze([
  ['normalText', 'Texto normal'],
  ['largeText', 'Texto grande'],
  ['ui', 'Componentes'],
]);

const BADGE_ICON = Object.freeze({ [Level.AAA]: 'check-double', [Level.AA]: 'check', [Level.FAIL]: 'x' });

export class ComparisonGrid {
  #root;
  #store;
  #bus;
  #comparator;
  #verdict;
  #summary;
  #worst;
  #callout;
  #grid;
  #live;
  #liveTimer = null;
  #showMessage = false;
  #mounted = false;

  constructor({ root, store, bus, comparator = new PaletteComparator(), verdict = new PlainVerdict() }) {
    this.#root = root;
    this.#store = store;
    this.#bus = bus;
    this.#comparator = comparator;
    this.#verdict = verdict;
  }

  mount() {
    this.#summary = Dom.el('p', { class: 'summary__text' });
    this.#worst = Dom.el('p', { class: 'summary__worst' });
    const actions = Dom.el('div', { class: 'summary__actions' }, [
      Dom.el('button', { type: 'button', class: 'btn btn--primary', 'data-action': 'fix-aa', on: { click: () => this.#fix(GuardLevel.AA) } },
        [Icons.svg('wand'), 'Consertar contraste (AA)']),
      Dom.el('button', { type: 'button', class: 'btn btn--ghost', 'data-action': 'fix-aaa', on: { click: () => this.#fix(GuardLevel.AAA) } },
        'Consertar para AAA'),
    ]);
    this.#callout = Dom.el('p', { class: 'callout', role: 'status' });
    this.#grid = Dom.el('ul', { class: 'cmp-grid' });
    this.#live = Dom.el('p', { class: 'visually-hidden', 'aria-live': 'polite' });

    Dom.replace(this.#root, [
      Dom.el('div', { class: 'summary card zone-roxo' }, [
        Dom.el('div', {}, [this.#summary, this.#worst]),
        actions,
      ]),
      this.#callout,
      this.#grid,
      this.#live,
    ]);

    this.#bus.on(StoreEvent.PALETTE, () => this.#render());
    this.#bus.on(StoreEvent.MESSAGE, (message) => {
      if (!this.#showMessage) return;
      this.#showMessage = false;
      clearTimeout(this.#liveTimer);
      this.#callout.textContent = message.text;
      this.#callout.classList.toggle('callout--warning', message.kind === 'warning');
    });
    this.#render();
  }

  #fix(level) {
    this.#showMessage = true;
    this.#store.fixContrast(level);
  }

  #render() {
    const comparisons = this.#comparator.compare(this.#store.state.palette);
    const summary = this.#verdict.summary(comparisons);
    const worst = comparisons.reduce((min, c) => (c.ratio < min.ratio ? c : min));
    const worstVerdict = this.#verdict.of(worst.ratio);

    const repeated = this.#store.state.palette.distinctCount() < 3;
    this.#summary.textContent = summary.text;
    this.#worst.textContent = repeated
      ? 'Atenção: a paleta tem cores repetidas. Troque pelo menos uma para comparar de verdade.'
      : `Combinação mais fraca: ${worst.text.label} sobre ${worst.background.label} (${NumberFormat.ratio(worst.ratio)}). ${worstVerdict.title}.`;
    Dom.replace(this.#grid, comparisons.map((c) => this.#card(c)));
    // Ao carregar a página e durante o "Consertar" (o aviso da correção já fala), ficamos em silêncio.
    if (this.#mounted && !this.#showMessage) {
      this.#callout.textContent = '';
      this.#announce(`${summary.text} ${this.#worst.textContent}`);
    }
    this.#mounted = true;
  }

  #card(c) {
    const v = this.#verdict.of(c.ratio);
    const t = c.text.label;
    const b = c.background.label;
    const preview = Dom.el('div', {
      class: 'cmp__preview frame',
      style: { background: c.background.color.hex, color: c.text.color.hex },
      'aria-label': `Exemplo: texto ${c.text.color.hex} sobre fundo ${c.background.color.hex}`,
      role: 'img',
    }, [
      Dom.el('span', { class: 'cmp__aa', 'aria-hidden': 'true', text: 'Aa' }),
      Dom.el('p', { class: 'cmp__sample', 'aria-hidden': 'true', text: 'Um texto de exemplo para ler.' }),
    ]);
    const badges = Dom.el('ul', { class: 'badges', 'aria-label': 'Níveis WCAG' }, CRITERIA.map(([key, name]) => {
      const level = c.levels[key];
      return Dom.el('li', { class: `badge${level === Level.FAIL ? ' badge--fail' : ''}` },
        [Icons.svg(BADGE_ICON[level]), `${name}: ${level}`]);
    }));
    return Dom.el('li', { class: 'cmp card zone-roxo' }, [
      Dom.el('h3', { class: 'cmp__title', text: `Texto ${t} sobre fundo ${b}` }),
      preview,
      Dom.el('div', { class: 'cmp__verdict' }, [
        Icons.svg(v.icon),
        Dom.el('span', { class: 'cmp__verdict-title', text: v.title }),
        Dom.el('p', { class: 'cmp__verdict-text', text: v.text.charAt(0).toUpperCase() + v.text.slice(1) }),
      ]),
      Dom.el('p', { class: 'cmp__ratio' }, [
        NumberFormat.ratio(c.ratio),
        Dom.el('small', { text: 'Razão de contraste WCAG 2.2' }),
      ]),
      badges,
      Dom.el('p', { class: 'cmp__apca', text: `APCA Lc ${NumberFormat.decimal(c.apca.lc, 1)} · ${c.apca.description}` }),
    ]);
  }

  #announce(text) {
    clearTimeout(this.#liveTimer);
    this.#liveTimer = setTimeout(() => { this.#live.textContent = text; }, 700);
  }
}
