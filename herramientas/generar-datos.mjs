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

  // Nadie compra antes de darse de alta: si el primer pedido de un cliente es anterior a su alta, el alta pasa a
  // ser la víspera de ese pedido (misma hora). Sin tirar dados: el resto del universo no cambia.
  const primero = new Map();
  for (const p of pedidos) if (!primero.has(p.cliente_id) || p.fecha < primero.get(p.cliente_id)) primero.set(p.cliente_id, p.fecha);
  for (const c of todos) {
    const p = primero.get(c.id);
    if (p && p < c.alta) {
      const d = new Date(p.slice(0, 10) + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() - 1);
      c.alta = d.toISOString().slice(0, 10) + c.alta.slice(10);
    }
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
  [1, "Almacén central", "Getafe", 23, "2017-09-01"],  // Iker Salas, jefe de muelle (depende de Héctor). Héctor NO es
                                                        // el responsable directo: así el caso de la etapa 4 no lo señala
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
  "Diego Castaño": "Marcos Gil", "Laura Peña": "Marcos Gil", "Óscar Medina": "Héctor Vidal", "Beatriz Soto": "Héctor Vidal", "Iker Salas": "Héctor Vidal",
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

const ALMACEN_DE = { Valencia: 2, Barcelona: 2, Sevilla: 3, "Málaga": 3, Bilbao: 4 };   // el resto, Getafe
const TRANSPORTISTAS_DE = { 1: [1, 3], 2: [1, 2], 3: [3], 4: [2] };

function envios() {
  const u = universo();
  const r = azar(4004);
  const ent = (a, b) => a + Math.floor(r() * (b - a + 1));
  const elegir = lista => lista[Math.floor(r() * lista.length)];
  const dos = n => String(n).padStart(2, "0");
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
    // Nuevo en la etapa 4: el jefe de muelle del Almacén central (las etapas 1–3 siguen con 22 empleados)
    insertar("empleados", ["id", "nombre", "departamento", "tienda_id", "email"], [[23, "Iker Salas", "Logística", 1, email("Iker Salas")]]),
    "UPDATE empleados SET jefe_id = 5 WHERE id = 23;",
    ...empleados.filter(([n]) => JEFES[n]).map(([n]) => `UPDATE empleados SET jefe_id = ${idDe.get(JEFES[n])} WHERE id = ${idDe.get(n)};`),
    esquemaLogistica,
    insertar("almacenes", ["id", "nombre", "ciudad", "responsable_id", "apertura"], almacenes),
    insertar("transportistas", ["id", "nombre", "web"], transportistas),
    insertar("envios", ["id", "pedido_id", "almacen_id", "transportista_id", "salida", "entrega", "estado", "coste"], envios())
  ].join("\n");
}

writeFileSync(SALIDA + "faro-e4.sql", etapa4());
console.log("✅ datos/faro-e4.sql");

// --- Etapa 5 (Migración): lo de la etapa 4 + el CRM antiguo (todo en texto, sucio) y las fichas de empleados ----
// Semilla propia (5005). Nuria migra el CRM viejo al sistema nuevo: los datos llegan como los escribía la gente.
// Pista del Fantasma (pista FALSA, la pone Héctor): las direcciones de los 9 clientes falsos, escritas de formas
// distintas, son una sola al normalizarlas… y es la de Iván Soler (fichas_empleados).
const DIRECCION_IVAN = { cp: "28901", ciudad: "Getafe" };
const FORMAS_IVAN = [
  "Calle Olmo 7, 3ºB", "C/ Olmo, 7 3ºB", "c/olmo 7 - 3º B", "CALLE OLMO 7 3B", "  calle  Olmo 7, 3º-B ",
  "C/ OLMO 7, 3ºB", "Calle olmo, 7, 3 B", "c/ Olmo 7 3ºb", "calle Olmo 7 (3ºB)"
];
const CALLES = ["Mayor", "Alcalá", "Gran Vía", "Serrano", "Princesa", "Colón", "Sol", "Luna", "Pez", "Arenal", "Atocha", "Toledo",
  "Velázquez", "Goya", "Ríos Rosas", "Bravo Murillo", "Libertad", "Prado", "Paz", "Real", "Nueva", "Ancha", "Ribera", "Sierpes",
  "Feria", "Betis", "Ercilla", "Autonomía", "Licenciado Poza", "Ruzafa", "Xàtiva", "Paseo Gracia", "Diagonal", "Alfonso I",
  "Larios", "Santiago", "Miguel Íscar", "Coso", "Independencia", "Pilar"];
const CP_DE = { Madrid: "280", Valencia: "460", Sevilla: "410", Bilbao: "480", Barcelona: "080", Zaragoza: "500", "Málaga": "290", Valladolid: "470", Getafe: "289", "Alcorcón": "289" };
const sinAcentos = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

function etapa5Tablas() {
  const u = universo();
  const r = azar(5005);
  const ent = (a, b) => a + Math.floor(r() * (b - a + 1));
  const elegir = lista => lista[Math.floor(r() * lista.length)];
  const prob = p => r() < p;
  const dos = n => String(n).padStart(2, "0");
  // Una misma dirección «limpia», escrita como la escribiría alguien con prisa
  const ensuciarDireccion = (calle, numero, piso) => {
    const base = prob(0.5) ? `Calle ${calle}` : `C/ ${calle}`;
    let t = `${base}${prob(0.5) ? "," : ""} ${numero}${piso ? (prob(0.5) ? ", " : " ") + piso : ""}`;
    if (prob(0.2)) t = t.toUpperCase(); else if (prob(0.2)) t = t.toLowerCase();
    if (prob(0.15)) t = "  " + t.replace(/ /g, "  ") + " ";
    return t;
  };
  const ensuciarTexto = t => {
    if (prob(0.2)) t = t.toUpperCase(); else if (prob(0.15)) t = t.toLowerCase();
    if (prob(0.15)) t = " " + t + "  ";
    return t;
  };
  const telefono = t => {
    if (t === null) return elegir([null, "", "N/D", null]);
    const d = t.replace(/\s/g, "");
    return elegir([t, d, "+34" + d, "+34 " + t, d.slice(0, 3) + "-" + d.slice(3, 6) + "-" + d.slice(6)]);
  };
  const fechaTexto = ts => {
    const [a, m, d] = ts.slice(0, 10).split("-");
    return prob(0.6) ? `${a}-${m}-${d}` : `${d}/${m}/${a}`;
  };
  const importeTexto = n => {
    const fijo = n.toFixed(2);
    if (prob(0.5)) return fijo;                                                              // 1234.50
    const [e, dec] = fijo.split(".");
    return e.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + dec + (prob(0.3) ? " €" : "");    // 1.234,50 €
  };
  const socioTexto = s => s ? elegir(["S", "si", "Sí", "1", "true"]) : elegir(["N", "no", "0", "false", ""]);
  const cp = ciudad => {
    const c = (CP_DE[ciudad] || "280") + dos(ent(1, 49));
    return c.startsWith("0") && prob(0.7) ? c.slice(1) : c;                                  // el Excel se comió el cero inicial
  };
  const gasto = new Map();
  for (const p of u.pedidos) if (p.estado !== "cancelado") gasto.set(p.cliente_id, (gasto.get(p.cliente_id) || 0) + p.total);

  const filas = [];
  const usadas = new Set();
  const direccionNueva = () => {
    let c, n, key;
    do { c = elegir(CALLES); n = ent(1, 140); key = c + n; } while (usadas.has(key));
    usadas.add(key);
    return { calle: c, numero: n, piso: prob(0.6) ? `${ent(1, 8)}º${elegir(["A", "B", "C", "D"])}` : "" };
  };
  // Parejas reales que viven juntas (misma dirección): para que «direcciones repetidas» no sea solo el Fantasma
  const parejas = new Map();
  const reales = u.clientes.filter(c => !c.falso);
  for (let k = 0; k < 6; k++) {
    const a = reales[ent(0, reales.length - 1)], b = reales[ent(0, reales.length - 1)];
    if (a !== b && !parejas.has(a.id) && !parejas.has(b.id)) { const d = direccionNueva(); parejas.set(a.id, d); parejas.set(b.id, d); }
  }
  let falsoK = 0;
  for (const c of u.clientes) {
    const ciudad = c.ciudad;
    let direccion, codigo;
    if (c.falso) { direccion = FORMAS_IVAN[falsoK++]; codigo = DIRECCION_IVAN.cp; }
    else {
      const d = parejas.get(c.id) || direccionNueva();
      direccion = ensuciarDireccion(d.calle, d.numero, d.piso); codigo = ciudad ? cp(ciudad) : null;
    }
    const fila = {
      nombre: ensuciarTexto(c.nombre), email: prob(0.25) ? ensuciarTexto(c.email) : c.email, telefono: telefono(c.telefono),
      direccion, cp: codigo, ciudad: ciudad === null ? elegir([null, ""]) : ensuciarTexto(ciudad),
      fecha_alta: fechaTexto(c.alta), gasto_total: importeTexto(Math.round((gasto.get(c.id) || 0) * 100) / 100), socio: socioTexto(c.socio)
    };
    filas.push(fila);
    // Duplicados: la misma persona dada de alta dos veces en el CRM viejo (otra forma de escribir sus datos)
    if (!c.falso && prob(0.07)) filas.push({ ...fila, nombre: ensuciarTexto(c.nombre.toUpperCase()), email: ensuciarTexto(c.email.toUpperCase()),
      telefono: telefono(c.telefono), gasto_total: importeTexto(0), socio: socioTexto(c.socio) });
  }
  // Clientes del CRM viejo que nunca pasaron al sistema nuevo (no están en `clientes`)
  const VIEJOS = ["Pedro Lafuente", "Rosa Montero", "Ángel Cabrera", "Felisa Ortiz", "Jesús Lorenzo", "Mercedes Prieto",
    "Ramón Vidal", "Teresa Calvo", "Luis Pascual", "Amparo Gallego", "Emilio Herrera", "Consuelo Rey"];
  for (const n of VIEJOS) {
    const ciudad = elegir(["Madrid", "Valencia", "Sevilla", "Bilbao"]);
    const d = direccionNueva();
    filas.push({ nombre: ensuciarTexto(n), email: sinAcentos(n.toLowerCase()).replace(" ", ".") + "@antiguo.example",
      telefono: telefono(`6${ent(10, 99)} ${ent(100, 999)} ${ent(100, 999)}`), direccion: ensuciarDireccion(d.calle, d.numero, d.piso),
      cp: cp(ciudad), ciudad: ensuciarTexto(ciudad), fecha_alta: fechaTexto(`20${ent(15, 19)}-${dos(ent(1, 12))}-${dos(ent(1, 28))}`),
      gasto_total: importeTexto(ent(50, 3000) + ent(0, 99) / 100), socio: socioTexto(prob(0.3)) });
  }
  // Valores atípicos (erratas de toda la vida): fechas imposibles y un gasto con tres ceros de más
  filas[ent(10, 60)].fecha_alta = "1900-01-01";
  filas[ent(70, 120)].fecha_alta = "31/12/2099";
  filas[ent(130, 200)].gasto_total = "999999.00";
  // Orden de exportación: barajado (el CRM no ordenaba por nada)
  for (let i = filas.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [filas[i], filas[j]] = [filas[j], filas[i]]; }

  // Fichas de empleados (RR. HH.)
  const fichas = empleados.concat([["Iker Salas", "Logística", 1]]).map(([nombre, , tienda], i) => {
    const id = i + 1;
    if (nombre === "Iván Soler") return [id, "Calle Olmo, 7, 3ºB", DIRECCION_IVAN.cp, DIRECCION_IVAN.ciudad, "1986-11-23", "611 204 587"];
    const ciudad = tienda === 2 ? "Valencia" : tienda === 3 ? "Sevilla" : tienda === 4 ? "Bilbao" : elegir(["Madrid", "Madrid", "Madrid", "Getafe", "Alcorcón"]);
    const d = direccionNueva();
    return [id, `Calle ${d.calle}, ${d.numero}${d.piso ? ", " + d.piso : ""}`, (CP_DE[ciudad] || "289") + dos(ent(1, 49)), ciudad,
      `19${ent(62, 99)}-${dos(ent(1, 12))}-${dos(ent(1, 28))}`, `6${ent(10, 99)} ${ent(100, 999)} ${ent(100, 999)}`];
  });
  return { crm: filas.map((f, i) => [i + 1, f.nombre, f.email, f.telefono, f.direccion, f.cp, f.ciudad, f.fecha_alta, f.gasto_total, f.socio]), fichas };
}

const esquemaMigracion = `
CREATE TABLE crm_clientes (
  crm_id integer PRIMARY KEY,
  nombre text,
  email text,
  telefono text,
  direccion text,
  cp text,
  ciudad text,
  fecha_alta text,
  gasto_total text,
  socio text
);

CREATE TABLE fichas_empleados (
  empleado_id integer PRIMARY KEY REFERENCES empleados (id),
  direccion text NOT NULL,
  cp text NOT NULL,
  ciudad text NOT NULL,
  nacimiento date NOT NULL,
  telefono text NOT NULL
);
`;

function etapa5() {
  const t = etapa5Tablas();
  return [
    etapa4().replace("datos de la etapa 4", "datos de la etapa 5"),
    esquemaMigracion,
    insertar("crm_clientes", ["crm_id", "nombre", "email", "telefono", "direccion", "cp", "ciudad", "fecha_alta", "gasto_total", "socio"], t.crm),
    insertar("fichas_empleados", ["empleado_id", "direccion", "cp", "ciudad", "nacimiento", "telefono"], t.fichas)
  ].join("\n");
}

writeFileSync(SALIDA + "faro-e5.sql", etapa5());
console.log("✅ datos/faro-e5.sql");

// --- Etapa 6 (IT): lo de la etapa 5 + cuentas del sistema, auditoría y stock de las tiendas físicas ----------
// Semilla propia (6006). Iván guarda desde 2024 un registro de cambios (`auditoria`) de clientes, pedidos, productos
// y cuentas. Pista del Fantasma: todo lo raro (altas de los falsos, sus reembolsos, el stock de −12 y dos cambios de
// precio de madrugada) lo hace `admin_temp`, una cuenta de 2019 que creó Iván y nadie desactivó (Iván parece culpable).
// ⚠️ Etapa 7: los momentos de `admin_temp` deben cuadrar con las vacaciones de Iván y los fichajes de Héctor.
const esquemaIT = `
CREATE TABLE cuentas (
  id integer PRIMARY KEY,
  usuario text NOT NULL UNIQUE,
  empleado_id integer REFERENCES empleados (id),
  rol text NOT NULL CHECK (rol IN ('lectura', 'escritura', 'admin')),
  creada date NOT NULL,
  creada_por text NOT NULL,
  activa boolean NOT NULL DEFAULT TRUE,
  ultimo_acceso timestamp
);

CREATE TABLE auditoria (
  id integer PRIMARY KEY,
  momento timestamp NOT NULL,
  usuario text NOT NULL REFERENCES cuentas (usuario),
  tabla text NOT NULL,
  operacion text NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
  registro_id integer,
  columna text,
  valor_antes text,
  valor_despues text
);

CREATE TABLE stock_tiendas (
  tienda_id integer NOT NULL REFERENCES tiendas (id),
  producto_id integer NOT NULL REFERENCES productos (id),
  unidades integer NOT NULL CHECK (unidades >= 0),
  PRIMARY KEY (tienda_id, producto_id)
);
`;

function etapa6Tablas() {
  const u = universo();
  const r = azar(6006);
  const ent = (a, b) => a + Math.floor(r() * (b - a + 1));
  const elegir = lista => lista[Math.floor(r() * lista.length)];
  const dos = n => String(n).padStart(2, "0");
  const HOY = "2026-09-30";
  const dia = (txt, mas) => { const d = new Date(txt.slice(0, 10) + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + mas); return d.toISOString().slice(0, 10); };
  const hora = (d, h) => `${d} ${dos(h)}:${dos(ent(0, 59))}:${dos(ent(0, 59))}`;
  const diaEntre = (a, b) => dia(a, ent(0, Math.round((Date.parse(b) - Date.parse(a)) / 86400000)));

  // Cuentas: una por empleado + las de servicio
  const todosEmpleados = empleados.concat([["Iker Salas", "Logística", 1]]);
  const usuarioDe = n => email(n).split("@")[0];
  const ROL = { "Sistemas": "admin", "Datos": "lectura", "Dirección": "lectura" };
  const cuentas = todosEmpleados.map(([n, dep], i) => {
    const iker = n === "Iker Salas";
    return [i + 1, usuarioDe(n), i + 1, ROL[dep] || "escritura", iker ? "2025-03-10" : diaEntre("2018-01-08", "2023-12-20"),
      elegir(["ivan.soler", "nuria.campos"]), true, hora(diaEntre("2026-09-15", HOY), ent(8, 19))];
  });
  cuentas[6][4] = "2017-03-01"; cuentas[6][5] = "nuria.campos";   // la cuenta de Iván
  cuentas[5][4] = "2016-09-12"; cuentas[5][5] = "ana.beltran";    // la de Nuria
  cuentas[22][5] = "ivan.soler";                                  // la de Iker
  const servicio = [
    ["app_web", "escritura", "2017-11-15", "ivan.soler", true],
    ["app_tienda", "escritura", "2018-02-01", "ivan.soler", true],
    ["copias_seguridad", "lectura", "2018-02-01", "ivan.soler", true],
    ["migracion_2019", "admin", "2019-11-04", "ivan.soler", false],
    ["admin_temp", "admin", "2019-11-04", "ivan.soler", true],
    ["becario.2023", "lectura", "2023-06-01", "nuria.campos", false]
  ];
  for (const [usuario, rol, creada, por, activa] of servicio)
    cuentas.push([cuentas.length + 1, usuario, null, rol, creada, por, activa, null]);

  const eventos = [];   // [momento, usuario, tabla, operacion, registro_id, columna, antes, despues]
  const ev = (...e) => eventos.push(e);

  // Altas de clientes
  for (const c of u.clientes) ev(c.alta, c.falso ? "admin_temp" : "app_web", "clientes", "INSERT", c.id, null, null, c.email);

  // Reembolsos: los normales, Atención al cliente en horario de oficina; los del Fantasma, admin_temp de madrugada
  const falsos = new Set(u.clientes.filter(c => c.falso).map(c => c.id));
  for (const p of u.pedidos.filter(p => p.estado === "reembolsado")) {
    if (falsos.has(p.cliente_id) || p.id === u.pedidoReclamado) {
      let d = dia(p.fecha, ent(1, 2)); if (d > HOY) d = HOY;
      ev(hora(d, ent(2, 4)), "admin_temp", "pedidos", "UPDATE", p.id, "estado", "entregado", "reembolsado");
    } else {
      let d = dia(p.fecha, ent(1, 10)); if (d > HOY) d = dia(p.fecha, 1) > HOY ? p.fecha.slice(0, 10) : HOY;
      ev(hora(d, d === p.fecha.slice(0, 10) ? 21 : ent(9, 18)), elegir(["marcos.gil", "diego.castano", "laura.pena"]),
        "pedidos", "UPDATE", p.id, "estado", "entregado", "reembolsado");
    }
  }

  // Ajustes de stock: cadenas que acaban en el stock actual. Logística de día; admin_temp, de madrugada, en 3 productos
  const LOGISTICA = ["oscar.medina", "beatriz.soto", "iker.salas", "hector.vidal"];
  const idDe = nombre => filasProductos.find(f => f[1] === nombre)[0];
  const ADMIN_STOCK = [
    [idDe(STOCK_IMPOSIBLE.nombre), "2026-08-16 03:51:07", 18],
    [idDe("Smartphone Nexo A5"), "2026-05-21 02:37:44", 31],
    [idDe("Portátil Lumen 16 Pro"), "2026-07-09 04:12:19", 22]
  ];
  for (const f of filasProductos.filter(f => f[6])) {
    const admin = ADMIN_STOCK.find(a => a[0] === f[0]);
    const n = admin ? 3 : ent(0, 3);
    const dias = Array.from({ length: n }, () => diaEntre("2024-01-15", admin ? dia(admin[1], -1) : HOY)).sort();
    let valor = admin ? admin[2] : f[4];
    const cadena = [];
    for (let k = n - 1; k >= 0; k--) {           // de la última hacia atrás: «antes» de cada una es el «después» de la anterior
      const antes = Math.max(0, valor + ent(-25, 15));
      cadena.unshift([hora(dias[k], ent(8, 19)), elegir(LOGISTICA), antes, valor]);
      valor = antes;
    }
    if (admin) cadena.push([admin[1], "admin_temp", admin[2], f[4]]);
    for (const [m, us, a, d] of cadena) ev(m, us, "productos", "UPDATE", f[0], "stock", String(a), String(d));
  }

  // Cambios de precio: Ventas de día (acaban en el precio actual); admin_temp baja y restaura dos precios de madrugada
  const VENTAS = ["elena.ruiz", "tomas.rivas", "claudia.reyes"];
  const ADMIN_PRECIO = [["Portátil Lumen 16 Pro", "599.00", "2026-04-17 02:48:12", "2026-04-17 03:56:40"],
                        ["Monitor Nexo 27\" 4K", "129.00", "2026-08-21 03:05:33", "2026-08-21 04:21:09"]];
  for (const f of filasProductos.filter(f => f[6] && !ADMIN_PRECIO.some(a => a[0] === f[1]))) {
    if (r() >= 0.4) continue;
    const antes = (Math.round(f[3] * (1 + ent(-15, 15) / 100)) - 0.1).toFixed(2);
    if (antes !== f[3].toFixed(2)) ev(hora(diaEntre("2024-02-01", HOY), ent(9, 18)), elegir(VENTAS), "productos", "UPDATE", f[0], "precio", antes, f[3].toFixed(2));
  }
  for (const [nombre, baja, desde, hasta] of ADMIN_PRECIO) {
    const f = filasProductos.find(x => x[1] === nombre);
    ev(desde, "admin_temp", "productos", "UPDATE", f[0], "precio", f[3].toFixed(2), baja);
    ev(hasta, "admin_temp", "productos", "UPDATE", f[0], "precio", baja, f[3].toFixed(2));
  }

  // Cuentas: Iván desactiva migracion_2019… pero no admin_temp; y da de alta a Iker
  ev("2024-02-12 11:34:20", "ivan.soler", "cuentas", "UPDATE", cuentas.find(c => c[1] === "migracion_2019")[0], "activa", "true", "false");
  ev("2025-03-10 09:41:02", "ivan.soler", "cuentas", "INSERT", 23, null, null, "iker.salas");

  eventos.sort((a, b) => a[0].localeCompare(b[0]));
  const auditoria = eventos.map((e, i) => [i + 1, ...e]);
  const ultimo = us => auditoria.filter(a => a[2] === us).map(a => a[1]).sort().pop() || null;
  for (const c of cuentas) if (!c[2]) c[7] = !c[6] ? hora(diaEntre("2023-09-01", "2024-02-10"), ent(9, 18))
    : c[1] === "admin_temp" ? ultimo(c[1]) : c[1] === "copias_seguridad" ? hora(HOY, 3) : hora(HOY, ent(19, 21));
  cuentas.find(c => c[1] === "becario.2023")[7] = "2023-08-31 17:58:03";

  // Stock de las tiendas físicas 1–4 (Barcelona, la 6, aún no tiene: se da de alta en la etapa 6)
  const stockTiendas = [];
  for (const t of [1, 2, 3, 4]) for (const f of filasProductos.filter(f => f[6])) stockTiendas.push([t, f[0], ent(0, 25)]);
  return { cuentas, auditoria, stockTiendas };
}

function etapa6() {
  const t = etapa6Tablas();
  return [
    etapa5().replace("datos de la etapa 5", "datos de la etapa 6"),
    esquemaIT,
    insertar("cuentas", ["id", "usuario", "empleado_id", "rol", "creada", "creada_por", "activa", "ultimo_acceso"], t.cuentas),
    insertar("auditoria", ["id", "momento", "usuario", "tabla", "operacion", "registro_id", "columna", "valor_antes", "valor_despues"], t.auditoria),
    insertar("stock_tiendas", ["tienda_id", "producto_id", "unidades"], t.stockTiendas)
  ].join("\n");
}

writeFileSync(SALIDA + "faro-e6.sql", etapa6());
console.log("✅ datos/faro-e6.sql");

// --- Etapa 7 (Dirección): lo de la etapa 6 + vacaciones, fichajes y sesiones de la base de datos ----------------
// Semilla propia (7007). Ana Beltrán pide informes; Lucía quiere saber dónde estaba cada uno cuando actuó admin_temp.
// La coartada: Iván estaba de vacaciones (sin fichajes ni sesiones) en agosto, y cada noche de admin_temp empieza
// pocos minutos después de que Héctor fiche en el Almacén central; las sesiones de admin_temp salen de un terminal
// del muelle de Getafe. Iker (jefe de muelle) hace turnos de noche, pero nunca las noches de admin_temp.
const esquemaDireccion = `
CREATE TABLE vacaciones (
  id integer PRIMARY KEY,
  empleado_id integer NOT NULL REFERENCES empleados (id),
  desde date NOT NULL,
  hasta date NOT NULL,
  CHECK (hasta >= desde)
);

CREATE TABLE fichajes (
  id integer PRIMARY KEY,
  empleado_id integer NOT NULL REFERENCES empleados (id),
  centro text NOT NULL,
  entrada timestamp NOT NULL,
  salida timestamp NOT NULL,
  CHECK (salida > entrada)
);

CREATE TABLE sesiones (
  id integer PRIMARY KEY,
  usuario text NOT NULL REFERENCES cuentas (usuario),
  inicio timestamp NOT NULL,
  fin timestamp NOT NULL,
  puesto text NOT NULL
);
`;

function etapa7Tablas() {
  const t6 = etapa6Tablas();
  const r = azar(7007);
  const ent = (a, b) => a + Math.floor(r() * (b - a + 1));
  const elegir = lista => lista[Math.floor(r() * lista.length)];
  const dos = n => String(n).padStart(2, "0");
  const DIA = 86400000;
  const fecha = ms => new Date(ms).toISOString().slice(0, 10);
  const marca = ms => new Date(ms).toISOString().slice(0, 19).replace("T", " ");
  const ms = txt => Date.parse(txt.replace(" ", "T") + "Z");
  const minutos = m => m * 60000;

  // Las noches de admin_temp (todas sus acciones son entre las 2 y las 5)
  const noches = new Map();
  for (const a of t6.auditoria.filter(a => a[2] === "admin_temp")) {
    const d = a[1].slice(0, 10);
    if (!noches.has(d)) noches.set(d, []);
    noches.get(d).push(ms(a[1]));
  }
  const diasAdmin = new Set(noches.keys());

  // Vacaciones de 2026 (ene–sep): dos periodos por empleado; Iván, Semana Santa y del 3 al 23 de agosto
  const IVAN = 7, HECTOR = 5, IKER = 23;
  const vacaciones = [];
  const choca = (desde, hasta) => [...diasAdmin].some(d => d >= desde && d <= hasta);
  for (let e = 1; e <= 23; e++) {
    if (e === IVAN) { vacaciones.push([e, "2026-04-06", "2026-04-10"], [e, "2026-08-03", "2026-08-23"]); continue; }
    for (const [ini, fin, largo] of [["2026-02-02", "2026-06-15", 5], ["2026-07-01", "2026-09-07", 14]]) {
      let desde, hasta, intentos = 0, dias = largo;
      do {
        if (++intentos % 200 === 0) dias--;            // si no cabe, vacaciones más cortas
        desde = fecha(Date.parse(ini) + ent(0, (Date.parse(fin) - Date.parse(ini)) / DIA) * DIA);
        while ([0, 6].includes(new Date(desde).getUTCDay())) desde = fecha(Date.parse(desde) + DIA);   // empiezan en día laborable
        hasta = fecha(Date.parse(desde) + (Math.max(1, dias + ent(-1, 2)) - 1) * DIA);
      } while (e === HECTOR && choca(desde, hasta));   // Héctor nunca se va cuando actúa admin_temp
      vacaciones.push([e, desde, hasta]);
    }
  }
  vacaciones.sort((a, b) => a[1].localeCompare(b[1]) || a[0] - b[0]);
  const deVacaciones = (e, d) => vacaciones.some(v => v[0] === e && d >= v[1] && d <= v[2]);

  // Centro habitual de cada empleado
  const CENTRO_TIENDA = { 1: "Tienda Madrid", 2: "Tienda Valencia", 3: "Tienda Sevilla", 4: "Tienda Bilbao" };
  const todos = empleados.concat([["Iker Salas", "Logística", 1]]);
  const centroDe = (e, [nombre, dep, tienda]) =>
    e === IKER ? "Almacén central" : nombre === "Óscar Medina" ? "Almacén Levante" : nombre === "Beatriz Soto" ? "Almacén Sur"
    : dep === "Tienda" ? CENTRO_TIENDA[tienda] : "Oficinas";

  const fichajes = [];   // [empleado_id, centro, entrada, salida]
  const sesiones = [];   // [usuario, inicio, fin, puesto]
  const desde = Date.parse("2026-01-05"), hasta = Date.parse("2026-09-30");
  const nochesIker = new Set();
  for (let t = desde; t <= hasta; t += DIA) {
    const d = fecha(t), finde = [0, 6].includes(new Date(t).getUTCDay());
    todos.forEach((emp, i) => {
      const e = i + 1;
      if (finde || deVacaciones(e, d) || r() < 0.02) return;   // algún día libre o de baja
      let centro = centroDe(e, emp);
      if (e === HECTOR && r() < 0.3) centro = "Almacén central";   // Héctor reparte su día entre oficina y almacén
      const entrada = t + minutos(ent(7 * 60 + 45, 9 * 60 + 30));
      const salida = entrada + minutos(ent(8 * 60, 9 * 60 + 15));
      fichajes.push([e, centro, marca(entrada), marca(salida)]);
      // Sesiones en la base de datos de los dos administradores (Sistemas)
      if (e === IVAN || e === 6) {
        const ini = entrada + minutos(ent(5, 40));
        sesiones.push([e === IVAN ? "ivan.soler" : "nuria.campos", marca(ini), marca(salida - minutos(ent(5, 30))), e === IVAN ? "SIS-01" : "SIS-02"]);
      }
    });
    // Turnos de noche de Iker en el almacén (descargas): nunca las noches de admin_temp
    if (!diasAdmin.has(d) && !deVacaciones(IKER, d) && r() < 0.08) {
      nochesIker.add(d);
      const entrada = t + minutos(ent(60, 150));
      fichajes.push([IKER, "Almacén central", marca(entrada), marca(entrada + minutos(ent(180, 270)))]);
    }
  }
  // Las noches de admin_temp: Héctor ficha en el Almacén central minutos antes y sale después de la última acción;
  // la sesión de admin_temp sale del terminal del muelle (ALM-GET-03)
  for (const [d, acciones] of noches) {
    acciones.sort((a, b) => a - b);
    const primera = acciones[0], ultima = acciones[acciones.length - 1];
    const entrada = primera - minutos(ent(6, 18));
    fichajes.push([HECTOR, "Almacén central", marca(entrada), marca(ultima + minutos(ent(12, 35)))]);
    sesiones.push(["admin_temp", marca(primera - minutos(ent(1, 4))), marca(ultima + minutos(ent(1, 6))), "ALM-GET-03"]);
  }
  // Las copias de seguridad, cada noche a las 3 desde el servidor
  for (let t = desde; t <= hasta; t += DIA) {
    const ini = t + minutos(180 + ent(0, 2));
    sesiones.push(["copias_seguridad", marca(ini), marca(ini + minutos(ent(14, 22))), "SRV-BACKUP"]);
  }
  fichajes.sort((a, b) => a[2].localeCompare(b[2]) || a[0] - b[0]);
  sesiones.sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]));
  return {
    vacaciones: vacaciones.map((v, i) => [i + 1, ...v]),
    fichajes: fichajes.map((f, i) => [i + 1, ...f]),
    sesiones: sesiones.map((s, i) => [i + 1, ...s])
  };
}

function etapa7() {
  const t = etapa7Tablas();
  return [
    etapa6().replace("datos de la etapa 6", "datos de la etapa 7"),
    esquemaDireccion,
    insertar("vacaciones", ["id", "empleado_id", "desde", "hasta"], t.vacaciones),
    insertar("fichajes", ["id", "empleado_id", "centro", "entrada", "salida"], t.fichajes),
    insertar("sesiones", ["id", "usuario", "inicio", "fin", "puesto"], t.sesiones)
  ].join("\n");
}

writeFileSync(SALIDA + "faro-e7.sql", etapa7());
console.log("✅ datos/faro-e7.sql");

// --- Etapa 8 (Analítica): lo de la etapa 7 + dos semanas de octubre, la web, los abonos y las nóminas ---------------
// Semilla propia (8008). Todo lo anterior al 2026-10-01 queda idéntico a la etapa 7.
// Lucía desactiva admin_temp (lo que se practicó en e6-12) y Faro sigue vendiendo del 1 al 14 de octubre, con
// Barcelona abierta por fin. La web registra sesiones y pasos del embudo desde abril; la prueba A/B del pago en un paso
// va de julio a septiembre (desde octubre, para todos). Pista final: los 69 reembolsos del Fantasma se abonaron por
// transferencia a una sola cuenta… la de la nómina de Héctor. Los pedidos del Fantasma no tienen sesión web.
const esquemaAnalitica = `
CREATE TABLE sesiones_web (
  id integer PRIMARY KEY,
  inicio timestamp NOT NULL,
  cliente_id integer REFERENCES clientes (id),
  dispositivo text NOT NULL CHECK (dispositivo IN ('movil', 'ordenador')),
  variante text CHECK (variante IN ('A', 'B'))
);

CREATE TABLE eventos_web (
  id integer PRIMARY KEY,
  sesion_id integer NOT NULL REFERENCES sesiones_web (id),
  momento timestamp NOT NULL,
  evento text NOT NULL CHECK (evento IN ('visita', 'producto', 'carrito', 'pago', 'compra')),
  pedido_id integer REFERENCES pedidos (id)
);

CREATE TABLE abonos (
  id integer PRIMARY KEY,
  pedido_id integer NOT NULL UNIQUE REFERENCES pedidos (id),
  fecha date NOT NULL,
  importe numeric(10, 2) NOT NULL,
  medio text NOT NULL CHECK (medio IN ('tarjeta', 'bizum', 'efectivo', 'transferencia')),
  cuenta_destino text
);
`;
const CUENTA_HECTOR = "ES76 **** **** **** **** 4417";

function etapa8Tablas() {
  const u = universo(), t6 = etapa6Tablas(), envios4 = envios();
  const r = azar(8008);
  const ent = (a, b) => a + Math.floor(r() * (b - a + 1));
  const elegir = lista => lista[Math.floor(r() * lista.length)];
  const ponderado = pares => { let x = r() * pares.reduce((s, [, p]) => s + p, 0); for (const [v, p] of pares) { if ((x -= p) < 0) return v; } return pares[0][0]; };
  const dos = n => String(n).padStart(2, "0");
  const MIN = 60000, DIA = 86400000;
  const ms = txt => Date.parse(txt.replace(" ", "T") + "Z");
  const marca = t => new Date(t).toISOString().slice(0, 19).replace("T", " ");
  const enDia = (t, minutos) => t + minutos * MIN + ent(0, 59) * 1000;
  const FIN = ms("2026-10-14 23:59:59");
  const OCTUBRE = Array.from({ length: 14 }, (_, k) => Date.parse("2026-10-01") + k * DIA);
  const sinTildes = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ñ/g, "n").replace(/\s+/g, "");
  const TIENDA_DE = { Madrid: 1, Valencia: 2, Sevilla: 3, Bilbao: 4 };
  const ATENCION = ["marcos.gil", "diego.castano", "laura.pena"];

  const falsos = new Set(u.clientes.filter(c => c.falso).map(c => c.id));
  const delFantasma = p => falsos.has(p.cliente_id) || p.id === u.pedidoReclamado;
  const reales = u.clientes.filter(c => !c.falso);
  const ciudadDe = new Map(u.clientes.map(c => [c.id, c.ciudad]));
  const precios = filasProductos.filter(f => f[6]).map(f => ({ pid: f[0], precio: f[3] }));
  const auditoria = [["2026-10-01 09:00:00", "lucia.mora", "cuentas", "UPDATE", 28, "activa", "true", "false"]];

  // --- Clientes nuevos de octubre: Barcelona (alta en la tienda) y unos pocos online ---
  const emails = new Set(u.clientes.map(c => c.email)), nombres = new Set(u.clientes.map(c => c.nombre));
  const NOMBRES_BCN = ["Jordi", "Montserrat", "Pau", "Laia", "Arnau", "Mireia", "Oriol", "Clara", "Pol", "Aina", "Roger", "Berta",
    "Xavier", "Anna", "Gerard", "Judit", "Albert", "Marta", "Marc", "Núria", "Joan", "Meritxell", "Sergi", "Ona"];
  const APELLIDOS_BCN = ["Puig", "Roca", "Serra", "Font", "Pujol", "Casas", "Riera", "Vila", "Camps", "Bosch", "Mas", "Costa",
    "Prats", "Sala", "Grau", "Rovira", "Martí", "Torrent", "Comas", "Ribas"];
  const nuevos = [];
  const nuevoCliente = (ciudad, altaT, cuenta) => {
    let nombre;
    do { nombre = `${elegir(NOMBRES_BCN)} ${elegir(APELLIDOS_BCN)}`; } while (nombres.has(nombre));
    nombres.add(nombre);
    let mail = `${sinTildes(nombre.split(" ")[0])}.${sinTildes(nombre.split(" ")[1])}@${elegir(["correo.example", "mail.example", "red.example"])}`;
    while (emails.has(mail)) mail = mail.replace("@", ent(1, 9) + "@");
    emails.add(mail);
    const c = { id: 301 + nuevos.length, nombre, email: mail, telefono: r() < 0.12 ? null : `6${ent(10, 99)} ${ent(100, 999)} ${ent(100, 999)}`,
      ciudad, socio: r() < 0.2, alta: marca(altaT) };
    nuevos.push(c);
    auditoria.push([c.alta, cuenta, "clientes", "INSERT", c.id, null, null, c.email]);
    return c;
  };

  // --- Pedidos del 1 al 14 de octubre: el ritmo de septiembre en cada tienda; Barcelona, de lunes a sábado ---
  const especificaciones = [];   // { cliente, t, tienda, estado }
  const septiembre = [1, 2, 3, 4, 5].map(t => u.pedidos.filter(p => p.tienda_id === t && p.fecha.startsWith("2026-09") && !delFantasma(p)).length / 30);
  const ESTADOS = [["entregado", 83], ["en camino", 4], ["cancelado", 9], ["reembolsado", 2]];
  for (const dia of OCTUBRE) {
    for (const t of [1, 2, 3, 4, 5]) {
      // Redondeo al azar: Bilbao vende ~0,2 pedidos al día y con Math.round no tendría ninguno
      const n = Math.floor(septiembre[t - 1] * (0.7 + 0.6 * r()) + r());
      for (let k = 0; k < n; k++) {
        const online = t === 5;
        const pool = online ? reales : reales.filter(c => TIENDA_DE[c.ciudad] === t);
        // Online también de madrugada (6 %); el día 14, no más tarde de las 21 (el envío sale antes de cerrar los datos)
        const minuto = online ? (r() < 0.06 ? ent(0, 6 * 60) : ent(8 * 60, (dia === OCTUBRE[13] ? 21 : 23) * 60 + 59)) : ent(10 * 60, 20 * 60 + 59);
        let cliente = elegir(pool);
        if (online && dia > OCTUBRE[0] && r() < 0.05) cliente = null;    // cliente nuevo de la web (se crea al ordenar)
        especificaciones.push({ cliente, t: enDia(dia, minuto), tienda: t, estado: ponderado(ESTADOS) });
      }
    }
    if (new Date(dia).getUTCDay() !== 0) {
      for (let k = ent(4, 6); k > 0; k--)
        especificaciones.push({ cliente: "barcelona", t: enDia(dia, ent(10 * 60, 20 * 60 + 59)), tienda: 6, estado: ponderado([["entregado", 93], ["cancelado", 7]]) });
    }
  }
  especificaciones.sort((a, b) => a.t - b.t);
  // Reembolsos de octubre a la tasa normal (~2 %): al menos uno online y otro en tienda, de la primera semana
  // (con ~100 pedidos, el azar podía dejar octubre sin ninguno)
  for (const online of [true, false])
    elegir(especificaciones.filter(e => e.tienda !== 6 && (e.tienda === 5) === online && e.estado === "entregado" && e.t < OCTUBRE[7])).estado = "reembolsado";
  const deBarcelona = reales.filter(c => c.ciudad === "Barcelona"), nuevosBcn = [];
  const pedidos = [], lineas = [], enviosOct = [];
  for (const e of especificaciones) {
    let cliente = e.cliente;
    if (cliente === null) cliente = nuevoCliente(elegir(["Madrid", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Valladolid"]), e.t - ent(5, 40) * MIN, "app_web");
    if (cliente === "barcelona") {
      const repite = deBarcelona.concat(nuevosBcn.filter(c => ms(c.alta) < e.t - DIA));
      cliente = r() < 0.6 ? nuevoCliente("Barcelona", e.t - ent(5, 40) * MIN, "app_tienda") : elegir(repite);
      if (cliente.id > 300 && !nuevosBcn.includes(cliente)) nuevosBcn.push(cliente);
    }
    const id = 2525 + pedidos.length;
    let total = 0;
    const vistos = new Set();
    for (let k = ponderado([[1, 55], [2, 30], [3, 15]]); k > 0; k--) {
      let p;
      do { p = elegir(precios); } while (vistos.has(p.pid));
      vistos.add(p.pid);
      const cantidad = ponderado([[1, 80], [2, 15], [3, 5]]);
      lineas.push([id, p.pid, cantidad, p.precio]);
      total += cantidad * p.precio;
    }
    const metodo = e.tienda === 5 ? ponderado([["tarjeta", 70], ["bizum", 20], ["transferencia", 10]])
      : ponderado([["tarjeta", 60], ["efectivo", 25], ["bizum", 15]]);
    const pedido = { id, cliente_id: cliente.id, tienda_id: e.tienda, fecha: marca(e.t), estado: e.estado, total: Math.round(total * 100) / 100,
      metodo_pago: metodo, nota: r() < 0.06 ? elegir(["Dejar en conserjería", "Llamar antes de entregar", "Es un regalo", "Entregar por la tarde", "Factura a nombre de empresa"]) : null };
    // Lo que da tiempo a pasar antes del 14 a medianoche: envío, entrega y, si toca, el reembolso
    let reembolso = null;
    if (e.tienda === 5 && pedido.estado !== "cancelado") {
      const almacen = ALMACEN_DE[ciudadDe.get(cliente.id) ?? cliente.ciudad] || 1;
      let salida = e.t + ent(60, 36 * 60) * MIN;
      if (salida > FIN - 60 * MIN) salida = e.t + ent(10, 50) * MIN;
      let entrega = enDia(Date.parse(marca(salida).slice(0, 10)) + ent(1, 4) * DIA, ent(9 * 60, 20 * 60));
      if (pedido.estado === "reembolsado") {
        reembolso = enDia(Date.parse(marca(entrega).slice(0, 10)) + ent(1, 3) * DIA, ent(9 * 60, 18 * 60));
        if (reembolso > FIN) { pedido.estado = "entregado"; reembolso = null; }
      }
      if (entrega > FIN || pedido.estado === "en camino") { pedido.estado = "en camino"; entrega = null; }
      const estadoEnvio = pedido.estado === "entregado" ? "entregado" : pedido.estado === "en camino" ? "en reparto" : "devuelto";
      enviosOct.push([envios4.length + enviosOct.length + 1, id, almacen, elegir(TRANSPORTISTAS_DE[almacen]), marca(salida), entrega && marca(entrega), estadoEnvio,
        (ent(39, 99) / 10).toFixed(2) * 1]);
    } else if (pedido.estado === "reembolsado") {
      reembolso = enDia(Date.parse(pedido.fecha.slice(0, 10)) + ent(1, 4) * DIA, ent(9 * 60, 18 * 60));
      if (reembolso > FIN) { pedido.estado = "entregado"; reembolso = null; }
    }
    if (reembolso) auditoria.push([marca(reembolso), elegir(ATENCION), "pedidos", "UPDATE", id, "estado", "entregado", "reembolsado"]);
    pedidos.push(pedido);
  }
  auditoria.sort((a, b) => a[0].localeCompare(b[0]));

  // --- La web: una sesión con compra por cada pedido online (abril → 14 de octubre), menos los del Fantasma ---
  // El resto del embudo se construye hacia atrás desde las compras, con las tasas de cada grupo:
  // A (y abril–junio): carrito→pago 70 %, pago→compra 80 % en ordenador y 65 % en móvil.
  // B (prueba de julio a septiembre, y desde octubre para todos): pago en un paso, ~10 puntos más de carrito→compra.
  // B recibe más compras (0,545) para que los dos grupos tengan los mismos carritos: el reparto fue al 50 %.
  const TASAS = { A: { pago: 0.70, ordenador: 0.80, movil: 0.65 }, B: { pago: 0.77, ordenador: 0.86, movil: 0.72 } };
  const compras = u.pedidos.filter(p => p.tienda_id === 5 && p.fecha >= "2026-04-01" && !delFantasma(p)).concat(pedidos.filter(p => p.tienda_id === 5));
  const sesiones = [];   // { inicio, cliente_id, dispositivo, variante, pasos: [[momento, evento, pedido_id]] }
  const celdas = new Map();
  const PRODUCTOS = [[1, 35], [2, 25], [3, 20], [4, 12], [5, 8]];
  const ORDEN = ["producto", "carrito", "pago", "compra"];
  const recorrido = (inicio, hasta, pedidoId = null) => {
    // visita, producto (1–5 veces), carrito, pago, compra: entre 30 s y 4 min entre pasos
    const pasos = [[inicio, "visita", null]];
    let t = inicio;
    for (const ev of ORDEN.slice(0, ORDEN.indexOf(hasta) + 1)) {
      for (let k = ev === "producto" ? ponderado(PRODUCTOS) : 1; k > 0; k--) {
        t += ent(30, 240) * 1000;
        pasos.push([t, ev, ev === "compra" ? pedidoId : null]);
      }
    }
    return pasos;
  };
  for (const p of compras) {
    const dispositivo = r() < 0.55 ? "movil" : "ordenador";
    const variante = p.fecha >= "2026-07-01" && p.fecha < "2026-10-01" ? (r() < 0.545 ? "B" : "A") : null;
    const pasos = recorrido(0, "compra", p.id);
    const desfase = ms(p.fecha) - ent(1, 3) * MIN - pasos[pasos.length - 1][0];       // la compra, minutos antes del pedido
    pasos.forEach(x => { x[0] += desfase; });
    sesiones.push({ inicio: pasos[0][0], cliente_id: p.cliente_id, dispositivo, variante, pasos });
    const clave = `${p.fecha.slice(0, 7)}|${dispositivo}|${variante ?? ""}`;
    celdas.set(clave, (celdas.get(clave) || 0) + 1);
  }
  const altaDe = new Map(reales.map(c => [c.id, ms(c.alta)]));
  for (const [clave, c] of celdas) {
    const [mes, dispositivo, v] = clave.split("|");
    const tasas = TASAS[v || (mes >= "2026-10" ? "B" : "A")];
    const pagos = Math.round(c / tasas[dispositivo]), carritos = Math.round(pagos / tasas.pago);
    const productos = Math.round(carritos / 0.30), visitas = Math.round(productos / 0.65);
    const inicioMes = Date.parse(mes + "-01"), finMes = FIN - 30 * MIN;
    for (const [hasta, n] of [["pago", pagos - c], ["carrito", carritos - pagos], ["producto", productos - carritos], ["visita", visitas - productos]]) {
      for (let k = 0; k < n; k++) {
        let inicio;
        do { inicio = enDia(inicioMes + ent(0, 30) * DIA, ponderado([[ent(8 * 60, 23 * 60 + 30), 92], [ent(0, 7 * 60), 8]])); }
        while (marca(inicio).slice(0, 7) !== mes || inicio > finMes);
        let cliente = null;
        if (r() < 0.35) { const x = elegir(reales); if (altaDe.get(x.id) < inicio) cliente = x.id; }
        sesiones.push({ inicio, cliente_id: cliente, dispositivo, variante: v || null, pasos: recorrido(inicio, hasta) });
      }
    }
  }
  sesiones.sort((a, b) => a.inicio - b.inicio || a.pasos.length - b.pasos.length);
  const filasSesiones = sesiones.map((s, i) => [i + 1, marca(s.inicio), s.cliente_id, s.dispositivo, s.variante]);
  const eventos = sesiones.flatMap((s, i) => s.pasos.map(([t, ev, pid]) => [i + 1, t, ev, pid]))
    .sort((a, b) => a[1] - b[1] || a[0] - b[0])
    .map(([sid, t, ev, pid], i) => [i + 1, sid, marca(t), ev, pid]);

  // --- Nóminas (una cuenta enmascarada por empleado) y abonos de cada reembolso ---
  const usadas = new Set([CUENTA_HECTOR]);
  const cuentaNueva = () => { let c; do { c = `ES${dos(ent(10, 99))} **** **** **** **** ${ent(1000, 9999)}`; } while (usadas.has(c)); usadas.add(c); return c; };
  const nominas = Array.from({ length: 23 }, (_, i) => [i + 1, i + 1 === 5 ? CUENTA_HECTOR : cuentaNueva()]);
  const cuentaCliente = new Map();
  const fechaReembolso = new Map(t6.auditoria.concat(auditoria.map(a => [0, ...a]))
    .filter(a => a[3] === "pedidos" && a[4] === "UPDATE" && a[6] === "estado").map(a => [a[5], a[1].slice(0, 10)]));
  const abonos = u.pedidos.concat(pedidos).filter(p => p.estado === "reembolsado").map(p => {
    if (delFantasma(p)) return [p.id, fechaReembolso.get(p.id), p.total, "transferencia", CUENTA_HECTOR];
    if (p.metodo_pago !== "transferencia") return [p.id, fechaReembolso.get(p.id), p.total, p.metodo_pago, null];
    if (!cuentaCliente.has(p.cliente_id)) cuentaCliente.set(p.cliente_id, cuentaNueva());
    return [p.id, fechaReembolso.get(p.id), p.total, "transferencia", cuentaCliente.get(p.cliente_id)];
  });
  if (abonos.some(a => !a[1])) throw new Error("Hay un reembolso sin su UPDATE en auditoria");
  abonos.sort((a, b) => a[1].localeCompare(b[1]) || a[0] - b[0]);

  // Último acceso de las cuentas que han trabajado en octubre
  const ultimo = new Map();
  for (const a of auditoria) if (!ultimo.has(a[1]) || a[0] > ultimo.get(a[1])) ultimo.set(a[1], a[0]);
  return { nuevos, pedidos, lineas, envios: enviosOct, auditoria: auditoria.map((a, i) => [498 + i, ...a]), ultimo, filasSesiones, eventos,
    abonos: abonos.map((a, i) => [i + 1, ...a]), nominas };
}

function etapa8() {
  const t = etapa8Tablas();
  return [
    etapa7().replace("datos de la etapa 7", "datos de la etapa 8"),
    "UPDATE cuentas SET activa = FALSE WHERE usuario = 'admin_temp';",
    insertar("clientes", ["id", "nombre", "email", "telefono", "ciudad", "socio", "alta"],
      t.nuevos.map(c => [c.id, c.nombre, c.email, c.telefono, c.ciudad, c.socio, c.alta])),
    insertar("pedidos", ["id", "cliente_id", "tienda_id", "fecha", "estado", "total", "metodo_pago", "nota", "mes"],
      t.pedidos.map(p => [p.id, p.cliente_id, p.tienda_id, p.fecha, p.estado, p.total, p.metodo_pago, p.nota, p.fecha.slice(0, 7)])),
    insertar("lineas_pedido", ["pedido_id", "producto_id", "cantidad", "precio_unitario"], t.lineas),
    insertar("envios", ["id", "pedido_id", "almacen_id", "transportista_id", "salida", "entrega", "estado", "coste"], t.envios),
    insertar("auditoria", ["id", "momento", "usuario", "tabla", "operacion", "registro_id", "columna", "valor_antes", "valor_despues"], t.auditoria),
    ...[...t.ultimo].map(([us, m]) => `UPDATE cuentas SET ultimo_acceso = '${m}' WHERE usuario = '${us}' AND (ultimo_acceso IS NULL OR ultimo_acceso < '${m}');`),
    esquemaAnalitica,
    insertar("sesiones_web", ["id", "inicio", "cliente_id", "dispositivo", "variante"], t.filasSesiones),
    insertar("eventos_web", ["id", "sesion_id", "momento", "evento", "pedido_id"], t.eventos),
    insertar("abonos", ["id", "pedido_id", "fecha", "importe", "medio", "cuenta_destino"], t.abonos),
    "ALTER TABLE fichas_empleados ADD COLUMN cuenta_nomina text;",
    ...t.nominas.map(([id, c]) => `UPDATE fichas_empleados SET cuenta_nomina = '${c}' WHERE empleado_id = ${id};`),
    "ALTER TABLE fichas_empleados ALTER COLUMN cuenta_nomina SET NOT NULL;"
  ].join("\n");
}

writeFileSync(SALIDA + "faro-e8.sql", etapa8());
console.log("✅ datos/faro-e8.sql");
