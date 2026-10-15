# Revisión como alumno: etapas 0, 1 y 2 (28 diligencias)

**Revisor:** Sergio (alumno-novato, 34 años, administrativo, Excel a nivel usuario) · **Fecha:** 2026-10-15

## Resumen

1. **Recorrido:** las 28 diligencias (e0-01…e0-10, e1-01…e1-09, e2-01…e2-09) de principio a fin en Edge sin ventana, en modo prueba. Me paré a fondo en una de cada tres (e0-01, e0-04, e0-07, e1-01, e1-04, e1-07, e2-01, e2-04, e2-07) y en los tres casos. En las demás resolví ejercicios y retos con mi propio intento.
2. **Tiempo:** unas 1 h 15 min de sesión. Para un alumno real calculo 5–6 h. No hubo ningún error JS y no me quedé atascado en ningún sitio.
3. **Nota global: 8/10.** El revisor es tolerante con lo que es válido: alias que nadie pidió, `Productos` con mayúscula, `!=`, `ORDER BY precio` en lugar del alias, relaciones 1:1 y N:M escritas al revés, respuestas en minúsculas, `-1548,00`, `3:12`… Las historias enganchan y los mensajes de los retos son concretos.
4. **Lo más urgente:**
   - (a) El traductor de errores dice **«No existe ninguna columna llamada null»** en cuanto el nombre lleva espacio. Le pasa a la consulta inicial de e1-04 paso 7 y a `"en camino"` en e2-01. Con un email sin comillas dice «tabla null».
   - (b) En e2-02 paso 4 no se dice cómo está escrito `tarjeta`, justo después de enseñar que las ciudades van con mayúscula.
   - (c) El reto de e2-03 invita a mezclar AND y OR sin paréntesis, que es la trampa que se enseña en el nivel siguiente.
5. **Historia:** coherente y sin nombrar al culpable. Pero el Expediente de la etapa 2 («todos de Getafe») junto al «almacén de Getafe» que Héctor menciona en e1-08 apunta demasiado pronto hacia él.

Los pasos se numeran como en pantalla, empezando en 1.

---

## 🔴 Bloqueantes

Ninguno. El revisor no rechazó ninguna respuesta válida que probé ni aceptó ninguna incorrecta, y no hubo errores JS.

## 🟠 Confuso

### 1. Mensaje «No existe ninguna columna llamada null» (e1-04 paso 7, e2-01 paso 6)
- **Qué hice:**
  - En e1-04 «Arregla la consulta» pulsé Revisar con la consulta tal como viene: `SELECT nombre || " - " || departamento FROM empleados;`.
  - En e2-01 paso 6 escribí `WHERE estado = "en camino";`.
- **Qué esperaba:** algo como «No existe ninguna columna llamada « - »… los textos van entre comillas simples». Es lo que el propio consejo de Lucía anuncia en e2-01 («PostgreSQL busca una columna llamada Bilbao»).
- **Qué pasó:** **«✘ No existe ninguna columna llamada null.»** Con un nombre sin espacios sale bien (`"entregado"` → «columna llamada entregado»). En el reto de e2-01, `WHERE email = julia.martinez@mail.example;` sin comillas da **«No existe ninguna tabla llamada null. Mira los nombres en la pestaña Esquema.»**
- **Por qué importa:** son justo los errores que esas lecciones enseñan a reconocer. En e1-04 es lo **primero** que ve el alumno en ese paso, y «null» todavía no se ha explicado (llega en e2-08).
- **Propuesta:** que el traductor extraiga bien los nombres entre comillas que llevan espacios o símbolos. Si el nombre no se puede sacar, mejor un mensaje sin nombre. Además, cuando la «columna» inexistente venía entre comillas dobles, añadir: «¿Querías escribir un texto? Los textos van entre comillas simples». Para el email sin comillas: «Los textos (como un email) van entre comillas simples».

### 2. No se dice cómo está escrito `tarjeta` (e2-02 paso 4)
- **Qué hice:** `WHERE metodo_pago <> 'Tarjeta';`. En e2-01 me acababan de enseñar que «las ciudades están escritas con la primera letra en mayúscula».
- **Qué pasó:** «Te sobran 1652 filas: devuelves 2524 y deberían ser 872». Hasta este paso no he visto nunca los valores de `metodo_pago`. Lo saqué al segundo intento porque sospeché de la mayúscula.
- **Propuesta:** escribirlo como en e2-01 paso 6 («`en camino`, así, en minúsculas…»): «…que no se pagaron con `tarjeta` (así, en minúsculas)». Otra opción es dejar que el paso lo descubra ejecutando `SELECT DISTINCT metodo_pago FROM pedidos;`.

### 3. El reto de e2-03 cae en la trampa de AND/OR antes de enseñarla (e2-03 paso 10)
- **Qué hice:** «…que se cancelaron **o** reembolsaron» → `… AND fecha < '2025-07-01' AND estado = 'cancelado' OR estado = 'reembolsado' …`. Es lo natural: acabo de aprender OR.
- **Qué pasó:** 4 de 5 comprobaciones en verde. Solo falla «Son justo los pedidos online de junio de 2025 que acabaron mal», con el mensaje genérico «Aún no se cumple todo». Sin la pista 1 no sabría por qué. La prioridad AND/OR se explica en e2-04, y el ticket de e2-04 es literalmente este mismo error de Marcos.
- **Además:** es un salto de dificultad. Son cinco condiciones a la vez, con fechas y valores de `estado` que todavía no he visto escritos.
- **Propuesta:** redactarlo pidiendo «que **no** estén ni entregados ni en camino» y quitar el «o». Otra opción es dejar el OR como gancho, pero entonces conviene un mensaje específico cuando aparecen pedidos de otra tienda o de otras fechas: «Se te cuelan pedidos de otras tiendas/fechas: ¿has mezclado AND y OR?».

### 4. Diagrama: el mensaje habla de «tipo» cuando el fallo es la dirección (e0-07 paso 7)
- **Qué hice:** «Cada empleado trabaja en una sola tienda» → De **Empleado**, Tipo **1:N**, A **Tienda**. Lo mismo con Pedido–Tienda.
- **Qué pasó:** «✘ 2 relaciones tienen el tipo equivocado». Yo había elegido 1:N, que es correcto. Lo que estaba al revés era el orden. La regla «en De va el lado de uno» solo aparece en la pista 1, y en la mesa nada lo dice. Además, la explicación promete que «en la mesa verás 1 y N en lugar de dibujos», pero en la línea Cliente–Pedido de la foto no se ven.
- **Propuesta:** poner bajo el formulario «1:N = un **De** tiene muchos **A**». Si el par existe con el tipo invertido, decir «La relación X–Y está al revés: ¿en qué lado va la N?».

### 5. «Cuantitativo» se pregunta antes de explicarlo (e0-01 paso 4)
- La explicación del paso 2 habla de texto, número, fecha y sí/no. El quiz del paso 4 pregunta «¿Qué es un dato cuantitativo?» y el reto se basa en esa idea. Se adivina por la palabra, pero es un concepto usado antes de explicarlo.
- **Propuesta:** añadir una línea en el paso 2: «cuantitativo = se puede contar o medir; cualitativo = describe una cualidad».

## 🟡 Mejorable

- **Errata en los mensajes de «seleccionar»** (e0-02 paso 3, e0-03 paso 10…): «✘ **Tienes te falta** 1 por marcar.» (`js/papel.js:127`: «Tienes » + «te falta…»). Propuesta: «Te falta 1 por marcar.»
- **e1-04 paso 7 (con comillas simples bien, pero sin espacios, `'-'`):** «22 no coinciden… ¿la columna correcta? ¿el cálculo?». Se entiende, pero en concatenaciones podría añadir «¿espacios dentro de las comillas?».
- **e2-01 paso 7:** `"Sevilla"` → «No existe ninguna columna llamada Sevilla». El mensaje es correcto, pero un novato no entiende por qué habla de columnas. Mismo añadido que en el 🟠 1.
- **e1-05 paso 8 («¿Por qué?»):** que `AS` es opcional solo lo cuenta la pista 1. Quien lo arregla a la primera solo ve «¡Correcto!» y se queda sin saber el porqué. Propuesta: decirlo en la explicación de AS o en el mensaje de acierto.
- **e1-07 paso 4:** «de la que abrió más recientemente a la más antigua». La explicación de ORDER BY da ejemplos con números y letras, pero no con fechas. Fallé con ASC; el mensaje («no están en el orden que se pide») me salvó. Propuesta: en el paso 2, «con fechas, ASC = de la más antigua a la más reciente».
- **e2-08 paso 4:** `nota <> NULL` → «Te faltan 141 filas: devuelves 0». El ejercicio va antes de la explicación «Por qué = NULL no funciona». Un aviso específico («las comparaciones con NULL nunca dan verdadero: usa IS NOT NULL») vendría bien.
- **e2-08 paso 2:** «El **editor** muestra esas casillas como NULL». Las muestra el resultado, no el editor.
- **e1-01 paso 5 (predicción):** la respuesta (6 filas) estaba en pantalla en los dos pasos anteriores. No hace pensar.
- **e0-02 paso 3:** «Marca las columnas que no describen la venta, sino al cliente». Dudé con `cliente` (el nombre «dice quién compró»). El mensaje me empujó a marcarla. Se entiende, pero sería más claro añadir «(su nombre, teléfono, ciudad…)».
- **Presentaciones repetidas:** Marcos se presenta en e1-02 («Hola, soy Marcos, de atención al cliente») y otra vez igual en e2-01. Héctor, en e1-03 y otra vez en e1-08 («¡Hola! Soy Héctor, de logística»). Propuesta: en la segunda vez, «¡Otra vez yo!» o similar.
- **e2-03 paso 10 / e2-02:** son enunciados largos con mucha negrita y código en pocas líneas (ver la foto `tests/navegador/salida/alumno-e2-03-9.png`). Partirlos en viñetas (columnas · filtro · orden) ayudaría.

## 🕵️ Historia

- **Getafe apunta a Héctor demasiado pronto.** En e1-08 Héctor dice «estamos reorganizando el **almacén de Getafe**». El Expediente de e2-09 cierra con «9 clientes con email @correo-rapido.example, **todos de Getafe**…». Un alumno atento une las dos cosas en la etapa 2, cuando HISTORIA.md reserva señalar a Héctor para la 7 (y el almacén de Getafe para la 4). Propuesta: que el ticket de e1-08 no diga dónde está el almacén («el almacén central»), o que los clientes falsos sean de otra ciudad hasta la etapa 5.
- **El -12 aparece antes de buscarlo (e1-09 paso 2):** el ejemplo de comentarios ordena por nombre, y en la 5.ª fila sale «Auriculares Sonora Pulse **-12**». Le quita el «¡ajá!» a la parte 2 del caso. Propuesta: ordenar ese ejemplo de otra forma (por precio, o LIMIT 4).
- **Listas incoherentes en e0-04:** el quiz dice Audio = {Rosa, **Tomás**, Inés, **Andrés**} y Gaming = {Inés, **Andrés**, Carmen}, «las dos listas de 1998». En el reto, Tomás compró «consola y videojuego» (solo gaming) y Andrés «teléfono inalámbrico» (ninguno). Se puede leer como un ejemplo aparte, pero desconcierta. Propuesta: usar otros nombres en el quiz o hacer que coincidan.
- 💚 El resto encaja muy bien:
  - La prueba de acceso en 1998 (e0) lleva a «ya tienes acceso» (e1-01).
  - Ana pide en e1-05 quitar el `?column?` del informe que Elena le pasó en e1-04.
  - En e2-06, «del 1 al 15 de agosto el teléfono no paró de sonar», y en e2-09 el pedido de Iratxe es del 14 de agosto a las 03:12.
  - Los clientes sin teléfono de e2-08 reaparecen en el Expediente.
  - No se nombra a ningún sospechoso.

## 💚 Lo que funciona bien

- **El revisor acepta lo válido.** Ejemplos:
  - `SELECT * FROM Productos;`
  - alias que nadie pidió (`precio - 10 AS precio_rebajado`, `stock * precio AS valor`)
  - `ORDER BY precio DESC` en lugar de `ORDER BY precio_oferta DESC`
  - `!=` en lugar de `<>`; `socio` y `socio = TRUE`
  - en los diagramas, `Tarjeta 1:1 Cliente` y `Producto N:M Pedido` escritos al revés
  - respuestas «Decimal», «numeric», «valencia», «auriculares sonora pulse», «-1548,00», «3:12»
- **Mensajes buenos en los errores típicos:**
  - «No existe ninguna tabla llamada producto. ¿Querías decir productos?»
  - «…columna llamada teléfono. ¿Querías decir telefono?»
  - «Termina la consulta con punto y coma»
  - «PostgreSQL no esperaba FROM ahí… ¿sobra una coma?»
  - «Te faltan 115 filas: devuelves 0 y deberían ser 115» (con `'En camino'`)
- **Comprobaciones de reto concretas:** «Incluye los dos pedidos del día 15 (2216 y 2217)» al usar BETWEEN con fechas; «A igual precio, van por orden alfabético» al olvidar el desempate; «Incluye un comentario» en el caso 1.9.
- Las **predicciones con trampa** (`'madrid'`, `'producto%'`, `NOT IN (…, NULL)`, `BETWEEN '…15' AND '…15'`) enseñan más que cualquier párrafo.
- **Etapa 0:** las mesas (clasificar, Venn, diagrama) se entienden sin instrucciones, y el reto de e0-03 con el «no sé» de Lola es muy bueno.
- El tono de Lucía (consejos cortos, de oficio) y los recuadros 🌍 son útiles sin agobiar.

## Intentos y pistas en los pasos a fondo

| Nivel · paso | Intentos | Pistas | Nota |
|---|---|---|---|
| e0-01 · 3 clasificar | 2 | 0 | Puse el teléfono en Número; «1 ficha está en el grupo equivocado» |
| e0-01 · 5 reto | 1 | 0 | |
| e0-04 · 6–7 | 1 cada uno | 0 | |
| e0-07 · 7 diagrama | 2 | 0 | Dirección al revés → mensaje de «tipo» (🟠 4) |
| e0-07 · 8 reto | 1 | 0 | Con 1:1 y N:M escritos al revés: aceptado |
| e0-10 · 3 / 4 / 6 / 8 | 1 / 2 / 2 (quiz) / 1 | 0 | «Unidades» lo puse en Pedido; el quiz del precio lo fallé una vez |
| e1-01 · 4 ejercicio | 3 | 0 | Singular, sin `;`, mayúscula (aceptada) |
| e1-01 · 7 reto | 2 | 0 | |
| e1-04 · 6 / 7 / 9 | 1 / 3 / 1 | 0 | En el 7, el mensaje «null» (🟠 1) |
| e1-07 · 3 / 4 / 8 / 9 | 2 / 2 / 1 / 2 | 0 | |
| e1-09 · caso (3 partes) | 2 + 1 + 1 | 0 | La primera vez olvidé el comentario |
| e2-01 · 6 / 10 | 3 / 2 | 0 | Mensajes «null» (🟠 1) |
| e2-03 · 10 reto | 2 | 0 | Habría necesitado la pista 1 sin el ensayo previo (🟠 3) |
| e2-04 · 7 reto | 2 | 0 | Sin paréntesis → «faltan socios / sobran no socios»: claro |
| e2-07 · 3 / 8 | 2 / 2 | 0 | |
| e2-09 · ejercicio + caso (5 partes) | 2 + 1×5 | 0 | «Munoz» sin ñ → «te falta 1 fila» |

**Nota honesta:** al montar el arnés vi por accidente, en un `grep` del archivo, las relaciones solución del reto de e0-10. El resto de pasos los intenté leyendo solo lo que sale en pantalla.

Escenario usado: `tests/navegador/agentes/alumno-recorrido.mjs` (recorre diligencias con intentos predefinidos y guarda en JSON lo que ve el alumno y cada mensaje).
