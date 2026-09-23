/** Utilidades de texto puras (sin DOM), fáciles de probar. */

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Colapsa espacios (sin tocar los espacios duros) y elimina guiones blandos. */
export function normalizeSpaces(s: string): string {
  return s.replace(/\u00AD/g, '').replace(/[ \t\n\r\f\v\u2028\u2029]+/g, ' ');
}

const HYPHEN_END = /(\p{L})[-\u2010\u2011]$/u;
const STARTS_LOWER = /^\p{Ll}/u;

/**
 * Une renglones de un mismo párrafo. Si un renglón termina en guion de corte
 * («pala-» + «bra») y el siguiente empieza en minúscula, se reconstruye la
 * palabra; si no, se separa con un espacio.
 */
export function joinLines(lines: string[]): string {
  let out = '';
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (!out) {
      out = line;
    } else if (HYPHEN_END.test(out) && STARTS_LOWER.test(line)) {
      out = out.slice(0, -1) + line;
    } else {
      out += ' ' + line;
    }
  }
  return out;
}

/** Recorta un fragmento para mostrar como recordatorio («…y entonces…»). */
export function snippetAt(text: string, offset: number, max = 90): string {
  let start = Math.max(0, Math.min(offset, text.length));
  // Retrocede hasta el comienzo de la palabra.
  while (start > 0 && /\S/.test(text[start - 1]!)) start--;
  let s = text.slice(start).trim();
  if (s.length > max) {
    s = s.slice(0, max);
    const cut = s.lastIndexOf(' ');
    if (cut > max * 0.6) s = s.slice(0, cut);
    s += '…';
  }
  return s;
}

export function stripExtension(name: string): string {
  return name.replace(/\.[^.]+$/, '');
}

const ROMAN = /^[ivxlcdm]+$/i;

/** ¿Parece un número de página suelto? («12», «- 12 -», «Página 12», «xii», «12 de 80»). */
export function looksLikePageNumber(s: string): boolean {
  const t = s.trim().toLowerCase();
  if (!t || t.length > 24) return false;
  if (/^[-–—\s]*\d{1,4}[-–—\s]*$/.test(t)) return true;
  if (ROMAN.test(t) && t.length <= 6) return true;
  if (/^(p[áa]g(ina)?\.?|p\.)\s*\d{1,4}(\s*(de|\/)\s*\d{1,4})?$/.test(t)) return true;
  if (/^\d{1,4}\s*(de|\/)\s*\d{1,4}$/.test(t)) return true;
  return false;
}

/** Normaliza un encabezado o pie para detectar repeticiones entre páginas. */
export function headerKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\d+/g, '#')
    .replace(/\s+/g, ' ');
}

/** Distancia de edición (Levenshtein), usada para medir la precisión del OCR. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = new Array<number>(b.length + 1);
  let cur = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= b.length; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[b.length]!;
}
