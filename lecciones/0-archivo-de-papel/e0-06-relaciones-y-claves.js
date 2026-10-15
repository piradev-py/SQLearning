CURSO.registrar({
  id: "e0-06",
  titulo: "Relaciones y claves",
  xp: 35,
  objetivo: "Sabrás identificar cada fila con una clave y decidir si una relación es 1:1, 1:N o N:M.",
  pasos: [
    {
      tipo: "historia",
      de: "lucia",
      asunto: "Los dos José García",
      texto: "Ya tienes las entidades: clientes, productos, ventas. Pero separadas no sirven de nada: hay que saber **qué cliente** hizo **qué venta**.\nEn 1998 lo resolvían escribiendo el nombre del cliente en cada ticket… y había dos José García distintos. Vamos a ver cómo se conectan las tablas sin confundir a nadie."
    },
    {
      tipo: "explicacion",
      titulo: "Clave primaria",
      texto: "Para conectar filas hay que identificar cada una sin dudas. Los nombres se repiten y cambian; por eso cada fila lleva una **clave primaria**: un dato **único** y que **nunca está vacío**. Es como el DNI de la fila.\nLo habitual es un número sin más significado: `id` 1, 2, 3…\nAunque haya dos José García, uno es el cliente `7` y otro el `15`. Asunto resuelto.",
      consejo: "No uses como clave algo que pueda cambiar, como un teléfono o un email. Un número interno que no significa nada es lo más seguro."
    },
    {
      tipo: "explicacion",
      titulo: "Clave foránea",
      texto: "En la tabla `ventas` no copias los datos del cliente: escribes solo su id, en una columna `cliente_id`. Esa columna es una **clave foránea**: un dato que **apunta** a la clave primaria de otra tabla.\nVenta 104 → `cliente_id` = 7 → buscas el 7 en `clientes` → José García, de Getafe.\nAsí el teléfono vive en un solo sitio (adiós al problema del Excel gigante) y cada venta sigue sabiendo quién compró. En SQL unirás las dos tablas con `JOIN`."
    },
    {
      tipo: "seleccionar",
      enunciado: "En `clientes`, el José García de Getafe tiene el id **7** y el de Madrid, el **15**. Marca las ventas del José García **de Getafe**.",
      tabla: {
        columnas: ["id", "fecha", "cliente_id", "producto"],
        filas: [
          [101, "02/03/1998", 15, "Walkman Sonora"],
          [102, "02/03/1998", 7, "Pilas (pack 4)"],
          [103, "05/03/1998", 3, "Radio portátil"],
          [104, "09/03/1998", 7, "Discman Sonora"],
          [105, "12/03/1998", 15, "Auriculares Sonora"],
          [106, "20/03/1998", 7, "Cintas de casete (pack 5)"]
        ]
      },
      modo: "filas",
      correctas: [1, 3, 5],
      pistas: [
        "La columna que apunta al cliente es `cliente_id`. No te fijes en `id`: esa es la clave de la venta.",
        "Busca las filas con `cliente_id` = 7: son las ventas 102, 104 y 106."
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Tipos de relación",
      texto: "- **1:1** (uno a uno): a cada uno le corresponde **como mucho uno** del otro lado. Cada empleado tiene una taquilla y cada taquilla es de un solo empleado.\n- **1:N** (uno a muchos): un cliente hace **muchas** ventas, pero cada venta es de **un solo** cliente. Es la más común. La clave foránea va en el lado de los «muchos» (`ventas.cliente_id`).\n- **N:M** (muchos a muchos): una venta incluye **varios** productos y un producto aparece en **muchas** ventas.\nTruco: pregunta **en los dos sentidos**. «¿Un cliente puede tener varias ventas?» Sí. «¿Una venta puede tener varios clientes?» No. Resultado: 1:N."
    },
    {
      tipo: "quiz",
      pregunta: "Cliente–Venta es 1:N. ¿Dónde va la clave foránea?",
      opciones: [
        "En `clientes`, en una columna `venta_id`",
        "En `ventas`, en una columna `cliente_id`",
        "En las dos tablas a la vez"
      ],
      correcta: 1,
      explicacion: "Cada venta tiene un único cliente, así que le basta una columna. En `clientes` no cabría: una celda `venta_id` solo guarda una venta, y un cliente puede tener cientos."
    },
    {
      tipo: "explicacion",
      titulo: "La tabla intermedia",
      texto: "Un N:M no cabe en una clave foránea: una venta con tres productos necesitaría tres columnas `producto_id`… ¿y si son veinte?\nLa solución es una **tabla intermedia**: `lineas_venta`, con una fila por cada producto de cada venta (`venta_id`, `producto_id` y la cantidad).\nAsí el N:M se convierte en **dos 1:N**: una venta tiene muchas líneas y un producto aparece en muchas líneas. Es lo que ves en cualquier ticket: cada línea, un producto.",
      consejo: "Si al diseñar te sale un N:M, busca la tabla intermedia. Casi siempre tiene datos propios: la cantidad, el precio de ese día, el descuento."
    },
    {
      tipo: "quiz",
      pregunta: "Un ticket de 1998 tiene 3 líneas, cada una con un producto distinto. ¿Cuántas filas genera en `lineas_venta`?",
      opciones: ["1", "3", "Ninguna: todo se guarda en `ventas`"],
      correcta: 1,
      explicacion: "Una fila por cada producto de la venta: 3 filas, todas con el mismo `venta_id`. La venta en sí (fecha, cliente) es 1 fila en `ventas`."
    },
    {
      tipo: "clasificar",
      reto: true,
      enunciado: "Lucía quiere el diseño pensado para las tiendas que vendrían después. Reglas: cada empleado trabaja en una sola tienda; cada tienda tiene un único encargado; cada producto lo suministra un solo proveedor. Elige el **tipo** de cada relación.",
      grupos: ["1:1", "1:N", "N:M"],
      elementos: [
        { texto: "Cliente – Venta", grupo: "1:N" },
        { texto: "Venta – Producto", grupo: "N:M" },
        { texto: "Tienda – Empleado", grupo: "1:N" },
        { texto: "Tienda – Encargado", grupo: "1:1" },
        { texto: "Proveedor – Producto", grupo: "1:N" },
        { texto: "Empleado – Curso de formación (cada empleado hace varios cursos y a cada curso van varios empleados)", grupo: "N:M" },
        { texto: "Cliente – Tarjeta de socio (cada cliente tiene como mucho una y cada tarjeta es de un solo cliente)", grupo: "1:1" }
      ],
      pistas: [
        "Para cada pareja, haz las dos preguntas: «¿un A puede tener varios B?» y «¿un B puede tener varios A?». Dos «no» = 1:1; un solo «sí» = 1:N; dos «sí» = N:M.",
        "Los N:M son Venta–Producto y Empleado–Curso; los 1:1, Tienda–Encargado y Cliente–Tarjeta de socio. Las otras tres son 1:N."
      ]
    }
  ]
});
