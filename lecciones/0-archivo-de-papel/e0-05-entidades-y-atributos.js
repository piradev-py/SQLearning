CURSO.registrar({
  id: "e0-05",
  titulo: "Entidades y atributos",
  xp: 30,
  objetivo: "Sabrás distinguir las cosas del negocio (entidades) de los datos que las describen (atributos).",
  pasos: [
    {
      tipo: "historia",
      de: "lucia",
      asunto: "¿Qué hay en el archivo?",
      texto: "Ya sabes que el Excel hay que partirlo en tablas. Pero ¿en cuáles?\nAntes de dibujar nada, quien diseña una base de datos hace una lista: **qué cosas** hay en el negocio y **qué datos** se guardan de cada una. Eso quiero de ti: repasa el archivo de 1998 y dime qué hay."
    },
    {
      tipo: "explicacion",
      titulo: "Entidad",
      texto: "Una **entidad** es un tipo de cosa del negocio de la que quieres guardar información: **cliente**, **producto**, **venta**, **empleado**.\nCada entidad acabará siendo una **tabla**, y cada ejemplar concreto (Rosa Prieto, el walkman Sonora) será una **fila**.\nTruco: las entidades suelen ser **sustantivos que puedes contar**: «tenemos 300 clientes y 80 productos», «hoy hubo 25 ventas».",
      consejo: "Nombra las entidades en singular (`Cliente`) y las tablas en plural (`clientes`). Es la convención más extendida, aunque cada empresa tiene sus manías."
    },
    {
      tipo: "explicacion",
      titulo: "Atributo",
      texto: "Un **atributo** es un dato que describe a una entidad: del cliente, su nombre, teléfono y fecha de alta; del producto, su nombre, precio y categoría.\nCada atributo será una **columna** y tendrá un tipo (texto, número, fecha, sí/no), como viste en el primer nivel.\nPara distinguirlos, pregúntate: lo que estoy mirando, ¿**tiene datos propios** o **es un dato de otra cosa**? El «precio» no tiene datos propios: es un atributo del producto."
    },
    {
      tipo: "clasificar",
      enunciado: "Separa las **entidades** de los **atributos**.",
      grupos: ["Entidad", "Atributo"],
      elementos: [
        { texto: "Cliente", grupo: "Entidad" },
        { texto: "Producto", grupo: "Entidad" },
        { texto: "Venta", grupo: "Entidad" },
        { texto: "Empleado", grupo: "Entidad" },
        { texto: "Teléfono", grupo: "Atributo" },
        { texto: "Precio", grupo: "Atributo" },
        { texto: "Fecha de la venta", grupo: "Atributo" },
        { texto: "Apellidos", grupo: "Atributo" }
      ],
      pistas: [
        "¿Puedes contarlo («tenemos 300…») y tiene datos propios? Entidad. ¿Es un valor que describe a otra cosa? Atributo.",
        "Hay cuatro entidades: Cliente, Producto, Venta y Empleado."
      ]
    },
    {
      tipo: "explicacion",
      titulo: "¿Cosa o dato?",
      texto: "A veces la respuesta depende de lo que necesite el negocio. ¿La **ciudad** es una entidad o un atributo?\n- Si solo apuntas dónde vive cada cliente, es un **atributo** del cliente: `ciudad: Madrid`.\n- Si de cada ciudad quieres guardar más cosas (provincia, si hay tienda, coste de envío), pasa a ser una **entidad** con sus propios atributos.\nLa regla: si algo tiene **datos propios que te interesan**, es una entidad; si solo es un valor que describe a otra cosa, es un atributo.",
      consejo: "No conviertas todo en entidad «por si acaso». Empieza simple y separa solo cuando el negocio necesite guardar datos de esa cosa."
    },
    {
      tipo: "quiz",
      pregunta: "De cada **proveedor**, la tienda de 1998 apuntaba el nombre, el teléfono, la persona de contacto y el plazo de entrega. ¿Qué es el proveedor?",
      opciones: [
        "Un atributo del producto",
        "Una entidad: tiene datos propios",
        "Un tipo de dato, como texto o fecha"
      ],
      correcta: 1,
      explicacion: "Tiene sus propios atributos (teléfono, contacto, plazo), así que merece su propia tabla. Si solo se apuntara su nombre en cada producto, podría quedarse como atributo."
    },
    {
      tipo: "quiz",
      pregunta: "¿Qué atributo pertenece a la entidad **Venta** y no a **Cliente**?",
      opciones: ["Teléfono", "Fecha de la venta", "Fecha de alta"],
      correcta: 1,
      explicacion: "Un cliente hace muchas ventas, cada una en su fecha. El teléfono y la fecha de alta describen al cliente: mezclarlos con la venta es justo el error del Excel gigante."
    },
    {
      tipo: "clasificar",
      reto: true,
      enunciado: "Estas etiquetas aparecen en el archivo de 1998. Separa las **entidades** y di **de quién es** cada atributo. Del proveedor se guardan nombre, teléfono y plazo de entrega.",
      grupos: ["Entidad", "Atributo de Cliente", "Atributo de Producto"],
      elementos: [
        { texto: "Cliente", grupo: "Entidad" },
        { texto: "Producto", grupo: "Entidad" },
        { texto: "Proveedor", grupo: "Entidad" },
        { texto: "Domicilio", grupo: "Atributo de Cliente" },
        { texto: "Socio del club (sí/no)", grupo: "Atributo de Cliente" },
        { texto: "Recibe publicidad (sí/no)", grupo: "Atributo de Cliente" },
        { texto: "Precio de venta al público", grupo: "Atributo de Producto" },
        { texto: "Categoría (audio, gaming…)", grupo: "Atributo de Producto" },
        { texto: "Meses de garantía", grupo: "Atributo de Producto" }
      ],
      pistas: [
        "Primero busca lo que tiene datos propios: son las entidades, y hay tres.",
        "Las entidades son Cliente, Producto y Proveedor. Para el resto pregúntate: ¿describe a una persona que compra o a un artículo de la estantería?"
      ]
    }
  ]
});
