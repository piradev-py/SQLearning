CURSO.registrar({
  id: "e3-08",
  titulo: "El orden en que piensa SQL",
  xp: 35,
  objetivo: "Sabrás en qué orden evalúa PostgreSQL las cláusulas de una consulta, por qué un alias no vale en WHERE ni en HAVING pero sí en ORDER BY, y cómo desempatar un top.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "El alias que a veces funciona",
      texto: "He querido sacar las tiendas que facturan más de 100 000 € y he escrito `HAVING facturacion > 100000`, con el alias que pones tú. Error: «no existe la columna facturacion».\nPero en el `ORDER BY facturacion DESC` el mismo alias funciona perfectamente. ¿En qué quedamos?\nY después quiero el **top 5 de productos más vendidos**, que compras me lo pide cada lunes."
    },
    {
      tipo: "explicacion",
      titulo: "Se escribe en un orden, se ejecuta en otro",
      texto: "Escribes la consulta empezando por `SELECT`, pero PostgreSQL no la **piensa** en ese orden. Como en una receta: el título va arriba, pero primero sacas los ingredientes.\nEl orden lógico es:\n**FROM** (de qué tabla) → **WHERE** (qué filas) → **GROUP BY** (qué montones) → **HAVING** (qué montones se quedan) → **SELECT** (qué columnas y cálculos) → **ORDER BY** (en qué orden) → **LIMIT** (cuántas).\nEl ejemplo lleva el número de cada paso en un comentario (el 7 es el `LIMIT` final).",
      ejemplo: `SELECT tienda_id, COUNT(*) AS pedidos  -- 5. columnas y alias
FROM pedidos                           -- 1. la tabla
WHERE estado = 'entregado'             -- 2. filtra filas
GROUP BY tienda_id                     -- 3. hace los montones
HAVING COUNT(*) > 150                  -- 4. filtra montones
ORDER BY pedidos DESC                  -- 6. ordena
LIMIT 3;`,
      consejo: "Cuando una consulta falle y no sepas por qué, léela en este orden y no en el escrito. La mayoría de los errores con agregados y alias se entienden solos."
    },
    {
      tipo: "ordenar",
      enunciado: "Pon las cláusulas en el orden en que PostgreSQL las **evalúa** (no en el que se escriben).",
      elementos: ["FROM", "WHERE", "GROUP BY", "HAVING", "SELECT", "ORDER BY", "LIMIT"],
      pistas: [
        "Lo primero es saber de qué tabla salen las filas, y lo último, cuántas se enseñan.",
        "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT."
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Por qué el alias no vale en WHERE ni en HAVING",
      texto: "Un alias **nace en el SELECT**, que es el paso 5. `WHERE` (2) y `HAVING` (4) se evalúan antes: cuando trabajan, `facturacion` todavía no existe. Por eso en el `HAVING` hay que repetir el agregado: `HAVING SUM(total) > 100000`.\n`ORDER BY` (6) llega después del `SELECT`, así que ya conoce el alias y puedes usarlo sin problema.",
      otrosMotores: "PostgreSQL hace una excepción en el `GROUP BY`, donde también acepta el alias (o el número de columna, `GROUP BY 1`). MySQL lo acepta además en el `HAVING`. No es estándar: si repites la expresión, tu consulta funciona en cualquier motor."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT tienda_id, COUNT(*) AS pedidos
FROM pedidos
GROUP BY tienda_id
ORDER BY pedidos DESC
LIMIT 1;`,
      pregunta: "¿Qué devolverá esta consulta?",
      opciones: [
        "Un error: el alias `pedidos` no existe todavía en el ORDER BY",
        "La tienda 5, con 1 527 pedidos",
        "La tienda 1, porque es la primera"
      ],
      correcta: 1,
      explicacion: "`ORDER BY` se evalúa después del `SELECT`, así que el alias ya existe. Ordena las tiendas de más a menos pedidos y `LIMIT 1`, que va lo último, se queda con la primera: la online."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta es la consulta de Elena. Debería devolver las tiendas que facturan **más de 100 000 €**: columnas `tienda_id` y `facturacion` (la suma de `total`), de mayor a menor facturación. Arréglala.",
      inicial: `SELECT tienda_id, SUM(total) AS facturacion
FROM pedidos
GROUP BY tienda_id
HAVING facturacion > 100000
ORDER BY facturacion DESC;`,
      solucion: `SELECT tienda_id, SUM(total) AS facturacion
FROM pedidos
GROUP BY tienda_id
HAVING SUM(total) > 100000
ORDER BY facturacion DESC;`,
      pistas: [
        "El `HAVING` se evalúa antes que el `SELECT`, donde nace el alias. ¿Qué tienes que escribir en su lugar? El `ORDER BY` puede quedarse como está.",
        "Cambia el alias por el agregado: HAVING SUM(total) > 100000"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Empates en un top",
      texto: "`ORDER BY pedidos DESC` ordena por pedidos, pero si dos clientes **empatan**, PostgreSQL no promete cuál sale antes: puede cambiar de un día a otro. En un informe que se repite cada lunes, eso es un problema.\nLa solución es un **segundo criterio de orden**, separado por coma: `ORDER BY pedidos DESC, cliente_id`. Si empatan en pedidos, va primero el de `cliente_id` más bajo. Así el resultado siempre sale igual.",
      ejemplo: `SELECT cliente_id, COUNT(*) AS pedidos
FROM pedidos
GROUP BY cliente_id
ORDER BY pedidos DESC, cliente_id
LIMIT 10;`,
      consejo: "Antes de entregar un top, mira si hay empates justo en el corte. Si el 5.º y el 6.º empatan, `LIMIT 5` deja fuera a uno sin motivo: avísalo en el informe."
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "El top de los lunes: los **5 productos con más unidades vendidas**, según `lineas_pedido`. Quiero `producto_id` y `unidades` (la suma de `cantidad`), de **más a menos unidades** y, si empatan, primero el de **`producto_id` más bajo**.",
      inicial: "-- Escribe tu consulta aquí\n",
      grafico: true,
      comprobaciones: [
        { texto: "Tiene las columnas producto_id y unidades", prueba: (r) => PRUEBA.columnas(r, ["producto_id", "unidades"]) },
        { texto: "Devuelve 5 productos", prueba: (r) => (r?.filas?.length ?? 0) === 5 },
        { texto: "Los empatados salen por producto_id", prueba: (r) => PRUEBA.valor(r, 1, "producto_id") === 13 && PRUEBA.valor(r, 2, "producto_id") === 32 },
        { texto: "Son los 5 más vendidos, en el orden pedido", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT producto_id, SUM(cantidad) AS unidades
FROM lineas_pedido
GROUP BY producto_id
ORDER BY unidades DESC, producto_id
LIMIT 5;`) }
      ],
      pistas: [
        "Agrupa `lineas_pedido` por `producto_id` y suma `cantidad`. Ordena por dos criterios (unidades de mayor a menor y luego `producto_id`) y corta con `LIMIT`.",
        "SELECT producto_id, SUM(cantidad) AS unidades FROM lineas_pedido GROUP BY producto_id ORDER BY unidades DESC, producto_id LIMIT 5;"
      ],
      solucion: `SELECT producto_id, SUM(cantidad) AS unidades
FROM lineas_pedido
GROUP BY producto_id
ORDER BY unidades DESC, producto_id
LIMIT 5;`
    }
  ]
});
