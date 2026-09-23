/**
 * Toques y deslizamientos con Pointer Events (dedo, lápiz o mouse). Un toque
 * es un contacto breve sin desplazamiento; un deslizamiento supera un umbral
 * en una dirección dominante.
 */

export interface GestureHandlers {
  tap?: (x: number, y: number) => void;
  swipe?: (dir: 'left' | 'right' | 'up' | 'down') => void;
  /** Arrastre horizontal en curso (para acompañar el dedo al pasar página). */
  drag?: (dx: number) => void;
  /** Fin del arrastre sin deslizamiento suficiente. */
  dragCancel?: () => void;
}

const INTERACTIVE = 'a, button, input, select, textarea, label, [data-no-gesture]';

export function attachGestures(el: HTMLElement, h: GestureHandlers): () => void {
  let start: { x: number; y: number; t: number; id: number } | null = null;
  let dragging = false;

  const down = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if ((e.target as Element).closest(INTERACTIVE)) return;
    start = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
    dragging = false;
  };
  const move = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!dragging && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2 && h.drag) {
      dragging = true;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* sin captura */
      }
    }
    if (dragging) h.drag?.(dx);
  };
  const up = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const dt = performance.now() - start.t;
    start = null;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (ax < 10 && ay < 10 && dt < 600) {
      if (dragging) h.dragCancel?.();
      h.tap?.(e.clientX, e.clientY);
    } else if (ax > 40 && ax > ay) {
      h.swipe?.(dx < 0 ? 'left' : 'right');
    } else if (ay > 40 && ay > ax) {
      if (dragging) h.dragCancel?.();
      h.swipe?.(dy < 0 ? 'up' : 'down');
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
