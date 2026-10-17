CURSO.registrar({
  id: "e3-01",
  titulo: "Contar filas: COUNT",
  xp: 25,
  rumor: "Elena está nerviosa: este trimestre se juega el bonus con la tienda online, y con tantos reembolsos no llega. No te extrañe si te pide las cifras «para ayer».",
  objetivo: "Sabrás resumir una tabla entera en un solo número con COUNT, contar solo las filas que cumplen un WHERE y entender por qué COUNT(columna) se salta los NULL.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "Números para el comité, para ayer",
      texto: "Hola, soy Elena Ruiz, directora de ventas. El lunes tengo comité y Lucía me ha dicho que tú me puedes sacar las cifras.\nHe probado `SELECT * FROM pedidos` y me han salido miles de filas. Al comité no le llevo una lista: le llevo **números**. Empecemos por lo básico: **¿cuántos pedidos tenemos?**"
    },
    {
      tipo: "explicacion",
      titulo: "Funciones de agregado: de muchas filas a una",
      texto: "Hasta ahora cada fila de la tabla era una fila del resultado. Una **función de agregado** hace lo contrario: **resume** muchas filas en un solo valor, como el total al pie de una columna de Excel.\nLa más sencilla es `COUNT(*)`: cuenta filas. El asterisco significa «filas enteras, tengan lo que tengan».\nEl ejemplo devuelve **una sola fila** con un número: los 2 524 pedidos de Faro. Con `AS` le das un nombre claro a esa columna.",
      ejemplo: `SELECT COUNT(*) AS total_pedidos
FROM pedidos;`,
      consejo: "Pon siempre un alias a los agregados. Sin él, PostgreSQL llama a la columna `count`, y en un informe con cinco cifras nadie sabe cuál es cuál.",
      otrosMotores: "`COUNT(*)` es igual en todos los motores. En SQL Server devuelve un entero normal; para tablas enormes existe `COUNT_BIG(*)`."
    },
    {
      tipo: "ejercicio",
      enunciado: "¿Cuántos clientes hay en la tabla `clientes`? Devuelve una sola columna llamada `total_clientes`.",
      solucion: `SELECT COUNT(*) AS total_clientes
FROM clientes;`,
      pistas: [
        "Igual que el ejemplo, pero con la tabla `clientes` y el alias `total_clientes`.",
        "SELECT COUNT(*) AS total_clientes FROM clientes;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Contar con WHERE",
      texto: "COUNT cuenta lo que le llega. Si pones un `WHERE`, primero se filtran las filas y **después** se cuentan las que quedan.\nEl ejemplo cuenta solo los pedidos cancelados. Es la forma de responder a casi cualquier «¿cuántos… que…?»: ¿cuántos pedidos con bizum?, ¿cuántos clientes de Sevilla?, ¿cuántas reclamaciones abiertas?",
      ejemplo: `SELECT COUNT(*) AS cancelados
FROM pedidos
WHERE estado = 'cancelado';`
    },
    {
      tipo: "prediccion",
      consulta: `SELECT COUNT(*) AS pedidos_barcelona
FROM pedidos
WHERE tienda_id = 6;`,
      pregunta: "La tienda de Barcelona (`tienda_id` 6) abrió el 1 de octubre y todavía no tiene pedidos. ¿Qué devolverá la consulta?",
      opciones: ["Ninguna fila", "Una fila con un 0", "Un error"],
      correcta: 1,
      explicacion: "Ningún pedido pasa el filtro, pero COUNT **siempre** devuelve una fila: si no hay nada que contar, cuenta 0. Es justo lo que quieres en un informe: «Barcelona: 0 pedidos» es una respuesta; una tabla vacía, no."
    },
    {
      tipo: "arreglar",
      enunciado: "Elena quiere saber cuántos pedidos se pagaron con bizum. Esta consulta debería devolver ese número en una columna `pedidos_bizum`, pero dice que hay 0, y Elena sabe que no es verdad. Arréglala.",
      inicial: `SELECT COUNT(*) AS pedidos_bizum
FROM pedidos
WHERE metodo_pago = 'Bizum';`,
      solucion: `SELECT COUNT(*) AS pedidos_bizum
FROM pedidos
WHERE metodo_pago = 'bizum';`,
      pistas: [
        "Un 0 que no te esperas suele ser un filtro que no encuentra nada. ¿Cómo está escrito el texto en la tabla?",
        "Los textos distinguen mayúsculas: cambia 'Bizum' por 'bizum'."
      ]
    },
    {
      tipo: "explicacion",
      titulo: "COUNT(columna) no cuenta los NULL",
      texto: "Si dentro de COUNT pones una **columna** en vez de `*`, cuenta solo las filas en las que esa columna **tiene dato**: los `NULL` se los salta.\nEn el ejemplo, `clientes` tiene 300 filas, pero `COUNT(ciudad)` da 290: hay 10 clientes de los que no sabemos la ciudad.\nVarios agregados pueden ir en el mismo `SELECT`, separados por comas: cada uno es una columna del resultado.",
      ejemplo: `SELECT COUNT(*) AS clientes,
  COUNT(ciudad) AS con_ciudad
FROM clientes;`,
      consejo: "Comparar `COUNT(*)` con `COUNT(columna)` es la forma más rápida de saber cuántos huecos tiene una columna. Lo hago siempre con una tabla nueva antes de analizarla."
    },
    {
      tipo: "quiz",
      pregunta: "Casi ningún pedido lleva nota del cliente. ¿Qué cuenta `SELECT COUNT(nota) FROM pedidos;`?",
      opciones: ["Todos los pedidos", "Solo los pedidos que tienen nota", "Solo los pedidos sin nota"],
      correcta: 1,
      explicacion: "`COUNT(nota)` se salta las filas donde `nota` es NULL, así que cuenta los pedidos **con** nota. Para contar todos, `COUNT(*)`; para contar los que no tienen, `WHERE nota IS NULL` y `COUNT(*)`."
    },
    {
      tipo: "interpretar",
      pregunta: "Elena quiere hacer una campaña por teléfono. ¿Cuántos clientes **tienen teléfono**? Escribe solo el número.",
      respuesta: 260,
      tolerancia: 0,
      pistas: [
        "Cuenta la columna `telefono`: COUNT se saltará los clientes que no lo tienen.",
        "SELECT COUNT(telefono) FROM clientes;"
      ],
      solucion: `SELECT COUNT(telefono) AS con_telefono
FROM clientes;`
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "Primera cifra para el comité: **¿cuántos pedidos ha recibido la tienda online** (`tienda_id` 5)? Una sola columna llamada `pedidos_online`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene una sola columna llamada pedidos_online", prueba: (r) => PRUEBA.columnas(r, ["pedidos_online"]) },
        { texto: "Devuelve una sola fila", prueba: (r) => (r?.filas?.length ?? 0) === 1 },
        { texto: "Cuenta bien los pedidos de la tienda online", prueba: (r) => PRUEBA.valor(r, 0, "pedidos_online") === 1527 },
        { texto: "Lo cuenta con COUNT (no vale escribir el número a mano)", prueba: () => /\b(count|sum)\s*\(/i.test(PRUEBA.codigo()) && /\bfrom\s+pedidos\b/i.test(PRUEBA.codigo()) }
      ],
      pistas: [
        "Filtra los pedidos con `WHERE tienda_id = 5` y cuenta las filas que quedan con `COUNT(*)`. No olvides el alias.",
        "SELECT COUNT(*) AS pedidos_online FROM pedidos WHERE tienda_id = 5;"
      ],
      solucion: `SELECT COUNT(*) AS pedidos_online
FROM pedidos
WHERE tienda_id = 5;`
    }
  ]
});
