import type { Block, DocMeta, Position } from '../lib/types';
import { snippetAt } from '../lib/text';

/** Página PDF a la que pertenece una posición de texto. */
export function pageOfPos(blocks: Block[], pos: Position): number | undefined {
  const b = blocks[pos.b];
  if (!b) return pos.page;
  let page = b.page;
  for (const [o, p] of b.pb ?? []) if (pos.o >= o) page = p;
  return page;
}

/** Primer bloque con texto o imagen de una página PDF (o de la siguiente que tenga). */
export function posOfPage(blocks: Block[], page: number): Position | null {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]!;
    const pbHit = b.pb?.find(([, p]) => p >= page);
    if (b.page !== undefined && b.page >= page) return { b: i, o: 0, page: b.page };
    if (pbHit) return { b: i, o: pbHit[0], page: pbHit[1] };
  }
  return null;
}

export class TextIndex {
  private cum: number[] = [];
  private total = 0;
  private texts = new Map<number, string>();

  constructor(private blocks: Block[]) {
    let acc = 0;
    for (const b of blocks) {
      this.cum.push(acc);
      acc += b.len;
    }
    this.total = acc;
  }

  pct(pos: Position): number {
    if (!this.total || pos.b < 0) return 0;
    const at = (this.cum[pos.b] ?? this.total) + Math.min(pos.o, this.blocks[pos.b]?.len ?? 0);
    return Math.max(0, Math.min(1, at / this.total));
  }

  text(b: number): string {
    let t = this.texts.get(b);
    if (t === undefined) {
      const d = document.createElement('div');
      d.innerHTML = this.blocks[b]?.html ?? '';
      t = d.textContent ?? '';
      this.texts.set(b, t);
    }
    return t;
  }

  snippet(pos: Position): string {
    if (pos.b < 0) return '';
    // Si el bloque no tiene texto (imagen), se toma el siguiente.
    for (let b = pos.b; b < Math.min(this.blocks.length, pos.b + 4); b++) {
      const t = this.text(b);
      if (t.trim()) return snippetAt(t, b === pos.b ? pos.o : 0);
    }
    return '';
  }

  /** Sección (título más reciente) que contiene la posición. */
  section(pos: Position, meta: DocMeta): string | undefined {
    let found: string | undefined;
    for (const t of meta.toc) {
      if (t.b === undefined) continue;
      if (t.b <= pos.b) found = t.title;
      else break;
    }
    return found;
  }
}
