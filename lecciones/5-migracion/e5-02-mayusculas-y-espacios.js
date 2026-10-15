CURSO.registrar({
  id: "e5-02",
  titulo: "Mayúsculas y espacios: UPPER, LOWER, INITCAP y TRIM",
  xp: 30,
  objetivo: "Sabrás igualar mayúsculas y minúsculas, quitar los espacios que sobran y usar esas funciones para agrupar, filtrar y contar bien.",
  pasos: [
    {
      tipo: "historia",
      de: "nuria",
      asunto: "Madrid, MADRID y « Madrid  »",
      texto: "Pregunta sencilla: ¿cuántos clientes del CRM viejo son de cada ciudad? Lo intenté y me salieron **42 ciudades**. Faro no tiene clientes en 42 ciudades.\nEl problema es que cada uno escribía como quería: `Madrid`, `MADRID`, `madrid`, ` Madrid  ` con espacios… Para la base de datos, todas son distintas. Y con los emails pasa lo mismo. Antes de migrar nada, quiero que todo esté escrito **igual**."
    },
    {
      tipo: "explicacion",
      titulo: "UPPER, LOWER e INITCAP",
      texto: "Tres funciones para unificar mayúsculas:\n- `UPPER(x)`: todo en mayúsculas.\n- `LOWER(x)`: todo en minúsculas. La favorita para los emails.\n- `INITCAP(x)`: la primera letra de cada palabra en mayúscula y el resto en minúscula. Ideal para nombres y ciudades.\nNo cambian la tabla: transforman el valor **al leerlo**, como un filtro de foto que no toca el original (guardar los datos limpios llega en la etapa 6). Respetan las tildes: `INITCAP('MATEO IBÁÑEZ')` da `'Mateo Ibáñez'`.",
      ejemplo: `SELECT crm_id, nombre, UPPER(nombre) AS mayusculas,
  LOWER(nombre) AS minusculas, INITCAP(nombre) AS tipo_titulo
FROM crm_clientes
WHERE crm_id IN (1, 3, 6)
ORDER BY crm_id;`
    },
    {
      tipo: "explicacion",
      titulo: "Los espacios invisibles: TRIM y LENGTH",
      texto: "Mira el cliente 1: su ciudad es `' Valladolid  '`, con un espacio delante y dos detrás. En pantalla casi no se ve, pero `'Valladolid' = ' Valladolid  '` es **falso**.\n`LENGTH(x)` cuenta los caracteres y delata los espacios. `TRIM(x)` quita los del principio y el final (`LTRIM` solo los de la izquierda, `RTRIM` solo los de la derecha).\nLas funciones se pueden **anidar**, una dentro de otra: `INITCAP(TRIM(ciudad))` primero quita espacios y después arregla las mayúsculas. Se leen de dentro hacia fuera.",
      ejemplo: `SELECT crm_id, ciudad, LENGTH(ciudad) AS largo,
  INITCAP(TRIM(ciudad)) AS ciudad_limpia, LENGTH(TRIM(ciudad)) AS largo_limpia
FROM crm_clientes
WHERE crm_id IN (1, 3, 13)
ORDER BY crm_id;`,
      consejo: "Ojo con `ILIKE`: ignora las mayúsculas, pero **no** los espacios. `ciudad ILIKE 'madrid'` no encuentra `' Madrid  '`. Primero `TRIM`, después compara."
    },
    {
      tipo: "ejercicio",
      enunciado: "Nuria quiere la lista de **emails por arreglar**: los que no están ya en minúsculas y sin espacios. Muestra `crm_id`, `email` y `email_limpio` (`LOWER(TRIM(email))`) de los clientes cuyo `email` es distinto de su versión limpia, ordenados por `crm_id`.",
      solucion: `SELECT crm_id, email, LOWER(TRIM(email)) AS email_limpio
FROM crm_clientes
WHERE email <> LOWER(TRIM(email))
ORDER BY crm_id;`,
      pistas: [
        "Una función también se puede usar en el `WHERE`: compara `email` con `LOWER(TRIM(email))` usando `<>`.",
        "SELECT crm_id, email, LOWER(TRIM(email)) AS email_limpio FROM crm_clientes WHERE email <> LOWER(TRIM(email)) ORDER BY crm_id;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Funciones en GROUP BY y COUNT",
      texto: "Lo que sirve en el `SELECT` y el `WHERE` también sirve en el `GROUP BY`, el `ORDER BY` o dentro de un `COUNT`. Así se cuentan las ciudades **de verdad**: 42 escrituras tal cual, **10** una vez normalizadas.\n¿10? Faro tiene clientes en 9 ciudades. La décima es la **cadena vacía** `''`: hay clientes con la ciudad en blanco. Y `''` no es `NULL`: `NULL` significa «no se sabe» y `COUNT(DISTINCT)` no lo cuenta; `''` es un texto sin letras, y sí cuenta.",
      ejemplo: `SELECT COUNT(DISTINCT ciudad) AS tal_cual,
  COUNT(DISTINCT INITCAP(TRIM(ciudad))) AS normalizadas
FROM crm_clientes;`,
      consejo: "En una migración, la cadena vacía es tan mala como el `NULL`, pero más traicionera: no la encuentras con `IS NULL`. Búscala siempre aparte con `= ''`."
    },
    {
      tipo: "quiz",
      pregunta: "¿Qué devuelve `INITCAP('  MÁLAGA ')`?",
      opciones: ["`'Málaga'`", "`'  Málaga '`", "`'  MÁLAGA '`"],
      correcta: 1,
      explicacion: "`INITCAP` solo toca las mayúsculas: los espacios siguen ahí. Para tener `'Málaga'` hace falta `INITCAP(TRIM('  MÁLAGA '))`."
    },
    {
      tipo: "reto",
      de: "nuria",
      grafico: true,
      enunciado: "Ahora sí: **clientes del CRM por ciudad normalizada**. Columnas `ciudad` (`INITCAP(TRIM(ciudad))`) y `clientes` (cuántas filas hay en cada una), de más a menos clientes. Deja en el resultado la fila de la cadena vacía y la de `NULL`: quiero ver cuántas tengo que completar.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas ciudad y clientes", prueba: (r) => PRUEBA.columnas(r, ["ciudad", "clientes"]) },
        { texto: "Ninguna ciudad sale repetida y entre todas suman los 332 clientes del CRM", prueba: (r) => {
          const filas = r?.filas || [];
          const nombres = filas.map(f => f?.[0]);
          const suma = filas.reduce((s, f) => s + Number(f?.[1] ?? 0), 0);
          return filas.length > 0 && new Set(nombres).size === nombres.length && suma === 332;
        } },
        { texto: "Madrid va en primera fila, con 93 clientes", prueba: (r) => PRUEBA.valor(r, 0, "ciudad") === "Madrid" && PRUEBA.valor(r, 0, "clientes") === 93 },
        { texto: "Son las cifras por ciudad normalizada, de más a menos", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT INITCAP(TRIM(ciudad)) AS ciudad, COUNT(*) AS clientes
FROM crm_clientes
GROUP BY INITCAP(TRIM(ciudad))
ORDER BY clientes DESC;`) }
      ],
      pistas: [
        "Agrupa por la expresión normalizada, `GROUP BY INITCAP(TRIM(ciudad))`, y cuenta con `COUNT(*)` (que también cuenta la fila de `NULL`).",
        "SELECT INITCAP(TRIM(ciudad)) AS ciudad, COUNT(*) AS clientes FROM crm_clientes GROUP BY INITCAP(TRIM(ciudad)) ORDER BY clientes DESC;"
      ],
      solucion: `SELECT INITCAP(TRIM(ciudad)) AS ciudad, COUNT(*) AS clientes
FROM crm_clientes
GROUP BY INITCAP(TRIM(ciudad))
ORDER BY clientes DESC;`
    }
  ]
});
