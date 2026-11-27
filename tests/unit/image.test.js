// Testes da paleta a partir de uma imagem (RF-35): OKLab, cores dominantes, mosaico e sugestão do trio.
import { describe, it, expect } from 'vitest';
import { Color } from '../../src/domain/color/Color.js';
import { Oklab } from '../../src/domain/color/Oklab.js';
import { ImagePaletteExtractor } from '../../src/domain/image/ImagePaletteExtractor.js';
import { MosaicLayout } from '../../src/domain/image/MosaicLayout.js';
import { PaletteSuggester } from '../../src/domain/image/PaletteSuggester.js';
import { ContrastGuard } from '../../src/domain/guard/ContrastGuard.js';
import { Wcag2Contrast } from '../../src/domain/contrast/Wcag2Contrast.js';
import { syntheticImage as image, VIVID } from '../helpers/syntheticImage.js';

const extractor = new ImagePaletteExtractor();
const near = (a, b) => Oklab.distance(Oklab.fromColor(a), Oklab.fromColor(Color.fromHex(b))) < 0.03;

describe('Oklab', () => {
  it('branco tem claridade 1 e preto, 0', () => {
    expect(Oklab.fromColor(Color.fromHex('#FFFFFF')).L).toBeCloseTo(1, 3);
    expect(Oklab.fromColor(Color.fromHex('#000000')).L).toBeCloseTo(0, 3);
  });

  it('cinza não tem croma; vermelho tem bastante', () => {
    expect(Oklab.chroma(Oklab.fromColor(Color.fromHex('#808080')))).toBeLessThan(0.001);
    expect(Oklab.chroma(Oklab.fromColor(Color.fromHex('#FF0000')))).toBeGreaterThan(0.2);
  });

  it('distância é zero entre cores iguais e cresce com a diferença', () => {
    const a = Oklab.fromColor(Color.fromHex('#336699'));
    const b = Oklab.fromColor(Color.fromHex('#3366AA'));
    const c = Oklab.fromColor(Color.fromHex('#FF6600'));
    expect(Oklab.distance(a, a)).toBe(0);
    expect(Oklab.distance(a, b)).toBeLessThan(Oklab.distance(a, c));
  });
});

describe('ImagePaletteExtractor: quantas cores a imagem tem', () => {
  it('imagem de uma cor só → 1 cor', () => {
    const r = extractor.extract(image([{ hex: '#2A9D8F', count: 5000 }]));
    expect(r.colors).toHaveLength(1);
    expect(near(r.colors[0].color, '#2A9D8F')).toBe(true);
  });

  it('uma cor com ruído de JPEG continua sendo 1 cor', () => {
    const r = extractor.extract(image([{ hex: '#2A9D8F', count: 5000 }], { noise: 5 }));
    expect(r.colors).toHaveLength(1);
  });

  it.each([2, 3, 4, 5, 6])('%i cores bem diferentes → %i cores, parecidas com as originais', (n) => {
    const hexes = VIVID.slice(0, n);
    const r = extractor.extract(image(hexes.map((hex) => ({ hex, count: 1200 }))));
    expect(r.colors).toHaveLength(n);
    for (const hex of hexes) expect(r.colors.some((c) => near(c.color, hex))).toBe(true);
  });

  it('mais de 6 cores → fica com 6, ordenadas da que ocupa mais área para a que ocupa menos', () => {
    const regions = VIVID.map((hex, i) => ({ hex, count: 2000 - i * 150 }));
    const r = extractor.extract(image(regions));
    expect(r.colors).toHaveLength(6);
    expect(r.found).toBeGreaterThan(6); // a tela usa para explicar o corte
    const shares = r.colors.map((c) => c.share);
    expect([...shares].sort((a, b) => b - a)).toEqual(shares);
  });

  it('a 6ª vaga vai para uma cor viva, mesmo pequena (vaga de destaque)', () => {
    // 7 tons apagados ocupando quase tudo e um vermelho vivo pequeno.
    const muted = ['#6B705C', '#A5A58D', '#B7B7A4', '#3F4238', '#8D99AE', '#7F5539', '#BC8A5F'];
    const regions = [...muted.map((hex) => ({ hex, count: 1400 })), { hex: '#FF1F1F', count: 300 }];
    const r = extractor.extract(image(regions));
    expect(r.colors).toHaveLength(6);
    expect(r.colors.some((c) => near(c.color, '#FF1F1F'))).toBe(true);
  });

  it('pixels transparentes são ignorados', () => {
    const r = extractor.extract(image([{ hex: '#000000', count: 6000, alpha: 0 }, { hex: '#E63946', count: 3000 }]));
    expect(r.colors).toHaveLength(1);
    expect(near(r.colors[0].color, '#E63946')).toBe(true);
  });

  it('manchas minúsculas (menos de 1% da imagem) não contam como cor', () => {
    // 30 de 6000 pixels = 0,5% (contas exatas: 6000 é múltiplo da largura, então não sobra linha).
    const r = extractor.extract(image([{ hex: '#E63946', count: 5970 }, { hex: '#2A9D8F', count: 30 }]));
    expect(r.colors).toHaveLength(1);
  });
});

describe('ImagePaletteExtractor: fundo branco ou preto', () => {
  const four = VIVID.slice(0, 4).map((hex) => ({ hex, count: 1000 }));

  it('fundo branco discreto fica de fora e é informado', () => {
    const r = extractor.extract(image([{ hex: '#FFFFFF', count: 2000 }, ...four])); // 33% da imagem
    expect(r.colors).toHaveLength(4);
    expect(r.ignored).toHaveLength(1);
    expect(near(r.ignored[0].color, '#FFFFFF')).toBe(true);
  });

  it('branco muito evidente (40% ou mais da imagem) entra como cor', () => {
    const r = extractor.extract(image([{ hex: '#FFFFFF', count: 4000 }, ...four])); // 50%
    expect(r.colors).toHaveLength(5);
    expect(r.ignored).toHaveLength(0);
  });

  it('com carência de cores, branco e preto entram (logo preto no fundo branco → 2 cores)', () => {
    const r = extractor.extract(image([{ hex: '#FFFFFF', count: 7000 }, { hex: '#111111', count: 1500 }, { hex: '#FDFDFD', count: 500 }]));
    expect(r.colors).toHaveLength(2);
    expect(r.ignored).toHaveLength(0);
  });

  it('preto discreto também fica de fora quando há cores suficientes', () => {
    const r = extractor.extract(image([{ hex: '#050505', count: 1500 }, ...four]));
    expect(r.colors).toHaveLength(4);
    expect(near(r.ignored[0].color, '#050505')).toBe(true);
  });

  it('imagem sem nenhum pixel visível → 0 cores', () => {
    const r = extractor.extract(image([{ hex: '#000000', count: 500, alpha: 0 }]));
    expect(r.colors).toHaveLength(0);
  });
});

describe('MosaicLayout', () => {
  it.each([
    [1, [1]],
    [2, [2]],
    [3, [3]],
    [4, [2, 2]],
    [5, [2, 3]],
    [6, [3, 3]],
  ])('%i cores → linhas %j', (n, rows) => {
    expect(MosaicLayout.rows(n)).toEqual(rows);
  });

  it('5 cores formam a pirâmide de base 3 (2 em cima, 3 embaixo)', () => {
    expect(MosaicLayout.shape(5)).toBe('piramide');
    expect(MosaicLayout.shape(6)).toBe('grade');
  });

  it('quantidade fora de 1 a 6 é recusada', () => {
    expect(() => MosaicLayout.rows(0)).toThrow();
    expect(() => MosaicLayout.rows(7)).toThrow();
  });
});

describe('PaletteSuggester', () => {
  const wcag = new Wcag2Contrast();
  const suggester = new PaletteSuggester({ guard: new ContrastGuard() });
  const item = (hex, share = 0.1) => ({ color: Color.fromHex(hex), share });
  const textPair = (r) => wcag.measure(r.palette.at(0), r.palette.at(r.textIndex));

  it('com 6 cores, escolhe um trio que passa em AAA tentando primeiro o AAA', () => {
    const items = ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#F1FAEE'].map((h) => item(h, 1 / 6));
    const r = suggester.fromDominants(items);
    expect(r.ok).toBe(true);
    expect(r.level).toBe('AAA');
    expect(textPair(r)).toBeGreaterThanOrEqual(7);
    expect(r.sources).toHaveLength(3);
    expect(new Set(r.sources).size).toBe(3);
  });

  it('as 3 cores sugeridas vêm do mosaico (iguais ou só com o brilho ajustado)', () => {
    const items = ['#264653', '#2A9D8F', '#E9C46A', '#F4A261'].map((h) => item(h, 0.25));
    const r = suggester.fromDominants(items);
    r.palette.colors.forEach((c, i) => {
      const source = items[r.sources[i]].color;
      expect(Oklab.distance(Oklab.fromColor(c), Oklab.fromColor(source))).toBeLessThanOrEqual(PaletteSuggester.MAX_SHIFT + 1e-9);
    });
  });

  it('prefere cores que ocupam mais área quando o contraste empata', () => {
    // Preto, branco e dois vermelhos quase iguais: o vermelho com mais área deve ganhar.
    const items = [item('#000000', 0.3), item('#FFFFFF', 0.3), item('#E63946', 0.3), item('#E8414E', 0.02)];
    const r = suggester.fromDominants(items);
    expect(r.sources).not.toContain(3);
  });

  it('escolha manual: usa exatamente as 3 cores escolhidas', () => {
    const items = [item('#264653'), item('#E9C46A'), item('#F4A261')];
    const r = suggester.fromChoice(items);
    expect(r.ok).toBe(true);
    expect([...r.sources].sort()).toEqual([0, 1, 2]);
  });

  it('cai para AA (e avisa) quando o AAA pediria mudar demais as cores', () => {
    // maxShift 0: nenhuma cor pode mudar. Branco + #767676 passa em AA (4,54:1), mas não em AAA.
    const strict = new PaletteSuggester({ guard: new ContrastGuard(), maxShift: 0 });
    const r = strict.fromChoice([item('#FFFFFF'), item('#767676'), item('#949494')]);
    expect(r.ok).toBe(true);
    expect(r.level).toBe('AA');
    expect(r.fellBack).toBe(true);
    expect(r.message).toMatch(/AAA/);
    expect(r.adjusted).toEqual([]);
  });

  it('2 cores: completa com um tom mais claro ou mais escuro de uma delas', () => {
    const r = suggester.completeTwo([item('#2A9D8F'), item('#E9C46A')]);
    expect(r.ok).toBe(true);
    expect(r.palette.distinctCount()).toBe(3);
    // Uma das 3 cores é o tom novo; as outras duas vieram da imagem.
    expect(r.sources.filter((s) => s === null)).toHaveLength(1);
  });

  it('1 cor: monta a paleta monocromática (mesma matiz, claridades diferentes)', () => {
    const r = suggester.monochrome(item('#2A9D8F'));
    expect(r.ok).toBe(true);
    expect(r.palette.distinctCount()).toBe(3);
    const hue = (c) => c.hsb.h;
    const base = hue(Color.fromHex('#2A9D8F'));
    for (const c of r.palette.colors) {
      if (c.hsb.s > 5 && c.hsb.b > 5) expect(Math.abs(hue(c) - base)).toBeLessThan(6);
    }
  });

  it('1 cor branca: a monocromática vira uma escala de cinzas que passa no contraste', () => {
    const r = suggester.monochrome(item('#FFFFFF'));
    expect(r.ok).toBe(true);
    expect(textPair(r)).toBeGreaterThanOrEqual(4.5);
  });

  it('a mensagem diz o nível e, se ajustou, quais cores mudaram', () => {
    const r = suggester.fromChoice([item('#3366CC'), item('#6699FF'), item('#99BBFF')]);
    expect(r.ok).toBe(true);
    expect(r.message).toMatch(new RegExp(r.level));
    if (r.adjusted.length > 0) expect(r.message).toMatch(/ajust/i);
  });

  it('é determinística: a mesma entrada dá a mesma sugestão', () => {
    const items = ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'].map((h) => item(h, 0.2));
    expect(suggester.fromDominants(items).palette.hexes).toEqual(suggester.fromDominants(items).palette.hexes);
  });
});
