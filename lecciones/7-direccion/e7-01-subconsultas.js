CURSO.registrar({
  id: "e7-01",
  titulo: "Una consulta dentro de otra: subconsultas",
  xp: 35,
  objetivo: "Sabrás meter una consulta dentro de otra: una subconsulta que devuelve un solo valor (en WHERE o en SELECT) y una que devuelve una lista (con IN), y sabrás leerlas de dentro afuera.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "Lo que está por encima de la media",
      texto: "Soy Ana Beltrán. Lucía me dice que eres quien sacó lo de `admin_temp`, así que vamos al grano.\nEl consejo no quiere tablas sueltas: quiere saber qué está **por encima de la media**. Productos, pedidos, clientes… Y la media cambia cada mes, así que no me vale que la copies a mano en la consulta."
    },
    {
      tipo: "explicacion",
      titulo: "Una consulta dentro de otra",
      texto: "Hasta ahora, para «productos más caros que la media» harías dos consultas: una para calcular la media y otra donde pegas ese número a mano.\nUna **subconsulta** junta las dos: se escribe entre paréntesis donde iría el número.\n`WHERE precio > (SELECT AVG(precio) FROM productos)`\nSe lee **de dentro afuera**: primero se calcula lo de dentro (la media) y con ese valor se filtra lo de fuera. Si mañana cambian los precios, la media se recalcula sola.\nA esta se la llama **subconsulta escalar**: devuelve **un solo valor** (una fila, una columna).",
      ejemplo: `SELECT nombre, precio
FROM productos
WHERE precio > (SELECT AVG(precio) FROM productos)
ORDER BY precio DESC, nombre;`,
      consejo: "Antes de meter una subconsulta, ejecútala sola. Si lo de dentro da lo que esperas, lo de fuera casi siempre sale bien."
    },
    {
      tipo: "ejercicio",
      enunciado: "Ana quiere los productos **activos** que cuestan **menos** que la media de precio de **todos** los productos: `nombre` y `precio`, ordenados de más barato a más caro y, si empatan, por `nombre`.",
      solucion: `SELECT nombre, precio
FROM productos
WHERE activo
  AND precio < (SELECT AVG(precio) FROM productos)
ORDER BY precio, nombre;`,
      pistas: [
        "Dos condiciones con `AND`: `activo` y `precio < (SELECT AVG(precio) FROM productos)`. La subconsulta no lleva filtro: es la media de todos.",
        "SELECT nombre, precio FROM productos WHERE activo AND precio < (SELECT AVG(precio) FROM productos) ORDER BY precio, nombre;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "También en el SELECT",
      texto: "Una subconsulta escalar puede ir también en el `SELECT`, como una columna más. Sirve para poner un dato de referencia **al lado de cada fila**: cada pedido junto al ticket medio de Faro, para compararlo de un vistazo.\nComo devuelve un solo valor, se repite igual en todas las filas. Y puedes operar con él: `total - (SELECT AVG(total) FROM pedidos)` dice cuánto se aleja cada pedido de la media.",
      ejemplo: `SELECT id, total,
  (SELECT ROUND(AVG(total), 2) FROM pedidos) AS ticket_medio
FROM pedidos
ORDER BY id
LIMIT 5;`
    },
    {
      tipo: "explicacion",
      titulo: "Una lista con IN",
      texto: "Si la subconsulta devuelve **una columna con varias filas**, ya no es un valor: es una **lista**. Y una lista se usa con `IN`, igual que `IN ('Madrid', 'Bilbao')`, pero sin escribirla a mano.\nEl ejemplo saca los clientes que han puesto alguna reclamación: dentro, la lista de `cliente_id` de `reclamaciones`; fuera, los clientes cuyo `id` está en esa lista.\nLo mismo se puede hacer con un `JOIN`, pero si un cliente tiene dos reclamaciones, el `JOIN` lo repite. Con `IN` sale una vez: solo preguntas si está o no está.",
      ejemplo: `SELECT id, nombre, ciudad
FROM clientes
WHERE id IN (SELECT cliente_id FROM reclamaciones)
ORDER BY id;`,
      consejo: "Cuidado con `NOT IN`: si la lista de dentro tiene un solo `NULL`, no devuelve **nada** (ya viste que `NULL` es «desconocido»). En unas diligencias verás una forma más segura."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT COUNT(*) AS clientes
FROM clientes
WHERE id IN (SELECT cliente_id FROM pedidos);`,
      pregunta: "Hay 300 clientes y 2 524 pedidos. ¿Qué número saldrá?",
      opciones: ["2 524", "300", "294"],
      correcta: 2,
      explicacion: "**294**. La subconsulta devuelve 2 524 `cliente_id` (muchos repetidos), pero `IN` solo pregunta si el cliente **está** en la lista: cada cliente cuenta una vez. Y hay 6 clientes que nunca han comprado: 300 − 6 = 294."
    },
    {
      tipo: "arreglar",
      enunciado: "Ana quiere el producto (o productos) **más caros** de todo el catálogo: `id`, `nombre` y `precio`. Esta consulta da el error **21000** («más de una fila devuelta por una subconsulta usada como expresión»). Arréglala para que la subconsulta devuelva **un solo valor**.",
      inicial: `SELECT id, nombre, precio
FROM productos
WHERE precio = (SELECT precio FROM productos);`,
      solucion: `SELECT id, nombre, precio
FROM productos
WHERE precio = (SELECT MAX(precio) FROM productos);`,
      pistas: [
        "Con `=`, la subconsulta tiene que dar un solo número, pero `SELECT precio FROM productos` da los 40 precios. ¿Qué función se queda con el mayor?",
        "Cambia la subconsulta por `(SELECT MAX(precio) FROM productos)`."
      ]
    },
    {
      tipo: "quiz",
      pregunta: "Quieres los pedidos con su `total` y el **nombre del cliente** al lado. ¿Qué usas?",
      opciones: [
        "Una subconsulta con IN: `WHERE cliente_id IN (SELECT id FROM clientes)`",
        "Un JOIN entre pedidos y clientes",
        "Una subconsulta escalar sin más: `(SELECT nombre FROM clientes)`"
      ],
      correcta: 1,
      explicacion: "Si necesitas **columnas** de la otra tabla, `JOIN`. La subconsulta con `IN` solo filtra (no trae el nombre), y `(SELECT nombre FROM clientes)` devuelve 300 nombres: error 21000. Regla práctica: subconsulta para **filtrar o comparar** con un valor o una lista; `JOIN` para **traer datos**."
    },
    {
      tipo: "reto",
      de: "ana",
      enunciado: "Quiero los pedidos de la **tienda online** (`tienda_id` = 5) que están por encima del ticket medio **de la tienda online** (la media de `total` de sus pedidos, no la de todo Faro). Dame los **10 que la superan por menos**: `id` y `total`, de **menor a mayor** `total` y, si empatan, por `id`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas id y total", prueba: (r) => PRUEBA.columnas(r, ["id", "total"]) },
        { texto: "El primero ya supera la media de la tienda online (no la de todo Faro)", prueba: async (r, db) => {
          const m = await db.consulta(`SELECT AVG(total) FROM pedidos WHERE tienda_id = 5;`);
          const media = Number(m?.filas?.[0]?.[0] ?? NaN);
          const primero = Number(PRUEBA.valor(r, 0, "total") ?? NaN);
          return (r?.filas?.length ?? 0) > 0 && primero > media;
        } },
        { texto: "Son los 10 pedidos online justo por encima de esa media, de menor a mayor total", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT id, total
FROM pedidos
WHERE tienda_id = 5
  AND total > (SELECT AVG(total) FROM pedidos WHERE tienda_id = 5)
ORDER BY total, id
LIMIT 10;`) }
      ],
      pistas: [
        "El filtro `tienda_id = 5` va **dos veces**: en la consulta de fuera y dentro de la subconsulta que calcula la media. Luego `ORDER BY total, id` y `LIMIT 10`.",
        "SELECT id, total FROM pedidos WHERE tienda_id = 5 AND total > (SELECT AVG(total) FROM pedidos WHERE tienda_id = 5) ORDER BY total, id LIMIT 10;"
      ],
      solucion: `SELECT id, total
FROM pedidos
WHERE tienda_id = 5
  AND total > (SELECT AVG(total) FROM pedidos WHERE tienda_id = 5)
ORDER BY total, id
LIMIT 10;`
    }
  ]
});
