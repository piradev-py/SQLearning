# SQLearning · El Fantasma de Faro

**Aprende SQL de cero a Data Analyst resolviendo un misterio en una ciudad de neón.**

▶ **Jugar:** https://piradev-py.github.io/SQLearning/

En Faro, una empresa tecnológica con cinco tiendas y una tienda online, algo extraño está ocurriendo: productos
que desaparecen, clientes que nunca existieron y reembolsos imposibles. Le llaman **el Fantasma**. Lucía Mora, jefa
de datos, te ha elegido para descubrir la verdad. Tu única herramienta es SQL.

## Qué vas a aprender
- **Expediente 0 · El archivo de papel** *(opcional)*: pensar en datos antes de tocar una tecla — tipos de datos,
  lógica, conjuntos, entidades, relaciones, diagramas entidad-relación, el ciclo del análisis y privacidad.
- **Expediente 1 · Primer día**: tus primeras consultas con `SELECT`, columnas calculadas, alias, `DISTINCT`,
  `ORDER BY`, `LIMIT` … y un inventario que no cuadra.
- **Expedientes 2–8** *(en preparación)*: filtrar, resumir, cruzar tablas, limpiar datos, diseñar bases de datos,
  consultas avanzadas y analítica de negocio hasta desenmascarar al Fantasma.

## Cómo se juega
- Cada expediente es una línea de investigación; cada **diligencia**, una herramienta de SQL.
- Escribes consultas reales: la web lleva **PostgreSQL de verdad** dentro del navegador. Puedes equivocarte (o
  borrar tablas) sin miedo: nada de lo que hagas estropea los datos.
- Ganas **créditos ◈**, **bloques verificados** (más si no usas pistas), **credenciales** y subes de nivel de
  autorización, de Becario a Head of Data.
- El **Laboratorio** es tu zona de práctica libre con toda la base de datos de Faro.

Funciona en cualquier navegador moderno de ordenador o tablet. La primera visita descarga unos 20 MB (el motor de
PostgreSQL); después queda en la caché.

---

## Para programadores
HTML, CSS y JavaScript sin frameworks ni compilación. PostgreSQL corre en el navegador con
[PGlite](https://github.com/electric-sql/pglite) (vendorizado en `vendor/pglite/`) dentro de un Web Worker.

```
npm run servir     # servidor local en http://localhost:8080 (PGlite necesita http, no file://)
npm test           # todas las baterías en Edge sin ventana (tests/navegador/)
npm run datos      # regenera los datos de Faro (semillas fijas) y la ciudad neón
```

| Dónde | Qué |
|---|---|
| `js/motor-sql.js`, `js/motor-worker.js` | Motor: transacción de práctica, corte por tiempo, recarga si el alumno se sale |
| `js/revisor-sql.js`, `js/pruebas.js` | Revisión por resultado (no por cómo se escribe la consulta) |
| `js/leccion.js`, `js/papel.js` | Página de lección y pasos «sobre el papel» |
| `lecciones/` | Contenido (formato en `docs/FORMATO_LECCION.md`) |
| `datos/`, `herramientas/generar-datos.mjs` | Datos de Faro por etapa (ver `docs/DATOS.md`) |
| `docs/` | Plan del curso, historia, estilo, pendientes, licencias y revisiones |

Licencias y créditos: `docs/LICENCIAS.md` (PGlite Apache-2.0; música y locución hechas con Suno).
