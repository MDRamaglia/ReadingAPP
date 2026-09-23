/**
 * Importación de PDF: clasifica cada página (con texto, escaneada o vacía),
 * reconstruye el texto en orden de lectura, recorta las imágenes y conserva la
 * numeración original de las páginas.
 */
import { closePdf, openPdf, pdfjs, renderPageToCanvas, type PDFDocumentProxy, type PDFPageProxy } from '../lib/pdfjs';
import { escapeHtml, joinLines, stripExtension } from '../lib/text';
import type { Block, DocMeta, PageInfo, TocEntry } from '../lib/types';
import { bodyFontSize, buildParagraphs, groupLines, markFurniture, typicalColumnWidth, type PdfLine, type PdfPara, type PdfTextItem } from './pdfLayout';
import type { ImportProgress, ImportResult } from './types';

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Matrix = [number, number, number, number, number, number];

const mul = (m1: Matrix, m2: number[]): Matrix => [
  m1[0] * m2[0]! + m1[2] * m2[1]!,
  m1[1] * m2[0]! + m1[3] * m2[1]!,
  m1[0] * m2[2]! + m1[2] * m2[3]!,
  m1[1] * m2[2]! + m1[3] * m2[3]!,
  m1[0] * m2[4]! + m1[2] * m2[5]! + m1[4],
  m1[1] * m2[4]! + m1[3] * m2[5]! + m1[5],
];

/** Recorre la lista de operaciones de la página y devuelve dónde se pintan imágenes. */
async function imageBoxes(page: PDFPageProxy): Promise<Box[]> {
  const { OPS } = await pdfjs();
  const ops = await page.getOperatorList();
  const vp = page.getViewport({ scale: 1 });
  const boxes: Box[] = [];
  let ctm: Matrix = [1, 0, 0, 1, 0, 0];
  const stack: Matrix[] = [];
  const paint = new Set<number>([OPS.paintImageXObject, OPS.paintInlineImageXObject, OPS.paintImageMaskXObject]);
  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i]!;
    const args = ops.argsArray[i] as unknown[] | null;
    if (fn === OPS.save || fn === OPS.beginGroup) stack.push([...ctm] as Matrix);
    else if (fn === OPS.restore || fn === OPS.endGroup || fn === OPS.paintFormXObjectEnd) ctm = stack.pop() ?? ctm;
    else if (fn === OPS.transform && args) ctm = mul(ctm, args as number[]);
    else if (fn === OPS.paintFormXObjectBegin) {
      stack.push([...ctm] as Matrix);
      const m = args?.[0] as number[] | null | undefined;
      if (m && m.length === 6) ctm = mul(ctm, m);
    } else if (paint.has(fn)) {
      const pts = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ].map(([u, v]) => [ctm[0] * u! + ctm[2] * v! + ctm[4], ctm[1] * u! + ctm[3] * v! + ctm[5]] as const);
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      const a = vp.convertToViewportPoint(Math.min(...xs), Math.min(...ys)) as number[];
      const c = vp.convertToViewportPoint(Math.max(...xs), Math.max(...ys)) as number[];
      const r = [a[0]!, a[1]!, c[0]!, c[1]!] as const;
      const x0 = Math.max(0, Math.min(r[0], r[2]));
      const y0 = Math.max(0, Math.min(r[1], r[3]));
      const x1 = Math.min(vp.width, Math.max(r[0], r[2]));
      const y1 = Math.min(vp.height, Math.max(r[1], r[3]));
      if (x1 > x0 && y1 > y0) boxes.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
    }
  }
  return boxes;
}

async function textItems(page: PDFPageProxy): Promise<{ items: PdfTextItem[]; chars: number }> {
  const { Util } = await pdfjs();
  const vp = page.getViewport({ scale: 1 });
  const tc = await page.getTextContent();
  const items: PdfTextItem[] = [];
  let chars = 0;
  for (const raw of tc.items) {
    if (!('str' in raw)) continue;
    const t = Util.transform(vp.transform, raw.transform) as number[];
    const [a, b, c, d, e, f] = t as Matrix;
    const fs = Math.hypot(c, d);
    chars += raw.str.replace(/\s/g, '').length;
    // Solo texto horizontal; el texto girado (sellos, márgenes) no entra al flujo.
    if (!(a > 0) || Math.abs(b) > 0.2 * Math.abs(a)) {
      if (raw.hasEOL && items.length) items.push({ str: '', x: e, y: f, w: 0, fs, eol: true });
      continue;
    }
    items.push({ str: raw.str, x: e, y: f, w: raw.width * (vp.scale || 1), fs, eol: raw.hasEOL });
  }
  return { items, chars };
}

let webpOk: boolean | null = null;
function imageType(): string {
  if (webpOk === null) {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    webpOk = c.toDataURL('image/webp').startsWith('data:image/webp');
  }
  return webpOk ? 'image/webp' : 'image/jpeg';
}

async function cropBoxes(page: PDFPageProxy, boxes: Box[]): Promise<Array<{ blob: Blob; w: number; h: number }>> {
  const scale = 2;
  const canvas = await renderPageToCanvas(page, scale);
  const out: Array<{ blob: Blob; w: number; h: number }> = [];
  for (const b of boxes) {
    const w = Math.round(b.w * scale);
    const h = Math.round(b.h * scale);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.getContext('2d')!.drawImage(canvas, Math.round(b.x * scale), Math.round(b.y * scale), w, h, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => c.toBlob(res, imageType(), 0.88));
    if (blob) out.push({ blob, w, h });
  }
  canvas.width = canvas.height = 0;
  return out;
}

async function resolveOutline(pdf: PDFDocumentProxy): Promise<Array<{ title: string; level: number; page: number }>> {
  const out: Array<{ title: string; level: number; page: number }> = [];
  let outline: Awaited<ReturnType<PDFDocumentProxy['getOutline']>> | null = null;
  try {
    outline = await pdf.getOutline();
  } catch {
    return out;
  }
  const walk = async (items: typeof outline, level: number) => {
    for (const it of items ?? []) {
      try {
        let dest = it.dest;
        if (typeof dest === 'string') dest = await pdf.getDestination(dest);
        if (Array.isArray(dest) && dest[0]) {
          const ref = dest[0];
          const page = typeof ref === 'number' ? ref : await pdf.getPageIndex(ref);
          const title = it.title.replace(/\s+/g, ' ').trim();
          if (title) out.push({ title, level, page });
        }
      } catch {
        /* destino roto: se omite */
      }
      if (level < 3 && it.items?.length) await walk(it.items, level + 1);
    }
  };
  await walk(outline, 1);
  return out;
}

const ENDS_SENTENCE = /[.!?:;»"”)…]$/;

function pageLabel(labels: string[] | null, i: number): string {
  const l = labels?.[i]?.trim();
  return l ? l : String(i + 1);
}

export function scanNotice(pageLabelText: string, state: 'pending' | 'failed' | 'low'): string {
  if (state === 'failed') return `Página ${escapeHtml(pageLabelText)}: no se pudo reconocer el texto. Consultá la página original.`;
  if (state === 'low') return '';
  return `Página ${escapeHtml(pageLabelText)}: es una imagen escaneada y todavía no se reconoció su texto.`;
}

export async function importPdf(id: string, file: File, onProgress: (p: ImportProgress) => void): Promise<ImportResult> {
  onProgress({ phase: 'read', done: 0, total: 1 });
  const pdf = await openPdf(await file.arrayBuffer());
  try {
    const n = pdf.numPages;
    let labels: string[] | null = null;
    try {
      labels = await pdf.getPageLabels();
    } catch {
      labels = null;
    }

    const pages: PageInfo[] = [];
    const pageLines: Array<{ lines: PdfLine[]; h: number }> = [];
    const figures: Box[][] = [];

    for (let i = 0; i < n; i++) {
      onProgress({ phase: 'analyze', done: i, total: n });
      const page = await pdf.getPage(i + 1);
      const vp = page.getViewport({ scale: 1 });
      const { items, chars } = await textItems(page);
      const boxes = await imageBoxes(page);
      const area = vp.width * vp.height;
      const biggest = boxes.reduce((m, b) => Math.max(m, (b.w * b.h) / area), 0);
      const kind: PageInfo['kind'] = chars >= 20 ? 'text' : biggest > 0.25 ? 'scan' : chars > 0 ? 'text' : 'blank';
      pages.push({ label: pageLabel(labels, i), w: vp.width, h: vp.height, kind, chars });
      pageLines.push({ lines: kind === 'text' ? groupLines(items) : [], h: vp.height });
      // Figuras: ni diminutas (viñetas, logos) ni fondos de página completa.
      figures.push(
        kind === 'text'
          ? boxes.filter((b) => {
              const r = (b.w * b.h) / area;
              return r > 0.012 && r < 0.7 && b.w > 36 && b.h > 36;
            })
          : [],
      );
      page.cleanup();
    }
    onProgress({ phase: 'analyze', done: n, total: n });

    markFurniture(pageLines);
    const bodyFs = bodyFontSize(pageLines.flatMap((p) => p.lines));
    const refWidth = typicalColumnWidth(
      pageLines.map((p) => p.lines),
      bodyFs,
    );

    // Párrafos por página, con las figuras intercaladas según su altura.
    type Item = { kind: 'para'; para: PdfPara } | { kind: 'fig'; box: Box; top: number };
    const perPage: Item[][] = [];
    for (let i = 0; i < n; i++) {
      if (pages[i]!.kind !== 'text') {
        perPage.push([]);
        continue;
      }
      const layout = buildParagraphs(pageLines[i]!.lines, bodyFs, refWidth);
      if (layout.orderDoubt) pages[i]!.orderDoubt = true;
      const items: Item[] = layout.paras.map((para) => ({ kind: 'para', para }));
      for (const box of figures[i]!) {
        const at = items.findIndex((it) => it.kind === 'para' && it.para.top > box.y + box.h * 0.5);
        const fig: Item = { kind: 'fig', box, top: box.y };
        if (at < 0) items.push(fig);
        else items.splice(at, 0, fig);
      }
      perPage.push(items);
    }

    // Recorte de figuras (solo en las páginas que las tienen).
    const assets: ImportResult['assets'] = [];
    const figAsset = new Map<Box, { key: string; w: number; h: number }>();
    const figPages = figures.map((f, i) => (f.length ? i : -1)).filter((i) => i >= 0);
    for (let k = 0; k < figPages.length; k++) {
      const i = figPages[k]!;
      onProgress({ phase: 'images', done: k, total: figPages.length });
      const page = await pdf.getPage(i + 1);
      const crops = await cropBoxes(page, figures[i]!);
      crops.forEach((c, j) => {
        const key = `${id}/p${i}-${j}`;
        assets.push({ key, blob: c.blob });
        figAsset.set(figures[i]![j]!, { key, w: c.w, h: c.h });
      });
      page.cleanup();
    }

    // Bloques finales. Un párrafo que sigue en la página siguiente se une.
    const blocks: Block[] = [];
    let figN = 0;
    for (let i = 0; i < n; i++) {
      const info = pages[i]!;
      if (info.kind === 'scan') {
        const html = scanNotice(info.label, 'pending');
        blocks.push({ t: 'notice', html, len: decodeText(html).length, page: i });
        continue;
      }
      perPage[i]!.forEach((it, idx) => {
        if (it.kind === 'fig') {
          const a = figAsset.get(it.box);
          if (a) blocks.push({ t: 'img', html: '', len: 0, page: i, img: a.key, w: a.w, h: a.h, alt: `Imagen ${++figN} (página ${info.label})` });
          return;
        }
        const { para } = it;
        const last = blocks[blocks.length - 1];
        const continues =
          idx === 0 &&
          para.kind === 'p' &&
          last?.t === 'p' &&
          last.page !== undefined &&
          (last.pb?.[last.pb.length - 1]?.[1] ?? last.page) === i - 1 &&
          (/[-\u2010]$/.test(last.html) || (!ENDS_SENTENCE.test(last.html) && /^\p{Ll}/u.test(para.text)));
        if (continues && last) {
          const prevText = decodeText(last.html);
          const joined = joinLines([prevText, para.text]);
          // Si se reconstruyó una palabra cortada, la página nueva empieza en esa palabra.
          const dehyphenated = joined.length === prevText.length - 1 + para.text.length;
          const boundary = dehyphenated ? prevText.length - 1 : prevText.length + 1;
          last.html = escapeHtml(joined);
          last.len = joined.length;
          (last.pb ??= []).push([boundary, i]);
          return;
        }
        blocks.push({ t: para.kind, html: escapeHtml(para.text), len: para.text.length, page: i });
      });
    }

    // Índice: marcadores del PDF o, si no hay, los títulos detectados.
    const outline = await resolveOutline(pdf);
    const toc: TocEntry[] = outline.length
      ? outline.map((o) => ({ title: o.title, level: o.level, page: o.page, b: firstBlockOfPage(blocks, o.page) }))
      : blocks
          .map((b, i) => ({ b, i }))
          .filter(({ b }) => b.t === 'h1' || b.t === 'h2')
          .map(({ b, i }) => ({ title: decodeText(b.html), level: b.t === 'h1' ? 1 : 2, b: i, page: b.page }));

    let title = '';
    try {
      const md = await pdf.getMetadata();
      const t = (md.info as Record<string, unknown> | undefined)?.['Title'];
      if (typeof t === 'string' && t.trim().length > 2 && !/^untitled|^microsoft word|\.docx?$|\.pdf$/i.test(t.trim())) title = t.trim();
    } catch {
      /* sin metadatos */
    }
    if (!title) title = stripExtension(file.name);

    const scanCount = pages.filter((p) => p.kind === 'scan').length;
    const textCount = pages.filter((p) => p.kind === 'text').length;
    const doubt = pages.map((p, i) => (p.orderDoubt ? i : -1)).filter((i) => i >= 0);
    const warnings: string[] = [];
    if (doubt.length) {
      warnings.push(
        `El orden de lectura podría no ser exacto en ${doubt.length === 1 ? 'la página' : 'las páginas'} ${listLabels(pages, doubt)} (texto en columnas, tablas o recuadros). Podés consultar la página original.`,
      );
    }
    if (scanCount) {
      warnings.push(
        scanCount === n
          ? 'Es un PDF escaneado: sus páginas son imágenes sin texto seleccionable. Para leerlo de a un renglón hay que reconocer el texto (OCR) en este dispositivo.'
          : `${scanCount} de ${n} páginas son imágenes escaneadas. Para leerlas de a un renglón hay que reconocer su texto (OCR).`,
      );
    }
    if (!scanCount && !blocks.some((b) => b.len > 0)) warnings.push('El PDF no contiene texto legible.');

    const meta: DocMeta = {
      id,
      name: file.name,
      title,
      kind: 'pdf',
      size: file.size,
      addedAt: Date.now(),
      pdfKind: scanCount === 0 ? 'text' : textCount === 0 ? 'scanned' : 'mixed',
      pages: pages.map((p) => (p.kind === 'scan' ? { ...p, ocr: { status: 'pending' } } : p)),
      textReady: scanCount === 0 && blocks.some((b) => b.len > 0),
      ocr: scanCount ? 'none' : undefined,
      toc,
      tocSource: outline.length ? 'outline' : 'headings',
      warnings,
      totalChars: blocks.reduce((s, b) => s + b.len, 0),
      blockCount: blocks.length,
    };
    return { meta, blocks, assets };
  } finally {
    closePdf(pdf);
  }
}

export function listLabels(pages: PageInfo[], idx: number[]): string {
  const labels = idx.slice(0, 12).map((i) => pages[i]!.label);
  const more = idx.length > 12 ? ` y ${idx.length - 12} más` : '';
  if (labels.length === 1) return labels[0]! + more;
  return labels.slice(0, -1).join(', ') + (more ? ', ' + labels[labels.length - 1] + more : ' y ' + labels[labels.length - 1]);
}

function decodeText(html: string): string {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent ?? '';
}

export function firstBlockOfPage(blocks: Block[], page: number): number | undefined {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]!;
    if (b.page !== undefined && b.page >= page) return i;
    if (b.pb?.some(([, p]) => p >= page)) return i;
  }
  return undefined;
}
