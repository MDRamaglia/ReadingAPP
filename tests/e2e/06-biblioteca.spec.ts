import { expect, test } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { artifacts, importAndOpen, importFile, readDb, tapAt, toFocus, waitBookReady } from './helpers';

test.describe('Biblioteca', () => {
  test('un .doc antiguo se rechaza con instrucciones claras de conversión', async ({ page }) => {
    await importFile(page, 'antiguo.doc');
    const err = page.locator('[data-testid=import-error]');
    await expect(err).toContainText('es un documento de Word antiguo (.doc)');
    await expect(err).toContainText('Guardar como');
    await expect(err).toContainText('.docx');
    const db = await readDb(page);
    expect(db.docs).toHaveLength(0);
  });

  test('un archivo que no es Word ni PDF se rechaza', async ({ page }) => {
    const p = artifacts('nota.txt');
    writeFileSync(p, 'Esto es un texto plano.');
    await page.goto('/');
    await page.setInputFiles('[data-testid=file-input]', p);
    await expect(page.locator('[data-testid=import-error]')).toContainText('no es un documento de Word (.docx) ni un PDF');
  });

  test('muestra el avance y elimina el documento junto con su progreso', async ({ page }) => {
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    await toFocus(page);
    for (let i = 0; i < 25; i++) await tapAt(page, 0.7, 0.5);
    await page.getByRole('button', { name: 'Biblioteca' }).click();
    const item = page.locator('[data-testid=doc-item]');
    await expect(item).toHaveCount(1);
    await expect(item).toContainText('Breve historia de la lectura');
    await expect(item.locator('.doc-pct')).toHaveText(/^\d+ %$/);
    await expect(page.locator('[data-testid=continue-card]')).toBeVisible();

    let db = await readDb(page);
    expect(db.progress).toHaveLength(1);
    expect(db.assets).toBe(1);

    await item.locator('[data-testid=doc-delete]').click();
    await expect(page.locator('[data-testid=delete-sheet]')).toContainText('tu progreso de lectura');
    await page.click('[data-testid=confirm-delete]');
    await expect(item).toHaveCount(0);
    await expect(page.locator('.empty')).toContainText('Tu biblioteca está vacía');
    db = await readDb(page);
    expect([db.docs.length, db.content.length, db.progress.length, db.assets]).toEqual([0, 0, 0, 0]);
    const keys = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('renglon.progress')));
    expect(keys).toEqual([]);
  });
});
