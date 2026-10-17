(function () {
  // Columnas (o tipos) de una tabla creada por el alumno, como texto «a,b,c» (vacío si no existe)
  const estructura = async (db, tabla, que) => {
    const campo = que === "tipos" ? "data_type::text" : "column_name::text";
    const r = await db.consulta(`SELECT string_agg(${campo}, ',' ORDER BY ordinal_position) FROM information_schema.columns WHERE table_name = '${tabla}';`);
    return String(r?.filas?.[0]?.[0] ?? "");
  };

  CURSO.registrar({
    id: "e6-01",
    titulo: "Crear una tabla: CREATE TABLE",
    xp: 30,
    rumor: "Iván ha vuelto. Ha dado un portazo y ha preguntado en voz alta quién está auditando sus cuentas. Nadie ha contestado. Ahora trabaja con los cascos puestos y no saluda.",
    objetivo: "Sabrás distinguir entre consultar, construir y cambiar datos, crear una tabla con CREATE TABLE eligiendo el tipo de cada columna, y trabajar en el entorno de pruebas, donde todo se deshace al terminar.",
    pasos: [
      {
        tipo: "historia",
        de: "ivan",
        asunto: "Sistemas. Normas de la casa",
        texto: "Iván Soler, Sistemas. Lucía dice que sabes consultar. Bien. Aquí vas a **construir**.\nNorma uno: en producción no tocas nada. Tienes un **entorno de pruebas** con una copia de la base.\nPrimer encargo: Barcelona abrió el 1 de octubre y la apertura se lleva en correos sueltos. Quiero una tabla con las **tareas de apertura**. Créala."
      },
      {
        tipo: "explicacion",
        titulo: "Leer, construir y cambiar",
        texto: "Hasta ahora solo has **leído**: `SELECT` mira los datos y no cambia nada. SQL tiene otras dos familias de órdenes:\n- **DDL** (*lenguaje de definición de datos*): construye o modifica la estructura. `CREATE` (crear una tabla), `ALTER` (cambiarla) y `DROP` (eliminarla).\n- **DML** (*lenguaje de manipulación de datos*): cambia las filas. `INSERT` (meter), `UPDATE` (modificar) y `DELETE` (borrar).\nPiensa en una hoja de cálculo: el DDL diseña las columnas de la plantilla; el DML rellena, corrige o borra las filas. En esta etapa verás las dos familias.",
        consejo: "En una empresa, quien analiza datos suele tener permiso solo de lectura. Aun así conviene saber construir: entenderás por qué las tablas son como son y podrás preparar las tuyas en un entorno propio."
      },
      {
        tipo: "explicacion",
        titulo: "CREATE TABLE",
        texto: "Para crear una tabla escribes su **nombre** y, entre paréntesis, cada **columna con su tipo**, separadas por comas. Son los tipos de e1-03:\n- `integer` (entero), `numeric(8, 2)` (importe con 2 decimales), `text` (texto),\n- `date` (fecha), `timestamp` (fecha y hora), `boolean` (sí/no).\nNombres en minúscula, sin tildes ni espacios (`fecha_limite`, no `Fecha límite`). Ojo: **sin coma** después de la última columna.\nEl ejemplo crea la tabla y la consulta: sale **vacía**, pero con sus columnas.",
        ejemplo: `CREATE TABLE proveedores_barcelona (
  id integer,
  nombre text,
  telefono text,
  alta date
);

SELECT *
FROM proveedores_barcelona;`,
        consejo: "Elige el tipo pensando en qué harás con el dato: si lo vas a sumar, número; si lo vas a comparar en el calendario, fecha. Un teléfono o un código postal, siempre texto.",
        otrosMotores: "Los nombres de los tipos cambian un poco: MySQL usa `VARCHAR(n)` y `DATETIME`; SQL Server, `NVARCHAR(n)`, `DATETIME2` y `BIT` en vez de `boolean`; BigQuery, `INT64`, `STRING` y `BOOL`."
      },
      {
        tipo: "explicacion",
        titulo: "El entorno de pruebas",
        texto: "Todo lo que ejecutas aquí **se deshace al terminar**: el resultado te lo recuerda. Así puedes equivocarte cuanto quieras sin romper nada.\nConsecuencia: una tabla que creas en una ejecución **ya no existe en la siguiente**. Por eso cada ejercicio de esta etapa **crea y consulta en la misma ejecución**: varias órdenes seguidas, cada una con su `;`.\nDos errores que verás:\n- **42P01**, «la tabla no existe»: ejecutaste el `SELECT` solo, después; la tabla ya se había deshecho.\n- **42P07**, «ya existe»: intentas crear una tabla con un nombre ocupado (`CREATE TABLE tiendas …`).\nPara ver nombre y tipo de cada columna, consulta `information_schema.columns`, el catálogo de la base:",
        ejemplo: `CREATE TABLE proveedores_barcelona (
  id integer,
  nombre text,
  alta date
);

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'proveedores_barcelona'
ORDER BY ordinal_position;`
      },
      {
        tipo: "prediccion",
        consulta: `CREATE TABLE prueba (
  id integer,
  nombre text
);

SELECT *
FROM prueba;`,
        pregunta: "¿Qué devuelve esta ejecución?",
        opciones: [
          "Un error: la tabla está vacía",
          "0 filas, con las columnas `id` y `nombre`",
          "1 fila con `id` y `nombre` vacíos"
        ],
        correcta: 1,
        explicacion: "La tabla existe, pero aún no tiene filas: el `SELECT` devuelve **0 filas** y aun así muestra sus dos columnas. Una tabla vacía no es un error."
      },
      {
        tipo: "ejercicio",
        varias: true,
        enunciado: "Iván quiere apuntar los contactos de la obra de Barcelona. Crea la tabla `contactos_barcelona` con tres columnas, en este orden: `nombre` (`text`), `telefono` (`text`) y `cargo` (`text`). En la **misma ejecución**, compruébala con `SELECT * FROM contactos_barcelona;`.",
        solucion: `CREATE TABLE contactos_barcelona (
  nombre text,
  telefono text,
  cargo text
);

SELECT *
FROM contactos_barcelona;`,
        verificar: `SELECT column_name::text AS columna, data_type::text AS tipo
FROM information_schema.columns
WHERE table_name = 'contactos_barcelona'
ORDER BY ordinal_position;`,
        pistas: [
          "Empieza con `CREATE TABLE contactos_barcelona (` y pon cada columna con su tipo, separadas por comas. Cierra con `);` y escribe el `SELECT` debajo.",
          "CREATE TABLE contactos_barcelona (nombre text, telefono text, cargo text); SELECT * FROM contactos_barcelona;"
        ]
      },
      {
        tipo: "arreglar",
        varias: true,
        enunciado: "Iván ha empezado la tabla `material_tienda` (columnas `articulo` `text` y `cantidad` `integer`) y la consulta después, pero PostgreSQL da un error de sintaxis. Arréglalo para que se cree la tabla y el `SELECT * FROM material_tienda;` devuelva sus dos columnas vacías.",
        inicial: `CREATE TABLE material_tienda (
  articulo text,
  cantidad integer,
);

SELECT *
FROM material_tienda;`,
        solucion: `CREATE TABLE material_tienda (
  articulo text,
  cantidad integer
);

SELECT *
FROM material_tienda;`,
        pistas: [
          "Mira el final de la lista de columnas: ¿qué sobra justo antes del paréntesis de cierre?",
          "Quita la coma que hay después de `cantidad integer`."
        ]
      },
      {
        tipo: "quiz",
        pregunta: "Ejecutas `CREATE TABLE notas (texto text);` y va bien. Luego, **en otra ejecución**, escribes `SELECT * FROM notas;` y sale el error 42P01 («la tabla no existe»). ¿Por qué?",
        opciones: [
          "Porque hay que escribir el nombre de la tabla en mayúsculas",
          "Porque el entorno de pruebas deshizo la tabla al terminar la primera ejecución",
          "Porque una tabla vacía no se puede consultar"
        ],
        correcta: 1,
        explicacion: "Cada ejecución se deshace al terminar, también el `CREATE TABLE`. Si quieres consultar la tabla, créala y consúltala **en la misma ejecución**."
      },
      {
        tipo: "reto",
        de: "ivan",
        varias: true,
        enunciado: "Crea la tabla `tareas_apertura` con estas columnas, en este orden: `id` (`integer`), `tarea` (`text`), `responsable` (`text`), `limite` (`date`) y `hecha` (`boolean`). En la misma ejecución, termina con `SELECT * FROM tareas_apertura;`.",
        inicial: "-- Escribe tu consulta aquí\n",
        comprobaciones: [
          { texto: "La tabla tareas_apertura tiene las columnas id, tarea, responsable, limite y hecha, en ese orden",
            prueba: async (r, db) => (await estructura(db, "tareas_apertura", "columnas")) === "id,tarea,responsable,limite,hecha" },
          { texto: "Cada columna tiene su tipo: integer, text, text, date y boolean",
            prueba: async (r, db) => (await estructura(db, "tareas_apertura", "tipos")) === "integer,text,text,date,boolean" },
          { texto: "Termina con el SELECT de la tabla: sus 5 columnas y 0 filas",
            prueba: (r) => PRUEBA.columnas(r, ["id", "tarea", "responsable", "limite", "hecha"]) && (r?.filas?.length ?? -1) === 0 }
        ],
        pistas: [
          "Una columna por línea, `nombre tipo`, separadas por comas (sin coma en la última). Después del `);`, en la misma ejecución, el `SELECT`.",
          "CREATE TABLE tareas_apertura (id integer, tarea text, responsable text, limite date, hecha boolean); SELECT * FROM tareas_apertura;"
        ],
        solucion: `CREATE TABLE tareas_apertura (
  id integer,
  tarea text,
  responsable text,
  limite date,
  hecha boolean
);

SELECT *
FROM tareas_apertura;`
      }
    ]
  });
})();
