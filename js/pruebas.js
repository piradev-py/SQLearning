/* ============================================================
   SQLearning · Ayudantes PRUEBA para las comprobaciones de retos
   r = { columnas, tipos, filas } del alumno; db = sesión abierta.
   Nunca lanzan error: si falta algo, devuelven false / null.
   ============================================================ */
(function () {
  let sqlActual = "";
  const indice = (r, col) => (r?.columnas || []).findIndex(c => c.toLowerCase() === String(col).toLowerCase());
  const comoNumero = v => (v === null || v === "" || Number.isNaN(Number(v)) ? v : Number(v));

  window.PRUEBA = {
    _sql(sql) { sqlActual = sql; },

    /** ¿Tiene exactamente esas columnas (en ese orden, sin distinguir mayúsculas)? */
    columnas(r, nombres) {
      const c = (r?.columnas || []).map(x => x.toLowerCase());
      return c.length === nombres.length && nombres.every((n, i) => c[i] === n.toLowerCase());
    },

    /** ¿Tiene al menos esas columnas, en cualquier orden? */
    tieneColumnas(r, nombres) {
      return nombres.every(n => indice(r, n) >= 0);
    },

    /** ¿Las filas están ordenadas por esa columna? */
    ordenado(r, col, sentido = "asc") {
      const i = indice(r, col);
      if (i < 0) return false;
      const v = r.filas.map(f => comoNumero(f[i]));
      for (let k = 1; k < v.length; k++) {
        const a = v[k - 1], b = v[k];
        if (a === null || b === null) continue;
        const cmp = typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b), "es");
        if (sentido === "asc" ? cmp > 0 : cmp < 0) return false;
      }
      return true;
    },

    /** Valor de una celda (fila desde 0, columna por nombre o posición). */
    valor(r, fila, col) {
      const i = typeof col === "number" ? col : indice(r, col);
      const v = r?.filas?.[fila]?.[i];
      return v === undefined ? null : comoNumero(v);
    },

    /** ¿Alguna fila tiene ese valor en esa columna? */
    contiene(r, col, valor) {
      const i = indice(r, col);
      return i >= 0 && r.filas.some(f => String(comoNumero(f[i])) === String(valor));
    },

    /** ¿El resultado es igual al de esta consulta? (misma regla que los ejercicios) */
    async igualA(r, db, sql, { orden = "auto", nombres = true } = {}) {
      const esperado = await db.consulta(sql);
      const o = orden === "auto" ? REVISOR.ordenImporta(sql) : orden;
      return REVISOR.comparar(r, esperado, { orden: o, nombres }).ok;
    },

    /** La consulta del alumno sin comentarios (con { comentarios: true }, tal cual). */
    codigo({ comentarios = false } = {}) {
      return comentarios ? sqlActual : sqlActual.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
    }
  };
})();
