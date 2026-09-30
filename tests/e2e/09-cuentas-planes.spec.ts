import { expect, test } from '@playwright/test';
import { importAndOpen, setPlan, signIn, signOut, signUp, waitBookReady } from './helpers';

test.describe('Cuentas y planes', () => {
  test('registro, cierre e inicio de sesión, recuperación y perfil', async ({ page }) => {
    await page.goto('/#/cuenta');
    await expect(page.locator('[data-testid=account-chip]')).toContainText('Ingresar');
    await expect(page.locator('[data-testid=local-note]')).toContainText('Prueba local');

    const u = await signUp(page, 'lectora');
    await expect(page.locator('.page-title')).toHaveText('lectora');
    await expect(page.locator('[data-testid=profile-plan]')).toHaveText('Gratuito');
    await expect(page.locator('[data-testid=account-chip]')).toContainText('lectora');

    // Datos repetidos o inválidos se explican.
    await signOut(page);
    await page.goto('/#/cuenta/registro');
    await page.fill('[name=username]', 'otra');
    await page.fill('[name=email]', u.email);
    await page.fill('[name=password]', 'secreto123');
    await page.fill('[name=confirm]', 'secreto123');
    await page.click('[data-testid=signup-submit]');
    await expect(page.locator('[data-testid=form-error]')).toContainText('Ya hay una cuenta con ese correo');

    await page.goto('/#/cuenta/ingresar');
    await page.fill('[name=email]', u.email);
    await page.fill('[name=password]', 'equivocada');
    await page.click('[data-testid=signin-submit]');
    await expect(page.locator('[data-testid=form-error]')).toContainText('no coinciden');
    await signIn(page, u.email);
    await expect(page.locator('.page-title')).toHaveText('lectora');

    // La recuperación por correo necesita el servidor: se informa, no se simula.
    await page.goto('/#/cuenta/recuperar');
    await page.fill('[name=email]', u.email);
    await page.getByRole('button', { name: 'Enviar enlace' }).click();
    await expect(page.locator('[data-testid=recover-result]')).toContainText('servidor de cuentas');

    // Después de iniciar sesión se vuelve a donde se estaba.
    await signOut(page);
    await page.goto('/#/resenas');
    await page.click('[data-testid=write-review]');
    await expect(page).toHaveURL(/cuenta\/ingresar\?volver=/);
    await page.fill('[name=email]', u.email);
    await page.fill('[name=password]', 'secreto123');
    await page.click('[data-testid=signin-submit]');
    await expect(page).toHaveURL(/#\/resenas\/nueva$/);
  });

  test('la página de planes compara gratuito y premium; la contratación queda para más adelante', async ({ page }) => {
    await page.goto('/#/planes');
    const table = page.locator('[data-testid=plans-table]');
    const row = (label: string) => table.locator('tr', { hasText: label });
    await expect(row('Modo libro, con navegación horizontal y vertical')).toContainText('Incluido');
    await expect(row('Modo renglón')).toContainText('Incluido');
    await expect(row('Biblioteca personal')).toContainText('Hasta 5 archivos');
    await expect(row('Biblioteca personal')).toContainText('Sin límite de cantidad impuesto por el plan');
    await expect(row('Publicar reseñas y dar likes')).toContainText('Incluido, con cuenta');
    await expect(row('Animación de hoja de libro')).toContainText('Acceso premium');
    await expect(row('Reading Club')).toContainText('Incluidos');
    await expect(page.locator('[data-testid=price-premium]')).toHaveText('Precio a definir');
    await page.click('[data-testid=choose-premium]');
    await expect(page.locator('[data-testid=plans-msg]')).toContainText('disponible próximamente');

    // Gestión del plan en el perfil.
    await signUp(page);
    await setPlan(page, 'premium');
    await expect(page.locator('[data-testid=profile-plan]')).toHaveText('Premium');
    await page.click('[data-testid=cancel-plan]');
    await expect(page.locator('[data-testid=plan-msg]')).toContainText('próximamente');
    await page.goto('/#/planes');
    await expect(page.locator('[data-testid=plan-premium]')).toContainText('Tu plan actual');
  });

  test('las preferencias de lectura siguen a la cuenta', async ({ page }) => {
    const u = await signUp(page);
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    await page.click('[data-testid=open-settings]');
    await page.locator('[data-testid=dir-vertical]').click();
    await page.keyboard.press('Escape');

    await signOut(page);
    await page.goto('/?dev=1#/');
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    await page.click('[data-testid=open-settings]');
    await expect(page.locator('[data-testid=dir-horizontal]')).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');

    await signIn(page, u.email);
    await page.goto('/#/');
    await page.locator('[data-testid=doc-item] .doc-open').first().click();
    await waitBookReady(page);
    await page.click('[data-testid=open-settings]');
    await expect(page.locator('[data-testid=dir-vertical]')).toHaveAttribute('aria-checked', 'true');
  });
});
