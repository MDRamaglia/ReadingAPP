# Knowmadic

Lector de documentos **Word (.docx)** y **PDF** en español, pensado para leer cómodo con el celular en una mano y también en la computadora. Tiene dos maneras de leer:

- **Modo libro**: se pasan páginas tocando los costados, deslizando el dedo o con las flechas del teclado. En la computadora se ven dos páginas enfrentadas; en el celular, una.
- **Modo renglón**: una sola línea en foco, con el texto de alrededor atenuado u oculto. Cada toque avanza exactamente un renglón.

Todo se procesa y se guarda **en el dispositivo**. La app no envía documentos a ningún servidor, tampoco para el reconocimiento de texto (OCR).

La app se llamó antes «Renglón». Los nombres internos de almacenamiento (`renglon…`) se conservan a propósito para que quien ya la usaba no pierda su biblioteca ni su progreso.

## Qué hace

**Importación**

- `.docx`: conserva títulos, párrafos, negritas y cursivas, listas, tablas, citas, imágenes y saltos de página. Los «Título 1» largos se tratan como capítulos (abren página nueva en el modo libro).
- `.doc` (Word 97-2003): se reconoce por su contenido y se explica cómo convertirlo a `.docx`; no se intenta leerlo a medias.
- PDF: distingue página por página entre **texto seleccionable**, **imagen escaneada** y **página vacía**, y clasifica el documento como «PDF con texto», «PDF escaneado» o «PDF con páginas escaneadas».
  - Reconstruye el orden de lectura: renglones, párrafos, títulos, palabras cortadas con guion y párrafos que siguen en la página siguiente.
  - Quita del modo renglón los encabezados y números de página repetidos (siguen visibles en el modo libro, que muestra la página original).
  - Recorta las imágenes y las ubica en el texto.
  - Si el orden de una página es dudoso (columnas, tablas, recuadros) lo avisa y permite abrir la **página original**.
- PDF escaneado: el **OCR en español** (Tesseract) corre en el navegador, con avance por página, tiempo estimado, opción de detenerlo (lo reconocido se conserva) y aviso de las páginas con reconocimiento **dudoso** o **fallido**. Las palabras de baja confianza se subrayan con puntos.

**Lectura**

- Modo libro: los PDF conservan su aspecto y su **numeración original** (por ejemplo, i, ii, 1, 2…). Los Word se reparten en páginas del tamaño de la pantalla.
  - **Dirección para pasar página**: horizontal (izquierda y derecha, la opción inicial) o vertical (arriba y abajo). En las dos, cada paso lleva a una página completa, y los toques, deslizamientos y la rueda se adaptan a la dirección elegida. Cambiarla no mueve el lugar de lectura.
  - **Animación de página** (opcional, solo en horizontal): la hoja se dobla desde la esquina, con curvatura y sombras, y descubre poco a poco la página siguiente; al retroceder, la misma hoja vuelve a su lugar. Acompaña al dedo al deslizar (si se suelta antes de tiempo, la hoja vuelve), funciona con toques, teclado y rueda, y los pases rápidos terminan siempre en la página correcta. En vertical el interruptor queda deshabilitado pero conserva su valor. No se muestra si el sistema pide reducir el movimiento.
- Modo renglón: la línea es la que se ve con la letra y el ancho elegidos. Al cambiar la letra, el ancho, el interlineado o girar el celular, las líneas se recalculan **sin perder el lugar**.
- Retroceder un renglón: botón visible (abajo a la izquierda), toque en el borde izquierdo, flecha ↑ o deslizando hacia abajo.
- Ajustes: tamaño de letra, ancho de lectura, interlineado, tema claro (blanco con acento azul) / sepia (papel cálido con acento azul marino) / oscuro (negro azulado con acento azul claro), tipografía (Literata o Atkinson Hyperlegible) y texto alrededor atenuado u oculto.
- Indicador discreto de avance y «Ir a…» página (por su número impreso en los PDF) o sección.

**Continuidad**

- El punto de lectura se guarda solo, en cada movimiento. Al volver a abrir un documento se ofrece **continuar desde allí** (con el fragmento donde quedaste) o empezar de nuevo.
- Al cambiar entre libro y renglón se llega al mismo fragmento; si no pasaste de página, al mismo renglón exacto.
- Biblioteca con avance de cada documento y opción de **eliminarlo junto con su progreso**.
- Funciona sin conexión después de la primera visita y se puede instalar en la pantalla de inicio (PWA).
- Cuando se publica una versión nueva, la app se actualiza sola al abrirla o al volver a ella: descarga la versión nueva, la activa y se recarga en el mismo documento, con el punto de lectura guardado. Si hay un reconocimiento de texto (OCR) en curso, espera a que termine.

## Controles

| Acción | Celular | Computadora |
| --- | --- | --- |
| Pasar página (libro, horizontal) | Tocar el costado derecho o izquierdo; deslizar de lado | ← → ↑ ↓, AvPág/RePág, rueda del mouse, clic en los costados |
| Pasar página (libro, vertical) | Tocar abajo o arriba; deslizar hacia arriba o abajo | ↓ ↑ ← →, AvPág/RePág, rueda del mouse, clic abajo o arriba |
| Mostrar u ocultar controles (libro) | Tocar el centro | Clic en el centro |
| Avanzar un renglón | Tocar la pantalla | Clic, ↓, →, Espacio, Enter |
| Retroceder un renglón | Borde izquierdo o botón ↑ | ↑, ←, Mayús+Espacio, botón ↑ |

## Privacidad

- Documentos, texto extraído, imágenes y progreso quedan en el almacenamiento del navegador (IndexedDB) de ese dispositivo.
- pdf.js, el núcleo de Tesseract y el modelo de idioma español se sirven desde la propia app (`public/vendor/`), no desde servidores de terceros. Las pruebas automáticas verifican que durante la importación y el OCR **no haya ninguna petición fuera del origen de la app**.
- Eliminar un documento borra también su texto, sus imágenes y su progreso.
- Como todo queda en el navegador, borrar los datos del sitio borra la biblioteca. Conviene instalar la app en la pantalla de inicio: en iPhone y iPad, Safari borra los datos de un sitio tras 7 días de uso del navegador sin visitarlo, mientras que las apps agregadas a la pantalla de inicio llevan su propio contador, que se reinicia cada vez que se usan (Wilander, 2020, [WebKit](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)).

## Limitaciones conocidas

- **OCR**: funciona muy bien con páginas impresas, nítidas y derechas. Con manuscritos, fotos torcidas o con sombra, baja resolución, poco contraste, varias columnas complejas o tablas, puede equivocarse u omitir texto; esas páginas se marcan como dudosas o fallidas y se puede abrir la original. Solo reconoce español. Es lento en celulares: calculá unos segundos por página (más en equipos antiguos), y en el iPhone se pausa si la app pasa a segundo plano.
- **PDF**: el orden de lectura se reconstruye con heurísticas; en diseños con columnas, recuadros o tablas puede no ser exacto (se avisa). Las figuras hechas con dibujos vectoriales (no imágenes) no se recortan: se ven en el modo libro y en la página original.
- **Word**: las páginas de lectura no coinciden con las de Word (se adaptan a la pantalla). Las imágenes en formato EMF/WMF de Office no pueden mostrarse en el navegador; se indica su lugar. Notas al pie, comentarios, cuadros de texto y formato de página (columnas, encabezados) no se reproducen.
- Según el navegador y el sistema, puede no haber corte de palabras con guion en español; en ese caso, en columnas anchas el texto justificado del modo libro puede mostrar espacios algo irregulares (en columnas angostas se alinea a la izquierda para evitarlo).

## Uso local

Requiere Node.js 22.13 o posterior.

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # compilación de producción en dist/
npm run preview    # sirve dist/ en http://localhost:4173
```

La carpeta `dist/` es un sitio estático: se puede publicar en cualquier servidor de archivos. El flujo `.github/workflows/pages.yml` la publica en GitHub Pages al integrar cambios en `main` (hay que activar Pages una vez en *Settings › Pages › Source: GitHub Actions*).

## Pruebas

```bash
npm run typecheck   # tipos
npm test            # pruebas unitarias (reconstrucción de texto de PDF, guiones, números de página)
npm run test:e2e    # pruebas de extremo a extremo en Chromium, como celular (Pixel 7) y computadora
npm run fixtures    # regenera los documentos de prueba (requiere Python, python-docx, reportlab, pillow, pyphen y LibreOffice)
python3 scripts/icons/generar_iconos.py   # regenera los íconos (requiere Pillow)
```

**Safari (iPhone y iPad).** Algunos fallos solo aparecen en WebKit, el motor de Safari: por ejemplo, el libro de Word repartido en una sola página o el guardado de archivos en IndexedDB. `scripts/webkit/probar_safari.py` recorre en WebKit (WebKitGTK por WebDriver) lo mismo que una persona en el iPhone: importar un Word y dos PDF, pasar páginas, avanzar de a un renglón y reconocer el PDF escaneado.

```bash
sudo apt-get install webkit2gtk-driver xvfb && pip install selenium
npm run build && npm run preview &
xvfb-run -a python3 scripts/webkit/probar_safari.py
```

No reemplaza probar en un iPhone real (el selector de archivos, la instalación en la pantalla de inicio y los límites de memoria son propios de iOS), pero detecta los problemas del motor.

Las pruebas de extremo a extremo usan documentos reales de `tests/fixtures/` y verifican, entre otras cosas:

- cargar un `.docx` y conservar títulos, listas, tabla, cita, imagen y saltos de página;
- leer un PDF con texto con su numeración original (i, ii, 1…), una o dos páginas por pantalla;
- pasar páginas con toques, deslizamiento y teclado; ir a una página o sección;
- el modo libro en sus tres configuraciones (horizontal, horizontal con animación de página y vertical), en Word y PDF: avance y retroceso por página completa, la hoja que se dobla cuadro a cuadro (pliegue, dorso visible, sentido del movimiento y página que queda debajo), el arrastre que se completa o se devuelve, los pases rápidos y que cambiar la dirección o la animación no mueva el lugar de lectura;
- que **cada toque avance exactamente un renglón visual** (medido de forma independiente sobre lo que se dibuja en pantalla), también entre párrafos, títulos y páginas del PDF;
- retroceder con el borde izquierdo, el botón y el teclado;
- recalcular renglones al cambiar letra, ancho, interlineado o girar el celular, sin perder el carácter en que se estaba;
- cambiar de modo sin perder el fragmento;
- **reanudar después de cerrar el navegador por completo**;
- el `.doc` antiguo con instrucciones de conversión, la eliminación con su progreso y el uso sin conexión;
- que **una versión nueva reemplace a la anterior** con la app abierta, sin quedar «en espera» y sin perder el lugar de lectura;
- el OCR de un PDF escaneado: precisión frente al texto original, aviso de la página degradada y ausencia de peticiones externas.

Las capturas de pantalla y el informe de precisión del OCR quedan en `tests/.artifacts/`.

## Estructura

```
src/
  import/     importación: Word (mammoth), PDF (pdf.js), OCR (Tesseract), saneado de HTML
  reader/     lector: modo libro (Word y PDF), modo renglón, índice, ajustes, página original
  library/    biblioteca y carga de documentos
  lib/        base local (IndexedDB), ajustes, utilidades de texto, carga de pdf.js
  styles/     tipografía, temas y diseño
tests/
  e2e/        pruebas de extremo a extremo (Playwright)
  unit/       pruebas unitarias (Vitest)
  fixtures/   documentos de prueba reales
scripts/      copia local de recursos de pdf.js y Tesseract; generadores de documentos de prueba y de íconos; prueba en WebKit
```

## Créditos

[pdf.js](https://github.com/mozilla/pdf.js) (Mozilla, Apache 2.0) · [Tesseract.js](https://github.com/naptha/tesseract.js) (Apache 2.0) con el modelo de español de [tessdata](https://github.com/tesseract-ocr/tessdata_best) (Apache 2.0) en su versión «best_int» · [mammoth.js](https://github.com/mwilliamson/mammoth.js) (BSD 2) · [Preact](https://preactjs.com) (MIT) · [idb](https://github.com/jakearchibald/idb) (ISC) · tipografías [Literata](https://github.com/googlefonts/literata) y [Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont/) (SIL Open Font License).
