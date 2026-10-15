CURSO.registrar({
  id: "e2-08",
  titulo: "El vacío: NULL",
  xp: 40,
  objetivo: "Sabrás qué es un valor NULL, cómo encontrarlo con IS NULL / IS NOT NULL y por qué `= NULL` nunca funciona.",
  pasos: [
    {
      tipo: "historia",
      de: "marcos",
      asunto: "Los clientes sin teléfono",
      texto: "Vamos a avisar de un cambio en las devoluciones. A quien tenga teléfono le llamamos; a los demás, les escribo un email.\nHe probado `WHERE telefono = NULL` para sacar los que no tienen teléfono y… **cero filas**. Y sé que hay clientes sin teléfono, porque los veo en la tabla. ¿Qué estoy haciendo mal?"
    },
    {
      tipo: "explicacion",
      titulo: "NULL: un dato que no sabemos",
      texto: "Cuando una casilla está vacía, PostgreSQL guarda **NULL**: «no tenemos ese dato». No es un 0 ni un texto vacío `''`: es **desconocido**.\nEn el ejemplo, la clienta 5 no tiene ciudad y la clienta 8 no tiene teléfono. El resultado muestra esas casillas como `NULL`.",
      ejemplo: `SELECT id, nombre, telefono, ciudad
FROM clientes
ORDER BY id
LIMIT 10;`,
      consejo: "Un `NULL` casi siempre cuenta una historia: un formulario sin ese campo, un cliente que no quiso darlo, una importación que falló… Antes de analizar una tabla, mira qué columnas tienen vacíos."
    },
    {
      tipo: "explicacion",
      titulo: "IS NULL e IS NOT NULL",
      texto: "Para preguntar por el vacío hay una forma especial:\n- `WHERE ciudad IS NULL` → las filas **sin** ciudad.\n- `WHERE ciudad IS NOT NULL` → las filas **con** ciudad.\nEn el ejemplo salen los 10 clientes de los que no sabemos la ciudad.",
      ejemplo: `SELECT id, nombre, ciudad
FROM clientes
WHERE ciudad IS NULL
ORDER BY id;`
    },
    {
      tipo: "ejercicio",
      enunciado: "Casi ningún pedido lleva nota del cliente. Muestra `id`, `fecha` y `nota` de los pedidos que **sí tienen** nota, ordenados por `id`.",
      solucion: `SELECT id, fecha, nota
FROM pedidos
WHERE nota IS NOT NULL
ORDER BY id;`,
      pistas: [
        "«Tener nota» es lo contrario de que la nota esté vacía: `IS NOT NULL`.",
        "SELECT id, fecha, nota FROM pedidos WHERE nota IS NOT NULL ORDER BY id;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Por qué `= NULL` no funciona",
      texto: "Piensa en NULL como «no lo sé». ¿El teléfono de un cliente es igual a «no lo sé»? La respuesta no es «sí» ni «no», sino **«no lo sé»**.\nSQL usa una lógica de **tres valores**: verdadero, falso y desconocido (`NULL`). Cualquier comparación con NULL (`=`, `<>`, `<`…) da desconocido, y `WHERE` solo se queda con las filas en las que la condición es **verdadera**.\nPor eso esta consulta, la de Marcos, no devuelve nada.",
      ejemplo: `SELECT id, nombre, telefono
FROM clientes
WHERE telefono = NULL;`,
      otrosMotores: "Es igual en todos los motores: `IS NULL` siempre. En SQL Server existe una opción antigua (`ANSI_NULLS OFF`) que hacía funcionar `= NULL`, pero está obsoleta: no te fíes de ella."
    },
    {
      tipo: "quiz",
      pregunta: "¿Qué da la comparación `NULL = NULL`?",
      opciones: ["Verdadero", "Falso", "Desconocido (NULL)"],
      correcta: 2,
      explicacion: "Dos datos que no conocemos pueden ser iguales o no: no lo sabemos. Por eso el resultado es desconocido, y un `WHERE` con esa condición no deja pasar la fila."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería devolver `id`, `nombre` y `email` de los clientes **sin ciudad**, ordenados por `id`, pero no devuelve nada. Arréglala.",
      inicial: `SELECT id, nombre, email
FROM clientes
WHERE ciudad = NULL
ORDER BY id;`,
      solucion: `SELECT id, nombre, email
FROM clientes
WHERE ciudad IS NULL
ORDER BY id;`,
      pistas: [
        "Comparar con `=` contra NULL siempre da «desconocido». Hay una forma especial de preguntar por el vacío.",
        "Cambia `= NULL` por `IS NULL`: SELECT id, nombre, email FROM clientes WHERE ciudad IS NULL ORDER BY id;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `SELECT id, nombre, ciudad
FROM clientes
WHERE ciudad NOT IN ('Madrid', NULL);`,
      pregunta: "Alguien ha metido un NULL en la lista del `NOT IN`. ¿Qué devolverá la consulta?",
      opciones: [
        "Todos los clientes que no son de Madrid",
        "Los que no son de Madrid ni tienen la ciudad vacía",
        "Ninguna fila"
      ],
      correcta: 2,
      explicacion: "`ciudad NOT IN ('Madrid', NULL)` equivale a `ciudad <> 'Madrid' AND ciudad <> NULL`. La segunda parte siempre es desconocida, así que la condición nunca llega a ser verdadera: cero filas.\nY otra sorpresa: incluso con `NOT IN ('Madrid')` a secas, los clientes **sin ciudad** no salen, porque `NULL <> 'Madrid'` también es desconocido. Si los quieres, añade `OR ciudad IS NULL`."
    },
    {
      tipo: "reto",
      de: "marcos",
      enunciado: "Ahora sí: pásame los clientes **sin teléfono** para escribirles un email. Quiero `id`, `nombre` y `email`, ordenados por `id`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas id, nombre y email", prueba: (r) => PRUEBA.columnas(r, ["id", "nombre", "email"]) },
        { texto: "Encuentra los 40 clientes sin teléfono", prueba: (r) => (r?.filas?.length ?? 0) === 40 },
        { texto: "Son los clientes sin teléfono, ordenados por id", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT id, nombre, email
FROM clientes
WHERE telefono IS NULL
ORDER BY id;`) }
      ],
      pistas: [
        "Lo que falló a Marcos fue `= NULL`. Pregunta por el vacío como se debe.",
        "SELECT id, nombre, email FROM clientes WHERE telefono IS NULL ORDER BY id;"
      ],
      solucion: `SELECT id, nombre, email
FROM clientes
WHERE telefono IS NULL
ORDER BY id;`
    }
  ]
});
