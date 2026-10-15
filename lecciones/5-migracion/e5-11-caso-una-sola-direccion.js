CURSO.registrar({
  id: "e5-11",
  titulo: "Caso: Una sola dirección",
  xp: 75,
  objetivo: "Sabrás combinar todo lo aprendido para normalizar un texto escrito a mano, agrupar por esa clave limpia contando personas (no filas) y cruzarla con otra tabla para ver de quién es.",
  pasos: [
    {
      tipo: "historia",
      de: "nuria",
      asunto: "Nueve clientes que nadie recuerda",
      texto: "Último paso de la migración: las direcciones. Y hay algo que no me deja tranquila.\nLos **9 clientes `@correo-rapido.example`** de los pedidos fantasma también están en el CRM viejo. No tienen teléfono, nadie de tienda los recuerda… y todos viven en **Getafe**, con el mismo código postal.\nQuiero saber dónde viven exactamente. Con calma y sin acusar a nadie: solo datos."
    },
    {
      tipo: "explicacion",
      titulo: "Una dirección, mil escrituras",
      texto: "Las direcciones del CRM se escribieron a mano: «Calle X 12, 3ºB», «C/ X, 12», «c/x 12 - 3º b»… Para compararlas, construye una **clave de comparación** como hiciste con los emails, pero más a fondo:\n1. `lower(direccion)`: todo en minúsculas.\n2. `replace(…, 'c/', 'calle ')`: la abreviatura, escrita entera.\n3. `regexp_replace(…, '[^a-z0-9]', '', 'g')`: fuera todo lo que no sea letra o cifra (espacios, comas, `º`, guiones… y también las letras con tilde, que da igual).\nQueda algo feo pero comparable: `C/ Mayor 23, 1ºC` → `callemayor231c`.",
      ejemplo: `SELECT crm_id, direccion,
  regexp_replace(replace(lower(direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g') AS normalizada
FROM crm_clientes
ORDER BY crm_id
LIMIT 10;`,
      consejo: "Una clave de comparación es una herramienta para **encontrar** coincidencias, no para guardarla en el sistema: nadie quiere recibir una carta en `callemayor231c`. Compara con la clave y enseña la dirección original."
    },
    {
      tipo: "caso",
      de: "nuria",
      enunciado: "Vamos por partes: cómo están escritas sus direcciones, qué queda al normalizarlas, si alguien más vive así de acompañado y a quién pertenece esa dirección.",
      partes: [
        {
          enunciado: "Mira sus direcciones tal cual. Muestra `crm_id`, `direccion`, `cp` y `ciudad` (normalizada con `initcap(trim(ciudad))`) de los clientes del CRM cuyo email normalizado (`lower(trim(email))`) termina en `@correo-rapido.example`, ordenados por `crm_id`.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas crm_id, direccion, cp y ciudad", prueba: (r) => PRUEBA.columnas(r, ["crm_id", "direccion", "cp", "ciudad"]) },
            { texto: "Salen los 9 clientes de correo-rapido", prueba: (r) => (r?.filas?.length ?? 0) === 9 },
            { texto: "Con la ciudad normalizada, ordenados por crm_id", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT crm_id, direccion, cp, initcap(trim(ciudad)) AS ciudad
FROM crm_clientes
WHERE lower(trim(email)) LIKE '%@correo-rapido.example'
ORDER BY crm_id;`) }
          ],
          pistas: [
            "Un `SELECT` sobre `crm_clientes` con `initcap(trim(ciudad)) AS ciudad` y `WHERE lower(trim(email)) LIKE '%@correo-rapido.example'` (con el `%` delante).",
            "SELECT crm_id, direccion, cp, initcap(trim(ciudad)) AS ciudad FROM crm_clientes WHERE lower(trim(email)) LIKE '%@correo-rapido.example' ORDER BY crm_id;"
          ],
          solucion: `SELECT crm_id, direccion, cp, initcap(trim(ciudad)) AS ciudad
FROM crm_clientes
WHERE lower(trim(email)) LIKE '%@correo-rapido.example'
ORDER BY crm_id;`
        },
        {
          tipo: "interpretar",
          pregunta: "Todas en Getafe, CP 28901, y todas parecidas. Si solo quitas mayúsculas y espacios de los extremos (`lower(trim(direccion))`), ¿cuántas direcciones **distintas** hay entre esos 9 clientes?",
          respuesta: 9,
          tolerancia: 0,
          pistas: [
            "Cuenta con `COUNT(DISTINCT lower(trim(direccion)))` y el mismo `WHERE` de la parte anterior.",
            "SELECT COUNT(DISTINCT lower(trim(direccion))) FROM crm_clientes WHERE lower(trim(email)) LIKE '%@correo-rapido.example'; da 9: cada una está escrita de una forma."
          ],
          solucion: `SELECT COUNT(DISTINCT lower(trim(direccion))) AS distintas
FROM crm_clientes
WHERE lower(trim(email)) LIKE '%@correo-rapido.example';`
        },
        {
          enunciado: "Ahora normalízalas a fondo. Muestra `crm_id`, `direccion` y `normalizada` (con `regexp_replace(replace(lower(direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g')`) de esos mismos 9 clientes, ordenados por `crm_id`.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas crm_id, direccion y normalizada", prueba: (r) => PRUEBA.columnas(r, ["crm_id", "direccion", "normalizada"]) },
            { texto: "Salen los 9 clientes", prueba: (r) => (r?.filas?.length ?? 0) === 9 },
            { texto: "Cada dirección con su versión normalizada, ordenadas por crm_id", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT crm_id, direccion,
  regexp_replace(replace(lower(direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g') AS normalizada
FROM crm_clientes
WHERE lower(trim(email)) LIKE '%@correo-rapido.example'
ORDER BY crm_id;`) }
          ],
          pistas: [
            "La consulta de la parte 1, cambiando `cp` y `ciudad` por la expresión del ejemplo con el alias `normalizada`.",
            "SELECT crm_id, direccion, regexp_replace(replace(lower(direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g') AS normalizada FROM crm_clientes WHERE lower(trim(email)) LIKE '%@correo-rapido.example' ORDER BY crm_id;"
          ],
          solucion: `SELECT crm_id, direccion,
  regexp_replace(replace(lower(direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g') AS normalizada
FROM crm_clientes
WHERE lower(trim(email)) LIKE '%@correo-rapido.example'
ORDER BY crm_id;`
        },
        {
          tipo: "interpretar",
          pregunta: "Mira la columna `normalizada`. ¿Cuántas direcciones distintas quedan ahora entre los 9?",
          respuesta: 1,
          tolerancia: 0,
          pistas: [
            "Compara las 9 filas de `normalizada`, o cuéntalas con `COUNT(DISTINCT …)`.",
            "Las 9 dan calleolmo73b: queda 1 sola dirección."
          ],
          solucion: `SELECT COUNT(DISTINCT regexp_replace(replace(lower(direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g')) AS distintas
FROM crm_clientes
WHERE lower(trim(email)) LIKE '%@correo-rapido.example';`
        },
        {
          enunciado: "¿Es normal que varias personas compartan casa? Compruébalo en **todo** el CRM: agrupa por la dirección normalizada y muestra `direccion_normalizada` y `personas` (personas distintas: `COUNT(DISTINCT lower(trim(email)))`), de **más a menos** personas. Cuenta personas y no filas: los 20 duplicados harían que muchas direcciones parecieran compartidas.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas direccion_normalizada y personas", prueba: (r) => PRUEBA.columnas(r, ["direccion_normalizada", "personas"]) },
            { texto: "La primera fila es calleolmo73b, con 9 personas", prueba: (r) => PRUEBA.valor(r, 0, "direccion_normalizada") === "calleolmo73b" && PRUEBA.valor(r, 0, "personas") === 9 },
            { texto: "Cuenta personas distintas por dirección, de más a menos", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT regexp_replace(replace(lower(direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g') AS direccion_normalizada,
  COUNT(DISTINCT lower(trim(email))) AS personas
FROM crm_clientes
GROUP BY direccion_normalizada
ORDER BY personas DESC;`) }
          ],
          pistas: [
            "Sin `WHERE`: todo el CRM. Agrupa por el alias `direccion_normalizada` (no choca con ninguna columna) y ordena por `personas DESC`.",
            "SELECT regexp_replace(replace(lower(direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g') AS direccion_normalizada, COUNT(DISTINCT lower(trim(email))) AS personas FROM crm_clientes GROUP BY direccion_normalizada ORDER BY personas DESC;"
          ],
          solucion: `SELECT regexp_replace(replace(lower(direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g') AS direccion_normalizada,
  COUNT(DISTINCT lower(trim(email))) AS personas
FROM crm_clientes
GROUP BY direccion_normalizada
ORDER BY personas DESC;`
        },
        {
          tipo: "interpretar",
          pregunta: "Quitando la de Olmo, ¿cuántas personas comparten, **como máximo**, una misma dirección en el CRM?",
          respuesta: 2,
          tolerancia: 0,
          pistas: [
            "Mira la segunda fila de la parte anterior: está ordenada de más a menos.",
            "Después de calleolmo73b (9) vienen direcciones con 2 personas: parejas que viven juntas. La respuesta es 2."
          ],
          solucion: `SELECT COUNT(DISTINCT lower(trim(email))) AS personas
FROM crm_clientes
WHERE regexp_replace(replace(lower(direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g') <> 'calleolmo73b'
GROUP BY regexp_replace(replace(lower(direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g')
ORDER BY personas DESC
LIMIT 1;`
        },
        {
          enunciado: "Nueve personas en un piso, sin teléfono y que nadie recuerda. Nuria quiere comprobar algo más: las fichas de RR. HH. Une los 9 clientes de `correo-rapido` con `fichas_empleados` **por la dirección normalizada** (la misma expresión a los dos lados del `ON`) y con `empleados`. Muestra `crm_id`, `empleado` (el nombre del empleado), `departamento` y `direccion` (la de la ficha), ordenados por `crm_id`.",
          inicial: "",
          comprobaciones: [
            { texto: "Tiene las columnas crm_id, empleado, departamento y direccion", prueba: (r) => PRUEBA.columnas(r, ["crm_id", "empleado", "departamento", "direccion"]) },
            { texto: "Los 9 clientes encuentran pareja en las fichas", prueba: (r) => (r?.filas?.length ?? 0) === 9 },
            { texto: "Cada cliente con el empleado de esa dirección, ordenados por crm_id", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT c.crm_id, e.nombre AS empleado, e.departamento, f.direccion
FROM crm_clientes AS c
JOIN fichas_empleados AS f
  ON regexp_replace(replace(lower(f.direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g')
   = regexp_replace(replace(lower(c.direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g')
JOIN empleados AS e ON e.id = f.empleado_id
WHERE lower(trim(c.email)) LIKE '%@correo-rapido.example'
ORDER BY c.crm_id;`) }
          ],
          pistas: [
            "`FROM crm_clientes AS c JOIN fichas_empleados AS f ON (expresión con f.direccion) = (expresión con c.direccion)` y después `JOIN empleados AS e ON e.id = f.empleado_id`. El `WHERE` del email, como en la parte 1.",
            "SELECT c.crm_id, e.nombre AS empleado, e.departamento, f.direccion FROM crm_clientes AS c JOIN fichas_empleados AS f ON regexp_replace(replace(lower(f.direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g') = regexp_replace(replace(lower(c.direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g') JOIN empleados AS e ON e.id = f.empleado_id WHERE lower(trim(c.email)) LIKE '%@correo-rapido.example' ORDER BY c.crm_id;"
          ],
          solucion: `SELECT c.crm_id, e.nombre AS empleado, e.departamento, f.direccion
FROM crm_clientes AS c
JOIN fichas_empleados AS f
  ON regexp_replace(replace(lower(f.direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g')
   = regexp_replace(replace(lower(c.direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g')
JOIN empleados AS e ON e.id = f.empleado_id
WHERE lower(trim(c.email)) LIKE '%@correo-rapido.example'
ORDER BY c.crm_id;`
        },
        {
          tipo: "interpretar",
          pregunta: "Las 9 filas dicen lo mismo. ¿De **quién** es la dirección de los clientes falsos? Escribe su nombre y apellido.",
          respuesta: ["Iván Soler", "Ivan Soler", "Iván", "Soler", "Iván Soler (Sistemas)", "Iván Soler, de Sistemas", "Iván Soler de Sistemas", "Iván de Sistemas"],
          pistas: [
            "Mira la columna `empleado` de la parte anterior: es la misma en las 9 filas.",
            "Es la ficha del empleado 7, de Sistemas: escribe Iván Soler."
          ],
          solucion: `SELECT DISTINCT e.nombre
FROM crm_clientes AS c
JOIN fichas_empleados AS f
  ON regexp_replace(replace(lower(f.direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g')
   = regexp_replace(replace(lower(c.direccion), 'c/', 'calle '), '[^a-z0-9]', '', 'g')
JOIN empleados AS e ON e.id = f.empleado_id
WHERE lower(trim(c.email)) LIKE '%@correo-rapido.example';`
        }
      ],
      expediente: {
        id: "una-sola-direccion",
        titulo: "Una sola dirección",
        texto: "Los **9 clientes `@correo-rapido.example`** tienen la dirección escrita de **9 formas distintas** («Calle Olmo 7, 3ºB», «C/ Olmo, 7 3ºB», «c/olmo 7 - 3º B», «CALLE OLMO 7 3B»…). Normalizadas, son **una sola**: `calleolmo73b`, CP 28901, Getafe. En el resto del CRM, como mucho viven 2 personas juntas.\nEsa dirección está en las fichas de RR. HH.: es la de **Iván Soler**, administrador de Sistemas.\nNuria se ha quedado blanca: «Iván tiene acceso a todo». Lucía pide calma: «Una dirección no es una prueba. Nadie acusa a nadie hasta ver los registros de IT». ¿Por qué iba alguien a dar su propia casa a nueve clientes inventados?"
      }
    }
  ]
});
