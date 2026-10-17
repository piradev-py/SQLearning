CURSO.registrar({
  id: "e3-03",
  titulo: "Los extremos: MIN y MAX",
  xp: 30,
  objetivo: "Sabrás encontrar el valor más pequeño y el más grande de una columna con MIN y MAX, con números, fechas y textos, y juntar varios agregados en un mismo SELECT.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "Los récords que siempre me preguntan",
      texto: "En cada comité alguien pregunta lo mismo: **¿cuál ha sido el pedido más grande que hemos tenido?** ¿Y el más pequeño? ¿Y desde cuándo tenemos datos de ventas?\nQuiero llevar esos extremos en una diapositiva, todos juntos. ¿Me los sacas?"
    },
    {
      tipo: "explicacion",
      titulo: "MIN y MAX: el más pequeño y el más grande",
      texto: "**MIN(columna)** devuelve el valor más pequeño de la columna y **MAX(columna)** el más grande. Como los demás agregados, resumen toda la tabla (o lo que deje pasar el `WHERE`) en un solo valor y se saltan los NULL.\nPuedes poner **varios agregados en el mismo `SELECT`**, separados por comas: el resultado sigue siendo **una fila**, con una columna por agregado. En el ejemplo, el producto más barato y el más caro del catálogo.",
      ejemplo: `SELECT MIN(precio) AS mas_barato,
  MAX(precio) AS mas_caro
FROM productos;`,
      consejo: "MIN y MAX son mi primera prueba de calidad con una tabla nueva. Un precio mínimo negativo, un stock imposible o una fecha del año 1900 te avisan de que algo falla antes de que lo descubra el comité."
    },
    {
      tipo: "interpretar",
      pregunta: "¿Cuántos euros costó el **pedido más caro** de Faro? Mira la columna `total` de `pedidos` y escribe solo el número.",
      respuesta: 4404,
      tolerancia: 0.005,
      pistas: [
        "El valor más grande de la columna `total`: `MAX(total)`.",
        "SELECT MAX(total) FROM pedidos;"
      ],
      solucion: `SELECT MAX(total) AS mas_caro
FROM pedidos;`
    },
    {
      tipo: "ejercicio",
      enunciado: "En `lineas_pedido`, ¿a qué precio se ha vendido la unidad más barata y la más cara? Devuelve una fila con dos columnas: `precio_minimo` (el mínimo de `precio_unitario`) y `precio_maximo` (el máximo).",
      solucion: `SELECT MIN(precio_unitario) AS precio_minimo,
  MAX(precio_unitario) AS precio_maximo
FROM lineas_pedido;`,
      pistas: [
        "Dos agregados en el mismo `SELECT`, separados por coma: `MIN(precio_unitario)` y `MAX(precio_unitario)`, cada uno con su alias.",
        "SELECT MIN(precio_unitario) AS precio_minimo, MAX(precio_unitario) AS precio_maximo FROM lineas_pedido;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "También con fechas y textos",
      texto: "MIN y MAX funcionan con todo lo que se puede ordenar:\n- **Fechas:** MIN es la más antigua y MAX la más reciente.\n- **Textos:** MIN es el primero en orden alfabético y MAX el último (por código de carácter, así que las letras con tilde van al final).\nDesde esta etapa, `pedidos` trae la columna `mes` (`'2026-08'`), la que ya traen las exportaciones de ventas. Es texto, pero como va año-mes con ceros delante, el orden alfabético coincide con el cronológico: el ejemplo te dice el primer y el último mes con ventas.",
      ejemplo: `SELECT MIN(mes) AS primer_mes,
  MAX(mes) AS ultimo_mes
FROM pedidos;`
    },
    {
      tipo: "quiz",
      pregunta: "Elena quiere saber **qué cliente** hizo el pedido más caro. ¿Qué consulta le da esa respuesta?",
      opciones: [
        "`SELECT MAX(total) FROM pedidos;`",
        "`SELECT cliente_id, total FROM pedidos ORDER BY total DESC LIMIT 1;`",
        "`SELECT MAX(cliente_id) FROM pedidos;`"
      ],
      correcta: 1,
      explicacion: "`MAX(total)` te da el **valor** más alto, pero no la fila de la que sale. Para ver la fila completa sigue valiendo lo que ya sabes: ordenar de mayor a menor y quedarte con la primera. Y `MAX(cliente_id)` es el número de cliente más alto, que no tiene nada que ver con el importe.\nY no pruebes `SELECT cliente_id, MAX(total) FROM pedidos;`: da error, porque PostgreSQL no sabe qué `cliente_id` poner junto a un valor que resume muchas filas. Lo entenderás bien dentro de unos niveles."
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "La diapositiva de récords, en **una sola fila** con cuatro columnas, en este orden: `primer_pedido` (la `fecha` más antigua de `pedidos`), `ultimo_pedido` (la más reciente), `mas_barato` (el `total` más bajo) y `mas_caro` (el `total` más alto).",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas primer_pedido, ultimo_pedido, mas_barato y mas_caro", prueba: (r) => PRUEBA.columnas(r, ["primer_pedido", "ultimo_pedido", "mas_barato", "mas_caro"]) },
        { texto: "Los importes del pedido más barato y del más caro son los correctos", prueba: (r) => (r?.filas?.length ?? 0) === 1
          && Math.abs((PRUEBA.valor(r, 0, "mas_barato") ?? -1) - 12.9) < 0.005
          && Math.abs((PRUEBA.valor(r, 0, "mas_caro") ?? -1) - 4404) < 0.005 },
        { texto: "Las fechas del primer y el último pedido son correctas", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT MIN(fecha) AS primer_pedido,
  MAX(fecha) AS ultimo_pedido,
  MIN(total) AS mas_barato,
  MAX(total) AS mas_caro
FROM pedidos;`) },
        { texto: "Mira todos los pedidos, sin filtrar con WHERE (los récords son de toda la tabla)", prueba: () => !/\bwhere\b/i.test(PRUEBA.codigo()) }
      ],
      pistas: [
        "Cuatro agregados en el mismo `SELECT`: `MIN` y `MAX` de `fecha`, y `MIN` y `MAX` de `total`, cada uno con su alias y en el orden pedido.",
        "SELECT MIN(fecha) AS primer_pedido, MAX(fecha) AS ultimo_pedido, MIN(total) AS mas_barato, MAX(total) AS mas_caro FROM pedidos;"
      ],
      solucion: `SELECT MIN(fecha) AS primer_pedido,
  MAX(fecha) AS ultimo_pedido,
  MIN(total) AS mas_barato,
  MAX(total) AS mas_caro
FROM pedidos;`
    }
  ]
});
