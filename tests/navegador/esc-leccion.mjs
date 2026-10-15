// Recorre e1-01 (SQL) y e0-01 (sobre el papel) como un alumno: errores, pistas, reto, pantalla final y progreso.
// Uso: node tests/navegador/cdp.mjs esc-leccion.mjs
export default async function (b) {
  const fallos = [];
  const comprobar = (nombre, ok, extra = "") => {
    b.log((ok ? "✅ " : "❌ ") + nombre + (ok || !extra ? "" : " — " + extra));
    if (!ok) fallos.push(nombre);
  };
  const estado = () => b.eval("LECCION.estado()");
  const escribir = sql => b.eval(`(() => { const e = LECCION.editor(); e.poner(${JSON.stringify(sql)}); })()`);
  const clic = sel => b.eval(`document.querySelector(${JSON.stringify(sel)}).click()`);
  const feedback = () => b.eval("document.querySelector('[data-feedback]')?.textContent.trim() || ''");
  const siguiente = async () => { await clic("[data-siguiente]"); await b.esperar(300); };

  await b.tam(1366, 768);
  await b.movimiento();
  await b.ir("index.html");
  await b.eval("localStorage.clear(); sessionStorage.clear()");

  // --- Bloqueos ---
  await b.ir("leccion.html?id=e1-02");
  await b.hasta("/bloqueada/.test(document.querySelector('[data-cargando]').textContent)", 5000);
  comprobar("Una diligencia bloqueada no se abre", await b.eval("/bloqueada/.test(document.querySelector('[data-cargando]').textContent)"));
  await b.ir("leccion.html?id=zzz");
  comprobar("Un id inexistente avisa", await b.eval("/no existe/.test(document.querySelector('[data-cargando]').textContent)"));

  // --- e1-01 ---
  await b.ir("leccion.html?id=e1-01");
  await b.hasta("document.querySelector('[data-cargando]').hidden", 60000);
  comprobar("e1-01 carga con PostgreSQL", (await estado()).total === 7);
  comprobar("Paso 1: ticket de Lucía", await b.eval("/Lucía Mora/.test(document.querySelector('[data-paso]').textContent)"));
  await b.foto("leccion-ticket");
  await siguiente();
  await b.hasta("document.querySelectorAll('[data-vista=resultado] tbody tr').length === 5", 8000);
  comprobar("Paso 2: el ejemplo se ejecuta solo (5 tiendas)", (await b.eval("document.querySelectorAll('[data-vista=resultado] tbody tr').length")) === 5);
  await b.foto("leccion-explicacion");
  await siguiente();
  await siguiente();

  // Ejercicio: fallos y acierto
  comprobar("Paso 4: ejercicio con «Siguiente» desactivado", await b.eval("document.querySelector('[data-siguiente]').disabled && !document.querySelector('[data-revisar]').hidden"));
  await escribir("SELECT * FROM productos");
  await clic("[data-revisar]");
  await b.esperar(600);
  comprobar("Sin ; → avisa del punto y coma", /punto y coma/.test(await feedback()), await feedback());
  await escribir("SELECT * FROM producto;");
  await clic("[data-revisar]");
  await b.esperar(600);
  comprobar("Tabla mal escrita → sugiere «productos»", /productos/.test(await feedback()), await feedback());
  await escribir("SELECT nombre FROM productos;");
  await clic("[data-revisar]");
  await b.esperar(600);
  comprobar("Faltan columnas → lo dice", /faltan las columnas/i.test(await feedback()), await feedback());
  await escribir("select * from productos;");
  await clic("[data-revisar]");
  await b.esperar(600);
  comprobar("Correcta en minúsculas → ¡Correcto! y se puede seguir", /Correcto/.test(await feedback()) && !(await b.eval("document.querySelector('[data-siguiente]').disabled")));
  await b.foto("leccion-ejercicio");
  await siguiente();

  // Predicción
  comprobar("Paso 5: predicción con la consulta en el editor y sin ejecutar", await b.eval("/FROM tiendas/.test(LECCION.editor().valor()) && !document.querySelector('[data-vista=resultado] tbody')"));
  await clic("[data-opcion='0']");
  comprobar("Opción mala → prueba otra vez", /otra vez/.test(await feedback()));
  await clic("[data-opcion='1']");
  await b.hasta("document.querySelectorAll('[data-vista=resultado] tbody tr').length === 5", 5000);
  comprobar("Opción buena → se ejecuta la consulta", (await b.eval("document.querySelectorAll('[data-vista=resultado] tbody tr').length")) === 5);
  await siguiente();
  await clic("[data-opcion='1']");
  await siguiente();

  // Reto con una pista
  comprobar("Paso 7: reto con 3 comprobaciones", (await b.eval("document.querySelectorAll('[data-comprobaciones] li').length")) === 3);
  await clic("[data-pista]");
  comprobar("Pista visible y contada", (await estado()).ayudas.pistas === 1);
  await escribir("SELECT nombre, email FROM empleados;");
  await clic("[data-revisar]");
  await b.esperar(700);
  comprobar("Reto a medias: 22 filas ✔, columnas ✘", await b.eval("[...document.querySelectorAll('[data-comprobaciones] li')].map(l => l.className).join() === 'ok,mal,ok'"));
  await b.foto("leccion-reto");
  await escribir("SELECT * FROM empleados;");
  await clic("[data-revisar]");
  await b.hasta("document.querySelector('[data-final]').open", 5000);
  comprobar("Reto superado → pantalla final", await b.eval("document.querySelector('[data-final]').open"));
  comprobar("2 bloques (usó pista) y créditos 20 + 2×10 = 40", await b.eval("document.querySelectorAll('.lec-final-bloques .b-lleno').length === 2 && /\\+40 ◈/.test(document.querySelector('[data-final-cuerpo]').textContent)"));
  comprobar("Credencial «Acceso concedido»", await b.eval("/Acceso concedido/.test(document.querySelector('[data-final-cuerpo]').textContent)"));
  await b.foto("leccion-final");
  const prog = await b.eval("JSON.parse(localStorage.getItem('sqlearning-progreso-v1'))");
  comprobar("Progreso guardado: e1-01 con 2 bloques y 40 ◈", prog?.completados?.["e1-01"]?.bloques === 2 && prog.creditos === 40, JSON.stringify(prog));

  // Repetir sin pistas mejora a 3 bloques (+10)
  await b.ir("leccion.html?id=e1-01");
  await b.hasta("document.querySelector('[data-cargando]').hidden", 60000);
  for (let i = 0; i < 6; i++) await b.eval("(() => { const s = LECCION.estado(); if (!s.superados.includes(s.actual)) { const p = document.querySelector('[data-opcion=\"1\"]'); if (p) p.click(); } })()"), await b.esperar(150), await (async () => {
    // el ejercicio (paso 4) hay que resolverlo
    const s = await estado();
    if (s.actual === 3 && !s.superados.includes(3)) { await escribir("SELECT * FROM productos;"); await clic("[data-revisar]"); await b.esperar(600); }
  })(), await siguiente();
  await escribir("SELECT * FROM empleados;");
  await clic("[data-revisar]");
  await b.hasta("document.querySelector('[data-final]').open", 5000);
  comprobar("Repetir sin pistas: 3 bloques y +10 ◈", await b.eval("document.querySelectorAll('.lec-final-bloques .b-lleno').length === 3 && /\\+10 ◈/.test(document.querySelector('[data-final-cuerpo]').textContent)"));

  // --- e0-01 (sobre el papel) ---
  await b.ir("leccion.html?id=e0-01");
  await b.hasta("document.querySelector('[data-cargando]').hidden", 20000);
  comprobar("e0-01 carga sin PostgreSQL (mesa)", await b.eval("document.querySelector('[data-zona-sql]').hidden && !document.querySelector('[data-zona-mesa]').hidden"));
  await siguiente(); await siguiente();
  comprobar("Paso 3: clasificar con 8 fichas", (await b.eval("document.querySelectorAll('[data-ficha]').length")) === 8);
  await clic("[data-revisar-papel]");
  comprobar("Sin colocar → avisa", /por colocar/.test(await feedback()));
  // Colocar todas en «Texto» (mal) usando clics
  for (let k = 0; k < 8; k++) {
    await b.eval("document.querySelector('.papel-monton [data-ficha]').click()");
    await b.eval("document.querySelector('section[data-zona=\"Texto\"]').click()");
  }
  await clic("[data-revisar-papel]");
  comprobar("Todas en Texto → 5 en el grupo equivocado", /5 fichas están en el grupo equivocado/.test(await feedback()), await feedback());
  await b.foto("leccion-clasificar");
  await clic("[data-pista]"); await clic("[data-pista]"); await clic("[data-ver-solucion]");
  await clic("[data-revisar-papel]");
  comprobar("Con la solución → correcto y se puede seguir", /Correcto/.test(await feedback()) && !(await b.eval("document.querySelector('[data-siguiente]').disabled")));
  await siguiente();
  await clic("[data-opcion='0']");
  await siguiente();
  comprobar("Reto sobre el papel", await b.eval("/Reto/.test(document.querySelector('.lec-etiqueta').textContent)"));
  await b.eval("(() => { for (let k = 0; k < 6; k++) { const f = document.querySelector('.papel-monton [data-ficha]'); f.click(); const t = f.textContent; document.querySelector(/Precio|Unidades|Días/.test(t) ? 'section[data-zona=\"Cuantitativo\"]' : 'section[data-zona=\"Cualitativo\"]').click(); } })()");
  await clic("[data-revisar-papel]");
  await b.hasta("document.querySelector('[data-final]').open", 3000);
  comprobar("Reto sobre el papel superado sin pistas: 3 bloques", await b.eval("document.querySelector('[data-final]').open && document.querySelectorAll('.lec-final-bloques .b-lleno').length === 3"));

  // --- La hoja de ruta refleja el avance ---
  await b.ir("index.html");
  for (let i = 0; i < 20 && !(await b.eval("!document.querySelector('[data-continuar]').hidden")); i++) { await b.eval("document.querySelector('[data-prologo]').click()"); await b.esperar(120); }
  await b.eval("document.querySelector('[data-continuar]').click()");
  await b.esperar(400);
  comprobar("Hoja de ruta: e1-01 y e0-01 hechas", await b.eval("document.querySelector('[data-nodo=e1-01]').classList.contains('nodo--hecho') && document.querySelector('[data-nodo=e0-01]').classList.contains('nodo--hecho')"));

  b.log(fallos.length ? `\n❌ ${fallos.length} comprobaciones fallidas` : "\n✅ Lección: todo correcto");
}
