# Paletrês — guia das specs

O Paletrês compara **3 cores em 3 combinações** de contraste (WCAG 2.2), uma por par, e gera paletas por harmonias do círculo cromático, inclusive pela proporção áurea e pela Sequência de Fibonacci. Versão 1.2.0.

## Como rodar

Você precisa do Node.js 20 ou mais recente.

```bash
npm install          # instala as dependências (só na primeira vez)
npm run dev          # abre o site em http://localhost:5173
npm test             # roda os testes rápidos
npm run test:e2e     # roda os testes no navegador
npm run build        # gera a versão final na pasta dist/
```

## Onde está cada coisa

| Pasta ou arquivo | Conteúdo |
| :--- | :--- |
| `index.html` | A página única (one page). |
| `src/domain/` | Regras de cor, contraste e harmonia. Não depende do navegador. |
| `src/app/` | O estado da paleta (`PaletteStore`). |
| `src/ui/` | Os componentes visuais de cada seção. |
| `src/infra/` | URL, área de transferência, aleatoriedade e preferências. |
| `src/styles/` | Tokens e estilos da marca Prazo Certo. |
| `tests/` | Testes `unit`, `integration`, `contract`, `e2e` e `regression`. |
| `specs/` | Esta documentação. |
| `.claude/agents/a11y-web.md` | Subagente que audita a acessibilidade. |

## Mapa das specs

| Pergunta | Spec |
| :--- | :--- |
| Por que o projeto existe? | [PRD.md](PRD.md) |
| Como o código é montado? | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Como a tela deve parecer? | [DESIGN.md](DESIGN.md) |
| Como testar? | [TESTS.md](TESTS.md) |
| O que falta fazer? | [TASKS.md](TASKS.md) |
| Qual é o fluxo de trabalho? | [WORKFLOW.md](WORKFLOW.md) |
| Qual requisito virou qual código? | [TRACEABILITY.md](TRACEABILITY.md) |
| O que significa cada termo? | [GLOSSARY.md](GLOSSARY.md) |
| Como manter? | [MAINTENANCE.md](MAINTENANCE.md) |
| Quem decide o quê? | [GOVERNANCE.md](GOVERNANCE.md) |
| Regras para agentes de IA | [AGENTS.md](AGENTS.md) |
