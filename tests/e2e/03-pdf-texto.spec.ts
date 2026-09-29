import { expect, test } from '@playwright/test';
import { active, importAndOpen, importFile, isMobile, readDb, tapAt, toFocus, waitBookReady } from './helpers';

test.describe('PDF con texto seleccionable', () => {
  test('se detecta como PDF con texto y avisa el orden dudoso de la página a dos columnas', async ({ page }) => {
    await importFile(page, 'texto.pdf');
    const res = page.locator('[data-testid=import-result]');
    await expect(res).toContainText('PDF con texto · 7 páginas');
    await expect(res).toContainText('El orden de lectura podría no ser exacto en la página 5');
    const db = await readDb(page);
    const meta = db.docs[0];
    expect(meta.pdfKind).toBe('text');
    expect(meta.pages.map((p: any) => p.label)).toEqual(['i', 'ii', '1', '2', '3', '4', '5']);
    expect(meta.toc.map((t: any) => t.title)).toEqual([
      'Capítulo 1. El rollo y el códice',
      'Capítulo 2. La página impresa',
      'Capítulo 3. Leer en pantalla',
      'Capítulo 4. El arte de concentrarse',
    ]);
  });

  test('modo libro: páginas originales con su numeración, una o dos por pantalla', async ({ page }) => {
    await importAndOpen(page, 'texto.pdf');
    await waitBookReady(page);
    const mobile = isMobile(page);
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(mobile ? 'Pág. i de 7' : 'Pág. i–ii de 7');
    await expect(page.locator('.pdf-page.is-ready')).toHaveCount(mobile ? 1 : 2);
    await expect(page.locator('.pdf-folio').first()).toHaveText('i');
    // La página se dibuja de verdad (no está en blanco) y conserva la proporción A5.
    const info = await page.locator('.pdf-page canvas').first().evaluate((c: HTMLCanvasElement) => {
      const ctx = c.getContext('2d')!;
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let dark = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i]! < 100) dark++;
      return { dark, ratio: c.width / c.height };
    });
    expect(info.dark).toBeGreaterThan(500);
    expect(info.ratio).toBeCloseTo(148 / 210, 1);

    await tapAt(page, 0.92, 0.5);
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(mobile ? 'Pág. ii de 7' : 'Pág. 1–2 de 7');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(mobile ? 'Pág. 1 de 7' : 'Pág. 3–4 de 7');

    // Ir a una página por su número impreso.
    await page.getByRole('button', { name: 'Ir a página o sección' }).click();
    await page.locator('#goto-page').fill('ii');
    await page.getByRole('button', { name: 'Ir', exact: true }).click();
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(mobile ? 'Pág. ii de 7' : 'Pág. i–ii de 7');
  });

  test('modo renglón: texto limpio, sin encabezados repetidos, con palabras cortadas reconstruidas', async ({ page }) => {
    await importAndOpen(page, 'texto.pdf');
    await waitBookReady(page);
    await toFocus(page);
    const text = await page.locator('.focus-track').innerText();
    // Encabezados y números de página repetidos quedan fuera del flujo de lectura.
    expect(text.match(/Breve historia de la lectura/g)?.length).toBe(1);
    const lines = text.split('\n').map((l) => l.trim());
    expect(lines.filter((l) => /^\d+$/.test(l))).toEqual([]);
    // Guiones de corte de renglón reconstruidos.
    expect(text).toContain('la posición se expresa con una barra');
    expect(text).not.toMatch(/ex- ?presa/);
    await expect(page.locator('.focus-track h1', { hasText: 'Capítulo 1. El rollo y el códice' })).toHaveCount(1);
    // El índice del PDF no se funde en un solo párrafo.
    await expect(page.locator('.focus-track p', { hasText: /^Capítulo 2\. La página impresa$/ })).toHaveCount(1);
    // La figura del PDF aparece en su lugar.
    const img = page.locator('.focus-track figure img');
    await expect(img).toHaveCount(1);
    expect(await img.evaluate((i: HTMLImageElement) => i.naturalWidth > 100)).toBe(true);
  });

  test('modo renglón: al terminar una página continúa con la siguiente con un toque normal', async ({ page }) => {
    await importAndOpen(page, 'texto.pdf');
    await waitBookReady(page);
    await toFocus(page);
    // Página «3» empieza en mitad de un párrafo que viene de la página «2».
    await page.getByRole('button', { name: 'Ir a página o sección' }).click();
    await page.locator('#goto-page').fill('3');
    await page.getByRole('button', { name: 'Ir', exact: true }).click();
    await expect(page.locator('[data-testid=progress-text]')).toContainText('pág. 3');
    // Dos renglones atrás se está todavía en la página 2.
    await tapAt(page, 0.06, 0.5);
    await tapAt(page, 0.06, 0.5);
    await expect(page.locator('[data-testid=progress-text]')).toContainText('pág. 2');
    let prev = await active(page);
    let crossed = false;
    for (let i = 0; i < 3 && !crossed; i++) {
      await tapAt(page, 0.7, 0.5);
      const cur = await active(page);
      // Mismo párrafo, renglón siguiente: no hace falta ninguna acción distinta.
      expect(cur.b).toBe(prev.b);
      expect(cur.k).toBe(prev.k + 1);
      prev = cur;
      crossed = (await page.locator('[data-testid=progress-text]').innerText()).includes('pág. 3');
    }
    expect(crossed).toBe(true);
  });

  test('permite consultar la página original, con aviso de orden dudoso', async ({ page }) => {
    await importAndOpen(page, 'texto.pdf');
    await waitBookReady(page);
    await toFocus(page);
    await page.getByRole('button', { name: 'Ir a página o sección' }).click();
    await page.locator('#goto-page').fill('5');
    await page.getByRole('button', { name: 'Ir', exact: true }).click();
    const badge = page.locator('[data-testid=doubt-badge]');
    await expect(badge).toContainText('orden dudoso');
    // Con todos los controles del PDF a la vista, nada desborda el ancho de la pantalla.
    const fit = await page.evaluate(() => {
      const bar = document.querySelector('.toolbar')!.getBoundingClientRect();
      const track = document.querySelector('.focus-track')!.getBoundingClientRect();
      return { vw: innerWidth, sw: document.documentElement.scrollWidth, bar: bar.right, text: track.right };
    });
    expect(fit.sw).toBeLessThanOrEqual(fit.vw);
    expect(fit.bar).toBeLessThanOrEqual(fit.vw);
    expect(fit.text).toBeLessThanOrEqual(fit.vw);
    await badge.click();
    const sheet = page.locator('[data-testid=original-page]');
    await expect(sheet).toContainText('Página original 5');
    await expect(sheet).toContainText('orden de lectura extraído puede no coincidir');
    await expect(sheet.locator('canvas')).toBeVisible();
  });
});
