import { afterEach, describe, expect, it } from 'vitest';
import { FEATURES, PLANS } from '../../src/config/plans';
import { REVIEW_CATEGORIES, CLUB_CATEGORIES, clubCategoryLabel, reviewCategoryLabel } from '../../src/config/community';
import { en } from '../../src/i18n/en';
import { es, type Message, type Messages } from '../../src/i18n/es';
import { detectLocale, fmtDate, fmtNumber, getLocale, setLocale, t, type Key } from '../../src/i18n';
import { pt } from '../../src/i18n/pt';
import { libraryUsage } from '../../src/lib/access';
import { listLabels } from '../../src/import/pdf';
import type { PageInfo } from '../../src/lib/types';

const placeholders = (m: Message): Set<string> => {
  const texts = typeof m === 'string' ? [m] : Object.values(m);
  return new Set(texts.flatMap((s) => [...(s ?? '').matchAll(/\{(\w+)\}/g)].map((x) => x[1]!)));
};

afterEach(() => setLocale('es'));

describe('archivos de idioma', () => {
  for (const [name, table] of [
    ['en', en],
    ['pt', pt],
  ] as Array<[string, Messages]>) {
    it(`${name} no tiene claves que no existan en es`, () => {
      const unknown = Object.keys(table).filter((k) => !(k in es));
      expect(unknown).toEqual([]);
    });

    it(`${name} respeta los datos ({…}) y los plurales del español`, () => {
      for (const [key, msg] of Object.entries(table) as Array<[Key, Message]>) {
        const base = es[key];
        expect(typeof msg === 'string', key).toBe(typeof base === 'string');
        if (typeof msg !== 'string') expect(msg.other, key).toBeTruthy();
        for (const p of placeholders(msg)) expect(placeholders(base).has(p), `${key}: {${p}}`).toBe(true);
      }
    });
  }

  it('cada texto con formas tiene «other» y no hay textos vacíos', () => {
    for (const [key, msg] of Object.entries(es) as Array<[Key, Message]>) {
      if (typeof msg === 'string') expect(msg.trim(), key).not.toBe('');
      else expect(msg.other?.trim(), key).toBeTruthy();
    }
  });

  it('cada categoría guardada tiene su etiqueta', () => {
    for (const c of REVIEW_CATEGORIES) expect(`reviewCategory.${c}` in es, c).toBe(true);
    for (const c of CLUB_CATEGORIES) expect(`clubCategory.${c}` in es, c).toBe(true);
  });
});

describe('t()', () => {
  it('interpola y elige el plural', () => {
    expect(t('club.replies', { count: 1 })).toBe('1 respuesta');
    expect(t('club.replies', { count: 0 })).toBe('0 respuestas');
    expect(t('club.replies', { count: 2 })).toBe('2 respuestas');
    expect(t('library.count.ofLimit', { used: 3, count: 5 })).toBe('3 de 5 archivos');
    expect(t('import.error.unreadable', { name: 'a.pdf' })).toBe('No se pudo leer «a.pdf».');
    // Un dato que falta queda a la vista, para notarlo.
    expect(t('import.error.unreadable')).toBe('No se pudo leer «{name}».');
  });

  it('sin traducción cae al español, también en los plurales', () => {
    setLocale('en');
    expect(getLocale()).toBe('en');
    expect(t('club.replies', { count: 1 })).toBe('1 respuesta');
    expect(t('nav.library')).toBe('Biblioteca');
  });

  it('usa la traducción cuando existe (con las reglas de plural del idioma)', () => {
    const table = en as Record<string, Message>;
    table['club.replies'] = { one: '{count} reply', other: '{count} replies' };
    try {
      setLocale('en');
      expect(t('club.replies', { count: 1 })).toBe('1 reply');
      expect(t('club.replies', { count: 3 })).toBe('3 replies');
      setLocale('pt');
      expect(t('club.replies', { count: 3 })).toBe('3 respuestas');
    } finally {
      delete table['club.replies'];
    }
  });

  it('el idioma del dispositivo solo se elige si está habilitado (hoy, español)', () => {
    expect(detectLocale(['es-AR'])).toBe('es');
    expect(detectLocale(['en-US', 'pt-BR'])).toBe('es');
    expect(detectLocale([])).toBe('es');
  });

  it('fechas y números con el formato del idioma', () => {
    const d = new Date(2026, 9, 22, 12);
    expect(fmtDate(d)).toBe('22 de octubre de 2026');
    expect(fmtNumber(10000)).toBe('10.000');
    setLocale('en');
    expect(fmtDate(d)).toBe('October 22, 2026');
    expect(fmtNumber(10000)).toBe('10,000');
    setLocale('pt');
    expect(fmtDate(d)).toBe('22 de outubro de 2026');
  });
});

describe('textos de configuración, leídos al mostrarlos', () => {
  it('los planes y la biblioteca conservan sus textos', () => {
    expect(PLANS.free.name).toBe('Gratuito');
    expect(PLANS.free.price).toBe('Sin costo');
    expect(PLANS.premium.price).toBeNull();
    expect(FEATURES.find((f) => f.id === 'library')!.free.label).toBe('Hasta 5 archivos');
    expect(libraryUsage(1, 'premium').label).toBe('1 archivo');
    expect(libraryUsage(2, 'free').label).toBe('2 de 5 archivos');
  });

  it('las categorías separan el valor guardado de la etiqueta', () => {
    expect(reviewCategoryLabel('Biografía y memorias')).toBe('Biografía y memorias');
    expect(clubCategoryLabel('Textos propios')).toBe('Textos propios');
    // Un valor que ya no está en la lista (datos antiguos) se muestra tal cual.
    expect(reviewCategoryLabel('Teatro')).toBe('Teatro');
  });

  it('las listas de páginas', () => {
    const pages = Array.from({ length: 20 }, (_, i) => ({ label: String(i + 1) }) as PageInfo);
    expect(listLabels(pages, [2])).toBe('3');
    expect(listLabels(pages, [2, 4])).toBe('3 y 5');
    expect(listLabels(pages, [0, 1, 8])).toBe('1, 2 y 9');
    expect(listLabels(pages, Array.from({ length: 15 }, (_, i) => i))).toBe('1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 y 3 más');
  });
});
