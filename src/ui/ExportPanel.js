/**
 * ExportPanel — baixar a imagem, copiar/baixar CSS e JSON e copiar o link (RF-10, RF-11).
 */
import { PngLayout } from '../domain/export/PngLayout.js';
import { StoreEvent } from '../app/PaletteStore.js';
import { Dom } from './Dom.js';
import { Icons } from './Icons.js';

export class ExportPanel {
  #root;
  #store;
  #bus;
  #exporters;
  #codec;
  #clipboard;
  #toast;
  #png;
  #downloader;
  #preview;
  #codes = new Map();
  #link;

  constructor({ root, store, bus, exporters, codec, clipboard, toast, png, downloader }) {
    this.#root = root;
    this.#store = store;
    this.#bus = bus;
    this.#exporters = exporters;
    this.#codec = codec;
    this.#clipboard = clipboard;
    this.#toast = toast;
    this.#png = png;
    this.#downloader = downloader;
  }

  mount() {
    this.#preview = Dom.el('div', { class: 'export__preview frame', role: 'img' });
    const image = Dom.el('article', { class: 'export__card card zone-roxo' }, [
      Dom.el('h3', { text: 'Imagem da paleta (PNG)' }),
      this.#preview,
      Dom.el('div', { class: 'export__actions' }, [
        Dom.el('button', { type: 'button', class: 'btn btn--primary', 'data-action': 'png', on: { click: () => this.#downloadPng() } },
          [Icons.svg('download'), 'Baixar PNG']),
      ]),
    ]);

    const linkId = Dom.uid('link');
    this.#link = Dom.el('input', { id: linkId, class: 'input', type: 'text', readonly: true, on: { focus: (e) => e.target.select() } });
    const link = Dom.el('article', { class: 'export__card card zone-roxo' }, [
      Dom.el('h3', { text: 'Link compartilhável' }),
      Dom.el('div', { class: 'field' }, [Dom.el('label', { class: 'field__label', for: linkId, text: 'Quem abrir este link vê a mesma paleta' }), this.#link]),
      Dom.el('div', { class: 'export__actions' }, [
        Dom.el('button', { type: 'button', class: 'btn btn--ghost', 'data-action': 'copy-link', on: { click: () => this.#copy(this.#link.value, 'Link copiado.') } },
          [Icons.svg('link'), 'Copiar link']),
      ]),
    ]);

    const codeCards = this.#exporters.map((exp) => {
      // role="region" permite que o nome (aria-label) seja lido; tabindex deixa rolar pelo teclado.
      const pre = Dom.el('pre', { class: 'export__code', tabindex: '0', role: 'region', 'aria-label': `Código ${exp.label}` });
      this.#codes.set(exp.id, pre);
      return Dom.el('article', { class: 'export__card card zone-roxo' }, [
        Dom.el('h3', { text: exp.label }),
        pre,
        Dom.el('div', { class: 'export__actions' }, [
          Dom.el('button', { type: 'button', class: 'btn btn--ghost', 'data-action': `copy-${exp.id}`, on: { click: () => this.#copy(exp.export(this.#store.state.palette), `${exp.label} copiado.`) } },
            [Icons.svg('copy'), 'Copiar']),
          Dom.el('button', { type: 'button', class: 'btn btn--ghost', 'data-action': `download-${exp.id}`, on: { click: () => this.#downloader.download(exp.export(this.#store.state.palette), exp.fileName, exp.mimeType) } },
            [Icons.svg('download'), `Baixar ${exp.fileName}`]),
        ]),
      ]);
    });

    Dom.replace(this.#root, [Dom.el('div', { class: 'export' }, [image, link, ...codeCards])]);
    this.#bus.on(StoreEvent.PALETTE, () => this.#render());
    this.#render();
  }

  #render() {
    const { palette } = this.#store.state;
    this.#preview.setAttribute('aria-label', `Prévia da imagem: ${palette.hexes.join(', ')}`);
    Dom.replace(this.#preview, palette.colors.map((c) => Dom.el('span', { style: { background: c.hex } })));
    this.#link.value = this.#codec.shareUrl(palette);
    for (const exp of this.#exporters) this.#codes.get(exp.id).textContent = exp.export(palette);
  }

  async #copy(text, success) {
    const ok = await this.#clipboard.copy(text);
    this.#toast.show(ok ? success : 'Não foi possível copiar. Selecione o texto e use Ctrl+C.');
  }

  async #downloadPng() {
    const layout = new PngLayout({ width: 1200, height: 630 }).build(this.#store.state.palette);
    const blob = await this.#png.toBlob(this.#png.render(layout));
    this.#downloader.download(blob, 'paletres.png');
    this.#toast.show('Imagem baixada.');
  }
}
