/**
 * Permisos según el plan: qué puede usar cada quien. Lee la configuración
 * central (config/plans.ts). La interfaz lo usa para mostrar candados y
 * explicaciones; las reglas del servicio, para rechazar lo no permitido.
 */
import { PLANS, featureDef, type Feature, type PlanId } from '../config/plans';
import type { User } from '../services/types';

/** Sin cuenta se usa el plan gratuito. */
export const planOf = (user: User | null): PlanId => user?.plan ?? 'free';

export type AccessResult = { ok: true } | { ok: false; reason: 'account' | 'premium' };

export function canUse(feature: Feature, user: User | null): AccessResult {
  const plan = planOf(user);
  const access = featureDef(feature)[plan];
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
  const files = (n: number) => `${n} ${n === 1 ? 'archivo' : 'archivos'}`;
  if (limit === null) return { count, limit, full: false, over: false, label: files(count) };
  return { count, limit, full: count >= limit, over: count > limit, label: `${count} de ${files(limit)}` };
}
