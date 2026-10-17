CURSO.registrar({
  id: "e8-04",
  titulo: "Embudos: dónde se pierden las ventas",
  xp: 45,
  objetivo: "Sabrás construir un embudo de conversión con las sesiones de la web: cuántas sesiones llegan a cada paso, qué parte pasa de un paso al siguiente, dónde está la mayor caída y cómo cambia según el dispositivo.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "Muchas visitas, pocas compras",
      texto: "El equipo web presume de visitas, pero las ventas online no crecen al mismo ritmo. Desde abril la web guarda cada paso que da la gente: entra, mira productos, mete algo en el carrito, va a pagar, compra.\nQuiero saber **dónde se cae la gente**. Si es en el pago, es un problema técnico; si es mirando productos, es de catálogo. No es lo mismo y no lo arregla el mismo equipo."
    },
    {
      tipo: "explicacion",
      titulo: "Sesiones y eventos",
      texto: "Dos tablas nuevas (míralas en la pestaña Esquema):\n- `sesiones_web`: cada visita a la web. `inicio`, `cliente_id` (`NULL` si no inició sesión), `dispositivo` (`'movil'` u `'ordenador'`) y `variante` (de momento, ignórala).\n- `eventos_web`: cada paso dentro de una sesión. `sesion_id`, `momento`, `evento` (`visita`, `producto`, `carrito`, `pago`, `compra`) y `pedido_id`, solo en las compras.\nUn **embudo** son esos pasos en orden. Cada sesión llega hasta un paso y tiene todos los anteriores. El ejemplo enseña los eventos de una sesión que acabó en compra: ojo, mira **varios productos**.",
      ejemplo: `SELECT sesion_id, momento, evento, pedido_id
FROM eventos_web
WHERE sesion_id = (
  SELECT MIN(sesion_id)
  FROM eventos_web
  WHERE evento = 'compra'
)
ORDER BY momento;`
    },
    {
      tipo: "explicacion",
      titulo: "Contar sesiones en cada paso",
      texto: "El embudo cuenta **sesiones** que llegan a cada paso, no eventos: una sesión que mira cuatro productos ha llegado **una vez** al paso «producto».\nPor eso cada columna es `COUNT(DISTINCT sesion_id) FILTER (WHERE evento = '…')`. Con `FILTER`, los cinco pasos salen en una sola fila.\nEl ejemplo es el embudo de todo el periodo, de abril a mediados de octubre.",
      ejemplo: `SELECT
  COUNT(DISTINCT sesion_id) FILTER (WHERE evento = 'visita') AS visitas,
  COUNT(DISTINCT sesion_id) FILTER (WHERE evento = 'producto') AS productos,
  COUNT(DISTINCT sesion_id) FILTER (WHERE evento = 'carrito') AS carrito,
  COUNT(DISTINCT sesion_id) FILTER (WHERE evento = 'pago') AS pago,
  COUNT(DISTINCT sesion_id) FILTER (WHERE evento = 'compra') AS compra
FROM eventos_web;`,
      consejo: "Antes de fiarte de un embudo, comprueba que cada paso es menor o igual que el anterior. Si un paso tiene más que el de antes, estás contando eventos o mezclando periodos."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT
  COUNT(*) AS eventos,
  COUNT(DISTINCT e.sesion_id) AS sesiones
FROM eventos_web AS e
JOIN sesiones_web AS s ON s.id = e.sesion_id
WHERE e.evento = 'producto'
  AND s.inicio >= DATE '2026-09-01'
  AND s.inicio < DATE '2026-10-01';`,
      pregunta: "En septiembre de 2026, para el paso `producto`: ¿qué número es mayor, `COUNT(*)` (eventos) o `COUNT(DISTINCT sesion_id)` (sesiones)?",
      opciones: ["Los eventos", "Las sesiones", "Salen iguales"],
      correcta: 0,
      explicacion: "Cada sesión puede ver de 1 a 5 productos, así que hay **más eventos que sesiones**. Si construyes el embudo con `COUNT(*)`, el paso «producto» se infla y la caída de producto a carrito parece mucho peor de lo que es."
    },
    {
      tipo: "ejercicio",
      enunciado: "El embudo de **septiembre de 2026**: sesiones con `inicio` en septiembre (`>= DATE '2026-09-01'` y `< DATE '2026-10-01'`). Une `eventos_web` con `sesiones_web` y devuelve una fila con `visitas`, `productos`, `carrito`, `pago` y `compra` (sesiones que llegan a cada paso).",
      solucion: `SELECT
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'visita') AS visitas,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'producto') AS productos,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'carrito') AS carrito,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'pago') AS pago,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'compra') AS compra
FROM eventos_web AS e
JOIN sesiones_web AS s ON s.id = e.sesion_id
WHERE s.inicio >= DATE '2026-09-01'
  AND s.inicio < DATE '2026-10-01';`,
      pistas: [
        "El ejemplo de los cinco pasos, más un `JOIN sesiones_web AS s ON s.id = e.sesion_id` y un `WHERE` sobre `s.inicio`.",
        "SELECT COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'visita') AS visitas, COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'producto') AS productos, COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'carrito') AS carrito, COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'pago') AS pago, COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'compra') AS compra FROM eventos_web AS e JOIN sesiones_web AS s ON s.id = e.sesion_id WHERE s.inicio >= DATE '2026-09-01' AND s.inicio < DATE '2026-10-01';"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Conversión: cada paso sobre el anterior",
      texto: "La **conversión de un paso** es qué % de las sesiones del paso anterior llega a él: pago → compra = compras × 100.0 / pagos. La **conversión total** es sobre las visitas.\nPara verlo como gráfico, el embudo se pone en **formato largo**: una fila por paso, con su orden. Con `LAG` (que ya conoces) cada paso se divide entre el anterior.\nLa mayor caída es el paso con la conversión más baja. El ejemplo lo hace con todo el periodo.",
      ejemplo: `WITH pasos AS (
  SELECT evento AS paso,
    CASE evento WHEN 'visita' THEN 1 WHEN 'producto' THEN 2 WHEN 'carrito' THEN 3 WHEN 'pago' THEN 4 ELSE 5 END AS orden,
    COUNT(DISTINCT sesion_id) AS sesiones
  FROM eventos_web
  GROUP BY evento
)
SELECT paso, sesiones,
  ROUND(sesiones * 100.0 / NULLIF(LAG(sesiones) OVER (ORDER BY orden), 0), 1) AS pct_paso_anterior,
  ROUND(sesiones * 100.0 / NULLIF(MAX(sesiones) OVER (), 0), 1) AS pct_visitas
FROM pasos
ORDER BY orden;`,
      grafico: true,
      consejo: "Para la conversión total vale `MAX(sesiones) OVER ()` porque las visitas son siempre el paso más grande. Y cuando presentes un embudo, di el periodo y qué cuentas (sesiones): «el 30 %» sin más no significa nada."
    },
    {
      tipo: "quiz",
      pregunta: "El equipo web dice: «solo el 10 % de las visitas compra, así que el pago es un desastre». ¿Qué le falta a ese razonamiento?",
      opciones: [
        "Nada: si compra poca gente, el problema es el pago",
        "Mirar cada paso sobre el anterior: la caída puede estar antes, en producto o en carrito",
        "Contar eventos en vez de sesiones"
      ],
      correcta: 1,
      explicacion: "El % sobre las visitas mezcla todas las caídas en un solo número. Para saber **dónde** se pierde la gente, cada paso se divide entre el **anterior**: así ves qué tramo concreto pierde más."
    },
    {
      tipo: "explicacion",
      titulo: "Segmentar el embudo",
      texto: "Un embudo de todos juntos puede esconder que un grupo va bien y otro fatal. Basta con añadir `GROUP BY` a la consulta de los cinco pasos: por `dispositivo`, por mes, por variante…\nEl ejemplo compara móvil y ordenador de **abril a junio**: en el último paso, de pago a compra, el ordenador convierte alrededor del 80 % y el móvil alrededor del 65 %. Ahí hay algo que mirar.",
      ejemplo: `SELECT s.dispositivo,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'pago') AS pago,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'compra') AS compra,
  ROUND(COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'compra') * 100.0
    / NULLIF(COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'pago'), 0), 1) AS conv_pago_compra
FROM eventos_web AS e
JOIN sesiones_web AS s ON s.id = e.sesion_id
WHERE s.inicio >= DATE '2026-04-01'
  AND s.inicio < DATE '2026-07-01'
GROUP BY s.dispositivo
ORDER BY s.dispositivo;`
    },
    {
      tipo: "reto",
      de: "ana",
      enunciado: "El embudo de **septiembre de 2026** (sesiones con `inicio` en septiembre) por dispositivo. Cuenta **sesiones**, no eventos. Columnas:\n- `dispositivo`\n- `visitas`, `productos`, `carrito`, `pago`, `compra`: sesiones que llegan a cada paso.\n- `conv_pago_compra`: % de sesiones con compra sobre las que llegaron al pago, redondeado a 1.\nOrdenado por `dispositivo`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas dispositivo, visitas, productos, carrito, pago, compra y conv_pago_compra", prueba: (r) => PRUEBA.columnas(r, ["dispositivo", "visitas", "productos", "carrito", "pago", "compra", "conv_pago_compra"]) },
        { texto: "Cuentas sesiones, no eventos: en cada fila, productos no supera a visitas", prueba: (r) => {
          const v = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "visitas");
          const p = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "productos");
          const filas = r?.filas || [];
          return v >= 0 && p >= 0 && filas.length > 0 && filas.every(f => Number(f?.[p] ?? 0) <= Number(f?.[v] ?? 0));
        } },
        { texto: "Cada dispositivo con su embudo de septiembre y su conversión de pago a compra, en orden", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT s.dispositivo,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'visita') AS visitas,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'producto') AS productos,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'carrito') AS carrito,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'pago') AS pago,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'compra') AS compra,
  ROUND(COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'compra') * 100.0
    / NULLIF(COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'pago'), 0), 1) AS conv_pago_compra
FROM eventos_web AS e
JOIN sesiones_web AS s ON s.id = e.sesion_id
WHERE s.inicio >= DATE '2026-09-01'
  AND s.inicio < DATE '2026-10-01'
GROUP BY s.dispositivo
ORDER BY s.dispositivo;`) }
      ],
      pistas: [
        "Junta el ejercicio de septiembre con el ejemplo por dispositivo: los cinco `COUNT(DISTINCT e.sesion_id) FILTER (…)`, la conversión de pago a compra con `* 100.0` y `NULLIF`, y `GROUP BY s.dispositivo`.",
        "SELECT s.dispositivo, COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'visita') AS visitas, COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'producto') AS productos, COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'carrito') AS carrito, COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'pago') AS pago, COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'compra') AS compra, ROUND(COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'compra') * 100.0 / NULLIF(COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'pago'), 0), 1) AS conv_pago_compra FROM eventos_web AS e JOIN sesiones_web AS s ON s.id = e.sesion_id WHERE s.inicio >= DATE '2026-09-01' AND s.inicio < DATE '2026-10-01' GROUP BY s.dispositivo ORDER BY s.dispositivo;"
      ],
      solucion: `SELECT s.dispositivo,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'visita') AS visitas,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'producto') AS productos,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'carrito') AS carrito,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'pago') AS pago,
  COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'compra') AS compra,
  ROUND(COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'compra') * 100.0
    / NULLIF(COUNT(DISTINCT e.sesion_id) FILTER (WHERE e.evento = 'pago'), 0), 1) AS conv_pago_compra
FROM eventos_web AS e
JOIN sesiones_web AS s ON s.id = e.sesion_id
WHERE s.inicio >= DATE '2026-09-01'
  AND s.inicio < DATE '2026-10-01'
GROUP BY s.dispositivo
ORDER BY s.dispositivo;`
    }
  ]
});
