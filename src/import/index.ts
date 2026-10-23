/**
 * Punto de entrada de la importación: identifica el tipo real del archivo
 * (por su contenido, no solo por la extensión) y lo deriva al importador que
 * corresponde. Todo ocurre en el dispositivo.
 */
import { TECHNICAL_LIMITS } from '../config/plans';
import { fmtNumber, t } from '../i18n';
import { saveImported } from '../lib/db';
import { ImportError, type ImportProgress, type ImportResult } from './types';

export type FileKind = 'docx' | 'pdf' | 'doc' | 'unknown';

export async function sniff(file: File): Promise<FileKind> {
  const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const hex = Array.from(head.subarray(0, 8), (b) => b.toString(16).padStart(2, '0')).join('');
  const ext = file.name.toLowerCase().split('.').pop() ?? '';
  // La marca %PDF- puede no estar en el primer byte: la norma admite datos previos.
  const latin = String.fromCharCode(...head);
  if (latin.includes('%PDF-')) return 'pdf';
  if (hex.startsWith('d0cf11e0a1b11ae1')) return 'doc'; // contenedor OLE2 de Office 97-2003
  // Un ZIP puede ser .docx (aunque venga renombrado) u otro formato de oficina.
  if (hex.startsWith('504b0304')) return ['odt', 'xlsx', 'pptx', 'zip', 'epub'].includes(ext) ? 'unknown' : 'docx';
  if (ext === 'doc') return 'doc';
  // Último recurso: la extensión o el tipo que informa el sistema. Si no es un
  // PDF de verdad, pdf.js lo va a rechazar con un mensaje claro.
  if (ext === 'pdf' || file.type === 'application/pdf') return 'pdf';
  return 'unknown';
}

/** Cómo convertir un .doc antiguo (en el idioma actual). */
export const docHelp = (): string => t('import.error.docHelp');

export function newId(): string {
  const r = crypto.getRandomValues(new Uint32Array(2));
  return `d${Date.now().toString(36)}${r[0]!.toString(36)}${r[1]!.toString(36)}`;
}

export interface ImportOptions {
  /** Cuenta dueña del documento (sin valor: sin sesión). */
  ownerId?: string;
  /**
   * Comprueba el límite de documentos del plan; lanza un error si no hay
   * lugar. Se llama antes de convertir y otra vez justo antes de guardar.
   */
  checkLimit?: () => Promise<void>;
}

export async function importFile(file: File, onProgress: (p: ImportProgress) => void, opts: ImportOptions = {}): Promise<ImportResult> {
  await opts.checkLimit?.();
  // Límite técnico, igual para todos los planes (independiente de la cantidad de documentos).
  if (file.size > TECHNICAL_LIMITS.maxFileBytes) {
    const mb = Math.round(TECHNICAL_LIMITS.maxFileBytes / 1024 / 1024);
    throw new ImportError(t('import.error.tooBig', { name: file.name, mb: fmtNumber(mb) }), t('import.error.tooBigHelp'));
  }
  const kind = await sniff(file);
  if (kind === 'doc') {
    throw new ImportError(t('import.error.oldDoc', { name: file.name }), docHelp());
  }
  if (kind === 'unknown') {
    throw new ImportError(t('import.error.unknown', { name: file.name }), t('import.error.unknownHelp'));
  }
  const id = newId();
  let result: ImportResult;
  try {
    if (kind === 'pdf') {
      const { importPdf } = await import('./pdf');
      result = await importPdf(id, file, onProgress);
    } else {
      const { importDocx } = await import('./docx');
      result = await importDocx(id, file, onProgress);
    }
  } catch (e) {
    if (e instanceof ImportError) throw e;
    const name = (e as Error)?.name ?? '';
    if (name === 'PasswordException') {
      throw new ImportError(t('import.error.password'), t('import.error.passwordHelp'));
    }
    if (name === 'InvalidPDFException') {
      throw new ImportError(t('import.error.damaged'), t('import.error.damagedHelp'));
    }
    throw new ImportError(
      t('import.error.unreadable', { name: file.name }),
      kind === 'docx' ? t('import.error.badDocx') : t('import.error.technical', { detail: (e as Error)?.message ?? String(e) }),
    );
  }
  onProgress({ phase: 'save', done: 0, total: 1 });
  await opts.checkLimit?.();
  if (opts.ownerId) result.meta.ownerId = opts.ownerId;
  try {
    await saveImported(result.meta, file, result.blocks, result.assets);
  } catch (e) {
    const detail = (e as Error)?.message ?? String(e);
    const full = /quota/i.test(detail) || (e as Error)?.name === 'QuotaExceededError';
    throw new ImportError(
      t('import.error.saveFailed', { name: file.name }),
      `${full ? t('import.error.storageFull') : t('import.error.storageDenied')} ${t('import.error.technical', { detail })}`,
    );
  }
  // Pedir almacenamiento persistente reduce el riesgo de que el navegador
  // borre la biblioteca cuando necesita espacio.
  try {
    await navigator.storage?.persist?.();
  } catch {
    /* no disponible */
  }
  return result;
}
