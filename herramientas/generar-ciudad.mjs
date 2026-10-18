// Dibuja la ciudad neón de SQLearning (rascacielos con contornos magenta y cian + el faro de Faro).
// Semilla fija: siempre sale la misma ciudad. Es un dibujo propio (sin recursos de terceros).
// Uso: node herramientas/generar-ciudad.mjs  →  recursos/ciudad-neon.svg
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SALIDA = fileURLToPath(new URL("../recursos/", import.meta.url));
mkdirSync(SALIDA, { recursive: true });

function azar(s) {
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = azar(2077);
const entre = (a, b) => a + rnd() * (b - a);
const r1 = n => Math.round(n * 10) / 10;

const ANCHO = 1600, ALTO = 420, SUELO = 420;
const FARO_X = 1130;                    // hueco para el faro

// Silueta de un edificio (lista de puntos), según el tipo de tejado
function silueta(x, w, h, tipo) {
  const y = SUELO - h;
  switch (tipo) {
    case "inclinado": return [[x, SUELO], [x, y + w * 0.35], [x + w, y], [x + w, SUELO]];
    case "escalon": return [[x, SUELO], [x, y + 40], [x + w * 0.25, y + 40], [x + w * 0.25, y], [x + w * 0.75, y], [x + w * 0.75, y + 40], [x + w, y + 40], [x + w, SUELO]];
    case "aguja": return [[x, SUELO], [x, y + 30], [x + w / 2, y - 10], [x + w, y + 30], [x + w, SUELO]];
    case "chaflan": return [[x, SUELO], [x, y + 18], [x + 18, y], [x + w - 18, y], [x + w, y + 18], [x + w, SUELO]];
    default: return [[x, SUELO], [x, y], [x + w, y], [x + w, SUELO]];
  }
}
const ruta = pts => "M" + pts.map(([a, b]) => `${r1(a)} ${r1(b)}`).join(" L") + " Z";

function capa({ cantidad, altoMin, altoMax, anchoMin, anchoMax, color, ventana, opacidad, antenas }) {
  let svg = `<g opacity="${opacidad}">`;
  let x = -20;
  const tipos = ["plano", "inclinado", "escalon", "aguja", "chaflan", "plano"];
  for (let i = 0; i < cantidad && x < ANCHO; i++) {
    const w = entre(anchoMin, anchoMax);
    if (x + w > FARO_X - 45 && x < FARO_X + 45) { x = FARO_X + 45; continue; } // deja sitio al faro
    const h = entre(altoMin, altoMax) * (x > 500 && x < 900 ? 1.15 : 1);    // más altos en el centro
    const tipo = tipos[Math.floor(rnd() * tipos.length)];
    svg += `<path d="${ruta(silueta(x, w, h, tipo))}" fill="#06050d" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>`;
    // Ventanas encendidas
    const filas = Math.floor((h - 50) / 14), cols = Math.max(1, Math.floor((w - 12) / 10));
    for (let f = 0; f < filas; f++)
      for (let c = 0; c < cols; c++)
        if (rnd() < 0.16) svg += `<rect x="${r1(x + 7 + c * 10)}" y="${r1(SUELO - h + 45 + f * 14)}" width="4" height="6" fill="${ventana}" opacity="${r1(entre(0.2, 0.6))}"/>`;
    // Antenas
    if (antenas && rnd() < 0.35 && tipo !== "aguja")
      svg += `<line x1="${r1(x + w / 2)}" y1="${r1(SUELO - h)}" x2="${r1(x + w / 2)}" y2="${r1(SUELO - h - entre(20, 60))}" stroke="${color}" stroke-width="1.5"/>`;
    x += w + entre(2, 14);
  }
  return svg + "</g>";
}

// El faro: torre troncocónica con franjas, linterna y haz de luz
function faro() {
  const base = 70, arriba = 34, h = 300, cx = FARO_X, y = SUELO - h;
  const torre = [[cx - base / 2, SUELO], [cx - arriba / 2, y], [cx + arriba / 2, y], [cx + base / 2, SUELO]];
  let svg = `<g>`;
  svg += `<polygon points="${cx},${y - 18} ${cx - 820},${y - 95} ${cx - 820},${y + 25}" fill="url(#haz)" filter="url(#difuso)"/>`;
  svg += `<path d="${ruta(torre)}" fill="#06050d" stroke="#3f8a98" stroke-width="2.5" stroke-linejoin="round"/>`;
  for (let k = 1; k <= 3; k++) {
    const yy = SUELO - (h * k) / 4, ancho = base - ((base - arriba) * k) / 4;
    svg += `<line x1="${cx - ancho / 2}" y1="${yy}" x2="${cx + ancho / 2}" y2="${yy}" stroke="#8f3f73" stroke-width="2"/>`;
  }
  svg += `<rect x="${cx - 22}" y="${y - 6}" width="44" height="6" fill="#06050d" stroke="#3f8a98" stroke-width="2"/>`;
  svg += `<rect x="${cx - 13}" y="${y - 30}" width="26" height="24" fill="#06050d" stroke="#3f8a98" stroke-width="2"/>`;
  svg += `<circle cx="${cx}" cy="${y - 18}" r="7" fill="#c9a66b"/>`;
  svg += `<path d="M${cx - 16} ${y - 30} L${cx} ${y - 46} L${cx + 16} ${y - 30} Z" fill="#06050d" stroke="#8f3f73" stroke-width="2"/>`;
  return svg + "</g>";
}

// Carteles de neón con letras de píxeles (un SVG en <img> no carga fuentes): FARO, el almacén de GETAFE y un BAR
const LETRAS = { A: "010101111101101", B: "110101110101110", E: "111100110100111", F: "111100110100100",
  G: "111100101101111", O: "111101101101111", R: "110101110101101", T: "111010010010010" };
function cartel(texto, x, y, p, color, vertical = false) {
  const paso = 3 * p + p, alto = 5 * p + p;
  const w = vertical ? paso + p : texto.length * paso + p, h = vertical ? texto.length * alto + p : alto + p;
  let svg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#06050d" stroke="${color}" stroke-width="1.5"/>`;
  [...texto].forEach((l, k) => [...LETRAS[l]].forEach((b, n) => {
    if (b !== "1") return;
    const x0 = x + p + (vertical ? 0 : k * paso) + (n % 3) * p, y0 = y + p + (vertical ? k * alto : 0) + Math.floor(n / 3) * p;
    svg += `<rect x="${x0}" y="${y0}" width="${p}" height="${p}" fill="${color}"/>`;
  }));
  return svg;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ANCHO} ${ALTO}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
<defs>
  <filter id="brillo" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="2" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="difuso" x="-30%" y="-150%" width="160%" height="400%"><feGaussianBlur stdDeviation="6"/></filter>
  <linearGradient id="haz" x1="1" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="#c9a66b" stop-opacity="0.22"/>
    <stop offset="1" stop-color="#c9a66b" stop-opacity="0"/>
  </linearGradient>
</defs>
<g filter="url(#brillo)">
${capa({ cantidad: 60, altoMin: 120, altoMax: 330, anchoMin: 28, anchoMax: 70, color: "#2c6672", ventana: "#4fa3b3", opacidad: 0.5, antenas: true })}
${faro()}
${capa({ cantidad: 60, altoMin: 60, altoMax: 210, anchoMin: 40, anchoMax: 95, color: "#7a3462", ventana: "#b0629a", opacidad: 0.85, antenas: false })}
<g opacity="0.9">${cartel("FARO", 372, 292, 4, "#d0569f", true)}${cartel("GETAFE", 812, 362, 3, "#4fa3b3")}${cartel("BAR", 1352, 372, 3, "#c9a66b")}</g>
</g>
</svg>
`;
writeFileSync(SALIDA + "ciudad-neon.svg", svg);
console.log("✅ recursos/ciudad-neon.svg (" + Math.round(svg.length / 1024) + " KB)");
