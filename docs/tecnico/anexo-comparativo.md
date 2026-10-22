# Anexo: detalle de la comparación de servidor, empaquetado y cobros

Acompaña a [`decision-servidor-empaquetado-cobros.md`](decision-servidor-empaquetado-cobros.md).

- Todas las fuentes se consultaron el **22/10/2026** (sección 8).
- Lo marcado *sin verificar* no se pudo confirmar en una fuente oficial.
- Los días de trabajo son **estimaciones propias** para una persona que desarrolla, con revisión.

## 1. Supuestos y cálculo de costos

### Escenarios

| | Lanzamiento | 1.000 | 10.000 |
|---|---|---|---|
| Usuarios activos por mes | 300 | 1.000 | 10.000 |
| Activos por día (supuesto: 30 %) | 90 | 300 | 3.000 |
| Suscripciones (supuesto: 3 % a USD 3 por mes; los precios reales dependen de T05) | 9 | 30 | 300 |
| Facturación bruta mensual | USD 27 | USD 90 | USD 900 |

### Supabase [S1][S9][S10][S11]

**Gratuito**
- 50.000 usuarios activos por mes, 500 MB de base, 5 GB de transferencia y 1 GB de archivos.
- **Se pausa después de una semana sin actividad.**
- No tiene copias automáticas y guarda los registros 1 día.
- Hasta 2 proyectos.

**Pro: desde USD 25 por mes**
- Incluye USD 10 de crédito de cómputo, que cubren una instancia Micro.
- Cuotas incluidas:
  - 100.000 usuarios activos por mes;
  - 8 GB de disco;
  - 250 GB de transferencia;
  - 100 GB de archivos.
- Excedentes:
  - USD 0,00325 por usuario activo;
  - USD 0,125 por GB de base;
  - USD 0,09 por GB transferido.
- Copias diarias guardadas 7 días y registros guardados 7 días.

**Agregados**
- **Cómputo:** Micro USD 10, Small USD 15 y Medium USD 60.
- **Funciones:** 2 millones de invocaciones incluidas en Pro; después, USD 2 por millón.
- **Recuperación a un momento dado:** unos USD 100 por mes para 7 días. Exige cómputo Small.
- **Tope de gasto:** cubre el uso, pero **no el cómputo**.

**Estimación para 10.000 usuarios**
- **Base:** menos de 1 GB (20.000 reseñas de 3 KB y 50.000 mensajes del club de 2 KB, más índices).
- **Transferencia:** alrededor de 100 GB (10 MB por usuario activo, porque la app y los documentos no pasan por Supabase).
- **Resultado:** entra en el Pro básico. Si hiciera falta cómputo Small: 25 + 15 − 10 = **USD 30**. Que el crédito se aplique a Small está *sin verificar*.

### Correo para cuentas: Supabase lo exige para producción [S6][E1][E2]

| Proveedor | Precio |
|---|---|
| Resend gratuito | 3.000 por mes y 100 por día |
| Resend Pro | USD 20 por mes, 50.000 correos |
| Amazon SES | USD 0,10 cada 1.000 correos |

- **300 y 1.000 usuarios:** alcanza el plan gratuito.
- **10.000 usuarios:** puede haber días con más de 100 correos entre altas, confirmaciones y recuperaciones. Entonces conviene Resend Pro (USD 20) o SES (menos de USD 1, con más configuración).

### Firebase [F1][F2][F5]

**Spark (gratuito)**
- Authentication sin costo hasta 50.000 usuarios activos por mes.
- Firestore: 1 GiB, 50.000 lecturas, 20.000 escrituras y 20.000 borrados **por día**, y 10 GiB de transferencia por mes.
- **No incluye Cloud Functions**, que hacen falta para borrar en cascada, para los contadores y para recibir avisos de pagos.

**Blaze**
- Mantiene la misma cuota gratuita y suma 2 millones de invocaciones de funciones por mes.
- Precio de Firestore en Iowa: USD 0,03 cada 100.000 lecturas, USD 0,09 cada 100.000 escrituras y USD 0,01 cada 100.000 borrados. **El precio en São Paulo o en la UE no se pudo extraer (*sin verificar*).**

**Estimación para 10.000 usuarios:** 3.000 activos por día × 300 lecturas = 900.000 lecturas por día. Restando la cuota gratuita y multiplicando por 30 días, son 25,5 millones de lecturas pagas, unos **USD 8 por mes en Iowa**.

**Correo:** incluido. En Blaze, hasta 10.000 recuperaciones de contraseña y 100.000 verificaciones por día.

### Supabase autoalojado

- Un servidor Hetzner del tipo «Cost-Optimized» cuesta **desde € 5,99 por mes sin IVA**, en Alemania o Finlandia [H1].
- **Sin verificar:**
  - el tamaño que necesita la pila completa de Supabase;
  - el costo de las copias externas.
- A eso se suman el correo y las horas de operación.

### RevenueCat [R1]

- Cobra sobre la **facturación bruta mensual**, antes de la comisión de la tienda.
- Es gratis hasta USD 2.500. Al llegar, cobra 1 %; el ejemplo oficial es USD 25 sobre USD 2.500.
- Con los supuestos del cuadro, el umbral llega a unos **27.800 usuarios activos**.
- **Sensibilidad:** con 5 % de conversión a USD 5, se llega a los 10.000 usuarios y RevenueCat cobra USD 25 por mes.
- Cómo cuenta los planes anuales (si suman entero en el mes del cobro, lo que daría picos) está *sin verificar*.
- La comisión de Google del 15 % para suscripciones se paga con las dos opciones (`docs/plan/investigacion.md`).

### Google Play Billing directo [G5][G6]

- **Pub/Sub:** los primeros 10 GiB por mes son gratis y después cuesta USD 40 por TiB. Cada aviso pesa alrededor de 1 KB.
- **API de Google Play Developer:** cuota de 3.000 consultas por minuto. No publica precio (*sin verificar que sea gratis*).
- Las dos opciones necesitan un proyecto de Google Cloud con Pub/Sub [R3].

### Empaquetado

- Capacitor y Bubblewrap no tienen costo [C4], y Android Studio es gratuito.
- La cuenta de Play cuesta USD 25 una sola vez, para cualquiera de las dos opciones.

## 2. Esfuerzo desglosado (días)

**Supabase: 12 a 18 días**

| Tarea | Días |
|---|---|
| Migraciones del esquema de referencia: perfil creado al registrarse, nombre único sin distinguir mayúsculas, contadores de respuestas. Fecha de nacimiento que se carga una sola vez (`setBirthDate`, mediante una función del servidor) y regla del club: 16 años o más y premium | 3 a 4 |
| Pruebas de las reglas por fila contra Supabase local | 2 a 3 |
| `remoteBackend.ts` con `supabase-js`. El like se hace con una función en el servidor | 3 a 4 |
| Borrado de cuenta (función con la clave de servicio) y página web de borrado | 1 a 2 |
| Moderación: denuncias, bloqueos, filtro, cola y rol de moderador | 3 a 5 |

**Firebase: 20 a 30 días**

| Tarea | Días |
|---|---|
| Modelo de documentos, con autores desnormalizados y puntaje «hot» | 4 a 6 |
| Reglas y pruebas en el emulador | 4 a 6 |
| Funciones para contadores, borrado en cascada y plan | 4 a 6 |
| Búsqueda sin tildes: palabras normalizadas, edición Enterprise o un buscador externo | 3 a 5 |
| Adaptador y moderación | 5 a 7 |

**Capacitor: 6 a 10 días**

| Tarea | Días |
|---|---|
| Integración con Vite | 1 |
| Barras del sistema en API 36 [C3] | 1 a 2 |
| Botón atrás y abrir archivos que llegan desde otras apps | 1 a 2 |
| Compilación condicional: sin *service worker*, sin panel de desarrollo y sin cobro web | 1 |
| Íconos, firma y paquete AAB | 1 a 2 |
| Pruebas en dispositivos: pdf.js, OCR con WASM y archivos de 300 MB | 1 a 2 |

**TWA: 3 a 5 días, más el cobro**

| Tarea | Días |
|---|---|
| Dominio propio y `assetlinks.json` con la huella de la firma de Play [T3] | 1 |
| Bubblewrap o PWABuilder | 1 a 2 |
| Ocultar el panel y cualquier cobro web dentro de la TWA | 1 a 2 |
| Cobro con la Digital Goods API, del lado de la app [T4] | 4 a 6 |

En la TWA, el lado del servidor del cobro es el de la opción directa.

**RevenueCat: 4 a 7 días**

| Tarea | Días |
|---|---|
| SDK: vincular la compra a la cuenta con su identificador y comprar | 1 a 2 |
| Webhook, tabla de suscripciones y cambio de plan | 1 a 2 |
| Restauración y enlace a la gestión en Play | 0,5 a 1 |
| Conciliación diaria y pruebas con testers con licencia | 1 a 2 |

**Directo: 12 a 20 días**

| Tarea | Días |
|---|---|
| Plugin `capacitor-plugin-cdv-purchase` | 2 a 3 |
| Validación con `purchases.subscriptionsv2` y acuse de la compra [G2][G4] | 2 a 3 |
| Recepción autenticada de los avisos de Pub/Sub | 1 a 2 |
| Estados y reembolsos: 18 tipos de aviso y anulaciones [G3] | 4 a 7 |
| Conciliación y pruebas | 3 a 5 |

Para el iPhone se suman 8 a 12 días: StoreKit, App Store Server API y sus avisos (*sin verificar* contra los requisitos actuales de Apple).

## 3. Dónde quedan los datos y criterio de la AAIP

### Ubicación por proveedor

| Proveedor | Ubicación de los datos | Contraparte y subencargados |
|---|---|---|
| Supabase | La región elegida al crear el proyecto. Hay 17 [S2], entre ellas São Paulo, Canadá, Irlanda, Londres, París, Fráncfort, Zúrich y Estocolmo. No se cambia sin migrar a un proyecto nuevo [S3]. El contrato dice que los datos se guardan y procesan «principalmente» en esa región, con excepciones [S4] | Supabase Pte. Ltd. (Singapur) [S4]. Subencargados en EE. UU.: Supabase, Inc. (soporte), AWS, Cloudflare, Postmark, Sentry y otros (lista del 12/10/2026) [S5] |
| Firebase | Firestore: la región elegida, fija [F3]. Authentication: **solo EE. UU.** [F4] | Google |
| RevenueCat | EE. UU. No se puede elegir [R4] | Todos sus subencargados están en EE. UU. Ofrece cláusulas de la UE [R4] |
| Correo (Resend o SES) | *Sin verificar* | Empresas de EE. UU. |
| Capacitor o TWA | En el dispositivo. Los documentos no salen | — |

### Argentina [L1]

**Países adecuados.** Según la Disp. DNPDP 60/2016 y la Res. AAIP 34/2019:
- la Unión Europea y el Espacio Económico Europeo;
- Reino Unido y Suiza;
- Guernsey, Jersey, la Isla de Man y las Islas Feroe;
- Canadá (solo el sector privado);
- Andorra, Nueva Zelanda y Uruguay;
- Israel (solo el tratamiento automatizado).

**EE. UU., Brasil y Singapur no están en la lista.**

**Hacia otros países** hace falta una de estas dos cosas:
- cláusulas modelo: las de la Disp. 60/2016, para cesión y para prestación de servicios, o las de la Res. 198/2023, de la Red Iberoamericana;
- consentimiento expreso de los titulares de los datos.

**Contratos distintos de los modelos:** hay que pedir que la AAIP los apruebe **dentro de los 30 días corridos desde la firma**. La propia página de la AAIP usa como ejemplo contratar almacenamiento en la nube de una empresa de EE. UU.

**Consecuencia:** Supabase y RevenueCat ofrecen las cláusulas de la UE, no los modelos de la AAIP. **Legal tiene que definir** si alcanza con el consentimiento, si hay que presentar esos contratos o si hay otra salida.

### Brasil [L2][L3]

- La **Res. CD/ANPD 32/2026** (26/01/2026) reconoce a la UE y al Espacio Económico Europeo como adecuados. No hay otros países reconocidos.
- Para el resto rigen las cláusulas estándar de la **Res. CD/ANPD 19/2024**, que se adoptan sin cambios. Todavía no se reconocieron cláusulas equivalentes.

### Unión Europea [L4]

Según las Directrices 3/2018 del CEPD, un responsable de fuera de la UE **no queda sujeto al RGPD solo por usar un encargado en la UE**. Sí quedaría sujeto si se dirige a público de la UE, cosa que T07 posterga.

### Qué implica cada región para la base principal

| Región | Para Argentina | Para Brasil | Latencia |
|---|---|---|---|
| **UE** (Irlanda, París, Fráncfort o Estocolmo) | Adecuada | Adecuada | Mayor (*sin medir*) |
| **São Paulo** | No adecuada: hacen falta cláusulas o consentimiento | Los datos quedan en el país | La menor para AR y BR (*sin medir*) |
| **Canadá** | Adecuada | No adecuada | *Sin medir* |
| **EE. UU.** | No adecuada | No adecuada | *Sin medir* |

**En todas las regiones** quedan transferencias a EE. UU. o Singapur: el soporte de Supabase, el correo y RevenueCat.

### Datos mínimos

| Dónde | Qué se guarda |
|---|---|
| Servidor | Correo, nombre de usuario, hash de la contraseña, contenido publicado, plan y suscripción, denuncias y bloqueos. **Fecha de nacimiento**, solo de quien entra al Reading Club (D09). Que alcance con guardar si es mayor de 16 lo decide Legal |
| RevenueCat | Solo el UUID de la cuenta, sin correo, y el historial de compras, que su SDK recoge sin opción de apagarlo [R5] |
| Registros del servidor | Direcciones IP, durante 7 días en Pro [S1] |
| Copias | Lo borrado puede seguir en ellas **hasta 7 días** [S9]. La política de privacidad tiene que decirlo |

## 4. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Supabase: una regla por fila mal escrita | Pruebas automáticas de cada regla y `revoke` de las columnas sensibles (`plan`, `likes`). La clave de servicio vive solo en las funciones |
| Supabase: abuso y spam | Límites de fábrica: 30 altas o ingresos cada 5 minutos por IP, configurables [S7]. Bloqueo de contraseñas filtradas en Pro [S8]. Para altas masivas, CAPTCHA (*sin verificar* en esta revisión) |
| Firebase: gasto sin tope | Solo hay alertas, y un corte que hay que programar aparte [F7] |
| Capacitor: versiones viejas de la app en circulación | Cambios compatibles hacia atrás en el servidor y aviso de actualización |
| Capacitor: un *service worker* dentro de la app que sirva archivos viejos | Desactivarlo en la compilación de Android |
| TWA: la huella de firma no coincide después de la firma de apps de Play | Aparece la barra del navegador [T3]. Hay que actualizar `assetlinks.json` |
| RevenueCat: deja de avisar después de 5 reintentos [R2] | Conciliación diaria. Si RevenueCat se cae, la app sigue mostrando el plan guardado en Supabase y no quita premium |
| Directo: compra sin acuse en 3 días | Google la reembolsa sola [G4]. El acuse lo hace el servidor, con reintentos |

## 5. Arquitectura propuesta: Supabase y RevenueCat

**Servidor y sesión**
- La app, en la web y en Android, usa `supabase-js` con la URL y la clave **públicas**, y el servidor aplica las reglas por fila.
- La tabla `subscriptions` guarda:
  - `user_id`, la tienda y el producto;
  - el token de compra o el identificador de la transacción original;
  - el estado y el vencimiento.
- Los usuarios no tienen permiso de escritura sobre ella. `profiles.plan` se deriva de esa tabla.

**Cobros**
- **Función `revenuecat-webhook`:**
  1. comprueba la cabecera de autorización;
  2. consulta el estado con `GET /subscribers` [R2];
  3. actualiza la tabla y el plan, sin duplicar si el mismo aviso llega dos veces.
- **Conciliación diaria:** una tarea programada revisa las suscripciones activas o vencidas hace poco.
- **Restaurar:** RevenueCat restaura la compra, avisa con el webhook y el servidor cambia el plan.
- **Gestionar:** un enlace a las suscripciones de Play.

**Secretos.** Se guardan solo como variables de las funciones de Supabase, nunca en el repositorio. En `.env.example` van solo los nombres. Son:
- la clave de servicio de Supabase;
- el secreto del webhook;
- la clave REST de RevenueCat.

La credencial de la cuenta de servicio de Google se carga en RevenueCat.

**Recuperar la contraseña en Android.** El enlace del correo abre la página web del dominio propio, ahí se cambia la contraseña y después se ingresa en la app. Así no hacen falta enlaces profundos. Usar un código en lugar del enlace está *sin verificar* en la documentación de Supabase.

**Web**
- Lo comprado en Android vale también en la web, porque el plan vive en el servidor.
- Vender en la web es otra decisión, fuera de este alcance. Stripe no admite cuentas argentinas, según fuentes secundarias de `investigacion.md`.

## 6. Salida de cada proveedor

| Proveedor | Cómo se sale |
|---|---|
| Supabase | Volcado de Postgres, que incluye las cuentas, y paso a un servidor propio con la instalación oficial en Docker [S12] o a otro Postgres. Después de terminar el contrato, se puede pedir una copia durante 30 días [S4] |
| Firebase | Exportar Firestore en su formato y las cuentas con `auth:export` (hash SCRYPT modificado) [F8]. Hay que rehacer las reglas y las funciones |
| RevenueCat | Se implementa la opción directa (12 a 20 días) con los tokens guardados. Las suscripciones siguen en Google. El proceso de migración que ofrece RevenueCat está *sin verificar* |
| Capacitor o TWA | Se puede cambiar de envoltorio manteniendo el nombre del paquete y la clave de firma: es la regla general de Android (a confirmar con Requisitos). El nombre del paquete es permanente [G9]. Desde 2026, Play vincula el paquete con sus claves de firma; el plazo de registro fue el 30/09/2026 [G10]. **Requisitos debería revisar cómo afecta a una app nueva** |

## 7. Lo que no se pudo verificar

- **Latencias:** desde Argentina y Brasil hacia la UE y São Paulo. Se miden en la etapa 1.
- **Precios y planes:**
  - el precio de Firestore fuera de Iowa;
  - si los precios de Supabase cambian por región (sus tablas muestran un solo precio);
  - si el crédito de cómputo de Supabase cubre instancias mayores que Micro;
  - el tamaño de servidor que necesita Supabase autoalojado.
- **RevenueCat:**
  - cómo cuenta los planes anuales en la facturación mensual;
  - si acepta compras hechas desde una TWA, mandándole los tokens por su API REST.
- **Google:**
  - si la API de Google Play Developer es gratuita;
  - si Pub/Sub exige tener la facturación habilitada.
- **TWA:** si sus datos se borran al limpiar los datos de Chrome.
- **Supabase:** si la recuperación de la contraseña puede hacerse con un código en lugar del enlace.
- **Correo:** dónde guardan los datos los proveedores.
- **Apple:** la postura sobre apps hechas con Capacitor frente a la pauta 4.2. No hay una pauta específica, y la revisión es caso por caso.
- **Días de trabajo:** todos son estimaciones propias.

## 8. Fuentes

Todas se consultaron el 22/10/2026.

**Supabase**
- [S1] Precios: https://supabase.com/pricing
- [S2] Regiones: https://supabase.com/docs/guides/platform/regions
- [S3] Cambiar la región: https://supabase.com/docs/guides/troubleshooting/change-project-region-eWJo5Z
- [S4] Contrato de tratamiento de datos, versión 1 del 01/08/2026: https://supabase.com/legal/customer-resources/data-processing-addendum
- [S5] Subencargados (12/10/2026): https://supabase.com/legal/subprocessor-list/October-12-2026.pdf
- [S6] Correo (SMTP): https://supabase.com/docs/guides/auth/auth-smtp
- [S7] Límites de autenticación: https://supabase.com/docs/guides/auth/rate-limits
- [S8] Seguridad de las contraseñas: https://supabase.com/docs/guides/auth/password-security
- [S9] Copias de seguridad: https://supabase.com/docs/guides/platform/backups
- [S10] Precios de las funciones: https://supabase.com/docs/guides/functions/pricing
- [S11] Tope de gasto: https://supabase.com/docs/guides/platform/cost-control
- [S12] Autoalojamiento: https://supabase.com/docs/guides/self-hosting

**Firebase**
- [F1] Precios: https://firebase.google.com/pricing
- [F2] Precios de Firestore: https://cloud.google.com/firestore/pricing
- [F3] Ubicaciones de Firestore: https://firebase.google.com/docs/firestore/locations
- [F4] Privacidad («The Firebase Authentication service is run only from US data centers»): https://firebase.google.com/support/privacy
- [F5] Límites de Authentication: https://firebase.google.com/docs/auth/limits
- [F6] Búsqueda de texto (edición Enterprise): https://firebase.google.com/docs/firestore/solutions/search
- [F7] Topes de gasto: https://firebase.google.com/docs/projects/billing/spend-caps y preguntas frecuentes: https://firebase.google.com/support/faq
- [F8] Exportar e importar cuentas: https://firebase.google.com/docs/cli/auth

**Correo y servidores**
- [H1] Hetzner Cloud: https://www.hetzner.com/cloud/
- [E1] Resend: https://resend.com/pricing
- [E2] Amazon SES: https://aws.amazon.com/ses/pricing/

**Capacitor**
- [C2] Nivel de API por versión: https://capacitorjs.com/docs/android/setting-target-sdk
- [C3] Migrar a Capacitor 8: https://capacitorjs.com/docs/updating/8-0 (y https://capacitorjs.com/docs/android)
- [C4] Registro de npm (versión, fecha y licencia):
  - `@capacitor/android` 8.5.3, 07/10/2026, MIT;
  - `@bubblewrap/cli` 1.27.0, 09/10/2026, Apache-2.0;
  - `@revenuecat/purchases-capacitor` 13.7.5, 22/10/2026, MIT;
  - `capacitor-plugin-cdv-purchase` 13.19.1, 14/10/2026, MIT. Su gemelo `cordova-plugin-purchase` 13.19.1 declara `com.android.billingclient:billing:9.0.0`.
  - https://registry.npmjs.org/

**TWA**
- [T1] Introducción (actualizada el 04/02/2020): https://developer.chrome.com/docs/android/trusted-web-activity/
- [T2] Inicio rápido, con `assetlinks.json` en `.well-known` (actualizada el 28/08/2019): https://developer.chrome.com/docs/android/trusted-web-activity/quick-start
- [T3] PWABuilder: usa Bubblewrap, `assetlinks.json` va en la raíz del dominio y se puede caer a Custom Tabs o WebView: https://docs.pwabuilder.com/#/builder/android
- [T4] Cobro con Play en una TWA (Chrome 101 o posterior; actualizada el 15/10/2026): https://developer.chrome.com/docs/android/trusted-web-activity/receive-payments-play-billing
- [T5] Plantilla de Bubblewrap 1.27.0 con `compileSdkVersion 36` y `targetSdkVersion 36` (paquete npm `@bubblewrap/core`). Su módulo de cobro, `androidbrowserhelper:billing:1.2.0`, usa la biblioteca de cobros 8.3.0: https://dl.google.com/dl/android/maven2/com/google/androidbrowserhelper/billing/1.2.0/billing-1.2.0.pom

**RevenueCat**
- [R1] Precios: https://www.revenuecat.com/pricing/ (preguntas frecuentes en https://www.revenuecat.com/pricing.md)
- [R2] Webhooks: https://www.revenuecat.com/docs/integrations/webhooks
- [R3] Avisos de Google: https://www.revenuecat.com/docs/platform-resources/server-notifications/google-server-notifications
- [R4] Contrato de tratamiento de datos, vigente desde agosto de 2026: https://www.revenuecat.com/dpa
- [R5] Seguridad de los datos en Google Play: https://www.revenuecat.com/docs/platform-resources/google-platform-resources/google-plays-data-safety
- [R6] `purchases` 10.28.1, que requiere `billing` 8.3.0: https://repo1.maven.org/maven2/com/revenuecat/purchases/purchases/10.28.1/purchases-10.28.1.module

**Google Play**
- [G1] Versiones de la biblioteca de cobros («By Aug 31, 2026, all new apps and updates to existing apps must use Billing Library version 8 or later»): https://developer.android.com/google/play/billing/deprecation-faq
- [G2] Preparar el servidor: https://developer.android.com/google/play/billing/getting-ready
- [G3] Referencia de los avisos en tiempo real: https://developer.android.com/google/play/billing/rtdn-reference
- [G4] Seguridad y acuse en 3 días: https://developer.android.com/google/play/billing/security
- [G5] Cuotas de la API de Google Play Developer: https://developers.google.com/android-publisher/quotas
- [G6] Precios de Pub/Sub: https://cloud.google.com/pubsub/pricing
- [G7] Política de spam: se prohíbe la WebView de un sitio sin permiso de su dueño: https://support.google.com/googleplay/android-developer/answer/9899034
- [G8] Funcionalidad mínima: https://support.google.com/googleplay/android-developer/answer/14983486
- [G9] El nombre del paquete es permanente: https://support.google.com/googleplay/android-developer/answer/9859152
- [G10] Registro de nombres de paquete: https://support.google.com/googleplay/android-developer/answer/16984799

**Normas**
- [L1] AAIP, transferencias internacionales: https://www.argentina.gob.ar/transferencias-internacionales
- [L2] ANPD, transferencia internacional, con la Res. 32/2026 y la Res. 19/2024: https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados
- [L3] Plazo de adopción de las cláusulas de la ANPD (fuente secundaria, estudio Lefosse): https://lefosse.com/noticias/transferencia-internacional-de-dados-prazo-para-adocao-das-clausulas-padrao-da-anpd-se-encerra-em-23-de-agosto/
- [L4] CEPD, Directrices 3/2018 sobre el ámbito territorial: https://edpb.europa.eu/sites/edpb/files/files/file1/edpb_guidelines_3_2018_territorial_scope_en.pdf

**Del repositorio:** las pautas 4.2, 3.1.1 y 5.1.1(v) de Apple, el nivel de API 36 de Play y las comisiones, en `docs/plan/investigacion.md`, verificados el 22/10/2026.
