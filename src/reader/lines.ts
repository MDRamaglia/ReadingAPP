/**
 * Medición de renglones visuales para el modo concentración.
 *
 * Un «renglón» es una línea tal como la dibuja el navegador con el tamaño de
 * letra y el ancho elegidos. Para cada bloque se obtienen las cajas de línea
 * de sus nodos de texto y, con una búsqueda binaria, el carácter en que
 * empieza cada renglón. Así, al cambiar la letra o girar la pantalla, se
 * vuelve a medir y se ubica el renglón que contiene el mismo carácter.
 */

export interface LineBox {
  /** Bordes superior e inferior relativos al comienzo del texto. */
  top: number;
  bottom: number;
  /** Carácter del bloque con el que empieza el renglón. */
  o: number;
}

const overlapRatio = (a: { top: number; bottom: number }, b: { top: number; bottom: number }) => {
  const inter = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  const minH = Math.max(1, Math.min(a.bottom - a.top, b.bottom - b.top));
  return inter / minH;
};

function firstCharFrom(node: Text, lo: number, hi: number, minTop: number, r: Range): number {
  let a = lo;
  let b = hi;
  while (a < b) {
    const m = (a + b) >> 1;
    r.setStart(node, m);
    r.setEnd(node, m + 1);
    const rects = r.getClientRects();
    const rect = rects[rects.length - 1];
    const ok = !!rect && rect.width > 0 && rect.height > 0 && rect.top >= minTop;
    if (ok) b = m;
    else a = m + 1;
  }
  return a;
}

export function measureBlockLines(el: HTMLElement, originTop: number): LineBox[] {
  const frags: LineBox[] = [];
  const r = document.createRange();
  let base = 0;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeType === Node.ELEMENT_NODE) {
      if ((n as Element).tagName === 'IMG') {
        const rect = (n as Element).getBoundingClientRect();
        if (rect.height > 0) frags.push({ top: rect.top - originTop, bottom: rect.bottom - originTop, o: base });
      }
      continue;
    }
    const t = n as Text;
    const len = t.data.length;
    if (!len) continue;
    r.selectNodeContents(t);
    const rows: Array<{ top: number; bottom: number }> = [];
    for (const rect of Array.from(r.getClientRects())) {
      if (rect.width <= 0.5 || rect.height <= 0) continue;
      const last = rows[rows.length - 1];
      if (last && overlapRatio(last, rect) > 0.5) {
        last.top = Math.min(last.top, rect.top);
        last.bottom = Math.max(last.bottom, rect.bottom);
      } else {
        rows.push({ top: rect.top, bottom: rect.bottom });
      }
    }
    let lo = 0;
    rows.forEach((row, k) => {
      let start = 0;
      if (k > 0) {
        const tol = (row.bottom - row.top) * 0.4;
        start = firstCharFrom(t, lo, len, row.top - tol, r);
        lo = start;
      }
      frags.push({ top: row.top - originTop, bottom: row.bottom - originTop, o: base + start });
    });
    base += len;
  }
  frags.sort((a, b) => a.top - b.top || a.o - b.o);
  const lines: LineBox[] = [];
  for (const f of frags) {
    const last = lines[lines.length - 1];
    if (last && overlapRatio(last, f) > 0.5) {
      last.top = Math.min(last.top, f.top);
      last.bottom = Math.max(last.bottom, f.bottom);
      last.o = Math.min(last.o, f.o);
    } else {
      lines.push({ ...f });
    }
  }
  return lines;
}

/** Renglón que contiene el carácter `o`: el de mayor comienzo que no lo supera. */
export function lineIndexFor(lines: LineBox[], o: number): number {
  let best = 0;
  for (let k = 0; k < lines.length; k++) {
    const l = lines[k]!;
    if (l.o <= o && l.o >= lines[best]!.o) best = k;
  }
  return best;
}
