CURSO.registrar({
  id: "e8-02",
  titulo: "¿Vamos mejor o peor?: MoM, YoY y meses a medias",
  xp: 45,
  objetivo: "Sabrás comparar periodos como lo hace un Data Analyst: frente al mes anterior (MoM), frente al mismo mes del año pasado (YoY), el acumulado del año (YTD) y el mes en curso comparado tramo a tramo (MTD), siempre con el porcentaje sobre el valor anterior.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "¿Crecemos o no?",
      texto: "Ana me ha pedido una respuesta de una palabra para el consejo: **¿crecemos?**\nAlguien de mi equipo ya me ha pasado una cuenta: «octubre va fatal, facturamos muchísimo menos que en septiembre». Hoy es **15 de octubre**. Algo me dice que esa comparación tiene trampa. Necesito números que aguanten una pregunta del consejo."
    },
    {
      tipo: "explicacion",
      titulo: "MoM: frente al mes anterior",
      texto: "La comparación más habitual es **MoM** (*month over month*): cada mes frente al anterior. Ya sabes hacerlo: `LAG(facturacion) OVER (ORDER BY mes)` trae el valor del mes de antes.\nLa variación en %: `(nuevo − anterior) * 100.0 / anterior`. El porcentaje va **siempre sobre el valor anterior**: pasar de 100 a 150 es +50 %; volver de 150 a 100 es −33 %, no −50 %.\nRecuerda la definición de la etapa: **facturación neta** = pedidos que no están `cancelado` ni `reembolsado`. El ejemplo usa los meses completos de 2026 (hasta septiembre).",
      ejemplo: `WITH mensual AS (
  SELECT mes, SUM(total) AS facturacion
  FROM pedidos
  WHERE estado NOT IN ('cancelado', 'reembolsado')
    AND mes BETWEEN '2026-01' AND '2026-09'
  GROUP BY mes
)
SELECT mes, facturacion,
  LAG(facturacion) OVER (ORDER BY mes) AS mes_anterior,
  ROUND((facturacion - LAG(facturacion) OVER (ORDER BY mes)) * 100.0
    / NULLIF(LAG(facturacion) OVER (ORDER BY mes), 0), 1) AS mom_pct
FROM mensual
ORDER BY mes;`,
      consejo: "El MoM se mueve mucho por cosas que no son «ir mejor o peor»: agosto, campañas, festivos. Úsalo para detectar cambios bruscos, no para presumir de crecimiento."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT MIN(fecha) AS primer_pedido, MAX(fecha) AS ultimo_pedido
FROM pedidos
WHERE mes = '2026-10';`,
      pregunta: "Antes de comparar octubre con nada: ¿cuál es el **último día** con pedidos de octubre de 2026?",
      opciones: ["El 31 de octubre", "El 14 de octubre", "El 1 de octubre"],
      correcta: 1,
      explicacion: "Hoy es el **15**: los datos acaban el **14 de octubre**. Octubre lleva medio mes. Si lo comparas con septiembre entero, parece que caemos aunque estemos vendiendo igual o más. Esa es la trampa de la cuenta que le pasaron a Elena."
    },
    {
      tipo: "explicacion",
      titulo: "El mes en curso: MTD contra MTD",
      texto: "Un mes a medias solo se compara con **el mismo tramo** de otro mes: del 1 al 14 contra del 1 al 14. Es lo que se llama **MTD** (*month to date*, «lo que va de mes»).\nY para quitarte de encima agostos y campañas, compáralo con el **mismo mes del año anterior**: es la comparación **YoY** (*year over year*).\nEl ejemplo pone frente a frente la facturación neta del 1 al 14 de octubre de 2026 y la del 1 al 14 de octubre de 2025. Fíjate en el `< DATE '…-10-15'`: incluye todo el día 14.",
      ejemplo: `SELECT
  SUM(total) FILTER (WHERE fecha >= DATE '2026-10-01' AND fecha < DATE '2026-10-15') AS mtd_2026,
  SUM(total) FILTER (WHERE fecha >= DATE '2025-10-01' AND fecha < DATE '2025-10-15') AS mtd_2025
FROM pedidos
WHERE estado NOT IN ('cancelado', 'reembolsado');`,
      consejo: "Cuando presentes un mes en curso, dilo en el título: «Octubre (1–14)». Nadie en un consejo debería tener que adivinar que el mes no ha terminado."
    },
    {
      tipo: "interpretar",
      pregunta: "Ana quiere en la diapositiva la **facturación neta de lo que va de octubre de 2026** (del 1 al 14, sin pedidos `cancelado` ni `reembolsado`). ¿Cuántos euros son? (con los céntimos)",
      respuesta: 49505.85,
      tolerancia: 0.01,
      pistas: [
        "Suma `total` de los pedidos con `fecha >= DATE '2026-10-01' AND fecha < DATE '2026-10-15'` y estado fuera de `('cancelado', 'reembolsado')`.",
        "SELECT SUM(total) FROM pedidos WHERE estado NOT IN ('cancelado', 'reembolsado') AND fecha >= DATE '2026-10-01' AND fecha < DATE '2026-10-15';"
      ],
      solucion: `SELECT SUM(total) AS mtd_2026
FROM pedidos
WHERE estado NOT IN ('cancelado', 'reembolsado')
  AND fecha >= DATE '2026-10-01'
  AND fecha < DATE '2026-10-15';`
    },
    {
      tipo: "explicacion",
      titulo: "YoY mes a mes y el acumulado del año (YTD)",
      texto: "Para tener el YoY de cada mes, une la tabla mensual **consigo misma**: cada mes con el que está un año antes, `b.mes = a.mes - INTERVAL '1 year'`.\nTambién se puede con `LAG(facturacion, 12)`, que mira 12 filas atrás… pero solo si **no falta ningún mes**: con un hueco, «12 filas atrás» ya no es «hace un año». Si usas `LAG`, monta antes un calendario con `generate_series`.\nEl **YTD** (*year to date*) es el acumulado del año: de enero a septiembre de 2026 frente a enero–septiembre de 2025, el mismo tramo.",
      ejemplo: `SELECT
  SUM(total) FILTER (WHERE fecha >= DATE '2026-01-01' AND fecha < DATE '2026-10-01') AS ytd_2026,
  SUM(total) FILTER (WHERE fecha >= DATE '2025-01-01' AND fecha < DATE '2025-10-01') AS ytd_2025
FROM pedidos
WHERE estado NOT IN ('cancelado', 'reembolsado');`,
      otrosMotores: "`date - INTERVAL '1 year'` es de PostgreSQL. En SQL Server se escribe `DATEADD(year, -1, mes)`, en MySQL `mes - INTERVAL 1 YEAR` y en BigQuery `DATE_SUB(mes, INTERVAL 1 YEAR)`."
    },
    {
      tipo: "quiz",
      pregunta: "Un mes facturó 50 000 € y el mismo mes del año anterior 40 000 €. ¿Cuánto es el crecimiento YoY?",
      opciones: ["+20 %", "+25 %", "+10 000 %"],
      correcta: 1,
      explicacion: "(50 000 − 40 000) / **40 000** = 25 %. El porcentaje se calcula sobre el valor **anterior**. Dividir entre el nuevo (50 000) da el 20 %, que es otra cosa: qué parte de hoy es crecimiento."
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "El «¿crecemos?» mes a mes. Facturación neta (pedidos que no están `cancelado` ni `reembolsado`) de cada mes **de enero a septiembre de 2026** junto a la del mismo mes de 2025. Octubre **no** entra: está a medias. Columnas:\n- `mes`: primer día del mes, como fecha (`date_trunc('month', fecha)::date`).\n- `facturacion`: la de ese mes de 2026.\n- `mismo_mes_2025`: la del mismo mes de 2025.\n- `yoy_pct`: crecimiento en % sobre 2025, redondeado a 1.\nOrdenado por `mes`.",
      inicial: "-- Escribe tu consulta aquí\n",
      grafico: true,
      comprobaciones: [
        { texto: "Tiene las columnas mes, facturacion, mismo_mes_2025 y yoy_pct", prueba: (r) => PRUEBA.columnas(r, ["mes", "facturacion", "mismo_mes_2025", "yoy_pct"]) },
        { texto: "Salen 9 meses, de enero a septiembre: octubre no entra (está a medias)", prueba: (r) => (r?.filas?.length ?? 0) === 9 },
        { texto: "Cada mes con su facturación, la de 2025 y el crecimiento sobre 2025, en orden de mes", prueba: (r, db) => PRUEBA.igualA(r, db, `WITH mensual AS (
  SELECT date_trunc('month', fecha)::date AS mes, SUM(total) AS facturacion
  FROM pedidos
  WHERE estado NOT IN ('cancelado', 'reembolsado')
    AND fecha >= DATE '2025-01-01'
    AND fecha < DATE '2026-10-01'
  GROUP BY date_trunc('month', fecha)::date
)
SELECT a.mes, a.facturacion, b.facturacion AS mismo_mes_2025,
  ROUND((a.facturacion - b.facturacion) * 100.0 / NULLIF(b.facturacion, 0), 1) AS yoy_pct
FROM mensual AS a
JOIN mensual AS b ON b.mes = a.mes - INTERVAL '1 year'
WHERE a.mes >= DATE '2026-01-01'
ORDER BY a.mes;`) }
      ],
      pistas: [
        "Una CTE `mensual` con la facturación neta por `date_trunc('month', fecha)::date` desde 2025-01-01 y antes de 2026-10-01. Fuera, únela consigo misma: `FROM mensual AS a JOIN mensual AS b ON b.mes = a.mes - INTERVAL '1 year'` y quédate con `a.mes >= DATE '2026-01-01'`.",
        "WITH mensual AS (SELECT date_trunc('month', fecha)::date AS mes, SUM(total) AS facturacion FROM pedidos WHERE estado NOT IN ('cancelado', 'reembolsado') AND fecha >= DATE '2025-01-01' AND fecha < DATE '2026-10-01' GROUP BY date_trunc('month', fecha)::date) SELECT a.mes, a.facturacion, b.facturacion AS mismo_mes_2025, ROUND((a.facturacion - b.facturacion) * 100.0 / NULLIF(b.facturacion, 0), 1) AS yoy_pct FROM mensual AS a JOIN mensual AS b ON b.mes = a.mes - INTERVAL '1 year' WHERE a.mes >= DATE '2026-01-01' ORDER BY a.mes;"
      ],
      solucion: `WITH mensual AS (
  SELECT date_trunc('month', fecha)::date AS mes, SUM(total) AS facturacion
  FROM pedidos
  WHERE estado NOT IN ('cancelado', 'reembolsado')
    AND fecha >= DATE '2025-01-01'
    AND fecha < DATE '2026-10-01'
  GROUP BY date_trunc('month', fecha)::date
)
SELECT a.mes, a.facturacion, b.facturacion AS mismo_mes_2025,
  ROUND((a.facturacion - b.facturacion) * 100.0 / NULLIF(b.facturacion, 0), 1) AS yoy_pct
FROM mensual AS a
JOIN mensual AS b ON b.mes = a.mes - INTERVAL '1 year'
WHERE a.mes >= DATE '2026-01-01'
ORDER BY a.mes;`
    }
  ]
});
