# WORKFLOW — Paletrês

> O caminho de uma ideia até a entrega. Inclui o Implementation Plan.

## 1. Pipeline

```
Ideia ─► Requisito (PRD) ─► Tarefa (TASKS) ─► Teste vermelho ─► Código verde ─► Refatorar
      ─► Lint + testes ─► Atualizar TASKS e TRACEABILITY ─► Commit ─► (fim da fase) Auditoria a11y/UX
      ─► Build ─► Teste manual do Mário ─► Publicação no GitHub (só quando ele pedir)
```

## 2. Regras do fluxo

1. Toda mudança nasce de um requisito (RF/RNF) ou de um achado de auditoria.
2. Uma tarefa por vez. O status muda para 🔄 no início e ✅ no fim.
3. O commit só acontece com `npm test` verde e as specs atualizadas.
4. Mensagem de commit no formato `tipo(escopo): descrição` (ex.: `feat(harmony): rascunho separado da paleta`). Tipos: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `style`.
5. Ao fim das tarefas de UI, rode o subagente `a11y-web` e os auditores `design-pro:auditor-ux` e `design-pro:auditor-motion`.

## 3. Implementation Plan

| Fase | Tarefas | Entrega |
| :--- | :--- | :--- |
| **F1. Fundação** | T01–T03 | Repositório, specs e subagente. |
| **F2. Domínio** | T04–T08 | Todas as regras de cor, contraste, harmonia e exportação, 100% testadas sem DOM. |
| **F3. Estado** | T09 | `PaletteStore` integrado ao domínio e à URL. |
| **F4. Interface** | T10–T13 | One page completa no visual Prazo Certo. |
| **F5. Qualidade** | T14–T16 | E2E, regressão e auditorias. |
| **F6. Entrega** | T17 | `dist/` e README prontos para o GitHub Pages. |

### Detalhe da F2 (ordem TDD)

1. `Color`: `fromHex`, `fromRgb`, `fromHsb`, `hex`, `rgb`, `hsb`, `equals`.
2. `Wcag2Contrast.ratio()` com os valores de contrato, seguido de `ContrastEvaluator.levels()`.
3. (v1.0.0) `ApcaContrast.lc()`, removido na v1.1.0.
4. `Palette` e `PaletteComparator.compare()`, que devolve 6 itens na ordem A/B, B/A, A/C, C/A, B/C, C/B.
5. As harmonias, uma por vez, cada uma com um teste dos desvios de matiz.
6. `ContrastGuard`, `TintShadeGenerator`, `ColorBlindSimulator`, `UsageProportion`.
7. Exportadores e `UrlStateCodec`.

## 4. Revisão

- Antes do commit: `npm run lint && npm test`.
- Antes de cada fase nova: reler `TRACEABILITY.md` e conferir se nada ficou sem teste.
- Antes da entrega: checklist de [TESTS.md](TESTS.md), seção 5.

## 5. Entrega e publicação

1. `npm run build` gera `dist/`.
2. `npm run preview` para o teste do Mário.
3. Só com o aval dele: criar o repositório no GitHub, enviar o código e ativar o GitHub Pages (pasta `dist` via GitHub Actions).
