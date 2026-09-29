/**
 * Punto de entrada de la importación: identifica el tipo real del archivo
 * (por su contenido, no solo por la extensión) y lo deriva al importador que
 * corresponde. Todo ocurre en el dispositivo.
 */
import { saveImported } from '../lib/db';
import { ImportError, type ImportProgress, type ImportResult } from './types';

export type FileKind = 'docx' | 'pdf' | 'doc' | 'unknown';

export async function sniff(file: File): Promise<FileKind> {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const hex = Array.from(head, (b) => b.toString(16).padStart(2, '0')).join('');
  const ext = file.name.toLowerCase().split('.').pop() ?? '';
  if (hex.startsWith('25504446')) return 'pdf'; // %PDF
  if (hex.startsWith('d0cf11e0a1b11ae1')) return 'doc'; // contenedor OLE2 de Office 97-2003
  // Un ZIP puede ser .docx (aunque venga renombrado) u otro formato de oficina.
  if (hex.startsWith('504b0304')) return ['odt', 'xlsx', 'pptx', 'zip', 'epub'].includes(ext) ? 'unknown' : 'docx';
  if (ext === 'doc') return 'doc';
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

export async function importFile(file: File, onProgress: (p: ImportProgress) => void): Promise<ImportResult> {
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
  await saveImported(result.meta, file, result.blocks, result.assets);
  // Pedir almacenamiento persistente reduce el riesgo de que el navegador
  // borre la biblioteca cuando necesita espacio.
  try {
    await navigator.storage?.persist?.();
  } catch {
    /* no disponible */
  }
  return result;
}
