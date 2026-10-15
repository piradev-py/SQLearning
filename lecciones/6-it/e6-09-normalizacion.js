CURSO.registrar({
  id: "e6-09",
  titulo: "Diseñar bien: normalización",
  xp: 40,
  objetivo: "Sabrás detectar la redundancia en una tabla mal diseñada, aplicar las reglas de normalización (1FN, 2FN y 3FN) en palabras sencillas, añadir columnas con ALTER TABLE y sacar un dato repetido a su propia tabla.",
  pasos: [
    {
      tipo: "historia",
      de: "nuria",
      asunto: "La hoja de ventas de Barcelona",
      texto: "La tienda de Barcelona quiere apuntar sus ventas en una tabla propia. Me han mandado su propuesta: `ventas_barcelona (pedido, fecha, cliente, ciudad_cliente, telefonos, productos, total)`.\nA primera vista parece cómoda: todo en una fila. Pero yo he visto cómo acaba eso: el CRM viejo era así. Antes de que Iván la cree, revisa el diseño conmigo."
    },
    {
      tipo: "explicacion",
      titulo: "Redundancia: el mismo dato en muchos sitios",
      texto: "Si cada venta guarda la `ciudad_cliente`, un cliente con 30 pedidos tiene su ciudad escrita **30 veces**. Eso es **redundancia**, y trae tres problemas (las **anomalías**):\n- **Al actualizar**: si se muda, hay que cambiar 30 filas; si se te escapa una, el cliente vive en dos ciudades.\n- **Al insertar**: no puedes apuntar un cliente nuevo hasta que compre.\n- **Al borrar**: si borras su único pedido, pierdes también su ciudad.\nFaro lo evita: la ciudad vive **solo** en `clientes` y el pedido guarda el `cliente_id`. Cuando la necesitas, haces un `JOIN`.",
      ejemplo: `SELECT p.id AS pedido, p.cliente_id, c.ciudad
FROM pedidos AS p
JOIN clientes AS c ON c.id = p.cliente_id
WHERE p.cliente_id = 1
ORDER BY p.id;`
    },
    {
      tipo: "seleccionar",
      enunciado: "Así quedaría la tabla de Barcelona con la ciudad repetida. **Rosa Prieto se ha mudado a Madrid.** Marca todas las filas que habría que cambiar para que los datos no se contradigan.",
      tabla: {
        columnas: ["pedido", "cliente", "ciudad_cliente", "total"],
        filas: [
          [101, "Rosa Prieto", "Barcelona", 80],
          [102, "Jon Molina", "Sabadell", 45],
          [103, "Rosa Prieto", "Barcelona", 120],
          [104, "Pau Serra", "Barcelona", 60],
          [105, "Rosa Prieto", "Barcelona", 35],
          [106, "Jon Molina", "Sabadell", 30]
        ]
      },
      modo: "filas",
      correctas: [0, 2, 4],
      pistas: [
        "Busca todas las filas de Rosa Prieto, no solo la primera.",
        "Son los pedidos 101, 103 y 105: tres cambios para un solo dato. Esa es la anomalía al actualizar."
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Primera forma normal (1FN): un valor por celda",
      texto: "La **normalización** son unas reglas para repartir los datos en tablas sin redundancia. Se cumplen por escalones llamados **formas normales**.\n**1FN**: en cada celda, **un solo valor**. Nada de `productos = 'Portátil Lumen 14, Ratón'` ni de `telefonos = '600…, 611…'`. Tampoco vale el truco `telefono1`, `telefono2`, `telefono3`: ¿y si hay un cuarto?\nLa solución es una fila por cada valor, en otra tabla. Es lo que hace `lineas_pedido`: un pedido con dos productos son **dos filas**, una por producto.",
      ejemplo: `SELECT pedido_id, producto_id, cantidad, precio_unitario
FROM lineas_pedido
WHERE pedido_id = 1
ORDER BY producto_id;`
    },
    {
      tipo: "explicacion",
      titulo: "2FN y 3FN: la clave, toda la clave y nada más que la clave",
      texto: "Las dos siguientes se resumen en una frase: cada columna debe depender **de la clave, de toda la clave y nada más que de la clave**.\n- **2FN** (toda la clave): en `lineas_pedido` la clave es `(pedido_id, producto_id)`. El nombre del producto depende solo de `producto_id`: no pinta ahí, va en `productos`.\n- **3FN** (nada más que la clave): en una venta, `ciudad_cliente` depende del **cliente**, no de la venta.\nMira `cuentas`: guarda el `empleado_id`, no el nombre ni el departamento. Cada dato está en **un solo sitio** y se junta con un `JOIN`.",
      ejemplo: `SELECT cu.usuario, cu.rol, e.nombre, e.departamento
FROM cuentas AS cu
JOIN empleados AS e ON e.id = cu.empleado_id
ORDER BY cu.id
LIMIT 5;`
    },
    {
      tipo: "clasificar",
      enunciado: "Revisa las columnas de `ventas_barcelona` (la clave es `pedido`). Coloca cada una según si está bien o qué regla rompe.",
      grupos: ["Bien: depende del pedido", "Rompe 1FN: varios valores en una celda", "Rompe 3FN: depende de otra cosa"],
      elementos: [
        { texto: "fecha", grupo: "Bien: depende del pedido" },
        { texto: "cliente_id", grupo: "Bien: depende del pedido" },
        { texto: "metodo_pago", grupo: "Bien: depende del pedido" },
        { texto: "productos: «Portátil Lumen 14, Ratón»", grupo: "Rompe 1FN: varios valores en una celda" },
        { texto: "telefonos: «600 111 222, 611 333 444»", grupo: "Rompe 1FN: varios valores en una celda" },
        { texto: "ciudad_cliente", grupo: "Rompe 3FN: depende de otra cosa" },
        { texto: "email_cliente", grupo: "Rompe 3FN: depende de otra cosa" }
      ],
      pistas: [
        "Para cada columna pregúntate: ¿cambia si cambia el pedido, o cambia si cambia el cliente? ¿Cabe en ella más de un valor?",
        "fecha, cliente_id y metodo_pago son del pedido. productos y telefonos meten varios valores en una celda. ciudad_cliente y email_cliente son del cliente."
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Añadir una columna: ALTER TABLE",
      texto: "Diseñar bien también es saber **dónde** poner un dato nuevo. Si depende solo de la tienda (su teléfono, por ejemplo), va en `tiendas`.\nPara añadir una columna a una tabla que ya existe: `ALTER TABLE tabla ADD COLUMN nombre tipo;`. Las filas que ya había la reciben vacía (`NULL`), o con su `DEFAULT` si le pones uno.\nEjecuta el ejemplo: `tiendas` tiene ahora una columna `telefono`, vacía en las 6 tiendas.",
      ejemplo: `ALTER TABLE tiendas ADD COLUMN telefono text;
SELECT *
FROM tiendas
ORDER BY id;`,
      consejo: "A veces se **desnormaliza a propósito**: en informes y almacenes de datos se repiten columnas (como `pedidos.mes` en la etapa 3) para no hacer diez `JOIN` en cada consulta. Es una decisión consciente, no un descuido: en la base del día a día, cada dato en un solo sitio."
    },
    {
      tipo: "ejercicio",
      enunciado: "RR. HH. quiere guardar la fecha en que cada empleado entró en Faro. Ese dato depende solo del empleado: añade a `empleados` la columna `incorporacion` de tipo `date`. Una sola orden.",
      solucion: `ALTER TABLE empleados ADD COLUMN incorporacion date;`,
      verificar: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'empleados' ORDER BY ordinal_position;`,
      pistas: [
        "`ALTER TABLE empleados ADD COLUMN …` seguido del nombre y el tipo.",
        "ALTER TABLE empleados ADD COLUMN incorporacion date;"
      ]
    },
    {
      tipo: "reto",
      de: "nuria",
      enunciado: "En el CRM, la ciudad está escrita a mano en cada cliente. Sácala a su propia tabla, en **una sola ejecución**:\n1. Crea `ciudades` con `id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY` y `nombre text NOT NULL UNIQUE`.\n2. Mete en ella las ciudades **distintas** del CRM, limpias con `initcap(trim(ciudad))`, sin `NULL` ni cadena vacía, en orden alfabético (con `INSERT … SELECT`).\n3. Termina con `SELECT * FROM ciudades ORDER BY id;`.",
      inicial: "-- CREATE TABLE, INSERT … SELECT y SELECT, en este orden\n",
      varias: true,
      comprobaciones: [
        { texto: "La tabla ciudades tiene id automático (identidad) como clave primaria y nombre único", prueba: async (r, db) => {
          const id = await db.consulta(`SELECT is_identity FROM information_schema.columns WHERE table_name = 'ciudades' AND column_name = 'id';`);
          const tipos = await db.consulta(`SELECT constraint_type FROM information_schema.table_constraints WHERE table_name = 'ciudades';`);
          const t = (tipos?.filas || []).map(f => f?.[0]);
          return id?.filas?.[0]?.[0] === "YES" && t.includes("PRIMARY KEY") && t.includes("UNIQUE");
        } },
        { texto: "Tiene las 9 ciudades del CRM, limpias y sin repetir (ni NULL ni vacías)", prueba: async (r, db) => {
          const c = await db.consulta(`SELECT COUNT(*), COUNT(DISTINCT nombre), COUNT(*) FILTER (WHERE nombre IS NULL OR nombre = '') FROM ciudades;`);
          const raras = await db.consulta(`SELECT COUNT(*) FROM ciudades AS ci LEFT JOIN crm_clientes AS crm ON initcap(trim(crm.ciudad)) = ci.nombre WHERE crm.crm_id IS NULL;`);
          const f = c?.filas?.[0] || [];
          return Number(f[0]) === 9 && Number(f[1]) === 9 && Number(f[2]) === 0 && Number(raras?.filas?.[0]?.[0] ?? -1) === 0;
        } },
        { texto: "Terminas mostrando id y nombre, ordenadas por id", prueba: (r) => PRUEBA.columnas(r, ["id", "nombre"]) && (r?.filas?.length ?? 0) === 9 && PRUEBA.ordenado(r, "id", "asc") }
      ],
      pistas: [
        "El `INSERT` no da el `id` (lo pone la identidad): `INSERT INTO ciudades (nombre) SELECT DISTINCT initcap(trim(ciudad)) FROM crm_clientes WHERE trim(ciudad) <> '' ORDER BY 1;`. El `<>` ya deja fuera los `NULL`.",
        "CREATE TABLE ciudades (id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY, nombre text NOT NULL UNIQUE); INSERT INTO ciudades (nombre) SELECT DISTINCT initcap(trim(ciudad)) FROM crm_clientes WHERE trim(ciudad) <> '' ORDER BY 1; SELECT * FROM ciudades ORDER BY id;"
      ],
      solucion: `CREATE TABLE ciudades (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL UNIQUE
);
INSERT INTO ciudades (nombre)
SELECT DISTINCT initcap(trim(ciudad))
FROM crm_clientes
WHERE trim(ciudad) <> ''
ORDER BY 1;
SELECT *
FROM ciudades
ORDER BY id;`
    }
  ]
});
