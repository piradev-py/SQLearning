(function () {
  // Primera celda de una consulta interna, como texto ("" si no hay)
  const texto = async (db, sql) => {
    const r = await db.consulta(sql);
    return String(r?.filas?.[0]?.[0] ?? "");
  };
  // ¿La base rechaza esta orden? Se prueba en un punto de guardado y se deshace siempre
  const rechaza = async (db, sql) => {
    // Si el alumno cerró la transacción con COMMIT, no hay punto de guardado posible: se abre una y se deshace
    let propia = false;
    try { await db.consulta("SAVEPOINT prueba_clave;"); } catch (e) { await db.consulta("BEGIN;"); propia = true; }
    let rechazada = false;
    try { await db.consulta(sql); } catch (e) { rechazada = true; }
    try { await db.consulta(propia ? "ROLLBACK;" : "ROLLBACK TO SAVEPOINT prueba_clave;"); } catch (e) { /* nada que deshacer */ }
    return rechazada;
  };

  CURSO.registrar({
    id: "e6-05",
    titulo: "Claves que obligan: PRIMARY KEY, FOREIGN KEY e identidad",
    xp: 40,
    objetivo: "Sabrás declarar la clave primaria de una tabla, enlazarla con otra mediante una clave foránea (REFERENCES), numerar filas automáticamente con una columna de identidad y entender qué impiden esas claves.",
    pasos: [
      {
        tipo: "historia",
        de: "ivan",
        asunto: "Turnos sin fantasmas",
        texto: "Hasta que la plantilla de Barcelona coja ritmo, la abren compañeros de Madrid por turnos. Núria los apuntaba en un Excel y ya tiene un turno de alguien que no trabaja aquí y otro repetido.\nQuiero una tabla de **turnos** que no lo permita: cada turno, de un empleado que exista, y nadie dos veces el mismo día."
      },
      {
        tipo: "explicacion",
        titulo: "PRIMARY KEY: lo que identifica cada fila",
        texto: "En e4-01 aprendiste a **leer** claves; ahora las escribes. La **clave primaria** identifica cada fila sin confusión: no se repite y no puede quedar vacía (es `UNIQUE` y `NOT NULL` a la vez).\n- De una columna: `id integer PRIMARY KEY`.\n- De varias: al final, `PRIMARY KEY (tienda_id, producto_id)`. Así es `stock_tiendas`: la que no se repite es la **pareja**, no cada columna por separado. En la pestaña **Esquema** verás las dos marcadas como clave.\nUna tabla tiene, como mucho, una clave primaria.",
        ejemplo: `CREATE TABLE visitas_obra (
  dia date PRIMARY KEY,
  tecnico text NOT NULL
);

INSERT INTO visitas_obra (dia, tecnico)
VALUES ('2026-09-28', 'Iván Soler'), ('2026-09-29', 'Nuria Campos');

SELECT *
FROM visitas_obra;`
      },
      {
        tipo: "explicacion",
        titulo: "REFERENCES: la clave foránea",
        texto: "`columna integer REFERENCES tabla (columna)` declara una **clave foránea**: cada valor debe existir en la otra tabla (y esa columna debe ser su clave primaria o `UNIQUE`). Protege en los dos sentidos:\n- No deja **meter** un hijo sin padre: `INSERT INTO stock_tiendas VALUES (7, 1, 3)` falla con el **23503**, porque no hay tienda 7.\n- No deja **borrar** un padre con hijos: `DELETE FROM clientes WHERE id = 1` también da **23503**, porque ese cliente tiene pedidos.\nY tampoco se puede eliminar una tabla de la que dependen otras: `DROP TABLE cuentas` da el **2BP01**, porque `auditoria` apunta a ella.",
        ejemplo: `CREATE TABLE llaves_tienda (
  numero integer PRIMARY KEY,
  tienda_id integer NOT NULL REFERENCES tiendas (id),
  entregada_a integer REFERENCES empleados (id)
);

INSERT INTO llaves_tienda (numero, tienda_id, entregada_a)
VALUES (1, 6, 4), (2, 6, 7);

SELECT l.numero, t.ciudad, e.nombre
FROM llaves_tienda l
JOIN tiendas t ON t.id = l.tienda_id
JOIN empleados e ON e.id = l.entregada_a
ORDER BY l.numero;`
      },
      {
        tipo: "quiz",
        pregunta: "En `llaves_tienda`, ¿qué pasa con `INSERT INTO llaves_tienda (numero, tienda_id) VALUES (3, 9);`?",
        opciones: [
          "Se guarda: `tienda_id` es un número cualquiera",
          "Error 23503: no existe ninguna tienda con `id` 9",
          "Se guarda con `tienda_id` vacío"
        ],
        correcta: 1,
        explicacion: "`tienda_id` apunta a `tiendas (id)` y solo hay tiendas del 1 al 6. La clave foránea rechaza la fila con el 23503: así no hay llaves de tiendas que no existen."
      },
      {
        tipo: "explicacion",
        titulo: "Identidad: que la base numere sola",
        texto: "En e6-02 tuviste que inventar el `id` de cada empleado. Si la base lo pone sola, nunca se repite ni se salta. Se escribe:\n`id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY`\nEn el INSERT **no das el `id`**: sale 1, 2, 3…\nCon `ALWAYS`, si intentas darlo tú, PostgreSQL da error (para forzarlo existe `OVERRIDING SYSTEM VALUE`, pero casi nunca hace falta).",
        ejemplo: `CREATE TABLE avisos_it (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  texto text NOT NULL
);

INSERT INTO avisos_it (texto)
VALUES ('Corte de red el sábado'), ('Cambio de contraseñas');

SELECT *
FROM avisos_it;`,
        consejo: "Un id automático no significa nada por sí mismo: no indica orden de importancia ni cuántas filas hay. Si se borra una fila, su número no se reutiliza, y habrá huecos. Es normal.",
        otrosMotores: "En PostgreSQL antiguo verás `id SERIAL PRIMARY KEY`. MySQL usa `AUTO_INCREMENT`; SQL Server, `IDENTITY(1,1)`."
      },
      {
        tipo: "arreglar",
        varias: true,
        enunciado: "Iván ha creado `avisos_it` con `id` automático, pero su INSERT da error. Arréglalo para que la base ponga el `id` sola y el `SELECT * FROM avisos_it;` devuelva el aviso «Revisar el router de Barcelona» con `id` 1.",
        inicial: `CREATE TABLE avisos_it (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  texto text NOT NULL
);

INSERT INTO avisos_it (id, texto)
VALUES (1, 'Revisar el router de Barcelona');

SELECT *
FROM avisos_it;`,
        solucion: `CREATE TABLE avisos_it (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  texto text NOT NULL
);

INSERT INTO avisos_it (texto)
VALUES ('Revisar el router de Barcelona');

SELECT *
FROM avisos_it;`,
        pistas: [
          "Con `GENERATED ALWAYS` el `id` no se da: quítalo de la lista de columnas y de los valores.",
          "INSERT INTO avisos_it (texto) VALUES ('Revisar el router de Barcelona');"
        ]
      },
      {
        tipo: "quiz",
        pregunta: "Las claves foráneas admiten opciones para cuando se borra el padre: `ON DELETE CASCADE` (borrar también los hijos) u `ON DELETE SET NULL` (dejarlos sin padre). Si `pedidos.cliente_id` fuera `REFERENCES clientes (id) ON DELETE CASCADE`, ¿qué pasaría al borrar un cliente?",
        opciones: [
          "Nada: la base no deja borrarlo porque tiene pedidos",
          "Se borrarían también todos sus pedidos, sin avisar",
          "Sus pedidos se quedarían con `cliente_id` vacío"
        ],
        correcta: 1,
        explicacion: "Con `CASCADE`, borrar el padre arrastra a los hijos: un `DELETE` de una fila podría llevarse cientos. Es cómodo para datos que no tienen sentido solos, y peligroso para lo que cuenta dinero. Sin opción, como en Faro, la base se niega (23503); con `SET NULL`, los hijos quedarían huérfanos."
      },
      {
        tipo: "reto",
        de: "ivan",
        varias: true,
        enunciado: "Crea `turnos_barcelona` con: `id` (`integer`, identidad y clave primaria), `empleado_id` (`integer`, `NOT NULL`, que apunte a `empleados (id)`), `dia` (`date`, `NOT NULL`) y la regla `UNIQUE (empleado_id, dia)`. Mete tres turnos **sin dar el `id`**: el empleado 8 el `2026-10-01`, el 9 el `2026-10-01` y el 8 el `2026-10-02`. Termina con `SELECT * FROM turnos_barcelona ORDER BY id;`.",
        inicial: "-- Escribe tu consulta aquí\n",
        comprobaciones: [
          { texto: "Muestra los 3 turnos con los id 1, 2 y 3, puestos por la base",
            prueba: (r) => PRUEBA.columnas(r, ["id", "empleado_id", "dia"]) && (r?.filas?.length ?? 0) === 3
              && PRUEBA.valor(r, 0, "id") === 1 && PRUEBA.valor(r, 1, "id") === 2 && PRUEBA.valor(r, 2, "id") === 3 },
          { texto: "id se numera solo y es la clave primaria",
            prueba: async (r, db) => (await texto(db, `SELECT is_identity FROM information_schema.columns WHERE table_name = 'turnos_barcelona' AND column_name = 'id';`)) === "YES"
              && (await texto(db, `SELECT COUNT(*) FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage k ON k.constraint_name = tc.constraint_name AND k.table_name = tc.table_name WHERE tc.table_name = 'turnos_barcelona' AND tc.constraint_type = 'PRIMARY KEY' AND k.column_name = 'id';`)) === "1" },
          { texto: "No deja apuntar un turno a un empleado que no existe",
            prueba: (r, db) => rechaza(db, `INSERT INTO turnos_barcelona (empleado_id, dia) VALUES (999, '2026-10-03');`) },
          { texto: "No deja apuntar al mismo empleado dos veces el mismo día",
            prueba: (r, db) => rechaza(db, `INSERT INTO turnos_barcelona (empleado_id, dia) VALUES (4, '2026-10-05'), (4, '2026-10-05');`) }
        ],
        pistas: [
          "La primera columna es `id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY`; la clave foránea, `empleado_id integer NOT NULL REFERENCES empleados (id)`; y la regla de la pareja va al final de la lista: `UNIQUE (empleado_id, dia)`.",
          "CREATE TABLE turnos_barcelona (id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY, empleado_id integer NOT NULL REFERENCES empleados (id), dia date NOT NULL, UNIQUE (empleado_id, dia)); INSERT INTO turnos_barcelona (empleado_id, dia) VALUES (8, '2026-10-01'), (9, '2026-10-01'), (8, '2026-10-02'); SELECT * FROM turnos_barcelona ORDER BY id;"
        ],
        solucion: `CREATE TABLE turnos_barcelona (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empleado_id integer NOT NULL REFERENCES empleados (id),
  dia date NOT NULL,
  UNIQUE (empleado_id, dia)
);

INSERT INTO turnos_barcelona (empleado_id, dia)
VALUES (8, '2026-10-01'), (9, '2026-10-01'), (8, '2026-10-02');

SELECT *
FROM turnos_barcelona
ORDER BY id;`
      }
    ]
  });
})();
