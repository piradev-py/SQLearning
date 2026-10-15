CURSO.registrar({
  id: "e7-05",
  titulo: "Jerarquías: CTE recursiva",
  xp: 45,
  objetivo: "Sabrás recorrer una jerarquía completa (un organigrama) con WITH RECURSIVE: una parte inicial, una parte que se repite sobre lo ya encontrado, un nivel que va sumando y la ruta de cada persona hasta arriba.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "El organigrama para el consejo",
      texto: "El consejo me pide el organigrama de Faro: quién depende de quién, **hasta el último nivel**, y en qué nivel está cada persona.\nEn `empleados` cada uno tiene su `jefe_id`, pero eso solo dice el jefe directo. Yo quiero la escalera entera. Y sin que nadie la dibuje a mano."
    },
    {
      tipo: "explicacion",
      titulo: "Una escalera de JOIN que no sabes cuánto mide",
      texto: "Con un self join (`empleados` unida consigo misma por `jefe_id`) bajas **un** escalón: Ana y sus directos. Para bajar dos, otro `JOIN`. Para tres, otro más… Pero ¿cuántos escalones hay? Si mañana se añade uno, la consulta se queda corta.\nUna **CTE recursiva** baja escalones **hasta que no queda nadie**. Tiene dos partes unidas con `UNION ALL`:\n1. **Parte inicial:** el punto de partida. Ana, la única sin jefe (`jefe_id IS NULL`), nivel 1.\n2. **Parte recursiva:** los empleados cuyo jefe **ya está** en el resultado, con nivel + 1.\nLa segunda parte se repite con los recién encontrados. Cuando ya no encuentra a nadie, para."
    },
    {
      tipo: "explicacion",
      titulo: "WITH RECURSIVE",
      texto: "Fíjate en la parte recursiva: el paso `organigrama` se usa **dentro de sí mismo** (`JOIN organigrama AS o`). Esa es la «recursión».\n- Vuelta 1: Ana (nivel 1).\n- Vuelta 2: los que tienen como jefe a Ana (nivel 2).\n- Vuelta 3: los que tienen como jefe a alguien del nivel 2 (nivel 3).\n- … hasta que una vuelta no añade a nadie.\nLas dos partes deben devolver las **mismas columnas**, del mismo tipo y en el mismo orden, como en cualquier `UNION ALL`.",
      ejemplo: `WITH RECURSIVE organigrama AS (
  SELECT id, nombre, jefe_id, 1 AS nivel
  FROM empleados
  WHERE jefe_id IS NULL
  UNION ALL
  SELECT e.id, e.nombre, e.jefe_id, o.nivel + 1
  FROM empleados AS e
  JOIN organigrama AS o ON e.jefe_id = o.id
)
SELECT id, nombre, jefe_id, nivel
FROM organigrama
ORDER BY nivel, id;`,
      otrosMotores: "MySQL 8, PostgreSQL y SQLite escriben `WITH RECURSIVE`. SQL Server y Oracle aceptan la recursión con un `WITH` normal (sin `RECURSIVE`). Oracle tiene además su forma antigua: `CONNECT BY PRIOR`."
    },
    {
      tipo: "prediccion",
      consulta: `WITH RECURSIVE organigrama AS (
  SELECT id, 1 AS nivel
  FROM empleados
  WHERE jefe_id IS NULL
  UNION ALL
  SELECT e.id, o.nivel + 1
  FROM empleados AS e
  JOIN organigrama AS o ON e.jefe_id = o.id
)
SELECT nivel, COUNT(*) AS empleados
FROM organigrama
GROUP BY nivel
ORDER BY nivel;`,
      pregunta: "Ana tiene 6 responsables de departamento a su cargo. ¿Cuántas personas hay en el **nivel 3** (las que dependen de esos responsables)?",
      opciones: ["4", "6", "12"],
      correcta: 2,
      explicacion: "Los niveles son **1 · 6 · 12 · 4**: Ana; los 6 responsables; 12 personas que dependen de ellos (encargados de tienda, comerciales, gente de logística…); y 4 que dependen de encargados. En total, los 23 empleados: nadie se queda fuera."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería devolver el organigrama completo (`id`, `nombre`, `nivel`, por `nivel` e `id`: 23 filas), pero solo sale Ana. La parte recursiva busca en la dirección equivocada. Arréglala.",
      inicial: `WITH RECURSIVE organigrama AS (
  SELECT id, nombre, jefe_id, 1 AS nivel
  FROM empleados
  WHERE jefe_id IS NULL
  UNION ALL
  SELECT e.id, e.nombre, e.jefe_id, o.nivel + 1
  FROM empleados AS e
  JOIN organigrama AS o ON e.id = o.jefe_id
)
SELECT id, nombre, nivel
FROM organigrama
ORDER BY nivel, id;`,
      solucion: `WITH RECURSIVE organigrama AS (
  SELECT id, nombre, jefe_id, 1 AS nivel
  FROM empleados
  WHERE jefe_id IS NULL
  UNION ALL
  SELECT e.id, e.nombre, e.jefe_id, o.nivel + 1
  FROM empleados AS e
  JOIN organigrama AS o ON e.jefe_id = o.id
)
SELECT id, nombre, nivel
FROM organigrama
ORDER BY nivel, id;`,
      pistas: [
        "`e.id = o.jefe_id` busca al **jefe** de Ana (sube), y Ana no tiene. Queremos bajar: los empleados cuyo **jefe** es alguien ya encontrado.",
        "Cambia `ON e.id = o.jefe_id` por `ON e.jefe_id = o.id`."
      ]
    },
    {
      tipo: "explicacion",
      titulo: "La ruta hasta Ana",
      texto: "En cada vuelta puedes ir **acumulando** algo, no solo el nivel. Por ejemplo, la ruta: en la parte inicial vale `nombre`; en la recursiva, la ruta del jefe más ` > ` y el nombre nuevo:\n`o.ruta || ' > ' || e.nombre`\n(`||` pega textos, como viste en limpieza.) Así cada empleado lleva escrita su cadena de mando completa.",
      ejemplo: `WITH RECURSIVE organigrama AS (
  SELECT id, nombre, 1 AS nivel, nombre AS ruta
  FROM empleados
  WHERE jefe_id IS NULL
  UNION ALL
  SELECT e.id, e.nombre, o.nivel + 1, o.ruta || ' > ' || e.nombre
  FROM empleados AS e
  JOIN organigrama AS o ON e.jefe_id = o.id
)
SELECT id, nivel, ruta
FROM organigrama
ORDER BY nivel, id;`
    },
    {
      tipo: "ejercicio",
      enunciado: "Ana quiere la cadena de mando de **Logística**: con el organigrama recursivo que lleva la `ruta`, devuelve `id`, `nombre` y `ruta` de los empleados del departamento `'Logística'`, ordenados por `id`. (Necesitas llevar `departamento` dentro de la CTE o unir el resultado con `empleados`.)",
      solucion: `WITH RECURSIVE organigrama AS (
  SELECT id, nombre, departamento, nombre AS ruta
  FROM empleados
  WHERE jefe_id IS NULL
  UNION ALL
  SELECT e.id, e.nombre, e.departamento, o.ruta || ' > ' || e.nombre
  FROM empleados AS e
  JOIN organigrama AS o ON e.jefe_id = o.id
)
SELECT id, nombre, ruta
FROM organigrama
WHERE departamento = 'Logística'
ORDER BY id;`,
      pistas: [
        "Añade `departamento` a las dos partes de la CTE (en la recursiva, `e.departamento`) y filtra en la consulta principal con `WHERE departamento = 'Logística'`. El filtro va **fuera**: si lo pones en la parte inicial, la recursión no arranca desde Ana.",
        "WITH RECURSIVE organigrama AS (SELECT id, nombre, departamento, nombre AS ruta FROM empleados WHERE jefe_id IS NULL UNION ALL SELECT e.id, e.nombre, e.departamento, o.ruta || ' > ' || e.nombre FROM empleados AS e JOIN organigrama AS o ON e.jefe_id = o.id) SELECT id, nombre, ruta FROM organigrama WHERE departamento = 'Logística' ORDER BY id;"
      ]
    },
    {
      tipo: "quiz",
      pregunta: "¿Qué pasa si en la parte recursiva olvidas la condición del `JOIN` (por ejemplo, con un `CROSS JOIN organigrama`)?",
      opciones: [
        "Devuelve solo a Ana",
        "Cada vuelta vuelve a encontrar a todos los empleados, nunca se queda sin nadie y la consulta no termina (aquí el motor la corta a los pocos segundos)",
        "PostgreSQL detecta el error y lo corrige solo"
      ],
      correcta: 1,
      explicacion: "La recursión para cuando una vuelta **no añade filas**. Sin una condición que avance de verdad (de jefe a subordinado), siempre añade y no para nunca. En un servidor real la consulta seguiría hasta agotar memoria o que alguien la cancele. Por eso, en las recursivas, revisa primero el `ON`.\n¿Y `UNION` en vez de `UNION ALL`? Quitaría filas repetidas en cada vuelta: más lento y aquí no hace falta, porque cada persona tiene un solo jefe."
    },
    {
      tipo: "reto",
      de: "ana",
      enunciado: "Necesito a todo el equipo de **Elena Ruiz** (id 4): quienes dependen de ella **directa o indirectamente**, sin incluirla a ella. Devuelve `id`, `nombre` y `nivel` (1 = los que dependen directamente de Elena, 2 = los que dependen de esos…), ordenados por `nivel` y después por `id`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas id, nombre y nivel", prueba: (r) => PRUEBA.columnas(r, ["id", "nombre", "nivel"]) },
        { texto: "Elena Ruiz no aparece y sus subordinados directos tienen nivel 1", prueba: (r) => {
          const filas = r?.filas || [];
          if (!filas.length || PRUEBA.contiene(r, "id", 4)) return false;
          return filas.some((f, i) => Number(PRUEBA.valor(r, i, "id")) === 8 && Number(PRUEBA.valor(r, i, "nivel")) === 1);
        } },
        { texto: "Salen las 10 personas de su equipo, ordenadas por nivel e id", prueba: (r, db) => PRUEBA.igualA(r, db, `WITH RECURSIVE equipo AS (
  SELECT id, nombre, 1 AS nivel
  FROM empleados
  WHERE jefe_id = 4
  UNION ALL
  SELECT e.id, e.nombre, q.nivel + 1
  FROM empleados AS e
  JOIN equipo AS q ON e.jefe_id = q.id
)
SELECT id, nombre, nivel
FROM equipo
ORDER BY nivel, id;`) }
      ],
      pistas: [
        "Cambia el punto de partida: en vez de `jefe_id IS NULL`, la parte inicial son los que tienen `jefe_id = 4`, con nivel 1. La parte recursiva es igual que en el organigrama.",
        "WITH RECURSIVE equipo AS (SELECT id, nombre, 1 AS nivel FROM empleados WHERE jefe_id = 4 UNION ALL SELECT e.id, e.nombre, q.nivel + 1 FROM empleados AS e JOIN equipo AS q ON e.jefe_id = q.id) SELECT id, nombre, nivel FROM equipo ORDER BY nivel, id;"
      ],
      solucion: `WITH RECURSIVE equipo AS (
  SELECT id, nombre, 1 AS nivel
  FROM empleados
  WHERE jefe_id = 4
  UNION ALL
  SELECT e.id, e.nombre, q.nivel + 1
  FROM empleados AS e
  JOIN equipo AS q ON e.jefe_id = q.id
)
SELECT id, nombre, nivel
FROM equipo
ORDER BY nivel, id;`
    }
  ]
});
