# Normas de la comunidad de [NOMBRE DE LA APP]

> **Borrador para revisión del titular. No publicar todavía.**
> - Requiere que la moderación esté implementada (P05): denunciar, bloquear, filtro y cola de revisión. Lo que estas normas prometen tiene que coincidir con lo que la app y el servidor hacen.
> - Lo que está entre corchetes es un marcador pendiente. Los bloques «Nota de revisión» y la sección «Fuentes» no se publican ni se traducen.

Vigentes desde: [FECHA DE VIGENCIA]

[NOMBRE DE LA APP] es un lugar para hablar de libros y de lo que escribimos. Estas normas valen para:
- las **reseñas**;
- las **conversaciones y respuestas** del Reading Club;
- los **nombres de usuario**.

Forman parte de los términos y condiciones. Las aceptás antes de publicar por primera vez.

## 1. Lo que esperamos

- Hablá de los libros, de las ideas y de los textos, no de las personas que opinan distinto.
- Criticá con argumentos. Se puede decir que un libro no te gustó sin agredir a nadie.
- Avisá los spoilers (sección 3).
- Citá con medida y diciendo de dónde sale la cita (sección 4).
- Cuidá tus datos y los de los demás.

## 2. Qué está prohibido

### 2.1. Contenido ilegal o que pone en riesgo a personas

- **Cualquier contenido sexual que involucre a menores de edad**, en texto o en enlaces. Tolerancia cero: se elimina, se cierra la cuenta y se informa a las autoridades.
- Intentar contactar a una persona menor de edad con fines sexuales, o pedirle datos o imágenes.
- Amenazas, incitación a la violencia o apología de delitos.
- Datos que faciliten cometer delitos o instrucciones para cometerlos.
- Contenido que promueva o glorifique el suicidio, las autolesiones o los trastornos de la conducta alimentaria. Hablar de un libro que trata esos temas está permitido; promoverlos, no. Si estás pasando un mal momento, buscá ayuda: [RECURSOS DE AYUDA POR PAÍS].

### 2.2. Ataques a otras personas

- Acoso, hostigamiento, insultos o intimidación, también si son repetidos o coordinados con otras cuentas.
- Discriminación o discurso de odio por origen, nacionalidad, color de piel, religión, género, orientación sexual, discapacidad, edad u otra condición.
- **Publicar datos personales de otras personas sin su permiso:** nombre completo, dirección, teléfono, correo, escuela, trabajo, documentos o fotos.
- Afirmar hechos falsos sobre una persona real para dañar su reputación.

### 2.3. Contenido sexual explícito y violencia gratuita

- No se permite contenido sexual explícito ni pornográfico.
- No se permiten descripciones de violencia extrema cuyo único fin sea impactar.
- Podés hablar de libros con temas adultos (sexualidad, violencia, guerra, adicciones) sin reproducir descripciones explícitas.

### 2.4. Derechos de autor

- Copiar capítulos, cuentos o poemas completos, o fragmentos que superen lo permitido para citar (sección 4).
- Compartir enlaces a copias no autorizadas de libros, o pedirlas.
- Publicar como propio un texto de otra persona.

### 2.5. Engaño y abuso del servicio

- Hacerse pasar por otra persona, por un autor o por el equipo de [NOMBRE DE LA APP].
- Reseñas falsas o pagadas. Si sos autor del libro, trabajás en su edición o tenés otro interés en él, decilo en la reseña.
- Publicidad no pedida, cadenas, spam, enlaces engañosos, intentos de robar contraseñas o archivos dañinos.
- Usar varias cuentas para darte likes, manipular el orden de las reseñas o evadir un bloqueo o una suspensión.
- Intentar acceder a cuentas ajenas o a partes del servicio que no te corresponden.

### 2.6. Nombres de usuario

No pueden ser ofensivos, imitar a otra persona ni contener datos personales de terceros.

> **Nota de revisión.** Google Play exige que los términos «definan el contenido objetable» y que la app actúe contra él. Para el contenido sexual, se eligió prohibirlo del todo en lugar de usar la excepción de contenido «incidental». Esa excepción exige ocultarlo detrás de filtros y verificar la edad (política de UGC de Google Play). Prohibirlo es más simple y más coherente con la presencia de menores (N-01).

## 3. Spoilers

- **En las reseñas:** si contás partes importantes de la trama o el final, marcá la opción **«Contiene spoilers»**. La reseña queda tapada hasta que cada persona decida verla.
- **En el Reading Club:** escribí **[SPOILER]** al principio del título de la conversación y avisá antes del fragmento que lo contiene.
- Si alguien no lo avisa, podés denunciarlo con el motivo «Spoiler sin aviso». Lo más probable es que se tape o se marque, no que se elimine.

> **Nota de revisión.** El Club no tiene hoy una marca de spoiler como las reseñas (`src/community/Reviews.tsx` sí la tiene). Sugerencia para Producto: sumarla y simplificar este punto.

## 4. Citas de libros

- La ley argentina permite citar obras ajenas para comentarlas o criticarlas, incluyendo **hasta mil palabras** de una obra literaria y **solo las partes indispensables** para ese fin (Ley 11.723, art. 10).
- En [NOMBRE DE LA APP], eso significa:
  - citá solo lo que necesitás para tu comentario: en general, unas pocas líneas alcanzan;
  - la cita tiene que acompañar tu opinión, no reemplazarla;
  - indicá el título y el autor de la obra;
  - nunca superes, en total, las mil palabras de una misma obra [límite interno propuesto: [200] palabras por publicación; ver N-08].
- Si sos titular de los derechos de una obra y creés que una publicación los infringe, escribí a [CORREO DE SOPORTE] (sección 6.3).

## 5. Bloquear a otra persona

Desde el perfil o desde cualquier publicación de otra persona podés **bloquearla**. Cuando bloqueás a alguien:
- dejás de ver sus reseñas, conversaciones y respuestas;
- no puede responder en tus conversaciones ni dar like a tus reseñas;
- no se le avisa que la bloqueaste.

Podés desbloquearla cuando quieras desde «Cuenta» > «Usuarios bloqueados».

> **Nota de revisión.** Esto es una especificación para P05 (Servidor y Desarrollo). Si la implementación difiere, se ajusta el texto. Google Play exige poder bloquear usuarios en apps con contenido público de usuarios.

## 6. Cómo denunciar

### 6.1. Desde la app

Cada reseña, conversación, respuesta y nombre de usuario tiene la opción **«Denunciar»**. Elegís un motivo y, si querés, agregás un comentario. Los motivos son:
- contenido sexual o que involucra a menores;
- amenaza o riesgo para alguien;
- acoso o discriminación;
- datos personales expuestos;
- derechos de autor;
- spoiler sin aviso;
- spam o engaño;
- otro motivo.

La persona denunciada **no sabe quién la denunció**.

### 6.2. Sin la app o sin cuenta

Escribí a [CORREO DE SOPORTE] con:
- el enlace o la descripción del contenido (título, nombre de usuario y fecha);
- el motivo;
- tus datos de contacto.

### 6.3. Si sos titular de derechos o de los datos afectados

Si el contenido infringe tus derechos de autor o publica tus datos personales:
1. escribí a [CORREO DE SOPORTE];
2. identificá la obra o los datos afectados y el contenido que los infringe;
3. indicá en qué carácter reclamás (por ejemplo, autor, editorial o titular de los datos);
4. agregá una declaración de que la información es correcta.

Si el reclamo es por datos personales, también tenés los derechos de la política de privacidad.

### 6.4. Autoridades

Los pedidos de autoridades judiciales o administrativas se reciben en [CORREO DE SOPORTE] y se responden según la ley.

## 7. Qué pasa después de una denuncia

1. **Acuse de recibo.** La app te confirma que la denuncia se recibió.
2. **Revisión.** Una persona revisa el contenido denunciado, el contexto y estas normas.
   - **Casos graves** (contenido sexual con menores, amenazas, riesgo para la vida o la integridad de alguien, datos personales expuestos): se revisan **lo antes posible y dentro de las [24 horas]**. Mientras tanto, el contenido puede ocultarse de forma preventiva.
   - **Demás casos:** dentro de los **[3 días hábiles]**.
3. **Decisión.** Puede ser:
   - no hacer nada, si no hay incumplimiento;
   - tapar el contenido como spoiler;
   - retirar el contenido;
   - advertir a quien lo publicó;
   - suspender su posibilidad de publicar por [7] o [30] días;
   - cerrar la cuenta.
   La medida depende de la gravedad y de si es una falta repetida.
4. **Aviso a quien publicó.** Se le informa qué se decidió, qué norma se incumplió y cómo apelar.
5. **Aviso a quien denunció.** Se le informa el resultado, sin detalles personales de la otra persona.
6. **Autoridades.** El contenido sexual con menores, las amenazas graves y los riesgos para la vida se informan a las autoridades competentes. En esos casos se conserva solo lo que la ley o la autoridad indiquen.

**Casos dudosos.** A veces no está claro si un contenido es ilícito. Por ejemplo, cuando alguien dice que una reseña lo difama, o cuando se discute si una cita supera lo permitido. En esos casos:
- se pueden pedir más datos a las partes;
- el contenido se retira si incumple estas normas;
- si no las incumple y la ilicitud no es evidente, puede hacer falta una orden de autoridad competente.

Así lo prevé, para los intermediarios de Internet, la Corte Suprema en «Rodríguez, María Belén c/ Google Inc.» (2014).

**Excepciones al aviso.** No se avisa a quien publicó, o se avisa más tarde, si el aviso pudiera poner en riesgo a alguien o una investigación de una autoridad.

## 8. Cómo apelar

- Si se retiró tu contenido o se sancionó tu cuenta y no estás de acuerdo, podés **apelar dentro de los [15] días** desde el aviso.
- Se apela desde el enlace del aviso o escribiendo a [CORREO DE SOPORTE], explicando por qué creés que la decisión es incorrecta.
- La apelación se revisa de nuevo con lo que aportes y se responde dentro de los **[10] días hábiles**.
- Si se te da la razón, se restablece el contenido o se levanta la sanción.

## 9. Faltas repetidas

Las faltas se acumulan. Para las faltas leves, la escala orientativa es:
1. advertencia;
2. suspensión de [7] días;
3. suspensión de [30] días;
4. cierre de la cuenta.

Las faltas graves de la sección 2.1 pueden llevar al cierre inmediato.

Si se cierra tu cuenta por una falta grave, no podés crear otra.

## 10. Protección de las personas menores de edad

- El Reading Club es solo para personas de 16 años o más.
- [Según N-01: para tener una cuenta hay que tener 13 años o más.]
- En [NOMBRE DE LA APP] no hay mensajes privados ni fotos de perfil.
- Las denuncias que involucran a menores se tratan como casos graves.
- Si sabés que una persona menor está en riesgo, además de denunciar en la app, avisá a las autoridades de tu país.

## 11. Contacto

[TITULAR Y DOMICILIO] — [CORREO DE SOPORTE] — [SITIO WEB]

---

## Correspondencia con los requisitos de las tiendas (no se publica)

| Requisito | Fuente | Dónde se cumple |
|---|---|---|
| Aceptar los términos o normas antes de crear o subir contenido | Google Play, política de UGC | Introducción y sección 2 de los términos (aceptación expresa antes de publicar) |
| Definir y prohibir el contenido y las conductas objetables | Google Play, UGC | Sección 2 |
| Sistema de denuncia dentro de la app | Google Play, UGC; Apple 1.2 | Sección 6.1 (P05) |
| Bloquear usuarios y contenido en apps con UGC público | Google Play, UGC; Apple 1.2 | Sección 5 (P05) |
| Moderación «robust, effective, and ongoing» y medidas contra contenido o usuarios | Google Play, UGC | Secciones 7 y 9 |
| Protección frente a amenazas y acoso, en especial hacia menores | Google Play, UGC | Secciones 2.1, 2.2 y 10 |
| Filtro de material objetable antes de publicarse | Apple 1.2 | Filtro automático (sección 4 de la política de privacidad; P05) |
| Respuesta oportuna a las denuncias | Apple 1.2 | Plazos de la sección 7 |
| Información de contacto publicada | Apple 1.2 | Sección 11 |
| Actuar ante el conocimiento efectivo; notificación privada si la ilicitud es manifiesta, autoridad competente si es dudosa | CSJN, «Rodríguez c/ Google» (2014) | Sección 7 |

## Fuentes (no se publica)

Consultadas el 22/10/2026.

- Google Play, política de contenido generado por usuarios: https://support.google.com/googleplay/android-developer/answer/9876937
- App Store Review Guidelines, pautas 1.2 y 1.2.1: https://developer.apple.com/app-store/review/guidelines/
- Ley 11.723, art. 10 (citas con fines didácticos o científicos; hasta mil palabras de obras literarias; solo las partes indispensables): https://www.argentina.gob.ar/normativa/nacional/ley-11723-42755/texto
- CSJN, «Rodríguez, María Belén c/ Google Inc.», 28/10/2014, Fallos 337:1174. Nota oficial del CIJ: https://www.csjn.gov.ar/archivo-cij/nota-14310-La-Corte-Suprema-de-Justicia-decidi--que-los-buscadores-de-internet-se-hallan-protegidos-por-la-libertad-de-expresi-n.html. Análisis: https://abogados.com.ar/analisis-del-fallo-rodriguez-maria-belen-c-google-inc-sdanos-y-perjuicios-corte-suprema-de-justicia-de-la-nacion-28102014/15712
- Ley 26.061, arts. 3, 22 y 24: https://servicios.infoleg.gob.ar/infolegInternet/anexos/110000-114999/110778/norma.htm
