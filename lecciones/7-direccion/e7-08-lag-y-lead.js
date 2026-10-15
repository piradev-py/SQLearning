CURSO.registrar({
  id: "e7-08",
  titulo: "Antes y después: LAG y LEAD",
  xp: 45,
  objetivo: "Sabrás traer a cada fila el valor de la fila anterior (LAG) o de la siguiente (LEAD), calcular la variación frente al mes pasado y medir el tiempo que pasa entre dos sucesos.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "¿Y frente al mes pasado?",
      texto: "Un número solo no dice nada. «Septiembre: 89 000 €.» ¿Es bueno? ¿Es malo?\nLo que el consejo pregunta siempre es **cómo vamos frente al mes pasado**: cuánto hemos subido o bajado, en euros y en porcentaje. Quiero esa columna al lado de cada mes, sin que nadie tenga que restar a mano."
    },
    {
      tipo: "explicacion",
      titulo: "LAG: el valor de la fila anterior",
      texto: "`LAG(columna) OVER (ORDER BY …)` trae a cada fila el valor que tenía esa columna en la **fila anterior**, según el orden que le des. `LEAD` hace lo contrario: trae el de la **siguiente**.\nEl ejemplo primero calcula la facturación de cada mes de 2026 en una CTE y después, al lado de cada mes, pone la del mes anterior y la del siguiente.",
      ejemplo: `WITH ventas AS (
  SELECT mes, SUM(total) AS facturacion
  FROM pedidos
  WHERE mes >= '2026-01'
  GROUP BY mes
)
SELECT mes, facturacion,
  LAG(facturacion) OVER (ORDER BY mes) AS anterior,
  LEAD(facturacion) OVER (ORDER BY mes) AS siguiente
FROM ventas
ORDER BY mes;`,
      otrosMotores: "`LAG` y `LEAD` son estándar (MySQL 8+, SQL Server, BigQuery, Oracle). Admiten dos argumentos más: `LAG(col, 2)` mira dos filas atrás y `LAG(col, 1, 0)` pone 0 en vez de `NULL` cuando no hay fila anterior."
    },
    {
      tipo: "prediccion",
      consulta: `WITH ventas AS (
  SELECT mes, SUM(total) AS facturacion
  FROM pedidos
  WHERE mes >= '2026-01'
  GROUP BY mes
)
SELECT mes, facturacion,
  LAG(facturacion) OVER (ORDER BY mes) AS anterior
FROM ventas
ORDER BY mes
LIMIT 2;`,
      pregunta: "Hay pedidos desde 2024. En esta consulta, ¿qué sale en `anterior` para el mes **2026-01**?",
      opciones: ["La facturación de 2025-12", "NULL", "0"],
      correcta: 1,
      explicacion: "**NULL**. La ventana solo ve las filas que han pasado el filtro: diciembre de 2025 se quedó fuera en el `WHERE`, así que enero no tiene fila anterior. Si necesitaras el dato de diciembre, tendrías que filtrar **después** de calcular el `LAG` (otra CTE por fuera)."
    },
    {
      tipo: "explicacion",
      titulo: "Variación y porcentaje",
      texto: "Con el valor anterior al lado, la variación es una resta: `facturacion - LAG(facturacion) OVER (ORDER BY mes)`. El porcentaje, esa resta dividida entre el anterior, por 100.\nEn la primera fila todo sale `NULL`: no hay con qué comparar, y eso es correcto (no es un 0 %).",
      ejemplo: `WITH ventas AS (
  SELECT mes, SUM(total) AS facturacion
  FROM pedidos
  WHERE mes >= '2026-01'
  GROUP BY mes
)
SELECT mes, facturacion,
  facturacion - LAG(facturacion) OVER (ORDER BY mes) AS diferencia,
  ROUND(100 * (facturacion - LAG(facturacion) OVER (ORDER BY mes))
    / LAG(facturacion) OVER (ORDER BY mes), 1) AS variacion_pct
FROM ventas
ORDER BY mes;`,
      consejo: "Un +50 % sobre un mes flojo impresiona más de lo que vale. En los informes pon **siempre** la cifra en euros al lado del porcentaje: el consejo debe ver las dos."
    },
    {
      tipo: "explicacion",
      titulo: "El tiempo entre dos sucesos",
      texto: "`LAG` también sirve con fechas: `fecha - LAG(fecha) OVER (ORDER BY fecha)` es el **intervalo** desde el suceso anterior (como en la etapa de migración, restar dos `timestamp` da un `interval`).\nLucía lo usa con los fichajes: entre la `salida` de un día y la `entrada` del siguiente está el descanso de cada persona. El ejemplo lo calcula con sus propios fichajes.",
      ejemplo: `SELECT entrada, salida,
  entrada - LAG(salida) OVER (ORDER BY entrada) AS descanso
FROM fichajes
WHERE empleado_id = 2
ORDER BY entrada
LIMIT 5;`
    },
    {
      tipo: "ejercicio",
      enunciado: "Los pedidos del **cliente 1**, cada uno con la fecha de su **siguiente** pedido: columnas `id`, `fecha` y `siguiente` (`LEAD` de `fecha`, ordenando por `fecha`), ordenados por `fecha`.",
      solucion: `SELECT id, fecha,
  LEAD(fecha) OVER (ORDER BY fecha) AS siguiente
FROM pedidos
WHERE cliente_id = 1
ORDER BY fecha;`,
      pistas: [
        "Filtra `WHERE cliente_id = 1` y usa `LEAD(fecha) OVER (ORDER BY fecha) AS siguiente`.",
        "SELECT id, fecha, LEAD(fecha) OVER (ORDER BY fecha) AS siguiente FROM pedidos WHERE cliente_id = 1 ORDER BY fecha;"
      ]
    },
    {
      tipo: "arreglar",
      enunciado: "Para Madrid (`tienda_id = 1`) y Valencia (`tienda_id = 2`) en 2026: `tienda_id`, `mes`, `pedidos` (cuántos) y `anterior` (los pedidos del mes anterior **de la misma tienda**), ordenado por `tienda_id` y `mes`. La consulta no da error, pero el enero de Valencia sale comparado con el septiembre de Madrid. Arréglala.",
      inicial: `WITH ventas AS (
  SELECT tienda_id, mes, COUNT(*) AS pedidos
  FROM pedidos
  WHERE tienda_id IN (1, 2)
    AND mes >= '2026-01'
  GROUP BY tienda_id, mes
)
SELECT tienda_id, mes, pedidos,
  LAG(pedidos) OVER (ORDER BY tienda_id, mes) AS anterior
FROM ventas
ORDER BY tienda_id, mes;`,
      solucion: `WITH ventas AS (
  SELECT tienda_id, mes, COUNT(*) AS pedidos
  FROM pedidos
  WHERE tienda_id IN (1, 2)
    AND mes >= '2026-01'
  GROUP BY tienda_id, mes
)
SELECT tienda_id, mes, pedidos,
  LAG(pedidos) OVER (PARTITION BY tienda_id ORDER BY mes) AS anterior
FROM ventas
ORDER BY tienda_id, mes;`,
      pistas: [
        "Sin partición, `LAG` recorre todas las filas seguidas y salta de una tienda a la otra. Cada tienda debe ser su propio grupo.",
        "Cambia el OVER por: LAG(pedidos) OVER (PARTITION BY tienda_id ORDER BY mes) AS anterior"
      ]
    },
    {
      tipo: "reto",
      de: "ana",
      enunciado: "La tabla para el consejo: la facturación de cada mes de **2026** (suma de `total` de todos los pedidos), con la del mes anterior y la diferencia. Columnas `mes` (la columna de texto `'YYYY-MM'` de `pedidos`), `facturacion`, `anterior` y `diferencia` (`facturacion - anterior`), ordenadas por `mes`. Enero tendrá `anterior` y `diferencia` vacíos (`NULL`).",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas mes, facturacion, anterior y diferencia", prueba: (r) => PRUEBA.columnas(r, ["mes", "facturacion", "anterior", "diferencia"]) },
        { texto: "Salen los 9 meses de 2026, y enero sin mes anterior", prueba: (r) => (r?.filas?.length ?? 0) === 9 && String(PRUEBA.valor(r, 0, "mes")).startsWith("2026-01") && PRUEBA.valor(r, 0, "anterior") === null },
        { texto: "Cada mes con su facturación, la del mes anterior y la diferencia", prueba: (r, db) => PRUEBA.igualA(r, db, `WITH ventas AS (
  SELECT mes, SUM(total) AS facturacion
  FROM pedidos
  WHERE mes >= '2026-01'
  GROUP BY mes
)
SELECT mes, facturacion,
  LAG(facturacion) OVER (ORDER BY mes) AS anterior,
  facturacion - LAG(facturacion) OVER (ORDER BY mes) AS diferencia
FROM ventas
ORDER BY mes;`) }
      ],
      pistas: [
        "Una CTE con la facturación por `mes` de 2026 (`WHERE mes >= '2026-01'`). Fuera, `LAG(facturacion) OVER (ORDER BY mes)` para `anterior`, y la misma expresión restada de `facturacion` para `diferencia`.",
        "WITH ventas AS (SELECT mes, SUM(total) AS facturacion FROM pedidos WHERE mes >= '2026-01' GROUP BY mes) SELECT mes, facturacion, LAG(facturacion) OVER (ORDER BY mes) AS anterior, facturacion - LAG(facturacion) OVER (ORDER BY mes) AS diferencia FROM ventas ORDER BY mes;"
      ],
      solucion: `WITH ventas AS (
  SELECT mes, SUM(total) AS facturacion
  FROM pedidos
  WHERE mes >= '2026-01'
  GROUP BY mes
)
SELECT mes, facturacion,
  LAG(facturacion) OVER (ORDER BY mes) AS anterior,
  facturacion - LAG(facturacion) OVER (ORDER BY mes) AS diferencia
FROM ventas
ORDER BY mes;`
    }
  ]
});
