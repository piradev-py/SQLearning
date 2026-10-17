CURSO.registrar({
  id: "e2-01",
  titulo: "Filtrar filas: WHERE",
  xp: 25,
  rumor: "Marcos lleva toda la mañana al teléfono con una clienta de **Bilbao**. Jura que hay un pedido a su nombre que ella nunca hizo. Él ya no sabe qué decirle. Apúntatelo: cuando un cliente insiste tanto, a veces tiene razón.",
  objetivo: "Sabrás quedarte solo con las filas que cumplen una condición de igualdad, con números y con textos.",
  pasos: [
    {
      tipo: "historia",
      de: "marcos",
      asunto: "¿Me echas una mano? Tengo a alguien al teléfono",
      texto: "Hola, soy Marcos, de atención al cliente. Lucía dice que sabes manejarte con la base de datos.\nMi problema: cada vez que llama alguien, tengo que encontrar **su ficha** entre cientos de clientes y miles de pedidos. Con `SELECT * FROM clientes` me sale la lista entera y me pierdo bajando con la rueda del ratón.\n¿Hay forma de pedirle **solo** la fila que busco?"
    },
    {
      tipo: "explicacion",
      titulo: "WHERE: solo las filas que cumplen",
      texto: "Hasta ahora elegías **columnas**. Con **WHERE** eliges **filas**: va después de `FROM` y lleva una **condición**.\nPostgreSQL la comprueba fila por fila y solo devuelve las que dan **verdadero**, como filtrar fichas a mano.\nLa condición más sencilla es la igualdad, con `=`: `WHERE id = 25` → «solo la fila cuyo id es 25». Los números se escriben tal cual, sin comillas.",
      ejemplo: `SELECT nombre, email, ciudad
FROM clientes
WHERE id = 25;`,
      consejo: "Buscar por `id` es lo más seguro: es la clave primaria y nunca se repite. Si un cliente te da su número de cliente, úsalo antes que su nombre (hay muchos «Mario» en Faro)."
    },
    {
      tipo: "interpretar",
      pregunta: "Llama el cliente número **1** y no recuerda en qué ciudad se dio de alta. ¿De qué ciudad es? Escribe solo la ciudad.",
      respuesta: "Valencia",
      pistas: [
        "Filtra la tabla `clientes` con `WHERE id = 1` y mira la columna `ciudad`.",
        "SELECT ciudad FROM clientes WHERE id = 1;"
      ],
      solucion: `SELECT ciudad
FROM clientes
WHERE id = 1;`
    },
    {
      tipo: "explicacion",
      titulo: "Textos: comillas simples y mayúsculas",
      texto: "Para comparar con un **texto**, escríbelo entre **comillas simples**: `WHERE ciudad = 'Bilbao'`.\nY ojo: en PostgreSQL los textos se comparan **letra a letra**, así que distinguen mayúsculas y minúsculas. `'Bilbao'` y `'bilbao'` son textos distintos. En la tabla, las ciudades están escritas con la primera letra en mayúscula, así que hay que escribirlas igual.\nCon las columnas es al revés: `CIUDAD`, `Ciudad` y `ciudad` son la misma.",
      ejemplo: `SELECT nombre, email
FROM clientes
WHERE ciudad = 'Bilbao';`,
      consejo: "Las comillas **dobles** son para nombres (como los alias con espacios), no para textos. `WHERE ciudad = \"Bilbao\"` da error: PostgreSQL busca una **columna** llamada Bilbao.",
      otrosMotores: "En MySQL y SQL Server la configuración habitual **no** distingue mayúsculas al comparar textos: allí `'bilbao'` encontraría a los de Bilbao. MySQL además acepta comillas dobles para textos. Para no llevarte sorpresas, escribe siempre comillas simples y el texto tal como está guardado."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT nombre, email
FROM clientes
WHERE ciudad = 'madrid';`,
      pregunta: "En Faro hay 87 clientes de Madrid. ¿Qué devolverá esta consulta?",
      opciones: ["Los 87 clientes de Madrid", "Ninguna fila", "Un error"],
      correcta: 1,
      explicacion: "No da error (la consulta está bien escrita), pero en la tabla pone `Madrid`, con mayúscula, y `'madrid'` no es igual. Ninguna fila cumple la condición, así que el resultado sale vacío. Es uno de los despistes más frecuentes: si un filtro no devuelve nada, revisa cómo está escrito el texto."
    },
    {
      tipo: "ejercicio",
      enunciado: "Marcos quiere tener a mano los pedidos que aún están de camino. Muestra `id`, `cliente_id`, `fecha` y `total` de los pedidos cuyo `estado` es `en camino` (así, en minúsculas y con espacio).",
      solucion: `SELECT id, cliente_id, fecha, total
FROM pedidos
WHERE estado = 'en camino';`,
      pistas: [
        "Elige las cuatro columnas de `pedidos` y añade `WHERE estado = '…'` con el texto entre comillas simples.",
        "SELECT id, cliente_id, fecha, total FROM pedidos WHERE estado = 'en camino';"
      ]
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería mostrar `nombre` y `telefono` de los clientes de **Sevilla**, pero da error. Arréglala.",
      inicial: `SELECT nombre, telefono
FROM clientes
WHERE ciudad = "Sevilla";`,
      solucion: `SELECT nombre, telefono
FROM clientes
WHERE ciudad = 'Sevilla';`,
      pistas: [
        "Lee el error: PostgreSQL cree que `Sevilla` es el nombre de una columna. ¿Qué comillas llevan los textos?",
        "Cambia las comillas dobles por simples: WHERE ciudad = 'Sevilla';"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Cada cláusula en su sitio",
      texto: "Las partes de una consulta se llaman **cláusulas** y van siempre en este orden:\n`SELECT` → `FROM` → `WHERE` → `ORDER BY` → `LIMIT`\nPrimero se filtra y después se ordena y se corta. El ejemplo muestra los 5 pedidos en camino más recientes: filtra por estado, ordena por fecha de más reciente a más antigua y se queda con 5.",
      ejemplo: `SELECT id, fecha, total
FROM pedidos
WHERE estado = 'en camino'
ORDER BY fecha DESC
LIMIT 5;`,
      consejo: "Pon cada cláusula en su propia línea. Cuando una consulta crece, se lee de un vistazo qué se elige, de dónde, qué se filtra y cómo se ordena."
    },
    {
      tipo: "quiz",
      pregunta: "¿Cuál de estas consultas tiene las cláusulas en el orden correcto?",
      opciones: [
        "`SELECT nombre FROM clientes ORDER BY nombre WHERE ciudad = 'Bilbao';`",
        "`SELECT nombre WHERE ciudad = 'Bilbao' FROM clientes ORDER BY nombre;`",
        "`SELECT nombre FROM clientes WHERE ciudad = 'Bilbao' ORDER BY nombre;`"
      ],
      correcta: 2,
      explicacion: "`WHERE` va justo después de `FROM` (primero se dice de qué tabla y luego qué filas) y `ORDER BY` después de `WHERE`. Las otras dos dan error de sintaxis."
    },
    {
      tipo: "reto",
      de: "marcos",
      enunciado: "Tengo en línea a alguien que solo me da su email: `julia.martinez@mail.example`. Sácame **todas las columnas** de su ficha en la tabla `clientes`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene todas las columnas de clientes", prueba: (r) => PRUEBA.columnas(r, ["id", "nombre", "email", "telefono", "ciudad", "socio", "alta"]) },
        { texto: "Devuelve una sola fila", prueba: (r) => (r?.filas?.length ?? 0) === 1 },
        { texto: "Es la ficha de Julia Martínez", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT *
FROM clientes
WHERE email = 'julia.martinez@mail.example';`) }
      ],
      pistas: [
        "Usa `SELECT *` sobre `clientes` y filtra con `WHERE email = '…'`. El email es un texto: comillas simples y escrito exactamente igual.",
        "SELECT * FROM clientes WHERE email = 'julia.martinez@mail.example';"
      ],
      solucion: `SELECT *
FROM clientes
WHERE email = 'julia.martinez@mail.example';`
    }
  ]
});
