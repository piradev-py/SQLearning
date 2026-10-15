/* ============================================================
   SQLearning · Pestaña «Gráfico»
   GRAFICO.analizar(r) → { ok, forma, ... } o { ok: false, motivo }
   GRAFICO.pintar(div, r) → dibuja el resultado como barras o líneas
   La primera columna son las etiquetas; las columnas numéricas, los valores.
   - Etiquetas tipo mes ('2026-08') o fecha → líneas; si no → barras.
   - Tres columnas con etiquetas repetidas (mes, tienda_id, total) → una serie
     por cada valor de la segunda columna.
   - Varias medidas (pedidos y facturación) → un panel por medida, cada uno con
     su escala (nunca dos ejes en el mismo gráfico).
   Los valores siempre están también en la pestaña Resultado (tabla).
   ============================================================ */
(function () {
  const NUMERICOS = new Set(["integer", "bigint", "smallint", "numeric", "real", "double precision"]);
  const FECHAS = new Set(["date", "timestamp", "timestamp without time zone", "timestamp with time zone", "timestamptz"]);
  const MAX_SERIES = 5, MAX_PANELES = 4, MAX_BARRAS = 40, MAX_PUNTOS = 120;
  const SVG = "http://www.w3.org/2000/svg";

  // Miles con espacio (que no se parte), como en el texto de las lecciones («1 527»), también con 4 cifras
  const fmtEs = new Intl.NumberFormat("es", { maximumFractionDigits: 2, useGrouping: false });
  const ESPACIO_MILES = String.fromCharCode(0xa0);
  // Agrupado a mano: con «es», Intl no separa los números de 4 cifras
  const fmt = { format: v => fmtEs.format(v).replace(/[0-9]+/, ent => ent.replace(/(?=(?:[0-9]{3})+$)(?!^)/g, ESPACIO_MILES)) };
  const fmtCorto = new Intl.NumberFormat("es", { notation: "compact", maximumFractionDigits: 1 });
  const numero = v => (v === null || v === undefined || v === "" ? null : Number(v));
  const etiqueta = v => (v === null || v === undefined ? "NULL" : v instanceof Date ? v.toISOString().slice(0, 10) : String(v));
  const pareceMes = s => /^\d{4}-\d{2}(-\d{2})?([ T].*)?$/.test(s);

  // --- Análisis: ¿se puede dibujar? ¿cómo? ---------------------------------
  // Además de la forma, descarta lo que no se puede dibujar con sentido: todo NULL, o valores
  // gigantes o infinitos (1e308 dejaba sin fin el bucle de marcas)
  const MAX_VALOR = 1e15;
  function analizar(r) {
    const a = analizarForma(r);
    if (!a.ok) return a;
    for (const panel of a.paneles) {
      const vals = panel.series.flatMap(s => s.valores).filter(v => v !== null);
      if (!vals.length) {
        return { ok: false, motivo: `Todos los valores de «${panel.medida}» son NULL: no hay nada que dibujar. (Un \`SUM\` sin filas da NULL, no 0.)` };
      }
      if (vals.some(v => !Number.isFinite(v) || Math.abs(v) > MAX_VALOR || (v !== 0 && Math.abs(v) < 1e-9))) {
        return { ok: false, motivo: `Hay valores de «${panel.medida}» demasiado grandes, diminutos o infinitos para dibujarlos. Míralos en la pestaña **Resultado**.` };
      }
    }
    return a;
  }
  function analizarForma(r) {
    const no = motivo => ({ ok: false, motivo });
    if (!r || !r.columnas || !r.columnas.length) return no("Ejecuta una consulta que devuelva una tabla para verla como gráfico.");
    if (!r.filas.length) return no("La consulta no devuelve filas: no hay nada que dibujar.");
    if (r.columnas.length < 2) {
      return no("Para dibujar hacen falta **dos columnas**: la primera con las etiquetas y otra con números. Por ejemplo: `SELECT categoria, COUNT(*) FROM productos GROUP BY categoria;`");
    }
    const num = i => NUMERICOS.has(r.tipos[i]);
    // Para los avisos: sin comillas invertidas (rompían el formato `código`) y sin textos kilométricos
    const c = r.columnas.map(x => x.split("`").join("'"));
    const corto = v => { const t = etiqueta(v).split("`").join("'"); return t.length > 40 ? t.slice(0, 40) + "…" : t; };
    const etiquetas0 = r.filas.map(f => etiqueta(f[0]));
    const repetidas = new Set(etiquetas0).size < etiquetas0.length;
    const temporal = FECHAS.has(r.tipos[0]) || etiquetas0.every(pareceMes);
    const forma = temporal ? "lineas" : "barras";
    const ordenar = temporal ? (a, b) => (a < b ? -1 : a > b ? 1 : 0) : null;

    // Tres columnas con la primera repetida: (x, grupo, valor) → una serie por grupo
    if (repetidas && r.columnas.length === 3 && num(2)) {
      const xs = [...new Set(etiquetas0)];
      if (ordenar) xs.sort(ordenar);
      const grupos = [...new Set(r.filas.map(f => etiqueta(f[1])))]
        .sort((a, b) => a.localeCompare(b, "es", { numeric: true }));
      if (grupos.length > MAX_SERIES) {
        return no(`La columna \`${c[1]}\` tiene ${grupos.length} valores distintos y el gráfico dibuja como mucho ${MAX_SERIES} series. Quédate con menos usando \`WHERE\`.`);
      }
      const valores = grupos.map(() => xs.map(() => null));
      for (const f of r.filas) {
        const g = grupos.indexOf(etiqueta(f[1])), x = xs.indexOf(etiqueta(f[0]));
        if (valores[g][x] !== null) {
          return no(`Hay dos filas con \`${c[0]}\` = ${corto(f[0])} y \`${c[1]}\` = ${corto(f[1])}. Agrupa por las dos columnas: \`GROUP BY ${c[0]}, ${c[1]}\`.`);
        }
        valores[g][x] = numero(f[2]);
      }
      const limite = forma === "barras" ? MAX_BARRAS : MAX_PUNTOS;
      if (xs.length > limite) return demasiadas(xs.length, limite, c[0]);
      return {
        ok: true, forma, x: r.columnas[0], etiquetas: xs, ordenado: !!ordenar,
        paneles: [{ titulo: `${r.columnas[2]} por ${r.columnas[0]} y ${r.columnas[1]}`, medida: r.columnas[2],
          series: grupos.map((g, i) => ({ nombre: num(1) ? `${r.columnas[1]} ${g}` : g, valores: valores[i], color: i })) }]
      };
    }

    if (repetidas) {
      return no(`La primera columna (\`${c[0]}\`) repite valores, así que cada barra no sería un único grupo. Resume con \`GROUP BY ${c[0]}\` para tener una fila por grupo.`);
    }
    const medidas = r.columnas.map((c, i) => i).filter(i => i > 0 && num(i));
    if (!medidas.length) {
      return no(`Ninguna columna después de \`${c[0]}\` es numérica. El gráfico necesita la primera columna con las etiquetas y, detrás, alguna con números (un \`COUNT(*)\`, un \`SUM(...)\`…).`);
    }
    const limite = forma === "barras" ? MAX_BARRAS : MAX_PUNTOS;
    if (r.filas.length > limite) return demasiadas(r.filas.length, limite, c[0]);

    let filas = r.filas;
    if (ordenar) filas = [...filas].sort((a, b) => ordenar(etiqueta(a[0]), etiqueta(b[0])));
    const usadas = medidas.slice(0, MAX_PANELES);
    return {
      ok: true, forma, x: r.columnas[0], etiquetas: filas.map(f => etiqueta(f[0])),
      ordenado: !!ordenar && filas.some((f, i) => f !== r.filas[i]),
      nota: medidas.length > MAX_PANELES ? `Se dibujan las ${MAX_PANELES} primeras columnas numéricas.` : "",
      // Cada medida en su panel: escalas distintas (pedidos ≈ 1 000, facturación ≈ 100 000) no comparten eje
      paneles: usadas.map(i => ({
        titulo: `${r.columnas[i]} por ${r.columnas[0]}`, medida: r.columnas[i],
        series: [{ nombre: r.columnas[i], valores: filas.map(f => numero(f[i])), color: 0 }]
      }))
    };
  }
  function demasiadas(n, limite, col) {
    return { ok: false, motivo: `Hay ${fmt.format(n)} valores de \`${col}\` y el gráfico dibuja como mucho ${limite}. Resume con \`GROUP BY\` o quédate con los primeros con \`ORDER BY ... LIMIT\`.` };
  }

  // --- Utilidades de dibujo ---------------------------------------------
  function el(nombre, attrs = {}, padre) {
    const n = document.createElementNS(SVG, nombre);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(n);
    return n;
  }
  function texto(padre, x, y, contenido, attrs = {}) {
    const t = el("text", { x, y, ...attrs }, padre);
    t.textContent = contenido;
    return t;
  }
  let lienzo;
  function ancho(s, px = 12) {
    lienzo = lienzo || document.createElement("canvas").getContext("2d");
    lienzo.font = `${px}px "Segoe UI", system-ui, sans-serif`;
    return lienzo.measureText(s).width;
  }
  // Corte por bisección y con tope de letras: medir letra a letra un texto de 20 000 congelaba la página
  function recortar(s, max, px = 12) {
    if (s.length <= 200 && ancho(s, px) <= max) return s;
    s = s.slice(0, 200);
    let bien = 0, mal = s.length;
    while (mal - bien > 1) {
      const medio = (bien + mal) >> 1;
      if (ancho(s.slice(0, medio) + "…", px) <= max) bien = medio; else mal = medio;
    }
    return s.slice(0, Math.max(1, bien)) + "…";
  }
  // Escala «bonita»: 0 siempre dentro, marcas redondas (1, 2, 2,5 o 5 × 10^n)
  // Con valores enteros (conteos) las marcas también son enteras: nada de «2,5 pedidos»
  function escala(valores, marcas = 5) {
    let min = Math.min(0, ...valores), max = Math.max(0, ...valores);
    if (min === max) max = 1;
    const enteros = valores.every(Number.isInteger);
    const paso0 = (max - min) / marcas, mag = 10 ** Math.floor(Math.log10(paso0));
    const paso = [1, 2, 2.5, 5, 10].map(m => m * mag).find(p => p >= paso0 && (!enteros || Number.isInteger(p))) || Math.ceil(paso0);
    const lo = Math.floor(min / paso) * paso, hi = Math.ceil(max / paso) * paso;
    const ticks = [];
    for (let v = lo; v <= hi + paso / 2 && ticks.length < 50; v += paso) ticks.push(Math.round(v / paso) * paso);
    return { lo, hi, ticks };
  }
  const tick = v => (Math.abs(v) >= 1000 ? fmtCorto.format(v) : fmt.format(v));
  // Rectángulo con las esquinas del extremo redondeadas (4 px) y el de la base recto
  function barraH(x0, x1, y, alto, r = 4) {
    const izq = Math.min(x0, x1), der = Math.max(x0, x1), w = der - izq;
    r = Math.min(r, w, alto / 2);
    if (x1 >= x0) return `M${izq},${y}H${der - r}Q${der},${y} ${der},${y + r}V${y + alto - r}Q${der},${y + alto} ${der - r},${y + alto}H${izq}Z`;
    return `M${der},${y}H${izq + r}Q${izq},${y} ${izq},${y + r}V${y + alto - r}Q${izq},${y + alto} ${izq + r},${y + alto}H${der}Z`;
  }

  // --- Tooltip (con textContent: los nombres vienen de la consulta) -------
  function crearTooltip(marco) {
    const t = document.createElement("div");
    t.className = "gr-tooltip";
    t.hidden = true;
    marco.appendChild(t);
    return {
      mostrar(titulo, filas, x, y) {
        t.replaceChildren();
        const cab = document.createElement("div");
        cab.className = "gr-tooltip-titulo";
        cab.textContent = titulo.length > 160 ? titulo.slice(0, 160) + "…" : titulo;
        t.appendChild(cab);
        for (const f of filas) {
          const fila = document.createElement("div");
          fila.className = "gr-tooltip-fila";
          if (f.color !== undefined) {
            const k = document.createElement("span");
            k.className = `gr-clave gr-c${f.color}`;
            fila.appendChild(k);
          }
          const v = document.createElement("strong");
          v.textContent = f.valor === null ? "NULL" : fmt.format(f.valor);
          const n = document.createElement("span");
          n.textContent = f.nombre;
          fila.append(v, n);
          t.appendChild(fila);
        }
        t.hidden = false;
        const mw = marco.clientWidth, tw = t.offsetWidth;
        t.style.left = Math.max(4, Math.min(x + 14, mw - tw - 4)) + "px";
        t.style.top = Math.max(4, y - t.offsetHeight - 10) + "px";
      },
      ocultar() { t.hidden = true; }
    };
  }

  // --- Barras horizontales (agrupadas si hay varias series) --------------
  function barras(marco, a, panel, anchoTotal) {
    const ns = panel.series.length, n = a.etiquetas.length;
    const grosor = ns === 1 ? 22 : Math.max(8, Math.min(16, Math.floor(44 / ns)));
    const banda = ns * grosor + (ns - 1) * 2 + 14;
    const izqEtiq = Math.min(Math.max(...a.etiquetas.map(e => ancho(e))) + 12, anchoTotal * 0.32);
    const valores = panel.series.flatMap(s => s.valores).filter(v => v !== null);
    const e = escala(valores);
    const etiquetaValor = ns === 1;
    const derecha = etiquetaValor ? Math.max(...valores.map(v => ancho(fmt.format(v)))) + 14 : 16;
    const izqNeg = e.lo < 0 && etiquetaValor ? Math.max(...valores.filter(v => v < 0).map(v => ancho(fmt.format(v))), 0) + 6 : 0;
    const x0 = izqEtiq + izqNeg, ancho0 = Math.max(60, anchoTotal - x0 - derecha);
    const sx = v => x0 + ((v - e.lo) / (e.hi - e.lo)) * ancho0;
    const arriba = 6, alto = arriba + n * banda + 26;

    const svg = el("svg", { width: anchoTotal, height: alto, viewBox: `0 0 ${anchoTotal} ${alto}`, class: "gr-svg" });
    const fondo = el("g", {}, svg), marcas = el("g", {}, svg), textos = el("g", {}, svg);
    for (const t of e.ticks) {
      const x = sx(t);
      el("line", { x1: x, x2: x, y1: arriba, y2: arriba + n * banda, class: t === 0 ? "gr-base" : "gr-rejilla" }, fondo);
      texto(textos, x, alto - 8, tick(t), { class: "gr-eje", "text-anchor": "middle" });
    }
    const zonas = [];
    a.etiquetas.forEach((et, i) => {
      const y0 = arriba + i * banda + 7;
      texto(textos, izqEtiq - 10 + 0, y0 + (banda - 14) / 2 + 4, recortar(et, izqEtiq - 12), { class: "gr-etiqueta", "text-anchor": "end" });
      panel.series.forEach((s, j) => {
        const v = s.valores[i];
        if (v === null) return;
        const y = y0 + j * (grosor + 2);
        el("path", { d: barraH(sx(0), sx(v), y, grosor), class: `gr-barra gr-c${s.color}` }, marcas);
        if (etiquetaValor) {
          texto(textos, v >= 0 ? sx(v) + 6 : sx(v) - 6, y + grosor / 2 + 4, fmt.format(v),
            { class: "gr-valor", "text-anchor": v >= 0 ? "start" : "end" });
        }
      });
      zonas.push({ y: y0 - 7, i });
    });
    marco.appendChild(svg);

    // Zonas de hover: toda la banda de la categoría (mucho mayor que la barra)
    const tooltip = crearTooltip(marco);
    let activa = -1;
    const resaltar = i => {
      activa = i;
      svg.querySelectorAll(".gr-zona").forEach((z, k) => z.classList.toggle("gr-activa", k === i));
    };
    const enseñar = (i, px, py) => {
      resaltar(i);
      tooltip.mostrar(a.etiquetas[i], panel.series.map(s => ({ nombre: s.nombre, valor: s.valores[i], color: ns > 1 ? s.color : undefined })), px, py);
    };
    zonas.forEach(({ y, i }) => {
      const z = el("rect", { x: 0, y, width: anchoTotal, height: banda, class: "gr-zona" }, svg);
      svg.insertBefore(z, marcas);
      z.addEventListener("pointermove", ev => {
        const caja = marco.getBoundingClientRect();
        enseñar(i, ev.clientX - caja.left, ev.clientY - caja.top);
      });
    });
    svg.addEventListener("pointerleave", () => { tooltip.ocultar(); resaltar(-1); });
    return {
      teclado(ev) {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[ev.key];
        let i = ev.key === "Home" ? 0 : ev.key === "End" ? n - 1 : d === undefined ? null : Math.max(0, Math.min(n - 1, (activa < 0 ? (d > 0 ? -1 : n) : activa) + d));
        if (i === null) return false;
        enseñar(i, sx(Math.max(0, ...panel.series.map(s => s.valores[i] ?? 0))), zonas[i].y + 4);
        return true;
      },
      salir() { tooltip.ocultar(); resaltar(-1); }
    };
  }

  // --- Líneas (meses o fechas en el eje horizontal) ----------------------
  function lineas(marco, a, panel, anchoTotal) {
    const n = a.etiquetas.length, ns = panel.series.length;
    const valores = panel.series.flatMap(s => s.valores).filter(v => v !== null);
    const e = escala(valores);
    const izq = Math.max(...e.ticks.map(t => ancho(tick(t)))) + 12;
    const finales = ns === 1 ? ancho(fmt.format(valores[valores.length - 1] ?? 0)) + 14 : 14;
    const der = Math.max(18, finales), arriba = 12, altoPlot = 220, alto = arriba + altoPlot + 30;
    const anchoPlot = Math.max(80, anchoTotal - izq - der);
    const sx = i => izq + (n === 1 ? anchoPlot / 2 : (i / (n - 1)) * anchoPlot);
    const sy = v => arriba + altoPlot - ((v - e.lo) / (e.hi - e.lo)) * altoPlot;

    const svg = el("svg", { width: anchoTotal, height: alto, viewBox: `0 0 ${anchoTotal} ${alto}`, class: "gr-svg" });
    const fondo = el("g", {}, svg), marcas = el("g", {}, svg), textos = el("g", {}, svg);
    for (const t of e.ticks) {
      el("line", { x1: izq, x2: izq + anchoPlot, y1: sy(t), y2: sy(t), class: t === 0 ? "gr-base" : "gr-rejilla" }, fondo);
      texto(textos, izq - 8, sy(t) + 4, tick(t), { class: "gr-eje", "text-anchor": "end" });
    }
    // Etiquetas del eje X: tantas como quepan sin pisarse
    // (recortadas a 140 px; la primera y la última se anclan hacia dentro para no salirse por los lados)
    const visibles = a.etiquetas.map(et => recortar(et, 140, 11));
    const anchoEtiq = Math.max(...visibles.map(et => ancho(et, 11))) + 12;
    const cada = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(anchoPlot / anchoEtiq))));
    visibles.forEach((et, i) => {
      if (i % cada && i !== n - 1) return;
      if (i === n - 1 && i % cada && sx(i) - sx(i - (i % cada)) < anchoEtiq) return;
      const ancla = n > 1 && i === 0 && sx(0) - ancho(et, 11) / 2 < 0 ? "start"
        : n > 1 && i === n - 1 && sx(i) + ancho(et, 11) / 2 > anchoTotal ? "end" : "middle";
      texto(textos, sx(i), alto - 10, et, { class: "gr-eje", "text-anchor": ancla });
    });
    const conPuntos = n <= 40;
    panel.series.forEach(s => {
      // Un NULL corta la línea (hueco), no la baja a cero
      let d = "", dentro = false;
      s.valores.forEach((v, i) => {
        if (v === null) { dentro = false; return; }
        d += `${dentro ? "L" : "M"}${sx(i)},${sy(v)}`;
        dentro = true;
      });
      el("path", { d, class: `gr-linea gr-c${s.color}` }, marcas);
      if (conPuntos) s.valores.forEach((v, i) => { if (v !== null) el("circle", { cx: sx(i), cy: sy(v), r: 4, class: `gr-punto gr-c${s.color}` }, marcas); });
      if (ns === 1) {
        const ult = s.valores.map((v, i) => [v, i]).filter(([v]) => v !== null).pop();
        if (ult) texto(textos, sx(ult[1]) + 8, sy(ult[0]) + 4, fmt.format(ult[0]), { class: "gr-valor" });
      }
    });
    marco.appendChild(svg);

    // Cruz que busca el mes más cercano (no hace falta apuntar a la línea)
    const guia = el("line", { y1: arriba, y2: arriba + altoPlot, class: "gr-guia", visibility: "hidden" }, svg);
    const activos = el("g", {}, svg);
    const tooltip = crearTooltip(marco);
    let activa = -1;
    const enseñar = i => {
      activa = i;
      guia.setAttribute("x1", sx(i)); guia.setAttribute("x2", sx(i)); guia.setAttribute("visibility", "visible");
      activos.replaceChildren();
      panel.series.forEach(s => { if (s.valores[i] !== null) el("circle", { cx: sx(i), cy: sy(s.valores[i]), r: 5, class: `gr-punto gr-c${s.color}` }, activos); });
      const ys = panel.series.map(s => s.valores[i]).filter(v => v !== null);
      tooltip.mostrar(a.etiquetas[i], panel.series.map(s => ({ nombre: s.nombre, valor: s.valores[i], color: ns > 1 ? s.color : undefined })),
        sx(i), ys.length ? sy(Math.max(...ys)) : arriba);
    };
    const salir = () => { activa = -1; guia.setAttribute("visibility", "hidden"); activos.replaceChildren(); tooltip.ocultar(); };
    const zona = el("rect", { x: izq - 10, y: 0, width: anchoPlot + 20, height: arriba + altoPlot, class: "gr-zona-lineas" }, svg);
    zona.addEventListener("pointermove", ev => {
      const caja = svg.getBoundingClientRect();
      const x = ev.clientX - caja.left;
      enseñar(n === 1 ? 0 : Math.max(0, Math.min(n - 1, Math.round(((x - izq) / anchoPlot) * (n - 1)))));
    });
    zona.addEventListener("pointerleave", salir);
    return {
      teclado(ev) {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
        const i = ev.key === "Home" ? 0 : ev.key === "End" ? n - 1 : d === undefined ? null : Math.max(0, Math.min(n - 1, (activa < 0 ? (d > 0 ? -1 : n) : activa) + d));
        if (i === null) return false;
        enseñar(i);
        return true;
      },
      salir
    };
  }

  // --- Pintar -----------------------------------------------------------
  function pintar(div, r) {
    const a = analizar(r);
    // Al repintar (p. ej. al cambiar el ancho) el foco no se pierde: vuelve al panel en el que estaba
    const marcos = [...div.querySelectorAll(".gr-marco")];
    const conFoco = marcos.indexOf(document.activeElement);
    div.replaceChildren();
    if (!a.ok) {
      RESULTADO.aviso(div, "📊 " + a.motivo);
      return a;
    }
    const raiz = document.createElement("div");
    raiz.className = "gr";
    div.appendChild(raiz);
    const anchoTotal = Math.max(260, Math.floor(div.clientWidth || 600) - 2);
    const controles = [];
    for (const panel of a.paneles) {
      const tarjeta = document.createElement("section");
      tarjeta.className = "gr-panel";
      const h = document.createElement("h3");
      h.className = "gr-titulo";
      h.textContent = panel.titulo;
      tarjeta.appendChild(h);
      if (panel.series.length > 1) {
        const ley = document.createElement("ul");
        ley.className = "gr-leyenda";
        for (const s of panel.series) {
          const li = document.createElement("li");
          const k = document.createElement("span");
          k.className = `gr-clave gr-clave-${a.forma} gr-c${s.color}`;
          li.append(k, document.createTextNode(s.nombre));
          ley.appendChild(li);
        }
        tarjeta.appendChild(ley);
      }
      const marco = document.createElement("div");
      marco.className = "gr-marco";
      marco.tabIndex = 0;
      marco.setAttribute("role", "img");
      marco.setAttribute("aria-label", resumen(a, panel));
      tarjeta.appendChild(marco);
      raiz.appendChild(tarjeta);
      const c = (a.forma === "barras" ? barras : lineas)(marco, a, panel, anchoTotal - 26);
      marco.addEventListener("keydown", ev => { if (c.teclado(ev)) ev.preventDefault(); });
      marco.addEventListener("blur", c.salir);
      controles.push(c);
    }
    const notas = [a.nota, a.ordenado ? `Ordenado por \`${a.x}\` de más antiguo a más reciente.` : "",
      "Los valores exactos están en la pestaña **Resultado**."].filter(Boolean);
    const p = document.createElement("p");
    p.className = "r-nota";
    p.innerHTML = RESULTADO.md(notas.join(" "));
    raiz.appendChild(p);
    if (conFoco >= 0) div.querySelectorAll(".gr-marco")[Math.min(conFoco, a.paneles.length - 1)]?.focus({ preventScroll: true });
    return a;
  }
  function resumen(a, panel) {
    const tipo = a.forma === "barras" ? "Gráfico de barras" : "Gráfico de líneas";
    const partes = panel.series.map(s => `${s.nombre}: ` + a.etiquetas.map((e, i) => `${e.slice(0, 60)} ${s.valores[i] === null ? "NULL" : fmt.format(s.valores[i])}`).slice(0, 12).join(", ") + (a.etiquetas.length > 12 ? "…" : ""));
    return `${tipo}: ${panel.titulo}. ${partes.join(". ")}. Usa las flechas para recorrerlo.`;
  }

  window.GRAFICO = { analizar, pintar };
})();
