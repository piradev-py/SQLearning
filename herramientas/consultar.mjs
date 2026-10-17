// Consulta los datos de una etapa con el mismo PostgreSQL del navegador (PGlite), desde Node.
// Uso: node herramientas/consultar.mjs faro-e7 "SELECT COUNT(*) FROM pedidos;"
import { readFileSync } from "node:fs";
import { PGlite } from "../vendor/pglite/index.js";

const [datos, ...consultas] = process.argv.slice(2);
const db = new PGlite();
await db.exec(readFileSync(new URL(`../datos/${datos}.sql`, import.meta.url), "utf8"));
for (const sql of consultas) {
  const r = await db.query(sql);
  console.table(r.rows);
}
