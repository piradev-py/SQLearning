// Pasa todas las baterías, una detrás de otra (comparten puertos), y resume.
// Uso: npm test   (o: node tests/navegador/todos.mjs)
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const BATERIAS = ["esc-motor.mjs", "esc-papel.mjs", "esc-verificar.mjs", "esc-laboratorio.mjs", "esc-inicio.mjs", "esc-leccion.mjs", "esc-musica.mjs", "esc-sin-conexion.mjs"];
let malas = 0;
for (const b of BATERIAS) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [join(DIR, "cdp.mjs"), b], { encoding: "utf8", timeout: 600000 });
  const salida = (r.stdout || "") + (r.stderr || "");
  const fallo = /❌|ERROR DEL ESCENARIO|Errores JS en la página/.test(salida) || r.status !== 0;
  if (fallo) malas++;
  console.log(`${fallo ? "❌" : "✅"} ${b} (${Math.round((Date.now() - t0) / 1000)} s)`);
  if (fallo) console.log(salida.split("\n").filter(l => /❌|⚠️|ERROR/.test(l)).map(l => "    " + l).join("\n"));
}
console.log(malas ? `\n❌ ${malas} de ${BATERIAS.length} baterías con fallos` : `\n✅ Las ${BATERIAS.length} baterías pasan`);
process.exitCode = malas ? 1 : 0;
