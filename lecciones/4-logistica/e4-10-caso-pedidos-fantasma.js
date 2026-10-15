CURSO.registrar({
  id: "e4-10",
  titulo: "Caso: Pedidos fantasma",
  xp: 70,
  objetivo: "Sabrás comprobar que lo que debería existir existe de verdad: cruzar pedidos con envíos para encontrar los que nunca salieron de un almacén, resumirlos y seguir su rastro hasta los clientes y el almacén.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "¿Adónde fueron esos paquetes?",
      texto: "El comité ha visto tu gráfico de reembolsos online y ahora quiere la siguiente pregunta: **qué pasó con esos pedidos**. ¿Llegaron rotos? ¿Los devolvieron?\nLa respuesta tiene que estar en los envíos. He hablado con Héctor y, tan majo como siempre, ya te ha dado acceso a todas sus tablas: dice que le preguntes lo que haga falta.\nEmpieza por lo básico: ¿todos los pedidos online tienen su envío?"
    },
    {
      tipo: "explicacion",
      titulo: "Lo que debería existir",
      texto: "Una buena auditoría empieza por una regla de negocio: **todo pedido online sale de un almacén**. El cliente no se lo lleva en mano, así que debería tener su fila en `envios`.\nEl ejemplo cuenta los pedidos de la tienda online: 1 527. Y en `envios` hay 1 337 filas. Faltan **190** envíos.\nAlgunos huecos tienen explicación: un pedido cancelado antes de salir no se envía nunca. Los otros, no tanto. Para verlos, ya conoces la herramienta: el anti-join, `LEFT JOIN … WHERE e.id IS NULL`.",
      ejemplo: `SELECT COUNT(*) AS pedidos_online
FROM pedidos
WHERE tienda_id = 5;`,
      consejo: "Al buscar huecos, filtra por la **clave** de la tabla derecha (`e.id IS NULL`), no por una columna que pueda ser `NULL` de verdad, como `e.entrega`. Y apunta siempre las cifras de control (1 527 y 1 337): si tu resultado no cuadra con la resta, algo falla."
    },
    {
      tipo: "caso",
      de: "elena",
      enunciado: "Vamos por partes: qué pedidos online no tienen envío, en qué estado están, de quién son y qué pasa con los pocos de esos clientes que sí tienen envío.",
      partes: [
        {
          enunciado: "Lista los **pedidos online** (`tienda_id = 5`) que **no tienen ningún envío**: columnas `id`, `estado` y `total` del pedido. El orden da igual.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas id, estado y total", prueba: (r) => PRUEBA.columnas(r, ["id", "estado", "total"]) },
            { texto: "Salen los 190 pedidos online sin envío", prueba: (r) => (r?.filas?.length ?? 0) === 190 },
            { texto: "Son pedidos online sin envío, con su estado y su total", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT p.id, p.estado, p.total
FROM pedidos AS p
LEFT JOIN envios AS e ON e.pedido_id = p.id
WHERE p.tienda_id = 5
  AND e.id IS NULL;`) }
          ],
          pistas: [
            "Parte de `pedidos` y haz un `LEFT JOIN` con `envios` por `pedido_id`. En el `WHERE`, la tienda online y la clave del envío vacía.",
            "SELECT p.id, p.estado, p.total FROM pedidos AS p LEFT JOIN envios AS e ON e.pedido_id = p.id WHERE p.tienda_id = 5 AND e.id IS NULL;"
          ],
          solucion: `SELECT p.id, p.estado, p.total
FROM pedidos AS p
LEFT JOIN envios AS e ON e.pedido_id = p.id
WHERE p.tienda_id = 5
  AND e.id IS NULL;`
        },
        {
          enunciado: "190 son demasiados para mirarlos uno a uno. Resúmelos: cuántos hay **en cada estado**. Columnas `estado` y `pedidos`, ordenadas por `estado`.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas estado y pedidos", prueba: (r) => PRUEBA.columnas(r, ["estado", "pedidos"]) },
            { texto: "Los pedidos de todos los estados suman 190", prueba: (r) => {
              const ip = (r?.columnas || []).findIndex(x => String(x).toLowerCase() === "pedidos");
              return ip >= 0 && (r?.filas || []).reduce((s, f) => s + Number(f[ip] ?? 0), 0) === 190;
            } },
            { texto: "Un grupo por estado, ordenados por estado", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT p.estado, COUNT(*) AS pedidos
FROM pedidos AS p
LEFT JOIN envios AS e ON e.pedido_id = p.id
WHERE p.tienda_id = 5
  AND e.id IS NULL
GROUP BY p.estado
ORDER BY p.estado;`) }
          ],
          pistas: [
            "La misma consulta de antes, pero agrupando por `p.estado` y contando.",
            "SELECT p.estado, COUNT(*) AS pedidos FROM pedidos AS p LEFT JOIN envios AS e ON e.pedido_id = p.id WHERE p.tienda_id = 5 AND e.id IS NULL GROUP BY p.estado ORDER BY p.estado;"
          ],
          solucion: `SELECT p.estado, COUNT(*) AS pedidos
FROM pedidos AS p
LEFT JOIN envios AS e ON e.pedido_id = p.id
WHERE p.tienda_id = 5
  AND e.id IS NULL
GROUP BY p.estado
ORDER BY p.estado;`
        },
        {
          tipo: "interpretar",
          pregunta: "Solo salen dos estados. ¿Cuál de ellos es **normal** que no tenga envío? Escribe el estado tal cual aparece.",
          respuesta: ["cancelado", "cancelados"],
          pistas: [
            "¿Qué pedido no llega a salir nunca del almacén?",
            "Un pedido cancelado se anula antes de prepararlo: escribe cancelado."
          ],
          solucion: `SELECT p.estado
FROM pedidos AS p
LEFT JOIN envios AS e ON e.pedido_id = p.id
WHERE p.tienda_id = 5
  AND e.id IS NULL
GROUP BY p.estado
ORDER BY p.estado
LIMIT 1;`
        },
        {
          enunciado: "Los 127 cancelados tienen explicación. Los **63 reembolsados** no: se devolvió el dinero de algo que nunca se envió. Míralos con su cliente: une también `clientes` y muestra `pedido_id`, `fecha`, `total`, `cliente` (el nombre del cliente) y `email`, de los pedidos online reembolsados sin envío, ordenados por `fecha`.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas pedido_id, fecha, total, cliente y email", prueba: (r) => PRUEBA.columnas(r, ["pedido_id", "fecha", "total", "cliente", "email"]) },
            { texto: "Salen los 63 pedidos reembolsados sin envío", prueba: (r) => (r?.filas?.length ?? 0) === 63 },
            { texto: "Cada pedido con su cliente, ordenados por fecha", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT p.id AS pedido_id, p.fecha, p.total, c.nombre AS cliente, c.email
FROM pedidos AS p
JOIN clientes AS c ON c.id = p.cliente_id
LEFT JOIN envios AS e ON e.pedido_id = p.id
WHERE p.tienda_id = 5
  AND p.estado = 'reembolsado'
  AND e.id IS NULL
ORDER BY p.fecha;`) }
          ],
          pistas: [
            "Tres tablas: `pedidos`, `JOIN clientes` (todo pedido tiene cliente) y `LEFT JOIN envios`. En el `WHERE`, añade `p.estado = 'reembolsado'` a las dos condiciones de antes.",
            "SELECT p.id AS pedido_id, p.fecha, p.total, c.nombre AS cliente, c.email FROM pedidos AS p JOIN clientes AS c ON c.id = p.cliente_id LEFT JOIN envios AS e ON e.pedido_id = p.id WHERE p.tienda_id = 5 AND p.estado = 'reembolsado' AND e.id IS NULL ORDER BY p.fecha;"
          ],
          solucion: `SELECT p.id AS pedido_id, p.fecha, p.total, c.nombre AS cliente, c.email
FROM pedidos AS p
JOIN clientes AS c ON c.id = p.cliente_id
LEFT JOIN envios AS e ON e.pedido_id = p.id
WHERE p.tienda_id = 5
  AND p.estado = 'reembolsado'
  AND e.id IS NULL
ORDER BY p.fecha;`
        },
        {
          tipo: "interpretar",
          pregunta: "Casi todos los emails terminan en `@correo-rapido.example`. Solo **un** pedido es de otra persona, y ya lo conoces de atención al cliente. ¿Qué **número de pedido** es?",
          respuesta: 2210,
          tolerancia: 0,
          pistas: [
            "Repite la consulta anterior añadiendo `c.email NOT LIKE '%@correo-rapido.example'` al `WHERE`.",
            "Es el pedido que Iratxe Muñoz no reconoce: el 2210."
          ],
          solucion: `SELECT p.id
FROM pedidos AS p
JOIN clientes AS c ON c.id = p.cliente_id
LEFT JOIN envios AS e ON e.pedido_id = p.id
WHERE p.tienda_id = 5
  AND p.estado = 'reembolsado'
  AND e.id IS NULL
  AND c.email NOT LIKE '%@correo-rapido.example';`
        },
        {
          enunciado: "Elena necesita la cifra para el comité. Resume en **una fila** los pedidos online reembolsados sin envío: `pedidos` (cuántos son), `clientes` (cuántos clientes **distintos**), `importe` (la suma de `total`), `primero` y `ultimo` (la `fecha` más antigua y la más reciente).",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas pedidos, clientes, importe, primero y ultimo", prueba: (r) => PRUEBA.columnas(r, ["pedidos", "clientes", "importe", "primero", "ultimo"]) },
            { texto: "Cuenta los pedidos y los clientes distintos", prueba: (r) => (r?.filas?.length ?? 0) === 1 && PRUEBA.valor(r, 0, "pedidos") === 63 && PRUEBA.valor(r, 0, "clientes") === 10 },
            { texto: "Lo calcula la consulta (COUNT sobre pedidos y envíos), no escrito a mano", prueba: () => /\bcount\s*\(/i.test(PRUEBA.codigo()) && /\benvios\b/i.test(PRUEBA.codigo()) },
            { texto: "El importe y las fechas son los de esos pedidos", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT COUNT(*) AS pedidos, COUNT(DISTINCT p.cliente_id) AS clientes, SUM(p.total) AS importe, MIN(p.fecha) AS primero, MAX(p.fecha) AS ultimo
FROM pedidos AS p
LEFT JOIN envios AS e ON e.pedido_id = p.id
WHERE p.tienda_id = 5
  AND p.estado = 'reembolsado'
  AND e.id IS NULL;`) }
          ],
          pistas: [
            "Sin `GROUP BY`: los agregados sobre todas las filas dan una sola fila. Usa `COUNT(*)`, `COUNT(DISTINCT p.cliente_id)`, `SUM(p.total)`, `MIN(p.fecha)` y `MAX(p.fecha)`.",
            "SELECT COUNT(*) AS pedidos, COUNT(DISTINCT p.cliente_id) AS clientes, SUM(p.total) AS importe, MIN(p.fecha) AS primero, MAX(p.fecha) AS ultimo FROM pedidos AS p LEFT JOIN envios AS e ON e.pedido_id = p.id WHERE p.tienda_id = 5 AND p.estado = 'reembolsado' AND e.id IS NULL;"
          ],
          solucion: `SELECT COUNT(*) AS pedidos, COUNT(DISTINCT p.cliente_id) AS clientes, SUM(p.total) AS importe, MIN(p.fecha) AS primero, MAX(p.fecha) AS ultimo
FROM pedidos AS p
LEFT JOIN envios AS e ON e.pedido_id = p.id
WHERE p.tienda_id = 5
  AND p.estado = 'reembolsado'
  AND e.id IS NULL;`
        },
        {
          enunciado: "Última comprobación: ¿alguno de los pedidos de los clientes `@correo-rapido.example` **sí** tiene envío? Une `pedidos`, `clientes`, `envios` y `almacenes` y muestra `pedido_id`, `almacen` (nombre del almacén), `estado` (el del **envío**) y `entrega`, de los clientes cuyo email termina en `@correo-rapido.example`, ordenados por `pedido_id`.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas pedido_id, almacen, estado y entrega", prueba: (r) => PRUEBA.columnas(r, ["pedido_id", "almacen", "estado", "entrega"]) },
            { texto: "Salen 6 envíos", prueba: (r) => (r?.filas?.length ?? 0) === 6 },
            { texto: "Cada pedido con su almacén y los datos de su envío, ordenados por pedido", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT p.id AS pedido_id, al.nombre AS almacen, e.estado, e.entrega
FROM pedidos AS p
JOIN clientes AS c ON c.id = p.cliente_id
JOIN envios AS e ON e.pedido_id = p.id
JOIN almacenes AS al ON al.id = e.almacen_id
WHERE c.email LIKE '%@correo-rapido.example'
ORDER BY p.id;`) }
          ],
          pistas: [
            "Ahora quieres solo los que **sí** tienen pareja: todo con `JOIN` normal. `pedidos` → `clientes`, `pedidos` → `envios` y `envios` → `almacenes`. El estado es `e.estado`, no `p.estado`.",
            "SELECT p.id AS pedido_id, al.nombre AS almacen, e.estado, e.entrega FROM pedidos AS p JOIN clientes AS c ON c.id = p.cliente_id JOIN envios AS e ON e.pedido_id = p.id JOIN almacenes AS al ON al.id = e.almacen_id WHERE c.email LIKE '%@correo-rapido.example' ORDER BY p.id;"
          ],
          solucion: `SELECT p.id AS pedido_id, al.nombre AS almacen, e.estado, e.entrega
FROM pedidos AS p
JOIN clientes AS c ON c.id = p.cliente_id
JOIN envios AS e ON e.pedido_id = p.id
JOIN almacenes AS al ON al.id = e.almacen_id
WHERE c.email LIKE '%@correo-rapido.example'
ORDER BY p.id;`
        },
        {
          tipo: "interpretar",
          pregunta: "Los 6 envíos están en estado `devuelto` y ninguno tiene fecha de `entrega`, aunque los devueltos normales sí la tienen. ¿Qué **almacén** los firma todos? Escribe su nombre.",
          respuesta: ["Almacén central", "central", "Getafe", "Almacén central (Getafe)", "Almacén de Getafe", "Almacén central de Getafe", "el almacén central", "el central", "almacén central Getafe"],
          pistas: [
            "Mira la columna `almacen` de la parte anterior: es el mismo en las 6 filas.",
            "Todos salen del Almacén central, el de Getafe: escribe Almacén central."
          ],
          solucion: `SELECT DISTINCT al.nombre
FROM pedidos AS p
JOIN clientes AS c ON c.id = p.cliente_id
JOIN envios AS e ON e.pedido_id = p.id
JOIN almacenes AS al ON al.id = e.almacen_id
WHERE c.email LIKE '%@correo-rapido.example';`
        }
      ],
      expediente: {
        id: "pedidos-fantasma",
        titulo: "Pedidos fantasma",
        texto: "De los pedidos online, **190** no tienen envío. 127 son cancelados, lo normal. Los otros **63** están **reembolsados**: Faro devolvió **31 380,20 €** por paquetes que **nunca salieron de ningún almacén**.\nSon de **10 clientes**: 62 pedidos de las cuentas `@correo-rapido.example` de Getafe y uno más, el **2210**, el que Iratxe Muñoz no reconoce. Todos hechos de madrugada, entre el 5 de marzo y el 25 de septiembre de 2026.\nEsos clientes solo tienen **6** envíos, y los firma todos el **Almacén central (Getafe)**: «devueltos», pero sin fecha de entrega. ¿Cómo se devuelve un paquete que nunca llegó? ¿Y adónde ha ido a parar todo ese dinero?"
      }
    }
  ]
});
