/** Lista padrão de exportadores de texto. Um formato novo entra aqui. */
import { CssVarsExporter } from './CssVarsExporter.js';
import { JsonExporter } from './JsonExporter.js';

export function createExporters() {
  return [new CssVarsExporter(), new JsonExporter()];
}
