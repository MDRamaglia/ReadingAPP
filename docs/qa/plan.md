# Plan de pruebas (P19)

**Preparó:** QA, el 23/10/2026. **Estado:** borrador para revisión del coordinador.

**De dónde sale**
- La lista de control de Google Play (`docs/requisitos/google-play.md`: 80 requisitos GP-01 a GP-80, con su estado).
- La guía de la cuenta y de la prueba cerrada (`docs/requisitos/guia-cuenta-google-play.md`).
- La propuesta técnica `docs/tecnico/decision-servidor-empaquetado-cobros.md`: Supabase, Capacitor 8 y RevenueCat, **todavía sin decidir** (T02, T03 y T04). Lo que depende de esa propuesta está marcado con **◆**: si el titular elige otra cosa, esas partes se revisan.
- Los borradores legales de `docs/legal/` (privacidad, términos y normas de la comunidad), que todavía **no están aprobados**. Los casos de moderación, borrado y cobro siguen lo que esos borradores prometen. Si los textos cambian, cambian los casos.
- Las pruebas de `tests/` y `scripts/webkit/probar_safari.py`, leídas en el árbol de trabajo del 23/10/2026. Ese árbol incluye cambios de Desarrollo sin integrar: el control de edad (P06) y los idiomas (P10).

**Cómo se hizo:** este encargo es solo documentación. **No se corrió ninguna prueba ni se levantó ningún servidor**, porque Desarrollo estaba corriendo la suite. Lo que este plan dice sobre las pruebas sale de leer el código, no de ejecutarlo.

La lista que se recorre antes de cada envío está en [`lista-de-publicacion.md`](lista-de-publicacion.md).

---

## 1. Alcance y estrategia

### 1.1 Qué se prueba

| Producto | Estado | Cómo se prueba |
|---|---|---|
| **App web** (PWA en GitHub Pages) | Publicada. Sigue publicada (D01) | Suite automática (Chromium y WebKit) y recorridos a mano en Chrome para Android y Safari |
| **Paquete de Android** (◆ Capacitor 8) | No existe todavía (P07) | Celulares y emuladores reales, el informe previo al lanzamiento de Play, la prueba interna y la prueba cerrada |
| **Servidor** (◆ Supabase) | No existe todavía (P02) | Pruebas de las reglas por fila contra una base local, más consultas de verificación que hace Servidor durante los recorridos |
| **Cobro** (◆ RevenueCat sobre Google Play Billing) | No existe todavía (P08) | Testers con licencia, instrumentos de prueba de Google y Play Billing Lab |

El iPhone queda fuera de este plan (D01). La prueba de Safari se sigue corriendo porque la web está publicada y la usan desde el iPhone.

### 1.2 Niveles de prueba

1. **Unitarias** (`npm test`, Vitest): reglas de edad, permisos por plan, búsqueda y orden de reseñas, idiomas, geometría de la hoja y armado de párrafos de PDF.
2. **Extremo a extremo** (`npm run test:e2e`, Playwright): dos proyectos, «celular» (emulación de Pixel 7) y «computadora» (1440 × 900). Corren contra la compilación de producción, con *service worker*.
   - **Ojo:** la emulación de Pixel 7 es Chromium de escritorio con pantalla, agente y toques de celular. **No es la WebView de Android.** No reemplaza la prueba en equipos.
3. **Motor de Safari** (`scripts/webkit/probar_safari.py`, WebKitGTK por WebDriver, 390 × 844). Hoy no corre en la integración continua: hay que correrlo a mano.
4. **Servidor** (cuando exista P02): pruebas de cada regla de `docs/backend.md` contra Supabase local, con sesiones de distintos usuarios. Las escribe Servidor y QA las revisa.
5. **A mano en dispositivos:** los flujos críticos de cada versión candidata (sección 6.6) y la matriz de la sección 3 según su prioridad.
6. **Informe previo al lanzamiento de Play:** se genera solo al subir un paquete. Prueba estabilidad, compatibilidad, rendimiento y accesibilidad en equipos de Google con Android 9 o posterior ([informe previo][prelaunch]).
   - **Límite:** la ayuda dice que no se pueden cargar credenciales en apps que inician sesión dentro de una WebView ([informe previo][prelaunch]). Eso probablemente incluye a Knowmadic. Hay que contar con que el robot recorra solo lo que se ve sin sesión.
7. **Prueba cerrada:** 12 o más personas durante 14 días (GP-07). Sus comentarios entran a la planilla de la guía (punto 4.11) y los que sean fallas se pasan a `docs/qa/fallas/`.

### 1.3 Qué hay que probar a mano y por qué

Las pruebas automáticas no llegan a:
- la WebView real de Android, las barras del sistema, el gesto atrás y el selector de archivos del sistema;
- los celulares de gama baja: memoria, tiempos, temperatura y batería;
- el cobro real de Google Play, que solo funciona en un paquete instalado desde Play;
- los correos (confirmación y recuperación de contraseña);
- TalkBack, la letra del sistema al máximo y el modo oscuro del sistema;
- la actualización del paquete desde Play y la convivencia de dos versiones con el mismo servidor;
- la moderación hecha por personas, con sus plazos.

### 1.4 Lo que todavía no existe

La matriz de la sección 3 tiene 174 casos: 85 figuran con «Falta» (algunos con una cobertura parcial), 43 se prueban solo a mano y el resto tiene alguna prueba automática. Casi todo lo que falta depende de cosas que no están hechas: el servidor (P02), el borrado (P03), la moderación (P05), el paquete (P07) y el cobro (P08 y P09). Esos casos quedan **definidos ahora**, para que Desarrollo y Servidor sepan qué se va a verificar, y figuran como «Falta», con la tarea de la que dependen.

---

## 2. Inventario de las pruebas automáticas

### 2.1 Extremo a extremo (`tests/e2e/`)

Cada caso corre dos veces, una por proyecto. En total son **50 casos de comportamiento y 2 de capturas**.

| Archivo | Casos | Qué verifica | Depende de | Qué no cubre |
|---|---|---|---|---|
| `01-word-libro.spec.ts` | 3 | Estructura real del `.docx`: títulos, listas, tabla, cita, imagen, negrita, cursiva y saltos de página. Pasar página con toques, deslizamiento y teclado (una página en el celular, dos en la computadora). Ir a una página o sección | — | Word grandes, dañados o con tablas complejas |
| `02-renglon.spec.ts` | 3 | Un toque avanza exactamente un renglón visual, también entre párrafos y títulos (30 toques). La banda de foco coincide con el renglón. Retroceso con toque, botón y teclado. Transición suave y velo. Recalcula sin perder el lugar al cambiar la letra, el ancho, el interlineado o el tema, o al girar | — | Los ajustes «Tipografía» y de contexto. Reducir movimiento |
| `03-pdf-texto.spec.ts` | 5 | PDF con texto: tipo, 7 páginas, numeración impresa (i, ii, 1…) e índice. Aviso de orden dudoso en la página 5. La página se dibuja de verdad y conserva la proporción. Modo renglón sin encabezados ni números repetidos, con guiones reconstruidos y la figura. Paso de una página a la siguiente con un toque normal. Página original con el aviso | — | PDF protegidos con contraseña, dañados, grandes, rotados o con formularios |
| `04-continuidad.spec.ts` | 5 | Cambiar de modo lleva al mismo fragmento (Word y PDF). El punto de lectura sobrevive a cerrar el navegador entero. Empezar desde el principio. Sin conexión después de la primera visita (solo la lectura) | *Service worker* | Que Android cierre la app por memoria. La comunidad sin conexión |
| `05-escaneado-ocr.spec.ts` | 1 | Detecta el escaneo y reconoce el texto en el dispositivo, con progreso. Mide la precisión contra el texto original: error de caracteres menor al 1 % en las páginas limpias. Avisa la página degradada. Después, el modo renglón funciona. **Ninguna petición sale del origen de la app** | Servicio local (ver O7) | Detener el OCR. OCR en inglés o portugués. Tiempos en gama baja |
| `06-biblioteca.spec.ts` | 3 | El `.doc` antiguo se rechaza con instrucciones. Un `.txt` se rechaza. Eliminar un documento borra su contenido, su progreso y sus recursos | — | Almacenamiento lleno. Archivos de más de 300 MB |
| `07-actualizacion.spec.ts` | 1 | Una versión nueva del *service worker* reemplaza a la anterior sin cerrar la app y sin perder el lugar | *Service worker* y `dist/sw.js` | La actualización del paquete desde Play: ◆ la compilación para Capacitor no lleva *service worker* |
| `08-libro-navegacion.spec.ts` | 12 | Sin premium, la animación de hoja explica su acceso y lleva a los planes. Con premium: horizontal por defecto, interruptor deshabilitado en vertical, velocidades, pliegue cuadro a cuadro, pases rápidos, arrastre que sigue al dedo y PDF. Cambiar dirección o animación conserva la posición. El modo renglón no cambia. El lema | `?dev=1` (premium por el panel) | Reducir movimiento. Fluidez en gama baja |
| `09-cuentas-planes.spec.ts` | 3 | Registro, datos repetidos, contraseña equivocada, ingreso y vuelta a donde se estaba. La recuperación **se informa como pendiente, no se simula**. Tabla de planes, precio «a definir» y contratación «próximamente». Las preferencias siguen a la cuenta. Muestra el aviso «Prueba local» | Servicio local y `?dev=1` | El servidor real, los correos, el borrado y los términos |
| `10-biblioteca-limite.spec.ts` | 4 | Límite de 5 documentos: contador, el sexto se frena con una explicación y eliminar libera lugar. Premium sin límite. Al volver a gratuito se conserva el acceso pero no se puede cargar. Los documentos cargados sin cuenta se suman a la cuenta respetando el límite | `?dev=1` | El vencimiento real de la suscripción. Dos dispositivos |
| `11-resenas.spec.ts` | 5 | Se leen sin cuenta; publicar o dar like pide sesión. Búsqueda sin mayúsculas ni tildes, filtro por categoría y los dos órdenes con likes de tres personas. Un like por persona, que se puede retirar, y nunca a lo propio. Spoilers tapados. Solo quien publicó edita o elimina. El perfil muestra las propias | Servicio local: las «tres personas» usan el mismo dispositivo. `signUp` pasa por `?dev=1` | Denunciar, bloquear y filtrar. HTML en los campos. Largos máximos. Muchas reseñas |
| `12-club.spec.ts` | 5 | Sin cuenta o con plan gratuito se ve qué ofrece el club, pero no las conversaciones, ni siquiera por enlace directo. Planes avisa la edad mínima. El menor de 16 queda afuera aunque sea premium y sin que se le ofrezca premium. La fecha se pide antes de ofrecer premium, se confirma y se puede corregir antes de guardarla. Una fecha futura no se acepta. La fecha queda bloqueada. Solo lo propio se edita o elimina | Servicio local y `?dev=1` | La validación en el servidor. El borde del cumpleaños (lo cubren las unitarias). Denuncias |
| `99-capturas.spec.ts` | 2 | **No verifica comportamiento.** Genera unas 30 capturas por proyecto en `tests/.artifacts/capturas/` | `?dev=1` | Las capturas muestran «Prueba local» y el botón «Desarrollo»: **no sirven para la ficha** (GP-67) |

`helpers.ts` concentra la carga de archivos, los toques, los deslizamientos, la lectura de la base local y las cuentas de prueba. **`signUp` siempre abre `/?dev=1#/cuenta/registro`**, así que casi todas las pruebas con cuenta corren con el panel de desarrollo activo (ver O1).

### 2.2 Unitarias (`tests/unit/`)

Son **60 casos**. Algunos recorren listas de valores dentro del mismo caso.

| Archivo | Casos | Qué verifica | Qué no cubre |
|---|---|---|---|
| `age.test.ts` | 18 | Edad cumplida: el mismo día, el 29 de febrero y el año 2100. Fechas inexistentes, futuras o anteriores a 1900. Calendario local y mensajes. `canUse('club')` con el orden sesión, edad y plan. Menor bloqueado aunque sea premium. Una fecha guardada con el reloj atrasado no habilita. La edad no afecta al resto de la app. En el servicio local: el registro no pide la fecha, cargarla requiere sesión, no se cambia y el club la valida (le falta un día: no entra; cumple hoy: entra) | Las funciones del servidor (`club_age_ok`, `set_birth_date`). La diferencia de zona horaria |
| `community.test.ts` | 12 | Búsqueda sin tildes ni diéresis. Órdenes «top», «recent» y «hot». La tabla de funciones por plan. `canUse` por plan y cuenta. El uso de la biblioteca. En el servicio local: cuentas (registro, ingreso, repetidos y validaciones), recuperación pendiente, reseñas (propiedad, likes y validaciones) y club (premium y propiedad) | Los largos máximos (`TEXT_LIMITS`). Las reglas del servidor |
| `curl.test.ts` | 6 | Geometría del pliegue de la hoja: superficie, reflejo, lomo, esquina y lado tomado | La fluidez |
| `i18n.test.ts` | 14 | `en` y `pt` sin claves ajenas, con los mismos datos `{…}` y plurales que `es`. Sin textos vacíos. Cada categoría guardada tiene etiqueta. `t()` interpola, elige el plural y cae al español. Solo se elige solo el español (los demás no están habilitados). Fechas y números por idioma | Textos fijos fuera de los archivos de idioma. Desbordes de textos largos |
| `pdfLayout.test.ts` | 10 | Guiones de corte, espacios, números de página, fragmentos y distancia de edición. Renglones por línea de base, negrita simulada, párrafos y títulos, orden dudoso y encabezados repetidos | — |

### 2.3 Prueba de Safari (`scripts/webkit/probar_safari.py`)

- **Qué hace:** con WebKitGTK (MiniBrowser) a 390 × 844, crea una cuenta y la pasa a premium con el panel. Carga un Word y un PDF, pasa páginas, lee de a un renglón, prueba la animación de hoja y el modo vertical, publica y busca una reseña y reconoce un PDF escaneado. Junta los errores de JavaScript.
- **Requisitos:** `webkit2gtk-driver`, `xvfb` y `selenium`, con la app servida en `http://127.0.0.1:4173/`.
- **Límites:**
  - no es Safari de iPhone;
  - depende del panel de desarrollo (`?dev=1`);
  - no está en la integración continua (`.github/workflows/ci.yml` corre tipos, unitarias, compilación y Playwright con Chromium).

### 2.4 Lo que las pruebas automáticas no cubren hoy

- **Todo lo del servidor real:** cuentas compartidas entre dispositivos, correos, reglas por fila, borrado, moderación y validación de compras.
- **La compilación de publicación:** que el panel de desarrollo no aparezca y que no se vea «Prueba local» (D10 y GP-09). Hoy ninguna prueba corre sin `?dev=1` en los flujos con cuenta.
- **Accesibilidad:** no hay pruebas automáticas de contraste, etiquetas ni foco.
- **Idiomas inglés y portugués de punta a punta**, ni la detección de textos fijos fuera de los archivos de idioma.
- **Rendimiento:** solo se registran los segundos del OCR (`tests/.artifacts/ocr-*.json`), medidos en la máquina de pruebas. No representan un celular.
- **El botón y el gesto atrás**, ni la navegación con el historial.
- **Seguridad del contenido:** HTML o JavaScript en reseñas y conversaciones, o un `.docx` armado para inyectar código.

### 2.5 Observaciones de la lectura del código

No son fallas comprobadas: salen de leer, no de ejecutar. Se confirman en el primer encargo de verificación.

| # | Observación | Consecuencia | Para |
|---|---|---|---|
| O1 | Los ayudantes `signUp`, `setPlan` y `asPremium` usan `?dev=1` y el panel. Lo usan 08, 09, 10, 11, 12, 99 y la prueba de Safari | Cuando se cierre el panel (P01, D10), esas pruebas pierden la forma de tener premium. Además, el estado «sin panel» nunca se prueba | Desarrollo app |
| O2 | `.gitignore` excluye `*.jks`, `*.keystore` y `keystore.properties`, pero no `key.properties`, que GP-22 también menciona | Riesgo solo si el proyecto de Android usa ese nombre | Desarrollo app |
| O3 | En el esquema de referencia (`docs/backend.md`), `revoke update (likes) on reviews from authenticated` tiene la misma limitación que el propio documento explica para `profiles`: revocar una columna no anula el permiso sobre toda la tabla | Un usuario podría cambiar el contador de likes por la API. El esquema no está probado: hay que cubrirlo con una prueba de reglas (SEG-03) | Servidor |
| O4 | La app calcula la edad con la fecha del dispositivo y el servidor con `current_date`, en UTC si no se configura otra. `docs/backend.md` lo documenta: decide el servidor | El día del cumpleaños número 16, la app y el servidor pueden discrepar unas horas. Hace falta un mensaje claro si el servidor rechaza lo que la app permitió (EDA-10) | Servidor y Desarrollo app |
| O5 | El OCR carga solo el modelo de español (`createWorker('spa', …)` en `src/import/ocr.ts`) | Los textos en inglés y, sobre todo, en portugués (ã, õ, ç) pueden reconocerse peor. Afecta a dos mercados de D04 (LEC-11) | Desarrollo app y Producto |
| O6 | La prueba de Safari centra los botones antes de tocarlos porque, si no, quedan «bajo la barra fija de abajo» | Posible foco tapado por la barra de pestañas (criterio 2.4.11 de WCAG 2.2) para quien navega con teclado o lector de pantalla (ACC-07) | Diseño y Desarrollo app |
| O7 | `05-escaneado-ocr` exige que **ninguna** petición salga del origen desde que se abre la página | Con `VITE_BACKEND=remote`, la app consulta al servidor al arrancar y la prueba fallaría por diseño. Hay que ajustarla para permitir solo el dominio del servidor y comprobar que ninguna petición lleve contenido del documento | Desarrollo app |
| O8 | 09 y 12 comprueban el aviso «Prueba local» y que la recuperación «necesita el servidor» | Con el servidor real esas comprobaciones dejan de valer: hay que reemplazarlas, no borrarlas | Desarrollo app |
| O9 | `src/import/ocr.ts` guarda en español los avisos de importación («los avisos se guardan como texto») | Un documento importado en español conserva sus avisos en español aunque después se cambie el idioma (IDI-06) | Desarrollo app y Localización |
| O10 | El campo de fecha de nacimiento es `type="date"`, con `max` igual a hoy | En Android abre el selector nativo. Hay que comprobar que no preseleccione una fecha que habilite el club y que llegar a un año lejano (por ejemplo, 1950) sea viable con TalkBack (EDA-11) | QA (a mano) |
| O11 | El lector de PDF usa la compilación «legacy» de pdf.js 6.3, que según su documentación pide Chrome 125 o posterior | Fija la versión mínima real de Android. Ver la sección 4.1 | Desarrollo app |

---

## 3. Matriz de casos por área

### Cómo leer las tablas

- **Planes:** S, sin cuenta; G, gratuito; P, premium. «<16» y «16+» indican la edad de la cuenta.
- **Cobertura hoy:**
  - «E2E nn» es `tests/e2e/nn-*.spec.ts`; «U nombre» es `tests/unit/nombre.test.ts`; «SAF» es la prueba de Safari.
  - «(local)» indica que solo está cubierto con el servicio local de prueba.
  - «Mano» es un recorrido a mano.
  - «Falta» lleva entre paréntesis la tarea de la que depende.
- **Prioridad:**
  - **1:** se recorre en cada versión candidata.
  - **2:** en la primera versión candidata y cuando cambia el área.
  - **3:** antes de producción.
- Los resultados esperados que dependen de una especificación que no existe dicen «según la especificación». Si al probar no hay especificación, se pide a Producto antes de dar el caso por bueno.

### 3.1 Lectura

| ID | Caso y resultado esperado | Planes | Cobertura hoy | GP | Prio. |
|---|---|---|---|---|---|
| LEC-01 | Word: se conservan títulos, listas, tablas, citas, imágenes, negritas y saltos de página | Todos | E2E 01 | GP-20 | 1 |
| LEC-02 | Un `.doc` antiguo se rechaza con instrucciones para convertirlo. Un archivo que no es Word ni PDF se rechaza | Todos | E2E 06 | — | 2 |
| LEC-03 | PDF con texto: se detecta, conserva la numeración impresa y el índice, y avisa la página de orden dudoso | Todos | E2E 03 | GP-20 | 1 |
| LEC-04 | PDF en modo renglón: sin encabezados ni números repetidos, con guiones reconstruidos y figuras. Se puede ver la página original | Todos | E2E 03 | — | 1 |
| LEC-05 | OCR: detecta el escaneo, muestra el progreso y termina. En las páginas limpias, error de caracteres menor al 1 %. La página degradada se avisa y lleva a la original | Todos | E2E 05, SAF | GP-20 | 1 |
| LEC-06 | OCR: «Detener» conserva lo reconocido y se puede retomar | Todos | Falta | — | 2 |
| LEC-07 | OCR en el paquete de Android: la app pasa a segundo plano, se apaga la pantalla o entra una llamada durante el reconocimiento. Resultado esperado: sigue o se retoma sin cierre y sin perder lo reconocido | Todos | Mano | GP-19 | 1 |
| LEC-08 | OCR de un documento en inglés y otro en portugués (O5). Medir la precisión y decidir con Producto si alcanza | Todos | Falta | — | 2 |
| LEC-09 | Modo libro sin animación: toques, deslizamiento, teclado e «Ir a página o sección». Una página por pantalla; dos enfrentadas cuando el ancho es de 860 px o más y la pantalla está apaisada (`spreadFor` en `src/reader/FlowBook.tsx`). En tabletas, revisar las dos orientaciones | Todos | E2E 01, 03 | — | 1 |
| LEC-10 | Modo libro vertical en Word y PDF: deslizamiento, toques arriba y abajo, teclado y rueda | Todos | E2E 08 | — | 2 |
| LEC-11 | Modo libro **con** animación: la hoja se dobla, descubre la siguiente y vuelve al retroceder. Pases rápidos sin hojas colgadas. Arrastre que se completa o se devuelve. Tres velocidades. En PDF también | P | E2E 08, SAF (vía `?dev=1`) | — | 1 |
| LEC-12 | Animación sin premium: el interruptor está deshabilitado, lo explica y lleva a los planes | S, G | E2E 08 | GP-41 | 1 |
| LEC-13 | Animación con «reducir movimiento» del sistema activado: no se muestra y la app lo explica (`settings.curl.reducedMotion`) | P | Falta | — | 2 |
| LEC-14 | Modo renglón: cada toque avanza un renglón, también entre párrafos y títulos. Se retrocede con toque, botón y teclado | Todos | E2E 02, SAF | — | 1 |
| LEC-15 | Modo renglón: cambiar letra, ancho, interlineado, tema, **tipografía** o contexto, o girar el equipo, mantiene el lugar | Todos | E2E 02 (sin tipografía ni contexto) | — | 2 |
| LEC-16 | Continuidad entre modos en Word y PDF | Todos | E2E 04 | — | 1 |
| LEC-17 | Punto de lectura: sobrevive a cerrar la app. En Android, también a cerrarla desde «Recientes» y a que el sistema la cierre por memoria | Todos | E2E 04 (navegador); Mano (Android) | GP-19 | 1 |
| LEC-18 | Archivos difíciles: PDF de 300 páginas o más, Word con 100 imágenes, PDF con contraseña, PDF o Word dañado, archivo vacío, archivo de más de 300 MB y nombres con tildes o emojis. Resultado esperado: abren o se rechazan con un mensaje claro, sin cierres | Todos | Falta | GP-19 | 2 |
| LEC-19 | Abrir documentos con el selector del sistema desde Descargas, Drive, la tarjeta de memoria y los adjuntos de mensajería. No se piden permisos de almacenamiento | Todos | Mano | GP-54 | 1 |
| LEC-20 | Temas claro, sepia y oscuro, y el modo oscuro del sistema: no hay oscurecimiento doble ni textos ilegibles | Todos | E2E 02 (parcial); Mano | — | 2 |

### 3.2 Biblioteca y límite del plan

| ID | Caso y resultado esperado | Planes | Cobertura hoy | GP | Prio. |
|---|---|---|---|---|---|
| BIB-01 | Plan gratuito: el contador marca «n de 5». El sexto se frena con la explicación y el enlace a los planes. Eliminar libera lugar | S, G | E2E 10 | — | 1 |
| BIB-02 | Premium sin límite de cantidad. Al volver a gratuito se siguen leyendo los documentos, pero no se cargan nuevos hasta bajar de 5 | P → G | E2E 10 (con el panel) | — | 1 |
| BIB-03 | El paso de premium a gratuito por **vencimiento real** de la suscripción produce lo mismo que BIB-02 | P → G | Falta (P08) | GP-59 | 1 |
| BIB-04 | Documentos cargados sin cuenta: se ofrecen para sumarlos a la cuenta, respetando el límite | S → G | E2E 10 | — | 2 |
| BIB-05 | Eliminar un documento borra su contenido, su progreso y sus recursos | Todos | E2E 06 | — | 2 |
| BIB-06 | Cada cuenta ve solo su biblioteca en un dispositivo compartido. Al cerrar sesión no se ven los documentos de la cuenta | G, P | E2E 10 (parcial) | — | 2 |
| BIB-07 | Almacenamiento casi lleno: la importación lo explica y no deja documentos a medias | Todos | Falta | GP-19 | 2 |
| BIB-08 | La misma cuenta en dos dispositivos: el límite se aplica en cada dispositivo, porque la biblioteca no se sincroniza. Confirmar con Producto que es lo esperado | G | Mano | — | 3 |
| BIB-09 | Migración de los datos locales (P11): quien tenía una cuenta del servicio local de prueba no pierde sus documentos ni su progreso al pasar a la versión con servidor. La cuenta de prueba no se presenta como real | G, P | Falta (P11) | — | 1 |

### 3.3 Cuentas: registro, ingreso, recuperación y borrado

| ID | Caso y resultado esperado | Planes | Cobertura hoy | GP | Prio. |
|---|---|---|---|---|---|
| CTA-01 | Registro válido con nombre, correo, contraseña y confirmación: la sesión queda iniciada con el plan gratuito | S → G | E2E 09 (local), SAF | — | 1 |
| CTA-02 | Validaciones: correo o nombre repetidos (sin distinguir mayúsculas), nombre de 3 a 30 caracteres, contraseña de 8 o más, correo inválido y confirmación distinta. Cada caso tiene un mensaje claro | S | U community, E2E 09 (local) | — | 2 |
| CTA-03 | **Aceptación expresa** de los términos, las normas y la privacidad antes de crear la cuenta, de publicar por primera vez y de contratar premium. Sin aceptar no se avanza. Los textos se pueden leer completos antes de aceptar | S, G | Falta (P04 y tarea nueva) | GP-35 | 1 |
| CTA-04 | Enlace a la política de privacidad visible **sin iniciar sesión**, al menos en el registro y en el perfil | Todos | Falta (P04) | GP-24 | 1 |
| CTA-05 | Si el servidor pide confirmar el correo: el correo llega, el enlace funciona desde Android y desde la web, y está en el idioma de la persona | S | Falta (P02) | — | 1 |
| CTA-06 | Ingreso: correcto, con contraseña equivocada y con un correo que no existe. El mensaje no revela si el correo tiene cuenta. Después de varios intentos fallidos, hay un límite | S | E2E 09 (parcial, local); Falta (P02) | — | 1 |
| CTA-07 | La sesión persiste al cerrar y abrir la app. «Cerrar sesión» funciona. Una sesión vencida pide ingresar de nuevo sin perder lo que se estaba haciendo | G, P | Mano | — | 1 |
| CTA-08 | Después de ingresar se vuelve a donde se estaba (`?volver=`) | S | E2E 09 | — | 2 |
| CTA-09 | Recuperación por correo: llega en pocos minutos, el enlace sirve una sola vez y vence, la contraseña vieja deja de valer y el mensaje es el mismo exista o no la cuenta. En los tres idiomas | S | E2E 09 solo comprueba que hoy se informa como pendiente; Falta (P02) | — | 1 |
| CTA-10 | **Borrado dentro de la app:** está en «Cuenta», pide confirmación (y la contraseña, si así se especifica) y avisa que hay que cancelar antes la suscripción de Google Play. Después: el ingreso falla, y el servidor ya no tiene la cuenta, la fecha de nacimiento, las reseñas, los likes, las conversaciones, las respuestas ni los bloqueos. Los contadores de likes de las reseñas ajenas se recalculan | G, P | Falta (P03) | GP-31, GP-33 | 1 |
| CTA-11 | **Borrado por la página web, sin la app:** funciona, nombra la app o al desarrollador como en la ficha, muestra el pedido en forma destacada, explica que hay que cancelar la suscripción y qué datos se conservan, y ofrece un canal de soporte | G, P | Falta (P03 y P12) | GP-32 | 1 |
| CTA-12 | Borrado con la suscripción activa: la suscripción **no** se cancela sola en Google Play (así lo dicen los borradores de términos y de privacidad). El aviso es claro y no se cobra nada que el texto no anuncie | P | Falta (P03 y P08) | GP-32 | 1 |
| CTA-13 | Borrado y documentos del dispositivo: qué pasa con la biblioteca local, según la especificación de Producto | G, P | Falta (decisión) | — | 2 |
| CTA-14 | Plazo de borrado: dentro de los 5 días hábiles que promete el borrador de privacidad. Las copias de seguridad, dentro del plazo que el texto anuncia | G | Falta (P03) | GP-33 | 3 |
| CTA-15 | Borrar una conversación del club borra también las respuestas de otras personas (N-06 del borrador de privacidad). Se verifica lo que decida el titular | P, 16+ | Falta (decisión N-06) | GP-33 | 2 |
| CTA-16 | Las preferencias de lectura siguen a la cuenta | G | E2E 09 | — | 3 |
| CTA-17 | Nombres de usuario ofensivos, que imitan al equipo («admin», «moderador», «Knowmadic») o con datos personales: se rechazan o se moderan, según las normas | S | Falta (P05) | GP-36 | 2 |

### 3.4 Edad: Reading Club desde los 16 y fecha bloqueada

Rige D09: **registro abierto a cualquier edad**. Los borradores legales recomiendan otra cosa (N-01): 13 años o más para tener cuenta, 16 en Brasil, y la fecha de nacimiento al registrarse. Mientras el titular no decida, los casos EDA-16 y EDA-17 quedan como condicionales.

| ID | Caso y resultado esperado | Planes | Cobertura hoy | GP | Prio. |
|---|---|---|---|---|---|
| EDA-01 | El registro no pide la fecha de nacimiento (D09). El perfil explica que se pide al entrar por primera vez al club | S → G | E2E 12, U age | GP-47 | 1 |
| EDA-02 | Primera entrada al club: se pide la fecha **antes** de ofrecer premium, en las tres rutas (`#/club`, `#/club/nueva` y una conversación). El campo empieza vacío | G, P | E2E 12 | GP-47 | 1 |
| EDA-03 | Antes de guardar se muestra la fecha larga para confirmarla y se puede corregir | G, P | E2E 12 | GP-47 | 2 |
| EDA-04 | Menor de 16: «no está disponible para tu edad», sin ofrecerle premium, **aunque sea premium**. El resto de la app (biblioteca y reseñas) sigue igual | <16 | E2E 12, U age | GP-47 | 1 |
| EDA-05 | Quien cumple 16 hoy entra; a quien le falta un día, no. El 29 de febrero se cumple el 1 de marzo en los años no bisiestos | 16+ | U age (local) | GP-47 | 1 |
| EDA-06 | Fechas inexistentes, futuras o anteriores a 1900 se rechazan con un mensaje claro | G | U age, E2E 12 (futura) | — | 2 |
| EDA-07 | La fecha queda bloqueada: no hay forma de cambiarla desde la app, tampoco después de cerrar e iniciar sesión | G, P | E2E 12, U age | GP-47 | 1 |
| EDA-08 | **El servidor rechaza al menor aunque se altere la app:** con la sesión de una cuenta menor de 16 y premium, leer, publicar o responder directo contra la API devuelve error. Tampoco se puede cambiar la fecha por la API | <16, P | Falta (P02) | GP-47 | 1 |
| EDA-09 | La fecha de nacimiento no es visible para otras personas, tampoco por la API | Todos | Falta (P02) | GP-28 | 1 |
| EDA-10 | Cumpleaños número 16 cerca de la medianoche, con el equipo en la hora de Argentina y el servidor en UTC (O4). Si el servidor rechaza lo que la app permitió, el mensaje es claro y no queda una pantalla rota | 16+ | Falta | GP-47 | 2 |
| EDA-11 | Selector de fecha nativo de Android: no preselecciona una fecha que habilite el club. Elegir 1950 es viable con el dedo y con TalkBack (O10) | G | Mano | GP-47 | 1 |
| EDA-12 | Quien cumple 16 entra desde ese día, sin volver a cargar la fecha | 16+ | U age (parcial); Mano | — | 2 |
| EDA-13 | Corrección de la fecha por soporte: existe el procedimiento, pide evidencia y queda registrado (`docs/backend.md`) | — | Mano (Servidor) | — | 3 |
| EDA-14 | Con el reloj del equipo atrasado o adelantado no se habilita ni se deshabilita el club por error | <16, 16+ | U age (reloj atrasado) | — | 3 |
| EDA-15 | Si Legal concluye que aplica la ley de Brasil o la de Texas: se obtiene la franja de edad de la tienda (Play Age Signals) y se usa según la especificación | Todos | Falta (decisión) | GP-48 | 3 |
| EDA-16 | *Condicional (N-01, variante B):* el registro pide la fecha. Con menos de 13 años no se crea la cuenta y la fecha no se guarda. En Brasil, con menos de 16 | S | Falta (decisión) | GP-44 | — |
| EDA-17 | *Condicional (recomendación 3 de la sección 3 de `google-play.md`):* quien indica menos de 13 puede leer, pero no publicar ni tener perfil público | S, G | Falta (decisión) | GP-40, GP-44 | — |

### 3.5 Reseñas y likes

| ID | Caso y resultado esperado | Planes | Cobertura hoy | GP | Prio. |
|---|---|---|---|---|---|
| RES-01 | Sin cuenta se leen. Para publicar o dar like se pide iniciar sesión | S | E2E 11 | — | 1 |
| RES-02 | Publicar con los campos obligatorios y una categoría válida. Los largos máximos de `TEXT_LIMITS` se respetan en la pantalla y en el servidor | G | U community (obligatorios y categoría); Falta (largos) | — | 2 |
| RES-03 | Búsqueda sin mayúsculas ni tildes por libro o autor, filtro por categoría y los dos órdenes. En el servidor, con `unaccent` | Todos | E2E 11, U community, SAF; Falta (servidor) | — | 1 |
| RES-04 | Un like por persona y reseña, que se puede retirar y nunca a lo propio. El contador es correcto | G | E2E 11, U community | GP-41 | 1 |
| RES-05 | Dos personas dan like a la vez desde dos dispositivos: el contador queda bien | G | Falta (P02) | — | 2 |
| RES-06 | El contador de likes no se puede modificar por la API (O3) | G | Falta (P02) | — | 1 |
| RES-07 | Las reseñas con spoiler quedan tapadas hasta que cada persona decide verlas | Todos | E2E 11 | — | 2 |
| RES-08 | Solo quien publicó edita o elimina. Lo editado lo dice. El perfil muestra las reseñas propias | G | E2E 11, U community | — | 1 |
| RES-09 | HTML o JavaScript en el título o el cuerpo se muestra como texto y no se ejecuta | G | Falta | GP-39 | 1 |
| RES-10 | Lo que publica una persona lo ve otra en otro dispositivo (servidor real) | Todos | Falta (P02) | GP-09 | 1 |
| RES-11 | Con 500 reseñas o más, la lista carga de forma progresiva y la búsqueda responde rápido | Todos | Falta (P02) | — | 3 |
| RES-12 | Las reseñas de menores (D09) no muestran nada que identifique su edad y se pueden denunciar como cualquier otra | <16 | Falta (P05) | GP-40 | 2 |

### 3.6 Reading Club

| ID | Caso y resultado esperado | Planes | Cobertura hoy | GP | Prio. |
|---|---|---|---|---|---|
| CLU-01 | Sin cuenta o con plan gratuito se ve qué ofrece, el aviso de 16 años y cómo acceder, pero no las conversaciones, ni siquiera por enlace directo | S, G 16+ | E2E 12 | — | 1 |
| CLU-02 | Premium con 16 o más: publica, responde y edita o elimina solo lo propio. Los contadores de respuestas son correctos. El perfil muestra sus publicaciones y respuestas | P 16+ | E2E 12, U community | — | 1 |
| CLU-03 | Categorías y largos: título de hasta 150 caracteres, cuerpo de hasta 20.000 y respuesta de hasta 10.000 | P 16+ | Falta | — | 2 |
| CLU-04 | Si vence premium, se pierde el acceso. Qué pasa con lo publicado, según la especificación | P → G | Falta (P08) | GP-59 | 2 |
| CLU-05 | El servidor aplica `club_member()` en leer, publicar, editar, borrar y responder, también con una sesión alterada | G, P, <16 | Falta (P02) | GP-47 | 1 |
| CLU-06 | Las conversaciones se ven entre dispositivos y se ordenan por la última actividad | P 16+ | Falta (P02) | GP-09 | 1 |
| CLU-07 | HTML o JavaScript en las conversaciones y respuestas se muestra como texto | P 16+ | Falta | GP-39 | 1 |
| CLU-08 | Spoilers en el club: «[SPOILER]» en el título, como pide el borrador de normas, o la marca que defina Producto | P 16+ | Falta (decisión) | — | 3 |

### 3.7 Moderación: denunciar, bloquear y filtrar

Los resultados esperados siguen el borrador de normas de la comunidad (`docs/legal/normas-de-la-comunidad.md`, secciones 5 a 9), que no está aprobado.

| ID | Caso y resultado esperado | Planes | Cobertura hoy | GP | Prio. |
|---|---|---|---|---|---|
| MOD-01 | «Denunciar» está en cada reseña, conversación, respuesta y nombre de usuario, desde todos los lugares donde aparecen. Ofrece los ocho motivos del borrador y un comentario opcional. Confirma que la denuncia se recibió | G, P | Falta (P05) | GP-37 | 1 |
| MOD-02 | La denuncia llega a la cola de revisión con el contenido, el autor, quien denunció, el motivo y la fecha. La persona denunciada no sabe quién la denunció | — | Falta (P05) | GP-37, GP-39 | 1 |
| MOD-03 | Denuncias repetidas de la misma persona sobre el mismo contenido no se acumulan. Una denuncia sin sesión va por el correo de soporte (sección 6.2 del borrador) | S, G | Falta (P05) | GP-37 | 2 |
| MOD-04 | **Bloquear** desde el perfil o desde una publicación: quien bloquea deja de ver las reseñas, conversaciones y respuestas de la persona bloqueada. La bloqueada no puede responder en sus conversaciones ni darle like, y no recibe aviso. Desbloquear desde «Cuenta › Usuarios bloqueados» lo revierte. No afecta a terceros | G, P | Falta (P05) | GP-38 | 1 |
| MOD-05 | Filtro de contenido objetable: retiene los términos y enlaces de la lista en español, inglés y portugués, también con mayúsculas, tildes, espacios, signos o letras repetidas. No bloquea palabras legítimas de una reseña literaria: hay que medir los falsos positivos con reseñas reales. Si el filtro se equivoca, se puede pedir revisión humana | G, P | Falta (P05) | GP-40 | 1 |
| MOD-06 | Acciones del moderador: retirar el contenido hace que desaparezca para todos. Suspender impide publicar durante el plazo. Cerrar la cuenta impide ingresar. Se avisa a quien publicó y a quien denunció, como dice la sección 7 del borrador | — | Falta (P05) | GP-39 | 1 |
| MOD-07 | Plazos: los casos graves se revisan dentro de las 24 horas y los demás dentro de los 3 días hábiles (valores del borrador). Se mide durante la prueba cerrada con denuncias de prueba | — | Mano | GP-39 | 1 |
| MOD-08 | Las denuncias de acoso o riesgo que involucran a menores se tratan como graves | — | Falta (P05) | GP-40 | 1 |
| MOD-09 | Apelación: el enlace del aviso funciona y la respuesta llega dentro del plazo del borrador | G | Falta (P05) | GP-39 | 3 |
| MOD-10 | Un contenido retirado se conserva solo el plazo que anuncia la política y no vuelve a verse al restaurar una copia de seguridad | — | Falta (P05) | GP-33 | 3 |
| MOD-11 | Faltas repetidas: la escala de sanciones se aplica. Quien tiene la cuenta cerrada por falta grave no puede crear otra con el mismo correo | G | Falta (P05) | GP-39 | 3 |

### 3.8 Planes y cobro

Requieren el paquete instalado desde una pista de Play y **testers con licencia**: quien no lo es paga de verdad las compras de una pista de prueba ([pruebas de Billing][billing-test]). Para probar se usan los instrumentos de prueba de Google («Test instrument, always approves», «always declines», las tarjetas lentas que aprueban o rechazan después de unos minutos y la que aprueba y después contracarga) y Play Billing Lab para forzar la gracia y la suspensión ([pruebas de Billing][billing-test]).

| ID | Caso y resultado esperado | Planes | Cobertura hoy | GP | Prio. |
|---|---|---|---|---|---|
| COB-01 | La página de planes compara gratuito y premium como dice `src/config/plans.ts` | Todos | E2E 09, U community | GP-41 | 2 |
| COB-02 | **Pantalla de oferta** antes de comprar, sin pasos extra: precio en la moneda local, período, qué incluye, renovación automática, cómo cancelar y enlaces a términos y privacidad. En el plan anual no se destaca el precio mensual. Si hay prueba gratis: cuánto dura, cuándo se cobra y cómo cancelar | S, G | Falta (P09) | GP-60 | 1 |
| COB-03 | Compra aprobada: premium se habilita **solo después de la validación en el servidor**. La compra queda reconocida: en la consola, la orden no aparece reembolsada. Con testers con licencia, las compras no reconocidas se reembolsan solas a los 3 minutos ([pruebas de Billing][billing-test]) | G → P | Falta (P08) | GP-56, GP-58 | 1 |
| COB-04 | Compra rechazada: sigue en gratuito, con un mensaje claro | G | Falta (P08) | GP-58 | 1 |
| COB-05 | Compra pendiente (tarjeta lenta): no se habilita nada mientras está pendiente, tampoco si se reinicia la app. Si se aprueba, se habilita. Si se rechaza, no | G | Falta (P08) | GP-58 | 1 |
| COB-06 | Cerrar la hoja de compra de Google sin pagar no cambia nada | G | Falta (P08) | — | 2 |
| COB-07 | **Restauración:** después de reinstalar, y en otro dispositivo con la misma cuenta de Google, premium vuelve. La consulta de compras se hace al conectar con Billing y al volver a la app | P | Falta (P08) | GP-58, GP-59 | 1 |
| COB-08 | Otra cuenta de Knowmadic en el mismo teléfono y con la misma cuenta de Google: no hereda el premium de la primera, y el mensaje lo explica, según la especificación | G | Falta (decisión) | GP-59 | 2 |
| COB-09 | Renovaciones aceleradas: la mensual se renueva cada 5 minutos y la anual cada 30, hasta 6 veces ([pruebas de Billing][billing-test]). Premium continúa en cada una. Al terminar, vuelve a gratuito (BIB-03 y CLU-04) | P | Falta (P08) | GP-59 | 1 |
| COB-10 | **Cancelar:** el enlace del perfil abre el centro de suscripciones de Google Play con el producto y el paquete, y la app explica cómo cancelar. Premium sigue hasta el final del período pagado | P | Falta (P08); hoy E2E 09 comprueba «próximamente» | GP-61 | 1 |
| COB-11 | Período de gracia (5 minutos en prueba) con acceso, suspensión (10 minutos) sin acceso y recuperación al actualizar el medio de pago ([pruebas de Billing][billing-test]) | P | Falta (P08) | GP-59 | 1 |
| COB-12 | **Reembolso y revocación** desde la consola: premium se retira cuando llega la notificación al servidor | P | Falta (P08) | GP-59 | 1 |
| COB-13 | Contracargo con la tarjeta de prueba que aprueba y después contracarga: premium se retira | P | Falta (P08) | GP-59 | 2 |
| COB-14 | Cambio entre el plan mensual y el anual, si existen los dos (T05) | P | Falta (T05) | GP-62 | 2 |
| COB-15 | Sin conexión con premium vigente: se respeta durante el tiempo que defina la especificación y, al volver la conexión, se reconcilia | P | Falta (decisión) | — | 2 |
| COB-16 | En Android no hay enlaces ni botones hacia otros medios de pago. Si la web cobra por otro medio, el paquete no lo muestra | Todos | Mano | GP-57 | 1 |
| COB-17 | Los precios se ven en la moneda de cada mercado (pesos argentinos, reales, dólares) y coinciden con la consola | S, G | Mano | GP-62, GP-79 | 1 |
| COB-18 | ◆ Conciliación diaria entre RevenueCat y el servidor: detecta una diferencia forzada | — | Falta (P08) | GP-58 | 2 |
| COB-19 | Botón de baja de Argentina en la web (borrador de términos, sección 7.4): funciona sin registrarse y da el código de trámite dentro de las 24 horas | P | Falta (P04 y P08) | — | 2 |
| COB-20 | Un tester **sin** licencia no prueba compras: la lista de testers con licencia coincide con la de la prueba cerrada | — | Mano | GP-10 | 1 |
| COB-21 | Credenciales de revisión: la cuenta premium que otorga el servidor ve todo lo pago y no depende del panel de desarrollo | P 16+ | Falta | GP-73 | 1 |

### 3.9 Idiomas: español, inglés y portugués

Hoy solo el español se elige solo (`ENABLED_LOCALES = ['es']`). `en.ts` y `pt.ts` están vacíos y lo que falta se muestra en español. La variante del español espera a T06.

| ID | Caso y resultado esperado | Cobertura hoy | GP | Prio. |
|---|---|---|---|---|
| IDI-01 | No hay claves crudas, `{dato}` sin reemplazar ni textos fijos fuera de los archivos de idioma en ninguna pantalla | U i18n (estructura); Falta (pantallas) | — | 1 |
| IDI-02 | Con inglés y portugués habilitados, el idioma del dispositivo elige el de la app, también el idioma por app de Android 13 o posterior. Cualquier otro idioma cae al español | U i18n (`detectLocale`); Falta (pantallas) | — | 1 |
| IDI-03 | La vista previa con `?lang=en`, `?lang=pt`, `?lang=es` y `?lang=auto` funciona y se recuerda | Falta | — | 3 |
| IDI-04 | Plurales, fechas y números en el formato de cada idioma | U i18n | — | 2 |
| IDI-05 | Desbordes: los textos más largos no cortan botones, pestañas ni hojas en una pantalla de 360 dp | Falta | — | 1 |
| IDI-06 | Contenido guardado: las categorías se guardan en español y se muestran traducidas. Los avisos de importación quedan en el idioma en que se importó (O9). Se documenta y Producto decide si está bien | Mano | — | 2 |
| IDI-07 | Enlaces legales, correos de registro y recuperación, pantalla de cobro, página de borrado y ficha de la tienda en los tres idiomas | Falta (P04, P09, P13) | GP-68 | 1 |
| IDI-08 | El selector de fecha, el teclado y los mensajes del sistema aparecen en el idioma de la app | Mano | — | 2 |
| IDI-09 | El atributo de idioma del documento cambia con el idioma, para que TalkBack pronuncie bien | Mano | — | 2 |
| IDI-10 | Voseo coherente en español. Si T06 crea es-419 neutro, las dos variantes se prueban por separado | Mano | — | 2 |

### 3.10 Sin conexión y actualización de la app

| ID | Caso y resultado esperado | Plataforma | Cobertura hoy | GP | Prio. |
|---|---|---|---|---|---|
| OFF-01 | Después de la primera visita, la app abre y se lee sin conexión | Web | E2E 04 | — | 1 |
| OFF-02 | OCR sin conexión cuando nunca se usó con conexión: los recursos del OCR se guardan recién al usarse (`vite.config.ts`). Resultado esperado: un mensaje claro, no un error mudo | Web | Falta | — | 2 |
| OFF-03 | Primera apertura sin conexión: biblioteca, lectura y OCR funcionan, porque los recursos van dentro del paquete | Android | Mano | GP-19 | 1 |
| OFF-04 | Cuentas, reseñas, club y cobro sin conexión: mensajes claros y sin cierres. Si la conexión se corta al publicar, el texto escrito no se pierde | Ambas | Falta | GP-19 | 1 |
| OFF-05 | Red lenta o intermitente (perfil 3G, modo avión a mitad de una acción) al publicar, dar like y comprar: no hay publicaciones duplicadas ni likes dobles | Ambas | Mano | — | 2 |
| OFF-06 | Una versión nueva de la web reemplaza a la anterior sin cerrar la app y sin perder el lugar | Web | E2E 07 | — | 1 |
| OFF-07 | **Actualizar desde Play** de la versión N a la N+1, instalada desde la prueba interna: se conservan la biblioteca, el progreso, las preferencias y la sesión | Android | Mano | GP-19 | 1 |
| OFF-08 | La versión anterior de la app sigue funcionando con el servidor nuevo durante la transición, porque conviven dos versiones (riesgo citado en la propuesta de T03) | Android | Mano | — | 1 |
| OFF-09 | Si cambia la estructura de la base local (IndexedDB), la migración no pierde datos | Ambas | Falta | — | 2 |
| OFF-10 | ◆ El origen de la WebView no cambia entre versiones. **Deducción, sin fuente oficial de Capacitor:** IndexedDB y `localStorage` quedan atados al origen, así que si cambian el esquema o el nombre del servidor de la WebView, la biblioteca local quedaría en otro origen. OFF-07 lo detectaría | Android | Mano | — | 1 |
| OFF-11 | Al reinstalar se pierde lo que estaba solo en el dispositivo (es lo esperado y la política lo dice), pero se recuperan la cuenta y el premium | Android | Mano | GP-59 | 2 |
| OFF-12 | Volver a la app después de horas en segundo plano: la sesión se renueva sola y el lector sigue donde estaba | Android | Mano | — | 2 |

### 3.11 Accesibilidad

Google Play no fija requisitos generales de accesibilidad para Knowmadic (GP-74). Como referencia interna, QA usa **WCAG 2.2, nivel AA** (Recomendación del W3C, versión del 12/12/2024, [WCAG 2.2][wcag]). No es una exigencia de la tienda: incumplir algo de esta sección se califica por su efecto en las personas.

| ID | Caso y resultado esperado | Cobertura hoy | Referencia | Prio. |
|---|---|---|---|---|
| ACC-01 | Con TalkBack se completan los flujos críticos: registro, abrir un documento, leer en los dos modos, publicar una reseña, entrar al club, comprar y borrar la cuenta | Mano | WCAG 4.1.2 | 1 |
| ACC-02 | Los botones de íconos tienen nombre. Los estados (like dado, opción elegida, interruptor) se anuncian | E2E (parcial: usan roles y `aria-pressed`) | WCAG 4.1.2 | 1 |
| ACC-03 | Hojas modales: el foco entra, queda adentro y vuelve al cerrar. «Escape» y el gesto atrás las cierran | Falta | WCAG 2.4.3 | 1 |
| ACC-04 | Con la letra del sistema al máximo, o con un zoom del 200 %, no hay textos cortados ni botones inalcanzables, y el modo libro vuelve a paginar | Mano | WCAG 1.4.4 | 1 |
| ACC-05 | A 320 px de ancho no hace falta desplazarse de costado, salvo en la página original del PDF | Mano | WCAG 1.4.10 | 2 |
| ACC-06 | Contraste de textos y controles en los temas claro, sepia y oscuro | Falta | WCAG 1.4.3 y 1.4.11 | 1 |
| ACC-07 | El foco no queda tapado por la barra de pestañas ni por la barra del lector (O6) | Mano | WCAG 2.4.11 | 1 |
| ACC-08 | Los objetivos táctiles miden al menos 24 × 24 px | Falta | WCAG 2.5.8 | 2 |
| ACC-09 | Todo lo que se hace arrastrando (la hoja, los deslizamientos) también se puede hacer con un toque o un botón | E2E 01, 08 (toques) | WCAG 2.5.7 | 2 |
| ACC-10 | «Reducir movimiento» se respeta (LEC-13) | Falta | WCAG 2.3.3 (AAA, solo referencia) | 2 |
| ACC-11 | El modo renglón con lector de pantalla tiene un comportamiento definido y útil. Producto y Diseño definen qué se espera | Falta (decisión) | — | 2 |
| ACC-12 | Teclado completo en la computadora y en Chromebook: todo se alcanza y el foco se ve | E2E (parcial) | WCAG 2.1.1 y 2.4.7 | 2 |
| ACC-13 | El escáner de accesibilidad de Google en el paquete, y la sección de accesibilidad del informe previo al lanzamiento, quedan revisados y con sus avisos clasificados | Mano | GP-74 | 2 |

### 3.12 Rendimiento en celulares de gama baja

Los umbrales son **una propuesta de QA**, que tiene que validar Producto. Se miden en el equipo de gama baja de la sección 4 (D1), con el paquete de publicación.

| ID | Caso | Umbral propuesto | Cobertura hoy | GP | Prio. |
|---|---|---|---|---|---|
| REN-01 | Arranque en frío hasta la biblioteca utilizable | 5 s o menos en gama baja, 3 s en gama media | Falta | GP-19 | 1 |
| REN-02 | Importar un Word de 50 páginas y otro de 200 | 5 s y 20 s o menos, con progreso visible | Falta | GP-19 | 2 |
| REN-03 | PDF de 300 páginas: abrir, ir a la 250 y volver | Sin cierres. La memoria no crece sin límite al recorrer 100 páginas | Falta | GP-19 | 1 |
| REN-04 | Pasar página sin y con animación | Respuesta visible en 100 ms o menos. La animación, sin saltos visibles. Si no se logra en gama baja, decidir con Producto si se desactiva ahí | Falta | — | 1 |
| REN-05 | OCR de 10 páginas | Medir segundos por página, temperatura y batería. El aviso «Calculá unos segundos por página; en celulares antiguos, algo más» (`ocr.intro.body`) tiene que ser cierto | Parcial: `tests/.artifacts/ocr-*.json`, medido en la máquina de pruebas | — | 1 |
| REN-06 | 30 minutos de lectura continua, alternando los modos | Sin cierres ni «la app no responde» | Mano | GP-19 | 1 |
| REN-07 | El sistema mata el proceso de la WebView por falta de memoria | La app vuelve a un estado útil sin perder el progreso | Mano | GP-19 | 2 |
| REN-08 | Tamaño del paquete descargado | Se informa. Sin umbral | Mano | — | 3 |
| REN-09 | Android vitals durante la prueba cerrada y en producción | Por debajo de los umbrales de mal comportamiento de Google: cierres percibidos 1,09 % y «la app no responde» 0,47 % en promedio, y 8 % por modelo de teléfono. Si se superan, Play puede bajar la visibilidad y mostrar una advertencia en la ficha ([Android vitals][vitals]). Que los datos de la prueba cerrada aparezcan en vitals no está verificado | Mano | GP-19 | 1 |

### 3.13 Plataforma Android y paquete

| ID | Caso y resultado esperado | Cobertura hoy | GP | Prio. |
|---|---|---|---|---|
| AND-01 | Borde a borde en Android 16: nada queda bajo las barras del sistema ni bajo la cámara, con navegación por gestos y con tres botones | Mano | GP-15 | 1 |
| AND-02 | Gesto y botón atrás: del lector vuelve a la biblioteca. Con una hoja abierta, la cierra. En un formulario, vuelve a la sección anterior y no pierde lo escrito sin avisar. Desde la biblioteca, sale de la app | Mano | GP-15 | 1 |
| AND-03 | En pantallas de 600 dp o más: rotación libre, pantalla dividida y ventana redimensionada sin perder el lugar. Plegable en el emulador | Mano | GP-15 | 1 |
| AND-04 | Permisos: solo los necesarios, sin almacenamiento amplio ni multimedia. La app no pide nada al abrirse | Mano (manifiesto) | GP-54 | 1 |
| AND-05 | Los enlaces externos (privacidad, términos, centro de suscripciones, borrado web) se abren y se vuelve bien a la app | Mano | GP-24, GP-61 | 1 |
| AND-06 | Los enlaces de los correos (recuperación y confirmación) llevan a donde corresponde, a la app o a la web, según la especificación | Mano | — | 1 |
| AND-07 | El teclado en pantalla no tapa los campos del registro, la reseña ni la respuesta | Mano | — | 2 |
| AND-08 | Interrupciones (llamada, notificación, rotación, bloqueo de pantalla) durante la importación, el OCR o la compra | Mano | GP-19 | 2 |
| AND-09 | La versión de publicación no es depurable y no habilita la depuración remota de la WebView: en Capacitor, `webContentsDebuggingEnabled` viene en falso salvo en desarrollo ([configuración de Capacitor][cap-config]) | Mano | — | 1 |

### 3.14 Privacidad y seguridad

| ID | Caso y resultado esperado | Cobertura hoy | GP | Prio. |
|---|---|---|---|---|
| SEG-01 | Los documentos, el texto extraído, las imágenes y el progreso **nunca** salen del dispositivo | E2E 05 (parcial; ver O7) | GP-28 | 1 |
| SEG-02 | Con un proxy, el tráfico de la app va solo al servidor declarado y a los proveedores que figuran en la política, siempre por HTTPS. El resultado se compara con el formulario de Seguridad de los datos y la tabla de diferencias queda vacía | Mano | GP-28, GP-29 | 1 |
| SEG-03 | Reglas por fila: nadie lee ni modifica datos ajenos. El plan, los likes y la fecha de nacimiento no se pueden cambiar desde la cuenta (O3) | Falta (P02) | GP-29 | 1 |
| SEG-04 | El paquete y la web no contienen secretos: ni la clave de servicio del servidor ni claves secretas de cobros (lista de publicación, LP-08) | Mano | — | 1 |
| SEG-05 | Sin permiso `AD_ID` ni bibliotecas de publicidad | Mano (manifiesto) | GP-30 | 1 |
| SEG-06 | Límite de intentos de ingreso y bloqueo de contraseñas filtradas: Supabase Pro lo ofrece, según la propuesta técnica ◆ | Falta (P02) | — | 2 |

---

## 4. Dispositivos, versiones de Android y tamaños

### 4.1 La versión mínima

- ◆ **Capacitor 8** admite **Android 7 o posterior (API 24)** y pide una WebView con Chrome 60 o posterior. En Android 7 a 9 la WebView la da Chrome; desde Android 10, la WebView del sistema ([Capacitor, Android][cap-android]).
- Capacitor 8 apunta a **Android 16 (API 36)** ([target de Capacitor][cap-target]), que es lo que exige GP-13.
- **Pero el mínimo real lo fija el lector de PDF**, no Capacitor:
  - la app usa la compilación «legacy» de pdf.js 6.3 (`src/lib/pdfjs.ts`);
  - según pdf.js, esa compilación funciona con Chrome 125 o posterior ([preguntas frecuentes de pdf.js][pdfjs]);
  - Chrome para Android hoy exige Android 10 o posterior ([requisitos de Chrome][chrome-req]).
- **Deducción, no verificada en un equipo:** en Android 7, 8 y 9, donde la WebView es Chrome y Chrome ya no se actualiza, la WebView probablemente quede por debajo de la versión 125 y los PDF no abran. La página de Chrome no dice cuál fue la última versión para esos sistemas.
- **Propuesta:**
  - QA prueba en emuladores de Android 7.0 (API 24), 9 (API 28) y 10 (API 29), con la WebView más nueva que se pueda instalar en cada uno;
  - según el resultado, Desarrollo propone fijar el mínimo en **Android 10 (API 29)**, o dejar Android 7 con un aviso claro cuando el PDF no se pueda abrir.
  - Es una decisión de Desarrollo con el coordinador, porque define qué equipos ven la app en la tienda (ver la sección 8).

### 4.2 Matriz de dispositivos

| # | Dispositivo | Android | Para qué | Cuándo |
|---|---|---|---|---|
| D1 | Celular físico de **gama baja**: 2 o 3 GB de RAM y pantalla de unos 360 dp de ancho (por ejemplo, de las líneas Moto E o G, o Galaxy A0x o A1x) | 10 a 12 | Rendimiento, memoria, OCR y flujos críticos | Cada versión candidata |
| D2 | Celular físico de gama media: 4 a 6 GB de RAM | 14 o 15 | Flujos críticos y cobro | Cada versión candidata |
| D3 | Celular físico con **Android 16** (Pixel o equivalente) | 16 | Borde a borde, gesto atrás predictivo y target 36 (GP-15) | Cada versión candidata |
| D4 | Tableta de 600 dp o más (física, o emulador de Pixel Tablet con Android 16) | 16 | Orientación libre, dos páginas por pantalla y pantalla dividida (GP-15) | Cada versión candidata |
| E1 | Emulador de Android 7.0 (API 24) | 7 | Decidir el mínimo (sección 4.1) | Primera versión candidata y cuando cambie el mínimo o pdf.js |
| E2 | Emulador de Android 9 (API 28) | 9 | El último con WebView de Chrome. Es también el mínimo del informe previo al lanzamiento | Igual que E1 |
| E3 | Emulador de Android 10 (API 29) | 10 | Mínimo probable | Igual que E1 |
| E4 | Emulador de Android 16 con tres botones, y otro plegable | 16 | Navegación y plegado | Primera versión candidata |
| W1 | Chrome en Android y en la computadora | — | La web publicada | Cada versión de la web |
| W2 | Safari en iPhone (cuando haya uno a mano) y la prueba de WebKit | — | La web publicada | Cada versión de la web |
| W3 | Firefox en la computadora | — | La web publicada | Antes de producción |

- Los modelos de D1 y D2 son ejemplos: **no hay datos verificados de participación de mercado** en Argentina, Brasil ni el resto de América. La elección final depende de lo que haya a mano y de los equipos de los testers.
- La planilla de la prueba cerrada registra el dispositivo y la versión de Android de cada persona (guía, punto 4.11). Así se ve qué parte de la matriz cubren de verdad los testers.
- Las pruebas automáticas siguen en Chromium (celular y computadora) y en WebKitGTK. No reemplazan a D1 a D4.

### 4.3 Tamaños y orientaciones

| Tamaño | Ejemplo | Qué mirar |
|---|---|---|
| 360 × 640 dp | Gama baja (D1) | Desbordes, barra de pestañas, teclado sobre los campos |
| 390 a 412 dp de ancho | Prueba de Safari y emulación de Pixel 7 | Referencia de las pruebas automáticas |
| Celular apaisado | Cualquiera | Modo libro, modo renglón y hojas |
| 600 a 860 dp | Tableta en vertical (D4) | Una página por pantalla: las dos enfrentadas aparecen recién con 860 px o más de ancho y pantalla apaisada |
| 860 dp o más, apaisado | Tableta apaisada, Chromebook, computadora | Dos páginas enfrentadas y navegación superior. Las pruebas automáticas usan otro corte (700 px en `isMobile` de `helpers.ts`): conviene revisar que no oculte casos intermedios |
| Ventana redimensionada o pantalla dividida | D4 y E4 | Repaginado sin perder el lugar |

---

## 5. Datos y cuentas de prueba

### 5.1 Archivos

| Archivo | Existe | Para qué |
|---|---|---|
| `tests/fixtures/ensayo.docx` | Sí | Word con capítulos, listas, tabla, cita, imagen y saltos de página |
| `tests/fixtures/texto.pdf` | Sí | PDF con texto de 7 páginas, numeración i, ii, 1…, índice y una página a dos columnas |
| `tests/fixtures/escaneado.pdf` y `escaneado.json` | Sí | PDF escaneado de 3 páginas, con la tercera degradada, y su texto real |
| `tests/fixtures/antiguo.doc` | Sí | Word antiguo, que se rechaza |
| PDF de 300 páginas o más | **Falta** | REN-03 y LEC-18 |
| Word de 200 páginas con 100 imágenes | **Falta** | REN-02 y LEC-18 |
| PDF protegido con contraseña, PDF dañado, Word dañado y archivo vacío | **Falta** | LEC-18 |
| Escaneados en inglés y en portugués | **Falta** | LEC-08 |
| Word con HTML o enlaces `javascript:` | **Falta** | Seguridad de la importación |

Los archivos nuevos se generan con `scripts/fixtures/make_all.py` (`npm run fixtures`) o se suman a mano. Los arma Desarrollo: QA no modifica las pruebas existentes.

### 5.2 Cuentas

**Hoy** se crean con el servicio local de prueba y premium sale del panel de desarrollo (`?dev=1`). **No son cuentas reales.** **Con el servidor**, Servidor las crea en el proyecto de prueba ◆ y, las de revisión, en el de producción.

**Dónde se guardan las credenciales**
- En el gestor de contraseñas del titular, nunca en el repositorio (regla 5 de `equipo.md`). Este documento usa solo los alias.
- Los correos: los del dominio propio cuando exista (P12). Si el proveedor de correo lo admite, con subdirecciones del tipo `qa+alias@…`.

| Alias | Plan | Edad | Para qué | Cómo se obtiene premium o el estado |
|---|---|---|---|---|
| QA-S | Sin cuenta | — | Lectura, reseñas sin sesión, puertas | — |
| QA-G | Gratuito | Sin fecha cargada | Primera entrada al club, límite de la biblioteca | — |
| QA-G16 | Gratuito | 30 años | Aviso de premium en el club | — |
| QA-M14 | Gratuito | 14 años | Menor de 16: club bloqueado, reseñas permitidas (D09) | — |
| QA-M15P | Premium | 15 años | Menor con premium: el club sigue bloqueado (EDA-04 y EDA-08) | Tester con licencia |
| QA-C16 | Gratuito o premium | Cumple 16 dentro de pocos días | EDA-12: entra desde el día del cumpleaños | Se crea cerca de la fecha |
| QA-P | Premium | 30 años | Club, animación, biblioteca sin límite, compra y restauración | Tester con licencia |
| QA-PV | Premium cancelado | 30 años | Vencimiento, gracia y suspensión (COB-09 a COB-11) | Tester con licencia y Play Billing Lab |
| QA-A y QA-B | Gratuito o premium | 30 años | Pareja para likes, bloqueo y denuncias entre dos personas, en dos dispositivos | — |
| QA-MOD | — | Adulto | Moderación: cola y acciones (MOD-02 y MOD-06) | Rol que otorga Servidor |
| QA-DEL-n | Cualquiera | Cualquiera | Descartables para el borrado (CTA-10 a CTA-12) | Se crean en cada versión candidata |
| REV-1 | Premium | Adulto, con la fecha cargada | **Revisión de Google:** ve todo lo pago y entra al club (GP-72 y GP-73) | Premium otorgado por el servidor, sin panel ni compra |
| REV-2 | Gratuito | Adulto | **Revisión de Google:** ve las puertas de premium y del club | — |

**Cuentas para la revisión de Google** (GP-72 y GP-73)
- Valen siempre, se pueden reutilizar desde cualquier país, no tienen doble factor ni códigos de un solo uso y la contraseña no vence. Se pueden cargar hasta 5 juegos ([credenciales][credenciales]).
- Van con instrucciones **en inglés**: dónde está el club, cómo abrir un documento de ejemplo y cómo denunciar y bloquear.
- Están en el servidor de **producción**, porque la versión que se revisa es la que se publica (GP-09).
- **Nada simulado como real** (regla 4): lo que vea quien revisa tiene que ser contenido real, por ejemplo de los testers o del equipo con sus propias cuentas. No se siembran reseñas ni personas inventadas.
- QA ingresa con ellas en un dispositivo limpio antes de cada envío (lista de publicación, LP-77 y LP-78).

**Testers con licencia**
- La lista de *License testing* de la consola incluye a todas las personas de la prueba cerrada que vayan a probar premium (GP-10). Quien no esté, paga de verdad ([pruebas de Billing][billing-test]).
- Hay que avisarles que las suscripciones de prueba se renuevan cada pocos minutos.

### 5.3 Entornos

| Entorno | Servicio | Para qué | Datos |
|---|---|---|---|
| Local | Servicio local de prueba (`VITE_BACKEND=local`) | Desarrollo y la suite actual | Se borran en cada prueba |
| Prueba ◆ | Proyecto de Supabase de prueba | Pruebas de reglas, prueba interna y ensayo del borrado | Cuentas QA-*, que se pueden borrar |
| Producción ◆ | Proyecto de Supabase de producción | Prueba cerrada y publicación | Datos reales. Solo las cuentas REV-* y las de los testers. Ninguna prueba destructiva |

---

## 6. Criterios de entrada y de salida, y gravedades

### 6.1 Qué es una versión candidata

Una compilación identificada por:
- el commit;
- el número de versión, incluido el `versionCode` de Android, que sube en cada envío;
- las notas de cambios;
- el entorno de servidor al que apunta;
- y, para Android, el `.aab` firmado con la clave de subida.

Se compila con `VITE_BACKEND=remote` y **sin panel de desarrollo** (D10).

### 6.2 Criterios de entrada

QA empieza a probar solo si se cumple todo esto:
1. `npm run typecheck`, `npm test` y `npm run test:e2e` pasan en la integración continua sobre el mismo commit.
2. El panel de desarrollo está cerrado y no se ve «Prueba local» en esa compilación (lista de publicación, LP-01 a LP-04).
3. El servidor del entorno indicado responde, y las cuentas de la sección 5.2 existen.
4. Para Android: el `.aab` está subido a la prueba interna y el informe previo al lanzamiento está disponible.
5. Hay una lista de los problemas conocidos, con su informe en `docs/qa/fallas/`.

Si falta algo, QA devuelve la versión al coordinador sin probarla, explicando qué falta.

### 6.3 Criterios de salida

**Para enviar a la prueba cerrada:**
- Cero fallas bloqueantes o altas abiertas. Las medias, con plan y fecha.
- La suite automática y la prueba de Safari pasan dos veces seguidas sobre la misma compilación, sin fallas sin explicar (sección 6.5).
- Los flujos críticos de la sección 6.6 pasan en D1, D3 y D4.
- Los casos de prioridad 1 de la sección 3 que ya se pueden probar, pasan.
- El informe previo al lanzamiento no muestra cierres ni «la app no responde», y sus avisos de accesibilidad están clasificados.
- La lista de publicación está completa en todos los puntos marcados para la prueba cerrada.

**Para pedir producción y publicar:** lo anterior, y además:
- la prueba cerrada cumplida: 12 personas o más durante 14 días seguidos (GP-07);
- los comentarios de la planilla, clasificados, y las fallas que surgieron, resueltas o aceptadas;
- los casos de prioridad 3, recorridos;
- Android vitals por debajo de los umbrales, si hay datos (REN-09);
- la lista de publicación completa en todos los puntos.

**Aprobación:** QA firma el informe de la versión, el coordinador lo revisa y el titular decide el envío. Pulsar «publicar» es del titular (`equipo.md`).

### 6.4 Gravedades

| Gravedad | Qué es | Ejemplos | Efecto en la versión |
|---|---|---|---|
| **Bloqueante** | Incumple una política de Google Play o una ley; expone datos, menores o dinero; o la app no sirve | Cierre al abrir. Pérdida de la biblioteca o del progreso. Cobro sin premium o premium sin cobro. Un menor de 16 entra al club. El borrado de cuenta no funciona. Se ve el panel de desarrollo o «Prueba local». Las credenciales de revisión no sirven. Falta el enlace a la privacidad. Una persona ve datos de otra | No se envía |
| **Alta** | Una función principal no anda y no hay alternativa razonable, en un dispositivo de la matriz | No abre un tipo de PDF común. El OCR falla siempre en gama baja. No llega el correo de recuperación. La restauración falla. TalkBack no puede completar un flujo crítico | No se envía, salvo una excepción que aprueba el titular, con fecha de corrección |
| **Media** | Funciona, pero mal o con un rodeo | Textos que se desbordan. Un mensaje confuso. Animación con saltos en gama baja. Contraste insuficiente en un tema | Puede salir con la falla anotada y un plan |
| **Baja** | Detalle que no afecta el uso | Alineación, una errata o un ícono | Se anota para después |

Ante la duda entre dos gravedades, se elige la más alta y el coordinador decide.

### 6.5 Informes de fallas y fallas que se repiten

- Cada falla va en `docs/qa/fallas/<fecha>-<tema>.md`, con:
  - la versión, el dispositivo y el idioma;
  - el plan y la edad de la cuenta (por alias);
  - los pasos para reproducirla;
  - el resultado esperado y el obtenido;
  - la gravedad;
  - la evidencia: captura, video, salida de la prueba o traza de Playwright;
  - el caso de este plan o el requisito GP-xx que incumple.
- Sin datos personales de los testers: se usan sus iniciales, como en la planilla de la guía.
- **Una falla que se repite nunca es «inestabilidad» hasta demostrarlo.** Si una prueba falla:
  1. se vuelve a correr hasta dos veces, guardando la traza de cada corrida;
  2. si vuelve a fallar, es una falla y se informa;
  3. si pasa, se informa igual como «intermitente», con las trazas. Si aparece dos veces en la misma versión candidata, cuenta como falla para los criterios de salida.

### 6.6 Ciclo de cada versión candidata

1. **Recepción:** se verifican los criterios de entrada (6.2).
2. **Automáticas:**
   - `npm run typecheck`, `npm test` y `npm run test:e2e`;
   - la prueba de Safari con la app servida (`xvfb-run -a python3 scripts/webkit/probar_safari.py`);
   - ◆ las pruebas de reglas del servidor;
   - el informe previo al lanzamiento.
3. **Flujos críticos a mano**, en D1, D3 y D4. Son los que pide el rol de QA:
   - **registro e ingreso:** CTA-01, CTA-03, CTA-04 y CTA-09;
   - **borrado de cuenta**, en la app y por la web: CTA-10 a CTA-12;
   - **compra y restauración:** COB-02, COB-03, COB-05, COB-07 y COB-10;
   - **denuncia y bloqueo:** MOD-01, MOD-02 y MOD-04;
   - **control de edad:** EDA-02, EDA-04, EDA-07, EDA-08 y EDA-11.
   Más una lectura completa en los dos modos (LEC-05, LEC-09, LEC-11, LEC-14 y LEC-17) y la navegación de Android (AND-01 a AND-03).
4. **Resto de la matriz**, según la prioridad de cada caso.
5. **Lista de publicación**, con la evidencia de cada punto.
6. **Informe de la versión:** se propone guardarlo en `docs/qa/versiones/<fecha>-<versión>.md`, con los resultados, las fallas abiertas y la recomendación (aprobar o rechazar).

---

## 7. Pruebas automáticas que conviene que Desarrollo agregue

En orden de prioridad. Son propuestas: QA no modifica las pruebas existentes. Cuando una prueba existente tiene que cambiar (por ejemplo, por O7 u O8), lo hace Desarrollo.

| # | Prueba | Por qué | GP o decisión | Nivel | Depende de | Para |
|---|---|---|---|---|---|---|
| 1 | **Una forma de tener premium en las pruebas que no sea el panel `?dev=1`**: una compilación solo para pruebas, o cuentas premium sembradas en el servidor de prueba | Al cerrar el panel (P01), 08, 09, 10, 11, 12, 99 y la prueba de Safari pierden su manera de tener premium (O1) | D10 | Extremo a extremo | P01 | Desarrollo app |
| 2 | **La compilación de publicación no tiene panel ni «Prueba local»**: con `?dev=1`, o con `knowmadic.dev=1` ya guardado, no aparece `dev-panel`, y con `VITE_BACKEND=remote` no aparece `local-note` | Hoy nada lo comprueba, y es bloqueante si falla | D10, GP-09 | Extremo a extremo sobre la compilación de publicación | P01 | Desarrollo app |
| 3 | **Reglas por fila** contra Supabase local, con sesiones de distintos usuarios: propiedad, likes, plan y fecha que no se pueden modificar (O3), fecha no visible para otros, club con 16 o más y premium, y la función de carga única | Es la única defensa real. La interfaz no reemplaza al servidor | GP-47, GP-29 | Servidor | P02 | Servidor |
| 4 | **Borrado de cuenta**: en la app y por la web, con la verificación del servidor de que no queda nada | GP-31 a GP-33 | GP-31 a GP-33 | Extremo a extremo y servidor | P03 | Desarrollo app y Servidor |
| 5 | **Denuncia y bloqueo**, de punta a punta, y el **filtro** con casos de evasión y de falsos positivos en es, en y pt | GP-37, GP-38 y GP-40 | GP-37, GP-38, GP-40 | Extremo a extremo y unitarias | P05 | Desarrollo app y Servidor |
| 6 | **Aceptación de términos** antes de registrarse, publicar y comprar, y enlaces legales visibles sin sesión | GP-35 y GP-24 | GP-35, GP-24 | Extremo a extremo | P04 | Desarrollo app |
| 7 | **Estados de la suscripción en el servidor**: activa, gracia, suspensión, cancelada, vencida, reembolsada, revocada y pendiente. Que cada notificación procesada dos veces dé el mismo resultado y que funcione si llegan desordenadas | Un error en los estados da o quita premium por error (riesgo citado en la propuesta de T04) | GP-58, GP-59 | Unitarias del servidor | P08 | Servidor |
| 8 | **Pantalla de oferta**: precio, período, renovación y enlaces, y el enlace de gestión con el producto y el paquete, con el cobro simulado *solo dentro de la prueba* | GP-60 y GP-61 | GP-60, GP-61 | Extremo a extremo | P09 | Desarrollo app |
| 9 | **Ajustar 05 (O7) y 09 y 12 (O8)** para el servidor real, sin perder lo que verifican | Con el servidor fallarían por diseño | GP-28 | Extremo a extremo | P02 | Desarrollo app |
| 10 | **Accesibilidad automática** con axe en las pantallas principales y en los tres temas | No hay ninguna prueba de accesibilidad. Suma una dependencia: lo decide Desarrollo | GP-74 (referencia) | Extremo a extremo | — | Desarrollo app |
| 11 | **Idiomas:** recorridos con `?lang=en` y `?lang=pt`, y un pseudoidioma que marque todo texto traducido, para detectar textos fijos y desbordes | IDI-01 e IDI-05 | GP-68 | Extremo a extremo | P10 | Desarrollo app |
| 12 | **Navegación atrás** con `page.goBack()` desde el lector, las hojas y los formularios | Es lo más cercano al gesto atrás de Android que se puede automatizar en la web | GP-15 | Extremo a extremo | — | Desarrollo app |
| 13 | **Seguridad del contenido:** HTML y JavaScript en reseñas, conversaciones y respuestas, y un `.docx` con HTML y enlaces `javascript:` | RES-09 y CLU-07 | GP-39 | Extremo a extremo y unitarias | — | Desarrollo app |
| 14 | **Largos máximos** (`TEXT_LIMITS`) en la pantalla y en el servicio | RES-02 y CLU-03 | — | Unitarias | — | Desarrollo app |
| 15 | **Rendimiento:** PDF de 300 páginas y Word de 200 con la CPU frenada por las herramientas de Chromium (4 a 6 veces), con tiempos máximos | REN-02 a REN-04. Aproxima la gama baja, pero no la reemplaza | GP-19 | Extremo a extremo | Archivos de la sección 5.1 | Desarrollo app |
| 16 | **Comunidad sin conexión:** mensajes claros y el borrador conservado | OFF-04 | GP-19 | Extremo a extremo | P02 | Desarrollo app |
| 17 | **Archivos difíciles:** PDF con contraseña, dañado, vacío o de más de 300 MB | LEC-18 | GP-19 | Extremo a extremo | Archivos de la sección 5.1 | Desarrollo app |
| 18 | **Edad y zona horaria:** la misma fecha evaluada por la app en la hora de Argentina y por el servidor en UTC, cerca de la medianoche | EDA-10 (O4) | GP-47 | Unitarias y servidor | P02 | Servidor |
| 19 | **Safari en la integración continua** (o un proyecto WebKit de Playwright) | Hoy la prueba de Safari se corre a mano | — | Integración continua | — | Desarrollo app |
| 20 | Evaluar una herramienta de pruebas de interfaz en Android (por ejemplo, Maestro o Appium) para la actualización desde Play, el gesto atrás y el cobro | Lo que solo existe en el paquete hoy se prueba solo a mano | GP-15, GP-19 | Paquete | P07 | Desarrollo app (evaluación) |

---

## 8. Riesgos y decisiones que hacen falta

**Decisiones**
1. **Versión mínima de Android** (sección 4.1): API 24, como permite Capacitor, o API 29, por el lector de PDF. Propone Desarrollo después de la prueba en E1 a E3. Decide el coordinador; si afecta el alcance de la tienda, el titular.
2. **Cómo se prueba premium sin el panel** (sección 7, punto 1). Tiene que estar resuelto **antes** de cerrar el panel, o la suite pierde la cobertura de premium.
3. **Especificaciones que faltan para dar casos por buenos** (Producto):
   - qué pasa con la biblioteca local al borrar la cuenta (CTA-13);
   - premium sin conexión (COB-15);
   - otra cuenta de Knowmadic con la misma cuenta de Google (COB-08);
   - el modo renglón con lector de pantalla (ACC-11);
   - lo publicado en el club cuando vence premium (CLU-04);
   - los umbrales de rendimiento (sección 3.12).
4. **Edad de registro** (D09 o la variante B de N-01). Cambia EDA-01, EDA-16 y EDA-17, y las cuentas de la sección 5.2. Decide el titular.
5. **Plazos de moderación** y quién modera durante la prueba cerrada (GP-39). Sin eso, MOD-07 no tiene contra qué medirse. Decide el titular.

**Riesgos**
- **Las pruebas actuales no tocan Android real.** Hasta que exista el paquete, los casos de GP-15, GP-19 y GP-54 están sin evidencia.
- **El robot del informe previo al lanzamiento probablemente no pueda iniciar sesión** (sección 1.2). La cobertura con sesión depende de QA y de los testers.
- **El límite de la biblioteca se aplica en el dispositivo**, porque los documentos no salen de él. No es un requisito de la tienda, pero Producto tiene que saber que se puede eludir, por ejemplo con otro dispositivo (BIB-08).
- **El OCR es solo en español** (O5), con dos mercados que no son de habla hispana (D04).
- **Los casos de moderación, borrado y cobro siguen borradores legales no aprobados.** Si cambian, este plan se actualiza.

---

## 9. Fuentes

Consultadas el 22/10/2026. Las fuentes de los requisitos GP-xx están en la sección 9 de `docs/requisitos/google-play.md`.

| Referencia | Página | Enlace |
|---|---|---|
| cap-android | Capacitor 8: requisitos de Android (API 24 o posterior, WebView con Chrome 60 o posterior) | https://capacitorjs.com/docs/android |
| cap-target | Capacitor: target SDK (36 en Capacitor 8) | https://capacitorjs.com/docs/android/setting-target-sdk |
| cap-config | Capacitor: configuración (`webContentsDebuggingEnabled`, `androidScheme`, `hostname`) | https://capacitorjs.com/docs/config |
| pdfjs | pdf.js: navegadores admitidos (compilación «legacy»: Chrome 125 o posterior) | https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions |
| chrome-req | Requisitos del sistema de Chrome para Android (Android 10 o posterior) | https://support.google.com/chrome/answer/95346?hl=en&co=GENIE.Platform%3DAndroid |
| billing-test | Probar Google Play Billing: instrumentos de prueba, renovaciones aceleradas, gracia, suspensión y cargos a quien no es tester con licencia | https://developer.android.com/google/play/billing/test |
| prelaunch | Informe previo al lanzamiento | https://support.google.com/googleplay/android-developer/answer/9842757 |
| vitals | Android vitals: umbrales de mal comportamiento | https://developer.android.com/topic/performance/vitals |
| credenciales | Datos de acceso para la revisión | https://support.google.com/googleplay/android-developer/answer/15748846 |
| wcag | WCAG 2.2, Recomendación del W3C (versión del 12/12/2024) | https://www.w3.org/TR/WCAG22/ |

[cap-android]: https://capacitorjs.com/docs/android
[cap-target]: https://capacitorjs.com/docs/android/setting-target-sdk
[cap-config]: https://capacitorjs.com/docs/config
[pdfjs]: https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions
[chrome-req]: https://support.google.com/chrome/answer/95346?hl=en&co=GENIE.Platform%3DAndroid
[billing-test]: https://developer.android.com/google/play/billing/test
[prelaunch]: https://support.google.com/googleplay/android-developer/answer/9842757
[vitals]: https://developer.android.com/topic/performance/vitals
[credenciales]: https://support.google.com/googleplay/android-developer/answer/15748846
[wcag]: https://www.w3.org/TR/WCAG22/
