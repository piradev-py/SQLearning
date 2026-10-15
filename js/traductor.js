/* ============================================================
   SQLearning · Traductor de errores de PostgreSQL
   Convierte el error técnico (en inglés) en una explicación de
   novato, con sugerencias («¿querías decir `productos`?»).
   Usa el código SQLSTATE del error, no el texto, salvo para sacar
   el nombre que falla.
   ============================================================ */
(function () {
  // Nombres conocidos del esquema actual (los rellena quien cargue el esquema)
  let tablas = [];
  let columnas = [];
  let tablasDe = {};          // tabla → sus columnas (para «esa columna está en otra tabla»)

  function distancia(a, b) {
    a = a.toLowerCase(); b = b.toLowerCase();
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }

  function parecido(nombre, lista) {
    let mejor = null, min = Infinity;
    for (const x of lista) {
      const dist = distancia(nombre, x);
      if (dist < min) { min = dist; mejor = x; }
    }
    return mejor && min <= Math.max(2, Math.floor(nombre.length / 3)) ? mejor : null;
  }

  const entre = (msg, re) => (msg.match(re) || [])[1] || null;
  // La consulta sin comentarios ni textos entre comillas, para buscar palabras clave sin falsos positivos
  const limpio = sql => String(sql || "").replace(/--[^\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/'(?:[^']|'')*'/g, "''");
  // ¿Algún JOIN (que no sea CROSS ni NATURAL) se ha quedado sin su ON / USING?
  const joinSinOn = s => (s.match(/\bjoin\b/gi) || []).length - (s.match(/\b(cross|natural)\s+join\b/gi) || []).length >
    (s.match(/\b(on|using)\b/gi) || []).length;

  // El detalle de las claves, en español: «Key (id)=(1) already exists.» → «`id` = `1` ya existe»
  function detalleClave(d) {
    const m = String(d || "").match(/Key \((.+?)\)=\((.*?)\)\s+(already exists|is not present in table "([^"]+)"|is still referenced from table "([^"]+)")/);
    if (!m) return "";
    const par = `\`${m[1]}\` = \`${m[2]}\``;
    if (m[4]) return ` (${par} no existe en \`${m[4]}\`)`;
    if (m[5]) return ` (${par}: todavía lo usan filas de \`${m[5]}\`)`;
    return ` (${par} ya existe)`;
  }

  const CODIGOS = {
    "42601": (e, sql) => {
      if (/subquery must return only one column/.test(e.mensaje))
        return "Esa subconsulta devuelve **varias columnas** y aquí solo cabe una: deja una sola columna en su `SELECT`.";
      const cerca = entre(e.mensaje, /at or near "([^"]*)"/);
      const s = limpio(sql);
      if (cerca && /^on$/i.test(cerca) && /\bcross\s+join\b/i.test(s))
        return "`CROSS JOIN` no lleva `ON`: junta **todas** las filas de una tabla con todas las de la otra. Si quieres emparejarlas, usa `JOIN … ON`.";
      if (cerca && /^where$/i.test(cerca) && /\bgroup\s+by\b[\s\S]*\bwhere\b/i.test(s))
        return "`WHERE` va **antes** de `GROUP BY` (filtra filas antes de agrupar). Para filtrar los grupos ya formados, usa `HAVING` después del `GROUP BY`.";
      if (cerca && /^(union|intersect|except)$/i.test(cerca) && /\border\s+by\b[\s\S]*\b(union|intersect|except)\b/i.test(s))
        return "Al apilar consultas con `UNION`, `INTERSECT` o `EXCEPT` solo puede haber **un** `ORDER BY`, al final del todo.";
      if ((/at end of input/.test(e.mensaje) || (cerca && /^(;|where|order|group|limit|having|join|inner|left|right|full)$/i.test(cerca))) && joinSinOn(s))
        return "A un `JOIN` le falta el `ON`: tienes que decir cómo se emparejan las filas, por ejemplo `JOIN tiendas t ON t.id = e.tienda_id`.";
      if (/at end of input/.test(e.mensaje))
        return "La consulta se corta antes de tiempo: falta algo al final (¿una columna después de la coma? ¿cerrar un paréntesis o una comilla?).";
      if (cerca && /^(FROM|WHERE|ORDER|GROUP|LIMIT|HAVING)$/i.test(cerca))
        return `PostgreSQL no esperaba \`${cerca}\` ahí. Mira justo antes: ¿sobra una coma o falta una columna?`;
      return cerca
        ? `Hay algo mal escrito cerca de \`${cerca}\`. Revisa comas, comillas y el orden de las palabras.`
        : "Hay algo mal escrito en la consulta. Revisa comas, comillas y el orden de las palabras.";
    },
    "42P01": (e, sql) => {
      // «missing FROM-clause entry for table "julia"»: casi siempre un texto sin comillas (julia.martinez@…)
      const sinFrom = entre(e.mensaje, /missing FROM-clause entry for table "([^"]+)"/);
      if (sinFrom) return `Has escrito \`${sinFrom}.algo\` como si \`${sinFrom}\` fuera una tabla. Si es un texto (un email, un nombre…), va entre comillas simples: \`'así'\`.`;
      // «invalid reference to FROM-clause entry for table "envios"» + HINT con el alias: usa el nombre de la tabla tras darle un alias
      const conAlias = entre(e.mensaje, /invalid reference to FROM-clause entry for table "([^"]+)"/);
      if (conAlias) {
        const alias = entre(e.pista || "", /alias "([^"]+)"/);
        return alias
          ? `Has llamado \`${alias}\` a la tabla \`${conAlias}\`: a partir de ahí, escribe \`${alias}.columna\`, no \`${conAlias}.columna\`.`
          : `La tabla \`${conAlias}\` tiene un alias en el \`FROM\`: usa el alias delante de sus columnas, no el nombre de la tabla.`;
      }
      const n = entre(e.mensaje, /relation "([^"]+)"/);
      if (!n) return "Esa tabla no existe. Mira los nombres en la pestaña Esquema.";
      const sug = parecido(n, tablas);
      if (sug) return `No existe ninguna tabla llamada \`${n}\`. ¿Querías decir \`${sug}\`?`;
      return `No existe ninguna tabla llamada \`${n}\`. Mira los nombres en la pestaña Esquema.` +
        (tablas.includes("auditoria")   // desde la etapa 6 (crear tablas)
          ? " Si la creaste en una ejecución anterior, ya no existe: cada ejecución se deshace al terminar, así que créala y úsala en la misma."
          : "");
    },
    "42703": (e, sql) => {
      const n = entre(e.mensaje, /column "([^"]*)" does not exist/) ?? entre(e.mensaje, /column ([\w.]+) does not exist/);
      if (n === null) return "Usas una columna que no existe. Mira los nombres en la pestaña Esquema.";
      // Si en la consulta iba entre comillas dobles, era un texto mal escrito, no una columna
      // (se mira el nombre entero antes de cortarlo por el punto: "julia.martinez@mail.example")
      if (sql && sql.includes(`"${n}"`))
        return `Has escrito \`"${n}"\` entre comillas dobles y PostgreSQL lo toma por el nombre de una columna. Los textos van entre **comillas simples**: \`'${n}'\`.`;
      const corto = n.split(".").pop();
      if (sql && sql.includes(`"${corto}"`))
        return `Has escrito \`"${corto}"\` entre comillas dobles y PostgreSQL lo toma por el nombre de una columna. Los textos van entre **comillas simples**: \`'${corto}'\`.`;
      const s = limpio(sql);
      // La columna existe, pero en otra tabla: «e.cliente_id» cuando cliente_id está en pedidos
      if (n.includes(".") && columnas.includes(corto)) {
        const donde = Object.keys(tablasDe).filter(t => tablasDe[t].includes(corto));
        return `La tabla de \`${n.split(".")[0]}\` no tiene la columna \`${corto}\`: está en ${donde.map(t => `\`${t}\``).join(", ")}. ¿Tienes que pasar por esa tabla (otro \`JOIN\`) o cambiar lo que va delante del punto?`;
      }
      // Un alias del SELECT usado en WHERE, GROUP BY o HAVING: todavía no existe (SQL los evalúa antes que el SELECT)
      const esAlias = new RegExp(`\\bas\\s+"?${corto.replace(/[^\w]/g, "")}"?\\b`, "i").test(s);
      if (!n.includes(".") && esAlias) {
        const en = palabra => new RegExp(`\\b${palabra}\\b[\\s\\S]*\\b${corto}\\b`, "i").test(s);
        const clausula = en("having") ? "HAVING" : en("where") ? "WHERE" : en("group\\s+by") ? "GROUP BY" : null;
        if (!clausula)
          return `\`${corto}\` es un alias que se crea en este mismo \`SELECT\`: ahí todavía no se puede usar. Repite la expresión entera (lo que va delante de \`AS ${corto}\`) o calcúlala antes en una CTE (\`WITH\`).`;
        return `\`${corto}\` es un alias del \`SELECT\` y en el \`${clausula}\` todavía no existe (PostgreSQL hace el \`${clausula}\` antes que el \`SELECT\`). Repite ahí la expresión entera, la que va delante de \`AS ${corto}\`.`;
      }
      const sug = parecido(corto, columnas.filter(c => c !== corto));
      let txt = `No existe ninguna columna llamada \`${corto}\`.`;
      if (sug) txt += ` ¿Querías decir \`${sug}\`?`;
      if (e.pista && /quote/.test(e.pista)) txt += " Ojo: los textos van entre comillas simples `'así'`; las dobles son para nombres de columnas.";
      return txt;
    },
    "42702": (e) => `El nombre \`${entre(e.mensaje, /"([^"]+)"/)}\` está en varias tablas: escribe delante de qué tabla es (\`tabla.columna\`).`,
    "42883": (e) => {
      const fn = entre(e.mensaje, /function ([\w.]+)\(/) || entre(e.mensaje, /operator does not exist: (.+)$/);
      if (/function (pg_catalog\.)?extract\(/i.test(e.mensaje))
        return "`EXTRACT` necesita una fecha de verdad y le estás pasando texto. Conviértelo antes: `EXTRACT(YEAR FROM to_date(columna, 'DD/MM/YYYY'))` o `columna::date`.";
      if (/function round\(double precision, integer\)/i.test(e.mensaje))
        return "`ROUND(valor, decimales)` solo funciona con el tipo `numeric`, y ese valor es `double precision`. Conviértelo: `ROUND(valor::numeric, 2)`.";
      return /operator/.test(e.mensaje)
        ? `No se puede usar ese operador con estos tipos de datos (${fn}). ¿Estás mezclando texto y números?`
        : `La función \`${fn}\` no existe o no acepta esos datos. Revisa cómo se escribe y qué le pasas entre paréntesis.`;
    },
    "42803": (e, sql) => {
      const n = entre(e.mensaje, /column "([^"]+)"/);
      const s = limpio(sql);
      // Si no está en el SELECT pero sí en el ORDER BY, el alumno no sabe de dónde sale
      const enSelect = n && new RegExp(`\\bselect\\b[\\s\\S]*\\b${n.replace(/[^\w.]/g, "").replace(".", "\\.")}\\b[\\s\\S]*\\bfrom\\b`, "i").test(s);
      const enOrden = n && new RegExp(`\\border\\s+by\\b[\\s\\S]*\\b${n.replace(/[^\w.]/g, "").replace(".", "\\.")}\\b`, "i").test(s);
      return `La columna \`${n}\`${!enSelect && enOrden ? " (la usas en el `ORDER BY`)" : ""} tiene que ir en el \`GROUP BY\` o dentro de una función como \`COUNT\`, \`SUM\`… Al agrupar, cada columna debe tener un solo valor por grupo.`;
    },
    "42804": () => "Los tipos de datos no encajan: estás mezclando, por ejemplo, texto con números o fechas.",
    "22P02": (e) => `El valor ${entre(e.mensaje, /: (".*")$/) || ""} no tiene el formato que espera la columna (¿un texto donde va un número o una fecha?).`,
    "22007": (e) => /interval/.test(e.mensaje)
      ? "Ese intervalo no tiene un formato válido. Escríbelo así: `INTERVAL '3 days'` o `'2 hours 30 minutes'`."
      : "La fecha u hora no tiene un formato válido. Escríbela así: `'2024-03-31'`.",
    "22008": () => "Esa fecha no existe o se sale de rango.",
    "22012": () => "Estás dividiendo entre cero. Usa `NULLIF(divisor, 0)` para evitarlo.",
    "23505": (e) => `Ya existe una fila con ese valor y la columna no admite repetidos (PRIMARY KEY o UNIQUE)${detalleClave(e.detalle)}.`,
    "23503": (e) => /still referenced/.test(e.detalle || "")
      ? `No puedes borrar (o cambiar) esa fila: otras la necesitan (FOREIGN KEY)${detalleClave(e.detalle)}.`
      : `Esa fila apunta a otra que no existe (FOREIGN KEY)${detalleClave(e.detalle)}.`,
    "23502": (e) => `La columna \`${entre(e.mensaje, /column "([^"]+)"/)}\` no puede quedar vacía (NOT NULL).`,
    "23514": (e) => `El valor no cumple la regla \`${entre(e.mensaje, /constraint "([^"]+)"/)}\` (CHECK) de la tabla.`,
    "42P07": (e) => `Ya existe algo llamado \`${entre(e.mensaje, /"([^"]+)"/)}\`.`,
    "42712": (e) => `Usas el nombre \`${entre(e.mensaje, /"([^"]+)"/)}\` dos veces en el \`FROM\`. Si unes una tabla consigo misma, dale un alias distinto a cada copia (por ejemplo \`em\` y \`j\`).`,
    "42P10": () => "En `ORDER BY` con `DISTINCT`, solo puedes ordenar por columnas que estén en el `SELECT`.",
    "2BP01": () => "No se puede borrar: otras tablas, vistas o claves dependen de esto. Habría que quitar antes lo que depende (o usar `CASCADE`, que lo borra todo en cadena: peligroso).",
    "428C9": (e) => `La columna \`${entre(e.mensaje, /column "([^"]+)"/)}\` se numera sola (GENERATED ALWAYS AS IDENTITY): no le des valor, quítala de la lista del \`INSERT\`.`,
    "3B001": () => "No existe ningún punto de guardado (`SAVEPOINT`) con ese nombre.",
    "25P01": () => "`SAVEPOINT` solo funciona dentro de una transacción (después de `BEGIN`).",
    "42701": (e) => `La columna \`${entre(e.mensaje, /"([^"]+)"/)}\` está repetida: cada columna necesita un nombre distinto.`,
    "42P16": () => "Esa definición no es válida: una tabla solo puede tener una clave primaria, y `CREATE OR REPLACE VIEW` no puede quitar ni cambiar columnas (bórrala con `DROP VIEW` y créala de nuevo).",
    "22001": () => "El texto es más largo de lo que admite la columna (por ejemplo, `varchar(3)`).",
    "42704": (e) => `No existe \`${entre(e.mensaje, /"([^"]+)"/)}\` (¿está bien escrito el nombre?).`,
    "42809": () => "Esa orden no vale para ese tipo de objeto (por ejemplo, `DROP VIEW` con una tabla o `DROP TABLE` con una vista).",
    "55000": () => "Esa vista no se puede modificar: tiene `GROUP BY`, funciones o varias tablas. Cambia los datos en la tabla original.",
    "25006": () => "La transacción es de solo lectura: no puede cambiar datos.",
    "2201B": () => "La expresión regular está mal escrita (¿un paréntesis o un corchete sin cerrar?). Para buscar un `(` tal cual, escríbelo `\\(`.",
    "22011": () => "La longitud de `substring` no puede ser negativa.",
    "22023": () => "Uno de los valores que le pasas a la función no es válido (por ejemplo, la posición 0 en `split_part` o un paso 0 en `generate_series`).",
    "22003": () => "El número es demasiado grande para ese tipo de dato.",
    "2201W": () => "`LIMIT` no puede ser negativo.",
    "2201X": () => "`OFFSET` no puede ser negativo.",
    "42P20": () => "Las funciones ventana (`… OVER (…)`) no se pueden usar en `WHERE`, `GROUP BY` ni dentro de otra ventana. Calcula la ventana en una CTE o subconsulta y filtra fuera.",
    "42P19": () => "La CTE recursiva está mal montada: la parte que se llama a sí misma va después de `UNION ALL` y usa la CTE una sola vez.",
    "22014": () => "`NTILE` necesita un número de grupos mayor que 0.",
    "21000": () => "Una subconsulta que debía devolver un solo valor devuelve varios.",
    "25P02": () => "Un error anterior ha dejado la transacción bloqueada: haz `ROLLBACK;` y vuelve a empezar.",
    "25001": () => "Esa orden no se puede usar aquí: no funciona dentro de una transacción (y en SQLearning todo lo que ejecutas va dentro de una, para no romper nada).",
    "42P05": () => "Ya existe una consulta preparada con ese nombre.",
    "54000": () => "El resultado es demasiado grande para PostgreSQL. Prueba con algo más pequeño.",
    "53200": () => "PostgreSQL se ha quedado sin memoria con esa consulta. Prueba con algo más pequeño.",
    "58P01": () => "PostgreSQL no puede leer archivos del ordenador desde aquí.",
    "42501": () => "No tienes permiso para hacer eso.",
    "0A000": () => "PostgreSQL no permite esa operación (no está disponible o no tiene sentido aquí).",
    "STDIN": () => "`COPY … FROM STDIN` sirve para cargar datos desde la consola de PostgreSQL y aquí no está disponible. Para añadir filas usa `INSERT INTO … VALUES …`.",
    "CARGA": () => "No se ha podido cargar el motor de PostgreSQL (¿se ha cortado la conexión?). Recarga la página.",
    "REINICIO": () => "El motor se ha reiniciado a mitad de la consulta. Vuelve a ejecutarla.",
    "TIEMPO": () => "La consulta tardó demasiado y se ha cortado. ¿Hay un bucle sin fin (una CTE recursiva sin condición de parada) o un cruce de tablas enorme?"
  };

  window.TRADUCTOR = {
    /** Nombres de tablas y columnas del esquema actual, para las sugerencias. */
    conocer(esquema) {
      tablas = esquema.map(t => t.nombre);
      columnas = [...new Set(esquema.flatMap(t => t.columnas.map(c => c.nombre)))];
      tablasDe = Object.fromEntries(esquema.map(t => [t.nombre, t.columnas.map(c => c.nombre)]));
    },
    /** Explicación en español de un error { mensaje, codigo, posicion, detalle, pista }. */
    explicar(e, sql = "") {
      const fn = CODIGOS[e?.codigo];
      try { if (fn) return fn(e, sql); } catch (x) { /* si falla, mensaje genérico */ }
      return "PostgreSQL no ha podido ejecutar la consulta. Lee el mensaje original de abajo por si da una pista.";
    }
  };
})();
