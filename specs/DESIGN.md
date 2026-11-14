# DESIGN — Paletrês

> Como a interface deve parecer e se comportar. A base é o design system Prazo Certo (`identidade-visual/DESIGN.md`). Aqui ficam só as regras aplicadas ao Paletrês e a exceção aprovada.

## 1. Regra de cores da interface

A interface usa só as três cores da marca, nos pares permitidos:

| Elemento | Cor | Fundo |
| :--- | :--- | :--- |
| Texto e bordas sobre a página clara | roxo `#230023` | cinza `#f2f2f2` |
| Texto sobre cards e cabeçalho | cinza | roxo |
| Destaques, valores e títulos de impacto | ciano `#42ffff` | roxo |
| Botão primário (claro) | ciano | roxo |
| Botão primário (escuro) | roxo | ciano |

Sem branco, preto, opacidade, degradê ou sombra na interface.

### 1.1 Exceção aprovada: moldura preta

As cores digitadas pela pessoa usuária são arbitrárias. Para que elas não "vazem" e não se confundam com a marca, **toda amostra ou prévia com cor do usuário fica dentro de uma moldura preta `#000000` de 2px**, com cantos de 8px.

- A exceção vale **só** para amostras, prévias das 6 comparações, células de tints e shades, faixas do simulador de daltonismo, faixa de proporção, marcadores da roda cromática, **mockups de site e app** e a **imagem do color grading**.
- Texto da interface nunca fica sobre uma cor do usuário. As exceções são os textos de **prévia** (no card de comparação e dentro dos mockups), que são justamente o objeto do teste.
- Aprovada pelo Mário em 13/11/2026.

## 2. Tipografia

| Uso | Estilo |
| :--- | :--- |
| Logo e título do hero | Kreon 700, 48px (32px no mobile) |
| Títulos de seção (h2) | Kreon 600, 28px (24px no mobile) |
| Títulos de card (h3) | Kreon 600, 20px |
| Texto corrido | Quicksand 400, 16px / 1.6 |
| Rótulos, selos e microcópia | Quicksand 500, 12–14px |
| Botões | Quicksand 700, 15px |
| Razão de contraste (KPI) | Kreon 700, 40px, ciano sobre roxo |
| HEX | Quicksand 500, algarismos tabulares, maiúsculas |

## 3. Layout one page

Ordem das seções, todas com âncora no menu:

1. **Início** (`#inicio`): hero com o nome Paletrês, uma frase simples ("Escolha 3 cores e descubra se elas combinam e se dá para ler") e o passo a passo **1. Escolha 3 cores · 2. Veja se dá para ler · 3. Teste e exporte**. O CTA é "Montar minha paleta".
2. **Paleta** (`#paleta`): faixa "Comece por aqui" com as paletas prontas, os botões Desfazer, Refazer e "Sortear paleta", os 3 slots de cor (amostra, seletor visual, campo HEX, botão copiar e botão "Editar") e o painel HSB da cor em edição.
3. **Comparações** (`#comparacoes`): resumo em linguagem simples ("Sua paleta tem 2 combinações boas para texto"), o botão "Consertar contraste" e os 6 cards numa grade 3×2 (2×3 no tablet, 1 coluna no mobile).
4. **Harmonias** (`#harmonias`): roda cromática, seletor de harmonia, seletor de garantia (Livre/AA/AAA), botão "Gerar paleta" e a faixa de proporção de uso.
5. **Teste na prática** (`#pratica`): seletor de proporção (60-30-10, áurea, Fibonacci), seletores de papel (dominante, secundária, destaque) e os dois mockups lado a lado: site web (navegador com barra, menu, hero, cards e botão) e app mobile (moldura de celular com barra superior, lista, card e botão flutuante). Abaixo, o **color grading**: área de upload (arrastar ou escolher arquivo), imagem antes/depois com divisor arrastável, slider de intensidade e botão "Baixar PNG".
6. **Tints e shades** (`#tons`): uma linha de 21 células por cor (10 claros, a original, 10 escuros).
7. **Daltonismo** (`#daltonismo`): a paleta original e as 4 simulações.
8. **Exportar** (`#exportar`): CSS, JSON, PNG e o link compartilhável.
9. **Aprenda** (`#aprenda`): blocos curtos sobre WCAG, APCA, harmonias, proporção áurea e Fibonacci.
10. **Rodapé**: logo, contatos e o crédito "Projeto idealizado por Mário Lúcio em cocriação com Claude Code, por meio do modelo Opus 5.5 no esforço Alto."

### 3.1 Botão "Visitar Prazo Certo"

- Fica no menu, à direita dos links e antes do botão de tema. É um botão ghost cinza sobre o roxo, com ícone de seta para fora.
- Abre https://prazocerto.me com `target="_blank"` e `rel="noopener noreferrer"`.
- O nome acessível avisa a nova aba: "Visitar Prazo Certo (abre em nova aba)". O trecho entre parênteses fica visualmente oculto e é lido pelo leitor de tela.
- No mobile, entra dentro do menu "Seções", no fim da lista.

Grade de 12 colunas, largura máxima de 1200px, respiro de 64px entre seções e 32px entre blocos.

## 4. Menu com parallax

- Cabeçalho fixo no topo, fundo roxo, com o logo `cinza-roxo`, os links das seções e o botão de tema.
- Atrás dos links ficam três camadas decorativas (`aria-hidden="true"`): anel aberto em ciano, crescente em cinza e ondas em ciano, todas sobre o roxo.
- Com a rolagem, cada camada se move numa velocidade (0,15; 0,3; 0,5). Só `transform: translate3d` muda, dentro de `requestAnimationFrame`.
- O cabeçalho encolhe de 96px para 64px depois de 80px de rolagem.
- `prefers-reduced-motion: reduce` desliga o parallax e a transição de altura.
- No mobile (< 768px), os links viram um menu "Seções" (botão com `aria-expanded`).

## 5. Componentes

### SwatchFrame
Amostra de cor do usuário. Moldura preta de 2px, cantos de 8px e tamanho mínimo de 64×64px. O HEX aparece **fora** da amostra, em texto da interface.

### ColorSlot
Card roxo com SwatchFrame, rótulo ("Cor 1 — A"), campo HEX, botão copiar (ghost) e botão "Editar" com `aria-pressed`. O slot em edição ganha contorno ciano de 3px.

### HsbSlider
`input type="range"` nativo com rótulo visível, valor numérico ao lado e `aria-valuetext` ("Matiz 280 graus"). Atrás do trilho vai uma faixa com o gradiente real da cor (é uma prévia, por isso fica na moldura preta).

### ComparisonCard
- Cabeçalho: "Texto A sobre fundo B".
- Prévia na moldura preta: o fundo é a cor B, com "Aa" grande e uma frase curta na cor A.
- Valor: razão WCAG em Kreon 40px ciano, como "17,1:1".
- Selos (componente Badge): Texto normal, Texto grande e Componentes, cada um com **AAA**, **AA** ou **Reprovado** escrito por extenso e um ícone (check, check duplo, x). Nunca só cor.
- Linha APCA: "APCA Lc 104,2 · texto de corpo" e o sinal explicado em texto.

### HarmonyPicker
Grupo de `radio` estilizados como chips, com nome e ícone de cada harmonia.

### GuardSwitch
`radiogroup` com três opções: Livre, Garantir AA, Garantir AAA.

### ColorWheel
SVG de 280px com o disco de matizes (na moldura preta) e 3 marcadores circulares. O marcador base pode ser arrastado com o mouse ou movido pelas setas (±1°, ou ±15° com Shift). Tem `role="slider"`, `aria-valuenow` e `aria-valuetext` com a matiz.

### UsageMockup (site e app)
- É uma prévia, então fica na moldura preta. Usa `role="img"` e um `aria-label` que descreve os papéis ("Mockup de site: fundo #F2F2F2, cards #230023, botões #42FFFF").
- Papéis: **dominante** = fundo da página ou tela (60%); **secundária** = cabeçalho, cards e barras (30%); **destaque** = botões, links e ícones ativos (10%). As áreas são calculadas para respeitar a proporção escolhida.
- O texto de cada superfície usa a cor da paleta com maior contraste WCAG contra ela. Uma legenda fora do mockup mostra a razão de cada par usado e, se algum ficar abaixo de 4,5:1, mostra "Atenção: texto abaixo de AA".

### ColorGradingPanel
- Upload por `<input type="file" accept="image/png,image/jpeg,image/webp">` com rótulo visível. Também aceita arrastar e soltar, e o arquivo pode ser escolhido pelo teclado.
- A imagem é reduzida para no máximo 1600px no lado maior antes do processamento.
- Antes e depois: divisor arrastável com `role="slider"` e operável por setas.
- Slider "Intensidade" (0–100%, padrão 100%) e botão "Baixar PNG".
- Mensagens de erro em texto (formato ou tamanho inválido) num `role="alert"`.

### Toast
Mensagem curta ("HEX copiado") num `role="status"`, fundo roxo e texto cinza, por 2 segundos.

## 6. Estados

- **Hover:** fundo `ink` e texto `surface`.
- **Active:** desloca 1px para baixo.
- **Focus:** contorno de 3px em `focus-ring`, com afastamento de 3px.
- **Disabled:** borda tracejada, sem opacidade.
- **Erro no HEX:** borda tracejada de 3px e mensagem "Use 3 ou 6 dígitos hexadecimais, como #230023" ligada por `aria-describedby`.

## 7. Didático e prático (RNF-09)

O Paletrês precisa servir também a quem **não é designer**. Regras:

1. **Linguagem simples primeiro, número depois.** Cada card abre com o veredito:

   | Razão WCAG | Veredito | Ícone |
   | :--- | :--- | :--- |
   | ≥ 7 | **Excelente:** pode usar em qualquer texto. | check duplo |
   | ≥ 4,5 | **Bom:** pode usar em textos e parágrafos. | check |
   | ≥ 3 | **Só para títulos grandes**, ícones e bordas. | alerta |
   | < 3 | **Não use para texto:** fica difícil de ler. | x |

   Logo abaixo vêm a razão, os selos AA/AAA e o APCA, para quem quer o detalhe.
2. **"O que é isso?"** Cada termo técnico (WCAG, APCA, AA, AAA, HEX, Matiz, Saturação, Brilho e o nome de cada harmonia) tem um botão "?" ao lado. Ele abre uma explicação curta ali mesmo (disclosure com `aria-expanded`) e não muda de página.
3. **Rótulos amigáveis:** "Matiz (o tom da cor)", "Saturação (o quanto é viva)", "Brilho (o quanto é clara)". As harmonias têm uma descrição de efeito ("calma", "vibrante", "elegante").
4. **Um clique para as tarefas comuns:** paleta pronta, sortear paleta, consertar contraste, copiar HEX, baixar imagem e copiar link.
5. **Sem medo de errar:** Desfazer e Refazer sempre visíveis.
6. **Sugestão pronta:** "Use a cor A no fundo, a B no texto e a C nos botões." Ela já vem aplicada nos mockups.
7. **Visual antes da teoria:** os mockups e o color grading mostram a paleta "de verdade"; a seção Aprenda fica no fim.

## 8. Boas práticas de UX aplicadas

- **Lei de Hick:** 11 harmonias em chips agrupados (clássicas, matemáticas e de contraste).
- **Feedback imediato:** cada tecla no HEX ou movimento de slider atualiza tudo.
- **Reconhecer em vez de lembrar:** o card mostra o significado do selo ("passa para texto normal").
- **Um CTA por bloco:** "Gerar paleta" é o único botão primário da seção Harmonias.
- **Acessibilidade:** alvos de 44px ou mais, ordem de foco igual à ordem visual e link "Pular para a ferramenta".
