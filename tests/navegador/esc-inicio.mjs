// Inicio: prólogo obligatorio → hoja de ruta (tablero holográfico), progreso, diálogos y modo prueba.
// Uso: node tests/navegador/cdp.mjs esc-inicio.mjs
export default async function (b) {
  const fallos = [];
  const comprobar = (nombre, ok, extra = "") => {
    b.log((ok ? "✅ " : "❌ ") + nombre + (ok || !extra ? "" : " — " + extra));
    if (!ok) fallos.push(nombre);
  };
  const avanzarPrologo = async () => {
    for (let i = 0; i < 20 && !(await b.eval("!document.querySelector('[data-continuar]').hidden")); i++) {
      await b.eval("document.querySelector('[data-prologo]').click()");
      await b.esperar(150);
    }
  };
  const progresoDe = obj => b.eval(`localStorage.setItem('sqlearning-progreso-v1', ${JSON.stringify(JSON.stringify(obj))})`);

  await b.tam(1366, 768);
  await b.movimiento();
  await b.ir("index.html");
  await b.eval("localStorage.clear(); sessionStorage.clear()");
  await b.ir("index.html");

  // 1. Prólogo
  comprobar("El prólogo aparece al entrar", await b.eval("!document.querySelector('[data-prologo]').hidden && document.querySelector('[data-tablero]').hidden"));
  comprobar("Pantalla de entrada: «Abrir el caso» y aún ninguna frase", await b.eval("!document.querySelector('[data-entrar]').hidden && document.querySelectorAll('.prologo-frase').length === 0"));
  await b.eval("document.querySelector('[data-entrar]').click()");
  comprobar("Al abrir el caso empieza por la primera frase y aún no hay botón", await b.eval("document.querySelector('[data-entrar]').hidden && document.querySelectorAll('.prologo-frase').length === 1 && document.querySelector('[data-continuar]').hidden"));
  await b.esperar(800);
  await b.foto("inicio-prologo-1");
  await avanzarPrologo();
  comprobar("Clic a clic se ven las 7 frases, el sello y «Continuar»", await b.eval("document.querySelectorAll('.prologo-frase').length === 7 && !document.querySelector('[data-sello]').hidden && !document.querySelector('[data-continuar]').hidden"));
  comprobar("Sello: CASO ABIERTO", (await b.eval("document.querySelector('[data-sello-texto]').textContent")) === "CASO ABIERTO");
  await b.esperar(900);
  await b.foto("inicio-prologo-fin");

  // 2. Hoja de ruta
  await b.eval("document.querySelector('[data-continuar]').click()");
  await b.esperar(500);
  comprobar("«Continuar» lleva a la hoja de ruta", await b.eval("document.querySelector('[data-prologo]').hidden && !document.querySelector('[data-tablero]').hidden"));
  comprobar("9 expedientes y una diligencia por nivel del índice", await b.eval("document.querySelectorAll('.exp').length === 9 && document.querySelectorAll('.nodo').length === CURSO.ETAPAS.reduce((s, e) => s + e.niveles.length, 0)"));
  comprobar("EXP.0 y EXP.1 abiertos; EXP.2–8 clasificados", await b.eval("document.querySelectorAll('.exp--abierto').length === 2 && document.querySelectorAll('.exp--clasificado').length === 7"));
  comprobar("Los clasificados no muestran títulos", await b.eval("![...document.querySelectorAll('.exp--clasificado h2')].some(h => /[a-z]/i.test(h.firstElementChild.textContent))"));
  comprobar("Primera diligencia de EXP.1 disponible, la segunda bloqueada", await b.eval("document.querySelector('[data-nodo=e1-01]').classList.contains('nodo--disponible') && document.querySelector('[data-nodo=e1-02]').classList.contains('nodo--bloqueado')"));
  comprobar("Hilos dibujados (8 entre las 9 diligencias de EXP.1)", (await b.eval("document.querySelectorAll('.exp')[1].querySelectorAll('.exp-hilos path').length")) === 8);
  // Expedientes plegables
  comprobar("Plegables: abiertos desplegados, clasificados plegados", await b.eval("!document.querySelector('#exp-cuerpo-1').hidden && document.querySelector('#exp-cuerpo-3').hidden && document.querySelector('[data-exp=\"3\"] .exp-flecha').getAttribute('aria-expanded') === 'false'"));
  await b.eval("document.querySelector('[data-exp=\"1\"] .exp-cabecera').click()");
  comprobar("Clic en la cabecera pliega el expediente 1", await b.eval("document.querySelector('#exp-cuerpo-1').hidden && document.querySelector('[data-exp=\"1\"] .exp-flecha').textContent === '▸'"));
  await b.ir("about:blank");
  await b.ir("index.html#ruta");
  await b.esperar(300);
  comprobar("El plegado se recuerda al volver", await b.eval("document.querySelector('#exp-cuerpo-1').hidden"));
  await b.eval("document.querySelector('[data-desplegar-todo]').click()");
  comprobar("«Desplegar todo» abre los 9", await b.eval("[...document.querySelectorAll('.exp-cuerpo')].every(c => !c.hidden)"));
  await b.eval("document.querySelector('[data-plegar-todo]').click()");
  comprobar("«Plegar todo» los cierra", await b.eval("[...document.querySelectorAll('.exp-cuerpo')].every(c => c.hidden)"));
  await b.eval("localStorage.removeItem('sqlearning-tablero-plegados')");
  await b.ir("about:blank");
  await b.ir("index.html#ruta");
  await b.esperar(300);

  comprobar("Cabecera: L1 Becario y 0 ◈", await b.eval("/L1/.test(document.querySelector('[data-autorizacion]').textContent) && /Becario/.test(document.querySelector('[data-autorizacion]').textContent) && /^0/.test(document.querySelector('[data-creditos]').textContent.trim())"));
  await b.foto("inicio-tablero");
  await b.eval("scrollTo(0, 900)");
  await b.esperar(300);
  await b.foto("inicio-tablero-clasificados");

  // 3. Diálogos
  await b.eval("document.querySelector('[data-abrir-credenciales]').click()");
  comprobar("Credenciales: 14 tarjetas, ninguna activa", await b.eval("document.querySelector('[data-dialogo-credenciales]').open && document.querySelectorAll('.credencial').length === 14 && !document.querySelector('.credencial--activa')"));
  await b.eval("document.querySelector('[data-dialogo-credenciales] [data-cerrar]').click()");
  await b.eval("document.querySelector('[data-abrir-expediente]').click()");
  comprobar("Expediente vacío al empezar", await b.eval("document.querySelector('[data-dialogo-expediente]').open && !!document.querySelector('.pista-vacia')"));
  await b.eval("document.querySelector('[data-dialogo-expediente] [data-cerrar]').click()");

  // 4. Con avance: «Anteriormente en el caso…»
  await progresoDe({
    creditos: 450, completados: { "e1-01": { bloques: 3, fecha: "2026-10-14" }, "e1-02": { bloques: 2, fecha: "2026-10-15" } },
    credenciales: ["acceso", "limpia"], expediente: [{ id: "inventario-imposible", titulo: "El inventario imposible", texto: "Un producto tiene stock -12." }],
    turnos: { dias: 2, ultimo: "2026-10-15" }, ultimo: "e1-02", ajustes: {}
  });
  await b.ir("index.html");
  comprobar("Con avance, el prólogo vuelve a salir", await b.eval("!document.querySelector('[data-prologo]').hidden"));
  await avanzarPrologo();
  comprobar("«Anteriormente en el caso…» con la pista y la última diligencia", await b.eval("/Anteriormente/.test(document.querySelector('.prologo-antes')?.textContent) && /inventario imposible/i.test(document.querySelector('.prologo-antes').textContent) && /1\\.2/.test(document.querySelector('.prologo-antes').textContent)"));
  comprobar("Sello: CASO EN CURSO", (await b.eval("document.querySelector('[data-sello-texto]').textContent")) === "CASO EN CURSO");
  await b.esperar(900);
  await b.foto("inicio-prologo-anteriormente");
  await b.eval("document.querySelector('[data-continuar]').click()");
  await b.esperar(400);
  comprobar("Autorización L2 con 450 ◈", await b.eval("/L2/.test(document.querySelector('[data-autorizacion]').textContent)"));
  comprobar("1.1 y 1.2 hechas con sus bloques; 1.3 disponible", await b.eval("document.querySelector('[data-nodo=e1-01]').classList.contains('nodo--hecho') && document.querySelectorAll('[data-nodo=e1-01] .b-lleno').length === 3 && document.querySelectorAll('[data-nodo=e1-02] .b-lleno').length === 2 && document.querySelector('[data-nodo=e1-03]').classList.contains('nodo--disponible')"));
  comprobar("Hilo encendido entre 1.1 y 1.2", (await b.eval("document.querySelectorAll('.exp')[1].querySelectorAll('.hilo--hecho').length")) === 1);
  await b.foto("inicio-tablero-avance");

  // 5. Modo prueba
  await b.eval("document.querySelector('[data-abrir-ajustes]').click()");
  await b.eval("document.querySelector('[data-prueba]').click()");
  comprobar("Modo prueba: todo desbloqueado y aviso visible", await b.eval("document.querySelectorAll('.exp--clasificado').length === 0 && !document.querySelector('[data-modo-prueba]').hidden"));
  comprobar("Modo prueba no toca el progreso real", await b.eval("JSON.parse(localStorage.getItem('sqlearning-progreso-v1')).creditos === 450"));
  await b.eval("document.querySelector('[data-abrir-ajustes]').click()");
  await b.eval("document.querySelector('[data-prueba]').click()");
  comprobar("Al salir del modo prueba vuelve el progreso real", await b.eval("/L2/.test(document.querySelector('[data-autorizacion]').textContent)"));

  // 6. Progreso corrupto
  await b.eval("localStorage.setItem('sqlearning-progreso-v1', '{roto')");
  await b.ir("index.html");
  await avanzarPrologo();
  comprobar("Con progreso corrupto arranca como nuevo", await b.eval("document.querySelector('[data-sello-texto]').textContent === 'CASO ABIERTO'"));

  // 6a. Volver de una lección (index.html#ruta) va directo a la hoja de ruta, sin prólogo
  await b.ir("index.html#ruta");
  await b.esperar(300);
  comprobar("index.html#ruta: hoja de ruta sin prólogo", await b.eval("document.querySelector('[data-prologo]').hidden && !document.querySelector('[data-tablero]').hidden"));
  await b.ir("leccion.html?id=e1-01");
  comprobar("Los enlaces de la lección vuelven a #ruta", await b.eval("[...document.querySelectorAll('a[href^=\"index.html\"]')].every(a => a.getAttribute('href') === 'index.html#ruta')"));
  await b.ir("about:blank");

  // 6b. Movimiento reducido: frase a frase igualmente, con un fundido sin desplazamiento
  await b.reducido();
  await b.ir("index.html");
  await b.eval("document.querySelector('[data-entrar]').click()");
  comprobar("Movimiento reducido: empieza por una sola frase, sin botón", await b.eval("document.querySelectorAll('.prologo-frase').length === 1 && document.querySelector('[data-continuar]').hidden"));
  const anim = await b.eval("(s => s.animationName + ' ' + s.animationDuration)(getComputedStyle(document.querySelector('.prologo-frase')))");
  comprobar("Movimiento reducido: la frase entra con un fundido (sin moverse)", anim === "fundido 0.8s", anim);
  await avanzarPrologo();
  comprobar("Movimiento reducido: clic a clic llegan las 7 frases y «Continuar»", await b.eval("document.querySelectorAll('.prologo-frase').length === 7 && !document.querySelector('[data-continuar]').hidden"));
  await b.movimiento();

  // 7. Tamaños y tema día
  await b.eval("document.querySelector('[data-continuar]').click()");
  for (const [w, h] of [[1920, 1080], [1280, 720], [1024, 768]]) {
    await b.tam(w, h);
    await b.esperar(400);
    comprobar(`Sin scroll horizontal a ${w}×${h}`, !(await b.eval("document.documentElement.scrollWidth > innerWidth")));
  }
  await b.eval("document.querySelector('[data-tema]').click()");
  await b.tam(1366, 768);
  await b.esperar(400);
  await b.foto("inicio-tablero-dia");

  // 8. Expediente final: clasificado sin el caso; al resolverlo, sello, noches y acceso desde la hoja de ruta
  await b.eval("localStorage.clear()");
  await b.ir("caso-cerrado.html");
  comprobar("Expediente final: sin el caso sale CLASIFICADO, sin destripar nada", await b.eval("(v => v('[data-clasificado]') && !v('[data-expediente]'))(s => document.querySelector(s).offsetHeight > 0)"));
  await progresoDe({ creditos: 9000, completados: { "e8-12": { bloques: 3, fecha: "2026-10-15" } }, credenciales: ["acceso", "exp-8"],
    expediente: [], turnos: { dias: 1, ultimo: "2026-10-15" }, ultimo: "e8-12", ajustes: {} });
  await b.ir("caso-cerrado.html");
  comprobar("Expediente final: «N pistas» enlaza con el expediente de pistas", await b.eval("document.querySelector('[data-tu] a')?.getAttribute('href') === 'index.html#expediente'"));
  comprobar("Expediente final: con el caso resuelto, 7 meses y las 75 noches", await b.eval("document.querySelector('[data-expediente]').offsetHeight > 0 && document.querySelector('[data-clasificado]').offsetHeight === 0 && document.querySelectorAll('.cc-mes').length === 7 && document.querySelectorAll('.cc-noche').length === 75"));
  for (const [w, h] of [[1366, 768], [390, 844]]) {
    await b.tam(w, h);
    await b.esperar(900);
    comprobar(`Expediente final sin scroll horizontal a ${w}×${h}`, !(await b.eval("document.documentElement.scrollWidth > innerWidth")));
    await b.foto(`caso-cerrado-${w}`);
  }
  await b.tam(1366, 768);
  await b.eval("document.querySelector('[data-tema]').click()");
  await b.esperar(400);
  await b.foto("caso-cerrado-dia");
  await b.ir("index.html");
  await avanzarPrologo();
  comprobar("Prólogo con el caso resuelto: sello CASO CERRADO", (await b.eval("document.querySelector('[data-sello-texto]').textContent")) === "CASO CERRADO");
  comprobar("Prólogo con el caso resuelto: botón «Ver el expediente final»", await b.eval("document.querySelector('[data-final]').offsetHeight > 0"));
  await b.eval("document.querySelector('[data-continuar]').click()");
  await b.esperar(400);
  await b.eval("(e => e.closest('.exp--plegado') || e.querySelector('.exp-flecha').click())(document.querySelector('.exp[data-exp=\"8\"]'))");
  await b.esperar(300);
  comprobar("Hoja de ruta: enlace al expediente final visible con EXP.8 plegado", await b.eval("(a => a?.getAttribute('href') === 'caso-cerrado.html' && a.offsetHeight > 0)(document.querySelector('.exp .exp-final')) && !!document.querySelector('.exp[data-exp=\"8\"].exp--plegado')"));

  await b.ir("index.html#expediente");
  await b.esperar(600);
  comprobar("index.html#expediente: hoja de ruta con el expediente de pistas abierto", await b.eval("document.querySelector('[data-prologo]').hidden && document.querySelector('[data-dialogo-expediente]').open"));
  comprobar("Expediente de pistas con el caso cerrado: sin la silueta del Fantasma", await b.eval("document.querySelector('[data-fantasma]').hidden"));

  b.log(fallos.length ? `\n❌ ${fallos.length} comprobaciones fallidas` : "\n✅ Inicio: todo correcto");
}
