/**
 * Reglas de la comunidad como funciones puras: búsqueda, orden por
 * valoración, validación de datos y propiedad de lo publicado. Las usa el
 * servicio local de prueba y describen lo que el servidor debe validar.
 */
import { CLUB_CATEGORIES, REVIEW_CATEGORIES, REVIEW_RANKING, TEXT_LIMITS } from '../config/community';
import { ServiceError } from './errors';
import type { Review, ReviewInput, ReviewQuery, ReviewSort, SignUpInput, ThreadInput, User } from './types';

/** Texto comparable: minúsculas, sin tildes ni diéresis, espacios simples. */
export function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** La reseña coincide si cada palabra buscada aparece en el nombre del libro o en el autor. */
export function matchesText(r: Pick<Review, 'bookTitle' | 'bookAuthor'>, text: string): boolean {
  const words = fold(text).split(' ').filter(Boolean);
  if (!words.length) return true;
  const haystack = fold(`${r.bookTitle} ${r.bookAuthor}`);
  return words.every((w) => haystack.includes(w));
}

/**
 * Puntaje «hot» de Reddit: cada vez que los likes se multiplican por diez
 * equivalen a `hoursPerTenfold` horas de novedad.
 */
export function hotScore(likes: number, createdAt: number, hoursPerTenfold = REVIEW_RANKING.hoursPerTenfold): number {
  return Math.log10(Math.max(likes, 1)) + createdAt / 1000 / (hoursPerTenfold * 3600);
}

export function sortReviews<T extends Pick<Review, 'likes' | 'createdAt'>>(list: T[], sort: ReviewSort, ranking = REVIEW_RANKING): T[] {
  const out = [...list];
  if (sort === 'recent') return out.sort((a, b) => b.createdAt - a.createdAt);
  if (ranking.mode === 'hot') return out.sort((a, b) => hotScore(b.likes, b.createdAt, ranking.hoursPerTenfold) - hotScore(a.likes, a.createdAt, ranking.hoursPerTenfold));
  return out.sort((a, b) => b.likes - a.likes || b.createdAt - a.createdAt);
}

export function queryReviews<T extends Review>(list: T[], q: ReviewQuery): T[] {
  const filtered = list.filter(
    (r) => (!q.text || matchesText(r, q.text)) && (!q.category || r.category === q.category) && (!q.authorId || r.authorId === q.authorId),
  );
  return sortReviews(filtered, q.sort ?? 'top');
}

// ——— Validación ———

const invalid = (msg: string) => new ServiceError('invalid', msg);

function text(value: unknown, label: string, max: number, min = 1): string {
  const v = typeof value === 'string' ? value.trim() : '';
  if (v.length < min) throw invalid(min > 1 ? `${label}: al menos ${min} caracteres.` : `Falta completar: ${label.toLowerCase()}.`);
  if (v.length > max) throw invalid(`${label}: hasta ${max.toLocaleString('es-AR')} caracteres.`);
  return v;
}

export function validateReview(input: ReviewInput): ReviewInput {
  const category = String(input.category ?? '');
  if (!(REVIEW_CATEGORIES as readonly string[]).includes(category)) throw invalid('Elegí una categoría.');
  return {
    bookTitle: text(input.bookTitle, 'Nombre del libro', TEXT_LIMITS.bookTitle),
    bookAuthor: text(input.bookAuthor, 'Autor del libro', TEXT_LIMITS.bookAuthor),
    category,
    title: text(input.title, 'Título de la reseña', TEXT_LIMITS.reviewTitle),
    body: text(input.body, 'Reseña', TEXT_LIMITS.reviewBody),
    spoiler: !!input.spoiler,
  };
}

export function validateThread(input: ThreadInput): ThreadInput {
  const category = String(input.category ?? '');
  if (!(CLUB_CATEGORIES as readonly string[]).includes(category)) throw invalid('Elegí una categoría.');
  return {
    title: text(input.title, 'Título', TEXT_LIMITS.threadTitle),
    body: text(input.body, 'Contenido', TEXT_LIMITS.threadBody),
    category,
  };
}

export const validateReply = (body: string): string => text(body, 'Respuesta', TEXT_LIMITS.replyBody);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignUp(input: SignUpInput): SignUpInput {
  const username = text(input.username, 'Nombre de usuario', TEXT_LIMITS.username.max, TEXT_LIMITS.username.min);
  if (!/^[\p{L}\p{N}_.-]+$/u.test(username)) throw invalid('Nombre de usuario: solo letras, números, punto, guion y guion bajo, sin espacios.');
  const email = text(input.email, 'Correo electrónico', 200).toLowerCase();
  if (!EMAIL.test(email)) throw invalid('El correo electrónico no parece válido.');
  const password = typeof input.password === 'string' ? input.password : '';
  if (password.length < TEXT_LIMITS.password.min) throw invalid(`La contraseña necesita al menos ${TEXT_LIMITS.password.min} caracteres.`);
  if (password.length > TEXT_LIMITS.password.max) throw invalid('La contraseña es demasiado larga.');
  return { username, email, password };
}

// ——— Propiedad ———

/** Solo quien publicó puede editar o eliminar. */
export const isOwner = (user: User | null, item: { authorId: string }): boolean => !!user && user.id === item.authorId;
