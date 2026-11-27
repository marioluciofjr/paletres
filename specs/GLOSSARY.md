# GLOSSARY — Paletrês

> Termos do projeto explicados de forma simples.

## Cor

| Termo | Explicação |
| :--- | :--- |
| **HEX** | Código de 6 dígitos (0–9, A–F) que diz quanto vermelho, verde e azul a cor tem. `#230023` é o roxo da Prazo Certo. |
| **RGB** | Vermelho, verde e azul, cada um de 0 a 255. É o que o monitor mistura. |
| **HSB** | Matiz (*Hue*, 0–360°, o "tom" no círculo), Saturação (0–100%, o quanto a cor é viva) e Brilho (*Brightness*, 0–100%, o quanto ela é clara). Também chamado de HSV. |
| **Matiz base** | A matiz de onde a harmonia parte. |
| **Círculo cromático** | As matizes dispostas num círculo de 360°. |
| **Tom claro** (*tint*) | A cor misturada com branco. No site, desde a v1.2.0, aparece o nome em português. |
| **Tom escuro** (*shade*) | A cor misturada com preto. |
| **OKLab** | Espaço de cor em que a mesma distância numérica quer dizer mais ou menos a mesma diferença visível. Usado para achar e juntar as cores de uma imagem. Cerca de 0,02 é o mínimo que o olho nota. |
| **Luminância relativa** | O quanto uma cor parece clara ao olho, de 0 (preto) a 1 (branco). É a base do cálculo WCAG. |

## Contraste

| Termo | Explicação |
| :--- | :--- |
| **WCAG** | *Web Content Accessibility Guidelines*, as diretrizes internacionais de acessibilidade na web. O Paletrês usa a versão 2.2. |
| **Razão de contraste** | Número de 1:1 (nenhum contraste) a 21:1 (preto e branco). É simétrico: A sobre B dá o mesmo valor que B sobre A. |
| **AA** | Nível mínimo recomendado: 4,5:1 para texto normal, 3:1 para texto grande e componentes. |
| **AAA** | Nível mais rigoroso: 7:1 para texto normal e 4,5:1 para texto grande. |
| **Texto grande** | 24px ou mais, ou 18,66px (14pt) ou mais em negrito. |
| **Componentes de interface** | Bordas de campos, ícones e partes de gráficos (critério 1.4.11, mínimo 3:1). |
| **APCA** | *Accessible Perceptual Contrast Algorithm*, método candidato ao futuro WCAG 3. Esteve no Paletrês até a v1.0.0 e saiu na v1.1.0 (ADR-10). |
| **Comparação (par)** | Duas cores da paleta comparadas pela WCAG. 3 cores geram 3 pares (AB, AC, BC). A ordem não muda o número, então cada par é uma comparação só, com 2 prévias. |

## Harmonias

| Termo | Explicação |
| :--- | :--- |
| **Análogo** | Matizes vizinhas no círculo (±30°). Paleta calma. |
| **Complementar** | Matizes opostas (180°). Contraste forte de tom. |
| **Complementar dividido** | A base e as duas vizinhas da complementar (150° e 210°). |
| **Tríade** | Três matizes a 120° umas das outras. |
| **Quadrado** | Quatro matizes a 90°. No Paletrês entram 3 das 4. |
| **Composto** | A base, uma análoga (30°) e a complementar (180°). |
| **Tons** | Mesma matiz e saturação, mudando só o brilho. |
| **Monocromático** | Mesma matiz, mudando saturação e brilho. |
| **Proporção áurea (φ)** | Número ≈ 1,618. O **ângulo áureo** (≈ 137,5°) divide o círculo nessa proporção. |
| **Sequência de Fibonacci** | 1, 1, 2, 3, 5, 8, 13, 21… Cada termo é a soma dos dois anteriores. A razão entre termos seguidos tende a φ. |
| **Âncora de contraste** | Harmonia do Paletrês: uma cor escura, uma clara e um acento que contrasta com as duas. |
| **60-30-10** | Regra de uso: 60% cor dominante, 30% secundária e 10% destaque. |

## Acessibilidade e técnica

| Termo | Explicação |
| :--- | :--- |
| **Daltonismo** | Dificuldade de distinguir certas cores. **Protanopia** (vermelho), **deuteranopia** (verde), **tritanopia** (azul) e **acromatopsia** (sem cor). |
| **ARIA** | Atributos HTML que explicam a leitores de tela o que um elemento é e faz. |
| **aria-live** | Região da página que o leitor de tela anuncia sozinho quando muda. |
| **prefers-reduced-motion** | Preferência do sistema operacional para reduzir animações. |
| **Psicologia das cores** | Área que estuda como a cor carrega significado e influencia emoções e comportamentos, sempre conforme o contexto. Referência: Elliot e Maier (2014). |
| **Parallax** | Efeito em que camadas se movem em velocidades diferentes na rolagem, dando profundidade. No Paletrês, as 3 bolas do início. |
| **Color grading** | No cinema, a etapa da pós-produção em que o colorista ajusta as cores de cada cena para criar um clima. No Paletrês, é feito por mapa de gradiente. |
| **Mapa de gradiente (gradient map)** | Técnica que troca a cor de cada pixel conforme a claridade dele: sombras, meios-tons e luzes recebem cores escolhidas. |
| **Rascunho (draft)** | Paleta nova da seção de harmonias, mostrada ao lado da paleta atual. Só vira a paleta da pessoa com "Usar esta paleta". |
| **Portão (gate)** | Estado inicial do site, antes de "Gerar paleta": os passos ficam escondidos e aparece um aviso. |
| **k-means** | Algoritmo que separa itens em K grupos parecidos: cada item vai para o grupo de "centro" mais próximo, e cada centro vira a média do seu grupo, até ninguém trocar. No Paletrês, separa os pixels de uma imagem em grupos de cor. |
| **Mosaico** | Os quadrados com as cores principais da imagem (até 6), no formato que muda com a quantidade: linha, grade 2 × 2, pirâmide de base 3 ou grade 2 × 3. Inspirado no "Criar mosaico de objetos" do Adobe Illustrator, mas montado pelas cores dominantes, não pela posição. |
| **Vaga de destaque** | A 6ª peça do mosaico quando a imagem tem mais de 6 cores: vai para a cor mais viva que sobrou (ex.: uma flor vermelha num campo verde), em vez da 6ª maior área. |
| **Clawd** | Mascote do Claude Code, em pixel art laranja. No rodapé, ele "fala" o crédito do projeto. |
| **Color Hunt** | Site com paletas feitas por designers (colorhunt.co). É a fonte das 15 paletas prontas. |
| **TDD** | *Test Driven Development*: escrever o teste antes do código. |
| **OOP** | Programação orientada a objetos: o código é organizado em classes com responsabilidades claras. |
| **Value Object** | Objeto imutável definido só pelo valor, como uma cor. |
| **Strategy** | Padrão em que cada algoritmo (uma harmonia, por exemplo) é uma classe intercambiável. |
| **Observer** | Padrão em que componentes se inscrevem para ser avisados de mudanças. |
| **Vite** | Ferramenta que serve o site no desenvolvimento e empacota a versão final. |
| **Vitest / Playwright / axe-core** | Ferramentas de teste: lógica, navegador real e acessibilidade automática. |
