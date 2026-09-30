# -*- coding: utf-8 -*-
"""Prueba la app en WebKit, el motor de Safari, con WebKitGTK por WebDriver.

Playwright usa Chromium en las pruebas habituales; algunos fallos solo
aparecen en Safari (por ejemplo, la paginación del libro de Word o el guardado
de archivos en IndexedDB). Este guion recorre los mismos pasos que una persona
en el iPhone: crear una cuenta (premium con el panel de desarrollo), cargar un
Word y un PDF, pasar páginas (en horizontal, con la animación de hoja y en
vertical), leer de a un renglón, publicar y buscar una reseña y reconocer el
texto de un PDF escaneado.

Requisitos (Ubuntu/Debian):
    sudo apt-get install webkit2gtk-driver xvfb
    pip install selenium

Uso, con la app servida (npm run build && npm run preview):
    xvfb-run -a python3 scripts/webkit/probar_safari.py [http://127.0.0.1:4173/]
"""
import os
import sys
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.webkitgtk.options import Options
from selenium.webdriver.webkitgtk.service import Service

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:4173/'
FIX = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'tests', 'fixtures'))
MINIBROWSER = '/usr/lib/x86_64-linux-gnu/webkit2gtk-4.1/MiniBrowser'
ERR_HOOK = (
    "window.__errs=[];"
    "addEventListener('error',e=>__errs.push(String(e.message)));"
    "addEventListener('unhandledrejection',e=>__errs.push(String(e.reason&&(e.reason.message||e.reason))));"
)
fallas = []


def comprobar(cond, texto):
    print(('  ✓ ' if cond else '  ✗ ') + texto)
    if not cond:
        fallas.append(texto)


def progreso(d):
    return d.execute_script("return document.querySelector('[data-testid=progress-text]').textContent")


def cargar(d, w, nombre):
    d.get(BASE)
    w.until(lambda x: x.find_elements(By.CSS_SELECTOR, '[data-testid=file-input]'))
    d.execute_script(ERR_HOOK)
    d.find_element(By.CSS_SELECTOR, '[data-testid=file-input]').send_keys(os.path.join(FIX, nombre))
    w.until(lambda x: x.find_elements(By.CSS_SELECTOR, '[data-testid=import-result],[data-testid=import-error]'))
    error = d.find_elements(By.CSS_SELECTOR, '[data-testid=import-error]')
    comprobar(not error, f'{nombre}: se importa' + (f' (error: {error[0].text})' if error else ''))
    return not error


def abrir_y_leer(d, w, nombre, pagina_min):
    d.find_element(By.CSS_SELECTOR, '[data-testid=import-open]').click()
    try:
        w.until(lambda x: x.execute_script("const r=window.__reader; return !!(r && r.report && r.report.pages)"))
    except Exception:
        comprobar(False, f'{nombre}: el lector abre (URL {d.current_url}; pantalla: '
                  + d.execute_script('return document.body.innerText.slice(0,200)').replace('\n', ' | ')
                  + f'; errores: {d.execute_script("return window.__errs")})')
        d.save_screenshot(f'/tmp/webkit-{nombre}.png')
        return
    time.sleep(1.5)
    total = d.execute_script('return window.__reader.report.pages')
    comprobar(total >= pagina_min, f'{nombre}: modo libro con {total} páginas (mínimo esperado {pagina_min})')
    antes = progreso(d)
    d.execute_script('window.__reader.handle.current.next()')
    time.sleep(0.8)
    comprobar(progreso(d) != antes, f'{nombre}: pasa de página ({antes} → {progreso(d)})')
    d.find_element(By.CSS_SELECTOR, '[data-testid=mode-focus]').click()
    w.until(lambda x: x.execute_script('return !!(window.__focus && window.__focus.activeLine().count)'))
    a = d.execute_script('return window.__focus.activeLine()')
    d.execute_script('window.__focus.next()')
    time.sleep(0.4)
    b = d.execute_script('return window.__focus.activeLine()')
    siguiente = (b['b'], b['k']) in [(a['b'], a['k'] + 1), (a['b'] + 1, 0)] or (b['b'] > a['b'] and b['k'] == 0)
    comprobar(siguiente, f'{nombre}: modo renglón avanza un renglón ({a["b"]}:{a["k"]} → {b["b"]}:{b["k"]})')
    errs = d.execute_script('return window.__errs')
    comprobar(not errs, f'{nombre}: sin errores de JavaScript {errs or ""}')


MUESTREO = """
const done = arguments[0];
const turns = window.__flow?.turns ?? window.__pdfTurns;
const rec = [];
const front = () => document.querySelector('.book-stage .curl-front');
const t0 = performance.now();
const loop = () => {
  const c = document.querySelector('.book-stage .curl');
  const f = front();
  rec.push({ visible: !!c && !c.hidden, t: turns && turns.curl ? turns.curl.t : null,
             clip: f ? getComputedStyle(f).clipPath : '' });
  if (performance.now() - t0 < 1300) requestAnimationFrame(loop); else done(rec);
};
requestAnimationFrame(loop);
window.__reader.handle.current.%s();
"""


def css(d, sel):
    return d.find_element(By.CSS_SELECTOR, sel)


def cuenta_premium(d, w):
    """Registro con el servicio local de prueba y plan premium desde el panel de desarrollo."""
    d.get(BASE + '?dev=1#/cuenta/registro')
    w.until(lambda x: x.find_elements(By.CSS_SELECTOR, '[name=username]'))
    d.execute_script(ERR_HOOK)
    nombre = 'safari%d' % int(time.time())
    for campo, valor in [('username', nombre), ('email', nombre + '@prueba.com'), ('password', 'secreto123'), ('confirm', 'secreto123')]:
        css(d, f'[name={campo}]').send_keys(valor)
    css(d, '[data-testid=signup-submit]').click()
    w.until(lambda x: x.find_elements(By.CSS_SELECTOR, '[data-testid=plan-card]'))
    comprobar(nombre in css(d, '.page-title').text, 'cuenta: se registra e inicia sesión (contraseña con PBKDF2 del navegador)')
    css(d, '[data-testid=dev-toggle]').click()
    css(d, '[data-testid=dev-plan-premium]').click()
    w.until(lambda x: x.execute_script("return document.querySelector('[data-testid=dev-plan-premium]').getAttribute('aria-checked') === 'true'"))
    css(d, '[data-testid=dev-toggle]').click()
    comprobar('Premium' in css(d, '[data-testid=profile-plan]').text, 'cuenta: pasa a premium con el panel de desarrollo')
    comprobar('Un lugar para leer. Un espacio para pensar.' in css(d, '.brand-tag').text, 'marca: se ve el lema debajo del nombre')
    errs = d.execute_script('return window.__errs')
    comprobar(not errs, f'cuenta: sin errores de JavaScript {errs or ""}')


def probar_resenas(d, w):
    """Publica una reseña y la busca sin tildes ni mayúsculas."""
    d.get(BASE + '#/resenas/nueva')
    w.until(lambda x: x.find_elements(By.CSS_SELECTOR, '[name=bookTitle]'))
    d.execute_script(ERR_HOOK)
    for campo, valor in [('bookTitle', 'El túnel'), ('bookAuthor', 'Ernesto Sábato'), ('title', 'Obsesión en primera persona'), ('body', 'Castel lo cuenta todo.')]:
        css(d, f'[name={campo}]').send_keys(valor)
    d.execute_script("const s=document.querySelector('[name=category]'); s.value='Novela'; s.dispatchEvent(new Event('change',{bubbles:true}))")
    css(d, '[data-testid=review-submit]').click()
    w.until(lambda x: x.find_elements(By.CSS_SELECTOR, '[data-testid=review-full]'))
    d.get(BASE + '#/resenas')
    w.until(lambda x: x.find_elements(By.CSS_SELECTOR, '[data-testid=review-search]'))
    css(d, '[data-testid=review-search]').send_keys('TUNEL sabato')
    time.sleep(0.8)
    titulos = d.execute_script("return [...document.querySelectorAll('[data-testid=review-card] .review-title')].map(e => e.textContent)")
    comprobar(titulos == ['Obsesión en primera persona'], f'reseñas: búsqueda sin tildes ni mayúsculas ({titulos})')
    errs = d.execute_script('return window.__errs')
    comprobar(not errs, f'reseñas: sin errores de JavaScript {errs or ""}')


# Preferencias de la cuenta con sesión iniciada (lib/settings.ts).
AJUSTES = "localStorage.setItem('renglon.settings.u.' + localStorage.getItem('knowmadic.local.session'), arguments[0])"


def probar_libro(d, w, nombre, pagina):
    """Modo libro con animación de hoja y en vertical (preferencias guardadas)."""
    for ajustes, titulo in [('{"pageCurl":true}', 'con animación de página'), ('{"bookDirection":"vertical","pageCurl":true}', 'vertical')]:
        d.get(BASE)
        d.execute_script(AJUSTES, ajustes)
        if not cargar(d, w, nombre):
            return
        d.find_element(By.CSS_SELECTOR, '[data-testid=import-open]').click()
        w.until(lambda x: x.execute_script("const r=window.__reader; return !!(r && r.report && r.report.pages)"))
        time.sleep(1.5)
        antes = progreso(d)
        cuadros = d.execute_async_script(MUESTREO % 'next')
        time.sleep(0.3)
        despues = progreso(d)
        comprobar(despues != antes, f'{nombre} {titulo}: pasa de página ({antes} → {despues})')
        intermedios = [c for c in cuadros if c['visible'] and c['t'] is not None and 0.05 < c['t'] < 0.95]
        if titulo == 'vertical':
            comprobar(not intermedios, f'{nombre} {titulo}: sin animación de hoja')
            clase = d.execute_script("const v=document.querySelector('.flow-view, .pdf-stage > .pdf-spread'); return v ? v.className : ''")
            comprobar('turn-next-v' in clase, f'{nombre} {titulo}: la página entra desde abajo ({clase})')
        else:
            recortes = {c['clip'][:5] for c in intermedios}
            comprobar(len(intermedios) > 5 and recortes == {'path('}, f'{nombre} {titulo}: la hoja se dobla ({len(intermedios)} cuadros, recorte {recortes})')
            comprobar(not cuadros[-1]['visible'], f'{nombre} {titulo}: la hoja se retira al terminar')
            cuadros = d.execute_async_script(MUESTREO % 'prev')
            time.sleep(0.3)
            comprobar(progreso(d) == antes, f'{nombre} {titulo}: retrocede ({progreso(d)})')
            ts = [c['t'] for c in cuadros if c['visible'] and c['t'] is not None and 0.05 < c['t'] < 0.95]
            comprobar(len(ts) > 5 and all(b <= a + 1e-6 for a, b in zip(ts, ts[1:])), f'{nombre} {titulo}: al retroceder la hoja vuelve ({len(ts)} cuadros)')
        errs = d.execute_script('return window.__errs')
        comprobar(not errs, f'{nombre} {titulo}: sin errores de JavaScript {errs or ""}')
    d.get(BASE)
    d.execute_script(AJUSTES, '{}')


def main():
    opts = Options()
    opts.binary_location = MINIBROWSER
    opts.add_argument('--automation')
    d = webdriver.WebKitGTK(options=opts, service=Service('/usr/bin/WebKitWebDriver'))
    d.set_window_size(390, 844)
    w = WebDriverWait(d, 240)
    try:
        print('WebKit:', d.execute_script('return navigator.userAgent'))
        cuenta_premium(d, w)
        if cargar(d, w, 'ensayo.docx'):
            abrir_y_leer(d, w, 'ensayo.docx', 8)
        if cargar(d, w, 'texto.pdf'):
            abrir_y_leer(d, w, 'texto.pdf', 7)
        probar_libro(d, w, 'ensayo.docx', 8)
        probar_libro(d, w, 'texto.pdf', 7)
        probar_resenas(d, w)
        if cargar(d, w, 'escaneado.pdf'):
            d.find_element(By.CSS_SELECTOR, '[data-testid=ocr-start]').click()
            w.until(lambda x: x.find_elements(By.CSS_SELECTOR, '[data-testid=ocr-done]'))
            texto = d.execute_script("return document.querySelector('[data-testid=import-result]').textContent")
            comprobar('Reconocimiento terminado' in texto, 'escaneado.pdf: el OCR termina')
            comprobar('fallido en la página 3' in texto, 'escaneado.pdf: avisa la página degradada')
    finally:
        d.quit()
    print('\nResultado:', 'todo bien' if not fallas else f'{len(fallas)} fallas')
    sys.exit(1 if fallas else 0)


if __name__ == '__main__':
    main()
