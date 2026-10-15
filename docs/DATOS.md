# Datos de Faro (para quien escribe lecciones)

> ⚠️ Spoilers. Los datos los genera `herramientas/generar-datos.mjs` con semillas fijas: **siempre salen iguales**.
> Una vez escritas las lecciones de una etapa, sus datos **no se tocan** (las cifras de las lecciones dependen de ellos),
> salvo para corregir un fallo de una revisión (y entonces se vuelve a pasar el verificador). Cambios así: altas de clientes
> movidas a la víspera de su primer pedido (revisión de las etapas 3–4); responsable del Almacén central en la etapa 4.
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
  02:00 y las 04:59, entre el 4 de marzo y el 30 de abril de 2026 (siempre antes de su primer pedido), `socio = false`, sin teléfono.
- Cada falso tiene 2–4 pedidos **online** (tienda 5), de madrugada, caros (300–1 200 €), todos `reembolsado`.
- **La reclamación clave**: una clienta real de Bilbao reclama un pedido que no reconoce (motivo con «no reconozco»).
  Ese pedido es online, de madrugada y `reembolsado`. Es el hilo del caso de la etapa 2 («Clientes de madrugada»).
- Hay unos pocos clientes **reales** dados de alta de madrugada (con dominios normales), para que el filtro necesite
  combinar condiciones.
- Los reembolsos online quedan claramente por encima del resto de tiendas (pista de la etapa 3).

### Cifras comprobadas de `faro-e2.sql` (consultadas con PGlite)
- 300 clientes (291 reales + 9 falsos, ids 292–300), 2 524 pedidos, 40 reclamaciones. 40 clientes sin teléfono, 10 sin ciudad.
- 10 clientes **reales** dados de alta antes de las 06:00.
- Falsos: altas entre 02:00 y 04:59 (2026-03-04 … 2026-04-30); 68 pedidos suyos, todos online, de madrugada, `reembolsado`.
- La reclamación clave: **Iratxe Muñoz** (Bilbao), motivo «No reconozco este pedido: yo no lo hice», pedido **2210**,
  2026-08-14 03:12, online, reembolsado, 129,00 €.
- Reembolsos: online 6,7 % (103 de 1 527) frente a ~2 % en las tiendas físicas.

### Cifras comprobadas de `faro-e3.sql` (consultadas con PGlite)
Igual que `faro-e2.sql` (mismas filas y cifras) + `lineas_pedido` + columna `pedidos.mes` (`'YYYY-MM'`).
- `lineas_pedido`: 4 022 líneas, 4 972 unidades. **El total de cada pedido = suma de sus líneas** (0 descuadres) y todos los pedidos tienen líneas.
- Ticket medio 406,23 € · pedido mínimo 12,90 € · máximo 4 404,00 €.
- Por tienda (pedidos · reembolsados · facturado redondeado): 1 Madrid 429 · 7 · 169 450 € — 2 Valencia 187 · 2 · 71 434 € — 3 Sevilla 225 · 6 · 97 499 € — 4 Bilbao 156 · 5 · 49 021 € — 5 Online 1 527 · **103** · 637 914 € — 6 Barcelona sin pedidos.
- Por mes: de enero de 2024 (45 pedidos, 12 058 €) a septiembre de 2026 (202 pedidos, 89 152 €); crecimiento fuerte en 2026.
- Reembolsos online por mes: hasta enero de 2026 como mucho 4 (hay meses con 0); **febrero 0**; desde marzo de 2026 se disparan (9, 13, 13, 9, 6, **19 en agosto**, 13).
- Top unidades vendidas (producto_id · unidades): 16 · 156; **13 y 32 empatan con 142**; 2 · 139; 8 · 138 → desempatar por `producto_id`.
- 47 clientes con más de 15 pedidos; 12 productos con más de 130 unidades; 284 clientes distintos han comprado online.
- Los 4 productos descatalogados (`activo = false`) tienen 387 líneas: se vendían hasta hace poco y se acaban de retirar.

## Etapa 4 · `faro-e4.sql` (semilla 4004 para lo nuevo)
Igual que `faro-e3.sql` (mismas filas y cifras) + `empleados.jefe_id` + `almacenes` + `transportistas` + `envios`.
- `empleados.jefe_id` → `empleados.id` (self join). **Nuevo empleado 23, Iker Salas** (Logística, jefe de muelle del Almacén central, `jefe_id` = Héctor): en la etapa 4 hay **23 empleados** (22 en e1–e3). Ana Beltrán (1) no tiene jefe; los 6 responsables de departamento
  dependen de ella; las tiendas, de Elena Ruiz y sus encargados (p. ej. Carmen Llorente → Pablo Herrero → Elena Ruiz → Ana).
- `almacenes` (5): 1 Almacén central (**Getafe**, responsable **Iker Salas**, id 23, que depende de Héctor: Héctor solo aparece siguiendo el organigrama) · 2 Levante (Valencia, Óscar Medina) ·
  3 Sur (Sevilla, Beatriz Soto) · 4 Norte (Bilbao, **responsable NULL**) · 5 Zaragoza (abierto 2026-09-21, **sin envíos**).
- `transportistas` (4): Rayo Express 482 envíos · Paquetería Norte 244 · Mensajería Sur 611 · **Logística Delta 0**.
- `envios` (1 337): solo pedidos **online** (en tienda física no hay envío). `pedido_id` UNIQUE, `salida`, `entrega`
  (NULL si no llegó), `estado` ∈ `entregado` 1 232 · `en reparto` 65 · `devuelto` 40; `coste` 3,90–9,90 € (total 9 245,80 €, media 6,92 €).
- Por almacén: central 720 · Levante 274 · Sur 252 · Norte 91 · Zaragoza 0. Entrega media ≈ 2,5 días en todos.
- Almacén según la ciudad del cliente: Valencia/Barcelona → Levante; Sevilla/Málaga → Sur; Bilbao → Norte; el resto → central.
- Huérfanos: 6 clientes sin pedidos; todos los productos se han vendido alguna vez.
- Online sin envío: 127 cancelados (normal) y **63 reembolsados** (la pista).
- Conjuntos: ciudades de almacenes que no tienen tienda (`EXCEPT`) → Getafe y Zaragoza.

- Comprobado con PGlite para el temario: `almacenes FULL JOIN tiendas ON ciudad` 8 filas · ciudades de tiendas y almacenes:
  UNION 8, UNION ALL 11, INTERSECT Bilbao/Sevilla/Valencia, tiendas EXCEPT almacenes Barcelona/Madrid/Online · self join
  INNER 22, LEFT 23; subordinados directos: Ana 6, Elena 6, Héctor 3, Marcos 2, Aitor/Jorge/Lucía/Pablo/Raúl 1 ·
  `almacenes CROSS JOIN transportistas` 20 · `pedidos JOIN lineas_pedido` 4 022 · pedido 1 = Disco SSD Volta 1 TB ×1 + Bombilla Lumen Smart ×2.
- Envíos por almacén y transportista: central 361 Rayo + 359 Mensajería Sur · Levante 121 Rayo + 153 Paquetería Norte ·
  Sur 252 Mensajería Sur · Norte 91 Paquetería Norte (el resto de parejas, 0).
- Trampa ON/WHERE: `LEFT JOIN envios … WHERE e.estado = devuelto` deja 4 almacenes (Zaragoza desaparece): central 25, Levante 10, Sur 3, Norte 2.

### Lo que siembra el Fantasma en la etapa 4 (caso «Pedidos fantasma»)
- Los **63 pedidos online reembolsados sin envío**: 62 de los clientes `@correo-rapido.example` + el **2210** (el que reclama
  Iratxe Muñoz). 10 clientes distintos, **31 380,20 €**, entre 2026-03-05 y 2026-09-25, todos de madrugada.
- Los otros **6** pedidos del Fantasma sí tienen envío, **todos del Almacén central (Getafe)**, `devuelto` y **sin `entrega`**
  (los devueltos normales sí tienen fecha de entrega). Los reembolsos normales (34) tienen envío de su almacén.
- No se nombra a Héctor como sospechoso (regla de HISTORIA): el almacén central «lo firma», sin más.

## Etapa 5 · `faro-e5.sql` (semilla 5005 para lo nuevo)
Igual que `faro-e4.sql` + `crm_clientes` (el CRM antiguo, **todo en texto y sucio**) + `fichas_empleados` (RR. HH.).
- `crm_clientes` (**332** filas): `crm_id`, `nombre`, `email`, `telefono`, `direccion`, `cp`, `ciudad`, `fecha_alta`, `gasto_total`, `socio`
  (todas `text`). Son los 300 clientes + **20 duplicados** (la misma persona dos veces, con otro formato y gasto 0) + **12 clientes
  viejos** (`@antiguo.example`) que nunca pasaron a `clientes`. Orden barajado.
  - `nombre`/`email`/`ciudad` con mayúsculas y espacios de más: **44** emails distintos de `lower(trim(email))`; 42 ciudades distintas
    tal cual, **10** con `initcap(trim(ciudad))` (incluida la cadena vacía); ciudad `NULL` 7 y `''` 4.
  - `email` normalizado (`lower(trim(email))`): **312** personas distintas; une con `clientes.email` (los 12 viejos no casan).
  - `telefono`: `+34…` 125 · seguido 59 · con guiones 55 · con espacios 51 · `NULL` 20 · `N/D` 12 · `''` 10. Con
    `right(regexp_replace(telefono, '[^0-9]', '', 'g'), 9)` quedan 290 de 9 cifras.
  - `cp`: **19** con 4 cifras (Barcelona: el Excel se comió el 0 de `08…`). `fecha_alta`: 199 `AAAA-MM-DD` y 133 `DD/MM/AAAA`;
    atípicos **`1900-01-01`** y **`31/12/2099`**. `gasto_total`: `1234.50` o `1.234,50` (a veces con ` €`); suma 1 948 954,01 con el
    atípico **`999999.00`**; sin él, media 2 866,93 y máximo 11 286,40. `socio`: `S/N`, `si/Sí/no`, `1/0`, `true/false`, `''`.
- `direccion` escrita a mano: «Calle X 12, 3ºB», «C/ X, 12»… Normalización del caso:
  `regexp_replace(replace(lower(direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g')` (las tildes desaparecen, da igual).
  Con `lower(trim(...))` solo, las de los falsos siguen siendo 9 distintas.
- `fichas_empleados` (23): dirección, cp, ciudad, `nacimiento` (date) y teléfono de cada empleado.
- Comprobado para el temario: PGlite tiene `DateStyle` = `ISO, MDY` → `'04/03/2026'::date` es el **3 de abril** y `'20/04/2026'::date`
  da error 22008 (de ahí `to_date(…, 'DD/MM/YYYY')`). `initcap('MÁLAGA')` = «Málaga». Ciudades con `initcap(trim(ciudad))`:
  Madrid 93 · Sevilla 48 · Valencia 45 · Bilbao 36 · Valladolid 28 · Barcelona 24 · Zaragoza 20 · Málaga 18 · Getafe 9 · NULL 7 · '' 4.
  Atípicos: crm_id **31** (`fecha_alta` 1900-01-01), **122** (31/12/2099), **260** (`gasto_total` 999999.00). Teléfono vacío
  (`NULL`, `''` o `'N/D'`): 42.

### Lo que siembra el Fantasma en la etapa 5 (caso «Una sola dirección») — pista FALSA contra Iván
- Las direcciones de los **9 clientes falsos** están escritas de 9 formas distintas («Calle Olmo 7, 3ºB», «C/ Olmo, 7 3ºB»,
  «c/olmo 7 - 3º B», «CALLE OLMO 7 3B»…); normalizadas son **una sola**: `calleolmo73b`, CP 28901, Getafe.
- Agrupando por dirección normalizada y contando personas distintas (`COUNT(DISTINCT lower(trim(email)))`): Olmo **9**; el resto, como
  mucho 2 (6 parejas reales que viven juntas). Contando filas sin quitar duplicados salen además muchos 2 (los duplicados).
- En `fichas_empleados`, esa dirección es la de **Iván Soler** (empleado 7): «Calle Olmo, 7, 3ºB», 28901 Getafe.
- Decisión del usuario: es una **pista falsa** puesta por Héctor (ver HISTORIA). Iván debe parecer culpable en las etapas 5–6.

Las cifras exactas se consultan con el propio motor (laboratorio o `tests/`), nunca a ojo.
