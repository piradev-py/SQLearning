CURSO.registrar({
  id: "e2-04",
  titulo: "Paréntesis y prioridad",
  xp: 35,
  objetivo: "Sabrás en qué orden se evalúan AND y OR y cómo usar paréntesis para que el filtro diga lo que quieres.",
  pasos: [
    {
      tipo: "historia",
      de: "marcos",
      asunto: "Mi lista tiene gente que no debería",
      texto: "Intenté hacerlo yo solo, lo prometo. Quería los pedidos **caros** (más de 1 000 €) que se **cancelaron o se reembolsaron**, para llamar a esos clientes uno a uno.\nEscribí `total > 1000 AND estado = 'cancelado' OR estado = 'reembolsado'`… y me salen reembolsos de menos de 50 €. ¿Qué he hecho mal?"
    },
    {
      tipo: "explicacion",
      titulo: "AND va antes que OR",
      texto: "Igual que en matemáticas la multiplicación va antes que la suma (`2 + 3 × 4 = 14`, no 20), en SQL **AND se evalúa antes que OR**.\nAsí que PostgreSQL leyó la consulta de Marcos como:\n`(total > 1000 AND estado = 'cancelado') OR estado = 'reembolsado'`\nEs decir: «los cancelados caros, **o** cualquier reembolsado», cueste lo que cueste. Por eso se le colaron reembolsos baratos.",
      consejo: "Aunque te sepas la prioridad, no confíes en ella: quien lea tu consulta después (o tú dentro de un mes) no tiene por qué saberla."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT id, tienda_id, metodo_pago, total
FROM pedidos
WHERE tienda_id = 1
  OR tienda_id = 3 AND metodo_pago = 'efectivo';`,
      pregunta: "Recordando que AND va antes que OR, ¿qué pedidos devuelve esta consulta? (Tienda 1 = Madrid, tienda 3 = Sevilla.)",
      opciones: [
        "Los pagados en efectivo en Madrid o en Sevilla",
        "Todos los de Madrid, y además los de Sevilla pagados en efectivo",
        "Ninguno: un pedido no puede ser de dos tiendas"
      ],
      correcta: 1,
      explicacion: "PostgreSQL agrupa primero el AND: `tienda_id = 1 OR (tienda_id = 3 AND metodo_pago = 'efectivo')`. Los de Madrid entran pagaran como pagaran; de Sevilla, solo los de efectivo. Si querías lo primero, faltan paréntesis."
    },
    {
      tipo: "explicacion",
      titulo: "Los paréntesis mandan",
      texto: "Lo que va entre **paréntesis** se evalúa primero, igual que en una operación de calculadora.\nEn el ejemplo, primero se decide si el pedido es de Madrid **o** de Sevilla, y después se exige que **además** se pagara en efectivo. Ahora sí: efectivo en cualquiera de las dos tiendas.\nCompara este resultado con el de la predicción: misma consulta, un par de paréntesis, otra respuesta.",
      ejemplo: `SELECT id, tienda_id, metodo_pago, total
FROM pedidos
WHERE (tienda_id = 1 OR tienda_id = 3)
  AND metodo_pago = 'efectivo';`,
      consejo: "Regla de la casa: **si mezclas AND y OR, pon paréntesis**. Siempre. Es el error que más informes equivocados ha mandado a dirección, y no da ningún aviso: la consulta funciona, solo que responde a otra pregunta."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta es la consulta de Marcos. Debería mostrar `id`, `estado` y `total` de los pedidos de **más de 1 000 €** que estén **cancelados o reembolsados**, pero devuelve de más. Arréglala.",
      inicial: `SELECT id, estado, total
FROM pedidos
WHERE total > 1000
  AND estado = 'cancelado'
  OR estado = 'reembolsado';`,
      solucion: `SELECT id, estado, total
FROM pedidos
WHERE total > 1000
  AND (estado = 'cancelado' OR estado = 'reembolsado');`,
      pistas: [
        "El `OR` tiene que resolverse antes que el `AND`. ¿Qué dos condiciones deberían ir juntas entre paréntesis?",
        "WHERE total > 1000 AND (estado = 'cancelado' OR estado = 'reembolsado');"
      ]
    },
    {
      tipo: "quiz",
      pregunta: "¿Cuál de estas condiciones equivale a «el estado **no** es ni entregado ni en camino»?",
      opciones: [
        "`NOT estado = 'entregado' OR estado = 'en camino'`",
        "`NOT (estado = 'entregado' OR estado = 'en camino')`",
        "`NOT (estado = 'entregado' AND estado = 'en camino')`"
      ],
      correcta: 1,
      explicacion: "El paréntesis agrupa «es entregado o en camino» y el `NOT` le da la vuelta entera. Sin paréntesis, el `NOT` solo afecta a la primera condición (dejaría pasar los que están en camino). La tercera es verdadera para todos los pedidos: ninguno tiene dos estados a la vez."
    },
    {
      tipo: "reto",
      de: "elena",
      enunciado: "Soy Elena, de ventas. Preparamos un evento para socios en las tiendas de Bilbao y Sevilla y Marcos me ha dicho que tú filtras como nadie.\nQuiero `nombre`, `email` y `ciudad` de los clientes de **Bilbao o Sevilla** que sean **socios**. Ordénalos por `ciudad` y, dentro de cada ciudad, por `nombre`.",
      inicial: `-- Cuidado: esta versión devuelve de más
SELECT nombre, email, ciudad
FROM clientes
WHERE ciudad = 'Bilbao' OR ciudad = 'Sevilla' AND socio = TRUE
ORDER BY ciudad, nombre;`,
      comprobaciones: [
        { texto: "Tiene las columnas nombre, email y ciudad", prueba: (r) => PRUEBA.columnas(r, ["nombre", "email", "ciudad"]) },
        { texto: "Solo salen clientes de Bilbao o Sevilla", prueba: (r) => { const i = (r?.columnas ?? []).findIndex(c => String(c).toLowerCase() === "ciudad"); return i >= 0 && (r?.filas?.length ?? 0) > 0 && r.filas.every(f => f[i] === "Bilbao" || f[i] === "Sevilla"); } },
        { texto: "Están todos los socios de esas dos ciudades y ningún cliente que no sea socio", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT nombre, email, ciudad
FROM clientes
WHERE (ciudad = 'Bilbao' OR ciudad = 'Sevilla')
  AND socio = TRUE;`, { orden: false }) },
        { texto: "Ordenados por ciudad y, dentro de cada ciudad, por nombre", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT nombre, email, ciudad
FROM clientes
WHERE (ciudad = 'Bilbao' OR ciudad = 'Sevilla')
  AND socio = TRUE
ORDER BY ciudad, nombre;`) }
      ],
      pistas: [
        "La consulta de partida tiene el mismo fallo que la de Marcos: el `AND` se come solo a Sevilla. Agrupa las dos ciudades entre paréntesis.",
        "SELECT nombre, email, ciudad FROM clientes WHERE (ciudad = 'Bilbao' OR ciudad = 'Sevilla') AND socio = TRUE ORDER BY ciudad, nombre;"
      ],
      solucion: `SELECT nombre, email, ciudad
FROM clientes
WHERE (ciudad = 'Bilbao' OR ciudad = 'Sevilla')
  AND socio = TRUE
ORDER BY ciudad, nombre;`
    }
  ]
});
