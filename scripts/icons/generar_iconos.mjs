/**
 * Genera los íconos de la app a partir de la marca vectorial
 * (public/brand/knowmadic-marca.svg), dibujándolos con Chromium para que los
 * bordes salgan nítidos en cada tamaño.
 *
 * Uso: node scripts/icons/generar_iconos.mjs   (requiere Playwright instalado)
 */
import { chromium } from 'playwright';
import { copyFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const mark = readFileSync(resolve(root, 'public/brand/knowmadic-marca.svg'), 'utf8');
const out = (name) => resolve(root, 'public/icons', name);

// size: lado en píxeles; scale: alto de la marca respecto del ícono;
// radius: esquinas redondeadas (0: fondo a sangre, para íconos enmascarables o de iOS).
const ICONS = [
  { file: 'icon-512.png', size: 512, scale: 0.7, radius: 0.22, transparent: true },
  { file: 'icon-192.png', size: 192, scale: 0.7, radius: 0.22, transparent: true },
  // Enmascarable: el sistema recorta hasta un círculo del 80 %; la marca queda dentro.
  { file: 'icon-maskable-512.png', size: 512, scale: 0.56, radius: 0, transparent: false },
  // iOS redondea por su cuenta y no admite transparencia.
  { file: 'apple-touch-icon.png', size: 180, scale: 0.68, radius: 0, transparent: false },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const icon of ICONS) {
  await page.setViewportSize({ width: icon.size, height: icon.size });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">
    <div style="width:${icon.size}px;height:${icon.size}px;display:grid;place-items:center;background:#fff;border-radius:${icon.radius * 100}%">
      <div style="height:${icon.scale * 100}%;aspect-ratio:492/590">${mark.replace('<svg ', '<svg width="100%" height="100%" ')}</div>
    </div></body></html>`);
  await page.screenshot({ path: out(icon.file), omitBackground: icon.transparent });
  console.log('✓', icon.file);
}
await browser.close();
copyFileSync(resolve(root, 'public/brand/knowmadic-marca.svg'), out('icon.svg'));
console.log('✓ icon.svg');
