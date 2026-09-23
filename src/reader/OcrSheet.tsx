import { useEffect, useState } from 'preact/hooks';
import { ocr, type OcrState } from '../import/ocr';
import { getDoc } from '../lib/db';
import type { DocMeta } from '../lib/types';
import { Sheet } from '../ui/Sheet';
import { IconLock } from '../ui/icons';

export function useOcrState(): OcrState | null {
  const [s, set] = useState<OcrState | null>(ocr.state);
  useEffect(() => ocr.subscribe(set), []);
  return s;
}

export const fmtEta = (s?: number) => {
  if (s === undefined || s <= 0) return '';
  if (s < 60) return `quedan unos ${Math.max(5, Math.round(s / 5) * 5)} s`;
  const m = Math.round(s / 60);
  return `quedan unos ${m} min`;
};

/** Explica el reconocimiento de texto, pide confirmación y muestra el avance. */
export function OcrPanel({ meta: initial, compact }: { meta: DocMeta; compact?: boolean }) {
  const st = useOcrState();
  const mine = st && st.docId === initial.id ? st : null;
  // El estado de las páginas cambia mientras avanza el OCR: se relee de la base.
  const [fresh, setFresh] = useState<DocMeta | null>(null);
  useEffect(() => {
    let alive = true;
    void getDoc(initial.id).then((m) => alive && m && setFresh(m));
    return () => {
      alive = false;
    };
  }, [initial.id, mine?.status, mine?.done]);
  const meta = fresh ?? initial;
  const pending = meta.pages?.filter((p) => p.ocr?.status === 'pending').length ?? 0;
  const running = mine && (mine.status === 'running' || mine.status === 'loading');

  if (running) {
    const frac = mine.total ? (mine.done + (mine.status === 'running' ? mine.pageProgress : 0)) / mine.total : 0;
    return (
      <div class="ocr-panel" data-testid="ocr-progress">
        <p class="ocr-line">
          {mine.status === 'loading' ? 'Preparando el reconocimiento de texto…' : `Reconociendo página ${mine.pageLabel ?? ''} (${Math.min(mine.done + 1, mine.total)} de ${mine.total})`}
        </p>
        <div class="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(frac * 100)}>
          <div class="progress-fill" style={{ width: `${Math.round(frac * 100)}%` }} />
        </div>
        <p class="ocr-sub">
          {Math.round(frac * 100)} % {mine.eta ? `· ${fmtEta(mine.eta)}` : ''}
        </p>
        <button class="btn btn-quiet" onClick={() => ocr.cancel()}>
          Detener (lo reconocido se conserva)
        </button>
      </div>
    );
  }

  const finished = mine && (mine.status === 'done' || mine.status === 'cancelled' || mine.status === 'error');
  return (
    <div class="ocr-panel">
      {finished && mine.status === 'done' && (
        <div class="ocr-result" data-testid="ocr-done">
          <p>
            <strong>Reconocimiento terminado.</strong> Ya podés leer en modo renglón.
          </p>
          {!!mine.failed?.length && <p class="hint hint-warn">Sin texto confiable en: página{mine.failed.length > 1 ? 's' : ''} {mine.failed.join(', ')}.</p>}
          {!!mine.low?.length && <p class="hint hint-warn">Reconocimiento dudoso en: página{mine.low.length > 1 ? 's' : ''} {mine.low.join(', ')}. Las palabras inciertas se subrayan con puntos.</p>}
        </div>
      )}
      {finished && mine.status === 'cancelled' && <p class="hint">Reconocimiento detenido. Lo reconocido hasta ahora quedó guardado.</p>}
      {finished && mine.status === 'error' && <p class="hint hint-warn">El reconocimiento falló: {mine.error}</p>}
      {pending > 0 && (
        <>
          {!compact && (
            <p>
              {meta.pdfKind === 'scanned' ? 'Este PDF es escaneado: sus páginas son imágenes.' : `${pending} páginas de este PDF son imágenes escaneadas.`} Para leerlas de a un renglón hay que reconocer el
              texto (OCR). Calculá unos segundos por página; en celulares antiguos, algo más.
            </p>
          )}
          <p class="privacy-note">
            <IconLock size={16} /> El reconocimiento se hace en este dispositivo. El documento no se envía a ningún servidor.
          </p>
          <button class="btn btn-primary" data-testid="ocr-start" onClick={() => void ocr.start(meta.id)}>
            Reconocer texto de {pending} {pending === 1 ? 'página' : 'páginas'}
          </button>
          <p class="hint">
            Limitaciones: el OCR funciona bien con páginas impresas, nítidas y derechas. Con manuscritos, fotos torcidas, baja resolución, poco contraste o varias columnas complejas puede equivocarse u omitir
            texto; en esos casos se avisa y podés consultar la página original.
          </p>
        </>
      )}
    </div>
  );
}

export function OcrSheet({ meta, onClose }: { meta: DocMeta; onClose: () => void }) {
  return (
    <Sheet title="Reconocer texto" onClose={onClose} testId="ocr-sheet">
      <OcrPanel meta={meta} />
    </Sheet>
  );
}
