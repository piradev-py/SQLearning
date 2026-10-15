// Música: arranca con la primera interacción, crossfade entre pistas, bucle 4 → 1, play/stop, volumen, voz del prólogo.
// Uso: node tests/navegador/cdp.mjs esc-musica.mjs
export default async function (b) {
  const fallos = [];
  const comprobar = (nombre, ok, extra = "") => {
    b.log((ok ? "✅ " : "❌ ") + nombre + (ok || !extra ? "" : " — " + extra));
    if (!ok) fallos.push(nombre);
  };
  const clicReal = async () => {   // un clic de verdad (activa el permiso de sonido del navegador)
    for (const type of ["mousePressed", "mouseReleased"]) await b.cdp("Input.dispatchMouseEvent", { type, x: 600, y: 600, button: "left", clickCount: 1 });
  };
  const est = () => b.eval("MUSICA.estado()");

  await b.tam(1366, 768);
  await b.movimiento();
  await b.ir("laboratorio.html");
  await b.eval("localStorage.clear()");
  await b.ir("laboratorio.html");
  comprobar("Hay control de música en la cabecera", await b.eval("!!document.querySelector('[data-musica] .musica-boton') && !!document.querySelector('.musica-volumen')"));
  await clicReal();
  await b.hasta("!MUSICA.estado().pausada", 8000);
  comprobar("Suena tras el primer clic (pista 1)", !(await est()).pausada && (await b.eval("MUSICA._platos().actual.src")).endsWith("background_synthwave_1.mp3"));

  // Crossfade: adelantar a 8 s del final (cuando ya se conoce la duración)
  await b.hasta("Number.isFinite(MUSICA._platos().actual.duration)", 8000);
  await b.eval("(() => { const a = MUSICA._platos().actual; a.currentTime = a.duration - 8; })()");
  await b.hasta("MUSICA.estado().fundiendo", 6000);
  comprobar("Empieza el crossfade al acercarse el final", (await est()).fundiendo);
  await b.esperar(2500);
  const medio = await b.eval("(() => { const { actual, otro } = MUSICA._platos(); return { sale: actual.volume, entra: otro.volume, otroSuena: !otro.paused, otraPista: otro.src }; })()");
  comprobar("A mitad: las dos suenan y se cruzan los volúmenes", medio.otroSuena && medio.entra > 0.02 && medio.sale < 0.35 && medio.otraPista.endsWith("_2.mp3"), JSON.stringify(medio));
  await b.hasta("!MUSICA.estado().fundiendo", 8000);
  const fin = await b.eval("(() => { const { actual, otro } = MUSICA._platos(); return { pista: MUSICA.estado().pista, vol: actual.volume, src: actual.src, otraParada: otro.paused }; })()");
  comprobar("Tras el fundido: pista 2 a volumen normal y la 1 parada", fin.pista === 1 && fin.src.endsWith("_2.mp3") && Math.abs(fin.vol - 0.35) < 0.01 && fin.otraParada, JSON.stringify(fin));

  // Bucle: encadenar crossfades 2 → 3 → 4 → 1
  const orden = [];
  for (let k = 0; k < 3; k++) {
    await b.hasta("Number.isFinite(MUSICA._platos().actual.duration) && !MUSICA.estado().fundiendo", 8000);
    await b.eval("(() => { const a = MUSICA._platos().actual; a.currentTime = a.duration - 7; })()");
    await b.hasta("MUSICA.estado().fundiendo", 6000);
    await b.hasta("!MUSICA.estado().fundiendo", 10000);
    orden.push((await est()).pista);
  }
  comprobar("Bucle: 2 → 3 → 4 → 1", orden.join() === "2,3,0", orden.join());

  // Recordar el punto de la canción entre páginas
  await b.eval("(() => { const a = MUSICA._platos().actual; a.currentTime = 42; })()");
  await b.esperar(2300);
  await b.ir("leccion.html?id=e1-01");
  await clicReal();
  await b.hasta("!MUSICA.estado().pausada && MUSICA._platos().actual.currentTime > 1", 8000);
  const t = await b.eval("MUSICA._platos().actual.currentTime");
  comprobar("Sigue donde iba al cambiar de página (~42 s)", t > 40 && t < 50, String(t));

  // Volumen y stop
  await b.eval("(() => { const r = document.querySelector('.musica-volumen'); r.value = 70; r.dispatchEvent(new Event('input')); })()");
  comprobar("El volumen cambia y se guarda", Math.abs((await b.eval("MUSICA._platos().actual.volume")) - 0.7) < 0.01 && JSON.parse(await b.eval("localStorage.getItem('sqlearning-audio')")).volumen === 0.7);
  await b.eval("document.querySelector('.musica-boton').click()");
  comprobar("Stop para la música y lo recuerda", (await est()).pausada && !(await est()).sonando);
  await b.ir("laboratorio.html");
  await clicReal();
  await b.esperar(800);
  comprobar("Tras recargar, sigue parada", (await est()).pausada);

  // Voz del prólogo: solo en el inicio y baja la música
  await b.eval("document.querySelector('.musica-boton').click()");
  await b.ir("index.html");
  await clicReal();
  await b.hasta("MUSICA.estado().voz", 8000);
  const conVoz = await b.eval("MUSICA._platos().actual.volume");
  comprobar("Prólogo: suena la locución y la música baja", (await est()).voz && conVoz < 0.7 * 0.3, String(conVoz));
  for (let i = 0; i < 20 && !(await b.eval("!document.querySelector('[data-continuar]').hidden")); i++) { await b.eval("document.querySelector('[data-prologo]').click()"); await b.esperar(120); }
  await b.eval("document.querySelector('[data-continuar]').click()");
  await b.esperar(300);
  comprobar("Al continuar, la voz se calla y la música vuelve", !(await est()).voz && Math.abs((await b.eval("MUSICA._platos().actual.volume")) - 0.7) < 0.01);

  // Silenciar la voz del prólogo: se recuerda en la siguiente visita
  await b.ir("index.html");
  comprobar("Antes de «Abrir el caso» no suena la voz", !(await est()).voz);
  await clicReal();
  await b.hasta("MUSICA.estado().voz", 8000);
  await b.eval("document.querySelector('[data-voz]').click()");
  comprobar("🔇 Voz la calla al momento", !(await est()).voz && /🔇/.test(await b.eval("document.querySelector('[data-voz]').textContent")));
  await b.ir("index.html");
  await clicReal();
  await b.esperar(1500);
  comprobar("Con la voz silenciada, la siguiente visita no la reproduce", !(await est()).voz && (await b.eval("MUSICA.vozSilenciada()")));
  await b.eval("document.querySelector('[data-voz]').click()");
  await b.hasta("MUSICA.estado().voz", 5000);
  comprobar("🔊 Voz la reactiva durante el prólogo", (await est()).voz);

  b.log(fallos.length ? `\n❌ ${fallos.length} comprobaciones fallidas` : "\n✅ Música: todo correcto");
}
