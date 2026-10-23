/**
 * Planes y beneficios: la única fuente de verdad sobre qué incluye cada plan.
 *
 * La interfaz (página «Planes», candados, contador de la biblioteca) y las
 * reglas del servicio de datos leen de aquí. Para cambiar un límite o mover
 * una función de plan alcanza con editar este archivo. Cuando exista un
 * servidor, debe aplicar las mismas reglas (ver docs/backend.md): lo que se
 * muestra en la interfaz no reemplaza la validación del servidor.
 *
 * Los textos (nombres, resúmenes y etiquetas) están en los archivos de
 * idioma; aquí se leen en el momento de mostrarlos, en el idioma actual.
 */
import { t } from '../i18n';
import { CLUB_MIN_AGE } from './community';

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
    get name() {
      return t('plans.free.name');
    },
    get summary() {
      return t('plans.free.summary');
    },
    get price() {
      return t('plans.free.price');
    },
    limits: { maxDocuments: 5 },
  },
  premium: {
    id: 'premium',
    get name() {
      return t('plans.premium.name');
    },
    get summary() {
      return t('plans.premium.summary');
    },
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

/** Acceso con su etiqueta, que se lee del archivo de idioma al mostrarla. */
const access = (allowed: boolean, label: () => string, needsAccount?: boolean): Access => ({
  allowed,
  ...(needsAccount ? { needsAccount } : {}),
  get label() {
    return label();
  },
});

/** Tabla de funciones por plan (la misma que muestra la página «Planes»). */
export const FEATURES: FeatureDef[] = [
  {
    id: 'bookMode',
    get label() {
      return t('plans.feature.bookMode');
    },
    free: access(true, () => t('plans.access.included')),
    premium: access(true, () => t('plans.access.included')),
  },
  {
    id: 'focusMode',
    get label() {
      return t('plans.feature.focusMode');
    },
    free: access(true, () => t('plans.access.included')),
    premium: access(true, () => t('plans.access.included')),
  },
  {
    id: 'library',
    get label() {
      return t('plans.feature.library');
    },
    free: access(true, () => (freeDocs === null ? t('plans.access.noQuantityLimit') : t('plans.access.upToFiles', { count: freeDocs }))),
    premium: access(true, () => t('plans.access.noPlanQuantityLimit')),
  },
  {
    id: 'reviewsRead',
    get label() {
      return t('plans.feature.reviewsRead');
    },
    free: access(true, () => t('plans.access.included')),
    premium: access(true, () => t('plans.access.included')),
  },
  {
    id: 'reviewsWrite',
    get label() {
      return t('plans.feature.reviewsWrite');
    },
    free: access(true, () => t('plans.access.includedWithAccount'), true),
    premium: access(true, () => t('plans.access.included'), true),
  },
  {
    id: 'pageCurl',
    get label() {
      return t('plans.feature.pageCurl');
    },
    free: access(false, () => t('plans.access.premium')),
    premium: access(true, () => t('plans.access.includedFem')),
  },
  {
    id: 'club',
    get label() {
      return t('plans.feature.club', { age: CLUB_MIN_AGE });
    },
    free: access(false, () => t('plans.access.premium')),
    premium: access(true, () => t('plans.access.includedPlural'), true),
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
