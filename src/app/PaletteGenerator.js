/**
 * PaletteGenerator — monta uma paleta nova a partir de uma harmonia (RF-05, RF-06).
 *
 * Antes este código morava dentro do PaletteStore. Na v1.1.0 ele virou uma classe própria
 * porque agora DOIS lugares geram paletas:
 *  - o botão "Gerar paleta" do início (PaletteStore.start);
 *  - o rascunho da seção de harmonias (HarmonyWorkbench).
 * Alta coesão: esta classe só sabe gerar. Ela não guarda estado nem avisa ninguém.
 */
import { Palette } from '../domain/palette/Palette.js';
import { HarmonyStrategy } from '../domain/harmony/HarmonyStrategy.js';
import { GuardLevel } from '../domain/guard/ContrastGuard.js';

export class PaletteGenerator {
  #harmonies;
  #guard;
  #rng;

  constructor({ harmonies, guard, rng }) {
    this.#harmonies = harmonies;
    this.#guard = guard;
    this.#rng = rng;
  }

  /** Um tom base sorteado (matiz qualquer, cor viva). */
  randomBase() {
    return HarmonyStrategy.randomBase(this.#rng);
  }

  /** Sorteia o id de uma das harmonias cadastradas. */
  randomHarmonyId() {
    return this.#rng.pick(this.#harmonies.list()).id;
  }

  /**
   * @param {{ base: {h:number,s:number,b:number}, harmonyId: string, guardLevel: string }} options
   * @returns {{ palette: Palette, message: { kind: 'info'|'warning', text: string } }}
   */
  generate({ base, harmonyId, guardLevel }) {
    let start = base;
    const parts = [];
    // Base sem cor (cinza, preto ou branco) ou muito escura: girar a matiz quase não muda nada.
    // Usamos uma versão mais viva dela como base e avisamos com a mensagem certa para cada caso.
    if (start.s < 15) {
      start = { h: start.h, s: 60, b: Math.max(start.b, 70) };
      parts.push('A cor A estava sem cor (cinza, preto ou branco), então usei uma versão colorida dela como base.');
    } else if (start.b < 15) {
      start = { h: start.h, s: start.s, b: 70 };
      parts.push('A cor A é muito escura, então usei uma versão mais clara dela como base, mantendo o mesmo tom.');
    }
    const harmony = this.#harmonies.get(harmonyId);
    const result = harmony.generate(start, this.#rng);
    let palette = new Palette(result.colors);
    parts.push(`${harmony.name}: ${harmony.description}`);
    if (result.note) parts.push(result.note);
    let kind = 'info';
    if (guardLevel !== GuardLevel.NONE) {
      const fixed = this.#guard.enforce(palette, guardLevel);
      palette = fixed.palette;
      parts.push(fixed.message);
      if (!fixed.ok) kind = 'warning';
    }
    return { palette, message: { kind, text: parts.join(' ') }, harmony };
  }
}
