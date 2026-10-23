// Navegación directa a las rutas del club con cada perfil de edad y de plan.
import { OUT, check, clubState, enterBirth, launch, newCtx, setPlan, signOut, signUp, summary } from './lib.mjs';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4181';
// Hoy fijo: 23 de octubre de 2026, 15:00 en Buenos Aires.
const NOW = new Date('2026-10-23T15:00:00-03:00');
const mobile = process.argv[3] === 'celular';

const browser = await launch();
const { ctx, page } = await newCtx(browser, { base: BASE, fixedTime: NOW, mobile });

// Una conversación publicada por una persona adulta con premium.
const autor = await signUp(page);
await setPlan(page, 'premium');
await enterBirth(page, '1990-05-10');
await page.goto('/#/club/nueva');
await page.fill('[name=title]', 'Hilo secreto QA');
await page.selectOption('[name=category]', 'Preguntas');
await page.fill('[name=body]', 'Cuerpo secreto del hilo.');
await page.click('[data-testid=thread-submit]');
await page.locator('[data-testid=thread-full]').waitFor();
const id = page.url().split('#/club/')[1];
await signOut(page);
console.log('hilo', id);

const routes = (id) => ({ lista: '/#/club', hilo: `/#/club/${id}`, nueva: '/#/club/nueva', editar: `/#/club/${id}/editar`, inexistente: '/#/club/t-no-existe', editarInexistente: '/#/club/t-no-existe/editar' });

const profiles = [
  { name: 'sin cuenta' },
  { name: 'gratuito sin fecha', plan: 'free' },
  { name: 'gratuito 15 (cumple 16 mañana)', plan: 'free', birth: '2010-10-24' },
  { name: 'gratuito 16 (cumple hoy)', plan: 'free', birth: '2010-10-23' },
  { name: 'gratuito 30', plan: 'free', birth: '1996-07-15' },
  { name: 'premium sin fecha', plan: 'premium' },
  { name: 'premium 15 (cumple 16 mañana)', plan: 'premium', birth: '2010-10-24' },
  { name: 'premium 16 (cumple hoy)', plan: 'premium', birth: '2010-10-23' },
  { name: 'premium 30', plan: 'premium', birth: '1996-07-15' },
  { name: 'premium 18, nacido un 29 de febrero', plan: 'premium', birth: '2008-02-29' },
];

for (const pr of profiles) {
  console.log(`\n— ${pr.name}`);
  if (pr.plan) {
    await signUp(page);
    if (pr.plan === 'premium') await setPlan(page, 'premium');
    if (pr.birth) await enterBirth(page, pr.birth);
  }
  const expected = !pr.plan ? 'landing' : !pr.birth ? 'birth' : pr.birth >= '2010-10-24' ? 'blocked' : pr.plan === 'free' ? 'landing' : 'in';
  for (const [rname, path] of Object.entries(routes(id))) {
    await page.goto(path);
    const s = await clubState(page);
    const leak = s.text.includes('Hilo secreto QA') || s.text.includes('Cuerpo secreto');
    let ok;
    if (expected === 'landing') ok = s.landing && s.gatePremium && !s.list && !s.thread && !s.form && !s.birth && !s.blocked;
    else if (expected === 'birth') ok = s.birth && !s.seePlans && !s.gatePremium && !s.list && !s.thread && !s.form;
    else if (expected === 'blocked') ok = s.blocked && !s.seePlans && !s.gatePremium && !s.list && !s.thread && !s.form;
    else {
      // Con acceso: cada ruta muestra lo suyo.
      if (rname === 'lista') ok = s.list && s.newBtn;
      else if (rname === 'hilo') ok = s.thread;
      else if (rname === 'nueva') ok = s.form;
      else if (rname === 'editar') ok = s.notOwner && !s.form; // no es la autora
      else ok = !s.thread && !s.form; // inexistentes
    }
    check(ok && (expected === 'in' || !leak), `${pr.name} · ${rname} → ${expected}`, ok ? '' : JSON.stringify({ ...s, text: s.text.replace(/\n/g, ' | ').slice(0, 220) }));
    if (expected === 'in' && (rname === 'inexistente' || rname === 'editarInexistente')) {
      console.log(`     (${rname}: ${s.text.replace(/\n/g, ' | ').slice(0, 160)})`);
    }
  }
  if (pr.plan) {
    // Perfil: qué dice de la fecha y del club.
    await page.goto('/#/cuenta');
    await page.locator('[data-testid=birth-card]').waitFor();
    const birth = (await page.locator('[data-testid=birth-card]').innerText()).replace(/\n/g, ' | ');
    const club = (await page.locator('.section-title', { hasText: 'Reading Club' }).locator('xpath=following-sibling::*[1]').innerText()).replace(/\n/g, ' | ');
    console.log(`     perfil: fecha «${birth}» · club «${club}»`);
    await signOut(page);
  }
}

// La autora pasa a gratuito: ya no puede editar ni ver su hilo.
console.log('\n— autora que vuelve a gratuito');
await page.goto('/#/cuenta/ingresar');
await page.fill('[name=email]', autor.email);
await page.fill('[name=password]', autor.password);
await page.click('[data-testid=signin-submit]');
await page.locator('[data-testid=plan-card]').waitFor();
await page.goto('/?dev=1#/cuenta');
await setPlan(page, 'free');
for (const [rname, path] of Object.entries(routes(id))) {
  await page.goto(path);
  const s = await clubState(page);
  check(s.landing && s.gatePremium && !s.thread && !s.form, `autora en gratuito · ${rname} → landing`, JSON.stringify({ ...s, text: s.text.slice(0, 120) }));
}
await page.goto('/#/cuenta');
const posts = (await page.locator('.section-title', { hasText: 'Reading Club' }).locator('xpath=following-sibling::*[1]').innerText()).replace(/\n/g, ' | ');
console.log(`     perfil de la autora en gratuito: «${posts}»`);
await page.screenshot({ path: `${OUT}/${mobile ? 'celular' : 'computadora'}-perfil-autora-gratuito.png`, fullPage: true });

check(page.__errors.length === 0, 'sin errores de JavaScript', page.__errors.join(' / '));
await ctx.close();
await browser.close();
process.exitCode = summary(`rutas (${mobile ? 'celular' : 'computadora'})`) ? 1 : 0;
