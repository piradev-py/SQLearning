CURSO.registrar({
  id: "e6-10",
  titulo: "Ir más rápido: índices y EXPLAIN",
  xp: 40,
  objetivo: "Sabrás qué es un índice, crearlo con CREATE INDEX, ver los que tiene una tabla y leer la primera línea de EXPLAIN para saber si una consulta recorre toda la tabla o usa un índice.",
  pasos: [
    {
      tipo: "historia",
      de: "ivan",
      asunto: "Consultas que se arrastran",
      texto: "La auditoría crece cada día y Lucía me pide buscar en ella por usuario una y otra vez. Con 497 filas va rápido. Con cinco millones, no.\nAntes de quejarte de que «la base va lenta», aprende a preguntarle **cómo** piensa buscar. Y a darle un atajo cuando lo necesite."
    },
    {
      tipo: "explicacion",
      titulo: "Un índice es el índice de un libro",
      texto: "Para encontrar «transacción» en un libro de 800 páginas puedes leerlo entero o ir al **índice** del final, que te dice la página. Una tabla igual: sin ayuda, PostgreSQL lee **todas** las filas para ver cuáles cumplen el `WHERE`.\nPara saber qué hará, pon `EXPLAIN` delante de la consulta: no la ejecuta, te enseña su **plan**. Lee solo la **primera línea**:\n- `Seq Scan` (recorrido secuencial): lee toda la tabla, fila a fila.\nLos números de `cost` y `rows` son **estimaciones**: no te fijes en ellos.",
      ejemplo: `EXPLAIN SELECT *
FROM pedidos
WHERE cliente_id = 42;`
    },
    {
      tipo: "explicacion",
      titulo: "Las claves ya traen índice",
      texto: "No todo es `Seq Scan`. Cuando creas una `PRIMARY KEY` o una regla `UNIQUE`, PostgreSQL crea **un índice automáticamente** para poder comprobar rápido que no hay repetidos.\nPor eso buscar un pedido por su `id` usa el índice de la clave primaria, que se llama `pedidos_pkey`. La primera línea dirá:\n- `Index Scan using pedidos_pkey`: va directo a la fila usando el índice.",
      ejemplo: `EXPLAIN SELECT *
FROM pedidos
WHERE id = 42;`
    },
    {
      tipo: "explicacion",
      titulo: "Crear un índice: CREATE INDEX",
      texto: "Si buscas a menudo por una columna que no es clave, puedes crearle un índice:\n`CREATE INDEX nombre ON tabla (columna);`\nEl nombre suele seguir un patrón como `idx_tabla_columna`. Para ver los índices de una tabla, consulta `pg_indexes`, una vista del sistema: `indexname` es el nombre e `indexdef`, la orden que lo creó.\nEl ejemplo crea uno en `pedidos (cliente_id)` y lista los índices de `pedidos`.",
      ejemplo: `CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'pedidos'
ORDER BY indexname;`,
      otrosMotores: "`CREATE INDEX` es casi igual en MySQL y SQL Server. Para ver el plan: MySQL también usa `EXPLAIN` (con una tabla en vez de texto) y SQL Server muestra el «plan de ejecución» gráfico. BigQuery no tiene índices: usa particiones y *clustering*."
    },
    {
      tipo: "prediccion",
      consulta: `CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);
EXPLAIN SELECT *
FROM pedidos
WHERE cliente_id = 42;`,
      pregunta: "Hace un momento, buscar por `cliente_id` daba `Seq Scan`. Ahora creas el índice y repites el `EXPLAIN` en la misma ejecución. ¿Qué cambia?",
      opciones: [
        "Nada: sigue con `Seq Scan`, el índice solo sirve para la clave primaria",
        "Usa el índice: aparece `Bitmap Index Scan on idx_pedidos_cliente`",
        "Da error: un índice no se puede crear en una tabla con datos"
      ],
      correcta: 1,
      explicacion: "Ahora usa el índice. La primera línea dice `Bitmap Heap Scan` y, debajo, `Bitmap Index Scan on idx_pedidos_cliente`: primero mira en el índice qué filas son del cliente 42 y luego va solo a por esas. Es otra forma de usar un índice, pensada para cuando salen varias filas."
    },
    {
      tipo: "ejercicio",
      enunciado: "Atención al cliente busca clientes por ciudad a todas horas. Crea un índice llamado `idx_clientes_ciudad` sobre `clientes (ciudad)`. Una sola orden.",
      solucion: `CREATE INDEX idx_clientes_ciudad ON clientes (ciudad);`,
      verificar: `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'clientes' ORDER BY indexname;`,
      pistas: [
        "`CREATE INDEX nombre ON tabla (columna);`",
        "CREATE INDEX idx_clientes_ciudad ON clientes (ciudad);"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Los índices no salen gratis",
      texto: "¿Entonces un índice en cada columna? **No.** Cada índice:\n- **ocupa espacio**, a veces tanto como la propia tabla;\n- **frena** los `INSERT`, `UPDATE` y `DELETE`, porque cada cambio también hay que apuntarlo en todos los índices;\n- y en tablas pequeñas a menudo **ni se usa**: leer 300 filas de golpe es más rápido que consultar un índice.\nUna última herramienta: `EXPLAIN ANALYZE` **sí ejecuta** la consulta y añade tiempos y filas reales. Cuidado con ponerlo delante de un `DELETE`: borra de verdad (aquí se deshace, en producción no).",
      ejemplo: `EXPLAIN ANALYZE SELECT *
FROM pedidos
WHERE id = 42;`,
      consejo: "Crea índices para las búsquedas que de verdad se repiten y son lentas, y compruébalo con `EXPLAIN` antes y después. Un índice que nadie usa es solo un peaje en cada escritura."
    },
    {
      tipo: "quiz",
      pregunta: "Un compañero ejecuta `EXPLAIN DELETE FROM pedidos;` para «ver qué pasaría». ¿Qué ocurre con los pedidos?",
      opciones: [
        "Se borran todos: EXPLAIN ejecuta la orden y además enseña el plan",
        "No se borra nada: EXPLAIN solo muestra el plan",
        "Da error: EXPLAIN solo funciona con SELECT"
      ],
      correcta: 1,
      explicacion: "`EXPLAIN` a secas **no ejecuta** nada: solo enseña cómo lo haría. El peligroso es `EXPLAIN ANALYZE DELETE …`, que sí lo ejecuta para medir tiempos reales."
    },
    {
      tipo: "quiz",
      pregunta: "Ejecutas `EXPLAIN SELECT * FROM clientes WHERE email = 'pablo.gil97@mail.example';` y la primera línea dice `Index Scan using clientes_email_key on clientes`. ¿De dónde sale ese índice, si nadie lo ha creado?",
      opciones: [
        "De la regla `UNIQUE` del email: crea su índice automáticamente",
        "PostgreSQL crea un índice en cada columna de texto",
        "Lo creó el `EXPLAIN` para poder buscar"
      ],
      correcta: 0,
      explicacion: "`email` es `UNIQUE` en `clientes`, y cada `UNIQUE` (como cada `PRIMARY KEY`) trae su índice. Por eso buscar por email ya es rápido sin hacer nada."
    },
    {
      tipo: "reto",
      de: "ivan",
      enunciado: "Lucía va a buscar mucho en la auditoría por usuario. En **una sola ejecución**: crea un índice llamado `idx_auditoria_usuario` sobre `auditoria (usuario)` y después pide el plan de `SELECT * FROM auditoria WHERE usuario = 'admin_temp';` con `EXPLAIN`. Mira en las primeras líneas del plan si ya usa el índice.",
      inicial: "-- CREATE INDEX y después EXPLAIN\n",
      varias: true,
      comprobaciones: [
        { texto: "Existe el índice idx_auditoria_usuario sobre auditoria (usuario)", prueba: async (r, db) => {
          const c = await db.consulta(`SELECT indexdef FROM pg_indexes WHERE tablename = 'auditoria' AND indexname = 'idx_auditoria_usuario';`);
          return /\(usuario\)/.test(String(c?.filas?.[0]?.[0] ?? ""));
        } },
        { texto: "Terminas con el plan (EXPLAIN) de la búsqueda de admin_temp, que usa tu índice", prueba: (r) => {
          const col = String(r?.columnas?.[0] ?? "").toLowerCase();
          const texto = (r?.filas || []).map(f => String(f?.[0] ?? "")).join("\n");
          return col === "query plan" && /idx_auditoria_usuario/.test(texto) && /admin_temp/.test(texto);
        } }
      ],
      pistas: [
        "Dos órdenes: `CREATE INDEX idx_auditoria_usuario ON auditoria (usuario);` y luego `EXPLAIN` delante del `SELECT`.",
        "CREATE INDEX idx_auditoria_usuario ON auditoria (usuario); EXPLAIN SELECT * FROM auditoria WHERE usuario = 'admin_temp';"
      ],
      solucion: `CREATE INDEX idx_auditoria_usuario ON auditoria (usuario);
EXPLAIN SELECT *
FROM auditoria
WHERE usuario = 'admin_temp';`
    }
  ]
});
