CURSO.registrar({
  id: "e8-01",
  titulo: "Medir lo que importa: KPIs",
  xp: 40,
  objetivo: "Sabrás definir un KPI antes de calcularlo, sacar los cinco indicadores de Faro (facturación neta, pedidos, ticket medio, clientes activos y tasa de reembolso) y evitar las dos trampas de las divisiones: la división entera y dividir por cero.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "Cinco números en una diapositiva",
      texto: "El consejo de octubre sigue en pie y quiero abrirlo con **una sola diapositiva**: cinco números que digan cómo va Faro.\nY quiero que signifiquen lo mismo cada vez que los pida. El trimestre pasado dos departamentos me dieron dos «facturaciones» distintas para el mismo mes, y los dos tenían razón según sus cuentas. Eso no puede volver a pasar."
    },
    {
      tipo: "explicacion",
      titulo: "Un KPI se define antes de calcularlo",
      texto: "Un **KPI** (indicador clave de rendimiento) es un número que responde a una pregunta de negocio y que se sigue en el tiempo: «¿cuánto vendemos al mes?».\nLo difícil no es el SQL, es la **definición**. ¿La facturación incluye los pedidos cancelados? ¿Y los reembolsados? Las dos «facturaciones» de Ana eran esto: una sumaba todo y otra no.\nEn Faro queda fijado desde hoy: **facturación neta** = suma de `total` de los pedidos que **no** están `cancelado` ni `reembolsado`. El ejemplo pone las dos cifras de septiembre de 2026 lado a lado.",
      ejemplo: `SELECT
  SUM(total) AS facturacion_bruta,
  SUM(total) FILTER (WHERE estado NOT IN ('cancelado', 'reembolsado')) AS facturacion_neta
FROM pedidos
WHERE fecha >= DATE '2026-09-01'
  AND fecha < DATE '2026-10-01';`,
      consejo: "Escribe la definición de cada KPI en una línea y guárdala junto al informe. Cuando alguien pregunte «¿y esto incluye…?», la respuesta ya está escrita y no depende de quién hizo la consulta."
    },
    {
      tipo: "quiz",
      pregunta: "Ana quiere seguir cada mes un número que le avise si algo va mal con los pedidos. ¿Cuál es un buen KPI?",
      opciones: [
        "La tabla de pedidos completa",
        "La tasa de reembolso mensual: % de pedidos del mes que acaban reembolsados",
        "Que las ventas vayan bien"
      ],
      correcta: 1,
      explicacion: "Un KPI es **un número**, con una **definición** clara y que se puede **comparar** mes a mes. La tabla entera son datos, no un indicador; «que vaya bien» es un deseo, no se puede medir."
    },
    {
      tipo: "explicacion",
      titulo: "Los cinco de Faro",
      texto: "Con la definición fijada, los cinco KPI de Ana salen en una sola consulta:\n- **pedidos**: todos, `COUNT(*)`.\n- **facturación neta**: `SUM(total)` con el `FILTER` de antes.\n- **ticket medio** (en inglés, AOV): lo que vale de media un pedido neto, `AVG(total)` con el mismo `FILTER`.\n- **clientes activos**: los que compraron, `COUNT(DISTINCT cliente_id)`.\n- **tasa de reembolso**: % de pedidos reembolsados (en el paso siguiente, cómo dividir sin trampas).\nEl ejemplo saca los cuatro primeros de septiembre de 2026.",
      ejemplo: `SELECT
  COUNT(*) AS pedidos,
  SUM(total) FILTER (WHERE estado NOT IN ('cancelado', 'reembolsado')) AS facturacion,
  ROUND(AVG(total) FILTER (WHERE estado NOT IN ('cancelado', 'reembolsado')), 2) AS ticket_medio,
  COUNT(DISTINCT cliente_id) AS clientes
FROM pedidos
WHERE fecha >= DATE '2026-09-01'
  AND fecha < DATE '2026-10-01';`,
      consejo: "Dos errores que veo en cada informe: `COUNT(cliente_id)` en vez de `COUNT(DISTINCT cliente_id)` (un cliente con tres pedidos cuenta tres veces) y un ticket medio que promedia también los cancelados, que nunca se cobraron."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT 3 / 4 AS a, 3 * 100.0 / 4 AS b;`,
      pregunta: "Dos divisiones casi iguales. ¿Qué devuelven `a` y `b`?",
      opciones: ["0,75 y 75", "0 y 75", "1 y 75"],
      correcta: 1,
      explicacion: "`3 / 4` divide **dos enteros**, y en PostgreSQL eso da un entero: se queda con la parte entera, **0**. Basta con que uno de los dos sea decimal (`100.0`) para que la división sea decimal: **75**. Es la trampa número uno de las tasas."
    },
    {
      tipo: "explicacion",
      titulo: "Tasas sin trampas: * 100.0 y NULLIF",
      texto: "`COUNT(*)` devuelve un entero. Por eso `COUNT(*) FILTER (WHERE estado = 'reembolsado') / COUNT(*)` sale **0** casi siempre: la división entera de algo pequeño entre algo grande.\nEl remedio: multiplica por `100.0` **antes** de dividir (o convierte con `::numeric`). Así obtienes directamente el porcentaje en decimal.\nY si el grupo pudiera estar vacío, el denominador sería 0 y la consulta daría error. `NULLIF(COUNT(*), 0)` lo convierte en `NULL` y la tasa sale `NULL` en vez de romperlo todo (lo viste en la migración).",
      ejemplo: `SELECT tienda_id,
  COUNT(*) AS pedidos,
  ROUND(COUNT(*) FILTER (WHERE estado = 'reembolsado') * 100.0 / NULLIF(COUNT(*), 0), 1) AS tasa_reembolso
FROM pedidos
WHERE fecha >= DATE '2026-09-01'
  AND fecha < DATE '2026-10-01'
GROUP BY tienda_id
ORDER BY tienda_id;`,
      otrosMotores: "SQL Server también hace división entera con enteros (`3 / 4` = 0). MySQL y BigQuery no: `3 / 4` da 0,75 (BigQuery tiene además `SAFE_DIVIDE(a, b)`, que devuelve `NULL` si `b` es 0)."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería dar, por tienda, la **tasa de reembolso de 2025** (% de pedidos con estado `'reembolsado'`, redondeado a 1 decimal), pero sale 0 en todas. Arréglala para que devuelva `tienda_id` y `tasa_reembolso`, ordenado por `tienda_id`.",
      inicial: `SELECT tienda_id,
  ROUND(COUNT(*) FILTER (WHERE estado = 'reembolsado') / COUNT(*) * 100, 1) AS tasa_reembolso
FROM pedidos
WHERE fecha >= DATE '2025-01-01'
  AND fecha < DATE '2026-01-01'
GROUP BY tienda_id
ORDER BY tienda_id;`,
      solucion: `SELECT tienda_id,
  ROUND(COUNT(*) FILTER (WHERE estado = 'reembolsado') * 100.0 / NULLIF(COUNT(*), 0), 1) AS tasa_reembolso
FROM pedidos
WHERE fecha >= DATE '2025-01-01'
  AND fecha < DATE '2026-01-01'
GROUP BY tienda_id
ORDER BY tienda_id;`,
      pistas: [
        "La división se hace antes de multiplicar por 100, y entre dos enteros. ¿Qué pasa si multiplicas por `100.0` **antes** de dividir?",
        "Cambia la expresión por `ROUND(COUNT(*) FILTER (WHERE estado = 'reembolsado') * 100.0 / NULLIF(COUNT(*), 0), 1)`."
      ]
    },
    {
      tipo: "reto",
      de: "ana",
      enunciado: "La diapositiva del **tercer trimestre de 2026** (pedidos con `fecha` desde el 2026-07-01 y antes del 2026-10-01), por tienda. Columnas:\n- `tienda_id`\n- `pedidos`: todos los pedidos.\n- `facturacion`: neta (suma de `total` sin `cancelado` ni `reembolsado`).\n- `ticket_medio`: media de `total` de esos mismos pedidos netos, redondeada a 2.\n- `clientes`: clientes distintos, contando todos los pedidos.\n- `tasa_reembolso`: % de pedidos con estado `'reembolsado'` sobre todos, redondeado a 1.\nOrdenado por `tienda_id`.",
      inicial: "-- Escribe tu consulta aquí\n",
      grafico: true,
      comprobaciones: [
        { texto: "Tiene las columnas tienda_id, pedidos, facturacion, ticket_medio, clientes y tasa_reembolso", prueba: (r) => PRUEBA.columnas(r, ["tienda_id", "pedidos", "facturacion", "ticket_medio", "clientes", "tasa_reembolso"]) },
        { texto: "La tasa de reembolso no sale 0 en todas las tiendas (¿división entera?)", prueba: (r) => {
          const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "tasa_reembolso");
          return i >= 0 && (r?.filas || []).some(f => Number(f?.[i] ?? 0) > 0);
        } },
        { texto: "Cuentas clientes distintos (COUNT(DISTINCT cliente_id)), no pedidos", prueba: () => /\bcount\s*\(\s*distinct\b/i.test(PRUEBA.codigo()) },
        { texto: "Entra el 30 de septiembre entero (fecha < '2026-10-01': con <= '2026-09-30' se pierde el día, porque la fecha lleva hora)", prueba: async (r, db) => {
          const e = await db.consulta("SELECT tienda_id, COUNT(*) FROM pedidos WHERE fecha >= '2026-07-01' AND fecha < '2026-10-01' GROUP BY tienda_id");
          return e.filas.every(([t, n]) => (r?.filas || []).some(f => String(f[0]) === String(t) && Number(f[1]) === Number(n)));
        } },
        { texto: "Cada tienda con sus cinco KPI del trimestre, en orden de tienda", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT tienda_id,
  COUNT(*) AS pedidos,
  SUM(total) FILTER (WHERE estado NOT IN ('cancelado', 'reembolsado')) AS facturacion,
  ROUND(AVG(total) FILTER (WHERE estado NOT IN ('cancelado', 'reembolsado')), 2) AS ticket_medio,
  COUNT(DISTINCT cliente_id) AS clientes,
  ROUND(COUNT(*) FILTER (WHERE estado = 'reembolsado') * 100.0 / NULLIF(COUNT(*), 0), 1) AS tasa_reembolso
FROM pedidos
WHERE fecha >= DATE '2026-07-01'
  AND fecha < DATE '2026-10-01'
GROUP BY tienda_id
ORDER BY tienda_id;`) }
      ],
      pistas: [
        "Junta en una consulta lo de los dos ejemplos: filtra el trimestre con `fecha >= DATE '2026-07-01' AND fecha < DATE '2026-10-01'`, agrupa por `tienda_id` y usa `FILTER (WHERE estado NOT IN ('cancelado', 'reembolsado'))` en la facturación y el ticket medio.",
        "SELECT tienda_id, COUNT(*) AS pedidos, SUM(total) FILTER (WHERE estado NOT IN ('cancelado', 'reembolsado')) AS facturacion, ROUND(AVG(total) FILTER (WHERE estado NOT IN ('cancelado', 'reembolsado')), 2) AS ticket_medio, COUNT(DISTINCT cliente_id) AS clientes, ROUND(COUNT(*) FILTER (WHERE estado = 'reembolsado') * 100.0 / NULLIF(COUNT(*), 0), 1) AS tasa_reembolso FROM pedidos WHERE fecha >= DATE '2026-07-01' AND fecha < DATE '2026-10-01' GROUP BY tienda_id ORDER BY tienda_id;"
      ],
      solucion: `SELECT tienda_id,
  COUNT(*) AS pedidos,
  SUM(total) FILTER (WHERE estado NOT IN ('cancelado', 'reembolsado')) AS facturacion,
  ROUND(AVG(total) FILTER (WHERE estado NOT IN ('cancelado', 'reembolsado')), 2) AS ticket_medio,
  COUNT(DISTINCT cliente_id) AS clientes,
  ROUND(COUNT(*) FILTER (WHERE estado = 'reembolsado') * 100.0 / NULLIF(COUNT(*), 0), 1) AS tasa_reembolso
FROM pedidos
WHERE fecha >= DATE '2026-07-01'
  AND fecha < DATE '2026-10-01'
GROUP BY tienda_id
ORDER BY tienda_id;`
    }
  ]
});
