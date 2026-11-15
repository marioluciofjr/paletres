// Contrato do link compartilhável (RF-11): ?p=rrggbb-rrggbb-rrggbb.
// A paleta fica na query string (?p=) para o hash (#) continuar livre para as âncoras do menu (#paleta, #tons…).
// Links antigos com a paleta no hash (#rrggbb-rrggbb-rrggbb) continuam funcionando.
import { describe, it, expect } from 'vitest';
import { Palette } from '../../src/domain/palette/Palette.js';
import { UrlStateCodec } from '../../src/infra/UrlStateCodec.js';

const fakeWindow = ({ search = '', hash = '' } = {}) => {
  const calls = [];
  return {
    calls,
    location: { search, hash, origin: 'https://exemplo.dev', pathname: '/paletres/' },
    history: { replaceState: (_s, _t, url) => calls.push(url) },
  };
};

describe('UrlStateCodec', () => {
  it('clear() tira a paleta (?p=) do endereço e mantém a âncora', () => {
    const w = fakeWindow({ search: '?p=230023-f2f2f2-42ffff', hash: '#paleta' });
    new UrlStateCodec(w).clear();
    expect(w.calls.at(-1)).toBe('/paletres/#paleta');
  });

  it('codifica em minúsculas, sem #, separadas por hífen', () => {
    expect(UrlStateCodec.encode(Palette.default())).toBe('230023-f2f2f2-42ffff');
  });

  it('decodifica maiúsculas, minúsculas, o formato curto e um # inicial', () => {
    expect(UrlStateCodec.decode('230023-F2F2F2-42ffff').hexes).toEqual(['#230023', '#F2F2F2', '#42FFFF']);
    expect(UrlStateCodec.decode('#fff-000-abc').hexes).toEqual(['#FFFFFF', '#000000', '#AABBCC']);
  });

  it('valor inválido devolve null (a página usa a paleta padrão)', () => {
    for (const bad of ['', '#', '123', 'zzzzzz-000000-ffffff', '000000-ffffff', '000000-ffffff-ff0000-123456']) {
      expect(UrlStateCodec.decode(bad)).toBeNull();
    }
  });

  it('read lê ?p= e, se não houver, aceita o formato antigo no hash', () => {
    expect(new UrlStateCodec(fakeWindow({ search: '?p=000000-ffffff-ff0000' })).read().hexes).toEqual(['#000000', '#FFFFFF', '#FF0000']);
    expect(new UrlStateCodec(fakeWindow({ hash: '#000000-ffffff-ff0000' })).read().hexes).toEqual(['#000000', '#FFFFFF', '#FF0000']);
    expect(new UrlStateCodec(fakeWindow({ hash: '#tons' })).read()).toBeNull();
  });

  it('readLegacyHash só reage ao formato antigo no # (âncoras do menu são ignoradas) (auditoria N01)', () => {
    expect(new UrlStateCodec(fakeWindow({ search: '?p=000000-ffffff-ff0000', hash: '#tons' })).readLegacyHash()).toBeNull();
    expect(new UrlStateCodec(fakeWindow({ search: '?p=000000-ffffff-ff0000', hash: '#111111-222222-333333' })).readLegacyHash().hexes)
      .toEqual(['#111111', '#222222', '#333333']);
  });

  it('hasInvalid avisa quando o link trouxe uma paleta quebrada', () => {
    expect(new UrlStateCodec(fakeWindow({ search: '?p=000000-ffffff' })).hasInvalid()).toBe(true);
    expect(new UrlStateCodec(fakeWindow({ search: '' })).hasInvalid()).toBe(false);
    expect(new UrlStateCodec(fakeWindow({ hash: '#tons' })).hasInvalid()).toBe(false);
  });

  it('write grava ?p= sem recarregar e preserva a âncora atual', () => {
    const w = fakeWindow({ hash: '#tons' });
    new UrlStateCodec(w).write(Palette.default());
    expect(w.calls).toEqual(['?p=230023-f2f2f2-42ffff#tons']);
  });

  it('write descarta o hash antigo que era uma paleta', () => {
    const w = fakeWindow({ hash: '#000000-ffffff-ff0000' });
    new UrlStateCodec(w).write(Palette.default());
    expect(w.calls).toEqual(['?p=230023-f2f2f2-42ffff']);
  });

  it('shareUrl monta o link completo', () => {
    expect(new UrlStateCodec(fakeWindow()).shareUrl(Palette.default())).toBe('https://exemplo.dev/paletres/?p=230023-f2f2f2-42ffff');
  });
});
