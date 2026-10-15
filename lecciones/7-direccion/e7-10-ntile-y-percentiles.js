CURSO.registrar({
  id: "e7-10",
  titulo: "Repartir en grupos: NTILE y percentiles",
  xp: 40,
  objetivo: "Sabrás repartir filas en grupos del mismo tamaño con NTILE (cuartiles), situar cada fila en su percentil con PERCENT_RANK y CUME_DIST, y calcular la mediana con percentile_cont, que no se deja engañar por los valores extremos.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "¿Quiénes son nuestros mejores clientes?",
      texto: "Marketing quiere tratar distinto a los clientes según lo que gastan. Nada de umbrales inventados («más de 1 000 €»): quiero **cuatro grupos del mismo tamaño**, del 25 % que menos gasta al 25 % que más.\nY una cosa más: cuando me decís «el pedido medio», ¿es representativo? Dos o tres pedidos enormes pueden inflarlo. Quiero saber qué es lo **normal**."
    },
    {
      tipo: "explicacion",
      titulo: "NTILE: repartir en grupos iguales",
      texto: "`NTILE(4) OVER (ORDER BY …)` ordena las filas y las reparte en **4 grupos** del mismo tamaño (o casi): 1, 2, 3, 4. Son los **cuartiles**; con `NTILE(10)`, deciles.\nEl ejemplo calcula el gasto de cada cliente (sin pedidos cancelados) y le asigna su cuartil: el 1 es el 25 % que menos gasta y el 4 el que más. Se ven los 10 clientes que más gastan.",
      ejemplo: `WITH gasto AS (
  SELECT cliente_id, SUM(total) AS gasto
  FROM pedidos
  WHERE estado <> 'cancelado'
  GROUP BY cliente_id
)
SELECT cliente_id, gasto,
  NTILE(4) OVER (ORDER BY gasto, cliente_id) AS cuartil
FROM gasto
ORDER BY gasto DESC, cliente_id
LIMIT 10;`,
      consejo: "Desempata el `ORDER BY` de `NTILE` (aquí, por `cliente_id`). Si dos clientes con el mismo gasto caen justo en la frontera entre dos grupos, sin desempate cada ejecución podría mandar a uno distinto a cada lado."
    },
    {
      tipo: "quiz",
      pregunta: "Aplicas `NTILE(4)` a **10** filas. ¿Cuántas filas tiene cada grupo?",
      opciones: ["3, 3, 2, 2", "2, 2, 3, 3", "2, 2, 2, 4"],
      correcta: 0,
      explicacion: "Si no se puede repartir exacto, los grupos **primeros** se llevan una fila de más: 10 entre 4 son 2 y sobran 2, que van al grupo 1 y al 2. Por eso los cuartiles de un listado pueden diferir en una fila."
    },
    {
      tipo: "explicacion",
      titulo: "PERCENT_RANK y CUME_DIST: ¿en qué percentil está?",
      texto: "A veces no quieres grupos, sino saber **dónde cae** cada fila, de 0 a 1:\n- `PERCENT_RANK()`: qué parte de las demás filas queda **por debajo**. El primero tiene 0 y el último 1.\n- `CUME_DIST()`: qué parte de las filas es **menor o igual**. Un 0,75 quiere decir «el 75 % cuesta esto o menos».\nDevuelven un número decimal largo; para redondearlo con `ROUND(…, 2)` hay que pasarlo a `numeric` con `::numeric`.",
      ejemplo: `SELECT nombre, precio,
  ROUND(PERCENT_RANK() OVER (ORDER BY precio)::numeric, 2) AS por_debajo,
  ROUND(CUME_DIST() OVER (ORDER BY precio)::numeric, 2) AS hasta_aqui
FROM productos
ORDER BY precio, id;`
    },
    {
      tipo: "prediccion",
      consulta: `SELECT AVG(x) AS media,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY x) AS mediana
FROM (VALUES (10), (20), (30), (40), (999999)) AS t(x);`,
      pregunta: "Cinco importes escritos a mano (`VALUES` en el `FROM` funciona como una tabla pequeña): 10, 20, 30, 40 y un **999999** como el atípico de la migración. ¿Cuánto vale la **mediana**?",
      opciones: ["200019,8", "30", "40"],
      correcta: 1,
      explicacion: "La **mediana** es el valor del medio cuando los ordenas: 10, 20, **30**, 40, 999999. La media se dispara a 200 019,8 por culpa de un solo valor; la mediana ni se entera. Por eso, cuando hay atípicos, «lo normal» se mide con la mediana."
    },
    {
      tipo: "explicacion",
      titulo: "percentile_cont: la mediana y otros percentiles",
      texto: "`percentile_cont(0.5) WITHIN GROUP (ORDER BY columna)` es un **agregado** (como `AVG`): junta las filas y devuelve la mediana. Con `0.25` o `0.75` sacas los cuartiles; con `0.9`, el percentil 90.\nSi el número de filas es par, toma el punto medio entre los dos centrales. Devuelve un decimal largo: `::numeric` y `ROUND`.\nEl ejemplo compara media y mediana del importe de los pedidos de cada método de pago.",
      ejemplo: `SELECT metodo_pago,
  ROUND(AVG(total), 2) AS media,
  ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY total)::numeric, 2) AS mediana
FROM pedidos
GROUP BY metodo_pago
ORDER BY metodo_pago;`,
      consejo: "Si la media está muy por encima de la mediana, unos pocos valores grandes tiran de ella. En el informe para dirección pon las dos y explica la diferencia en una frase.",
      otrosMotores: "En SQL Server, `PERCENTILE_CONT` es una función ventana (`… WITHIN GROUP (ORDER BY total) OVER ()`); en BigQuery, `PERCENTILE_CONT(total, 0.5) OVER ()`. MySQL no la tiene."
    },
    {
      tipo: "ejercicio",
      enunciado: "Por tienda: `tienda_id`, `media` (media de `total`, redondeada a 2) y `mediana` (mediana de `total` con `percentile_cont(0.5)`, redondeada a 2), ordenado por `tienda_id`. Todos los pedidos.",
      solucion: `SELECT tienda_id,
  ROUND(AVG(total), 2) AS media,
  ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY total)::numeric, 2) AS mediana
FROM pedidos
GROUP BY tienda_id
ORDER BY tienda_id;`,
      pistas: [
        "Como el ejemplo, pero agrupando por `tienda_id`. No olvides el `::numeric` antes de redondear la mediana.",
        "SELECT tienda_id, ROUND(AVG(total), 2) AS media, ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY total)::numeric, 2) AS mediana FROM pedidos GROUP BY tienda_id ORDER BY tienda_id;"
      ]
    },
    {
      tipo: "reto",
      de: "ana",
      enunciado: "Los cuatro grupos para marketing. Calcula el gasto de cada cliente (suma de `total` de sus pedidos **no cancelados**), reparte a los clientes en cuartiles con `NTILE(4)` ordenando por gasto de menor a mayor (desempate por `cliente_id`), y resume cada cuartil: `cuartil`, `clientes` (cuántos), `gasto_min` y `gasto_max`, ordenado por `cuartil`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas cuartil, clientes, gasto_min y gasto_max", prueba: (r) => PRUEBA.columnas(r, ["cuartil", "clientes", "gasto_min", "gasto_max"]) },
        { texto: "Salen 4 cuartiles casi del mismo tamaño (como mucho 1 cliente de diferencia)", prueba: (r) => {
          const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "clientes");
          const n = (r?.filas || []).map(f => Number(f?.[i] ?? 0));
          return i >= 0 && n.length === 4 && Math.max(...n) - Math.min(...n) <= 1;
        } },
        { texto: "Cada cuartil con su número de clientes y su gasto mínimo y máximo", prueba: (r, db) => PRUEBA.igualA(r, db, `WITH gasto AS (
  SELECT cliente_id, SUM(total) AS gasto
  FROM pedidos
  WHERE estado <> 'cancelado'
  GROUP BY cliente_id
),
cuartiles AS (
  SELECT cliente_id, gasto,
    NTILE(4) OVER (ORDER BY gasto, cliente_id) AS cuartil
  FROM gasto
)
SELECT cuartil, COUNT(*) AS clientes, MIN(gasto) AS gasto_min, MAX(gasto) AS gasto_max
FROM cuartiles
GROUP BY cuartil
ORDER BY cuartil;`) }
      ],
      pistas: [
        "Tres pasos: una CTE `gasto` (suma por cliente sin cancelados), otra `cuartiles` con `NTILE(4) OVER (ORDER BY gasto, cliente_id) AS cuartil`, y fuera un `GROUP BY cuartil` con `COUNT(*)`, `MIN(gasto)` y `MAX(gasto)`.",
        "WITH gasto AS (SELECT cliente_id, SUM(total) AS gasto FROM pedidos WHERE estado <> 'cancelado' GROUP BY cliente_id), cuartiles AS (SELECT cliente_id, gasto, NTILE(4) OVER (ORDER BY gasto, cliente_id) AS cuartil FROM gasto) SELECT cuartil, COUNT(*) AS clientes, MIN(gasto) AS gasto_min, MAX(gasto) AS gasto_max FROM cuartiles GROUP BY cuartil ORDER BY cuartil;"
      ],
      solucion: `WITH gasto AS (
  SELECT cliente_id, SUM(total) AS gasto
  FROM pedidos
  WHERE estado <> 'cancelado'
  GROUP BY cliente_id
),
cuartiles AS (
  SELECT cliente_id, gasto,
    NTILE(4) OVER (ORDER BY gasto, cliente_id) AS cuartil
  FROM gasto
)
SELECT cuartil, COUNT(*) AS clientes, MIN(gasto) AS gasto_min, MAX(gasto) AS gasto_max
FROM cuartiles
GROUP BY cuartil
ORDER BY cuartil;`
    }
  ]
});
