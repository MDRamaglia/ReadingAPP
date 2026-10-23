import { launch, newCtx } from './lib.mjs';
const browser = await launch();
for (const [tag, base] of [['anterior', 'http://127.0.0.1:4180'], ['nueva', 'http://127.0.0.1:4181']]) {
  const { ctx, page } = await newCtx(browser, { base });
  await page.goto('/#/');
  await page.setInputFiles('[data-testid=file-input]', '/tmp/claude-0/-home-user-ReadingAPP/885a9db0-4337-5129-9273-a94ec4c04d58/scratchpad/fixtures/una-pagina.pdf');
  await page.locator('[data-testid=import-result], [data-testid=import-error]').waitFor({ timeout: 60000 });
  const r = (await page.locator('[data-testid=import-sheet]').innerText()).replace(/\n/g, ' | ');
  await page.keyboard.press('Escape');
  const meta = (await page.locator('[data-testid=doc-item]').first().innerText()).replace(/\n/g, ' | ');
  const count = await page.locator('[data-testid=library-count]').innerText();
  console.log(`${tag}: hoja «${r}»\n   biblioteca «${meta}» · contador «${count}»`);
  await ctx.close();
}
await browser.close();
