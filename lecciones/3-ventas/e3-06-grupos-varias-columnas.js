CURSO.registrar({
  id: "e3-06",
  titulo: "Grupos por varias columnas",
  xp: 35,
  objetivo: "Sabrás agrupar por mes, combinar varias columnas en el GROUP BY, ordenar los grupos por un agregado y dibujar la evolución en un gráfico de líneas.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "¿Vamos a más o a menos?",
      texto: "La tabla por tiendas ha gustado. Ahora el comité pregunta lo de siempre: **¿cómo evolucionan las ventas mes a mes?** Y, ya puestos, quieren verlo **por tienda**, para saber quién tira del carro.\nNo me vale un número por tienda: necesito ver la película entera, desde 2024 hasta hoy."
    },
    {
      tipo: "explicacion",
      titulo: "Agrupar por mes",
      texto: "La tabla `pedidos` trae una columna `mes` con el año y el mes como texto, por ejemplo `'2026-08'`: es la que ya traen las exportaciones de ventas. Más adelante aprenderás a sacarla tú de la fecha.\nAgrupar por ella es igual que agrupar por tienda: un grupo por mes. Y como el texto empieza por el año, `ORDER BY mes` los pone en orden cronológico.\nEn el gráfico, cuando las etiquetas son meses, se dibuja una **línea**: de los 45 pedidos de enero de 2024 a los 202 de septiembre de 2026.",
      ejemplo: `SELECT mes, COUNT(*) AS pedidos
FROM pedidos
GROUP BY mes
ORDER BY mes;`,
      grafico: true
    },
    {
      tipo: "ejercicio",
      enunciado: "Saca la **facturación de cada mes**: las columnas `mes` y `facturacion` (la suma de `total`), ordenadas por `mes` de más antiguo a más reciente. Mira la línea en el gráfico.",
      solucion: `SELECT mes, SUM(total) AS facturacion
FROM pedidos
GROUP BY mes
ORDER BY mes;`,
      grafico: true,
      pistas: [
        "Como el ejemplo, pero con `SUM(total) AS facturacion` en lugar del recuento.",
        "SELECT mes, SUM(total) AS facturacion FROM pedidos GROUP BY mes ORDER BY mes;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Varias columnas: un grupo por combinación",
      texto: "Si pones dos columnas en el `GROUP BY`, se hace un montón por cada **combinación** de valores: tienda 1 entregados, tienda 1 cancelados, tienda 2 entregados…\nLa regla de oro sigue igual: las dos columnas van en el `GROUP BY` y en el `SELECT`, y todo lo demás, dentro de un agregado. Se separan con comas, como en el `SELECT`.",
      ejemplo: `SELECT tienda_id, estado, COUNT(*) AS pedidos
FROM pedidos
GROUP BY tienda_id, estado
ORDER BY tienda_id, estado;`,
      consejo: "Lee el `GROUP BY` como «por»: «pedidos **por** tienda y estado». Si al contarle la consulta a Elena dices «por» dos veces, necesitas dos columnas."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT tienda_id, metodo_pago, COUNT(*) AS pedidos
FROM pedidos
GROUP BY tienda_id, metodo_pago
ORDER BY tienda_id, metodo_pago;`,
      pregunta: "En la tienda online no se puede pagar en efectivo. ¿Aparecerá una fila con `tienda_id` 5 y `efectivo`?",
      opciones: [
        "Sí, con 0 pedidos",
        "No: solo salen las combinaciones que existen en la tabla",
        "Da error, porque falta un agregado"
      ],
      correcta: 1,
      explicacion: "GROUP BY hace montones con las filas que hay. Como ningún pedido online se pagó en efectivo, ese montón no existe y no sale ni con un 0. Recuérdalo: un grupo vacío **no aparece** en el resultado."
    },
    {
      tipo: "explicacion",
      titulo: "Ordenar los grupos por un agregado",
      texto: "Lo normal es querer los grupos **más grandes primero**. Puedes ordenar por el alias del agregado, igual que por cualquier columna: `ORDER BY pedidos DESC`.\nEl ejemplo responde a «¿qué combinaciones de tienda y método de pago mueven más pedidos?» y se queda con las 5 primeras.",
      ejemplo: `SELECT tienda_id, metodo_pago, COUNT(*) AS pedidos
FROM pedidos
GROUP BY tienda_id, metodo_pago
ORDER BY pedidos DESC
LIMIT 5;`,
      consejo: "Ordena por el alias (`pedidos`) en lugar de repetir `COUNT(*)`: se lee mejor y, si mañana cambias el cálculo, solo lo cambias en un sitio."
    },
    {
      tipo: "explicacion",
      titulo: "Una línea por tienda",
      texto: "Si el resultado tiene **tres columnas** y la primera se repite (`mes`, `tienda_id`, `pedidos`), el gráfico dibuja **una línea por cada valor de la segunda**: una por tienda. Así se comparan de un vistazo (caben hasta 5 líneas).\nEl orden de las columnas importa: primero lo que va en el eje (el mes), después lo que separa las líneas (la tienda) y al final el número.",
      ejemplo: `SELECT mes, tienda_id, COUNT(*) AS pedidos
FROM pedidos
GROUP BY mes, tienda_id
ORDER BY mes, tienda_id;`,
      grafico: true
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "Para el comité solo cuentan las ventas cerradas. Quiero la **facturación de los pedidos entregados** (`estado = 'entregado'`) **por mes y tienda**: las columnas `mes`, `tienda_id` y `facturacion` (la suma de `total`), ordenadas por `mes` y, dentro de cada mes, por `tienda_id`. Míralo en el gráfico.",
      inicial: "-- Escribe tu consulta aquí\n",
      grafico: true,
      comprobaciones: [
        { texto: "Tiene las columnas mes, tienda_id y facturacion", prueba: (r) => PRUEBA.columnas(r, ["mes", "tienda_id", "facturacion"]) },
        { texto: "Está ordenado por mes", prueba: (r) => (r?.filas?.length ?? 0) > 0 && PRUEBA.ordenado(r, "mes", "asc") },
        { texto: "Solo cuenta los pedidos entregados, un grupo por mes y tienda", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT mes, tienda_id, SUM(total) AS facturacion
FROM pedidos
WHERE estado = 'entregado'
GROUP BY mes, tienda_id
ORDER BY mes, tienda_id;`) }
      ],
      pistas: [
        "Primero filtra con `WHERE estado = 'entregado'`, después `GROUP BY mes, tienda_id` y, al final, `ORDER BY mes, tienda_id`.",
        "SELECT mes, tienda_id, SUM(total) AS facturacion FROM pedidos WHERE estado = 'entregado' GROUP BY mes, tienda_id ORDER BY mes, tienda_id;"
      ],
      solucion: `SELECT mes, tienda_id, SUM(total) AS facturacion
FROM pedidos
WHERE estado = 'entregado'
GROUP BY mes, tienda_id
ORDER BY mes, tienda_id;`
    }
  ]
});
