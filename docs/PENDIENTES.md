# Pendientes de SQLearning

Lista viva de tareas y decisiones. Mantenerla al día.

## Fase 1 · Base
- [x] Repo propio (`main`), `docs/HISTORIA.md`, `docs/PLAN_CURSO.md`, `docs/FORMATO_LECCION.md`
- [x] Agente `.claude/agents/profesor-sql.md`
- [x] Servidor local (`npm run servir`)
- [x] Etapa 0 opcional «El archivo de papel» (petición del usuario) añadida al temario y al formato

## Revisiones periódicas (petición del usuario)
Agentes `.claude/agents/alumno-novato.md` (hace el curso como novato) y `.claude/agents/qa-estres.md` (intenta romper la app).
Solo escriben informes en `docs/revisiones/` y escenarios en `tests/navegador/agentes/`; no tocan la app.
**Cuándo:** al cerrar cada fase y cada etapa, y siempre antes de publicar. Primero `qa-estres`, luego
`alumno-novato` (nunca a la vez: comparten puertos). Tras cada revisión: el coordinador arregla, anota aquí lo que
quede pendiente y vuelve a pasar los tests.
- [ ] Revisión fin de fase 2 (motor) — solo `qa-estres` (aún no hay curso que recorrer)
- [ ] Revisión fin de fase 3 (interfaz)
- [ ] Revisión etapa 1 antes de publicar (las dos)

## Fase 2 · Motor
- [x] Vendorizar PGlite 0.5.10 (`vendor/pglite/`, 18,3 MB) en un Web Worker; corte a los 4 s con reinicio y recarga de datos
- [x] `herramientas/generar-datos.mjs` (semilla fija) → `datos/faro-e1.sql`
- [x] Traductor de errores (`js/traductor.js`), revisor (`js/revisor-sql.js`), `PRUEBA` (`js/pruebas.js`)
- [x] Batería `tests/probar-motor.html` + arnés `tests/navegador/cdp.mjs` (26/26)
- [ ] Editor SQL (resaltado, autocompletado de tablas/columnas, Ctrl+Enter)
- [ ] Resultado: tabla, esquema, mensajes de error traducidos (interfaz)

## Fase 3 · Interfaz
- [ ] Inicio + mapa + progreso + expediente (adaptados de CSS-HTML, identidad visual nueva)
- [ ] Pasos «sobre el papel»: `clasificar`, `seleccionar`, `ordenar`, `diagrama`

## Fase 4 · Primer hito jugable
- [ ] Etapa 1 completa + tests → publicar en GitHub Pages
- [ ] Etapa 0 completa

## Decisiones abiertas
- (ninguna por ahora)
