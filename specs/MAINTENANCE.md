# MAINTENANCE — Paletrês

> Cuidados contínuos depois da v1. Distribuição do esforço: **50% evolutiva, 30% adaptativa, 20% preventiva.**

## 1. Manutenção evolutiva (50%)

Novos recursos que aumentam o valor do Paletrês.

| Ideia | Onde mexer |
| :--- | :--- |
| Nova harmonia | Nova classe em `src/domain/harmony/strategies/` (ver [AGENTS.md](AGENTS.md)). |
| Novo formato de exportação | Nova classe exportadora em `src/domain/export/`. |
| Modo OKLCH nos sliders | Novo conversor em `src/domain/color/` e opção no `HsbSliderPanel`. |
| Paletas de 4 ou 5 cores | `Palette` e `PaletteComparator` (n × (n−1) comparações). |

Cada recurso novo passa pelo fluxo completo de [WORKFLOW.md](WORKFLOW.md).

## 2. Manutenção adaptativa (30%)

Ajustes a mudanças externas.

- **WCAG 3:** quando virar recomendação oficial, reavaliar a volta de um segundo método de contraste (uma nova `ContrastStrategy`; ver ADR-10).
- **Fontes oficiais (RF-29):** a cada versão, abra os links das seções "Aprenda" e "O que é isso?". Troque qualquer link quebrado por outra fonte oficial. Wikipédia não vale. As páginas da Adobe bloqueiam robôs (erro 403), então confira essas à mão.
- **Pendências conhecidas da v1.1.0 (baixas ou médias, sem impacto alto):** link com HEX de 8 dígitos (alfa) ou pontuação colada derruba a paleta inteira; o modo zonas usa cortes fixos de claridade (foto muito clara ou escura mostra menos de 3 zonas); abrir `/#secao` antes de gerar não mostra o aviso do portão; com cores repetidas, as 2 prévias do par ficam iguais (o resumo avisa em texto). Relatórios em `tmp/a11y_reports/` (fora do git).
- **Deploy:** o site em https://paletres.prazocerto.me é publicado pela Vercel a cada push na `main`. O DNS fica na HostGator (cPanel → Editor de Zona DNS): o registro CNAME `paletres` aponta para o valor do projeto na Vercel (Project → Domains). Não mexa nos registros `@`, `www` e `MX`, que são do site WordPress e do e-mail. Se trocar de projeto na Vercel, o valor do CNAME muda.
- **Paletas prontas:** se o Mário trocar alguma, mantenha 15, com crédito ao Color Hunt e sem as cores da marca (o teste `unit/presets.test.js` confere).
- **Dependências:** a cada trimestre, rode `npm outdated` e atualize Vite, Vitest e Playwright, com `npm test` e `npm run test:e2e` verdes.
- **Navegadores:** confira o parallax das bolas do início, a propriedade CSS `translate` e o `<canvas>` (PNG) no Safari e no Firefox a cada versão grande.
- **Marca:** se o DESIGN.md da Prazo Certo mudar, atualize `src/styles/tokens.css` e [DESIGN.md](DESIGN.md).

## 3. Manutenção preventiva (20%)

- Rode o subagente `a11y-web` a cada mudança em `src/ui`.
- Rode `npm audit` todo mês.
- Mantenha a cobertura do `domain` acima de 90% (`npx vitest run --coverage`, se o plugin estiver instalado).
- Revise a [TRACEABILITY.md](TRACEABILITY.md) a cada fase.

## 4. Incidentes e fallback

| Sintoma | Causa provável | Ação |
| :--- | :--- | :--- |
| As 3 comparações não aparecem | Erro de JavaScript | Abra o console (F12). O `main.js` mostra uma mensagem em texto se a inicialização falhar. |
| Link compartilhado abre outra paleta | Hash inválido | O `UrlStateCodec` ignora hashes inválidos e usa a paleta padrão. |
| "Copiar" não funciona | Página sem HTTPS ou sem permissão | O `ClipboardService` usa um campo de texto oculto como fallback e avisa. |
| Parallax trava | Rolagem pesada | O `ParallaxScene` já atualiza no máximo 1 vez por quadro; confira se nada além das 3 bolas usa `--parallax-y`. |
| Fontes não carregam | Sem internet | As pilhas de fontes recorrem a Georgia e system-ui. |
