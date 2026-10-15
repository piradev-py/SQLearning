# Datos de Faro (para quien escribe lecciones)

> ⚠️ Spoilers. Los datos los genera `herramientas/generar-datos.mjs` con semillas fijas: **siempre salen iguales**.
> Una vez escritas las lecciones de una etapa, sus datos **no se tocan** (las cifras de las lecciones dependen de ellos).
> Cada etapa tiene su archivo `datos/faro-eN.sql`, que contiene todas las tablas vistas hasta entonces.

## Etapa 1 · `faro-e1.sql` (semilla 1998) — CONGELADO (salvo la tienda 6, añadida para cuadrar con la locución del prólogo)
`tiendas` (6: 1 Madrid, 2 Valencia, 3 Sevilla, 4 Bilbao, 5 Online, 6 Barcelona inaugurada el 2026-10-01, **sin pedidos** hasta las etapas avanzadas) · `empleados` (22) · `productos` (40). Pista: «Auriculares Sonora Pulse» con stock −12.

## Universo de clientes y pedidos (semilla 2026) — desde la etapa 2
Un único universo que las etapas siguientes van mostrando por partes:

| Tabla | Filas aprox. | Columnas | Desde |
|---|---|---|---|
| `clientes` | 300 | id, nombre, email, telefono (a veces NULL), ciudad (a veces NULL), socio, alta (timestamp) | e2 |
| `pedidos` | ~2 500 | id, cliente_id, tienda_id, fecha (timestamp), estado, total, metodo_pago, nota (casi siempre NULL) | e2 |
| `reclamaciones` | ~40 | id, cliente_id, pedido_id, fecha, motivo, estado | e2 |
| `lineas_pedido` | ~5 000 | pedido_id, producto_id, cantidad, precio_unitario (suman el total del pedido) | e3 |

- `estado` ∈ `entregado`, `en camino`, `cancelado`, `reembolsado`. `metodo_pago` ∈ `tarjeta`, `bizum`, `efectivo` (solo tienda física), `transferencia`.
- Pedidos de enero de 2024 a septiembre de 2026. En tienda física, de 10:00 a 21:00; online, a cualquier hora (de noche, pocos).
- Ciudades de clientes: las 4 de las tiendas más Barcelona, Zaragoza, Málaga, Valladolid y **Getafe** (solo la usan los falsos).

### Lo que siembra el Fantasma (no debe llamar la atención en las lecciones normales)
- **9 clientes falsos**: email `@correo-rapido.example`, ciudad `Getafe` (donde está el almacén central), alta entre las
  02:00 y las 04:59, entre marzo y agosto de 2026, `socio = false`, sin teléfono.
- Cada falso tiene 2–4 pedidos **online** (tienda 5), de madrugada, caros (300–1 200 €), todos `reembolsado`.
- **La reclamación clave**: una clienta real de Bilbao reclama un pedido que no reconoce (motivo con «no reconozco»).
  Ese pedido es online, de madrugada y `reembolsado`. Es el hilo del caso de la etapa 2 («Clientes de madrugada»).
- Hay unos pocos clientes **reales** dados de alta de madrugada (con dominios normales), para que el filtro necesite
  combinar condiciones.
- Los reembolsos online quedan claramente por encima del resto de tiendas (pista de la etapa 3).

### Cifras comprobadas de `faro-e2.sql` (consultadas con PGlite)
- 300 clientes (291 reales + 9 falsos, ids 292–300), 2 524 pedidos, 40 reclamaciones. 40 clientes sin teléfono, 10 sin ciudad.
- 10 clientes **reales** dados de alta antes de las 06:00.
- Falsos: altas entre 02:00 y 04:59 (marzo–agosto 2026); 68 pedidos suyos, todos online, de madrugada, `reembolsado`.
- La reclamación clave: **Iratxe Muñoz** (Bilbao), motivo «No reconozco este pedido: yo no lo hice», pedido **2210**,
  2026-08-14 03:12, online, reembolsado, 129,00 €.
- Reembolsos: online 6,7 % (103 de 1 527) frente a ~2 % en las tiendas físicas.

### Cifras comprobadas de `faro-e3.sql` (consultadas con PGlite)
Igual que `faro-e2.sql` (mismas filas y cifras) + `lineas_pedido` + columna `pedidos.mes` (`'YYYY-MM'`).
- `lineas_pedido`: 4 022 líneas, 4 972 unidades. **El total de cada pedido = suma de sus líneas** (0 descuadres) y todos los pedidos tienen líneas.
- Ticket medio 406,23 € · pedido mínimo 12,90 € · máximo 4 404,00 €.
- Por tienda (pedidos · reembolsados · facturado redondeado): 1 Madrid 429 · 7 · 169 450 € — 2 Valencia 187 · 2 · 71 434 € — 3 Sevilla 225 · 6 · 97 499 € — 4 Bilbao 156 · 5 · 49 021 € — 5 Online 1 527 · **103** · 637 914 € — 6 Barcelona sin pedidos.
- Por mes: de enero de 2024 (45 pedidos, 12 058 €) a septiembre de 2026 (202 pedidos, 89 152 €); crecimiento fuerte en 2026.
- Reembolsos online por mes: hasta enero de 2026 entre 1 y 4; **febrero 0**; desde marzo de 2026 se disparan (9, 13, 13, 9, 6, **19 en agosto**, 13).
- Top unidades vendidas (producto_id · unidades): 16 · 156; **13 y 32 empatan con 142**; 2 · 139; 8 · 138 → desempatar por `producto_id`.
- 47 clientes con más de 15 pedidos; 12 productos con más de 130 unidades; 284 clientes distintos han comprado online.
- Los 4 productos descatalogados (`activo = false`) tienen 387 líneas: se vendían hasta hace poco y se acaban de retirar.

Las cifras exactas se consultan con el propio motor (laboratorio o `tests/`), nunca a ojo.
