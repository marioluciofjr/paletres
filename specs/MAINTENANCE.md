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

- **APCA:** se sair uma versão nova das constantes, atualize `ApcaContrast`, os valores de [TESTS.md](TESTS.md) e o ADR-04.
- **WCAG 3:** quando virar recomendação oficial, reavaliar o selo APCA.
- **Dependências:** a cada trimestre, rode `npm outdated` e atualize Vite, Vitest e Playwright, com `npm test` e `npm run test:e2e` verdes.
- **Navegadores:** confira o parallax e o `<canvas>` (PNG) no Safari e no Firefox a cada versão grande.
- **Marca:** se o DESIGN.md da Prazo Certo mudar, atualize `src/styles/tokens.css` e [DESIGN.md](DESIGN.md).

## 3. Manutenção preventiva (20%)

- Rode o subagente `a11y-web` a cada mudança em `src/ui`.
- Rode `npm audit` todo mês.
- Mantenha a cobertura do `domain` acima de 90% (`npx vitest run --coverage`, se o plugin estiver instalado).
- Revise a [TRACEABILITY.md](TRACEABILITY.md) a cada fase.

## 4. Incidentes e fallback

| Sintoma | Causa provável | Ação |
| :--- | :--- | :--- |
| As 6 comparações não aparecem | Erro de JavaScript | Abra o console (F12). O `main.js` mostra uma mensagem em texto se a inicialização falhar. |
| Link compartilhado abre outra paleta | Hash inválido | O `UrlStateCodec` ignora hashes inválidos e usa a paleta padrão. |
| "Copiar" não funciona | Página sem HTTPS ou sem permissão | O `ClipboardService` usa um campo de texto oculto como fallback e avisa. |
| Parallax trava | Muitas camadas | Desligue o parallax pelo `prefers-reduced-motion` e reduza as camadas. |
| Fontes não carregam | Sem internet | As pilhas de fontes recorrem a Georgia e system-ui. |
