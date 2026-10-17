(function () {
  // Consultas de referencia que se repiten entre partes del caso
  const FRAUDE_POR_MES = `SELECT p.mes, COUNT(*) AS pedidos, SUM(p.total) AS importe,
  SUM(SUM(p.total)) OVER (ORDER BY p.mes) AS acumulado
FROM auditoria AS a
JOIN pedidos AS p ON p.id = a.registro_id
WHERE a.usuario = 'admin_temp'
  AND a.tabla = 'pedidos'
  AND a.columna = 'estado'
GROUP BY p.mes
ORDER BY p.mes;`;

  const TASA_Z = `WITH mensual AS (
  SELECT mes,
    COUNT(*) FILTER (WHERE estado = 'reembolsado') * 100.0 / NULLIF(COUNT(*), 0) AS tasa
  FROM pedidos
  WHERE tienda_id = 5
  GROUP BY mes
),
base AS (
  SELECT AVG(tasa) AS media, STDDEV_SAMP(tasa) AS desviacion
  FROM mensual
  WHERE mes BETWEEN '2024-01' AND '2025-12'
)
SELECT m.mes, ROUND(m.tasa, 2) AS tasa,
  ROUND((m.tasa - b.media) / NULLIF(b.desviacion, 0), 2) AS z
FROM mensual AS m
CROSS JOIN base AS b
ORDER BY m.mes;`;

  const CUENTAS = `SELECT b.cuenta_destino, COUNT(*) AS abonos,
  COUNT(DISTINCT p.cliente_id) AS clientes, SUM(b.importe) AS importe
FROM abonos AS b
JOIN pedidos AS p ON p.id = b.pedido_id
WHERE b.medio = 'transferencia'
GROUP BY b.cuenta_destino
ORDER BY abonos DESC, b.cuenta_destino;`;

  const NOCHES = `WITH hector AS (
  SELECT DISTINCT entrada::date AS noche
  FROM fichajes
  WHERE empleado_id = 5
    AND EXTRACT(HOUR FROM entrada) < 6
    AND entrada >= '2026-01-05' AND entrada < '2026-10-01'
),
cuenta AS (
  SELECT DISTINCT inicio::date AS noche
  FROM sesiones
  WHERE usuario = 'admin_temp'
    AND inicio >= '2026-01-05' AND inicio < '2026-10-01'
)
SELECT h.noche IS NOT NULL AS hector, c.noche IS NOT NULL AS admin_temp, COUNT(*) AS noches
FROM hector AS h
FULL JOIN cuenta AS c ON c.noche = h.noche
GROUP BY 1, 2
ORDER BY 1, 2;`;

  const INFORME = `WITH fraude AS (
  SELECT p.id, p.cliente_id, p.fecha, p.total
  FROM auditoria AS a
  JOIN pedidos AS p ON p.id = a.registro_id
  WHERE a.usuario = 'admin_temp'
    AND a.tabla = 'pedidos'
    AND a.columna = 'estado'
),
destino AS (
  SELECT DISTINCT b.cuenta_destino
  FROM abonos AS b
  JOIN fraude AS f ON f.id = b.pedido_id
),
titular AS (
  SELECT d.cuenta_destino, e.nombre AS titular
  FROM destino AS d
  JOIN fichas_empleados AS fe ON fe.cuenta_nomina = d.cuenta_destino
  JOIN empleados AS e ON e.id = fe.empleado_id
)
SELECT COUNT(*) AS pedidos,
  COUNT(DISTINCT f.cliente_id) AS clientes,
  SUM(f.total) AS importe,
  MIN(f.fecha)::date AS primer_pedido,
  MAX(f.fecha)::date AS ultimo_pedido,
  (SELECT COUNT(DISTINCT inicio::date) FROM sesiones WHERE usuario = 'admin_temp') AS noches,
  (SELECT cuenta_destino FROM titular) AS cuenta_destino,
  (SELECT titular FROM titular) AS titular
FROM fraude AS f;`;

  const sinTextos = () => MOTOR.sinComentarios(MOTOR.sinTextos(PRUEBA.codigo()));
  const usa = (...tablas) => { const sql = sinTextos(); return tablas.every(t => new RegExp(`\\b${t}\\b`, "i").test(sql)); };

  CURSO.registrar({
    id: "e8-12",
    titulo: "Caso: Caso cerrado",
    xp: 80,
    objetivo: "Sabrás cerrar una investigación con analítica: cuantificar un daño mes a mes con acumulados, detectar un periodo anómalo con z-score frente a una línea base, seguir el dinero agrupando abonos y comprobar un patrón con una tabla de contingencia, y resumirlo todo en un informe de una fila.",
    pasos: [
      {
        tipo: "historia",
        de: "lucia",
        asunto: "Números que aguanten",
        texto: "Ana nos ha dado hasta el consejo. Dos preguntas: **cuánto ha costado** y si **el patrón es de Héctor** y de nadie más.\nQue estuviera en el muelle no basta: con eso solo, un abogado nos desmonta en cinco minutos. Quiero cifras que cualquiera pueda repetir: el daño, cuándo empezó y cuándo paró, adónde fue el dinero y si cuadran las noches. Usa lo que has aprendido estas semanas."
      },
      {
        tipo: "explicacion",
        titulo: "Dos datos nuevos: abonos y nóminas",
        texto: "Finanzas e RR. HH. nos han abierto dos cosas más:\n- `abonos`: una fila por cada pedido reembolsado, con `pedido_id`, `fecha`, `importe`, `medio` (`tarjeta`, `bizum`, `efectivo` o `transferencia`) y `cuenta_destino` (solo en las transferencias; las cuentas salen enmascaradas, con los últimos cuatro dígitos).\n- `fichas_empleados.cuenta_nomina`: la cuenta (enmascarada igual) donde cobra cada empleado.\nLo normal es que un reembolso vuelva **por el mismo medio** con que se pagó. El ejemplo resume los abonos por medio.",
        ejemplo: `SELECT medio, COUNT(*) AS abonos, SUM(importe) AS importe
FROM abonos
GROUP BY medio
ORDER BY abonos DESC, medio;`,
        consejo: "Cuando una investigación toca datos personales (nóminas, cuentas), mira solo lo necesario para la pregunta y no lo saques de la consulta. Las cuentas vienen enmascaradas por eso: para cruzarlas basta con compararlas, no hace falta verlas enteras."
      },
      {
        tipo: "explicacion",
        titulo: "Tabla de contingencia con FULL JOIN",
        texto: "Para saber si dos cosas van **siempre juntas**, cruza dos listas de fechas con un `FULL JOIN` (e4): salen las fechas que están en las dos, las que solo están en la primera y las que solo están en la segunda. Agrupando por «¿está en A?» y «¿está en B?» (`a.dia IS NOT NULL`) tienes una **tabla de contingencia**: cuántos días de cada combinación.\nSi un patrón es de alguien, las casillas «uno sin el otro» deben estar vacías. El ejemplo usa dos listas pequeñas escritas a mano.",
        ejemplo: `WITH a AS (
  SELECT dia FROM (VALUES (DATE '2026-01-01'), (DATE '2026-01-02')) AS t(dia)
),
b AS (
  SELECT dia FROM (VALUES (DATE '2026-01-02'), (DATE '2026-01-03')) AS t(dia)
)
SELECT a.dia IS NOT NULL AS en_a, b.dia IS NOT NULL AS en_b, COUNT(*) AS dias
FROM a
FULL JOIN b ON b.dia = a.dia
GROUP BY 1, 2
ORDER BY 1, 2;`,
        consejo: "Una coincidencia se comprueba también **al revés**: haz la misma tabla con otra persona que fiche de madrugada. Iker Salas (empleado 23) tiene turnos de descarga de noche y ninguna cae en una noche de `admin_temp`. Si el patrón sale con cualquiera, no es un patrón."
      },
      {
        tipo: "caso",
        de: "lucia",
        enunciado: "Cinco preguntas para Ana: **cuánto** costó, **cuándo** se salió de lo normal, **adónde** fue el dinero, **de quién** es el patrón y el **resumen** en una fila. Cada respuesta, con una consulta que cualquiera pueda repetir.",
        partes: [
          {
            enunciado: "**El daño, mes a mes.** Los pedidos que reembolsó `admin_temp`: filas de `auditoria` con `usuario = 'admin_temp'`, `tabla = 'pedidos'` y `columna = 'estado'`, unidas a `pedidos` por `registro_id`. Por mes del pedido (la columna `mes` de `pedidos`): `mes`, `pedidos` (cuántos), `importe` (suma de `total`) y `acumulado` (el importe acumulado hasta ese mes, con `SUM(…) OVER (ORDER BY mes)`), ordenado por `mes`.",
            inicial: "",
            comprobaciones: [
              { texto: "Tiene las columnas mes, pedidos, importe y acumulado", prueba: (r) => PRUEBA.columnas(r, ["mes", "pedidos", "importe", "acumulado"]) },
              { texto: "Está ordenado por mes y el acumulado va sumando", prueba: (r) => (r?.filas?.length ?? 0) > 0 && PRUEBA.ordenado(r, "mes", "asc") && PRUEBA.ordenado(r, "acumulado", "asc") },
              { texto: "Cada mes con los pedidos que reembolsó admin_temp, su importe y el acumulado", prueba: (r, db) => PRUEBA.igualA(r, db, FRAUDE_POR_MES) }
            ],
            pistas: [
              "Une `auditoria AS a` con `pedidos AS p` (`ON p.id = a.registro_id`), filtra usuario, tabla y columna, y agrupa por `p.mes`. El acumulado es una ventana sobre el agregado: `SUM(SUM(p.total)) OVER (ORDER BY p.mes)`.",
              "SELECT p.mes, COUNT(*) AS pedidos, SUM(p.total) AS importe, SUM(SUM(p.total)) OVER (ORDER BY p.mes) AS acumulado FROM auditoria AS a JOIN pedidos AS p ON p.id = a.registro_id WHERE a.usuario = 'admin_temp' AND a.tabla = 'pedidos' AND a.columna = 'estado' GROUP BY p.mes ORDER BY p.mes;"
            ],
            solucion: FRAUDE_POR_MES
          },
          {
            tipo: "interpretar",
            pregunta: "¿Qué **%** del importe reembolsado en la tienda online (tienda 5) en pedidos de marzo a septiembre de 2026 (`mes` entre `'2026-03'` y `'2026-09'`) corresponde a los pedidos que reembolsó `admin_temp`? Redondea a 1 decimal.",
            respuesta: 89.9,
            tolerancia: 0.1,
            pistas: [
              "Pedidos online `reembolsado` de esos meses; el numerador, solo los que están en `auditoria` con `usuario = 'admin_temp'`, `tabla = 'pedidos'` y `columna = 'estado'` (un `LEFT JOIN` a esos `registro_id` y `SUM(total) FILTER (WHERE … IS NOT NULL)`).",
              "De los 82 reembolsos online de esos meses, 69 son de `admin_temp`, y se llevan casi todo el importe: un 89,9 %."
            ],
            solucion: `WITH fantasma AS (
  SELECT registro_id AS id
  FROM auditoria
  WHERE usuario = 'admin_temp'
    AND tabla = 'pedidos'
    AND columna = 'estado'
)
SELECT ROUND(SUM(p.total) FILTER (WHERE f.id IS NOT NULL) * 100.0 / NULLIF(SUM(p.total), 0), 1) AS pct
FROM pedidos AS p
LEFT JOIN fantasma AS f ON f.id = p.id
WHERE p.tienda_id = 5
  AND p.estado = 'reembolsado'
  AND p.mes BETWEEN '2026-03' AND '2026-09';`
          },
          {
            enunciado: "**Antes, durante y después.** Tasa de reembolso de la tienda online (tienda 5) por mes, de todos sus meses (de enero de 2024 a octubre de 2026; octubre va a medias, pero una tasa sí se puede comparar), y su z frente a una **línea base**: la media y la desviación (`STDDEV_SAMP`) de las tasas de los 24 meses de **2024 y 2025**, en una CTE aparte, para que el Fantasma no se esconda a sí mismo. Columnas: `mes`, `tasa` (% de pedidos `reembolsado` sobre todos los del mes, redondeado a 2) y `z` (calculado con la tasa **sin redondear**, redondeado a 2), ordenado por `mes`.",
            inicial: "",
            comprobaciones: [
              { texto: "Tiene las columnas mes, tasa y z", prueba: (r) => PRUEBA.columnas(r, ["mes", "tasa", "z"]) },
              { texto: "Está ordenado por mes", prueba: (r) => (r?.filas?.length ?? 0) > 0 && PRUEBA.ordenado(r, "mes", "asc") },
              { texto: "Cada mes con su tasa y su z frente a la línea base de 2024–2025 (no frente a todos los meses)", prueba: (r, db) => PRUEBA.igualA(r, db, TASA_Z) }
            ],
            pistas: [
              "Dos CTE: `mensual` (por `mes`, con `COUNT(*) FILTER (WHERE estado = 'reembolsado') * 100.0 / COUNT(*)` de la tienda 5) y `base` (`AVG` y `STDDEV_SAMP` de `tasa` con `mes BETWEEN '2024-01' AND '2025-12'`). Fuera, `mensual CROSS JOIN base` y el z.",
              "WITH mensual AS (SELECT mes, COUNT(*) FILTER (WHERE estado = 'reembolsado') * 100.0 / NULLIF(COUNT(*), 0) AS tasa FROM pedidos WHERE tienda_id = 5 GROUP BY mes), base AS (SELECT AVG(tasa) AS media, STDDEV_SAMP(tasa) AS desviacion FROM mensual WHERE mes BETWEEN '2024-01' AND '2025-12') SELECT m.mes, ROUND(m.tasa, 2) AS tasa, ROUND((m.tasa - b.media) / NULLIF(b.desviacion, 0), 2) AS z FROM mensual AS m CROSS JOIN base AS b ORDER BY m.mes;"
            ],
            solucion: TASA_Z
          },
          {
            tipo: "interpretar",
            pregunta: "Con la tabla anterior: ¿en cuántos meses el z pasa de **3** (muy raro)? Fíjate también en octubre, con `admin_temp` ya cerrada.",
            respuesta: 5,
            tolerancia: 0,
            pistas: [
              "Cuenta las filas de la parte anterior con `z > 3` (puedes envolverla y añadir `WHERE`).",
              "Son 5: marzo, abril, mayo, junio y agosto de 2026. Julio se queda en 1,42 y septiembre roza el 3. Octubre vuelve a lo normal."
            ],
            solucion: `WITH mensual AS (
  SELECT mes,
    COUNT(*) FILTER (WHERE estado = 'reembolsado') * 100.0 / NULLIF(COUNT(*), 0) AS tasa
  FROM pedidos
  WHERE tienda_id = 5
  GROUP BY mes
),
base AS (
  SELECT AVG(tasa) AS media, STDDEV_SAMP(tasa) AS desviacion
  FROM mensual
  WHERE mes BETWEEN '2024-01' AND '2025-12'
)
SELECT COUNT(*) AS meses
FROM mensual AS m
CROSS JOIN base AS b
WHERE (m.tasa - b.media) / NULLIF(b.desviacion, 0) > 3;`
          },
          {
            enunciado: "**¿Adónde fue el dinero?** Los abonos por transferencia (`medio = 'transferencia'`), agrupados por `cuenta_destino`: `cuenta_destino`, `abonos` (cuántos), `clientes` (clientes distintos de sus pedidos, uniendo con `pedidos`) e `importe` (suma de `importe`), de **más a menos** `abonos` y, si empatan, por `cuenta_destino`.",
            inicial: "",
            comprobaciones: [
              { texto: "Tiene las columnas cuenta_destino, abonos, clientes e importe", prueba: (r) => PRUEBA.columnas(r, ["cuenta_destino", "abonos", "clientes", "importe"]) },
              { texto: "Está ordenado de más a menos abonos", prueba: (r) => (r?.filas?.length ?? 0) > 0 && PRUEBA.ordenado(r, "abonos", "desc") },
              { texto: "Cada cuenta con sus abonos, sus clientes y su importe", prueba: (r, db) => PRUEBA.igualA(r, db, CUENTAS) }
            ],
            pistas: [
              "Une `abonos AS b` con `pedidos AS p` (`ON p.id = b.pedido_id`) para tener el cliente, filtra `b.medio = 'transferencia'` y agrupa por `b.cuenta_destino`.",
              "SELECT b.cuenta_destino, COUNT(*) AS abonos, COUNT(DISTINCT p.cliente_id) AS clientes, SUM(b.importe) AS importe FROM abonos AS b JOIN pedidos AS p ON p.id = b.pedido_id WHERE b.medio = 'transferencia' GROUP BY b.cuenta_destino ORDER BY abonos DESC, b.cuenta_destino;"
            ],
            solucion: CUENTAS
          },
          {
            tipo: "interpretar",
            pregunta: "Un cliente que se devuelve dinero a sí mismo usa **su** cuenta. Pero una cuenta recibe abonos de muchos clientes distintos. Búscala entre las nóminas (`fichas_empleados.cuenta_nomina`, unida con `empleados`): ¿de quién es?",
            respuesta: ["Héctor Vidal", "Hector Vidal", "Héctor", "Hector", "Vidal"],
            pistas: [
              "Toma la primera cuenta de la parte anterior y búscala en `fichas_empleados` con `WHERE cuenta_nomina = …`, unida con `empleados` por `empleado_id`.",
              "Es la cuenta de nómina de Héctor Vidal, el jefe de Logística."
            ],
            solucion: `SELECT e.nombre
FROM fichas_empleados AS fe
JOIN empleados AS e ON e.id = fe.empleado_id
WHERE fe.cuenta_nomina = (
  SELECT cuenta_destino
  FROM abonos
  WHERE medio = 'transferencia'
  GROUP BY cuenta_destino
  ORDER BY COUNT(*) DESC, cuenta_destino
  LIMIT 1
);`
          },
          {
            enunciado: "**¿El patrón es suyo?** Tabla de contingencia de las noches entre el 2026-01-05 y el 2026-09-30: en una CTE, las fechas distintas (`entrada::date`) con un fichaje de Héctor (empleado 5) que **entra antes de las 6** (`EXTRACT(HOUR FROM entrada) < 6`); en otra, las fechas distintas (`inicio::date`) con una sesión de `'admin_temp'`. Únelas con `FULL JOIN` por fecha y cuenta: `hector` (`true` si la fecha está en la lista de Héctor), `admin_temp` (`true` si está en la de la cuenta) y `noches`, agrupado y ordenado por `hector` y `admin_temp`.",
            inicial: "",
            comprobaciones: [
              { texto: "Tiene las columnas hector, admin_temp y noches", prueba: (r) => PRUEBA.columnas(r, ["hector", "admin_temp", "noches"]) },
              { texto: "Lo calculas con las tablas fichajes y sesiones (no vale escribir los números a mano)", prueba: () => usa("fichajes", "sesiones") },
              { texto: "Cada combinación de noches, contada con las dos listas de fechas", prueba: (r, db) => PRUEBA.igualA(r, db, NOCHES) }
            ],
            pistas: [
              "Dos CTE con `SELECT DISTINCT …::date AS noche` (una de `fichajes`, otra de `sesiones`, con sus filtros y fechas), luego `FROM hector AS h FULL JOIN cuenta AS c ON c.noche = h.noche` y `GROUP BY 1, 2` con `h.noche IS NOT NULL AS hector, c.noche IS NOT NULL AS admin_temp`.",
              "WITH hector AS (SELECT DISTINCT entrada::date AS noche FROM fichajes WHERE empleado_id = 5 AND EXTRACT(HOUR FROM entrada) < 6 AND entrada >= '2026-01-05' AND entrada < '2026-10-01'), cuenta AS (SELECT DISTINCT inicio::date AS noche FROM sesiones WHERE usuario = 'admin_temp' AND inicio >= '2026-01-05' AND inicio < '2026-10-01') SELECT h.noche IS NOT NULL AS hector, c.noche IS NOT NULL AS admin_temp, COUNT(*) AS noches FROM hector AS h FULL JOIN cuenta AS c ON c.noche = h.noche GROUP BY 1, 2 ORDER BY 1, 2;"
            ],
            solucion: NOCHES
          },
          {
            tipo: "interpretar",
            pregunta: "¿En cuántas noches actuó `admin_temp` **sin** que Héctor hubiera fichado de madrugada? Escribe el número.",
            respuesta: 0,
            tolerancia: 0,
            pistas: [
              "Es la casilla `hector = false`, `admin_temp = true` de la tabla anterior. Si no aparece, es que vale 0.",
              "Ninguna: 0. Y tampoco hay madrugadas de Héctor sin `admin_temp`: las 75 noches van juntas."
            ],
            solucion: `WITH hector AS (
  SELECT DISTINCT entrada::date AS noche
  FROM fichajes
  WHERE empleado_id = 5
    AND EXTRACT(HOUR FROM entrada) < 6
),
cuenta AS (
  SELECT DISTINCT inicio::date AS noche
  FROM sesiones
  WHERE usuario = 'admin_temp'
)
SELECT COUNT(*) AS noches_sin_hector
FROM cuenta AS c
WHERE NOT EXISTS (SELECT 1 FROM hector AS h WHERE h.noche = c.noche);`
          },
          {
            enunciado: "**El informe para Ana**, en una sola fila y con CTE. De los pedidos que reembolsó `admin_temp` (como en la primera parte): `pedidos`, `clientes` (distintos), `importe` (suma de `total`), `primer_pedido` y `ultimo_pedido` (la `fecha` más antigua y la más reciente, como `date`). Además: `noches` (fechas distintas, `inicio::date`, con sesión de `'admin_temp'`), `cuenta_destino` (la cuenta adonde fueron los `abonos` de esos pedidos) y `titular` (el `nombre` del empleado cuya `cuenta_nomina` es esa cuenta).",
            inicial: "",
            comprobaciones: [
              { texto: "Tiene las columnas pedidos, clientes, importe, primer_pedido, ultimo_pedido, noches, cuenta_destino y titular, en una sola fila", prueba: (r) => PRUEBA.columnas(r, ["pedidos", "clientes", "importe", "primer_pedido", "ultimo_pedido", "noches", "cuenta_destino", "titular"]) && (r?.filas?.length ?? 0) === 1 },
              { texto: "Lo calculas con auditoria, abonos, fichas_empleados y sesiones (no vale escribir los datos a mano)", prueba: () => usa("auditoria", "abonos", "fichas_empleados", "sesiones") },
              { texto: "Todas las cifras del informe coinciden con las de las partes anteriores", prueba: (r, db) => PRUEBA.igualA(r, db, INFORME) }
            ],
            pistas: [
              "Una CTE `fraude` con los pedidos de `admin_temp` (`id`, `cliente_id`, `fecha`, `total`); otra con la cuenta de sus abonos (`SELECT DISTINCT b.cuenta_destino … JOIN fraude`), y otra que la una con `fichas_empleados` y `empleados`. En el `SELECT` final, los agregados de `fraude` y subconsultas escalares para `noches`, `cuenta_destino` y `titular`.",
              "WITH fraude AS (SELECT p.id, p.cliente_id, p.fecha, p.total FROM auditoria AS a JOIN pedidos AS p ON p.id = a.registro_id WHERE a.usuario = 'admin_temp' AND a.tabla = 'pedidos' AND a.columna = 'estado'), destino AS (SELECT DISTINCT b.cuenta_destino FROM abonos AS b JOIN fraude AS f ON f.id = b.pedido_id), titular AS (SELECT d.cuenta_destino, e.nombre AS titular FROM destino AS d JOIN fichas_empleados AS fe ON fe.cuenta_nomina = d.cuenta_destino JOIN empleados AS e ON e.id = fe.empleado_id) SELECT COUNT(*) AS pedidos, COUNT(DISTINCT f.cliente_id) AS clientes, SUM(f.total) AS importe, MIN(f.fecha)::date AS primer_pedido, MAX(f.fecha)::date AS ultimo_pedido, (SELECT COUNT(DISTINCT inicio::date) FROM sesiones WHERE usuario = 'admin_temp') AS noches, (SELECT cuenta_destino FROM titular) AS cuenta_destino, (SELECT titular FROM titular) AS titular FROM fraude AS f;"
            ],
            solucion: INFORME
          }
        ],
        expediente: {
          id: "caso-cerrado",
          titulo: "Caso cerrado",
          texto: "**69 reembolsos falsos, 36 470,20 €**, a nombre de 10 clientes, cobrados en la **cuenta de nómina de Héctor Vidal**. La tasa de reembolso online se dispara de marzo a septiembre de 2026 (5 meses con z > 3 frente a 2024–2025) y vuelve a lo normal en octubre, con `admin_temp` cerrada. Y `admin_temp` actuó **solo** las 75 noches en que Héctor fichó de madrugada en Getafe: ni una más, ni una menos.\nNo es una coincidencia: son tres patrones independientes (las noches, el terminal del muelle y el dinero) que apuntan a la misma persona.\nLos cabos sueltos: en 2019, Iván creó `admin_temp` para migrar el inventario y la dejó configurada en **ALM-GET-03**, el terminal del muelle. Nunca la borró; ese fue su error, no el fraude. Héctor la encontró allí y la usó para que todo apuntara a IT, igual que la **dirección de Olmo** de los clientes falsos: la de Iván, que conocía de tantos años.\nAna suspende a Héctor y pasa el expediente a los abogados. Marcos llama a **Iratxe Muñoz** para cerrar su reclamación: el pedido 2210 se hizo a su nombre. Iván, todavía molesto, acepta revisar todas las cuentas de servicio. Lucía, en su último consejo: «Cuentas personales, nunca compartidas; cada una con los mínimos privilegios; y la auditoría, siempre encendida».\n**Epílogo.** Ana te llama a su despacho y te ofrece el puesto de **Head of Data**. Lucía sonríe: «SQL ya lo tienes. Lo siguiente: hojas de cálculo para hablar con todo el mundo, una herramienta de BI (Power BI, Tableau o Looker) para los cuadros de mando y Python con pandas para lo que no quepa en una consulta». **Caso cerrado.**"
        }
      }
    ]
  });
})();
