import type { Block, DocMeta } from '../lib/types';

export interface ImportResult {
  meta: DocMeta;
  blocks: Block[];
  assets: Array<{ key: string; blob: Blob }>;
}

export type ImportPhase = 'read' | 'convert' | 'analyze' | 'images' | 'save';

export interface ImportProgress {
  phase: ImportPhase;
  done: number;
  total: number;
}

export class ImportError extends Error {
  constructor(
    message: string,
    /** Explicación y pasos sugeridos para el usuario. */
    public readonly help?: string,
  ) {
    super(message);
  }
}
