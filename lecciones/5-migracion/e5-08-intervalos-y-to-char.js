CURSO.registrar({
  id: "e5-08",
  titulo: "Cuánto tarda y cómo se ve: intervalos y to_char",
  xp: 45,
  objetivo: "Sabrás restar fechas para medir cuánto tarda algo, pasar ese tiempo a días, calcular edades con una fecha de corte fija y presentar cualquier fecha en el formato que te pidan con to_char.",
  pasos: [
    {
      tipo: "historia",
      de: "nuria",
      asunto: "Plazos en días y fechas en un solo formato",
      texto: "El sistema nuevo también se queda con los envíos, y su pantalla pide dos cosas: el **plazo de entrega en días** (con decimales, nada de «2 días y pico») y todas las fechas escritas igual, `AAAA-MM-DD`.\nAh, y RR. HH. quiere la edad de la plantilla **a 1 de octubre**, el día que abre Barcelona. ¿Me echas una mano?"
    },
    {
      tipo: "explicacion",
      titulo: "Restar dos momentos: un intervalo",
      texto: "Si restas dos `timestamp`, PostgreSQL no da un número, sino un **intervalo** (`interval`): un tiempo transcurrido, como `2 days 05:10:00` (2 días, 5 horas y 10 minutos).\nEn `envios`, `entrega - salida` es lo que tardó cada paquete. Los que siguen en reparto no tienen `entrega`, y cualquier cuenta con `NULL` da `NULL`: fíjate en el envío 5.\nTambién puedes **sumar** tiempo: `salida + INTERVAL '3 days'` es la fecha límite de entrega a tres días.",
      ejemplo: `SELECT id, salida, entrega,
  entrega - salida AS duracion,
  salida + INTERVAL '3 days' AS limite
FROM envios
ORDER BY id
LIMIT 5;`
    },
    {
      tipo: "explicacion",
      titulo: "De intervalo a días con decimales",
      texto: "Un intervalo se lee bien, pero no se puede redondear ni comparar con un objetivo «2,5 días». Para pasarlo a número:\n`EXTRACT(EPOCH FROM intervalo)` da los **segundos** que dura. Un día tiene 86 400 segundos, así que dividiendo entre 86 400 tienes los días con decimales.\n`AVG` también funciona con intervalos, y como todas las funciones de resumen, **ignora los `NULL`**: los envíos sin entrega no cuentan en la media.\nEl ejemplo da la media de las dos formas: como intervalo y en días.",
      ejemplo: `SELECT AVG(entrega - salida) AS media_intervalo,
  ROUND(AVG(EXTRACT(EPOCH FROM entrega - salida) / 86400), 2) AS dias_medios
FROM envios;`,
      otrosMotores: "MySQL y SQL Server no tienen tipo intervalo: usan `DATEDIFF` o `TIMESTAMPDIFF(MINUTE, salida, entrega)` y luego divides. BigQuery: `TIMESTAMP_DIFF(entrega, salida, SECOND) / 86400`."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT DATE '2026-10-01' - DATE '2026-09-21' AS dias;`,
      pregunta: "El Almacén Zaragoza abrió el 21 de septiembre de 2026. Con dos `date` (sin hora), ¿qué devuelve esta resta?",
      opciones: ["`10` (un número de días)", "`10 days` (un intervalo)", "Un error: las fechas no se restan"],
      correcta: 0,
      explicacion: "Restar dos `date` da directamente un **número entero de días**: 10. Solo los `timestamp` (con hora) dan un intervalo. Zaragoza lleva 10 días abierto el 1 de octubre."
    },
    {
      tipo: "explicacion",
      titulo: "Edades con una fecha de corte fija",
      texto: "`age(fecha_final, fecha_inicial)` calcula el tiempo entre dos fechas en años, meses y días (`39 years 10 mons 8 days`). Para quedarte con los años cumplidos: `EXTRACT(YEAR FROM age(...))`.\nExiste `CURRENT_DATE` (la fecha de hoy), pero en un informe **no** la uses: el resultado cambiaría cada día y nadie podría repetir tu cifra. Aquí la fecha de corte es fija: `DATE '2026-10-01'`.",
      ejemplo: `SELECT empleado_id, nacimiento,
  age(DATE '2026-10-01', nacimiento) AS tiempo
FROM fichas_empleados
ORDER BY empleado_id;`,
      consejo: "En un informe, escribe la fecha de corte **en el propio informe**: «edad a 1 de octubre de 2026». Si alguien repite tu consulta dentro de un mes con `CURRENT_DATE` y le sale otra cosa, al menos sabrá por qué."
    },
    {
      tipo: "ejercicio",
      enunciado: "Para RR. HH.: muestra `empleado_id`, `nacimiento` y `edad` (los **años cumplidos** a 1 de octubre de 2026) de `fichas_empleados`, ordenados por `empleado_id`.",
      solucion: `SELECT empleado_id, nacimiento,
  EXTRACT(YEAR FROM age(DATE '2026-10-01', nacimiento)) AS edad
FROM fichas_empleados
ORDER BY empleado_id;`,
      pistas: [
        "Envuelve el `age(DATE '2026-10-01', nacimiento)` del ejemplo en `EXTRACT(YEAR FROM …)` y ponle el alias `edad`.",
        "SELECT empleado_id, nacimiento, EXTRACT(YEAR FROM age(DATE '2026-10-01', nacimiento)) AS edad FROM fichas_empleados ORDER BY empleado_id;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "to_char: la fecha, como tú quieras verla",
      texto: "`to_char(fecha, plantilla)` hace lo contrario que `to_date`: convierte una fecha en **texto** con el formato que digas. La plantilla usa las mismas piezas: `YYYY`, `MM`, `DD`, y para la hora `HH24` (0–23) y `MI` (minutos).\n- `to_char(fecha, 'YYYY-MM')` → `'2026-08'`: así se creó la columna `mes` de `pedidos`.\n- `to_char(fecha, 'DD/MM/YYYY HH24:MI')` → `'14/08/2026 03:12'`.\nEl ejemplo deja la `fecha_alta` del CRM en un único formato: primero la conviertes en fecha y después la escribes como `AAAA-MM-DD`.",
      ejemplo: `SELECT crm_id, fecha_alta,
  to_char(CASE
    WHEN fecha_alta ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN to_date(fecha_alta, 'YYYY-MM-DD')
    ELSE to_date(fecha_alta, 'DD/MM/YYYY')
  END, 'YYYY-MM-DD') AS alta_iso
FROM crm_clientes
ORDER BY crm_id
LIMIT 10;`,
      consejo: "`to_char` devuelve **texto**: úsalo al final, para presentar. Si ordenas por `'DD/MM/YYYY'`, el 02/01 va antes que el 15/12 del año anterior. Con `'YYYY-MM'` o `'YYYY-MM-DD'` el orden alfabético sí coincide con el del calendario. Y `'Month'` escribe el mes en inglés y con espacios de relleno.",
      otrosMotores: "MySQL: `DATE_FORMAT(fecha, '%Y-%m-%d')`. SQL Server: `FORMAT(fecha, 'yyyy-MM-dd')`. BigQuery: `FORMAT_DATE('%Y-%m-%d', fecha)`."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería mostrar `id` y `salida_texto` (la `salida` escrita como `DD/MM/AAAA HH:MI`, por ejemplo `'01/01/2024 18:19'`) de los envíos con `id` de 1 a 5, ordenados por `id`. No da error, pero los minutos salen mal. Arréglala.",
      inicial: `SELECT id, to_char(salida, 'DD/MM/YYYY HH24:MM') AS salida_texto
FROM envios
WHERE id <= 5
ORDER BY id;`,
      solucion: `SELECT id, to_char(salida, 'DD/MM/YYYY HH24:MI') AS salida_texto
FROM envios
WHERE id <= 5
ORDER BY id;`,
      pistas: [
        "Compara los «minutos» del resultado con el mes de cada fecha. En la plantilla, ¿qué significa `MM`?",
        "MM es el mes; los minutos son MI: 'DD/MM/YYYY HH24:MI'."
      ]
    },
    {
      tipo: "reto",
      de: "nuria",
      enunciado: "Plazo de entrega por almacén: une `envios` con `almacenes` y muestra `almacen` (el nombre), `envios_entregados` (cuántos envíos tienen `entrega`) y `dias_medios` (la media de `entrega - salida` en días, redondeada a 2 decimales). Ordena por `almacen`. Recuerda que PostgreSQL ordena por código: «Almacén central», con minúscula, va el último.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas almacen, envios_entregados y dias_medios, con los 4 almacenes que tienen envíos", prueba: (r) => PRUEBA.columnas(r, ["almacen", "envios_entregados", "dias_medios"]) && (r?.filas?.length ?? 0) === 4 },
        { texto: "dias_medios es un número de días (entre 1 y 4), no un intervalo", prueba: (r) => {
          const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "dias_medios");
          return i >= 0 && ["numeric", "double precision", "real"].includes(r?.tipos?.[i]) && (r?.filas || []).every(f => Number(f[i]) > 1 && Number(f[i]) < 4);
        } },
        { texto: "Cada almacén con sus envíos entregados y su media, ordenados por almacén", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT al.nombre AS almacen,
  COUNT(e.entrega) AS envios_entregados,
  ROUND(AVG(EXTRACT(EPOCH FROM e.entrega - e.salida) / 86400), 2) AS dias_medios
FROM envios AS e
JOIN almacenes AS al ON al.id = e.almacen_id
GROUP BY al.id, al.nombre
ORDER BY almacen;`) }
      ],
      pistas: [
        "Une `envios AS e` con `almacenes AS al` y agrupa por almacén. `COUNT(e.entrega)` no cuenta los `NULL`; para los días, la fórmula del ejemplo con `EXTRACT(EPOCH FROM …) / 86400` dentro de `AVG` y `ROUND(…, 2)` fuera.",
        "SELECT al.nombre AS almacen, COUNT(e.entrega) AS envios_entregados, ROUND(AVG(EXTRACT(EPOCH FROM e.entrega - e.salida) / 86400), 2) AS dias_medios FROM envios AS e JOIN almacenes AS al ON al.id = e.almacen_id GROUP BY al.id, al.nombre ORDER BY almacen;"
      ],
      solucion: `SELECT al.nombre AS almacen,
  COUNT(e.entrega) AS envios_entregados,
  ROUND(AVG(EXTRACT(EPOCH FROM e.entrega - e.salida) / 86400), 2) AS dias_medios
FROM envios AS e
JOIN almacenes AS al ON al.id = e.almacen_id
GROUP BY al.id, al.nombre
ORDER BY almacen;`
    }
  ]
});
