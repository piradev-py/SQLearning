/* ============================================================
   SQLearning · Laboratorio (práctica libre)
   ============================================================ */
(function () {
  const CLAVE_BORRADOR = "sqlearning-lab-borrador";
  const CLAVE_ANCHO = "sqlearning-lab-ancho";
  // Datos de la etapa más avanzada que el alumno tiene abierta y ya jugable (con alguna diligencia lista):
  // así practica con las tablas que conoce (pedidos, líneas…) sin destapar las de expedientes clasificados.
  const ETAPA_DATOS = CURSO.ETAPAS
    .filter(e => e.datos && e.niveles.some(n => n.listo) && PROGRESO.etapaAbierta(e))
    .pop() || CURSO.ETAPAS.find(e => e.datos);
  const DATOS = ETAPA_DATOS.datos;

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
  const vistaGrafico = $("[data-vista=grafico]");

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
    if (nombre === "grafico") GRAFICO.pintar(vistaGrafico, ultimo);
  }
  // El gráfico se dibuja al verlo (oculto no tiene ancho) y se redibuja si cambia el ancho
  let ultimo = null, anchoGrafico = 0;
  const pestanaActual = () => pestanas.find(p => p.getAttribute("aria-selected") === "true")?.dataset.pestana;
  new ResizeObserver(() => {
    if (vistaGrafico.hidden || vistaGrafico.clientWidth === anchoGrafico) return;
    anchoGrafico = vistaGrafico.clientWidth;
    GRAFICO.pintar(vistaGrafico, ultimo);
  }).observe(vistaGrafico);
  pestanas.forEach((p, i) => {
    p.addEventListener("click", () => mostrar(p.dataset.pestana));
    p.addEventListener("keydown", ev => {
      const destino = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: pestanas.length - 1 }[ev.key];
      if (destino === undefined) return;
      ev.preventDefault();
      const otra = pestanas[(destino + pestanas.length) % pestanas.length];
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
    ultimo = r.ok ? r.ultimo : null;
    // Si estaba mirando el gráfico y la consulta funciona, sigue en el gráfico
    mostrar(r.ok && pestanaActual() === "grafico" ? "grafico" : "resultado");
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
    selEjemplos.value = "";
    // Con «deshacer»: Ctrl+Z recupera lo que había escrito
    if (e) { editor.poner(e.sql, { deshacer: true }); guardar(CLAVE_BORRADOR, e.sql); editor.foco(); }
  });
  $("[data-limpiar]").addEventListener("click", () => {
    editor.poner("", { deshacer: true });
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
    const nuevo = { ArrowLeft: actual - 5, ArrowRight: actual + 5, Home: 25, End: 75 }[ev.key];
    if (nuevo !== undefined) { ev.preventDefault(); ponerAncho(nuevo); }
  });

  // --- Arranque -----------------------------------------------------------
  // Mientras arranca PostgreSQL, los paneles no se pueden usar (ni con el teclado)
  const paneles = document.querySelectorAll(".lab-panel, [data-separador]");
  paneles.forEach(p => { p.inert = true; });
  (async () => {
    try {
      await MOTOR.preparar(DATOS);
      const esquema = await MOTOR.esquema();
      TRADUCTOR.conocer(esquema);
      editor.conocer(esquema);
      RESULTADO.esquema(vistaEsquema, esquema);
      RESULTADO.aviso(vistaResultado, "PostgreSQL está listo. Escribe una consulta y pulsa **Ejecutar** (o `Ctrl+Enter`).");
      estado.textContent = `${esquema.length} tablas`;
      $("[data-datos-lab]").textContent = `Datos del EXP.${ETAPA_DATOS.n} · ${ETAPA_DATOS.titulo}`;
      btnEjecutar.disabled = false;
      $("[data-cargando]").hidden = true;
      paneles.forEach(p => { p.inert = false; });
      editor.foco();
    } catch (e) {
      $("[data-cargando]").innerHTML = `<p>😕 No se ha podido arrancar PostgreSQL.</p>
        <p class="lab-cargando-detalle">${RESULTADO.esc(e?.mensaje || e?.message || e)}</p>
        <p class="lab-cargando-detalle">Si has abierto el archivo con doble clic, ábrelo con el servidor: <code>npm run servir</code>.</p>`;
    }
  })();
})();
