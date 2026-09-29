# -*- coding: utf-8 -*-
"""Genera los íconos de la app (SVG y PNG) con la paleta azul, blanca y negra.

El dibujo son tres renglones: el del medio, en azul, es el renglón en foco.
Uso: python3 scripts/icons/generar_iconos.py  (requiere Pillow)
"""
import os

from PIL import Image, ImageDraw

FONDO = (11, 18, 32)  # #0b1220, negro azulado
RENGLON = (255, 255, 255, 70)  # blanco tenue
FOCO = (77, 141, 255)  # #4d8dff, azul
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'icons'))
# Renglones sobre una grilla de 512: (x, y, ancho, alto).
LINEAS = [(120, 150, 272, 22, RENGLON), (96, 240, 320, 34, FOCO), (120, 342, 232, 22, RENGLON)]

SVG = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#0b1220"/>
  <rect x="120" y="150" width="272" height="22" rx="11" fill="#ffffff" opacity=".28"/>
  <rect x="96" y="240" width="320" height="34" rx="17" fill="#4d8dff"/>
  <rect x="120" y="342" width="232" height="22" rx="11" fill="#ffffff" opacity=".28"/>
</svg>
'''


def dibujar(tam, redondeado, escala_contenido=1.0):
    ss = 4  # sobremuestreo para bordes suaves
    n = 512 * ss
    base = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(base)
    if redondeado:
        d.rounded_rectangle((0, 0, n - 1, n - 1), radius=112 * ss, fill=FONDO + (255,))
    else:
        d.rectangle((0, 0, n, n), fill=FONDO + (255,))
    capa = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    dc = ImageDraw.Draw(capa)
    c = n / 2
    for x, y, w, h, color in LINEAS:
        x0 = c + (x * ss - c) * escala_contenido
        y0 = c + (y * ss - c) * escala_contenido
        x1 = c + ((x + w) * ss - c) * escala_contenido
        y1 = c + ((y + h) * ss - c) * escala_contenido
        fill = color if len(color) == 4 else color + (255,)
        dc.rounded_rectangle((x0, y0, x1, y1), radius=(y1 - y0) / 2, fill=fill)
    base = Image.alpha_composite(base, capa)
    return base.resize((tam, tam), Image.LANCZOS)


def main():
    with open(os.path.join(OUT, 'icon.svg'), 'w', encoding='utf-8') as f:
        f.write(SVG)
    dibujar(192, True).save(os.path.join(OUT, 'icon-192.png'))
    dibujar(512, True).save(os.path.join(OUT, 'icon-512.png'))
    # Enmascarable: fondo a sangre y dibujo dentro de la zona segura (80 %).
    dibujar(512, False, 0.72).save(os.path.join(OUT, 'icon-maskable-512.png'))
    # iOS redondea por su cuenta y no admite transparencia.
    dibujar(180, False).convert('RGB').save(os.path.join(OUT, 'apple-touch-icon.png'))
    print('Íconos generados en', OUT)


if __name__ == '__main__':
    main()
