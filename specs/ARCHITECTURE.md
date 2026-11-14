# ARCHITECTURE — Paletrês

> Como o sistema é montado por dentro: camadas, módulos, padrões e decisões técnicas.

## 1. Visão geral

```
            ┌───────────────────────── main.js (composition root) ─────────────────────────┐
            │  cria as dependências e as entrega aos componentes (injeção de dependência)  │
            └──────────────┬───────────────────────────────┬──────────────────────────────┘
                           │                               │
                 ┌─────────▼─────────┐           ┌─────────▼─────────┐
                 │      ui/          │  observa  │      app/         │
                 │ componentes DOM   │◄──────────│  PaletteStore     │
                 │ (views)           │──ações───►│  (estado único)   │
                 └─────────┬─────────┘           └─────────┬─────────┘
                           │ usa                           │ usa
                 ┌─────────▼───────────────────────────────▼─────────┐
                 │                    domain/                         │
                 │ color · contrast · palette · harmony · guard ·     │
                 │ tints · vision · export     (JS puro, sem DOM)     │
                 └─────────────────────────┬─────────────────────────┘
                                           │
                                 ┌─────────▼─────────┐
                                 │      infra/       │
                                 │ URL, clipboard,   │
                                 │ RNG, storage      │
                                 └───────────────────┘
```

**Regra de dependência:** as setas só apontam para dentro. O `domain` não importa nada das outras camadas. A `ui` não calcula contraste: ela pede ao `domain`, via `PaletteStore`, ou recebe os serviços injetados.

## 2. Módulos

| Módulo | Classe(s) | Responsabilidade única |
| :--- | :--- | :--- |
| `domain/color` | `Color`, `ColorConverter` | Representar uma cor imutável e converter HEX ↔ RGB ↔ HSB. |
| `domain/contrast` | `ContrastStrategy`, `Wcag2Contrast`, `ApcaContrast`, `ContrastEvaluator`, `PaletteComparator` | Calcular contraste e montar as 6 comparações. |
| `domain/palette` | `Palette` | Guardar as 3 cores e trocar uma delas sem mutação. |
| `domain/harmony` | `HarmonyStrategy` e 11 subclasses, `HarmonyRegistry` | Gerar 3 cores a partir de uma matiz base. |
| `domain/guard` | `ContrastGuard` | Ajustar o brilho até atingir AA ou AAA. |
| `domain/tints` | `TintShadeGenerator` | Gerar tons claros e escuros. |
| `domain/vision` | `ColorBlindSimulator` | Simular tipos de daltonismo. |
| `domain/export` | `CssVarsExporter`, `JsonExporter`, `PngExporter` | Converter a paleta num formato de saída. |
| `domain/proportion` | `UsageProportion` | Calcular as proporções de uso (60-30-10, áurea, Fibonacci). |
| `infra` | `UrlStateCodec`, `ClipboardService`, `RandomSource`, `PreferenceStorage` | Falar com o navegador (URL, área de transferência, localStorage) e gerar números aleatórios. |
| `app` | `PaletteStore`, `EventBus` | Guardar o estado e avisar quem está inscrito. |
| `ui` | um componente por seção | Desenhar e escutar o DOM. |

## 3. Padrões de projeto

| Padrão | Onde | Por quê |
| :--- | :--- | :--- |
| **Value Object** | `Color`, `Palette` | Imutáveis: duas cores com o mesmo HEX são iguais e ninguém altera uma cor "por baixo". |
| **Strategy** | `ContrastStrategy`, `HarmonyStrategy`, exportadores | Trocar o algoritmo sem mexer em quem usa. Uma harmonia nova é uma classe nova. |
| **Registry / Factory** | `HarmonyRegistry` | A UI lista as harmonias sem conhecer cada classe. |
| **Observer** | `PaletteStore` + `EventBus` | As views reagem às mudanças sem se conhecerem. |
| **Injeção de dependência** | `main.js` | Nos testes, troca `RandomSource` por uma semente fixa e `ClipboardService` por um dublê. |
| **Template Method** | `HarmonyStrategy.generate()` | A base normaliza matizes e cria as `Color`. As subclasses só definem os desvios. |

## 4. Fluxo principal

1. A pessoa digita um HEX no `HexInputPanel`.
2. O painel valida com `Color.fromHex()`. Se for inválido, mostra o erro em texto e não muda o estado.
3. O painel chama `store.setColor(index, color)`.
4. O `PaletteStore` cria uma nova `Palette`, grava o hash da URL via `UrlStateCodec` e emite `palette:changed`.
5. `ComparisonGrid`, `HsbSliderPanel`, `TintShadeTable`, `ColorBlindPreview`, `ColorWheel` e `ExportPanel` re-renderizam.
6. O `ComparisonGrid` usa o `PaletteComparator` para obter as 6 comparações e anuncia o pior caso na região `aria-live`.

## 5. Decisões técnicas (ADRs resumidos)

| # | Decisão | Alternativa descartada | Motivo |
| :--- | :--- | :--- | :--- |
| ADR-01 | JavaScript puro com classes, sem framework | React, Vue | Projeto pequeno; menos dependências; o OOP fica explícito. |
| ADR-02 | Vite | Sem build | Servidor rápido, módulos ES e build para o GitHub Pages. |
| ADR-03 | HSB nos sliders | HSL, OKLCH | É o modelo do Color Shark e do Adobe Color, que o Mário já usa. |
| ADR-04 | APCA 0.0.98G-4g só como referência | Selo APCA | O WCAG 3 ainda é rascunho. |
| ADR-05 | Matrizes de Machado (2009) com severidade 1,0 | Brettel (1997) | Uma matriz 3×3 por tipo; simples e bem aceita. |
| ADR-06 | Tints e shades por mistura em RGB | Mistura em OKLab | Mesmo resultado do maketintsandshades.com, que é a referência pedida. |
| ADR-07 | Estado na URL (hash) | Query string | O hash não recarrega a página e funciona no GitHub Pages. |

## 6. Concessões aceitas

- A roda cromática é um SVG com cores em HSB, não um disco perceptual (OKLCH). Isso combina com o Adobe Color, mas a distribuição visual de matizes não é uniforme.
- O APCA é calculado em sRGB, sem gestão de cor do monitor.
- O PNG exportado usa o `<canvas>` do navegador. No Vitest, o `PngExporter` é testado só pela geração do layout, não pelos pixels.
