/** Cuenta: ingreso, registro, recuperación de contraseña y perfil. */
import { useState } from 'preact/hooks';
import { PLANS } from '../config/plans';
import { CLUB_MIN_AGE, clubCategoryLabel, TEXT_LIMITS } from '../config/community';
import { t } from '../i18n';
import { canUse } from '../lib/access';
import { navigate } from '../router';
import { signIn, signOut, signUp, useAccount } from '../services/account';
import { backend } from '../services/backend';
import { ErrorNote, LocalModeNote, PageHead, fmtCalendarDate, fmtDate, useLoad } from '../ui/page';
import { IconHeart } from '../ui/icons';

const goBack = (back?: string) => navigate(back && back.startsWith('/') ? back : '/cuenta');

export function SignInPage({ back }: { back?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const qs = back ? `?volver=${encodeURIComponent(back)}` : '';
  return (
    <section class="narrow">
      <PageHead title={t('account.signIn.title')} lead={t('account.signIn.lead')} />
      <LocalModeNote what={t('localNote.account')} />
      <form
        class="form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await signIn(email, password);
            goBack(back);
          } catch (err) {
            setError(err);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label class="field">
          <span class="field-label">{t('field.email')}</span>
          <input class="input" type="email" autocomplete="email" required value={email} onInput={(e) => setEmail(e.currentTarget.value)} name="email" />
        </label>
        <label class="field">
          <span class="field-label">{t('field.password')}</span>
          <input class="input" type="password" autocomplete="current-password" required value={password} onInput={(e) => setPassword(e.currentTarget.value)} name="password" />
        </label>
        <ErrorNote error={error} />
        <button class="btn btn-primary btn-block" disabled={busy} data-testid="signin-submit">
          {t('common.signIn')}
        </button>
      </form>
      <p class="form-links">
        <a href="#/cuenta/recuperar">{t('account.signIn.forgot')}</a> · <a href={`#/cuenta/registro${qs}`}>{t('account.createAccount')}</a>
      </p>
    </section>
  );
}

export function SignUpPage({ back }: { back?: string }) {
  const [f, setF] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const qs = back ? `?volver=${encodeURIComponent(back)}` : '';
  const upd = (k: keyof typeof f) => (e: Event) => setF((s) => ({ ...s, [k]: (e.currentTarget as HTMLInputElement).value }));
  return (
    <section class="narrow">
      <PageHead title={t('account.signUp.title')} lead={t('account.signUp.lead')} />
      <LocalModeNote what={t('localNote.account')} />
      <form
        class="form"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          if (f.password !== f.confirm) {
            setError(new Error(t('account.signUp.mismatch')));
            return;
          }
          setBusy(true);
          try {
            await signUp({ username: f.username, email: f.email, password: f.password });
            goBack(back);
          } catch (err) {
            setError(err);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label class="field">
          <span class="field-label">{t('field.username')}</span>
          <input class="input" required autocomplete="username" maxLength={TEXT_LIMITS.username.max} value={f.username} onInput={upd('username')} name="username" />
          <small class="field-help">{t('account.signUp.usernameHelp')}</small>
        </label>
        <label class="field">
          <span class="field-label">{t('field.email')}</span>
          <input class="input" type="email" required autocomplete="email" value={f.email} onInput={upd('email')} name="email" />
        </label>
        <label class="field">
          <span class="field-label">{t('field.password')}</span>
          <input class="input" type="password" required autocomplete="new-password" minLength={TEXT_LIMITS.password.min} value={f.password} onInput={upd('password')} name="password" />
          <small class="field-help">{t('account.signUp.passwordHelp', { count: TEXT_LIMITS.password.min })}</small>
        </label>
        <label class="field">
          <span class="field-label">{t('account.signUp.confirm')}</span>
          <input class="input" type="password" required autocomplete="new-password" value={f.confirm} onInput={upd('confirm')} name="confirm" />
        </label>
        <ErrorNote error={error} />
        <button class="btn btn-primary btn-block" disabled={busy} data-testid="signup-submit">
          {t('account.signUp.submit')}
        </button>
      </form>
      <p class="form-links">
        {t('account.signUp.haveAccount')} <a href={`#/cuenta/ingresar${qs}`}>{t('common.signIn')}</a>
      </p>
    </section>
  );
}

export function RecoverPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [error, setError] = useState<unknown>(null);
  return (
    <section class="narrow">
      <PageHead title={t('account.recover.title')} lead={t('account.recover.lead')} />
      <form
        class="form"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          try {
            setResult(await (await backend()).requestPasswordReset(email));
          } catch (err) {
            setError(err);
          }
        }}
      >
        <label class="field">
          <span class="field-label">{t('account.recover.email')}</span>
          <input class="input" type="email" required autocomplete="email" value={email} onInput={(e) => setEmail(e.currentTarget.value)} name="email" />
        </label>
        <ErrorNote error={error} />
        {result && (
          <p class={result.ok ? 'form-ok' : 'form-pending'} role="status" data-testid="recover-result">
            {result.message}
          </p>
        )}
        <button class="btn btn-primary btn-block">{t('account.recover.submit')}</button>
      </form>
      <p class="form-links">
        <a href="#/cuenta/ingresar">{t('account.recover.back')}</a>
      </p>
    </section>
  );
}

export function ProfilePage() {
  const { user, ready } = useAccount();
  if (!ready) return <p class="loading">{t('common.loading')}</p>;
  if (!user) {
    return (
      <section class="narrow">
        <PageHead title={t('account.profile.guestTitle')} lead={t('account.profile.guestLead')} />
        <LocalModeNote what={t('localNote.accounts')} />
        <div class="card-actions">
          <a class="btn btn-primary" href="#/cuenta/registro" data-testid="go-signup">
            {t('account.createAccount')}
          </a>
          <a class="btn" href="#/cuenta/ingresar" data-testid="go-signin">
            {t('common.signIn')}
          </a>
        </div>
      </section>
    );
  }
  return <Profile />;
}

function Profile() {
  const { user } = useAccount();
  const u = user!;
  const plan = PLANS[u.plan];
  const reviews = useLoad(async () => (await backend()).listReviews({ authorId: u.id, sort: 'recent' }), [u.id]);
  const club = canUse('club', u);
  const posts = useLoad(async () => {
    if (!club.ok) return null;
    const b = await backend();
    const [threads, replies] = await Promise.all([b.listThreads({ authorId: u.id }), b.listReplies({ authorId: u.id })]);
    return { threads, replies };
  }, [u.id, club.ok]);
  const [planMsg, setPlanMsg] = useState('');
  const act = async (fn: 'manage' | 'cancel') => setPlanMsg((await (await backend()).subscription[fn]()).message);

  return (
    <section>
      <PageHead
        title={u.username}
        lead={t('account.profile.lead', { email: u.email, date: fmtDate(u.createdAt) })}
        actions={
          <button
            class="btn"
            data-testid="signout"
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
          >
            {t('account.profile.signOut')}
          </button>
        }
      />
      <LocalModeNote what={t('localNote.profile')} />

      <div class="card plan-card" data-testid="plan-card">
        <div class="plan-card-head">
          <div>
            <p class="kicker">{t('account.profile.plan')}</p>
            <p class="plan-name" data-testid="profile-plan">
              {plan.name}
            </p>
            <p class="muted">{plan.summary}</p>
          </div>
          {u.plan === 'premium' && <span class="plan-pill">{t('plans.pill')}</span>}
        </div>
        <div class="card-actions">
          {u.plan === 'free' ? (
            <a class="btn btn-primary" href="#/planes">
              {t('account.profile.learnPremium')}
            </a>
          ) : (
            <>
              <button class="btn" onClick={() => void act('manage')} data-testid="manage-plan">
                {t('account.profile.manage')}
              </button>
              <button class="btn btn-quiet" onClick={() => void act('cancel')} data-testid="cancel-plan">
                {t('account.profile.cancel')}
              </button>
            </>
          )}
          <a class="btn btn-quiet" href="#/planes">
            {t('account.profile.compare')}
          </a>
        </div>
        {planMsg && (
          <p class="form-pending" role="status" data-testid="plan-msg">
            {planMsg}
          </p>
        )}
      </div>

      <div class="card birth-card" data-testid="birth-card">
        <p class="kicker">{t('field.birthDate')}</p>
        {u.birthDate ? (
          <>
            <p class="birth-date" data-testid="profile-birth-date">
              {fmtCalendarDate(u.birthDate)}
            </p>
            <p class="muted" data-testid="birth-date-locked">
              {t('account.profile.birthLocked')}
            </p>
          </>
        ) : (
          <p class="muted" data-testid="birth-date-missing">
            {t('account.profile.birthMissing', { age: CLUB_MIN_AGE })}
          </p>
        )}
      </div>

      <h2 class="section-title">{t('account.profile.myReviews')}</h2>
      {reviews.data?.length ? (
        <ul class="plain-list" data-testid="my-reviews">
          {reviews.data.map((r) => (
            <li key={r.id}>
              <a href={`#/resenas/${r.id}`}>
                <strong>{r.title}</strong> — {r.bookTitle}
              </a>
              <span class="muted">
                {' '}
                · {fmtDate(r.createdAt)} · <IconHeart size={14} /> {r.likes}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p class="muted">
          {t('account.profile.noReviews')} <a href="#/resenas/nueva">{t('account.profile.writeFirst')}</a>.
        </p>
      )}

      <h2 class="section-title">{t('account.profile.myPosts')}</h2>
      {!club.ok && club.reason === 'age' ? (
        <p class="muted">{t('club.ageNote', { age: CLUB_MIN_AGE })}</p>
      ) : !club.ok && club.reason === 'age-unknown' ? (
        <p class="muted">
          {t('account.profile.clubAgeUnknown', { age: CLUB_MIN_AGE })} <a href="#/club">{t('account.profile.goClub')}</a>.
        </p>
      ) : !club.ok ? (
        <p class="muted">
          {t('account.profile.clubPremium')} <a href="#/planes">{t('common.seePlans')}</a>.
        </p>
      ) : posts.data && (posts.data.threads.length || posts.data.replies.length) ? (
        <ul class="plain-list" data-testid="my-posts">
          {posts.data.threads.map((th) => (
            <li key={th.id}>
              <a href={`#/club/${th.id}`}>
                <strong>{th.title}</strong>
              </a>
              <span class="muted">
                {' '}
                · {clubCategoryLabel(th.category)} · {fmtDate(th.createdAt)}
              </span>
            </li>
          ))}
          {posts.data.replies.map((r) => (
            <li key={r.id}>
              <a href={`#/club/${r.threadId}`}>{t('account.profile.replyItem', { text: r.body.length > 80 ? `${r.body.slice(0, 80)}…` : r.body })}</a>
              <span class="muted"> · {fmtDate(r.createdAt)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p class="muted">
          {t('account.profile.noPosts')} <a href="#/club/nueva">{t('account.profile.openThread')}</a>.
        </p>
      )}
    </section>
  );
}
