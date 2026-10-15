CURSO.registrar({
  id: "e4-02",
  titulo: "Unir dos tablas: INNER JOIN",
  xp: 35,
  objetivo: "Sabrás unir dos tablas con JOIN … ON, nombrar cada columna con su tabla o su alias y evitar los errores típicos: columnas ambiguas y uniones por la columna equivocada.",
  pasos: [
    {
      tipo: "historia",
      de: "hector",
      asunto: "Adiós a las tres pestañas",
      texto: "Lo de ayer funcionó, pero hacerlo envío a envío no tiene futuro: tenemos más de mil trescientos.\nEn Excel lo resolvía con BUSCARV: al lado de cada número pegaba el nombre que le corresponde. Me tiraba la mañana entera y siempre se me colaba alguna fila mal.\nQuiero una lista de envíos con el **nombre del transportista** al lado, no su número. ¿Puede la base de datos hacer el BUSCARV por mí?"
    },
    {
      tipo: "explicacion",
      titulo: "JOIN … ON: pegar dos tablas",
      texto: "Sí: se llama **JOIN**. Después del `FROM` añades `JOIN otra_tabla ON condición`. La condición del **ON** dice cómo se emparejan las filas: casi siempre, **la FK de una con la PK de la otra**.\nPara cada envío, PostgreSQL busca el transportista cuyo `id` es igual a su `transportista_id` y pega las dos filas en una. Como dos tablas pueden tener columnas que se llaman igual, las nombras con su tabla delante: `envios.id`, `transportistas.nombre`.\nSalen las **1 337** filas: una por envío, cada una con su transportista.",
      ejemplo: `SELECT envios.id, envios.pedido_id, transportistas.nombre
FROM envios
JOIN transportistas ON envios.transportista_id = transportistas.id;`
    },
    {
      tipo: "explicacion",
      titulo: "Alias de tabla y nombres claros",
      texto: "Escribir `transportistas.` delante de cada columna cansa. Usa un **alias de tabla** (lo viste de pasada en la etapa 1): `FROM envios AS e` y luego `e.id`. El `AS` es opcional: `FROM envios e` también vale.\nY si en el resultado hay dos columnas que significan cosas distintas, ponles un alias de columna claro: `t.nombre AS transportista`.\nEsta unión se llama **INNER JOIN** (unión interna): solo salen las filas que **encuentran pareja**. `JOIN` a secas es lo mismo que `INNER JOIN`.",
      ejemplo: `SELECT e.id AS envio_id, e.coste, t.nombre AS transportista
FROM envios AS e
INNER JOIN transportistas AS t ON e.transportista_id = t.id
ORDER BY e.id
LIMIT 5;`,
      consejo: "Pon alias cortos pero con sentido: `e` para envíos, `t` para transportistas. Dentro de un mes, `a`, `b` y `c` no te dirán nada."
    },
    {
      tipo: "ejercicio",
      enunciado: "Lucía quiere saber en qué ciudad trabaja cada empleado. Une `empleados` con `tiendas` (`empleados.tienda_id` apunta a `tiendas.id`) y muestra `nombre`, `departamento` y `ciudad`. El orden da igual.",
      solucion: `SELECT em.nombre, em.departamento, t.ciudad
FROM empleados AS em
JOIN tiendas AS t ON em.tienda_id = t.id;`,
      pistas: [
        "FROM empleados AS em JOIN tiendas AS t ON em.tienda_id = t.id. Luego elige las tres columnas.",
        "SELECT em.nombre, em.departamento, t.ciudad FROM empleados AS em JOIN tiendas AS t ON em.tienda_id = t.id;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "El error 42702: columna ambigua",
      texto: "`envios` y `transportistas` tienen las dos una columna `id`. Si escribes `SELECT id` sin decir de qué tabla, PostgreSQL no sabe cuál quieres y se niega:\n`column reference \"id\" is ambiguous`\nEs el error **42702** (aquí lo verás traducido: «el nombre está en varias tablas»). Pasa también en el `ORDER BY` y en el `WHERE`. El arreglo: delante de la columna, la tabla o su alias (`e.id`).\nSi una columna solo existe en una de las dos tablas (`pedido_id`), funciona sin prefijo, pero ponérselo siempre deja claro de dónde sale."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería devolver `id` (el del envío), `pedido_id` y `transportista` (el nombre del transportista), ordenada por el `id` del envío. Da el error 42702. Arréglala.",
      inicial: `SELECT id, pedido_id, nombre AS transportista
FROM envios AS e
JOIN transportistas AS t ON e.transportista_id = t.id
ORDER BY id;`,
      solucion: `SELECT e.id, e.pedido_id, t.nombre AS transportista
FROM envios AS e
JOIN transportistas AS t ON e.transportista_id = t.id
ORDER BY e.id;`,
      pistas: [
        "Las dos tablas tienen `id`. ¿De cuál quieres el número? Ponle delante su alias, también en el `ORDER BY`.",
        "SELECT e.id, e.pedido_id, t.nombre AS transportista FROM envios AS e JOIN transportistas AS t ON e.transportista_id = t.id ORDER BY e.id;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Uniones que no dan error… y están mal",
      texto: "Lo peligroso no es el error, sino la consulta que funciona con la condición equivocada. Aquí se une el `id` del **envío** con el `id` del **transportista**: PostgreSQL obedece, empareja el envío 1 con el transportista 1, el 2 con el 2… y devuelve **4 filas sin sentido**.\nNadie avisa. Por eso, en el `ON`, la FK con la PK a la que apunta (míralo en el Esquema).\nY si te olvidas del `ON`, eso sí da error de sintaxis: un `JOIN` necesita saber cómo emparejar.",
      ejemplo: `SELECT e.id AS envio_id, t.nombre AS transportista
FROM envios AS e
JOIN transportistas AS t ON e.id = t.id;`,
      consejo: "Antes de fiarte de un JOIN, cuenta las filas. Si unes cada envío con su transportista deberían salir tantas filas como envíos. Si salen 4, algo está mal.",
      otrosMotores: "En código antiguo (y aún hoy en Oracle o MySQL) verás la sintaxis vieja: `FROM envios e, transportistas t WHERE e.transportista_id = t.id`. Hace lo mismo que el `JOIN`, pero mezcla la unión con los filtros y es fácil olvidar la condición. Escribe siempre `JOIN … ON`."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT a.nombre AS almacen, em.nombre AS responsable
FROM almacenes AS a
JOIN empleados AS em ON a.responsable_id = em.id;`,
      pregunta: "Faro tiene 5 almacenes. ¿Cuántas filas devolverá esta lista de almacenes con su responsable?",
      opciones: ["5", "3", "Da error, porque hay responsables vacíos"],
      correcta: 1,
      explicacion: "Salen **3**. El Almacén Norte y el de Zaragoza tienen `responsable_id` a `NULL`, así que no encuentran pareja en `empleados` y el `INNER JOIN` los descarta **sin avisar**. Si querías la lista completa de almacenes, este JOIN no sirve. En la próxima diligencia verás cómo no perder a nadie."
    },
    {
      tipo: "reto",
      de: "marcos",
      enunciado: "Hola, soy Marcos. Repaso las reclamaciones y solo veo `cliente_id`. Pásame cada reclamación con el **nombre del cliente**: columnas `reclamacion_id` (el `id` de la reclamación), `cliente` (su nombre) y `motivo`, ordenadas por `reclamacion_id`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas reclamacion_id, cliente y motivo", prueba: (r) => PRUEBA.columnas(r, ["reclamacion_id", "cliente", "motivo"]) },
        { texto: "Salen las 40 reclamaciones, ordenadas por reclamacion_id", prueba: (r) => (r?.filas?.length ?? 0) === 40 && PRUEBA.ordenado(r, "reclamacion_id", "asc") },
        { texto: "Cada reclamación lleva el nombre de su cliente", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT r.id AS reclamacion_id, c.nombre AS cliente, r.motivo
FROM reclamaciones AS r
JOIN clientes AS c ON r.cliente_id = c.id
ORDER BY r.id;`) }
      ],
      pistas: [
        "Une `reclamaciones` (alias `r`) con `clientes` (alias `c`) por `r.cliente_id = c.id`. Las dos tienen `id`: califica las columnas y ponles los alias que pide Marcos.",
        "SELECT r.id AS reclamacion_id, c.nombre AS cliente, r.motivo FROM reclamaciones AS r JOIN clientes AS c ON r.cliente_id = c.id ORDER BY r.id;"
      ],
      solucion: `SELECT r.id AS reclamacion_id, c.nombre AS cliente, r.motivo
FROM reclamaciones AS r
JOIN clientes AS c ON r.cliente_id = c.id
ORDER BY r.id;`
    }
  ]
});
