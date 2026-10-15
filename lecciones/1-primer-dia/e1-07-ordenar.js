CURSO.registrar({
  id: "e1-07",
  titulo: "Ordenar resultados",
  xp: 35,
  objetivo: "Sabrás ordenar un resultado de menor a mayor o al revés, por varias columnas, por un alias o por un cálculo.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "Catálogo para la reunión de las 12:00",
      texto: "Gracias por las categorías, me han venido genial.\nAhora, para la reunión de mediodía, quiero el catálogo **del producto más caro al más barato**. Si me lo pasas desordenado, me toca buscar a ojo y no llego. ¿Puedes?"
    },
    {
      tipo: "explicacion",
      titulo: "ORDER BY: poner orden",
      texto: "Sin indicación, una base de datos devuelve las filas **en el orden que le resulta cómodo**, que no tiene por qué ser el mismo mañana.\nPara ordenar, añade **ORDER BY** y la columna al final de la consulta, después de `FROM`.\nPor defecto ordena de menor a mayor (**ASC**, ascendente: 1, 2, 3… o A, B, C…). Para el orden inverso escribe **DESC** (descendente) detrás de la columna: `ORDER BY precio DESC`.",
      ejemplo: `SELECT nombre, precio
FROM productos
ORDER BY precio;`,
      consejo: "`ASC` casi nadie lo escribe porque es lo de siempre, pero `DESC` hay que ponerlo cada vez. Es el olvido más típico en un informe de «los más vendidos»."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT nombre
FROM empleados
ORDER BY nombre;`,
      pregunta: "Ordenamos a la plantilla por nombre, de la A a la Z. ¿Quién aparecerá en la **última** fila?",
      opciones: ["Tomás Rivas", "Óscar Medina", "Sara Ferrer"],
      correcta: 1,
      explicacion: "Sorpresa: la base de datos de este curso compara los textos por el **código** de cada carácter, y la «Ó» con tilde tiene un código mayor que cualquier letra sin tilde. Por eso «Óscar» va detrás de «Tomás» (y detrás de «Zoe», si la hubiera)."
    },
    {
      tipo: "ejercicio",
      enunciado: "Muestra `ciudad` y `apertura` de todas las tiendas, ordenadas de la que abrió **más recientemente** a la más antigua.",
      solucion: `SELECT ciudad, apertura
FROM tiendas
ORDER BY apertura DESC;`,
      pistas: [
        "Las fechas se ordenan como los números: las más recientes son las «mayores». Necesitas `DESC`.",
        "SELECT ciudad, apertura FROM tiendas ORDER BY apertura DESC;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Varias columnas (y un aviso con las tildes)",
      texto: "Puedes ordenar por varias columnas separadas por comas. La segunda solo **desempata**: decide el orden entre filas que coinciden en la primera.\nEn el ejemplo, primero por departamento y, dentro de cada departamento, por nombre.\nRecuerda lo de «Óscar»: aquí los textos se comparan por código de carácter. Las letras con tilde van detrás de la «z», y las mayúsculas van **antes** que las minúsculas.",
      ejemplo: `SELECT departamento, nombre
FROM empleados
ORDER BY departamento, nombre;`,
      consejo: "Si un informe se ordena por nombres de personas, revisa cómo quedan las tildes antes de mandarlo. A más de un director le ha extrañado no encontrarse en la lista.",
      otrosMotores: "El orden de los textos depende de la **intercalación** (collation) de cada base de datos. En MySQL y SQL Server la habitual ignora tildes y mayúsculas, así que «Óscar» va con las demás oes. En PostgreSQL se puede elegir otra con `COLLATE`, según cómo esté instalado el servidor."
    },
    {
      tipo: "quiz",
      pregunta: "¿Qué hace `ORDER BY categoria, precio DESC`?",
      opciones: [
        "Ordena por categoría (A→Z) y, dentro de cada categoría, del más caro al más barato",
        "Ordena las dos columnas de mayor a menor",
        "Ordena solo por precio, de mayor a menor"
      ],
      correcta: 0,
      explicacion: "Cada `DESC` afecta **solo** a la columna que tiene delante. `categoria` no lleva nada, así que va en orden ascendente."
    },
    {
      tipo: "explicacion",
      titulo: "Ordenar por un alias o por un cálculo",
      texto: "También puedes ordenar por una **columna calculada**. Si le has puesto alias, usa el alias: `ORDER BY precio_iva`.\nY puedes ordenar por un cálculo que ni siquiera muestras, escribiéndolo entero: `ORDER BY precio * stock DESC` ordena por el valor del inventario aunque esa columna no salga en el resultado.",
      ejemplo: `SELECT nombre, precio * 1.21 AS precio_iva
FROM productos
ORDER BY precio_iva;`,
      consejo: "También existe `ORDER BY 2` (ordenar por la segunda columna). Es cómodo para probar, pero en una consulta que vaya a leer otra persona usa el nombre: si alguien añade una columna, el número deja de apuntar a la buena."
    },
    {
      tipo: "ejercicio",
      enunciado: "Muestra el `nombre` de cada producto y su precio rebajado un 10 % (`precio * 0.9`) con el alias `precio_oferta`, ordenados de **mayor a menor** `precio_oferta`.",
      solucion: `SELECT nombre, precio * 0.9 AS precio_oferta
FROM productos
ORDER BY precio_oferta DESC;`,
      pistas: [
        "Calcula la columna con `AS precio_oferta` y luego ordena por ese alias con `DESC`.",
        "SELECT nombre, precio * 0.9 AS precio_oferta FROM productos ORDER BY precio_oferta DESC;"
      ]
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "Necesito el catálogo completo: `nombre` y `precio` de todos los productos (en ese orden de columnas), **del más caro al más barato**. Si dos productos cuestan lo mismo, ponlos por orden alfabético de `nombre`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas nombre y precio", prueba: (r) => PRUEBA.columnas(r, ["nombre", "precio"]) },
        { texto: "Están los 40 productos", prueba: (r) => (r?.filas?.length ?? 0) === 40 },
        { texto: "Van del más caro al más barato", prueba: (r) => (r?.filas?.length ?? 0) > 0 && PRUEBA.ordenado(r, "precio", "desc") },
        { texto: "A igual precio, van por orden alfabético de nombre", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT nombre, precio
FROM productos
ORDER BY precio DESC, nombre;`) }
      ],
      pistas: [
        "Ordena por dos columnas: primero `precio` con `DESC` y después `nombre` (ascendente, sin escribir nada).",
        "SELECT nombre, precio FROM productos ORDER BY precio DESC, nombre;"
      ],
      solucion: `SELECT nombre, precio
FROM productos
ORDER BY precio DESC, nombre;`
    }
  ]
});
