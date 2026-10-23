// Recorre las pantallas principales y guarda el texto visible, los textos
// accesibles (aria-label, title, placeholder, alt) y una captura de cada una.
// Se corre igual contra la versión anterior y la nueva para compararlas.
//   node textos.mjs <base> <etiqueta> <celular|computadora> [lang]
import { writeFileSync, mkdirSync } from 'node:fs';
import { FIX, OUT, launch, newCtx, setPlan } from './lib.mjs';

const [BASE, TAG, DEVICE = 'computadora', LANG = ''] = process.argv.slice(2);
const mobile = DEVICE === 'celular';
const dir = `${OUT}/textos/${TAG}-${DEVICE}${LANG ? '-' + LANG : ''}`;
mkdirSync(dir, { recursive: true });
const NOW = new Date('2026-10-23T15:00:00-03:00');
const browser = await launch();
const { ctx, page } = await newCtx(browser, { base: BASE, fixedTime: NOW, mobile });
const screens = {};
let n = 0;

async function grab(name, { full = false } = {}) {
  await page.waitForTimeout(450);
  const data = await page.evaluate(() => {
    const root = document.querySelector('.sheet') ? document.body : document.body;
    const attrs = [];
    for (const el of root.querySelectorAll('[aria-label],[title],[placeholder],img[alt]')) {
      for (const a of ['aria-label', 'title', 'placeholder', 'alt']) {
        const v = el.getAttribute(a);
        if (v) attrs.push(`${a}=${v}`);
      }
    }
    // Opciones de los select (innerText no siempre las incluye).
    const options = [...root.querySelectorAll('select option')].map((o) => `option=${o.textContent}`);
    return { text: root.innerText, attrs: [...new Set([...attrs, ...options])], lang: document.documentElement.lang, title: document.title };
  });
  screens[name] = data;
  const file = `${dir}/${String(++n).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: file, fullPage: full });
}

const go = async (hash) => {
  await page.goto(`/${hash}`);
  await page.waitForTimeout(300);
};
const closeSheet = async () => {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
};

// Idioma pedido (vista previa) antes de todo.
await page.goto(`/?dev=1${LANG ? `&lang=${LANG}` : ''}#/`);
await page.locator('[data-testid=file-input]').waitFor({ state: 'attached' });
await grab('biblioteca-vacia');

// ——— Documentos ———
await page.setInputFiles('[data-testid=file-input]', `${FIX}/ensayo.docx`);
await page.locator('[data-testid=import-result], [data-testid=import-error]').waitFor({ timeout: 60000 });
await grab('importado-docx');
await closeSheet();
await page.setInputFiles('[data-testid=file-input]', `${FIX}/texto.pdf`);
await page.locator('[data-testid=import-result], [data-testid=import-error]').waitFor({ timeout: 60000 });
await grab('importado-pdf');
await closeSheet();
await page.setInputFiles('[data-testid=file-input]', `${FIX}/escaneado.pdf`);
await page.locator('[data-testid=import-result], [data-testid=import-error]').waitFor({ timeout: 60000 });
await grab('importado-escaneado');
await closeSheet();
await page.setInputFiles('[data-testid=file-input]', `${FIX}/antiguo.doc`);
await page.locator('[data-testid=import-error]').waitFor({ timeout: 60000 });
await grab('error-doc-antiguo');
await closeSheet();
await grab('biblioteca-con-documentos', { full: true });
await page.locator('[data-testid=doc-delete]').first().click();
await grab('borrar-documento');
await closeSheet();

// Lector: Word en modo libro, ajustes, índice y modo renglón.
await page.locator('[data-testid=doc-item]', { has: page.locator('.doc-docx') }).locator('.doc-open').click();
await page.locator('[data-testid=reader]').waitFor();
await page.waitForTimeout(1200);
await grab('lector-libro');
await page.click('[data-testid=open-settings]');
await grab('ajustes-lectura', { full: true });
await closeSheet();
await page.locator('.toolbar .tool').nth(1).click();
await grab('indice');
await closeSheet();
await page.click('[data-testid=mode-focus]');
await page.waitForTimeout(1200);
await grab('lector-renglon');
await page.locator('.toolbar .tool').first().click();
await page.waitForTimeout(600);
await grab('biblioteca-seguir-leyendo');

// PDF escaneado: panel de OCR (sin iniciarlo).
const scanned = page.locator('[data-testid=doc-item]', { hasText: 'escaneado' }).first();
if (await scanned.count()) {
  await scanned.locator('.doc-open').click();
  await page.locator('[data-testid=reader]').waitFor();
  await page.waitForTimeout(1500);
  await grab('lector-escaneado');
  await page.click('[data-testid=mode-focus]').catch(() => {});
  await page.waitForTimeout(1200);
  await grab('escaneado-renglon');
  await closeSheet();
  await page.locator('.toolbar .tool').first().click();
  await page.waitForTimeout(600);
}

// ——— Sin cuenta ———
await go('#/resenas');
await grab('resenas-sin-cuenta');
await go('#/club');
await grab('club-sin-cuenta');
await go('#/planes');
await grab('planes-sin-cuenta', { full: true });
await go('#/cuenta');
await grab('cuenta-sin-sesion');
await go('#/cuenta/ingresar');
await page.fill('[name=email]', 'nadie@prueba.com');
await page.fill('[name=password]', 'equivocada1');
await page.click('[data-testid=signin-submit]');
await page.waitForTimeout(1500);
await grab('ingresar-error');
await go('#/cuenta/recuperar');
await page.fill('[name=email]', 'nadie@prueba.com');
await page.click('form button');
await page.waitForTimeout(500);
await grab('recuperar');
await go('#/cuenta/registro');
await page.fill('[name=username]', 'lectora_qa');
await page.fill('[name=email]', 'lectora@prueba.com');
await page.fill('[name=password]', 'secreto123');
await page.fill('[name=confirm]', 'otra-cosa');
await page.click('[data-testid=signup-submit]');
await page.waitForTimeout(300);
await grab('registro-no-coinciden');
await page.fill('[name=confirm]', 'secreto123');
await page.click('[data-testid=signup-submit]');
await page.locator('[data-testid=plan-card]').waitFor();
await grab('perfil-gratuito', { full: true });

// ——— Con cuenta gratuita ———
await go('#/planes');
await grab('planes-gratuito', { full: true });
await go('#/club');
if (await page.locator('[data-testid=club-birth]').count()) {
  await grab('club-fecha');
  await page.fill('[name=birthDate]', '1990-05-10');
  await page.click('[data-testid=birth-submit]');
  await grab('club-fecha-confirmar');
  await page.click('[data-testid=birth-confirm]');
  await page.waitForTimeout(500);
}
await grab('club-gratuito');
await go('#/resenas/nueva');
await page.fill('[name=bookTitle]', 'Ficciones');
await page.fill('[name=bookAuthor]', 'Jorge Luis Borges');
await page.selectOption('[name=category]', 'Cuento');
await page.fill('[name=title]', 'Laberintos');
await page.fill('[name=body]', 'Una reseña de prueba.');
await grab('resena-formulario');
await page.click('[data-testid=review-submit]');
await page.waitForTimeout(800);
await grab('resena-publicada');
await go('#/resenas');
await grab('resenas-con-una');
await page.click('[data-testid=delete-review]');
await grab('borrar-resena');
await closeSheet();
await go('#/resenas/nueva');
await page.fill('[name=bookTitle]', 'x');
await page.fill('[name=bookAuthor]', 'y');
await page.selectOption('[name=category]', 'Otro');
await page.fill('[name=title]', '   ');
await page.fill('[name=body]', 'z');
await page.click('[data-testid=review-submit]');
await page.waitForTimeout(500);
await grab('resena-error-validacion');

// Panel de desarrollo.
await go('#/cuenta');
await page.click('[data-testid=dev-toggle]');
await grab('panel-desarrollo');
await page.click('[data-testid=dev-toggle]');

// ——— Premium ———
await setPlan(page, 'premium');
await go('#/cuenta');
await page.click('[data-testid=manage-plan]');
await page.waitForTimeout(300);
await grab('perfil-premium', { full: true });
await go('#/club');
await grab('club-premium-vacio');
await go('#/club/nueva');
await grab('club-nueva');
await page.fill('[name=title]', 'Hilo de prueba');
await page.selectOption('[name=category]', 'Textos propios');
await page.fill('[name=body]', 'Un texto.');
await page.click('[data-testid=thread-submit]');
await page.locator('[data-testid=thread-full]').waitFor();
await page.fill('[name=reply]', 'Una respuesta.');
await page.click('[data-testid=reply-submit]');
await page.waitForTimeout(600);
await grab('club-hilo');
await page.click('[data-testid=delete-thread]');
await grab('club-borrar-hilo');
await closeSheet();
await go('#/club');
await grab('club-premium-lista');
await page.locator('.chips .chip').nth(2).click();
await page.waitForTimeout(400);
await grab('club-categoria-vacia');
await go('#/cuenta');
await grab('perfil-premium-con-publicaciones', { full: true });
await go('#/planes');
await grab('planes-premium', { full: true });

writeFileSync(`${dir}/textos.json`, JSON.stringify(screens, null, 1));
console.log(`${TAG}-${DEVICE}${LANG ? '-' + LANG : ''}: ${Object.keys(screens).length} pantallas; errores JS: ${page.__errors.length}`);
for (const e of page.__errors) console.log('  error:', e);
await ctx.close();
await browser.close();
