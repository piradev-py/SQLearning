CURSO.registrar({
  id: "e5-05",
  titulo: "Patrones: expresiones regulares",
  xp: 45,
  objetivo: "Sabrás describir la forma de un texto con una expresión regular, filtrar con ~ y limpiar de golpe con regexp_replace, sin caer en las trampas de la «g», los anclajes y el punto.",
  pasos: [
    {
      tipo: "historia",
      de: "nuria",
      asunto: "Teléfonos de siete formas",
      texto: "El sistema nuevo solo acepta teléfonos de **9 cifras seguidas**. En el CRM los tengo de todos los colores: `+34675354621`, `632-424-439`, `645 126 979`, `639740961`… y luego los vacíos, los `N/D` y los `NULL`.\nCon `REPLACE` tendría que encadenar una sustitución por cada símbolo raro, y seguro que me dejo alguno. Necesito decir «quita todo lo que **no sea una cifra**», sin enumerarlo."
    },
    {
      tipo: "explicacion",
      titulo: "Un LIKE con superpoderes",
      texto: "Una **expresión regular** (o *regex*) es un patrón que describe la **forma** de un texto. Se usa con `~` («cumple el patrón»), `~*` (igual, sin distinguir mayúsculas) y `!~` («no lo cumple»). Las piezas básicas:\n- `^` principio y `$` final del texto.\n- `[0-9]` o `\\d`: una cifra. `[^0-9]`: cualquier cosa que **no** sea cifra.\n- `{4}`: exactamente 4 veces lo anterior. `+`: una o más veces.\n- `.`: cualquier carácter.\nAsí, `'^\\d{4}$'` significa «4 cifras y nada más»: los 19 CP que perdieron el cero.",
      ejemplo: `SELECT crm_id, cp, ciudad
FROM crm_clientes
WHERE cp ~ '^\\d{4}$'
ORDER BY crm_id;`,
      consejo: "No intentes memorizar las regex: ten a mano una chuleta con estas seis piezas. Con ellas resuelves la mayoría de limpiezas del día a día."
    },
    {
      tipo: "explicacion",
      titulo: "Contar formatos",
      texto: "Una comparación con `~` da `true` o `false`, así que también se puede **agrupar** por ella. Así sabemos cuántas fechas de alta vienen como `AAAA-MM-DD`: **199** cumplen el patrón y **133** no (esas vienen como `DD/MM/AAAA`).\nEl patrón se lee pieza a pieza: principio, 4 cifras, guion, 2 cifras, guion, 2 cifras, final.",
      ejemplo: `SELECT fecha_alta ~ '^\\d{4}-\\d{2}-\\d{2}$' AS formato_iso, COUNT(*) AS clientes
FROM crm_clientes
GROUP BY fecha_alta ~ '^\\d{4}-\\d{2}-\\d{2}$';`
    },
    {
      tipo: "ejercicio",
      enunciado: "Nuria quiere revisar las fechas escritas a la española. Muestra `crm_id` y `fecha_alta` de los clientes cuya `fecha_alta` tiene exactamente la forma `DD/MM/AAAA` (2 cifras, barra, 2 cifras, barra, 4 cifras), ordenados por `crm_id`.",
      solucion: `SELECT crm_id, fecha_alta
FROM crm_clientes
WHERE fecha_alta ~ '^\\d{2}/\\d{2}/\\d{4}$'
ORDER BY crm_id;`,
      pistas: [
        "Copia la forma del patrón ISO cambiando el orden de las piezas y los guiones por barras. No olvides `^` y `$`.",
        "SELECT crm_id, fecha_alta FROM crm_clientes WHERE fecha_alta ~ '^\\d{2}/\\d{2}/\\d{4}$' ORDER BY crm_id;"
      ]
    },
    {
      tipo: "quiz",
      pregunta: "¿Cuál de estos patrones encuentra **exactamente** un código postal de 4 cifras (y no uno de 5)?",
      opciones: ["`'\\d{4}'`", "`'^\\d{4}$'`", "`'^[0-9]+$'`"],
      correcta: 1,
      explicacion: "Sin `^` y `$`, `'\\d{4}'` vale si hay 4 cifras seguidas **en cualquier parte**: también casa con `'08001'` o con `'31/12/2099'`. `'^[0-9]+$'` acepta cualquier cantidad de cifras. Solo `'^\\d{4}$'` exige que el texto entero sean 4 cifras."
    },
    {
      tipo: "explicacion",
      titulo: "Limpiar con regexp_replace",
      texto: "`regexp_replace(x, patrón, reemplazo, 'g')` sustituye lo que cumple el patrón. Con `'[^0-9]'` y reemplazo `''`, borra todo lo que no sea cifra: guiones, espacios, el `+`… La `'g'` (de *global*) significa «todas las veces».\nQueda un detalle: `+34675354621` se convierte en `34675354621`, 11 cifras. Con `RIGHT(…, 9)` nos quedamos con las 9 últimas y el prefijo `34` desaparece. Los vacíos, `N/D` y `NULL` no tienen cifras que salvar.",
      ejemplo: `SELECT crm_id, telefono,
  regexp_replace(telefono, '[^0-9]', '', 'g') AS solo_cifras,
  RIGHT(regexp_replace(telefono, '[^0-9]', '', 'g'), 9) AS telefono_limpio
FROM crm_clientes
WHERE crm_id IN (1, 2, 3, 5, 7, 11, 66)
ORDER BY crm_id;`,
      otrosMotores: "MySQL 8 tiene `REGEXP` y `REGEXP_REPLACE`, que sin ninguna `'g'` ya cambia todas las coincidencias. SQL Server no trae expresiones regulares nativas hasta la versión 2025."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería mostrar `crm_id`, `telefono` y `telefono_limpio` (el teléfono **sin ningún carácter que no sea cifra**) de los teléfonos que vienen con espacios (`telefono LIKE '% %'`), ordenados por `crm_id`. Pero el `654 585 624` del cliente 15 sale como `654585 624`: solo se quita el primer espacio. Arréglala.",
      inicial: `SELECT crm_id, telefono, regexp_replace(telefono, '[^0-9]', '') AS telefono_limpio
FROM crm_clientes
WHERE telefono LIKE '% %'
ORDER BY crm_id;`,
      solucion: `SELECT crm_id, telefono, regexp_replace(telefono, '[^0-9]', '', 'g') AS telefono_limpio
FROM crm_clientes
WHERE telefono LIKE '% %'
ORDER BY crm_id;`,
      pistas: [
        "Sin su cuarto argumento, `regexp_replace` cambia solo la **primera** coincidencia. ¿Qué letra le falta?",
        "Añade 'g' como cuarto argumento: regexp_replace(telefono, '[^0-9]', '', 'g')"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "El punto y las tildes",
      texto: "Dos trampas más:\n- El `.` es **cualquier carácter**, no un punto. `'^\\d+.\\d{2}$'` acepta `'1234.50'`, pero también `'1234,50'`. Para un punto de verdad, escribe `\\.`.\n- PostgreSQL puede quitar tildes con la extensión `unaccent`, pero aquí no la tenemos. Si necesitas comparar sin tildes, sustitúyelas con una regex: `[áà]` es «una á o una à».",
      ejemplo: `SELECT '1234,50' ~ '^\\d+.\\d{2}$' AS con_punto_suelto,
  '1234,50' ~ '^\\d+\\.\\d{2}$' AS con_punto_escapado,
  regexp_replace(LOWER('MÁLAGA'), '[áà]', 'a', 'g') AS sin_tilde;`,
      consejo: "Antes de lanzar una regex sobre toda la tabla, pruébala con dos o tres textos sueltos en un `SELECT` sin `FROM`, como aquí. Es mucho más fácil ver dónde falla."
    },
    {
      tipo: "reto",
      de: "nuria",
      enunciado: "Prepárame los **teléfonos normalizados** para la migración. Columnas `crm_id`, `telefono` (el original) y `telefono_limpio` (las 9 últimas cifras, quitando todo lo que no sea cifra). Solo los clientes cuyo `telefono_limpio` tiene **9 cifras**; ordenados por `crm_id`.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas crm_id, telefono y telefono_limpio", prueba: (r) => PRUEBA.columnas(r, ["crm_id", "telefono", "telefono_limpio"]) },
        { texto: "Salen los 290 teléfonos que se pueden salvar", prueba: (r) => (r?.filas?.length ?? 0) === 290 },
        { texto: "Todos los teléfonos limpios son 9 cifras, sin espacios, guiones ni prefijo", prueba: (r) => {
          const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "telefono_limpio");
          return i >= 0 && (r?.filas?.length ?? 0) > 0 && r.filas.every(f => /^\d{9}$/.test(String(f?.[i] ?? "")));
        } },
        { texto: "Cada teléfono limpio corresponde a su original, ordenados por crm_id", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT crm_id, telefono, RIGHT(regexp_replace(telefono, '[^0-9]', '', 'g'), 9) AS telefono_limpio
FROM crm_clientes
WHERE LENGTH(RIGHT(regexp_replace(telefono, '[^0-9]', '', 'g'), 9)) = 9
ORDER BY crm_id;`) }
      ],
      pistas: [
        "La columna es `RIGHT(regexp_replace(telefono, '[^0-9]', '', 'g'), 9)`. Para el filtro, repite esa expresión en el `WHERE` y exige que su `LENGTH` sea 9 (o que cumpla `'^\\d{9}$'`).",
        "SELECT crm_id, telefono, RIGHT(regexp_replace(telefono, '[^0-9]', '', 'g'), 9) AS telefono_limpio FROM crm_clientes WHERE LENGTH(RIGHT(regexp_replace(telefono, '[^0-9]', '', 'g'), 9)) = 9 ORDER BY crm_id;"
      ],
      solucion: `SELECT crm_id, telefono, RIGHT(regexp_replace(telefono, '[^0-9]', '', 'g'), 9) AS telefono_limpio
FROM crm_clientes
WHERE LENGTH(RIGHT(regexp_replace(telefono, '[^0-9]', '', 'g'), 9)) = 9
ORDER BY crm_id;`
    }
  ]
});
