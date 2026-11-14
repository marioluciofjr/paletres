// Testes de ponta a ponta (e2e): o Paletrês de verdade, no Chromium.
import { test, expect } from '@playwright/test';

const hexInputs = (page) => page.locator('input.input--hex');

test.describe('Fluxo principal', () => {
  test('mostra as 6 comparações da paleta da Prazo Certo (RF-03)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.cmp')).toHaveCount(6);
    await expect(page.locator('.cmp').first()).toContainText('17,11:1');
    await expect(page.locator('.cmp').first()).toContainText('Excelente');
  });

  test('digitar um HEX atualiza cards e URL (RF-01, RF-11)', async ({ page }) => {
    await page.goto('/');
    await hexInputs(page).nth(1).fill('#000000');
    await expect(page.locator('.cmp').first()).toContainText('Texto A sobre fundo B');
    await expect(page).toHaveURL(/\?p=230023-000000-42ffff/);
  });

  test('link compartilhado abre a mesma paleta (RF-11)', async ({ page }) => {
    await page.goto('/?p=000000-ffffff-ff0000');
    await expect(hexInputs(page).nth(0)).toHaveValue('#000000');
    await expect(hexInputs(page).nth(2)).toHaveValue('#FF0000');
    await expect(page.locator('.cmp').first()).toContainText('21,00:1');
  });

  test('gerar Fibonacci com "Garantir AAA" entrega um par AAA (RF-05, RF-06)', async ({ page }) => {
    await page.goto('/');
    await page.locator('#harmonias label.chip', { hasText: 'Fibonacci' }).click();
    await page.locator('#harmonias label.chip', { hasText: 'Garantir AAA' }).click();
    await page.getByRole('button', { name: 'Gerar paleta' }).click();
    await expect(page.locator('#harmonias .callout')).toContainText('Termos');
    const firstTwo = page.locator('.cmp').filter({ hasText: /Texto [BC] sobre fundo A/ });
    await expect(firstTwo.filter({ hasText: 'Texto normal: AAA' }).first()).toBeVisible();
  });

  test('"Consertar contraste" e "Desfazer" (RF-20, RF-21)', async ({ page }) => {
    await page.goto('/?p=3366cc-6699ff-99bbff');
    await page.getByRole('button', { name: 'Consertar contraste (AA)' }).click();
    await expect(page.locator('#comparacoes .callout')).toContainText('Pronto');
    await page.getByRole('button', { name: 'Desfazer' }).click();
    await expect(hexInputs(page).nth(2)).toHaveValue('#99BBFF');
  });

  test('paleta pronta com um clique (RF-19)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Aplicar a paleta Café/ }).click();
    await expect(hexInputs(page).nth(0)).toHaveValue('#3E2723');
  });

  test('copiar o HEX mostra o aviso (RF-10)', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await page.getByRole('button', { name: 'Copiar HEX da cor A' }).click();
    await expect(page.locator('.toast')).toHaveText('#230023 copiado.');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('#230023');
  });
});

test.describe('Link e âncoras (auditoria E05 e E06)', () => {
  test('clicar no menu não apaga a paleta do link', async ({ page }) => {
    await page.goto('/?p=000000-ffffff-ff0000');
    await page.locator('.site-nav a[href="#tons"]').click();
    await expect(page).toHaveURL(/\?p=000000-ffffff-ff0000#tons/);
    await page.reload();
    await expect(hexInputs(page).nth(2)).toHaveValue('#FF0000');
  });

  test('link antigo com a paleta no # continua funcionando', async ({ page }) => {
    await page.goto('/#000000-ffffff-ff0000');
    await expect(hexInputs(page).nth(2)).toHaveValue('#FF0000');
  });

  test('link com paleta quebrada avisa a pessoa', async ({ page }) => {
    await page.goto('/?p=000000-ffffff');
    await expect(page.locator('.toast')).toContainText('paleta padrão');
  });
});

test.describe('Teste na prática', () => {
  test('mockups e legenda com os 3 papéis (RF-17, RF-24)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.msite')).toBeVisible();
    await expect(page.locator('.mapp')).toBeVisible();
    await expect(page.locator('.mock-legend li')).toHaveCount(3);
    await expect(page.locator('#pratica')).toContainText('Sugestão do Paletrês');
  });

  test('color grading com a imagem de exemplo (RF-18)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Usar imagem de exemplo' }).click();
    await expect(page.locator('.stage')).toBeVisible();
    await expect(page.locator('[data-action="download-graded"]')).toHaveAttribute('aria-disabled', 'false');
  });

  test('arquivo de formato errado mostra erro em texto (RF-18)', async ({ page }) => {
    await page.goto('/');
    await page.locator('#pratica input[type="file"]').setInputFiles({ name: 'nota.txt', mimeType: 'text/plain', buffer: Buffer.from('oi') });
    await expect(page.locator('#pratica [role="alert"]')).toContainText('Formato não aceito');
  });
});

test.describe('Marca, tema e menu', () => {
  test('botão Prazo Certo abre em nova aba com segurança (RF-15)', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('.site-nav a[href="https://prazocerto.me"]');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toContainText('abre em nova aba');
  });

  test('crédito no rodapé (RF-16)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toContainText('Projeto idealizado por Mário Lúcio em cocriação com Claude Code, por meio do modelo Opus 5.5 no esforço Alto.');
  });

  test('tema escuro é lembrado (RF-13)', async ({ page }) => {
    await page.goto('/');
    await page.locator('.theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('parallax move as camadas na rolagem (RF-14)', async ({ page }) => {
    await page.goto('/');
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.locator('[data-parallax="0.5"]').evaluate((el) => el.style.transform)).not.toBe('translate3d(0px, 0px, 0px)');
  });

  test('com movimento reduzido, o parallax fica parado (RNF-07)', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(200);
    const transform = await page.locator('[data-parallax="0.5"]').evaluate((el) => el.style.transform);
    expect(transform).toMatch(/translate3d\(-?0px, 0px, 0px\)/);
    await context.close();
  });

  test('menu do celular abre, fecha com Esc e devolve o foco', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Seções' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#menu-secoes a').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('roda cromática funciona pelo teclado', async ({ page }) => {
    await page.goto('/');
    const wheel = page.getByRole('slider', { name: 'Tom base (cor A) na roda cromática' });
    await wheel.focus();
    await page.keyboard.press('Shift+ArrowRight');
    await expect(wheel).toHaveAttribute('aria-valuenow', '315');
  });
});
