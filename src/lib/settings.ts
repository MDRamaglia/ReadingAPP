import { useEffect, useState } from 'preact/hooks';
import type { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  fontSize: 20,
  width: 32,
  lineHeight: 1.6,
  theme: 'light',
  font: 'literata',
  focusContext: 'dim',
  bookDirection: 'horizontal',
  pageCurl: false,
  curlSpeed: 'normal',
};

/** Duración de una vuelta de hoja completa, en milisegundos, según la velocidad elegida. */
export const CURL_MS: Record<Settings['curlSpeed'], number> = { slow: 1150, normal: 850, fast: 600 };

export const LIMITS = {
  fontSize: { min: 14, max: 34, step: 1 },
  width: { min: 12, max: 48, step: 1 },
  lineHeight: { min: 1.2, max: 2.2, step: 0.1 },
};

const KEY = 'renglon.settings';
/** Sin sesión, las preferencias del dispositivo; con sesión, las de esa cuenta. */
let scope: string | null = null;
const keyFor = (userId: string | null) => (userId ? `${KEY}.u.${userId}` : KEY);

function stored(key: string): Partial<Settings> | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<Settings>) : null;
  } catch {
    return null;
  }
}

function load(key = keyFor(scope)): Settings {
  const saved = stored(key);
  if (saved) return { ...DEFAULT_SETTINGS, ...saved };
  // Primera vez: se respeta el tema del sistema y, en pantallas chicas, una letra algo menor.
  const dark = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  const small = typeof innerWidth === 'number' && innerWidth < 420;
  return { ...DEFAULT_SETTINGS, theme: dark ? 'dark' : 'light', fontSize: small ? 19 : DEFAULT_SETTINGS.fontSize };
}

let current = load();
const listeners = new Set<(s: Settings) => void>();

export function getSettings(): Settings {
  return current;
}

function save() {
  try {
    localStorage.setItem(keyFor(scope), JSON.stringify(current));
  } catch {
    /* se mantiene en memoria */
  }
}

export function updateSettings(patch: Partial<Settings>): void {
  current = { ...current, ...patch };
  save();
  applyTheme(current);
  listeners.forEach((l) => l(current));
}

/**
 * Cambia de quién son las preferencias (al iniciar o cerrar sesión). Una
 * cuenta nueva en este dispositivo empieza con las preferencias que había.
 * Cuando exista servidor, aquí se sincronizarán con la cuenta.
 */
export function setSettingsScope(userId: string | null): void {
  if (userId === scope) return;
  // Solo una cuenta que todavía no tiene preferencias hereda las actuales; al
  // cerrar sesión se vuelve a las del dispositivo (o a las iniciales).
  const inherit = !!userId && !stored(keyFor(userId));
  scope = userId;
  if (inherit) save();
  else current = load();
  applyTheme(current);
  listeners.forEach((l) => l(current));
}

export function useSettings(): Settings {
  const [s, set] = useState(current);
  useEffect(() => {
    listeners.add(set);
    set(current);
    return () => {
      listeners.delete(set);
    };
  }, []);
  return s;
}

const THEME_COLORS: Record<Settings['theme'], string> = {
  light: '#f7f9fc',
  sepia: '#f3e8cf',
  dark: '#0a0e16',
};

export function applyTheme(s: Settings): void {
  document.documentElement.dataset.theme = s.theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[s.theme]);
}

/** Animación de hoja efectiva: solo en horizontal y si el sistema no pide reducir el movimiento. */
export function curlEnabled(s: Settings): boolean {
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return s.bookDirection === 'horizontal' && s.pageCurl && !reduced;
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
