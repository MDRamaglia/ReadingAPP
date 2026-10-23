# Pendientes

Estados: **pendiente**, **en curso**, **bloqueado** (con el motivo) y **hecho**.

## Decisiones que esperan al titular

| # | Decisión | Propuesta del equipo | Prepara |
|---|---|---|---|
| T01 | **Nombre de la app.** Depende de si EE. UU. y Canadá entran en el primer lanzamiento (ver T07). **Si entran:** «Bookmadic» en todos los mercados (sin coincidencias; `.com`, `.app` y `.com.br` libres; falta descartar a mano la cercanía con BOOKMATE). **Si se postergan:** «Knowmadic» solo en Latinoamérica y Brasil, excluyendo EE. UU. y Canadá. No se recomienda la ficha con otro nombre por país, porque el nombre visible en la app sigue siendo Knowmadic. Ver `docs/legal/matriz-nombres.md` | Legal y Marketing |
| T02 | Proveedor del servidor | **Listo para decidir:** `docs/tecnico/decision-servidor-empaquetado-cobros.md` recomienda Supabase (gratuito para desarrollar; Pro, USD 25 por mes, antes de la prueba cerrada), con un proveedor de correo aparte (Resend o Amazon SES). **Región:** una de la Unión Europea (adecuada para Argentina y Brasil) o São Paulo (menor latencia); antes, Legal define el mecanismo de transferencia | Servidor |
| T03 | Empaquetado para Android | **Listo para decidir:** Capacitor 8. Cobro nativo, funciona sin conexión y sirve después para el iPhone. El nombre del paquete no se puede cambiar después | Desarrollo app |
| T04 | Herramienta de cobros | **Listo para decidir:** RevenueCat (de 4 a 7 días de trabajo, contra 12 a 20 del cobro directo). El plan lo decide nuestro servidor y se guardan los comprobantes de Google para poder irse si hiciera falta | Servidor |
| T05 | Precios y planes (mensual y anual) por mercado | Propuesta por mercado: Argentina, resto de Latinoamérica, Brasil y países de habla inglesa | Producto y precios |
| T06 | Variante del español: voseo (Argentina) o neutro (resto de Latinoamérica) | La app hoy usa voseo. Opción: «es-AR» con voseo y «es-419» neutro | Localización |
| T07 | Países del primer lanzamiento | Empezar por América, sin la Unión Europea, para no sumar DSA y RGPD al principio. **Ojo:** en Colombia y Perú el IVA queda a cargo del desarrollador aunque esté en el exterior; conviene dejarlos para después, salvo que el contador diga otra cosa | Requisitos de tiendas, Legal y Contable |
| N-01 | **Revisar D09 (edad para tener cuenta).** Legal propone la opción B: leer sin cuenta, a cualquier edad; cuenta desde los 13 años, con fecha de nacimiento al registrarse; Reading Club desde los 16; menores de 18 necesitan autorización para pagar; en Brasil, cuenta desde los 16 hasta verificar el ECA Digital. Fundamento: las cuentas de menores de 13 no tendrían base legal válida (CCyC, art. 261, inc. c) y saber que un usuario tiene menos de 13 activa COPPA | Ver `docs/legal/notas-para-revision.md`, sección 4 | Legal |
| N-02 | **Región del servidor y transferencias internacionales.** Legal propone: región en la UE (adecuada para Argentina y Brasil); consentimiento expreso para lo que va a EE. UU. y Singapur (soporte, correo, cobros); acuerdo de tratamiento de datos con cada proveedor. São Paulo, solo si la latencia lo exige | Sección 5 de las notas | Legal y Servidor |
| N-04, N-10, N-12, N-16 | Arrepentimiento de 10 días sin restricciones; no vender premium en la web al lanzar; evaluar seguro o sociedad por la responsabilidad personal; lanzar primero en Argentina y el resto de Latinoamérica de habla hispana (Brasil y EE. UU. después) | Secciones 7, 13, 15 y 19 de las notas | Legal |
| T11 | Versión mínima de Android: API 24 (lo que admite Capacitor 8) o API 29 (pdf.js pide Chrome 125, y Chrome exige Android 10) | Probar en emuladores; decidir con Desarrollo | Desarrollo app y QA |
| T12 | Marca: sumar las clases 38 y 45 a la 9, la 41 y la 42; registrar «Bookmadic» en Argentina como resguardo aunque se elija Knowmadic | Ver `matriz-nombres.md`, sección del plan de registro | Legal |
| T13 | «DOCX» en lugar de «Word» en el nombre de la ficha y en los rótulos de la app (las pautas de Microsoft no permiten su marca en el nombre sin licencia) | Usar «lector PDF y DOCX» y mencionar Word solo en la descripción, aclarando que no hay afiliación | Legal y Marketing |
| T08 | **Público objetivo en Google Play** y qué pueden hacer los menores de 13 (¿publicar o solo leer?) | Requisitos recomienda declarar 13-15, 16-17 y 18+, sin política de Familias. Ver `docs/requisitos/google-play.md`, sección 3 | Requisitos de tiendas y Legal |
| T09 | Quién modera antes de que llegue el Community Manager, incluida la prueba cerrada | — | Coordinador |
| T10 | Categoría de la app en Google Play | «Libros y obras de consulta» («Social» sumaría las normas de seguridad infantil) | Requisitos de tiendas |

## Tareas

| # | Tarea | Responsable | Depende de | Estado |
|---|---|---|---|---|
| P01 | Cerrar el panel de desarrollo (`?dev=1`) en la versión publicada | Desarrollo app | Versión candidata (D10) | pospuesto |
| P02 | Servidor real: cuentas, recuperación por correo, reseñas, likes y club (`remoteBackend.ts`) | Servidor | T02 | pendiente |
| P03 | Borrado de cuenta dentro de la app y página web de borrado | Desarrollo app y Servidor | P02 | pendiente |
| P04 | Política de privacidad, términos y normas de la comunidad (borradores en `docs/legal/`, a revisar por el titular; no se publican hasta que exista lo que describen) | Legal y Localización | T01, N-01, N-02 | en revisión del titular |
| P05 | Moderación: denunciar, bloquear, filtrar y cola de revisión | Servidor y Desarrollo app | P02 | pendiente |
| P06 | Control de edad (16+) para el Reading Club; registro sin límite de edad (D09). Hecho del lado de la app, verificado por QA (`docs/qa/informe-2026-10-23-edad-e-idiomas.md`). Falta el servidor real (P02) | Desarrollo app y Legal | P02 | hecho (app) |
| P07 | Empaquetado Android y resguardo de la clave de firma | Desarrollo app | T03 | pendiente |
| P08 | Google Play Billing validado en el servidor, con restauración y gestión de la suscripción | Servidor y Desarrollo app | P02, T04 | pendiente |
| P09 | Pantalla de cobro conforme a las reglas de las tiendas | Diseño, Desarrollo app y Producto | T05 | pendiente |
| P10 | Internacionalización: estructura hecha (`src/i18n/`, 443 claves en español); faltan las traducciones al inglés y al portugués | Localización | T06 para la variante del español | estructura hecha |
| P11 | Migración de los datos locales (cuentas de prueba, preferencias y biblioteca) a la cuenta real | Desarrollo app y Servidor | P02 | pendiente |
| P12 | Dominio propio y correo de soporte | Titular (compra) y Servidor (configuración) | T01 | pendiente |
| P13 | Ficha de Google Play en tres idiomas: textos, capturas y gráficos. El nombre tiene un máximo de 30 caracteres: «Knowmadic: lector PDF y Word» entra, la versión con «de» no. Falta saber si se puede usar «Word» | Marketing, Diseño y Localización | T01 | pendiente |
| P14 | Formularios de Play: seguridad de datos, clasificación, público objetivo y anuncios | Requisitos de tiendas y Legal | P02, P04 | pendiente |
| P15 | Reclutar al menos 12 personas para la prueba cerrada de 14 días | Marketing y Titular | — | pendiente |
| P16 | Inscripción de la base de datos en la AAIP (guía en `docs/legal/guia-aaip.md`: gratuita y sin vencimiento; hacerla antes de la prueba cerrada) | Titular | P02 | pendiente |
| P17 | Alta impositiva, facturación, W-8BEN y cuenta en dólares. Las preguntas para el contador están listas en `docs/impuestos/preguntas-para-el-contador.md`; el titular completa la sección 1 y lo lleva a la reunión | Titular y contador | — | en curso |
| P18 | Registro de la marca elegida (INPI Argentina y Brasil) | Legal y Titular | T01 | pendiente |
| P19 | Plan de pruebas y lista de control de publicación (`docs/qa/plan.md`: 174 casos; `docs/qa/lista-de-publicacion.md`: 89 puntos) | QA | P22 | hecho |
| P20 | Medición de uso y errores, con consentimiento | Servidor y Legal | P02 | pendiente |
| P21 | Crear la cuenta personal de Google Play: pago, verificación de identidad y dispositivo. Antes, decidir qué domicilio declarar (queda público al cobrar), el nombre de desarrollador y un correo de soporte provisorio. **Ojo:** si en un año no se envía ninguna app a revisión, Google cierra la cuenta | Titular, con la guía de Requisitos | P23 (hecha) | pendiente |
| P22 | Lista de control oficial de Google Play contrastada con el estado real de la app (`docs/requisitos/google-play.md`: 6 cumplidos, 62 faltan, 12 no aplican todavía) | Requisitos de tiendas | — | hecho |
| P24 | Registro del nombre de paquete en Play para la verificación de desarrolladores (anuncio del 15/07/2026) aplicado a una app nueva | Requisitos de tiendas y Desarrollo app | T03 | pendiente |
| P25 | Actualizar el paso 4 de `docs/backend.md` (cobros) según T04 | Servidor | T04 | pendiente |
| P26 | Registrar la app en la verificación de desarrolladores de Android (GP-06) | Titular | P21, T03 | pendiente |
| P27 | Cargar a los participantes de la prueba como testers con licencia, para que no paguen (GP-10) | Requisitos de tiendas y Titular | P21 | pendiente |
| P28 | Borrador de la solicitud de acceso a producción (GP-11) | Requisitos de tiendas | P15 | pendiente |
| P29 | Definir el identificador de la app (`applicationId`), que no se puede cambiar (GP-12) | Desarrollo app y Titular | T01, P12 | pendiente |
| P30 | Aceptar los términos y normas antes de publicar contenido (GP-35) | Desarrollo app, Servidor y Legal | P04, P02 | pendiente |
| P31 | Análisis de ECA Digital (Brasil), SB 2420 (Texas) y la Play Age Signals API (GP-48) | Legal y Desarrollo app | T08 | pendiente |
| P32 | Cuentas de revisión gratuita y premium (de 16 años o más), con instrucciones en inglés (GP-72 y GP-73) | Servidor y Requisitos de tiendas | P02 | pendiente |
| P33 | Otra forma de dar premium en las pruebas automáticas **antes** de cerrar el panel de desarrollo (hoy dependen de `?dev=1`) | Desarrollo app y QA | — | pendiente |
| P34 | Adaptar las pruebas que van a cambiar con el servidor real: 05 (ninguna petición fuera del origen), y 09 y 12 («Prueba local») | Desarrollo app y QA | P02 | pendiente |
| P35 | Revisar en el esquema de `docs/backend.md` que el contador de likes no se pueda modificar por la API, y el borrado en cascada de respuestas ajenas (N-06) | Servidor | P02 | pendiente |
| P36 | OCR: sumar los modelos de inglés y portugués (hoy solo español) | Desarrollo app | — | pendiente |
| P37 | Capturas para la ficha sin «Prueba local» ni el botón «Desarrollo» | Diseño y Desarrollo app | P01, P02 | pendiente |
| P38 | Fallas bajas de QA: formulario de edición vacío para contenido inexistente (F1), pestaña trabada en el paso de la fecha (F2), avisos nativos del navegador en lugar de los propios para fechas futuras o anteriores a 1900 (F4) | Desarrollo app | — | pendiente |
| P39 | Avisos de importación y OCR guardados como código, no como texto en español, con migración de la biblioteca local. Necesario antes de habilitar inglés y portugués | Desarrollo app | — | pendiente |
| P40 | Idiomas fuera de `src/`: `index.html` y manifiesto; selector de idioma; decidir qué pasa con fechas y números en la vista previa `?lang=` (F3) | Desarrollo app y Localización | P10 | pendiente |
| P41 | Camino por soporte para corregir una fecha de nacimiento mal cargada (derecho de rectificación) | Producto, Legal y Servidor | P12 | pendiente |
| P42 | Ofrecer premium a menores de 16, cuando el premium incluye el Reading Club: definir la oferta | Producto y Legal | N-01 | pendiente |
| P23 | Guía paso a paso para crear la cuenta personal y explicación de la prueba cerrada (`docs/requisitos/guia-cuenta-google-play.md`) | Requisitos de tiendas | — | hecho |

## Para más adelante

- Community Manager: moderación diaria, soporte y respuestas a las reseñas de la tienda.
- Publicación en el App Store (pauta 4.2, Mac, USD 99 por año).
- Vincular QA con Codex para las correcciones (a evaluar).
