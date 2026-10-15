CURSO.registrar({
  id: "e2-03",
  titulo: "Combinar condiciones: AND, OR, NOT",
  xp: 30,
  objetivo: "Sabrás filtrar con varias condiciones a la vez usando AND, OR y NOT.",
  pasos: [
    {
      tipo: "historia",
      de: "marcos",
      asunto: "Una condición se me queda corta",
      texto: "Lo de filtrar me está salvando la semana. Pero las preguntas que me llegan casi nunca tienen **una** sola condición: «los socios **de Madrid**», «los pedidos online **que se cancelaron**», «lo que **no** se entregó»…\nSi pongo un filtro, me sobran filas; si pongo el otro, también. ¿Se pueden poner **los dos a la vez**?"
    },
    {
      tipo: "explicacion",
      titulo: "AND: se tienen que cumplir todas",
      texto: "**AND** une dos condiciones y la fila solo pasa si se cumplen **las dos** (el «Y» de la lógica: con un falso, fuera).\nEl ejemplo busca pedidos que estén en camino **y** que además cuesten más de 1 000 €.\nPuedes encadenar tantos `AND` como necesites: `… AND … AND …`.",
      ejemplo: `SELECT id, fecha, estado, total
FROM pedidos
WHERE estado = 'en camino'
  AND total > 1000;`,
      consejo: "Pon cada condición en su propia línea, con el `AND` delante y sangrado. Así puedes «apagar» una condición con `--` mientras pruebas, sin romper el resto."
    },
    {
      tipo: "explicacion",
      titulo: "Columnas de sí o no",
      texto: "La columna `socio` de `clientes` es de tipo **boolean**: solo guarda `TRUE` (verdadero) o `FALSE` (falso). Se escriben **sin comillas**.\nPuedes filtrar con `socio = TRUE`, o directamente con `WHERE socio`, porque la columna ya es un verdadero o falso.",
      ejemplo: `SELECT nombre, ciudad, socio
FROM clientes
WHERE ciudad = 'Valencia'
  AND socio = TRUE;`
    },
    {
      tipo: "ejercicio",
      enunciado: "Marcos va a llamar a los socios de Madrid para una encuesta. Muestra `nombre` y `email` de los clientes cuya `ciudad` es `Madrid` **y** que son socios (`socio` verdadero).",
      solucion: `SELECT nombre, email
FROM clientes
WHERE ciudad = 'Madrid'
  AND socio = TRUE;`,
      pistas: [
        "Dos condiciones unidas con `AND`: una para la ciudad (texto entre comillas simples) y otra para `socio`.",
        "SELECT nombre, email FROM clientes WHERE ciudad = 'Madrid' AND socio = TRUE;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "OR: basta con que se cumpla una",
      texto: "**OR** deja pasar la fila si se cumple **al menos una** de las condiciones (o las dos).\nEl ejemplo saca los pedidos pagados con bizum **o** con transferencia. Hay 502 de bizum y 149 por transferencia: el resultado tiene los 651.\nCuidado con el lenguaje del día a día: «los de bizum y los de transferencia» se escribe con **OR**. Cada pedido tiene un solo método de pago, así que ninguno es de bizum **y** de transferencia a la vez.",
      ejemplo: `SELECT id, metodo_pago, total
FROM pedidos
WHERE metodo_pago = 'bizum'
  OR metodo_pago = 'transferencia';`
    },
    {
      tipo: "prediccion",
      consulta: `SELECT id, metodo_pago, total
FROM pedidos
WHERE metodo_pago = 'bizum'
  AND metodo_pago = 'transferencia';`,
      pregunta: "Alguien pidió «los pedidos de bizum y de transferencia» y lo tradujo así, con `AND`. ¿Qué devolverá?",
      opciones: [
        "Los 651 pedidos de bizum y de transferencia",
        "Solo los 149 de transferencia",
        "Ninguna fila"
      ],
      correcta: 2,
      explicacion: "Con `AND` la fila tiene que cumplir las dos condiciones a la vez, y la columna `metodo_pago` no puede valer `bizum` y `transferencia` al mismo tiempo. Ninguna fila pasa. Lo que se quería era `OR`."
    },
    {
      tipo: "ejercicio",
      enunciado: "Marcos revisa las reclamaciones por desperfectos. Muestra `id`, `fecha` y `motivo` de las reclamaciones cuyo `motivo` es `Caja dañada` **o** `Producto defectuoso` (escritos exactamente así).",
      solucion: `SELECT id, fecha, motivo
FROM reclamaciones
WHERE motivo = 'Caja dañada'
  OR motivo = 'Producto defectuoso';`,
      pistas: [
        "Dos igualdades sobre la misma columna `motivo`, unidas con `OR`. Respeta mayúsculas y tildes.",
        "SELECT id, fecha, motivo FROM reclamaciones WHERE motivo = 'Caja dañada' OR motivo = 'Producto defectuoso';"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "NOT: darle la vuelta",
      texto: "**NOT** delante de una condición la invierte: lo verdadero pasa a falso y al revés.\n`NOT estado = 'entregado'` es lo mismo que `estado <> 'entregado'`. Con columnas de sí o no se lee muy natural: `WHERE NOT socio` → los que **no** son socios.\nEl ejemplo busca los clientes de Bilbao que todavía **no** son socios, candidatos a una campaña.",
      ejemplo: `SELECT nombre, email
FROM clientes
WHERE ciudad = 'Bilbao'
  AND NOT socio;`,
      consejo: "Para «distinto de» casi siempre se lee mejor `<>` que `NOT … =`. `NOT` brilla con columnas boolean y, como verás pronto, delante de un paréntesis o de una lista."
    },
    {
      tipo: "quiz",
      pregunta: "Quieres los pedidos que **ni** se entregaron **ni** están en camino. ¿Qué condición es la correcta?",
      opciones: [
        "`estado <> 'entregado' OR estado <> 'en camino'`",
        "`estado <> 'entregado' AND estado <> 'en camino'`",
        "`estado = 'entregado' AND estado = 'en camino'`"
      ],
      correcta: 1,
      explicacion: "«Ni A ni B» = «no es A **y** no es B». Con `OR`, un pedido entregado pasaría igual (no está en camino, así que la segunda parte es verdadera): saldrían todos. La tercera no la cumple ninguno."
    },
    {
      tipo: "reto",
      de: "marcos",
      enunciado: "El responsable de la tienda online quiere repasar los pedidos que acabaron mal en **junio de 2025**. Necesito `id`, `fecha`, `estado` y `total` de los pedidos de la **tienda online** (`tienda_id = 5`) con `fecha` desde el **1 de junio de 2025** (incluido) y anterior al **1 de julio de 2025**, cuyo `estado` **no** sea `entregado` **y tampoco** sea `en camino` (así quedan los cancelados y los reembolsados). Ordénalos por `fecha`, del más antiguo al más reciente.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas id, fecha, estado y total", prueba: (r) => PRUEBA.columnas(r, ["id", "fecha", "estado", "total"]) },
        { texto: "Ningún pedido entregado ni en camino", prueba: (r) => { const i = (r?.columnas ?? []).findIndex(c => String(c).toLowerCase() === "estado"); return i >= 0 && (r?.filas?.length ?? 0) > 0 && r.filas.every(f => f[i] === "cancelado" || f[i] === "reembolsado"); } },
        { texto: "Van del más antiguo al más reciente", prueba: (r) => (r?.filas?.length ?? 0) > 0 && PRUEBA.ordenado(r, "fecha", "asc") },
        { texto: "Son justo los pedidos online de junio de 2025 que acabaron mal", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT id, fecha, estado, total
FROM pedidos
WHERE tienda_id = 5
  AND fecha >= '2025-06-01'
  AND fecha < '2025-07-01'
  AND estado <> 'entregado'
  AND estado <> 'en camino'
ORDER BY fecha;`) }
      ],
      pistas: [
        "Son cinco condiciones y todas tienen que cumplirse: únelas con `AND`. Para las fechas, `>=` el 1 de junio y `<` el 1 de julio. Para el estado, piensa en el «ni… ni…» del quiz.",
        "SELECT id, fecha, estado, total FROM pedidos WHERE tienda_id = 5 AND fecha >= '2025-06-01' AND fecha < '2025-07-01' AND estado <> 'entregado' AND estado <> 'en camino' ORDER BY fecha;"
      ],
      solucion: `SELECT id, fecha, estado, total
FROM pedidos
WHERE tienda_id = 5
  AND fecha >= '2025-06-01'
  AND fecha < '2025-07-01'
  AND estado <> 'entregado'
  AND estado <> 'en camino'
ORDER BY fecha;`
    }
  ]
});
