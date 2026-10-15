CURSO.registrar({
  id: "e4-01",
  titulo: "Claves que conectan tablas: PK y FK",
  xp: 25,
  objetivo: "Sabrás qué es una clave primaria y una clave foránea, cómo se ven en el Esquema y cómo seguir a mano el hilo de un número de una tabla a otra.",
  pasos: [
    {
      tipo: "historia",
      de: "hector",
      asunto: "Mi sistema solo habla en números",
      texto: "¡Hola otra vez! Héctor, de logística, el del catálogo. Te he dejado un café en la mesa, que hoy te va a hacer falta.\nMi sistema de envíos guarda cosas como «envío 1: almacén 4, transportista 2». ¿Y quién es el 4? ¿Y el 2? Cada vez que alguien me pregunta, abro tres pestañas y cruzo números a mano.\nLucía dice que la base de datos sabe qué número va con qué. ¿Me enseñas a leerlo?"
    },
    {
      tipo: "explicacion",
      titulo: "La clave primaria (PK)",
      texto: "Ya la conoces de la etapa 1: la columna con la llave 🔑 es la **clave primaria** o **PK** (del inglés *primary key*). Cumple dos reglas: **nunca se repite** y **nunca está vacía** (`NULL`). Es el DNI de cada fila.\nMira la tabla nueva `envios`: su PK es `id`. Las otras columnas que acaban en `_id` no identifican al envío: son números **de otras tablas**. Ojo, `envios.id` es el número del envío, **no** el del pedido; el pedido está en `pedido_id`.",
      ejemplo: `SELECT id, pedido_id, almacen_id, transportista_id, estado
FROM envios
ORDER BY id
LIMIT 5;`,
      consejo: "Cada tabla tiene su propio contador de `id`. El envío 1 y el pedido 1 no tienen nada que ver. Confundirlos es el error más típico de la primera semana."
    },
    {
      tipo: "explicacion",
      titulo: "Una PK de dos columnas",
      texto: "A veces una sola columna no basta para identificar una fila. En `lineas_pedido` hay una fila por cada producto de cada pedido: un pedido puede tener varias líneas y un mismo producto aparece en muchos pedidos.\nLo que **no** se repite nunca es la **pareja** `pedido_id` + `producto_id`. Por eso la PK es **compuesta**: las dos columnas juntas. En el Esquema verás la llave 🔑 en ambas.",
      ejemplo: `SELECT pedido_id, producto_id, cantidad
FROM lineas_pedido
ORDER BY pedido_id, producto_id
LIMIT 6;`
    },
    {
      tipo: "explicacion",
      titulo: "La clave foránea (FK)",
      texto: "Una **clave foránea** o **FK** (*foreign key*) es una columna que **apunta** a la PK de otra tabla. `envios.almacen_id` apunta a `almacenes.id`; `pedidos.cliente_id`, a `clientes.id`. Es como escribir en una ficha «ver cliente nº 37» en vez de copiar todos sus datos.\nAbre la pestaña **Esquema**: junto a cada FK aparece una flecha, por ejemplo `→ almacenes.id`.\nAdemás, la base de datos vigila esas flechas: no te deja guardar un envío del almacén 99 si ese almacén no existe. Se llama **integridad referencial**.",
      consejo: "Una FK sí puede estar vacía si la columna lo permite. En `almacenes`, `responsable_id` apunta a `empleados`, pero hay almacenes con `NULL`: de momento no tienen responsable asignado."
    },
    {
      tipo: "explicacion",
      titulo: "Uno a muchos y uno a uno",
      texto: "Las FK dibujan las relaciones que viste en la etapa 0:\n- **1:N** (uno a muchos): un cliente tiene muchos pedidos, pero cada pedido es de un solo cliente. La FK va en el lado «muchos» (`pedidos.cliente_id`).\n- **1:1** (uno a uno): en `envios`, la columna `pedido_id` es **UNIQUE** (no se puede repetir). Así, un pedido tiene **como mucho un** envío. Los pedidos de tienda física no tienen ninguno: el cliente se lleva la compra puesta."
    },
    {
      tipo: "quiz",
      pregunta: "¿Qué columna de `envios` apunta a la tabla `transportistas`?",
      opciones: ["`id`", "`transportista_id`", "`pedido_id`"],
      correcta: 1,
      explicacion: "`transportista_id` es la FK que apunta a `transportistas.id`. `id` es la PK del propio envío, y `pedido_id` apunta a `pedidos`."
    },
    {
      tipo: "quiz",
      pregunta: "¿Por qué `pedido_id` es UNIQUE en `envios` pero se repite en `lineas_pedido`?",
      opciones: [
        "Porque un pedido sale en un solo envío, pero puede tener varias líneas (una por producto)",
        "Porque en `lineas_pedido` hay pedidos duplicados por error",
        "Porque `envios` es una tabla más nueva"
      ],
      correcta: 0,
      explicacion: "Es la diferencia entre 1:1 y 1:N. Un pedido viaja en un único envío, así que en `envios` no puede repetirse. En cambio, un pedido con tres productos tiene tres líneas, y su `pedido_id` aparece tres veces."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT id, pedido_id
FROM envios
WHERE id = 1;`,
      pregunta: "¿Qué `pedido_id` tiene el envío con `id` 1?",
      opciones: ["1, igual que su id", "2", "NULL"],
      correcta: 1,
      explicacion: "El envío 1 es del pedido **2**. Los números de una tabla y de otra no tienen por qué coincidir: para saber de qué pedido es un envío, mira siempre la FK `pedido_id`."
    },
    {
      tipo: "ejercicio",
      enunciado: "Sigue el hilo del envío 1, como haría Héctor. Primer paso: muestra su `almacen_id` y su `transportista_id` (la fila de `envios` con `id = 1`), en ese orden.",
      solucion: `SELECT almacen_id, transportista_id
FROM envios
WHERE id = 1;`,
      pistas: [
        "La tabla es `envios` y el filtro es `WHERE id = 1`.",
        "SELECT almacen_id, transportista_id FROM envios WHERE id = 1;"
      ]
    },
    {
      tipo: "ejercicio",
      enunciado: "El envío 1 salió del almacén **4**. Segundo paso: busca en `almacenes` la fila con ese `id` y muestra su `nombre` y su `ciudad`.",
      solucion: `SELECT nombre, ciudad
FROM almacenes
WHERE id = 4;`,
      pistas: [
        "Ahora la tabla es `almacenes`, y el número 4 es su `id`.",
        "SELECT nombre, ciudad FROM almacenes WHERE id = 4;"
      ]
    },
    {
      tipo: "reto",
      de: "hector",
      enunciado: "Me han pedido el nombre del **responsable del Almacén Levante** para una firma. Hazlo en dos consultas: primero busca su `responsable_id` en `almacenes`; después, con ese número, saca el `nombre` de la tabla `empleados`.\nEscribe las dos consultas en el editor, una detrás de otra: se revisa la **última**, que debe devolver solo el `nombre`.",
      inicial: "-- Escribe aquí tus dos consultas\n",
      varias: true,
      comprobaciones: [
        { texto: "La última consulta devuelve una sola fila", prueba: (r) => (r?.filas?.length ?? 0) === 1 },
        { texto: "Muestra solo una columna, con el nombre", prueba: (r) => (r?.columnas?.length ?? 0) === 1 },
        { texto: "Es la persona responsable del Almacén Levante", prueba: (r) => (r?.filas ?? []).some(f => (f ?? []).includes("Óscar Medina")) },
        { texto: "Lo buscas en las tablas almacenes y empleados", prueba: () => /\balmacenes\b/i.test(PRUEBA.codigo()) && /\bfrom\s+empleados\b/i.test(PRUEBA.codigo()) }
      ],
      pistas: [
        "Primero: `SELECT responsable_id FROM almacenes WHERE nombre = 'Almacén Levante';`. Apunta el número que sale y úsalo en un `WHERE id = …` sobre `empleados`.",
        "El responsable_id es 18. La segunda consulta: SELECT nombre FROM empleados WHERE id = 18;"
      ],
      solucion: `SELECT responsable_id
FROM almacenes
WHERE nombre = 'Almacén Levante';

SELECT nombre
FROM empleados
WHERE id = 18;`
    }
  ]
});
