CURSO.registrar({
  id: "e6-11",
  titulo: "Guardar una consulta: vistas",
  xp: 35,
  objetivo: "Sabrás guardar una consulta con nombre como vista (CREATE VIEW), usarla como si fuera una tabla, entender que no guarda datos sino que se recalcula, y para qué sirve en el trabajo real.",
  pasos: [
    {
      tipo: "historia",
      de: "lucia",
      asunto: "Siempre la misma consulta",
      texto: "Cada semana escribo la misma consulta para saber cuántas unidades hay de cada producto sumando todas las tiendas. Y cada semana me equivoco en algo distinto.\nIván dice que deje de copiarla y pegarla: que la **guarde con nombre** en la base, para que cualquiera la use como si fuera una tabla más. Enséñame cómo."
    },
    {
      tipo: "explicacion",
      titulo: "CREATE VIEW: una consulta con nombre",
      texto: "Una **vista** es una consulta guardada con un nombre:\n`CREATE VIEW nombre AS SELECT …;`\nDesde ese momento, la usas como una tabla: `SELECT * FROM nombre;`, con su `WHERE`, su `ORDER BY` o sus `JOIN`.\nEl ejemplo crea la vista `stock_total` (unidades de cada producto sumando las tiendas) y la consulta. Recuerda: en el entorno de pruebas, la vista solo existe en esta ejecución.",
      ejemplo: `CREATE VIEW stock_total AS
SELECT producto_id, SUM(unidades) AS unidades
FROM stock_tiendas
GROUP BY producto_id;
SELECT *
FROM stock_total
ORDER BY producto_id
LIMIT 5;`
    },
    {
      tipo: "explicacion",
      titulo: "Se usa como una tabla",
      texto: "Lo bueno de la vista es que esconde la parte complicada. Quien la usa no necesita saber que hay un `GROUP BY` dentro: ve dos columnas y ya.\nPuedes unirla con otras tablas como cualquier tabla. El ejemplo junta `stock_total` con `productos` para ver los nombres de los 5 productos con más unidades en tienda.",
      ejemplo: `CREATE VIEW stock_total AS
SELECT producto_id, SUM(unidades) AS unidades
FROM stock_tiendas
GROUP BY producto_id;
SELECT p.nombre, s.unidades
FROM stock_total AS s
JOIN productos AS p ON p.id = s.producto_id
ORDER BY s.unidades DESC, p.nombre
LIMIT 5;`
    },
    {
      tipo: "prediccion",
      consulta: `CREATE VIEW stock_total AS
SELECT producto_id, SUM(unidades) AS unidades
FROM stock_tiendas
GROUP BY producto_id;
UPDATE stock_tiendas
SET unidades = unidades + 100
WHERE tienda_id = 1 AND producto_id = 1;
SELECT unidades
FROM stock_total
WHERE producto_id = 1;`,
      pregunta: "Del producto 1 hay **43** unidades entre las cuatro tiendas. Creas la vista, **después** sumas 100 unidades en Madrid y consultas la vista. ¿Qué sale?",
      opciones: ["43: la vista guardó los datos al crearla", "143: la vista se recalcula cada vez", "Da error: hay que volver a crear la vista"],
      correcta: 1,
      explicacion: "**143**. Una vista **no guarda datos**: guarda la consulta. Cada vez que la usas, se ejecuta de nuevo sobre las tablas tal como están en ese momento. Por eso siempre está al día, y por eso no ocupa espacio."
    },
    {
      tipo: "ejercicio",
      enunciado: "Crea la vista `catalogo_activo` con `id`, `nombre`, `categoria` y `precio` de los productos **activos**. En la misma ejecución, termina con `SELECT * FROM catalogo_activo ORDER BY id;`.",
      solucion: `CREATE VIEW catalogo_activo AS
SELECT id, nombre, categoria, precio
FROM productos
WHERE activo;
SELECT *
FROM catalogo_activo
ORDER BY id;`,
      varias: true,
      verificar: `SELECT * FROM catalogo_activo ORDER BY id;`,
      pistas: [
        "`CREATE VIEW catalogo_activo AS SELECT … FROM productos WHERE activo;` y después el `SELECT` del enunciado.",
        "CREATE VIEW catalogo_activo AS SELECT id, nombre, categoria, precio FROM productos WHERE activo; SELECT * FROM catalogo_activo ORDER BY id;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Para qué sirven (y cómo se cambian)",
      texto: "Las vistas se usan para dos cosas:\n- **No repetir** consultas largas: se escriben bien una vez y todos usan la misma.\n- **Seguridad**: a una cuenta de `lectura` le das permiso sobre una vista y no sobre la tabla. El ejemplo es un directorio de empleados sin dirección, teléfono ni fecha de nacimiento (eso está en `fichas_empleados` y se queda en RR. HH.).\nPara cambiar una vista: `CREATE OR REPLACE VIEW nombre AS …;` (sirve si mantienes sus columnas y, como mucho, añades otras al final). Para quitarla: `DROP VIEW nombre;`. Las tablas no se tocan.",
      ejemplo: `CREATE VIEW directorio AS
SELECT nombre, departamento, email
FROM empleados;
SELECT *
FROM directorio
ORDER BY nombre
LIMIT 5;`,
      otrosMotores: "PostgreSQL también tiene `CREATE MATERIALIZED VIEW`: esa **sí** guarda el resultado y se actualiza con `REFRESH MATERIALIZED VIEW`. Es útil para informes pesados. En SQL Server se parecen las «vistas indexadas»."
    },
    {
      tipo: "quiz",
      pregunta: "Creas una vista con `ORDER BY nombre` dentro y luego haces `SELECT * FROM vista;`. ¿Saldrá ordenada por nombre?",
      opciones: [
        "Sí, siempre: el orden queda guardado en la vista",
        "No está garantizado: el orden se pide en la consulta que usa la vista",
        "Da error: una vista no puede llevar ORDER BY"
      ],
      correcta: 1,
      explicacion: "Muchas veces saldrá ordenada, pero **nadie lo garantiza**: en cuanto la unas con otra tabla o la filtres, el orden puede cambiar. Si te importa el orden, ponlo en el `SELECT` que usa la vista."
    },
    {
      tipo: "reto",
      de: "lucia",
      enunciado: "Quiero saber cuánto toca cada cuenta la base. En **una sola ejecución**: crea la vista `cambios_por_usuario` con las columnas `usuario` y `cambios` (cuántas filas de `auditoria` tiene cada usuario) y después consúltala de **más a menos cambios**, desempatando por `usuario` en orden alfabético.",
      inicial: "-- CREATE VIEW y después el SELECT sobre la vista\n",
      varias: true,
      comprobaciones: [
        { texto: "Existe la vista cambios_por_usuario con las columnas usuario y cambios", prueba: async (r, db) => {
          const c = await db.consulta(`SELECT column_name FROM information_schema.columns WHERE table_name = 'cambios_por_usuario' ORDER BY ordinal_position;`);
          return (c?.filas || []).map(f => f?.[0]).join(",") === "usuario,cambios";
        } },
        { texto: "La vista cuenta bien los cambios de cada usuario (13 usuarios)", prueba: async (r, db) => {
          const v = await db.consulta(`SELECT usuario, cambios FROM cambios_por_usuario ORDER BY usuario;`);
          const e = await db.consulta(`SELECT usuario, COUNT(*) AS cambios FROM auditoria GROUP BY usuario ORDER BY usuario;`);
          const t = x => JSON.stringify((x?.filas || []).map(f => [String(f?.[0]), Number(f?.[1])]));
          return (v?.filas?.length ?? 0) === 13 && t(v) === t(e);
        } },
        { texto: "La consulta final sale de más a menos cambios, desempatando por usuario", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT usuario, COUNT(*) AS cambios
FROM auditoria
GROUP BY usuario
ORDER BY cambios DESC, usuario;`) }
      ],
      pistas: [
        "La vista lleva un `GROUP BY usuario` con `COUNT(*) AS cambios`. Después, `SELECT * FROM cambios_por_usuario ORDER BY cambios DESC, usuario;`.",
        "CREATE VIEW cambios_por_usuario AS SELECT usuario, COUNT(*) AS cambios FROM auditoria GROUP BY usuario; SELECT * FROM cambios_por_usuario ORDER BY cambios DESC, usuario;"
      ],
      solucion: `CREATE VIEW cambios_por_usuario AS
SELECT usuario, COUNT(*) AS cambios
FROM auditoria
GROUP BY usuario;
SELECT *
FROM cambios_por_usuario
ORDER BY cambios DESC, usuario;`
    }
  ]
});
