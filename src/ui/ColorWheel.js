/**
 * ColorWheel — a roda cromática com os 3 marcadores da paleta (RF-05).
 *
 * Geometria (igual à do Adobe Color em HSB):
 *  - o ângulo é a matiz, contando no sentido anti-horário a partir das 3 horas
 *    (0° vermelho, 120° verde, 240° azul);
 *  - a distância até o centro é a saturação (centro = 0%, borda = 100%).
 * O marcador da cor A é o "tom base": pode ser arrastado com o mouse/dedo ou
 * movido pelo teclado (setas ←/→ mudam a matiz; ↑/↓ mudam a saturação; Shift acelera).
 */
import { ColorConverter } from '../domain/color/ColorConverter.js';
import { StoreEvent } from '../app/PaletteStore.js';
import { GestureRecorder } from '../app/GestureRecorder.js';
import { Dom } from './Dom.js';

const NS = 'http://www.w3.org/2000/svg';
const SIZE = 300;
const C = SIZE / 2;
const R = 144;

export class ColorWheel {
  #root;
  #store;
  #bus;
  #gesture;
  #svg;
  #lines = [];
  #markers = [];

  constructor({ root, store, bus }) {
    this.#root = root;
    this.#store = store;
    this.#bus = bus;
    this.#gesture = new GestureRecorder(store);
  }

  mount() {
    const hintId = Dom.uid('roda-dica');
    this.#svg = this.#svgEl('svg', {
      class: 'wheel__svg',
      viewBox: `0 0 ${SIZE} ${SIZE}`,
      tabindex: '0',
      role: 'slider',
      'aria-roledescription': 'roda cromática',
      'aria-label': 'Tom base (cor A) na roda cromática',
      'aria-describedby': hintId,
      'aria-valuemin': '0',
      'aria-valuemax': '359',
    });
    for (let i = 2; i >= 0; i--) {
      const line = this.#svgEl('line', { x1: C, y1: C, stroke: '#000000', 'stroke-width': '2' });
      this.#lines[i] = line;
      this.#svg.append(line);
    }
    for (let i = 2; i >= 0; i--) {
      const g = this.#svgEl('g', {});
      const ring = this.#svgEl('circle', { r: i === 0 ? 17 : 12, fill: 'none', stroke: '#000000', 'stroke-width': '3', class: i === 0 ? 'wheel__base-ring' : '' });
      const dot = this.#svgEl('circle', { r: i === 0 ? 14 : 9, stroke: '#F2F2F2', 'stroke-width': '2' });
      g.append(ring, dot);
      this.#markers[i] = { g, dot };
      this.#svg.append(g);
    }

    Dom.replace(this.#root, [
      Dom.el('div', { class: 'wheel__stage' }, [Dom.el('div', { class: 'wheel__disc', 'aria-hidden': 'true' }), this.#svg]),
      Dom.el('p', { id: hintId, class: 'wheel__hint', text: 'Arraste o ponto maior (cor A) ou use as setas do teclado: ← → mudam o tom, ↑ ↓ mudam a intensidade. Shift acelera.' }),
    ]);

    this.#bindPointer();
    this.#svg.addEventListener('keydown', (e) => this.#onKey(e));
    this.#svg.addEventListener('blur', () => this.#gesture.end());
    this.#bus.on(StoreEvent.PALETTE, () => this.#render());
    this.#render();
  }

  #svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) if (v !== '') el.setAttribute(k, String(v));
    return el;
  }

  /** Converte matiz e saturação em coordenadas (x, y) dentro do SVG. */
  static position(h, s) {
    const rad = (h * Math.PI) / 180;
    const dist = (s / 100) * R;
    return { x: C + dist * Math.cos(rad), y: C - dist * Math.sin(rad) };
  }

  /** O caminho inverso: de um ponto do SVG para matiz e saturação. */
  static fromPoint(x, y) {
    const dx = x - C;
    const dy = C - y;
    const h = ColorConverter.normalizeHue((Math.atan2(dy, dx) * 180) / Math.PI);
    const s = Math.min(1, Math.hypot(dx, dy) / R) * 100;
    return { h: Math.round(h), s: Math.round(s) };
  }

  /**
   * Arraste com desempenho: a caixa do SVG é lida uma vez no início (pointerdown) e
   * os movimentos são aplicados no máximo uma vez por quadro (requestAnimationFrame).
   */
  #bindPointer() {
    let box = null;
    let pending = null;
    let frame = 0;
    const toSvg = (e) => ({ x: ((e.clientX - box.left) / box.width) * SIZE, y: ((e.clientY - box.top) / box.height) * SIZE });
    const flush = () => {
      frame = 0;
      if (!pending) return;
      this.#moveBase(ColorWheel.fromPoint(pending.x, pending.y));
      pending = null;
    };
    let dragging = false;
    this.#svg.addEventListener('pointerdown', (e) => {
      dragging = true;
      box = this.#svg.getBoundingClientRect();
      this.#svg.setPointerCapture?.(e.pointerId);
      this.#svg.focus({ preventScroll: true });
      pending = toSvg(e);
      flush();
    });
    this.#svg.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      pending = toSvg(e);
      if (!frame) frame = requestAnimationFrame(flush);
    });
    const stop = () => {
      if (!dragging) return;
      dragging = false;
      cancelAnimationFrame(frame);
      flush();
      this.#gesture.end();
    };
    this.#svg.addEventListener('pointerup', stop);
    this.#svg.addEventListener('pointercancel', stop);
  }

  #onKey(e) {
    const { h, s } = this.#store.state.palette.at(0).hsb;
    const step = e.shiftKey ? 15 : 1;
    const moves = {
      ArrowLeft: { h: h - step }, ArrowRight: { h: h + step },
      ArrowDown: { s: s - (e.shiftKey ? 15 : 5) }, ArrowUp: { s: s + (e.shiftKey ? 15 : 5) },
      PageDown: { h: h - 15 }, PageUp: { h: h + 15 }, Home: { h: 0 }, End: { h: 359 },
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    this.#moveBase({ h: move.h ?? h, s: Math.min(100, Math.max(0, move.s ?? s)) });
  }

  #moveBase({ h, s }) {
    const current = this.#store.state.palette.at(0);
    const next = current.withHsb({ h: ColorConverter.normalizeHue(h), s });
    this.#gesture.step((opts) => this.#store.setColor(0, next, opts));
  }

  #render() {
    const { palette } = this.#store.state;
    palette.colors.forEach((color, i) => {
      const { x, y } = ColorWheel.position(color.hsb.h, color.hsb.s);
      this.#markers[i].g.setAttribute('transform', `translate(${x} ${y})`);
      this.#markers[i].dot.setAttribute('fill', color.hex);
      this.#lines[i].setAttribute('x2', x);
      this.#lines[i].setAttribute('y2', y);
    });
    const { h, s } = palette.at(0).hsb;
    this.#svg.setAttribute('aria-valuenow', String(Math.round(h)));
    this.#svg.setAttribute('aria-valuetext', `Matiz ${Math.round(h)} graus, intensidade ${Math.round(s)}%. Cor A ${palette.at(0).hex}`);
  }
}
