import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { FEATURES, PLANS } from '../../src/config/plans';
import { canUse, libraryUsage } from '../../src/lib/access';
import { isServiceError } from '../../src/services/errors';
import { LocalBackend } from '../../src/services/localBackend';
import { fold, hotScore, matchesText, sortReviews } from '../../src/services/rules';
import type { ReviewInput, User } from '../../src/services/types';

// localStorage mínimo para la sesión (Node no lo trae).
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

const review = (over: Partial<ReviewInput> = {}): ReviewInput => ({
  bookTitle: 'Cien años de soledad',
  bookAuthor: 'Gabriel García Márquez',
  category: 'Novela',
  title: 'Una saga inolvidable',
  body: 'Macondo como espejo de América Latina.',
  spoiler: false,
  ...over,
});

let n = 0;
async function fresh() {
  store.clear();
  return new LocalBackend(`prueba-${++n}`);
}
const asError = async (p: Promise<unknown>) => {
  try {
    await p;
  } catch (e) {
    return e;
  }
  throw new Error('se esperaba un error');
};

describe('búsqueda y orden de reseñas', () => {
  it('ignora mayúsculas, tildes y diéresis', () => {
    expect(fold('  GARCÍA  Márquez ')).toBe('garcia marquez');
    expect(fold('Pingüino')).toBe('pinguino');
    const r = { bookTitle: 'El túnel', bookAuthor: 'Ernesto Sábato' };
    expect(matchesText(r, 'sabato')).toBe(true);
    expect(matchesText(r, 'TUNEL')).toBe(true);
    expect(matchesText(r, 'túnel sábato')).toBe(true);
    expect(matchesText(r, 'rayuela')).toBe(false);
  });

  it('«Más valoradas» sube lo que tiene más likes y «Más recientes» ordena por fecha', () => {
    const list = [
      { id: 'a', likes: 1, createdAt: 3 },
      { id: 'b', likes: 7, createdAt: 1 },
      { id: 'c', likes: 7, createdAt: 2 },
      { id: 'd', likes: 0, createdAt: 4 },
    ];
    expect(sortReviews(list, 'top').map((r) => r.id)).toEqual(['c', 'b', 'a', 'd']);
    expect(sortReviews(list, 'recent').map((r) => r.id)).toEqual(['d', 'a', 'c', 'b']);
  });

  it('la variante «hot» de Reddit: diez veces más likes equivalen a 12,5 horas de novedad', () => {
    const h = 3600 * 1000;
    expect(hotScore(10, 0)).toBeCloseTo(hotScore(1, 12.5 * h), 6);
    const hot = sortReviews(
      [
        { id: 'vieja', likes: 100, createdAt: 0 },
        { id: 'nueva', likes: 1, createdAt: 40 * h },
      ],
      'top',
      { mode: 'hot', hoursPerTenfold: 12.5 },
    );
    expect(hot[0]!.id).toBe('nueva');
  });
});

describe('planes y permisos (configuración central)', () => {
  const free: User = { id: 'u1', username: 'ana', email: 'a@x.com', plan: 'free', createdAt: 0 };
  const premium: User = { ...free, id: 'u2', plan: 'premium' };

  it('la tabla de funciones coincide con la propuesta', () => {
    const t = Object.fromEntries(FEATURES.map((f) => [f.id, [f.free.label, f.premium.label]]));
    expect(t.bookMode).toEqual(['Incluido', 'Incluido']);
    expect(t.library).toEqual(['Hasta 5 archivos', 'Sin límite de cantidad impuesto por el plan']);
    expect(t.reviewsWrite).toEqual(['Incluido, con cuenta', 'Incluido']);
    expect(t.pageCurl).toEqual(['Acceso premium', 'Incluida']);
    expect(t.club).toEqual(['Acceso premium', 'Incluidos']);
  });

  it('decide el acceso según plan y cuenta', () => {
    expect(canUse('bookMode', null).ok).toBe(true);
    expect(canUse('reviewsRead', null).ok).toBe(true);
    expect(canUse('reviewsWrite', null)).toEqual({ ok: false, reason: 'account' });
    expect(canUse('reviewsWrite', free).ok).toBe(true);
    expect(canUse('pageCurl', free)).toEqual({ ok: false, reason: 'premium' });
    expect(canUse('pageCurl', premium).ok).toBe(true);
    expect(canUse('club', free)).toEqual({ ok: false, reason: 'premium' });
    expect(canUse('club', premium).ok).toBe(true);
  });

  it('cuenta los archivos de la biblioteca contra el límite del plan', () => {
    expect(PLANS.free.limits.maxDocuments).toBe(5);
    expect(libraryUsage(3, 'free')).toMatchObject({ label: '3 de 5 archivos', full: false, over: false });
    expect(libraryUsage(5, 'free')).toMatchObject({ full: true, over: false });
    expect(libraryUsage(7, 'free')).toMatchObject({ full: true, over: true });
    expect(libraryUsage(40, 'premium')).toMatchObject({ limit: null, full: false, label: '40 archivos' });
  });
});

describe('servicio local de prueba: cuentas', () => {
  beforeEach(() => store.clear());

  it('registra, cierra e inicia sesión; rechaza contraseñas incorrectas y datos repetidos', async () => {
    const b = await fresh();
    const u = await b.signUp({ username: 'lectora', email: 'Lectora@Mail.com', password: 'secreto123' });
    expect(u).toMatchObject({ username: 'lectora', email: 'lectora@mail.com', plan: 'free' });
    expect((await b.currentUser())?.id).toBe(u.id);
    await b.signOut();
    expect(await b.currentUser()).toBeNull();
    expect(isServiceError(await asError(b.signIn('lectora@mail.com', 'otra-clave')), 'bad-credentials')).toBe(true);
    expect((await b.signIn('LECTORA@mail.com', 'secreto123')).id).toBe(u.id);
    expect(isServiceError(await asError(b.signUp({ username: 'otra', email: 'lectora@mail.com', password: 'secreto123' })), 'exists')).toBe(true);
    expect(isServiceError(await asError(b.signUp({ username: 'LECTORA', email: 'b@mail.com', password: 'secreto123' })), 'exists')).toBe(true);
    expect(isServiceError(await asError(b.signUp({ username: 'x', email: 'c@mail.com', password: 'secreto123' })), 'invalid')).toBe(true);
    expect(isServiceError(await asError(b.signUp({ username: 'nuevo', email: 'no-es-correo', password: 'secreto123' })), 'invalid')).toBe(true);
    expect(isServiceError(await asError(b.signUp({ username: 'nuevo', email: 'n@mail.com', password: 'corta' })), 'invalid')).toBe(true);
  });

  it('la recuperación de contraseña queda pendiente del servidor', async () => {
    const b = await fresh();
    const r = await b.requestPasswordReset('a@b.com');
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/servidor/);
  });
});

describe('servicio local de prueba: reseñas', () => {
  it('publicar requiere cuenta; solo el autor edita o borra', async () => {
    const b = await fresh();
    expect(isServiceError(await asError(b.createReview(review())), 'auth-required')).toBe(true);
    const ana = await b.signUp({ username: 'ana', email: 'ana@mail.com', password: 'secreto123' });
    const r = await b.createReview(review());
    expect(r).toMatchObject({ authorId: ana.id, authorName: 'ana', likes: 0 });
    await b.signUp({ username: 'beto', email: 'beto@mail.com', password: 'secreto123' });
    expect(isServiceError(await asError(b.updateReview(r.id, review({ title: 'Cambiada' }))), 'forbidden')).toBe(true);
    expect(isServiceError(await asError(b.deleteReview(r.id)), 'forbidden')).toBe(true);
    await b.signIn('ana@mail.com', 'secreto123');
    expect((await b.updateReview(r.id, review({ title: 'Cambiada' }))).title).toBe('Cambiada');
    await b.deleteReview(r.id);
    expect(await b.listReviews({})).toHaveLength(0);
  });

  it('un like por persona y reseña, que se puede retirar; no se puede dar like a lo propio', async () => {
    const b = await fresh();
    await b.signUp({ username: 'ana', email: 'ana@mail.com', password: 'secreto123' });
    const r = await b.createReview(review());
    expect(isServiceError(await asError(b.toggleLike(r.id)), 'forbidden')).toBe(true);
    await b.signUp({ username: 'beto', email: 'beto@mail.com', password: 'secreto123' });
    expect(await b.toggleLike(r.id)).toEqual({ liked: true, likes: 1 });
    expect((await b.getReview(r.id)).likedByMe).toBe(true);
    expect(await b.toggleLike(r.id)).toEqual({ liked: false, likes: 0 });
    expect(await b.toggleLike(r.id)).toEqual({ liked: true, likes: 1 });
    await b.signUp({ username: 'caro', email: 'caro@mail.com', password: 'secreto123' });
    expect(await b.toggleLike(r.id)).toEqual({ liked: true, likes: 2 });
    await b.signOut();
    expect(isServiceError(await asError(b.toggleLike(r.id)), 'auth-required')).toBe(true);
    const list = await b.listReviews({ text: 'GARCIA marquez', sort: 'top' });
    expect(list[0]).toMatchObject({ likes: 2, likedByMe: false });
  });

  it('valida los campos obligatorios y la categoría', async () => {
    const b = await fresh();
    await b.signUp({ username: 'ana', email: 'ana@mail.com', password: 'secreto123' });
    expect(isServiceError(await asError(b.createReview(review({ bookTitle: '  ' }))), 'invalid')).toBe(true);
    expect(isServiceError(await asError(b.createReview(review({ category: 'Inventada' }))), 'invalid')).toBe(true);
  });
});

describe('servicio local de prueba: Reading Club', () => {
  it('reservado a premium; solo el autor modifica sus publicaciones y respuestas', async () => {
    const b = await fresh();
    // Sin cuenta también se informa que es premium (el plan premium ya implica una cuenta).
    expect(isServiceError(await asError(b.listThreads({})), 'premium-required')).toBe(true);
    await b.signUp({ username: 'ana', email: 'ana@mail.com', password: 'secreto123' });
    expect(isServiceError(await asError(b.listThreads({})), 'premium-required')).toBe(true);
    expect(isServiceError(await asError(b.createThread({ title: 'Hola', body: 'Texto', category: 'General' })), 'premium-required')).toBe(true);
    await b.dev.setPlan('premium');
    const t = await b.createThread({ title: '¿Qué leer de Borges?', body: 'Busco por dónde empezar.', category: 'Preguntas' });
    const reply = await b.createReply(t.id, 'Empezá por Ficciones.');
    expect((await b.getThread(t.id)).thread.replyCount).toBe(1);

    await b.signUp({ username: 'beto', email: 'beto@mail.com', password: 'secreto123' });
    await b.dev.setPlan('premium');
    expect(isServiceError(await asError(b.updateThread(t.id, { title: 'X', body: 'Y', category: 'General' })), 'forbidden')).toBe(true);
    expect(isServiceError(await asError(b.deleteReply(reply.id)), 'forbidden')).toBe(true);
    const mine = await b.createReply(t.id, 'Y después El Aleph.');
    expect((await b.updateReply(mine.id, 'Y después, El Aleph.')).body).toBe('Y después, El Aleph.');
    await b.deleteReply(mine.id);
    expect((await b.getThread(t.id)).thread.replyCount).toBe(1);

    await b.signIn('ana@mail.com', 'secreto123');
    await b.deleteThread(t.id);
    expect(await b.listThreads({})).toHaveLength(0);
  });
});
