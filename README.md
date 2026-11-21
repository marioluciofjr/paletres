# Paletrês

### 🎨 Use agora: **[paletres.prazocerto.me](https://paletres.prazocerto.me)**

![site no ar - paletres.prazocerto.me](https://img.shields.io/badge/site%20no%20ar-paletres.prazocerto.me-42ffff?labelColor=230023)
![license - Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-green)
![versão - 1.1.0](https://img.shields.io/badge/vers%C3%A3o-1.1.0-230023)
![acessibilidade - WCAG 2.2 AA](https://img.shields.io/badge/acessibilidade-WCAG%202.2%20AA-230023)
![testes - 210 Vitest + 50 Playwright](https://img.shields.io/badge/testes-210%20Vitest%20%2B%2050%20Playwright-230023)
![site - prazocerto.me](https://img.shields.io/badge/site-prazocerto.me-230023)
![linkedin - @marioluciofjr](https://img.shields.io/badge/linkedin-marioluciofjr-blue)

## Índice

* [Introdução](#introdução)
* [Acesse o site](#acesse-o-site)
* [Estrutura do projeto](#estrutura-do-projeto)
  * [Os 4 passos](#os-4-passos)
  * [Ferramentas extras](#ferramentas-extras)
  * [Para quem não é designer](#para-quem-não-é-designer)
  * [Arquitetura do código](#arquitetura-do-código)
  * [Testes](#testes)
  * [Acessibilidade](#acessibilidade)
  * [Privacidade](#privacidade)
  * [Pastas do repositório](#pastas-do-repositório)
* [Feito com IA generativa](#feito-com-ia-generativa)
* [Requisitos](#requisitos)
* [Como rodar no seu computador](#como-rodar-no-seu-computador)
* [Como usar](#como-usar)
* [Links úteis](#links-úteis)
* [Contribuições](#contribuições)
* [Licença](#licença)
* [Contato](#contato)

## Introdução

O Paletrês gera uma paleta de 3 cores e mostra, na hora, se as cores combinam e se dá para ler um texto de uma cor em cima da outra.

A ideia nasceu de um incômodo. As ferramentas de contraste da WCAG comparam só **duas** cores, mas uma paleta de interface quase sempre tem **três** papéis: fundo, texto e destaque. Com 3 cores existem 3 pares, e era preciso fazer a conta de cada um à mão.

O Paletrês junta essa conta e tudo o que há de útil em outros sites para designers num lugar só. É um "Megazord" de recursos para analisar paletas, feito para designers e também para quem não é designer.

## Acesse o site

O Paletrês está no ar em **[https://paletres.prazocerto.me](https://paletres.prazocerto.me)**. Não precisa instalar nada nem criar conta: é só abrir no navegador, no computador ou no celular.

Os links compartilhados pelo Paletrês também usam esse endereço, no formato `https://paletres.prazocerto.me/?p=rrggbb-rrggbb-rrggbb`.

| Item | Detalhe |
|------|---------|
| Endereço | [paletres.prazocerto.me](https://paletres.prazocerto.me) |
| Hospedagem | [Vercel](https://vercel.com), com HTTPS automático |
| Atualização | Automática: cada push na branch `main` publica uma nova versão |
| Busca do Google | Verificado no Google Search Console, com `sitemap.xml` e `robots.txt` |
| Domínio | Subdomínio de [prazocerto.me](https://prazocerto.me), ligado à Vercel por um registro CNAME |

## Estrutura do projeto

O site é uma página única (one page). Ele abre vazio, com 3 círculos "?". O botão **Gerar paleta** sorteia 3 cores que combinam e que dão para ler (contraste AA garantido) e libera os passos.

### Os 4 passos

| Passo | O que você faz | Recursos |
|-------|----------------|----------|
| 1. Escolha | Ajusta as 3 cores | Campo HEX, seletor visual, sliders de Matiz, Saturação e Brilho, 15 paletas prontas do Color Hunt, Sortear, Desfazer, Refazer e Começar do zero |
| 2. Confira | Vê se dá para ler | As 3 comparações pela WCAG 2.2 (uma por par, com as duas prévias), veredito em linguagem simples e o botão Consertar contraste (AA ou AAA) |
| 3. Teste | Vê a paleta em uso | Mockups de site e de app pela regra 60-30-10, com sugestão de qual cor vai no fundo, nos cards e nos botões, e color grading numa foto |
| 4. Exporte | Leva a paleta embora | Imagem PNG, variáveis CSS, JSON e link compartilhável (`?p=rrggbb-rrggbb-rrggbb`) |

### Ferramentas extras

| Ferramenta | Usa a sua paleta? | O que faz |
|------------|-------------------|-----------|
| Daltonismo | Sim | Mostra a paleta como pessoas com protanopia, deuteranopia, tritanopia e acromatopsia veem |
| Harmonias do círculo cromático | Cria uma paleta nova | 11 harmonias, inclusive proporção áurea, Fibonacci e âncora de contraste, num rascunho que só substitui a sua paleta no clique em "Usar esta paleta" |
| Tints e shades | Sim | 9 tons mais claros e 9 mais escuros de cada cor. Um clique copia o HEX |

### Para quem não é designer

- Cada card abre com um veredito simples, como "Bom: pode usar em textos". Os números vêm depois.
- Cada termo técnico tem um botão "O que é isso?" com a explicação ali mesmo.
- A seção "Aprenda" explica contraste, harmonias, proporção áurea, Fibonacci, regra 60-30-10, tints e shades, daltonismo, color grading no cinema e o papel das cores em imagens geradas por IA. Cada explicação traz o link de uma fonte oficial.
- Nada se perde: Desfazer, Refazer e "Recuperar minha paleta" depois de um "Começar do zero".

### Arquitetura do código

O código é JavaScript orientado a objetos, com alta coesão e baixo acoplamento. Cada classe tem uma responsabilidade e recebe as dependências no construtor. O domínio não conhece o navegador.

| Camada | Pasta | Exemplos de classes | Responsabilidade |
|--------|-------|---------------------|------------------|
| Domínio | `src/domain` | `Color`, `Palette`, `Wcag2Contrast`, `PaletteComparator`, `HarmonyStrategy` (11 subclasses), `ContrastGuard`, `GradientMap`, `ColorBlindSimulator` | Regras puras de cor, contraste, harmonia, color grading e exportação |
| Aplicação | `src/app` | `PaletteStore`, `PaletteGenerator`, `HarmonyWorkbench`, `EventBus` | Estado único, geração de paletas, rascunho das harmonias e avisos entre componentes |
| Infraestrutura | `src/infra` | `UrlStateCodec`, `ClipboardService`, `CanvasPngRenderer`, `RandomSource` | Conversa com o navegador: endereço, área de transferência, canvas e sorteio |
| Interface | `src/ui` | `PaletteGate`, `ComparisonGrid`, `HarmonyPanel`, `ColorGradingPanel` | Um componente por seção da página |
| Composição | `src/main.js` | `PaletresApp` | Cria as peças e entrega a cada uma só o que ela precisa |

Padrões de projeto usados: Value Object, Strategy, Registry, Observer, Template Method e injeção de dependência. As decisões técnicas ficam registradas como ADRs em [`specs/ARCHITECTURE.md`](specs/ARCHITECTURE.md).

### Testes

O projeto foi feito com TDD: cada classe nasceu de um teste que falhava primeiro.

| Tipo | Pasta | O que garante |
|------|-------|---------------|
| Unidade | `tests/unit` | Cada regra isolada: cores, contraste, harmonias, garantia, tons, daltonismo, color grading e exportação |
| Integração | `tests/integration` | O estado e os componentes juntos, num DOM simulado (jsdom) |
| Contrato | `tests/contract` | Valores oficiais que não podem mudar (preto e branco = 21:1) e o formato do link |
| Regressão | `tests/regression` | Harmonias e paletas prontas com semente fixa |
| Ponta a ponta | `tests/e2e` | O site real no Chromium, inclusive a varredura de acessibilidade (axe-core) nos temas claro e escuro |

### Acessibilidade

A interface segue a WCAG 2.2 AA: navegação por teclado, foco visível, alvos de 44 px, rótulos em todos os controles, avisos para leitor de tela, layout sem rolagem lateral a 320 px e respeito a "reduzir movimento". Cada versão passa por auditorias de acessibilidade, UX, motion e casos extremos antes da entrega.

### Privacidade

O Paletrês roda inteiro no navegador. Não há servidor, conta nem banco de dados. A foto do color grading é processada no seu computador e nunca é enviada. A paleta fica só no endereço da página (`?p=`), para você compartilhar se quiser.

### Pastas do repositório

```
src/        código (domain, app, infra, ui, styles e main.js)
tests/      unit, integration, contract, regression e e2e
specs/      12 documentos: PRD, arquitetura, design, testes, rastreabilidade, governança e outros
public/     logotipo e favicon
.claude/    agente de acessibilidade a11y-web usado nas auditorias
```

## Feito com IA generativa

O Paletrês é também um **portfólio** do que dá para construir com IA generativa quando há método. Ele foi cocriado por Mário Lúcio e pelo Claude Code, com o modelo Opus 5.5 no esforço Alto, num fluxo de engenharia completo:

1. **Especificação antes do código:** 12 documentos em [`specs/`](specs/README.md), com requisitos, ADRs, design, testes e rastreabilidade.
2. **TDD:** teste primeiro, código depois.
3. **Arquitetura orientada a objetos** em camadas.
4. **Auditorias por agentes especializados:** acessibilidade (o agente [`a11y-web`](.claude/agents/a11y-web.md), deste repositório), UX pelas 30 leis de UX/UI, motion e casos extremos, com ciclos de correção.
5. **Feedback humano:** cada versão foi testada pelo Mário, inclusive com feedback em vídeo.

## Requisitos

| Item | Necessário | Se faltar |
|------|------------|-----------|
| Node.js 20 ou superior | Sim | O servidor local e os testes não rodam |
| Navegador moderno (Chrome, Edge, Firefox ou Safari) | Sim | Alguns recursos, como o color grading, podem não funcionar |
| Chromium do Playwright | Só para `npm run test:e2e` | Instale com `npx playwright install chromium` |

## Como rodar no seu computador

```bash
git clone https://github.com/marioluciofjr/paletres.git
cd paletres
npm install        # instala as dependências
npm run dev        # abre em http://localhost:5173
```

Outros comandos:

| Comando | O que faz |
|---------|-----------|
| `npm test` | Testes rápidos: unidade, integração, contrato e regressão |
| `npm run test:e2e` | Testes no navegador, com varredura de acessibilidade |
| `npm run lint` | Confere o estilo do código |
| `npm run build` | Gera o site final em `dist/` (a Vercel roda este comando a cada push) |

## Como usar

1. Abra **[paletres.prazocerto.me](https://paletres.prazocerto.me)** e clique em **Gerar paleta**.
2. No Passo 1, ajuste as cores ou escolha uma das 15 paletas prontas.
3. No Passo 2, leia o veredito de cada par. Se algum par não der para ler, clique em **Consertar contraste**.
4. No Passo 3, veja a paleta num site, num app e numa foto.
5. No Passo 4, baixe a imagem, copie o CSS ou copie o link para compartilhar.

Sem ideia de cores? Vá em **Harmonias**, escolha um tipo, gere uma paleta nova e clique em **Usar esta paleta**.

## Links úteis
* [Paletrês no ar — paletres.prazocerto.me](https://paletres.prazocerto.me)
* [WCAG 2.2 — W3C](https://www.w3.org/TR/WCAG22/)
* [Critério 1.4.3, contraste mínimo — W3C](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
* [Técnica G18, como calcular o contraste — W3C](https://www.w3.org/WAI/WCAG22/Techniques/general/G18)
* [Adobe Color, roda cromática](https://color.adobe.com/create/color-wheel)
* [Color Hunt, paletas feitas por designers](https://colorhunt.co)
* [Color Shark](https://colorshark.io)
* [Make Tints and Shades](https://maketintsandshades.com)
* [Simulação de daltonismo — Machado, Oliveira e Fernandes (2009), UFRGS](https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html)
* [Daltonismo — National Eye Institute](https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/color-blindness)
* [Psicologia das Cores — Elliot e Maier, Annual Review of Psychology](https://www.annualreviews.org/content/journals/10.1146/annurev-psych-010213-115035)
* [Vite](https://vite.dev) · [Vitest](https://vitest.dev) · [Playwright](https://playwright.dev) · [axe-core](https://github.com/dequelabs/axe-core)

## Contribuições
Abra uma issue para relatar um erro, um cálculo de contraste suspeito ou uma ideia de recurso. Para enviar código, abra um pull request com testes e com as specs atualizadas, e confira se `npm run lint` e `npm test` passam. O código segue o padrão descrito em "Arquitetura do código" e as regras de [`specs/AGENTS.md`](specs/AGENTS.md).

## Licença
Este projeto está licenciado sob a Licença Apache 2.0. Veja os arquivos [LICENSE](LICENSE) e [NOTICE](NOTICE) para mais detalhes.

A licença não cobre marcas: o nome e o logotipo da **Prazo Certo** são de Mário Lúcio, e o **Clawd** é o mascote do Claude Code, da Anthropic. Se você fizer um fork, troque a identidade visual pela sua.

## Contato
Mário Lúcio - Prazo Certo®
<div>
  <a href="https://www.linkedin.com/in/marioluciofjr" target="_blank"><img src="https://img.shields.io/badge/-LinkedIn-%230077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a>
  <a href = "mailto:marioluciofjr@gmail.com" target="_blank"><img src="https://img.shields.io/badge/-Gmail-%23333?style=for-the-badge&logo=gmail&logoColor=white"></a>
  <a href="https://prazocerto.me/contato" target="_blank"><img src="https://img.shields.io/badge/prazocerto.me/contato-230023?style=for-the-badge&logo=wordpress&logoColor=white"></a>
</div>
