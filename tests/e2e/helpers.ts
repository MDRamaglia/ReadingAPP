import { expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const fixture = (name: string) => resolve(here, '..', 'fixtures', name);
export const artifacts = (name: string) => {
  const p = resolve(here, '..', '.artifacts', name);
  mkdirSync(dirname(p), { recursive: true });
  return p;
};

export interface ActiveLine {
  b: number;
  k: number;
  count: number;
  o: number;
  nextO: number | null;
  top: number;
  bottom: number;
  pos: { b: number; o: number };
}

export async function importFile(page: Page, name: string) {
  await page.goto('/');
  await page.setInputFiles('[data-testid=file-input]', fixture(name));
  await expect(page.locator('[data-testid=import-result], [data-testid=import-error]')).toBeVisible({ timeout: 60_000 });
}

export async function importAndOpen(page: Page, name: string) {
  await importFile(page, name);
  await page.click('[data-testid=import-open]');
  await expect(page.locator('[data-testid=reader]')).toBeVisible();
}

export async function waitBookReady(page: Page) {
  await expect(page.locator('[data-testid=book-stage]')).toBeVisible();
  await expect(page.locator('[data-testid=progress-text]')).toContainText('Pág.');
  await page.waitForTimeout(400);
}

export async function toFocus(page: Page) {
  await page.click('[data-testid=mode-focus]');
  await expect(page.locator('[data-testid=focus-stage]')).toBeVisible();
  await page.waitForFunction(() => !!(window as any).__focus && (window as any).__focus.activeLine().count > 0);
  await page.waitForTimeout(350);
}

export async function toBook(page: Page) {
  await page.click('[data-testid=mode-book]');
  await waitBookReady(page);
}

export const active = (page: Page): Promise<ActiveLine> => page.evaluate(() => (window as any).__focus.activeLine());

/**
 * Medición independiente de los renglones que efectivamente se ven: cajas de
 * texto e imágenes del modo renglón, agrupadas por altura. Devuelve los bordes
 * superiores relativos al comienzo del texto.
 */
export const visualLineTops = (page: Page): Promise<number[]> =>
  page.evaluate(() => {
    const track = document.querySelector('.focus-track')!;
    const origin = track.getBoundingClientRect().top;
    const boxes: Array<{ top: number; bottom: number }> = [];
    const w = document.createTreeWalker(track, NodeFilter.SHOW_TEXT);
    const r = document.createRange();
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      r.selectNodeContents(n);
      for (const rect of Array.from(r.getClientRects())) if (rect.width > 0.5 && rect.height > 0) boxes.push({ top: rect.top - origin, bottom: rect.bottom - origin });
    }
    track.querySelectorAll('img').forEach((img) => {
      const rect = img.getBoundingClientRect();
      if (rect.height > 0) boxes.push({ top: rect.top - origin, bottom: rect.bottom - origin });
    });
    boxes.sort((a, b) => a.top - b.top);
    const lines: Array<{ top: number; bottom: number }> = [];
    for (const b of boxes) {
      const last = lines[lines.length - 1];
      const inter = last ? Math.min(last.bottom, b.bottom) - Math.max(last.top, b.top) : -1;
      if (last && inter > 0.5 * Math.min(last.bottom - last.top, b.bottom - b.top)) {
        last.top = Math.min(last.top, b.top);
        last.bottom = Math.max(last.bottom, b.bottom);
      } else lines.push({ ...b });
    }
    return lines.map((l) => Math.round(l.top));
  });

export function lineIndexOf(tops: number[], top: number): number {
  let best = -1;
  let dist = Infinity;
  tops.forEach((t, i) => {
    const d = Math.abs(t - top);
    if (d < dist) {
      dist = d;
      best = i;
    }
  });
  return dist <= 3 ? best : -1;
}

export const hasTouch = (page: Page) => page.evaluate(() => navigator.maxTouchPoints > 0);

/** Toque real: pantalla táctil en el celular, clic en la computadora. */
export async function tapAt(page: Page, fx: number, fy: number) {
  const box = (await page.locator('.reader-stage').boundingBox())!;
  const x = box.x + box.width * fx;
  const y = box.y + box.height * fy;
  const touch = await hasTouch(page);
  if (touch) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

/** Deslizamiento con eventos táctiles reales (CDP) o arrastre de mouse. */
export async function swipe(page: Page, dx: number, dy: number) {
  const box = (await page.locator('.reader-stage').boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const touch = await hasTouch(page);
  if (touch) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 6; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (dx * i) / 6, y: y + (dy * i) / 6 }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx, y + dy, { steps: 6 });
    await page.mouse.up();
  }
}

export const progressText = (page: Page) => page.locator('[data-testid=progress-text]').innerText();

/** Lee toda la base local (para verificar lo guardado). */
export const readDb = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<{ docs: any[]; content: any[]; progress: any[]; assets: number }>((res) => {
        const req = indexedDB.open('renglon');
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(['docs', 'content', 'progress', 'assets']);
          const docs = tx.objectStore('docs').getAll();
          const content = tx.objectStore('content').getAll();
          const progress = tx.objectStore('progress').getAll();
          const assets = tx.objectStore('assets').count();
          tx.oncomplete = () => res({ docs: docs.result, content: content.result, progress: progress.result, assets: assets.result });
        };
      }),
  );

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1000) < 700;
