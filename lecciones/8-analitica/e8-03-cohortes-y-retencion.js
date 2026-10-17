CURSO.registrar({
  id: "e8-03",
  titulo: "Cohortes y retención: ¿vuelven los clientes?",
  xp: 50,
  objetivo: "Sabrás agrupar a los clientes en cohortes según el trimestre de su primer pedido, calcular en qué trimestre de su «vida» cae cada pedido y medir la retención: qué parte de cada cohorte vuelve a comprar.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "¿Repiten o solo pasan?",
      texto: "Cada trimestre entran clientes nuevos, y eso está muy bien. Pero un consejero me hizo una pregunta que no supe contestar: **¿los clientes que ganamos vuelven a comprar, o compran una vez y se van?**\nY otra que me preocupa: ¿los que entraron este año son tan fieles como los del año pasado? Con Barcelona recién abierta, quiero saber medirlo desde el principio."
    },
    {
      tipo: "explicacion",
      titulo: "Una cohorte: los que empezaron a la vez",
      texto: "Una **cohorte** es un grupo de clientes que empezó en el mismo momento. Aquí, el **trimestre de su primer pedido**.\nPrimero, el primer pedido de cada cliente: `MIN(fecha)` agrupando por `cliente_id` (sin contar los cancelados: un pedido que nunca se hizo no es «empezar»). Después, `date_trunc('quarter', …)` lo lleva al primer día de su trimestre: `2025-04-01` es el segundo trimestre de 2025.\nEl ejemplo cuenta cuántos clientes trae cada cohorte.",
      ejemplo: `WITH primeros AS (
  SELECT cliente_id, date_trunc('quarter', MIN(fecha))::date AS cohorte
  FROM pedidos
  WHERE estado <> 'cancelado'
  GROUP BY cliente_id
)
SELECT cohorte, COUNT(*) AS clientes
FROM primeros
GROUP BY cohorte
ORDER BY cohorte;`,
      consejo: "La primera cohorte (2024-T1) es enorme y engaña: los datos empiezan en enero de 2024, así que todos los clientes de antes «parecen» nuevos ese trimestre. Y la última (2026-T4) es Barcelona, con dos semanas de vida: aún no dice nada de nadie."
    },
    {
      tipo: "ejercicio",
      enunciado: "Lo mismo pero solo con las cohortes de **2025**: `cohorte` (primer día del trimestre del primer pedido no cancelado de cada cliente, como fecha) y `clientes` (cuántos clientes distintos), ordenado por `cohorte`.",
      solucion: `WITH primeros AS (
  SELECT cliente_id, date_trunc('quarter', MIN(fecha))::date AS cohorte
  FROM pedidos
  WHERE estado <> 'cancelado'
  GROUP BY cliente_id
)
SELECT cohorte, COUNT(*) AS clientes
FROM primeros
WHERE cohorte >= DATE '2025-01-01'
  AND cohorte < DATE '2026-01-01'
GROUP BY cohorte
ORDER BY cohorte;`,
      pistas: [
        "Copia el ejemplo y filtra en la consulta de fuera: `WHERE cohorte >= DATE '2025-01-01' AND cohorte < DATE '2026-01-01'`. Ojo: el filtro va sobre la cohorte, no sobre los pedidos (si filtras los pedidos de 2025, el «primer pedido» de un cliente de 2024 pasaría a ser de 2025).",
        "WITH primeros AS (SELECT cliente_id, date_trunc('quarter', MIN(fecha))::date AS cohorte FROM pedidos WHERE estado <> 'cancelado' GROUP BY cliente_id) SELECT cohorte, COUNT(*) AS clientes FROM primeros WHERE cohorte >= DATE '2025-01-01' AND cohorte < DATE '2026-01-01' GROUP BY cohorte ORDER BY cohorte;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "La edad de cada pedido",
      texto: "Ahora, para cada pedido: ¿cuántos trimestres después de su cohorte llegó? Es el **periodo**: 0 es el trimestre en que el cliente empezó, 1 el siguiente, 2 el otro…\nSe calcula con `EXTRACT`: `(año del pedido − año de la cohorte) × 4 + (trimestre del pedido − trimestre de la cohorte)`. Un pedido de 2026-T1 de un cliente de la cohorte 2025-T3 tiene periodo (1 × 4) + (1 − 3) = 2.\nEl ejemplo une cada pedido con la cohorte de su cliente y muestra unos cuantos.",
      ejemplo: `WITH primeros AS (
  SELECT cliente_id, date_trunc('quarter', MIN(fecha))::date AS cohorte
  FROM pedidos
  WHERE estado <> 'cancelado'
  GROUP BY cliente_id
)
SELECT p.id, p.cliente_id, p.fecha::date AS dia, pr.cohorte,
  (EXTRACT(YEAR FROM p.fecha) - EXTRACT(YEAR FROM pr.cohorte)) * 4
    + EXTRACT(QUARTER FROM p.fecha) - EXTRACT(QUARTER FROM pr.cohorte) AS periodo
FROM pedidos AS p
JOIN primeros AS pr ON pr.cliente_id = p.cliente_id
WHERE p.estado <> 'cancelado'
  AND pr.cohorte = DATE '2025-01-01'
ORDER BY p.cliente_id, p.fecha
LIMIT 12;`
    },
    {
      tipo: "explicacion",
      titulo: "La retención: ¿qué parte vuelve?",
      texto: "La **retención** del periodo 1 es el % de la cohorte que compra en el trimestre siguiente; la del periodo 2, en el otro, y así.\nSe cuentan **clientes distintos**, no pedidos: un cliente que vuelve con tres pedidos sigue siendo uno que vuelve. Por eso el ejemplo deja una fila por cliente y periodo (`DISTINCT`) y luego divide entre el tamaño de la cohorte.\nLa tabla sale en **formato largo**: `cohorte`, `periodo`, `activos`, `pct`. Mirando la misma edad en cohortes distintas comparas su fidelidad; mirando un mismo trimestre del calendario ves qué pasó ese trimestre a todos.",
      ejemplo: `WITH primeros AS (
  SELECT cliente_id, date_trunc('quarter', MIN(fecha))::date AS cohorte
  FROM pedidos
  WHERE estado <> 'cancelado'
  GROUP BY cliente_id
),
actividad AS (
  SELECT DISTINCT p.cliente_id, pr.cohorte,
    (EXTRACT(YEAR FROM p.fecha) - EXTRACT(YEAR FROM pr.cohorte)) * 4
      + EXTRACT(QUARTER FROM p.fecha) - EXTRACT(QUARTER FROM pr.cohorte) AS periodo
  FROM pedidos AS p
  JOIN primeros AS pr ON pr.cliente_id = p.cliente_id
  WHERE p.estado <> 'cancelado'
),
tamanos AS (
  SELECT cohorte, COUNT(*) AS clientes
  FROM primeros
  GROUP BY cohorte
)
SELECT a.cohorte, a.periodo, COUNT(*) AS activos,
  ROUND(COUNT(*) * 100.0 / NULLIF(t.clientes, 0), 1) AS pct
FROM actividad AS a
JOIN tamanos AS t ON t.cohorte = a.cohorte
WHERE a.cohorte >= DATE '2025-01-01'
  AND a.cohorte < DATE '2026-01-01'
GROUP BY a.cohorte, a.periodo, t.clientes
ORDER BY a.cohorte, a.periodo;`,
      consejo: "El periodo 0 siempre sale al 100 %: es el trimestre en que todos empezaron. Si no te da 100 %, algo está mal contado. Es la primera comprobación que hago en una tabla de cohortes."
    },
    {
      tipo: "quiz",
      pregunta: "En una tabla de retención con columnas t1, t2 y t3, la cohorte **2026-T3** sale con **0 %** en t2. ¿Qué significa?",
      opciones: [
        "Que los clientes de ese trimestre son peores: no vuelve ninguno",
        "Nada todavía: su periodo 2 es el primer trimestre de 2027, que aún no ha llegado",
        "Que hay un error en el cálculo del periodo"
      ],
      correcta: 1,
      explicacion: "Una cohorte joven no ha tenido **tiempo** de volver. Solo se comparan cohortes en las edades que todas han vivido entero. Por eso el reto usa las cohortes de 2025: hasta septiembre de 2026, todas han vivido completos sus tres trimestres siguientes."
    },
    {
      tipo: "reto",
      de: "ana",
      enunciado: "La retención de las cohortes de **2025** en formato ancho, una fila por cohorte. Usa pedidos **no cancelados** y la cohorte = trimestre del **primer pedido** de cada cliente. Columnas:\n- `cohorte`: primer día del trimestre, como fecha.\n- `clientes`: clientes distintos de la cohorte.\n- `t1`, `t2`, `t3`: % de los clientes de la cohorte que compran en el 1.º, 2.º y 3.º trimestre siguiente (periodo 1, 2 y 3), redondeado a 1.\nOrdenado por `cohorte`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas cohorte, clientes, t1, t2 y t3", prueba: (r) => PRUEBA.columnas(r, ["cohorte", "clientes", "t1", "t2", "t3"]) },
        { texto: "Salen las 4 cohortes de 2025", prueba: (r) => (r?.filas?.length ?? 0) === 4 },
        { texto: "La cohorte sale del primer pedido, no de la fecha de alta (aquí casi coinciden, pero en la vida real no)", prueba: () => {
          // Usar la fecha de alta exige leer clientes; un alias que se llame «alta» no cuenta
          const sql = MOTOR.sinTextos(PRUEBA.codigo());
          return !(/\b(from|join)\s+clientes\b/i.test(sql) && /\balta\b/i.test(sql.replace(/\bas\s+alta\b/gi, "")));
        } },
        { texto: "Cada cohorte con su tamaño y su retención en t1, t2 y t3, en orden", prueba: (r, db) => PRUEBA.igualA(r, db, `WITH primeros AS (
  SELECT cliente_id, date_trunc('quarter', MIN(fecha))::date AS cohorte
  FROM pedidos
  WHERE estado <> 'cancelado'
  GROUP BY cliente_id
),
actividad AS (
  SELECT DISTINCT p.cliente_id, pr.cohorte,
    (EXTRACT(YEAR FROM p.fecha) - EXTRACT(YEAR FROM pr.cohorte)) * 4
      + EXTRACT(QUARTER FROM p.fecha) - EXTRACT(QUARTER FROM pr.cohorte) AS periodo
  FROM pedidos AS p
  JOIN primeros AS pr ON pr.cliente_id = p.cliente_id
  WHERE p.estado <> 'cancelado'
)
SELECT cohorte,
  COUNT(DISTINCT cliente_id) AS clientes,
  ROUND(COUNT(DISTINCT cliente_id) FILTER (WHERE periodo = 1) * 100.0 / NULLIF(COUNT(DISTINCT cliente_id), 0), 1) AS t1,
  ROUND(COUNT(DISTINCT cliente_id) FILTER (WHERE periodo = 2) * 100.0 / NULLIF(COUNT(DISTINCT cliente_id), 0), 1) AS t2,
  ROUND(COUNT(DISTINCT cliente_id) FILTER (WHERE periodo = 3) * 100.0 / NULLIF(COUNT(DISTINCT cliente_id), 0), 1) AS t3
FROM actividad
WHERE cohorte >= DATE '2025-01-01'
  AND cohorte < DATE '2026-01-01'
GROUP BY cohorte
ORDER BY cohorte;`) }
      ],
      pistas: [
        "Reutiliza las CTE `primeros` y `actividad` del último ejemplo. Fuera, agrupa por `cohorte`: `COUNT(DISTINCT cliente_id)` es el tamaño (todos tienen periodo 0) y `COUNT(DISTINCT cliente_id) FILTER (WHERE periodo = 1) * 100.0 / NULLIF(COUNT(DISTINCT cliente_id), 0)` es t1.",
        "WITH primeros AS (SELECT cliente_id, date_trunc('quarter', MIN(fecha))::date AS cohorte FROM pedidos WHERE estado <> 'cancelado' GROUP BY cliente_id), actividad AS (SELECT DISTINCT p.cliente_id, pr.cohorte, (EXTRACT(YEAR FROM p.fecha) - EXTRACT(YEAR FROM pr.cohorte)) * 4 + EXTRACT(QUARTER FROM p.fecha) - EXTRACT(QUARTER FROM pr.cohorte) AS periodo FROM pedidos AS p JOIN primeros AS pr ON pr.cliente_id = p.cliente_id WHERE p.estado <> 'cancelado') SELECT cohorte, COUNT(DISTINCT cliente_id) AS clientes, ROUND(COUNT(DISTINCT cliente_id) FILTER (WHERE periodo = 1) * 100.0 / NULLIF(COUNT(DISTINCT cliente_id), 0), 1) AS t1, ROUND(COUNT(DISTINCT cliente_id) FILTER (WHERE periodo = 2) * 100.0 / NULLIF(COUNT(DISTINCT cliente_id), 0), 1) AS t2, ROUND(COUNT(DISTINCT cliente_id) FILTER (WHERE periodo = 3) * 100.0 / NULLIF(COUNT(DISTINCT cliente_id), 0), 1) AS t3 FROM actividad WHERE cohorte >= DATE '2025-01-01' AND cohorte < DATE '2026-01-01' GROUP BY cohorte ORDER BY cohorte;"
      ],
      solucion: `WITH primeros AS (
  SELECT cliente_id, date_trunc('quarter', MIN(fecha))::date AS cohorte
  FROM pedidos
  WHERE estado <> 'cancelado'
  GROUP BY cliente_id
),
actividad AS (
  SELECT DISTINCT p.cliente_id, pr.cohorte,
    (EXTRACT(YEAR FROM p.fecha) - EXTRACT(YEAR FROM pr.cohorte)) * 4
      + EXTRACT(QUARTER FROM p.fecha) - EXTRACT(QUARTER FROM pr.cohorte) AS periodo
  FROM pedidos AS p
  JOIN primeros AS pr ON pr.cliente_id = p.cliente_id
  WHERE p.estado <> 'cancelado'
)
SELECT cohorte,
  COUNT(DISTINCT cliente_id) AS clientes,
  ROUND(COUNT(DISTINCT cliente_id) FILTER (WHERE periodo = 1) * 100.0 / NULLIF(COUNT(DISTINCT cliente_id), 0), 1) AS t1,
  ROUND(COUNT(DISTINCT cliente_id) FILTER (WHERE periodo = 2) * 100.0 / NULLIF(COUNT(DISTINCT cliente_id), 0), 1) AS t2,
  ROUND(COUNT(DISTINCT cliente_id) FILTER (WHERE periodo = 3) * 100.0 / NULLIF(COUNT(DISTINCT cliente_id), 0), 1) AS t3
FROM actividad
WHERE cohorte >= DATE '2025-01-01'
  AND cohorte < DATE '2026-01-01'
GROUP BY cohorte
ORDER BY cohorte;`
    }
  ]
});
