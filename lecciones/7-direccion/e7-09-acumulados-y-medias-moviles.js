CURSO.registrar({
  id: "e7-09",
  titulo: "Acumulados y medias móviles",
  xp: 45,
  objetivo: "Sabrás calcular totales acumulados con SUM() OVER (ORDER BY …), definir el marco de la ventana con ROWS BETWEEN para hacer medias móviles, acumular por grupos con PARTITION BY y distinguir ROWS de RANGE.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "¿Cuánto llevamos? ¿Hacia dónde vamos?",
      texto: "Dos preguntas que me hacen en cada consejo:\n1. **¿Cuánto llevamos facturado en el año?** No el mes suelto: la suma hasta la fecha.\n2. **¿La tendencia es buena?** Un mes flojo o uno con una campaña despistan. Quiero una línea suave que muestre hacia dónde vamos de verdad, sin los picos."
    },
    {
      tipo: "explicacion",
      titulo: "El acumulado: SUM con ORDER BY",
      texto: "`SUM(facturacion) OVER ()` pondría el total del año en cada fila. Si añades un orden, `SUM(facturacion) OVER (ORDER BY mes)`, cada fila suma **desde la primera hasta ella misma**: el **acumulado** (lo que en las empresas llaman «year to date» cuando empieza en enero).\nEl último mes del acumulado es el total del periodo.",
      ejemplo: `WITH ventas AS (
  SELECT mes, SUM(total) AS facturacion
  FROM pedidos
  WHERE mes >= '2026-01'
  GROUP BY mes
)
SELECT mes, facturacion,
  SUM(facturacion) OVER (ORDER BY mes) AS acumulado
FROM ventas
ORDER BY mes;`
    },
    {
      tipo: "ejercicio",
      enunciado: "Los **pedidos** de cada mes de 2026 y cuántos llevamos en el año: columnas `mes`, `pedidos` (cuántos ese mes) y `acumulado` (suma de `pedidos` hasta ese mes), ordenadas por `mes`.",
      solucion: `WITH ventas AS (
  SELECT mes, COUNT(*) AS pedidos
  FROM pedidos
  WHERE mes >= '2026-01'
  GROUP BY mes
)
SELECT mes, pedidos,
  SUM(pedidos) OVER (ORDER BY mes) AS acumulado
FROM ventas
ORDER BY mes;`,
      pistas: [
        "Igual que el ejemplo, pero en la CTE cuenta con `COUNT(*) AS pedidos`, y fuera suma `pedidos` con `OVER (ORDER BY mes)`.",
        "WITH ventas AS (SELECT mes, COUNT(*) AS pedidos FROM pedidos WHERE mes >= '2026-01' GROUP BY mes) SELECT mes, pedidos, SUM(pedidos) OVER (ORDER BY mes) AS acumulado FROM ventas ORDER BY mes;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "El marco: ROWS BETWEEN",
      texto: "Cada ventana con orden tiene un **marco**: qué filas entran en la cuenta de cada fila. Puedes decirlo tú:\n`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` = las dos filas anteriores y la actual.\nCon `AVG` y ese marco tienes una **media móvil de 3 meses**: cada mes se promedia con los dos anteriores. Los picos se reparten y la línea se suaviza. Mira el gráfico: arriba la facturación real, abajo la media móvil.",
      ejemplo: `WITH ventas AS (
  SELECT mes, SUM(total) AS facturacion
  FROM pedidos
  WHERE mes >= '2025-01'
  GROUP BY mes
)
SELECT mes, facturacion,
  ROUND(AVG(facturacion) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS media_3m
FROM ventas
ORDER BY mes;`,
      grafico: true,
      consejo: "Antes de presentar una media móvil, di **de cuántos meses** es. Una de 3 meses reacciona rápido; una de 12 casi no se mueve. Y recuerda que los primeros meses se calculan con menos datos.",
      otrosMotores: "`ROWS BETWEEN … PRECEDING AND CURRENT ROW` es estándar: igual en SQL Server, MySQL 8+, BigQuery y Oracle. También existe `… AND 1 FOLLOWING` para mirar hacia delante."
    },
    {
      tipo: "prediccion",
      consulta: `WITH ventas AS (
  SELECT mes, SUM(total) AS facturacion
  FROM pedidos
  WHERE mes >= '2025-01'
  GROUP BY mes
)
SELECT mes, facturacion,
  ROUND(AVG(facturacion) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS media_3m
FROM ventas
ORDER BY mes
LIMIT 3;`,
      pregunta: "En la primera fila (2025-01) no hay dos meses anteriores: el `WHERE` los dejó fuera. ¿Qué sale en `media_3m`?",
      opciones: ["NULL: faltan meses para la media", "La misma facturación de enero", "Un tercio de la facturación de enero"],
      correcta: 1,
      explicacion: "El marco coge **las filas que hay**: en enero, solo enero; en febrero, enero y febrero; desde marzo, ya tres meses. Por eso `AVG` de una sola fila es esa fila. No es un error, pero conviene saberlo al leer los primeros puntos de la línea."
    },
    {
      tipo: "explicacion",
      titulo: "Acumulados por grupo",
      texto: "Igual que en los rankings, `PARTITION BY` hace que la cuenta empiece de cero en cada grupo. `SUM(facturacion) OVER (PARTITION BY tienda_id ORDER BY mes)` es el acumulado del año **de cada tienda**: al cambiar de tienda, vuelve a empezar.",
      ejemplo: `WITH ventas AS (
  SELECT tienda_id, mes, SUM(total) AS facturacion
  FROM pedidos
  WHERE mes >= '2026-01'
  GROUP BY tienda_id, mes
)
SELECT tienda_id, mes, facturacion,
  SUM(facturacion) OVER (PARTITION BY tienda_id ORDER BY mes) AS acumulado
FROM ventas
ORDER BY tienda_id, mes;`
    },
    {
      tipo: "quiz",
      pregunta: "Si no pones marco, `SUM(total) OVER (ORDER BY dia)` usa `RANGE`, no `ROWS`. Hay **dos pedidos el mismo día**. ¿Qué acumulado sale en esas dos filas?",
      opciones: [
        "El primero suma solo el suyo y el segundo suma los dos",
        "Los dos muestran el mismo acumulado: el que ya incluye los dos pedidos",
        "Da error: el ORDER BY de una ventana no admite empates"
      ],
      correcta: 1,
      explicacion: "`RANGE` trata como una sola cosa a las filas **empatadas** en el `ORDER BY`: las suma todas a la vez. `ROWS` avanza fila a fila. Con meses distintos (como en los ejemplos) no hay empates y da igual; con fechas repetidas, desempata (`ORDER BY dia, id`) o escribe `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`."
    },
    {
      tipo: "reto",
      de: "ana",
      enunciado: "La tendencia de actividad: **pedidos** por mes de **2025 y 2026** (filtra `mes >= '2025-01'` antes de calcular), con su media móvil de 3 meses. Columnas `mes`, `pedidos` y `media_3m` (media de ese mes y los dos anteriores, redondeada a **1** decimal), ordenadas por `mes`. Como en el ejemplo, los dos primeros meses se promedian con los que haya.",
      inicial: "-- Escribe tu consulta aquí\n",
      grafico: true,
      comprobaciones: [
        { texto: "Tiene las columnas mes, pedidos y media_3m", prueba: (r) => PRUEBA.columnas(r, ["mes", "pedidos", "media_3m"]) },
        { texto: "Salen los 21 meses, de 2025-01 a 2026-09", prueba: (r) => (r?.filas?.length ?? 0) === 21 && String(PRUEBA.valor(r, 0, "mes")).startsWith("2025-01") },
        { texto: "Cada mes con su media móvil de 3 meses, en orden", prueba: (r, db) => PRUEBA.igualA(r, db, `WITH ventas AS (
  SELECT mes, COUNT(*) AS pedidos
  FROM pedidos
  WHERE mes >= '2025-01'
  GROUP BY mes
)
SELECT mes, pedidos,
  ROUND(AVG(pedidos) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS media_3m
FROM ventas
ORDER BY mes;`) }
      ],
      pistas: [
        "Una CTE que cuente los pedidos por `mes` desde `'2025-01'`. Fuera, `AVG(pedidos) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` dentro de `ROUND(…, 1)`.",
        "WITH ventas AS (SELECT mes, COUNT(*) AS pedidos FROM pedidos WHERE mes >= '2025-01' GROUP BY mes) SELECT mes, pedidos, ROUND(AVG(pedidos) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS media_3m FROM ventas ORDER BY mes;"
      ],
      solucion: `WITH ventas AS (
  SELECT mes, COUNT(*) AS pedidos
  FROM pedidos
  WHERE mes >= '2025-01'
  GROUP BY mes
)
SELECT mes, pedidos,
  ROUND(AVG(pedidos) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS media_3m
FROM ventas
ORDER BY mes;`
    }
  ]
});
