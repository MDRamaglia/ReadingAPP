# Knowmadic

Lector de documentos **Word (.docx)** y **PDF** en español, pensado para leer cómodo con el celular en una mano y también en la computadora. Tiene dos maneras de leer:

- **Modo libro**: se pasan páginas tocando los costados, deslizando el dedo o con las flechas del teclado. En la computadora se ven dos páginas enfrentadas; en el celular, una.
- **Modo renglón**: una sola línea en foco, con el texto de alrededor atenuado u oculto. Cada toque avanza exactamente un renglón.

Todo se procesa y se guarda **en el dispositivo**. La app no envía documentos a ningún servidor, tampoco para el reconocimiento de texto (OCR).

Además de leer, tiene **cuentas**, **reseñas de libros**, un foro, el **Reading Club**, y una página de **planes** (gratuito y premium). El servidor de cuentas y la plataforma de pagos todavía no están conectados: mientras tanto, esas partes funcionan con un **servicio local de prueba** que guarda todo en el dispositivo y lo avisa en pantalla. El estado y la guía de integración están en [`docs/backend.md`](docs/backend.md).

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
  - **Animación de página** (plan premium, opcional, solo en horizontal): la hoja se dobla desde la esquina, con curvatura y sombras, y descubre poco a poco la página siguiente; al retroceder, la misma hoja vuelve a su lugar. Acompaña al dedo al deslizar (si se suelta antes de tiempo, la hoja vuelve), funciona con toques, teclado y rueda, y los pases rápidos terminan siempre en la página correcta. Tiene **tres velocidades** (lenta, normal y rápida). En vertical el interruptor queda deshabilitado pero conserva su valor. No se muestra si el sistema pide reducir el movimiento. Con el plan gratuito, el ajuste explica que es parte del plan premium y lleva a «Planes».
- Modo renglón: la línea es la que se ve con la letra y el ancho elegidos. Al cambiar la letra, el ancho, el interlineado o girar el celular, las líneas se recalculan **sin perder el lugar**.
- Retroceder un renglón: botón visible (abajo a la izquierda), toque en el borde izquierdo, flecha ↑ o deslizando hacia abajo.
- Ajustes: tamaño de letra, ancho de lectura, interlineado, tema claro (blanco con acento azul) / sepia (papel cálido con acento azul marino) / oscuro (negro azulado con acento azul claro), tipografía (Literata o Atkinson Hyperlegible) y texto alrededor atenuado u oculto.
- Indicador discreto de avance y «Ir a…» página (por su número impreso en los PDF) o sección.

**Continuidad**

- El punto de lectura se guarda solo, en cada movimiento. Al volver a abrir un documento se ofrece **continuar desde allí** (con el fragmento donde quedaste) o empezar de nuevo.
- Al cambiar entre libro y renglón se llega al mismo fragmento; si no pasaste de página, al mismo renglón exacto.
- Biblioteca con avance de cada documento y opción de **eliminarlo junto con su progreso**. Muestra cuántos archivos ocupa respecto del límite del plan (por ejemplo, «3 de 5 archivos»).
- Funciona sin conexión después de la primera visita y se puede instalar en la pantalla de inicio (PWA).
- Cuando se publica una versión nueva, la app se actualiza sola al abrirla o al volver a ella: descarga la versión nueva, la activa y se recarga en el mismo documento, con el punto de lectura guardado. Si hay un reconocimiento de texto (OCR) en curso, espera a que termine.

**Cuentas y comunidad**

- **Cuenta**: registro, ingreso y salida, recuperación de contraseña (pendiente del servidor de correo) y perfil con el nombre de usuario, el plan, las reseñas y las publicaciones propias. La biblioteca y las preferencias de lectura quedan asociadas a la cuenta; los documentos cargados antes de ingresar se pueden sumar a ella.
- **Reseñas**: libro, autor, categoría, título, texto y aviso opcional de *spoilers*. Se buscan por libro o autor sin distinguir mayúsculas ni tildes, se filtran por categoría y se ordenan por «Más valoradas» o «Más recientes». Leerlas no requiere cuenta; publicar y dar like, sí. Un like por persona y reseña, que se puede retirar, y nunca a la propia. Cada quien edita o elimina solo lo suyo.
- **Reading Club** (plan premium): conversaciones sobre libros y autores, preguntas y textos propios, con respuestas dentro de cada conversación. Con el plan gratuito se ve qué ofrece y cómo acceder, pero no su contenido.

**Planes**

La distribución de funciones entre el plan gratuito y el premium está en un solo archivo, [`src/config/plans.ts`](src/config/plans.ts): la tabla de la página «Planes» y los permisos de toda la app salen de allí.

| Función | Gratuito | Premium |
| --- | --- | --- |
| Modo libro (horizontal y vertical) | Incluido | Incluido |
| Modo renglón | Incluido | Incluido |
| Biblioteca personal | Hasta 5 archivos | Sin límite de cantidad impuesto por el plan |
| Buscar y leer reseñas | Incluido | Incluido |
| Publicar reseñas y dar likes | Incluido, con cuenta | Incluido |
| Animación de hoja de libro | Acceso premium | Incluida |
| Acceso y participación en el foro | Acceso premium | Incluidos |

- El límite del plan gratuito (`maxDocuments`) se cambia en ese archivo. Cada documento cuenta como un archivo, sin importar sus páginas; eliminar uno libera el lugar. Si una cuenta supera el límite, conserva sus documentos y solo se bloquean las cargas nuevas.
- El límite técnico de tamaño por archivo (`TECHNICAL_LIMITS`) es independiente del plan.
- Las categorías de reseñas y del Reading Club, los largos máximos de los textos y el orden de «Más valoradas» están en [`src/config/community.ts`](src/config/community.ts).
- Contratar, consultar y cancelar la suscripción tiene sus botones y puntos de integración, que hoy responden «estará disponible próximamente». El precio está sin definir.

**Probar el plan premium (solo desarrollo).** Abrir la app con `?dev=1` muestra el panel «Desarrollo», que cambia el plan de la cuenta de prueba. Se apaga con `?dev=0`. Solo actúa sobre el servicio local: con un servidor real, el plan lo determina la suscripción.

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
- Con el servicio local de prueba, las cuentas, reseñas y conversaciones también quedan solo en ese dispositivo (no las ve nadie más). Las contraseñas se guardan como hash PBKDF2-SHA-256 con sal, nunca en claro.
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

El servicio de cuentas se elige al compilar con `VITE_BACKEND` (`local` por defecto; ver `.env.example` y `docs/backend.md`).

La carpeta `dist/` es un sitio estático: se puede publicar en cualquier servidor de archivos. El flujo `.github/workflows/pages.yml` la publica en GitHub Pages al integrar cambios en `main` (hay que activar Pages una vez en *Settings › Pages › Source: GitHub Actions*).

## Pruebas

```bash
npm run typecheck   # tipos
npm test            # pruebas unitarias (texto de PDF, animación de página, planes y permisos, reseñas, likes, club)
npm run test:e2e    # pruebas de extremo a extremo en Chromium, como celular (Pixel 7) y computadora
npm run fixtures    # regenera los documentos de prueba (requiere Python, python-docx, reportlab, pillow, pyphen y LibreOffice)
python3 scripts/icons/vectorizar_logo.py  # vectoriza el logo de docs/marca/ (requiere Pillow y potrace)
node scripts/icons/generar_iconos.mjs     # regenera los íconos a partir de la marca (usa Playwright)
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
- el OCR de un PDF escaneado: precisión frente al texto original, aviso de la página degradada y ausencia de peticiones externas;
- la animación de página reservada al plan premium y sus tres velocidades;
- registro, ingreso, salida y recuperación de contraseña; preferencias y biblioteca por cuenta; la página de planes y los accesos de cada plan;
- el límite de la biblioteca: contador, bloqueo del sexto archivo con el ofrecimiento del plan premium, lugar liberado al eliminar y cuenta por encima del límite;
- reseñas: búsqueda sin tildes ni mayúsculas, filtro por categoría, los dos órdenes, un like por persona (retirable, nunca propio), *spoilers* y edición o eliminación solo de lo propio;
- Reading Club: acceso según el plan y edición o eliminación solo de lo propio.

Las capturas de pantalla y el informe de precisión del OCR quedan en `tests/.artifacts/`.

## Estructura

```
src/
  import/     importación: Word (mammoth), PDF (pdf.js), OCR (Tesseract), saneado de HTML
  reader/     lector: modo libro (Word y PDF), animación de página, modo renglón, índice, ajustes, página original
  library/    biblioteca y carga de documentos
  config/     planes y permisos (plans.ts); categorías, largos y orden de la comunidad (community.ts)
  services/   contrato con el servidor (backend.ts), servicio local de prueba, adaptador remoto pendiente, sesión
  account/    ingreso, registro, recuperación y perfil
  community/  reseñas y Reading Club
  plans/      página de planes
  ui/         marca, estructura de la app (encabezado y navegación) y componentes comunes
  dev/        panel de desarrollo para probar planes
  lib/        base local (IndexedDB), ajustes, permisos por plan, utilidades de texto, carga de pdf.js
  styles/     tipografía, temas y diseño
docs/         estado del servidor y guía de integración; logo original
tests/
  e2e/        pruebas de extremo a extremo (Playwright)
  unit/       pruebas unitarias (Vitest)
  fixtures/   documentos de prueba reales
scripts/      copia local de recursos de pdf.js y Tesseract; generadores de documentos de prueba, de la marca y de íconos; prueba en WebKit
```

## Créditos

[pdf.js](https://github.com/mozilla/pdf.js) (Mozilla, Apache 2.0) · [Tesseract.js](https://github.com/naptha/tesseract.js) (Apache 2.0) con el modelo de español de [tessdata](https://github.com/tesseract-ocr/tessdata_best) (Apache 2.0) en su versión «best_int» · [mammoth.js](https://github.com/mwilliamson/mammoth.js) (BSD 2) · [Preact](https://preactjs.com) (MIT) · [idb](https://github.com/jakearchibald/idb) (ISC) · [potrace](https://potrace.sourceforge.net) (GPL, solo para vectorizar el logo; no forma parte de la app) · tipografías [Literata](https://github.com/googlefonts/literata) y [Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont/) (SIL Open Font License).
