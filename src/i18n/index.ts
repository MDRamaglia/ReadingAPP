/**
 * Idiomas de la app: español (base), inglés y portugués.
 *
 * Todos los textos visibles salen de los archivos de idioma (`es.ts`, `en.ts`,
 * `pt.ts`) con `t(clave, parámetros)`. El español es la base: define las
 * claves y es el respaldo de cualquier texto que todavía no esté traducido.
 *
 *   t('club.replies', { count: 3 })   →  «3 respuestas»
 *
 * - Interpolación: `{nombre}` se reemplaza por el parámetro del mismo nombre.
 * - Plurales: un texto puede tener formas (`one`, `other`, …) según
 *   `Intl.PluralRules`; la forma se elige con el parámetro `count`.
 * - Fechas y números: `fmtDate` y `fmtNumber` usan el formato regional del
 *   idioma actual.
 *
 * Importante: no llamar a `t()` al cargar un módulo (en constantes de nivel
 * superior), porque el idioma se elige después, al arrancar la app. Las
 * etiquetas de configuración se resuelven en el momento de mostrarlas.
 *
 * Para revisar una traducción parcial se puede abrir la app con «?lang=en» o
 * «?lang=pt» (y volver con «?lang=es» o «?lang=auto»). Fuera de esa vista
 * previa, solo se eligen automáticamente los idiomas habilitados.
 */
import { en } from './en';
import { es, type Key, type Message, type Messages } from './es';
import { pt } from './pt';

export type { Key, Message, Messages };
export type Locale = 'es' | 'en' | 'pt';
export type Params = Record<string, string | number>;

export const LOCALES: readonly Locale[] = ['es', 'en', 'pt'];

/**
 * Idiomas que se eligen solos según el dispositivo. Inglés y portugués se
 * suman cuando Localización complete sus textos (P10).
 */
export const ENABLED_LOCALES: readonly Locale[] = ['es'];

const TABLES: Record<Locale, Messages> = { es, en, pt };

/** Formato regional de fechas y números de cada idioma. */
const REGION: Record<Locale, string> = { es: 'es-AR', en: 'en', pt: 'pt-BR' };

const STORE_KEY = 'knowmadic.lang';

let current: Locale = 'es';

export const getLocale = (): Locale => current;

/** Etiqueta regional (BCP 47) para `Intl` del idioma actual. */
export const intlLocale = (locale: Locale = current): string => REGION[locale];

const isLocale = (v: unknown): v is Locale => typeof v === 'string' && (LOCALES as readonly string[]).includes(v);

export function setLocale(locale: Locale): void {
  current = locale;
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
}

/** Primer idioma habilitado entre los que prefiere el dispositivo; si no hay, español. */
export function detectLocale(preferred: readonly string[] = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : []): Locale {
  for (const tag of preferred) {
    const base = tag?.toLowerCase().split('-')[0];
    if (isLocale(base) && ENABLED_LOCALES.includes(base)) return base;
  }
  return 'es';
}

/** Lee «?lang=xx» (vista previa de una traducción) y lo recuerda en este dispositivo. */
export function readLangParam(): void {
  if (typeof location === 'undefined') return;
  const m = /[?&]lang=([a-z]*)\b/.exec(location.search);
  if (!m) return;
  try {
    if (isLocale(m[1])) localStorage.setItem(STORE_KEY, m[1]);
    else localStorage.removeItem(STORE_KEY);
  } catch {
    /* sin almacenamiento */
  }
  const url = new URL(location.href);
  url.searchParams.delete('lang');
  history.replaceState(null, '', url.pathname + (url.search || '') + url.hash);
}

/** Elige el idioma al arrancar: la vista previa guardada o el del dispositivo. */
export function initLocale(): Locale {
  let chosen: string | null = null;
  try {
    chosen = localStorage.getItem(STORE_KEY);
  } catch {
    /* sin almacenamiento */
  }
  setLocale(isLocale(chosen) ? chosen : detectLocale());
  return current;
}

const pluralRules = new Map<Locale, Intl.PluralRules>();

function form(msg: Message, count: number | undefined, locale: Locale): string {
  if (typeof msg === 'string') return msg;
  if (count === undefined) return msg.other;
  let rules = pluralRules.get(locale);
  if (!rules) pluralRules.set(locale, (rules = new Intl.PluralRules(REGION[locale])));
  return msg[rules.select(count)] ?? msg.other;
}

/** Texto de la clave en el idioma actual (o en español, si falta la traducción). */
export function t(key: Key, params?: Params): string {
  const own = TABLES[current][key];
  const locale = own === undefined ? 'es' : current;
  const text = form(own ?? es[key], typeof params?.count === 'number' ? params.count : undefined, locale);
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => (name in params ? String(params[name]) : whole));
}

const dateFormats = new Map<string, Intl.DateTimeFormat>();

/** Fecha larga en el idioma actual («22 de octubre de 2026»). */
export function fmtDate(date: number | Date): string {
  const tag = intlLocale();
  let f = dateFormats.get(tag);
  if (!f) dateFormats.set(tag, (f = new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long', year: 'numeric' })));
  return f.format(date);
}

/** Número en el formato del idioma actual («10.000», «1,5»). */
export const fmtNumber = (n: number, options?: Intl.NumberFormatOptions): string => new Intl.NumberFormat(intlLocale(), options).format(n);
