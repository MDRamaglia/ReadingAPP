# Lista de control de publicación

**Preparó:** QA, el 23/10/2026 (P19). **Estado:** borrador para revisión del coordinador.

Esta lista se recorre **antes de cada envío a la prueba cerrada y antes de pedir producción**. Sale de los 80 requisitos de `docs/requisitos/google-play.md` (GP-01 a GP-80): cada punto lleva su código, y todos los requisitos aparecen al menos una vez. Los casos (LEC-xx, CTA-xx, COB-xx…) y los dispositivos (D1 a D4) están en el [plan de pruebas](plan.md).

## Cómo se usa

- **Cada punto se contesta con sí o no.** «No» frena el envío, salvo que el coordinador lo acepte por escrito, con motivo y fecha. Un punto que empieza con «Si…» y no corresponde se marca «no aplica», con el motivo.
- **Verifica:** quién hace la comprobación o entrega la evidencia. Cuando hace falta la consola, solo el titular tiene acceso (`equipo.md`): entrega la captura y QA la controla.
- **Evidencia:** lo que se guarda en el informe de la versión (se propone `docs/qa/versiones/<fecha>-<versión>.md`). Sin datos personales ni contraseñas.
- **Cuándo:**
  - **Siempre:** antes de cada envío a la prueba cerrada y a producción.
  - **Cerrada:** antes del primer envío a la prueba cerrada; después, se confirma que no cambió.
  - **Cobro:** en cada envío que incluya el cobro. Antes de producción es obligatorio, porque el objetivo es monetizar.
  - **Producción:** antes de pedir el acceso a producción y antes de publicar.
- Las reglas de Google cambian seguido. Si pasaron más de tres meses desde la consulta de las fuentes (22/10/2026), Requisitos de tiendas revisa la lista antes de usarla.
- **◆** marca lo que depende de la propuesta técnica todavía sin decidir (Supabase, Capacitor 8 y RevenueCat).

---

## 0. Versión candidata y cierre del panel de desarrollo (D10)

D10: el panel de desarrollo (`?dev=1`) se cierra **antes de la versión candidata** (P01). Si estos puntos no se cumplen, **no hay versión candidata**: QA no sigue con el resto de la lista.

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-01 | ¿Al abrir la compilación candidata con `?dev=1` en la dirección, no aparece el botón «Desarrollo» en ninguna pantalla? | GP-09; D10 | QA | Captura de la biblioteca, el perfil y el club | Siempre |
| LP-02 | ¿Tampoco aparece si el dispositivo ya tenía guardado `knowmadic.dev=1` de una versión anterior? | GP-09; D10 | QA | Captura y el valor guardado antes de abrir | Siempre |
| LP-03 | ¿La compilación no incluye el panel? Por ejemplo, `grep -rl "dev-panel" dist/` no devuelve nada, o se usa el método equivalente que documente Desarrollo al cerrar P01 | GP-09; D10 | QA | Salida del comando | Siempre |
| LP-04 | ¿Se compiló con `VITE_BACKEND=remote`, y el aviso «Prueba local» no aparece en el registro, el perfil, las reseñas ni el club? | GP-09 | QA | Capturas | Siempre |
| LP-05 | ¿La compilación apunta al servidor de **producción**? La prueba cerrada también se hace contra producción, porque es la app que se va a publicar | GP-09 | Servidor confirma; QA controla | Variables de compilación, sin claves secretas | Siempre |
| LP-06 | ¿Ninguna pantalla muestra contenido inventado, ni responde «próximamente» en una función que la versión ofrece (cobro, gestión de la suscripción, recuperación de contraseña)? | GP-09, GP-64 | QA | Recorrido con capturas | Siempre |
| LP-07 | ¿El `versionCode` es mayor que el del envío anterior, y el commit y las notas de cambios figuran en el informe de la versión? | — | Desarrollo app | Informe de la versión | Siempre |
| LP-08 | ¿Ni el paquete ni la web contienen secretos? `grep -r "service_role" dist/` no encuentra nada, y tampoco la búsqueda de claves secretas de cobro (◆ formato a confirmar con Servidor) | Regla 5 de `equipo.md` | QA y Servidor | Salida de los comandos | Siempre |
| LP-09 | ¿`npm run typecheck`, `npm test` y `npm run test:e2e` pasaron dos veces seguidas sobre el mismo commit, sin fallas sin explicar? | GP-19 | QA | Salida de las corridas | Siempre |
| LP-10 | ¿La prueba de Safari (`scripts/webkit/probar_safari.py`) pasó con la compilación web de la misma versión? | GP-19 | QA | Salida de la corrida | Siempre |
| LP-11 | ¿Los flujos críticos (registro, borrado de cuenta, compra y restauración, denuncia y bloqueo, y control de edad; sección 6.6 del plan) pasaron en D1, D3 y D4, sin fallas bloqueantes ni altas abiertas? | GP-19 | QA | Informe de la versión y enlaces a `docs/qa/fallas/` | Siempre |
| LP-12 | ¿El informe previo al lanzamiento de esta versión no muestra cierres ni «la app no responde», y sus avisos están clasificados? | GP-19 | Titular comparte el informe; QA lo revisa | Captura del informe | Siempre |

## 1. Cuenta de desarrollador y verificación (A)

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-13 | ¿La cuenta personal está creada y verificada: identidad, dispositivo Android, correo y teléfono? | GP-01, GP-02, GP-03 | Titular | Captura del panel de la consola sin tareas de verificación pendientes | Cerrada |
| LP-14 | ¿El titular aceptó que se muestren su nombre legal, su país, su correo y, al cobrar, su dirección completa? | GP-04 | Titular | D03 en `decisiones.md` | Cerrada |
| LP-15 | ¿El perfil de pagos de comerciante está activo, con una cuenta bancaria del mismo país? | GP-05, GP-77 | Titular, con Contable | Captura del perfil, sin datos bancarios | Cobro |
| LP-16 | ¿La app figura registrada para la verificación de desarrolladores de Android en la página de inicio de la consola? | GP-06 | Titular; Requisitos controla | Captura | Cerrada |

## 2. Prueba cerrada y acceso a producción (B)

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-17 | ¿La versión enviada a la prueba cerrada es la que se va a publicar, con el servidor real y sin panel ni «Prueba local» (LP-01 a LP-05)? | GP-09 | QA | Sección 0 de esta lista | Siempre |
| LP-18 | ¿La prueba cerrada usa una lista de correos o un Grupo de Google, tiene cargado el canal de comentarios y el enlace de inscripción funciona? | GP-08 | Titular, con Requisitos | Captura de la pista y prueba del enlace | Cerrada |
| LP-19 | ¿Todas las personas que van a probar premium están cargadas como testers con licencia, y esa lista coincide con la de la prueba cerrada? | GP-10 | Titular; QA compara las listas | Captura de *License testing* | Cobro |
| LP-20 | ¿Hay 12 o más personas inscriptas con 14 días seguidos cumplidos, según la planilla de fechas de inscripción? | GP-07 | Titular; QA controla la planilla | Captura de la consola y la planilla (fuera del repositorio) | Producción |
| LP-21 | ¿La planilla de comentarios está al día, y cada falla tiene su informe en `docs/qa/fallas/` con su estado? | GP-11 | QA | Resumen por gravedad | Producción |
| LP-22 | ¿Las respuestas de la solicitud de acceso a producción están redactadas con los datos reales de la prueba: reclutamiento, participación, comentarios y cambios hechos? | GP-11 | Requisitos (borrador) y Titular (envío) | Borrador de las respuestas | Producción |

## 3. Paquete, nivel de API y firma (C y D)

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-23 | ¿El identificador de la app (`applicationId`) es el definitivo y coincide con el registrado en la consola? | GP-12, GP-06 | Desarrollo app y Titular | Manifiesto y captura de la consola | Siempre |
| LP-24 | ¿El manifiesto combinado del `.aab` declara `targetSdkVersion` 36, o el que exija Play a la fecha? | GP-13 | QA | Salida de `bundletool dump manifest` o del analizador de APK de Android Studio | Siempre |
| LP-25 | ¿Se sube un Android App Bundle (`.aab`), no un APK? | GP-14 | QA | Captura de la versión en la consola | Siempre |
| LP-26 | ¿La app pasa AND-01 a AND-03 (borde a borde, gesto atrás y pantallas de 600 dp o más) en D3 y D4? | GP-15 | QA | Capturas y un video corto | Siempre |
| LP-27 | Si el paquete incluye bibliotecas nativas (`.so`), ¿admiten páginas de memoria de 16 KB? | GP-16 | Desarrollo app | Resultado de la verificación indicada en la guía oficial | Siempre |
| LP-28 | ◆ ¿La biblioteca de cobros incluida usa Play Billing Library 8 o posterior? | GP-17 | Desarrollo app y Servidor | Versión de la dependencia | Cobro |
| LP-29 | ¿La app no descarga código ejecutable por fuera de Play? Si hay actualizaciones en vivo, ¿son solo de recursos web? | GP-18 | Desarrollo app | Descripción del mecanismo | Siempre |
| LP-30 | ¿La app instala, abre y completa los recorridos sin cierres ni congelamientos en D1 a D4, incluido el OCR en el equipo de gama baja (LEC-07, REN-01, REN-03 y REN-06)? | GP-19 | QA | Informe de la versión | Siempre |
| LP-31 | ¿La app sigue teniendo funcionalidad propia (lector, OCR y biblioteca), y no es solo texto ni un sitio dentro de una WebView? | GP-20, GP-75 | QA | — | Cerrada |
| LP-32 | ¿Play App Signing está activo? | GP-21 | Titular | Captura de la consola | Cerrada |
| LP-33 | ¿La clave de subida está guardada fuera del repositorio y con copia, y `git ls-files` no lista archivos `.jks`, `.keystore`, `keystore.properties`, `key.properties` ni otros de contraseñas de firma? | GP-22 | Desarrollo app y Titular; QA corre el comando | Salida del comando | Siempre |
| LP-34 | ¿La versión de publicación no es depurable ni habilita la depuración remota de la WebView (AND-09)? | — | QA | Manifiesto y configuración de Capacitor ◆ | Siempre |

## 4. Privacidad y Seguridad de los datos (E y F)

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-35 | ¿La dirección de la política de privacidad está cargada en la consola y abre sin sesión, desde cualquier país, en HTML (no en PDF), con el título «Política de privacidad», sin que terceros puedan editarla? | GP-23 | QA | Capturas desde dos redes, una de ellas con una VPN de otro país | Siempre |
| LP-36 | ¿Dentro de la app hay un enlace visible a la política, al que se llega sin iniciar sesión, al menos desde el registro y el perfil (CTA-04)? | GP-24 | QA | Capturas | Siempre |
| LP-37 | ¿La política publicada es la que aprobó el titular, en los tres idiomas, y tiene el contacto del desarrollador, los datos que se recopilan y comparten, el manejo seguro y la retención y el borrado, de acuerdo con lo que la app hace? | GP-25 | Legal y Titular; QA la contrasta con SEG-02 | Versión y fecha de la política | Siempre |
| LP-38 | Si la app recopila datos que la persona no espera (por ejemplo, medición de uso), ¿muestra antes un aviso destacado y pide el consentimiento, sin que salir del aviso cuente como aceptar? | GP-26 | QA | Capturas | Siempre |
| LP-39 | ¿El formulario de Seguridad de los datos está completo? | GP-27 | Requisitos y Titular | Captura de la consola | Siempre |
| LP-40 | ¿Lo declarado en ese formulario coincide con el tráfico real medido con un proxy (SEG-02): solo el servidor y los proveedores declarados, siempre por HTTPS, y con la tabla de diferencias vacía? | GP-28, GP-29 | QA y Servidor | Tabla de diferencias | Siempre |
| LP-41 | ¿El manifiesto combinado no tiene el permiso `com.google.android.gms.permission.AD_ID`, y la declaración de la consola dice lo mismo (SEG-05)? | GP-30 | QA (manifiesto) y Requisitos (consola) | Lista de permisos y captura | Siempre |

## 5. Borrado de cuenta (G)

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-42 | ¿Se puede borrar la cuenta desde la app (CTA-10) y, después, el servidor no conserva más que lo que informa la política? | GP-31, GP-33 | QA; Servidor hace la consulta | Capturas y resultado de la consulta del servidor | Siempre |
| LP-43 | ¿La página web de borrado funciona sin la app, nombra la app o al desarrollador como en la ficha, muestra el pedido de borrado en forma destacada, avisa que hay que cancelar la suscripción de Google Play, informa qué datos se conservan y ofrece un canal de soporte (CTA-11 y CTA-12)? | GP-32 | QA | Capturas y prueba completa con una cuenta QA-DEL | Siempre |
| LP-44 | ¿En Seguridad de los datos se declara que la cuenta se puede borrar, con el enlace a esa página? | GP-34 | Requisitos y Titular | Captura | Siempre |

## 6. Contenido generado por usuarios (H)

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-45 | ¿No se puede crear la cuenta, publicar por primera vez ni contratar premium sin aceptar los términos y las normas de la comunidad (CTA-03)? | GP-35 | QA | Capturas | Siempre |
| LP-46 | ¿Las normas publicadas definen y prohíben el contenido y las conductas objetables, incluido el contenido sexual explícito, y lo que prometen coincide con lo que la app y el servidor hacen? | GP-36 | Legal; QA contrasta con MOD-01 a MOD-06 | Versión de las normas | Siempre |
| LP-47 | ¿Se pueden denunciar las reseñas, las conversaciones, las respuestas y los nombres de usuario, y cada denuncia llega a la cola (MOD-01 y MOD-02)? | GP-37 | QA | Capturas y registro de la cola | Siempre |
| LP-48 | ¿Se puede bloquear y desbloquear a una persona, con el efecto que describen las normas (MOD-04)? | GP-38 | QA | Capturas desde las cuentas QA-A y QA-B | Siempre |
| LP-49 | ¿Hay una persona asignada a moderar, y el tiempo de respuesta medido con denuncias de prueba cumple el plazo publicado (MOD-07)? | GP-39 | Titular (asigna); QA (mide) | Registro con las horas de denuncia y de resolución | Siempre |
| LP-50 | ¿El filtro de contenido objetable y la prioridad para los casos con menores funcionan (MOD-05 y MOD-08)? | GP-40 | QA | Resultado de los casos | Siempre |
| LP-51 | ¿Premium sigue sin dar visibilidad paga ni likes que se compren? | GP-41 | Producto; QA lo confirma | — | Siempre |
| LP-52 | ¿La categoría elegida no es «Social» ni «Citas», y la app no tiene chat anónimo o aleatorio, mensajes privados ni funciones con restricción de edad? Si alguna de esas cosas cambió, ¿se cumplen las normas de seguridad infantil? | GP-42, GP-43 | Requisitos | Captura de la ficha | Siempre |

## 7. Público objetivo y edad (I)

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-53 | ¿Los grupos de edad declarados en la consola son los que decidió el titular (opción A, B o C de la sección 3 de `google-play.md`), y coinciden con la regla de registro vigente (D09, o la que la reemplace)? | GP-44 | Requisitos y Titular | Captura y número de decisión | Siempre |
| LP-54 | Si se declaró algún grupo de menores de 13, ¿se cumple la política de Familias? | GP-45 | Legal y Requisitos | Análisis escrito | Siempre |
| LP-55 | ¿Los textos, las capturas y el ícono de la ficha no tienen elementos dirigidos a niños? | GP-46 | Marketing y Diseño; QA revisa | Planilla de control de la ficha | Siempre |
| LP-56 | ¿El control de edad del Reading Club pasa EDA-02, EDA-04, EDA-07, EDA-08 y EDA-11: la fecha empieza vacía, no se cambia desde la app y el servidor la valida aunque se altere la app? | GP-47 | QA; Servidor para EDA-08 | Capturas y respuesta del servidor | Siempre |
| LP-57 | ¿Legal dejó por escrito si aplican las leyes de edad de Brasil y de Texas y, si aplican, está integrada la franja de edad de la tienda (EDA-15)? | GP-48 | Legal; Desarrollo app si aplica | Análisis escrito | Producción |

## 8. Clasificación y otras declaraciones (J y K)

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-58 | ¿El cuestionario de clasificación está enviado y sus respuestas coinciden con la app de esta versión (interacción entre usuarios y compras digitales)? Si algo cambió, ¿se volvió a enviar? | GP-49 | Requisitos (prepara) y Titular (carga) | Captura de la clasificación | Siempre |
| LP-59 | ¿Están cargadas las declaraciones de anuncios, funciones financieras, salud, noticias y COVID-19, y la sección «Contenido de la app» no tiene pendientes? Las de funciones financieras y de salud se exigen también en la prueba cerrada | GP-50, GP-51, GP-52, GP-53 | Titular | Captura de «Contenido de la app» | Cerrada |

## 9. Permisos (L)

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-60 | ¿El manifiesto combinado tiene solo los permisos necesarios, sin `MANAGE_EXTERNAL_STORAGE` ni `READ_MEDIA_*`, incluidos los que agregan los complementos, y los documentos se abren con el selector del sistema (LEC-19 y AND-04)? | GP-54 | QA | Lista de permisos del manifiesto | Siempre |
| LP-61 | Si apareció un permiso restringido, ¿está presentado su formulario de declaración? | GP-55 | Desarrollo app | Captura | Siempre |

## 10. Pagos y suscripciones (M)

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-62 | ¿Premium se cobra con la facturación de Google Play, y en el paquete no hay enlaces ni botones hacia otros medios de pago (COB-16)? | GP-56, GP-57 | QA | Recorrido con capturas | Siempre |
| LP-63 | ¿Las compras se validan en el servidor antes de habilitar premium, quedan reconocidas, no habilitan nada mientras están pendientes, y la app consulta las compras al conectar con Billing y al volver a primer plano (COB-03 a COB-05 y COB-07)? | GP-58 | QA, con testers con licencia; Servidor muestra los registros | Capturas y registros del servidor | Cobro |
| LP-64 | ¿El ciclo de la suscripción está probado: restauración, renovación, gracia con acceso, suspensión sin acceso, cancelación, reembolso y revocación, con las notificaciones en tiempo real (COB-07 y COB-09 a COB-12)? | GP-59 | QA y Servidor | Registro de cada caso | Cobro |
| LP-65 | ¿La pantalla de oferta muestra, antes de comprar y sin pasos extra, el precio, el período, qué incluye, la renovación automática, cómo cancelar y los enlaces legales, en los tres idiomas, sin destacar el precio mensual en el plan anual (COB-02)? | GP-60 | QA; Diseño y Producto revisan | Capturas en es, en y pt | Cobro |
| LP-66 | ¿El enlace del perfil abre el centro de suscripciones de Google Play con el producto y el paquete, y la app explica cómo cancelar (COB-10)? | GP-61 | QA | Video corto | Cobro |
| LP-67 | ¿Las suscripciones están creadas en la consola (planes base, precios por país y ofertas), coinciden con la decisión T05 y la app las muestra igual (COB-17)? | GP-62, GP-79 | Titular (carga); QA compara | Capturas de la consola y de la app | Cobro |

## 11. Ficha de la tienda (N)

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-68 | ¿El nombre tiene 30 caracteres o menos en cada idioma, sin emojis, mayúsculas sostenidas, precios, promociones ni rankings? | GP-63 | Marketing; QA cuenta | Planilla de control de la ficha | Siempre |
| LP-69 | ¿La descripción breve tiene 80 caracteres o menos y la completa 4000 o menos, sin repetir palabras clave ni usar testimonios anónimos? ¿Cada cosa que prometen funciona en esta versión? | GP-64 | Marketing; QA contrasta cada afirmación con la app | Planilla con cada afirmación y el caso que la prueba | Siempre |
| LP-70 | ¿El ícono es de 512 × 512, PNG de 32 bits con alfa, sRGB, de 1024 KB o menos, un cuadrado completo sin esquinas redondeadas ni sombra, y sin texto ni insignias engañosas? | GP-65 | Diseño; QA mide | Medición del archivo | Siempre |
| LP-71 | ¿Hay un gráfico destacado de 1024 × 500, en JPEG o PNG de 24 bits sin alfa? | GP-66 | Diseño; QA mide | Medición del archivo | Siempre |
| LP-72 | ¿Hay al menos 2 capturas por tipo de dispositivo, y al menos 4 de 1080 px o más para que Google pueda promocionar la app? ¿Cumplen el formato y las proporciones, sin «mejor», «n.º 1» ni «gratis», sin insignias ni llamados a la acción, y sin «Prueba local», el panel de desarrollo ni contenido inventado? Las de `tests/.artifacts/capturas/` no sirven | GP-67 | Diseño y Marketing; QA revisa | Planilla con la medición de cada captura | Siempre |
| LP-73 | ¿La ficha está en los idiomas de los mercados (por ejemplo, es-419, en-US y pt-BR) y coincide con la variante del español que decida T06? | GP-68 | Localización | Capturas de la ficha en cada idioma | Siempre |
| LP-74 | ¿Hay una categoría elegida (la propuesta es «Libros y obras de consulta») y 5 etiquetas o menos? | GP-69 | Requisitos y Marketing | Captura | Cerrada |
| LP-75 | ¿El correo de contacto (obligatorio) y el sitio web (recomendado) están cargados, y un correo de prueba enviado por QA recibe respuesta? | GP-70 | Titular; QA prueba el correo | Captura y fecha de la respuesta | Siempre |
| LP-76 | Si hay video, ¿es de YouTube, público u oculto, sin anuncios ni restricción de edad? | GP-71 | Marketing | Enlace | Siempre |

## 12. Credenciales para la revisión (O)

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-77 | ¿Las credenciales de revisión (REV-1 y REV-2) están cargadas, con instrucciones en inglés, sin doble factor ni códigos de un solo uso y sin vencimiento? ¿QA ingresó con ellas el mismo día del envío, en un dispositivo limpio y desde otra red? | GP-72 | Servidor (cuentas), Requisitos (instrucciones) y Titular (carga); QA prueba | Capturas del ingreso, sin la contraseña | Siempre |
| LP-78 | ¿Con REV-1 se llega al Reading Club y a todo lo pago, con un premium otorgado por el servidor, sin el panel y sin compra (COB-21)? | GP-73 | QA | Capturas | Siempre |

## 13. Accesibilidad (P)

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-79 | ¿Los casos de accesibilidad de prioridad 1 (ACC-01 a ACC-04, ACC-06 y ACC-07) pasan, o sus fallas están informadas y clasificadas? Es una referencia interna: Play no exige requisitos generales a esta app | GP-74 | QA | Informe de la versión | Siempre |
| LP-80 | Si la app se distribuye en la Unión Europea, ¿Legal revisó la Ley Europea de Accesibilidad? | GP-74 | Legal | Análisis escrito | Producción |

## 14. App web empaquetada (Q)

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-81 | ¿El contenido que muestra la WebView es del titular y no hay sitios de terceros embebidos? | GP-75 | QA | Lista de los orígenes que carga la app (SEG-02) | Cerrada |
| LP-82 | Si se empaquetó como TWA, ¿`/.well-known/assetlinks.json` está en la raíz del dominio y la app no muestra la barra del navegador? | GP-76 | Desarrollo app; QA prueba | Captura | Siempre |

## 15. Países y precios (R)

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-83 | ¿Argentina sigue figurando entre las ubicaciones admitidas para el registro de comerciantes? | GP-77 | Contable | Fecha de la consulta de la fuente | Cobro |
| LP-84 | ¿Los países de cada pista (prueba y producción) son los que decidió el titular (T07)? | GP-78 | Requisitos y Titular | Captura de los países por pista | Siempre |
| LP-85 | ¿Cada país agregado tiene un precio de suscripción? | GP-79 | Titular; QA compara con T05 | Captura | Cobro |
| LP-86 | Si los países incluyen la Unión Europea, ¿está verificada en la consola la condición de comerciante que pide la Ley de Servicios Digitales? | GP-80 | Legal | Captura | Siempre |

## 16. Antes de publicar

| # | ¿Se cumple? (sí o no) | GP | Verifica | Evidencia | Cuándo |
|---|---|---|---|---|---|
| LP-87 | ¿Android vitals de la prueba cerrada, si hay datos, está por debajo de los umbrales de mal comportamiento (REN-09)? | GP-19 | QA | Captura de vitals | Producción |
| LP-88 | ¿Todos los puntos anteriores están en «sí» o «no aplica», y las excepciones tienen la aprobación escrita del coordinador? | Todos | QA | Esta lista completa | Producción |
| LP-89 | ¿Está activa la publicación administrada, y hay al menos una semana de margen entre el envío a producción y el lanzamiento (guía, punto 4.9)? | — | Titular | Captura | Producción |

---

## Cierre de la versión

| Versión | Fecha | Envío (cerrada o producción) | Puntos en «no» | Recomendación de QA | Revisó el coordinador | Decidió el titular |
|---|---|---|---|---|---|---|
| | | | | | | |

El envío lo hace el titular. Esta lista no reemplaza su decisión.
