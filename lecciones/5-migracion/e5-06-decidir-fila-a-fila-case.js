CURSO.registrar({
  id: "e5-06",
  titulo: "Decidir fila a fila: CASE",
  xp: 40,
  objetivo: "Sabrás decidir qué valor sale en cada fila con CASE: traducir valores escritos de mil maneras, repartir en tramos, agrupar por el resultado y contar solo las filas que cumplen algo.",
  pasos: [
    {
      tipo: "historia",
      de: "nuria",
      asunto: "Diez maneras de decir «sí»",
      texto: "En el sistema nuevo, `socio` es un **sí/no** de verdad. En el CRM viejo, en cambio, cada cual escribía lo que le parecía: `S`, `N`, `si`, `Sí`, `no`, `1`, `0`, `true`, `false`… y a veces nada.\nY el gasto total viene unas veces como `1234.50` y otras como `1.234,50 €`.\nNecesito una regla que mire **cada fila** y decida qué valor le toca. Sin tocar el original: solo al leer."
    },
    {
      tipo: "explicacion",
      titulo: "CASE: el «SI…» de la hoja de cálculo",
      texto: "`CASE` es como la función **SI** de Excel: mira una condición y elige un valor.\n`CASE WHEN condición THEN valor WHEN otra THEN otro ELSE si_no END`\nPostgreSQL prueba los `WHEN` **de arriba abajo** y se queda con el primero que se cumple. Si ninguno se cumple, usa el `ELSE`, y si no hay `ELSE`, devuelve `NULL`.\nEn el ejemplo, normalizamos `socio` con lo que ya sabes (`lower(trim(...))`) y lo comparamos con una lista usando `IN`. El vacío `''` no encaja en ninguna lista y queda `NULL`: no significa «no», significa **«no lo sabemos»**.",
      ejemplo: `SELECT crm_id, socio,
  CASE
    WHEN lower(trim(socio)) IN ('s', 'si', 'sí', '1', 'true') THEN true
    WHEN lower(trim(socio)) IN ('n', 'no', '0', 'false') THEN false
  END AS es_socio
FROM crm_clientes
ORDER BY crm_id
LIMIT 10;`,
      consejo: "No conviertas un vacío en «no» por comodidad. Si el CRM no lo dice, deja `NULL`: así quien lea el informe sabe que falta el dato, en vez de creer que esa persona no es socia."
    },
    {
      tipo: "explicacion",
      titulo: "CASE simple: comparar con un solo valor",
      texto: "Cuando todas las condiciones comparan **la misma columna** con un valor exacto, hay una forma más corta, el `CASE` simple:\n`CASE socio WHEN 'S' THEN 'sí' WHEN 'N' THEN 'no' ELSE 'otro formato' END`\nEs lo mismo que escribir `WHEN socio = 'S'`… pero ahorra repetir la columna. Solo sirve para igualdades exactas: para `IN`, `<` o `LIKE` necesitas la forma larga.\nEl ejemplo enseña cada escritura distinta de `socio` y cómo la lee el `CASE` simple.",
      ejemplo: `SELECT DISTINCT socio,
  CASE socio
    WHEN 'S' THEN 'sí'
    WHEN 'N' THEN 'no'
    ELSE 'otro formato'
  END AS lectura
FROM crm_clientes
ORDER BY socio;`
    },
    {
      tipo: "explicacion",
      titulo: "Tramos y GROUP BY por un CASE",
      texto: "El uso más útil de `CASE` es repartir en **tramos**. Aquí, los pedidos por importe: menos de 100 €, menos de 500 € y el resto. Como gana el primer `WHEN` que se cumple, un pedido de 50 € se queda en `'pequeño'` y ya no llega a mirar el segundo.\nDespués puedes **agrupar por el resultado**. PostgreSQL te deja escribir el alias en el `GROUP BY` (`GROUP BY tramo`) en vez de repetir el `CASE` entero.\nEl `ORDER BY MIN(total)` ordena los tramos de menor a mayor importe, no por orden alfabético.",
      ejemplo: `SELECT
  CASE
    WHEN total < 100 THEN 'pequeño'
    WHEN total < 500 THEN 'medio'
    ELSE 'grande'
  END AS tramo,
  COUNT(*) AS pedidos
FROM pedidos
GROUP BY tramo
ORDER BY MIN(total);`,
      grafico: true,
      otrosMotores: "`CASE` es estándar y funciona igual en todos los motores. Agrupar por el alias (`GROUP BY tramo`) vale en PostgreSQL, MySQL y BigQuery, pero **no en SQL Server ni Oracle**: allí repites el `CASE` entero en el `GROUP BY`."
    },
    {
      tipo: "ejercicio",
      enunciado: "Cuenta los clientes del CRM según su `socio` normalizado: columnas `es_socio` (`true` si `lower(trim(socio))` es `'s'`, `'si'`, `'sí'`, `'1'` o `'true'`; `false` si es `'n'`, `'no'`, `'0'` o `'false'`; `NULL` en cualquier otro caso) y `clientes`. Ordena por `es_socio`.",
      solucion: `SELECT
  CASE
    WHEN lower(trim(socio)) IN ('s', 'si', 'sí', '1', 'true') THEN true
    WHEN lower(trim(socio)) IN ('n', 'no', '0', 'false') THEN false
  END AS es_socio,
  COUNT(*) AS clientes
FROM crm_clientes
GROUP BY es_socio
ORDER BY es_socio;`,
      pistas: [
        "Copia el `CASE` del primer ejemplo, añade `COUNT(*) AS clientes` y agrupa por el alias `es_socio`.",
        "SELECT CASE WHEN lower(trim(socio)) IN ('s', 'si', 'sí', '1', 'true') THEN true WHEN lower(trim(socio)) IN ('n', 'no', '0', 'false') THEN false END AS es_socio, COUNT(*) AS clientes FROM crm_clientes GROUP BY es_socio ORDER BY es_socio;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `SELECT
  CASE
    WHEN total >= 100 THEN 'medio'
    WHEN total >= 500 THEN 'grande'
  END AS tramo,
  COUNT(*) AS pedidos
FROM pedidos
GROUP BY tramo
ORDER BY tramo;`,
      pregunta: "Un compañero ha escrito así los tramos. ¿Cuántos pedidos saldrán como `'grande'`?",
      opciones: ["Ninguno", "Los que pasan de 500 €", "Todos los de 100 € o más"],
      correcta: 0,
      explicacion: "**Ninguno.** Un pedido de 800 € cumple ya el primer `WHEN` (`>= 100`) y se queda en `'medio'`: el segundo `WHEN` no llega a mirarse nunca. Y los de menos de 100 € salen `NULL`, porque no hay `ELSE`. Con `>=`, la condición **más exigente va primero**."
    },
    {
      tipo: "arreglar",
      enunciado: "Arregla los tramos del compañero. Debe salir `tramo` (`'grande'` de 500 € en adelante, `'medio'` de 100 € en adelante, `'pequeño'` el resto) y `pedidos` (cuántos hay en cada uno), ordenados por `tramo`.",
      inicial: `SELECT
  CASE
    WHEN total >= 100 THEN 'medio'
    WHEN total >= 500 THEN 'grande'
    ELSE 'pequeño'
  END AS tramo,
  COUNT(*) AS pedidos
FROM pedidos
GROUP BY tramo
ORDER BY tramo;`,
      solucion: `SELECT
  CASE
    WHEN total >= 500 THEN 'grande'
    WHEN total >= 100 THEN 'medio'
    ELSE 'pequeño'
  END AS tramo,
  COUNT(*) AS pedidos
FROM pedidos
GROUP BY tramo
ORDER BY tramo;`,
      pistas: [
        "Gana el primer `WHEN` que se cumple. ¿Qué condición tiene que mirarse antes, `>= 100` o `>= 500`?",
        "Intercambia las dos líneas: primero WHEN total >= 500 THEN 'grande' y después WHEN total >= 100 THEN 'medio'."
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Contar con condición: COUNT(CASE …)",
      texto: "¿Y si quieres, en la misma fila, el total de pedidos **y** cuántos son reembolsados? Un `WHERE` quitaría el resto de pedidos.\nEl truco: `COUNT(CASE WHEN estado = 'reembolsado' THEN 1 END)`. Para cada pedido, el `CASE` da `1` si cumple y `NULL` si no (no hay `ELSE`). Y `COUNT(columna)` no cuenta los `NULL`, ¿recuerdas? Así que solo cuenta los que cumplen.\nCon `SUM(CASE WHEN … THEN total ELSE 0 END)` sumarías solo su importe.",
      ejemplo: `SELECT tienda_id,
  COUNT(*) AS pedidos,
  COUNT(CASE WHEN estado = 'reembolsado' THEN 1 END) AS reembolsados
FROM pedidos
GROUP BY tienda_id
ORDER BY tienda_id;`,
      consejo: "Todas las ramas de un `CASE` deben dar el **mismo tipo**. `CASE WHEN … THEN 1 ELSE 'nada' END` falla con el error 22P02: PostgreSQL intenta convertir `'nada'` en número y no puede. Si una rama es número, todas número (o `NULL`).",
      otrosMotores: "En la etapa 7 verás `COUNT(*) FILTER (WHERE …)`, más corto, pero solo existe en PostgreSQL (y pocos más). `COUNT(CASE …)` funciona en **todos** los motores."
    },
    {
      tipo: "reto",
      de: "nuria",
      enunciado: "Necesito `gasto_total` como número. La regla: si el texto **lleva coma**, es formato español (`1.234,50`): quita `' €'`, quita los puntos (`'.'`) y cambia la coma por punto. Si **no lleva coma**, solo quita `' €'`. En los dos casos, termina con `::numeric`. Columnas `crm_id`, `gasto_total` (el original) y `gasto` (el número), ordenadas por `crm_id`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas crm_id, gasto_total y gasto, y salen los 332 clientes", prueba: (r) => PRUEBA.columnas(r, ["crm_id", "gasto_total", "gasto"]) && (r?.filas?.length ?? 0) === 332 },
        { texto: "La columna gasto es un número, no un texto", prueba: (r) => {
          const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "gasto");
          return i >= 0 && ["numeric", "integer", "bigint", "double precision", "real"].includes(r?.tipos?.[i]);
        } },
        { texto: "El gasto de todos suma 1 948 954,01 €", prueba: (r) => {
          const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "gasto");
          if (i < 0) return false;
          const s = (r?.filas || []).reduce((t, f) => t + Number(f[i] ?? 0), 0);
          return Math.abs(s - 1948954.01) < 0.01;
        } },
        { texto: "El cliente 24 ('10.080,50 €') queda en 10080.50", prueba: (r) => {
          const ii = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "crm_id");
          const ig = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "gasto");
          const f = (r?.filas || []).find(x => Number(x?.[ii]) === 24);
          return ii >= 0 && ig >= 0 && !!f && Math.abs(Number(f[ig]) - 10080.5) < 0.001;
        } }
      ],
      pistas: [
        "Un `CASE` con dos ramas: `WHEN gasto_total LIKE '%,%' THEN …` y `ELSE …`. En la primera, encadena tres `replace` (el `' €'`, el `'.'` y la `','`); en la segunda, solo uno. Pon `::numeric` al final de cada rama.",
        "SELECT crm_id, gasto_total, CASE WHEN gasto_total LIKE '%,%' THEN replace(replace(replace(gasto_total, ' €', ''), '.', ''), ',', '.')::numeric ELSE replace(gasto_total, ' €', '')::numeric END AS gasto FROM crm_clientes ORDER BY crm_id;"
      ],
      solucion: `SELECT crm_id, gasto_total,
  CASE
    WHEN gasto_total LIKE '%,%'
      THEN replace(replace(replace(gasto_total, ' €', ''), '.', ''), ',', '.')::numeric
    ELSE replace(gasto_total, ' €', '')::numeric
  END AS gasto
FROM crm_clientes
ORDER BY crm_id;`
    }
  ]
});
