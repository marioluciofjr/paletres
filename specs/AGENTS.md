# AGENTS — Paletrês

> Instruções diretas para agentes de IA que trabalham neste repositório.

## Contexto em uma frase

Site estático (Vite + JavaScript com classes) que compara 3 cores em 3 combinações de contraste (uma por par) e gera paletas por harmonia. O visual segue a marca Prazo Certo.

## Comandos

| Ação | Comando |
| :--- | :--- |
| Servidor local | `npm run dev` |
| Testes rápidos | `npm test` |
| Testes no navegador | `npm run test:e2e` |
| Lint | `npm run lint` |
| Build | `npm run build` |

## Regras obrigatórias

1. **TDD:** escreva o teste antes do código. Ver [TESTS.md](TESTS.md).
2. **Camadas:** `src/domain` nunca importa de `ui`, `app` ou `infra`, nem usa `document` ou `window`.
3. **OOP:** uma classe por arquivo, uma responsabilidade por classe e dependências recebidas pelo construtor.
4. **Comentários:** em português do Brasil, didáticos, explicando o *porquê*.
5. **Cores da interface:** só roxo `#230023`, cinza `#f2f2f2` e ciano `#42ffff`, nos pares permitidos. Exceções documentadas em [DESIGN.md](DESIGN.md) §1.1: preto `#000000` na moldura das amostras e o laranja `#D77757` do Clawd no rodapé.
6. **Acessibilidade:** todo controle novo precisa de rótulo, foco visível, alvo de 44px ou mais e funcionar no teclado. Rode o subagente `a11y-web` ao mexer em `src/ui`.
7. **Movimento:** anime **só `transform`/`translate`** (a marca proíbe opacidade) e respeite `prefers-reduced-motion`.
8. **Specs vivas:** ao terminar uma tarefa, atualize [TASKS.md](TASKS.md) e [TRACEABILITY.md](TRACEABILITY.md) antes do commit.
9. **Git:** commits pequenos, no formato de [WORKFLOW.md](WORKFLOW.md). Nunca faça push sem pedido do Mário.

## Limites

- Não adicione frameworks (React, Vue, Tailwind) sem uma decisão registrada em [ARCHITECTURE.md](ARCHITECTURE.md).
- Não envie dados para serviços externos: o site é 100% local.
- Toda explicação nova precisa de link de fonte oficial. **Nunca use links da Wikipédia** (RF-29).
- Não use as cores da marca Prazo Certo como paleta de exemplo (RF-19).
- Não altere os valores de contrato de [TESTS.md](TESTS.md) para "fazer o teste passar".

## Como adicionar uma harmonia

1. Crie `tests/unit/harmony.test.js` → caso novo (vermelho).
2. Crie `src/domain/harmony/strategies/MinhaHarmonia.js`, estendendo `HarmonyStrategy`.
3. Registre-a em `src/domain/harmony/defaultHarmonies.js`.
4. Atualize o snapshot de regressão com `npx vitest run tests/regression -u` e revise a diferença.
5. Documente a harmonia na seção "Aprenda" e em [GLOSSARY.md](GLOSSARY.md).
