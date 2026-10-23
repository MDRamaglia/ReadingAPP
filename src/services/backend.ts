/**
 * Punto de integración con el servicio de cuentas y comunidad.
 *
 * Toda la app habla con este contrato y nunca con una implementación
 * concreta. Hoy hay dos:
 *   - `local`: servicio de prueba que guarda cuentas, reseñas y el Reading
 *     Club en este dispositivo (IndexedDB). Aplica las mismas reglas que
 *     deberá aplicar el servidor, pero no es una cuenta real: no se
 *     sincroniza, no manda correos y otras personas no ven lo publicado.
 *   - `remote`: lugar previsto para el servidor real. Todavía no está
 *     conectado (falta elegir el proveedor y sus credenciales); ver
 *     docs/backend.md.
 * Se elige con la variable de compilación VITE_BACKEND ('local' o 'remote').
 */
import type { PlanId } from '../config/plans';
import { t } from '../i18n';
import type {
  ClubReply,
  ClubThread,
  Review,
  ReviewInput,
  ReviewQuery,
  SignUpInput,
  ThreadInput,
  User,
} from './types';

export interface SubscriptionInfo {
  plan: PlanId;
  /** Estado de la suscripción paga, cuando exista. */
  status: 'none' | 'active' | 'canceling';
  renewsAt?: number;
}

export interface PendingAction {
  ok: boolean;
  message: string;
}

/** Contratación y gestión del plan (pendiente de la plataforma de pagos). */
export interface SubscriptionService {
  get(user: User | null): Promise<SubscriptionInfo>;
  startCheckout(plan: PlanId): Promise<PendingAction>;
  cancel(): Promise<PendingAction>;
  manage(): Promise<PendingAction>;
}

export interface Backend {
  readonly kind: 'local' | 'remote';
  /** Descripción para mostrar al usuario (por ejemplo, «Prueba local en este dispositivo»), en el idioma actual. */
  readonly label: string;

  // ——— Cuentas ———
  currentUser(): Promise<User | null>;
  signUp(input: SignUpInput): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<PendingAction>;
  /**
   * Guarda la fecha de nacimiento («AAAA-MM-DD») del usuario actual, que se
   * pide al entrar por primera vez al Reading Club. Se carga una sola vez:
   * si ya hay una, responde 'forbidden' (no se cambia desde la app). Una
   * fecha inexistente, futura o anterior a 1900 responde 'invalid'.
   */
  setBirthDate(date: string): Promise<User>;

  // ——— Reseñas ———
  listReviews(q: ReviewQuery): Promise<Review[]>;
  getReview(id: string): Promise<Review>;
  createReview(input: ReviewInput): Promise<Review>;
  updateReview(id: string, input: ReviewInput): Promise<Review>;
  deleteReview(id: string): Promise<void>;
  /** Da o retira el like del usuario actual (uno por persona y reseña). */
  toggleLike(id: string): Promise<{ liked: boolean; likes: number }>;

  // ——— Reading Club (16 años o más y premium) ———
  listThreads(q: { category?: string; authorId?: string }): Promise<ClubThread[]>;
  getThread(id: string): Promise<{ thread: ClubThread; replies: ClubReply[] }>;
  createThread(input: ThreadInput): Promise<ClubThread>;
  updateThread(id: string, input: ThreadInput): Promise<ClubThread>;
  deleteThread(id: string): Promise<void>;
  listReplies(q: { authorId: string }): Promise<ClubReply[]>;
  createReply(threadId: string, body: string): Promise<ClubReply>;
  updateReply(id: string, body: string): Promise<ClubReply>;
  deleteReply(id: string): Promise<void>;

  subscription: SubscriptionService;

  /**
   * Herramientas exclusivas de desarrollo (solo el servicio local de prueba):
   * permiten verificar el plan premium sin pagos. Un servidor real no las
   * expone; allí el plan lo determina la suscripción.
   */
  dev?: { setPlan(plan: PlanId): Promise<User> };
}

/** Respuestas de la contratación mientras no haya plataforma de pagos. */
export const pendingSubscriptions = (current: () => Promise<User | null>): SubscriptionService => ({
  async get(user) {
    return { plan: user?.plan ?? 'free', status: user?.plan === 'premium' ? 'active' : 'none' };
  },
  async startCheckout() {
    return { ok: false, message: t('subscription.checkoutSoon') };
  },
  async cancel() {
    const user = await current();
    return {
      ok: false,
      message: user?.plan === 'premium' ? t('subscription.manageSoon') : t('subscription.noActive'),
    };
  },
  async manage() {
    return { ok: false, message: t('subscription.manageSoon') };
  },
});

let instance: Promise<Backend> | null = null;

/** El servicio configurado para esta compilación. */
export function backend(): Promise<Backend> {
  instance ??= (async () => {
    const kind = (import.meta.env.VITE_BACKEND as string | undefined) ?? 'local';
    if (kind === 'remote') {
      const { createRemoteBackend } = await import('./remoteBackend');
      return createRemoteBackend();
    }
    const { LocalBackend } = await import('./localBackend');
    return new LocalBackend();
  })();
  return instance;
}

/** Solo para pruebas: reemplaza el servicio. */
export function setBackendForTests(b: Backend | null): void {
  instance = b ? Promise.resolve(b) : null;
}
