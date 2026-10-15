CURSO.registrar({
  id: "e5-03",
  titulo: "Trocear texto: LEFT, SUBSTRING y SPLIT_PART",
  xp: 35,
  objetivo: "Sabrás sacar un trozo de un texto por su posición (LEFT, RIGHT, SUBSTRING), buscar dónde está un carácter (POSITION) y partir un texto por un separador (SPLIT_PART).",
  pasos: [
    {
      tipo: "historia",
      de: "nuria",
      asunto: "Lo que esconde un email",
      texto: "El sistema nuevo quiere saber, de cada cliente, con qué **proveedor de correo** se registró: el trozo que va detrás de la `@`. El viejo no lo guardaba aparte.\nY ya que estamos: la **provincia** está escondida en las dos primeras cifras del código postal (28 Madrid, 46 Valencia, 41 Sevilla, 48 Bilbao…). No quiero escribir una columna nueva a mano: quiero sacarla del texto que ya tenemos."
    },
    {
      tipo: "explicacion",
      titulo: "Cortar por posición: LEFT, RIGHT y SUBSTRING",
      texto: "Piensa en un texto como una fila de casillas numeradas **desde 1**.\n- `LEFT(x, n)`: las `n` primeras casillas. `LEFT(cp, 2)` es la provincia.\n- `RIGHT(x, n)`: las `n` últimas.\n- `SUBSTRING(x FROM i FOR n)`: `n` casillas empezando en la `i`. En `'2022-01-04'`, `SUBSTRING(fecha_alta FROM 6 FOR 2)` es el mes, `'01'`.\nMira el resultado con calma: hay dos filas que no salen como esperabas. Ahora vemos por qué.",
      ejemplo: `SELECT crm_id, cp, LEFT(cp, 2) AS provincia, fecha_alta,
  LEFT(fecha_alta, 4) AS anio, SUBSTRING(fecha_alta FROM 6 FOR 2) AS mes
FROM crm_clientes
WHERE crm_id IN (1, 2, 3, 9)
ORDER BY crm_id;`
    },
    {
      tipo: "explicacion",
      titulo: "Cortar por posición es frágil",
      texto: "Cortar por posición solo funciona si **todos** los valores tienen el mismo formato:\n- La fecha del cliente 1 es `'19/06/2022'` (día/mes/año), así que `LEFT(fecha_alta, 4)` da `'19/0'`. El CRM mezcla dos formatos de fecha; los resolveremos más adelante.\n- El CP del cliente 9 es `'8031'`: el Excel se comió el cero de `'08031'` y `LEFT(cp, 2)` da `'80'`, una provincia que no existe. Hay **19** códigos así, todos de Barcelona. Lo arreglamos en la siguiente diligencia.",
      consejo: "Antes de trocear una columna por posición, mira unas cuantas filas **distintas**, no solo las primeras. Si el formato cambia, el corte te mentirá sin dar ningún error."
    },
    {
      tipo: "explicacion",
      titulo: "Cortar por un separador: POSITION y SPLIT_PART",
      texto: "Un email no tiene un largo fijo, pero siempre tiene una `@` en medio.\n- `POSITION('@' IN email)` dice en qué casilla está la `@`.\n- `SPLIT_PART(x, separador, n)` parte el texto por el separador y te da el trozo número `n`: con `'@'`, el 1 es el usuario y el 2 el dominio.\nComo los emails del CRM tienen mayúsculas y espacios, primero se limpian: `SPLIT_PART(LOWER(TRIM(email)), '@', 2)`. Fíjate en el cliente 260: con los espacios de delante, su `@` está una casilla más a la derecha.",
      ejemplo: `SELECT crm_id, email, POSITION('@' IN email) AS arroba,
  SPLIT_PART(LOWER(TRIM(email)), '@', 1) AS usuario,
  SPLIT_PART(LOWER(TRIM(email)), '@', 2) AS dominio
FROM crm_clientes
WHERE crm_id IN (2, 3, 260)
ORDER BY crm_id;`,
      otrosMotores: "SQL Server usa `CHARINDEX('@', email)` y `SUBSTRING(x, i, n)` (con comas); MySQL tiene `SUBSTRING_INDEX(email, '@', -1)`; en BigQuery, `SPLIT(email, '@')[OFFSET(1)]` (ahí se cuenta desde 0)."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT SPLIT_PART('ana@faro.example', '.', 2) AS trozo;`,
      pregunta: "¿Qué devuelve?",
      opciones: ["`'faro'`", "`'example'`", "`'ana@faro'`"],
      correcta: 1,
      explicacion: "El separador ahora es el punto, no la `@`. Partido por `'.'`, el texto queda en `'ana@faro'` y `'example'`: el trozo 2 es `'example'`. Si pidieras un trozo que no existe (el 3), `SPLIT_PART` devolvería `''`, y `POSITION` devuelve `0` cuando no encuentra lo que buscas: ninguno de los dos da error."
    },
    {
      tipo: "ejercicio",
      enunciado: "Para el usuario de acceso del sistema nuevo, Nuria necesita la parte del email que va **antes de la `@`**, ya limpia. Muestra `crm_id` y `usuario` de los clientes con `crm_id` del 1 al 5, ordenados por `crm_id`. Limpia el email con `LOWER(TRIM(email))` antes de trocearlo.",
      solucion: `SELECT crm_id, SPLIT_PART(LOWER(TRIM(email)), '@', 1) AS usuario
FROM crm_clientes
WHERE crm_id BETWEEN 1 AND 5
ORDER BY crm_id;`,
      pistas: [
        "Es el trozo número 1 al partir por `'@'`: `SPLIT_PART(…, '@', 1)`, y dentro, el email limpio.",
        "SELECT crm_id, SPLIT_PART(LOWER(TRIM(email)), '@', 1) AS usuario FROM crm_clientes WHERE crm_id BETWEEN 1 AND 5 ORDER BY crm_id;"
      ]
    },
    {
      tipo: "reto",
      de: "nuria",
      grafico: true,
      enunciado: "Quiero ver **cuántos clientes del CRM hay por dominio de correo**. Columnas `dominio` (`SPLIT_PART(LOWER(TRIM(email)), '@', 2)`) y `clientes` (cuántas filas), de más a menos clientes y, a igualdad, por `dominio` en orden alfabético.",
      inicial: "-- Escribe tu consulta aquí\n",
      comprobaciones: [
        { texto: "Tiene las columnas dominio y clientes", prueba: (r) => PRUEBA.columnas(r, ["dominio", "clientes"]) },
        { texto: "Ningún dominio sale repetido por mayúsculas o espacios", prueba: (r) => {
          const d = (r?.filas || []).map(f => f?.[0]).filter(v => v !== null && v !== undefined);
          return d.length > 0 && d.every(v => String(v) === String(v).trim().toLowerCase()) && new Set(d).size === d.length;
        } },
        { texto: "Entre todos suman los 332 clientes del CRM", prueba: (r) => (r?.filas || []).reduce((s, f) => s + Number(f?.[1] ?? 0), 0) === 332 },
        { texto: "Son las cifras por dominio, en el orden pedido", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT SPLIT_PART(LOWER(TRIM(email)), '@', 2) AS dominio, COUNT(*) AS clientes
FROM crm_clientes
GROUP BY SPLIT_PART(LOWER(TRIM(email)), '@', 2)
ORDER BY clientes DESC, dominio;`) }
      ],
      pistas: [
        "Agrupa por la misma expresión que pones en el `SELECT` y cuenta con `COUNT(*)`. Para el orden: `ORDER BY clientes DESC, dominio`.",
        "SELECT SPLIT_PART(LOWER(TRIM(email)), '@', 2) AS dominio, COUNT(*) AS clientes FROM crm_clientes GROUP BY SPLIT_PART(LOWER(TRIM(email)), '@', 2) ORDER BY clientes DESC, dominio;"
      ],
      solucion: `SELECT SPLIT_PART(LOWER(TRIM(email)), '@', 2) AS dominio, COUNT(*) AS clientes
FROM crm_clientes
GROUP BY SPLIT_PART(LOWER(TRIM(email)), '@', 2)
ORDER BY clientes DESC, dominio;`
    }
  ]
});
