/**
 * Dom — atalhos para criar elementos HTML com segurança.
 *
 * Usamos textContent (nunca innerHTML com dados): assim um HEX digitado nunca vira código.
 * Exemplo: Dom.el('button', { class: 'btn', text: 'Copiar', on: { click: fn } })
 */
export class Dom {
  /**
   * @param {string} tag
   * @param {object} [attrs] class, text, style (objeto), dataset (objeto), on (eventos), demais atributos
   * @param {Array<Node|string|null|false>} [children]
   */
  static el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined || value === null || value === false) continue;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key === 'style') Object.assign(node.style, value);
      else if (key === 'dataset') Object.assign(node.dataset, value);
      else if (key === 'on') for (const [ev, fn] of Object.entries(value)) node.addEventListener(ev, fn);
      else if (key === 'props') Object.assign(node, value);
      else node.setAttribute(key, value === true ? '' : String(value));
    }
    Dom.append(node, children);
    return node;
  }

  static append(node, children) {
    for (const child of [].concat(children)) {
      if (child === null || child === undefined || child === false) continue;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return node;
  }

  /** Esvazia o nó e coloca os novos filhos. */
  static replace(node, children) {
    node.replaceChildren();
    return Dom.append(node, children);
  }

  /** Cria um id único (para ligar rótulos e campos). */
  static uid(prefix = 'p3') {
    Dom.#counter += 1;
    return `${prefix}-${Dom.#counter}`;
  }

  static #counter = 0;
}
