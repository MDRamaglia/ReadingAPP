import { useMemo, useState } from 'preact/hooks';
import { t } from '../i18n';
import type { DocMeta, Position, ReadMode } from '../lib/types';
import { Sheet } from '../ui/Sheet';

interface Props {
  meta: DocMeta;
  mode: ReadMode;
  /** Página visible (base 0) y total en el modo libro. */
  page?: number;
  pages?: number;
  currentBlock: number;
  pageOfEntry: (b: number | undefined, page: number | undefined) => number | null;
  onGoPage: (page: number) => void;
  onGoPos: (pos: Position, page?: number) => void;
  onGoPct?: (pct: number) => void;
  pct: number;
  onClose: () => void;
}

export function TocSheet({ meta, mode, page, pages, currentBlock, pageOfEntry, onGoPage, onGoPos, onGoPct, pct, onClose }: Props) {
  const pdf = meta.kind === 'pdf';
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const hasPages = pdf || mode === 'book';
  const total = pdf ? (meta.pages?.length ?? 0) : (pages ?? 0);

  const submit = (e: Event) => {
    e.preventDefault();
    const v = value.trim().toLowerCase();
    if (!v) return;
    let idx = -1;
    if (pdf) {
      // Primero la numeración original del PDF («xii», «25»), después el orden físico.
      idx = meta.pages!.findIndex((p) => p.label.toLowerCase() === v);
      if (idx < 0 && /^\d+$/.test(v)) idx = Number(v) - 1;
    } else if (/^\d+$/.test(v)) {
      idx = Number(v) - 1;
    }
    if (idx < 0 || idx >= total) {
      setError(pdf ? t('toc.noPage', { page: value }) : t('toc.range', { total }));
      return;
    }
    onGoPage(idx);
    onClose();
  };

  const entries = useMemo(
    () =>
      meta.toc.map((t) => {
        const p = mode === 'book' || pdf ? pageOfEntry(t.b, t.page) : null;
        const label = p === null ? '' : pdf ? (meta.pages?.[p]?.label ?? String(p + 1)) : String(p + 1);
        return { ...t, pageIndex: p, label };
      }),
    [meta, mode, pageOfEntry, pdf],
  );

  let current = -1;
  entries.forEach((t, i) => {
    if (t.b !== undefined && t.b <= currentBlock) current = i;
    else if (mode === 'book' && pdf && t.page !== undefined && page !== undefined && t.page <= page) current = i;
  });

  return (
    <Sheet title={t('toc.title')} onClose={onClose} wide testId="toc-sheet">
      {hasPages && total > 0 && (
        <form class="goto" onSubmit={submit}>
          <label for="goto-page">
            {t('toc.page')}{' '}
            {page !== undefined && mode === 'book' && <small>{t('toc.youAreAt', { page: (pdf ? meta.pages?.[page]?.label : page + 1) ?? '' })}</small>}
          </label>
          <div class="goto-row">
            <input
              id="goto-page"
              inputMode={pdf ? 'text' : 'numeric'}
              autoComplete="off"
              placeholder={pdf ? `${meta.pages?.[0]?.label ?? 1} – ${meta.pages?.[total - 1]?.label ?? total}` : `1 – ${total}`}
              value={value}
              onInput={(e) => {
                setValue((e.target as HTMLInputElement).value);
                setError('');
              }}
            />
            <button class="btn" type="submit">
              {t('toc.go')}
            </button>
          </div>
          {error && <p class="field-error">{error}</p>}
        </form>
      )}
      {!hasPages && onGoPct && (
        <label class="field">
          <span class="field-label">
            {t('toc.progress')} <small>{t('common.percent', { n: Math.round(pct * 100) })}</small>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(pct * 100)}
            onChange={(e) => onGoPct(Number((e.target as HTMLInputElement).value) / 100)}
            aria-label={t('toc.pctLabel')}
          />
        </label>
      )}
      {entries.length > 0 ? (
        <nav class="toc" aria-label={t('toc.sections')}>
          <h3 class="toc-title">{t('toc.sections')}</h3>
          <ol>
            {entries.map((t, i) => (
              <li key={i} class={`toc-l${Math.min(t.level, 3)}${i === current ? ' is-current' : ''}`}>
                <button
                  onClick={() => {
                    if (t.b !== undefined) onGoPos({ b: t.b, o: 0, page: t.page }, t.page);
                    else if (t.page !== undefined) onGoPage(t.page);
                    onClose();
                  }}
                >
                  <span class="toc-text">{t.title}</span>
                  {t.label && <span class="toc-page">{t.label}</span>}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      ) : (
        <p class="hint">{t('toc.empty')}</p>
      )}
    </Sheet>
  );
}
