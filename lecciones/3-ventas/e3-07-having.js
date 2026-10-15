CURSO.registrar({
  id: "e3-07",
  titulo: "Filtrar grupos: HAVING",
  xp: 40,
  objetivo: "Sabrás quedarte solo con los grupos que cumplen una condición sobre un agregado con HAVING, y distinguirás cuándo filtrar con WHERE y cuándo con HAVING.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "Los mejores clientes",
      texto: "Marketing quiere premiar a los clientes más fieles: los que nos han hecho **más de 15 pedidos**. Y compras me pide los productos que han vendido **más de 130 unidades**, para no quedarse sin stock.\nHe intentado poner `WHERE COUNT(*) > 15` y PostgreSQL me ha devuelto un error que no entiendo. ¿Me lo miras?"
    },
    {
      tipo: "explicacion",
      titulo: "WHERE no sabe contar grupos",
      texto: "Recuerda los montones de fichas. **WHERE** trabaja **antes** de hacer los montones: mira las filas una a una y decide cuáles entran. En ese momento todavía no hay grupos, así que no hay nada que contar.\nPor eso `WHERE COUNT(*) > 15` da error: «no se permiten funciones de agregación en WHERE» (otra vez el código 42803).\nPara filtrar **montones ya hechos** hace falta otra cláusula."
    },
    {
      tipo: "explicacion",
      titulo: "HAVING: el filtro de los grupos",
      texto: "**HAVING** va justo después del `GROUP BY` y filtra **grupos**: se queda con los que cumplen una condición sobre un agregado.\nEl ejemplo cuenta los pedidos de cada método de pago y solo deja los que pasan de 500.\nOjo a un detalle de PostgreSQL: en el `HAVING` se **repite el agregado** (`COUNT(*) > 500`); el alias `pedidos` todavía no vale ahí. En la diligencia siguiente verás por qué.",
      ejemplo: `SELECT metodo_pago, COUNT(*) AS pedidos
FROM pedidos
GROUP BY metodo_pago
HAVING COUNT(*) > 500
ORDER BY pedidos DESC;`,
      otrosMotores: "MySQL sí deja usar el alias en el `HAVING` (`HAVING pedidos > 500`). En PostgreSQL, SQL Server u Oracle da error: repite el agregado y funcionará en todos."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT tienda_id, COUNT(*) AS pedidos
FROM pedidos
GROUP BY tienda_id
HAVING COUNT(*) > 200;`,
      pregunta: "Las tiendas tienen 429 (Madrid), 187 (Valencia), 225 (Sevilla), 156 (Bilbao) y 1 527 (Online) pedidos. ¿Cuántas filas devolverá?",
      opciones: ["5", "3", "2"],
      correcta: 1,
      explicacion: "Pasan el filtro los grupos con más de 200 pedidos: Madrid, Sevilla y la tienda online. Valencia y Bilbao se quedan fuera. HAVING no cambia los números de cada grupo: solo decide qué grupos se ven."
    },
    {
      tipo: "ejercicio",
      enunciado: "Para compras: en la tabla `lineas_pedido`, suma la `cantidad` vendida de cada producto y quédate con los que pasan de **130 unidades**. Columnas `producto_id` y `unidades`, ordenadas de **más a menos** unidades.",
      solucion: `SELECT producto_id, SUM(cantidad) AS unidades
FROM lineas_pedido
GROUP BY producto_id
HAVING SUM(cantidad) > 130
ORDER BY unidades DESC;`,
      grafico: true,
      pistas: [
        "Agrupa `lineas_pedido` por `producto_id`, suma `cantidad` y filtra los grupos con `HAVING SUM(cantidad) > 130`.",
        "SELECT producto_id, SUM(cantidad) AS unidades FROM lineas_pedido GROUP BY producto_id HAVING SUM(cantidad) > 130 ORDER BY unidades DESC;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "WHERE y HAVING juntos",
      texto: "No compiten: cada uno filtra en su momento.\n- **WHERE** elige las **filas** que entran en los montones (antes de agrupar).\n- **HAVING** elige los **montones** que salen (después de agrupar).\nEl ejemplo busca clientes que compran mucho **online**: el `WHERE` deja solo los pedidos de la tienda 5, se agrupa por cliente y el `HAVING` se queda con quien tiene más de 8.",
      ejemplo: `SELECT cliente_id, COUNT(*) AS pedidos_online
FROM pedidos
WHERE tienda_id = 5
GROUP BY cliente_id
HAVING COUNT(*) > 8
ORDER BY pedidos_online DESC;`,
      consejo: "Si una condición se puede comprobar en cada fila (la tienda, el estado, el método de pago), ponla en el `WHERE`. Descarta filas antes de agrupar y la consulta trabaja menos. Deja el `HAVING` para lo que solo se sabe después de contar o sumar."
    },
    {
      tipo: "quiz",
      pregunta: "Elena quiere las tiendas cuyos pedidos **pagados con bizum** suman **más de 50 000 €**. ¿Dónde va cada condición?",
      opciones: [
        "Las dos en el `WHERE`",
        "`metodo_pago = 'bizum'` en el `WHERE` y `SUM(total) > 50000` en el `HAVING`",
        "`metodo_pago = 'bizum'` en el `HAVING` y `SUM(total) > 50000` en el `WHERE`"
      ],
      correcta: 1,
      explicacion: "El método de pago se mira en cada pedido, antes de agrupar: `WHERE`. La suma solo existe cuando el montón de cada tienda está hecho: `HAVING`. La tercera opción da error, porque `WHERE` no admite agregados."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería mostrar los clientes con **más de 20 pedidos**: columnas `cliente_id` y `pedidos`. Da error. Arréglala.",
      inicial: `SELECT cliente_id, COUNT(*) AS pedidos
FROM pedidos
WHERE COUNT(*) > 20
GROUP BY cliente_id;`,
      solucion: `SELECT cliente_id, COUNT(*) AS pedidos
FROM pedidos
GROUP BY cliente_id
HAVING COUNT(*) > 20;`,
      pistas: [
        "La condición habla de un recuento de cada cliente, que solo existe después de agrupar. ¿Qué cláusula filtra grupos? ¿Y dónde va?",
        "Quita el WHERE y añade HAVING tras el GROUP BY: SELECT cliente_id, COUNT(*) AS pedidos FROM pedidos GROUP BY cliente_id HAVING COUNT(*) > 20;"
      ]
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "Lo de marketing: los clientes con **más de 15 pedidos**. Quiero `cliente_id`, `pedidos` (cuántos tiene) y `facturacion` (la suma de sus `total`), ordenados de **más a menos pedidos**.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas cliente_id, pedidos y facturacion", prueba: (r) => PRUEBA.columnas(r, ["cliente_id", "pedidos", "facturacion"]) },
        { texto: "Encuentra a los 47 clientes con más de 15 pedidos", prueba: (r) => (r?.filas?.length ?? 0) === 47 },
        { texto: "Está ordenado de más a menos pedidos", prueba: (r) => PRUEBA.ordenado(r, "pedidos", "desc") },
        { texto: "Los recuentos y las sumas son los de cada cliente", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT cliente_id, COUNT(*) AS pedidos, SUM(total) AS facturacion
FROM pedidos
GROUP BY cliente_id
HAVING COUNT(*) > 15
ORDER BY pedidos DESC;`) }
      ],
      pistas: [
        "Agrupa por `cliente_id`, calcula `COUNT(*)` y `SUM(total)`, filtra los grupos con `HAVING COUNT(*) > 15` y ordena por `pedidos DESC`.",
        "SELECT cliente_id, COUNT(*) AS pedidos, SUM(total) AS facturacion FROM pedidos GROUP BY cliente_id HAVING COUNT(*) > 15 ORDER BY pedidos DESC;"
      ],
      solucion: `SELECT cliente_id, COUNT(*) AS pedidos, SUM(total) AS facturacion
FROM pedidos
GROUP BY cliente_id
HAVING COUNT(*) > 15
ORDER BY pedidos DESC;`
    }
  ]
});
