/* ============================================================
   SQLearning · Índice del curso (expedientes y diligencias)
   Debe coincidir con docs/PLAN_CURSO.md (mismo id, archivo y título).
   listo: true solo cuando exista el archivo de la lección.
   Las lecciones se registran con CURSO.registrar({...}).
   ============================================================ */
(function () {
  // Diligencias aún sin título (expedientes que se escribirán más adelante)
  const pendientes = (etapa, n) => Array.from({ length: n }, (_, i) => {
    const num = String(i + 1).padStart(2, "0");
    return { id: `e${etapa}-${num}`, archivo: null, titulo: null, listo: false };
  });

  const ETAPAS = [
    {
      n: 0, carpeta: "0-archivo-de-papel", titulo: "El archivo de papel", departamento: "Formación previa",
      opcional: true, datos: null,
      niveles: [
        { id: "e0-01", archivo: "e0-01-que-es-un-dato.js", titulo: "¿Qué es un dato?", listo: true },
        { id: "e0-02", archivo: "e0-02-del-excel-a-las-tablas.js", titulo: "Del Excel gigante a las tablas", listo: false },
        { id: "e0-03", archivo: "e0-03-logica-y-o-no.js", titulo: "Verdadero o falso: lógica Y/O/NO", listo: false },
        { id: "e0-04", archivo: "e0-04-conjuntos.js", titulo: "Conjuntos: unir, cruzar y restar", listo: false },
        { id: "e0-05", archivo: "e0-05-entidades-y-atributos.js", titulo: "Entidades y atributos", listo: false },
        { id: "e0-06", archivo: "e0-06-relaciones-y-claves.js", titulo: "Relaciones y claves", listo: false },
        { id: "e0-07", archivo: "e0-07-diagramas-er.js", titulo: "Diagramas entidad-relación", listo: false },
        { id: "e0-08", archivo: "e0-08-ciclo-del-analisis.js", titulo: "El ciclo del análisis y los roles", listo: false },
        { id: "e0-09", archivo: "e0-09-privacidad-y-etica.js", titulo: "Privacidad y ética de los datos", listo: false },
        { id: "e0-10", archivo: "e0-10-caso-ordenar-el-archivo.js", titulo: "Caso: Ordenar el archivo", listo: false, caso: true }
      ]
    },
    {
      n: 1, carpeta: "1-primer-dia", titulo: "Primer día", departamento: "Datos · Onboarding", datos: "faro-e1",
      niveles: [
        { id: "e1-01", archivo: "e1-01-que-es-una-base-de-datos.js", titulo: "¿Qué es una base de datos?", listo: true },
        { id: "e1-02", archivo: "e1-02-elegir-columnas.js", titulo: "Elegir columnas", listo: false },
        { id: "e1-03", archivo: "e1-03-leer-el-esquema.js", titulo: "Leer el esquema y los tipos", listo: false },
        { id: "e1-04", archivo: "e1-04-columnas-calculadas.js", titulo: "Columnas calculadas", listo: false },
        { id: "e1-05", archivo: "e1-05-alias.js", titulo: "Ponerle nombre: alias", listo: false },
        { id: "e1-06", archivo: "e1-06-distinct.js", titulo: "Sin repetir: DISTINCT", listo: false },
        { id: "e1-07", archivo: "e1-07-ordenar.js", titulo: "Ordenar resultados", listo: false },
        { id: "e1-08", archivo: "e1-08-limit-offset.js", titulo: "Los primeros N: LIMIT y OFFSET", listo: false },
        { id: "e1-09", archivo: "e1-09-caso-inventario-imposible.js", titulo: "Caso: El inventario imposible", listo: false, caso: true }
      ]
    },
    { n: 2, carpeta: "2-atencion-cliente", titulo: "Atención al cliente", departamento: "Atención al cliente", datos: "faro-e2", niveles: pendientes(2, 9) },
    { n: 3, carpeta: "3-ventas", titulo: "Ventas", departamento: "Ventas", datos: "faro-e3", niveles: pendientes(3, 9) },
    { n: 4, carpeta: "4-logistica", titulo: "Logística", departamento: "Logística", datos: "faro-e4", niveles: pendientes(4, 10) },
    { n: 5, carpeta: "5-migracion", titulo: "Migración", departamento: "Sistemas · Migración", datos: "faro-e5", niveles: pendientes(5, 10) },
    { n: 6, carpeta: "6-it", titulo: "IT", departamento: "Sistemas", datos: "faro-e6", niveles: pendientes(6, 10) },
    { n: 7, carpeta: "7-direccion", titulo: "Dirección", departamento: "Dirección general", datos: "faro-e7", niveles: pendientes(7, 11) },
    { n: 8, carpeta: "8-analitica", titulo: "Analítica", departamento: "Datos · El desenlace", datos: "faro-e8", niveles: pendientes(8, 12) }
  ];
  // El último nivel de cada etapa es su caso
  for (const e of ETAPAS) e.niveles[e.niveles.length - 1].caso = true;

  const lecciones = {};

  window.CURSO = {
    ETAPAS,
    /** Lo llama cada archivo de lección. */
    registrar(leccion) { lecciones[leccion.id] = leccion; },
    leccion: id => lecciones[id] || null,
    /** { etapa, nivel, indice } de un id de nivel, o null. */
    buscar(id) {
      for (const etapa of ETAPAS) {
        const indice = etapa.niveles.findIndex(n => n.id === id);
        if (indice >= 0) return { etapa, nivel: etapa.niveles[indice], indice };
      }
      return null;
    },
    /** Código corto para mostrar: «e1-03» → «1.3». */
    codigo: id => id.replace(/^e(\d+)-0?(\d+)$/, "$1.$2")
  };
})();
