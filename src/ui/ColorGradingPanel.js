/**
 * ColorGradingPanel — "Sua paleta numa foto": aplica a paleta por gradient map (RF-18).
 *
 * Tudo acontece no navegador: a imagem nunca sai do computador da pessoa.
 * Passos: validar o arquivo → reduzir para no máximo 1600px → guardar os pixels
 * originais → aplicar o GradientMap com a intensidade escolhida → mostrar antes/depois.
 *
 * Desempenho: enquanto a pessoa mexe nas cores (arrastando a roda ou um slider),
 * mostramos uma PRÉVIA rápida em baixa resolução (até 480px); 200 ms depois do último
 * movimento, recalculamos na resolução completa. Os buffers de pixels são reaproveitados.
 * Sem foto? "Usar imagem de exemplo" desenha uma paisagem para testar na hora.
 */
import { GradientMap } from '../domain/grading/GradientMap.js';
import { StoreEvent } from '../app/PaletteStore.js';
import { Dom } from './Dom.js';
import { Icons } from './Icons.js';

const ACCEPTED = Object.freeze(['image/png', 'image/jpeg', 'image/webp']);
const MAX_BYTES = 15 * 1024 * 1024;
const MAX_SIDE = 1600; // tamanho de trabalho
const PREVIEW_SIDE = 480; // tamanho da prévia rápida
const MAX_SOURCE_SIDE = 12000; // acima disso, recusamos (evita travar a aba)
const MIN_SOURCE_SIDE = 16;
const FULL_DELAY = 200;

export class ColorGradingPanel {
  #root;
  #store;
  #bus;
  #toast;
  #downloader;
  #win;
  #before;
  #after;
  #divider;
  #stage;
  #empty;
  #error;
  #status;
  #fileName;
  #intensity;
  #split;
  #download;
  #full = null; // { data: ImageData, out: Uint8ClampedArray }
  #preview = null; // { canvas, data: ImageData, out: Uint8ClampedArray }
  #frame = 0;
  #fullTimer = null;

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
    this.#fileName = Dom.el('p', { class: 'dropzone__file-name', text: 'Nenhuma foto escolhida.' });
    const file = Dom.el('input', {
      id: fileId,
      type: 'file',
      class: 'visually-hidden',
      accept: ACCEPTED.join(','),
      on: { change: (e) => this.#load(e.target.files?.[0]) },
    });
    const drop = Dom.el('div', { class: 'dropzone' }, [
      Icons.svg('upload'),
      Dom.el('p', { class: 'field__label', text: 'JPG, PNG ou WebP, até 15 MB. Você também pode arrastar a foto para cá.' }),
      file,
      Dom.el('label', { for: fileId, class: 'btn btn--ghost' }, 'Escolher foto'),
      this.#fileName,
    ]);
    this.#bindDrop(drop);

    this.#error = Dom.el('p', { class: 'field__error', role: 'alert' });
    this.#status = Dom.el('p', { class: 'grading__status', role: 'status' });
    this.#intensity = Dom.el('input', {
      id: intensityId, type: 'range', class: 'range', min: '0', max: '100', value: '100', 'aria-valuetext': '100 por cento',
      on: { input: (e) => { e.target.setAttribute('aria-valuetext', `${e.target.value} por cento`); this.#schedule(); } },
    });
    this.#split = Dom.el('input', {
      id: splitId, type: 'range', class: 'range', min: '0', max: '100', value: '50',
      on: { input: (e) => this.#setSplit(Number(e.target.value)) },
    });
    this.#download = Dom.el('button', {
      type: 'button', class: 'btn btn--ghost', 'aria-disabled': 'true', 'data-action': 'download-graded',
      on: { click: () => this.#save() },
    }, [Icons.svg('download'), 'Baixar PNG']);

    const controls = Dom.el('div', { class: 'grading__controls' }, [
      drop,
      Dom.el('button', { type: 'button', class: 'btn btn--ghost', 'data-action': 'sample', on: { click: () => this.#useSample() } }, [Icons.svg('image'), 'Usar imagem de exemplo']),
      this.#error,
      this.#status,
      Dom.el('div', { class: 'field' }, [Dom.el('label', { class: 'field__label', for: intensityId, text: 'Intensidade das cores da paleta' }), this.#intensity]),
      Dom.el('div', { class: 'field' }, [Dom.el('label', { class: 'field__label', for: splitId, text: 'Comparar antes e depois' }), this.#split]),
      this.#download,
      Dom.el('p', { class: 'field__label', text: 'A foto é processada no seu navegador e não é enviada para nenhum servidor.' }),
    ]);

    this.#before = Dom.el('canvas', { 'aria-hidden': 'true' });
    this.#after = Dom.el('canvas', { class: 'stage__after', 'aria-hidden': 'true' });
    this.#divider = Dom.el('span', { class: 'stage__divider', 'aria-hidden': 'true' });
    this.#stage = Dom.el('div', { class: 'stage frame', role: 'img', hidden: true }, [
      this.#before,
      this.#after,
      this.#divider,
      Dom.el('div', { class: 'stage__tags', 'aria-hidden': 'true' }, [Dom.el('span', { class: 'stage__tag', text: 'Antes' }), Dom.el('span', { class: 'stage__tag', text: 'Depois' })]),
    ]);
    this.#empty = Dom.el('div', { class: 'stage-empty' }, 'Sua foto aparece aqui, recolorida com as 3 cores: sombras na cor mais escura, meios-tons na do meio e luzes na mais clara.');

    Dom.replace(this.#root, [
      Dom.el('h3', { text: 'Sua paleta numa foto (color grading)' }),
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

  #fail(message) {
    this.#error.textContent = message;
    this.#status.textContent = '';
    this.#stage.removeAttribute('aria-busy');
  }

  async #load(file) {
    this.#error.textContent = '';
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) return this.#fail('Formato não aceito. Use uma foto JPG, PNG ou WebP.');
    if (file.size > MAX_BYTES) return this.#fail('Arquivo muito grande. O limite é 15 MB.');

    this.#status.textContent = 'Processando sua foto…';
    this.#stage.setAttribute('aria-busy', 'true');
    let bitmap;
    try {
      bitmap = await this.#win.createImageBitmap(file);
    } catch {
      return this.#fail('Não foi possível abrir esta imagem. Tente outro arquivo.');
    }
    const { width, height } = bitmap;
    if (Math.max(width, height) > MAX_SOURCE_SIDE) {
      bitmap.close?.();
      return this.#fail(`Imagem grande demais (${width} × ${height} px). Use uma com até ${MAX_SOURCE_SIDE} px no lado maior.`);
    }
    if (Math.min(width, height) < MIN_SOURCE_SIDE) {
      bitmap.close?.();
      return this.#fail(`Imagem pequena demais (${width} × ${height} px). Use uma com pelo menos ${MIN_SOURCE_SIDE} px de cada lado.`);
    }
    this.#draw(bitmap, width, height);
    bitmap.close?.();
    // Só agora, com a foto aceita, mostramos o nome do arquivo.
    this.#fileName.textContent = file.name;
    this.#fileName.title = file.name;
    this.#status.textContent = '';
    this.#stage.removeAttribute('aria-busy');
    this.#toast.show('Foto carregada.');
  }

  /** Desenha a imagem reduzida, guarda os pixels originais e prepara a prévia rápida. */
  #draw(source, width, height) {
    const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    for (const c of [this.#before, this.#after]) { c.width = w; c.height = h; }
    const ctx = this.#before.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(source, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h);
    this.#full = { data, out: new Uint8ClampedArray(data.data.length) };

    const ps = Math.min(1, PREVIEW_SIDE / Math.max(w, h));
    const pw = Math.max(1, Math.round(w * ps));
    const ph = Math.max(1, Math.round(h * ps));
    const canvas = Object.assign(document.createElement('canvas'), { width: pw, height: ph });
    const pctx = canvas.getContext('2d', { willReadFrequently: true });
    pctx.drawImage(this.#before, 0, 0, pw, ph);
    const pdata = pctx.getImageData(0, 0, pw, ph);
    this.#preview = { canvas, data: pdata, out: new Uint8ClampedArray(pdata.data.length) };

    this.#empty.hidden = true;
    this.#stage.hidden = false;
    this.#download.setAttribute('aria-disabled', 'false');
    this.#applyFull();
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
    this.#fileName.textContent = 'Imagem de exemplo';
    this.#toast.show('Imagem de exemplo carregada.');
  }

  /** Mudança de cor ou intensidade: prévia no próximo quadro; resolução completa depois da pausa. */
  #schedule() {
    if (!this.#full) return;
    this.#win.cancelAnimationFrame(this.#frame);
    this.#frame = this.#win.requestAnimationFrame(() => this.#applyPreview());
    clearTimeout(this.#fullTimer);
    this.#fullTimer = setTimeout(() => this.#applyFull(), FULL_DELAY);
  }

  #map() {
    return { map: GradientMap.fromPalette(this.#store.state.palette), k: Number(this.#intensity.value) / 100 };
  }

  #applyPreview() {
    if (!this.#preview) return;
    const { map, k } = this.#map();
    const { canvas, data, out } = this.#preview;
    map.apply(data.data, k, out);
    canvas.getContext('2d').putImageData(new ImageData(out, data.width, data.height), 0, 0);
    // Amplia a prévia para o tamanho do canvas "depois" (fica um pouco borrada só por instantes).
    this.#after.getContext('2d').drawImage(canvas, 0, 0, this.#after.width, this.#after.height);
  }

  #applyFull() {
    if (!this.#full) return;
    const { map, k } = this.#map();
    const { data, out } = this.#full;
    map.apply(data.data, k, out);
    this.#after.getContext('2d').putImageData(new ImageData(out, data.width, data.height), 0, 0);
    this.#stage.setAttribute('aria-label', `Foto com as cores da paleta ${this.#store.state.palette.hexes.join(', ')}, intensidade ${this.#intensity.value}%`);
  }

  /** Move o divisor e o recorte direto nos elementos (sem variável CSS no pai). */
  #setSplit(v) {
    this.#divider.style.left = `${v}%`;
    this.#after.style.clipPath = `inset(0 0 0 ${v}%)`;
    this.#split.setAttribute('aria-valuetext', `${v}% da largura mostra o antes`);
  }

  async #save() {
    if (!this.#full) return;
    const blob = await new Promise((resolve) => this.#after.toBlob(resolve, 'image/png'));
    if (!blob) return;
    this.#downloader.download(blob, 'paletres-color-grading.png');
    this.#toast.show('Foto baixada.');
  }
}
