CURSO.registrar({
  id: "e2-06",
  titulo: "Rangos y fechas: BETWEEN",
  xp: 35,
  objetivo: "Sabrás filtrar valores que caen dentro de un rango (precios, cantidades, fechas) sin caer en la trampa de las horas.",
  pasos: [
    {
      tipo: "historia",
      de: "marcos",
      asunto: "La quincena de las llamadas",
      texto: "Del 1 al 15 de agosto el teléfono no paró de sonar, y dirección quiere que revisemos **todos los pedidos de esa quincena**.\nYo voy buscándolos día a día y no acabo nunca. ¿No hay forma de pedir «todo lo que esté entre esta fecha y esta otra» de una sola vez?"
    },
    {
      tipo: "explicacion",
      titulo: "BETWEEN: entre un valor y otro",
      texto: "`WHERE precio BETWEEN 119 AND 159` se lee «precio entre 119 y 159». Es un atajo de `precio >= 119 AND precio <= 159`: **incluye los dos extremos**.\nFíjate en el resultado: salen los productos que cuestan 119 € y 159 € justos.\nPara lo contrario existe `NOT BETWEEN`: todo lo que queda **fuera** del rango.",
      ejemplo: `SELECT nombre, precio
FROM productos
WHERE precio BETWEEN 119 AND 159
ORDER BY precio;`,
      consejo: "Escribe siempre primero el valor **pequeño** y después el grande. `BETWEEN` no le da la vuelta por ti."
    },
    {
      tipo: "ejercicio",
      enunciado: "Muestra `nombre` y `stock` de los productos con un stock **entre 20 y 50 unidades, ambos incluidos**. Ordénalos por `stock` de menor a mayor y, a igual stock, por `nombre`.",
      solucion: `SELECT nombre, stock
FROM productos
WHERE stock BETWEEN 20 AND 50
ORDER BY stock, nombre;`,
      pistas: [
        "Usa `WHERE stock BETWEEN … AND …` con el número pequeño primero.",
        "SELECT nombre, stock FROM productos WHERE stock BETWEEN 20 AND 50 ORDER BY stock, nombre;"
      ]
    },
    {
      tipo: "quiz",
      pregunta: "¿Qué devuelve `WHERE precio BETWEEN 200 AND 100`?",
      opciones: [
        "Los productos que cuestan entre 100 y 200 €",
        "Ninguna fila",
        "Un error"
      ],
      correcta: 1,
      explicacion: "Equivale a `precio >= 200 AND precio <= 100`, y ningún precio cumple las dos cosas a la vez. No da error: simplemente no sale nada. Por eso el valor pequeño va primero."
    },
    {
      tipo: "explicacion",
      titulo: "Rangos de fechas… y una trampa",
      texto: "`BETWEEN` también sirve con fechas. Pero ojo: la columna `fecha` de `pedidos` guarda **fecha y hora** (`timestamp`).\nCuando escribes `'2026-08-15'` sin hora, PostgreSQL entiende **el 15 de agosto a las 00:00:00**. Así que este `BETWEEN` acaba justo al empezar el día 15.\nMira los pedidos más recientes del resultado: ¿ves alguno del día 15?",
      ejemplo: `SELECT id, fecha, total
FROM pedidos
WHERE fecha BETWEEN '2026-08-01' AND '2026-08-15'
ORDER BY fecha DESC
LIMIT 5;`
    },
    {
      tipo: "prediccion",
      consulta: `SELECT id, fecha
FROM pedidos
WHERE fecha BETWEEN '2026-08-15' AND '2026-08-15';`,
      pregunta: "El 15 de agosto de 2026 hubo dos pedidos (el 2216 a las 10:16 y el 2217 a las 14:06). ¿Qué devolverá esta consulta?",
      opciones: [
        "Los pedidos 2216 y 2217",
        "Ninguna fila",
        "Un error"
      ],
      correcta: 1,
      explicacion: "Los dos extremos son el mismo instante: el 15 de agosto a las 00:00:00. Solo saldría un pedido hecho justo a medianoche en punto, y no hay ninguno. Las 10:16 y las 14:06 quedan fuera."
    },
    {
      tipo: "explicacion",
      titulo: "La forma segura: desde el día, hasta antes del siguiente",
      texto: "Para quedarte con días **completos** en una columna con hora, usa `>=` para el primer día y `<` para **el día siguiente** al último:\n`fecha >= '2026-08-15' AND fecha < '2026-08-16'` → todo el día 15, desde las 00:00:00 hasta el último segundo.\nAsí no importa la hora que tenga cada pedido. En el ejemplo, ahora sí aparecen el 2216 y el 2217.",
      ejemplo: `SELECT id, fecha, total
FROM pedidos
WHERE fecha >= '2026-08-15' AND fecha < '2026-08-16'
ORDER BY fecha;`,
      consejo: "Es uno de los errores más repetidos en informes reales: «faltan las ventas del último día». Con columnas de fecha y hora, usa siempre `>=` inicio y `<` día siguiente. `BETWEEN` déjalo para números o columnas que solo guardan la fecha.",
      otrosMotores: "`BETWEEN` funciona igual en MySQL, SQL Server, Oracle y BigQuery. Lo que cambia es cómo escribir la fecha: en Oracle conviene `DATE '2026-08-15'`, y en BigQuery, si la columna es `TIMESTAMP`, `TIMESTAMP '2026-08-15'`."
    },
    {
      tipo: "reto",
      de: "marcos",
      enunciado: "Pásame los pedidos de la **primera quincena de agosto de 2026**: del día 1 al 15, **ambos completos** (el 15 hasta las 23:59). Quiero las columnas `id`, `fecha`, `tienda_id`, `estado` y `total`, ordenados por `fecha` de más antiguo a más reciente.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas id, fecha, tienda_id, estado y total", prueba: (r) => PRUEBA.columnas(r, ["id", "fecha", "tienda_id", "estado", "total"]) },
        { texto: "Incluye los dos pedidos del día 15 (2216 y 2217)", prueba: (r) => PRUEBA.contiene(r, "id", 2216) && PRUEBA.contiene(r, "id", 2217) },
        { texto: "Son exactamente los pedidos del 1 al 15 de agosto, ordenados por fecha", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT id, fecha, tienda_id, estado, total
FROM pedidos
WHERE fecha >= '2026-08-01' AND fecha < '2026-08-16'
ORDER BY fecha;`) }
      ],
      pistas: [
        "Con `BETWEEN '2026-08-01' AND '2026-08-15'` perderías el día 15. Usa `>=` para el día 1 y `<` para el día 16.",
        "SELECT id, fecha, tienda_id, estado, total FROM pedidos WHERE fecha >= '2026-08-01' AND fecha < '2026-08-16' ORDER BY fecha;"
      ],
      solucion: `SELECT id, fecha, tienda_id, estado, total
FROM pedidos
WHERE fecha >= '2026-08-01' AND fecha < '2026-08-16'
ORDER BY fecha;`
    }
  ]
});
