// Bordes de la fecha de nacimiento e intentos de esquivar el bloqueo.
import { OUT, callService, check, clubState, enterBirth, launch, newCtx, patchSessionUser, readUsers, setPlan, signIn, signOut, signUp, summary } from './lib.mjs';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4181';
const AR = '-03:00';
const at = (iso) => new Date(`${iso}${AR}`);
const browser = await launch();

/** Cuenta premium nueva, con la fecha de hoy fija. */
async function premiumAt(now, opts = {}) {
  const c = await newCtx(browser, { base: BASE, fixedTime: now, ...opts });
  await signUp(c.page);
  await setPlan(c.page, 'premium');
  return c;
}

/** Intenta cargar una fecha desde la interfaz; devuelve qué pasó. */
async function tryDate(page, value, { viaEval = false } = {}) {
  await page.goto('/#/club');
  await page.locator('[data-testid=club-birth]').waitFor();
  if (viaEval) {
    await page.evaluate((v) => {
      const i = document.querySelector('[name=birthDate]');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(i, v);
      i.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
  } else {
    await page.fill('[name=birthDate]', value);
  }
  const stored = await page.inputValue('[name=birthDate]');
  const validity = await page.evaluate(() => {
    const i = document.querySelector('[name=birthDate]');
    return { valid: i.validity.valid, msg: i.validationMessage, min: i.min, max: i.max };
  });
  await page.click('[data-testid=birth-submit]');
  await page.waitForTimeout(300);
  const sheet = (await page.locator('[data-testid=birth-confirm-sheet]').count()) > 0;
  const err = (await page.locator('[data-testid=club-birth] .form-error, [data-testid=club-birth] [role=alert]').allInnerTexts()).join(' / ');
  const shown = sheet ? await page.locator('[data-testid=birth-confirm-date]').innerText() : '';
  return { stored, validity, sheet, err, shown };
}

// ——— 1. Valores del campo, con hoy = 23/10/2026 ———
console.log('\n1. Valores del campo (hoy 23/10/2026)');
{
  const { ctx, page } = await premiumAt(at('2026-10-23T15:00:00'));
  const cases = [
    ['vacía', '', false],
    ['futura (mañana)', '2026-10-24', false],
    ['futura (2027)', '2027-01-01', false],
    ['año 1899', '1899-12-31', false],
    ['1 de enero de 1900', '1900-01-01', true],
    ['29/02/2023 (inexistente)', '2023-02-29', false],
    ['nacida hoy', '2026-10-23', true],
  ];
  for (const [name, value, expectSheet] of cases) {
    const r = await tryDate(page, value, { viaEval: true });
    check(r.sheet === expectSheet, `${name}: ${expectSheet ? 'pasa a confirmar' : 'no se acepta'}`, JSON.stringify(r));
    if (r.sheet) await page.click('[data-testid=birth-edit]');
  }
  await page.screenshot({ path: `${OUT}/fecha-futura-validacion-nativa.png` });
  // Corregir y Escape.
  await page.fill('[name=birthDate]', '1990-01-01');
  await page.click('[data-testid=birth-submit]');
  await page.locator('[data-testid=birth-confirm-sheet]').waitFor();
  await page.screenshot({ path: `${OUT}/fecha-confirmacion.png` });
  const role = await page.locator('[data-testid=birth-confirm-sheet]').evaluate((el) => ({ role: el.getAttribute('role') ?? el.closest('[role]')?.getAttribute('role'), modal: el.getAttribute('aria-modal') ?? el.closest('[aria-modal]')?.getAttribute('aria-modal'), focusInside: el.contains(document.activeElement) }));
  console.log('     hoja de confirmación:', JSON.stringify(role));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check((await page.locator('[data-testid=birth-confirm-sheet]').count()) === 0, 'Escape cierra la confirmación sin guardar');
  check((await readUsers(page)).every((u) => !u.birthDate), 'tras Escape no se guardó ninguna fecha');
  // Doble clic en Confirmar.
  await page.click('[data-testid=birth-submit]');
  await page.locator('[data-testid=birth-confirm-sheet]').waitFor();
  await page.dblclick('[data-testid=birth-confirm]');
  await page.waitForTimeout(800);
  const s = await clubState(page);
  check(s.list && !s.text.includes('ya está cargada'), 'doble clic en Confirmar: entra sin mostrar error', JSON.stringify({ list: s.list, text: s.text.slice(0, 160) }));
  check(page.__errors.length === 0, 'sin errores de JavaScript (1)', page.__errors.join(' / '));
  await ctx.close();
}

// ——— 2. Cumple 16 mañana: bloqueado hoy, habilitado mañana ———
console.log('\n2. Cumple 16 mañana');
{
  const c1 = await premiumAt(at('2026-10-23T23:59:00'));
  await enterBirth(c1.page, '2010-10-24');
  let s = await clubState(c1.page);
  check(s.blocked && !s.seePlans, '23/10 23:59: «no disponible para tu edad», sin ofrecer premium', s.text.slice(0, 120).replace(/\n/g, ' | '));
  await c1.page.screenshot({ path: `${OUT}/menor-bloqueado.png` });
  await c1.ctx.clock.setFixedTime(at('2026-10-24T00:00:30'));
  await c1.page.reload();
  await c1.page.goto('/#/club');
  s = await clubState(c1.page);
  check(s.list, '24/10 00:00: al cumplir 16 entra (misma cuenta, sin volver a pedir la fecha)', s.text.slice(0, 120).replace(/\n/g, ' | '));
  // Sin recargar: ¿la pantalla abierta se actualiza sola al cambiar el día? (solo se anota)
  await c1.ctx.close();
}

// ——— 3. 29 de febrero ———
console.log('\n3. 29 de febrero');
for (const [birth, before, after, note] of [
  ['2012-02-29', '2028-02-28T12:00:00', '2028-02-29T00:00:30', 'cumple 16 en año bisiesto'],
  ['2084-02-29', '2100-02-28T12:00:00', '2100-03-01T00:00:30', '2100 no es bisiesto: los cumple el 1/3'],
  ['2009-03-01', '2025-02-28T12:00:00', '2025-03-01T00:00:30', 'nacida el 1/3, año no bisiesto'],
]) {
  const c = await premiumAt(at(before));
  await enterBirth(c.page, birth);
  const shown = await (async () => {
    await c.page.goto('/#/cuenta');
    return c.page.locator('[data-testid=profile-birth-date]').innerText();
  })();
  await c.page.goto('/#/club');
  let s = await clubState(c.page);
  check(s.blocked, `${birth} (${note}): el ${before.slice(0, 10)} está bloqueada`, `perfil muestra «${shown}»`);
  await c.ctx.clock.setFixedTime(at(after));
  await c.page.reload();
  await c.page.goto('/#/club');
  s = await clubState(c.page);
  check(s.list, `${birth}: el ${after.slice(0, 10)} entra`, s.text.slice(0, 100).replace(/\n/g, ' | '));
  await c.ctx.close();
}

// ——— 4. Zona horaria (solo se documenta: la edad sigue el día local del dispositivo) ———
console.log('\n4. Zona horaria');
{
  const instant = new Date('2026-10-23T12:30:00Z'); // 09:30 en Buenos Aires; 02:30 del 24/10 en Kiritimati
  for (const tz of ['America/Argentina/Buenos_Aires', 'Pacific/Kiritimati']) {
    const c = await premiumAt(instant, { tz });
    await enterBirth(c.page, '2010-10-24');
    const s = await clubState(c.page);
    console.log(`     ${tz}: ${s.blocked ? 'bloqueada' : s.list ? 'entra' : 'otro'}`);
    await c.ctx.close();
  }
}

// ——— 5. Intentos de esquivar el bloqueo ———
console.log('\n5. Intentos de esquivar el bloqueo');
{
  const { ctx, page } = await premiumAt(at('2026-10-23T15:00:00'));
  // Antes de cargar: el servicio valida.
  for (const [v, code] of [
    ['2023-02-29', 'invalid'],
    ['1899-12-31', 'invalid'],
    ['2026-10-24', 'invalid'],
    ['', 'invalid'],
    ['10/05/1990', 'invalid'],
    [19900510, 'invalid'],
  ]) {
    const r = await callService(page, 'setBirthDate', v);
    check(r.ok === false && r.code === code, `servicio rechaza ${JSON.stringify(v)}`, `${r.code}: ${r.message ?? r.error}`);
  }
  const trimmed = await callService(page, 'setBirthDate', ' 2010-10-24 ');
  check(trimmed.ok && trimmed.value.birthDate === '2010-10-24', 'servicio acepta la fecha con espacios y la normaliza', JSON.stringify(trimmed.value?.birthDate ?? trimmed));
  // La interfaz no se entera hasta recargar (sesión en memoria).
  await page.reload();
  await page.goto('/#/club');
  let s = await clubState(page);
  check(s.blocked, 'menor (cargada desde la consola): bloqueada al recargar');
  // Volver a cargarla desde la consola.
  const again = await callService(page, 'setBirthDate', '1990-01-01');
  check(again.ok === false && again.code === 'forbidden', 'consola: una segunda fecha se rechaza (forbidden)', again.message);
  // Llamadas directas a funciones del club con la cuenta menor.
  for (const [m, args] of [
    ['listThreads', [{}]],
    ['createThread', [{ title: 'x', body: 'y', category: 'General' }]],
    ['getThread', ['t-x']],
    ['createReply', ['t-x', 'hola']],
    ['listReplies', [{}]],
  ]) {
    const r = await callService(page, m, ...args);
    check(r.ok === false && r.code === 'age-restricted', `consola: ${m} con la cuenta menor → age-restricted`, `${r.code}: ${r.message ?? r.error}`);
  }
  // Editar IndexedDB (no es localStorage: el usuario vive en IndexedDB).
  await patchSessionUser(page, { birthDate: '1990-01-01' });
  await page.reload();
  await page.goto('/#/club');
  s = await clubState(page);
  console.log(`     IndexedDB con birthDate adulta: ${s.list ? 'ENTRA (se esquiva)' : 'no entra'}`);
  check(true, `registro: editar IndexedDB ${s.list ? 'esquiva' : 'no esquiva'} el control en el servicio local`);
  await patchSessionUser(page, { birthDate: undefined });
  await page.reload();
  await page.goto('/#/club');
  s = await clubState(page);
  console.log(`     IndexedDB sin birthDate: ${s.birth ? 'vuelve a pedir la fecha (se puede cargar otra)' : 'otro'}`);
  // localStorage: ¿hay algo de la edad o del plan en localStorage?
  const ls = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)?.slice(0, 80)])));
  console.log('     localStorage:', JSON.stringify(ls));
  await ctx.close();
}
{
  // Reloj del dispositivo adelantado.
  const c = await premiumAt(at('2026-10-23T15:00:00'));
  await enterBirth(c.page, '2012-01-01'); // 14 años
  await c.ctx.clock.setFixedTime(at('2028-06-01T12:00:00'));
  await c.page.reload();
  await c.page.goto('/#/club');
  const s = await clubState(c.page);
  console.log(`     reloj adelantado a 2028 con 14 años reales: ${s.list ? 'ENTRA (se esquiva)' : 'no entra'}`);
  // Reloj atrasado a antes del nacimiento.
  await c.ctx.clock.setFixedTime(at('2011-01-01T12:00:00'));
  await c.page.reload();
  await c.page.goto('/#/club');
  const s2 = await clubState(c.page);
  console.log(`     reloj atrasado a antes del nacimiento: ${s2.blocked ? 'bloqueada («no disponible para tu edad»)' : s2.list ? 'entra' : 'otro: ' + s2.text.slice(0, 80)}`);
  // Otra cuenta en el mismo dispositivo.
  await c.ctx.clock.setFixedTime(at('2026-10-23T15:00:00'));
  await c.page.reload();
  await signOut(c.page);
  await signUp(c.page);
  await setPlan(c.page, 'premium');
  await enterBirth(c.page, '1990-01-01');
  const s3 = await clubState(c.page);
  console.log(`     segunda cuenta en el mismo dispositivo con fecha adulta: ${s3.list ? 'ENTRA (nada recuerda la fecha anterior)' : 'no entra'}`);
  await c.ctx.close();
}

// ——— 6. Dos pestañas a la vez ———
console.log('\n6. Dos pestañas');
{
  const { ctx, page } = await premiumAt(at('2026-10-23T15:00:00'));
  const p2 = await ctx.newPage();
  await page.goto('/#/club');
  await p2.goto('/#/club');
  await page.locator('[data-testid=club-birth]').waitFor();
  await p2.locator('[data-testid=club-birth]').waitFor();
  // Pestaña A: adulta. Pestaña B (abierta antes): menor.
  await page.fill('[name=birthDate]', '1990-01-01');
  await page.click('[data-testid=birth-submit]');
  await page.click('[data-testid=birth-confirm]');
  await page.locator('[data-testid=new-thread]').waitFor();
  await p2.fill('[name=birthDate]', '2012-01-01');
  await p2.click('[data-testid=birth-submit]');
  await p2.click('[data-testid=birth-confirm]');
  await p2.waitForTimeout(600);
  const txt = await p2.locator('main').innerText();
  check(txt.includes('ya está cargada'), 'pestaña B: se rechaza la segunda fecha con un mensaje', txt.slice(0, 200).replace(/\n/g, ' | '));
  const users = await readUsers(page);
  check(users[0]?.birthDate === '1990-01-01', 'queda la primera fecha', users[0]?.birthDate);
  await p2.screenshot({ path: `${OUT}/dos-pestanas-segunda-fecha.png` });
  // ¿La pestaña B queda trabada en el paso de la fecha?
  const stuck = (await p2.locator('[data-testid=club-birth]').count()) > 0;
  console.log(`     pestaña B después del rechazo: ${stuck ? 'sigue en el paso de la fecha hasta recargar' : 'se actualiza'}`);
  await ctx.close();
}

await browser.close();
process.exitCode = summary('fechas') ? 1 : 0;
