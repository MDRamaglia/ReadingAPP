/**
 * Almacenamiento local con IndexedDB. Nada de lo que se guarda aquí sale del
 * dispositivo: documentos originales, texto extraído, imágenes y progreso.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Block, DocMeta, Progress } from './types';

interface RenglonDB extends DBSchema {
  docs: { key: string; value: DocMeta };
  files: { key: string; value: { id: string; blob: Blob } };
  content: { key: string; value: { id: string; blocks: Block[] } };
  assets: { key: string; value: { key: string; docId: string; blob: Blob }; indexes: { byDoc: string } };
  progress: { key: string; value: Progress };
}

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
  return (await (await db()).get('files', id))?.blob;
}

export async function getBlocks(id: string): Promise<Block[]> {
  return (await (await db()).get('content', id))?.blocks ?? [];
}

export async function putBlocks(id: string, blocks: Block[]): Promise<void> {
  await (await db()).put('content', { id, blocks });
}

export async function getAsset(key: string): Promise<Blob | undefined> {
  return (await (await db()).get('assets', key))?.blob;
}

export async function putAsset(docId: string, key: string, blob: Blob): Promise<void> {
  await (await db()).put('assets', { key, docId, blob });
}

/** Guarda un documento recién importado de una sola vez. */
export async function saveImported(
  meta: DocMeta,
  file: Blob,
  blocks: Block[],
  assets: Array<{ key: string; blob: Blob }>,
): Promise<void> {
  const d = await db();
  const tx = d.transaction(['docs', 'files', 'content', 'assets'], 'readwrite');
  await Promise.all([
    tx.objectStore('docs').put(meta),
    tx.objectStore('files').put({ id: meta.id, blob: file }),
    tx.objectStore('content').put({ id: meta.id, blocks }),
    ...assets.map((a) => tx.objectStore('assets').put({ key: a.key, docId: meta.id, blob: a.blob })),
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

export async function getProgress(id: string): Promise<Progress | undefined> {
  const stored = await (await db()).get('progress', id);
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
