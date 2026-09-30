/**
 * Herramientas de desarrollo: permiten verificar el plan premium sin pagos.
 *
 * Se activan en el servidor de desarrollo o abriendo la app con «?dev=1» (y
 * se apagan con «?dev=0»). Solo actúan sobre el servicio local de prueba:
 * con un servidor real, el plan lo decide la suscripción y estas
 * herramientas no pueden cambiarlo.
 */
const KEY = 'knowmadic.dev';

export function readDevParam(): void {
  const m = /[?&]dev=(0|1)\b/.exec(location.search);
  if (!m) return;
  try {
    if (m[1] === '1') localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    /* sin almacenamiento */
  }
  const url = new URL(location.href);
  url.searchParams.delete('dev');
  history.replaceState(null, '', url.pathname + (url.search || '') + url.hash);
}

export function devToolsEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
