CURSO.registrar({
  id: "e0-01",
  titulo: "¿Qué es un dato?",
  xp: 20,
  objetivo: "Sabrás distinguir los tipos de datos que guarda una empresa.",
  pasos: [
    {
      tipo: "historia",
      de: "lucia",
      asunto: "Tu prueba de acceso",
      texto: "Antes de darte acceso a los sistemas, una prueba. En 1998, la primera tienda de Faro lo apuntaba todo en **fichas de papel**.\nQuiero ver cómo ordenas esa información. Empecemos por lo básico: qué es un dato."
    },
    {
      tipo: "explicacion",
      titulo: "Dato e información",
      texto: "Un **dato** es un valor suelto: `Madrid`, `40.900`, `12/03/1998`. Por sí solo dice poco.\nLa **información** aparece cuando los datos se relacionan: «Rosa, de Madrid, gastó 40.900 pesetas en 1998».\nCada dato tiene un **tipo**: **texto** (nombres, ciudades), **número** (cantidades, precios), **fecha** o **sí/no**.",
      consejo: "Un teléfono o un código postal se escriben con cifras, pero son **texto**: nunca vas a sumarlos ni a calcular su media."
    },
    {
      tipo: "clasificar",
      enunciado: "Esta es la ficha de una clienta de 1998. Coloca cada dato en su **tipo**.",
      grupos: ["Texto", "Número", "Fecha", "Sí / No"],
      elementos: [
        { texto: "Nombre: Rosa Prieto", grupo: "Texto" },
        { texto: "Ciudad: Madrid", grupo: "Texto" },
        { texto: "Teléfono: 915 552 311", grupo: "Texto" },
        { texto: "Compras este año: 7", grupo: "Número" },
        { texto: "Gasto total: 40.900 pts", grupo: "Número" },
        { texto: "Fecha de alta: 12/03/1998", grupo: "Fecha" },
        { texto: "Socia del club: sí", grupo: "Sí / No" },
        { texto: "Recibe publicidad: no", grupo: "Sí / No" }
      ],
      pistas: [
        "Pregúntate: ¿tendría sentido sumarlo? Si no, probablemente es texto.",
        "El teléfono es texto: no se suma ni se ordena como un número."
      ]
    },
    {
      tipo: "quiz",
      pregunta: "¿Qué es un dato **cuantitativo**?",
      opciones: ["Uno que se puede medir o contar con números", "Uno que describe una cualidad, como un color o una ciudad", "Uno que siempre es una fecha"],
      correcta: 0,
      explicacion: "Cuantitativo = cantidad (precio, unidades, edad). Cualitativo = cualidad (ciudad, categoría, color)."
    },
    {
      tipo: "clasificar",
      reto: true,
      enunciado: "Lucía quiere saber qué columnas del archivo permiten hacer cuentas. Clasifica cada dato en **cualitativo** o **cuantitativo**.",
      grupos: ["Cualitativo", "Cuantitativo"],
      elementos: [
        { texto: "Categoría del producto", grupo: "Cualitativo" },
        { texto: "Precio", grupo: "Cuantitativo" },
        { texto: "Ciudad de la tienda", grupo: "Cualitativo" },
        { texto: "Unidades vendidas", grupo: "Cuantitativo" },
        { texto: "Color del producto", grupo: "Cualitativo" },
        { texto: "Días de garantía", grupo: "Cuantitativo" }
      ],
      pistas: [
        "Si responde a «¿cuánto?» o «¿cuántos?», es cuantitativo.",
        "Precio, unidades vendidas y días de garantía son cuantitativos."
      ]
    }
  ]
});
