# Servidor, empaquetado y cobros: comparación y propuesta (T02, T03 y T04)

Preparó: Servidor, pagos y seguridad, el 22/10/2026. Es una **propuesta**: decide el titular.

- Las fuentes oficiales se consultaron el 22/10/2026. Los códigos entre corchetes ([S1], [R2]…) remiten a la lista del [anexo](anexo-comparativo.md#8-fuentes), que también trae el detalle de los cálculos.
- Lo marcado como *sin verificar* no se pudo confirmar en una fuente oficial.
- Costos en USD por mes, sin impuestos.
- Escenarios: 300, 1.000 y 10.000 usuarios activos por mes. Los días de trabajo son una estimación propia.

## En una línea

**T02: Supabase** (región en la Unión Europea, a confirmar con Legal). **T03: Capacitor 8.** **T04: RevenueCat**, con el plan premium guardado y decidido en nuestro servidor. Las tres se refuerzan entre sí: el mismo código sirve después para el iPhone.

## T02. Servidor

| | **Supabase** | **Firebase** | **Supabase autoalojado** (servidor propio en la UE) |
|---|---|---|---|
| Costo: 300 / 1.000 / 10.000 | 25 / 25 / 25 a 50. Plan Pro desde la producción, más el correo: de 0 a 20 [S1][E1] | ≈0 / ≈0 / ≈0 a 15. Plan Blaze, obligatorio para Cloud Functions [F1][F2] | Desde € 6 más copias, correo y horas de operación [H1] |
| Esfuerzo | **12 a 18 días.** Reutiliza el esquema y las reglas de `docs/backend.md`. Mantenimiento bajo | **20 a 30 días.** Hay que rehacer el esquema en documentos, las reglas y la búsqueda sin tildes (la búsqueda de texto exige la edición Enterprise [F6]). Mantenimiento medio | Lo de Supabase más 3 a 5 días de infraestructura. Después, **2 a 4 horas por semana** de parches, copias y vigilancia |
| Riesgos | El correo de fábrica no sirve para producción (2 por hora [S6]). El plan gratuito se pausa y no tiene copias [S1]. Una regla por fila mal escrita expone datos, así que las pruebas son obligatorias | Firestore no tiene tope de gasto: solo alertas [F7]. Si una consulta está mal hecha, se paga por cada lectura | Una sola persona a cargo de la seguridad y la disponibilidad, sin acuerdo de servicio |
| Dónde quedan los datos | La región se elige al crear el proyecto y no se cambia sin migrar [S2][S3]. Hay 17 regiones, entre ellas São Paulo, Canadá y 4 en la UE. Según el contrato de tratamiento, los datos quedan «principalmente» en esa región; la contraparte es de Singapur y hay subencargados en EE. UU. [S4][S5] | Firestore permite elegir la región, que después es fija [F3]. Pero **Authentication funciona solo en EE. UU.** [F4]: las cuentas quedan siempre allí | En el país del servidor (Alemania o Finlandia). No interviene un encargado de EE. UU., salvo el del correo |
| Dependencia y salida | **Baja a media.** Es Postgres estándar y se puede autoalojar con Docker [S12] | **Alta.** El modelo y las reglas son propios de Firebase. Las cuentas se exportan con un hash SCRYPT modificado [F8] | Mínima |
| Tiendas | Cumple el borrado de cuenta (Play; Apple 5.1.1(v)) y la moderación. Se declaran los datos de cuentas y contenido en «Seguridad de los datos» | Igual | Igual |
| Encaje | **Directo.** Postgres con reglas por fila, `unaccent` y `pg_trgm`, contadores con disparadores. La fecha de nacimiento nueva del contrato (`setBirthDate`) se resuelve con una función que la carga una sola vez y una regla de 16 años o más en el club. Un mismo servidor para la web y Android | Pierde el esquema de referencia. A favor: Firestore guarda caché sin conexión | Igual que Supabase |

**Propuesta para T02: Supabase.**
- **Desarrollo:** plan gratuito. **Producción:** Pro, desde antes de la prueba cerrada. El Pro suma copias diarias por 7 días [S9], tope de gasto [S11] y bloqueo de contraseñas filtradas [S8].
- **Correo:** un proveedor SMTP. Para empezar alcanza el plan gratuito de Resend (100 por día).
- **Región:** propongo **una de la UE** (Fráncfort, París, Irlanda o Estocolmo). Es la única ubicación que es adecuada a la vez para Argentina (Disp. 60/2016 [L1]) y para Brasil (Res. ANPD 32/2026 [L2]). Alojar ahí no somete al titular al RGPD por ese solo hecho [L4].
- **Alternativa:** São Paulo, con menor latencia y cláusulas para los datos argentinos.
- **Queda igual en cualquier región:** hay transferencias a EE. UU. (soporte de Supabase, correo y RevenueCat). Necesitan cláusulas modelo o consentimiento expreso. Además, la AAIP pide aprobar en 30 días los contratos que difieren de sus modelos [L1]. **Esto lo resuelve Legal antes de elegir la región.**

## T03. Empaquetado para Android

| | **Capacitor 8** | **TWA** (Bubblewrap o PWABuilder) |
|---|---|---|
| Costo | 0 en los tres escenarios, porque es código abierto (MIT) [C4] | 0 en los tres escenarios (Apache-2.0) [C4] |
| Esfuerzo | **6 a 10 días:** proyecto Android, barras del sistema (Capacitor 8 apunta a API 36 y quitó el ajuste automático de márgenes [C3]), botón atrás, compilación sin *service worker*, sin panel de desarrollo y sin cobro web. Una actualización mayor por año para seguir el nivel de API exigido [C2]. Cada cambio sale por Play | **3 a 5 días**, más **4 a 6** para cobrar con la Digital Goods API [T4]. Los cambios de la web llegan solos |
| Riesgos | Dos versiones conviven (la web y la app): el servidor tiene que tolerar versiones viejas de la app | El cobro depende de Chrome 101 o posterior dentro de la TWA [T4]. Sin Chrome, la app cae a Custom Tabs o WebView [T3], y ahí no hay cobro: la Digital Goods API se documenta solo para la TWA. Ya hay reportes de fallos (`investigacion.md`). Todo lo que haya en la web se ve en la app: un cobro web o el panel `?dev=1` |
| Datos | No pasan por un servidor. Los documentos quedan en el almacenamiento privado de la app | No pasan por un servidor. Los documentos quedan en el almacenamiento de Chrome (si se borran al limpiar Chrome: *sin verificar*) |
| Requisitos previos | Ninguno | **Dominio propio:** `assetlinks.json` tiene que estar en la raíz del dominio [T2][T3], y hoy la app está en una subcarpeta de GitHub Pages |
| Tiendas | Play: API 36 ✔ [C2]. Play permite mostrar en una WebView un sitio propio [G7], siempre que cumpla la funcionalidad mínima [G8]. Apple: corre en iOS. La pauta 4.2 sigue siendo un riesgo; se mitiga con funciones nativas | Play: API 36 ✔ (plantilla de Bubblewrap 1.27 [T5]) y las mismas políticas [G7][G8]. Apple: **la TWA no existe en iOS** [T1], así que el iPhone exigiría otro empaquetado |
| Encaje | Los archivos van dentro de la app, así que funciona sin conexión desde la primera apertura. Usa la misma compilación de Vite | Reutiliza la PWA tal cual. La primera apertura necesita conexión |

**Propuesta para T03: Capacitor 8.**
- El cobro es nativo y robusto, y sirve igual para el iPhone.
- Funciona sin conexión desde la instalación.
- El cobro web y el panel de desarrollo quedan fuera de la app con una variable de compilación.
- La TWA es más barata de mantener, pero ata el cobro a Chrome y no sirve para Apple.

## T04. Cobros

| | **RevenueCat** | **Google Play Billing directo** |
|---|---|---|
| Costo: 300 / 1.000 / 10.000 | **0 / 0 / 0** con el supuesto de 3 % de conversión a USD 3, que da USD 27, 90 y 900 de facturación. Es gratis hasta USD 2.500 de facturación bruta mensual y después cobra 1 % [R1] | 0. Pub/Sub da 10 GiB gratis por mes [G6]. La API de Play no publica precio (cuota: 3.000 consultas por minuto [G5]) |
| Esfuerzo | **4 a 7 días:** SDK para Capacitor, webhook a Supabase, restauración, enlace para gestionar la suscripción y pruebas. El iPhone después es configuración | **12 a 20 días:** validación, acuse en 3 días o hay reembolso [G4], notificaciones por Pub/Sub con 18 tipos [G3], reembolsos, conciliación. El iPhone después suma **8 a 12 días** |
| Mantenimiento | Bajo: actualizar el SDK cuando Play exige una versión nueva de la biblioteca de cobros [G1] | Medio a alto: cambios anuales de la biblioteca de cobros [G1] y de la API |
| Riesgos | Un tercero queda en el camino del cobro: después de 5 reintentos deja de avisar [R2], así que hace falta una conciliación diaria. Puede cambiar sus condiciones | Un error en los estados (gracia, suspensión, pausa, cambio de plan) da o quita premium por error |
| Dónde quedan los datos | En **EE. UU.**: todos sus subencargados lo están [R4]. Se minimiza con un identificador opaco (el UUID de la cuenta), sin correo. El SDK recoge el historial de compras [R5] | En nuestra base (la región elegida) y en Google |
| Dependencia y salida | **Media.** Salir implica construir la opción directa. Los tokens de Google siguen siendo válidos si los guardamos desde el primer día | Ninguna, más allá de Google |
| Tiendas | Play exige la biblioteca de cobros 8 o posterior desde el 31/08/2026 [G1]; RevenueCat usa la 8.3.0 [R6] ✔. Apple: el mismo SDK, con la pauta 3.1.1 | ✔ con `capacitor-plugin-cdv-purchase`, que trae la biblioteca 9.0.0 [C4]. Apple: StoreKit y App Store Server API aparte |
| Encaje | Tiene plugin oficial de Capacitor [C4]. El webhook llega a una función de Supabase, que cambia `plan`: el plan lo cambia solo el servidor | Igual, pero toda la lógica es nuestra |

**Propuesta para T04: RevenueCat**, con nuestro servidor como fuente de verdad:
- una tabla de suscripciones en Supabase, que solo modifica la función que recibe el webhook autenticado y que confirma el estado con la API de RevenueCat;
- el token de compra de Google guardado, para no depender de RevenueCat si hubiera que salir;
- revisar la elección si la facturación pasa de USD 2.500 por mes o si cambian sus condiciones.

T03 y T04 van juntos: si se eligiera TWA, el cobro sería directo con la Digital Goods API.

## Plan por etapas

| Etapa | Qué hace el equipo | Qué crea o contrata el titular | Depende de |
|---|---|---|---|
| **0. Decidir** | — | Decide T02 (y la región), T03, T04 y el proveedor de correo | Esta conversación |
| **1. Servidor en desarrollo** (unas 3 semanas) | Esquema con reglas por fila y pruebas contra Supabase local (no hace falta cuenta). Escribe `remoteBackend.ts`, el borrado de cuenta, la moderación y la migración de los datos locales (P11). Mide la latencia desde Argentina a la UE y a São Paulo | Cuenta gratuita de Supabase y 2 proyectos de prueba, uno en la UE y otro en São Paulo, para medir. Comparte solo la URL y la clave pública | T02 |
| **2. Empaquetado** (en paralelo, unas 2 semanas) | Capacitor 8, compilación sin *service worker* ni panel, prueba interna | Cuenta de Play (P21). Crea la app y elige el **nombre del paquete, que es permanente** [G9]. La clave de subida queda fuera del repositorio, con copia, y se activa la firma de apps de Play | T03, P21, T01 |
| **3. Servidor en producción** | Migraciones, autenticación (confirmación de correo, límites, plantillas en es, en y pt), página web de borrado y prueba de restaurar una copia | **Dominio** (P12) y DNS del correo (SPF y DKIM). Cuenta del proveedor de correo. **Supabase Pro (USD 25 por mes)** con tope de gasto. Proyecto de producción en la región elegida, que no se cambia después. Legal: política de privacidad y AAIP (P16) | 1, T01, región |
| **4. Prueba cerrada** (14 días, no se acortan) | Publica la versión con cuentas reales y la sigue actualizando | 12 personas o más (P15) y credenciales de prueba para la revisión | 2 y 3 |
| **5. Cobros** (durante la prueba) | SDK de RevenueCat, función del webhook, conciliación diaria, restauración, enlace para gestionar la suscripción y pantalla de cobro (P09) | Perfil de pagos y W-8BEN (P17). Suscripciones y precios (T05). Proyecto de Google Cloud con la API de Play, una cuenta de servicio con permisos y Pub/Sub. Cuenta gratuita de RevenueCat. Testers con licencia | T04, T05, P17, 3 |
| **6. Publicación** | Revisa que «Seguridad de los datos» coincida con los proveedores. QA | Solicitud de producción | 4, 5, P04, P14 |
| **7. iPhone** (después) | Capacitor iOS y RevenueCat para el App Store | Mac, cuenta de Apple (USD 99 por año) y clave de App Store Connect | 6 |

**Lo que el titular necesita decidir ahora:** T02, T03, T04, la región (después de escuchar a Legal) y el proveedor de correo. **Para Legal:** el mecanismo de transferencia hacia EE. UU. y Singapur (AAIP y ANPD). Está detallado en el anexo, sección 3.
