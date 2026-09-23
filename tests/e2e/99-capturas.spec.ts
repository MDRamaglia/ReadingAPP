/**
 * Capturas de las pantallas principales, para revisar el diseño. Se guardan en
 * tests/.artifacts/capturas/. No verifican comportamiento (eso lo hacen las
 * demás pruebas).
 */
import { expect, test } from '@playwright/test';
import { artifacts, importAndOpen, importFile, tapAt, toFocus, waitBookReady } from './helpers';

const shot = (name: string, project: string) => artifacts(`capturas/${project}-${name}.png`);
// Las hojas entran con una animación breve: se espera a que termine antes de capturar.
const settle = (page: import('@playwright/test').Page) => page.waitForTimeout(450);

test.describe('Capturas', () => {
  test('pantallas principales', async ({ page }, info) => {
    const p = info.project.name;
    await page.goto('/');
    await page.screenshot({ path: shot('01-biblioteca-vacia', p) });

    await importFile(page, 'ensayo.docx');
    await settle(page);
    await page.screenshot({ path: shot('02-importado-word', p) });
    await page.click('[data-testid=import-open]');
    await waitBookReady(page);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await page.screenshot({ path: shot('03-word-libro', p) });
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await page.screenshot({ path: shot('04-word-libro-tabla', p) });

    await toFocus(page);
    for (let i = 0; i < 6; i++) await tapAt(page, 0.7, 0.5);
    await page.waitForTimeout(500);
    await page.screenshot({ path: shot('05-renglon-claro', p) });
    await page.click('[data-testid=open-settings]');
    await page.getByRole('radio', { name: /Sepia/ }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: shot('06-ajustes', p) });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await page.screenshot({ path: shot('07-renglon-sepia', p) });
    await page.click('[data-testid=open-settings]');
    await page.getByRole('radio', { name: /Oscuro/ }).click();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await page.screenshot({ path: shot('08-renglon-oscuro', p) });
    await page.click('[data-testid=open-settings]');
    await page.getByRole('radio', { name: /Claro/ }).click();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Ir a página o sección' }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: shot('09-indice', p) });
    await page.keyboard.press('Escape');

    await importAndOpen(page, 'texto.pdf');
    await waitBookReady(page);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(700);
    await page.screenshot({ path: shot('10-pdf-libro', p) });
    await toFocus(page);
    await page.getByRole('button', { name: 'Ir a página o sección' }).click();
    await page.locator('#goto-page').fill('5');
    await page.getByRole('button', { name: 'Ir', exact: true }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: shot('11-pdf-renglon-orden-dudoso', p) });
    await page.click('[data-testid=doubt-badge]');
    await page.waitForTimeout(800);
    await page.screenshot({ path: shot('12-pagina-original', p) });
    await page.keyboard.press('Escape');

    await importFile(page, 'escaneado.pdf');
    await settle(page);
    await page.screenshot({ path: shot('13-escaneado-importado', p) });
    await page.click('[data-testid=ocr-start]');
    await expect(page.locator('[data-testid=ocr-progress]')).toBeVisible();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: shot('14-ocr-progreso', p) });
    await expect(page.locator('[data-testid=ocr-done]')).toBeVisible({ timeout: 240_000 });
    await settle(page);
    await page.screenshot({ path: shot('15-ocr-resultado', p) });
    await page.click('[data-testid=import-open]');
    await waitBookReady(page);
    await toFocus(page);
    await page.getByRole('button', { name: 'Ir a página o sección' }).click();
    await page.locator('#goto-page').fill('3');
    await page.getByRole('button', { name: 'Ir', exact: true }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: shot('16-ocr-pagina-fallida', p) });

    await page.goto('/');
    await page.screenshot({ path: shot('17-biblioteca', p) });
    await page.setInputFiles('[data-testid=file-input]', 'tests/fixtures/antiguo.doc');
    await expect(page.locator('[data-testid=import-error]')).toBeVisible();
    await settle(page);
    await page.screenshot({ path: shot('18-doc-antiguo', p) });
    await page.keyboard.press('Escape');
    await page.locator('[data-testid=continue-card]').click();
    await expect(page.locator('[data-testid=resume]')).toBeVisible();
    await settle(page);
    await page.screenshot({ path: shot('19-continuar', p) });
  });
});
