/**
 * Modelo común de documento.
 *
 * Todo archivo importado (Word o PDF) se convierte en una lista plana de
 * bloques (párrafos, títulos, imágenes…). Esa lista alimenta el modo
 * concentración y, en el caso de Word, también el modo libro. Una posición de
 * lectura se expresa como (bloque, carácter dentro del bloque), lo que permite
 * recalcular páginas o renglones con cualquier tamaño de letra sin perder el
 * lugar.
 */

export type BlockType =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'li'
  | 'quote'
  | 'pre'
  | 'img'
  | 'table'
  | 'hr'
  | 'notice';

export interface Block {
  t: BlockType;
  /** HTML interno ya saneado. Vacío para imágenes y separadores. */
  html: string;
  /** Cantidad de caracteres de texto visibles (textContent) del bloque. */
  len: number;
  /** PDF: índice de página (base 0) de la que proviene el bloque. */
  page?: number;
  /**
   * PDF: un párrafo que continúa en la página siguiente se guarda entero; aquí
   * se anota desde qué carácter pertenece a cada página nueva: [carácter, página].
   */
  pb?: Array<[number, number]>;
  /** Modo libro: el bloque empieza en una página nueva (capítulo o salto de página). */
  brk?: boolean;
  /** Imagen: clave del recurso en la base local. */
  img?: string;
  alt?: string;
  /** Imagen: tamaño intrínseco en píxeles. */
  w?: number;
  h?: number;
  /** Lista: viñeta o número y nivel de anidamiento. */
  mk?: string;
  lvl?: number;
  /** OCR: el párrafo se reconoció con baja confianza. */
  unsure?: boolean;
}

export type DocKind = 'docx' | 'pdf';
export type PdfKind = 'text' | 'scanned' | 'mixed';

export type OcrPageStatus = 'pending' | 'ok' | 'low' | 'failed' | 'blank';

export interface PageInfo {
  /** Numeración original de la página (etiqueta del PDF o número). */
  label: string;
  /** Tamaño en puntos PDF, para conservar la proporción. */
  w: number;
  h: number;
  /** text: tiene texto seleccionable; scan: imagen sin texto; blank: página vacía. */
  kind: 'text' | 'scan' | 'blank';
  chars: number;
  /** El orden de lectura extraído puede no coincidir con el visual (columnas, recuadros). */
  orderDoubt?: boolean;
  ocr?: { status: OcrPageStatus; confidence?: number; words?: number };
}

export interface TocEntry {
  title: string;
  level: number;
  /** Bloque de destino (si hay texto). */
  b?: number;
  /** Página PDF de destino (base 0). */
  page?: number;
}

export interface DocMeta {
  id: string;
  name: string;
  title: string;
  kind: DocKind;
  size: number;
  addedAt: number;
  openedAt?: number;
  pdfKind?: PdfKind;
  pages?: PageInfo[];
  /** Hay texto suficiente para el modo concentración. */
  textReady: boolean;
  /** Estado del reconocimiento de texto para PDF escaneados. */
  ocr?: 'none' | 'partial' | 'done';
  toc: TocEntry[];
  /** PDF: el índice proviene de los marcadores del archivo o de los títulos detectados. */
  tocSource?: 'outline' | 'headings';
  /** Avisos de importación que conviene mostrar al lector. */
  warnings: string[];
  totalChars: number;
  blockCount: number;
}

export interface Position {
  /** Índice de bloque (−1 si el documento todavía no tiene texto). */
  b: number;
  /** Carácter dentro del bloque. */
  o: number;
  /** PDF: página (base 0). */
  page?: number;
}

export type ReadMode = 'book' | 'focus';

export interface Progress {
  id: string;
  pos: Position;
  mode: ReadMode;
  /** Porcentaje leído, de 0 a 1. */
  pct: number;
  updatedAt: number;
  /** Fragmento del texto en el punto de lectura, para ofrecer continuar. */
  snippet?: string;
  pageLabel?: string;
}

export type Theme = 'light' | 'sepia' | 'dark';
export type FontFamily = 'literata' | 'atkinson';
export type FocusContext = 'dim' | 'hide';
/** Dirección en que se pasan las páginas del modo libro. */
export type BookDirection = 'horizontal' | 'vertical';

export interface Settings {
  fontSize: number;
  /** Ancho máximo de la columna de lectura, en em. */
  width: number;
  lineHeight: number;
  theme: Theme;
  font: FontFamily;
  focusContext: FocusContext;
  bookDirection: BookDirection;
  /**
   * Animación de hoja que se dobla al pasar página. Solo se usa con la
   * navegación horizontal, pero la preferencia se conserva en vertical.
   */
  pageCurl: boolean;
}
