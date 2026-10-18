/* ============================================================
   SQLearning · Service worker: el curso funciona sin conexión
   - Al instalarse guarda las páginas con sus js y css, todas las lecciones, los datos de todas las etapas y PGlite.
   - PGlite (vendor/), las imágenes y las fuentes: de la caché; se guardan la primera vez y no cambian.
   - Archivos con ?v= (js, css, lecciones, datos): de la caché; son fijos dentro de cada versión.
   - Páginas: primero la red (así llegan las publicaciones nuevas); sin conexión, la copia guardada.
   - La música no pasa por aquí: el navegador la pide por trozos (Range) y esas respuestas no se guardan.
   Cada publicación (npm run version) cambia VERSION y borra la caché de la anterior; la de PGlite se conserva.
   Se registra en js/curso.js (en local solo si localStorage «sqlearning-sw» = "1": estorbaría a las pruebas).
   ============================================================ */
const VERSION = "202610180719";
const APP = "sqlearning-" + VERSION;
// shortcut: la caché fija no lleva versión; si se cambia PGlite (vendor/) o una imagen de recursos/, sube este número
const FIJO = "sqlearning-fijo-1";
const PAGINAS = ["index.html", "leccion.html", "laboratorio.html", "caso-cerrado.html"];
// PostgreSQL (PGlite 0.5.10, vendor/pglite): se guarda al instalar, para que funcione sin red aunque no se haya abierto
// aún ninguna diligencia. shortcut: lista escrita a mano; si se cambia PGlite, actualízala y sube FIJO
const PGLITE = ["index.js", "chunk-3OMHRXTA.js", "chunk-6QROZKQ5.js", "chunk-7NIVBDG7.js", "chunk-F4GETNPB.js", "chunk-NNS5RQRF.js",
  "chunk-O56QGQDD.js", "chunk-QY3QWFKW.js", "initdb.js", "initdb.wasm", "pglite.data", "pglite.wasm"].map(f => "vendor/pglite/" + f);

self.window = self;                       // js/curso.js se escribe para el navegador: deja el índice en window.CURSO
importScripts("js/curso.js?v=" + VERSION);

async function guardar(cache, url) {
  try {
    const r = await fetch(url, { cache: "no-cache" });
    if (r.ok) await cache.put(url, r);
  } catch (e) { /* sin red al instalar: se guardará al usarlo */ }
}

self.addEventListener("install", ev => {
  ev.waitUntil((async () => {
    const cache = await caches.open(APP);
    const urls = new Set(PAGINAS.concat("./"));
    // Los js y css de cada página, tal como los pide (con su ?v=)
    for (const p of PAGINAS) {
      try {
        const html = await (await fetch(p, { cache: "no-cache" })).text();
        for (const m of html.matchAll(/(?:src|href)="((?:js|css)\/[^"]+)"/g)) urls.add(m[1]);
      } catch (e) { /* sin red */ }
    }
    for (const etapa of CURSO.ETAPAS) {
      if (etapa.datos) urls.add(CURSO.conVersion(`datos/${etapa.datos}.sql`));
      for (const n of etapa.niveles) if (n.listo) urls.add(CURSO.conVersion(`lecciones/${etapa.carpeta}/${n.archivo}`));
    }
    urls.add(CURSO.conVersion("js/motor-worker.js"));
    const fijo = await caches.open(FIJO);
    const faltan = [];
    for (const u of PGLITE) if (!(await fijo.match(u))) faltan.push(u);
    await Promise.all([...urls].map(u => guardar(cache, u)).concat(faltan.map(u => guardar(fijo, u))));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", ev => {
  ev.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("sqlearning-") && k !== APP && k !== FIJO) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function primeroCache(req, nombre) {
  const guardada = await caches.match(req);
  if (guardada) return guardada;
  const r = await fetch(req);
  if (r.ok || r.type === "opaque") (await caches.open(nombre)).put(req, r.clone());
  return r;
}

async function primeroRed(req) {
  try {
    const r = await fetch(req);
    if (r.ok) (await caches.open(APP)).put(req, r.clone());
    return r;
  } catch (e) {
    // leccion.html?id=e3-05 sin conexión: sirve la página guardada (la lección la elige su propio script)
    return (await caches.match(req)) || (await caches.match(req, { ignoreSearch: true })) ||
      (req.mode === "navigate" ? caches.match("index.html") : Response.error());
  }
}

self.addEventListener("fetch", ev => {
  const req = ev.request;
  if (req.method !== "GET" || req.headers.has("range")) return;
  const url = new URL(req.url);
  if (/\.mp3$/i.test(url.pathname)) return;
  if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return ev.respondWith(primeroCache(req, FIJO));
  if (url.origin !== location.origin) return;
  if (/\/(vendor|recursos)\//.test(url.pathname)) return ev.respondWith(primeroCache(req, FIJO));
  if (url.searchParams.has("v")) return ev.respondWith(primeroCache(req, APP));
  ev.respondWith(primeroRed(req));
});
