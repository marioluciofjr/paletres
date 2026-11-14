/**
 * ColorSlots — os 3 cartões de cor (A, B e C) da seção "Paleta" (RF-01, RF-22).
 *
 * Cada cartão tem:
 *  - o seletor visual (input type="color"): clicar no quadrado abre o conta-gotas do sistema;
 *  - o campo HEX, com validação e mensagem de erro em texto;
 *  - "Copiar" e "Ajustar" (escolhe a cor que os sliders HSB vão editar).
 */
import { Color } from '../domain/color/Color.js';
import { Palette } from '../domain/palette/Palette.js';
import { StoreEvent } from '../app/PaletteStore.js';
import { GestureRecorder } from '../app/GestureRecorder.js';
import { Dom } from './Dom.js';
import { Icons } from './Icons.js';

const ROLE_NAMES = Object.freeze({ dominant: 'fundo', secondary: 'cards e barras', accent: 'botões' });

export class ColorSlots {
  #root;
  #store;
  #bus;
  #clipboard;
  #toast;
  #gesture;
  #slots = [];

  constructor({ root, store, bus, clipboard, toast }) {
    this.#root = root;
    this.#store = store;
    this.#bus = bus;
    this.#clipboard = clipboard;
    this.#toast = toast;
    this.#gesture = new GestureRecorder(store);
  }

  mount() {
    this.#slots = Palette.LABELS.map((label, index) => this.#buildSlot(label, index));
    Dom.replace(this.#root, this.#slots.map((s) => s.card));
    const render = () => this.#render();
    this.#bus.on(StoreEvent.PALETTE, render);
    this.#bus.on(StoreEvent.SELECTION, render);
    this.#bus.on(StoreEvent.SETTINGS, render);
    this.#render();
  }

  #buildSlot(label, index) {
    const hexId = Dom.uid('hex');
    const errorId = `${hexId}-erro`;

    const role = Dom.el('span', { class: 'slot__role' });
    const swatch = Dom.el('input', {
      type: 'color',
      class: 'swatch-input',
      'aria-label': `Escolher a cor ${label} visualmente`,
      on: {
        input: (e) => this.#gesture.step((opts) => this.#store.setColor(index, Color.fromHex(e.target.value), opts)),
        change: () => this.#gesture.end(),
      },
    });
    const error = Dom.el('p', { class: 'field__error', id: errorId, 'aria-live': 'polite' });
    const hex = Dom.el('input', {
      id: hexId,
      class: 'input input--hex',
      type: 'text',
      inputmode: 'text',
      autocomplete: 'off',
      spellcheck: 'false',
      'aria-describedby': errorId,
      on: {
        input: (e) => this.#onHexInput(index, e.target, error),
        change: (e) => { this.#applyShort(index, e.target); this.#gesture.end(); },
        blur: (e) => this.#onHexBlur(index, e.target, error),
      },
    });
    const copy = Dom.el('button', {
      type: 'button',
      class: 'btn btn--ghost btn--sm',
      'data-action': 'copy',
      'aria-label': `Copiar HEX da cor ${label}`,
      on: { click: () => this.#copy(index) },
    }, [Icons.svg('copy'), 'Copiar']);
    const select = Dom.el('button', {
      type: 'button',
      class: 'btn btn--ghost btn--sm',
      'data-action': 'select',
      'aria-pressed': 'false',
      'aria-label': `Ajustar a cor ${label} com Matiz, Saturação e Brilho`,
      on: { click: () => this.#store.selectColor(index) },
    }, [Icons.svg('edit'), 'Ajustar']);

    const titleId = Dom.uid('cor-titulo');
    const card = Dom.el('article', { class: 'slot card zone-roxo', 'aria-labelledby': titleId }, [
      Dom.el('div', { class: 'slot__head' }, [Dom.el('h3', { id: titleId, text: `Cor ${label}` }), role]),
      swatch,
      Dom.el('div', { class: 'field' }, [
        Dom.el('label', { class: 'field__label', for: hexId, text: `Código HEX da cor ${label}` }),
        hex,
        error,
      ]),
      Dom.el('div', { class: 'slot__actions' }, [copy, select]),
    ]);
    return { card, role, swatch, hex, error, select };
  }

  #onHexInput(index, input, error) {
    const value = Color.normalizeInput(input.value);
    if (!Color.isValidHex(value)) {
      // Valor incompleto (ex.: "#12"): a pessoa ainda está digitando, então só avisamos ao sair do campo.
      // Caractere inválido (ex.: "#12g") ou longo demais: avisamos na hora.
      const stillTyping = /^#?[0-9a-f]{0,5}$/i.test(value);
      this.#setError(input, error, stillTyping ? '' : this.#errorText(value));
      return;
    }
    this.#setError(input, error, '');
    // Enquanto digita, só aplicamos o formato completo (6 dígitos). Assim, digitar "#ffcc00"
    // não aplica "#fff" no meio do caminho. O formato curto (#abc) vale ao terminar (change/blur).
    if (value.replace('#', '').length !== 6) return;
    this.#gesture.step((opts) => this.#store.setColor(index, Color.fromHex(value), opts));
  }

  /** Ao terminar de digitar: aplica também o formato curto (#abc). */
  #applyShort(index, input) {
    const value = Color.normalizeInput(input.value);
    if (Color.isValidHex(value) && value.replace('#', '').length === 3) {
      this.#gesture.step((opts) => this.#store.setColor(index, Color.fromHex(value), opts));
    }
  }

  #onHexBlur(index, input, error) {
    this.#applyShort(index, input);
    this.#gesture.end();
    // Ao sair do campo com um valor incompleto, avisamos.
    const value = Color.normalizeInput(input.value);
    if (!Color.isValidHex(value)) this.#setError(input, error, this.#errorText(value));
  }

  #errorText(value) {
    return `"${value}" não é um HEX válido. Use 3 ou 6 dígitos hexadecimais, como #230023.`;
  }

  #setError(input, error, text) {
    error.textContent = text;
    input.setAttribute('aria-invalid', String(Boolean(text)));
  }

  async #copy(index) {
    const hex = this.#store.state.palette.at(index).hex;
    const ok = await this.#clipboard.copy(hex);
    this.#toast.show(ok ? `${hex} copiado.` : `Não foi possível copiar. Selecione o código ${hex} e use Ctrl+C.`);
  }

  #render() {
    const { palette, selectedIndex, roles, rolesAuto } = this.#store.state;
    const roleOf = Object.fromEntries(Object.entries(roles).map(([role, i]) => [i, ROLE_NAMES[role]]));
    this.#slots.forEach((slot, i) => {
      const color = palette.at(i);
      slot.swatch.value = color.hex.toLowerCase();
      // Não sobrescreve o campo enquanto a pessoa está digitando nele.
      if (document.activeElement !== slot.hex) {
        slot.hex.value = color.hex;
        this.#setError(slot.hex, slot.error, '');
      }
      slot.role.textContent = roleOf[i] ? `${rolesAuto ? 'Sugestão' : 'Papel'}: ${roleOf[i]}` : '';
      const selected = i === selectedIndex;
      slot.card.classList.toggle('is-selected', selected);
      slot.select.setAttribute('aria-pressed', String(selected));
    });
  }
}
