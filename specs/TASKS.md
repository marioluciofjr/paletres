# TASKS — Paletrês

> Lista prática do trabalho. Atualize o status ao terminar cada tarefa, antes do commit.

Legenda: ✅ concluída · 🔄 em andamento · ⏳ pendente

| # | Tarefa | Requisitos | Responsável | Status |
| :--- | :--- | :--- | :--- | :--- |
| T01 | Setup: git, Vite, Vitest, Playwright, axe, ESLint, pastas e assets da marca | RNF-03, RNF-06 | Claude | ✅ |
| T02 | Specs em `specs/` (12 arquivos) | todos | Claude | ✅ |
| T03 | Subagente `.claude/agents/a11y-web.md` | RNF-01 | Claude | ✅ |
| T04 | `Color` e `ColorConverter` | RF-01, RF-02 | Claude | ✅ |
| T05 | `Wcag2Contrast`, `ApcaContrast`, `ContrastEvaluator`, `PaletteComparator`, `Palette` | RF-03, RF-04 | Claude | ⏳ |
| T06 | 11 harmonias, `HarmonyRegistry`, `RandomSource` | RF-05 | Claude | ⏳ |
| T07 | `ContrastGuard`, `TintShadeGenerator`, `ColorBlindSimulator`, `UsageProportion` | RF-06, RF-07, RF-08, RF-09 | Claude | ⏳ |
| T08 | Exportadores e `UrlStateCodec` | RF-10, RF-11 | Claude | ⏳ |
| T09 | `PaletteStore` e `EventBus` | RF-01…RF-11 | Claude | ⏳ |
| T10 | Estilos, layout one page, `ParallaxHeader`, `ThemeToggle`, botão Prazo Certo e crédito no rodapé | RF-13, RF-14, RF-15, RF-16, RNF-02, RNF-07 | Claude | ⏳ |
| T11 | `HexInputPanel`, `HsbSliderPanel`, `ComparisonGrid` | RF-01…RF-04 | Claude | ⏳ |
| T12 | `ColorWheel`, `HarmonyPicker`, `TintShadeTable`, `ColorBlindPreview`, `ExportPanel` | RF-05…RF-11 | Claude | ⏳ |
| T12b | `UsageLayout`, `ReadableTextPicker`, `GradientMap` + `UsageMockupPanel` (site e app) e `ColorGradingPanel` | RF-07, RF-17, RF-18 | Claude | ⏳ |
| T13 | Seção "Aprenda" e revisão gramatical | RF-12 | Claude | ⏳ |
| T14 | Testes e2e e varredura axe | RNF-01 | Claude | ⏳ |
| T15 | Testes de regressão com semente fixa | RF-05 | Claude | ⏳ |
| T16 | Auditorias (a11y-web, UX, motion) e correções | RNF-01, RNF-07 | Claude | ⏳ |
| T17 | Build final e README pronto para o GitHub | RNF-03 | Claude | ⏳ |

## Próximo passo

T05 — contraste WCAG 2.2 e APCA.

## Backlog (fora da v1)

- Paletas com 4 ou 5 cores.
- Extrair paleta de imagem.
- Modo OKLCH nos sliders.
