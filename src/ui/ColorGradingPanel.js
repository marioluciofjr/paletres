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
 *
 * v1.1.0: para deixar claro que as 3 cores entram na foto, há
 *  - uma LEGENDA: a faixa de claridade da foto (do escuro ao claro) e, embaixo, a cor da
 *    paleta que cada trecho recebe (sombras, meios-tons e luzes);
 *  - o modo "Onde entra cada cor": pinta cada parte da foto com UMA das 3 cores, sem
 *    mistura, para a pessoa ver as 3 zonas.
 */
import { GradientMap } from '../domain/grading/GradientMap.js';
import { Palette } from '../domain/palette/Palette.js';
import { StoreEvent } from '../app/PaletteStore.js';
import { Dom } from './Dom.js';
import { Icons } from './Icons.js';

const ACCEPTED = Object.freeze(['image/png', 'image/jpeg', 'image/webp']);
const MAX_BYTES = 15 * 1024 * 1024;
const MAX_SIDE = 1600; // tamanho de trabalho
const PREVIEW_SIDE = 480; // tamanho da prévia rápida
const MAX_SOURCE_SIDE = 12000; // acima disso, recusamos (evita travar a aba)
const MIN_SOURCE_SIDE = 16;
const MAX_SOURCE_PIXELS = 64_000_000; // 64 megapixels: acima disso a memória da aba pode estourar
const FULL_DELAY = 200;

const ZONES = Object.freeze([
  ['Sombras', 'as partes escuras'],
  ['Meios-tons', 'as partes médias'],
  ['Luzes', 'as partes claras'],
]);

const VIEWS = Object.freeze([
  [GradientMap.Mode.SMOOTH, 'Resultado final (cores misturadas)'],
  [GradientMap.Mode.ZONES, 'Onde entra cada cor (3 zonas)'],
]);

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
  #mode = GradientMap.Mode.SMOOTH;
  #subject = 'sua foto';
  #legendRamp;
  #legendList;
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

    const viewName = Dom.uid('vista');
    const view = Dom.el('fieldset', { class: 'chip-group' }, [
      Dom.el('legend', { text: 'O que mostrar na foto' }),
      Dom.el('div', { class: 'chips' }, VIEWS.map(([mode, label]) => Dom.el('label', { class: 'chip' }, [
        Dom.el('input', { type: 'radio', name: viewName, value: mode, checked: mode === this.#mode, on: { change: () => this.#setMode(mode) } }),
        Dom.el('span', { text: label }),
      ]))),
    ]);

    const controls = Dom.el('div', { class: 'grading__controls' }, [
      drop,
      Dom.el('button', { type: 'button', class: 'btn btn--ghost', 'data-action': 'sample', on: { click: () => this.#useSample() } }, [Icons.svg('image'), 'Usar imagem de exemplo']),
      this.#error,
      this.#status,
      view,
      Dom.el('div', { class: 'field' }, [Dom.el('label', { class: 'field__label', for: intensityId, text: 'Intensidade das cores da paleta' }), this.#intensity]),
      Dom.el('div', { class: 'field' }, [Dom.el('label', { class: 'field__label', for: splitId, text: 'Comparar antes e depois' }), this.#split]),
      this.#download,
      Dom.el('p', { class: 'field__label', text: 'A foto é processada no seu navegador e não é enviada para nenhum servidor.' }),
    ]);

    this.#before = Dom.el('canvas', { 'aria-hidden': 'true' });
    this.#after = Dom.el('canvas', { class: 'stage__after', 'aria-hidden': 'true' });
    // O "trilho" (track) ocupa o palco inteiro; é ele que anda com transform. A linha fica na borda esquerda dele.
    this.#divider = Dom.el('span', { class: 'stage__track', 'aria-hidden': 'true' }, [Dom.el('span', { class: 'stage__divider' })]);
    this.#stage = Dom.el('div', { class: 'stage frame', role: 'img', hidden: true }, [
      this.#before,
      this.#after,
      this.#divider,
      Dom.el('div', { class: 'stage__tags', 'aria-hidden': 'true' }, [Dom.el('span', { class: 'stage__tag', text: 'Antes' }), Dom.el('span', { class: 'stage__tag', text: 'Depois' })]),
    ]);
    this.#empty = Dom.el('div', { class: 'stage-empty' }, 'Sua foto aparece aqui, recolorida com as 3 cores: sombras na cor mais escura, meios-tons na do meio e luzes na mais clara.');

    // Legenda: a faixa de claridade (decorativa) e o que cada trecho vira. O texto da lista é o que o leitor de tela lê.
    this.#legendRamp = Dom.el('div', { class: 'grade-legend__ramps', 'aria-hidden': 'true' });
    this.#legendList = Dom.el('ul', { class: 'grade-legend__list' });
    const legend = Dom.el('div', { class: 'grade-legend' }, [
      Dom.el('p', { class: 'grade-legend__title', text: 'Como as 3 cores entram na foto' }),
      this.#legendRamp,
      this.#legendList,
    ]);

    Dom.replace(this.#root, [
      Dom.el('h3', { text: 'Sua paleta numa foto (color grading)' }),
      Dom.el('p', { class: 'grading__lead', text: 'Color grading é o ajuste de cor que o cinema faz em cada cena para criar um clima. Aqui, as 3 cores da sua paleta substituem as cores da foto conforme a claridade de cada parte. Veja a explicação completa em "Aprenda".' }),
      Dom.el('div', { class: 'grading__layout' }, [controls, Dom.el('div', {}, [legend, this.#empty, this.#stage])]),
    ]);
    this.#setSplit(50);
    this.#renderLegend();
    this.#bus.on(StoreEvent.PALETTE, () => {
      this.#renderLegend();
      this.#schedule();
    });
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
    // 1º lemos só as dimensões (sem decodificar tudo) para recusar fotos gigantes antes de travar a aba.
    const url = this.#win.URL.createObjectURL(file);
    let img;
    try {
      img = await this.#readImage(url);
    } catch {
      this.#win.URL.revokeObjectURL(url);
      return this.#fail('Não foi possível abrir esta imagem. Tente outro arquivo.');
    }
    const { naturalWidth: width, naturalHeight: height } = img;
    const problem = this.#sizeProblem(width, height);
    if (problem) {
      this.#win.URL.revokeObjectURL(url);
      return this.#fail(problem);
    }
    // 2º decodificamos já reduzida para o tamanho de trabalho (até 1600px).
    const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
    let bitmap;
    try {
      bitmap = await this.#win.createImageBitmap(img, {
        resizeWidth: Math.max(1, Math.round(width * scale)),
        resizeHeight: Math.max(1, Math.round(height * scale)),
        resizeQuality: 'high',
      });
    } catch {
      this.#win.URL.revokeObjectURL(url);
      return this.#fail('Não foi possível abrir esta imagem. Tente outro arquivo.');
    }
    this.#win.URL.revokeObjectURL(url);
    this.#draw(bitmap, bitmap.width, bitmap.height);
    bitmap.close?.();
    // Só agora, com a foto aceita, mostramos o nome do arquivo.
    this.#subject = `sua foto (${file.name})`;
    this.#fileName.textContent = file.name;
    this.#fileName.title = file.name;
    this.#status.textContent = '';
    this.#stage.removeAttribute('aria-busy');
    this.#toast.show('Foto carregada.');
  }

  /** Carrega a imagem num <img> só para conhecer largura e altura. */
  #readImage(url) {
    return new Promise((resolve, reject) => {
      const img = new this.#win.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('imagem inválida'));
      img.src = url;
    });
  }

  /** Devolve a mensagem de erro de tamanho, ou null se a imagem serve. */
  #sizeProblem(width, height) {
    if (Math.min(width, height) < MIN_SOURCE_SIDE) {
      return `Imagem pequena demais (${width} × ${height} px). Use uma com pelo menos ${MIN_SOURCE_SIDE} px de cada lado.`;
    }
    if (Math.max(width, height) > MAX_SOURCE_SIDE || width * height > MAX_SOURCE_PIXELS) {
      return `Imagem grande demais (${width} × ${height} px). Use uma com até ${MAX_SOURCE_SIDE} px no lado maior e até 64 megapixels.`;
    }
    return null;
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
    this.#subject = 'paisagem de exemplo com céu, sol, montanhas e lago';
    this.#fileName.textContent = 'Imagem de exemplo';
    this.#fileName.title = '';
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
    // No modo zonas, a intensidade fica em 100%: com mistura, as 3 zonas deixariam de ser puras.
    const k = this.#mode === GradientMap.Mode.ZONES ? 1 : Number(this.#intensity.value) / 100;
    return { map: GradientMap.fromPalette(this.#store.state.palette, { mode: this.#mode }), k };
  }

  /** Troca entre o resultado final e o mapa das 3 zonas. */
  #setMode(mode) {
    this.#mode = mode;
    this.#renderLegend();
    this.#schedule();
  }

  /** Desenha a legenda: sombras, meios-tons e luzes, cada um com a cor que recebe. */
  #renderLegend() {
    const { palette } = this.#store.state;
    const [dark, mid, light] = palette.sortedByLuminance();
    const zones = this.#mode === GradientMap.Mode.ZONES;
    const mapped = zones
      ? `linear-gradient(to right, ${dark.hex} 0 33.33%, ${mid.hex} 33.33% 66.67%, ${light.hex} 66.67% 100%)`
      : `linear-gradient(to right, ${dark.hex}, ${mid.hex}, ${light.hex})`;
    Dom.replace(this.#legendRamp, [
      Dom.el('span', { class: 'grade-legend__label', text: 'Claridade da foto' }),
      Dom.el('span', { class: 'grade-legend__bar grade-legend__bar--gray frame' }),
      Dom.el('span', { class: 'grade-legend__label', text: 'Vira esta cor' }),
      Dom.el('span', { class: 'grade-legend__bar frame', style: { background: mapped } }),
    ]);
    Dom.replace(this.#legendList, [dark, mid, light].map((color, i) => {
      const label = Palette.LABELS[palette.colors.indexOf(color)];
      const [zone, what] = ZONES[i];
      return Dom.el('li', {}, [
        Dom.el('span', { class: 'preset__dot', style: { background: color.hex }, 'aria-hidden': 'true' }),
        Dom.el('span', {}, [Dom.el('strong', { text: zone }), ` (${what}) recebem a cor ${label} ${color.hex}`]),
      ]);
    }));
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
    const view = this.#mode === GradientMap.Mode.ZONES ? 'mapa das 3 zonas' : 'resultado final';
    this.#stage.setAttribute('aria-label', `${this.#subject.charAt(0).toUpperCase()}${this.#subject.slice(1)}, recolorida com as cores da paleta ${this.#store.state.palette.hexes.join(', ')}, ${view}, intensidade ${this.#intensity.value}%`);
  }

  /**
   * Move o divisor e o recorte direto nos elementos. O divisor fica dentro de um trilho
   * da largura do palco, então translateX(v%) anda v% do palco usando só transform.
   */
  #setSplit(v) {
    this.#divider.style.transform = `translateX(${v}%)`;
    this.#after.style.clipPath = `inset(0 0 0 ${v}%)`;
    this.#split.setAttribute('aria-valuetext', `${v}% da largura mostra o antes`);
  }

  async #save() {
    if (!this.#full) {
      this.#toast.show('Escolha uma foto ou use a imagem de exemplo antes de baixar.');
      return;
    }
    const blob = await new Promise((resolve) => this.#after.toBlob(resolve, 'image/png'));
    if (!blob) return;
    this.#downloader.download(blob, 'paletres-color-grading.png');
    this.#toast.show('Foto baixada.');
  }
}
