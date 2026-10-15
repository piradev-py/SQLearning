CURSO.registrar({
  id: "e6-12",
  titulo: "Caso: La cuenta admin_temp",
  xp: 75,
  objetivo: "Sabrás investigar un registro de auditoría combinando todo lo aprendido (filtros por hora, agrupaciones, JOIN) y cerrar un acceso peligroso con una transacción que deja constancia del cambio.",
  pasos: [
    {
      tipo: "historia",
      de: "ivan",
      asunto: "RE: Registro de auditoría",
      texto: "Lucía me pide la auditoría para saber **quién** hizo los cambios raros: los clientes de madrugada, los reembolsos, el −12.\nAhí la tienes. Cada cambio en clientes, pedidos, productos y cuentas queda apuntado: cuándo, con qué cuenta, qué fila y qué valor había antes y después.\nMira lo que quieras. **No tengo nada que esconder.**"
    },
    {
      tipo: "explicacion",
      titulo: "Cómo se lee una auditoría",
      texto: "Cada fila de `auditoria` es **un cambio**: `momento` (cuándo), `usuario` (la cuenta que lo hizo), `tabla` y `registro_id` (qué fila se tocó), `operacion` (`INSERT`, `UPDATE` o `DELETE`), `columna` y los valores `valor_antes` y `valor_despues` (como texto).\nEn un alta (`INSERT`) no hay columna ni valor anterior: `valor_despues` guarda el email del cliente nuevo. Para saber qué producto o pedido es cada `registro_id`, únelo con su tabla.",
      ejemplo: `SELECT *
FROM auditoria
ORDER BY id
LIMIT 5;`,
      consejo: "Una auditoría responde a «qué cuenta hizo qué y cuándo». Ojo con lo que **no** dice: quién estaba sentado delante del teclado. Con una cuenta compartida, esa pregunta queda abierta."
    },
    {
      tipo: "caso",
      de: "lucia",
      enunciado: "Sin prisas y sin acusar a nadie: primero los horarios, luego qué se tocó y cuánto dinero supone, después de quién es la cuenta. Y al final, cerramos la puerta.",
      partes: [
        {
          enunciado: "Los cambios raros eran de madrugada. Cuenta los cambios hechos **antes de las 6:00** (`EXTRACT(HOUR FROM momento) < 6`) por cuenta: columnas `usuario` y `cambios`, de **más a menos** cambios.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas usuario y cambios", prueba: (r) => PRUEBA.columnas(r, ["usuario", "cambios"]) },
            { texto: "La primera fila es admin_temp, con 85 cambios", prueba: (r) => PRUEBA.valor(r, 0, "usuario") === "admin_temp" && PRUEBA.valor(r, 0, "cambios") === 85 },
            { texto: "Cuenta los cambios de madrugada de cada cuenta, de más a menos", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT usuario, COUNT(*) AS cambios
FROM auditoria
WHERE EXTRACT(HOUR FROM momento) < 6
GROUP BY usuario
ORDER BY cambios DESC;`) }
          ],
          pistas: [
            "`WHERE EXTRACT(HOUR FROM momento) < 6`, `GROUP BY usuario` y `ORDER BY cambios DESC`.",
            "SELECT usuario, COUNT(*) AS cambios FROM auditoria WHERE EXTRACT(HOUR FROM momento) < 6 GROUP BY usuario ORDER BY cambios DESC;"
          ],
          solucion: `SELECT usuario, COUNT(*) AS cambios
FROM auditoria
WHERE EXTRACT(HOUR FROM momento) < 6
GROUP BY usuario
ORDER BY cambios DESC;`
        },
        {
          tipo: "interpretar",
          pregunta: "Los 10 cambios nocturnos de `app_web` son clientes que se registraron por la web de noche: normal. ¿Qué cuenta hace **todo lo demás** de madrugada? Escribe su nombre de usuario.",
          respuesta: ["admin_temp", "admin temp"],
          pistas: [
            "Es la primera fila de la parte anterior.",
            "Es admin_temp, con 85 cambios de madrugada."
          ],
          solucion: `SELECT usuario
FROM auditoria
WHERE EXTRACT(HOUR FROM momento) < 6
GROUP BY usuario
ORDER BY COUNT(*) DESC
LIMIT 1;`
        },
        {
          enunciado: "¿Qué tocó `admin_temp`? Cuenta sus cambios por `tabla` y `columna`: columnas `tabla`, `columna` y `cambios`, de **más a menos** cambios.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas tabla, columna y cambios", prueba: (r) => PRUEBA.columnas(r, ["tabla", "columna", "cambios"]) },
            { texto: "Salen 4 grupos que suman sus 85 cambios", prueba: (r) => {
              const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "cambios");
              const suma = (r?.filas || []).reduce((s, f) => s + Number(f?.[i] ?? 0), 0);
              return i >= 0 && (r?.filas?.length ?? 0) === 4 && suma === 85;
            } },
            { texto: "Cada tabla y columna con sus cambios, de más a menos", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT tabla, columna, COUNT(*) AS cambios
FROM auditoria
WHERE usuario = 'admin_temp'
GROUP BY tabla, columna
ORDER BY cambios DESC;`) }
          ],
          pistas: [
            "`WHERE usuario = 'admin_temp'` y agrupa por las dos columnas: `GROUP BY tabla, columna`.",
            "SELECT tabla, columna, COUNT(*) AS cambios FROM auditoria WHERE usuario = 'admin_temp' GROUP BY tabla, columna ORDER BY cambios DESC;"
          ],
          solucion: `SELECT tabla, columna, COUNT(*) AS cambios
FROM auditoria
WHERE usuario = 'admin_temp'
GROUP BY tabla, columna
ORDER BY cambios DESC;`
        },
        {
          enunciado: "Mira de cerca los cambios de `admin_temp` en **productos**. Une `auditoria` con `productos` (`registro_id` es el `id` del producto) y muestra `momento`, `producto` (el nombre), `columna`, `valor_antes` y `valor_despues`, ordenados por `momento`.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas momento, producto, columna, valor_antes y valor_despues", prueba: (r) => PRUEBA.columnas(r, ["momento", "producto", "columna", "valor_antes", "valor_despues"]) },
            { texto: "Salen sus 7 cambios en productos", prueba: (r) => (r?.filas?.length ?? 0) === 7 },
            { texto: "Cada cambio con el nombre del producto, por orden de momento", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT a.momento, p.nombre AS producto, a.columna, a.valor_antes, a.valor_despues
FROM auditoria AS a
JOIN productos AS p ON p.id = a.registro_id
WHERE a.usuario = 'admin_temp'
  AND a.tabla = 'productos'
ORDER BY a.momento;`) }
          ],
          pistas: [
            "`FROM auditoria AS a JOIN productos AS p ON p.id = a.registro_id`, con `p.nombre AS producto` y un `WHERE` con las dos condiciones (usuario y tabla).",
            "SELECT a.momento, p.nombre AS producto, a.columna, a.valor_antes, a.valor_despues FROM auditoria AS a JOIN productos AS p ON p.id = a.registro_id WHERE a.usuario = 'admin_temp' AND a.tabla = 'productos' ORDER BY a.momento;"
          ],
          solucion: `SELECT a.momento, p.nombre AS producto, a.columna, a.valor_antes, a.valor_despues
FROM auditoria AS a
JOIN productos AS p ON p.id = a.registro_id
WHERE a.usuario = 'admin_temp'
  AND a.tabla = 'productos'
ORDER BY a.momento;`
        },
        {
          tipo: "interpretar",
          pregunta: "Ahí está el −12 de los Auriculares Sonora Pulse, y dos precios bajados y restaurados en la misma noche. Ahora el dinero: une sus cambios en **pedidos** con `pedidos` (`registro_id` es el `id` del pedido). ¿Cuántos euros suman los pedidos que `admin_temp` marcó como reembolsados?",
          respuesta: 36470.2,
          tolerancia: 0.01,
          pistas: [
            "`SUM(p.total)` con `FROM auditoria AS a JOIN pedidos AS p ON p.id = a.registro_id` y `WHERE a.usuario = 'admin_temp' AND a.tabla = 'pedidos'`.",
            "SELECT SUM(p.total) FROM auditoria AS a JOIN pedidos AS p ON p.id = a.registro_id WHERE a.usuario = 'admin_temp' AND a.tabla = 'pedidos'; da 36 470,20 €."
          ],
          solucion: `SELECT SUM(p.total) AS reembolsado
FROM auditoria AS a
JOIN pedidos AS p ON p.id = a.registro_id
WHERE a.usuario = 'admin_temp'
  AND a.tabla = 'pedidos';`
        },
        {
          enunciado: "¿De quién es esa cuenta? Busca en `cuentas` las creadas el **2019-11-04** (el día de `admin_temp`): columnas `usuario`, `rol`, `empleado_id`, `creada_por` y `activa`, ordenadas por `usuario`.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas usuario, rol, empleado_id, creada_por y activa", prueba: (r) => PRUEBA.columnas(r, ["usuario", "rol", "empleado_id", "creada_por", "activa"]) },
            { texto: "Salen las 2 cuentas creadas ese día", prueba: (r) => (r?.filas?.length ?? 0) === 2 },
            { texto: "Con sus datos, ordenadas por usuario", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT usuario, rol, empleado_id, creada_por, activa
FROM cuentas
WHERE creada = DATE '2019-11-04'
ORDER BY usuario;`) }
          ],
          pistas: [
            "`creada` es de tipo fecha: `WHERE creada = '2019-11-04'`.",
            "SELECT usuario, rol, empleado_id, creada_por, activa FROM cuentas WHERE creada = '2019-11-04' ORDER BY usuario;"
          ],
          solucion: `SELECT usuario, rol, empleado_id, creada_por, activa
FROM cuentas
WHERE creada = '2019-11-04'
ORDER BY usuario;`
        },
        {
          tipo: "interpretar",
          pregunta: "Dos cuentas de administrador sin empleado, creadas el mismo día por la misma persona. `migracion_2019` está desactivada; `admin_temp`, no. ¿Qué usuario creó `admin_temp`?",
          respuesta: ["ivan.soler", "Iván Soler", "Ivan Soler", "Iván", "Soler"],
          pistas: [
            "Mira la columna `creada_por` de la parte anterior.",
            "Las dos las creó ivan.soler, el administrador de Sistemas."
          ],
          solucion: `SELECT creada_por
FROM cuentas
WHERE usuario = 'admin_temp';`
        },
        {
          enunciado: "La auditoría dice que Iván desactivó `migracion_2019` el 2024-02-12… y que `admin_temp` siguió viva. Ciérrala tú, y que quede constancia. En **una transacción**: `BEGIN;`, pon `activa = false` en la cuenta `admin_temp` y apunta el cambio en `auditoria` con `id` 498, `momento` `TIMESTAMP '2026-10-01 09:00:00'`, `usuario` `'lucia.mora'`, `tabla` `'cuentas'`, `operacion` `'UPDATE'`, `registro_id` 28, `columna` `'activa'`, `valor_antes` `'true'` y `valor_despues` `'false'`. Termina con `COMMIT;`.",
          inicial: "BEGIN;\n-- UPDATE de la cuenta e INSERT en auditoria\n\nCOMMIT;\n",
          varias: true,
          comprobaciones: [
            { texto: "admin_temp queda desactivada, y ninguna cuenta más", prueba: async (r, db) => {
              const c = await db.consulta(`SELECT COUNT(*) FILTER (WHERE usuario = 'admin_temp' AND NOT activa), COUNT(*) FILTER (WHERE activa) FROM cuentas;`);
              return Number(c?.filas?.[0]?.[0] ?? -1) === 1 && Number(c?.filas?.[0]?.[1] ?? -1) === 26;
            } },
            { texto: "El cambio queda apuntado en la auditoría (fila 498, con todos sus datos)", prueba: async (r, db) => {
              const c = await db.consulta(`SELECT COUNT(*) FROM auditoria
WHERE id = 498 AND momento = TIMESTAMP '2026-10-01 09:00:00' AND usuario = 'lucia.mora'
  AND tabla = 'cuentas' AND operacion = 'UPDATE' AND registro_id = 28
  AND columna = 'activa' AND valor_antes = 'true' AND valor_despues = 'false';`);
              const total = await db.consulta(`SELECT COUNT(*) FROM auditoria;`);
              return Number(c?.filas?.[0]?.[0] ?? -1) === 1 && Number(total?.filas?.[0]?.[0] ?? -1) === 498;
            } },
            { texto: "Lo haces dentro de una transacción (BEGIN … COMMIT)", prueba: () => /\bBEGIN\b/i.test(MOTOR.sinTextos(PRUEBA.codigo())) && /\bCOMMIT\b/i.test(MOTOR.sinTextos(PRUEBA.codigo())) }
          ],
          pistas: [
            "Entre `BEGIN;` y `COMMIT;` van dos órdenes: `UPDATE cuentas SET activa = false WHERE usuario = 'admin_temp';` y un `INSERT INTO auditoria (id, momento, usuario, tabla, operacion, registro_id, columna, valor_antes, valor_despues) VALUES (…);` con los nueve valores en ese orden.",
            "BEGIN; UPDATE cuentas SET activa = false WHERE usuario = 'admin_temp'; INSERT INTO auditoria (id, momento, usuario, tabla, operacion, registro_id, columna, valor_antes, valor_despues) VALUES (498, TIMESTAMP '2026-10-01 09:00:00', 'lucia.mora', 'cuentas', 'UPDATE', 28, 'activa', 'true', 'false'); COMMIT;"
          ],
          solucion: `BEGIN;
UPDATE cuentas
SET activa = false
WHERE usuario = 'admin_temp';
INSERT INTO auditoria (id, momento, usuario, tabla, operacion, registro_id, columna, valor_antes, valor_despues)
VALUES (498, TIMESTAMP '2026-10-01 09:00:00', 'lucia.mora', 'cuentas', 'UPDATE', 28, 'activa', 'true', 'false');
COMMIT;`
        }
      ],
      expediente: {
        id: "cuenta-admin-temp",
        titulo: "La cuenta admin_temp",
        texto: "Casi todo lo raro de madrugada lo hizo **una sola cuenta**: `admin_temp`, con **85 cambios** antes de las 6:00. Las **9 altas** de los clientes `@correo-rapido.example`, los **69 reembolsos** (**36 470,20 €**, incluido el pedido 2210 de Iratxe), **3 ajustes de stock** (entre ellos el **−12** de los Auriculares Sonora Pulse, el 16 de agosto a las 03:51) y **2 precios** bajados y restaurados en la misma noche.\nEs una cuenta de administrador **sin empleado**, creada el 2019-11-04 por **ivan.soler**. Su gemela, `migracion_2019`, la desactivó él mismo en 2024. Esta, no.\nIván, serio: «La creé para la migración de 2019. Creía que la había borrado». Nuria, en voz baja: «Iván tiene acceso a todo». Lucía no se mueve: «Una cuenta compartida no tiene cara. El registro dice **qué** cuenta, no **quién** había detrás. Antes de acusar, quiero saber dónde estaba cada uno a esas horas»."
      }
    }
  ]
});
