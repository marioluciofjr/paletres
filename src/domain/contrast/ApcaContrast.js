/**
 * ApcaContrast — APCA (Accessible Perceptual Contrast Algorithm), versão APCA-W3 0.0.98G-4g.
 *
 * O APCA é o método candidato ao futuro WCAG 3. Diferente do WCAG 2, ele considera
 * a DIREÇÃO: texto escuro sobre fundo claro tem um resultado diferente de texto claro
 * sobre fundo escuro. O resultado é o "Lc" (lightness contrast):
 *  - Lc positivo: texto escuro sobre fundo claro (até ≈ 106);
 *  - Lc negativo: texto claro sobre fundo escuro (até ≈ −108).
 *
 * As constantes abaixo são as oficiais da versão 0.0.98G-4g. Se o APCA mudar,
 * atualize-as junto com o teste de contrato (ver specs/MAINTENANCE.md).
 */
import { ContrastStrategy } from './ContrastStrategy.js';

const K = Object.freeze({
  mainTRC: 2.4,
  sRco: 0.2126729,
  sGco: 0.7151522,
  sBco: 0.072175,
  normBG: 0.56,
  normTXT: 0.57,
  revTXT: 0.62,
  revBG: 0.65,
  blkThrs: 0.022,
  blkClmp: 1.414,
  scaleBoW: 1.14,
  scaleWoB: 1.14,
  loBoWoffset: 0.027,
  loWoBoffset: 0.027,
  deltaYmin: 0.0005,
  loClip: 0.1,
});

// Faixas de uso simplificadas da documentação do APCA (do maior |Lc| para o menor).
const BANDS = Object.freeze([
  [90, 'Ótimo para texto de corpo'],
  [75, 'Mínimo para texto de corpo'],
  [60, 'Texto de conteúdo (não corpo)'],
  [45, 'Títulos e texto grande'],
  [30, 'Texto não essencial'],
  [15, 'Só elementos não textuais'],
]);

export class ApcaContrast extends ContrastStrategy {
  get name() {
    return 'APCA';
  }

  /** "Luminância estimada" do APCA: curva simples de expoente 2,4 em cada canal. */
  static screenLuminance(color) {
    const { r, g, b } = color.rgb;
    const lin = (v) => (v / 255) ** K.mainTRC;
    return K.sRco * lin(r) + K.sGco * lin(g) + K.sBco * lin(b);
  }

  /** Suaviza os pretos muito escuros (o olho quase não diferencia esses tons). */
  static softClampBlack(y) {
    return y > K.blkThrs ? y : y + (K.blkThrs - y) ** K.blkClmp;
  }

  measure(text, background) {
    const txtY = ApcaContrast.softClampBlack(ApcaContrast.screenLuminance(text));
    const bgY = ApcaContrast.softClampBlack(ApcaContrast.screenLuminance(background));

    // Diferença imperceptível: contraste zero.
    if (Math.abs(bgY - txtY) < K.deltaYmin) return 0;

    let output;
    if (bgY > txtY) {
      // Polaridade normal: texto escuro sobre fundo claro.
      const sapc = (bgY ** K.normBG - txtY ** K.normTXT) * K.scaleBoW;
      output = sapc < K.loClip ? 0 : sapc - K.loBoWoffset;
    } else {
      // Polaridade reversa: texto claro sobre fundo escuro.
      const sapc = (bgY ** K.revBG - txtY ** K.revTXT) * K.scaleWoB;
      output = sapc > -K.loClip ? 0 : sapc + K.loWoBoffset;
    }
    return output * 100;
  }

  /** Traduz o Lc numa recomendação de uso, em português. */
  describe(lc) {
    const abs = Math.abs(lc);
    const band = BANDS.find(([min]) => abs >= min);
    return band ? band[1] : 'Invisível para texto';
  }
}
