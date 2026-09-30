/** Piezas comunes de las páginas de secciones. */
import type { ComponentChildren } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { signInHref } from '../router';
import { useAccount } from '../services/account';
import { isServiceError } from '../services/errors';
import { IconLock, IconSpark } from './icons';

export function PageHead({ title, lead, actions }: { title: string; lead?: ComponentChildren; actions?: ComponentChildren }) {
  return (
    <div class="page-head">
      <div>
        <h1 class="page-title">{title}</h1>
        {lead && <p class="page-lead">{lead}</p>}
      </div>
      {actions && <div class="page-actions">{actions}</div>}
    </div>
  );
}

/** Aviso del modo de prueba local: no es una cuenta real ni una comunidad compartida. */
export function LocalModeNote({ what }: { what: string }) {
  const { backendKind } = useAccount();
  if (backendKind !== 'local') return null;
  return (
    <p class="local-note" data-testid="local-note">
      <IconLock size={15} /> <strong>Prueba local.</strong> {what} se guardan solo en este dispositivo: todavía no hay un servidor de cuentas conectado, así
      que no se sincroniza ni lo ven otras personas.
    </p>
  );
}

/** Explica por qué algo no está disponible y ofrece el paso siguiente. */
export function Gate({ reason, title, children }: { reason: 'account' | 'premium'; title: string; children?: ComponentChildren }) {
  const { user } = useAccount();
  return (
    <div class="gate" data-testid={`gate-${reason}`}>
      <span class="gate-icon" aria-hidden="true">
        {reason === 'premium' ? <IconSpark size={26} /> : <IconLock size={24} />}
      </span>
      <h2 class="gate-title">{title}</h2>
      {children}
      <div class="gate-actions">
        {reason === 'premium' && (
          <a class="btn btn-primary" href="#/planes" data-testid="see-plans">
            Ver planes
          </a>
        )}
        {!user && (
          <a class={`btn${reason === 'account' ? ' btn-primary' : ''}`} href={signInHref()}>
            Iniciar sesión
          </a>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ComponentChildren }) {
  return (
    <div class="empty" data-testid="empty-state">
      <p class="empty-title">{title}</p>
      {children}
    </div>
  );
}

export function ErrorNote({ error }: { error: unknown }) {
  if (!error) return null;
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <p class="form-error" role="alert" data-testid="form-error">
      {msg}
    </p>
  );
}

const DATE = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
export const fmtDate = (ts: number): string => DATE.format(new Date(ts));

/** Carga asíncrona con estado; `reload` la repite. */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[]): { data: T | undefined; error: unknown; loading: boolean; reload: () => void } {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fn().then(
      (v) => {
        if (!alive) return;
        setData(v);
        setError(null);
        setLoading(false);
      },
      (e) => {
        if (!alive) return;
        setError(e);
        setLoading(false);
      },
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload };
}

/** Un error del servicio que corresponde mostrar como puerta (cuenta o premium). */
export const gateReason = (e: unknown): 'account' | 'premium' | null =>
  isServiceError(e, 'premium-required') ? 'premium' : isServiceError(e, 'auth-required') ? 'account' : null;
