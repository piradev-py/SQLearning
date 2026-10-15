CURSO.registrar({
  id: "e6-08",
  titulo: "Todo o nada: transacciones",
  xp: 45,
  objetivo: "Sabrás agrupar varias órdenes en una transacción con BEGIN, COMMIT y ROLLBACK, entender por qué una operación es «todo o nada» (ACID) y deshacer solo una parte con SAVEPOINT.",
  pasos: [
    {
      tipo: "historia",
      de: "ivan",
      asunto: "Traspasos a Barcelona",
      texto: "Barcelona abre y le faltan cosas. Las tiendas le van a **traspasar unidades**: se restan en una tienda y se suman en Barcelona.\nSon dos órdenes. Si la primera funciona y la segunda falla, las unidades **desaparecen**: ni en una tienda ni en la otra. Eso en producción no pasa. O se hacen las dos, o ninguna."
    },
    {
      tipo: "explicacion",
      titulo: "BEGIN, COMMIT y ROLLBACK",
      texto: "Una **transacción** es un grupo de órdenes que la base trata como **una sola**.\n- `BEGIN;` la abre.\n- `COMMIT;` la **confirma**: todo lo hecho se guarda a la vez.\n- `ROLLBACK;` la **deshace**: todo vuelve a como estaba al `BEGIN`.\nHasta el `COMMIT`, los demás usuarios no ven tus cambios.\nUn secreto: el entorno de pruebas **ya es una transacción** que acaba en `ROLLBACK`; por eso todo se deshace solo. Si escribes `COMMIT`, el entorno lo nota y recarga los datos originales al terminar (tarda un poco, pero funciona).",
      ejemplo: `BEGIN;
UPDATE stock_tiendas
SET unidades = unidades - 4
WHERE tienda_id = 1 AND producto_id = 2;
INSERT INTO stock_tiendas (tienda_id, producto_id, unidades)
VALUES (6, 2, 4);
COMMIT;
SELECT tienda_id, unidades
FROM stock_tiendas
WHERE producto_id = 2
ORDER BY tienda_id;`,
      otrosMotores: "En SQL Server se escribe `BEGIN TRANSACTION;` y en MySQL `START TRANSACTION;` (PostgreSQL también acepta esta última). `COMMIT` y `ROLLBACK` son iguales en todos."
    },
    {
      tipo: "prediccion",
      consulta: `BEGIN;
DELETE FROM stock_tiendas;
ROLLBACK;
SELECT COUNT(*) AS filas
FROM stock_tiendas;`,
      pregunta: "`stock_tiendas` tiene 144 filas. Alguien abre una transacción, borra todo… y se arrepiente. ¿Cuántas filas cuenta el `SELECT` final?",
      opciones: ["0", "144", "Da error: lo borrado no se puede recuperar"],
      correcta: 1,
      explicacion: "**144**. El `ROLLBACK` deshace todo lo que pasó desde el `BEGIN`, también un `DELETE` sin `WHERE`. Es la red de seguridad de los administradores: hacer los cambios peligrosos dentro de una transacción, mirar el resultado y solo entonces decidir entre `COMMIT` y `ROLLBACK`."
    },
    {
      tipo: "explicacion",
      titulo: "Si una falla, no se queda ninguna",
      texto: "Imagina el traspaso con un error en la segunda orden: `BEGIN;` + un `UPDATE` que funciona + un `INSERT` con `unidades = -1`, que rompe el `CHECK (unidades >= 0)`.\nEl `INSERT` falla y la transacción queda **abortada**: cualquier orden que escribas después responde «transacción abortada» hasta que hagas `ROLLBACK`. Y aunque escribas `COMMIT`, PostgreSQL hace un `ROLLBACK`: el `UPDATE` que sí funcionó **tampoco se queda**.\nEso es la **atomicidad**: la transacción es un átomo, no se parte. Aquí lo notarás porque, si una orden falla, la ejecución entera se detiene con el error y no cambia nada.",
      consejo: "En una herramienta real (DBeaver, pgAdmin, psql), si ves «current transaction is aborted», no sigas escribiendo órdenes: haz `ROLLBACK`, corrige el error y vuelve a empezar desde el `BEGIN`."
    },
    {
      tipo: "quiz",
      pregunta: "Dentro de un `BEGIN … COMMIT` metes una fila válida en `stock_tiendas` y después otra con `unidades = -1`. ¿Qué queda guardado?",
      opciones: [
        "La primera fila: lo que funcionó se guarda",
        "Nada: la segunda falla y la transacción entera se deshace",
        "Las dos, porque al final hay un COMMIT"
      ],
      correcta: 1,
      explicacion: "Todo o nada. Al fallar la segunda, la transacción queda abortada y el `COMMIT` se convierte en `ROLLBACK`: la primera fila tampoco se guarda."
    },
    {
      tipo: "explicacion",
      titulo: "ACID en cuatro frases",
      texto: "Las bases de datos serias prometen cuatro cosas con las transacciones, conocidas por sus iniciales en inglés, **ACID**:\n- **Atomicidad**: todo o nada.\n- **Consistencia**: al terminar, las reglas (`CHECK`, claves, `NOT NULL`) se siguen cumpliendo.\n- **Aislamiento**: nadie ve tus cambios a medias; los demás ven el antes o el después.\n- **Durabilidad**: lo confirmado con `COMMIT` no se pierde, aunque se vaya la luz un segundo después.\nGracias a eso, un traspaso nunca deja unidades «en el aire»."
    },
    {
      tipo: "explicacion",
      titulo: "Deshacer solo una parte: SAVEPOINT",
      texto: "A veces no quieres deshacerlo todo, solo el último paso. Un **punto de guardado** marca un momento dentro de la transacción:\n- `SAVEPOINT nombre;` pone la marca.\n- `ROLLBACK TO nombre;` vuelve a esa marca y deshace solo lo que vino después. La transacción sigue abierta.\nEn el ejemplo, Barcelona recibe dos productos, pero el segundo era un error: se deshace con `ROLLBACK TO` y solo se confirma el primero. Resultado: **una** fila.",
      ejemplo: `BEGIN;
INSERT INTO stock_tiendas (tienda_id, producto_id, unidades)
VALUES (6, 1, 10);
SAVEPOINT primer_producto;
INSERT INTO stock_tiendas (tienda_id, producto_id, unidades)
VALUES (6, 3, 10);
ROLLBACK TO primer_producto;
COMMIT;
SELECT tienda_id, producto_id, unidades
FROM stock_tiendas
WHERE tienda_id = 6;`,
      otrosMotores: "En SQL Server se escribe `SAVE TRANSACTION nombre;` y `ROLLBACK TRANSACTION nombre;`."
    },
    {
      tipo: "arreglar",
      enunciado: "Este traspaso de **Monitores Nexo 27\" 4K** (producto 4) de Madrid a Barcelona falla: pide 5 unidades y Madrid solo tiene **3**, así que el `CHECK` lo para todo. Arréglalo para traspasar las **3** que hay (Madrid se queda a 0 y Barcelona recibe 3), sin quitar la transacción.",
      inicial: `BEGIN;
UPDATE stock_tiendas
SET unidades = unidades - 5
WHERE tienda_id = 1 AND producto_id = 4;
INSERT INTO stock_tiendas (tienda_id, producto_id, unidades)
VALUES (6, 4, 5);
COMMIT;`,
      solucion: `BEGIN;
UPDATE stock_tiendas
SET unidades = unidades - 3
WHERE tienda_id = 1 AND producto_id = 4;
INSERT INTO stock_tiendas (tienda_id, producto_id, unidades)
VALUES (6, 4, 3);
COMMIT;`,
      varias: true,
      verificar: `SELECT tienda_id, unidades FROM stock_tiendas WHERE producto_id = 4 ORDER BY tienda_id;`,
      pistas: [
        "Hay que cambiar el número en **dos** sitios: lo que se resta en Madrid y lo que se mete en Barcelona.",
        "Cambia `unidades - 5` por `unidades - 3` y `VALUES (6, 4, 5)` por `VALUES (6, 4, 3)`."
      ]
    },
    {
      tipo: "reto",
      de: "ivan",
      enunciado: "Traspasa **5 unidades** del **Portátil Lumen 14** (producto 1) de **Madrid** (tienda 1) a **Barcelona** (tienda 6) en una transacción: `BEGIN`, un `UPDATE` que resta en Madrid, un `INSERT` que crea su fila en Barcelona (aún no tiene) y `COMMIT`. Termina con `SELECT tienda_id, unidades FROM stock_tiendas WHERE producto_id = 1 ORDER BY tienda_id;`.",
      inicial: "BEGIN;\n-- Resta en Madrid y suma en Barcelona\n\nCOMMIT;\n",
      varias: true,
      comprobaciones: [
        { texto: "Madrid se queda con 6 unidades del producto 1 (tenía 11)", prueba: async (r, db) => {
          const c = await db.consulta(`SELECT unidades FROM stock_tiendas WHERE tienda_id = 1 AND producto_id = 1;`);
          return Number(c?.filas?.[0]?.[0] ?? -1) === 6;
        } },
        { texto: "Barcelona tiene 5 unidades del producto 1", prueba: async (r, db) => {
          const c = await db.consulta(`SELECT unidades FROM stock_tiendas WHERE tienda_id = 6 AND producto_id = 1;`);
          return Number(c?.filas?.[0]?.[0] ?? -1) === 5;
        } },
        { texto: "No aparecen ni desaparecen unidades: el total sigue en 1648, ahora en 145 filas", prueba: async (r, db) => {
          const c = await db.consulta(`SELECT COUNT(*), SUM(unidades) FROM stock_tiendas;`);
          return Number(c?.filas?.[0]?.[0] ?? -1) === 145 && Number(c?.filas?.[0]?.[1] ?? -1) === 1648;
        } },
        { texto: "Lo haces dentro de una transacción (BEGIN … COMMIT)", prueba: () => /\bBEGIN\b/i.test(MOTOR.sinTextos(PRUEBA.codigo())) && /\bCOMMIT\b/i.test(MOTOR.sinTextos(PRUEBA.codigo())) }
      ],
      pistas: [
        "Copia la estructura del ejercicio anterior: `UPDATE stock_tiendas SET unidades = unidades - 5 WHERE tienda_id = 1 AND producto_id = 1;` y un `INSERT … VALUES (6, 1, 5);`, entre `BEGIN;` y `COMMIT;`. El `SELECT` va después del `COMMIT`.",
        "BEGIN; UPDATE stock_tiendas SET unidades = unidades - 5 WHERE tienda_id = 1 AND producto_id = 1; INSERT INTO stock_tiendas (tienda_id, producto_id, unidades) VALUES (6, 1, 5); COMMIT; SELECT tienda_id, unidades FROM stock_tiendas WHERE producto_id = 1 ORDER BY tienda_id;"
      ],
      solucion: `BEGIN;
UPDATE stock_tiendas
SET unidades = unidades - 5
WHERE tienda_id = 1 AND producto_id = 1;
INSERT INTO stock_tiendas (tienda_id, producto_id, unidades)
VALUES (6, 1, 5);
COMMIT;
SELECT tienda_id, unidades
FROM stock_tiendas
WHERE producto_id = 1
ORDER BY tienda_id;`
    }
  ]
});
