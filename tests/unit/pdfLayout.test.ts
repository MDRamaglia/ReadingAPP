import { describe, expect, it } from 'vitest';
import { buildParagraphs, groupLines, markFurniture, type PdfTextItem } from '../../src/import/pdfLayout';
import { joinLines, levenshtein, looksLikePageNumber, normalizeSpaces, snippetAt } from '../../src/lib/text';

/** Genera los fragmentos de un renglón como los entrega pdf.js (palabra por palabra). */
function line(text: string, x: number, y: number, fs = 10): PdfTextItem[] {
  const items: PdfTextItem[] = [];
  let cx = x;
  text.split(' ').forEach((w, i, all) => {
    const width = w.length * fs * 0.5;
    items.push({ str: w, x: cx, y, w: width, fs, eol: i === all.length - 1 });
    cx += width + fs * 0.25;
  });
  return items;
}

describe('texto', () => {
  it('reconstruye palabras cortadas con guion al final del renglón', () => {
    expect(joinLines(['la posición se ex-', 'presa con una barra'])).toBe('la posición se expresa con una barra');
    expect(joinLines(['Buenos Aires-', 'Madrid'])).toBe('Buenos Aires- Madrid');
    expect(joinLines(['primera línea', 'segunda'])).toBe('primera línea segunda');
  });

  it('normaliza espacios y quita guiones blandos', () => {
    expect(normalizeSpaces('uno\n  dos­tres\ttres')).toBe('uno dostres tres');
  });

  it('reconoce números de página sueltos', () => {
    for (const s of ['12', '- 12 -', 'xii', 'Página 4', 'pág. 7', '3 de 80', '3/80']) expect(looksLikePageNumber(s), s).toBe(true);
    for (const s of ['Capítulo 2', '1450, en Maguncia', 'Índice']) expect(looksLikePageNumber(s), s).toBe(false);
  });

  it('recorta un fragmento desde el comienzo de la palabra', () => {
    expect(snippetAt('Durante siglos, leer fue una tarea', 10)).toBe('siglos, leer fue una tarea');
  });

  it('calcula la distancia de edición', () => {
    expect(levenshtein('lectura', 'lecturas')).toBe(1);
    expect(levenshtein('códice', 'codice')).toBe(1);
  });
});

describe('renglones y párrafos de PDF', () => {
  it('agrupa fragmentos en renglones por línea de base', () => {
    const items = [...line('Primera línea del texto', 50, 100), ...line('segunda línea', 50, 114)];
    const lines = groupLines(items);
    expect(lines.map((l) => l.text)).toEqual(['Primera línea del texto', 'segunda línea']);
  });

  it('ignora la negrita simulada (texto impreso dos veces)', () => {
    const items = [{ str: 'Hola', x: 10, y: 10, w: 20, fs: 10 }, { str: 'Hola', x: 10.4, y: 10, w: 20, fs: 10 }];
    expect(groupLines(items).map((l) => l.text)).toEqual(['Hola']);
  });

  it('separa párrafos por espacio vertical, títulos por tamaño y une guiones de corte', () => {
    const W = 300;
    const full = (t: string) => t.padEnd(56, 'x');
    const items = [
      ...line('Capítulo uno', 50, 60, 18),
      ...line(full('Primer párrafo que ocupa todo el ancho de la columna y ter-'), 50, 100),
      ...line('mina aquí.', 50, 113),
      ...line(full('Segundo párrafo después de un espacio mayor que el interlineado'), 50, 140),
      ...line('y sigue.', 50, 153),
    ];
    const layout = buildParagraphs(groupLines(items), 10, W);
    expect(layout.paras.map((p) => p.kind)).toEqual(['h1', 'p', 'p']);
    expect(layout.paras[1]!.text).toContain('termina aquí.');
    expect(layout.orderDoubt).toBe(false);
  });

  it('marca como dudoso el orden cuando el contenido vuelve hacia arriba (dos columnas)', () => {
    const items = [...line('Columna izquierda arriba', 50, 100), ...line('columna izquierda abajo.', 50, 113), ...line('Columna derecha arriba', 250, 100), ...line('columna derecha abajo.', 250, 113)];
    const layout = buildParagraphs(groupLines(items), 10);
    expect(layout.orderDoubt).toBe(true);
    expect(layout.paras).toHaveLength(2);
  });

  it('descarta encabezados repetidos, números de página y títulos corrientes', () => {
    const H = 800;
    const pages = [1, 2, 3, 4, 5, 6].map((n) => ({
      h: H,
      lines: groupLines([
        ...line('Breve historia', 100, 30, 7),
        ...line(n === 3 ? 'Capítulo 2' : 'Texto', 100, n === 3 ? 40 : 300, n === 3 ? 7 : 10),
        ...line('Capítulo 2', 100, 400, 16),
        ...line('Cuerpo del texto de la página', 50, 200),
        ...line(String(n), 200, 780),
      ]),
    }));
    markFurniture(pages);
    const kept = pages.flatMap((p) => p.lines.filter((l) => !l.furniture).map((l) => l.text));
    expect(kept).not.toContain('Breve historia');
    expect(kept.filter((t) => /^\d$/.test(t))).toEqual([]);
    expect(kept.filter((t) => t === 'Capítulo 2')).toHaveLength(6);
  });
});
