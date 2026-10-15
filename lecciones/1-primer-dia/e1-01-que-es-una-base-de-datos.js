CURSO.registrar({
  id: "e1-01",
  titulo: "¿Qué es una base de datos?",
  xp: 20,
  objetivo: "Sabrás qué es una tabla y cómo pedirle a la base de datos que te la enseñe entera.",
  pasos: [
    {
      tipo: "historia",
      de: "lucia",
      asunto: "Bienvenida a Faro",
      texto: "Ya tienes acceso a la base de datos de Faro. Antes de pedirte nada serio, quiero que te muevas por ella con soltura.\nEmpieza por algo sencillo: mirar qué hay dentro."
    },
    {
      tipo: "explicacion",
      titulo: "Una base de datos son tablas",
      texto: "Una **base de datos** guarda la información en **tablas**, como hojas de cálculo muy ordenadas.\nCada **fila** es una cosa (una tienda, un empleado…) y cada **columna** es un dato de esa cosa (su ciudad, su nombre…).\nPara hablar con la base de datos se usa **SQL**: escribes una **consulta** y te devuelve una tabla con la respuesta.",
      ejemplo: "SELECT *\nFROM tiendas;",
      consejo: "En el editor, pulsa **Ejecutar** (o `Ctrl+Enter`) y mira la tabla que aparece debajo: son las tiendas de Faro."
    },
    {
      tipo: "explicacion",
      titulo: "Tu primera consulta: SELECT * FROM",
      texto: "`SELECT` significa «dame» y `FROM`, «de la tabla…». El asterisco `*` quiere decir «todas las columnas».\nAsí que `SELECT * FROM tiendas;` se lee: «dame todas las columnas de la tabla tiendas».\nEl punto y coma `;` marca dónde **termina** la consulta. Escríbelo siempre.",
      consejo: "Las palabras clave (`SELECT`, `FROM`) se suelen escribir en MAYÚSCULAS y los nombres de tablas en minúsculas. A PostgreSQL le da igual, pero se lee mucho mejor."
    },
    {
      tipo: "ejercicio",
      enunciado: "Muestra **todas las columnas** de la tabla `productos`.",
      solucion: "SELECT *\nFROM productos;",
      pistas: [
        "Es igual que el ejemplo de las tiendas, cambiando el nombre de la tabla.",
        "SELECT * FROM productos;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: "SELECT *\nFROM tiendas;",
      pregunta: "¿Cuántas filas devolverá esta consulta?",
      opciones: ["3", "5", "22"],
      correcta: 1,
      explicacion: "Faro tiene 5 tiendas (Madrid, Valencia, Sevilla, Bilbao y la tienda online): una fila por tienda."
    },
    {
      tipo: "quiz",
      pregunta: "¿Para qué sirve el `;` al final de una consulta?",
      opciones: ["Para que vaya más rápido", "Para marcar dónde termina la consulta", "Para ordenar los resultados"],
      correcta: 1,
      explicacion: "El punto y coma le dice a PostgreSQL que la consulta ha terminado."
    },
    {
      tipo: "reto",
      de: "lucia",
      enunciado: "Necesito revisar la plantilla: muéstrame la tabla `empleados` entera, con **todas** sus columnas.",
      inicial: "-- Escribe aquí tu consulta\n",
      comprobaciones: [
        { texto: "Devuelve los 22 empleados", prueba: (r) => r.filas.length === 22 },
        { texto: "Con todas las columnas de la tabla", prueba: (r) => PRUEBA.columnas(r, ["id", "nombre", "departamento", "tienda_id", "email"]) }
      ],
      pistas: [
        "Necesitas SELECT, el asterisco y FROM con el nombre de la tabla.",
        "SELECT * FROM empleados;"
      ],
      solucion: "SELECT *\nFROM empleados;"
    }
  ]
});
