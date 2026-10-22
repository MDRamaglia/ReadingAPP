# Pendientes

Estados: **pendiente**, **en curso**, **bloqueado** (con el motivo) y **hecho**.

## Decisiones que esperan al titular

| # | Decisión | Propuesta del equipo | Prepara |
|---|---|---|---|
| T01 | **Nombre de la app**: mantener «Knowmadic» (prioridad, D11) o cambiarlo antes de publicar | Ver `docs/legal/busqueda-de-marca.md`. En curso: nombres alternativos (Marketing) y matriz de riesgos con recomendación (Legal) | Legal y Marketing |
| T02 | Proveedor del servidor | Supabase: autenticación con correo, Postgres con reglas por fila; encaja con `docs/backend.md`. En curso: análisis comparativo de T02, T03 y T04 | Servidor |
| T03 | Empaquetado para Android | Capacitor: sirve después para iPhone y permite compras nativas | Desarrollo app |
| T04 | Herramienta de cobros | RevenueCat: una integración para las dos tiendas, gratis hasta USD 2.500 por mes | Servidor |
| T05 | Precios y planes (mensual y anual) por mercado | Propuesta por mercado: Argentina, resto de Latinoamérica, Brasil y países de habla inglesa | Producto y precios |
| T06 | Variante del español: voseo (Argentina) o neutro (resto de Latinoamérica) | La app hoy usa voseo. Opción: «es-AR» con voseo y «es-419» neutro | Localización |
| T07 | Países del primer lanzamiento | Empezar por América, sin la Unión Europea, para no sumar DSA y RGPD al principio | Requisitos de tiendas y Legal |

## Tareas

| # | Tarea | Responsable | Depende de | Estado |
|---|---|---|---|---|
| P01 | Cerrar el panel de desarrollo (`?dev=1`) en la versión publicada | Desarrollo app | Versión candidata (D10) | pospuesto |
| P02 | Servidor real: cuentas, recuperación por correo, reseñas, likes y club (`remoteBackend.ts`) | Servidor | T02 | pendiente |
| P03 | Borrado de cuenta dentro de la app y página web de borrado | Desarrollo app y Servidor | P02 | pendiente |
| P04 | Política de privacidad, términos y normas de la comunidad, enlazados en la app | Legal y Localización | T01 | en curso (borradores) |
| P05 | Moderación: denunciar, bloquear, filtrar y cola de revisión | Servidor y Desarrollo app | P02 | pendiente |
| P06 | Control de edad (16+) para el Reading Club; registro sin límite de edad (D09) | Desarrollo app y Legal | — | en curso |
| P07 | Empaquetado Android y resguardo de la clave de firma | Desarrollo app | T03 | pendiente |
| P08 | Google Play Billing validado en el servidor, con restauración y gestión de la suscripción | Servidor y Desarrollo app | P02, T04 | pendiente |
| P09 | Pantalla de cobro conforme a las reglas de las tiendas | Diseño, Desarrollo app y Producto | T05 | pendiente |
| P10 | Internacionalización: estructura de idiomas con el español como base (en curso); textos en en y pt (después) | Desarrollo app y Localización | T06 para la variante del español | en curso |
| P11 | Migración de los datos locales (cuentas de prueba, preferencias y biblioteca) a la cuenta real | Desarrollo app y Servidor | P02 | pendiente |
| P12 | Dominio propio y correo de soporte | Titular (compra) y Servidor (configuración) | T01 | pendiente |
| P13 | Ficha de Google Play en tres idiomas: textos, capturas y gráficos | Marketing, Diseño y Localización | T01 | pendiente |
| P14 | Formularios de Play: seguridad de datos, clasificación, público objetivo y anuncios | Requisitos de tiendas y Legal | P02, P04 | pendiente |
| P15 | Reclutar al menos 12 personas para la prueba cerrada de 14 días | Marketing y Titular | — | pendiente |
| P16 | Inscripción de la base de datos en la AAIP | Legal (prepara la guía, en curso) y Titular (trámite) | P02 | en curso (guía) |
| P17 | Alta impositiva, facturación de exportación, W-8BEN y cuenta en dólares | Contable (prepara las preguntas para el contador, en curso), Titular y contador | — | en curso |
| P18 | Registro de la marca elegida (INPI Argentina y Brasil) | Legal y Titular | T01 | pendiente |
| P19 | Plan de pruebas y lista de control de publicación | QA, sobre la lista de control de Requisitos | P22 | pendiente |
| P20 | Medición de uso y errores, con consentimiento | Servidor y Legal | P02 | pendiente |
| P21 | Crear la cuenta personal de Google Play: pago, verificación de identidad y dispositivo | Titular, con la guía de Requisitos | P23 | pendiente |
| P22 | Lista de control oficial de Google Play contrastada con el estado real de la app | Requisitos de tiendas | — | en curso |
| P23 | Guía paso a paso para crear la cuenta personal y explicación de la prueba cerrada | Requisitos de tiendas | — | en curso |

## Para más adelante

- Community Manager: moderación diaria, soporte y respuestas a las reseñas de la tienda.
- Publicación en el App Store (pauta 4.2, Mac, USD 99 por año).
- Vincular QA con Codex para las correcciones (a evaluar).
