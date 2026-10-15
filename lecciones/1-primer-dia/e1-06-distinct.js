CURSO.registrar({
  id: "e1-06",
  titulo: "Sin repetir: DISTINCT",
  xp: 30,
  objetivo: "Sabrás quitar las filas repetidas de un resultado, con una columna o con varias.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "Secciones del catálogo de otoño",
      texto: "Estoy montando el catálogo de otoño y necesito saber cuántas secciones va a tener: una por cada **categoría** de producto que vendemos.\nSi me pasas la tabla de productos tal cual, tendré que ir tachando repetidos a mano, y no tengo tiempo. ¿Me lo das limpio?"
    },
    {
      tipo: "explicacion",
      titulo: "El problema: los repetidos",
      texto: "Si pides solo la columna `categoria`, PostgreSQL te devuelve **una fila por producto**: 40 filas, con «Informática», «Audio»… repetidas una y otra vez.\nEs como pedirle a alguien la lista de secciones de una tienda y que te lea la etiqueta de cada caja del almacén. Ejecuta el ejemplo y cuenta cuántas veces sale «Gaming».",
      ejemplo: `SELECT categoria
FROM productos;`
    },
    {
      tipo: "explicacion",
      titulo: "DISTINCT: cada valor una sola vez",
      texto: "Escribe **DISTINCT** justo después de `SELECT` y PostgreSQL quitará las filas repetidas: cada valor saldrá **una sola vez**.\nCon el ejemplo pasas de 40 filas a 5: las cinco categorías de Faro.\nOjo: las filas no salen en ningún orden concreto. Ordenar resultados lo verás en el siguiente nivel.",
      ejemplo: `SELECT DISTINCT categoria
FROM productos;`,
      consejo: "`DISTINCT` no es gratis: en tablas con millones de filas tarda. Úsalo cuando lo necesites, no por costumbre. Y si te salen repetidos que no esperabas, pregúntate **por qué** antes de taparlos con un `DISTINCT`."
    },
    {
      tipo: "ejercicio",
      enunciado: "Muestra la lista de **proveedores** sin repetir: una sola columna, `proveedor`, con cada proveedor una única vez.",
      solucion: `SELECT DISTINCT proveedor
FROM productos;`,
      pistas: [
        "Es como el ejemplo de las categorías, cambiando la columna.",
        "SELECT DISTINCT proveedor FROM productos;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `SELECT DISTINCT activo
FROM productos;`,
      pregunta: "La columna `activo` es de tipo `boolean`. ¿Cuántas filas devolverá esta consulta?",
      opciones: ["1", "2", "40"],
      correcta: 1,
      explicacion: "Un `boolean` solo puede ser verdadero o falso, y en Faro hay de los dos: 36 productos activos y 4 descatalogados. Sin repetir, quedan 2 filas."
    },
    {
      tipo: "explicacion",
      titulo: "DISTINCT con varias columnas",
      texto: "`DISTINCT` afecta a **toda la fila** del resultado, no a una sola columna. Con dos columnas, quita las **combinaciones** repetidas.\nEn el ejemplo, Logística tiene tres empleados en la tienda 1: es la misma combinación (Logística, 1), así que sale una vez. Pero Ventas aparece tres veces, porque tiene gente en las tiendas 1, 2 y 3.\nResultado: 12 combinaciones de departamento y tienda.",
      ejemplo: `SELECT DISTINCT departamento, tienda_id
FROM empleados;`
    },
    {
      tipo: "quiz",
      pregunta: "¿Qué filas quita `SELECT DISTINCT departamento, tienda_id FROM empleados;`?",
      opciones: [
        "Las que repiten el departamento",
        "Las que repiten la combinación de departamento y tienda_id",
        "Las que repiten la tienda_id"
      ],
      correcta: 1,
      explicacion: "`DISTINCT` mira la fila entera: solo se elimina una fila si **todas** sus columnas coinciden con otra."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería devolver la lista de **departamentos** de Faro, cada uno una sola vez, pero devuelve 22 filas. Arréglala para que devuelva **solo** la columna `departamento`, sin repetidos.",
      inicial: `SELECT DISTINCT departamento, nombre
FROM empleados;`,
      solucion: `SELECT DISTINCT departamento
FROM empleados;`,
      pistas: [
        "Cada empleado tiene un nombre distinto, así que cada combinación (departamento, nombre) es única y `DISTINCT` no quita nada.",
        "Quita la columna nombre: SELECT DISTINCT departamento FROM empleados;"
      ]
    },
    {
      tipo: "reto",
      de: "nuria",
      enunciado: "Para el sistema nuevo necesito saber qué proveedores nos sirven cada categoría. Dame cada combinación de `categoria` y `proveedor` **una sola vez**, con esas dos columnas en ese orden. El orden de las filas me da igual.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas categoria y proveedor, en ese orden", prueba: (r) => PRUEBA.columnas(r, ["categoria", "proveedor"]) },
        { texto: "Devuelve las 16 combinaciones que existen", prueba: (r) => (r?.filas?.length ?? 0) === 16 },
        { texto: "Ninguna combinación se repite", prueba: (r) => (r?.filas?.length ?? 0) > 0 && new Set(r.filas.map(f => JSON.stringify(f))).size === r.filas.length }
      ],
      pistas: [
        "Necesitas `DISTINCT` delante de las dos columnas, separadas por coma.",
        "SELECT DISTINCT categoria, proveedor FROM productos;"
      ],
      solucion: `SELECT DISTINCT categoria, proveedor
FROM productos;`
    }
  ]
});
