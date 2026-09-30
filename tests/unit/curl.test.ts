import { describe, expect, it } from 'vitest';
import { foldAt } from '../../src/reader/curl';

type Pt = { x: number; y: number };

const area = (poly: Pt[]) =>
  Math.abs(poly.reduce((s, p, i) => {
    const q = poly[(i + 1) % poly.length]!;
    return s + p.x * q.y - q.x * p.y;
  }, 0)) / 2;

const apply = (m: number[], p: Pt): Pt => ({ x: m[0]! * p.x + m[2]! * p.y + m[4]!, y: m[1]! * p.x + m[3]! * p.y + m[5]! });

const W = 390;
const H = 700;

describe('pliegue de la hoja (animación de página)', () => {
  it('con la hoja apoyada no hay pliegue', () => {
    expect(foldAt(0, W, H)).toBeNull();
  });

  it('la hoja no pierde ni gana superficie: apoyada + levantada = hoja entera', () => {
    for (const t of [0.05, 0.2, 0.5, 0.8, 0.97]) {
      const f = foldAt(t, W, H)!;
      expect(area(f.flat) + area(f.lifted)).toBeCloseTo(W * H, 3);
      expect(area(f.flipped)).toBeCloseTo(area(f.lifted), 3);
    }
  });

  it('la parte doblada es el reflejo exacto de la levantada y queda del lado del lomo', () => {
    for (const t of [0.1, 0.4, 0.7]) {
      const f = foldAt(t, W, H)!;
      f.lifted.forEach((p, i) => {
        const r = apply(f.matrix, p);
        expect(r.x).toBeCloseTo(f.flipped[i]!.x, 6);
        expect(r.y).toBeCloseTo(f.flipped[i]!.y, 6);
        // Los puntos reflejados están del otro lado del pliegue (o sobre él).
        expect((r.x - f.m.x) * f.n.x + (r.y - f.m.y) * f.n.y).toBeLessThanOrEqual(1e-6);
      });
    }
  });

  it('empieza por la esquina, avanza de a poco y termina del otro lado del lomo', () => {
    const lifted = [0.05, 0.25, 0.5, 0.75, 0.95].map((t) => area(foldAt(t, W, H)!.lifted));
    for (let i = 1; i < lifted.length; i++) expect(lifted[i]!).toBeGreaterThan(lifted[i - 1]!);
    expect(lifted[0]!).toBeLessThan(W * H * 0.02);
    const end = foldAt(1, W, H)!;
    expect(area(end.flat)).toBeLessThan(1);
    for (const p of end.flipped) expect(p.x).toBeLessThanOrEqual(1e-6);
  });

  it('el lomo no se mueve: la esquina doblada nunca se aleja de él más que el ancho de la hoja', () => {
    for (let t = 0.02; t < 1; t += 0.02) {
      const f = foldAt(t, W, H)!;
      const corner = apply(f.matrix, { x: W, y: H });
      expect(Math.hypot(corner.x, corner.y - H)).toBeLessThanOrEqual(W + 1e-6);
      // Mientras no pasó la mitad, el borde del lomo sigue apoyado.
      if (t < 0.45) {
        for (const p of [{ x: 0, y: 0 }, { x: 0, y: H }]) expect((p.x - f.m.x) * f.n.x + (p.y - f.m.y) * f.n.y).toBeLessThan(0);
      }
    }
  });

  it('tomada de arriba, la hoja se dobla por la esquina superior', () => {
    const top = foldAt(0.1, W, H, 'top')!;
    const bottom = foldAt(0.1, W, H, 'bottom')!;
    const inLifted = (f: typeof top, p: Pt) => (p.x - f.m.x) * f.n.x + (p.y - f.m.y) * f.n.y > 0;
    expect(inLifted(top, { x: W, y: 0 })).toBe(true);
    expect(inLifted(top, { x: W, y: H })).toBe(false);
    expect(inLifted(bottom, { x: W, y: H })).toBe(true);
    expect(area(top.lifted)).toBeCloseTo(area(bottom.lifted), 6);
  });
});
