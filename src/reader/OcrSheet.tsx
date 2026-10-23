import { useEffect, useState } from 'preact/hooks';
import { t } from '../i18n';
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
  if (s < 60) return t('ocr.etaSeconds', { count: Math.max(5, Math.round(s / 5) * 5) });
  const m = Math.round(s / 60);
  return t('ocr.etaMinutes', { count: m });
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
          {mine.status === 'loading'
            ? t('ocr.preparing')
            : t('ocr.recognizing', { page: mine.pageLabel ?? '', progress: t('common.nOfTotal', { n: Math.min(mine.done + 1, mine.total), total: mine.total }) })}
        </p>
        <div class="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(frac * 100)}>
          <div class="progress-fill" style={{ width: `${Math.round(frac * 100)}%` }} />
        </div>
        <p class="ocr-sub">
          {t('common.percent', { n: Math.round(frac * 100) })} {mine.eta ? `· ${fmtEta(mine.eta)}` : ''}
        </p>
        <button class="btn btn-quiet" onClick={() => ocr.cancel()}>
          {t('ocr.stop')}
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
            <strong>{t('ocr.doneTitle')}</strong> {t('ocr.doneBody')}
          </p>
          {!compact && !!mine.failed?.length && (
            <p class="hint hint-warn">{t('ocr.failedPages', { count: mine.failed.length, pages: mine.failed.join(', ') })}</p>
          )}
          {!compact && !!mine.low?.length && <p class="hint hint-warn">{t('ocr.lowPages', { count: mine.low.length, pages: mine.low.join(', ') })}</p>}
        </div>
      )}
      {finished && mine.status === 'cancelled' && <p class="hint">{t('ocr.cancelled')}</p>}
      {finished && mine.status === 'error' && <p class="hint hint-warn">{t('ocr.error', { error: mine.error ?? '' })}</p>}
      {pending > 0 && (
        <>
          {!compact && (
            <p>
              {meta.pdfKind === 'scanned' ? t('ocr.intro.scanned') : t('ocr.intro.mixed', { count: pending })} {t('ocr.intro.body')}
            </p>
          )}
          <p class="privacy-note">
            <IconLock size={16} /> {t('ocr.privacy')}
          </p>
          <button class="btn btn-primary" data-testid="ocr-start" onClick={() => void ocr.start(meta.id)}>
            {t('ocr.start', { count: pending })}
          </button>
          <p class="hint">{t('ocr.limits')}</p>
        </>
      )}
    </div>
  );
}

export function OcrSheet({ meta, onClose }: { meta: DocMeta; onClose: () => void }) {
  return (
    <Sheet title={t('ocr.title')} onClose={onClose} testId="ocr-sheet">
      <OcrPanel meta={meta} />
    </Sheet>
  );
}
