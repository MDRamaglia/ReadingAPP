import { expect, test, type Page } from '@playwright/test';
import { asPremium, setPlan, signIn, signOut, signUp } from './helpers';

async function newThread(page: Page, title: string, category = 'Preguntas', body = 'Busco recomendaciones.') {
  await page.goto('/#/club/nueva');
  await page.fill('[name=title]', title);
  await page.selectOption('[name=category]', category);
  await page.fill('[name=body]', body);
  await page.click('[data-testid=thread-submit]');
  await expect(page.locator('[data-testid=thread-full]')).toContainText(title);
  return page.url().split('/').pop()!;
}

async function reply(page: Page, text: string) {
  await page.fill('[name=reply]', text);
  await page.click('[data-testid=reply-submit]');
  await expect(page.locator('[data-testid=reply]', { hasText: text })).toBeVisible();
}

test.describe('Reading Club', () => {
  test('sin premium se ve qué ofrece y cómo acceder, pero no las conversaciones', async ({ page }) => {
    // Una conversación publicada por alguien premium…
    const autor = await asPremium(page);
    const id = await newThread(page, '¿Qué leer de Borges?');
    await signOut(page);

    // …no se ve sin cuenta ni con el plan gratuito.
    for (const who of ['sin cuenta', 'gratuito']) {
      if (who === 'gratuito') await signUp(page);
      await page.goto('/#/club');
      await expect(page.locator('[data-testid=club-landing]')).toContainText('Textos propios');
      await expect(page.locator('[data-testid=gate-premium]')).toContainText('parte del plan premium');
      await expect(page.locator('[data-testid=thread-list]')).toHaveCount(0);
      await page.goto(`/#/club/${id}`);
      await expect(page.locator('[data-testid=thread-full]')).toHaveCount(0);
      await expect(page.locator('[data-testid=gate-premium]')).toBeVisible();
    }
    await page.click('[data-testid=see-plans]');
    await expect(page).toHaveURL(/#\/planes$/);

    // Con premium, sí.
    await setPlan(page, 'premium');
    await page.goto('/#/club');
    await expect(page.locator('[data-testid=thread-card]')).toContainText('¿Qué leer de Borges?');
    expect(autor.name).toBeTruthy();
  });

  test('publicar, responder y editar o eliminar solo lo propio', async ({ page }) => {
    const ana = await asPremium(page);
    const id = await newThread(page, 'Mi primer cuento', 'Textos propios', 'Había una vez…');
    await reply(page, 'Lo sigo mañana.');

    await signOut(page);
    await asPremium(page);
    await page.goto(`/#/club/${id}`);
    // No puede tocar lo ajeno: ni la publicación ni la respuesta de Ana.
    await expect(page.locator('[data-testid=edit-thread]')).toHaveCount(0);
    await expect(page.locator('[data-testid=delete-thread]')).toHaveCount(0);
    await expect(page.locator('[data-testid=reply]', { hasText: 'Lo sigo mañana.' }).locator('[data-testid=edit-reply]')).toHaveCount(0);
    await page.goto(`/#/club/${id}/editar`);
    await expect(page.locator('.form-error')).toContainText('Solo quien publicó la conversación puede editarla');

    // Su propia respuesta sí.
    await page.goto(`/#/club/${id}`);
    await reply(page, 'Muy buen comienzo');
    const mine = page.locator('[data-testid=reply]', { hasText: 'Muy buen comienzo' });
    await mine.locator('[data-testid=edit-reply]').click();
    // En edición, el texto pasa al cuadro (ya no es texto de la página).
    const editing = page.locator('[data-testid=reply]', { has: page.locator('textarea') });
    await editing.locator('textarea').fill('Muy buen comienzo, me atrapó.');
    await editing.locator('[data-testid=save-reply]').click();
    await expect(page.locator('[data-testid=reply]', { hasText: 'me atrapó' })).toContainText('editada');
    await expect(page.locator('.section-title')).toContainText('2 respuestas');
    await page.locator('[data-testid=reply]', { hasText: 'me atrapó' }).locator('[data-testid=delete-reply]').click();
    await page.click('[data-testid=confirm-delete-post]');
    await expect(page.locator('.section-title')).toContainText('1 respuesta');

    // La autora edita y elimina su conversación.
    await signOut(page);
    await signIn(page, ana.email);
    await page.goto(`/#/club/${id}`);
    await page.click('[data-testid=edit-thread]');
    await page.fill('[name=title]', 'Mi primer cuento (versión 2)');
    await page.click('[data-testid=thread-submit]');
    await expect(page.locator('[data-testid=thread-full]')).toContainText('Mi primer cuento (versión 2)');
    await page.goto('/#/cuenta');
    await expect(page.locator('[data-testid=my-posts]')).toContainText('Mi primer cuento (versión 2)');
    await expect(page.locator('[data-testid=my-posts]')).toContainText('Lo sigo mañana.');
    await page.goto(`/#/club/${id}`);
    await page.click('[data-testid=delete-thread]');
    await page.click('[data-testid=confirm-delete-post]');
    await expect(page).toHaveURL(/#\/club$/);
    await expect(page.locator('[data-testid=empty-state]')).toContainText('Todavía no hay conversaciones');
  });
});
