CURSO.registrar({
  id: "e2-09",
  titulo: "Caso: Clientes de madrugada",
  xp: 60,
  objetivo: "Sabrás seguir el rastro de un problema de una tabla a otra usando sus identificadores y combinar los filtros de la etapa para encontrar un patrón.",
  pasos: [
    {
      tipo: "historia",
      de: "marcos",
      asunto: "«Yo no hice ese pedido»",
      texto: "Tengo al teléfono a **Iratxe Muñoz**, una clienta de Bilbao de toda la vida. Dice que en su historial aparece un pedido que ella **no ha hecho**, y ya ha abierto una reclamación.\nNo sé el número de la reclamación ni el del pedido, y la clienta está bastante enfadada. ¿Me ayudas a tirar del hilo?"
    },
    {
      tipo: "explicacion",
      titulo: "Tirar del hilo: de una tabla a otra",
      texto: "Las tablas de Faro están conectadas por números. Cada reclamación guarda un `cliente_id` (el `id` del cliente en `clientes`) y un `pedido_id` (el `id` del pedido en `pedidos`).\nEn el ejemplo, la reclamación 1 es del cliente 186 sobre el pedido 16. Para ver ese pedido, harías una segunda consulta: `SELECT * FROM pedidos WHERE id = 16;`.\nApunta el número, cambia de tabla y sigue.",
      ejemplo: `SELECT id, cliente_id, pedido_id, motivo
FROM reclamaciones
WHERE id = 1;`,
      consejo: "Más adelante aprenderás a unir tablas en una sola consulta. Pero ir paso a paso, anotando cada número, es exactamente como empieza cualquier investigación de datos: primero entiendes el caso concreto y después buscas si se repite."
    },
    {
      tipo: "ejercicio",
      enunciado: "Empieza por la ficha de la clienta: muestra `id`, `nombre`, `email` y `ciudad` del cliente cuyo nombre es exactamente `'Iratxe Muñoz'`.",
      solucion: `SELECT id, nombre, email, ciudad
FROM clientes
WHERE nombre = 'Iratxe Muñoz';`,
      pistas: [
        "Un `WHERE nombre = '…'` con el nombre escrito tal cual, con su tilde y su mayúscula.",
        "SELECT id, nombre, email, ciudad FROM clientes WHERE nombre = 'Iratxe Muñoz';"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "De un dato suelto a un patrón",
      texto: "Una reclamación es un caso concreto. La pregunta importante viene después: **¿se repite?** Para eso buscas lo que tiene de raro (la hora, el tipo de pedido, el email…) y filtras toda la tabla por esos rasgos.\nOjo: un rasgo por separado no demuestra nada. En Faro hay clientes de verdad que se dan de alta de madrugada. Lo que llama la atención es que **varias cosas coincidan a la vez**.",
      consejo: "Un buen analista no acusa a nadie con una consulta: describe lo que ve, con cifras, y deja las conclusiones para cuando tiene pruebas."
    },
    {
      tipo: "caso",
      de: "marcos",
      enunciado: "Ya sabemos quién es Iratxe. Ahora vamos a por su reclamación, el pedido que no reconoce… y a ver si es un caso aislado.",
      partes: [
        {
          enunciado: "Busca la reclamación: muestra `id`, `cliente_id`, `pedido_id`, `fecha`, `motivo` y `estado` de las reclamaciones cuyo motivo contenga la palabra «**reconozco**», sin importar mayúsculas.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas id, cliente_id, pedido_id, fecha, motivo y estado", prueba: (r) => PRUEBA.columnas(r, ["id", "cliente_id", "pedido_id", "fecha", "motivo", "estado"]) },
            { texto: "Encuentra una sola reclamación", prueba: (r) => (r?.filas?.length ?? 0) === 1 },
            { texto: "Es la reclamación que habla de «reconozco»", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT id, cliente_id, pedido_id, fecha, motivo, estado
FROM reclamaciones
WHERE motivo ILIKE '%reconozco%';`) }
          ],
          pistas: [
            "«Contiene, sin importar mayúsculas» = `ILIKE` con `%` delante y detrás.",
            "SELECT id, cliente_id, pedido_id, fecha, motivo, estado FROM reclamaciones WHERE motivo ILIKE '%reconozco%';"
          ],
          solucion: `SELECT id, cliente_id, pedido_id, fecha, motivo, estado
FROM reclamaciones
WHERE motivo ILIKE '%reconozco%';`
        },
        {
          enunciado: "Ahora mira el pedido de esa reclamación (su `pedido_id`) en la tabla `pedidos`: muestra `id`, `fecha`, `tienda_id`, `estado` y `metodo_pago` de ese pedido.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas id, fecha, tienda_id, estado y metodo_pago", prueba: (r) => PRUEBA.columnas(r, ["id", "fecha", "tienda_id", "estado", "metodo_pago"]) },
            { texto: "Devuelve un solo pedido", prueba: (r) => (r?.filas?.length ?? 0) === 1 },
            { texto: "Es el pedido de la reclamación", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT id, fecha, tienda_id, estado, metodo_pago
FROM pedidos
WHERE id = 2210;`) }
          ],
          pistas: [
            "El número que buscas está en la columna `pedido_id` de la parte anterior. Úsalo en `WHERE id = …` sobre `pedidos`.",
            "SELECT id, fecha, tienda_id, estado, metodo_pago FROM pedidos WHERE id = 2210;"
          ],
          solucion: `SELECT id, fecha, tienda_id, estado, metodo_pago
FROM pedidos
WHERE id = 2210;`
        },
        {
          tipo: "interpretar",
          pregunta: "Iratxe dice que a esas horas estaba durmiendo. ¿A qué **hora** se hizo el pedido? Escríbela como `HH:MM`.",
          respuesta: ["03:12", "3:12", "03:12:41", "3:12:41"],
          pistas: [
            "Mira la columna `fecha` del pedido: después del día viene la hora.",
            "El pedido es del 14 de agosto de 2026 a las 03:12:41: escribe 03:12."
          ],
          solucion: `SELECT fecha
FROM pedidos
WHERE id = 2210;`
        },
        {
          enunciado: "Un pedido de la tienda online (`tienda_id` 5), de madrugada y reembolsado. Lucía ha visto que en las altas de los últimos meses se repite un dominio de email que nunca había visto: `@correo-rapido.example`. Lista los clientes cuyo email **termina en** `@correo-rapido.example`: `id`, `nombre`, `email`, `ciudad` y `alta`, ordenados por `alta` de más antiguo a más reciente.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas id, nombre, email, ciudad y alta", prueba: (r) => PRUEBA.columnas(r, ["id", "nombre", "email", "ciudad", "alta"]) },
            { texto: "Están ordenados por fecha de alta", prueba: (r) => PRUEBA.ordenado(r, "alta", "asc") },
            { texto: "Son todos los clientes de ese dominio", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT id, nombre, email, ciudad, alta
FROM clientes
WHERE email LIKE '%@correo-rapido.example'
ORDER BY alta;`) }
          ],
          pistas: [
            "«Termina en» = `LIKE` con el `%` delante del dominio. Después, `ORDER BY alta`.",
            "SELECT id, nombre, email, ciudad, alta FROM clientes WHERE email LIKE '%@correo-rapido.example' ORDER BY alta;"
          ],
          solucion: `SELECT id, nombre, email, ciudad, alta
FROM clientes
WHERE email LIKE '%@correo-rapido.example'
ORDER BY alta;`
        },
        {
          tipo: "interpretar",
          pregunta: "Mira la columna `ciudad` de esos clientes. ¿De qué ciudad son **todos**?",
          respuesta: "Getafe",
          pistas: [
            "Todas las filas de la parte anterior tienen la misma ciudad.",
            "Lo verás con: SELECT DISTINCT ciudad FROM clientes WHERE email LIKE '%@correo-rapido.example';"
          ],
          solucion: `SELECT DISTINCT ciudad
FROM clientes
WHERE email LIKE '%@correo-rapido.example';`
        }
      ],
      expediente: {
        id: "clientes-de-madrugada",
        titulo: "Clientes de madrugada",
        texto: "**Iratxe Muñoz**, clienta de Bilbao, reclama el pedido **2210**: hecho en la tienda online el 14 de agosto de 2026 a las **03:12** y ya **reembolsado**. Ella asegura que nunca lo hizo.\nTirando del hilo aparecen **9 clientes** con email `@correo-rapido.example`, todos de **Getafe**, sin teléfono, dados de alta entre las **2:00 y las 5:00** de la madrugada, entre marzo y agosto de 2026. En atención al cliente nadie recuerda haber hablado con ninguno de ellos.\n¿Quién da de alta clientes a las tres de la mañana? ¿Y a quién se le devolvió el dinero de un pedido que nadie reconoce?"
      }
    }
  ]
});
