import { expect, test, type Page } from '@playwright/test';
import { fixture, setPlan, signIn, signOut, signUp } from './helpers';

const count = (page: Page) => page.locator('[data-testid=library-count]');

/** Carga un archivo desde la biblioteca y espera el resultado (listo o error). */
async function add(page: Page, name = 'ensayo.docx') {
  await page.setInputFiles('[data-testid=file-input]', fixture(name));
  const done = page.locator('[data-testid=import-result], [data-testid=import-error]');
  await expect(done).toBeVisible({ timeout: 60_000 });
  const ok = await page.locator('[data-testid=import-result]').isVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-testid=import-sheet]')).toBeHidden();
  return ok;
}

async function removeFirst(page: Page) {
  await page.locator('[data-testid=doc-delete]').first().click();
  await page.click('[data-testid=confirm-delete]');
}

test.describe('Biblioteca: límite del plan gratuito', () => {
  test('cuenta los archivos, frena el sexto con una explicación y libera lugar al eliminar', async ({ page }) => {
    await page.goto('/#/');
    await expect(count(page)).toHaveText('0 de 5 archivos');
    for (let i = 1; i <= 5; i++) {
      expect(await add(page, i % 2 ? 'ensayo.docx' : 'texto.pdf')).toBe(true);
      await expect(count(page)).toHaveText(`${i} de 5 archivos`);
    }
    await expect(page.locator('[data-testid=doc-item]')).toHaveCount(5);
    await expect(page.locator('[data-testid=limit-note]')).toContainText('5 archivos del plan gratuito');

    // El sexto: se explica el límite y se ofrece el plan premium.
    await page.setInputFiles('[data-testid=file-input]', fixture('ensayo.docx'));
    const err = page.locator('[data-testid=import-error]');
    await expect(err).toContainText('Alcanzaste el límite de 5 archivos del plan gratuito');
    await expect(err).toContainText('Cada documento cuenta como un archivo');
    await page.click('[data-testid=limit-plans]');
    await expect(page).toHaveURL(/#\/planes$/);

    // Eliminar uno libera un lugar.
    await page.goto('/#/');
    await removeFirst(page);
    await expect(count(page)).toHaveText('4 de 5 archivos');
    expect(await add(page)).toBe(true);
    await expect(count(page)).toHaveText('5 de 5 archivos');
  });

  test('premium no tiene límite de cantidad; al volver a gratuito se conserva el acceso pero no se puede cargar', async ({ page }) => {
    await signUp(page);
    await setPlan(page, 'premium');
    await page.goto('/#/');
    for (let i = 1; i <= 6; i++) expect(await add(page)).toBe(true);
    await expect(count(page)).toHaveText('6 archivos');

    await setPlan(page, 'free');
    await expect(count(page)).toHaveText('6 de 5 archivos');
    await expect(page.locator('[data-testid=limit-note]')).toContainText('podés seguir leyéndolos');
    // Los documentos siguen abriéndose.
    await page.locator('[data-testid=doc-item] .doc-open').first().click();
    await expect(page.locator('[data-testid=progress-text]')).toContainText('Pág.');
    await page.goto('/#/');
    // Pero no se pueden cargar nuevos hasta volver a tener lugar.
    expect(await add(page)).toBe(false);
    await removeFirst(page);
    await expect(count(page)).toHaveText('5 de 5 archivos');
    expect(await add(page)).toBe(false);
    await removeFirst(page);
    await expect(count(page)).toHaveText('4 de 5 archivos');
    expect(await add(page)).toBe(true);
  });

  test('los documentos cargados sin cuenta se pueden sumar a la biblioteca de la cuenta', async ({ page }) => {
    await page.goto('/?dev=1#/');
    expect(await add(page)).toBe(true);
    await expect(count(page)).toHaveText('1 de 5 archivos');
    await signUp(page);
    await page.goto('/#/');
    await expect(count(page)).toHaveText('0 de 5 archivos');
    await expect(page.locator('[data-testid=claim-docs]')).toContainText('1 documento cargado sin cuenta');
    await page.click('[data-testid=claim-docs-btn]');
    await expect(count(page)).toHaveText('1 de 5 archivos');
    await expect(page.locator('[data-testid=claim-docs]')).toHaveCount(0);
  });

  test('sumar documentos cargados sin cuenta respeta el límite del plan', async ({ page }) => {
    const u = await signUp(page);
    await page.goto('/#/');
    for (let i = 0; i < 4; i++) expect(await add(page)).toBe(true);
    await expect(count(page)).toHaveText('4 de 5 archivos');

    // Sin sesión se cargan dos más en el dispositivo.
    await signOut(page);
    await page.goto('/#/');
    await expect(count(page)).toHaveText('0 de 5 archivos');
    expect(await add(page)).toBe(true);
    expect(await add(page, 'texto.pdf')).toBe(true);

    // Al volver, solo entra uno (el más reciente); el otro queda en el dispositivo.
    await signIn(page, u.email);
    await page.goto('/#/');
    const claim = page.locator('[data-testid=claim-docs]');
    await expect(claim).toContainText('entran 1 más');
    await page.click('[data-testid=claim-docs-btn]');
    await expect(count(page)).toHaveText('5 de 5 archivos');
    await expect(page.locator('[data-testid=doc-item]').first()).toContainText('Breve historia de la lectura');
    await expect(claim).toContainText('necesitás lugar');
    await expect(page.locator('[data-testid=claim-docs-btn]')).toHaveCount(0);
  });
});
