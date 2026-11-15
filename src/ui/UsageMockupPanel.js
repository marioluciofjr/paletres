/**
 * UsageMockupPanel — "Teste na prática": mockups de site e de app pintados com a paleta (RF-07, RF-17, RF-24).
 *
 * Papéis:
 *  - dominante (≈ 60%): fundo da página ou da tela;
 *  - secundária (≈ 30%): cabeçalho, cards e barras;
 *  - destaque (≈ 10%): botões, links ativos e o botão flutuante.
 * O texto de cada superfície usa a cor da paleta que dá mais contraste com ela, e a
 * legenda avisa quando nenhuma cor passa em AA. Assim o mockup mostra a acessibilidade real.
 *
 * v1.1.0: só a regra 60-30-10. A proporção áurea e a de Fibonacci quase não mudavam o
 * visual dos mockups, então saíram daqui (continuam nas harmonias).
 */
import { UsageProportion } from '../domain/proportion/UsageProportion.js';
import { Role } from '../domain/proportion/RoleAdvisor.js';
import { Palette } from '../domain/palette/Palette.js';
import { PlainVerdict } from '../domain/contrast/PlainVerdict.js';
import { NumberFormat } from '../domain/format/NumberFormat.js';
import { StoreEvent } from '../app/PaletteStore.js';
import { Dom } from './Dom.js';

const ROLES = Object.freeze([
  [Role.DOMINANT, 'Dominante (fundo)'],
  [Role.SECONDARY, 'Secundária (cards e barras)'],
  [Role.ACCENT, 'Destaque (botões)'],
]);

export class UsageMockupPanel {
  #root;
  #store;
  #bus;
  #verdict;
  #selects = {};
  #suggestion;
  #shareBar;
  #shareLegend;
  #site;
  #app;
  #legend;
  #live;
  #liveTimer = null;
  #lastRoles = '';

  constructor({ root, store, bus, verdict = new PlainVerdict() }) {
    this.#root = root;
    this.#store = store;
    this.#bus = bus;
    this.#verdict = verdict;
  }

  mount() {
    const roleFields = ROLES.map(([role, label]) => {
      const id = Dom.uid(`papel-${role}`);
      const select = Dom.el('select', { id, class: 'select', on: { change: () => this.#onRoleChange(role) } },
        Palette.LABELS.map((l, i) => Dom.el('option', { value: String(i), text: `Cor ${l}` })));
      this.#selects[role] = select;
      return Dom.el('div', { class: 'field' }, [Dom.el('label', { class: 'field__label', for: id, text: label }), select]);
    });
    // Texto visível, sem região viva: quem anuncia é o #live, com pausa e só quando os papéis mudam.
    this.#suggestion = Dom.el('p', { class: 'callout' });
    this.#live = Dom.el('p', { class: 'visually-hidden', 'aria-live': 'polite' });
    const roles = Dom.el('fieldset', { class: 'chip-group' }, [
      Dom.el('legend', { text: 'Quem faz o quê' }),
      Dom.el('div', { class: 'roles' }, [
        ...roleFields,
        Dom.el('button', { type: 'button', class: 'btn btn--ghost btn--sm roles__reset', 'data-action': 'reset-roles', on: { click: () => this.#store.resetRoles() } }, 'Usar a sugestão do Paletrês'),
      ]),
    ]);

    this.#shareBar = Dom.el('div', { class: 'share-bar frame', role: 'img' });
    this.#shareLegend = Dom.el('p', { class: 'share-legend' });
    this.#site = Dom.el('div', { class: 'msite frame', role: 'img' });
    this.#app = Dom.el('div', { class: 'mapp frame', role: 'img' });
    this.#legend = Dom.el('ul', { class: 'mock-legend' });

    Dom.replace(this.#root, [
      Dom.el('div', { class: 'mock-controls' }, [roles]),
      this.#suggestion,
      this.#live,
      this.#shareBar,
      this.#shareLegend,
      Dom.el('div', { class: 'mockups' }, [
        Dom.el('figure', {}, [this.#site, Dom.el('figcaption', { text: 'Exemplo em site' })]),
        Dom.el('figure', {}, [this.#app, Dom.el('figcaption', { text: 'Exemplo em app' })]),
      ]),
      this.#legend,
    ]);

    const render = () => this.#render();
    this.#bus.on(StoreEvent.PALETTE, render);
    this.#bus.on(StoreEvent.SETTINGS, render);
    this.#render();
  }

  /** Troca o papel; se a cor já estava em outro papel, os dois trocam de lugar. */
  #onRoleChange(changed) {
    const roles = { ...this.#store.state.roles };
    const next = Number(this.#selects[changed].value);
    const other = Object.keys(roles).find((r) => r !== changed && roles[r] === next);
    if (other) roles[other] = roles[changed];
    roles[changed] = next;
    this.#store.setRoles(roles);
  }

  #render() {
    const { palette, roles, rolesAuto } = this.#store.state;
    const proportion = UsageProportion.RULE;
    const d = this.#store.describeRoles();

    for (const [role] of ROLES) this.#selects[role].value = String(roles[role]);

    this.#suggestion.textContent = rolesAuto
      ? `Sugestão do Paletrês: ${this.#store.roleSuggestion().message}`
      : 'Você escolheu os papéis à mão. Clique em "Usar a sugestão do Paletrês" para voltar.';

    this.#announceRoles(roles);
    this.#renderShareBar(palette, roles, proportion);
    this.#renderSite(d);
    this.#renderApp(d);
    this.#renderLegend(d);
  }

  /** Anuncia (com pausa de 700 ms) só quando a distribuição dos papéis muda. */
  #announceRoles(roles) {
    const key = ROLES.map(([r]) => roles[r]).join();
    if (key === this.#lastRoles) return;
    const first = this.#lastRoles === '';
    this.#lastRoles = key;
    if (first) return; // não fala nada ao carregar a página
    const names = { [Role.DOMINANT]: 'fundo', [Role.SECONDARY]: 'cards e barras', [Role.ACCENT]: 'botões' };
    const text = ROLES.map(([r]) => `cor ${Palette.LABELS[roles[r]]} em ${names[r]}`).join(', ');
    clearTimeout(this.#liveTimer);
    this.#liveTimer = setTimeout(() => { this.#live.textContent = `Papéis atualizados: ${text}.`; }, 700);
  }

  #renderShareBar(palette, roles, proportion) {
    const order = [Role.DOMINANT, Role.SECONDARY, Role.ACCENT];
    const pct = proportion.shares.map((s) => NumberFormat.percent(s));
    this.#shareBar.setAttribute('aria-label', `Proporção ${proportion.name}: ${order.map((r, i) => `cor ${Palette.LABELS[roles[r]]} ${pct[i]}`).join(', ')}`);
    Dom.replace(this.#shareBar, order.map((role, i) => Dom.el('span', {
      class: 'share-bar__seg',
      style: { background: palette.at(roles[role]).hex, flexBasis: `${proportion.shares[i]}%` },
    })));
    this.#shareLegend.textContent = `${proportion.description} Na barra: dominante ${pct[0]}, secundária ${pct[1]} e destaque ${pct[2]}.`;
  }

  /** Aplica fundo e texto de uma superfície num elemento. */
  #paint(el, surface) {
    el.style.background = surface.background.hex;
    el.style.color = surface.text.hex;
    return el;
  }

  #renderSite(d) {
    const { dominant: dom, secondary: sec, accent: acc } = d;
    this.#site.setAttribute('aria-label', `Mockup de site: fundo ${dom.background.hex}, cabeçalho e cards ${sec.background.hex}, botão ${acc.background.hex}`);
    const p = (el, s) => this.#paint(el, s);
    Dom.replace(this.#site, [
      p(Dom.el('div', { class: 'msite__bar', 'aria-hidden': 'true' }, [
        ...[0, 1, 2].map(() => Dom.el('span', { class: 'msite__dot', style: { background: acc.background.hex } })),
        p(Dom.el('span', { class: 'msite__url', text: 'minhamarca.com.br' }), dom),
      ]), sec),
      p(Dom.el('div', { class: 'msite__nav', 'aria-hidden': 'true' }, [
        Dom.el('span', { text: 'Minha Marca' }),
        Dom.el('span', { class: 'msite__links' }, [Dom.el('span', { text: 'Início' }), Dom.el('span', { text: 'Serviços' }), Dom.el('span', { text: 'Contato' })]),
      ]), sec),
      p(Dom.el('div', { class: 'msite__hero', 'aria-hidden': 'true' }, [
        Dom.el('p', { class: 'msite__h', text: 'Um título que chama atenção' }),
        Dom.el('p', { class: 'msite__p', text: 'Este é um parágrafo de exemplo. Se ele estiver fácil de ler, a sua paleta funciona para textos longos.' }),
        p(Dom.el('span', { class: 'msite__btn', text: 'Quero saber mais' }), acc),
      ]), dom),
      p(Dom.el('div', { class: 'msite__cards', 'aria-hidden': 'true' },
        ['Rápido', 'Simples', 'Seguro'].map((t) => p(Dom.el('div', { class: 'msite__card' }, [Dom.el('strong', { text: t }), 'Texto curto do card.']), sec))), dom),
      p(Dom.el('div', { class: 'msite__foot', 'aria-hidden': 'true', text: '© Minha Marca · Rodapé' }), sec),
    ]);
  }

  #renderApp(d) {
    const { dominant: dom, secondary: sec, accent: acc } = d;
    this.#app.setAttribute('aria-label', `Mockup de app: tela ${dom.background.hex}, barras e cards ${sec.background.hex}, botão flutuante ${acc.background.hex}`);
    const p = (el, s) => this.#paint(el, s);
    Dom.replace(this.#app, [
      p(Dom.el('div', { class: 'mapp__status', 'aria-hidden': 'true' }, [Dom.el('span', { text: '9:41' }), Dom.el('span', { text: '5G 100%' })]), sec),
      p(Dom.el('div', { class: 'mapp__appbar', 'aria-hidden': 'true', text: 'Minhas tarefas' }), sec),
      p(Dom.el('div', { class: 'mapp__list', 'aria-hidden': 'true' }, [
        ...['Revisar a paleta', 'Testar o contraste', 'Publicar o site'].map((t, i) =>
          p(Dom.el('div', { class: 'mapp__item' }, [Dom.el('strong', { text: t }), `Até ${12 + i}/11`]), sec)),
        Dom.el('span', { text: 'Texto direto sobre o fundo da tela.' }),
      ]), dom),
      p(Dom.el('span', { class: 'mapp__fab', 'aria-hidden': 'true', text: '+' }), acc),
      p(Dom.el('div', { class: 'mapp__tabs', 'aria-hidden': 'true' }, [
        p(Dom.el('span', { class: 'mapp__tab--active', text: 'Início' }), acc),
        Dom.el('span', { text: 'Busca' }),
        Dom.el('span', { text: 'Perfil' }),
      ]), sec),
    ]);
  }

  #renderLegend(d) {
    const items = [
      ['Texto sobre o fundo (dominante)', d.dominant],
      ['Texto sobre cards e barras (secundária)', d.secondary],
      ['Texto dentro do botão (destaque)', d.accent],
    ];
    Dom.replace(this.#legend, items.map(([label, s]) => {
      const v = this.#verdict.of(s.ratio);
      return Dom.el('li', {}, [
        Dom.el('strong', { text: `${label}:` }),
        `${s.text.hex} sobre ${s.background.hex} = ${NumberFormat.ratio(s.ratio)}. ${v.title}.`,
        s.passesAA ? null : Dom.el('span', { class: 'badge badge--fail', text: 'Atenção: texto abaixo de AA' }),
      ]);
    }));
  }
}
