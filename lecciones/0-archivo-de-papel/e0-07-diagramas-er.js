CURSO.registrar({
  id: "e0-07",
  titulo: "Diagramas entidad-relación",
  xp: 40,
  objetivo: "Sabrás leer y dibujar un diagrama entidad-relación con la notación pata de gallo.",
  pasos: [
    {
      tipo: "historia",
      de: "lucia",
      asunto: "Un plano antes de construir",
      texto: "Ya sabes qué cosas guardaba la tienda de 1998 y cómo se relacionan. Pero contado en frases no cabe en una reunión.\nAntes de construir una casa, alguien dibuja el plano. Con una base de datos pasa lo mismo: dibujamos un **diagrama entidad-relación**. Hoy aprendes a leerlo y a dibujarlo."
    },
    {
      tipo: "explicacion",
      titulo: "Cajas y líneas",
      texto: "Un **diagrama entidad-relación** (también **diagrama ER**) es el plano de una base de datos.\nCada **entidad** es una **caja**: arriba, su nombre (`Cliente`); debajo, sus atributos. La clave primaria se marca con una llave 🔑 y las claves foráneas, a menudo, con una flecha o un eslabón.\nCada **relación** es una **línea** entre dos cajas. Se lee como una frase con un verbo: «un cliente **hace** pedidos», «una tienda **tiene** empleados».",
      consejo: "Lee cada línea en voz alta **en los dos sentidos**: «un cliente hace muchos pedidos» y «cada pedido es de un solo cliente». Si una de las dos frases suena rara, la línea está mal."
    },
    {
      tipo: "explicacion",
      titulo: "La pata de gallo",
      texto: "¿Cómo dice la línea **cuántos** hay de cada lado? Con unos símbolos en sus extremos: la notación **pata de gallo** (en inglés, *crow's foot*).\n• Una **rayita** cruzada sobre la línea significa **uno**.\n• Tres patitas abiertas, como la huella de un gallo, significan **muchos**.\nEntre `Cliente` y `Pedido`, la rayita va junto a Cliente y la pata junto a Pedido: un cliente, muchos pedidos. La pata siempre se dibuja en el lado de **muchos**, que es también donde vive la clave foránea. Una N:M lleva pata en **los dos** extremos.\nEn la mesa verás `1` y `N` en lugar de dibujos: significan lo mismo."
    },
    {
      tipo: "explicacion",
      titulo: "¿Puede haber cero? Opcional u obligatoria",
      texto: "Cada extremo lleva **dos** símbolos: el de fuera dice el **máximo** (uno o muchos) y el de dentro, el **mínimo** (la **cardinalidad mínima**).\n• Un **círculo** = cero: la relación es **opcional**.\n• Una **rayita** = al menos uno: es **obligatoria**.\nAsí, junto a Pedido, «círculo + pata» se lee «**cero o muchos**»: un cliente recién dado de alta aún no tiene pedidos. Y junto a Cliente, «rayita + rayita» se lee «**uno y solo uno**»: un pedido sin cliente no existe.",
      consejo: "La cardinalidad mínima decide si un dato puede quedarse vacío. Si «cada pedido tiene siempre un cliente», el hueco del cliente en el pedido no puede quedarse en blanco."
    },
    {
      tipo: "quiz",
      pregunta: "En el plano, la línea entre `Tienda` y `Empleado` tiene una rayita junto a Tienda y una pata de gallo junto a Empleado. ¿Cómo se lee?",
      opciones: [
        "Una tienda tiene muchos empleados, y cada empleado trabaja en una sola tienda",
        "Un empleado trabaja en muchas tiendas, y cada tienda tiene un solo empleado",
        "Cada tienda tiene un único empleado, y cada empleado una única tienda"
      ],
      correcta: 0,
      explicacion: "La pata de gallo está en el lado de **muchos**: junto a Empleado. Por tanto, muchos empleados por tienda y una tienda por empleado."
    },
    {
      tipo: "quiz",
      pregunta: "En la línea `Cliente`–`Pedido`, el extremo de Pedido lleva un **círculo** y una **pata de gallo**. ¿Qué significa?",
      opciones: [
        "Un cliente tiene siempre al menos un pedido",
        "Un cliente puede tener cero, uno o muchos pedidos",
        "Un pedido puede no tener cliente"
      ],
      correcta: 1,
      explicacion: "Círculo = mínimo cero (opcional); pata = máximo muchos. Un cliente puede no haber comprado todavía. Lo que dice el lado del pedido no habla de cuántos clientes tiene un pedido: eso lo dice el otro extremo."
    },
    {
      tipo: "diagrama",
      enunciado: "Este es el borrador de Lucía para la tienda de 1998. Ya trae dibujada la línea **Cliente–Pedido**. Añade las dos que faltan:\n• Cada **empleado** trabaja en una sola **tienda**; una tienda tiene muchos empleados.\n• Cada **pedido** se hace en una sola **tienda**; en una tienda se hacen muchos pedidos.\nFíjate en las claves foráneas (🔗): te dicen dónde va el lado de muchos.",
      entidades: [
        { id: "tienda", nombre: "Tienda", atributos: ["id 🔑", "ciudad", "dirección"] },
        { id: "pedido", nombre: "Pedido", atributos: ["id 🔑", "fecha", "cliente_id 🔗", "tienda_id 🔗"] },
        { id: "cliente", nombre: "Cliente", atributos: ["id 🔑", "nombre", "teléfono"] },
        { id: "empleado", nombre: "Empleado", atributos: ["id 🔑", "nombre", "puesto", "tienda_id 🔗"] }
      ],
      relaciones: [
        { de: "tienda", a: "empleado", tipo: "1:N" },
        { de: "tienda", a: "pedido", tipo: "1:N" }
      ],
      fijas: [
        { de: "cliente", a: "pedido", tipo: "1:N" }
      ],
      pistas: [
        "En «De» va el lado de **uno** y en «A», el de **muchos**: el tipo `1:N` se lee «un `De` tiene muchos `A`».",
        "Las dos salen de Tienda: **Tienda 1:N Empleado** y **Tienda 1:N Pedido**."
      ]
    },
    {
      tipo: "diagrama",
      reto: true,
      enunciado: "Dibuja tú solo el plano de las ventas de 1998 a partir de las notas del archivo. Dibuja **solo** estas cuatro relaciones:\n• Cada **cliente** tiene **una** tarjeta de socio, y cada tarjeta es de **un** cliente.\n• Un **cliente** hace **muchos** pedidos; cada **pedido** es de un solo cliente.\n• Un **pedido** incluye **varios** productos, y un **producto** aparece en **muchos** pedidos.\n• Cada **producto** es de **una** categoría; en una **categoría** hay muchos productos.",
      entidades: [
        { id: "tarjeta", nombre: "Tarjeta de socio", atributos: ["id 🔑", "fecha de alta", "puntos"] },
        { id: "cliente", nombre: "Cliente", atributos: ["id 🔑", "nombre", "teléfono"] },
        { id: "pedido", nombre: "Pedido", atributos: ["id 🔑", "fecha"] },
        { id: "categoria", nombre: "Categoría", atributos: ["id 🔑", "nombre"] },
        { id: "producto", nombre: "Producto", atributos: ["id 🔑", "nombre", "precio"] }
      ],
      relaciones: [
        { de: "cliente", a: "tarjeta", tipo: "1:1" },
        { de: "cliente", a: "pedido", tipo: "1:N" },
        { de: "pedido", a: "producto", tipo: "N:M" },
        { de: "categoria", a: "producto", tipo: "1:N" }
      ],
      pistas: [
        "Hay una relación «uno a uno», otra «muchos a muchos» y dos «uno a muchos». En las `1:N`, pon en «De» el lado de **uno**.",
        "**Cliente 1:1 Tarjeta de socio**, **Cliente 1:N Pedido**, **Pedido N:M Producto** y **Categoría 1:N Producto**."
      ]
    }
  ]
});
