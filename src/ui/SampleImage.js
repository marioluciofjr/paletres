/**
 * SampleImage — a imagem de exemplo do Paletrês: uma paisagem desenhada no próprio navegador
 * (céu, sol, montanhas e lago). Serve para testar sem precisar de uma foto.
 *
 * Usada pelo color grading e pela paleta a partir de uma imagem. Como é desenhada em código,
 * não há arquivo para baixar e o resultado é sempre o mesmo.
 */
export class SampleImage {
  static WIDTH = 1200;
  static HEIGHT = 750;
  static DESCRIPTION = 'paisagem de exemplo com céu, sol, montanhas e lago';

  /** Desenha a paisagem num canvas novo e devolve o canvas. */
  static draw(doc = document) {
    const w = SampleImage.WIDTH;
    const h = SampleImage.HEIGHT;
    const c = doc.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#1d2b53');
    sky.addColorStop(1, '#ffcf8a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff6d8';
    ctx.beginPath();
    ctx.arc(w * 0.7, h * 0.38, 70, 0, Math.PI * 2);
    ctx.fill();
    const ridge = (y, amp, color, seed) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 20) ctx.lineTo(x, y + Math.sin(x / 90 + seed) * amp + Math.sin(x / 37 + seed * 2) * amp * 0.4);
      ctx.lineTo(w, h);
      ctx.fill();
    };
    ridge(h * 0.52, 40, '#7a5c8c', 1);
    ridge(h * 0.62, 30, '#3d3359', 2);
    const lake = ctx.createLinearGradient(0, h * 0.72, 0, h);
    lake.addColorStop(0, '#9cc3d9');
    lake.addColorStop(1, '#0d1b2a');
    ctx.fillStyle = lake;
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
    return c;
  }
}
