/**
 * UrlStateCodec — guarda a paleta no endereço da página (RF-11).
 * Formato: #rrggbb-rrggbb-rrggbb (ex.: paletres/#230023-f2f2f2-42ffff).
 *
 * Usamos o "hash" (a parte depois do #) porque mudar o hash não recarrega a página
 * e funciona em qualquer hospedagem estática, como o GitHub Pages.
 * A janela (window) é injetada: nos testes passamos um objeto falso.
 */
import { Color } from '../domain/color/Color.js';
import { Palette } from '../domain/palette/Palette.js';

export class UrlStateCodec {
  #win;

  constructor(win) {
    this.#win = win;
  }

  static encode(palette) {
    return `#${palette.hexes.map((h) => h.slice(1).toLowerCase()).join('-')}`;
  }

  /** @returns {Palette|null} null quando o hash não é uma paleta válida */
  static decode(hash) {
    const parts = String(hash ?? '').replace(/^#/, '').split('-');
    if (parts.length !== Palette.SIZE || !parts.every((p) => /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(p))) return null;
    return new Palette(parts.map((p) => Color.fromHex(p)));
  }

  read() {
    return UrlStateCodec.decode(this.#win.location.hash);
  }

  /** Troca o hash sem criar uma entrada nova no histórico do navegador. */
  write(palette) {
    this.#win.history.replaceState(null, '', UrlStateCodec.encode(palette));
  }

  shareUrl(palette) {
    const { origin, pathname } = this.#win.location;
    return `${origin}${pathname}${UrlStateCodec.encode(palette)}`;
  }
}
