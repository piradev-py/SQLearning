CURSO.registrar({
  id: "e1-03",
  titulo: "Leer el esquema y los tipos",
  xp: 25,
  objetivo: "Sabrás consultar el plano de la base de datos: qué tablas hay, qué columnas tienen y qué tipo de dato guarda cada una.",
  pasos: [
    {
      tipo: "historia",
      de: "lucia",
      asunto: "Antes de construir, mira el plano",
      texto: "Pronto vas a hacer cálculos con estos datos. Antes, quiero que sepas leer el **plano** de la base de datos: qué tablas hay, qué columnas tiene cada una y qué tipo de dato guarda.\nUn precio no se trata igual que un nombre o una fecha. Saberlo te ahorrará muchos errores."
    },
    {
      tipo: "explicacion",
      titulo: "La pestaña Esquema",
      texto: "Encima del resultado hay dos pestañas: **Resultado** y, a su derecha, **Esquema**. Ábrela.\nVerás una ficha por tabla con su nombre, cuántas filas tiene y la lista de sus columnas. Al lado de cada columna aparece su **tipo** y, si pone «obligatoria», es que no puede quedarse vacía.\nEl **esquema** es eso: la descripción de cómo está organizada la base de datos.",
      consejo: "Cuando no recuerdes cómo se llama una columna, no adivines: mira el Esquema. Es lo primero que hago con una base de datos nueva."
    },
    {
      tipo: "explicacion",
      titulo: "Los tipos de datos",
      texto: "Cada columna guarda **un solo tipo** de dato. Los cinco que vas a ver aquí (en el Esquema salen en español; entre paréntesis, su nombre en PostgreSQL):\n- **entero** (`integer`): números sin decimales, como `stock`.\n- **decimal** (`numeric`): números con decimales exactos, como `precio`.\n- **texto** (`text`): como `nombre` o `proveedor`.\n- **fecha** (`date`): como `creado`, en formato año-mes-día.\n- **sí/no** (`boolean`): solo `true` (sí) o `false` (no), como `activo`.\nEn el resultado, debajo del título de cada columna, también verás su tipo.",
      ejemplo: `SELECT nombre, precio, stock, activo, creado
FROM productos;`,
      otrosMotores: "Cada motor llama a los tipos a su manera: en MySQL verás `INT`, `DECIMAL` o `VARCHAR`; en SQL Server, `BIT` para sí/no; en Oracle, `NUMBER` y `VARCHAR2`. La idea es la misma."
    },
    {
      tipo: "explicacion",
      titulo: "La clave primaria: `id`",
      texto: "En el Esquema, la columna `id` lleva una llave 🔑. Es la **clave primaria**: un número que identifica cada fila y que **nunca se repite**, como el DNI de una persona o el número de una ficha de archivo.\nAunque haya dos empleados con el mismo nombre, su `id` será distinto. Volverás a ella cuando unamos tablas.",
      ejemplo: `SELECT id, nombre
FROM empleados;`
    },
    {
      tipo: "ejercicio",
      enunciado: "Busca en el Esquema la ficha de `tiendas` y muestra su **clave primaria** y su **fecha de apertura**, en ese orden.",
      solucion: `SELECT id, apertura
FROM tiendas;`,
      pistas: [
        "La clave primaria es la columna con la llave 🔑; la fecha de apertura es la columna de tipo fecha.",
        "SELECT id, apertura FROM tiendas;"
      ]
    },
    {
      tipo: "quiz",
      pregunta: "La columna `activo` de `productos` solo puede valer `true` o `false`. ¿De qué tipo es?",
      opciones: ["integer (entero)", "text (texto)", "boolean (sí/no)"],
      correcta: 2,
      explicacion: "Un dato que solo puede ser sí o no es un `boolean`. En el Esquema aparece como «sí/no»."
    },
    {
      tipo: "interpretar",
      pregunta: "¿Qué tipo de dato tiene la columna `precio` de la tabla `productos`? Escribe su nombre (en el Esquema o en PostgreSQL, vale cualquiera de los dos).",
      respuesta: ["numeric", "decimal", "numeric(8,2)"],
      pistas: [
        "Abre la pestaña Esquema y busca la ficha de productos.",
        "Al lado de precio pone «decimal»; en PostgreSQL ese tipo se llama numeric."
      ],
      solucion: `SELECT pg_typeof(precio)
FROM productos;`
    },
    {
      tipo: "reto",
      de: "hector",
      enunciado: "¡Hola! Soy Héctor, de logística. Estoy repasando el catálogo del almacén y necesito, de cada producto, su **nombre**, su **precio** y si está **activo**, en ese orden.\nSi te ayuda, en el Esquema tienes los nombres exactos de las columnas. ¡Gracias!",
      inicial: "-- Escribe aquí tu consulta\n",
      comprobaciones: [
        { texto: "Salen los 40 productos", prueba: (r) => r?.filas?.length === 40 },
        { texto: "Tiene las columnas nombre, precio y activo, en ese orden", prueba: (r) => PRUEBA.columnas(r, ["nombre", "precio", "activo"]) }
      ],
      pistas: [
        "La tabla es productos y las tres columnas van separadas por comas detrás de SELECT.",
        "SELECT nombre, precio, activo FROM productos;"
      ],
      solucion: `SELECT nombre, precio, activo
FROM productos;`
    }
  ]
});
