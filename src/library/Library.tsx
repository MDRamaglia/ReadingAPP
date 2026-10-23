/**
 * Biblioteca: documentos cargados, su avance y la carga de archivos nuevos.
 * Con sesión muestra los documentos de la cuenta; sin sesión, los cargados
 * sin cuenta en este dispositivo. La cantidad se cuenta contra el límite del
 * plan (config/plans.ts).
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { fmtNumber, t, type Key } from '../i18n';
import { importFile } from '../import';
import { ocr } from '../import/ocr';
import { ImportError, type ImportProgress, type ImportResult } from '../import/types';
import { libraryUsage, planOf, type LibraryUsage } from '../lib/access';
import { claimDeviceDocs, deleteDoc, getDoc, listDocs, progressFor } from '../lib/db';
import type { DocMeta, Progress } from '../lib/types';
import { OcrPanel, useOcrState } from '../reader/OcrSheet';
import { useAccount } from '../services/account';
import { ServiceError, isServiceError } from '../services/errors';
import { Sheet } from '../ui/Sheet';
import { IconLock, IconPlus, IconSpark, IconTrash, IconWarn } from '../ui/icons';

const PHASES: Record<ImportProgress['phase'], Key> = {
  read: 'import.phase.read',
  convert: 'import.phase.convert',
  analyze: 'import.phase.analyze',
  images: 'import.phase.images',
  save: 'import.phase.save',
};

function kindLabel(d: DocMeta): string {
  if (d.kind === 'docx') return t('library.kind.word');
  if (d.pdfKind === 'scanned') return d.ocr === 'done' ? t('library.kind.scannedDone') : t('library.kind.scanned');
  if (d.pdfKind === 'mixed') return t('library.kind.mixed');
  return t('library.kind.text');
}

function ago(ts?: number): string {
  if (!ts) return '';
  const s = (Date.now() - ts) / 1000;
  if (s < 90) return t('time.justNow');
  if (s < 3600) return t('time.minutesAgo', { count: Math.round(s / 60) });
  if (s < 86400) return t('time.hoursAgo', { count: Math.round(s / 3600) });
  const d = Math.round(s / 86400);
  return d === 1 ? t('time.yesterday') : t('time.daysAgo', { count: d });
}

const fmtSize = (n: number) =>
  n < 1024 * 1024
    ? t('units.kb', { n: fmtNumber(Math.max(1, Math.round(n / 1024))) })
    : t('units.mb', { n: fmtNumber(n / 1024 / 1024, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) });

interface ImportState {
  name: string;
  progress?: ImportProgress;
  result?: ImportResult;
  error?: { message: string; help?: string; limit?: boolean };
}

function limitMessage(u: LibraryUsage): { message: string; help: string } {
  return {
    message: t('library.limit.reached', { count: u.limit ?? 0 }),
    help: u.over ? t('library.limit.overHelp', { count: u.count, limit: u.limit ?? 0 }) : t('library.limit.help'),
  };
}

export function Library({ onOpen }: { onOpen: (id: string) => void }) {
  const { user, ready } = useAccount();
  const owner = user?.id ?? null;
  const [docs, setDocs] = useState<DocMeta[] | null>(null);
  const [deviceDocs, setDeviceDocs] = useState(0);
  const [progress, setProgress] = useState<Map<string, Progress>>(new Map());
  const [imp, setImp] = useState<ImportState | null>(null);
  const [confirm, setConfirm] = useState<DocMeta | null>(null);
  const [drag, setDrag] = useState(false);
  const [usage, setUsage] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const ocrState = useOcrState();

  const refresh = async () => {
    const list = await listDocs(owner);
    setDocs(list);
    setDeviceDocs(owner ? (await listDocs(null)).length : 0);
    setProgress(await progressFor(list.map((d) => d.id)));
    try {
      const est = await navigator.storage?.estimate?.();
      if (est?.usage) setUsage(fmtSize(est.usage));
    } catch {
      /* sin estimación */
    }
  };

  useEffect(() => {
    if (ready) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, owner]);

  const quota = libraryUsage(docs?.length ?? 0, planOf(user));
  // Lugar libre del plan (null: sin límite de cantidad).
  const room = quota.limit === null ? null : Math.max(0, quota.limit - quota.count);
  // Límite del plan: se vuelve a contar al empezar y justo antes de guardar.
  const checkLimit = async () => {
    const u = libraryUsage((await listDocs(owner)).length, planOf(user));
    if (u.full) throw new ServiceError('limit', limitMessage(u).message);
  };
  // El OCR en segundo plano cambia el estado de los documentos.
  useEffect(() => {
    if (!ocrState || ocrState.done === 0) return;
    void refresh();
    // La hoja de importación abierta muestra los avisos actualizados.
    const id = ocrState.docId;
    void getDoc(id).then((m) => m && setImp((s) => (s?.result?.meta.id === id ? { ...s, result: { ...s.result, meta: m } } : s)));
  }, [ocrState?.status, ocrState?.done]);

  const handleFiles = async (files: FileList | File[] | null) => {
    const file = files?.[0];
    if (!file) return;
    setImp({ name: file.name });
    try {
      const result = await importFile(file, (p) => setImp((s) => (s ? { ...s, progress: p } : s)), { ownerId: owner ?? undefined, checkLimit });
      setImp({ name: file.name, result });
      await refresh();
    } catch (e) {
      const err = isServiceError(e, 'limit')
        ? { ...limitMessage(libraryUsage((await listDocs(owner)).length, planOf(user))), limit: true }
        : e instanceof ImportError
          ? { message: e.message, help: e.help }
          : { message: (e as Error).message ?? String(e) };
      setImp({ name: file.name, error: err });
    } finally {
      if (input.current) input.current.value = '';
    }
  };

  const recent = docs?.find((d) => d.openedAt && progress.get(d.id));
  const recentP = recent ? progress.get(recent.id) : undefined;

  return (
    <div
      class={`library${drag ? ' is-drag' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        void handleFiles(e.dataTransfer?.files ?? null);
      }}
    >
      <div class="lib-main">
        <div class="lib-title-row">
          <h1 class="page-title">{t('library.title')}</h1>
          <span class={`lib-count${quota.full ? ' is-full' : ''}`} data-testid="library-count">
            {quota.label}
          </span>
        </div>

        {owner && deviceDocs > 0 && (
          <div class="notice" data-testid="claim-docs">
            <p>
              {t('library.claim.found', { count: deviceDocs })}
              {room === 0 && ` ${t('library.claim.noRoom', { count: quota.limit ?? 0 })}`}
              {room !== null && room > 0 && room < deviceDocs && ` ${t('library.claim.someRoom', { count: room })}`}
            </p>
            {room !== 0 && (
              <button
                class="btn"
                onClick={async () => {
                  await claimDeviceDocs(owner, room);
                  await refresh();
                }}
                data-testid="claim-docs-btn"
              >
                {room !== null && room < deviceDocs ? t('library.claim.addSome', { count: room }) : t('library.claim.addAll')}
              </button>
            )}
          </div>
        )}

        {recent && recentP && (
          <section class="continue" aria-label={t('library.continue')}>
            <button class="continue-card" onClick={() => onOpen(recent.id)} data-testid="continue-card">
              <span class="continue-kicker">{t('library.continue')}</span>
              <span class="continue-title">{recent.title}</span>
              {recentP.snippet && <span class="continue-snippet">«{recentP.snippet}»</span>}
              <span class="continue-meta">
                {t('common.percent', { n: Math.round(recentP.pct * 100) })}
                {recentP.pageLabel ? ` · ${t('reader.pageShort', { page: recentP.pageLabel })}` : ''} · {ago(recentP.updatedAt)}
              </span>
            </button>
          </section>
        )}

        <section class="add">
          <input
            ref={input}
            type="file"
            accept=".docx,.pdf,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
            class="visually-hidden"
            id="file-input"
            data-testid="file-input"
            onChange={(e) => void handleFiles((e.target as HTMLInputElement).files)}
          />
          <label for="file-input" class="btn btn-primary btn-add">
            <IconPlus /> {t('library.add')}
          </label>
          <p class="add-hint">
            {t('library.addHint')} {matchMedia('(pointer:fine)').matches ? t('library.dragHint') : ''}
          </p>
        </section>
        {quota.full && (
          <p class="limit-note" data-testid="limit-note">
            <IconSpark size={16} />{' '}
            {quota.over ? t('library.limit.overNote', { count: quota.count, limit: quota.limit ?? 0 }) : t('library.limit.fullNote', { count: quota.limit ?? 0 })}{' '}
            <a href="#/planes">{t('library.seePremium')}</a>
          </p>
        )}

        <section class="shelf" aria-label={t('nav.library')}>
          {docs && docs.length === 0 && (
            <div class="empty">
              <p class="empty-title">{t('library.empty')}</p>
              <p>{t('library.emptyHint')}</p>
              {quota.limit !== null && <p class="muted">{t('library.emptyLimit', { count: quota.limit })}</p>}
            </div>
          )}
          <ul class="doc-list">
            {docs?.map((d) => {
              const p = progress.get(d.id);
              const pct = Math.round((p?.pct ?? 0) * 100);
              const busy = ocrState?.docId === d.id && (ocrState.status === 'running' || ocrState.status === 'loading');
              return (
                <li key={d.id} class="doc" data-testid="doc-item">
                  <button class="doc-open" onClick={() => onOpen(d.id)}>
                    <span class={`doc-badge doc-${d.kind}`}>{d.kind === 'docx' ? 'W' : 'PDF'}</span>
                    <span class="doc-info">
                      <span class="doc-title">{d.title}</span>
                      <span class="doc-meta">
                        {kindLabel(d)}
                        {d.pages ? ` · ${t('library.pagesShort', { count: d.pages.length })}` : ''} · {fmtSize(d.size)}
                        {busy ? ` · ${t('library.ocrRunning')}` : ''}
                      </span>
                      <span class="doc-progress">
                        <span class="bar">
                          <span style={{ width: `${pct}%` }} />
                        </span>
                        <span class="doc-pct">{p ? t('common.percent', { n: pct }) : t('library.notStarted')}</span>
                      </span>
                    </span>
                  </button>
                  <button class="icon-btn doc-del" aria-label={t('library.deleteLabel', { title: d.title })} onClick={() => setConfirm(d)} data-testid="doc-delete">
                    <IconTrash />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <footer class="lib-foot">
        <p>
          <IconLock size={15} /> {t('library.privacy')}
          {usage && ` ${t('library.usage', { size: usage })}`}
        </p>
      </footer>

      {imp && (
        <Sheet
          title={imp.result ? t('import.done') : imp.error ? t('import.failed') : t('import.loading')}
          onClose={imp.result || imp.error ? () => setImp(null) : undefined}
          testId="import-sheet"
        >
          <p class="imp-name">{imp.name}</p>
          {!imp.result && !imp.error && (
            <div data-testid="import-progress">
              <p class="ocr-line">
                {imp.progress ? t(PHASES[imp.progress.phase]) : t('import.phase.prepare')}
                {imp.progress && imp.progress.total > 1 ? ` (${t('common.nOfTotal', { n: Math.min(imp.progress.done + 1, imp.progress.total), total: imp.progress.total })})` : '…'}
              </p>
              <div class="progress">
                <div class="progress-fill" style={{ width: `${imp.progress && imp.progress.total ? Math.round((imp.progress.done / imp.progress.total) * 100) : 5}%` }} />
              </div>
            </div>
          )}
          {imp.error && (
            <div class="imp-error" data-testid="import-error">
              <p class="hint-warn">
                <IconWarn size={16} /> {imp.error.message}
              </p>
              {imp.error.help && <p>{imp.error.help}</p>}
              <div class="row-end">
                <button class="btn" onClick={() => setImp(null)}>
                  {t('common.understood')}
                </button>
                {imp.error.limit && (
                  <a class="btn btn-primary" href="#/planes" onClick={() => setImp(null)} data-testid="limit-plans">
                    {t('library.seePremium')}
                  </a>
                )}
              </div>
            </div>
          )}
          {imp.result && (
            <div class="imp-result" data-testid="import-result">
              <p class="imp-kind">
                <strong>{imp.result.meta.title}</strong>
                <br />
                {kindLabel(imp.result.meta)}
                {imp.result.meta.pages ? ` · ${t('library.pages', { count: imp.result.meta.pages.length })}` : ''}
              </p>
              {imp.result.meta.warnings.map((w) => (
                <p class="hint hint-warn" key={w}>
                  <IconWarn size={15} /> {w}
                </p>
              ))}
              {imp.result.meta.pages?.some((p) => p.kind === 'scan') && <OcrPanel meta={imp.result.meta} compact />}
              <button
                class="btn btn-primary btn-block"
                data-testid="import-open"
                onClick={() => {
                  const id = imp.result!.meta.id;
                  setImp(null);
                  onOpen(id);
                }}
              >
                {t('common.open')}
              </button>
            </div>
          )}
        </Sheet>
      )}

      {confirm && (
        <Sheet title={t('library.delete.title')} onClose={() => setConfirm(null)} testId="delete-sheet">
          <p>
            {t('library.delete.before')} <strong>{confirm.title}</strong> {t('library.delete.after')}
          </p>
          <div class="row-end">
            <button class="btn btn-quiet" onClick={() => setConfirm(null)}>
              {t('common.cancel')}
            </button>
            <button
              class="btn btn-danger"
              data-testid="confirm-delete"
              onClick={async () => {
                const id = confirm.id;
                setConfirm(null);
                if (ocr.isRunning(id)) ocr.cancel();
                await deleteDoc(id);
                await refresh();
              }}
            >
              {t('common.delete')}
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
