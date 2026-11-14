/**
 * PresetCatalog — paletas prontas para começar com um clique, como os modelos do Canva (RF-19).
 * Cada paleta tem uma cor escura, uma clara e um destaque, então já nasce legível.
 */
import { Palette } from './Palette.js';

const PRESETS = Object.freeze([
  { id: 'prazo-certo', name: 'Marca Prazo Certo', hexes: ['#230023', '#F2F2F2', '#42FFFF'], description: 'Roxo profundo, cinza claro e ciano elétrico.' },
  { id: 'oceano', name: 'Oceano', hexes: ['#0B2545', '#EEF4ED', '#13A8A8'], description: 'Azul-marinho, espuma e água-marinha.' },
  { id: 'cafe', name: 'Café', hexes: ['#3E2723', '#F5EBDD', '#C47F3B'], description: 'Grão torrado, leite e caramelo.' },
  { id: 'floresta', name: 'Floresta', hexes: ['#1B3A2B', '#F1F7EE', '#7FB069'], description: 'Mata fechada, névoa e folha nova.' },
  { id: 'por-do-sol', name: 'Pôr do sol', hexes: ['#2D1E2F', '#FFF4E6', '#F26A4B'], description: 'Noite chegando, céu claro e laranja quente.' },
  { id: 'lavanda', name: 'Lavanda', hexes: ['#2E1A47', '#F6F0FF', '#9D7BD8'], description: 'Ameixa, branco lilás e lavanda.' },
  { id: 'citrico', name: 'Cítrico', hexes: ['#1F2D16', '#FFFBE6', '#F4B400'], description: 'Folha escura, creme e amarelo-limão.' },
  { id: 'noite-urbana', name: 'Noite urbana', hexes: ['#121826', '#E8ECF3', '#FF5A79'], description: 'Asfalto, neblina e neon rosa.' },
  { id: 'terracota', name: 'Terracota', hexes: ['#3B1F14', '#FAF3EE', '#D8693C'], description: 'Barro queimado, areia e telha.' },
  { id: 'azul-corporativo', name: 'Azul corporativo', hexes: ['#0A2463', '#E6EEFF', '#3E92CC'], description: 'Sóbria e confiável, boa para empresas.' },
]);

export class PresetCatalog {
  /** @returns {Array<{ id: string, name: string, description: string, palette: Palette }>} */
  list() {
    return PRESETS.map((p) => ({ ...p, palette: Palette.fromHexes(p.hexes) }));
  }

  get(id) {
    const p = this.list().find((x) => x.id === id);
    if (!p) throw new Error(`Paleta pronta "${id}" não existe.`);
    return p;
  }
}
