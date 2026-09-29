# -*- coding: utf-8 -*-
"""Prueba la app en WebKit, el motor de Safari, con WebKitGTK por WebDriver.

Playwright usa Chromium en las pruebas habituales; algunos fallos solo
aparecen en Safari (por ejemplo, la paginación del libro de Word o el guardado
de archivos en IndexedDB). Este guion recorre los mismos pasos que una persona
en el iPhone: cargar un Word y un PDF, pasar páginas, leer de a un renglón y
reconocer el texto de un PDF escaneado.

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


def main():
    opts = Options()
    opts.binary_location = MINIBROWSER
    opts.add_argument('--automation')
    d = webdriver.WebKitGTK(options=opts, service=Service('/usr/bin/WebKitWebDriver'))
    d.set_window_size(390, 844)
    w = WebDriverWait(d, 240)
    try:
        print('WebKit:', d.execute_script('return navigator.userAgent'))
        if cargar(d, w, 'ensayo.docx'):
            abrir_y_leer(d, w, 'ensayo.docx', 8)
        if cargar(d, w, 'texto.pdf'):
            abrir_y_leer(d, w, 'texto.pdf', 7)
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
