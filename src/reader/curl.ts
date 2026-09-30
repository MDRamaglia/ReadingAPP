/**
 * Animación de hoja de libro («page curl») para el modo libro horizontal.
 *
 * Modelo: la hoja que gira está sujeta por su borde izquierdo (el lomo). Su
 * esquina inferior (o la superior, si se la toma de arriba) recorre un arco
 * hasta quedar del otro lado del lomo. El pliegue es la mediatriz entre la
 * posición original de la esquina y la actual: la parte de la hoja del lado
 * del lomo sigue apoyada y muestra su texto; la otra se refleja sobre el
 * pliegue y muestra el dorso del papel. Lo que la hoja deja libre descubre,
 * poco a poco, la página de abajo. Degradados sobre el dorso y la sombra que
 * la hoja proyecta sobre la página descubierta dan la curvatura.
 *
 * Capas, de abajo hacia arriba, dentro del escenario del libro:
 *   - base: la vista real, que durante la vuelta muestra la pantalla posterior;
 *   - frente: la pantalla anterior (la de la hoja), recortada a lo que sigue apoyado;
 *   - sombra: sobre lo que la hoja va descubriendo;
 *   - dorso: la parte doblada.
 * Avanzar recorre t de 0 a 1; retroceder, de 1 a 0: la misma hoja vuelve a su lugar.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CurlLayout {
  /** Hoja que gira (la página derecha o la única); gira sobre su borde izquierdo. */
  sheet: Rect;
  /** Página izquierda de la pantalla anterior, cuando se ven dos páginas. */
  left?: Rect;
}

export type Corner = 'top' | 'bottom';

interface Pt {
  x: number;
  y: number;
}

export interface Fold {
  /** Parte apoyada, parte levantada y parte levantada ya reflejada (coordenadas de la hoja). */
  flat: Pt[];
  lifted: Pt[];
  flipped: Pt[];
  /** Normal del pliegue (apunta hacia la parte levantada) y un punto del pliegue. */
  n: Pt;
  m: Pt;
  /** Distancia máxima de la parte levantada al pliegue. */
  depth: number;
  /** Reflexión sobre el pliegue, como matriz CSS (a, b, c, d, e, f). */
  matrix: number[];
}

/** Conserva la parte del polígono donde f(p) ≤ 0 (recorte por un semiplano). */
function clipPoly(poly: Pt[], f: (p: Pt) => number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    const fa = f(a);
    const fb = f(b);
    if (fa <= 0) out.push(a);
    if (fa <= 0 !== fb <= 0) {
      const k = fa / (fa - fb);
      out.push({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
    }
  }
  return out;
}

/** Geometría del pliegue para una hoja de W × H con el lomo a la izquierda. */
export function foldAt(t: number, W: number, H: number, corner: Corner = 'bottom'): Fold | null {
  if (t <= 0 || W <= 0 || H <= 0) return null;
  const a = Math.PI * Math.min(1, t);
  // La esquina describe un arco achatado: sube un poco a mitad de camino,
  // como una hoja que se levanta, y nunca se aleja del lomo más que el ancho.
  const P = { x: W * Math.cos(a), y: H - 0.22 * W * Math.sin(a) };
  let nx = W - P.x;
  let ny = H - P.y;
  const len = Math.hypot(nx, ny);
  if (len < 0.5) return null;
  nx /= len;
  ny /= len;
  let m = { x: (W + P.x) / 2, y: (H + P.y) / 2 };
  if (corner === 'top') {
    ny = -ny;
    m = { x: m.x, y: H - m.y };
  }
  const side = (p: Pt) => (p.x - m.x) * nx + (p.y - m.y) * ny;
  const rect = [
    { x: 0, y: 0 },
    { x: W, y: 0 },
    { x: W, y: H },
    { x: 0, y: H },
  ];
  const flat = clipPoly(rect, side);
  const lifted = clipPoly(rect, (p) => -side(p));
  const flipped = lifted.map((p) => {
    const d = 2 * side(p);
    return { x: p.x - d * nx, y: p.y - d * ny };
  });
  const depth = lifted.reduce((mx, p) => Math.max(mx, side(p)), 0);
  const c = 2 * (m.x * nx + m.y * ny);
  return {
    flat,
    lifted,
    flipped,
    n: { x: nx, y: ny },
    m,
    depth,
    matrix: [1 - 2 * nx * nx, -2 * nx * ny, -2 * nx * ny, 1 - 2 * ny * ny, c * nx, c * ny],
  };
}

const EMPTY = 'polygon(0 0, 0 0, 0 0)';
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const fmt = (v: number) => v.toFixed(1);
/** Ancho en píxeles de los degradados fijos de CSS (.curl-shade, .curl-cast-strip). */
const SHADE_W = 1000;
const CAST_W = 100;

/**
 * Lleva una banda con degradado fijo al pliegue: su borde izquierdo queda
 * sobre el pliegue, su eje apunta hacia `n` y se estira hasta `len` píxeles.
 * Solo cambia la transformación, así que el navegador no vuelve a pintar.
 */
const band = (m: Pt, n: Pt, len: number, base: number) =>
  `translate(${fmt(m.x)}px, ${fmt(m.y)}px) rotate(${Math.atan2(n.y, n.x).toFixed(5)}rad) scaleX(${(len / base).toFixed(4)})`;

/** Capas y dibujo de una hoja que gira. */
export class PageCurl {
  readonly root: HTMLDivElement;
  /** Aquí se arma la pantalla anterior, en coordenadas del escenario. */
  readonly content: HTMLDivElement;
  private front: HTMLDivElement;
  private cast: HTMLDivElement;
  private castStrip: HTMLDivElement;
  private back: HTMLDivElement;
  private paper: HTMLDivElement;
  private shade: HTMLDivElement;
  private layout: CurlLayout | null = null;
  private corner: Corner = 'bottom';
  private raf = 0;
  private anim: { from: number; to: number; t0: number; ms: number; done: () => void } | null = null;
  t = 0;

  constructor(stage: HTMLElement) {
    const div = (cls: string) => {
      const d = document.createElement('div');
      d.className = cls;
      return d;
    };
    this.root = div('curl');
    this.root.hidden = true;
    this.root.setAttribute('aria-hidden', 'true');
    this.front = div('curl-front');
    this.content = div('curl-content');
    this.front.append(this.content);
    this.cast = div('curl-cast');
    this.castStrip = div('curl-cast-strip');
    this.cast.append(this.castStrip);
    // Dorso: la hoja (sin recorte por fotograma) es un papel enorme cuyo borde
    // se apoya en el pliegue; el marco de la hoja lo recorta a la parte levantada.
    this.back = div('curl-back');
    this.paper = div('curl-paper');
    this.shade = div('curl-shade');
    this.paper.append(this.shade);
    this.back.append(this.paper);
    this.root.append(this.front, this.cast, this.back);
    stage.append(this.root);
  }

  get animating(): boolean {
    return this.anim !== null;
  }

  get sheetWidth(): number {
    return this.layout?.sheet.w ?? 0;
  }

  /**
   * Muestra la hoja en la posición `t`. La geometría se pide con la capa ya
   * visible, para que la vista pueda medir lo que armó en `content`.
   */
  begin(layout: () => CurlLayout, t: number, corner: Corner) {
    this.stop();
    this.root.hidden = false;
    this.layout = layout();
    this.corner = corner;
    const { sheet } = this.layout;
    const box = { left: `${sheet.x}px`, top: `${sheet.y}px`, width: `${sheet.w}px`, height: `${sheet.h}px` };
    Object.assign(this.back.style, box);
    Object.assign(this.cast.style, box);
    this.set(t);
  }

  set(t: number) {
    this.t = t;
    const L = this.layout;
    if (!L) return;
    const { sheet } = L;
    const f = t < 0.999 ? foldAt(t, sheet.w, sheet.h, this.corner) : null;
    if (!f) {
      // t ≈ 0: la hoja apoyada, se ve entera; t ≈ 1: ya dio vuelta.
      this.front.style.clipPath = t < 0.5 ? 'none' : EMPTY;
      this.back.style.visibility = 'hidden';
      this.cast.style.visibility = 'hidden';
      return;
    }
    const ox = sheet.x;
    const oy = sheet.y;
    const path = (poly: Pt[]) => (poly.length > 2 ? `M${poly.map((p) => `${fmt(p.x + ox)},${fmt(p.y + oy)}`).join(' L')} Z` : '');

    // Frente: lo que sigue apoyado. Con dos páginas, también la izquierda,
    // menos lo que ya tapa el dorso (ahí se verá la página que viene).
    let d = path(f.flat);
    if (L.left) {
      const r = L.left;
      d = `M${fmt(r.x)},${fmt(r.y)} L${fmt(r.x + r.w)},${fmt(r.y)} L${fmt(r.x + r.w)},${fmt(r.y + r.h)} L${fmt(r.x)},${fmt(r.y + r.h)} Z ${d} ${path(f.flipped)}`;
    }
    this.front.style.clipPath = d.trim() ? `path(evenodd, '${d.trim()}')` : EMPTY;

    // Dorso: la parte levantada, reflejada sobre el pliegue. El sombreado
    // (brillo cerca del doblez, sombra hacia el borde) hace que se lea como
    // papel curvado; es un degradado fijo que solo se ubica y se estira.
    const b = this.back.style;
    // «inherit»: en reposo la capa entera queda invisible (ver .curl[hidden]).
    b.visibility = 'inherit';
    b.transform = `matrix(${f.matrix.map((v) => v.toFixed(5)).join(',')})`;
    this.paper.style.transform = band(f.m, f.n, 1, 1);
    this.shade.style.transform = `scaleX(${(Math.max(1, f.depth) / SHADE_W).toFixed(4)})`;
    // Con dos páginas, al asentarse sobre la izquierda el dorso deja ver la página nueva.
    b.opacity = L.left && t > 0.62 ? String(Math.max(0, (1 - t) / 0.38)) : '1';

    // Sombra que la hoja proyecta sobre lo que descubre; más marcada a mitad de camino.
    const k = Math.sin(Math.PI * t);
    this.cast.style.visibility = 'inherit';
    this.castStrip.style.transform = band(f.m, f.n, 16 + 48 * k, CAST_W);
    this.castStrip.style.opacity = ((0.08 + 0.3 * k) / 0.38).toFixed(3);
  }

  /** Anima hasta `to` y llama a `done` al terminar. */
  animateTo(to: number, done: () => void) {
    this.stop();
    const from = this.t;
    const ms = Math.max(180, 640 * Math.abs(to - from));
    this.anim = { from, to, t0: performance.now(), ms, done };
    const step = (now: number) => {
      const a = this.anim;
      if (!a) return;
      const k = Math.min(1, (now - a.t0) / a.ms);
      this.set(a.from + (a.to - a.from) * ease(k));
      if (k < 1) this.raf = requestAnimationFrame(step);
      else this.complete();
    };
    this.raf = requestAnimationFrame(step);
  }

  /** Lleva la animación en curso a su final de inmediato (pases de página rápidos). */
  finish() {
    if (!this.anim) return;
    this.set(this.anim.to);
    this.complete();
  }

  private complete() {
    const a = this.anim;
    this.stop();
    a?.done();
  }

  private stop() {
    cancelAnimationFrame(this.raf);
    this.anim = null;
  }

  hide() {
    this.stop();
    this.root.hidden = true;
    this.layout = null;
  }

  destroy() {
    this.hide();
    this.root.remove();
  }
}

/** Lo que cada vista (Word o PDF) aporta para dar vuelta sus hojas. */
export interface TurnHost {
  /** Pantalla que muestra la vista real (null: la del estado actual). */
  showBase(index: number | null): void;
  /** Arma en `into` la pantalla `index` tal como se ve; puede esperar a que esté dibujada. */
  buildFront(index: number, into: HTMLElement): void | Promise<void>;
  /** Geometría de la hoja de la pantalla armada en el frente, en coordenadas del escenario. */
  layout(): CurlLayout;
  /** La vista real ya dibujó la pantalla actual (para retirar la hoja sin parpadeo). */
  baseReady?(): boolean;
  /** Libera lo armado en el frente al terminar. */
  releaseFront?(into: HTMLElement): void;
}

/**
 * Vueltas de hoja entre pantallas: completas (toque, tecla, rueda) o
 * acompañando el dedo. Los índices son los de la vista (pantalla de Word o
 * primera página del PDF). El estado lógico lo cambia la vista; aquí solo se
 * decide qué se ve durante la vuelta.
 */
export class CurlTurns {
  readonly curl: PageCurl;
  private token = 0;
  private busy = false;
  private drag: { fwd: boolean; my: number; ready: boolean; t: number; from: number; to: number } | null = null;

  constructor(
    stage: HTMLElement,
    private host: TurnHost,
  ) {
    this.curl = new PageCurl(stage);
  }

  /** Dirección del arrastre en curso, si lo hay. */
  get dragging(): 'next' | 'prev' | null {
    return this.drag ? (this.drag.fwd ? 'next' : 'prev') : null;
  }

  /** Vuelta completa de `from` a `to`; el estado lógico ya pasó a `to`. */
  turn(from: number, to: number) {
    this.settle();
    const my = ++this.token;
    const fwd = to > from;
    this.busy = true;
    // Mientras se prepara la hoja, la vista sigue en la pantalla actual.
    this.host.showBase(from);
    this.whenFront(fwd ? from : to, my, () => {
      if (fwd) this.host.showBase(to);
      this.curl.begin(() => this.host.layout(), fwd ? 0 : 1, 'bottom');
      this.curl.animateTo(fwd ? 1 : 0, () => this.end(my));
    });
  }

  /** Empieza a dar vuelta la hoja con el dedo, sin cambiar todavía de página. */
  dragStart(from: number, to: number, corner: Corner) {
    this.settle();
    const my = ++this.token;
    const fwd = to > from;
    this.busy = true;
    this.drag = { fwd, my, ready: false, t: fwd ? 0 : 1, from, to };
    this.host.showBase(from);
    this.whenFront(fwd ? from : to, my, () => {
      const g = this.drag;
      if (!g || g.my !== my) return;
      if (fwd) this.host.showBase(to);
      this.curl.begin(() => this.host.layout(), g.t, corner);
      g.ready = true;
    });
  }

  /** `d`: desplazamiento del dedo desde que empezó el arrastre. */
  dragMove(d: number) {
    const g = this.drag;
    if (!g) return;
    const w = this.curl.sheetWidth || 320;
    const k = Math.max(0, Math.min(1, (g.fwd ? -d : d) / (w * 0.9)));
    g.t = g.fwd ? k : 1 - k;
    if (g.ready) this.curl.set(g.t);
  }

  /**
   * Suelta la hoja: completa la vuelta (la vista ya cambió su estado a la
   * pantalla nueva) o la devuelve a su lugar.
   */
  dragEnd(complete: boolean) {
    const g = this.drag;
    if (!g) return;
    this.drag = null;
    if (!g.ready) {
      this.abort();
      if (complete) this.turn(g.from, g.to);
      return;
    }
    const target = complete === g.fwd ? 1 : 0;
    this.curl.animateTo(target, () => this.end(g.my));
  }

  /** Termina de inmediato lo que esté en curso (antes de otra vuelta o de un salto). */
  settle() {
    if (this.drag) {
      this.drag = null;
      this.abort();
    } else if (this.curl.animating) {
      this.curl.finish();
    } else if (this.busy) {
      // Esperando a que se dibuje la hoja o a retirarla: se retira ya.
      this.abort();
    }
  }

  destroy() {
    this.token++;
    this.curl.destroy();
  }

  private abort() {
    this.token++;
    this.busy = false;
    this.curl.hide();
    this.host.showBase(null);
    this.host.releaseFront?.(this.curl.content);
  }

  private whenFront(index: number, my: number, go: () => void) {
    const r = this.host.buildFront(index, this.curl.content);
    if (r && typeof (r as Promise<void>).then === 'function') {
      (r as Promise<void>).then(
        () => my === this.token && go(),
        () => my === this.token && this.abort(),
      );
    } else go();
  }

  private end(my: number) {
    this.host.showBase(null);
    let frames = 0;
    const check = () => {
      if (my !== this.token) return;
      if (frames++ > 40 || !this.host.baseReady || this.host.baseReady()) {
        this.busy = false;
        this.curl.hide();
        this.host.releaseFront?.(this.curl.content);
      } else requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  }
}
