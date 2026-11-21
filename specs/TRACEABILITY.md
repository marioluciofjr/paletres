# TRACEABILITY — Paletrês

> Matriz que liga requisito → tarefa → código → teste. Nada é commitado sem conferir esta matriz.

| Requisito | Tarefa | Código | Testes | Status |
| :--- | :--- | :--- | :--- | :--- |
| RF-01 Entrada HEX | T04, T11 | `domain/color/Color.js`, `ui/ColorSlots.js` | `unit/color.test.js` | ✅ |
| RF-02 Ajuste HSB | T04, T11 | `domain/color/ColorConverter.js`, `ui/HsbSliderPanel.js` | `unit/color.test.js` | ✅ |
| RF-03 3 comparações WCAG (uma por par) | T05, T11, T30 | `domain/contrast/*`, `ui/ComparisonGrid.js` | `unit/contrast.test.js`, `unit/verdict.test.js`, `contract/contrast.contract.test.js`, `integration/ui.test.js`, `e2e/site.spec.js` | ✅ |
| ~~RF-04 APCA~~ | T19 | removido na v1.1.0 (ADR-10) | `unit/contrast.test.js` e `e2e/site.spec.js` conferem que não há APCA | ✅ |
| RF-05 Harmonias | T06, T12, T23 | `domain/harmony/*`, `app/PaletteGenerator.js`, `ui/HarmonyPanel.js`, `ui/ColorWheel.js` | `unit/harmony.test.js`, `integration/ui.test.js`, `e2e/site.spec.js` | ✅ |
| RF-06 Garantia AA/AAA | T07 | `domain/guard/ContrastGuard.js` | `unit/guard.test.js` | ✅ |
| RF-07 Proporção 60-30-10 | T07, T20 | `domain/proportion/UsageProportion.js` | `unit/proportion.test.js` | ✅ |
| RF-08 Tints e shades | T07, T12 | `domain/tints/TintShadeGenerator.js`, `ui/TintShadeTable.js` | `unit/tints.test.js` | ✅ |
| RF-09 Daltonismo | T07, T12 | `domain/vision/ColorBlindSimulator.js`, `ui/ColorBlindPreview.js` | `unit/vision.test.js` | ✅ |
| RF-10 Exportar e copiar | T08, T12 | `domain/export/*`, `infra/ClipboardService.js`, `ui/ExportPanel.js` | `unit/export.test.js`, `contract/export.contract.test.js` | ✅ |
| RF-11 Link compartilhável | T08 | `infra/UrlStateCodec.js` | `contract/url.contract.test.js` | ✅ |
| RF-12 Seções explicativas | T13 | `index.html` (`#aprenda`) | `e2e/site.spec.js` | ✅ |
| RF-13 Tema claro/escuro | T10 | `ui/ThemeToggle.js`, `styles/tokens.css` | `e2e/site.spec.js` | ✅ |
| RF-14 Menu sem desenhos + parallax no início | T10, T24 | `ui/SiteMenu.js`, `ui/ParallaxScene.js`, `styles/components.css` | `e2e/site.spec.js` | ✅ |
| RF-17 Mockups 60-30-10 | T07, T12b | `domain/proportion/UsageProportion.js`, `domain/contrast/ReadableTextPicker.js`, `ui/UsageMockupPanel.js` | `unit/proportion.test.js`, `unit/contrast.test.js` | ✅ |
| RF-18 Color grading (+ legenda e zonas) | T12b, T21 | `domain/grading/GradientMap.js`, `ui/ColorGradingPanel.js` | `unit/grading.test.js`, `integration/ui.test.js`, `e2e/site.spec.js` | ✅ |
| RF-19 15 paletas do Color Hunt | T07, T11, T18 | `domain/palette/PresetCatalog.js`, `ui/PresetBar.js` | `unit/presets.test.js`, `e2e/site.spec.js` | ✅ |
| RF-20 Consertar contraste | T07, T11 | `domain/guard/ContrastGuard.js`, `ui/ComparisonGrid.js` | `unit/guard.test.js` | ✅ |
| RF-21 Desfazer/refazer | T09 | `app/PaletteStore.js` | `integration/store.test.js` | ✅ |
| RF-22 Seletor visual de cor | T11 | `ui/ColorSlots.js` | `integration/ui.test.js` | ✅ |
| RF-23 Veredito simples + "O que é isso?" | T07, T11 | `domain/contrast/PlainVerdict.js`, `ui/InfoTip.js` | `unit/verdict.test.js` | ✅ |
| RF-24 Sugestão de papéis | T07, T12b | `domain/proportion/RoleAdvisor.js` | `unit/proportion.test.js` | ✅ |
| RF-15 Botão Prazo Certo (nova aba) | T10 | `index.html` (menu) | `e2e/site.spec.js` | ✅ |
| RF-16 Crédito dito pelo Clawd | T10, T25 | `index.html` (rodapé), `styles/components.css` | `e2e/site.spec.js` | ✅ |
| RF-25 Início sem paleta | T22 | `app/PaletteStore.js` (`start`), `ui/PaletteGate.js`, `ui/HeroArt.js` | `integration/store.test.js`, `integration/ui.test.js`, `e2e/site.spec.js` | ✅ |
| RF-26 Harmonias em rascunho | T23 | `app/HarmonyWorkbench.js`, `ui/HarmonyPanel.js` | `integration/store.test.js`, `integration/ui.test.js`, `e2e/site.spec.js` | ✅ |
| RF-27 Sobre | T25 | `index.html` (`#sobre`) | `e2e/site.spec.js` | ✅ |
| RF-28 CTA Prazo Certo | T25 | `index.html` (`.cta`), `styles/tokens.css` (`.zone-ciano`) | `e2e/site.spec.js` | ✅ |
| RF-29 Fontes oficiais | T26 | `index.html` (`.sources`, `.info-panel__source`) | `e2e/site.spec.js` | ✅ |
| RF-31 Cores em imagens com IA | T30 | `index.html` (`#aprenda`) | `e2e/site.spec.js` | ✅ |
| RF-32 Começar do zero | T31 | `app/PaletteStore.js` (`reset`), `infra/UrlStateCodec.js` (`clear`), `ui/HistoryToolbar.js`, `ui/PaletteGate.js` | `integration/store.test.js`, `contract/url.contract.test.js`, `e2e/site.spec.js` | ✅ |
| RF-33 Busca do Google | T33 | `public/googlef4c73ca80a5f6c76.html`, `public/robots.txt`, `public/sitemap.xml`, `index.html` (canonical) | `e2e/site.spec.js` | ✅ |
| RF-34 Estrela no GitHub | T34 | `index.html` (`#sobre` → `.star-cta`), `src/styles/components.css` (`.sobre__grid`, `.star-cta`), `src/ui/Icons.js` (`star`) | `e2e/site.spec.js` | ✅ |
| RF-30 Passos 1 a 4 seguidos | T25 | `index.html` | `e2e/site.spec.js` | ✅ |
| RNF-01 WCAG 2.2 AA na interface | T03, T14, T16 | todo `ui/` | `e2e/a11y.spec.js` + 2 ciclos de auditoria | ✅ |
| RNF-02 Identidade Prazo Certo | T10, T16 | `styles/*` | auditor UX (2 ciclos, aprovado) | ✅ |
| RNF-03 Site estático | T01, T17 | `vite.config.js` | `npm run build` + `vite preview` | ✅ |
| RNF-04 OOP e camadas | todas | `src/**` | revisão de código + lint | ✅ |
| RNF-06 TDD | todas | — | `tests/**` (210 Vitest + 50 Playwright na v1.1.0) | ✅ |
| RNF-09 Didático para não designers | T11–T13, T16 | `ui/*`, textos | e2e + auditor UX (aprovado) | ✅ |
| RNF-07 Movimento reduzido | T10, T24 | `ui/ParallaxScene.js` | `e2e/site.spec.js` | ✅ |
