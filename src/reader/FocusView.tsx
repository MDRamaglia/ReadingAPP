/**
 * Modo concentración: un único renglón en foco, a una altura fija de la
 * pantalla, con el texto circundante atenuado u oculto. Cada toque en la zona
 * principal avanza exactamente un renglón visual.
 */
import { useEffect, useRef } from 'preact/hooks';
import type { MutableRef } from 'preact/hooks';
import type { Block, Position, Settings } from '../lib/types';
import { attachGestures } from './gestures';
import { lineIndexFor, measureBlockLines, type LineBox } from './lines';
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
}

class FocusEngine implements ViewHandle {
  private cache = new Map<number, LineBox[]>();
  private els: HTMLElement[] = [];
  private cur = { b: 0, k: 0 };
  private pos: Position;
  private relayoutTimer = 0;

  constructor(
    private stage: HTMLElement,
    private track: HTMLElement,
    private veilTop: HTMLElement,
    private veilBottom: HTMLElement,
    private blocks: Block[],
    initial: Position,
    private report: (r: ViewReport) => void,
    private edge: (e: 'start' | 'end') => void,
  ) {
    this.pos = { ...initial };
  }

  mount(urls: Map<string, string>) {
    this.track.innerHTML = blocksHtml(this.blocks);
    hydrateImages(this.track, urls);
    this.els = [];
    for (const el of blockElements(this.track)) this.els[Number(el.dataset.b)] = el;
    // Si una imagen sin medidas cambia el alto al cargar, se vuelve a medir.
    this.track.addEventListener('load', () => this.scheduleRelayout(), true);
  }

  private lines(b: number): LineBox[] {
    let l = this.cache.get(b);
    if (!l) {
      const el = this.els[b];
      l = el ? measureBlockLines(el, this.track.getBoundingClientRect().top) : [];
      this.cache.set(b, l);
    }
    return l;
  }

  private findBlock(from: number, dir: 1 | -1): number {
    for (let b = from; b >= 0 && b < this.blocks.length; b += dir) if (this.lines(b).length) return b;
    return -1;
  }

  position(): Position {
    return { ...this.pos };
  }

  goTo(pos: Position, animate = true) {
    let b = Math.max(0, Math.min(this.blocks.length - 1, pos.b));
    let o = pos.o;
    let target = this.findBlock(b, 1);
    if (target < 0) target = this.findBlock(b, -1);
    if (target < 0) return;
    if (target !== b) o = 0;
    b = target;
    const k = lineIndexFor(this.lines(b), o);
    this.cur = { b, k };
    this.pos = { b, o: target === pos.b ? pos.o : this.lines(b)[k]!.o };
    this.apply(animate);
    this.report({ pos: this.position() });
  }

  next() {
    let { b, k } = this.cur;
    if (k + 1 < this.lines(b).length) k++;
    else {
      const nb = this.findBlock(b + 1, 1);
      if (nb < 0) {
        this.edge('end');
        return;
      }
      b = nb;
      k = 0;
    }
    this.step(b, k);
  }

  prev() {
    let { b, k } = this.cur;
    if (k > 0) k--;
    else {
      const pb = this.findBlock(b - 1, -1);
      if (pb < 0) {
        this.edge('start');
        return;
      }
      b = pb;
      k = this.lines(b).length - 1;
    }
    this.step(b, k);
  }

  private step(b: number, k: number) {
    this.cur = { b, k };
    this.pos = { b, o: this.lines(b)[k]!.o };
    this.apply(true);
    this.report({ pos: this.position() });
  }

  /** Mueve el texto para que el renglón activo quede en la banda de foco. */
  private apply(animate: boolean) {
    const line = this.lines(this.cur.b)[this.cur.k];
    if (!line) return;
    const H = this.stage.clientHeight;
    const h = line.bottom - line.top;
    const cs = getComputedStyle(this.track);
    const lineBox = parseFloat(cs.lineHeight) || h * 1.5;
    const pad = Math.max(4, (lineBox - h) / 2 + 3);
    // Renglones normales, a la altura de la vista; imágenes o títulos altos, centrados.
    let anchor = Math.round(H * 0.38);
    if (h + 2 * pad > H * 0.3) anchor = Math.max(pad + 8, Math.round((H - h) / 2));
    const y = anchor - line.top;
    this.stage.classList.toggle('no-anim', !animate);
    this.track.style.transform = `translate3d(0, ${y}px, 0)`;
    this.veilTop.style.height = `${Math.max(0, anchor - pad)}px`;
    this.veilBottom.style.top = `${anchor + h + pad}px`;
    this.stage.style.setProperty('--band-top', `${anchor - pad}px`);
    this.stage.style.setProperty('--band-h', `${h + 2 * pad}px`);
    this.els.forEach((el) => el?.classList.remove('is-active'));
    this.els[this.cur.b]?.classList.add('is-active');
    if (!animate) {
      void this.stage.offsetHeight;
      requestAnimationFrame(() => this.stage.classList.remove('no-anim'));
    }
  }

  /** Recalcula los renglones (cambio de letra, ancho o giro) sin perder el lugar. */
  relayout() {
    this.cache.clear();
    const keep = this.pos;
    this.goTo(keep, false);
    this.pos = keep;
  }

  scheduleRelayout() {
    clearTimeout(this.relayoutTimer);
    this.relayoutTimer = window.setTimeout(() => this.relayout(), 120);
  }

  /** Renglón activo (para pruebas automatizadas). */
  activeLine(): { b: number; k: number; count: number; o: number; nextO: number | null; top: number; bottom: number; pos: Position } {
    const l = this.lines(this.cur.b);
    const line = l[this.cur.k];
    return {
      ...this.cur,
      count: l.length,
      o: line?.o ?? 0,
      nextO: l[this.cur.k + 1]?.o ?? null,
      top: line?.top ?? 0,
      bottom: line?.bottom ?? 0,
      pos: this.position(),
    };
  }
}

export function FocusView({ blocks, assetUrls, settings, initial, handle, onReport, onEdge }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const vTop = useRef<HTMLDivElement>(null);
  const vBottom = useRef<HTMLDivElement>(null);
  const engine = useRef<FocusEngine | null>(null);
  const cb = useRef({ onReport, onEdge });
  cb.current = { onReport, onEdge };

  useEffect(() => {
    const e = new FocusEngine(
      stage.current!,
      track.current!,
      vTop.current!,
      vBottom.current!,
      blocks,
      initial,
      (r) => cb.current.onReport(r),
      (x) => cb.current.onEdge(x),
    );
    engine.current = e;
    handle.current = e;
    (window as unknown as { __focus?: FocusEngine }).__focus = e;
    e.mount(assetUrls);
    let alive = true;
    void document.fonts.ready.then(() => {
      if (alive) e.goTo(initial, false);
    });

    const detach = attachGestures(stage.current!, {
      tap: (x) => {
        const r = stage.current!.getBoundingClientRect();
        if (x - r.left < Math.max(64, r.width * 0.25)) e.prev();
        else e.next();
      },
      swipe: (dir) => {
        if (dir === 'up' || dir === 'left') e.next();
        else e.prev();
      },
    });

    let wheelAcc = 0;
    let wheelT = 0;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const now = performance.now();
      if (now - wheelT > 250) wheelAcc = 0;
      wheelT = now;
      wheelAcc += ev.deltaY;
      if (Math.abs(wheelAcc) >= 50) {
        if (wheelAcc > 0) e.next();
        else e.prev();
        wheelAcc = 0;
      }
    };
    stage.current!.addEventListener('wheel', onWheel, { passive: false });

    const ro = new ResizeObserver(() => e.scheduleRelayout());
    ro.observe(stage.current!);
    return () => {
      alive = false;
      detach();
      ro.disconnect();
      stage.current?.removeEventListener('wheel', onWheel);
      if (handle.current === e) handle.current = null;
    };
    // El motor se crea una sola vez por documento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  // Cambios de tipografía: se recalculan los renglones cuando la fuente está lista.
  useEffect(() => {
    const e = engine.current;
    if (!e) return;
    let alive = true;
    const family = settings.font === 'atkinson' ? '"Atkinson Hyperlegible"' : '"Literata Variable"';
    void document.fonts.load(`${settings.fontSize}px ${family}`).then(() => {
      if (alive) e.relayout();
    });
    return () => {
      alive = false;
    };
  }, [settings.fontSize, settings.width, settings.lineHeight, settings.font]);

  return (
    <div class={`focus-stage ctx-${settings.focusContext}`} ref={stage} data-testid="focus-stage">
      <div class="focus-column">
        <div class="focus-track reading-text" ref={track} />
      </div>
      <div class="veil veil-top" ref={vTop} aria-hidden="true" />
      <div class="veil veil-bottom" ref={vBottom} aria-hidden="true" />
      <div class="focus-band" aria-hidden="true" />
    </div>
  );
}
