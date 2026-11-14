/**
 * main.js — "composition root" do Paletrês.
 *
 * É o único lugar que conhece todas as peças. Aqui criamos os serviços do navegador,
 * o estado (PaletteStore) e cada componente, entregando a cada um só o que ele precisa
 * (injeção de dependência). Nenhuma outra classe faz "new" de serviços globais.
 */
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

import { EventBus } from './app/EventBus.js';
import { PaletteStore, StoreEvent } from './app/PaletteStore.js';
import { createExporters } from './domain/export/defaultExporters.js';
import { UrlStateCodec } from './infra/UrlStateCodec.js';
import { ClipboardService } from './infra/ClipboardService.js';
import { PreferenceStorage } from './infra/PreferenceStorage.js';
import { CanvasPngRenderer } from './infra/CanvasPngRenderer.js';
import { FileDownloader } from './infra/FileDownloader.js';
import { Icons } from './ui/Icons.js';
import { Toast } from './ui/Toast.js';
import { InfoTips } from './ui/InfoTips.js';
import { ThemeToggle } from './ui/ThemeToggle.js';
import { ParallaxHeader } from './ui/ParallaxHeader.js';
import { HeroArt } from './ui/HeroArt.js';
import { PresetBar } from './ui/PresetBar.js';
import { HistoryToolbar } from './ui/HistoryToolbar.js';
import { ColorSlots } from './ui/ColorSlots.js';
import { HsbSliderPanel } from './ui/HsbSliderPanel.js';
import { ComparisonGrid } from './ui/ComparisonGrid.js';
import { HarmonyPanel } from './ui/HarmonyPanel.js';
import { UsageMockupPanel } from './ui/UsageMockupPanel.js';
import { ColorGradingPanel } from './ui/ColorGradingPanel.js';
import { TintShadeTable } from './ui/TintShadeTable.js';
import { ColorBlindPreview } from './ui/ColorBlindPreview.js';
import { ExportPanel } from './ui/ExportPanel.js';

class PaletresApp {
  #doc;
  #win;

  constructor(doc, win) {
    this.#doc = doc;
    this.#win = win;
  }

  /** Atalho: o elemento [data-component="nome"] da página. */
  #slot(name) {
    return this.#doc.querySelector(`[data-component="${name}"]`);
  }

  start() {
    const bus = new EventBus();
    const codec = new UrlStateCodec(this.#win);
    // Se a URL trouxer uma paleta (link compartilhado), começamos por ela.
    const store = PaletteStore.create({ bus, initialPalette: codec.read() ?? undefined });
    const clipboard = new ClipboardService(this.#win.navigator, this.#doc);
    const storage = new PreferenceStorage(this.#win.localStorage);
    const downloader = new FileDownloader(this.#doc);
    const toast = new Toast({ root: this.#slot('toast') });

    // Toda mudança de paleta vai para a URL: o link está sempre pronto para compartilhar.
    bus.on(StoreEvent.PALETTE, ({ palette }) => codec.write(palette));
    // Link colado com outra paleta na mesma aba (o hash mudou): aplicamos.
    this.#win.addEventListener('hashchange', () => {
      const p = codec.read();
      if (p) store.setPalette(p);
    });

    const components = [
      new ThemeToggle({ button: this.#slot('theme-toggle'), storage }),
      new ParallaxHeader({ header: this.#slot('header'), win: this.#win }),
      new HeroArt({ root: this.#slot('hero-art'), store, bus }),
      new PresetBar({ root: this.#slot('presets'), store }),
      new HistoryToolbar({ root: this.#slot('history'), store, bus, doc: this.#doc }),
      new ColorSlots({ root: this.#slot('slots'), store, bus, clipboard, toast }),
      new HsbSliderPanel({ root: this.#slot('hsb'), store, bus }),
      new ComparisonGrid({ root: this.#slot('comparisons'), store, bus }),
      new HarmonyPanel({ root: this.#slot('harmony'), store, bus }),
      new UsageMockupPanel({ root: this.#slot('mockups'), store, bus }),
      new ColorGradingPanel({ root: this.#slot('grading'), store, bus, toast, downloader, win: this.#win }),
      new TintShadeTable({ root: this.#slot('tints'), store, bus, clipboard, toast }),
      new ColorBlindPreview({ root: this.#slot('vision'), store, bus }),
      new ExportPanel({
        root: this.#slot('export'), store, bus, exporters: createExporters(), codec, clipboard, toast,
        png: new CanvasPngRenderer(this.#doc), downloader,
      }),
    ];
    for (const c of components) c.mount();

    Icons.hydrate(this.#doc);
    new InfoTips({ root: this.#doc }).mount();
    codec.write(store.state.palette);
  }
}

try {
  new PaletresApp(document, window).start();
} catch (err) {
  console.error('[Paletrês] Falha ao iniciar:', err);
  const main = document.getElementById('conteudo');
  main?.prepend(Object.assign(document.createElement('p'), {
    className: 'callout',
    role: 'alert',
    textContent: 'Algo deu errado ao carregar o Paletrês. Atualize a página. Se o erro continuar, abra o console (F12) para ver os detalhes.',
  }));
}
