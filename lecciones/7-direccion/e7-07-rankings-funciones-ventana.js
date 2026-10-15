CURSO.registrar({
  id: "e7-07",
  titulo: "Rankings: funciones ventana",
  xp: 45,
  objetivo: "Sabrás calcular sobre un grupo de filas sin juntarlas con OVER, separar grupos con PARTITION BY, numerar y clasificar con ROW_NUMBER, RANK y DENSE_RANK, y sacar el «top N» de cada grupo.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "Rankings, no listas",
      texto: "Cuando pido «los productos más vendidos», no quiero una lista de 40 filas: quiero **un ranking**. Puesto 1, 2, 3. Y por categoría: lo que va bien en Audio no compite con lo que va bien en Informática.\nY al lado de cada número, qué parte del total supone. El consejo piensa en porcentajes."
    },
    {
      tipo: "explicacion",
      titulo: "OVER: calcular sin juntar filas",
      texto: "Con `GROUP BY`, las filas de un grupo se **funden** en una. Una **función ventana** calcula sobre un grupo de filas, pero **cada fila sigue en su sitio**: el resultado aparece al lado.\nSe escribe con `OVER (…)` detrás de la función. `SUM(total) OVER ()` suma **todas** las filas del resultado y pone esa suma en cada fila; con ella, el porcentaje de cada pedido es inmediato.\nEl ejemplo son los pedidos del cliente 1: cada uno con el total de todos ellos y su porcentaje.",
      ejemplo: `SELECT id, fecha, total,
  SUM(total) OVER () AS total_cliente,
  ROUND(100 * total / SUM(total) OVER (), 1) AS porcentaje
FROM pedidos
WHERE cliente_id = 1
ORDER BY fecha;`,
      consejo: "La ventana se calcula **después** del `WHERE`: «todas las filas» son las que han pasado el filtro. Aquí, los pedidos del cliente 1, no los 2 524 de Faro."
    },
    {
      tipo: "explicacion",
      titulo: "PARTITION BY y ORDER BY dentro de OVER",
      texto: "Dentro de `OVER` puedes poner dos cosas:\n- `PARTITION BY columna`: parte las filas en grupos (como un `GROUP BY` que no junta). La función se calcula dentro de cada grupo.\n- `ORDER BY columna`: el orden dentro del grupo. Lo necesitan las funciones de ranking.\n`ROW_NUMBER() OVER (PARTITION BY cliente_id ORDER BY fecha, id)` numera los pedidos de cada cliente del más antiguo al más reciente, y vuelve a empezar en 1 con cada cliente.",
      ejemplo: `SELECT cliente_id, id, fecha,
  ROW_NUMBER() OVER (PARTITION BY cliente_id ORDER BY fecha, id) AS n_pedido
FROM pedidos
WHERE cliente_id IN (1, 2)
ORDER BY cliente_id, n_pedido;`,
      otrosMotores: "Las funciones ventana son estándar: funcionan igual en MySQL 8+, SQL Server, BigQuery, Oracle y SQLite 3.25+."
    },
    {
      tipo: "ejercicio",
      enunciado: "Para cada tienda, numera sus pedidos **del más caro al más barato**: columnas `tienda_id`, `id`, `total` y `puesto` (`ROW_NUMBER` por tienda, ordenando por `total` de mayor a menor y, si empatan, por `id`). Solo los pedidos de **2026-09** (`mes = '2026-09'`). Ordena el resultado por `tienda_id` y `puesto`.",
      solucion: `SELECT tienda_id, id, total,
  ROW_NUMBER() OVER (PARTITION BY tienda_id ORDER BY total DESC, id) AS puesto
FROM pedidos
WHERE mes = '2026-09'
ORDER BY tienda_id, puesto;`,
      pistas: [
        "`ROW_NUMBER() OVER (PARTITION BY tienda_id ORDER BY total DESC, id) AS puesto`, con el filtro en el `WHERE`.",
        "SELECT tienda_id, id, total, ROW_NUMBER() OVER (PARTITION BY tienda_id ORDER BY total DESC, id) AS puesto FROM pedidos WHERE mes = '2026-09' ORDER BY tienda_id, puesto;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "ROW_NUMBER, RANK y DENSE_RANK",
      texto: "Las tres numeran según el `ORDER BY` de `OVER`. Solo se diferencian en los **empates**:\n- `ROW_NUMBER`: 1, 2, 3, 4… nunca repite. Entre empatados decide el desempate que le des (o el azar, si no le das ninguno).\n- `RANK`: los empatados comparten puesto y luego **salta**: 1, 2, 2, 4.\n- `DENSE_RANK`: comparten puesto y **no salta**: 1, 2, 2, 3.\nEn el ejemplo, los productos 13 y 32 empatan con 142 unidades vendidas.",
      ejemplo: `WITH ventas AS (
  SELECT producto_id, SUM(cantidad) AS unidades
  FROM lineas_pedido
  GROUP BY producto_id
)
SELECT producto_id, unidades,
  ROW_NUMBER() OVER (ORDER BY unidades DESC, producto_id) AS fila,
  RANK() OVER (ORDER BY unidades DESC) AS puesto,
  DENSE_RANK() OVER (ORDER BY unidades DESC) AS puesto_denso
FROM ventas
ORDER BY unidades DESC, producto_id
LIMIT 5;`,
      consejo: "Con `ROW_NUMBER`, **desempata siempre** hasta que no quede duda (`ORDER BY unidades DESC, producto_id`). Si no, dos ejecuciones iguales pueden dar puestos distintos a los empatados, y nadie entenderá por qué el informe cambió."
    },
    {
      tipo: "prediccion",
      consulta: `WITH ventas AS (
  SELECT producto_id, SUM(cantidad) AS unidades
  FROM lineas_pedido
  GROUP BY producto_id
)
SELECT producto_id, unidades,
  RANK() OVER (ORDER BY unidades DESC) AS puesto
FROM ventas
ORDER BY unidades DESC, producto_id
LIMIT 4;`,
      pregunta: "El producto 16 va primero (156 uds.), el 13 y el 32 empatan con 142 y el 2 tiene 139. ¿Qué `puesto` le da `RANK` al producto 2?",
      opciones: ["3", "4", "5"],
      correcta: 1,
      explicacion: "**4**. Los dos empatados comparten el puesto 2 y `RANK` se salta el 3: delante del producto 2 hay **tres** productos, así que es el cuarto. Con `DENSE_RANK` sería el 3."
    },
    {
      tipo: "arreglar",
      enunciado: "Ana quiere el pedido **más caro de cada tienda**: `tienda_id`, `id` y `total`, ordenado por `tienda_id` (si dos empatan, el de `id` más bajo). La consulta da error: no se puede usar una función ventana en el `WHERE`. Arréglala calculando el puesto en una CTE y filtrando fuera.",
      inicial: `SELECT tienda_id, id, total,
  ROW_NUMBER() OVER (PARTITION BY tienda_id ORDER BY total DESC, id) AS puesto
FROM pedidos
WHERE puesto = 1
ORDER BY tienda_id;`,
      solucion: `WITH ranking AS (
  SELECT tienda_id, id, total,
    ROW_NUMBER() OVER (PARTITION BY tienda_id ORDER BY total DESC, id) AS puesto
  FROM pedidos
)
SELECT tienda_id, id, total
FROM ranking
WHERE puesto = 1
ORDER BY tienda_id;`,
      pistas: [
        "El `WHERE` se ejecuta **antes** que las ventanas: cuando filtra, `puesto` aún no existe. Mete el `SELECT` con la ventana en `WITH ranking AS (…)` y filtra en la consulta de fuera.",
        "WITH ranking AS (SELECT tienda_id, id, total, ROW_NUMBER() OVER (PARTITION BY tienda_id ORDER BY total DESC, id) AS puesto FROM pedidos) SELECT tienda_id, id, total FROM ranking WHERE puesto = 1 ORDER BY tienda_id;"
      ]
    },
    {
      tipo: "quiz",
      pregunta: "Quieres el top 3 de cada categoría y, si hay empate en el tercer puesto, **que entren todos los empatados**. ¿Qué función usas para filtrar `WHERE puesto <= 3`?",
      opciones: ["ROW_NUMBER", "RANK", "Da igual: las tres devuelven lo mismo"],
      correcta: 1,
      explicacion: "Con `RANK`, dos empatados en el tercer puesto reciben los dos un 3, y entran los dos. `ROW_NUMBER` dejaría fuera a uno (el que pierda el desempate). `DENSE_RANK` también los dejaría entrar, pero como no salta puestos, con empates arriba podría colar a más productos de la cuenta. Elige según lo que pida el negocio y **dilo** en el informe."
    },
    {
      tipo: "reto",
      de: "ana",
      enunciado: "El ranking para el consejo: los **3 productos con más unidades vendidas de cada categoría** (suma de `cantidad` en `lineas_pedido`). Columnas `categoria`, `producto` (el nombre), `unidades` y `puesto` (`ROW_NUMBER` dentro de cada categoría, de más a menos unidades; si empatan, primero el de `id` de producto más bajo). Ordena por `categoria` y `puesto`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas categoria, producto, unidades y puesto", prueba: (r) => PRUEBA.columnas(r, ["categoria", "producto", "unidades", "puesto"]) },
        { texto: "Solo salen los puestos 1, 2 y 3", prueba: (r) => {
          const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "puesto");
          return i >= 0 && (r?.filas?.length ?? 0) > 0 && (r?.filas || []).every(f => [1, 2, 3].includes(Number(f?.[i])));
        } },
        { texto: "Cada categoría con sus 3 productos más vendidos, por categoría y puesto", prueba: (r, db) => PRUEBA.igualA(r, db, `WITH ventas AS (
  SELECT p.categoria, p.id AS producto_id, p.nombre AS producto, SUM(l.cantidad) AS unidades
  FROM lineas_pedido AS l
  JOIN productos AS p ON p.id = l.producto_id
  GROUP BY p.categoria, p.id, p.nombre
),
ranking AS (
  SELECT categoria, producto, unidades,
    ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY unidades DESC, producto_id) AS puesto
  FROM ventas
)
SELECT categoria, producto, unidades, puesto
FROM ranking
WHERE puesto <= 3
ORDER BY categoria, puesto;`) }
      ],
      pistas: [
        "Dos pasos: una CTE `ventas` que une `lineas_pedido` con `productos` y suma `cantidad` por categoría y producto (agrupa también por `p.id`); otra CTE `ranking` con `ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY unidades DESC, producto_id)`. Fuera, `WHERE puesto <= 3`.",
        "WITH ventas AS (SELECT p.categoria, p.id AS producto_id, p.nombre AS producto, SUM(l.cantidad) AS unidades FROM lineas_pedido AS l JOIN productos AS p ON p.id = l.producto_id GROUP BY p.categoria, p.id, p.nombre), ranking AS (SELECT categoria, producto, unidades, ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY unidades DESC, producto_id) AS puesto FROM ventas) SELECT categoria, producto, unidades, puesto FROM ranking WHERE puesto <= 3 ORDER BY categoria, puesto;"
      ],
      solucion: `WITH ventas AS (
  SELECT p.categoria, p.id AS producto_id, p.nombre AS producto, SUM(l.cantidad) AS unidades
  FROM lineas_pedido AS l
  JOIN productos AS p ON p.id = l.producto_id
  GROUP BY p.categoria, p.id, p.nombre
),
ranking AS (
  SELECT categoria, producto, unidades,
    ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY unidades DESC, producto_id) AS puesto
  FROM ventas
)
SELECT categoria, producto, unidades, puesto
FROM ranking
WHERE puesto <= 3
ORDER BY categoria, puesto;`
    }
  ]
});
