# Política de privacidad de [NOMBRE DE LA APP]

> **Borrador para revisión del titular. No publicar todavía.**
> - Describe la app con el **servidor real de cuentas conectado** (P02). Mientras la app use el servicio local de prueba, publicar este texto sería presentar como real algo que no lo es.
> - Lo que está entre corchetes es un marcador pendiente de decisión (ver la lista en `notas-para-revision.md`).
> - Los bloques que empiezan con «Nota de revisión» y la sección «Fuentes» no se publican ni se traducen. Las decisiones abiertas tienen un número N-xx en `notas-para-revision.md`.
> - Dónde hay **Variante A / Variante B**, queda una sola cuando el titular decida (N-01).

Vigente desde: [FECHA DE VIGENCIA]

## En pocas palabras

- Los documentos que abrís (Word y PDF), su texto, el reconocimiento de texto (OCR) y tu progreso de lectura se procesan y se guardan **solo en tu dispositivo**. No se envían a ningún servidor.
- Podés leer sin crear una cuenta. Si no tenés cuenta, la app no recopila datos personales tuyos.
- Si creás una cuenta, se guardan en un servidor tu correo, tu nombre de usuario y lo que publicás. Si entrás al Reading Club, también tu fecha de nacimiento [Variante B: también tu fecha de nacimiento, que se pide al registrarte].
- Si contratás el plan premium, el pago lo procesa Google Play. El responsable no recibe los datos de tu tarjeta.
- No hay publicidad, no se venden datos y no se usan herramientas de seguimiento.
- Podés pedir el acceso, la corrección o el borrado de tus datos. También podés borrar tu cuenta desde la app o desde [SITIO WEB].

## 1. Quién es responsable de tus datos

El responsable de la base de datos es [TITULAR Y DOMICILIO], una persona humana que ofrece [NOMBRE DE LA APP]. En esta política lo llamamos «el responsable».

- Contacto para temas de privacidad: [CORREO DE SOPORTE].
- La base de datos está inscripta en el Registro Nacional de Bases de Datos Personales con el número [N.º DE INSCRIPCIÓN EN LA AAIP].

## 2. Lo que queda solo en tu dispositivo

| Dato | Dónde queda |
|---|---|
| Los archivos que abrís (.docx y .pdf), incluidos sus nombres | En tu dispositivo |
| El texto, las imágenes y el índice que la app extrae de cada documento | En tu dispositivo |
| El resultado del reconocimiento de texto (OCR) de las páginas escaneadas | En tu dispositivo |
| Tu progreso de lectura, incluido un fragmento del texto donde quedaste | En tu dispositivo |
| Tus preferencias de lectura (tamaño de letra, tema, fuente y otras) y el idioma elegido | En tu dispositivo |

La app procesa todo esto en tu dispositivo y lo guarda en su almacenamiento interno (en la versión web, en el almacenamiento del navegador). El reconocimiento de texto usa un programa y un modelo de idioma que vienen con la app: las páginas no se envían a ningún servicio externo.

Si iniciás sesión, la app anota en tu dispositivo a qué cuenta pertenece cada documento, para separar las bibliotecas de distintas personas que usen el mismo dispositivo. Esa anotación tampoco sale del dispositivo.

El responsable no tiene acceso a esos datos ni guarda copias. Por eso **no puede recuperarlos** si los borrás, si desinstalás la app o si borrás los datos del navegador. Te conviene conservar tus propios archivos originales.

> **Nota de revisión.** Verificado en el código el 22/10/2026: `src/lib/db.ts`, `src/lib/settings.ts`, `src/import/` y `scripts/vendor-assets.ts` (pdf.js y Tesseract se sirven desde la propia app; no hay llamadas de red en `src/`). `docs/backend.md` deja pendiente «sincronizar biblioteca y preferencias entre dispositivos». Si eso se implementa, esta sección cambia (N-14).

## 3. Datos que se tratan si creás una cuenta o usás la comunidad

### 3.1. Tu cuenta

- Correo electrónico.
- Nombre de usuario.
- Contraseña. Se guarda transformada con una función irreversible (un «hash»), así que nadie puede leerla, ni siquiera el responsable.
- Un identificador interno, la fecha de alta y tu plan (gratuito o premium).
- La constancia de que aceptaste los términos, las normas de la comunidad y esta política (qué versión y cuándo) y, si lo diste, tu consentimiento para las transferencias de la sección 7.

El correo, el nombre de usuario y la contraseña son obligatorios para crear una cuenta. Sin ellos la cuenta no se puede crear.

### 3.2. Tu fecha de nacimiento

**Variante A (D09 vigente).** Se te pide la primera vez que entrás al Reading Club, que es solo para personas de 16 años o más. Se usa únicamente para comprobar esa edad. No es obligatoria para el resto de la app; sin ella no podés entrar al Club.

**Variante B (recomendada en N-01).** Se te pide al crear la cuenta, porque para tener una cuenta hay que tener al menos 13 años y el Reading Club es solo para personas de 16 años o más. Se usa únicamente para comprobar esas edades. Si indicás que tenés menos de 13 años, la cuenta no se crea y la fecha no se guarda en el servidor.

En los dos casos, una vez cargada no se puede cambiar desde la app, para que nadie pueda esquivar el límite de edad. Si te equivocaste, escribí a [CORREO DE SOPORTE]: se corrige después de una verificación razonable. Dar una fecha falsa es un incumplimiento de los términos y puede llevar a que pierdas el acceso al Club o a la cuenta.

### 3.3. Lo que publicás y tus acciones en la comunidad

- **Reseñas:** nombre y autor del libro, categoría, título, texto, la marca de «Contiene spoilers» y las fechas de publicación y edición.
- **Reading Club:** las conversaciones que abrís (título, categoría y texto) y tus respuestas.
- **Likes** que das y **usuarios que bloqueás**.
- **Denuncias** que hacés sobre contenido o usuarios.

Lo que escribís puede revelar tus opiniones, creencias o datos de salud. Nadie puede obligarte a dar ese tipo de datos (Ley 25.326, art. 7). Si los publicás, van a quedar a la vista de quienes puedan ver esa publicación (ver la sección 5).

### 3.4. La suscripción premium

- Los datos de la compra que informa Google Play: identificador del pedido, producto (mensual o anual), fechas, estado (activa, cancelada o vencida), moneda y país de la compra.
- El comprobante de compra que entrega Google Play, que el servidor usa para validar la suscripción.
- [Si se usa [HERRAMIENTA DE COBROS Y PAÍS]: tu identificador interno y los datos de compra anteriores, para validar y llevar el estado de la suscripción.]

El responsable **no recibe** el número de tu tarjeta ni otros datos del medio de pago: esos datos los recopila y trata Google bajo sus propias condiciones.

> **Nota de revisión.** Los campos exactos de la compra dependen de la implementación (P08, T04). Confirmar con Servidor antes de publicar.

### 3.5. Seguridad, moderación y soporte

- **Registros técnicos del servidor:** dirección IP, fecha y hora, tipo de dispositivo o navegador y el resultado de los intentos de ingreso.
- **Moderación:** las denuncias sobre tus publicaciones o tu cuenta, las decisiones que se tomen y los mensajes de apelación.
- **Soporte:** los mensajes que mandás a [CORREO DE SOPORTE] y los pedidos para ejercer tus derechos.

### 3.6. Lo que no se recopila

- Ubicación, contactos, fotos, cámara ni micrófono.
- Identificadores publicitarios ni historial de navegación.
- La app no incluye publicidad, herramientas de análisis de uso ni servicios de seguimiento de terceros.

Si más adelante se suma una herramienta para medir errores o el uso de la app, se te va a pedir permiso antes y se va a actualizar esta política.

## 4. Para qué se usan tus datos y con qué fundamento

| Para qué | Qué datos | Fundamento (Ley 25.326) |
|---|---|---|
| Crear y mantener tu cuenta, iniciar sesión y recuperar la contraseña | Correo, nombre de usuario, contraseña, identificador | Relación contractual (art. 5, inc. 2, d) |
| Publicar y mostrar reseñas, likes y el Reading Club | Lo que publicás y tu nombre de usuario | Relación contractual. Vos decidís qué publicar |
| Comprobar la edad para el Reading Club [Variante B: y para la cuenta] | Fecha de nacimiento | Consentimiento, al cargarla (art. 5, inc. 1), y relación contractual |
| Validar y administrar el plan premium | Datos de la compra | Relación contractual y obligaciones legales, por ejemplo impositivas (art. 5, inc. 2, b y d) |
| Aplicar las normas de la comunidad y atender denuncias | Denuncias, publicaciones, decisiones | Relación contractual (aceptaste las normas) y, cuando la pide una autoridad competente, obligación legal |
| Proteger la seguridad del servicio y prevenir abusos | Registros técnicos | Relación contractual y deber de seguridad del responsable (art. 9) |
| Responder consultas y pedidos sobre tus derechos | Tus mensajes | Relación contractual y obligación legal (arts. 14 a 16) |
| Avisarte cambios en tu cuenta, en estos textos o en el servicio | Correo | Relación contractual |

El responsable:
- no usa tus datos para publicidad;
- no arma perfiles comerciales;
- no te manda correos promocionales. Si algún día lo hace, será con tu consentimiento y vas a poder pedir que se te quite de esa lista cuando quieras (Ley 25.326, art. 27).

La comunidad puede usar un filtro automático que impide publicar textos con palabras o enlaces prohibidos. Si creés que el filtro se equivocó, podés pedir que una persona lo revise. Las suspensiones y los cierres de cuenta los decide una persona.

## 5. Qué ven otras personas

| Qué | Quién lo ve |
|---|---|
| Tus reseñas, con tu nombre de usuario y la fecha | Cualquier persona que use la app o su versión web, tenga o no cuenta |
| El número de likes de cada reseña | Cualquier persona que vea la reseña. Quién dio cada like no se muestra |
| Tus conversaciones y respuestas del Reading Club, con tu nombre de usuario | Solo quienes son miembros del Club (16 años o más, con plan premium) |
| Tu correo, tu fecha de nacimiento, tu plan, tus denuncias y bloqueos, y tus documentos | Nadie más: no se muestran a otros usuarios |

Si no querés que te reconozcan, elegí un nombre de usuario que no sea tu nombre real y no publiques datos personales tuyos ni de otras personas.

## 6. Quiénes más tratan tus datos

| Quién | Para qué | Qué datos | Dónde |
|---|---|---|---|
| [PROVEEDOR DEL SERVIDOR Y PAÍS] | Alojamiento, base de datos e inicio de sesión | Los de la sección 3 | [PAÍS DE LA REGIÓN], con soporte técnico y subencargados en otros países, como Estados Unidos |
| [PROVEEDOR DE CORREO Y PAÍS] | Enviar los correos de la cuenta (confirmación, recuperación de contraseña y avisos) | Tu correo y el contenido del mensaje | [PAÍS] |
| [HERRAMIENTA DE COBROS Y PAÍS], si se usa | Validar compras y llevar el estado de la suscripción | Un identificador interno sin tu correo ni tu nombre, y los datos de la compra | [PAÍS] |
| Google (Google Play) | Distribuir la app y cobrar la suscripción | Los que Google recopila según su propia política. El responsable solo recibe los datos de compra de la sección 3.4 | Estados Unidos y otros países |
| GitHub, Inc. (solo la versión web) | Alojar los archivos de la versión web | La dirección IP de quien visita el sitio, que GitHub registra con fines de seguridad | Estados Unidos |

- Los proveedores de servicios tratan los datos **por cuenta del responsable** y no pueden usarlos para otros fines (Ley 25.326, art. 25).
- Google trata los datos de tu cuenta de Google y de tu pago como responsable independiente, según su política de privacidad.
- El responsable también puede entregar datos si lo exige una ley o una autoridad competente (Ley 25.326, arts. 5, inc. 2, b, y 11).
- **No se venden datos ni se ceden a terceros para que los usen con sus propios fines.**

> **Nota de revisión.** GitHub Pages: la documentación de GitHub dice que «the visitor's IP address is logged and stored for security purposes». Si la versión web se muda a otro alojamiento con el dominio propio (P12), actualizar la fila. Para la app de Android empaquetada (T03), confirmar con Desarrollo si carga algo desde la web.

## 7. Transferencias internacionales

Tus datos de cuenta y de la comunidad se guardan en servidores de [PROVEEDOR DEL SERVIDOR Y PAÍS], fuera de Argentina. Además, algunos proveedores (soporte técnico del servidor, correo y cobros) y Google y GitHub están en Estados Unidos o en otros países. Por eso tus datos se transfieren al exterior.

La Ley 25.326 (art. 12) prohíbe transferir datos a países sin un nivel de protección adecuado, salvo excepciones. La lista de países adecuados la fija la autoridad de control. Hoy incluye, entre otros, los de la Unión Europea, el Reino Unido, Suiza, Uruguay y Canadá (sector privado). **Estados Unidos, Brasil y Singapur no están en esa lista.**

Para estas transferencias, el responsable:
- [Si la región elegida está en la Unión Europea: guarda la base principal en un país que la autoridad de control considera adecuado;]
- aceptó con cada proveedor un contrato que lo obliga a proteger los datos y a usarlos solo para prestar su servicio;
- envía a cada proveedor solo los datos que necesita (por ejemplo, la herramienta de cobros no recibe tu correo ni tu nombre);
- **te pide tu consentimiento expreso** al crear la cuenta para transferir tus datos a [Estados Unidos y Singapur, según la lista de subencargados del proveedor] (Decreto 1558/2001, anexo I, art. 12). Podés retirarlo cuando quieras borrando tu cuenta: sin esas transferencias, la cuenta y la comunidad no pueden funcionar.

> **Nota de revisión.** Redactado según la recomendación de N-02 (región en la UE, consentimiento expreso para lo que va a EE. UU. y Singapur, contratos del proveedor y minimización). Si el titular elige São Paulo o presentar los contratos ante la AAIP, se reescribe este apartado.

## 8. Cuánto tiempo se conservan

| Datos | Cuánto tiempo |
|---|---|
| Cuenta (correo, nombre de usuario, contraseña, plan) | Mientras exista la cuenta. Al borrarla, se eliminan dentro de los 5 días hábiles (Ley 25.326, art. 16) |
| Fecha de nacimiento | Mientras exista la cuenta |
| Reseñas, conversaciones y respuestas | Hasta que las borres o borres tu cuenta |
| Likes y bloqueos | Hasta que los retires o borres tu cuenta |
| Datos de compras | [5 años] desde cada operación, por obligaciones impositivas (plazo a confirmar con el contador) |
| Denuncias y decisiones de moderación | [1 año] desde que se cierra cada caso |
| Si una cuenta se cierra por una falta grave | Un identificador mínimo (una versión cifrada del correo) durante [el plazo de la sanción], solo para impedir que se abra otra cuenta |
| Contenido retirado por moderación | [90 días], para resolver apelaciones o reclamos, salvo que una autoridad ordene conservarlo más |
| Registros técnicos | [7 días] |
| Mensajes de soporte y pedidos sobre tus derechos | [2 años] |
| Copias de seguridad del servidor | Lo borrado puede seguir en las copias hasta [7 días], hasta que se sobrescriben. Mientras tanto, solo se usan para restaurar el servicio ante una falla |

> **Nota de revisión.** Los 7 días de copias y de registros con IP salen del plan Pro de Supabase según `docs/tecnico/anexo-comparativo.md` (sección 3, «Datos mínimos»). Los demás plazos son propuestas: ver N-03.

Vencidos esos plazos, los datos se eliminan o se anonimizan de forma que ya no se puedan vincular con vos. La ley exige destruir los datos cuando dejan de ser necesarios para su finalidad (Ley 25.326, art. 4).

## 9. Cómo borrar tus datos y tu cuenta

- **Publicaciones:** podés editar o borrar tus reseñas, conversaciones y respuestas cuando quieras. Al borrar una conversación del Reading Club se borran también las respuestas que tenga, incluidas las de otras personas.
- **Cuenta:** podés borrarla desde la app (en «Cuenta») o desde [SITIO WEB]/borrar-cuenta, sin necesidad de abrir la app. Se borran tu cuenta, tu fecha de nacimiento, tus publicaciones, likes y bloqueos. Solo se conservan los datos de la sección 8 que la ley obliga a guardar o que hacen falta para resolver denuncias pendientes, por los plazos indicados.
- **Importante:** borrar la cuenta **no cancela la suscripción en Google Play**. Cancelala antes desde Google Play (ver los términos y condiciones).
- **Documentos y progreso de lectura:** como están solo en tu dispositivo, los borrás desde la biblioteca de la app, desinstalando la app o borrando los datos del sitio en el navegador.

> **Nota de revisión.** El borrado en cascada de respuestas ajenas sale del esquema de referencia de `docs/backend.md` (`on delete cascade`). Es una decisión de producto con efecto legal: ver N-06.

## 10. Tus derechos y cómo ejercerlos

Tenés derecho a:
- **Acceder** a tus datos: saber qué datos tuyos hay, de dónde salieron, para qué se usan y a quién se comunican. Es gratuito si lo pedís con intervalos de al menos seis meses, salvo que acredites un interés legítimo para hacerlo antes. Se te responde dentro de los **10 días corridos** (Ley 25.326, art. 14).
- **Rectificar, actualizar o suprimir** tus datos. Se resuelve dentro de los **5 días hábiles** (Ley 25.326, art. 16). La supresión no procede si puede perjudicar derechos o intereses legítimos de otras personas o si hay una obligación legal de conservar los datos (art. 16).
- **Retirar tu consentimiento** cuando quieras. El retiro no afecta lo hecho antes (Decreto 1558/2001, anexo I, art. 5).
- **Recibir la información** de forma clara y en el medio que elijas entre los disponibles; por ejemplo, un archivo con tus datos (Ley 25.326, art. 15).

**Cómo pedirlo:**
1. Muchas cosas las podés hacer vos desde la app: editar o borrar publicaciones, ver tu perfil y borrar la cuenta.
2. Para lo demás, escribí a [CORREO DE SOPORTE] **desde el correo de tu cuenta**, contando qué necesitás.
3. La ley pide verificar tu identidad (art. 14). En general alcanza con que escribas desde el correo de la cuenta. Solo se te pedirá algo más si hace falta para proteger tus datos.
4. Si el pedido es por una persona menor de edad, lo puede hacer su madre, padre o representante legal. Si la persona falleció, lo pueden hacer sus sucesores universales (art. 14).

> El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326.
>
> LA AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.

Agencia de Acceso a la Información Pública: www.argentina.gob.ar/aaip — Av. Pte. Gral. Julio A. Roca 710, piso 2, Ciudad Autónoma de Buenos Aires.

> **Nota de revisión.** La segunda leyenda es la del art. 3 de la Resolución AAIP 14/2018. Pude verificar el comienzo y la frase central; contrastar el final literal con el Boletín Oficial del 09/03/2018 antes de publicar. La primera leyenda reproduce el contenido del art. 14, inc. 3, de la ley. Al traducir, las dos leyendas se mantienen en español y se agrega la traducción a continuación.

## 11. Personas menores de edad

**Variante A (D09 vigente: registro abierto a cualquier edad).**
- Cualquier persona puede crear una cuenta.
- Si tenés menos de 18 años, pedile a tu madre, padre o representante legal que lea esta política con vos.
- Si tenés menos de 13 años, solo podés tener una cuenta si tu madre, padre o representante legal la autoriza y acepta esta política por vos. [Mecanismo de autorización pendiente: ver N-01.]
- El Reading Club es solo para personas de 16 años o más.
- Las madres, padres y representantes pueden pedir el acceso a los datos de la persona menor a su cargo, su corrección o el borrado de la cuenta, escribiendo a [CORREO DE SOPORTE].

**Variante B (recomendada en N-01).**
- Leer en [NOMBRE DE LA APP] no requiere cuenta y no recopila datos personales: lo puede hacer cualquier persona, de cualquier edad.
- Para crear una cuenta hay que tener **13 años o más** [en Brasil, 16 años o más: ver N-01]. Si el responsable se entera de que una cuenta es de una persona menor de 13 años, la borra junto con sus datos.
- Si tenés entre 13 y 17 años, pedile a tu madre, padre o representante legal que lea esta política con vos. Para contratar el plan premium necesitás su autorización (ver los términos y condiciones).
- El Reading Club es solo para personas de 16 años o más.
- Las madres, padres y representantes pueden pedir el acceso a los datos de la persona menor a su cargo, su corrección o el borrado de la cuenta, escribiendo a [CORREO DE SOPORTE].

En las dos variantes: [NOMBRE DE LA APP] no tiene mensajes privados entre usuarios ni perfiles con fotos. Te recomendamos no publicar tu nombre completo, tu escuela, tu dirección ni otros datos que permitan ubicarte.

## 12. Almacenamiento en el dispositivo, cookies y permisos

- La app **no usa cookies** de publicidad ni de seguimiento.
- Usa el almacenamiento del dispositivo (en la versión web, el del navegador) solo para funcionar:
  - tus documentos, tu progreso y tus preferencias (sección 2);
  - el idioma elegido;
  - la sesión iniciada, para que no tengas que ingresar cada vez;
  - una copia de los archivos de la app, para que funcione sin conexión.
- Nada de eso se comparte con terceros.
- **Permisos en Android:** [a confirmar con Desarrollo cuando esté empaquetada (T03)]. La app solo necesita acceso a Internet para la cuenta y la comunidad. Para abrir documentos usa el selector de archivos del sistema, que le da acceso solo al archivo que elegís.

## 13. Seguridad

El responsable toma medidas razonables para proteger tus datos (Ley 25.326, art. 9). Sigue como referencia las medidas recomendadas por la autoridad de control (Resolución AAIP 47/2018). Entre ellas:
- conexiones cifradas (HTTPS);
- contraseñas guardadas con hash;
- reglas en el servidor para que cada persona solo pueda modificar lo suyo;
- acceso al servidor limitado al responsable, con verificación en dos pasos.

Si ocurre un incidente de seguridad que pueda afectarte, se te va a avisar y, si corresponde, se informará a la autoridad de control.

Ningún sistema es infalible: usá una contraseña que no uses en otros servicios.

## 14. Si vivís fuera de Argentina

[NOMBRE DE LA APP] se ofrece desde Argentina y esta política se rige por la ley argentina. Si vivís en otro país, la ley de tu país puede darte derechos adicionales: podés ejercerlos por el mismo canal ([CORREO DE SOPORTE]).

- **Brasil.** [Sección propia en la versión en portugués: derechos del titular según la Lei Geral de Proteção de Dados (Lei 13.709/2018, art. 18) y reclamo ante la ANPD. Ver N-16.]
- **Unión Europea y Reino Unido.** [Si se decide ofrecer la app allí (T07), hay que agregar la información que exige el Reglamento General de Protección de Datos. Ver N-16.]

## 15. Cambios en esta política

Si el responsable cambia esta política de forma importante, te va a avisar en la app y por correo al menos [30] días antes de que el cambio rija. Las versiones anteriores quedan disponibles en [SITIO WEB].

## 16. Contacto

[TITULAR Y DOMICILIO] — [CORREO DE SOPORTE] — [SITIO WEB]

---

## Fuentes (no se publica)

Consultadas el 22/10/2026.

- Ley 25.326, texto actualizado (arts. 2, 4, 5, 6, 7, 9, 11, 12, 14, 15, 16, 21, 25 y 27): https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/texact.htm
- Decreto 1558/2001, anexo I (arts. 1, 5, 12, 14, 16 y 25): https://servicios.infoleg.gob.ar/infolegInternet/anexos/70000-74999/70368/norma.htm
- Resolución AAIP 14/2018 (deroga la Disposición DNPDP 10/2008; información del art. 6 en sitio visible y leyenda de la AAIP; B.O. 09/03/2018): https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-14-2018-307621/texto
- AAIP, transferencias internacionales (Disposición DNPDP 60/2016, Resolución AAIP 34/2019, Resolución AAIP 198/2023, Resolución AAIP 159/2018, plazo de 30 días para contratos no modelo): https://www.argentina.gob.ar/transferencias-internacionales
- Resolución AAIP 47/2018 (medidas de seguridad recomendadas; deroga las Disposiciones DNPDP 11/2006 y 9/2008; B.O. 25/07/2018): https://www.argentina.gob.ar/normativa/nacional/norma-144072 (ficha de la Disposición 9/2008 que registra su derogación). Contenido de los anexos según fuente secundaria: https://www.marval.com/Publicacion/nueva-resolucion-sobre-medidas-de-seguridad-y-datos-personales-13216
- Google Play, guía del formulario de Seguridad de los datos: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play, requisitos de borrado de cuenta: https://support.google.com/googleplay/android-developer/answer/13327111
- GitHub Pages, privacidad de quienes visitan el sitio: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- Propuesta de Servidor (región, subencargados de Supabase y RevenueCat, copias y registros de 7 días): `docs/tecnico/decision-servidor-empaquetado-cobros.md` y `docs/tecnico/anexo-comparativo.md`, sección 3.
- Código de la app (verificado el 22/10/2026): `src/services/types.ts`, `src/services/localBackend.ts`, `src/lib/db.ts`, `src/lib/settings.ts`, `src/lib/access.ts`, `src/community/Club.tsx`, `src/import/`, `scripts/vendor-assets.ts`, `vite.config.ts` y `docs/backend.md`.
