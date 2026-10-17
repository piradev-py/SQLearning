/* ============================================================
   SQLearning · Índice del curso (expedientes y diligencias)
   Debe coincidir con docs/PLAN_CURSO.md (mismo id, archivo y título).
   listo: true solo cuando exista el archivo de la lección.
   Las lecciones se registran con CURSO.registrar({...}).
   ============================================================ */
(function () {
  // Versión de la web (la escribe herramientas/version.mjs): evita mezclar archivos viejos de la caché
  const VERSION = "202610172331";

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
    { n: 5, carpeta: "5-migracion", titulo: "Migración", departamento: "Sistemas · Migración", datos: "faro-e5",
      niveles: [
        { id: "e5-01", archivo: "e5-01-datos-que-llegan-como-texto.js", titulo: "Datos que llegan como texto: CAST", listo: true },
        { id: "e5-02", archivo: "e5-02-mayusculas-y-espacios.js", titulo: "Mayúsculas y espacios: UPPER, LOWER, INITCAP y TRIM", listo: true },
        { id: "e5-03", archivo: "e5-03-trocear-texto.js", titulo: "Trocear texto: LEFT, SUBSTRING y SPLIT_PART", listo: true },
        { id: "e5-04", archivo: "e5-04-sustituir-y-componer.js", titulo: "Sustituir y componer: REPLACE, CONCAT y LPAD", listo: true },
        { id: "e5-05", archivo: "e5-05-patrones-expresiones-regulares.js", titulo: "Patrones: expresiones regulares", listo: true },
        { id: "e5-06", archivo: "e5-06-decidir-fila-a-fila-case.js", titulo: "Decidir fila a fila: CASE", listo: true },
        { id: "e5-07", archivo: "e5-07-fechas-de-verdad.js", titulo: "Fechas de verdad: to_date, EXTRACT y date_trunc", listo: true },
        { id: "e5-08", archivo: "e5-08-intervalos-y-to-char.js", titulo: "Cuánto tarda y cómo se ve: intervalos y to_char", listo: true },
        { id: "e5-09", archivo: "e5-09-rellenar-vacios-coalesce-nullif.js", titulo: "Rellenar vacíos: COALESCE y NULLIF", listo: true },
        { id: "e5-10", archivo: "e5-10-duplicados-y-valores-imposibles.js", titulo: "Duplicados y valores imposibles", listo: true },
        { id: "e5-11", archivo: "e5-11-caso-una-sola-direccion.js", titulo: "Caso: Una sola dirección", listo: true, caso: true }
      ]
    },
    { n: 6, carpeta: "6-it", titulo: "IT", departamento: "Sistemas", datos: "faro-e6",
      niveles: [
        { id: "e6-01", archivo: "e6-01-crear-una-tabla.js", titulo: "Crear una tabla: CREATE TABLE", listo: true },
        { id: "e6-02", archivo: "e6-02-meter-filas-insert.js", titulo: "Meter filas: INSERT", listo: true },
        { id: "e6-03", archivo: "e6-03-insert-select-y-create-as.js", titulo: "Copiar desde una consulta: INSERT … SELECT y CREATE TABLE … AS", listo: true },
        { id: "e6-04", archivo: "e6-04-reglas-que-protegen.js", titulo: "Reglas que protegen: NOT NULL, UNIQUE, CHECK y DEFAULT", listo: true },
        { id: "e6-05", archivo: "e6-05-claves-que-obligan.js", titulo: "Claves que obligan: PRIMARY KEY, FOREIGN KEY e identidad", listo: true },
        { id: "e6-06", archivo: "e6-06-cambiar-datos-update.js", titulo: "Cambiar datos: UPDATE", listo: true },
        { id: "e6-07", archivo: "e6-07-borrar-delete-truncate-drop.js", titulo: "Borrar: DELETE, TRUNCATE y DROP", listo: true },
        { id: "e6-08", archivo: "e6-08-transacciones.js", titulo: "Todo o nada: transacciones", listo: true },
        { id: "e6-09", archivo: "e6-09-normalizacion.js", titulo: "Diseñar bien: normalización", listo: true },
        { id: "e6-10", archivo: "e6-10-indices-y-explain.js", titulo: "Ir más rápido: índices y EXPLAIN", listo: true },
        { id: "e6-11", archivo: "e6-11-vistas.js", titulo: "Guardar una consulta: vistas", listo: true },
        { id: "e6-12", archivo: "e6-12-caso-la-cuenta-admin-temp.js", titulo: "Caso: La cuenta admin_temp", listo: true, caso: true }
      ]
    },
    { n: 7, carpeta: "7-direccion", titulo: "Dirección", departamento: "Dirección general", datos: "faro-e7",
      niveles: [
        { id: "e7-01", archivo: "e7-01-subconsultas.js", titulo: "Una consulta dentro de otra: subconsultas", listo: true },
        { id: "e7-02", archivo: "e7-02-subconsultas-en-from.js", titulo: "Tablas que salen de una consulta: subconsultas en FROM", listo: true },
        { id: "e7-03", archivo: "e7-03-exists-y-not-exists.js", titulo: "¿Existe o no?: EXISTS y NOT EXISTS", listo: true },
        { id: "e7-04", archivo: "e7-04-cte-con-with.js", titulo: "Paso a paso: CTE con WITH", listo: true },
        { id: "e7-05", archivo: "e7-05-cte-recursiva.js", titulo: "Jerarquías: CTE recursiva", listo: true },
        { id: "e7-06", archivo: "e7-06-filter-y-generate-series.js", titulo: "Contar con condiciones y rellenar huecos: FILTER y generate_series", listo: true },
        { id: "e7-07", archivo: "e7-07-rankings-funciones-ventana.js", titulo: "Rankings: funciones ventana", listo: true },
        { id: "e7-08", archivo: "e7-08-lag-y-lead.js", titulo: "Antes y después: LAG y LEAD", listo: true },
        { id: "e7-09", archivo: "e7-09-acumulados-y-medias-moviles.js", titulo: "Acumulados y medias móviles", listo: true },
        { id: "e7-10", archivo: "e7-10-ntile-y-percentiles.js", titulo: "Repartir en grupos: NTILE y percentiles", listo: true },
        { id: "e7-11", archivo: "e7-11-caso-la-coartada-de-ivan.js", titulo: "Caso: ¿Dónde estaba cada uno?", listo: true, caso: true }
      ]
    },
    { n: 8, carpeta: "8-analitica", titulo: "Analítica", departamento: "Datos · El desenlace", datos: "faro-e8",
      niveles: [
        { id: "e8-01", archivo: "e8-01-kpis.js", titulo: "Medir lo que importa: KPIs", listo: true },
        { id: "e8-02", archivo: "e8-02-mom-yoy-y-meses-a-medias.js", titulo: "¿Vamos mejor o peor?: MoM, YoY y meses a medias", listo: true },
        { id: "e8-03", archivo: "e8-03-cohortes-y-retencion.js", titulo: "Cohortes y retención: ¿vuelven los clientes?", listo: true },
        { id: "e8-04", archivo: "e8-04-embudos.js", titulo: "Embudos: dónde se pierden las ventas", listo: true },
        { id: "e8-05", archivo: "e8-05-segmentar-clientes-rfm.js", titulo: "Segmentar clientes: RFM", listo: true },
        { id: "e8-06", archivo: "e8-06-estadistica-descriptiva.js", titulo: "Estadística descriptiva: centro, dispersión e histogramas", listo: true },
        { id: "e8-07", archivo: "e8-07-z-score-y-atipicos.js", titulo: "Lo que no es normal: z-score y atípicos", listo: true },
        { id: "e8-08", archivo: "e8-08-test-a-b.js", titulo: "¿Funciona el cambio?: test A/B", listo: true },
        { id: "e8-09", archivo: "e8-09-tablas-dinamicas.js", titulo: "Tablas dinámicas: pivotar y subtotales", listo: true },
        { id: "e8-10", archivo: "e8-10-cuadro-de-mando.js", titulo: "Un cuadro de mando en una consulta", listo: true },
        { id: "e8-11", archivo: "e8-11-contarlo-bien-el-informe.js", titulo: "Contarlo bien: el informe", listo: true },
        { id: "e8-12", archivo: "e8-12-caso-caso-cerrado.js", titulo: "Caso: Caso cerrado", listo: true, caso: true }
      ]
    }
  ];
  // El último nivel de cada etapa es su caso
  for (const e of ETAPAS) e.niveles[e.niveles.length - 1].caso = true;

  const lecciones = {};

  // Sin conexión (sw.js, en la raíz): en la web publicada; en local estorbaría a las pruebas, salvo que se pida
  // con localStorage «sqlearning-sw» = "1". En el propio service worker (importScripts) no hay document.
  if (typeof document !== "undefined" && "serviceWorker" in navigator) {
    let pedido = false;
    try { pedido = localStorage.getItem("sqlearning-sw") === "1"; } catch (e) { /* sin almacenamiento */ }
    if (pedido || !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname))
      navigator.serviceWorker.register(new URL("../sw.js", document.currentScript.src)).catch(() => {});
  }

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
