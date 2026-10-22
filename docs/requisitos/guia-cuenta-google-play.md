# Guía: crear la cuenta personal de Google Play y pasar la prueba cerrada

**Para:** el titular. **Preparó:** Requisitos de tiendas (tarea P23). **Estado:** borrador para revisión.

**Fecha de consulta de todas las fuentes:** 22/10/2026. Google cambia estas reglas seguido. Si pasaron más de tres meses, volvé a mirar las fuentes antes de actuar.

**Cómo leer esta guía**
- «[fuente]» enlaza a la página oficial de Google de donde sale el dato. La lista completa está al final.
- **Recomendación del equipo:** es un consejo nuestro, no una regla de Google.
- **Sin fuente oficial:** no lo encontramos en una página oficial. No lo tomes como regla.
- Los nombres de menús y botones salen de la ayuda en español (es-419). En la pantalla pueden variar un poco. Las páginas de ayuda enlazadas están en inglés: para leerlas en español, cambiá `hl=en` por `hl=es-419` en la dirección. Las traducciones a veces se actualizan después. Si las dos versiones difieren, conviene mirar la versión en inglés (recomendación del equipo).

---

## Resumen

1. **Cuenta personal**, como decidiste en D03. Cuesta **USD 25, una sola vez**, y hay que tener 18 años o más ([fuente][alta]).
2. Tu **nombre legal y tu domicilio** tienen que coincidir **exactamente** con tu documento y con un comprobante de domicilio **de los últimos 90 días** ([fuente][docsar]). **Si la información resulta inválida, Google no devuelve los USD 25** ([fuente][alta]).
3. **Qué se ve en público:**
   - siempre: el nombre de desarrollador, tu nombre legal, tu país y el correo de desarrollador;
   - **si cobrás, también tu dirección completa** ([fuente][datos]).
4. **Verificaciones:** identidad, un celular o tableta Android (con la app Play Console), correo y teléfono ([fuente][identidad], [fuente][dispositivo]).
5. **Para cobrar** hacen falta tres cosas:
   - el perfil de pagos como comerciante;
   - una cuenta bancaria que reciba transferencias del exterior en dólares (mínimo USD 100 por pago);
   - el formulario W-8BEN, que conviene revisar con tu contador ([fuente][transferencia], [fuente][fiscal]).
6. **Antes de publicar**, la cuenta personal nueva tiene que pasar la **prueba cerrada**:
   - al menos **12 personas** inscriptas durante **14 días seguidos**;
   - después, la **solicitud de acceso a producción**, cuya revisión suele tardar 7 días o menos ([fuente][prueba]).
7. **Cuidado:** si en un año la cuenta no envía ninguna app a revisión, Google la cierra y **no devuelve el pago** ([fuente][inactivas]).

---

## 1. Antes de empezar: qué tener a mano

| Qué | Detalle | Fuente |
|---|---|---|
| Cuenta de Google | Una cuenta dedicada a Play Console, con verificación en dos pasos | [proteger], [2pasos] |
| Documento de identidad | DNI, pasaporte, licencia de conducir o residencia argentinos, vigentes | [docsar] |
| Comprobante de domicilio | A tu nombre, emitido en los últimos 90 días e idéntico al domicilio que cargues | [docsar] |
| Tarjeta | De crédito o débito a tu nombre. No se aceptan prepagas | [alta] |
| Domicilio | Va a ser **público** si cobrás | [datos] |
| Correo y teléfono | De contacto (privados) y de desarrollador (público) | [contacto] |
| Dispositivo Android | Físico, con Android 10 o superior y sin permisos de administrador («root») | [dispositivo] |
| Acuerdo de distribución | Leelo antes de aceptarlo | [acuerdo] |

### 1.1 Cuenta de Google

- **Recomendación del equipo:** creá una cuenta de Google **nueva y exclusiva** para Play Console. Que no sea la cuenta personal de todos los días ni la del estudio. Google sugiere separar la cuenta de desarrollador de la cuenta personal, para que si una se ve comprometida no afecte a la otra ([fuente][proteger]).
- **Activá la verificación en dos pasos** antes del alta:
  - Google la recomienda para todas las cuentas con acceso a Play Console ([fuente][proteger]).
  - En 2021 anunció que sería obligatoria para los propietarios de cuentas nuevas ([fuente][blog2fa]).
  - Cómo activarla: [Cómo activar la Verificación en 2 pasos][2pasos]. Guardá los códigos de respaldo en un lugar seguro, fuera de la computadora.
- Esta cuenta va a ser la **propietaria** de la cuenta de desarrollador. Es la misma con la que después entrás a la app Play Console en el celular para verificar el dispositivo ([fuente][dispositivo]).
- **No compartas la contraseña.** Si alguien del equipo necesita entrar, se lo agrega como usuario con su propio correo ([fuente][proteger]).

### 1.2 Documento de identidad

- Para personas en Argentina, Google pide un **documento oficial argentino con foto**: pasaporte, documento nacional de identidad, licencia de conducir o permiso de residencia ([fuente][docsar]).
- Condiciones de la imagen ([fuente][docsar]):
  - documento vigente;
  - foto en color, nítida y bien iluminada;
  - no puede ser una fotocopia.
- Tu nombre tiene que figurar **igual** que en el perfil de pagos que vas a crear ([fuente][identidad]).

### 1.3 Comprobante de domicilio

- Documentos aceptados para Argentina ([fuente][docsar]):
  - un documento de identidad con foto que tenga el domicilio;
  - una factura de luz, agua, gas, internet o cable;
  - un resumen de seguro;
  - un resumen de tarjeta de crédito o bancario.
- Tiene que estar **a tu nombre**, con el domicilio **exactamente igual** al del perfil de pagos, y **emitido en los últimos 90 días** ([fuente][docsar]).
- **Recomendación del equipo:** tené a mano una factura o un resumen reciente, en PDF o en una foto nítida. El domicilio del DNI puede no servir si no coincide letra por letra con el que cargues o si el documento tiene más de 90 días, porque esa regla se aplica a los comprobantes de domicilio.

### 1.4 Tarjeta para los USD 25

- Es un pago **único** de USD 25 ([fuente][alta]).
- Tarjetas aceptadas ([fuente][alta]):
  - Mastercard, Visa y American Express;
  - Visa Electron (fuera de EE. UU.);
  - Discover (solo en EE. UU.).
- **No se aceptan tarjetas prepagas.** Los tipos aceptados pueden variar según el país ([fuente][alta]).
- Google puede pedir un documento y una tarjeta **a tu nombre legal** ([fuente][alta]). No uses la tarjeta de otra persona.
- **Sin fuente oficial:** el cargo es en dólares, y tu banco puede sumar recargos o percepciones propias de las compras en el exterior. Consultalo con el banco o con el contador.

### 1.5 Domicilio: aviso importante

- En una cuenta personal, Google muestra tu **nombre legal**, tu **país** (según tu domicilio legal) y tu **correo de desarrollador**. Textualmente: *«If you decide to monetize on Google Play then Google will display your full address»*, es decir, **si cobrás en Google Play, muestra tu dirección completa** ([fuente][datos]).
- El plan es cobrar suscripciones (D02), así que conviene asumir que **la dirección va a ser pública**.
- El nombre legal y el domicilio salen del perfil de pagos de Google que vincules al crear la cuenta ([fuente][datos]).
- Hay dos restricciones:
  - **no se aceptan casillas postales** ([fuente][perfilpagos]);
  - **el país del perfil no se puede cambiar**: para cambiarlo hay que crear otro perfil ([fuente][perfilid]).
- **Decisión tuya:** qué domicilio declarar, por ejemplo el particular o el profesional.
  - Condición práctica: tiene que ser un domicilio físico que puedas probar con un comprobante a tu nombre de los últimos 90 días ([fuente][docsar]).
  - Sugerimos consultarlo también con Legal, por la privacidad y por los efectos legales de ese domicilio.

### 1.6 Correos, teléfono y sitio web

| Dato | Para qué sirve | ¿Se ve en público? | Cómo se verifica |
|---|---|---|---|
| Correo de contacto | Para que Google te escriba | No | Código de 6 dígitos por correo ([fuente][identidad]) |
| Teléfono de contacto | Para que Google te llame | No | Código de 6 dígitos por SMS o llamada ([fuente][identidad]) |
| Correo de desarrollador | Para que los usuarios te escriban | **Sí**, en tu perfil de desarrollador ([fuente][contacto]) | — |
| Sitio web de desarrollador | Ver la nota de abajo | — | — |

- **Teléfono:** se carga en formato internacional, con «+» y el código de país ([fuente][identidad]): 54 para Argentina. *Dato general, no de Google:* en los celulares argentinos, el formato internacional suele llevar un 9 después del 54.
- **Correo de contacto:** Google sugiere usar uno distinto del correo con el que creás la cuenta ([fuente][contacto]).
- **Recomendación del equipo** para el correo **público** de desarrollador:
  - lo ideal es uno de soporte con el dominio propio (P12);
  - mientras no exista el dominio, servirá un correo dedicado al soporte.
- **Sitio web:** las fuentes oficiales se contradicen.
  - Una página lo incluye entre los datos obligatorios de la cuenta personal ([fuente][contacto]).
  - Otra no lo menciona ([fuente][datos]).
  - Tené una dirección lista por las dudas: la versión web publicada o, cuando exista, el dominio propio (P12).
- Si cambiás el teléfono, hay que verificarlo de nuevo ([fuente][identidad]).

### 1.7 Dispositivo Android

- Requisitos ([fuente][dispositivo]):
  - físico, no un emulador;
  - con Android 10 o superior;
  - **sin permisos de administrador** (lo que se conoce como «root»).
- La verificación tarda **menos de un minuto** ([fuente][dispositivo]).
- **No hace falta conservar el dispositivo.** Si Google pide verificar de nuevo, se puede usar otro. Un mismo dispositivo sirve para varias cuentas ([fuente][dispositivo]). *Deducción nuestra:* por eso alcanza con uno prestado. La página no lo dice con esas palabras.
- Google no usa el número de teléfono del dispositivo ([fuente][dispositivo]).

### 1.8 Acuerdo de distribución

Durante el alta vas a aceptar el **Acuerdo de Distribución para Desarrolladores de Google Play** ([fuente][alta]). La versión vigente rige desde el 15/09/2025 ([fuente][acuerdo]). Como abogado, te conviene leerlo antes. Algunas cláusulas relevantes ([fuente][acuerdo]):
- **2.1 y 11.4:** la información que cargues tiene que ser completa, exacta y verificable.
- **3.5:** los impuestos sobre las ventas a los usuarios están a tu cargo.
- **10.3:** Google puede rescindir el acuerdo con efecto inmediato, mediante notificación escrita.

---

## 2. Paso a paso de la creación

Entrá a la página de registro de Play Console, enlazada desde [Comienza a usar Play Console][alta], **con la cuenta dedicada**.

Las páginas oficiales no describen el orden exacto de las pantallas, y puede variar. Los pasos de abajo siguen un **orden práctico**:

1. tipo de cuenta;
2. nombre de desarrollador;
3. perfil de pagos;
4. acuerdo y pago;
5. identidad;
6. dispositivo;
7. correo y teléfono.

El dispositivo va antes que el teléfono porque Google exige verificar la identidad y el dispositivo **antes** de verificar el teléfono ([fuente][identidad]).

### 2.1 Tipo de cuenta

- **Qué pide:** elegir **Personal** u **Organización** ([fuente][alta]).
- **Qué conviene:** **Personal**, por la decisión D03.
  - Las dos tienen las mismas funciones, y las dos pueden cobrar mediante un perfil de pagos ([fuente][tipo]).
  - La de organización exige número D-U-N-S ([fuente][tipo]).
  - Las apps financieras, de salud, de VPN y de gobierno tienen que usar cuenta de organización ([fuente][requisitosconsola]). Knowmadic no entra en ninguna de esas categorías.
- **Si más adelante creás una sociedad**, se puede pasar de personal a organización ([fuente][perfilid]). Hace falta:
  - tener la cuenta verificada por completo;
  - verificar el sitio web de la organización;
  - un perfil de pagos de organización, que exige D-U-N-S;
  - esperar al menos 72 horas después del cambio antes de enviar apps.
- **Al revés no se puede:** una cuenta de organización no pasa a personal. Habría que crear otra cuenta ([fuente][perfilid]).
- **Qué se ve en público:** el tipo de cuenta define qué datos se muestran (ver el punto 2.8).
- **Error frecuente:** elegir «Organización» por error.

### 2.2 Nombre de desarrollador

- **Qué pide:** el nombre que aparece en Google Play debajo de tus apps.
  - Puede ser distinto de tu nombre legal y se puede cambiar cuando quieras ([fuente][datos]).
  - Cada cambio se ve en Google Play recién después de que Google lo revisa y lo aprueba ([fuente][sobreti]).
  - No puede ser idéntico al de otro desarrollador ([fuente][sobreti]).
- **Qué conviene:** depende de la decisión sobre el nombre de la app (T01). Hay dos opciones razonables:
  - tu nombre;
  - «Knowmadic», si se confirma.
- Elijas lo que elijas, **tu nombre legal se muestra igual** ([fuente][datos]).
- **Error frecuente:** usar un nombre que sugiera una relación oficial con otra empresa o marca. La política de suplantación da como ejemplo un nombre que sugiere relación con Google ([fuente][suplantacion]).
- **Qué se ve en público:** sí, el nombre de desarrollador es público.

### 2.3 Perfil de pagos (tu identidad legal)

- **Qué pide:** vincular un perfil de pagos de Google que ya tengas o crear uno nuevo ([fuente][identidad]). De ese perfil salen tu nombre legal y tu domicilio ([fuente][datos]).
- **Qué conviene:**
  - **Tipo de perfil:** **individual**. Según Google, incluye a la mayoría de quienes tienen un negocio unipersonal ([fuente][tipopagos]).
  - **País:** Argentina.
  - **Nombre legal:** exactamente como figura en tu documento, con todos los nombres y apellidos.
  - **Domicilio:** exactamente como figura en el comprobante.
- **Lo que no se puede cambiar después:** el país y el tipo de perfil (individual u organización). Para cambiarlos hay que crear otro perfil, verificarlo y vincularlo ([fuente][perfilid]).
- **Qué se ve en público:**
  - siempre, tu nombre legal y tu país;
  - si cobrás, la dirección completa ([fuente][datos]).
- **Error frecuente:** que el perfil y los documentos no coincidan. Si pasa, el perfil se puede corregir durante la tarea de verificación ([fuente][identidad], [fuente][docsar]).

### 2.4 Acuerdo y pago

- **Qué pide:** aceptar el Acuerdo de Distribución y pagar los USD 25 ([fuente][alta]).
- **Errores que hacen perder el pago:**
  - usar una tarjeta prepaga o de otra persona;
  - cargar información que después resulte inválida: *«Si se determina que esta información no es válida, no se te reembolsará la tarifa de registro»* ([fuente][alta]).

### 2.5 Verificación de identidad

- **Qué pide:**
  - en general, un documento oficial de identidad ([fuente][identidad]);
  - para Argentina, **documento con foto y comprobante de domicilio** ([fuente][docsar]). Los detalles están en los puntos 1.2 y 1.3.
- **Tiempo:** las páginas para cuentas nuevas no dan un plazo. La página para cuentas creadas **antes de septiembre de 2023** dice que la revisión «puede tardar unos días» y que avisan por correo ([fuente][verifantiguas]). Tomalo solo como referencia.
- **Qué se ve en público:** nada de los documentos. Google dice que no comparte tus datos ni tus documentos con terceros ([fuente][docsar]).
- **Mientras no esté verificada la cuenta, no podés enviar apps a revisión** ([fuente][identidad]).
- **Errores frecuentes:**
  - enviar documentos no admitidos: es *la causa principal* de las verificaciones fallidas ([fuente][docsar]);
  - un documento vencido, una fotocopia, una foto en blanco y negro o borrosa ([fuente][docsar]);
  - un comprobante de domicilio de más de 90 días, a nombre de otra persona o con un domicilio distinto del perfil ([fuente][docsar]);
  - **un documento alterado o falso: puede llevar a que eliminen la cuenta y sus apps** ([fuente][docsar]).
- Si la información no es válida, no se devuelve el pago ([fuente][alta]).

### 2.6 Verificación del dispositivo

- **Qué pide:** demostrar que tenés acceso a un dispositivo Android real ([fuente][dispositivo]).
- **Cómo se hace** ([fuente en español][dispositivo-es]):
  1. En la computadora, entrá a Play Console con la cuenta propietaria.
  2. En la página principal, buscá la tarea «Verifica que tienes acceso a un dispositivo móvil Android» y tocá **Ver detalles**.
  3. Escaneá el código QR con el celular para instalar o abrir la app Play Console.
  4. En la app, entrá con **la misma cuenta**, elegí tu cuenta de desarrollador y tocá **Verificar**.
  5. Seguí las instrucciones. Al terminar, la tarea desaparece de la página principal.
- **Tiempo:** menos de un minuto ([fuente][dispositivo]).
- **Qué se ve en público:** nada.
- **Error frecuente:** que la cuenta de desarrollador no aparezca en la app. Casi siempre es porque entraste con otra cuenta de Google ([fuente][dispositivo]).

### 2.7 Verificación de contacto (correo y teléfono)

- **Correo** ([fuente][identidad]):
  1. Escribí la dirección y tocá «verificar».
  2. Ingresá el código de 6 dígitos que llega a ese correo.
  - Si el correo de contacto ya estaba verificado en tu cuenta de Google, este paso puede saltearse.
- **Teléfono** ([fuente][identidad]):
  1. Escribí el número en formato internacional («+54…»).
  2. Elegí recibir el código por SMS o por llamada.
  3. Ingresá el código de 6 dígitos.
  - Antes hay que verificar la identidad y el dispositivo.
- **Si el código no llega** ([fuente][identidad]):
  - revisá la carpeta de correo no deseado o probá más tarde;
  - con el SMS, esperá unos minutos, probá con llamada, buscá mejor señal o intentá otro día.
- **Tené estos datos al día:** Google puede escribirte o llamarte para confirmar que la cuenta sigue activa ([fuente][contacto]).
- **Qué se ve en público:** nada. El correo y el teléfono de contacto son privados ([fuente][contacto]).

### 2.8 Resumen: qué queda público

| Dato | ¿Público? | Fuente |
|---|---|---|
| Nombre de desarrollador | Sí | [datos] |
| Nombre legal | Sí | [datos] |
| País | Sí | [datos] |
| Correo de desarrollador | Sí | [datos], [contacto] |
| Dirección completa | **Sí, si cobrás** | [datos] |
| Teléfono | Solo en algunas regiones. Google no dice cuáles en esa página | [datos] |
| Correo y teléfono de contacto | No | [contacto] |
| Datos de contacto de la ficha (correo, teléfono, sitio web) | Sí, en la página de la app | [sobreti] |
| Nombre legal del perfil de pagos (como comerciante) | Sí: lo ven los clientes y figura en los recibos | [perfilpagos] |

*Contradicción entre fuentes:*
- Una página dice que en las cuentas personales solo se muestra el correo ([fuente][actualizar]).
- La página específica sobre los datos requeridos dice que se muestran el nombre legal, el país, el correo y, si cobrás, la dirección ([fuente][datos]).

Tomamos la más completa.

### 2.9 Después del alta: cuidar la cuenta

- **Inactividad** ([fuente][inactivas]):
  - Google cierra la cuenta si tiene más de un año y nunca envió una app a revisión.
  - **No devuelve el pago.**
  - Antes avisa por correo, con 60, 30 y 7 días de anticipación.
  - Para evitarlo, Google pide dos cosas: tener verificados el correo y el teléfono, y publicar una app o una actualización. Si la app todavía no está lista para el público, sirve la prueba interna o la cerrada.
- **Datos al día:**
  - si cambia tu domicilio o tu nombre legal, hay que actualizar el perfil de pagos ([fuente][actualizar]);
  - si Google no puede verificar tus datos, puede retirar tus apps ([fuente][actualizar]).
- **Engaños por correo** ([fuente][proteger]):
  - Google Play escribe solo desde direcciones que terminan en `@google.com`;
  - nunca pide tu contraseña ni que agregues usuarios desconocidos;
  - nunca pide «verificaciones de emergencia» ni «controles de cumplimiento».
- **Registro del nombre de paquete** (verificación de desarrolladores de Android):
  - El anuncio de política del 15/07/2026 pide revisar la página principal de Play Console y registrar las apps que falten, bajo riesgo de retiro de Google Play en todo el mundo ([fuente][anuncio]).
  - Para una app nueva, la ayuda describe un paso manual: se carga el certificado público de la clave de firma ([fuente][paquetes]).
  - Lo coordina Desarrollo cuando exista el paquete de Android (P07).

### 2.10 Adelanto: al crear la app en la consola

- Elegí **«Gratis»**. Una app que se ofreció gratis no puede pasar a ser paga ([fuente][precios]). El modelo es freemium: la app se descarga gratis y el premium se cobra con suscripción (D02).
- El **Panel** guía los pasos más importantes, empezando por los datos del contenido de la app y la ficha de la tienda ([fuente][crearapp]). Las respuestas a esos formularios las preparamos en `docs/requisitos/formularios-play.md` (P14).

---

## 3. Para cobrar

### 3.1 Cuándo hace falta

- **Argentina** admite el registro como desarrollador y como comerciante, con el dólar como moneda predeterminada ([fuente][ubicaciones]).
- **Para usar la facturación de Google Play** (lo que permite cobrar las suscripciones) hay que configurar el **perfil de pagos** ([fuente][suscripciones]).
- **Recomendación del equipo:**
  - El **perfil de pagos como comerciante** conviene armarlo antes de que el equipo cree las suscripciones en la consola (fase 3, P08). Es decir, **antes de la prueba cerrada si en ella se va a probar el premium**.
  - La **cuenta bancaria** y el **W-8BEN**, antes del primer cobro. Google indica cargar la información fiscal para recibir los pagos a tiempo ([fuente][fiscal]).
  - El **alta impositiva con el contador** (P17), antes de facturar. El banco puede pedir factura ([fuente][transferencia]).

### 3.2 Perfil de pagos como comerciante

- **Dónde:** Configuración > Perfil de pagos ([fuente][perfilpagos-es]).
- **Secciones** ([fuente][perfilpagos-es]):
  - **Nombre y dirección:** no se permiten casillas postales.
  - **Contacto principal:** el correo es obligatorio y el teléfono, opcional.
  - **Información pública:**
    - sitio web;
    - categoría de productos;
    - correo de asistencia al cliente;
    - nombre que aparece en el resumen de la tarjeta de los clientes.
- **Qué se ve en público:** el nombre legal que cargues se muestra a los clientes y en los recibos ([fuente][perfilpagos-es]).
- **El país no se puede cambiar** ([fuente][perfilpagos-es]).
- **Recomendación del equipo:** que el nombre en el resumen de la tarjeta sea reconocible, por ejemplo el nombre de la app cuando se confirme (T01). Google recomienda que ayude a recordar qué se compró ([fuente][perfilpagos]).

### 3.3 Cuenta bancaria

- **Dónde:** Configuración > Configuración de pagos > Formas de pago > **Agregar forma de pago** ([fuente][banco-es]).
- **Requisitos** ([fuente][banco]):
  - la cuenta tiene que poder recibir transferencias;
  - tiene que estar en **el mismo país** que el perfil de comerciante;
  - en los países que cobran por transferencia, tiene que estar **en dólares**;
  - el nombre del titular tiene que estar **exactamente como figura en el resumen del banco**;
  - el código SWIFT-BIC tiene 8 u 11 caracteres;
  - si tu banco lo pide, hay que cargar un banco intermediario.
- **Argentina** ([fuente][transferencia]):
  - Google paga por **transferencia desde EE. UU., en dólares**;
  - el mínimo es **USD 100**;
  - si tu banco ofrece una cuenta en dólares, Google la prefiere;
  - el banco puede pedir documentación, incluso para montos chicos. La Comunicación «A» 6037 del BCRA detalla los formularios y el boleto de cambio;
  - también te pueden pedir una factura según las normas impositivas argentinas.
- **Cambios de 2026 (fuente secundaria):** según la Comunicación «A» 8481 del BCRA, las personas humanas que exportan servicios pueden acreditar los dólares en una cuenta propia en dólares, sin venderlos. Ver `docs/plan/investigacion.md`. Que lo confirme el contador.
- **Calendario de pagos** ([fuente][calendario]):
  - Google liquida por **mes calendario** y paga **cerca del día 15 del mes siguiente**;
  - para las transferencias en dólares, el saldo tiene que llegar a USD 100;
  - la página no dice qué pasa si el saldo no llega al mínimo.
- **Verificación de la cuenta:** el depósito de prueba de Google se usa solo en los países que cobran por EFT ([fuente][banco]). Argentina cobra por transferencia ([fuente][transferencia]). *Deducción nuestra:* ese paso no se aplicaría.
- **Recomendación del equipo:** antes de cargar la cuenta, pedile al banco:
  - los datos exactos para recibir una transferencia del exterior en dólares (SWIFT, banco corresponsal o intermediario, formato del número de cuenta);
  - la lista de documentación que va a pedir.

### 3.4 Formulario W-8BEN

- **Qué es:**
  - Google lo llama «formulario de certificación de condición de extranjero (W-8BEN)» y se envía al IRS de EE. UU. desde tu perfil de pagos ([fuente][fiscal-es]).
  - En general lo presentan las **personas humanas** de fuera de EE. UU. que reciben los ingresos. Las entidades usan el W-8BEN-E ([fuente][impuestoseeuu]).
- **Dónde:** Configuración > Configuración de pagos > Perfil de pagos > sección de información fiscal ([fuente][fiscal-es]). Se responden las preguntas y se toca **Enviar** ([fuente][fiscal-es]).
- **Si no se presenta un formulario válido** ([fuente][impuestoseeuu]):
  - la retención predeterminada suele ser del **30 %** sobre los pagos alcanzados;
  - en algunos casos puede aplicarse una retención de respaldo del 24 %.
- **Lo que no está claro:**
  - no hay convenio de doble imposición entre Argentina y EE. UU.;
  - no está confirmado si las ventas de apps quedan alcanzadas por la retención (ver `docs/plan/investigacion.md`).
- **Google no da asesoramiento impositivo** ([fuente][impuestoseeuu]). **Revisalo con el contador antes de enviarlo (P17)**, junto con el alta en ARCA y la factura E.

---

## 4. La prueba cerrada, explicada

### 4.1 Qué es y por qué la exige Google

- Una **prueba cerrada** es una versión previa de la app que se comparte con un grupo elegido de personas para recibir sus comentarios ([fuente][configprueba]).
- Rige para las **cuentas personales creadas después del 13/11/2023** ([fuente][prueba]):
  - tienen que hacer la prueba antes de distribuir la app;
  - hasta cumplirla, **producción y pre-registro quedan bloqueados**.
- La razón que da Google es general: probar permite *verificar que la app funcione bien y sea fácil de usar* ([fuente][prueba]). Esa página no da otra razón.
- La **prueba interna** es optativa y recomendada para empezar. La **prueba abierta** se habilita recién después del acceso a producción ([fuente][prueba]).

### 4.2 Quiénes cuentan como participantes

- **Al menos 12 personas («verificadores»)** que acepten participar y sigan inscriptas **de forma continua durante al menos 14 días** ([fuente][prueba]).
- Cada una necesita **una cuenta de Google o de Google Workspace** ([fuente][configprueba]).
- Instalan la app desde Google Play ([fuente][configprueba]). *Deducción nuestra:* necesitan un **celular o tableta Android con Google Play**. Quien solo tiene iPhone no puede participar.
- **Inscribirse no alcanza.** La regla exige seguir inscripto, no usar la app ([fuente][prueba]). Pero:
  - la solicitud de producción pregunta si usaron todas las funciones;
  - Google puede pedir que la prueba siga si hubo *poca participación* ([fuente][prueba]).
  - Por eso, **que la usen de verdad**.
- **Sin fuente oficial:**
  - si cuentan personas repartidas en varios segmentos cerrados;
  - si cuenta la cuenta del propio titular ([fuente][prueba]).
- **Recomendación del equipo:**
  - un solo segmento de prueba cerrada;
  - **reclutar entre 15 y 20 personas** para tener margen;
  - no contar tu propia cuenta;
  - **que sean mayores de 18 años**. El Reading Club exige 16 o más (D09), y así se evitan las cuestiones de consentimiento de menores.
- **No pongas a esas personas también en la prueba interna.** Según la ayuda, quien se inscribe en la prueba interna no queda habilitado para la cerrada, aunque figure en su lista ([fuente][configprueba]).

### 4.3 Cómo se invita

1. En Play Console: **Prueba y lanza > Pruebas > Pruebas cerradas > Administrar segmento > pestaña Verificadores** ([fuente en español][configprueba-es]). En inglés: *Test and release > Testing > Closed testing > Manage track > Testers*.
2. Elegí cómo cargar a las personas ([fuente][configprueba]):
   - **Lista de correos:** botón «Crear lista de direcciones de correo electrónico». Las direcciones se escriben separadas por comas o se sube un archivo CSV.
     - Límites: hasta 200 listas, con hasta 2.000 personas cada una, y 50 listas por segmento.
     - Necesitás el correo **exacto** de la cuenta de Google de cada persona.
   - **Grupos de Google:** cargás la dirección del grupo (`nombre@googlegroups.com`).
     - Solo los miembros del grupo pueden unirse a la prueba, y primero tienen que entrar al grupo.
     - Para crear el grupo: [Crear un grupo y elegir su configuración][grupos]. Ahí elegís quién puede entrar: solo invitados, por solicitud o directamente ([fuente][grupos]).
   - **Recomendación del equipo:** un **Grupo de Google con ingreso «por solicitud»**.
     - Las personas se suman solas y vos aprobás a cada una.
     - El grupo sirve además como canal de avisos. Google sugiere tener un grupo de mensajes con los participantes ([fuente][prueba]).
3. **Canal de comentarios:** cargá un correo o una dirección web para recibir comentarios. Aparece en la página de inscripción ([fuente][configprueba]).
4. **Publicá la versión en el segmento cerrado** ([fuente][configprueba]):
   - el **vínculo para participar** aparece recién cuando el estado de la app es «Publicada»;
   - la primera vez, puede tardar **varias horas** en funcionar.
5. **Compartí el vínculo.** Los participantes **no pueden encontrar la app buscando en Google Play** ([fuente][configprueba]). Al abrir el vínculo ven una explicación y la opción para aceptar participar ([fuente][configprueba]).
6. **Instalan la app desde Google Play.** Las versiones nuevas les llegan solas en pocos minutos ([fuente][configprueba]).

**Comentarios privados:**
- Los participantes también pueden dejar comentarios privados desde el Play Store: foto de perfil > Administrar apps y dispositivo > Beta > la app > «Comentarios privados para el desarrollador» ([fuente][probarapps]). Los nombres son aproximados: la fuente está en inglés.
- Solo los ve el desarrollador ([fuente][probarapps]) y no afectan la calificación pública ([fuente][configprueba]).
- Vos los leés en Play Console, en **Comentarios sobre pruebas** ([fuente en español][prueba-es]).

### 4.4 Qué significa «14 días seguidos inscriptos»

- Cada persona tiene que seguir inscripta **14 días consecutivos** ([fuente][prueba]):
  - si se da de baja antes, **no cuenta**;
  - si vuelve a inscribirse, los 14 días tienen que ser **consecutivos**: en la práctica, empiezan de nuevo.
- **Cómo se da de baja alguien:** en el Play Store, foto de perfil > Administrar apps y dispositivo > Beta > la app > **Abandonar** ([fuente][salirbeta]). Pediles que no lo hagan.
- **Desinstalar:** la ayuda trata desinstalar y abandonar la prueba como cosas distintas ([fuente][salirbeta]), y no dice que desinstalar dé de baja. **Recomendación del equipo:** pediles igual que no desinstalen durante la prueba.
- **Ejemplos:**
  - Si 13 personas aceptan el día 1 y una abandona el día 6, quedan 12, y el día 15 ya tienen los 14 días cumplidos.
  - Si eran 12 justas y una abandona, hay que sumar a otra persona y esperar sus 14 días.
  - Por eso conviene reclutar de más.
- **Seguimiento:** la página oficial no dice dónde se ve el avance (*sin fuente oficial*). **Recomendación del equipo:** llevá una planilla con la fecha en que aceptó cada persona.

### 4.5 ¿Se pueden subir versiones nuevas durante la prueba?

- **Sí, y Google lo recomienda:**
  - actualizar la app en la prueba cerrada antes de publicarla ayuda a evitar calificaciones bajas;
  - conviene corregir los errores durante la prueba ([fuente][prueba]).
- Las actualizaciones llegan solas a los participantes ([fuente][configprueba]).
- La página no dice que actualizar la app reinicie los 14 días. Lo que cuenta es que las personas sigan inscriptas ([fuente][prueba]).
- Los cambios que requieren revisión quedan en espera hasta que se envían. Google advierte que las cuentas nuevas pueden tener revisiones más largas ([fuente][revision]). **Recomendación del equipo:** no dejes la corrección más importante para el último día.

### 4.6 Que el premium no les cobre

- En las compras dentro de las versiones de prueba, **los usuarios pagan de verdad, salvo que estén cargados como verificadores con licencia** ([fuente][facturacionprueba]).
- **Recomendación del equipo:** cargá a los participantes como verificadores con licencia. Se hace en *Settings > License testing*, con listas de correo o Grupos de Google. Pueden comprar productos y suscripciones sin que se les cobre ([fuente][licencias]). En español sería Configuración > Pruebas de licencias, pero ese nombre no está verificado.
- Avisales que las suscripciones de prueba se renuevan muy rápido ([fuente][facturacionprueba]):
  - una mensual, cada 5 minutos;
  - una anual, cada 30 minutos;
  - como máximo 6 renovaciones.

### 4.7 Credenciales para la revisión de Google

Si la app pide iniciar sesión, hay que darle a Google datos de acceso ([fuente][credenciales]) que:
- funcionen siempre y se puedan reutilizar;
- sirvan desde cualquier país;
- eviten los códigos de un solo uso;
- permitan ver lo que está detrás del pago.

Si la contraseña vence, Google puede no revisar la app y rechazarla ([fuente][credenciales]). La cuenta de revisión la prepara Servidor.

### 4.8 La solicitud de acceso a producción

Cuando tengas 12 o más personas con los 14 días cumplidos, entrá al **Panel** y tocá **Solicitar acceso a producción** ([fuente en español][prueba-es]). La solicitud tiene tres partes ([fuente][prueba]).

**Parte 1: «Acerca de la prueba cerrada»**
- Qué tan fácil fue reclutar a los participantes (se elige una opción).
- Si usaron todas las funciones disponibles.
- Si el uso se pareció al que esperás en producción, y qué diferencias notaste.
- Un resumen de los comentarios y de cómo los recolectaste.

**Parte 2: «Acerca de tu app o juego»**
- El público objetivo.
- Qué valor le da la app a sus usuarios.
- Cuántas instalaciones estimás para el primer año.

Las respuestas de esta parte no se publican ni afectan la visibilidad de la app ([fuente][prueba]).

**Parte 3: «Acerca del nivel de preparación para publicar en producción»**
- Qué cambios hiciste a partir de la prueba.
- Cómo decidiste que la app estaba lista.

**Antes de enviarla** ([fuente][prueba]):
- revisá la app contra las políticas de contenido de Google Play;
- revisá la clasificación y el público objetivo;
- comprobá que funcione bien y que las credenciales de prueba sirvan.

Google aclara que *la revisión no es una etapa para corregir errores* ([fuente][prueba]).

**Recomendación del equipo:** Requisitos te prepara un borrador de las respuestas con los datos de Marketing y Producto. Para eso sirve la planilla de comentarios del punto 4.11.

### 4.9 Cuánto tarda la revisión y qué pasa si no la aprueban

- La revisión **suele tardar siete días o menos, pero puede demorar más** ([fuente][prueba]).
- **Si Google pide seguir probando:** puede pasar si hubo menos de 12 personas inscriptas o poca participación ([fuente][prueba]). *Sin fuente oficial:* cuánto más hay que probar y si hay que esperar otros 14 días.
- **Con el acceso aprobado, todavía falta enviar la versión a producción**, que también pasa por revisión ([fuente][revision]).
  - Google recomienda dejar **al menos una semana** entre el envío y la salida al público ([fuente][revision]).
  - Con la **publicación administrada**, los cambios aprobados se publican recién cuando vos lo decidís ([fuente][revision]).

### 4.10 Consejos para que la prueba sea útil

**De Google** ([fuente][prueba]):
- Reclutar en redes personales y profesionales, en comunidades afines y en redes sociales, buscando gente parecida al público y con distintos dispositivos.
- Dar instrucciones claras, decir qué comentarios se buscan y ofrecer un canal para enviarlos.
- Pedir que usen la mayor cantidad posible de funciones.
- Revisar «Comentarios sobre pruebas» y llevar un registro, porque hay que resumirlos en la solicitud.
- Corregir errores y mejorar la experiencia durante la prueba.
- Armar un grupo de mensajes con los participantes.
- Usar el informe previo al lanzamiento.
- Evaluar la experiencia general, no solo los cierres inesperados.

**Recomendación del equipo:** una guía de tareas por semana.
- **Semana 1:**
  - crear la cuenta en la app;
  - abrir un Word y un PDF;
  - probar el modo libro y el modo renglón;
  - probar el reconocimiento de texto (OCR) con un documento escaneado.
- **Semana 2:**
  - escribir una reseña y dar «me gusta»;
  - entrar al Reading Club;
  - probar el premium como verificador con licencia;
  - recuperar la contraseña por correo.
- **Al final de cada semana**, pedir tres respuestas: qué falló, qué confundió y qué mejorarían.

### 4.11 Planilla de comentarios

**Guardala fuera del repositorio, porque tiene datos personales.**

| Fecha | Persona (iniciales) | Dispositivo y versión de Android | Qué pasó o qué sugiere | Canal (correo, grupo, Play) | Gravedad | Qué hicimos | Versión que lo corrige |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

Llevá aparte la fecha en que aceptó cada persona (punto 4.4).

### 4.12 Mensaje modelo para invitar

Marketing puede adaptarlo (P15). Los corchetes se completan.

> Hola, [nombre]. Estoy por publicar Knowmadic, una app para leer documentos Word y PDF, y Google me pide probarla con al menos 12 personas durante 14 días antes de publicarla. ¿Me das una mano?
>
> **Qué necesitás:** un celular o tableta Android con Google Play, y tu cuenta de Google (la misma que usás en el Play Store).
>
> **Cómo sumarte:**
> 1. Entrá a este grupo con esa cuenta y pedí unirte: [enlace del grupo].
> 2. Abrí este enlace con la misma cuenta y aceptá participar: [vínculo para participar].
> 3. Instalá la app desde Google Play.
>
> **Lo importante:**
> - Quedate en la prueba al menos 14 días seguidos, hasta el [fecha]. Si la abandonás antes, Google no te cuenta y tengo que sumar a otra persona.
> - No desinstales la app durante la prueba.
> - Usala de verdad. Te voy a mandar tareas cortas cada semana.
> - Contame qué falla o qué mejorarías en [canal]. Los comentarios son privados: no se publican.
> - Es una versión de prueba y puede tener errores. Si probás el plan premium, no se te cobra.
>
> ¡Gracias!

La última frase vale solo si antes cargaste a la persona como verificadora con licencia (punto 4.6).

### 4.13 Cronograma de ejemplo

Es una estimación del equipo. Los plazos oficiales están citados en la columna «Base».

| Momento | Qué pasa | Quién | Base |
|---|---|---|---|
| Semana 0 | Crear la cuenta de Google dedicada, con verificación en dos pasos. Juntar el documento, el comprobante de domicilio y la tarjeta. Decidir el domicilio y el nombre de desarrollador | Titular | Sección 1 |
| Día 1 | Alta, pago, perfil de pagos y documentos. Verificar el correo y el dispositivo | Titular | Sección 2 |
| Días 2 a 7 (aprox.) | Esperar el resultado de la verificación de identidad. Verificar el teléfono cuando se habilite | Titular | «Unos días» ([fuente][verifantiguas]); orden de los pasos ([fuente][identidad]) |
| En paralelo | Reclutar entre 15 y 20 personas (P15), crear el Grupo de Google y el canal de comentarios. Armar el perfil de comerciante si se va a probar el premium | Marketing y titular | Puntos 4.2, 4.3 y 3.1 |
| Cuando haya una versión instalable con cuentas reales (P02 y P07) | Crear la app («Gratis»), completar el contenido de la app y la ficha. Prueba interna (optativa), sin los participantes de la cerrada. Después, prueba cerrada | Titular, con Desarrollo y Requisitos | [crearapp], [prueba], [configprueba] |
| Día T | La versión de la prueba cerrada queda «Publicada». Enviar el vínculo, que puede tardar horas en funcionar | Titular | [configprueba] |
| T a T+2 | Todas las personas aceptan e instalan. Anotar la fecha de cada una | Participantes y titular | Recomendación |
| T+1 a T+14 | Uso guiado, comentarios y una o dos versiones nuevas | Todos | [prueba] |
| T+16 (aprox.) | Con 12 o más personas con 14 días cumplidos, «Solicitar acceso a producción». Dejar uno o dos días de margen sobre la última fecha | Titular | [prueba] y recomendación |
| T+16 a T+23 | Revisión de la solicitud (suele tardar 7 días o menos) | Google | [prueba] |
| Después | Enviar la versión de producción, con al menos una semana de margen antes del lanzamiento | Titular | [revision] |

**Total estimado desde el día T hasta tener la app en producción:** entre cuatro y cinco semanas, si no hay pedidos de más pruebas. Lo que tarde en llegar el día T depende del desarrollo (P02 y P07), no de la cuenta.

---

## 5. Qué no hacer

- **Comprar, alquilar o vender cuentas de desarrollador**, o transferirlas por fuera del proceso oficial ([fuente][requisitosconsola]).
- **Cargar datos inexactos o que no se puedan verificar** ([fuente][requisitosconsola]). **Presentar documentos alterados o falsos:** puede llevar a que eliminen la cuenta y sus apps ([fuente][docsar]).
- **Manipular calificaciones, reseñas o instalaciones** ([fuente][resenas]):
  - ofrecer premios o beneficios a cambio de calificaciones o reseñas;
  - inflar instalaciones o reseñas por medios ilegítimos;
  - usar servicios automáticos;
  - calificar haciéndose pasar por usuarios.
  - Ojo con el lanzamiento: no les ofrezcas nada a los participantes a cambio de calificaciones de cinco estrellas.
- **Servicios pagos de «testers» o de intercambio de testers:** las páginas oficiales consultadas **no los mencionan expresamente** ([fuente][prueba]). Lo que sí dicen:
  - está prohibido inflar instalaciones o reseñas por medios ilegítimos ([fuente][resenas]);
  - si hubo poca participación, Google puede exigir seguir probando ([fuente][prueba]);
  - la solicitud pide un resumen real de los comentarios ([fuente][prueba]).
  - **Recomendación del equipo:** no usarlos. Personas reales, que usen la app y dejen comentarios que puedas documentar.
- **Abrir otra cuenta si una fue cancelada.** La nueva también se cancela, sin devolución del pago, y las cuentas relacionadas quedan suspendidas para siempre ([fuente][sanciones]).
- **Compartir la contraseña o dar acceso de administrador a cuentas desconocidas** ([fuente][proteger]).
- **Dejar la cuenta sin actividad.** Más de un año sin enviar ninguna app lleva al cierre, sin devolución ([fuente][inactivas]).
- **Dar credenciales de revisión vencidas** ([fuente][requisitosconsola], [fuente][credenciales]).
- **Usar un nombre de desarrollador que sugiera una relación oficial con otra marca** ([fuente][suplantacion]).

**Qué puede suspender o cancelar la cuenta** ([fuente][sanciones]):
- Las infracciones **graves o repetidas** (por ejemplo, software malicioso, fraude o apps que dañen al usuario o al dispositivo) llevan a cancelar la cuenta y las cuentas relacionadas.
- Cada **suspensión** de una app cuenta como una falta contra la cuenta. Varias faltas, o una infracción grave, pueden terminar en la cancelación.
- **Un rechazo no afecta la reputación de la cuenta:** la versión rechazada simplemente no se publica.

---

## 6. Vacíos y contradicciones en las fuentes

- **Sitio web de desarrollador:** una página lo pide para las cuentas personales ([fuente][contacto]) y otra no lo menciona ([fuente][datos]).
- **Qué se muestra en público:** una página dice que en las cuentas personales «solo el correo» ([fuente][actualizar]). Otra dice que también el nombre legal, el país y, si cobrás, la dirección ([fuente][datos]).
- **Tiempo de la verificación de identidad:** solo hay una referencia («unos días»), y es de la página para cuentas anteriores a septiembre de 2023 ([fuente][verifantiguas]).
- **Prueba cerrada** ([fuente][prueba]). La página oficial no dice:
  - dónde se ve el avance;
  - si cuentan personas de varios segmentos;
  - si cuenta el propio titular;
  - qué pasa después de que Google pida seguir probando.
- **Desinstalar la app:** no está claro si da de baja de la prueba ([fuente][salirbeta]).
- **Revisión de la primera versión de la prueba cerrada:** la ayuda no dice expresamente que se revise antes de que funcione el vínculo. Sí dice que el vínculo aparece cuando la app está «Publicada» ([fuente][configprueba]) y que las cuentas nuevas tienen revisiones más largas ([fuente][revision]).
- **Unión Europea:** no se verificó en una página oficial de Google Play qué datos se muestran de quienes venden en la Unión Europea (Ley de Servicios Digitales). Hace falta revisarlo si los países del primer lanzamiento (T07) la incluyen.
- **Recargos de la tarjeta argentina por el pago en dólares:** sin verificar.

---

## 7. Decisiones tuyas que surgen de esta guía

El coordinador las anota en `pendientes.md`.

1. **Qué domicilio declarar**, sabiendo que va a ser público al cobrar. Tiene que ser un domicilio físico que puedas probar con un comprobante a tu nombre de los últimos 90 días. *Propuesta:* decidirlo con Legal.
2. **Nombre de desarrollador:** tu nombre o «Knowmadic». Depende de T01 y se puede cambiar después, con revisión de Google.
3. **Correo público de desarrollador y sitio web:** uno provisorio o esperar al dominio propio (P12). *Propuesta:* uno provisorio dedicado al soporte, para no frenar el alta.
4. **Cuándo crear la cuenta.** *Propuesta:* ahora (fase 0).
   - La verificación puede tardar días.
   - El único riesgo es el cierre por inactividad si pasa un año sin enviar ninguna app ([fuente][inactivas]). Se evita subiendo una versión de prueba antes.
5. **Perfil de las personas de la prueba.** *Propuesta:* solo mayores de 18 años.

---

## Fuentes

Todas consultadas el **22/10/2026**.

| Clave | Página oficial |
|---|---|
| alta | [Get started with Play Console](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en) |
| datos | [Required information to create a Play Console developer account](https://support.google.com/googleplay/android-developer/answer/13628312?hl=en) |
| tipo | [Choose a developer account type](https://support.google.com/googleplay/android-developer/answer/13634885?hl=en) |
| contacto | [Contact information requirements for developer accounts](https://support.google.com/googleplay/android-developer/answer/10840893?hl=en) |
| identidad | [Verify your developer identity information](https://support.google.com/googleplay/android-developer/answer/10841920?hl=en) |
| docsar | [Google Play Developer Verification: Required documents by country and region – Argentina](https://support.google.com/googleplay/android-developer/answer/15633622?hl=en&co=GENIE.CountryCode%3DAR) |
| dispositivo | [Device verification requirements for new developer accounts](https://support.google.com/googleplay/android-developer/answer/14316361?hl=en) ([en español](https://support.google.com/googleplay/android-developer/answer/14316361?hl=es-419)) |
| sobreti | [View and manage your developer account information](https://support.google.com/googleplay/android-developer/answer/13634081?hl=en) |
| actualizar | [Keeping your developer account information up to date](https://support.google.com/googleplay/android-developer/answer/13634888?hl=en) |
| perfilid | [Update developer identity details managed by a Google payments profile](https://support.google.com/googleplay/android-developer/answer/16260648?hl=en) |
| tipopagos | [Set your account type (Centro de pagos de Google)](https://support.google.com/paymentscenter/answer/11543916?hl=en) |
| proteger | [Protect your developer account](https://support.google.com/googleplay/android-developer/answer/2543765?hl=en) |
| 2pasos | [Cómo activar la Verificación en 2 pasos](https://support.google.com/accounts/answer/185839?hl=es-419) |
| blog2fa | [Android Developers Blog: Play Dev ID requirements + 2-Step Verification (28/06/2021)](https://android-developers.googleblog.com/2021/06/play-dev-id-requirements-2-step.html) |
| requisitosconsola | [Play Console Requirements](https://support.google.com/googleplay/android-developer/answer/10788890?hl=en) |
| acuerdo | [Google Play Developer Distribution Agreement (vigente desde el 15/09/2025)](https://play.google/developer-distribution-agreement.html) |
| inactivas | [Closure of inactive developer accounts](https://support.google.com/googleplay/android-developer/answer/11605267?hl=en) |
| sanciones | [Enforcement process](https://support.google.com/googleplay/android-developer/answer/9899234?hl=en) |
| resenas | [User Ratings, Reviews, and Installs](https://support.google.com/googleplay/android-developer/answer/9898684?hl=en) |
| suplantacion | [Impersonation](https://support.google.com/googleplay/android-developer/answer/9888374?hl=en) |
| verifantiguas | [Verifying your Play Console developer account (for accounts created before September, 2023)](https://support.google.com/googleplay/android-developer/answer/14177239?hl=en) |
| perfilpagos | [Create a payments profile](https://support.google.com/googleplay/android-developer/answer/7161426?hl=en) ([en español](https://support.google.com/googleplay/android-developer/answer/7161426?hl=es-419)) |
| ubicaciones | [Supported locations for developer and merchant registration](https://support.google.com/googleplay/android-developer/answer/9306917?hl=en) |
| banco | [Enter merchant bank account information](https://support.google.com/googleplay/android-developer/answer/7161440?hl=en) ([en español](https://support.google.com/googleplay/android-developer/answer/7161440?hl=es-419)) |
| transferencia | [Wire transfer payouts (incluye Argentina)](https://support.google.com/googleplay/android-developer/answer/2700656?hl=en) |
| calendario | [Payout schedule](https://support.google.com/googleplay/android-developer/answer/137997?hl=en) |
| fiscal | [Enter merchant tax information](https://support.google.com/googleplay/android-developer/answer/7163598?hl=en) ([en español](https://support.google.com/googleplay/android-developer/answer/7163598?hl=es-419)) |
| impuestoseeuu | [US tax information reporting and withholding (Centro de pagos de Google)](https://support.google.com/paymentscenter/answer/10349995?hl=en) |
| suscripciones | [Create and manage subscriptions](https://support.google.com/googleplay/android-developer/answer/140504?hl=en) |
| precios | [Set up your app's prices](https://support.google.com/googleplay/android-developer/answer/6334373?hl=en) |
| crearapp | [Create and set up your app](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en) |
| prueba | [App testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en) ([en español](https://support.google.com/googleplay/android-developer/answer/14151465?hl=es-419)) |
| configprueba | [Set up an open, closed, or internal test](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en) ([en español](https://support.google.com/googleplay/android-developer/answer/9845334?hl=es-419)) |
| revision | [Control when app changes are reviewed and published](https://support.google.com/googleplay/android-developer/answer/9859654?hl=en) |
| credenciales | [Requirements for providing sign in details for review](https://support.google.com/googleplay/android-developer/answer/15748846?hl=en) |
| facturacionprueba | [Test your Google Play Billing Library integration (Android Developers)](https://developer.android.com/google/play/billing/test) |
| licencias | [Test in-app billing with application licensing](https://support.google.com/googleplay/android-developer/answer/6062777?hl=en) |
| salirbeta | [Leave an app's beta program (Ayuda de Google Play)](https://support.google.com/googleplay/answer/15654751?hl=en) |
| probarapps | [Try new Android apps before their official release (Ayuda de Google Play)](https://support.google.com/googleplay/answer/7003180?hl=en) |
| grupos | [Crear un grupo y elegir su configuración (Ayuda de Grupos de Google)](https://support.google.com/groups/answer/2464926?hl=es-419) |
| anuncio | [Policy announcement: July 15, 2026](https://support.google.com/googleplay/android-developer/answer/17134731?hl=en) |
| paquetes | [Registering Android package names](https://support.google.com/googleplay/android-developer/answer/16761053?hl=en) |

Fuente secundaria: Comunicación «A» 8481 del BCRA, según el estudio Allende & Brea, citado en `docs/plan/investigacion.md`.

[alta]: https://support.google.com/googleplay/android-developer/answer/6112435?hl=en
[datos]: https://support.google.com/googleplay/android-developer/answer/13628312?hl=en
[tipo]: https://support.google.com/googleplay/android-developer/answer/13634885?hl=en
[contacto]: https://support.google.com/googleplay/android-developer/answer/10840893?hl=en
[identidad]: https://support.google.com/googleplay/android-developer/answer/10841920?hl=en
[docsar]: https://support.google.com/googleplay/android-developer/answer/15633622?hl=en&co=GENIE.CountryCode%3DAR
[dispositivo]: https://support.google.com/googleplay/android-developer/answer/14316361?hl=en
[dispositivo-es]: https://support.google.com/googleplay/android-developer/answer/14316361?hl=es-419
[sobreti]: https://support.google.com/googleplay/android-developer/answer/13634081?hl=en
[actualizar]: https://support.google.com/googleplay/android-developer/answer/13634888?hl=en
[perfilid]: https://support.google.com/googleplay/android-developer/answer/16260648?hl=en
[tipopagos]: https://support.google.com/paymentscenter/answer/11543916?hl=en
[proteger]: https://support.google.com/googleplay/android-developer/answer/2543765?hl=en
[2pasos]: https://support.google.com/accounts/answer/185839?hl=es-419
[blog2fa]: https://android-developers.googleblog.com/2021/06/play-dev-id-requirements-2-step.html
[requisitosconsola]: https://support.google.com/googleplay/android-developer/answer/10788890?hl=en
[acuerdo]: https://play.google/developer-distribution-agreement.html
[inactivas]: https://support.google.com/googleplay/android-developer/answer/11605267?hl=en
[sanciones]: https://support.google.com/googleplay/android-developer/answer/9899234?hl=en
[resenas]: https://support.google.com/googleplay/android-developer/answer/9898684?hl=en
[suplantacion]: https://support.google.com/googleplay/android-developer/answer/9888374?hl=en
[verifantiguas]: https://support.google.com/googleplay/android-developer/answer/14177239?hl=en
[perfilpagos]: https://support.google.com/googleplay/android-developer/answer/7161426?hl=en
[perfilpagos-es]: https://support.google.com/googleplay/android-developer/answer/7161426?hl=es-419
[ubicaciones]: https://support.google.com/googleplay/android-developer/answer/9306917?hl=en
[banco]: https://support.google.com/googleplay/android-developer/answer/7161440?hl=en
[banco-es]: https://support.google.com/googleplay/android-developer/answer/7161440?hl=es-419
[transferencia]: https://support.google.com/googleplay/android-developer/answer/2700656?hl=en
[calendario]: https://support.google.com/googleplay/android-developer/answer/137997?hl=en
[fiscal]: https://support.google.com/googleplay/android-developer/answer/7163598?hl=en
[fiscal-es]: https://support.google.com/googleplay/android-developer/answer/7163598?hl=es-419
[impuestoseeuu]: https://support.google.com/paymentscenter/answer/10349995?hl=en
[suscripciones]: https://support.google.com/googleplay/android-developer/answer/140504?hl=en
[precios]: https://support.google.com/googleplay/android-developer/answer/6334373?hl=en
[crearapp]: https://support.google.com/googleplay/android-developer/answer/9859152?hl=en
[prueba]: https://support.google.com/googleplay/android-developer/answer/14151465?hl=en
[prueba-es]: https://support.google.com/googleplay/android-developer/answer/14151465?hl=es-419
[configprueba]: https://support.google.com/googleplay/android-developer/answer/9845334?hl=en
[configprueba-es]: https://support.google.com/googleplay/android-developer/answer/9845334?hl=es-419
[revision]: https://support.google.com/googleplay/android-developer/answer/9859654?hl=en
[credenciales]: https://support.google.com/googleplay/android-developer/answer/15748846?hl=en
[facturacionprueba]: https://developer.android.com/google/play/billing/test
[licencias]: https://support.google.com/googleplay/android-developer/answer/6062777?hl=en
[salirbeta]: https://support.google.com/googleplay/answer/15654751?hl=en
[probarapps]: https://support.google.com/googleplay/answer/7003180?hl=en
[grupos]: https://support.google.com/groups/answer/2464926?hl=es-419
[anuncio]: https://support.google.com/googleplay/android-developer/answer/17134731?hl=en
[paquetes]: https://support.google.com/googleplay/android-developer/answer/16761053?hl=en
