import { expect, test } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { levenshtein } from '../../src/lib/text';
import { artifacts, fixture, importFile, readDb, toFocus, waitBookReady } from './helpers';

const truth = JSON.parse(readFileSync(fixture('escaneado.json'), 'utf8')) as { pages: string[]; degraded: number[] };
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

test.describe('PDF escaneado', () => {
  test('detecta el escaneo, reconoce el texto en el dispositivo y avisa las páginas dudosas', async ({ page, baseURL }, testInfo) => {
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));

    await importFile(page, 'escaneado.pdf');
    const res = page.locator('[data-testid=import-result]');
    await expect(res).toContainText('PDF escaneado · 3 páginas');
    await expect(res).toContainText('sus páginas son imágenes sin texto seleccionable');
    await expect(res).toContainText('El reconocimiento se hace en este dispositivo');

    // Sin OCR, el modo libro funciona y el modo renglón pide reconocer el texto.
    await page.click('[data-testid=import-open]');
    await waitBookReady(page);
    await expect(page.locator('.pdf-page.is-ready').first()).toBeVisible();
    await page.click('[data-testid=mode-focus]');
    const sheet = page.locator('[data-testid=ocr-sheet]');
    await expect(sheet).toBeVisible();
    await expect(page.locator('[data-testid=focus-stage]')).toHaveCount(0);

    const t0 = Date.now();
    await sheet.locator('[data-testid=ocr-start]').click();
    await expect(sheet.locator('[data-testid=ocr-progress]')).toBeVisible();
    await expect(sheet.locator('[data-testid=ocr-progress] [role=progressbar]')).toBeVisible();
    await expect(sheet.locator('[data-testid=ocr-done]')).toBeVisible({ timeout: 240_000 });
    const seconds = (Date.now() - t0) / 1000;
    await expect(sheet.locator('[data-testid=ocr-done]')).toContainText('Sin texto confiable en: página 3');
    await page.keyboard.press('Escape');

    // Precisión real: se compara lo reconocido con el texto original de cada página.
    const db = await readDb(page);
    const blocks = db.content[0].blocks as Array<{ page: number; t: string; html: string }>;
    const strip = (h: string) =>
      h.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    const report = truth.pages.map((expected, i) => {
      const got = norm(blocks.filter((b) => b.page === i && b.t !== 'notice').map((b) => strip(b.html)).join(' '));
      const cer = levenshtein(got, norm(expected)) / norm(expected).length;
      const ocr = db.docs[0].pages[i].ocr;
      return { page: i + 1, degraded: truth.degraded.includes(i), status: ocr.status, confidence: ocr.confidence, cer: Math.round(cer * 1000) / 10, sample: got.slice(0, 120) };
    });
    writeFileSync(artifacts(`ocr-${testInfo.project.name}.json`), JSON.stringify({ seconds, report }, null, 2));
    console.log(`OCR (${testInfo.project.name}) ${seconds.toFixed(1)} s`, JSON.stringify(report, null, 1));
    for (const r of report.filter((r) => !r.degraded)) {
      expect(r.status).toBe('ok');
      expect(r.cer).toBeLessThan(1);
    }
    for (const r of report.filter((r) => r.degraded)) expect(['low', 'failed']).toContain(r.status);

    // Títulos y párrafos reconstruidos.
    const p1 = blocks.filter((b) => b.page === 0);
    expect(p1[0]!.t).toBe('h2');
    expect(strip(p1[0]!.html)).toBe('Capítulo primero');
    expect(p1.filter((b) => b.t === 'p').length).toBe(3);

    // Ahora el modo renglón funciona con el texto reconocido.
    await toFocus(page);
    await expect(page.locator('.focus-track')).toContainText('Durante siglos, leer fue una tarea que exigía las dos manos.');
    // En la página que no se pudo reconocer, hay aviso en el texto y acceso a la original.
    await page.getByRole('button', { name: 'Ir a página o sección' }).click();
    await page.locator('#goto-page').fill('3');
    await page.getByRole('button', { name: 'Ir', exact: true }).click();
    await expect(page.locator('[data-testid=doubt-badge]')).toContainText('OCR dudoso');
    await expect(page.locator('.focus-track .b-notice', { hasText: 'Página 3: no se pudo reconocer el texto' })).toHaveCount(1);

    // Privacidad: ninguna petición salió del propio origen de la app.
    const foreign = requests.filter((u) => !u.startsWith(baseURL!) && !u.startsWith('blob:') && !u.startsWith('data:'));
    expect(foreign).toEqual([]);
  });
});
