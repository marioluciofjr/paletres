/**
 * ColorGradingPanel — aplica a paleta numa foto por gradient map (RF-18).
 *
 * Tudo acontece no navegador: a imagem nunca sai do computador da pessoa.
 * Passos: validar o arquivo → reduzir para no máximo 1600px → guardar os pixels
 * originais → aplicar o GradientMap com a intensidade escolhida → mostrar antes/depois.
 * Sem foto? O botão "Usar imagem de exemplo" desenha uma paisagem para testar na hora.
 */
import { GradientMap } from '../domain/grading/GradientMap.js';
import { StoreEvent } from '../app/PaletteStore.js';
import { Dom } from './Dom.js';
import { Icons } from './Icons.js';

const ACCEPTED = Object.freeze(['image/png', 'image/jpeg', 'image/webp']);
const MAX_BYTES = 15 * 1024 * 1024;
const MAX_SIDE = 1600;

export class ColorGradingPanel {
  #root;
  #store;
  #bus;
  #toast;
  #downloader;
  #win;
  #before;
  #after;
  #original = null;
  #stage;
  #empty;
  #error;
  #intensity;
  #split;
  #download;
  #frame = 0;

  constructor({ root, store, bus, toast, downloader, win = window }) {
    this.#root = root;
    this.#store = store;
    this.#bus = bus;
    this.#toast = toast;
    this.#downloader = downloader;
    this.#win = win;
  }

  mount() {
    const fileId = Dom.uid('foto');
    const intensityId = Dom.uid('intensidade');
    const splitId = Dom.uid('divisor');
    const fileName = Dom.el('p', { class: 'dropzone__file-name', 'aria-live': 'polite', text: 'Nenhuma foto escolhida.' });
    const file = Dom.el('input', {
      id: fileId,
      type: 'file',
      class: 'visually-hidden',
      accept: ACCEPTED.join(','),
      on: { change: (e) => { const f = e.target.files?.[0]; if (f) fileName.textContent = f.name; this.#load(f); } },
    });
    const drop = Dom.el('div', { class: 'dropzone' }, [
      Icons.svg('upload'),
      Dom.el('p', { class: 'field__label', text: 'JPG, PNG ou WebP, até 15 MB. Você também pode arrastar a foto para cá.' }),
      file,
      Dom.el('label', { for: fileId, class: 'btn btn--ghost' }, 'Escolher foto'),
      fileName,
    ]);
    this.#bindDrop(drop);

    this.#error = Dom.el('p', { class: 'field__error', role: 'alert' });
    this.#intensity = Dom.el('input', { id: intensityId, type: 'range', class: 'range', min: '0', max: '100', value: '100', 'aria-valuetext': '100 por cento',
      on: { input: (e) => { e.target.setAttribute('aria-valuetext', `${e.target.value} por cento`); this.#schedule(); } } });
    this.#split = Dom.el('input', { id: splitId, type: 'range', class: 'range', min: '0', max: '100', value: '50', 'aria-valuetext': 'metade antes, metade depois',
      on: { input: (e) => this.#setSplit(Number(e.target.value)) } });
    this.#download = Dom.el('button', { type: 'button', class: 'btn btn--ghost', disabled: true, 'data-action': 'download-graded', on: { click: () => this.#save() } },
      [Icons.svg('download'), 'Baixar PNG']);

    const controls = Dom.el('div', { class: 'grading__controls' }, [
      drop,
      Dom.el('button', { type: 'button', class: 'btn btn--ghost', 'data-action': 'sample', on: { click: () => this.#useSample() } }, [Icons.svg('image'), 'Usar imagem de exemplo']),
      this.#error,
      Dom.el('div', { class: 'field' }, [Dom.el('label', { class: 'field__label', for: intensityId, text: 'Intensidade das cores da paleta' }), this.#intensity]),
      Dom.el('div', { class: 'field' }, [Dom.el('label', { class: 'field__label', for: splitId, text: 'Comparar antes e depois' }), this.#split]),
      this.#download,
      Dom.el('p', { class: 'field__label', text: 'A foto é processada no seu navegador e não é enviada para nenhum servidor.' }),
    ]);

    this.#before = Dom.el('canvas', { 'aria-hidden': 'true' });
    this.#after = Dom.el('canvas', { class: 'stage__after', 'aria-hidden': 'true' });
    this.#stage = Dom.el('div', { class: 'stage frame', role: 'img', hidden: true }, [
      this.#before,
      this.#after,
      Dom.el('span', { class: 'stage__divider', 'aria-hidden': 'true' }),
      Dom.el('div', { class: 'stage__tags', 'aria-hidden': 'true' }, [Dom.el('span', { class: 'stage__tag', text: 'Antes' }), Dom.el('span', { class: 'stage__tag', text: 'Depois' })]),
    ]);
    this.#empty = Dom.el('div', { class: 'stage-empty' }, 'Sua foto aparece aqui, recolorida com as 3 cores: sombras na cor mais escura, meios-tons na do meio e luzes na mais clara.');

    Dom.replace(this.#root, [
      Dom.el('h3', { text: 'Color grading: sua paleta numa foto' }),
      Dom.el('div', { class: 'grading__layout' }, [controls, Dom.el('div', {}, [this.#empty, this.#stage])]),
    ]);
    this.#setSplit(50);
    this.#bus.on(StoreEvent.PALETTE, () => this.#schedule());
  }

  #bindDrop(zone) {
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('is-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('is-over');
      this.#load(e.dataTransfer?.files?.[0]);
    });
  }

  async #load(file) {
    this.#error.textContent = '';
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      this.#error.textContent = 'Formato não aceito. Use uma foto JPG, PNG ou WebP.';
      return;
    }
    if (file.size > MAX_BYTES) {
      this.#error.textContent = 'Arquivo muito grande. O limite é 15 MB.';
      return;
    }
    try {
      const bitmap = await this.#win.createImageBitmap(file);
      this.#draw(bitmap, bitmap.width, bitmap.height);
      bitmap.close?.();
    } catch {
      this.#error.textContent = 'Não foi possível abrir esta imagem. Tente outro arquivo.';
    }
  }

  /** Desenha a imagem reduzida no canvas "antes" e guarda os pixels originais. */
  #draw(source, width, height) {
    const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    for (const c of [this.#before, this.#after]) { c.width = w; c.height = h; }
    const ctx = this.#before.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, w, h);
    this.#original = ctx.getImageData(0, 0, w, h);
    this.#empty.hidden = true;
    this.#stage.hidden = false;
    this.#download.disabled = false;
    this.#apply();
  }

  /** Paisagem de exemplo desenhada no próprio navegador (céu, sol, montanhas e lago). */
  #useSample() {
    const w = 1200;
    const h = 750;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#1d2b53');
    sky.addColorStop(1, '#ffcf8a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff6d8';
    ctx.beginPath();
    ctx.arc(w * 0.7, h * 0.38, 70, 0, Math.PI * 2);
    ctx.fill();
    const ridge = (y, amp, color, seed) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 20) ctx.lineTo(x, y + Math.sin(x / 90 + seed) * amp + Math.sin(x / 37 + seed * 2) * amp * 0.4);
      ctx.lineTo(w, h);
      ctx.fill();
    };
    ridge(h * 0.52, 40, '#7a5c8c', 1);
    ridge(h * 0.62, 30, '#3d3359', 2);
    const lake = ctx.createLinearGradient(0, h * 0.72, 0, h);
    lake.addColorStop(0, '#9cc3d9');
    lake.addColorStop(1, '#0d1b2a');
    ctx.fillStyle = lake;
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
    this.#error.textContent = '';
    this.#draw(c, w, h);
    this.#toast.show('Imagem de exemplo carregada.');
  }

  /** Recalcula no próximo quadro (evita refazer a conta várias vezes por segundo). */
  #schedule() {
    if (!this.#original) return;
    this.#win.cancelAnimationFrame(this.#frame);
    this.#frame = this.#win.requestAnimationFrame(() => this.#apply());
  }

  #apply() {
    if (!this.#original) return;
    const map = GradientMap.fromPalette(this.#store.state.palette);
    const k = Number(this.#intensity.value) / 100;
    const out = map.apply(this.#original.data, k);
    const image = new ImageData(out, this.#original.width, this.#original.height);
    this.#after.getContext('2d').putImageData(image, 0, 0);
    this.#stage.setAttribute('aria-label', `Foto com color grading da paleta ${this.#store.state.palette.hexes.join(', ')}, intensidade ${this.#intensity.value}%`);
  }

  #setSplit(v) {
    this.#root.style.setProperty('--split', `${v}%`);
    this.#split.setAttribute('aria-valuetext', `${v}% da largura mostra o antes`);
  }

  async #save() {
    const blob = await new Promise((resolve) => this.#after.toBlob(resolve, 'image/png'));
    if (!blob) return;
    this.#downloader.download(blob, 'paletres-color-grading.png');
    this.#toast.show('Foto baixada.');
  }
}
