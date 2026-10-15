/* ============================================================
   SQLearning · Vistas del resultado
   RESULTADO.tabla(div, r)        → tabla de filas (máx. 500 visibles)
   RESULTADO.esquema(div, esquema) → fichas de tablas, columnas y claves
   RESULTADO.error(div, error)     → explicación de novato + original
   RESULTADO.aviso(div, texto)     → mensaje simple (DML, vacío…)
   ============================================================ */
(function () {
  const MAX_FILAS = 500;
  const NUMERICOS = new Set(["integer", "bigint", "smallint", "numeric", "real", "double precision"]);
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  // Mini-markdown: `código` y **negrita**
  const md = s => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const plural = (n, uno, varios) => `${n.toLocaleString("es")} ${n === 1 ? uno : varios}`;

  const TIPO_CORTO = {
    integer: "entero", bigint: "entero", smallint: "entero", numeric: "decimal", real: "decimal",
    "double precision": "decimal", text: "texto", varchar: "texto", "character varying": "texto", char: "texto",
    boolean: "sí/no", date: "fecha", timestamp: "fecha y hora", "timestamp without time zone": "fecha y hora",
    timestamptz: "fecha y hora", "timestamp with time zone": "fecha y hora", time: "hora", interval: "intervalo"
  };
  const tipoCorto = t => TIPO_CORTO[t] || t;

  function celda(v, tipo) {
    if (v === null || v === undefined) return `<td class="r-nulo">NULL</td>`;
    if (tipo === "boolean") return `<td class="r-bool">${v ? "true" : "false"}</td>`;
    const num = NUMERICOS.has(tipo);
    return `<td${num ? ' class="r-num"' : ""}>${esc(v)}</td>`;
  }

  function tabla(div, r) {
    if (!r || !r.columnas.length) {
      return aviso(div, r && r.afectadas
        ? `✔️ La consulta ha cambiado ${plural(r.afectadas, "fila", "filas")}. (Es práctica: al terminar se deshace sola.)`
        : "✔️ Consulta ejecutada. No devuelve ninguna tabla.");
    }
    const visibles = r.filas.slice(0, MAX_FILAS);
    div.innerHTML = `
      <div class="r-tabla-marco" tabindex="0" role="region" aria-label="Resultado de la consulta">
        <table class="r-tabla">
          <thead><tr><th class="r-n" aria-label="Número de fila">#</th>${r.columnas.map((c, i) =>
            `<th${NUMERICOS.has(r.tipos[i]) ? ' class="r-num"' : ""}><span>${esc(c)}</span><small>${esc(tipoCorto(r.tipos[i]))}</small></th>`).join("")}</tr></thead>
          <tbody>${visibles.map((f, n) =>
            `<tr><td class="r-n">${n + 1}</td>${f.map((v, i) => celda(v, r.tipos[i])).join("")}</tr>`).join("")}</tbody>
        </table>
        ${r.filas.length ? "" : `<p class="r-vacio">La consulta funciona, pero no devuelve ninguna fila.</p>`}
      </div>
      ${r.filas.length > MAX_FILAS ? `<p class="r-nota">Se muestran las primeras ${MAX_FILAS} de ${plural(r.filas.length, "fila", "filas")}.</p>` : ""}`;
  }

  function esquema(div, tablas) {
    div.innerHTML = `<div class="r-esquema">${tablas.map(t => `
      <section class="r-ficha" aria-label="Tabla ${esc(t.nombre)}">
        <header><span class="r-ficha-nombre">${esc(t.nombre)}</span><span class="r-ficha-filas">${plural(t.filas, "fila", "filas")}</span></header>
        <ul>${t.columnas.map(c => `
          <li>
            <span class="r-col">${c.pk ? '<span title="Clave primaria: identifica cada fila" aria-label="Clave primaria">🔑</span> ' : ""}${esc(c.nombre)}</span>
            <span class="r-col-tipo">${esc(tipoCorto(c.tipo))}${c.nulo ? "" : ' <abbr title="NOT NULL: no puede estar vacía">obligatoria</abbr>'}</span>
            ${c.fk ? `<span class="r-col-fk">→ ${esc(c.fk.tabla)}.${esc(c.fk.columna)}</span>` : ""}
          </li>`).join("")}
        </ul>
      </section>`).join("")}</div>`;
  }

  function error(div, e) {
    const donde = e.linea ? `<span class="r-error-linea">Línea ${e.linea}</span>` : "";
    div.innerHTML = `
      <div class="r-error" role="alert">
        <p class="r-error-titulo">🤔 Algo no ha ido bien ${donde}</p>
        <p>${md(e.explicacion || e.mensaje)}</p>
        ${e.codigo && e.codigo !== "TIEMPO" ? `<details><summary>Mensaje original de PostgreSQL</summary>
          <pre>${esc(e.mensaje)}${e.detalle ? "\n" + esc(e.detalle) : ""}${e.pista ? "\nHINT: " + esc(e.pista) : ""}</pre></details>` : ""}
      </div>`;
  }

  function aviso(div, texto) {
    div.innerHTML = `<p class="r-aviso">${md(texto)}</p>`;
  }

  window.RESULTADO = { tabla, esquema, error, aviso, md, esc, tipoCorto };
})();
