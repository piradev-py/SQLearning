CURSO.registrar({
  id: "e3-05",
  titulo: "Agrupar: GROUP BY",
  xp: 35,
  objetivo: "Sabrás resumir una tabla en una fila por grupo con GROUP BY, entenderás por qué cada columna debe estar agrupada o dentro de un agregado y verás tu primer resultado como gráfico.",
  pasos: [
    {
      tipo: "historia",
      de: "elena",
      asunto: "Cinco tiendas, una consulta",
      texto: "El jueves tengo comité y quiero llevar **cuántos pedidos tiene cada tienda**.\nYa sé que me sacas el total con `COUNT(*)`, pero no me apetece que escribas cinco consultas con `WHERE tienda_id = 1`, `= 2`, `= 3`… y las copies a mano en una tabla.\n¿No hay forma de pedirle todas las tiendas de una vez? Lo necesito para ayer, como siempre."
    },
    {
      tipo: "explicacion",
      titulo: "GROUP BY: una fila por grupo",
      texto: "Imagina que repartes las fichas de pedidos en **montones**, uno por tienda, y cuentas cada montón. Eso hace **GROUP BY**: junta las filas que tienen el mismo valor en una columna y calcula los agregados (`COUNT`, `SUM`, `AVG`…) **para cada montón**.\nEl resultado tiene **una fila por grupo**. Va después de `FROM` (y de `WHERE`, si lo hay) y antes de `ORDER BY`.\nFíjate: la tienda 6, Barcelona, no sale. Aún no tiene pedidos, y GROUP BY solo crea grupos con las filas que existen.",
      ejemplo: `SELECT tienda_id, COUNT(*) AS pedidos
FROM pedidos
GROUP BY tienda_id
ORDER BY tienda_id;`,
      consejo: "Pon siempre la columna por la que agrupas también en el `SELECT`. Si no, te salen cinco números sueltos y nadie sabe a qué tienda corresponde cada uno."
    },
    {
      tipo: "explicacion",
      titulo: "Tu primer gráfico",
      texto: "Un resultado agrupado se entiende mejor dibujado. Ejecuta el ejemplo: se abre la pestaña **Gráfico**, junto a **Resultado**. Puedes cambiar de una a otra cuando quieras.\nLa regla es sencilla: la **primera columna** son las etiquetas (aquí, las tiendas) y las columnas **numéricas** que vienen detrás son los valores. Las barras salen en el orden de las filas, así que tu `ORDER BY` se ve en el dibujo.\nLa tienda online, con 1 527 pedidos, se come el gráfico: más que todas las físicas juntas.",
      ejemplo: `SELECT tienda_id, COUNT(*) AS pedidos
FROM pedidos
GROUP BY tienda_id
ORDER BY pedidos DESC;`,
      grafico: true,
      consejo: "En un comité, un gráfico de barras ordenado de mayor a menor se lee en dos segundos. La misma tabla de números necesita un minuto y una calculadora."
    },
    {
      tipo: "ejercicio",
      enunciado: "Elena también quiere saber cómo están los pedidos. Muestra cuántos pedidos hay en cada **estado**: las columnas `estado` y `pedidos` (el recuento, con ese alias). El orden da igual.",
      solucion: `SELECT estado, COUNT(*) AS pedidos
FROM pedidos
GROUP BY estado;`,
      grafico: true,
      pistas: [
        "Igual que el ejemplo de las tiendas, pero agrupando por `estado`. No olvides el alias `AS pedidos`.",
        "SELECT estado, COUNT(*) AS pedidos FROM pedidos GROUP BY estado;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `SELECT metodo_pago, COUNT(*) AS pedidos
FROM pedidos
GROUP BY metodo_pago;`,
      pregunta: "En Faro hay 2 524 pedidos y unos pocos métodos de pago distintos. ¿Cuántas filas devolverá esta consulta?",
      opciones: ["4", "2 524", "1"],
      correcta: 0,
      explicacion: "Una fila por grupo: hay 4 métodos de pago distintos, así que salen 4 filas, cada una con su recuento. Sin `GROUP BY`, `COUNT(*)` daría una sola fila con 2 524."
    },
    {
      tipo: "explicacion",
      titulo: "La regla de oro: agrupada o agregada",
      texto: "Cada columna del `SELECT` tiene que estar **en el GROUP BY** o **dentro de un agregado**. Piensa por qué: si agrupas por tienda y pides también `cliente_id`, el montón de Madrid tiene 429 pedidos de muchos clientes distintos. ¿Cuál de ellos pone PostgreSQL en esa única fila? No lo sabe, así que se niega:\n`la columna «pedidos.cliente_id» debe aparecer en la cláusula GROUP BY o ser usada en una función de agregación`\nEs el error **42803**. Tiene dos arreglos: meter la columna en un agregado (`SUM(total)`, `COUNT(…)`) o quitarla del `SELECT`.",
      otrosMotores: "MySQL, con su configuración antigua (sin `ONLY_FULL_GROUP_BY`), no da error: elige un valor cualquiera del grupo y te lo enseña como si nada. Es peor que un error, porque el número parece correcto. Las versiones modernas ya se comportan como PostgreSQL."
    },
    {
      tipo: "quiz",
      pregunta: "¿Cuál de estas consultas da el error 42803?",
      opciones: [
        "`SELECT estado, COUNT(*) AS pedidos FROM pedidos GROUP BY estado;`",
        "`SELECT estado, SUM(total) AS facturacion FROM pedidos GROUP BY estado;`",
        "`SELECT estado, metodo_pago, COUNT(*) AS pedidos FROM pedidos GROUP BY estado;`"
      ],
      correcta: 2,
      explicacion: "`metodo_pago` no está en el `GROUP BY` ni dentro de un agregado: en el montón de los entregados hay pedidos con tarjeta, con bizum… y PostgreSQL no sabe cuál poner. En las otras dos, `estado` está agrupada y lo demás va dentro de `COUNT` o `SUM`."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería devolver la **facturación por método de pago**: las columnas `metodo_pago` y `facturacion` (la suma de `total` de sus pedidos). Da el error 42803. Arréglala.",
      inicial: `SELECT metodo_pago, total AS facturacion
FROM pedidos
GROUP BY metodo_pago;`,
      solucion: `SELECT metodo_pago, SUM(total) AS facturacion
FROM pedidos
GROUP BY metodo_pago;`,
      pistas: [
        "`total` no está agrupada: cada método de pago tiene cientos de totales distintos. ¿Qué agregado los convierte en uno solo?",
        "Mete `total` dentro de `SUM`: SELECT metodo_pago, SUM(total) AS facturacion FROM pedidos GROUP BY metodo_pago;"
      ]
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "Ahora sí, lo del comité. Por cada tienda quiero `tienda_id`, `pedidos` (cuántos tiene) y `facturacion` (la suma de `total`), ordenadas de **mayor a menor facturación**. Ejecútala y mira el gráfico: sale un panel por cada medida.",
      inicial: "-- Escribe tu consulta aquí\n",
      grafico: true,
      comprobaciones: [
        { texto: "Tiene las columnas tienda_id, pedidos y facturacion", prueba: (r) => PRUEBA.columnas(r, ["tienda_id", "pedidos", "facturacion"]) },
        { texto: "Devuelve una fila por cada tienda con pedidos (5)", prueba: (r) => (r?.filas?.length ?? 0) === 5 },
        { texto: "Está ordenado de mayor a menor facturación", prueba: (r) => PRUEBA.ordenado(r, "facturacion", "desc") },
        { texto: "Los recuentos y las sumas son los de cada tienda", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT tienda_id, COUNT(*) AS pedidos, SUM(total) AS facturacion
FROM pedidos
GROUP BY tienda_id
ORDER BY facturacion DESC;`, { orden: false }) }
      ],
      pistas: [
        "Agrupa por `tienda_id` y pon dos agregados en el `SELECT`: `COUNT(*)` y `SUM(total)`, cada uno con su alias. Después, `ORDER BY facturacion DESC`.",
        "SELECT tienda_id, COUNT(*) AS pedidos, SUM(total) AS facturacion FROM pedidos GROUP BY tienda_id ORDER BY facturacion DESC;"
      ],
      solucion: `SELECT tienda_id, COUNT(*) AS pedidos, SUM(total) AS facturacion
FROM pedidos
GROUP BY tienda_id
ORDER BY facturacion DESC;`
    }
  ]
});
