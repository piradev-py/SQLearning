CURSO.registrar({
  id: "e7-06",
  titulo: "Contar con condiciones y rellenar huecos: FILTER y generate_series",
  xp: 40,
  objetivo: "Sabrás hacer varias cuentas con condiciones distintas en una sola fila con FILTER, fabricar un calendario con generate_series y unirlo con tus datos para que los meses sin actividad salgan con 0.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "Para el consejo: nada de huecos",
      texto: "Soy Ana Beltrán. El consejo quiere ver, **en una sola línea por tienda**, cuántos pedidos hubo, cuántos se reembolsaron y cuántos se cancelaron.\nY otra cosa: en el gráfico de reembolsos online que me pasasteis, los meses sin reembolsos **no aparecen**. La línea salta de un mes a otro como si no hubiera pasado nada. Un consejero me lo señaló. Que no vuelva a pasar."
    },
    {
      tipo: "explicacion",
      titulo: "FILTER: cada cuenta con su condición",
      texto: "Con `WHERE` filtras **todas** las cuentas a la vez. Pero Ana quiere tres cuentas distintas en la misma fila.\n`COUNT(*) FILTER (WHERE condición)` cuenta solo las filas que cumplen esa condición, sin tocar las demás columnas. Funciona con cualquier agregado: `SUM(total) FILTER (WHERE …)`, `AVG(…) FILTER (WHERE …)`.\nEs lo mismo que hacías con `SUM(CASE WHEN … THEN 1 ELSE 0 END)`, pero se lee mucho mejor.",
      ejemplo: `SELECT tienda_id,
  COUNT(*) AS pedidos,
  COUNT(*) FILTER (WHERE metodo_pago = 'tarjeta') AS con_tarjeta,
  SUM(total) FILTER (WHERE fecha >= '2026-01-01') AS facturado_2026
FROM pedidos
GROUP BY tienda_id
ORDER BY tienda_id;`,
      consejo: "Cuando un informe tiene columnas como «total», «de ellos, X» y «de ellos, Y», piensa en `FILTER`: una sola pasada por la tabla y todas las cuentas alineadas por fila.",
      otrosMotores: "`FILTER` es estándar, pero solo lo tienen PostgreSQL y SQLite. En MySQL, SQL Server o BigQuery se escribe con `CASE`, como en la limpieza: `COUNT(CASE WHEN condición THEN 1 END)` o `COUNTIF(condición)` (BigQuery)."
    },
    {
      tipo: "ejercicio",
      enunciado: "El informe de Ana: por tienda, `tienda_id`, `pedidos` (todos), `reembolsados` (estado `'reembolsado'`) y `cancelados` (estado `'cancelado'`), ordenado por `tienda_id`.",
      solucion: `SELECT tienda_id,
  COUNT(*) AS pedidos,
  COUNT(*) FILTER (WHERE estado = 'reembolsado') AS reembolsados,
  COUNT(*) FILTER (WHERE estado = 'cancelado') AS cancelados
FROM pedidos
GROUP BY tienda_id
ORDER BY tienda_id;`,
      pistas: [
        "Agrupa por `tienda_id`. La primera cuenta es `COUNT(*)`; las otras dos llevan detrás `FILTER (WHERE estado = '…')`.",
        "SELECT tienda_id, COUNT(*) AS pedidos, COUNT(*) FILTER (WHERE estado = 'reembolsado') AS reembolsados, COUNT(*) FILTER (WHERE estado = 'cancelado') AS cancelados FROM pedidos GROUP BY tienda_id ORDER BY tienda_id;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "generate_series: fabricar filas",
      texto: "Para que un mes sin datos salga en el informe, necesitas una fila para ese mes… y en `pedidos` no la hay. Hay que **fabricarla**.\n`generate_series(inicio, fin, paso)` devuelve una fila por cada valor entre `inicio` y `fin`: con números (`generate_series(1, 5)`) o con fechas, dando el paso como intervalo (`INTERVAL '1 month'`).\nCon fechas devuelve `timestamp`; el `::date` final lo deja en fecha. El ejemplo fabrica un **calendario**: el primer día de cada mes de 2026 hasta septiembre.",
      ejemplo: `SELECT generate_series(TIMESTAMP '2026-01-01', TIMESTAMP '2026-09-01', INTERVAL '1 month')::date AS mes;`,
      otrosMotores: "`generate_series` es de PostgreSQL. SQL Server 2022 tiene `GENERATE_SERIES` (solo números), BigQuery `GENERATE_DATE_ARRAY` y en MySQL se fabrica con una CTE recursiva."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT generate_series(TIMESTAMP '2024-01-01', TIMESTAMP '2026-09-01', INTERVAL '1 month')::date AS mes;`,
      pregunta: "Un calendario mensual desde enero de 2024 hasta septiembre de 2026 (ambos incluidos). ¿Cuántas filas devuelve?",
      opciones: ["32", "33", "36"],
      correcta: 1,
      explicacion: "**33**: 12 meses de 2024, 12 de 2025 y 9 de 2026. `generate_series` incluye el inicio **y** el fin. Es exactamente el periodo que cubren los pedidos de Faro."
    },
    {
      tipo: "explicacion",
      titulo: "Calendario + LEFT JOIN + COALESCE",
      texto: "La receta para no perder meses, en tres pasos con nombre:\n1. `calendario`: todos los meses, con `generate_series`.\n2. `reembolsos`: los datos agrupados por mes (`date_trunc('month', fecha)::date`, para que casen con el calendario).\n3. El calendario **a la izquierda** con `LEFT JOIN`: todos sus meses se quedan. Donde no hay datos, la cuenta llega como `NULL`, y `COALESCE(…, 0)` la convierte en 0.\nEl ejemplo lo hace con los reembolsos de **Bilbao** en 2026: casi todos los meses salen con 0, pero salen.",
      ejemplo: `WITH calendario AS (
  SELECT generate_series(TIMESTAMP '2026-01-01', TIMESTAMP '2026-09-01', INTERVAL '1 month')::date AS mes
),
reembolsos AS (
  SELECT date_trunc('month', fecha)::date AS mes, COUNT(*) AS reembolsos
  FROM pedidos
  WHERE tienda_id = 4
    AND estado = 'reembolsado'
  GROUP BY date_trunc('month', fecha)::date
)
SELECT c.mes, COALESCE(r.reembolsos, 0) AS reembolsos
FROM calendario AS c
LEFT JOIN reembolsos AS r ON r.mes = c.mes
ORDER BY c.mes;`,
      consejo: "En un gráfico de evolución, un mes que falta **miente**: la línea une el mes anterior con el siguiente y el 0 desaparece. Antes de dibujar una serie temporal, pregúntate siempre: ¿están todos los meses?",
      grafico: true
    },
    {
      tipo: "quiz",
      pregunta: "En el ejemplo de Bilbao, quitas el `COALESCE` y dejas solo `r.reembolsos`. ¿Qué sale en los meses sin reembolsos?",
      opciones: [
        "Esos meses desaparecen del resultado",
        "Salen, pero con `NULL` en reembolsos",
        "Salen con 0: el LEFT JOIN ya pone ceros"
      ],
      correcta: 1,
      explicacion: "El `LEFT JOIN` conserva los meses del calendario, pero no se inventa valores: donde no hay pareja, pone `NULL`. El 0 lo pones tú con `COALESCE`. Un `NULL` en un informe se lee como «no lo sé», y un 0 como «no hubo»: aquí la verdad es 0."
    },
    {
      tipo: "reto",
      de: "ana",
      enunciado: "Ahora el gráfico bueno: reembolsos de la tienda **online** (`tienda_id = 5`, estado `'reembolsado'`) por mes, con **todos** los meses de enero de 2024 a septiembre de 2026. Columnas `mes` (fecha del primer día del mes) y `reembolsos` (0 si no hubo), ordenado por `mes`.",
      inicial: "-- Escribe tu consulta aquí\n",
      grafico: true,
      comprobaciones: [
        { texto: "Tiene las columnas mes y reembolsos", prueba: (r) => PRUEBA.columnas(r, ["mes", "reembolsos"]) },
        { texto: "Salen los 33 meses, también los vacíos", prueba: (r) => (r?.filas?.length ?? 0) === 33 },
        { texto: "Los meses sin reembolsos salen con 0 (no con NULL)", prueba: (r) => {
          const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "reembolsos");
          return i >= 0 && (r?.filas || []).filter(f => f?.[i] !== null && Number(f?.[i]) === 0).length === 13;
        } },
        { texto: "Cada mes con sus reembolsos, en orden de mes", prueba: (r, db) => PRUEBA.igualA(r, db, `WITH calendario AS (
  SELECT generate_series(TIMESTAMP '2024-01-01', TIMESTAMP '2026-09-01', INTERVAL '1 month')::date AS mes
),
reembolsos AS (
  SELECT date_trunc('month', fecha)::date AS mes, COUNT(*) AS reembolsos
  FROM pedidos
  WHERE tienda_id = 5
    AND estado = 'reembolsado'
  GROUP BY date_trunc('month', fecha)::date
)
SELECT c.mes, COALESCE(r.reembolsos, 0) AS reembolsos
FROM calendario AS c
LEFT JOIN reembolsos AS r ON r.mes = c.mes
ORDER BY c.mes;`) }
      ],
      pistas: [
        "Copia la receta del ejemplo de Bilbao y cambia dos cosas: el calendario empieza en `TIMESTAMP '2024-01-01'` y la tienda es la 5.",
        "WITH calendario AS (SELECT generate_series(TIMESTAMP '2024-01-01', TIMESTAMP '2026-09-01', INTERVAL '1 month')::date AS mes), reembolsos AS (SELECT date_trunc('month', fecha)::date AS mes, COUNT(*) AS reembolsos FROM pedidos WHERE tienda_id = 5 AND estado = 'reembolsado' GROUP BY date_trunc('month', fecha)::date) SELECT c.mes, COALESCE(r.reembolsos, 0) AS reembolsos FROM calendario AS c LEFT JOIN reembolsos AS r ON r.mes = c.mes ORDER BY c.mes;"
      ],
      solucion: `WITH calendario AS (
  SELECT generate_series(TIMESTAMP '2024-01-01', TIMESTAMP '2026-09-01', INTERVAL '1 month')::date AS mes
),
reembolsos AS (
  SELECT date_trunc('month', fecha)::date AS mes, COUNT(*) AS reembolsos
  FROM pedidos
  WHERE tienda_id = 5
    AND estado = 'reembolsado'
  GROUP BY date_trunc('month', fecha)::date
)
SELECT c.mes, COALESCE(r.reembolsos, 0) AS reembolsos
FROM calendario AS c
LEFT JOIN reembolsos AS r ON r.mes = c.mes
ORDER BY c.mes;`
    }
  ]
});
