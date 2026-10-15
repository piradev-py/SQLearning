(function () {
  // Primera celda de una consulta interna, como texto ("" si no hay)
  const texto = async (db, sql) => {
    const r = await db.consulta(sql);
    return String(r?.filas?.[0]?.[0] ?? "");
  };
  // ¿La base rechaza esta orden? Se prueba en un punto de guardado y se deshace siempre
  const rechaza = async (db, sql) => {
    try { await db.consulta("SAVEPOINT prueba_regla;"); } catch (e) { return false; }
    let rechazada = false;
    try { await db.consulta(sql); } catch (e) { rechazada = true; }
    try { await db.consulta("ROLLBACK TO SAVEPOINT prueba_regla;"); } catch (e) { /* nada que deshacer */ }
    return rechazada;
  };

  CURSO.registrar({
    id: "e6-04",
    titulo: "Reglas que protegen: NOT NULL, UNIQUE, CHECK y DEFAULT",
    xp: 40,
    objetivo: "Sabrás poner reglas a las columnas (NOT NULL, UNIQUE, CHECK y DEFAULT), entender los errores que dan cuando alguien las incumple y añadir una regla a una tabla que ya existe con ALTER TABLE.",
    pasos: [
      {
        tipo: "historia",
        de: "ivan",
        asunto: "Lo que no se prohíbe, pasa",
        texto: "Regla de Sistemas: lo que la base no prohíbe, alguien lo acabará haciendo. Un título vacío, una prioridad «urgentísima», un stock negativo.\nQuiero una tabla para las **incidencias de IT** de la apertura que no deje meter basura. No me fío de que la gente rellene bien los formularios. Me fío de las reglas."
      },
      {
        tipo: "explicacion",
        titulo: "NOT NULL y UNIQUE",
        texto: "Una **restricción** es una regla que la base hace cumplir **siempre**, venga el dato de donde venga: un formulario, una carga masiva o alguien escribiendo SQL. Se escribe detrás del tipo de la columna:\n- `NOT NULL`: la columna no puede quedar vacía. Si falta, error **23502**.\n- `UNIQUE`: no puede haber dos filas con el mismo valor. Si se repite, error **23505**.\nYa las has sufrido: `empleados.email` es `NOT NULL UNIQUE`. En la pestaña **Esquema** verás qué columnas no admiten vacíos.",
        ejemplo: `CREATE TABLE portatiles_it (
  etiqueta text NOT NULL UNIQUE,
  modelo text NOT NULL,
  asignado_a text
);

INSERT INTO portatiles_it (etiqueta, modelo)
VALUES ('PT-001', 'Portátil Lumen 14');

SELECT *
FROM portatiles_it;`,
        consejo: "Los errores de una restricción no son un fastidio: son la base haciendo su trabajo. Cuando salte uno, lee qué regla se ha incumplido antes de buscar cómo saltártela."
      },
      {
        tipo: "explicacion",
        titulo: "CHECK y DEFAULT",
        texto: "- `CHECK (condición)`: cada fila debe cumplir la condición. `stock_tiendas` tiene `CHECK (unidades >= 0)` y `cuentas`, `CHECK (rol IN ('lectura', 'escritura', 'admin'))`. Si no se cumple, error **23514**.\n- `DEFAULT valor`: lo que se guarda si no das ese dato. `cuentas.activa` es `DEFAULT TRUE`. También existe `DEFAULT CURRENT_DATE` (la fecha del día).\nPuedes ponerle **nombre** a una regla: `CONSTRAINT unidades_positivas CHECK (unidades >= 0)`. Así el mensaje de error dice exactamente cuál ha fallado.\nEl ejemplo crea una cuenta de servicio sin decir si está activa: la regla `DEFAULT` lo decide.",
        ejemplo: `INSERT INTO cuentas (id, usuario, rol, creada, creada_por)
VALUES (30, 'tpv_barcelona', 'escritura', '2026-10-01', 'ivan.soler')
RETURNING usuario, rol, activa;`
      },
      {
        tipo: "quiz",
        pregunta: "¿Qué pasa al ejecutar `INSERT INTO stock_tiendas (tienda_id, producto_id, unidades) VALUES (6, 1, -3);`?",
        opciones: [
          "Se guarda con −3 unidades",
          "Error 23514: no cumple la regla `CHECK (unidades >= 0)`",
          "Se guarda con 0 unidades"
        ],
        correcta: 1,
        explicacion: "La regla `CHECK (unidades >= 0)` de `stock_tiendas` rechaza la fila entera con el error 23514. La base no «corrige» el dato: lo rechaza."
      },
      {
        tipo: "ejercicio",
        varias: true,
        enunciado: "Crea la tabla `material_barcelona` con `articulo` (`text`, `NOT NULL` y `UNIQUE`), `unidades` (`integer`, `NOT NULL`, `CHECK (unidades >= 0)`) y `revisado` (`boolean`, `NOT NULL`, `DEFAULT false`). Mete dos filas **sin dar `revisado`**: Escáner con 2 unidades y Caja registradora con 1. Termina con `SELECT * FROM material_barcelona ORDER BY articulo;`.",
        solucion: `CREATE TABLE material_barcelona (
  articulo text NOT NULL UNIQUE,
  unidades integer NOT NULL CHECK (unidades >= 0),
  revisado boolean NOT NULL DEFAULT false
);

INSERT INTO material_barcelona (articulo, unidades)
VALUES ('Escáner', 2), ('Caja registradora', 1);

SELECT *
FROM material_barcelona
ORDER BY articulo;`,
        pistas: [
          "Las reglas van detrás del tipo de cada columna: `unidades integer NOT NULL CHECK (unidades >= 0)`. En el INSERT, lista solo `articulo` y `unidades`.",
          "CREATE TABLE material_barcelona (articulo text NOT NULL UNIQUE, unidades integer NOT NULL CHECK (unidades >= 0), revisado boolean NOT NULL DEFAULT false); INSERT INTO material_barcelona (articulo, unidades) VALUES ('Escáner', 2), ('Caja registradora', 1); SELECT * FROM material_barcelona ORDER BY articulo;"
        ]
      },
      {
        tipo: "explicacion",
        titulo: "Añadir una regla a una tabla que ya existe",
        texto: "Con `ALTER TABLE tabla ADD CONSTRAINT nombre CHECK (…);` añades una regla a una tabla con datos. PostgreSQL revisa **todas las filas que ya hay**: si una sola la incumple, la regla no se añade (error 23514).\nEl ejemplo añade a `productos` la regla «el precio es mayor que 0» y la busca en el catálogo de reglas. Todos los precios la cumplen, así que entra sin problema.",
        ejemplo: `ALTER TABLE productos
ADD CONSTRAINT precio_positivo CHECK (precio > 0);

SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'precio_positivo';`,
        otrosMotores: "MySQL respeta `CHECK` desde la versión 8.0.16; antes lo aceptaba y lo ignoraba. BigQuery no tiene `CHECK`: allí las reglas se comprueban con consultas."
      },
      {
        tipo: "interpretar",
        pregunta: "Iván quiere que `productos` no admita stock negativo. Ejecuta `ALTER TABLE productos ADD CONSTRAINT stock_no_negativo CHECK (stock >= 0);`: falla con el error 23514. ¿Qué producto lo impide? Escribe su nombre.",
        respuesta: "Auriculares Sonora Pulse",
        pistas: [
          "La regla falla porque alguna fila ya la incumple. Busca en `productos` las filas con `stock < 0`.",
          "SELECT nombre, stock FROM productos WHERE stock < 0;"
        ],
        solucion: `SELECT nombre, stock
FROM productos
WHERE stock < 0;`
      },
      {
        tipo: "quiz",
        pregunta: "Iván, al ver el −12: «Si esta regla hubiera estado desde el principio, ese −12 no existiría». Pero un `CHECK` tiene un punto ciego. Una tabla tiene `unidades integer CHECK (unidades >= 0)`, **sin** `NOT NULL`. ¿Qué pasa si metes una fila con `unidades` en `NULL`?",
        opciones: [
          "Error 23514: `NULL` no es mayor o igual que 0",
          "Se guarda: con `NULL` la condición da «desconocido», y el `CHECK` solo rechaza lo que da falso",
          "Se guarda con 0 unidades"
        ],
        correcta: 1,
        explicacion: "`NULL >= 0` no es verdadero ni falso: es desconocido, y un `CHECK` solo rechaza lo que da **falso**. Por eso se combina con `NOT NULL`. Con `UNIQUE` pasa algo parecido: admite varios `NULL`, porque dos desconocidos no cuentan como iguales."
      },
      {
        tipo: "reto",
        de: "ivan",
        varias: true,
        enunciado: "Crea `incidencias_it` con: `id` (`integer`), `titulo` (`text`, `NOT NULL`), `prioridad` (`text`, solo admite **'baja'**, **'media'** o **'alta'**) y `abierta` (`boolean`, `NOT NULL`, `DEFAULT true`). Mete dos incidencias: la 1, «Impresora de Barcelona sin red», prioridad alta, **sin dar `abierta`**; y la 2, «Revisar las copias de seguridad», prioridad media, con `abierta` false. Termina con `SELECT * FROM incidencias_it ORDER BY id;`.",
        inicial: "-- Escribe tu consulta aquí\n",
        comprobaciones: [
          { texto: "La tabla tiene id (integer), titulo (text), prioridad (text) y abierta (boolean), en ese orden",
            prueba: async (r, db) => (await texto(db, `SELECT string_agg(column_name::text || ' ' || data_type::text, ',' ORDER BY ordinal_position) FROM information_schema.columns WHERE table_name = 'incidencias_it';`)) === "id integer,titulo text,prioridad text,abierta boolean" },
          { texto: "titulo y abierta no admiten vacíos (NOT NULL), y abierta vale true por defecto",
            prueba: async (r, db) => (await texto(db, `SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'incidencias_it' AND column_name IN ('titulo', 'abierta') AND is_nullable = 'NO';`)) === "2"
              && (await texto(db, `SELECT column_default FROM information_schema.columns WHERE table_name = 'incidencias_it' AND column_name = 'abierta';`)).toLowerCase() === "true" },
          { texto: "La prioridad rechaza un valor que no sea baja, media o alta",
            prueba: (r, db) => rechaza(db, `INSERT INTO incidencias_it (id, titulo, prioridad, abierta) VALUES (99, 'Prueba', 'urgente', true);`) },
          { texto: "Termina mostrando las 2 incidencias: la 1 abierta (por defecto) y la 2 cerrada",
            prueba: async (r, db) => (r?.filas?.length ?? 0) === 2 && PRUEBA.tieneColumnas(r, ["id", "abierta"])
              && (await texto(db, `SELECT COUNT(*) FROM incidencias_it WHERE (id = 1 AND abierta AND prioridad = 'alta') OR (id = 2 AND NOT abierta AND prioridad = 'media');`)) === "2" }
        ],
        pistas: [
          "La regla de la prioridad es `CHECK (prioridad IN ('baja', 'media', 'alta'))`. Como la primera incidencia no da `abierta` y la segunda sí, usa dos INSERT con listas de columnas distintas.",
          "CREATE TABLE incidencias_it (id integer, titulo text NOT NULL, prioridad text CHECK (prioridad IN ('baja', 'media', 'alta')), abierta boolean NOT NULL DEFAULT true); INSERT INTO incidencias_it (id, titulo, prioridad) VALUES (1, 'Impresora de Barcelona sin red', 'alta'); INSERT INTO incidencias_it (id, titulo, prioridad, abierta) VALUES (2, 'Revisar las copias de seguridad', 'media', false); SELECT * FROM incidencias_it ORDER BY id;"
        ],
        solucion: `CREATE TABLE incidencias_it (
  id integer,
  titulo text NOT NULL,
  prioridad text CHECK (prioridad IN ('baja', 'media', 'alta')),
  abierta boolean NOT NULL DEFAULT true
);

INSERT INTO incidencias_it (id, titulo, prioridad)
VALUES (1, 'Impresora de Barcelona sin red', 'alta');

INSERT INTO incidencias_it (id, titulo, prioridad, abierta)
VALUES (2, 'Revisar las copias de seguridad', 'media', false);

SELECT *
FROM incidencias_it
ORDER BY id;`
      }
    ]
  });
})();
