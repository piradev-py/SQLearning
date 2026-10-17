CURSO.registrar({
  id: "e4-05",
  titulo: "Tres tablas o más",
  xp: 40,
  objetivo: "Sabrás encadenar varios JOIN, llegar a un dato que está a dos saltos pasando por una tabla puente y elegir bien la tabla de partida.",
  pasos: [
    {
      tipo: "historia",
      de: "hector",
      asunto: "La hoja de devoluciones",
      texto: "Cada mes preparo una hoja con los **envíos devueltos**: de quién era el paquete, de qué almacén salió y qué transportista lo llevó. Así vemos si algún transportista pierde más paquetes de la cuenta.\nEl problema es que esos tres datos están en tres tablas distintas, y el nombre del cliente ni siquiera está en `envios`. ¿Se pueden unir más de dos tablas a la vez? Te invito a otro café si sale."
    },
    {
      tipo: "explicacion",
      titulo: "Encadenar JOIN",
      texto: "Sí: cada `JOIN` se añade debajo del anterior, **cada uno con su propio `ON`**. PostgreSQL une la primera con la segunda y, a ese resultado, le pega la tercera.\nEl ejemplo pone al lado de cada envío el nombre del almacén y el del transportista. Las dos FK están en `envios`, así que los dos `ON` salen de `e`.",
      ejemplo: `SELECT e.id AS envio_id, al.nombre AS almacen, t.nombre AS transportista
FROM envios AS e
JOIN almacenes AS al ON e.almacen_id = al.id
JOIN transportistas AS t ON e.transportista_id = t.id
ORDER BY e.id
LIMIT 10;`,
      consejo: "Con tres o más tablas, los alias con sentido son obligatorios: `e` envíos, `p` pedidos, `c` clientes, `al` almacenes, `t` transportistas. Con `a`, `b`, `c`, `d` nadie (ni tú dentro de una semana) sabrá qué es cada cosa."
    },
    {
      tipo: "explicacion",
      titulo: "La tabla puente",
      texto: "El nombre del cliente no está en `envios`, y `envios` tampoco tiene un `cliente_id`. Pero sí tiene `pedido_id`, y cada pedido sabe de qué cliente es. El camino es **envíos → pedidos → clientes**: dos saltos.\nA `pedidos` se le llama aquí **tabla puente**: no te interesa ninguna de sus columnas para el resultado, pero sin ella no llegas al cliente.\nPara encontrar el camino, sigue las flechas de la pestaña Esquema.",
      ejemplo: `SELECT e.id AS envio_id, p.fecha, c.nombre AS cliente
FROM envios AS e
JOIN pedidos AS p ON e.pedido_id = p.id
JOIN clientes AS c ON p.cliente_id = c.id
ORDER BY e.id
LIMIT 5;`
    },
    {
      tipo: "ejercicio",
      enunciado: "Héctor quiere avisar a los clientes que tienen un paquete **en reparto** (`e.estado = 'en reparto'`). Muestra `envio_id` (el `id` del envío), `cliente` (su nombre) y `email`, ordenados por `envio_id`.",
      solucion: `SELECT e.id AS envio_id, c.nombre AS cliente, c.email
FROM envios AS e
JOIN pedidos AS p ON e.pedido_id = p.id
JOIN clientes AS c ON p.cliente_id = c.id
WHERE e.estado = 'en reparto'
ORDER BY e.id;`,
      pistas: [
        "El camino es el del ejemplo: `envios` → `pedidos` → `clientes`. El filtro va en el `WHERE`, después de los `JOIN`.",
        "SELECT e.id AS envio_id, c.nombre AS cliente, c.email FROM envios AS e JOIN pedidos AS p ON e.pedido_id = p.id JOIN clientes AS c ON p.cliente_id = c.id WHERE e.estado = 'en reparto' ORDER BY e.id;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Muchos a muchos: la tabla intermedia",
      texto: "Un pedido tiene muchos productos y un producto está en muchos pedidos: es una relación **N:M** (muchos a muchos). No se puede guardar con una sola FK, así que hay una **tabla intermedia**: `lineas_pedido`, con una fila por cada pareja pedido-producto.\nPara ir de pedidos a productos se pasa siempre por ella: **pedidos → lineas_pedido → productos**.\nY elige bien **desde dónde empiezas**: si solo necesitas el número de pedido, `lineas_pedido` ya lo tiene y te ahorras unir `pedidos`. Empieza por la tabla que tiene las filas que quieres contar o listar."
    },
    {
      tipo: "ejercicio",
      enunciado: "Un cliente pregunta qué llevaba su pedido número **1**. Muestra `producto` (el nombre del producto), `cantidad` y `precio_unitario` de cada línea de ese pedido. El orden da igual.",
      solucion: `SELECT pr.nombre AS producto, lp.cantidad, lp.precio_unitario
FROM lineas_pedido AS lp
JOIN productos AS pr ON lp.producto_id = pr.id
WHERE lp.pedido_id = 1;`,
      pistas: [
        "Las líneas están en `lineas_pedido` y el nombre del producto en `productos`. Únelas por `lp.producto_id = pr.id` y filtra `lp.pedido_id = 1`.",
        "SELECT pr.nombre AS producto, lp.cantidad, lp.precio_unitario FROM lineas_pedido AS lp JOIN productos AS pr ON lp.producto_id = pr.id WHERE lp.pedido_id = 1;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `SELECT al.nombre AS almacen, em.nombre AS responsable, t.ciudad AS oficina
FROM almacenes AS al
LEFT JOIN empleados AS em ON al.responsable_id = em.id
JOIN tiendas AS t ON em.tienda_id = t.id;`,
      pregunta: "Se empieza con un `LEFT JOIN` para no perder ningún almacén y luego se añade, con `JOIN`, la oficina en la que está fichado el responsable. ¿Cuántas filas salen?",
      opciones: ["5", "3", "0"],
      correcta: 1,
      explicacion: "Salen **3**. El `LEFT JOIN` conserva Norte y Zaragoza con `em.tienda_id` a `NULL`, pero el `JOIN` siguiente es `INNER`: no encuentra tienda para un `NULL` y vuelve a descartarlos. Si quieres conservarlos, **todos** los `JOIN` que cuelgan de la tabla opcional deben ser `LEFT JOIN`."
    },
    {
      tipo: "reto",
      de: "hector",
      enunciado: "La hoja de devoluciones: todos los envíos con estado `devuelto`. Columnas `envio_id`, `pedido_id`, `cliente` (nombre del cliente), `almacen` (nombre del almacén) y `transportista` (nombre del transportista), ordenadas por `envio_id`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas envio_id, pedido_id, cliente, almacen y transportista", prueba: (r) => PRUEBA.columnas(r, ["envio_id", "pedido_id", "cliente", "almacen", "transportista"]) },
        { texto: "Salen los 40 envíos devueltos, ordenados por envio_id", prueba: (r) => (r?.filas?.length ?? 0) === 40 && PRUEBA.ordenado(r, "envio_id", "asc") },
        { texto: "Filtra por el estado del envío, 'devuelto' (el del pedido es otra cosa, aunque hoy coincidan)", prueba: () => /'devuelto'/i.test(PRUEBA.codigo()) },
        { texto: "Cada envío lleva su cliente, su almacén y su transportista", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT e.id AS envio_id, e.pedido_id, c.nombre AS cliente, al.nombre AS almacen, t.nombre AS transportista
FROM envios AS e
JOIN pedidos AS p ON e.pedido_id = p.id
JOIN clientes AS c ON p.cliente_id = c.id
JOIN almacenes AS al ON e.almacen_id = al.id
JOIN transportistas AS t ON e.transportista_id = t.id
WHERE e.estado = 'devuelto'
ORDER BY e.id;`) }
      ],
      pistas: [
        "Parte de `envios`. Necesitas cuatro `JOIN`: `pedidos` (puente) y `clientes` para el nombre del cliente, y `almacenes` y `transportistas`, que cuelgan directamente de `envios`. El filtro, en el `WHERE`.",
        "SELECT e.id AS envio_id, e.pedido_id, c.nombre AS cliente, al.nombre AS almacen, t.nombre AS transportista FROM envios AS e JOIN pedidos AS p ON e.pedido_id = p.id JOIN clientes AS c ON p.cliente_id = c.id JOIN almacenes AS al ON e.almacen_id = al.id JOIN transportistas AS t ON e.transportista_id = t.id WHERE e.estado = 'devuelto' ORDER BY e.id;"
      ],
      solucion: `SELECT e.id AS envio_id, e.pedido_id, c.nombre AS cliente, al.nombre AS almacen, t.nombre AS transportista
FROM envios AS e
JOIN pedidos AS p ON e.pedido_id = p.id
JOIN clientes AS c ON p.cliente_id = c.id
JOIN almacenes AS al ON e.almacen_id = al.id
JOIN transportistas AS t ON e.transportista_id = t.id
WHERE e.estado = 'devuelto'
ORDER BY e.id;`
    }
  ]
});
