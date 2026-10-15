(function () {
  // Primera celda de una consulta interna, como texto ("" si no hay)
  const texto = async (db, sql) => {
    const r = await db.consulta(sql);
    return String(r?.filas?.[0]?.[0] ?? "");
  };

  CURSO.registrar({
    id: "e6-06",
    titulo: "Cambiar datos: UPDATE",
    xp: 40,
    objetivo: "Sabrás cambiar valores de filas que ya existen con UPDATE … SET … WHERE, usar valores calculados, comprobar antes con un SELECT qué filas vas a tocar y ver lo cambiado con RETURNING.",
    pasos: [
      {
        tipo: "historia",
        de: "nuria",
        asunto: "Ahora sí: guardar lo limpio",
        texto: "Hola de nuevo. En migración aprendiste a **limpiar** el CRM con consultas, pero solo lo mirábamos: la tabla `crm_clientes` sigue igual de sucia.\nIván por fin me deja **guardar** lo limpio. Empezamos por los emails. Y me ha dado una condición: nada de cambios a ciegas."
      },
      {
        tipo: "explicacion",
        titulo: "UPDATE … SET … WHERE",
        texto: "`UPDATE` cambia valores de filas que ya existen:\n`UPDATE tabla SET columna = nuevo_valor WHERE condición;`\n- `SET` dice qué columna cambia y a qué. El valor puede ser **calculado** a partir del actual: `SET email = lower(trim(email))`, `SET precio = precio * 1.05`.\n- Para cambiar varias columnas, sepáralas con comas: `SET ciudad = 'Madrid', cp = '28001'`.\n- `WHERE` elige las filas, igual que en un `SELECT`.\nCon `RETURNING` ves cómo han quedado. El ejemplo limpia el email del cliente 2:",
        ejemplo: `UPDATE crm_clientes
SET email = lower(trim(email))
WHERE crm_id = 2
RETURNING crm_id, email;`,
        otrosMotores: "`UPDATE … SET … WHERE` es igual en todos los motores. SQL Server usa `OUTPUT inserted.*` en vez de `RETURNING`. BigQuery exige siempre un `WHERE` (si quieres todas las filas, `WHERE true`)."
      },
      {
        tipo: "explicacion",
        titulo: "La regla de oro: primero el SELECT",
        texto: "Antes de un `UPDATE`, ejecuta un **`SELECT` con el mismo `WHERE`**: ves exactamente qué filas vas a tocar y cómo quedarían. Si el `SELECT` devuelve lo que esperas, cambias `SELECT … FROM` por `UPDATE … SET` y ejecutas.\nEl ejemplo muestra los emails que cambiarían: los que no son iguales a su versión limpia.\nCuando ejecutes un `UPDATE` sin `RETURNING`, el resultado dirá «La consulta ha cambiado N filas». Compara esa N con las filas del `SELECT`: deben coincidir.",
        ejemplo: `SELECT crm_id, email, lower(trim(email)) AS email_limpio
FROM crm_clientes
WHERE email <> lower(trim(email))
ORDER BY crm_id;`,
        consejo: "Es la costumbre que más disgustos ahorra en este oficio. Un UPDATE mal filtrado no avisa: cambia lo que le pides, aunque no sea lo que querías."
      },
      {
        tipo: "prediccion",
        consulta: `UPDATE stock_tiendas
SET unidades = unidades + 5
WHERE tienda_id = 1;`,
        pregunta: "Madrid recibe 5 unidades más de cada producto. ¿Cuántas filas cambia este UPDATE?",
        opciones: ["1", "36", "144"],
        correcta: 1,
        explicacion: "El `WHERE` deja solo las filas de Madrid (tienda 1): una por cada uno de sus **36** productos. Las otras 108 filas de `stock_tiendas` no se tocan."
      },
      {
        tipo: "ejercicio",
        varias: true,
        enunciado: "Guarda los emails limpios: cambia `email` a `lower(trim(email))` **solo en las filas donde cambie algo** (`email <> lower(trim(email))`).",
        solucion: `UPDATE crm_clientes
SET email = lower(trim(email))
WHERE email <> lower(trim(email));`,
        verificar: `SELECT crm_id, email
FROM crm_clientes
ORDER BY crm_id;`,
        pistas: [
          "Es el ejemplo de la regla de oro convertido en UPDATE: el mismo `WHERE`, y `SET email = lower(trim(email))`.",
          "UPDATE crm_clientes SET email = lower(trim(email)) WHERE email <> lower(trim(email));"
        ]
      },
      {
        tipo: "prediccion",
        consulta: `UPDATE crm_clientes
SET socio = 'S';`,
        pregunta: "Alguien quiere marcar como socio a **un** cliente y se le olvida el `WHERE`. ¿Cuántas filas cambia?",
        opciones: ["0", "1", "332"],
        correcta: 2,
        explicacion: "Sin `WHERE`, el `UPDATE` cambia **todas** las filas: las 332 del CRM. Aquí se deshace sola; en producción habría que recuperar una copia. Por eso: primero el `SELECT`."
      },
      {
        tipo: "arreglar",
        enunciado: "Nuria quiere poner `ciudad` = **'Sin ciudad'** en los clientes que no tienen ciudad (`NULL`). Este UPDATE no da error, pero no cambia ninguna fila. Arréglalo.",
        inicial: `UPDATE crm_clientes
SET ciudad = 'Sin ciudad'
WHERE ciudad = NULL;`,
        solucion: `UPDATE crm_clientes
SET ciudad = 'Sin ciudad'
WHERE ciudad IS NULL;`,
        verificar: `SELECT crm_id, ciudad
FROM crm_clientes
ORDER BY crm_id;`,
        pistas: [
          "Comparar con `= NULL` nunca da verdadero: `NULL` es «desconocido». ¿Cómo se pregunta si algo está vacío?",
          "Cambia `WHERE ciudad = NULL` por `WHERE ciudad IS NULL`."
        ]
      },
      {
        tipo: "quiz",
        pregunta: "Madrid tiene productos con 0 unidades. ¿Qué pasa con `UPDATE stock_tiendas SET unidades = unidades - 5 WHERE tienda_id = 1;`?",
        opciones: [
          "Cambian las filas que se quedan en 0 o más y las otras se saltan",
          "Falla entero con el error 23514 y no cambia ninguna fila",
          "Las filas que bajarían de 0 se quedan en 0"
        ],
        correcta: 1,
        explicacion: "La regla `CHECK (unidades >= 0)` rechaza las filas que quedarían en negativo, y un `UPDATE` es **todo o nada**: si una sola fila falla, no se cambia ninguna. Ni a medias ni con arreglos por su cuenta."
      },
      {
        tipo: "interpretar",
        pregunta: "Nuria quiere dejar las ciudades del CRM como `initcap(trim(ciudad))` (sin espacios de más y con mayúscula inicial), pero solo en las filas donde eso cambie algo. Antes de tocar nada: ¿cuántas filas cambiaría?",
        respuesta: 126,
        pistas: [
          "Regla de oro: cuenta con un `SELECT` las filas donde `ciudad <> initcap(trim(ciudad))`.",
          "SELECT COUNT(*) FROM crm_clientes WHERE ciudad <> initcap(trim(ciudad));"
        ],
        solucion: `SELECT COUNT(*)
FROM crm_clientes
WHERE ciudad <> initcap(trim(ciudad));`
      },
      {
        tipo: "reto",
        de: "nuria",
        varias: true,
        enunciado: "Guarda las ciudades limpias: cambia `ciudad` a `initcap(trim(ciudad))` **solo en las filas donde cambie algo**. Las vacías (`''`) y las `NULL` se quedan como están. En la misma ejecución, termina con `SELECT ciudad, COUNT(*) AS clientes FROM crm_clientes GROUP BY ciudad ORDER BY ciudad;`.",
        inicial: "-- Escribe tu consulta aquí\n",
        comprobaciones: [
          { texto: "Las ciudades quedan limpias: 9 ciudades más las vacías y las NULL, con sus clientes",
            prueba: async (r, db) => PRUEBA.igualA(await db.consulta(`SELECT ciudad, COUNT(*) FROM crm_clientes GROUP BY ciudad;`), db,
              `VALUES ('Madrid', 93), ('Sevilla', 48), ('Valencia', 45), ('Bilbao', 36), ('Valladolid', 28), ('Barcelona', 24), ('Zaragoza', 20), ('Málaga', 18), ('Getafe', 9), ('', 4), (NULL, 7);`,
              { nombres: false }) },
          { texto: "Solo has cambiado las 126 filas que lo necesitaban",
            prueba: async (r, db) => (await texto(db, `SELECT COUNT(*) FROM crm_clientes WHERE xmin::text <> (SELECT xmin::text FROM crm_clientes GROUP BY 1 ORDER BY COUNT(*) DESC LIMIT 1);`)) === "126" },
          { texto: "Termina mostrando ciudad y clientes, una fila por ciudad",
            prueba: (r) => PRUEBA.columnas(r, ["ciudad", "clientes"]) && (r?.filas?.length ?? 0) === 11 }
        ],
        pistas: [
          "Igual que con los emails: `SET ciudad = initcap(trim(ciudad))` y un `WHERE` que deje solo las filas donde el valor limpio es distinto del actual.",
          "UPDATE crm_clientes SET ciudad = initcap(trim(ciudad)) WHERE ciudad <> initcap(trim(ciudad)); SELECT ciudad, COUNT(*) AS clientes FROM crm_clientes GROUP BY ciudad ORDER BY ciudad;"
        ],
        solucion: `UPDATE crm_clientes
SET ciudad = initcap(trim(ciudad))
WHERE ciudad <> initcap(trim(ciudad));

SELECT ciudad, COUNT(*) AS clientes
FROM crm_clientes
GROUP BY ciudad
ORDER BY ciudad;`
      }
    ]
  });
})();
