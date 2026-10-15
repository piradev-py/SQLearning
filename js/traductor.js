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

  const CODIGOS = {
    "42601": (e) => {
      const cerca = entre(e.mensaje, /at or near "([^"]*)"/);
      if (/at end of input/.test(e.mensaje))
        return "La consulta se corta antes de tiempo: falta algo al final (¿una columna después de la coma? ¿cerrar un paréntesis o una comilla?).";
      if (cerca && /^(FROM|WHERE|ORDER|GROUP|LIMIT|HAVING)$/i.test(cerca))
        return `PostgreSQL no esperaba \`${cerca}\` ahí. Mira justo antes: ¿sobra una coma o falta una columna?`;
      return cerca
        ? `Hay algo mal escrito cerca de \`${cerca}\`. Revisa comas, comillas y el orden de las palabras.`
        : "Hay algo mal escrito en la consulta. Revisa comas, comillas y el orden de las palabras.";
    },
    "42P01": (e) => {
      const n = entre(e.mensaje, /relation "([^"]+)"/);
      const sug = n && parecido(n, tablas);
      return `No existe ninguna tabla llamada \`${n}\`.` + (sug ? ` ¿Querías decir \`${sug}\`?` : " Mira los nombres en la pestaña Esquema.");
    },
    "42703": (e) => {
      const n = entre(e.mensaje, /column "?([^" ]+)"? does not exist/) || entre(e.mensaje, /column ([\w.]+) does not exist/);
      const corto = n && n.split(".").pop();
      const sug = corto && parecido(corto, columnas);
      let txt = `No existe ninguna columna llamada \`${corto}\`.`;
      if (sug) txt += ` ¿Querías decir \`${sug}\`?`;
      if (e.pista && /quote/.test(e.pista)) txt += " Ojo: los textos van entre comillas simples `'así'`; las dobles son para nombres de columnas.";
      return txt;
    },
    "42702": (e) => `El nombre \`${entre(e.mensaje, /"([^"]+)"/)}\` está en varias tablas: escribe delante de qué tabla es (\`tabla.columna\`).`,
    "42883": (e) => {
      const fn = entre(e.mensaje, /function ([\w.]+)\(/) || entre(e.mensaje, /operator does not exist: (.+)$/);
      return /operator/.test(e.mensaje)
        ? `No se puede usar ese operador con estos tipos de datos (${fn}). ¿Estás mezclando texto y números?`
        : `La función \`${fn}\` no existe o no acepta esos datos. Revisa cómo se escribe y qué le pasas entre paréntesis.`;
    },
    "42803": (e) => {
      const n = entre(e.mensaje, /column "([^"]+)"/);
      return `La columna \`${n}\` tiene que ir en el \`GROUP BY\` o dentro de una función como \`COUNT\`, \`SUM\`… Al agrupar, cada columna debe tener un solo valor por grupo.`;
    },
    "42804": () => "Los tipos de datos no encajan: estás mezclando, por ejemplo, texto con números o fechas.",
    "22P02": (e) => `El valor ${entre(e.mensaje, /: (".*")$/) || ""} no tiene el formato que espera la columna (¿un texto donde va un número o una fecha?).`,
    "22007": () => "La fecha u hora no tiene un formato válido. Escríbela así: `'2024-03-31'`.",
    "22008": () => "Esa fecha no existe o se sale de rango.",
    "22012": () => "Estás dividiendo entre cero. Usa `NULLIF(divisor, 0)` para evitarlo.",
    "23505": (e) => `Ya existe una fila con ese valor y la columna no admite repetidos (${e.detalle || "restricción UNIQUE"}).`,
    "23503": (e) => `Esa fila apunta a otra que no existe (o la estás borrando y otras dependen de ella). ${e.detalle || ""}`.trim(),
    "23502": (e) => `La columna \`${entre(e.mensaje, /column "([^"]+)"/)}\` no puede quedar vacía (NOT NULL).`,
    "23514": (e) => `El valor no cumple la regla \`${entre(e.mensaje, /constraint "([^"]+)"/)}\` (CHECK) de la tabla.`,
    "42P07": (e) => `Ya existe algo llamado \`${entre(e.mensaje, /"([^"]+)"/)}\`.`,
    "42712": (e) => `Usas el mismo alias \`${entre(e.mensaje, /"([^"]+)"/)}\` dos veces.`,
    "42P10": () => "En `ORDER BY` con `DISTINCT`, solo puedes ordenar por columnas que estén en el `SELECT`.",
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
    },
    /** Explicación en español de un error { mensaje, codigo, posicion, detalle, pista }. */
    explicar(e) {
      const fn = CODIGOS[e?.codigo];
      try { if (fn) return fn(e); } catch (x) { /* si falla, mensaje genérico */ }
      return "PostgreSQL no ha podido ejecutar la consulta. Lee el mensaje original de abajo por si da una pista.";
    }
  };
})();
