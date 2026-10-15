(function () {
  // Primera celda de una consulta interna, como número (null si no hay)
  const cifra = async (db, sql) => {
    const r = await db.consulta(sql);
    const v = r?.filas?.[0]?.[0];
    return v === null || v === undefined ? null : Number(v);
  };

  CURSO.registrar({
    id: "e6-03",
    titulo: "Copiar desde una consulta: INSERT … SELECT y CREATE TABLE … AS",
    xp: 35,
    objetivo: "Sabrás meter en una tabla el resultado de una consulta con INSERT … SELECT, poner valores fijos dentro del SELECT y hacer una copia de seguridad de una tabla con CREATE TABLE … AS.",
    pasos: [
      {
        tipo: "historia",
        de: "ivan",
        asunto: "El stock inicial de Barcelona",
        texto: "Barcelona tiene plantilla, pero sus estanterías están vacías: en `stock_tiendas` no hay ni una fila de la tienda 6.\nLogística propone que arranque con el mismo surtido que **Valencia** (tienda 2). Son 36 productos. No vas a escribir 36 filas a mano. Cópialas."
      },
      {
        tipo: "explicacion",
        titulo: "INSERT … SELECT",
        texto: "Ya sabes dos cosas: escribir un `SELECT` y meter filas con `INSERT`. Júntalas: en lugar de `VALUES`, pon una consulta, y **todo lo que devuelva** se mete en la tabla.\n`INSERT INTO tabla (col1, col2, col3) SELECT …;`\nEl `SELECT` puede llevar **valores fijos**: `SELECT 6, producto_id, unidades` pone un 6 en todas las filas.\nLa regla: el `SELECT` debe devolver **tantas columnas como la lista del INSERT y en el mismo orden**. Se emparejan por posición, no por nombre.\nPrimero mira lo que vas a meter. Este es el `SELECT` sin el `INSERT`:",
        ejemplo: `SELECT 6 AS tienda_id, producto_id, unidades
FROM stock_tiendas
WHERE tienda_id = 2
ORDER BY producto_id;`,
        consejo: "Antes de un INSERT … SELECT, ejecuta el SELECT solo y revisa el resultado: cuántas filas salen y si las columnas están en el orden de la lista. Después le pones el INSERT encima."
      },
      {
        tipo: "prediccion",
        consulta: `INSERT INTO stock_tiendas (tienda_id, producto_id, unidades)
SELECT 6, id, 0
FROM productos;

SELECT COUNT(*) AS filas
FROM stock_tiendas
WHERE tienda_id = 6;`,
        pregunta: "Este INSERT mete una fila en la tienda 6 por cada producto del catálogo. ¿Cuántas filas cuenta el SELECT final?",
        opciones: ["0", "36", "40"],
        correcta: 2,
        explicacion: "Sin `WHERE`, el `SELECT` devuelve **todos** los productos: 40, incluidos los 4 descatalogados (`activo` = false). Si solo quieres los que se venden, filtra con `WHERE activo`."
      },
      {
        tipo: "ejercicio",
        varias: true,
        enunciado: "Copia el surtido de Valencia a Barcelona: mete en `stock_tiendas` (`tienda_id`, `producto_id`, `unidades`) una fila por cada fila de la tienda 2, con `tienda_id` 6 y las mismas unidades. Después, en la misma ejecución, comprueba con `SELECT tienda_id, COUNT(*) AS productos, SUM(unidades) AS unidades FROM stock_tiendas GROUP BY tienda_id ORDER BY tienda_id;`.",
        solucion: `INSERT INTO stock_tiendas (tienda_id, producto_id, unidades)
SELECT 6, producto_id, unidades
FROM stock_tiendas
WHERE tienda_id = 2;

SELECT tienda_id, COUNT(*) AS productos, SUM(unidades) AS unidades
FROM stock_tiendas
GROUP BY tienda_id
ORDER BY tienda_id;`,
        verificar: `SELECT tienda_id, COUNT(*) AS productos, SUM(unidades) AS unidades
FROM stock_tiendas
GROUP BY tienda_id
ORDER BY tienda_id;`,
        pistas: [
          "`INSERT INTO stock_tiendas (tienda_id, producto_id, unidades)` y, debajo, un `SELECT 6, producto_id, unidades FROM stock_tiendas WHERE tienda_id = 2;`. Luego el SELECT de comprobación.",
          "INSERT INTO stock_tiendas (tienda_id, producto_id, unidades) SELECT 6, producto_id, unidades FROM stock_tiendas WHERE tienda_id = 2; SELECT tienda_id, COUNT(*) AS productos, SUM(unidades) AS unidades FROM stock_tiendas GROUP BY tienda_id ORDER BY tienda_id;"
        ]
      },
      {
        tipo: "quiz",
        pregunta: "Ejecutas en la misma ejecución **dos veces** el INSERT … SELECT que copia Valencia a Barcelona. ¿Qué pasa?",
        opciones: [
          "Barcelona queda con el doble de unidades",
          "La segunda vez da el error 23505: la pareja (tienda_id, producto_id) ya existe",
          "La segunda vez no hace nada, sin error"
        ],
        correcta: 1,
        explicacion: "La clave de `stock_tiendas` es la pareja (`tienda_id`, `producto_id`): no puede repetirse. El segundo INSERT choca con las filas del primero y la base lo rechaza **entero** con el error 23505. Esa regla te protege de cargar algo dos veces."
      },
      {
        tipo: "explicacion",
        titulo: "Antes de cambiar nada, copia: CREATE TABLE … AS",
        texto: "La costumbre de Iván: antes de tocar una tabla, una **copia de seguridad**.\n`CREATE TABLE copia AS SELECT …;` crea una tabla nueva con las columnas y las filas que devuelve la consulta.\nPero copia **solo los datos**: no la clave primaria, ni las referencias a otras tablas, ni los `CHECK`, ni los `NOT NULL`. El ejemplo lo enseña: en `information_schema.columns`, la columna `is_nullable` dice `NO` en la original (no admite vacíos) y `YES` en la copia.",
        ejemplo: `CREATE TABLE stock_tiendas_copia AS
SELECT *
FROM stock_tiendas;

SELECT table_name, column_name, is_nullable
FROM information_schema.columns
WHERE table_name IN ('stock_tiendas', 'stock_tiendas_copia')
ORDER BY table_name, ordinal_position;`,
        consejo: "Una copia hecha con CREATE TABLE … AS sirve para guardar o comparar datos, no para trabajar en ella como si fuera la original: no tiene reglas que la protejan.",
        otrosMotores: "SQL Server usa `SELECT * INTO copia FROM tabla;`. MySQL y BigQuery admiten `CREATE TABLE copia AS SELECT …` como PostgreSQL."
      },
      {
        tipo: "quiz",
        pregunta: "¿Qué copia `CREATE TABLE copia AS SELECT * FROM stock_tiendas;`?",
        opciones: [
          "Las columnas y las filas, pero no la clave primaria ni las reglas",
          "Todo: columnas, filas, clave primaria y reglas",
          "Solo las columnas, sin filas"
        ],
        correcta: 0,
        explicacion: "Copia el resultado de la consulta: columnas (con sus tipos) y filas. Las claves y las reglas (`PRIMARY KEY`, `REFERENCES`, `CHECK`, `NOT NULL`) se quedan en la original."
      },
      {
        tipo: "reto",
        de: "ivan",
        varias: true,
        enunciado: "Cambio de planes: Barcelona arranca con **10 unidades de cada producto activo**. Mete en `stock_tiendas` (`tienda_id`, `producto_id`, `unidades`) una fila por cada producto con `activo` verdadero: `tienda_id` 6, el `id` del producto y 10 unidades. En la misma ejecución, termina con `SELECT * FROM stock_tiendas WHERE tienda_id = 6 ORDER BY producto_id;`.",
        inicial: "-- Escribe tu consulta aquí\n",
        comprobaciones: [
          { texto: "Barcelona (tienda 6) tiene 36 filas, una por cada producto activo",
            prueba: async (r, db) => (await cifra(db, `SELECT COUNT(*) FROM stock_tiendas s JOIN productos p ON p.id = s.producto_id WHERE s.tienda_id = 6 AND p.activo;`)) === 36
              && (await cifra(db, `SELECT COUNT(*) FROM stock_tiendas WHERE tienda_id = 6;`)) === 36 },
          { texto: "Cada producto de Barcelona tiene 10 unidades (360 en total)",
            prueba: async (r, db) => (await cifra(db, `SELECT SUM(unidades) FROM stock_tiendas WHERE tienda_id = 6;`)) === 360
              && (await cifra(db, `SELECT COUNT(*) FROM stock_tiendas WHERE tienda_id = 6 AND unidades <> 10;`)) === 0 },
          { texto: "Las otras tiendas siguen igual (144 filas)",
            prueba: async (r, db) => (await cifra(db, `SELECT COUNT(*) FROM stock_tiendas WHERE tienda_id <> 6;`)) === 144 },
          { texto: "Termina mostrando las 36 filas de la tienda 6",
            prueba: (r) => PRUEBA.tieneColumnas(r, ["producto_id", "unidades"]) && (r?.filas?.length ?? 0) === 36 }
        ],
        pistas: [
          "El SELECT que alimenta el INSERT sale de `productos`: `SELECT 6, id, 10 FROM productos WHERE activo`.",
          "INSERT INTO stock_tiendas (tienda_id, producto_id, unidades) SELECT 6, id, 10 FROM productos WHERE activo; SELECT * FROM stock_tiendas WHERE tienda_id = 6 ORDER BY producto_id;"
        ],
        solucion: `INSERT INTO stock_tiendas (tienda_id, producto_id, unidades)
SELECT 6, id, 10
FROM productos
WHERE activo;

SELECT *
FROM stock_tiendas
WHERE tienda_id = 6
ORDER BY producto_id;`
      }
    ]
  });
})();
