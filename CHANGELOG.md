# Changelog

Todas as mudanças importantes do Paletrês ficam registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e as versões seguem o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2026-11-15

Publicada em **https://paletres.prazocerto.me** (Vercel).

### Adicionado

- **Início sem paleta:** o site abre vazio e o botão **Gerar paleta** sorteia uma harmonia com contraste AA garantido e libera os passos. Links compartilhados continuam abrindo direto na paleta.
- **15 paletas prontas do Color Hunt**, com crédito ao site. De cada paleta de 4 cores, entram as 3 com melhor contraste.
- **Harmonias em 3 etapas numeradas** (tipo, contraste, gerar) e num **rascunho**: a paleta nova aparece ao lado da atual e só a substitui no clique em "Usar esta paleta".
- **Color grading:** legenda que mostra qual cor vai nas sombras, nos meios-tons e nas luzes, e o modo "Onde entra cada cor" (3 zonas, sem mistura).
- **Fontes oficiais** em todas as explicações (W3C, MDN, Adobe, NEI, MathWorld, OEIS, ASC, Blackmagic Design), sem links da Wikipédia.
- Cards novos em "Aprenda": regra 60-30-10, tints e shades, daltonismo, **color grading no cinema** e **cores em imagens com IA generativa** (com o link de Psicologia das Cores).
- Seção **Sobre**, com a origem da ideia, e item "Sobre" no menu.
- **CTA da Prazo Certo** antes do rodapé.
- O mascote **Clawd** "fala" o crédito do projeto num balão de HQ.
- Botão **Começar do zero**: apaga a paleta, limpa o link e volta aos círculos com "?". Apagou sem querer? "Recuperar minha paleta" (ou Ctrl+Z) traz tudo de volta.

### Alterado

- **3 comparações em vez de 6:** cada par de cores vira um card só, com as duas prévias (uma cor sobre a outra e o inverso) e um único valor WCAG, que é o mesmo nos dois sentidos.
- O Clawd fica ao lado dos contatos no rodapé.
- Os passos agora ficam seguidos: **1 Escolha → 2 Confira → 3 Teste → 4 Exporte**. Os extras (Daltonismo, Harmonias, Tons) vêm depois, com uma etiqueta que diz se usam a paleta atual ou criam outra.
- O parallax saiu de trás do menu e ficou só nas 3 bolas do início.
- Os mockups usam só a regra 60-30-10.
- Logotipo da Prazo Certo maior no rodapé.
- O site abre sempre no tema claro. O escuro só aparece se a pessoa escolher no botão de tema.
- Licença trocada de MIT para **Apache 2.0**, com o arquivo `NOTICE`.

### Removido

- **APCA:** as comparações mostram só a WCAG 2.2, a norma oficial.
- Os desenhos animados atrás do menu.
- A escolha de proporção áurea e Fibonacci nos mockups. As duas continuam como harmonias.
- As cores da marca Prazo Certo como paleta de exemplo.

## [1.0.0] - 2026-11-14

### Adicionado

- 3 cores e 6 comparações de contraste, uma por direção (WCAG 2.2 e APCA), com veredito em linguagem simples.
- Sliders de Matiz, Saturação e Brilho e seletor visual de cor.
- 11 harmonias, inclusive proporção áurea, Fibonacci e âncora de contraste, com garantia AA ou AAA.
- Consertar contraste, paletas prontas, desfazer e refazer.
- Mockups de site e app, color grading, tints e shades e simulador de daltonismo.
- Exportação em PNG, CSS e JSON e link compartilhável.
- Tema claro e escuro, e acessibilidade WCAG 2.2 AA auditada em 2 ciclos.
