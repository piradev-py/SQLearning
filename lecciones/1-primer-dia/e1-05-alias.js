CURSO.registrar({
  id: "e1-05",
  titulo: "Ponerle nombre: alias",
  xp: 30,
  objetivo: "Sabrás dar a cada columna del resultado un nombre claro con AS.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "¿Qué es «?column?»?",
      texto: "Soy Ana Beltrán, directora general. Elena me ha pasado tu informe del valor del inventario. Los números me sirven, pero una columna se llama «?column?».\nEsto lo va a ver el consejo. Necesito títulos que cualquiera entienda sin preguntar."
    },
    {
      tipo: "explicacion",
      titulo: "AS: ponle nombre a una columna",
      texto: "Detrás de una columna o de un cálculo, escribe `AS` y el nombre que quieras. Ese nombre se llama **alias**: un apodo que solo existe en el resultado; la tabla no cambia.\nSirve para bautizar cálculos y también para renombrar columnas que ya tienen nombre, como `nombre AS producto`.",
      ejemplo: `SELECT nombre AS producto, precio * stock AS valor_inventario
FROM productos;`,
      consejo: "Escribe los alias en minúsculas, sin tildes y con las palabras unidas por guion bajo (`valor_inventario`). Es lo habitual en los equipos de datos y te ahorrará problemas."
    },
    {
      tipo: "explicacion",
      titulo: "Alias con espacios: comillas dobles",
      texto: "Si el alias lleva espacios, tildes o mayúsculas que quieras conservar, ponlo entre **comillas dobles**: `AS \"Precio (€)\"`.\nRecuerda la regla: comillas **simples** para textos (`' - '`), comillas **dobles** para nombres de columnas.\nSin comillas, PostgreSQL pasa el alias a minúsculas: `AS Producto` sale como `producto`.",
      ejemplo: `SELECT nombre AS "Nombre del producto", precio AS "Precio (€)"
FROM productos;`,
      otrosMotores: "En MySQL los nombres con espacios también pueden ir entre acentos graves y en SQL Server, entre corchetes: `[Nombre del producto]`."
    },
    {
      tipo: "explicacion",
      titulo: "Alias de tabla (primer contacto)",
      texto: "Las tablas también admiten alias: `FROM productos AS p`. Después puedes nombrar sus columnas como `p.nombre` («la columna nombre de p»).\nCon una sola tabla no aporta mucho, pero cuando combines varias tablas te ahorrará escribir y dejará claro de dónde sale cada columna. De momento, basta con que te suene.",
      ejemplo: `SELECT p.nombre, p.precio
FROM productos AS p;`
    },
    {
      tipo: "ejercicio",
      enunciado: "Muestra las tiendas con dos columnas: la ciudad con el alias `tienda` y la fecha de apertura con el alias `abierta_desde`, en ese orden.",
      solucion: `SELECT ciudad AS tienda, apertura AS abierta_desde
FROM tiendas;`,
      pistas: [
        "Pon AS y el alias detrás de cada columna: ciudad AS tienda, …",
        "SELECT ciudad AS tienda, apertura AS abierta_desde FROM tiendas;"
      ]
    },
    {
      tipo: "quiz",
      pregunta: "¿Cuál de estas formas escribe bien en PostgreSQL un alias con espacios?",
      opciones: ["AS 'Precio final'", "AS \"Precio final\"", "AS Precio final"],
      correcta: 1,
      explicacion: "Los nombres con espacios van entre comillas dobles. Con comillas simples PostgreSQL da error (eso es un texto, no un nombre) y sin comillas cree que `final` es otra cosa."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT nombre AS Producto
FROM productos;`,
      pregunta: "¿Cómo se llamará la columna del resultado?",
      opciones: ["Producto", "producto", "nombre"],
      correcta: 1,
      explicacion: "Sin comillas dobles, PostgreSQL pasa el alias a minúsculas. Para conservar la mayúscula tendrías que escribir `AS \"Producto\"`."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería devolver **dos columnas**, `nombre` y `precio`, de todos los productos. No da error, pero devuelve una sola columna. ¿Por qué? Arréglala.",
      inicial: `SELECT nombre precio
FROM productos;`,
      solucion: `SELECT nombre, precio
FROM productos;`,
      pistas: [
        "El `AS` es opcional: si escribes una palabra justo detrás de una columna, PostgreSQL la toma como su alias. ¿Qué le falta entre nombre y precio?",
        "Falta la coma: SELECT nombre, precio FROM productos;"
      ]
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "Ana quiere el informe del inventario presentable. Rehazlo con dos columnas: el nombre del producto con el alias `producto` y el precio por el stock con el alias `valor_inventario`, en ese orden.",
      inicial: `SELECT nombre, precio * stock
FROM productos;`,
      comprobaciones: [
        { texto: "Salen los 40 productos", prueba: (r) => r?.filas?.length === 40 },
        { texto: "Las columnas se llaman producto y valor_inventario, en ese orden", prueba: (r) => PRUEBA.columnas(r, ["producto", "valor_inventario"]) },
        { texto: "valor_inventario es el precio por el stock de cada producto", prueba: async (r, db) => {
          try { return await PRUEBA.igualA(r, db, "SELECT nombre, precio * stock FROM productos;", { nombres: false }); } catch (e) { return false; }
        } }
      ],
      pistas: [
        "Parte de la consulta que ya tienes y añade AS con el alias detrás de cada columna.",
        "SELECT nombre AS producto, precio * stock AS valor_inventario FROM productos;"
      ],
      solucion: `SELECT nombre AS producto, precio * stock AS valor_inventario
FROM productos;`
    }
  ]
});
