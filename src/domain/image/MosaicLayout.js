/**
 * MosaicLayout — o formato do mosaico conforme a quantidade de cores achadas na imagem.
 *
 *  3 cores → 1 linha de 3        4 cores → grade 2 × 2
 *  5 cores → pirâmide de base 3 (2 em cima, 3 embaixo)
 *  6 cores → grade de 2 linhas e 3 colunas
 * Com 1 ou 2 cores não há mosaico de escolha: as cores aparecem lado a lado.
 */
const ROWS = Object.freeze({
  1: [1],
  2: [2],
  3: [3],
  4: [2, 2],
  5: [2, 3],
  6: [3, 3],
});

export class MosaicLayout {
  /** Quantas peças vão em cada linha, de cima para baixo. */
  static rows(count) {
    const rows = ROWS[count];
    if (!rows) throw new RangeError(`O mosaico aceita de 1 a 6 cores (recebeu ${count}).`);
    return [...rows];
  }

  /** Nome do formato, usado no CSS e no texto para leitores de tela. */
  static shape(count) {
    MosaicLayout.rows(count); // valida
    if (count === 5) return 'piramide';
    if (count <= 3) return 'linha';
    return 'grade';
  }
}
