/* ============================================================
   SQLearning · Pasos «sobre el papel» (Etapa 0, sin SQL)
   clasificar · seleccionar · ordenar · diagrama (ver FORMATO_LECCION)
   PAPEL.montar(div, paso) → { revisar() → { ok, mensaje }, mostrarSolucion() }
   Todo se puede hacer con clics y teclado (no solo arrastrando).
   ============================================================ */
(function () {
  const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

  // Barajado determinista (mismo orden cada vez para el mismo enunciado), nunca igual al correcto
  function barajar(lista, semilla) {
    let s = [...semilla].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
    const azar = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const r = [...lista];
    for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(azar() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    if (r.length > 1 && r.every((x, i) => x === lista[i])) r.push(r.shift());
    return r;
  }

  // ------------------------------------------------------------------ clasificar
  function clasificar(div, paso) {
    // Zonas: los grupos; en modo Venn (2 grupos), las 4 regiones
    const zonas = paso.venn
      ? [
          { clave: paso.grupos[0], nombre: "Solo " + paso.grupos[0] },
          { clave: [paso.grupos[0], paso.grupos[1]].sort().join("|"), nombre: `${paso.grupos[0]} y ${paso.grupos[1]}` },
          { clave: paso.grupos[1], nombre: "Solo " + paso.grupos[1] },
          { clave: "", nombre: "Ninguno" }
        ]
      : paso.grupos.map(g => ({ clave: g, nombre: g }));
    const claveDe = el => paso.venn ? [].concat(el.grupo).sort().join("|") : el.grupo;
    const elementos = barajar(paso.elementos.map((e, i) => ({ ...e, i })), paso.enunciado);
    const colocado = {};                         // i -> clave de zona
    let elegido = null;

    function pintar() {
      const ficha = e => `<button type="button" class="papel-ficha${elegido === e.i ? " papel-ficha--elegida" : ""}" draggable="true"
          data-ficha="${e.i}" aria-pressed="${elegido === e.i}">${esc(e.texto)}</button>`;
      div.innerHTML = `<div class="papel papel-clasificar${paso.venn ? " papel-venn" : ""}">
        <p class="papel-ayuda">Pulsa una ficha y luego el grupo donde va (o arrástrala).</p>
        <div class="papel-monton" data-zona="__monton" aria-label="Fichas sin colocar">
          ${elementos.filter(e => colocado[e.i] === undefined).map(ficha).join("") || `<span class="papel-vacio">Todas colocadas</span>`}
        </div>
        <div class="papel-zonas">${zonas.map(z => `
          <section class="papel-zona" data-zona="${esc(z.clave)}" tabindex="0" role="button" aria-label="Grupo ${esc(z.nombre)}">
            <h3>${esc(z.nombre)}</h3>
            <div class="papel-zona-fichas">${elementos.filter(e => colocado[e.i] === z.clave).map(ficha).join("")}</div>
          </section>`).join("")}
        </div></div>`;
    }
    function mover(i, clave) {
      if (clave === "__monton") delete colocado[i]; else colocado[i] = clave;
      elegido = null;
      pintar();
    }
    div.onclick = ev => {
      const f = ev.target.closest("[data-ficha]");
      if (f) { const i = Number(f.dataset.ficha); elegido = elegido === i ? null : i; pintar(); return; }
      const z = ev.target.closest("[data-zona]");
      if (z && elegido !== null) mover(elegido, z.dataset.zona);
    };
    div.onkeydown = ev => {
      const z = ev.target.closest("section[data-zona]");
      if (z && (ev.key === "Enter" || ev.key === " ") && elegido !== null) { ev.preventDefault(); mover(elegido, z.dataset.zona); }
    };
    div.ondragstart = ev => { const f = ev.target.closest("[data-ficha]"); if (f) ev.dataTransfer.setData("text/plain", f.dataset.ficha); };
    div.ondragover = ev => { if (ev.target.closest("[data-zona]")) ev.preventDefault(); };
    div.ondrop = ev => {
      const z = ev.target.closest("[data-zona]");
      if (!z) return;
      ev.preventDefault();
      mover(Number(ev.dataTransfer.getData("text/plain")), z.dataset.zona);
    };
    pintar();
    return {
      revisar() {
        const sin = elementos.filter(e => colocado[e.i] === undefined).length;
        if (sin) return { ok: false, mensaje: `Te ${sin === 1 ? "queda" : "quedan"} ${plural(sin, "ficha", "fichas")} por colocar.` };
        const mal = elementos.filter(e => colocado[e.i] !== claveDe(e)).length;
        return mal ? { ok: false, mensaje: `${plural(mal, "ficha está", "fichas están")} en el grupo equivocado.` } : { ok: true };
      },
      mostrarSolucion() { elementos.forEach(e => { colocado[e.i] = claveDe(e); }); elegido = null; pintar(); }
    };
  }

  // ------------------------------------------------------------------ seleccionar
  function seleccionar(div, paso) {
    const modo = paso.modo || "filas";
    const { columnas, filas } = paso.tabla;
    const marcadas = new Set();
    const clave = x => Array.isArray(x) ? x.join(",") : String(x);
    const correctas = new Set(paso.correctas.map(clave));

    function pintar() {
      const marcable = (k, contenido, etiqueta) =>
        `<button type="button" class="papel-celda${marcadas.has(k) ? " papel-celda--marcada" : ""}" data-marca="${k}" aria-pressed="${marcadas.has(k)}" aria-label="${esc(etiqueta)}">${contenido}</button>`;
      div.innerHTML = `<div class="papel papel-seleccionar papel-modo-${modo}">
        <p class="papel-ayuda">Pulsa para marcar o desmarcar ${modo === "filas" ? "filas" : modo === "columnas" ? "columnas" : "celdas"}.</p>
        <table class="papel-tabla">
          <thead><tr>${modo === "filas" ? "<th></th>" : ""}${columnas.map((c, j) => `<th>${modo === "columnas" ? marcable(String(j), esc(c), "Columna " + c) : esc(c)}</th>`).join("")}</tr></thead>
          <tbody>${filas.map((f, i) => `<tr class="${modo === "filas" && marcadas.has(String(i)) ? "papel-fila--marcada" : ""}">
            ${modo === "filas" ? `<td>${marcable(String(i), marcadas.has(String(i)) ? "☑" : "☐", "Fila " + (i + 1))}</td>` : ""}
            ${f.map((v, j) => `<td>${modo === "celdas" ? marcable(i + "," + j, esc(v), `Fila ${i + 1}, ${columnas[j]}: ${v}`) : esc(v)}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table></div>`;
    }
    div.onclick = ev => {
      const b = ev.target.closest("[data-marca]");
      if (!b) return;
      const k = b.dataset.marca;
      marcadas.has(k) ? marcadas.delete(k) : marcadas.add(k);
      pintar();
      div.querySelector(`[data-marca="${CSS.escape(k)}"]`)?.focus();
    };
    pintar();
    return {
      revisar() {
        const sobran = [...marcadas].filter(k => !correctas.has(k)).length;
        const faltan = [...correctas].filter(k => !marcadas.has(k)).length;
        if (!sobran && !faltan) return { ok: true };
        const partes = [];
        if (sobran) partes.push(`${plural(sobran, "marcada que no toca", "marcadas que no tocan")}`);
        if (faltan) partes.push(`te ${faltan === 1 ? "falta" : "faltan"} ${faltan} por marcar`);
        return { ok: false, mensaje: "Tienes " + partes.join(" y ") + "." };
      },
      mostrarSolucion() { marcadas.clear(); correctas.forEach(k => marcadas.add(k)); pintar(); }
    };
  }

  // ------------------------------------------------------------------ ordenar
  function ordenar(div, paso) {
    let orden = barajar(paso.elementos.map((t, i) => ({ t, i })), paso.enunciado);
    function pintar(foco) {
      div.innerHTML = `<div class="papel papel-ordenar">
        <p class="papel-ayuda">Sube y baja cada elemento hasta dejarlos en orden.</p>
        <ol class="papel-lista">${orden.map((e, k) => `<li>
          <span class="papel-num">${k + 1}</span><span class="papel-texto">${esc(e.t)}</span>
          <button type="button" data-subir="${k}" aria-label="Subir «${esc(e.t)}»" ${k === 0 ? "disabled" : ""}>▲</button>
          <button type="button" data-bajar="${k}" aria-label="Bajar «${esc(e.t)}»" ${k === orden.length - 1 ? "disabled" : ""}>▼</button>
        </li>`).join("")}</ol></div>`;
      if (foco) div.querySelector(foco)?.focus();
    }
    div.onclick = ev => {
      const s = ev.target.closest("[data-subir]"), b = ev.target.closest("[data-bajar]");
      if (s) { const k = Number(s.dataset.subir); [orden[k - 1], orden[k]] = [orden[k], orden[k - 1]]; pintar(`[data-subir="${Math.max(1, k - 1)}"]`); }
      if (b) { const k = Number(b.dataset.bajar); [orden[k + 1], orden[k]] = [orden[k], orden[k + 1]]; pintar(`[data-bajar="${Math.min(orden.length - 2, k + 1)}"]`); }
    };
    pintar();
    return {
      revisar() {
        const fuera = orden.filter((e, k) => e.i !== k).length;
        return fuera ? { ok: false, mensaje: `${plural(fuera, "elemento está", "elementos están")} fuera de su sitio.` } : { ok: true };
      },
      mostrarSolucion() { orden = paso.elementos.map((t, i) => ({ t, i })); pintar(); }
    };
  }

  // ------------------------------------------------------------------ diagrama
  function diagrama(div, paso) {
    const ent = paso.entidades;
    const nombre = idE => ent.find(e => e.id === idE)?.nombre || idE;
    const fijas = (paso.fijas || []).map(r => ({ ...r, fija: true }));
    let rels = [...fijas];
    const TIPOS = ["1:1", "1:N", "N:M"];
    // Relación normalizada: par ordenado alfabéticamente y tipo visto desde el primero
    const norma = r => {
      const invertir = r.de > r.a;
      const tipo = invertir && r.tipo === "1:N" ? "N:1" : r.tipo;
      return { par: invertir ? `${r.a}|${r.de}` : `${r.de}|${r.a}`, tipo };
    };

    function pintar() {
      const cols = Math.min(3, ent.length);
      div.innerHTML = `<div class="papel papel-diagrama">
        <p class="papel-ayuda">Elige dos entidades y el tipo de relación, y pulsa «Unir».</p>
        <div class="papel-lienzo" data-lienzo style="grid-template-columns:repeat(${cols},1fr)">
          <svg class="papel-lineas" data-lineas aria-hidden="true"></svg>
          ${ent.map(e => `<section class="papel-entidad" data-entidad="${esc(e.id)}">
            <h3>${esc(e.nombre)}</h3><ul>${(e.atributos || []).map(a => `<li>${esc(a)}</li>`).join("")}</ul></section>`).join("")}
        </div>
        <form class="papel-unir" data-unir novalidate>
          <label>De <select data-de>${ent.map(e => `<option value="${esc(e.id)}">${esc(e.nombre)}</option>`).join("")}</select></label>
          <label>Tipo <select data-tipo>${TIPOS.map(t => `<option>${t}</option>`).join("")}</select></label>
          <label>A <select data-a>${ent.map((e, k) => `<option value="${esc(e.id)}" ${k === 1 ? "selected" : ""}>${esc(e.nombre)}</option>`).join("")}</select></label>
          <button type="submit">Unir</button>
        </form>
        <ul class="papel-relaciones" aria-label="Relaciones dibujadas">${rels.map((r, k) => `<li>
          <span>${esc(nombre(r.de))} <b>${esc(r.tipo)}</b> ${esc(nombre(r.a))}</span>
          ${r.fija ? `<small>(ya venía)</small>` : `<button type="button" data-quitar="${k}" aria-label="Quitar relación ${esc(nombre(r.de))} ${esc(r.tipo)} ${esc(nombre(r.a))}">✕</button>`}
        </li>`).join("") || `<li class="papel-vacio">Aún no hay relaciones.</li>`}</ul>
      </div>`;
      requestAnimationFrame(lineas);
    }
    function lineas() {
      const lienzo = div.querySelector("[data-lienzo]"), svg = div.querySelector("[data-lineas]");
      if (!lienzo) return;
      const caja = lienzo.getBoundingClientRect();
      // Si entretanto se montó otro paso en la mesa, sus entidades pueden no existir: se salta esa línea
      const centro = idE => {
        const el = lienzo.querySelector(`[data-entidad="${CSS.escape(idE)}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left - caja.left + r.width / 2, y: r.top - caja.top + r.height / 2 };
      };
      svg.setAttribute("viewBox", `0 0 ${caja.width} ${caja.height}`);
      svg.innerHTML = rels.map(r => {
        const a = centro(r.de), b = centro(r.a);
        if (!a || !b) return "";
        const [ta, tb] = r.tipo === "1:1" ? ["1", "1"] : r.tipo === "1:N" ? ["1", "N"] : ["N", "M"];
        const p = t => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
        const pa = p(0.3), pb = p(0.7);
        return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>
          <text x="${pa.x}" y="${pa.y - 6}">${ta}</text><text x="${pb.x}" y="${pb.y - 6}">${tb}</text>`;
      }).join("");
    }
    div.onsubmit = ev => {
      ev.preventDefault();
      const de = div.querySelector("[data-de]").value, a = div.querySelector("[data-a]").value, tipo = div.querySelector("[data-tipo]").value;
      if (de === a) return;
      const n = norma({ de, a, tipo });
      rels = rels.filter(r => norma(r).par !== n.par || r.fija);       // una sola relación por pareja
      if (!rels.some(r => norma(r).par === n.par)) rels.push({ de, a, tipo });
      pintar();
    };
    div.onclick = ev => {
      const q = ev.target.closest("[data-quitar]");
      if (q) { rels.splice(Number(q.dataset.quitar), 1); pintar(); }
    };
    pintar();
    return {
      revisar() {
        const esperadas = new Map(paso.relaciones.concat(paso.fijas || []).map(r => [norma(r).par, norma(r).tipo]));
        const dadas = new Map(rels.map(r => [norma(r).par, norma(r).tipo]));
        const faltan = [...esperadas.keys()].filter(k => !dadas.has(k)).length;
        const sobran = [...dadas.keys()].filter(k => !esperadas.has(k)).length;
        const tipoMal = [...dadas].filter(([k, t]) => esperadas.has(k) && esperadas.get(k) !== t).length;
        if (!faltan && !sobran && !tipoMal) return { ok: true };
        const partes = [];
        if (faltan) partes.push(`${faltan === 1 ? "falta" : "faltan"} ${plural(faltan, "relación", "relaciones")}`);
        if (sobran) partes.push(`${sobran === 1 ? "sobra" : "sobran"} ${plural(sobran, "relación", "relaciones")}`);
        if (tipoMal) partes.push(`${plural(tipoMal, "relación tiene", "relaciones tienen")} el tipo equivocado`);
        const t = partes.join(", ");
        return { ok: false, mensaje: t[0].toUpperCase() + t.slice(1) + "." };
      },
      mostrarSolucion() { rels = [...fijas, ...paso.relaciones]; pintar(); }
    };
  }

  const TIPOS = { clasificar, seleccionar, ordenar, diagrama };
  window.PAPEL = {
    montar(div, paso) {
      const f = TIPOS[paso.tipo];
      if (!f) throw new Error("Paso sobre el papel desconocido: " + paso.tipo);
      return f(div, paso);
    },
    barajar
  };
})();
