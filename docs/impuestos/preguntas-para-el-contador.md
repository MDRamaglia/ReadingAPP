# Preguntas para el contador (primera reunión)

Lo preparó el área contable e impositiva del equipo de Knowmadic el 22/10/2026, para la tarea P17.

**No es asesoramiento profesional.** Este documento ordena la información para que la reunión con el contador matriculado sea corta y precisa. Las decisiones y los trámites ante ARCA, el banco y las tiendas los hacen el titular y su contador.

**Cómo usarlo**
- La sección 1 se le entrega al contador, si se puede antes de la reunión.
- Las preguntas marcadas con ★ son las imprescindibles en la primera reunión. Con esas respuestas se puede hacer el alta, abrir la cuenta y completar el perfil de pagos de Google. El resto puede quedar para una segunda charla o resolverse por correo.
- Antes de ir, completá los campos «[a completar]».

**Cómo leer las fuentes**
- **(O)**: fuente oficial (ARCA, BCRA, Boletín Oficial, Cámara de Diputados, IRS, o la ayuda y los contratos de Google y Apple).
- **(S)**: fuente secundaria (estudios, consejos profesionales, blogs, prensa). Da una pista, pero el contador tiene que confirmarla.
- **(sin verificar)**: no encontramos fuente, así que se pregunta y no se afirma.
- Todas las fuentes se consultaron el 22/10/2026. Montos, alícuotas y normas cambian seguido. La lista completa está en la sección 5.

---

## 1. Resumen de la situación (para el contador)

**Titular.** Persona humana residente en Argentina. Publica la app a su nombre; no hay sociedad.
- Condición actual ante ARCA: [a completar: sin inscripción / monotributo, categoría __ / responsable inscripto / empleado en relación de dependencia / jubilado].
- Domicilio fiscal y jurisdicción de Ingresos Brutos: [a completar].
- Otras actividades o ingresos: [a completar].

**Actividad.** Knowmadic es una app de lectura de documentos con un plan gratuito y un plan premium por suscripción, mensual y anual. Se publica primero en Google Play (Android) y después en el App Store (iPhone). La versión web sigue publicada.

**Cobros**
1. **Google Play, desde el lanzamiento.**
   - Los usuarios pagan a Google, que liquida por mes calendario y paga cerca del día 15 del mes siguiente. A la Argentina paga por transferencia en dólares, con un mínimo de USD 100 (O).
   - Google se queda con una comisión del 15% en suscripciones. En EE. UU., la Unión Europea y el Reino Unido rige otra estructura desde el 30/06/2026 (O).
   - Según el contrato, Google actúa como agente. En la Argentina, Brasil, el resto de Latinoamérica y EE. UU., el desarrollador figura como *merchant of record*, es decir, como el vendedor frente al usuario (O). Ver B1.
   - Google pide el formulario W-8BEN de EE. UU.
2. **App Store, más adelante.** Cuesta USD 99 por año. Apple paga dentro de los 45 días posteriores al cierre de su mes contable (O).
3. **Web, posiblemente.** Ventas en pesos a consumidores de la Argentina con Mercado Pago.

**Clientes.** Consumidores finales en la Argentina, el resto de Latinoamérica, Brasil y países de habla inglesa.

**Gastos en dólares, pagados con tarjeta**
- Alta en Google Play: USD 25, una sola vez.
- Servidor: si se elige Supabase, el plan Pro cuesta USD 25 por mes más el consumo (S).
- Herramienta de cobros: si se elige RevenueCat, es gratis hasta USD 2.500 de facturación mensual y después cobra el 1% (S).
- Dominio y correo.
- Apple: USD 99 por año, más adelante.
- Honorarios del contador.

**Volumen.** Desconocido. Se espera empezar con pocos suscriptores.

**Qué hay que resolver antes de activar los cobros en Google Play**
- Con qué régimen inscribirse.
- Cómo facturar lo que paga Google, y a qué empresa.
- Dónde recibir los dólares.
- Qué responder en el W-8BEN.

---

## 2. Preguntas

### A. Régimen

**A1 ★ ¿Me conviene el monotributo o ser responsable inscripto?**
- *Por qué importa:* el régimen define cómo se factura, si las ventas en la Argentina llevan IVA, cómo se paga Ganancias y cuánto cuesta por mes.
- *Dato:* categorías vigentes desde el 01/08/2026 para locaciones y prestaciones de servicios (O, [ARCA](https://www.arca.gob.ar/monotributo/categorias.asp)):

| Categoría | Ingresos brutos anuales, hasta | Total mensual a pagar |
|---|---|---|
| A | $12.009.410,45 | $49.527,18 |
| B | $17.595.182,74 | $56.379,08 |
| C | $24.670.494,31 | $66.020,12 |
| D | $30.628.651,43 | $84.612,93 |
| E | $36.028.231,33 | $119.811,45 |
| F | $45.151.659,41 | $150.784,21 |
| G | $53.995.798,87 | $230.312,94 |
| H | $81.924.660,37 | $522.706,68 |
| I | $91.699.761,90 | $963.747,86 |
| J | $105.012.519,20 | $1.167.299,76 |
| K | $126.610.838,75 | $1.614.446,04 |

  El total suma el impuesto integrado, el aporte jubilatorio (SIPA) y la obra social. **No incluye Ingresos Brutos.** Según ARCA, el monotributista puede exportar servicios «sin superar los límites de facturación de la categoría máxima» (O, [ARCA](https://www.arca.gob.ar/monotributo/exportacion-servicios/)).

**A2 ★ ¿Pagar servicios del exterior me deja afuera del monotributo?**
- *Detalle:* todos los gastos son servicios de empresas del exterior: la cuenta de Google, el servidor, las herramientas y, más adelante, Apple. La comisión que retiene Google también es un servicio del exterior.
- *Por qué importa:* si estos pagos cuentan como importación de servicios, el monotributo podría no servir para esta actividad.
  - El texto original de la ley del monotributo (Ley 26.565, Anexo, art. 2 inc. d, de 2009) exige no haber hecho «importaciones de cosas muebles y/o de servicios» en los últimos 12 meses (O, [biblioteca de ARCA](https://biblioteca.afip.gob.ar/dcp/LEY_C_026565_2009_11_25)).
  - Según fuentes secundarias, la Ley 27.430 (2017) acotó esa causal a las importaciones vinculadas con la comercialización o con la actividad (S, [iProfesional, 2018](https://www.iprofesional.com/impuestos/269875-entro-en-vigencia-el-nuevo-listado-de-causales-para-ser-excluido-del-monotributo)).
  - No pudimos leer el texto consolidado vigente.

**A3 ¿En qué categoría arranco y cómo paso los dólares a pesos para controlar el tope?**
- *Por qué importa:* el tope está en pesos y los ingresos llegan en dólares. Con un volumen incierto, conviene saber:
  - con qué tipo de cambio se computa cada factura;
  - cuándo hay que recategorizarse;
  - qué pasa si se supera la categoría K.

**A4 ★ ¿Qué código de actividad doy de alta en ARCA?**
- *Por qué importa:* el código tiene que coincidir con lo que se factura. Además, el banco lo mira para justificar el ingreso de dólares.
- *Lo que falta definir:* si la actividad se encuadra como edición o venta de software, como servicio digital o de otra forma (sin verificar: no buscamos códigos exactos). Si se suman las ventas web, ¿hace falta un segundo código?

**A5 ¿Es compatible con mis otras actividades?**
- *Detalle:* si tengo empleo en relación de dependencia, otro monotributo o soy jubilado, ¿puedo sumar esta actividad? ¿Pago dos veces el aporte jubilatorio o la obra social?
- *Por qué importa:* cambia el costo mensual. Además, desarrollar más de tres actividades simultáneas es causal de exclusión del monotributo (S, [iProfesional, 2018](https://www.iprofesional.com/impuestos/269875-entro-en-vigencia-el-nuevo-listado-de-causales-para-ser-excluido-del-monotributo)).

**A6 Si conviene ser responsable inscripto, ¿me sirve la declaración jurada simplificada de Ganancias?**
- *Dato:* la Ley 27.799 «de Inocencia Fiscal» (Boletín Oficial del 02/01/2026), el Decreto 93/2026 y la RG ARCA 5820/2026 crearon un régimen optativo de declaración jurada simplificada de Ganancias para personas humanas. Los topes citados son ingresos de hasta $1.000 millones y bienes de hasta $10.000 millones (S, [Blog del Contador](https://blogdelcontador.com.ar/news-46449-inocencia-fiscal-se-publico-la-ley-27799-y-ya-rigen-los-nuevos-umbrales-penales-el-aumento-en-multas-y-el-regimen-simplificado-de-ganancias); [Colegio de Escribanos](https://www.colegio-escribanos.org.ar/noticias/2026_01_05_Informe-Ley-27799.pdf)).
- *Por qué importa:* puede simplificar la presentación anual.

**A7 ¿Rige hoy algún derecho de exportación sobre los servicios?**
- *Dato:* ARCA lo menciona en pasado («antes existía») y aclara que los monotributistas con certificado MiPyME vigente quedan exentos (O, [ARCA](https://www.arca.gob.ar/monotributo/exportacion-servicios/)).
- *Por qué importa:* si rigiera, sería un costo sobre cada factura de exportación.

### B. Facturación

**B1 ★ ¿Qué ventas son exportación y cuáles no?**
- *Contexto (O), del [Acuerdo de distribución para desarrolladores de Google Play](https://play.google/developer-distribution-agreement.html), vigente desde el 15/09/2025:*
  - el desarrollador designa a Google como su «agente o proveedor de servicios de marketplace» (sección 3.1);
  - Google es el *merchant of record* solo en los países de la [lista oficial](https://support.google.com/googleplay/android-developer/answer/7645364): la Unión Europea, el Reino Unido, Noruega, Islandia y algunos territorios. Para el resto, el contrato dice: «You are the merchant of record» (sección 3.4). La Argentina, Brasil, el resto de Latinoamérica y EE. UU. no están en la lista.
- *Definición de ARCA (O):* la exportación de servicios son prestaciones hechas en el país cuya utilización económica se efectúa en el exterior ([ARCA](https://www.arca.gob.ar/monotributo/exportacion-servicios/)).
- *Pregunta:* las suscripciones de usuarios que están en la Argentina, ¿son exportación, con Google como cliente, o venta local a consumidores, con Google como intermediario? ¿Y las de usuarios del exterior?
- *Por qué importa:*
  - Si las ventas a usuarios de la Argentina son locales, llevan IVA (si soy responsable inscripto) e Ingresos Brutos sin la exención de exportación, y se facturan con otro comprobante.
  - El informe mensual de ingresos de Play Console trae la columna «Buyer Country» (país del comprador), así que las ventas se pueden separar por país (O, [ayuda de Play Console](https://support.google.com/googleplay/android-developer/answer/6135870)).

**B2 ★ ¿A qué empresa de Google le facturo?**
- *Lo verificado (O):*
  - Para la Argentina, las [Condiciones del servicio del Vendedor de Google Payments](https://payments.google.com/payments/apis-secure/get_legal_document?ldo=0&ldt=sellertos&ldr=AR&ldl=es) son un contrato con **Google Payment Corp.**, subsidiaria de Google LLC, con domicilio en 1600 Amphitheatre Parkway, Mountain View, CA 94043, EE. UU. (versión del 22/03/2018). Es la empresa que procesa los pagos y, según su artículo 6.2, transfiere en dólares estadounidenses.
  - El Acuerdo de distribución nombra como posibles contrapartes a Google LLC (EE. UU.), Google Ireland Limited y Google Commerce Limited (Irlanda) y Google Asia Pacific Pte. Limited (Singapur). La que corresponde depende de dónde se distribuya la app. La tabla que lo detalla no se pudo leer.
- *Lo no confirmado:* cuál de esas empresas va en la factura E. Las candidatas son Google Payment Corp., que es la que paga, y Google LLC.
- *Cómo confirmarlo:*
  - mirar quién figura como ordenante en la primera transferencia;
  - revisar el perfil de pagos de Play Console;
  - si hace falta, consultar al soporte de Play Console.
- *Dato para la factura:* ARCA indica completar el campo de CUIT del cliente con el «CUIT país» del destino, que figura en su [tabla](https://www.arca.gob.ar/fe/documentos/TABLACUITPAISV.025082010.xls) (O).
- *Por qué importa:* el banco compara la factura con la transferencia. Si no coinciden, puede trabar el ingreso.

**B3 ★ ¿Facturo el monto bruto o el neto?**
- *Detalle:* Google descuenta su comisión y, en algunos países, impuestos antes de pagar. El informe de ingresos separa el cobro al usuario («Charge»), la comisión («Google fee») y los impuestos («Tax») (O, [ayuda de Play Console](https://support.google.com/googleplay/android-developer/answer/6135870)). ¿La factura va por lo que transfiere Google o por lo que pagaron los usuarios, con la comisión como gasto?
- *Por qué importa:* cambia el monto que cuenta para el tope del monotributo y para Ingresos Brutos. También cambia si la comisión de Google se trata como importación de servicios (ver A2).

**B4 ¿Con qué frecuencia facturo y con qué fecha?**
- *Dato (O):* Google liquida por mes calendario. El informe de ingresos suele estar cerca del día 5 y el pago llega cerca del 15 del mes siguiente ([pagos](https://support.google.com/googleplay/android-developer/answer/137997), [informes](https://support.google.com/googleplay/android-developer/answer/6135870)). Si el saldo no llega a USD 100, pasa al mes siguiente.
- *Preguntas:*
  - ¿Hago una factura por mes de ventas o una por cada transferencia?
  - ¿Con qué fecha: fin de mes, emisión del informe o cobro?
- *Por qué importa:* la fecha define el tipo de cambio, el período de Ingresos Brutos y los meses que cuentan para la categoría.

**B5 ¿Qué tipo de cambio uso?**
- *Dato (O, [ARCA](https://www.arca.gob.ar/monotributo/exportacion-servicios/)):* la factura E se puede emitir en moneda extranjera o en pesos, con el tipo de cambio comprador del Banco Nación del día anterior a la emisión.
- *Preguntas:*
  - ¿Rige igual si soy responsable inscripto?
  - ¿Cómo trato la diferencia entre lo facturado y lo que se acredita, por comisiones de bancos intermediarios o por diferencia de cambio?

**B6 ¿Cómo emito la factura E?**
- *Dato (O, [ARCA](https://www.arca.gob.ar/monotributo/exportacion-servicios/)):*
  - se emite con el servicio «Comprobantes en línea», con un punto de venta habilitado para «Comprobantes de exportación - Comprobante en línea»;
  - los monotributistas no tienen que inscribirse como exportadores.
- *Pregunta:* ¿hace falta algo más? ¿Cambia si soy responsable inscripto?

**B7 ¿Cómo registro los reembolsos y contracargos?**
- *Detalle:* Google descuenta los reembolsos del pago del mes.
- *Pregunta:* ¿se hace una nota de crédito E o alcanza con facturar el neto?

### C. Ingresos Brutos

**C1 ★ ¿Dónde me inscribo y con qué régimen?**
- *Opciones:* régimen local o Convenio Multilateral; régimen simplificado o monotributo unificado, si mi jurisdicción lo tiene.
- *Por qué importa:* depende de mi domicilio y de dónde están los clientes. Además, define cuánto pago por mes aunque los ingresos estén exentos.

**C2 ★ En mi jurisdicción, ¿la exportación de servicios está exenta o no gravada? ¿Qué trámite hace falta?**
- *Referencias (S), a confirmar con el código fiscal vigente:*
  - **Ciudad de Buenos Aires:** exención para la «exportación de servicios que se efectivicen en el exterior». En 2018 estaba en el art. 179 inc. 21 del Código Fiscal; la numeración cambia en cada texto ordenado ([acta AGIP–CPCECABA, 2018](https://www.consejo.org.ar/storage/attachments/Acta_Grupo_de_Enlace_AGIP-180418.pdf-z90hbOFSm1.pdf)). Igual hay que declarar esos ingresos como exentos ([nota](https://evemuriel.com/blog/ingresos-brutos/exportaciones-exentas-ingresos-brutos.html)).
  - **Provincia de Buenos Aires:** no gravada, según el art. 186 del Código Fiscal ([Ámbito](https://www.ambito.com/economia/arba/quienes-estan-exentos-del-impuesto-ingresos-brutos-n5570475)).
  - **Misiones:** no gravada desde 2018 ([nota](https://evemuriel.com/blog/ingresos-brutos/exportaciones-exentas-ingresos-brutos.html)).
- *Preguntas:* ¿Tengo que pedir una constancia? ¿Presentar declaraciones aunque no pague?
- *Por qué importa:* si no está exenta, Ingresos Brutos es un costo sobre todo lo facturado.

**C3 Si me corresponde el monotributo unificado, ¿pago el componente fijo de Ingresos Brutos aunque todos mis ingresos sean exportaciones exentas?**

**C4 ¿Las ventas a compradores de otras provincias me obligan al Convenio Multilateral?**
- *Detalle:* incluye las ventas web y también las de Google a usuarios argentinos, si B1 concluye que son ventas locales.
- *Pregunta:* ¿desde cuándo correría la obligación?

**C5 ¿Me van a retener Ingresos Brutos sobre lo que entra a mis cuentas (SIRCREB), incluida la cuenta en dólares?**
- *Dato (S, [Contadores en Red](https://contadoresenred.com/regimen-simplificado-de-ingresos-brutos-y-las-retenciones-sircreb-su-exclusion-como-hacer-para-que-no-retengan/)):* algunas jurisdicciones excluyen, a pedido, a quienes solo exportan. La Ciudad de Buenos Aires excluye a quienes están en el régimen simplificado.
- *Pregunta:* ¿cómo pido la exclusión?
- *Por qué importa:* si retienen sobre ingresos exentos, se acumula un saldo a favor difícil de recuperar.

### D. Cambios y banco

**D1 ★ ¿Qué cuenta abro y en qué banco?**
- *Lo que dicen las fuentes (S; los PDF oficiales del BCRA no se pudieron leer con nuestras herramientas):*
  - La Comunicación «A» 8330 del BCRA (18/09/2025) eliminó el tope anual de USD 36.000 hasta el cual las personas humanas que exportan servicios podían acreditar los dólares en su cuenta sin venderlos ([Blog del Contador](https://blogdelcontador.com.ar/news-46233-exportaciones-de-servicios-como-cobrar-en-dolares-sin-limites-y-condiciones-del-nuevo-regimen-del-bcra); [SmartLog](https://www.smartlog.com.ar/blog/una-buena-noticia-para-freelancers-y-exportadores-de-servicios-el-bcra-elimina-el-tope-de-usd-36-000/)).
  - La Comunicación «A» 8481 (14/09/2026) eliminó además el requisito de que el servicio figure en una lista cerrada de códigos de concepto. El estudio que la comenta también menciona el tope ([Allende & Brea](https://allende.com/bancario/el-bcra-flexibiliza-el-cobro-de-exportaciones-de-servicios-y-ajusta-reglas-de-acceso-al-mercado-de-cambios-09-15-2026/)).
  - Condiciones que siguen vigentes:
    - los fondos se acreditan en una cuenta en dólares a nombre propio, en un banco argentino;
    - el mecanismo tiene que ser «neutro en materia fiscal»;
    - el banco registra dos boletos sin movimiento de pesos, uno con el concepto A22;
    - el banco no puede cobrar comisión por la acreditación, salvo los gastos de bancos del exterior, que traslada al costo.
- *Dato (O):* Google exige que la cuenta bancaria esté en el mismo país que el perfil de pagos ([ayuda de Play Console](https://support.google.com/googleplay/android-developer/answer/7161426)).
- *Preguntas:*
  - ¿Alcanza con una caja de ahorro en dólares común?
  - ¿Qué bancos lo hacen sin trabas?
  - ¿Necesito también una cuenta en pesos?
- *Por qué importa:* si la cuenta no admite transferencias del exterior, el pago de Google rebota.

**D2 ★ ¿Qué documentación me va a pedir el banco con cada transferencia?**
- *Dato (O, [ayuda de Google Play](https://support.google.com/googleplay/android-developer/answer/2700656)):* los bancos pueden pedir documentación según la Comunicación «A» 6037 y un boleto de cambio, «regardless of the amount received» (cualquiera sea el monto). También pueden pedir una factura según las normas impositivas argentinas.
- *Preguntas:*
  - En la práctica, ¿qué piden: factura E, informe de ingresos de Play Console, el contrato con Google, una declaración jurada?
  - ¿Con qué código de concepto se declara el ingreso?

**D3 ¿Qué plazo tengo para ingresar los dólares?**
- *Dato (S):* 20 días hábiles desde el cobro en el exterior ([SmartLog](https://www.smartlog.com.ar/blog/una-buena-noticia-para-freelancers-y-exportadores-de-servicios-el-bcra-elimina-el-tope-de-usd-36-000/)).
- *Pregunta:* si Google transfiere directo a mi cuenta en la Argentina, ¿el plazo se cumple solo?

**D4 ¿Estoy obligado a vender los dólares?**
- *Dato (S):* no, para personas humanas que cumplan las condiciones de D1.
- *Pregunta:* si quiero vender una parte, ¿cómo lo hago y qué se documenta?

**D5 ¿Puedo pagar la tarjeta con esos dólares?**
- *Por qué importa:* los gastos de la actividad son en dólares. Ver G1.

**D6 ¿Se aplica el impuesto a los débitos y créditos bancarios (Ley 25.413) a las acreditaciones en la cuenta en dólares?**
- *Pregunta:* ¿se puede computar a cuenta de otro impuesto? (sin verificar)

### E. Estados Unidos y otros países

**E1 ★ ¿Cómo completo el W-8BEN?**
- *Lo confirmado (O):*
  - Es el formulario para personas humanas que no son de EE. UU. Se entrega al agente de retención o pagador (en este caso, Google), no al IRS ([IRS](https://www.irs.gov/forms-pubs/about-form-w-8-ben), página actualizada el 02/10/2026). Google lo pide dentro del perfil de pagos de Play Console ([ayuda de Play Console](https://support.google.com/googleplay/android-developer/answer/7163598)).
  - La Argentina no tiene convenio de doble imposición con EE. UU.: no figura en la [lista del IRS](https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z) (actualizada el 03/01/2026). Brasil tampoco. Por eso no se puede reclamar una tasa reducida por convenio (parte II del formulario).
  - Google pide renovarlo cada 3 años, o antes si cambia la situación ([Google](https://support.google.com/paymentscenter/answer/10349995)).
- *Preguntas:*
  - Como número de identificación fiscal extranjero, ¿va el CUIT o el CUIL?
  - ¿El domicilio tiene que ser el mismo que el fiscal de ARCA?

**E2 ★ ¿Me van a retener el 30% de las ventas a usuarios de EE. UU.?**
- *Lo confirmado (O):*
  - La ayuda general de Google sobre impuestos de EE. UU. dice que solo queda sujeta a retención la parte de los ingresos que proviene de usuarios de EE. UU. Si no hay un formulario válido, la tasa por defecto es en general del 30%, y solo baja si hay convenio ([Google](https://support.google.com/paymentscenter/answer/10349995)).
  - El Acuerdo de distribución (sección 3.6) prevé que Google descuente las retenciones cuando corresponda.
- *Lo no confirmado:*
  - Si las suscripciones de una app quedan alcanzadas. La ayuda de Play Console no lo dice.
  - En los foros de desarrolladores hay versiones opuestas, y ninguna es oficial.
- *Cómo comprobarlo:* Play Console publica los documentos de retención en la sección de informes financieros.
- *Por qué importa:* sin convenio, una retención del 30% sobre las ventas en EE. UU. cambia el precio de equilibrio de ese mercado.

**E3 Si me retienen en EE. UU., ¿lo puedo computar en la Argentina?**
- *Pregunta:* ¿se toma como crédito por impuestos pagados en el exterior en Ganancias? ¿Y si estoy en el monotributo? (sin verificar)
- *Por qué importa:* si no se puede computar, es un costo definitivo.

**E4 ¿Tengo obligaciones de IVA en otros países de Latinoamérica?**
- *Dato (O, [ayuda de Play Console](https://support.google.com/googleplay/android-developer/answer/138000)):*
  - En Colombia y Perú, si el desarrollador está fuera del país, «you will continue to be responsible for charging, remitting, and reporting any VAT»: el IVA de esas ventas sigue a su cargo.
  - En Chile, México, EE. UU., el Reino Unido, Canadá, Australia, la India y Sudáfrica, Google se encarga del impuesto cuando el desarrollador es de afuera.
  - La Argentina y Brasil no figuran en esa página.
- *Preguntas:*
  - ¿Qué implica vender en Colombia, Perú y Brasil?
  - ¿Conviene dejarlos fuera del primer lanzamiento?
- *Por qué importa:* sirve para decidir qué países se habilitan en el lanzamiento (decisión T07 de `docs/plan/pendientes.md`).

### F. Ganancias y Bienes Personales

**F1 Si soy responsable inscripto, ¿en qué categoría de Ganancias entra esta actividad y qué cambia?**

**F2 ¿Qué gastos puedo deducir y con qué comprobante?**
- *Gastos posibles:*
  - la comisión de Google, si no se factura el neto;
  - el alta en Google Play (USD 25) y Apple (USD 99 por año);
  - el servidor, las herramientas y el dominio;
  - la computadora y el celular de prueba;
  - internet;
  - los honorarios del contador.
- *Preguntas:*
  - ¿Alcanza con el resumen de la tarjeta o la factura del proveedor del exterior?
  - ¿Cómo se trata lo que también es de uso personal?

**F3 ¿Cuándo empiezo a pagar anticipos de Ganancias?**
- *Por qué importa:* afecta la caja del primer año.

**F4 Si mantengo los dólares en la cuenta, ¿la diferencia de cambio es una ganancia gravada?**

**F5 Los dólares en la cuenta local, ¿pagan Bienes Personales?**
- *Pregunta:* ¿cómo se usan las percepciones que se computan a cuenta de ese impuesto? (ver G1)

### G. Percepciones sobre los pagos con tarjeta al exterior

**G1 ★ ¿Me cobran la percepción del 30% al pagar con tarjeta los servicios del exterior? ¿Cómo la recupero o la computo?**
- *Normas:*
  - la RG ARCA 5617 (Boletín Oficial del 19/12/2024), que reemplazó a la RG 4815;
  - la modificó la RG 5672 (14/04/2025) y le siguió la RG 5677 (16/04/2025).
- *Contenido (S, [Blog del Contador](https://blogdelcontador.com.ar/arca-percepcion-ganancias-operaciones-en-moneda-extranjera); [Infobae](https://www.infobae.com/economia/2025/04/14/modificaron-las-percepciones-de-ganancias-y-bienes-personales-para-las-compras-con-moneda-extranjera-turismo-y-pagos-en-el-exterior/)):*
  - **Alcance:** pagos al exterior con tarjeta, en pesos, que impliquen comprar divisas.
  - **Cómputo:** los monotributistas la usan a cuenta de Bienes Personales; los demás, a cuenta de Ganancias.
  - **Devolución:** quien no paga ninguno de los dos impuestos puede pedirla al terminar el año.
- *Pregunta:* si pago el resumen de la tarjeta con mis dólares (los que cobro de Google), ¿no hay percepción? (sin verificar)

**G2 ¿Qué IVA y qué Ingresos Brutos me perciben por contratar servicios digitales del exterior?**
- *Pregunta:* ¿puedo computar esas percepciones o son un costo? (sin verificar alícuotas vigentes)

**G3 ¿Conviene usar una tarjeta solo para la actividad?**

### H. Ventas web con Mercado Pago

**H1 ¿Las ventas web llevan IVA? ¿Qué factura hago?**
- *Detalle:* son ventas en pesos a consumidores de la Argentina. El comprobante cambia según el régimen.
- *Pregunta:* ¿el precio que se muestra tiene que incluir el IVA?

**H2 ¿Qué alícuota de Ingresos Brutos pago por esas ventas?**
- *Pregunta:* ¿las ventas a otras provincias me pasan al Convenio Multilateral? (ver C4)

**H3 ¿Qué retenciones me va a hacer Mercado Pago y cómo configuro mi perfil impositivo ahí?**
- *Dato (S, [Marval](https://www.marval.com/publicacion/se-eliminan-las-retenciones-impositivas-a-los-cobros-electronicos-16908)):*
  - La RG 5554/2024 (Boletín Oficial del 21/08/2024) derogó desde el 01/09/2024 las retenciones nacionales de IVA y Ganancias sobre cobros con tarjeta y billeteras (RG 140/98, 4011/2017 y 4622/2019).
  - La Ley 27.743, art. 102, limita las retenciones de los procesadores de pago a quienes superen 10.000 UVA por mes.
  - Siguen los regímenes provinciales de Ingresos Brutos; en mi jurisdicción, sin verificar.

**H4 ¿Tengo que emitir una factura por cada cobro de suscripción? ¿Se puede automatizar? ¿Qué datos del comprador necesito?**

**H5 ¿Cuánto cobra Mercado Pago y cómo trato el IVA de esa comisión?**
- *Estado:* sin verificar. La página oficial de costos no se pudo consultar el 22/10/2026; hay que mirar la tabla vigente en la cuenta de Mercado Pago.

**H6 ¿Cómo documento las devoluciones?**
- *Detalle:* en la web hay botón de arrepentimiento y de baja (Disposición 954/2025) y 10 días para arrepentirse (Ley 24.240, art. 34), según `docs/plan/investigacion.md`.
- *Pregunta:* ¿nota de crédito por cada devolución?

**H7 ¿Cuánto suma de costo fijo (contable e impositivo) abrir la venta web?**
- *Por qué importa:* sirve para decidir si conviene esperar a tener volumen.

### I. Futuro

**I1 ¿A partir de qué volumen conviene una sociedad (SAS o SRL)?**
- *Dato (S, [Allende & Brea](https://allende.com/bancario/el-bcra-flexibiliza-el-cobro-de-exportaciones-de-servicios-y-ajusta-reglas-de-acceso-al-mercado-de-cambios-09-15-2026/)):* para las personas jurídicas, la excepción para no vender los dólares sigue limitada a las inscriptas en el régimen de economía del conocimiento. Una sociedad común tendría que liquidarlos en el mercado de cambios.
- *Dato (O):* Google permite transferir la app a otra cuenta de desarrollador; no pasan los informes de ingresos (ver D03 en `docs/plan/decisiones.md`).
- *Pregunta:* ¿qué otros costos y ventajas tiene la sociedad? Por ejemplo, Ganancias, dividendos y Ingresos Brutos.

**I2 ¿El régimen de economía del conocimiento podría aplicar en algún momento?**
- *Dato (S):*
  - La Ley 27.506 (art. 4) se refiere a personas jurídicas, no a personas humanas.
  - Su vigencia va del 01/01/2020 al 31/12/2029 ([texto](https://consejosalta.org.ar/wp-content/uploads/ley-27506.pdf)).
  - Hay un proyecto de reforma (expediente 1092-D-2025) que no encontramos sancionado ([Diputados](https://www4.hcdn.gob.ar/dependencias/dsecretaria/Periodo2025/PDF2025/TP2025/1092-D-2025.pdf)).

**I3 Cuando llegue Apple: ¿cambia algo?**
- *Preguntas:* ¿Qué empresa paga, en qué moneda, a quién se factura y qué formulario fiscal pide?
- *Dato (O):* Apple exige el contrato de apps pagas, datos bancarios y documentación impositiva ([Apple](https://developer.apple.com/help/app-store-connect/getting-paid/overview-of-receiving-payments/)). El resto lo verificamos cuando llegue el momento.

**I4 ¿Qué señales indican que hay que pasar del monotributo a responsable inscripto?**

### J. Para cerrar la reunión

- **Honorarios:** ¿cuánto cuestan el alta y el mantenimiento mensual? ¿Qué incluyen: facturación mensual, declaraciones juradas, Ingresos Brutos y trato con el banco? El dato hace falta para el cálculo de costos y de equilibrio.
- **Vencimientos:** ¿cuál es el calendario mensual y anual que me toca?
- **Tareas:** ¿qué hago yo y qué hace el contador? ¿Qué tiene que estar listo antes de activar los cobros en Google Play?

---

## 3. Datos y documentos para llevar

**Identidad y situación actual**
- DNI y CUIT o CUIL.
- Clave fiscal de ARCA, y su nivel si lo sabés.
- Constancia de inscripción actual en ARCA y en Ingresos Brutos, si existe.
- Domicilio real y fiscal. Si son distintos, en qué jurisdicción está cada uno.
- Otras fuentes de ingreso: recibos de sueldo, otro monotributo, jubilación.
- Obra social actual.
- Certificado MiPyME, si lo tenés.

**Banco**
- Bancos donde tenés cuentas y si alguna es caja de ahorro en dólares.
- Tarjetas que vas a usar para los gastos de la actividad.

**El proyecto**
- Este documento, con la sección 1 completa.
- Lista de gastos previstos en dólares, con frecuencia y medio de pago.
- Precios previstos por mercado, cuando Producto y precios los tenga (decisión T05).
- Tres escenarios de suscriptores (bajo, medio y alto), aunque sean estimados.
- Países donde se piensa lanzar (decisión T07).

**Google**
- Captura del perfil de pagos de Play Console, cuando exista: nombre legal, dirección y empresa de Google que figura.
- Enlaces al [Acuerdo de distribución](https://play.google/developer-distribution-agreement.html) y a las [Condiciones del servicio del Vendedor de Google Payments para la Argentina](https://payments.google.com/payments/apis-secure/get_legal_document?ldo=0&ldt=sellertos&ldr=AR&ldl=es).

---

## 4. Glosario

- **ARCA:** Agencia de Recaudación y Control Aduanero, que reemplazó a la AFIP. Ahí se hace el alta impositiva y se emiten las facturas.
- **CUIT, CUIL y clave fiscal:** el número de contribuyente, el número laboral y la contraseña para operar en ARCA.
- **Monotributo:** régimen simplificado. Se paga una cuota fija por mes según la categoría, que incluye impuesto, jubilación y obra social. Reemplaza al IVA y a Ganancias.
- **Responsable inscripto:** régimen general. Se liquida el IVA por mes y Ganancias por año.
- **Factura E:** comprobante para exportaciones. No lleva IVA.
- **Factura B o C:** comprobantes para consumidores finales en la Argentina. La B la emite el responsable inscripto y la C, el monotributista.
- **Nota de crédito:** comprobante que anula total o parcialmente una factura, por ejemplo por un reembolso.
- **CUIT país:** número genérico que ARCA asigna a cada país para identificar al cliente del exterior en la factura E.
- **Exportación de servicios:** servicio prestado desde la Argentina y utilizado económicamente en el exterior.
- **Ingresos Brutos (IIBB):** impuesto provincial sobre lo facturado. Cada provincia y la Ciudad de Buenos Aires tienen su código fiscal.
- **Monotributo unificado:** sistema de algunas jurisdicciones que cobra Ingresos Brutos junto con la cuota del monotributo.
- **Convenio Multilateral:** régimen para repartir Ingresos Brutos entre provincias cuando se vende en más de una.
- **SIRCREB:** sistema por el que los bancos retienen Ingresos Brutos sobre lo que se acredita en las cuentas.
- **Retención y percepción:** cobros a cuenta de un impuesto. Una retención la hace quien te paga; una percepción, quien te cobra.
- **Anticipos:** pagos a cuenta del impuesto del año siguiente.
- **Ganancias:** impuesto nacional sobre la ganancia neta del año.
- **Bienes Personales:** impuesto nacional sobre el patrimonio al 31 de diciembre.
- **UVA:** unidad de valor que se ajusta por inflación; algunas normas fijan montos en UVA.
- **BCRA y «Exterior y Cambios»:** el Banco Central y su texto ordenado de normas cambiarias. Las «Comunicaciones A» lo modifican.
- **Mercado de cambios y liquidar:** liquidar es vender los dólares por pesos en el mercado oficial.
- **Boleto de cambio:** registro que hace el banco de cada operación con moneda extranjera.
- **Código de concepto:** código con el que el banco clasifica la operación cambiaria.
- **W-8BEN:** formulario de EE. UU. con el que una persona del exterior certifica que no es residente estadounidense.
- **Withholding:** retención de impuestos de EE. UU. sobre pagos a no residentes.
- **Convenio de doble imposición:** tratado entre dos países para no cobrar dos veces el mismo impuesto. La Argentina no tiene uno con EE. UU.
- **Merchant of record:** quien figura legalmente como vendedor ante el usuario.
- **Payment processor:** la empresa que procesa los pagos y le transfiere el dinero al desarrollador. Para la Argentina es Google Payment Corp.
- **Earnings report:** el informe de ingresos mensual de Play Console.
- **Tipo de cambio comprador del Banco Nación:** cotización a la que el Banco Nación compra dólares; ARCA la usa para la factura E.

---

## 5. Fuentes consultadas el 22/10/2026

**Oficiales (O)**
- ARCA: [categorías del monotributo](https://www.arca.gob.ar/monotributo/categorias.asp), vigentes desde el 01/08/2026.
- ARCA: [exportación de servicios en el monotributo](https://www.arca.gob.ar/monotributo/exportacion-servicios/) y [tabla de CUIT por país](https://www.arca.gob.ar/fe/documentos/TABLACUITPAISV.025082010.xls).
- Biblioteca de ARCA: [Ley 26.565, texto original](https://biblioteca.afip.gob.ar/dcp/LEY_C_026565_2009_11_25).
- Google Play: [Acuerdo de distribución para desarrolladores](https://play.google/developer-distribution-agreement.html), vigente desde el 15/09/2025.
- Google Play: [merchant of record](https://support.google.com/googleplay/android-developer/answer/7645364).
- Google Play: [pagos por transferencia](https://support.google.com/googleplay/android-developer/answer/2700656) y [calendario de pagos](https://support.google.com/googleplay/android-developer/answer/137997).
- Google Play: [informes financieros](https://support.google.com/googleplay/android-developer/answer/6135870).
- Google Play: [información fiscal](https://support.google.com/googleplay/android-developer/answer/7163598) e [impuestos por país](https://support.google.com/googleplay/android-developer/answer/138000).
- Google Play: [perfil de pagos](https://support.google.com/googleplay/android-developer/answer/7161426) y [comisiones](https://support.google.com/googleplay/android-developer/answer/112622).
- Google: [impuestos de EE. UU.](https://support.google.com/paymentscenter/answer/10349995).
- Google Payments: [Condiciones del servicio del Vendedor para la Argentina](https://payments.google.com/payments/apis-secure/get_legal_document?ldo=0&ldt=sellertos&ldr=AR&ldl=es), del 22/03/2018.
- IRS: [convenios de EE. UU.](https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z) y [formulario W-8BEN](https://www.irs.gov/forms-pubs/about-form-w-8-ben).
- Apple: [cobros en App Store Connect](https://developer.apple.com/help/app-store-connect/getting-paid/overview-of-receiving-payments/).
- BCRA: Comunicaciones [«A» 8481](https://www.bcra.gob.ar/Pdfs/comytexord/A8481.pdf) y [«A» 8330](https://www.bcra.gob.ar/Pdfs/comytexord/A8330.pdf). Los PDF se descargaron, pero no pudimos leer su texto.
- Cámara de Diputados: [proyecto 1092-D-2025](https://www4.hcdn.gob.ar/dependencias/dsecretaria/Periodo2025/PDF2025/TP2025/1092-D-2025.pdf).

**Secundarias (S)**
- Sobre las normas del BCRA:
  - [Allende & Brea, 15/09/2026, sobre la «A» 8481](https://allende.com/bancario/el-bcra-flexibiliza-el-cobro-de-exportaciones-de-servicios-y-ajusta-reglas-de-acceso-al-mercado-de-cambios-09-15-2026/)
  - [Blog del Contador, 22/09/2025, sobre la «A» 8330](https://blogdelcontador.com.ar/news-46233-exportaciones-de-servicios-como-cobrar-en-dolares-sin-limites-y-condiciones-del-nuevo-regimen-del-bcra)
  - [SmartLog, 19/09/2025](https://www.smartlog.com.ar/blog/una-buena-noticia-para-freelancers-y-exportadores-de-servicios-el-bcra-elimina-el-tope-de-usd-36-000/)
- Sobre el monotributo: [iProfesional, 13/06/2018, causales de exclusión](https://www.iprofesional.com/impuestos/269875-entro-en-vigencia-el-nuevo-listado-de-causales-para-ser-excluido-del-monotributo).
- Sobre la Ley 27.799:
  - [Blog del Contador](https://blogdelcontador.com.ar/news-46449-inocencia-fiscal-se-publico-la-ley-27799-y-ya-rigen-los-nuevos-umbrales-penales-el-aumento-en-multas-y-el-regimen-simplificado-de-ganancias)
  - [Colegio de Escribanos, 05/01/2026](https://www.colegio-escribanos.org.ar/noticias/2026_01_05_Informe-Ley-27799.pdf)
- Sobre Ingresos Brutos:
  - [acta AGIP–CPCECABA, 2018](https://www.consejo.org.ar/storage/attachments/Acta_Grupo_de_Enlace_AGIP-180418.pdf-z90hbOFSm1.pdf)
  - [Ámbito, sobre ARBA](https://www.ambito.com/economia/arba/quienes-estan-exentos-del-impuesto-ingresos-brutos-n5570475)
  - [nota sobre exportaciones exentas](https://evemuriel.com/blog/ingresos-brutos/exportaciones-exentas-ingresos-brutos.html)
  - [Contadores en Red, SIRCREB](https://contadoresenred.com/regimen-simplificado-de-ingresos-brutos-y-las-retenciones-sircreb-su-exclusion-como-hacer-para-que-no-retengan/)
- Sobre las percepciones:
  - [Blog del Contador, 19/12/2024, RG 5617](https://blogdelcontador.com.ar/arca-percepcion-ganancias-operaciones-en-moneda-extranjera)
  - [Infobae, 14/04/2025, RG 5672](https://www.infobae.com/economia/2025/04/14/modificaron-las-percepciones-de-ganancias-y-bienes-personales-para-las-compras-con-moneda-extranjera-turismo-y-pagos-en-el-exterior/)
- Sobre las retenciones en cobros electrónicos: [Marval, 11/09/2024, RG 5554](https://www.marval.com/publicacion/se-eliminan-las-retenciones-impositivas-a-los-cobros-electronicos-16908).
- Sobre la economía del conocimiento: [Ley 27.506, copia del Consejo de Salta](https://consejosalta.org.ar/wp-content/uploads/ley-27506.pdf).

---

## 6. Lo que no pudimos verificar

- **El texto oficial de las Comunicaciones «A» 8330 y «A» 8481 del BCRA.** Los PDF no se pudieron leer. Lo que se dice de ellas sale de estudios y blogs, y las fuentes no coinciden en cuál de las dos eliminó el tope de USD 36.000.
- **El texto consolidado vigente de la Ley 26.565.** Falta para saber cómo quedó la causal de exclusión por importación de servicios (A2).
- **La empresa de Google a la que se factura** (B2).
- **Si las suscripciones vendidas a usuarios de EE. UU. tienen retención** (E2).
- **El encuadre de las ventas por Google Play a usuarios de la Argentina** (B1).
- **El código de actividad de ARCA** (A4).
- **Los códigos fiscales vigentes** de cada jurisdicción para Ingresos Brutos (C2).
- **La percepción del 30% cuando la tarjeta se paga con dólares propios** (G1).
- **Las percepciones de IVA e Ingresos Brutos sobre servicios digitales del exterior** (G2).
- **Las comisiones vigentes de Mercado Pago** (H5).
