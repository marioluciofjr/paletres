/**
 * PresetCatalog — paletas prontas para começar com um clique, como os modelos do Canva (RF-19).
 *
 * As 15 paletas vêm do Color Hunt (https://colorhunt.co), um acervo de paletas feitas
 * por designers. Lá cada paleta tem 4 cores; aqui escolhemos as 3 que dão o melhor
 * contraste: uma escura (A), uma clara (B) e um destaque (C).
 * O campo "source" guarda o link da paleta original, para dar o crédito.
 */
import { Palette } from './Palette.js';

const HUNT = 'https://colorhunt.co/palette/';

const PRESETS = Object.freeze([
  { id: 'vinho-rose', name: 'Vinho e rosé', hexes: ['#7C0E44', '#F2DACE', '#D49A9A'], slug: '7c0e44aa5e7ad49a9af2dace', description: 'Vinho, rosé claro e rosa antigo.' },
  { id: 'mar-profundo', name: 'Mar profundo', hexes: ['#1B365D', '#A0E0EF', '#005A9C'], slug: '1b365d005a9c60c1e5a0e0ef', description: 'Azul-marinho, água clara e azul-oceano.' },
  { id: 'menta', name: 'Menta', hexes: ['#202734', '#E0F8C7', '#B7D894'], slug: '20273436415ab7d894e0f8c7', description: 'Grafite, menta clara e verde-folha.' },
  { id: 'campo-dourado', name: 'Campo dourado', hexes: ['#15370D', '#FFF2B4', '#E5CD82'], slug: '15370d728e6de5cd82fff2b4', description: 'Verde-mata, creme e trigo.' },
  { id: 'musgo-areia', name: 'Musgo e areia', hexes: ['#1E3B2F', '#F5F0E6', '#C8B48A'], slug: '1e3b2f7f8c6ac8b48af5f0e6', description: 'Musgo escuro, linho e areia.' },
  { id: 'ameixa', name: 'Ameixa', hexes: ['#290044', '#EEE3B0', '#8A2A78'], slug: '2900445000718a2a78eee3b0', description: 'Ameixa, baunilha e magenta queimado.' },
  { id: 'cereja-sol', name: 'Cereja e sol', hexes: ['#930031', '#FFF2A7', '#FFA500'], slug: 'bedefffff2a7ffa500930031', description: 'Cereja, amarelo-claro e laranja.' },
  { id: 'petroleo', name: 'Petróleo', hexes: ['#071B2B', '#EEEEEE', '#167D8D'], slug: '071b2b167d8db9e4e8eeeeee', description: 'Azul-noite, cinza-claro e azul-petróleo.' },
  { id: 'cafe-floresta', name: 'Café na floresta', hexes: ['#09251C', '#F8EADC', '#A55704'], slug: '09251ca55704f3d2aff8eadc', description: 'Verde-noite, leite e caramelo.' },
  { id: 'azul-eletrico', name: 'Azul elétrico', hexes: ['#1F06AC', '#E3EF4F', '#5882E8'], slug: '1f06ac0f42c05882e8e3ef4f', description: 'Anil, amarelo-limão e azul-céu.' },
  { id: 'uva-agua', name: 'Uva e água', hexes: ['#542177', '#98E8DE', '#8E1EA2'], slug: '5421778e1ea2d552a398e8de', description: 'Uva, verde-água e violeta.' },
  { id: 'vulcao', name: 'Vulcão', hexes: ['#421454', '#FFD749', '#FF5B42'], slug: '421454802c62ff5b42ffd749', description: 'Roxo-noite, amarelo-ouro e coral.' },
  { id: 'lavanda-noturna', name: 'Lavanda noturna', hexes: ['#00105B', '#FCF9EC', '#C9B5E0'], slug: '00105b6061b6c9b5e0fcf9ec', description: 'Azul-noite, marfim e lavanda.' },
  { id: 'pessego-marinho', name: 'Pêssego e marinho', hexes: ['#194350', '#FFC2B4', '#FF8882'], slug: '194350ff8882ffc2b49dbeb8', description: 'Azul-profundo, pêssego e salmão.' },
  { id: 'oliva', name: 'Oliva', hexes: ['#28301C', '#D2CF9A', '#9A7E3B'], slug: '28301c323d259a7e3bd2cf9a', description: 'Oliva escuro, palha e bronze.' },
]);

export class PresetCatalog {
  /** @returns {Array<{ id: string, name: string, description: string, source: string, palette: Palette }>} */
  list() {
    return PRESETS.map(({ slug, ...p }) => ({ ...p, source: `${HUNT}${slug}`, palette: Palette.fromHexes(p.hexes) }));
  }

  get(id) {
    const p = this.list().find((x) => x.id === id);
    if (!p) throw new Error(`Paleta pronta "${id}" não existe.`);
    return p;
  }
}
