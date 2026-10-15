CURSO.registrar({
  id: "e4-07",
  titulo: "Una tabla consigo misma: self join",
  xp: 45,
  objetivo: "Sabrás unir una tabla consigo misma con dos alias para leer relaciones dentro de la misma tabla, como quién es el jefe de cada empleado, y contar subordinados con GROUP BY.",
  pasos: [
    {
      tipo: "historia",
      de: "hector",
      asunto: "¿Quién depende de quién?",
      texto: "Oye, una cosa rápida. Recursos humanos me pide un **organigrama** para el manual de bienvenida de las nuevas incorporaciones: cada empleado con el nombre de **su jefe**.\nEn `empleados` hay una columna `jefe_id`, pero solo tiene números. Y el jefe también es un empleado, así que está en la misma tabla. ¿Se puede unir una tabla con ella misma? Si te lío, me dices y lo hago yo a mano, ¿eh?"
    },
    {
      tipo: "explicacion",
      titulo: "Una clave foránea que apunta a su propia tabla",
      texto: "`empleados.jefe_id` es una clave foránea, como `envios.almacen_id`, pero apunta a `empleados.id`: a **la misma tabla**.\nEn el ejemplo, Héctor Vidal (5) tiene `jefe_id` 1: su jefa es la empleada 1, Ana Beltrán. Y Ana tiene `jefe_id` `NULL`: es la directora general y no depende de nadie.\nPara poner el nombre del jefe al lado de cada empleado hay que unir `empleados` con `empleados`.",
      ejemplo: `SELECT id, nombre, departamento, jefe_id
FROM empleados
ORDER BY id;`
    },
    {
      tipo: "explicacion",
      titulo: "Dos alias, dos papeles",
      texto: "El truco es imaginar **dos fotocopias** de la misma lista: en una buscas al empleado y en la otra, a su jefe. Cada fotocopia lleva su propio alias: `em` (el empleado) y `j` (el jefe).\nEl `ON em.jefe_id = j.id` se lee así: «el `jefe_id` del empleado es el `id` del jefe».\nLos alias aquí son **obligatorios**. Sin ellos, PostgreSQL no sabe a qué copia te refieres y da el error **42712**: `table name \"empleados\" specified more than once`.\nEl ejemplo busca el jefe de Carmen Llorente.",
      ejemplo: `SELECT em.nombre AS empleado, j.nombre AS jefe
FROM empleados AS em
JOIN empleados AS j ON em.jefe_id = j.id
WHERE em.nombre = 'Carmen Llorente';`,
      consejo: "Renombra siempre las dos columnas `nombre` (`AS empleado`, `AS jefe`). Si no, el resultado tiene dos columnas llamadas igual y en el informe nadie sabe cuál es cuál."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT em.nombre AS empleado, j.nombre AS jefe
FROM empleados AS em
JOIN empleados AS j ON em.jefe_id = j.id;`,
      pregunta: "En Faro hay 23 empleados. ¿Cuántas filas devolverá esta consulta, sin el `WHERE`?",
      opciones: ["23", "22", "46"],
      correcta: 1,
      explicacion: "**22**. Es un `INNER JOIN`: solo salen los empleados que tienen pareja en la otra copia. Ana Beltrán tiene `jefe_id` `NULL`, así que no encuentra jefe y desaparece. Si quieres que salga con el jefe vacío, ya sabes: `LEFT JOIN`, y salen las 22."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería mostrar cada empleado con su jefe: columnas `empleado` y `jefe` (el orden da igual). No da error, pero el resultado está **al revés**: en `empleado` salen los jefes. Arréglala.",
      inicial: `SELECT em.nombre AS empleado, j.nombre AS jefe
FROM empleados AS em
JOIN empleados AS j ON em.id = j.jefe_id;`,
      solucion: `SELECT em.nombre AS empleado, j.nombre AS jefe
FROM empleados AS em
JOIN empleados AS j ON em.jefe_id = j.id;`,
      pistas: [
        "Lee el `ON` en voz alta: «el `id` del empleado es el `jefe_id` del jefe». Eso convierte a `j` en el subordinado. ¿De qué copia debería salir el `jefe_id`?",
        "El `jefe_id` es del empleado y el `id`, del jefe: ON em.jefe_id = j.id"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Dos saltos: el jefe del jefe",
      texto: "Si necesitas subir otro escalón, añade una **tercera copia** con otro alias (`jj`) y otro `JOIN`: el `jefe_id` del jefe es el `id` del jefe del jefe.\nCarmen Llorente depende de Pablo Herrero, y Pablo, de Elena Ruiz.\nCada escalón es un `JOIN` más. Para recorrer la jerarquía entera, sin saber cuántos escalones tiene, hace falta otra herramienta (una consulta recursiva) que verás en la etapa 7.",
      ejemplo: `SELECT em.nombre AS empleado, j.nombre AS jefe, jj.nombre AS jefe_del_jefe
FROM empleados AS em
JOIN empleados AS j ON em.jefe_id = j.id
JOIN empleados AS jj ON j.jefe_id = jj.id
WHERE em.nombre = 'Carmen Llorente';`
    },
    {
      tipo: "ejercicio",
      enunciado: "Recursos humanos también quiere saber cuántas personas tiene **a su cargo directo** cada jefe. Une `empleados` consigo misma, agrupa por el jefe y muestra `jefe` (su nombre) y `subordinados` (cuántos empleados dependen directamente de él o ella), de **más a menos** subordinados. Solo salen quienes tienen a alguien a su cargo.",
      solucion: `SELECT j.nombre AS jefe, COUNT(*) AS subordinados
FROM empleados AS em
JOIN empleados AS j ON em.jefe_id = j.id
GROUP BY j.id, j.nombre
ORDER BY subordinados DESC;`,
      grafico: true,
      pistas: [
        "Mismo `JOIN` que antes (`ON em.jefe_id = j.id`); después agrupa por la copia del jefe (`j.id, j.nombre`) y cuenta.",
        "SELECT j.nombre AS jefe, COUNT(*) AS subordinados FROM empleados AS em JOIN empleados AS j ON em.jefe_id = j.id GROUP BY j.id, j.nombre ORDER BY subordinados DESC;"
      ]
    },
    {
      tipo: "reto",
      de: "hector",
      enunciado: "Lo del manual de bienvenida: el **directorio completo**, con **todos** los empleados, también quien no tiene jefe. Columnas `empleado` (su nombre), `departamento` (el del empleado) y `jefe` (el nombre de su jefe), ordenado por el **id del empleado**.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas empleado, departamento y jefe", prueba: (r) => PRUEBA.columnas(r, ["empleado", "departamento", "jefe"]) },
        { texto: "Salen los 23 empleados", prueba: (r) => (r?.filas?.length ?? 0) === 23 },
        { texto: "Ana Beltrán aparece, con el jefe vacío (NULL)", prueba: (r) => {
          const c = (r?.columnas || []).map(x => String(x).toLowerCase());
          const ie = c.indexOf("empleado"), ij = c.indexOf("jefe");
          return ie >= 0 && ij >= 0 && (r?.filas || []).some(f => f[ie] === "Ana Beltrán" && f[ij] === null);
        } },
        { texto: "Cada empleado tiene su jefe, en orden de id", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT em.nombre AS empleado, em.departamento, j.nombre AS jefe
FROM empleados AS em
LEFT JOIN empleados AS j ON em.jefe_id = j.id
ORDER BY em.id;`) }
      ],
      pistas: [
        "Para no perder a quien no tiene jefe, cambia el `JOIN` por `LEFT JOIN`. El departamento sale de la copia del empleado (`em`), y el orden, de `em.id`.",
        "SELECT em.nombre AS empleado, em.departamento, j.nombre AS jefe FROM empleados AS em LEFT JOIN empleados AS j ON em.jefe_id = j.id ORDER BY em.id;"
      ],
      solucion: `SELECT em.nombre AS empleado, em.departamento, j.nombre AS jefe
FROM empleados AS em
LEFT JOIN empleados AS j ON em.jefe_id = j.id
ORDER BY em.id;`
    }
  ]
});
