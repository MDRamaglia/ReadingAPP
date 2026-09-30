import { expect, test, type Page } from '@playwright/test';
import { signIn, signOut, signUp } from './helpers';

interface R {
  book: string;
  author: string;
  category: string;
  title: string;
  body: string;
  spoiler?: boolean;
}

async function publish(page: Page, r: R) {
  await page.goto('/#/resenas/nueva');
  await page.fill('[name=bookTitle]', r.book);
  await page.fill('[name=bookAuthor]', r.author);
  await page.selectOption('[name=category]', r.category);
  await page.fill('[name=title]', r.title);
  await page.fill('[name=body]', r.body);
  if (r.spoiler) await page.check('[name=spoiler]');
  await page.click('[data-testid=review-submit]');
  await expect(page.locator('[data-testid=review-full]')).toContainText(r.title);
  return page.url().split('/').pop()!;
}

const titles = (page: Page) => page.locator('[data-testid=review-card] .review-title').allInnerTexts();
const card = (page: Page, title: string) => page.locator('[data-testid=review-card]', { hasText: title });

async function like(page: Page, title: string) {
  await page.goto('/#/resenas');
  const btn = card(page, title).locator('[data-testid=like]');
  await btn.click();
  // El like quedó registrado (el servicio respondió) antes de seguir.
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
}

const CIEN: R = { book: 'Cien años de soledad', author: 'Gabriel García Márquez', category: 'Novela', title: 'Macondo como espejo', body: 'Una saga familiar.' };
const TUNEL: R = { book: 'El túnel', author: 'Ernesto Sábato', category: 'Novela', title: 'Obsesión en primera persona', body: 'Castel lo cuenta todo.', spoiler: true };
const SAPIENS: R = { book: 'Sapiens', author: 'Yuval Noah Harari', category: 'Historia', title: 'Una historia en grande', body: 'Ambiciosa y discutible.' };

test.describe('Reseñas', () => {
  test('sin cuenta se leen; para publicar o dar like hay que iniciar sesión', async ({ page }) => {
    await page.goto('/#/resenas');
    await expect(page.locator('[data-testid=empty-state]')).toContainText('Todavía no hay reseñas');
    await page.click('[data-testid=write-review]');
    await expect(page).toHaveURL(/cuenta\/ingresar/);
    await page.goto('/#/resenas/nueva');
    await expect(page.locator('[data-testid=gate-account]')).toBeVisible();
  });

  test('búsqueda sin distinguir mayúsculas ni tildes, filtro por categoría y los dos órdenes', async ({ page }) => {
    const ana = await signUp(page, 'ana');
    await publish(page, CIEN);
    await publish(page, TUNEL);
    await publish(page, SAPIENS);

    await page.goto('/#/resenas');
    const search = page.locator('[data-testid=review-search]');
    await search.fill('CIEN ANOS');
    await expect.poll(() => titles(page)).toEqual(['Macondo como espejo']);
    await search.fill('garcia marquez');
    await expect.poll(() => titles(page)).toEqual(['Macondo como espejo']);
    await search.fill('sábato');
    await expect.poll(() => titles(page)).toEqual(['Obsesión en primera persona']);
    await search.fill('TUNEL sabato');
    await expect.poll(() => titles(page)).toEqual(['Obsesión en primera persona']);
    await search.fill('rayuela');
    await expect(page.locator('[data-testid=empty-state]')).toContainText('No hay reseñas que coincidan');
    await search.fill('');
    await page.selectOption('[data-testid=review-category]', 'Historia');
    await expect.poll(() => titles(page)).toEqual(['Una historia en grande']);
    await page.selectOption('[data-testid=review-category]', '');

    // Más recientes: la última publicada primero.
    await page.click('[data-testid=sort-recent]');
    await expect.poll(() => titles(page)).toEqual(['Una historia en grande', 'Obsesión en primera persona', 'Macondo como espejo']);

    // Likes de otras dos personas: más likes, más visibilidad en «Más valoradas».
    await signOut(page);
    await signUp(page, 'beto');
    await like(page, 'Obsesión en primera persona');
    await like(page, 'Macondo como espejo');
    await signOut(page);
    await signUp(page, 'caro');
    await like(page, 'Macondo como espejo');
    await page.goto('/#/resenas');
    await page.click('[data-testid=sort-top]');
    await expect.poll(() => titles(page)).toEqual(['Macondo como espejo', 'Obsesión en primera persona', 'Una historia en grande']);
    await expect(card(page, 'Macondo como espejo').locator('[data-testid=like-count]')).toHaveText('2');
    await page.click('[data-testid=sort-recent]');
    await expect.poll(() => titles(page)).toEqual(['Una historia en grande', 'Obsesión en primera persona', 'Macondo como espejo']);
    expect(ana.name).toBe('ana');
  });

  test('un like por persona, que se puede retirar; no se da like a lo propio', async ({ page }) => {
    await signUp(page, 'autora');
    await publish(page, CIEN);
    await page.goto('/#/resenas');
    await expect(card(page, CIEN.title).locator('[data-testid=like]')).toBeDisabled();

    await signOut(page);
    await signUp(page, 'lector');
    await page.goto('/#/resenas');
    const btn = card(page, CIEN.title).locator('[data-testid=like]');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    await expect(btn.locator('[data-testid=like-count]')).toHaveText('1');
    await page.reload();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    await expect(btn.locator('[data-testid=like-count]')).toHaveText('1');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    await expect(btn.locator('[data-testid=like-count]')).toHaveText('0');
  });

  test('las reseñas con spoilers se ocultan hasta que se deciden ver', async ({ page }) => {
    await signUp(page);
    await publish(page, TUNEL);
    await page.goto('/#/resenas');
    const c = card(page, TUNEL.title);
    await expect(c.locator('.review-body')).toHaveCount(0);
    await c.locator('[data-testid=spoiler-cover]').click();
    await expect(c.locator('.review-body')).toContainText('Castel lo cuenta todo');
  });

  test('solo quien publicó puede editar o eliminar su reseña', async ({ page }) => {
    const autora = await signUp(page, 'autora');
    const id = await publish(page, CIEN);
    await signOut(page);
    await signUp(page, 'otro');
    await page.goto('/#/resenas');
    await expect(card(page, CIEN.title).locator('[data-testid=edit-review]')).toHaveCount(0);
    await expect(card(page, CIEN.title).locator('[data-testid=delete-review]')).toHaveCount(0);
    await page.goto(`/#/resenas/${id}/editar`);
    await expect(page.locator('.form-error')).toContainText('Solo quien publicó la reseña puede editarla');

    await signOut(page);
    await signIn(page, autora.email);
    await page.goto('/#/resenas');
    await card(page, CIEN.title).locator('[data-testid=edit-review]').click();
    await page.fill('[name=title]', 'Macondo, espejo de un continente');
    await page.click('[data-testid=review-submit]');
    await expect(page.locator('[data-testid=review-full]')).toContainText('Macondo, espejo de un continente');
    await expect(page.locator('[data-testid=review-full]')).toContainText('editada');
    await page.click('[data-testid=delete-review]');
    await page.click('[data-testid=confirm-delete-review]');
    await expect(page).toHaveURL(/#\/resenas$/);
    await expect(page.locator('[data-testid=empty-state]')).toContainText('Todavía no hay reseñas');

    // El perfil muestra las reseñas propias.
    await publish(page, SAPIENS);
    await page.goto('/#/cuenta');
    await expect(page.locator('[data-testid=my-reviews]')).toContainText('Una historia en grande');
  });
});
