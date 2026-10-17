# Formato de un nivel de SQLearning

Este documento es el **contrato** entre el motor de la web (`js/`) y el contenido (`lecciones/`).
Cualquier nivel nuevo debe cumplirlo al pie de la letra. La historia y sus reglas están en `docs/HISTORIA.md`.

## 1. Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Índice del curso (etapas y niveles) | `js/curso.js` → array `ETAPAS` |
| Contenido de cada nivel | `lecciones/<carpeta-de-la-etapa>/<archivo>.js` |
| Datos de cada etapa (tablas + filas) | `datos/faro-eN.sql`, generados por `herramientas/generar-datos.mjs` |
| Temario detallado (para humanos) | `docs/PLAN_CURSO.md` |

Carpetas: `0-archivo-de-papel` (opcional, sin SQL), `1-primer-dia`, `2-atencion-cliente`, `3-ventas`, `4-logistica`, `5-migracion`, `6-it`, `7-direccion`, `8-analitica`.

## 2. Índice en `js/curso.js`

```js
{ id: "e1-02", archivo: "e1-02-elegir-columnas.js", titulo: "Elegir columnas", listo: true }
```
- `id`: `e` + número de etapa + `-` + número de dos cifras. Correlativo, sin huecos.
- `listo: false` → el mapa lo muestra como «🚧 Próximamente». `true` solo cuando el archivo exista.
- El `titulo` del índice y el del nivel deben coincidir.

## 3. Archivo de nivel

**Script clásico** (nada de `import`/`export`):

```js
CURSO.registrar({
  id: "e1-02",
  titulo: "Elegir columnas",
  xp: 25,                                    // 20–60; casos 50–80
  objetivo: "Sabrás pedir solo las columnas que necesitas.",
  datos: "faro-e1",                          // opcional: por defecto, el de su etapa
  pasos: [ /* ver §4 */ ]
});
```

Todos los textos admiten **mini-markdown**: `**negrita**`, `` `código` `` y saltos de línea con `\n`.
`<` y `>` se escriben tal cual (el motor los escapa). El SQL de varias líneas va en template literals (`` ` ``),
con palabras clave en MAYÚSCULAS, nombres en minúsculas, indentado con 2 espacios y **terminado en `;`**.

## 4. Tipos de paso

### `historia` — el ticket que abre el nivel (normalmente el primer paso)
```js
{ tipo: "historia",
  de: "lucia",                                   // id de personaje (ver §6)
  asunto: "Tu primer encargo",
  texto: "Bienvenido/a a Faro. Necesito que me saques…" }
```
Corto (máx. ~80 palabras). Plantea el **problema de negocio**, no la sintaxis.

### `explicacion` — una idea, un ejemplo ejecutable
```js
{ tipo: "explicacion",
  titulo: "SELECT y FROM",                         // opcional
  texto: "Con **SELECT** dices qué columnas quieres y con **FROM** de qué tabla…",
  ejemplo: `SELECT nombre, precio\nFROM productos;`, // opcional: se muestra y se puede ejecutar
  consejo: "Escribe las palabras clave en mayúsculas: se lee mejor.",   // opcional: lo dice Lucía
  otrosMotores: "En SQL Server se escribe `SELECT TOP 5 …`." }          // opcional: recuadro 🌍
```

### `ejercicio` — escribir una consulta desde cero
El editor empieza **vacío** (o con `inicial`). El alumno pulsa **Revisar**; no avanza hasta resolverlo
(tras ver todas las pistas puede ver la solución).
```js
{ tipo: "ejercicio",
  enunciado: "Muestra el **nombre** y el **precio** de todos los productos.",
  solucion: `SELECT nombre, precio\nFROM productos;`,
  pistas: ["Empieza por SELECT y las dos columnas separadas por coma.", "SELECT nombre, precio FROM productos;"],
  inicial: "",                  // opcional
  orden: "auto",                // opcional: "auto" | true | false (ver revisión)
  nombres: true,                // opcional: false = no compara nombres de columna, solo posición
  verificar: null }             // solo DML/DDL: consulta que se compara tras ejecutar (ver abajo)
```
**Cómo se revisa** (se compara el **resultado**, no cómo está escrita la consulta):
- **Bien escrito antes que nada:** la consulta termina en `;` y es **una sola** sentencia (salvo `varias: true`).
  Si PostgreSQL da error, se muestra traducido y con la línea.
- **Columnas:** mismo número y, si `nombres` es `true`, mismos nombres (sin distinguir mayúsculas). Si el enunciado
  pide un alias, debe decirlo con exactitud (`valor_inventario`).
- **Filas:** las mismas, con la misma cantidad de repetidas. Números con tolerancia mínima (1e-6); textos exactos
  (son datos, no frases); `NULL` solo es igual a `NULL`; fechas comparadas como fecha.
- **Orden:** con `orden: "auto"` cuenta solo si la consulta solución tiene `ORDER BY` en su nivel principal.
  Si cuenta, el enunciado debe pedirlo explícitamente. Si el `ORDER BY` de la solución usa columnas del resultado
  (por nombre, alias o posición), las filas **empatadas** pueden salir en cualquier orden; si ordena por una
  expresión (`precio * stock`), se exige el orden exacto: entonces la solución debe desempatar del todo.
  Con `LIMIT`, que no haya empates justo en el corte (el alumno podría devolver otra fila igual de válida).
- **Textos y orden alfabético:** PostgreSQL ordena por código de carácter: «Óscar» va **después** de «Zoe».
  Si un nivel ordena nombres con tildes, explícalo (o evita depender de ello).
- **DML/DDL (`INSERT`, `UPDATE`, `CREATE`…):** todo se ejecuta en `BEGIN … ROLLBACK`. Tras la consulta del alumno
  y la de la solución se ejecuta `verificar` (p. ej. `SELECT * FROM clientes ORDER BY id;` o una consulta a
  `information_schema`) y se comparan esos resultados.
- Mensajes de fallo concretos: «te faltan 3 filas», «sobra la columna `stock`», «las filas no están en el orden pedido».

**Pestaña «Gráfico»** (desde la etapa 3): cualquier paso con SQL admite `grafico: true`; tras ejecutar con
éxito se abre la pestaña Gráfico en vez de Resultado. Cómo dibuja (`js/grafico.js`):
- La **primera columna** son las etiquetas; las columnas **numéricas** de detrás, los valores.
- Etiquetas tipo mes (`'2026-08'`) o fecha → **líneas** (en orden cronológico); si no → **barras** horizontales,
  en el orden en que salen las filas (el `ORDER BY` del alumno se ve en el gráfico).
- Tres columnas con la primera repetida (`mes, tienda_id, total`) → una **serie por valor** de la segunda (máx. 5).
- Varias medidas (`tienda_id, pedidos, facturacion`) → un **panel por medida**, cada uno con su escala.
- Si no se puede dibujar (una columna, etiquetas repetidas sin agrupar, más de 40 barras…), lo explica con un ejemplo.

Reglas para el enunciado:
- Debe decir **exactamente** qué columnas (y alias), qué filtro y qué orden: el alumno no puede adivinar.
- Pide solo lo que se acaba de explicar. Distinto del reto: el ejercicio practica **una** idea.

### `arreglar` — una consulta rota que hay que depurar
Igual que `ejercicio`, pero `inicial` trae la consulta con el fallo (error de sintaxis o lógica) y el enunciado
explica qué **debería** devolver. El `inicial` debe fallar la revisión.

**Trampas del paso** (`ejercicio` y `arreglar`, opcional): `trampas: [{ si: /regex/i, mensaje: "…" }]`. Si la consulta
falla y el código del alumno (sin comentarios ni textos) cumple `si`, se añade `mensaje` tras el fallo. Sirve para el
error que la lección acaba de explicar (división entera, contar eventos en vez de sesiones…).

**`desdeEjemplo: true`** (`ejercicio`, opcional, sin `inicial`): el editor empieza con el último `ejemplo` de la lección,
para los ejercicios que son «lo mismo que el ejemplo, pero…». El verificador comprueba que ese ejemplo no aprueba ya.

### `prediccion` — adivinar antes de ejecutar
```js
{ tipo: "prediccion",
  consulta: `SELECT DISTINCT categoria\nFROM productos;`,
  pregunta: "¿Cuántas filas devolverá?",
  opciones: ["5", "12", "40"],
  correcta: 0,
  explicacion: "Hay 40 productos, pero solo 5 categorías distintas." }
```
Tras responder, la consulta se ejecuta y se muestra el resultado real.

### `quiz` — una pregunta de opción única
```js
{ tipo: "quiz", pregunta: "…", opciones: ["…", "…", "…"], correcta: 1, explicacion: "…" }
```

### `interpretar` — responder una pregunta de negocio mirando datos
El alumno usa el editor libremente y escribe la **respuesta** (no la consulta).
```js
{ tipo: "interpretar",
  pregunta: "¿De qué proveedor es el producto más caro?",
  respuesta: "Sonora",            // texto (sin mayúsculas, tildes ni espacios de más) o número
  tolerancia: 0,                  // solo números
  pistas: ["…"],
  solucion: `SELECT proveedor\nFROM productos\nORDER BY precio DESC\nLIMIT 1;` }
```

### `reto` — el examen del nivel (**obligatorio, último paso, solo uno**; salvo en los casos)
```js
{ tipo: "reto",
  de: "elena",                                    // opcional: quién pide el reto
  enunciado: "Necesito los 5 productos con más stock: nombre y stock, de mayor a menor.",
  inicial: "-- Escribe tu consulta aquí\n",
  comprobaciones: [
    { texto: "Devuelve 5 filas",                prueba: (r) => r.filas.length === 5 },
    { texto: "Tiene las columnas nombre y stock", prueba: (r) => PRUEBA.columnas(r, ["nombre", "stock"]) },
    { texto: "Están ordenados de mayor a menor stock", prueba: (r) => PRUEBA.ordenado(r, "stock", "desc") }
  ],
  pistas: ["…", "…"],
  solucion: `SELECT nombre, stock\nFROM productos\nORDER BY stock DESC\nLIMIT 5;` }
```
- `prueba(r, db)`: `r` = `{ columnas: [nombres], filas: [[…]], tipos: [...] }` del alumno. `db.consulta(sql)`
  ejecuta otra consulta **en la misma transacción** (útil tras un `INSERT`). Puede ser `async`.
- Ayudantes `PRUEBA` (`js/pruebas.js`): `columnas(r, nombres)`, `ordenado(r, col, "asc"|"desc")`,
  `await igualA(r, db, "SELECT …;", { orden })` (mismo resultado que esa consulta), `valor(r, fila, col)`,
  `contiene(r, col, valor)`, `codigo()` (la consulta del alumno sin comentarios; usar con moderación).
- Entre 2 y 4 comprobaciones en frases de novato. El motor añade siempre al final «Tu consulta está bien escrita
  (termina en `;` y no da error)».
- La `solucion` debe pasar todas y el `inicial` fallar al menos una (lo verifica el test).
- **Bonus de eficiencia** (opcional): `bonus: { texto: "Hazlo sin subconsultas", prueba: (r, db, sql) => … , xp: 10 }`.

### `caso` — el reto final de una etapa (sustituye al `reto` en el último nivel)
Varias partes que se resuelven en orden; al terminar desbloquea una pista del Expediente.
```js
{ tipo: "caso",
  de: "lucia",
  enunciado: "El inventario no cuadra. Vamos a averiguar por qué.",
  partes: [
    { enunciado: "…", comprobaciones: [...], pistas: [...], solucion: `…` },
    { tipo: "interpretar", pregunta: "¿Qué producto tiene el stock imposible?", respuesta: "…", solucion: `…` }
  ],
  expediente: { id: "inventario-imposible", titulo: "El inventario imposible",
                texto: "El producto X tiene stock -12. Nadie sabe cómo." } }
```

### Pasos «sobre el papel» (Etapa 0, sin SQL; también se pueden usar en otras etapas)
En la Etapa 0 no hay editor: el espacio de trabajo es una mesa con fichas, tablas o un lienzo.
Cualquiera de estos pasos puede llevar `reto: true` (y `pistas`): entonces es el examen del nivel y da estrellas
como un `reto`. Cada nivel de la Etapa 0 termina en uno de ellos.

```js
// clasificar: arrastrar elementos a grupos (también vale para un Venn con grupos que se solapan)
{ tipo: "clasificar",
  enunciado: "Arrastra cada dato de la ficha a su tipo.",
  grupos: ["Texto", "Número", "Fecha", "Sí / No"],
  elementos: [ { texto: "Nombre: Rosa Prieto", grupo: "Texto" }, { texto: "Socia: sí", grupo: "Sí / No" } ],
  // Venn: grupo: ["Compró audio", "Compró gaming"] = va en la intersección; grupo: [] = fuera de todos
  venn: false }

// seleccionar: marcar filas o celdas de una tabla en pantalla que cumplen algo
{ tipo: "seleccionar",
  enunciado: "Marca las fichas de Madrid **Y** (compra en 1999 **O** gasto > 100 €).",
  tabla: { columnas: ["cliente", "ciudad", "año", "gasto"], filas: [["Rosa", "Madrid", 1999, 80], …] },
  modo: "filas",                 // "filas" | "celdas" | "columnas"
  correctas: [0, 3] }            // índices (en "celdas": [[fila, col], …])

// ordenar: poner en orden
{ tipo: "ordenar", enunciado: "…", elementos: ["Pregunta", "Datos", "Limpieza", "Análisis", "Comunicar"] }  // ya en orden correcto; el motor los baraja

// diagrama: construir un diagrama entidad-relación
{ tipo: "diagrama",
  enunciado: "Une las entidades y elige cuántos de cada lado.",
  entidades: [ { id: "cliente", nombre: "Cliente", atributos: ["id 🔑", "nombre", "ciudad"] }, { id: "pedido", … } ],
  relaciones: [ { de: "cliente", a: "pedido", tipo: "1:N" } ],  // solución; tipos: "1:1", "1:N", "N:M"
  fijas: [] }                    // relaciones que ya vienen dibujadas
```
Se revisa la respuesta completa y se dice qué está mal («2 datos están en el grupo equivocado», «falta una relación»,
«la relación Cliente–Pedido no es 1:1»), sin revelar cuáles hasta las pistas.

## 5. Bloques y créditos (lo calcula el motor)
El campo `xp` del nivel son los **créditos ◈** base (se mantiene el nombre del campo).
- ▰▰▰ 3 bloques verificados: reto superado sin pistas · ▰▰▱ 2: usando pistas · ▰▱▱ 1: viendo la solución.
- Créditos ganados = `xp` del nivel + 10 por bloque (+ bonus), solo la mejora respecto a intentos anteriores.
- Nunca se habla de «estrellas», «XP» ni «insignias» en los textos: créditos, bloques, credenciales, autorización.

## 6. Personajes (`de`)
`lucia` (Lucía Mora, datos), `marcos` (atención al cliente), `elena` (ventas), `hector` (logística),
`nuria` (migración), `ivan` (IT), `ana` (dirección). Ver `docs/HISTORIA.md`.
