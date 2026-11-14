// Contrato do link compartilhável (RF-11): #rrggbb-rrggbb-rrggbb.
import { describe, it, expect } from 'vitest';
import { Palette } from '../../src/domain/palette/Palette.js';
import { UrlStateCodec } from '../../src/infra/UrlStateCodec.js';

const fakeWindow = (hash = '') => {
  const calls = [];
  return {
    calls,
    location: { hash, origin: 'https://exemplo.dev', pathname: '/paletres/' },
    history: { replaceState: (_s, _t, url) => calls.push(url) },
  };
};

describe('UrlStateCodec', () => {
  it('codifica em minúsculas, sem #, separadas por hífen', () => {
    expect(UrlStateCodec.encode(Palette.default())).toBe('#230023-f2f2f2-42ffff');
  });

  it('decodifica maiúsculas, minúsculas e o formato curto', () => {
    expect(UrlStateCodec.decode('#230023-F2F2F2-42ffff').hexes).toEqual(['#230023', '#F2F2F2', '#42FFFF']);
    expect(UrlStateCodec.decode('#fff-000-abc').hexes).toEqual(['#FFFFFF', '#000000', '#AABBCC']);
  });

  it('hash inválido devolve null (a página usa a paleta padrão)', () => {
    for (const bad of ['', '#', '#123', '#zzzzzz-000000-ffffff', '#000000-ffffff']) {
      expect(UrlStateCodec.decode(bad)).toBeNull();
    }
  });

  it('read lê da URL e write troca o hash sem recarregar a página', () => {
    const w = fakeWindow('#000000-ffffff-ff0000');
    const codec = new UrlStateCodec(w);
    expect(codec.read().hexes).toEqual(['#000000', '#FFFFFF', '#FF0000']);
    codec.write(Palette.default());
    expect(w.calls).toEqual(['#230023-f2f2f2-42ffff']);
  });

  it('shareUrl monta o link completo', () => {
    const codec = new UrlStateCodec(fakeWindow());
    expect(codec.shareUrl(Palette.default())).toBe('https://exemplo.dev/paletres/#230023-f2f2f2-42ffff');
  });
});
