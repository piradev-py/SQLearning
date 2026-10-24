CURSO.registrar({
  id: "e1-08",
  titulo: "Los primeros N: LIMIT y OFFSET",
  xp: 35,
  objetivo: "Sabrás quedarte con las primeras filas de un resultado ordenado (un «top N») y pasar de página.",
  pasos: [
    {
      tipo: "historia",
      de: "hector",
      asunto: "Reorganizando el almacén",
      texto: "¡Hola! Soy Héctor, de logística. Estamos reorganizando el almacén central y quiero dejar a mano de los carros lo que más unidades tiene.\n¿Me pasas los productos con más stock? Pero no la lista entera, que me pierdo: **de cinco en cinco**, como las páginas de un catálogo."
    },
    {
      tipo: "explicacion",
      titulo: "LIMIT: solo las primeras filas",
      texto: "**LIMIT** va al final de la consulta y le dice a PostgreSQL cuántas filas quieres como máximo: `LIMIT 3` → solo las 3 primeras.\nCombinado con `ORDER BY` te da un **top N**: los 3 más caros, los 10 más vendidos… En el ejemplo, los tres productos más caros de Faro.",
      ejemplo: `SELECT nombre, precio
FROM productos
ORDER BY precio DESC
LIMIT 3;`,
      consejo: "Un `LIMIT` sin `ORDER BY` te da tres filas **cualesquiera**, no «las primeras» de nada. Para un top N, ordena siempre.",
      otrosMotores: "SQL Server no tiene `LIMIT`: usa `SELECT TOP 3 nombre, precio FROM productos ORDER BY precio DESC;`. El SQL estándar (que también entienden PostgreSQL y Oracle) lo escribe al final: `ORDER BY precio DESC FETCH FIRST 3 ROWS ONLY;`. MySQL, SQLite y BigQuery usan `LIMIT` como aquí."
    },
    {
      tipo: "explicacion",
      titulo: "Cuidado con los empates en el corte",
      texto: "Mira las dos últimas filas del ejemplo: ambos productos tienen **108** unidades. Si pidieras `LIMIT 5`, solo cabría uno, y PostgreSQL elegiría cualquiera de los dos… sin garantía de que mañana elija el mismo.\nLa solución es **desempatar** con una segunda columna: `ORDER BY stock DESC, nombre`. Así el orden queda decidido del todo y el top 5 es siempre el mismo.",
      ejemplo: `SELECT nombre, stock
FROM productos
ORDER BY stock DESC
LIMIT 6;`
    },
    {
      tipo: "ejercicio",
      enunciado: "Muestra `nombre` y `stock` de los **5 productos con más stock**, de mayor a menor stock y, a igual stock, por `nombre` en orden alfabético.",
      solucion: `SELECT nombre, stock
FROM productos
ORDER BY stock DESC, nombre
LIMIT 5;`,
      pistas: [
        "Ordena por `stock DESC` y después por `nombre`; al final, `LIMIT 5`.",
        "SELECT nombre, stock FROM productos ORDER BY stock DESC, nombre LIMIT 5;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "OFFSET: saltar filas y dividir en páginas",
      texto: "**OFFSET** se salta filas antes de empezar a devolver: `LIMIT 3 OFFSET 3` → sáltate 3 y dame las 3 siguientes (la 4.ª, 5.ª y 6.ª).\nAsí funciona la **paginación** de cualquier web: página 1 = `OFFSET 0`, página 2 = `OFFSET 3`, página 3 = `OFFSET 6`… En el ejemplo, la «segunda página» de los productos más caros.",
      ejemplo: `SELECT nombre, precio
FROM productos
ORDER BY precio DESC
LIMIT 3 OFFSET 3;`,
      consejo: "En el trabajo real, `LIMIT 10` es tu mejor amigo para echar un vistazo a una tabla enorme sin traerte millones de filas a la pantalla.",
      otrosMotores: "En el estándar (SQL Server, Oracle y también PostgreSQL): `ORDER BY precio DESC OFFSET 3 ROWS FETCH NEXT 3 ROWS ONLY;`. En SQL Server es obligatorio el `ORDER BY`. MySQL admite además `LIMIT 3, 3` (primero el salto y después la cantidad)."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT nombre, precio
FROM productos
ORDER BY precio DESC
LIMIT 5 OFFSET 38;`,
      pregunta: "Faro tiene 40 productos. ¿Cuántas filas devolverá esta consulta?",
      opciones: ["5", "2", "0"],
      correcta: 1,
      explicacion: "Se salta 38 productos y solo quedan 2. `LIMIT` es un **máximo**, no una cantidad obligatoria: si no hay más filas, devuelve las que haya (aquí, los dos más baratos)."
    },
    {
      tipo: "quiz",
      pregunta: "Muestras 10 productos por página. ¿Qué `OFFSET` necesitas para la **página 3**?",
      opciones: ["3", "20", "30"],
      correcta: 1,
      explicacion: "Hay que saltarse las páginas 1 y 2 enteras: 2 × 10 = 20. La fórmula es `OFFSET = (página − 1) × filas por página`."
    },
    {
      tipo: "reto",
      de: "hector",
      enunciado: "¡Genial, los cinco primeros ya están colocados! Ahora pásame la **página 2**: `nombre` y `stock` de los productos que van del **6.º al 10.º** con más stock. Mismo orden que antes: de mayor a menor stock y, a igual stock, por `nombre` (A→Z).",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas nombre y stock", prueba: (r) => PRUEBA.columnas(r, ["nombre", "stock"]) },
        { texto: "Devuelve 5 filas", prueba: (r) => (r?.filas?.length ?? 0) === 5 },
        { texto: "Empieza en el sexto producto: Disco SSD Volta 2 TB", prueba: (r) => PRUEBA.valor(r, 0, "nombre") === "Disco SSD Volta 2 TB" },
        { texto: "Son los productos del 6.º al 10.º, en el orden pedido", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT nombre, stock
FROM productos
ORDER BY stock DESC, nombre
LIMIT 5 OFFSET 5;`) }
      ],
      pistas: [
        "Es la consulta del ejercicio de antes, pero saltándote las 5 primeras filas con `OFFSET`.",
        "SELECT nombre, stock FROM productos ORDER BY stock DESC, nombre LIMIT 5 OFFSET 5;"
      ],
      solucion: `SELECT nombre, stock
FROM productos
ORDER BY stock DESC, nombre
LIMIT 5 OFFSET 5;`
    }
  ]
});
