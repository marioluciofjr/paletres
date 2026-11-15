// Testes de ponta a ponta (e2e): o Paletrês de verdade, no Chromium.
import { test, expect } from '@playwright/test';

const hexInputs = (page) => page.locator('input.input--hex');
// Paleta conhecida para os testes (a da Prazo Certo): vem por link, então o site já abre liberado.
const BRAND = '/?p=230023-f2f2f2-42ffff';

test.describe('Início sem paleta (RF-25)', () => {
  test('abre vazio: ferramenta escondida, círculos com "?" e nada na URL', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#comecar')).toBeVisible();
    await expect(page.locator('#ferramenta')).toBeHidden();
    await expect(page.locator('.hero-dot--empty')).toHaveCount(3);
    await expect(page).not.toHaveURL(/\?p=/);
  });

  test('link do menu antes de gerar leva ao aviso e explica', async ({ page }) => {
    await page.goto('/');
    await page.locator('.site-nav a[href="#comparacoes"]').click();
    await expect(page.locator('.toast')).toContainText('Gerar paleta');
    await expect(page.locator('#comecar')).toBeFocused();
  });

  test('"Gerar paleta" libera os passos, grava a URL e leva ao Passo 1', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hero [data-action="start"]').click();
    await expect(page.locator('#ferramenta')).toBeVisible();
    await expect(page.locator('#comecar')).toBeHidden();
    await expect(page.locator('.cmp')).toHaveCount(3);
    await expect(page).toHaveURL(/\?p=[0-9a-f]{6}-[0-9a-f]{6}-[0-9a-f]{6}/);
    await expect(page.locator('#paleta-title')).toBeFocused();
    await expect(page.getByRole('link', { name: 'Ver minha paleta' })).toBeVisible();
  });

  test('depois de gerar, "Pular para a ferramenta" leva o foco ao título do Passo 1 (a11y-web M2)', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hero [data-action="start"]').click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('#inicio').click({ position: { x: 5, y: 5 } });
    await page.locator('[data-component="skip-link"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#paleta-title')).toBeFocused();
  });

  test('"Começar do zero" apaga a paleta, limpa o endereço e volta aos "?" (feedback do Mário)', async ({ page }) => {
    await page.goto(BRAND);
    await page.getByRole('button', { name: 'Começar do zero' }).click();
    await expect(page.locator('.hero-dot--empty')).toHaveCount(3);
    await expect(page.locator('#ferramenta')).toBeHidden();
    await expect(page.locator('#comecar')).toBeFocused();
    await expect(page).not.toHaveURL(/\?p=/);
    await expect(page.locator('.toast')).toContainText('Tudo limpo');
    // Apagou sem querer? Dá para recuperar (auditoria UX A1).
    await page.getByRole('button', { name: 'Recuperar minha paleta' }).click();
    await expect(page.locator('#ferramenta')).toBeVisible();
    await expect(hexInputs(page).nth(0)).toHaveValue('#230023');
    await expect(page).toHaveURL(/\?p=230023-f2f2f2-42ffff/);
    await page.getByRole('button', { name: 'Começar do zero' }).click();
    await expect(page.locator('.hero-dot--empty')).toHaveCount(3);
    // Recarregar continua no zero; gerar de novo funciona.
    await page.reload();
    await expect(page.locator('.hero-dot--empty')).toHaveCount(3);
    await page.locator('.hero [data-action="start"]').click();
    await expect(page.locator('.cmp')).toHaveCount(3);
  });

  test('passos em ordem: 1, 2, 3 e 4 seguidos, e os extras depois', async ({ page }) => {
    await page.goto(BRAND);
    const eyebrows = await page.locator('#ferramenta .section__head .eyebrow').allTextContents();
    expect(eyebrows.slice(0, 4).map((t) => t.match(/Passo (\d) de 4/)?.[1])).toEqual(['1', '2', '3', '4']);
    expect(eyebrows.slice(4).every((t) => /Extra/.test(t))).toBe(true);
  });
});

test.describe('Fluxo principal', () => {
  test('mostra 3 comparações (uma por par), cada uma com 2 prévias e 1 valor, só com WCAG (RF-03)', async ({ page }) => {
    await page.goto(BRAND);
    await expect(page.locator('.cmp')).toHaveCount(3);
    await expect(page.locator('.cmp').first()).toContainText('17,11:1');
    await expect(page.locator('.cmp').first()).toContainText('Excelente');
    await expect(page.locator('.cmp').first().locator('.cmp__preview')).toHaveCount(2);
    await expect(page.locator('.cmp').first().locator('.cmp__ratio')).toHaveCount(1);
    await expect(page.locator('#comparacoes')).not.toContainText('APCA');
  });

  test('digitar um HEX atualiza cards e URL (RF-01, RF-11)', async ({ page }) => {
    await page.goto(BRAND);
    await hexInputs(page).nth(1).fill('#000000');
    await expect(page.locator('.cmp').first()).toContainText('Cores A e B');
    await expect(page).toHaveURL(/\?p=230023-000000-42ffff/);
  });

  test('link compartilhado abre a mesma paleta (RF-11)', async ({ page }) => {
    await page.goto('/?p=000000-ffffff-ff0000');
    await expect(hexInputs(page).nth(0)).toHaveValue('#000000');
    await expect(hexInputs(page).nth(2)).toHaveValue('#FF0000');
    await expect(page.locator('.cmp').first()).toContainText('21,00:1');
  });

  test('"Consertar contraste" e "Desfazer" (RF-20, RF-21)', async ({ page }) => {
    await page.goto('/?p=3366cc-6699ff-99bbff');
    await page.getByRole('button', { name: 'Consertar contraste (AA)' }).click();
    await expect(page.locator('#comparacoes .callout')).toContainText('Pronto');
    await page.getByRole('button', { name: 'Desfazer' }).click();
    await expect(hexInputs(page).nth(2)).toHaveValue('#99BBFF');
  });

  test('15 paletas prontas do Color Hunt, sem as cores da marca (RF-19)', async ({ page }) => {
    await page.goto(BRAND);
    await expect(page.locator('[data-preset]')).toHaveCount(15);
    await expect(page.locator('.presets')).not.toContainText('Prazo Certo');
    await page.getByRole('button', { name: /Aplicar a paleta Café na floresta/ }).click();
    await expect(hexInputs(page).nth(0)).toHaveValue('#09251C');
    await expect(page.locator('.presets__credit a')).toHaveAttribute('href', 'https://colorhunt.co');
  });

  test('copiar o HEX mostra o aviso (RF-10)', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(BRAND);
    await page.getByRole('button', { name: 'Copiar HEX da cor A' }).click();
    await expect(page.locator('.toast')).toHaveText('#230023 copiado.');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('#230023');
  });
});

test.describe('Harmonias em rascunho (RF-05, RF-06, RF-26)', () => {
  test('gerar Fibonacci com AAA não mexe na paleta até "Usar esta paleta"', async ({ page }) => {
    await page.goto(BRAND);
    await page.locator('#harmonias label.chip', { hasText: 'Fibonacci' }).click();
    await page.locator('#harmonias label.chip', { hasText: 'Garantir AAA' }).click();
    await page.getByRole('button', { name: 'Gerar paleta nova' }).click();
    await expect(page.locator('#harmonias .callout').first()).toContainText('Termos');
    // A paleta dos passos 1 a 4 continua a mesma.
    await expect(hexInputs(page).nth(0)).toHaveValue('#230023');
    await page.getByRole('button', { name: 'Usar esta paleta' }).click();
    await expect(hexInputs(page).nth(0)).not.toHaveValue('#230023');
    const firstTwo = page.locator('.cmp').filter({ hasText: /Cores A e [BC]/ });
    await expect(firstTwo.filter({ hasText: 'Texto normal: AAA' }).first()).toBeVisible();
  });

  test('as 3 etapas aparecem numeradas', async ({ page }) => {
    await page.goto(BRAND);
    await expect(page.locator('#harmonias .form-step__title')).toHaveText([/^Etapa 1 de 3/, /^Etapa 2 de 3/, /^Etapa 3 de 3/]);
  });

  test('roda cromática funciona pelo teclado e mexe só no rascunho', async ({ page }) => {
    await page.goto(BRAND);
    const wheel = page.getByRole('slider', { name: 'Tom base (cor A) da paleta nova, na roda cromática' });
    await wheel.focus();
    await page.keyboard.press('Shift+ArrowRight');
    await expect(wheel).toHaveAttribute('aria-valuenow', '315');
    await expect(hexInputs(page).nth(0)).toHaveValue('#230023');
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

  test('link com paleta quebrada avisa e abre vazio', async ({ page }) => {
    await page.goto('/?p=000000-ffffff');
    await expect(page.locator('.toast')).toContainText('Gerar paleta');
    await expect(page.locator('#comecar')).toBeVisible();
  });
});

test.describe('Teste na prática', () => {
  test('mockups só com 60-30-10 e legenda com os 3 papéis (RF-17, RF-24)', async ({ page }) => {
    await page.goto(BRAND);
    await expect(page.locator('.msite')).toBeVisible();
    await expect(page.locator('.mapp')).toBeVisible();
    await expect(page.locator('.mock-legend li')).toHaveCount(3);
    await expect(page.locator('#pratica')).toContainText('Sugestão do Paletrês');
    await expect(page.locator('#pratica')).not.toContainText('Proporção áurea');
  });

  test('color grading: imagem de exemplo, legenda das 3 cores e modo zonas (RF-18)', async ({ page }) => {
    await page.goto(BRAND);
    await expect(page.locator('.grade-legend__list li')).toHaveCount(3);
    await page.getByRole('button', { name: 'Usar imagem de exemplo' }).click();
    await expect(page.locator('.stage')).toBeVisible();
    await expect(page.locator('[data-action="download-graded"]')).toHaveAttribute('aria-disabled', 'false');
    await page.locator('#pratica label.chip', { hasText: 'Onde entra cada cor' }).click();
    await expect(page.locator('.stage')).toHaveAttribute('aria-label', /mapa das 3 zonas/);
  });

  test('no modo zonas, o slider de intensidade fica desativado e explica por quê (a11y-web M1)', async ({ page }) => {
    await page.goto(BRAND);
    const slider = page.getByLabel('Intensidade das cores da paleta');
    await expect(slider).toBeEnabled();
    await page.locator('#pratica label.chip', { hasText: 'Onde entra cada cor' }).click();
    await expect(slider).toBeDisabled();
    await expect(page.locator('#pratica')).toContainText('as 3 cores entram sempre a 100%');
  });

  test('arquivo de formato errado mostra erro em texto (RF-18)', async ({ page }) => {
    await page.goto(BRAND);
    await page.locator('#pratica input[type="file"]').setInputFiles({ name: 'nota.txt', mimeType: 'text/plain', buffer: Buffer.from('oi') });
    await expect(page.locator('#pratica [role="alert"]')).toContainText('Formato não aceito');
  });
});

test.describe('Conteúdo, marca, tema e menu', () => {
  test('botão Prazo Certo abre em nova aba com segurança (RF-15)', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('.site-nav a[href="https://prazocerto.me"]');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toContainText('abre em nova aba');
  });

  test('crédito no rodapé dito pelo Clawd num balão (RF-16)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.clawd__bubble')).toHaveText('Projeto idealizado por Mário Lúcio em cocriação com Claude Code, por meio do modelo Opus 5.5 no esforço Alto.');
    await expect(page.locator('.clawd__art g')).toHaveAttribute('fill', '#D77757');
  });

  test('CTA da Prazo Certo antes do rodapé (RF-28)', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('.cta');
    await expect(cta).toContainText('Se você gostou dessa página e quer entender mais sobre letramento em IA generativa, acesse prazocerto.me agora mesmo!');
    await expect(cta.locator('a')).toHaveAttribute('href', 'https://prazocerto.me');
    await expect(cta.locator('a')).toHaveAttribute('target', '_blank');
  });

  test('card de cores em imagens com IA generativa, com link de Psicologia das Cores (RF-31)', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('#aprenda .learn__item', { hasText: 'Cores em imagens com IA generativa' });
    await expect(card).toBeVisible();
    await expect(card.getByRole('link', { name: /Psicologia das Cores/ })).toHaveAttribute('href', /annualreviews\.org/);
  });

  test('o Clawd fica ao lado dos contatos no computador (RF-16)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');
    const contacts = await page.locator('footer nav').boundingBox();
    const clawd = await page.locator('.clawd').boundingBox();
    expect(clawd.x).toBeGreaterThan(contacts.x + contacts.width - 1);
    expect(clawd.y).toBeLessThan(contacts.y + contacts.height);
  });

  test('"Sobre" está no menu e explica a ideia (RF-27)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.site-nav a[href="#sobre"]')).toHaveText('Sobre');
    await expect(page.locator('#sobre')).toContainText('Megazord');
  });

  test('explicações têm fontes oficiais e nenhum link da Wikipédia (RF-29)', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('a[href*="wikipedia.org"]').count()).toBe(0);
    const cards = page.locator('#aprenda .learn__item');
    const count = await cards.count();
    for (let i = 0; i < count; i++) await expect(cards.nth(i).locator('.sources a').first()).toBeAttached();
    await expect(page.locator('#aprenda')).toContainText('Color grading no cinema');
  });

  test('tema escuro é lembrado (RF-13)', async ({ page }) => {
    await page.goto('/');
    await page.locator('.theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('parallax: as 3 bolas do início se movem na rolagem e o menu não tem desenhos (RF-14)', async ({ page }) => {
    await page.goto(BRAND);
    // As antigas camadas de desenho (.parallax / [data-parallax]) não existem mais. Os ícones do menu continuam.
    await expect(page.locator('.site-header .parallax, .site-header [data-parallax]')).toHaveCount(0);
    await page.mouse.wheel(0, 300);
    await expect.poll(() => page.locator('.hero__art').evaluate((el) => Number(el.style.getPropertyValue('--parallax-y')))).toBeGreaterThan(0);
    const t1 = await page.locator('.hero-dot').nth(0).evaluate((el) => getComputedStyle(el).translate);
    const t3 = await page.locator('.hero-dot').nth(2).evaluate((el) => getComputedStyle(el).translate);
    expect(t1).not.toBe(t3);
  });

  test('com movimento reduzido, o parallax fica parado (RNF-07)', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(BRAND);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(200);
    expect(await page.locator('.hero__art').evaluate((el) => el.style.getPropertyValue('--parallax-y'))).toBe('0');
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
});
