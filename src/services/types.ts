/** Modelo de datos de cuentas, reseñas, Reading Club y suscripción. */
import type { PlanId } from '../config/plans';

export interface User {
  id: string;
  username: string;
  email: string;
  plan: PlanId;
  createdAt: number;
}

export interface Review {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  category: string;
  title: string;
  body: string;
  spoiler: boolean;
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt?: number;
  likes: number;
  /** El usuario actual le dio like (false sin sesión). */
  likedByMe: boolean;
}

export type ReviewInput = Pick<Review, 'bookTitle' | 'bookAuthor' | 'category' | 'title' | 'body' | 'spoiler'>;

export type ReviewSort = 'top' | 'recent';

export interface ReviewQuery {
  /** Texto a buscar en el nombre del libro o el autor (sin distinguir mayúsculas ni tildes). */
  text?: string;
  category?: string;
  sort?: ReviewSort;
  authorId?: string;
}

export interface ClubThread {
  id: string;
  title: string;
  body: string;
  category: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt?: number;
  replyCount: number;
  lastActivity: number;
}

export type ThreadInput = Pick<ClubThread, 'title' | 'body' | 'category'>;

export interface ClubReply {
  id: string;
  threadId: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt?: number;
}

export interface SignUpInput {
  username: string;
  email: string;
  password: string;
}
