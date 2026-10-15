CURSO.registrar({
  id: "e3-02",
  titulo: "Sumar y promediar: SUM, AVG y ROUND",
  xp: 30,
  objetivo: "Sabrás sumar una columna con SUM, calcular medias con AVG (como el ticket medio) y redondear el resultado con ROUND.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "¿Cuánto vendemos y cuánto gasta cada cliente?",
      texto: "Lo de contar pedidos está muy bien, pero en el comité la primera pregunta siempre es otra: **¿cuánto dinero hemos facturado?**\nY la segunda: **¿cuánto gasta de media un cliente en cada compra?** Lo que en ventas llamamos el **ticket medio**.\nY por favor, en euros y céntimos: nada de números con quince decimales."
    },
    {
      tipo: "explicacion",
      titulo: "SUM: sumar una columna",
      texto: "**SUM(columna)** suma todos los valores de esa columna y devuelve un solo número, como el «Σ Autosuma» de Excel.\nEl ejemplo suma el `total` de todos los pedidos. Ojo: son **todos**, también los cancelados y los reembolsados. Si solo quieres unos, fíltralos antes con `WHERE`, igual que con COUNT.",
      ejemplo: `SELECT SUM(total) AS facturacion
FROM pedidos;`,
      consejo: "Antes de dar una cifra de facturación, pregunta qué cuenta como venta: ¿entran los cancelados? ¿y los reembolsados? Cada empresa lo define a su manera. Escríbelo siempre junto al número."
    },
    {
      tipo: "explicacion",
      titulo: "Una tabla nueva: lineas_pedido",
      texto: "Para ventas, Lucía te ha dado acceso a `lineas_pedido`: el **detalle** de cada pedido, como las líneas de un ticket de caja. Cada fila es un producto dentro de un pedido:\n- `pedido_id`: de qué pedido es la línea.\n- `producto_id`: qué producto.\n- `cantidad`: cuántas unidades.\n- `precio_unitario`: a cuánto se vendió cada una.\nUn pedido con tres productos distintos tiene tres líneas.",
      ejemplo: `SELECT *
FROM lineas_pedido
WHERE pedido_id = 1;`
    },
    {
      tipo: "ejercicio",
      enunciado: "Elena quiere saber cuántas **unidades** de producto ha vendido Faro en total. Suma la columna `cantidad` de `lineas_pedido` y llama al resultado `unidades`.",
      solucion: `SELECT SUM(cantidad) AS unidades
FROM lineas_pedido;`,
      pistas: [
        "`SUM` sobre la columna `cantidad`, en la tabla `lineas_pedido`, con el alias `unidades`.",
        "SELECT SUM(cantidad) AS unidades FROM lineas_pedido;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `SELECT SUM(total) AS facturacion_barcelona
FROM pedidos
WHERE tienda_id = 6;`,
      pregunta: "Barcelona (`tienda_id` 6) aún no tiene pedidos. En el nivel anterior, `COUNT(*)` daba 0. ¿Qué dará `SUM(total)`?",
      opciones: ["0", "NULL (una casilla vacía)", "Un error"],
      correcta: 1,
      explicacion: "Sorpresa: **NULL**. COUNT de nada es 0, pero la suma de nada es «no hay dato». SUM, AVG, MIN y MAX devuelven NULL cuando no les llega ninguna fila. Tenlo en cuenta en un informe: una casilla vacía no es lo mismo que 0 €. Más adelante aprenderás a cambiar ese NULL por un 0."
    },
    {
      tipo: "explicacion",
      titulo: "AVG y ROUND: la media, redondeada",
      texto: "**AVG(columna)** calcula la media: suma los valores y divide entre cuántos hay (los NULL no cuentan).\nEl ticket medio es eso: `AVG(total)`. El problema es que la media suele salir con muchos decimales. **ROUND(valor, 2)** la redondea a 2 decimales; con `ROUND(valor)` a secas, redondea a un número entero.\nEn el ejemplo verás las dos versiones del precio medio de los productos.",
      ejemplo: `SELECT AVG(precio) AS precio_medio,
  ROUND(AVG(precio), 2) AS precio_medio_redondeado
FROM productos;`,
      consejo: "Redondea solo al final, para presentar. Si redondeas cada valor antes de sumarlo o promediarlo, los céntimos se acumulan y la cifra deja de cuadrar con contabilidad.",
      otrosMotores: "En PostgreSQL, `ROUND(x, 2)` funciona con números `numeric` (como `total` o `precio`). Con números de coma flotante (`double precision`) da error: hay que convertirlos antes, cosa que verás más adelante. MySQL y SQL Server aceptan `ROUND(x, 2)` con cualquier número."
    },
    {
      tipo: "interpretar",
      pregunta: "¿Cuál es el **ticket medio** de todos los pedidos de Faro (todos los estados), redondeado a 2 decimales? Escribe solo el número.",
      respuesta: 406.23,
      tolerancia: 0.005,
      pistas: [
        "La media de la columna `total` de `pedidos`, redondeada con `ROUND(…, 2)`.",
        "SELECT ROUND(AVG(total), 2) FROM pedidos;"
      ],
      solucion: `SELECT ROUND(AVG(total), 2) AS ticket_medio
FROM pedidos;`
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería dar el ticket medio de la tienda online (`tienda_id` 5) **con 2 decimales**, en una columna `ticket_online`, pero sale un número entero. Arréglala.",
      inicial: `SELECT ROUND(AVG(total)) AS ticket_online
FROM pedidos
WHERE tienda_id = 5;`,
      solucion: `SELECT ROUND(AVG(total), 2) AS ticket_online
FROM pedidos
WHERE tienda_id = 5;`,
      pistas: [
        "`ROUND` sin segundo número redondea a entero. ¿Cuántos decimales quieres?",
        "Cambia `ROUND(AVG(total))` por `ROUND(AVG(total), 2)`."
      ]
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "Para el comité solo cuento lo que de verdad ha llegado al cliente: los pedidos con `estado` **entregado**. Necesito una fila con dos columnas: `facturacion` (la suma de `total`) y `ticket_medio` (la media de `total`, **redondeada a 2 decimales**).",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas facturacion y ticket_medio", prueba: (r) => PRUEBA.columnas(r, ["facturacion", "ticket_medio"]) },
        { texto: "La facturación es la suma de los pedidos entregados", prueba: async (r, db) => {
          const e = await db.consulta(`SELECT SUM(total) AS facturacion
FROM pedidos
WHERE estado = 'entregado';`);
          const v = PRUEBA.valor(r, 0, "facturacion");
          const esperado = Number(e?.filas?.[0]?.[0]);
          return (r?.filas?.length ?? 0) === 1 && typeof v === "number" && Math.abs(v - esperado) < 0.005;
        } },
        { texto: "El ticket medio es la media de los entregados, con 2 decimales", prueba: async (r, db) => {
          const e = await db.consulta(`SELECT ROUND(AVG(total), 2) AS ticket_medio
FROM pedidos
WHERE estado = 'entregado';`);
          const v = PRUEBA.valor(r, 0, "ticket_medio");
          const esperado = Number(e?.filas?.[0]?.[0]);
          return (r?.filas?.length ?? 0) === 1 && typeof v === "number" && Math.abs(v - esperado) < 1e-6;
        } }
      ],
      pistas: [
        "Filtra con `WHERE estado = 'entregado'`. En el `SELECT`, dos agregados separados por coma: `SUM(total)` y `ROUND(AVG(total), 2)`, cada uno con su alias.",
        "SELECT SUM(total) AS facturacion, ROUND(AVG(total), 2) AS ticket_medio FROM pedidos WHERE estado = 'entregado';"
      ],
      solucion: `SELECT SUM(total) AS facturacion,
  ROUND(AVG(total), 2) AS ticket_medio
FROM pedidos
WHERE estado = 'entregado';`
    }
  ]
});
