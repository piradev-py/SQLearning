(function () {
  // La solución del reto; la comprobación de «parametrizado» la reutiliza con agosto
  const SOLUCION = `WITH params AS (SELECT DATE '2026-09-01' AS mes),
kpis AS (
  SELECT date_trunc('month', p.fecha)::date AS mes,
    SUM(p.total) FILTER (WHERE p.estado NOT IN ('cancelado', 'reembolsado')) AS facturacion,
    COUNT(*) AS pedidos,
    AVG(p.total) FILTER (WHERE p.estado NOT IN ('cancelado', 'reembolsado')) AS ticket_medio,
    COUNT(*) FILTER (WHERE p.estado = 'reembolsado') * 100.0 / NULLIF(COUNT(*), 0) AS tasa_reembolso
  FROM pedidos AS p
  CROSS JOIN params
  WHERE p.fecha >= params.mes - INTERVAL '1 month'
    AND p.fecha < params.mes + INTERVAL '1 month'
  GROUP BY date_trunc('month', p.fecha)::date
),
actual AS (
  SELECT k.* FROM kpis AS k CROSS JOIN params WHERE k.mes = params.mes
),
anterior AS (
  SELECT k.* FROM kpis AS k CROSS JOIN params WHERE k.mes = params.mes - INTERVAL '1 month'
)
SELECT 'facturacion' AS kpi, ROUND(a.facturacion, 2) AS valor, ROUND(b.facturacion, 2) AS mes_anterior,
  ROUND((a.facturacion - b.facturacion) * 100.0 / NULLIF(b.facturacion, 0), 1) AS variacion_pct
FROM actual AS a CROSS JOIN anterior AS b
UNION ALL
SELECT 'pedidos', ROUND(a.pedidos, 2), ROUND(b.pedidos, 2),
  ROUND((a.pedidos - b.pedidos) * 100.0 / NULLIF(b.pedidos, 0), 1)
FROM actual AS a CROSS JOIN anterior AS b
UNION ALL
SELECT 'ticket_medio', ROUND(a.ticket_medio, 2), ROUND(b.ticket_medio, 2),
  ROUND((a.ticket_medio - b.ticket_medio) * 100.0 / NULLIF(b.ticket_medio, 0), 1)
FROM actual AS a CROSS JOIN anterior AS b
UNION ALL
SELECT 'tasa_reembolso', ROUND(a.tasa_reembolso, 2), ROUND(b.tasa_reembolso, 2),
  ROUND((a.tasa_reembolso - b.tasa_reembolso) * 100.0 / NULLIF(b.tasa_reembolso, 0), 1)
FROM actual AS a CROSS JOIN anterior AS b
ORDER BY kpi;`;
  const SEPTIEMBRE = /DATE\s*'2026-09-01'/gi;

  CURSO.registrar({
    id: "e8-10",
    titulo: "Un cuadro de mando en una consulta",
    xp: 45,
    objetivo: "Sabrás montar un cuadro de mando en una sola consulta: pocos KPIs, siempre los mismos, comparados con el mes anterior, con el periodo como parámetro en una CTE, en formato largo con UNION ALL y con un semáforo hecho con CASE.",
    pasos: [
      {
        tipo: "historia",
        de: "ana",
        asunto: "La misma diapositiva cada mes",
        texto: "Cada mes alguien me prepara las cifras a mano y cada mes salen con una definición distinta. Quiero **una diapositiva**, siempre la misma: facturación, pedidos, ticket medio y tasa de reembolso, **comparadas con el mes anterior**.\nY que el mes que viene no haya que reescribir nada: se cambia la fecha y listo."
      },
      {
        tipo: "explicacion",
        titulo: "Pocas cifras, comparadas, con un parámetro",
        texto: "Un **cuadro de mando** (dashboard) no es un cajón de gráficos: son **pocas cifras**, siempre las mismas y siempre **comparadas con algo** (el objetivo, el mes anterior, el año anterior). Un número suelto no dice si es bueno o malo.\nPara cambiar el periodo en **un solo sitio**, ponlo en una CTE de **parámetros**: `WITH params AS (SELECT DATE '2026-09-01' AS mes)`. Con un `CROSS JOIN params`, el resto de la consulta usa `params.mes`; el mes que viene cambias esa línea y nada más.",
        ejemplo: `WITH params AS (SELECT DATE '2026-09-01' AS mes)
SELECT params.mes, COUNT(*) AS pedidos
FROM pedidos AS p
CROSS JOIN params
WHERE p.fecha >= params.mes
  AND p.fecha < params.mes + INTERVAL '1 month'
GROUP BY params.mes;`,
        consejo: "Define cada KPI **una vez** y úsala en todas las tarjetas. Si la facturación de una tarjeta incluye reembolsos y la de otra no, el cuadro se contradice y nadie se fía de ninguna cifra."
      },
      {
        tipo: "ejercicio",
        enunciado: "Con `WITH params AS (SELECT DATE '2026-09-01' AS mes)`, una fila con los pedidos del mes de `params`: `pedidos` (todos) y `facturacion` (suma de `total` de los que no están `cancelado` ni `reembolsado`). El mes va de `params.mes` (incluido) a `params.mes + INTERVAL '1 month'` (excluido).",
        solucion: `WITH params AS (SELECT DATE '2026-09-01' AS mes)
SELECT COUNT(*) AS pedidos,
  SUM(p.total) FILTER (WHERE p.estado NOT IN ('cancelado', 'reembolsado')) AS facturacion
FROM pedidos AS p
CROSS JOIN params
WHERE p.fecha >= params.mes
  AND p.fecha < params.mes + INTERVAL '1 month';`,
        pistas: [
          "Como el ejemplo, sin `GROUP BY` (es una sola fila) y con la facturación como `SUM(p.total) FILTER (WHERE p.estado NOT IN ('cancelado', 'reembolsado'))`.",
          "WITH params AS (SELECT DATE '2026-09-01' AS mes) SELECT COUNT(*) AS pedidos, SUM(p.total) FILTER (WHERE p.estado NOT IN ('cancelado', 'reembolsado')) AS facturacion FROM pedidos AS p CROSS JOIN params WHERE p.fecha >= params.mes AND p.fecha < params.mes + INTERVAL '1 month';"
        ]
      },
      {
        tipo: "explicacion",
        titulo: "Una fila por KPI: UNION ALL",
        texto: "Las herramientas de BI (Power BI, Looker, Tableau) y los gráficos prefieren el **formato largo**: una fila por KPI con las mismas columnas (`kpi`, `valor`, `anterior`…). Se construye calculando todo en CTE y juntando un `SELECT` por KPI con `UNION ALL`.\nTodas las partes del `UNION ALL` deben tener las **mismas columnas y tipos compatibles**: si en una pones un número y en otra un texto, PostgreSQL da error. Los nombres los pone el primer `SELECT`.",
        ejemplo: `WITH params AS (SELECT DATE '2026-09-01' AS mes),
mes AS (
  SELECT COUNT(*) AS pedidos, AVG(p.total) AS importe_medio
  FROM pedidos AS p
  CROSS JOIN params
  WHERE p.fecha >= params.mes
    AND p.fecha < params.mes + INTERVAL '1 month'
)
SELECT 'pedidos' AS kpi, ROUND(pedidos, 2) AS valor FROM mes
UNION ALL
SELECT 'importe_medio', ROUND(importe_medio, 2) FROM mes;`,
        consejo: "Para que una herramienta de BI lo lea, guárdalo como **vista** (`CREATE VIEW cuadro_mando AS …`, e6): la herramienta pregunta a la vista y siempre ve la misma definición. Si la consulta es pesada, existen las vistas **materializadas**, que guardan el resultado y se refrescan cada cierto tiempo."
      },
      {
        tipo: "explicacion",
        titulo: "El semáforo",
        texto: "Un **semáforo** dice de un vistazo si una cifra va bien: con `CASE` (e5) comparas con el objetivo y devuelves `'verde'`, `'ámbar'` o `'rojo'`.\nCuida los umbrales: si dejas huecos (`< 80` y `> 90`… ¿y el 85?), el `CASE` devuelve `NULL` para lo que cae en medio. Escríbelos en orden y termina con un `ELSE`.\nEl ejemplo compara la facturación neta de septiembre de cada tienda con un objetivo de 20 000 €: verde si lo alcanza, ámbar si llega al 80 % y rojo si no.",
        ejemplo: `SELECT tienda_id,
  SUM(total) AS facturacion,
  CASE
    WHEN SUM(total) >= 20000 THEN 'verde'
    WHEN SUM(total) >= 20000 * 0.8 THEN 'ámbar'
    ELSE 'rojo'
  END AS semaforo
FROM pedidos
WHERE fecha >= '2026-09-01' AND fecha < '2026-10-01'
  AND estado NOT IN ('cancelado', 'reembolsado')
GROUP BY tienda_id
ORDER BY tienda_id;`
      },
      {
        tipo: "quiz",
        pregunta: "Te enseñan un cuadro de mando con **40 gráficos** distintos, cada uno con su número del mes. ¿Qué le falta?",
        opciones: [
          "Más colores para distinguirlos",
          "Foco y comparación: pocas cifras que importan, cada una frente a un objetivo o al periodo anterior",
          "Más decimales en cada cifra"
        ],
        correcta: 1,
        explicacion: "Con 40 cifras nadie sabe dónde mirar, y una cifra sin comparación no dice si es buena o mala. Mejor 4 o 5 KPIs con su comparación y su semáforo; el detalle, en otra página."
      },
      {
        tipo: "reto",
        de: "ana",
        enunciado: "Mi diapositiva. Empieza **exactamente** con `WITH params AS (SELECT DATE '2026-09-01' AS mes)` y no escribas esa fecha en ningún otro sitio (lo demás, a partir de `params.mes`). Una fila por KPI del mes de `params` frente al mes anterior: `kpi` (`'facturacion'`, `'pedidos'`, `'ticket_medio'` y `'tasa_reembolso'`), `valor` (el mes de `params`), `mes_anterior` y `variacion_pct` (% de cambio sobre el mes anterior). Definiciones: `facturacion` = suma de `total` neta (sin `cancelado` ni `reembolsado`); `pedidos` = todos; `ticket_medio` = media de `total` neta; `tasa_reembolso` = % de pedidos `reembolsado` sobre todos. `valor` y `mes_anterior` redondeados a 2; `variacion_pct` calculada con los valores **sin redondear** y redondeada a 1. Ordenado por `kpi`.",
        inicial: "WITH params AS (SELECT DATE '2026-09-01' AS mes)\n-- Sigue aquí\n",
        comprobaciones: [
          { texto: "Tiene las columnas kpi, valor, mes_anterior y variacion_pct", prueba: (r) => PRUEBA.columnas(r, ["kpi", "valor", "mes_anterior", "variacion_pct"]) },
          { texto: "Están los cuatro KPIs, por orden alfabético", prueba: (r) => {
            const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "kpi");
            return i >= 0 && (r?.filas || []).map(f => String(f?.[i])).join(",") === "facturacion,pedidos,tasa_reembolso,ticket_medio";
          } },
          { texto: "Cada KPI con su valor, el del mes anterior y la variación", prueba: (r, db) => PRUEBA.igualA(r, db, SOLUCION) },
          { texto: "Cambiando solo la fecha de params a agosto, sale el cuadro de agosto", prueba: async (r, db) => {
            try {
              const sql = PRUEBA.codigo();
              if ((sql.match(SEPTIEMBRE) || []).length !== 1) return false;
              const agosto = await db.consulta(sql.replace(SEPTIEMBRE, "DATE '2026-08-01'"));
              return await PRUEBA.igualA(agosto, db, SOLUCION.replace(SEPTIEMBRE, "DATE '2026-08-01'"));
            } catch (e) { return false; }
          } }
        ],
        pistas: [
          "Tres CTE después de `params`: `kpis` (agrupa por `date_trunc('month', p.fecha)::date` los dos meses, de `params.mes - INTERVAL '1 month'` a `params.mes + INTERVAL '1 month'`, con los cuatro KPIs sin redondear), `actual` y `anterior` (la fila de cada mes). Fuera, cuatro `SELECT` unidos con `UNION ALL`, uno por KPI.",
          "Cada `SELECT` del final es como este, cambiando el KPI: `SELECT 'facturacion' AS kpi, ROUND(a.facturacion, 2) AS valor, ROUND(b.facturacion, 2) AS mes_anterior, ROUND((a.facturacion - b.facturacion) * 100.0 / NULLIF(b.facturacion, 0), 1) AS variacion_pct FROM actual AS a CROSS JOIN anterior AS b` (y `ORDER BY kpi` al final del todo)."
        ],
        solucion: SOLUCION
      }
    ]
  });
})();
