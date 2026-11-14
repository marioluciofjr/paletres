# TRACEABILITY — Paletrês

> Matriz que liga requisito → tarefa → código → teste. Nada é commitado sem conferir esta matriz.

| Requisito | Tarefa | Código | Testes | Status |
| :--- | :--- | :--- | :--- | :--- |
| RF-01 Entrada HEX | T04, T11 | `domain/color/Color.js`, `ui/HexInputPanel.js` | `unit/color.test.js` | 🔄 domínio ✅ |
| RF-02 Ajuste HSB | T04, T11 | `domain/color/ColorConverter.js`, `ui/HsbSliderPanel.js` | `unit/color.test.js` | 🔄 domínio ✅ |
| RF-03 6 comparações WCAG | T05, T11 | `domain/contrast/*`, `ui/ComparisonGrid.js` | `unit/contrast.test.js`, `contract/contrast.contract.test.js` | 🔄 domínio ✅ |
| RF-04 APCA | T05 | `domain/contrast/ApcaContrast.js` | `contract/contrast.contract.test.js` | ✅ |
| RF-05 Harmonias | T06, T12 | `domain/harmony/*`, `ui/HarmonyPicker.js`, `ui/ColorWheel.js` | `unit/harmony.test.js` | 🔄 domínio ✅ |
| RF-06 Garantia AA/AAA | T07 | `domain/guard/ContrastGuard.js` | `unit/guard.test.js` | 🔄 domínio ✅ |
| RF-07 Proporção de uso | T07 | `domain/proportion/UsageProportion.js` | `unit/proportion.test.js` | 🔄 domínio ✅ |
| RF-08 Tints e shades | T07, T12 | `domain/tints/TintShadeGenerator.js`, `ui/TintShadeTable.js` | `unit/tints.test.js` | 🔄 domínio ✅ |
| RF-09 Daltonismo | T07, T12 | `domain/vision/ColorBlindSimulator.js`, `ui/ColorBlindPreview.js` | `unit/vision.test.js` | 🔄 domínio ✅ |
| RF-10 Exportar e copiar | T08, T12 | `domain/export/*`, `infra/ClipboardService.js`, `ui/ExportPanel.js` | `unit/export.test.js`, `contract/export.contract.test.js` | 🔄 domínio ✅ |
| RF-11 Link compartilhável | T08 | `infra/UrlStateCodec.js` | `contract/url.contract.test.js` | 🔄 codec ✅ |
| RF-12 Seções explicativas | T13 | `index.html` (`#aprenda`) | e2e | ⏳ |
| RF-13 Tema claro/escuro | T10 | `ui/ThemeToggle.js`, `styles/tokens.css` | e2e | ⏳ |
| RF-14 Menu com parallax | T10 | `ui/ParallaxHeader.js` | e2e | ⏳ |
| RF-17 Mockups 60-30-10 | T07, T12b | `domain/proportion/UsageProportion.js`, `domain/contrast/ReadableTextPicker.js`, `ui/UsageMockupPanel.js` | `unit/proportion.test.js`, `unit/contrast.test.js` | 🔄 domínio ✅ |
| RF-18 Color grading | T12b | `domain/grading/GradientMap.js`, `ui/ColorGradingPanel.js` | `unit/grading.test.js` | 🔄 domínio ✅ |
| RF-19 Paletas prontas | T07, T11 | `domain/palette/PresetCatalog.js`, `ui/PresetBar.js` | `unit/presets.test.js` | 🔄 domínio ✅ |
| RF-20 Consertar contraste | T07, T11 | `domain/guard/ContrastGuard.js`, `ui/ComparisonGrid.js` | `unit/guard.test.js` | 🔄 domínio ✅ |
| RF-21 Desfazer/refazer | T09 | `app/PaletteStore.js` | `integration/store.test.js` | ⏳ |
| RF-22 Seletor visual de cor | T11 | `ui/HexInputPanel.js` | `integration/ui.test.js` | ⏳ |
| RF-23 Veredito simples + "O que é isso?" | T07, T11 | `domain/contrast/PlainVerdict.js`, `ui/InfoTip.js` | `unit/verdict.test.js` | 🔄 domínio ✅ |
| RF-24 Sugestão de papéis | T07, T12b | `domain/proportion/RoleAdvisor.js` | `unit/proportion.test.js` | 🔄 domínio ✅ |
| RF-15 Botão Prazo Certo (nova aba) | T10 | `index.html` (menu) | `e2e/site.spec.js` | ⏳ |
| RF-16 Crédito no rodapé | T10 | `index.html` (rodapé) | `e2e/site.spec.js` | ⏳ |
| RNF-01 WCAG 2.2 AA na interface | T03, T14, T16 | todo `ui/` | `e2e/a11y.spec.js` | ⏳ |
| RNF-02 Identidade Prazo Certo | T10 | `styles/*` | revisão manual + auditor UX | ⏳ |
| RNF-03 Site estático | T01, T17 | `vite.config.js` | `npm run build` | ⏳ |
| RNF-04 OOP e camadas | todas | `src/**` | revisão de código | ⏳ |
| RNF-06 TDD | todas | — | `tests/**` | ⏳ |
| RNF-09 Didático para não designers | T11–T13 | `ui/*`, textos | e2e + auditor UX | ⏳ |
| RNF-07 Movimento reduzido | T10 | `ui/ParallaxHeader.js` | `e2e` | ⏳ |
