/** Reseñas de la comunidad: buscar, filtrar, ordenar, leer, publicar y dar likes. */
import { useEffect, useState } from 'preact/hooks';
import { REVIEW_CATEGORIES, TEXT_LIMITS, reviewCategoryLabel } from '../config/community';
import { t } from '../i18n';
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
        title={t('reviews.title')}
        lead={t('reviews.lead')}
        actions={
          <a class="btn btn-primary" href={write} data-testid="write-review">
            <IconEdit size={18} /> {t('reviews.write')}
          </a>
        }
      />
      <LocalModeNote what={t('localNote.reviews')} />

      <div class="filters">
        <label class="search">
          <IconSearch size={18} />
          <input
            type="search"
            placeholder={t('reviews.search')}
            aria-label={t('reviews.search')}
            value={text}
            onInput={(e) => setText(e.currentTarget.value)}
            data-testid="review-search"
          />
        </label>
        <select class="input select" aria-label={t('field.category')} value={category} onChange={(e) => setCategory(e.currentTarget.value)} data-testid="review-category">
          <option value="">{t('reviews.allCategories')}</option>
          {REVIEW_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {reviewCategoryLabel(c)}
            </option>
          ))}
        </select>
        <div class="segmented" role="radiogroup" aria-label={t('reviews.sort')}>
          {(
            [
              ['top', t('reviews.sortTop')],
              ['recent', t('reviews.sortRecent')],
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
        <EmptyState title={t('reviews.empty')}>
          <p>
            {t('reviews.emptyHint')} <a href={write}>{t('reviews.writeOne')}</a>
          </p>
        </EmptyState>
      )}
      {list.data && list.data.length === 0 && (any.data?.length ?? 0) > 0 && (
        <EmptyState title={t('reviews.noMatch')}>
          <p>{t('reviews.noMatchHint')}</p>
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
  const label = t('reviews.likes', { count: review.likes });
  if (!user) {
    return (
      <a class="like" href={signInHref()} title={t('reviews.like.signIn')} data-testid="like">
        <IconHeart size={18} /> <span data-testid="like-count">{review.likes}</span>
        <span class="visually-hidden"> {t('reviews.like.guestHidden')}</span>
      </a>
    );
  }
  return (
    <button
      class={`like${review.likedByMe ? ' is-on' : ''}`}
      aria-pressed={review.likedByMe}
      aria-label={mine ? t('reviews.like.own', { likes: label }) : review.likedByMe ? t('reviews.like.remove', { likes: label }) : t('reviews.like.give', { likes: label })}
      title={mine ? t('reviews.like.ownTitle') : undefined}
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
      <a class="icon-btn" href={`#/resenas/${review.id}/editar`} aria-label={t('reviews.edit')} data-testid="edit-review">
        <IconEdit size={18} />
      </a>
      <button class="icon-btn" aria-label={t('reviews.delete')} onClick={() => setConfirm(true)} data-testid="delete-review">
        <IconTrash size={18} />
      </button>
      {confirm && (
        <Sheet title={t('reviews.delete')} onClose={() => setConfirm(false)}>
          <p>
            {t('reviews.deleteBefore')} <strong>{review.title}</strong>
            {t('reviews.deleteAfter')}
          </p>
          <div class="row-end">
            <button class="btn btn-quiet" onClick={() => setConfirm(false)}>
              {t('common.cancel')}
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
              {t('common.delete')}
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
        <span class="tag">{reviewCategoryLabel(r.category)}</span>
      </div>
      <h2 class="review-title">
        <a href={`#/resenas/${r.id}`}>{r.title}</a>
      </h2>
      {r.spoiler && !shown ? (
        <button class="spoiler-cover" onClick={() => setShown(true)} data-testid="spoiler-cover">
          {t('reviews.spoiler')} · <span>{t('reviews.showReview')}</span>
        </button>
      ) : (
        <p class="review-body">{excerpt}</p>
      )}
      <div class="review-foot">
        <span class="muted">
          {r.authorName} · {fmtDate(r.createdAt)}
          {r.updatedAt ? ` · ${t('common.edited')}` : ''}
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
        <IconBack size={18} /> {t('reviews.title')}
      </a>
      <ErrorNote error={res.error} />
      {r && (
        <article class="review-full" data-testid="review-full">
          <p class="review-book">
            <strong>{r.bookTitle}</strong> · {r.bookAuthor} <span class="tag">{reviewCategoryLabel(r.category)}</span>
          </p>
          <h1 class="page-title">{r.title}</h1>
          <p class="muted">
            {r.authorName} · {fmtDate(r.createdAt)}
            {r.updatedAt ? ` · ${t('reviews.editedOn', { date: fmtDate(r.updatedAt) })}` : ''}
          </p>
          {r.spoiler && !shown ? (
            <button class="spoiler-cover" onClick={() => setShown(true)} data-testid="spoiler-cover">
              {t('reviews.spoiler')} · <span>{t('reviews.showReview')}</span>
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
  if (!ready || (id && existing.loading)) return <p class="loading">{t('common.loading')}</p>;
  if (!allowed('reviewsWrite', user)) {
    return (
      <section class="narrow">
        <Gate reason="account" title={t('reviews.gate.title')}>
          <p>{t('reviews.gate.body')}</p>
        </Gate>
      </section>
    );
  }
  if (id && existing.data && !isOwner(user, existing.data)) {
    return (
      <section class="narrow">
        <p class="form-error">{t('reviews.form.notOwner')}</p>
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
        <IconBack size={18} /> {id ? t('reviews.form.back') : t('reviews.title')}
      </a>
      <PageHead title={id ? t('reviews.edit') : t('reviews.form.newTitle')} />
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
            <span class="field-label">{t('field.bookTitle')}</span>
            <input class="input" required maxLength={TEXT_LIMITS.bookTitle} value={f.bookTitle} onInput={upd('bookTitle')} name="bookTitle" />
          </label>
          <label class="field">
            <span class="field-label">{t('field.bookAuthor')}</span>
            <input class="input" required maxLength={TEXT_LIMITS.bookAuthor} value={f.bookAuthor} onInput={upd('bookAuthor')} name="bookAuthor" />
          </label>
        </div>
        <label class="field">
          <span class="field-label">{t('reviews.form.category')}</span>
          <select class="input select" required value={f.category} onChange={upd('category')} name="category">
            <option value="">{t('field.categoryPlaceholder')}</option>
            {REVIEW_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {reviewCategoryLabel(c)}
              </option>
            ))}
          </select>
        </label>
        <label class="field">
          <span class="field-label">{t('field.reviewTitle')}</span>
          <input class="input" required maxLength={TEXT_LIMITS.reviewTitle} value={f.title} onInput={upd('title')} name="title" />
        </label>
        <label class="field">
          <span class="field-label">{t('field.reviewBody')}</span>
          <textarea class="input textarea" required rows={9} maxLength={TEXT_LIMITS.reviewBody} value={f.body} onInput={upd('body')} name="body" />
        </label>
        <label class="check">
          <input type="checkbox" checked={f.spoiler} onChange={upd('spoiler')} name="spoiler" /> {t('reviews.form.spoiler')}
        </label>
        <ErrorNote error={error} />
        <button class="btn btn-primary btn-block" disabled={busy} data-testid="review-submit">
          {id ? t('common.saveChanges') : t('reviews.form.publish')}
        </button>
      </form>
    </section>
  );
}
