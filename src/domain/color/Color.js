/**
 * Color — Value Object (objeto de valor) que representa uma cor sRGB.
 *
 * "Value Object" quer dizer: a cor é definida só pelo seu valor e nunca muda depois
 * de criada (é imutável). Para "alterar" uma cor, criamos outra (ex.: withHsb).
 * Isso evita bugs em que uma parte do sistema altera a cor que outra parte está usando.
 */
import { ColorConverter } from './ColorConverter.js';

/** Erro específico para HEX inválido: a UI usa a mensagem para orientar a pessoa. */
export class InvalidColorError extends Error {
  constructor(value) {
    super(`"${value}" não é um HEX válido. Use 3 ou 6 dígitos hexadecimais, como #230023.`);
    this.name = 'InvalidColorError';
  }
}

// Aceita "abc", "#abc", "aabbcc" ou "#aabbcc" (maiúsculas ou minúsculas).
const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export class Color {
  #rgb;
  #hsb;
  #hex;

  /** Use as fábricas estáticas (fromHex, fromRgb, fromHsb) em vez do construtor. */
  constructor(rgb, hsb = null) {
    this.#rgb = Object.freeze({ ...rgb });
    this.#hex = ColorConverter.rgbToHex(rgb);
    // Guardamos o HSB de origem quando ele existe: em cinzas (saturação 0) a matiz
    // não pode ser recuperada do RGB, e o slider de Matiz "pularia" para 0.
    this.#hsb = Object.freeze(hsb ? { ...hsb } : ColorConverter.rgbToHsb(rgb));
    Object.freeze(this);
  }

  /** Diz se um texto é um HEX válido, sem lançar erro. */
  static isValidHex(value) {
    return typeof value === 'string' && HEX_PATTERN.test(value.trim());
  }

  /** Cria uma cor a partir de um HEX. Lança InvalidColorError se o valor for inválido. */
  static fromHex(value) {
    if (!Color.isValidHex(value)) throw new InvalidColorError(value);
    let digits = value.trim().replace('#', '');
    // Formato curto: cada dígito é duplicado (#abc → #aabbcc).
    if (digits.length === 3) digits = [...digits].map((d) => d + d).join('');
    return new Color(ColorConverter.hexToRgb(`#${digits}`));
  }

  /** Cria uma cor a partir de RGB (0–255). Valores fora do intervalo são limitados. */
  static fromRgb(r, g, b) {
    const clamp = (v) => Math.round(ColorConverter.clamp(v, 0, 255));
    return new Color({ r: clamp(r), g: clamp(g), b: clamp(b) });
  }

  /** Cria uma cor a partir de HSB. A matiz é normalizada para 0–360. */
  static fromHsb(h, s, b) {
    const hsb = {
      h: ColorConverter.normalizeHue(h),
      s: ColorConverter.clamp(s, 0, 100),
      b: ColorConverter.clamp(b, 0, 100),
    };
    return new Color(ColorConverter.hsbToRgb(hsb), hsb);
  }

  get hex() {
    return this.#hex;
  }

  get rgb() {
    return this.#rgb;
  }

  get hsb() {
    return this.#hsb;
  }

  /** Nova cor trocando só os campos informados de HSB. Ex.: cor.withHsb({ b: 90 }). */
  withHsb(partial) {
    const next = { ...this.#hsb, ...partial };
    return Color.fromHsb(next.h, next.s, next.b);
  }

  /** Duas cores são iguais quando têm o mesmo HEX (o que aparece na tela). */
  equals(other) {
    return other instanceof Color && other.hex === this.#hex;
  }

  /**
   * Igualdade estrita: mesmo HEX e mesmo HSB guardado.
   * Em preto e cinzas, a matiz não muda o HEX, mas muda a posição do slider;
   * o estado precisa saber disso para não ignorar o movimento.
   */
  sameAs(other) {
    if (!this.equals(other)) return false;
    const a = this.#hsb;
    const b = other.hsb;
    return a.h === b.h && a.s === b.s && a.b === b.b;
  }

  /** Limpa o texto colado num campo HEX: tira espaços e ponto e vírgula. */
  static normalizeInput(value) {
    return String(value ?? '').replace(/[\s;]/g, '');
  }

  toString() {
    return this.#hex;
  }
}
