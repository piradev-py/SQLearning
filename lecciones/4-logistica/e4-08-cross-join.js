CURSO.registrar({
  id: "e4-08",
  titulo: "Todas las combinaciones: CROSS JOIN",
  xp: 35,
  objetivo: "Sabrás generar todas las combinaciones de dos tablas con CROSS JOIN, usarlas como plantilla para que en un resumen salgan también los ceros y detectar un producto cartesiano accidental.",
  pasos: [
    {
      tipo: "historia",
      de: "hector",
      asunto: "La matriz de tarifas",
      texto: "Te traigo otro marrón, pero de los fáciles, te lo prometo.\nVamos a negociar tarifas y necesito una **matriz**: cada almacén con cada transportista y cuántos envíos ha hecho esa pareja. Con **todas** las parejas, también las que nunca han trabajado juntas: Zaragoza acaba de abrir y Logística Delta es nuevo. Si una casilla no sale, en la reunión parece que me la he dejado."
    },
    {
      tipo: "explicacion",
      titulo: "CROSS JOIN: cada fila con cada fila",
      texto: "Hasta ahora, cada `JOIN` emparejaba filas que tenían algo en común (el `ON`). **CROSS JOIN** no tiene `ON`: junta **cada fila** de la primera tabla con **cada fila** de la segunda.\nEs como la tabla de multiplicar: 5 almacenes × 4 transportistas = **20 filas**, todas las parejas posibles. A esto se le llama **producto cartesiano**.\nEl orden de las filas lo pone el `ORDER BY`: primero por almacén y, dentro de cada uno, por transportista.",
      ejemplo: `SELECT al.nombre AS almacen, t.nombre AS transportista
FROM almacenes AS al
CROSS JOIN transportistas AS t
ORDER BY al.id, t.id;`
    },
    {
      tipo: "prediccion",
      consulta: `SELECT COUNT(*) AS combinaciones
FROM tiendas AS ti
CROSS JOIN almacenes AS al;`,
      pregunta: "Faro tiene 6 tiendas y 5 almacenes. ¿Cuántas filas cuenta este CROSS JOIN?",
      opciones: ["11", "30", "6"],
      correcta: 1,
      explicacion: "**30** = 6 × 5. Un CROSS JOIN **multiplica**: cada una de las 6 tiendas se empareja con cada uno de los 5 almacenes. Si sumara (11), estarías apilando las dos listas, que es otra operación que verás en la diligencia siguiente."
    },
    {
      tipo: "ejercicio",
      enunciado: "Héctor quiere estudiar qué transportista podría servir a cada tienda. Lista **todas las parejas** posibles de tienda y transportista: columnas `tienda` (la `ciudad` de la tienda) y `transportista` (su nombre). El orden da igual.",
      solucion: `SELECT ti.ciudad AS tienda, t.nombre AS transportista
FROM tiendas AS ti
CROSS JOIN transportistas AS t;`,
      pistas: [
        "`FROM tiendas CROSS JOIN transportistas`, sin `ON`. Pon un alias a cada tabla y renombra las dos columnas.",
        "SELECT ti.ciudad AS tienda, t.nombre AS transportista FROM tiendas AS ti CROSS JOIN transportistas AS t;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "El cartesiano accidental",
      texto: "El CROSS JOIN tiene un gemelo malvado: el que haces **sin querer**. Pasa con la sintaxis antigua `FROM pedidos, lineas_pedido` cuando olvidas el `WHERE` que las une, o con un `ON` que no relaciona las dos tablas.\nNo da error. Simplemente, cada pedido se empareja con cada línea: 2 524 × 4 022 = **más de 10 millones de filas**. La consulta tarda una eternidad y cualquier suma sale disparatada.\nNo lo ejecutes: créetelo.",
      consejo: "Antes de ejecutar un `JOIN`, calcula cuántas filas esperas (más o menos). Si te salen muchas más de las que tiene la tabla más grande, casi seguro que hay un cartesiano escondido.",
      otrosMotores: "`FROM a, b` sin condición es un CROSS JOIN en todos los motores (PostgreSQL, MySQL, SQL Server, Oracle, BigQuery). Por eso conviene escribir siempre `JOIN … ON`: si falta el `ON`, da error en vez de multiplicar en silencio."
    },
    {
      tipo: "quiz",
      pregunta: "Unes `envios` (1 337 filas) con `transportistas` (4 filas) y te salen **5 348 filas**. ¿Qué ha pasado?",
      opciones: [
        "Hay envíos duplicados en la tabla",
        "El `ON` no relaciona bien las dos tablas y ha salido un producto cartesiano",
        "Es lo normal: cada envío tiene varios transportistas"
      ],
      correcta: 1,
      explicacion: "1 337 × 4 = 5 348: cada envío se ha emparejado con los 4 transportistas. Cada envío tiene **un** transportista, así que la unión correcta debería dar 1 337 filas. Revisa el `ON`: debe ser `e.transportista_id = t.id`."
    },
    {
      tipo: "explicacion",
      titulo: "Plantilla + LEFT JOIN: que salgan los ceros",
      texto: "El uso más útil del CROSS JOIN es fabricar una **plantilla** con todas las casillas y rellenarla después con un `LEFT JOIN`.\nAquí el `ON` lleva **dos condiciones**, porque cada envío tiene que coincidir con el almacén **y** con el transportista de la casilla: `e.almacen_id = al.id AND e.transportista_id = t.id`.\nEl ejemplo muestra la plantilla del Almacén Zaragoza: sus 4 casillas existen, pero ningún envío las rellena (`envio_id` a `NULL`). Si las agrupas y cuentas, darán 0.",
      ejemplo: `SELECT al.nombre AS almacen, t.nombre AS transportista, e.id AS envio_id
FROM almacenes AS al
CROSS JOIN transportistas AS t
LEFT JOIN envios AS e ON e.almacen_id = al.id AND e.transportista_id = t.id
WHERE al.id = 5
ORDER BY t.id;`,
      consejo: "Los informes con huecos engañan: si una pareja no sale, quien lo lee no sabe si es 0 o si se te ha olvidado. La plantilla con CROSS JOIN garantiza que todas las casillas están."
    },
    {
      tipo: "reto",
      de: "hector",
      enunciado: "La matriz para la reunión: **todas** las parejas de almacén y transportista con `almacen` (nombre del almacén), `transportista` (nombre del transportista) y `envios` (cuántos envíos ha hecho esa pareja, 0 si ninguno). Ordénala por el **id del almacén** y, dentro de cada almacén, por el **id del transportista**.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas almacen, transportista y envios", prueba: (r) => PRUEBA.columnas(r, ["almacen", "transportista", "envios"]) },
        { texto: "Salen las 20 parejas y entre todas suman 1 337 envíos", prueba: (r) => {
          const ie = (r?.columnas || []).findIndex(x => String(x).toLowerCase() === "envios");
          const filas = r?.filas || [];
          return filas.length === 20 && ie >= 0 && filas.reduce((s, f) => s + Number(f[ie] ?? 0), 0) === 1337;
        } },
        { texto: "Las 4 casillas de Zaragoza y las 5 de Logística Delta están a 0", prueba: (r) => {
          const c = (r?.columnas || []).map(x => String(x).toLowerCase());
          const ia = c.indexOf("almacen"), it = c.indexOf("transportista"), ie = c.indexOf("envios");
          if (ia < 0 || it < 0 || ie < 0) return false;
          const filas = r?.filas || [];
          const zaragoza = filas.filter(f => f[ia] === "Almacén Zaragoza");
          const delta = filas.filter(f => f[it] === "Logística Delta");
          return zaragoza.length === 4 && delta.length === 5
            && zaragoza.concat(delta).every(f => f[ie] !== null && Number(f[ie]) === 0);
        } },
        { texto: "Cada pareja tiene sus envíos, en el orden pedido", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT al.nombre AS almacen, t.nombre AS transportista, COUNT(e.id) AS envios
FROM almacenes AS al
CROSS JOIN transportistas AS t
LEFT JOIN envios AS e ON e.almacen_id = al.id AND e.transportista_id = t.id
GROUP BY al.id, al.nombre, t.id, t.nombre
ORDER BY al.id, t.id;`) }
      ],
      pistas: [
        "Plantilla con `almacenes CROSS JOIN transportistas`, después `LEFT JOIN envios` con las dos condiciones en el `ON`. Agrupa por almacén y transportista (id y nombre de cada uno) y cuenta con `COUNT(e.id)`.",
        "SELECT al.nombre AS almacen, t.nombre AS transportista, COUNT(e.id) AS envios FROM almacenes AS al CROSS JOIN transportistas AS t LEFT JOIN envios AS e ON e.almacen_id = al.id AND e.transportista_id = t.id GROUP BY al.id, al.nombre, t.id, t.nombre ORDER BY al.id, t.id;"
      ],
      solucion: `SELECT al.nombre AS almacen, t.nombre AS transportista, COUNT(e.id) AS envios
FROM almacenes AS al
CROSS JOIN transportistas AS t
LEFT JOIN envios AS e ON e.almacen_id = al.id AND e.transportista_id = t.id
GROUP BY al.id, al.nombre, t.id, t.nombre
ORDER BY al.id, t.id;`
    }
  ]
});
