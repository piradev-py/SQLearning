CURSO.registrar({
  id: "e4-04",
  titulo: "Huérfanos: LEFT JOIN … IS NULL",
  xp: 40,
  objetivo: "Sabrás encontrar las filas que no tienen pareja en otra tabla con LEFT JOIN … WHERE … IS NULL, qué columna mirar y por qué una condición en el WHERE puede deshacer tu LEFT JOIN.",
  pasos: [
    {
      tipo: "historia",
      de: "hector",
      asunto: "Un contrato que no usamos",
      texto: "Pregunta rápida: firmamos con **Logística Delta** hace tiempo, y juraría que nunca le hemos dado un paquete. Pagamos una cuota fija, así que si no la usamos, la cancelo.\nY ya puestos, me gustaría tener a mano la forma de encontrar «cosas que no tienen nada»: transportistas sin envíos, almacenes sin movimiento… Lo que en el archivo de papel serían fichas sin ningún papel grapado."
    },
    {
      tipo: "explicacion",
      titulo: "Huérfanos y el patrón anti-join",
      texto: "Una fila **huérfana** es la que no tiene pareja en otra tabla: un transportista sin envíos, un cliente sin pedidos.\nYa sabes que un `LEFT JOIN` conserva esas filas y rellena la derecha con `NULL`. Pues basta con quedarse **solo con esas**: `WHERE e.id IS NULL`. A este patrón se le llama **anti-join** (unión inversa): «las de la izquierda que **no** encuentran pareja».\nResultado: Logística Delta, el contrato que Héctor puede cancelar.",
      ejemplo: `SELECT t.id, t.nombre
FROM transportistas AS t
LEFT JOIN envios AS e ON e.transportista_id = t.id
WHERE e.id IS NULL;`,
      consejo: "Quizá pensaste en `NOT IN` con una lista de ids escrita a mano. Recuerda la etapa 2: si en la lista se cuela un `NULL`, no sale **nada**. El `LEFT JOIN … IS NULL` no tiene esa trampa."
    },
    {
      tipo: "ejercicio",
      enunciado: "Marketing quiere escribir a los clientes registrados que **nunca han hecho un pedido**. Muestra su `id` y su `nombre`, ordenados por `id`.",
      solucion: `SELECT c.id, c.nombre
FROM clientes AS c
LEFT JOIN pedidos AS p ON p.cliente_id = c.id
WHERE p.id IS NULL
ORDER BY c.id;`,
      pistas: [
        "`clientes` a la izquierda, `LEFT JOIN pedidos` por `p.cliente_id = c.id`, y te quedas con los que no tienen pedido: `WHERE p.id IS NULL`.",
        "SELECT c.id, c.nombre FROM clientes AS c LEFT JOIN pedidos AS p ON p.cliente_id = c.id WHERE p.id IS NULL ORDER BY c.id;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `SELECT pr.id, pr.nombre
FROM productos AS pr
LEFT JOIN lineas_pedido AS lp ON lp.producto_id = pr.id
WHERE lp.pedido_id IS NULL;`,
      pregunta: "Hay 40 productos y 4 están descatalogados. ¿Cuántos productos **nunca se han vendido**?",
      opciones: ["0", "4, los descatalogados", "40"],
      correcta: 0,
      explicacion: "**Ninguno**: todos los productos tienen al menos una línea de pedido. Los descatalogados se vendían hasta hace poco. Un resultado vacío también es una respuesta, y muy buena: «no hay huérfanos». Fíjate en que aquí se mira `lp.pedido_id`, que forma parte de la PK de `lineas_pedido` y nunca está vacía."
    },
    {
      tipo: "explicacion",
      titulo: "¿Qué columna miro en el IS NULL?",
      texto: "Tras el `LEFT JOIN`, el `IS NULL` debe ir sobre una columna de la derecha que **nunca** esté vacía cuando hay pareja: lo más seguro es **su clave** (`e.id`, `p.id`).\nSi eliges otra, puedes mezclar dos cosas. Por ejemplo, `e.entrega` está vacía cuando el almacén no tiene envíos… y también cuando el envío existe pero aún no ha llegado (los que están `en reparto`). El resultado parecería razonable y estaría mal.",
      consejo: "Mi regla: en un anti-join, `IS NULL` siempre sobre la PK de la tabla de la derecha. No hace falta pensar más."
    },
    {
      tipo: "quiz",
      pregunta: "Quieres los almacenes sin ningún envío con `almacenes AS a LEFT JOIN envios AS e ON e.almacen_id = a.id`. ¿Qué condición pones en el `WHERE`?",
      opciones: ["`WHERE e.entrega IS NULL`", "`WHERE e.id IS NULL`", "`WHERE a.responsable_id IS NULL`"],
      correcta: 1,
      explicacion: "`e.id` es la clave de `envios`: solo está vacía cuando el almacén no tiene pareja. Con `e.entrega` saldrían también almacenes con envíos en reparto, y `a.responsable_id` no tiene nada que ver con los envíos."
    },
    {
      tipo: "ejercicio",
      enunciado: "Elena quiere saber si hay alguna tienda que todavía **no tenga ningún pedido**. Muestra su `id` y su `ciudad`.",
      solucion: `SELECT t.id, t.ciudad
FROM tiendas AS t
LEFT JOIN pedidos AS p ON p.tienda_id = t.id
WHERE p.id IS NULL;`,
      pistas: [
        "Igual que con los clientes: `tiendas` a la izquierda, `LEFT JOIN pedidos` por `p.tienda_id = t.id` y `WHERE p.id IS NULL`.",
        "SELECT t.id, t.ciudad FROM tiendas AS t LEFT JOIN pedidos AS p ON p.tienda_id = t.id WHERE p.id IS NULL;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `SELECT DISTINCT a.id, a.nombre, e.estado
FROM almacenes AS a
LEFT JOIN envios AS e ON e.almacen_id = a.id
WHERE e.estado = 'devuelto'
ORDER BY a.id;`,
      pregunta: "Héctor quiere ver **todos** los almacenes y, si tienen envíos devueltos, que se note. El Almacén Zaragoza no tiene ningún envío. ¿Saldrá en el resultado?",
      opciones: [
        "Sí, con `estado` a `NULL`",
        "No: salen solo los 4 almacenes con algún devuelto",
        "Salen los 5, todos con `devuelto`"
      ],
      correcta: 1,
      explicacion: "Zaragoza **desaparece**. El `LEFT JOIN` lo conservó con `estado` a `NULL`, pero después el `WHERE` pregunta `NULL = 'devuelto'`, que da «desconocido», y la fila se descarta. Ese `WHERE` ha convertido el `LEFT JOIN` en un `INNER JOIN` sin que nadie se dé cuenta."
    },
    {
      tipo: "explicacion",
      titulo: "La condición, en el ON o en el WHERE",
      texto: "Recuerda el orden en que piensa SQL: primero el `FROM` con sus `JOIN`, después el `WHERE`.\n- En el **ON**, la condición decide **qué cuenta como pareja**. Si no hay pareja, la fila de la izquierda se queda igualmente, con `NULL`.\n- En el **WHERE**, la condición **filtra el resultado ya unido**, y elimina las filas con `NULL`.\nPara conservar a todos y filtrar solo la tabla de la derecha, la condición va en el `ON`, unida con `AND`. Ahora salen los 5 almacenes y Zaragoza aparece con `NULL`.",
      ejemplo: `SELECT DISTINCT a.id, a.nombre, e.estado
FROM almacenes AS a
LEFT JOIN envios AS e ON e.almacen_id = a.id
  AND e.estado = 'devuelto'
ORDER BY a.id;`,
      consejo: "Si escribes un `LEFT JOIN` y en el `WHERE` pones una condición sobre la tabla de la derecha (que no sea `IS NULL`), para un momento: casi seguro que querías ponerla en el `ON`."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería devolver los transportistas que **no tienen ningún envío devuelto** (`id` y `nombre`, ordenados por `id`), pero no devuelve nada. Arréglala sin cambiar su idea: un anti-join contra los envíos devueltos.",
      inicial: `SELECT t.id, t.nombre
FROM transportistas AS t
LEFT JOIN envios AS e ON e.transportista_id = t.id
WHERE e.estado = 'devuelto'
  AND e.id IS NULL
ORDER BY t.id;`,
      solucion: `SELECT t.id, t.nombre
FROM transportistas AS t
LEFT JOIN envios AS e ON e.transportista_id = t.id
  AND e.estado = 'devuelto'
WHERE e.id IS NULL
ORDER BY t.id;`,
      pistas: [
        "Una fila no puede tener a la vez `estado = 'devuelto'` y `e.id` vacío. La condición del estado debe decidir qué cuenta como pareja: llévala al `ON`.",
        "Pasa `e.estado = 'devuelto'` al ON con AND y deja en el WHERE solo `e.id IS NULL`: ... LEFT JOIN envios AS e ON e.transportista_id = t.id AND e.estado = 'devuelto' WHERE e.id IS NULL ORDER BY t.id;"
      ]
    },
    {
      tipo: "reto",
      de: "hector",
      enunciado: "Última cosa: quiero saber si algún **almacén no ha hecho ni un solo envío**, para revisar si está bien dado de alta en el sistema. Columnas `id` y `nombre` del almacén.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas id y nombre", prueba: (r) => PRUEBA.columnas(r, ["id", "nombre"]) },
        { texto: "Encuentra el único almacén sin envíos", prueba: (r) => (r?.filas?.length ?? 0) === 1 && PRUEBA.contiene(r, "nombre", "Almacén Zaragoza") },
        { texto: "Lo descubre la consulta mirando la tabla envios (no escrito a mano)", prueba: () => /\benvios\b/i.test(PRUEBA.codigo()) },
        { texto: "Es el resultado de buscar almacenes sin pareja en envíos", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT a.id, a.nombre
FROM almacenes AS a
LEFT JOIN envios AS e ON e.almacen_id = a.id
WHERE e.id IS NULL;`) }
      ],
      pistas: [
        "Es un anti-join: `almacenes` a la izquierda, `LEFT JOIN envios` por `e.almacen_id = a.id`, y en el `WHERE`, la clave de la derecha vacía.",
        "SELECT a.id, a.nombre FROM almacenes AS a LEFT JOIN envios AS e ON e.almacen_id = a.id WHERE e.id IS NULL;"
      ],
      solucion: `SELECT a.id, a.nombre
FROM almacenes AS a
LEFT JOIN envios AS e ON e.almacen_id = a.id
WHERE e.id IS NULL;`
    }
  ]
});
