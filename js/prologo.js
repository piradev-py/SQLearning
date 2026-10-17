/* ============================================================
   SQLearning · Prólogo (se ve SIEMPRE al entrar; ver docs/HISTORIA.md)
   Las frases aparecen una a una; un clic (o Enter/Espacio) adelanta
   la siguiente. Si ya hay avance, tras la frase 4 llega
   «Anteriormente en el caso…». Al final: sello y «Continuar».
   Con movimiento reducido: el mismo ritmo, con un fundido sin movimiento (css/inicio.css).
   PROLOGO.iniciar(alTerminar)
   ============================================================ */
(function () {
  // Texto del usuario (ver docs/HISTORIA.md). Las 3 primeras frases presentan el caso; la última cierra.
  const FRASES = [
    "La ciudad tiene secretos. Y algunos se esconden en los datos.",
    "En **Faro**, una empresa tecnológica con cinco tiendas y una tienda online, algo extraño está ocurriendo: productos que desaparecen, clientes que nunca existieron y reembolsos imposibles.",
    "Alguien está detrás de todo. Le llaman **el Fantasma**.",
    "Lucía Mora, jefa de datos, te ha elegido para descubrir la verdad. Tu única herramienta es **SQL**. Tus únicas pistas, miles de registros.",
    "Cada consulta revela una pista. Cada error oculta un secreto.",
    "¿Estás preparado para encontrar al Fantasma?",
    "Ten cuidado. Puede que él también te esté buscando."
  ];
  const PRESENTACION = 3;                // frases que se ven también al volver con avance
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const md = s => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Las piezas que se van mostrando, según el avance del analista
  function piezas() {
    const d = PROGRESO.datos();
    const avance = Object.keys(d.completados).length > 0;
    const casoCerrado = PROGRESO.casoCerrado();
    const lista = FRASES.slice(0, PRESENTACION).map(t => ({ tipo: "frase", html: md(t) }));
    if (!avance) {
      lista.push(...FRASES.slice(PRESENTACION).map(t => ({ tipo: "frase", html: md(t) })));
    } else {
      const ultimo = d.ultimo && CURSO.buscar(d.ultimo);
      const pistas = d.expediente.map(p => `<li><span class="prologo-pista">${esc(p.titulo)}</span></li>`).join("");
      lista.push({
        tipo: "antes",
        html: `<p class="prologo-antes-titulo">Anteriormente en el caso…</p>
          ${pistas ? `<ul class="prologo-pistas">${pistas}</ul>` : `<p>Aún no has encontrado ninguna pista.</p>`}
          ${ultimo ? `<p class="prologo-ultimo">Última diligencia: <strong>${esc(CURSO.codigo(ultimo.nivel.id))} · ${esc(ultimo.nivel.titulo || "")}</strong></p>` : ""}`
      });
      if (!casoCerrado) lista.push({ tipo: "frase", html: md(FRASES[FRASES.length - 1]) });
    }
    lista.push({ tipo: "sello", texto: casoCerrado ? "CASO CERRADO" : avance ? "CASO EN CURSO" : "CASO ABIERTO" });
    return lista;
  }

  function iniciar(alTerminar) {
    const raiz = document.querySelector("[data-prologo]");
    const caja = raiz.querySelector("[data-lineas]");
    const sello = raiz.querySelector("[data-sello]");
    const boton = raiz.querySelector("[data-continuar]");
    const ayuda = raiz.querySelector("[data-ayuda]");
    const entrar = raiz.querySelector("[data-entrar]");
    const final = raiz.querySelector("[data-final]");
    const lista = piezas();
    let i = 0, reloj = null, terminado = false, empezado = false;

    caja.innerHTML = "";
    sello.hidden = true;
    boton.hidden = true;
    final.hidden = true;
    ayuda.hidden = true;
    entrar.hidden = false;
    raiz.hidden = false;

    function terminar() {
      if (terminado) return;
      terminado = true;
      clearTimeout(reloj);
      ayuda.hidden = true;
      boton.hidden = false;
      final.hidden = !PROGRESO.casoCerrado();
      boton.focus();
    }

    function mostrar(p) {
      if (p.tipo === "sello") {
        sello.querySelector("[data-sello-texto]").textContent = p.texto;
        sello.hidden = false;
        return;
      }
      const el = document.createElement(p.tipo === "antes" ? "div" : "p");
      el.className = p.tipo === "antes" ? "prologo-antes" : "prologo-frase";
      el.innerHTML = p.html;
      caja.append(el);
    }

    // Tiempo de lectura de cada pieza: ~45 ms por carácter, entre 2,2 y 6 s
    const espera = p => p.tipo === "sello" ? 1800 : Math.min(6000, Math.max(2200, p.html.replace(/<[^>]+>/g, "").length * 45 + 1200));

    function siguiente() {
      clearTimeout(reloj);
      if (i >= lista.length) return terminar();
      const p = lista[i++];
      mostrar(p);
      reloj = setTimeout(siguiente, espera(p));
    }

    // «Abrir el caso»: los navegadores no dejan sonar nada sin un clic, así que el prólogo
    // (texto, locución y música) arranca con él, todo sincronizado.
    function empezar() {
      if (empezado) return;
      empezado = true;
      entrar.hidden = true;
      ayuda.hidden = false;
      if (window.MUSICA && !MUSICA.vozSilenciada()) MUSICA.voz(VOZ);
      siguiente();
      raiz.focus();
    }

    // Antes de empezar, cualquier clic o Enter/Espacio abre el caso; después, adelantan la frase siguiente
    const avanzar = () => { if (!empezado) empezar(); else if (!terminado) siguiente(); };
    raiz.onclick = ev => {
      if (ev.target.closest("[data-musica], [data-voz], [data-continuar], [data-final]")) return;
      avanzar();
    };
    raiz.onkeydown = ev => {
      if ((ev.key === "Enter" || ev.key === " ") && !ev.target.closest("[data-continuar], [data-voz], [data-musica], [data-final]")) {
        ev.preventDefault();
        avanzar();
      }
    };
    boton.onclick = () => {
      window.MUSICA?.callar();
      raiz.hidden = true;
      alTerminar?.();
    };
    pintarVoz();
    entrar.focus();
  }

  // --- Botón para silenciar la locución (se recuerda) ---------------------
  const VOZ = "recursos/spech_intropage.mp3";
  function pintarVoz() {
    const b = document.querySelector("[data-voz]");
    if (!b || !window.MUSICA) return;
    const callada = MUSICA.vozSilenciada();
    b.textContent = callada ? "🔇 Voz" : "🔊 Voz";
    b.setAttribute("aria-pressed", String(!callada));
    b.setAttribute("aria-label", callada ? "Activar la voz del prólogo" : "Silenciar la voz del prólogo");
    b.title = callada ? "La voz del prólogo está silenciada" : "Silenciar la voz del prólogo (se recuerda)";
  }
  document.addEventListener("click", ev => {
    if (!ev.target.closest("[data-voz]") || !window.MUSICA) return;
    const callar = !MUSICA.vozSilenciada();
    MUSICA.silenciarVoz(callar);
    // Si se reactiva con el prólogo en marcha, vuelve a sonar desde el principio
    const prologoActivo = !document.querySelector("[data-prologo]")?.hidden && document.querySelector("[data-entrar]")?.hidden;
    if (!callar && prologoActivo) MUSICA.voz(VOZ);
    pintarVoz();
  });

  window.PROLOGO = { iniciar };
})();
