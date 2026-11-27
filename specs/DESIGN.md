# DESIGN — Paletrês

> Como a interface deve parecer e se comportar. A base é o design system Prazo Certo (`identidade-visual/DESIGN.md`). Aqui ficam só as regras aplicadas ao Paletrês e as exceções aprovadas. Versão 1.1.0.

## 1. Regra de cores da interface

A interface usa só as três cores da marca, nos pares permitidos:

| Elemento | Cor | Fundo |
| :--- | :--- | :--- |
| Texto e bordas sobre a página clara | roxo `#230023` | cinza `#f2f2f2` |
| Texto sobre cards e cabeçalho | cinza | roxo |
| Destaques, valores e títulos de impacto | ciano `#42ffff` | roxo |
| Botão primário (claro) | ciano | roxo |
| Botão primário (escuro) | roxo | ciano |
| Faixa do CTA da Prazo Certo (v1.1.0, `.zone-ciano`) | roxo | ciano |
| Botão do CTA | ciano | roxo |

Sem branco, preto, opacidade, degradê ou sombra na interface.

### 1.1 Exceção aprovada: moldura preta

As cores digitadas pela pessoa usuária são arbitrárias. Para que elas não "vazem" e não se confundam com a marca, **toda amostra ou prévia com cor do usuário fica dentro de uma moldura preta `#000000` de 2px**, com cantos de 8px.

- A exceção vale **só** para amostras, prévias das 3 comparações, células dos tons claros e escuros, peças do mosaico da imagem (v1.2.0), faixas do simulador de daltonismo, faixa de proporção, marcadores da roda cromática, **mockups de site e app** e a **imagem do color grading**.
- Texto da interface nunca fica sobre uma cor do usuário. As exceções são os textos de **prévia** (no card de comparação e dentro dos mockups), que são justamente o objeto do teste.
- Aprovada pelo Mário em 13/11/2026.
- Nas áreas roxas (cards, cabeçalho, hero) e no tema escuro, a moldura preta ganha um **anel cinza de 3px por fora**. Sem ele, uma cor do usuário igual ou parecida com o roxo sumiria (preto sobre roxo dá 1,1:1).
- v1.1.0: a exceção vale também para as amostras do **rascunho das harmonias** e as barras da **legenda do color grading**.

### 1.1.1 Exceção aprovada: o Clawd laranja (v1.1.0)

Pedido do Mário: o crédito do rodapé é "falado" pelo **Clawd**, o mascote do Claude Code, **na cor laranja original `#D77757`**. O laranja aparece só no desenho do Clawd (pixel art em SVG, `aria-hidden`). O balão de fala segue a marca: fundo cinza, texto roxo em Kreon, cantos de 24px e a "pontinha" feita com bordas, sem sombra.

### 1.2 Degradês funcionais (decorrentes da auditoria de UX)

Ainda dentro da área de prévia (moldura preta), três elementos usam degradê **porque o degradê é a informação**, não um enfeite:

- a **roda cromática** (todas as matizes e o centro sem saturação);
- os **trilhos dos sliders HSB** (mostram as cores que o slider vai produzir);
- a **imagem de exemplo** do color grading (é conteúdo, não interface);
- v1.1.0: as duas barras da **legenda do color grading** (a claridade da foto, do preto ao branco, e a cor que cada trecho recebe).

Fora desses quatro, a regra "sem degradê" continua valendo.

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

Ordem da v1.1.0 (os passos 1 a 4 ficam seguidos, para não quebrar a linha de raciocínio):

1. **Início** (`#inicio`): hero com o nome Paletrês, uma frase simples e o passo a passo **1. Escolha · 2. Confira · 3. Teste · 4. Exporte**. O CTA é **"Gerar paleta"**. Depois de gerar, ele vira o link "Ver minha paleta". As 3 bolas têm o parallax (ver §4).
2. **Portão** (`#comecar`, só antes de gerar): 3 círculos tracejados, "Sua paleta ainda está vazia" e o botão "Gerar paleta". A ferramenta (`#ferramenta`) fica escondida até o clique.
3. **Passo 1 de 4 · Escolha** (`#paleta`), **Passo 2 de 4 · Confira** (`#comparacoes`), **Passo 3 de 4 · Teste** (`#pratica`) e **Passo 4 de 4 · Exporte** (`#exportar`).
4. **Extras**, cada um com uma etiqueta antes do título: **Daltonismo** ("Usa a sua paleta atual"), **Harmonias** ("Cria uma paleta nova") e **Tons claros e escuros** ("Variações da sua paleta").
5. **Aprenda** (`#aprenda`), com a fonte oficial no fim de cada card (inclui "Cores em imagens com IA generativa", com o link de Psicologia das Cores); **Sobre** (`#sobre`), com o texto à esquerda e, à direita, o card roxo "Gostou do Paletrês?" para dar uma estrela no GitHub (no tema escuro, ganha borda ciano; no celular, desce para baixo do texto); a faixa ciano do **CTA da Prazo Certo**; e o **Rodapé** em 3 colunas: logo de 320px, contatos e o Clawd com o balão do crédito (no tablet, a logo fica em cima; no celular, tudo empilhado).

Detalhe de cada seção (ordem antiga da v1.0.0 mantida abaixo como referência de conteúdo):

1. **Início** (`#inicio`): ver acima.
2. **Paleta** (`#paleta`): faixa "Comece por aqui" com as paletas prontas, os botões "Sortear paleta", Desfazer, Refazer e "Começar do zero" (v1.1.0), os 3 slots de cor (amostra, seletor visual, campo HEX, botão copiar e botão "Editar") e o painel HSB da cor em edição.
3. **Comparações** (`#comparacoes`): resumo em linguagem simples ("Sua paleta tem 2 de 3 combinações boas para texto"), o botão "Consertar contraste" e os **3 cards** (um por par) em 3 colunas no computador e 1 coluna no tablet e no celular.
4. **Harmonias** (`#harmonias`): roda cromática do rascunho e **3 etapas numeradas**: (1) tipo de harmonia em 3 grupos, (2) contraste da paleta nova (Livre/AA/AAA), (3) "Gerar paleta nova", com a paleta atual e o rascunho lado a lado e os botões "Usar esta paleta" e "Descartar a paleta nova".
5. **Tons claros e escuros** (`#tons`, nome em português desde a v1.2.0): uma linha de 19 células por cor (9 claros de 90% a 10%, a original e 9 escuros de 10% a 90%). Paramos em 90% porque 100% seria branco ou preto puro.
6. **Daltonismo** (`#daltonismo`): a paleta original e as 4 simulações.
7. **Teste na prática** (`#pratica`): regra 60-30-10 (v1.1.0: sem seletor de proporção), seletores de papel (dominante, secundária, destaque) e os dois mockups lado a lado: site web (navegador com barra, menu, hero, cards e botão) e app mobile (moldura de celular com barra superior, lista, card e botão flutuante). Abaixo, a **paleta a partir de uma imagem** (v1.2.0, RF-35): etiqueta "Cria uma paleta nova", aviso de que nada muda antes de "Usar esta paleta", área de upload + "Usar imagem de exemplo" à esquerda e, à direita, o resumo ("Encontrei N cores…"), o aviso do fundo branco ou preto deixado de fora, o **mosaico** (peças da mesma largura, 1/3 da linha, centralizadas: linha de 3, grade 2 × 2, pirâmide 2 + 3 ou grade 2 × 3; cada peça com o HEX, a % da imagem, "Na paleta: cor X" e, se escolhida, "Escolhida" + contorno grosso) e a **paleta sugerida** (selo "Contraste AAA/AA", as 3 cores com a origem: "da imagem", "tom novo" ou "com brilho ajustado", a explicação e "Usar esta paleta"). Com 1 ou 2 cores, no lugar da sugestão: "Carregar outra imagem" e "Gerar paleta monocromática" / "Gerar a 3ª cor a partir das duas". O texto das peças é preto ou branco, o que tiver mais contraste com a cor. Depois, o **color grading**: uma frase sobre o cinema, a área de upload (arrastar ou escolher arquivo), a escolha "Resultado final / Onde entra cada cor", a **legenda das 3 cores**, a imagem antes/depois com divisor arrastável, o slider de intensidade e o botão "Baixar PNG".
8. **Exportar** (`#exportar`): CSS, JSON, PNG e o link compartilhável.
9. **Aprenda** (`#aprenda`): blocos curtos sobre WCAG, as 3 comparações, cores em imagens com IA generativa, harmonias, proporção áurea, Fibonacci, 60-30-10, tints e shades, daltonismo e color grading no cinema (card largo). Cada card termina com "Fontes oficiais" (nunca Wikipédia).
10. **Rodapé**: logo, contatos e, **ao lado dos contatos**, o crédito "Projeto idealizado por Mário Lúcio em cocriação com Claude Code, por meio do modelo Opus 5.5 no esforço Alto.", dito pelo Clawd num balão de HQ (v1.1.0).

### 3.1 Botão "Visitar Prazo Certo"

- Fica no menu, à direita dos links e antes do botão de tema. É um botão ghost cinza sobre o roxo, com ícone de seta para fora.
- Abre https://prazocerto.me com `target="_blank"` e `rel="noopener noreferrer"`.
- O nome acessível avisa a nova aba: "Visitar Prazo Certo (abre em nova aba)". O trecho entre parênteses fica visualmente oculto e é lido pelo leitor de tela.
- No mobile, entra dentro do menu "Seções", no fim da lista.

Grade de 12 colunas, largura máxima de 1200px, respiro de 64px entre seções e 32px entre blocos.

## 4. Menu e parallax (revisto na v1.1.0)

- Cabeçalho fixo no topo, fundo roxo, com o logo `cinza-roxo`, os links das seções (agora com **Sobre**) e o botão de tema.
- **Sem desenhos atrás do menu.** As três camadas animadas da v1.0.0 saíram porque incomodavam.
- O parallax fica nas **3 bolas do início**: na rolagem, cada uma sobe numa velocidade (0,08; 0,16; 0,24 px por px rolado). O JS grava a rolagem em `--parallax-y` (uma vez por quadro, só enquanto o início está na tela) e o CSS aplica `translate`.
- `prefers-reduced-motion: reduce` desliga o parallax.
- No mobile (< 768px), os links viram um menu "Seções" (botão com `aria-expanded`).

## 5. Componentes

### SwatchFrame
Amostra de cor do usuário. Moldura preta de 2px, cantos de 8px e tamanho mínimo de 64×64px. O HEX aparece **fora** da amostra, em texto da interface.

### ColorSlot
Card roxo com SwatchFrame, rótulo ("Cor 1 — A"), campo HEX, botão copiar (ghost) e botão "Editar" com `aria-pressed`. O slot em edição ganha contorno ciano de 3px.

### HsbSlider
`input type="range"` nativo com rótulo visível, valor numérico ao lado e `aria-valuetext` ("Matiz 280 graus"). Atrás do trilho vai uma faixa com o gradiente real da cor (é uma prévia, por isso fica na moldura preta).

### ComparisonCard
- v1.1.0: um card por **par**. Cabeçalho: "Cores A e B".
- Duas prévias lado a lado na moldura preta: "A sobre B" e "B sobre A", cada uma com "Aa" grande e uma frase curta, e a legenda **fora** da cor.
- Valor: **uma** razão WCAG em Kreon 40px ciano, como "17,11:1" (é a mesma nos dois sentidos).
- Selos (componente Badge): Texto normal, Texto grande e Componentes, cada um com **AAA**, **AA** ou **Reprovado** escrito por extenso e um ícone (check, check duplo, x). Nunca só cor.
- (v1.1.0: a linha APCA saiu; ver ADR-10.)

### HarmonyPicker
Grupo de `radio` estilizados como chips, com nome e ícone de cada harmonia. v1.1.0: fica dentro da **Etapa 1 de 3**, com a dica "Marque só uma opção, de qualquer um dos 3 grupos".

### FormStep (v1.1.0)
Etapa: título "Etapa N de 3: …" (h3), uma dica curta e o conteúdo. Cada etapa é um `role="group"` rotulado pelo título. Sem círculo com número ao lado: no feedback em vídeo, o Mário achou o círculo exagerado e redundante com o título.

### DraftCompare (v1.1.0)
Duas colunas: "Sua paleta atual (passos 1 a 4)" e "Paleta nova (rascunho)". Cada cor é uma amostra de 56px na moldura preta, com o HEX **embaixo** (nunca sobre a cor). "Usar esta paleta" é o primário; "Descartar a paleta nova" é ghost. Os dois ficam com `aria-disabled` enquanto não há rascunho.

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
- v1.1.0: chips "Resultado final (cores misturadas)" e "Onde entra cada cor (3 zonas)" e a legenda "Como as 3 cores entram na foto": barra da claridade, barra da cor recebida e a lista "Sombras / Meios-tons / Luzes recebem a cor X #HEX".

### Gate (v1.1.0)
Bloco centrado com 3 círculos tracejados de 56px, título "Sua paleta ainda está vazia", frase curta e o botão primário "Gerar paleta". Recebe o foco quando a pessoa clica num link do menu antes de gerar.

### CTA da Prazo Certo (v1.1.0)
Faixa `.zone-ciano` antes do rodapé: o texto pedido pelo Mário em Kreon (20–28px, roxo) e o botão roxo "Acessar prazocerto.me", que abre em nova aba.

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

   Logo abaixo vêm a razão e os selos AA/AAA, para quem quer o detalhe.
2. **"O que é isso?"** Cada termo técnico (WCAG, AA, AAA, HEX, Matiz, Saturação, Brilho e o nome de cada harmonia) tem um botão "?" ao lado. Ele abre uma explicação curta ali mesmo (disclosure com `aria-expanded`) e não muda de página.
3. **Rótulos amigáveis:** "Matiz (o tom da cor)", "Saturação (o quanto é viva)", "Brilho (o quanto é clara)". As harmonias têm uma descrição de efeito ("calma", "vibrante", "elegante").
4. **Um clique para as tarefas comuns:** paleta pronta, sortear paleta, consertar contraste, copiar HEX, baixar imagem e copiar link.
5. **Sem medo de errar:** Desfazer e Refazer sempre visíveis.
6. **Sugestão pronta:** "Use a cor A no fundo, a B no texto e a C nos botões." Ela já vem aplicada nos mockups.
7. **Visual antes da teoria:** os mockups e o color grading mostram a paleta "de verdade"; a seção Aprenda fica no fim.
8. **Credibilidade (v1.1.0):** toda explicação traz o link de uma fonte oficial. Wikipédia é proibida.
9. **Nada se perde (v1.1.0):** ferramentas que criam outra paleta mostram isso numa etiqueta e trabalham num rascunho.

## 8. Boas práticas de UX aplicadas

- **Lei de Hick:** 11 harmonias em chips agrupados (clássicas, matemáticas e de contraste).
- **Feedback imediato:** cada tecla no HEX ou movimento de slider atualiza tudo.
- **Reconhecer em vez de lembrar:** o card mostra o significado do selo ("passa para texto normal").
- **Um CTA por bloco:** "Gerar paleta nova" abre a Etapa 3 e "Usar esta paleta" só fica ativo depois de gerar.
- **Continuidade (v1.1.0):** os passos 1 a 4 ficam seguidos; os extras vêm depois, marcados como extras.
- **Acessibilidade:** alvos de 44px ou mais, ordem de foco igual à ordem visual e link "Pular para a ferramenta".
