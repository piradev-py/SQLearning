// Mini controlador de Edge por DevTools Protocol para probar SQLearning.
// Arranca el servidor local (PGlite necesita http) y Edge sin ventana.
// Uso: node tests/navegador/cdp.mjs <escenario.mjs>
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(DIR, "..", "..");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PUERTO_CDP = 9334;
const PUERTO_WEB = 8099;
const BASE = `http://localhost:${PUERTO_WEB}/`;
const perfil = join(DIR, "perfil-cdp-" + Date.now());
mkdirSync(perfil, { recursive: true });

const esperar = ms => new Promise(r => setTimeout(r, ms));

const servidor = spawn(process.execPath, [join(RAIZ, "herramientas", "servir.mjs"), String(PUERTO_WEB)], { stdio: "ignore" });
const proc = spawn(EDGE, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars",
  "--remote-debugging-port=" + PUERTO_CDP, "--user-data-dir=" + perfil, "about:blank"
], { stdio: "ignore" });

async function objetivo() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PUERTO_CDP}/json`);
      const p = (await r.json()).find(t => t.type === "page");
      if (p) return p.webSocketDebuggerUrl;
    } catch (e) { /* aún arrancando */ }
    await esperar(200);
  }
  throw new Error("Edge no arrancó");
}

const ws = new WebSocket(await objetivo());
await new Promise(r => ws.addEventListener("open", r));
let idMsg = 0;
const pendientes = new Map();
const errores = [];
ws.addEventListener("message", ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pendientes.has(m.id)) {
    pendientes.get(m.id)(m);
    pendientes.delete(m.id);
  } else if (m.method === "Runtime.exceptionThrown") {
    errores.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  } else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
    errores.push("console.error: " + m.params.args.map(a => a.value || a.description).join(" "));
  } else if (m.method === "Page.javascriptDialogOpening") {
    enviar("Page.handleJavaScriptDialog", { accept: true });
  }
});
function enviar(method, params = {}) {
  const id = ++idMsg;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise(r => pendientes.set(id, r));
}

await enviar("Page.enable");
await enviar("Runtime.enable");

const api = {
  BASE,
  esperar,
  errores,
  async ir(ruta) {
    await enviar("Page.navigate", { url: ruta.startsWith("http") ? ruta : BASE + ruta });
    await esperar(1000);
  },
  async eval(expr) {
    const r = await enviar("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error("eval: " + JSON.stringify(r.result.exceptionDetails.exception?.description));
    return r.result?.result?.value;
  },
  /** Espera hasta que expr sea verdadera (o se acabe el tiempo). */
  async hasta(expr, ms = 60000) {
    const fin = Date.now() + ms;
    while (Date.now() < fin) {
      if (await api.eval(expr)) return true;
      await esperar(300);
    }
    return false;
  },
  async tam(ancho, alto) {
    await enviar("Emulation.setDeviceMetricsOverride", { width: ancho, height: alto, deviceScaleFactor: 1, mobile: false });
  },
  async oscuro(si) {
    await enviar("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: si ? "dark" : "light" }] });
  },
  async reducido() { await enviar("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] }); },
  async foto(nombre) {
    const r = await enviar("Page.captureScreenshot", { format: "png" });
    mkdirSync(join(DIR, "salida"), { recursive: true });
    const ruta = join(DIR, "salida", nombre + ".png");
    writeFileSync(ruta, Buffer.from(r.result.data, "base64"));
    console.log("📸 " + ruta);
  },
  cdp: enviar,
  log: (...a) => console.log(...a)
};

try {
  const escenario = await import(pathToFileURL(join(DIR, process.argv[2])).href);
  await escenario.default(api);
} catch (e) {
  console.log("❌ ERROR DEL ESCENARIO:", e.message);
} finally {
  console.log(errores.length ? "⚠️ Errores JS en la página:\n - " + errores.join("\n - ") : "✅ Sin errores JS en la página");
  ws.close();
  proc.kill();
  servidor.kill();
  await esperar(500);
  try { rmSync(perfil, { recursive: true, force: true }); } catch (e) {}
}
