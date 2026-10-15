/* ============================================================
   SQLearning · Prólogo (se ve SIEMPRE al entrar; ver docs/HISTORIA.md)
   Las frases aparecen una a una; un clic (o Enter/Espacio) adelanta
   la siguiente. Si ya hay avance, tras la frase 4 llega
   «Anteriormente en el caso…». Al final: sello y «Continuar».
   Con movimiento reducido: todo a la vez y el botón a los 3 s.
   PROLOGO.iniciar(alTerminar)
   ============================================================ */
(function () {
  const FRASES = [
    "La ciudad nunca duerme. Sus luces, a veces, parpadean.",
    "**Faro** vende tecnología en cinco tiendas y en la red. Cada venta, cada cliente, cada caja que sale del almacén deja un rastro: un dato.",
    "Hace semanas que algunos rastros no cuadran. Un stock imposible. Clientes que nadie recuerda. Reembolsos de madrugada.",
    "En los pasillos ya tiene nombre: **el Fantasma**.",
    "Lucía Mora, jefa de datos, necesita a alguien nuevo. Alguien a quien nadie conozca todavía.",
    "Mañana empiezas. Tu herramienta: **SQL**. Tu misión: encontrar la verdad en los datos."
  ];
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const md = s => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const reducido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Las piezas que se van mostrando, según el avance del analista
  function piezas() {
    const d = PROGRESO.datos();
    const avance = Object.keys(d.completados).length > 0;
    const casoCerrado = d.credenciales.includes("exp-8");
    const lista = FRASES.slice(0, 4).map(t => ({ tipo: "frase", html: md(t) }));
    if (!avance) {
      lista.push(...FRASES.slice(4).map(t => ({ tipo: "frase", html: md(t) })));
    } else {
      const ultimo = d.ultimo && CURSO.buscar(d.ultimo);
      const pistas = d.expediente.map(p => `<li><span class="prologo-pista">${esc(p.titulo)}</span></li>`).join("");
      lista.push({
        tipo: "antes",
        html: `<p class="prologo-antes-titulo">Anteriormente en el caso…</p>
          ${pistas ? `<ul class="prologo-pistas">${pistas}</ul>` : `<p>Aún no has encontrado ninguna pista.</p>`}
          ${ultimo ? `<p class="prologo-ultimo">Última diligencia: <strong>${esc(CURSO.codigo(ultimo.nivel.id))} · ${esc(ultimo.nivel.titulo || "")}</strong></p>` : ""}`
      });
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
    const lista = piezas();
    let i = 0, reloj = null, terminado = false;

    caja.innerHTML = "";
    sello.hidden = true;
    boton.hidden = true;
    raiz.hidden = false;
    // Locución del prólogo (solo aquí); si el navegador la bloquea, empieza con el primer clic
    window.MUSICA?.voz("recursos/spech_intropage.mp3");

    function terminar() {
      if (terminado) return;
      terminado = true;
      clearTimeout(reloj);
      ayuda.hidden = true;
      boton.hidden = false;
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

    if (reducido()) {
      lista.forEach(mostrar);
      i = lista.length;
      reloj = setTimeout(terminar, 3000);
    } else {
      siguiente();
    }

    // Clic o Enter/Espacio adelantan la frase siguiente (se ven todas igualmente)
    raiz.onclick = ev => { if (ev.target.closest("[data-musica]")) return; if (!ev.target.closest("[data-continuar]") && !terminado && !reducido()) siguiente(); };
    raiz.onkeydown = ev => {
      if ((ev.key === "Enter" || ev.key === " ") && !ev.target.closest("[data-continuar]") && !terminado && !reducido()) {
        ev.preventDefault();
        siguiente();
      }
    };
    boton.onclick = () => {
      window.MUSICA?.callar();
      raiz.hidden = true;
      alTerminar?.();
    };
    raiz.focus();
  }

  window.PROLOGO = { iniciar };
})();
