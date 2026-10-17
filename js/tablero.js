/* ============================================================
   SQLearning · Hoja de ruta del caso (tablero holográfico)
   Cada etapa es un expediente; cada nivel, una diligencia.
   Las diligencias van en zigzag y se unen con hilos de neón (SVG).
   Expedientes bloqueados: CLASIFICADOS (títulos tachados).
   TABLERO.mostrar()
   ============================================================ */
(function () {
  const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const $ = sel => document.querySelector(sel);
  const fmt = n => n.toLocaleString("es");

  const bloquesHTML = (n, total = 3) => { n = Math.max(0, Math.min(total, Math.round(Number(n)) || 0)); return (
    `<span class="bloques" aria-label="${n} de ${total} bloques verificados">${"<i class=\"b-lleno\"></i>".repeat(n)}${"<i></i>".repeat(total - n)}</span>`); };

  // Posición en zigzag: filas de `cols`, una hacia la derecha y la siguiente hacia la izquierda
  function celda(i, cols) {
    const fila = Math.floor(i / cols);
    const col = fila % 2 === 0 ? i % cols : cols - 1 - (i % cols);
    return { fila: fila + 1, col: col + 1 };
  }
  const columnas = () => (innerWidth >= 1250 ? 5 : innerWidth >= 950 ? 4 : innerWidth >= 640 ? 3 : 2);

  function estadoEtapa(etapa) {
    if (!PROGRESO.etapaAbierta(etapa)) return "clasificado";
    if (PROGRESO.etapaCerrada(etapa)) return "cerrado";
    return "abierto";
  }

  function nodoHTML(nivel, i, etapa, est, cols) {
    const { fila, col } = celda(i, cols);
    const pos = `style="grid-row:${fila};grid-column:${col}"`;
    const cod = CURSO.codigo(nivel.id);
    if (est === "clasificado") {
      return `<li class="nodo nodo--clasificado${nivel.caso ? " nodo--caso" : ""}" ${pos} aria-label="Diligencia ${cod}: clasificada">
        <span class="nodo-cod">${cod}</span><span class="nodo-titulo"><span class="tachado">████████ ████</span></span></li>`;
    }
    const hecho = PROGRESO.completado(nivel.id);
    const disp = PROGRESO.disponible(nivel.id);
    const clase = hecho ? "hecho" : disp ? "disponible" : "bloqueado";
    const titulo = esc(nivel.titulo || "");
    const estadoTxt = hecho ? `superada, ${PROGRESO.bloquesDe(nivel.id)} de 3 bloques`
      : disp ? (nivel.listo ? "disponible" : "en preparación") : "bloqueada";
    const dentro = `<span class="nodo-cod">${nivel.caso ? "CASO " : ""}${cod}</span>
      <span class="nodo-titulo">${titulo}</span>
      ${hecho ? bloquesHTML(PROGRESO.bloquesDe(nivel.id)) : disp ? (nivel.listo ? `<span class="nodo-marca">▶ abrir</span>` : `<span class="nodo-marca">en preparación</span>`) : `<span class="nodo-marca" aria-hidden="true">🔒</span>`}`;
    const etiqueta = `Diligencia ${cod}: ${titulo}, ${estadoTxt}`;
    const enlace = (hecho || disp) && nivel.listo;
    return `<li class="nodo nodo--${clase}${nivel.caso ? " nodo--caso" : ""}" ${pos} data-nodo="${nivel.id}">
      ${enlace ? `<a href="leccion.html?id=${nivel.id}" aria-label="${etiqueta}">${dentro}</a>`
               : `<div role="group" aria-label="${etiqueta}">${dentro}</div>`}</li>`;
  }

  // --- Expedientes plegables -------------------------------------------------
  // Por defecto: abiertos desplegados; cerrados y clasificados plegados. Lo que la persona
  // pliega o despliega a mano se recuerda (localStorage).
  const CLAVE_PLEGADOS = "sqlearning-tablero-plegados";
  const leerPlegados = () => { try { return JSON.parse(localStorage.getItem(CLAVE_PLEGADOS) || "{}") || {}; } catch (e) { return {}; } };
  const guardarPlegados = p => { try { localStorage.setItem(CLAVE_PLEGADOS, JSON.stringify(p)); } catch (e) { /* sin guardado */ } };
  const plegado = (etapa, est) => {
    const p = leerPlegados();
    return typeof p[etapa.n] === "boolean" ? p[etapa.n] : est !== "abierto";
  };

  function expedienteHTML(etapa, cols) {
    const est = estadoEtapa(etapa);
    const hechas = etapa.niveles.filter(n => PROGRESO.completado(n.id)).length;
    const total = etapa.niveles.length;
    const filas = Math.ceil(total / cols);
    const estadoTxt = { clasificado: "CLASIFICADO", cerrado: "CERRADO", abierto: "ABIERTO" }[est];
    const cerrado = plegado(etapa, est);
    return `<section class="exp exp--${est}${etapa.opcional ? " exp--opcional" : ""}${cerrado ? " exp--plegado" : ""}" aria-labelledby="exp-${etapa.n}" data-exp="${etapa.n}">
      <header class="exp-cabecera" data-plegar="${etapa.n}">
        <button type="button" class="exp-flecha" aria-expanded="${!cerrado}" aria-controls="exp-cuerpo-${etapa.n}"
          aria-label="${cerrado ? "Desplegar" : "Plegar"} el expediente ${etapa.n}">${cerrado ? "▸" : "▾"}</button>
        <span class="exp-num">EXP.${etapa.n}</span>
        <h2 id="exp-${etapa.n}">${est === "clasificado" ? `<span class="tachado">${esc(etapa.titulo).replace(/\S/g, "█")}</span><span class="solo-lector">Expediente clasificado</span>` : esc(etapa.titulo)}</h2>
        <span class="exp-dep">${etapa.opcional ? "Formación previa · opcional" : est === "clasificado" ? "Acceso restringido" : esc(etapa.departamento)}</span>
        <span class="exp-estado">${estadoTxt}${est !== "clasificado" ? ` · ${hechas}/${total}` : ""}</span>
      </header>
      <div class="exp-cuerpo" id="exp-cuerpo-${etapa.n}"${cerrado ? " hidden" : ""}>
        <svg class="exp-hilos" aria-hidden="true"></svg>
        <ol class="exp-nodos" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${filas},auto)">
          ${etapa.niveles.map((n, i) => nodoHTML(n, i, etapa, est, cols)).join("")}
        </ol>
        ${est === "clasificado" ? `<p class="exp-sello" aria-hidden="true">CLASIFICADO</p>` : ""}
      </div>
      ${etapa === CURSO.ETAPAS[CURSO.ETAPAS.length - 1] && PROGRESO.casoCerrado()
        ? `<a class="exp-final" href="caso-cerrado.html">CASO CERRADO · Ver el expediente final ›</a>` : ""}
    </section>`;
  }

  // Hilos de neón entre las diligencias de cada expediente, en el orden del recorrido
  function dibujarHilos() {
    document.querySelectorAll(".exp").forEach(exp => {
      const cuerpo = exp.querySelector(".exp-cuerpo");
      const svg = exp.querySelector(".exp-hilos");
      const nodos = [...exp.querySelectorAll(".nodo")];
      const caja = cuerpo.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${caja.width} ${caja.height}`);
      const centros = nodos.map(n => {
        const r = n.getBoundingClientRect();
        return { x: r.left - caja.left + r.width / 2, y: r.top - caja.top + r.height / 2, hecho: n.classList.contains("nodo--hecho") };
      });
      let html = "";
      for (let k = 1; k < centros.length; k++) {
        const a = centros[k - 1], b = centros[k];
        const clase = a.hecho && b.hecho ? "hilo hilo--hecho" : a.hecho ? "hilo hilo--siguiente" : "hilo";
        // Cambio de fila: curva por el lateral
        const d = Math.abs(a.y - b.y) > 4
          ? `M${a.x} ${a.y} C ${a.x + (a.x > caja.width / 2 ? 60 : -60)} ${a.y}, ${b.x + (b.x > caja.width / 2 ? 60 : -60)} ${b.y}, ${b.x} ${b.y}`
          : `M${a.x} ${a.y} L ${b.x} ${b.y}`;
        html += `<path class="${clase}" d="${d}"/>`;
      }
      svg.innerHTML = html;
    });
  }

  function cabecera() {
    const d = PROGRESO.datos();
    const aut = PROGRESO.autorizacion();
    $("[data-autorizacion]").innerHTML = `
      <span class="aut-nivel">L${aut.nivel}</span>
      <span class="aut-texto"><span class="aut-nombre">${esc(aut.nombre)}</span>
        <span class="aut-barra" role="progressbar" aria-label="Progreso hacia la siguiente autorización"
          aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(aut.avance * 100)}"><i style="width:${aut.avance * 100}%"></i></span>
        <small>${aut.siguiente ? `${fmt(d.creditos)} / ${fmt(aut.siguiente.min)} ◈ para L${aut.siguiente.nivel}` : "Autorización máxima"}</small>
      </span>`;
    $("[data-creditos]").innerHTML = `<b>${fmt(d.creditos)}</b> ◈ <span class="solo-lector">créditos</span>`;
    $("[data-bloques]").innerHTML = `<b>${fmt(PROGRESO.totalBloques())}</b> ${bloquesHTML(1, 1)} <span class="solo-lector">bloques verificados</span>`;
    $("[data-turnos]").innerHTML = `<b>${d.turnos.dias}</b> <span>${d.turnos.dias === 1 ? "turno" : "turnos"}</span>`;
    $("[data-modo-prueba]").hidden = !PROGRESO.enPrueba();
  }

  function dialogoExpediente() {
    const d = PROGRESO.datos();
    $("[data-lista-pistas]").innerHTML = d.expediente.length
      ? d.expediente.map((p, i) => `<li class="pista"><span class="pista-num">PISTA ${String(i + 1).padStart(2, "0")}</span>
          <h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p></li>`).join("")
      : `<li class="pista-vacia">Aún no hay pistas. Cierra el primer expediente para empezar a reunirlas.</li>`;
  }

  function dialogoCredenciales() {
    const tiene = new Set(PROGRESO.datos().credenciales);
    $("[data-lista-credenciales]").innerHTML = PROGRESO.CREDENCIALES.map(c => `
      <li class="credencial${tiene.has(c.id) ? " credencial--activa" : ""}">
        <span class="credencial-chip" aria-hidden="true"></span>
        <span class="credencial-nombre">${tiene.has(c.id) ? esc(c.nombre) : "Credencial bloqueada"}</span>
        <span class="credencial-desc">${esc(c.desc)}</span>
        <span class="solo-lector">${tiene.has(c.id) ? "Conseguida" : "Aún no conseguida"}</span>
      </li>`).join("");
  }

  // Pliega o despliega un expediente sin repintar todo (y recuerda la elección)
  function alternar(n, abrir) {
    const sec = document.querySelector(`[data-exp="${n}"]`);
    if (!sec) return;
    const cuerpo = sec.querySelector(".exp-cuerpo"), flecha = sec.querySelector(".exp-flecha");
    const abrirlo = abrir ?? cuerpo.hidden;
    cuerpo.hidden = !abrirlo;
    sec.classList.toggle("exp--plegado", !abrirlo);
    flecha.setAttribute("aria-expanded", String(abrirlo));
    flecha.setAttribute("aria-label", `${abrirlo ? "Plegar" : "Desplegar"} el expediente ${n}`);
    flecha.textContent = abrirlo ? "▾" : "▸";
    const p = leerPlegados();
    p[n] = !abrirlo;
    guardarPlegados(p);
    if (abrirlo) requestAnimationFrame(dibujarHilos);
  }

  function pintar() {
    const cols = columnas();
    $("[data-expedientes]").innerHTML = CURSO.ETAPAS.map(e => expedienteHTML(e, cols)).join("");
    cabecera();
    requestAnimationFrame(dibujarHilos);
  }

  let preparado = false;
  function preparar() {
    if (preparado) return;
    preparado = true;
    // Si otra pestaña cambia el progreso, se vuelve a leer y se repinta
    addEventListener("storage", ev => { if (ev.key === PROGRESO.CLAVE) { PROGRESO.recargar(); pintar(); } });
    let ultimoCols = columnas();
    new ResizeObserver(() => {
      if (columnas() !== ultimoCols) { ultimoCols = columnas(); pintar(); }
      else dibujarHilos();
    }).observe($("[data-expedientes]"));

    // Plegar / desplegar: clic en la cabecera o en su flecha (Enter y Espacio en la flecha, que es un botón)
    $("[data-expedientes]").addEventListener("click", ev => {
      const cab = ev.target.closest("[data-plegar]");
      if (cab) alternar(Number(cab.dataset.plegar));
    });
    $("[data-desplegar-todo]")?.addEventListener("click", () => CURSO.ETAPAS.forEach(e => alternar(e.n, true)));
    $("[data-plegar-todo]")?.addEventListener("click", () => CURSO.ETAPAS.forEach(e => alternar(e.n, false)));

    const abrir = (sel, rellenar) => () => { rellenar?.(); $(sel).showModal(); };
    $("[data-abrir-expediente]").addEventListener("click", abrir("[data-dialogo-expediente]", dialogoExpediente));
    $("[data-abrir-credenciales]").addEventListener("click", abrir("[data-dialogo-credenciales]", dialogoCredenciales));
    $("[data-abrir-ajustes]").addEventListener("click", abrir("[data-dialogo-ajustes]", ajustes));
    document.querySelectorAll("dialog").forEach(dl => {
      dl.addEventListener("click", ev => { if (ev.target === dl || ev.target.closest("[data-cerrar]")) dl.close(); });
    });
  }

  function ajustes() {
    const prueba = PROGRESO.enPrueba();
    $("[data-prueba-estado]").textContent = prueba
      ? "Estás en modo prueba: todo está desbloqueado y nada de lo que hagas se guarda en tu progreso real."
      : "El modo prueba desbloquea todo y usa un progreso aparte que se borra al cerrar la pestaña.";
    const bPrueba = $("[data-prueba]");
    // Fuera de local (versión publicada) el modo prueba no existe: se ocultan el botón y su explicación
    const sinPrueba = !PROGRESO.pruebaDisponible();
    bPrueba.parentElement.hidden = $("[data-prueba-estado]").hidden = sinPrueba;
    if (bPrueba.parentElement.nextElementSibling?.tagName === "HR") bPrueba.parentElement.nextElementSibling.hidden = sinPrueba;
    bPrueba.textContent = prueba ? "Salir del modo prueba" : "Entrar en modo prueba";
    bPrueba.onclick = () => { prueba ? PROGRESO.salirPrueba() : PROGRESO.entrarPrueba(); $("[data-dialogo-ajustes]").close(); pintar(); };
    const bReiniciar = $("[data-reiniciar]");
    bReiniciar.textContent = "Reiniciar el caso";
    bReiniciar.dataset.confirmar = "";
    bReiniciar.onclick = () => {
      if (!bReiniciar.dataset.confirmar) {
        bReiniciar.dataset.confirmar = "1";
        bReiniciar.textContent = "¿Seguro? Se borra todo tu progreso. Pulsa otra vez";
        return;
      }
      PROGRESO.reiniciar();
      $("[data-dialogo-ajustes]").close();
      pintar();
    };
  }

  window.TABLERO = {
    mostrar() {
      const t = $("[data-tablero]");
      t.hidden = false;
      preparar();
      pintar();
      $("[data-tablero-titulo]").focus();
    },
    pintar
  };
})();
