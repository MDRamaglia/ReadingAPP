import type { Position } from '../lib/types';

/** Interfaz común que el lector usa para manejar cualquiera de los dos modos. */
export interface ViewHandle {
  next(): void;
  prev(): void;
  goTo(pos: Position): void;
  position(): Position;
  /** Modo libro: página (base 0) que contiene una posición. */
  pageOf?(pos: Position): number | null;
  goToPage?(page: number): void;
}

export interface ViewReport {
  pos: Position;
  /** Página visible (base 0) y total, en el modo libro. */
  page?: number;
  pages?: number;
  /** Cantidad de páginas por pantalla (1 o 2). */
  perView?: number;
}

export const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
