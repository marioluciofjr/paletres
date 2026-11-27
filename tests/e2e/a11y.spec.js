// Varredura automática de acessibilidade (RNF-01) com axe-core, nos temas claro e escuro.
// Falha com violações de impacto "serious" ou "critical".
//
// Exclusão documentada: as PRÉVIAS com as cores do usuário (cards de comparação, mockups,
// bolas do topo) mostram de propósito pares com contraste ruim, porque são o objeto do teste.
// O texto delas é decorativo (aria-hidden); o resultado é dito em texto fora da prévia.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const USER_COLOR_PREVIEWS = ['.cmp__preview', '.msite', '.mapp', '.hero__art', '.share-bar', '.stage'];
// Paleta conhecida por link: o site já abre liberado (sem o portão do RF-25).
const BRAND = '/?p=230023-f2f2f2-42ffff';
// O site abre sempre no claro; o escuro vem da escolha salva pelo botão de tema.
const useTheme = (page, theme) => page.addInitScript((t) => localStorage.setItem('paletres:tema', t), theme);

for (const [theme, url, when] of [['light', BRAND, 'com paleta'], ['dark', BRAND, 'com paleta'], ['light', '/', 'antes de gerar'], ['dark', '/', 'antes de gerar']]) {
  test(`sem violações sérias ou críticas no tema ${theme}, ${when}`, async ({ page }) => {
    await useTheme(page, theme);
    await page.goto(url);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']);
    for (const sel of USER_COLOR_PREVIEWS) builder = builder.exclude(sel);
    const { violations } = await builder.analyze();
    const serious = violations.filter((v) => ['serious', 'critical'].includes(v.impact));
    const report = serious.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
    expect(report, report.join('\n')).toEqual([]);
  });
}

// Paleta a partir de uma imagem (RF-35): o mosaico só aparece depois de carregar uma imagem,
// então a varredura geral não o vê. Aqui carregamos a imagem de exemplo, marcamos uma peça e varremos o painel.
for (const theme of ['light', 'dark']) {
  test(`paleta da imagem: mosaico e sugestão sem violações sérias (tema ${theme})`, async ({ page }) => {
    await useTheme(page, theme);
    await page.goto(BRAND);
    const panel = page.locator('[data-component="image-palette"]');
    await panel.getByRole('button', { name: 'Usar imagem de exemplo' }).click();
    await panel.locator('.mosaic__tile').first().click();
    await expect(panel.locator('.image-suggestion')).toBeVisible();
    const { violations } = await new AxeBuilder({ page })
      .include('[data-component="image-palette"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = violations.filter((v) => ['serious', 'critical'].includes(v.impact));
    const report = serious.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
    expect(report, report.join('\n')).toEqual([]);
  });
}

test('o primeiro Tab leva ao link "Pular para a ferramenta"', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para a ferramenta' })).toBeFocused();
});

test('alvos interativos têm pelo menos 24×24 px (WCAG 2.5.8)', async ({ page }) => {
  await page.goto(BRAND);
  const small = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('button, a[href], input:not([type="hidden"]), select, [role="slider"]')) {
      if (el.closest('.visually-hidden, [hidden]') || el.classList.contains('visually-hidden')) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue; // fora da tela (ex.: rádios ocultos com rótulo de 44px)
      if (el.type === 'radio') continue;
      const inline = el.closest('p') && el.tagName === 'A';
      if (!inline && (r.width < 24 || r.height < 24)) out.push(`${el.tagName}.${el.className} ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
    return out;
  });
  expect(small, small.join('\n')).toEqual([]);
});

// ---------- Foco visível e anúncios (auditoria a11y-web: C1, A1, A2, B12) ----------
// O axe não mede se o foco aparece nem se a região viva "fala demais". Estes testes medem.

/** Estilo de contorno calculado de um elemento. */
const outlineOf = (locator) => locator.evaluate((el) => {
  const s = getComputedStyle(el);
  return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor} ${s.outlineOffset}`;
});

for (const theme of ['light', 'dark']) {
  test(`tons claros e escuros: o foco muda o contorno (tema ${theme})`, async ({ page }) => {
    await useTheme(page, theme);
    await page.goto(BRAND);
    for (const cell of [page.locator('.tint-cell').first(), page.locator('.tint-cell').nth(9)]) {
      const before = await outlineOf(cell);
      await cell.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      const after = await outlineOf(cell);
      expect(after).not.toBe(before);
    }
  });
}

test('roda cromática: o foco é visível no controle inteiro', async ({ page }) => {
  await page.goto(BRAND);
  const stage = page.locator('.wheel__stage');
  const before = await outlineOf(stage);
  await page.locator('.wheel__svg').focus();
  await page.keyboard.press('ArrowRight');
  expect(await outlineOf(stage)).not.toBe(before);
});

test('regiões vivas não falam a cada passo do slider (no máximo 1 anúncio por região)', async ({ page }) => {
  await page.goto(BRAND);
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    // Conta quantas vezes cada região muda de texto (um "anúncio" para o leitor de tela).
    window.__announcements = [];
    document.querySelectorAll('[role="status"], [aria-live]').forEach((el, i) => {
      if (el.closest('.toast')) return;
      window.__announcements[i] = 0;
      let last = el.textContent;
      new MutationObserver(() => {
        if (el.textContent !== last) {
          last = el.textContent;
          window.__announcements[i] += 1;
        }
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });
  });
  const hue = page.locator('#paleta input[type="range"]').first();
  await hue.focus();
  for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(1200);
  const counts = (await page.evaluate(() => window.__announcements)).filter((n) => n !== null);
  expect(Math.max(0, ...counts)).toBeLessThanOrEqual(1);
});

// Auditoria a11y-web da v1.2.0 (paleta a partir de uma imagem): foco visível nas peças do mosaico.
for (const theme of ['light', 'dark']) {
  test(`mosaico: o foco aparece na peça, e a peça escolhida com foco ganha um 2º anel (tema ${theme})`, async ({ page }) => {
    await useTheme(page, theme);
    await page.goto(BRAND);
    const panel = page.locator('[data-component="image-palette"]');
    await panel.getByRole('button', { name: 'Usar imagem de exemplo' }).click();
    const tile = panel.locator('.mosaic__tile').nth(1);
    // A1: peça não escolhida, com e sem foco do teclado.
    const before = await outlineOf(tile);
    await panel.locator('.mosaic__tile').nth(0).focus();
    await page.keyboard.press('Tab');
    await expect(tile).toBeFocused();
    expect(await outlineOf(tile)).not.toBe(before);
    // A2: peça escolhida com foco = anel da escolha + 2º anel (box-shadow).
    await page.keyboard.press('Enter');
    await expect(tile).toHaveAttribute('aria-pressed', 'true');
    await expect(tile).toBeFocused();
    const shadow = await tile.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe('none');
  });
}

test('mosaico a 320px: "Escolhida" cabe dentro da peça e a página não rola para o lado', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(BRAND);
  const panel = page.locator('[data-component="image-palette"]');
  await panel.getByRole('button', { name: 'Usar imagem de exemplo' }).click();
  const tiles = panel.locator('.mosaic__tile');
  for (const i of [0, 1, 2]) await tiles.nth(i).click();
  const overflows = await panel.locator('.mosaic__tile[aria-pressed="true"]').evaluateAll((els) => els.map((el) => {
    const picked = el.querySelector('.mosaic__picked').getBoundingClientRect();
    const box = el.getBoundingClientRect();
    return picked.right - box.right;
  }));
  for (const o of overflows) expect(o).toBeLessThanOrEqual(0);
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBe(0);
});
