# Knowmadic

App de lectura de documentos Word y PDF en español, con modo libro, modo renglón y OCR. Tiene cuentas, reseñas, el foro Reading Club y planes gratuito y premium. Está hecha con Vite, Preact y TypeScript, como PWA publicada en GitHub Pages. Los documentos se procesan y guardan en el dispositivo.

## Objetivo actual

Dejarla lista para publicarse y monetizarse en **Google Play**; el iPhone viene después.

Antes de trabajar, leé:
- `docs/plan/objetivo.md`
- `docs/plan/decisiones.md`
- `docs/plan/pendientes.md`

Los datos verificados sobre tiendas, cobros y normas, con fuentes y fechas, están en `docs/plan/investigacion.md`.

## Equipo

La sesión principal coordina. Los roles están en `.claude/agents/` y se describen en `docs/plan/equipo.md`, junto con las reglas comunes.

## Dónde está cada cosa

- **Planes y permisos:** `src/config/plans.ts` y `src/lib/access.ts`.
- **Comunidad** (categorías, largos de texto y orden de las reseñas): `src/config/community.ts`.
- **Servicios:** el contrato está en `src/services/backend.ts`. El servicio local de prueba está en `localBackend.ts` y **no es una cuenta real**. El adaptador remoto pendiente está en `remoteBackend.ts`. La guía está en `docs/backend.md`.
- **Panel de desarrollo:** `src/dev/` (se activa con `?dev=1`).

## Comandos

```bash
npm run typecheck   # tipos
npm test            # pruebas unitarias (Vitest)
npm run test:e2e    # extremo a extremo (Playwright: celular y computadora)
npm run build       # compilación
xvfb-run -a python3 scripts/webkit/probar_safari.py   # motor de Safari, con la app servida
```

## Reglas

- Los textos visibles están en español con voseo (la variante para el resto de Latinoamérica está pendiente de decisión). Se suman inglés y portugués.
- No presentar como real nada simulado.
- Sin secretos en el repositorio. La clave de firma de Android nunca se sube.
- Las decisiones del titular se registran en `docs/plan/decisiones.md`. Lo que espera su decisión va en `docs/plan/pendientes.md`.
