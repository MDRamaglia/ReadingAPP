/**
 * Fechas de nacimiento y edad.
 *
 * La fecha se guarda como texto «AAAA-MM-DD», sin hora ni zona horaria, y la
 * edad se calcula contra la fecha de hoy del dispositivo (el servidor hace la
 * misma cuenta con la suya; ver docs/backend.md).
 *
 * Los años se cumplen el mismo día y mes del nacimiento. Quien nació un 29 de
 * febrero los cumple el 1 de marzo en los años no bisiestos: es la lectura
 * más prudente, porque nunca adelanta el acceso.
 */

export interface CalendarDate {
  y: number;
  m: number;
  d: number;
}

/** Año de nacimiento más antiguo que se acepta. */
export const BIRTH_YEAR_MIN = 1900;

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const daysInMonth = (y: number, m: number) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]!;
const pad = (n: number, w = 2) => String(n).padStart(w, '0');

/** Lee «AAAA-MM-DD»; null si no tiene ese formato o la fecha no existe (31 de abril, 29 de febrero de 2023). */
export function parseIsoDate(s: unknown): CalendarDate | null {
  if (typeof s !== 'string') return null;
  const m = ISO.exec(s);
  if (!m) return null;
  const date = { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
  if (date.m < 1 || date.m > 12 || date.d < 1 || date.d > daysInMonth(date.y, date.m)) return null;
  return date;
}

export const toIsoDate = ({ y, m, d }: CalendarDate): string => `${pad(y, 4)}-${pad(m)}-${pad(d)}`;

/** La fecha de hoy según el reloj y la zona horaria del dispositivo. */
export const localDate = (now: Date = new Date()): CalendarDate => ({ y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() });

/** Una fecha del calendario como instante local (mediodía, para no cambiar de día con la zona horaria). */
export const dateValue = ({ y, m, d }: CalendarDate): Date => new Date(y, m - 1, d, 12);

const compare = (a: CalendarDate, b: CalendarDate) => a.y - b.y || a.m - b.m || a.d - b.d;

export type BirthDateProblem = 'invalid' | 'future' | 'too-old';

/** Qué tiene de malo una fecha de nacimiento, o null si es válida. */
export function birthDateProblem(s: unknown, today: CalendarDate = localDate()): BirthDateProblem | null {
  const b = parseIsoDate(s);
  if (!b) return 'invalid';
  if (compare(b, today) > 0) return 'future';
  if (b.y < BIRTH_YEAR_MIN) return 'too-old';
  return null;
}

/** Años cumplidos a la fecha `today`, o null si la fecha de nacimiento no es válida (inexistente, futura o anterior a 1900). */
export function ageOn(birth: string | null | undefined, today: CalendarDate = localDate()): number | null {
  if (birthDateProblem(birth, today)) return null;
  const b = parseIsoDate(birth)!;
  const beforeBirthday = today.m < b.m || (today.m === b.m && today.d < b.d);
  return today.y - b.y - (beforeBirthday ? 1 : 0);
}
