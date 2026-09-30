/**
 * Servicio de prueba local: cuentas, reseñas y Reading Club guardados en este
 * dispositivo (IndexedDB), con las mismas reglas que deberá aplicar el
 * servidor: sesión para publicar, un like por persona y reseña, solo el autor
 * edita o borra, y el Reading Club reservado al plan premium.
 *
 * No es autenticación real: no hay servidor, no se mandan correos y lo
 * publicado solo lo ve quien usa este dispositivo. La interfaz lo indica.
 * Las contraseñas no se guardan: se guarda un hash PBKDF2 con sal.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { PlanId } from '../config/plans';
import { canUse } from '../lib/access';
import { pendingSubscriptions, type Backend, type PendingAction } from './backend';
import { ServiceError } from './errors';
import { fold, isOwner, queryReviews, validateReply, validateReview, validateSignUp, validateThread } from './rules';
import type { ClubReply, ClubThread, Review, ReviewInput, ReviewQuery, SignUpInput, ThreadInput, User } from './types';

type StoredUser = User & { usernameKey: string };
type StoredReview = Omit<Review, 'likedByMe'>;

interface LocalDB extends DBSchema {
  users: { key: string; value: StoredUser; indexes: { byEmail: string; byUsername: string } };
  secrets: { key: string; value: { userId: string; salt: string; hash: string; iterations: number } };
  reviews: { key: string; value: StoredReview; indexes: { byAuthor: string } };
  likes: { key: string; value: { key: string; reviewId: string; userId: string; at: number }; indexes: { byReview: string; byUser: string } };
  threads: { key: string; value: ClubThread; indexes: { byAuthor: string } };
  replies: { key: string; value: ClubReply; indexes: { byThread: string; byAuthor: string } };
}

const DB_NAME = 'knowmadic-local';
const SESSION_KEY = 'knowmadic.local.session';
const ITERATIONS = 150_000;

const uid = (prefix: string) => {
  const r = crypto.getRandomValues(new Uint32Array(2));
  return `${prefix}${Date.now().toString(36)}${r[0]!.toString(36)}${r[1]!.toString(36)}`;
};
const b64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf instanceof Uint8Array ? buf : new Uint8Array(buf))));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function hashPassword(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return b64(bits);
}

function readSession(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}
function writeSession(id: string | null): void {
  try {
    if (id) localStorage.setItem(SESSION_KEY, id);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* sin almacenamiento: la sesión dura lo que la página */
  }
}

const publicUser = ({ usernameKey: _k, ...u }: StoredUser): User => u;

export class LocalBackend implements Backend {
  readonly kind = 'local' as const;
  readonly label = 'Prueba local en este dispositivo';
  private dbp: Promise<IDBPDatabase<LocalDB>> | null = null;
  private memorySession: string | null = null;

  constructor(private dbName = DB_NAME) {}

  private db() {
    this.dbp ??= openDB<LocalDB>(this.dbName, 1, {
      upgrade(d) {
        const users = d.createObjectStore('users', { keyPath: 'id' });
        users.createIndex('byEmail', 'email', { unique: true });
        users.createIndex('byUsername', 'usernameKey', { unique: true });
        d.createObjectStore('secrets', { keyPath: 'userId' });
        d.createObjectStore('reviews', { keyPath: 'id' }).createIndex('byAuthor', 'authorId');
        const likes = d.createObjectStore('likes', { keyPath: 'key' });
        likes.createIndex('byReview', 'reviewId');
        likes.createIndex('byUser', 'userId');
        d.createObjectStore('threads', { keyPath: 'id' }).createIndex('byAuthor', 'authorId');
        const replies = d.createObjectStore('replies', { keyPath: 'id' });
        replies.createIndex('byThread', 'threadId');
        replies.createIndex('byAuthor', 'authorId');
      },
    });
    return this.dbp;
  }

  // ——— Sesión ———

  private sessionId(): string | null {
    return readSession() ?? this.memorySession;
  }

  async currentUser(): Promise<User | null> {
    const id = this.sessionId();
    if (!id) return null;
    const u = await (await this.db()).get('users', id);
    if (!u) {
      writeSession(null);
      return null;
    }
    return publicUser(u);
  }

  private async requireUser(): Promise<User> {
    const u = await this.currentUser();
    if (!u) throw new ServiceError('auth-required', 'Iniciá sesión para continuar.');
    return u;
  }

  private async requireClub(): Promise<User> {
    const u = await this.currentUser();
    const access = canUse('club', u);
    if (!access.ok) {
      throw access.reason === 'account'
        ? new ServiceError('auth-required', 'Iniciá sesión para entrar al Reading Club.')
        : new ServiceError('premium-required', 'El Reading Club es parte del plan premium.');
    }
    return u!;
  }

  async signUp(input: SignUpInput): Promise<User> {
    const v = validateSignUp(input);
    const d = await this.db();
    if (await d.getFromIndex('users', 'byEmail', v.email)) throw new ServiceError('exists', 'Ya hay una cuenta con ese correo.');
    if (await d.getFromIndex('users', 'byUsername', fold(v.username))) throw new ServiceError('exists', 'Ese nombre de usuario ya está en uso.');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await hashPassword(v.password, salt, ITERATIONS);
    const user: StoredUser = { id: uid('u'), username: v.username, usernameKey: fold(v.username), email: v.email, plan: 'free', createdAt: Date.now() };
    const tx = d.transaction(['users', 'secrets'], 'readwrite');
    await Promise.all([tx.objectStore('users').add(user), tx.objectStore('secrets').put({ userId: user.id, salt: b64(salt), hash, iterations: ITERATIONS }), tx.done]);
    this.startSession(user.id);
    return publicUser(user);
  }

  async signIn(email: string, password: string): Promise<User> {
    const d = await this.db();
    const user = await d.getFromIndex('users', 'byEmail', String(email ?? '').trim().toLowerCase());
    const secret = user && (await d.get('secrets', user.id));
    const ok = !!secret && (await hashPassword(String(password ?? ''), unb64(secret.salt), secret.iterations)) === secret.hash;
    if (!user || !ok) throw new ServiceError('bad-credentials', 'El correo o la contraseña no coinciden.');
    this.startSession(user.id);
    return publicUser(user);
  }

  private startSession(id: string) {
    this.memorySession = id;
    writeSession(id);
  }

  async signOut(): Promise<void> {
    this.memorySession = null;
    writeSession(null);
  }

  async requestPasswordReset(_email: string): Promise<PendingAction> {
    return {
      ok: false,
      message:
        'La recuperación de contraseña por correo necesita el servidor de cuentas, que todavía no está conectado. En la prueba local no se envían correos.',
    };
  }

  // ——— Reseñas ———

  private async withLikes(list: StoredReview[]): Promise<Review[]> {
    const u = await this.currentUser();
    const mine = new Set(u ? (await (await this.db()).getAllFromIndex('likes', 'byUser', u.id)).map((l) => l.reviewId) : []);
    return list.map((r) => ({ ...r, likedByMe: mine.has(r.id) }));
  }

  async listReviews(q: ReviewQuery): Promise<Review[]> {
    const all = await (await this.db()).getAll('reviews');
    return queryReviews(await this.withLikes(all), q);
  }

  async getReview(id: string): Promise<Review> {
    const r = await (await this.db()).get('reviews', id);
    if (!r) throw new ServiceError('not-found', 'La reseña ya no existe.');
    return (await this.withLikes([r]))[0]!;
  }

  private async requireWriter(): Promise<User> {
    const u = await this.currentUser();
    if (!canUse('reviewsWrite', u).ok) throw new ServiceError('auth-required', 'Iniciá sesión para publicar reseñas y dar likes.');
    return u!;
  }

  async createReview(input: ReviewInput): Promise<Review> {
    const u = await this.requireWriter();
    const r: StoredReview = { ...validateReview(input), id: uid('r'), authorId: u.id, authorName: u.username, createdAt: Date.now(), likes: 0 };
    await (await this.db()).add('reviews', r);
    return { ...r, likedByMe: false };
  }

  private async ownReview(id: string): Promise<StoredReview> {
    const u = await this.requireWriter();
    const r = await (await this.db()).get('reviews', id);
    if (!r) throw new ServiceError('not-found', 'La reseña ya no existe.');
    if (!isOwner(u, r)) throw new ServiceError('forbidden', 'Solo quien publicó la reseña puede modificarla.');
    return r;
  }

  async updateReview(id: string, input: ReviewInput): Promise<Review> {
    const r = await this.ownReview(id);
    const next: StoredReview = { ...r, ...validateReview(input), updatedAt: Date.now() };
    await (await this.db()).put('reviews', next);
    return (await this.withLikes([next]))[0]!;
  }

  async deleteReview(id: string): Promise<void> {
    await this.ownReview(id);
    const d = await this.db();
    const tx = d.transaction(['reviews', 'likes'], 'readwrite');
    const keys = await tx.objectStore('likes').index('byReview').getAllKeys(id);
    await Promise.all([tx.objectStore('reviews').delete(id), ...keys.map((k) => tx.objectStore('likes').delete(k)), tx.done]);
  }

  async toggleLike(id: string): Promise<{ liked: boolean; likes: number }> {
    const u = await this.requireWriter();
    const d = await this.db();
    const tx = d.transaction(['reviews', 'likes'], 'readwrite');
    const reviews = tx.objectStore('reviews');
    const likes = tx.objectStore('likes');
    const r = await reviews.get(id);
    if (!r) throw new ServiceError('not-found', 'La reseña ya no existe.');
    if (r.authorId === u.id) throw new ServiceError('forbidden', 'No podés dar like a tu propia reseña.');
    const key = `${id}|${u.id}`;
    const had = await likes.get(key);
    if (had) await likes.delete(key);
    else await likes.put({ key, reviewId: id, userId: u.id, at: Date.now() });
    // El contador se recalcula en la misma transacción: nunca se desfasa.
    const count = await likes.index('byReview').count(id);
    await reviews.put({ ...r, likes: count });
    await tx.done;
    return { liked: !had, likes: count };
  }

  // ——— Reading Club ———

  async listThreads(q: { category?: string; authorId?: string }): Promise<ClubThread[]> {
    await this.requireClub();
    const all = await (await this.db()).getAll('threads');
    return all
      .filter((t) => (!q.category || t.category === q.category) && (!q.authorId || t.authorId === q.authorId))
      .sort((a, b) => b.lastActivity - a.lastActivity);
  }

  async getThread(id: string): Promise<{ thread: ClubThread; replies: ClubReply[] }> {
    await this.requireClub();
    const d = await this.db();
    const thread = await d.get('threads', id);
    if (!thread) throw new ServiceError('not-found', 'La conversación ya no existe.');
    const replies = (await d.getAllFromIndex('replies', 'byThread', id)).sort((a, b) => a.createdAt - b.createdAt);
    return { thread, replies };
  }

  async createThread(input: ThreadInput): Promise<ClubThread> {
    const u = await this.requireClub();
    const now = Date.now();
    const t: ClubThread = { ...validateThread(input), id: uid('t'), authorId: u.id, authorName: u.username, createdAt: now, replyCount: 0, lastActivity: now };
    await (await this.db()).add('threads', t);
    return t;
  }

  private async ownThread(id: string): Promise<ClubThread> {
    const u = await this.requireClub();
    const t = await (await this.db()).get('threads', id);
    if (!t) throw new ServiceError('not-found', 'La conversación ya no existe.');
    if (!isOwner(u, t)) throw new ServiceError('forbidden', 'Solo quien la publicó puede modificar esta conversación.');
    return t;
  }

  async updateThread(id: string, input: ThreadInput): Promise<ClubThread> {
    const t = await this.ownThread(id);
    const next: ClubThread = { ...t, ...validateThread(input), updatedAt: Date.now() };
    await (await this.db()).put('threads', next);
    return next;
  }

  async deleteThread(id: string): Promise<void> {
    await this.ownThread(id);
    const d = await this.db();
    const tx = d.transaction(['threads', 'replies'], 'readwrite');
    const keys = await tx.objectStore('replies').index('byThread').getAllKeys(id);
    await Promise.all([tx.objectStore('threads').delete(id), ...keys.map((k) => tx.objectStore('replies').delete(k)), tx.done]);
  }

  async listReplies(q: { authorId: string }): Promise<ClubReply[]> {
    await this.requireClub();
    return (await (await this.db()).getAllFromIndex('replies', 'byAuthor', q.authorId)).sort((a, b) => b.createdAt - a.createdAt);
  }

  async createReply(threadId: string, body: string): Promise<ClubReply> {
    const u = await this.requireClub();
    const text = validateReply(body);
    const d = await this.db();
    const tx = d.transaction(['threads', 'replies'], 'readwrite');
    const t = await tx.objectStore('threads').get(threadId);
    if (!t) throw new ServiceError('not-found', 'La conversación ya no existe.');
    const now = Date.now();
    const reply: ClubReply = { id: uid('p'), threadId, body: text, authorId: u.id, authorName: u.username, createdAt: now };
    await tx.objectStore('replies').add(reply);
    await tx.objectStore('threads').put({ ...t, replyCount: t.replyCount + 1, lastActivity: now });
    await tx.done;
    return reply;
  }

  private async ownReply(id: string): Promise<ClubReply> {
    const u = await this.requireClub();
    const r = await (await this.db()).get('replies', id);
    if (!r) throw new ServiceError('not-found', 'La respuesta ya no existe.');
    if (!isOwner(u, r)) throw new ServiceError('forbidden', 'Solo quien la escribió puede modificar esta respuesta.');
    return r;
  }

  async updateReply(id: string, body: string): Promise<ClubReply> {
    const r = await this.ownReply(id);
    const next = { ...r, body: validateReply(body), updatedAt: Date.now() };
    await (await this.db()).put('replies', next);
    return next;
  }

  async deleteReply(id: string): Promise<void> {
    const r = await this.ownReply(id);
    const d = await this.db();
    const tx = d.transaction(['threads', 'replies'], 'readwrite');
    await tx.objectStore('replies').delete(id);
    const t = await tx.objectStore('threads').get(r.threadId);
    if (t) await tx.objectStore('threads').put({ ...t, replyCount: Math.max(0, t.replyCount - 1) });
    await tx.done;
  }

  subscription = pendingSubscriptions(() => this.currentUser());

  dev = {
    /** Solo desarrollo: cambia el plan de la cuenta local para verificar premium. */
    setPlan: async (plan: PlanId): Promise<User> => {
      const u = await this.requireUser();
      const d = await this.db();
      const stored = (await d.get('users', u.id))!;
      const next = { ...stored, plan };
      await d.put('users', next);
      return publicUser(next);
    },
  };
}
