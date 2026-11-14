# Paletrês

**3 cores, 6 comparações.** Escolha 3 cores e descubra, na hora, se elas combinam e se dá para ler um texto de uma cor em cima da outra.

O Paletrês nasceu de uma vontade simples: ferramentas como o Color Shark comparam o contraste de **duas** cores, mas uma paleta de verdade tem pelo menos **três** papéis (fundo, texto e destaque). Com 3 cores existem 3 pares, e cada par pode ser "texto sobre fundo" nas duas direções. São 6 comparações.

## O que ele faz

- **6 comparações de contraste**, cada uma com o selo WCAG 2.2 (AA, AAA ou Reprovado) e o valor APCA (Lc), que muda conforme a direção.
- **Veredito em linguagem simples** ("Bom: pode usar em textos e parágrafos"), com os números logo abaixo.
- **Ajuste de Matiz, Saturação e Brilho** com sliders que mostram as cores reais.
- **11 harmonias**: análogo, complementar, complementar dividido, tríade, quadrado, composto, tons, monocromático, **proporção áurea**, **Fibonacci** e **âncora de contraste**.
- **Garantir AA ou AAA**: a paleta gerada já sai legível, mantendo a matiz da harmonia.
- **Consertar contraste** com um clique, **paletas prontas**, **desfazer e refazer**.
- **Teste na prática**: mockups de site e de app nas proporções 60-30-10, áurea e Fibonacci, com sugestão automática de qual cor usar no fundo, no texto e nos botões.
- **Color grading**: aplique a paleta numa foto. A imagem é processada só no navegador.
- **Tints e shades**, **simulador de daltonismo** e exportação em **PNG, CSS e JSON**, mais um **link compartilhável**.

## Como rodar

Você precisa do [Node.js](https://nodejs.org) 20 ou mais recente.

```bash
npm install        # instala as dependências
npm run dev        # abre em http://localhost:5173
npm test           # testes rápidos (unidade, integração, contrato e regressão)
npm run test:e2e   # testes no navegador, com varredura de acessibilidade
npm run build      # gera a versão final em dist/
```

## Tecnologia

- HTML, CSS e JavaScript com classes (sem framework), empacotados com [Vite](https://vitejs.dev).
- Testes com [Vitest](https://vitest.dev), [Playwright](https://playwright.dev) e [axe-core](https://github.com/dequelabs/axe-core), escritos antes do código (TDD).
- Arquitetura em camadas (domínio, estado, interface), com os padrões Value Object, Strategy, Registry, Observer e injeção de dependência.

A documentação completa (requisitos, arquitetura, design, testes e manutenção) está em [`specs/`](specs/README.md).

## Créditos

Projeto idealizado por **Mário Lúcio** ([Prazo Certo](https://prazocerto.me)) em cocriação com Claude Code, por meio do modelo Opus 5.5 no esforço Alto.

- Site: [prazocerto.me](https://prazocerto.me)
- LinkedIn: [/in/marioluciofjr](https://linkedin.com/in/marioluciofjr)
- GitHub: [/marioluciofjr](https://github.com/marioluciofjr)

Referências: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [APCA](https://github.com/Myndex/apca-w3) (versão 0.0.98G-4g), matrizes de daltonismo de Machado, Oliveira e Fernandes (2009).

## Licença

[MIT](LICENSE)
