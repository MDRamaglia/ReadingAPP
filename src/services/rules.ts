/**
 * Reglas de la comunidad como funciones puras: búsqueda, orden por
 * valoración, validación de datos y propiedad de lo publicado. Las usa el
 * servicio local de prueba y describen lo que el servidor debe validar.
 */
import { CLUB_CATEGORIES, REVIEW_CATEGORIES, REVIEW_RANKING, TEXT_LIMITS } from '../config/community';
import { fmtNumber, intlLocale, t } from '../i18n';
import { BIRTH_YEAR_MIN, birthDateProblem, localDate, type CalendarDate } from '../lib/age';
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
  if (v.length < min) {
    throw invalid(min > 1 ? t('validation.minChars', { label, count: min }) : t('validation.missing', { label: label.toLocaleLowerCase(intlLocale()) }));
  }
  if (v.length > max) throw invalid(t('validation.maxChars', { label, count: max, max: fmtNumber(max) }));
  return v;
}

export function validateReview(input: ReviewInput): ReviewInput {
  const category = String(input.category ?? '');
  if (!(REVIEW_CATEGORIES as readonly string[]).includes(category)) throw invalid(t('validation.category'));
  return {
    bookTitle: text(input.bookTitle, t('field.bookTitle'), TEXT_LIMITS.bookTitle),
    bookAuthor: text(input.bookAuthor, t('field.bookAuthor'), TEXT_LIMITS.bookAuthor),
    category,
    title: text(input.title, t('field.reviewTitle'), TEXT_LIMITS.reviewTitle),
    body: text(input.body, t('field.reviewBody'), TEXT_LIMITS.reviewBody),
    spoiler: !!input.spoiler,
  };
}

export function validateThread(input: ThreadInput): ThreadInput {
  const category = String(input.category ?? '');
  if (!(CLUB_CATEGORIES as readonly string[]).includes(category)) throw invalid(t('validation.category'));
  return {
    title: text(input.title, t('field.threadTitle'), TEXT_LIMITS.threadTitle),
    body: text(input.body, t('field.threadBody'), TEXT_LIMITS.threadBody),
    category,
  };
}

export const validateReply = (body: string): string => text(body, t('field.reply'), TEXT_LIMITS.replyBody);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignUp(input: SignUpInput): SignUpInput {
  const username = text(input.username, t('field.username'), TEXT_LIMITS.username.max, TEXT_LIMITS.username.min);
  if (!/^[\p{L}\p{N}_.-]+$/u.test(username)) throw invalid(t('validation.usernameChars'));
  const email = text(input.email, t('field.email'), 200).toLowerCase();
  if (!EMAIL.test(email)) throw invalid(t('validation.email'));
  const password = typeof input.password === 'string' ? input.password : '';
  if (password.length < TEXT_LIMITS.password.min) throw invalid(t('validation.passwordShort', { count: TEXT_LIMITS.password.min }));
  if (password.length > TEXT_LIMITS.password.max) throw invalid(t('validation.passwordLong'));
  return { username, email, password };
}

/**
 * Fecha de nacimiento: «AAAA-MM-DD», una fecha que exista, no futura y de
 * 1900 en adelante. Devuelve la fecha normalizada.
 */
export function validateBirthDate(value: unknown, today: CalendarDate = localDate()): string {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!v) throw invalid(t('validation.missing', { label: t('field.birthDate').toLocaleLowerCase(intlLocale()) }));
  const problem = birthDateProblem(v, today);
  if (problem === 'future') throw invalid(t('validation.birthFuture'));
  if (problem === 'too-old') throw invalid(t('validation.birthTooOld', { year: BIRTH_YEAR_MIN }));
  if (problem) throw invalid(t('validation.birthInvalid'));
  return v;
}

// ——— Propiedad ———

/** Solo quien publicó puede editar o eliminar. */
export const isOwner = (user: User | null, item: { authorId: string }): boolean => !!user && user.id === item.authorId;
