CURSO.registrar({
  id: "e7-11",
  titulo: "Caso: ¿Dónde estaba cada uno?",
  xp: 80,
  rumor: "Iván ha dejado de dar portazos: esta mañana te ha dejado un café en la mesa, sin decir nada. Y otra cosa: Elena dice que a Héctor le llaman del banco casi todos los días.",
  objetivo: "Sabrás reconstruir dónde estaba cada persona cruzando momentos con periodos (vacaciones, fichajes, sesiones), combinando EXISTS, JOIN por rangos, CTE y LAG sobre una línea de tiempo.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "Antes del consejo",
      texto: "Tengo sobre la mesa la suspensión de Iván. La cuenta `admin_temp` la creó él, tiene acceso a todo y la dirección de los clientes falsos es la suya. Parece claro.\nPero no voy a suspender a nadie por algo que **parece**. Lucía dice que una cuenta no tiene cara y que los datos pueden decir dónde estaba cada uno. Tenéis hasta mañana."
    },
    {
      tipo: "explicacion",
      titulo: "Tres tablas para saber dónde estaba cada uno",
      texto: "RR. HH. e IT te han dado acceso a tres tablas nuevas (de enero a septiembre de 2026):\n- `vacaciones`: `empleado_id`, `desde` y `hasta` (fechas, ambas incluidas).\n- `fichajes`: cada jornada de cada empleado, con su `centro` (Oficinas, una tienda, un almacén…), `entrada` y `salida`.\n- `sesiones`: cada vez que una cuenta se conecta a la base de datos: `usuario`, `inicio`, `fin` y `puesto` (el ordenador desde el que se conectó).\nEl ejemplo muestra las vacaciones de Iván (empleado 7).",
      ejemplo: `SELECT *
FROM vacaciones
WHERE empleado_id = 7
ORDER BY desde;`
    },
    {
      tipo: "explicacion",
      titulo: "Cruzar un momento con un periodo",
      texto: "Para saber si algo pasó **dentro** de un periodo, se une por rango en vez de por igualdad:\n- Un momento cae en unas vacaciones si `momento::date BETWEEN v.desde AND v.hasta` (pasado a fecha, porque las vacaciones son días enteros).\n- Una sesión está «cubierta» por un fichaje si `s.inicio BETWEEN f.entrada AND f.salida`: la persona estaba fichada cuando empezó.\nEl ejemplo cuenta las sesiones de `nuria.campos` que empezaron mientras Nuria (empleada 6) estaba fichada.",
      ejemplo: `SELECT COUNT(*) AS sesiones_cubiertas
FROM sesiones AS s
JOIN fichajes AS f
  ON f.empleado_id = 6
 AND s.inicio BETWEEN f.entrada AND f.salida
WHERE s.usuario = 'nuria.campos';`,
      consejo: "En una investigación, cada afirmación debe salir de una consulta que otra persona pueda repetir. Guarda las consultas junto a las conclusiones: si alguien las discute, se ejecutan otra vez y en paz."
    },
    {
      tipo: "caso",
      de: "lucia",
      enunciado: "Una cuenta no tiene cara. Vamos a ver **dónde estaba cada persona** cuando actuó `admin_temp`: primero Iván, después el puesto desde el que se conectaba la cuenta y, por último, quién estaba allí.",
      partes: [
        {
          enunciado: "¿Actuó `admin_temp` mientras Iván estaba de vacaciones? Para cada periodo de vacaciones de Iván (`empleado_id = 7`): `desde`, `hasta` y `acciones` (cuántas filas de `auditoria` del usuario `'admin_temp'` tienen su `momento::date` entre `desde` y `hasta`), ordenado por `desde`.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas desde, hasta y acciones", prueba: (r) => PRUEBA.columnas(r, ["desde", "hasta", "acciones"]) },
            { texto: "Salen los 2 periodos de vacaciones de Iván", prueba: (r) => (r?.filas?.length ?? 0) === 2 },
            { texto: "Cada periodo con las acciones de admin_temp, por orden de fecha", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT v.desde, v.hasta, COUNT(a.id) AS acciones
FROM vacaciones AS v
LEFT JOIN auditoria AS a
  ON a.usuario = 'admin_temp'
 AND a.momento::date BETWEEN v.desde AND v.hasta
WHERE v.empleado_id = 7
GROUP BY v.desde, v.hasta
ORDER BY v.desde;`) }
          ],
          pistas: [
            "Une `vacaciones AS v` con `auditoria AS a` por rango: `ON a.usuario = 'admin_temp' AND a.momento::date BETWEEN v.desde AND v.hasta`. Filtra `v.empleado_id = 7` y agrupa por `v.desde, v.hasta`.",
            "SELECT v.desde, v.hasta, COUNT(a.id) AS acciones FROM vacaciones AS v LEFT JOIN auditoria AS a ON a.usuario = 'admin_temp' AND a.momento::date BETWEEN v.desde AND v.hasta WHERE v.empleado_id = 7 GROUP BY v.desde, v.hasta ORDER BY v.desde;"
          ],
          solucion: `SELECT v.desde, v.hasta, COUNT(a.id) AS acciones
FROM vacaciones AS v
LEFT JOIN auditoria AS a
  ON a.usuario = 'admin_temp'
 AND a.momento::date BETWEEN v.desde AND v.hasta
WHERE v.empleado_id = 7
GROUP BY v.desde, v.hasta
ORDER BY v.desde;`
        },
        {
          tipo: "interpretar",
          pregunta: "Agosto era el mes de más actividad de `admin_temp`. ¿Cuántas acciones hizo la cuenta, **en total**, mientras Iván estaba de vacaciones?",
          respuesta: 14,
          tolerancia: 0,
          pistas: [
            "Suma las dos filas de la parte anterior.",
            "13 en las vacaciones de agosto y 1 en las de abril: 14."
          ],
          solucion: `SELECT COUNT(*) AS acciones
FROM auditoria AS a
WHERE a.usuario = 'admin_temp'
  AND EXISTS (
    SELECT 1
    FROM vacaciones AS v
    WHERE v.empleado_id = 7
      AND a.momento::date BETWEEN v.desde AND v.hasta
  );`
        },
        {
          enunciado: "Estar de vacaciones no impide conectarse desde casa. Comprueba si Iván trabajó esos días. Una sola fila con dos columnas: `sesiones` (sesiones del usuario `'ivan.soler'` cuyo `inicio::date` cae en alguna de sus vacaciones) y `fichajes` (fichajes del empleado 7 cuya `entrada::date` cae en alguna de sus vacaciones).",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas sesiones y fichajes, en una sola fila", prueba: (r) => PRUEBA.columnas(r, ["sesiones", "fichajes"]) && (r?.filas?.length ?? 0) === 1 },
            { texto: "Lo cuentas consultando las tablas sesiones, fichajes y vacaciones", prueba: () => {
              const sql = MOTOR.sinComentarios(MOTOR.sinTextos(PRUEBA.codigo()));
              return /\bsesiones\b/i.test(sql) && /\bfichajes\b/i.test(sql) && /\bvacaciones\b/i.test(sql) && /\bCOUNT\s*\(/i.test(sql);
            } },
            { texto: "Cuenta las sesiones y los fichajes de Iván en sus vacaciones", prueba: (r) => PRUEBA.valor(r, 0, "sesiones") === 0 && PRUEBA.valor(r, 0, "fichajes") === 0 }
          ],
          pistas: [
            "Dos subconsultas escalares en el `SELECT`, cada una con `COUNT(*)` y un `EXISTS` sobre `vacaciones` del empleado 7 (como en la solución de la parte anterior).",
            "SELECT (SELECT COUNT(*) FROM sesiones AS s WHERE s.usuario = 'ivan.soler' AND EXISTS (SELECT 1 FROM vacaciones AS v WHERE v.empleado_id = 7 AND s.inicio::date BETWEEN v.desde AND v.hasta)) AS sesiones, (SELECT COUNT(*) FROM fichajes AS f WHERE f.empleado_id = 7 AND EXISTS (SELECT 1 FROM vacaciones AS v WHERE v.empleado_id = 7 AND f.entrada::date BETWEEN v.desde AND v.hasta)) AS fichajes;"
          ],
          solucion: `SELECT
  (SELECT COUNT(*)
   FROM sesiones AS s
   WHERE s.usuario = 'ivan.soler'
     AND EXISTS (
       SELECT 1
       FROM vacaciones AS v
       WHERE v.empleado_id = 7
         AND s.inicio::date BETWEEN v.desde AND v.hasta
     )) AS sesiones,
  (SELECT COUNT(*)
   FROM fichajes AS f
   WHERE f.empleado_id = 7
     AND EXISTS (
       SELECT 1
       FROM vacaciones AS v
       WHERE v.empleado_id = 7
         AND f.entrada::date BETWEEN v.desde AND v.hasta
     )) AS fichajes;`
        },
        {
          enunciado: "Iván no se conectó en sus vacaciones. ¿Desde dónde se conectaba `admin_temp`? Sus sesiones por puesto: `puesto`, `sesiones` (cuántas), `primera` (el `inicio` más antiguo) y `ultima` (el más reciente), de **más a menos** sesiones.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas puesto, sesiones, primera y ultima", prueba: (r) => PRUEBA.columnas(r, ["puesto", "sesiones", "primera", "ultima"]) },
            { texto: "Cuenta las 75 sesiones de admin_temp", prueba: (r) => {
              const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "sesiones");
              return i >= 0 && (r?.filas || []).reduce((s, f) => s + Number(f?.[i] ?? 0), 0) === 75;
            } },
            { texto: "Cada puesto con sus sesiones, la primera y la última", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT puesto, COUNT(*) AS sesiones, MIN(inicio) AS primera, MAX(inicio) AS ultima
FROM sesiones
WHERE usuario = 'admin_temp'
GROUP BY puesto
ORDER BY sesiones DESC;`) }
          ],
          pistas: [
            "`WHERE usuario = 'admin_temp'`, `GROUP BY puesto`, con `COUNT(*)`, `MIN(inicio)` y `MAX(inicio)`.",
            "SELECT puesto, COUNT(*) AS sesiones, MIN(inicio) AS primera, MAX(inicio) AS ultima FROM sesiones WHERE usuario = 'admin_temp' GROUP BY puesto ORDER BY sesiones DESC;"
          ],
          solucion: `SELECT puesto, COUNT(*) AS sesiones, MIN(inicio) AS primera, MAX(inicio) AS ultima
FROM sesiones
WHERE usuario = 'admin_temp'
GROUP BY puesto
ORDER BY sesiones DESC;`
        },
        {
          tipo: "interpretar",
          pregunta: "Iván trabaja desde `SIS-01`, en las oficinas. ¿Desde qué puesto se conectó **siempre** `admin_temp`? (Es el terminal del muelle del Almacén central, en Getafe.)",
          respuesta: ["ALM-GET-03", "ALM GET 03", "ALMGET03"],
          pistas: [
            "Es la única fila de la parte anterior.",
            "ALM-GET-03."
          ],
          solucion: `SELECT DISTINCT puesto
FROM sesiones
WHERE usuario = 'admin_temp';`
        },
        {
          enunciado: "Para entrar en el muelle de Getafe de madrugada hay que fichar. Para cada sesión de `admin_temp`, busca los fichajes del **Almacén central** (`centro = 'Almacén central'`) que la cubren (`s.inicio BETWEEN f.entrada AND f.salida`) y cuéntalos por empleado: columnas `empleado` (el nombre) y `sesiones`, de **más a menos** sesiones y, si empatan, por `empleado`.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas empleado y sesiones", prueba: (r) => PRUEBA.columnas(r, ["empleado", "sesiones"]) },
            { texto: "La primera fila es la persona que estaba allí en las 75 sesiones", prueba: (r) => PRUEBA.valor(r, 0, "sesiones") === 75 },
            { texto: "Cada empleado con las sesiones que cubre, de más a menos", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT e.nombre AS empleado, COUNT(*) AS sesiones
FROM sesiones AS s
JOIN fichajes AS f
  ON f.centro = 'Almacén central'
 AND s.inicio BETWEEN f.entrada AND f.salida
JOIN empleados AS e ON e.id = f.empleado_id
WHERE s.usuario = 'admin_temp'
GROUP BY e.id, e.nombre
ORDER BY sesiones DESC, empleado;`) }
          ],
          pistas: [
            "Une `sesiones AS s` con `fichajes AS f` por rango (`ON f.centro = 'Almacén central' AND s.inicio BETWEEN f.entrada AND f.salida`) y luego con `empleados AS e`. Filtra `s.usuario = 'admin_temp'` y agrupa por empleado.",
            "SELECT e.nombre AS empleado, COUNT(*) AS sesiones FROM sesiones AS s JOIN fichajes AS f ON f.centro = 'Almacén central' AND s.inicio BETWEEN f.entrada AND f.salida JOIN empleados AS e ON e.id = f.empleado_id WHERE s.usuario = 'admin_temp' GROUP BY e.id, e.nombre ORDER BY sesiones DESC, empleado;"
          ],
          solucion: `SELECT e.nombre AS empleado, COUNT(*) AS sesiones
FROM sesiones AS s
JOIN fichajes AS f
  ON f.centro = 'Almacén central'
 AND s.inicio BETWEEN f.entrada AND f.salida
JOIN empleados AS e ON e.id = f.empleado_id
WHERE s.usuario = 'admin_temp'
GROUP BY e.id, e.nombre
ORDER BY sesiones DESC, empleado;`
        },
        {
          tipo: "interpretar",
          pregunta: "¿Quién estaba fichado en el Almacén central cada vez que `admin_temp` abrió una sesión? Escribe su nombre.",
          respuesta: ["Héctor Vidal", "Hector Vidal", "Héctor", "Hector", "Vidal"],
          pistas: [
            "Es la primera fila de la parte anterior.",
            "Héctor Vidal, el jefe de Logística, en las 75 sesiones."
          ],
          solucion: `SELECT e.nombre
FROM sesiones AS s
JOIN fichajes AS f
  ON f.centro = 'Almacén central'
 AND s.inicio BETWEEN f.entrada AND f.salida
JOIN empleados AS e ON e.id = f.empleado_id
WHERE s.usuario = 'admin_temp'
GROUP BY e.id, e.nombre
ORDER BY COUNT(*) DESC, e.nombre
LIMIT 1;`
        },
        {
          enunciado: "Lucía quiere verlo como una **línea de tiempo**. En una CTE `linea`, junta con `UNION ALL` las entradas del Almacén central (`momento` = `f.entrada`, `tipo` = `'fichaje'`, `quien` = nombre del empleado) y las acciones de `admin_temp` en `auditoria` (`momento`, `tipo` = `'admin_temp'`, `quien` = `'admin_temp'`). Con `LAG` (ordenando por `momento`, `tipo` y `quien`) trae a cada evento el `tipo` y el `quien` del evento anterior. Después, **solo para las acciones de admin_temp**, cuenta qué hubo justo antes: columnas `tipo_anterior`, `quien_anterior` y `acciones`, de **más a menos** acciones.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas tipo_anterior, quien_anterior y acciones", prueba: (r) => PRUEBA.columnas(r, ["tipo_anterior", "quien_anterior", "acciones"]) },
            { texto: "Cuenta las 85 acciones de admin_temp", prueba: (r) => {
              const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "acciones");
              return i >= 0 && (r?.filas || []).reduce((s, f) => s + Number(f?.[i] ?? 0), 0) === 85;
            } },
            { texto: "Para cada acción, qué evento hubo justo antes", prueba: (r, db) => PRUEBA.igualA(r, db, `WITH linea AS (
  SELECT f.entrada AS momento, 'fichaje' AS tipo, e.nombre AS quien
  FROM fichajes AS f
  JOIN empleados AS e ON e.id = f.empleado_id
  WHERE f.centro = 'Almacén central'
  UNION ALL
  SELECT momento, 'admin_temp' AS tipo, 'admin_temp' AS quien
  FROM auditoria
  WHERE usuario = 'admin_temp'
),
con_anterior AS (
  SELECT tipo,
    LAG(tipo) OVER (ORDER BY momento, tipo, quien) AS tipo_anterior,
    LAG(quien) OVER (ORDER BY momento, tipo, quien) AS quien_anterior
  FROM linea
)
SELECT tipo_anterior, quien_anterior, COUNT(*) AS acciones
FROM con_anterior
WHERE tipo = 'admin_temp'
GROUP BY tipo_anterior, quien_anterior
ORDER BY acciones DESC;`) }
          ],
          pistas: [
            "Tres pasos: `linea` (los dos `SELECT` con las mismas tres columnas unidos con `UNION ALL`), `con_anterior` (con `LAG(tipo) OVER (ORDER BY momento, tipo, quien)` y lo mismo con `quien`) y, fuera, `WHERE tipo = 'admin_temp'` con `GROUP BY tipo_anterior, quien_anterior`.",
            "WITH linea AS (SELECT f.entrada AS momento, 'fichaje' AS tipo, e.nombre AS quien FROM fichajes AS f JOIN empleados AS e ON e.id = f.empleado_id WHERE f.centro = 'Almacén central' UNION ALL SELECT momento, 'admin_temp' AS tipo, 'admin_temp' AS quien FROM auditoria WHERE usuario = 'admin_temp'), con_anterior AS (SELECT tipo, LAG(tipo) OVER (ORDER BY momento, tipo, quien) AS tipo_anterior, LAG(quien) OVER (ORDER BY momento, tipo, quien) AS quien_anterior FROM linea) SELECT tipo_anterior, quien_anterior, COUNT(*) AS acciones FROM con_anterior WHERE tipo = 'admin_temp' GROUP BY tipo_anterior, quien_anterior ORDER BY acciones DESC;"
          ],
          solucion: `WITH linea AS (
  SELECT f.entrada AS momento, 'fichaje' AS tipo, e.nombre AS quien
  FROM fichajes AS f
  JOIN empleados AS e ON e.id = f.empleado_id
  WHERE f.centro = 'Almacén central'
  UNION ALL
  SELECT momento, 'admin_temp' AS tipo, 'admin_temp' AS quien
  FROM auditoria
  WHERE usuario = 'admin_temp'
),
con_anterior AS (
  SELECT tipo,
    LAG(tipo) OVER (ORDER BY momento, tipo, quien) AS tipo_anterior,
    LAG(quien) OVER (ORDER BY momento, tipo, quien) AS quien_anterior
  FROM linea
)
SELECT tipo_anterior, quien_anterior, COUNT(*) AS acciones
FROM con_anterior
WHERE tipo = 'admin_temp'
GROUP BY tipo_anterior, quien_anterior
ORDER BY acciones DESC;`
        },
        {
          tipo: "interpretar",
          pregunta: "Antes de cada primera acción de la noche hay siempre un fichaje de Héctor; las demás van detrás de otra acción. Última medida: ¿cuántos **minutos**, como máximo, pasaron entre la `entrada` de Héctor (empleado 5) en el Almacén central y el `inicio` de la sesión de `admin_temp` que cubre? (Usa `EXTRACT(EPOCH FROM s.inicio - f.entrada) / 60`.)",
          respuesta: 17,
          tolerancia: 0.5,
          pistas: [
            "Une `sesiones` (de admin_temp) con los fichajes de Héctor en el Almacén central por rango, como en la parte del puesto, y saca el `MAX` de los minutos.",
            "SELECT MAX(EXTRACT(EPOCH FROM s.inicio - f.entrada) / 60) FROM sesiones AS s JOIN fichajes AS f ON f.empleado_id = 5 AND f.centro = 'Almacén central' AND s.inicio BETWEEN f.entrada AND f.salida WHERE s.usuario = 'admin_temp'; da 17."
          ],
          solucion: `SELECT MAX(EXTRACT(EPOCH FROM s.inicio - f.entrada) / 60) AS maximo,
  MIN(EXTRACT(EPOCH FROM s.inicio - f.entrada) / 60) AS minimo,
  ROUND(AVG(EXTRACT(EPOCH FROM s.inicio - f.entrada) / 60), 1) AS media
FROM sesiones AS s
JOIN fichajes AS f
  ON f.empleado_id = 5
 AND f.centro = 'Almacén central'
 AND s.inicio BETWEEN f.entrada AND f.salida
WHERE s.usuario = 'admin_temp';`
        }
      ],
      expediente: {
        id: "coartada-de-ivan",
        titulo: "La coartada de Iván",
        texto: "**Iván está limpio.** `admin_temp` hizo **14 acciones** mientras él estaba de vacaciones (13 en agosto, 1 en abril), y esos días Iván no tiene **ni una sesión ni un fichaje**. Además, la cuenta nunca se conectó desde su puesto: sus **75 sesiones** salen de **ALM-GET-03**, el terminal del muelle del Almacén central, en Getafe.\nEn las 75, había una sola persona fichada allí: **Héctor Vidal**, el jefe de Logística. Entraba entre **2 y 17 minutos** antes de que se abriera la sesión (10,1 de media), y antes de cada noche de actividad lo último que pasa es su fichaje.\nAna, despacio: «Héctor. El que siempre echaba una mano». Iván, sin levantar la vista: «Somos compañeros desde hace años. Sabe dónde vivo». Lucía no celebra nada: «Que estuviera allí **no prueba que lo hiciera**. Antes de acusar, quiero cuantificar el daño y comprobar que el patrón es suyo y de nadie más»."
      }
    }
  ]
});
