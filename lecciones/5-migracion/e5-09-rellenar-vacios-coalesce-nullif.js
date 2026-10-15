CURSO.registrar({
  id: "e5-09",
  titulo: "Rellenar vacíos: COALESCE y NULLIF",
  xp: 40,
  objetivo: "Sabrás rellenar los NULL con un valor por defecto usando COALESCE, convertir los falsos vacíos ('', 'N/D') en NULL de verdad con NULLIF y dividir sin miedo a dividir entre cero.",
  pasos: [
    {
      tipo: "historia",
      de: "nuria",
      asunto: "Tres formas de no tener teléfono",
      texto: "En el CRM, un cliente sin teléfono puede tener `NULL`, puede tener `''` (un texto vacío) o puede tener `N/D`, que alguien escribió a mano. Para el sistema nuevo, los tres son lo mismo: **no hay teléfono**.\nY el nuevo tampoco acepta huecos en sus informes: donde no hay dato, quiere un valor claro. Hoy toca rellenar vacíos… pero con cabeza."
    },
    {
      tipo: "explicacion",
      titulo: "COALESCE: el primero que no esté vacío",
      texto: "`COALESCE(a, b, c, …)` devuelve el **primer valor que no es `NULL`** de la lista. Si `a` tiene algo, sale `a`; si es `NULL`, prueba con `b`; y así hasta el final.\nEl uso típico es poner un valor por defecto: `COALESCE(ciudad, 'Desconocida')`. En `clientes` hay 10 personas sin ciudad, y el ejemplo las muestra con su relleno.\nOjo: todos los valores deben ser del **mismo tipo**. `COALESCE(SUM(coste), 'sin envíos')` da el error 22P02: PostgreSQL intenta convertir `'sin envíos'` en número.",
      ejemplo: `SELECT id, nombre, ciudad,
  COALESCE(ciudad, 'Desconocida') AS ciudad_informe
FROM clientes
WHERE ciudad IS NULL
ORDER BY id;`,
      otrosMotores: "`COALESCE` y `NULLIF` son estándar y existen en todos. Además, SQL Server tiene `ISNULL(a, b)`, MySQL y BigQuery `IFNULL(a, b)` y Oracle `NVL(a, b)`, que solo admiten dos valores."
    },
    {
      tipo: "explicacion",
      titulo: "NULLIF: convertir un falso vacío en NULL",
      texto: "`COALESCE` solo rellena los `NULL` de verdad: un `''` o un `'N/D'` **no son `NULL`**, son textos, y los deja pasar.\nPara eso está `NULLIF(a, b)`: devuelve `NULL` si `a` y `b` son iguales y, si no, devuelve `a` tal cual. Encadenando dos:\n`NULLIF(NULLIF(trim(telefono), ''), 'N/D')`\nel `''` y el `'N/D'` se convierten en `NULL`, y el resto de teléfonos sigue igual. Así salen los **42** clientes sin teléfono: 20 `NULL` + 12 `N/D` + 10 `''`.",
      ejemplo: `SELECT crm_id, telefono,
  NULLIF(NULLIF(trim(telefono), ''), 'N/D') AS telefono_real
FROM crm_clientes
ORDER BY crm_id
LIMIT 15;`
    },
    {
      tipo: "prediccion",
      consulta: `SELECT COALESCE(NULL, NULLIF('N/D', 'N/D'), 'sin dato') AS resultado;`,
      pregunta: "¿Qué devuelve esta consulta?",
      opciones: ["`NULL`", "`'N/D'`", "`'sin dato'`"],
      correcta: 2,
      explicacion: "`NULLIF('N/D', 'N/D')` da `NULL` (son iguales). Así que `COALESCE` ve `NULL`, `NULL` y `'sin dato'`, y devuelve el primero que no está vacío: **`'sin dato'`**."
    },
    {
      tipo: "arreglar",
      enunciado: "Esta consulta debería contar los clientes del CRM **sin teléfono** (`NULL`, `''` o `'N/D'`) en una columna `sin_telefono`, rellenando con `'sin teléfono'`. Pero solo cuenta 20: se le escapan los falsos vacíos. Arréglala para que salgan los 42.",
      inicial: `SELECT COUNT(*) AS sin_telefono
FROM crm_clientes
WHERE COALESCE(telefono, 'sin teléfono') = 'sin teléfono';`,
      solucion: `SELECT COUNT(*) AS sin_telefono
FROM crm_clientes
WHERE COALESCE(NULLIF(NULLIF(trim(telefono), ''), 'N/D'), 'sin teléfono') = 'sin teléfono';`,
      pistas: [
        "Antes de rellenar con `COALESCE`, convierte `''` y `'N/D'` en `NULL` de verdad con dos `NULLIF`, como en el ejemplo.",
        "Cambia telefono por NULLIF(NULLIF(trim(telefono), ''), 'N/D') dentro del COALESCE."
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Dividir sin miedo: x / NULLIF(y, 0)",
      texto: "Barcelona abre hoy y aún no tiene pedidos. Si calculas el porcentaje de reembolsos por tienda dividiendo entre el número de pedidos, en Barcelona divides **entre 0**, y PostgreSQL para toda la consulta con el error 22012 (`division by zero`).\nEl arreglo: dividir entre `NULLIF(COUNT(p.id), 0)`. Si el divisor es 0, se convierte en `NULL`, y cualquier cuenta con `NULL` da `NULL`: Barcelona sale **sin dato** en vez de romperlo todo.\nEl `100.0` (con decimales) evita la división entera: `3 / 4` da 0, `100.0 * 3 / 4` da 75.",
      ejemplo: `SELECT t.ciudad AS tienda,
  COUNT(p.id) AS pedidos,
  ROUND(100.0 * COUNT(CASE WHEN p.estado = 'reembolsado' THEN 1 END) / NULLIF(COUNT(p.id), 0), 1) AS pct_reembolso
FROM tiendas AS t
LEFT JOIN pedidos AS p ON p.tienda_id = t.id
GROUP BY t.id, t.ciudad
ORDER BY t.id;`,
      consejo: "Rellena para **presentar**, no para calcular. «0 €» y «no lo sabemos» no son lo mismo: si rellenas con 0 el gasto que falta y luego haces una media, la media baja y miente. Deja el `NULL` mientras calculas y pon el `COALESCE` al final, en lo que ve la gente."
    },
    {
      tipo: "reto",
      de: "nuria",
      enunciado: "El sistema nuevo no acepta huecos en el informe de transportistas. Muestra **todos** los transportistas, también los que no tienen envíos: `transportista` (el nombre), `envios` (cuántos envíos tiene) y `coste_total` (la suma de `coste`, con **0** si no tiene envíos). Ordena de **más a menos** envíos.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas transportista, envios y coste_total, con los 4 transportistas", prueba: (r) => PRUEBA.columnas(r, ["transportista", "envios", "coste_total"]) && (r?.filas?.length ?? 0) === 4 },
        { texto: "No queda ningún NULL: Logística Delta sale con 0 envíos y 0 de coste", prueba: (r) => (r?.filas?.length ?? 0) > 0 && (r?.filas || []).every(f => f.every(v => v !== null && v !== undefined)) && PRUEBA.contiene(r, "transportista", "Logística Delta") },
        { texto: "Los costes suman 9 245,80 €", prueba: (r) => {
          const i = (r?.columnas || []).findIndex(c => String(c).toLowerCase() === "coste_total");
          if (i < 0) return false;
          const s = (r?.filas || []).reduce((t, f) => t + Number(f[i] ?? 0), 0);
          return Math.abs(s - 9245.8) < 0.005;
        } },
        { texto: "Cada transportista con sus envíos y su coste, de más a menos envíos", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT t.nombre AS transportista,
  COUNT(e.id) AS envios,
  COALESCE(SUM(e.coste), 0) AS coste_total
FROM transportistas AS t
LEFT JOIN envios AS e ON e.transportista_id = t.id
GROUP BY t.id, t.nombre
ORDER BY envios DESC;`) }
      ],
      pistas: [
        "Parte de `transportistas` con un `LEFT JOIN` a `envios`, cuenta con `COUNT(e.id)` (no `COUNT(*)`) y envuelve la suma en `COALESCE(…, 0)`.",
        "SELECT t.nombre AS transportista, COUNT(e.id) AS envios, COALESCE(SUM(e.coste), 0) AS coste_total FROM transportistas AS t LEFT JOIN envios AS e ON e.transportista_id = t.id GROUP BY t.id, t.nombre ORDER BY envios DESC;"
      ],
      solucion: `SELECT t.nombre AS transportista,
  COUNT(e.id) AS envios,
  COALESCE(SUM(e.coste), 0) AS coste_total
FROM transportistas AS t
LEFT JOIN envios AS e ON e.transportista_id = t.id
GROUP BY t.id, t.nombre
ORDER BY envios DESC;`
    }
  ]
});
