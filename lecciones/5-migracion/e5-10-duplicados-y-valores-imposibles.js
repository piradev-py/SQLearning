CURSO.registrar({
  id: "e5-10",
  titulo: "Duplicados y valores imposibles",
  xp: 45,
  objetivo: "Sabrás encontrar registros duplicados con una clave de comparación normalizada, contrastar una tabla con otra para ver qué sobra y detectar valores atípicos antes de que estropeen una media.",
  pasos: [
    {
      tipo: "historia",
      de: "nuria",
      asunto: "Antes de dar una cifra, cuenta bien",
      texto: "Dirección me pide «cuántos clientes tenía el CRM y cuánto gastaban de media». Fácil, ¿no? 332 filas y un `AVG`.\nPues no. Sé que hay **gente repetida**, clientes que nunca pasaron al sistema nuevo y algún valor que no puede ser verdad. Antes de dar ninguna cifra quiero saber cuántos son y cuáles. **Sin borrar nada**: eso no nos toca a nosotros."
    },
    {
      tipo: "explicacion",
      titulo: "La clave de comparación",
      texto: "Un **duplicado** es la misma persona dos veces. Pero en el CRM no está escrita igual: una vez `jon.molina@mail.example` y otra `JON.MOLINA@MAIL.EXAMPLE`. Comparando el texto tal cual, no son iguales.\nLa solución es una **clave de comparación**: el mismo dato normalizado, `lower(trim(email))`. Con ella, las dos filas de Jon coinciden. Fíjate en la segunda: otro formato de nombre y teléfono y un gasto de **0**, la huella típica de un duplicado en este CRM.\n¿Por qué el email y no el nombre? Porque dos personas distintas pueden llamarse igual, pero no comparten correo.",
      ejemplo: `SELECT crm_id, nombre, email, telefono, gasto_total
FROM crm_clientes
WHERE lower(trim(email)) = 'jon.molina@mail.example'
ORDER BY crm_id;`
    },
    {
      tipo: "ejercicio",
      enunciado: "Busca a todas las personas repetidas: agrupa el CRM por `email` (la clave `lower(trim(email))`, con ese alias) y muestra `email` y `filas` (cuántas filas tiene), solo las que tienen **más de una**. Ordena por `email`. **Ojo:** el alias se llama igual que la columna, así que en el `GROUP BY` repite la expresión entera (si escribes `GROUP BY email`, PostgreSQL agrupa por la columna original, sin limpiar).",
      solucion: `SELECT lower(trim(email)) AS email,
  COUNT(*) AS filas
FROM crm_clientes
GROUP BY lower(trim(email))
HAVING COUNT(*) > 1
ORDER BY email;`,
      pistas: [
        "`GROUP BY lower(trim(email))` (repite la expresión: el alias `email` se confundiría con la columna original) y `HAVING COUNT(*) > 1`.",
        "SELECT lower(trim(email)) AS email, COUNT(*) AS filas FROM crm_clientes GROUP BY lower(trim(email)) HAVING COUNT(*) > 1 ORDER BY email;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `SELECT COUNT(*) AS filas,
  COUNT(DISTINCT lower(trim(email))) AS personas
FROM crm_clientes;`,
      pregunta: "Hay 332 filas y acabas de ver 20 personas repetidas (cada una, dos veces). ¿Cuántas **personas** distintas hay?",
      opciones: ["332", "312", "292"],
      correcta: 1,
      explicacion: "**312**. Cada una de las 20 personas repetidas ocupa 2 filas, pero cuenta como 1: 332 − 20 = 312. Cuando la pregunta es «cuántos clientes», la respuesta es `COUNT(DISTINCT clave)`, no `COUNT(*)`."
    },
    {
      tipo: "explicacion",
      titulo: "Lo que sobra: contrastar con el sistema nuevo",
      texto: "312 personas en el CRM, pero en `clientes` (el sistema nuevo) hay 300. ¿Quiénes son las 12 de más?\nYa sabes buscar huecos: un **anti-join**. Une el CRM con `clientes` por la clave normalizada y quédate con los que **no** tienen pareja (`c.id IS NULL`).\nSalen 12 clientes con correo `@antiguo.example`: clientes de hace años que nunca se migraron. No son un error, pero no deben contar como clientes actuales.",
      ejemplo: `SELECT crm.crm_id, crm.nombre, crm.email
FROM crm_clientes AS crm
LEFT JOIN clientes AS c ON c.email = lower(trim(crm.email))
WHERE c.id IS NULL
ORDER BY crm.crm_id;`
    },
    {
      tipo: "explicacion",
      titulo: "Valores imposibles: MIN, MAX y reglas de negocio",
      texto: "Un **valor atípico** (en inglés, *outlier*) es un dato fuera de lo posible o de lo razonable. La forma más rápida de cazarlos: mirar los extremos con `MIN` y `MAX`.\nEl ejemplo da la primera y la última alta del CRM. Un alta en **1900** es imposible: Faro abrió su primera tienda en 1998. Y una en **2099** está en el futuro.\nEso es una **regla de negocio**: nada de lo que dicen los datos puede ser anterior a 1998 ni posterior a hoy. Escríbela en un `WHERE` y tendrás la lista de sospechosos.",
      ejemplo: `SELECT MIN(CASE
    WHEN fecha_alta ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN to_date(fecha_alta, 'YYYY-MM-DD')
    ELSE to_date(fecha_alta, 'DD/MM/YYYY')
  END) AS primera_alta,
  MAX(CASE
    WHEN fecha_alta ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN to_date(fecha_alta, 'YYYY-MM-DD')
    ELSE to_date(fecha_alta, 'DD/MM/YYYY')
  END) AS ultima_alta
FROM crm_clientes;`
    },
    {
      tipo: "explicacion",
      titulo: "Un solo dato puede mover una media",
      texto: "El cliente 260 tiene un gasto de **999 999,00 €**, más de 80 veces el siguiente. Mira lo que hace con la media.\nEjecuta el ejemplo: la media sale en **5 870,34 €** y el máximo en 999 999. Ahora quita los dos guiones de la línea del `WHERE` y vuelve a ejecutar: media **2 866,93 €** y máximo **11 286,40 €**.\nUna sola fila ha **duplicado** la media. Por eso, antes de dar una media, mira siempre el máximo y el mínimo.",
      ejemplo: `SELECT ROUND(AVG(CASE
    WHEN gasto_total LIKE '%,%' THEN replace(replace(replace(gasto_total, ' €', ''), '.', ''), ',', '.')::numeric
    ELSE replace(gasto_total, ' €', '')::numeric
  END), 2) AS media,
  MAX(CASE
    WHEN gasto_total LIKE '%,%' THEN replace(replace(replace(gasto_total, ' €', ''), '.', ''), ',', '.')::numeric
    ELSE replace(gasto_total, ' €', '')::numeric
  END) AS maximo
FROM crm_clientes
-- WHERE crm_id <> 260
;`,
      consejo: "Borrar no es cosa del analista. Un atípico se **marca** (con un `CASE`) o se **excluye** del cálculo (con un `WHERE`), se dice en el informe y se avisa a quien cuida los datos. Si lo borras tú, nadie podrá revisar por qué tu cifra no cuadra con la de otro."
    },
    {
      tipo: "quiz",
      pregunta: "Te piden el gasto medio de los clientes del CRM y aparece el gasto de 999 999 €. ¿Qué haces?",
      opciones: [
        "Lo cambio por la media del resto, para que no se note",
        "Lo excluyo del cálculo, lo digo en el informe y aviso a Nuria para que lo revise",
        "Lo dejo: los datos son los datos"
      ],
      correcta: 1,
      explicacion: "Inventarle un valor es falsear el dato, y dejarlo tal cual da una media que no representa a nadie. Lo profesional es **excluirlo y decirlo** («media sin el cliente 260, con un gasto imposible») y avisar a quien puede corregirlo en origen."
    },
    {
      tipo: "reto",
      de: "nuria",
      enunciado: "Pásame la lista de valores imposibles para revisarlos: columnas `crm_id`, `campo` (`'fecha_alta'` o `'gasto_total'`, el nombre de la columna sospechosa) y `valor` (el texto **original**, sin convertir). Son las altas de antes de 1998 o de después de 2026, y los gastos de más de 100 000 €. Ordena por `crm_id`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas crm_id, campo y valor", prueba: (r) => PRUEBA.columnas(r, ["crm_id", "campo", "valor"]) },
        { texto: "Salen exactamente los clientes 31, 122 y 260, y ninguno más", prueba: (r) => {
          const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "crm_id");
          const ids = (r?.filas || []).map(f => Number(f?.[i])).sort((a, b) => a - b);
          return i >= 0 && ids.length === 3 && ids[0] === 31 && ids[1] === 122 && ids[2] === 260;
        } },
        { texto: "Cada uno con su campo y su valor original, ordenados por crm_id", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT crm_id, 'fecha_alta' AS campo, fecha_alta AS valor
FROM crm_clientes
WHERE fecha_alta IN ('1900-01-01', '31/12/2099')
UNION ALL
SELECT crm_id, 'gasto_total', gasto_total
FROM crm_clientes
WHERE gasto_total = '999999.00'
ORDER BY crm_id;`) }
      ],
      pistas: [
        "Dos consultas unidas con `UNION ALL`: una para las fechas (el `CASE` de `to_date` dentro de `EXTRACT(YEAR FROM …)` y `NOT BETWEEN 1998 AND 2026`) y otra para el gasto (el `CASE` del gasto `> 100000`). Cada una pone su `campo` como texto fijo. Un único `ORDER BY crm_id` al final.",
        "SELECT crm_id, 'fecha_alta' AS campo, fecha_alta AS valor FROM crm_clientes WHERE EXTRACT(YEAR FROM CASE WHEN fecha_alta ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN to_date(fecha_alta, 'YYYY-MM-DD') ELSE to_date(fecha_alta, 'DD/MM/YYYY') END) NOT BETWEEN 1998 AND 2026 UNION ALL SELECT crm_id, 'gasto_total', gasto_total FROM crm_clientes WHERE CASE WHEN gasto_total LIKE '%,%' THEN replace(replace(replace(gasto_total, ' €', ''), '.', ''), ',', '.')::numeric ELSE replace(gasto_total, ' €', '')::numeric END > 100000 ORDER BY crm_id;"
      ],
      solucion: `SELECT crm_id, 'fecha_alta' AS campo, fecha_alta AS valor
FROM crm_clientes
WHERE EXTRACT(YEAR FROM CASE
    WHEN fecha_alta ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN to_date(fecha_alta, 'YYYY-MM-DD')
    ELSE to_date(fecha_alta, 'DD/MM/YYYY')
  END) NOT BETWEEN 1998 AND 2026
UNION ALL
SELECT crm_id, 'gasto_total', gasto_total
FROM crm_clientes
WHERE CASE
    WHEN gasto_total LIKE '%,%' THEN replace(replace(replace(gasto_total, ' €', ''), '.', ''), ',', '.')::numeric
    ELSE replace(gasto_total, ' €', '')::numeric
  END > 100000
ORDER BY crm_id;`
    }
  ]
});
