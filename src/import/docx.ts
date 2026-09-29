/**
 * Importación de Word (.docx) con mammoth: títulos, párrafos, listas, tablas,
 * saltos de página e imágenes. Las imágenes se guardan aparte como archivos
 * locales y el texto se convierte en bloques.
 */
import mammoth from 'mammoth';
import { stripExtension } from '../lib/text';
import type { Block, DocMeta, TocEntry } from '../lib/types';
import { htmlToBlocks, htmlToText, markChapterBreaks } from './htmlBlocks';
import type { ImportProgress, ImportResult } from './types';

const STYLE_MAP = [
  "p[style-name='Title'] => h1.doc-title:fresh",
  "p[style-name='Título'] => h1.doc-title:fresh",
  "p[style-name='Subtitle'] => h2.doc-subtitle:fresh",
  "p[style-name='Subtítulo'] => h2.doc-subtitle:fresh",
  "p[style-name='Quote'] => blockquote > p:fresh",
  "p[style-name='Intense Quote'] => blockquote > p:fresh",
  "p[style-name='Cita'] => blockquote > p:fresh",
  "p[style-name='Cita destacada'] => blockquote > p:fresh",
  "p[style-name='Título 1'] => h1:fresh",
  "p[style-name='Título 2'] => h2:fresh",
  "p[style-name='Título 3'] => h3:fresh",
  "p[style-name='Título 4'] => h4:fresh",
  "br[type='page'] => hr.pb",
];

async function imageSize(blob: Blob): Promise<{ w: number; h: number } | null> {
  try {
    const bmp = await createImageBitmap(blob);
    const size = { w: bmp.width, h: bmp.height };
    bmp.close();
    return size;
  } catch {
    return null;
  }
}

export async function importDocx(id: string, file: File, onProgress: (p: ImportProgress) => void): Promise<ImportResult> {
  onProgress({ phase: 'read', done: 0, total: 1 });
  const arrayBuffer = await file.arrayBuffer();
  onProgress({ phase: 'convert', done: 0, total: 1 });

  const images: Array<{ key: string; blob: Blob }> = [];
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: STYLE_MAP,
      convertImage: mammoth.images.imgElement(async (image) => {
        const buf = await image.readAsArrayBuffer();
        const key = `${id}/img${images.length}`;
        images.push({ key, blob: new Blob([buf], { type: image.contentType }) });
        return { src: `asset:${key}` };
      }),
    },
  );

  const blocks = htmlToBlocks(result.value);
  markChapterBreaks(blocks);

  // Medidas de cada imagen para reservar su espacio; los formatos que el
  // navegador no sabe dibujar (EMF/WMF de Office) se avisan en su lugar.
  const assets: ImportResult['assets'] = [];
  let unsupported = 0;
  for (let i = 0; i < images.length; i++) {
    onProgress({ phase: 'images', done: i, total: images.length });
    const img = images[i]!;
    const size = await imageSize(img.blob);
    for (const b of blocks) {
      if (b.img !== img.key) continue;
      if (size) {
        b.w = size.w;
        b.h = size.h;
      } else {
        b.t = 'notice';
        b.html = `[Imagen en formato ${img.blob.type.replace('image/', '').toUpperCase() || 'desconocido'} que el navegador no puede mostrar]`;
        b.len = htmlToText(b.html).length;
        delete b.img;
      }
    }
    if (size) assets.push(img);
    else unsupported++;
  }
  const finalBlocks: Block[] = blocks.filter((b) => b.t !== 'img' || b.img);

  const toc: TocEntry[] = [];
  finalBlocks.forEach((b, i) => {
    const m = /^h([1-3])$/.exec(b.t);
    if (m) toc.push({ title: htmlToText(b.html).trim(), level: Number(m[1]), b: i });
  });

  const firstHeading = finalBlocks.find((b) => b.t === 'h1');
  const title = (firstHeading && htmlToText(firstHeading.html).trim().slice(0, 120)) || stripExtension(file.name);

  const warnings: string[] = [];
  if (unsupported) {
    warnings.push(
      `${unsupported === 1 ? 'Una imagen está' : `${unsupported} imágenes están`} en un formato de Office (EMF/WMF) que el navegador no puede mostrar; se indica su lugar en el texto.`,
    );
  }
  if (!finalBlocks.some((b) => b.len > 0)) warnings.push('El documento no contiene texto.');

  const meta: DocMeta = {
    id,
    name: file.name,
    title,
    kind: 'docx',
    size: file.size,
    addedAt: Date.now(),
    textReady: finalBlocks.some((b) => b.len > 0),
    toc,
    warnings,
    totalChars: finalBlocks.reduce((s, b) => s + b.len, 0),
    blockCount: finalBlocks.length,
  };
  return { meta, blocks: finalBlocks, assets };
}
