/**
 * Lugar previsto para el servidor real de cuentas y comunidad.
 *
 * PENDIENTE: todavía no hay proveedor ni credenciales. Hasta que se conecte,
 * cada operación responde que el servicio no está disponible, para que la
 * interfaz lo explique en lugar de simular una cuenta.
 *
 * Al conectarlo (ver docs/backend.md, con el esquema y las reglas de acceso):
 *   - cuentas: registro, inicio y cierre de sesión y recuperación de
 *     contraseña por correo, con el proveedor de autenticación elegido;
 *   - datos: reseñas, likes (uno por usuario y reseña), hilos y respuestas;
 *   - reglas en el servidor: propiedad de lo publicado, 16 años o más y plan
 *     premium para el Reading Club (con la fecha de nacimiento cargada una
 *     sola vez) y límite de documentos por plan (config/plans.ts);
 *   - plan del usuario: lo determina la suscripción en la plataforma de pagos.
 */
import { t } from '../i18n';
import { ServiceError } from './errors';
import { pendingSubscriptions, type Backend } from './backend';

const pending = () => Promise.reject(new ServiceError('unavailable', t('service.remote.pending')));

export function createRemoteBackend(): Backend {
  return {
    kind: 'remote',
    get label() {
      return t('service.remote.label');
    },
    currentUser: async () => null,
    signUp: pending,
    signIn: pending,
    signOut: async () => undefined,
    requestPasswordReset: pending,
    setBirthDate: pending,
    listReviews: pending,
    getReview: pending,
    createReview: pending,
    updateReview: pending,
    deleteReview: pending,
    toggleLike: pending,
    listThreads: pending,
    getThread: pending,
    createThread: pending,
    updateThread: pending,
    deleteThread: pending,
    listReplies: pending,
    createReply: pending,
    updateReply: pending,
    deleteReply: pending,
    subscription: pendingSubscriptions(async () => null),
  };
}
