/**
 * Planes y beneficios: la única fuente de verdad sobre qué incluye cada plan.
 *
 * La interfaz (página «Planes», candados, contador de la biblioteca) y las
 * reglas del servicio de datos leen de aquí. Para cambiar un límite o mover
 * una función de plan alcanza con editar este archivo. Cuando exista un
 * servidor, debe aplicar las mismas reglas (ver docs/backend.md): lo que se
 * muestra en la interfaz no reemplaza la validación del servidor.
 */

export type PlanId = 'free' | 'premium';

export type Feature =
  | 'bookMode'
  | 'focusMode'
  | 'library'
  | 'reviewsRead'
  | 'reviewsWrite'
  | 'pageCurl'
  | 'club';

export interface PlanDef {
  id: PlanId;
  name: string;
  summary: string;
  /** Precio a mostrar; null mientras no esté definido. */
  price: string | null;
  limits: {
    /** Documentos en la biblioteca personal; null = sin límite de cantidad impuesto por el plan. */
    maxDocuments: number | null;
  };
}

export const PLANS: Record<PlanId, PlanDef> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    summary: 'Para leer a tu ritmo y participar de las reseñas.',
    price: 'Sin costo',
    limits: { maxDocuments: 5 },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    summary: 'Biblioteca sin límite de cantidad, animación de hoja y el Reading Club.',
    price: null,
    limits: { maxDocuments: null },
  },
};

export interface Access {
  /** El plan incluye la función. */
  allowed: boolean;
  /** Además hace falta haber iniciado sesión. */
  needsAccount?: boolean;
  /** Texto de la tabla de planes. */
  label: string;
}

export interface FeatureDef {
  id: Feature;
  label: string;
  free: Access;
  premium: Access;
}

const freeDocs = PLANS.free.limits.maxDocuments;

/** Tabla de funciones por plan (la misma que muestra la página «Planes»). */
export const FEATURES: FeatureDef[] = [
  {
    id: 'bookMode',
    label: 'Modo libro, con navegación horizontal y vertical',
    free: { allowed: true, label: 'Incluido' },
    premium: { allowed: true, label: 'Incluido' },
  },
  {
    id: 'focusMode',
    label: 'Modo renglón',
    free: { allowed: true, label: 'Incluido' },
    premium: { allowed: true, label: 'Incluido' },
  },
  {
    id: 'library',
    label: 'Biblioteca personal',
    free: { allowed: true, label: freeDocs === null ? 'Sin límite de cantidad' : `Hasta ${freeDocs} archivos` },
    premium: { allowed: true, label: 'Sin límite de cantidad impuesto por el plan' },
  },
  {
    id: 'reviewsRead',
    label: 'Buscar y leer reseñas',
    free: { allowed: true, label: 'Incluido' },
    premium: { allowed: true, label: 'Incluido' },
  },
  {
    id: 'reviewsWrite',
    label: 'Publicar reseñas y dar likes',
    free: { allowed: true, needsAccount: true, label: 'Incluido, con cuenta' },
    premium: { allowed: true, needsAccount: true, label: 'Incluido' },
  },
  {
    id: 'pageCurl',
    label: 'Animación de hoja de libro',
    free: { allowed: false, label: 'Acceso premium' },
    premium: { allowed: true, label: 'Incluida' },
  },
  {
    id: 'club',
    label: 'Acceso y participación en el foro (Reading Club)',
    free: { allowed: false, label: 'Acceso premium' },
    premium: { allowed: true, needsAccount: true, label: 'Incluidos' },
  },
];

export const featureDef = (id: Feature): FeatureDef => FEATURES.find((f) => f.id === id)!;

/**
 * Límites técnicos, iguales para todos los planes. Son independientes de la
 * cantidad de documentos que permite cada plan: premium no tiene límite de
 * cantidad, pero sí estos.
 */
export const TECHNICAL_LIMITS = {
  /** Tamaño máximo de un archivo importado. */
  maxFileBytes: 300 * 1024 * 1024,
  /** El espacio total lo decide el navegador; si se agota, la importación lo explica. */
};
