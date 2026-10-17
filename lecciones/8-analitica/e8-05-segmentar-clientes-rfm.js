CURSO.registrar({
  id: "e8-05",
  titulo: "Segmentar clientes: RFM",
  xp: 50,
  objetivo: "Sabrás segmentar a los clientes con el método RFM: calcular recencia, frecuencia y gasto de cada uno, puntuarlos de 1 a 5 con NTILE (la recencia al revés) y convertir las puntuaciones en segmentos con CASE.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "No todos los clientes son iguales",
      texto: "Tengo presupuesto para dos campañas este otoño y Marcos quiere llamar a los clientes que «se nos están yendo». Pero no sé a quién dirigirme.\nNo me vale «los que más gastan»: alguien que gastó mucho hace dos años y no ha vuelto no es lo mismo que alguien que compra cada mes. Necesito grupos con nombre: **a quién mimar, a quién recuperar y a quién dar la bienvenida**."
    },
    {
      tipo: "explicacion",
      titulo: "R, F y M",
      texto: "**RFM** es el método clásico para segmentar clientes con tres números:\n- **R**ecencia: días desde su última compra hasta hoy. Pocos días = cliente vivo.\n- **F**recuencia: cuántos pedidos ha hecho.\n- **M**onetario: cuánto ha gastado.\nCon facturación neta (sin `cancelado` ni `reembolsado`) y con **hoy = 2026-10-15**, siempre escrito como fecha fija, nunca `CURRENT_DATE`: así el informe da lo mismo lo ejecutes cuando lo ejecutes.\nRestar dos fechas da días: `DATE '2026-10-15' - MAX(fecha)::date`.",
      ejemplo: `SELECT cliente_id,
  DATE '2026-10-15' - MAX(fecha)::date AS dias,
  COUNT(*) AS pedidos,
  SUM(total) AS gasto
FROM pedidos
WHERE estado NOT IN ('cancelado', 'reembolsado')
GROUP BY cliente_id
ORDER BY cliente_id
LIMIT 10;`,
      otrosMotores: "Restar fechas cambia en cada motor: SQL Server usa `DATEDIFF(day, MAX(fecha), '2026-10-15')`, MySQL `DATEDIFF('2026-10-15', MAX(fecha))` y BigQuery `DATE_DIFF(DATE '2026-10-15', DATE(MAX(fecha)), DAY)`."
    },
    {
      tipo: "ejercicio",
      enunciado: "Los 5 clientes que más han gastado (facturación neta: sin pedidos `cancelado` ni `reembolsado`): `cliente_id`, `dias` (`DATE '2026-10-15' - MAX(fecha)::date`), `pedidos` y `gasto` (suma de `total`), de más a menos `gasto` y, si empatan, por `cliente_id`.",
      solucion: `SELECT cliente_id,
  DATE '2026-10-15' - MAX(fecha)::date AS dias,
  COUNT(*) AS pedidos,
  SUM(total) AS gasto
FROM pedidos
WHERE estado NOT IN ('cancelado', 'reembolsado')
GROUP BY cliente_id
ORDER BY gasto DESC, cliente_id
LIMIT 5;`,
      pistas: [
        "Es el ejemplo con otro orden: `ORDER BY gasto DESC, cliente_id` y `LIMIT 5`.",
        "SELECT cliente_id, DATE '2026-10-15' - MAX(fecha)::date AS dias, COUNT(*) AS pedidos, SUM(total) AS gasto FROM pedidos WHERE estado NOT IN ('cancelado', 'reembolsado') GROUP BY cliente_id ORDER BY gasto DESC, cliente_id LIMIT 5;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Puntuar de 1 a 5 con NTILE",
      texto: "Los días, pedidos y euros no se pueden comparar entre sí. Se convierten en una nota de **1 a 5** con `NTILE(5)`: ordena a los clientes y los reparte en cinco grupos iguales.\n- F y M: `NTILE(5) OVER (ORDER BY pedidos, cliente_id)`: más pedidos, nota más alta.\n- R va **al revés**: menos días es mejor, así que se ordena `dias DESC` para que los más recientes caigan en el grupo 5.\nEl `cliente_id` desempata: con empates, sin él cada ejecución podría poner a un cliente a un lado u otro de la frontera.",
      ejemplo: `WITH rfm AS (
  SELECT cliente_id,
    DATE '2026-10-15' - MAX(fecha)::date AS dias,
    COUNT(*) AS pedidos,
    SUM(total) AS gasto
  FROM pedidos
  WHERE estado NOT IN ('cancelado', 'reembolsado')
  GROUP BY cliente_id
)
SELECT cliente_id, dias, pedidos, gasto,
  NTILE(5) OVER (ORDER BY dias DESC, cliente_id) AS r,
  NTILE(5) OVER (ORDER BY pedidos, cliente_id) AS f,
  NTILE(5) OVER (ORDER BY gasto, cliente_id) AS m
FROM rfm
ORDER BY cliente_id
LIMIT 10;`
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería dar, por nota de recencia, `r`, `clientes` (cuántos) y `dias_medios` (media de `dias`, redondeada a 1), ordenado por `r`, con la **r = 5 para los más recientes** (`NTILE(5)` desempatando por `cliente_id`). Pero el grupo 5 sale con los clientes que más tiempo llevan sin comprar. Arréglala.",
      inicial: `WITH rfm AS (
  SELECT cliente_id,
    DATE '2026-10-15' - MAX(fecha)::date AS dias
  FROM pedidos
  WHERE estado NOT IN ('cancelado', 'reembolsado')
  GROUP BY cliente_id
),
notas AS (
  SELECT cliente_id, dias,
    NTILE(5) OVER (ORDER BY dias, cliente_id) AS r
  FROM rfm
)
SELECT r, COUNT(*) AS clientes, ROUND(AVG(dias), 1) AS dias_medios
FROM notas
GROUP BY r
ORDER BY r;`,
      solucion: `WITH rfm AS (
  SELECT cliente_id,
    DATE '2026-10-15' - MAX(fecha)::date AS dias
  FROM pedidos
  WHERE estado NOT IN ('cancelado', 'reembolsado')
  GROUP BY cliente_id
),
notas AS (
  SELECT cliente_id, dias,
    NTILE(5) OVER (ORDER BY dias DESC, cliente_id) AS r
  FROM rfm
)
SELECT r, COUNT(*) AS clientes, ROUND(AVG(dias), 1) AS dias_medios
FROM notas
GROUP BY r
ORDER BY r;`,
      pistas: [
        "El fallo está en el orden del `NTILE`: ordenando por `dias` de menor a mayor, el grupo 5 se lo llevan los que tienen **más** días.",
        "Cambia `ORDER BY dias, cliente_id` por `ORDER BY dias DESC, cliente_id` dentro del `OVER`."
      ]
    },
    {
      tipo: "explicacion",
      titulo: "De notas a segmentos con CASE",
      texto: "Con las notas, un `CASE` pone nombre a cada grupo. En Faro usamos R y F:\n- **campeones**: R ≥ 4 y F ≥ 4. Compran mucho y hace poco: a mimarlos.\n- **en riesgo**: R ≤ 2 y F ≥ 4. Eran buenos clientes y han dejado de venir: a llamarlos (lo de Marcos).\n- **nuevos**: R ≥ 4 y F ≤ 2. Acaban de llegar: bienvenida.\n- **dormidos**: R ≤ 2 y F ≤ 2. Pocas compras y lejanas.\n- **a cuidar**: todos los demás.\nEl `CASE` se queda con la **primera** condición que se cumple, así que el «resto» va en el `ELSE`.",
      consejo: "Los cortes (≥ 4, ≤ 2) son una decisión de negocio, no una ley. Acuérdalos con quien va a usar los segmentos y escríbelos en el informe. Y deja fuera a los clientes sin ninguna compra neta: no tienen recencia que puntuar."
    },
    {
      tipo: "quiz",
      pregunta: "Un cliente tiene R = 1, F = 5 y M = 5. ¿En qué segmento cae?",
      opciones: ["Campeones", "En riesgo", "Dormidos"],
      correcta: 1,
      explicacion: "F = 5 dice que compraba mucho; R = 1, que hace mucho que no compra. Es justo el cliente que no te puedes permitir perder: **en riesgo**. Es el primero de la lista de llamadas de Marcos."
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "Clientes y gasto por segmento. Para cada cliente con alguna compra neta (pedidos que no están `cancelado` ni `reembolsado`): `dias` = `DATE '2026-10-15' - MAX(fecha)::date`, `pedidos` y `gasto` (suma de `total`). Notas **exactamente** así:\n- R: `NTILE(5) OVER (ORDER BY dias DESC, cliente_id)`\n- F: `NTILE(5) OVER (ORDER BY pedidos, cliente_id)`\nSegmentos: `'campeones'` (R ≥ 4 y F ≥ 4), `'en riesgo'` (R ≤ 2 y F ≥ 4), `'nuevos'` (R ≥ 4 y F ≤ 2), `'dormidos'` (R ≤ 2 y F ≤ 2) y `'a cuidar'` el resto.\nColumnas `segmento`, `clientes` y `gasto` (suma del gasto de sus clientes), de más a menos `gasto`.",
      inicial: "-- Escribe tu consulta aquí\n",
      grafico: true,
      comprobaciones: [
        { texto: "Tiene las columnas segmento, clientes y gasto", prueba: (r) => PRUEBA.columnas(r, ["segmento", "clientes", "gasto"]) },
        { texto: "Entran todos los clientes con alguna compra neta, cada uno en un solo segmento", prueba: async (r, db) => {
          const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "clientes");
          if (i < 0) return false;
          const suma = (r?.filas || []).reduce((s, f) => s + Number(f?.[i] ?? 0), 0);
          const e = await db.consulta(`SELECT COUNT(DISTINCT cliente_id) AS n FROM pedidos WHERE estado NOT IN ('cancelado', 'reembolsado');`);
          return suma === Number(e?.filas?.[0]?.[0] ?? -1);
        } },
        { texto: "Cada segmento con sus clientes y su gasto, de más a menos gasto", prueba: (r, db) => PRUEBA.igualA(r, db, `WITH rfm AS (
  SELECT cliente_id,
    DATE '2026-10-15' - MAX(fecha)::date AS dias,
    COUNT(*) AS pedidos,
    SUM(total) AS gasto
  FROM pedidos
  WHERE estado NOT IN ('cancelado', 'reembolsado')
  GROUP BY cliente_id
),
notas AS (
  SELECT cliente_id, gasto,
    NTILE(5) OVER (ORDER BY dias DESC, cliente_id) AS r,
    NTILE(5) OVER (ORDER BY pedidos, cliente_id) AS f
  FROM rfm
),
segmentos AS (
  SELECT cliente_id, gasto,
    CASE
      WHEN r >= 4 AND f >= 4 THEN 'campeones'
      WHEN r <= 2 AND f >= 4 THEN 'en riesgo'
      WHEN r >= 4 AND f <= 2 THEN 'nuevos'
      WHEN r <= 2 AND f <= 2 THEN 'dormidos'
      ELSE 'a cuidar'
    END AS segmento
  FROM notas
)
SELECT segmento, COUNT(*) AS clientes, SUM(gasto) AS gasto
FROM segmentos
GROUP BY segmento
ORDER BY gasto DESC;`) }
      ],
      pistas: [
        "Tres CTE en cadena: `rfm` (dias, pedidos y gasto por cliente), `notas` (los dos `NTILE` del enunciado) y `segmentos` (el `CASE`). Fuera, `GROUP BY segmento` con `COUNT(*)` y `SUM(gasto)`, y `ORDER BY gasto DESC`.",
        "WITH rfm AS (SELECT cliente_id, DATE '2026-10-15' - MAX(fecha)::date AS dias, COUNT(*) AS pedidos, SUM(total) AS gasto FROM pedidos WHERE estado NOT IN ('cancelado', 'reembolsado') GROUP BY cliente_id), notas AS (SELECT cliente_id, gasto, NTILE(5) OVER (ORDER BY dias DESC, cliente_id) AS r, NTILE(5) OVER (ORDER BY pedidos, cliente_id) AS f FROM rfm), segmentos AS (SELECT cliente_id, gasto, CASE WHEN r >= 4 AND f >= 4 THEN 'campeones' WHEN r <= 2 AND f >= 4 THEN 'en riesgo' WHEN r >= 4 AND f <= 2 THEN 'nuevos' WHEN r <= 2 AND f <= 2 THEN 'dormidos' ELSE 'a cuidar' END AS segmento FROM notas) SELECT segmento, COUNT(*) AS clientes, SUM(gasto) AS gasto FROM segmentos GROUP BY segmento ORDER BY gasto DESC;"
      ],
      solucion: `WITH rfm AS (
  SELECT cliente_id,
    DATE '2026-10-15' - MAX(fecha)::date AS dias,
    COUNT(*) AS pedidos,
    SUM(total) AS gasto
  FROM pedidos
  WHERE estado NOT IN ('cancelado', 'reembolsado')
  GROUP BY cliente_id
),
notas AS (
  SELECT cliente_id, gasto,
    NTILE(5) OVER (ORDER BY dias DESC, cliente_id) AS r,
    NTILE(5) OVER (ORDER BY pedidos, cliente_id) AS f
  FROM rfm
),
segmentos AS (
  SELECT cliente_id, gasto,
    CASE
      WHEN r >= 4 AND f >= 4 THEN 'campeones'
      WHEN r <= 2 AND f >= 4 THEN 'en riesgo'
      WHEN r >= 4 AND f <= 2 THEN 'nuevos'
      WHEN r <= 2 AND f <= 2 THEN 'dormidos'
      ELSE 'a cuidar'
    END AS segmento
  FROM notas
)
SELECT segmento, COUNT(*) AS clientes, SUM(gasto) AS gasto
FROM segmentos
GROUP BY segmento
ORDER BY gasto DESC;`
    }
  ]
});
