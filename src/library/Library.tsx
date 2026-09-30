/**
 * Biblioteca: documentos cargados, su avance y la carga de archivos nuevos.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { importFile } from '../import';
import { ocr } from '../import/ocr';
import { ImportError, type ImportProgress, type ImportResult } from '../import/types';
import { deleteDoc, getDoc, listDocs, progressFor } from '../lib/db';
import type { DocMeta, Progress } from '../lib/types';
import { OcrPanel, useOcrState } from '../reader/OcrSheet';
import { Sheet } from '../ui/Sheet';
import { IconLock, IconPlus, IconTrash, IconWarn } from '../ui/icons';

const PHASES: Record<ImportProgress['phase'], string> = {
  read: 'Leyendo el archivo',
  convert: 'Convirtiendo el documento',
  analyze: 'Analizando páginas',
  images: 'Preparando imágenes',
  save: 'Guardando en este dispositivo',
};

function kindLabel(d: DocMeta): string {
  if (d.kind === 'docx') return 'Word';
  if (d.pdfKind === 'scanned') return d.ocr === 'done' ? 'PDF escaneado · texto reconocido' : 'PDF escaneado';
  if (d.pdfKind === 'mixed') return 'PDF con páginas escaneadas';
  return 'PDF con texto';
}

function ago(ts?: number): string {
  if (!ts) return '';
  const s = (Date.now() - ts) / 1000;
  if (s < 90) return 'recién';
  if (s < 3600) return `hace ${Math.round(s / 60)} min`;
  if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
  const d = Math.round(s / 86400);
  return d === 1 ? 'ayer' : `hace ${d} días`;
}

const fmtSize = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

interface ImportState {
  name: string;
  progress?: ImportProgress;
  result?: ImportResult;
  error?: { message: string; help?: string };
}

export function Library({ onOpen }: { onOpen: (id: string) => void }) {
  const [docs, setDocs] = useState<DocMeta[] | null>(null);
  const [progress, setProgress] = useState<Map<string, Progress>>(new Map());
  const [imp, setImp] = useState<ImportState | null>(null);
  const [confirm, setConfirm] = useState<DocMeta | null>(null);
  const [drag, setDrag] = useState(false);
  const [usage, setUsage] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const ocrState = useOcrState();

  const refresh = async () => {
    const list = await listDocs();
    setDocs(list);
    setProgress(await progressFor(list.map((d) => d.id)));
    try {
      const est = await navigator.storage?.estimate?.();
      if (est?.usage) setUsage(fmtSize(est.usage));
    } catch {
      /* sin estimación */
    }
  };

  useEffect(() => {
    void refresh();
  }, []);
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
      const result = await importFile(file, (p) => setImp((s) => (s ? { ...s, progress: p } : s)));
      setImp({ name: file.name, result });
      await refresh();
    } catch (e) {
      const err = e instanceof ImportError ? { message: e.message, help: e.help } : { message: (e as Error).message ?? String(e) };
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
      <header class="lib-head">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <div>
            <h1 class="brand-name">Knowmadic</h1>
            <p class="brand-tag">Un lugar para leer. Un espacio para pensar.</p>
          </div>
        </div>
      </header>

      <main class="lib-main">
        {recent && recentP && (
          <section class="continue" aria-label="Seguir leyendo">
            <button class="continue-card" onClick={() => onOpen(recent.id)} data-testid="continue-card">
              <span class="continue-kicker">Seguir leyendo</span>
              <span class="continue-title">{recent.title}</span>
              {recentP.snippet && <span class="continue-snippet">«{recentP.snippet}»</span>}
              <span class="continue-meta">
                {Math.round(recentP.pct * 100)} %{recentP.pageLabel ? ` · pág. ${recentP.pageLabel}` : ''} · {ago(recentP.updatedAt)}
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
            <IconPlus /> Cargar documento
          </label>
          <p class="add-hint">Word (.docx) o PDF. {matchMedia('(pointer:fine)').matches ? 'También podés arrastrarlo aquí.' : ''}</p>
        </section>

        <section class="shelf" aria-label="Biblioteca">
          {docs && docs.length === 0 && (
            <div class="empty">
              <p class="empty-title">Tu biblioteca está vacía</p>
              <p>Cargá un documento de Word o un PDF para empezar. Se guarda solo en este dispositivo.</p>
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
                        {d.pages ? ` · ${d.pages.length} pág.` : ''} · {fmtSize(d.size)}
                        {busy ? ' · reconociendo texto…' : ''}
                      </span>
                      <span class="doc-progress">
                        <span class="bar">
                          <span style={{ width: `${pct}%` }} />
                        </span>
                        <span class="doc-pct">{p ? `${pct} %` : 'Sin empezar'}</span>
                      </span>
                    </span>
                  </button>
                  <button class="icon-btn doc-del" aria-label={`Eliminar ${d.title}`} onClick={() => setConfirm(d)} data-testid="doc-delete">
                    <IconTrash />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <footer class="lib-foot">
        <p>
          <IconLock size={15} /> Tus documentos y tu progreso se guardan solo en este dispositivo. La app no envía archivos a ningún servidor.
          {usage && <> Espacio usado: {usage}.</>}
        </p>
      </footer>

      {imp && (
        <Sheet title={imp.result ? 'Documento listo' : imp.error ? 'No se pudo cargar' : 'Cargando documento'} onClose={imp.result || imp.error ? () => setImp(null) : undefined} testId="import-sheet">
          <p class="imp-name">{imp.name}</p>
          {!imp.result && !imp.error && (
            <div data-testid="import-progress">
              <p class="ocr-line">
                {imp.progress ? PHASES[imp.progress.phase] : 'Preparando'}
                {imp.progress && imp.progress.total > 1 ? ` (${Math.min(imp.progress.done + 1, imp.progress.total)} de ${imp.progress.total})` : '…'}
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
              <button class="btn" onClick={() => setImp(null)}>
                Entendido
              </button>
            </div>
          )}
          {imp.result && (
            <div class="imp-result" data-testid="import-result">
              <p class="imp-kind">
                <strong>{imp.result.meta.title}</strong>
                <br />
                {kindLabel(imp.result.meta)}
                {imp.result.meta.pages ? ` · ${imp.result.meta.pages.length} páginas` : ''}
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
                Abrir
              </button>
            </div>
          )}
        </Sheet>
      )}

      {confirm && (
        <Sheet title="Eliminar documento" onClose={() => setConfirm(null)} testId="delete-sheet">
          <p>
            Se eliminará <strong>{confirm.title}</strong> de este dispositivo, junto con su texto, sus imágenes y tu progreso de lectura. No se puede deshacer.
          </p>
          <div class="row-end">
            <button class="btn btn-quiet" onClick={() => setConfirm(null)}>
              Cancelar
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
              Eliminar
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
