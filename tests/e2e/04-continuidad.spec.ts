import { chromium, expect, test } from '@playwright/test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { active, fixture, importAndOpen, isMobile, tapAt, toBook, toFocus, waitBookReady } from './helpers';

test.describe('Continuidad', () => {
  test('Word: cambiar de modo lleva al mismo fragmento', async ({ page }) => {
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);
    const bookPos = await page.evaluate(() => (window as any).__flow.position());
    expect(bookPos.b).toBeGreaterThan(0);

    // Libro → renglón: el renglón activo es el primero de la página que se veía.
    await toFocus(page);
    let a = await active(page);
    expect(a.pos).toMatchObject({ b: bookPos.b, o: bookPos.o });
    expect(a.o).toBeLessThanOrEqual(bookPos.o);

    // Renglón → libro: la página mostrada contiene el renglón en que se estaba.
    for (let i = 0; i < 12; i++) await tapAt(page, 0.7, 0.5);
    await page.waitForTimeout(300);
    a = await active(page);
    const where = a.pos;
    await toBook(page);
    const shown = await page.evaluate((pos) => {
      const f = (window as any).__flow;
      const r = (window as any).__reader.report;
      return { pageOfPos: f.pageOf(pos), page: r.page, perView: r.perView };
    }, where);
    expect(shown.pageOfPos).toBeGreaterThanOrEqual(shown.page);
    expect(shown.pageOfPos).toBeLessThan(shown.page + shown.perView);

    // Y de vuelta, sin haber pasado página: exactamente el mismo renglón.
    await toFocus(page);
    const back = await active(page);
    expect({ b: back.b, k: back.k }).toEqual({ b: a.b, k: a.k });
  });

  test('PDF: cambiar de modo lleva a la misma página y, si no se movió, al mismo renglón', async ({ page }) => {
    await importAndOpen(page, 'texto.pdf');
    await waitBookReady(page);
    await toFocus(page);
    await page.getByRole('button', { name: 'Ir a página o sección' }).click();
    await page.locator('#goto-page').fill('3');
    await page.getByRole('button', { name: 'Ir', exact: true }).click();
    for (let i = 0; i < 3; i++) await tapAt(page, 0.7, 0.5);
    await page.waitForTimeout(300);
    const a = await active(page);
    const label = (await page.locator('[data-testid=progress-text]').innerText()).match(/pág\. (\S+)/)![1];
    await toBook(page);
    await expect(page.locator('[data-testid=progress-text]')).toContainText(isMobile(page) ? `Pág. ${label} de 7` : `${label}`);
    await toFocus(page);
    const b = await active(page);
    expect({ b: b.b, k: b.k }).toEqual({ b: a.b, k: a.k });

    // Si en el libro se pasa de página, el renglón es el primero de la página nueva.
    await toBook(page);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    const txt = await page.locator('[data-testid=progress-text]').innerText();
    const first = txt.match(/Pág\. (\S+?)(–|\s)/)![1];
    await toFocus(page);
    await expect(page.locator('[data-testid=progress-text]')).toContainText(`pág. ${first}`);
  });

  test('guarda el punto de lectura y lo ofrece al volver a abrir la app', async ({}, testInfo) => {
    const dir = mkdtempSync(join(tmpdir(), 'renglon-'));
    const { viewport, userAgent, deviceScaleFactor, isMobile: mobile, hasTouch, locale } = testInfo.project.use;
    const opts = { viewport, userAgent, deviceScaleFactor, isMobile: mobile, hasTouch, locale, baseURL: 'http://127.0.0.1:4173' };
    try {
      let ctx = await chromium.launchPersistentContext(dir, opts);
      let page = ctx.pages()[0] ?? (await ctx.newPage());
      await page.goto('/');
      await page.setInputFiles('[data-testid=file-input]', fixture('ensayo.docx'));
      await page.click('[data-testid=import-open]');
      await waitBookReady(page);
      await toFocus(page);
      for (let i = 0; i < 17; i++) await tapAt(page, 0.7, 0.5);
      await page.waitForTimeout(300);
      const before = await active(page);
      const snippet = await page.evaluate(() => {
        const f = (window as any).__focus.activeLine();
        const el = document.querySelector(`[data-b="${f.b}"]`)!;
        return (el.textContent ?? '').slice(f.pos.o, f.pos.o + 20);
      });
      // Se cierra la app de golpe (se cierra el navegador entero).
      await ctx.close();

      ctx = await chromium.launchPersistentContext(dir, opts);
      page = ctx.pages()[0] ?? (await ctx.newPage());
      await page.goto('/');
      const card = page.locator('[data-testid=continue-card]');
      await expect(card).toContainText('Seguir leyendo');
      await expect(card).toContainText(snippet.split(' ')[0]!);
      await card.click();
      const resume = page.locator('[data-testid=resume]');
      await expect(resume).toContainText('Continuar leyendo');
      await expect(resume).toContainText('modo renglón');
      await page.click('[data-testid=resume-continue]');
      await expect(page.locator('[data-testid=focus-stage]')).toBeVisible();
      await page.waitForFunction(() => !!(window as any).__focus && (window as any).__focus.activeLine().count > 0);
      await page.waitForTimeout(400);
      const after = await page.evaluate(() => (window as any).__focus.activeLine());
      expect({ b: after.b, k: after.k, pos: after.pos }).toEqual({ b: before.b, k: before.k, pos: before.pos });
      await ctx.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('también se puede empezar desde el principio', async ({ page }) => {
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(800);
    await page.reload();
    await expect(page.locator('[data-testid=resume]')).toBeVisible();
    await page.getByRole('button', { name: 'Empezar desde el principio' }).click();
    await waitBookReady(page);
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(/^Pág\. 1\b/);
  });

  test('después de la primera visita funciona sin conexión', async ({ page, context }) => {
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await page.evaluate(() => navigator.serviceWorker.ready);
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    await context.setOffline(true);
    await page.goto('/');
    await expect(page.locator('[data-testid=doc-item]')).toHaveCount(1);
    await page.locator('[data-testid=doc-item] .doc-open').click();
    await waitBookReady(page);
    await toFocus(page);
    await tapAt(page, 0.7, 0.5);
    expect((await active(page)).k + (await active(page)).b).toBeGreaterThan(0);
    await context.setOffline(false);
  });
});
