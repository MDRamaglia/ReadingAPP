/**
 * Toques y deslizamientos con Pointer Events (dedo, lápiz o mouse). Un toque
 * es un contacto breve sin desplazamiento; un deslizamiento supera un umbral
 * en una dirección dominante.
 */

export interface DragInfo {
  /** Punto donde empezó el contacto y punto actual, en coordenadas de pantalla. */
  x0: number;
  y0: number;
  x: number;
  y: number;
}

export interface GestureHandlers {
  tap?: (x: number, y: number) => void;
  swipe?: (dir: 'left' | 'right' | 'up' | 'down') => void;
  /** Arrastre en curso sobre el eje elegido (para acompañar el dedo al pasar página). */
  drag?: (d: number, info: DragInfo) => void;
  /** Fin del arrastre sin deslizamiento suficiente. */
  dragCancel?: () => void;
  /** Eje del arrastre: horizontal (por defecto) o vertical. Se consulta en cada gesto. */
  axis?: () => 'x' | 'y';
}

const INTERACTIVE = 'a, button, input, select, textarea, label, [data-no-gesture]';

export function attachGestures(el: HTMLElement, h: GestureHandlers): () => void {
  let start: { x: number; y: number; t: number; id: number } | null = null;
  let dragging = false;
  let axis: 'x' | 'y' = 'x';

  const down = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if ((e.target as Element).closest(INTERACTIVE)) return;
    start = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
    dragging = false;
    axis = h.axis?.() ?? 'x';
  };
  const move = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const along = axis === 'x' ? dx : dy;
    const across = axis === 'x' ? dy : dx;
    if (!dragging && Math.abs(along) > 12 && Math.abs(along) > Math.abs(across) * 1.2 && h.drag) {
      dragging = true;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* sin captura */
      }
    }
    if (dragging) h.drag?.(along, { x0: start.x, y0: start.y, x: e.clientX, y: e.clientY });
  };
  const up = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const dt = performance.now() - start.t;
    start = null;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    let dir: 'left' | 'right' | 'up' | 'down' | null = null;
    if (ax > 40 && ax > ay) dir = dx < 0 ? 'left' : 'right';
    else if (ay > 40 && ay > ax) dir = dy < 0 ? 'up' : 'down';
    if (ax < 10 && ay < 10 && dt < 600) {
      if (dragging) h.dragCancel?.();
      h.tap?.(e.clientX, e.clientY);
    } else if (dir) {
      // Un deslizamiento en el otro eje no completa el arrastre en curso.
      const onAxis = (dir === 'left' || dir === 'right') === (axis === 'x');
      if (dragging && !onAxis) h.dragCancel?.();
      h.swipe?.(dir);
    } else if (dragging) {
      h.dragCancel?.();
    }
    dragging = false;
  };
  const cancel = () => {
    if (dragging) h.dragCancel?.();
    start = null;
    dragging = false;
  };

  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', cancel);
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', cancel);
  };
}
