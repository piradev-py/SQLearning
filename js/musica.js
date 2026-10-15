/* ============================================================
   SQLearning · Música de fondo y locución del prólogo
   - Playlist de 4 pistas synthwave en bucle, en todas las páginas.
   - Crossfade: dos «platos» de audio; cuando a la pista le quedan
     FUNDIDO segundos, la siguiente entra en el otro plato y se cruzan
     (una sube mientras la otra baja).
   - Recuerda (localStorage) si suena, el volumen, la pista y el segundo,
     para seguir donde iba al cambiar de página.
   - Los navegadores no dejan sonar nada hasta que la persona interactúa:
     si toca sonar, arranca con el primer clic o tecla.
   - Control: cualquier elemento [data-musica] recibe play/stop + volumen.
   - MUSICA.voz(src): locución (solo el prólogo); baja la música mientras suena.
   ============================================================ */
(function () {
  const CLAVE = "sqlearning-audio";
  const PISTAS = [1, 2, 3, 4].map(n => `recursos/background_synthwave_${n}.mp3`);
  const FUNDIDO = 6;                     // segundos de crossfade entre pistas
  const ATENUADO = 0.25;                 // la música baja a este porcentaje mientras habla la voz

  const porDefecto = { sonando: true, volumen: 0.35, pista: 0, tiempo: 0 };
  const leer = () => {
    try { return Object.assign({}, porDefecto, JSON.parse(localStorage.getItem(CLAVE) || "{}")); }
    catch (e) { return { ...porDefecto }; }
  };
  const estado = leer();
  estado.volumen = Math.min(1, Math.max(0, Number(estado.volumen) || 0));
  estado.pista = Number.isInteger(estado.pista) && PISTAS[estado.pista] ? estado.pista : 0;
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin guardado */ } };

  // Dos platos: «actual» suena; «otro» espera para el crossfade
  const crear = () => { const a = new Audio(); a.preload = "none"; a.dataset.mezcla = "1"; return a; };
  let actual = crear(), otro = crear();
  let fundiendo = false;
  let voz = null;
  let pendiente = false;                 // esperando la primera interacción para poder sonar

  const base = () => estado.volumen * (voz && !voz.paused ? ATENUADO : 1);
  function aplicarVolumen() {
    if (!fundiendo) actual.volume = base();
    if (voz) voz.volume = Math.min(1, estado.volumen * 2.2 + 0.2);
  }

  function cargar(plato, n, segundo = 0) {
    plato.src = PISTAS[n];
    plato.dataset.pista = n;
    if (segundo > 0) plato.addEventListener("loadedmetadata", () => {
      if (segundo < plato.duration - FUNDIDO - 1) plato.currentTime = segundo;
    }, { once: true });
  }

  // --- Crossfade -----------------------------------------------------------
  function cruzar() {
    if (fundiendo || !estado.sonando) return;
    fundiendo = true;
    const siguiente = (Number(actual.dataset.pista) + 1) % PISTAS.length;
    cargar(otro, siguiente);
    otro.volume = 0;
    otro.play().catch(() => {});
    const saliente = actual, entrante = otro;
    const inicio = performance.now();
    const paso = setInterval(() => {
      const t = Math.min(1, (performance.now() - inicio) / (FUNDIDO * 1000));
      const v = base();
      entrante.volume = v * t;
      saliente.volume = v * (1 - t);
      if (t >= 1) {
        clearInterval(paso);
        saliente.pause();
        saliente.removeAttribute("src");
        saliente.load();                 // suelta la pista anterior
        actual = entrante;
        otro = saliente;
        estado.pista = siguiente;
        estado.tiempo = 0;
        fundiendo = false;
        guardar();
        aplicarVolumen();
      }
    }, 100);
  }
  function vigilar(plato) {
    plato.addEventListener("timeupdate", () => {
      if (plato === actual && plato.duration && plato.duration - plato.currentTime <= FUNDIDO) cruzar();
    });
    // Por si la pista termina sin que el crossfade haya empezado (p. ej. pestaña en segundo plano)
    plato.addEventListener("ended", () => { if (plato === actual && !fundiendo) cruzar(); });
  }
  vigilar(actual);
  vigilar(otro);

  function intentar() {
    aplicarVolumen();
    const p = actual.play();
    if (p) p.then(() => { pendiente = false; pintar(); }, () => { pendiente = true; pintar(); });
    pintar();
  }
  function parar() {
    fundiendo = false;
    [actual, otro].forEach(a => a.pause());
    estado.tiempo = actual.currentTime || estado.tiempo;
  }

  // Primera interacción: arranca lo que estuviera esperando (música y voz)
  function alInteractuar() {
    if (pendiente && estado.sonando) intentar();
    if (voz && voz.dataset.esperando === "1") { voz.dataset.esperando = ""; voz.play().catch(() => {}); aplicarVolumen(); }
  }
  ["pointerdown", "keydown"].forEach(t => document.addEventListener(t, alInteractuar, { capture: true }));

  // Guarda el segundo de la canción para seguir en la página siguiente
  setInterval(() => { if (!actual.paused && !fundiendo) { estado.tiempo = actual.currentTime; guardar(); } }, 2000);
  addEventListener("pagehide", () => { if (actual.src && !fundiendo) estado.tiempo = actual.currentTime || estado.tiempo; guardar(); });

  // --- Control en pantalla ---------------------------------------------
  const controles = [];
  function pintar() {
    const suena = estado.sonando;
    controles.forEach(c => {
      c.boton.textContent = suena ? "⏸" : "▶";
      c.boton.setAttribute("aria-label", suena ? "Parar la música" : "Poner la música");
      c.boton.setAttribute("aria-pressed", String(suena));
      c.boton.title = suena ? (pendiente ? "La música empezará con tu primer clic" : "Parar la música") : "Poner la música";
      c.rango.value = Math.round(estado.volumen * 100);
    });
  }
  function montar(el) {
    el.classList.add("musica");
    el.innerHTML = `<button type="button" class="musica-boton"></button>
      <span class="musica-nota" aria-hidden="true">♪</span>
      <input type="range" class="musica-volumen" min="0" max="100" step="5" aria-label="Volumen de la música">`;
    const c = { boton: el.querySelector("button"), rango: el.querySelector("input") };
    c.boton.addEventListener("click", () => {
      estado.sonando = !estado.sonando;
      if (estado.sonando) intentar(); else { parar(); pintar(); }
      guardar();
    });
    c.rango.addEventListener("input", () => {
      estado.volumen = Number(c.rango.value) / 100;
      aplicarVolumen();
      guardar();
    });
    controles.push(c);
    pintar();
  }

  function iniciar() {
    document.querySelectorAll("[data-musica]").forEach(montar);
    cargar(actual, estado.pista, estado.tiempo);
    if (estado.sonando) intentar();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();

  window.MUSICA = {
    /** Locución (prólogo): suena una vez; la música baja mientras dura. Si el navegador la bloquea, espera al primer clic. */
    voz(src) {
      MUSICA.callar();
      voz = new Audio(src);
      ["play", "pause", "ended"].forEach(t => voz.addEventListener(t, aplicarVolumen));
      aplicarVolumen();
      voz.play().catch(() => { if (voz) voz.dataset.esperando = "1"; });
      return voz;
    },
    /** Para la locución (p. ej. al pulsar «Continuar»). */
    callar() {
      if (voz) { voz.pause(); voz.dataset.esperando = ""; voz = null; }
      aplicarVolumen();
    },
    estado: () => ({ ...estado, pausada: actual.paused, pendiente, fundiendo, voz: voz ? !voz.paused : false }),
    PISTAS, FUNDIDO,
    _platos: () => ({ actual, otro })     // solo para las pruebas automáticas
  };
})();
