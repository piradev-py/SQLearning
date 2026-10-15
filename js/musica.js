/* ============================================================
   SQLearning · Música de fondo y locución del prólogo
   - Dos pistas synthwave que se alternan en bucle, en todas las páginas.
   - Recuerda (localStorage) si suena, el volumen, la pista y el segundo,
     para seguir donde iba al cambiar de página.
   - Los navegadores no dejan sonar nada hasta que la persona interactúa:
     si toca sonar, arranca con el primer clic o tecla.
   - Control: cualquier elemento [data-musica] recibe play/stop + volumen.
   - MUSICA.voz(src): locución (solo el prólogo); baja la música mientras suena.
   ============================================================ */
(function () {
  const CLAVE = "sqlearning-audio";
  const PISTAS = ["recursos/background_synthwave_1.mp3", "recursos/background_synthwave_2.mp3"];
  const ATENUADO = 0.25;                 // la música baja a este porcentaje mientras habla la voz

  const leer = () => {
    try { return Object.assign({ sonando: true, volumen: 0.35, pista: 0, tiempo: 0 }, JSON.parse(localStorage.getItem(CLAVE) || "{}")); }
    catch (e) { return { sonando: true, volumen: 0.35, pista: 0, tiempo: 0 }; }
  };
  const estado = leer();
  estado.volumen = Math.min(1, Math.max(0, Number(estado.volumen) || 0));
  estado.pista = PISTAS[estado.pista] ? estado.pista : 0;
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin guardado */ } };

  const musica = new Audio();
  musica.preload = "none";              // no se descarga hasta que suena
  let voz = null;
  let pendiente = false;                 // esperando la primera interacción para poder sonar

  function aplicarVolumen() {
    musica.volume = estado.volumen * (voz && !voz.paused ? ATENUADO : 1);
    if (voz) voz.volume = Math.min(1, estado.volumen * 2.2 + 0.2);
  }

  function cargarPista(n, segundo = 0) {
    estado.pista = n;
    musica.src = PISTAS[n];
    if (segundo > 0) musica.addEventListener("loadedmetadata", () => {
      if (segundo < musica.duration - 1) musica.currentTime = segundo;
    }, { once: true });
  }

  // Al terminar una pista, pasa a la otra (bucle de las dos)
  musica.addEventListener("ended", () => {
    cargarPista((estado.pista + 1) % PISTAS.length);
    estado.tiempo = 0;
    if (estado.sonando) intentar();
  });

  function intentar() {
    aplicarVolumen();
    const p = musica.play();
    if (p) p.then(() => { pendiente = false; }, () => { pendiente = true; });
    pintar();
  }

  // Primera interacción: arranca lo que estuviera esperando (música y voz)
  function alInteractuar() {
    if (pendiente && estado.sonando) intentar();
    if (voz && voz.dataset.esperando === "1") { voz.dataset.esperando = ""; voz.play().catch(() => {}); }
  }
  ["pointerdown", "keydown"].forEach(t => document.addEventListener(t, alInteractuar, { capture: true }));

  // Guarda el segundo de la canción para seguir en la página siguiente
  setInterval(() => { if (!musica.paused) { estado.tiempo = musica.currentTime; guardar(); } }, 2000);
  addEventListener("pagehide", () => { if (musica.src) estado.tiempo = musica.currentTime || estado.tiempo; guardar(); });

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
      if (estado.sonando) intentar(); else { musica.pause(); estado.tiempo = musica.currentTime; pintar(); }
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
    cargarPista(estado.pista, estado.tiempo);
    if (estado.sonando) intentar();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();

  window.MUSICA = {
    /** Locución (prólogo): suena una vez; la música baja mientras dura. Si el navegador la bloquea, espera al primer clic. */
    voz(src) {
      MUSICA.callar();
      voz = new Audio(src);
      voz.addEventListener("play", aplicarVolumen);
      voz.addEventListener("ended", () => { aplicarVolumen(); });
      voz.addEventListener("pause", aplicarVolumen);
      aplicarVolumen();
      voz.play().catch(() => { voz.dataset.esperando = "1"; });
      return voz;
    },
    /** Para la locución (p. ej. al pulsar «Continuar»). */
    callar() {
      if (voz) { voz.pause(); voz.dataset.esperando = ""; voz = null; }
      aplicarVolumen();
    },
    estado: () => ({ ...estado, pausada: musica.paused, pendiente, voz: voz ? !voz.paused : false })
  };
})();
