CURSO.registrar({
  id: "e7-02",
  titulo: "Tablas que salen de una consulta: subconsultas en FROM",
  xp: 35,
  objetivo: "Sabrás usar el resultado de una consulta como si fuera una tabla (subconsulta en FROM) para agregar en dos pasos, y escribir una subconsulta correlacionada que se calcula para cada fila.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "¿Cuántas veces compra un cliente?",
      texto: "Pregunta sencilla para el consejo: **¿cuántos pedidos hace un cliente de media?** Y la misma idea por tienda: cuánto se gasta un cliente en cada una.\nLucía dice que no sale con un solo `GROUP BY`. Que hay que agrupar **dos veces**. Tú sabrás cómo."
    },
    {
      tipo: "explicacion",
      titulo: "Una consulta que hace de tabla",
      texto: "El resultado de cualquier `SELECT` es una tabla. Así que puedes ponerlo en el `FROM` de otra consulta, entre paréntesis y **con un nombre** (alias):\n`FROM (SELECT …) AS t`\nEso resuelve lo de Ana en dos pasos:\n1. **Dentro:** cuántos pedidos tiene cada cliente (`GROUP BY cliente_id`).\n2. **Fuera:** la media de esa columna.\nCon un solo `AVG` no sale: `AVG` necesita una columna con «pedidos por cliente», y esa columna no existe hasta que la fabricas dentro.",
      ejemplo: `SELECT ROUND(AVG(pedidos), 2) AS media_pedidos
FROM (
  SELECT cliente_id, COUNT(*) AS pedidos
  FROM pedidos
  GROUP BY cliente_id
) AS t;`,
      consejo: "Ponle siempre un alias a la subconsulta del FROM, aunque PostgreSQL moderno te deje omitirlo: otros motores dan error sin él, y con alias puedes escribir `t.pedidos` y saber de dónde sale cada cosa.",
      otrosMotores: "En MySQL, SQL Server y en PostgreSQL anterior a la versión 16, el alias de una subconsulta en `FROM` es **obligatorio**: sin él, error. En SQL Server se puede poner sin `AS`: `FROM (SELECT …) t`."
    },
    {
      tipo: "ejercicio",
      enunciado: "¿Cuántas líneas tiene un pedido de media? En dos pasos: dentro, cuántas filas de `lineas_pedido` tiene cada `pedido_id` (llámala `lineas`); fuera, la media de `lineas` redondeada a 2 decimales, con el alias `media_lineas`.",
      solucion: `SELECT ROUND(AVG(lineas), 2) AS media_lineas
FROM (
  SELECT pedido_id, COUNT(*) AS lineas
  FROM lineas_pedido
  GROUP BY pedido_id
) AS t;`,
      pistas: [
        "Copia la forma del ejemplo: dentro `SELECT pedido_id, COUNT(*) AS lineas FROM lineas_pedido GROUP BY pedido_id`, fuera `ROUND(AVG(lineas), 2)`.",
        "SELECT ROUND(AVG(lineas), 2) AS media_lineas FROM (SELECT pedido_id, COUNT(*) AS lineas FROM lineas_pedido GROUP BY pedido_id) AS t;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `SELECT ROUND(AVG(ticket), 2) AS media_de_medias
FROM (
  SELECT tienda_id, AVG(total) AS ticket
  FROM pedidos
  GROUP BY tienda_id
) AS t;`,
      pregunta: "El ticket medio de **todos** los pedidos es 406,23 €. Esta consulta calcula el ticket medio de cada tienda y luego la media de esos 5 tickets. ¿Saldrá 406,23?",
      opciones: [
        "Sí: la media de las medias es la media de todo",
        "No: cada tienda pesa lo mismo, tenga 156 pedidos o 1 527",
        "Da error: no se puede hacer AVG de un AVG"
      ],
      correcta: 1,
      explicacion: "Sale otra cifra. La **media de medias no pondera**: Bilbao (156 pedidos) cuenta igual que la tienda online (1 527). Si quieres el ticket medio de Faro, calcúlalo sobre los pedidos, no sobre las medias de las tiendas. Es uno de los errores más repetidos en informes."
    },
    {
      tipo: "explicacion",
      titulo: "Una subconsulta para cada fila",
      texto: "A veces la subconsulta depende de la fila de fuera. Para cada empleado, ¿cuántos fichajes tiene?\n`(SELECT COUNT(*) FROM fichajes AS f WHERE f.empleado_id = e.id)`\nEse `e.id` es el empleado de la consulta de **fuera**. Se llama **subconsulta correlacionada**: se vuelve a calcular **una vez por cada fila**, como si para cada ficha de empleado fueras al archivador de fichajes a contar.\nLa tabla `fichajes` es nueva: cada fila es una entrada y una salida de un empleado en un centro, en 2026.",
      ejemplo: `SELECT e.id, e.nombre,
  (SELECT COUNT(*)
   FROM fichajes AS f
   WHERE f.empleado_id = e.id) AS fichajes
FROM empleados AS e
ORDER BY e.id;`,
      consejo: "Con 23 empleados va rápido. Con millones de filas, recalcular una subconsulta por cada una puede ser lento: un `LEFT JOIN … GROUP BY` hace el mismo trabajo de una pasada. El optimizador a veces lo convierte solo, pero no cuentes con ello."
    },
    {
      tipo: "ejercicio",
      enunciado: "Para cada tienda, cuántos pedidos tiene, con una **subconsulta correlacionada**: `id`, `ciudad` y `pedidos`, ordenado por `id`. Barcelona debe salir con 0.",
      solucion: `SELECT t.id, t.ciudad,
  (SELECT COUNT(*)
   FROM pedidos AS p
   WHERE p.tienda_id = t.id) AS pedidos
FROM tiendas AS t
ORDER BY t.id;`,
      pistas: [
        "Fuera, `FROM tiendas AS t`. La columna `pedidos` es `(SELECT COUNT(*) FROM pedidos AS p WHERE p.tienda_id = t.id)`.",
        "SELECT t.id, t.ciudad, (SELECT COUNT(*) FROM pedidos AS p WHERE p.tienda_id = t.id) AS pedidos FROM tiendas AS t ORDER BY t.id;"
      ]
    },
    {
      tipo: "quiz",
      pregunta: "¿Por qué Barcelona sale con **0** y no desaparece?",
      opciones: [
        "Porque la subconsulta correlacionada cuenta para cada tienda de fuera, y `COUNT(*)` de nada es 0",
        "Porque PostgreSQL rellena con 0 las tiendas nuevas",
        "Porque `tiendas` tiene una columna con los pedidos"
      ],
      correcta: 0,
      explicacion: "La consulta de fuera recorre **todas** las tiendas; la de dentro solo cuenta. Si no encuentra pedidos, `COUNT(*)` da 0. Con un `JOIN` normal, Barcelona desaparecería; con un `LEFT JOIN` saldría, pero tendrías que contar `p.id` y no `*`."
    },
    {
      tipo: "reto",
      de: "ana",
      enunciado: "Para cada tienda, ¿cuánto se gasta un cliente de media? En dos pasos: primero, lo que ha gastado **cada cliente en cada tienda** (`SUM(total)` por `tienda_id` y `cliente_id`); después, la media de ese gasto por tienda. Devuelve `tienda_id` y `gasto_medio` (redondeado a 2 decimales), ordenado por `tienda_id`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas tienda_id y gasto_medio", prueba: (r) => PRUEBA.columnas(r, ["tienda_id", "gasto_medio"]) },
        { texto: "Sale una fila por cada tienda con pedidos (5)", prueba: (r) => (r?.filas?.length ?? 0) === 5 },
        { texto: "El gasto medio es la media del gasto de cada cliente en la tienda, ordenado por tienda", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT tienda_id, ROUND(AVG(gasto), 2) AS gasto_medio
FROM (
  SELECT tienda_id, cliente_id, SUM(total) AS gasto
  FROM pedidos
  GROUP BY tienda_id, cliente_id
) AS t
GROUP BY tienda_id
ORDER BY tienda_id;`) }
      ],
      pistas: [
        "Dentro: `SELECT tienda_id, cliente_id, SUM(total) AS gasto FROM pedidos GROUP BY tienda_id, cliente_id`. Fuera: agrupa otra vez, ahora solo por `tienda_id`, con `ROUND(AVG(gasto), 2)`.",
        "SELECT tienda_id, ROUND(AVG(gasto), 2) AS gasto_medio FROM (SELECT tienda_id, cliente_id, SUM(total) AS gasto FROM pedidos GROUP BY tienda_id, cliente_id) AS t GROUP BY tienda_id ORDER BY tienda_id;"
      ],
      solucion: `SELECT tienda_id, ROUND(AVG(gasto), 2) AS gasto_medio
FROM (
  SELECT tienda_id, cliente_id, SUM(total) AS gasto
  FROM pedidos
  GROUP BY tienda_id, cliente_id
) AS t
GROUP BY tienda_id
ORDER BY tienda_id;`
    }
  ]
});
