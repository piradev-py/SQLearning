CURSO.registrar({
  id: "e0-10",
  titulo: "Caso: Ordenar el archivo",
  xp: 60,
  objetivo: "Diseñarás en papel la base de datos completa de la primera tienda de Faro.",
  pasos: [
    {
      tipo: "historia",
      de: "lucia",
      asunto: "La última parte de la prueba",
      texto: "Última parte de tu prueba. Aquí tienes el **Excel gigante** de la tienda de Madrid de 1998: una sola hoja donde se apuntaba todo, mezclado.\nQuiero el plano de cómo debería guardarse: qué entidades, qué claves y cómo se relacionan. Si me convence, mañana tienes acceso a los sistemas."
    },
    {
      tipo: "explicacion",
      titulo: "El método en cuatro pasos",
      texto: "Así se pasa de una hoja caótica a un buen diseño:\n1. Lee cada columna y pregúntate **de qué cosa habla**: así salen las **entidades**.\n2. Dale a cada entidad su **clave primaria** 🔑.\n3. Une las entidades con **relaciones** y decide si son 1:1, 1:N o N:M.\n4. Convierte cada N:M en una **tabla intermedia**, y en cada 1:N pon la **clave foránea** en el lado de muchos.",
      consejo: "Escribe las reglas del negocio en frases antes de dibujar: «cada pedido lo atiende un solo empleado». Si no sabes si una regla es cierta, pregúntalo. Nunca la adivines."
    },
    {
      tipo: "seleccionar",
      modo: "celdas",
      enunciado: "Este es un trozo del Excel gigante. Rosa Prieto aparece en tres filas. Marca **todas** las celdas con su **nombre** y su **teléfono**: son datos que deberían guardarse **una sola vez**, en su ficha de cliente.",
      tabla: {
        columnas: ["nº pedido", "fecha", "cliente", "tel. cliente", "producto", "categoría", "precio", "unidades", "vendedor", "tienda"],
        filas: [
          [1001, "05/03/1998", "Rosa Prieto", "915 552 311", "Walkman", "Audio", "39,90", 1, "Pilar Ortega", "Madrid Centro"],
          [1001, "05/03/1998", "Rosa Prieto", "915 552 311", "Pilas (pack de 4)", "Audio", "1,75", 2, "Pilar Ortega", "Madrid Centro"],
          [1002, "06/03/1998", "Tomás Ibarra", "913 220 418", "Teléfono inalámbrico", "Telefonía", "59,00", 1, "Julián Pardo", "Madrid Centro"],
          [1003, "09/03/1998", "Rosa Prieto", "915 552 311", "Ratón", "Informática", "12,00", 1, "Julián Pardo", "Madrid Centro"]
        ]
      },
      correctas: [[0, 2], [0, 3], [1, 2], [1, 3], [3, 2], [3, 3]],
      pistas: [
        "Mira las columnas «cliente» y «tel. cliente», fila a fila.",
        "Son 6 celdas: el nombre y el teléfono de Rosa en las filas 1, 2 y 4."
      ]
    },
    {
      tipo: "clasificar",
      enunciado: "Paso 1 del método: ¿de qué **cosa** habla cada columna del Excel? Arrastra cada una a su entidad.",
      grupos: ["Cliente", "Pedido", "Producto", "Empleado", "Tienda", "Línea de pedido"],
      elementos: [
        { texto: "Nombre del cliente", grupo: "Cliente" },
        { texto: "Teléfono del cliente", grupo: "Cliente" },
        { texto: "Nº de pedido", grupo: "Pedido" },
        { texto: "Fecha del pedido", grupo: "Pedido" },
        { texto: "Nombre del producto", grupo: "Producto" },
        { texto: "Categoría del producto", grupo: "Producto" },
        { texto: "Nombre del vendedor", grupo: "Empleado" },
        { texto: "Dirección de la tienda", grupo: "Tienda" },
        { texto: "Unidades de ese producto en ese pedido", grupo: "Línea de pedido" }
      ],
      pistas: [
        "Casi todas son fáciles. La difícil son las unidades: no son del pedido entero ni del producto en general, sino de **ese producto dentro de ese pedido**.",
        "Las unidades van en **Línea de pedido**, la tabla intermedia entre Pedido y Producto."
      ]
    },
    {
      tipo: "quiz",
      pregunta: "En el pedido 1001, Rosa compró un walkman y unas pilas. Un pedido tiene varios productos y un producto está en muchos pedidos. ¿Cómo lo guardas?",
      opciones: [
        "Con una columna «productos» en el pedido: «Walkman, Pilas»",
        "Con una tabla intermedia **Línea de pedido**: una fila por cada producto de cada pedido",
        "Repitiendo el pedido 1001 en la tabla de pedidos, una vez por producto"
      ],
      correcta: 1,
      explicacion: "Es una relación N:M, y una N:M se resuelve con una tabla intermedia. Cada fila de Línea de pedido apunta a un pedido y a un producto, y guarda lo que es de esa pareja: las unidades."
    },
    {
      tipo: "quiz",
      pregunta: "El walkman costaba 39,90 en marzo de 1998, pero en diciembre la tienda lo rebajó. ¿Dónde guardas el precio que **pagó Rosa** en su pedido?",
      opciones: [
        "Solo en Producto: el precio es un dato del producto",
        "En Cliente, junto a su teléfono",
        "En Línea de pedido, además del precio actual en Producto"
      ],
      correcta: 2,
      explicacion: "El precio del catálogo cambia, pero lo que Rosa pagó no debe cambiar nunca. Por eso se copia en la línea el precio del momento de la venta. Es una «repetición» a propósito: guarda la historia."
    },
    {
      tipo: "quiz",
      pregunta: "Cada pedido es de un solo cliente, y un cliente hace muchos pedidos. ¿Dónde va la clave foránea `cliente_id`?",
      opciones: ["En Cliente", "En Pedido", "En Línea de pedido"],
      correcta: 1,
      explicacion: "La clave foránea vive en el lado de **muchos**: cada pedido apunta a su cliente con `cliente_id`. Al revés no cabría: un cliente necesitaría una columna por cada pedido."
    },
    {
      tipo: "diagrama",
      reto: true,
      enunciado: "Dibuja el plano completo de la tienda de 1998. Estas son las reglas del negocio:\n• Cada **empleado** trabaja en una sola **tienda**; una tienda tiene muchos empleados.\n• Cada **pedido** lo atiende un solo **empleado**; un empleado atiende muchos pedidos.\n• Cada **pedido** es de un solo **cliente**; un cliente hace muchos pedidos.\n• Un **pedido** tiene varias **líneas**; cada línea pertenece a un solo pedido.\n• Cada **línea** es de un solo **producto**; un producto aparece en muchas líneas.\nLa N:M entre pedido y producto ya está resuelta con **Línea de pedido**: no la dibujes directa.",
      entidades: [
        { id: "tienda", nombre: "Tienda", atributos: ["id 🔑", "nombre", "dirección", "ciudad"] },
        { id: "empleado", nombre: "Empleado", atributos: ["id 🔑", "nombre", "puesto"] },
        { id: "cliente", nombre: "Cliente", atributos: ["id 🔑", "nombre", "teléfono"] },
        { id: "producto", nombre: "Producto", atributos: ["id 🔑", "nombre", "categoría", "precio"] },
        { id: "linea", nombre: "Línea de pedido", atributos: ["id 🔑", "unidades", "precio pagado"] },
        { id: "pedido", nombre: "Pedido", atributos: ["id 🔑", "fecha"] }
      ],
      relaciones: [
        { de: "tienda", a: "empleado", tipo: "1:N" },
        { de: "empleado", a: "pedido", tipo: "1:N" },
        { de: "cliente", a: "pedido", tipo: "1:N" },
        { de: "pedido", a: "linea", tipo: "1:N" },
        { de: "producto", a: "linea", tipo: "1:N" }
      ],
      pistas: [
        "Son 5 relaciones y todas son `1:N`. En cada una, pon en «De» la entidad de la que hay **una** y en «A» la de la que hay **muchas**.",
        "**Tienda 1:N Empleado**, **Empleado 1:N Pedido**, **Cliente 1:N Pedido**, **Pedido 1:N Línea de pedido** y **Producto 1:N Línea de pedido**."
      ]
    }
  ]
});
