CURSO.registrar({
  id: "e8-07",
  titulo: "Lo que no es normal: z-score y atípicos",
  xp: 50,
  objetivo: "Sabrás medir cuánto se aleja un valor de lo normal con el z-score (con funciones ventana y por grupos), filtrar por él con una CTE, evitar que un valor enorme esconda a los demás usando una línea base y reconocer la regla del IQR como alternativa.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "¿Qué se sale de lo normal?",
      texto: "Compras va a cerrar los pedidos a proveedores del último trimestre y me pregunta qué productos se venden **fuera de lo normal**, por arriba, para no quedarse sin stock.\nNo quiero un «me parece que el 32 vende mucho». Quiero una medida que diga **cuánto** se aleja cada producto de lo habitual y que sirva igual para unidades, euros o lo que sea."
    },
    {
      tipo: "explicacion",
      titulo: "El z-score: cuántas desviaciones se aleja",
      texto: "El **z-score** de un valor es `(x − media) / desviación típica`: cuántas **desviaciones** (la dispersión que viste en el nivel anterior) está por encima (+) o por debajo (−) de la media.\nComo regla práctica: |z| > 2 es **raro** y |z| > 3, **muy raro**. Y no depende de la unidad: vale lo mismo para unidades que para euros.\nCon funciones ventana (e7) no hace falta agrupar: `AVG(x) OVER ()` y `STDDEV_SAMP(x) OVER ()` ponen la media y la desviación de **todas** las filas al lado de cada una. Con `PARTITION BY` se calcula dentro de cada grupo.\nEl ejemplo usa cinco números escritos a mano (`VALUES` en el `FROM`):",
      ejemplo: `SELECT x,
  ROUND((x - AVG(x) OVER ()) / STDDEV_SAMP(x) OVER (), 2) AS z
FROM (VALUES (10), (12), (11), (13), (95)) AS t(x)
ORDER BY x;`,
      otrosMotores: "`STDDEV_SAMP` existe con ese nombre en MySQL, BigQuery y Snowflake; en SQL Server se llama `STDEV` (y la de población, `STDEVP`)."
    },
    {
      tipo: "explicacion",
      titulo: "Filtrar por z: primero una CTE",
      texto: "Quieres «solo los que tienen z > 3», pero una función ventana **no se puede usar en el `WHERE`** de la misma consulta: el `WHERE` se aplica antes de calcular las ventanas (orden lógico, e3). La solución es calcular el z en una **CTE** y filtrar fuera.\nOtra trampa: si todos los valores de un grupo son iguales, la desviación es 0 y dividir da error. `NULLIF(desviacion, 0)` lo convierte en `NULL` (e5) y el z queda vacío en vez de romper la consulta.\nEl ejemplo busca, dentro de cada tienda (`PARTITION BY tienda_id`), los pedidos netos con un importe muy raro:",
      ejemplo: `WITH con_z AS (
  SELECT id, tienda_id, total,
    (total - AVG(total) OVER (PARTITION BY tienda_id))
      / NULLIF(STDDEV_SAMP(total) OVER (PARTITION BY tienda_id), 0) AS z
  FROM pedidos
  WHERE estado NOT IN ('cancelado', 'reembolsado')
)
SELECT id, tienda_id, total, ROUND(z, 2) AS z
FROM con_z
WHERE z > 3
ORDER BY z DESC, id;`,
      consejo: "Un atípico **no es un error ni un fraude**: es una pregunta. Un pedido de 4 000 € puede ser una empresa que equipa una oficina. Antes de llamar a nadie, mira la fila entera y busca la explicación aburrida."
    },
    {
      tipo: "ejercicio",
      enunciado: "Facturación neta mensual de **2025** (pedidos que no están `cancelado` ni `reembolsado`) y su z frente a los 12 meses de ese año: `mes` (la columna `mes` de `pedidos`), `facturacion` (suma de `total`) y `z` (con `AVG` y `STDDEV_SAMP` como ventana sobre los 12 meses, redondeado a 2), ordenado por `mes`.",
      solucion: `WITH mensual AS (
  SELECT mes, SUM(total) AS facturacion
  FROM pedidos
  WHERE mes BETWEEN '2025-01' AND '2025-12'
    AND estado NOT IN ('cancelado', 'reembolsado')
  GROUP BY mes
)
SELECT mes, facturacion,
  ROUND((facturacion - AVG(facturacion) OVER ()) / NULLIF(STDDEV_SAMP(facturacion) OVER (), 0), 2) AS z
FROM mensual
ORDER BY mes;`,
      pistas: [
        "Primero una CTE `mensual` con `mes` y `SUM(total)` (filtra 2025 y los estados, agrupa por `mes`). Fuera, el z con `AVG(facturacion) OVER ()` y `STDDEV_SAMP(facturacion) OVER ()`.",
        "WITH mensual AS (SELECT mes, SUM(total) AS facturacion FROM pedidos WHERE mes BETWEEN '2025-01' AND '2025-12' AND estado NOT IN ('cancelado', 'reembolsado') GROUP BY mes) SELECT mes, facturacion, ROUND((facturacion - AVG(facturacion) OVER ()) / NULLIF(STDDEV_SAMP(facturacion) OVER (), 0), 2) AS z FROM mensual ORDER BY mes;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `SELECT x,
  ROUND((x - AVG(x) OVER ()) / STDDEV_SAMP(x) OVER (), 2) AS z
FROM (VALUES (10), (12), (11), (13), (95), (30)) AS t(x)
ORDER BY x;`,
      pregunta: "Seis valores: cuatro normales (10–13), un **95** enorme y un **30** sospechoso. ¿Cuáles tendrán |z| > 2?",
      opciones: ["El 95 y el 30", "Solo el 95", "Ninguno"],
      correcta: 2,
      explicacion: "**Ninguno**, ni siquiera el 95 (se queda en 1,99). El 95 infla tanto la desviación típica que la vara de medir se vuelve enorme y todo parece normal; el 30 sale casi en 0. Es el **enmascaramiento**: el atípico se esconde a sí mismo y esconde a los demás."
    },
    {
      tipo: "explicacion",
      titulo: "Línea base: medir con lo que sabes que es normal",
      texto: "Contra el enmascaramiento, la media y la desviación se calculan con una **línea base**: un periodo o grupo que sabes normal (el año pasado, los meses antes de un cambio…). Se ponen en otra CTE y se aplican a **todas** las filas con un `CROSS JOIN` (una sola fila de base para cada fila de datos).\nEn el ejemplo, la base son los cuatro valores normales. Ahora el 30 y el 95 se ven a kilómetros.",
      ejemplo: `WITH datos AS (
  SELECT x
  FROM (VALUES (10), (12), (11), (13), (95), (30)) AS t(x)
),
base AS (
  SELECT AVG(x) AS media, STDDEV_SAMP(x) AS desviacion
  FROM datos
  WHERE x <= 13
)
SELECT d.x, ROUND((d.x - b.media) / NULLIF(b.desviacion, 0), 2) AS z
FROM datos AS d
CROSS JOIN base AS b
ORDER BY d.x;`,
      consejo: "Otra vara que no se deja engañar es la **regla del IQR**: es atípico lo que pasa de `Q3 + 1,5 · IQR` (con `percentile_cont`, nivel anterior). Usa cuartiles, no la media, así que un valor enorme apenas la mueve. Si dudas, calcula las dos."
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "Unidades vendidas por producto en **2026, de enero a septiembre** (pedidos con `fecha` desde el 2026-01-01 y antes del 2026-10-01, que no están `cancelado` ni `reembolsado`), y su z frente a **todos los productos vendidos** en ese periodo: `producto_id`, `unidades` (suma de `cantidad` de `lineas_pedido`) y `z` (con `AVG` y `STDDEV_SAMP` como ventana sobre esos productos, redondeado a 2). Devuelve los **5 de mayor z**; ojo, hay un **empate** en el 5.º puesto: desempata por `producto_id` de menor a mayor (`ORDER BY z DESC, producto_id`).",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas producto_id, unidades y z", prueba: (r) => PRUEBA.columnas(r, ["producto_id", "unidades", "z"]) },
        { texto: "Están ordenados de mayor a menor z", prueba: (r) => (r?.filas?.length ?? 0) > 0 && PRUEBA.ordenado(r, "z", "desc") },
        { texto: "El ORDER BY desempata por producto_id (con el empate del 5.º puesto, sin él el que sale es cuestión de suerte)", prueba: () => /\border\s+by\b[^;]*,\s*(\w+\.)?producto_id\b/i.test(PRUEBA.codigo()) },
        { texto: "Son los 5 productos de mayor z (con el desempate por producto_id) y cada uno con sus unidades y su z", prueba: (r, db) => PRUEBA.igualA(r, db, `WITH ventas AS (
  SELECT l.producto_id, SUM(l.cantidad) AS unidades
  FROM lineas_pedido AS l
  JOIN pedidos AS p ON p.id = l.pedido_id
  WHERE p.fecha >= '2026-01-01' AND p.fecha < '2026-10-01'
    AND p.estado NOT IN ('cancelado', 'reembolsado')
  GROUP BY l.producto_id
),
con_z AS (
  SELECT producto_id, unidades,
    (unidades - AVG(unidades) OVER ()) / NULLIF(STDDEV_SAMP(unidades) OVER (), 0) AS z
  FROM ventas
)
SELECT producto_id, unidades, ROUND(z, 2) AS z
FROM con_z
ORDER BY z DESC, producto_id
LIMIT 5;`) }
      ],
      pistas: [
        "Dos CTE: `ventas` (une `lineas_pedido` con `pedidos`, filtra fechas y estados y agrupa por `producto_id` con `SUM(cantidad)`) y `con_z` (el z con `AVG(unidades) OVER ()` y `STDDEV_SAMP(unidades) OVER ()`). Fuera, `ORDER BY z DESC, producto_id` y `LIMIT 5`.",
        "WITH ventas AS (SELECT l.producto_id, SUM(l.cantidad) AS unidades FROM lineas_pedido AS l JOIN pedidos AS p ON p.id = l.pedido_id WHERE p.fecha >= '2026-01-01' AND p.fecha < '2026-10-01' AND p.estado NOT IN ('cancelado', 'reembolsado') GROUP BY l.producto_id), con_z AS (SELECT producto_id, unidades, (unidades - AVG(unidades) OVER ()) / NULLIF(STDDEV_SAMP(unidades) OVER (), 0) AS z FROM ventas) SELECT producto_id, unidades, ROUND(z, 2) AS z FROM con_z ORDER BY z DESC, producto_id LIMIT 5;"
      ],
      solucion: `WITH ventas AS (
  SELECT l.producto_id, SUM(l.cantidad) AS unidades
  FROM lineas_pedido AS l
  JOIN pedidos AS p ON p.id = l.pedido_id
  WHERE p.fecha >= '2026-01-01' AND p.fecha < '2026-10-01'
    AND p.estado NOT IN ('cancelado', 'reembolsado')
  GROUP BY l.producto_id
),
con_z AS (
  SELECT producto_id, unidades,
    (unidades - AVG(unidades) OVER ()) / NULLIF(STDDEV_SAMP(unidades) OVER (), 0) AS z
  FROM ventas
)
SELECT producto_id, unidades, ROUND(z, 2) AS z
FROM con_z
ORDER BY z DESC, producto_id
LIMIT 5;`
    }
  ]
});
