/**
 * Almacenamiento local con IndexedDB. Nada de lo que se guarda aquí sale del
 * dispositivo: documentos originales, texto extraído, imágenes y progreso.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Block, DocMeta, Progress } from './types';

/**
 * Los archivos se guardan como bytes (ArrayBuffer) y no como Blob: Safari/WebKit
 * rechaza guardar Blob en IndexedDB en algunas situaciones (por ejemplo, en
 * navegación privada) con el error «Error preparing Blob/File data». Los
 * registros antiguos con `blob` se siguen leyendo.
 */
interface Stored {
  blob?: Blob;
  data?: ArrayBuffer;
  type?: string;
}

interface RenglonDB extends DBSchema {
  docs: { key: string; value: DocMeta };
  files: { key: string; value: Stored & { id: string } };
  content: { key: string; value: { id: string; blocks: Block[] } };
  assets: { key: string; value: Stored & { key: string; docId: string }; indexes: { byDoc: string } };
  progress: { key: string; value: Progress };
}

export const storedBlob = (r: Stored | undefined): Blob | undefined =>
  r ? (r.blob ?? (r.data ? new Blob([r.data], { type: r.type ?? '' }) : undefined)) : undefined;

const toStored = async (b: Blob): Promise<Stored> => ({ data: await b.arrayBuffer(), type: b.type });

let dbp: Promise<IDBPDatabase<RenglonDB>> | null = null;

export function db(): Promise<IDBPDatabase<RenglonDB>> {
  dbp ??= openDB<RenglonDB>('renglon', 1, {
    upgrade(d) {
      d.createObjectStore('docs', { keyPath: 'id' });
      d.createObjectStore('files', { keyPath: 'id' });
      d.createObjectStore('content', { keyPath: 'id' });
      const assets = d.createObjectStore('assets', { keyPath: 'key' });
      assets.createIndex('byDoc', 'docId');
      d.createObjectStore('progress', { keyPath: 'id' });
    },
  });
  return dbp;
}

export async function listDocs(): Promise<DocMeta[]> {
  const docs = await (await db()).getAll('docs');
  return docs.sort((a, b) => (b.openedAt ?? b.addedAt) - (a.openedAt ?? a.addedAt));
}

export async function getDoc(id: string): Promise<DocMeta | undefined> {
  return (await db()).get('docs', id);
}

export async function putDoc(meta: DocMeta): Promise<void> {
  await (await db()).put('docs', meta);
}

export async function getFile(id: string): Promise<Blob | undefined> {
  return storedBlob(await (await db()).get('files', id));
}

export async function getBlocks(id: string): Promise<Block[]> {
  return (await (await db()).get('content', id))?.blocks ?? [];
}

export async function putBlocks(id: string, blocks: Block[]): Promise<void> {
  await (await db()).put('content', { id, blocks });
}

/** Imágenes de un documento, listas para mostrar. */
export async function docAssets(docId: string): Promise<Array<{ key: string; blob: Blob }>> {
  const list = await (await db()).getAllFromIndex('assets', 'byDoc', docId);
  return list.map((a) => ({ key: a.key, blob: storedBlob(a)! })).filter((a) => a.blob);
}

/** Guarda un documento recién importado de una sola vez. */
export async function saveImported(
  meta: DocMeta,
  file: Blob,
  blocks: Block[],
  assets: Array<{ key: string; blob: Blob }>,
): Promise<void> {
  // Los bytes se leen antes de abrir la transacción: IndexedDB la cierra sola
  // si durante ella se espera otra cosa.
  const fileData = await toStored(file);
  const assetData = await Promise.all(assets.map(async (a) => ({ key: a.key, docId: meta.id, ...(await toStored(a.blob)) })));
  const d = await db();
  const tx = d.transaction(['docs', 'files', 'content', 'assets'], 'readwrite');
  await Promise.all([
    tx.objectStore('docs').put(meta),
    tx.objectStore('files').put({ id: meta.id, ...fileData }),
    tx.objectStore('content').put({ id: meta.id, blocks }),
    ...assetData.map((a) => tx.objectStore('assets').put(a)),
    tx.done,
  ]);
}

/** Elimina el documento, su texto, sus imágenes y su progreso de lectura. */
export async function deleteDoc(id: string): Promise<void> {
  const d = await db();
  const tx = d.transaction(['docs', 'files', 'content', 'assets', 'progress'], 'readwrite');
  const keys = await tx.objectStore('assets').index('byDoc').getAllKeys(id);
  await Promise.all([
    tx.objectStore('docs').delete(id),
    tx.objectStore('files').delete(id),
    tx.objectStore('content').delete(id),
    tx.objectStore('progress').delete(id),
    ...keys.map((k) => tx.objectStore('assets').delete(k)),
    tx.done,
  ]);
  try {
    localStorage.removeItem(progressMirrorKey(id));
  } catch {
    /* almacenamiento no disponible */
  }
}

// ——— Progreso ———
// Se guarda en IndexedDB y, además, en una copia síncrona en localStorage:
// si la app se cierra de golpe, la escritura síncrona es la que sobrevive.

const progressMirrorKey = (id: string) => `renglon.progress.${id}`;

export function mirrorProgress(p: Progress): void {
  try {
    localStorage.setItem(progressMirrorKey(p.id), JSON.stringify(p));
  } catch {
    /* sin almacenamiento síncrono: queda IndexedDB */
  }
}

export async function saveProgress(p: Progress): Promise<void> {
  mirrorProgress(p);
  await (await db()).put('progress', p);
}

/** Resuelve con `fallback` si la promesa tarda más de `ms`. */
function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(fallback), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      () => {
        clearTimeout(t);
        resolve(fallback);
      },
    );
  });
}

export async function getProgress(id: string): Promise<Progress | undefined> {
  // Si IndexedDB no responde a tiempo (Safari puede demorar una lectura detrás
  // de una escritura de una página anterior), vale la copia de localStorage.
  const stored = await withTimeout(
    db().then((d) => d.get('progress', id)),
    1500,
    undefined,
  );
  let mirrored: Progress | undefined;
  try {
    const raw = localStorage.getItem(progressMirrorKey(id));
    if (raw) mirrored = JSON.parse(raw) as Progress;
  } catch {
    mirrored = undefined;
  }
  if (stored && mirrored) return mirrored.updatedAt > stored.updatedAt ? mirrored : stored;
  return stored ?? mirrored;
}

export async function progressFor(ids: string[]): Promise<Map<string, Progress>> {
  const map = new Map<string, Progress>();
  for (const id of ids) {
    const p = await getProgress(id);
    if (p) map.set(id, p);
  }
  return map;
}
