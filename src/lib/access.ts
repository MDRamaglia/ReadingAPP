/**
 * Permisos según el plan y la edad: qué puede usar cada quien. Lee la
 * configuración central (config/plans.ts y config/community.ts). La interfaz
 * lo usa para mostrar candados y explicaciones; las reglas del servicio, para
 * rechazar lo no permitido.
 */
import { CLUB_MIN_AGE } from '../config/community';
import { PLANS, featureDef, type Feature, type PlanId } from '../config/plans';
import { t } from '../i18n';
import type { User } from '../services/types';
import { ageOn, localDate, type CalendarDate } from './age';

/** Sin cuenta se usa el plan gratuito. */
export const planOf = (user: User | null): PlanId => user?.plan ?? 'free';

/** Edad mínima de las funciones que la exigen: el Reading Club (D09). */
export const MIN_AGE: Partial<Record<Feature, number>> = { club: CLUB_MIN_AGE };

/**
 * Por qué no se puede usar una función:
 *   - 'account': hace falta iniciar sesión;
 *   - 'age-unknown': falta la fecha de nacimiento (se pide al entrar);
 *   - 'age': no tiene la edad mínima;
 *   - 'premium': la función es del plan premium.
 */
export type AccessReason = 'account' | 'age-unknown' | 'age' | 'premium';

export type AccessResult = { ok: true } | { ok: false; reason: AccessReason };

/**
 * Decide el acceso. En las funciones con edad mínima el orden es sesión,
 * edad y plan: la fecha de nacimiento se pide antes de ofrecer premium, para
 * no venderle la función a quien no tiene la edad.
 */
export function canUse(feature: Feature, user: User | null, today: CalendarDate = localDate()): AccessResult {
  const minAge = MIN_AGE[feature];
  if (minAge !== undefined) {
    if (!user) return { ok: false, reason: 'account' };
    if (!user.birthDate) return { ok: false, reason: 'age-unknown' };
    // Una fecha guardada que no da una edad (por ejemplo, con el reloj del
    // dispositivo atrasado) no habilita el acceso.
    const age = ageOn(user.birthDate, today);
    if (age === null || age < minAge) return { ok: false, reason: 'age' };
  }
  const access = featureDef(feature)[planOf(user)];
  if (!access.allowed) return { ok: false, reason: 'premium' };
  if (access.needsAccount && !user) return { ok: false, reason: 'account' };
  return { ok: true };
}

export const allowed = (feature: Feature, user: User | null): boolean => canUse(feature, user).ok;

/** Cantidad de documentos que permite el plan (null: sin límite de cantidad). */
export const documentLimit = (plan: PlanId): number | null => PLANS[plan].limits.maxDocuments;

export interface LibraryUsage {
  count: number;
  limit: number | null;
  /** No se pueden agregar más (lleno o por encima del límite). */
  full: boolean;
  /** Tiene más documentos que los que permite el plan (por ejemplo, tras dejar premium). */
  over: boolean;
  label: string;
}

export function libraryUsage(count: number, plan: PlanId): LibraryUsage {
  const limit = documentLimit(plan);
  if (limit === null) return { count, limit, full: false, over: false, label: t('library.count.files', { count }) };
  return { count, limit, full: count >= limit, over: count > limit, label: t('library.count.ofLimit', { count: limit, used: count }) };
}
