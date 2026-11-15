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

for (const [theme, url, when] of [['light', BRAND, 'com paleta'], ['dark', BRAND, 'com paleta'], ['light', '/', 'antes de gerar'], ['dark', '/', 'antes de gerar']]) {
  test(`sem violações sérias ou críticas no tema ${theme}, ${when}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
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
  test(`tints e shades: o foco muda o contorno (tema ${theme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
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
