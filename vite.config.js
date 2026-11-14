// Configuração do Vite (servidor de desenvolvimento e empacotador).
// "base: './'" gera caminhos relativos, o que permite publicar no GitHub Pages
// em qualquer subpasta (ex.: usuario.github.io/paletres/) sem quebrar os links.
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  test: {
    // Os testes e2e rodam no Playwright, não no Vitest.
    include: ['tests/{unit,integration,contract,regression}/**/*.test.js'],
    environment: 'node',
  },
});
