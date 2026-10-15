/* ============================================================
   SQLearning · Revisor de consultas
   Se compara el RESULTADO, no cómo está escrita la consulta.
   Ver docs/FORMATO_LECCION.md («Cómo se revisa»).
   ============================================================ */
(function () {
  const TOLERANCIA = 1e-6;
  const NUMERICOS = new Set(["integer", "bigint", "smallint", "numeric", "real", "double precision"]);

  // Parte el SQL en sentencias (respetando comillas y comentarios)
  function sentencias(sql) {
    const limpio = MOTOR.sinTextos(sql);
    return limpio.split(";").map(s => s.trim()).filter(Boolean);
  }

  // Quita todo lo que esté entre paréntesis (subconsultas, funciones) para mirar solo el nivel principal
  function nivelPrincipal(sql) {
    let s = MOTOR.sinTextos(sql), antes;
    do { antes = s; s = s.replace(/\([^()]*\)/g, " "); } while (s !== antes);
    return s;
  }

  function bienEscrita(sql, { varias = false } = {}) {
    const sinComentarios = sql.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "").trim();
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

  // Valor comparable: números como número, el resto como texto; NULL aparte
  function normal(v, tipo) {
    if (v === null || v === undefined) return null;
    if (NUMERICOS.has(tipo) || typeof v === "number") {
      const n = Number(v);
      return Number.isNaN(n) ? String(v) : n;
    }
    return String(v);
  }

  function iguales(a, b) {
    if (a === null || b === null) return a === b;
    if (typeof a === "number" && typeof b === "number")
      return Math.abs(a - b) <= TOLERANCIA * Math.max(1, Math.abs(a), Math.abs(b));
    return String(a) === String(b);
  }

  const clave = fila => JSON.stringify(fila.map(v => typeof v === "number" ? Number(v.toFixed(6)) : v));
  const normalizar = r => r.filas.map(f => f.map((v, i) => normal(v, r.tipos[i])));
  const lista = nombres => nombres.map(n => "`" + n + "`").join(", ");
  const plural = (n, uno, varios) => n === 1 ? uno : varios;

  /** Compara dos resultados { columnas, tipos, filas }. Devuelve { ok, mensaje }. */
  function comparar(alumno, esperado, { orden = false, nombres = true } = {}) {
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
      if (ca.join() !== ce.join())
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
    const filaIgual = (x, y) => x.every((v, i) => iguales(v, y[i]));

    // Mismas filas sin mirar el orden (contando repetidas)
    const contar = filas => filas.reduce((m, f) => m.set(clave(f), (m.get(clave(f)) || 0) + 1), new Map());
    const ma = contar(fa), me = contar(fe);
    let distintas = 0;
    for (const [k, n] of me) distintas += Math.max(0, n - (ma.get(k) || 0));
    if (distintas) {
      // Puede ser solo por decimales: comparación fila a fila con tolerancia
      const usadas = new Set();
      distintas = fe.filter(f => {
        const i = fa.findIndex((g, j) => !usadas.has(j) && filaIgual(g, f));
        if (i >= 0) { usadas.add(i); return false; }
        return true;
      }).length;
    }
    if (distintas)
      return { ok: false, mensaje: `Devuelves el número correcto de filas, pero ${distintas} ${plural(distintas, "no coincide", "no coinciden")} con lo que se pide. Revisa los valores (¿la columna correcta? ¿el cálculo?).` };

    // 3. Orden
    if (orden && !fa.every((f, i) => filaIgual(f, fe[i])))
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
    }, sql);
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
    const orden = paso.orden === undefined || paso.orden === "auto" ? ordenImporta(paso.solucion) : !!paso.orden;
    return comparar(alumno, esperado, { orden, nombres: paso.nombres !== false });
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
        return { ok: filas.every(f => f.ok), filas };
      }, sql);
    } catch (e) {
      const error = MOTOR.errorAlumno(e, sql);
      filaEscrita.ok = false;
      return { ok: false, error, mensaje: error.explicacion || error.mensaje,
               filas: paso.comprobaciones.map(c => ({ texto: c.texto, ok: false })).concat(filaEscrita) };
    }
  }

  window.REVISOR = { bienEscrita, ordenImporta, comparar, revisarEjercicio, revisarReto, resultadoDe, sentencias };
})();
