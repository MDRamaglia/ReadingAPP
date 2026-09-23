/**
 * Modo libro para documentos de Word: el texto se reparte en páginas del
 * tamaño de la pantalla usando columnas CSS (una por página). En pantallas
 * anchas se ven dos páginas enfrentadas, como un libro abierto.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import type { MutableRef } from 'preact/hooks';
import type { Block, Position, Settings } from '../lib/types';
import { charRect, searchChar } from './domText';
import { attachGestures } from './gestures';
import { blockElements, blocksHtml, hydrateImages } from './render';
import type { ViewHandle, ViewReport } from './views';

interface Props {
  blocks: Block[];
  assetUrls: Map<string, string>;
  settings: Settings;
  initial: Position;
  handle: MutableRef<ViewHandle | null>;
  onReport: (r: ViewReport) => void;
  onEdge: (edge: 'start' | 'end') => void;
  onToggleChrome: () => void;
}

interface Geometry {
  perView: 1 | 2;
  pageW: number;
  pageH: number;
  gap: number;
  left: number;
  top: number;
}

export function spreadFor(w: number, h: number): 1 | 2 {
  return w >= 860 && w > h * 1.15 ? 2 : 1;
}

class FlowEngine implements ViewHandle {
  private els: HTMLElement[] = [];
  private geom: Geometry | null = null;
  private pages = 1;
  private spread = 0;
  private pos: Position;
  private timer = 0;

  constructor(
    private stage: HTMLElement,
    private view: HTMLElement,
    private flow: HTMLElement,
    private blocks: Block[],
    initial: Position,
    private report: (r: ViewReport) => void,
    private edge: (e: 'start' | 'end') => void,
    private onGeom: (g: Geometry, pages: number, spread: number) => void,
  ) {
    this.pos = { ...initial };
  }

  mount(urls: Map<string, string>) {
    this.flow.innerHTML = blocksHtml(this.blocks) + '<span class="flow-end" aria-hidden="true"></span>';
    hydrateImages(this.flow, urls);
    this.els = [];
    for (const el of blockElements(this.flow)) this.els[Number(el.dataset.b)] = el;
    this.flow.addEventListener('load', () => this.schedule(), true);
  }

  private get pitch() {
    return this.geom ? this.geom.pageW + this.geom.gap : 1;
  }

  private colOf(rect: DOMRect): number {
    const origin = this.flow.getBoundingClientRect().left;
    return Math.max(0, Math.floor((rect.left + Math.min(rect.width, 2) - origin + 0.5) / this.pitch));
  }

  /** Calcula el tamaño de página según la pantalla y la tipografía elegida. */
  layout(settings: Settings) {
    const W = this.stage.clientWidth;
    const H = this.stage.clientHeight;
    const perView = spreadFor(W, H);
    const em = settings.fontSize;
    const side = W < 500 ? 22 : 40;
    const top = H < 500 ? 18 : 34;
    const bottom = H < 500 ? 30 : 46;
    const gap = perView === 2 ? 72 : 2 * side;
    const maxText = settings.width * em;
    const pageW = Math.floor(perView === 2 ? Math.min((W - 2 * side - gap) / 2, maxText) : Math.min(W - 2 * side, maxText));
    const pageH = Math.floor(H - top - bottom);
    const total = perView * pageW + (perView - 1) * gap;
    this.geom = { perView, pageW, pageH, gap, left: Math.round((W - total) / 2), top };
    Object.assign(this.view.style, {
      left: `${this.geom.left}px`,
      top: `${top}px`,
      width: `${total}px`,
      height: `${pageH}px`,
    });
    Object.assign(this.flow.style, {
      width: `${total}px`,
      height: `${pageH}px`,
      columnCount: String(perView),
      columnGap: `${gap}px`,
    });
    this.stage.style.setProperty('--page-h', `${pageH}px`);
    // En columnas angostas el justificado deja huecos: se alinea a la izquierda.
    this.flow.classList.toggle('is-narrow', pageW / em < 26);
    const end = this.flow.querySelector('.flow-end')!;
    const cols = this.colOf(end.getBoundingClientRect()) + 1;
    this.pages = Math.max(1, cols);
  }

  private get spreads() {
    return Math.ceil(this.pages / (this.geom?.perView ?? 1));
  }

  pageOf(pos: Position): number {
    const el = this.els[pos.b];
    if (!el) return 0;
    const b = this.blocks[pos.b]!;
    const rect = b.len > 0 ? charRect(el, pos.o) : el.getClientRects()[0] ?? el.getBoundingClientRect();
    return rect ? Math.min(this.pages - 1, this.colOf(rect as DOMRect)) : 0;
  }

  /** Primera posición de texto visible en la página `col`. */
  private posOfCol(col: number): Position {
    let lo = 0;
    let hi = this.blocks.length - 1;
    const endCol = (i: number) => {
      const rs = this.els[i]?.getClientRects();
      const r = rs?.[rs.length - 1];
      return r ? this.colOf(r) : -1;
    };
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (endCol(m) >= col) hi = m;
      else lo = m + 1;
    }
    const el = this.els[lo];
    const first = el?.getClientRects()[0];
    if (!el || !first || this.colOf(first) >= col || this.blocks[lo]!.len === 0) return { b: lo, o: 0 };
    const o = searchChar(el, 0, this.blocks[lo]!.len, (r) => this.colOf(r) >= col);
    return o >= this.blocks[lo]!.len ? { b: Math.min(lo + 1, this.blocks.length - 1), o: 0 } : { b: lo, o };
  }

  private show(animate: boolean) {
    const g = this.geom!;
    const x = this.spread * g.perView * this.pitch;
    this.stage.classList.toggle('no-anim', !animate);
    this.flow.style.transform = `translate3d(${-x}px, 0, 0)`;
    this.onGeom(g, this.pages, this.spread);
    if (!animate) {
      void this.stage.offsetHeight;
      requestAnimationFrame(() => this.stage.classList.remove('no-anim'));
    }
  }

  private emit() {
    this.report({ pos: this.position(), page: this.spread * this.geom!.perView, pages: this.pages, perView: this.geom!.perView });
  }

  position(): Position {
    return { ...this.pos };
  }

  goTo(pos: Position, animate = false) {
    this.pos = { ...pos };
    const col = this.pageOf(pos);
    this.spread = Math.floor(col / this.geom!.perView);
    this.show(animate);
    this.emit();
  }

  goToPage(page: number) {
    const col = Math.max(0, Math.min(this.pages - 1, page));
    this.spread = Math.floor(col / this.geom!.perView);
    this.pos = this.posOfCol(this.spread * this.geom!.perView);
    this.show(true);
    this.emit();
  }

  next() {
    if (this.spread + 1 >= this.spreads) {
      this.edge('end');
      this.show(true);
      return;
    }
    this.spread++;
    this.pos = this.posOfCol(this.spread * this.geom!.perView);
    this.show(true);
    this.emit();
  }

  prev() {
    if (this.spread === 0) {
      this.edge('start');
      this.show(true);
      return;
    }
    this.spread--;
    this.pos = this.posOfCol(this.spread * this.geom!.perView);
    this.show(true);
    this.emit();
  }

  drag(dx: number) {
    const g = this.geom!;
    const x = this.spread * g.perView * this.pitch;
    this.stage.classList.add('no-anim');
    this.flow.style.transform = `translate3d(${-x + dx * 0.9}px, 0, 0)`;
  }

  relayout(settings: Settings) {
    const keep = this.pos;
    this.layout(settings);
    this.goTo(keep, false);
  }

  schedule(settings?: Settings) {
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.relayout(settings ?? this.lastSettings!), 120);
  }

  lastSettings: Settings | null = null;

  pageCount() {
    return this.pages;
  }
}

export function FlowBook({ blocks, assetUrls, settings, initial, handle, onReport, onEdge, onToggleChrome }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const flow = useRef<HTMLDivElement>(null);
  const engine = useRef<FlowEngine | null>(null);
  const cb = useRef({ onReport, onEdge, onToggleChrome });
  cb.current = { onReport, onEdge, onToggleChrome };
  const [folio, setFolio] = useState<{ g: Geometry; pages: number; spread: number } | null>(null);

  useEffect(() => {
    const e = new FlowEngine(
      stage.current!,
      view.current!,
      flow.current!,
      blocks,
      initial,
      (r) => cb.current.onReport(r),
      (x) => cb.current.onEdge(x),
      (g, pages, spread) => setFolio({ g, pages, spread }),
    );
    e.lastSettings = settings;
    engine.current = e;
    handle.current = e;
    (window as unknown as { __flow?: FlowEngine }).__flow = e;
    e.mount(assetUrls);
    let alive = true;
    void document.fonts.ready.then(() => {
      if (!alive) return;
      e.layout(settings);
      e.goTo(initial, false);
    });
    const detach = attachGestures(stage.current!, {
      tap: (x) => {
        const r = stage.current!.getBoundingClientRect();
        const rel = (x - r.left) / r.width;
        if (rel < 0.3) e.prev();
        else if (rel > 0.7) e.next();
        else cb.current.onToggleChrome();
      },
      swipe: (dir) => {
        if (dir === 'left') e.next();
        else if (dir === 'right') e.prev();
      },
      drag: (dx) => e.drag(dx),
      dragCancel: () => e.goTo(e.position(), true),
    });
    let wheelT = 0;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const now = performance.now();
      if (now - wheelT < 350 || Math.abs(ev.deltaY) + Math.abs(ev.deltaX) < 8) return;
      wheelT = now;
      if (ev.deltaY + ev.deltaX > 0) e.next();
      else e.prev();
    };
    stage.current!.addEventListener('wheel', onWheel, { passive: false });
    const ro = new ResizeObserver(() => e.schedule());
    ro.observe(stage.current!);
    return () => {
      alive = false;
      detach();
      ro.disconnect();
      stage.current?.removeEventListener('wheel', onWheel);
      if (handle.current === e) handle.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  useEffect(() => {
    const e = engine.current;
    if (!e) return;
    e.lastSettings = settings;
    let alive = true;
    const family = settings.font === 'atkinson' ? '"Atkinson Hyperlegible"' : '"Literata Variable"';
    void document.fonts.load(`${settings.fontSize}px ${family}`).then(() => {
      if (alive) e.relayout(settings);
    });
    return () => {
      alive = false;
    };
  }, [settings.fontSize, settings.width, settings.lineHeight, settings.font]);

  const folios: Array<{ n: number; x: number }> = [];
  if (folio) {
    const { g, pages, spread } = folio;
    for (let i = 0; i < g.perView; i++) {
      const n = spread * g.perView + i;
      if (n < pages) folios.push({ n: n + 1, x: g.left + i * (g.pageW + g.gap) + g.pageW / 2 });
    }
  }

  return (
    <div class="book-stage flow-stage" ref={stage} data-testid="book-stage">
      {folio?.g.perView === 2 && <div class="spine" style={{ left: `${folio.g.left + folio.g.pageW + folio.g.gap / 2}px` }} />}
      <div class="flow-view" ref={view}>
        <div class="flow reading-text" ref={flow} />
      </div>
      {folios.map((f) => (
        <div class="folio" key={f.n} style={{ left: `${f.x}px` }}>
          {f.n}
        </div>
      ))}
    </div>
  );
}
