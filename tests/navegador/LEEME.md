# Pruebas en navegador (Edge sin ventana)

`cdp.mjs` arranca el servidor local (puerto 8099, PGlite necesita http) y Edge headless controlado por
DevTools Protocol (puerto 9334), y ejecuta un escenario. **Nunca dos escenarios a la vez** (comparten puertos).

```
node tests/navegador/cdp.mjs esc-motor.mjs
```

| Escenario | Qué hace | Tiempo |
|---|---|---|
| `esc-motor.mjs` | Batería de `tests/probar-motor.html`: motor, aislamiento, tiempo límite, errores traducidos, revisor, PRUEBA | ~10 s |
| `esc-laboratorio.mjs` | Laboratorio como usuario: teclea, autocompleta, Ctrl+Enter, error con línea, esquema, borrador, tema día, tamaños; fotos en `salida/` | ~30 s |

## API del escenario
`export default async function (b) { … }` con:
- `b.ir("ruta/relativa.html")` · `b.eval("expresión JS")` (devuelve el valor, espera promesas)
- `b.hasta("condición JS", ms)` espera a que se cumpla · `b.esperar(ms)`
- `b.tam(ancho, alto)` · `b.oscuro(true)` · `b.reducido()` · `b.foto("nombre")` → `salida/nombre.png`
- `b.cdp(método, params)` (DevTools Protocol en crudo) · `b.log(...)` · `b.errores` (errores JS de la página)

Los agentes de revisión (`alumno-novato`, `qa-estres`) guardan sus escenarios en `agentes/` y sus informes en `docs/revisiones/`.
