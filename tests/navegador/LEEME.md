# Pruebas en navegador (Edge sin ventana)

`cdp.mjs` arranca el servidor local (puerto 8099, PGlite necesita http) y Edge headless controlado por
DevTools Protocol (puerto 9334), y ejecuta un escenario. **Nunca dos escenarios a la vez** (comparten puertos).

```
node tests/navegador/cdp.mjs esc-motor.mjs
npm test        # todas, una detrás de otra, con resumen
```

| Escenario | Qué hace | Tiempo |
|---|---|---|
| `esc-motor.mjs` | Batería de `tests/probar-motor.html`: motor, aislamiento, tiempo límite, errores traducidos, revisor, PRUEBA | ~10 s |
| `esc-inicio.mjs` | Prólogo obligatorio (normal y reducido), hoja de ruta, expedientes clasificados, hilos, progreso con avance, diálogos, modo prueba, progreso corrupto, tamaños | ~40 s |
| `esc-papel.mjs` | Batería de `tests/probar-papel.html`: clasificar (también Venn), seleccionar filas/celdas/columnas, ordenar, diagrama | ~5 s |
| `esc-verificar.mjs` | `tests/verificar-lecciones.html`: cada nivel listo cumple el formato, sus soluciones aprueban, los iniciales suspenden, los ejemplos funcionan | crece con el curso |
| `esc-leccion.mjs` | e1-01 y e0-01 como alumno: bloqueos, errores típicos, pistas, reto, pantalla final, bloques y créditos, repetir para mejorar, hoja de ruta | ~60 s |
| `esc-laboratorio.mjs` | Laboratorio como usuario: teclea, autocompleta, Ctrl+Enter, error con línea, esquema, borrador, tema día, tamaños; fotos en `salida/` | ~30 s |

## API del escenario
`export default async function (b) { … }` con:
- `b.ir("ruta/relativa.html")` · `b.eval("expresión JS")` (devuelve el valor, espera promesas)
- `b.hasta("condición JS", ms)` espera a que se cumpla · `b.esperar(ms)`
- `b.tam(ancho, alto)` · `b.oscuro(true)` · `b.reducido()` · `b.foto("nombre")` → `salida/nombre.png`
- `b.cdp(método, params)` (DevTools Protocol en crudo) · `b.log(...)` · `b.errores` (errores JS de la página)

Los agentes de revisión (`alumno-novato`, `qa-estres`) guardan sus escenarios en `agentes/` y sus informes en `docs/revisiones/`.
