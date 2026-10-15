/* ============================================================
   SQLearning · Índice del curso (expedientes y diligencias)
   Debe coincidir con docs/PLAN_CURSO.md (mismo id, archivo y título).
   listo: true solo cuando exista el archivo de la lección.
   Las lecciones se registran con CURSO.registrar({...}).
   ============================================================ */
(function () {
  // Versión de la web (la escribe herramientas/version.mjs): evita mezclar archivos viejos de la caché
  const VERSION = "202610151620";

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
        { id: "e0-02", archivo: "e0-02-del-excel-a-las-tablas.js", titulo: "Del Excel gigante a las tablas", listo: true },
        { id: "e0-03", archivo: "e0-03-logica-y-o-no.js", titulo: "Verdadero o falso: lógica Y/O/NO", listo: true },
        { id: "e0-04", archivo: "e0-04-conjuntos.js", titulo: "Conjuntos: unir, cruzar y restar", listo: true },
        { id: "e0-05", archivo: "e0-05-entidades-y-atributos.js", titulo: "Entidades y atributos", listo: true },
        { id: "e0-06", archivo: "e0-06-relaciones-y-claves.js", titulo: "Relaciones y claves", listo: true },
        { id: "e0-07", archivo: "e0-07-diagramas-er.js", titulo: "Diagramas entidad-relación", listo: true },
        { id: "e0-08", archivo: "e0-08-ciclo-del-analisis.js", titulo: "El ciclo del análisis y los roles", listo: true },
        { id: "e0-09", archivo: "e0-09-privacidad-y-etica.js", titulo: "Privacidad y ética de los datos", listo: true },
        { id: "e0-10", archivo: "e0-10-caso-ordenar-el-archivo.js", titulo: "Caso: Ordenar el archivo", listo: true, caso: true }
      ]
    },
    {
      n: 1, carpeta: "1-primer-dia", titulo: "Primer día", departamento: "Datos · Onboarding", datos: "faro-e1",
      niveles: [
        { id: "e1-01", archivo: "e1-01-que-es-una-base-de-datos.js", titulo: "¿Qué es una base de datos?", listo: true },
        { id: "e1-02", archivo: "e1-02-elegir-columnas.js", titulo: "Elegir columnas", listo: true },
        { id: "e1-03", archivo: "e1-03-leer-el-esquema.js", titulo: "Leer el esquema y los tipos", listo: true },
        { id: "e1-04", archivo: "e1-04-columnas-calculadas.js", titulo: "Columnas calculadas", listo: true },
        { id: "e1-05", archivo: "e1-05-alias.js", titulo: "Ponerle nombre: alias", listo: true },
        { id: "e1-06", archivo: "e1-06-distinct.js", titulo: "Sin repetir: DISTINCT", listo: true },
        { id: "e1-07", archivo: "e1-07-ordenar.js", titulo: "Ordenar resultados", listo: true },
        { id: "e1-08", archivo: "e1-08-limit-offset.js", titulo: "Los primeros N: LIMIT y OFFSET", listo: true },
        { id: "e1-09", archivo: "e1-09-caso-inventario-imposible.js", titulo: "Caso: El inventario imposible", listo: true, caso: true }
      ]
    },
    {
      n: 2, carpeta: "2-atencion-cliente", titulo: "Atención al cliente", departamento: "Atención al cliente", datos: "faro-e2",
      niveles: [
        { id: "e2-01", archivo: "e2-01-where.js", titulo: "Filtrar filas: WHERE", listo: true },
        { id: "e2-02", archivo: "e2-02-comparar.js", titulo: "Comparar: mayor, menor, distinto", listo: true },
        { id: "e2-03", archivo: "e2-03-and-or-not.js", titulo: "Combinar condiciones: AND, OR, NOT", listo: true },
        { id: "e2-04", archivo: "e2-04-parentesis.js", titulo: "Paréntesis y prioridad", listo: true },
        { id: "e2-05", archivo: "e2-05-in.js", titulo: "Listas: IN y NOT IN", listo: true },
        { id: "e2-06", archivo: "e2-06-between-fechas.js", titulo: "Rangos y fechas: BETWEEN", listo: true },
        { id: "e2-07", archivo: "e2-07-like-ilike.js", titulo: "Buscar texto: LIKE e ILIKE", listo: true },
        { id: "e2-08", archivo: "e2-08-null.js", titulo: "El vacío: NULL", listo: true },
        { id: "e2-09", archivo: "e2-09-caso-clientes-de-madrugada.js", titulo: "Caso: Clientes de madrugada", listo: true, caso: true }
      ]
    },
    {
      n: 3, carpeta: "3-ventas", titulo: "Ventas", departamento: "Ventas", datos: "faro-e3",
      niveles: [
        { id: "e3-01", archivo: "e3-01-count.js", titulo: "Contar filas: COUNT", listo: true },
        { id: "e3-02", archivo: "e3-02-sum-avg-round.js", titulo: "Sumar y promediar: SUM, AVG y ROUND", listo: true },
        { id: "e3-03", archivo: "e3-03-min-max.js", titulo: "Los extremos: MIN y MAX", listo: true },
        { id: "e3-04", archivo: "e3-04-count-distinct.js", titulo: "Contar distintos: COUNT(DISTINCT)", listo: true },
        { id: "e3-05", archivo: "e3-05-group-by.js", titulo: "Agrupar: GROUP BY", listo: true },
        { id: "e3-06", archivo: "e3-06-grupos-varias-columnas.js", titulo: "Grupos por varias columnas", listo: true },
        { id: "e3-07", archivo: "e3-07-having.js", titulo: "Filtrar grupos: HAVING", listo: true },
        { id: "e3-08", archivo: "e3-08-orden-logico.js", titulo: "El orden en que piensa SQL", listo: true },
        { id: "e3-09", archivo: "e3-09-caso-reembolsos-disparados.js", titulo: "Caso: Reembolsos disparados", listo: true, caso: true }
      ]
    },
    {
      n: 4, carpeta: "4-logistica", titulo: "Logística", departamento: "Logística", datos: "faro-e4",
      niveles: [
        { id: "e4-01", archivo: "e4-01-claves-que-conectan-tablas.js", titulo: "Claves que conectan tablas: PK y FK", listo: true },
        { id: "e4-02", archivo: "e4-02-inner-join.js", titulo: "Unir dos tablas: INNER JOIN", listo: true },
        { id: "e4-03", archivo: "e4-03-left-right-full-join.js", titulo: "Que no se pierda nadie: LEFT, RIGHT y FULL JOIN", listo: true },
        { id: "e4-04", archivo: "e4-04-huerfanos.js", titulo: "Huérfanos: LEFT JOIN … IS NULL", listo: true },
        { id: "e4-05", archivo: "e4-05-tres-tablas-o-mas.js", titulo: "Tres tablas o más", listo: true },
        { id: "e4-06", archivo: "e4-06-join-con-group-by.js", titulo: "Unir y resumir: JOIN con GROUP BY", listo: true },
        { id: "e4-07", archivo: "e4-07-self-join.js", titulo: "Una tabla consigo misma: self join", listo: true },
        { id: "e4-08", archivo: "e4-08-cross-join.js", titulo: "Todas las combinaciones: CROSS JOIN", listo: true },
        { id: "e4-09", archivo: "e4-09-union-intersect-except.js", titulo: "Apilar resultados: UNION, INTERSECT y EXCEPT", listo: true },
        { id: "e4-10", archivo: "e4-10-caso-pedidos-fantasma.js", titulo: "Caso: Pedidos fantasma", listo: true, caso: true }
      ]
    },
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
    VERSION,
    /** Añade ?v=VERSION a una ruta local (lecciones, datos). */
    conVersion: ruta => (VERSION ? ruta + (ruta.includes("?") ? "&" : "?") + "v=" + VERSION : ruta),
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
