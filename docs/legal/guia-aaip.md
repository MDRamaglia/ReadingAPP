# Guía para inscribir la base de datos en la AAIP (P16)

Preparó: Legal, el 22/10/2026. Fuentes oficiales consultadas el 22/10/2026 (lista al final).

El trámite lo hace el **titular**, con su clave fiscal. Nadie del equipo lo presenta. Esta guía no reemplaza el formulario: los instructivos oficiales en PDF son capturas de pantalla y no se pudieron leer de forma automática, así que **los campos exactos del formulario no están verificados**. Lo que sigue se basa en las páginas oficiales del trámite y en el art. 21 de la Ley 25.326.

## 1. Por qué hay que inscribirla

- La Ley 25.326 (art. 21) obliga a inscribir en el registro de la autoridad de control todo archivo o base privada «destinado a proveer informes».
- El Decreto 1558/2001 (anexo I, art. 1) aclara que quedan comprendidos los que **exceden el uso exclusivamente personal**, sea gratis o pago. La base de cuentas y comunidad de [NOMBRE DE LA APP] excede el uso personal del titular.
- Además, la inscripción es una condición de «lista para Android» en `docs/plan/objetivo.md`.

## 2. Cuándo hacerlo

**Antes de recopilar el primer dato real**, es decir, antes de abrir la prueba cerrada con cuentas reales (etapa 4 de `docs/tecnico/decision-servidor-empaquetado-cobros.md`). Las 12 personas de la prueba ya son titulares de datos.

Conviene tener resuelto antes:
- **El proveedor y la región del servidor** (T02): se declaran como destino y transferencia internacional.
- **La herramienta de cobros** (T04) y **el proveedor de correo**.
- **La decisión sobre la edad** (N-01): cambia si se recopila la fecha de nacimiento de todos o solo de quienes entran al Club.
- **El nombre de la app** (T01): el nombre y la finalidad de la base **no se pueden modificar después** de confirmado el trámite. Por eso conviene que el nombre de la base no dependa del nombre de la app (ver la sección 5).

## 3. Qué necesitás

- **CUIT o CUIL con clave fiscal de ARCA (ex AFIP), nivel 2 o superior.** Las páginas de la AAIP todavía dicen «clave fiscal de AFIP».
- Haber ingresado al menos una vez a **Trámites a Distancia (TAD)**: https://tramitesadistancia.gob.ar
- **Un correo electrónico válido**, cargado en «Datos del solicitante» de TAD. Es el medio oficial de comunicación con la AAIP. Puede ser el personal: el de soporte quizás todavía no exista (P12).
- La página del responsable pide adjuntar «estatuto y/o contrato social» como documentación respaldatoria. Eso es para personas jurídicas. Para una persona humana, si el formulario exige adjuntar algo, probablemente alcance con el DNI (**no verificado**: confirmalo en el formulario o con registrobasesdedatos@aaip.gob.ar).
- **Costo: gratuito.**

## 4. Paso a paso

### Paso 1. Inscribirte como responsable

1. Entrá a TAD con tu clave fiscal.
2. Buscá el trámite **«Inscripción del Responsable al Registro Nacional de Bases de Datos»** e inicialo.
3. En «Identificación del Responsable de la base de datos», elegí **«privado»**.
4. Completá el formulario «Datos del trámite». Instructivo oficial: https://www.argentina.gob.ar/sites/default/files/2018/07/instructivo_tad_responsable_priv.pdf
5. Confirmá el trámite.
6. Vas a recibir por correo el **código de registro del responsable**. Guardalo: se pide en todos los trámites posteriores. Si lo perdés, está en la solapa «Notificaciones» de TAD.

La inscripción del responsable no tiene vencimiento.

### Paso 2. Registrar la base de datos

1. En TAD, buscá **«Inscripción de bases de datos privadas»** e inicialo.
2. Cargá tu CUIT y el número de registro del responsable.
3. Completá los campos con la tabla de la sección 5.
4. Leé la declaración jurada y marcá «leído». **La inscripción tiene carácter de declaración jurada.**
5. Confirmá el trámite.
6. Esperá la aprobación. La constancia con el **número de registro de la base** llega por correo.

Instructivos oficiales:
- https://www.argentina.gob.ar/sites/default/files/2018/07/instructivo_tad_bases_priv.pdf
- https://www.argentina.gob.ar/sites/default/files/instructivo_tad_inscripcionymodificacion_basesprivadas_3.pdf

### Paso 3. Después de la aprobación

- Descargá el **certificado de inscripción con código QR** (enlace en la página de trámites de la AAIP).
- Pasale el número de registro de la base a Legal: va en la política de privacidad, en el marcador [N.º DE INSCRIPCIÓN EN LA AAIP].

**Plazo de aprobación:** la AAIP no lo informa. Si hay observaciones, se comunica por correo. Presentalo con margen antes de la prueba cerrada.

## 5. Qué declarar: propuesta de respuestas

El art. 21, inc. 2, de la Ley 25.326 enumera lo que tiene que contener la inscripción. Abajo, una propuesta para cada punto. **Ajustala a los campos reales del formulario** y a las decisiones pendientes.

| Punto (art. 21) | Propuesta |
|---|---|
| Nombre de la base | «Usuarios de la app de lectura y su comunidad». Evitá el nombre comercial mientras T01 esté abierta, porque el nombre no se puede cambiar después |
| Responsable y domicilio | [TITULAR Y DOMICILIO], persona humana |
| Características y finalidad | Gestión de cuentas de usuarios de una app de lectura. Publicación de reseñas y de un foro de lectores. Control de edad para el foro. Gestión de suscripciones pagas. Moderación de contenido y seguridad del servicio. Atención de consultas y de derechos de los titulares. **La finalidad no se puede modificar después**: incluí desde el principio todo lo que esté previsto |
| Naturaleza de los datos | Identificatorios: correo electrónico, nombre de usuario e identificador interno. Fecha de nacimiento. Credenciales (hash de la contraseña). Contenido publicado por el usuario. Datos de suscripción y compra, **sin datos de tarjeta**. Registros técnicos con dirección IP. Denuncias y bloqueos |
| ¿Datos sensibles? | **No** se recaban. Aclaración posible: el contenido que publican los usuarios podría revelar opiniones o creencias por decisión de ellos; no se los solicita ni se los clasifica |
| ¿Antecedentes penales o contravencionales? | No |
| Forma de recolección y actualización | Los provee el propio titular al registrarse y al usar la app. Los datos de compra los informa Google Play. Los actualiza el titular desde la app o por pedido a soporte |
| Destino y cesiones | **Sin cesiones** a terceros para sus propios fines. Encargados de tratamiento (Ley 25.326, art. 25): [PROVEEDOR DEL SERVIDOR Y PAÍS], [PROVEEDOR DE CORREO Y PAÍS] y [HERRAMIENTA DE COBROS Y PAÍS]. Google actúa como responsable independiente de lo que recopila en Google Play |
| Transferencias internacionales | Sí. Países: [país de la región del servidor], Estados Unidos y Singapur (según la lista de subencargados del proveedor). Mecanismo: el de N-02 (consentimiento expreso y contratos con los proveedores) |
| Interrelación con otras bases | Ninguna |
| Medidas de seguridad | Cifrado en tránsito (TLS). Contraseñas con hash. Control de acceso por fila en la base. Acceso administrativo solo del titular, con verificación en dos pasos. Copias de seguridad diarias. Registro de accesos. Referencia: medidas recomendadas de la Resolución AAIP 47/2018 |
| Categorías de personas con acceso | Solo el titular. Más adelante, el Community Manager para moderación, con acceso limitado. Si se suma, hay que actualizar la inscripción |
| Tiempo de conservación | Mientras la cuenta exista, y los plazos de la sección 8 de la política de privacidad |
| Forma de ejercer los derechos | Desde la app, o por correo a [CORREO DE SOPORTE] desde el correo de la cuenta. Acceso en 10 días corridos (art. 14) y rectificación o supresión en 5 días hábiles (art. 16) |
| Cantidad estimada de registros | Si el formulario la pide: la estimación de usuarios de `docs/tecnico/` (300 a 10.000 activos por mes) |

**¿Una base o varias?** Propongo **una sola**, que incluya cuentas, comunidad, suscripciones, moderación y soporte: comparten finalidad general, titulares y sistema. Si más adelante se suma la medición de uso (P20) con otro proveedor, se evalúa si conviene una base aparte o una modificación.

**Lo que no se declara:** los documentos, su texto y el progreso de lectura. Quedan en el dispositivo y el titular no tiene acceso a ellos.

## 6. Mantenerla al día

- **No hay renovación anual.** La inscripción no tiene vencimiento (página oficial del trámite). Según una fuente secundaria, la Resolución AAIP 132/2018 eliminó la renovación y exige modificar la inscripción cuando la base cambia.
- **Hay que modificarla** («Modificar bases privadas» en TAD) cuando cambie algo declarado:
  - otro proveedor de servidor, de correo o de cobros, u otra región;
  - nuevos datos, por ejemplo la medición de errores (P20) o la sincronización de la biblioteca (N-14);
  - nuevas personas con acceso (el Community Manager);
  - cambios en la conservación;
  - un cambio de responsable, por ejemplo si se crea una sociedad (D03). En ese caso, probablemente haga falta inscribir al nuevo responsable y dar de baja la base anterior (**a confirmar**).
- Si cambia el domicilio o el correo del titular, se modifica el **responsable** («Modificar datos de un responsable de bases de datos personales privadas»).
- Si el servicio cierra: primero se da de baja la base y después el responsable (en TAD, «Baja de responsable en el Registro Nacional de Bases de Datos», con clave fiscal nivel 2).

## 7. Obligaciones relacionadas, fuera del trámite

| Obligación | Norma | Dónde se resuelve |
|---|---|---|
| Informar en un lugar visible, antes de recabar los datos, lo que exige el art. 6 de la ley, más la leyenda de la AAIP | Res. AAIP 14/2018, arts. 2 y 3 | Política de privacidad, sección 10. Enlace visible en el registro de la app |
| Mecanismo para las transferencias internacionales | Ley 25.326, art. 12; Decreto 1558/2001, art. 12; Disp. DNPDP 60/2016; Res. AAIP 198/2023 | N-02 |
| Presentar ante la AAIP, dentro de los 30 días corridos desde la firma, los contratos de transferencia que no sigan los modelos aprobados | Página oficial de transferencias internacionales de la AAIP | Solo si el titular elige ese camino (N-02). Se envía a datospersonales@aaip.gob.ar |
| Contrato con cada encargado: solo actúa según instrucciones, con seguridad y confidencialidad | Ley 25.326, art. 25; Decreto 1558/2001, art. 25 | Aceptar el contrato de tratamiento (DPA) de cada proveedor y guardar una copia |
| Medidas de seguridad | Ley 25.326, art. 9; Res. AAIP 47/2018 (recomendadas) | Servidor |
| Responder los pedidos de acceso (10 días corridos) y de rectificación o supresión (5 días hábiles) | Ley 25.326, arts. 14 y 16 | Proceso de soporte (N-23) |

## 8. Lista de control para el titular

- [ ] Clave fiscal nivel 2 o superior y acceso a TAD.
- [ ] T02, T04, el proveedor de correo y la región decididos.
- [ ] N-01 (edad) y N-02 (transferencias) decididos.
- [ ] Paso 1 hecho y código de responsable guardado.
- [ ] Paso 2 hecho, con el nombre y la finalidad revisados (no se pueden cambiar).
- [ ] Constancia y certificado con QR guardados.
- [ ] Número de registro pasado a Legal para la política de privacidad.
- [ ] Todo esto, **antes** de la prueba cerrada con cuentas reales.

## Contacto de la AAIP

- Registro: registrobasesdedatos@aaip.gob.ar
- Transferencias internacionales: datospersonales@aaip.gob.ar
- Ayuda de TAD: https://tramitesadistancia.gob.ar/ayuda.html

## Fuentes

Consultadas el 22/10/2026.

- AAIP, trámites de datos personales: https://www.argentina.gob.ar/aaip/datospersonales/tramites
- AAIP, inscribir un responsable de bases de datos personales privadas (gratuito; clave fiscal nivel 2; sin vencimiento; código de responsable): https://www.argentina.gob.ar/servicio/inscribir-un-responsable-de-bases-de-datos-personales-privadas
- AAIP, registrar bases de datos personales privadas (gratuito; «Inscripción de bases de datos privadas»; sin vencimiento; modificar si cambia): https://www.argentina.gob.ar/registrar-bases-de-datos-personales-privadas
- AAIP, transferencias internacionales: https://www.argentina.gob.ar/transferencias-internacionales
- Ley 25.326, arts. 9, 12, 14, 16, 21 y 25: https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/texact.htm
- Decreto 1558/2001, anexo I, arts. 1, 12 y 25: https://servicios.infoleg.gob.ar/infolegInternet/anexos/70000-74999/70368/norma.htm
- Resolución AAIP 14/2018: https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-14-2018-307621/texto
- Resolución AAIP 132/2018 (procedimiento por TAD, sin renovación anual, declaración jurada). Fuente secundaria: https://www.marval.com/Publicacion/nueva-resolucion-sobre-registro-de-bases-de-datos-personales-13255
- Resolución AAIP 47/2018 (medidas de seguridad recomendadas): https://www.argentina.gob.ar/normativa/nacional/resolución-47-2018-312662/texto
- Campos del formulario (finalidad y nombre no modificables; datos sensibles y antecedentes): resultados de búsqueda sobre los instructivos oficiales. **No verificado** en el formulario.
