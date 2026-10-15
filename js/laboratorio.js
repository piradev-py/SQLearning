/* ============================================================
   SQLearning · Laboratorio (práctica libre)
   ============================================================ */
(function () {
  const CLAVE_BORRADOR = "sqlearning-lab-borrador";
  const CLAVE_ANCHO = "sqlearning-lab-ancho";
  const DATOS = "faro-e1";

  const EJEMPLOS = [
    { nombre: "Ver todas las tiendas", sql: "SELECT *\nFROM tiendas;" },
    { nombre: "Productos más caros", sql: "SELECT nombre, categoria, precio\nFROM productos\nORDER BY precio DESC\nLIMIT 10;" },
    { nombre: "Empleados por departamento", sql: "SELECT departamento, count(*) AS empleados\nFROM empleados\nGROUP BY departamento\nORDER BY empleados DESC;" },
    { nombre: "Valor del inventario", sql: "SELECT nombre, precio * stock AS valor_inventario\nFROM productos\nORDER BY valor_inventario DESC;" },
    { nombre: "Empleados con su tienda", sql: "SELECT e.nombre, e.departamento, t.ciudad\nFROM empleados AS e\nJOIN tiendas AS t ON t.id = e.tienda_id\nORDER BY t.ciudad, e.nombre;" }
  ];

  const $ = sel => document.querySelector(sel);
  const lab = $("[data-lab]");
  const btnEjecutar = $("[data-ejecutar]");
  const estado = $("[data-estado]");
  const vistaResultado = $("[data-vista=resultado]");
  const vistaEsquema = $("[data-vista=esquema]");

  const leer = (k, def) => { try { return localStorage.getItem(k) ?? def; } catch (e) { return def; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sin guardado */ } };

  const editor = EDITOR_SQL.crear($("[data-editor]"), {
    valor: leer(CLAVE_BORRADOR, EJEMPLOS[0].sql),
    alEjecutar: ejecutar,
    alCambiar: txt => guardar(CLAVE_BORRADOR, txt)
  });

  // --- Pestañas (con flechas del teclado, patrón ARIA tabs) ----------------
  const pestanas = [...document.querySelectorAll("[data-pestana]")];
  function mostrar(nombre) {
    pestanas.forEach(p => {
      const si = p.dataset.pestana === nombre;
      p.setAttribute("aria-selected", si);
      p.tabIndex = si ? 0 : -1;
    });
    document.querySelectorAll("[data-vista]").forEach(v => { v.hidden = v.dataset.vista !== nombre; });
  }
  pestanas.forEach((p, i) => {
    p.addEventListener("click", () => mostrar(p.dataset.pestana));
    p.addEventListener("keydown", ev => {
      if (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft") return;
      const otra = pestanas[(i + (ev.key === "ArrowRight" ? 1 : -1) + pestanas.length) % pestanas.length];
      otra.focus();
      mostrar(otra.dataset.pestana);
    });
  });

  // --- Ejecutar -----------------------------------------------------------
  let ocupado = false;
  async function ejecutar() {
    if (ocupado) return;
    const sql = editor.valor();
    if (!sql.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "").trim()) {
      RESULTADO.aviso(vistaResultado, "Escribe una consulta y pulsa **Ejecutar**.");
      mostrar("resultado");
      return;
    }
    ocupado = true;
    btnEjecutar.disabled = true;
    estado.textContent = "Ejecutando…";
    const r = await MOTOR.ejecutar(sql);
    mostrar("resultado");
    if (r.ok) {
      editor.limpiarError();
      RESULTADO.tabla(vistaResultado, r.ultimo);
      const u = r.ultimo;
      estado.textContent = u && u.columnas.length
        ? `${u.filas.length.toLocaleString("es")} ${u.filas.length === 1 ? "fila" : "filas"} · ${r.ms} ms`
        : `${r.ms} ms`;
    } else {
      RESULTADO.error(vistaResultado, r.error);
      editor.marcarError(r.error.linea);
      estado.textContent = "Error";
    }
    ocupado = false;
    btnEjecutar.disabled = false;
  }
  btnEjecutar.addEventListener("click", ejecutar);

  // --- Ejemplos y borrar --------------------------------------------------
  const selEjemplos = $("[data-ejemplos]");
  EJEMPLOS.forEach((e, i) => selEjemplos.add(new Option(e.nombre, i)));
  selEjemplos.addEventListener("change", () => {
    const e = EJEMPLOS[selEjemplos.value];
    if (e) { editor.poner(e.sql); guardar(CLAVE_BORRADOR, e.sql); editor.foco(); }
    selEjemplos.value = "";
  });
  $("[data-limpiar]").addEventListener("click", () => {
    editor.poner("");
    guardar(CLAVE_BORRADOR, "");
    editor.foco();
  });

  // --- Separador arrastrable (ratón y teclado) ----------------------------
  const sep = $("[data-separador]");
  function ponerAncho(pct) {
    pct = Math.min(75, Math.max(25, pct));
    lab.style.setProperty("--ancho-editor", pct + "%");
    sep.setAttribute("aria-valuenow", Math.round(pct));
    guardar(CLAVE_ANCHO, String(pct));
  }
  sep.setAttribute("aria-valuemin", "25");
  sep.setAttribute("aria-valuemax", "75");
  ponerAncho(Number(leer(CLAVE_ANCHO, 50)) || 50);
  sep.addEventListener("pointerdown", ev => {
    sep.setPointerCapture(ev.pointerId);
    const mover = e => {
      const caja = lab.getBoundingClientRect();
      ponerAncho(((e.clientX - caja.left) / caja.width) * 100);
    };
    sep.addEventListener("pointermove", mover);
    sep.addEventListener("pointerup", () => sep.removeEventListener("pointermove", mover), { once: true });
  });
  sep.addEventListener("keydown", ev => {
    const actual = Number(sep.getAttribute("aria-valuenow"));
    if (ev.key === "ArrowLeft") { ev.preventDefault(); ponerAncho(actual - 5); }
    if (ev.key === "ArrowRight") { ev.preventDefault(); ponerAncho(actual + 5); }
  });

  // --- Arranque -----------------------------------------------------------
  (async () => {
    try {
      await MOTOR.preparar(DATOS);
      const esquema = await MOTOR.esquema();
      TRADUCTOR.conocer(esquema);
      editor.conocer(esquema);
      RESULTADO.esquema(vistaEsquema, esquema);
      RESULTADO.aviso(vistaResultado, "PostgreSQL está listo. Escribe una consulta y pulsa **Ejecutar** (o `Ctrl+Enter`).");
      estado.textContent = `${esquema.length} tablas`;
      btnEjecutar.disabled = false;
      $("[data-cargando]").hidden = true;
      editor.foco();
    } catch (e) {
      $("[data-cargando]").innerHTML = `<p>😕 No se ha podido arrancar PostgreSQL.</p>
        <p class="lab-cargando-detalle">${RESULTADO.esc(e?.mensaje || e?.message || e)}</p>
        <p class="lab-cargando-detalle">Si has abierto el archivo con doble clic, ábrelo con el servidor: <code>npm run servir</code>.</p>`;
    }
  })();
})();
