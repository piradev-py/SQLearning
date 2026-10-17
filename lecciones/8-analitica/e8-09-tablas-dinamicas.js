CURSO.registrar({
  id: "e8-09",
  titulo: "Tablas dinámicas: pivotar y subtotales",
  xp: 45,
  objetivo: "Sabrás pasar un resultado de formato largo a ancho (una columna por tienda) con FILTER, volver al largo con UNION ALL y añadir subtotales y un total general con GROUP BY ROLLUP y GROUPING().",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "Como la tabla dinámica de siempre",
      texto: "El consejo lee las ventas como en la hoja de cálculo de toda la vida: **una fila por trimestre, una columna por tienda** y el total a la derecha. Y debajo, una fila de **Total**.\nTus consultas me dan una fila por trimestre y tienda, todo en vertical. Los números están bien, pero así nadie los compara de un vistazo. ¿Me lo pones en horizontal sin copiar y pegar?"
    },
    {
      tipo: "explicacion",
      titulo: "Largo y ancho",
      texto: "El mismo dato se puede dar de dos formas:\n- **Largo**: una fila por cada combinación (mes y tienda). Es lo que sale de un `GROUP BY` y lo que prefieren el gráfico (una serie por tienda) y las herramientas de BI.\n- **Ancho**: una fila por mes y **una columna por tienda**, como la tabla dinámica de la hoja de cálculo. Es lo que mejor lee una persona.\nEl ejemplo es el formato largo: pedidos del tercer trimestre de 2026 por mes y tienda.",
      ejemplo: `SELECT mes, tienda_id, COUNT(*) AS pedidos
FROM pedidos
WHERE fecha >= '2026-07-01' AND fecha < '2026-10-01'
GROUP BY mes, tienda_id
ORDER BY mes, tienda_id;`
    },
    {
      tipo: "explicacion",
      titulo: "Pivotar con FILTER",
      texto: "Para pasar a **ancho** (pivotar), agrupas solo por mes y creas una columna por tienda con un agregado filtrado (e7): `COUNT(*) FILTER (WHERE tienda_id = 1) AS madrid`. Cada columna mira solo las filas de su tienda.\nEl camino de vuelta (**despivotar**) es un `UNION ALL` (e4): un `SELECT` por columna, cada uno con el nombre de la tienda como texto.\nCon el gráfico verás la diferencia: en ancho, un panel por columna.",
      ejemplo: `SELECT mes,
  COUNT(*) FILTER (WHERE tienda_id = 1) AS madrid,
  COUNT(*) FILTER (WHERE tienda_id = 2) AS valencia,
  COUNT(*) FILTER (WHERE tienda_id = 3) AS sevilla,
  COUNT(*) FILTER (WHERE tienda_id = 4) AS bilbao,
  COUNT(*) FILTER (WHERE tienda_id = 5) AS online,
  COUNT(*) AS total
FROM pedidos
WHERE fecha >= '2026-07-01' AND fecha < '2026-10-01'
GROUP BY mes
ORDER BY mes;`,
      grafico: true,
      otrosMotores: "PostgreSQL tiene `crosstab` en la extensión `tablefunc` (aquí no está instalada). SQL Server, BigQuery y Snowflake traen `PIVOT` y `UNPIVOT`. El truco del `FILTER` (o `SUM(CASE WHEN … END)`) funciona en todos."
    },
    {
      tipo: "explicacion",
      titulo: "Subtotales: ROLLUP y GROUPING()",
      texto: "`GROUP BY ROLLUP (mes, tienda_id)` hace el `GROUP BY` normal y **además** añade filas de subtotal: una por mes (con `tienda_id` vacío) y una del total general (las dos vacías).\nEsos huecos son `NULL`. Para escribir «Total» no uses `COALESCE`: si una columna tuviera `NULL` de verdad, lo confundirías con un subtotal. `GROUPING(columna)` vale **1** en las filas de subtotal de esa columna y **0** en las normales.\nY ordena tú: `ORDER BY GROUPING(…)` deja los totales al final.",
      ejemplo: `SELECT mes,
  CASE WHEN GROUPING(tienda_id) = 1 THEN 'Total' ELSE tienda_id::text END AS tienda,
  COUNT(*) AS pedidos
FROM pedidos
WHERE fecha >= '2026-07-01' AND fecha < '2026-10-01'
GROUP BY ROLLUP (mes, tienda_id)
ORDER BY GROUPING(mes), mes, GROUPING(tienda_id), tienda_id;`,
      consejo: "El orden de las columnas del `ROLLUP` importa: `ROLLUP (mes, tienda_id)` da subtotales por mes; `ROLLUP (tienda_id, mes)`, por tienda. Piensa qué subtotal quiere ver quien lee la tabla."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT tienda_id, COUNT(*) AS pedidos
FROM pedidos
WHERE fecha >= '2026-07-01' AND fecha < '2026-10-01'
GROUP BY ROLLUP (tienda_id)
ORDER BY tienda_id;`,
      pregunta: "En el tercer trimestre de 2026 venden 5 tiendas (Barcelona abrió en octubre). ¿Cuántas filas devuelve este `ROLLUP`?",
      opciones: ["5", "6", "10"],
      correcta: 1,
      explicacion: "**6**: una por cada tienda con pedidos y una más con el total general (`tienda_id` vacío, que `ORDER BY` deja al final porque `NULL` va detrás en orden ascendente)."
    },
    {
      tipo: "ejercicio",
      enunciado: "Pedidos (todos) del tercer trimestre de 2026 (`fecha` desde el 2026-07-01 y antes del 2026-10-01) por tienda, con el nombre de la ciudad y una fila final de total: `tienda` (la `ciudad` de `tiendas`, o `'Total'` en la fila del `ROLLUP`, con `GROUPING`) y `pedidos`, ordenado con `ORDER BY GROUPING(t.ciudad), t.ciudad` (las ciudades en orden alfabético y el total al final).",
      solucion: `SELECT CASE WHEN GROUPING(t.ciudad) = 1 THEN 'Total' ELSE t.ciudad END AS tienda,
  COUNT(*) AS pedidos
FROM pedidos AS p
JOIN tiendas AS t ON t.id = p.tienda_id
WHERE p.fecha >= '2026-07-01' AND p.fecha < '2026-10-01'
GROUP BY ROLLUP (t.ciudad)
ORDER BY GROUPING(t.ciudad), t.ciudad;`,
      pistas: [
        "Une `pedidos AS p` con `tiendas AS t`, filtra las fechas y agrupa con `GROUP BY ROLLUP (t.ciudad)`. La etiqueta: `CASE WHEN GROUPING(t.ciudad) = 1 THEN 'Total' ELSE t.ciudad END`.",
        "SELECT CASE WHEN GROUPING(t.ciudad) = 1 THEN 'Total' ELSE t.ciudad END AS tienda, COUNT(*) AS pedidos FROM pedidos AS p JOIN tiendas AS t ON t.id = p.tienda_id WHERE p.fecha >= '2026-07-01' AND p.fecha < '2026-10-01' GROUP BY ROLLUP (t.ciudad) ORDER BY GROUPING(t.ciudad), t.ciudad;"
      ]
    },
    {
      tipo: "quiz",
      pregunta: "Cambias `GROUP BY ROLLUP (mes, tienda_id)` por `GROUP BY CUBE (mes, tienda_id)`. ¿Qué filas **nuevas** aparecen?",
      opciones: [
        "El total de cada tienda sumando todos los meses",
        "Nada: CUBE y ROLLUP son lo mismo",
        "Una fila por cada pedido"
      ],
      correcta: 0,
      explicacion: "`CUBE` saca los subtotales de **todas** las combinaciones: por mes, por tienda y el total. `ROLLUP` solo baja por la jerarquía (mes → total). Si quieres elegir exactamente cuáles, `GROUPING SETS ((mes), (tienda_id), ())`."
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "La tabla para el consejo: facturación **neta** (suma de `total` de los pedidos que no están `cancelado` ni `reembolsado`) por trimestre de **2026**, de enero a septiembre (`fecha` desde el 2026-01-01 y antes del 2026-10-01), con una columna por tienda: `trimestre` (`date_trunc('quarter', fecha)::date`), `madrid` (tienda 1), `valencia` (2), `sevilla` (3), `bilbao` (4), `online` (5) y `total` (todas), ordenado por `trimestre`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas trimestre, madrid, valencia, sevilla, bilbao, online y total", prueba: (r) => PRUEBA.columnas(r, ["trimestre", "madrid", "valencia", "sevilla", "bilbao", "online", "total"]) },
        { texto: "Está ordenado por trimestre", prueba: (r) => (r?.filas?.length ?? 0) > 0 && PRUEBA.ordenado(r, "trimestre", "asc") },
        { texto: "Cada trimestre con la facturación neta de cada tienda y el total", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT date_trunc('quarter', fecha)::date AS trimestre,
  SUM(total) FILTER (WHERE tienda_id = 1) AS madrid,
  SUM(total) FILTER (WHERE tienda_id = 2) AS valencia,
  SUM(total) FILTER (WHERE tienda_id = 3) AS sevilla,
  SUM(total) FILTER (WHERE tienda_id = 4) AS bilbao,
  SUM(total) FILTER (WHERE tienda_id = 5) AS online,
  SUM(total) AS total
FROM pedidos
WHERE fecha >= '2026-01-01' AND fecha < '2026-10-01'
  AND estado NOT IN ('cancelado', 'reembolsado')
GROUP BY date_trunc('quarter', fecha)::date
ORDER BY trimestre;`) }
      ],
      pistas: [
        "Filtra fechas y estados en el `WHERE`, agrupa por `date_trunc('quarter', fecha)::date` y crea cada columna con `SUM(total) FILTER (WHERE tienda_id = …)`.",
        "SELECT date_trunc('quarter', fecha)::date AS trimestre, SUM(total) FILTER (WHERE tienda_id = 1) AS madrid, SUM(total) FILTER (WHERE tienda_id = 2) AS valencia, SUM(total) FILTER (WHERE tienda_id = 3) AS sevilla, SUM(total) FILTER (WHERE tienda_id = 4) AS bilbao, SUM(total) FILTER (WHERE tienda_id = 5) AS online, SUM(total) AS total FROM pedidos WHERE fecha >= '2026-01-01' AND fecha < '2026-10-01' AND estado NOT IN ('cancelado', 'reembolsado') GROUP BY date_trunc('quarter', fecha)::date ORDER BY trimestre;"
      ],
      solucion: `SELECT date_trunc('quarter', fecha)::date AS trimestre,
  SUM(total) FILTER (WHERE tienda_id = 1) AS madrid,
  SUM(total) FILTER (WHERE tienda_id = 2) AS valencia,
  SUM(total) FILTER (WHERE tienda_id = 3) AS sevilla,
  SUM(total) FILTER (WHERE tienda_id = 4) AS bilbao,
  SUM(total) FILTER (WHERE tienda_id = 5) AS online,
  SUM(total) AS total
FROM pedidos
WHERE fecha >= '2026-01-01' AND fecha < '2026-10-01'
  AND estado NOT IN ('cancelado', 'reembolsado')
GROUP BY date_trunc('quarter', fecha)::date
ORDER BY trimestre;`
    }
  ]
});
