# TESTS — Paletrês

> Como o projeto é validado. A regra é **TDD**: o teste nasce antes do código.

## 1. Ciclo TDD

1. **Vermelho:** escreva um teste que descreve o comportamento e veja-o falhar.
2. **Verde:** escreva o mínimo de código para o teste passar.
3. **Refatorar:** melhore o código com todos os testes verdes.

Nenhuma classe de `src/` entra no repositório sem pelo menos um teste que a exercite.

## 2. Tipos de teste

| Pasta | Ferramenta | O que valida | Exemplo |
| :--- | :--- | :--- | :--- |
| `tests/unit` | Vitest (node) | Uma classe isolada, sem DOM. | `Color.fromHex('#abc')` vira `#AABBCC`. |
| `tests/integration` | Vitest + jsdom | Várias classes juntas, inclusive componentes de UI num DOM simulado. | Digitar no `ColorSlots` atualiza o `ComparisonGrid`. |
| `tests/contract` | Vitest (node) | Formatos e valores de referência que não podem mudar. | Preto/branco = 21:1; formato do link `?p=rrggbb-rrggbb-rrggbb`; chaves do JSON exportado. |
| `tests/e2e` | Playwright + axe-core | O site real no Chromium. | Gerar Fibonacci com "Garantir AAA" e conferir os selos; varredura axe nos dois temas. |
| `tests/regression` | Vitest (node) | Resultados congelados com semente fixa. | As 11 harmonias com a semente 42 geram sempre os mesmos HEX. |

## 3. Comandos

```bash
npm test                  # unit + integration + contract + regression
npm run test:unit
npm run test:integration
npm run test:contract
npm run test:regression
npm run test:e2e          # sobe o Vite sozinho e roda o Playwright
npm run lint
```

## 4. Valores de referência (contrato)

| Par | WCAG 2.2 esperado | Fonte |
| :--- | :--- | :--- |
| `#000000` / `#FFFFFF` | 21,00:1 | Definição WCAG |
| `#FFFFFF` / `#FFFFFF` | 1,00:1 | Definição WCAG |
| `#230023` / `#F2F2F2` | 17,1:1 (± 0,05) | DESIGN.md Prazo Certo |
| `#230023` / `#42FFFF` | 15,5:1 (± 0,05) | DESIGN.md Prazo Certo |
| `#777777` / `#FFFFFF` | 4,48:1 (reprova AA normal) | Caso clássico |

Os valores de contrato do APCA saíram na v1.1.0, junto com o APCA (ADR-10).

## 5. Critérios para entregar (Definition of Done)

- [ ] `npm test` verde.
- [ ] `npm run test:e2e` verde, sem violações axe de impacto `serious` ou `critical`.
- [ ] `npm run lint` sem erros.
- [ ] `npm run build` gera `dist/` sem erros.
- [ ] Relatório do subagente `a11y-web` sem achados críticos ou altos em aberto.
- [ ] `TRACEABILITY.md` liga o requisito ao teste.

## 6. Dublês de teste

- `RandomSource.seeded(42)`: gerador pseudoaleatório (mulberry32) com semente, para as harmonias serem previsíveis.
- `ClipboardService` falso: guarda o texto copiado numa variável.
- `UrlStateCodec` recebe um objeto `location` injetável.
- Nos testes e2e, a paleta conhecida entra por link (`/?p=230023-f2f2f2-42ffff`), que abre o site já liberado (RF-25). O estado "antes de gerar" é testado em `/`.

## 7. Cobertura da v1.1.0

| Mudança | Testes |
| :--- | :--- |
| 15 paletas do Color Hunt, sem a marca | `unit/presets.test.js` (5 testes) |
| Sem APCA | `unit/contrast.test.js`, `integration/ui.test.js`, `e2e/site.spec.js` |
| Só 60-30-10 | `unit/proportion.test.js`, `e2e/site.spec.js` |
| Modo zonas e legenda do color grading | `unit/grading.test.js`, `integration/ui.test.js`, `e2e/site.spec.js` |
| Início sem paleta | `integration/store.test.js`, `integration/ui.test.js`, `e2e/site.spec.js` e axe "antes de gerar" nos 2 temas |
| Rascunho das harmonias | `integration/store.test.js` (8 testes), `integration/ui.test.js`, `e2e/site.spec.js` |
| Sobre, CTA, Clawd, fontes oficiais e ordem dos passos | `e2e/site.spec.js` |
