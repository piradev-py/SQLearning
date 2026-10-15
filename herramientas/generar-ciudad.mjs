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
    svg += `<path d="${ruta(silueta(x, w, h, tipo))}" fill="#0a0622" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>`;
    // Ventanas encendidas
    const filas = Math.floor((h - 50) / 14), cols = Math.max(1, Math.floor((w - 12) / 10));
    for (let f = 0; f < filas; f++)
      for (let c = 0; c < cols; c++)
        if (rnd() < 0.16) svg += `<rect x="${r1(x + 7 + c * 10)}" y="${r1(SUELO - h + 45 + f * 14)}" width="4" height="6" fill="${ventana}" opacity="${r1(entre(0.35, 0.95))}"/>`;
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
  svg += `<polygon points="${cx},${y - 14} ${cx - 900},${y - 160} ${cx - 900},${y + 40}" fill="url(#haz)"/>`;
  svg += `<path d="${ruta(torre)}" fill="#0a0622" stroke="#22e4ff" stroke-width="2.5" stroke-linejoin="round"/>`;
  for (let k = 1; k <= 3; k++) {
    const yy = SUELO - (h * k) / 4, ancho = base - ((base - arriba) * k) / 4;
    svg += `<line x1="${cx - ancho / 2}" y1="${yy}" x2="${cx + ancho / 2}" y2="${yy}" stroke="#ff3cac" stroke-width="2"/>`;
  }
  svg += `<rect x="${cx - 22}" y="${y - 6}" width="44" height="6" fill="#0a0622" stroke="#22e4ff" stroke-width="2"/>`;
  svg += `<rect x="${cx - 13}" y="${y - 30}" width="26" height="24" fill="#0a0622" stroke="#22e4ff" stroke-width="2"/>`;
  svg += `<circle cx="${cx}" cy="${y - 18}" r="7" fill="#ffd166"/>`;
  svg += `<path d="M${cx - 16} ${y - 30} L${cx} ${y - 46} L${cx + 16} ${y - 30} Z" fill="#0a0622" stroke="#ff3cac" stroke-width="2"/>`;
  return svg + "</g>";
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ANCHO} ${ALTO}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
<defs>
  <filter id="brillo" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="3" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <linearGradient id="haz" x1="1" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="#ffd166" stop-opacity="0.45"/>
    <stop offset="1" stop-color="#ffd166" stop-opacity="0"/>
  </linearGradient>
</defs>
<g filter="url(#brillo)">
${capa({ cantidad: 60, altoMin: 120, altoMax: 330, anchoMin: 28, anchoMax: 70, color: "#22e4ff", ventana: "#22e4ff", opacidad: 0.55, antenas: true })}
${faro()}
${capa({ cantidad: 60, altoMin: 60, altoMax: 210, anchoMin: 40, anchoMax: 95, color: "#ff3cac", ventana: "#ff8ad4", opacidad: 1, antenas: false })}
</g>
</svg>
`;
writeFileSync(SALIDA + "ciudad-neon.svg", svg);
console.log("✅ recursos/ciudad-neon.svg (" + Math.round(svg.length / 1024) + " KB)");
