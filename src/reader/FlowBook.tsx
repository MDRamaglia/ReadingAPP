/**
 * Modo libro para documentos de Word: el texto se reparte en páginas del
 * tamaño de la pantalla usando columnas CSS (una por página). En pantallas
 * anchas se ven dos páginas enfrentadas, como un libro abierto.
 *
 * Las páginas se pasan en horizontal o en vertical; la paginación es la misma
 * en los dos casos, así que cambiar de dirección no mueve el texto. En
 * horizontal, la hoja puede darse vuelta como en un libro de papel
 * (curl.ts): para eso se mantiene una copia del texto que hace de hoja.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import type { MutableRef } from 'preact/hooks';
import type { Block, BookDirection, Position, Settings } from '../lib/types';
import { CurlTurns, type CurlLayout } from './curl';
import { charRect, searchChar } from './domText';
import { attachGestures, type DragInfo } from './gestures';
import { blockElements, blocksHtml, hydrateImages } from './render';
import type { ViewHandle, ViewReport } from './views';

interface Props {
  blocks: Block[];
  assetUrls: Map<string, string>;
  settings: Settings;
  /** Dirección para pasar páginas y animación de hoja (solo horizontal). */
  direction: BookDirection;
  curl: boolean;
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
  /** Navegación vertical y animación de hoja. */
  vertical = false;
  private curlOn = false;
  private turns: CurlTurns | null = null;
  /** Copia del texto que hace de hoja al darla vuelta, con sus números de página. */
  private ghost: { wrap: HTMLElement; flow: HTMLElement; folios: HTMLElement } | null = null;
  private warmTimer = 0;

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
    // El ancho de columna explícito es imprescindible en Safari/WebKit: con
    // `column-count: 1` y ancho automático no crea columnas y todo el texto
    // queda en una única «página» larga.
    Object.assign(this.flow.style, {
      width: `${total}px`,
      height: `${pageH}px`,
      columnWidth: `${pageW}px`,
      columnCount: String(perView),
      columnGap: `${gap}px`,
    });
    this.stage.style.setProperty('--page-h', `${pageH}px`);
    // En columnas angostas el justificado deja huecos: se alinea a la izquierda.
    this.flow.classList.toggle('is-narrow', pageW / em < 26);
    const end = this.flow.querySelector('.flow-end')!;
    const cols = this.colOf(end.getBoundingClientRect()) + 1;
    this.pages = Math.max(1, cols);
    this.syncGhost();
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

  /**
   * Muestra la pantalla actual. El texto completo (cientos de columnas) se
   * desplaza sin animación; la animación de «pasar página» se aplica solo a
   * la ventana visible, que es del tamaño de la página. Animar el elemento
   * gigante obliga al navegador a componer una capa enorme y puede tardar
   * segundos en un celular.
   */
  private show(turn: 'next' | 'prev' | null) {
    this.place(this.spread);
    this.view.style.transform = '';
    this.view.classList.remove(...TURN_CLASSES, 'snap');
    if (turn) {
      void this.view.offsetWidth;
      this.view.classList.add(`turn-${turn}${this.vertical ? '-v' : ''}`);
    }
  }

  /** Muestra la pantalla `i` en la vista real (sin cambiar el punto de lectura). */
  private place(i: number) {
    const g = this.geom!;
    this.flow.style.transform = `translateX(${-i * g.perView * this.pitch}px)`;
    this.onGeom(g, this.pages, i);
  }

  /** Cambia el estado a la pantalla `s` e informa la nueva posición. */
  private commit(s: number) {
    this.spread = s;
    this.pos = this.posOfCol(s * this.geom!.perView);
    this.emit();
  }

  private emit() {
    this.report({ pos: this.position(), page: this.spread * this.geom!.perView, pages: this.pages, perView: this.geom!.perView });
  }

  position(): Position {
    return { ...this.pos };
  }

  goTo(pos: Position) {
    this.turns?.settle();
    this.pos = { ...pos };
    const col = this.pageOf(pos);
    this.spread = Math.floor(col / this.geom!.perView);
    this.show(null);
    this.emit();
  }

  goToPage(page: number) {
    this.turns?.settle();
    const col = Math.max(0, Math.min(this.pages - 1, page));
    this.spread = Math.floor(col / this.geom!.perView);
    this.pos = this.posOfCol(this.spread * this.geom!.perView);
    this.show(null);
    this.emit();
  }

  next() {
    this.turn(1);
  }

  prev() {
    this.turn(-1);
  }

  private turn(step: 1 | -1) {
    const t = this.turns;
    // Se suelta la hoja que se venía arrastrando en esta dirección: se completa.
    if (t && t.dragging === (step > 0 ? 'next' : 'prev')) {
      this.commit(this.spread + step);
      t.dragEnd(true);
      return;
    }
    t?.settle();
    const from = this.spread;
    const to = from + step;
    if (to < 0 || to >= this.spreads) {
      this.edge(step > 0 ? 'end' : 'start');
      this.snapBack();
      return;
    }
    this.commit(to);
    if (this.curlOn) this.curlTurns().turn(from, to);
    else this.show(step > 0 ? 'next' : 'prev');
  }

  /** La página acompaña al dedo mientras se desliza; con animación de hoja, la hoja se dobla. */
  drag(d: number, info: DragInfo) {
    if (!this.vertical && this.curlOn) {
      const t = this.curlTurns();
      if (!t.dragging) {
        const to = this.spread + (d < 0 ? 1 : -1);
        if (to >= 0 && to < this.spreads) {
          const r = this.stage.getBoundingClientRect();
          t.dragStart(this.spread, to, info.y0 - r.top < r.height * 0.35 ? 'top' : 'bottom');
        }
      }
      if (t.dragging) {
        t.dragMove(d);
        return;
      }
    }
    this.view.classList.remove(...TURN_CLASSES, 'snap');
    this.view.style.transform = this.vertical ? `translateY(${d * 0.6}px)` : `translateX(${d * 0.6}px)`;
  }

  dragCancel() {
    if (this.turns?.dragging) this.turns.dragEnd(false);
    else this.snapBack();
  }

  snapBack() {
    this.view.classList.add('snap');
    this.view.style.transform = '';
  }

  relayout(settings: Settings) {
    this.turns?.settle();
    const keep = this.pos;
    this.layout(settings);
    this.goTo(keep);
  }

  /** Dirección y animación elegidas; no cambian la paginación ni el lugar. */
  setNav(direction: BookDirection, curl: boolean) {
    this.vertical = direction === 'vertical';
    const on = curl && !this.vertical;
    if (on === this.curlOn) return;
    this.curlOn = on;
    clearTimeout(this.warmTimer);
    this.turns?.settle();
    if (on) {
      this.warm();
    } else {
      this.turns?.destroy();
      this.turns = null;
      this.ghost = null;
    }
  }

  /**
   * Prepara de antemano la copia del texto que hace de hoja (y su diagramado),
   * para que la primera vuelta no se trabe. Espera a que haya páginas.
   */
  warm() {
    clearTimeout(this.warmTimer);
    this.warmTimer = window.setTimeout(() => {
      if (!this.curlOn) return;
      if (!this.geom) return this.warm();
      this.buildFront(this.spread, this.curlTurns().curl.content);
    }, 300);
  }

  private curlTurns(): CurlTurns {
    if (!this.turns) {
      this.turns = new CurlTurns(this.stage, {
        showBase: (i) => this.place(i ?? this.spread),
        buildFront: (i, into) => this.buildFront(i, into),
        layout: () => this.curlLayout(),
      });
    }
    return this.turns;
  }

  private ensureGhost() {
    const into = this.curlTurns().curl.content;
    if (!this.ghost) {
      const wrap = document.createElement('div');
      wrap.className = 'curl-view';
      const flow = this.flow.cloneNode(true) as HTMLElement;
      // Sin índices de bloque: la copia no debe confundirse con el texto real.
      flow.querySelectorAll('[data-b]').forEach((el) => el.removeAttribute('data-b'));
      wrap.append(flow);
      const folios = document.createElement('div');
      this.ghost = { wrap, flow, folios };
      this.syncGhost();
    }
    if (this.ghost.wrap.parentElement !== into) into.replaceChildren(this.ghost.wrap, this.ghost.folios);
    return this.ghost;
  }

  /** La copia repite exactamente la tipografía y la paginación del texto real. */
  private syncGhost() {
    const g = this.ghost;
    if (!g) return;
    g.flow.style.cssText = this.flow.style.cssText;
    g.flow.className = this.flow.className;
    const v = this.view.style;
    Object.assign(g.wrap.style, { left: v.left, top: v.top, width: v.width, height: v.height });
  }

  /** Arma en el frente la pantalla `i`: su texto, sus números de página y el lomo. */
  private buildFront(i: number, _into: HTMLElement) {
    const ghost = this.ensureGhost();
    const g = this.geom!;
    ghost.flow.style.transform = `translateX(${-i * g.perView * this.pitch}px)`;
    const items: HTMLElement[] = [];
    for (let k = 0; k < g.perView; k++) {
      const n = i * g.perView + k;
      if (n >= this.pages) continue;
      const f = document.createElement('div');
      f.className = 'folio';
      f.style.left = `${g.left + k * (g.pageW + g.gap) + g.pageW / 2}px`;
      f.textContent = String(n + 1);
      items.push(f);
    }
    if (g.perView === 2) {
      const spine = document.createElement('div');
      spine.className = 'spine';
      spine.style.left = `${g.left + g.pageW + g.gap / 2}px`;
      items.push(spine);
    }
    ghost.folios.replaceChildren(...items);
  }

  /** La pantalla entera es la hoja; con dos páginas, gira la derecha sobre el lomo. */
  private curlLayout(): CurlLayout {
    const W = this.stage.clientWidth;
    const H = this.stage.clientHeight;
    const g = this.geom!;
    if (g.perView === 2) {
      const spine = Math.round(g.left + g.pageW + g.gap / 2);
      return { sheet: { x: spine, y: 0, w: W - spine, h: H }, left: { x: 0, y: 0, w: spine, h: H } };
    }
    return { sheet: { x: 0, y: 0, w: W, h: H } };
  }

  destroy() {
    clearTimeout(this.warmTimer);
    clearTimeout(this.timer);
    this.turns?.destroy();
    this.turns = null;
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

const TURN_CLASSES = ['turn-next', 'turn-prev', 'turn-next-v', 'turn-prev-v'];

export function FlowBook({ blocks, assetUrls, settings, direction, curl, initial, handle, onReport, onEdge, onToggleChrome }: Props) {
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
    e.setNav(direction, curl);
    engine.current = e;
    handle.current = e;
    (window as unknown as { __flow?: FlowEngine }).__flow = e;
    e.mount(assetUrls);
    let alive = true;
    void document.fonts.ready.then(() => {
      if (!alive) return;
      e.layout(settings);
      e.goTo(initial);
    });
    const detach = attachGestures(stage.current!, {
      // Costados en horizontal; arriba y abajo en vertical. El centro muestra u oculta los controles.
      tap: (x, y) => {
        const r = stage.current!.getBoundingClientRect();
        const rel = e.vertical ? (y - r.top) / r.height : (x - r.left) / r.width;
        if (rel < 0.3) e.prev();
        else if (rel > 0.7) e.next();
        else cb.current.onToggleChrome();
      },
      swipe: (dir) => {
        if (dir === (e.vertical ? 'up' : 'left')) e.next();
        else if (dir === (e.vertical ? 'down' : 'right')) e.prev();
      },
      drag: (d, info) => e.drag(d, info),
      dragCancel: () => e.dragCancel(),
      axis: () => (e.vertical ? 'y' : 'x'),
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
      e.destroy();
      stage.current?.removeEventListener('wheel', onWheel);
      if (handle.current === e) handle.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  useEffect(() => {
    engine.current?.setNav(direction, curl);
  }, [direction, curl]);

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
