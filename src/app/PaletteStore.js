/**
 * PaletteStore — o estado único do Paletrês ("fonte da verdade").
 *
 * Guarda a paleta, a cor em edição, as escolhas (harmonia, garantia, papéis), se a pessoa
 * já começou (v1.1.0: o site abre sem paleta), a última mensagem e o histórico para desfazer/refazer.
 * Toda mudança passa por aqui e é anunciada no EventBus; os componentes só escutam.
 *
 * As dependências (gerador de paletas, guard, sugestão de papéis, paletas prontas)
 * chegam pelo construtor: é a injeção de dependência que deixa tudo testável.
 */
import { Palette } from '../domain/palette/Palette.js';
import { PresetCatalog } from '../domain/palette/PresetCatalog.js';
import { createHarmonyRegistry } from '../domain/harmony/defaultHarmonies.js';
import { ContrastGuard, GuardLevel } from '../domain/guard/ContrastGuard.js';
import { RoleAdvisor } from '../domain/proportion/RoleAdvisor.js';
import { RandomSource } from '../infra/RandomSource.js';
import { PaletteGenerator } from './PaletteGenerator.js';

export const StoreEvent = Object.freeze({
  PALETTE: 'palette:changed',
  SELECTION: 'selection:changed',
  SETTINGS: 'settings:changed',
  HISTORY: 'history:changed',
  MESSAGE: 'message:changed',
  STARTED: 'app:started',
});

const HISTORY_LIMIT = 60;

export class PaletteStore {
  #bus;
  #harmonies;
  #generator;
  #guard;
  #advisor;
  #presets;

  #palette;
  #selectedIndex = 0;
  #harmonyId = 'triade';
  #guardLevel = GuardLevel.NONE;
  #started;
  #roles;
  #rolesAuto = true;
  #message = { kind: 'info', text: '' };
  #past = [];
  #future = [];

  constructor({ bus, harmonies, generator, guard, advisor, presets, initialPalette }) {
    this.#bus = bus;
    this.#harmonies = harmonies;
    this.#generator = generator;
    this.#guard = guard;
    this.#advisor = advisor;
    this.#presets = presets;
    // Sem paleta no link, o site abre "trancado" até a pessoa clicar em "Gerar paleta".
    // A paleta padrão fica só por dentro (nunca aparece antes do início).
    this.#started = Boolean(initialPalette);
    this.#palette = initialPalette ?? Palette.default();
    this.#roles = this.#advisor.suggest(this.#palette).roles;
  }

  /** Fábrica com as dependências padrão (o main.js e os testes usam). */
  static create({ bus, rng = RandomSource.system(), initialPalette } = {}) {
    const harmonies = createHarmonyRegistry();
    const guard = new ContrastGuard();
    return new PaletteStore({
      bus,
      harmonies,
      generator: new PaletteGenerator({ harmonies, guard, rng }),
      guard,
      advisor: new RoleAdvisor(),
      presets: new PresetCatalog(),
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
      started: this.#started,
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

  /** O gerador de paletas (o rascunho das harmonias usa o mesmo). */
  get generator() {
    return this.#generator;
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

  /**
   * Grava no histórico uma paleta ANTERIOR (usado ao fim de um gesto, pelo GestureRecorder).
   * Só grava se a paleta atual for diferente dela.
   */
  recordFrom(previous) {
    if (previous.equals(this.#palette)) return;
    this.#past.push(previous);
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
    const base = random ? this.#generator.randomBase() : this.#palette.at(0).hsb;
    const { palette, message } = this.#generator.generate({ base, harmonyId: this.#harmonyId, guardLevel: this.#guardLevel });
    this.setPalette(palette, { message });
  }

  /**
   * "Gerar paleta" do início (RF-25): sorteia uma harmonia, garante contraste AA e libera o site.
   * Não cria passo de desfazer (não existe "antes" para voltar) e não mexe nas escolhas da
   * seção de harmonias. Chamar de novo não faz nada.
   */
  start() {
    if (this.#started) return;
    const { palette, harmony, message } = this.#generator.generate({
      base: this.#generator.randomBase(),
      harmonyId: this.#generator.randomHarmonyId(),
      guardLevel: GuardLevel.AA,
    });
    this.#started = true;
    // Se a garantia não conseguiu AA (raro com uma base viva), a mensagem diz isso em vez de prometer.
    const text = message.kind === 'warning'
      ? `Gerei uma paleta ${harmony.name.toLowerCase()}. ${message.text}`
      : `Pronto! Gerei uma paleta ${harmony.name.toLowerCase()} com texto legível (AA). Agora ajuste as cores do seu jeito.`;
    this.setPalette(palette, { record: false, message: { kind: message.kind === 'warning' ? 'warning' : 'success', text } });
    this.#bus.emit(StoreEvent.STARTED, this.state);
  }

  /**
   * Abre a paleta de um link (ex.: link antigo com # colado na mesma aba).
   * Antes de começar, ela libera o site como o "Gerar paleta" (sem passo de desfazer);
   * depois de começar, é uma troca de paleta comum, que pode ser desfeita.
   */
  adopt(palette) {
    if (this.#started) {
      this.setPalette(palette, { message: { kind: 'info', text: 'Abri a paleta do link.' } });
      return;
    }
    this.#started = true;
    this.setPalette(palette, { record: false, message: { kind: 'success', text: 'Abri a paleta do link. Agora ajuste as cores do seu jeito.' } });
    this.#bus.emit(StoreEvent.STARTED, this.state);
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
