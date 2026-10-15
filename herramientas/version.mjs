// Marca de versión para que los navegadores no mezclen archivos viejos (caché) con nuevos.
// Añade/actualiza «?v=AAAAMMDDhhmm» en los <script src> y <link href> locales de las páginas,
// y la constante VERSION de js/curso.js (la usan la carga de lecciones y del motor).
// Uso: node herramientas/version.mjs   (antes de publicar; `npm run publicar` lo hace solo)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const d = new Date();
const dos = n => String(n).padStart(2, "0");
const v = `${d.getFullYear()}${dos(d.getMonth() + 1)}${dos(d.getDate())}${dos(d.getHours())}${dos(d.getMinutes())}`;

for (const pagina of ["index.html", "leccion.html", "laboratorio.html"]) {
  const ruta = RAIZ + pagina;
  const html = readFileSync(ruta, "utf8").replace(
    /((?:src|href)="(?:js|css)\/[^"?]+\.(?:js|css))(\?v=\d+)?"/g,
    (_, base) => `${base}?v=${v}"`
  );
  writeFileSync(ruta, html);
}
const curso = RAIZ + "js/curso.js";
writeFileSync(curso, readFileSync(curso, "utf8").replace(/const VERSION = "\d*";/, `const VERSION = "${v}";`));
console.log("✅ versión " + v);
