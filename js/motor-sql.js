/* ============================================================
   SQLearning · Motor SQL (PostgreSQL con PGlite en un worker)
   - Todo lo que ejecuta el alumno va dentro de BEGIN … ROLLBACK:
     un DELETE de práctica nunca estropea la base. Una marca
     (SET LOCAL) dentro de esa transacción dice si el alumno se ha
     salido de ella (COMMIT, ABORT, END…); si es así, se recargan
     los datos. Tras cada sesión se limpia el estado de sesión
     (DISCARD ALL: PREPARE, cursores, cerrojos, SET…).
   - Si una consulta tarda más de TIEMPO_MAX, se mata el worker,
     se crea otro y se vuelven a cargar los datos.
   - Las llamadas se ponen en cola: nunca se mezclan dos sesiones.
   API: MOTOR.preparar("faro-e1"), MOTOR.ejecutar(sql),
        MOTOR.sesion(async db => …), MOTOR.esquema(),
        MOTOR.sinTextos(sql), MOTOR.sinComentarios(sql)
   ============================================================ */
(function () {
  const TIEMPO_MAX = 4000;        // ms por consulta del alumno
  const TIEMPO_INICIO = 60000;    // ms para arrancar PostgreSQL y cargar los datos
  const RUTA_WORKER = "js/motor-worker.js";
  const MARCA = "sqlearning.marca";

  let worker = null;
  let listo = null;               // Promesa: worker cargado
  let idMsg = 0;
  const pendientes = new Map();
  let datosActuales = null;       // { nombre, sql }
  const cacheDatos = {};
  let cola = Promise.resolve();

  // --- Léxico mínimo de SQL: comentarios, textos '…', nombres "…" y textos $etiqueta$…$etiqueta$ ---
  const LEXICO = /(--[^\n]*)|(\/\*[\s\S]*?(?:\*\/|$))|('(?:[^']|'')*'?)|("(?:[^"]|"")*"?)|(\$([A-Za-z_]\w*)?\$[\s\S]*?(?:\$\6\$|$))/g;

  /** Quita comentarios y vacía los textos (para buscar palabras clave o `;` sin falsos positivos). */
  function sinTextos(sql) {
    return sql.replace(LEXICO, (m, linea, bloque, texto, nombre) =>
      linea || bloque ? " " : nombre ? '""' : "''");
  }
  /** Quita solo los comentarios (respetando lo que hay dentro de los textos). */
  function sinComentarios(sql) {
    return sql.replace(LEXICO, (m, linea, bloque) => (linea || bloque ? " " : m));
  }

  function crearWorker() {
    const w = new Worker(window.CURSO ? CURSO.conVersion(RUTA_WORKER) : RUTA_WORKER, { type: "module" });
    worker = w;
    listo = new Promise((ok, mal) => {
      pendientes.set(0, m => (m.ok ? ok() : mal(m.error)));
    });
    // Si no llega a cargar, se descarta: la siguiente llamada lo intentará con uno nuevo
    listo.catch(() => { if (worker === w) { w.terminate(); worker = null; } });
    w.addEventListener("message", ev => {
      const m = ev.data;
      const fn = pendientes.get(m.id);
      if (fn) { pendientes.delete(m.id); fn(m); }
    });
    w.addEventListener("error", ev => {
      // Si el worker ni siquiera carga (p. ej. abierto con doble clic, file://, o sin red), avisa en vez de esperar
      const arranque = pendientes.get(0);
      if (arranque) {
        pendientes.delete(0);
        arranque({ ok: false, error: { mensaje: "No se pudo cargar el motor (" + (ev.message || "error de carga") + ")", codigo: "CARGA" } });
      } else console.error("motor-worker:", ev.message);
    });
  }

  function matarWorker() {
    if (worker) worker.terminate();
    worker = null;
    for (const fn of pendientes.values()) fn({ ok: false, error: { mensaje: "El motor se reinició", codigo: "REINICIO" } });
    pendientes.clear();
  }

  // Envía un mensaje al worker; si no contesta a tiempo, lo reinicia y recarga los datos
  async function enviar(tipo, args = {}, tiempo = TIEMPO_MAX) {
    if (!worker) crearWorker();
    await listo;
    const id = ++idMsg;
    return new Promise((ok, mal) => {
      const reloj = setTimeout(async () => {
        pendientes.delete(id);
        matarWorker();
        // Se avisa del corte cuando el motor nuevo ya está listo: así la cola no sigue con un motor a medias
        try { await arrancar(); } catch (e) { console.error("No se pudo reiniciar el motor", e); }
        mal({ mensaje: "La consulta tardó demasiado y se ha cortado.", codigo: "TIEMPO" });
      }, tiempo);
      pendientes.set(id, m => {
        clearTimeout(reloj);
        m.ok ? ok(m.datos) : mal(m.error);
      });
      worker.postMessage({ id, tipo, ...args });
    });
  }

  async function arrancar() {
    await enviar("iniciar", { sql: datosActuales?.sql || "" }, TIEMPO_INICIO);
  }

  // Pone una tarea en la cola: se ejecuta cuando terminen las anteriores
  function enCola(tarea) {
    const r = cola.then(tarea, tarea);
    cola = r.catch(() => {});
    return r;
  }

  async function cargarDatos(nombre) {
    if (!(nombre in cacheDatos)) {
      const ruta = "datos/" + nombre + ".sql";
      const r = await fetch(window.CURSO ? CURSO.conVersion(ruta) : ruta);
      if (!r.ok) throw new Error("No se encuentran los datos «" + nombre + "»");
      cacheDatos[nombre] = await r.text();
    }
    return cacheDatos[nombre];
  }

  // Convierte la posición (carácter) del error en línea y columna del texto del alumno
  function lineaDe(sql, posicion) {
    if (!posicion) return null;
    const antes = sql.slice(0, posicion - 1);
    const lineas = antes.split("\n");
    return { linea: lineas.length, columna: lineas[lineas.length - 1].length + 1 };
  }

  function errorAlumno(e, sql) {
    const err = Object.assign({ mensaje: String(e?.mensaje || e?.message || e) }, e);
    const pos = lineaDe(sql, e?.posicion);
    if (pos) Object.assign(err, pos);
    if (window.TRADUCTOR) err.explicacion = TRADUCTOR.explicar(err, sql);
    return err;
  }

  // Objeto «db» que reciben las sesiones (ya dentro de la cola y de la transacción)
  function crearDb(vistos = []) {
    return {
      ejecutar: sql => { vistos.push(sql); return enviar("ejecutar", { sql }); },
      consulta: async sql => {
        vistos.push(sql);
        const lista = await enviar("ejecutar", { sql });
        return lista[lista.length - 1] || { columnas: [], tipos: [], filas: [], afectadas: 0 };
      }
    };
  }

  // ¿Seguimos dentro de la transacción que abrió el motor? (la marca solo existe ahí)
  // La marca lleva un valor al azar en cada sesión: el alumno no puede fingirla tras un COMMIT.
  // Con la transacción abortada (25P02) no se puede leer: si el alumno escribió COMMIT/ROLLBACK/END/ABORT,
  // pudo salirse de la nuestra y abrir otra (COMMIT; BEGIN; …error…), así que se recarga por si acaso.
  const SALIDA = /\b(COMMIT|ROLLBACK|END|ABORT)\b/i;
  async function sigueDentro(valor, vistos) {
    try {
      const r = await enviar("consultar", { sql: `SELECT current_setting('${MARCA}', true)` });
      return r.filas[0]?.[0] === valor;
    } catch (e) {
      return e?.codigo === "25P02" && !vistos.some(sql => SALIDA.test(sinTextos(sinComentarios(sql))));
    }
  }

  // Abre una transacción, ejecuta fn(db) y la deshace siempre
  async function sesionInterna(fn) {
    const valor = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const vistos = [];
    // Zona horaria fija: las fechas con zona salen igual (y se comparan igual) viva donde viva el alumno
    await enviar("ejecutar", { sql: `BEGIN; SET LOCAL ${MARCA} = '${valor}'; SET LOCAL TIME ZONE 'UTC';` });
    let intacta = true;
    try {
      return await fn(crearDb(vistos));
    } finally {
      try {
        intacta = await sigueDentro(valor, vistos);
        await enviar("ejecutar", { sql: "ROLLBACK;" });
        // Aparte: varias órdenes en un mensaje forman un bloque, y DISCARD ALL no puede ir dentro de uno
        await enviar("ejecutar", { sql: "DISCARD ALL;" });
      } catch (e) {
        intacta = false;            // el worker pudo reiniciarse: mejor recargar
      }
      if (!intacta) await arrancar();
    }
  }

  // Órdenes que en el navegador no pueden funcionar y se quedarían esperando
  const NO_DISPONIBLE = /\bCOPY\b[^;]*\b(FROM\s+STDIN|TO\s+STDOUT)\b/i;

  window.MOTOR = {
    TIEMPO_MAX,
    sinTextos,
    sinComentarios,

    /** Arranca PostgreSQL con los datos indicados (p. ej. "faro-e1"). Si ya están cargados, no hace nada. */
    preparar(nombre) {
      return enCola(async () => {
        if (datosActuales?.nombre === nombre && worker) return;
        const sql = nombre ? await cargarDatos(nombre) : "";
        datosActuales = { nombre, sql };
        await arrancar();
      });
    },

    /**
     * Ejecuta lo que escribe el alumno (una o varias sentencias) sin cambiar la base.
     * Devuelve { ok, resultados: [...], ultimo, ms } o { ok: false, error, ms }.
     */
    ejecutar(sql) {
      return enCola(async () => {
        const t0 = performance.now();
        const copia = sinTextos(sql).match(NO_DISPONIBLE);
        if (copia) {
          const codigo = /^TO/i.test(copia[1]) ? "STDOUT" : "STDIN";
          return { ok: false, ms: 0, error: errorAlumno({ mensaje: `COPY … ${codigo === "STDOUT" ? "TO STDOUT" : "FROM STDIN"} no está disponible`, codigo }, sql) };
        }
        try {
          const resultados = await sesionInterna(db => db.ejecutar(sql));
          const conColumnas = resultados.filter(r => r.columnas.length);
          return {
            ok: true,
            resultados,
            ultimo: conColumnas[conColumnas.length - 1] || resultados[resultados.length - 1] || null,
            ms: Math.round(performance.now() - t0)
          };
        } catch (e) {
          return { ok: false, error: errorAlumno(e, sql), ms: Math.round(performance.now() - t0) };
        }
      });
    },

    /** Para revisiones: fn(db) corre dentro de una transacción que se deshace al terminar. */
    sesion(fn) {
      return enCola(() => sesionInterna(fn));
    },

    errorAlumno,

    /** Tablas, columnas, tipos, claves primarias y foráneas del esquema public. */
    esquema() {
      return enCola(async () => {
        const db = crearDb();
        const cols = await db.consulta(`
          SELECT c.table_name, c.column_name, c.data_type, c.is_nullable
          FROM information_schema.columns c
          JOIN information_schema.tables t
            ON t.table_name = c.table_name AND t.table_schema = c.table_schema
          WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
          ORDER BY c.table_name, c.ordinal_position;`);
        const claves = await db.consulta(`
          SELECT tc.table_name, kcu.column_name, tc.constraint_type,
                 ccu.table_name AS ref_tabla, ccu.column_name AS ref_columna
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
          LEFT JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name AND tc.constraint_type = 'FOREIGN KEY'
          WHERE tc.table_schema = 'public' AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY');`);
        const tablas = {};
        for (const [tabla, columna, tipo, nulo] of cols.filas) {
          tablas[tabla] ||= { nombre: tabla, columnas: [] };
          tablas[tabla].columnas.push({ nombre: columna, tipo, nulo: nulo === "YES", pk: false, fk: null });
        }
        for (const [tabla, columna, clase, refTabla, refColumna] of claves.filas) {
          const c = tablas[tabla]?.columnas.find(x => x.nombre === columna);
          if (!c) continue;
          if (clase === "PRIMARY KEY") c.pk = true;
          else c.fk = { tabla: refTabla, columna: refColumna };
        }
        for (const t of Object.values(tablas)) {
          const r = await db.consulta(`SELECT count(*) FROM "${t.nombre.replace(/"/g, '""')}";`);
          t.filas = r.filas[0][0];
        }
        return Object.values(tablas);
      });
    }
  };
})();
