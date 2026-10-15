# Revisión como alumno: etapas 3 y 4 (19 diligencias)

**Revisor:** Sergio (alumno-novato, 34 años, administrativo, Excel a nivel usuario) · **Fecha:** 2026-10-15
**Punto de partida:** he hecho las etapas 0–2 (sé SELECT, WHERE y NULL). Nunca he agrupado ni unido tablas.

## Resumen

1. **Recorrido:** las 19 diligencias (e3-01…e3-09, e4-01…e4-10) de principio a fin, en Edge sin ventana y en modo prueba. Hice dos pasadas completas con mis intentos de novato (errores típicos primero, después la corrección). Luego hice una tercera pasada para probar respuestas válidas pero distintas a la solución, y una cuarta en tema día (e3-06, e3-08, e3-09, e4-08, e4-10). También miré la pestaña Gráfico en los dos temas.
2. **Tiempo:** unas 1 h 45 min de sesión. Para un alumno real calculo 6–8 h. No hubo ningún error JS y no necesité ninguna pista para avanzar. Sí hubo tres mensajes de error que, sin saber SQL de antes, me habrían dejado parado un buen rato (🟠 1).
3. **Nota global: 8/10.** GROUP BY con «montones», el orden lógico y LEFT JOIN con el Venn se entienden a la primera, y las predicciones con trampa son lo mejor del curso. Los dos casos enganchan y aceptan lo que escribe una persona normal («agosto de 2026», «cancelados», «Getafe», «#2210», «6,7 %»).
4. **Lo más urgente:**
   - (a) **Tres mensajes de JOIN que engañan:**
     - `envios.id` después de poner `AS e` → «Esa tabla no existe».
     - Pedir `e.cliente_id` → «No existe ninguna columna llamada cliente_id. ¿Querías decir cliente_id?».
     - JOIN sin ON → «Hay algo mal escrito cerca de ;».
   - (b) **Revisor:**
     - e4-01 rechaza una consulta válida con JOIN.
     - e3-08 da por bueno el top 5 **sin desempate**, que es lo que el nivel enseña.
     - En e3-05, si solo me equivoco en el orden, también sale en rojo «las sumas son las de cada tienda».
   - (c) **Historia y datos:**
     - El caso 4.10 termina en «lo firma todo el Almacén central». Antes, la app me ha enseñado tres veces que su responsable es Héctor Vidal.
     - Los 9 clientes falsos tienen **pedidos anteriores a su fecha de alta** (28 pedidos).
5. **Historia:** engancha, Elena y Héctor tienen voz propia y no se nombra a ningún sospechoso. Pero en la etapa 4 la pista de Héctor queda a un paso de distancia (ver 🕵️).

Los pasos se numeran como en pantalla, empezando en 1.

---

## 🔴 Bloqueantes

No hubo ningún bloqueo real: siempre pude avanzar y no hubo errores JS. Hay dos fallos del revisor que entran en la definición («rechaza una válida / acepta una incorrecta»):

### 1. e4-01 paso 11 (reto): rechaza la consulta con JOIN, que es válida
- **Qué hice:** `SELECT em.nombre FROM almacenes a JOIN empleados em ON em.id = a.responsable_id WHERE a.nombre = 'Almacén Levante';`
- **Qué esperaba:** que pasara. Devuelve a Óscar Medina, una fila y una columna.
- **Qué pasó:** «✘ Lo buscas en las tablas almacenes y empleados». ¡Sí que las uso! La comprobación exige literalmente el texto `FROM empleados` (`/\bfrom\s+empleados\b/`), y en mi consulta aparece `JOIN empleados`.
- **Por qué importa:** un novato no sabe JOIN en e4-01, pero quien repite el nivel después de e4-02 (para mejorar bloques) lo escribirá así. Además, el mensaje es falso.
- **Propuesta:** comprobar que aparece `empleados` en cualquier sitio (`/\bempleados\b/`), o aceptar también `JOIN empleados`.

### 2. e3-08 paso 8 (reto): el top 5 sin desempate pasa como correcto
- **Qué hice:** `… GROUP BY producto_id ORDER BY unidades DESC LIMIT 5;`. Se me olvidó el `, producto_id` que pide el enunciado («si empatan, primero el de producto_id más bajo»).
- **Qué esperaba:** que fallara «Los empatados salen por producto_id».
- **Qué pasó:** las cinco comprobaciones en verde y tres bloques. Por casualidad, PostgreSQL saca el 13 antes que el 32 (los dos tienen 142). Con `LIMIT 8` sale al revés: lo comprobé.
- **Por qué importa:** es justo lo que enseña el paso 7: «PostgreSQL no promete cuál sale antes». Me llevo los bloques sin haber aprendido la lección del nivel.
- **Propuesta:** comprobar con `PRUEBA.codigo()` que el `ORDER BY` tiene un segundo criterio. Si no, mensaje: «Hoy te ha salido bien por suerte: sin desempate, PostgreSQL puede cambiar el orden de los empatados».

## 🟠 Confuso

### 1. Mensajes de error de JOIN que no dicen qué cambiar
| Dónde | Lo que escribí (típico de novato) | Lo que dice | Lo que necesitaba oír |
|---|---|---|---|
| e4-02 paso 6 | `SELECT envios.id … FROM envios AS e …` | «Esa tabla no existe. Mira los nombres en la pestaña Esquema.» | «Has llamado `e` a envios: a partir de ahí, escribe `e.id`, no `envios.id`». La tabla existe y yo la veo en el Esquema, así que el mensaje me desconcierta del todo. PostgreSQL da aquí 42P01 *invalid reference to FROM-clause entry*, con la pista del alias. |
| e4-05 paso 4 | `JOIN clientes c ON e.cliente_id = c.id` | «No existe ninguna columna llamada cliente_id. **¿Querías decir cliente_id?**» | «`envios` no tiene `cliente_id`; está en `pedidos`. Pasa por la tabla puente». La sugerencia me propone lo mismo que he escrito. |
| e4-02 paso 4 | `FROM empleados JOIN tiendas;` (sin ON) | «Hay algo mal escrito cerca de ;. Revisa comas, comillas…» | «A este JOIN le falta el ON: ¿cómo se emparejan las filas?». El paso 7 promete que «si te olvidas del ON, eso sí da error», pero el error no lo dice. |

### 2. Dos errores de HAVING que no explican lo que acaban de enseñar (e3-07)
- **Paso 5**, con `HAVING unidades > 130`: «No existe ninguna columna llamada unidades.» Y yo la veo en mi SELECT. Es justo el error del ticket de e3-08. Propuesta: si el nombre es un alias del propio SELECT, decir «`unidades` es un alias del SELECT y todavía no existe en el HAVING: repite `SUM(cantidad)`».
- **Paso 8**, con `GROUP BY cliente_id WHERE COUNT(*) > 20` (el WHERE movido detrás): «PostgreSQL no esperaba WHERE ahí. Mira justo antes: ¿sobra una coma o falta una columna?». No sobra ninguna coma. Propuesta: si aparece WHERE después de GROUP BY, «WHERE va antes de GROUP BY; para filtrar grupos, usa HAVING».

### 3. e3-05 paso 9 (reto): un fallo de orden pinta en rojo también las sumas
- **Qué hice:** `ORDER BY facturacion` (me olvidé del `DESC`).
- **Qué pasó:**
  - ✘ «Está ordenado de mayor a menor facturación», que es correcto.
  - ✘ «Los recuentos y las sumas son los de cada tienda», que no lo es: mis sumas estaban bien.
- **Por qué importa:** me habría puesto a revisar el SUM, que estaba bien. La comprobación usa `igualA` contra una consulta con `ORDER BY` y por eso también exige el orden.
- **Propuesta:** `PRUEBA.igualA(r, db, …, { orden: false })` en la comprobación de valores; el orden ya se mira aparte.

### 4. Respuestas escritas: «260 clientes» y «el pedido 2210» se rechazan como si fueran falsas
- **e3-01 paso 9:** «260 clientes» → «✘ No es eso. Vuelve a mirar los datos.» Con «260», ✔.
- **e4-10 parte 5:** «el pedido 2210» → mismo mensaje. Con «2210» o «#2210», ✔.
- En cambio, «406,23 €», «6,7 %» y «pedido 2210» sí se aceptan. El número era correcto y el mensaje me dice que mire los datos otra vez, como si me hubiera equivocado.
- **Propuesta:** quitar también palabras sueltas alrededor del número («el», «clientes», «pedido(s)»…). Si queda un número correcto mezclado con texto, decir «Escribe solo el número».

### 5. e3-08 paso 6: «100.000» con punto de miles
- **Qué hice:** `HAVING SUM(total) > 100.000`, como lo escribo en Excel.
- **Qué pasó:** «Te sobran 3 filas: devuelves 5 y deberían ser 2». Tardé en darme cuenta. Es un error muy de aquí: en SQL, `100.000` es 100.
- **Propuesta:** si el SQL contiene un número tipo `\d{1,3}\.\d{3}`, avisar: «En SQL el punto es decimal: 100.000 es cien. Escribe 100000».

### 6. Comprobaciones que no distinguen `>` de `>=` (e3-07 reto) ni detectan un ORDER BY olvidado (e3-09 parte 1)
- **e3-07:** `HAVING COUNT(*) >= 15` pasa «Encuentra a los 47 clientes con **más de** 15 pedidos», porque ningún cliente tiene exactamente 15. En el ejercicio del paso 5 sí hay un producto con 130 unidades justas, que es lo que hace falta para notar la diferencia. Propuesta: que algún cliente tenga exactamente 15 pedidos.
- **e3-09 parte 1:** sin `ORDER BY tienda_id` sale ✔ «… ordenados por tienda», porque el GROUP BY los da ya en ese orden por casualidad. Es menos grave, pero se aprende un mal hábito.

## 🟡 Mejorable

### Mensajes de error
- **`= NULL` tras un LEFT JOIN (e4-04 paso 3):** «Te faltan 6 filas: devuelves 0». Es el mismo caso que en la etapa 2. Un aviso específico («con NULL usa IS NULL») vendría bien justo aquí, en el patrón estrella de la etapa.
- **CROSS JOIN con ON (e4-08 paso 4):** «Hay algo mal escrito cerca de ON». Propuesta: «CROSS JOIN no lleva ON: junta todas con todas».
- **ORDER BY en mitad de un INTERSECT (e4-09 paso 7):** «Hay algo mal escrito cerca de INTERSECT». El paso 4 lo explica, pero el mensaje podría recordarlo: «un solo ORDER BY, al final».
- **e4-08 reto:** con `GROUP BY al.nombre, t.nombre … ORDER BY al.id` sale «La columna al.id tiene que ir en el GROUP BY…». Es correcto, pero yo no tengo `al.id` en el SELECT y no entendía de dónde salía. Añadir «(la usas en el ORDER BY)».
- **e4-07 paso 7:** sin alias, «Usas el mismo alias empleados dos veces». Se entiende, pero la explicación del paso 3 prometía el 42712 con «table name specified more than once». Mejor así: «Dale un alias distinto a cada copia (em, j)».

### Textos y erratas
- **e4-10 parte 8:** «Los 6 envíos **están devuelto**» → «están en estado `devuelto`» o «están devueltos».
- **e4-06 paso 8:** «facturacion (**lo vendido**)». Lo resolví, pero «lo vendido» es vago justo en el paso donde la trampa es qué sumar. Propuesta: «(el importe de sus líneas)».
- **e3-05 paso 5 (predicción):** el enunciado enumera «tarjeta, bizum, efectivo o transferencia». La respuesta (4) está en la pregunta y no hace pensar.
- **e3-03 paso 7:** la comprobación «El pedido más barato es de 12,90 € y el más caro de 4 404 €» se ve **antes** de escribir nada y da las cifras. Aquí no pasa nada porque el paso 3 ya se ha respondido, pero conviene vigilarlo en otros retos.
- **Café repetido:** el «Te he dejado un café en la mesa» de Héctor sale casi igual en e4-01 y e4-06. Si es para el «demasiado servicial», funciona; si no, cambiar la frase.

### Pestaña «Gráfico»
- Se entiende a la primera: e3-05 paso 3 explica la regla (primera columna = etiquetas) y se abre sola al ejecutar.
- **En los retos, el cuadro «Diligencia superada» tapa el gráfico** justo cuando el enunciado dice «mira el gráfico» (fotos `alumno34-e3-05-8-tras.png` y `alumno34-e4-06-8-tras.png`). El segundo panel («facturacion por tienda_id») queda debajo y hay que hacer scroll para verlo. Propuesta: dejar ver el gráfico antes del cuadro final, o que el cuadro no lo cubra.
- **e3-09 parte 5, línea por mes:** los meses sin reembolsos no salen y el eje los junta (2024-03, 2024-07, 2024-10… a la misma distancia). La línea parece plana en 1 durante 2024, cuando en realidad hubo meses con 0. El enunciado lo avisa, y eso está bien. Aun así, en un gráfico de comité engaña un poco.
- **Varias líneas (e3-06 reto):** con la noche, las líneas de las tiendas 2 y 4 (rosa y morado oscuros) casi no se distinguen sobre el fondo. Con el día, el pastel es suave pero se lee. La leyenda dice «tienda_id 1…5»: se entiende, pero con nombres sería mejor.

### Temas
- **Día (pastel):** se lee bien, sin cansar (fotos `alumno34-*-light.png`, `alumno-e3-08-2.png`). Las tablas de resultados y el código se leen perfectamente.
- **Noche:** también bien. Solo el contraste bajo de algunas líneas del gráfico, ya comentado.

## 🕵️ Historia

- **El Almacén central apunta a Héctor ya en la etapa 4.**
  - El caso 4.10 termina con la pregunta «¿Qué almacén los firma todos?» → **Almacén central** (Getafe). El Expediente lo remata: «los firma todos el Almacén central (Getafe)».
  - Antes del caso, la app me ha enseñado **tres veces** la pareja «Almacén central — Héctor Vidal»: la predicción de e4-02 paso 8, el reto de e4-03 y la predicción de e4-05 paso 7.
  - El ticket del caso añade: «Héctor, **tan majo como siempre**, ya te ha dado acceso a todas sus tablas».
  - Cualquier alumno atento sale de la etapa 4 sospechando de Héctor, y HISTORIA.md reserva señalarlo para la 7. No se le nombra, pero está a un paso.
  - **Propuesta:** que el responsable del Almacén central sea otra persona del equipo de Héctor (un jefe de muelle con `jefe_id` = Héctor). Así la pista llegaría a él solo con el self join o en la etapa 7. Otra opción es no usar el Almacén central en los ejemplos de «responsable».
- **Pedidos anteriores al alta de su cliente.**
  - Los 9 clientes @correo-rapido.example tienen pedidos **antes de su fecha de alta**: 28 pedidos en total (más 2 de clientes normales).
  - Por ejemplo, Sara Ortiz: alta el 18-07-2026, primer pedido el 31-03-2026. Alba Marín: alta el 07-04-2026, primer pedido el 05-03-2026, que es justo «el 5 de marzo» con el que arranca el Expediente 4.
  - El Expediente 3 dice «Los clientes de Getafe empezaron a darse de alta **justo en marzo**», pero la primera alta es del 24 de marzo y su primer pedido reembolsado es del día 5.
  - Si es una pista a propósito para más adelante, no está en HISTORIA.md. Si no lo es, es un fallo de datos que un alumno de la etapa 5 o 7 (fechas) va a encontrar.
  - **Propuesta:** en `herramientas/generar-datos.mjs`, generar los pedidos después del alta (o el alta antes del primer pedido).
- 💚 **Cifras de los Expedientes revisadas y correctas:**
  - Expediente 3: 2,0 % (20/997), 6,7 % (103/1 527), máximo en agosto con 19.
  - Expediente 4: 190 = 127 + 63, 31 380,20 €, 10 clientes, 62 + 1 pedidos, del 5 de marzo al 25 de septiembre, todos entre las 2 y las 4 de la madrugada, 6 envíos sin entrega.
  - Datos de las lecciones: los 9 245,80 € de e4-06; las 429/187/225/156/1 527 de las tiendas; el 2210 de Iratxe del 14 de agosto a las 03:12, que encaja con la etapa 2.
- 💚 **Las dos historias se encadenan bien:**
  - En el caso 3.9, Elena cree que «es cosa de todas las tiendas» y los números la desmienten.
  - El caso 4.10 arranca con «el comité ha visto tu gráfico de reembolsos».
  - El Zaragoza «recién abierto» y la Logística Delta «nueva» justifican los ceros de forma natural.

## 💚 Lo que funciona bien

- **Explicaciones:**
  - Los «montones de fichas» hacen que GROUP BY, la regla de oro (42803) y WHERE frente a HAVING se entiendan sin esfuerzo.
  - El orden lógico con los números en comentarios (e3-08) aclara de golpe por qué el alias vale en ORDER BY y no en HAVING.
  - El Venn de la etapa 0 para INNER/LEFT/FULL y para UNION/INTERSECT/EXCEPT es un acierto.
  - El BUSCARV de Héctor como punto de partida del JOIN es perfecto para alguien que viene de Excel.
- **Predicciones con trampa** que enseñan más que un párrafo:
  - COUNT de nada = 0 y SUM de nada = NULL.
  - La combinación tienda 5 + efectivo no aparece.
  - El WHERE que convierte el LEFT en INNER (Zaragoza desaparece).
  - LEFT seguido de INNER que vuelve a perder filas.
  - El COUNT(*) que da 1 a Zaragoza.
  - Las 4 022 filas al unir 1:N.
  - El self join que pierde a Ana.
  - En todas caí como novato y la explicación de después me lo aclaró.
- **El revisor acepta lo válido:**
  - `COUNT(*) pedidos_online` sin AS, `COUNT(id)`, `COUNT(DISTINCT(cliente_id))`.
  - `ORDER BY SUM(total) DESC` en lugar del alias; `GROUP BY tienda_id, mes` (al revés); `GROUP BY 1, 2`.
  - `GROUP BY al.id` solo (PostgreSQL lo permite) y `ROUND(SUM(total), 2)`.
  - RIGHT JOIN en lugar de LEFT; la sintaxis antigua `FROM tiendas, transportistas`.
  - El self join arreglado cambiando los alias del SELECT en vez del ON.
  - El reto de EXCEPT resuelto con un anti-join LEFT JOIN … IS NULL; ir de pedidos a productos pasando por pedidos.
  - `select … as Total_Clientes` en minúsculas y mayúsculas mezcladas.
- **Respuestas escritas tolerantes:**
  - Números: «4.404», «406,23 €», «6,7 %», «6,74», «2,0», «2», «#2210», «2.210».
  - Meses: «agosto de 2026», «2026/08».
  - Textos: «cancelados», «almacen norte», «Norte», «Getafe», «el central».
  - Y rechaza bien «7» (en lugar de 6,7) y «08-2026».
- **Buenos mensajes:**
  - 42803 («La columna pedidos.estado tiene que ir en el GROUP BY…»).
  - 42702 («El nombre estado está en varias tablas: escribe delante de qué tabla es»).
  - «Has escrito "bizum" entre comillas dobles… Los textos van entre comillas simples», ya arreglado respecto a la revisión anterior.
  - «Las columnas están bien, pero en otro orden. Deben salir así: almacen_id, transportista_id».
  - «No existe ninguna tabla llamada almacen. ¿Querías decir almacenes?».
  - «Sobra la columna apertura» en el UNION.
- **Comprobaciones de reto concretas:**
  - «Salen los 4 transportistas, Logística Delta con 0 envíos», «Los envíos suman 1 337».
  - «Ana Beltrán aparece, con el jefe vacío», «Las 4 casillas de Zaragoza y las 5 de Logística Delta están a 0».
  - Con COUNT(*) tras un LEFT JOIN o con INNER en lugar de LEFT, sé exactamente qué falla.
- **Los casos:** cada parte pide una sola cosa, los enunciados dicen columnas, alias y orden, y las cifras de control («190», «suman 190», «6 envíos») me dejan comprobar que voy bien. El cierre con preguntas («¿Cómo se devuelve un paquete que nunca llegó?») deja ganas de seguir.

## Intentos y pistas

| Nivel · paso | Intentos | Pistas | Nota |
|---|---|---|---|
| e3-01 · 3 / 6 / 9 / 10 | 3 / 2 / 2 / 1 | 0 | Sin alias, sin `;`, comillas dobles; «260 clientes» rechazado (🟠 4) |
| e3-02 · 4 / 9 | 2 / 2 | 0 | `'Entregado'` con mayúscula → dos comprobaciones en rojo, se entiende |
| e3-03 · 3 / 4 / 7 | 1 / 2 / 1 | 0 | Coma olvidada entre MIN y MAX → «algo mal escrito cerca de MAX»: vale |
| e3-04 · 4 / 7 / 8 | 2 / 1 / 1 | 0 | `DISTINCT COUNT(…)` → «1 no coincide»: se entiende con la explicación |
| e3-05 · 4 / 8 / 9 | 2 / 2 / 2 | 0 | Sin GROUP BY → 42803 claro; en el reto, el rojo de más (🟠 3) |
| e3-06 · 3 / 8 | 2 / 2 | 0 | Olvido del ORDER BY y de tienda_id en el GROUP BY: mensajes claros |
| e3-07 · 5 / 8 / 9 | 2 / 2 / 1 | 0 | Alias en HAVING y WHERE detrás de GROUP BY (🟠 2); `>=` aceptado (🟠 6) |
| e3-08 · 3 / 6 / 8 | 2 / 2 / 1 | 0 | `100.000` (🟠 5); top sin desempate aceptado (🔴 2) |
| e3-09 · caso (6 partes) | 1+1+1+1+1+1 | 0 | Sin ORDER BY en la parte 1, aceptado (🟠 6) |
| e4-01 · 9 / 10 / 11 | 2 / 2 / 2 | 0 | Columnas en otro orden y tabla en singular: mensajes muy buenos; JOIN rechazado (🔴 1) |
| e4-02 · 4 / 6 / 9 | 2 / 3 / 2 | 0 | JOIN sin ON y `envios.id` con alias (🟠 1) |
| e4-03 · 4 / 9 / 10 | 2 / 1 / 2 | 0 | LEFT al revés → «te falta 1 fila»; INNER → rojo claro |
| e4-04 · 3 / 7 / 10 / 11 | 2 / 1 / 2 / 2 | 0 | `= NULL`; `e.entrega IS NULL` → rojo claro |
| e4-05 · 4 / 6 / 8 | 2 / 1 / 2 | 0 | `e.cliente_id` (🟠 1); `estado` ambiguo → 42702 claro |
| e4-06 · 5 / 8 / 9 | 1 / 2 / 2 | 0 | `SUM(DISTINCT p.total)` rechazado (bien); COUNT(*) tras LEFT → rojo claro |
| e4-07 · 5 / 7 / 8 | 1 / 2 / 2 | 0 | Sin alias → «mismo alias dos veces» |
| e4-08 · 4 / 8 | 2 / 2 | 0 | CROSS JOIN con ON; COUNT(*) en la plantilla |
| e4-09 · 5 / 7 / 9 | 2 / 3 / 1 | 0 | ORDER BY en medio; reto con anti-join aceptado |
| e4-10 · caso (8 partes) | 1+1+2+2+2+1+2+2 | 0 | `estado` ambiguo, LIKE sin `%`, «el pedido 2210» (🟠 4) |

Predicciones: fallé a propósito la respuesta «de novato» en unas 12 y, en todas, la explicación posterior me aclaró la trampa.

**Nota honesta:**
- Para responder a las preguntas de negocio ejecuté mis propias consultas (como haría en el editor) con un escenario auxiliar.
- Después de los intentos, leí el código de tres comprobaciones (e4-01, e3-05 y e3-08) para confirmar la causa de los fallos 🔴 1, 🔴 2 y 🟠 3, y `REVISOR.respuestaCorrecta` para entender las respuestas escritas.
- No leí ninguna solución antes de intentar un paso.

**Escenarios** (en `tests/navegador/agentes/`):
- `alumno34-recorrido.mjs`: copia de `alumno-recorrido.mjs` que añade fotos tras los intentos y el tema día. Configuraciones: `alumno34-cfg-e3.json`, `alumno34-cfg-e4.json`, `alumno34-cfg-alternativas.json` y `alumno34-cfg-dia.json`.
- `alumno34-consultas.mjs`: ejecuta en una diligencia las consultas que haría yo en el editor.
- `alumno34-esquema.mjs`: lee la pestaña Esquema.

Fotos en `tests/navegador/salida/alumno34-*.png`.
