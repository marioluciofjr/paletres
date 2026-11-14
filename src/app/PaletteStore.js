/**
 * PaletteStore — o estado único do Paletrês ("fonte da verdade").
 *
 * Guarda a paleta, a cor em edição, as escolhas (harmonia, garantia, proporção, papéis),
 * a última mensagem para a pessoa e o histórico para desfazer/refazer.
 * Toda mudança passa por aqui e é anunciada no EventBus; os componentes só escutam.
 *
 * As dependências (harmonias, guard, sugestão de papéis, paletas prontas, sorteio)
 * chegam pelo construtor: é a injeção de dependência que deixa tudo testável.
 */
import { Palette } from '../domain/palette/Palette.js';
import { PresetCatalog } from '../domain/palette/PresetCatalog.js';
import { HarmonyStrategy } from '../domain/harmony/HarmonyStrategy.js';
import { createHarmonyRegistry } from '../domain/harmony/defaultHarmonies.js';
import { ContrastGuard, GuardLevel } from '../domain/guard/ContrastGuard.js';
import { RoleAdvisor } from '../domain/proportion/RoleAdvisor.js';
import { UsageProportion } from '../domain/proportion/UsageProportion.js';
import { RandomSource } from '../infra/RandomSource.js';

export const StoreEvent = Object.freeze({
  PALETTE: 'palette:changed',
  SELECTION: 'selection:changed',
  SETTINGS: 'settings:changed',
  HISTORY: 'history:changed',
  MESSAGE: 'message:changed',
});

const HISTORY_LIMIT = 60;

export class PaletteStore {
  #bus;
  #harmonies;
  #guard;
  #advisor;
  #presets;
  #rng;

  #palette;
  #selectedIndex = 0;
  #harmonyId = 'triade';
  #guardLevel = GuardLevel.NONE;
  #proportionId = '60-30-10';
  #roles;
  #rolesAuto = true;
  #message = { kind: 'info', text: '' };
  #past = [];
  #future = [];

  constructor({ bus, harmonies, guard, advisor, presets, rng, initialPalette }) {
    this.#bus = bus;
    this.#harmonies = harmonies;
    this.#guard = guard;
    this.#advisor = advisor;
    this.#presets = presets;
    this.#rng = rng;
    this.#palette = initialPalette ?? Palette.default();
    this.#roles = this.#advisor.suggest(this.#palette).roles;
  }

  /** Fábrica com as dependências padrão (o main.js e os testes usam). */
  static create({ bus, rng = RandomSource.system(), initialPalette } = {}) {
    return new PaletteStore({
      bus,
      harmonies: createHarmonyRegistry(),
      guard: new ContrastGuard(),
      advisor: new RoleAdvisor(),
      presets: new PresetCatalog(),
      rng,
      initialPalette,
    });
  }

  // ---------- leitura ----------

  get state() {
    return Object.freeze({
      palette: this.#palette,
      selectedIndex: this.#selectedIndex,
      harmonyId: this.#harmonyId,
      guardLevel: this.#guardLevel,
      proportionId: this.#proportionId,
      roles: { ...this.#roles },
      rolesAuto: this.#rolesAuto,
      message: { ...this.#message },
    });
  }

  get harmonies() {
    return this.#harmonies;
  }

  get presets() {
    return this.#presets;
  }

  get canUndo() {
    return this.#past.length > 0;
  }

  get canRedo() {
    return this.#future.length > 0;
  }

  // ---------- paleta ----------

  /**
   * Troca a paleta inteira.
   * @param {{ record?: boolean, message?: {kind:string,text:string} }} options
   *   record=false serve para gestos contínuos (arrastar slider): chame checkpoint() no início.
   */
  setPalette(palette, { record = true, message } = {}) {
    if (palette.equals(this.#palette)) {
      if (message) this.#setMessage(message);
      return;
    }
    if (record) this.checkpoint();
    this.#palette = palette;
    if (this.#rolesAuto) this.#roles = this.#advisor.suggest(palette).roles;
    this.#bus.emit(StoreEvent.PALETTE, this.state);
    if (message) this.#setMessage(message);
  }

  setColor(index, color, options) {
    this.setPalette(this.#palette.withColor(index, color), options);
  }

  /** Salva o estado atual no histórico (início de um gesto ou antes de uma mudança). */
  checkpoint() {
    this.#past.push(this.#palette);
    if (this.#past.length > HISTORY_LIMIT) this.#past.shift();
    this.#future = [];
    this.#bus.emit(StoreEvent.HISTORY, this.#historyState());
  }

  undo() {
    if (!this.canUndo) return false;
    this.#future.push(this.#palette);
    this.#restore(this.#past.pop());
    return true;
  }

  redo() {
    if (!this.canRedo) return false;
    this.#past.push(this.#palette);
    this.#restore(this.#future.pop());
    return true;
  }

  // ---------- ações de alto nível ----------

  /**
   * Gera uma paleta com a harmonia escolhida.
   * random=false parte da cor A atual; random=true sorteia uma cor base.
   */
  generate({ random = false } = {}) {
    const base = random ? HarmonyStrategy.randomBase(this.#rng) : this.#palette.at(0).hsb;
    const harmony = this.#harmonies.get(this.#harmonyId);
    const result = harmony.generate(base, this.#rng);
    let palette = new Palette(result.colors);
    const parts = [`${harmony.name}: ${harmony.description}`];
    if (result.note) parts.push(result.note);
    let kind = 'info';
    if (this.#guardLevel !== GuardLevel.NONE) {
      const fixed = this.#guard.enforce(palette, this.#guardLevel);
      palette = fixed.palette;
      parts.push(fixed.message);
      if (!fixed.ok) kind = 'warning';
    }
    this.setPalette(palette, { message: { kind, text: parts.join(' ') } });
  }

  /** "Consertar contraste": aplica a garantia à paleta atual (padrão AA). */
  fixContrast(level = this.#guardLevel === GuardLevel.NONE ? GuardLevel.AA : this.#guardLevel) {
    const fixed = this.#guard.enforce(this.#palette, level);
    this.setPalette(fixed.palette, { message: { kind: fixed.ok ? 'success' : 'warning', text: fixed.message } });
  }

  applyPreset(id) {
    const preset = this.#presets.get(id);
    this.setPalette(preset.palette, { message: { kind: 'info', text: `Paleta "${preset.name}" aplicada: ${preset.description}` } });
  }

  // ---------- seleção e configurações ----------

  selectColor(index) {
    if (index === this.#selectedIndex) return;
    this.#selectedIndex = index;
    this.#bus.emit(StoreEvent.SELECTION, this.state);
  }

  setHarmony(id) {
    this.#harmonies.get(id); // valida (lança erro se não existir)
    this.#harmonyId = id;
    this.#emitSettings();
  }

  setGuard(level) {
    if (!Object.values(GuardLevel).includes(level)) throw new Error(`Nível de garantia inválido: ${level}`);
    this.#guardLevel = level;
    this.#emitSettings();
  }

  setProportion(id) {
    UsageProportion.get(id); // valida
    this.#proportionId = id;
    this.#emitSettings();
  }

  setRoles(roles) {
    this.#roles = { ...roles };
    this.#rolesAuto = false;
    this.#emitSettings();
  }

  resetRoles() {
    this.#rolesAuto = true;
    this.#roles = this.#advisor.suggest(this.#palette).roles;
    this.#emitSettings();
  }

  /** Mensagem do advisor para a paleta atual (frase pronta). */
  roleSuggestion() {
    return this.#advisor.suggest(this.#palette);
  }

  describeRoles() {
    return this.#advisor.describeRoles(this.#palette, this.#roles);
  }

  // ---------- internos ----------

  #restore(palette) {
    this.#palette = palette;
    if (this.#rolesAuto) this.#roles = this.#advisor.suggest(palette).roles;
    this.#bus.emit(StoreEvent.PALETTE, this.state);
    this.#bus.emit(StoreEvent.HISTORY, this.#historyState());
  }

  #historyState() {
    return { canUndo: this.canUndo, canRedo: this.canRedo };
  }

  #setMessage(message) {
    this.#message = { ...message };
    this.#bus.emit(StoreEvent.MESSAGE, this.state.message);
  }

  #emitSettings() {
    this.#bus.emit(StoreEvent.SETTINGS, this.state);
  }
}
