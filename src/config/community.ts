/**
 * Reseñas y Reading Club: categorías, largos permitidos y orden por valoración.
 * Se editan aquí; la interfaz y las reglas del servicio leen de este archivo.
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
