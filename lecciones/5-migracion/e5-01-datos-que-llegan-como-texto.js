CURSO.registrar({
  id: "e5-01",
  titulo: "Datos que llegan como texto: CAST",
  xp: 30,
  rumor: "En la cafetería se dice que Iván anda mal de dinero, algo de la hipoteca de su piso. No sé quién lo ha empezado. Ni caso: un rumor no es un dato.",
  objetivo: "Sabrás por qué una exportación llega como texto, cómo convertir sus valores a número, fecha o sí/no con CAST y ::, y qué pasa cuando un valor no se deja convertir.",
  pasos: [
    {
      tipo: "historia",
      de: "nuria",
      asunto: "El CRM viejo, por fin en nuestras manos",
      texto: "Hola, soy Nuria, de migración de sistemas. Me toca pasar el **CRM antiguo** al sistema nuevo y ya lo tienes cargado en la tabla `crm_clientes`. Lo cuidó durante años «quien pasaba por allí», así que viene como viene.\nPrimera sorpresa: le pedí a la tabla los clientes que más han gastado y el orden no tiene ningún sentido. Antes de limpiar nada, necesito que entiendas **por qué**."
    },
    {
      tipo: "explicacion",
      titulo: "Una exportación lo trae todo como texto",
      texto: "Abre la pestaña **Esquema** y mira `crm_clientes`: salvo `crm_id`, **todas** las columnas son `text`. Hasta el gasto y la fecha de alta.\nEs lo normal cuando los datos salen de un CSV, de un Excel o de un programa viejo: el que exporta no sabe qué es cada cosa y lo guarda todo como letras. Recuerda los tipos de e1-03: para la base de datos, `'999999.00'` no es un número, es una fila de caracteres.\nY el texto se ordena **como en un diccionario**, carácter a carácter: `'9…'` va por delante de `'7…'`, y este por delante de `'1…'`, da igual cuántas cifras tenga.",
      ejemplo: `SELECT crm_id, gasto_total
FROM crm_clientes
WHERE crm_id IN (66, 80, 260, 270)
ORDER BY gasto_total DESC;`,
      consejo: "Cuando una cifra «no cuadra», lo primero que miro es el tipo de la columna en el esquema. La mitad de los misterios de una migración se resuelven ahí."
    },
    {
      tipo: "explicacion",
      titulo: "Convertir: CAST y ::",
      texto: "Para que un texto se comporte como número hay que **convertirlo** (en la jerga, hacer un *cast*). Hay dos formas de escribirlo:\n- `CAST(gasto_total AS numeric)`, la forma estándar.\n- `gasto_total::numeric`, el atajo de PostgreSQL.\nIgual con otros tipos: `::integer`, `::date`, `::boolean` (`'true'::boolean` da `true`).\nLa función `pg_typeof(x)` te dice de qué tipo es algo. Ordena ahora por el valor convertido: el 270 (11 286,40) ya va detrás del 260 y delante del 66.",
      ejemplo: `SELECT crm_id, gasto_total, pg_typeof(gasto_total) AS tipo_antes,
  gasto_total::numeric AS gasto, pg_typeof(gasto_total::numeric) AS tipo_despues
FROM crm_clientes
WHERE crm_id IN (66, 80, 260, 270)
ORDER BY gasto DESC;`,
      otrosMotores: "`CAST(x AS tipo)` funciona en todos los motores. El `::` es solo de PostgreSQL: en MySQL, SQL Server o BigQuery usa `CAST`."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT '10' < '9' AS como_texto, 10 < 9 AS como_numero;`,
      pregunta: "¿Qué devuelve cada columna?",
      opciones: [
        "`como_texto` = false y `como_numero` = false",
        "`como_texto` = true y `como_numero` = false",
        "Las dos dan error: no se pueden comparar"
      ],
      correcta: 1,
      explicacion: "Entre comillas son textos y se comparan letra a letra: `'1'` va antes que `'9'`, así que `'10' < '9'` es **verdadero**. Sin comillas son números y 10 no es menor que 9. Por eso el gasto del CRM salía desordenado."
    },
    {
      tipo: "ejercicio",
      enunciado: "Nuria quiere ver tres clientes con el gasto ya convertido. Muestra `crm_id`, `gasto_total` (tal cual) y `gasto` (`gasto_total` convertido a `numeric`) de los clientes con `crm_id` 2, 3 y 7, ordenados por `crm_id`.",
      solucion: `SELECT crm_id, gasto_total, gasto_total::numeric AS gasto
FROM crm_clientes
WHERE crm_id IN (2, 3, 7)
ORDER BY crm_id;`,
      pistas: [
        "Convierte con `gasto_total::numeric` (o `CAST(gasto_total AS numeric)`) y ponle el alias `gasto`. Filtra con `IN`.",
        "SELECT crm_id, gasto_total, gasto_total::numeric AS gasto FROM crm_clientes WHERE crm_id IN (2, 3, 7) ORDER BY crm_id;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Cuando un valor no se deja convertir",
      texto: "Una conversión es **todo o nada**: si un solo valor no tiene forma de número, la consulta entera falla con el **error 22P02** («invalid input syntax for type numeric»). Y el CRM tiene gastos escritos a la española, como `'2.136,70'` o `'4.168,50 €'`: PostgreSQL espera el punto como decimal y sin símbolos.\nOtra trampa más silenciosa: convertir el código postal a `integer` **se come el cero** de delante. `'08001'` pasa a ser `8001`, y eso ya no es un código postal (lo arreglaremos en unas diligencias).",
      ejemplo: `SELECT crm_id, cp, cp::integer AS cp_numero
FROM crm_clientes
WHERE crm_id = 4;`,
      consejo: "Un código postal, un teléfono o un DNI parecen números, pero no los sumas ni los ordenas por tamaño: guárdalos como texto. Regla de oficina: si no tiene sentido sumarlo, no es un número.",
      otrosMotores: "SQL Server tiene `TRY_CAST` y BigQuery `SAFE_CAST`: en vez de fallar, devuelven `NULL` en el valor que no se puede convertir. PostgreSQL no tiene equivalente directo."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería mostrar `crm_id` y `gasto` (el `gasto_total` convertido a `numeric`) de los clientes cuyo gasto viene escrito **con punto decimal**, es decir, sin coma y sin `€`, ordenados por `crm_id`. Ahora mismo da el error 22P02. Añade un `WHERE` que deje solo esos valores: `gasto_total NOT LIKE '%,%' AND gasto_total NOT LIKE '%€%'`.",
      inicial: `SELECT crm_id, gasto_total::numeric AS gasto
FROM crm_clientes
ORDER BY crm_id;`,
      solucion: `SELECT crm_id, gasto_total::numeric AS gasto
FROM crm_clientes
WHERE gasto_total NOT LIKE '%,%'
  AND gasto_total NOT LIKE '%€%'
ORDER BY crm_id;`,
      pistas: [
        "El `WHERE` se aplica antes de calcular las columnas del `SELECT`: si quitas las filas con coma o con `€`, la conversión ya no encuentra valores raros.",
        "Añade entre el FROM y el ORDER BY: WHERE gasto_total NOT LIKE '%,%' AND gasto_total NOT LIKE '%€%'"
      ]
    },
    {
      tipo: "reto",
      de: "nuria",
      enunciado: "Quiero los **5 mayores gastos** del CRM entre los que vienen con punto decimal (`gasto_total NOT LIKE '%,%' AND gasto_total NOT LIKE '%€%'`). Columnas `crm_id` y `gasto` (el gasto convertido a número), de mayor a menor gasto. Y esta vez, en orden de verdad.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Devuelve 5 filas con las columnas crm_id y gasto", prueba: (r) => (r?.filas?.length ?? 0) === 5 && PRUEBA.columnas(r, ["crm_id", "gasto"]) },
        { texto: "La columna gasto es un número, no un texto", prueba: (r) => {
          const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "gasto");
          return i >= 0 && ["numeric", "integer", "bigint", "real", "double precision", "smallint"].includes(r?.tipos?.[i]);
        } },
        { texto: "Está en orden numérico de mayor a menor: primero el 260 y después el 270", prueba: (r) => PRUEBA.ordenado(r, "gasto", "desc") && PRUEBA.valor(r, 0, "crm_id") === 260 && PRUEBA.valor(r, 1, "crm_id") === 270 },
        { texto: "Son los 5 mayores gastos con punto decimal", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT crm_id, gasto_total::numeric AS gasto
FROM crm_clientes
WHERE gasto_total NOT LIKE '%,%'
  AND gasto_total NOT LIKE '%€%'
ORDER BY gasto DESC
LIMIT 5;`) }
      ],
      pistas: [
        "Parte de la consulta que acabas de arreglar: el mismo `WHERE`, pero ordena por `gasto` (el número, no el texto) de mayor a menor y quédate con 5 filas.",
        "SELECT crm_id, gasto_total::numeric AS gasto FROM crm_clientes WHERE gasto_total NOT LIKE '%,%' AND gasto_total NOT LIKE '%€%' ORDER BY gasto DESC LIMIT 5;"
      ],
      solucion: `SELECT crm_id, gasto_total::numeric AS gasto
FROM crm_clientes
WHERE gasto_total NOT LIKE '%,%'
  AND gasto_total NOT LIKE '%€%'
ORDER BY gasto DESC
LIMIT 5;`
    }
  ]
});
