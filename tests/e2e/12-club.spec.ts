import { expect, test, type Page } from '@playwright/test';
import { asClubMember, birthDateForAge, enterBirthDate, setPlan, signIn, signOut, signUp } from './helpers';

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

/** Fecha larga, como la muestra la app («15 de julio de 2010»). */
const longDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(y!, m! - 1, d!, 12));
};

test.describe('Reading Club', () => {
  test('sin cuenta, o con 16 o más y el plan gratuito, se ve qué ofrece y cómo acceder, pero no las conversaciones', async ({ page }) => {
    // Una conversación publicada por alguien premium…
    const autor = await asClubMember(page);
    const id = await newThread(page, '¿Qué leer de Borges?');
    await signOut(page);

    // …no se ve sin cuenta ni con el plan gratuito.
    for (const who of ['sin cuenta', 'gratuito']) {
      if (who === 'gratuito') {
        await signUp(page);
        await enterBirthDate(page, birthDateForAge(20));
      }
      await page.goto('/#/club');
      await expect(page.locator('[data-testid=club-landing]')).toContainText('Textos propios');
      await expect(page.locator('[data-testid=club-age-note]')).toContainText('para personas de 16 años o más');
      await expect(page.locator('[data-testid=gate-premium]')).toContainText('parte del plan premium');
      await expect(page.locator('[data-testid=thread-list]')).toHaveCount(0);
      await page.goto(`/#/club/${id}`);
      await expect(page.locator('[data-testid=thread-full]')).toHaveCount(0);
      await expect(page.locator('[data-testid=gate-premium]')).toBeVisible();
    }
    await page.click('[data-testid=see-plans]');
    await expect(page).toHaveURL(/#\/planes$/);

    // La página de planes avisa la edad mínima.
    await expect(page.locator('[data-testid=plans-club-age]')).toContainText('para personas de 16 años o más');
    await expect(page.locator('[data-testid=plans-table] tr', { hasText: 'Reading Club' })).toContainText('para personas de 16 años o más');

    // Con premium, sí.
    await setPlan(page, 'premium');
    await page.goto('/#/club');
    await expect(page.locator('[data-testid=thread-card]')).toContainText('¿Qué leer de Borges?');
    expect(autor.name).toBeTruthy();
  });

  test('menor de 16: se pide la fecha antes de ofrecer premium y el club no está disponible', async ({ page }) => {
    await signUp(page);
    // El registro no pidió la fecha; el perfil lo explica.
    await expect(page.locator('[data-testid=birth-date-missing]')).toContainText('Se pide la primera vez que entrás al Reading Club');

    // Primera entrada: la fecha, sin ofrecer premium.
    for (const path of ['/#/club', '/#/club/nueva', '/#/club/t-inexistente']) {
      await page.goto(path);
      await expect(page.locator('[data-testid=club-birth]')).toContainText('para personas de 16 años o más');
      await expect(page.locator('[data-testid=club-birth]')).toContainText('no se puede cambiar desde la app');
      await expect(page.locator('[data-testid=see-plans]')).toHaveCount(0);
      await expect(page.locator('[data-testid=gate-premium]')).toHaveCount(0);
      await expect(page.locator('[name=title]')).toHaveCount(0);
    }

    // Antes de guardar se confirma, y se puede corregir.
    await page.goto('/#/club');
    await page.fill('[name=birthDate]', birthDateForAge(40));
    await page.click('[data-testid=birth-submit]');
    await expect(page.locator('[data-testid=birth-confirm-date]')).toHaveText(longDate(birthDateForAge(40)));
    await page.click('[data-testid=birth-edit]');
    await expect(page.locator('[data-testid=birth-confirm-sheet]')).toHaveCount(0);
    const minor = birthDateForAge(15);
    await page.fill('[name=birthDate]', minor);
    await page.click('[data-testid=birth-submit]');
    await expect(page.locator('[data-testid=birth-confirm-date]')).toHaveText(longDate(minor));
    await page.click('[data-testid=birth-confirm]');

    // No disponible para su edad, sin ofrecerle premium.
    const blocked = page.locator('[data-testid=club-age-blocked]');
    await expect(blocked).toContainText('no está disponible para tu edad');
    await expect(blocked).toContainText('de 16 años o más');
    await expect(page.locator('[data-testid=see-plans]')).toHaveCount(0);
    await expect(page.locator('[data-testid=gate-premium]')).toHaveCount(0);

    // Ni siquiera con premium.
    await setPlan(page, 'premium');
    for (const path of ['/#/club', '/#/club/nueva', '/#/club/t-inexistente']) {
      await page.goto(path);
      await expect(page.locator('[data-testid=club-age-blocked]')).toBeVisible();
      await expect(page.locator('[data-testid=thread-list], [data-testid=thread-full], [name=title]')).toHaveCount(0);
    }
    await page.goto('/#/cuenta');
    await expect(page.locator('[data-testid=profile-birth-date]')).toHaveText(longDate(minor));
    await expect(page.locator('.section-title', { hasText: 'Reading Club' }).locator('xpath=following-sibling::p[1]')).toContainText('para personas de 16 años o más');

    // El resto de la app sigue igual.
    await page.goto('/#/resenas');
    await expect(page.locator('[data-testid=write-review]')).toHaveAttribute('href', '#/resenas/nueva');
    await page.goto('/#/');
    await expect(page.locator('[data-testid=file-input]')).toBeAttached();
  });

  test('16 o más con premium: primero la fecha y después se entra', async ({ page }) => {
    await signUp(page);
    await setPlan(page, 'premium');
    await page.goto('/#/club');
    // Aunque sea premium, no entra sin la fecha.
    await expect(page.locator('[data-testid=club-birth]')).toBeVisible();
    await expect(page.locator('[data-testid=thread-list]')).toHaveCount(0);
    await page.fill('[name=birthDate]', birthDateForAge(16));
    await page.click('[data-testid=birth-submit]');
    await page.click('[data-testid=birth-confirm]');
    await expect(page.locator('[data-testid=new-thread]')).toBeVisible();
    await expect(page.locator('[data-testid=empty-state]')).toContainText('Todavía no hay conversaciones');
    await newThread(page, 'Mi primera pregunta');
  });

  test('la fecha de nacimiento queda bloqueada', async ({ page }) => {
    const u = await signUp(page);
    // Una fecha futura no se acepta.
    await page.goto('/#/club');
    await page.fill('[name=birthDate]', `${new Date().getFullYear() + 1}-01-01`);
    await page.click('[data-testid=birth-submit]');
    await expect(page.locator('[data-testid=birth-confirm-sheet]')).toHaveCount(0);
    await expect(page.locator('[data-testid=club-birth]')).toBeVisible();

    const date = birthDateForAge(25);
    await enterBirthDate(page, date);
    await expect(page.locator('[data-testid=gate-premium]')).toBeVisible();

    // En el perfil se ve, sin forma de cambiarla.
    await page.goto('/#/cuenta');
    await expect(page.locator('[data-testid=profile-birth-date]')).toHaveText(longDate(date));
    await expect(page.locator('[data-testid=birth-date-locked]')).toContainText('no se puede cambiar desde la app');
    await expect(page.locator('[name=birthDate]')).toHaveCount(0);

    // No se vuelve a pedir, ni después de cerrar e iniciar sesión.
    await signOut(page);
    await signIn(page, u.email);
    await expect(page.locator('[data-testid=profile-birth-date]')).toHaveText(longDate(date));
    await page.goto('/#/club');
    await expect(page.locator('[data-testid=gate-premium]')).toBeVisible();
    await expect(page.locator('[data-testid=club-birth]')).toHaveCount(0);
  });

  test('publicar, responder y editar o eliminar solo lo propio', async ({ page }) => {
    const ana = await asClubMember(page);
    const id = await newThread(page, 'Mi primer cuento', 'Textos propios', 'Había una vez…');
    await reply(page, 'Lo sigo mañana.');

    await signOut(page);
    await asClubMember(page);
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
