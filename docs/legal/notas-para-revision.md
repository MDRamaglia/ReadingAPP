# Notas para la revisión del titular (P04 y P16)

Preparó: Legal, el 22 y 23/10/2026. Fuentes oficiales consultadas el 22/10/2026, salvo indicación (lista al final).

Acompañan a cuatro borradores:
- `politica-de-privacidad.md`
- `terminos-y-condiciones.md`
- `normas-de-la-comunidad.md`
- `guia-aaip.md`

Ninguno está listo para publicar: describen la app con el servidor real, la moderación y el cobro, que todavía no existen (P02, P05 y P08).

## 1. Qué tenés que decidir

| # | Decisión | Propuesta | Urgencia |
|---|---|---|---|
| **N-01** | Edad para tener cuenta (revisar D09) | **Opción B:** la lectura sin cuenta sigue abierta a todas las edades. La cuenta exige 13 años o más, con la fecha de nacimiento pedida en el registro. El Club sigue desde los 16. En Brasil, 16 años hasta verificar el ECA Digital | Alta: cambia el registro (P06), la declaración de público objetivo (P14) y los textos |
| **N-02** | Región del servidor y mecanismo de transferencia | **Región en la UE**, más consentimiento expreso para lo que va a EE. UU. y Singapur, contratos de los proveedores y minimización | Alta: la región no se cambia después (T02) |
| N-03 | Plazos de conservación | Los de la sección 8 de la política. El borrado, dentro de los 5 días hábiles | Media |
| N-04 | Arrepentimiento y reembolsos | Reconocer los 10 días sin restricciones, con botón en la app y en la web | Media |
| N-05 | Fecha de nacimiento: corrección | Una corrección por pedido a soporte, con verificación solo si habilita el Club | Media |
| N-06 | Borrado en cascada de respuestas ajenas | Mantenerlo e informarlo (ya está en los textos) | Media |
| N-07 | Reseñas al borrar la cuenta | Borrarlas, no anonimizarlas | Baja |
| N-08 | Límite interno de citas | 200 palabras por publicación, por debajo del tope legal de mil | Baja |
| N-09 | Plazos de moderación y quién modera | 24 horas para los casos graves y 3 días hábiles para el resto. Ocultamiento preventivo con 3 denuncias | Alta antes de la prueba cerrada |
| N-10 | Vender premium en la web propia | No al lanzamiento | Baja |
| N-12 | Responsabilidad personal (D03) | Seguro o sociedad, a evaluar con el contador | Media |
| N-14 | Sincronizar la biblioteca | No sincronizar documentos. A lo sumo, la cantidad | Media |
| N-16 | Países (T07) | Sin la UE ni el Reino Unido. Brasil y EE. UU. con las condiciones indicadas | Alta |

Los demás puntos (N-11, N-13, N-15 y N-17 a N-23) son aclaraciones o pedidos a otros roles.

## 2. Registro y tono de los textos

- **Segunda persona con voseo**, como el resto de la app (`CLAUDE.md`). La ley exige que la información sea «cierta, clara y detallada» (Ley 24.240, art. 4) y que las cláusulas predispuestas sean «comprensibles y autosuficientes» (CCyC, art. 985). Hablarle al usuario de «vos», con oraciones cortas, cumple mejor que el registro impersonal.
- **«El responsable» en lugar de «nosotros».** El titular es una persona humana (D03): «nosotros» sugiere una empresa que no existe. Es, además, el término de la Ley 25.326. Si más adelante se crea una sociedad, alcanza con cambiar la definición de la sección 1.
- **Evité «titular» para referirme a vos**, porque en la Ley 25.326 «titular de los datos» es el usuario.
- **Pensado para traducir.** Sin modismos ni juegos de palabras. «Dar de baja» aparece solo donde la norma usa «baja» (botón de baja). Las normas se citan con número y artículo y no se traducen.
- **Si se elige español neutro para el resto de Latinoamérica (T06),** la conversión del voseo al tuteo es mecánica. Las referencias legales siguen siendo argentinas, porque la ley aplicable es la argentina.

## 3. Marcadores

Los cinco del encargo: `[NOMBRE DE LA APP]`, `[TITULAR Y DOMICILIO]`, `[CORREO DE SOPORTE]`, `[PROVEEDOR DEL SERVIDOR Y PAÍS]` y `[SITIO WEB]`.

Agregué estos (N-11):
- `[FECHA DE VIGENCIA]`.
- `[N.º DE INSCRIPCIÓN EN LA AAIP]`: sale del paso 2 de la guía.
- `[PROVEEDOR DE CORREO Y PAÍS]` y `[HERRAMIENTA DE COBROS Y PAÍS]`: la propuesta de Servidor separa el correo (Resend u otro) y RevenueCat.
- `[PAÍS DE LA REGIÓN]`.
- `[RECURSOS DE AYUDA POR PAÍS]`: líneas de ayuda en crisis. Hay que verificarlas una por una antes de publicarlas.
- Números entre corchetes (plazos, cantidades): propuestas que se confirman en N-03, N-09 y la sección 6 de los términos.

## 4. N-01. Análisis de D09: menores registrados

### 4.1. Situación de hecho

- **D09:** el registro está abierto a cualquier edad y el Reading Club exige 16 años o más.
- **En el código** (verificado el 22/10/2026):
  - el registro pide solo nombre de usuario, correo y contraseña (`SignUpPage` en `src/account/AccountPages.tsx`);
  - la fecha de nacimiento se pide la primera vez que alguien entra al Club, queda fija y, si da menos de 16, bloquea el Club (`src/community/Club.tsx`, `src/lib/access.ts`, `setBirthDate` en `src/services/localBackend.ts`).
- **Consecuencia:** la app **no sabe la edad de quien publica reseñas**. Puede haber cuentas de menores de 13 años, con correo y reseñas públicas. Y si uno de ellos intenta entrar al Club, su fecha de nacimiento le da al responsable **conocimiento efectivo** de que la cuenta es de un menor de 13.
- **Requisitos de tiendas** (`docs/requisitos/google-play.md`, sección 3) recomienda declarar 13-15, 16-17 y 18 o más en Play. Le pide a Legal que evalúe una pregunta de edad neutral al registrarse, para que los menores de 13 puedan leer pero no publicar. Este análisis llega a una conclusión compatible.

### 4.2. Frente 1: consentimiento y Ley 25.326

1. **La Ley 25.326 no fija una edad para consentir.** Exige un consentimiento «libre, expreso e informado» (art. 5, inc. 1). La base de las cuentas es la excepción de la relación contractual (art. 5, inc. 2, d). Las dos cosas remiten a la capacidad del CCyC (frente 2).
2. **Menores de 13.** Sus actos lícitos son involuntarios por falta de discernimiento (CCyC, art. 261, inc. c). No hay contrato válido que sostenga el art. 5, inc. 2, d, ni un consentimiento propio válido. Hace falta el de sus representantes (CCyC, art. 26). Con D09 tal como está, la app trataría correos y publicaciones de menores de 13 **sin base legal válida**, y no tiene cómo obtener la autorización de los padres.
3. **De 13 a 17.** Rige la autonomía progresiva (CCyC, arts. 26 y 639). Es razonable sostener que un adolescente puede consentir el tratamiento que exige una cuenta gratuita de lectura. **Es discutible:** no hay una norma ni un criterio vinculante de la AAIP sobre la edad para consentir.
   - Solo encontré las guías «Nuestro Mundo Digital» de 2024, que no son vinculantes (fuente secundaria).
   - Un proyecto de reforma en trámite (expediente 3397-D-2026, fuente secundaria) regularía el tema. No es ley.
4. **El consentimiento para la transferencia internacional** (N-02) también lo da cada usuario. Si es adolescente, el consentimiento es más débil. Es otra razón para dejar la base principal en un país adecuado.
5. **Ley 26.061.**
   - Prohíbe exponer o difundir datos o imágenes que identifiquen a niñas, niños y adolescentes contra su voluntad y la de sus padres, cuando afecte su dignidad o su vida privada (art. 22).
   - A la vez, reconoce su derecho a opinar y a ser oídos (arts. 19 y 24).
   - Publicar reseñas con un nombre de usuario, por decisión propia, está del lado del derecho a opinar. El riesgo está en que otros expongan sus datos: las normas lo prohíben (sección 2.2).

### 4.3. Frente 2: Código Civil y Comercial

- **Edades.** Menor de edad es quien no cumplió 18; adolescente, desde los 13 (art. 25). Regla general: los menores ejercen sus derechos por medio de sus representantes, salvo lo que la ley les permite por su edad y madurez (art. 26).
- **Contratar.**
  - El menor de 16 no puede «obligarse de otro modo» sin autorización de sus progenitores (art. 681).
  - Los contratos de escasa cuantía de la vida cotidiana se presumen hechos con su conformidad (art. 684).
  - Una cuenta gratuita encaja razonablemente en el art. 684. Una suscripción mensual de bajo precio, probablemente también. Una anual, es más dudoso.
  - Por eso los términos piden la autorización de los representantes para pagar si el usuario es menor de 18 (sección 4.5).
- **Nulidad.** Si se anula un contrato con un incapaz, la parte capaz no puede exigir la restitución de lo que pagó, salvo en la medida en que el incapaz se haya enriquecido (art. 1000). En la práctica, lo cobrado a un menor sin autorización se devuelve y no hay nada que reclamar. De ahí la cláusula de reembolso a pedido del representante (términos, sección 4.6).
- **Daños.** Los padres responden solidariamente por los daños que causen los hijos bajo su responsabilidad parental que convivan con ellos (art. 1754). Es relevante si un menor publica algo dañino.
- **Licencia sobre el contenido** (términos, sección 8). Es un acto de administración, ligado al uso cotidiano del servicio. Para un adolescente, entra razonablemente en el art. 684. **Es discutible.** Para un menor de 13 no vale (art. 261, inc. c).

### 4.4. Frente 3: público objetivo y políticas de Google Play

- **Público objetivo.**
  - Los grupos son 5 o menos, 6-8, 9-12, 13-15, 16-17 y 18 o más.
  - Toda app que incluya niños en su público objetivo debe cumplir la política de Familias.
  - Se marcan los grupos para los que la app fue **diseñada**, no los de cualquiera que pueda usarla.
  - Google advierte que los grupos de 13-15 y 16-17 pueden considerarse de niños en algunos países.
- **¿D09 obliga a declarar a los menores de 13?** No por sí sola (coincido con Requisitos). Pero **la redacción de los textos importa**:
  - si los términos invitan a los menores de 13 a registrarse con la autorización de sus padres (variante A), eso indica que la app está pensada también para ellos;
  - y Google revisa que la declaración sea exacta.
  - Con D09 literal, declarar 13 o más y a la vez aceptar a menores de 13 queda en tensión.
- **Si se incluyera a los menores de 13 (Familias):**
  - todo el contenido de usuarios accesible tendría que ser apto para niños;
  - habría que cumplir COPPA y el RGPD;
  - haría falta un recordatorio de seguridad;
  - los adultos tendrían que poder administrar las funciones sociales;
  - y haría falta una «acción de un adulto» antes de que un niño intercambie datos.
  Con reseñas libres de libros de todo tipo y un foro, es una carga desproporcionada.
- **Contenido de usuarios.**
  - La política exige salvaguardas contra amenazas y acoso, «particularly toward minors».
  - Admitir contenido sexual «incidental» obliga a ocultarlo y a verificar la edad. Las normas lo prohíben (sección 2.3).
- **Pantalla de edad neutral.**
  - Google la define como la que no incentiva a mentir: fecha escrita libremente y sin indicar qué edad hace falta.
  - Hoy la portada del Club anuncia «16 años o más» antes de pedir la fecha. El bloqueo de la fecha una vez cargada lo compensa en parte (N-15).
- **Leyes de edad en las tiendas.** Brasil (ECA Digital) y Texas (SB 2420). Google ofrece Play Age Signals API, que en Brasil devuelve la franja de edad desde el 17/03/2026, según Requisitos. Le toca al desarrollador determinar si la ley lo alcanza (frente 4).

### 4.5. Frente 4: normas extranjeras (inglés y portugués)

**Estados Unidos: COPPA.**
- Alcanza a los servicios dirigidos a menores de 13 y a los que tienen **conocimiento efectivo** (*actual knowledge*) de que recopilan datos personales de menores de 13 (FTC).
- La regla se modificó el 22/04/2025. El plazo general de adecuación vence alrededor del 22/04/2026; no confirmé la fecha exacta en el texto publicado.
- **Riesgo concreto con D09:** si un menor de 13 de EE. UU. carga su fecha al intentar entrar al Club, el responsable sabe que tiene la cuenta y el correo de un menor de 13. Debería borrarlos o pedir el consentimiento verificable de los padres.
- Que la regla alcanza a operadores extranjeros que se dirigen a niños de EE. UU. o recopilan sus datos a sabiendas: **no lo verifiqué** en el texto de la regla.
- **Leyes estatales de tiendas** (Texas SB 2420, y también Utah y Luisiana según Google): exigen usar la franja de edad y la aprobación de los padres que informa la tienda. Relevante si se publica en EE. UU. Hay que sumar el riesgo alto de marca en EE. UU. (`busqueda-de-marca.md`).

**Unión Europea: RGPD, art. 8.**
- En los servicios de la sociedad de la información ofrecidos a niños, el consentimiento propio vale desde los 16 años. Los Estados pueden bajar esa edad hasta 13. Por debajo, consiente quien ejerce la patria potestad, y el responsable debe hacer esfuerzos razonables para verificarlo.
- Aplica si se ofrece el servicio a personas en la UE (art. 3.2), y en ese caso también hay que designar un representante (art. 27).
- T07 propone no lanzar en la UE. El Reino Unido tiene reglas propias que **no verifiqué**.

**Brasil: LGPD y ECA Digital.**
- **LGPD, art. 14:** los datos de niños (hasta 12 años) requieren el consentimiento específico y destacado de uno de los padres. Para adolescentes rige el mejor interés.
- **Enunciado CD/ANPD 1/2023:** admite las bases de los arts. 7 y 11 si prevalece el mejor interés.
  - Hay lecturas distintas sobre la edad del consentimiento parental: una nota técnica de la ANPD lo extendería a los menores de 16 (fuente secundaria).
  - El texto de la ley no lo pude consultar: planalto.gov.br respondió con error 503 el 22/10/2026.
- **ECA Digital (Lei 15.211/2025)**, vigente desde el 17/03/2026. Según fuentes secundarias (Mayer Brown, abril de 2026; Machado Meyer):
  - alcanza a proveedores extranjeros de servicios dirigidos a menores o de «acesso provável» por ellos;
  - prohíbe la mera autodeclaración de edad para el contenido impropio para menores de 18;
  - exige vincular las cuentas de los menores de 16 a un responsable legal, ofrecer supervisión parental y configurar la privacidad más protectora por defecto;
  - obliga a los proveedores extranjeros a **designar un representante legal en Brasil**;
  - prevé multas de hasta el 10 % de la facturación en Brasil;
  - fiscaliza la ANPD: sanciones desde noviembre de 2026 y fiscalización formal desde enero de 2027.
  - **Nada de esto está verificado en el texto oficial.**
  - Con registro abierto, reseñas y la categoría «Infantil y juvenil», es razonable pensar que la app es de «acesso provável» por adolescentes.

### 4.6. Opciones

| | Opción | Ventajas | Problemas |
|---|---|---|---|
| **A** | D09 tal como está: registro sin pregunta de edad y Club desde los 16 | Sin fricción. Respeta la decisión | Cuentas de menores de 13 sin base válida (CCyC, art. 261, inc. c). Riesgo COPPA por el conocimiento que da la fecha del Club. Tensión con la declaración en Play si los textos invitan a menores de 13. En Brasil, obligaciones del ECA Digital |
| A′ | D09 más autorización de los padres para menores de 13 | Mantiene el registro abierto | Exige un mecanismo verificable (COPPA, Familias). Es prácticamente la opción D |
| **B** | Lectura sin cuenta para todas las edades. Cuenta desde los 13, con fecha de nacimiento neutral en el registro. Club desde los 16. Pago de menores de 18 con autorización. En Brasil, cuenta desde los 16 hasta verificar el ECA Digital | Elimina el problema de los menores de 13 sin cerrar la app a nadie: la lectura, que es el núcleo, no recopila datos. Coherente con declarar 13-15, 16-17 y 18 o más (Requisitos). Una sola fecha sirve para la cuenta y para el Club | Una pregunta más al registrarse. Algo de lógica por país para Brasil. Los adolescentes de 13 a 15 publican reseñas: requiere moderación atenta |
| C | Cuenta desde los 16 (vuelve a D06 para la cuenta). Lectura libre | Un solo umbral para todo. Coincide con el RGPD por defecto y con el umbral de 16 del ECA Digital | Deja afuera de las reseñas a los de 13 a 15. Contradice una decisión reciente del titular |
| D | Incluir a los menores de 13 con la política de Familias | Público más amplio | COPPA con consentimiento verificable, controles para adultos y contenido apto para niños. Desproporcionado para la app |

### 4.7. Recomendación: opción B

1. **Registro:** campo de fecha de nacimiento vacío, sin indicar en esa pantalla la edad mínima ni precargar valores. Es la pantalla neutral que describe Google.
2. **Si la fecha da menos de 13:**
   - no se crea la cuenta;
   - el servidor rechaza el alta sin guardar la fecha ni el correo (atención a los registros técnicos);
   - la app muestra un mensaje neutro: «Por ahora no podés crear una cuenta. Podés seguir leyendo sin cuenta».
   - Para evitar reintentos con otra fecha, la app puede guardar una marca **en el dispositivo**: eso no es recopilar.
3. **Club:** usa la misma fecha. Ya no hace falta pedirla al entrar, así que desaparece la tensión con la pantalla neutral (N-15).
4. **De 13 a 17:** pueden tener cuenta y publicar reseñas. Para pagar necesitan autorización (términos, sección 4). Moderación con prioridad en lo que afecte a menores.
5. **Cuentas que ya existan sin fecha** (migración P11): se les pide la fecha al próximo ingreso.
6. **Brasil:** antes de incluirlo en T07, verificar el ECA Digital. Mientras tanto, la cuenta en Brasil desde los 16, o la comunidad deshabilitada allí. Evaluar Play Age Signals API.
7. **EE. UU.:** si se incluye, evaluar Play Age Signals API para Texas y los demás estados. Considerar también el riesgo de marca.
8. **En Play:** declarar 13-15, 16-17 y 18 o más. Ficha sin elementos dirigidos a niños.
9. **Textos:** queda la variante B de la política (secciones 3.2 y 11) y de los términos (sección 4). Se borra la variante A.

Esta opción cambia lo que D09 decidió (los menores de 13 no podrían tener cuenta) y se registraría como una decisión nueva que reemplaza a D09. **La decide el titular.**

## 5. N-02. Región del servidor y mecanismo de transferencia internacional

### 5.1. Hechos

Según `docs/tecnico/`, consultado el 22/10/2026:
- **Supabase** permite elegir la región (entre otras, cuatro en la UE y São Paulo). La región no se cambia sin migrar.
  - La contraparte es Supabase Pte. Ltd., de Singapur.
  - Tiene subencargados en EE. UU.: soporte, AWS, Cloudflare, Postmark, Sentry y otros.
- **RevenueCat** guarda los datos en EE. UU. Se le pasaría solo un identificador opaco.
- **El proveedor de correo** sería estadounidense.
- **Los proveedores ofrecen las cláusulas de la UE, no los modelos de la AAIP.**

### 5.2. Derecho aplicable

- La Ley 25.326 prohíbe transferir a países sin protección adecuada (art. 12).
- El Decreto 1558/2001 (anexo I, art. 12) admite dos vías:
  - el **consentimiento expreso** del titular de los datos;
  - las **cláusulas contractuales** como fuente de protección adecuada.
- Los países adecuados están en la Disp. DNPDP 60/2016 y la Res. AAIP 34/2019: la UE, el EEE, el Reino Unido, Suiza, Canadá (sector privado), Uruguay y otros. **EE. UU., Brasil y Singapur no están.**
- **Modelos aprobados:** la Disp. 60/2016 (anexo II, prestación de servicios) y la Res. AAIP 198/2023 (modelos de la RIPD, responsable-encargado).
- La AAIP pide presentar **dentro de los 30 días corridos desde la firma** los contratos que no siguen esos modelos.
- **Para Brasil:** según `docs/tecnico/`, la Res. CD/ANPD 32/2026 reconoce a la UE y al EEE como adecuados, y para el resto rigen las cláusulas de la Res. CD/ANPD 19/2024, sin cambios. **No lo verifiqué.**

### 5.3. UE frente a São Paulo

| | Región en la UE | São Paulo |
|---|---|---|
| Base principal, usuarios argentinos | **País adecuado:** no hace falta otro mecanismo para el tramo principal | **No adecuado:** hace falta consentimiento o cláusulas para **todos** los datos |
| Base principal, usuarios brasileños | Adecuada para Brasil (según `docs/tecnico/`, sin verificar) | Los datos quedan en Brasil |
| Tramos a EE. UU. y Singapur (soporte, correo, cobros) | Hace falta mecanismo | Hace falta mecanismo |
| Si un consentimiento resulta inválido (por ejemplo, de un adolescente) | Afecta solo a los tramos secundarios | Afecta a toda la base |
| RGPD | Alojar en la UE no somete al responsable al RGPD por ese solo hecho (CEPD, Directrices 3/2018, según `docs/tecnico/`) | No aplica |
| Latencia | Mayor (sin medir). La lectura es local; la comunidad tolera unos cientos de milisegundos | Menor |

### 5.4. Recomendación

1. **Región en la UE** (Fráncfort, París, Irlanda o Estocolmo, la de mejor latencia medida desde Argentina).
2. **Consentimiento expreso** para las transferencias a EE. UU. y Singapur:
   - una casilla propia en el registro, sin marcar, que nombre los países y remita a la sección 7 de la política (N-19);
   - el servidor guarda la versión aceptada y la fecha;
   - se informa que retirarlo implica borrar la cuenta, porque sin esas transferencias el servicio no funciona.
3. **Aceptar el contrato de tratamiento (DPA) de cada proveedor** y archivarlo. Cubre lo que exige la Ley 25.326 (art. 25) aunque no sea un modelo de la AAIP.
4. **Minimización:**
   - RevenueCat recibe solo el identificador interno;
   - el proveedor de correo, solo el correo y el mensaje;
   - no activar Sentry ni otras herramientas de diagnóstico con datos personales hasta P20.
5. **Presentación ante la AAIP:** con el consentimiento como vía, **no es necesaria**, porque los 30 días rigen para los contratos que se usan como fuente de adecuación. **Es discutible.** Para la máxima cobertura, se puede presentar el DPA de Supabase dentro de los 30 días desde su aceptación. Recomiendo hacerlo solo si es simple; no es imprescindible.
6. **Si la latencia hacia la UE resultara inaceptable** (Servidor la mide en la etapa 1): São Paulo, con consentimiento para todo y la presentación del DPA de Supabase ante la AAIP como refuerzo.
7. **Brasil:** antes de lanzar allí, ver el mecanismo para los tramos a EE. UU. desde Brasil. Pueden ser las cláusulas de la ANPD o el consentimiento del art. 33 de la LGPD (no verificado).

**Debilidad del consentimiento como vía:** tiene que ser libre, y está atado a la prestación del servicio. Se sostiene porque la transferencia es necesaria para ese servicio, pero un tribunal o la AAIP podrían verlo distinto. Es un riesgo moderado.

## 6. N-03. Plazos de conservación

| Datos | Propuesta | Por qué |
|---|---|---|
| Cuenta, tras un pedido de borrado | 5 días hábiles | La supresión debe hacerse en ese plazo (Ley 25.326, art. 16). Google pide además informar el plazo |
| Copias de seguridad | Hasta 7 días | Plan Pro de Supabase (`docs/tecnico/`). Durante ese tiempo, solo se usan para restaurar |
| Registros con IP | 7 días | Supabase Pro |
| Compras | 5 años | Obligaciones impositivas. **Confirmar con el contador**: no verifiqué la norma ni el plazo |
| Denuncias y moderación | 1 año desde el cierre | Para apelaciones y reincidencia. Propuesta |
| Identificador de una cuenta cerrada por falta grave | Mientras dure la sanción | Para impedir que se abra otra cuenta. Una versión cifrada (hash) del correo, nada más |
| Contenido retirado | 90 días | Para apelaciones y reclamos. El contenido sexual con menores no se conserva salvo indicación de la autoridad |
| Soporte y pedidos de derechos | 2 años | Prueba de lo respondido. Propuesta |
| Cuentas inactivas | Sin plazo, por ahora | Opción: avisar y borrar tras [3] años sin uso, por el principio de destruir lo que deja de ser necesario (Ley 25.326, art. 4). Decisión del titular |

## 7. N-04. Arrepentimiento y reembolsos

- **El derecho existe.** La contratación por Google Play desde Argentina es un contrato a distancia: rigen los 10 días corridos, que no se pueden renunciar (Ley 24.240, art. 34; CCyC, arts. 1105, 1110 y 1111).
- **En Argentina, el titular es el comerciante registrado frente al usuario.** Google lo es solo en los países europeos de su lista. Argentina, Brasil, EE. UU., Canadá, México y Chile no figuran. Por eso el titular es el proveedor frente a la Ley 24.240.
- **Excepciones discutibles:**
  - **CCyC, art. 1116, inc. b:** se refiere a ficheros informáticos que se descargan «para su uso permanente». Una suscripción es un acceso temporal y renovable, así que probablemente no encaja.
  - **Disp. 954/2025, art. 3, inc. b:** excluye del botón el servicio «ya utilizado». Pero una disposición no puede restringir un derecho legal: es discutible que alcance al derecho de fondo.
- **Propuesta:** reconocerlo sin restricciones y devolver el total (términos, sección 7.6). El costo es bajo y evita reclamos.
- **Renovaciones:** el plazo corre desde la celebración del contrato. La renovación es continuación del mismo contrato, así que no abre un nuevo plazo. **Es discutible.** Con prueba gratuita, propongo contar los 10 días también desde el primer cobro.
- **Botones:** la Disp. 954/2025 habla de «páginas web o formato similar». Una app puede considerarse un formato similar. Propongo los dos botones (arrepentimiento y baja):
  - en «Cuenta» dentro de la app;
  - en [SITIO WEB];
  - sin registro previo, con confirmación y código dentro de las 24 horas (arts. 1, 4 y 5);
  - con verificación de identidad razonable (Disp. 3/2026).
- **Cómo se reembolsa:** desde Play Console (DDA, §3.8). Google ya reembolsa solo dentro de las 48 horas.
- **Brasil:** el derecho de arrepentimiento del Código de Defensa del Consumidor es de 7 días (art. 49). **No lo verifiqué**: planalto.gov.br no respondió. Agregarlo en la versión en portugués.

## 8. N-05. Fecha de nacimiento

- **Minimización.** Servidor preguntó si alcanza con guardar «mayor de 16». No alcanza: quien hoy tiene 15 tiene que poder entrar cuando cumpla 16. Además, con la opción B hace falta el umbral de 13. La fecha es el dato mínimo pertinente (Ley 25.326, art. 4).
- **Rectificación.** Que la fecha no se pueda cambiar desde la app es razonable para que nadie esquive el límite. Pero el art. 16 garantiza la rectificación. Propuesta:
  - una corrección por pedido a soporte, con una declaración;
  - si la corrección **habilita** el Club (de menos de 16 a 16 o más), se pide ver un documento y la imagen se borra después de verificar;
  - si la corrección no habilita nada, alcanza la declaración.
- **Ya está reflejado** en la política (sección 3.2) y en los términos (sección 4.7).

## 9. N-06. Borrado en cascada

- En el esquema de referencia de `docs/backend.md`, borrar una conversación borra sus respuestas (`on delete cascade`). Borrar una cuenta borra sus conversaciones y, con ellas, las respuestas de otras personas.
- **No es ilícito si se informa**, porque quien responde acepta esas reglas. Pero es una pérdida para terceros.
- **Opciones:**
  - (a) mantenerlo e informarlo (ya está en la política, sección 9, y en los términos, sección 9);
  - (b) conservar las respuestas bajo un aviso de «conversación eliminada».
- Propongo (a) al lanzamiento.

## 10. N-07. Reseñas al borrar la cuenta

- Google exige borrar los datos asociados a la cuenta y no menciona la anonimización.
- Una reseña «anónima» puede seguir identificando a su autor por el texto.
- Propongo **borrarlas**, como hace el esquema.

## 11. N-08. Citas

- El art. 10 de la Ley 11.723 permite citar «con fines didácticos o científicos», en comentarios, críticas o notas, hasta mil palabras de obras literarias y solo las partes indispensables.
- **Discutible:** si una reseña en una app social persigue un fin «didáctico o científico». Es defendible para la crítica literaria. En todo caso, la prueba decisiva es «solo lo indispensable»: reproducir un poema breve entero difícilmente lo sea, aunque tenga menos de mil palabras.
- Propongo un **límite interno de 200 palabras por publicación**, que puede controlar el filtro. Decisión del titular y de Producto.

## 12. N-09. Moderación: plazos y quién modera

- Ni Google ni Apple fijan un plazo: exigen moderación «robust, effective, and ongoing» y respuestas oportunas.
- Para «Rodríguez c/ Google», lo que importa es actuar con diligencia desde el conocimiento efectivo.
  - Si la ilicitud es manifiesta, alcanza la notificación privada.
  - Si es dudosa, puede exigirse una orden de autoridad competente.
- El fallo se dictó para buscadores. Su aplicación a un foro propio es por analogía, pero es el criterio disponible.
- **Hasta que llegue el Community Manager, modera el titular.** Para una sola persona, propongo:
  - 24 horas para los casos graves;
  - 3 días hábiles para el resto;
  - **ocultamiento preventivo** cuando un contenido reciba [3] denuncias de personas distintas, hasta revisarlo;
  - aviso inmediato al titular de cada denuncia grave.
- Durante la prueba cerrada también hay que moderar.

## 13. N-10. Venta en la web propia

Si se vendiera premium en [SITIO WEB] (por ejemplo, con Mercado Pago):
- botón de arrepentimiento y botón de baja en el primer acceso, sin registro previo, con confirmación en 24 horas (Disp. 954/2025, arts. 1, 4 y 5);
- atención de al menos 8 horas por día hábil, si la atención es solo electrónica (art. 6). Es una carga real para una persona sola;
- IVA e Ingresos Brutos (`investigacion.md`);
- la app de Android no puede enlazar a ese cobro (Requisitos, GP-57).

Propongo **no vender en la web al lanzamiento**. La sección 7.7 de los términos queda reservada.

## 14. N-11. Marcadores nuevos

Ver la sección 3.

## 15. N-12. Responsabilidad personal del titular (D03)

- En la relación de consumo no valen las cláusulas que limitan la responsabilidad por daños (Ley 24.240, art. 37; CCyC, arts. 988, 1119 y 1743). Los usuarios gratuitos también son consumidores: la ley alcanza a quien adquiere o utiliza servicios en forma gratuita u onerosa (Ley 24.240, art. 1; la frase «gratuita u onerosa» no figuraba en el resumen que obtuve de Infoleg, así que conviene verificarla en el texto).
- **Por eso los términos no exoneran: delimitan el servicio.**
  - Los documentos quedan en el dispositivo.
  - El OCR puede tener errores.
  - El contenido de terceros se trata con el criterio de «Rodríguez».
  - Los servicios de Google se rigen por sus condiciones.
  - Solo hay un tope para quien no es consumidor, que es marginal.
  - Que esa delimitación resista ante un juez es **discutible**.
- La responsabilidad sigue siendo personal e ilimitada. **Mitigaciones fuera de los textos:**
  - un seguro de responsabilidad civil o de riesgos cibernéticos (consultar a un productor);
  - una sociedad más adelante, a la que se transfiera la app (Google lo permite, según D03);
  - lo operativo: moderación diligente, seguridad (Res. AAIP 47/2018) y copias.
  - Los dos primeros son temas para el contador y el titular.

## 16. N-13. Licencia y no cesión

- La Ley 11.723 regula la enajenación o cesión de la obra (art. 51) y exige inscribirla, «sin lo cual no tendrá validez» (art. 53, según el texto consultado).
- Si es requisito de validez o de oponibilidad se discute en la doctrina.
- Para no entrar en esa discusión, los términos otorgan una **licencia no exclusiva, gratuita y limitada al servicio**, que termina al borrar el contenido. No se usa el contenido fuera de la app sin otro permiso.
- Los derechos morales quedan a salvo (art. 52).

## 17. N-14. Sincronizar la biblioteca

- `docs/backend.md` deja pendiente sincronizar la biblioteca y las preferencias.
- Si se sincronizaran los documentos, sus nombres o los fragmentos del progreso, pasarían a ser «Archivos y documentos» o «Actividad en la app» en Play. Además, podrían contener datos de terceros, incluso sensibles, y cambiaría la promesa central de la app.
- **Propuesta:**
  - no sincronizar documentos ni nombres de archivo;
  - para el límite de documentos del plan, que el servidor reciba como mucho un número;
  - las preferencias de lectura pueden sincronizarse, porque son de bajo riesgo, pero hay que declararlas.

## 18. N-15. Pantalla de edad neutral

- Hoy la portada del Club muestra «16 años o más» antes de pedir la fecha.
- Según la definición de Google, una pantalla neutral no indica la edad necesaria. El bloqueo de la fecha una vez cargada reduce el incentivo a mentir.
- Con la opción B (fecha en el registro) el problema desaparece.
- Con la opción A, sugiero a Desarrollo pedir la fecha antes de mostrar el requisito, o aceptar el riesgo.

## 19. N-16. Países y versiones por idioma

- **Portugués (Brasil):** hay que agregar una sección LGPD en la política:
  - derechos del art. 18, base legal y transferencias (art. 33);
  - canal de contacto o encargado: la ANPD exime a los agentes de pequeño porte, pero **no lo verifiqué**;
  - el arrepentimiento de 7 días.
  Además, decidir sobre el ECA Digital (N-01). Nada de esto está verificado contra el texto oficial.
- **Inglés:** si el público incluye EE. UU., considerar COPPA, las leyes estatales de tiendas y el riesgo de marca. Si se ofrece en el Reino Unido o la UE (T07), hay que sumar lo que corresponda del RGPD, sus versiones y sus reglas para niños. **No verificado.**
- **Mi propuesta para T07:** al lanzamiento, Argentina y el resto de Latinoamérica de habla hispana. Brasil después de cerrar N-01 y N-16. EE. UU. después de resolver la marca.

## 20. N-17. Para Localización

- **Glosario fijo:**
  - **responsable:** *controller* o *data controller* (en); *controlador* o *responsável* (pt; en la LGPD es «controlador»);
  - **titular de los datos:** *data subject* (en); *titular dos dados* (pt);
  - **reseña:** *review* (en); *resenha* (pt);
  - **conversación:** *thread* o *conversation* (en); *conversa* (pt);
  - **respuesta:** *reply* (en); *resposta* (pt);
  - **plan premium:** sin traducir el nombre del plan;
  - **Reading Club:** sin traducir;
  - **arrepentimiento:** *right of withdrawal* (en); *direito de arrependimento* (pt);
  - **botón de baja:** *cancellation button* (en); *botão de cancelamento* (pt).
- Las normas argentinas se citan en su nombre original («Ley 25.326»), sin traducir el número ni el nombre.
- Las dos leyendas de la AAIP (política, sección 10) se dejan en español y se agrega la traducción.
- No se traducen las «Nota de revisión» ni las «Fuentes».
- Las variantes A y B se traducen recién después de que el titular decida N-01.
- **Prevalencia:** los términos dicen que, ante diferencias entre versiones, se aplica la más favorable al consumidor (Ley 24.240, art. 37). Eso exige traducciones cuidadosas y revisadas.

## 21. N-18. Correspondencia con el formulario de Seguridad de los datos

Complementa la sección 4 de `docs/requisitos/google-play.md`. Las respuestas definitivas las arma Requisitos.

| Dato | Tipo en Play | ¿Recopilado? | ¿Compartido? | Finalidad | Sección de la política |
|---|---|---|---|---|---|
| Correo | Información personal › Correo electrónico | Sí | No (los proveedores no cuentan como compartir) | Administración de la cuenta, funcionalidad, comunicaciones del desarrollador | 3.1 |
| Nombre de usuario e identificador | Información personal › IDs de usuario. **Verificar** si Play encuadra el apodo también en «Nombre» | Sí | No | Cuenta y funcionalidad | 3.1 |
| Fecha de nacimiento | Información personal › Otra información | Sí (solo Club, o todos con la opción B) | No | Funcionalidad y cumplimiento | 3.2 |
| Reseñas, conversaciones y respuestas | Actividad en la app › Otro contenido generado por usuarios | Sí | No | Funcionalidad | 3.3 |
| Likes, bloqueos y denuncias | Actividad en la app › Otras acciones | Sí | No | Funcionalidad, seguridad | 3.3 |
| Búsqueda de reseñas | Actividad › Historial de búsqueda, o procesamiento efímero | Depende (N-20) | No | Funcionalidad | — |
| Suscripción | Información financiera › Historial de compras | Sí | No | Funcionalidad, cuenta | 3.4 |
| Datos de pago | — | **No:** los recopila Google Play Billing, y la app no accede | — | — | 3.4 |
| Registros con IP | Clasificación a definir con Servidor y Requisitos (**no verificada**) | Sí, 7 días | No | Seguridad y prevención de fraude | 3.5 |
| Documentos, texto, OCR, progreso y preferencias | No se declaran (procesamiento en el dispositivo) | No | — | — | 2 |
| Prácticas de seguridad | Cifrado en tránsito: sí. Borrado a pedido: sí (en la app y en la web) | — | — | — | 9 y 13 |

## 22. N-19. Aceptación en el registro

Para cumplir la Res. AAIP 14/2018 (información visible antes de recabar datos), Google Play (aceptar los términos antes de publicar) y N-02:
1. Enlaces visibles a los términos, las normas y la política en la pantalla de registro.
2. **Casilla 1** (sin marcar, obligatoria): «Acepto los Términos y condiciones y las Normas de la comunidad. Leí la Política de privacidad».
3. **Casilla 2** (sin marcar, obligatoria): «Consiento la transferencia de mis datos a Estados Unidos y Singapur, según la sección 7 de la Política de privacidad».
4. El servidor guarda la versión de cada texto, la fecha y la hora (política, sección 3.1).
5. Si cambian los textos, se vuelve a pedir la aceptación en el siguiente ingreso.
6. Enlaces también en el perfil, en «Planes» y en la pantalla de cobro (GP-24 y GP-60).

## 23. N-20 a N-23. Pedidos a otros roles

| # | Para | Pedido |
|---|---|---|
| N-20 | Servidor | Búsqueda de reseñas por una función con POST (RPC), para que el texto buscado no quede en los registros de la API. Borrado de la cuenta en 5 días hábiles. Rechazar sin guardar las altas de menores de 13 (si se elige la opción B). Guardar las aceptaciones. Ocultamiento automático con [3] denuncias. Minimización hacia RevenueCat y el correo. Confirmar que la versión web y la app no envían nada más |
| N-21 | Desarrollo | Pantalla «Licencias». Según los `package.json` de `node_modules`: pdf.js, Tesseract.js y su núcleo con Apache-2.0; mammoth con BSD-2-Clause; Preact y el modelo de español con MIT; idb con ISC; Literata y Atkinson Hyperlegible con OFL-1.1. Apache y BSD exigen reproducir la licencia y los avisos. También: enlaces legales, casillas del registro (N-19), botones de arrepentimiento y de baja en «Cuenta» (N-04), aviso antes de borrar la cuenta («no cancela la suscripción de Google Play»), denunciar y bloquear, y marca de spoiler en el Club |
| N-22 | Titular (operación) | Un buzón de soporte con respuestas modelo. **Plazos que corren:** <br>• consultas de pago en 3 días hábiles (DDA, §4.7); <br>• acceso en 10 días corridos y rectificación o supresión en 5 días hábiles (Ley 25.326); <br>• confirmación de arrepentimiento o baja en 24 horas (Disp. 954/2025); <br>• moderación (N-09) |
| N-23 | Requisitos | Público objetivo según N-01. Formulario de Seguridad de los datos según N-18. Clasificar los registros con IP. Evaluar Play Age Signals API (Brasil y Texas) |

Para Producto: el límite de citas (N-08), la marca de spoiler en el Club y si premium tiene sentido para quienes tienen de 13 a 15 años, que no pueden entrar al Club.

Para el contador: el plazo de conservación de los registros de compras (N-03) y la venta web (N-10).

## 24. Lo que no pude verificar

- **Campos del formulario de TAD:** los instructivos son PDF con capturas y no se pudieron leer.
- **Final literal de la leyenda de la AAIP** (Res. 14/2018, art. 3): solo verifiqué el comienzo y la frase central.
- **CCyC, arts. 2654 y 2655:** el tramo de Infoleg no cargó. Los contrasté con una fuente secundaria.
- **Normas brasileñas:** LGPD (arts. 14, 18 y 33), Código de Defensa del Consumidor (art. 49) y ECA Digital (Lei 15.211/2025). planalto.gov.br respondió con error 503 el 22/10/2026. Para el ECA Digital usé fuentes secundarias. Las resoluciones de la ANPD (32/2026 y 19/2024) salen de `docs/tecnico/`.
- **COPPA:**
  - la fecha exacta de entrada en vigor y del plazo de adecuación de la modificación de 2025;
  - el alcance sobre operadores extranjeros.
- **Reglas del Reino Unido y de Australia** sobre menores.
- **Resolución AAIP 132/2018:** solo por fuente secundaria. La página oficial del trámite confirma que la inscripción no vence.
- **Resolución AAIP 4/2019** (criterios orientadores): no encontré si trata el consentimiento de menores.
- **Ley 27.699** (Convenio 108+): fuente secundaria. No verifiqué si el protocolo ya está en vigor internacionalmente.
- **Plazo impositivo de conservación de compras** y la clasificación en Play de los registros con IP.

## 25. Fuentes

Consultadas el 22/10/2026.

**Argentina: datos personales**
- Ley 25.326: https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/texact.htm
- Decreto 1558/2001: https://servicios.infoleg.gob.ar/infolegInternet/anexos/70000-74999/70368/norma.htm
- Resolución AAIP 14/2018: https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-14-2018-307621/texto
- AAIP, transferencias internacionales: https://www.argentina.gob.ar/transferencias-internacionales
- Resolución AAIP 198/2023: https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-198-2023-391538/texto (publicada en el B.O. del 18/10/2023: https://www.boletinoficial.gob.ar/detalleAviso/primera/296189/20231018)
- AAIP, trámites: https://www.argentina.gob.ar/aaip/datospersonales/tramites
- Resolución AAIP 47/2018: https://www.argentina.gob.ar/normativa/nacional/resolución-47-2018-312662/texto
- Guías de la AAIP sobre menores (2024), fuente secundaria: https://allende.com/en/privacy-and-cybersecurity/the-aaip-published-two-guidelines-to-strengthen-the-protection-of-minors-personal-data-12-13-2024/
- Proyecto 3397-D-2026, fuente secundaria: https://abogados.com.ar/nuevo-proyecto-de-ley-de-proteccion-de-datos-personales/39762
- Ley 27.699, fuente secundaria: https://www.marval.com/Publicacion/argentina-aprueba-y-se-convierte-en-parte-del-convenio-108-14369?lang=es

**Argentina: consumidor, civil, autor y menores**
- Ley 24.240: https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/638/texact.htm
- Código Civil y Comercial: https://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/norma.htm. Arts. 2654 y 2655, por fuente secundaria: https://codigocivilonline.com.ar/articulo-2655/
- Disposición SSDCyLC 954/2025: https://servicios.infoleg.gob.ar/infolegInternet/anexos/415000-419999/417152/norma.htm
- Disposición DNDCyAC 3/2026: https://www.argentina.gob.ar/normativa/nacional/disposici%C3%B3n-3-2026-423007/texto
- Ley 11.723: https://www.argentina.gob.ar/normativa/nacional/ley-11723-42755/texto
- Ley 26.061: https://servicios.infoleg.gob.ar/infolegInternet/anexos/110000-114999/110778/norma.htm
- CSJN, «Rodríguez, María Belén c/ Google Inc.», 28/10/2014, Fallos 337:1174. Nota del CIJ: https://www.csjn.gov.ar/archivo-cij/nota-14310-La-Corte-Suprema-de-Justicia-decidi--que-los-buscadores-de-internet-se-hallan-protegidos-por-la-libertad-de-expresi-n.html

**Tiendas**
- Google Play, contenido generado por usuarios: https://support.google.com/googleplay/android-developer/answer/9876937
- Google Play, público objetivo: https://support.google.com/googleplay/android-developer/answer/9867159
- Google Play, Familias: https://support.google.com/googleplay/android-developer/answer/9893335
- Google Play, Seguridad de los datos: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play, borrado de cuenta: https://support.google.com/googleplay/android-developer/answer/13327111
- Google Play, suscripciones: https://support.google.com/googleplay/android-developer/answer/9900533
- Google Play, reembolsos: https://support.google.com/googleplay/answer/15574908
- Developer Distribution Agreement (vigente desde el 15/09/2025): https://play.google/developer-distribution-agreement.html
- Google Play, comerciante registrado: https://support.google.com/googleplay/android-developer/answer/7645364
- Google Play, leyes de tiendas de EE. UU. y Play Age Signals (por resultados de búsqueda y por `docs/requisitos/google-play.md`): https://support.google.com/googleplay/android-developer/answer/16569691
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

**Otros países**
- FTC, regla COPPA: https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa y modificación de 2025: https://www.ftc.gov/legal-library/browse/federal-register-notices/16-cfr-part-312-coppa-final-rule-amendments
- RGPD (arts. 3, 8 y 27): https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32016R0679
- Enunciado CD/ANPD 1/2023: https://bibliotecadigital.mj.gov.br/handle/1/10215
- ECA Digital, fuentes secundarias: https://www.mayerbrown.com/pt/insights/publications/2026/04/enforcement-of-brazils-eca-digital-introduces-new-obligations-for-companies y https://www.machadomeyer.com.br/pt/inteligencia-juridica/publicacoes-ij/direito-digital/estatuto-digital-da-crianca-e-do-adolescente-lei-n-15-211-2025-entra-em-vigor-em-17-de-marco-de-2026

**Del equipo**
- `docs/requisitos/google-play.md` (sección 3, público objetivo y D09; sección 4, inventario de datos).
- `docs/tecnico/decision-servidor-empaquetado-cobros.md` y `docs/tecnico/anexo-comparativo.md` (sección 3, regiones y transferencias).
