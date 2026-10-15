CURSO.registrar({
  id: "e4-09",
  titulo: "Apilar resultados: UNION, INTERSECT y EXCEPT",
  xp: 45,
  objetivo: "Sabrás combinar los resultados de dos consultas como conjuntos: juntarlos con UNION y UNION ALL, quedarte con lo común con INTERSECT y con la diferencia con EXCEPT, respetando sus reglas.",
  pasos: [
    {
      tipo: "historia",
      de: "hector",
      asunto: "El mapa de Faro",
      texto: "Para la presentación de logística quiero un **mapa con todas las ciudades donde Faro está presente**, con tienda, con almacén o con las dos cosas.\nTengo la lista de tiendas en una pestaña y la de almacenes en otra, y al juntarlas a mano me salen ciudades repetidas. Ya me conozco: acabaría poniendo Valencia dos veces en el mapa. ¿Me echas una mano?"
    },
    {
      tipo: "explicacion",
      titulo: "UNION: una lista debajo de la otra",
      texto: "Los `JOIN` añaden **columnas**: ponen una tabla al lado de la otra. **UNION** añade **filas**: pone el resultado de una consulta **debajo** del de otra, como pegar dos listas en la misma columna de una hoja de cálculo.\nAdemás, `UNION` quita los repetidos: Valencia, Sevilla y Bilbao tienen tienda y almacén, pero salen una sola vez. Son las 8 ciudades del mapa (y sí, «Online» cuenta como ciudad, porque así está en `tiendas`).\nEs la **unión** de conjuntos del diagrama de Venn de la etapa 0.",
      ejemplo: `SELECT ciudad
FROM tiendas
UNION
SELECT ciudad
FROM almacenes
ORDER BY ciudad;`
    },
    {
      tipo: "prediccion",
      consulta: `SELECT ciudad
FROM tiendas
UNION ALL
SELECT ciudad
FROM almacenes;`,
      pregunta: "Hay 6 tiendas y 5 almacenes, y con `UNION` salían 8 ciudades. ¿Cuántas filas devuelve `UNION ALL`?",
      opciones: ["8", "11", "30"],
      correcta: 1,
      explicacion: "**11** = 6 + 5. `UNION ALL` apila las dos listas **tal cual**, sin quitar repetidos: Valencia, Sevilla y Bilbao salen dos veces. Fíjate en la diferencia con el CROSS JOIN: aquello multiplicaba (30); esto suma."
    },
    {
      tipo: "explicacion",
      titulo: "Las reglas del juego",
      texto: "Para apilar dos consultas, tienen que «encajar»:\n- **Mismo número de columnas.** Si no, error **42601**: `each UNION query must have the same number of columns`.\n- **Tipos compatibles**, columna a columna: un texto debajo de una fecha da el error **42804**.\n- Los **nombres** de las columnas los pone la **primera** consulta.\n- Un **único `ORDER BY`, al final**, que ordena el resultado completo. En mitad da error de sintaxis.",
      consejo: "`UNION` tiene que comparar todas las filas para quitar repetidos, y eso cuesta. Si sabes que no hay repetidos, o si los quieres contar todos, usa `UNION ALL`: es más rápido y no se come filas sin avisar."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería devolver una sola columna, `ciudad`, con todas las ciudades de tiendas y almacenes **sin repetir**. Da el error 42601. Arréglala.",
      inicial: `SELECT ciudad, apertura
FROM tiendas
UNION
SELECT ciudad
FROM almacenes;`,
      solucion: `SELECT ciudad
FROM tiendas
UNION
SELECT ciudad
FROM almacenes;`,
      pistas: [
        "Cuenta las columnas de cada consulta: la primera tiene dos y la segunda, una. Y el enunciado solo pide `ciudad`.",
        "Quita `apertura` de la primera consulta: SELECT ciudad FROM tiendas UNION SELECT ciudad FROM almacenes;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "INTERSECT y EXCEPT: lo común y lo que sobra",
      texto: "Los otros dos operadores también salen del Venn:\n- **INTERSECT** devuelve las filas que están en **las dos** consultas (la intersección).\n- **EXCEPT** devuelve las filas de la **primera** que **no** están en la segunda (la diferencia).\nCon `EXCEPT` **el orden importa**, como en una resta: el ejemplo saca las ciudades con tienda pero sin almacén, que son Barcelona, Madrid y Online. A Madrid le sirve el almacén de Getafe, que está al lado.",
      ejemplo: `SELECT ciudad
FROM tiendas
EXCEPT
SELECT ciudad
FROM almacenes
ORDER BY ciudad;`,
      otrosMotores: "En Oracle, `EXCEPT` se llama `MINUS` (las versiones recientes aceptan las dos). MySQL solo tiene `INTERSECT` y `EXCEPT` desde la versión 8.0.31; en las anteriores se simulan con `JOIN`."
    },
    {
      tipo: "ejercicio",
      enunciado: "Héctor quiere marcar en el mapa las ciudades con **tienda y almacén a la vez**. Muestra la columna `ciudad` con las ciudades que están en `tiendas` **y** en `almacenes`, ordenadas alfabéticamente.",
      solucion: `SELECT ciudad
FROM tiendas
INTERSECT
SELECT ciudad
FROM almacenes
ORDER BY ciudad;`,
      pistas: [
        "Lo común a las dos listas es la intersección: dos consultas de una columna unidas con `INTERSECT` y un `ORDER BY ciudad` al final.",
        "SELECT ciudad FROM tiendas INTERSECT SELECT ciudad FROM almacenes ORDER BY ciudad;"
      ]
    },
    {
      tipo: "quiz",
      pregunta: "El ejemplo `tiendas EXCEPT almacenes` daba Barcelona, Madrid y Online. Si **inviertes** el orden y escribes `almacenes EXCEPT tiendas`, ¿qué obtienes?",
      opciones: [
        "Lo mismo: a `EXCEPT` le da igual el orden",
        "Las ciudades con almacén pero sin tienda",
        "Las ciudades que tienen tienda y almacén"
      ],
      correcta: 1,
      explicacion: "Al invertirlo, «la primera lista» pasa a ser la de almacenes: obtienes las ciudades con almacén que no tienen tienda. Lo común a las dos sería `INTERSECT`. Ahora compruébalo tú en el reto."
    },
    {
      tipo: "reto",
      de: "hector",
      enunciado: "Para la presentación quiero destacar dónde tenemos **almacén pero no tienda**. Devuelve una sola columna, `ciudad`, con esas ciudades, ordenadas alfabéticamente.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene una sola columna, ciudad", prueba: (r) => PRUEBA.columnas(r, ["ciudad"]) },
        { texto: "Salen 2 ciudades", prueba: (r) => (r?.filas?.length ?? 0) === 2 },
        { texto: "Son las ciudades con almacén y sin tienda, en orden alfabético", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT ciudad
FROM almacenes
EXCEPT
SELECT ciudad
FROM tiendas
ORDER BY ciudad;`) }
      ],
      pistas: [
        "Es una diferencia: primero la lista de la que quieres quedarte con algo (almacenes), después `EXCEPT` y la que restas (tiendas). El `ORDER BY` va al final.",
        "SELECT ciudad FROM almacenes EXCEPT SELECT ciudad FROM tiendas ORDER BY ciudad;"
      ],
      solucion: `SELECT ciudad
FROM almacenes
EXCEPT
SELECT ciudad
FROM tiendas
ORDER BY ciudad;`
    }
  ]
});
