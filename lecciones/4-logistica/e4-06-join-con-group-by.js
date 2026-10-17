CURSO.registrar({
  id: "e4-06",
  titulo: "Unir y resumir: JOIN con GROUP BY",
  xp: 45,
  objetivo: "Sabrás resumir después de unir tablas agrupando por columnas de la tabla unida, contar bien tras un LEFT JOIN y evitar las cifras infladas cuando una unión 1:N repite filas.",
  pasos: [
    {
      tipo: "historia",
      de: "hector",
      asunto: "Mi informe de los lunes",
      texto: "¡Buenos días! Hoy he traído cruasanes para todo el equipo: coge uno antes de que vuelen.\nTe cuento: cada lunes mando a dirección **cuántos envíos ha hecho cada almacén** y cuánto nos cuestan. Ahora lo saco a mano y en el informe salen números de almacén que nadie entiende.\n¿Me lo dejas con los **nombres**? Lo que necesites de envíos, me lo pides."
    },
    {
      tipo: "explicacion",
      titulo: "Primero se une, después se agrupa",
      texto: "Recuerda el orden lógico: el `FROM` va primero, y el `JOIN` forma parte del `FROM`. PostgreSQL **une** las tablas, obtiene una tabla grande con las columnas de las dos y **después** hace los montones del `GROUP BY`.\nAsí puedes agrupar por una columna de la tabla unida, como el nombre del almacén. Fíjate en `GROUP BY al.id, al.nombre`: agrupas por el `id` (que nunca se repite) y añades el nombre para poder mostrarlo.\nSalen 4 filas: central 720, Levante 274, Sur 252 y Norte 91. ¿Y Zaragoza?",
      ejemplo: `SELECT al.nombre AS almacen, COUNT(*) AS envios
FROM envios AS e
JOIN almacenes AS al ON e.almacen_id = al.id
GROUP BY al.id, al.nombre
ORDER BY envios DESC;`,
      grafico: true,
      consejo: "Agrupa por la clave, no solo por el nombre. Hoy no hay dos almacenes que se llamen igual, pero el día que los haya (dos «Almacén Norte» en ciudades distintas), agrupar solo por `nombre` los mezclaría en un montón y nadie se daría cuenta."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT al.nombre AS almacen, COUNT(*) AS envios
FROM almacenes AS al
LEFT JOIN envios AS e ON e.almacen_id = al.id
GROUP BY al.id, al.nombre
ORDER BY envios DESC;`,
      pregunta: "Zaragoza no salía porque el `INNER JOIN` lo descarta: no tiene envíos. Ahora partimos de `almacenes` con un `LEFT JOIN`, así que sí aparece. ¿Qué número saldrá en `envios` para el **Almacén Zaragoza**?",
      opciones: ["0", "1", "NULL"],
      correcta: 1,
      explicacion: "Sale **1**, y es mentira. El `LEFT JOIN` crea **una fila** para Zaragoza con todas las columnas de `envios` a `NULL`. `COUNT(*)` cuenta filas, sin mirar qué hay dentro, así que cuenta esa fila vacía como un envío."
    },
    {
      tipo: "explicacion",
      titulo: "Tras un LEFT JOIN, cuenta la clave: COUNT(e.id)",
      texto: "Recuerda que `COUNT(columna)` **no cuenta los `NULL`**. En la fila de relleno de Zaragoza, `e.id` es `NULL`, así que `COUNT(e.id)` da **0**, que es la verdad.\nLa regla: después de un `LEFT JOIN`, cuenta una columna de la tabla de la derecha que nunca sea `NULL` cuando hay pareja, y la mejor es su clave primaria.\nAhora salen los 5 almacenes, con Zaragoza a 0.",
      ejemplo: `SELECT al.nombre AS almacen, COUNT(e.id) AS envios
FROM almacenes AS al
LEFT JOIN envios AS e ON e.almacen_id = al.id
GROUP BY al.id, al.nombre
ORDER BY envios DESC;`,
      grafico: true,
      consejo: "Cuando un informe dice «1» donde esperabas «0», sospecha de un `COUNT(*)` detrás de un `LEFT JOIN`. Es de los errores más repetidos en los cuadros de mando reales."
    },
    {
      tipo: "ejercicio",
      enunciado: "Héctor también quiere el dinero. Une `envios` con `almacenes` (solo los almacenes con envíos) y muestra por almacén: `almacen` (su nombre), `coste_total` (la suma de `coste`) y `coste_medio` (la media de `coste` redondeada a 2 decimales). Ordena de **mayor a menor** `coste_total`. Para que te cuadre: entre todos suman 9 245,80 €.",
      solucion: `SELECT al.nombre AS almacen, SUM(e.coste) AS coste_total, ROUND(AVG(e.coste), 2) AS coste_medio
FROM envios AS e
JOIN almacenes AS al ON e.almacen_id = al.id
GROUP BY al.id, al.nombre
ORDER BY coste_total DESC;`,
      grafico: true,
      pistas: [
        "Como el primer ejemplo, pero en vez de `COUNT(*)` pon `SUM(e.coste)` y `ROUND(AVG(e.coste), 2)`, cada uno con su alias.",
        "SELECT al.nombre AS almacen, SUM(e.coste) AS coste_total, ROUND(AVG(e.coste), 2) AS coste_medio FROM envios AS e JOIN almacenes AS al ON e.almacen_id = al.id GROUP BY al.id, al.nombre ORDER BY coste_total DESC;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `SELECT COUNT(*) AS filas
FROM pedidos AS p
JOIN lineas_pedido AS lp ON lp.pedido_id = p.id;`,
      pregunta: "Hay 2 524 pedidos y 4 022 líneas de pedido, y cada línea es de un solo pedido. ¿Cuántas filas tiene la unión?",
      opciones: ["2 524", "4 022", "10 151 528"],
      correcta: 1,
      explicacion: "**4 022**: una fila por cada línea. Un pedido con tres productos aparece **tres veces**, una por línea, con sus datos (`total`, `tienda_id`…) copiados en cada una. Es una relación 1:N: el `JOIN` repite el lado «uno» tantas veces como parejas tenga en el lado «muchos»."
    },
    {
      tipo: "explicacion",
      titulo: "La trampa: cifras infladas al unir 1:N",
      texto: "Mira el pedido 1: tiene 2 líneas, así que sale **dos veces**, con su `total` repetido.\nSi ahora sumas `p.total` o cuentas con `COUNT(*)`, ese pedido cuenta doble. Y como pasa con todos, las cifras salen **infladas** sin ningún error ni aviso.\nDos arreglos:\n- Para contar pedidos, `COUNT(DISTINCT p.id)`: cada pedido una vez, aunque salga repetido.\n- Para sumar dinero, suma en el lado «muchos», que no se repite: `SUM(lp.cantidad * lp.precio_unitario)`.",
      ejemplo: `SELECT p.id, p.total, lp.producto_id, lp.cantidad, lp.precio_unitario
FROM pedidos AS p
JOIN lineas_pedido AS lp ON lp.pedido_id = p.id
WHERE p.id = 1;`,
      consejo: "Antes de fiarte de una suma tras un `JOIN`, cuenta las filas: ¿cuántas tenía la tabla y cuántas tiene la unión? Y ojo: `SUM(DISTINCT p.total)` **no** lo arregla, porque dos pedidos distintos pueden costar lo mismo y uno de ellos desaparecería."
    },
    {
      tipo: "arreglar",
      enunciado: "Elena quiere por tienda: `tienda_id`, `pedidos` (cuántos pedidos distintos tiene), `unidades` (la suma de `cantidad` de sus líneas) y `facturacion` (el importe de sus líneas). Ordenado por `tienda_id`. Las unidades están bien, pero `pedidos` y `facturacion` salen infladas: Madrid debería tener 429 pedidos y la online, 1 527. Arréglala sin quitar el `JOIN`.",
      inicial: `SELECT p.tienda_id, COUNT(*) AS pedidos, SUM(lp.cantidad) AS unidades, SUM(p.total) AS facturacion
FROM pedidos AS p
JOIN lineas_pedido AS lp ON lp.pedido_id = p.id
GROUP BY p.tienda_id
ORDER BY p.tienda_id;`,
      solucion: `SELECT p.tienda_id, COUNT(DISTINCT p.id) AS pedidos, SUM(lp.cantidad) AS unidades, SUM(lp.cantidad * lp.precio_unitario) AS facturacion
FROM pedidos AS p
JOIN lineas_pedido AS lp ON lp.pedido_id = p.id
GROUP BY p.tienda_id
ORDER BY p.tienda_id;`,
      pistas: [
        "Cada pedido sale una vez por línea. Para contarlo una sola vez, usa `DISTINCT` dentro del `COUNT`; para el dinero, suma en `lineas_pedido`, que no se repite.",
        "Cambia `COUNT(*)` por `COUNT(DISTINCT p.id)` y `SUM(p.total)` por `SUM(lp.cantidad * lp.precio_unitario)`."
      ]
    },
    {
      tipo: "reto",
      de: "hector",
      enunciado: "Ahora por transportista, que el mes que viene renegociamos contratos. Quiero **todos** los transportistas, también los que no han hecho ningún envío: `transportista` (su nombre), `envios` (cuántos envíos tiene, 0 si ninguno) y `coste_total` (la suma de `coste` de sus envíos), de **más a menos** envíos. Mira el gráfico.\nUn detalle: `COUNT` de nada da 0, pero `SUM` de nada da `NULL`. Si a alguno le sale `NULL` en `coste_total`, déjalo así: en la etapa 5 aprenderás a convertirlo en 0.",
      inicial: "-- Escribe tu consulta aquí\n",
      grafico: true,
      comprobaciones: [
        { texto: "Tiene las columnas transportista, envios y coste_total", prueba: (r) => PRUEBA.columnas(r, ["transportista", "envios", "coste_total"]) },
        { texto: "Salen los 4 transportistas, Logística Delta con 0 envíos", prueba: (r) => {
          const c = (r?.columnas || []).map(x => String(x).toLowerCase());
          const it = c.indexOf("transportista"), ie = c.indexOf("envios");
          const filas = r?.filas || [];
          return filas.length === 4 && it >= 0 && ie >= 0 && filas.some(f => f[it] === "Logística Delta" && Number(f[ie]) === 0);
        } },
        { texto: "Los envíos suman 1 337 entre todos", prueba: (r) => {
          const ie = (r?.columnas || []).findIndex(x => String(x).toLowerCase() === "envios");
          return ie >= 0 && (r?.filas || []).reduce((s, f) => s + Number(f[ie] ?? 0), 0) === 1337;
        } },
        // Quien ya sabe COALESCE puede convertir el NULL en 0: también vale
        { texto: "Cada transportista tiene su coste, de más a menos envíos", prueba: async (r, db) => await PRUEBA.igualA(r, db, `SELECT t.nombre AS transportista, COUNT(e.id) AS envios, SUM(e.coste) AS coste_total
FROM transportistas AS t
LEFT JOIN envios AS e ON e.transportista_id = t.id
GROUP BY t.id, t.nombre
ORDER BY envios DESC;`) || await PRUEBA.igualA(r, db, `SELECT t.nombre AS transportista, COUNT(e.id) AS envios, COALESCE(SUM(e.coste), 0) AS coste_total
FROM transportistas AS t
LEFT JOIN envios AS e ON e.transportista_id = t.id
GROUP BY t.id, t.nombre
ORDER BY envios DESC;`) }
      ],
      pistas: [
        "Para que salgan todos los transportistas, parte de `transportistas` y haz un `LEFT JOIN` con `envios`. Cuenta con `COUNT(e.id)`, no con `COUNT(*)`.",
        "SELECT t.nombre AS transportista, COUNT(e.id) AS envios, SUM(e.coste) AS coste_total FROM transportistas AS t LEFT JOIN envios AS e ON e.transportista_id = t.id GROUP BY t.id, t.nombre ORDER BY envios DESC;"
      ],
      solucion: `SELECT t.nombre AS transportista, COUNT(e.id) AS envios, SUM(e.coste) AS coste_total
FROM transportistas AS t
LEFT JOIN envios AS e ON e.transportista_id = t.id
GROUP BY t.id, t.nombre
ORDER BY envios DESC;`
    }
  ]
});
