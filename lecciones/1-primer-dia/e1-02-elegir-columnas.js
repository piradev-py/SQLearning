CURSO.registrar({
  id: "e1-02",
  titulo: "Elegir columnas",
  xp: 25,
  objetivo: "Sabrás pedir solo las columnas que necesitas, en el orden que tú quieras.",
  pasos: [
    {
      tipo: "historia",
      de: "lucia",
      asunto: "Menos es más",
      texto: "Elena, de ventas, quiere la lista de productos con su precio para una reunión.\nSi le mando la tabla entera, con proveedor, fecha de alta y todo lo demás, se pierde en dos segundos.\nHoy aprendes a sacar **solo lo que te piden**."
    },
    {
      tipo: "explicacion",
      titulo: "Pedir solo algunas columnas",
      texto: "En lugar del asterisco `*`, escribe detrás de `SELECT` los **nombres de las columnas** que quieres, separados por comas.\nEs como ocultar columnas en una hoja de cálculo: los datos siguen ahí, pero solo ves los que te interesan.\nOjo: **no** va coma después de la última columna, justo antes de `FROM`.",
      ejemplo: `SELECT nombre, precio
FROM productos;`
    },
    {
      tipo: "explicacion",
      titulo: "El orden lo decides tú",
      texto: "Las columnas salen en el **orden en que las escribes**, no en el que están guardadas en la tabla.\nEn la tabla, `nombre` va antes que `precio`; aquí pedimos primero el precio y la columna sale la primera.",
      ejemplo: `SELECT precio, nombre
FROM productos;`,
      consejo: "Pon primero la columna que identifica cada fila (el nombre, por ejemplo) y luego los datos. Quien lea tu tabla lo agradecerá."
    },
    {
      tipo: "explicacion",
      titulo: "¿Por qué no usar siempre `*`?",
      texto: "Con 8 columnas no pasa nada, pero en el trabajo real hay tablas con **cien columnas y millones de filas**.\nPedirlo todo hace la consulta más lenta, el resultado más difícil de leer y, si alguien añade una columna a la tabla, tu informe cambia sin que te enteres.\nEl `*` es para **curiosear** una tabla; para un listado, nombra las columnas.",
      consejo: "Sigue escribiendo `SELECT` y `FROM` en MAYÚSCULAS y las columnas en minúsculas. No es obligatorio, pero es la costumbre en casi todos los equipos y se lee de un vistazo."
    },
    {
      tipo: "ejercicio",
      enunciado: "Muestra la **ciudad** y la **apertura** (fecha de apertura) de todas las tiendas, en ese orden.",
      solucion: `SELECT ciudad, apertura
FROM tiendas;`,
      pistas: [
        "Escribe las dos columnas detrás de SELECT, separadas por una coma, y luego FROM tiendas.",
        "SELECT ciudad, apertura FROM tiendas;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `SELECT proveedor, nombre
FROM productos;`,
      pregunta: "¿Cuál será la **primera** columna del resultado?",
      opciones: ["nombre, porque va antes en la tabla", "proveedor", "id, que siempre sale primero"],
      correcta: 1,
      explicacion: "Las columnas salen en el orden en que las escribes en el SELECT: primero proveedor y después nombre."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería devolver el **nombre** y el **precio** de todos los productos, pero da error. Arréglala.",
      inicial: `SELECT nombre, precio,
FROM productos;`,
      solucion: `SELECT nombre, precio
FROM productos;`,
      pistas: [
        "Mira bien las comas: ¿hay alguna que sobre?",
        "Después de la última columna no va coma: SELECT nombre, precio FROM productos;"
      ]
    },
    {
      tipo: "quiz",
      pregunta: "¿Cuándo tiene sentido usar `SELECT *`?",
      opciones: [
        "Siempre: así no se te olvida ninguna columna",
        "Para echar un primer vistazo a una tabla que no conoces",
        "En los informes que se envían a dirección"
      ],
      correcta: 1,
      explicacion: "El asterisco es perfecto para explorar. En un listado o informe, nombra solo las columnas que hacen falta."
    },
    {
      tipo: "reto",
      de: "marcos",
      enunciado: "Hola, soy Marcos, de atención al cliente. Me llegan llamadas que tengo que pasar a otros departamentos y nunca sé quién es quién.\n¿Me sacas un directorio con el **nombre** y el **departamento** de todos los empleados, en ese orden? Sin emails ni nada más.",
      inicial: "-- Escribe aquí tu consulta\n",
      comprobaciones: [
        { texto: "Salen los 22 empleados", prueba: (r) => r?.filas?.length === 22 },
        { texto: "Tiene solo las columnas nombre y departamento, en ese orden", prueba: (r) => PRUEBA.columnas(r, ["nombre", "departamento"]) }
      ],
      pistas: [
        "La tabla es empleados. Escribe las dos columnas detrás de SELECT, separadas por una coma.",
        "SELECT nombre, departamento FROM empleados;"
      ],
      solucion: `SELECT nombre, departamento
FROM empleados;`
    }
  ]
});
