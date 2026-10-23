/**
 * Reseñas y Reading Club: categorías, largos permitidos, orden por valoración
 * y edad mínima del club. Se editan aquí; la interfaz y las reglas del
 * servicio leen de este archivo.
 */
import { t } from '../i18n';

/**
 * Edad mínima para entrar al Reading Club (decisión D09). Registrarse en la
 * app no tiene límite de edad. El servidor aplica la misma edad en sus reglas
 * (docs/backend.md): si cambia aquí, cambia también allá.
 */
export const CLUB_MIN_AGE = 16;

/**
 * Categorías. Estos textos son los **valores guardados** en cada reseña o
 * publicación: no se traducen ni se cambian (los datos existentes los usan).
 * Lo que se muestra es su etiqueta, en el archivo de idioma
 * («reviewCategory.<valor>» y «clubCategory.<valor>»).
 */
export const REVIEW_CATEGORIES = [
  'Novela',
  'Cuento',
  'Poesía',
  'Ensayo',
  'Historia',
  'Biografía y memorias',
  'Filosofía',
  'Ciencia y divulgación',
  'Derecho',
  'Economía y negocios',
  'Ciencia ficción y fantasía',
  'Policial y suspenso',
  'Infantil y juvenil',
  'Desarrollo personal',
  'Otro',
] as const;

export const CLUB_CATEGORIES = ['Preguntas', 'Libros', 'Autores', 'Textos propios', 'General'] as const;

export type ReviewCategory = (typeof REVIEW_CATEGORIES)[number];
export type ClubCategory = (typeof CLUB_CATEGORIES)[number];

const isOneOf = <T extends string>(list: readonly T[], v: string): v is T => (list as readonly string[]).includes(v);

/** Etiqueta visible de una categoría de reseñas (un valor desconocido se muestra tal cual). */
export const reviewCategoryLabel = (value: string): string => (isOneOf(REVIEW_CATEGORIES, value) ? t(`reviewCategory.${value}`) : value);

/** Etiqueta visible de una categoría del Reading Club (un valor desconocido se muestra tal cual). */
export const clubCategoryLabel = (value: string): string => (isOneOf(CLUB_CATEGORIES, value) ? t(`clubCategory.${value}`) : value);

/** Largos máximos (en caracteres) de cada campo. */
export const TEXT_LIMITS = {
  username: { min: 3, max: 30 },
  password: { min: 8, max: 200 },
  bookTitle: 150,
  bookAuthor: 120,
  reviewTitle: 120,
  reviewBody: 10_000,
  threadTitle: 150,
  threadBody: 20_000,
  replyBody: 10_000,
};

/**
 * Orden «Más valoradas». Como en la votación comunitaria de Reddit, los likes
 * dan visibilidad:
 *   - 'top': más likes primero; a igualdad, la más reciente.
 *   - 'hot': fórmula «hot» de Reddit (log10 de los likes + antigüedad), que da
 *     una oportunidad a lo nuevo. `hoursPerTenfold` son las horas de
 *     antigüedad que equivalen a multiplicar por diez los likes (Reddit usa 12,5).
 */
export const REVIEW_RANKING: { mode: 'top' | 'hot'; hoursPerTenfold: number } = { mode: 'top', hoursPerTenfold: 12.5 };
