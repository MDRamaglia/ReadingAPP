/**
 * Reconocimiento de texto (OCR) de páginas escaneadas con Tesseract,
 * ejecutado íntegramente en el navegador. El núcleo WASM y el modelo de
 * español se sirven desde la propia app: no se envía nada a ningún servidor.
 */
import type Tesseract from 'tesseract.js';
import { getDoc, getFile, getBlocks, putBlocks, putDoc } from '../lib/db';
import { closePdf, openPdf, renderPageToCanvas, vendorUrl } from '../lib/pdfjs';
import { escapeHtml } from '../lib/text';
import type { Block, DocMeta, OcrPageStatus } from '../lib/types';
import { firstBlockOfPage, listLabels, scanNotice } from './pdf';

export interface OcrState {
  docId: string;
  title: string;
  status: 'loading' | 'running' | 'done' | 'cancelled' | 'error';
  /** Páginas terminadas y total a procesar en esta tanda. */
  done: number;
  total: number;
  /** Página en curso (etiqueta original) y avance dentro de ella (0 a 1). */
  pageLabel?: string;
  pageProgress: number;
  /** Segundos restantes estimados. */
  eta?: number;
  error?: string;
  /** Resumen al terminar. */
  low?: string[];
  failed?: string[];
}

type Listener = (s: OcrState | null) => void;

const LOW_CONFIDENCE = 70;
const FAIL_CONFIDENCE = 45;
const UNSURE_WORD = 55;

interface TWord {
  text: string;
  confidence: number;
}
interface TLine {
  words: TWord[];
  bbox: Tesseract.Bbox;
  baseline?: Tesseract.Baseline;
  rowAttributes?: Partial<Tesseract.RowAttributes>;
}
interface TPara {
  lines: TLine[];
  confidence: number;
}
interface TBlock {
  paragraphs: TPara[];
  blocktype?: string;
}

const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[s.length >> 1]!;
};

const quantile = (xs: number[], q: number) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.round(q * (s.length - 1))]!;
};

interface OcrLine {
  words: TWord[];
  x0: number;
  x1: number;
  base: number;
  h: number;
  blk: number;
  heading: boolean;
}

const ENDS_SENTENCE = /[.!?:;»"”)…]$/;

/**
 * Convierte el resultado de Tesseract en bloques de lectura. Tesseract suele
 * fundir párrafos sin sangría en uno solo, así que los párrafos y títulos se
 * rearman con la geometría de cada renglón: separación vertical, altura de la
 * letra, sangría y renglones cortos que cierran una oración.
 */
export function ocrToBlocks(data: { blocks?: TBlock[] | null }, page: number): Block[] {
  const lines: OcrLine[] = [];
  (data.blocks ?? []).forEach((blk, bi) => {
    if (/IMAGE|LINE|NOISE/.test(blk.blocktype ?? '')) return;
    for (const para of blk.paragraphs) {
      for (const line of para.lines) {
        const words = line.words.map((w) => ({ text: w.text.trim(), confidence: w.confidence })).filter((w) => w.text);
        if (!words.length) continue;
        const h = line.rowAttributes?.rowHeight || line.bbox.y1 - line.bbox.y0;
        const base = line.baseline ? Math.max(line.baseline.y0, line.baseline.y1) : line.bbox.y1;
        lines.push({ words, x0: line.bbox.x0, x1: line.bbox.x1, base, h, blk: bi, heading: blk.blocktype === 'HEADING_TEXT' });
      }
    }
  });
  if (!lines.length) return [];

  const medH = median(lines.map((l) => l.h)) || 1;
  const pitches: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    const d = lines[i]!.base - lines[i - 1]!.base;
    if (d > 0 && d < 3 * medH && Math.abs(lines[i]!.h - lines[i - 1]!.h) < 0.25 * medH) pitches.push(d);
  }
  const pitch = median(pitches) || medH * 1.3;
  const body = lines.filter((l) => Math.abs(l.h - medH) < 0.25 * medH);
  const colLeft = quantile(
    body.map((l) => l.x0),
    0.1,
  );
  const colRight = quantile(
    body.map((l) => l.x1),
    0.9,
  );
  const colW = Math.max(1, colRight - colLeft);

  const groups: OcrLine[][] = [];
  let cur: OcrLine[] = [];
  lines.forEach((l, i) => {
    const p = lines[i - 1];
    let brk = false;
    if (p) {
      const d = l.base - p.base;
      const text = p.words[p.words.length - 1]!.text;
      if (l.blk !== p.blk && (d > 1.2 * pitch || d < 0)) brk = true;
      else if (d < -0.5 * medH || d > 1.4 * pitch) brk = true;
      else if (Math.abs(l.h - p.h) > 0.28 * Math.max(l.h, p.h)) brk = true;
      else if (p.x1 < colRight - 0.15 * colW && ENDS_SENTENCE.test(text)) brk = true;
      else if (l.x0 > colLeft + 1.2 * medH && p.x0 < colLeft + 0.6 * medH && ENDS_SENTENCE.test(text)) brk = true;
    }
    if (brk && cur.length) {
      groups.push(cur);
      cur = [];
    }
    cur.push(l);
  });
  if (cur.length) groups.push(cur);

  const out: Block[] = [];
  for (const g of groups) {
    // Palabras del párrafo, uniendo las cortadas con guion a fin de renglón.
    const words: TWord[] = [];
    g.forEach((line, li) => {
      line.words.forEach((w, wi) => {
        const prev = words[words.length - 1];
        if (wi === 0 && li > 0 && prev && /\p{L}[-\u2010\u00AD]$/u.test(prev.text) && /^\p{Ll}/u.test(w.text)) {
          prev.text = prev.text.slice(0, -1) + w.text;
          prev.confidence = Math.min(prev.confidence, w.confidence);
        } else {
          words.push({ ...w });
        }
      });
    });
    const text = words.map((w) => w.text).join(' ');
    const conf = words.reduce((s, w) => s + w.confidence, 0) / words.length;
    const letters = (text.match(/\p{L}/gu) ?? []).length;
    // Ruido típico de manchas o ilustraciones: pocos caracteres y casi sin letras.
    if (conf < 40 && letters < text.length * 0.5) continue;
    if (text.length <= 2 && conf < 60) continue;
    const html = words
      .map((w) => (w.confidence < UNSURE_WORD ? `<span class="unsure">${escapeHtml(w.text)}</span>` : escapeHtml(w.text)))
      .join(' ');
    const h = median(g.map((l) => l.h));
    const heading = (h >= 1.3 * medH || (g[0]!.heading && h >= 1.1 * medH)) && text.length < 160 && g.length <= 3;
    out.push({ t: heading ? 'h2' : 'p', html, len: text.length, page, unsure: conf < LOW_CONFIDENCE || undefined });
  }
  return out;
}

/** Una página prácticamente uniforme (en blanco) no necesita OCR. */
function isBlank(canvas: HTMLCanvasElement): boolean {
  const s = document.createElement('canvas');
  s.width = 120;
  s.height = 160;
  const ctx = s.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(canvas, 0, 0, s.width, s.height);
  const d = ctx.getImageData(0, 0, s.width, s.height).data;
  let sum = 0;
  let sq = 0;
  const n = d.length / 4;
  for (let i = 0; i < d.length; i += 4) {
    const y = 0.299 * d[i]! + 0.587 * d[i + 1]! + 0.114 * d[i + 2]!;
    sum += y;
    sq += y * y;
  }
  const mean = sum / n;
  return Math.sqrt(Math.max(0, sq / n - mean * mean)) < 3;
}

/** Reemplaza los bloques de una página manteniendo el orden del documento. */
function replacePageBlocks(all: Block[], page: number, fresh: Block[]): Block[] {
  const before = all.filter((b) => (b.page ?? 0) < page);
  const after = all.filter((b) => (b.page ?? 0) > page);
  return [...before, ...fresh, ...after];
}

function refreshMeta(meta: DocMeta, blocks: Block[]): void {
  const pages = meta.pages ?? [];
  const pending = pages.filter((p) => p.ocr?.status === 'pending').length;
  const scans = pages.filter((p) => p.kind === 'scan').length;
  meta.ocr = pending === 0 ? 'done' : pending < scans ? 'partial' : 'none';
  meta.textReady = blocks.some((b) => b.len > 0 && b.t !== 'notice');
  meta.totalChars = blocks.reduce((s, b) => s + b.len, 0);
  meta.blockCount = blocks.length;

  const idx = (st: OcrPageStatus) => pages.map((p, i) => (p.ocr?.status === st ? i : -1)).filter((i) => i >= 0);
  const low = idx('low');
  const failed = idx('failed');
  meta.warnings = meta.warnings.filter((w) => !w.startsWith('Reconocimiento') && !w.includes('escaneada'));
  if (pending) {
    meta.warnings.push(`${pending} ${pending === 1 ? 'página escaneada sigue' : 'páginas escaneadas siguen'} sin reconocer.`);
  }
  if (failed.length) {
    meta.warnings.push(
      `Reconocimiento fallido en ${failed.length === 1 ? 'la página' : 'las páginas'} ${listLabels(pages, failed)}: no se obtuvo texto confiable. Consultá la página original.`,
    );
  }
  if (low.length) {
    meta.warnings.push(
      `Reconocimiento dudoso en ${low.length === 1 ? 'la página' : 'las páginas'} ${listLabels(pages, low)}: puede haber palabras mal leídas (se marcan con subrayado punteado).`,
    );
  }

  // Índice: los marcadores del PDF se reubican en los bloques nuevos; si el
  // PDF no tenía marcadores, se arma con los títulos reconocidos.
  if (meta.tocSource === 'outline') {
    meta.toc = meta.toc.map((t) => ({ ...t, b: t.page !== undefined ? firstBlockOfPage(blocks, t.page) : t.b }));
  } else {
    meta.toc = blocks
      .map((b, i) => ({ b, i }))
      .filter(({ b }) => b.t === 'h1' || b.t === 'h2')
      .map(({ b, i }) => {
        const d = document.createElement('div');
        d.innerHTML = b.html;
        return { title: (d.textContent ?? '').trim(), level: b.t === 'h1' ? 1 : 2, b: i, page: b.page };
      });
  }
}

class OcrService {
  state: OcrState | null = null;
  private listeners = new Set<Listener>();
  private cancelRequested = false;
  private worker: Tesseract.Worker | null = null;

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.state);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit(patch: Partial<OcrState>) {
    if (!this.state) return;
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l(this.state));
  }

  isRunning(docId?: string): boolean {
    return !!this.state && (this.state.status === 'running' || this.state.status === 'loading') && (!docId || this.state.docId === docId);
  }

  dismiss(): void {
    if (this.isRunning()) return;
    this.state = null;
    this.listeners.forEach((l) => l(null));
  }

  cancel(): void {
    this.cancelRequested = true;
    void this.worker?.terminate();
  }

  async start(docId: string): Promise<void> {
    if (this.isRunning()) return;
    const meta = await getDoc(docId);
    const file = await getFile(docId);
    if (!meta || !file || !meta.pages) return;
    const todo = meta.pages.map((p, i) => (p.ocr?.status === 'pending' ? i : -1)).filter((i) => i >= 0);
    this.cancelRequested = false;
    this.state = { docId, title: meta.title, status: 'loading', done: 0, total: todo.length, pageProgress: 0 };
    this.emit({});
    if (!todo.length) {
      this.emit({ status: 'done' });
      return;
    }

    const pdf = await openPdf(await file.arrayBuffer());
    try {
      const { createWorker, OEM } = await import('tesseract.js');
      this.worker = await createWorker('spa', OEM.LSTM_ONLY, {
        workerPath: vendorUrl('tesseract/worker.min.js'),
        corePath: vendorUrl('tesseract/core/'),
        langPath: vendorUrl('tesseract/lang/'),
        workerBlobURL: false,
        gzip: true,
        logger: (m) => {
          if (m.status === 'recognizing text') this.emit({ pageProgress: m.progress });
        },
      });
      this.emit({ status: 'running' });
      const started = performance.now();
      let processed = 0;

      for (const i of todo) {
        if (this.cancelRequested) break;
        const info = meta.pages[i]!;
        this.emit({ pageLabel: info.label, pageProgress: 0 });
        const page = await pdf.getPage(i + 1);
        const vp = page.getViewport({ scale: 1 });
        // Unos 200-300 ppp: suficiente para Tesseract sin agotar la memoria del celular.
        const scale = Math.max(1.5, Math.min(3.5, 2400 / Math.max(vp.width, vp.height)));
        const canvas = await renderPageToCanvas(page, scale);
        page.cleanup();

        let fresh: Block[] = [];
        let status: OcrPageStatus;
        let confidence: number | undefined;
        let words = 0;
        if (isBlank(canvas)) {
          status = 'blank';
        } else {
          await this.worker.setParameters({ user_defined_dpi: String(Math.round(72 * scale)) });
          const { data } = await this.worker.recognize(canvas, {}, { text: true, blocks: true });
          fresh = ocrToBlocks(data as unknown as { blocks: TBlock[] }, i);
          confidence = Math.round(data.confidence);
          words = fresh.reduce((s, b) => s + (b.html.match(/\S+/g)?.length ?? 0), 0);
          const chars = fresh.reduce((s, b) => s + b.len, 0);
          status = chars < 12 || confidence < FAIL_CONFIDENCE ? 'failed' : confidence < LOW_CONFIDENCE ? 'low' : 'ok';
          if (status === 'failed' && chars < 12) fresh = [];
        }
        canvas.width = canvas.height = 0;
        if (this.cancelRequested) break;
        if (status === 'failed') {
          const html = scanNotice(info.label, 'failed');
          const d = document.createElement('div');
          d.innerHTML = html;
          fresh = [{ t: 'notice', html, len: (d.textContent ?? '').length, page: i }, ...fresh];
        }

        // Guardado incremental: si se cierra la app, lo reconocido no se pierde.
        const current = await getDoc(docId);
        if (!current?.pages) break;
        current.pages[i] = { ...current.pages[i]!, ocr: { status, confidence, words } };
        const blocks = replacePageBlocks(await getBlocks(docId), i, fresh);
        refreshMeta(current, blocks);
        await putBlocks(docId, blocks);
        await putDoc(current);

        processed++;
        const per = (performance.now() - started) / processed / 1000;
        this.emit({ done: processed, eta: Math.round(per * (todo.length - processed)) });
      }

      const final = await getDoc(docId);
      const pages = final?.pages ?? [];
      const labelsOf = (st: OcrPageStatus) => pages.filter((p) => p.ocr?.status === st).map((p) => p.label);
      this.emit({
        status: this.cancelRequested ? 'cancelled' : 'done',
        low: labelsOf('low'),
        failed: labelsOf('failed'),
        eta: 0,
      });
    } catch (e) {
      this.emit({
        status: this.cancelRequested ? 'cancelled' : 'error',
        error: this.cancelRequested ? undefined : ((e as Error)?.message ?? String(e)),
      });
    } finally {
      try {
        await this.worker?.terminate();
      } catch {
        /* ya terminado */
      }
      this.worker = null;
      closePdf(pdf);
    }
  }
}

export const ocr = new OcrService();
