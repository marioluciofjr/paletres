/**
 * ClipboardService — copia texto para a área de transferência (o "Ctrl+C").
 *
 * 1º tenta a API moderna (navigator.clipboard), que exige HTTPS ou localhost.
 * 2º se não der, usa o truque antigo: um campo de texto invisível + execCommand('copy').
 * Devolve true/false para a interface avisar a pessoa.
 */
export class ClipboardService {
  #nav;
  #doc;

  constructor(nav, doc) {
    this.#nav = nav;
    this.#doc = doc;
  }

  async copy(text) {
    try {
      if (this.#nav?.clipboard?.writeText) {
        await this.#nav.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Segue para o plano B.
    }
    return this.#fallback(text);
  }

  #fallback(text) {
    if (!this.#doc?.body || typeof this.#doc.execCommand !== 'function') return false;
    const area = this.#doc.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    this.#doc.body.appendChild(area);
    area.select();
    let ok;
    try {
      ok = this.#doc.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}
