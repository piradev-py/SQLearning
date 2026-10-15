CURSO.registrar({
  id: "e7-03",
  titulo: "¿Existe o no?: EXISTS y NOT EXISTS",
  xp: 40,
  objetivo: "Sabrás preguntar por cada fila si existe algo relacionado en otra tabla con EXISTS, encontrar «los que no tienen» con NOT EXISTS y por qué es más seguro que NOT IN cuando hay NULL.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "Los que no tienen",
      texto: "Para el consejo necesito listas de **los que no**: clientes que nunca han comprado, transportistas con contrato que no mueven ni un paquete, empleados que no son responsables de nada.\nLucía dice que hay una forma de preguntar «¿existe o no?» que no falla con los huecos. Quiero esa."
    },
    {
      tipo: "explicacion",
      titulo: "EXISTS: ¿hay al menos uno?",
      texto: "`EXISTS (subconsulta)` es verdadero si la subconsulta devuelve **al menos una fila**, y falso si no devuelve ninguna.\nCasi siempre es **correlacionada**: para cada cliente de fuera, mira si hay alguna reclamación suya.\n`WHERE EXISTS (SELECT 1 FROM reclamaciones AS r WHERE r.cliente_id = c.id)`\nEse `SELECT 1` no es un truco: a `EXISTS` le da igual **qué** columnas devuelvas, solo le importa si hay filas. Escribir `1` es la costumbre para dejarlo claro.\nEn cuanto encuentra la primera fila, deja de buscar: no necesita contarlas todas.",
      ejemplo: `SELECT c.id, c.nombre
FROM clientes AS c
WHERE EXISTS (
  SELECT 1
  FROM reclamaciones AS r
  WHERE r.cliente_id = c.id
)
ORDER BY c.id;`
    },
    {
      tipo: "explicacion",
      titulo: "NOT EXISTS: los que no tienen",
      texto: "Para «los que no tienen», `NOT EXISTS`. Los clientes sin ningún pedido: para cada cliente, ¿existe algún pedido suyo? Si **no**, sale.\nSon los mismos 6 que encontraste con `LEFT JOIN … WHERE p.id IS NULL`. Las dos formas valen; `NOT EXISTS` se lee casi como la frase en castellano y no repite filas.",
      ejemplo: `SELECT c.id, c.nombre
FROM clientes AS c
WHERE NOT EXISTS (
  SELECT 1
  FROM pedidos AS p
  WHERE p.cliente_id = c.id
)
ORDER BY c.id;`,
      consejo: "Lo que más se olvida es la correlación (`WHERE p.cliente_id = c.id`). Sin ella, la subconsulta pregunta «¿existe algún pedido en el mundo?»: siempre que sí, así que `NOT EXISTS` no devuelve nada y `EXISTS` lo devuelve todo."
    },
    {
      tipo: "ejercicio",
      enunciado: "Transportistas con los que **no hay ningún envío**: `id` y `nombre` de `transportistas`, usando `NOT EXISTS` sobre `envios`, ordenado por `id`.",
      solucion: `SELECT t.id, t.nombre
FROM transportistas AS t
WHERE NOT EXISTS (
  SELECT 1
  FROM envios AS e
  WHERE e.transportista_id = t.id
)
ORDER BY t.id;`,
      pistas: [
        "Igual que el ejemplo de clientes sin pedidos: fuera `transportistas AS t`, dentro `envios AS e` con `e.transportista_id = t.id`.",
        "SELECT t.id, t.nombre FROM transportistas AS t WHERE NOT EXISTS (SELECT 1 FROM envios AS e WHERE e.transportista_id = t.id) ORDER BY t.id;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `SELECT COUNT(*) AS empleados
FROM empleados
WHERE id NOT IN (SELECT responsable_id FROM almacenes);`,
      pregunta: "Hay 23 empleados y 3 son responsables de un almacén. Dos almacenes **no tienen responsable** (`responsable_id` es `NULL`). ¿Cuántos empleados cuenta?",
      opciones: ["20", "23", "0"],
      correcta: 2,
      explicacion: "**0**. La lista de dentro es (23, 18, 19, NULL, NULL). Para el empleado 1, `NOT IN` pregunta «¿1 es distinto de 23, de 18, de 19 y de NULL?». Comparar con `NULL` da «desconocido», así que la respuesta nunca es un «sí» claro y **ninguna** fila pasa. No da error: simplemente sale vacío, y eso es lo peligroso."
    },
    {
      tipo: "arreglar",
      enunciado: "Ana quiere los empleados que **no son responsables de ningún almacén**: `id` y `nombre`, ordenados por `id` (deben salir 20). Esta consulta no da error, pero no devuelve nada. Arréglala.",
      inicial: `SELECT id, nombre
FROM empleados
WHERE id NOT IN (SELECT responsable_id FROM almacenes)
ORDER BY id;`,
      solucion: `SELECT e.id, e.nombre
FROM empleados AS e
WHERE NOT EXISTS (
  SELECT 1
  FROM almacenes AS a
  WHERE a.responsable_id = e.id
)
ORDER BY e.id;`,
      pistas: [
        "El problema son los `NULL` de `responsable_id`. Cámbialo por `NOT EXISTS` con una subconsulta correlacionada (`a.responsable_id = e.id`), o quita los `NULL` de la lista con `WHERE responsable_id IS NOT NULL`.",
        "SELECT e.id, e.nombre FROM empleados AS e WHERE NOT EXISTS (SELECT 1 FROM almacenes AS a WHERE a.responsable_id = e.id) ORDER BY e.id;"
      ]
    },
    {
      tipo: "quiz",
      pregunta: "¿Por qué `NOT EXISTS` no cae en la trampa del `NULL`?",
      opciones: [
        "Porque borra los NULL de la tabla antes de buscar",
        "Porque solo pregunta si hay alguna fila que cumpla `a.responsable_id = e.id`; las filas con NULL no cumplen y simplemente no cuentan",
        "Porque convierte los NULL en 0"
      ],
      correcta: 1,
      explicacion: "Una fila con `responsable_id` `NULL` no hace verdadera la condición, así que no «existe» para nadie: no estropea el resultado. Por eso en el trabajo real, para «los que no tienen», `NOT EXISTS` es la opción segura. Si usas `NOT IN`, asegúrate de que la lista no tiene `NULL`."
    },
    {
      tipo: "reto",
      de: "lucia",
      enunciado: "Ana quiere saber quién **nunca** ha fichado en el **Almacén central** en 2026. Con `NOT EXISTS` sobre `fichajes` (columna `centro` = `'Almacén central'`): `id` y `nombre` de esos empleados, ordenados por `id`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas id y nombre", prueba: (r) => PRUEBA.columnas(r, ["id", "nombre"]) },
        { texto: "No aparece nadie que haya fichado alguna vez en el Almacén central", prueba: async (r, db) => {
          const c = await db.consulta(`SELECT DISTINCT empleado_id FROM fichajes WHERE centro = 'Almacén central';`);
          const ids = (c?.filas || []).map(f => String(f?.[0]));
          return (r?.filas?.length ?? 0) > 0 && ids.length > 0 && !ids.some(id => PRUEBA.contiene(r, "id", id));
        } },
        { texto: "Salen todos los demás empleados, ordenados por id", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT e.id, e.nombre
FROM empleados AS e
WHERE NOT EXISTS (
  SELECT 1
  FROM fichajes AS f
  WHERE f.empleado_id = e.id
    AND f.centro = 'Almacén central'
)
ORDER BY e.id;`) }
      ],
      pistas: [
        "Dentro del `NOT EXISTS` van **dos** condiciones: la correlación `f.empleado_id = e.id` y el centro `f.centro = 'Almacén central'`. Si pones el centro fuera, no tiene sentido: los empleados no tienen columna `centro`.",
        "SELECT e.id, e.nombre FROM empleados AS e WHERE NOT EXISTS (SELECT 1 FROM fichajes AS f WHERE f.empleado_id = e.id AND f.centro = 'Almacén central') ORDER BY e.id;"
      ],
      solucion: `SELECT e.id, e.nombre
FROM empleados AS e
WHERE NOT EXISTS (
  SELECT 1
  FROM fichajes AS f
  WHERE f.empleado_id = e.id
    AND f.centro = 'Almacén central'
)
ORDER BY e.id;`
    }
  ]
});
