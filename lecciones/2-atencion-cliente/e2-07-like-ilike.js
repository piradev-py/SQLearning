CURSO.registrar({
  id: "e2-07",
  titulo: "Buscar texto: LIKE e ILIKE",
  xp: 35,
  objetivo: "Sabrás buscar filas por un trozo de texto (lo que empieza, termina o contiene algo), con o sin distinguir mayúsculas.",
  pasos: [
    {
      tipo: "historia",
      de: "marcos",
      asunto: "«No me acuerdo bien de cómo se escribía»",
      texto: "Media jornada me la paso con frases como «mi email era algo de empresa…» o «el producto se llamaba Auriculares no sé qué».\nCon `=` tengo que escribir el texto **exacto**, letra por letra, y casi nunca lo tengo. Necesito buscar por **un trozo** del texto."
    },
    {
      tipo: "explicacion",
      titulo: "LIKE y el comodín %",
      texto: "`LIKE` compara un texto con un **patrón**. En el patrón, `%` significa «cualquier cosa, de cualquier longitud (incluso nada)»:\n- `'Auriculares%'` → empieza por «Auriculares».\n- `'%Pro'` → termina en «Pro».\n- `'%Sonora%'` → contiene «Sonora» en cualquier sitio.\nSin `%`, `LIKE` funciona igual que `=`.",
      ejemplo: `SELECT nombre, precio
FROM productos
WHERE nombre LIKE 'Auriculares%'
ORDER BY nombre;`,
      consejo: "Un patrón que empieza por `%` obliga a revisar todas las filas una a una. Con 300 clientes no lo notas; con 300 millones, sí. Si sabes cómo empieza el texto, dilo."
    },
    {
      tipo: "ejercicio",
      enunciado: "Muestra `id`, `nombre` y `email` de los clientes cuyo email **termina en** `@empresa.example`, ordenados por `id`.",
      solucion: `SELECT id, nombre, email
FROM clientes
WHERE email LIKE '%@empresa.example'
ORDER BY id;`,
      pistas: [
        "«Termina en» = el `%` va **delante** del texto: `'%@empresa.example'`.",
        "SELECT id, nombre, email FROM clientes WHERE email LIKE '%@empresa.example' ORDER BY id;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "El comodín _: exactamente un carácter",
      texto: "El guion bajo `_` significa «**un** carácter cualquiera, ni más ni menos». Dos guiones bajos, dos caracteres; tres, tres.\nEn el ejemplo, `'Cargador Volta __ W'` encuentra los cargadores de 30 W y de 65 W: en el hueco caben justo dos caracteres.",
      ejemplo: `SELECT nombre, precio
FROM productos
WHERE nombre LIKE 'Cargador Volta __ W';`
    },
    {
      tipo: "quiz",
      pregunta: "¿Qué productos encuentra `WHERE nombre LIKE 'Altavoz Sonora ____'` (con **cuatro** guiones bajos)? En la tabla hay un «Altavoz Sonora Mini» y un «Altavoz Sonora Boom».",
      opciones: [
        "Solo el Altavoz Sonora Mini",
        "Los dos: Mini y Boom",
        "Ninguno: `_` no sirve para letras"
      ],
      correcta: 1,
      explicacion: "«Mini» y «Boom» tienen cuatro letras cada uno, y cada `_` vale por un carácter cualquiera, sea letra, número o espacio."
    },
    {
      tipo: "explicacion",
      titulo: "Mayúsculas: LIKE las distingue, ILIKE no",
      texto: "`LIKE` distingue mayúsculas: `'caja%'` no encuentra «Caja dañada». Y en Faro los textos se guardan con **mayúscula inicial**, así que es fácil fallar.\nPostgreSQL tiene **ILIKE**: el mismo patrón, pero sin distinguir mayúsculas y minúsculas. Con `ILIKE 'caja%'` sí aparecen las reclamaciones por caja dañada.",
      ejemplo: `SELECT id, fecha, motivo
FROM reclamaciones
WHERE motivo ILIKE 'caja%'
ORDER BY id;`,
      consejo: "Cuando buscas lo que ha escrito una persona (nombres, motivos, notas), usa `ILIKE`: nunca sabes si lo escribió con mayúsculas o sin ellas.",
      otrosMotores: "`ILIKE` es propio de PostgreSQL. En MySQL y SQL Server, `LIKE` normalmente ya ignora las mayúsculas (depende de la configuración de la tabla). En Oracle y BigQuery se usa `LOWER(motivo) LIKE 'caja%'`, pasando el texto a minúsculas antes de comparar."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT id, motivo
FROM reclamaciones
WHERE motivo LIKE 'producto%';`,
      pregunta: "Hay 8 reclamaciones cuyo motivo empieza por «Producto…» (distinto al pedido o defectuoso). ¿Cuántas filas devolverá esta consulta?",
      opciones: ["8", "0", "Un error"],
      correcta: 1,
      explicacion: "Los motivos empiezan por «P» mayúscula y el patrón usa «p» minúscula. `LIKE` las distingue, así que no encaja ninguno. Con `ILIKE 'producto%'` saldrían las 8."
    },
    {
      tipo: "reto",
      de: "marcos",
      enunciado: "Quiero revisar todas las reclamaciones sobre **productos**. Muéstrame `id`, `fecha`, `motivo` y `estado` de las reclamaciones cuyo motivo contenga la palabra «producto» **en cualquier posición y sin importar mayúsculas**. Ordénalas por `fecha` y, a igual fecha, por `id`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas id, fecha, motivo y estado", prueba: (r) => PRUEBA.columnas(r, ["id", "fecha", "motivo", "estado"]) },
        { texto: "Encuentra las 8 reclamaciones sobre productos", prueba: (r) => (r?.filas?.length ?? 0) === 8 },
        { texto: "Son las reclamaciones pedidas, ordenadas por fecha", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT id, fecha, motivo, estado
FROM reclamaciones
WHERE motivo ILIKE '%producto%'
ORDER BY fecha, id;`) }
      ],
      pistas: [
        "«En cualquier posición» = `%` delante y detrás. «Sin importar mayúsculas» = `ILIKE`.",
        "SELECT id, fecha, motivo, estado FROM reclamaciones WHERE motivo ILIKE '%producto%' ORDER BY fecha, id;"
      ],
      solucion: `SELECT id, fecha, motivo, estado
FROM reclamaciones
WHERE motivo ILIKE '%producto%'
ORDER BY fecha, id;`
    }
  ]
});
