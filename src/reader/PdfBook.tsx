/**
 * Modo libro para PDF: muestra las páginas originales (con su aspecto y su
 * numeración), una por pantalla en el celular y dos enfrentadas en pantallas
 * anchas.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import type { MutableRef } from 'preact/hooks';
import type { PDFDocumentProxy } from '../lib/pdfjs';
import type { PageInfo, Position } from '../lib/types';
import { spreadFor } from './FlowBook';
import { attachGestures } from './gestures';
import type { ViewHandle, ViewReport } from './views';

interface Props {
  pdf: PDFDocumentProxy;
  pages: PageInfo[];
  initialPage: number;
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

export function PdfBook({ pdf, pages, initialPage, handle, onReport, onEdge, onToggleChrome }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const cache = useRef(new PageCanvasCache(pdf));
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [page, setPage] = useState(Math.max(0, Math.min(pages.length - 1, initialPage)));
  const [dir, setDir] = useState<'none' | 'next' | 'prev'>('none');
  const [drag, setDrag] = useState(0);
  const state = useRef({ page, perView: 1 as 1 | 2 });
  const cb = useRef({ onReport, onEdge, onToggleChrome });
  cb.current = { onReport, onEdge, onToggleChrome };

  const perView = size ? spreadFor(size.w, size.h) : 1;
  const first = perView === 2 ? page - (page % 2) : page;
  state.current = { page: first, perView };

  // Tamaño de cada página para que entre completa en la pantalla.
  const slots: Slot[] = [];
  if (size) {
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
  }

  const go = (target: number, d: 'next' | 'prev' | 'none') => {
    const pv = state.current.perView;
    const clamped = Math.max(0, Math.min(pages.length - 1, target));
    const aligned = pv === 2 ? clamped - (clamped % 2) : clamped;
    if (aligned === state.current.page) {
      setDrag(0);
      return;
    }
    setDir(d);
    setDrag(0);
    setPage(aligned);
  };

  useEffect(() => {
    const api: ViewHandle = {
      next: () => {
        const { page: p, perView: pv } = state.current;
        if (p + pv >= pages.length) {
          cb.current.onEdge('end');
          setDrag(0);
        } else go(p + pv, 'next');
      },
      prev: () => {
        const { page: p, perView: pv } = state.current;
        if (p === 0) {
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
    const el = stage.current!;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const detach = attachGestures(el, {
      tap: (x) => {
        const r = el.getBoundingClientRect();
        const rel = (x - r.left) / r.width;
        if (rel < 0.3) api.prev();
        else if (rel > 0.7) api.next();
        else cb.current.onToggleChrome();
      },
      swipe: (d) => {
        if (d === 'left') api.next();
        else if (d === 'right') api.prev();
      },
      drag: (dx) => setDrag(dx),
      dragCancel: () => setDrag(0),
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
      el.removeEventListener('wheel', onWheel);
      if (handle.current === api) handle.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdf]);

  // Al cambiar de página: informar la posición y dibujar (y adelantar) páginas.
  useEffect(() => {
    if (!size) return;
    cb.current.onReport({ pos: { b: -1, o: 0, page: first }, page: first, pages: pages.length, perView });
    let alive = true;
    for (const s of slots) {
      void cache.current.get(s.page, s.w, s.h).then((canvas) => {
        if (!alive) return;
        const host = stage.current?.querySelector(`[data-slot="${s.page}"]`);
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
  }, [first, perView, size?.w, size?.h]);

  return (
    <div class="book-stage pdf-stage" ref={stage} data-testid="book-stage">
      <div
        class={`pdf-spread turn-${dir}${drag ? ' is-dragging' : ''}`}
        key={`${first}-${perView}`}
        style={drag ? { transform: `translate3d(${drag * 0.9}px,0,0)` } : undefined}
      >
        {slots.map((s) => (
          <div class="pdf-page" key={s.page} data-slot={s.page} style={{ width: `${s.w}px`, height: `${s.h}px` }}>
            <div class="pdf-folio">{pages[s.page]!.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
