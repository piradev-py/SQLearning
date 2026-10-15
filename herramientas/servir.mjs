// Servidor local mínimo para probar SQLearning (PGlite necesita http, no funciona con doble clic).
// Uso: npm run servir   (o: node herramientas/servir.mjs [puerto])
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PUERTO = Number(process.argv[2] || process.env.PUERTO || 8080);

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".sql": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".wasm": "application/wasm",
  ".data": "application/octet-stream",
  ".tar.gz": "application/gzip"
};

createServer(async (req, res) => {
  try {
    let ruta = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (ruta.endsWith("/")) ruta += "index.html";
    const archivo = normalize(join(RAIZ, ruta));
    if (!archivo.startsWith(RAIZ)) { res.writeHead(403).end(); return; }
    if (!(await stat(archivo)).isFile()) throw new Error("no es archivo");
    const tipo = archivo.endsWith(".tar.gz") ? TIPOS[".tar.gz"] : TIPOS[extname(archivo)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": tipo, "Cache-Control": "no-cache" });
    res.end(await readFile(archivo));
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("404 · No encontrado");
  }
}).listen(PUERTO, () => {
  console.log(`SQLearning en http://localhost:${PUERTO}  (Ctrl+C para parar)`);
});
