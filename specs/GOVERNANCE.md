# GOVERNANCE — Paletrês

> Como as decisões são tomadas, quem aprova e quais regras valem para contribuir.

## 1. Papéis

| Papel | Quem | Responsabilidade |
| :--- | :--- | :--- |
| Dono do produto | Mário Lúcio (Prazo Certo) | Define prioridades, aprova exceções à marca e autoriza a publicação. |
| Desenvolvedor | Claude (agente) | Escreve testes e código, atualiza specs e faz commits locais. |
| Auditor de acessibilidade | Subagente `a11y-web` | Audita `src/ui` e emite relatórios por severidade. |
| Auditores de UX e motion | `design-pro:auditor-ux`, `design-pro:auditor-motion` | Revisam a experiência e as animações antes da entrega. |

## 2. O que precisa de aprovação do Mário

- Qualquer nova exceção à regra de cores da Prazo Certo. A moldura preta foi aprovada em 13/11/2026 e o Clawd laranja no rodapé foi pedido pelo Mário na v1.1.0 (15/11/2026).
- Mudança de stack (ADR novo em [ARCHITECTURE.md](ARCHITECTURE.md)).
- Push para o GitHub, publicação no GitHub Pages ou repositório público.
- Remover um requisito do [PRD.md](PRD.md).

## 3. O que o desenvolvedor decide sozinho

- Refatorações internas com testes verdes.
- Correções de achados de auditoria.
- Textos de microcópia dentro do tom de voz da marca.

## 4. Política de mudança

1. Proposta: um requisito novo ou alterado no PRD, ou um achado de auditoria.
2. Registro em [TASKS.md](TASKS.md).
3. Execução pelo fluxo de [WORKFLOW.md](WORKFLOW.md).
4. Verificação pelo checklist de [TESTS.md](TESTS.md).

## 5. Contribuições externas (depois da publicação)

- Issues e pull requests em português do Brasil.
- Todo PR precisa de teste, de specs atualizadas e de `npm test` verde.
- Licença Apache 2.0 (v1.1.0; antes era MIT).

## 6. Versionamento

- SemVer: `MAJOR.MINOR.PATCH`. A versão atual é `1.1.0`. As mudanças de cada versão ficam no `CHANGELOG.md` da raiz.
- Commits no padrão Conventional Commits (ver [WORKFLOW.md](WORKFLOW.md)).
