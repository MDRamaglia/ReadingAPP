# Registro de decisiones

Cada decisión lleva fecha y quién la tomó. Para cambiar una, se agrega una entrada nueva que la reemplaza. Las anteriores no se borran.

| # | Fecha | Decisión | Decidió |
|---|---|---|---|
| D01 | 2026-10-22 | Android primero, iPhone después. La versión web sigue publicada | Titular |
| D02 | 2026-10-22 | Modelo freemium: plan gratuito y plan premium por suscripción. La distribución de funciones vive en `src/config/plans.ts` | Titular |
| D03 | 2026-10-22 | La app se publica como **persona humana** (ver consecuencias abajo) | Titular |
| D04 | 2026-10-22 | Mercados: Argentina, Latinoamérica, Brasil y público de habla inglesa | Titular |
| D05 | 2026-10-22 | Idiomas: español, inglés y portugués | Titular |
| D06 | 2026-10-22 | Edad mínima: 16 años, reflejada en el registro, los términos y la clasificación | Titular |
| D07 | 2026-10-22 | Equipo según `docs/plan/equipo.md`. El Community Manager se suma después del lanzamiento. Vincular QA con Codex queda para evaluar | Titular |
| D08 | 2026-10-22 | Se hizo la búsqueda de antecedentes de la marca (`docs/legal/busqueda-de-marca.md`). La decisión sobre el nombre está pendiente | Titular |
| D09 | 2026-10-22 | **Edad (reemplaza a D06):** registrarse en la app queda abierto a cualquier edad; el **Reading Club exige 16 años o más**. Legal y Requisitos de tiendas analizan las implicancias de que haya menores registrados (público objetivo de Google Play, consentimiento, contenido de usuarios) | Titular |
| D10 | 2026-10-22 | El panel de desarrollo (`?dev=1`) se mantiene hasta que la publicación esté cerca. Se cierra antes de la versión candidata | Titular |
| D11 | 2026-10-22 | Nombre: la prioridad es conservar «Knowmadic». Se analizan alternativas como respaldo | Titular |
| D12 | 2026-10-24 | **Nombre:** con EE. UU. en el primer lanzamiento, se avanza con **«Bookmadic»**, salvo que la verificación final confirme que «Knowmadic» se puede registrar y usar en todos los mercados del lanzamiento, incluido EE. UU. (donde hoy hay un registro vigente). Ver P45 | Titular |
| D13 | 2026-10-24 | **Edad (reemplaza a D09):** opción B de Legal. Leer sin cuenta, a cualquier edad. **Cuenta desde los 13 años**, con la fecha de nacimiento al registrarse. **Reading Club desde los 16.** Los menores de 18 necesitan autorización para pagar. En Brasil, cuenta desde los 16 hasta verificar el ECA Digital | Titular |
| D14 | 2026-10-24 | **Países del primer lanzamiento:** Argentina, el resto de Latinoamérica de habla hispana (salvo Colombia y Perú, donde el IVA queda a cargo del desarrollador) y **EE. UU.** Brasil y Canadá, después | Titular |
| D15 | 2026-10-24 | **Público objetivo en Google Play:** desde 13 años (grupos 13-15, 16-17 y 18+), sin política de Familias. La comunicación apunta sobre todo a lectores adultos | Titular |
| D16 | 2026-10-24 | **Moderación:** la hace el titular hasta que llegue el Community Manager, incluida la prueba cerrada | Titular |
| D17 | 2026-10-24 | Categoría de Google Play: «Libros y obras de consulta». En el nombre de la ficha y en los rótulos de la app, «DOCX» en lugar de «Word» | Titular |

## Consecuencias de D03 (persona humana)

**Google Play**
- La cuenta es personal.
- Muestra nombre legal, país y correo, y al monetizar también la **dirección completa**.
- Exige la prueba cerrada de 12 personas durante 14 días antes de publicar.

**App Store (más adelante)**
- El nombre propio figura como vendedor.
- En la Unión Europea se publican dirección o casilla postal, teléfono y correo.

**Responsabilidad y operación**
- La responsabilidad es personal, sin limitación. Los términos tienen que incluir las limitaciones que la ley permita.
- El régimen impositivo (monotributo o responsable inscripto) lo define el contador.
- No hace falta D-U-N-S.
- Si más adelante se crea una sociedad, Google permite transferir las apps a otra cuenta de desarrollador. Pasan los usuarios, las valoraciones y la ficha; no pasan los informes de ingresos ni los pedidos anteriores ([fuente](https://support.google.com/googleplay/android-developer/answer/6230247)). En Apple, a verificar cuando llegue el momento.
