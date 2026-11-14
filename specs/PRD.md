# PRD — Paletrês

> Documento de requisitos do produto. Responde **por que** o projeto existe e **o que** ele precisa entregar.

## 1. Problema

Ferramentas como o Color Shark checam o contraste WCAG entre **duas** cores. Uma paleta real de interface tem pelo menos **três** papéis (fundo, texto e destaque). Hoje, quem monta uma paleta de três cores precisa conferir cada par à mão, em várias abas, e não vê de uma vez se a paleta inteira é acessível.

Os geradores de harmonia, como o Adobe Color, criam paletas bonitas, mas não dizem se elas passam no WCAG. Também não oferecem composições matemáticas como a proporção áurea ou a Sequência de Fibonacci.

## 2. Solução

O **Paletrês** é um site estático de uma página (one page). Ele:

1. recebe 3 cores em hexadecimal;
2. mostra na hora as **6 comparações** entre elas (3 pares × 2 direções: texto A sobre fundo B e texto B sobre fundo A);
3. dá a cada comparação o selo **WCAG 2.2** (AA, AAA ou Reprovado) e o valor **APCA** (Lc), que muda conforme a direção;
4. deixa ajustar **Matiz, Saturação e Brilho** (HSB) de cada cor;
5. gera paletas por **11 harmonias**, inclusive proporção áurea, Fibonacci e âncora de contraste, com a opção de **garantir AA ou AAA**.

## 3. Público

- O próprio Mário (Prazo Certo), para testar paletas de marcas, slides e sites.
- Designers, pessoas desenvolvedoras e criadoras de conteúdo que precisam de paletas acessíveis.
- **Pessoas que não são designers** (empreendedoras, professoras, social media) e querem escolher cores para uma marca, um slide ou um post sem errar no contraste. Esse é o público que define o tom da interface.
- Estudantes de design que querem entender harmonias e contraste.

## 4. Requisitos funcionais

| ID | Requisito | Prioridade |
| :--- | :--- | :--- |
| RF-01 | Entrada das 3 cores em HEX. Aceita `#rgb`, `#rrggbb`, com ou sem `#`, em maiúsculas ou minúsculas. | Must |
| RF-02 | Ajuste de Matiz (0–360°), Saturação (0–100%) e Brilho (0–100%) da cor selecionada, com reflexo imediato no HEX. | Must |
| RF-03 | 6 comparações ordenadas (A/B, B/A, A/C, C/A, B/C, C/B) com a razão WCAG 2.2 e os selos de texto normal, texto grande e componentes de interface. | Must |
| RF-04 | Valor APCA (Lc) com sinal e faixa de uso recomendada em cada comparação. | Must |
| RF-05 | Geração de paleta por harmonia: análogo, complementar, complementar dividido, tríade, quadrado, composto, tons, monocromático, proporção áurea, Fibonacci e âncora de contraste. Inclui roda cromática com marcadores. | Must |
| RF-06 | Seletor de garantia **Livre / Garantir AA / Garantir AAA**. Ajusta só o brilho e mantém a matiz. Avisa em texto quando não consegue. | Must |
| RF-07 | Prévia da proporção de uso: 60-30-10, áurea (61,8/23,6/14,6) e Fibonacci (8:5:3). | Should |
| RF-08 | Tints e shades: 9 tons mais claros e 9 mais escuros de cada cor, de 10% a 90%. Um clique copia o HEX ou aplica o tom à paleta. | Should |
| RF-09 | Simulador de daltonismo: protanopia, deuteranopia, tritanopia e acromatopsia. | Should |
| RF-10 | Copiar cada HEX e exportar a paleta como variáveis CSS, JSON ou PNG. | Must |
| RF-11 | Link compartilhável: as 3 cores ficam na URL (`#rrggbb-rrggbb-rrggbb`). | Must |
| RF-12 | Seções explicativas sobre WCAG, APCA, harmonias, proporção áurea e Fibonacci. | Should |
| RF-13 | Tema claro e escuro da interface, com a escolha lembrada no navegador. | Should |
| RF-14 | Menu fixo com efeito parallax, que para quando o sistema pede menos movimento. | Must |
| RF-15 | Botão "Visitar Prazo Certo" no menu, que abre https://prazocerto.me numa nova aba e avisa disso em texto para leitores de tela. | Must |
| RF-17 | Mockups de **site web** e de **app mobile** pintados com a paleta numa proporção de uso (60-30-10, áurea ou Fibonacci). A pessoa escolhe qual cor é a dominante, a secundária e o destaque. O texto de cada superfície usa a cor da paleta com mais contraste, e o mockup avisa quando nenhuma passa em AA. | Must |
| RF-18 | Color grading: a pessoa envia uma imagem (JPG, PNG ou WebP, até 15 MB) e vê a imagem recolorida com a paleta por *gradient map* (sombras → cor mais escura, meios-tons → cor do meio, luzes → cor mais clara). Tem slider de intensidade (0–100%), comparação antes/depois e download em PNG. A imagem é processada só no navegador. | Must |
| RF-19 | **Paletas prontas** ("Comece por aqui"): pelo menos 8 paletas de partida com nomes simples (ex.: "Marca Prazo Certo", "Oceano", "Café"). Um clique aplica. | Must |
| RF-20 | **Consertar contraste**: um botão que aplica o `ContrastGuard` à paleta atual (nível AA ou AAA) e explica o que mudou. | Must |
| RF-21 | **Desfazer e refazer** (botões e atalhos Ctrl+Z / Ctrl+Shift+Z) para qualquer mudança na paleta. | Should |
| RF-22 | **Seletor visual de cor** (`input type="color"`) ao lado de cada campo HEX. | Must |
| RF-23 | **Veredito em linguagem simples** em cada comparação ("Excelente", "Bom", "Só para títulos grandes", "Não use para texto") e botões "O que é isso?" que explicam cada termo técnico ali mesmo. | Must |
| RF-24 | **Sugestão de papéis**: o app indica qual cor usar no fundo, no texto e nos botões e já aplica essa sugestão nos mockups (a pessoa pode trocar). | Must |
| RF-16 | Rodapé com o crédito: "Projeto idealizado por Mário Lúcio em cocriação com Claude Code, por meio do modelo Opus 5.5 no esforço Alto." | Must |

## 5. Requisitos não funcionais

| ID | Requisito |
| :--- | :--- |
| RNF-01 | A interface atende à WCAG 2.2 AA: teclado, foco visível, rótulos, alvos de 44px ou mais e reflow a 320px. |
| RNF-02 | A interface segue o design system Prazo Certo. Única exceção: a moldura preta nas amostras de cor do usuário. |
| RNF-03 | Site 100% estático, sem backend, publicável no GitHub Pages. |
| RNF-04 | Código orientado a objetos, com alta coesão e baixo acoplamento. O domínio não conhece o DOM. |
| RNF-05 | Cada mudança de cor atualiza a tela em menos de 50 ms num notebook comum. |
| RNF-06 | Desenvolvimento orientado a testes (TDD): o teste é escrito antes do código. |
| RNF-07 | Respeita `prefers-reduced-motion`. |
| RNF-09 | **Didático e prático, como o Canva:** quem não é designer entende o resultado sem saber o que é WCAG ou HEX. A linguagem simples vem primeiro e o número técnico depois; cada termo técnico tem explicação no próprio lugar; as tarefas comuns levam 1 clique. |
| RNF-08 | Funciona nos navegadores modernos (Chrome, Edge, Firefox e Safari, nas duas versões mais recentes). |

## 6. Fora do escopo (v1)

- Paletas com mais de 3 cores.
- Contas de usuário, nuvem ou banco de dados.
- Extrair a paleta de uma imagem (o color grading faz o caminho inverso: aplica a paleta na imagem).
- Enviar imagens a servidores: o color grading é 100% local.
- Selo oficial APCA: o APCA ainda é um rascunho do WCAG 3, por isso entra só como referência.
- Publicação no GitHub, que acontece depois, a pedido do Mário.

## 7. Arquitetura e padrões (resumo)

- **Arquitetura em camadas:** `domain` (regras puras) → `app` (estado) → `ui` (componentes DOM) → `main.js` (composição). Os detalhes estão em [ARCHITECTURE.md](ARCHITECTURE.md).
- **Padrões de projeto:** Value Object, Strategy, Registry/Factory, Observer e injeção de dependência.
- **Stack:** Vite e JavaScript (ES modules); Vitest, Playwright e axe-core nos testes.

## 8. Métricas de sucesso

- As 6 comparações aparecem em menos de 1 segundo depois de digitar o terceiro HEX.
- Os testes de contrato passam com os valores de referência (preto e branco = 21:1; roxo e cinza da Prazo Certo = 17,1:1).
- O axe-core não acha violações sérias ou críticas nos temas claro e escuro.
- Com "Garantir AAA" ligado, toda paleta gerada tem um par de texto com 7:1 ou mais, ou mostra o aviso.

## 9. Riscos conhecidos

| Risco | Mitigação |
| :--- | :--- |
| As constantes do APCA mudam em versões futuras. | Isolar as constantes em `ApcaContrast` e fixar a versão 0.0.98G-4g no teste de contrato. |
| Moldura preta fora da regra da marca. | A exceção fica documentada em [DESIGN.md](DESIGN.md) e restrita às amostras. |
| A harmonia pura não passa no contraste. | O `ContrastGuard` é opcional e avisa quando falha. |
| O parallax causa desconforto. | Desligar com `prefers-reduced-motion` e mover só `transform`. |
