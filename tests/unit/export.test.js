// Testes do layout do PNG, do registro de exportadores e dos serviços do navegador (RF-10 e RF-13).
import { describe, it, expect } from 'vitest';
import { Palette } from '../../src/domain/palette/Palette.js';
import { PngLayout } from '../../src/domain/export/PngLayout.js';
import { createExporters } from '../../src/domain/export/defaultExporters.js';
import { ClipboardService } from '../../src/infra/ClipboardService.js';
import { PreferenceStorage } from '../../src/infra/PreferenceStorage.js';

describe('PngLayout', () => {
  const layout = new PngLayout({ width: 1200, height: 630 }).build(Palette.default());

  it('divide a imagem em 3 faixas de mesma largura que cobrem tudo', () => {
    expect(layout.swatches).toHaveLength(3);
    expect(layout.swatches.reduce((sum, s) => sum + s.w, 0)).toBe(1200);
    expect(layout.swatches.map((s) => s.fill)).toEqual(['#230023', '#F2F2F2', '#42FFFF']);
  });

  it('cada faixa tem o HEX escrito na cor mais legível (preto ou branco)', () => {
    expect(layout.swatches[0].label).toBe('#230023');
    expect(layout.swatches[0].labelColor).toBe('#FFFFFF');
    expect(layout.swatches[1].labelColor).toBe('#000000');
  });
});

describe('createExporters', () => {
  it('registra os exportadores de texto (CSS e JSON) com nome de arquivo; o PNG usa o PngLayout', () => {
    const list = createExporters();
    expect(list.map((e) => e.id)).toEqual(['css', 'json']);
    for (const e of list) expect(e.fileName).toMatch(/^paletres\./);
  });
});

describe('ClipboardService', () => {
  it('usa a API moderna quando ela existe', async () => {
    let copied = null;
    const service = new ClipboardService({ clipboard: { writeText: async (t) => { copied = t; } } }, null);
    expect(await service.copy('#230023')).toBe(true);
    expect(copied).toBe('#230023');
  });

  it('devolve false quando nenhuma forma de copiar funciona', async () => {
    const service = new ClipboardService({}, null);
    expect(await service.copy('x')).toBe(false);
  });
});

describe('PreferenceStorage', () => {
  it('lê e grava; se o navegador bloquear, não quebra', () => {
    const mem = new Map();
    const ok = new PreferenceStorage({ getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) });
    ok.set('tema', 'dark');
    expect(ok.get('tema')).toBe('dark');

    const blocked = new PreferenceStorage({ getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('bloqueado'); } });
    expect(blocked.get('tema', 'light')).toBe('light');
    expect(() => blocked.set('tema', 'dark')).not.toThrow();
  });
});
