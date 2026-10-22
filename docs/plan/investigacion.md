# Datos verificados: tiendas, cobros y normas

Verificados el 22 de octubre de 2026. Las reglas cambian seguido: antes de actuar sobre un dato, volvé a mirar la fuente, sobre todo si pasaron más de tres meses. Lo que viene de fuentes secundarias está marcado.

## Google Play

**La cuenta**
- **Costo:** USD 25, una sola vez. Hay que ser mayor de 18 y presentar documento y tarjeta a nombre propio. Las cuentas personales nuevas además verifican un dispositivo Android con la app Play Console. [Fuente](https://support.google.com/googleplay/android-developer/answer/6112435)
- **Cuenta personal:** Google muestra el nombre legal, el país y el correo de desarrollador. *«If you decide to monetize on Google Play then Google will display your full address»* (si monetizás, también la dirección completa). [Fuente](https://support.google.com/googleplay/android-developer/answer/13628312)
- **Cuenta de organización:** exige número D-U-N-S y muestra nombre, dirección, correo y teléfono.

**Prueba antes de publicar**
- Las cuentas personales creadas después del 13/11/2023 hacen una **prueba cerrada con al menos 12 personas, que permanezcan inscriptas 14 días seguidos**.
- Después se pide el acceso a producción, contando cómo fue la prueba. La revisión suele tardar 7 días o menos.
- Si la app pide iniciar sesión, hay que dar credenciales de prueba. [Fuente](https://support.google.com/googleplay/android-developer/answer/14151465)

**Nivel de API.** Desde el 31/08/2026, las apps nuevas y las actualizaciones deben apuntar a Android 16 (API 36). Se puede pedir prórroga hasta el 1/11/2026. Sube todos los años. [Fuente](https://support.google.com/googleplay/android-developer/answer/11926878)

**Privacidad**
- Política de privacidad obligatoria, enlazada en la consola **y dentro de la app**, aunque no se recopilen datos sensibles.
- Formulario de Seguridad de los datos, coherente con la política. [Fuente](https://support.google.com/googleplay/android-developer/answer/10144311)

**Borrado de cuenta.** Un camino dentro de la app y además un enlace web para pedirlo sin abrir la app. Se borran también los datos asociados. [Fuente](https://support.google.com/googleplay/android-developer/answer/13327111)

**Contenido generado por usuarios**
- Aceptar los términos antes de publicar.
- Definir y prohibir el contenido objetable.
- Poder denunciar contenido y bloquear usuarios.
- Moderar y actuar. [Fuente](https://support.google.com/googleplay/android-developer/answer/9876937)

**Público y clasificación**
- Los grupos de edad son 13-15, 16-17 y 18+.
- El grupo de 16-17 puede considerarse de menores en algunos países. [Fuente](https://support.google.com/googleplay/android-developer/answer/9867159)

**Política de pagos**
- Lo digital se vende con la facturación de Google Play.
- No se puede dirigir a pagar afuera, salvo programas en EE. UU. y la Unión Europea.
- Una app puede ser «solo de consumo» si no vende nada dentro de ella. [Fuente](https://support.google.com/googleplay/android-developer/answer/10281818)

**Comisiones**
- **Suscripciones:** 15%, sin importar la facturación.
- **Otras compras:** 15% sobre el primer millón de dólares anual (hay que inscribirse en ese nivel) y 30% por encima.
- **EE. UU., Unión Europea y Reino Unido:** desde el 30/06/2026 rige otra estructura (suscripciones: 10% más 5% de cargo de facturación). [Fuente](https://support.google.com/googleplay/android-developer/answer/112622)

**Cobro**
- Google liquida por mes calendario y paga cerca del día 15 del mes siguiente. [Fuente](https://support.google.com/googleplay/android-developer/answer/137997)
- A Argentina paga por transferencia desde EE. UU., en dólares, con un mínimo de USD 100.
- El banco puede pedir documentación (Comunicación «A» 6037) y una factura según las normas impositivas argentinas. [Fuente](https://support.google.com/googleplay/android-developer/answer/2700656)

**App web en Android (TWA).** Puede cobrar con Google Play mediante la Digital Goods API. Hay reportes de fallos en algunos dispositivos. [Fuente](https://developer.chrome.com/docs/android/trusted-web-activity/billing)

## App Store (para más adelante)

**La cuenta**
- USD 99 por año.
- Como persona humana, el nombre propio figura como vendedor.
- Una organización necesita D-U-N-S, ser persona jurídica (no se aceptan nombres de fantasía) y un sitio web en funcionamiento con dominio propio. [Fuente](https://developer.apple.com/programs/enroll/)

**Pautas** ([fuente](https://developer.apple.com/app-store/review/guidelines/))
- **4.2:** *«Your app should include features, content, and UI that elevate it beyond a repackaged website»* (la app debe elevarse por encima de un sitio web reempaquetado).
- **5.1.1(v):** borrado de cuenta dentro de la app.
- **1.2:** filtro de contenido, denuncias con respuesta a tiempo, bloqueo de usuarios y datos de contacto publicados.
- **3.1.1:** compras dentro de la app para desbloquear funciones.
- **3.1.2(c):** describir con claridad qué incluye la suscripción.
- **3.1.3(b):** lo comprado en otras plataformas se puede reconocer, siempre que también se ofrezca como compra dentro de la app.

**Comisiones**
- 30% estándar.
- 15% con el Programa para Pequeñas Empresas (menos de un millón de dólares; hay que inscribirse). [Fuente](https://developer.apple.com/app-store/small-business-program/)
- 15% para suscripciones después del primer año.

**Herramientas.** Desde el 28/04/2026 se compila con Xcode 26 y el SDK de iOS 26. Hace falta una Mac. [Fuente](https://developer.apple.com/news/upcoming-requirements/?id=04282026a)

**Edad.** Clasificaciones nuevas de 13+, 16+ y 18+. [Fuente](https://developer.apple.com/news/upcoming-requirements/?id=07242025a)

**Cobro.** Paga dentro de los 45 días posteriores al cierre de su mes contable. Exige el contrato de apps pagas, datos bancarios y documentación impositiva. [Fuente](https://developer.apple.com/help/app-store-connect/getting-paid/overview-of-receiving-payments/)

**Unión Europea (DSA).** Hay que declararse comerciante, y Apple publica dirección o casilla postal, teléfono y correo. [Fuente](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/)

## Argentina

**Cambios**
- Comunicación «A» 8481 del BCRA (septiembre de 2026): las personas humanas que exportan servicios pueden acreditar los dólares en una cuenta propia en dólares, en un banco local, sin venderlos.
- Se eliminó el tope anual de USD 36.000.
- Fuente secundaria: estudio Allende & Brea. [Fuente](https://allende.com/bancario/el-bcra-flexibiliza-el-cobro-de-exportaciones-de-servicios-y-ajusta-reglas-de-acceso-al-mercado-de-cambios-09-15-2026/)

**Impuestos**
- Lo cobrado a las tiendas es exportación de servicios: factura E, sin IVA.
- La venta web en Argentina tiene IVA e Ingresos Brutos.
- El régimen lo define el contador (fuentes secundarias).

**Estados Unidos**
- No hay convenio de doble imposición con Argentina.
- Las dos tiendas piden el formulario W-8BEN.
- Si alguna parte de lo vendido a clientes de EE. UU. queda alcanzada por retención, se aplica la tasa general del 30%. Si alcanza o no a las ventas de apps no está confirmado. [Fuente](https://support.google.com/paymentscenter/answer/10349995)

**Consumidor**
- Para vender en la web propia, botón de arrepentimiento y botón de baja (Disposición 954/2025).
- La Disposición 3/2026 permite verificar la identidad de quien los usa.
- Diez días para arrepentirse (Ley 24.240, art. 34). [Fuente](https://noetingeryarmando.com/boton-de-baja-y-boton-de-arrepentimiento-verificacion-de-identidad-y-alcance-de-la-disposicion-3-2026/)

**Datos personales.** Ley 25.326, con inscripción declarativa de la base de datos en la AAIP, por Trámites a Distancia con clave fiscal. [Fuente](https://www.argentina.gob.ar/aaip/datospersonales/tramites)

**Contenido de terceros.** CSJN, «Rodríguez, María Belén c/ Google Inc.» (2014, Fallos 337:1174):
- la responsabilidad es subjetiva;
- no hay un deber general de vigilancia;
- se responde si, con conocimiento efectivo del contenido ilícito, no se actúa.

**Derecho de autor.** Ley 11.723, art. 10: la crítica puede citar hasta mil palabras de obras literarias. [Fuente](https://www.argentina.gob.ar/normativa/nacional/ley-11723-42755/texto)

**Menores.** Hasta los 18 años son menores de edad (Código Civil y Comercial). Para quienes tengan 16 o 17 y paguen, los términos tienen que prever el consentimiento de sus representantes.

## Otros

**Texas.** La App Store Accountability Act exige verificar la edad y el consentimiento de los padres para menores en las tiendas. Es exigible desde junio de 2026 mientras se resuelve la apelación. [Fuente](https://www.infolawgroup.com/insights/2026/7/7/supreme-court-clears-the-way-texass-app-store-accountability-act-is-now-enforceable)

**Herramientas de cobro y servidor**
- Stripe no admite cuentas argentinas (fuentes secundarias).
- Mercado Pago tiene API de suscripciones; las comisiones hay que confirmarlas con Mercado Pago. [Fuente](https://www.mercadopago.com.ar/developers/es/reference/online-payments/subscriptions/create-preapproval/post)
- RevenueCat es gratis hasta USD 2.500 de facturación mensual y después cobra 1% (fuentes secundarias).
- Supabase es gratuito al empezar y su plan Pro cuesta USD 25 por mes más el consumo (fuentes secundarias).
