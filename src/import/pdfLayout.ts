/**
 * Reconstrucción del texto de un PDF: de fragmentos posicionados a renglones,
 * de renglones a párrafos y títulos. Son funciones puras (sin DOM ni pdf.js)
 * para poder probarlas con casos controlados.
 */
import { headerKey, joinLines, looksLikePageNumber } from '../lib/text';

export interface PdfTextItem {
  str: string;
  /** Izquierda del fragmento, en puntos. */
  x: number;
  /** Línea de base medida desde el borde superior de la página, en puntos. */
  y: number;
  w: number;
  /** Tamaño de letra efectivo, en puntos. */
  fs: number;
  eol?: boolean;
}

export interface PdfLine {
  text: string;
  x0: number;
  x1: number;
  y: number;
  fs: number;
  /** Marcado como encabezado o pie de página repetido: no entra al flujo de lectura. */
  furniture?: boolean;
}

export type ParaKind = 'p' | 'h1' | 'h2' | 'h3';

export interface PdfPara {
  kind: ParaKind;
  text: string;
  top: number;
  bottom: number;
  fs: number;
}

export interface PageLayout {
  paras: PdfPara[];
  /** El orden del contenido del PDF salta hacia arriba o hay texto lado a lado. */
  orderDoubt: boolean;
}

const median = (xs: number[]): number => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};

const quantile = (xs: number[], q: number): number => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.round(q * (s.length - 1))))]!;
};

/** Agrupa fragmentos en renglones respetando el orden del contenido del PDF. */
export function groupLines(items: PdfTextItem[]): PdfLine[] {
  const lines: PdfLine[] = [];
  let cur: (PdfLine & { forcedEnd?: boolean }) | null = null;
  let prev: PdfTextItem | null = null;

  for (const it of items) {
    if (!it.str) {
      if (it.eol && cur) cur.forcedEnd = true;
      continue;
    }
    // Negrita simulada: el mismo texto impreso dos veces casi en el mismo lugar.
    if (prev && prev.str === it.str && Math.abs(prev.x - it.x) < 1.5 && Math.abs(prev.y - it.y) < 1.5) continue;
    prev = it;

    const fs = it.fs || 10;
    if (cur && !cur.forcedEnd) {
      const tol = 0.45 * Math.max(fs, cur.fs);
      const gap = it.x - cur.x1;
      const sameBaseline = Math.abs(it.y - cur.y) <= tol;
      if (sameBaseline && gap > -0.6 * fs && gap < 3.2 * fs) {
        const needsSpace = gap > 0.18 * fs && !/\s$/.test(cur.text) && !/^\s/.test(it.str);
        cur.text += (needsSpace ? ' ' : '') + it.str;
        cur.x1 = Math.max(cur.x1, it.x + it.w);
        // El tamaño del renglón es el del texto principal, no el de un superíndice.
        if (it.str.trim().length > 2) cur.fs = Math.max(cur.fs, fs);
        if (it.eol) cur.forcedEnd = true;
        continue;
      }
    }
    if (cur) lines.push(finishLine(cur));
    cur = { text: it.str, x0: it.x, x1: it.x + it.w, y: it.y, fs, forcedEnd: !!it.eol };
  }
  if (cur) lines.push(finishLine(cur));
  return lines.filter((l) => l.text.trim().length > 0);
}

function finishLine(l: PdfLine & { forcedEnd?: boolean }): PdfLine {
  return { text: l.text.replace(/\s+/g, ' ').trim(), x0: l.x0, x1: l.x1, y: l.y, fs: l.fs };
}

/**
 * Marca encabezados y pies de página repetidos (títulos corrientes, números
 * de página) en todas las páginas a la vez. Siguen visibles en el modo libro,
 * que muestra la página original, pero no interrumpen el modo renglón.
 */
export function markFurniture(pages: Array<{ lines: PdfLine[]; h: number }>): void {
  const zone = (l: PdfLine, h: number) => l.y < h * 0.09 || l.y > h * 0.91;
  const top = (l: PdfLine, h: number) => l.y < h * 0.09;
  const counts = new Map<string, number>();
  const bodyTexts = new Set<string>();
  const sizes: number[] = [];
  for (const p of pages) {
    const seen = new Set<string>();
    for (const l of p.lines) {
      sizes.push(l.fs);
      if (!zone(l, p.h)) {
        if (l.text.length <= 90) bodyTexts.add(headerKey(l.text));
        continue;
      }
      if (l.text.length > 90) continue;
      const k = headerKey(l.text);
      if (seen.has(k)) continue;
      seen.add(k);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  const medFs = median(sizes) || 10;
  const minRepeats = pages.length >= 6 ? 3 : 2;
  for (const p of pages) {
    for (const l of p.lines) {
      if (!zone(l, p.h) || l.text.length > 90) continue;
      const k = headerKey(l.text);
      if (
        looksLikePageNumber(l.text) ||
        (counts.get(k) ?? 0) >= minRepeats ||
        // Título corriente que repite un título o una entrada del índice.
        bodyTexts.has(k) ||
        // Cabeza de página en letra más chica que el texto.
        (top(l, p.h) && l.fs < 0.9 * medFs)
      ) {
        l.furniture = true;
      }
    }
  }
}

/** Ancho típico de la columna de texto en todo el documento. */
export function typicalColumnWidth(pages: PdfLine[][], bodyFs: number): number {
  const widths: number[] = [];
  for (const lines of pages) {
    const body = lines.filter((l) => !l.furniture && Math.abs(l.fs - bodyFs) < 0.12 * bodyFs);
    if (body.length < 8) continue;
    widths.push(quantile(body.map((l) => l.x1), 0.9) - quantile(body.map((l) => l.x0), 0.1));
  }
  return median(widths);
}

/** Tamaño de letra del cuerpo de texto: el más frecuente, ponderado por caracteres. */
export function bodyFontSize(allLines: PdfLine[]): number {
  const weight = new Map<number, number>();
  for (const l of allLines) {
    if (l.furniture) continue;
    const k = Math.round(l.fs * 2) / 2;
    weight.set(k, (weight.get(k) ?? 0) + l.text.length);
  }
  let best = 10;
  let bestW = -1;
  for (const [k, w] of weight) {
    if (w > bestW) {
      best = k;
      bestW = w;
    }
  }
  return best;
}

const ENDS_SENTENCE = /[.!?:;»"”)…]$/;
const STARTS_NEW = /^[\p{Lu}\d¿¡«"“—–•·-]/u;

/** Arma párrafos y títulos a partir de los renglones de una página. */
export function buildParagraphs(lines: PdfLine[], bodyFs: number, refWidth = 0): PageLayout {
  const body = lines.filter((l) => !l.furniture);
  if (!body.length) return { paras: [], orderDoubt: false };

  // Interlineado típico y márgenes de la columna, medidos en el cuerpo de texto.
  const gaps: number[] = [];
  for (let i = 1; i < body.length; i++) {
    const a = body[i - 1]!;
    const b = body[i]!;
    const d = b.y - a.y;
    if (d > 0 && d < 3 * a.fs && Math.abs(a.fs - b.fs) < 0.12 * a.fs) gaps.push(d);
  }
  const leading = median(gaps) || bodyFs * 1.25;
  const bodyLines = body.filter((l) => Math.abs(l.fs - bodyFs) < 0.12 * bodyFs);
  const ref = bodyLines.length >= 3 ? bodyLines : body;
  const colLeft = quantile(
    ref.map((l) => l.x0),
    0.1,
  );
  let colRight = quantile(
    ref.map((l) => l.x1),
    0.9,
  );
  // Con pocos renglones (un índice, una portada) el ancho de la página no es
  // representativo: se usa el ancho típico de columna del documento.
  let colWidth = Math.max(1, colRight - colLeft);
  if (ref.length < 8 && refWidth > colWidth) {
    colWidth = refWidth;
    colRight = colLeft + refWidth;
  }

  let jumps = 0;
  let sideBySide = 0;
  const groups: PdfLine[][] = [];
  let cur: PdfLine[] = [];

  for (let i = 0; i < body.length; i++) {
    const l = body[i]!;
    const p = cur[cur.length - 1];
    if (!p) {
      cur.push(l);
      continue;
    }
    let brk = false;
    const dy = l.y - p.y;
    if (dy < -0.5 * p.fs) {
      // El contenido vuelve hacia arriba: otra columna o un recuadro.
      brk = true;
      jumps++;
    } else if (Math.abs(dy) <= 0.45 * p.fs && l.x0 > p.x1) {
      // Texto a la misma altura, a la derecha: columnas o tabla.
      brk = true;
      sideBySide++;
    } else if (Math.abs(l.fs - p.fs) > 0.12 * Math.max(l.fs, p.fs)) {
      brk = true;
    } else if (dy > 1.55 * leading * (p.fs / bodyFs || 1)) {
      brk = true;
    } else {
      const em = l.fs;
      const prevNearLeft = Math.abs(p.x0 - colLeft) < 0.9 * em;
      const indented = l.x0 - colLeft > 0.9 * em;
      const prevShort = p.x1 < colRight - 0.15 * colWidth;
      // Mirando el renglón siguiente se distingue la sangría de primera línea
      // (el siguiente vuelve al margen) de una lista con sangría francesa.
      const n = body[i + 1];
      const nextBackLeft = !n || (Math.abs(n.x0 - colLeft) < 0.9 * em && n.y > l.y);
      if (indented && prevNearLeft && (nextBackLeft || ENDS_SENTENCE.test(p.text))) {
        brk = true;
      } else if (prevShort && ENDS_SENTENCE.test(p.text) && STARTS_NEW.test(l.text)) {
        brk = true;
      } else if (p.x1 < colLeft + 0.6 * colWidth && STARTS_NEW.test(l.text)) {
        // Renglón muy corto seguido de mayúscula: índice, lista o verso.
        brk = true;
      }
    }
    if (brk) {
      groups.push(cur);
      cur = [l];
    } else {
      cur.push(l);
    }
  }
  if (cur.length) groups.push(cur);

  const paras: PdfPara[] = groups.map((g) => {
    const text = joinLines(g.map((l) => l.text));
    const fs = median(g.map((l) => l.fs));
    const ratio = fs / bodyFs;
    let kind: ParaKind = 'p';
    if (text.length < 220 && g.length <= 4) {
      if (ratio >= 1.65) kind = 'h1';
      else if (ratio >= 1.3) kind = 'h2';
      else if (ratio >= 1.15) kind = 'h3';
    }
    return { kind, text, top: g[0]!.y - g[0]!.fs, bottom: g[g.length - 1]!.y, fs };
  });

  return { paras, orderDoubt: jumps > 0 || sideBySide >= 3 };
}
