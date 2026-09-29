/**
 * Utilidades para traducir entre posiciones de texto (carácter dentro de un
 * bloque) y el DOM renderizado, en cualquiera de los dos modos.
 */

export function textNodes(el: Element): Text[] {
  const out: Text[] = [];
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) out.push(n as Text);
  return out;
}

/** Nodo de texto y desplazamiento correspondientes al carácter `o` del bloque. */
export function locate(el: Element, o: number): { node: Text; offset: number } | null {
  let rest = Math.max(0, o);
  const nodes = textNodes(el);
  for (const node of nodes) {
    const len = node.data.length;
    if (rest < len) return { node, offset: rest };
    rest -= len;
  }
  const last = nodes[nodes.length - 1];
  return last ? { node: last, offset: last.data.length } : null;
}

const range = () => document.createRange();

/** Rectángulo del carácter `o` (o del bloque si no tiene texto). */
export function charRect(el: Element, o: number): DOMRect | null {
  const loc = locate(el, o);
  if (!loc) return el.getBoundingClientRect();
  const r = range();
  const { node } = loc;
  // Busca el primer carácter visible a partir de `o` (los espacios de corte no tienen caja).
  for (let i = loc.offset; i < node.data.length; i++) {
    r.setStart(node, i);
    r.setEnd(node, i + 1);
    const rects = r.getClientRects();
    const rect = rects[rects.length - 1];
    if (rect && rect.width > 0 && rect.height > 0) return rect;
  }
  for (let i = Math.min(loc.offset, node.data.length) - 1; i >= 0; i--) {
    r.setStart(node, i);
    r.setEnd(node, i + 1);
    const rects = r.getClientRects();
    const rect = rects[rects.length - 1];
    if (rect && rect.width > 0 && rect.height > 0) return rect;
  }
  return el.getBoundingClientRect();
}

/**
 * Primer carácter `o` en [lo, hi) para el que `pred(rect)` es verdadero,
 * suponiendo que la condición es monótona a lo largo del texto.
 */
export function searchChar(el: Element, lo: number, hi: number, pred: (r: DOMRect) => boolean): number {
  const nodes = textNodes(el);
  const starts: number[] = [];
  let acc = 0;
  for (const n of nodes) {
    starts.push(acc);
    acc += n.data.length;
  }
  const r = range();
  const rectAt = (o: number): DOMRect | null => {
    let k = starts.length - 1;
    while (k > 0 && starts[k]! > o) k--;
    const node = nodes[k];
    if (!node) return null;
    const off = o - starts[k]!;
    if (off >= node.data.length) return null;
    r.setStart(node, off);
    r.setEnd(node, off + 1);
    const rects = r.getClientRects();
    const rect = rects[rects.length - 1];
    return rect && rect.width > 0 && rect.height > 0 ? rect : null;
  };
  let a = lo;
  let b = hi;
  while (a < b) {
    const m = (a + b) >> 1;
    const rect = rectAt(m);
    if (rect && pred(rect)) b = m;
    else a = m + 1;
  }
  return a;
}
