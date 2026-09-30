/**
 * Reading Club: el foro del plan premium. Quien no es premium ve qué ofrece y
 * cómo acceder; la lectura de las conversaciones y la participación quedan
 * reservadas a premium (y el servicio lo vuelve a validar).
 */
import { useState } from 'preact/hooks';
import { CLUB_CATEGORIES, TEXT_LIMITS } from '../config/community';
import { canUse } from '../lib/access';
import { navigate } from '../router';
import { useAccount } from '../services/account';
import { backend } from '../services/backend';
import { isOwner } from '../services/rules';
import type { ClubReply, ThreadInput } from '../services/types';
import { Sheet } from '../ui/Sheet';
import { IconBack, IconClub, IconEdit, IconTrash } from '../ui/icons';
import { EmptyState, ErrorNote, Gate, LocalModeNote, PageHead, fmtDate, useLoad } from '../ui/page';

const OFFER = [
  ['Preguntas', 'Pedí recomendaciones, consultá dudas de lectura o de un autor.'],
  ['Conversaciones', 'Abrí un hilo sobre un libro o un autor y seguilo con otras personas.'],
  ['Textos propios', 'Compartí lo que escribís y recibí comentarios.'],
] as const;

function ClubLanding({ reason }: { reason: 'account' | 'premium' }) {
  return (
    <section>
      <PageHead title="Reading Club" lead="El espacio para conversar sobre lo que leemos y lo que escribimos." />
      <div class="offer-grid" data-testid="club-landing">
        {OFFER.map(([t, d]) => (
          <div class="card offer" key={t}>
            <p class="offer-title">{t}</p>
            <p class="muted">{d}</p>
          </div>
        ))}
      </div>
      <Gate reason="premium" title="El Reading Club es parte del plan premium">
        <p>
          Con premium podés leer todas las conversaciones, publicar y responder.
          {reason === 'account' ? ' Si ya tenés una cuenta premium, iniciá sesión.' : ''}
        </p>
      </Gate>
    </section>
  );
}

export function ClubPage() {
  const { user, ready } = useAccount();
  const access = canUse('club', user);
  const [category, setCategory] = useState('');
  const list = useLoad(async () => (access.ok ? (await backend()).listThreads({ category: category || undefined }) : []), [access.ok, category, user?.id]);
  if (!ready) return <p class="loading">Cargando…</p>;
  if (!access.ok) return <ClubLanding reason={user ? 'premium' : 'account'} />;
  return (
    <section>
      <PageHead
        title="Reading Club"
        lead="Preguntas, conversaciones sobre libros y autores, y textos propios."
        actions={
          <a class="btn btn-primary" href="#/club/nueva" data-testid="new-thread">
            <IconEdit size={18} /> Nueva publicación
          </a>
        }
      />
      <LocalModeNote what="Las conversaciones del Reading Club" />
      <div class="chips" role="radiogroup" aria-label="Categoría">
        {['', ...CLUB_CATEGORIES].map((c) => (
          <button key={c || 'todas'} role="radio" aria-checked={category === c} class={`chip${category === c ? ' is-on' : ''}`} onClick={() => setCategory(c)}>
            {c || 'Todas'}
          </button>
        ))}
      </div>
      <ErrorNote error={list.error} />
      {list.data?.length === 0 && (
        <EmptyState title={category ? `Todavía no hay publicaciones en «${category}»` : 'Todavía no hay conversaciones'}>
          <p>
            Abrí la primera: una pregunta, un libro que te tiene pensando o un texto propio. <a href="#/club/nueva">Nueva publicación</a>
          </p>
        </EmptyState>
      )}
      <ul class="thread-list" data-testid="thread-list">
        {list.data?.map((t) => (
          <li key={t.id} class="card thread-card" data-testid="thread-card">
            <a href={`#/club/${t.id}`} class="thread-link">
              <span class="tag">{t.category}</span>
              <span class="thread-title">{t.title}</span>
              <span class="muted">
                {t.authorName} · {fmtDate(t.createdAt)} · {t.replyCount} {t.replyCount === 1 ? 'respuesta' : 'respuestas'}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ConfirmDelete({ what, onConfirm, onClose }: { what: string; onConfirm: () => Promise<void>; onClose: () => void }) {
  return (
    <Sheet title={`Eliminar ${what}`} onClose={onClose}>
      <p>Se eliminará {what === 'publicación' ? 'la publicación y todas sus respuestas' : 'tu respuesta'}. No se puede deshacer.</p>
      <div class="row-end">
        <button class="btn btn-quiet" onClick={onClose}>
          Cancelar
        </button>
        <button class="btn btn-danger" data-testid="confirm-delete-post" onClick={() => void onConfirm()}>
          Eliminar
        </button>
      </div>
    </Sheet>
  );
}

function Reply({ reply, onChanged }: { reply: ClubReply; onChanged: () => void }) {
  const { user } = useAccount();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(reply.body);
  const [error, setError] = useState<unknown>(null);
  const [confirm, setConfirm] = useState(false);
  const own = isOwner(user, reply);
  return (
    <li class="reply" data-testid="reply">
      <p class="muted">
        <strong class="reply-author">{reply.authorName}</strong> · {fmtDate(reply.createdAt)}
        {reply.updatedAt ? ' · editada' : ''}
      </p>
      {editing ? (
        <form
          class="form"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await (await backend()).updateReply(reply.id, text);
              setEditing(false);
              onChanged();
            } catch (err) {
              setError(err);
            }
          }}
        >
          <textarea class="input textarea" rows={4} value={text} onInput={(e) => setText(e.currentTarget.value)} maxLength={TEXT_LIMITS.replyBody} aria-label="Editar respuesta" />
          <ErrorNote error={error} />
          <div class="row-end">
            <button type="button" class="btn btn-quiet" onClick={() => setEditing(false)}>
              Cancelar
            </button>
            <button class="btn btn-primary" data-testid="save-reply">
              Guardar
            </button>
          </div>
        </form>
      ) : (
        <div class="post-text">
          {reply.body.split(/\n{2,}/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
      {own && !editing && (
        <div class="post-tools">
          <button class="btn btn-quiet btn-small" onClick={() => setEditing(true)} data-testid="edit-reply">
            <IconEdit size={16} /> Editar
          </button>
          <button class="btn btn-quiet btn-small" onClick={() => setConfirm(true)} data-testid="delete-reply">
            <IconTrash size={16} /> Eliminar
          </button>
        </div>
      )}
      {confirm && (
        <ConfirmDelete
          what="respuesta"
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            await (await backend()).deleteReply(reply.id);
            setConfirm(false);
            onChanged();
          }}
        />
      )}
    </li>
  );
}

export function ThreadPage({ id }: { id: string }) {
  const { user, ready } = useAccount();
  const access = canUse('club', user);
  const res = useLoad(async () => (access.ok ? (await backend()).getThread(id) : null), [id, access.ok]);
  const [text, setText] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [confirm, setConfirm] = useState(false);
  if (!ready) return <p class="loading">Cargando…</p>;
  if (!access.ok) return <ClubLanding reason={user ? 'premium' : 'account'} />;
  const t = res.data?.thread;
  return (
    <section class="narrow">
      <a class="back-link" href="#/club">
        <IconBack size={18} /> Reading Club
      </a>
      <ErrorNote error={res.error} />
      {t && (
        <article class="thread-full" data-testid="thread-full">
          <span class="tag">{t.category}</span>
          <h1 class="page-title">{t.title}</h1>
          <p class="muted">
            {t.authorName} · {fmtDate(t.createdAt)}
            {t.updatedAt ? ' · editada' : ''}
          </p>
          <div class="post-text">
            {t.body.split(/\n{2,}/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {isOwner(user, t) && (
            <div class="post-tools">
              <a class="btn btn-quiet btn-small" href={`#/club/${t.id}/editar`} data-testid="edit-thread">
                <IconEdit size={16} /> Editar
              </a>
              <button class="btn btn-quiet btn-small" onClick={() => setConfirm(true)} data-testid="delete-thread">
                <IconTrash size={16} /> Eliminar
              </button>
            </div>
          )}
          <h2 class="section-title">
            <IconClub size={18} /> {t.replyCount} {t.replyCount === 1 ? 'respuesta' : 'respuestas'}
          </h2>
          <ul class="reply-list" data-testid="reply-list">
            {res.data!.replies.map((r) => (
              <Reply key={r.id} reply={r} onChanged={res.reload} />
            ))}
          </ul>
          <form
            class="form reply-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              try {
                await (await backend()).createReply(t.id, text);
                setText('');
                res.reload();
              } catch (err) {
                setError(err);
              }
            }}
          >
            <label class="field">
              <span class="field-label">Tu respuesta</span>
              <textarea class="input textarea" rows={4} required maxLength={TEXT_LIMITS.replyBody} value={text} onInput={(e) => setText(e.currentTarget.value)} name="reply" />
            </label>
            <ErrorNote error={error} />
            <button class="btn btn-primary" data-testid="reply-submit">
              Responder
            </button>
          </form>
          {confirm && (
            <ConfirmDelete
              what="publicación"
              onClose={() => setConfirm(false)}
              onConfirm={async () => {
                await (await backend()).deleteThread(t.id);
                navigate('/club');
              }}
            />
          )}
        </article>
      )}
    </section>
  );
}

export function ThreadFormPage({ id }: { id?: string }) {
  const { user, ready } = useAccount();
  const access = canUse('club', user);
  const existing = useLoad(async () => (id && access.ok ? (await backend()).getThread(id) : null), [id, access.ok]);
  if (!ready || (id && existing.loading)) return <p class="loading">Cargando…</p>;
  if (!access.ok) return <ClubLanding reason={user ? 'premium' : 'account'} />;
  const t = existing.data?.thread;
  if (id && t && !isOwner(user, t)) {
    return (
      <section class="narrow">
        <p class="form-error">Solo quien publicó la conversación puede editarla.</p>
      </section>
    );
  }
  return <ThreadForm id={id} initial={t ? { title: t.title, body: t.body, category: t.category } : { title: '', body: '', category: '' }} />;
}

function ThreadForm({ id, initial }: { id?: string; initial: ThreadInput }) {
  const [f, setF] = useState(initial);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const upd = (k: keyof ThreadInput) => (e: Event) => setF((s) => ({ ...s, [k]: (e.currentTarget as HTMLInputElement).value }));
  return (
    <section class="narrow">
      <a class="back-link" href={id ? `#/club/${id}` : '#/club'}>
        <IconBack size={18} /> {id ? 'Volver a la conversación' : 'Reading Club'}
      </a>
      <PageHead title={id ? 'Editar publicación' : 'Nueva publicación'} lead="Una pregunta, una conversación sobre un libro o un autor, o un texto propio." />
      <form
        class="form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const b = await backend();
            const t = id ? await b.updateThread(id, f) : await b.createThread(f);
            navigate(`/club/${t.id}`);
          } catch (err) {
            setError(err);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label class="field">
          <span class="field-label">Título</span>
          <input class="input" required maxLength={TEXT_LIMITS.threadTitle} value={f.title} onInput={upd('title')} name="title" />
        </label>
        <label class="field">
          <span class="field-label">Categoría</span>
          <select class="input select" required value={f.category} onChange={upd('category')} name="category">
            <option value="">Elegí una categoría</option>
            {CLUB_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label class="field">
          <span class="field-label">Contenido</span>
          <textarea class="input textarea" required rows={10} maxLength={TEXT_LIMITS.threadBody} value={f.body} onInput={upd('body')} name="body" />
        </label>
        <ErrorNote error={error} />
        <button class="btn btn-primary btn-block" disabled={busy} data-testid="thread-submit">
          {id ? 'Guardar cambios' : 'Publicar'}
        </button>
      </form>
    </section>
  );
}
