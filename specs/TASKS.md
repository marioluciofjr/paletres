# TASKS — Paletrês

> Lista prática do trabalho. Atualize o status ao terminar cada tarefa, antes do commit.

Legenda: ✅ concluída · 🔄 em andamento · ⏳ pendente

| # | Tarefa | Requisitos | Responsável | Status |
| :--- | :--- | :--- | :--- | :--- |
| T01 | Setup: git, Vite, Vitest, Playwright, axe, ESLint, pastas e assets da marca | RNF-03, RNF-06 | Claude | ✅ |
| T02 | Specs em `specs/` (12 arquivos) | todos | Claude | ✅ |
| T03 | Subagente `.claude/agents/a11y-web.md` | RNF-01 | Claude | ✅ |
| T04 | `Color` e `ColorConverter` | RF-01, RF-02 | Claude | ✅ |
| T05 | `Wcag2Contrast`, `ApcaContrast`, `ContrastEvaluator`, `PaletteComparator`, `Palette`, `ReadableTextPicker` | RF-03, RF-04, RF-17 | Claude | ✅ |
| T06 | 11 harmonias, `HarmonyRegistry`, `RandomSource`, `NumberFormat` | RF-05 | Claude | ✅ |
| T07 | `ContrastGuard`, `TintShadeGenerator`, `ColorBlindSimulator`, `UsageProportion`, `PlainVerdict`, `RoleAdvisor`, `PresetCatalog`, `GradientMap` | RF-06…RF-09, RF-18…RF-20, RF-23, RF-24 | Claude | ✅ |
| T08 | Exportadores (CSS, JSON, `PngLayout`), `UrlStateCodec`, `ClipboardService`, `PreferenceStorage` | RF-10, RF-11, RF-13 | Claude | ✅ |
| T09 | `PaletteStore` (com histórico para desfazer/refazer) e `EventBus` | RF-01…RF-11, RF-21 | Claude | ✅ |
| T10 | Estilos, layout one page, `ParallaxHeader`, `ThemeToggle`, botão Prazo Certo e crédito no rodapé | RF-13, RF-14, RF-15, RF-16, RNF-02, RNF-07 | Claude | ✅ |
| T11 | `ColorSlots` (com seletor visual), `PresetBar`, `HsbSliderPanel`, `ComparisonGrid` (veredito simples, "Consertar contraste") e `InfoTip` | RF-01…RF-04, RF-19…RF-23, RNF-09 | Claude | ✅ |
| T12 | `ColorWheel`, `HarmonyPanel`, `TintShadeTable`, `ColorBlindPreview`, `ExportPanel` (+ `CanvasPngRenderer`, `FileDownloader`) | RF-05…RF-11 | Claude | ✅ |
| T12b | `UsageMockupPanel` (site e app) e `ColorGradingPanel` | RF-07, RF-17, RF-18, RF-24 | Claude | ✅ |
| T13 | Seção "Aprenda" e revisão gramatical | RF-12 | Claude | ✅ |
| T14 | Testes e2e e varredura axe (28 testes, inclui foco visível e debounce de anúncios) | RNF-01 | Claude | ✅ |
| T15 | Testes de regressão com semente fixa (24 snapshots) | RF-05 | Claude | ✅ |
| T16 | Auditorias em 2 ciclos (a11y-web, acessibilidade, UX, motion e casos extremos) e correções | RNF-01, RNF-07, RNF-09 | Claude | ✅ |
| T17 | Build final (`dist/`, ~36 KB gzip) conferido no `vite preview` e README pronto para o GitHub | RNF-03 | Claude | ✅ |

## Próximo passo

Todas as tarefas da v1 concluídas. Próximo passo: teste manual do Mário e, com o aval dele, publicação no GitHub Pages.

## Backlog (fora da v1)

- Paletas com 4 ou 5 cores.
- Extrair paleta de imagem.
- Modo OKLCH nos sliders.
