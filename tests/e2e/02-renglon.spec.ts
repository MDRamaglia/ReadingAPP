import { expect, test } from '@playwright/test';
import { active, importAndOpen, isMobile, lineIndexOf, tapAt, toFocus, visualLineTops, waitBookReady } from './helpers';

test.describe('Modo concentración de renglón único', () => {
  test('cada toque avanza exactamente un renglón visual, también entre párrafos y títulos', async ({ page }) => {
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    await toFocus(page);

    const tops = await visualLineTops(page);
    expect(tops.length).toBeGreaterThan(100);
    let a = await active(page);
    let idx = lineIndexOf(tops, a.top);
    expect(idx).toBe(0);
    const blocksSeen = new Set<number>([a.b]);

    for (let i = 1; i <= 30; i++) {
      await tapAt(page, 0.7, 0.3 + (i % 4) * 0.12);
      a = await active(page);
      const now = lineIndexOf(tops, a.top);
      expect(now, `toque ${i}`).toBe(idx + 1);
      idx = now;
      blocksSeen.add(a.b);
    }
    // Se atravesaron varios párrafos y títulos sin ninguna acción distinta.
    expect(blocksSeen.size).toBeGreaterThan(4);

    // La banda de foco coincide con el renglón activo en pantalla (terminada la animación).
    await page.waitForTimeout(450);
    const inBand = await page.evaluate(() => {
      const f = (window as any).__focus.activeLine();
      const track = document.querySelector('.focus-track')!.getBoundingClientRect();
      const stage = document.querySelector('.focus-stage')!.getBoundingClientRect();
      const band = document.querySelector('.focus-band')!.getBoundingClientRect();
      const lineTop = track.top + f.top;
      const lineBottom = track.top + f.bottom;
      return { ok: lineTop >= band.top - 1 && lineBottom <= band.bottom + 1, bandTop: band.top - stage.top };
    });
    expect(inBand.ok).toBe(true);

    // Retroceder: tocando el lado izquierdo y con el control visible.
    await tapAt(page, 0.08, 0.5);
    a = await active(page);
    expect(lineIndexOf(tops, a.top)).toBe(idx - 1);
    await page.click('[data-testid=line-back]');
    a = await active(page);
    expect(lineIndexOf(tops, a.top)).toBe(idx - 2);

    // Teclado (computadora).
    if (!isMobile(page)) {
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      a = await active(page);
      expect(lineIndexOf(tops, a.top)).toBe(idx);
      await page.keyboard.press('ArrowUp');
      a = await active(page);
      expect(lineIndexOf(tops, a.top)).toBe(idx - 1);
    }
  });

  test('la transición es suave y el texto circundante se atenúa', async ({ page }) => {
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    await toFocus(page);
    const style = await page.evaluate(() => {
      const t = getComputedStyle(document.querySelector('.focus-track')!);
      const v = getComputedStyle(document.querySelector('.veil-bottom')!);
      return { prop: t.transitionProperty, dur: t.transitionDuration, veil: v.backgroundColor };
    });
    expect(style.prop).toContain('transform');
    expect(parseFloat(style.dur)).toBeGreaterThan(0.15);
    expect(style.veil).toMatch(/rgba\(.+0\.8\d?\)/);
    // A mitad de la animación el texto está entre la posición vieja y la nueva.
    const before = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.focus-track')!).transform).m42);
    await tapAt(page, 0.7, 0.5);
    await page.waitForTimeout(60);
    const mid = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.focus-track')!).transform).m42);
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.focus-track')!).transform).m42);
    expect(after).toBeLessThan(before);
    expect(mid).toBeLessThan(before);
    expect(mid).toBeGreaterThan(after);
  });

  test('al cambiar la letra, el ancho, el interlineado o girar el celular, recalcula sin perder el lugar', async ({ page }) => {
    await importAndOpen(page, 'ensayo.docx');
    await waitBookReady(page);
    await toFocus(page);
    for (let i = 0; i < 40; i++) await page.evaluate(() => (window as any).__focus.next());
    await page.waitForTimeout(300);
    const start = await active(page);
    const target = start.pos;

    const holds = async (label: string) => {
      await page.waitForTimeout(700);
      const a = await active(page);
      // El renglón activo es el que contiene el mismo carácter del texto.
      expect(a.b, label).toBe(target.b);
      expect(a.o, label).toBeLessThanOrEqual(target.o);
      if (a.nextO !== null) expect(a.nextO, label).toBeGreaterThan(target.o);
      return a;
    };

    await page.click('[data-testid=open-settings]');
    const sheet = page.locator('[data-testid=settings-sheet]');
    for (let i = 0; i < 4; i++) await sheet.getByRole('button', { name: 'Agrandar letra' }).click();
    const bigger = await holds('letra más grande');
    expect(bigger.bottom - bigger.top).toBeGreaterThan(start.bottom - start.top);

    await sheet.getByLabel('Ancho de lectura').fill('24');
    await holds('ancho');
    await sheet.getByLabel('Interlineado').fill('2');
    await holds('interlineado');
    await sheet.getByRole('radio', { name: /Sepia/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'sepia');
    await sheet.getByRole('radio', { name: /Oscuro/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.keyboard.press('Escape');

    if (isMobile(page)) {
      const vp = page.viewportSize()!;
      await page.setViewportSize({ width: vp.height, height: vp.width });
      await holds('celular girado');
      await page.setViewportSize(vp);
      await holds('celular derecho');
    } else {
      await page.setViewportSize({ width: 900, height: 1100 });
      await holds('ventana angosta');
    }
  });
});
