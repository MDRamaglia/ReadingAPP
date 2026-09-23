/**
 * Carga diferida de pdf.js (compilación «legacy», compatible con más
 * navegadores móviles). Todos sus recursos se sirven desde la propia app.
 */
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

type PdfJs = typeof import('pdfjs-dist/legacy/build/pdf.mjs');
export type PDFDocumentProxy = import('pdfjs-dist/legacy/build/pdf.mjs').PDFDocumentProxy;
export type PDFPageProxy = import('pdfjs-dist/legacy/build/pdf.mjs').PDFPageProxy;

let lib: Promise<PdfJs> | null = null;

export function pdfjs(): Promise<PdfJs> {
  lib ??= import('pdfjs-dist/legacy/build/pdf.mjs').then((m) => {
    m.GlobalWorkerOptions.workerSrc = workerUrl;
    return m;
  });
  return lib;
}

export const vendorUrl = (path: string) => new URL(`vendor/${path}`, document.baseURI).href;

export async function openPdf(data: ArrayBuffer): Promise<PDFDocumentProxy> {
  const m = await pdfjs();
  const task = m.getDocument({
    data: new Uint8Array(data),
    cMapUrl: vendorUrl('pdfjs/cmaps/'),
    cMapPacked: true,
    standardFontDataUrl: vendorUrl('pdfjs/standard_fonts/'),
    wasmUrl: vendorUrl('pdfjs/wasm/'),
    iccUrl: vendorUrl('pdfjs/iccs/'),
    enableXfa: false,
  });
  return task.promise;
}

/** Renderiza una página a un canvas nuevo con la escala indicada. */
export async function renderPageToCanvas(
  page: PDFPageProxy,
  scale: number,
  canvas: HTMLCanvasElement = document.createElement('canvas'),
): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  await page.render({ canvas, viewport, background: '#ffffff' }).promise;
  return canvas;
}

/** Libera el documento y su worker. */
export function closePdf(pdf: PDFDocumentProxy | null | undefined): void {
  if (pdf) void pdf.loadingTask.destroy();
}
