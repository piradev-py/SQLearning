CURSO.registrar({
  id: "e7-04",
  titulo: "Paso a paso: CTE con WITH",
  xp: 40,
  objetivo: "Sabrás partir una consulta larga en pasos con nombre usando WITH (CTE), encadenar varios pasos y leerla de arriba abajo como una receta.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "El informe mensual",
      texto: "Cada mes quiero lo mismo: la facturación de cada mes, la media de todos los meses y **qué meses quedaron por encima**.\nLucía me enseñó la consulta que lo hace con subconsultas y no entendí ni la primera línea. Si el informe lo tiene que revisar otra persona, tiene que poder leerse. Paso a paso, por favor."
    },
    {
      tipo: "explicacion",
      titulo: "WITH: ponle nombre a un paso",
      texto: "Una **CTE** (*Common Table Expression*, «expresión de tabla común») es una subconsulta con nombre que se escribe **antes** de la consulta principal:\n`WITH nombre AS (SELECT …) SELECT … FROM nombre;`\nEs lo mismo que una subconsulta en `FROM`, pero sacada arriba y con un nombre que explica qué es. El ejemplo crea el paso `ventas_mes` (facturación por mes) y luego lo usa como una tabla.",
      ejemplo: `WITH ventas_mes AS (
  SELECT mes, SUM(total) AS facturacion
  FROM pedidos
  GROUP BY mes
)
SELECT mes, facturacion
FROM ventas_mes
ORDER BY mes DESC
LIMIT 5;`,
      otrosMotores: "`WITH` funciona igual en MySQL 8, SQL Server, Oracle, BigQuery y SQLite. En SQL Server, si la sentencia anterior no termina en `;`, el `WITH` da error: por eso allí verás a veces `;WITH`."
    },
    {
      tipo: "prediccion",
      consulta: `WITH ventas_mes AS (
  SELECT mes, SUM(total) AS facturacion
  FROM pedidos
  GROUP BY mes
)
SELECT COUNT(*) AS meses
FROM ventas_mes;`,
      pregunta: "Hay pedidos desde enero de 2024 hasta septiembre de 2026. ¿Cuántas filas tiene `ventas_mes`?",
      opciones: ["12", "33", "2 524"],
      correcta: 1,
      explicacion: "**33**: 12 meses de 2024, 12 de 2025 y 9 de 2026. `ventas_mes` tiene una fila por mes, no por pedido: es el resultado del `GROUP BY`."
    },
    {
      tipo: "ejercicio",
      enunciado: "Reescribe con una CTE la media de pedidos por cliente: un paso `pedidos_cliente` con `cliente_id` y `pedidos` (cuántos tiene cada uno) y, después, la media de `pedidos` redondeada a 2 decimales con el alias `media_pedidos`.",
      solucion: `WITH pedidos_cliente AS (
  SELECT cliente_id, COUNT(*) AS pedidos
  FROM pedidos
  GROUP BY cliente_id
)
SELECT ROUND(AVG(pedidos), 2) AS media_pedidos
FROM pedidos_cliente;`,
      pistas: [
        "La subconsulta que iba en el `FROM` sube al `WITH pedidos_cliente AS (…)`, y la consulta principal queda `SELECT ROUND(AVG(pedidos), 2) AS media_pedidos FROM pedidos_cliente;`.",
        "WITH pedidos_cliente AS (SELECT cliente_id, COUNT(*) AS pedidos FROM pedidos GROUP BY cliente_id) SELECT ROUND(AVG(pedidos), 2) AS media_pedidos FROM pedidos_cliente;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Varios pasos encadenados",
      texto: "Puedes escribir varios pasos separados por **comas** (un solo `WITH` al principio). Cada paso puede usar los anteriores:\n1. `ventas_mes`: facturación por mes.\n2. `media`: la media de esos meses (una sola fila).\n3. Consulta principal: los meses por encima, juntando cada mes con la media mediante `CROSS JOIN` (como la media es una sola fila, se pega al lado de cada mes).\nSe lee de arriba abajo como una receta: cada paso tiene un nombre que dice qué contiene.",
      ejemplo: `WITH ventas_mes AS (
  SELECT mes, SUM(total) AS facturacion
  FROM pedidos
  GROUP BY mes
),
media AS (
  SELECT AVG(facturacion) AS media_mensual
  FROM ventas_mes
)
SELECT v.mes, v.facturacion
FROM ventas_mes AS v
CROSS JOIN media AS m
WHERE v.facturacion > m.media_mensual
ORDER BY v.mes;`,
      consejo: "Pon nombres que se entiendan sin leer el código: `ventas_mes`, `media`, `clientes_activos`. Dentro de seis meses, quien lo lea (probablemente tú) te lo agradecerá."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería devolver el **máximo** y el **mínimo** de pedidos que tiene un cliente (`maximo`, `minimo`), pero da un error de sintaxis. Arréglala.",
      inicial: `WITH pedidos_cliente AS (
  SELECT cliente_id, COUNT(*) AS pedidos
  FROM pedidos
  GROUP BY cliente_id
)
WITH resumen AS (
  SELECT MAX(pedidos) AS maximo, MIN(pedidos) AS minimo
  FROM pedidos_cliente
)
SELECT maximo, minimo
FROM resumen;`,
      solucion: `WITH pedidos_cliente AS (
  SELECT cliente_id, COUNT(*) AS pedidos
  FROM pedidos
  GROUP BY cliente_id
),
resumen AS (
  SELECT MAX(pedidos) AS maximo, MIN(pedidos) AS minimo
  FROM pedidos_cliente
)
SELECT maximo, minimo
FROM resumen;`,
      pistas: [
        "`WITH` se escribe **una sola vez**, al principio. Los pasos siguientes se separan con comas.",
        "Cambia el segundo `WITH resumen AS (` por `, resumen AS (` (una coma después del paréntesis que cierra el primer paso)."
      ]
    },
    {
      tipo: "quiz",
      pregunta: "Ejecutas la consulta con `WITH ventas_mes AS (…)` y, en otra consulta distinta, escribes `SELECT * FROM ventas_mes;`. ¿Qué pasa?",
      opciones: [
        "Funciona: la CTE queda guardada como una vista",
        "Error: la tabla no existe. Una CTE solo vive dentro de la consulta donde se escribe",
        "Devuelve el resultado de la última vez que se ejecutó"
      ],
      correcta: 1,
      explicacion: "Una CTE es un paso **dentro de una consulta**: termina el `;` y desaparece. Si quieres reutilizarla en muchas consultas, eso es una **vista** (`CREATE VIEW`), que sí se guarda en la base."
    },
    {
      tipo: "reto",
      de: "ana",
      enunciado: "Con **dos CTE**: primero la facturación de cada tienda en **2026** (suma de `total` de todos sus pedidos de 2026, sin filtrar por estado); después, la media de esas facturaciones. Devuelve las tiendas que están **por encima** de esa media: `tienda_id` y `facturacion`, ordenadas por `tienda_id`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas tienda_id y facturacion", prueba: (r) => PRUEBA.columnas(r, ["tienda_id", "facturacion"]) },
        { texto: "La facturación es solo la de 2026", prueba: async (r, db) => {
          const c = await db.consulta(`SELECT SUM(total) FROM pedidos WHERE tienda_id = 5 AND fecha >= '2026-01-01' AND fecha < '2027-01-01';`);
          const esperado = Number(c?.filas?.[0]?.[0] ?? NaN);
          const fila = (r?.filas || []).findIndex((f, i) => Number(PRUEBA.valor(r, i, "tienda_id")) === 5);
          return fila >= 0 && Math.abs(Number(PRUEBA.valor(r, fila, "facturacion")) - esperado) < 0.01;
        } },
        { texto: "Salen solo las tiendas por encima de la media, ordenadas por tienda_id", prueba: (r, db) => PRUEBA.igualA(r, db, `WITH ventas_tienda AS (
  SELECT tienda_id, SUM(total) AS facturacion
  FROM pedidos
  WHERE fecha >= '2026-01-01' AND fecha < '2027-01-01'
  GROUP BY tienda_id
),
media AS (
  SELECT AVG(facturacion) AS media_tiendas
  FROM ventas_tienda
)
SELECT v.tienda_id, v.facturacion
FROM ventas_tienda AS v
CROSS JOIN media AS m
WHERE v.facturacion > m.media_tiendas
ORDER BY v.tienda_id;`) }
      ],
      pistas: [
        "Primer paso `ventas_tienda`: `SUM(total)` por `tienda_id` con `WHERE fecha >= '2026-01-01' AND fecha < '2027-01-01'` (o `mes LIKE '2026-%'`). Segundo paso `media`: `AVG(facturacion)` de `ventas_tienda`. Al final, `CROSS JOIN` y `WHERE`, como en el ejemplo de los meses.",
        "WITH ventas_tienda AS (SELECT tienda_id, SUM(total) AS facturacion FROM pedidos WHERE fecha >= '2026-01-01' AND fecha < '2027-01-01' GROUP BY tienda_id), media AS (SELECT AVG(facturacion) AS media_tiendas FROM ventas_tienda) SELECT v.tienda_id, v.facturacion FROM ventas_tienda AS v CROSS JOIN media AS m WHERE v.facturacion > m.media_tiendas ORDER BY v.tienda_id;"
      ],
      solucion: `WITH ventas_tienda AS (
  SELECT tienda_id, SUM(total) AS facturacion
  FROM pedidos
  WHERE fecha >= '2026-01-01' AND fecha < '2027-01-01'
  GROUP BY tienda_id
),
media AS (
  SELECT AVG(facturacion) AS media_tiendas
  FROM ventas_tienda
)
SELECT v.tienda_id, v.facturacion
FROM ventas_tienda AS v
CROSS JOIN media AS m
WHERE v.facturacion > m.media_tiendas
ORDER BY v.tienda_id;`
    }
  ]
});
