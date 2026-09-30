# -*- coding: utf-8 -*-
"""Vectoriza el logo de Knowmadic (docs/marca/logo-original.webp).

Separa por color las tres formas de la marca (hoja marino de atrás, hoja azul
de adelante y el rulo blanco de la esquina) y el logotipo, las traza con
potrace y escribe:
    public/brand/knowmadic-marca.svg, knowmadic-logotipo.svg, knowmadic-logo.svg
    src/ui/brandPaths.ts  (trazos para usar en línea, con colores por CSS)

Requisitos: Pillow y potrace (sudo apt-get install potrace).
Uso: python3 scripts/icons/vectorizar_logo.py
"""
import os
import re
import subprocess
import tempfile

from PIL import Image, ImageChops, ImageDraw, ImageFilter

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ORIGEN = os.path.join(RAIZ, 'docs', 'marca', 'logo-original.webp')
MARCA = (360, 210, 900, 850)  # recorte de la marca en el original (1254 × 1254)
LOGOTIPO = (110, 850, 1150, 1040)
MARK_VB = '24 22 492 590'
WORD_VB = '20 19 997 150'
G = 'transform="translate(0 640) scale(1 -1)"'
GW = 'transform="translate(0 190) scale(1 -1)"'

azul = lambda c: c[2] > 150 and c[2] - c[0] > 90 and c[0] < 140
marino = lambda c: c[0] < 110 and c[1] < 120 and c[2] < 160 and c[2] >= c[0] and sum(c) < 330


def mascara(img, pred):
    w, h = img.size
    src = img.load()
    m = Image.new('L', (w, h), 0)
    dst = m.load()
    for y in range(h):
        for x in range(w):
            if pred(src[x, y]):
                dst[x, y] = 255
    return m


def trazar(m, carpeta, nombre):
    pbm = os.path.join(carpeta, nombre + '.pbm')
    svg = os.path.join(carpeta, nombre + '.svg')
    m.point(lambda v: 0 if v > 127 else 255).convert('1').save(pbm)
    subprocess.run(['potrace', pbm, '-s', '-u', '1', '-t', '12', '-a', '1.1', '-O', '0.3', '-o', svg], check=True)
    texto = open(svg, encoding='utf-8').read()
    return ' '.join(' '.join(d.split()) for d in re.findall(r'<path d="([^"]+)"', texto, re.S))


def main():
    img = Image.open(ORIGEN).convert('RGB')
    marca = img.crop(MARCA)
    m_azul = mascara(marca, azul)
    m_marino = mascara(marca, marino)
    # El rulo es el blanco encerrado entre las dos hojas: el que no se alcanza
    # desde el borde. Las formas se engrosan un poco para cerrar rendijas finas.
    union = ImageChops.lighter(m_azul, m_marino)
    libre = ImageChops.invert(union.filter(ImageFilter.MaxFilter(7)))
    ImageDraw.floodfill(libre, (0, 0), 128)
    rulo = libre.point(lambda v: 255 if v == 255 else 0).filter(ImageFilter.MaxFilter(7))
    m_logotipo = mascara(img.crop(LOGOTIPO), marino)

    with tempfile.TemporaryDirectory() as tmp:
        back = trazar(m_marino, tmp, 'marino')
        curl = trazar(rulo, tmp, 'rulo')
        front = trazar(m_azul, tmp, 'azul')
        word = trazar(m_logotipo, tmp, 'logotipo')

    capas = f'''<path fill="#051C42" d="{back}"/>
    <path fill="#FFFFFF" d="{curl}"/>
    <path fill="#0770FC" d="{front}"/>'''
    pub = os.path.join(RAIZ, 'public', 'brand')
    os.makedirs(pub, exist_ok=True)
    with open(os.path.join(pub, 'knowmadic-marca.svg'), 'w', encoding='utf-8') as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{MARK_VB}">\n  <title>Knowmadic</title>\n  <g {G}>\n    {capas}\n  </g>\n</svg>\n')
    with open(os.path.join(pub, 'knowmadic-logotipo.svg'), 'w', encoding='utf-8') as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{WORD_VB}">\n  <title>Knowmadic</title>\n  <g {GW}><path fill="#051C42" d="{word}"/></g>\n</svg>\n')
    with open(os.path.join(pub, 'knowmadic-logo.svg'), 'w', encoding='utf-8') as f:
        f.write(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 900">\n  <title>Knowmadic</title>\n'
            f'  <svg x="295" y="0" width="410" height="492" viewBox="{MARK_VB}">\n    <g {G}>\n    {capas}\n    </g>\n  </svg>\n'
            f'  <svg x="0" y="600" width="1000" height="150" viewBox="{WORD_VB}">\n    <g {GW}><path fill="#051C42" d="{word}"/></g>\n  </svg>\n</svg>\n'
        )
    with open(os.path.join(RAIZ, 'src', 'ui', 'brandPaths.ts'), 'w', encoding='utf-8') as f:
        f.write(
            '/**\n * Trazos del logo de Knowmadic, vectorizados del original (docs/marca/).\n'
            ' * Generado por scripts/icons/vectorizar_logo.py; no editar a mano.\n */\n'
            f"export const MARK_VIEWBOX = '{MARK_VB}';\nexport const WORD_VIEWBOX = '{WORD_VB}';\n"
            '/** Los trazos vienen de potrace: coordenadas con el eje y hacia arriba. */\n'
            "export const MARK_TRANSFORM = 'translate(0 640) scale(1 -1)';\n"
            "export const WORD_TRANSFORM = 'translate(0 190) scale(1 -1)';\n"
            f"export const MARK_BACK = '{back}';\nexport const MARK_CURL = '{curl}';\n"
            f"export const MARK_FRONT = '{front}';\nexport const WORDMARK = '{word}';\n"
        )
    print('Logo vectorizado en', pub)


if __name__ == '__main__':
    main()
