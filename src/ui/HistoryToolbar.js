/**
 * HistoryToolbar — Sortear paleta, Desfazer e Refazer (RF-21), com atalhos de teclado:
 * Ctrl+Z desfaz; Ctrl+Shift+Z ou Ctrl+Y refaz (Cmd no Mac).
 *
 * - "Sortear paleta" vem primeiro: é a ação de um clique mais útil para quem está começando.
 * - Usamos aria-disabled (e não disabled): o botão continua focável, então o foco não
 *   "cai" para o início da página quando o histórico acaba.
 * - Os atalhos ficam desligados enquanto a pessoa digita num campo de texto.
 */
import { StoreEvent } from '../app/PaletteStore.js';
import { Dom } from './Dom.js';
import { Icons } from './Icons.js';

export class HistoryToolbar {
  #root;
  #store;
  #bus;
  #doc;
  #undo;
  #redo;
  #toast;

  constructor({ root, store, bus, doc = document, toast = null }) {
    this.#root = root;
    this.#store = store;
    this.#bus = bus;
    this.#doc = doc;
    this.#toast = toast;
  }

  mount() {
    const shuffle = Dom.el('button', {
      type: 'button',
      class: 'btn btn--ghost',
      'data-action': 'shuffle',
      on: { click: () => this.#store.generate({ random: true }) },
    }, [Icons.svg('shuffle'), 'Sortear paleta']);
    // Botão indisponível clicado: em vez de silêncio, explicamos o porquê.
    const undo = () => { if (!this.#store.undo()) this.#toast?.show('Nada para desfazer ainda.'); };
    const redo = () => { if (!this.#store.redo()) this.#toast?.show('Nada para refazer.'); };
    this.#undo = Dom.el('button', { type: 'button', class: 'btn btn--ghost', 'data-action': 'undo', 'aria-keyshortcuts': 'Control+Z', on: { click: undo } },
      [Icons.svg('undo'), 'Desfazer']);
    this.#redo = Dom.el('button', { type: 'button', class: 'btn btn--ghost', 'data-action': 'redo', 'aria-keyshortcuts': 'Control+Shift+Z', on: { click: redo } },
      [Icons.svg('redo'), 'Refazer']);

    Dom.replace(this.#root, [shuffle, this.#undo, this.#redo]);
    this.#bus.on(StoreEvent.HISTORY, () => this.#render());
    this.#doc.addEventListener('keydown', (e) => this.#onKey(e));
    this.#render();
  }

  #onKey(e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    const target = e.target;
    const typing = target instanceof HTMLElement && (target.isContentEditable || (target.tagName === 'INPUT' && target.type === 'text') || target.tagName === 'TEXTAREA');
    if (typing) return;
    const key = e.key.toLowerCase();
    if (key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.#store.undo();
    } else if ((key === 'z' && e.shiftKey) || key === 'y') {
      e.preventDefault();
      this.#store.redo();
    }
  }

  #render() {
    this.#undo.setAttribute('aria-disabled', String(!this.#store.canUndo));
    this.#redo.setAttribute('aria-disabled', String(!this.#store.canRedo));
  }
}
