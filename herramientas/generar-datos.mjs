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
  [5, "Online", "2017-11-15"]
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
