CURSO.registrar({
  id: "e1-04",
  titulo: "Columnas calculadas",
  xp: 30,
  objetivo: "Sabrás crear columnas nuevas haciendo cuentas con números y pegando textos.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "¿Cuánto dinero hay en el almacén?",
      texto: "Necesito saber cuánto dinero tenemos parado en stock, producto a producto.\nLa tabla tiene el precio y las unidades, pero nadie ha hecho la multiplicación. ¿Lo puedes sacar tú? Lo necesitaba para ayer, como siempre."
    },
    {
      tipo: "explicacion",
      titulo: "Hacer cuentas en el SELECT",
      texto: "Detrás de `SELECT` no solo puedes poner columnas: también **operaciones** con ellas. Suma `+`, resta `-`, multiplicación `*` y división `/`.\nLa cuenta se hace **fila a fila**, como arrastrar una fórmula en una hoja de cálculo. Aquí calculamos el precio con IVA (21 %).\nLa tabla no cambia: la columna nueva solo existe en el resultado. Sale titulada `?column?` porque PostgreSQL no sabe cómo llamarla; en el próximo nivel le pondrás nombre.",
      ejemplo: `SELECT nombre, precio, precio * 1.21
FROM productos;`,
      consejo: "Verás bastantes decimales en el precio con IVA. Es normal: redondear lo aprenderás más adelante."
    },
    {
      tipo: "explicacion",
      titulo: "Cuidado con la división",
      texto: "`SELECT` también sirve de calculadora: sin `FROM`, calcula y ya.\nFíjate en este ejemplo: `7 / 2` da **3**, no 3,5. Cuando divides un **entero entre otro entero**, PostgreSQL devuelve un entero y **tira los decimales** (no redondea).\nSi uno de los dos lleva decimales (`7.0`), la división es decimal: 3,5 (con muchos ceros detrás).\nOjo con columnas enteras como `stock`: `stock / 2` también pierde los decimales.",
      ejemplo: `SELECT 7 / 2, 7.0 / 2;`,
      otrosMotores: "En MySQL, `7 / 2` da 3.5 (la división entera se escribe `7 DIV 2`); en BigQuery, `/` siempre da decimales. SQL Server se comporta como PostgreSQL. En Oracle antiguo, la calculadora necesita `FROM dual`."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT 19 / 2;`,
      pregunta: "¿Qué número devolverá?",
      opciones: ["9.5", "9", "10"],
      correcta: 1,
      explicacion: "19 y 2 son enteros, así que el resultado es entero: se tiran los decimales y queda 9. No redondea a 10."
    },
    {
      tipo: "explicacion",
      titulo: "Pegar textos con `||`",
      texto: "Con dos barras verticales `||` **concatenas** (pegas) textos, uno detrás de otro.\nLos textos fijos que escribes tú van entre **comillas simples**: `' ('`. Así puedes montar etiquetas como «Portátil Lumen 14 (Informática)».",
      ejemplo: `SELECT nombre || ' (' || categoria || ')'
FROM productos;`,
      consejo: "Los espacios también cuentan: si no los pones dentro de las comillas, los textos salen pegados. Y nada de comillas dobles para textos: esas sirven para otra cosa.",
      otrosMotores: "En SQL Server se pega con `+` (`nombre + ' (' + categoria + ')'`) y en MySQL con `CONCAT(nombre, ' (', categoria, ')')`, porque allí `||` significa otra cosa."
    },
    {
      tipo: "ejercicio",
      enunciado: "Elena quiere probar una rebaja de 10 € en todo. Muestra el **nombre** de cada producto y su **precio menos 10**, en ese orden (dos columnas).",
      solucion: `SELECT nombre, precio - 10
FROM productos;`,
      nombres: false,
      pistas: [
        "Detrás del nombre, pon una segunda columna que reste 10 al precio.",
        "SELECT nombre, precio - 10 FROM productos;"
      ]
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería devolver **una sola columna** con el nombre y el departamento de cada empleado separados por espacio, guion y espacio, por ejemplo `Ana Beltrán - Dirección`. Pero da error. Arréglala.",
      inicial: `SELECT nombre || " - " || departamento
FROM empleados;`,
      solucion: `SELECT nombre || ' - ' || departamento
FROM empleados;`,
      nombres: false,
      pistas: [
        "Mira las comillas del texto fijo. ¿Cuáles se usan para los textos?",
        "Cambia las comillas dobles por simples: SELECT nombre || ' - ' || departamento FROM empleados;"
      ]
    },
    {
      tipo: "quiz",
      pregunta: "Después de ejecutar `SELECT nombre, precio * 2 FROM productos;`, ¿qué pasa con los precios guardados en la tabla?",
      opciones: [
        "Se duplican para siempre",
        "No cambian: el cálculo solo aparece en el resultado",
        "Se duplican hasta que cierres la sesión"
      ],
      correcta: 1,
      explicacion: "Un `SELECT` solo lee y calcula. Nunca modifica los datos guardados."
    },
    {
      tipo: "reto",
      de: "lucia",
      enunciado: "Vamos con el encargo de Elena. Muéstrale, de cada producto, su **nombre** y el **valor de su inventario** (el precio multiplicado por el stock), en ese orden.",
      inicial: "-- Escribe aquí tu consulta\n",
      comprobaciones: [
        { texto: "Salen los 40 productos", prueba: (r) => r?.filas?.length === 40 },
        { texto: "Tiene dos columnas y la primera es nombre", prueba: (r) => r?.columnas?.length === 2 && String(r?.columnas?.[0] ?? "").toLowerCase() === "nombre" },
        { texto: "La segunda columna es el precio por el stock de cada producto", prueba: async (r, db) => {
          try { return await PRUEBA.igualA(r, db, "SELECT nombre, precio * stock FROM productos;", { nombres: false }); } catch (e) { return false; }
        } }
      ],
      pistas: [
        "Multiplica dos columnas con el asterisco: precio * stock.",
        "SELECT nombre, precio * stock FROM productos;"
      ],
      solucion: `SELECT nombre, precio * stock
FROM productos;`
    }
  ]
});
