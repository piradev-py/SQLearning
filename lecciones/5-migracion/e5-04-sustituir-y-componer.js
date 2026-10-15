CURSO.registrar({
  id: "e5-04",
  titulo: "Sustituir y componer: REPLACE, CONCAT y LPAD",
  xp: 35,
  objetivo: "Sabrás cambiar un trozo de texto por otro con REPLACE, juntar textos con || y CONCAT sin perder filas por un NULL, y rellenar por la izquierda con LPAD para devolver los ceros perdidos.",
  pasos: [
    {
      tipo: "historia",
      de: "nuria",
      asunto: "C/, Calle y un cero perdido",
      texto: "Dos cosas me quitan el sueño del CRM viejo. La primera: las direcciones. Unos escriben `Calle Goya`, otros `C/ Goya`, otros `c/ goya`. Para el sistema nuevo tienen que decir lo mismo.\nLa segunda: los **códigos postales de Barcelona**. Alguien abrió la exportación en Excel, el Excel decidió que `08031` era un número y se comió el cero. Ahora hay clientes en la «provincia 80». Necesito devolverles su cero."
    },
    {
      tipo: "explicacion",
      titulo: "REPLACE: buscar y sustituir",
      texto: "`REPLACE(x, 'busca', 'pon')` cambia **todas** las apariciones de un trozo por otro, como el «Buscar y reemplazar» de un procesador de textos.\nPero distingue mayúsculas: `REPLACE(direccion, 'C/', 'Calle ')` no toca `'c/ atocha 70'`. Por eso primero se pasa todo a minúsculas y después se sustituye: `REPLACE(LOWER(direccion), 'c/', 'calle ')`.\nMira también que `'C/ Goya'` queda con **dos espacios** (`'calle  goya'`): el de la sustitución y el que ya había. Cada limpieza destapa la siguiente; los espacios de más los quitaremos en la próxima diligencia.",
      ejemplo: `SELECT crm_id, direccion,
  REPLACE(direccion, 'C/', 'Calle ') AS tal_cual,
  REPLACE(LOWER(direccion), 'c/', 'calle ') AS normalizada
FROM crm_clientes
WHERE crm_id IN (1, 3, 13)
ORDER BY crm_id;`
    },
    {
      tipo: "ejercicio",
      enunciado: "Los `REPLACE` se pueden **encadenar**, uno dentro de otro. Muestra `crm_id`, `direccion` y `direccion_limpia` de los clientes con `crm_id` del 1 al 5, ordenados por `crm_id`. `direccion_limpia` es la dirección en minúsculas, con `'c/'` cambiado por `'calle '` y **sin comas** (cambia `','` por `''`).",
      solucion: `SELECT crm_id, direccion,
  REPLACE(REPLACE(LOWER(direccion), 'c/', 'calle '), ',', '') AS direccion_limpia
FROM crm_clientes
WHERE crm_id BETWEEN 1 AND 5
ORDER BY crm_id;`,
      pistas: [
        "Por dentro, `REPLACE(LOWER(direccion), 'c/', 'calle ')`; ese resultado es la `x` de otro `REPLACE` que cambia `','` por `''`.",
        "SELECT crm_id, direccion, REPLACE(REPLACE(LOWER(direccion), 'c/', 'calle '), ',', '') AS direccion_limpia FROM crm_clientes WHERE crm_id BETWEEN 1 AND 5 ORDER BY crm_id;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Componer: || y CONCAT",
      texto: "Para juntar textos ya conoces `||` (de e1-04): `nombre || ' (' || ciudad || ')'`. También existe la función `CONCAT(a, b, c…)`, que hace lo mismo con comas.\nY `CONCAT_WS(separador, a, b…)` (*with separator*, «con separador») pone el separador entre cada pieza: perfecto para montar una dirección completa.\nParecen intercambiables, pero hay una diferencia importante con los clientes que no tienen ciudad. Antes de verla, una predicción.",
      ejemplo: `SELECT crm_id, CONCAT(nombre, ' (', ciudad, ')') AS etiqueta,
  CONCAT_WS(', ', direccion, cp, ciudad) AS direccion_completa
FROM crm_clientes
WHERE crm_id IN (4, 7)
ORDER BY crm_id;`,
      otrosMotores: "En SQL Server se junta con `+`, que con un `NULL` también da `NULL`. En MySQL, `||` significa `OR` (un «o» lógico), no juntar textos: allí usa siempre `CONCAT`."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT crm_id, nombre || ' (' || ciudad || ')' AS etiqueta
FROM crm_clientes
WHERE crm_id IN (7, 8)
ORDER BY crm_id;`,
      pregunta: "El cliente 8, Daniel Díaz, tiene la ciudad a `NULL`. ¿Qué etiqueta saldrá en su fila?",
      opciones: ["`'Daniel Díaz ()'`", "`'Daniel Díaz'`", "`NULL`: la etiqueta entera desaparece"],
      correcta: 2,
      explicacion: "Con `||`, cualquier pieza `NULL` convierte todo el resultado en `NULL`: «no sé la ciudad» se contagia a la etiqueta entera. Los 7 clientes sin ciudad se quedarían sin etiqueta. `CONCAT`, en cambio, trata el `NULL` como un texto vacío."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta monta la etiqueta `nombre (ciudad)` de los clientes con `crm_id` del 1 al 10, ordenados por `crm_id`, pero el cliente 8 se queda sin etiqueta. Cámbiala para que todos tengan una: usa `CONCAT` con las mismas piezas, sin limpiar nada más. Columnas `crm_id` y `etiqueta`.",
      inicial: `SELECT crm_id, nombre || ' (' || ciudad || ')' AS etiqueta
FROM crm_clientes
WHERE crm_id BETWEEN 1 AND 10
ORDER BY crm_id;`,
      solucion: `SELECT crm_id, CONCAT(nombre, ' (', ciudad, ')') AS etiqueta
FROM crm_clientes
WHERE crm_id BETWEEN 1 AND 10
ORDER BY crm_id;`,
      pistas: [
        "Sustituye la cadena de `||` por una sola llamada a `CONCAT` con las cuatro piezas separadas por comas.",
        "SELECT crm_id, CONCAT(nombre, ' (', ciudad, ')') AS etiqueta FROM crm_clientes WHERE crm_id BETWEEN 1 AND 10 ORDER BY crm_id;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "LPAD: rellenar por la izquierda",
      texto: "`LPAD(x, ancho, relleno)` añade el relleno por la **izquierda** hasta que el texto tenga ese ancho. `LPAD(cp, 5, '0')` convierte `'8031'` en `'08031'` y deja igual `'08001'`, que ya tiene 5. (`RPAD` hace lo mismo por la derecha.)\nDos detalles: si el texto ya es **más largo** que el ancho, `LPAD` lo **recorta** (`LPAD('123456', 5, '0')` da `'12345'`), y un `NULL` sigue siendo `NULL`.\nEn el CRM hay **19** códigos postales de 4 cifras, todos de Barcelona.",
      ejemplo: `SELECT crm_id, cp, LPAD(cp, 5, '0') AS cp_bien,
  LPAD('123456', 5, '0') AS recortado
FROM crm_clientes
WHERE crm_id IN (4, 8, 9, 10)
ORDER BY crm_id;`,
      consejo: "Cuando veas un código que debería tener ancho fijo (CP, cuenta, referencia) con menos cifras de la cuenta, sospecha del Excel. Y abre siempre los CSV como texto, no con doble clic."
    },
    {
      tipo: "reto",
      de: "nuria",
      enunciado: "Repite el recuento de **clientes del CRM por provincia**, ahora con el código postal corregido. Columnas `provincia` (`LEFT(LPAD(cp, 5, '0'), 2)`) y `clientes` (cuántas filas), ordenadas por `provincia`. La fila de los clientes sin código postal (`NULL`) se queda.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas provincia y clientes", prueba: (r) => PRUEBA.columnas(r, ["provincia", "clientes"]) },
        { texto: "Ya no aparece la «provincia 80» ni provincias de una sola cifra, y entre todas suman 332", prueba: (r) => {
          const filas = r?.filas || [];
          const malas = filas.some(f => f?.[0] !== null && (String(f?.[0]).length !== 2 || String(f?.[0]) === "80"));
          const suma = filas.reduce((s, f) => s + Number(f?.[1] ?? 0), 0);
          return filas.length > 0 && !malas && suma === 332;
        } },
        { texto: "La provincia '08' reúne a los 24 clientes de Barcelona", prueba: (r) => {
          const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "provincia");
          const fila = (r?.filas || []).find(f => f?.[i] === "08");
          return i >= 0 && Number(fila?.[1]) === 24;
        } },
        { texto: "Son las cifras por provincia corregida, ordenadas por provincia", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT LEFT(LPAD(cp, 5, '0'), 2) AS provincia, COUNT(*) AS clientes
FROM crm_clientes
GROUP BY LEFT(LPAD(cp, 5, '0'), 2)
ORDER BY provincia;`) }
      ],
      pistas: [
        "Primero devuelve el cero (`LPAD(cp, 5, '0')`) y después corta las dos primeras cifras con `LEFT(…, 2)`. Agrupa por esa misma expresión y cuenta con `COUNT(*)`.",
        "SELECT LEFT(LPAD(cp, 5, '0'), 2) AS provincia, COUNT(*) AS clientes FROM crm_clientes GROUP BY LEFT(LPAD(cp, 5, '0'), 2) ORDER BY provincia;"
      ],
      solucion: `SELECT LEFT(LPAD(cp, 5, '0'), 2) AS provincia, COUNT(*) AS clientes
FROM crm_clientes
GROUP BY LEFT(LPAD(cp, 5, '0'), 2)
ORDER BY provincia;`
    }
  ]
});
