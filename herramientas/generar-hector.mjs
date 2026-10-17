// Retrato en pixel art de Héctor Vidal para el expediente final (caso-cerrado.html) → recursos/hector-pixel.svg
// Sin dibujos a mano: formas sencillas (elipses y trapecios) iluminadas como en la escena neón, luz magenta por la
// izquierda y borde cian por la derecha, cuantizadas a una paleta corta con tramado ordenado (Bayer 4×4).
// Héctor según HISTORIA.md: jefe de logística, simpático y servicial «demasiado»; media sonrisa, sienes canosas,
// chaleco de alta visibilidad con bandas reflectantes y la tarjeta de Faro. Detrás, la regla de alturas.
// Uso: node herramientas/generar-hector.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const W = 100, H = 112, ESCALA = 6;
const cx = 62.5, cy = 40, rx = 17, ry = 21;
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
// Nivel de la paleta (0…n−1) con un tramado suave: solo mezcla en las fronteras entre tonos
const tramar = (v, x, y, n, fuerza = 0.45) =>
  Math.max(0, Math.min(n - 1, Math.floor(v * n + (BAYER[y & 3][x & 3] / 16 - 0.5) * fuerza)));

const C = {
  fondo: ["#0f0826", "#160b33", "#1d0f40", "#24124d"],
  regla: "#c23d8f", reglaSuave: "#6b2465", numero: "#e0559f",
  piel: ["#2e173d", "#5e2f55", "#9a4f6a", "#d47a86", "#f2aab0"],
  pelo: ["#120b1c", "#24172f", "#3b2a4b", "#56436a"],
  canas: ["#4a4258", "#6f6884", "#9a93ad"],
  chaqueta: ["#0d0a1c", "#1a1533", "#29224d", "#3a3168"],
  chaleco: ["#5e2234", "#93393a", "#c45a3c", "#e88446"],
  reflectante: ["#7fb7cc", "#c8f1ff", "#f2fdff"],
  polo: ["#3b3656", "#8c86a8", "#c9c3de"],
  ojoBlanco: "#d6d0e8", iris: "#2a2450", brillo: "#7fe3ff",
  labio: "#4a1830", labioLuz: "#d88088", ceja: "#24172f",
  cianBorde: "#6fd6f2", cianBorde2: "#4f9fc4", magentaBorde: "#ff6db2",
  tarjeta: "#e6e1f2", tarjetaSombra: "#a59fbe", cinta: "#45c4de", contorno: "#08040f"
};

// --- Formas ---------------------------------------------------------------------
const cabeza = (x, y) => {
  const dy = (y - cy) / ry;
  const rxe = rx * (dy > 0 ? 1 - 0.32 * dy * dy : 1 - 0.04 * dy * dy);
  const dx = (x - cx) / rxe;
  return dx * dx + dy * dy <= 1 ? { nx: dx, ny: dy } : null;
};
const pelo = (x, y) => {
  const dxn = (x - cx) / rx;
  // Raya a la izquierda (más volumen a la derecha) y un borde superior algo irregular
  const arriba = (x > cx - 6 ? ry + 3.6 : ry + 2.6) + 0.7 * Math.sin(x * 1.3);
  const dy = (y - (cy - 0.5)) / (y < cy ? arriba : ry);
  const dx = (x - cx) / (rx + 2);
  if (dx * dx + dy * dy > 1) return null;
  // Flequillo peinado hacia la derecha, entradas suaves y patillas
  const linea = Math.abs(dxn) > 0.88 ? cy + 4 : cy - 13 + 2 * dxn + 5 * dxn ** 4 + (x % 3 === 0 ? 1.2 : x % 5 === 0 ? 0.6 : 0);
  return y < linea ? { nx: dx, ny: dy, lado: Math.abs(dxn) } : null;
};
const oreja = (x, y) => {
  for (const s of [-1, 1]) {
    const dx = (x - (cx + s * (rx + 0.3))) / 2.8, dy = (y - (cy + 2)) / 5.2;
    if (dx * dx + dy * dy <= 1) return { s, nx: dx };
  }
  return null;
};
const hombros = cy + ry + 1;
const anchoCuerpo = y => y < hombros ? -1 : 11 + 23 * Math.min(1, Math.sqrt((y - hombros) / 11));

// --- Luz ------------------------------------------------------------------------
const L = [-0.55, -0.2, 0.81];
const luz = (nx, ny) => {
  const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
  return Math.max(0, L[0] * nx + L[1] * ny + L[2] * nz);
};

// --- Cara: rasgos en píxeles desde el centro de la cabeza (dx, dy); devuelve un color o un ajuste de tono --------
function rasgo(dx, dy, x, y, i) {
  const ax = Math.abs(dx), damero = (x + y) % 2 === 1;
  const oscuro = C.piel[Math.max(0, i - 1)], claro = C.piel[Math.min(4, i + 1)];
  // Cejas arqueadas
  const cejaY = -7.4 - 0.7 * Math.sin(Math.PI * Math.min(1, Math.max(0, (ax - 3.4) / 8.6)));
  if (ax > 3.4 && ax < 12 && Math.abs(dy - cejaY) < (ax < 6 ? 0.55 : 0.85)) return C.ceja;
  // Ojos: párpado, dos filas (blanco, iris de 2 px con brillo) y ojeras
  const ex = ax - 7.6, exs = dx < 0 ? -ex : ex;                     // exs: hacia la izquierda de la imagen en los dos
  if (Math.abs(dy + 4.4) < 0.55 && Math.abs(ex) < 3.4) return C.piel[0];
  if (Math.abs(dy + 3.4) < 0.5 && Math.abs(ex) < 3.1) return Math.abs(exs + 0.4) < 1.05 ? (Math.abs(exs + 0.9) < 0.5 ? C.brillo : C.iris) : C.ojoBlanco;
  if (Math.abs(dy + 2.4) < 0.5 && Math.abs(ex) < 2.3) return Math.abs(exs + 0.4) < 1.05 ? C.iris : C.ojoBlanco;
  if (Math.abs(dy + 1.3) < 0.5 && Math.abs(ex) < 2.6 && damero) return oscuro;
  // Nariz: puente iluminado, lado en sombra, punta, aletas y sombra debajo
  if (dx > -1.4 && dx < -0.2 && dy > -3 && dy < 4) return claro;
  if (dx > 0.8 && dx < 2.3 && dy > -2 && dy < 5.6) return oscuro;
  if (Math.abs(dx + 0.3) < 2.2 && Math.abs(dy - 5.9) < 0.55) return claro;
  if (Math.abs(dy - 7) < 0.55 && (Math.abs(dx + 2.3) < 0.7 || Math.abs(dx - 2.5) < 0.7)) return C.labio;
  if (Math.abs(dy - 7.9) < 0.5 && ax < 1.6) return oscuro;
  // Surcos de la sonrisa, bigote corto, boca con las comisuras hacia arriba
  if (dy > 6.5 && dy < 11 && Math.abs(ax - (5.2 + (dy - 6.5) * 0.35)) < 0.5) return oscuro;
  if (Math.abs(dy - 9.2) < 0.6 && ax < 4.6 && damero) return oscuro;
  if (Math.abs(dy - 11.5) < 0.55 && ax < 5.6) return C.labio;
  if (Math.abs(dy - 10.6) < 0.55 && Math.abs(ax - 6.4) < 0.9) return C.labio;
  if (Math.abs(dy - 9.7) < 0.5 && Math.abs(ax - 7.3) < 0.5) return oscuro;            // hoyuelo de la sonrisa
  if (Math.abs(dy - 12.6) < 0.55 && ax < 3.6) return C.labioLuz;
  if (Math.abs(dy - 14) < 0.5 && ax < 2.6) return oscuro;
  // Barba de dos días en la mandíbula
  if (dy > 13.5 && x % 2 === 0 && y % 2 === 0 && i >= 2) return oscuro;
  return C.piel[i];
}

// --- Píxel a píxel ----------------------------------------------------------------
const rejilla = [];
const FIGURA = new Set();
for (let y = 0; y < H; y++) {
  rejilla.push([]);
  for (let x = 0; x < W; x++) {
    const px = x + 0.5, py = y + 0.5;
    let c = null;
    const h = pelo(px, py), cab = cabeza(px, py), o = oreja(px, py), ancho = anchoCuerpo(py), ax = Math.abs(px - cx);

    if (ancho > 0 && ax <= ancho && py > hombros + 0.5) {
      // Ropa: polo con cuello, chaleco de alta visibilidad abierto, chaqueta en los brazos, tarjeta con su cinta
      const nx = (px - cx) / ancho, dy = py - hombros;
      const i = tramar(0.62 - 0.42 * nx - 0.004 * dy, x, y, 4, 0.25);
      if (ax < 8.5 - dy * 0.45 && dy < 9) c = ax < 4.5 - dy * 0.6 ? C.piel[1] : C.polo[dy < 2.5 ? 2 : nx > 0 ? 0 : 1];
      else if (ax < 8) c = C.polo[0];
      else if (ax < 29) {
        const banda = (dy >= 19 && dy < 21.5) || (dy >= 30 && dy < 32.5);
        c = banda ? C.reflectante[nx > 0.3 ? 0 : tramar(0.9 - 0.3 * nx, x, y, 3)] : C.chaleco[i];
        if (ax < 9.5) c = C.chaleco[0];                                    // sombra del borde del chaleco
      } else c = C.chaqueta[i];
      if (nx > 0.94) c = C.cianBorde2;
      if (nx < -0.96) c = C.magentaBorde;
      // Tarjeta de Faro colgada de una cinta
      const tx = px - (cx - 23), ty = py - (hombros + 12);
      if (tx >= 0 && tx < 8 && ty >= 0 && ty < 11)
        c = ty < 3 ? C.regla : tx >= 6.5 || ty >= 10 ? C.tarjetaSombra : (tx >= 1 && tx < 4 && ty >= 4 && ty < 8) ? C.chaqueta[2] : (tx >= 5 && tx < 6 && ty >= 4 && ty < 8) ? C.tarjetaSombra : C.tarjeta;
      const t = (py - (hombros + 1)) / 11;
      if (t >= 0 && t <= 1 && Math.abs(px - (cx - 7 - 12.5 * t)) < 0.65) c = C.cinta;
    } else if (h) {
      const canoso = h.lado > 0.84 && py > cy - 9 && (x + y) % 3 !== 0;   // sienes canosas, mezcladas con el pelo oscuro
      let i = tramar(luz(h.nx, h.ny) * 0.98, x, y, canoso ? 3 : 4);
      if ((x * 2 + y) % 6 === 0 && i > 0) i--;                           // mechones
      if ((x + y * 3) % 11 === 0 && i < 3 && !canoso) i++;
      c = canoso ? C.canas[i] : C.pelo[i];
      if (h.nx > 0.86 && h.ny < 0.25) c = C.cianBorde;
      if (h.nx < -0.9 && h.ny < -0.2) c = C.magentaBorde;
      if (Math.abs(px - (cx - 6)) < 0.5 && py < cy - 15) c = C.pelo[0];     // raya
    } else if (cab) {
      const i = tramar(Math.min(1, luz(cab.nx, cab.ny) * 1.12 + 0.04), x, y, 5);
      c = rasgo(px - cx, py - cy, x, y, i);
      const esPiel = C.piel.includes(c);
      if (esPiel && cab.nx > 0.86) c = cab.nx > 0.94 ? C.cianBorde : C.cianBorde2;
      if (esPiel && cab.nx < -0.86) c = cab.nx < -0.93 ? C.magentaBorde : C.piel[4];
    } else if (o) {
      c = o.s > 0 ? (o.nx > 0.45 ? C.cianBorde2 : C.piel[2]) : (o.nx < -0.45 ? C.magentaBorde : C.piel[3]);
      if (Math.abs(o.nx) < 0.3) c = C.piel[1];
    } else if (ax < 8.8 && py > cy + 12 && py <= hombros + 1) {
      c = C.piel[py < cy + ry - 1 ? 0 : tramar(0.45 - 0.3 * (px - cx) / 8.8, x, y, 3)];   // cuello con la sombra de la barbilla
      if (px - cx > 7.6) c = C.cianBorde2;
    }
    if (c) FIGURA.add(y * W + x);
    rejilla[y].push(c);
  }
}

// --- Fondo: pared con la regla de alturas, líneas de barrido y contorno de la figura -------------
const DIGITOS = { 0: "111101101101111", 1: "010110010010111", 4: "101101111001001", 5: "111100111001111",
  6: "111100111101111", 7: "111001010010010", 8: "111101111101111", 9: "111101111001111" };
const LINEAS = [[10, "190"], [28, "180"], [46, "170"], [64, "160"], [82, "150"], [100, "140"]];
const numero = new Set();
for (const [fila, txt] of LINEAS) [...txt].forEach((d, k) => [...DIGITOS[d]].forEach((b, n) => {
  if (b !== "1") return;
  const x0 = 2 + k * 8 + (n % 3) * 2, y0 = fila - 4 + Math.floor(n / 3) * 2;
  for (const [a, bb] of [[0, 0], [1, 0], [0, 1], [1, 1]]) numero.add((y0 + bb) * W + x0 + a);   // dígitos a doble tamaño
}));
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (rejilla[y][x]) continue;
  const cerca = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => x + a >= 0 && x + a < W && FIGURA.has((y + b) * W + x + a));
  let c = C.fondo[tramar(0.85 - y / H * 0.6 - Math.abs(x - cx) / W * 0.5, x, y, 4, 1)];
  if (y % 2) c = C.fondo[Math.max(0, C.fondo.indexOf(c) - 1)];
  if (LINEAS.some(([f]) => f === y) && x >= 28) c = x % 8 === 0 ? C.reglaSuave : C.regla;
  if (numero.has(y * W + x)) c = C.numero;
  rejilla[y][x] = cerca ? C.contorno : c;
}

// --- SVG: tramos horizontales del mismo color -------------------------------------
let rects = "";
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W;) {
    let n = 1;
    while (x + n < W && rejilla[y][x + n] === rejilla[y][x]) n++;
    rects += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${rejilla[y][x]}"/>`;
    x += n;
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * ESCALA}" height="${H * ESCALA}" shape-rendering="crispEdges">` +
  `<title>Héctor Vidal ante la regla de alturas</title>${rects}</svg>\n`;
writeFileSync(fileURLToPath(new URL("../recursos/hector-pixel.svg", import.meta.url)), svg);
console.log(`✅ recursos/hector-pixel.svg (${W}×${H}, ${(svg.length / 1024).toFixed(0)} KB)`);
