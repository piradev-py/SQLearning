/* ============================================================
   SQLearning · Página de lección (una diligencia)
   leccion.html?id=e1-03
   Carga el nivel (lecciones/<carpeta>/<archivo>), prepara la base de
   datos de su etapa y va pintando los pasos (ver docs/FORMATO_LECCION.md).
   Bloques del reto: 3 sin pistas · 2 con pistas · 1 viendo la solución.
   ============================================================ */
(function () {
  const $ = sel => document.querySelector(sel);
  const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  // Mini-markdown de las lecciones: **negrita**, `código` y saltos de línea
  const md = s => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");

  const PERSONAJES = {
    lucia: { nombre: "Lucía Mora", rol: "Jefa de datos" },
    marcos: { nombre: "Marcos Gil", rol: "Atención al cliente" },
    elena: { nombre: "Elena Ruiz", rol: "Directora de ventas" },
    hector: { nombre: "Héctor Vidal", rol: "Jefe de logística" },
    nuria: { nombre: "Nuria Campos", rol: "Migración de sistemas" },
    ivan: { nombre: "Iván Soler", rol: "Administrador de sistemas" },
    ana: { nombre: "Ana Beltrán", rol: "Directora general" }
  };
  const PASOS_CON_REVISION = new Set(["ejercicio", "arreglar", "reto"]);
  const PASOS_PAPEL = new Set(["clasificar", "seleccionar", "ordenar", "diagrama"]);

  const respuestaCorrecta = (dada, paso) => REVISOR.respuestaCorrecta(dada, paso);

  // --- Estado ------------------------------------------------------------
  const id = new URLSearchParams(location.search).get("id");
  let lec = null, ref = null, usaSQL = false;
  let actual = 0;
  const superados = new Set();
  const borradores = {};                 // índice de paso -> texto del editor
  // Ayudas usadas en el reto / caso. Se guardan en el navegador: recargar la página no las borra
  // (si no, ver la solución y pulsar F5 daría 3 bloques). Se olvidan al superar la diligencia.
  const CLAVE_AYUDAS = "sqlearning-ayudas";
  const leerAyudas = () => { try { return JSON.parse(localStorage.getItem(CLAVE_AYUDAS) || "{}"); } catch (e) { return {}; } };
  const guardadas = leerAyudas()[id] || {};
  const ayudas = { pistas: Number(guardadas.pistas) || 0, solucion: !!guardadas.solucion };
  function guardarAyudas(borrar = false) {
    try {
      const todas = leerAyudas();
      if (borrar) delete todas[id]; else todas[id] = { ...ayudas };
      localStorage.setItem(CLAVE_AYUDAS, JSON.stringify(todas));
    } catch (e) { /* sin guardado */ }
  }
  let editor = null;
  let montajePapel = null;
  let parteCaso = 0;
  let temporizadorParte = null;
  let terminado = false;

  // --- Carga ---------------------------------------------------------------
  function cargarScript(src) {
    return new Promise((ok, mal) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = ok;
      s.onerror = () => mal(new Error("No se encuentra " + src));
      document.head.append(s);
    });
  }

  function fallo(texto) {
    $("[data-cargando]").innerHTML = `<p>${md(texto)}</p><p><a class="boton-enlace" href="index.html#ruta">‹ Volver a la hoja de ruta</a></p>`;
  }

  async function iniciar() {
    ref = id && CURSO.buscar(id);
    if (!ref || !ref.nivel.archivo) return fallo("Esta diligencia no existe.");
    if (!ref.nivel.listo) return fallo("Esta diligencia aún está **en preparación**.");
    if (!PROGRESO.disponible(id) && !PROGRESO.completado(id))
      return fallo("Esta diligencia aún está **bloqueada**. Supera las anteriores en la hoja de ruta.");
    try {
      await cargarScript(`lecciones/${ref.etapa.carpeta}/${ref.nivel.archivo}`);
    } catch (e) {
      return fallo("Esta diligencia aún está **en preparación**.");
    }
    lec = CURSO.leccion(id);
    if (!lec) return fallo("No se ha podido leer la diligencia.");

    document.title = `${CURSO.codigo(id)} · ${lec.titulo} · SQLearning`;
    if (PROGRESO.enPrueba()) document.querySelector(".lec-cabecera").insertAdjacentHTML("afterend", `<p class="aviso-prueba">MODO PRUEBA · todo desbloqueado · no se guarda en tu progreso real</p>`);
    $("[data-codigo]").textContent = (ref.nivel.caso ? "CASO " : "") + CURSO.codigo(id);
    $("[data-titulo]").textContent = lec.titulo;

    const datos = lec.datos !== undefined ? lec.datos : ref.etapa.datos;
    usaSQL = !!datos;
    if (usaSQL) {
      $("[data-cargando-texto]").textContent = "Encendiendo PostgreSQL…";
      editor = EDITOR_SQL.crear($("[data-editor]"), {
        alEjecutar: ejecutar,
        alCambiar: txt => { borradores[actual] = txt; }
      });
      editor.area.addEventListener("keydown", ev => {
        if ((ev.ctrlKey || ev.metaKey) && ev.shiftKey && ev.key === "Enter" && !$("[data-revisar]").hidden) { ev.preventDefault(); revisar(); }
      });
      try {
        await MOTOR.preparar(datos);
        const esquema = await MOTOR.esquema();
        TRADUCTOR.conocer(esquema);
        editor.conocer(esquema);
        RESULTADO.esquema($("[data-vista=esquema]"), esquema);
      } catch (e) {
        return fallo("No se ha podido arrancar PostgreSQL. Recarga la página. (" + (e?.mensaje || e?.message || e) + ")");
      }
    }
    pintarIndicePasos();
    $("[data-cargando]").hidden = true;
    mostrarPaso(0);
  }

  // --- Indicador de pasos -------------------------------------------------
  function pintarIndicePasos() {
    $("[data-pasos]").innerHTML = lec.pasos.map((p, i) =>
      `<li class="lec-punto${i === actual ? " lec-punto--actual" : ""}${superados.has(i) ? " lec-punto--hecho" : ""}${p.tipo === "reto" || p.tipo === "caso" || p.reto ? " lec-punto--reto" : ""}"
         aria-label="Paso ${i + 1} de ${lec.pasos.length}${superados.has(i) ? ", superado" : ""}${i === actual ? ", actual" : ""}"></li>`).join("");
  }

  function marcarSuperado(i = actual) {
    superados.add(i);
    pintarIndicePasos();
    actualizarNav();
  }

  function actualizarNav() {
    const ultimo = actual === lec.pasos.length - 1;
    $("[data-anterior]").disabled = actual === 0;
    const sig = $("[data-siguiente]");
    sig.hidden = ultimo;
    sig.disabled = !superados.has(actual);
    sig.title = sig.disabled ? "Resuelve este paso para seguir" : "";
  }

  // --- Espacio de trabajo -------------------------------------------------
  function modoTrabajo(modo) {
    // modo: "sql" | "mesa"
    $("[data-zona-sql]").hidden = modo !== "sql";
    $("[data-zona-mesa]").hidden = modo !== "mesa";
  }
  function botonesEditor({ revisar = false, reiniciar = false } = {}) {
    $("[data-revisar]").hidden = !revisar;
    $("[data-reiniciar-editor]").hidden = !reiniciar;
  }
  function mostrarPestana(nombre) {
    document.querySelectorAll("[data-pestana]").forEach(p => {
      const si = p.dataset.pestana === nombre;
      p.setAttribute("aria-selected", si);
      p.tabIndex = si ? 0 : -1;
    });
    document.querySelectorAll("[data-vista]").forEach(v => { v.hidden = v.dataset.vista !== nombre; });
  }

  let ocupado = false;
  async function ejecutar() {
    if (!usaSQL || ocupado) return;
    const sql = editor.valor();
    if (!MOTOR.sinComentarios(sql).trim()) {
      RESULTADO.aviso($("[data-vista=resultado]"), "Escribe una consulta y pulsa **Ejecutar**.");
      return;
    }
    ocupado = true;
    $("[data-estado]").textContent = "Ejecutando…";
    const r = await MOTOR.ejecutar(sql);
    mostrarPestana("resultado");
    if (r.ok) {
      editor.limpiarError();
      RESULTADO.tabla($("[data-vista=resultado]"), r.ultimo);
      const u = r.ultimo;
      $("[data-estado]").textContent = u?.columnas.length ? `${u.filas.length} ${u.filas.length === 1 ? "fila" : "filas"} · ${r.ms} ms` : `${r.ms} ms`;
    } else {
      RESULTADO.error($("[data-vista=resultado]"), r.error);
      editor.marcarError(r.error.linea);
      $("[data-estado]").textContent = "Error";
    }
    ocupado = false;
    return r;
  }

  function ponerEditor(texto) {
    editor.poner(texto ?? "");
    editor.limpiarError();
  }

  // --- Pistas y solución --------------------------------------------------
  // `cuenta`: las ayudas de este paso cuentan para los bloques (reto/caso)
  // Los pasos sobre el papel no tienen solucion escrita, pero sí saben mostrarla (PAPEL.mostrarSolucion)
  const tieneSolucion = paso => !!paso.solucion || PASOS_PAPEL.has(paso.tipo);
  function htmlPistas(pasoAyuda) {
    if (!pasoAyuda.pistas?.length && !tieneSolucion(pasoAyuda)) return "";
    return `<div class="lec-ayuda">
      <ol class="lec-pistas" data-lista-pistas></ol>
      <div class="lec-ayuda-botones">
        ${pasoAyuda.pistas?.length ? `<button type="button" data-pista>💡 Pista</button>` : ""}
        ${tieneSolucion(pasoAyuda) ? `<button type="button" data-ver-solucion ${pasoAyuda.pistas?.length ? "hidden" : ""}>👁 Ver la solución</button>` : ""}
      </div>
    </div>`;
  }
  function montarPistas(pasoAyuda, { cuenta = false, alVerSolucion } = {}) {
    let vistas = 0;
    const lista = $("[data-lista-pistas]");
    const bPista = $("[data-pista]");
    const bSol = $("[data-ver-solucion]");
    const total = pasoAyuda.pistas?.length || 0;
    const rotular = () => { if (bPista) bPista.textContent = `💡 Pista (${total - vistas} ${total - vistas === 1 ? "queda" : "quedan"})`; };
    rotular();
    bPista?.addEventListener("click", () => {
      if (vistas >= total) return;
      lista.insertAdjacentHTML("beforeend", `<li>${md(pasoAyuda.pistas[vistas])}</li>`);
      vistas++;
      if (cuenta) { ayudas.pistas++; guardarAyudas(); }
      rotular();
      if (vistas >= total) { bPista.hidden = true; if (bSol) bSol.hidden = false; }
    });
    bSol?.addEventListener("click", () => {
      if (cuenta) { ayudas.solucion = true; guardarAyudas(); }
      alVerSolucion?.();
      bSol.disabled = true;
      bSol.textContent = "👁 Solución en el editor";
    });
  }

  // --- Retroalimentación ------------------------------------------------------
  function aviso(html, tipo) {
    const caja = $("[data-feedback]");
    if (!caja) return;
    caja.className = "lec-feedback lec-feedback--" + tipo;
    caja.innerHTML = html;
    caja.hidden = false;
  }

  // --- Pintar un paso -----------------------------------------------------
  function cabeceraPersonaje(de) {
    const p = PERSONAJES[de];
    if (!p) return "";
    return `<div class="lec-de"><span class="lec-avatar" aria-hidden="true">${esc(p.nombre[0])}</span>
      <span><strong>${esc(p.nombre)}</strong><small>${esc(p.rol)}</small></span></div>`;
  }

  function mostrarPaso(i) {
    clearTimeout(temporizadorParte);
    actual = i;
    terminado = false;
    montajePapel = null;
    const p = lec.pasos[i];
    const caja = $("[data-paso]");
    pintarIndicePasos();
    actualizarNav();
    if (usaSQL && !PASOS_PAPEL.has(p.tipo)) modoTrabajo("sql"); else if (PASOS_PAPEL.has(p.tipo)) modoTrabajo("mesa"); else modoTrabajo(usaSQL ? "sql" : "mesa");
    if (usaSQL) botonesEditor();
    if (!usaSQL && !PASOS_PAPEL.has(p.tipo)) $("[data-zona-mesa]").innerHTML = `<div class="lec-mesa-vacia" aria-hidden="true"></div>`;

    const pintor = PINTORES[p.tipo];
    if (!pintor) { caja.innerHTML = `<p>Tipo de paso desconocido: ${esc(p.tipo)}</p>`; return; }
    pintor(p, caja, i);
    caja.scrollTop = 0;
    caja.focus({ preventScroll: true });
  }

  const PINTORES = {
    historia(p, caja, i) {
      caja.innerHTML = `<article class="lec-ticket">
        <p class="lec-ticket-tipo">Ticket</p>
        ${cabeceraPersonaje(p.de)}
        ${p.asunto ? `<h2>${esc(p.asunto)}</h2>` : ""}
        <p>${md(p.texto)}</p></article>`;
      marcarSuperado(i);
    },

    explicacion(p, caja, i) {
      caja.innerHTML = `${p.titulo ? `<h2>${esc(p.titulo)}</h2>` : ""}
        <p>${md(p.texto)}</p>
        ${p.ejemplo && usaSQL ? `<p class="lec-nota">El ejemplo está en el editor: ejecútalo, cámbialo y vuelve a ejecutarlo.</p>` : ""}
        ${p.consejo ? `<aside class="lec-consejo">${cabeceraPersonaje("lucia")}<p>${md(p.consejo)}</p></aside>` : ""}
        ${p.otrosMotores ? `<aside class="lec-motores"><strong>🌍 En otros motores</strong><p>${md(p.otrosMotores)}</p></aside>` : ""}`;
      if (p.ejemplo && usaSQL) {
        ponerEditor(borradores[i] ?? p.ejemplo);
        ejecutar();
      }
      marcarSuperado(i);
    },

    ejercicio(p, caja, i) { pasoConRevision(p, caja, i, "ejercicio"); },
    arreglar(p, caja, i) { pasoConRevision(p, caja, i, "arreglar"); },
    reto(p, caja, i) { pasoConRevision(p, caja, i, "reto"); },

    quiz(p, caja, i) {
      caja.innerHTML = `<p class="lec-etiqueta">Pregunta</p><h2>${md(p.pregunta)}</h2>
        <div class="lec-opciones" role="group" aria-label="Opciones">${p.opciones.map((o, k) =>
          `<button type="button" class="lec-opcion" data-opcion="${k}">${md(o)}</button>`).join("")}</div>
        <div class="lec-feedback" data-feedback hidden aria-live="polite"></div>`;
      opciones(p, i);
    },

    prediccion(p, caja, i) {
      caja.innerHTML = `<p class="lec-etiqueta">Predicción</p><h2>${md(p.pregunta)}</h2>
        <p class="lec-nota">Mira la consulta del editor y piensa antes de responder. Se ejecutará cuando contestes.</p>
        <div class="lec-opciones" role="group" aria-label="Opciones">${p.opciones.map((o, k) =>
          `<button type="button" class="lec-opcion" data-opcion="${k}">${md(o)}</button>`).join("")}</div>
        <div class="lec-feedback" data-feedback hidden aria-live="polite"></div>`;
      if (usaSQL) {
        ponerEditor(p.consulta);
        RESULTADO.aviso($("[data-vista=resultado]"), "🔮 Responde primero: ¿qué devolverá?");
        $("[data-estado]").textContent = "";
      }
      opciones(p, i, () => usaSQL && ejecutar());
    },

    interpretar(p, caja, i) {
      caja.innerHTML = `<p class="lec-etiqueta">Pregunta de negocio</p><h2>${md(p.pregunta)}</h2>
        <p class="lec-nota">Usa el editor para investigar y escribe aquí tu respuesta (no la consulta).</p>
        <form class="lec-respuesta" data-form-respuesta novalidate>
          <label for="respuesta" class="solo-lector">Tu respuesta</label>
          <input id="respuesta" type="text" autocomplete="off" data-respuesta placeholder="Tu respuesta">
          <button type="submit" class="boton-principal">Comprobar</button>
        </form>
        <div class="lec-feedback" data-feedback hidden aria-live="polite"></div>
        ${htmlPistas(p)}`;
      if (usaSQL) ponerEditor(borradores[i] ?? "");
      montarPistas(p, { alVerSolucion: () => usaSQL && (ponerEditor(p.solucion), ejecutar()) });
      $("[data-form-respuesta]").addEventListener("submit", ev => {
        ev.preventDefault();
        const dada = $("[data-respuesta]").value;
        if (!dada.trim()) return aviso("Escribe una respuesta.", "info");
        if (respuestaCorrecta(dada, p)) { aviso("✔ ¡Exacto!", "ok"); marcarSuperado(i); }
        else aviso("✘ No es eso. Vuelve a mirar los datos.", "mal");
      });
    },

    caso(p, caja, i) { pintarCaso(p, caja, i); },

    clasificar: pasoPapel, seleccionar: pasoPapel, ordenar: pasoPapel, diagrama: pasoPapel
  };

  function opciones(p, i, alAcertar) {
    document.querySelectorAll("[data-opcion]").forEach(b => b.addEventListener("click", () => {
      const k = Number(b.dataset.opcion);
      if (k === p.correcta) {
        document.querySelectorAll("[data-opcion]").forEach(x => { x.disabled = true; });
        b.classList.add("lec-opcion--ok");
        aviso(`✔ ¡Correcto! ${p.explicacion ? md(p.explicacion) : ""}`, "ok");
        marcarSuperado(i);
        alAcertar?.();
      } else {
        b.classList.add("lec-opcion--mal");
        b.disabled = true;
        aviso("✘ No es esa. Prueba otra vez.", "mal");
      }
    }));
  }

  // --- Ejercicio / arreglar / reto ---------------------------------------
  function pasoConRevision(p, caja, i, tipo, opts = {}) {
    const esReto = tipo === "reto";
    const etiqueta = { ejercicio: "Ejercicio", arreglar: "Arregla la consulta", reto: "Reto" }[tipo];
    caja.innerHTML = `${opts.cabecera || ""}<p class="lec-etiqueta">${etiqueta}</p>
      ${p.de ? cabeceraPersonaje(p.de) : ""}
      <p class="lec-enunciado">${md(p.enunciado)}</p>
      ${esReto ? `<ul class="lec-comprobaciones" data-comprobaciones>${p.comprobaciones.map(c =>
        `<li>${md(c.texto)}</li>`).join("")}<li>Tu consulta está bien escrita (termina en <code>;</code> y no da error)</li></ul>` : ""}
      ${p.bonus ? `<p class="lec-bonus">⚡ Extra (+${p.bonus.xp || 10} ◈): ${md(p.bonus.texto)}</p>` : ""}
      <div class="lec-feedback" data-feedback hidden aria-live="polite"></div>
      ${htmlPistas(p)}`;
    const inicial = p.inicial ?? "";
    ponerEditor(borradores[i] ?? inicial);
    botonesEditor({ revisar: true, reiniciar: true });
    RESULTADO.aviso($("[data-vista=resultado]"), "Escribe tu consulta, ejecútala para ver qué devuelve y pulsa **Revisar**.");
    $("[data-estado]").textContent = "";
    $("[data-reiniciar-editor]").onclick = () => { editor.poner(inicial, { deshacer: true }); };
    montarPistas(p, { cuenta: esReto || opts.cuenta, alVerSolucion: () => editor.poner(p.solucion, { deshacer: true }) });
    revisar.actual = async () => {
      const sql = editor.valor();
      ejecutar();
      if (esReto) {
        const r = await REVISOR.revisarReto(p, sql);
        document.querySelectorAll("[data-comprobaciones] li").forEach((li, k) => {
          li.className = r.filas[k]?.ok ? "ok" : "mal";
        });
        if (r.ok) {
          aviso("✔ ¡Reto superado!", "ok");
          opts.alSuperar ? opts.alSuperar(r) : terminar(r);
        } else {
          aviso(r.mensaje ? md(r.mensaje) : "Aún no se cumple todo. Mira las comprobaciones en rojo.", "mal");
          if (r.error?.linea) editor.marcarError(r.error.linea);
        }
      } else {
        const r = await REVISOR.revisarEjercicio(p, sql);
        if (r.ok) { aviso("✔ ¡Correcto!", "ok"); marcarSuperado(i); }
        else {
          aviso("✘ " + md(r.mensaje), "mal");
          if (r.error?.linea) editor.marcarError(r.error.linea);
        }
      }
    };
  }

  let revisando = false;
  async function revisar() {
    if (revisando || !revisar.actual) return;
    revisando = true;
    $("[data-revisar]").disabled = true;
    try { await revisar.actual(); } finally {
      revisando = false;
      $("[data-revisar]").disabled = false;
    }
  }

  // --- Caso: varias partes en orden ------------------------------------------
  function pintarCaso(p, caja, i) {
    const parte = p.partes[parteCaso];
    const cabecera = `${cabeceraPersonaje(p.de)}<p class="lec-enunciado">${md(p.enunciado)}</p>
      <p class="lec-etiqueta">Parte ${parteCaso + 1} de ${p.partes.length}</p>`;
    // Cada parte avanza una sola vez (un doble Enter o doble Revisar no debe saltarse la siguiente)
    let avanzada = false;
    const siguienteParte = () => {
      if (avanzada) return;
      avanzada = true;
      if (parteCaso < p.partes.length - 1) {
        parteCaso++;
        temporizadorParte = setTimeout(() => pintarCaso(p, caja, i), 700);
      } else terminar({});
    };
    if (parte.tipo === "interpretar") {
      PINTORES.interpretar(parte, caja, i);
      caja.insertAdjacentHTML("afterbegin", cabecera);
      // Las ayudas del caso cuentan para los bloques
      const bPista = $("[data-pista]"), bSol = $("[data-ver-solucion]");
      bPista?.addEventListener("click", () => { ayudas.pistas++; guardarAyudas(); });
      bSol?.addEventListener("click", () => { ayudas.solucion = true; guardarAyudas(); });
      const form = $("[data-form-respuesta]");
      form.addEventListener("submit", () => { if (superados.has(i)) { superados.delete(i); siguienteParte(); } });
    } else {
      pasoConRevision(parte, caja, i, "reto", { cabecera, cuenta: true, alSuperar: siguienteParte });
    }
  }

  // --- Pasos sobre el papel ------------------------------------------------
  function pasoPapel(p, caja, i) {
    caja.innerHTML = `<p class="lec-etiqueta">${p.reto ? "Reto" : "Sobre el papel"}</p>
      <p class="lec-enunciado">${md(p.enunciado)}</p>
      <button type="button" class="boton-principal" data-revisar-papel>✔ Revisar</button>
      <div class="lec-feedback" data-feedback hidden aria-live="polite"></div>
      ${htmlPistas(p)}`;
    montajePapel = PAPEL.montar($("[data-zona-mesa]"), p);
    montarPistas(p, { cuenta: !!p.reto, alVerSolucion: () => montajePapel.mostrarSolucion() });
    $("[data-revisar-papel]").addEventListener("click", () => {
      const r = montajePapel.revisar();
      if (r.ok) {
        aviso("✔ " + md(r.mensaje || "¡Correcto!"), "ok");
        if (p.reto) terminar({}); else marcarSuperado(i);
      } else aviso("✘ " + md(r.mensaje), "mal");
    });
  }

  // --- Final: bloques, créditos, credenciales, pista -----------------------
  function terminar(r) {
    if (terminado) return;
    terminado = true;
    marcarSuperado(actual);
    const bloques = ayudas.solucion ? 1 : ayudas.pistas > 0 ? 2 : 3;
    const extra = r?.bonus ? (lec.pasos[actual].bonus?.xp || 10) : 0;
    const res = PROGRESO.registrar(id, bloques, lec.xp || 0, extra);
    guardarAyudas(true);
    const ultimoPaso = lec.pasos[lec.pasos.length - 1];
    const pista = ultimoPaso.tipo === "caso" && ultimoPaso.expediente ? ultimoPaso.expediente : null;
    const pistaNueva = pista ? PROGRESO.anadirPista({ ...pista, nivel: id }) : false;

    $("[data-final-titulo]").textContent = `${CURSO.codigo(id)} · ${lec.titulo}`;
    $("[data-final-cuerpo]").innerHTML = `
      <p class="lec-final-bloques" aria-label="${bloques} de 3 bloques verificados">
        ${[1, 2, 3].map(k => `<i class="${k <= bloques ? "b-lleno" : ""}"></i>`).join("")}
        <span>${bloques === 3 ? "Verificación limpia: sin pistas." : bloques === 2 ? "Verificada con pistas." : "Verificada viendo la solución."}</span>
      </p>
      ${res.guardado === false ? `<p class="lec-final-aviso">⚠️ No se ha podido guardar el progreso (¿almacenamiento del navegador lleno o bloqueado?).</p>` : ""}
      <p class="lec-final-creditos">${res.creditos > 0 ? `+${res.creditos} ◈` : "Sin créditos nuevos (ya la tenías con estos bloques)"}${extra ? " · incluye el extra ⚡" : ""}</p>
      ${res.subeAutorizacion ? `<p class="lec-final-aut">Nueva autorización: <strong>L${res.subeAutorizacion.nivel} · ${esc(res.subeAutorizacion.nombre)}</strong></p>` : ""}
      ${res.credenciales.length ? `<ul class="lec-final-credenciales">${res.credenciales.map(c => `<li>🪪 Credencial: <strong>${esc(c.nombre)}</strong> — ${esc(c.desc)}</li>`).join("")}</ul>` : ""}
      ${pistaNueva ? `<div class="lec-final-pista"><p class="lec-etiqueta">Nueva pista en el expediente</p><h3>${esc(pista.titulo)}</h3><p>${md(pista.texto)}</p></div>` : ""}`;
    const siguiente = ref.etapa.niveles[ref.indice + 1];
    const enlace = $("[data-final-siguiente]");
    if (siguiente?.listo) { enlace.href = `leccion.html?id=${siguiente.id}`; enlace.hidden = false; }
    $("[data-final]").showModal();
  }

  // --- Eventos generales -----------------------------------------------------
  $("[data-anterior]").addEventListener("click", () => { if (actual > 0) mostrarPaso(actual - 1); });
  $("[data-siguiente]").addEventListener("click", () => {
    if (superados.has(actual) && actual < lec.pasos.length - 1) { parteCaso = 0; mostrarPaso(actual + 1); }
  });
  $("[data-ejecutar]").addEventListener("click", ejecutar);
  $("[data-revisar]").addEventListener("click", revisar);
  document.querySelectorAll("[data-pestana]").forEach(p => p.addEventListener("click", () => mostrarPestana(p.dataset.pestana)));

  // Para las pruebas automáticas
  window.LECCION = {
    estado: () => ({ id, actual, superados: [...superados], ayudas: { ...ayudas }, total: lec?.pasos.length, terminado }),
    editor: () => editor,
    revisar
  };

  iniciar();
})();
