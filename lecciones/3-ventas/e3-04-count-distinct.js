CURSO.registrar({
  id: "e3-04",
  titulo: "Contar distintos: COUNT(DISTINCT)",
  xp: 30,
  objetivo: "Sabrás contar cuántos valores diferentes tiene una columna con COUNT(DISTINCT) y distinguirlo de COUNT(*), que cuenta filas.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "¿Pedidos o personas?",
      texto: "Me pasaste que la tienda online ha recibido **1 527 pedidos**. Genial. Pero en el comité me van a preguntar otra cosa: **¿cuántos clientes** son?\nNo es lo mismo 1 527 pedidos de 1 527 personas distintas que de cincuenta clientes muy fieles. Necesito contar **personas**, no tickets."
    },
    {
      tipo: "explicacion",
      titulo: "COUNT(DISTINCT columna)",
      texto: "`COUNT(*)` cuenta **filas**: si un cliente ha hecho diez pedidos, cuenta diez. Es como contar los tickets de caja del día.\n`COUNT(DISTINCT cliente_id)` cuenta **valores diferentes**: cada cliente cuenta una vez, haya comprado una vez o cien. Es como contar las personas que han pasado por caja.\nEn el ejemplo verás las dos cifras una al lado de la otra: pedidos y clientes que los han hecho.",
      ejemplo: `SELECT COUNT(*) AS pedidos,
  COUNT(DISTINCT cliente_id) AS clientes
FROM pedidos;`,
      consejo: "Cuando alguien te pida «cuántos clientes», «cuántos productos» o «cuántas tiendas» sobre una tabla de pedidos, casi siempre quiere `COUNT(DISTINCT …)`. Pregunta siempre: ¿cuento filas o cuento cosas distintas?"
    },
    {
      tipo: "prediccion",
      consulta: `SELECT COUNT(DISTINCT tienda_id) AS tiendas_con_pedidos
FROM pedidos;`,
      pregunta: "Faro tiene 6 tiendas en la tabla `tiendas` y 2 524 pedidos. ¿Qué número devolverá esta consulta?",
      opciones: ["6", "5", "2 524"],
      correcta: 1,
      explicacion: "Cuenta los `tienda_id` **diferentes** que aparecen en `pedidos`. Barcelona (tienda 6) abrió el 1 de octubre y aún no tiene ningún pedido, así que su id no aparece: salen 5. Con `COUNT(*)` habrías contado los 2 524 pedidos."
    },
    {
      tipo: "ejercicio",
      enunciado: "¿Con cuántos **métodos de pago** distintos han pagado los clientes? Cuenta los valores diferentes de `metodo_pago` en `pedidos` y llama al resultado `metodos_pago`.",
      solucion: `SELECT COUNT(DISTINCT metodo_pago) AS metodos_pago
FROM pedidos;`,
      pistas: [
        "Pon `DISTINCT` **dentro** de los paréntesis de COUNT, delante de la columna.",
        "SELECT COUNT(DISTINCT metodo_pago) AS metodos_pago FROM pedidos;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "SELECT DISTINCT o COUNT(DISTINCT)",
      texto: "Ya conocías `SELECT DISTINCT`: devuelve la **lista** de valores diferentes, una fila por valor. `COUNT(DISTINCT …)` devuelve **cuántos** son, en una sola fila.\n- ¿Qué estados de pedido existen? → `SELECT DISTINCT estado FROM pedidos;`\n- ¿Cuántos estados hay? → el ejemplo.\nY como los demás agregados, `COUNT(DISTINCT …)` **no cuenta los NULL**.",
      ejemplo: `SELECT COUNT(DISTINCT estado) AS estados
FROM pedidos;`,
      otrosMotores: "Con tablas de miles de millones de filas, contar distintos exactos es lento. BigQuery ofrece `APPROX_COUNT_DISTINCT(columna)` y Snowflake `APPROX_COUNT_DISTINCT` / `HLL`: dan una cifra aproximada mucho más rápido. En PostgreSQL, con tablas como las de Faro, el exacto va de sobra."
    },
    {
      tipo: "quiz",
      pregunta: "En `clientes` hay 10 personas sin ciudad (NULL). Al hacer `SELECT COUNT(DISTINCT ciudad) FROM clientes;`, ¿qué pasa con esos 10?",
      opciones: [
        "Cuentan como una ciudad más",
        "No se cuentan",
        "Cuentan como 10 ciudades distintas"
      ],
      correcta: 1,
      explicacion: "`COUNT(DISTINCT ciudad)` se salta los NULL, igual que `COUNT(ciudad)`. Cuidado con `SELECT DISTINCT ciudad`: ese **sí** muestra una fila con NULL en la lista. Por eso, a veces, la lista tiene una fila más que la cuenta."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería contar cuántos **clientes distintos** han comprado en la tienda de Bilbao (`tienda_id` 4), en una columna `clientes_bilbao`. Pero da lo mismo que contar pedidos. Arréglala.",
      inicial: `SELECT DISTINCT COUNT(cliente_id) AS clientes_bilbao
FROM pedidos
WHERE tienda_id = 4;`,
      solucion: `SELECT COUNT(DISTINCT cliente_id) AS clientes_bilbao
FROM pedidos
WHERE tienda_id = 4;`,
      pistas: [
        "Ese `DISTINCT` está fuera del COUNT: quita repetidos del **resultado** (que ya es una sola fila), no de los clientes. Tiene que ir dentro de los paréntesis.",
        "SELECT COUNT(DISTINCT cliente_id) AS clientes_bilbao FROM pedidos WHERE tienda_id = 4;"
      ]
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "Ahora sí: **¿cuántos clientes distintos han comprado en la tienda online** (`tienda_id` 5)? Una sola columna llamada `clientes_online`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene una sola columna llamada clientes_online", prueba: (r) => PRUEBA.columnas(r, ["clientes_online"]) },
        { texto: "Devuelve una sola fila", prueba: (r) => (r?.filas?.length ?? 0) === 1 },
        { texto: "Cuenta clientes distintos, no pedidos: son 284", prueba: (r) => PRUEBA.valor(r, 0, "clientes_online") === 284 }
      ],
      pistas: [
        "Filtra los pedidos online con `WHERE tienda_id = 5` y cuenta los `cliente_id` diferentes.",
        "SELECT COUNT(DISTINCT cliente_id) AS clientes_online FROM pedidos WHERE tienda_id = 5;"
      ],
      solucion: `SELECT COUNT(DISTINCT cliente_id) AS clientes_online
FROM pedidos
WHERE tienda_id = 5;`
    }
  ]
});
