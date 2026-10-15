/* ============================================================
   SQLearning · Progreso del analista (localStorage)
   Créditos ◈, bloques verificados (1–3 por diligencia),
   credenciales, nivel de autorización, turnos seguidos,
   pistas del expediente y desbloqueos.
   Modo prueba: progreso aparte en sessionStorage; nunca toca el real.
   ============================================================ */
(function () {
  const CLAVE = "sqlearning-progreso-v1";
  const CLAVE_PRUEBA = "sqlearning-prueba-v1";
  // Modo prueba y «desbloquear todo»: solo para el equipo, con la web servida en local (npm run servir, tests).
  // En la versión publicada no existen: nadie puede saltar a una diligencia sin hacer las anteriores.
  const SOLO_LOCAL = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
  const CREDITOS_POR_BLOQUE = 10;

  const AUTORIZACION = [
    { nivel: 1, min: 0, nombre: "Becario" },
    { nivel: 2, min: 400, nombre: "Analista junior" },
    { nivel: 3, min: 1200, nombre: "Analista" },
    { nivel: 4, min: 2400, nombre: "Analista senior" },
    { nivel: 5, min: 3800, nombre: "Lead de datos" },
    { nivel: 6, min: 5000, nombre: "Head of Data" }
  ];

  const CREDENCIALES = [
    { id: "acceso", nombre: "Acceso concedido", desc: "Supera tu primera diligencia" },
    { id: "limpia", nombre: "Verificación limpia", desc: "Consigue 3 bloques en una diligencia (sin pistas)" },
    { id: "turnos-3", nombre: "Tres turnos seguidos", desc: "Trabaja en el caso 3 días seguidos" },
    { id: "turnos-7", nombre: "Semana de guardia", desc: "Trabaja en el caso 7 días seguidos" },
    { id: "cadena-30", nombre: "Cadena de 30 bloques", desc: "Reúne 30 bloques verificados" },
    { id: "exp-0", nombre: "Arquitecto de datos", desc: "Cierra el expediente 0 · El archivo de papel" },
    { id: "exp-1", nombre: "Acceso a inventario", desc: "Cierra el expediente 1 · Primer día" },
    { id: "exp-2", nombre: "Línea de atención", desc: "Cierra el expediente 2" },
    { id: "exp-3", nombre: "Cuentas de ventas", desc: "Cierra el expediente 3" },
    { id: "exp-4", nombre: "Muelle de Getafe", desc: "Cierra el expediente 4" },
    { id: "exp-5", nombre: "Llave de migración", desc: "Cierra el expediente 5" },
    { id: "exp-6", nombre: "Acceso root", desc: "Cierra el expediente 6" },
    { id: "exp-7", nombre: "Sala de dirección", desc: "Cierra el expediente 7" },
    { id: "exp-8", nombre: "Caso cerrado", desc: "Desenmascara al Fantasma" }
  ];

  function vacio() {
    return {
      creditos: 0,
      completados: {},          // id -> { bloques, fecha }
      credenciales: [],         // ids
      expediente: [],           // [{ id, titulo, texto, nivel }]
      turnos: { dias: 0, ultimo: null },
      ultimo: null,             // último nivel superado
      ajustes: { desbloquearTodo: false }
    };
  }

  // En modo prueba NUNCA se escribe el progreso real (aunque falle sessionStorage)
  let modoPrueba = SOLO_LOCAL && (() => { try { return sessionStorage.getItem(CLAVE_PRUEBA) !== null; } catch (e) { return false; } })();

  function cargar() {
    try {
      const crudo = modoPrueba ? sessionStorage.getItem(CLAVE_PRUEBA) : localStorage.getItem(CLAVE);
      if (!crudo) return vacio();
      const d = JSON.parse(crudo);
      if (!d || typeof d !== "object") return vacio();
      // Se valida pieza a pieza: un dato basura se descarta sin romper la página
      const completados = {};
      if (d.completados && typeof d.completados === "object") {
        for (const [id, c] of Object.entries(d.completados)) {
          const b = Math.round(Number(c?.bloques));
          if (/^e\d+-\d\d$/.test(id) && b >= 1 && b <= 3) completados[id] = { bloques: b, fecha: typeof c.fecha === "string" ? c.fecha : null };
        }
      }
      const texto = v => (typeof v === "string" ? v : "");
      const dias = Math.round(Number(d.turnos?.dias));
      return {
        creditos: Number.isFinite(d.creditos) && d.creditos >= 0 ? Math.round(d.creditos) : 0,
        completados,
        credenciales: Array.isArray(d.credenciales) ? d.credenciales.filter(c => CREDENCIALES.some(x => x.id === c)) : [],
        expediente: Array.isArray(d.expediente)
          ? d.expediente.filter(p => p && typeof p === "object" && texto(p.id) && texto(p.titulo))
              .map(p => ({ id: p.id, titulo: p.titulo, texto: texto(p.texto), nivel: texto(p.nivel) || null }))
          : [],
        turnos: {
          dias: Number.isFinite(dias) && dias >= 0 ? dias : 0,
          ultimo: /^\d{4}-\d{2}-\d{2}$/.test(d.turnos?.ultimo) ? d.turnos.ultimo : null
        },
        ultimo: typeof d.ultimo === "string" && completados[d.ultimo] ? d.ultimo : null,
        ajustes: { desbloquearTodo: SOLO_LOCAL && d.ajustes?.desbloquearTodo === true }
      };
    } catch (e) {
      return vacio();           // JSON roto o almacenamiento bloqueado: se empieza de cero sin romper nada
    }
  }

  let ultimoGuardadoOk = true;
  function guardar(d) {
    try {
      if (modoPrueba) sessionStorage.setItem(CLAVE_PRUEBA, JSON.stringify(d));
      else localStorage.setItem(CLAVE, JSON.stringify(d));
      ultimoGuardadoOk = true;
    } catch (e) { ultimoGuardadoOk = false; /* almacenamiento lleno o bloqueado */ }
  }

  let datos = cargar();

  const hoy = () => new Date().toISOString().slice(0, 10);
  const diasEntre = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

  function autorizacion(creditos = datos.creditos) {
    let actual = AUTORIZACION[0];
    for (const a of AUTORIZACION) if (creditos >= a.min) actual = a;
    const siguiente = AUTORIZACION.find(a => a.nivel === actual.nivel + 1) || null;
    const avance = siguiente ? (creditos - actual.min) / (siguiente.min - actual.min) : 1;
    return { ...actual, siguiente, avance: Math.max(0, Math.min(1, avance)) };
  }

  const totalBloques = () => Object.values(datos.completados).reduce((s, c) => s + (c.bloques || 0), 0);
  const completado = id => !!datos.completados[id];
  const etapaCerrada = etapa => etapa.niveles.every(n => completado(n.id));

  /** ¿Se puede abrir este expediente? EXP.0 y EXP.1 siempre; los demás, al cerrar el anterior (el 0 no cuenta). */
  function etapaAbierta(etapa) {
    if (datos.ajustes.desbloquearTodo || etapa.n <= 1) return true;
    const anterior = CURSO.ETAPAS.find(e => e.n === etapa.n - 1);
    return !!anterior && etapaCerrada(anterior);
  }

  /** ¿Se puede jugar esta diligencia? Su expediente abierto y la anterior superada. */
  function disponible(id) {
    const b = CURSO.buscar(id);
    if (!b || !etapaAbierta(b.etapa)) return false;
    if (datos.ajustes.desbloquearTodo || b.indice === 0) return true;
    return completado(b.etapa.niveles[b.indice - 1].id);
  }

  function darCredencial(id, nuevas) {
    if (!datos.credenciales.includes(id)) { datos.credenciales.push(id); nuevas.push(CREDENCIALES.find(c => c.id === id)); }
  }

  /**
   * Registra una diligencia superada con 1–3 bloques. Solo suma la mejora respecto a intentos anteriores.
   * Devuelve { creditos, bloquesNuevos, credenciales: [nuevas], subeAutorizacion }.
   */
  function registrar(id, bloques, creditosBase = 0, extra = 0) {
    datos = cargar();                    // otra pestaña pudo guardar avance mientras tanto
    bloques = Math.max(1, Math.min(3, Math.round(bloques)));
    const antes = datos.completados[id];
    const autAntes = autorizacion().nivel;
    let ganados = 0;
    if (!antes) ganados = creditosBase + bloques * CREDITOS_POR_BLOQUE + extra;
    else if (bloques > antes.bloques) ganados = (bloques - antes.bloques) * CREDITOS_POR_BLOQUE;
    if (!antes || bloques > antes.bloques) datos.completados[id] = { bloques, fecha: hoy() };
    datos.creditos += ganados;
    datos.ultimo = id;

    // Turnos seguidos (días con alguna diligencia superada)
    const d = hoy();
    if (datos.turnos.ultimo !== d) {
      datos.turnos.dias = datos.turnos.ultimo && diasEntre(datos.turnos.ultimo, d) === 1 ? datos.turnos.dias + 1 : 1;
      datos.turnos.ultimo = d;
    }

    const nuevas = [];
    darCredencial("acceso", nuevas);
    if (bloques === 3) darCredencial("limpia", nuevas);
    if (datos.turnos.dias >= 3) darCredencial("turnos-3", nuevas);
    if (datos.turnos.dias >= 7) darCredencial("turnos-7", nuevas);
    if (totalBloques() >= 30) darCredencial("cadena-30", nuevas);
    const b = CURSO.buscar(id);
    if (b && etapaCerrada(b.etapa)) darCredencial("exp-" + b.etapa.n, nuevas);

    guardar(datos);
    return {
      creditos: ganados,
      bloquesNuevos: antes ? Math.max(0, bloques - antes.bloques) : bloques,
      credenciales: nuevas.filter(Boolean),
      subeAutorizacion: autorizacion().nivel > autAntes ? autorizacion() : null,
      guardado: ultimoGuardadoOk
    };
  }

  /** Añade una pista al expediente del caso (solo una vez). */
  function anadirPista(pista) {
    datos = cargar();
    if (!pista?.id || datos.expediente.some(p => p.id === pista.id)) return false;
    datos.expediente.push({ id: pista.id, titulo: pista.titulo, texto: pista.texto, nivel: pista.nivel || null });
    guardar(datos);
    return true;
  }

  window.PROGRESO = {
    AUTORIZACION, CREDENCIALES, CREDITOS_POR_BLOQUE,
    datos: () => datos,
    autorizacion, totalBloques, completado, etapaCerrada, etapaAbierta, disponible,
    bloquesDe: id => datos.completados[id]?.bloques || 0,
    registrar, anadirPista,
    enPrueba: () => modoPrueba,
    ajustar(clave, valor) { datos = cargar(); datos.ajustes[clave] = valor; guardar(datos); },
    /** Vuelve a leer el progreso (p. ej. si otra pestaña lo ha cambiado). */
    recargar() { datos = cargar(); },
    CLAVE,
    /** Modo prueba: progreso de usar y tirar (sessionStorage), con todo desbloqueado. */
    pruebaDisponible: () => SOLO_LOCAL,
    entrarPrueba() {
      if (!SOLO_LOCAL) return;
      try { sessionStorage.setItem(CLAVE_PRUEBA, JSON.stringify(Object.assign(vacio(), { ajustes: { desbloquearTodo: true } }))); } catch (e) { /* solo en memoria */ }
      modoPrueba = true;
      datos = Object.assign(vacio(), { ajustes: { desbloquearTodo: true } });
    },
    salirPrueba() {
      try { sessionStorage.removeItem(CLAVE_PRUEBA); } catch (e) { /* nada */ }
      modoPrueba = false;
      datos = cargar();
    },
    /** Borra todo el progreso real (pide confirmación quien lo llame). */
    reiniciar() {
      datos = vacio();
      guardar(datos);
    }
  };
})();
