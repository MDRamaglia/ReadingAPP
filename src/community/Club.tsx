/**
 * Reading Club: el foro para personas de 16 años o más con el plan premium.
 *
 * Al entrar se controla, en este orden: sesión iniciada, fecha de nacimiento
 * (se pide la primera vez, antes de ofrecer premium), edad mínima y plan.
 * Quien no cumple ve qué falta; la lectura de las conversaciones y la
 * participación quedan reservadas (y el servicio lo vuelve a validar).
 */
import { useState } from 'preact/hooks';
import { CLUB_CATEGORIES, CLUB_MIN_AGE, TEXT_LIMITS, clubCategoryLabel } from '../config/community';
import { t, type Key } from '../i18n';
import { canUse, type AccessReason } from '../lib/access';
import { BIRTH_YEAR_MIN, birthDateProblem, localDate, toIsoDate } from '../lib/age';
import { navigate } from '../router';
import { setBirthDate, useAccount } from '../services/account';
import { backend } from '../services/backend';
import { isOwner } from '../services/rules';
import type { ClubReply, ThreadInput } from '../services/types';
import { Sheet } from '../ui/Sheet';
import { IconBack, IconClub, IconEdit, IconLock, IconTrash } from '../ui/icons';
import { EmptyState, ErrorNote, Gate, LocalModeNote, PageHead, fmtCalendarDate, fmtDate, useLoad } from '../ui/page';

const OFFER: Array<[Key, Key]> = [
  ['club.offer.questions', 'club.offer.questionsText'],
  ['club.offer.threads', 'club.offer.threadsText'],
  ['club.offer.ownTexts', 'club.offer.ownTextsText'],
];

function ClubLanding({ reason }: { reason: 'account' | 'premium' }) {
  return (
    <section>
      <PageHead title={t('club.title')} lead={t('club.landing.lead')} />
      <div class="offer-grid" data-testid="club-landing">
        {OFFER.map(([title, text]) => (
          <div class="card offer" key={title}>
            <p class="offer-title">{t(title)}</p>
            <p class="muted">{t(text)}</p>
          </div>
        ))}
      </div>
      <p class="club-age-note" data-testid="club-age-note">
        {t('club.ageNote', { age: CLUB_MIN_AGE })}
      </p>
      <Gate reason="premium" title={t('club.premiumOnly')}>
        <p>
          {t('club.gate.body')}
          {reason === 'account' ? ` ${t('club.gate.signInHint')}` : ''}
        </p>
      </Gate>
    </section>
  );
}

/**
 * Primera entrada con sesión: se pide la fecha de nacimiento, que después no
 * se puede cambiar desde la app. No se ofrece premium hasta saber la edad.
 */
function BirthDateStep() {
  const [value, setValue] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const today = toIsoDate(localDate());
  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      // Al guardarse, la sesión se actualiza y la página muestra el paso siguiente.
      await setBirthDate(value);
    } catch (err) {
      setError(err);
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section class="narrow">
      <PageHead title={t('club.title')} lead={t('club.landing.lead')} />
      <div class="card age-card" data-testid="club-birth">
        <h2 class="gate-title">{t('club.birth.title')}</h2>
        <p>{t('club.birth.why', { age: CLUB_MIN_AGE })}</p>
        <form
          class="form"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const problem = birthDateProblem(value);
            if (problem) {
              const key: Key = problem === 'future' ? 'validation.birthFuture' : problem === 'too-old' ? 'validation.birthTooOld' : 'validation.birthInvalid';
              setError(new Error(t(key, { year: BIRTH_YEAR_MIN })));
              return;
            }
            setConfirming(true);
          }}
        >
          <label class="field">
            <span class="field-label">{t('field.birthDate')}</span>
            <input
              class="input"
              type="date"
              name="birthDate"
              required
              min={`${BIRTH_YEAR_MIN}-01-01`}
              max={today}
              value={value}
              onInput={(e) => setValue(e.currentTarget.value)}
              autocomplete="bday"
            />
            <small class="field-help">{t('club.birth.locked')}</small>
          </label>
          <ErrorNote error={error} />
          <button class="btn btn-primary btn-block" disabled={busy} data-testid="birth-submit">
            {t('common.continue')}
          </button>
        </form>
      </div>
      {confirming && (
        <Sheet title={t('club.birth.confirmTitle')} onClose={() => setConfirming(false)} testId="birth-confirm-sheet">
          <p>
            {t('club.birth.confirmDate')} <strong data-testid="birth-confirm-date">{fmtCalendarDate(value)}</strong>
          </p>
          <p>{t('club.birth.locked')}</p>
          <div class="row-end">
            <button class="btn btn-quiet" onClick={() => setConfirming(false)} data-testid="birth-edit">
              {t('club.birth.edit')}
            </button>
            <button class="btn btn-primary" disabled={busy} onClick={() => void save()} data-testid="birth-confirm">
              {t('club.birth.confirm')}
            </button>
          </div>
        </Sheet>
      )}
    </section>
  );
}

/** Menor de la edad mínima: el club no está disponible y no se le ofrece premium para entrar. */
function AgeBlocked() {
  return (
    <section class="narrow">
      <PageHead title={t('club.title')} />
      <div class="gate" data-testid="club-age-blocked">
        <span class="gate-icon" aria-hidden="true">
          <IconLock size={24} />
        </span>
        <h2 class="gate-title">{t('club.age.blockedTitle')}</h2>
        <p>{t('club.age.blockedBody', { age: CLUB_MIN_AGE })}</p>
        <div class="gate-actions">
          <a class="btn btn-primary" href="#/">
            {t('club.age.goLibrary')}
          </a>
        </div>
      </div>
    </section>
  );
}

/** Lo que ve quien todavía no puede entrar, según el motivo. */
function ClubGate({ reason }: { reason: AccessReason }) {
  if (reason === 'age-unknown') return <BirthDateStep />;
  if (reason === 'age') return <AgeBlocked />;
  return <ClubLanding reason={reason} />;
}

export function ClubPage() {
  const { user, ready } = useAccount();
  const access = canUse('club', user);
  const [category, setCategory] = useState('');
  const list = useLoad(async () => (access.ok ? (await backend()).listThreads({ category: category || undefined }) : []), [access.ok, category, user?.id]);
  if (!ready) return <p class="loading">{t('common.loading')}</p>;
  if (!access.ok) return <ClubGate reason={access.reason} />;
  return (
    <section>
      <PageHead
        title={t('club.title')}
        lead={t('club.lead')}
        actions={
          <a class="btn btn-primary" href="#/club/nueva" data-testid="new-thread">
            <IconEdit size={18} /> {t('club.newPost')}
          </a>
        }
      />
      <LocalModeNote what={t('localNote.club')} />
      <div class="chips" role="radiogroup" aria-label={t('field.category')}>
        {['', ...CLUB_CATEGORIES].map((c) => (
          <button key={c || 'todas'} role="radio" aria-checked={category === c} class={`chip${category === c ? ' is-on' : ''}`} onClick={() => setCategory(c)}>
            {c ? clubCategoryLabel(c) : t('club.allCategories')}
          </button>
        ))}
      </div>
      <ErrorNote error={list.error} />
      {list.data?.length === 0 && (
        <EmptyState title={category ? t('club.emptyCategory', { category: clubCategoryLabel(category) }) : t('club.empty')}>
          <p>
            {t('club.emptyHint')} <a href="#/club/nueva">{t('club.newPost')}</a>
          </p>
        </EmptyState>
      )}
      <ul class="thread-list" data-testid="thread-list">
        {list.data?.map((th) => (
          <li key={th.id} class="card thread-card" data-testid="thread-card">
            <a href={`#/club/${th.id}`} class="thread-link">
              <span class="tag">{clubCategoryLabel(th.category)}</span>
              <span class="thread-title">{th.title}</span>
              <span class="muted">
                {th.authorName} · {fmtDate(th.createdAt)} · {t('club.replies', { count: th.replyCount })}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ConfirmDelete({ what, onConfirm, onClose }: { what: 'thread' | 'reply'; onConfirm: () => Promise<void>; onClose: () => void }) {
  return (
    <Sheet title={what === 'thread' ? t('club.delete.threadTitle') : t('club.delete.replyTitle')} onClose={onClose}>
      <p>{what === 'thread' ? t('club.delete.threadBody') : t('club.delete.replyBody')}</p>
      <div class="row-end">
        <button class="btn btn-quiet" onClick={onClose}>
          {t('common.cancel')}
        </button>
        <button class="btn btn-danger" data-testid="confirm-delete-post" onClick={() => void onConfirm()}>
          {t('common.delete')}
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
        {reply.updatedAt ? ` · ${t('common.edited')}` : ''}
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
          <textarea
            class="input textarea"
            rows={4}
            value={text}
            onInput={(e) => setText(e.currentTarget.value)}
            maxLength={TEXT_LIMITS.replyBody}
            aria-label={t('club.reply.editLabel')}
          />
          <ErrorNote error={error} />
          <div class="row-end">
            <button type="button" class="btn btn-quiet" onClick={() => setEditing(false)}>
              {t('common.cancel')}
            </button>
            <button class="btn btn-primary" data-testid="save-reply">
              {t('common.save')}
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
            <IconEdit size={16} /> {t('common.edit')}
          </button>
          <button class="btn btn-quiet btn-small" onClick={() => setConfirm(true)} data-testid="delete-reply">
            <IconTrash size={16} /> {t('common.delete')}
          </button>
        </div>
      )}
      {confirm && (
        <ConfirmDelete
          what="reply"
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
  if (!ready) return <p class="loading">{t('common.loading')}</p>;
  if (!access.ok) return <ClubGate reason={access.reason} />;
  const th = res.data?.thread;
  return (
    <section class="narrow">
      <a class="back-link" href="#/club">
        <IconBack size={18} /> {t('club.title')}
      </a>
      <ErrorNote error={res.error} />
      {th && (
        <article class="thread-full" data-testid="thread-full">
          <span class="tag">{clubCategoryLabel(th.category)}</span>
          <h1 class="page-title">{th.title}</h1>
          <p class="muted">
            {th.authorName} · {fmtDate(th.createdAt)}
            {th.updatedAt ? ` · ${t('common.edited')}` : ''}
          </p>
          <div class="post-text">
            {th.body.split(/\n{2,}/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {isOwner(user, th) && (
            <div class="post-tools">
              <a class="btn btn-quiet btn-small" href={`#/club/${th.id}/editar`} data-testid="edit-thread">
                <IconEdit size={16} /> {t('common.edit')}
              </a>
              <button class="btn btn-quiet btn-small" onClick={() => setConfirm(true)} data-testid="delete-thread">
                <IconTrash size={16} /> {t('common.delete')}
              </button>
            </div>
          )}
          <h2 class="section-title">
            <IconClub size={18} /> {t('club.replies', { count: th.replyCount })}
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
                await (await backend()).createReply(th.id, text);
                setText('');
                res.reload();
              } catch (err) {
                setError(err);
              }
            }}
          >
            <label class="field">
              <span class="field-label">{t('club.reply.label')}</span>
              <textarea class="input textarea" rows={4} required maxLength={TEXT_LIMITS.replyBody} value={text} onInput={(e) => setText(e.currentTarget.value)} name="reply" />
            </label>
            <ErrorNote error={error} />
            <button class="btn btn-primary" data-testid="reply-submit">
              {t('club.reply.submit')}
            </button>
          </form>
          {confirm && (
            <ConfirmDelete
              what="thread"
              onClose={() => setConfirm(false)}
              onConfirm={async () => {
                await (await backend()).deleteThread(th.id);
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
  if (!ready || (id && existing.loading)) return <p class="loading">{t('common.loading')}</p>;
  if (!access.ok) return <ClubGate reason={access.reason} />;
  const th = existing.data?.thread;
  if (id && th && !isOwner(user, th)) {
    return (
      <section class="narrow">
        <p class="form-error">{t('club.form.notOwner')}</p>
      </section>
    );
  }
  return <ThreadForm id={id} initial={th ? { title: th.title, body: th.body, category: th.category } : { title: '', body: '', category: '' }} />;
}

function ThreadForm({ id, initial }: { id?: string; initial: ThreadInput }) {
  const [f, setF] = useState(initial);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const upd = (k: keyof ThreadInput) => (e: Event) => setF((s) => ({ ...s, [k]: (e.currentTarget as HTMLInputElement).value }));
  return (
    <section class="narrow">
      <a class="back-link" href={id ? `#/club/${id}` : '#/club'}>
        <IconBack size={18} /> {id ? t('club.form.backToThread') : t('club.title')}
      </a>
      <PageHead title={id ? t('club.form.editTitle') : t('club.newPost')} lead={t('club.form.lead')} />
      <form
        class="form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const b = await backend();
            const saved = id ? await b.updateThread(id, f) : await b.createThread(f);
            navigate(`/club/${saved.id}`);
          } catch (err) {
            setError(err);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label class="field">
          <span class="field-label">{t('field.threadTitle')}</span>
          <input class="input" required maxLength={TEXT_LIMITS.threadTitle} value={f.title} onInput={upd('title')} name="title" />
        </label>
        <label class="field">
          <span class="field-label">{t('field.category')}</span>
          <select class="input select" required value={f.category} onChange={upd('category')} name="category">
            <option value="">{t('field.categoryPlaceholder')}</option>
            {CLUB_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {clubCategoryLabel(c)}
              </option>
            ))}
          </select>
        </label>
        <label class="field">
          <span class="field-label">{t('field.threadBody')}</span>
          <textarea class="input textarea" required rows={10} maxLength={TEXT_LIMITS.threadBody} value={f.body} onInput={upd('body')} name="body" />
        </label>
        <ErrorNote error={error} />
        <button class="btn btn-primary btn-block" disabled={busy} data-testid="thread-submit">
          {id ? t('common.saveChanges') : t('club.form.publish')}
        </button>
      </form>
    </section>
  );
}
