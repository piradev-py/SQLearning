CURSO.registrar({
  id: "e2-02",
  titulo: "Comparar: mayor, menor, distinto",
  xp: 30,
  objetivo: "Sabrás filtrar con mayor que, menor que y distinto de, sobre números, textos y fechas.",
  pasos: [
    {
      tipo: "historia",
      de: "marcos",
      asunto: "Me han llamado del banco",
      texto: "Ayer me llamó el banco: quieren que confirmemos por teléfono los pedidos **grandes**, por si alguno es un cargo que el cliente no reconoce.\nCon `=` solo sé buscar un importe exacto, y no voy a ir probando de euro en euro. Necesito algo como «todo lo que pase de tanto»."
    },
    {
      tipo: "explicacion",
      titulo: "Mayor, menor y compañía",
      texto: "Además de `=`, en `WHERE` puedes comparar con:\n- `>` mayor que · `<` menor que\n- `>=` mayor o igual · `<=` menor o igual\n- `<>` distinto de (también vale `!=`)\nEl ejemplo muestra los pedidos de **1 500 € o más**, del más caro al más barato. Fíjate: los números se escriben sin separador de miles y con **punto** para los decimales (`1500`, `99.90`).",
      ejemplo: `SELECT id, fecha, total
FROM pedidos
WHERE total >= 1500
ORDER BY total DESC;`,
      consejo: "`<>` es el «distinto» del estándar SQL; `!=` lo entienden casi todos los motores. Elige uno y úsalo siempre igual en tus consultas."
    },
    {
      tipo: "quiz",
      pregunta: "Un pedido cuesta exactamente **1 000 €**. ¿Aparece si filtras con `WHERE total > 1000`?",
      opciones: [
        "Sí, porque 1 000 está en el límite",
        "No: `>` es «estrictamente mayor»; para incluirlo hace falta `>=`",
        "Depende del método de pago"
      ],
      correcta: 1,
      explicacion: "`>` deja fuera el propio límite. «Más de 1 000» y «1 000 o más» son preguntas distintas: cuando te pidan un listado, aclara si el límite entra."
    },
    {
      tipo: "ejercicio",
      enunciado: "Para un estudio de métodos de pago, muestra `id`, `metodo_pago` y `total` de los pedidos que **no** se pagaron con `tarjeta`.",
      solucion: `SELECT id, metodo_pago, total
FROM pedidos
WHERE metodo_pago <> 'tarjeta';`,
      pistas: [
        "«Distinto de» se escribe `<>` (o `!=`). El texto, entre comillas simples.",
        "SELECT id, metodo_pago, total FROM pedidos WHERE metodo_pago <> 'tarjeta';"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Comparar fechas (y textos)",
      texto: "Las fechas también se comparan: «mayor» significa **más reciente**. Se escriben entre comillas simples con el formato `'AAAA-MM-DD'`: `WHERE fecha >= '2026-09-01'`.\nOjo: `fecha` es un **timestamp** (fecha **y hora**). `'2026-09-01'` equivale al 1 de septiembre **a las 00:00**, así que `>=` incluye ese día entero.\nLos textos se comparan por orden alfabético (`nombre < 'C'`), con la misma regla de antes: las letras con tilde van detrás de la «z».",
      ejemplo: `SELECT id, fecha, total
FROM pedidos
WHERE fecha >= '2026-09-01'
ORDER BY fecha;`,
      consejo: "Escribe siempre las fechas como `'2026-09-01'` (año, mes, día). `'01/09/2026'` puede leerse como 1 de septiembre o como 9 de enero según la configuración del servidor.",
      otrosMotores: "El formato `'AAAA-MM-DD'` lo entienden PostgreSQL, MySQL, SQL Server y BigQuery. En Oracle se suele escribir `DATE '2026-09-01'` (esa forma también vale en PostgreSQL)."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT id, fecha, total
FROM pedidos
WHERE fecha < '2024-01-02'
ORDER BY fecha;`,
      pregunta: "Los pedidos empiezan en enero de 2024. ¿Qué devolverá esta consulta?",
      opciones: [
        "Los pedidos del 1 de enero de 2024",
        "Los pedidos del 1 y del 2 de enero de 2024",
        "Un error: no se puede comparar una fecha con un texto"
      ],
      correcta: 0,
      explicacion: "`'2024-01-02'` es el 2 de enero a las 00:00. «Menor que» eso son los pedidos anteriores a esa medianoche: los del día 1, a cualquier hora. PostgreSQL convierte el texto entre comillas en fecha sin quejarse."
    },
    {
      tipo: "ejercicio",
      enunciado: "Marcos quiere repasar el primer mes de pedidos de la tabla. Muestra `id`, `fecha` y `total` de los pedidos con `fecha` **anterior al 1 de febrero de 2024**, ordenados por `fecha` (del más antiguo al más reciente).",
      solucion: `SELECT id, fecha, total
FROM pedidos
WHERE fecha < '2024-02-01'
ORDER BY fecha;`,
      pistas: [
        "«Anterior a» es `<`. La fecha va entre comillas simples con el formato `'AAAA-MM-DD'`. Después, `ORDER BY fecha`.",
        "SELECT id, fecha, total FROM pedidos WHERE fecha < '2024-02-01' ORDER BY fecha;"
      ]
    },
    {
      tipo: "interpretar",
      pregunta: "¿Cuál es el `id` del **primer pedido de 2026** (el más antiguo con fecha del 1 de enero de 2026 o posterior)?",
      respuesta: 1349,
      tolerancia: 0,
      pistas: [
        "Filtra con `fecha >= '2026-01-01'`, ordena por `fecha` de más antigua a más reciente y quédate con la primera fila.",
        "SELECT id, fecha FROM pedidos WHERE fecha >= '2026-01-01' ORDER BY fecha LIMIT 1;"
      ],
      solucion: `SELECT id
FROM pedidos
WHERE fecha >= '2026-01-01'
ORDER BY fecha, id
LIMIT 1;`
    },
    {
      tipo: "reto",
      de: "hector",
      enunciado: "¡Hola! Me ha dicho Marcos que estás con los pedidos grandes. En logística los de **más de 1 000 €** los enviamos con seguro, así que me viene genial la misma lista.\nPásame `id`, `fecha` y `total` de los pedidos con `total` **mayor que 1000**, del **más caro al más barato** y, a igual total, por `id` de menor a mayor.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas id, fecha y total", prueba: (r) => PRUEBA.columnas(r, ["id", "fecha", "total"]) },
        { texto: "Todos los pedidos superan los 1 000 €", prueba: (r) => { const i = (r?.columnas ?? []).findIndex(c => String(c).toLowerCase() === "total"); return i >= 0 && (r?.filas?.length ?? 0) > 0 && r.filas.every(f => Number(f[i]) > 1000); } },
        { texto: "Van del más caro al más barato", prueba: (r) => (r?.filas?.length ?? 0) > 0 && PRUEBA.ordenado(r, "total", "desc") },
        { texto: "Están todos los pedidos de más de 1 000 €, en el orden pedido", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT id, fecha, total
FROM pedidos
WHERE total > 1000
ORDER BY total DESC, id;`) }
      ],
      pistas: [
        "Filtra con `WHERE total > 1000` (sin comillas: es un número) y ordena por dos columnas: `total DESC` y después `id`.",
        "SELECT id, fecha, total FROM pedidos WHERE total > 1000 ORDER BY total DESC, id;"
      ],
      solucion: `SELECT id, fecha, total
FROM pedidos
WHERE total > 1000
ORDER BY total DESC, id;`
    }
  ]
});
