CURSO.registrar({
  id: "e1-09",
  titulo: "Caso: El inventario imposible",
  xp: 50,
  objetivo: "Sabrás comentar tus consultas y combinar todo lo de la etapa para revisar una tabla en busca de datos que no tienen sentido.",
  pasos: [
    {
      tipo: "historia",
      de: "lucia",
      asunto: "El informe de inventario no cuadra",
      texto: "Contabilidad me ha devuelto el informe de inventario: el valor total sale **más bajo** de lo que cuentan en el almacén, y nadie sabe por qué.\nAntes de presentarlo a dirección quiero que revises la tabla `productos` con todo lo que has aprendido. Y deja tus consultas comentadas: quiero poder leerlas."
    },
    {
      tipo: "explicacion",
      titulo: "Comentarios: notas que PostgreSQL ignora",
      texto: "Un **comentario** es texto para personas: PostgreSQL se lo salta.\n- `--` comenta desde ahí hasta el final de la línea.\n- `/* … */` comenta todo lo que haya dentro, aunque ocupe varias líneas.\nSirven para explicar una consulta y también para «apagar» una línea sin borrarla mientras pruebas.",
      ejemplo: `/* Informe de inventario
   Revisión para contabilidad */
SELECT nombre, precio -- precio de venta con IVA
FROM productos
ORDER BY nombre
LIMIT 5;`,
      consejo: "Una consulta sin comentarios es un misterio dentro de seis meses, incluso para quien la escribió. Explica el **porqué** («ordeno por stock para ver los extremos»), no lo que ya se lee en el código.",
      otrosMotores: "En MySQL, `--` necesita un espacio detrás (`-- así`) y además se admite `#` para comentar una línea. `/* … */` funciona igual en todos los motores."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT nombre,
  -- precio,
  stock
FROM productos
ORDER BY nombre
LIMIT 3;`,
      pregunta: "¿Qué columnas devolverá esta consulta?",
      opciones: ["nombre, precio y stock", "nombre y stock", "Ninguna: da error"],
      correcta: 1,
      explicacion: "La línea `-- precio,` está comentada, así que PostgreSQL no la ve: para él la consulta es `SELECT nombre, stock …`. Es la forma rápida de quitar una columna mientras pruebas."
    },
    {
      tipo: "explicacion",
      titulo: "Revisar una tabla: mira los extremos",
      texto: "¿Cómo se busca un dato raro en una tabla sin leerla entera? Ordenando por una columna y mirando **los extremos**: los primeros y los últimos.\nLos errores suelen esconderse ahí: un precio de 0 €, una fecha del año 2099, una cantidad imposible… En el ejemplo, los 5 productos más baratos: nada raro, todos tienen precios razonables.",
      ejemplo: `-- Extremo inferior de precio
SELECT nombre, precio
FROM productos
ORDER BY precio
LIMIT 5;`,
      consejo: "Es lo primero que hago con una tabla nueva: para cada columna numérica, mirar el mínimo y el máximo. Cinco minutos que ahorran días de informes equivocados."
    },
    {
      tipo: "ejercicio",
      enunciado: "Mira el otro extremo: muestra `nombre` y `precio` de los **5 productos más caros**, de mayor a menor precio.",
      solucion: `-- Extremo superior de precio
SELECT nombre, precio
FROM productos
ORDER BY precio DESC
LIMIT 5;`,
      pistas: [
        "Es el ejemplo anterior con `DESC` en el `ORDER BY`.",
        "SELECT nombre, precio FROM productos ORDER BY precio DESC LIMIT 5;"
      ]
    },
    {
      tipo: "caso",
      de: "lucia",
      enunciado: "Los precios parecen razonables. Si el valor del inventario (`precio * stock`) sale más bajo de lo que debería, sospecho del **stock**. Vamos por partes.",
      partes: [
        {
          enunciado: "Saca los **5 productos con menos stock**: `nombre`, `stock` y el valor del inventario (`precio * stock`) con el alias `valor_inventario`, ordenados de **menor a mayor** stock. Incluye al menos un **comentario** que explique la consulta.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas nombre, stock y valor_inventario", prueba: (r) => PRUEBA.columnas(r, ["nombre", "stock", "valor_inventario"]) },
            { texto: "Devuelve 5 filas, de menor a mayor stock", prueba: (r) => (r?.filas?.length ?? 0) === 5 && PRUEBA.ordenado(r, "stock", "asc") },
            { texto: "Son los 5 productos con menos stock", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT nombre, stock, precio * stock AS valor_inventario
FROM productos
ORDER BY stock
LIMIT 5;`) },
            { texto: "Incluye un comentario (`--` o `/* */`)", prueba: (r, db, sql) => /--|\/\*/.test(String(sql ?? "")) }
          ],
          pistas: [
            "Calcula `precio * stock AS valor_inventario`, ordena por `stock` (ascendente) y quédate con 5 filas. Escribe una línea que empiece por `--` encima del `SELECT`.",
            "-- Los 5 productos con menos stock\nSELECT nombre, stock, precio * stock AS valor_inventario FROM productos ORDER BY stock LIMIT 5;"
          ],
          solucion: `-- Los 5 productos con menos stock: busco valores imposibles
SELECT nombre, stock, precio * stock AS valor_inventario
FROM productos
ORDER BY stock
LIMIT 5;`
        },
        {
          tipo: "interpretar",
          pregunta: "Un almacén puede tener 0 unidades de algo, pero no menos. ¿Qué producto tiene un stock **imposible**? Escribe su nombre.",
          respuesta: ["Auriculares Sonora Pulse", "Sonora Pulse"],
          pistas: [
            "Mira la primera fila del resultado anterior: ¿qué stock tiene?",
            "Es el único producto con stock negativo. Lo verás con: SELECT nombre, stock FROM productos ORDER BY stock LIMIT 1;"
          ],
          solucion: `SELECT nombre
FROM productos
ORDER BY stock
LIMIT 1;`
        },
        {
          tipo: "interpretar",
          pregunta: "¿Qué **valor de inventario** (`precio * stock`) tiene ese producto? Escribe solo el número, con su signo y sin separador de miles ni «€».",
          respuesta: -1548,
          tolerancia: 0.01,
          pistas: [
            "Está en la columna `valor_inventario` de la primera parte. Fíjate en el signo.",
            "Cuesta 129 € y su stock es -12: 129 × (-12) = -1548."
          ],
          solucion: `SELECT precio * stock AS valor_inventario
FROM productos
ORDER BY stock
LIMIT 1;`
        }
      ],
      expediente: {
        id: "inventario-imposible",
        titulo: "El inventario imposible",
        texto: "En la tabla `productos`, los **Auriculares Sonora Pulse** marcan un stock de **-12**: doce unidades que han salido de un almacén donde no estaban. Su valor de inventario es de **-1.548 €**, que se restan del total del informe de contabilidad.\nNadie sabe explicar cómo ha llegado ahí ese número. ¿Un fallo del sistema? ¿Un error al teclear? ¿O alguien ha tocado lo que no debía?"
      }
    }
  ]
});
