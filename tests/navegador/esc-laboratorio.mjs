// Recorre el laboratorio como un usuario: escribe, autocompleta, ejecuta con Ctrl+Enter,
// provoca un error, mira el esquema y hace fotos en claro/oscuro y a varios tamaños.
// Uso: node tests/navegador/cdp.mjs esc-laboratorio.mjs
export default async function (b) {
  const fallos = [];
  const comprobar = (nombre, ok, extra = "") => {
    b.log((ok ? "✅ " : "❌ ") + nombre + (ok || !extra ? "" : " — " + extra));
    if (!ok) fallos.push(nombre);
  };
  // Teclear de verdad (dispara input con inputType insertText, como una persona)
  const teclear = async texto => {
    for (const ch of texto) await b.cdp("Input.insertText", { text: ch });
  };
  const tecla = async (key, code, keyCode, modifiers = 0) => {
    await b.cdp("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code, windowsVirtualKeyCode: keyCode, modifiers });
    await b.cdp("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: keyCode, modifiers });
  };
  const ctrlEnter = () => tecla("Enter", "Enter", 13, 2);
  const vaciar = async () => {
    await b.eval("(() => { const a = document.querySelector('.es-texto'); a.focus(); a.select(); })()");
    await tecla("Delete", "Delete", 46);
  };
  const filas = () => b.eval("document.querySelectorAll('[data-vista=resultado] tbody tr').length");

  await b.tam(1366, 768);
  await b.ir("laboratorio.html");
  await b.eval("localStorage.clear()");
  await b.ir("laboratorio.html");
  const t0 = Date.now();
  const listo = await b.hasta("document.querySelector('[data-cargando]').hidden", 60000);
  comprobar("PostgreSQL arranca y la página queda lista", listo, "");
  b.log(`   (lista en ${Date.now() - t0} ms)`);

  // 1. Ejemplo inicial con Ctrl+Enter
  await b.eval("document.querySelector('.es-texto').focus()");
  await ctrlEnter();
  await b.hasta("document.querySelectorAll('[data-vista=resultado] tbody tr').length > 0", 10000);
  comprobar("Ctrl+Enter ejecuta el ejemplo: 6 tiendas", (await filas()) === 6, String(await filas()));
  comprobar("La cabecera muestra el tipo en español", await b.eval("document.querySelector('.r-tabla th:nth-child(4) small')?.textContent === 'fecha'"));
  comprobar("Estado: «6 filas · N ms»", /^6 filas · \d+ ms$/.test(await b.eval("document.querySelector('[data-estado]').textContent")));

  // 2. Escribir con autocompletado
  await vaciar();
  await teclear("SELECT nombre, prec");
  comprobar("Sugerencias al escribir «prec»", await b.eval("!document.querySelector('.es-sugerencias').hidden && document.querySelector('.es-sugerencias li')?.textContent.startsWith('precio')"));
  await tecla("Tab", "Tab", 9);
  await teclear(" FROM pro");
  comprobar("Tras FROM sugiere primero la tabla «productos»", await b.eval("document.querySelector('.es-sugerencias li .es-sug-texto')?.textContent === 'productos'"));
  await tecla("Enter", "Enter", 13);
  await teclear(";");
  comprobar("El texto queda bien autocompletado", (await b.eval("document.querySelector('.es-texto').value")) === "SELECT nombre, precio FROM productos;",
    await b.eval("document.querySelector('.es-texto').value"));
  comprobar("Resaltado: SELECT y FROM pintados como palabra clave", (await b.eval("document.querySelectorAll('.es-resaltado .sql-clave').length")) === 2);
  comprobar("Resaltado: «productos» pintado como tabla", await b.eval("document.querySelector('.es-resaltado .sql-tabla')?.textContent === 'productos'"));
  await b.eval("document.querySelector('[data-ejecutar]').click()");
  await b.hasta("document.querySelectorAll('[data-vista=resultado] tbody tr').length === 40", 10000);
  comprobar("Botón Ejecutar: 40 productos", (await filas()) === 40, String(await filas()));
  comprobar("Los precios se alinean a la derecha", await b.eval("document.querySelector('.r-tabla td.r-num') !== null"));
  await b.foto("lab-resultado-noche");

  // 3. Error con línea marcada
  await vaciar();
  await teclear("SELECT *");
  await tecla("Enter", "Enter", 13);
  await teclear("FROM producto;");
  await ctrlEnter();
  await b.hasta("document.querySelector('.r-error') !== null", 10000);
  comprobar("El error sugiere «productos»", await b.eval("/productos/.test(document.querySelector('.r-error').textContent)"));
  comprobar("El error dice la línea 2", await b.eval("/Línea 2/.test(document.querySelector('.r-error-titulo').textContent)"));
  comprobar("La línea 2 se marca en el editor", await b.eval("document.querySelector('.es-numeros .es-error')?.textContent === '2'"));
  await b.foto("lab-error-noche");
  await teclear(" ");
  comprobar("Al escribir se quita la marca de error", await b.eval("document.querySelector('.es-numeros .es-error') === null"));

  // 4. Esquema
  await b.eval("document.querySelector('[data-pestana=esquema]').click()");
  comprobar("Esquema: 3 fichas de tabla", (await b.eval("document.querySelectorAll('.r-ficha').length")) === 3);
  comprobar("Esquema: tienda_id apunta a tiendas.id", await b.eval("/→ tiendas\\.id/.test(document.querySelector('[data-vista=esquema]').textContent)"));
  await b.foto("lab-esquema-noche");

  // 5. Borrador guardado al recargar
  await b.ir("laboratorio.html");
  await b.hasta("document.querySelector('[data-cargando]').hidden", 60000);
  comprobar("El borrador sobrevive a la recarga", /FROM producto;/.test(await b.eval("document.querySelector('.es-texto').value")));

  // 6. DML de práctica: no cambia nada
  await vaciar();
  await teclear("DELETE FROM productos;");
  await ctrlEnter();
  await b.hasta("/40 filas/.test(document.querySelector('.r-aviso')?.textContent || '')", 10000);
  comprobar("DELETE avisa de 40 filas y de que se deshace", await b.eval("/40 filas/.test(document.querySelector('.r-aviso').textContent)"));

  // 6b. Arreglos de la revisión QA (F2, F3, F13, F14, F17)
  await vaciar();
  await teclear("SELECT e.nombre FROM empleados AS e");
  await tecla("Enter", "Enter", 13);
  comprobar("F2: Enter tras «AS e» es un salto de línea", (await b.eval("document.querySelector('.es-texto').value")) === "SELECT e.nombre FROM empleados AS e\n",
    JSON.stringify(await b.eval("document.querySelector('.es-texto').value")));
  await teclear("WHERE e.");
  comprobar("F14: «e.» sugiere columnas de empleados", await b.eval("[...document.querySelectorAll('.es-sugerencias .es-sug-texto')].map(x => x.textContent).includes('departamento')"));
  await tecla("Escape", "Escape", 27);
  await tecla("Tab", "Tab", 9);
  comprobar("F13: Esc (cierra la lista) y Tab sale del editor", await b.eval("document.activeElement !== document.querySelector('.es-texto')"));
  await b.eval("document.querySelector('.es-texto').focus()");
  await teclear("\n".repeat(30) + "SELECT pr");
  // Espera a que la lista se coloque (antes se miraba al instante y fallaba de vez en cuando)
  comprobar("F3: en las últimas líneas la lista se ve dentro del editor", await b.hasta(`(() => {
    const l = document.querySelector('.es-sugerencias'), e = document.querySelector('.editor-sql');
    if (l.hidden) return false;
    const a = l.getBoundingClientRect(), c = e.getBoundingClientRect();
    return a.top >= c.top && a.bottom <= c.bottom + 1;
  })()`, 3000));
  await tecla("Escape", "Escape", 27);
  const antesDeBorrar = await b.eval("document.querySelector('.es-texto').value");
  await b.eval("document.querySelector('[data-limpiar]').click()");
  await tecla("z", "KeyZ", 90, 2);
  comprobar("F17: Ctrl+Z recupera lo borrado con «Borrar»", (await b.eval("document.querySelector('.es-texto').value")) === antesDeBorrar);

  // 6c. Pestaña Gráfico
  await vaciar();
  await teclear("SELECT categoria, COUNT(*) AS n FROM productos GROUP BY categoria ORDER BY n DESC;");
  await b.eval("document.querySelector('[data-pestana=grafico]').click()");
  await ctrlEnter();
  await b.hasta("document.querySelectorAll('[data-vista=grafico] .gr-barra').length > 0", 10000);
  comprobar("Gráfico: una barra por categoría (5)", (await b.eval("document.querySelectorAll('[data-vista=grafico] .gr-barra').length")) === 5);
  comprobar("Gráfico: tras ejecutar sigue en la pestaña Gráfico", await b.eval("document.querySelector('[data-pestana=grafico]').getAttribute('aria-selected') === 'true'"));
  comprobar("Gráfico: conteos con marcas enteras", await b.eval("[...document.querySelectorAll('.gr-eje')].every(t => !t.textContent.includes(','))"));
  await b.eval("document.querySelector('.gr-marco').focus()");
  await tecla("ArrowDown", "ArrowDown", 40);
  const tip = await b.eval("document.querySelector('.gr-tooltip:not([hidden])')?.textContent || ''");
  comprobar("Gráfico: con el teclado se ve el valor (Informática 11)", /Informática.*11/.test(tip), tip);
  await vaciar();
  await teclear("SELECT to_char(creado, 'YYYY-MM') AS mes, COUNT(*) AS altas FROM productos GROUP BY 1;");
  await ctrlEnter();
  await b.hasta("document.querySelector('[data-vista=grafico] .gr-linea') !== null", 10000);
  comprobar("Gráfico: los meses se dibujan como líneas, ordenados", await b.eval("/Ordenado por/.test(document.querySelector('[data-vista=grafico]').textContent)"));
  await vaciar();
  await teclear("SELECT categoria, precio FROM productos;");
  await ctrlEnter();
  await b.hasta("document.querySelector('[data-vista=grafico] .r-aviso') !== null", 10000);
  comprobar("Gráfico: si la etiqueta se repite, explica que hay que agrupar", await b.eval("/GROUP BY categoria/.test(document.querySelector('[data-vista=grafico] .r-aviso').textContent)"));
  const sinGrafico = await b.eval(`[
    GRAFICO.analizar({ columnas: ['mes', 'tienda_id', 'total'], tipos: ['text', 'integer', 'numeric'], filas: [['2026-02', 1, '10.5'], ['2026-01', 1, '3'], ['2026-01', 2, '4']] }),
    GRAFICO.analizar({ columnas: ['tienda_id', 'pedidos', 'facturacion'], tipos: ['integer', 'bigint', 'numeric'], filas: [[1, 10, '100'], [2, 20, null]] }),
    GRAFICO.analizar({ columnas: ['n'], tipos: ['bigint'], filas: [[3]] })
  ]`);
  comprobar("Gráfico: (mes, tienda, total) → líneas, una serie por tienda, meses en orden",
    sinGrafico[0].forma === "lineas" && sinGrafico[0].paneles[0].series.length === 2 && sinGrafico[0].etiquetas.join() === "2026-01,2026-02" && sinGrafico[0].paneles[0].series[0].valores.join() === "3,10.5",
    JSON.stringify(sinGrafico[0]));
  comprobar("Gráfico: dos medidas → dos paneles (nunca dos ejes)", sinGrafico[1].paneles.length === 2 && sinGrafico[1].paneles[1].series[0].valores[1] === null);
  comprobar("Gráfico: una sola columna no se dibuja", sinGrafico[2].ok === false);
  await b.eval("document.querySelector('[data-pestana=resultado]').click()");

  // 7. Tema día y tamaños
  await b.eval("document.querySelector('[data-tema]').click()");
  await vaciar();
  await teclear("SELECT nombre, precio * stock AS valor -- inventario\nFROM productos\nORDER BY valor DESC\nLIMIT 8;");
  await ctrlEnter();
  await b.hasta("document.querySelectorAll('[data-vista=resultado] tbody tr').length === 8", 10000);
  await b.foto("lab-resultado-dia");
  for (const [w, h] of [[1920, 1080], [1280, 720], [1024, 768]]) {
    await b.tam(w, h);
    await b.esperar(300);
    const scroll = await b.eval("document.documentElement.scrollHeight > innerHeight || document.documentElement.scrollWidth > innerWidth");
    comprobar(`Sin scroll de página a ${w}×${h}`, !scroll);
  }
  await b.foto("lab-1024-dia");

  // 8. Datos: los de la etapa más avanzada abierta (sin progreso → EXP.1)
  comprobar("Sin progreso carga los datos del EXP.1", /EXP\.1 /.test(await b.eval("document.querySelector('[data-datos-lab]').textContent")));
  await b.eval("localStorage.setItem('sqlearning-progreso-v1', JSON.stringify({ creditos: 0, completados: {}, credenciales: [], expediente: [], turnos: { dias: 0, ultimo: null }, ultimo: null, ajustes: { desbloquearTodo: true } }))");
  await b.ir("laboratorio.html");
  await b.hasta("document.querySelector('[data-cargando]').hidden", 60000);
  const esperada = await b.eval("CURSO.ETAPAS.filter(e => e.datos && e.niveles.some(n => n.listo)).pop().n");
  comprobar(`Con todo abierto carga los datos del EXP.${esperada}`, (await b.eval("document.querySelector('[data-datos-lab]').textContent")).includes(`EXP.${esperada} `));
  comprobar("Con todo abierto el esquema tiene pedidos", await b.eval("[...document.querySelectorAll('.r-ficha-nombre')].some(n => n.textContent === 'pedidos')"));
  await b.eval("localStorage.removeItem('sqlearning-progreso-v1')");

  b.log(fallos.length ? `\n❌ ${fallos.length} comprobaciones fallidas` : "\n✅ Laboratorio: todo correcto");
}
