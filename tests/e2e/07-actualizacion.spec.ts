import { expect, test } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importAndOpen, progressText, waitBookReady } from './helpers';

// El servidor de pruebas sirve dist/ leyendo los archivos en cada pedido, así
// que cambiar dist/sw.js equivale a publicar una versión nueva.
const swFile = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist', 'sw.js');

test.describe('Actualización', () => {
  test('una versión nueva reemplaza a la anterior sin cerrar la app y sin perder el lugar', async ({ page }) => {
    // Alguien que ya usaba la app: la versión instalada atiende la página.
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(800);
    const before = await progressText(page);
    const url = page.url();

    const original = readFileSync(swFile, 'utf8');
    try {
      writeFileSync(swFile, `${original}\n// versión nueva ${Date.now()}\n`);
      await page.evaluate(() => ((window as any).__versionVieja = true));
      const reloaded = page.waitForEvent('load', { timeout: 30_000 });
      // Volver a la app (por ejemplo, retomar la pestaña en el iPhone) busca
      // la versión nueva; al activarse, la página se recarga sola.
      await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
      await reloaded;
      expect(await page.evaluate(() => (window as any).__versionVieja)).toBeUndefined();
      // Nada queda «en espera»: la versión nueva es la que atiende la página.
      const sw = await page.evaluate(async () => {
        const r = await navigator.serviceWorker.getRegistration();
        return { waiting: !!r?.waiting, controlled: !!navigator.serviceWorker.controller };
      });
      expect(sw).toEqual({ waiting: false, controlled: true });
    } finally {
      writeFileSync(swFile, original);
    }

    // Sigue en el mismo documento y ofrece continuar donde estaba.
    expect(page.url()).toBe(url);
    await page.click('[data-testid=resume-continue]');
    await waitBookReady(page);
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(before);
  });
});
