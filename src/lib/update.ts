/**
 * Actualización de la app ya abierta o instalada (service worker).
 *
 * La versión nueva se activa apenas termina de descargarse (`skipWaiting` y
 * `clientsClaim` en vite.config.ts) y la página se recarga para usarla. El
 * lector no pierde nada: el documento abierto está en la dirección (#/leer/…)
 * y el punto de lectura se guarda en cada movimiento. Si hay un
 * reconocimiento de texto en curso, la recarga espera a que termine.
 */
import { registerSW } from 'virtual:pwa-register';
import { ocr } from '../import/ocr';

/** Cada cuánto se busca una versión nueva con la app abierta. */
const CHECK_EVERY_MS = 30 * 60 * 1000;

function reloadWhenIdle(): void {
  if (!ocr.isRunning()) {
    location.reload();
    return;
  }
  let off: (() => void) | undefined;
  off = ocr.subscribe(() => {
    if (off && !ocr.isRunning()) {
      off();
      off = undefined;
      location.reload();
    }
  });
}

export function startUpdates(): void {
  registerSW({
    immediate: true,
    onNeedReload: reloadWhenIdle,
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      // Safari y Chrome en el iPhone suelen retomar una pestaña sin volver a
      // pedirla al servidor: se busca una versión nueva cada vez que la app
      // vuelve a verse y, con la app abierta, cada media hora.
      const check = () => {
        if (document.visibilityState === 'visible' && navigator.onLine) registration.update().catch(() => undefined);
      };
      document.addEventListener('visibilitychange', check);
      window.setInterval(check, CHECK_EVERY_MS);
    },
  });
}
