/**
 * Icons — ícones em linha no estilo Prazo Certo: grade de 24px, traço de 1,75px,
 * pontas arredondadas e sem preenchimento. Usam currentColor, então herdam a cor do texto.
 * Todos são decorativos (aria-hidden): o significado sempre vem do texto ao lado.
 */
const PATHS = Object.freeze({
  check: 'M5 12.5l4.5 4.5L19 7.5',
  'check-double': 'M2.5 12.5l4.5 4.5L16.5 7.5M9.5 15.5l1.5 1.5L21 7.5',
  alert: 'M12 4l9 16H3L12 4zM12 10v4M12 17.2v.1',
  x: 'M6 6l12 12M18 6L6 18',
  copy: 'M9 9h10v11H9zM5 15V4h10',
  undo: 'M9 7L4 12l5 5M4 12h11a5 5 0 0 1 0 10h-2',
  redo: 'M15 7l5 5-5 5M20 12H9a5 5 0 0 0 0 10h2',
  shuffle: 'M3 7h4l10 10h4M17 21l4-4-4-4M3 17h4l3-3M14 10l3-3h4M17 3l4 4-4 4',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  sun: 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  menu: 'M4 7h16M4 12h16M4 17h16',
  upload: 'M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',
  download: 'M12 4v12M7 11l5 5 5-5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  edit: 'M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4',
  wand: 'M4 20L15 9M13 7l4 4M18 3v3M16.5 4.5h3M20 9v2M19 10h2M10 3v2M9 4h2',
  sparkle: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z',
  star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3z',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15 9.5a1.5 1.5 0 1 0 0 .1',
});

export class Icons {
  /** Cria o SVG de um ícone. */
  static svg(name, className = 'icon') {
    const d = PATHS[name];
    if (!d) throw new Error(`Ícone "${name}" não existe.`);
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', className);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.75');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.append(path);
    return svg;
  }

  /** Troca todo <span data-icon="nome"> da página pelo SVG correspondente. */
  static hydrate(root) {
    for (const slot of root.querySelectorAll('[data-icon]')) {
      slot.replaceWith(Icons.svg(slot.dataset.icon));
    }
  }
}
