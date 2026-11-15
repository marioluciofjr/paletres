/**
 * HarmonyPanel — a seção de harmonias, em 3 etapas numeradas (RF-05, RF-06, RF-26).
 *
 *  Etapa 1: escolher UM tipo de harmonia (Clássicas, Matemáticas ou Pensada para contraste);
 *  Etapa 2: escolher o contraste da paleta nova (Livre, AA ou AAA);
 *  Etapa 3: gerar e comparar o rascunho com a paleta atual, e então usar ou descartar.
 *
 * v1.1.0: a paleta gerada fica num RASCUNHO (HarmonyWorkbench). A paleta da pessoa só
 * muda no clique em "Usar esta paleta". Assim ninguém acha que perdeu o que fez antes.
 * As harmonias aparecem em 3 grupos curtos (Lei de Hick: menos opções de cada vez).
 */
import { GuardLevel } from '../domain/guard/ContrastGuard.js';
import { Palette } from '../domain/palette/Palette.js';
import { StoreEvent } from '../app/PaletteStore.js';
import { DraftEvent } from '../app/HarmonyWorkbench.js';
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
  matematica: 'Proporção áurea e Fibonacci usam números famosos da natureza (1,618 e 1, 2, 3, 5, 8, 13…) para decidir o quanto cada cor gira no círculo e o quanto escurece. Veja a seção "Aprenda" para os detalhes e as fontes.',
  contraste: 'A âncora de contraste foi criada pensando em leitura: uma cor bem escura, uma bem clara e um destaque que aparece bem sobre as duas.',
  garantia: 'Livre mostra a harmonia "pura", mesmo que fique difícil de ler. Garantir AA ajusta só o brilho até um texto normal ficar legível (4,5:1). Garantir AAA vai até o nível mais exigente (7:1). A matiz da harmonia não muda.',
});

export class HarmonyPanel {
  #root;
  #store;
  #bench;
  #bus;
  #desc;
  #callout;
  #current;
  #draft;
  #draftStatus;
  #apply;
  #discard;
  #generateBtn;
  #fromDraft = false;
  #descTimer = null; // o aviso atual veio da geração do rascunho?

  constructor({ root, store, bench, bus }) {
    this.#root = root;
    this.#store = store;
    this.#bench = bench;
    this.#bus = bus;
  }

  mount() {
    const wheelRoot = Dom.el('div', { class: 'wheel' });
    Dom.replace(this.#root, [
      Dom.el('div', { class: 'harmony__wheel-col' }, [
        Dom.el('p', { class: 'harmony__wheel-title', text: 'Tom base da paleta nova (opcional)' }),
        wheelRoot,
      ]),
      Dom.el('ol', { class: 'form-steps' }, [this.#stepType(), this.#stepGuard(), this.#stepGenerate()]),
    ]);
    new ColorWheel({ root: wheelRoot, model: this.#bench, bus: this.#bus, event: DraftEvent.PALETTE }).mount();

    this.#bus.on(StoreEvent.SETTINGS, () => this.#renderSettings());
    this.#bus.on(DraftEvent.PALETTE, () => this.#renderDraft());
    // A coluna "sua paleta atual" acompanha os passos 1 a 4 mesmo com um rascunho pendente.
    this.#bus.on(StoreEvent.PALETTE, () => this.#renderDraft());
    this.#renderSettings();
    this.#renderDraft();
  }

  // ---------- as 3 etapas ----------

  #stepType() {
    const name = Dom.uid('harmonia');
    const groups = GROUPS.map(([group, legend]) => Dom.el('fieldset', { class: 'chip-group chip-group--sub' }, [
      Dom.el('legend', { text: legend }),
      ...this.#help(group),
      Dom.el('div', { class: 'chips' }, this.#store.harmonies.byGroup(group).map((h) => this.#chip(name, h.id, h.name, () => this.#store.setHarmony(h.id)))),
    ]));
    this.#desc = Dom.el('p', { class: 'harmony__desc', 'aria-live': 'polite' });
    return this.#step(1, 'Escolha o tipo de harmonia', 'Marque só uma opção, de qualquer um dos 3 grupos.', [...groups, this.#desc]);
  }

  #stepGuard() {
    const name = Dom.uid('garantia');
    return this.#step(2, 'Escolha o contraste da paleta nova', 'Com AA ou AAA, o Paletrês ajusta o brilho para o texto ficar legível.', [
      ...this.#help('garantia'),
      Dom.el('div', { class: 'chips' }, GUARDS.map(([level, label]) => this.#chip(name, level, label, () => this.#store.setGuard(level)))),
    ]);
  }

  #stepGenerate() {
    this.#callout = Dom.el('p', { class: 'callout', role: 'status' });
    this.#current = Dom.el('div', { class: 'draft__swatches', role: 'img' });
    this.#draft = Dom.el('div', { class: 'draft__swatches', role: 'img' });
    this.#draftStatus = Dom.el('p', { class: 'draft__status' });
    this.#apply = Dom.el('button', { type: 'button', class: 'btn btn--primary', 'data-action': 'apply-draft', 'aria-disabled': 'true', on: { click: () => this.#onApply() } },
      [Icons.svg('check'), 'Usar esta paleta']);
    this.#discard = Dom.el('button', { type: 'button', class: 'btn btn--ghost', 'data-action': 'discard-draft', 'aria-disabled': 'true', on: { click: () => this.#onDiscard() } },
      'Descartar a paleta nova');
    return this.#step(3, 'Gere, compare e decida', 'A paleta nova aparece ao lado da sua. A sua só muda se você clicar em "Usar esta paleta".', [
      Dom.el('div', { class: 'harmony__actions' }, [
        this.#generateBtn = Dom.el('button', { type: 'button', class: 'btn btn--primary btn--lg', 'data-action': 'generate', on: { click: () => this.#bench.generate() } },
          [Icons.svg('sparkle'), 'Gerar paleta nova']),
        Dom.el('button', { type: 'button', class: 'btn btn--ghost', 'data-action': 'random-base', on: { click: () => this.#bench.generate({ random: true }) } },
          [Icons.svg('shuffle'), 'Sortear o tom base']),
      ]),
      this.#callout,
      Dom.el('div', { class: 'draft' }, [
        Dom.el('div', { class: 'draft__col' }, [Dom.el('p', { class: 'draft__label', text: 'Sua paleta atual (passos 1 a 4)' }), this.#current]),
        Dom.el('div', { class: 'draft__col' }, [Dom.el('p', { class: 'draft__label', text: 'Paleta nova (rascunho)' }), this.#draft, this.#draftStatus]),
      ]),
      Dom.el('div', { class: 'harmony__actions' }, [this.#apply, this.#discard]),
    ]);
  }

  /** Uma etapa numerada: número grande + título + dica + conteúdo. */
  #step(n, title, hint, children) {
    const titleId = Dom.uid(`etapa-${n}`);
    return Dom.el('li', { class: 'form-step' }, [
      Dom.el('span', { class: 'form-step__n', 'aria-hidden': 'true', text: String(n) }),
      Dom.el('div', { class: 'form-step__body', role: 'group', 'aria-labelledby': titleId }, [
        Dom.el('h3', { class: 'form-step__title', id: titleId, text: `Etapa ${n} de 3: ${title}` }),
        Dom.el('p', { class: 'form-step__hint', text: hint }),
        ...children,
      ]),
    ]);
  }

  /** Botão "O que é isso?" + painel de explicação (ligados depois pelo InfoTips). */
  #help(key) {
    if (!HELP[key]) return [];
    // Nome acessível único (começa pelo texto visível, como pede a WCAG 2.5.3).
    const topic = { matematica: 'harmonias matemáticas', contraste: 'harmonia de contraste', garantia: 'garantia de contraste' }[key];
    return [
      Dom.el('button', { type: 'button', class: 'info-btn', 'data-info': `harmonia-${key}`, 'aria-label': `O que é isso? ${topic}` }, 'O que é isso?'),
      Dom.el('div', { class: 'info-panel', id: `info-harmonia-${key}`, hidden: true, text: HELP[key] }),
    ];
  }

  #chip(name, value, label, onChange) {
    return Dom.el('label', { class: 'chip' }, [
      Dom.el('input', { type: 'radio', name, value, on: { change: onChange } }),
      Dom.el('span', { text: label }),
    ]);
  }

  // ---------- ações ----------

  #onApply() {
    if (!this.#bench.apply()) {
      this.#say('Ainda não há paleta nova. Clique em "Gerar paleta nova" primeiro.');
      return;
    }
    this.#say(this.#store.state.message.text);
  }

  #onDiscard() {
    if (!this.#bench.state.pending) {
      this.#say('Não há paleta nova para descartar.');
      return;
    }
    this.#bench.discard();
    this.#say('Paleta nova descartada. A sua paleta continua a mesma.');
  }

  /**
   * Escreve no aviso (região de status). Se o texto for igual ao anterior, o leitor de tela
   * não anunciaria de novo: por isso esvaziamos e escrevemos no quadro seguinte (auditoria A11Y-05).
   */
  #say(text, kind = 'info') {
    this.#fromDraft = false;
    this.#callout.classList.toggle('callout--warning', kind === 'warning');
    if (this.#callout.textContent !== text) {
      this.#callout.textContent = text;
      return;
    }
    this.#callout.textContent = '';
    requestAnimationFrame(() => { this.#callout.textContent = text; });
  }

  // ---------- desenho ----------

  #renderSettings() {
    const { harmonyId, guardLevel } = this.#store.state;
    for (const input of this.#root.querySelectorAll('input[type="radio"]')) {
      input.checked = input.value === harmonyId || input.value === guardLevel;
    }
    const h = this.#store.harmonies.get(harmonyId);
    const text = `Escolhida: ${h.name}. ${h.description}`;
    // Só reescreve (e o leitor de tela só anuncia) quando a harmonia mudou de fato, e com uma
    // pausa: andar com as setas pelos rádios não dispara um anúncio a cada opção (a11y-web B1).
    clearTimeout(this.#descTimer);
    if (this.#desc.textContent === text) return;
    if (!this.#desc.textContent) this.#desc.textContent = text;
    else this.#descTimer = setTimeout(() => { this.#desc.textContent = text; }, 600);
  }

  #renderDraft() {
    const { palette: draft, pending, message } = this.#bench.state;
    this.#paint(this.#current, this.#store.state.palette, 'Sua paleta atual');
    this.#paint(this.#draft, draft, pending ? 'Paleta nova' : 'Paleta nova, ainda igual à sua');
    this.#draftStatus.textContent = pending ? 'Pronta para usar.' : 'Ainda igual à sua. Clique em "Gerar paleta nova".';
    this.#apply.setAttribute('aria-disabled', String(!pending));
    this.#discard.setAttribute('aria-disabled', String(!pending));
    // Um só botão preenchido por vez (Lei de Hick): com rascunho, o destaque passa para "Usar esta paleta".
    this.#generateBtn.classList.toggle('btn--primary', !pending);
    this.#generateBtn.classList.toggle('btn--ghost', pending);
    // A mensagem da geração (só quando há rascunho novo) vai para a região de status.
    if (pending && message.text && this.#callout.textContent !== message.text) {
      this.#say(message.text, message.kind);
      this.#fromDraft = true;
    } else if (!pending && this.#fromDraft) {
      // O rascunho deixou de existir (ex.: a paleta da pessoa ficou igual): o aviso da geração sai (A11Y-06).
      this.#callout.textContent = '';
      this.#fromDraft = false;
    }
  }

  #paint(target, palette, label) {
    target.setAttribute('aria-label', `${label}: ${palette.hexes.map((h, i) => `cor ${Palette.LABELS[i]} ${h}`).join(', ')}`);
    // O código fica embaixo da amostra (no fundo da página), nunca em cima da cor da pessoa.
    Dom.replace(target, palette.colors.map((c, i) => Dom.el('span', { class: 'draft__item' }, [
      Dom.el('span', { class: 'draft__swatch frame', style: { background: c.hex } }),
      Dom.el('span', { class: 'draft__hex', 'aria-hidden': 'true', text: `${Palette.LABELS[i]} ${c.hex}` }),
    ])));
  }
}
