/**
 * Punto de entrada de la importación: identifica el tipo real del archivo
 * (por su contenido, no solo por la extensión) y lo deriva al importador que
 * corresponde. Todo ocurre en el dispositivo.
 */
import { TECHNICAL_LIMITS } from '../config/plans';
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

export const DOC_HELP =
  'Los archivos .doc (Word 97-2003) usan un formato binario antiguo que esta app no puede leer directamente. ' +
  'Convertilo a .docx y volvé a cargarlo: en Word, «Archivo › Guardar como» y elegí «Documento de Word (.docx)»; ' +
  'en LibreOffice, «Archivo › Guardar como» con el tipo «Word 2007-365 (.docx)»; en Google Docs, subilo y usá ' +
  '«Archivo › Descargar › Microsoft Word (.docx)». También podés exportarlo como PDF.';

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
    throw new ImportError(`«${file.name}» es demasiado grande (más de ${mb} MB).`, 'Probá con una versión más liviana del documento, por ejemplo exportándolo de nuevo como PDF.');
  }
  const kind = await sniff(file);
  if (kind === 'doc') {
    throw new ImportError('«' + file.name + '» es un documento de Word antiguo (.doc).', DOC_HELP);
  }
  if (kind === 'unknown') {
    throw new ImportError(
      '«' + file.name + '» no es un documento de Word (.docx) ni un PDF.',
      'Por ahora la app acepta archivos .docx y .pdf.',
    );
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
      throw new ImportError('El PDF está protegido con contraseña.', 'Quitale la contraseña desde el programa con que lo creaste y volvé a cargarlo.');
    }
    if (name === 'InvalidPDFException') {
      throw new ImportError('El PDF parece dañado y no se pudo abrir.', 'Probá abrirlo en otro lector y guardarlo de nuevo como PDF.');
    }
    throw new ImportError(
      'No se pudo leer «' + file.name + '».',
      kind === 'docx'
        ? 'El archivo no parece un .docx válido. Si lo abrís en Word, guardalo de nuevo como .docx.'
        : 'Detalle técnico: ' + ((e as Error)?.message ?? String(e)),
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
      'No se pudo guardar «' + file.name + '» en este dispositivo.',
      (full
        ? 'El navegador se quedó sin espacio para la biblioteca. Eliminá algún documento y volvé a intentarlo.'
        : 'El navegador no permitió guardarlo. Si estás en una pestaña privada, abrí la app en una pestaña normal o instalada en la pantalla de inicio.') +
        ' Detalle técnico: ' +
        detail,
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
