/* ============================================================
   SQLearning · Worker del motor SQL (módulo)
   Ejecuta PostgreSQL (PGlite) fuera del hilo principal. Si una
   consulta no termina, js/motor-sql.js mata este worker y crea
   otro, así la página nunca se congela.
   Mensajes: { id, tipo, ... } → { id, ok, datos | error }
   ============================================================ */
import { PGlite } from "../vendor/pglite/index.js";

// Fechas, horas y numéricos llegan como texto tal cual los escribe PostgreSQL
// (sin zonas horarias del navegador ni pérdida de decimales). Los enteros grandes, como número.
const TEXTO = v => v;
const PARSERS = {
  1082: TEXTO, 1083: TEXTO, 1114: TEXTO, 1184: TEXTO, 1186: TEXTO, // date, time, timestamp, timestamptz, interval
  1700: TEXTO,                                                     // numeric
  20: v => Number(v)                                               // bigint (count(*), sum de enteros…)
};

// Nombres legibles de los tipos más habituales (para el esquema y la revisión)
const TIPOS = {
  16: "boolean", 20: "bigint", 21: "smallint", 23: "integer", 25: "text", 700: "real", 701: "double precision",
  1043: "varchar", 1042: "char", 1082: "date", 1083: "time", 1114: "timestamp", 1184: "timestamptz",
  1186: "interval", 1700: "numeric", 2950: "uuid", 114: "json", 3802: "jsonb"
};

let db = null;

function limpiarFila(fila) {
  return fila.map(v => {
    if (v instanceof Uint8Array) return "\\x" + [...v].map(b => b.toString(16).padStart(2, "0")).join("");
    if (typeof v === "bigint") return Number(v);
    if (v !== null && typeof v === "object") return JSON.stringify(v);
    return v;
  });
}

function resultado(r) {
  return {
    columnas: (r.fields || []).map(f => f.name),
    tipos: (r.fields || []).map(f => TIPOS[f.dataTypeID] || "otro"),
    filas: (r.rows || []).map(limpiarFila),
    afectadas: r.affectedRows ?? 0
  };
}

function error(e) {
  return {
    mensaje: e?.message || String(e),
    codigo: e?.code || null,           // SQLSTATE, p. ej. 42P01 = la tabla no existe
    posicion: e?.position ? Number(e.position) : null, // carácter (desde 1) donde falla
    detalle: e?.detail || null,
    pista: e?.hint || null
  };
}

const ACCIONES = {
  async iniciar({ sql }) {
    if (db) { try { await db.close(); } catch (e) { /* da igual */ } }
    db = await PGlite.create({ parsers: PARSERS });
    if (sql) await db.exec(sql);
    return true;
  },
  // Ejecuta una o varias sentencias; devuelve el resultado de cada una
  async ejecutar({ sql }) {
    const lista = await db.exec(sql, { rowMode: "array" });
    return lista.map(resultado);
  },
  // Una sola sentencia con parámetros ($1, $2…): para consultas internas del motor
  async consultar({ sql, params }) {
    return resultado(await db.query(sql, params || [], { rowMode: "array" }));
  },
  async estadoTransaccion() {
    // ¿Hay una transacción abierta? (para no dejar la base a medias)
    const r = await db.query("SELECT now() = statement_timestamp() AS fuera", [], { rowMode: "array" });
    return r.rows[0][0] ? "fuera" : "dentro";
  }
};

// Los mensajes se atienden de uno en uno, en el orden en que llegan
let turno = Promise.resolve();
self.addEventListener("message", ev => {
  turno = turno.then(async () => {
    const { id, tipo, ...args } = ev.data;
    try {
      if (!db && tipo !== "iniciar") throw new Error("El motor aún no está listo");
      const datos = await ACCIONES[tipo](args);
      self.postMessage({ id, ok: true, datos });
    } catch (e) {
      self.postMessage({ id, ok: false, error: error(e) });
    }
  });
});

self.postMessage({ id: 0, ok: true, datos: "cargado" });
