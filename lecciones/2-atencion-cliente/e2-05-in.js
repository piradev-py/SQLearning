CURSO.registrar({
  id: "e2-05",
  titulo: "Listas: IN y NOT IN",
  xp: 30,
  objetivo: "Sabrás filtrar por una lista de valores con IN y excluir una lista con NOT IN.",
  pasos: [
    {
      tipo: "historia",
      de: "marcos",
      asunto: "Demasiados OR",
      texto: "Esta mañana tenía tres tickets abiertos, de los clientes 1, 10 y 25, y he escrito `id = 1 OR id = 10 OR id = 25`. Funciona, pero el lunes me llegan quince y no pienso escribir quince `OR`.\nY Elena me ha avisado de que también te va a pedir algo con «estos métodos de pago, pero no en esta tienda». ¿Hay algo más corto?"
    },
    {
      tipo: "explicacion",
      titulo: "IN: ¿está en la lista?",
      texto: "**IN** comprueba si el valor de la columna está en una **lista**, escrita entre paréntesis y separada por comas:\n`WHERE id IN (1, 10, 25)`\nEs exactamente lo mismo que `id = 1 OR id = 10 OR id = 25`, pero más corto y más fácil de leer. Funciona con números, textos (entre comillas simples) y fechas.\nEl ejemplo muestra los clientes de tres ciudades a la vez.",
      ejemplo: `SELECT nombre, ciudad
FROM clientes
WHERE ciudad IN ('Barcelona', 'Zaragoza', 'Málaga');`,
      consejo: "En el trabajo, las listas de `IN` suelen venir de otra persona (un Excel con ids, un correo con ciudades). Revísalas antes de pegarlas: una coma de menos o una comilla sin cerrar y la consulta falla."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT nombre, ciudad
FROM clientes
WHERE ciudad IN ('Barcelona', 'Zaragoza', 'Málaga');`,
      pregunta: "Faro tiene 21 clientes de Barcelona, 18 de Zaragoza y 17 de Málaga. ¿Cuántas filas devolverá?",
      opciones: ["3", "56", "Ninguna: cada cliente es de una sola ciudad"],
      correcta: 1,
      explicacion: "`IN` es un `OR` disfrazado: pasa cualquier cliente que sea de alguna de las tres ciudades. 21 + 18 + 17 = 56. No devuelve una fila por ciudad, sino una por cliente."
    },
    {
      tipo: "ejercicio",
      enunciado: "Los tickets de Marcos. Muestra `id`, `nombre`, `telefono` y `ciudad` de los clientes con `id` **1, 10 o 25**, usando `IN`.",
      solucion: `SELECT id, nombre, telefono, ciudad
FROM clientes
WHERE id IN (1, 10, 25);`,
      pistas: [
        "Los ids son números: van sin comillas, separados por comas y dentro de paréntesis.",
        "SELECT id, nombre, telefono, ciudad FROM clientes WHERE id IN (1, 10, 25);"
      ]
    },
    {
      tipo: "quiz",
      pregunta: "¿Cuál de estas condiciones equivale a `estado IN ('cancelado', 'reembolsado')`?",
      opciones: [
        "`estado = 'cancelado' AND estado = 'reembolsado'`",
        "`estado = 'cancelado' OR estado = 'reembolsado'`",
        "`estado = 'cancelado, reembolsado'`"
      ],
      correcta: 1,
      explicacion: "`IN` equivale a una cadena de `OR`. La primera no la cumple ningún pedido (no puede tener dos estados) y la tercera busca un estado que se llame literalmente «cancelado, reembolsado»."
    },
    {
      tipo: "explicacion",
      titulo: "NOT IN: todo menos la lista",
      texto: "**NOT IN** hace lo contrario: deja pasar las filas cuyo valor **no** está en la lista.\n`WHERE estado NOT IN ('entregado', 'en camino')` equivale a `estado <> 'entregado' AND estado <> 'en camino'`: el «ni… ni…» del nivel anterior, en una línea.\nEn el ejemplo, los pedidos que acabaron mal: cancelados (212) y reembolsados (123).",
      ejemplo: `SELECT id, estado, total
FROM pedidos
WHERE estado NOT IN ('entregado', 'en camino')
ORDER BY id;`,
      consejo: "`NOT IN` tiene una trampa con las celdas vacías (como la `ciudad` de algunos clientes): la verás en el nivel del vacío. De momento, úsalo con columnas que siempre están rellenas, como `estado`, `metodo_pago` o `tienda_id`."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT id, metodo_pago, total
FROM pedidos
WHERE metodo_pago NOT IN ('tarjeta', 'bizum');`,
      pregunta: "Hay 1 652 pedidos con tarjeta, 502 con bizum, 221 en efectivo y 149 por transferencia. ¿Cuántas filas devolverá?",
      opciones: ["2 154", "370", "Ninguna"],
      correcta: 1,
      explicacion: "Se quedan fuera los de tarjeta y bizum; pasan los de efectivo y transferencia: 221 + 149 = 370. (2 154 es justo lo que se excluye.)"
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "Lo que te anunciaba Marcos: quiero ver qué tal funcionan los pagos con **bizum** y **transferencia** en las **tiendas físicas**, es decir, en todas menos la online (`tienda_id` 5).\nPásame `id`, `tienda_id`, `metodo_pago` y `total` de esos pedidos, ordenados por `id` de menor a mayor.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas id, tienda_id, metodo_pago y total", prueba: (r) => PRUEBA.columnas(r, ["id", "tienda_id", "metodo_pago", "total"]) },
        { texto: "Solo bizum o transferencia, y ninguno de la tienda online", prueba: (r) => { const c = (r?.columnas ?? []).map(x => String(x).toLowerCase()); const m = c.indexOf("metodo_pago"), t = c.indexOf("tienda_id"); return m >= 0 && t >= 0 && (r?.filas?.length ?? 0) > 0 && r.filas.every(f => (f[m] === "bizum" || f[m] === "transferencia") && Number(f[t]) !== 5); } },
        { texto: "Ordenados por id de menor a mayor", prueba: (r) => (r?.filas?.length ?? 0) > 0 && PRUEBA.ordenado(r, "id", "asc") },
        { texto: "Están todos los pedidos que se piden", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT id, tienda_id, metodo_pago, total
FROM pedidos
WHERE metodo_pago IN ('bizum', 'transferencia')
  AND tienda_id NOT IN (5)
ORDER BY id;`) }
      ],
      pistas: [
        "Dos condiciones unidas con `AND`: una con `IN` para los métodos de pago y otra que deje fuera la tienda 5 (`NOT IN (5)` o `<> 5`).",
        "SELECT id, tienda_id, metodo_pago, total FROM pedidos WHERE metodo_pago IN ('bizum', 'transferencia') AND tienda_id NOT IN (5) ORDER BY id;"
      ],
      solucion: `SELECT id, tienda_id, metodo_pago, total
FROM pedidos
WHERE metodo_pago IN ('bizum', 'transferencia')
  AND tienda_id NOT IN (5)
ORDER BY id;`
    }
  ]
});
