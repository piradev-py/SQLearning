CURSO.registrar({
  id: "e8-11",
  titulo: "Contarlo bien: el informe",
  xp: 45,
  objetivo: "Sabrás convertir resultados en un informe claro y honesto: estructura (pregunta, respuesta, cifras, método y límites), redondeo y frases con ||, consultas de control que cuadran las partes con el total y gráficos que no engañan.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "Barcelona, en una página",
      texto: "El consejo va a preguntar por **Barcelona**: hemos invertido mucho y lleva dos semanas abierta. Quiero **una página**: cómo ha arrancado, comparada con las otras tiendas físicas, y qué podemos decir y qué no con tan poco tiempo.\nNada de tablas de cuarenta filas. Si no lo entiendo en un minuto, el consejo tampoco."
    },
    {
      tipo: "explicacion",
      titulo: "De la tabla a la frase",
      texto: "Un buen informe sigue siempre el mismo orden:\n1. **La pregunta** que te hicieron.\n2. **La respuesta en una frase**, al principio (no al final, como una novela).\n3. **Las cifras clave**, pocas y redondeadas (nadie lee 8 decimales).\n4. **Cómo se calculó**: definiciones y filtros.\n5. **Los límites**: lo que estos datos **no** permiten decir.\nSQL también ayuda a redactar: con `||` juntas texto y números, y con `ROUND` los dejas legibles.",
      ejemplo: `SELECT 'Barcelona: ' || COUNT(*) || ' pedidos y '
  || ROUND(SUM(total) FILTER (WHERE estado NOT IN ('cancelado', 'reembolsado')), 0)
  || ' € netos del 1 al 14 de octubre' AS frase
FROM pedidos
WHERE tienda_id = 6;`
    },
    {
      tipo: "ordenar",
      enunciado: "Ordena las partes del informe de Barcelona tal y como deben aparecer en la página.",
      elementos: [
        "La pregunta: ¿cómo ha arrancado Barcelona?",
        "La respuesta en una frase",
        "Las cifras clave: pedidos, facturación, ticket medio",
        "Cómo se calculó: facturación neta, del 1 al 14 de octubre",
        "Los límites: solo dos semanas de datos"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Cuadrar antes de enviar",
      texto: "Antes de mandar un informe, **cuadra**: una consulta de control que compruebe que la suma de las partes da el total. Si las tiendas suman distinto que el total, hay un filtro distinto en algún sitio (o un `JOIN` que duplica filas).\nEl ejemplo suma la facturación neta de octubre tienda a tienda y la compara con la de todo octubre: las dos columnas deben dar **49 505,85 €** y la diferencia, 0.",
      ejemplo: `-- Facturación neta: sin pedidos cancelados ni reembolsados
WITH por_tienda AS (
  SELECT tienda_id, SUM(total) AS facturacion
  FROM pedidos
  WHERE fecha >= '2026-10-01'
    AND estado NOT IN ('cancelado', 'reembolsado')
  GROUP BY tienda_id
),
octubre AS (
  SELECT SUM(total) AS facturacion
  FROM pedidos
  WHERE fecha >= '2026-10-01'
    AND estado NOT IN ('cancelado', 'reembolsado')
)
SELECT (SELECT SUM(facturacion) FROM por_tienda) AS suma_tiendas,
  o.facturacion AS total_octubre,
  (SELECT SUM(facturacion) FROM por_tienda) - o.facturacion AS diferencia
FROM octubre AS o;`,
      consejo: "Deja en la consulta comentarios `--` con las definiciones y los supuestos («facturación neta: sin cancelados ni reembolsados»). Dentro de seis meses, la persona que la vuelva a ejecutar (quizá tú) lo agradecerá. Y en los gráficos: barras que empiezan en **cero** y nada de tartas de doce porciones."
    },
    {
      tipo: "quiz",
      pregunta: "Repartes los pedidos entre tres tiendas y, redondeados a 1 decimal, los porcentajes suman **99,9 %**. ¿Qué haces?",
      opciones: [
        "Lo dejo así y añado una nota: «los porcentajes pueden no sumar 100 por el redondeo»",
        "Subo uno de ellos a mano para que sume 100",
        "Quito el decimal y redondeo hasta que cuadre"
      ],
      correcta: 0,
      explicacion: "Los redondeos no siempre suman 100, y es normal. Tocar una cifra a mano para que cuadre es **maquillar**: cualquiera que repita el cálculo verá una cifra distinta de la tuya. Se dice en una nota y en paz."
    },
    {
      tipo: "interpretar",
      pregunta: "Para la frase de cabecera: ¿qué **%** de **todos** los pedidos de Faro del 1 al 14 de octubre de 2026 (cualquier estado, todas las tiendas) se han hecho en Barcelona (tienda 6)? Redondea a 1 decimal.",
      respuesta: 36.5,
      tolerancia: 0.05,
      pistas: [
        "Filtra `fecha >= '2026-10-01'` (los datos acaban el 14) y calcula `COUNT(*) FILTER (WHERE tienda_id = 6) * 100.0 / COUNT(*)`.",
        "SELECT ROUND(COUNT(*) FILTER (WHERE tienda_id = 6) * 100.0 / COUNT(*), 1) FROM pedidos WHERE fecha >= '2026-10-01' AND fecha < '2026-10-15'; da 36,5."
      ],
      solucion: `SELECT ROUND(COUNT(*) FILTER (WHERE tienda_id = 6) * 100.0 / NULLIF(COUNT(*), 0), 1) AS pct_barcelona
FROM pedidos
WHERE fecha >= '2026-10-01' AND fecha < '2026-10-15';`
    },
    {
      tipo: "reto",
      de: "ana",
      enunciado: "La tabla de la página: las **tiendas físicas** (todas menos la online, `tienda_id` 5) del **1 al 14 de octubre de 2026** (`fecha` desde el 2026-10-01 y antes del 2026-10-15), para comparar Barcelona con las demás **en las mismas fechas**: `tienda` (la `ciudad` de `tiendas`), `pedidos` (todos), `facturacion` (suma de `total` neta: sin `cancelado` ni `reembolsado`), `ticket_medio` (media de `total` neta, redondeada a 2) y `pct_nuevos` (de los clientes distintos de esa tienda en esas fechas, el % cuyo **primer pedido de siempre**, en cualquier tienda y estado, es del 2026-10-01 o posterior; redondeado a 1). De más a menos `facturacion`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas tienda, pedidos, facturacion, ticket_medio y pct_nuevos", prueba: (r) => PRUEBA.columnas(r, ["tienda", "pedidos", "facturacion", "ticket_medio", "pct_nuevos"]) },
        { texto: "Está ordenado de más a menos facturación", prueba: (r) => (r?.filas?.length ?? 0) > 0 && PRUEBA.ordenado(r, "facturacion", "desc") },
        { texto: "Cada tienda física con sus cifras de esas dos semanas y su % de clientes nuevos", prueba: (r, db) => PRUEBA.igualA(r, db, `WITH primera AS (
  SELECT cliente_id, MIN(fecha) AS primera
  FROM pedidos
  GROUP BY cliente_id
)
SELECT t.ciudad AS tienda,
  COUNT(*) AS pedidos,
  SUM(p.total) FILTER (WHERE p.estado NOT IN ('cancelado', 'reembolsado')) AS facturacion,
  ROUND(AVG(p.total) FILTER (WHERE p.estado NOT IN ('cancelado', 'reembolsado')), 2) AS ticket_medio,
  ROUND(COUNT(DISTINCT p.cliente_id) FILTER (WHERE pr.primera >= '2026-10-01') * 100.0
    / NULLIF(COUNT(DISTINCT p.cliente_id), 0), 1) AS pct_nuevos
FROM pedidos AS p
JOIN tiendas AS t ON t.id = p.tienda_id
JOIN primera AS pr ON pr.cliente_id = p.cliente_id
WHERE p.fecha >= '2026-10-01' AND p.fecha < '2026-10-15'
  AND p.tienda_id <> 5
GROUP BY t.id, t.ciudad
ORDER BY facturacion DESC;`) }
      ],
      pistas: [
        "Una CTE `primera` con el `MIN(fecha)` de cada cliente (de **todos** sus pedidos, sin filtrar). Después une `pedidos AS p` con `tiendas` y con `primera`, filtra fechas y `tienda_id <> 5`, y agrupa por tienda. El % de nuevos: `COUNT(DISTINCT p.cliente_id) FILTER (WHERE pr.primera >= '2026-10-01') * 100.0 / COUNT(DISTINCT p.cliente_id)`.",
        "WITH primera AS (SELECT cliente_id, MIN(fecha) AS primera FROM pedidos GROUP BY cliente_id) SELECT t.ciudad AS tienda, COUNT(*) AS pedidos, SUM(p.total) FILTER (WHERE p.estado NOT IN ('cancelado', 'reembolsado')) AS facturacion, ROUND(AVG(p.total) FILTER (WHERE p.estado NOT IN ('cancelado', 'reembolsado')), 2) AS ticket_medio, ROUND(COUNT(DISTINCT p.cliente_id) FILTER (WHERE pr.primera >= '2026-10-01') * 100.0 / NULLIF(COUNT(DISTINCT p.cliente_id), 0), 1) AS pct_nuevos FROM pedidos AS p JOIN tiendas AS t ON t.id = p.tienda_id JOIN primera AS pr ON pr.cliente_id = p.cliente_id WHERE p.fecha >= '2026-10-01' AND p.fecha < '2026-10-15' AND p.tienda_id <> 5 GROUP BY t.id, t.ciudad ORDER BY facturacion DESC;"
      ],
      solucion: `-- Facturación y ticket netos: sin pedidos cancelados ni reembolsados
WITH primera AS (
  SELECT cliente_id, MIN(fecha) AS primera
  FROM pedidos
  GROUP BY cliente_id
)
SELECT t.ciudad AS tienda,
  COUNT(*) AS pedidos,
  SUM(p.total) FILTER (WHERE p.estado NOT IN ('cancelado', 'reembolsado')) AS facturacion,
  ROUND(AVG(p.total) FILTER (WHERE p.estado NOT IN ('cancelado', 'reembolsado')), 2) AS ticket_medio,
  ROUND(COUNT(DISTINCT p.cliente_id) FILTER (WHERE pr.primera >= '2026-10-01') * 100.0
    / NULLIF(COUNT(DISTINCT p.cliente_id), 0), 1) AS pct_nuevos
FROM pedidos AS p
JOIN tiendas AS t ON t.id = p.tienda_id
JOIN primera AS pr ON pr.cliente_id = p.cliente_id
WHERE p.fecha >= '2026-10-01' AND p.fecha < '2026-10-15'
  AND p.tienda_id <> 5
GROUP BY t.id, t.ciudad
ORDER BY facturacion DESC;`
    }
  ]
});
