/** Errores de los servicios, con un código para que la interfaz sepa qué ofrecer. */

export type ServiceErrorCode =
  /** Hace falta iniciar sesión. */
  | 'auth-required'
  /** La función es del plan premium. */
  | 'premium-required'
  /** No es del usuario (editar o borrar lo ajeno). */
  | 'forbidden'
  /** Datos inválidos (el mensaje dice cuál). */
  | 'invalid'
  | 'not-found'
  /** Ya existe (correo o nombre de usuario). */
  | 'exists'
  | 'bad-credentials'
  /** La biblioteca llegó al límite del plan. */
  | 'limit'
  /** El servicio (servidor, correo, pagos) todavía no está conectado. */
  | 'unavailable';

export class ServiceError extends Error {
  constructor(
    public readonly code: ServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export const isServiceError = (e: unknown, code?: ServiceErrorCode): e is ServiceError =>
  e instanceof ServiceError && (!code || e.code === code);
