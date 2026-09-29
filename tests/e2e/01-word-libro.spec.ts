import { expect, test } from '@playwright/test';
import { importAndOpen, importFile, isMobile, progressText, swipe, tapAt, waitBookReady } from './helpers';

test.describe('Word (.docx) en modo libro', () => {
  test('carga el documento real y conserva su estructura', async ({ page }) => {
    await importFile(page, 'ensayo.docx');
    await expect(page.locator('[data-testid=import-result]')).toContainText('Breve historia de la lectura');
    await expect(page.locator('[data-testid=import-result]')).toContainText('Word');
    await page.click('[data-testid=import-open]');
    await waitBookReady(page);

    const flow = page.locator('.flow');
    // Títulos, capítulos, listas, tabla, cita, imagen y salto de página del original.
    await expect(flow.locator('h1', { hasText: 'Capítulo 1. El rollo y el códice' })).toHaveCount(1);
    await expect(flow.locator('h2', { hasText: 'Recomendaciones tipográficas' })).toHaveCount(1);
    await expect(flow.locator('.b-li')).toHaveCount(7);
    await expect(flow.locator('.b-li[data-mk="1."]')).toContainText('Cargar el documento');
    await expect(flow.locator('table td', { hasText: 'Códice' })).toHaveCount(1);
    await expect(flow.locator('blockquote')).toContainText('Sus ojos recorrían la página');
    const img = flow.locator('figure img');
    await expect(img).toHaveCount(1);
    expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    await expect(flow.locator('strong', { hasText: 'negritas' })).toHaveCount(1);
    await expect(flow.locator('em', { hasText: 'cursivas' })).toHaveCount(1);

    // El salto de página de Word y los capítulos empiezan en página nueva.
    const starts = await page.evaluate(() => {
      const flowEl = document.querySelector('.flow')!;
      const top = flowEl.getBoundingClientRect().top;
      return Array.from(flowEl.querySelectorAll('.brk')).map((el) => Math.round(el.getBoundingClientRect().top - top));
    });
    expect(starts.length).toBeGreaterThanOrEqual(4);
    for (const t of starts) expect(t).toBeLessThan(3);
  });

  test('pasa páginas con toques, deslizamiento y teclado', async ({ page }) => {
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    const mobile = isMobile(page);
    const txt = await progressText(page);
    const total = Number(/de (\d+)/.exec(txt)![1]);
    expect(total).toBeGreaterThan(mobile ? 8 : 3);
    // Safari/WebKit solo crea columnas si el ancho de columna es explícito
    // (con «column-count: 1» y ancho automático todo cae en una sola página).
    expect(await page.locator('.flow').evaluate((f) => getComputedStyle(f).columnWidth)).not.toBe('auto');
    // Una página en el celular; dos enfrentadas en la computadora.
    expect(txt).toMatch(mobile ? /^Pág\. 1 de \d+$/ : /^Pág\. 1–2 de \d+$/);
    await expect(page.locator('.folio')).toHaveCount(mobile ? 1 : 2);
    const step = mobile ? 1 : 2;

    await tapAt(page, 0.9, 0.5);
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(new RegExp(`^Pág\\. ${1 + step}`));
    await tapAt(page, 0.08, 0.5);
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(/^Pág\. 1\b/);

    await swipe(page, -160, 0);
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(new RegExp(`^Pág\\. ${1 + step}`));
    await swipe(page, 160, 0);
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(/^Pág\. 1\b/);

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(new RegExp(`^Pág\\. ${1 + 2 * step}`));
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(new RegExp(`^Pág\\. ${1 + step}`));

    // Indicador de progreso discreto: barra fina que avanza.
    const w = await page.locator('.progress-line-fill').evaluate((e) => parseFloat(getComputedStyle(e).width));
    expect(w).toBeGreaterThan(0);
  });

  test('va a una página o sección', async ({ page }) => {
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    await page.getByRole('button', { name: 'Ir a página o sección' }).click();
    const sheet = page.locator('[data-testid=toc-sheet]');
    await expect(sheet).toBeVisible();
    await sheet.getByRole('button', { name: /Capítulo 3\. Leer en pantalla/ }).click();
    await expect(sheet).toBeHidden();
    // El capítulo 3 queda a la vista, al comienzo de su página.
    const visible = await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll('.flow h1')).find((e) => e.textContent?.includes('Capítulo 3'))!;
      const r = h.getBoundingClientRect();
      const v = document.querySelector('.flow-view')!.getBoundingClientRect();
      return r.left >= v.left - 1 && r.right <= v.right + 1;
    });
    expect(visible).toBe(true);

    await page.getByRole('button', { name: 'Ir a página o sección' }).click();
    await sheet.locator('#goto-page').fill('3');
    await sheet.getByRole('button', { name: 'Ir', exact: true }).click();
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(isMobile(page) ? /^Pág\. 3 de/ : /^Pág\. 3–4 de/);
  });
});
