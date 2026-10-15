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
| 3 · Ventas 💶 | 9 | 🚧 |
| 4 · Logística 📦 | 10 | 🚧 |
| 5 · Migración 🧹 | 10 | 🚧 |
| 6 · IT 🛠️ | 10 | 🚧 |
| 7 · Dirección 🧭 | 11 | 🚧 |
| 8 · Analítica 📈 | 12 | 🚧 |
| **Total** | **90** | |

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

### e3-01 · Contar filas: COUNT · 25 ◈ 🚧
- **Conceptos nuevos:** función de agregado, `COUNT(*)`, `COUNT(columna)` (no cuenta `NULL`), contar con `WHERE`.
- **Reto:** ¿cuántos pedidos online hay? ¿Y cuántos clientes tienen teléfono?

### e3-02 · Sumar y promediar: SUM, AVG y ROUND · 30 ◈ 🚧
- **Conceptos nuevos:** `SUM`, `AVG`, `ROUND(x, 2)`, ticket medio, alias para el resultado.
- **Reto:** facturación y ticket medio de los pedidos entregados.

### e3-03 · Los extremos: MIN y MAX · 30 ◈ 🚧
- **Conceptos nuevos:** `MIN`, `MAX` con números, fechas y textos; varias funciones en un mismo `SELECT`.
- **Reto:** primer y último pedido, pedido más barato y más caro.

### e3-04 · Contar distintos: COUNT(DISTINCT) · 30 ◈ 🚧
- **Conceptos nuevos:** `COUNT(DISTINCT columna)`; diferencia con `COUNT(*)`.
- **Reto:** ¿cuántos clientes distintos han comprado online?

### e3-05 · Agrupar: GROUP BY · 35 ◈ 🚧
- **Conceptos nuevos:** `GROUP BY`, una fila por grupo, cada columna del `SELECT` agrupada o dentro de un agregado (error 42803), **primer gráfico de barras** (pestaña Gráfico).
- **Reto:** pedidos y facturación por tienda.

### e3-06 · Grupos por varias columnas · 35 ◈ 🚧
- **Conceptos nuevos:** `GROUP BY` con varias columnas, ordenar grupos por un agregado, **gráfico de líneas** con `mes`.
- **Reto:** facturación por mes (y por tienda y estado).

### e3-07 · Filtrar grupos: HAVING · 40 ◈ 🚧
- **Conceptos nuevos:** `HAVING`, diferencia con `WHERE` (filas antes de agrupar vs grupos después).
- **Reto:** clientes con más de 15 pedidos; productos con más de 130 unidades vendidas.

### e3-08 · El orden en que piensa SQL · 35 ◈ 🚧
- **Conceptos nuevos:** orden lógico `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT`; por qué un alias no vale en `WHERE` pero sí en `ORDER BY`; paso `arreglar`.
- **Reto:** top 5 de productos por unidades (con desempate por `producto_id`, hay empates).

### e3-09 · Caso: Reembolsos disparados · 60 ◈ 🚧
- **Caso:** Elena ve que los reembolsos suben. Partes: reembolsos por tienda (`GROUP BY tienda_id` con `WHERE estado = 'reembolsado'`) → pedidos por tienda → interpretar: la online tiene 103 de 1 527 (≈ 6,7 %) frente a ~2 % en las físicas → reembolsos online por mes (crecen desde marzo de 2026).
  → Pista del Expediente: **Reembolsos disparados**.

---

## Etapas 4–8
Se detallan aquí (mismo formato) antes de escribir sus lecciones. Contenido previsto:

- **3 · Ventas 💶:** `COUNT/SUM/AVG/MIN/MAX`, `COUNT(DISTINCT)`, `ROUND`, `GROUP BY`, `HAVING`, orden lógico de ejecución, primer gráfico. Caso: *Reembolsos disparados*.
- **4 · Logística 📦:** PK/FK, `INNER/LEFT/RIGHT/FULL JOIN`, huérfanos, varias tablas, self join, `CROSS JOIN`, `UNION/INTERSECT/EXCEPT`. Caso: *Pedidos fantasma*.
- **5 · Migración 🧹:** `CAST`, funciones de texto y regex básico, fechas (`EXTRACT`, `date_trunc`, intervalos, `to_char`), `CASE`, `COALESCE/NULLIF`, duplicados, atípicos. Caso: *Una sola dirección*.
- **6 · IT 🛠️:** `CREATE TABLE`, constraints, `INSERT/UPDATE/DELETE`, transacciones, normalización, índices y `EXPLAIN`, vistas. Caso: *La cuenta admin_temp*.
- **7 · Dirección 🧭:** subconsultas, `EXISTS`, CTE, CTE recursiva, funciones ventana, `LAG/LEAD`, acumulados, medias móviles, `NTILE`, `FILTER`, `generate_series`. Caso: *La coartada de Iván*.
- **8 · Analítica 📈:** KPIs, MoM/YoY, cohortes y retención, embudos, RFM, estadística descriptiva, z-score, A/B test, pivotes, dashboard, informe. Caso final: *Caso cerrado*.
