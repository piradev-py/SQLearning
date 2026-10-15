CURSO.registrar({
  id: "e6-07",
  titulo: "Borrar: DELETE, TRUNCATE y DROP",
  xp: 35,
  objetivo: "Sabrás borrar filas con DELETE sin llevarte nada de más, ver lo borrado con RETURNING, distinguir DELETE, TRUNCATE y DROP TABLE y decidir cuándo es mejor no borrar y marcar como inactivo.",
  pasos: [
    {
      tipo: "historia",
      de: "nuria",
      asunto: "Limpieza del CRM, ahora sí",
      texto: "¿Te acuerdas de los **12 clientes `@antiguo.example`** del CRM, los que nunca pasaron al sistema nuevo? Entonces te dije que borrar no era cosa nuestra. Ahora estás en Sistemas e Iván me ha dado el visto bueno: fuera del CRM.\nEso sí: borrar es lo único que no tiene vuelta atrás. Quiero que borres **esos 12 y ni uno más**."
    },
    {
      tipo: "explicacion",
      titulo: "Primero el SELECT, después el DELETE",
      texto: "Para borrar filas: `DELETE FROM tabla WHERE condición;`. Se borran **las filas enteras** que cumplen el `WHERE` (no hay columnas que elegir).\nLa regla de oro es la misma que con `UPDATE`: **antes de borrar, mira qué vas a borrar**. Escribe un `SELECT` con el mismo `WHERE`, comprueba las filas y solo entonces cambia `SELECT … FROM` por `DELETE FROM`.\nEjecuta el ejemplo: son los 12 clientes antiguos, con el email normalizado como en la etapa anterior.",
      ejemplo: `SELECT crm_id, nombre, email
FROM crm_clientes
WHERE lower(trim(email)) LIKE '%@antiguo.example'
ORDER BY crm_id;`,
      consejo: "En el trabajo real, el `SELECT` previo se guarda junto al `DELETE` en el ticket: si mañana alguien pregunta qué se borró y por qué, ahí está la respuesta."
    },
    {
      tipo: "explicacion",
      titulo: "Borrar y ver lo que se ha ido: RETURNING",
      texto: "Ahora sí, el `DELETE`. Fíjate en que el `WHERE` es **idéntico** al del `SELECT` anterior.\nComo con `UPDATE`, puedes añadir `RETURNING columnas` al final: el `DELETE` te devuelve las filas que acaba de borrar, como si fuera un `SELECT`. Sin `RETURNING`, solo verías «La consulta ha cambiado 12 filas».\nEl ejemplo borra y después cuenta lo que queda en la **misma ejecución**: 332 − 12 = **320**. Recuerda que es el entorno de pruebas: al terminar, los 12 vuelven.",
      ejemplo: `DELETE FROM crm_clientes
WHERE lower(trim(email)) LIKE '%@antiguo.example';
SELECT COUNT(*) AS quedan
FROM crm_clientes;`
    },
    {
      tipo: "ejercicio",
      enunciado: "Borra del CRM los 12 clientes cuyo email normalizado (`lower(trim(email))`) termina en `@antiguo.example`, y añade `RETURNING crm_id, email` para ver qué se ha borrado. Una sola orden.",
      solucion: `DELETE FROM crm_clientes
WHERE lower(trim(email)) LIKE '%@antiguo.example'
RETURNING crm_id, email;`,
      verificar: `SELECT crm_id FROM crm_clientes ORDER BY crm_id;`,
      pistas: [
        "`DELETE FROM crm_clientes WHERE …` con el mismo `WHERE` del ejemplo, y `RETURNING crm_id, email` justo antes del `;`.",
        "DELETE FROM crm_clientes WHERE lower(trim(email)) LIKE '%@antiguo.example' RETURNING crm_id, email;"
      ]
    },
    {
      tipo: "prediccion",
      consulta: `DELETE FROM crm_clientes;`,
      pregunta: "Alguien escribe este `DELETE` con prisa y se le olvida el `WHERE`. ¿Cuántas filas borra?",
      opciones: ["Ninguna: sin `WHERE` da error", "12, las de los clientes antiguos", "332: todo el CRM"],
      correcta: 2,
      explicacion: "**332**: sin `WHERE` no hay filtro, así que borra **todas** las filas. No da error ni pide confirmación. La tabla sigue existiendo, pero vacía. Por eso el `SELECT` previo no es opcional: es tu cinturón de seguridad."
    },
    {
      tipo: "explicacion",
      titulo: "Lo que otros usan no se borra",
      texto: "En e6-05 viste que una clave foránea protege en los dos sentidos. Aquí se nota: si intentas `DELETE FROM empleados WHERE id = 22;` la base responde con el error **23503**, porque Rubén Ortega tiene una **cuenta** y una **ficha de RR. HH.** que apuntan a él.\nEl ejemplo enseña quién depende de ese empleado. Cámbialo por el `DELETE` y mira el error: no es un fallo, es la base evitando que queden filas huérfanas.",
      ejemplo: `SELECT 'cuentas' AS tabla, COUNT(*) AS filas
FROM cuentas
WHERE empleado_id = 22
UNION ALL
SELECT 'fichas_empleados', COUNT(*)
FROM fichas_empleados
WHERE empleado_id = 22;`
    },
    {
      tipo: "explicacion",
      titulo: "DELETE, TRUNCATE y DROP TABLE",
      texto: "Tres formas de «borrar» que no son lo mismo:\n- `DELETE FROM tabla WHERE …;` quita **las filas que eliges**.\n- `TRUNCATE tabla;` vacía **toda** la tabla de golpe. No admite `WHERE` y es mucho más rápido que un `DELETE` sin `WHERE` en tablas enormes. La tabla sigue ahí, vacía.\n- `DROP TABLE tabla;` hace desaparecer **la tabla entera**: filas, columnas y reglas.\nEl ejemplo copia `stock_tiendas`, la vacía y cuenta: 0 filas. Cambia `TRUNCATE copia_stock;` por `DROP TABLE copia_stock;` y el `SELECT` fallará: la tabla ya no existe.",
      ejemplo: `CREATE TABLE copia_stock AS
SELECT * FROM stock_tiendas;
TRUNCATE copia_stock;
SELECT COUNT(*) AS filas
FROM copia_stock;`,
      otrosMotores: "En MySQL y Oracle, `TRUNCATE` y `DROP` se confirman solos al instante: un `ROLLBACK` posterior **no** los deshace. En PostgreSQL y SQL Server sí se pueden deshacer si van dentro de una transacción."
    },
    {
      tipo: "explicacion",
      titulo: "Borrado lógico: marcar en vez de borrar",
      texto: "Muchas veces lo mejor es **no borrar**. Mira `cuentas`: cuando alguien deja de usar una cuenta, no se elimina; se pone `activa = false`. Es un **borrado lógico**: la fila sigue, pero se trata como dada de baja.\n¿Por qué? Porque la `auditoria` guarda qué usuario hizo cada cambio. Si borraras la cuenta, perderías de quién era ese historial (y la clave foránea ni siquiera te dejaría).\nEl ejemplo muestra las cuentas dadas de baja de esta forma.",
      ejemplo: `SELECT usuario, rol, creada, activa
FROM cuentas
WHERE NOT activa
ORDER BY usuario;`,
      consejo: "Ante la duda, marca en lugar de borrar. Un dato marcado se puede «recuperar» con un `UPDATE`; uno borrado solo vuelve si hay copia de seguridad (y alguien se acuerda de restaurarla)."
    },
    {
      tipo: "clasificar",
      enunciado: "Iván te pasa varias peticiones de la semana. Coloca cada una en la orden que usarías.",
      grupos: ["DELETE … WHERE", "TRUNCATE", "DROP TABLE", "Marcar como inactivo (UPDATE)"],
      elementos: [
        { texto: "Quitar del CRM las 12 fichas de clientes antiguos que nunca se migraron", grupo: "DELETE … WHERE" },
        { texto: "Quitar una fila de prueba que metiste por error en stock_tiendas", grupo: "DELETE … WHERE" },
        { texto: "Vaciar la tabla carga_diaria antes de volver a llenarla esta noche", grupo: "TRUNCATE" },
        { texto: "Dejar vacía tareas_apertura cuando Barcelona abra, pero conservarla para la próxima tienda", grupo: "TRUNCATE" },
        { texto: "Eliminar la tabla copia_stock que creaste el mes pasado y ya no usa nadie", grupo: "DROP TABLE" },
        { texto: "Un empleado deja Faro: su cuenta no debe entrar más, pero su historial debe seguir", grupo: "Marcar como inactivo (UPDATE)" },
        { texto: "Un producto deja de venderse, pero sus ventas pasadas deben seguir en los informes", grupo: "Marcar como inactivo (UPDATE)" }
      ],
      pistas: [
        "Pregúntate: ¿quiero quitar algunas filas, todas las filas, la tabla entera… o en realidad quiero conservar la historia?",
        "Lo que tiene historia que conservar (cuentas, productos vendidos) se marca como inactivo; las dos tablas que se vacían pero se siguen usando, TRUNCATE; la copia que sobra, DROP TABLE."
      ]
    },
    {
      tipo: "reto",
      varias: true,
      de: "nuria",
      enunciado: "Las dos fichas con fecha de alta imposible, **crm_id 31** (`1900-01-01`) y **crm_id 122** (`31/12/2099`), eran pruebas del programa viejo. Bórralas con un solo `DELETE` que termine en `RETURNING crm_id, fecha_alta`, para que veamos lo que se ha ido.",
      inicial: "-- Primero ejecuta el SELECT para ver las dos fichas; después cámbialo por el DELETE\n",
      comprobaciones: [
        { texto: "Devuelve las 2 fichas borradas, con las columnas crm_id y fecha_alta", prueba: (r) => PRUEBA.columnas(r, ["crm_id", "fecha_alta"]) && (r?.filas?.length ?? 0) === 2 },
        { texto: "Las fichas 31 y 122 ya no están en el CRM", prueba: async (r, db) => {
          const c = await db.consulta(`SELECT COUNT(*) FROM crm_clientes WHERE crm_id IN (31, 122);`);
          return Number(c?.filas?.[0]?.[0] ?? -1) === 0;
        } },
        { texto: "No se ha borrado nada más: quedan 330 fichas", prueba: async (r, db) => {
          const c = await db.consulta(`SELECT COUNT(*) FROM crm_clientes;`);
          return Number(c?.filas?.[0]?.[0] ?? -1) === 330;
        } }
      ],
      pistas: [
        "Comprueba antes con `SELECT crm_id, fecha_alta FROM crm_clientes WHERE crm_id IN (31, 122);` y después cambia el principio por `DELETE FROM crm_clientes`, añadiendo el `RETURNING` al final.",
        "DELETE FROM crm_clientes WHERE crm_id IN (31, 122) RETURNING crm_id, fecha_alta;"
      ],
      solucion: `DELETE FROM crm_clientes
WHERE crm_id IN (31, 122)
RETURNING crm_id, fecha_alta;`
    }
  ]
});
