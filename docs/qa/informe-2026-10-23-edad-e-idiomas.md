# Informe de QA: Reading Club desde 16 años (D09) y textos en archivos de idioma (P10)

- **Fecha:** 23/10/2026.
- **Qué se probó:** los cambios sin commit de la rama `claude/spanish-reading-app-mvyeez`, sobre `HEAD` 8427c33. Son 35 archivos modificados y 4 nuevos (`src/i18n/`, `src/lib/age.ts`, `tests/unit/age.test.ts` y `tests/unit/i18n.test.ts`).
  - Mientras corría la prueba entraron dos commits de otros agentes: 6746587 y f14e856. Solo tocan `docs/` y `.gitignore`.
  - Ningún archivo de `src/`, `tests/` (salvo los artefactos ignorados de las pruebas) ni `scripts/` cambió después de empezar. Lo probado es el código actual.
- **Versión anterior de referencia:** `origin/main` (56100f6), compilada en un worktree temporal. Su código (`src/`, `tests/`, `scripts/`, `index.html`, `vite.config.ts` y `package.json`) es idéntico al de `HEAD`: los 7 commits posteriores solo tocan documentación.
  - **Ojo:** la rama `main` *local* está desactualizada y apunta al commit inicial, que no tiene archivos. Hay que comparar contra `origin/main`.
- **Entorno:**
  - Node 22.22.2.
  - Playwright 1.56.1 con Chromium: celular Pixel 7 y computadora de 1440 × 900.
  - WebKitGTK (MiniBrowser) con WebKitWebDriver y `xvfb-run`.
  - En las pruebas exploratorias, la fecha del navegador quedó fija en el 23/10/2026 a las 15:00, hora de Buenos Aires, salvo donde se indica otra.
- **Evidencia:** está en `docs/qa/evidencia/2026-10-23-edad-e-idiomas/`. Contiene salidas, diferencias de texto y capturas.

## Veredicto

**Apto para integrar.**

- Las cuatro suites pasan completas, verificadas desde cero (los números coinciden con los que informó Desarrollo).
- El control de edad hace lo especificado en todas las rutas, con todos los perfiles y en los dos dispositivos.
- Los textos en español no cambiaron, salvo los tres cambios declarados y los textos nuevos propios de D09 (se detallan en 2.2).
- No aparecen claves crudas.
- `?lang=en` y `?lang=pt` no rompen nada.

No se encontraron fallas de gravedad alta ni media. Hay **tres fallas bajas nuevas** (F2 a F4) y **una baja anterior a este cambio** (F1), que no bloquean. Se recomienda corregir F2 y F4 en una tanda posterior; F3 necesita una decisión. Los riesgos de la sección 4 son para el servidor real y para Legal, no para esta integración.

## 1. Qué se probó y cómo

### 1.1 Suite automática, desde cero

| Prueba | Comando | Resultado |
|---|---|---|
| Tipos | `npm run typecheck` | Sin errores |
| Unitarias | `npm test` | **60 de 60**, en 5 archivos |
| Compilación | `npx vite build` | Sin errores (detalle abajo) |
| Extremo a extremo | `npx playwright test` | **104 de 104**: 52 en celular y 52 en computadora, en 7,2 minutos y sin reintentos |
| Motor de Safari | `xvfb-run -a python3 scripts/webkit/probar_safari.py`, con `vite preview` en el 4173 | **43 de 43** («Resultado: todo bien») |

Sobre la compilación:
- Aparece el aviso `INEFFECTIVE_DYNAMIC_IMPORT` (`pdf.ts`), que no es nuevo: `origin/main` lo da igual.
- El paquete principal pasó de 158,29 kB a 188,98 kB: **+30,7 kB** (de 54,41 kB a 61,51 kB comprimido: +7,1 kB). La diferencia es el archivo `es.ts`.

Los números coinciden con los que informó Desarrollo. Las salidas están en:
- `unitarias-resumen.txt`;
- `e2e-resumen.txt`;
- `safari-resumen.txt`.

El guion de Safari **no recorre el Reading Club ni la fecha de nacimiento**. Por eso se sumó una prueba propia en WebKit (1.2).

### 1.2 Pruebas exploratorias

Se hicieron con guiones de Playwright y Selenium propios, fuera de `tests/`.

| Prueba | Cómo | Resultado |
|---|---|---|
| Rutas del club con cada perfil | 10 perfiles por 6 rutas, más la autora que vuelve a gratuito. Se hizo en celular y en computadora. Detalle en 2.1 | 64 de 67 bien en cada dispositivo. Las 3 restantes son **F1** |
| Bordes de la fecha e intentos de esquivar el bloqueo | Valores del campo, reloj del navegador movido, 29 de febrero, zona horaria, consola, IndexedDB y dos pestañas | **36 de 36** comprobaciones bien y 7 observaciones registradas (riesgos R1 y R2, falla F2) |
| Club y fecha en WebKit | Adulta premium, menor que cumple 16 mañana, quien cumple 16 hoy, fecha futura, vacía, de 1899, escrita con el teclado, y `?lang=en` | **17 de 17** |
| Cambio de idioma | `?lang=en`, `pt`, `xx`, `EN`, `auto`, combinado con `?dev=1`; dispositivo en en-US, pt-BR, es-MX y fr-FR; sin `localStorage` | **14 de 14**, más la observación **F3** |
| Textos: versión anterior contra nueva | Mismo recorrido en las dos versiones, con 39 pantallas en la anterior y 41 en la nueva: biblioteca, importación (Word, PDF, escaneado, `.doc`), lector, ajustes, índice, modo renglón, reseñas, club, planes, cuenta, errores, panel de desarrollo, premium, hilo y respuesta. Se comparan el texto visible y los atributos `aria-label`, `title`, `placeholder` y `alt`, las opciones de los `select`, `lang` y `title`. Se hizo en celular y en computadora | Solo los cambios declarados y los propios de D09 (2.2) |
| Capturas píxel a píxel | Las mismas pantallas, en las dos versiones | Lector, índice, modo renglón, ingreso, recuperación, cuenta sin sesión y validación de reseñas son **idénticas**. Las demás diferencias son los elementos nuevos de D09 y el orden de la biblioteca (con el reloj fijo, los documentos empatan en fecha) |
| Plural «1 página» | PDF de una sola página generado para la prueba | La versión anterior decía «1 páginas»; la nueva, «1 página» |
| Textos que quedaron fijos | Búsqueda en `src/`, `index.html`, `vite.config.ts` y CSS | Detalle en 2.4 |

## 2. Resultados por tema

### 2.1 Control de edad (D09)

**Orden de los controles: sesión → fecha → edad → plan.** Se navegó directo a cada ruta y se verificó que no se filtre el título ni el cuerpo de un hilo publicado por una adulta premium.

| Perfil | `#/club`, `#/club/<id>`, `#/club/nueva`, `#/club/<id>/editar`, `#/club/<inexistente>` y `#/club/<inexistente>/editar` |
|---|---|
| Sin cuenta | Presentación del club, con la nota «para mayores de 16 años» y «Ver planes» |
| Gratuito o premium sin fecha | Paso de la fecha, sin oferta de premium |
| Gratuito o premium de 15 (cumple 16 mañana) | «El Reading Club no está disponible para tu edad», sin «Ver planes» |
| Gratuito de 16 (cumple hoy) o de 30 | Aviso de premium |
| Premium de 16 (cumple hoy), de 30 o nacida un 29/02/2008 | Entra. En `editar` de un hilo ajeno: «Solo quien publicó la conversación puede editarla.» En un hilo inexistente: «La conversación ya no existe.» En `<inexistente>/editar`: **F1** |
| Autora que vuelve a gratuito | Presentación con aviso de premium en las seis rutas. Su perfil dice «El Reading Club es parte del plan premium» |

En ningún caso se filtró contenido del hilo. En el perfil, la tarjeta «Fecha de nacimiento» y la sección del club muestran el texto que corresponde a cada perfil (ver `rutas-*.log`).

**Bordes de la fecha** (`fechas.log` y `safari-club.log`):

| Caso | Resultado |
|---|---|
| Vacía | No avanza. Lo frena la validación del navegador (`required`) |
| Mañana o 2027 | No avanza (`max` = hoy). **F4** |
| 31/12/1899 | No avanza (`min` = 1900-01-01). **F4** |
| 01/01/1900 | Pasa a confirmar: «1 de enero de 1900» |
| 29/02/2023 (no existe) | El navegador la descarta y el campo queda vacío |
| Nacida hoy | Se acepta (0 años) y queda bloqueada |
| Cumple 16 mañana | Bloqueada el 23/10 a las 23:59. **El 24/10 a las 00:00 entra con la misma cuenta, sin volver a pedir la fecha** |
| Nacida el 29/02/2012 | Bloqueada el 28/02/2028; entra el 29/02/2028 |
| Nacida el 29/02/2084 (2100 no es bisiesto) | Bloqueada el 28/02/2100; entra el 01/03/2100 |
| Nacida el 01/03/2009 | Bloqueada el 28/02/2025; entra el 01/03/2025 |
| Confirmación | Es un diálogo modal y el foco queda dentro. Escape la cierra sin guardar. «Corregir» vuelve al campo |
| Doble clic en «Confirmar» | Entra sin error y se guarda una sola fecha |
| Fecha en WebKit | Campo de tipo fecha. La confirmación muestra «10 de mayo de 1990» y el perfil, la misma fecha, sin correrse por la zona horaria |
| «10/05/1990» escrito con el teclado en WebKit (sistema en inglés) | El campo lo toma como mes/día: 1990-10-05. La confirmación dice «5 de octubre de 1990» y permite corregir. **La confirmación en palabras es necesaria; conviene mantenerla** |

**Intentos de esquivar el bloqueo:**

| Intento | Resultado |
|---|---|
| Cargar la fecha desde la consola, importando el módulo compilado del servicio local | Antes de tenerla, el servicio valida: rechaza `2023-02-29`, `1899-12-31`, una fecha futura, `""`, `10/05/1990` y un número, con `invalid` y un mensaje claro. Normaliza los espacios. Después de cargada, **una segunda fecha da `forbidden`** |
| Llamar desde la consola a `listThreads`, `createThread`, `getThread`, `createReply` y `listReplies` con una cuenta menor | Todas dan `age-restricted` |
| Dos pestañas: la adulta en una y la menor en la otra | Queda la primera fecha. La segunda se rechaza con mensaje (**F2**) |
| Editar el almacenamiento | El usuario vive en **IndexedDB** (`knowmadic-local` / `users`). `localStorage` solo guarda el identificador de sesión, la preferencia de desarrollo y los ajustes. Al cambiar `birthDate` en IndexedDB **se entra al club**; al borrarla, la fecha se vuelve a pedir. Es esperable en el servicio local (riesgo R1) |
| Adelantar el reloj del dispositivo a 2028 con 14 años reales | **Entra** (R1) |
| Atrasar el reloj a antes del nacimiento | Bloqueada («no disponible para tu edad»): no habilita |
| Crear otra cuenta en el mismo dispositivo y poner una fecha adulta | **Entra**: nada recuerda la fecha anterior (R1) |
| Zona horaria: el mismo instante (23/10 12:30 UTC) para alguien nacida el 24/10/2010 | En Buenos Aires queda bloqueada; en Kiritimati (UTC+14) entra (R2) |

### 2.2 Textos en español: versión anterior contra nueva

Archivos: `comparar-computadora.txt` y `comparar-celular.txt`.

**Cambios declarados (verificados):**
- **Decimales:**
  - «Espacio usado: 5.0 MB» pasó a «5,0 MB»;
  - en «Interlineado», «1.6» pasó a «1,6».

  Los miles no cambian: el español no agrupa números de cuatro cifras, así que «1023 KB» sigue igual y «10.000» sigue igual.
- **Plurales:** «PDF con texto · 1 páginas» pasó a «· 1 página». Además se vio «1 respuesta» en un hilo.
- **Planes:** «Acceso y participación en el foro (Reading Club)» pasó a «…(Reading Club), para mayores de 16 años».

**Cambios no declarados.** Todos son consecuencia de D09; no son regresiones del paso a archivos de idioma, pero conviene registrarlos:
1. **Planes:** párrafo nuevo, «El Reading Club es para mayores de 16 años: la primera vez que entrás te pedimos la fecha de nacimiento.»
2. **Presentación del club:** línea nueva, «El Reading Club es para mayores de 16 años.»
3. **Perfil:** tarjeta nueva «Fecha de nacimiento», con «Sin cargar. Se pide la primera vez que entrás al Reading Club, que es para mayores de 16 años.» o con la fecha y «Ya está cargada y no se puede cambiar desde la app.»
4. **Perfil, sección «Mis publicaciones en el Reading Club», para quien no cargó la fecha.** Es un texto existente que **cambia**:
   - antes: «El Reading Club es parte del plan premium. Ver planes.»
   - ahora: «El Reading Club es para mayores de 16 años: la primera vez que entrás te pedimos la fecha de nacimiento. Ir al Reading Club.»
5. **Pantallas nuevas:** paso de la fecha, confirmación y «no disponible para tu edad».

**Otros resultados:**
- **Claves crudas:** ninguna en las 41 pantallas por dispositivo, tampoco con `en` ni `pt`. Tampoco hay marcadores `{…}` sin reemplazar, ni `undefined` o `NaN`.
- **Claves:** las 443 de `es.ts` se usan todas (las de categorías, por valor guardado).
- **Mayúsculas y signos:** sin diferencias. «FECHA DE NACIMIENTO» sale en mayúsculas por el estilo `.kicker`, igual que «TU PLAN».
- **Errores de JavaScript:** ninguno en ningún recorrido.

**Observación de redacción (para Legal y Localización):** la app dice «para mayores de 16 años», pero admite a quien tiene 16 justos (D09: «16 años o más»). Leída en sentido estricto, la frase excluye a quien tiene 16, y en inglés pasa lo mismo con «over 16». Se sugiere «de 16 años o más» o «desde los 16 años», coherente con los términos. Por otro lado, la pantalla dice «para **tu** edad», con voseo, y no «su edad», como figuraba en el encargo.

### 2.3 Cambio de idioma

Archivos: `idioma.log`, `comparar-en.txt` y `comparar-pt.txt`.

- Con `?lang=en` y `?lang=pt`, todos los textos se ven en español y no hay errores.
- El parámetro se quita de la dirección y la elección se recuerda.
- `xx`, `EN` y `auto` vuelven al automático.
- Funciona junto con `?dev=1`, en cualquier orden.
- Con el dispositivo en en-US, pt-BR, es-MX o fr-FR, la app queda en español, porque inglés y portugués todavía no están habilitados.
- Sin `localStorage`, la app arranca igual (en español).
- **Pero** las fechas, los decimales y `<html lang>` siguen el idioma elegido, aunque el texto sea español. Ver **F3**.

### 2.4 Textos visibles que quedaron fuera de los archivos de idioma

| Dónde | Texto | Comentario |
|---|---|---|
| `index.html` | `<html lang="es">`, `<meta name="description">` («Leé documentos Word y PDF…») | La app corrige `lang` al arrancar; la descripción queda fija en español |
| `vite.config.ts` (manifiesto de la PWA) | `name` «Knowmadic — lector», `description` en español, `lang: 'es'` | Es lo que se ve al instalar. Para Android, lo resuelve el empaquetado (T03) |
| `src/styles/reader.css:134` | `content: ' ·OCR'` | Es una sigla y sirve en los tres idiomas; se anota para completar |
| Validación nativa del campo de fecha | «Please fill out this field.», «Value must be 10/23/2026 or earlier.» | Las pone el navegador, en el idioma de su interfaz. Ver **F4** |
| `src/import/ocr.ts` (filtro de avisos) | Reconoce los avisos por su texto en español (`'Reconocimiento'` y `/escanead[oa]s?/`) | Desarrollo ya lo señaló. Riesgo R4 |
| Valores guardados | Categorías, avisos de importación y del OCR, nombres de estilos de Word | Es así por diseño y está documentado en `es.ts` |
| Marca y tipografías | «Knowmadic», «Literata», «Atkinson» | Son nombres propios |

No se encontraron otros textos fijos: ni atributos `aria-label`, `title`, `placeholder` o `alt` literales, ni texto JSX suelto, ni mensajes de error sin `t()`.

## 3. Fallas

### F1. Editar un hilo o una reseña inexistente muestra un formulario de edición vacío

**Gravedad:** baja. **Ya estaba en `origin/main`**: no la introduce este cambio.

**Pasos:**
1. Con una cuenta premium de 16 años o más, abrir `#/club/t-no-existe/editar`. Con cualquier cuenta, abrir `#/resenas/r-no-existe/editar`.

**Resultado esperado:** el mensaje «La conversación ya no existe.» (o «La reseña ya no existe.») y un enlace para volver.

**Resultado obtenido:**
- se ve «Editar publicación» (o «Editar reseña») con el formulario vacío;
- recién al enviarlo aparece «La conversación ya no existe.»

En `ThreadFormPage` y `ReviewFormPage` no se muestra `existing.error`.

**Evidencia:**
- `f1-editar-hilo-inexistente.png`;
- `rutas-computadora.log` y `rutas-celular.log` (3 comprobaciones fallidas por dispositivo);
- comparación con `origin/main`: mismo resultado.

### F2. Con dos pestañas abiertas en el paso de la fecha, la segunda queda trabada

**Gravedad:** baja.

**Pasos:**
1. Con una cuenta sin fecha, abrir `#/club` en dos pestañas.
2. En la primera, cargar y confirmar 10/05/1990.
3. En la segunda, cargar 01/01/2012 y confirmar.

**Resultado esperado:**
- la segunda fecha se rechaza (así ocurre);
- la pestaña muestra el estado real: la persona entra o ve el aviso de premium.

**Resultado obtenido:**
- se muestra «La fecha de nacimiento ya está cargada y no se puede cambiar desde la app.»;
- la pestaña sigue en el paso de la fecha y el botón no tiene salida hasta recargar.

**Sugerencia:** ante `forbidden` en `setBirthDate`, volver a leer la sesión, por ejemplo con `currentUser()` y `set({ user })`.

**Evidencia:** `f2-dos-pestanas.png`, `fechas.log` (sección 6).

### F3. Vista previa `?lang=en` o `?lang=pt` con archivos vacíos: texto en español con fechas y números del otro idioma, y `<html lang>` equivocado

**Gravedad:** baja. Inglés y portugués no se eligen solos: solo se llega con el parámetro, pero la elección queda guardada hasta `?lang=es` o `?lang=auto`.

**Pasos:**
1. Abrir `?lang=en#/cuenta` con una cuenta.
2. Ir a `#/club` y cargar una fecha.
3. Abrir los ajustes de lectura.

**Resultado esperado:** «Con los archivos vacíos se ve el español», también en fechas y decimales, y `<html lang>` acorde al texto que se muestra.

**Resultado obtenido:**
- «lectora@prueba.com · en Knowmadic desde el **October 23, 2026**»;
- «Tu fecha de nacimiento: **May 10, 1990**»;
- «Interlineado **1.6**»;
- `document.documentElement.lang = "en"`, de modo que un lector de pantalla leería el español con voz inglesa;
- con `pt`: «23 de **outubro** de 2026».

La prueba unitaria `i18n.test.ts` fija que `fmtDate` siga el idioma elegido. Es decir, el comportamiento es intencional, pero choca con el criterio del encargo.

**Decisión pendiente (Desarrollo y Localización):** puede aceptarse como propio de la vista previa, o hacer que el formato y `lang` sigan al idioma del texto mientras falte la traducción.

**Evidencia:** `f3-lang-en-confirmar-fecha.png`, `f3-lang-en-perfil.png`, `comparar-en.txt` y `comparar-pt.txt`.

### F4. Los mensajes propios de la fecha («posterior a hoy», «1900 o posterior») no se ven; aparece el mensaje nativo del navegador, en el idioma del navegador

**Gravedad:** baja.

**Pasos:**
1. En el paso de la fecha, elegir una fecha futura (o 31/12/1899) y tocar «Continuar».

**Resultado esperado:** los textos de los archivos de idioma, que ya existen: `validation.birthFuture` y `validation.birthTooOld`.

**Resultado obtenido:**
- el formulario no se envía y el navegador muestra su propio aviso, por los atributos `min`, `max` y `required`;
- en las pruebas salió en inglés: «Value must be 10/23/2026 or earlier.» y «Value must be greater than or equal to 1900-01-01» (WebKit);
- en un dispositivo en español saldrá en español, pero no es el texto de la app ni se puede traducir con ella.

**Sugerencia:** `noValidate` en el formulario, de modo que valide `birthDateProblem`, que ya está escrito. Se pueden mantener `min` y `max` para el selector.

**Evidencia:** `fechas.log` (sección 1), `safari-club.log`.

### Observaciones menores (no son fallas)

- **Sin sesión, la pantalla del club ofrece «Ver planes» antes de conocer la edad.** `docs/backend.md` dice: «1. sin sesión: iniciar sesión», y la regla general es «la fecha se pide antes de ofrecer premium». Sin embargo, la prueba de extremo a extremo espera ese aviso de premium sin cuenta. Lo decide Producto.
- **Planes ofrece «Elegir premium» también a una menor ya identificada**, y premium incluye el club, aunque la fila de la tabla aclara la edad. Hay que definirlo antes de habilitar el cobro (P08 y P09): ¿se le avisa o se le vende igual?
- `gateReason` (`src/ui/page.tsx`) no se usa en ningún lado. Ya era así en `origin/main`.
- `setBirthDate(19900510)`, con un número, responde «Falta completar: fecha de nacimiento.» Solo se llega por programación.

## 4. Riesgos

- **R1. La edad es autodeclarada y la decide el dispositivo.**
  - **Qué se comprobó en el servicio local:**
    - con otra cuenta en el mismo dispositivo se entra declarando otra fecha;
    - con el reloj adelantado se entra;
    - editando IndexedDB se entra.
  - **Para el servidor real (P02):**
    - calcular la edad con la fecha del servidor;
    - cargar la fecha solo por `set_birth_date`, una vez (como ya propone `docs/backend.md`);
    - no confiar nunca en la app.
  - **Para Legal y Requisitos de tiendas (T08 y N-01):** decidir si alcanza con una declaración por cuenta. La otra opción es recordar en el dispositivo que se declaró una edad menor, como hacen las pantallas de edad neutrales.
- **R2. Zona horaria.**
  - La app usa el día del dispositivo; el SQL propuesto usa `current_date` del servidor (en Supabase, UTC).
  - El día del cumpleaños pueden no coincidir. Ejemplo: en Oceanía, la app deja entrar y el servidor todavía no, y se vería un error «El Reading Club es para mayores de 16 años.» dentro de la lista.
  - Hay que definir la referencia y probarla cuando exista el servidor.
- **R3. La fecha de nacimiento es un dato personal nuevo.** Tiene que figurar en:
  - la política de privacidad (P04);
  - el formulario de seguridad de los datos de Play (P14);
  - la inscripción ante la AAIP (P16).

  Hoy queda guardada en el dispositivo, en IndexedDB.
- **R4. Avisos del OCR identificados por su texto en español.** Cuando se habiliten inglés o portugués, los avisos de un documento importado en otro idioma no se van a reemplazar y se duplicarían. Hay que resolverlo antes de habilitar `en` y `pt`.
- **R5. Peso.**
  - El español sumó unos 31 kB al paquete principal (7 kB comprimido).
  - Si `en` y `pt` se incluyen de la misma forma, se sumaría algo parecido por idioma.
  - Conviene evaluar cargarlos a demanda.
- **R6. Cobertura automática.** No cubre:
  - el club ni la fecha en Safari;
  - el cambio de día (quien cumple 16 mañana);
  - las dos pestañas;
  - `?lang`.

  Se proponen pruebas abajo.
- **R7. Campo de fecha según el dispositivo.** En un dispositivo configurado en inglés, el campo es mes/día/año. La confirmación con la fecha en palabras evita errores y no debería quitarse.

## 5. Pruebas propuestas para Desarrollo

1. **E2E (`12-club`): cambio de día.** Con `page.clock.setFixedTime`, alguien que cumple 16 mañana queda bloqueada hoy y entra mañana con la misma cuenta. Agregar el 29 de febrero (29/02/2012 → 28 y 29/02/2028).
2. **E2E: navegación directa sin acceso a `#/club/<id>/editar` y `#/club/<inexistente>/editar`**, con las tres situaciones: sin fecha, menor y gratuito. Incluir que no se filtre el título del hilo. Cuando se corrija F1, sumar el mensaje «ya no existe».
3. **E2E: dos pestañas.** La segunda fecha se rechaza y la pestaña se actualiza (F2).
4. **E2E: `?lang=en`** no rompe ninguna pantalla y no muestra claves. Según lo que se decida en F3, también el formato de fechas y `lang`.
5. **Safari (`probar_safari.py`): fecha y club.** Adulta premium entra; menor bloqueada sin «Ver planes»; la confirmación muestra la fecha en palabras. Puede servir de base `guiones/safari_club.py`.

Los guiones exploratorios usados en este informe están en `docs/qa/evidencia/2026-10-23-edad-e-idiomas/guiones/`. No son pruebas del proyecto:
- tienen rutas fijas a un directorio temporal;
- se corren a mano contra una compilación servida.

Se dejan como referencia para que Desarrollo los adapte.
6. **Unitaria:** cuando haya avisos del OCR traducidos, que una segunda tanda reemplace los avisos anteriores (R4).

## 6. Qué corregir y cuándo

- **Antes de integrar:** nada obligatorio.
- **En la próxima tanda:**
  - F2 (volver a leer la sesión ante `forbidden`);
  - F4 (`noValidate` y mensajes propios);
  - F1, que es anterior a este cambio (mostrar «ya no existe» en los formularios de edición).
- **Decisiones:**
  - F3 (formato y `lang` en la vista previa): Desarrollo y Localización;
  - redacción «mayores de 16» frente a «de 16 años o más»: Legal y Localización;
  - oferta de premium sin sesión o a menores: Producto;
  - R1: Legal y Requisitos de tiendas.
