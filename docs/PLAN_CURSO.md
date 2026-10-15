# Plan del curso SQLearning

Temario completo, de cero absoluto a Data Analyst. Este documento es para humanos; el índice que usa la web está
en `js/curso.js` → `ETAPAS`. **Ambos deben estar siempre sincronizados** (mismo id, archivo y título).
La historia y el misterio están en `docs/HISTORIA.md`.

- Alumno tipo: hispanohablante que **nunca ha usado una base de datos** (ni programado).
- Una idea por nivel. Nunca se usa algo que no se haya enseñado antes.
- Cada nivel: ticket (`historia`) → 2–3 explicaciones → ejercicio(s) → quiz/predicción → reto final.
- Cada etapa (expediente) termina con un **Caso** que desbloquea una pista del Expediente. En la web, cada etapa es un expediente (EXP.N) y cada nivel una diligencia de la hoja de ruta.
- Créditos ◈ base (campo `xp`) entre 20 y 60 según dificultad (el motor suma +10 por bloque verificado). Los casos: 50–80.
- Motor: PostgreSQL (PGlite). Cuando la sintaxis cambie en otros motores, recuadro «🌍 En otros motores».

Estado: ✅ escrito · 🚧 pendiente

| Etapa | Niveles | Estado |
|---|---|---|
| 0 · El archivo de papel 🗂️ *(opcional)* | 10 | ✅ |
| 1 · Primer día 🎒 | 9 | ✅ |
| 2 · Atención al cliente ☎️ | 9 | ✅ |
| 3 · Ventas 💶 | 9 | ✅ |
| 4 · Logística 📦 | 10 | ✅ |
| 5 · Migración 🧹 | 11 | 🚧 |
| 6 · IT 🛠️ | 10 | 🚧 |
| 7 · Dirección 🧭 | 11 | 🚧 |
| 8 · Analítica 📈 | 12 | 🚧 |
| **Total** | **91** | |

---

## Etapa 0 · El archivo de papel 🗂️ *(opcional)* — «Pensar en datos antes de tocar una tecla»

**Opcional:** la etapa 1 está abierta desde el principio; quien solo quiere SQL puede saltarse esta etapa sin
perder nada obligatorio (sus créditos y su credencial son extra). **No se escribe SQL**: todo se trabaja «sobre el papel»
con pasos interactivos (`clasificar`, `seleccionar`, `ordenar`, `diagrama`, `quiz`).

**Historia propia:** antes de tu primer día, Lucía te pone una prueba. La primera tienda de Faro (1998) llevaba
todo en **fichas de papel y un Excel gigante** que nadie entiende. Tu misión: ordenar ese archivo con lógica y
diseñar en papel cómo debería guardarse. (Autónoma: no contiene pistas del Fantasma.)

**Al terminarla, el alumno sabrá:** qué tipos de datos existen, por qué una base de datos separa la información en
tablas, razonar con lógica Y/O/NO y con conjuntos, identificar entidades y relaciones, leer y dibujar un diagrama
entidad-relación, describir el ciclo del análisis y los roles de datos, y tratar datos personales con cuidado.

### e0-01 · ¿Qué es un dato? · 20 ◈ ✅
- **Conceptos:** dato vs información, tipos (texto, número entero/decimal, fecha, sí/no), cualitativo vs cuantitativo, el dato vacío (lo que más tarde será `NULL`).
- **Reto (`clasificar`):** clasificar los datos de una ficha de cliente de 1998 por tipo.

### e0-02 · Del Excel gigante a las tablas · 25 ◈ ✅
- **Conceptos:** tabla, fila, columna, una tabla = un tipo de cosa, problemas de repetir datos (cambiar un teléfono en 40 sitios, erratas).
- **Reto (`seleccionar`):** marcar en el Excel las celdas que se repiten y que deberían vivir en otra tabla.

### e0-03 · Verdadero o falso: lógica Y/O/NO · 30 ◈ ✅
- **Conceptos:** condición, verdadero/falso, Y (todas), O (alguna), NO, paréntesis, tablas de verdad, «no sé» (lógica de 3 valores, primer contacto).
- **Reto (`seleccionar`):** marcar a mano las fichas que cumplen «de Madrid Y (compró en 1999 O gastó más de 100 €)».

### e0-04 · Conjuntos: unir, cruzar y restar · 30 ◈ ✅
- **Conceptos:** conjunto, diagramas de Venn, unión, intersección, diferencia (base de `UNION`, `JOIN` y `EXCEPT`).
- **Reto (`clasificar`):** colocar clientes en un Venn «compró audio» / «compró gaming».

### e0-05 · Entidades y atributos · 30 ◈ ✅
- **Conceptos:** entidad (cliente, producto, pedido…), atributo, entidad vs atributo (¿la ciudad es una cosa o un dato?).
- **Reto (`clasificar`):** separar entidades y atributos del archivo de la tienda.

### e0-06 · Relaciones y claves · 35 ◈ ✅
- **Conceptos:** relación 1:1, 1:N, N:M; clave primaria («el DNI de cada fila»), clave foránea («la fila que apunta a otra»), tabla intermedia para N:M.
- **Reto (`quiz` + `clasificar`):** decidir el tipo de cada relación (cliente–pedido, pedido–producto, empleado–tienda…).

### e0-07 · Diagramas entidad-relación · 40 ◈ ✅
- **Conceptos:** cajas, líneas, notación pata de gallo (crow's foot), leer un diagrama, cardinalidad mínima (opcional/obligatoria).
- **Reto (`diagrama`):** conectar las entidades de la tienda y elegir la cardinalidad de cada línea.

### e0-08 · El ciclo del análisis y los roles · 25 ◈ ✅
- **Conceptos:** pregunta → datos → limpieza → análisis → comunicar → decisión; Data Analyst vs Data Scientist vs Data Engineer vs BI; buenas preguntas de negocio.
- **Reto (`ordenar` + `clasificar`):** ordenar los pasos de un análisis real y asignar tareas a cada rol.

### e0-09 · Privacidad y ética de los datos · 25 ◈ ✅
- **Conceptos:** dato personal y dato sensible, RGPD (principios básicos: finalidad, minimización, acceso), anonimizar vs seudonimizar, sesgos.
- **Reto (`seleccionar`):** marcar qué columnas de un informe no deberían salir de la empresa.

### e0-10 · Caso: Ordenar el archivo · 60 ◈ ✅
- **Caso:** a partir del Excel gigante de 1998, diseñar el diagrama completo de la tienda (entidades, atributos clave, relaciones y cardinalidades) y responder tres preguntas sobre él. → Credencial **Arquitecto de datos**.

---

## Etapa 1 · Primer día 🎒 — «Aprender a preguntar a los datos»

**Historia:** primer día en Faro. Lucía te da acceso a la base de datos y te pide pequeños listados para el equipo.
Al final, revisando el inventario, encuentras algo imposible.

**Tablas:** `productos` (id, nombre, categoria, precio, stock, proveedor, activo, creado), `tiendas` (id, ciudad,
apertura), `empleados` (id, nombre, departamento, tienda_id, email).

**Al terminarla, el alumno sabrá:** qué es una base de datos relacional, leer un esquema, y escribir consultas
`SELECT` que eligen, calculan, renombran, quitan repetidos, ordenan y limitan resultados.

### e1-01 · ¿Qué es una base de datos? · 20 ◈ ✅
- **Conceptos nuevos:** base de datos, tabla, fila (registro), columna (campo), SQL, consulta, `SELECT * FROM`, el `;` final.
- **Reto:** ver la tabla `tiendas` entera.

### e1-02 · Elegir columnas · 25 ◈ ✅
- **Conceptos nuevos:** `SELECT col1, col2`, orden de las columnas, por qué no abusar de `*`, mayúsculas en palabras clave (convención).
- **Reto:** listado de empleados con nombre y departamento para el directorio interno.

### e1-03 · Leer el esquema y los tipos · 25 ◈ ✅
- **Conceptos nuevos:** pestaña Esquema, tipos `integer`, `numeric`, `text`, `date`, `boolean`; clave primaria `id` (primer contacto).
- **Reto (interpretar + consulta):** ¿qué tipo tiene `precio`? Lista nombre, precio y si está activo.

### e1-04 · Columnas calculadas · 30 ◈ ✅
- **Conceptos nuevos:** operadores `+ - * /`, división entera vs decimal, concatenar texto con `||`.
- **Reto:** valor del inventario por producto (`precio * stock`).

### e1-05 · Ponerle nombre: alias · 30 ◈ ✅
- **Conceptos nuevos:** `AS`, alias con espacios entre comillas dobles, alias de tabla (primer contacto).
- **Reto:** el informe anterior con columnas `producto` y `valor_inventario`.

### e1-06 · Sin repetir: DISTINCT · 30 ◈ ✅
- **Conceptos nuevos:** `DISTINCT`, `DISTINCT` sobre varias columnas.
- **Reto:** ¿qué categorías y qué proveedores tenemos?

### e1-07 · Ordenar resultados · 35 ◈ ✅
- **Conceptos nuevos:** `ORDER BY`, `ASC`/`DESC`, ordenar por varias columnas, por alias y por expresión.
- **Reto:** productos del más caro al más barato y, a igual precio, por nombre.

### e1-08 · Los primeros N: LIMIT y OFFSET · 35 ◈ ✅
- **Conceptos nuevos:** `LIMIT`, `OFFSET`, paginar, «top N». 🌍 `TOP` en SQL Server, `FETCH FIRST` estándar.
- **Reto:** los 5 productos con más stock; después, la «página 2».

### e1-09 · Caso: El inventario imposible · 50 ◈ ✅
- **Conceptos nuevos:** comentarios `--` y `/* */`; combinar todo lo anterior.
- **Caso:** el informe de inventario de Lucía «no cuadra». Ordenando por stock aparece un producto con stock
  **negativo**. → Pista del Expediente: **El inventario imposible**.

---

## Etapa 2 · Atención al cliente ☎️ — «Encontrar la aguja en el pajar»

**Historia:** Marcos Gil, de atención al cliente, está desbordado: cada reclamación exige buscar un cliente o un pedido
entre miles. Le enseñas a filtrar. Al final, una clienta de Bilbao reclama un pedido que no hizo, y tirando del hilo
aparecen clientes que nadie recuerda, todos dados de alta de madrugada.

**Tablas** (`datos/faro-e2.sql`, ver `docs/DATOS.md`): las de la etapa 1 más `clientes` (300), `pedidos` (2 524),
`reclamaciones` (40).

**Al terminarla, el alumno sabrá:** filtrar filas con `WHERE` combinando condiciones, listas, rangos, patrones de
texto y fechas, y tratar correctamente los valores vacíos (`NULL`).

### e2-01 · Filtrar filas: WHERE · 25 ◈ ✅
- **Conceptos nuevos:** `WHERE`, igualdad `=`, textos entre comillas simples, distinción mayúsculas en textos, orden de las cláusulas (`SELECT … FROM … WHERE … ORDER BY … LIMIT`).
- **Reto:** Marcos necesita los datos de un cliente concreto por su email.

### e2-02 · Comparar: mayor, menor, distinto · 30 ◈ ✅
- **Conceptos nuevos:** `<`, `>`, `<=`, `>=`, `<>` (y `!=`), comparar números, textos y fechas (`'2026-01-01'`).
- **Reto:** pedidos de más de 1 000 € para revisarlos uno a uno.

### e2-03 · Combinar condiciones: AND, OR, NOT · 30 ◈ ✅
- **Conceptos nuevos:** `AND`, `OR`, `NOT` (recordando la lógica de la Etapa 0).
- **Reto:** pedidos online cancelados o reembolsados de un mes.

### e2-04 · Paréntesis y prioridad · 35 ◈ ✅
- **Conceptos nuevos:** `AND` va antes que `OR`, los paréntesis cambian el resultado; paso `arreglar` con una consulta que devuelve de más.
- **Reto:** clientes de Bilbao o Sevilla que sean socios.

### e2-05 · Listas: IN y NOT IN · 30 ◈ ✅
- **Conceptos nuevos:** `IN (…)`, `NOT IN (…)` como atajo de varios `OR`.
- **Reto:** pedidos pagados con bizum o transferencia en tiendas físicas.

### e2-06 · Rangos y fechas: BETWEEN · 35 ◈ ✅
- **Conceptos nuevos:** `BETWEEN … AND …` (incluye los extremos), rangos de fechas y la trampa de las horas con `timestamp` (`'2026-08-31'` es a las 00:00).
- **Reto:** pedidos de la primera quincena de agosto de 2026.

### e2-07 · Buscar texto: LIKE e ILIKE · 35 ◈ ✅
- **Conceptos nuevos:** `LIKE` con `%` y `_`, `ILIKE` (sin distinguir mayúsculas, propio de PostgreSQL). 🌍 En MySQL `LIKE` ya ignora mayúsculas.
- **Reto:** reclamaciones cuyo motivo hable de «retraso».

### e2-08 · El vacío: NULL · 40 ◈ ✅
- **Conceptos nuevos:** `NULL` = dato desconocido; `IS NULL` / `IS NOT NULL`; por qué `= NULL` nunca funciona (lógica de 3 valores); la trampa de `NOT IN` con `NULL`.
- **Reto:** clientes sin teléfono para que Marcos les escriba por email.

### e2-09 · Caso: Clientes de madrugada · 60 ◈ ✅
- **Caso:** Iratxe, de Bilbao, reclama un pedido que no reconoce. Partes: encontrar la reclamación por su motivo
  (`ILIKE '%reconozco%'`) → ver el pedido (online, 03:12, reembolsado) → buscar otros clientes con el mismo patrón
  (email `@correo-rapido.example`, todos de Getafe, alta de madrugada) → ¿de qué ciudad son? (Getafe; el 9 sale en el expediente).
  → Pista del Expediente: **Clientes de madrugada**.

---

## Etapa 3 · Ventas 💶 — «Resumir miles de filas en una respuesta»

**Historia:** Elena Ruiz, directora de ventas, necesita números para el comité: cuánto se vende, dónde, qué y cuándo.
Pasas de mirar filas sueltas a resumirlas. Al comparar tiendas, la tienda online tiene una tasa de reembolsos que no
se parece a ninguna otra.

**Tablas** (`datos/faro-e3.sql`, ver `docs/DATOS.md`): las de la etapa 2 + `lineas_pedido` (4 022) y la columna
`pedidos.mes` (`'2026-08'`, «la que ya traen las exportaciones de ventas»; las funciones de fecha llegan en la etapa 5).
Aún NO hay `JOIN` (etapa 4): se agrupa por columnas de una sola tabla (`tienda_id`, `estado`, `metodo_pago`, `mes`,
`cliente_id`, `producto_id`).

**Al terminarla, el alumno sabrá:** resumir con funciones de agregado, agrupar y filtrar grupos, entender el orden
en que PostgreSQL evalúa una consulta, y ver un resultado como gráfico.

### e3-01 · Contar filas: COUNT · 25 ◈ ✅
- **Conceptos nuevos:** función de agregado, `COUNT(*)`, `COUNT(columna)` (no cuenta `NULL`), contar con `WHERE`.
- **Reto:** ¿cuántos pedidos online hay? ¿Y cuántos clientes tienen teléfono?

### e3-02 · Sumar y promediar: SUM, AVG y ROUND · 30 ◈ ✅
- **Conceptos nuevos:** `SUM`, `AVG`, `ROUND(x, 2)`, ticket medio, alias para el resultado.
- **Reto:** facturación y ticket medio de los pedidos entregados.

### e3-03 · Los extremos: MIN y MAX · 30 ◈ ✅
- **Conceptos nuevos:** `MIN`, `MAX` con números, fechas y textos; varias funciones en un mismo `SELECT`.
- **Reto:** primer y último pedido, pedido más barato y más caro.

### e3-04 · Contar distintos: COUNT(DISTINCT) · 30 ◈ ✅
- **Conceptos nuevos:** `COUNT(DISTINCT columna)`; diferencia con `COUNT(*)`.
- **Reto:** ¿cuántos clientes distintos han comprado online?

### e3-05 · Agrupar: GROUP BY · 35 ◈ ✅
- **Conceptos nuevos:** `GROUP BY`, una fila por grupo, cada columna del `SELECT` agrupada o dentro de un agregado (error 42803), **primer gráfico de barras** (pestaña Gráfico).
- **Reto:** pedidos y facturación por tienda.

### e3-06 · Grupos por varias columnas · 35 ◈ ✅
- **Conceptos nuevos:** `GROUP BY` con varias columnas, ordenar grupos por un agregado, **gráfico de líneas** con `mes`.
- **Reto:** facturación por mes (y por tienda y estado).

### e3-07 · Filtrar grupos: HAVING · 40 ◈ ✅
- **Conceptos nuevos:** `HAVING`, diferencia con `WHERE` (filas antes de agrupar vs grupos después).
- **Reto:** clientes con más de 15 pedidos; productos con más de 130 unidades vendidas.

### e3-08 · El orden en que piensa SQL · 35 ◈ ✅
- **Conceptos nuevos:** orden lógico `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT`; por qué un alias no vale en `WHERE` pero sí en `ORDER BY`; paso `arreglar`.
- **Reto:** top 5 de productos por unidades (con desempate por `producto_id`, hay empates).

### e3-09 · Caso: Reembolsos disparados · 60 ◈ ✅
- **Caso:** Elena ve que los reembolsos suben. Partes: reembolsos por tienda (`GROUP BY tienda_id` con `WHERE estado = 'reembolsado'`) → pedidos por tienda → interpretar: la online tiene 103 de 1 527 (≈ 6,7 %) frente a ~2 % en las físicas → reembolsos online por mes (crecen desde marzo de 2026).
  → Pista del Expediente: **Reembolsos disparados**.

---

## Etapa 4 · Logística 📦 — «Unir lo que está separado»

**Historia:** Héctor Vidal, jefe de logística, es el compañero más simpático de la oficina: trae café, contesta al
momento y se ofrece a «pasarte lo que haga falta». Su problema: el sistema de envíos solo guarda números
(`almacen_id`, `transportista_id`, `pedido_id`) y nadie sabe leerlo sin cruzar tres pestañas. Aprendes a unir tablas.
Al final, Elena pide explicar los reembolsos online de la etapa anterior y, al cruzar pedidos con envíos, aparecen
pedidos reembolsados que **nunca salieron de ningún almacén**.

**Tablas** (`datos/faro-e4.sql`, ver `docs/DATOS.md`): las de la etapa 3 + `empleados.jefe_id` (→ `empleados.id`),
`almacenes` (5: id, nombre, ciudad, responsable_id → `empleados`, apertura), `transportistas` (4: id, nombre, web) y
`envios` (1 337: id, pedido_id UNIQUE → `pedidos`, almacen_id, transportista_id, salida, entrega, estado, coste).
Solo hay envío para pedidos **online** (en tienda física el cliente se lo lleva). Aún NO hay funciones de fecha
(etapa 5): nada de restar `entrega - salida`; para meses, `pedidos.mes`. Tampoco `COALESCE` ni `CASE` (etapa 5) ni
subconsultas/`EXISTS` (etapa 7): los `NULL` de un `LEFT JOIN` se muestran tal cual.

**Al terminarla, el alumno sabrá:** qué son las claves primarias y foráneas, unir tablas con `INNER`, `LEFT`, `RIGHT`
y `FULL JOIN`, encontrar filas huérfanas, encadenar varias tablas, resumir después de unir sin duplicar cifras, unir
una tabla consigo misma, generar todas las combinaciones con `CROSS JOIN` y operar con conjuntos de resultados
(`UNION`, `INTERSECT`, `EXCEPT`).

### e4-01 · Claves que conectan tablas: PK y FK · 25 ◈ ✅
- **Conceptos nuevos:** clave primaria (PK: única y nunca `NULL`; recordando e1-03 y e0-06), PK compuesta
  (`lineas_pedido`: `pedido_id` + `producto_id`), clave foránea (FK: la columna que «apunta» a la PK de otra tabla;
  `envios.almacen_id → almacenes.id`, `pedidos.cliente_id → clientes.id`…), relación 1:N y 1:1 (`envios.pedido_id`
  es UNIQUE: un pedido tiene como mucho un envío), leer las FK en la pestaña Esquema, integridad referencial (la base
  de datos no deja apuntar a un id que no existe). Buscar «a mano» con dos consultas, que es justo lo que el `JOIN` ahorrará.
- **Trampas:** confundir el `id` de una tabla con el de otra (`envios.id` no es el número de pedido); una FK puede
  ser `NULL` (`almacenes.responsable_id`).
- **Quiz:** ¿qué columna de `envios` apunta a `transportistas`? ¿Por qué `pedido_id` es UNIQUE en `envios` y no en `lineas_pedido`?
- **Reto:** ¿quién es el responsable del Almacén Levante? Dos consultas: `almacenes` (id 2 → `responsable_id` 18)
  y luego `empleados WHERE id = 18` → **Óscar Medina**. Se comprueba la última consulta (nombre del responsable).

### e4-02 · Unir dos tablas: INNER JOIN · 35 ◈ ✅
- **Conceptos nuevos:** `FROM a JOIN b ON a.fk = b.pk`, `INNER` (es el `JOIN` por defecto: solo filas con pareja),
  `tabla.columna`, alias de tabla (`FROM envios AS e`, o sin `AS`; ya visto de pasada en e1-05), columnas con el mismo
  nombre en las dos tablas renombradas con `AS` (`a.nombre AS almacen`, `t.nombre AS transportista`).
  Ejemplo: envíos con el nombre de su transportista (1 337 filas).
- **Trampas:** columna ambigua → **error 42702** (`column reference "id" is ambiguous`; paso `arreglar`); unir por
  las columnas equivocadas (`e.id = t.id`) **no da error** pero devuelve basura; olvidar el `ON` (error de sintaxis).
  🌍 La sintaxis antigua `FROM a, b WHERE a.x = b.y` aún se ve en otros motores y en código viejo.
- **Predicción:** almacenes con el nombre de su responsable (`JOIN empleados ON a.responsable_id = em.id`): ¿cuántas
  filas? **3**, no 5 (Norte y Zaragoza no tienen responsable: el `INNER JOIN` los descarta sin avisar). Engancha con el nivel siguiente.
- **Reto:** reclamaciones con el nombre del cliente: columnas `reclamacion_id`, `cliente`, `motivo`, ordenadas por
  `reclamacion_id` → 40 filas (ambas tablas tienen `id` y obliga a calificar columnas).

### e4-03 · Que no se pierda nadie: LEFT, RIGHT y FULL JOIN · 40 ◈ ✅
- **Conceptos nuevos:** `LEFT JOIN` (todas las filas de la izquierda; si no hay pareja, columnas de la derecha a
  `NULL`), `RIGHT JOIN` como espejo (en la práctica se reescribe como `LEFT` cambiando el orden), `FULL JOIN`
  (todas las filas de ambos lados). Se puede unir por columnas que no son FK (`a.ciudad = t.ciudad`).
  Ejemplos: almacenes `LEFT JOIN` responsables → 5 filas, Norte y Zaragoza con `NULL`; `envios RIGHT JOIN
  transportistas` → aparece Logística Delta con `NULL`; `almacenes FULL JOIN tiendas ON a.ciudad = t.ciudad` → **8 filas**:
  Valencia, Sevilla y Bilbao emparejadas; Getafe y Zaragoza sin tienda; Madrid, Online y Barcelona sin almacén.
- **Trampas:** en `LEFT`/`RIGHT` el orden de las tablas importa (en `INNER` no); el `NULL` del resultado puede
  significar «sin pareja» o «el dato ya era `NULL`». 🌍 MySQL no tiene `FULL JOIN` (se simula con `LEFT … UNION … RIGHT`); SQLite solo desde la 3.39.
- **Diagrama Venn** (en `explicacion`, como texto/tabla): INNER = intersección, LEFT = círculo izquierdo entero (enlaza con e0-04).
- **Reto:** todos los almacenes con su responsable: columnas `almacen`, `ciudad`, `responsable`, ordenadas por id de
  almacén → 5 filas, 2 con `responsable` `NULL`. `interpretar`: ¿qué almacenes no tienen responsable? (Norte y Zaragoza).

### e4-04 · Huérfanos: LEFT JOIN … IS NULL · 40 ◈ ✅
- **Conceptos nuevos:** «huérfano» = fila sin pareja en la otra tabla; patrón *anti-join*: `LEFT JOIN … WHERE
  derecha.id IS NULL` (filtrar por la clave de la tabla derecha). Ejemplo: transportistas sin envíos → Logística Delta.
  Ejercicio: clientes que nunca han comprado → **6**. Un resultado vacío también es respuesta: no hay productos sin vender.
- **Trampas (las dos clave del caso):**
  - **Condición en `ON` frente a `WHERE`:** `almacenes LEFT JOIN envios … WHERE e.estado = 'devuelto'` hace desaparecer
    Zaragoza (el `WHERE` convierte el `LEFT` en `INNER`); con `… ON e.almacen_id = a.id AND e.estado = 'devuelto'` se queda
    con `NULL`. Paso `prediccion` + `arreglar`.
  - Comprobar `IS NULL` en una columna que puede ser `NULL` de verdad (`e.entrega IS NULL` mezcla «sin envío» con «envío
    sin entregar», p. ej. los 65 `en reparto`): siempre la clave.
  - Recordar la trampa de `NOT IN` con `NULL` (e2-08); `NOT EXISTS` llega en la etapa 7.
- **Reto:** dos comprobaciones: tiendas sin ningún pedido (columnas `id`, `ciudad` → Barcelona) y almacenes sin
  ningún envío (`id`, `nombre` → Almacén Zaragoza). Se piden en dos consultas separadas (paso `ejercicio` + `reto`).

### e4-05 · Tres tablas o más · 40 ◈ ✅
- **Conceptos nuevos:** encadenar `JOIN` (cada uno con su `ON`), tabla «puente» cuando el dato está a dos saltos
  (`envios → pedidos → clientes`: el cliente no está en `envios`), tabla intermedia N:M (`pedidos → lineas_pedido →
  productos`), elegir bien la tabla de partida. Ejemplo: envíos con nombre de almacén y de transportista.
  Ejercicio: productos del pedido 1 (2 líneas) con nombre, cantidad y precio unitario.
- **Trampas:** un `INNER JOIN` después de un `LEFT JOIN` puede volver a descartar las filas con `NULL`; alias poco
  claros (`a`, `b`, `c`) que hacen ilegible la consulta (consejo de Lucía: alias con sentido, `e`, `p`, `c`, `al`, `t`).
- **Reto:** envíos `devuelto`: columnas `envio_id`, `pedido_id`, `cliente`, `almacen`, `transportista`, ordenadas por
  `envio_id` → 40 filas (5 tablas: `envios`, `pedidos`, `clientes`, `almacenes`, `transportistas`).

### e4-06 · Unir y resumir: JOIN con GROUP BY · 45 ◈ ✅
- **Conceptos nuevos:** agrupar por columnas de la tabla unida (`GROUP BY al.id, al.nombre`), `COUNT(e.id)` frente
  a `COUNT(*)` tras un `LEFT JOIN` (el `*` cuenta la fila con `NULL` como 1), gráfico de barras con nombres en vez de ids.
  Ejemplo: envíos por almacén → central 720 · Levante 274 · Sur 252 · Norte 91 (`INNER`, 4 filas) y con `LEFT` +
  `COUNT(e.id)`, Zaragoza 0 (5 filas). Coste total de envíos 9 245,80 €, medio 6,92 €.
- **Trampas:** **filas duplicadas al unir 1:N**: `pedidos JOIN lineas_pedido` da 4 022 filas, no 2 524; `COUNT(*)` y
  `SUM(p.total)` salen inflados → `COUNT(DISTINCT p.id)` o sumar en el lado «muchos» (`cantidad * precio_unitario`).
  Paso `prediccion` («¿cuántas filas?») + `arreglar`. Agrupar solo por `nombre` cuando dos filas podrían llamarse igual.
- **Reto (`grafico: true`):** envíos por transportista: columnas `transportista`, `envios`, `coste_total`, de más a
  menos envíos → 4 filas: Mensajería Sur 611 · Rayo Express 482 · Paquetería Norte 244 · Logística Delta 0
  (`coste_total` `NULL`). Comprobaciones: 4 filas, Delta con 0, suma de `envios` = 1 337.

### e4-07 · Una tabla consigo misma: self join · 45 ◈ ✅
- **Conceptos nuevos:** unir `empleados` con `empleados` usando dos alias (`em` = empleado, `j` = jefe),
  `ON em.jefe_id = j.id`; `INNER` → 21 filas (Ana Beltrán no tiene jefe), `LEFT` → 22; dos saltos («jefe del jefe»:
  Carmen Llorente → Pablo Herrero → Elena Ruiz); self join + `GROUP BY` para contar subordinados directos
  (Ana 6, Elena 6, Héctor 2, Marcos 2, Lucía, Pablo, Jorge, Raúl y Aitor 1). La jerarquía completa (CTE recursiva) llega en la etapa 7.
- **Trampas:** sin alias, **error 42712** (`table name "empleados" specified more than once`); invertir el `ON`
  (`em.id = j.jefe_id`) devuelve subordinados en vez de jefes; olvidar renombrar las dos columnas `nombre`.
- **Reto:** directorio con jefe: columnas `empleado`, `departamento`, `jefe`, ordenado por id del empleado → 22 filas,
  Ana Beltrán con `jefe` `NULL`.

### e4-08 · Todas las combinaciones: CROSS JOIN · 35 ◈ ✅
- **Conceptos nuevos:** producto cartesiano, `CROSS JOIN` sin `ON` (cada fila con cada fila: 5 almacenes × 4
  transportistas = 20 filas), uso real: crear la «plantilla» de combinaciones y rellenarla con `LEFT JOIN` + `GROUP BY`
  para que salgan también los ceros; `ON` con dos condiciones (`e.almacen_id = al.id AND e.transportista_id = t.id`).
- **Trampas:** el cartesiano accidental (un `ON` mal escrito o `FROM a, b` sin `WHERE`): `pedidos × lineas_pedido`
  serían más de 10 millones de filas; siempre comprobar el número de filas esperado. 🌍 `FROM a, b` = `CROSS JOIN` en todos los motores.
- **Reto:** matriz de tarifas para Héctor: columnas `almacen`, `transportista`, `envios` (número de envíos de esa
  pareja, 0 si ninguno), ordenada por almacén y transportista → 20 filas. Comprobaciones: 20 filas, suma de
  `envios` = 1 337, las 4 filas de Zaragoza y las 5 de Logística Delta a 0 (cifras por pareja: se consultan con el verificador).

### e4-09 · Apilar resultados: UNION, INTERSECT y EXCEPT · 45 ◈ ✅
- **Conceptos nuevos:** operadores de conjuntos (enlazan con el Venn de e0-04): `UNION` (sin repetidos), `UNION ALL`
  (con repetidos, más rápido), `INTERSECT`, `EXCEPT` (el orden importa); reglas: mismo número de columnas, tipos
  compatibles, los nombres los pone la primera consulta, un único `ORDER BY` al final. JOIN añade **columnas**; UNION añade **filas**.
  Ciudades de almacenes y de tiendas: `UNION` → 8 · `UNION ALL` → 11 · `INTERSECT` → Bilbao, Sevilla, Valencia ·
  tiendas `EXCEPT` almacenes → Barcelona, Madrid, Online.
- **Trampas:** distinto número de columnas → error 42601 (`each UNION query must have the same number of columns`);
  tipos incompatibles → 42804; `UNION` cuando se quería contar todo (`UNION ALL`); `ORDER BY` en mitad. 🌍 En Oracle
  `EXCEPT` se llama `MINUS`; MySQL solo tiene `INTERSECT`/`EXCEPT` desde la 8.0.31.
- **Reto:** ciudades donde hay almacén pero no tienda (`EXCEPT`), columna `ciudad`, ordenada → **Getafe, Zaragoza**;
  y un `quiz`: ¿qué devuelve si se invierte el orden de las dos consultas?

### e4-10 · Caso: Pedidos fantasma · 70 ◈ ✅
- **Caso:** Elena quiere explicar los reembolsos online de la etapa 3 y Héctor, encantado, te ofrece «todo lo de
  envíos». Partes:
  1. Pedidos online (`tienda_id = 5`) sin envío: `pedidos LEFT JOIN envios … WHERE e.id IS NULL` → **190**.
  2. Por estado (`GROUP BY p.estado`) → cancelado 127 · reembolsado **63**. `interpretar`: ¿cuáles son normales?
     (los cancelados: nunca salen del almacén).
  3. Los 63 reembolsados sin envío con su cliente (`JOIN clientes`): **10 clientes** distintos, **31 380,20 €**, del
     2026-03-05 al 2026-09-25, todos de madrugada; 62 son de clientes `@correo-rapido.example` y el otro es el **2210**
     (el que reclamó Iratxe Muñoz en la etapa 2). `interpretar`: ¿qué pedido conocido aparece?
  4. Los pedidos de los clientes `@correo-rapido.example` que **sí** tienen envío (`JOIN envios JOIN almacenes`) →
     **6**, todos del **Almacén central (Getafe)**, `devuelto` y sin `entrega` (los devueltos normales sí la tienen).
     `interpretar`: ¿qué almacén los firma?
  → Pista del Expediente: **Pedidos fantasma**.
- **Regla del misterio:** no se pide el responsable del almacén ni se nombra a Héctor como sospechoso; él solo
  aparece como el compañero servicial que te pasó los datos.

---

## Etapa 5 · Migración 🧹 — «Limpiar antes de contar»

**Historia:** Nuria Campos, responsable de la migración de sistemas, tiene que pasar el **CRM antiguo** (la
exportación de un programa de hace años, cuidada «por quien pasaba por allí») al sistema nuevo. Es ordenada hasta
la obsesión y odia los datos sucios: emails en mayúsculas, ciudades con espacios, teléfonos de siete formas, fechas
en dos formatos, códigos postales sin su cero y un «sí» escrito de diez maneras. Aprendes a convertir, limpiar y
normalizar **al leer** (guardar los datos limpios con `UPDATE` llega en la etapa 6). Al final, al normalizar las
direcciones, las de los clientes falsos resultan ser **una sola**… y coincide con la de un compañero de IT.

**Tablas** (`datos/faro-e5.sql`, ver `docs/DATOS.md`): las de la etapa 4 + `crm_clientes` (332 filas, **todas las
columnas `text`**: `crm_id`, `nombre`, `email`, `telefono`, `direccion`, `cp`, `ciudad`, `fecha_alta`, `gasto_total`,
`socio`; son los 300 clientes + 20 duplicados + 12 clientes viejos `@antiguo.example`) y `fichas_empleados` (23: ficha de
RR. HH. de cada empleado con `direccion`, `cp`, `ciudad`, `nacimiento` (date) y `telefono`).
Restricciones: aún NO hay subconsultas, CTE ni `FILTER` (etapa 7) ni `UPDATE`/`CREATE` (etapa 6). PGlite **no trae
`unaccent`**: las tildes se dejan o se quitan con `regexp_replace`. Las comprobaciones **nunca** dependen de
`CURRENT_DATE`/`now()` (el resultado cambiaría cada día): para «hoy» se usa una fecha fija, `DATE '2026-10-01'`
(inauguración de Barcelona). Las cifras sin valor en `docs/DATOS.md` se fijan con el verificador al escribir la lección.

**Al terminarla, el alumno sabrá:** por qué los datos llegan como texto y cómo convertirlos de tipo, normalizar
mayúsculas y espacios, trocear, sustituir y componer textos, usar expresiones regulares básicas, decidir fila a fila
con `CASE`, convertir y operar con fechas (formatos, partes, truncado, intervalos, presentación), rellenar o anular
vacíos con `COALESCE`/`NULLIF`, y detectar duplicados y valores imposibles antes de dar una cifra.

### e5-01 · Datos que llegan como texto: CAST · 30 ◈ 🚧
- **Conceptos nuevos:** por qué una exportación (CSV, Excel, CRM viejo) llega toda como `text` (pestaña Esquema:
  `crm_clientes` es todo texto, recordando los tipos de e1-03); convertir con `CAST(x AS numeric)` y con el atajo
  de PostgreSQL `x::numeric`, `::integer`, `::date`, `::boolean` (`'true'::boolean`); `pg_typeof(x)` para ver el tipo.
  Ejemplo: ordenar `gasto_total` como texto frente a como número (`'999999.00'` y `'11286.40'`: como texto, `'9…'`
  va antes que `'1…'` y el orden es alfabético, no numérico).
- **Trampas:** si un valor no tiene forma de número, la conversión falla entera → **error 22P02**
  (`invalid input syntax for type numeric: "2.136,70"`, o con `'4.168,50 €'`); paso `arreglar` con un
  `WHERE` que deja solo los convertibles. Convertir `cp` a `integer` se come el cero de `'08001'` (se retoma en e5-04).
  🌍 `CAST` es estándar; `::` solo PostgreSQL; SQL Server tiene `TRY_CAST` y BigQuery `SAFE_CAST` (devuelven `NULL` en vez de fallar).
- **Predicción:** `SELECT '10' < '9';` → `true` (texto) frente a `SELECT 10 < 9;` → `false`.
- **Reto:** los 5 mayores gastos del CRM entre los que vienen con punto decimal (`WHERE gasto_total NOT LIKE '%,%'
  AND gasto_total NOT LIKE '%€%'`): columnas `crm_id`, `gasto` (numérico), de mayor a menor → primero **260**
  (`999999.00`) y después **270** (`11286.40`); el resto, con el verificador. Comprobaciones: 5 filas, tipo numérico,
  orden numérico (no alfabético).

### e5-02 · Mayúsculas y espacios: UPPER, LOWER, INITCAP y TRIM · 30 ◈ 🚧
- **Conceptos nuevos:** `UPPER`, `LOWER`, `INITCAP` (primera letra de cada palabra), `TRIM` (y `LTRIM`/`RTRIM`),
  `LENGTH` para ver los espacios invisibles; anidar funciones (`initcap(trim(ciudad))`); usar una función en
  `WHERE`, `GROUP BY` y `ORDER BY`. Ejemplos: `email <> lower(trim(email))` → **44** emails por arreglar;
  `ciudad` tiene 42 escrituras distintas tal cual y **10** con `COUNT(DISTINCT initcap(trim(ciudad)))` (incluida la cadena vacía `''`).
- **Trampas:** `'Madrid' = ' Madrid  '` es `false` (los espacios cuentan, `LENGTH` lo delata); `''` no es `NULL`
  (7 ciudades `NULL` y 4 `''`; `COUNT(DISTINCT)` no cuenta el `NULL` pero sí `''`); `ILIKE` ignora mayúsculas pero no espacios.
- **Quiz:** ¿qué devuelve `initcap('  MÁLAGA ')`? (`'  Málaga '`: sin `TRIM`, los espacios siguen ahí).
- **Reto (`grafico: true`):** clientes del CRM por ciudad normalizada: columnas `ciudad` (`initcap(trim(ciudad))`),
  `clientes`, de más a menos → incluye la fila `''` y la de `NULL` (cifras por ciudad con el verificador).
  Comprobaciones: ninguna ciudad repetida, suma de `clientes` = 332, Madrid en primera fila (comprobar con el verificador).

### e5-03 · Trocear texto: LEFT, SUBSTRING y SPLIT_PART · 35 ◈ 🚧
- **Conceptos nuevos:** `LEFT(x, n)`, `RIGHT(x, n)`, `SUBSTRING(x FROM i FOR n)` (las posiciones empiezan en 1),
  `POSITION('@' IN email)`, `SPLIT_PART(email, '@', 2)` (trocear por un separador). Ejemplos: usuario y dominio de
  cada email (`lower(trim(email))`); provincia como `LEFT(cp, 2)` (28 Madrid, 46 Valencia, 41 Sevilla, 48 Bilbao…);
  año de `fecha_alta` con `LEFT(fecha_alta, 4)`.
- **Trampas:** `LEFT(fecha_alta, 4)` solo vale para `AAAA-MM-DD`: con `DD/MM/AAAA` sale `'19/0'` (las fechas de dos
  formatos se resuelven en e5-07); `LEFT(cp, 2)` en los **19** CP de Barcelona de 4 cifras (`'8031'`) da `'80'`
  (engancha con `LPAD` en el nivel siguiente); `POSITION` devuelve 0 si no encuentra el texto; `SPLIT_PART` devuelve `''`
  si no existe la parte. 🌍 SQL Server: `CHARINDEX`, `SUBSTRING(x, i, n)`; MySQL: `SUBSTRING_INDEX`; BigQuery: `SPLIT(...)[OFFSET(1)]`.
- **Predicción:** `SPLIT_PART('ana@faro.example', '.', 2)` → `'example'`.
- **Reto (`grafico: true`):** clientes del CRM por dominio de correo: columnas `dominio`
  (`split_part(lower(trim(email)), '@', 2)`), `clientes`, de más a menos y, a igualdad, por dominio. Comprobaciones:
  suma 332, sin dominios repetidos por mayúsculas o espacios (cifras con el verificador).

### e5-04 · Sustituir y componer: REPLACE, CONCAT y LPAD · 35 ◈ 🚧
- **Conceptos nuevos:** `REPLACE(x, 'C/', 'Calle ')` (sustituye todas las apariciones), encadenar `REPLACE`;
  componer con `||` (visto en e1-04) frente a `CONCAT(...)` y `CONCAT_WS(', ', ...)`; `LPAD(cp, 5, '0')` (y `RPAD`)
  para devolver el cero que el Excel se comió en los **19** CP de Barcelona. Ejemplos: `replace(lower(direccion), 'c/', 'calle ')`;
  etiqueta `nombre || ' (' || ciudad || ')'`.
- **Trampas:** `REPLACE` distingue mayúsculas (`'c/'` no es `'C/'`: primero `lower`); `||` con un `NULL` da `NULL`
  (los 7 clientes sin ciudad pierden la etiqueta entera) mientras que `CONCAT` lo trata como vacío (paso `prediccion` +
  `arreglar`); `LPAD` **recorta** si el texto ya es más largo que el ancho; un CP `NULL` sigue `NULL`.
  🌍 En SQL Server `||` es `+` (y con `NULL` también da `NULL`); en MySQL `||` es un `OR` lógico: usa `CONCAT`.
- **Reto:** clientes del CRM por provincia corregida: columnas `provincia` (`LEFT(LPAD(cp, 5, '0'), 2)`),
  `clientes`, ordenadas por `provincia` → ya no aparece `'80'` y `'08'` agrupa a Barcelona. Comprobaciones: ninguna
  provincia de una sola cifra o `'80'`, suma 332 (incluida la fila `NULL`), cifra de `'08'` con el verificador.

### e5-05 · Patrones: expresiones regulares · 45 ◈ 🚧
- **Conceptos nuevos:** expresión regular («un `LIKE` con superpoderes»): `~` (cumple el patrón), `~*` (sin
  distinguir mayúsculas), `!~`; piezas básicas: `^` y `$` (principio y fin), `[0-9]` o `\d`, `[^0-9]` (lo que no es
  cifra), `{4}`, `+`, `.` (cualquier carácter); `regexp_replace(x, patrón, reemplazo, 'g')`. Ejemplos: formatos de
  fecha → `fecha_alta ~ '^\d{4}-\d{2}-\d{2}$'` **199** y `~ '^\d{2}/\d{2}/\d{4}$'` **133**; teléfono solo cifras
  `right(regexp_replace(telefono, '[^0-9]', '', 'g'), 9)` → **290** quedan con 9 cifras (el `RIGHT` quita el `34` de
  `+34`). Tipos de teléfono de partida: `+34…` 125 · seguido 59 · con guiones 55 · con espacios 51 · `NULL` 20 · `N/D` 12 · `''` 10.
- **Trampas:** sin la `'g'`, `regexp_replace` cambia **solo la primera** coincidencia (paso `arreglar`: `'654 585 624'`
  → `'654585 624'`); sin `^…$` el patrón vale en cualquier parte del texto (`'\d{4}'` también casa con `'31/12/2099'`);
  el `.` es «cualquier carácter» (para un punto de verdad, `\.`); las tildes: no hay `unaccent`, se quitan con
  `regexp_replace(x, '[áà]', 'a', 'g')` o se dejan. 🌍 MySQL 8 tiene `REGEXP` y `REGEXP_REPLACE` (sin la `'g'`: siempre cambia todas); SQL Server no tiene regex nativo hasta la versión 2025.
- **Quiz:** ¿cuál de estos patrones encuentra exactamente un CP de 4 cifras? (`'^\d{4}$'`).
- **Reto:** teléfonos normalizados: columnas `crm_id`, `telefono` (original), `telefono_limpio` (9 cifras), solo los
  que quedan con 9 cifras, ordenados por `crm_id` → **290** filas. Comprobaciones: 290 filas, todos de 9 cifras y solo
  dígitos, ninguno empieza por `34` de prefijo (respuesta alternativa válida: otro patrón que dé el mismo resultado).

### e5-06 · Decidir fila a fila: CASE · 40 ◈ 🚧
- **Conceptos nuevos:** `CASE WHEN … THEN … ELSE … END` (el «SI…» de una hoja de cálculo), `CASE` simple
  (`CASE x WHEN 'S' THEN …`), tramos (`total < 100`, `< 500`, resto), `GROUP BY` por un `CASE`, contar con condición
  `COUNT(CASE WHEN estado = 'reembolsado' THEN 1 END)` (`FILTER` llega en la etapa 7). Ejemplos: `socio` escrito de
  **10 maneras** (`S`, `N`, `si`, `Sí`, `no`, `1`, `0`, `true`, `false`, `''`) → `true`/`false`/`NULL` con
  `lower(trim(socio)) IN (…)`; pedidos por tramo de importe (`grafico: true`, cifras con el verificador).
- **Trampas:** gana el **primer** `WHEN` que se cumple (paso `arreglar`: tramos en orden equivocado que meten todo en
  el primero); sin `ELSE`, lo que no encaja sale `NULL`; todas las ramas deben tener tipos compatibles (`THEN 1 … ELSE 'nada'` →
  error 22P02); `''` no es «no» sino «desconocido».
- **Predicción:** con `CASE WHEN total >= 100 THEN 'medio' WHEN total >= 500 THEN 'grande' END`, ¿cuántos pedidos salen como `'grande'`? (ninguno).
- **Reto:** convertir `gasto_total` a número: si lleva coma es formato español (`1.234,50`: quitar `' €'` y `'.'`,
  cambiar `','` por `'.'`); si no, solo quitar `' €'`; después `::numeric`. Columnas `crm_id`, `gasto_total`, `gasto`,
  ordenadas por `crm_id` → 332 filas. Comprobaciones: 332 filas sin error, `gasto` numérico, **suma 1 948 954,01**,
  `crm_id` 24 (`'10.080,50 €'`) → 10080.50.

### e5-07 · Fechas de verdad: to_date, EXTRACT y date_trunc · 40 ◈ 🚧
- **Conceptos nuevos:** `to_date(texto, 'DD/MM/YYYY')` y `to_date(texto, 'YYYY-MM-DD')` (la plantilla describe cómo
  viene escrita la fecha), elegir la plantilla con `CASE` + `~` (los 199 y 133 de e5-05); `EXTRACT(YEAR | MONTH |
  ISODOW FROM fecha)` (devuelve un número); `date_trunc('month', fecha)` («redondear hacia abajo» al mes, que es lo que
  hacía la columna `pedidos.mes` de las etapas 3–4). Ejemplo con `grafico: true`: facturación por
  `date_trunc('month', fecha)` en líneas (de enero de 2024 a septiembre de 2026, como con `mes`).
- **Trampas:** `'04/03/2026'::date` **no da error**: PostgreSQL lo lee como mes/día (3 de abril) y `'20/04/2026'::date`
  falla con **error 22008** (`date/time field value out of range`): nunca `::date` con fechas `DD/MM`; `EXTRACT(MONTH …) = 8`
  mezcla agosto de 2024, 2025 y 2026; `date_trunc` devuelve `timestamp` (con `00:00:00`), no texto; una plantilla
  equivocada en `to_date` puede dar una fecha absurda sin avisar. 🌍 MySQL `STR_TO_DATE`, SQL Server `CONVERT(date, x, 103)` /
  `DATETRUNC` (2022), BigQuery `PARSE_DATE` y `DATE_TRUNC(fecha, MONTH)`.
- **Quiz:** ¿qué devuelve `date_trunc('month', TIMESTAMP '2026-08-14 03:12:00')`? (`2026-08-01 00:00:00`).
- **Reto (`grafico: true`):** altas del CRM por año: columnas `anio` (`EXTRACT(YEAR FROM …)` de la fecha convertida),
  `clientes`, ordenadas por `anio` → aparecen los años **1900** y **2099** (una fila cada uno: se retoman en e5-10).
  Comprobaciones: suma 332, ningún `NULL`, filas de 1900 y 2099 con 1 (resto con el verificador).

### e5-08 · Cuánto tarda y cómo se ve: intervalos y to_char · 45 ◈ 🚧
- **Conceptos nuevos:** `timestamp - timestamp` = `interval` (`entrega - salida` en `envios`, del estilo `2 days 05:10:00`);
  `AVG` de intervalos; `EXTRACT(EPOCH FROM intervalo) / 86400` → días con decimales; `fecha + INTERVAL '3 days'`;
  `date - date` = número de días; `age(DATE '2026-10-01', nacimiento)` para la edad en `fichas_empleados`; `to_char(fecha,
  'DD/MM/YYYY HH24:MI')`, `to_char(fecha, 'YYYY-MM')` (igual que `pedidos.mes` en las 2 524 filas) y `to_char` de la
  `fecha_alta` convertida para dejarla en un único formato `AAAA-MM-DD`. Ejemplo: entrega media ≈ **2,5 días** en todos los almacenes.
- **Trampas:** los envíos sin `entrega` (65 `en reparto` y algunos devueltos) dan intervalo `NULL` y `AVG` los ignora;
  `CURRENT_DATE`/`now()` cambian cada día (consejo de Lucía: en un informe, fija la fecha de corte); `to_char` devuelve
  **texto** (ordenar por `'DD/MM/YYYY'` ordena mal; por `'YYYY-MM'` sí); `MM` es mes y `MI` minuto; `'Month'` sale en
  inglés y con relleno de espacios. 🌍 `DATEDIFF` en MySQL/SQL Server, `DATE_FORMAT` (MySQL), `FORMAT` (SQL Server), `FORMAT_DATE` (BigQuery).
- **Predicción:** `SELECT DATE '2026-10-01' - DATE '2026-09-21';` → `10` (días que lleva abierto el almacén de Zaragoza).
- **Reto:** entrega media por almacén: columnas `almacen`, `envios_entregados` (con `entrega` no nula),
  `dias_medios` (redondeado a 2 decimales), ordenadas por `almacen` → 4 filas (Zaragoza no tiene envíos), todas ≈ 2,5.
  Comprobaciones: 4 filas, `dias_medios` numérico entre 2 y 3, suma de `envios_entregados` con el verificador.

### e5-09 · Rellenar vacíos: COALESCE y NULLIF · 40 ◈ 🚧
- **Conceptos nuevos:** `COALESCE(a, b, …)` (el primero que no es `NULL`); `NULLIF(a, b)` (`NULL` si son iguales):
  convertir los falsos vacíos en `NULL` de verdad (`NULLIF(NULLIF(trim(telefono), ''), 'N/D')` → **42** sin teléfono:
  20 `NULL` + 12 `N/D` + 10 `''`); dividir sin miedo con `x / NULLIF(y, 0)`. Ejemplos: `COALESCE(ciudad, 'Desconocida')`
  en `clientes` (10 sin ciudad); tasa de reembolso por tienda con `LEFT JOIN` + `COUNT(CASE …)` / `NULLIF(COUNT(p.id), 0)`:
  Online 6,7 % y **Barcelona** sale `NULL` en lugar de **error 22012** (`division by zero`). Por fin, el **0 en lugar
  del `NULL`** de e4-06.
- **Trampas:** `COALESCE` exige tipos compatibles (`COALESCE(SUM(e.coste), 'sin envíos')` → error 22P02);
  `COALESCE(telefono, 'sin teléfono')` no arregla `''` ni `'N/D'` (antes `NULLIF`); rellenar con 0 puede mentir: «0 €»
  y «no lo sabemos» no son lo mismo (consejo de Lucía: rellena para presentar, no para calcular medias).
  🌍 `ISNULL` (SQL Server), `IFNULL` (MySQL, BigQuery), `NVL` (Oracle); `COALESCE` y `NULLIF` son estándar.
- **Reto:** el informe de e4-06 sin huecos: columnas `transportista`, `envios`, `coste_total` (0 si no tiene envíos),
  de más a menos envíos → 4 filas: Mensajería Sur 611 · Rayo Express 482 · Paquetería Norte 244 · Logística Delta 0
  con `coste_total` **0**. Comprobaciones: 4 filas, ningún `NULL`, suma de `coste_total` = 9 245,80.

### e5-10 · Duplicados y valores imposibles · 45 ◈ 🚧
- **Conceptos nuevos:** clave de comparación normalizada (`lower(trim(email))`) para encontrar duplicados con
  `GROUP BY … HAVING COUNT(*) > 1` → **20** personas repetidas (332 filas, **312** personas); el duplicado se reconoce
  por otro formato y gasto 0; contrastar con el sistema nuevo con `LEFT JOIN clientes ON lower(trim(crm.email)) =
  clientes.email … IS NULL` → los **12** clientes viejos `@antiguo.example`. Valor atípico (*outlier*): fuera de lo
  posible (alta en **1900-01-01** o en **31/12/2099**, gasto **999999.00**) o de lo razonable; detectarlos con
  `MIN`/`MAX`, `ORDER BY` y reglas de negocio (antes de que abriera Faro en 1998 o después de 2026); su efecto en una
  media: con el 999999 la suma es 1 948 954,01; sin él, media **2 866,93** y máximo **11 286,40**.
- **Trampas:** buscar duplicados por `nombre` (dos personas pueden llamarse igual) o por el email sin normalizar (no salen
  los 20; cifra con el verificador); `COUNT(*)` frente a `COUNT(DISTINCT lower(trim(email)))`; borrar no es cosa del analista (y `DELETE`
  llega en la etapa 6): se **marcan** con `CASE` o se excluyen con `WHERE`, y se avisa a quien los cuida (Nuria).
- **Quiz:** ¿qué haces con el gasto de 999 999 €? (excluirlo del cálculo y avisar; no inventarle otro valor).
- **Reto:** lista de atípicos para Nuria: columnas `crm_id`, `campo`, `valor` (el texto original), ordenadas por
  `crm_id` → **3** filas: 31 (`fecha_alta` 1900-01-01), 122 (`fecha_alta` 31/12/2099), 260 (`gasto_total` 999999.00).
  Se admite `UNION ALL` (e4-09) o `CASE`. Comprobaciones: 3 filas, los tres `crm_id`, ningún otro.

### e5-11 · Caso: Una sola dirección · 75 ◈ 🚧
- **Caso:** Nuria quiere cerrar la migración con las direcciones. Le preocupan los 9 clientes
  `@correo-rapido.example` de las etapas anteriores: no tienen teléfono y nadie los recuerda. Partes:
  1. Sus direcciones tal cual (`WHERE lower(trim(email)) LIKE '%@correo-rapido.example'`): columnas `crm_id`,
     `direccion`, `cp`, ciudad normalizada → **9** filas, 9 escrituras distintas («Calle Olmo 7, 3ºB», «C/ Olmo, 7 3ºB»,
     «c/olmo 7 - 3º B», «CALLE OLMO 7 3B»…), todas CP **28901** Getafe. `interpretar`: con `lower(trim(direccion))`
     siguen siendo 9 distintas.
  2. Normalizar: `regexp_replace(replace(lower(direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g')` → las 9 dan
     **`calleolmo73b`**. `interpretar`: ¿cuántas direcciones distintas quedan? (una).
  3. Todo el CRM por dirección normalizada, contando personas (`COUNT(DISTINCT lower(trim(email)))`), de más a menos →
     Olmo **9**; el resto, como mucho 2 (6 parejas que viven juntas). `interpretar`: ¿por qué contar emails distintos y no
     filas? (los 20 duplicados inflarían a 2 muchas direcciones).
  4. Cruzar con `fichas_empleados` por la dirección normalizada (`JOIN empleados`) → **Iván Soler** (empleado 7,
     Sistemas): «Calle Olmo, 7, 3ºB», 28901 Getafe. `interpretar`: ¿de quién es la dirección?
  → Pista del Expediente: **Una sola dirección**.
- **Regla del misterio:** es una **pista falsa** (la sembró el culpable), pero el caso la presenta como un hallazgo
  serio: Nuria se inquieta («Iván tiene acceso a todo») y Lucía pide no acusar a nadie hasta ver los registros de IT,
  que es justo lo que abre la etapa 6. Héctor no aparece ni se sugiere nada sobre él.

---

## Etapas 6–8
Se detallan aquí (mismo formato) antes de escribir sus lecciones. Contenido previsto:

- **6 · IT 🛠️:** `CREATE TABLE`, constraints, `INSERT/UPDATE/DELETE`, transacciones, normalización, índices y `EXPLAIN`, vistas. Caso: *La cuenta admin_temp*.
- **7 · Dirección 🧭:** subconsultas, `EXISTS`, CTE, CTE recursiva, funciones ventana, `LAG/LEAD`, acumulados, medias móviles, `NTILE`, `FILTER`, `generate_series`. Caso: *La coartada de Iván*.
- **8 · Analítica 📈:** KPIs, MoM/YoY, cohortes y retención, embudos, RFM, estadística descriptiva, z-score, A/B test, pivotes, dashboard, informe. Caso final: *Caso cerrado*.
