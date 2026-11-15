# ARCHITECTURE — Paletrês

> Como o sistema é montado por dentro: camadas, módulos, padrões e decisões técnicas. Versão 1.1.0.

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
| `domain/contrast` | `ContrastStrategy`, `Wcag2Contrast`, `ContrastEvaluator`, `PaletteComparator` | Calcular o contraste WCAG 2.2 e montar as 3 comparações (uma por par: `first`, `second`, `ratio`, `levels`). |
| `domain/palette` | `Palette`, `PresetCatalog` | Guardar as 3 cores e trocar uma delas sem mutação; catálogo das 15 paletas prontas do Color Hunt. |
| `domain/harmony` | `HarmonyStrategy` e 11 subclasses, `HarmonyRegistry` | Gerar 3 cores a partir de uma matiz base. |
| `domain/guard` | `ContrastGuard` | Ajustar o brilho (e, no limite, a saturação) por varredura até o par principal de texto atingir AA ou AAA e o destaque ter ≥ 3:1. |
| `domain/tints` | `TintShadeGenerator` | Gerar tons claros e escuros. |
| `domain/vision` | `ColorBlindSimulator` | Simular tipos de daltonismo. |
| `domain/export` | `CssVarsExporter`, `JsonExporter`, `PngExporter` | Converter a paleta num formato de saída. |
| `domain/proportion` | `UsageProportion`, `RoleAdvisor` | Guardar a regra 60-30-10 e sugerir papéis (dominante, secundária, destaque). |
| `domain/contrast` | `ReadableTextPicker` | Escolher, entre as cores da paleta, a de maior contraste para o texto de uma superfície. |
| `domain/grading` | `GradientMap` | Recolorir pixels (`Uint8ClampedArray` RGBA) mapeando a luminância às 3 cores, com intensidade. Dois modos: `smooth` (resultado final) e `zones` (3 faixas sem mistura). Não conhece o `<canvas>`. |
| `infra` | `UrlStateCodec`, `ClipboardService`, `RandomSource`, `PreferenceStorage` | Falar com o navegador (URL, área de transferência, localStorage) e gerar números aleatórios. |
| `app` | `PaletteStore`, `EventBus`, `GestureRecorder` | Guardar o estado (inclusive `started`, do RF-25) e avisar quem está inscrito. |
| `app` | `PaletteGenerator` | Gerar uma paleta por harmonia + garantia. Usado pelo `start()` da store e pelo rascunho. |
| `app` | `HarmonyWorkbench` | O rascunho das harmonias (RF-26): mesma interface de modelo da store, evento próprio `draft:changed`. |
| `ui` | `PaletteGate`, `SiteMenu`, `ParallaxScene` | Portão do início (RF-25), menu do celular e parallax das 3 bolas do início (RF-14). |
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

1. A pessoa digita um HEX no `ColorSlots`.
2. O painel valida com `Color.fromHex()`. Se for inválido, mostra o erro em texto e não muda o estado.
3. O painel chama `store.setColor(index, color)`.
4. O `PaletteStore` cria uma nova `Palette`, grava o hash da URL via `UrlStateCodec` e emite `palette:changed`.
5. `ComparisonGrid`, `HsbSliderPanel`, `TintShadeTable`, `ColorBlindPreview`, `ExportPanel` e o rascunho das harmonias (quando não há rascunho pendente) re-renderizam.
6. O `ComparisonGrid` usa o `PaletteComparator` para obter as 3 comparações e anuncia o pior par na região `aria-live`.

## 5. Decisões técnicas (ADRs resumidos)

| # | Decisão | Alternativa descartada | Motivo |
| :--- | :--- | :--- | :--- |
| ADR-01 | JavaScript puro com classes, sem framework | React, Vue | Projeto pequeno; menos dependências; o OOP fica explícito. |
| ADR-02 | Vite | Sem build | Servidor rápido, módulos ES e build para o GitHub Pages. |
| ADR-03 | HSB nos sliders | HSL, OKLCH | É o modelo do Color Shark e do Adobe Color, que o Mário já usa. |
| ADR-04 | ~~APCA 0.0.98G-4g só como referência~~ | Selo APCA | Substituído pelo ADR-10. |
| ADR-05 | Matrizes de Machado (2009) com severidade 1,0 | Brettel (1997) | Uma matriz 3×3 por tipo; simples e bem aceita. |
| ADR-06 | Tints e shades por mistura em RGB | Mistura em OKLab | Mesmo resultado do maketintsandshades.com, que é a referência pedida. |
| ADR-07 | Paleta na query string (`?p=`) com replaceState | Paleta no hash (`#`) | O hash ficou livre para as âncoras do menu: com a paleta no hash, clicar no menu apagava o link (auditoria E06). Links antigos com `#` continuam sendo lidos. |
| ADR-08 | Garantia AA/AAA só no par principal + destaque ≥ 3:1 | Exigir os 3 pares | Com 3 cores, os 3 pares em AA é matematicamente quase impossível. |
| ADR-09 | Razão exibida com 2 casas, arredondada para baixo | 1 casa, arredondamento comum | Evita mostrar "4,50:1" para um par de 4,499:1, que não passa em AA. |
| ADR-10 | Só WCAG 2.2 (APCA removido na v1.1.0) | Manter o APCA como referência | O Mário testou e não viu diferença útil para decidir. Menos números = interface mais simples para quem não é designer. O `ContrastStrategy` continua, para um método futuro. |
| ADR-11 | Portão no início (`started` na store + `[data-gate]` no HTML) | Paleta padrão visível | Pedido do Mário: a pessoa precisa clicar em "Gerar paleta". A paleta padrão continua só por dentro, como valor técnico. `start()` não grava passo de desfazer. |
| ADR-12 | Rascunho separado para as harmonias (`HarmonyWorkbench`) | Gerar direto na paleta da pessoa | Evita a sensação de "perdi tudo". A roda cromática recebe um modelo com a mesma interface da store (baixo acoplamento). |
| ADR-14 | 3 comparações (uma por par), com 2 prévias por card | 6 cards, um por direção | Pedido do Mário: a WCAG dá o mesmo número nos dois sentidos, então 6 cards repetiam valores. As 2 prévias ficam porque a aparência muda. |
| ADR-15 | "Começar do zero" com `store.reset()` + evento `app:reset` + `UrlStateCodec.clear()` | Recarregar a página | O endereço com `?p=` reabria a paleta e confundia o primeiro acesso. O reset limpa estado, histórico, rascunho e URL sem recarregar. |
| ADR-13 | Parallax por variável CSS (`--parallax-y`) e `translate` por bola | `transform` direto em cada elemento | As bolas são redesenhadas a cada paleta; a variável fica no contêiner e o efeito não se perde. |

## 6. Concessões aceitas

- A roda cromática é um SVG com cores em HSB, não um disco perceptual (OKLCH). Isso combina com o Adobe Color, mas a distribuição visual de matizes não é uniforme.
- Cada par mostra um só número WCAG; as 2 prévias do card continuam porque a aparência muda (ADR-14).
- O PNG exportado usa o `<canvas>` do navegador. No Vitest, o `PngExporter` é testado só pela geração do layout, não pelos pixels.
