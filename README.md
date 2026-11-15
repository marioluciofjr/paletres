# Paletrês

**3 cores, 3 comparações.** Gere uma paleta de 3 cores e descubra, na hora, se elas combinam e se dá para ler um texto de uma cor em cima da outra.

![Versão 1.1.0](https://img.shields.io/badge/vers%C3%A3o-1.1.0-230023)
![Licença Apache 2.0](https://img.shields.io/badge/licen%C3%A7a-Apache%202.0-230023)
![WCAG 2.2 AA](https://img.shields.io/badge/acessibilidade-WCAG%202.2%20AA-230023)
![Testes: 199 Vitest e 40 Playwright](https://img.shields.io/badge/testes-199%20Vitest%20%2B%2040%20Playwright-230023)

## Por que o Paletrês existe

Toda vez que eu ia conferir o contraste pela WCAG, as ferramentas só deixavam comparar **duas** cores. Só que uma paleta de interface quase sempre tem **três** papéis: fundo, texto e destaque. Com 3 cores existem 3 pares, e eu fazia a conta de cada um à mão.

O Paletrês junta num lugar só essa conta e tudo o que eu via de útil em outros sites para designers. É um "Megazord" de recursos para analisar paletas, feito para designers e também para quem não é designer.

— Mário Lúcio, [Prazo Certo](https://prazocerto.me)

## O que ele faz

| Passo | Recurso |
| :--- | :--- |
| Começo | **Gerar paleta:** o Paletrês sorteia 3 cores que combinam e que dão para ler (contraste AA garantido). |
| 1. Escolha | Campo HEX, seletor visual, sliders de **Matiz, Saturação e Brilho**, **15 paletas prontas** do [Color Hunt](https://colorhunt.co), desfazer e refazer. |
| 2. Confira | As **3 comparações** pela WCAG 2.2 (uma por par, com as duas prévias: uma cor sobre a outra e o inverso), com veredito em linguagem simples ("Bom: pode usar em textos") e o botão **Consertar contraste**. |
| 3. Teste | **Mockups de site e de app** pela regra 60-30-10, com sugestão de qual cor vai no fundo, nos cards e nos botões, e **color grading** numa foto, com a legenda das 3 cores. |
| 4. Exporte | PNG, variáveis CSS, JSON e link compartilhável. |
| Extras | **Simulador de daltonismo**, **11 harmonias** (inclusive proporção áurea, Fibonacci e âncora de contraste) num rascunho que não apaga a sua paleta, e **tints e shades**. |

Cada termo técnico tem um botão "O que é isso?". A seção "Aprenda" explica também como a cor muda a mensagem de uma **imagem gerada por IA**, e cada explicação traz o link de uma fonte oficial (W3C, MDN, Adobe, National Eye Institute, Wolfram MathWorld, OEIS, ASC e Blackmagic Design).

A foto do color grading é processada só no navegador e nunca é enviada para um servidor.

## Feito com IA generativa

O Paletrês é também um **portfólio** do que dá para construir com IA generativa quando há método. Ele foi cocriado por Mário Lúcio e pelo [Claude Code](https://claude.com/claude-code) (modelo Opus 5.5, esforço Alto), seguindo um fluxo de engenharia completo:

- **Especificação antes do código:** 12 documentos em [`specs/`](specs/README.md) (requisitos, arquitetura com ADRs, design, testes, rastreabilidade, governança e manutenção).
- **TDD:** cada classe nasceu de um teste que falhava primeiro.
- **Arquitetura orientada a objetos** em camadas (domínio, estado, interface), com Value Object, Strategy, Registry, Observer, Template Method e injeção de dependência.
- **Auditorias por agentes especializados:** acessibilidade (o agente [`a11y-web`](.claude/agents/a11y-web.md), deste repositório), UX pelas 30 leis de UX/UI, motion e casos extremos, com ciclos de correção.
- **Identidade visual da marca Prazo Certo**, com as exceções documentadas em [`specs/DESIGN.md`](specs/DESIGN.md).

## Como rodar

Você precisa do [Node.js](https://nodejs.org) 20 ou mais recente.

```bash
npm install        # instala as dependências
npm run dev        # abre em http://localhost:5173
npm test           # testes rápidos: unidade, integração, contrato e regressão
npm run test:e2e   # testes no navegador, com varredura de acessibilidade (axe-core)
npm run lint       # confere o estilo do código
npm run build      # gera o site final em dist/
```

Na primeira vez que rodar os testes no navegador, instale o Chromium do Playwright com `npx playwright install chromium`.

## Testes

| Tipo | Pasta | O que garante |
| :--- | :--- | :--- |
| Unidade | `tests/unit` | Cada regra isolada: cores, contraste, harmonias, garantia, tons, daltonismo, color grading e exportação. |
| Integração | `tests/integration` | O estado e os componentes juntos, num DOM simulado (jsdom). |
| Contrato | `tests/contract` | Valores oficiais que não podem mudar (preto e branco = 21:1) e o formato do link. |
| Regressão | `tests/regression` | Harmonias e paletas prontas com semente fixa. |
| Ponta a ponta | `tests/e2e` | O site real no Chromium, inclusive a varredura de acessibilidade nos temas claro e escuro. |

## Estrutura

```
src/
  domain/   regras puras, sem DOM (cor, contraste, harmonias, garantia, tons, daltonismo, color grading, exportação)
  app/      estado e geração de paletas (PaletteStore, PaletteGenerator, HarmonyWorkbench, EventBus)
  infra/    conversa com o navegador (URL, área de transferência, armazenamento, canvas)
  ui/       um componente por seção da página
  styles/   tokens da marca e componentes
tests/      unit, integration, contract, regression e e2e
specs/      documentação do projeto
public/     logotipo e favicon
```

## Créditos

- Idealização: **Mário Lúcio** · [prazocerto.me](https://prazocerto.me) · [LinkedIn](https://linkedin.com/in/marioluciofjr) · [GitHub](https://github.com/marioluciofjr)
- Cocriação: Claude Code, com o modelo Opus 5.5 no esforço Alto.
- Inspirações: [Color Shark](https://colorshark.io), [Adobe Color](https://color.adobe.com), [Make Tints and Shades](https://maketintsandshades.com) e [Color Hunt](https://colorhunt.co), de onde vêm as 15 paletas prontas.
- Referências técnicas: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) do W3C e o [modelo de simulação de daltonismo](https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html) de Machado, Oliveira e Fernandes (2009).

## Licença

O código está sob a [Licença Apache 2.0](LICENSE). Leia também o arquivo [NOTICE](NOTICE).

A licença não cobre marcas: o nome e o logotipo da **Prazo Certo** são de Mário Lúcio, e o **Clawd** é o mascote do Claude Code, da Anthropic. Se você fizer um fork, troque a identidade visual pela sua.
