(function () {
  const PLANTILLA = `SELECT id, nombre, departamento, tienda_id, email, jefe_id
FROM empleados
WHERE id >= 24
ORDER BY id;`;

  CURSO.registrar({
    id: "e6-02",
    titulo: "Meter filas: INSERT",
    xp: 35,
    objetivo: "Sabrás meter filas nuevas en una tabla con INSERT INTO … VALUES, una o varias a la vez, qué pasa con las columnas que no rellenas y cómo ver lo que acabas de meter con RETURNING.",
    pasos: [
      {
        tipo: "historia",
        de: "ivan",
        asunto: "La plantilla de Barcelona",
        texto: "Recursos Humanos ha mandado la plantilla de Barcelona: tres personas. En la tabla `empleados` todavía no existen.\nEn producción las daré de alta yo. Tú lo ensayas aquí, en pruebas, hasta que salga limpio. Si en pruebas sale bien, en real sale bien."
      },
      {
        tipo: "explicacion",
        titulo: "INSERT INTO … VALUES",
        texto: "Para meter una fila nueva dices **en qué tabla**, **qué columnas** vas a rellenar y **sus valores**, en el mismo orden:\n`INSERT INTO tabla (col1, col2) VALUES (valor1, valor2);`\nTextos y fechas van entre **comillas simples** (`'Prueba'`, `'2026-12-01'`); los números, sin comillas.\nSi añades `RETURNING *` al final, PostgreSQL te enseña la fila tal como ha quedado guardada. El ejemplo ensaya con una tienda inventada (en pruebas no pasa nada):",
        ejemplo: `INSERT INTO tiendas (id, ciudad, apertura)
VALUES (7, 'Prueba', '2026-12-01')
RETURNING *;`,
        consejo: "Escribe **siempre** la lista de columnas. Sin ella, los valores se asignan por la posición de las columnas en la tabla, y ese orden puede cambiar el día que alguien añada una columna. Con la lista, tu INSERT sigue funcionando.",
        otrosMotores: "`RETURNING` es de PostgreSQL (también existe en SQLite y MariaDB). SQL Server usa `OUTPUT inserted.*` y MySQL no tiene equivalente directo."
      },
      {
        tipo: "ejercicio",
        varias: true,
        enunciado: "Da de alta a la responsable de la tienda: `id` 24, `nombre` **Núria Puig**, `departamento` **Tienda**, `tienda_id` 6, `email` **nuria.puig@faro.example** y `jefe_id` 4 (Elena Ruiz, de Ventas). Indica las seis columnas en ese orden.",
        solucion: `INSERT INTO empleados (id, nombre, departamento, tienda_id, email, jefe_id)
VALUES (24, 'Núria Puig', 'Tienda', 6, 'nuria.puig@faro.example', 4);`,
        verificar: PLANTILLA,
        pistas: [
          "`INSERT INTO empleados (id, nombre, departamento, tienda_id, email, jefe_id) VALUES (…);` con los textos entre comillas simples.",
          "INSERT INTO empleados (id, nombre, departamento, tienda_id, email, jefe_id) VALUES (24, 'Núria Puig', 'Tienda', 6, 'nuria.puig@faro.example', 4);"
        ]
      },
      {
        tipo: "explicacion",
        titulo: "Varias filas y columnas que no rellenas",
        texto: "Puedes meter **varias filas en una sola orden**: cada fila entre paréntesis, separadas por comas.\nY puedes **dejar fuera** columnas: se quedan en `NULL` (o con su valor por defecto, que verás en e6-04). En el ejemplo, Jordi y Marta entran sin `jefe_id` porque Núria aún no está dada de alta en esta ejecución.\nOjo, no vale con todas: si dejas fuera una columna que no admite vacíos, como `email`, PostgreSQL lo rechaza con el error **23502**. Y si repites un `id` que ya existe (por ejemplo, el 7), con el **23505**.\n`empleados.id` no se rellena solo: hay que darlo (en e6-05 verás cómo numerar automáticamente).",
        ejemplo: `INSERT INTO empleados (id, nombre, departamento, tienda_id, email)
VALUES
  (25, 'Jordi Vila', 'Tienda', 6, 'jordi.vila@faro.example'),
  (26, 'Marta Casals', 'Tienda', 6, 'marta.casals@faro.example')
RETURNING id, nombre, jefe_id;`
      },
      {
        tipo: "prediccion",
        consulta: `INSERT INTO empleados (id, nombre, departamento, tienda_id, email, jefe_id)
VALUES
  (24, 'Núria Puig', 'Tienda', 6, 'nuria.puig@faro.example', 4),
  (25, 'Jordi Vila', 'Tienda', 6, 'jordi.vila@faro.example', 24),
  (26, 'Marta Casals', 'Tienda', 6, 'marta.casals@faro.example', 24);

SELECT COUNT(*) AS empleados
FROM empleados;`,
        pregunta: "Faro tenía 23 empleados. ¿Cuántos cuenta el `SELECT` del final?",
        opciones: ["3", "23", "26"],
        correcta: 2,
        explicacion: "El `SELECT` va en la misma ejecución, así que ya ve las tres filas nuevas: 23 + 3 = **26**. Fíjate en que Jordi y Marta pueden apuntar a Núria (24) aunque llegue en la misma orden: la base comprueba las referencias cuando la orden termina."
      },
      {
        tipo: "arreglar",
        enunciado: "Este INSERT no da error, pero guarda mal a Marta Casals: su nombre acaba en `departamento`. Arréglalo para que queden Núria Puig (24, Tienda, tienda 6, `nuria.puig@faro.example`, jefe 4) y Marta Casals (26, Tienda, tienda 6, `marta.casals@faro.example`, jefe 24).",
        inicial: `INSERT INTO empleados (id, nombre, departamento, tienda_id, email, jefe_id)
VALUES
  (24, 'Núria Puig', 'Tienda', 6, 'nuria.puig@faro.example', 4),
  (26, 'Tienda', 'Marta Casals', 6, 'marta.casals@faro.example', 24);`,
        solucion: `INSERT INTO empleados (id, nombre, departamento, tienda_id, email, jefe_id)
VALUES
  (24, 'Núria Puig', 'Tienda', 6, 'nuria.puig@faro.example', 4),
  (26, 'Marta Casals', 'Tienda', 6, 'marta.casals@faro.example', 24);`,
        verificar: PLANTILLA,
        pistas: [
          "Los valores se asignan en el orden de la lista de columnas: `id, nombre, departamento…`. Compara la fila de Marta con la de Núria.",
          "En la fila de Marta, intercambia `'Tienda'` y `'Marta Casals'`."
        ]
      },
      {
        tipo: "quiz",
        pregunta: "Alguien escribe `VALUES (24, “Núria Puig”, …)` con comillas **dobles** y PostgreSQL responde que «la columna Núria Puig no existe». ¿Por qué?",
        opciones: [
          "Porque los nombres con tilde no se pueden guardar",
          "Porque en SQL las comillas dobles son para nombres de columnas o tablas; los textos van entre comillas simples",
          "Porque falta la columna `nombre` en la tabla"
        ],
        correcta: 1,
        explicacion: "Con comillas dobles, PostgreSQL entiende un **nombre** (de columna o de tabla), no un valor. Los textos siempre entre comillas simples: `'Núria Puig'`."
      },
      {
        tipo: "reto",
        de: "ivan",
        varias: true,
        enunciado: "Da de alta a los tres **en una sola orden INSERT**, todos del departamento **Tienda** y de la tienda 6:\n- 24 · Núria Puig · `nuria.puig@faro.example` · jefe 4\n- 25 · Jordi Vila · `jordi.vila@faro.example` · jefe 24\n- 26 · Marta Casals · `marta.casals@faro.example` · jefe 24\nEn la misma ejecución, termina con `SELECT id, nombre, tienda_id, jefe_id FROM empleados WHERE tienda_id = 6 ORDER BY id;`.",
        inicial: "-- Escribe tu consulta aquí\n",
        comprobaciones: [
          { texto: "Están los tres (24, 25 y 26) con su nombre, departamento, tienda y email",
            prueba: async (r, db) => PRUEBA.igualA(await db.consulta(`SELECT id, nombre, departamento, tienda_id, email FROM empleados WHERE id >= 24;`), db,
              `VALUES (24, 'Núria Puig', 'Tienda', 6, 'nuria.puig@faro.example'), (25, 'Jordi Vila', 'Tienda', 6, 'jordi.vila@faro.example'), (26, 'Marta Casals', 'Tienda', 6, 'marta.casals@faro.example');`,
              { nombres: false }) },
          { texto: "Núria depende de Elena (4); Jordi y Marta, de Núria (24)",
            prueba: async (r, db) => {
              const c = await db.consulta(`SELECT COUNT(*) FROM empleados WHERE (id = 24 AND jefe_id = 4) OR (id IN (25, 26) AND jefe_id = 24);`);
              return Number(c?.filas?.[0]?.[0]) === 3;
            } },
          { texto: "Lo has hecho con una sola orden INSERT",
            prueba: () => (PRUEBA.codigo().match(/\bINSERT\b/gi) || []).length === 1 },
          { texto: "Termina mostrando id, nombre, tienda_id y jefe_id de la tienda 6, ordenados por id",
            prueba: (r) => PRUEBA.columnas(r, ["id", "nombre", "tienda_id", "jefe_id"]) && (r?.filas?.length ?? 0) === 3 && PRUEBA.ordenado(r, "id", "asc") }
        ],
        pistas: [
          "Un solo `INSERT INTO empleados (id, nombre, departamento, tienda_id, email, jefe_id) VALUES (…), (…), (…);` y después el `SELECT` del enunciado.",
          "INSERT INTO empleados (id, nombre, departamento, tienda_id, email, jefe_id) VALUES (24, 'Núria Puig', 'Tienda', 6, 'nuria.puig@faro.example', 4), (25, 'Jordi Vila', 'Tienda', 6, 'jordi.vila@faro.example', 24), (26, 'Marta Casals', 'Tienda', 6, 'marta.casals@faro.example', 24); SELECT id, nombre, tienda_id, jefe_id FROM empleados WHERE tienda_id = 6 ORDER BY id;"
        ],
        solucion: `INSERT INTO empleados (id, nombre, departamento, tienda_id, email, jefe_id)
VALUES
  (24, 'Núria Puig', 'Tienda', 6, 'nuria.puig@faro.example', 4),
  (25, 'Jordi Vila', 'Tienda', 6, 'jordi.vila@faro.example', 24),
  (26, 'Marta Casals', 'Tienda', 6, 'marta.casals@faro.example', 24);

SELECT id, nombre, tienda_id, jefe_id
FROM empleados
WHERE tienda_id = 6
ORDER BY id;`
      }
    ]
  });
})();
