// Genera los datos de Faro para cada etapa: datos/faro-eN.sql
// Semilla fija → siempre salen los mismos datos (las soluciones de las lecciones no cambian).
// Uso: node herramientas/generar-datos.mjs
// ⚠️ Si cambias algo, vuelve a pasar los tests: las lecciones citan cifras de estos datos.
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SALIDA = fileURLToPath(new URL("../datos/", import.meta.url));
mkdirSync(SALIDA, { recursive: true });

// --- Azar con semilla (mulberry32) ---------------------------------------
function azar(semilla) {
  return () => {
    semilla |= 0; semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = azar(1998);
const entero = (min, max) => min + Math.floor(rnd() * (max - min + 1));
const fecha = (desde, hasta) => {
  const a = Date.UTC(...desde), b = Date.UTC(...hasta);
  return new Date(a + Math.floor(rnd() * ((b - a) / 86400000)) * 86400000).toISOString().slice(0, 10);
};

// --- Escribir SQL ----------------------------------------------------------
const lit = v => v === null || v === undefined ? "NULL"
  : typeof v === "number" ? String(v)
  : typeof v === "boolean" ? (v ? "TRUE" : "FALSE")
  : "'" + String(v).replace(/'/g, "''") + "'";
function insertar(tabla, columnas, filas) {
  return `INSERT INTO ${tabla} (${columnas.join(", ")}) VALUES\n` +
    filas.map(f => "  (" + f.map(lit).join(", ") + ")").join(",\n") + ";\n";
}

// --- Etapa 1: tiendas, empleados, productos --------------------------------
const tiendas = [
  [1, "Madrid", "1998-05-04"],
  [2, "Valencia", "2004-09-20"],
  [3, "Sevilla", "2009-02-11"],
  [4, "Bilbao", "2014-06-02"],
  [5, "Online", "2017-11-15"],
  [6, "Barcelona", "2026-10-01"]   // recién inaugurada: aún sin pedidos
];

// [nombre, departamento, tienda_id]
const empleados = [
  ["Ana Beltrán", "Dirección", 1],
  ["Lucía Mora", "Datos", 1],
  ["Marcos Gil", "Atención al cliente", 5],
  ["Elena Ruiz", "Ventas", 1],
  ["Héctor Vidal", "Logística", 1],
  ["Nuria Campos", "Sistemas", 1],
  ["Iván Soler", "Sistemas", 1],
  ["Pablo Herrero", "Tienda", 1],
  ["Carmen Llorente", "Tienda", 1],
  ["Jorge Navarro", "Tienda", 2],
  ["Sara Ferrer", "Tienda", 2],
  ["Raúl Domínguez", "Tienda", 3],
  ["Inés Romero", "Tienda", 3],
  ["Aitor Etxeberria", "Tienda", 4],
  ["Maite Urquijo", "Tienda", 4],
  ["Diego Castaño", "Atención al cliente", 5],
  ["Laura Peña", "Atención al cliente", 5],
  ["Óscar Medina", "Logística", 1],
  ["Beatriz Soto", "Logística", 1],
  ["Tomás Rivas", "Ventas", 2],
  ["Claudia Reyes", "Ventas", 3],
  ["Rubén Ortega", "Datos", 1]
];
const email = nombre => nombre.toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/\s+/g, ".") + "@faro.example";

// [nombre, categoria, proveedor, precio]
const productos = [
  ["Portátil Lumen 14", "Informática", "Lumen", 749.00],
  ["Portátil Lumen 16 Pro", "Informática", "Lumen", 1199.00],
  ["Monitor Nexo 24\"", "Informática", "Nexo", 159.90],
  ["Monitor Nexo 27\" 4K", "Informática", "Nexo", 329.00],
  ["Teclado Kairos Mecánico", "Informática", "Kairos", 89.90],
  ["Ratón Kairos Inalámbrico", "Informática", "Kairos", 29.90],
  ["Disco SSD Volta 1 TB", "Informática", "Volta", 74.95],
  ["Disco SSD Volta 2 TB", "Informática", "Volta", 139.00],
  ["Webcam Lumen HD", "Informática", "Lumen", 49.90],
  ["Smartphone Nexo A5", "Telefonía", "Nexo", 279.00],
  ["Smartphone Nexo A9 Pro", "Telefonía", "Nexo", 699.00],
  ["Funda Brisa Silicona", "Telefonía", "Brisa", 14.90],
  ["Cargador Volta 30 W", "Telefonía", "Volta", 24.90],
  ["Cargador Volta 65 W", "Telefonía", "Volta", 44.90],
  ["Batería externa Volta 20000", "Telefonía", "Volta", 39.90],
  ["Smartwatch Nexo Fit", "Telefonía", "Nexo", 199.00],
  ["Auriculares Sonora Pulse", "Audio", "Sonora", 129.00],
  ["Auriculares Sonora Air", "Audio", "Sonora", 79.90],
  ["Altavoz Sonora Mini", "Audio", "Sonora", 34.90],
  ["Altavoz Sonora Boom", "Audio", "Sonora", 149.00],
  ["Barra de sonido Sonora 300", "Audio", "Sonora", 249.00],
  ["Tocadiscos Brisa Vintage", "Audio", "Brisa", 119.00],
  ["Micrófono Kairos Stream", "Audio", "Kairos", 69.90],
  ["Robot aspirador Brisa R5", "Hogar", "Brisa", 299.00],
  ["Cafetera Brisa Espresso", "Hogar", "Brisa", 189.00],
  ["Freidora de aire Brisa 5 L", "Hogar", "Brisa", 99.90],
  ["Bombilla Lumen Smart", "Hogar", "Lumen", 12.90],
  ["Enchufe Lumen Smart", "Hogar", "Lumen", 15.90],
  ["Termostato Lumen Eco", "Hogar", "Lumen", 129.00],
  ["Purificador Brisa Aire", "Hogar", "Brisa", 159.00],
  ["Consola Kairos One", "Gaming", "Kairos", 449.00],
  ["Mando Kairos Pro", "Gaming", "Kairos", 69.90],
  ["Auriculares gaming Sonora X", "Gaming", "Sonora", 99.90],
  ["Silla gaming Kairos Throne", "Gaming", "Kairos", 259.00],
  ["Alfombrilla Kairos XL", "Gaming", "Kairos", 19.90],
  ["Volante Kairos Racing", "Gaming", "Kairos", 219.00],
  ["Tarjeta gráfica Volta RX", "Gaming", "Volta", 549.00],
  ["Monitor gaming Nexo 165 Hz", "Gaming", "Nexo", 279.00],
  ["Router Nexo WiFi 6", "Informática", "Nexo", 89.00],
  ["Impresora Lumen Jet", "Informática", "Lumen", 119.00]
];
// Pista del Fantasma (etapa 1): este producto tiene stock imposible
const STOCK_IMPOSIBLE = { nombre: "Auriculares Sonora Pulse", stock: -12 };
const INACTIVOS = new Set(["Tocadiscos Brisa Vintage", "Webcam Lumen HD", "Volante Kairos Racing", "Termostato Lumen Eco"]);

const filasProductos = productos.map(([nombre, categoria, proveedor, precio], i) => {
  const stock = nombre === STOCK_IMPOSIBLE.nombre ? STOCK_IMPOSIBLE.stock
    : INACTIVOS.has(nombre) ? 0 : entero(3, 120);
  return [i + 1, nombre, categoria, precio.toFixed(2) * 1, stock, proveedor, !INACTIVOS.has(nombre), fecha([2019, 0, 1], [2024, 11, 31])];
});

const esquemaE1 = `
CREATE TABLE tiendas (
  id integer PRIMARY KEY,
  ciudad text NOT NULL,
  apertura date NOT NULL
);

CREATE TABLE empleados (
  id integer PRIMARY KEY,
  nombre text NOT NULL,
  departamento text NOT NULL,
  tienda_id integer REFERENCES tiendas (id),
  email text NOT NULL UNIQUE
);

CREATE TABLE productos (
  id integer PRIMARY KEY,
  nombre text NOT NULL,
  categoria text NOT NULL,
  precio numeric(8, 2) NOT NULL,
  stock integer NOT NULL,
  proveedor text NOT NULL,
  activo boolean NOT NULL DEFAULT TRUE,
  creado date NOT NULL
);
`;

function etapa1() {
  return [
    "-- Faro · datos de la etapa 1 (generado por herramientas/generar-datos.mjs; no editar a mano)",
    esquemaE1,
    insertar("tiendas", ["id", "ciudad", "apertura"], tiendas),
    insertar("empleados", ["id", "nombre", "departamento", "tienda_id", "email"],
      empleados.map(([n, d, t], i) => [i + 1, n, d, t, email(n)])),
    insertar("productos", ["id", "nombre", "categoria", "precio", "stock", "proveedor", "activo", "creado"], filasProductos)
  ].join("\n");
}

writeFileSync(SALIDA + "faro-e1.sql", etapa1());
console.log("✅ datos/faro-e1.sql");

// =========================================================================
// Universo de clientes y pedidos (semilla propia: no altera la etapa 1)
// Ver docs/DATOS.md. Una vez escritas las lecciones de una etapa, NO cambiar.
// =========================================================================
function universo() {
  const r = azar(2026);
  const ent = (a, b) => a + Math.floor(r() * (b - a + 1));
  const elegir = lista => lista[Math.floor(r() * lista.length)];
  const ponderado = pares => { let x = r() * pares.reduce((s, [, p]) => s + p, 0); for (const [v, p] of pares) { if ((x -= p) < 0) return v; } return pares[0][0]; };
  const dos = n => String(n).padStart(2, "0");
  const marca = (d, h, m, s) => `${d.toISOString().slice(0, 10)} ${dos(h)}:${dos(m)}:${dos(s)}`;
  const diaEntre = (desde, hasta) => {
    const a = Date.UTC(...desde), b = Date.UTC(...hasta);
    return new Date(a + Math.floor(r() * ((b - a) / 86400000 + 1)) * 86400000);
  };
  const sinTildes = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ñ/g, "n").replace(/\s+/g, "");

  const NOMBRES = ["Lucas", "Martina", "Hugo", "Sofía", "Mateo", "Lucía", "Leo", "Valeria", "Daniel", "Paula", "Pablo", "Julia",
    "Álvaro", "Emma", "Adrián", "Carla", "Mario", "Alba", "Diego", "Noa", "Javier", "Irene", "Marcos", "Sara", "Iker", "Nerea",
    "Jon", "Ane", "Rocío", "Manuel", "Carmen", "Antonio", "Pilar", "Raúl", "Elena", "Iratxe", "Gorka", "Macarena", "Íñigo", "Begoña"];
  const APELLIDOS = ["García", "Martínez", "López", "Sánchez", "Pérez", "Gómez", "Fernández", "Díaz", "Moreno", "Muñoz", "Álvarez",
    "Romero", "Navarro", "Torres", "Domínguez", "Vázquez", "Ramos", "Gil", "Serrano", "Molina", "Blanco", "Suárez", "Ortega",
    "Delgado", "Castro", "Ortiz", "Rubio", "Marín", "Sanz", "Iglesias", "Goikoetxea", "Etxeberria", "Aguirre", "Ibáñez", "Peña"];
  const CIUDADES = [["Madrid", 30], ["Valencia", 15], ["Sevilla", 15], ["Bilbao", 12], ["Barcelona", 8], ["Zaragoza", 7], ["Málaga", 7], ["Valladolid", 6]];
  const DOMINIOS = [["correo.example", 40], ["mail.example", 30], ["red.example", 20], ["empresa.example", 10]];
  const TIENDA_DE = { Madrid: 1, Valencia: 2, Sevilla: 3, Bilbao: 4 };

  // --- Clientes reales ---
  const clientes = [];
  const usados = new Set();
  for (let id = 1; clientes.length < 291; id++) {
    let nombre;
    do { nombre = `${elegir(NOMBRES)} ${elegir(APELLIDOS)}`; } while (usados.has(nombre));
    usados.add(nombre);
    const base = sinTildes(nombre.split(" ")[0]) + "." + sinTildes(nombre.split(" ")[1]);
    const email = (r() < 0.3 ? base + ent(1, 99) : base) + "@" + ponderado(DOMINIOS);
    const dia = diaEntre([2022, 0, 1], [2026, 7, 31]);
    // Unos pocos reales se dan de alta de madrugada (para que el filtro del caso necesite combinar condiciones)
    const noche = r() < 0.035;
    const h = noche ? ent(1, 5) : ent(9, 22);
    clientes.push({
      id: clientes.length + 1, nombre, email,
      telefono: r() < 0.12 ? null : `6${ent(10, 99)} ${ent(100, 999)} ${ent(100, 999)}`,
      ciudad: r() < 0.03 ? null : ponderado(CIUDADES),
      socio: r() < 0.35,
      alta: marca(dia, h, ent(0, 59), ent(0, 59))
    });
  }
  // La clienta de Bilbao que reclamará un pedido que no hizo
  const victima = clientes.find(c => c.ciudad === "Bilbao" && c.nombre.startsWith("Iratxe")) ||
    Object.assign(clientes[57], { nombre: "Iratxe Goikoetxea", email: "iratxe.goikoetxea@correo.example", ciudad: "Bilbao" });

  // --- Clientes falsos del Fantasma ---
  const FALSOS = ["Mario Peña", "Sara Ortiz", "Diego Rubio", "Alba Marín", "Raúl Sanz", "Noa Castro", "Leo Ibáñez", "Julia Delgado", "Hugo Aguirre"];
  const falsos = FALSOS.map((nombre, k) => {
    const dia = diaEntre([2026, 2, 1], [2026, 7, 31]);
    return {
      id: clientes.length + k + 1, nombre,
      email: sinTildes(nombre.split(" ")[0]) + "." + sinTildes(nombre.split(" ")[1]) + ent(10, 99) + "@correo-rapido.example",
      telefono: null, ciudad: "Getafe", socio: false,
      alta: marca(dia, ent(2, 4), ent(0, 59), ent(0, 59)), falso: true
    };
  });
  const todos = clientes.concat(falsos);

  // --- Pedidos con sus líneas ---
  const precios = filasProductos.map(([pid, , , precio, , , activo]) => ({ pid, precio, activo }));
  const pedidos = [], lineas = [];
  const nuevoPedido = (cliente, fecha, tiendaId, estado, objetivo = null) => {
    const id = pedidos.length + 1;
    let total = 0;
    const n = objetivo ? ent(1, 2) : ponderado([[1, 55], [2, 30], [3, 15]]);
    const vistos = new Set();
    for (let k = 0; k < n; k++) {
      let p;
      do { p = objetivo ? elegir(precios.filter(x => x.precio >= 120)) : elegir(precios); } while (vistos.has(p.pid));
      vistos.add(p.pid);
      const cantidad = objetivo ? 1 : ponderado([[1, 80], [2, 15], [3, 5]]);
      lineas.push([id, p.pid, cantidad, p.precio]);
      total += cantidad * p.precio;
    }
    const metodo = tiendaId === 5 ? ponderado([["tarjeta", 70], ["bizum", 20], ["transferencia", 10]])
      : ponderado([["tarjeta", 60], ["efectivo", 25], ["bizum", 15]]);
    pedidos.push({ id, cliente_id: cliente.id, tienda_id: tiendaId, fecha, estado, total: Math.round(total * 100) / 100, metodo_pago: metodo,
      nota: r() < 0.06 ? elegir(["Dejar en conserjería", "Llamar antes de entregar", "Es un regalo", "Entregar por la tarde", "Factura a nombre de empresa"]) : null });
    return id;
  };

  // Pedidos normales, en orden de fecha
  const normales = [];
  for (const c of clientes) {
    const n = ponderado([[0, 8], [3, 30], [6, 30], [10, 20], [16, 12]]) + ent(0, 3);
    const altaDia = new Date(c.alta.slice(0, 10) + "T00:00:00Z");
    const desde = altaDia > new Date("2024-01-01T00:00:00Z") ? altaDia : new Date("2024-01-01T00:00:00Z");
    for (let k = 0; k < n; k++) {
      const dia = diaEntre([desde.getUTCFullYear(), desde.getUTCMonth(), desde.getUTCDate()], [2026, 8, 30]);
      const online = !TIENDA_DE[c.ciudad] || r() < 0.4;
      const tienda = online ? 5 : TIENDA_DE[c.ciudad];
      const h = online ? ponderado([[ent(8, 23), 94], [ent(0, 6), 6]]) : ent(10, 20);
      const estado = ponderado([["entregado", 83], ["en camino", 4], ["cancelado", 9], ["reembolsado", 2]]);
      normales.push({ c, fecha: marca(dia, h, ent(0, 59), ent(0, 59)), tienda, estado });
    }
  }
  // Pedidos del Fantasma (y el que reclama la víctima)
  const fantasma = [];
  for (const f of falsos) {
    const n = ent(6, 9);
    for (let k = 0; k < n; k++) {
      const dia = diaEntre([2026, 2, 5], [2026, 8, 25]);
      fantasma.push({ c: f, fecha: marca(dia, ent(2, 4), ent(0, 59), ent(0, 59)), tienda: 5, estado: "reembolsado", caro: true });
    }
  }
  const reclamado = { c: victima, fecha: marca(new Date("2026-08-14T00:00:00Z"), 3, 12, 41), tienda: 5, estado: "reembolsado", caro: true, clave: true };
  fantasma.push(reclamado);

  const todosPedidos = normales.concat(fantasma).sort((a, b) => a.fecha.localeCompare(b.fecha));
  let pedidoReclamado = null;
  for (const p of todosPedidos) {
    const id = nuevoPedido(p.c, p.fecha, p.tienda, p.estado, p.caro ? true : null);
    if (p.clave) pedidoReclamado = id;
  }

  // --- Reclamaciones ---
  const MOTIVOS = ["El pedido llegó con retraso", "Producto defectuoso", "Falta un artículo en el paquete", "Cobro duplicado en la tarjeta",
    "Producto distinto al pedido", "El repartidor no dejó aviso", "Quiero cambiar la dirección de entrega", "Caja dañada"];
  const reclamaciones = [];
  const candidatos = pedidos.filter(p => p.estado !== "cancelado" && !falsos.some(f => f.id === p.cliente_id));
  for (let k = 0; k < 39; k++) {
    const p = elegir(candidatos);
    const d = new Date(p.fecha.slice(0, 10) + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + ent(1, 12));
    reclamaciones.push({ cliente_id: p.cliente_id, pedido_id: p.id, fecha: d.toISOString().slice(0, 10), motivo: elegir(MOTIVOS),
      estado: ponderado([["resuelta", 70], ["abierta", 20], ["rechazada", 10]]) });
  }
  reclamaciones.push({ cliente_id: victima.id, pedido_id: pedidoReclamado, fecha: "2026-09-02",
    motivo: "No reconozco este pedido: yo no lo hice", estado: "abierta" });
  reclamaciones.sort((a, b) => a.fecha.localeCompare(b.fecha));
  reclamaciones.forEach((x, i) => { x.id = i + 1; });

  return { clientes: todos, pedidos, lineas, reclamaciones, victima, pedidoReclamado };
}

const esquemaClientesPedidos = `
CREATE TABLE clientes (
  id integer PRIMARY KEY,
  nombre text NOT NULL,
  email text NOT NULL UNIQUE,
  telefono text,
  ciudad text,
  socio boolean NOT NULL DEFAULT FALSE,
  alta timestamp NOT NULL
);

CREATE TABLE pedidos (
  id integer PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id),
  tienda_id integer NOT NULL REFERENCES tiendas (id),
  fecha timestamp NOT NULL,
  estado text NOT NULL,
  total numeric(10, 2) NOT NULL,
  metodo_pago text NOT NULL,
  nota text
);

CREATE TABLE reclamaciones (
  id integer PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id),
  pedido_id integer NOT NULL REFERENCES pedidos (id),
  fecha date NOT NULL,
  motivo text NOT NULL,
  estado text NOT NULL
);
`;

function etapa2() {
  const u = universo();
  return [
    "-- Faro · datos de la etapa 2 (generado por herramientas/generar-datos.mjs; no editar a mano)",
    esquemaE1,
    esquemaClientesPedidos,
    insertar("tiendas", ["id", "ciudad", "apertura"], tiendas),
    insertar("empleados", ["id", "nombre", "departamento", "tienda_id", "email"],
      empleados.map(([n, d, t], i) => [i + 1, n, d, t, email(n)])),
    insertar("productos", ["id", "nombre", "categoria", "precio", "stock", "proveedor", "activo", "creado"], filasProductos),
    insertar("clientes", ["id", "nombre", "email", "telefono", "ciudad", "socio", "alta"],
      u.clientes.map(c => [c.id, c.nombre, c.email, c.telefono, c.ciudad, c.socio, c.alta])),
    insertar("pedidos", ["id", "cliente_id", "tienda_id", "fecha", "estado", "total", "metodo_pago", "nota"],
      u.pedidos.map(p => [p.id, p.cliente_id, p.tienda_id, p.fecha, p.estado, p.total, p.metodo_pago, p.nota])),
    insertar("reclamaciones", ["id", "cliente_id", "pedido_id", "fecha", "motivo", "estado"],
      u.reclamaciones.map(x => [x.id, x.cliente_id, x.pedido_id, x.fecha, x.motivo, x.estado]))
  ].join("\n");
}

writeFileSync(SALIDA + "faro-e2.sql", etapa2());
console.log("✅ datos/faro-e2.sql");

// --- Etapa 3 (Ventas): lo de la etapa 2 + líneas de pedido + columna `mes` -------------
// `mes` ('2026-08') permite agrupar por mes antes de enseñar funciones de fecha (etapa 5):
// en la historia, es una columna que el equipo de ventas ya tenía en sus exportaciones.
const esquemaLineas = `
CREATE TABLE lineas_pedido (
  pedido_id integer NOT NULL REFERENCES pedidos (id),
  producto_id integer NOT NULL REFERENCES productos (id),
  cantidad integer NOT NULL CHECK (cantidad > 0),
  precio_unitario numeric(8, 2) NOT NULL,
  PRIMARY KEY (pedido_id, producto_id)
);
`;

function etapa3() {
  const u = universo();
  return [
    etapa2().replace("datos de la etapa 2", "datos de la etapa 3"),
    esquemaLineas,
    insertar("lineas_pedido", ["pedido_id", "producto_id", "cantidad", "precio_unitario"], u.lineas),
    "ALTER TABLE pedidos ADD COLUMN mes text;",
    "UPDATE pedidos SET mes = to_char(fecha, 'YYYY-MM');",
    "ALTER TABLE pedidos ALTER COLUMN mes SET NOT NULL;"
  ].join("\n");
}

writeFileSync(SALIDA + "faro-e3.sql", etapa3());
console.log("✅ datos/faro-e3.sql");

// --- Etapa 4 (Logística): lo de la etapa 3 + almacenes, transportistas, envíos y jefes ----------
// Semilla propia (4004): no altera nada de las etapas anteriores.
// Solo los pedidos ONLINE se envían (en tienda física el cliente se lo lleva).
// Pista del Fantasma: sus pedidos reembolsados casi nunca tienen envío; los pocos que sí, salen de Getafe.
const almacenes = [
  // [id, nombre, ciudad, responsable_id (empleados.id), apertura]
  [1, "Almacén central", "Getafe", 5, "2017-09-01"],   // Héctor Vidal, jefe de logística
  [2, "Almacén Levante", "Valencia", 18, "2019-03-15"], // Óscar Medina
  [3, "Almacén Sur", "Sevilla", 19, "2020-05-04"],      // Beatriz Soto
  [4, "Almacén Norte", "Bilbao", null, "2021-10-11"],   // responsable vacante
  [5, "Almacén Zaragoza", "Zaragoza", null, "2026-09-21"] // recién abierto: aún sin envíos
];
const transportistas = [
  [1, "Rayo Express", "rayo.example"],
  [2, "Paquetería Norte", "norte.example"],
  [3, "Mensajería Sur", "sur.example"],
  [4, "Logística Delta", "delta.example"]                 // contratada hace poco: aún sin envíos
];
// Jefe directo de cada empleado (por nombre); Ana Beltrán no tiene jefe
const JEFES = {
  "Lucía Mora": "Ana Beltrán", "Marcos Gil": "Ana Beltrán", "Elena Ruiz": "Ana Beltrán", "Héctor Vidal": "Ana Beltrán",
  "Nuria Campos": "Ana Beltrán", "Iván Soler": "Ana Beltrán", "Rubén Ortega": "Lucía Mora",
  "Diego Castaño": "Marcos Gil", "Laura Peña": "Marcos Gil", "Óscar Medina": "Héctor Vidal", "Beatriz Soto": "Héctor Vidal",
  "Tomás Rivas": "Elena Ruiz", "Claudia Reyes": "Elena Ruiz",
  "Pablo Herrero": "Elena Ruiz", "Carmen Llorente": "Pablo Herrero", "Jorge Navarro": "Elena Ruiz", "Sara Ferrer": "Jorge Navarro",
  "Raúl Domínguez": "Elena Ruiz", "Inés Romero": "Raúl Domínguez", "Aitor Etxeberria": "Elena Ruiz", "Maite Urquijo": "Aitor Etxeberria"
};

const esquemaLogistica = `
CREATE TABLE almacenes (
  id integer PRIMARY KEY,
  nombre text NOT NULL,
  ciudad text NOT NULL,
  responsable_id integer REFERENCES empleados (id),
  apertura date NOT NULL
);

CREATE TABLE transportistas (
  id integer PRIMARY KEY,
  nombre text NOT NULL,
  web text NOT NULL
);

CREATE TABLE envios (
  id integer PRIMARY KEY,
  pedido_id integer NOT NULL UNIQUE REFERENCES pedidos (id),
  almacen_id integer NOT NULL REFERENCES almacenes (id),
  transportista_id integer NOT NULL REFERENCES transportistas (id),
  salida timestamp NOT NULL,
  entrega timestamp,
  estado text NOT NULL,
  coste numeric(6, 2) NOT NULL
);
`;

function envios() {
  const u = universo();
  const r = azar(4004);
  const ent = (a, b) => a + Math.floor(r() * (b - a + 1));
  const elegir = lista => lista[Math.floor(r() * lista.length)];
  const dos = n => String(n).padStart(2, "0");
  const ALMACEN_DE = { Valencia: 2, Barcelona: 2, Sevilla: 3, "Málaga": 3, Bilbao: 4 };   // el resto, Getafe
  const TRANSPORTISTAS_DE = { 1: [1, 3], 2: [1, 2], 3: [3], 4: [2] };
  const ciudadDe = new Map(u.clientes.map(c => [c.id, c.ciudad]));
  const falsos = new Set(u.clientes.filter(c => c.falso).map(c => c.id));
  const delFantasma = p => falsos.has(p.cliente_id) || p.id === u.pedidoReclamado;
  const masDias = (txt, dias, h) => {
    const d = new Date(txt.slice(0, 10) + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + dias);
    return `${d.toISOString().slice(0, 10)} ${dos(h)}:${dos(ent(0, 59))}:${dos(ent(0, 59))}`;
  };
  const filas = [];
  const fantasmaConEnvio = new Set();
  // Unos pocos pedidos del Fantasma sí tienen envío (para disimular): siempre desde Getafe, devueltos sin entrega
  const delF = u.pedidos.filter(delFantasma);
  while (fantasmaConEnvio.size < 6) fantasmaConEnvio.add(elegir(delF).id);
  for (const p of u.pedidos) {
    if (p.tienda_id !== 5 || p.estado === "cancelado") continue;
    if (delFantasma(p) && !fantasmaConEnvio.has(p.id)) continue;   // pedido fantasma: nunca salió del almacén
    const almacen = delFantasma(p) ? 1 : (ALMACEN_DE[ciudadDe.get(p.cliente_id)] || 1);
    const salida = masDias(p.fecha, ent(0, 2), ent(8, 19));
    let entrega = null, estado;
    if (p.estado === "entregado") { entrega = masDias(salida, ent(1, 4), ent(9, 20)); estado = "entregado"; }
    else if (p.estado === "en camino") estado = "en reparto";
    else { estado = "devuelto"; if (!delFantasma(p)) entrega = masDias(salida, ent(1, 3), ent(9, 20)); }   // reembolsado
    filas.push([filas.length + 1, p.id, almacen, elegir(TRANSPORTISTAS_DE[almacen]), salida, entrega, estado,
      (ent(39, 99) / 10).toFixed(2) * 1]);
  }
  return filas;
}

function etapa4() {
  const idDe = new Map(empleados.map(([n], i) => [n, i + 1]));
  return [
    etapa3().replace("datos de la etapa 3", "datos de la etapa 4"),
    "ALTER TABLE empleados ADD COLUMN jefe_id integer REFERENCES empleados (id);",
    ...empleados.filter(([n]) => JEFES[n]).map(([n]) => `UPDATE empleados SET jefe_id = ${idDe.get(JEFES[n])} WHERE id = ${idDe.get(n)};`),
    esquemaLogistica,
    insertar("almacenes", ["id", "nombre", "ciudad", "responsable_id", "apertura"], almacenes),
    insertar("transportistas", ["id", "nombre", "web"], transportistas),
    insertar("envios", ["id", "pedido_id", "almacen_id", "transportista_id", "salida", "entrega", "estado", "coste"], envios())
  ].join("\n");
}

writeFileSync(SALIDA + "faro-e4.sql", etapa4());
console.log("✅ datos/faro-e4.sql");
