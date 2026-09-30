/** Cuenta: ingreso, registro, recuperación de contraseña y perfil. */
import { useState } from 'preact/hooks';
import { PLANS } from '../config/plans';
import { TEXT_LIMITS } from '../config/community';
import { navigate } from '../router';
import { signIn, signOut, signUp, useAccount } from '../services/account';
import { backend } from '../services/backend';
import { ErrorNote, LocalModeNote, PageHead, fmtDate, useLoad } from '../ui/page';
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
      <PageHead title="Iniciar sesión" lead="Para publicar reseñas, dar likes y entrar al Reading Club." />
      <LocalModeNote what="La cuenta y lo que publiques" />
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
          <span class="field-label">Correo electrónico</span>
          <input class="input" type="email" autocomplete="email" required value={email} onInput={(e) => setEmail(e.currentTarget.value)} name="email" />
        </label>
        <label class="field">
          <span class="field-label">Contraseña</span>
          <input class="input" type="password" autocomplete="current-password" required value={password} onInput={(e) => setPassword(e.currentTarget.value)} name="password" />
        </label>
        <ErrorNote error={error} />
        <button class="btn btn-primary btn-block" disabled={busy} data-testid="signin-submit">
          Iniciar sesión
        </button>
      </form>
      <p class="form-links">
        <a href="#/cuenta/recuperar">Olvidé mi contraseña</a> · <a href={`#/cuenta/registro${qs}`}>Crear una cuenta</a>
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
      <PageHead title="Crear una cuenta" lead="Con una cuenta podés publicar reseñas y dar likes. El plan gratuito no tiene costo." />
      <LocalModeNote what="La cuenta y lo que publiques" />
      <form
        class="form"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          if (f.password !== f.confirm) {
            setError(new Error('Las contraseñas no coinciden.'));
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
          <span class="field-label">Nombre de usuario</span>
          <input class="input" required autocomplete="username" maxLength={TEXT_LIMITS.username.max} value={f.username} onInput={upd('username')} name="username" />
          <small class="field-help">Así te van a ver en las reseñas y el Reading Club.</small>
        </label>
        <label class="field">
          <span class="field-label">Correo electrónico</span>
          <input class="input" type="email" required autocomplete="email" value={f.email} onInput={upd('email')} name="email" />
        </label>
        <label class="field">
          <span class="field-label">Contraseña</span>
          <input class="input" type="password" required autocomplete="new-password" minLength={TEXT_LIMITS.password.min} value={f.password} onInput={upd('password')} name="password" />
          <small class="field-help">Al menos {TEXT_LIMITS.password.min} caracteres.</small>
        </label>
        <label class="field">
          <span class="field-label">Repetí la contraseña</span>
          <input class="input" type="password" required autocomplete="new-password" value={f.confirm} onInput={upd('confirm')} name="confirm" />
        </label>
        <ErrorNote error={error} />
        <button class="btn btn-primary btn-block" disabled={busy} data-testid="signup-submit">
          Crear cuenta
        </button>
      </form>
      <p class="form-links">
        ¿Ya tenés cuenta? <a href={`#/cuenta/ingresar${qs}`}>Iniciar sesión</a>
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
      <PageHead title="Recuperar la contraseña" lead="Te enviamos un correo con un enlace para crear una contraseña nueva." />
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
          <span class="field-label">Correo electrónico de la cuenta</span>
          <input class="input" type="email" required autocomplete="email" value={email} onInput={(e) => setEmail(e.currentTarget.value)} name="email" />
        </label>
        <ErrorNote error={error} />
        {result && (
          <p class={result.ok ? 'form-ok' : 'form-pending'} role="status" data-testid="recover-result">
            {result.message}
          </p>
        )}
        <button class="btn btn-primary btn-block">Enviar enlace</button>
      </form>
      <p class="form-links">
        <a href="#/cuenta/ingresar">Volver a iniciar sesión</a>
      </p>
    </section>
  );
}

export function ProfilePage() {
  const { user, ready } = useAccount();
  if (!ready) return <p class="loading">Cargando…</p>;
  if (!user) {
    return (
      <section class="narrow">
        <PageHead title="Tu cuenta" lead="Leer no requiere cuenta. Con una cuenta podés publicar reseñas, dar likes y, con premium, participar del Reading Club." />
        <LocalModeNote what="Las cuentas" />
        <div class="card-actions">
          <a class="btn btn-primary" href="#/cuenta/registro" data-testid="go-signup">
            Crear una cuenta
          </a>
          <a class="btn" href="#/cuenta/ingresar" data-testid="go-signin">
            Iniciar sesión
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
  const posts = useLoad(async () => {
    if (u.plan !== 'premium') return null;
    const b = await backend();
    const [threads, replies] = await Promise.all([b.listThreads({ authorId: u.id }), b.listReplies({ authorId: u.id })]);
    return { threads, replies };
  }, [u.id, u.plan]);
  const [planMsg, setPlanMsg] = useState('');
  const act = async (fn: 'manage' | 'cancel') => setPlanMsg((await (await backend()).subscription[fn]()).message);

  return (
    <section>
      <PageHead
        title={u.username}
        lead={
          <>
            {u.email} · en Knowmadic desde el {fmtDate(u.createdAt)}
          </>
        }
        actions={
          <button
            class="btn"
            data-testid="signout"
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
          >
            Cerrar sesión
          </button>
        }
      />
      <LocalModeNote what="Tu cuenta, tus reseñas y tus publicaciones" />

      <div class="card plan-card" data-testid="plan-card">
        <div class="plan-card-head">
          <div>
            <p class="kicker">Tu plan</p>
            <p class="plan-name" data-testid="profile-plan">
              {plan.name}
            </p>
            <p class="muted">{plan.summary}</p>
          </div>
          {u.plan === 'premium' && <span class="plan-pill">Premium</span>}
        </div>
        <div class="card-actions">
          {u.plan === 'free' ? (
            <a class="btn btn-primary" href="#/planes">
              Conocer el plan premium
            </a>
          ) : (
            <>
              <button class="btn" onClick={() => void act('manage')} data-testid="manage-plan">
                Gestionar suscripción
              </button>
              <button class="btn btn-quiet" onClick={() => void act('cancel')} data-testid="cancel-plan">
                Cancelar suscripción
              </button>
            </>
          )}
          <a class="btn btn-quiet" href="#/planes">
            Comparar planes
          </a>
        </div>
        {planMsg && (
          <p class="form-pending" role="status" data-testid="plan-msg">
            {planMsg}
          </p>
        )}
      </div>

      <h2 class="section-title">Mis reseñas</h2>
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
          Todavía no publicaste reseñas. <a href="#/resenas/nueva">Escribir la primera</a>.
        </p>
      )}

      <h2 class="section-title">Mis publicaciones en el Reading Club</h2>
      {u.plan !== 'premium' ? (
        <p class="muted">
          El Reading Club es parte del plan premium. <a href="#/planes">Ver planes</a>.
        </p>
      ) : posts.data && (posts.data.threads.length || posts.data.replies.length) ? (
        <ul class="plain-list" data-testid="my-posts">
          {posts.data.threads.map((t) => (
            <li key={t.id}>
              <a href={`#/club/${t.id}`}>
                <strong>{t.title}</strong>
              </a>
              <span class="muted"> · {t.category} · {fmtDate(t.createdAt)}</span>
            </li>
          ))}
          {posts.data.replies.map((r) => (
            <li key={r.id}>
              <a href={`#/club/${r.threadId}`}>Respuesta: «{r.body.slice(0, 80)}{r.body.length > 80 ? '…' : ''}»</a>
              <span class="muted"> · {fmtDate(r.createdAt)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p class="muted">
          Todavía no publicaste en el Reading Club. <a href="#/club/nueva">Abrir una conversación</a>.
        </p>
      )}
    </section>
  );
}
