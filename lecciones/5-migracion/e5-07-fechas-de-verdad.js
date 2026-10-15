CURSO.registrar({
  id: "e5-07",
  titulo: "Fechas de verdad: to_date, EXTRACT y date_trunc",
  xp: 40,
  objetivo: "Sabrás convertir en fecha un texto escrito en cualquier formato con to_date, sacar el año, el mes o el día de la semana con EXTRACT y agrupar por meses con date_trunc.",
  pasos: [
    {
      tipo: "historia",
      de: "nuria",
      asunto: "Dos calendarios en una columna",
      texto: "La `fecha_alta` del CRM es texto, y en dos formatos: unas veces `2026-03-06` y otras `20/04/2026`. Ya los contaste con patrones: 199 de un tipo y 133 del otro.\nEl sistema nuevo quiere una **fecha de verdad**, de las que se pueden ordenar, restar y agrupar por año. Y me temo que si la convierto «a lo bruto» alguna se va a quedar en el mes que no es."
    },
    {
      tipo: "explicacion",
      titulo: "to_date: dile cómo viene escrita",
      texto: "`to_date(texto, plantilla)` convierte un texto en fecha. La **plantilla** describe cómo viene escrito: `DD` es el día, `MM` el mes, `YYYY` el año con cuatro cifras, y los separadores (`/`, `-`) se escriben tal cual.\n- `to_date('20/04/2026', 'DD/MM/YYYY')` → 20 de abril.\n- `to_date('2026-03-06', 'YYYY-MM-DD')` → 6 de marzo.\nLa plantilla no adivina nada: si le dices que el día va primero, el día va primero. Por eso funciona con cualquier formato, siempre que **sepas** cuál es.",
      ejemplo: `SELECT to_date('20/04/2026', 'DD/MM/YYYY') AS fecha_1,
  to_date('2026-03-06', 'YYYY-MM-DD') AS fecha_2;`,
      otrosMotores: "MySQL: `STR_TO_DATE('20/04/2026', '%d/%m/%Y')`. SQL Server: `CONVERT(date, '20/04/2026', 103)` (el 103 es el estilo británico/español). BigQuery: `PARSE_DATE('%d/%m/%Y', '20/04/2026')`."
    },
    {
      tipo: "explicacion",
      titulo: "Dos formatos: CASE elige la plantilla",
      texto: "Con dos formatos en la misma columna, combina lo que ya sabes: un `CASE` mira el patrón de cada fila (`~`, de las expresiones regulares) y elige la plantilla que le toca.\nSi la fila tiene la forma `AAAA-MM-DD`, usa `'YYYY-MM-DD'`; si no, `'DD/MM/YYYY'`. Como las 332 filas son de uno de los dos tipos, ninguna se queda sin convertir.\nFíjate en la cabecera del resultado: `alta` ya es de tipo `date`.",
      ejemplo: `SELECT crm_id, fecha_alta,
  CASE
    WHEN fecha_alta ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN to_date(fecha_alta, 'YYYY-MM-DD')
    ELSE to_date(fecha_alta, 'DD/MM/YYYY')
  END AS alta
FROM crm_clientes
ORDER BY crm_id
LIMIT 10;`,
      consejo: "Una plantilla equivocada no siempre avisa: con `to_date('04/03/2026', 'MM/DD/YYYY')` sale el 3 de abril sin ningún error. Después de convertir, mira el mínimo y el máximo de la columna: si sale algo absurdo, revisa la plantilla."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería convertir las fechas con barras (`fecha_alta LIKE '%/%'`, formato `DD/MM/AAAA`): columnas `crm_id`, `fecha_alta` y `alta` (la fecha convertida), ordenadas por `crm_id`. Da el error 22008: `::date` lee `20/04/2026` como «mes 20». Arréglala.",
      inicial: `SELECT crm_id, fecha_alta, fecha_alta::date AS alta
FROM crm_clientes
WHERE fecha_alta LIKE '%/%'
ORDER BY crm_id;`,
      solucion: `SELECT crm_id, fecha_alta, to_date(fecha_alta, 'DD/MM/YYYY') AS alta
FROM crm_clientes
WHERE fecha_alta LIKE '%/%'
ORDER BY crm_id;`,
      pistas: [
        "PostgreSQL, aquí, entiende las barras como mes/día. No uses `::date`: dile tú el formato con `to_date` y su plantilla.",
        "Cambia fecha_alta::date por to_date(fecha_alta, 'DD/MM/YYYY')."
      ]
    },
    {
      tipo: "quiz",
      pregunta: "¿Por qué `'04/03/2026'::date` es **más peligroso** que `'20/04/2026'::date`?",
      opciones: [
        "Porque es más lento",
        "Porque no da error: lo lee como 3 de abril en vez de 4 de marzo, y nadie se entera",
        "Porque devuelve un texto en vez de una fecha"
      ],
      correcta: 1,
      explicacion: "`'20/04/2026'::date` falla (no existe el mes 20), y un error se ve. `'04/03/2026'::date` **funciona**, pero da el 3 de abril: una fecha equivocada que se cuela en los informes sin avisar. Con fechas `DD/MM`, nunca `::date`: siempre `to_date` con su plantilla."
    },
    {
      tipo: "explicacion",
      titulo: "EXTRACT y date_trunc",
      texto: "Con una fecha de verdad ya puedes preguntarle cosas:\n- `EXTRACT(YEAR FROM fecha)` da el año como **número** (2026). También `MONTH` (1–12), `DAY` e `ISODOW`, el día de la semana (1 = lunes … 7 = domingo).\n- `date_trunc('month', fecha)` «redondea hacia abajo» al primer día del mes: el 14 de agosto se convierte en el **1 de agosto a las 00:00**. Es justo lo que hacía la columna `mes` de `pedidos`, pero sin ser texto.\nOjo: `EXTRACT(MONTH …) = 8` junta agosto de 2024, de 2025 y de 2026. Para una serie mes a mes, `date_trunc`.",
      ejemplo: `SELECT date_trunc('month', fecha) AS inicio_mes,
  SUM(total) AS importe
FROM pedidos
GROUP BY inicio_mes
ORDER BY inicio_mes;`,
      grafico: true,
      otrosMotores: "`EXTRACT` es estándar. `date_trunc` es de PostgreSQL: en BigQuery es `DATE_TRUNC(fecha, MONTH)`, en SQL Server `DATETRUNC(month, fecha)` (desde 2022) y en MySQL no existe (se usa `DATE_FORMAT(fecha, '%Y-%m-01')`)."
    },
    {
      tipo: "quiz",
      pregunta: "¿Qué devuelve `date_trunc('month', TIMESTAMP '2026-08-14 03:12:00')`?",
      opciones: ["`2026-08-01 00:00:00`", "`8`", "`'2026-08'` (texto)"],
      correcta: 0,
      explicacion: "Devuelve un **timestamp**: el inicio del mes, `2026-08-01 00:00:00`. El `8` sería `EXTRACT(MONTH …)`, y el texto `'2026-08'` lo verás con `to_char` en la próxima diligencia."
    },
    {
      tipo: "ejercicio",
      enunciado: "¿Qué día de la semana se hacen más pedidos? Muestra `dia` (`EXTRACT(ISODOW FROM fecha)` de `pedidos`) y `pedidos` (cuántos hay), ordenados por `dia`.",
      solucion: `SELECT EXTRACT(ISODOW FROM fecha) AS dia,
  COUNT(*) AS pedidos
FROM pedidos
GROUP BY dia
ORDER BY dia;`,
      grafico: true,
      pistas: [
        "Igual que el ejemplo de `date_trunc`, pero con `EXTRACT(ISODOW FROM fecha)` y `COUNT(*)`. Agrupa y ordena por el alias `dia`.",
        "SELECT EXTRACT(ISODOW FROM fecha) AS dia, COUNT(*) AS pedidos FROM pedidos GROUP BY dia ORDER BY dia;"
      ]
    },
    {
      tipo: "reto",
      de: "nuria",
      enunciado: "Quiero ver de qué años son las altas del CRM. Convierte `fecha_alta` en fecha (con el `CASE` y las dos plantillas) y muestra `anio` (el año, con `EXTRACT`) y `clientes` (cuántos dieron de alta ese año), ordenados por `anio`.",
      inicial: "-- Escribe tu consulta aquí\n",
      grafico: true,
      comprobaciones: [
        { texto: "Tiene las columnas anio y clientes, y los clientes suman 332", prueba: (r) => {
          if (!PRUEBA.columnas(r, ["anio", "clientes"])) return false;
          return (r?.filas || []).reduce((t, f) => t + Number(f[1] ?? 0), 0) === 332;
        } },
        { texto: "Ninguna fecha se queda sin año (ningún NULL)", prueba: (r) => (r?.filas?.length ?? 0) > 0 && (r?.filas || []).every(f => f[0] !== null && f[0] !== undefined) },
        { texto: "Aparecen el año 1900 y el 2099, con un cliente cada uno", prueba: (r) => {
          const f1900 = (r?.filas || []).find(f => Number(f[0]) === 1900);
          const f2099 = (r?.filas || []).find(f => Number(f[0]) === 2099);
          return !!f1900 && !!f2099 && Number(f1900[1]) === 1 && Number(f2099[1]) === 1;
        } },
        { texto: "Un año por fila, con sus altas, ordenados por año", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT EXTRACT(YEAR FROM CASE
    WHEN fecha_alta ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN to_date(fecha_alta, 'YYYY-MM-DD')
    ELSE to_date(fecha_alta, 'DD/MM/YYYY')
  END) AS anio,
  COUNT(*) AS clientes
FROM crm_clientes
GROUP BY anio
ORDER BY anio;`) }
      ],
      pistas: [
        "Pon el `CASE` del ejemplo (el que elige la plantilla) **dentro** de `EXTRACT(YEAR FROM …)`. Después, `COUNT(*)`, `GROUP BY anio` y `ORDER BY anio`.",
        "SELECT EXTRACT(YEAR FROM CASE WHEN fecha_alta ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN to_date(fecha_alta, 'YYYY-MM-DD') ELSE to_date(fecha_alta, 'DD/MM/YYYY') END) AS anio, COUNT(*) AS clientes FROM crm_clientes GROUP BY anio ORDER BY anio;"
      ],
      solucion: `SELECT EXTRACT(YEAR FROM CASE
    WHEN fecha_alta ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN to_date(fecha_alta, 'YYYY-MM-DD')
    ELSE to_date(fecha_alta, 'DD/MM/YYYY')
  END) AS anio,
  COUNT(*) AS clientes
FROM crm_clientes
GROUP BY anio
ORDER BY anio;`
    }
  ]
});
