import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { CLUB_MIN_AGE } from '../../src/config/community';
import { canUse } from '../../src/lib/access';
import { ageOn, birthDateProblem, localDate, parseIsoDate, type CalendarDate } from '../../src/lib/age';
import { isServiceError } from '../../src/services/errors';
import { LocalBackend } from '../../src/services/localBackend';
import { validateBirthDate } from '../../src/services/rules';
import type { User } from '../../src/services/types';

// localStorage mínimo para la sesión (Node no lo trae).
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

const day = (s: string): CalendarDate => parseIsoDate(s)!;
const asError = async (p: Promise<unknown>) => {
  try {
    await p;
  } catch (e) {
    return e;
  }
  throw new Error('se esperaba un error');
};

/** Fecha de nacimiento de alguien que hoy cumple `years` años (o los cumple dentro de `daysLeft` días). */
function bornYearsAgo(years: number, daysLeft = 0): string {
  const now = new Date();
  const d = new Date(now.getFullYear() - years, now.getMonth(), now.getDate() + daysLeft, 12);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

describe('edad cumplida', () => {
  it('la edad mínima del Reading Club es 16', () => {
    expect(CLUB_MIN_AGE).toBe(16);
  });

  it('se cumplen años el mismo día y mes, no antes', () => {
    expect(ageOn('2010-06-15', day('2026-06-14'))).toBe(15);
    expect(ageOn('2010-06-15', day('2026-06-15'))).toBe(16);
    expect(ageOn('2010-06-15', day('2026-06-16'))).toBe(16);
    expect(ageOn('2010-12-31', day('2027-01-01'))).toBe(16);
    expect(ageOn('2010-01-01', day('2026-12-31'))).toBe(16);
  });

  it('29 de febrero: en los años no bisiestos se cumplen el 1 de marzo', () => {
    expect(ageOn('2008-02-29', day('2025-02-28'))).toBe(16);
    expect(ageOn('2008-02-29', day('2025-03-01'))).toBe(17);
    expect(ageOn('2008-02-29', day('2024-02-28'))).toBe(15);
    expect(ageOn('2008-02-29', day('2024-02-29'))).toBe(16);
    // 2100 no es bisiesto (divisible por 100 y no por 400): 16 años justos sin 29 de febrero.
    expect(ageOn('2084-02-29', day('2100-02-28'))).toBe(15);
    expect(ageOn('2084-02-29', day('2100-03-01'))).toBe(16);
  });

  it('nacer hoy es válido (cero años); una fecha futura no', () => {
    expect(ageOn('2026-10-22', day('2026-10-22'))).toBe(0);
    expect(ageOn('2026-10-23', day('2026-10-22'))).toBeNull();
    expect(birthDateProblem('2026-10-23', day('2026-10-22'))).toBe('future');
  });

  it('rechaza fechas inexistentes, mal escritas o anteriores a 1900', () => {
    for (const s of ['2023-02-29', '2024-04-31', '2024-13-01', '2024-00-10', '2024-01-00', '2024-1-5', '05/01/2010', '', 'hoy', '2010-05-01T00:00']) {
      expect(parseIsoDate(s), s).toBeNull();
      expect(ageOn(s, day('2026-10-22')), s).toBeNull();
      expect(birthDateProblem(s, day('2026-10-22')), s).toBe('invalid');
    }
    expect(parseIsoDate('2024-02-29')).toEqual({ y: 2024, m: 2, d: 29 });
    expect(parseIsoDate('2000-02-29')).toEqual({ y: 2000, m: 2, d: 29 });
    expect(parseIsoDate('1900-02-29')).toBeNull();
    expect(birthDateProblem('1899-12-31', day('2026-10-22'))).toBe('too-old');
    expect(birthDateProblem('1900-01-01', day('2026-10-22'))).toBeNull();
    expect(ageOn(null)).toBeNull();
    expect(ageOn(undefined)).toBeNull();
  });

  it('la fecha de hoy es la del calendario local', () => {
    expect(localDate(new Date(2026, 1, 3, 23, 59))).toEqual({ y: 2026, m: 2, d: 3 });
  });

  it('el servicio valida la fecha con mensajes claros', () => {
    const today = day('2026-10-22');
    expect(validateBirthDate(' 2000-05-10 ', today)).toBe('2000-05-10');
    const message = (v: unknown) => {
      try {
        validateBirthDate(v, today);
      } catch (e) {
        expect(isServiceError(e, 'invalid')).toBe(true);
        return (e as Error).message;
      }
      throw new Error('se esperaba un error');
    };
    expect(message('')).toBe('Falta completar: fecha de nacimiento.');
    expect(message('2027-01-01')).toBe('La fecha de nacimiento no puede ser posterior a hoy.');
    expect(message('1800-01-01')).toBe('Revisá el año de nacimiento: tiene que ser 1900 o posterior.');
    expect(message('2023-02-29')).toBe('La fecha de nacimiento no es válida.');
    expect(message(20000510)).toBe('Falta completar: fecha de nacimiento.');
  });
});

describe('acceso al Reading Club: sesión, edad y plan, en ese orden', () => {
  const base: User = { id: 'u1', username: 'ana', email: 'a@x.com', plan: 'free', createdAt: 0 };
  const today = day('2026-10-22');
  const with_ = (over: Partial<User>): User => ({ ...base, ...over });

  it('sin sesión pide iniciar sesión', () => {
    expect(canUse('club', null, today)).toEqual({ ok: false, reason: 'account' });
  });

  it('sin fecha de nacimiento la pide antes de ofrecer premium', () => {
    expect(canUse('club', with_({}), today)).toEqual({ ok: false, reason: 'age-unknown' });
    expect(canUse('club', with_({ birthDate: null }), today)).toEqual({ ok: false, reason: 'age-unknown' });
    expect(canUse('club', with_({ plan: 'premium' }), today)).toEqual({ ok: false, reason: 'age-unknown' });
  });

  it('menor de 16: no disponible por la edad, tenga o no premium', () => {
    expect(canUse('club', with_({ birthDate: '2010-10-23' }), today)).toEqual({ ok: false, reason: 'age' });
    expect(canUse('club', with_({ birthDate: '2010-10-23', plan: 'premium' }), today)).toEqual({ ok: false, reason: 'age' });
    expect(canUse('club', with_({ birthDate: '2020-01-01', plan: 'premium' }), today)).toEqual({ ok: false, reason: 'age' });
  });

  it('una fecha guardada que no da una edad (reloj atrasado) no habilita', () => {
    expect(canUse('club', with_({ birthDate: '2030-01-01', plan: 'premium' }), today)).toEqual({ ok: false, reason: 'age' });
  });

  it('16 o más con plan gratuito: el aviso de premium', () => {
    expect(canUse('club', with_({ birthDate: '2010-10-22' }), today)).toEqual({ ok: false, reason: 'premium' });
  });

  it('16 o más con premium: acceso (desde el día del cumpleaños)', () => {
    expect(canUse('club', with_({ birthDate: '2010-10-22', plan: 'premium' }), today)).toEqual({ ok: true });
    expect(canUse('club', with_({ birthDate: '1950-03-01', plan: 'premium' }), today)).toEqual({ ok: true });
  });

  it('la edad no afecta al resto de la app', () => {
    const minor = with_({ birthDate: '2015-01-01' });
    expect(canUse('bookMode', minor, today).ok).toBe(true);
    expect(canUse('reviewsWrite', minor, today).ok).toBe(true);
    expect(canUse('reviewsWrite', with_({}), today).ok).toBe(true);
    expect(canUse('pageCurl', with_({ birthDate: '2015-01-01', plan: 'premium' }), today).ok).toBe(true);
  });
});

describe('servicio local de prueba: fecha de nacimiento y Reading Club', () => {
  let n = 0;
  const fresh = () => {
    store.clear();
    return new LocalBackend(`edad-${++n}`);
  };
  beforeEach(() => store.clear());

  it('el registro no pide fecha de nacimiento', async () => {
    const b = fresh();
    const u = await b.signUp({ username: 'nina', email: 'nina@mail.com', password: 'secreto123' });
    expect(u.birthDate).toBeUndefined();
  });

  it('guardar la fecha requiere sesión y una fecha válida', async () => {
    const b = fresh();
    expect(isServiceError(await asError(b.setBirthDate('2000-01-01')), 'auth-required')).toBe(true);
    await b.signUp({ username: 'ana', email: 'ana@mail.com', password: 'secreto123' });
    for (const bad of ['2023-02-29', '3000-01-01', '1800-01-01', 'ayer', '']) {
      expect(isServiceError(await asError(b.setBirthDate(bad)), 'invalid'), bad).toBe(true);
    }
    expect((await b.currentUser())?.birthDate).toBeUndefined();
  });

  it('una vez cargada, la fecha no se puede cambiar (ni volviendo a iniciar sesión)', async () => {
    const b = fresh();
    await b.signUp({ username: 'ana', email: 'ana@mail.com', password: 'secreto123' });
    const minor = bornYearsAgo(15);
    expect((await b.setBirthDate(minor)).birthDate).toBe(minor);
    const err = await asError(b.setBirthDate('1990-01-01'));
    expect(isServiceError(err, 'forbidden')).toBe(true);
    expect((err as Error).message).toContain('no se puede cambiar');
    await b.signOut();
    await b.signIn('ana@mail.com', 'secreto123');
    expect((await b.currentUser())?.birthDate).toBe(minor);
    expect(isServiceError(await asError(b.setBirthDate('1990-01-01')), 'forbidden')).toBe(true);
  });

  it('el club valida la edad en el servicio, además de en la interfaz', async () => {
    const b = fresh();
    await b.signUp({ username: 'ana', email: 'ana@mail.com', password: 'secreto123' });
    await b.dev.setPlan('premium');
    // Premium sin fecha: falta la edad.
    expect(isServiceError(await asError(b.listThreads({})), 'age-required')).toBe(true);
    expect(isServiceError(await asError(b.createThread({ title: 'Hola', body: 'Texto', category: 'General' })), 'age-required')).toBe(true);
    // Le falta un día para cumplir 16: no entra, aunque sea premium.
    await b.setBirthDate(bornYearsAgo(CLUB_MIN_AGE, 1));
    const err = await asError(b.listThreads({}));
    expect(isServiceError(err, 'age-restricted')).toBe(true);
    expect((err as Error).message).toBe('El Reading Club es para personas de 16 años o más.');
    expect(isServiceError(await asError(b.createThread({ title: 'Hola', body: 'Texto', category: 'General' })), 'age-restricted')).toBe(true);
    expect(isServiceError(await asError(b.listReplies({ authorId: 'x' })), 'age-restricted')).toBe(true);

    // Quien cumple 16 hoy, con premium, entra.
    await b.signUp({ username: 'beto', email: 'beto@mail.com', password: 'secreto123' });
    await b.setBirthDate(bornYearsAgo(CLUB_MIN_AGE));
    expect(isServiceError(await asError(b.listThreads({})), 'premium-required')).toBe(true);
    await b.dev.setPlan('premium');
    const th = await b.createThread({ title: '¿Qué leer?', body: 'Ideas', category: 'Preguntas' });
    expect((await b.listThreads({})).map((x) => x.id)).toEqual([th.id]);

    // La menor tampoco ve lo publicado por otros.
    await b.signIn('ana@mail.com', 'secreto123');
    expect(isServiceError(await asError(b.getThread(th.id)), 'age-restricted')).toBe(true);
    expect(isServiceError(await asError(b.createReply(th.id, 'Hola')), 'age-restricted')).toBe(true);
  });
});
