// Genera las imágenes del README en docs/readme/ (banner, botón y capturas reales de la web).
// Uso: node tests/navegador/cdp.mjs esc-readme.mjs   (rehacer cuando cambie el aspecto de la web)
export default async function (b) {
  const foto = nombre => b.foto("docs/readme/" + nombre, { raiz: true });
  await b.movimiento();

  // --- Banner y botón (herramientas/readme/piezas.html) ---
  await b.tam(1280, 420, 2);
  await b.ir("herramientas/readme/piezas.html?pieza=banner");
  await b.esperar(2500);                                   // fuentes de Google
  await foto("banner");
  await b.tam(560, 120, 2);
  await b.ir("herramientas/readme/piezas.html?pieza=boton");
  await b.esperar(1500);
  await foto("boton-entrar");

  // --- Capturas de la web (1280×720) ---
  await b.tam(1280, 720, 1);
  await b.ir("index.html");
  await b.eval("localStorage.clear(); sessionStorage.clear(); localStorage.setItem('sqlearning-audio', JSON.stringify({ sonando: false, volumen: 0.35, pista: 0, tiempo: 0, vozSilenciada: true }))");
  await b.ir("index.html");
  await b.eval("document.querySelector('[data-entrar]').click()");
  for (let i = 0; i < 20 && !(await b.eval("!document.querySelector('[data-continuar]').hidden")); i++) { await b.eval("document.querySelector('[data-prologo]').click()"); await b.esperar(120); }
  await b.esperar(1500);
  await foto("prologo");

  // Progreso de ejemplo: etapa 1 cerrada, algo de la 0 y de la 2
  const hechas = {};
  for (let k = 1; k <= 9; k++) hechas[`e1-0${k}`] = { bloques: k % 4 === 0 ? 2 : 3, fecha: "2026-10-10" };
  for (const id of ["e0-01", "e0-02", "e0-03", "e2-01", "e2-02", "e2-03"]) hechas[id] = { bloques: id === "e2-02" ? 2 : 3, fecha: "2026-10-14" };
  await b.eval(`localStorage.setItem('sqlearning-progreso-v1', ${JSON.stringify(JSON.stringify({
    creditos: 1460, completados: hechas, credenciales: ["acceso", "limpia", "turnos-3", "exp-1"],
    expediente: [{ id: "inventario-imposible", titulo: "El inventario imposible", texto: "Los Auriculares Sonora Pulse marcan un stock de -12." }],
    turnos: { dias: 4, ultimo: "2026-10-15" }, ultimo: "e2-03", ajustes: {}
  }))})`);
  await b.ir("about:blank");                       // cargar el inicio de cero (no solo cambiar la #)
  await b.ir("index.html#ruta");
  await b.esperar(800);
  await b.eval("document.querySelector('[data-desplegar-todo]').click()");   // en el README, todo desplegado
  await b.esperar(400);
  await b.eval("scrollTo(0, 520)");
  await b.esperar(500);
  await foto("hoja-de-ruta");
  await b.eval("scrollTo(0, 1500)");
  await b.esperar(500);
  await foto("expedientes-clasificados");

  // Lección: error explicado en el reto de e2-04 (aún no superada) y pantalla final
  await b.eval("localStorage.removeItem('sqlearning-tablero-plegados')");   // no dejar el desplegado guardado
  await b.ir("leccion.html?id=e2-04");
  await b.hasta("document.querySelector('[data-cargando]').hidden", 60000);
  await b.eval("LECCION.ir(LECCION.estado().total - 1)");
  await b.esperar(400);
  await b.eval(`LECCION.editor().poner(${JSON.stringify('SELECT nombre, ciudad\nFROM clientes\nWHERE ciudad = "Bilbao" OR ciudad = "Sevilla";')})`);
  await b.eval("document.querySelector('[data-revisar]').click()");
  await b.esperar(1500);
  await foto("leccion-error");
  await b.eval("LECCION.editor().poner(CURSO.leccion('e2-04').pasos.at(-1).solucion)");
  await b.eval("document.querySelector('[data-revisar]').click()");
  await b.hasta("document.querySelector('[data-final]').open", 5000);
  await b.esperar(600);
  await foto("diligencia-superada");

  // Laboratorio
  await b.ir("laboratorio.html");
  await b.hasta("document.querySelector('[data-cargando]').hidden", 60000);
  await b.eval(`(() => { const e = document.querySelector('.es-texto'); e.value = ${JSON.stringify("-- Valor del inventario por producto\nSELECT nombre, categoria, precio * stock AS valor_inventario\nFROM productos\nWHERE activo\nORDER BY valor_inventario DESC\nLIMIT 12;")}; e.dispatchEvent(new Event('input')); document.querySelector('[data-ejecutar]').click(); })()`);
  await b.hasta("document.querySelectorAll('[data-vista=resultado] tbody tr').length === 12", 10000);
  await b.esperar(400);
  await foto("laboratorio");
  b.log("✅ Imágenes del README en docs/readme/");
}
