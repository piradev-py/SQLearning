# Plan del curso SQLearning

Temario completo, de cero absoluto a Data Analyst. Este documento es para humanos; el índice que usa la web está
en `js/curso.js` → `ETAPAS`. **Ambos deben estar siempre sincronizados** (mismo id, archivo y título).
La historia y el misterio están en `docs/HISTORIA.md`.

- Alumno tipo: hispanohablante que **nunca ha usado una base de datos** (ni programado).
- Una idea por nivel. Nunca se usa algo que no se haya enseñado antes.
- Cada nivel: ticket (`historia`) → 2–3 explicaciones → ejercicio(s) → quiz/predicción → reto final.
- Cada etapa termina con un **Caso** que desbloquea una pista del Expediente.
- XP base entre 20 y 60 según dificultad (el motor suma +10 por estrella). Los casos: 50–80.
- Motor: PostgreSQL (PGlite). Cuando la sintaxis cambie en otros motores, recuadro «🌍 En otros motores».

Estado: ✅ escrito · 🚧 pendiente

| Etapa | Niveles | Estado |
|---|---|---|
| 0 · El archivo de papel 🗂️ *(opcional)* | 10 | 🚧 |
| 1 · Primer día 🎒 | 9 | 🚧 |
| 2 · Atención al cliente ☎️ | 9 | 🚧 |
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
perder nada obligatorio (sus XP e insignia son extra). **No se escribe SQL**: todo se trabaja «sobre el papel»
con pasos interactivos (`clasificar`, `seleccionar`, `ordenar`, `diagrama`, `quiz`).

**Historia propia:** antes de tu primer día, Lucía te pone una prueba. La primera tienda de Faro (1998) llevaba
todo en **fichas de papel y un Excel gigante** que nadie entiende. Tu misión: ordenar ese archivo con lógica y
diseñar en papel cómo debería guardarse. (Autónoma: no contiene pistas del Fantasma.)

**Al terminarla, el alumno sabrá:** qué tipos de datos existen, por qué una base de datos separa la información en
tablas, razonar con lógica Y/O/NO y con conjuntos, identificar entidades y relaciones, leer y dibujar un diagrama
entidad-relación, describir el ciclo del análisis y los roles de datos, y tratar datos personales con cuidado.

### e0-01 · ¿Qué es un dato? · 20 XP 🚧
- **Conceptos:** dato vs información, tipos (texto, número entero/decimal, fecha, sí/no), cualitativo vs cuantitativo, el dato vacío (lo que más tarde será `NULL`).
- **Reto (`clasificar`):** clasificar los datos de una ficha de cliente de 1998 por tipo.

### e0-02 · Del Excel gigante a las tablas · 25 XP 🚧
- **Conceptos:** tabla, fila, columna, una tabla = un tipo de cosa, problemas de repetir datos (cambiar un teléfono en 40 sitios, erratas).
- **Reto (`seleccionar`):** marcar en el Excel las celdas que se repiten y que deberían vivir en otra tabla.

### e0-03 · Verdadero o falso: lógica Y/O/NO · 30 XP 🚧
- **Conceptos:** condición, verdadero/falso, Y (todas), O (alguna), NO, paréntesis, tablas de verdad, «no sé» (lógica de 3 valores, primer contacto).
- **Reto (`seleccionar`):** marcar a mano las fichas que cumplen «de Madrid Y (compró en 1999 O gastó más de 100 €)».

### e0-04 · Conjuntos: unir, cruzar y restar · 30 XP 🚧
- **Conceptos:** conjunto, diagramas de Venn, unión, intersección, diferencia (base de `UNION`, `JOIN` y `EXCEPT`).
- **Reto (`clasificar`):** colocar clientes en un Venn «compró audio» / «compró gaming».

### e0-05 · Entidades y atributos · 30 XP 🚧
- **Conceptos:** entidad (cliente, producto, pedido…), atributo, entidad vs atributo (¿la ciudad es una cosa o un dato?).
- **Reto (`clasificar`):** separar entidades y atributos del archivo de la tienda.

### e0-06 · Relaciones y claves · 35 XP 🚧
- **Conceptos:** relación 1:1, 1:N, N:M; clave primaria («el DNI de cada fila»), clave foránea («la fila que apunta a otra»), tabla intermedia para N:M.
- **Reto (`quiz` + `clasificar`):** decidir el tipo de cada relación (cliente–pedido, pedido–producto, empleado–tienda…).

### e0-07 · Diagramas entidad-relación · 40 XP 🚧
- **Conceptos:** cajas, líneas, notación pata de gallo (crow's foot), leer un diagrama, cardinalidad mínima (opcional/obligatoria).
- **Reto (`diagrama`):** conectar las entidades de la tienda y elegir la cardinalidad de cada línea.

### e0-08 · El ciclo del análisis y los roles · 25 XP 🚧
- **Conceptos:** pregunta → datos → limpieza → análisis → comunicar → decisión; Data Analyst vs Data Scientist vs Data Engineer vs BI; buenas preguntas de negocio.
- **Reto (`ordenar` + `clasificar`):** ordenar los pasos de un análisis real y asignar tareas a cada rol.

### e0-09 · Privacidad y ética de los datos · 25 XP 🚧
- **Conceptos:** dato personal y dato sensible, RGPD (principios básicos: finalidad, minimización, acceso), anonimizar vs seudonimizar, sesgos.
- **Reto (`seleccionar`):** marcar qué columnas de un informe no deberían salir de la empresa.

### e0-10 · Caso: Ordenar el archivo · 60 XP 🚧
- **Caso:** a partir del Excel gigante de 1998, diseñar el diagrama completo de la tienda (entidades, atributos clave, relaciones y cardinalidades) y responder tres preguntas sobre él. → Insignia **Arquitecto de datos** 🗂️.

---

## Etapa 1 · Primer día 🎒 — «Aprender a preguntar a los datos»

**Historia:** primer día en Faro. Lucía te da acceso a la base de datos y te pide pequeños listados para el equipo.
Al final, revisando el inventario, encuentras algo imposible.

**Tablas:** `productos` (id, nombre, categoria, precio, stock, proveedor, activo, creado), `tiendas` (id, ciudad,
apertura), `empleados` (id, nombre, departamento, tienda_id, email).

**Al terminarla, el alumno sabrá:** qué es una base de datos relacional, leer un esquema, y escribir consultas
`SELECT` que eligen, calculan, renombran, quitan repetidos, ordenan y limitan resultados.

### e1-01 · ¿Qué es una base de datos? · 20 XP 🚧
- **Conceptos nuevos:** base de datos, tabla, fila (registro), columna (campo), SQL, consulta, `SELECT * FROM`, el `;` final.
- **Reto:** ver la tabla `tiendas` entera.

### e1-02 · Elegir columnas · 25 XP 🚧
- **Conceptos nuevos:** `SELECT col1, col2`, orden de las columnas, por qué no abusar de `*`, mayúsculas en palabras clave (convención).
- **Reto:** listado de empleados con nombre y departamento para el directorio interno.

### e1-03 · Leer el esquema y los tipos · 25 XP 🚧
- **Conceptos nuevos:** pestaña Esquema, tipos `integer`, `numeric`, `text`, `date`, `boolean`; clave primaria `id` (primer contacto).
- **Reto (interpretar + consulta):** ¿qué tipo tiene `precio`? Lista nombre, precio y si está activo.

### e1-04 · Columnas calculadas · 30 XP 🚧
- **Conceptos nuevos:** operadores `+ - * /`, división entera vs decimal, concatenar texto con `||`.
- **Reto:** valor del inventario por producto (`precio * stock`).

### e1-05 · Ponerle nombre: alias · 30 XP 🚧
- **Conceptos nuevos:** `AS`, alias con espacios entre comillas dobles, alias de tabla (primer contacto).
- **Reto:** el informe anterior con columnas `producto` y `valor_inventario`.

### e1-06 · Sin repetir: DISTINCT · 30 XP 🚧
- **Conceptos nuevos:** `DISTINCT`, `DISTINCT` sobre varias columnas.
- **Reto:** ¿qué categorías y qué proveedores tenemos?

### e1-07 · Ordenar resultados · 35 XP 🚧
- **Conceptos nuevos:** `ORDER BY`, `ASC`/`DESC`, ordenar por varias columnas, por alias y por expresión.
- **Reto:** productos del más caro al más barato y, a igual precio, por nombre.

### e1-08 · Los primeros N: LIMIT y OFFSET · 35 XP 🚧
- **Conceptos nuevos:** `LIMIT`, `OFFSET`, paginar, «top N». 🌍 `TOP` en SQL Server, `FETCH FIRST` estándar.
- **Reto:** los 5 productos con más stock; después, la «página 2».

### e1-09 · Caso: El inventario imposible · 50 XP 🚧
- **Conceptos nuevos:** comentarios `--` y `/* */`; combinar todo lo anterior.
- **Caso:** el informe de inventario de Lucía «no cuadra». Ordenando por stock aparece un producto con stock
  **negativo**. → Pista del Expediente: **El inventario imposible**.

---

## Etapas 2–8
Se detallan aquí (mismo formato) antes de escribir sus lecciones. Contenido previsto:

- **2 · Atención al cliente ☎️:** `WHERE`, comparadores, `AND/OR/NOT` y paréntesis, `IN`, `BETWEEN`, `LIKE/ILIKE`, `NULL` e `IS NULL`, filtrar fechas. Caso: *Clientes de madrugada*.
- **3 · Ventas 💶:** `COUNT/SUM/AVG/MIN/MAX`, `COUNT(DISTINCT)`, `ROUND`, `GROUP BY`, `HAVING`, orden lógico de ejecución, primer gráfico. Caso: *Reembolsos disparados*.
- **4 · Logística 📦:** PK/FK, `INNER/LEFT/RIGHT/FULL JOIN`, huérfanos, varias tablas, self join, `CROSS JOIN`, `UNION/INTERSECT/EXCEPT`. Caso: *Pedidos fantasma*.
- **5 · Migración 🧹:** `CAST`, funciones de texto y regex básico, fechas (`EXTRACT`, `date_trunc`, intervalos, `to_char`), `CASE`, `COALESCE/NULLIF`, duplicados, atípicos. Caso: *Una sola dirección*.
- **6 · IT 🛠️:** `CREATE TABLE`, constraints, `INSERT/UPDATE/DELETE`, transacciones, normalización, índices y `EXPLAIN`, vistas. Caso: *La cuenta admin_temp*.
- **7 · Dirección 🧭:** subconsultas, `EXISTS`, CTE, CTE recursiva, funciones ventana, `LAG/LEAD`, acumulados, medias móviles, `NTILE`, `FILTER`, `generate_series`. Caso: *La coartada de Iván*.
- **8 · Analítica 📈:** KPIs, MoM/YoY, cohortes y retención, embudos, RFM, estadística descriptiva, z-score, A/B test, pivotes, dashboard, informe. Caso final: *Caso cerrado*.
