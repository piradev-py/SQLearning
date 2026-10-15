CURSO.registrar({
  id: "e4-03",
  titulo: "Que no se pierda nadie: LEFT, RIGHT y FULL JOIN",
  xp: 40,
  objetivo: "Sabrás conservar las filas sin pareja con LEFT, RIGHT y FULL JOIN, leer los NULL que aparecen y elegir el orden de las tablas.",
  pasos: [
    {
      tipo: "historia",
      de: "hector",
      asunto: "Me faltan dos almacenes",
      texto: "Para la auditoría anual me piden la lista de **todos** los almacenes con su responsable. Hice el JOIN que me enseñaste y… me salen 3. ¡Tenemos 5!\nAlgún almacén estará sin responsable asignado, vale, pero tiene que salir en la lista igualmente, aunque sea con la casilla en blanco. Si entrego una lista con almacenes de menos, el auditor me hace repetirla entera."
    },
    {
      tipo: "explicacion",
      titulo: "LEFT JOIN: todas las de la izquierda",
      texto: "Con **LEFT JOIN**, la tabla de la izquierda (la del `FROM`) sale **entera**. Si una fila no encuentra pareja, sale igual, con las columnas de la derecha a `NULL`.\nEl ejemplo pone al lado de cada tienda el almacén de su misma ciudad. Fíjate en que el `ON` no usa ninguna FK: puedes emparejar por cualquier columna que tenga sentido, aquí `ciudad`.\nSalen las **6 tiendas**: Valencia, Sevilla y Bilbao con su almacén; Madrid, Online y Barcelona con `NULL`, porque en su ciudad no hay almacén.",
      ejemplo: `SELECT t.id, t.ciudad, a.nombre AS almacen
FROM tiendas AS t
LEFT JOIN almacenes AS a ON t.ciudad = a.ciudad
ORDER BY t.id;`
    },
    {
      tipo: "explicacion",
      titulo: "El Venn de la etapa 0",
      texto: "Recuerda los conjuntos de la etapa 0. Piensa en dos círculos: el de la izquierda son las filas de la primera tabla y el de la derecha, las de la segunda.\n- **INNER JOIN** = la **intersección**: solo las filas que tienen pareja en los dos lados.\n- **LEFT JOIN** = el **círculo izquierdo entero**: las parejas y, además, las filas de la izquierda que se han quedado solas.\nCon `INNER` da igual qué tabla pongas primero; con `LEFT`, **el orden importa**: la que va en el `FROM` es la que se conserva.",
      consejo: "Antes de escribir el JOIN, pregúntate: «¿de qué tabla necesito ver **todas** las filas?». Esa va a la izquierda, en el `FROM`."
    },
    {
      tipo: "ejercicio",
      enunciado: "Lista **todas las tiendas** con sus empleados, aunque alguna no tenga ninguno. Columnas `ciudad` (de la tienda) y `empleado` (el nombre del empleado). El orden da igual.",
      solucion: `SELECT t.ciudad, em.nombre AS empleado
FROM tiendas AS t
LEFT JOIN empleados AS em ON em.tienda_id = t.id;`,
      pistas: [
        "Las tiendas deben salir todas: `tiendas` va en el `FROM` y `empleados` en el `LEFT JOIN`, emparejando `em.tienda_id = t.id`.",
        "SELECT t.ciudad, em.nombre AS empleado FROM tiendas AS t LEFT JOIN empleados AS em ON em.tienda_id = t.id;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `SELECT t.ciudad, em.nombre AS empleado
FROM empleados AS em
LEFT JOIN tiendas AS t ON em.tienda_id = t.id;`,
      pregunta: "En el ejercicio salió Barcelona con `empleado` a `NULL`: aún no tiene plantilla. Ahora se cambia el orden de las tablas. ¿Saldrá Barcelona?",
      opciones: [
        "Sí, igual que antes",
        "No: ahora se conservan todos los empleados, y ninguno es de Barcelona",
        "Da error, porque el LEFT JOIN exige poner primero la tabla con la PK"
      ],
      correcta: 1,
      explicacion: "Con `empleados` a la izquierda, lo que se conserva son los **22 empleados**, cada uno con su tienda. Barcelona no es pareja de ninguno, así que desaparece. Mismo JOIN, otra pregunta: «todas las tiendas» no es lo mismo que «todos los empleados»."
    },
    {
      tipo: "explicacion",
      titulo: "RIGHT JOIN: el espejo",
      texto: "**RIGHT JOIN** hace lo mismo, pero conserva la tabla de la **derecha**. Aquí salen todos los transportistas, también Logística Delta, que no tiene ningún envío: su `envio_id` sale `NULL`.\nPara verla arriba se ordena por `e.id DESC`: en PostgreSQL, al ordenar de mayor a menor, los `NULL` salen **primero**. Sin el `LIMIT` saldrían 1 338 filas: los 1 337 envíos más Delta.\n`envios RIGHT JOIN transportistas` es lo mismo que `transportistas LEFT JOIN envios`. Casi nadie usa `RIGHT`: se lee mejor con `LEFT` y cambiando el orden.",
      ejemplo: `SELECT t.nombre AS transportista, e.id AS envio_id
FROM envios AS e
RIGHT JOIN transportistas AS t ON e.transportista_id = t.id
ORDER BY e.id DESC
LIMIT 3;`
    },
    {
      tipo: "explicacion",
      titulo: "FULL JOIN: nadie se queda fuera",
      texto: "**FULL JOIN** conserva **las dos** tablas: las parejas, las de la izquierda sin pareja y las de la derecha sin pareja. En el Venn, los dos círculos enteros.\nAquí, almacenes y tiendas por ciudad: **8 filas**. Valencia, Sevilla y Bilbao tienen las dos cosas; Getafe y Zaragoza, solo almacén (columnas de tienda a `NULL`); Madrid, Online y Barcelona, solo tienda (columnas de almacén a `NULL`).",
      ejemplo: `SELECT a.nombre AS almacen, a.ciudad AS ciudad_almacen, t.ciudad AS ciudad_tienda
FROM almacenes AS a
FULL JOIN tiendas AS t ON a.ciudad = t.ciudad
ORDER BY a.id, t.id;`,
      otrosMotores: "MySQL no tiene `FULL JOIN`: se simula juntando un `LEFT JOIN` y un `RIGHT JOIN` con `UNION` (lo verás más adelante). SQLite lo admite desde la versión 3.39. PostgreSQL, SQL Server, Oracle y BigQuery lo tienen."
    },
    {
      tipo: "quiz",
      pregunta: "Haces `clientes LEFT JOIN pedidos` y muestras `c.nombre`, `c.telefono` y `p.id`. Una fila tiene `telefono` a `NULL` y `p.id` con un número. ¿Qué significa?",
      opciones: [
        "Que ese cliente no tiene pedidos",
        "Que el cliente no tiene teléfono guardado, pero el pedido sí existe",
        "Que el JOIN ha fallado"
      ],
      correcta: 1,
      explicacion: "Un `NULL` tras un LEFT JOIN puede querer decir dos cosas: «no hay pareja» o «el dato ya estaba vacío». Aquí `telefono` es de la tabla de la izquierda y ya era `NULL` en `clientes`. Para saber si hay pareja, mira una columna de la derecha que nunca esté vacía, como `p.id`."
    },
    {
      tipo: "interpretar",
      pregunta: "Hay dos almacenes sin responsable. Uno es el de Zaragoza, que abrió hace nada. ¿Cuál es el **otro**, que lleva años funcionando sin responsable asignado? Escribe su nombre.",
      respuesta: ["Almacén Norte", "Norte", "Almacén Norte (Bilbao)", "Bilbao"],
      pistas: [
        "Une `almacenes` con `empleados` con un LEFT JOIN y busca los almacenes cuyo responsable sale `NULL`. O mira directamente qué almacenes tienen `responsable_id` vacío.",
        "SELECT nombre, apertura FROM almacenes WHERE responsable_id IS NULL; Uno abrió en 2026; el otro es el Almacén Norte."
      ],
      solucion: `SELECT nombre
FROM almacenes
WHERE responsable_id IS NULL
ORDER BY apertura
LIMIT 1;`
    },
    {
      tipo: "reto",
      de: "hector",
      enunciado: "Ahora sí, la lista para el auditor: **todos los almacenes** con su responsable. Columnas `almacen` (nombre del almacén), `ciudad` (la del almacén) y `responsable` (nombre del empleado), ordenadas por el `id` del almacén. Los que no tienen responsable deben salir con la casilla vacía.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas almacen, ciudad y responsable", prueba: (r) => PRUEBA.columnas(r, ["almacen", "ciudad", "responsable"]) },
        { texto: "Salen los 5 almacenes, 2 de ellos sin responsable", prueba: (r) => {
          const i = (r?.columnas ?? []).findIndex(c => String(c).toLowerCase() === "responsable");
          return (r?.filas?.length ?? 0) === 5 && i >= 0 && r.filas.filter(f => f?.[i] === null).length === 2;
        } },
        { texto: "Cada almacén lleva su responsable, en el orden de su id", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT a.nombre AS almacen, a.ciudad, em.nombre AS responsable
FROM almacenes AS a
LEFT JOIN empleados AS em ON a.responsable_id = em.id
ORDER BY a.id;`) }
      ],
      pistas: [
        "Es la consulta que le dejó 3 filas a Héctor, pero con `LEFT JOIN` y `almacenes` a la izquierda. Renombra las dos columnas `nombre` con `AS`.",
        "SELECT a.nombre AS almacen, a.ciudad, em.nombre AS responsable FROM almacenes AS a LEFT JOIN empleados AS em ON a.responsable_id = em.id ORDER BY a.id;"
      ],
      solucion: `SELECT a.nombre AS almacen, a.ciudad, em.nombre AS responsable
FROM almacenes AS a
LEFT JOIN empleados AS em ON a.responsable_id = em.id
ORDER BY a.id;`
    }
  ]
});
