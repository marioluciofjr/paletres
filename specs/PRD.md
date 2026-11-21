# PRD — Paletrês

> Documento de requisitos do produto. Responde **por que** o projeto existe e **o que** ele precisa entregar.
>
> **Versão 1.1.0.** O que mudou em relação à 1.0.0 está marcado com "v1.1.0" e resumido na seção 10.

## 1. Problema

Ferramentas como o Color Shark checam o contraste WCAG entre **duas** cores. Uma paleta real de interface tem pelo menos **três** papéis (fundo, texto e destaque). Hoje, quem monta uma paleta de três cores precisa conferir cada par à mão, em várias abas, e não vê de uma vez se a paleta inteira é acessível.

Os geradores de harmonia, como o Adobe Color, criam paletas bonitas, mas não dizem se elas passam no WCAG. Também não oferecem composições matemáticas como a proporção áurea ou a Sequência de Fibonacci.

## 2. Solução

O **Paletrês** é um site estático de uma página (one page). Ele:

1. abre vazio e pede que a pessoa clique em **Gerar paleta** (ou abre direto pela paleta de um link compartilhado);
2. mostra na hora as **3 comparações** entre elas, uma por par (AB, AC e BC). Cada card mostra as duas prévias do par (A sobre B e B sobre A), mas um só valor, porque a WCAG dá o mesmo número nos dois sentidos (v1.1.0);
3. dá a cada comparação o selo **WCAG 2.2** (AA, AAA ou Reprovado) e um veredito em linguagem simples;
4. deixa ajustar **Matiz, Saturação e Brilho** (HSB) de cada cor;
5. gera paletas por **11 harmonias**, inclusive proporção áurea, Fibonacci e âncora de contraste, com a opção de **garantir AA ou AAA**, num rascunho que não apaga a paleta da pessoa;
6. testa a paleta em mockups (regra 60-30-10) e numa foto (color grading), e exporta.

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
| RF-03 | **3 comparações** (v1.1.0), uma por par, na ordem AB, AC, BC. Cada card tem as 2 prévias do par (X sobre Y e Y sobre X), uma única razão WCAG 2.2 e os selos de texto normal, texto grande e componentes de interface. | Must |
| ~~RF-04~~ | **Removido na v1.1.0.** O valor APCA (Lc) saiu: na prática, a diferença entre as direções não ajudava a decidir, e o WCAG 2.2 é a norma oficial. Ver ADR-10. | — |
| RF-05 | Geração de paleta por harmonia: análogo, complementar, complementar dividido, tríade, quadrado, composto, tons, monocromático, proporção áurea, Fibonacci e âncora de contraste. Inclui roda cromática com marcadores. | Must |
| RF-06 | Seletor de garantia **Livre / Garantir AA / Garantir AAA**. Ajusta só o brilho e mantém a matiz. Avisa em texto quando não consegue. | Must |
| RF-07 | Prévia da proporção de uso com a regra **60-30-10** (v1.1.0: áurea e Fibonacci saíram dos mockups porque quase não mudavam o visual; continuam nas harmonias). | Should |
| RF-08 | Tints e shades: 9 tons mais claros e 9 mais escuros de cada cor, de 10% a 90%. Um clique copia o HEX ou aplica o tom à paleta. | Should |
| RF-09 | Simulador de daltonismo: protanopia, deuteranopia, tritanopia e acromatopsia. | Should |
| RF-10 | Copiar cada HEX e exportar a paleta como variáveis CSS, JSON ou PNG. | Must |
| RF-11 | Link compartilhável: as 3 cores ficam na URL (`?p=rrggbb-rrggbb-rrggbb`; o formato antigo com `#` continua sendo lido). | Must |
| RF-12 | Seções explicativas sobre WCAG, as 3 comparações, cores em imagens com IA generativa, harmonias, proporção áurea, Fibonacci, 60-30-10, tints e shades, daltonismo e **color grading no cinema** (v1.1.0). | Should |
| RF-13 | Tema claro e escuro da interface, com a escolha lembrada no navegador. **O padrão é sempre o claro**, mesmo com o sistema no modo escuro (pedido do Mário depois do deploy: o tema no modo dark pode causar estranheza em quem não tem costume, se abrir logo de cara). | Should |
| RF-14 | Menu fixo, **sem desenhos atrás** (v1.1.0). O parallax fica nas 3 bolas do início, que sobem em velocidades diferentes na rolagem e param quando o sistema pede menos movimento. | Must |
| RF-15 | Botão "Visitar Prazo Certo" no menu, que abre https://prazocerto.me numa nova aba e avisa disso em texto para leitores de tela. | Must |
| RF-17 | Mockups de **site web** e de **app mobile** pintados com a paleta pela regra 60-30-10. A pessoa escolhe qual cor é a dominante, a secundária e o destaque. O texto de cada superfície usa a cor da paleta com mais contraste, e o mockup avisa quando nenhuma passa em AA. | Must |
| RF-18 | Color grading: a pessoa envia uma imagem (JPG, PNG ou WebP, até 15 MB) e vê a imagem recolorida com a paleta por *gradient map* (sombras → cor mais escura, meios-tons → cor do meio, luzes → cor mais clara). Tem slider de intensidade (0–100%), comparação antes/depois e download em PNG. A imagem é processada só no navegador. **v1.1.0:** uma legenda mostra qual cor vai nas sombras, nos meios-tons e nas luzes, e o modo "Onde entra cada cor" pinta a foto com as 3 zonas, sem mistura. | Must |
| RF-19 | **Paletas prontas** ("Comece por aqui"): **15 paletas do Color Hunt** (v1.1.0), com nomes simples e crédito ao site. De cada paleta de 4 cores, entram as 3 com melhor contraste. **Nenhuma usa as cores da marca Prazo Certo.** Um clique aplica. | Must |
| RF-20 | **Consertar contraste**: um botão que aplica o `ContrastGuard` à paleta atual (nível AA ou AAA) e explica o que mudou. | Must |
| RF-21 | **Desfazer e refazer** (botões e atalhos Ctrl+Z / Ctrl+Shift+Z) para qualquer mudança na paleta. | Should |
| RF-22 | **Seletor visual de cor** (`input type="color"`) ao lado de cada campo HEX. | Must |
| RF-23 | **Veredito em linguagem simples** em cada comparação ("Excelente", "Bom", "Só para títulos grandes", "Não use para texto") e botões "O que é isso?" que explicam cada termo técnico ali mesmo. | Must |
| RF-24 | **Sugestão de papéis**: o app indica qual cor usar no fundo, no texto e nos botões e já aplica essa sugestão nos mockups (a pessoa pode trocar). | Must |
| RF-16 | Rodapé com o crédito: "Projeto idealizado por Mário Lúcio em cocriação com Claude Code, por meio do modelo Opus 5.5 no esforço Alto." **v1.1.0:** quem "fala" o crédito é o mascote **Clawd**, na cor laranja original, num balão de fala de HQ. O Clawd fica **ao lado dos contatos** (embaixo só no celular). O logotipo da Prazo Certo fica maior (320px). | Must |
| RF-25 | **Início sem paleta** (v1.1.0): sem link compartilhado, o site abre vazio. Os passos e os extras ficam escondidos até a pessoa clicar em **Gerar paleta**, que sorteia uma harmonia com contraste AA garantido e leva ao Passo 1. Links do menu para seções escondidas levam ao aviso. | Must |
| RF-26 | **Harmonias em rascunho** (v1.1.0): a seção mostra 3 etapas, com o título "Etapa N de 3" e sem número grande ao lado (tipo de harmonia → contraste → gerar). A paleta gerada aparece ao lado da paleta atual e só a substitui no clique em "Usar esta paleta" (com Desfazer). Tints e shades avisam que clicar só copia o código. | Must |
| RF-27 | **Sobre** (v1.1.0): item no menu e seção que conta a origem da ideia (comparar 3 cores na WCAG; um "Megazord" de recursos para designers e não designers). | Must |
| RF-28 | **CTA da Prazo Certo** (v1.1.0) antes do rodapé: "Se você gostou dessa página e quer entender mais sobre letramento em IA generativa, acesse prazocerto.me agora mesmo!", com botão que abre o site em nova aba. | Must |
| RF-29 | **Fontes oficiais** (v1.1.0): cada explicação traz o link de uma fonte oficial (W3C, MDN, Adobe, NEI, MathWorld, OEIS, ASC, Blackmagic Design). **Links da Wikipédia são proibidos.** | Must |
| RF-31 | **Cores em imagens com IA generativa** (v1.1.0): card em "Aprenda" sobre como a cor muda a mensagem de uma imagem gerada por IA, com dica de prompt e link de **Psicologia das Cores** (Elliot e Maier, *Annual Review of Psychology*, 2014). | Must |
| RF-32 | **Começar do zero** (v1.1.0, feedback em vídeo): botão no Passo 1 que apaga a paleta e o histórico, limpa o `?p=` do endereço e volta aos círculos com "?". É reversível: o aviso do início mostra "Recuperar minha paleta" (e Ctrl+Z recupera) até a pessoa gerar outra paleta. O botão fica à direita, longe de Desfazer/Refazer. | Must |
| RF-33 | **Busca do Google**: arquivo de verificação do Google Search Console na raiz (`public/googlef4c73ca80a5f6c76.html`), `robots.txt`, `sitemap.xml` e link canônico `https://paletres.prazocerto.me/` (os links `?p=` contam como a mesma página). | Should |
| RF-34 | **Estrela no GitHub**: no Sobre, ao lado do texto, um card convida a dar uma estrela no repositório (`github.com/marioluciofjr/paletres`), com explicação para leigos e link em nova aba. No celular, o card desce para baixo do texto. | Could |
| RF-30 | **Passos seguidos** (v1.1.0): a ordem da página é Passo 1 (Escolha) → 2 (Confira) → 3 (Teste) → 4 (Exporte) e só depois os extras (Daltonismo, Harmonias, Tons), cada um com uma etiqueta que diz se usa a paleta atual ou cria outra. | Must |

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
- APCA: saiu na v1.1.0 (ver RF-04 e ADR-10). Pode voltar quando o WCAG 3 for publicado.
- Publicação no GitHub, que acontece depois, a pedido do Mário.

## 7. Arquitetura e padrões (resumo)

- **Arquitetura em camadas:** `domain` (regras puras) → `app` (estado) → `ui` (componentes DOM) → `main.js` (composição). Os detalhes estão em [ARCHITECTURE.md](ARCHITECTURE.md).
- **Padrões de projeto:** Value Object, Strategy, Registry/Factory, Observer e injeção de dependência.
- **Stack:** Vite e JavaScript (ES modules); Vitest, Playwright e axe-core nos testes.

## 8. Métricas de sucesso

- As 3 comparações aparecem em menos de 1 segundo depois de digitar o terceiro HEX.
- Os testes de contrato passam com os valores de referência (preto e branco = 21:1; roxo e cinza da Prazo Certo = 17,1:1).
- O axe-core não acha violações sérias ou críticas nos temas claro e escuro.
- Com "Garantir AAA" ligado, toda paleta gerada tem um par de texto com 7:1 ou mais, ou mostra o aviso.

## 9. Riscos conhecidos

| Risco | Mitigação |
| :--- | :--- |
| Um link de fonte oficial sai do ar. | Conferir os links a cada versão (ver [MAINTENANCE.md](MAINTENANCE.md)). |
| Moldura preta fora da regra da marca. | A exceção fica documentada em [DESIGN.md](DESIGN.md) e restrita às amostras. |
| A harmonia pura não passa no contraste. | O `ContrastGuard` é opcional e avisa quando falha. |
| O parallax causa desconforto. | v1.1.0: os desenhos atrás do menu saíram. O efeito ficou só nas 3 bolas do início, desliga com `prefers-reduced-motion` e move só `translate`. |
| A pessoa acha que perdeu a paleta ao usar harmonias ou tons. | Rascunho separado (RF-26), etiquetas nas seções e Desfazer. |

## 10. Mudanças da v1.1.0

Pedido do Mário em `ajustes.md` (16 itens). Resumo: 3 comparações em vez de 6 (sem repetir o mesmo número); menu sem desenhos; 15 paletas do Color Hunt; início sem paleta com o botão "Gerar paleta"; fontes oficiais sem Wikipédia; explicação de color grading no cinema e legenda das 3 cores na foto; mockups só com 60-30-10; Clawd no crédito; sem APCA; harmonias em 3 etapas e em rascunho; passos 1 a 4 seguidos; logotipo maior; seção Sobre; CTA da Prazo Certo; card sobre cores em imagens com IA generativa; Clawd ao lado dos contatos.
