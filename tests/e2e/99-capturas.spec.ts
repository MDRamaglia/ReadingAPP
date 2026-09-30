/**
 * Capturas de las pantallas principales, para revisar el diseño. Se guardan en
 * tests/.artifacts/capturas/. No verifican comportamiento (eso lo hacen las
 * demás pruebas).
 */
import { expect, test } from '@playwright/test';
import { artifacts, asPremium, importAndOpen, importFile, setPlan, signOut, signUp, tapAt, toFocus, waitBookReady } from './helpers';

const shot = (name: string, project: string) => artifacts(`capturas/${project}-${name}.png`);
// Las hojas entran con una animación breve: se espera a que termine antes de capturar.
const settle = (page: import('@playwright/test').Page) => page.waitForTimeout(450);

test.describe('Capturas', () => {
  test('pantallas principales', async ({ page }, info) => {
    const p = info.project.name;
    await page.goto('/');
    await page.screenshot({ path: shot('01-biblioteca-vacia', p) });
    // La animación de hoja es premium: el recorrido se hace con una cuenta premium de prueba.
    await asPremium(page);
    await page.goto('/');

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

    // Dirección para pasar página y animación de hoja, y una hoja a mitad de vuelta.
    await page.click('[data-testid=open-settings]');
    const curl = page.locator('[data-testid=page-curl]');
    await curl.check();
    await curl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: shot('20-ajustes-libro', p) });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(40);
    await page.evaluate(() => {
      const c = (window as any).__flow.turns.curl;
      c.stop();
      c.set(0.42);
    });
    await page.waitForTimeout(150);
    await page.screenshot({ path: shot('21-hoja-doblandose', p) });
    await page.click('[data-testid=open-settings]');
    await page.locator('[data-testid=page-curl]').uncheck();
    await page.keyboard.press('Escape');

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

  test('cuentas, reseñas, Reading Club y planes', async ({ page }, info) => {
    const p = info.project.name;
    await page.goto('/#/cuenta/registro');
    await page.screenshot({ path: shot('30-registro', p) });

    // Dos reseñas de una persona y el like de otra.
    await signUp(page, `ana${p}`);
    const reviews = [
      { book: 'Cien años de soledad', author: 'Gabriel García Márquez', category: 'Novela', title: 'Macondo como espejo', body: 'Una saga familiar que se lee como la historia de un continente. La prosa es tan precisa como desbordante.' },
      { book: 'El túnel', author: 'Ernesto Sábato', category: 'Novela', title: 'Obsesión en primera persona', body: 'Castel lo cuenta todo desde el principio.', spoiler: true },
    ];
    for (const r of reviews) {
      await page.goto('/#/resenas/nueva');
      await page.fill('[name=bookTitle]', r.book);
      await page.fill('[name=bookAuthor]', r.author);
      await page.selectOption('[name=category]', r.category);
      await page.fill('[name=title]', r.title);
      await page.fill('[name=body]', r.body);
      if (r.spoiler) await page.check('[name=spoiler]');
      if (r === reviews[0]) await page.screenshot({ path: shot('31-resena-nueva', p) });
      await page.click('[data-testid=review-submit]');
      await expect(page.locator('[data-testid=review-full]')).toBeVisible();
    }
    await signOut(page);
    await signUp(page, `beto${p}`);
    await page.goto('/#/resenas');
    const like = page.locator('[data-testid=review-card]', { hasText: 'Macondo' }).locator('[data-testid=like]');
    await like.click();
    await expect(like).toHaveAttribute('aria-pressed', 'true');
    await page.screenshot({ path: shot('32-resenas', p) });

    // Plan gratuito: la animación y el Reading Club muestran cómo acceder.
    await page.goto('/#/club');
    await page.screenshot({ path: shot('33-club-sin-premium', p) });
    await page.goto('/#/planes');
    await page.screenshot({ path: shot('34-planes', p), fullPage: true });

    // Premium: el Reading Club por dentro.
    await setPlan(page, 'premium');
    await page.goto('/#/club/nueva');
    await page.fill('[name=title]', '¿Por dónde empezar con Borges?');
    await page.selectOption('[name=category]', 'Autores');
    await page.fill('[name=body]', 'Leí algunos cuentos sueltos y quiero ordenarme. ¿Ficciones o El Aleph primero?');
    await page.click('[data-testid=thread-submit]');
    await expect(page.locator('[data-testid=thread-full]')).toBeVisible();
    await page.fill('[name=reply]', 'Ficciones, sin dudas. «Tlön» y «Pierre Menard» son la mejor puerta de entrada.');
    await page.click('[data-testid=reply-submit]');
    await expect(page.locator('[data-testid=reply]')).toBeVisible();
    await page.screenshot({ path: shot('35-club-conversacion', p) });
    await page.goto('/#/club');
    await page.screenshot({ path: shot('36-club', p) });
    await page.goto('/#/cuenta');
    await page.screenshot({ path: shot('37-perfil', p), fullPage: true });
  });
});
