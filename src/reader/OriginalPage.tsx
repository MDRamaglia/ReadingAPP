import { useEffect, useRef, useState } from 'preact/hooks';
import type { PDFDocumentProxy } from '../lib/pdfjs';
import type { PageInfo } from '../lib/types';
import { Sheet } from '../ui/Sheet';
import { IconZoomIn, IconZoomOut } from '../ui/icons';
import { PageCanvasCache } from './PdfBook';

/** Página original del PDF, para contrastar el orden de lectura o el OCR. */
export function OriginalPage({ pdf, pages, page: initial, onClose }: { pdf: PDFDocumentProxy; pages: PageInfo[]; page: number; onClose: () => void }) {
  const [page, setPage] = useState(initial);
  const [zoom, setZoom] = useState(1);
  const host = useRef<HTMLDivElement>(null);
  const cache = useRef(new PageCanvasCache(pdf, 4));
  const info = pages[page]!;

  useEffect(() => {
    const el = host.current!;
    const width = Math.min(el.clientWidth - 8, 900) * zoom;
    const height = (width * info.h) / info.w;
    let alive = true;
    el.classList.add('is-loading');
    void cache.current.get(page, width, height).then((canvas) => {
      if (!alive) return;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      el.querySelector('canvas')?.remove();
      el.appendChild(canvas);
      el.classList.remove('is-loading');
    });
    return () => {
      alive = false;
    };
  }, [page, zoom, info]);

  const notes: string[] = [];
  if (info.orderDoubt) notes.push('En esta página el orden de lectura extraído puede no coincidir con el visual (columnas, tablas o recuadros).');
  if (info.ocr?.status === 'low') notes.push(`Texto reconocido con confianza baja (${info.ocr.confidence ?? '?'} %). Compará con la imagen.`);
  if (info.ocr?.status === 'failed') notes.push('No se pudo reconocer texto confiable en esta página.');
  if (info.ocr?.status === 'pending') notes.push('Página escaneada todavía sin reconocer.');

  return (
    <Sheet title={`Página original ${info.label}`} onClose={onClose} wide testId="original-page">
      {notes.map((n) => (
        <p class="hint hint-warn" key={n}>
          {n}
        </p>
      ))}
      <div class="orig-tools">
        <button class="btn btn-quiet" disabled={page === 0} onClick={() => setPage(page - 1)}>
          ‹ Anterior
        </button>
        <span class="orig-count">
          {page + 1} / {pages.length}
        </span>
        <button class="btn btn-quiet" disabled={page >= pages.length - 1} onClick={() => setPage(page + 1)}>
          Siguiente ›
        </button>
        <span class="spacer" />
        <button class="icon-btn" aria-label="Alejar" disabled={zoom <= 1} onClick={() => setZoom(Math.max(1, zoom - 0.5))}>
          <IconZoomOut />
        </button>
        <button class="icon-btn" aria-label="Acercar" disabled={zoom >= 3} onClick={() => setZoom(Math.min(3, zoom + 0.5))}>
          <IconZoomIn />
        </button>
      </div>
      <div class="orig-view" ref={host} />
    </Sheet>
  );
}
