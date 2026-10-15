/* ============================================================
   SQLearning · Revisor de consultas
   Se compara el RESULTADO, no cómo está escrita la consulta.
   Ver docs/FORMATO_LECCION.md («Cómo se revisa»).
   ============================================================ */
(function () {
  const TOLERANCIA = 1e-9;        // relativa: solo absorbe errores de redondeo de coma flotante
  const NUMERICOS = new Set(["integer", "bigint", "smallint", "numeric", "real", "double precision"]);
  const FECHAS = new Set(["date", "timestamp", "timestamptz"]);

  // Parte el SQL en sentencias (respetando comillas, $$ y comentarios)
  function sentencias(sql) {
    return MOTOR.sinTextos(sql).split(";").map(s => s.trim()).filter(Boolean);
  }

  // Quita lo que está entre paréntesis (subconsultas, funciones) para mirar solo el nivel principal
  function sinParentesis(s) {
    let antes;
    do { antes = s; s = s.replace(/\([^()]*\)/g, " "); } while (s !== antes);
    return s;
  }
  const nivelPrincipal = sql => sinParentesis(MOTOR.sinTextos(sql));

  function bienEscrita(sql, { varias = false } = {}) {
    const sinComentarios = MOTOR.sinComentarios(sql).trim();
    if (!sinComentarios) return { ok: false, mensaje: "Aún no has escrito ninguna consulta." };
    if (!sinComentarios.endsWith(";"))
      return { ok: false, mensaje: "Termina la consulta con punto y coma `;`: así sabe PostgreSQL dónde acaba." };
    const n = sentencias(sql).length;
    if (!varias && n > 1)
      return { ok: false, mensaje: `Has escrito ${n} consultas. Aquí se pide **una sola** (un único \`;\` al final).` };
    return { ok: true };
  }

  function ordenImporta(solucion) {
    return /\bORDER\s+BY\b/i.test(nivelPrincipal(solucion));
  }

  /**
   * Columnas (índices) por las que ordena el ORDER BY principal de `sql`, si todas son columnas
   * del resultado (por nombre, alias o posición). Sirve para tolerar empates. null si no se sabe.
   */
  function clavesOrden(sql, columnas) {
    // Conserva los nombres entre comillas dobles; vacía textos y quita comentarios y paréntesis
    const limpio = sinParentesis(MOTOR.sinComentarios(sql)
      .replace(/'(?:[^']|'')*'/g, "''")
      .replace(/\$([A-Za-z_]\w*)?\$[\s\S]*?\$\1\$/g, "''"));
    const trozos = [...limpio.matchAll(/\bORDER\s+BY\b([\s\S]*?)(?=\bLIMIT\b|\bOFFSET\b|\bFETCH\b|;|$)/gi)];
    if (!trozos.length) return null;
    const claves = [];
    for (const item of trozos[trozos.length - 1][1].split(",")) {
      const expr = item.replace(/\s+(ASC|DESC|NULLS\s+(FIRST|LAST)|USING\b)[\s\S]*$/i, "").trim();
      let i;
      if (/^\d+$/.test(expr)) i = Number(expr) - 1;
      else if (/^("(?:[^"]|"")+"|[\wÀ-ɏ]+)(\.("(?:[^"]|"")+"|[\wÀ-ɏ]+))?$/.test(expr)) {
        const ultimo = expr.split(".").pop();
        i = ultimo.startsWith('"')
          ? columnas.indexOf(ultimo.slice(1, -1).replace(/""/g, '"'))
          : columnas.findIndex(c => c.toLowerCase() === ultimo.toLowerCase());
      } else return null;               // ordena por una expresión: no se puede saber
      if (i < 0 || i >= columnas.length) return null;
      claves.push(i);
    }
    return claves;
  }

  // Valor comparable: números como número, fechas sin la hora 00:00:00, enormes como texto exacto; NULL aparte
  function normal(v, tipo) {
    if (v === null || v === undefined) return null;
    if (FECHAS.has(tipo) && typeof v === "string") {
      const m = v.match(/^(\d{4}-\d{2}-\d{2})(?:[ T]00:00:00(?:\.0+)?)?(?:[+-]00(?::00)?)?$/);
      return m ? m[1] : v.replace(/[+-]00(?::00)?$/, "");
    }
    if (NUMERICOS.has(tipo) || typeof v === "number") {
      if (typeof v === "string") {
        const digitos = v.replace(/^-|\.|e.*$/gi, "").replace(/^0+/, "").length;
        if (/^-?\d+(\.\d+)?$/.test(v) && digitos > 15)               // no cabe exacto en un número de JS
          return "n:" + v.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
      }
      const n = Number(v);
      return Number.isNaN(n) ? String(v) : n;
    }
    return String(v);
  }

  function iguales(a, b) {
    if (a === null || b === null) return a === b;
    if (typeof a === "number" && typeof b === "number")
      return a === b || Math.abs(a - b) <= TOLERANCIA * Math.max(1, Math.abs(a), Math.abs(b));
    return String(a) === String(b);
  }

  const clave = fila => JSON.stringify(fila.map(v => typeof v === "number" ? Number(v.toPrecision(12)) : v));
  const normalizar = r => r.filas.map(f => f.map((v, i) => normal(v, r.tipos[i])));
  const lista = nombres => nombres.map(n => "`" + n + "`").join(", ");
  const plural = (n, uno, varios) => n === 1 ? uno : varios;
  const filaIgual = (x, y) => x.every((v, i) => iguales(v, y[i]));

  // Mismas filas (contando repetidas) sin mirar el orden; devuelve cuántas de `esperadas` no encuentran pareja
  function sinPareja(alumnas, esperadas) {
    const usadas = new Set();
    return esperadas.filter(f => {
      const i = alumnas.findIndex((g, j) => !usadas.has(j) && filaIgual(g, f));
      if (i >= 0) { usadas.add(i); return false; }
      return true;
    }).length;
  }

  // ¿Respeta el orden? Con claves: dentro de cada grupo empatado de la solución, cualquier orden vale
  function ordenCorrecto(fa, fe, claves) {
    if (!claves) return fa.every((f, i) => filaIgual(f, fe[i]));
    let i = 0;
    while (i < fe.length) {
      let j = i + 1;
      while (j < fe.length && claves.every(k => iguales(fe[j][k], fe[i][k]))) j++;
      // Las filas del alumno en las posiciones i..j-1 deben ser las mismas del grupo, en cualquier orden
      if (sinPareja(fa.slice(i, j), fe.slice(i, j))) return false;
      i = j;
    }
    return true;
  }

  /** Compara dos resultados { columnas, tipos, filas }. Devuelve { ok, mensaje }. */
  function comparar(alumno, esperado, { orden = false, nombres = true, claves = null } = {}) {
    if (!alumno || !alumno.columnas.length)
      return { ok: false, mensaje: "Tu consulta no devuelve ninguna tabla. ¿Has empezado con `SELECT`?" };

    // 1. Columnas
    const ca = alumno.columnas.map(c => c.toLowerCase());
    const ce = esperado.columnas.map(c => c.toLowerCase());
    if (nombres) {
      const faltan = esperado.columnas.filter((c, i) => !ca.includes(ce[i]));
      const sobran = alumno.columnas.filter((c, i) => !ce.includes(ca[i]));
      if (faltan.length || sobran.length) {
        const partes = [];
        if (faltan.length) partes.push(`${plural(faltan.length, "falta la columna", "faltan las columnas")} ${lista(faltan)}`);
        if (sobran.length) partes.push(`${plural(sobran.length, "sobra la columna", "sobran las columnas")} ${lista(sobran)}`);
        const txt = partes.join(" y ");
        return { ok: false, mensaje: txt[0].toUpperCase() + txt.slice(1) + "." };
      }
      if (ca.join("\u0000") !== ce.join("\u0000"))
        return { ok: false, mensaje: `Las columnas están bien, pero en otro orden. Deben salir así: ${lista(esperado.columnas)}.` };
    } else if (ca.length !== ce.length) {
      return { ok: false, mensaje: `Tu resultado tiene ${ca.length} ${plural(ca.length, "columna", "columnas")} y debería tener ${ce.length}.` };
    }

    // 2. Filas
    const fa = normalizar(alumno), fe = normalizar(esperado);
    if (fa.length !== fe.length) {
      const d = fa.length - fe.length;
      return { ok: false, mensaje: d > 0
        ? `Te ${plural(d, "sobra", "sobran")} ${d} ${plural(d, "fila", "filas")}: devuelves ${fa.length} y deberían ser ${fe.length}.`
        : `Te ${plural(-d, "falta", "faltan")} ${-d} ${plural(-d, "fila", "filas")}: devuelves ${fa.length} y deberían ser ${fe.length}.` };
    }
    // Atajo rápido por claves exactas; si no cuadra, emparejamiento con tolerancia
    const contar = filas => filas.reduce((m, f) => m.set(clave(f), (m.get(clave(f)) || 0) + 1), new Map());
    const ma = contar(fa), me = contar(fe);
    let distintas = 0;
    for (const [k, n] of me) distintas += Math.max(0, n - (ma.get(k) || 0));
    if (distintas) distintas = sinPareja(fa, fe);
    if (distintas)
      return { ok: false, mensaje: `Devuelves el número correcto de filas, pero ${distintas} ${plural(distintas, "no coincide", "no coinciden")} con lo que se pide. Revisa los valores (¿la columna correcta? ¿el cálculo?).` };

    // 3. Orden (tolerando empates si se conocen las claves del ORDER BY)
    if (orden && !ordenCorrecto(fa, fe, claves))
      return { ok: false, mensaje: "Las filas son las correctas, pero no están en el orden que se pide. Revisa el `ORDER BY`." };

    return { ok: true, mensaje: "¡Correcto!" };
  }

  // Ejecuta una consulta dentro de una sesión y devuelve el resultado que se compara
  async function resultadoDe(sql, paso) {
    return MOTOR.sesion(async db => {
      const lista = await db.ejecutar(sql);
      if (paso.verificar) return db.consulta(paso.verificar);
      const conColumnas = lista.filter(r => r.columnas.length);
      return conColumnas[conColumnas.length - 1] || null;
    });
  }

  /** Revisa un paso `ejercicio` / `arreglar`. Devuelve { ok, mensaje, error? }. */
  async function revisarEjercicio(paso, sql) {
    const escrita = bienEscrita(sql, paso);
    if (!escrita.ok) return escrita;
    let alumno;
    try {
      alumno = await resultadoDe(sql, paso);
    } catch (e) {
      const error = MOTOR.errorAlumno(e, sql);
      return { ok: false, error, mensaje: error.explicacion || error.mensaje };
    }
    const esperado = await resultadoDe(paso.solucion, paso);
    const fuenteOrden = paso.verificar || paso.solucion;
    const orden = paso.orden === undefined || paso.orden === "auto" ? ordenImporta(fuenteOrden) : !!paso.orden;
    const claves = orden && esperado ? clavesOrden(fuenteOrden, esperado.columnas) : null;
    return comparar(alumno, esperado, { orden, nombres: paso.nombres !== false, claves });
  }

  /**
   * Revisa un `reto` (o una parte de un `caso`): cada comprobación más la de «bien escrita».
   * Devuelve { ok, filas: [{ texto, ok }], error? }.
   */
  async function revisarReto(paso, sql) {
    const escrita = bienEscrita(sql, paso);
    const filaEscrita = { texto: "Tu consulta está bien escrita (termina en `;` y no da error)", ok: escrita.ok };
    if (!escrita.ok)
      return { ok: false, mensaje: escrita.mensaje, filas: paso.comprobaciones.map(c => ({ texto: c.texto, ok: false })).concat(filaEscrita) };
    try {
      return await MOTOR.sesion(async db => {
        const lista = await db.ejecutar(sql);
        const conColumnas = lista.filter(r => r.columnas.length);
        const r = conColumnas[conColumnas.length - 1] || { columnas: [], tipos: [], filas: [], afectadas: lista.at(-1)?.afectadas || 0 };
        window.PRUEBA?._sql(sql);
        const filas = [];
        for (const c of paso.comprobaciones) {
          let ok = false;
          try { ok = !!(await c.prueba(r, db, sql)); } catch (e) { ok = false; }
          filas.push({ texto: c.texto, ok });
        }
        filas.push(filaEscrita);
        const ok = filas.every(f => f.ok);
        // Extra de eficiencia (opcional): solo si el reto ya está superado
        let bonus = false;
        if (ok && paso.bonus) { try { bonus = !!(await paso.bonus.prueba(r, db, sql)); } catch (e) { bonus = false; } }
        return { ok, filas, bonus };
      });
    } catch (e) {
      const error = MOTOR.errorAlumno(e, sql);
      filaEscrita.ok = false;
      return { ok: false, error, mensaje: error.explicacion || error.mensaje,
               filas: paso.comprobaciones.map(c => ({ texto: c.texto, ok: false })).concat(filaEscrita) };
    }
  }

  // Respuestas escritas (pasos `interpretar`): sin mayúsculas, tildes, signos ni espacios de más (la ñ sí cuenta)
  function normalizarTexto(s) {
    return String(s ?? "").toLowerCase().replace(/ñ/g, "\u0001").normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/\u0001/g, "ñ").replace(/[¡!¿?.,;:«»"'…()\-]/g, " ").replace(/\s+/g, " ").trim();
  }
  /** ¿La respuesta escrita coincide con paso.respuesta (texto, lista de textos válidos o número con tolerancia)? */
  function respuestaCorrecta(dada, paso) {
    if (typeof paso.respuesta === "number") {
      const n = Number(String(dada).replace(/\s/g, "").replace(",", "."));
      return Number.isFinite(n) && Math.abs(n - paso.respuesta) <= (paso.tolerancia || 0) + 1e-9;
    }
    return [].concat(paso.respuesta).map(normalizarTexto).includes(normalizarTexto(dada));
  }

  window.REVISOR = { bienEscrita, ordenImporta, clavesOrden, comparar, revisarEjercicio, revisarReto, resultadoDe, sentencias,
    normalizarTexto, respuestaCorrecta };
})();
