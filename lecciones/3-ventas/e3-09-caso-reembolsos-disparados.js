CURSO.registrar({
  id: "e3-09",
  titulo: "Caso: Reembolsos disparados",
  xp: 60,
  objetivo: "Sabrás comparar grupos de distinto tamaño con proporciones en lugar de cifras sueltas y seguir la evolución de un problema mes a mes con GROUP BY y el gráfico.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "Contabilidad no está contenta",
      texto: "Me acaba de llamar contabilidad: este año **devolvemos mucho más dinero** que el anterior y quieren una explicación para el comité.\nYo creo que es cosa de todas las tiendas, que la gente devuelve más que antes. Pero no quiero ir con una intuición: quiero **números**.\n¿Puedes mirar dónde y desde cuándo pasa?"
    },
    {
      tipo: "explicacion",
      titulo: "Cifras sueltas o proporciones",
      texto: "Si una tienda vende diez veces más que otra, es normal que también tenga más devoluciones. Comparar recuentos a secas engaña: hay que comparar **proporciones**, «de cada 100 pedidos, cuántos se reembolsan».\nSe calcula dividiendo y multiplicando por 100. El ejemplo saca qué porcentaje de **todos** los pedidos (2 524) se cancela: un 8,4 %.",
      ejemplo: `SELECT ROUND(COUNT(*) * 100.0 / 2524, 1) AS porcentaje_cancelados
FROM pedidos
WHERE estado = 'cancelado';`,
      consejo: "Escribe `100.0`, con decimal. Si divides dos números enteros, PostgreSQL hace una división entera y tira los decimales: `212 * 100 / 2524` da `8`, no `8,4`. Es un error clásico en los informes de porcentajes."
    },
    {
      tipo: "caso",
      de: "elena",
      enunciado: "Vamos por partes: dónde hay reembolsos, cuánto pesan en cada tienda y desde cuándo. Cada resultado se abre en la pestaña Gráfico; si prefieres ver la tabla, pasa a Resultado.",
      grafico: true,
      partes: [
        {
          enunciado: "Cuenta los **reembolsos de cada tienda**: solo los pedidos con `estado = 'reembolsado'`, agrupados por tienda. Columnas `tienda_id` y `reembolsos`, ordenadas por `tienda_id`.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas tienda_id y reembolsos", prueba: (r) => PRUEBA.columnas(r, ["tienda_id", "reembolsos"]) },
            { texto: "Hay una fila por cada tienda con reembolsos (5)", prueba: (r) => (r?.filas?.length ?? 0) === 5 },
            { texto: "Solo cuenta los pedidos reembolsados, ordenados por tienda", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT tienda_id, COUNT(*) AS reembolsos
FROM pedidos
WHERE estado = 'reembolsado'
GROUP BY tienda_id
ORDER BY tienda_id;`) }
          ],
          pistas: [
            "El estado se mira en cada pedido, antes de agrupar: va en el `WHERE`. Luego `GROUP BY tienda_id` y `COUNT(*)`.",
            "SELECT tienda_id, COUNT(*) AS reembolsos FROM pedidos WHERE estado = 'reembolsado' GROUP BY tienda_id ORDER BY tienda_id;"
          ],
          solucion: `SELECT tienda_id, COUNT(*) AS reembolsos
FROM pedidos
WHERE estado = 'reembolsado'
GROUP BY tienda_id
ORDER BY tienda_id;`
        },
        {
          enunciado: "La online destaca, pero también es la que más vende. Para comparar necesitas el tamaño de cada tienda: cuenta **todos los pedidos** de cada una. Columnas `tienda_id` y `pedidos`, ordenadas por `tienda_id`.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas tienda_id y pedidos", prueba: (r) => PRUEBA.columnas(r, ["tienda_id", "pedidos"]) },
            { texto: "Hay una fila por cada tienda con pedidos (5)", prueba: (r) => (r?.filas?.length ?? 0) === 5 },
            { texto: "Cuenta todos los pedidos de cada tienda, ordenados por tienda", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT tienda_id, COUNT(*) AS pedidos
FROM pedidos
GROUP BY tienda_id
ORDER BY tienda_id;`) }
          ],
          pistas: [
            "Ahora sin `WHERE`: todos los pedidos, agrupados por tienda.",
            "SELECT tienda_id, COUNT(*) AS pedidos FROM pedidos GROUP BY tienda_id ORDER BY tienda_id;"
          ],
          solucion: `SELECT tienda_id, COUNT(*) AS pedidos
FROM pedidos
GROUP BY tienda_id
ORDER BY tienda_id;`
        },
        {
          tipo: "interpretar",
          pregunta: "Con las dos tablas anteriores: ¿qué **porcentaje** de los pedidos de la tienda online (`tienda_id` 5) acaba reembolsado? Redondea a un decimal y escribe solo el número.",
          respuesta: 6.7,
          tolerancia: 0.05,
          pistas: [
            "Divide los reembolsos de la tienda 5 entre sus pedidos y multiplica por 100. Puedes hacerlo con una calculadora o en el editor.",
            "103 reembolsos de 1 527 pedidos: SELECT ROUND(103 * 100.0 / 1527, 1); da 6,7."
          ],
          solucion: `SELECT ROUND(COUNT(*) * 100.0 / 1527, 1) AS porcentaje_reembolsos
FROM pedidos
WHERE tienda_id = 5
  AND estado = 'reembolsado';`
        },
        {
          tipo: "interpretar",
          pregunta: "Ahora las tiendas físicas **juntas** (todas menos la 5; Barcelona aún no tiene pedidos): suma sus reembolsos y sus pedidos de las tablas anteriores. ¿Qué porcentaje se reembolsa? Redondea a un decimal y escribe solo el número.",
          respuesta: 2.0,
          tolerancia: 0.05,
          pistas: [
            "Suma los reembolsos de las tiendas 1 a 4, súmalos también en pedidos, divide y multiplica por 100.",
            "7 + 2 + 6 + 5 = 20 reembolsos de 429 + 187 + 225 + 156 = 997 pedidos: 20 * 100.0 / 997 da 2,0."
          ],
          solucion: `SELECT ROUND(COUNT(*) * 100.0 / 997, 1) AS porcentaje_reembolsos
FROM pedidos
WHERE tienda_id <> 5
  AND estado = 'reembolsado';`
        },
        {
          enunciado: "La online reembolsa más del triple que las físicas. ¿Desde cuándo? Cuenta los **reembolsos de la tienda online por mes**: pedidos con `tienda_id = 5` y `estado = 'reembolsado'`. Columnas `mes` y `reembolsos`, ordenadas por `mes`. Mira la línea en el gráfico (y ojo: un mes sin ningún reembolso no aparece, porque no tiene filas que agrupar).",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas mes y reembolsos", prueba: (r) => PRUEBA.columnas(r, ["mes", "reembolsos"]) },
            { texto: "Está ordenado por mes", prueba: (r) => (r?.filas?.length ?? 0) > 0 && PRUEBA.ordenado(r, "mes", "asc") },
            { texto: "Solo cuenta los reembolsos de la tienda online, un grupo por mes", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT mes, COUNT(*) AS reembolsos
FROM pedidos
WHERE tienda_id = 5
  AND estado = 'reembolsado'
GROUP BY mes
ORDER BY mes;`) }
          ],
          pistas: [
            "Dos condiciones en el `WHERE`, unidas con `AND`. Después, `GROUP BY mes` y `ORDER BY mes`.",
            "SELECT mes, COUNT(*) AS reembolsos FROM pedidos WHERE tienda_id = 5 AND estado = 'reembolsado' GROUP BY mes ORDER BY mes;"
          ],
          solucion: `SELECT mes, COUNT(*) AS reembolsos
FROM pedidos
WHERE tienda_id = 5
  AND estado = 'reembolsado'
GROUP BY mes
ORDER BY mes;`
        },
        {
          tipo: "interpretar",
          pregunta: "¿En qué **mes** hubo más reembolsos online? Escríbelo como aparece en la columna `mes` (por ejemplo, `2025-03`).",
          respuesta: ["2026-08", "2026/08", "08/2026", "2026-8", "agosto", "agosto 2026", "agosto de 2026"],
          pistas: [
            "Busca el pico de la línea en el gráfico, u ordena la consulta anterior por `reembolsos DESC`.",
            "El pico es agosto de 2026, con 19 reembolsos: escribe 2026-08."
          ],
          solucion: `SELECT mes, COUNT(*) AS reembolsos
FROM pedidos
WHERE tienda_id = 5
  AND estado = 'reembolsado'
GROUP BY mes
ORDER BY reembolsos DESC
LIMIT 1;`
        }
      ],
      expediente: {
        id: "reembolsos-disparados",
        titulo: "Reembolsos disparados",
        texto: "No es cosa de todas las tiendas. Las tiendas físicas juntas reembolsan un **2,0 %** de sus pedidos (20 de 997). La tienda online, un **6,7 %** (103 de 1 527): **más del triple**.\nY no siempre fue así. Hasta enero de 2026, la online tenía como mucho 4 reembolsos al mes; en febrero, ninguno. Desde **marzo de 2026** se disparan, con el máximo en **agosto: 19**, el mismo mes del pedido que Iratxe Muñoz no reconoce.\nLos clientes de Getafe empezaron a darse de alta justo en marzo. ¿Casualidad? ¿Y adónde ha ido a parar el dinero de todos esos reembolsos?"
      }
    }
  ]
});
