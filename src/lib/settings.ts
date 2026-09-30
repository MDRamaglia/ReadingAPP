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
};

export const LIMITS = {
  fontSize: { min: 14, max: 34, step: 1 },
  width: { min: 12, max: 48, step: 1 },
  lineHeight: { min: 1.2, max: 2.2, step: 0.1 },
};

const KEY = 'renglon.settings';

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    /* sin almacenamiento: valores por defecto */
  }
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

export function updateSettings(patch: Partial<Settings>): void {
  current = { ...current, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    /* se mantiene en memoria */
  }
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
