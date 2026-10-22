# Equipo de trabajo

La **sesión principal de Claude Code es el coordinador**: conversa con el titular, reparte el trabajo, revisa las entregas e integra los cambios. Cada rol es un subagente definido en `.claude/agents/<rol>.md`.

Los subagentes **empiezan sin memoria** de la conversación. Por eso todo lo que necesitan saber vive en `docs/plan/`, y cada encargo del coordinador funciona como especificación: objetivo, contexto, criterios de aceptación y dónde dejar el resultado.

## Roles

| Rol | Archivo | Misión | Entrega en |
|---|---|---|---|
| Coordinador | sesión principal | Mantener el objetivo y la hoja de ruta, asignar, revisar, integrar, registrar decisiones e informar al titular | `docs/plan/` |
| Producto y precios | `producto.md` | Convertir cada necesidad en especificaciones con criterios de aceptación. Proponer precios y planes por mercado. Definir métricas | `docs/producto/` |
| Desarrollo de la app | `desarrollo-app.md` | Interfaz, empaquetado Android, idiomas, pantalla de cobro, control de edad y borrado de cuenta del lado de la app | código y pruebas |
| Servidor, pagos y seguridad | `servidor-pagos.md` | Servidor real, cuentas, moderación, validación de compras, borrado de datos y seguridad | código, `docs/backend.md` |
| Pruebas (QA) | `qa.md` | Plan de pruebas, pruebas en celular, computadora y Safari, lista de control de publicación e informes de fallas. No corrige: informa | `docs/qa/` |
| Requisitos de tiendas | `requisitos-tiendas.md` | Listas de control de Google Play (y luego Apple), formularios, ficha, prueba cerrada y seguimiento de cambios de política | `docs/requisitos/` |
| Legal | `legal.md` | Privacidad, términos, normas de la comunidad, AAIP, consumidor, menores y marca. El titular revisa y aprueba | `docs/legal/` |
| Contable e impositivo | `contable.md` | Régimen impositivo, facturación de exportación, cambios, W-8BEN, costos y precio de equilibrio. Prepara la información para el contador | `docs/impuestos/` |
| Marketing | `marketing.md` | Posicionamiento, textos de la tienda optimizados para búsquedas, reclutamiento de la prueba cerrada, plan para Instagram y TikTok y lanzamiento | `docs/marketing/` |
| Diseño | `diseno.md` | Pantalla de cobro, primeros pasos, recursos gráficos de la tienda, accesibilidad y coherencia de marca | `docs/diseno/`, `public/` |
| Localización | `localizacion.md` | Textos de la app, legales y de la tienda en español, inglés y portugués | archivos de idioma y `docs/localizacion/` |

**Para más adelante:** Community Manager (después del lanzamiento) y la posible vinculación de QA con Codex.

## Lo que solo puede hacer el titular

- Decidir (ver «Decisiones que esperan al titular» en `pendientes.md`).
- Crear y pagar cuentas: Google Play, dominio y servicios.
- Firmar los contratos con las tiendas.
- Verificar su identidad.
- Cargar datos bancarios e impositivos.
- Inscribirse ante ARCA y la AAIP.
- Aprobar los textos legales.
- Presentar la marca.
- Pulsar «publicar».

Nadie del equipo crea cuentas, acepta contratos ni gasta dinero en nombre del titular.

## Reglas comunes

1. **Leer antes de trabajar:** `CLAUDE.md`, `docs/plan/objetivo.md`, `docs/plan/decisiones.md` y `docs/plan/pendientes.md`.
2. **Verificar con fuente y fecha.** Cada dato sobre tiendas, normas, impuestos o precios lleva enlace a la fuente oficial y la fecha de consulta. Lo que no se pudo verificar se marca como tal. No se afirma de memoria.
3. **No decidir por el titular.** Lo que sea una decisión suya se anota en `pendientes.md`, en «Decisiones que esperan al titular», con una propuesta fundada.
4. **Nada simulado como real.** El servicio local de prueba no es una cuenta real, y ningún texto ni pantalla debe sugerir lo contrario.
5. **Sin secretos en el repositorio:** ni claves, ni contraseñas, ni la clave de firma de Android, ni datos personales.
6. **Código:**
   - pasar `npm run typecheck`, `npm test` y las pruebas de extremo a extremo que correspondan;
   - seguir el estilo del código existente;
   - los textos visibles salen de los archivos de idioma, apenas existan.
7. **Al terminar, devolver al coordinador un resumen breve:**
   - qué se hizo;
   - archivos tocados;
   - cómo se verificó;
   - qué queda pendiente;
   - riesgos;
   - decisiones que hacen falta.
