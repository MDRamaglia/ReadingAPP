import { expect, test, type Page } from '@playwright/test';
import { active, hasTouch, importAndOpen, isMobile, progressText, swipe, tapAt, toBook, toFocus, waitBookReady } from './helpers';

/** Primer número de «Pág. N de M» (Word). */
const pageNum = async (page: Page) => Number(/^Pág\. (\d+)/.exec(await progressText(page))![1]);
/** Números de página que muestra la vista real (no la hoja que gira). */
const baseFolios = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('.flow-stage > .folio, .pdf-stage > .pdf-spread .pdf-folio'))
      .map((f) => f.textContent)
      .join(','),
  );
const readerPos = (page: Page) => page.evaluate(() => (window as any).__reader.report.pos);
const curlHidden = (page: Page) => page.evaluate(() => [...document.querySelectorAll('.book-stage .curl')].every((c) => (c as HTMLElement).hidden));

async function setNav(page: Page, opts: { direction?: 'horizontal' | 'vertical'; curl?: boolean }) {
  await page.click('[data-testid=open-settings]');
  const sheet = page.locator('[data-testid=settings-sheet]');
  await expect(sheet).toBeVisible();
  // Primero la animación: en vertical el interruptor está deshabilitado.
  if (opts.curl !== undefined) await sheet.locator('[data-testid=page-curl]').setChecked(opts.curl);
  if (opts.direction) await sheet.locator(`[data-testid=dir-${opts.direction}]`).click();
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
}

interface Frame {
  visible: boolean;
  t: number | null;
  clip: string;
  back: string;
  folios: string;
}

/** Registra, cuadro a cuadro, la hoja y la vista real mientras ocurre `action`. */
async function record(page: Page, action: () => Promise<void>, ms = 1400): Promise<Frame[]> {
  await page.evaluate((ms) => {
    const w = window as any;
    w.__rec = [];
    const t0 = performance.now();
    const loop = () => {
      const c = document.querySelector('.book-stage .curl') as HTMLElement | null;
      const turns = w.__flow?.turns ?? w.__pdfTurns;
      w.__rec.push({
        visible: !!c && !c.hidden,
        t: turns?.curl?.t ?? null,
        clip: c ? (c.querySelector('.curl-front') as HTMLElement).style.clipPath : '',
        back: c ? getComputedStyle(c.querySelector('.curl-back')!).visibility : '',
        folios: Array.from(document.querySelectorAll('.flow-stage > .folio, .pdf-stage > .pdf-spread .pdf-folio'))
          .map((f) => f.textContent)
          .join(','),
      });
      if (performance.now() - t0 < ms) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }, ms);
  await action();
  await page.waitForTimeout(ms + 150);
  return page.evaluate(() => (window as any).__rec);
}

/** La hoja se dobló de verdad: cuadros intermedios con pliegue, dorso visible y avance en un solo sentido. */
function expectCurl(frames: Frame[], forward: boolean) {
  const mid = frames.filter((f) => f.visible && f.t !== null && f.t > 0.05 && f.t < 0.95);
  // Varios cuadros intermedios (en una máquina lenta pueden ser pocos, pero nunca un salto).
  expect(mid.length).toBeGreaterThanOrEqual(4);
  for (const f of mid) {
    expect(f.clip).toMatch(/^path\(/);
    expect(f.back).toBe('visible');
  }
  const ts = mid.map((f) => f.t!);
  for (let i = 1; i < ts.length; i++) {
    if (forward) expect(ts[i]!).toBeGreaterThanOrEqual(ts[i - 1]! - 1e-6);
    else expect(ts[i]!).toBeLessThanOrEqual(ts[i - 1]! + 1e-6);
  }
  expect(frames[frames.length - 1]!.visible).toBe(false);
  return mid;
}

/** Arrastre que se mantiene apretado mientras se revisa el estado intermedio. */
async function dragHold(page: Page, fromX: number, dx: number, during: () => Promise<void>) {
  const box = (await page.locator('.reader-stage').boundingBox())!;
  const x = box.x + box.width * fromX;
  const y = box.y + box.height * 0.7;
  if (await hasTouch(page)) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (dx * i) / 8, y }] });
    await page.waitForTimeout(120);
    await during();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx, y, { steps: 8 });
    await page.waitForTimeout(120);
    await during();
    await page.mouse.up();
  }
}

test.describe('Modo libro: dirección y animación de página', () => {
  test('por defecto pasa en horizontal y sin animación; el interruptor se deshabilita en vertical y conserva su valor', async ({ page }) => {
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    await page.click('[data-testid=open-settings]');
    const sheet = page.locator('[data-testid=settings-sheet]');
    const curl = sheet.locator('[data-testid=page-curl]');
    await expect(sheet.locator('[data-testid=dir-horizontal]')).toHaveAttribute('aria-checked', 'true');
    await expect(sheet.locator('[data-testid=dir-vertical]')).toHaveAttribute('aria-checked', 'false');
    await expect(sheet.getByText('Animación de página')).toBeVisible();
    await expect(curl).not.toBeChecked();
    await expect(curl).toBeEnabled();

    await curl.check();
    await sheet.locator('[data-testid=dir-vertical]').click();
    await expect(curl).toBeDisabled();
    await expect(curl).toBeChecked();
    await expect(sheet.getByText('Disponible solo al pasar páginas en horizontal.')).toBeVisible();
    await sheet.locator('[data-testid=dir-horizontal]').click();
    await expect(curl).toBeEnabled();
    await expect(curl).toBeChecked();

    // Se guardan con las demás preferencias y sobreviven a una recarga.
    await sheet.locator('[data-testid=dir-vertical]').click();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('renglon.settings')!));
    expect(saved).toMatchObject({ bookDirection: 'vertical', pageCurl: true });
    // Sin haber avanzado no hay punto de lectura que ofrecer: se abre directamente.
    await page.reload();
    await waitBookReady(page);
    await page.click('[data-testid=open-settings]');
    await expect(sheet.locator('[data-testid=dir-vertical]')).toHaveAttribute('aria-checked', 'true');
    await expect(curl).toBeChecked();
    await expect(curl).toBeDisabled();
  });

  test('vertical: pasa páginas completas hacia arriba y abajo con deslizamiento, toques, teclado y rueda', async ({ page }) => {
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    const step = isMobile(page) ? 1 : 2;
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => pageNum(page)).toBe(1 + step);
    const before = { text: await progressText(page), folios: await baseFolios(page), pos: await readerPos(page) };

    // Con la animación de hoja activada de antes: en vertical no se usa.
    await setNav(page, { curl: true, direction: 'vertical' });
    expect(await progressText(page)).toBe(before.text);
    expect(await baseFolios(page)).toBe(before.folios);
    expect(await readerPos(page)).toEqual(before.pos);

    const p0 = 1 + step;
    await swipe(page, 0, -170);
    await expect.poll(() => pageNum(page)).toBe(p0 + step);
    await expect(page.locator('.flow-view')).toHaveClass(/turn-next-v/);
    expect(await curlHidden(page)).toBe(true);
    await swipe(page, 0, 170);
    await expect.poll(() => pageNum(page)).toBe(p0);
    await expect(page.locator('.flow-view')).toHaveClass(/turn-prev-v/);

    await tapAt(page, 0.5, 0.9);
    await expect.poll(() => pageNum(page)).toBe(p0 + step);
    await tapAt(page, 0.5, 0.1);
    await expect.poll(() => pageNum(page)).toBe(p0);

    await page.keyboard.press('ArrowDown');
    await expect.poll(() => pageNum(page)).toBe(p0 + step);
    await page.keyboard.press('ArrowUp');
    await expect.poll(() => pageNum(page)).toBe(p0);

    // Un deslizamiento de costado no pasa de página en vertical.
    await swipe(page, -170, 0);
    await page.waitForTimeout(400);
    expect(await pageNum(page)).toBe(p0);

    if (!isMobile(page)) {
      const box = (await page.locator('.reader-stage').boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(0, 200);
      await expect.poll(() => pageNum(page)).toBe(p0 + step);
    }
    // Cada paso es una página completa: la vista queda alineada con su número.
    const n = await pageNum(page);
    expect(await baseFolios(page)).toBe(step === 2 ? `${n},${n + 1}` : String(n));
    await expect(page.locator('.flow-view')).not.toHaveAttribute('style', /translate/);
  });

  test('vertical en PDF: páginas originales hacia arriba y abajo', async ({ page }) => {
    await importAndOpen(page, 'texto.pdf');
    await waitBookReady(page);
    await setNav(page, { direction: 'vertical' });
    const first = await progressText(page);
    await swipe(page, 0, -170);
    await expect(page.locator('[data-testid=progress-text]')).not.toHaveText(first);
    await expect(page.locator('.pdf-stage > .pdf-spread')).toHaveClass(/turn-next-v/);
    const second = await progressText(page);
    await tapAt(page, 0.5, 0.1);
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(first);
    await tapAt(page, 0.5, 0.9);
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(second);
    await page.keyboard.press('ArrowUp');
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(first);
  });

  test('horizontal con animación: la hoja se dobla, descubre la siguiente y vuelve al retroceder (Word)', async ({ page }) => {
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    const step = isMobile(page) ? 1 : 2;
    await setNav(page, { curl: true });
    await page.waitForTimeout(600);

    // Avanzar con un toque en el costado derecho.
    let frames = await record(page, () => tapAt(page, 0.9, 0.5));
    let mid = expectCurl(frames, true);
    // Debajo de la hoja ya está la página siguiente.
    expect(mid.every((f) => f.folios.split(',')[0] === String(1 + step))).toBe(true);
    expect(await pageNum(page)).toBe(1 + step);
    expect((await baseFolios(page)).split(',')[0]).toBe(String(1 + step));

    // Retroceder con el costado izquierdo: la misma hoja vuelve; debajo sigue la actual hasta el final.
    frames = await record(page, () => tapAt(page, 0.08, 0.5));
    mid = expectCurl(frames, false);
    expect(mid.every((f) => f.folios.split(',')[0] === String(1 + step))).toBe(true);
    expect(await pageNum(page)).toBe(1);
    expect((await baseFolios(page)).split(',')[0]).toBe('1');

    // También con el teclado.
    frames = await record(page, () => page.keyboard.press('ArrowRight'));
    expectCurl(frames, true);
    expect(await pageNum(page)).toBe(1 + step);
  });

  test('horizontal con animación: pases rápidos terminan en la página correcta, sin hojas colgadas', async ({ page }) => {
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    const step = isMobile(page) ? 1 : 2;
    await setNav(page, { curl: true });
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
    await expect.poll(() => pageNum(page)).toBe(1 + 5 * step);
    await expect.poll(() => curlHidden(page)).toBe(true);
    expect((await baseFolios(page)).split(',')[0]).toBe(String(1 + 5 * step));
    for (let i = 0; i < 3; i++) {
      await tapAt(page, 0.08, 0.5);
      await page.waitForTimeout(60);
    }
    await expect.poll(() => pageNum(page)).toBe(1 + 2 * step);
    await expect.poll(() => curlHidden(page)).toBe(true);
    expect((await baseFolios(page)).split(',')[0]).toBe(String(1 + 2 * step));
    // El punto de lectura informado coincide con lo que se ve.
    const pos = await readerPos(page);
    const shownPage = await page.evaluate((p) => (window as any).__flow.pageOf(p), pos);
    expect(Math.floor(shownPage / step) * step + 1).toBe(1 + 2 * step);
  });

  test('horizontal con animación: la hoja sigue al dedo y se completa o se devuelve al soltar', async ({ page }) => {
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    const step = isMobile(page) ? 1 : 2;
    await setNav(page, { curl: true });
    await page.waitForTimeout(600);

    // Arrastre corto: la hoja se levanta y, al soltar, vuelve a su lugar.
    await dragHold(page, 0.8, -30, async () => {
      expect(await page.evaluate(() => (window as any).__flow.turns.curl.t)).toBeGreaterThan(0);
    });
    await expect.poll(() => curlHidden(page)).toBe(true);
    expect(await pageNum(page)).toBe(1);
    expect((await baseFolios(page)).split(',')[0]).toBe('1');

    // Arrastre largo: mientras se sostiene, la página todavía no cambió; al soltar, avanza.
    await dragHold(page, 0.85, -170, async () => {
      const t = await page.evaluate(() => (window as any).__flow.turns.curl.t);
      expect(t).toBeGreaterThan(0.1);
      expect(t).toBeLessThan(0.95);
      expect(await pageNum(page)).toBe(1);
    });
    await expect.poll(() => pageNum(page)).toBe(1 + step);
    await expect.poll(() => curlHidden(page)).toBe(true);
    expect((await baseFolios(page)).split(',')[0]).toBe(String(1 + step));

    // Hacia atrás, desde la izquierda.
    await dragHold(page, 0.15, 170, async () => {
      const t = await page.evaluate(() => (window as any).__flow.turns.curl.t);
      expect(t).toBeGreaterThan(0.05);
      expect(t).toBeLessThan(0.9);
    });
    await expect.poll(() => pageNum(page)).toBe(1);
    await expect.poll(() => curlHidden(page)).toBe(true);
  });

  test('horizontal con animación en PDF: la página original se dobla al avanzar y al retroceder', async ({ page }) => {
    await importAndOpen(page, 'texto.pdf');
    await waitBookReady(page);
    await setNav(page, { curl: true });
    const first = await progressText(page);
    let frames = await record(page, () => tapAt(page, 0.9, 0.5));
    expectCurl(frames, true);
    await expect(page.locator('[data-testid=progress-text]')).not.toHaveText(first);
    const second = await progressText(page);
    frames = await record(page, () => page.keyboard.press('ArrowLeft'));
    expectCurl(frames, false);
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(first);

    // Pases rápidos: al final se ve la página correcta, con su dibujo.
    for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
    await expect.poll(() => curlHidden(page)).toBe(true);
    const label = (await progressText(page)).match(/^Pág\. ([^\s–]+)/)![1]!;
    await expect(page.locator('.pdf-stage > .pdf-spread .pdf-page.is-ready canvas').first()).toBeVisible();
    expect((await baseFolios(page)).split(',')[0]).toBe(label);
    expect(second).not.toBe(first);
  });

  test('cambiar la dirección o la animación conserva la posición', async ({ page }) => {
    for (const file of ['ensayo.docx', 'texto.pdf']) {
      await importAndOpen(page, file);
      await waitBookReady(page);
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);
      const before = { text: await progressText(page), folios: await baseFolios(page), pos: await readerPos(page) };
      for (const opts of [{ curl: true }, { direction: 'vertical' as const }, { direction: 'horizontal' as const }, { curl: false }]) {
        await setNav(page, opts);
        expect(await progressText(page)).toBe(before.text);
        expect(await baseFolios(page)).toBe(before.folios);
        expect(await readerPos(page)).toEqual(before.pos);
      }
      await page.goto('/');
      await page.evaluate(() => localStorage.removeItem('renglon.settings'));
    }
  });

  test('el modo renglón no cambia con la navegación vertical ni con la animación', async ({ page }) => {
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    await setNav(page, { curl: true, direction: 'vertical' });
    await toFocus(page);
    const a = await active(page);
    await tapAt(page, 0.7, 0.5);
    await page.waitForTimeout(350);
    const b = await active(page);
    expect(b.b === a.b ? b.k === a.k + 1 : b.b > a.b && b.k === 0).toBe(true);
    await page.click('[data-testid=line-back]');
    await page.waitForTimeout(350);
    const c = await active(page);
    expect({ b: c.b, k: c.k }).toEqual({ b: a.b, k: a.k });
    await toBook(page);
    expect(await curlHidden(page)).toBe(true);
    await expect(page.locator('[data-testid=progress-text]')).toHaveText(/^Pág\. 1\b/);
  });

  test('la biblioteca muestra el lema nuevo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.brand-name')).toHaveText('Knowmadic');
    await expect(page.locator('.brand-tag')).toHaveText('Un lugar para leer. Un espacio para pensar.');
  });
});
