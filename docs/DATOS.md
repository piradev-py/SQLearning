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
  (todas `text` salvo `crm_id`). Son los 300 clientes + **20 duplicados** (la misma persona dos veces, con otro formato y gasto 0) + **12 clientes
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

## Etapa 6 · `faro-e6.sql` (semilla 6006 para lo nuevo)
Igual que `faro-e5.sql` + `cuentas` (usuarios de la base de datos) + `auditoria` (registro de cambios que Iván guarda desde 2024)
+ `stock_tiendas` (stock de cada tienda física). Comprobado con PGlite.
- `cuentas` (**29**): `id`, `usuario` (UNIQUE), `empleado_id` (→ empleados; NULL en las de servicio), `rol` (CHECK `lectura`/`escritura`/`admin`),
  `creada` (date), `creada_por` (text), `activa`, `ultimo_acceso`. Ids 1–23 = el empleado del mismo id (`ivan.soler` 7, `hector.vidal` 5…;
  admin: Nuria e Iván). De servicio: 24 `app_web`, 25 `app_tienda`, 26 `copias_seguridad`, 27 `migracion_2019` (admin, **inactiva**),
  **28 `admin_temp`** (admin, sin empleado, creada **2019-11-04** por **`ivan.soler`**, **activa**, último acceso 2026-09-27 02:38:38),
  29 `becario.2023` (inactiva). Creadas por ivan.soler 14, nuria.campos 14, ana.beltran 1.
- `auditoria` (**497**, ids por orden de `momento`, 2024 → 2026-09-27): `id`, `momento`, `usuario` (→ cuentas.usuario), `tabla`,
  `operacion` (CHECK INSERT/UPDATE/DELETE), `registro_id`, `columna`, `valor_antes`, `valor_despues` (texto).
  - clientes INSERT 300 (`valor_despues` = email; `app_web` 291, `admin_temp` 9) · pedidos UPDATE `estado` 123 (entregado → reembolsado;
    Atención al cliente de 9 a 18 h, 54) · productos UPDATE `stock` 55 (Logística de 8 a 19 h: beatriz.soto, hector.vidal, iker.salas,
    oscar.medina) y `precio` 17 (Ventas) · cuentas 2 (`ivan.soler`: desactiva `migracion_2019` el 2024-02-12 y da de alta a iker.salas en 2025).
  - El último cambio de stock/precio de cada producto acaba en su valor actual de `productos` (0 descuadres).
  - Por usuario: app_web 291 · admin_temp 85 · laura.pena 23 · beatriz.soto 17 · marcos.gil 16 · diego.castano 15 · hector.vidal 15 ·
    iker.salas 11 · oscar.medina 9 · elena.ruiz 6 · tomas.rivas 6 · ivan.soler 2 · claudia.reyes 1. 16 cuentas sin cambios.
- `stock_tiendas` (**144**): PK (`tienda_id`, `producto_id`), CHECK `unidades >= 0`; tiendas 1–4 × los 36 productos activos, 0–25 uds.
  (Madrid 426, Valencia 443, Sevilla 377, Bilbao 402; total 1 648). **Barcelona (6) no tiene filas**: se da de alta en la etapa 6.
  Madrid con menos de 5 uds: productos 4 (3), 5 (0), 8 (1), 17 (0), 18 (2), 27 (0), 33 (4), 40 (0).
- Sin índices aparte de PK/UNIQUE. `productos` no tiene CHECK: `ALTER TABLE productos ADD CHECK (stock >= 0)` falla (23514) por el −12.
- CRM (de la etapa 5): 9 ciudades limpias no vacías (`initcap(trim(ciudad))`), 21 filas con gasto 0.
- Motor: CREATE/INSERT/UPDATE/DELETE, vistas, índices, identity, `CREATE TABLE … AS`, SAVEPOINT funcionan dentro de la transacción
  de práctica. Si el alumno escribe `COMMIT` o `ROLLBACK`, sale de ella y el motor recarga los datos (~0,7 s); el resultado es correcto.
  `EXPLAIN` sin índice: `Seq Scan`; con `CREATE INDEX … (cliente_id)`: `Bitmap Index Scan`; por `id`: `Index Scan using pedidos_pkey`.

### Lo que siembra el Fantasma en la etapa 6 (caso «La cuenta admin_temp») — Iván parece culpable
- Cambios de madrugada (hora < 6): **admin_temp 85** y app_web 10 (altas reales de clientes de noche). Nadie más.
- admin_temp: las **9 altas** de los `@correo-rapido.example` (2026-03-04 … 04-30), los **69 reembolsos** del Fantasma (68 de los falsos
  + el **2210** de Iratxe, 2026-08-15 03:54:48; 10 clientes, **36 470,20 €**; 1–2 días después del pedido, de 2 a 4 h), **3 stocks**
  (Smartphone Nexo A5 31→78 el 2026-05-21, Portátil Lumen 16 Pro 22→42 el 2026-07-09, **Auriculares Sonora Pulse 18→−12** el
  2026-08-16 03:51) y **2 precios bajados y restaurados en la misma noche** (Portátil Lumen 16 Pro 1199→599→1199 el 2026-04-17,
  Monitor Nexo 27" 4K 329→129→329 el 2026-08-21). Por mes: mar 12 · abr 16 · may 13 · jun 7 · jul 7 · **ago 18** · sep 12.
- **Para la etapa 7** (coartada): las vacaciones de Iván y los fichajes de Héctor deben construirse sobre estos momentos
  (p. ej. agosto, el mes con más actividad, con Iván de vacaciones; cada acción, minutos después de un fichaje de Héctor en Getafe).
- No se nombra a Héctor: sus 15 cambios de stock son de día y normales.

## Etapa 7 · `faro-e7.sql` (semilla 7007 para lo nuevo)
Igual que `faro-e6.sql` + `vacaciones` + `fichajes` + `sesiones` (todo de 2026-01-05 a 2026-09-30). Comprobado con PGlite.
- `vacaciones` (**46**): `id`, `empleado_id`, `desde`, `hasta` (date, CHECK hasta ≥ desde); dos periodos por empleado.
  **Iván (7): 2026-04-06…04-10 y 2026-08-03…08-23.** Héctor (5): 06-03…06-07 y 07-01…07-07 (nunca coinciden con admin_temp).
  Iker (23): 02-12…02-16 y 08-26…09-08.
- `fichajes` (**4 108**): `id`, `empleado_id`, `centro`, `entrada`, `salida` (timestamp). Días laborables (algún día suelto sin fichar),
  de ~8:00 a ~17:30. Centros: Oficinas 2 043 · Tienda Valencia 350 · Sevilla 350 · Bilbao 349 · Madrid 348 · **Almacén central 319** ·
  Almacén Sur 177 · Almacén Levante 172. Héctor ficha 258 veces (a veces de día en el Almacén central). Fichajes de madrugada (< 6 h):
  **Héctor 75** (todos en el Almacén central) e Iker 9 (turnos de descarga, nunca las noches de admin_temp).
- `sesiones` (**689**): `id`, `usuario` (→ cuentas), `inicio`, `fin`, `puesto`. ivan.soler 170 (SIS-01, ninguna en sus vacaciones) ·
  nuria.campos 175 (SIS-02) · copias_seguridad 269 (SRV-BACKUP, cada noche ~03:00) · **admin_temp 75 (ALM-GET-03, terminal del muelle
  del Almacén central)**, una por noche de actividad, del 2026-03-04 04:56 al 2026-09-27 02:37.
- Para el temario: organigrama recursivo por niveles 1 · 6 · 12 · 4 (23 empleados); `generate_series` de 2024-01 a 2026-09 = 33 meses,
  de ellos **13** sin ningún reembolso online (los huecos que el gráfico juntaba).

### Lo que siembra el Fantasma en la etapa 7 (caso «La coartada de Iván») — Héctor aparece
- admin_temp actúa **75 noches** (85 acciones). **13 acciones (12 noches) caen en las vacaciones de agosto de Iván** y 1 en las de abril;
  Iván no tiene fichajes ni sesiones esos días.
- Cada sesión de admin_temp sale de **ALM-GET-03** y empieza mientras **Héctor (5) está fichado en el Almacén central**: entró entre
  **2 y 17 minutos antes** (media 10,1). Con `LAG` sobre la línea de tiempo «fichajes del Almacén central + acciones de admin_temp», el
  evento anterior a cada primera acción de la noche es siempre un fichaje de Héctor (75 de 75; las otras 10 acciones van detrás de otra acción).
- Aquí, por fin, se nombra a Héctor como sospechoso (regla de HISTORIA). La etapa 8 lo confirma y cuantifica el fraude.

## Etapa 8 · `faro-e8.sql` (semilla 8008 para lo nuevo)
Igual que `faro-e7.sql` (todo lo anterior al 2026-10-01 **idéntico**) + lo siguiente. Comprobado con PGlite
(`node herramientas/consultar.mjs faro-e8 "SELECT …"`). «Hoy» es el **2026-10-15**: los datos acaban el 14.
- **Estado tras e6-12:** `admin_temp` con `activa = false`; `auditoria` 498 = `2026-10-01 09:00:00`, `lucia.mora`, `cuentas`, `UPDATE`,
  28, `activa`, `true` → `false`. `auditoria` llega a **533** (498–533 en octubre: 32 altas de `app_tienda`, 1 de `app_web`, 2 reembolsos
  y la de Lucía). En octubre **nada** de `admin_temp`, ni altas de madrugada. `vacaciones`, `fichajes` y `sesiones` acaban el 2026-09-30.
- **Octubre (1–14):** **156 pedidos** (ids 2525–2680, `mes` = `'2026-10'`; total **2 680**), 4 257 líneas en total, 1 387 envíos.
  Por tienda: Madrid 18 · Valencia 11 · Sevilla 11 · Bilbao 4 · Online 55 · **Barcelona 57**. Facturación neta de octubre (sin
  cancelados ni reembolsados) **49 505,85 €**. Reembolsos: **2** (Madrid y online), los dos por Atención al cliente.
  Pedidos online de octubre: 35 entregados, 14 en camino (envío «en reparto», sin entrega), 5 cancelados (sin envío), 1 reembolsado.
- **Barcelona (6):** 57 pedidos de lunes a sábado (10:00–21:00), 44 clientes distintos, **32 clientes nuevos** (de los 33 nuevos, ids 301–333;
  el otro es online, de Valladolid; alta minutos antes de su primer pedido), sin reembolsos. **333** clientes.
- **`sesiones_web`** (**5 403**; `id`, `inicio`, `cliente_id` NULL en 3 188, `dispositivo` móvil/ordenador, `variante`) y **`eventos_web`**
  (**16 018**; `id`, `sesion_id`, `momento`, `evento`, `pedido_id` solo en `compra`), del 2026-04-01 al 2026-10-14.
  - Sesiones que llegan a cada paso: visita 5 403 · producto 3 512 (**8 238 eventos**: contar eventos ≠ contar sesiones) · carrito 1 054 ·
    pago 764 · compra 559. Embudo limpio: cada sesión tiene todos los pasos anteriores, en orden.
  - **559 compras = 559 pedidos online** de abril a octubre (también cancelados), mismo cliente, 1–3 min antes de `pedidos.fecha`. Los
    pedidos del Fantasma y el 2210 **no tienen sesión**.
  - Abril–junio (sin prueba): visita→producto 65,0 % · producto→carrito 30,0 % · carrito→pago ~70 % · pago→compra **79,6 % ordenador y
    64,9 % móvil** (la caída del móvil, e8-04). Sesiones: ~60 % móvil.
  - **Prueba A/B** (2026-07-01 a 09-30; 1 475 sesiones A y 1 462 B; fuera de la prueba, `variante` NULL): carrito→compra
    **A 142/288 = 49,3 %**, **B 171/285 = 60,0 %**, **z = 2,57**. Ticket medio de sus pedidos: A 398,97 € y B 423,81 €, **z = 0,45** (no cambia).
    Desde octubre el pago en un paso es para todos (tasas de B).
- **`abonos`** (**125**, uno por pedido reembolsado; `fecha` = la del `UPDATE estado` de `auditoria`; `importe` = total): transferencia 74 ·
  tarjeta 39 · bizum 10 · efectivo 2. Los normales vuelven por el medio de pago; las transferencias, a una cuenta del cliente.
  **Los 69 del Fantasma: transferencia a `ES76 **** **** **** **** 4417`** (69 abonos, 10 clientes, **36 470,20 €**); las demás cuentas
  reciben 1 abono de 1 cliente.
- **`fichas_empleados.cuenta_nomina`**: una por empleado; la de **Héctor (5) es `ES76 **** **** **** **** 4417`**. Ninguna otra nómina
  recibe abonos.

### Cifras para las lecciones de la etapa 8
- e8-03 · Clientes por cohorte trimestral (primer pedido no cancelado): 2024-T1 73 (engaña: los datos empiezan ahí) · T2 39 · T3 25 ·
  T4 20 · **2025: 18 · 28 · 18 · 18** · 2026: 17 · 22 · 15 · T4 35 (Barcelona). Todas ≥ 15: valen trimestres.
- e8-07 · z de unidades por producto (2026 ene–sep, netos): 32 (74 u., z 2,69) · 30 (68, 2,03) · 12 (62, 1,36) · 13 (60, 1,14) ·
  **8 y 25 empatan con 59 (z 1,03) en el 5.º puesto**: el desempate por `producto_id` del enunciado deja el 8; decir en el enunciado
  que el desempate decide, o pedir el top 4.
- e8-12 · Daño de `admin_temp`: 69 pedidos, 10 clientes, 36 470,20 €. Reembolsos online de mar–sep 2026: 82, de ellos 69 del Fantasma
  (**89,9 %** del importe). Tasa de reembolso online frente a la línea base 2024–2025: z > 3 en **5** meses (2026-03 4,40 · 04 5,85 ·
  05 5,58 · 06 3,38 · 08 4,60; 09 2,98; 07 solo 1,42) y z > 2 en 8 (incluido 2025-10, 2,45, que es de la línea base); **octubre 1,82 %,
  z −0,15** (vuelve a lo normal). Noches: **(true, true) 75** y ninguna fila más (75/0/0).

Las cifras exactas se consultan con el propio motor (laboratorio o `tests/`), nunca a ojo.
