/**
 * Modo libro para PDF: muestra las páginas originales (con su aspecto y su
 * numeración), una por pantalla en el celular y dos enfrentadas en pantallas
 * anchas. Las páginas se pasan en horizontal o en vertical; en horizontal, la
 * hoja puede darse vuelta como en un libro de papel (curl.ts).
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import type { MutableRef } from 'preact/hooks';
import type { PDFDocumentProxy } from '../lib/pdfjs';
import type { BookDirection, PageInfo, Position } from '../lib/types';
import { CurlTurns, type CurlLayout } from './curl';
import { spreadFor } from './FlowBook';
import { attachGestures } from './gestures';
import type { ViewHandle, ViewReport } from './views';

interface Props {
  pdf: PDFDocumentProxy;
  pages: PageInfo[];
  initialPage: number;
  /** Dirección para pasar páginas y animación de hoja (solo horizontal). */
  direction: BookDirection;
  curl: boolean;
  /** Duración de una vuelta de hoja completa (según la velocidad elegida). */
  curlMs: number;
  handle: MutableRef<ViewHandle | null>;
  onReport: (r: ViewReport) => void;
  onEdge: (edge: 'start' | 'end') => void;
  onToggleChrome: () => void;
}

/** Caché de páginas dibujadas, compartida con la vista de página original. */
export class PageCanvasCache {
  private map = new Map<string, Promise<HTMLCanvasElement>>();
  private order: string[] = [];
  constructor(
    private pdf: PDFDocumentProxy,
    private limit = 10,
  ) {}

  get(page: number, cssW: number, cssH: number): Promise<HTMLCanvasElement> {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    let scalePx = dpr;
    // Tope de ~7 megapíxeles por página para no agotar la memoria del celular.
    const px = cssW * cssH * dpr * dpr;
    if (px > 7e6) scalePx = Math.sqrt(7e6 / (cssW * cssH));
    const key = `${page}@${Math.round(cssW)}x${Math.round(cssH)}@${scalePx.toFixed(2)}`;
    const hit = this.map.get(key);
    if (hit) {
      this.order = [...this.order.filter((k) => k !== key), key];
      return hit;
    }
    const p = (async () => {
      const pg = await this.pdf.getPage(page + 1);
      const base = pg.getViewport({ scale: 1 });
      const viewport = pg.getViewport({ scale: (cssW / base.width) * scalePx });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      await pg.render({ canvas, viewport, background: '#ffffff' }).promise;
      canvas.dataset.page = String(page);
      return canvas;
    })();
    this.map.set(key, p);
    this.order.push(key);
    while (this.order.length > this.limit) {
      const old = this.order.shift()!;
      const c = this.map.get(old);
      this.map.delete(old);
      void c?.then((cv) => {
        if (!cv.isConnected) cv.width = cv.height = 0;
      });
    }
    return p;
  }
}

interface Slot {
  page: number;
  w: number;
  h: number;
}

type Size = { w: number; h: number };

/** Tamaño de cada página de la pantalla que empieza en `first`, para que entre completa. */
function slotsFor(pages: PageInfo[], size: Size, perView: 1 | 2, first: number): Slot[] {
  const slots: Slot[] = [];
  const side = size.w < 500 ? 10 : 36;
  const top = size.h < 500 ? 8 : 24;
  const bottom = size.h < 500 ? 26 : 40;
  const availW = (size.w - 2 * side) / perView;
  const availH = size.h - top - bottom;
  for (let i = 0; i < perView; i++) {
    const p = first + i;
    const info = pages[p];
    if (!info) continue;
    const s = Math.min(availW / info.w, availH / info.h);
    slots.push({ page: p, w: Math.floor(info.w * s), h: Math.floor(info.h * s) });
  }
  return slots;
}

type Turn = 'none' | 'next' | 'prev' | 'next-v' | 'prev-v';

export function PdfBook({ pdf, pages, initialPage, direction, curl, curlMs, handle, onReport, onEdge, onToggleChrome }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const cache = useRef(new PageCanvasCache(pdf));
  const [size, setSize] = useState<Size | null>(null);
  const [page, setPage] = useState(Math.max(0, Math.min(pages.length - 1, initialPage)));
  // Pantalla que se ve mientras la hoja da vuelta (null: la del punto de lectura).
  const [shownOverride, setShown] = useState<number | null>(null);
  const [dir, setDir] = useState<Turn>('none');
  const [drag, setDrag] = useState(0);
  const vertical = direction === 'vertical';
  const nav = useRef({ vertical, curl });
  nav.current = { vertical, curl: curl && !vertical };
  const state = useRef({ page, perView: 1 as 1 | 2, size: null as Size | null });
  const turns = useRef<CurlTurns | null>(null);
  const cb = useRef({ onReport, onEdge, onToggleChrome });
  cb.current = { onReport, onEdge, onToggleChrome };

  const perView = size ? spreadFor(size.w, size.h) : 1;
  const align = (p: number) => (perView === 2 ? p - (p % 2) : p);
  const first = align(page);
  const shown = shownOverride === null ? first : align(shownOverride);
  state.current = { page: first, perView, size };
  const slots = size ? slotsFor(pages, size, perView, shown) : [];

  useEffect(() => {
    const el = stage.current!;
    const curlTurns = new CurlTurns(el, {
      showBase: (i) => setShown(i),
      // La pantalla que queda como hoja: sus lienzos se toman de la vista si
      // ya están dibujados (se mueven, no se copian); si no, de la caché.
      buildFront: (firstPage, into) => {
        const { size: sz, perView: pv } = state.current;
        if (!sz) return;
        const spread = document.createElement('div');
        spread.className = 'pdf-spread';
        const waits: Array<Promise<void>> = [];
        for (const s of slotsFor(pages, sz, pv, firstPage)) {
          const pg = document.createElement('div');
          pg.className = 'pdf-page is-ready';
          pg.dataset.frontSlot = String(s.page);
          Object.assign(pg.style, { width: `${s.w}px`, height: `${s.h}px` });
          const folio = document.createElement('div');
          folio.className = 'pdf-folio';
          folio.textContent = pages[s.page]!.label;
          pg.append(folio);
          const now = el.querySelector<HTMLCanvasElement>(`[data-slot="${s.page}"] canvas, [data-front-slot="${s.page}"] canvas`);
          if (now && (now.parentElement as HTMLElement).style.width === `${s.w}px`) pg.prepend(now);
          else waits.push(cache.current.get(s.page, s.w, s.h).then((c) => void pg.prepend(c)));
          spread.append(pg);
        }
        into.replaceChildren(spread);
        return waits.length ? Promise.all(waits).then(() => undefined) : undefined;
      },
      layout: (): CurlLayout => {
        const sr = el.getBoundingClientRect();
        const rects = Array.from(curlTurns.curl.content.querySelectorAll<HTMLElement>('.pdf-page')).map((p) => {
          const r = p.getBoundingClientRect();
          return { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height };
        });
        return rects.length === 2 ? { sheet: rects[1]!, left: rects[0]! } : { sheet: rects[0] ?? { x: 0, y: 0, w: sr.width, h: sr.height } };
      },
      baseReady: () => !!el.querySelector(`:scope > .pdf-spread [data-slot="${state.current.page}"].is-ready`),
      releaseFront: (into) => into.replaceChildren(),
    });
    turns.current = curlTurns;
    curlTurns.speed = curlMs;
    // Acceso para pruebas automatizadas.
    (window as unknown as { __pdfTurns?: CurlTurns }).__pdfTurns = curlTurns;

    const go = (target: number, d: 'next' | 'prev' | 'none') => {
      const { page: from, perView: pv } = state.current;
      const clamped = Math.max(0, Math.min(pages.length - 1, target));
      const aligned = pv === 2 ? clamped - (clamped % 2) : clamped;
      const t = curlTurns;
      // Se suelta la hoja que se venía arrastrando en esta dirección: se completa.
      if (d !== 'none' && t.dragging === d && aligned !== from) {
        setPage(aligned);
        t.dragEnd(true);
        return;
      }
      t.settle();
      setDrag(0);
      if (aligned === from) return;
      const animated = d !== 'none';
      const { vertical: v, curl: c } = nav.current;
      if (animated && c) {
        setDir('none');
        setPage(aligned);
        t.turn(from, aligned);
      } else {
        setDir(animated ? (v ? `${d}-v` : d) : 'none');
        setPage(aligned);
      }
    };

    const api: ViewHandle = {
      next: () => {
        const { page: p, perView: pv } = state.current;
        if (p + pv >= pages.length) {
          curlTurns.settle();
          cb.current.onEdge('end');
          setDrag(0);
        } else go(p + pv, 'next');
      },
      prev: () => {
        const { page: p, perView: pv } = state.current;
        if (p === 0) {
          curlTurns.settle();
          cb.current.onEdge('start');
          setDrag(0);
        } else go(p - pv, 'prev');
      },
      goTo: (pos: Position) => go(pos.page ?? 0, 'none'),
      goToPage: (n: number) => go(n, 'none'),
      position: () => ({ b: -1, o: 0, page: state.current.page }),
      pageOf: (pos: Position) => pos.page ?? 0,
    };
    handle.current = api;
    const measure = () => {
      curlTurns.settle();
      setSize({ w: el.clientWidth, h: el.clientHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const detach = attachGestures(el, {
      // Costados en horizontal; arriba y abajo en vertical. El centro muestra u oculta los controles.
      tap: (x, y) => {
        const r = el.getBoundingClientRect();
        const rel = nav.current.vertical ? (y - r.top) / r.height : (x - r.left) / r.width;
        if (rel < 0.3) api.prev();
        else if (rel > 0.7) api.next();
        else cb.current.onToggleChrome();
      },
      swipe: (d) => {
        const v = nav.current.vertical;
        if (d === (v ? 'up' : 'left')) api.next();
        else if (d === (v ? 'down' : 'right')) api.prev();
      },
      drag: (d, info) => {
        if (nav.current.curl) {
          if (!curlTurns.dragging) {
            const { page: p, perView: pv } = state.current;
            const to = d < 0 ? p + pv : p - pv;
            if (to >= 0 && to < pages.length) {
              const r = el.getBoundingClientRect();
              curlTurns.dragStart(p, to, info.y0 - r.top < r.height * 0.35 ? 'top' : 'bottom');
            }
          }
          if (curlTurns.dragging) {
            curlTurns.dragMove(d);
            return;
          }
        }
        setDrag(d);
      },
      dragCancel: () => {
        if (curlTurns.dragging) curlTurns.dragEnd(false);
        setDrag(0);
      },
      axis: () => (nav.current.vertical ? 'y' : 'x'),
    });
    let wheelT = 0;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const now = performance.now();
      if (now - wheelT < 350 || Math.abs(ev.deltaY) + Math.abs(ev.deltaX) < 8) return;
      wheelT = now;
      if (ev.deltaY + ev.deltaX > 0) api.next();
      else api.prev();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      ro.disconnect();
      detach();
      curlTurns.destroy();
      turns.current = null;
      el.removeEventListener('wheel', onWheel);
      if (handle.current === api) handle.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdf]);

  useEffect(() => {
    if (turns.current) turns.current.speed = curlMs;
  }, [curlMs]);

  // Al desactivar la animación o pasar a vertical, se retira cualquier hoja en curso.
  useEffect(() => {
    if (!nav.current.curl) turns.current?.settle();
  }, [curl, vertical]);

  // Punto de lectura: se informa apenas cambia, aunque la hoja todavía esté girando.
  useEffect(() => {
    if (!size) return;
    cb.current.onReport({ pos: { b: -1, o: 0, page: first }, page: first, pages: pages.length, perView });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first, perView, !!size]);

  // Al cambiar la pantalla visible: dibujar (y adelantar) páginas.
  useEffect(() => {
    if (!size) return;
    let alive = true;
    for (const s of slots) {
      void cache.current.get(s.page, s.w, s.h).then((canvas) => {
        if (!alive) return;
        const host = stage.current?.querySelector(`:scope > .pdf-spread [data-slot="${s.page}"]`);
        if (host && canvas.parentElement !== host) {
          host.querySelector('canvas')?.remove();
          host.prepend(canvas);
          host.classList.add('is-ready');
        }
      });
    }
    // Precarga de la pantalla siguiente y la anterior.
    const t = window.setTimeout(() => {
      for (const d of [perView, -perView]) {
        for (const s of slots) {
          const p = s.page + d;
          const info = pages[p];
          if (info) void cache.current.get(p, Math.floor((info.w * s.h) / pages[s.page]!.h), s.h);
        }
      }
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, perView, size?.w, size?.h]);

  const dragStyle = drag ? { transform: vertical ? `translate3d(0,${drag * 0.9}px,0)` : `translate3d(${drag * 0.9}px,0,0)` } : undefined;

  return (
    <div class="book-stage pdf-stage" ref={stage} data-testid="book-stage">
      <div class={`pdf-spread turn-${dir}${drag ? ' is-dragging' : ''}`} key={`${shown}-${perView}`} style={dragStyle}>
        {slots.map((s) => (
          <div class="pdf-page" key={s.page} data-slot={s.page} style={{ width: `${s.w}px`, height: `${s.h}px` }}>
            <div class="pdf-folio">{pages[s.page]!.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
