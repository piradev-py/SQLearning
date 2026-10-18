// Retratos pequeños en pixel art de los personajes para los tickets y los consejos → recursos/retratos/<id>.svg
// Mismo estilo que el retrato grande de Héctor (generar-hector.mjs): formas sencillas iluminadas como en la escena
// neón (luz magenta por la izquierda, borde cian por la derecha) y paleta corta con tramado ordenado (Bayer 4×4).
// Cada personaje lleva un rasgo de su papel en HISTORIA.md (gafas de Lucía, cascos de Marcos, chaleco de Héctor…).
// Uso: node herramientas/generar-retratos.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const W = 32, H = 32, ESCALA = 4;
const cx = 16, cy = 13, rx = 6.2, ry = 7.6;
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const tramar = (v, x, y, n, fuerza = 0.5) =>
  Math.max(0, Math.min(n - 1, Math.floor(v * n + (BAYER[y & 3][x & 3] / 16 - 0.5) * fuerza)));

const COMUN = {
  fondo: ["#0f0826", "#160b33", "#1d0f40"],
  piel: ["#2e173d", "#5e2f55", "#9a4f6a", "#d47a86", "#f2aab0"],
  ojo: "#120b1c", labio: "#4a1830",
  cian: "#6fd6f2", magenta: "#ff6db2", contorno: "#08040f"
};

// pelo: forma (moño, corto, melena, media, rapado, canoso) · ropa: 4 tonos · extra: rasgo propio
const PERSONAJES = {
  lucia: { titulo: "Lucía Mora, jefa de datos", pelo: "mono", tonoPelo: ["#120b1c", "#24172f", "#3b2a4b", "#56436a"],
    ropa: ["#0d0a1c", "#1a1533", "#29224d", "#3a3168"], cuello: "#c9c3de", extra: ["gafas"] },
  marcos: { titulo: "Marcos Gil, atención al cliente", pelo: "revuelto", tonoPelo: ["#2a160e", "#4a2a18", "#6e4026", "#8f5a36"],
    ropa: ["#1c2f4a", "#2c4a70", "#3f6593", "#5784b4"], cuello: "#9fc2e6", extra: ["cascos"] },
  elena: { titulo: "Elena Ruiz, directora de ventas", pelo: "melena", tonoPelo: ["#2a0e14", "#4f1a22", "#7a2b2c", "#a3453a"],
    ropa: ["#3a0d2a", "#6a1a4a", "#9a2a68", "#c23d8f"], cuello: "#e6e1f2", extra: [] },
  hector: { titulo: "Héctor Vidal, jefe de logística", pelo: "canoso", tonoPelo: ["#120b1c", "#24172f", "#6f6884", "#9a93ad"],
    ropa: ["#5e2234", "#93393a", "#c45a3c", "#e88446"], cuello: "#8c86a8", extra: ["reflectante"] },
  nuria: { titulo: "Nuria Campos, migración de sistemas", pelo: "media", tonoPelo: ["#1a0f08", "#33200f", "#55361a", "#7a5228"],
    ropa: ["#0c2a2a", "#164545", "#21605e", "#2f7d78"], cuello: "#cfe9e4", extra: [] },
  ivan: { titulo: "Iván Soler, administrador de sistemas", pelo: "rapado", tonoPelo: ["#0a0710", "#17111f", "#2a2236", "#3d3350"],
    ropa: ["#0b0b12", "#16161f", "#23232f", "#323242"], cuello: "#23232f", extra: ["barba", "capucha"] },
  ana: { titulo: "Ana Beltrán, directora general", pelo: "corto", tonoPelo: ["#4a4258", "#6f6884", "#9a93ad", "#c8c2d8"],
    ropa: ["#0d0a1c", "#151228", "#1f1a3a", "#2b2550"], cuello: "#e6e1f2", extra: ["pendientes"] }
};

const L = [-0.55, -0.2, 0.81];
const luz = (nx, ny) => Math.max(0, L[0] * nx + L[1] * ny + L[2] * Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)));

function cabeza(x, y) {
  const dy = (y - cy) / ry;
  const dx = (x - cx) / (rx * (dy > 0 ? 1 - 0.3 * dy * dy : 1));
  return dx * dx + dy * dy <= 1 ? { nx: dx, ny: dy } : null;
}

// ¿Pelo en (x, y)? Devuelve { nx, ny } para iluminarlo, o null. «Detrás» = pelo que asoma por los lados de la cara.
function pelo(forma, x, y) {
  const dx = (x - cx) / (rx + 1.3), dyc = (y - (cy - 0.6)) / (ry + 1.4);
  const casco = dx * dx + dyc * dyc <= 1 && y < cy - 3.2 + (Math.abs(x - cx) > rx - 0.6 ? 4 : 0);
  switch (forma) {
    case "mono": {
      const m = ((x - cx) / 2.8) ** 2 + ((y - (cy - ry - 2.2)) / 2.2) ** 2 <= 1;            // moño arriba
      return casco || m ? { nx: dx, ny: dyc } : null;
    }
    case "revuelto": {
      const borde = cy - 3.2 + (x % 3 === 0 ? 1.2 : 0) + (Math.abs(x - cx) > rx - 0.6 ? 3 : 0);
      const pinchos = dx * dx + ((y - (cy - 1.2)) / (ry + 2.2 + (x % 2) * 0.8)) ** 2 <= 1;
      return pinchos && y < borde ? { nx: dx, ny: dyc } : null;
    }
    case "melena": {
      const lados = Math.abs(x - cx) > rx - 1.2 && Math.abs(x - cx) < rx + 2.4 && y >= cy - 4 && y < cy + 9;
      const flequillo = dx * dx + dyc * dyc <= 1 && y < cy - 3.6 + (x > cx ? 1.4 : 0);
      return lados || flequillo ? { nx: dx, ny: dyc } : null;
    }
    case "media": {
      const lados = Math.abs(x - cx) > rx - 0.9 && Math.abs(x - cx) < rx + 1.8 && y >= cy - 4 && y < cy + 4.5;
      const flequillo = dx * dx + dyc * dyc <= 1 && y < cy - 2.6;                           // flequillo recto
      return lados || flequillo ? { nx: dx, ny: dyc } : null;
    }
    case "rapado":
      return dx * dx + dyc * dyc <= 1 && y < cy - 4.4 + (Math.abs(x - cx) > rx - 0.6 ? 2.5 : 0) ? { nx: dx, ny: dyc } : null;
    case "canoso":
    case "corto":
      return casco ? { nx: dx, ny: dyc } : null;
  }
  return null;
}

function retrato(id, p) {
  const rejilla = [], figura = new Set();
  const hombros = cy + ry - 0.5;
  for (let y = 0; y < H; y++) {
    rejilla.push([]);
    for (let x = 0; x < W; x++) {
      const px = x + 0.5, py = y + 0.5, ax = Math.abs(px - cx);
      const h = pelo(p.pelo, px, py), cab = cabeza(px, py);
      const ancho = py < hombros ? -1 : 5 + 10 * Math.min(1, Math.sqrt((py - hombros) / 6));
      let c = null;
      if (ancho > 0 && ax <= ancho && py > hombros + 0.5) {
        const nx = (px - cx) / ancho, dy = py - hombros;
        c = p.ropa[tramar(0.62 - 0.4 * nx - 0.01 * dy, x, y, 4, 0.3)];
        if (ax < 3 - dy * 0.3 && dy < 5) c = ax < 1.6 - dy * 0.3 ? COMUN.piel[1] : p.cuello;   // escote / cuello
        if (p.extra.includes("reflectante") && (dy >= 7 && dy < 8.2) && ax > 3) c = "#c8f1ff";
        if (p.extra.includes("capucha") && dy < 2.2 && ax > 3 && ax < 9) c = p.ropa[2];
        if (nx > 0.92) c = COMUN.cian;
        if (nx < -0.94) c = COMUN.magenta;
      } else if (h && !(cab && h.ny > -0.2 && Math.abs(px - cx) < rx - 1.2)) {
        let i = tramar(luz(h.nx, h.ny) * 0.98, x, y, 4);
        if (p.pelo === "canoso" && Math.abs(px - cx) > rx - 1.5 && py > cy - 5) i = Math.max(2, i);   // sienes canosas
        c = p.tonoPelo[i];
        if (h.nx > 0.93 && h.ny < 0.1) c = COMUN.cian;
        if (h.nx < -0.88 && h.ny < 0) c = COMUN.magenta;
      } else if (cab) {
        const dx = px - cx, dy = py - cy, adx = Math.abs(dx);
        const i = tramar(Math.min(1, luz(cab.nx, cab.ny) * 1.1 + 0.05), x, y, 5);
        c = COMUN.piel[i];
        if (Math.abs(dy + 0.6) < 0.5 && Math.abs(adx - 2.6) < 0.8) c = COMUN.ojo;                   // ojos
        if (Math.abs(dy + 2.2) < 0.45 && Math.abs(adx - 2.6) < 1.3) c = p.tonoPelo[1];             // cejas
        if (dx > 0 && dx < 1 && dy > 0.4 && dy < 2.6) c = COMUN.piel[Math.max(0, i - 1)];          // nariz
        if (Math.abs(dy - 3.5) < 0.1 && adx < 1.6) c = COMUN.labio;                                // boca
        // Gafas: dos monturas de 3×3 píxeles alrededor de los ojos y el puente
        const montura = (Math.abs(dy + 1.5) < 0.1 || Math.abs(dy - 0.5) < 0.1) ? adx > 1 && adx < 4 :
          Math.abs(dy + 0.5) < 0.1 && (Math.abs(adx - 1.5) < 0.1 || Math.abs(adx - 3.5) < 0.1 || adx < 1);
        if (p.extra.includes("gafas") && montura) c = COMUN.cian;
        if (p.extra.includes("barba") && (dy > 2.8 || (dy > 0.8 && adx > 3.2)) && !(Math.abs(dy - 3.5) < 0.1 && adx < 1.6))
          c = p.tonoPelo[1 + tramar(luz(cab.nx, cab.ny), x, y, 2, 0.3)];
        if (cab.nx > 0.9) c = COMUN.cian;
        if (cab.nx < -0.9) c = COMUN.magenta;
      } else if (ax < 2.6 && py > cy + 5 && py <= hombros + 1) {
        c = COMUN.piel[py < cy + ry - 0.6 ? 0 : 1];                                                // cuello
      }
      // Cascos con micrófono (Marcos): diadema, auricular a la derecha y la varilla hacia la boca
      if (p.extra.includes("cascos")) {
        const dxa = (px - cx) / (rx + 1.6), dya = (py - (cy - 1)) / (ry + 1.4);
        if (Math.abs(dxa * dxa + dya * dya - 1) < 0.12 && py < cy - 1) c = "#3a3168";
        if (Math.abs(px - (cx + rx + 0.9)) < 1.1 && Math.abs(py - (cy + 0.5)) < 1.8) c = "#29224d";
        if (py > cy + 1.5 && py < cy + 2.7 && px > cx + 1.8 && px < cx + rx + 0.5) c = "#56436a";
        if (Math.abs(px - (cx + 1.6)) < 0.6 && Math.abs(py - (cy + 2.1)) < 0.6) c = COMUN.magenta;
      }
      if (p.extra.includes("pendientes") && Math.abs(Math.abs(px - cx) - (rx + 0.2)) < 0.6 && Math.abs(py - (cy + 2.4)) < 0.6) c = "#f2fdff";
      if (c) figura.add(y * W + x);
      rejilla[y].push(c);
    }
  }
  // Fondo con líneas de barrido y contorno oscuro alrededor de la figura
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (rejilla[y][x]) continue;
    const cerca = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => figura.has((y + b) * W + x + a) && x + a >= 0 && x + a < W);
    let c = COMUN.fondo[tramar(0.9 - y / H * 0.7, x, y, 3, 1)];
    if (y % 2) c = COMUN.fondo[0];
    rejilla[y][x] = cerca ? COMUN.contorno : c;
  }
  let rects = "";
  for (let y = 0; y < H; y++) for (let x = 0; x < W;) {
    let n = 1;
    while (x + n < W && rejilla[y][x + n] === rejilla[y][x]) n++;
    rects += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${rejilla[y][x]}"/>`;
    x += n;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * ESCALA}" height="${H * ESCALA}" shape-rendering="crispEdges">` +
    `<title>${p.titulo}</title>${rects}</svg>\n`;
}

const dir = fileURLToPath(new URL("../recursos/retratos/", import.meta.url));
mkdirSync(dir, { recursive: true });
for (const [id, p] of Object.entries(PERSONAJES)) {
  const svg = retrato(id, p);
  writeFileSync(dir + id + ".svg", svg);
  console.log(`✅ recursos/retratos/${id}.svg (${(svg.length / 1024).toFixed(1)} KB)`);
}
