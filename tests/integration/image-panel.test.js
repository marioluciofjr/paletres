// @vitest-environment jsdom
// Integração do painel "Paleta a partir de uma imagem" (RF-35) com o estado, num DOM simulado.
// O carregador de imagem é falso: devolve pixels sintéticos, sem canvas (o jsdom não tem canvas).
import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../../src/app/EventBus.js';
import { PaletteStore } from '../../src/app/PaletteStore.js';
import { RandomSource } from '../../src/infra/RandomSource.js';
import { ImageLoadError } from '../../src/infra/ImageFileLoader.js';
import { ImagePalettePanel } from '../../src/ui/ImagePalettePanel.js';
import { syntheticImage, evenImage, VIVID } from '../helpers/syntheticImage.js';

const fakeToast = () => ({ messages: [], show(t) { this.messages.push(t); } });
const fakeLoader = (pixels) => ({
  async readPixels() {
    if (pixels instanceof Error) throw pixels;
    return pixels;
  },
});

let bus;
let store;
let root;
let toast;

/** Monta o painel com um carregador que devolve a "imagem" pedida e carrega um arquivo falso. */
async function mountWith(pixels, name = 'foto.png') {
  const panel = new ImagePalettePanel({ root, store, bus, toast, loader: fakeLoader(pixels) });
  panel.mount();
  await panel.loadFile({ name, type: 'image/png', size: 1000 });
  return panel;
}

const tiles = () => [...root.querySelectorAll('.mosaic__tile')];
const rowSizes = () => [...root.querySelectorAll('.mosaic__row')].map((r) => r.querySelectorAll('.mosaic__tile').length);
const button = (text) => [...root.querySelectorAll('button')].find((b) => b.textContent.includes(text));
const suggestion = () => root.querySelector('.image-suggestion');

beforeEach(() => {
  document.body.innerHTML = '';
  root = document.createElement('div');
  document.body.append(root);
  bus = new EventBus();
  store = PaletteStore.create({ bus, rng: RandomSource.seeded(3) });
  store.start();
  toast = fakeToast();
});

describe('ImagePalettePanel: o mosaico conforme a quantidade de cores', () => {
  it('6 cores → grade de 2 linhas e 3 colunas, com sugestão pronta', async () => {
    await mountWith(evenImage(VIVID.slice(0, 6)));
    expect(rowSizes()).toEqual([3, 3]);
    expect(root.querySelector('.mosaic').className).toContain('mosaic--grade');
    expect(suggestion().querySelectorAll('.image-suggestion__swatch')).toHaveLength(3);
    expect(root.textContent).toContain('Encontrei 6 cores');
  });

  it('mais de 6 cores → mostra só 6', async () => {
    await mountWith(evenImage(VIVID));
    expect(tiles()).toHaveLength(6);
  });

  it('5 cores → pirâmide de base 3 (2 em cima, 3 embaixo)', async () => {
    await mountWith(evenImage(VIVID.slice(0, 5)));
    expect(rowSizes()).toEqual([2, 3]);
    expect(root.querySelector('.mosaic').className).toContain('mosaic--piramide');
  });

  it('4 cores → grade 2 × 2', async () => {
    await mountWith(evenImage(VIVID.slice(0, 4)));
    expect(rowSizes()).toEqual([2, 2]);
  });

  it('3 cores → uma linha com as 3 e a sugestão ajustada', async () => {
    await mountWith(evenImage(VIVID.slice(0, 3)));
    expect(rowSizes()).toEqual([3]);
    expect(suggestion()).not.toBeNull();
  });

  it('cada peça mostra o HEX e quanto da imagem ela ocupa (não só a cor)', async () => {
    await mountWith(evenImage(VIVID.slice(0, 6)));
    const first = tiles()[0];
    expect(first.textContent).toMatch(/#[0-9A-F]{6}/);
    expect(first.textContent).toMatch(/\d+%/);
  });
});

describe('ImagePalettePanel: imagens com 1 ou 2 cores', () => {
  it('1 cor → oferece carregar outra imagem ou gerar a paleta monocromática', async () => {
    await mountWith(evenImage(['#2A9D8F']));
    expect(suggestion()).toBeNull();
    expect(button('Carregar outra imagem')).toBeDefined();
    button('Gerar paleta monocromática').click();
    expect(suggestion()).not.toBeNull();
    expect(suggestion().textContent).toContain('monocromática');
  });

  it('2 cores → oferece carregar outra imagem ou gerar a 3ª cor a partir das duas', async () => {
    await mountWith(evenImage(['#2A9D8F', '#E9C46A']));
    expect(suggestion()).toBeNull();
    expect(button('Carregar outra imagem')).toBeDefined();
    button('Gerar a 3ª cor').click();
    expect(suggestion().querySelectorAll('.image-suggestion__swatch')).toHaveLength(3);
    expect(suggestion().textContent).toContain('tom novo');
  });

  it('com 1 ou 2 cores, as peças não são botões (não há trio para escolher)', async () => {
    await mountWith(evenImage(['#2A9D8F', '#E9C46A']));
    expect(root.querySelectorAll('button.mosaic__tile')).toHaveLength(0);
  });
});

describe('ImagePalettePanel: escolha manual e aplicação', () => {
  it('"Usar esta paleta" troca a paleta e dá para desfazer', async () => {
    await mountWith(evenImage(VIVID.slice(0, 6)));
    const before = store.state.palette.hexes.join();
    button('Usar esta paleta').click();
    expect(store.state.palette.hexes.join()).not.toBe(before);
    expect(store.canUndo).toBe(true);
    expect(toast.messages.at(-1)).toContain('Desfazer');
  });

  it('clicar em 3 peças monta a paleta com elas; a 4ª troca a mais antiga', async () => {
    await mountWith(evenImage(VIVID.slice(0, 6)));
    const [t0, t1, t2, t3] = tiles();
    t0.click();
    t1.click();
    t2.click();
    expect(tiles().filter((t) => t.getAttribute('aria-pressed') === 'true')).toHaveLength(3);
    expect(suggestion().textContent).toContain('que você escolheu');
    t3.click();
    const pressed = tiles().map((t) => t.getAttribute('aria-pressed'));
    expect(pressed.slice(0, 4)).toEqual(['false', 'true', 'true', 'true']);
  });

  it('clicar de novo numa peça escolhida desmarca; "Voltar à sugestão automática" limpa tudo', async () => {
    await mountWith(evenImage(VIVID.slice(0, 6)));
    tiles()[0].click();
    tiles()[0].click();
    expect(tiles()[0].getAttribute('aria-pressed')).toBe('false');
    tiles()[1].click();
    button('Voltar à sugestão automática').click();
    expect(tiles().every((t) => t.getAttribute('aria-pressed') === 'false')).toBe(true);
    expect(suggestion().textContent).toContain('a partir das cores da imagem');
  });
});

describe('ImagePalettePanel: foco e anúncios (auditoria a11y-web da v1.2.0)', () => {
  const status = () => root.querySelector('[role="status"]').textContent;

  it('A3: "Voltar à sugestão automática" leva o foco ao texto de ajuda (não ao topo da página)', async () => {
    await mountWith(evenImage(VIVID.slice(0, 6)));
    tiles()[0].click();
    button('Voltar à sugestão automática').focus();
    button('Voltar à sugestão automática').click();
    expect(document.activeElement).toBe(root.querySelector('.image-palette__help p'));
  });

  it('M1: se o foco estava no resultado e ele é redesenhado, o foco vai para o resumo', async () => {
    const panel = await mountWith(evenImage(['#2A9D8F']));
    button('Carregar outra imagem').focus();
    await panel.loadFile({ name: 'outra.png', type: 'image/png', size: 1000 });
    expect(document.activeElement).toBe(root.querySelector('.image-palette__summary'));
  });

  it('M2: marcar peças anuncia o progresso, a troca da mais antiga e a paleta pronta', async () => {
    await mountWith(evenImage(VIVID.slice(0, 6)));
    tiles()[0].click();
    expect(status()).toMatch(/1 de 3/);
    tiles()[1].click();
    tiles()[2].click();
    expect(status()).toMatch(/Paleta sugerida com contraste AA/);
    tiles()[3].click();
    expect(status()).toMatch(/Troquei/);
    tiles()[3].click();
    expect(status()).toMatch(/desmarcada/);
  });

  it('B3/B6: o mosaico aponta para a instrução, e "Paleta sugerida" é um título', async () => {
    await mountWith(evenImage(VIVID.slice(0, 6)));
    const describedBy = root.querySelector('.mosaic').getAttribute('aria-describedby');
    expect(root.querySelector(`#${describedBy}`).textContent).toContain('Clique em 3 cores');
    expect(root.querySelector('.image-suggestion h4').textContent).toContain('Paleta sugerida');
  });

  it('B4: o campo de arquivo é ligado à dica e ao erro; com erro, fica marcado como inválido', async () => {
    await mountWith(new ImageLoadError('Formato não aceito. Use uma foto JPG, PNG ou WebP.'));
    const input = root.querySelector('input[type="file"]');
    const ids = input.getAttribute('aria-describedby').split(' ');
    expect(ids.map((id) => root.querySelector(`#${id}`).textContent).join(' ')).toContain('Formato não aceito');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});

describe('ImagePalettePanel: avisos', () => {
  it('fundo branco discreto: avisa que ficou de fora', async () => {
    await mountWith(syntheticImage([{ hex: '#FFFFFF', count: 2000 }, ...VIVID.slice(0, 4).map((hex) => ({ hex, count: 1000 }))]));
    expect(rowSizes()).toEqual([2, 2]);
    expect(root.textContent).toMatch(/Deixei de fora o branco/);
  });

  it('erro ao abrir a imagem aparece em texto, num alerta', async () => {
    await mountWith(new ImageLoadError('Formato não aceito. Use uma foto JPG, PNG ou WebP.'));
    expect(root.querySelector('[role="alert"]').textContent).toContain('Formato não aceito');
    expect(root.querySelector('.mosaic')).toBeNull();
  });

  it('imagem toda transparente: explica que não achou cores', async () => {
    await mountWith(syntheticImage([{ hex: '#000000', count: 500, alpha: 0 }]));
    expect(root.querySelector('[role="alert"]').textContent).toContain('Não encontrei cores');
  });

  it('"Começar do zero" limpa o resultado da imagem', async () => {
    await mountWith(evenImage(VIVID.slice(0, 6)));
    store.reset();
    expect(root.querySelector('.mosaic')).toBeNull();
  });
});
