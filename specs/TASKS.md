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

### v1.1.0 (ajustes do Mário em `ajustes.md`)

| # | Tarefa | Requisitos | Responsável | Status |
| :--- | :--- | :--- | :--- | :--- |
| T18 | 15 paletas do Color Hunt (sem as cores da marca) e crédito ao site | RF-19 | Claude | ✅ |
| T19 | Remover o APCA (domínio, UI, testes e textos) | RF-04, ADR-10 | Claude | ✅ |
| T20 | Mockups só com 60-30-10 (`UsageProportion.RULE`) | RF-07, RF-17 | Claude | ✅ |
| T21 | `GradientMap` com modo zonas + legenda das 3 cores no color grading | RF-18 | Claude | ✅ |
| T22 | `PaletteGenerator` (extraído da store), `start()` e o portão `PaletteGate` ("Gerar paleta") | RF-25, ADR-11 | Claude | ✅ |
| T23 | `HarmonyWorkbench` (rascunho) + `HarmonyPanel` em 3 etapas + `ColorWheel` com modelo injetado | RF-05, RF-06, RF-26, ADR-12 | Claude | ✅ |
| T24 | Menu sem desenhos: `SiteMenu` + `ParallaxScene` nas 3 bolas do início | RF-14, RNF-07, ADR-13 | Claude | ✅ |
| T25 | Nova ordem (passos 1 a 4 seguidos + extras com etiqueta), Sobre, CTA, Clawd e logotipo maior | RF-16, RF-27, RF-28, RF-30 | Claude | ✅ |
| T26 | Fontes oficiais em todas as explicações (sem Wikipédia) e card de color grading no cinema | RF-12, RF-29 | Claude | ✅ |
| T27 | Testes da v1.1.0 (unit, integration, e2e) e specs atualizadas | RNF-06 | Claude | ✅ |
| T30 | 3 comparações (uma por par, 2 prévias), card de cores em imagens com IA e Clawd ao lado dos contatos (2ª leva do `ajustes.md`) | RF-03, RF-16, RF-31, ADR-14 | Claude | ✅ |
| T31 | Feedback em vídeo: "Começar do zero" (`reset`, `clear`) e etapas das harmonias sem o número grande | RF-26, RF-32, ADR-15 | Claude | ✅ |
| T32 | Deploy na Vercel (`paletres.vercel.app`) e domínio `paletres.prazocerto.me` (CNAME na HostGator), tema claro por padrão, repositório público | RF-13, RNF-03, ADR-16 | Claude + Mário | ✅ |
| T33 | Busca do Google: verificação do Search Console (arquivo HTML), robots.txt, sitemap.xml e link canônico | RF-33 | Claude + Mário | ✅ |
| T34 | Card "Dar uma estrela no GitHub" ao lado do texto do Sobre (ícone de estrela, grade de 2 colunas que vira 1 no celular) | RF-34 | Claude | ✅ |

### v1.2.0 (paleta a partir de uma imagem)

| # | Tarefa | Requisitos | Responsável | Status |
| :--- | :--- | :--- | :--- | :--- |
| T35 | Paleta a partir de uma imagem: `Oklab`, `ColorQuantizer`, `DominantColorPicker`, `ImagePaletteExtractor`, `MosaicLayout`, `PaletteSuggester`, `ImageFileLoader` (extraído do color grading), `SampleImage` e `ImagePalettePanel` | RF-35, ADR-17, ADR-18, ADR-19 | Claude | ✅ |
| T36 | "Tints e shades" → "Tons claros e escuros" (título, Aprenda, Sobre, rótulos das células, README e specs) | RF-08 | Claude | ✅ |
| T37 | Auditoria a11y-web do painel da imagem: 3 achados altos (foco visível no tema escuro, foco da peça escolhida, foco perdido em "Voltar à sugestão automática"), 3 médios e 4 baixos corrigidos | RNF-01, RF-35 | Claude | ✅ |
| T38 | Miniatura da imagem escolhida no painel da imagem e botão fixo "Voltar ao Passo 1" (`BackToStepButton`, ícone `arrow-up`), com a 2ª auditoria a11y-web: faixa livre na rolagem (2.4.11), halo para o foco sobre o roxo (2.4.7), botão que não some com o foco, aviso acima do botão no celular e miniatura nomeada pela legenda | RF-35, RF-36, RNF-01 | Claude | ✅ |
| T28 | Licença Apache-2.0 (LICENSE + NOTICE), versão 1.1.0, CHANGELOG e README de portfólio | RNF-03 | Claude | ✅ |
| T29 | Auditorias da v1.1.0 (a11y-web, acessibilidade em 2 ciclos, UX, motion e casos extremos) e correções | RNF-01, RNF-09 | Claude | ✅ |

## Próximo passo

v1.1.0 concluída (T18–T34) e publicada: código em https://github.com/marioluciofjr/paletres (público) e site em https://paletres.prazocerto.me.

v1.2.0 (T35–T38): paleta a partir de uma imagem e "Tons claros e escuros", com commit local. Próximo: teste manual do Mário e, com o aval dele, push (a Vercel publica sozinha).

## Backlog (fora da v1)

- Paletas com 4 ou 5 cores.
- Modo OKLCH nos sliders.
