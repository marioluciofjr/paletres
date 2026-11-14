/**
 * FileDownloader — faz o navegador baixar um arquivo gerado na página (texto ou Blob).
 * Truque padrão: cria um link temporário com "download" e clica nele.
 */
export class FileDownloader {
  #doc;
  #urlApi;

  constructor(doc = document, urlApi = URL) {
    this.#doc = doc;
    this.#urlApi = urlApi;
  }

  download(content, fileName, mimeType = 'text/plain') {
    const blob = content instanceof Blob ? content : new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = this.#urlApi.createObjectURL(blob);
    const a = this.#doc.createElement('a');
    a.href = url;
    a.download = fileName;
    a.hidden = true;
    this.#doc.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => this.#urlApi.revokeObjectURL(url), 1000);
  }
}
