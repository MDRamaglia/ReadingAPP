/** Reseñas de la comunidad: buscar, filtrar, ordenar, leer, publicar y dar likes. */
import { useEffect, useState } from 'preact/hooks';
import { REVIEW_CATEGORIES, TEXT_LIMITS } from '../config/community';
import { allowed } from '../lib/access';
import { navigate, signInHref } from '../router';
import { useAccount } from '../services/account';
import { backend } from '../services/backend';
import { isOwner } from '../services/rules';
import type { Review, ReviewInput, ReviewSort } from '../services/types';
import { Sheet } from '../ui/Sheet';
import { IconBack, IconEdit, IconHeart, IconSearch, IconTrash } from '../ui/icons';
import { EmptyState, ErrorNote, Gate, LocalModeNote, PageHead, fmtDate, useLoad } from '../ui/page';

export function ReviewsPage() {
  const { user } = useAccount();
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<ReviewSort>('top');
  const list = useLoad(async () => (await backend()).listReviews({ text, category: category || undefined, sort }), [text, category, sort, user?.id]);
  const any = useLoad(async () => (await backend()).listReviews({}), [user?.id]);
  const write = allowed('reviewsWrite', user) ? '#/resenas/nueva' : signInHref('/resenas/nueva');

  return (
    <section>
      <PageHead
        title="Reseñas"
        lead="Lo que la comunidad opina de sus lecturas. Buscá un libro o un autor, o contá qué te pareció."
        actions={
          <a class="btn btn-primary" href={write} data-testid="write-review">
            <IconEdit size={18} /> Escribir reseña
          </a>
        }
      />
      <LocalModeNote what="Las reseñas y los likes" />

      <div class="filters">
        <label class="search">
          <IconSearch size={18} />
          <input
            type="search"
            placeholder="Buscar por libro o autor"
            aria-label="Buscar por libro o autor"
            value={text}
            onInput={(e) => setText(e.currentTarget.value)}
            data-testid="review-search"
          />
        </label>
        <select class="input select" aria-label="Categoría" value={category} onChange={(e) => setCategory(e.currentTarget.value)} data-testid="review-category">
          <option value="">Todas las categorías</option>
          {REVIEW_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div class="segmented" role="radiogroup" aria-label="Ordenar">
          {(
            [
              ['top', 'Más valoradas'],
              ['recent', 'Más recientes'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="radio"
              aria-checked={sort === id}
              class={sort === id ? 'is-on' : ''}
              // Elegir un orden (aunque sea el actual) vuelve a cargar la lista: los likes
              // recién dados cambian la posición al recargar, no en el momento.
              onClick={() => {
                setSort(id);
                list.reload();
              }}
              data-testid={`sort-${id}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ErrorNote error={list.error} />
      {list.data && list.data.length === 0 && (any.data?.length ?? 0) === 0 && (
        <EmptyState title="Todavía no hay reseñas">
          <p>
            Sé la primera persona en recomendar (o no) un libro. <a href={write}>Escribir una reseña</a>
          </p>
        </EmptyState>
      )}
      {list.data && list.data.length === 0 && (any.data?.length ?? 0) > 0 && (
        <EmptyState title="No hay reseñas que coincidan">
          <p>Probá con otra palabra del título o del autor, o con otra categoría.</p>
        </EmptyState>
      )}
      <div class="review-list" data-testid="review-list">
        {list.data?.map((r) => (
          <ReviewCard key={r.id} review={r} onChanged={list.reload} />
        ))}
      </div>
    </section>
  );
}

function LikeButton({ review, onChanged }: { review: Review; onChanged: (r: Review) => void }) {
  const { user } = useAccount();
  const [busy, setBusy] = useState(false);
  const mine = isOwner(user, review);
  const label = `${review.likes} ${review.likes === 1 ? 'like' : 'likes'}`;
  if (!user) {
    return (
      <a class="like" href={signInHref()} title="Iniciá sesión para dar like" data-testid="like">
        <IconHeart size={18} /> <span data-testid="like-count">{review.likes}</span>
        <span class="visually-hidden"> likes. Iniciá sesión para dar like.</span>
      </a>
    );
  }
  return (
    <button
      class={`like${review.likedByMe ? ' is-on' : ''}`}
      aria-pressed={review.likedByMe}
      aria-label={mine ? `${label}. Es tu reseña` : review.likedByMe ? `Quitar like (${label})` : `Dar like (${label})`}
      title={mine ? 'No podés dar like a tu propia reseña' : undefined}
      disabled={busy || mine}
      data-testid="like"
      onClick={async () => {
        setBusy(true);
        try {
          const r = await (await backend()).toggleLike(review.id);
          onChanged({ ...review, likedByMe: r.liked, likes: r.likes });
        } finally {
          setBusy(false);
        }
      }}
    >
      <IconHeart size={18} filled={review.likedByMe} /> <span data-testid="like-count">{review.likes}</span>
    </button>
  );
}

function ReviewActions({ review, onDeleted }: { review: Review; onDeleted: () => void }) {
  const { user } = useAccount();
  const [confirm, setConfirm] = useState(false);
  if (!isOwner(user, review)) return null;
  return (
    <>
      <a class="icon-btn" href={`#/resenas/${review.id}/editar`} aria-label="Editar reseña" data-testid="edit-review">
        <IconEdit size={18} />
      </a>
      <button class="icon-btn" aria-label="Eliminar reseña" onClick={() => setConfirm(true)} data-testid="delete-review">
        <IconTrash size={18} />
      </button>
      {confirm && (
        <Sheet title="Eliminar reseña" onClose={() => setConfirm(false)}>
          <p>
            Se eliminará tu reseña <strong>{review.title}</strong>, con sus likes. No se puede deshacer.
          </p>
          <div class="row-end">
            <button class="btn btn-quiet" onClick={() => setConfirm(false)}>
              Cancelar
            </button>
            <button
              class="btn btn-danger"
              data-testid="confirm-delete-review"
              onClick={async () => {
                await (await backend()).deleteReview(review.id);
                setConfirm(false);
                onDeleted();
              }}
            >
              Eliminar
            </button>
          </div>
        </Sheet>
      )}
    </>
  );
}

function ReviewCard({ review, onChanged }: { review: Review; onChanged: () => void }) {
  const [r, setR] = useState(review);
  const [shown, setShown] = useState(false);
  // Si la lista se vuelve a cargar, la tarjeta muestra los datos nuevos.
  useEffect(() => setR(review), [review]);
  const excerpt = r.body.length > 320 ? `${r.body.slice(0, 320).trimEnd()}…` : r.body;
  return (
    <article class="card review-card" data-testid="review-card">
      <div class="review-meta">
        <p class="review-book">
          <strong data-testid="review-book">{r.bookTitle}</strong> · <span data-testid="review-author">{r.bookAuthor}</span>
        </p>
        <span class="tag">{r.category}</span>
      </div>
      <h2 class="review-title">
        <a href={`#/resenas/${r.id}`}>{r.title}</a>
      </h2>
      {r.spoiler && !shown ? (
        <button class="spoiler-cover" onClick={() => setShown(true)} data-testid="spoiler-cover">
          Contiene spoilers · <span>Mostrar la reseña</span>
        </button>
      ) : (
        <p class="review-body">{excerpt}</p>
      )}
      <div class="review-foot">
        <span class="muted">
          {r.authorName} · {fmtDate(r.createdAt)}
          {r.updatedAt ? ' · editada' : ''}
        </span>
        <span class="review-tools">
          <LikeButton review={r} onChanged={setR} />
          <ReviewActions review={r} onDeleted={onChanged} />
        </span>
      </div>
    </article>
  );
}

export function ReviewPage({ id }: { id: string }) {
  const { user } = useAccount();
  const res = useLoad(async () => (await backend()).getReview(id), [id, user?.id]);
  const [override, setOverride] = useState<Review | null>(null);
  const [shown, setShown] = useState(false);
  const r = override && override.id === id ? override : res.data;
  return (
    <section class="narrow">
      <a class="back-link" href="#/resenas">
        <IconBack size={18} /> Reseñas
      </a>
      <ErrorNote error={res.error} />
      {r && (
        <article class="review-full" data-testid="review-full">
          <p class="review-book">
            <strong>{r.bookTitle}</strong> · {r.bookAuthor} <span class="tag">{r.category}</span>
          </p>
          <h1 class="page-title">{r.title}</h1>
          <p class="muted">
            {r.authorName} · {fmtDate(r.createdAt)}
            {r.updatedAt ? ` · editada el ${fmtDate(r.updatedAt)}` : ''}
          </p>
          {r.spoiler && !shown ? (
            <button class="spoiler-cover" onClick={() => setShown(true)} data-testid="spoiler-cover">
              Contiene spoilers · <span>Mostrar la reseña</span>
            </button>
          ) : (
            <div class="review-text">
              {r.body.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          <div class="review-foot">
            <LikeButton review={r} onChanged={setOverride} />
            <span class="review-tools">
              <ReviewActions review={r} onDeleted={() => navigate('/resenas')} />
            </span>
          </div>
        </article>
      )}
    </section>
  );
}

const EMPTY: ReviewInput = { bookTitle: '', bookAuthor: '', category: '', title: '', body: '', spoiler: false };

export function ReviewFormPage({ id }: { id?: string }) {
  const { user, ready } = useAccount();
  const existing = useLoad(async () => (id ? (await backend()).getReview(id) : null), [id]);
  if (!ready || (id && existing.loading)) return <p class="loading">Cargando…</p>;
  if (!allowed('reviewsWrite', user)) {
    return (
      <section class="narrow">
        <Gate reason="account" title="Iniciá sesión para publicar una reseña">
          <p>Leer reseñas no requiere cuenta; para publicarlas y dar likes, sí. La cuenta gratuita alcanza.</p>
        </Gate>
      </section>
    );
  }
  if (id && existing.data && !isOwner(user, existing.data)) {
    return (
      <section class="narrow">
        <p class="form-error">Solo quien publicó la reseña puede editarla.</p>
      </section>
    );
  }
  return <ReviewForm id={id} initial={existing.data ?? EMPTY} />;
}

function ReviewForm({ id, initial }: { id?: string; initial: ReviewInput }) {
  const [f, setF] = useState<ReviewInput>({
    bookTitle: initial.bookTitle,
    bookAuthor: initial.bookAuthor,
    category: initial.category,
    title: initial.title,
    body: initial.body,
    spoiler: initial.spoiler,
  });
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const upd = (k: keyof ReviewInput) => (e: Event) => {
    const t = e.currentTarget as HTMLInputElement;
    setF((s) => ({ ...s, [k]: t.type === 'checkbox' ? t.checked : t.value }));
  };
  return (
    <section class="narrow">
      <a class="back-link" href={id ? `#/resenas/${id}` : '#/resenas'}>
        <IconBack size={18} /> {id ? 'Volver a la reseña' : 'Reseñas'}
      </a>
      <PageHead title={id ? 'Editar reseña' : 'Escribir una reseña'} />
      <form
        class="form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const b = await backend();
            const r = id ? await b.updateReview(id, f) : await b.createReview(f);
            navigate(`/resenas/${r.id}`);
          } catch (err) {
            setError(err);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div class="form-row">
          <label class="field">
            <span class="field-label">Nombre del libro</span>
            <input class="input" required maxLength={TEXT_LIMITS.bookTitle} value={f.bookTitle} onInput={upd('bookTitle')} name="bookTitle" />
          </label>
          <label class="field">
            <span class="field-label">Autor del libro</span>
            <input class="input" required maxLength={TEXT_LIMITS.bookAuthor} value={f.bookAuthor} onInput={upd('bookAuthor')} name="bookAuthor" />
          </label>
        </div>
        <label class="field">
          <span class="field-label">Categoría o género</span>
          <select class="input select" required value={f.category} onChange={upd('category')} name="category">
            <option value="">Elegí una categoría</option>
            {REVIEW_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label class="field">
          <span class="field-label">Título de la reseña</span>
          <input class="input" required maxLength={TEXT_LIMITS.reviewTitle} value={f.title} onInput={upd('title')} name="title" />
        </label>
        <label class="field">
          <span class="field-label">Reseña</span>
          <textarea class="input textarea" required rows={9} maxLength={TEXT_LIMITS.reviewBody} value={f.body} onInput={upd('body')} name="body" />
        </label>
        <label class="check">
          <input type="checkbox" checked={f.spoiler} onChange={upd('spoiler')} name="spoiler" /> Contiene spoilers (se oculta hasta que alguien decida verla)
        </label>
        <ErrorNote error={error} />
        <button class="btn btn-primary btn-block" disabled={busy} data-testid="review-submit">
          {id ? 'Guardar cambios' : 'Publicar reseña'}
        </button>
      </form>
    </section>
  );
}
