// Utilidades comunes para las pruebas exploratorias de QA (no forman parte de tests/).
import { chromium, devices } from '/home/user/ReadingAPP/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';

export const SP = '/tmp/claude-0/-home-user-ReadingAPP/885a9db0-4337-5129-9273-a94ec4c04d58/scratchpad';
export const OUT = `${SP}/evidencia`;
mkdirSync(OUT, { recursive: true });
export const FIX = '/home/user/ReadingAPP/tests/fixtures';

export const results = [];
export function check(cond, label, extra = '') {
  results.push({ ok: !!cond, label, extra });
  console.log(`${cond ? '  ✓' : '  ✗'} ${label}${extra ? ` — ${extra}` : ''}`);
  return !!cond;
}
export function summary(name) {
  const bad = results.filter((r) => !r.ok);
  console.log(`\n${name}: ${results.length - bad.length} de ${results.length} comprobaciones bien`);
  for (const b of bad) console.log(`  FALLA: ${b.label}${b.extra ? ` — ${b.extra}` : ''}`);
  return bad.length;
}

export async function launch() {
  return chromium.launch();
}

export async function newCtx(browser, { base, mobile = false, fixedTime, locale = 'es-AR', tz = 'America/Argentina/Buenos_Aires' } = {}) {
  const opts = mobile ? { ...devices['Pixel 7'] } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
  const ctx = await browser.newContext({ ...opts, baseURL: base, locale, timezoneId: tz });
  if (fixedTime) await ctx.clock.setFixedTime(fixedTime);
  const page = await ctx.newPage();
  page.__errors = [];
  page.on('pageerror', (e) => page.__errors.push(String(e.message)));
  page.on('console', (m) => {
    if (m.type() === 'error') page.__errors.push(`console: ${m.text()}`);
  });
  return { ctx, page };
}

let seq = 0;
export async function signUp(page, name = `qa${Date.now().toString(36)}${seq++}`, password = 'secreto123') {
  await page.goto('/?dev=1#/cuenta/registro');
  await page.fill('[name=username]', name);
  await page.fill('[name=email]', `${name}@prueba.com`);
  await page.fill('[name=password]', password);
  await page.fill('[name=confirm]', password);
  await page.click('[data-testid=signup-submit]');
  await page.locator('[data-testid=plan-card]').waitFor();
  return { name, email: `${name}@prueba.com`, password };
}

export async function signIn(page, email, password = 'secreto123') {
  await page.goto('/#/cuenta/ingresar');
  await page.fill('[name=email]', email);
  await page.fill('[name=password]', password);
  await page.click('[data-testid=signin-submit]');
  await page.locator('[data-testid=plan-card]').waitFor();
}

export async function signOut(page) {
  await page.goto('/#/cuenta');
  await page.click('[data-testid=signout]');
  await page.locator('[data-testid=account-chip]', { hasText: 'Ingresar' }).waitFor();
}

export async function setPlan(page, plan) {
  await page.click('[data-testid=dev-toggle]');
  await page.click(`[data-testid=dev-plan-${plan}]`);
  await page.locator(`[data-testid=dev-plan-${plan}][aria-checked=true]`).waitFor();
  await page.click('[data-testid=dev-toggle]');
}

/** Carga y confirma la fecha desde la interfaz. Devuelve lo que quedó en pantalla. */
export async function enterBirth(page, date) {
  await page.goto('/#/club');
  await page.locator('[data-testid=club-birth]').waitFor();
  await page.fill('[name=birthDate]', date);
  await page.click('[data-testid=birth-submit]');
  await page.locator('[data-testid=birth-confirm-sheet]').waitFor({ timeout: 3000 });
  await page.click('[data-testid=birth-confirm]');
  await page.locator('[data-testid=club-birth]').waitFor({ state: 'detached', timeout: 5000 });
}

/** Qué pantalla del club se ve. */
export async function clubState(page) {
  await page.waitForTimeout(250);
  const has = async (sel) => (await page.locator(sel).count()) > 0;
  return {
    birth: await has('[data-testid=club-birth]'),
    blocked: await has('[data-testid=club-age-blocked]'),
    landing: await has('[data-testid=club-landing]'),
    gatePremium: await has('[data-testid=gate-premium]'),
    seePlans: await has('[data-testid=see-plans]'),
    list: await has('[data-testid=thread-list]'),
    newBtn: await has('[data-testid=new-thread]'),
    thread: await has('[data-testid=thread-full]'),
    form: await has('[name=title]'),
    notOwner: await has('.form-error'),
    loading: await has('.loading'),
    text: (await page.locator('main').innerText()).slice(0, 400),
  };
}

/** Lee el registro del usuario en la base local. */
export const readUsers = (page) =>
  page.evaluate(
    () =>
      new Promise((res, rej) => {
        const r = indexedDB.open('knowmadic-local');
        r.onerror = () => rej(r.error);
        r.onsuccess = () => {
          const tx = r.result.transaction('users');
          const q = tx.objectStore('users').getAll();
          q.onsuccess = () => res(q.result);
        };
      }),
  );

/** Escribe un campo en el registro del usuario de la sesión, directamente en IndexedDB. */
export const patchSessionUser = (page, patch) =>
  page.evaluate(
    (patch) =>
      new Promise((res, rej) => {
        const id = localStorage.getItem('knowmadic.local.session');
        const r = indexedDB.open('knowmadic-local');
        r.onerror = () => rej(r.error);
        r.onsuccess = () => {
          const tx = r.result.transaction('users', 'readwrite');
          const st = tx.objectStore('users');
          const g = st.get(id);
          g.onsuccess = () => {
            const u = { ...g.result };
            for (const [k, v] of Object.entries(patch)) {
              if (v === undefined) delete u[k];
              else u[k] = v;
            }
            st.put(u);
          };
          tx.oncomplete = () => res(true);
          tx.onerror = () => rej(tx.error);
        };
      }),
    patch,
  );

/** Llama al servicio local desde la consola: importa el módulo compilado y busca la clase. */
export const callService = (page, method, ...args) =>
  page.evaluate(
    async ({ method, args }) => {
      const html = await (await fetch('./index.html')).text();
      const entry = /assets\/index-[\w-]+\.js/.exec(html)[0];
      const js = await (await fetch('./' + entry)).text();
      const chunk = /localBackend-[\w-]+\.js/.exec(js);
      if (!chunk) return { error: 'no se encontró el módulo del servicio local' };
      const mod = await import(new URL('./assets/' + chunk[0], location.href).href);
      const Cls = Object.values(mod).find((v) => typeof v === 'function' && v.prototype && 'setBirthDate' in v.prototype);
      if (!Cls) return { error: 'no se encontró la clase', keys: Object.keys(mod) };
      const b = new Cls();
      try {
        const r = await b[method](...args);
        return { ok: true, value: r };
      } catch (e) {
        return { ok: false, code: e.code, message: e.message };
      }
    },
    { method, args },
  );
