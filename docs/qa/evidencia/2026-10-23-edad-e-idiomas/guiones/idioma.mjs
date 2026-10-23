// Cambio de idioma: parámetro ?lang, persistencia, idioma del dispositivo.
import { OUT, check, launch, newCtx, summary } from './lib.mjs';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4181';
const browser = await launch();
const state = async (page) => ({
  url: page.url().replace(BASE, ''),
  lang: await page.evaluate(() => document.documentElement.lang),
  stored: await page.evaluate(() => localStorage.getItem('knowmadic.lang')),
  title: await page.locator('h1').first().innerText().catch(() => ''),
  dev: await page.locator('[data-testid=dev-panel]').count(),
});

{
  const { ctx, page } = await newCtx(browser, { base: BASE });
  await page.goto('/?lang=en#/');
  let s = await state(page);
  check(s.lang === 'en' && s.stored === 'en' && !s.url.includes('lang='), '?lang=en: html lang=en, se recuerda y se quita de la dirección', JSON.stringify(s));
  check(s.title === 'Tu biblioteca', '?lang=en con en.ts vacío: se ve el español', s.title);
  await page.goto('/#/planes');
  s = await state(page);
  check(s.lang === 'en', 'al volver a entrar sin parámetro sigue en «en» (vista previa persistente)', JSON.stringify(s));
  await page.goto('/?lang=pt#/');
  s = await state(page);
  check(s.lang === 'pt' && s.stored === 'pt', '?lang=pt', JSON.stringify(s));
  await page.goto('/?lang=xx#/');
  s = await state(page);
  check(s.lang === 'es' && s.stored === null && !s.url.includes('lang='), '?lang=xx (desconocido): vuelve al automático (es)', JSON.stringify(s));
  await page.goto('/?lang=EN#/');
  s = await state(page);
  check(s.lang === 'es' && !s.url.includes('lang='), '?lang=EN (mayúsculas): vuelve al automático, no a inglés', JSON.stringify(s));
  await page.goto('/?lang=en&dev=1#/club');
  s = await state(page);
  check(s.lang === 'en' && s.dev === 1 && !s.url.includes('lang=') && !s.url.includes('dev='), '?lang=en&dev=1: aplica los dos y limpia la dirección', JSON.stringify(s));
  await page.goto('/?dev=1&lang=pt#/club');
  s = await state(page);
  check(s.lang === 'pt' && !s.url.includes('?'), '?dev=1&lang=pt: aplica los dos y limpia la dirección', JSON.stringify(s));
  await page.goto('/?lang=auto#/');
  s = await state(page);
  check(s.lang === 'es' && s.stored === null, '?lang=auto: vuelve al automático', JSON.stringify(s));
  // Manifiesto e index.html.
  const manifest = await (await page.request.get(`${BASE}/manifest.webmanifest`)).json();
  console.log('     manifiesto: lang', manifest.lang, '· name', manifest.name, '· description', manifest.description);
  await ctx.close();
}
for (const locale of ['en-US', 'pt-BR', 'es-MX', 'fr-FR']) {
  const { ctx, page } = await newCtx(browser, { base: BASE, locale });
  await page.goto('/#/');
  const s = await state(page);
  check(s.lang === 'es' && s.title === 'Tu biblioteca', `dispositivo en ${locale}: español (inglés y portugués aún no habilitados)`, JSON.stringify(s));
  await ctx.close();
}
// Sin localStorage (bloqueado): la app arranca igual.
{
  const ctx = await browser.newContext({ baseURL: BASE, locale: 'es-AR' });
  await ctx.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('bloqueado', 'SecurityError');
      },
    });
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto('/?lang=en#/');
  await page.waitForTimeout(1500);
  const h1 = await page.locator('h1').first().innerText().catch(() => '(sin h1)');
  const lang = await page.evaluate(() => document.documentElement.lang);
  check(h1 === 'Tu biblioteca', `sin localStorage + ?lang=en: arranca (h1 «${h1}», lang ${lang})`, errs.join(' / '));
  await page.screenshot({ path: `${OUT}/sin-localstorage.png` });
  await ctx.close();
}
await browser.close();
process.exitCode = summary('idioma') ? 1 : 0;
