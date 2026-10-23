# -*- coding: utf-8 -*-
"""QA: fecha de nacimiento y Reading Club en WebKit (motor de Safari).

Uso: xvfb-run -a python3 -I safari_club.py http://127.0.0.1:4181/
"""
import sys
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.webkitgtk.options import Options
from selenium.webdriver.webkitgtk.service import Service

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:4181/'
OUT = '/tmp/claude-0/-home-user-ReadingAPP/885a9db0-4337-5129-9273-a94ec4c04d58/scratchpad/evidencia'
ERR_HOOK = (
    "window.__errs=window.__errs||[];"
    "addEventListener('error',e=>__errs.push(String(e.message)));"
    "addEventListener('unhandledrejection',e=>__errs.push(String(e.reason&&(e.reason.message||e.reason))));"
)
fallas = []
total = 0


def comprobar(cond, texto):
    global total
    total += 1
    print(('  ✓ ' if cond else '  ✗ ') + texto)
    if not cond:
        fallas.append(texto)


def css(d, sel):
    return d.find_element(By.CSS_SELECTOR, sel)


def hay(d, sel):
    return len(d.find_elements(By.CSS_SELECTOR, sel)) > 0


def pulsar(d, sel):
    el = css(d, sel)
    d.execute_script("arguments[0].scrollIntoView({block: 'center'})", el)
    el.click()


def ir(d, w, hash_, sel):
    d.get(BASE + hash_)
    w.until(lambda x: x.find_elements(By.CSS_SELECTOR, sel))
    d.execute_script(ERR_HOOK)
    time.sleep(0.3)


def cuenta(d, w, premium):
    nombre = 'wk%d' % int(time.time() * 1000)
    ir(d, w, '?dev=1#/cuenta/registro', '[name=username]')
    for campo, valor in [('username', nombre), ('email', nombre + '@prueba.com'), ('password', 'secreto123'), ('confirm', 'secreto123')]:
        css(d, f'[name={campo}]').send_keys(valor)
    pulsar(d, '[data-testid=signup-submit]')
    w.until(lambda x: x.find_elements(By.CSS_SELECTOR, '[data-testid=plan-card]'))
    if premium:
        css(d, '[data-testid=dev-toggle]').click()
        css(d, '[data-testid=dev-plan-premium]').click()
        w.until(lambda x: x.execute_script("return document.querySelector('[data-testid=dev-plan-premium]').getAttribute('aria-checked') === 'true'"))
        css(d, '[data-testid=dev-toggle]').click()
    return nombre


def salir(d, w):
    ir(d, w, '#/cuenta', '[data-testid=signout]')
    pulsar(d, '[data-testid=signout]')
    w.until(lambda x: 'Ingresar' in x.execute_script("return document.querySelector('[data-testid=account-chip]').textContent"))


def cargar_fecha(d, w, fecha, tipeando=False):
    ir(d, w, '#/club', '[data-testid=club-birth]')
    campo = css(d, '[name=birthDate]')
    tipo = d.execute_script('return arguments[0].type', campo)
    if tipeando:
        campo.send_keys(fecha)
    else:
        # Como lo haría el selector nativo: valor ISO y evento input.
        d.execute_script(
            "const i=arguments[0]; const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;"
            "s.call(i, arguments[1]); i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true}));",
            campo, fecha)
    valor = d.execute_script('return arguments[0].value', campo)
    pulsar(d, '[data-testid=birth-submit]')
    time.sleep(0.5)
    return tipo, valor


def main():
    opts = Options()
    opts.binary_location = '/usr/lib/x86_64-linux-gnu/webkit2gtk-4.1/MiniBrowser'
    opts.add_argument('--automation')
    d = webdriver.WebKitGTK(options=opts, service=Service('/usr/bin/WebKitWebDriver'))
    d.set_window_size(390, 844)
    w = WebDriverWait(d, 60)
    try:
        print('WebKit:', d.execute_script('return navigator.userAgent'))
        hoy = d.execute_script("const n=new Date(); return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0')")
        y, m, dd = map(int, hoy.split('-'))

        # 1. Premium adulta: fecha, confirmación y entrada.
        cuenta(d, w, premium=True)
        tipo, valor = cargar_fecha(d, w, '1990-05-10')
        comprobar(tipo == 'date', f'el campo es de tipo fecha en WebKit (type={tipo})')
        comprobar(hay(d, '[data-testid=birth-confirm-sheet]'), f'pasa a confirmar (valor {valor})')
        texto = css(d, '[data-testid=birth-confirm-date]').text if hay(d, '[data-testid=birth-confirm-date]') else ''
        comprobar(texto == '10 de mayo de 1990', f'confirmación muestra «{texto}»')
        d.save_screenshot(OUT + '/webkit-fecha-confirmar.png')
        pulsar(d, '[data-testid=birth-confirm]')
        w.until(lambda x: x.find_elements(By.CSS_SELECTOR, '[data-testid=new-thread]'))
        comprobar(True, 'con 16 o más y premium entra al club')
        ir(d, w, '#/cuenta', '[data-testid=birth-card]')
        perfil = css(d, '[data-testid=profile-birth-date]').text
        comprobar(perfil == '10 de mayo de 1990', f'el perfil muestra «{perfil}» (sin correrse por la zona horaria)')
        errs = d.execute_script('return window.__errs')
        comprobar(not errs, f'sin errores de JavaScript {errs or ""}')
        salir(d, w)

        # 2. Escribir la fecha con el teclado (como en la computadora).
        cuenta(d, w, premium=False)
        tipo, valor = cargar_fecha(d, w, '10/05/1990', tipeando=True)
        print(f'     tipeando «10/05/1990»: valor del campo «{valor}», confirmación {"sí" if hay(d, "[data-testid=birth-confirm-sheet]") else "no"}')
        if hay(d, '[data-testid=birth-confirm-sheet]'):
            print('     se confirmaría:', css(d, '[data-testid=birth-confirm-date]').text)
            pulsar(d, '[data-testid=birth-edit]')
        # Futura y vacía: no deben pasar a confirmar.
        futura = '%04d-%02d-%02d' % (y + 1, m, min(dd, 28))
        _, v = cargar_fecha(d, w, futura)
        msg = d.execute_script("return document.querySelector('[name=birthDate]').validationMessage")
        err = css(d, '[data-testid=form-error]').text if hay(d, '[data-testid=form-error]') else ''
        comprobar(not hay(d, '[data-testid=birth-confirm-sheet]'), f'fecha futura ({v}) no pasa a confirmar (mensaje nativo «{msg}», de la app «{err}»)')
        _, v = cargar_fecha(d, w, '')
        comprobar(not hay(d, '[data-testid=birth-confirm-sheet]'), 'fecha vacía no pasa a confirmar')
        _, v = cargar_fecha(d, w, '1899-12-31')
        msg = d.execute_script("return document.querySelector('[name=birthDate]').validationMessage")
        comprobar(not hay(d, '[data-testid=birth-confirm-sheet]'), f'año 1899 no pasa a confirmar (mensaje «{msg}»)')
        salir(d, w)

        # 3. Menor (cumple 16 mañana) con premium: bloqueada, sin oferta de premium.
        cuenta(d, w, premium=True)
        manana = d.execute_script("const n=new Date(); const t=new Date(n.getFullYear()-16, n.getMonth(), n.getDate()+1, 12); return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0')")
        cargar_fecha(d, w, manana)
        pulsar(d, '[data-testid=birth-confirm]')
        w.until(lambda x: x.find_elements(By.CSS_SELECTOR, '[data-testid=club-age-blocked]'))
        bloq = css(d, '[data-testid=club-age-blocked]').text.replace('\n', ' | ')
        comprobar('no está disponible para tu edad' in bloq and not hay(d, '[data-testid=see-plans]'), f'cumple 16 mañana ({manana}): «{bloq[:90]}…», sin «Ver planes»')
        d.save_screenshot(OUT + '/webkit-menor-bloqueada.png')
        for ruta in ['#/club/nueva', '#/club/t-x', '#/club/t-x/editar']:
            ir(d, w, ruta, '[data-testid=club-age-blocked]')
            comprobar(not hay(d, '[name=title]') and not hay(d, '[data-testid=thread-full]'), f'{ruta}: bloqueada')
        errs = d.execute_script('return window.__errs')
        comprobar(not errs, f'sin errores de JavaScript {errs or ""}')
        salir(d, w)

        # 4. Cumple 16 hoy: entra.
        cuenta(d, w, premium=True)
        hoy16 = '%04d-%02d-%02d' % (y - 16, m, dd)
        cargar_fecha(d, w, hoy16)
        pulsar(d, '[data-testid=birth-confirm]')
        w.until(lambda x: x.find_elements(By.CSS_SELECTOR, '[data-testid=new-thread],[data-testid=club-age-blocked]'))
        comprobar(hay(d, '[data-testid=new-thread]'), f'cumple 16 hoy ({hoy16}): entra')

        # 5. Idioma: ?lang=en no rompe nada.
        ir(d, w, '?lang=en#/planes', '[data-testid=plans-table]')
        lang = d.execute_script('return document.documentElement.lang')
        fila = [r.text for r in d.find_elements(By.CSS_SELECTOR, '[data-testid=plans-table] tr') if 'Reading Club' in r.text]
        comprobar(fila and 'para mayores de 16 años' in fila[0], f'?lang=en: se ve en español (html lang={lang})')
        ir(d, w, '?lang=es#/', '[data-testid=file-input]')
        errs = d.execute_script('return window.__errs')
        comprobar(not errs, f'sin errores de JavaScript {errs or ""}')
    finally:
        d.quit()
    print(f'\nWebKit club: {total - len(fallas)} de {total} bien')
    for f in fallas:
        print('  FALLA:', f)
    sys.exit(1 if fallas else 0)


main()
