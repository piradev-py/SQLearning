// Sin conexión (sw.js): tras una primera visita, con el servidor apagado, el curso sigue funcionando.
// Uso: node tests/navegador/cdp.mjs esc-sin-conexion.mjs
export default async function (b) {
  const fallos = [];
  const comprobar = (nombre, ok, extra = "") => {
    b.log((ok ? "✅ " : "❌ ") + nombre + (ok || !extra ? "" : " — " + extra));
    if (!ok) fallos.push(nombre);
  };
  const listo = () => b.hasta("document.querySelector('[data-cargando]')?.hidden === true", 60000);

  // Primera visita: el service worker se instala (en local hay que pedirlo) y guarda lo necesario
  await b.ir("index.html");
  // Con todo desbloqueado (como el modo prueba), para poder abrir la última diligencia sin jugar el curso
  await b.eval(`localStorage.clear(); localStorage.setItem('sqlearning-sw', '1');
    localStorage.setItem('sqlearning-progreso-v1', JSON.stringify({ creditos: 0, completados: {}, credenciales: [], expediente: [],
      turnos: { dias: 0, ultimo: null }, ultimo: null, ajustes: { desbloquearTodo: true } }))`);
  await b.ir("index.html");
  comprobar("El service worker se instala y se activa", await b.eval("navigator.serviceWorker.ready.then(r => !!r.active)"));
  await b.ir("index.html");
  comprobar("La página queda bajo su control", await b.eval("!!navigator.serviceWorker.controller"));
  const guardadas = await b.eval("caches.keys().then(ks => Promise.all(ks.map(k => caches.open(k).then(c => c.keys())))).then(l => l.flat().map(r => new URL(r.url).pathname))");
  comprobar("Guarda las lecciones, los datos de todas las etapas y PostgreSQL", guardadas.filter(p => p.includes("/lecciones/")).length >= 93
    && guardadas.filter(p => p.includes("/datos/")).length === 8 && guardadas.some(p => p.endsWith("/vendor/pglite/pglite.wasm")), guardadas.length + " archivos");
  // Sin abrir antes ninguna diligencia con conexión (revisión final, F1): todo tiene que salir de lo guardado al instalar

  await b.sinServidor();
  await b.ir("index.html");
  comprobar("Sin servidor: la hoja de ruta abre", await b.hasta("!!document.querySelector('[data-prologo]') && !document.querySelector('[data-entrar]').hidden", 10000));
  await b.ir("leccion.html?id=e8-12");
  comprobar("Sin servidor: una diligencia nunca abierta (e8-12) carga con sus datos", await listo() && await b.eval("/Caso cerrado/.test(document.querySelector('[data-titulo]').textContent)"));
  await b.ir("laboratorio.html");
  await b.hasta("document.querySelector('[data-cargando]').hidden", 60000);
  const r = await b.eval("MOTOR.ejecutar('SELECT COUNT(*) AS n FROM productos;').then(r => r.ok ? r.ultimo.filas[0][0] : r.error.mensaje)");
  comprobar("Sin servidor: el laboratorio ejecuta SQL", Number(r) > 0, String(r));
  await b.ir("caso-cerrado.html");
  comprobar("Sin servidor: el expediente final abre (clasificado)", await b.eval("document.querySelector('[data-clasificado]').offsetHeight > 0"));

  b.log(fallos.length ? `\n❌ ${fallos.length} comprobaciones fallidas` : "\n✅ Sin conexión: todo correcto");
}
