/**
 * ImagePalettePanel — "Paleta a partir de uma imagem" (RF-35).
 *
 * A pessoa envia uma imagem (ou usa a de exemplo) e o painel:
 *  1. acha as cores principais (ImagePaletteExtractor) e mostra o MOSAICO:
 *     3 cores em linha, 4 em grade 2 × 2, 5 em pirâmide de base 3, 6 em grade 2 × 3;
 *  2. sugere o melhor trio com contraste garantido (PaletteSuggester): AAA primeiro, AA se preciso;
 *  3. deixa a pessoa montar o próprio trio clicando em 3 peças do mosaico;
 *  4. com 1 ou 2 cores, oferece carregar outra imagem ou completar a paleta com tons das cores achadas.
 *
 * Nada muda na paleta da pessoa até o clique em "Usar esta paleta" (que pode ser desfeito).
 * A imagem é analisada no navegador, numa versão pequena (até 160 px), e não é enviada a servidor nenhum.
 */
import { StoreEvent } from '../app/PaletteStore.js';
import { Color } from '../domain/color/Color.js';
import { Palette } from '../domain/palette/Palette.js';
import { Wcag2Contrast } from '../domain/contrast/Wcag2Contrast.js';
import { NumberFormat } from '../domain/format/NumberFormat.js';
import { ImagePaletteExtractor } from '../domain/image/ImagePaletteExtractor.js';
import { MosaicLayout } from '../domain/image/MosaicLayout.js';
import { PaletteSuggester } from '../domain/image/PaletteSuggester.js';
import { DominantColorPicker } from '../domain/image/DominantColorPicker.js';
import { ImageFileLoader } from '../infra/ImageFileLoader.js';
import { Dom } from './Dom.js';
import { Icons } from './Icons.js';
import { SampleImage } from './SampleImage.js';

const ANALYSIS_SIDE = 160; // lado maior da versão analisada: suficiente para achar as cores e rápido
const BLACK = Color.fromHex('#000000');
const WHITE = Color.fromHex('#FFFFFF');

export class ImagePalettePanel {
  #root;
  #store;
  #bus;
  #toast;
  #loader;
  #extractor;
  #suggester;
  #sample;
  #wcag = new Wcag2Contrast();

  #fileInput;
  #fileName;
  #thumb; // <figure> com a miniatura da imagem analisada
  #thumbCanvas;
  #thumbCaption;
  #error;
  #status;
  #result;

  #analysis = null; // { colors, ignored, found, label }
  #choice = []; // índices das peças escolhidas à mão (no máximo 3, na ordem do clique)
  #auto = null; // sugestão automática (guardada para "Voltar à sugestão automática")
  #suggestion = null;

  /** `sample`: a imagem de exemplo (desenho + descrição). Nos testes, entra um dublê sem canvas. */
  constructor({ root, store, bus, toast, loader = new ImageFileLoader(), extractor = new ImagePaletteExtractor(), suggester = new PaletteSuggester(), sample = SampleImage }) {
    this.#root = root;
    this.#store = store;
    this.#bus = bus;
    this.#toast = toast;
    this.#loader = loader;
    this.#extractor = extractor;
    this.#suggester = suggester;
    this.#sample = sample;
  }

  mount() {
    const fileId = Dom.uid('imagem-paleta');
    const hintId = Dom.uid('imagem-paleta-dica');
    const errorId = Dom.uid('imagem-paleta-erro');
    this.#fileName = Dom.el('p', { class: 'dropzone__file-name', text: 'Nenhuma imagem escolhida.' });
    // O campo é ligado à dica (formatos e limite) e ao erro: o leitor de tela lê os dois junto com o campo.
    this.#fileInput = Dom.el('input', {
      id: fileId,
      type: 'file',
      class: 'visually-hidden',
      accept: ImageFileLoader.ACCEPTED.join(','),
      'aria-describedby': `${hintId} ${errorId}`,
      'data-action': 'image-palette-file',
      on: { change: (e) => this.loadFile(e.target.files?.[0]) },
    });
    const drop = Dom.el('div', { class: 'dropzone' }, [
      Icons.svg('upload'),
      Dom.el('p', { id: hintId, class: 'field__label', text: 'JPG, PNG ou WebP, até 15 MB. Você também pode arrastar a imagem para cá.' }),
      this.#fileInput,
      Dom.el('label', { for: fileId, class: 'btn btn--ghost' }, 'Escolher imagem'),
      this.#fileName,
    ]);
    this.#bindDrop(drop);
    // Miniatura: a pessoa lembra qual imagem escolheu enquanto olha o mosaico (RF-35, pedido do Mário).
    // É a mesma versão pequena usada na análise (até 160 px), então não custa nada a mais.
    // O nome acessível da miniatura vem da legenda visível: o leitor de tela não repete o nome do arquivo
    // (auditoria a11y-web B2). Como é a imagem da própria pessoa, o nome do arquivo é a melhor identificação.
    const captionId = Dom.uid('imagem-paleta-legenda');
    this.#thumbCaption = Dom.el('figcaption', { id: captionId });
    this.#thumbCanvas = Dom.el('canvas', { class: 'frame', role: 'img', 'aria-labelledby': captionId });
    this.#thumb = Dom.el('figure', { class: 'image-palette__thumb', hidden: true }, [this.#thumbCanvas, this.#thumbCaption]);
    this.#error = Dom.el('p', { id: errorId, class: 'field__error', role: 'alert' });
    this.#status = Dom.el('p', { class: 'grading__status', role: 'status' });
    this.#result = Dom.el('div', { class: 'image-palette__result' });

    const controls = Dom.el('div', { class: 'grading__controls' }, [
      drop,
      this.#thumb,
      Dom.el('button', { type: 'button', class: 'btn btn--ghost', 'data-action': 'image-palette-sample', on: { click: () => this.useSample() } }, [Icons.svg('image'), 'Usar imagem de exemplo']),
      this.#error,
      this.#status,
      Dom.el('p', { class: 'field__label', text: 'A imagem é analisada no seu navegador e não é enviada para nenhum servidor.' }),
    ]);

    Dom.replace(this.#root, [
      Dom.el('p', { class: 'eyebrow' }, [Dom.el('span', { class: 'tag-new', text: 'Cria uma paleta nova' })]),
      Dom.el('h3', { text: 'Paleta a partir de uma imagem' }),
      Dom.el('p', { class: 'grading__lead', text: 'Envie uma foto, uma ilustração ou um print. O Paletrês acha as cores principais (até 6), mostra num mosaico e sugere o melhor trio, tentando primeiro o contraste AAA e, se não der, o AA.' }),
      Dom.el('p', { class: 'callout callout--note' }, ['A sua paleta só muda quando você clica em ', Dom.el('strong', { text: 'Usar esta paleta' }), '. E o botão Desfazer (no Passo 1) traz a anterior de volta.']),
      Dom.el('div', { class: 'grading__layout' }, [controls, this.#result]),
    ]);
    this.#renderEmpty();
    this.#bus.on(StoreEvent.RESET, () => this.#clear());
  }

  // ---------- entrada da imagem ----------

  /** Abre um arquivo escolhido (ou arrastado) e analisa. Público para os testes. */
  async loadFile(file) {
    this.#clearError();
    if (!file) return;
    this.#status.textContent = 'Analisando a imagem…';
    let pixels;
    try {
      pixels = await this.#loader.readPixels(file, ANALYSIS_SIDE);
    } catch (err) {
      this.#fail(err.message || 'Não foi possível abrir esta imagem. Tente outro arquivo.');
      return;
    }
    this.#fileName.textContent = file.name;
    this.#fileName.title = file.name;
    if (this.#analyze(pixels, `na imagem "${file.name}"`)) this.#showThumb(pixels, `Imagem escolhida: ${file.name}`);
  }

  /** "Usar imagem de exemplo": a mesma paisagem do color grading. */
  useSample() {
    this.#clearError();
    const canvas = this.#sample.draw(document);
    const pixels = this.#loader.pixelsFrom(canvas, canvas.width, canvas.height, ANALYSIS_SIDE);
    this.#fileName.textContent = 'Imagem de exemplo';
    this.#fileName.title = '';
    // Aqui sabemos o que a imagem mostra, então a legenda descreve de verdade (auditoria a11y-web B3).
    if (this.#analyze(pixels, 'na imagem de exemplo')) this.#showThumb(pixels, `Imagem de exemplo: ${this.#sample.DESCRIPTION}`);
  }

  /** Desenha a miniatura a partir dos pixels já lidos (sem abrir o arquivo de novo). `caption`: a legenda visível. */
  #showThumb(pixels, caption) {
    const canvas = this.#thumbCanvas;
    canvas.width = pixels.width;
    canvas.height = pixels.height;
    // No navegador, os pixels já vêm como ImageData. Nos testes (jsdom), não há canvas: só montamos o rótulo.
    const ctx = typeof ImageData === 'undefined' ? null : canvas.getContext('2d');
    if (ctx) {
      const data = pixels instanceof ImageData ? pixels : new ImageData(pixels.data, pixels.width, pixels.height);
      ctx.putImageData(data, 0, 0);
    }
    this.#thumbCaption.textContent = caption;
    this.#thumb.hidden = false;
  }

  #hideThumb() {
    this.#thumb.hidden = true;
  }

  #bindDrop(zone) {
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('is-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('is-over');
      this.loadFile(e.dataTransfer?.files?.[0]);
    });
  }

  #fail(message) {
    this.#error.textContent = message;
    this.#fileInput.setAttribute('aria-invalid', 'true');
    this.#status.textContent = '';
    this.#analysis = null;
    this.#hideThumb(); // a miniatura antiga não vale mais
    this.#renderEmpty();
  }

  #clearError() {
    this.#error.textContent = '';
    this.#fileInput.removeAttribute('aria-invalid');
  }

  /**
   * Escreve no status (o leitor de tela anuncia). Se a frase for igual à anterior, o leitor
   * não repetiria: esvaziamos e escrevemos de novo um instante depois (auditoria a11y-web B5).
   */
  #announce(text) {
    if (this.#status.textContent !== text) {
      this.#status.textContent = text;
      return;
    }
    this.#status.textContent = '';
    setTimeout(() => { this.#status.textContent = text; }, 60);
  }

  /** Acha as cores e prepara a sugestão automática (com 3 cores ou mais). */
  #analyze(pixels, label) {
    const { colors, ignored, found } = this.#extractor.extract(pixels);
    if (colors.length === 0) {
      this.#fail('Não encontrei cores nesta imagem: ela parece toda transparente. Tente outra.');
      return false;
    }
    this.#analysis = { colors, ignored, found, label };
    this.#choice = [];
    this.#auto = colors.length >= 3 ? this.#suggester.fromDominants(colors) : null;
    this.#suggestion = this.#auto;
    this.#render();
    // O resumo completo (quantas cores, o que ficou de fora) fica junto do mosaico; aqui, só o aviso de pronto.
    this.#announce(colors.length >= 3
      ? 'Pronto! Confira o mosaico e a paleta sugerida.'
      : 'Pronto! Confira o mosaico e escolha o que fazer.');
    return true;
  }

  // ---------- ações ----------

  /**
   * Clique numa peça: marca ou desmarca. Com 3 marcadas, a sugestão passa a usar a escolha.
   * Cada clique é anunciado: o leitor de tela diz só "pressionado", e a pessoa precisa saber
   * quantas faltam, se alguma peça foi trocada e se a paleta ficou pronta (auditoria a11y-web M2).
   */
  #toggle(index) {
    const hexOf = (i) => this.#analysis.colors[i].color.hex;
    const at = this.#choice.indexOf(index);
    let dropped = null;
    if (at >= 0) this.#choice.splice(at, 1);
    else {
      this.#choice.push(index);
      if (this.#choice.length > 3) dropped = this.#choice.shift(); // a 4ª troca a mais antiga
    }
    this.#suggestion = this.#choice.length === 3 ? this.#fromChoice() : this.#auto;
    this.#render(`[data-index="${index}"]`);

    const n = this.#choice.length;
    let text;
    if (at >= 0) text = `Cor ${hexOf(index)} desmarcada. ${n} de 3.`;
    else if (dropped !== null) text = `Troquei ${hexOf(dropped)} por ${hexOf(index)}.`;
    else text = `Cor ${hexOf(index)} marcada, ${n} de 3.`;
    if (n === 3 && at < 0) {
      const s = this.#suggestion;
      text += s.ok ? ` Paleta sugerida com contraste ${s.level}, logo abaixo do mosaico.` : ` ${s.message}`;
    }
    this.#announce(text);
  }

  /** Sugestão com as 3 peças escolhidas. As origens voltam a apontar para as peças do mosaico. */
  #fromChoice() {
    const picked = this.#choice.map((i) => this.#analysis.colors[i]);
    const result = this.#suggester.fromChoice(picked);
    return { ...result, sources: result.sources.map((s) => (s === null ? null : this.#choice[s])) };
  }

  #backToAuto() {
    this.#choice = [];
    this.#suggestion = this.#auto;
    // O botão some no redesenho: o foco vai para o texto de ajuda, no mesmo lugar (auditoria a11y-web A3).
    this.#render('.image-palette__help p');
    this.#announce('Voltei para a sugestão automática.');
  }

  /** Com 1 cor: monocromática. Com 2: a 3ª cor sai dos tons das duas. */
  #complete() {
    const { colors } = this.#analysis;
    this.#suggestion = colors.length === 1 ? this.#suggester.monochrome(colors[0]) : this.#suggester.completeTwo(colors);
    this.#render('[data-action="image-palette-complete"]');
    this.#announce(this.#suggestion.ok ? `Paleta pronta logo abaixo, com contraste ${this.#suggestion.level}.` : this.#suggestion.message);
  }

  #apply() {
    const s = this.#suggestion;
    if (!s?.ok) return;
    this.#store.setPalette(s.palette, { message: { kind: 'success', text: `Paleta da imagem aplicada (${s.level}). ${s.message}` } });
    this.#toast.show('Paleta da imagem aplicada. Para voltar à anterior, use Desfazer no Passo 1.');
  }

  #clear() {
    this.#analysis = null;
    this.#choice = [];
    this.#auto = null;
    this.#suggestion = null;
    this.#clearError();
    this.#status.textContent = '';
    this.#fileName.textContent = 'Nenhuma imagem escolhida.';
    this.#fileName.title = '';
    this.#hideThumb();
    this.#renderEmpty();
  }

  // ---------- desenho ----------

  #renderEmpty() {
    const hadFocus = this.#result.contains(document.activeElement);
    Dom.replace(this.#result, [
      Dom.el('div', { class: 'stage-empty' }, 'O mosaico com as cores principais da imagem aparece aqui, com a paleta sugerida logo abaixo.'),
    ]);
    // O foco estava num botão que sumiu: devolvemos ao campo de arquivo, que lê o erro junto.
    if (hadFocus) this.#fileInput.focus();
  }

  /**
   * Redesenha o resultado. `focusSelector`: o que deve receber o foco depois (para o teclado não se perder).
   * Sem seletor, se o foco estava aqui dentro, ele vai para o resumo (auditoria a11y-web M1).
   */
  #render(focusSelector = null) {
    const hadFocus = this.#result.contains(document.activeElement);
    const { colors, ignored, found, label } = this.#analysis;
    const n = colors.length;
    const helpId = Dom.uid('mosaico-dica');
    const parts = [Dom.el('p', { class: 'image-palette__summary', tabindex: '-1' }, this.#summary(n, found, label))];
    if (ignored.length > 0) parts.push(Dom.el('p', { class: 'field__label' }, this.#ignoredNote(ignored)));
    parts.push(this.#mosaic(colors, helpId));
    parts.push(n >= 3 ? this.#choiceHelp(helpId) : this.#options(n, helpId));
    if (this.#suggestion) parts.push(this.#suggestionBox(this.#suggestion));
    Dom.replace(this.#result, parts);
    const target = focusSelector ? this.#result.querySelector(focusSelector) : null;
    if (target) target.focus();
    else if (hadFocus) this.#result.querySelector('.image-palette__summary').focus();
  }

  #summary(n, found, label) {
    const text = `Encontrei ${n} ${n === 1 ? 'cor' : 'cores'} ${label}.`;
    if (found <= n) return text;
    return `Encontrei ${found} cores ${label}. O mosaico mostra as 6 mais importantes: as 5 que ocupam mais área e 1 vaga para a cor mais viva.`;
  }

  #ignoredNote(ignored) {
    const items = ignored.map((g) => `o ${g.lab.L >= 0.5 ? 'branco' : 'preto'} (${g.color.hex}, ${NumberFormat.percent(g.share * 100)} da imagem)`);
    const list = items.length > 1 ? `${items.slice(0, -1).join(', ')} e ${items.at(-1)}` : items[0];
    return `Deixei de fora ${list}, que costuma ser o fundo. Branco e preto só entram quando faltam cores ou quando ocupam ${NumberFormat.percent(DominantColorPicker.EVIDENT_SHARE * 100)} da imagem ou mais.`;
  }

  /** O mosaico: peças em linhas, no formato certo para a quantidade de cores. */
  #mosaic(colors, helpId) {
    const n = colors.length;
    const rows = MosaicLayout.rows(n);
    const shape = MosaicLayout.shape(n);
    const selectable = n >= 3;
    const roles = this.#rolesInSuggestion();
    let index = 0;
    const rowEls = rows.map((size) => {
      const tiles = [];
      for (let k = 0; k < size; k += 1) {
        tiles.push(this.#tile(colors[index], index, selectable, roles.get(index)));
        index += 1;
      }
      return Dom.el('div', { class: 'mosaic__row' }, tiles);
    });
    return Dom.el('div', {
      class: `mosaic mosaic--${shape}`,
      role: 'group',
      'aria-label': `Mosaico com ${n} ${n === 1 ? 'cor' : 'cores'} da imagem, ${ImagePalettePanel.#shapeText(shape, rows)}`,
      // A instrução vem depois do mosaico na tela; assim, quem chega pelo Tab ouve antes (auditoria a11y-web B3).
      'aria-describedby': helpId,
    }, rowEls);
  }

  static #shapeText(shape, rows) {
    if (shape === 'piramide') return 'em pirâmide: 2 em cima e 3 embaixo';
    if (shape === 'linha') return 'em 1 linha';
    return `em ${rows.length} linhas de ${rows[0]}`;
  }

  /** Quais peças estão na paleta sugerida, e com que letra (A, B ou C). */
  #rolesInSuggestion() {
    const map = new Map();
    const s = this.#suggestion;
    if (!s?.ok) return map;
    s.sources.forEach((source, i) => { if (source !== null) map.set(source, Palette.LABELS[i]); });
    return map;
  }

  #tile({ color, share }, index, selectable, role) {
    // Texto preto ou branco, o que tiver mais contraste com a cor da peça.
    const text = this.#wcag.measure(BLACK, color) >= this.#wcag.measure(WHITE, color) ? BLACK : WHITE;
    const pressed = this.#choice.includes(index);
    const children = [
      // "Escolhida" escrito na peça: a seleção não depende só da borda (o leitor de tela já ouve "pressionado").
      pressed ? Dom.el('span', { class: 'mosaic__picked', 'aria-hidden': 'true' }, [Icons.svg('check'), 'Escolhida']) : null,
      Dom.el('span', { class: 'mosaic__hex', text: color.hex }),
      Dom.el('span', { class: 'mosaic__share', text: `${NumberFormat.percent(share * 100)} da imagem` }),
      role ? Dom.el('span', { class: 'mosaic__role', text: `Na paleta: cor ${role}` }) : null,
    ];
    const style = { background: color.hex, color: text.hex };
    if (!selectable) return Dom.el('div', { class: 'mosaic__tile frame', style }, children);
    return Dom.el('button', {
      type: 'button',
      class: 'mosaic__tile frame',
      'data-index': String(index),
      'aria-pressed': String(pressed),
      style,
      on: { click: () => this.#toggle(index) },
    }, children);
  }

  #choiceHelp(helpId) {
    const chosen = this.#choice.length;
    const help = chosen === 0
      ? 'A sugestão abaixo já escolhe o melhor trio. Prefere montar o seu? Clique em 3 cores do mosaico.'
      : `Você escolheu ${chosen} de 3 cores.${chosen < 3 ? ' Clique em mais ' + (3 - chosen) + ' para montar a sua paleta.' : ''} Clicar de novo numa cor desmarca.`;
    return Dom.el('div', { class: 'image-palette__help' }, [
      // tabindex -1: recebe o foco quando "Voltar à sugestão automática" some.
      Dom.el('p', { id: helpId, class: 'field__label', tabindex: '-1', text: help }),
      chosen > 0
        ? Dom.el('button', { type: 'button', class: 'btn btn--ghost btn--sm', 'data-action': 'image-palette-auto', on: { click: () => this.#backToAuto() } }, [Icons.svg('undo'), 'Voltar à sugestão automática'])
        : null,
    ]);
  }

  /** Com 1 ou 2 cores: carregar outra imagem ou completar a paleta. */
  #options(n, helpId) {
    const complete = n === 1 ? 'Gerar paleta monocromática' : 'Gerar a 3ª cor a partir das duas';
    const explain = n === 1
      ? 'Só encontrei 1 cor nesta imagem. Você pode tentar outra imagem ou gerar uma paleta monocromática: a cor da imagem com um tom mais claro e um mais escuro dela.'
      : 'Só encontrei 2 cores nesta imagem. Você pode tentar outra imagem ou gerar a 3ª cor: um tom mais claro ou mais escuro de uma das duas.';
    return Dom.el('div', { class: 'image-palette__options' }, [
      Dom.el('p', { id: helpId, class: 'field__label', text: explain }),
      Dom.el('div', { class: 'image-palette__buttons' }, [
        Dom.el('button', { type: 'button', class: 'btn btn--ghost', on: { click: () => this.#fileInput.click() } }, [Icons.svg('upload'), 'Carregar outra imagem']),
        Dom.el('button', { type: 'button', class: 'btn btn--primary', 'data-action': 'image-palette-complete', on: { click: () => this.#complete() } }, [Icons.svg('sparkle'), complete]),
      ]),
    ]);
  }

  #suggestionBox(s) {
    if (!s.ok) {
      return Dom.el('div', { class: 'image-suggestion' }, [Dom.el('p', { class: 'callout callout--warning', text: s.message })]);
    }
    const swatches = s.palette.colors.map((color, i) => {
      const source = s.sources[i];
      const adjusted = s.adjusted.includes(i);
      let origin = source === null ? 'tom novo' : 'da imagem';
      if (adjusted) origin += ', com brilho ajustado';
      return Dom.el('li', { class: 'image-suggestion__swatch' }, [
        Dom.el('span', { class: 'image-suggestion__chip frame', style: { background: color.hex }, 'aria-hidden': 'true' }),
        Dom.el('span', {}, [Dom.el('strong', { text: `Cor ${Palette.LABELS[i]}` }), ` ${color.hex} `, Dom.el('span', { class: 'image-suggestion__origin', text: `(${origin})` })]),
      ]);
    });
    return Dom.el('div', { class: 'image-suggestion' }, [
      // Título de verdade (h4): quem navega por títulos acha a sugestão direto (auditoria a11y-web B6).
      Dom.el('div', { class: 'image-suggestion__title' }, [
        Dom.el('h4', { text: 'Paleta sugerida' }),
        Dom.el('span', { class: 'badge', text: `Contraste ${s.level}` }),
      ]),
      Dom.el('ul', { class: 'image-suggestion__list' }, swatches),
      Dom.el('p', { class: 'image-suggestion__message', text: s.message }),
      Dom.el('button', { type: 'button', class: 'btn btn--primary', 'data-action': 'apply-image-palette', on: { click: () => this.#apply() } }, [Icons.svg('check'), 'Usar esta paleta']),
    ]);
  }
}
