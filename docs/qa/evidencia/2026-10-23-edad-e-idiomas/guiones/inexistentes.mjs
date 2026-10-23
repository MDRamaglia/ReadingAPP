import { OUT, launch, newCtx, setPlan, signUp, enterBirth } from './lib.mjs';
const browser = await launch();
for (const [tag, base] of [['anterior', 'http://127.0.0.1:4180'], ['nueva', 'http://127.0.0.1:4181']]) {
  const { ctx, page } = await newCtx(browser, { base });
  await signUp(page);
  await setPlan(page, 'premium');
  if (tag === 'nueva') await enterBirth(page, '1990-01-01');
  for (const h of ['#/resenas/r-no-existe/editar', '#/club/t-no-existe/editar']) {
    await page.goto('/' + h);
    await page.waitForTimeout(600);
    const txt = (await page.locator('main').innerText()).replace(/\n+/g, ' | ').slice(0, 140);
    console.log(`${tag} ${h}: «${txt}»`);
    await page.screenshot({ path: `${OUT}/${tag}-editar-inexistente-${h.includes('club') ? 'club' : 'resena'}.png` });
  }
  // Enviar el formulario vacío de un hilo inexistente
  await page.fill('[name=title]', 'Prueba');
  await page.selectOption('[name=category]', 'General');
  await page.fill('[name=body]', 'Texto');
  await page.click('[data-testid=thread-submit]');
  await page.waitForTimeout(600);
  console.log(`${tag} al enviar: «${(await page.locator('[data-testid=form-error]').innerText().catch(() => '(sin error)'))}»`);
  await ctx.close();
}
await browser.close();
