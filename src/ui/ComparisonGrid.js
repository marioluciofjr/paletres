/**
 * ComparisonGrid — o resumo da paleta e os 3 cards de contraste, um por par (RF-03, RF-20, RF-23).
 *
 * v1.1.0: na WCAG, "A sobre B" e "B sobre A" têm o mesmo número. Então cada par vira UM card,
 * com as duas prévias lado a lado (porque a aparência muda) e um só valor.
 *
 * Ordem de leitura de cada card (pensada para quem não é designer):
 *  1. as 2 prévias (texto de verdade sobre o fundo de verdade, nos dois sentidos);
 *  2. o veredito em linguagem simples;
 *  3. os números: razão WCAG e selos por extenso.
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
      : `Combinação mais fraca: cores ${worst.first.label} e ${worst.second.label} (${NumberFormat.ratio(worst.ratio)}). ${worstVerdict.title}.`;
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
    const previews = Dom.el('div', { class: 'cmp__previews' }, [
      this.#preview(c.first, c.second),
      this.#preview(c.second, c.first),
    ]);
    const badges = Dom.el('ul', { class: 'badges', 'aria-label': 'Níveis WCAG' }, CRITERIA.map(([key, name]) => {
      const level = c.levels[key];
      return Dom.el('li', { class: `badge${level === Level.FAIL ? ' badge--fail' : ''}` },
        [Icons.svg(BADGE_ICON[level]), `${name}: ${level}`]);
    }));
    return Dom.el('li', { class: 'cmp card zone-roxo' }, [
      Dom.el('h3', { class: 'cmp__title', text: `Cores ${c.first.label} e ${c.second.label}` }),
      previews,
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
    ]);
  }

  /** Uma prévia: a cor "text" escrita sobre a cor "background". A legenda fica fora da cor. */
  #preview(text, background) {
    return Dom.el('figure', { class: 'cmp__fig' }, [
      Dom.el('div', {
        class: 'cmp__preview frame',
        style: { background: background.color.hex, color: text.color.hex },
        'aria-label': `Exemplo: texto ${text.label} (${text.color.hex}) sobre fundo ${background.label} (${background.color.hex})`,
        role: 'img',
      }, [
        Dom.el('span', { class: 'cmp__aa', 'aria-hidden': 'true', text: 'Aa' }),
        Dom.el('p', { class: 'cmp__sample', 'aria-hidden': 'true', text: 'Texto de exemplo.' }),
      ]),
      Dom.el('figcaption', { class: 'cmp__caption', 'aria-hidden': 'true', text: `${text.label} sobre ${background.label}` }),
    ]);
  }

  #announce(text) {
    clearTimeout(this.#liveTimer);
    this.#liveTimer = setTimeout(() => { this.#live.textContent = text; }, 700);
  }
}
