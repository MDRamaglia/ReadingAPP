/**
 * Lector: carga el documento, ofrece continuar donde se dejó, alterna entre
 * modo libro y modo renglón manteniendo el fragmento, y guarda el punto de
 * lectura de forma automática.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { db, getBlocks, getDoc, getFile, getProgress, mirrorProgress, putDoc, saveProgress } from '../lib/db';
import { closePdf, openPdf, type PDFDocumentProxy } from '../lib/pdfjs';
import { useSettings } from '../lib/settings';
import type { Block, DocMeta, Position, Progress, ReadMode } from '../lib/types';
import { IconBook, IconLibrary, IconLine, IconPage, IconToc, IconType, IconUp, IconWarn, IconScan } from '../ui/icons';
import { FlowBook } from './FlowBook';
import { FocusView } from './FocusView';
import { OcrSheet, useOcrState } from './OcrSheet';
import { OriginalPage } from './OriginalPage';
import { PdfBook } from './PdfBook';
import { pageOfPos, posOfPage, TextIndex } from './position';
import { SettingsSheet } from './SettingsSheet';
import { TocSheet } from './TocSheet';
import type { ViewHandle, ViewReport } from './views';

interface Loaded {
  meta: DocMeta;
  blocks: Block[];
  urls: Map<string, string>;
  pdf: PDFDocumentProxy | null;
  saved: Progress | undefined;
}

type SheetKind = 'settings' | 'toc' | 'original' | 'ocr' | null;

const START: Position = { b: 0, o: 0, page: 0 };

async function loadDoc(id: string): Promise<Loaded> {
  const meta = await getDoc(id);
  if (!meta) throw new Error('No se encontró el documento.');
  const blocks = await getBlocks(id);
  const d = await db();
  const assets = await d.getAllFromIndex('assets', 'byDoc', id);
  const urls = new Map(assets.map((a) => [a.key, URL.createObjectURL(a.blob)]));
  let pdf: PDFDocumentProxy | null = null;
  if (meta.kind === 'pdf') {
    const file = await getFile(id);
    if (!file) throw new Error('Falta el archivo original del PDF.');
    pdf = await openPdf(await file.arrayBuffer());
  }
  const saved = await getProgress(id);
  meta.openedAt = Date.now();
  void putDoc(meta);
  return { meta, blocks, urls, pdf, saved };
}

export function Reader({ docId, onExit }: { docId: string; onExit: () => void }) {
  const settings = useSettings();
  const [doc, setDoc] = useState<Loaded | null>(null);
  const [error, setError] = useState('');
  const [resume, setResume] = useState<Progress | null>(null);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<ReadMode>('book');
  const [initial, setInitial] = useState<Position>(START);
  const [viewKey, setViewKey] = useState(0);
  const [report, setReport] = useState<ViewReport | null>(null);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [chrome, setChrome] = useState(true);
  const [toast, setToast] = useState('');
  const handle = useRef<ViewHandle | null>(null);
  const lastText = useRef<Position | null>(null);
  const saveTimer = useRef(0);
  const pending = useRef<Progress | null>(null);
  const ocrState = useOcrState();

  const textIndex = useMemo(() => (doc ? new TextIndex(doc.blocks) : null), [doc?.blocks]);
  const hasText = !!doc && doc.blocks.some((b) => b.len > 0 && b.t !== 'notice');

  // ——— Carga ———
  useEffect(() => {
    let alive = true;
    let loaded: Loaded | null = null;
    loadDoc(docId)
      .then((d) => {
        if (!alive) {
          d.urls.forEach((u) => URL.revokeObjectURL(u));
          closePdf(d.pdf);
          return;
        }
        loaded = d;
        setDoc(d);
        const textOk = d.blocks.some((b) => b.len > 0 && b.t !== 'notice');
        const p = d.saved;
        const moved = p && (p.pct > 0.001 || (p.pos.page ?? 0) > 0 || p.pos.b > 0 || p.pos.o > 0);
        if (moved) {
          setResume(p);
        } else {
          setMode(d.meta.kind === 'pdf' || !textOk ? 'book' : 'book');
          setInitial(START);
          setStarted(true);
        }
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
      if (loaded) {
        loaded.urls.forEach((u) => URL.revokeObjectURL(u));
        closePdf(loaded.pdf);
      }
    };
  }, [docId]);

  // Cuando el OCR avanza sobre este documento, se recargan texto e índice.
  const ocrDone = ocrState?.docId === docId ? ocrState.done : -1;
  const ocrStatus = ocrState?.docId === docId ? ocrState.status : null;
  useEffect(() => {
    if (!doc || ocrDone <= 0) return;
    let alive = true;
    void Promise.all([getDoc(docId), getBlocks(docId)]).then(([meta, blocks]) => {
      if (!alive || !meta) return;
      // En modo renglón se conserva el lugar por página, porque los bloques cambian.
      const cur = handle.current?.position();
      setDoc((d) => (d ? { ...d, meta, blocks } : d));
      if (mode === 'focus' && cur) {
        const page = pageOfPos(doc.blocks, cur);
        const same = doc.blocks[cur.b] && blocks[cur.b]?.page === page;
        setInitial(same ? cur : (posOfPage(blocks, page ?? 0) ?? START));
        setViewKey((k) => k + 1);
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocrDone, ocrStatus]);

  // ——— Guardado del progreso ———
  const flush = useCallback(() => {
    clearTimeout(saveTimer.current);
    if (pending.current) {
      const p = pending.current;
      pending.current = null;
      void saveProgress(p);
    }
  }, []);

  useEffect(() => {
    const onHide = () => document.visibilityState === 'hidden' && flush();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [flush]);

  const onReport = useCallback(
    (r: ViewReport) => {
      if (!doc || !textIndex) return;
      setReport(r);
      const { meta, blocks } = doc;
      let pos = r.pos;
      if (pos.b >= 0) lastText.current = pos;
      let pct: number;
      let snippet = '';
      let pageLabel: string | undefined;
      if (meta.kind === 'pdf') {
        const page = pos.b >= 0 ? pageOfPos(blocks, pos) : pos.page;
        pos = { ...pos, page };
        pageLabel = page !== undefined ? meta.pages?.[page]?.label : undefined;
        if (pos.b >= 0) {
          pct = textIndex.pct(pos);
          snippet = textIndex.snippet(pos);
        } else {
          const n = meta.pages?.length ?? 1;
          pct = n > 1 ? (page ?? 0) / (n - 1) : 1;
          const tp = posOfPage(blocks, page ?? 0);
          snippet = tp && (blocks[tp.b]?.page ?? -1) === page ? textIndex.snippet(tp) : '';
        }
      } else {
        pct = textIndex.pct(pos);
        snippet = textIndex.snippet(pos);
      }
      const p: Progress = { id: meta.id, pos, mode, pct, updatedAt: Date.now(), snippet, pageLabel };
      mirrorProgress(p);
      pending.current = p;
      clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(flush, 500);
    },
    [doc, textIndex, mode, flush],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? '' : t)), 1800);
  };
  const onEdge = useCallback((e: 'start' | 'end') => showToast(e === 'end' ? 'Llegaste al final del documento' : 'Estás al comienzo'), []);

  // ——— Continuar o empezar ———
  const begin = (p: Progress | null) => {
    if (!doc) return;
    const { meta, blocks } = doc;
    let m: ReadMode = p?.mode ?? 'book';
    if (m === 'focus' && !hasText) m = 'book';
    let pos: Position = START;
    if (p) {
      pos = p.pos;
      // Si el texto cambió (por ejemplo, después del OCR), se ubica por página.
      if (meta.kind === 'pdf' && m === 'focus' && (pos.b < 0 || pos.b >= blocks.length || pageOfPos(blocks, pos) !== pos.page)) {
        pos = posOfPage(blocks, pos.page ?? 0) ?? START;
      }
      if (pos.b >= blocks.length) pos = START;
    }
    if (pos.b >= 0) lastText.current = pos;
    setMode(m);
    setInitial(pos);
    setResume(null);
    setStarted(true);
  };

  // ——— Cambio de modo ———
  const switchMode = (to: ReadMode) => {
    if (!doc || to === mode) return;
    if (to === 'focus' && !hasText) {
      setSheet('ocr');
      return;
    }
    flush();
    const cur = handle.current?.position() ?? initial;
    const { meta, blocks } = doc;
    let target: Position = cur;
    if (meta.kind === 'pdf') {
      if (to === 'focus') {
        const page = cur.page ?? 0;
        const span = report?.perView ?? 1;
        const lt = lastText.current;
        const ltPage = lt ? pageOfPos(blocks, lt) : undefined;
        // Si el renglón en que estabas sigue a la vista, se vuelve exactamente a él.
        if (lt && ltPage !== undefined && ltPage >= page && ltPage < page + span) target = lt;
        else target = posOfPage(blocks, page) ?? START;
      } else {
        target = { ...cur, page: pageOfPos(blocks, cur) ?? cur.page ?? 0 };
        lastText.current = cur;
      }
    }
    setMode(to);
    setInitial(target);
    setViewKey((k) => k + 1);
    setChrome(true);
  };

  // ——— Teclado ———
  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      if (sheet || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select')) return;
      const h = handle.current;
      if (!h) return;
      const nextKeys = ['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter', 'j'];
      const prevKeys = ['ArrowLeft', 'ArrowUp', 'PageUp', 'k'];
      if (e.key === ' ' && e.shiftKey) {
        e.preventDefault();
        h.prev();
      } else if (nextKeys.includes(e.key)) {
        if (e.key === 'Enter' && t.closest('button')) return;
        e.preventDefault();
        h.next();
      } else if (prevKeys.includes(e.key)) {
        e.preventDefault();
        h.prev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, sheet]);

  // Acceso para pruebas automatizadas.
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__reader = { mode, handle, report };
  });

  if (error) {
    return (
      <div class="center-msg">
        <p>{error}</p>
        <button class="btn" onClick={onExit}>
          Volver a la biblioteca
        </button>
      </div>
    );
  }
  if (!doc) return <div class="center-msg" aria-busy="true">Abriendo…</div>;

  const { meta, blocks, urls, pdf } = doc;

  if (resume && !started) {
    const pct = Math.round(resume.pct * 100);
    return (
      <div class="resume" data-testid="resume">
        <div class="resume-card">
          <p class="resume-kicker">Continuar leyendo</p>
          <h1 class="resume-title">{meta.title}</h1>
          {resume.snippet && <blockquote class="resume-snippet">«{resume.snippet}»</blockquote>}
          <p class="resume-meta">
            {pct} % leído{resume.pageLabel ? ` · página ${resume.pageLabel}` : ''} · modo {resume.mode === 'focus' ? 'renglón' : 'libro'}
          </p>
          <button class="btn btn-primary btn-block" data-testid="resume-continue" onClick={() => begin(resume)}>
            Continuar desde allí
          </button>
          <button class="btn btn-quiet btn-block" onClick={() => begin(null)}>
            Empezar desde el principio
          </button>
          <button class="btn btn-quiet btn-block" onClick={onExit}>
            Volver a la biblioteca
          </button>
        </div>
      </div>
    );
  }
  if (!started) return <div class="center-msg">Abriendo…</div>;

  // ——— Indicador de progreso ———
  const pos = report?.pos ?? initial;
  const isPdf = meta.kind === 'pdf';
  const page = isPdf ? (pos.b >= 0 ? pageOfPos(blocks, pos) : pos.page) : undefined;
  const pageInfo = page !== undefined ? meta.pages?.[page] : undefined;
  let progressText = '';
  let frac = 0;
  if (mode === 'book' && report?.pages) {
    const first = (report.page ?? 0) + 1;
    const last = Math.min(report.pages, first + (report.perView ?? 1) - 1);
    const label = isPdf ? meta.pages?.[first - 1]?.label : String(first);
    const label2 = isPdf ? meta.pages?.[last - 1]?.label : String(last);
    progressText = `Pág. ${label}${last > first ? `–${label2}` : ''} de ${isPdf ? report.pages : report.pages}`;
    frac = report.pages > 1 ? (last - 1) / (report.pages - 1) : 1;
  } else if (textIndex) {
    frac = textIndex.pct(pos);
    const sec = textIndex.section(pos, meta);
    progressText = `${Math.round(frac * 100)} %${pageInfo ? ` · pág. ${pageInfo.label}` : sec ? ` · ${sec}` : ''}`;
  }
  const doubt = isPdf && mode === 'focus' && pageInfo && (pageInfo.orderDoubt || pageInfo.ocr?.status === 'low' || pageInfo.ocr?.status === 'failed');
  const doubtText = pageInfo?.orderDoubt ? 'orden dudoso' : 'OCR dudoso';
  const ocrRunning = ocrState?.docId === meta.id && (ocrState.status === 'running' || ocrState.status === 'loading');

  const pageOfEntry = (b: number | undefined, p: number | undefined): number | null => {
    if (isPdf) return p ?? (b !== undefined ? (pageOfPos(blocks, { b, o: 0 }) ?? null) : null);
    if (mode === 'book' && b !== undefined && handle.current?.pageOf) return handle.current.pageOf({ b, o: 0 });
    return null;
  };

  const goPos = (target: Position, p?: number) => {
    if (mode === 'book' && isPdf) handle.current?.goToPage?.(p ?? pageOfPos(blocks, target) ?? 0);
    else handle.current?.goTo(target);
  };
  const goPage = (p: number) => {
    if (mode === 'book') handle.current?.goToPage?.(p);
    else if (isPdf) {
      const t = posOfPage(blocks, p);
      if (t) handle.current?.goTo(t);
    }
  };
  const goPct = (pct: number) => {
    if (!textIndex) return;
    const total = meta.totalChars;
    let acc = 0;
    const want = pct * total;
    for (let i = 0; i < blocks.length; i++) {
      if (acc + blocks[i]!.len >= want) {
        handle.current?.goTo({ b: i, o: Math.max(0, Math.round(want - acc)) });
        return;
      }
      acc += blocks[i]!.len;
    }
  };

  return (
    <div
      class={`reader mode-${mode}${chrome ? '' : ' chrome-hidden'}`}
      data-testid="reader"
      data-mode={mode}
      style={{
        '--fs': `${settings.fontSize}px`,
        '--lh': String(settings.lineHeight),
        '--measure': String(settings.width),
        '--reading-font': settings.font === 'atkinson' ? 'var(--font-atkinson)' : 'var(--font-literata)',
      }}
    >
      <header class="reader-head">
        <span class="reader-title" title={meta.title}>
          {meta.title}
        </span>
      </header>

      <main class="reader-stage">
        {mode === 'focus' ? (
          <FocusView
            key={`f${viewKey}`}
            blocks={blocks}
            assetUrls={urls}
            settings={settings}
            initial={initial}
            handle={handle}
            onReport={onReport}
            onEdge={onEdge}
          />
        ) : isPdf && pdf ? (
          <PdfBook
            key={`p${viewKey}`}
            pdf={pdf}
            pages={meta.pages ?? []}
            initialPage={initial.page ?? pageOfPos(blocks, initial) ?? 0}
            handle={handle}
            onReport={onReport}
            onEdge={onEdge}
            onToggleChrome={() => setChrome((c) => !c)}
          />
        ) : (
          <FlowBook
            key={`b${viewKey}`}
            blocks={blocks}
            assetUrls={urls}
            settings={settings}
            initial={initial}
            handle={handle}
            onReport={onReport}
            onEdge={onEdge}
            onToggleChrome={() => setChrome((c) => !c)}
          />
        )}
        {mode === 'focus' && (
          <button class="line-back" onClick={() => handle.current?.prev()} aria-label="Renglón anterior" data-testid="line-back">
            <IconUp size={26} />
          </button>
        )}
        {toast && (
          <div class="toast" role="status">
            {toast}
          </div>
        )}
      </main>

      <footer class="reader-bar">
        <div class="progress-line" aria-hidden="true">
          <div class="progress-line-fill" style={{ width: `${Math.round(frac * 1000) / 10}%` }} />
        </div>
        <div class="progress-row">
          <span class="progress-text" data-testid="progress-text">
            {progressText}
          </span>
          {doubt && (
            <button class="doubt-badge" onClick={() => setSheet('original')} data-testid="doubt-badge">
              <IconWarn size={14} /> {doubtText} · ver original
            </button>
          )}
          {ocrRunning && (
            <button class="doubt-badge" onClick={() => setSheet('ocr')}>
              <IconScan size={14} /> OCR {ocrState!.done}/{ocrState!.total}
            </button>
          )}
        </div>
        <nav class="toolbar" aria-label="Controles de lectura">
          <button
            class="tool"
            onClick={() => {
              flush();
              onExit();
            }}
            aria-label="Biblioteca"
          >
            <IconLibrary />
            <span>Biblioteca</span>
          </button>
          <button class="tool" onClick={() => setSheet('toc')} aria-label="Ir a página o sección">
            <IconToc />
            <span>Ir a</span>
          </button>
          <div class="mode-switch" role="radiogroup" aria-label="Modo de lectura">
            <button role="radio" aria-checked={mode === 'book'} class={mode === 'book' ? 'is-on' : ''} onClick={() => switchMode('book')} data-testid="mode-book">
              <IconBook size={20} />
              <span>Libro</span>
            </button>
            <button
              role="radio"
              aria-checked={mode === 'focus'}
              class={`${mode === 'focus' ? 'is-on' : ''}${hasText ? '' : ' is-locked'}`}
              onClick={() => switchMode('focus')}
              data-testid="mode-focus"
            >
              <IconLine size={20} />
              <span>Renglón</span>
            </button>
          </div>
          {isPdf && mode === 'focus' ? (
            <button class="tool" onClick={() => setSheet('original')} aria-label="Ver página original" data-testid="open-original">
              <IconPage />
              <span>Original</span>
            </button>
          ) : null}
          <button class="tool" onClick={() => setSheet('settings')} aria-label="Ajustes de lectura" data-testid="open-settings">
            <IconType />
            <span>Letra</span>
          </button>
        </nav>
      </footer>

      {sheet === 'settings' && <SettingsSheet settings={settings} onClose={() => setSheet(null)} pdfBook={isPdf && mode === 'book'} />}
      {sheet === 'toc' && (
        <TocSheet
          meta={meta}
          mode={mode}
          page={mode === 'book' ? report?.page : page}
          pages={report?.pages}
          currentBlock={pos.b}
          pageOfEntry={pageOfEntry}
          onGoPage={goPage}
          onGoPos={goPos}
          onGoPct={goPct}
          pct={frac}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'original' && pdf && <OriginalPage pdf={pdf} pages={meta.pages ?? []} page={page ?? 0} onClose={() => setSheet(null)} />}
      {sheet === 'ocr' && <OcrSheet meta={meta} onClose={() => setSheet(null)} />}
    </div>
  );
}

