# Google Play: lista de control de publicación (P22)

Esta lista recorre los requisitos oficiales de Google Play y los contrasta con el estado real de Knowmadic.

- **Fuentes:** todas se consultaron el **22/10/2026**. La lista completa, con sus enlaces, está en la sección 9. Las reglas cambian seguido: antes de actuar sobre un punto, conviene volver a mirar la fuente, sobre todo si pasaron más de tres meses.
- **Código:** el estado se verificó leyendo `src/`, `docs/backend.md`, `README.md`, `vite.config.ts`, `package.json` y `.gitignore` en la rama `claude/spanish-reading-app-mvyeez`. El árbol de trabajo de esa fecha incluye cambios de Desarrollo que todavía no están integrados: el control de edad del Reading Club (P06) y la estructura de idiomas (P10).
- **Uso:** QA arma el plan de pruebas y la lista de publicación (P19) a partir de este documento. Cada requisito tiene un número (GP-xx) y está escrito como una condición que se puede comprobar. La sección 5 indica cómo verificar cada bloque.

**Estados**
- **Cumple:** verificado en el código o en una decisión registrada.
- **Falta:** hay que hacer algo. Si una parte ya existe, se aclara en «Qué falta».
- **No aplica todavía:** hoy no corresponde, pero puede corresponder según una decisión o un cambio de la app.

---

## 1. Resumen

**80 requisitos:** **6 se cumplen**, **62 faltan** y **12 no aplican todavía.**

Casi todo lo que falta depende de tres cosas que todavía no existen:
- el servidor real;
- la cuenta de Google Play;
- el paquete de Android.

La app web ya cumple lo que depende solo de ella:
- funcionalidad propia;
- documentos procesados en el dispositivo;
- apertura de archivos con el selector del sistema, sin permisos;
- sin anuncios ni enlaces a pagos externos.

### Los cinco bloqueantes principales

1. **No hay servidor real (T02 → P02).** Sin él no hay:
   - una prueba cerrada útil: hoy cada tester vería solo lo suyo, con el aviso «Prueba local» (GP-09);
   - borrado de cuenta (GP-31 a GP-33);
   - denuncias, bloqueo ni moderación (GP-37 a GP-40);
   - validación de compras (GP-58 y GP-59);
   - cuentas para la revisión (GP-72 y GP-73);
   - un formulario de Seguridad de los datos exacto (GP-28).
2. **La cuenta personal y el reloj de la prueba cerrada (P21, P15, P23).** Antes de pedir producción hacen falta 12 testers durante 14 días seguidos, que no se pueden acortar. Después, la revisión suele tardar hasta 7 días. Nada de eso arranca sin la cuenta verificada (GP-01 a GP-03, GP-07, GP-08 y GP-11).
3. **Contenido de usuarios sin las salvaguardas obligatorias (P04, P05 y una tarea nueva).** Hoy no hay:
   - aceptación de términos antes de publicar (GP-35);
   - normas que definan lo prohibido (GP-36);
   - denuncias (GP-37);
   - bloqueo de usuarios (GP-38);
   - moderación (GP-39 y GP-40).

   Reseñas y Reading Club son contenido generado por usuarios, así que la política se aplica entera.
4. **Privacidad y borrado de cuenta (P04, P12 y P03).** Falta todo:
   - la política de privacidad (GP-23 a GP-25), publicada en un dominio propio y enlazada dentro de la app;
   - el borrado de cuenta dentro de la app y por web (GP-31 a GP-34).
5. **Cobro con Google Play Billing (T04, T05, P08 y P09).** Faltan:
   - la Billing Library 8 o posterior (GP-17);
   - el cobro y su validación en el servidor (GP-56, GP-58 y GP-59);
   - una pantalla de oferta con precio, período y renovación (GP-60);
   - el enlace para gestionar y cancelar (GP-61);
   - los productos y precios cargados en la consola (GP-62 y GP-79).

Además del servidor, condicionan la publicación:
- el **empaquetado** (P07): target 36, `.aab`, firma y comportamientos de Android 16 (GP-12 a GP-15, GP-21 y GP-22);
- la **decisión de público objetivo** que deriva de D09 (GP-44 y sección 3).

### Orden sugerido

1. **Ahora, sin esperar al servidor:**
   - El titular crea y verifica la cuenta (P21).
   - Se resuelven las decisiones T01, T02, T03 y T07, y la nueva de público objetivo (sección 3).
   - Legal redacta la política de privacidad, los términos y las normas de la comunidad (P04), con lo que pide la política de contenido de usuarios.
   - Marketing recluta testers, con margen sobre 12 (P15).
   - Desarrollo integra el control de edad (P06), agrega a `.gitignore` los archivos de firma y prepara la aceptación de términos y los enlaces legales.
2. **Servidor real** (P02), con:
   - borrado (P03);
   - denuncia, bloqueo y moderación (P05);
   - aceptación de términos;
   - dominio y correo (P12);
   - las páginas web de privacidad y de borrado.
3. **Empaquetado** (P07):
   - identificador definitivo de la app;
   - target 36 y `.aab`;
   - Play App Signing y clave de subida;
   - QA en Android 16 y en una pantalla de 600 dp o más.
4. **Cobro** (P08 y P09):
   - Billing Library 8 o posterior, con validación en el servidor y restauración;
   - pantalla de oferta conforme;
   - productos y precios en la consola (T05).
5. **Ficha y formularios** (P13 y P14):
   - Seguridad de los datos, clasificación, público objetivo, anuncios, funciones financieras, salud y noticias;
   - credenciales para la revisión.
6. **Prueba cerrada de 14 días**, con testers de licencias y registro de comentarios. Después, solicitud de producción y publicación.

La hoja de ruta prevé que la prueba cerrada empiece apenas haya una versión instalable con cuentas reales (pasos 2 y 3), y que el cobro se sume durante la prueba. Eso sirve, pero con dos condiciones:
- La primera versión enviada a la prueba **ya tiene que tener la ficha y las declaraciones**. Las de funciones financieras y de salud se exigen explícitamente también en la prueba cerrada (GP-51 y GP-52), y la ficha es la misma para todas las pistas ([Ficha][ficha]).
- Como hay contenido de usuarios reales desde el primer día, los pasos 1 y 2 tienen que estar completos antes de abrir la prueba.

---

## 2. Lista de control

Columnas: número, requisito (condición verificable), fuente oficial (consultada el 22/10/2026), estado en Knowmadic, qué falta, rol responsable (según `docs/plan/equipo.md`) y tarea relacionada de `pendientes.md`.

### A. Cuenta de desarrollador y verificación

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-01 | Cuenta personal de Play Console creada por el titular: mayor de 18 años, pago único de USD 25 con tarjeta de crédito o débito (no prepaga), documento y tarjeta a su nombre legal | [Crear cuenta][cuenta] | Falta | Crear la cuenta con la guía que está en preparación | Titular (guía: Requisitos) | P21, P23 |
| GP-02 | Acceso verificado a un dispositivo Android con la app Play Console (obligatorio para cuentas personales nuevas) | [Crear cuenta][cuenta] | Falta | Tener un Android a mano al crear la cuenta | Titular | P21 |
| GP-03 | Correo de contacto, teléfono de contacto y correo de desarrollador verificados con código, y operativos mientras exista la cuenta | [Tipos de cuenta][tipos-cuenta] | Falta | Conviene usar el correo del dominio propio, que todavía no existe | Titular | P21, P12 |
| GP-04 | El titular acepta que Google muestre su nombre legal, su país y su correo y, al monetizar, también su dirección completa | [Tipos de cuenta][tipos-cuenta] | Cumple | Aceptado en D03 | Titular | — (D03) |
| GP-05 | Perfil de pagos para cobrar: dirección física (no se aceptan casillas) y cuenta bancaria del mismo país del perfil. Argentina admite registro de desarrollador y de comerciante | [Perfil de pagos][perfil-pagos], [Ubicaciones][ubicaciones] | Falta | Crear el perfil. Los datos impositivos y el W-8BEN se definen con el contador | Titular y Contable | P17 |
| GP-06 | App registrada para la verificación de desarrolladores de Android. Rige desde el 30/09/2026 en Brasil, Indonesia, Singapur y Tailandia. Play registra solo el 99 % de las apps; las que no queden registradas pueden ser retiradas | [Verificación][verif-dev], [Plazos][plazos] | No aplica todavía | No hay app creada. Al crearla, revisar en la página de inicio de Play Console que figure registrada | Titular (Requisitos controla) | nueva |

### B. Prueba cerrada y acceso a producción

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-07 | Prueba cerrada con al menos **12 testers inscriptos durante 14 días seguidos**. Rige para cuentas personales creadas después del 13/11/2023. Si alguien se da de baja y vuelve, los 14 días tienen que ser consecutivos | [Prueba para cuentas personales][prueba-personal] | Falta | Reclutar con margen y sostener la inscripción los 14 días | Marketing y Titular | P15 |
| GP-08 | Prueba configurada así: <br>• lista de correos o Grupo de Google; <br>• cada tester, con cuenta de Google, se inscribe con el enlace, que aparece cuando la versión está «Publicada»; <br>• canal de comentarios (URL o correo) cargado, porque los testers no pueden dejar reseñas públicas | [Pistas de prueba][pistas] | Falta | Guía de inscripción y canal de comentarios, que necesita el correo de soporte | Requisitos (guía) y Titular (carga) | P23, P12 |
| GP-09 | La versión en prueba es la app que se va a publicar: con servidor real y sin el aviso «Prueba local». Google puede exigir más prueba si la participación de los testers no alcanza | [Prueba para cuentas personales][prueba-personal] | Falta | Hoy se compila con `VITE_BACKEND=local` y `src/services/remoteBackend.ts` responde «no disponible» en cada operación: los testers no se verían entre sí | Servidor y Desarrollo app | P02 |
| GP-10 | Si los testers van a comprar premium sin pagar de verdad, están cargados como testers de licencias. Quien no lo sea paga de verdad las compras de una pista de prueba | [Probar Play Billing][billing-test] | Falta | Decidir quién prueba premium sin cargo y cargarlo como tester de licencias | Requisitos y Titular | nueva |
| GP-11 | Solicitud de acceso a producción con sus tres partes: <br>• **la prueba:** reclutamiento, participación y resumen de comentarios; <br>• **la app:** público, propuesta de valor e instalaciones estimadas del primer año; <br>• **la preparación:** cambios hechos y cómo se decidió que está lista. <br>La revisión suele tardar 7 días o menos | [Prueba para cuentas personales][prueba-personal] | Falta | Registrar comentarios y cambios durante la prueba y redactar las respuestas | Requisitos (borrador) y Titular (envío) | nueva |

### C. Formato, nivel de API y funcionamiento

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-12 | El identificador de la app (`applicationId`) es definitivo antes del primer envío: si cambia, Play la trata como otra app | [Identificador de la app][app-id] | Falta | Elegirlo cuando estén definidos el nombre y el dominio | Desarrollo app y Titular | nueva (depende de T01 y P12) |
| GP-13 | La app apunta a **Android 16 (API 36)**. Se exige a las apps nuevas y a las actualizaciones desde el 31/08/2026, con prórroga posible hasta el 01/11/2026. El nivel sube todos los años | [Nivel de API][api-objetivo] | Falta | No hay proyecto Android. Capacitor 8 fija el target en 36 ([tabla de Capacitor][capacitor-sdk]) | Desarrollo app | P07, T03 |
| GP-14 | Se publica como **Android App Bundle** (`.aab`), obligatorio para apps nuevas desde agosto de 2021 | [App bundles][aab] | Falta | Generar el `.aab` al empaquetar | Desarrollo app | P07 |
| GP-15 | La app funciona con los cambios de Android 16 al apuntar a API 36: <br>• la pantalla de borde a borde ya no se puede desactivar; <br>• el gesto atrás es predictivo y `onBackPressed` deja de llamarse; <br>• en pantallas de 600 dp o más se ignoran la orientación y la relación de aspecto fijadas | [Cambios de Android 16][android16] | Falta | Probar el paquete. A favor: la web ya usa `viewport-fit=cover` (`index.html`) y `env(safe-area-inset-*)` en las hojas de estilo. El gesto atrás tiene que respetar las rutas `#/` y la salida del lector | Desarrollo app y QA | P07, P19 |
| GP-16 | La app admite páginas de memoria de 16 KB. Rige para apps con target 35 o más; desde el 01/02/2027 no se aceptan actualizaciones que no lo cumplan. Lo escrito solo en Java o Kotlin ya cumple | [Páginas de 16 KB][16kb] | No aplica todavía | Revisar si algún complemento nativo incluye bibliotecas `.so` | Desarrollo app | P07 |
| GP-17 | La app usa **Play Billing Library 8 o posterior**. Se exige desde el 31/08/2026, con prórroga posible hasta el 01/11/2026 | [Versiones de Billing][pbl] | Falta | No hay integración de cobro. Si se usa RevenueCat (T04), verificar que su SDK incluya la versión 8 o posterior | Servidor y Desarrollo app | P08, T04 |
| GP-18 | La app no se actualiza ni descarga código ejecutable (dex, JAR, `.so`) por fuera de Google Play. El JavaScript que corre en un WebView está exceptuado | [Abuso de dispositivos y redes][abuso] | No aplica todavía | Si se usan actualizaciones en vivo, que sean solo de recursos web | Desarrollo app | P07 |
| GP-19 | La app instala, carga y responde: no se cierra, no se congela ni funciona de forma anómala | [Funcionalidad][funcionalidad] | Falta | La web pasa las pruebas de extremo a extremo; falta probar el paquete en celulares Android reales, incluido el OCR en equipos modestos | QA | P19 |
| GP-20 | La app tiene funcionalidad propia: no es solo texto o un PDF estático | [Funcionalidad][funcionalidad] | Cumple | Tiene lector con modo libro y modo renglón, OCR, biblioteca, reseñas y club (`src/reader`, `src/import`, `src/library`, `src/community`) | — | — |

### D. Firma de la app

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-21 | Play App Signing activo. Es obligatorio para publicar con app bundles. En las apps nuevas, Google genera y guarda la clave de firma por defecto (firma híbrida «preparada para la computación cuántica») | [App bundles][aab], [Firma][firma] | Falta | Aceptarlo al subir la primera versión | Titular y Desarrollo app | P07 |
| GP-22 | Hay una clave de subida propia, distinta de la de firma y guardada fuera del repositorio. Si se pierde, se pide un reinicio en la consola | [Firma][firma] | Falta | Crearla y resguardarla. Hoy `.gitignore` no excluye `*.jks`, `*.keystore` ni los archivos de contraseñas de firma (`keystore.properties`, `key.properties`) | Desarrollo app y Titular | P07 |

### E. Política de privacidad

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-23 | La URL de la política de privacidad está cargada en Play Console y cumple: <br>• activa y pública; <br>• sin bloqueo por país; <br>• no es un PDF; <br>• no se puede editar; <br>• está titulada como «política de privacidad» | [Datos del usuario][datos-usuario] | Falta | No hay política: en `docs/legal/` solo está la búsqueda de marca. Falta publicarla en el dominio propio | Legal (texto), Titular (aprobación) y Servidor (publicación) | P04, P12 |
| GP-24 | Hay un enlace o el texto de la política **dentro de la app** | [Datos del usuario][datos-usuario], [Preparar la revisión][revision] | Falta | No hay enlace en `src/` | Desarrollo app | P04 |
| GP-25 | La política tiene el contenido mínimo: <br>• datos del desarrollador y un contacto de privacidad; <br>• datos personales que se acceden, recopilan, usan y comparten, y con quién; <br>• manejo seguro; <br>• retención y borrado | [Datos del usuario][datos-usuario] | Falta | Redactarla a partir del inventario de la sección 4 | Legal | P04 |
| GP-26 | Antes de recopilar datos personales que el usuario no espera (por ejemplo, medición de uso), la app muestra un aviso destacado y pide consentimiento. Salir del aviso no cuenta como consentir | [Datos del usuario][datos-usuario] | No aplica todavía | Hoy la app no envía datos fuera del dispositivo. Aplica a la medición de uso | Servidor y Legal | P20 |

### F. Seguridad de los datos

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-27 | El formulario de Seguridad de los datos está completo. Es obligatorio aunque la app no recopile nada, y para completarlo hay que tener la política cargada | [Seguridad de los datos][seguridad-datos] | Falta | Armar las respuestas en `docs/requisitos/formularios-play.md` | Requisitos, Legal y Servidor | P14 |
| GP-28 | El formulario declara con exactitud lo que sale del dispositivo. Definiciones de Google: <br>• **recopilar:** transmitir fuera del dispositivo; <br>• **compartir:** transferir a terceros. <br>El proveedor que procesa datos por cuenta del desarrollador no cuenta como compartir | [Seguridad de los datos][seguridad-datos] | Falta | Depende del diseño del servidor (sección 4) | Servidor y Requisitos | P14, P02 |
| GP-29 | Las prácticas de seguridad están declaradas: datos cifrados en tránsito y una forma de pedir el borrado | [Seguridad de los datos][seguridad-datos] | Falta | HTTPS en todo el servidor y borrado (GP-31 a GP-33) | Servidor | P02, P03 |
| GP-30 | El permiso `AD_ID` está en el manifiesto solo si se usa el ID de publicidad, y la declaración de la consola coincide con el manifiesto | [ID de publicidad][ad-id] | Falta | Declarar que no se usa y verificar que ningún SDK (de cobro o de medición) agregue `AD_ID`. La existencia de esa pregunta en la consola la confirmé solo en fuentes secundarias | Desarrollo app y Requisitos | P07, P14 |

### G. Borrado de cuenta

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-31 | Hay un camino **dentro de la app** para borrar la cuenta y sus datos. Puede ser un enlace a la página web | [Borrado de cuenta][borrado] | Falta | El perfil (`ProfilePage` en `src/account/AccountPages.tsx`) no lo ofrece y el contrato `Backend` (`src/services/backend.ts`) no tiene operación de borrado | Desarrollo app y Servidor | P03 |
| GP-32 | Hay una **página web** de borrado que: <br>• funciona; <br>• nombra la app o el desarrollador como en la ficha; <br>• muestra el pedido de borrado en forma destacada; <br>• permite pedirlo sin la app; <br>• explica los pasos previos, como cancelar la suscripción de Google Play, con un canal de soporte; <br>• informa qué datos se conservan | [Borrado de cuenta][borrado] | Falta | Hacer la página en el dominio propio | Servidor, Desarrollo app y Legal | P03, P12 |
| GP-33 | Se borran los datos asociados a la cuenta, y se pide a los proveedores que también los borren. Solo se conserva lo necesario por seguridad, prevención de fraude o ley, informado y por un plazo razonable | [Borrado de cuenta][borrado] | Falta | El esquema de referencia de `docs/backend.md` borra en cascada reseñas, likes, hilos y respuestas, pero no está probado. Falta definir qué se conserva del cobro y por cuánto tiempo | Servidor y Legal | P03 |
| GP-34 | En Seguridad de los datos se declara que la cuenta se puede borrar, con el enlace a la página web | [Borrado de cuenta][borrado] | Falta | Cargarlo cuando exista la página | Requisitos y Titular | P14 |

### H. Contenido generado por usuarios

Knowmadic tiene contenido de usuarios: reseñas públicas (cualquier persona con cuenta), conversaciones y respuestas del Reading Club, y nombres de usuario visibles.

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-35 | Quien publica acepta antes los términos o normas de uso | [Contenido de usuarios][ugc] | Falta | Ni el registro (`SignUpPage`) ni los formularios de reseña y del club piden aceptación | Desarrollo app, Servidor y Legal | nueva |
| GP-36 | Los términos o normas definen y prohíben el contenido y las conductas objetables. Recomendación: prohibir el contenido sexual explícito, porque admitir contenido sexual «incidental» obliga a excluir a los menores de la app, y eso choca con D09 | [Contenido de usuarios][ugc] | Falta | Redactar las normas de la comunidad | Legal | P04 |
| GP-37 | La app tiene un sistema para **denunciar** contenido y usuarios objetables: reseñas, conversaciones, respuestas y nombres de usuario | [Contenido de usuarios][ugc] | Falta | No existe: no hay nada para denunciar en el código ni en el contrato `Backend` | Desarrollo app y Servidor | P05 |
| GP-38 | La app permite **bloquear usuarios** | [Contenido de usuarios][ugc] | Falta | No existe | Desarrollo app y Servidor | P05 |
| GP-39 | Hay moderación «robusta, eficaz y continua»: se actúa sobre el contenido y los usuarios, y las quejas no quedan sin atender | [Contenido de usuarios][ugc] | Falta | Hacen falta una cola de revisión y herramientas. También hay que definir quién modera antes de que llegue el Community Manager (después del lanzamiento), incluida la prueba cerrada | Servidor y Titular | P05, nueva |
| GP-40 | Hay salvaguardas contra amenazas, acoso y hostigamiento, en especial hacia menores. Con D09 puede haber menores publicando reseñas | [Contenido de usuarios][ugc] | Falta | Filtro de contenido objetable y criterios de moderación para menores | Servidor, Legal y Producto | P05, P06 |
| GP-41 | La monetización no incentiva conductas objetables | [Contenido de usuarios][ugc] | Cumple | Premium da acceso al club y a funciones de lectura; los likes son gratis y no se compran (`src/config/plans.ts`, `src/config/community.ts`). Hay que revisarlo de nuevo si se suman funciones pagas de visibilidad | Producto | — |
| GP-42 | Normas de seguridad infantil contra el abuso y la explotación sexual (CSAE). Rigen solo para las categorías Social y Citas y para las apps de chat anónimo o aleatorio | [Seguridad infantil][csae] | No aplica todavía | No aplica con la categoría «Libros y obras de consulta» (GP-69). Si se eligiera «Social», habría que tener: <br>• normas publicadas contra el abuso infantil; <br>• un mecanismo de comentarios dentro de la app; <br>• un contacto de seguridad infantil | Requisitos | P13 |
| GP-43 | Contenido y funciones con restricción de edad: apuestas, citas y chat aleatorio o anónimo | [Restricción de edad][edad-restringida] | No aplica todavía | Knowmadic no tiene esas funciones. Hay que revisarlo si se suman mensajes privados o chat | Requisitos | — |

### I. Público objetivo y contenido

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-44 | Los grupos de edad están declarados con exactitud. Las opciones son 5 años o menos, 6-8, 9-12, 13-15, 16-17 y 18 o más. Se eligen los grupos para los que la app fue diseñada, no los de cualquiera que pueda usarla | [Público objetivo][publico] | Falta | Decisión del titular (sección 3) | Requisitos y Legal (proponen), Titular (decide) | P14, nueva (decisión) |
| GP-45 | Si algún grupo declarado incluye menores de 13, la app cumple la política de Familias | [Público objetivo][publico], [Familias][familias] | No aplica todavía | Depende de GP-44 | Legal y Requisitos | nueva |
| GP-46 | Si no se declara a los niños, la ficha no tiene elementos que los atraigan. Si los tiene, Play puede rechazar la app | [Público objetivo][publico] | Falta | Cuidarlo en los textos, las capturas y el ícono | Marketing y Diseño | P13 |
| GP-47 | El control de edad del Reading Club (16 o más) es coherente con lo declarado: <br>• la fecha de nacimiento se escribe libremente, sin valor precargado (pantalla neutral de edad); <br>• no se puede cambiar desde la app; <br>• se valida en el servidor | [Público objetivo][publico] | Falta | Parcial. En el árbol de trabajo, sin integrar, hay un paso de fecha de nacimiento (`BirthDateStep` en `src/community/Club.tsx`, `canUse` en `src/lib/access.ts`): el campo empieza vacío y la fecha queda fija al confirmarla. Falta la validación en el servidor | Desarrollo app y Servidor | P06, P02 |
| GP-48 | Leyes de edad en las tiendas: <br>• **Brasil (ECA Digital):** las apps dirigidas a niños y adolescentes, o que probablemente ellos usen, deben obtener de la tienda la franja de edad; <br>• **Texas:** rige la ley SB 2420. <br>Google ofrece Play Age Signals API (beta), pero no obliga a usarla: le toca al desarrollador determinar si la ley lo alcanza | [Requisitos por país][paises-req], [Leyes de EE. UU.][eeuu-edad], [Age Signals][age-signals] | Falta | Análisis legal para Brasil y Estados Unidos. Si corresponde, integrar la API con un complemento nativo | Legal y Desarrollo app | nueva |

### J. Clasificación de contenido

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-49 | El cuestionario de clasificación (IARC) está completo y es exacto, y se vuelve a enviar si cambian las respuestas. Una app sin clasificación se retira de la tienda. En Brasil la clasificación la lleva ClassInd | [Clasificación][clasificacion], [Cuestionario][iarc] | Falta | Preparar las respuestas: hay interacción entre usuarios (reseñas y club) y compras digitales. Las preguntas exactas solo se ven en la consola | Requisitos (prepara) y Titular (carga) | P14 |

### K. Anuncios y otras declaraciones de «Contenido de la app»

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-50 | Está cargada la declaración de anuncios | [Preparar la revisión][revision] | Falta | Solo falta la declaración: la app no tiene anuncios ni SDK de anuncios (`package.json`) | Requisitos y Titular | P14 |
| GP-51 | Está cargada la declaración de funciones financieras, obligatoria incluso en la prueba cerrada: «My app doesn't provide any financial features» | [Funciones financieras][financieras] | Falta | Cargarla | Titular | P14 |
| GP-52 | Está cargada la declaración de apps de salud, obligatoria incluso en la prueba cerrada: «My app doesn't provide any health features» | [Apps de salud][salud] | Falta | Cargarla | Titular | P14 |
| GP-53 | Están respondidas las declaraciones de apps de noticias y de COVID-19 | [Preparar la revisión][revision] | Falta | Responder que no | Titular | P14 |

### L. Permisos

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-54 | La app pide solo los permisos necesarios. Para abrir documentos usa el selector del sistema o Storage Access Framework, no `MANAGE_EXTERNAL_STORAGE` ni `READ_MEDIA_*` | [Permisos][permisos] | Falta | La web cumple: abre archivos con `<input type="file">` (`src/library/Library.tsx`) y no usa cámara, ubicación, contactos ni notificaciones. Falta verificar el manifiesto del paquete, incluidos los permisos que agreguen los complementos | Desarrollo app y QA | P07 |
| GP-55 | Formulario de declaración de permisos: solo hace falta si se usan permisos restringidos | [Permisos][permisos], [Preparar la revisión][revision] | No aplica todavía | Solo si GP-54 encuentra un permiso restringido | Desarrollo app | — |

### M. Pagos y suscripciones

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-56 | Premium (funciones y contenido digital) se cobra con la facturación de Google Play | [Pagos][pagos] | Falta | `startCheckout` responde «estará disponible próximamente» (`src/services/backend.ts`) | Servidor y Desarrollo app | P08, T04 |
| GP-57 | Dentro de la app no se dirige a otros medios de pago, salvo los programas de EE. UU. y del Espacio Económico Europeo | [Pagos][pagos] | Cumple | Hoy no hay enlaces ni botones de pago externos (`src/plans/Plans.tsx`, `src/account/AccountPages.tsx`). Riesgo: `docs/backend.md` propone Mercado Pago o Stripe para cobrar, y en Android solo vale Google Play. Si la web vende por otro medio, el paquete no puede mostrarlo ni enlazarlo | Desarrollo app y Servidor | P08 |
| GP-58 | Las compras se manejan así: <br>• se verifican en el servidor antes de habilitar premium; <br>• se reconocen dentro de los 3 días (si no, se reembolsan solas); <br>• no se habilita nada mientras están pendientes; <br>• se llama a `queryPurchasesAsync()` al conectar con Billing y al volver a la app | [Integrar Billing][billing-integrar] | Falta | Validación en el servidor. `docs/backend.md` ya prevé que el plan lo cambie solo el servidor | Servidor y Desarrollo app | P08 |
| GP-59 | El ciclo de la suscripción está completo: <br>• restauración (obligatoria para todos); <br>• período de gracia con acceso; <br>• suspensión de cuenta sin acceso; <br>• notificaciones en tiempo real para el desarrollador (RTDN) | [Suscripciones][billing-subs] | Falta | Implementar el ciclo de vida en el servidor | Servidor | P08 |
| GP-60 | La oferta se ve clara sin pasos extra: <br>• precio, período de cobro, qué incluye y renovación automática; <br>• en las anuales no se destaca el precio mensual; <br>• en las pruebas gratis, cuánto duran, cuándo se empieza a cobrar y cómo cancelar; <br>• los nombres de los productos no confunden | [Política de suscripciones][suscripciones] | Falta | La pantalla dice «Precio a definir» y no informa período ni renovación (`src/plans/Plans.tsx`) | Diseño, Producto y Desarrollo app | P09, T05 |
| GP-61 | En la cuenta hay un enlace para gestionar y cancelar la suscripción en el centro de suscripciones de Google Play, y se explica cómo cancelar | [Política de suscripciones][suscripciones], [Suscripciones][billing-subs] | Falta | Parcial: los botones «Gestionar suscripción» y «Cancelar suscripción» del perfil responden «estará disponible próximamente». En Android el enlace es `https://play.google.com/store/account/subscriptions?sku=…&package=…` | Desarrollo app | P08, P09 |
| GP-62 | Las suscripciones están creadas en la consola: planes base (mensual y anual), precios por país y ofertas | [Crear suscripciones][crear-subs] | Falta | Definir los precios por mercado | Producto (propone) y Titular (carga) | T05 |

### N. Ficha de la tienda

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-63 | El nombre tiene hasta 30 caracteres y no incluye emojis, mayúsculas sostenidas, precios, promociones ni rankings | [Ficha][ficha], [Metadatos][metadatos] | Falta | Depende del nombre (T01). «Knowmadic» tiene 9 caracteres | Marketing y Legal | P13, T01 |
| GP-64 | La descripción breve tiene hasta 80 caracteres y la completa hasta 4000. No repiten palabras clave, no usan testimonios anónimos y son veraces: no prometen lo que no funciona | [Ficha][ficha], [Metadatos][metadatos] | Falta | Redactarlas en los tres idiomas | Marketing y Localización | P13 |
| GP-65 | El ícono cumple las especificaciones: <br>• 512 × 512, PNG de 32 bits con alfa, sRGB, hasta 1024 KB; <br>• cuadrado completo, sin esquinas redondeadas ni sombra (las agrega Google); <br>• sin texto ni insignias engañosas | [Gráficos][graficos], [Ícono][icono] | Falta | Existe `public/icons/icon-512.png`, el ícono de la PWA (cuadrado con fondo blanco). Falta comprobar el formato y el peso | Diseño | P13 |
| GP-66 | Hay un gráfico destacado de 1024 × 500, en JPEG o PNG de 24 bits sin alfa (obligatorio) | [Gráficos][graficos] | Falta | No existe | Diseño | P13 |
| GP-67 | Las capturas cumplen: <br>• al menos 2 para publicar y hasta 8 por tipo de dispositivo; <br>• JPEG o PNG de 24 bits sin alfa; <br>• lados de 320 a 3840 px, y el mayor no supera el doble del menor; <br>• para que Google pueda promocionar la app, al menos 4 de 1080 px o más (vertical 9:16, mínimo 1080 × 1920); <br>• sin «mejor», «n.º 1» ni «gratis», sin insignias de tiendas y sin llamados a la acción | [Gráficos][graficos] | Falta | Hacerlas con la app real: sin el aviso «Prueba local», sin el panel de desarrollo y sin contenido simulado | Diseño y Marketing | P13 |
| GP-68 | La ficha está en los idiomas del mercado (por ejemplo, es-419, en-US y pt-BR). Si falta una traducción propia, Google muestra una automática | [Idiomas][idiomas] | Falta | Textos y, si se quiere, gráficos por idioma | Localización | P13, T06 |
| GP-69 | Hay una categoría elegida y hasta 5 etiquetas (las de accesibilidad son opcionales). Propuesta: «Libros y obras de consulta», que incluye los lectores de libros | [Categorías][categorias] | Falta | Elegirla. «Social» sumaría las normas de seguridad infantil (GP-42) | Requisitos y Marketing | P13 |
| GP-70 | Los datos de contacto de la ficha están completos: correo (obligatorio), sitio web (recomendado) y teléfono (opcional) | [Ficha][ficha] | Falta | Correo de soporte y sitio en el dominio propio | Titular y Servidor | P12 |
| GP-71 | Video de presentación (opcional): YouTube público u oculto, sin anuncios ni restricción de edad | [Gráficos][graficos] | No aplica todavía | Es opcional | Marketing | P13 |

### O. Credenciales para la revisión

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-72 | Los datos de acceso para la revisión: <br>• están siempre disponibles y se pueden reutilizar; <br>• valen desde cualquier ubicación; <br>• están en inglés; <br>• no piden doble factor ni códigos de un solo uso, o incluyen un modo de evitarlos. <br>Se pueden cargar hasta 5 juegos. Si la contraseña vence, la app puede ser rechazada | [Credenciales][credenciales], [Preparar la revisión][revision] | Falta | Crear cuentas de revisión en el servidor real y escribir instrucciones en inglés | Servidor (cuentas), Requisitos (instrucciones) y Titular (carga) | nueva |
| GP-73 | Quien revisa puede ver todo lo pago: una cuenta premium otorgada por el servidor, con fecha de nacimiento de 16 años o más, para entrar al Reading Club | [Credenciales][credenciales] | Falta | Hoy la única forma de tener premium es el panel de desarrollo, que se cierra antes de publicar (D10, P01) | Servidor | nueva |

### P. Accesibilidad

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-74 | Play no fija requisitos generales de accesibilidad para las apps que no usan la API AccessibilityService, y Knowmadic no la usa. Las etiquetas de accesibilidad de la ficha son opcionales | [AccessibilityService][accesibilidad-api], [Categorías][categorias] | No aplica todavía | Si se distribuye en la Unión Europea, Legal tiene que revisar la Ley Europea de Accesibilidad (no la verifiqué) | Diseño y Legal | T07 |

### Q. Apps web empaquetadas (TWA o Capacitor)

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-75 | No se publica un WebView de un sitio sin permiso de su dueño | [Spam][spam] | Cumple | El sitio es del titular | — | — |
| GP-76 | Si se empaqueta como TWA, el dominio publica Digital Asset Links (`/.well-known/assetlinks.json`). Si la verificación falla, la app muestra la barra del navegador | [TWA][twa] | No aplica todavía | T03 propone Capacitor. Con TWA habría que controlar la raíz del dominio, y hoy la app está en una subcarpeta de GitHub Pages | Desarrollo app | T03, P12 |

Sobre el riesgo de «sitio web reempaquetado»: para Google Play lo que cuenta es GP-20 (funcionalidad propia) y GP-75 (sitio propio). La pauta 4.2 de Apple es más exigente y se trata en la fase del App Store. La política de Familias también prohíbe que la app sea solo el WebView de un sitio sin permiso de su dueño ([Familias][familias]), pero eso no aplica porque el sitio es del titular.

### R. Países y precios

| # | Requisito | Fuente | Estado | Qué falta | Rol | Tarea |
|---|---|---|---|---|---|---|
| GP-77 | Argentina admite el registro de desarrollador y de comerciante (moneda predeterminada: USD) | [Ubicaciones][ubicaciones] | Cumple | — | Contable | — |
| GP-78 | Los países están elegidos por pista (prueba y producción). Por defecto, la disponibilidad de la prueba copia la de producción, salvo que se desvincule | [Países][paises] | Falta | Decidir los países del primer lanzamiento | Requisitos y Legal (proponen), Titular (decide) | T07 |
| GP-79 | Cada país agregado tiene precio de suscripción. El precio se fija sin impuestos y Google lo convierte; donde no hay moneda local, se fija en USD o EUR | [Crear suscripciones][crear-subs], [Países][paises] | Falta | Definir los precios por mercado | Producto, Contable y Titular | T05 |
| GP-80 | Unión Europea: condición de comerciante según la Ley de Servicios Digitales (DSA) | No encontré una fuente oficial de Google; ver la sección «Unión Europea (DSA)» de `docs/plan/investigacion.md`, que es sobre Apple | No aplica todavía | Solo si T07 incluye la Unión Europea. En ese caso, verificar el requisito en Play Console | Legal | T07 |

---

## 3. Implicancias de D09: registro abierto a cualquier edad y Reading Club desde los 16

### Qué dice Google (consultado el 22/10/2026)

1. **Grupos de edad del formulario:** 5 años o menos, 6-8, 9-12, 13-15, 16-17 y 18 o más. Se pueden elegir varios ([Público objetivo][publico]).
2. **Cuándo se aplica Familias:** *«Any apps that include children in their target audience must comply with Google Play's Families Policy Requirements»* (toda app que incluya niños en su público objetivo debe cumplir la política de Familias) ([Público objetivo][publico]).
3. **Qué grupos elegir:** se marcan varios solo si la app fue diseñada para cada uno y es apropiada para todos. Adultos y niños juntos, solo si de verdad se diseñó para todas las edades, *«not just because you want your app to be available to users of all ages»* (no porque se quiera que esté disponible para todas las edades) ([Público objetivo][publico]).
4. **Edad de los niños según el país:** sobre los grupos de 13-15 y de 16-17, Google advierte: *«this age group may be considered to include children in some locales»* (en algunos lugares este grupo puede considerarse de niños) ([Público objetivo][publico]). No fija una edad única: le toca a Legal establecerla para cada mercado.
5. **Ficha que atrae a niños:** si la ficha sugiere que la app es para niños sin haberlos declarado, Play puede rechazarla. La salida es quitar esos elementos o declarar a los menores de 13 ([Público objetivo][publico]).

### ¿Registro abierto obliga a declarar menores de 13?

**No.** El formulario pregunta para quién está diseñada la app, no quién puede registrarse. D09 define quién puede crear una cuenta, y el público objetivo es una declaración aparte.

### ¿Se activa la política de Familias?

**Solo si se declara algún grupo de menores de 13**, o si en algún mercado los grupos de 13-15 o de 16-17 se consideran niños, cosa que debe determinar Legal.

### Qué sumaría Familias si se incluyeran menores de 13

Según [Familias][familias]:
- **Contenido:** lo que vean los niños tiene que ser apropiado para niños, y eso incluye las reseñas y lo que publiquen otros usuarios.
- **Datos:**
  - hay que divulgar los datos personales que se recopilan de niños;
  - hay que cumplir COPPA (EE. UU.), el RGPD y otras leyes, también con todos los SDK que use la app;
  - la app no puede transmitir el ID de publicidad (AAID) ni pedir el número de teléfono del dispositivo.
- **Funciones sociales** (las reseñas y el club lo son):
  - un recordatorio dentro de la app sobre seguridad en línea;
  - una forma de que los adultos administren las funciones sociales de los niños;
  - una «acción de un adulto» antes de que un niño pueda intercambiar datos personales. Google la define como un mecanismo que verifica que quien la hace no es un niño: por ejemplo, un PIN o una contraseña de adulto, la verificación del correo o una tarjeta.
- **Público mixto:** hay que usar una pantalla neutral de edad.
- **Anuncios:** solo con SDK certificados para Familias. Hoy no aplica, porque no hay anuncios.
- **WebView:** la app no puede ser solo el WebView de un sitio sin permiso de su dueño. No aplica, porque el sitio es del titular.
- **Chat anónimo:** desde el 26/08/2026 las apps de chat anónimo no pueden dirigirse a niños ([Plazos][plazos]). No aplica.

### Obligaciones que D09 suma aunque no se declare a menores de 13

- **Contenido de usuarios:**
  - Google marca como infracción no tener salvaguardas contra el acoso, *«particularly toward minors»* (en especial hacia menores) (GP-40).
  - Si se admitiera contenido sexual incidental, habría que impedir que los niños accedan a la app (GP-36). Por eso conviene prohibirlo en las normas.
- **Brasil (ECA Digital):** Google informa que el estatuto exige a las apps dirigidas a niños y adolescentes, o que probablemente ellos usen, obtener de la tienda la franja de edad. Play Age Signals API devuelve esa franja en Brasil desde el 17/03/2026 ([Age Signals][age-signals], [Requisitos por país][paises-req]).

  Knowmadic tiene registro abierto, reseñas y la categoría «Infantil y juvenil», así que es razonable pensar que la usarán adolescentes. Si la ley la alcanza lo determina Legal (GP-48).
- **Texas (SB 2420):** rige desde que un tribunal federal de apelaciones suspendió la medida cautelar. Entre los requisitos figura incorporar la franja de edad y la aprobación de los padres que informa la tienda, y avisar a la tienda los cambios significativos. Google no impone el uso de sus herramientas ([Leyes de EE. UU.][eeuu-edad]). Es relevante porque D04 incluye al público de habla inglesa.
- **Leyes de datos de menores** (COPPA, la ley de protección de datos de Brasil (LGPD), la Ley 25.326): no las verifiqué y quedan para Legal (P04 y P06).

### Opciones

| Opción | Grupos declarados | Qué implica | Riesgo |
|---|---|---|---|
| **A** | 13-15, 16-17 y 18 o más | <br>• Familias no se activa por la declaración. <br>• La ficha no puede apuntar a niños. <br>• Hay que cumplir las salvaguardas de contenido de usuarios. <br>• El Reading Club sigue con el control de 16 o más | Pueden registrarse menores de 13, aunque no estén declarados. Legal tiene que evaluar COPPA y el ECA Digital. En algunos países, los grupos de 13-15 y de 16-17 pueden considerarse niños |
| **B** | 16-17 y 18 o más (o solo 18 o más) | La declaración es la más simple | No describe a quién está dirigida la app: D09 deja que adolescentes de cualquier edad se registren y publiquen reseñas, y Google revisa que la declaración sea exacta |
| **C** | Todas, incluidos los menores de 13 | Se aplica Familias entera: controles para adultos, acción de un adulto antes de compartir datos, recordatorio de seguridad y contenido apto para niños | Mucho trabajo nuevo y cumplimiento de COPPA (consentimiento de los padres) para un público que no es el núcleo de la app |

### Recomendación

**Opción A**, con estas medidas:
1. Una ficha sin elementos dirigidos a niños (GP-46).
2. Normas que prohíban el contenido sexual explícito (GP-36) y moderación con atención especial a los menores (GP-40).
3. **Decisión para el titular:** que Legal evalúe agregar una pregunta de edad neutral **al registrarse o al publicar por primera vez**, para que quien indique menos de 13 años pueda leer pero no publicar ni tener un perfil público.
   - El registro seguiría abierto a cualquier edad, pero cambiaría lo que pueden hacer los menores de 13. Por eso es una decisión del titular, no del equipo.
   - Hoy la fecha de nacimiento se pide solo al entrar al club (P06), así que la app no sabe la edad de quien publica reseñas.
4. Evaluar Play Age Signals API para Brasil y Texas (GP-48).

**Por qué A y no las otras:**
- **B** declara menos de lo que D09 habilita.
- **C** obliga a construir controles parentales y a cumplir COPPA antes del lanzamiento, para un público que no es el principal de la app.

---

## 4. Inventario para Seguridad de los datos y la política de privacidad

Lo que va a salir del dispositivo con el servidor real. Los tipos son los del formulario de Google ([Seguridad de los datos][seguridad-datos]). El detalle de las respuestas va en `docs/requisitos/formularios-play.md`, y hay que confirmarlo con Servidor cuando el diseño de P02 esté cerrado.

| Dato | Cuándo sale del dispositivo | Tipo en el formulario | Depende de |
|---|---|---|---|
| Correo electrónico | Registro e ingreso | Información personal › Dirección de correo electrónico | P02 |
| Nombre de usuario e ID de cuenta | Registro. El nombre se ve en reseñas y en el club | Información personal › IDs de usuario | P02 |
| Fecha de nacimiento | Al entrar por primera vez al Reading Club | Información personal › Otra información (el formulario da la fecha de nacimiento como ejemplo) | P02, P06 |
| Reseñas, conversaciones y respuestas | Al publicar | Actividad en la app › Otro contenido generado por usuarios. Falta confirmar si las respuestas del club entran como «Otros mensajes en la app» | P02 |
| Likes | Al dar o quitar un like | Actividad en la app › Otras acciones | P02 |
| Búsquedas de reseñas | Si la búsqueda se hace en el servidor | Actividad en la app › Historial de búsqueda en la app. Si no se guarda, puede ser procesamiento efímero | P02 |
| Estado de la suscripción y compras | Al comprar o restaurar | Información financiera › Historial de compras. Los datos de pago los recopila Google, no la app | P08 |
| Documentos, texto extraído, imágenes y progreso | **Hoy nunca.** Lo verifican `README.md` y la prueba `tests/e2e/05-escaneado-ocr.spec.ts`, que comprueba que no haya peticiones fuera del origen durante la importación y el OCR | No se declaran (procesamiento en el dispositivo). Si P02 sincroniza la biblioteca, pasan a «Archivos y documentos», y eso cambia la política y el formulario | Decisión de diseño de P02 |
| Preferencias de lectura | Si se sincronizan entre dispositivos | A clasificar con Servidor | P02 |
| Errores y diagnóstico | Solo si se suma la medición, con consentimiento | Información y rendimiento de la app | P20 |
| Identificadores del dispositivo o de la instalación | Si los usa el SDK de cobro o de medición | Dispositivo u otros IDs | T04, P20 |

Los proveedores que procesan datos por cuenta del titular (por ejemplo, el del servidor o el de cobros) no cuentan como «compartir», pero tienen que figurar en la política de privacidad.

---

## 5. Cómo verificarlo (para QA)

Las pruebas son sobre la versión candidata compilada para Android con el servidor real, salvo que se indique otra cosa. Para cada número GP-xx, la evidencia es una captura, un registro o un enlace.

| Bloque | Cómo se verifica | Evidencia |
|---|---|---|
| A y B (GP-01 a GP-11) | Lo carga el titular en la consola. QA comprueba que haya 12 o más testers inscriptos y que la fecha de inscripción tenga 14 días o más | Captura de la consola con la cantidad de testers y las fechas |
| C (GP-12 a GP-20) | <br>• `targetSdkVersion` 36 y formato `.aab` en el artefacto. <br>• Instalar en Android 16 y en una pantalla de 600 dp o más (tableta o emulador). <br>• Nada queda bajo las barras del sistema. <br>• El gesto atrás vuelve del lector a la biblioteca y de una sección a la anterior, y sale de la app desde la biblioteca. <br>• Recorrido completo sin cierres en un celular real modesto, incluido el OCR | Manifiesto combinado, capturas y video corto |
| D (GP-21 y GP-22) | <br>• Play App Signing activo en la consola. <br>• `git ls-files` no lista archivos `.jks`, `.keystore` ni de contraseñas de firma | Salida del comando |
| E (GP-23 a GP-26) | <br>• La URL de la política abre sin sesión, en HTML (no PDF) y con el título «Política de privacidad». <br>• Dentro de la app hay un enlace visible al menos desde el registro y el perfil, y se llega sin iniciar sesión | Capturas |
| F (GP-27 a GP-30) | <br>• Comparar el formulario cargado con la sección 4 y con el tráfico real de la app (proxy o registros del servidor). <br>• El manifiesto no tiene `AD_ID` | Tabla de diferencias (vacía) |
| G (GP-31 a GP-34) | <br>• Crear una cuenta, publicar una reseña, un like, un hilo y una respuesta, y cargar la fecha de nacimiento. <br>• Borrar la cuenta desde la app y comprobar que el ingreso falla y que el servidor ya no tiene esos datos. <br>• Repetir con la página web, sin la app. <br>• La página menciona la cancelación de la suscripción de Google Play | Capturas y consulta del servidor hecha por Servidor |
| H (GP-35 a GP-43) | <br>• No se puede publicar sin aceptar los términos. <br>• Se puede denunciar cada tipo de contenido y cada nombre de usuario, y la denuncia llega a la cola. <br>• Bloquear a un usuario oculta lo suyo. <br>• Se mide el tiempo de respuesta de la moderación | Capturas y registro de la cola |
| I (GP-44 a GP-48) | <br>• La fecha de nacimiento empieza vacía. <br>• Con menos de 16 años no se entra al club aunque la cuenta sea premium. <br>• La fecha no se puede cambiar. <br>• El servidor rechaza el acceso al club aunque se altere la app | Capturas y respuesta del servidor |
| J y K (GP-49 a GP-53) | Las declaraciones cargadas coinciden con `formularios-play.md` | Captura de «Contenido de la app» sin pendientes |
| L (GP-54 y GP-55) | Lista de permisos del manifiesto combinado: solo los necesarios, sin almacenamiento amplio ni multimedia | Lista de permisos |
| M (GP-56 a GP-62) | Con un tester de licencias: <br>• precio, período y renovación visibles antes de comprar; <br>• compra que habilita premium solo después de la validación; <br>• restauración después de reinstalar; <br>• el enlace de cancelación abre el centro de suscripciones; <br>• gracia y suspensión con los períodos acelerados de prueba (gracia de 5 minutos, suspensión de 10); <br>• no hay enlaces a pagos externos | Capturas y registros del servidor |
| N (GP-63 a GP-71) | Contar caracteres. Medir las imágenes (tamaño, formato, alfa y peso). Revisar que las capturas no muestren «Prueba local», el panel de desarrollo ni datos inventados | Planilla de control |
| O (GP-72 y GP-73) | Ingresar con las credenciales de revisión en un dispositivo limpio y llegar al Reading Club con la cuenta premium | Capturas |

---

## 6. Condiciones propias de Knowmadic que la revisión va a notar

No son reglas de Google, sino condiciones del objetivo y de las decisiones. Afectan lo que ve quien revisa la app.

- **Panel de desarrollo cerrado (D10, P01).**
  - Hoy, `?dev=1` lo activa también en la compilación publicada: se guarda en `localStorage` (`src/dev/devtools.ts`).
  - Con el servidor real no puede cambiar el plan, pero el botón «Desarrollo» sigue apareciendo.
  - Hay que cerrarlo antes de la versión candidata.
- **Sin «Prueba local».** El paquete se compila con `VITE_BACKEND=remote`. Con eso, el aviso `LocalModeNote` (`src/ui/page.tsx`) no aparece, y ninguna pantalla ni captura muestra contenido simulado.

---

## 7. Cambios de política y fechas que siguen

Revisados en la [cronología de políticas de Play][politicas] y en la [tabla de plazos][plazos] el 22/10/2026.

| Fecha | Cambio | Efecto en Knowmadic |
|---|---|---|
| 26/08/2026 (vigente) | Familias, Seguridad infantil y Restricción de edad se extienden a las apps de chat anónimo y aleatorio | Ninguno mientras no haya chat |
| 30/09/2026 (vigente) | Verificación de desarrolladores de Android en Brasil, Indonesia, Singapur y Tailandia | Controlar el registro de la app (GP-06) |
| 01/11/2026 | Vencen las prórrogas de API 36 y de Billing Library 8 | Ninguno: la app todavía no está publicada, y al publicarse tiene que cumplir los dos desde el principio |
| 27/01/2027 | Políticas de contactos, ubicación, registro de llamadas y servicios en primer plano con geovallas | Ninguno: la app no usa esos permisos. Hay que verificarlo en GP-54 |
| 01/02/2027 | No se aceptan actualizaciones sin soporte de páginas de 16 KB | GP-16 |
| 2027 | La verificación de desarrolladores se extiende a todo el mundo | Ya cubierta si la cuenta y la app están registradas |
| Todos los años, alrededor del 31/08 | Sube el nivel de API exigido | Planificar la actualización anual de Capacitor y del target |

Hubo un anuncio de políticas el 15/07/2026. Vi solo un resumen parcial: menciona cambios en la política de contenido con restricción de edad, que no aplica a Knowmadic.

---

## 8. Lo que no se pudo verificar

- **Cuestionario de clasificación (IARC):** las preguntas exactas solo se ven en la consola. La página de ayuda no las lista.
- **ID de publicidad:** la existencia de esa declaración en la consola la confirmé solo en fuentes secundarias. La página oficial cubre el permiso `AD_ID` del manifiesto.
- **Ley de Servicios Digitales (DSA) en Google Play:** no encontré la página oficial (GP-80).
- **Ley Europea de Accesibilidad:** no la verifiqué (GP-74). Tampoco COPPA, la ley de protección de datos de Brasil (LGPD), el ECA Digital ni la SB 2420 en su texto legal: lo que figura aquí es lo que dice Google sobre ellas, y el análisis le toca a Legal.
- **Revisión de las versiones de prueba cerrada:** no encontré cuánto revisa Google esas versiones. Por eso el orden sugerido pide que la primera versión de prueba ya cumpla todo.
- **Países compradores:** la tabla de moneda y rango de precios por país de compra no cargó, porque `play.google/supported-locations` redirige. Se ve al cargar los precios en la consola.
- **Corrección a `docs/plan/investigacion.md`:** dice que los grupos de edad son «13-15, 16-17 y 18+». El formulario tiene además «5 y menos», «6-8» y «9-12» ([Público objetivo][publico]). No edité `docs/plan/`: queda para el coordinador.

---

## 9. Fuentes

Todas se consultaron el **22/10/2026**.

| Referencia | Página | Enlace |
|---|---|---|
| cuenta | Crear una cuenta de desarrollador de Play Console | https://support.google.com/googleplay/android-developer/answer/6112435 |
| tipos-cuenta | Tipos de cuenta e información que se muestra | https://support.google.com/googleplay/android-developer/answer/13628312 |
| ubicaciones | Ubicaciones admitidas para registro de desarrolladores y comerciantes | https://support.google.com/googleplay/android-developer/answer/9306917 |
| perfil-pagos | Perfil de pagos | https://support.google.com/googleplay/android-developer/answer/7161426 |
| verif-dev | Verificación de desarrolladores de Android | https://developer.android.com/developer-verification |
| plazos | Plazos de políticas | https://support.google.com/googleplay/android-developer/table/12921780 |
| politicas | Cronología de políticas de Play | https://developer.android.com/distribute/play-policies |
| prueba-personal | Requisitos de prueba para cuentas personales nuevas | https://support.google.com/googleplay/android-developer/answer/14151465 |
| pistas | Pruebas abiertas, cerradas e internas | https://support.google.com/googleplay/android-developer/answer/9845334 |
| billing-test | Probar Google Play Billing | https://developer.android.com/google/play/billing/test |
| app-id | Identificador de la app | https://developer.android.com/build/configure-app-module |
| api-objetivo | Nivel de API objetivo | https://support.google.com/googleplay/android-developer/answer/11926878 |
| aab | Android App Bundles | https://support.google.com/googleplay/android-developer/answer/9844279 |
| android16 | Cambios de comportamiento de Android 16 | https://developer.android.com/about/versions/16/behavior-changes-16 |
| 16kb | Páginas de memoria de 16 KB | https://developer.android.com/guide/practices/page-sizes |
| pbl | Versiones de Play Billing Library | https://developer.android.com/google/play/billing/deprecation-faq |
| abuso | Abuso de dispositivos y redes | https://support.google.com/googleplay/android-developer/answer/9888379 |
| funcionalidad | Funcionalidad, contenido y experiencia | https://support.google.com/googleplay/android-developer/answer/14983486 |
| capacitor-sdk | Target SDK de Capacitor (documentación oficial de Capacitor, no de Google) | https://capacitorjs.com/docs/android/setting-target-sdk |
| firma | Play App Signing | https://support.google.com/googleplay/android-developer/answer/9842756 |
| datos-usuario | Datos del usuario (política de privacidad y divulgación destacada) | https://support.google.com/googleplay/android-developer/answer/10144311 |
| revision | Preparar la app para la revisión | https://support.google.com/googleplay/android-developer/answer/9859455 |
| seguridad-datos | Sección de Seguridad de los datos | https://support.google.com/googleplay/android-developer/answer/10787469 |
| ad-id | ID de publicidad | https://support.google.com/googleplay/android-developer/answer/6048248 |
| borrado | Borrado de cuenta | https://support.google.com/googleplay/android-developer/answer/13327111 |
| ugc | Contenido generado por usuarios | https://support.google.com/googleplay/android-developer/answer/9876937 |
| csae | Normas de seguridad infantil | https://support.google.com/googleplay/android-developer/answer/14747720 |
| edad-restringida | Contenido y funciones con restricción de edad | https://support.google.com/googleplay/android-developer/answer/17036597 |
| publico | Público objetivo y contenido | https://support.google.com/googleplay/android-developer/answer/9867159 |
| familias | Requisitos de la política de Familias | https://support.google.com/googleplay/android-developer/answer/9893335 |
| age-signals | Play Age Signals API | https://developer.android.com/google/play/age-signals/overview |
| paises-req | Requisitos para distribuir en países específicos (ECA Digital) | https://support.google.com/googleplay/android-developer/answer/6223646 |
| eeuu-edad | Leyes de tiendas en estados de EE. UU. | https://support.google.com/googleplay/android-developer/answer/16569691 |
| blog-edad | Anuncio de Age Signals (Android Developers Blog, 29/07/2026) | https://android-developers.googleblog.com/2026/07/google-play-age-signals-api-safer-experiences.html |
| clasificacion | Clasificación de contenido (política) | https://support.google.com/googleplay/android-developer/answer/9898843 |
| iarc | Cuestionario de clasificación | https://support.google.com/googleplay/android-developer/answer/188189 |
| financieras | Declaración de funciones financieras | https://support.google.com/googleplay/android-developer/answer/13849271 |
| salud | Declaración de apps de salud | https://support.google.com/googleplay/android-developer/answer/14738291 |
| permisos | Permisos y API que acceden a información sensible | https://support.google.com/googleplay/android-developer/answer/9888170 |
| pagos | Política de pagos | https://support.google.com/googleplay/android-developer/answer/10281818 |
| suscripciones | Política de suscripciones | https://support.google.com/googleplay/android-developer/answer/9900533 |
| billing-integrar | Integrar Google Play Billing | https://developer.android.com/google/play/billing/integrate |
| billing-subs | Suscripciones (Billing) | https://developer.android.com/google/play/billing/subscriptions |
| crear-subs | Crear y administrar suscripciones | https://support.google.com/googleplay/android-developer/answer/140504 |
| ficha | Ficha de la tienda | https://support.google.com/googleplay/android-developer/answer/9859152 |
| metadatos | Política de metadatos | https://support.google.com/googleplay/android-developer/answer/9898842 |
| graficos | Recursos gráficos de la ficha | https://support.google.com/googleplay/android-developer/answer/9866151 |
| icono | Especificaciones del ícono de Google Play | https://developer.android.com/distribute/google-play/resources/icon-design-specifications |
| categorias | Categorías y etiquetas | https://support.google.com/googleplay/android-developer/answer/9859673 |
| idiomas | Traducir y localizar la ficha | https://support.google.com/googleplay/android-developer/answer/9844778 |
| credenciales | Datos de acceso para la revisión | https://support.google.com/googleplay/android-developer/answer/15748846 |
| accesibilidad-api | Uso de la API AccessibilityService | https://support.google.com/googleplay/android-developer/answer/10964491 |
| spam | Spam (WebView y afiliados) | https://support.google.com/googleplay/android-developer/answer/9899034 |
| twa | Trusted Web Activity: inicio rápido | https://developer.chrome.com/docs/android/trusted-web-activity/quick-start |
| paises | Países y regiones de distribución | https://support.google.com/googleplay/android-developer/answer/7550024 |

[cuenta]: https://support.google.com/googleplay/android-developer/answer/6112435
[tipos-cuenta]: https://support.google.com/googleplay/android-developer/answer/13628312
[ubicaciones]: https://support.google.com/googleplay/android-developer/answer/9306917
[perfil-pagos]: https://support.google.com/googleplay/android-developer/answer/7161426
[verif-dev]: https://developer.android.com/developer-verification
[plazos]: https://support.google.com/googleplay/android-developer/table/12921780
[politicas]: https://developer.android.com/distribute/play-policies
[prueba-personal]: https://support.google.com/googleplay/android-developer/answer/14151465
[pistas]: https://support.google.com/googleplay/android-developer/answer/9845334
[billing-test]: https://developer.android.com/google/play/billing/test
[app-id]: https://developer.android.com/build/configure-app-module
[api-objetivo]: https://support.google.com/googleplay/android-developer/answer/11926878
[aab]: https://support.google.com/googleplay/android-developer/answer/9844279
[android16]: https://developer.android.com/about/versions/16/behavior-changes-16
[16kb]: https://developer.android.com/guide/practices/page-sizes
[pbl]: https://developer.android.com/google/play/billing/deprecation-faq
[abuso]: https://support.google.com/googleplay/android-developer/answer/9888379
[funcionalidad]: https://support.google.com/googleplay/android-developer/answer/14983486
[capacitor-sdk]: https://capacitorjs.com/docs/android/setting-target-sdk
[firma]: https://support.google.com/googleplay/android-developer/answer/9842756
[datos-usuario]: https://support.google.com/googleplay/android-developer/answer/10144311
[revision]: https://support.google.com/googleplay/android-developer/answer/9859455
[seguridad-datos]: https://support.google.com/googleplay/android-developer/answer/10787469
[ad-id]: https://support.google.com/googleplay/android-developer/answer/6048248
[borrado]: https://support.google.com/googleplay/android-developer/answer/13327111
[ugc]: https://support.google.com/googleplay/android-developer/answer/9876937
[csae]: https://support.google.com/googleplay/android-developer/answer/14747720
[edad-restringida]: https://support.google.com/googleplay/android-developer/answer/17036597
[publico]: https://support.google.com/googleplay/android-developer/answer/9867159
[familias]: https://support.google.com/googleplay/android-developer/answer/9893335
[age-signals]: https://developer.android.com/google/play/age-signals/overview
[paises-req]: https://support.google.com/googleplay/android-developer/answer/6223646
[eeuu-edad]: https://support.google.com/googleplay/android-developer/answer/16569691
[blog-edad]: https://android-developers.googleblog.com/2026/07/google-play-age-signals-api-safer-experiences.html
[clasificacion]: https://support.google.com/googleplay/android-developer/answer/9898843
[iarc]: https://support.google.com/googleplay/android-developer/answer/188189
[financieras]: https://support.google.com/googleplay/android-developer/answer/13849271
[salud]: https://support.google.com/googleplay/android-developer/answer/14738291
[permisos]: https://support.google.com/googleplay/android-developer/answer/9888170
[pagos]: https://support.google.com/googleplay/android-developer/answer/10281818
[suscripciones]: https://support.google.com/googleplay/android-developer/answer/9900533
[billing-integrar]: https://developer.android.com/google/play/billing/integrate
[billing-subs]: https://developer.android.com/google/play/billing/subscriptions
[crear-subs]: https://support.google.com/googleplay/android-developer/answer/140504
[ficha]: https://support.google.com/googleplay/android-developer/answer/9859152
[metadatos]: https://support.google.com/googleplay/android-developer/answer/9898842
[graficos]: https://support.google.com/googleplay/android-developer/answer/9866151
[icono]: https://developer.android.com/distribute/google-play/resources/icon-design-specifications
[categorias]: https://support.google.com/googleplay/android-developer/answer/9859673
[idiomas]: https://support.google.com/googleplay/android-developer/answer/9844778
[credenciales]: https://support.google.com/googleplay/android-developer/answer/15748846
[accesibilidad-api]: https://support.google.com/googleplay/android-developer/answer/10964491
[spam]: https://support.google.com/googleplay/android-developer/answer/9899034
[twa]: https://developer.chrome.com/docs/android/trusted-web-activity/quick-start
[paises]: https://support.google.com/googleplay/android-developer/answer/7550024
