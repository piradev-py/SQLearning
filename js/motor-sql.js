/* ============================================================
   SQLearning · Motor SQL (PostgreSQL con PGlite en un worker)
   - Todo lo que ejecuta el alumno va dentro de BEGIN … ROLLBACK:
     un DELETE de práctica nunca estropea la base.
   - Si una consulta tarda más de TIEMPO_MAX, se mata el worker,
     se crea otro y se vuelven a cargar los datos.
   - Las llamadas se ponen en cola: nunca se mezclan dos sesiones.
   API: MOTOR.preparar("faro-e1"), MOTOR.ejecutar(sql),
        MOTOR.sesion(async db => …), MOTOR.esquema()
   ============================================================ */
(function () {
  const TIEMPO_MAX = 4000;        // ms por consulta del alumno
  const TIEMPO_INICIO = 60000;    // ms para arrancar PostgreSQL y cargar los datos
  const RUTA_WORKER = "js/motor-worker.js";

  let worker = null;
  let listo = null;               // Promesa: worker cargado
  let idMsg = 0;
  const pendientes = new Map();
  let datosActuales = null;       // { nombre, sql }
  const cacheDatos = {};
  let cola = Promise.resolve();

  function crearWorker() {
    worker = new Worker(RUTA_WORKER, { type: "module" });
    listo = new Promise((ok, mal) => {
      pendientes.set(0, m => (m.ok ? ok() : mal(m.error)));
    });
    worker.addEventListener("message", ev => {
      const m = ev.data;
      const fn = pendientes.get(m.id);
      if (fn) { pendientes.delete(m.id); fn(m); }
    });
    worker.addEventListener("error", ev => {
      console.error("motor-worker:", ev.message);
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
      const r = await fetch("datos/" + nombre + ".sql");
      if (!r.ok) throw new Error("No se encuentran los datos «" + nombre + "»");
      cacheDatos[nombre] = await r.text();
    }
    return cacheDatos[nombre];
  }

  // ¿El alumno controla transacciones él mismo? Entonces la base se recarga después.
  const CONTROL_TX = /\b(BEGIN|COMMIT|ROLLBACK|START\s+TRANSACTION|END\s*;|SAVEPOINT|RELEASE)\b/i;

  // Quita comentarios y textos entre comillas (para buscar palabras clave sin falsos positivos)
  function sinTextos(sql) {
    return sql
      .replace(/--[^\n]*/g, " ")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/'(?:[^']|'')*'/g, "''")
      .replace(/"(?:[^"]|"")*"/g, '""');
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
  function crearDb() {
    return {
      ejecutar: sql => enviar("ejecutar", { sql }),
      consulta: async sql => {
        const lista = await enviar("ejecutar", { sql });
        return lista[lista.length - 1] || { columnas: [], tipos: [], filas: [], afectadas: 0 };
      }
    };
  }

  // Abre una transacción, ejecuta fn(db) y la deshace siempre
  async function sesionInterna(fn, sqlAlumno) {
    await enviar("ejecutar", { sql: "BEGIN;" });
    try {
      return await fn(crearDb());
    } finally {
      try { await enviar("ejecutar", { sql: "ROLLBACK;" }); } catch (e) { /* el worker pudo reiniciarse */ }
      if (sqlAlumno && CONTROL_TX.test(sinTextos(sqlAlumno))) await arrancar();
    }
  }

  window.MOTOR = {
    TIEMPO_MAX,
    sinTextos,

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
        try {
          const resultados = await sesionInterna(db => db.ejecutar(sql), sql);
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
    sesion(fn, sqlAlumno) {
      return enCola(() => sesionInterna(fn, sqlAlumno));
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
