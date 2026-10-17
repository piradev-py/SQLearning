CURSO.registrar({
  id: "e8-08",
  titulo: "¿Funciona el cambio?: test A/B",
  xp: 50,
  objetivo: "Sabrás evaluar un test A/B: comparar la conversión del grupo de control y del de tratamiento, y decidir con un z de dos proporciones si la diferencia es un efecto real o cosa de la suerte.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "El pago en un paso",
      texto: "Después de ver el embudo, Producto probó de julio a septiembre un **pago en un paso** en la mitad de las visitas de la web. Les gustó tanto que el 1 de octubre lo activaron para todo el mundo, sin esperar a nadie.\nEn el consejo me van a preguntar si fue buena idea. «Nos gustó» no es una respuesta: quiero saber si de verdad compra más gente o si fue **suerte**."
    },
    {
      tipo: "explicacion",
      titulo: "Una prueba A/B",
      texto: "En una **prueba A/B** se reparte a la gente **al azar** en dos grupos: el **control** (A, todo como siempre) y el **tratamiento** (B, con el cambio). Como el reparto es al azar, la única diferencia sistemática entre los grupos es el cambio.\nLa **métrica** se decide **antes** de empezar: aquí, la conversión de **carrito a compra** (de las sesiones que llegan al carrito, qué % compra).\nEn `sesiones_web`, la columna `variante` dice el grupo de cada sesión: `'A'`, `'B'` o `NULL` si la sesión no estaba en la prueba (antes de julio y desde octubre).",
      ejemplo: `SELECT variante, COUNT(*) AS sesiones,
  MIN(inicio)::date AS desde, MAX(inicio)::date AS hasta
FROM sesiones_web
GROUP BY variante
ORDER BY variante;`
    },
    {
      tipo: "ejercicio",
      enunciado: "Conversión de cada grupo de la prueba (solo sesiones con `variante` no nula): `variante`, `carrito` (sesiones distintas que tienen el evento `'carrito'`), `compra` (sesiones distintas con `'compra'`) y `conversion` (% de `compra` sobre `carrito`, con `* 100.0` y `NULLIF`, redondeado a 1), ordenado por `variante`.",
      solucion: `SELECT s.variante,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'carrito') AS carrito,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'compra') AS compra,
  ROUND(COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'compra') * 100.0
    / NULLIF(COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'carrito'), 0), 1) AS conversion
FROM sesiones_web AS s
JOIN eventos_web AS e ON e.sesion_id = s.id
WHERE s.variante IS NOT NULL
GROUP BY s.variante
ORDER BY s.variante;`,
      pistas: [
        "Une `sesiones_web AS s` con `eventos_web AS e` (`ON e.sesion_id = s.id`), filtra `s.variante IS NOT NULL` y agrupa por `s.variante`. Cada paso se cuenta con `COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = …)`.",
        "SELECT s.variante, COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'carrito') AS carrito, COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'compra') AS compra, ROUND(COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'compra') * 100.0 / NULLIF(COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'carrito'), 0), 1) AS conversion FROM sesiones_web AS s JOIN eventos_web AS e ON e.sesion_id = s.id WHERE s.variante IS NOT NULL GROUP BY s.variante ORDER BY s.variante;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "¿Efecto o suerte? El z de dos proporciones",
      texto: "B convierte más que A, pero aunque el cambio no hiciera nada, dos grupos al azar casi nunca salen iguales. La pregunta es si la diferencia es **más grande** de lo que da la suerte. Para eso, el **z de dos proporciones**:\n1. `p` combinada: compras de los dos grupos entre carritos de los dos.\n2. Error estándar: `sqrt(p * (1 − p) * (1.0 / nA + 1.0 / nB))`, con `nA` y `nB` los carritos de cada grupo.\n3. `z = (pB − pA) / error estándar`.\nSi |z| > **1,96**, la diferencia es significativa con un 95 % de confianza. El ejemplo lo calcula con números inventados (A: 50 de 100; B: 60 de 100).",
      ejemplo: `WITH ab AS (
  SELECT 100 AS carrito_a, 50 AS compra_a, 100 AS carrito_b, 60 AS compra_b
),
tasas AS (
  SELECT carrito_a, carrito_b,
    compra_a * 1.0 / carrito_a AS pa,
    compra_b * 1.0 / carrito_b AS pb,
    (compra_a + compra_b) * 1.0 / (carrito_a + carrito_b) AS p
  FROM ab
)
SELECT ROUND((pb - pa) / sqrt(p * (1 - p) * (1.0 / carrito_a + 1.0 / carrito_b)), 2) AS z
FROM tasas;`,
      consejo: "Significativo no quiere decir importante: con millones de sesiones, una mejora del 0,1 % sale significativa y quizá no compense el cambio. Y no mires el resultado cada día para parar en cuanto salga bonito (*peeking*): se decide la duración antes y se espera.",
      otrosMotores: "PostgreSQL no trae la distribución normal para pasar el z a un **p-valor**. BigQuery, Python (`scipy.stats`) o una hoja de cálculo (`DISTR.NORM.ESTAND.N`) sí."
    },
    {
      tipo: "quiz",
      pregunta: "Otra prueba: B convierte **2 puntos** más que A, pero solo con **40 sesiones** en cada grupo. ¿Lo lanzas para todos?",
      opciones: ["Sí: B es mejor", "Todavía no: con tan pocas sesiones, 2 puntos caben de sobra en la suerte", "No: B es peor"],
      correcta: 1,
      explicacion: "Con 40 sesiones, 2 puntos es menos de una compra de diferencia. El z saldría muy pequeño: no se puede distinguir el efecto de la suerte. Hay que dejar correr la prueba hasta tener una muestra decidida de antemano."
    },
    {
      tipo: "interpretar",
      pregunta: "Que compre más gente no sirve de mucho si cada compra es más pequeña. ¿Cambia el **ticket medio** entre A y B? Toma los pedidos de las sesiones de la prueba con `compra` (`eventos_web.pedido_id`, se cancelaran o no después: se mide lo que se compró) y calcula `z = (media_B − media_A) / sqrt(dA² / nA + dB² / nB)`, con la media, `STDDEV_SAMP` y el número de pedidos de cada grupo. Responde **sí** o **no**.",
      respuesta: ["no", "no cambia", "no no cambia", "no hay diferencia", "no significativo", "no es significativo", "no z pequeño"],
      pistas: [
        "Une `sesiones_web` (con `variante` no nula) con `eventos_web` (evento `'compra'`) y con `pedidos` por `pedido_id`. Con `FILTER (WHERE variante = 'A')` y `'B'` saca `AVG(total)`, `STDDEV_SAMP(total)` y `COUNT(*)` de cada grupo.",
        "El z sale muy por debajo de 1,96: la diferencia de ticket es la que daría la suerte. **No** cambia."
      ],
      solucion: `WITH tickets AS (
  SELECT s.variante, p.total
  FROM sesiones_web AS s
  JOIN eventos_web AS e ON e.sesion_id = s.id AND e.evento = 'compra'
  JOIN pedidos AS p ON p.id = e.pedido_id
  WHERE s.variante IS NOT NULL
),
grupos AS (
  SELECT
    AVG(total) FILTER (WHERE variante = 'A') AS media_a,
    STDDEV_SAMP(total) FILTER (WHERE variante = 'A') AS d_a,
    COUNT(*) FILTER (WHERE variante = 'A') AS n_a,
    AVG(total) FILTER (WHERE variante = 'B') AS media_b,
    STDDEV_SAMP(total) FILTER (WHERE variante = 'B') AS d_b,
    COUNT(*) FILTER (WHERE variante = 'B') AS n_b
  FROM tickets
),
con_z AS (
  SELECT media_a, media_b,
    (media_b - media_a) / sqrt(d_a * d_a / n_a + d_b * d_b / n_b) AS z
  FROM grupos
)
SELECT CASE WHEN ABS(z) > 1.96 THEN 'sí cambia' ELSE 'no cambia' END AS respuesta,
  ROUND(media_a, 2) AS ticket_a, ROUND(media_b, 2) AS ticket_b, ROUND(z, 2) AS z
FROM con_z;`
    },
    {
      tipo: "reto",
      de: "ana",
      enunciado: "El veredicto para el consejo, en **una fila** y con CTE paso a paso. Solo sesiones de la prueba (`variante` `'A'` o `'B'`): `carrito_a`, `compra_a`, `carrito_b`, `compra_b` (sesiones distintas de cada grupo que llegan a `'carrito'` y a `'compra'`), `conv_a` y `conv_b` (% de compra sobre carrito de cada grupo, redondeado a 1) y `z` (el z de dos proporciones de la explicación, calculado con las tasas **sin redondear**, redondeado a 2).",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas carrito_a, compra_a, carrito_b, compra_b, conv_a, conv_b y z, en una sola fila", prueba: (r) => PRUEBA.columnas(r, ["carrito_a", "compra_a", "carrito_b", "compra_b", "conv_a", "conv_b", "z"]) && (r?.filas?.length ?? 0) === 1 },
        { texto: "Lo calculas con las tablas sesiones_web y eventos_web (no vale escribir los números a mano)", prueba: () => {
          const sql = MOTOR.sinComentarios(MOTOR.sinTextos(PRUEBA.codigo()));
          return /\bsesiones_web\b/i.test(sql) && /\beventos_web\b/i.test(sql);
        } },
        { texto: "Carritos, compras, conversiones y z de cada grupo, contando sesiones de la prueba", prueba: (r, db) => PRUEBA.igualA(r, db, `WITH ab AS (
  SELECT
    COUNT(DISTINCT e.sesion_id) FILTER (WHERE s.variante = 'A' AND e.evento = 'carrito') AS carrito_a,
    COUNT(DISTINCT e.sesion_id) FILTER (WHERE s.variante = 'A' AND e.evento = 'compra') AS compra_a,
    COUNT(DISTINCT e.sesion_id) FILTER (WHERE s.variante = 'B' AND e.evento = 'carrito') AS carrito_b,
    COUNT(DISTINCT e.sesion_id) FILTER (WHERE s.variante = 'B' AND e.evento = 'compra') AS compra_b
  FROM sesiones_web AS s
  JOIN eventos_web AS e ON e.sesion_id = s.id
),
tasas AS (
  SELECT carrito_a, compra_a, carrito_b, compra_b,
    compra_a * 1.0 / NULLIF(carrito_a, 0) AS pa,
    compra_b * 1.0 / NULLIF(carrito_b, 0) AS pb,
    (compra_a + compra_b) * 1.0 / NULLIF(carrito_a + carrito_b, 0) AS p
  FROM ab
)
SELECT carrito_a, compra_a, carrito_b, compra_b,
  ROUND(pa * 100, 1) AS conv_a,
  ROUND(pb * 100, 1) AS conv_b,
  ROUND((pb - pa) / NULLIF(sqrt(p * (1 - p) * (1.0 / carrito_a + 1.0 / carrito_b)), 0), 2) AS z
FROM tasas;`) },
        { texto: "El z pasa de 1,96: la diferencia no es suerte", prueba: (r) => Number(PRUEBA.valor(r, 0, "z")) > 1.96 }
      ],
      pistas: [
        "Tres pasos: una CTE `ab` con los cuatro recuentos (`COUNT(DISTINCT e.sesion_id) FILTER (WHERE s.variante = 'A' AND e.evento = 'carrito')`…), otra `tasas` con `pa`, `pb` y la `p` combinada (`* 1.0` para no dividir enteros) y, fuera, las conversiones y el z con `sqrt`.",
        "WITH ab AS (SELECT COUNT(DISTINCT e.sesion_id) FILTER (WHERE s.variante = 'A' AND e.evento = 'carrito') AS carrito_a, COUNT(DISTINCT e.sesion_id) FILTER (WHERE s.variante = 'A' AND e.evento = 'compra') AS compra_a, COUNT(DISTINCT e.sesion_id) FILTER (WHERE s.variante = 'B' AND e.evento = 'carrito') AS carrito_b, COUNT(DISTINCT e.sesion_id) FILTER (WHERE s.variante = 'B' AND e.evento = 'compra') AS compra_b FROM sesiones_web AS s JOIN eventos_web AS e ON e.sesion_id = s.id), tasas AS (SELECT carrito_a, compra_a, carrito_b, compra_b, compra_a * 1.0 / carrito_a AS pa, compra_b * 1.0 / carrito_b AS pb, (compra_a + compra_b) * 1.0 / (carrito_a + carrito_b) AS p FROM ab) SELECT carrito_a, compra_a, carrito_b, compra_b, ROUND(pa * 100, 1) AS conv_a, ROUND(pb * 100, 1) AS conv_b, ROUND((pb - pa) / sqrt(p * (1 - p) * (1.0 / carrito_a + 1.0 / carrito_b)), 2) AS z FROM tasas;"
      ],
      solucion: `WITH ab AS (
  SELECT
    COUNT(DISTINCT e.sesion_id) FILTER (WHERE s.variante = 'A' AND e.evento = 'carrito') AS carrito_a,
    COUNT(DISTINCT e.sesion_id) FILTER (WHERE s.variante = 'A' AND e.evento = 'compra') AS compra_a,
    COUNT(DISTINCT e.sesion_id) FILTER (WHERE s.variante = 'B' AND e.evento = 'carrito') AS carrito_b,
    COUNT(DISTINCT e.sesion_id) FILTER (WHERE s.variante = 'B' AND e.evento = 'compra') AS compra_b
  FROM sesiones_web AS s
  JOIN eventos_web AS e ON e.sesion_id = s.id
),
tasas AS (
  SELECT carrito_a, compra_a, carrito_b, compra_b,
    compra_a * 1.0 / NULLIF(carrito_a, 0) AS pa,
    compra_b * 1.0 / NULLIF(carrito_b, 0) AS pb,
    (compra_a + compra_b) * 1.0 / NULLIF(carrito_a + carrito_b, 0) AS p
  FROM ab
)
SELECT carrito_a, compra_a, carrito_b, compra_b,
  ROUND(pa * 100, 1) AS conv_a,
  ROUND(pb * 100, 1) AS conv_b,
  ROUND((pb - pa) / NULLIF(sqrt(p * (1 - p) * (1.0 / carrito_a + 1.0 / carrito_b)), 0), 2) AS z
FROM tasas;`
    }
  ]
});
