/**
 * UrlStateCodec — guarda a paleta no endereço da página (RF-11).
 * Formato: ?p=rrggbb-rrggbb-rrggbb (ex.: paletres/?p=230023-f2f2f2-42ffff).
 *
 * Por que na query string (?p=) e não no hash (#)? O hash é usado pelas âncoras do menu
 * (#paleta, #tons…). Se a paleta morasse no hash, clicar no menu apagaria a paleta do link.
 * Gravamos com history.replaceState: a página não recarrega e o histórico não enche.
 * Links antigos (#rrggbb-rrggbb-rrggbb) continuam sendo lidos.
 * A janela (window) é injetada: nos testes passamos um objeto falso.
 */
import { Color } from '../domain/color/Color.js';
import { Palette } from '../domain/palette/Palette.js';

const PART = /^([0-9a-f]{3}|[0-9a-f]{6})$/i;
const LEGACY_HASH = /^#([0-9a-f]{3}|[0-9a-f]{6})(-([0-9a-f]{3}|[0-9a-f]{6})){2}$/i;

export class UrlStateCodec {
  #win;

  constructor(win) {
    this.#win = win;
  }

  static encode(palette) {
    return palette.hexes.map((h) => h.slice(1).toLowerCase()).join('-');
  }

  /** @returns {Palette|null} null quando o texto não é uma paleta válida */
  static decode(value) {
    const parts = String(value ?? '').replace(/^#/, '').split('-');
    if (parts.length !== Palette.SIZE || !parts.every((p) => PART.test(p))) return null;
    return new Palette(parts.map((p) => Color.fromHex(p)));
  }

  #param() {
    return new URLSearchParams(this.#win.location.search ?? '').get('p');
  }

  read() {
    const param = this.#param();
    if (param !== null) return UrlStateCodec.decode(param);
    const { hash } = this.#win.location;
    return LEGACY_HASH.test(hash ?? '') ? UrlStateCodec.decode(hash) : null;
  }

  /**
   * Só o formato antigo (#rrggbb-rrggbb-rrggbb). Usado no evento "hashchange": clicar numa
   * âncora do menu (#tons) também muda o hash, e isso NÃO pode mexer na paleta.
   */
  readLegacyHash() {
    const { hash } = this.#win.location;
    return LEGACY_HASH.test(hash ?? '') ? UrlStateCodec.decode(hash) : null;
  }

  /** O link trouxe ?p= mas ele não é uma paleta válida (ex.: 2 ou 4 cores). */
  hasInvalid() {
    const param = this.#param();
    return param !== null && UrlStateCodec.decode(param) === null;
  }

  write(palette) {
    const { hash } = this.#win.location;
    const keepHash = hash && !LEGACY_HASH.test(hash) ? hash : '';
    this.#win.history.replaceState(null, '', `?p=${UrlStateCodec.encode(palette)}${keepHash}`);
  }

  /** Tira a paleta (?p=) do endereço, mantendo a âncora do menu (#paleta…), se houver. */
  clear() {
    const { hash, pathname } = this.#win.location;
    const keepHash = hash && !LEGACY_HASH.test(hash) ? hash : '';
    this.#win.history.replaceState(null, '', `${pathname}${keepHash}`);
  }

  shareUrl(palette) {
    const { origin, pathname } = this.#win.location;
    return `${origin}${pathname}?p=${UrlStateCodec.encode(palette)}`;
  }
}
