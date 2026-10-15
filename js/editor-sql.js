/* ============================================================
   SQLearning · Editor SQL
   Un <textarea> transparente encima de un <pre> que pinta el SQL
   con colores. Números de línea, autocompletado (palabras clave,
   funciones, tablas y columnas del esquema), Ctrl+Enter ejecuta,
   Tab sangra (Esc y luego Tab sale del editor), marca de error.
   Uso: const ed = EDITOR_SQL.crear(div, { valor, alEjecutar, alCambiar })
        ed.valor() · ed.poner(txt) · ed.foco() · ed.conocer(esquema)
        ed.marcarError(linea) · ed.limpiarError()
   ============================================================ */
(function () {
  const PALABRAS = `SELECT FROM WHERE AND OR NOT IN IS NULL AS DISTINCT ORDER BY ASC DESC LIMIT OFFSET
    GROUP HAVING JOIN INNER LEFT RIGHT FULL OUTER CROSS ON USING UNION ALL INTERSECT EXCEPT WITH RECURSIVE
    CASE WHEN THEN ELSE END BETWEEN LIKE ILIKE EXISTS ANY INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE
    VIEW INDEX DROP ALTER ADD COLUMN PRIMARY KEY FOREIGN REFERENCES UNIQUE CHECK DEFAULT CONSTRAINT BEGIN
    COMMIT ROLLBACK TRUE FALSE OVER PARTITION ROWS RANGE PRECEDING FOLLOWING CURRENT ROW UNBOUNDED FILTER
    NULLS FIRST LAST INTERVAL FETCH ONLY NEXT EXPLAIN ANALYZE RETURNING TRUNCATE`.split(/\s+/).filter(Boolean);
  const FUNCIONES = `COUNT SUM AVG MIN MAX ROUND COALESCE NULLIF UPPER LOWER LENGTH TRIM REPLACE SUBSTRING
    CONCAT NOW CURRENT_DATE EXTRACT DATE_TRUNC TO_CHAR CAST ROW_NUMBER RANK DENSE_RANK LAG LEAD NTILE ABS
    CEIL FLOOR SPLIT_PART STRING_AGG GENERATE_SERIES PERCENTILE_CONT STDDEV CORR AGE`.split(/\s+/).filter(Boolean);
  const TIPOS = `integer bigint numeric text varchar boolean date timestamp`.split(" ");
  const ES_PALABRA = new Set(PALABRAS);
  const ES_FUNCION = new Set(FUNCIONES);
  const SANGRIA = "  ";

  const escapar = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Trocea el SQL en fichas con su clase de color
  const FICHAS = /(--[^\n]*)|(\/\*[\s\S]*?(?:\*\/|$))|('(?:[^']|'')*'?)|("(?:[^"]|"")*"?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_À-ɏ][\wÀ-ɏ]*)|(\s+)|([\s\S])/g;

  function resaltar(sql, tablas) {
    let html = "", m;
    FICHAS.lastIndex = 0;
    while ((m = FICHAS.exec(sql))) {
      const t = escapar(m[0]);
      if (m[1] || m[2]) html += `<span class="sql-comentario">${t}</span>`;
      else if (m[3]) html += `<span class="sql-texto">${t}</span>`;
      else if (m[4]) html += `<span class="sql-nombre">${t}</span>`;
      else if (m[5]) html += `<span class="sql-numero">${t}</span>`;
      else if (m[6]) {
        const mayus = m[6].toUpperCase();
        const siguiente = sql.slice(FICHAS.lastIndex).match(/^\s*\(/);
        if (ES_PALABRA.has(mayus)) html += `<span class="sql-clave">${t}</span>`;
        else if (tablas.has(m[6].toLowerCase())) html += `<span class="sql-tabla">${t}</span>`;
        else if (siguiente || ES_FUNCION.has(mayus)) html += `<span class="sql-funcion">${t}</span>`;
        else html += t;
      }
      else if (m[8] && /[;,()*=<>+\-/|.]/.test(m[8])) html += `<span class="sql-signo">${t}</span>`;
      else html += t;
    }
    // Una línea vacía al final también ocupa sitio
    return html + "\n ";
  }

  function crear(contenedor, opciones = {}) {
    contenedor.classList.add("editor-sql");
    contenedor.innerHTML = `
      <div class="es-numeros" aria-hidden="true"><div class="es-numeros-dentro"></div></div>
      <div class="es-zona">
        <pre class="es-resaltado" aria-hidden="true"><code></code></pre>
        <textarea class="es-texto" spellcheck="false" autocapitalize="off" autocomplete="off"
          autocorrect="off" wrap="off" aria-label="${opciones.etiqueta || "Editor de SQL"}"></textarea>
      </div>
      <ul class="es-sugerencias" role="listbox" aria-label="Sugerencias" hidden></ul>`;

    const area = contenedor.querySelector(".es-texto");
    const pre = contenedor.querySelector(".es-resaltado");
    const codigo = pre.querySelector("code");
    const numeros = contenedor.querySelector(".es-numeros-dentro");
    const lista = contenedor.querySelector(".es-sugerencias");

    let tablas = new Set();
    let columnasDe = {};        // tabla -> [columnas]
    let todasColumnas = [];
    let lineaError = null;
    let salirConTab = false;    // tras Esc, Tab sale del editor (accesibilidad)
    let sugerencias = [], elegida = 0, palabraActual = null;

    // --- Pintar -----------------------------------------------------------
    function pintar() {
      const txt = area.value;
      codigo.innerHTML = resaltar(txt, tablas);
      const n = txt.split("\n").length;
      let h = "";
      for (let i = 1; i <= n; i++) h += `<div${i === lineaError ? ' class="es-error"' : ""}>${i}</div>`;
      numeros.innerHTML = h;
      sincronizarScroll();
    }
    function sincronizarScroll() {
      pre.style.transform = `translate(${-area.scrollLeft}px, ${-area.scrollTop}px)`;
      numeros.style.transform = `translateY(${-area.scrollTop}px)`;
    }

    // --- Medidas para colocar las sugerencias junto al cursor -----------------
    function medidas() {
      const cs = getComputedStyle(area);
      const prueba = document.createElement("span");
      prueba.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font:${cs.font}`;
      prueba.textContent = "MMMMMMMMMM";
      document.body.append(prueba);
      const ancho = prueba.getBoundingClientRect().width / 10;
      prueba.remove();
      return { ancho, alto: parseFloat(cs.lineHeight), izq: parseFloat(cs.paddingLeft), arriba: parseFloat(cs.paddingTop) };
    }

    // --- Insertar texto conservando el «deshacer» del navegador ---------------
    function insertar(texto, desde = area.selectionStart, hasta = area.selectionEnd) {
      area.setSelectionRange(desde, hasta);
      if (!document.execCommand || !document.execCommand("insertText", false, texto)) {
        area.setRangeText(texto, desde, hasta, "end");
        area.dispatchEvent(new Event("input"));
      }
    }

    // --- Autocompletado -----------------------------------------------------
    function palabraAntesDelCursor() {
      const antes = area.value.slice(0, area.selectionStart);
      const m = antes.match(/([A-Za-z_À-ɏ][\wÀ-ɏ]*)?(\.)?([A-Za-z_À-ɏ][\wÀ-ɏ]*)?$/);
      if (!m) return null;
      // «tabla.col» → columnas de esa tabla
      if (m[2]) return { prefijo: m[3] || "", inicio: area.selectionStart - (m[3] || "").length, tabla: (m[1] || "").toLowerCase() };
      const prefijo = m[1] || m[3] || "";
      return prefijo ? { prefijo, inicio: area.selectionStart - prefijo.length, tabla: null } : null;
    }

    function candidatos(p) {
      const pre = p.prefijo.toLowerCase();
      const empieza = x => x.toLowerCase().startsWith(pre) && x.toLowerCase() !== pre;
      if (p.tabla !== null) {
        const cols = columnasDe[p.tabla] || [];
        return cols.filter(c => !pre || empieza(c)).map(c => ({ texto: c, tipo: "columna" }));
      }
      if (pre.length < 1) return [];
      // Tras FROM / JOIN / INTO / UPDATE / TABLE, primero las tablas
      const antes = area.value.slice(0, p.inicio).replace(/\s+$/, "");
      const pideTabla = /\b(FROM|JOIN|INTO|UPDATE|TABLE)$/i.test(antes) || /\b(FROM|JOIN)\s+[\w\s,]*,$/i.test(antes);
      const t = [...tablas].filter(empieza).map(x => ({ texto: x, tipo: "tabla" }));
      const c = todasColumnas.filter(empieza).map(x => ({ texto: x, tipo: "columna" }));
      const k = PALABRAS.filter(empieza).map(x => ({ texto: x, tipo: "palabra" }));
      const f = FUNCIONES.filter(empieza).map(x => ({ texto: x, tipo: "función" }));
      const ty = TIPOS.filter(empieza).map(x => ({ texto: x, tipo: "tipo" }));
      return (pideTabla ? [...t, ...c, ...k, ...f] : [...c, ...t, ...k, ...f, ...ty]).slice(0, 8);
    }

    function cerrarSugerencias() {
      lista.hidden = true;
      sugerencias = [];
      area.removeAttribute("aria-activedescendant");
    }

    function mostrarSugerencias() {
      palabraActual = palabraAntesDelCursor();
      sugerencias = palabraActual ? candidatos(palabraActual) : [];
      if (!sugerencias.length) return cerrarSugerencias();
      elegida = 0;
      lista.innerHTML = sugerencias.map((s, i) =>
        `<li role="option" id="es-sug-${i}" data-i="${i}"${i === 0 ? ' aria-selected="true"' : ""}>` +
        `<span class="es-sug-texto">${escapar(s.texto)}</span><span class="es-sug-tipo">${s.tipo}</span></li>`).join("");
      // Colocar debajo del cursor
      const m = medidas();
      const antes = area.value.slice(0, palabraActual.inicio).split("\n");
      const linea = antes.length - 1, col = antes[antes.length - 1].length;
      const zona = area.parentElement;
      const x = zona.offsetLeft + m.izq + col * m.ancho - area.scrollLeft;
      const y = zona.offsetTop + m.arriba + (linea + 1) * m.alto - area.scrollTop + 2;
      lista.style.left = Math.max(0, Math.min(x, contenedor.clientWidth - 240)) + "px";
      lista.style.top = y + "px";
      lista.hidden = false;
      area.setAttribute("aria-activedescendant", "es-sug-0");
    }

    function moverSeleccion(d) {
      elegida = (elegida + d + sugerencias.length) % sugerencias.length;
      lista.querySelectorAll("li").forEach((li, i) => li.toggleAttribute("aria-selected", i === elegida));
      lista.children[elegida]?.scrollIntoView({ block: "nearest" });
      area.setAttribute("aria-activedescendant", "es-sug-" + elegida);
    }

    function aceptarSugerencia(i = elegida) {
      const s = sugerencias[i];
      if (!s || !palabraActual) return;
      // Respeta minúsculas si el alumno escribe palabras clave en minúsculas
      let texto = s.texto;
      if ((s.tipo === "palabra" || s.tipo === "función") && palabraActual.prefijo &&
          palabraActual.prefijo === palabraActual.prefijo.toLowerCase()) texto = texto.toLowerCase();
      if (s.tipo === "función") texto += "(";
      insertar(texto, palabraActual.inicio, area.selectionStart);
      cerrarSugerencias();
    }

    lista.addEventListener("mousedown", ev => {
      const li = ev.target.closest("li");
      if (!li) return;
      ev.preventDefault();
      aceptarSugerencia(Number(li.dataset.i));
    });

    // --- Teclado ------------------------------------------------------------
    area.addEventListener("keydown", ev => {
      const abierta = !lista.hidden && sugerencias.length;
      if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
        ev.preventDefault();
        cerrarSugerencias();
        opciones.alEjecutar?.(area.value);
        return;
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key === " ") { ev.preventDefault(); mostrarSugerencias(); return; }
      if (abierta) {
        if (ev.key === "ArrowDown") { ev.preventDefault(); moverSeleccion(1); return; }
        if (ev.key === "ArrowUp") { ev.preventDefault(); moverSeleccion(-1); return; }
        if (ev.key === "Enter" || ev.key === "Tab") { ev.preventDefault(); aceptarSugerencia(); return; }
        if (ev.key === "Escape") { ev.preventDefault(); cerrarSugerencias(); return; }
      }
      if (ev.key === "Escape") { salirConTab = true; return; }
      if (ev.key === "Tab") {
        if (salirConTab) { salirConTab = false; return; }   // deja salir del editor
        ev.preventDefault();
        const ini = area.value.lastIndexOf("\n", area.selectionStart - 1) + 1;
        if (ev.shiftKey) {
          if (area.value.startsWith(SANGRIA, ini)) insertar("", ini, ini + SANGRIA.length);
        } else insertar(SANGRIA);
        return;
      }
      salirConTab = false;
      if (ev.key === "Enter") {
        // Mantiene la sangría de la línea actual
        ev.preventDefault();
        const ini = area.value.lastIndexOf("\n", area.selectionStart - 1) + 1;
        const sangria = area.value.slice(ini).match(/^[ \t]*/)[0];
        insertar("\n" + sangria);
      }
    });

    area.addEventListener("input", ev => {
      if (lineaError !== null) lineaError = null;
      pintar();
      // Sugerir solo al escribir letras, no al borrar ni pegar
      if (ev.inputType === "insertText" && /[\w.À-ɏ]/.test(ev.data || "")) mostrarSugerencias();
      else cerrarSugerencias();
      opciones.alCambiar?.(area.value);
    });
    area.addEventListener("scroll", () => { sincronizarScroll(); cerrarSugerencias(); });
    area.addEventListener("blur", () => setTimeout(cerrarSugerencias, 150));
    area.addEventListener("click", cerrarSugerencias);

    area.value = opciones.valor || "";
    pintar();

    return {
      area,
      valor: () => area.value,
      poner(txt) { area.value = txt; lineaError = null; pintar(); },
      foco() { area.focus(); },
      /** Esquema de MOTOR.esquema(): tablas y columnas para colores y sugerencias. */
      conocer(esquema) {
        tablas = new Set(esquema.map(t => t.nombre.toLowerCase()));
        columnasDe = Object.fromEntries(esquema.map(t => [t.nombre.toLowerCase(), t.columnas.map(c => c.nombre)]));
        todasColumnas = [...new Set(esquema.flatMap(t => t.columnas.map(c => c.nombre)))];
        pintar();
      },
      marcarError(linea) { lineaError = linea || null; pintar(); },
      limpiarError() { lineaError = null; pintar(); }
    };
  }

  window.EDITOR_SQL = { crear, resaltar: sql => resaltar(sql, new Set()) };
})();
